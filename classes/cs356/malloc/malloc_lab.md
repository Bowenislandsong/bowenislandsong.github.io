# MallocLab Guide

This document explains **how the allocator in this repo works**, why it passes the CS356 MallocLab tests, and how you could **extend it for better throughput**.

Read this side-by-side with:

* `src/mm_block.c`, `src/mm_block.h`
* `src/mm_list.c`, `src/mm_list.h`
* `src/mm.c`

The goal is to help you *learn the design*, not just copy the code.

---

## 1. High-level design

This solution implements a **classic explicit free-list allocator** with:

* **Headers / footers** (boundary tags) and 8-byte alignment
* A **doubly-linked free list** stored inside free blocks
* **Next-fit** search with a rover pointer
* **Immediate coalescing** on `free`
* A **correct, conservative `realloc`**:

  * Allocate–copy–free fallback
  * In-place shrink when possible
  * A fast path that grows blocks at the **heap epilogue** without copying
* **Smart splitting**: avoid creating tiny, unusable fragments

This design is intentionally straightforward so it’s easy to reason about and passes all the grading traces.

---

## 2. Block layout

Each heap block has:

* 4-byte **header**: `size | alloc-bit`
* Payload:

  * For allocated blocks: user data
  * For free blocks: `prev` / `next` pointers for the free list
* 4-byte **footer**: mirrors the header (same size+alloc)

Conceptually:

```text
[ header | payload (or prev/next) ... | footer ]
```

Typical helpers in `mm_block.c` (simplified):

```c
size_t mm_block_size(mm_block_t *bp) {
    return mm_block_hdr(bp)->size & ~0x7;   // clear low bits
}

int mm_block_alloc(mm_block_t *bp) {
    return mm_block_hdr(bp)->size & 0x1;    // alloc bit (LSB)
}
```

Key points:

* Size is **always** a multiple of 8.
* Low bits are used for flags; masking with `~0x7` recovers the size.
* Both **header and footer must be updated together** whenever a block changes size or alloc status.

### What students can do to extend this

* Centralize bit logic into a helper like:

  ```c
  static inline void set_block(mm_block_t *bp, size_t size, int alloc);
  ```

* Add debug checks (`assert`) to ensure:

  * Size is 8-byte aligned
  * Alloc flag is 0 or 1
  * Header and footer always match

---

## 3. Free list structure

Free blocks are linked via a **doubly-linked list**, using the first 2 words of the payload for `prev`/`next`.

Insertion at the head (LIFO) in `mm_list.c` looks like:

```c
void mm_list_prepend(mm_block_t *bp) {
    mm_block_set_prev_free(bp, NULL);
    mm_block_set_next_free(bp, mm_list_headp);

    if (mm_list_headp != NULL) {
        mm_block_set_prev_free(mm_list_headp, bp);
    } else {
        mm_list_tailp = bp;
    }

    mm_list_headp = bp;
}
```

Removal is **O(1)** because each free block already knows its neighbors:

```c
void mm_list_remove(mm_block_t *bp) {
    mm_block_t *prev = mm_block_prev_free(bp);
    mm_block_t *next = mm_block_next_free(bp);

    if (prev != NULL) {
        mm_block_set_next_free(prev, next);
    } else {
        mm_list_headp = next;
    }

    if (next != NULL) {
        mm_block_set_prev_free(next, prev);
    } else {
        mm_list_tailp = prev;
    }

    mm_block_set_prev_free(bp, NULL);
    mm_block_set_next_free(bp, NULL);
}
```

Common pitfalls this avoids:

* **No linear membership scans**: we never walk the list just to remove one block.
* We correctly update **head** and **tail** when removing from the ends of the list.

### Student extensions

* Add a **heap checker** that walks the free list and verifies:

  * `prev` / `next` are consistent both directions.
  * No free block appears twice.
  * Every free block in the heap is in the list.

---

## 4. Placement policy: next-fit

When `mm_malloc` needs a block of size `asize`, it calls `find_fit(asize)`. This implementation uses **next-fit**:

* Maintain a **rover** pointer into the free list.
* Search from rover → tail, then wrap around head → rover.

Sketch:

```c
static mm_block_t *find_fit(size_t asize) {
    mm_block_t *bp = rover;

    // Rover → tail
    for (; bp != NULL; bp = mm_block_next_free(bp)) {
        if (mm_block_size(bp) >= asize) {
            rover = bp;
            return bp;
        }
    }

    // Head → rover
    for (bp = mm_list_headp; bp != rover; bp = mm_block_next_free(bp)) {
        if (mm_block_size(bp) >= asize) {
            rover = bp;
            return bp;
        }
    }

    return NULL;  // no fit
}
```

Why next-fit?

* It avoids re-scanning the same small blocks at the front of the list over and over.
* It’s **simple** yet often performs better than naive first-fit for the lab traces.

---

## 5. Splitting blocks

Once a free block `bp` is chosen, `place(bp, asize)` decides whether to:

* Use the whole block, or
* Split it into an allocated block + a smaller free block

To avoid tiny unusable fragments, we only split if the **remainder ≥ MIN_BLOCK_SIZE** (header + footer + two pointers, typically 16B).

Sketch (simplified):

```c
static void place(mm_block_t *bp, size_t asize) {
    size_t csize = mm_block_size(bp);

    mm_list_remove(bp);

    if (csize - asize >= MIN_BLOCK_SIZE) {
        // Allocate front part
        set_block(bp, asize, 1);

        // Create remainder block
        mm_block_t *next = mm_block_next(bp);
        set_block(next, csize - asize, 0);
        mm_list_prepend(next);
    } else {
        // Use whole block
        set_block(bp, csize, 1);
    }
}
```

This balances:

* **Utilization** (splitting big blocks so memory isn’t wasted)
* **Overhead** (avoid creating tiny slivers that just clog the free list)

---

## 6. Free and coalescing

On `mm_free(ptr)`:

1. Turn `ptr` → block pointer `bp`.
2. Mark the block as free (header & footer).
3. Immediately **coalesce** with neighboring free blocks.
4. Insert the resulting free block into the list.

Coalescing checks the previous and next physical neighbors via boundary tags, merges as needed, then inserts the merged block once.

Why immediate coalescing?

* It keeps bigger free blocks around, which helps later large allocations.
* The logic is simple and keeps the heap invariant: **no two adjacent free blocks**.

---

## 7. Realloc strategy

`mm_realloc` is designed to be **simple and correct**, with a couple of targeted optimizations:

1. **In-place shrink**
   If the new size is smaller and the leftover space is at least a full block:

   * Split the tail, free the remainder, and coalesce if needed.
   * No copy required.

2. **Fast path at the epilogue**
   If the block’s next neighbor is the **epilogue block** and we need to grow:

   * Extend the heap via `mem_sbrk`.
   * Grow the current block’s size.
   * No copy, no list surgery, safe and fast.

3. **General case: allocate–copy–free**
   For everything else:

   * Allocate a new block of the requested size.
   * Copy `min(oldsize, newsize)` bytes.
   * Free the old block.

This is not the most aggressive `realloc` optimization possible, but it’s:

* **Correct** (no weird corner cases with overlapping free blocks)
* **Good enough** to pass the realloc-heavy traces while staying understandable

---

## 8. Common pitfalls this solution avoids

Some classic MallocLab bugs, and how this design steers clear:

* **Mismatched headers/footers**: all size/alloc changes go through helpers that update both.
* **Double-free / corrupted free list**: `mm_list_remove` is O(1) and only used when we know the block is in the free list; pointers are nulled after removal.
* **Creating tiny fragments**: splitting only when remainder ≥ minimum block size.
* **Uncoalesced adjacent frees**: immediate coalescing enforces “no two adjacent free blocks”.
* **Misaligned payloads**: size is always rounded up to meet 8-byte alignment, and headers/footers are sized accordingly.

---

## 9. Performance & Speed-Up Plan

The current allocator:

* Uses a **single explicit free list** and next-fit.
* Has correct but conservative `realloc`.
* Achieves a solid performance index, but not the maximum possible.

Most remaining overhead comes from:

* **Search time** in `find_fit` as the free list grows and fragments.
* **Unnecessary copying** in `realloc` when we could grow in place.

Here’s a concrete roadmap to speed it up further.

### 9.1 Segregated free lists (size-class bins)

Instead of one big free list, maintain **multiple lists** (bins) by size:

* Bin 0: [16, 32)
* Bin 1: [32, 64)
* Bin 2: [64, 128)
* …
* Final bin: “huge blocks”

Implementation sketch:

```c
#define NUM_BINS 12
static mm_block_t *seg_free_lists[NUM_BINS];

static int size_to_bin(size_t size) {
    // e.g., map size to log2-based or fixed-range bins
}
```

Then:

* On `free` (after coalescing): insert into `seg_free_lists[size_to_bin(size)]` (LIFO).
* On `malloc`: look in the bin for `asize` (and maybe a few larger bins) using simple **first-fit**.

**Why this helps:**

* Greatly reduces search length: small requests only scan small-block lists.
* Cuts `find_fit` from “scan the world” to “scan a small, relevant subset”.

### 9.2 Geometric heap growth (doubling chunk size)

Right now, the heap is extended by a fixed or minimally sufficient chunk. You can speed things up by using **geometric (doubling) heap growth**:

* Keep a variable `current_chunk_size`.
* When you need more memory:

  * Request `chunk = max(asize, current_chunk_size)`.
  * After a successful extend, set `current_chunk_size = min(current_chunk_size * 2, MAX_CHUNK_CAP)`.

This is what your prompt described as **“doubling linked list with heap”**: as the heap grows, you also grow the typical extension size, which indirectly keeps the free lists packed with blocks that match the workload scale.

Benefits:

* Fewer `mem_sbrk` calls.
* Less frequent coalescing and list updates at the top of the heap.
* Better amortized cost for large/long-running traces.

### 9.3 More aggressive splitting for very large blocks

Currently, we split once if `csize - asize ≥ MIN_BLOCK_SIZE`.

For very large blocks, you can:

* Split off blocks in **chunks or powers of two** (a la buddy system), so large free blocks don’t sit unused.
* Example strategy:

  * If `csize` is much larger than `asize` (e.g., `csize >= 4 * asize`), repeatedly split the block into halves until you get close to `asize`, inserting the extra halves into appropriate bins.

This keeps the free lists **better matched** to actual allocation sizes and can reduce scanning time.

### 9.4 Realloc: grow into adjacent free blocks (not just epilogue)

Generalize the fast path:

* If `realloc(ptr, newsize)` and:

  * Next physical block is free, and
  * `old_size + next_free_size ≥ new_asize`:

Then:

1. Remove the next free block from its free list / bin.
2. Merge it into the current block.
3. If there’s a usable remainder, split it and re-insert the tail.

No copying, no `malloc`+`free`, and big win on realloc-heavy traces.

This is the single biggest `realloc`-specific speedup you can add beyond the epilogue trick.

### 9.5 Coalescing & micro-tuning

Additional knobs:

* **Deferred coalescing**: coalesce only when `find_fit` fails or periodically, instead of on every `free`. This reduces work for workloads that free and re-allocate quickly.
* **Inline hot helpers** (`static inline` or macros) for:

  * `HDRP`, `FTRP`, `NEXT_BLKP`, `PREV_BLKP`
  * `GET_SIZE`, `GET_ALLOC`
* Compile with debugging disabled for grading; keep `printf` / `mm_checkheap` under `#ifdef DEBUG`.

---

## 10. How to build, test, and grade

From the repo root:

```bash
# Build and run unit tests
make test

# Run the official grading script
./grade
```

* `make test` checks:

  * Block primitives
  * Free-list operations
  * Core allocator behavior
* `./grade` runs the performance / correctness traces.

Use this solution as a **baseline**: understand it deeply, then try one speed-up at a time (segregated lists, geometric heap growth, better `realloc`, etc.) and watch how the grade changes.
