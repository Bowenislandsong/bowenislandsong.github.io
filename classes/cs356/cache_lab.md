# Cache LAB

This document is a hands-on tutorial to write a working set-associative cache simulator with optional multi-core coherence. It includes concrete C snippets for the core data structures and functions.
What you’ll build:

- A configurable cache with S sets, K ways (associativity), and block size B.
- Replacement policy: FIFO or LRU.
- A single entry point `cache_access(system, core, addr, is_write)` that updates state and logs events.
- Optional multi-core coherence approximating MSI (counts remote invalidations and writebacks).

Assumptions:

- S and B are powers of two. C cores share the same geometry (S, K, B).
- We work with 64-bit addresses.

## 1) Define enums and structs

Copy and adapt these as your starting point. Every important line has a short comment explaining why it matters.

```c
#include <stdint.h>    // fixed-width integers like uint64_t
#include <stdbool.h>   // bool type

// Replacement policy selector; simple and explicit
typedef enum { POLICY_FIFO = 0, POLICY_LRU = 1 } CachePolicy;

// MSI-like coherence states for bookkeeping only
typedef enum { LINE_I = 0, LINE_S = 1, LINE_M = 2 } LineState;

// A single cache line (one block's worth of metadata)
typedef struct {
  bool      valid;      // line contains a meaningful block
  LineState state;      // I/S/M state for coherence counts
  uint64_t  tag;        // block tag used for match in a set
  uint64_t  last_used;  // LRU timestamp (monotonic)
  uint64_t  load_seq;   // FIFO timestamp (monotonic)
} CacheLine;

// One set = K associative ways
typedef struct {
  CacheLine* lines;     // dynamically allocated array of K lines
  int        next_victim; // optional helper you can ignore
} CacheSet;

// All sets for a given core
typedef struct {
  CacheSet* sets;       // dynamically allocated array of S sets
} CoreCache;

// The whole cache system with C cores
typedef struct {
  // geometry
  int S;                // number of sets per core (power of 2)
  int K;                // associativity (ways per set)
  int B;                // block size in bytes (power of 2)
  int C;                // number of cores
  CachePolicy policy;   // FIFO or LRU

  // derived bit widths for address decode
  int offset_bits;      // log2(B)
  int index_bits;       // log2(S) or 0 when S==1

  // global monotonic counters for replacement metadata
  uint64_t access_seq;  // increases on every hit or install
  uint64_t insert_seq;  // increases on every install

  // per-core caches
  CoreCache* cores;     // dynamically allocated array of C cores
} CacheSystem;
```

Minimal stats you can track locally (customize as you like):

```c
typedef struct {
  uint64_t hits, misses, evictions;
  uint64_t remote_invals, remote_wbs;
} CacheStats;
```

## 2) Address helpers

We decode an address into index and tag using bit math.

$$\text{offset\_bits} = \log_2(B),\quad \text{index\_bits} = \log_2(S)$$
$$\text{index} = (addr >> \text{offset\_bits}) \& ((1ULL << \text{index\_bits}) - 1)$$
$$\text{tag} = addr >> (\text{offset\_bits} + \text{index\_bits})$$

```c
// Compute integer log2 for powers of two; simple loop is portable and fine here
static inline int ilog2u(uint64_t x) {
  int r = 0; while ((1ULL << r) < x) r++; return r;
}

// Extract the set index bits from an address
static inline uint64_t get_index(const CacheSystem* cs, uint64_t addr) {
  if (cs->index_bits == 0) return 0; // fully-associative: single set
  return (addr >> cs->offset_bits) & ((1ULL << cs->index_bits) - 1ULL);
}

// Extract the tag bits from an address (everything above index+offset)
static inline uint64_t get_tag(const CacheSystem* cs, uint64_t addr) {
  return addr >> (cs->offset_bits + cs->index_bits);
}
```

## 3) Allocation and initialization

Allocate C cores × S sets × K lines and initialize metadata.

```c
#include <stdlib.h>
#include <string.h>

// Allocate the full C x S x K structure and initialize metadata
CacheSystem* cache_allocate(int C, int S, int K, int B, CachePolicy policy) {
  CacheSystem* cs = (CacheSystem*)calloc(1, sizeof(CacheSystem));
  cs->C = C; cs->S = S; cs->K = K; cs->B = B; cs->policy = policy; // geometry
  cs->offset_bits = ilog2u((uint64_t)B);                            // log2(B)
  cs->index_bits  = (S > 1) ? ilog2u((uint64_t)S) : 0;              // log2(S) or 0
  cs->access_seq = 0; cs->insert_seq = 0;                           // start counters

  cs->cores = (CoreCache*)calloc(C, sizeof(CoreCache));             // C cores
  for (int c = 0; c < C; c++) {
    cs->cores[c].sets = (CacheSet*)calloc(S, sizeof(CacheSet));   // S sets
    for (int s = 0; s < S; s++) {
      CacheSet* set = &cs->cores[c].sets[s];
      set->lines = (CacheLine*)calloc(K, sizeof(CacheLine));    // K lines
      set->next_victim = 0;                                     // optional
    }
  }
  return cs;
}

// Free in reverse allocation order; safe on NULL
void cache_deallocate(CacheSystem* cs) {
  if (!cs) return;
  for (int c = 0; c < cs->C; c++) {
    for (int s = 0; s < cs->S; s++) free(cs->cores[c].sets[s].lines);
    free(cs->cores[c].sets);
  }
  free(cs->cores);
  free(cs);
}
```

## 4) Probing and replacement helpers

Find a line by tag, and choose a victim using FIFO or LRU.

```c
// Convert (core, index) into a pointer to the target set
static inline CacheSet* get_set(CacheSystem* cs, int core, uint64_t index) {
  return &cs->cores[core].sets[index];
}

// Linear probe among K ways; K is small so this is fine
static int find_line(CacheSet* set, int K, uint64_t tag) {
  for (int i = 0; i < K; i++)
    if (set->lines[i].valid && set->lines[i].tag == tag) return i;
  return -1;
}

// Pick a victim: first prefer any invalid slot; otherwise choose by policy
static int choose_victim(CacheSet* set, int K, CachePolicy policy) {
  for (int i = 0; i < K; i++) if (!set->lines[i].valid) return i; // free slot

  int v = 0; // fallback to 0 and scan for better
  if (policy == POLICY_FIFO) {
    uint64_t best = set->lines[0].load_seq;
    for (int i = 1; i < K; i++) if (set->lines[i].load_seq < best) { best = set->lines[i].load_seq; v = i; }
  } else { // LRU
    uint64_t best = set->lines[0].last_used;
    for (int i = 1; i < K; i++) if (set->lines[i].last_used < best) { best = set->lines[i].last_used; v = i; }
  }
  return v;
}

// Update LRU timestamp on any use (hit or after install)
static inline void touch_on_access(CacheSystem* cs, CacheLine* line) {
  line->last_used = ++cs->access_seq;
}

// Initialize a line on miss fill
static inline void install_line(CacheSystem* cs, CacheLine* line, uint64_t tag, bool as_write) {
  line->valid = true;          // now holds a block
  line->tag = tag;             // set block identity
  line->state = as_write ? LINE_M : LINE_S; // write loads as M, read as S
  line->load_seq = ++cs->insert_seq;        // FIFO timestamp
  touch_on_access(cs, line);   // also bump LRU
}
```

## 5) Coherence bookkeeping (optional MSI)

When writing, other cores with the same block are invalidated; those in M also “write back”. When reading, other cores in M downgrade to S (count a remote writeback). We’ll update a `CacheStats` instance.

```c
// Writing core X: other cores with the block get invalidated; if they had M, count a writeback
static void on_remote_write(CacheSystem* cs, int requester_core, uint64_t tag, uint64_t index, CacheStats* st) {
  for (int c = 0; c < cs->C; c++) if (c != requester_core) {
    CacheSet* rset = get_set(cs, c, index);
    int li = find_line(rset, cs->K, tag);
    if (li < 0) continue;                // remote doesn't have it
    CacheLine* rl = &rset->lines[li];
    if (!rl->valid) continue;            // already invalid
    if (rl->state == LINE_M) st->remote_wbs++; // count flush
    rl->state = LINE_I; rl->valid = false;     // invalidate either S or M
    st->remote_invals++;                 // count one invalidation per remote line
  }
}

// Reading core X: other cores in M downgrade to S and count a writeback; S/I unchanged
static void on_remote_read(CacheSystem* cs, int requester_core, uint64_t tag, uint64_t index, CacheStats* st) {
  for (int c = 0; c < cs->C; c++) if (c != requester_core) {
    CacheSet* rset = get_set(cs, c, index);
    int li = find_line(rset, cs->K, tag);
    if (li < 0) continue;                // remote doesn't have it
    CacheLine* rl = &rset->lines[li];
    if (!rl->valid) continue;            // already invalid
    if (rl->state == LINE_M) {           // only M downgrades and writes back
      rl->state = LINE_S;
      st->remote_wbs++;
    }
  }
}
```

## 6) The core: cache_access

HIT path updates metadata and possibly coherence; MISS installs and may evict.

```c
// Core entry point: returns true on hit, false on miss (for convenience)
bool cache_access(CacheSystem* cs, CacheStats* st, int core, uint64_t addr, bool is_write) {
  uint64_t index = get_index(cs, addr);            // decode set index
  uint64_t tag   = get_tag(cs, addr);              // decode tag
  CacheSet* set  = get_set(cs, core, index);       // select set for this core

  int li = find_line(set, cs->K, tag);             // search among K ways
  if (li >= 0) {
    // HIT: touch replacement metadata
    CacheLine* line = &set->lines[li];
    touch_on_access(cs, line);
    st->hits++;
    if (is_write) {
      line->state = LINE_M;                    // writer holds Modified
      on_remote_write(cs, core, tag, index, st);
    }
    return true;
  }

  // MISS: select victim and update stats
  st->misses++;
  int v = choose_victim(set, cs->K, cs->policy);
  if (set->lines[v].valid) st->evictions++;

  // Coherence side-effects before installing
  if (is_write) on_remote_write(cs, core, tag, index, st);
  else          on_remote_read(cs, core, tag, index, st);

  install_line(cs, &set->lines[v], tag, is_write); // fill new line
  return false;
}
```

## 7) Accessing ranges and parsing traces

For a range `[addr, addr+size)`, touch one block per B-byte boundary. A modify (M) is a read then a write.

```c
void access_range(CacheSystem* cs, CacheStats* st, int core, uint64_t addr, size_t size, bool is_write) {
  uint64_t start = addr & ~(uint64_t)(cs->B - 1);  // align down to block
  uint64_t end   = addr + size;                    // exclusive end of range
  for (uint64_t a = start; a < end; a += cs->B) {  // one access per block
    cache_access(cs, st, core, a, is_write);     // ignore per-byte offset
  }
}

// Example of parsing a tiny trace-like input (pseudo-logic)
// L 10,4  => read 4 bytes at address 0x10
// S 20,8  => write 8 bytes at address 0x20
// M 30,1  => modify (read then write) at 0x30
```

## 8) Minimal driver example

You can stitch a quick sanity test together like this:

```c
#include <stdio.h>

int main(void) {
  CacheSystem* cs = cache_allocate(/*C=*/2, /*S=*/8, /*K=*/2, /*B=*/16, POLICY_LRU);
  CacheStats st = {0};

  // Core 0 reads then writes A
  uint64_t A = 0x1000;
  cache_access(cs, &st, 0, A, false); // miss, load S
  cache_access(cs, &st, 0, A, true);  // hit, upgrade to M, invalidate others

  // Core 1 reads A -> triggers remote writeback from core 0 (M->S)
  cache_access(cs, &st, 1, A, false);

  printf("hits=%lu misses=%lu evictions=%lu rinv=%lu rwb=%lu\n",
       st.hits, st.misses, st.evictions, st.remote_invals, st.remote_wbs);

  cache_deallocate(cs);
  return 0;
}
```

## 9) Edge cases and tips

- S = 1 (fully associative): index_bits = 0 (index always 0). The code above handles this.
- LRU vs FIFO correctness depends on updating `last_used` on every hit; `load_seq` only at install.
- Treat `M` as “read then write” of the same range.
- When logging remote events, attribute them to the remote core being affected in your counters, not the requester.

## 10) Common pitfalls

- Not iterating ranges per block size (B) → miscounting accesses.
- Comparing tags using full addresses instead of block tags.
- Forgetting to update replacement metadata on hits (breaks LRU).
- Invalidating on reads—don’t. Reads only downgrade remote M to S.

## 11) Where to go next

- Add an Exclusive (E) state for MESI to reduce writebacks on shared reads.
- Support write-allocate vs no-write-allocate policies.
- Instrument per-set hit/miss heatmaps or traces for visualization.

This guide gives you all the moving pieces to build a working simulator. You can paste the snippets into a single C file, wire a tiny main, and iterate from there. Happy hacking!

---

## Integrating with this repository’s APIs (important functions from the code)

If you want to wire the above implementation into this repo directly, adapt function signatures and use the provided stats logger declared in `stats.h`.

### Use the repo’s stats API instead of a custom CacheStats

```c
#include "stats.h"
extern Stats *stats; // provided as a global

// Instead of st->hits++ use:
stats_log(stats, EVENT_HIT, core);
// Similarly:
// EVENT_MISS, EVENT_EVICTION, EVENT_REMOTE_INVALIDATION, EVENT_REMOTE_WRITEBACK
```

In your cache_access, replace the manual counters with appropriate `stats_log` calls, attributed to the correct core:

```c
// example snippets inside cache_access
if (hit) {
  stats_log(stats, EVENT_HIT, core);
  if (is_write) on_remote_write(... // inside on_remote_write, call stats_log for remote cores
}
// on miss
stats_log(stats, EVENT_MISS, core);
if (evicted) stats_log(stats, EVENT_EVICTION, core);
```

And inside coherence helpers, log remote events for the affected core IDs:

```c
// remote had S: only invalidation
stats_log(stats, EVENT_REMOTE_INVALIDATION, remote_core);

// remote had M: writeback + invalidation (on write) or writeback only (on read)
stats_log(stats, EVENT_REMOTE_WRITEBACK, remote_core);
if (write) stats_log(stats, EVENT_REMOTE_INVALIDATION, remote_core);
```

### Match function signatures used by `csim.c`

`csim.c` expects these signatures:

```c
// cache_allocate(policy, S, K, B, C)
CacheSystem *cache_allocate(CachePolicy policy, int S, int K, int B, int C);

// cache_access(cs, is_write, address, core)
void cache_access(CacheSystem *cs, bool is_write, unsigned long address, int core);

// cache_deallocate(cs)
void cache_deallocate(CacheSystem *cs);
```

If your personal implementation uses different argument orders, provide thin wrappers that forward to your internal functions.

### Important functions from `csim.c` (with comments)

`csim.c` drives the simulation and logs the start/end of each trace access. These calls should remain as-is:

```c
// Before simulating an access (or both parts of a modify), this is called:
stats_log_access_begin(stats, access_type, address, size, core);

// After simulating that access, this is called:
stats_log_access_end(stats);
```

And this is the expected access sequencing per operation type:

```c
// L (load)  => single read access_range(..., is_write=false)
// S (store) => single write access_range(..., is_write=true)
// M (modify)=> read access_range(..., is_write=false) then write access_range(..., is_write=true)
```

### The repository’s access_range (annotated)

```c
// Trigger exactly one cache_access per distinct block touched by [address, address+size)
static void access_range(CacheSystem *cs, bool is_write, unsigned long address, int size, int core) {
  unsigned long B = (unsigned long)cs->B;
  unsigned long end = address + (unsigned long)size;           // exclusive
  unsigned long first_block = (address / B) * B;               // floor to block
  for (unsigned long a = first_block; a < end; a += B) {
    cache_access(cs, is_write, a, core);                      // repo’s signature
  }
}
```

This alignment ensures partial-block ranges still touch the first containing block.

## 12) Multi-CPU Shared Cache: Remote Invalidations and Writebacks

When multiple cores access shared memory blocks, you must track **remote coherence events** that occur due to the MSI protocol. You’ll modify your simulator so that each core’s cache lines are kept consistent through **remote invalidations** and **remote writebacks**.

The logic is as follows:

### Concept

When a core reads or writes a block that may be cached by other cores:

* **Read:** other cores in `M` must *write back* and downgrade to `S`.
* **Write:** other cores must *invalidate* their copies; if they had `M`, they must also *write back* first.

You don’t need to simulate an actual shared L3 cache—just **count the number of writebacks** and **update cache line states** accordingly.

### Behavior Summary

| Access Type | Remote Core State | Action on Remote Core   | Log Event                                           | New State |
| ----------- | ----------------- | ----------------------- | --------------------------------------------------- | --------- |
| **Read**    | `M`               | Write back + downgrade  | `EVENT_REMOTE_WRITEBACK`                            | `S`       |
| **Read**    | `S` or `I`        | No change               | —                                                   | unchanged |
| **Write**   | `M`               | Write back + invalidate | `EVENT_REMOTE_WRITEBACK`, `EVENT_REMOTE_INVALIDATE` | `I`       |
| **Write**   | `S`               | Invalidate              | `EVENT_REMOTE_INVALIDATE`                           | `I`       |
| **Write**   | `I`               | No change               | —                                                   | unchanged |

### Pseudocode

```c
// Called whenever a core performs an access
void handle_coherence(CacheSystem *cs, Stats *stats,
                      int requester_core, uint64_t tag, uint64_t index, bool is_write) {
  for (int c = 0; c < cs->C; c++) if (c != requester_core) {
    CacheSet *rset = get_set(cs, c, index);
    int li = find_line(rset, cs->K, tag);
    if (li < 0) continue;

    CacheLine *rl = &rset->lines[li];
    if (!rl->valid) continue;

    if (is_write) {
      if (rl->state == LINE_M)
        stats_log(stats, EVENT_REMOTE_WRITEBACK, c);
      stats_log(stats, EVENT_REMOTE_INVALIDATE, c);
      rl->state = LINE_I;
      rl->valid = false;
    } else { // read
      if (rl->state == LINE_M) {
        stats_log(stats, EVENT_REMOTE_WRITEBACK, c);
        rl->state = LINE_S;
      }
    }
  }
}
```

### Integration Notes

* Call `handle_coherence(...)` **before** installing a new line or upgrading a line to `M`.
* Use `stats_log(stats, EVENT_REMOTE_INVALIDATE, core_id)` and `stats_log(stats, EVENT_REMOTE_WRITEBACK, core_id)` for each affected remote core.
* This ensures your simulator correctly logs inter-core coherence traffic without explicitly simulating shared caches.

### Example Walkthrough

1. **Core 0 writes** to address A → line becomes `M`.
2. **Core 1 reads** A → Core 0 performs remote writeback (`M→S`), both now `S`.
3. **Core 2 writes** A → Core 0 and Core 1 invalidate (`S→I`), Core 2 becomes `M`.

Resulting events:

```
Core0: EVENT_REMOTE_WRITEBACK
Core0: EVENT_REMOTE_INVALIDATE
Core1: EVENT_REMOTE_INVALIDATE
```

### Testing

Confirm your simulator:

* Logs a writeback when a remote `M` line is downgraded.
* Logs invalidations when any remote cache holds the same block.
* Maintains correct state transitions: `M→S` on read, `S/M→I` on write.
