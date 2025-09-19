-----

# Binary Bomb Lab: A Strategic Field Manual

Welcome\! This guide is designed to help you tackle the Binary Bomb Lab. The goal isn't to give you the answers, but to teach you the **methodology** for defusing each phase. Every bomb is slightly different—the strings, numbers, and functions will change—but the underlying concepts and strategies for solving them are the same.

This manual will walk you through the thought process for a typical 8-phase bomb, showing you what to look for and how to use your tools effectively.

**Your Essential Toolkit:**

  * `objdump`: For disassembling the binary and getting a static "map" of the code.
  * `gdb`: For running the program in a controlled way, setting breakpoints, and inspecting memory and registers live.

-----

First things first, let's get a readable version of the assembly code.

```bash
objdump -d bomb > bomb.asm
```

## 🚀 Crucial First Step: Taming ASLR

Modern operating systems use **Address Space Layout Randomization (ASLR)** as a security feature. It shuffles the memory addresses of a program every time it runs. This is a problem because the addresses in your static `bomb.asm` file won't match the addresses when you run the bomb in GDB.

The easiest way to handle this is to turn it off within GDB. You must run this command **every time** you start a new GDB session.

```gdb
# Start GDB
gdb bomb

# Immediately disable randomization
(gdb) set disable-randomization on
```

> **Note:** For some bombs (especially later phases), you might still need to calculate addresses dynamically. We'll cover that when we get there.

-----

## How to Approach Each Phase

Here's how to think about and solve each type of challenge you'll encounter.

### 💣 Phase 1: The Simple String

  * **Objective:** Find a secret password string. This is usually the easiest phase, designed to get you comfortable with the tools.

  * **Assembly Clues:** Look for a call to the `<strings_not_equal>` function. Right before this call, you'll see a `lea` (Load Effective Address) instruction loading the secret string's address into the `%rsi` register, which is used for the second argument of a function.

    ```assembly
    0000000000001702 <phase1>:
      1702:	48 8d 35 ff 1a 00 00 	lea    0x1aff(%rip),%rsi        # This is the key! It loads the address of the secret string.
                                                                        # objdump calculates the final address for you: 3208
      1709:	e8 8f ff ff ff       	call   169d <strings_not_equal> # Compares your input with the secret string.
      170e:	85 c0                	test   %eax,%eax
      1710:	74 05                	je     1717 <phase1+0x15>      # If strings ARE equal, eax is 0. test is 0. Jump to success.
      1712:	b8 01 00 00 00       	mov    $0x1,%eax                # Explode! (simplified)
      1717:	c3                   	ret                             # Success!
    ```

  * **GDB Strategy:**

    1.  Find the address calculated by `objdump` in the comment (in this case, `3208`).
    2.  Use the `x/s` (e**x**amine as **s**tring) command in GDB to print the string at that address.

    <!-- end list -->

    ```gdb
    # The address from the assembly comment was 0x3208
    (gdb) x/s 0x3208
    ```

  * **The Logic:** The program loads a secret string from memory to compare against your input. Your job is to find where that string is stored and read it.

-----

### 💣 Phase 2: Reading Multiple Inputs

  * **Objective:** Provide the correct sequence of inputs, typically a number and a string.

  * **Assembly Clues:** Look for a call to `<__isoc99_sscanf@plt>`. This is a dead giveaway that the program is parsing multiple inputs. You need to find all the checks it performs.

    ```assembly
    00000000000017a2 <phase2>:
      17c0:	e8 eb f8 ff ff       	call   10b0 <__isoc99_sscanf@plt>
      17c5:	83 f8 02             	cmp    $0x2,%eax              # Check 1: Did sscanf successfully read 2 items?
      17c8:	75 2e                	jne    17f8 <phase2+0x56>     # If not, jump to explode.
      17ca:	81 bc 24 cc 00 00 00 	cmpl   $0x15d17,0xcc(%rsp)    # Check 2: Compare the first input number with 0x15d17.
      17d5:	74 07                	je     17de <phase2+0x3c>     # If they are equal, continue.
      ...
      17e1:	48 8d 35 c6 1b 00 00 	lea    0x1bc6(%rip),%rsi      # Check 3: Load the secret string's address (at 0x33ae).
      17e8:	e8 50 ff ff ff       	call   173d <strings_not_equal> # Compare the second input string.
    ```

  * **GDB Strategy:**

    1.  Convert the hexadecimal number (`0x15d17`) to decimal. You can do this in GDB: `p/d 0x15d17`.
    2.  Find the address for the secret string from the second `lea` instruction (`0x33ae`) and use `x/s` to read it.

  * **The Logic:** The bomb expects exactly two inputs. You must provide the correct number and the correct string in the correct order.

-----

### 💣 Phase 3: Simple Math Puzzle

  * **Objective:** Find two numbers that satisfy a set of mathematical conditions.

  * **Assembly Clues:** Again, the code reads two numbers with `sscanf`. The key is to translate the comparison (`cmp`) and jump (`jge`, `jne`) instructions into mathematical rules.

    ```assembly
    0000000000001805 <phase3>:
      1829:	8b 44 24 0c          	mov    0xc(%rsp),%eax       # Move num1 into eax
      182d:	8b 54 24 08          	mov    0x8(%rsp),%edx       # Move num2 into edx
      1831:	39 d0                	cmp    %edx,%eax            # Compare num1 and num2
      1833:	7d 1a                	jge    184f <phase3+0x4a> # Jumps to explode if num1 >= num2. Rule 1: num1 < num2
      1835:	01 d0                	add    %edx,%eax            # sum = num1 + num2
      1837:	3d a9 5b 00 00       	cmp    $0x5ba9,%eax         # Compare sum to 0x5ba9
      183c:	75 18                	jne    1856 <phase3+0x51> # Jumps to explode if sum != 0x5ba9. Rule 2: sum = 0x5ba9
    ```

  * **The Logic:** Translate the assembly into a system of simple equations:

    1.  `num1 < num2`
    2.  `num1 + num2 = 0x5ba9` (which is 23465 in decimal)
        Once you have the rules, you can solve for any valid pair. A good strategy is to pick a simple first number (like 1) and solve for the second.

-----

### 💣 Phase 4: The Loop

  * **Objective:** Find a single number `N` that produces a specific result after being processed by a loop.

  * **Assembly Clues:** You'll see a clear loop structure. Your goal is to figure out what the loop is calculating by tracing the registers.

    ```assembly
    0000000000001860 <phase4>:
      # sscanf reads one number, N, into memory at 0xc(%rsp)
      187f:	89 c2                	mov    %eax,%edx          # eax is 1 from sscanf. edx is our counter, starts at 1.
      1881:	b9 00 00 00 00       	mov    $0x0,%ecx          # ecx is our accumulator (sum), starts at 0.
      1886:	eb 0d                	jmp    1895 <phase4+0x35> # Jump to the loop condition check

    0000000000001890 <phase4+0x30>:  # <--- Loop starts here
      1890:	01 d1                	add    %edx,%ecx          # sum = sum + counter
      1892:	83 c2 01             	add    $0x1,%edx          # counter++

    0000000000001895 <phase4+0x35>:
      1895:	39 54 24 0c          	cmp    %edx,0xc(%rsp)     # Compare counter (edx) with N (at rsp+0xc)
      1899:	7d f5                	jge    1890 <phase4+0x30> # If N >= counter, jump back to loop start

      # After the loop finishes:
      189b:	81 f9 c8 de bc 00    	cmp    $0xbcdec8,%ecx     # Compare the final sum with the target value
    ```

  * **The Logic:** The loop calculates the sum of integers from 1 to `N`. You need to reverse the calculation. The formula for this sum is $Sum = \\frac{N \\times (N + 1)}{2}$. You know the target `Sum` (`0xbcdec8`), so you just need to solve the equation for `N`.

-----

### 💣 Phase 5: The Hidden Data Structure

  * **Objective:** Provide inputs that, when used in a helper function, produce a target result.

  * **Assembly Clues:** The main phase function will be short. The real work is in the helper function it calls, in this case `<compute_total>`.

    ```assembly
    0000000000001919 <phase5>:
      # reads num1 and num2
      1945:	e8 76 ff ff ff       	call   18c0 <compute_total>
      194a:	3d 33 d6 45 00       	cmp    $0x45d633,%eax        # Compare the result with the target value
    ```

    Now, let's look inside `<compute_total>`:

    ```assembly
    00000000000018c0 <compute_total>:
      # This function loops from 0 to 3.
      # It adds your inputs to elements from a hidden array.
      18e3:	4c 8d 05 86 1b 00 00 	lea    0x1b86(%rip),%r8       # This instruction reveals the array's address: 0x3470
      ...
      18ed:	45 03 14 88          	add    (%r8,%rcx,4),%r10d     # Adds an array element to num2
      ...
      190d:	45 03 0c 88          	add    (%r8,%rcx,4),%r9d      # Adds an array element to num1
    ```

  * **GDB Strategy:**

    1.  Analyze `<compute_total>` to find the `lea` instruction that points to the hidden array (`0x3470`).
    2.  Use GDB to inspect the contents of this array. `x/4d 0x3470` will e**x**amine the memory and print **4** values in **d**ecimal format.

  * **The Logic:** By tracing `<compute_total>`, you'll find the formula is effectively `Result = 2 * (num1 + num2) + (sum of hidden array)`. Once you find the array values in GDB, you have the full formula and can solve for `num1` and `num2`.

-----

### 💣 Phase 6: The Prime Directive

  * **Objective:** Find two numbers that satisfy several complex conditions.

  * **Assembly Clues:** This phase breaks down into three checks. Focus on the easiest ones first.

    1.  **Range Check:** These instructions check if the numbers are in the valid range.
        ```assembly
        19af:	41 8d 80 11 e1 ff ff 	lea    -0x1eef(%r8),%eax  # r8 is input. eax = input - 7919
        19b6:	3d 1a 12 00 00       	cmp    $0x121a,%eax     # eax vs 4634. (i.e., input - 7919 vs 4634)
        19bb:	0f 87 9f 00 00 00    	ja     1a60 <phase6+0xe0> # Explode if input > 12553
        # This logic ensures 7919 <= input <= 12553
        ```
    2.  **Primality Check:** There's a very complicated loop from `1a00` to `1a2a`. This is a trial division algorithm to check if the numbers are prime. Don't waste time decoding it fully; assume it's a prime check and move on.
    3.  **Sum Check:** This one is simple and near the end.
        ```assembly
        1a43:	45 01 c8             	add    %r9d,%r8d              # r8d = r8d + r9d (sum = num1 + num2)
        1a46:	41 81 f8 9c 4e 00 00 	cmp    $0x4e9c,%r8d           # Compare sum to the target 0x4e9c
        ```

  * **The Logic:** Use the easiest constraints to narrow your search.

    1.  Find the required sum (`num1 + num2 = 0x4e9c`).
    2.  Pick a **prime number** that fits the required range.
    3.  Calculate its partner to achieve the sum.
    4.  Check if the partner is also prime and in range. If so, you've found the solution.

-----

### 💣 Phase 7: The Stateful Challenge

  * **Objective:** Find inputs that place elements correctly within a data structure that has been built up by your previous solutions. This phase is **stateful**.

  * **Assembly Clues:** The phase calls a helper function `<hp>` twice and checks its return value.

    ```assembly
    0000000000001b36 <phase7>:
      1b68:	e8 53 ff ff ff       	call   1ac0 <hp>
      1b6d:	83 f8 0a             	cmp    $0xa,%eax                # Is the result 10?
      ...
      1b7d:	e8 3e ff ff ff       	call   1ac0 <hp>
      1b82:	83 f8 05             	cmp    $0x5,%eax                # Is the result 5?
    ```

    The `<hp>` function itself reveals the data structure. It takes a number, adds it to an array, and then "bubbles it up" by repeatedly comparing it to its parent node—the classic behavior of a **min-heap insertion**.

    ```assembly
    0000000000001ac0 <hp>:
      1ad2:	48 8d 15 87 36 00 00 	lea    0x3687(%rip),%rdx        # The location of the heap array, <xs> at 0x5160
      1ad9:	89 3c 8a             	mov    %edi,(%rdx,%rcx,4)     # Insert new element
      ...
      1b24:	39 cf                	cmp    %ecx,%edi              # Compare element with its parent
      1b26:	7c d8                	jl     1b00 <hp+0x40>         # If smaller, jump to swap and continue bubbling up
    ```

  * **GDB Strategy:** Static analysis isn't enough.

    1.  Set a breakpoint at the start of `phase_7` (`b phase_7`).
    2.  Run the bomb with all your previous correct solutions.
    3.  When GDB breaks, the heap is already populated from previous phases. Find its address (`0x5160`) from the `lea` instruction in `<hp>`.
    4.  Inspect the heap's current state: `x/10d 0x5160`.

  * **The Logic:** You need to choose input numbers that, when inserted into the *current state* of the min-heap, will end up in the required final positions (index 10 and index 5).

-----

### 💣 Phase 8: The Jump Table

  * **Objective:** Find a single number that selects the one correct execution path out of 64 possibilities.

  * **Assembly Clues:** The key pattern is an indirect `jmp`. It uses your input as an index into a table of addresses.

    ```assembly
    0000000000001b95 <phase8>:
      1bbc:	83 e0 3f             	and    $0x3f,%eax               # Mask input to get a value 0-63. This is the index.
      1bbf:	48 8d 15 ba 18 00 00 	lea    0x18ba(%rip),%rdx        # Load base address of the jump table (at 0x3480)
      1bc6:	48 63 04 82          	movslq (%rdx,%rax,4),%rax      # Look up the offset from the table using the index
      1bca:	48 01 d0             	add    %rdx,%rax                # Calculate the final jump address
      1bcd:	ff e0                	jmp    *%rax                    # JUMP!
    ```

    Your goal is to find which index leads to the **success path**. By scanning the code, you can find the only non-exploding path:

    ```assembly
    1d91:	b8 00 00 00 00       	mov    $0x0,%eax              # Success! Returns 0.
    1d96:	eb 7c                	jmp    1e14 <phase8+0x27f>
    ```

  * **GDB Strategy:**

    1.  Break at `phase_8`.
    2.  Step until *after* the `lea` instruction at `1bbf` to find the jump table's real-time address in the `%rdx` register (`p $rdx`).
    3.  Dump the entire jump table's contents. Note that the table stores *offsets*, not full addresses. So you should print them as signed decimal integers: `x/64d <real_address_from_rdx>`.
    4.  Calculate the required offset: `success_address - table_base_address`. In this case, `0x1d91 - 0x3480`.
    5.  Find that offset value in the GDB dump. The **index** of that entry is your answer.

-----

Congratulations\! By following these strategies, you've learned how to analyze assembly, use a debugger effectively, and think your way through complex reverse-engineering puzzles. Good luck defusing your bomb\! 🎉
