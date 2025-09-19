-----

# Bomb Lab: A Complete Walkthrough

This document provides a comprehensive guide to solving a typical 8-phase binary bomb. The goal of the bomb lab is to enhance your understanding of assembly language, debugging tools like GDB, and reverse engineering concepts.

**Tools Used:**

  * `objdump`: For static analysis (disassembling the binary).
  * `gdb`: For dynamic analysis (running and inspecting the program).

-----

We start by dumping the assembly code.
```
objdump -d bomb > bomb.asm
```

## 🚀 Crucial First Step: Handling Memory Randomization (ASLR)

Modern operating systems use **Address Space Layout Randomization (ASLR)** as a security measure, which shuffles the program's memory addresses every time it runs. This means the addresses you see in the disassembly (`objdump`) won't match the addresses in the running program (`gdb`).

The simplest way to deal with this is to disable it within GDB. This command should be run **every time** you start a new GDB session.

```gdb
# Start GDB
gdb bomb

# Immediately disable randomization
(gdb) set disable-randomization on
```

> **Note:** On some systems (especially those using PIE - Position Independent Executables), this may not be enough. For those cases, a more robust dynamic method is provided in the steps for Phases 7 and 8.

-----

## Phase Solutions

Here you'll find the detailed analysis and solution for each phase.

### 💣 Phase 1: The Password

  * **Objective:** Find a secret password string.
  * **Assembly Analysis:** The code for `phase1` calls a `strings_not_equal` function. Right before the call, it uses a `lea` (Load Effective Address) instruction to load a memory address into a register. This address points to the secret string. The disassembler helpfully calculates this address for us.
    ```assembly
    <phase1>:
       lea    0x1aff(%rip),%rsi        # The comment here will show the calculated address, e.g., 0x3208
       call   <strings_not_equal>
    ```
  * **GDB Investigation:** We use the `x/s` (examine as string) command in GDB to print the string at the address found in the analysis.
    ```gdb
    (gdb) x/s 0x3208
    0x3208: "All we have to decide is what to do with the time that is given us."
    ```
  * **Solution:**
    **`All we have to decide is what to do with the time that is given us.`**

-----

### 💣 Phase 2: A Number and a String

  * **Objective:** Provide a specific number followed by a secret string.
  * **Assembly Analysis:** The code uses `sscanf` to parse two inputs. It then checks two conditions:
    1.  The first input number must equal the hardcoded value `0x15d17`.
    2.  The second input string must match a secret string stored at a specific address.
    <!-- end list -->
    ```assembly
    <phase2>:
       call   <__isoc99_sscanf@plt>
       cmp    $0x2,%eax              # Checks for 2 inputs
       cmpl   $0x15d17,0xcc(%rsp)    # Compares the first number
       ...
       lea    0x1bc6(%rip),%rsi      # Loads address of the secret string (e.g., 0x33ae)
       call   <strings_not_equal>
    ```
  * **GDB Investigation:** First, convert the hexadecimal number: `0x15d17` is **89367** in decimal. Then, find the secret string in GDB.
    ```gdb
    (gdb) x/s 0x33ae
    ```
  * **Solution:**
    **`89367 <string revealed by GDB>`**

-----

### 💣 Phase 3: A Mathematical Relationship

  * **Objective:** Find two numbers that satisfy two specific mathematical conditions.
  * **Assembly Analysis:** The code reads two numbers, `num1` and `num2`.
    1.  It checks that `num1` is strictly less than `num2` (`jge <explode>` means it fails if `num1 >= num2`).
    2.  It checks that their sum equals `0x5ba9`.
    <!-- end list -->
    ```assembly
    <phase3>:
       ...
       cmp    %edx,%eax            # Compares num1 and num2
       jge    <explode>            # Fails if num1 >= num2
       add    %edx,%eax            # Calculates sum
       cmp    $0x5ba9,%eax         # Compares sum
       jne    <explode>
    ```
  * **Logic & Solution:** We need two numbers where `num1 < num2` and `num1 + num2 = 23465` (since `0x5ba9` is 23465). A simple valid pair is **1** and **23464**.
  * **Solution:**
    **`1 23464`**

-----

### 💣 Phase 4: The Loop Calculation

  * **Objective:** Find a number `N` that, after being put through a calculation, matches a secret value.
  * **Assembly Analysis:** The code reads one number, `N`. It then enters a loop that calculates the sum of all integers from 1 to `N`. This sum is then compared against the hardcoded value `0xbcdec8`.
    ```assembly
    <phase4>:
       ...
       # A loop that calculates sum = 1 + 2 + ... + N
       ...
       cmp    $0xbcdec8,%ecx      # Compares the sum to the secret value
       jne    <explode>
    ```
  * **Logic & Solution:** We need to solve the equation `1 + 2 + ... + N = 0xbcdec8`. The secret value `0xbcdec8` is **12,377,800** in decimal. The formula for the sum is `N*(N+1)/2`. Solving `N*(N+1)/2 = 12,377,800` gives the answer.
  * **Solution:**
    **`4975`**

-----

### 💣 Phase 5: The Hidden Array

  * **Objective:** Find two numbers that, when processed by a helper function, produce a specific result.
  * **Assembly Analysis:** The code calls `<compute_total>` with two input numbers and compares the result to `0x45d633`. The `<compute_total>` function uses a hidden array of 4 integers in its calculation. The formula is: `Result = 2 * (num1 + num2) + (sum of hidden array)`.
  * **GDB Investigation:** We must find the hidden array at its static address (`0x3470`) to solve the equation.
    ```gdb
    (gdb) x/4d 0x3470
    0x3470: 15   19   20   11
    ```
  * **Logic & Solution:** The target result is `0x45d633` (**4,576,819**). The array sum is `15 + 19 + 20 + 11 = 65`. We solve: `4,576,819 = 2 * (num1 + num2) + 65`, which simplifies to `num1 + num2 = 2,288,377`. A simple valid pair is **1** and **2288376**.
  * **Solution:**
    **`1 2288376`**

-----

### 💣 Phase 6: The Prime Directive

  * **Objective:** Find two prime numbers in a specific range that sum to a target value.
  * **Assembly Analysis:** The code imposes three conditions on two input numbers:
    1.  **Range:** Both numbers must be between **7919** and **12553**.
    2.  **Primality:** A complex loop checks if both numbers are prime.
    3.  **Sum:** Their sum must be `0x4e9c` (**20124**).
  * **Logic & Solution:** We must find a Goldbach partition of 20124 using two primes that fit the range.
    1.  Start with a prime in the range, like **7927**.
    2.  Calculate its partner: `20124 - 7927 = 12197`.
    3.  Check the partner: **12197** is also prime and is within the allowed range.
  * **Solution:**
    **`7927 12197`** (the order does not matter)

-----

### 💣 Phase 7: The Stateful Heap

  * **Objective:** Find two numbers that, when inserted into a hidden data structure (a min-heap), end up at specific positions. This phase is **stateful**, meaning its solution depends on the state of the bomb from previous phases.

  * **Assembly Analysis:** The code calls a helper function, `<hp>`, twice with two input numbers, `num1` and `num2`. It checks for two conditions:

    1.  `hp(num1)` must return **10**.
    2.  `hp(num2)` must return **5**.

    The `<hp>` function implements a **min-heap** data structure. It inserts a number into a global heap and returns the number's final index after the insertion is complete. For `hp(num1)` to return 10, the heap must already contain exactly 10 elements when the phase begins.

  * **GDB Investigation:** Using dynamic analysis in GDB, we paused the bomb at the start of Phase 7 and inspected the contents of the heap array. The investigation revealed the following 10 numbers stored in the heap:

    ```gdb
    (gdb) x/10d 0x555555559160
    0x555555559160 <xs>:    1047534 1078001 1119394 1102067
    0x555555559170 <xs+16>: 1406011 1740619 1273291 1799082
    0x555555559180 <xs+32>: 1832950 1718413
    ```

  * **Logic & Solution:** The solution is found by choosing numbers that satisfy the heap's rules based on the data above.

      * **To find `num1` (first input):** For its final index to be 10, `num1` must be greater than or equal to the heap element at index 4 (the 5th number). Your heap's 5th element is **1406011**. The simplest choice is `num1 = 1406011`.
      * **To find `num2` (second input):** For its final index to be 5, `num2` must be greater than or equal to the element at index 2 (the 3rd number) but less than the element at index 5 (the 6th number). Your heap's 3rd element is **1119394** and its 6th is **1740619**. The simplest choice is `num2 = 1119394`.

  * **Solution:**
    **`1406011 1119394`**

-----

### 💣 Phase 8: The Jump Table

  * **Objective:** Find a number that directs the program's execution down the only correct path out of 64 possibilities.
  * **Assembly Analysis:** The code uses the lower 6 bits of your input number (`N & 63`) as an index into a table of 64 addresses (a jump table). Only one path returns 0 (success). This success path is at address `0x1d91`.
  * **GDB Investigation:** We need to find which index in the jump table points to the success path.
    1.  Pause at `phase8`: `break phase8`, then `run 8`.
    2.  Find the jump table's real address dynamically:
        ```gdb
        (gdb) break *$pc + 0x2a
        (gdb) continue
        (gdb) stepi
        (gdb) p $rdx
        $1 = 0x555555557480 # Your unique address
        (gdb) x/64d 0x555555557480
        ```
  * **Logic & Solution:** The GDB command will show 64 offsets. We need the offset that points to our target. The required offset is `0x1d91 - 0x3480 = -5871`. Look for the number **-5871** in the output. Count its position (starting from 0). For your bomb, this was at index **41**. The solution is the index itself.
  * **Solution:**
    **`41`**

-----

Congratulations on defusing the bomb\! 🎉