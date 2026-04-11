(function () {
  'use strict';

  const CATEGORY_META = [
    {
      key: 'dynamic-programming',
      label: 'Dynamic Programming',
      color: 'teal',
      instinct: 'Freeze the right amount of history. A DP state should capture exactly what future decisions need and nothing more.',
    },
    {
      key: 'graphs',
      label: 'Graphs',
      color: 'sky',
      instinct: 'If positions are connected by moves, transitions, flights, or matrix edges, you are usually traversing a graph whether the prompt says so or not.',
    },
    {
      key: 'linked-lists',
      label: 'Linked Lists',
      color: 'violet',
      instinct: 'Singly linked lists punish backward thinking. Solve them with pointer geometry: fast and slow pointers, reversal, and careful weaving.',
    },
    {
      key: 'backtracking',
      label: 'Backtracking / Combinatorics',
      color: 'amber',
      instinct: 'Build the answer incrementally, prune bad partial states early, and let the recursion tree represent the search space.',
    },
    {
      key: 'strings',
      label: 'Strings / Parsing',
      color: 'rose',
      instinct: 'Treat strings as structured data. Many string problems are really about disciplined parsing, carry simulation, or validating constrained splits.',
    },
    {
      key: 'bit-manipulation',
      label: 'Bit Manipulation',
      color: 'slate',
      instinct: 'If counts are repeated with small fixed-width arithmetic, bits often expose a simple invariant that maps better to hardware than to hash maps.',
    },
    {
      key: 'trie',
      label: 'Trie / Prefix Search',
      color: 'emerald',
      instinct: 'When many words share prefixes, stop rechecking the same prefixes separately. Share them in a trie and prune impossible paths early.',
    },
  ];

  const APPROACH_META = [
    {
      key: 'interval-dp',
      label: 'Interval DP',
      cue: 'Use this when boundaries can make a mutable process stable. Typical tell: “guess the last thing done inside a window.”',
    },
    {
      key: '2d-dp',
      label: '2D Sequence DP',
      cue: 'A grid of prefixes works when two sequences jointly determine progress. Rows and columns represent consumed prefixes.',
    },
    {
      key: 'space-optimized-dp',
      label: 'Space-Optimized DP',
      cue: 'If the next row only depends on the current row and the previous row, compress the table and carry the overwritten diagonal carefully.',
    },
    {
      key: 'dfs',
      label: 'DFS / Traversal',
      cue: 'Use DFS when the job is to fully explore a component, path, or search branch before returning.',
    },
    {
      key: 'shortest-path',
      label: 'Shortest Path Framing',
      cue: 'Once the problem becomes “best cost from a source to every node,” reach for shortest-path tools instead of ad hoc traversal.',
    },
    {
      key: 'dijkstra',
      label: 'Dijkstra',
      cue: 'For nonnegative edge costs, repeatedly finalize the node with the smallest known distance.',
    },
    {
      key: 'bellman-ford',
      label: 'Bellman-Ford / Layered Relaxation',
      cue: 'Repeated edge relaxation is the safer choice when you want bounded edge counts or want to reason layer by layer.',
    },
    {
      key: 'floyd-cycle',
      label: 'Floyd Cycle Detection',
      cue: 'If “next” pointers are implicit, fast and slow pointers can reveal the cycle and its entrance in O(1) space.',
    },
    {
      key: 'fast-slow',
      label: 'Fast / Slow Pointers',
      cue: 'Use speed mismatch to find middles, detect cycles, or split a linked list cleanly.',
    },
    {
      key: 'reverse-and-merge',
      label: 'Reverse + Merge',
      cue: 'When you need to compare or interleave a list from both ends, reverse one half so both scans become forward pointer walks.',
    },
    {
      key: 'iterative-cascading',
      label: 'Iterative Cascading',
      cue: 'For subset-style generation, each new value extends the full set of answers built so far.',
    },
    {
      key: 'backtracking',
      label: 'Backtracking',
      cue: 'Enumerate choices recursively, but define crisp pruning rules so the search tree never expands blindly.',
    },
    {
      key: 'string-parsing',
      label: 'String Parsing',
      cue: 'If the valid answer depends on constrained chunks, validate each chunk locally and prune illegal formats immediately.',
    },
    {
      key: 'string-addition',
      label: 'String Addition / Carry',
      cue: 'When integers are encoded as strings, simulate grade-school addition from right to left and keep the carry explicit.',
    },
    {
      key: 'bit-counting',
      label: 'Bit Counting',
      cue: 'Count bit positions instead of full values when the repetition pattern is fixed and arithmetic modulo a small number reveals the outlier.',
    },
    {
      key: 'trie',
      label: 'Trie',
      cue: 'Store shared prefixes once so search can stop the moment a path is no longer a valid prefix.',
    },
  ];

  const PROBLEMS = [
    {
      lc: 312,
      title: 'Burst Balloons',
      slug: 'burst-balloons',
      category: 'dynamic-programming',
      approaches: ['interval-dp'],
      requested: true,
      summary: 'Reverse time. Instead of guessing which balloon pops first, guess which balloon pops last inside each interval so the neighbors are fixed.',
      instinct: 'If simulating forward keeps changing the state you care about, stop simulating forward. Stable boundaries are usually a better DP state than chronological order.',
      example: 'For [3, 1, 5, 8], pad to [1, 3, 1, 5, 8, 1]. If k is the last balloon popped inside (left, right), then coins gained at that final step are nums[left] * nums[k] * nums[right], and the left and right intervals become independent subproblems.',
      signals: [
        'A local action mutates future neighbors, so forward recursion explodes.',
        'Choosing the last action creates a clean brick wall between left and right.',
        'Sentinel 1s remove ugly edge handling.',
      ],
      edgeCases: [
        'Pad with 1 on both ends before building the DP table.',
        'Keep one interval convention throughout, such as open interval (left, right).',
        'An interval with no balloon inside contributes 0.',
      ],
      complexity: 'Time O(n^3), space O(n^2).',
    },
    {
      lc: 72,
      title: 'Edit Distance',
      slug: 'edit-distance',
      category: 'dynamic-programming',
      approaches: ['2d-dp', 'space-optimized-dp'],
      requested: true,
      summary: 'Think in prefixes. dp[i][j] means the minimum edits needed to turn word1[:i] into word2[:j].',
      instinct: 'Sequence-to-sequence transform problems usually become clear when each grid cell answers a prefix question. The top, left, and diagonal neighbors map directly to delete, insert, and replace.',
      example: 'If word1[i - 1] === word2[j - 1], copy the diagonal. Otherwise take 1 + min(top delete, left insert, diagonal replace). For the compressed version, keep the previous diagonal in a temporary variable before it gets overwritten.',
      signals: [
        'Two sequences advance independently, so a 2D prefix grid is natural.',
        'Operations are local and uniform: insert, delete, replace.',
        'Only the previous row and current row are needed, so the table can be compressed.',
      ],
      edgeCases: [
        'An empty string requires all inserts or all deletes.',
        'Equal characters should carry the diagonal value without adding 1.',
        'In the 1D optimization, preserve the old diagonal before overwriting the current cell.',
      ],
      complexity: 'Time O(mn); full-table space O(mn), or O(n) with row compression.',
    },
    {
      lc: 97,
      title: 'Interleaving String',
      slug: 'interleaving-string',
      category: 'dynamic-programming',
      approaches: ['2d-dp', 'space-optimized-dp'],
      requested: false,
      summary: 'Let dp[i][j] mean whether s3[:i + j] can be formed by interleaving s1[:i] and s2[:j].',
      instinct: 'Greedy matching is unreliable because either source string may supply the next character. Prefix DP works because the only thing that matters is how many characters have already been consumed from each source.',
      example: 'At state (i, j), you can come from (i - 1, j) if s1[i - 1] matches s3[i + j - 1], or from (i, j - 1) if s2[j - 1] matches. That turns a branching string question into a table of local checks.',
      signals: [
        'Two input strings jointly build one target string.',
        'The target index is determined by i + j, so no third dimension is needed.',
        'Like Edit Distance, the state only depends on the previous row and current row.',
      ],
      edgeCases: [
        'If lengths do not add up, return false immediately.',
        'Multiple matching choices are common, so avoid greedy one-path logic.',
        'Initialize the first row and first column carefully for pure-prefix matches.',
      ],
      complexity: 'Time O(mn); full-table space O(mn), or O(n) with row compression.',
    },
    {
      lc: 516,
      title: 'Longest Palindromic Subsequence',
      slug: 'longest-palindromic-subsequence',
      category: 'dynamic-programming',
      approaches: ['interval-dp'],
      requested: false,
      summary: 'Use intervals. If the ends match, keep them both. If not, drop one end and take the better interval.',
      instinct: 'Subsequence problems often ask you to reason from both ends inward. That is a strong hint that the natural state is an interval [i, j], not a running pointer from only one side.',
      example: 'If s[i] === s[j], then dp[i][j] = 2 + dp[i + 1][j - 1]. Otherwise dp[i][j] = max(dp[i + 1][j], dp[i][j - 1]). Filling intervals by increasing length guarantees smaller intervals are ready first.',
      signals: [
        'The decision depends on both ends of the current window.',
        'The prompt says subsequence, so skipping characters is allowed.',
        'Smaller intervals solve larger intervals cleanly.',
      ],
      edgeCases: [
        'A single character interval has answer 1.',
        'Two equal characters side by side should give 2.',
        'Fill the DP table by interval length, not left-to-right row order.',
      ],
      complexity: 'Time O(n^2), space O(n^2).',
    },
    {
      lc: 200,
      title: 'Number of Islands',
      slug: 'number-of-islands',
      category: 'graphs',
      approaches: ['dfs'],
      requested: true,
      summary: 'Each unseen land cell is the entrance to one connected component. Swallow that entire component immediately so you never count it twice.',
      instinct: 'The outer loop is not the real work. It only finds fresh starting points. The traversal is what maps the full island.',
      example: 'Scan the grid. When you hit an unvisited "1", increment the island count and launch an iterative DFS or BFS from that cell. Keep a manual stack called connected if you want to avoid recursion depth issues.',
      signals: [
        'The prompt is really asking for connected component counting.',
        'Grid adjacency defines an implicit graph.',
        'Repeated full exploration from each land cell would overcount unless visited state is tracked aggressively.',
      ],
      edgeCases: [
        'Only four-direction adjacency counts unless the problem says diagonals.',
        'An empty grid or empty first row should return 0.',
        'You can use a visited set or mutate the grid in place by sinking land.',
      ],
      complexity: 'Time O(mn); worst-case extra space O(mn) for stack plus visited, or O(1) extra if mutating the grid in place.',
    },
    {
      lc: 329,
      title: 'Longest Increasing Path in a Matrix',
      slug: 'longest-increasing-path-in-a-matrix',
      category: 'graphs',
      approaches: ['dfs'],
      requested: true,
      summary: 'Run DFS from every cell, but memoize the best path starting there. Strictly increasing moves turn the matrix into a DAG.',
      instinct: 'When every state can branch, but many branches revisit the same suffix, brute-force DFS is repeating work. Memoize the answer for each start cell once.',
      example: 'From each cell, try the four neighbors that are strictly larger. The answer at a cell is 1 + max(answer of valid larger neighbors). Because values must increase, you can never cycle back, so memoization is safe and powerful.',
      signals: [
        'The same cell can be reached from many smaller neighbors.',
        'Strictly increasing edges remove cycles and make the graph DAG-like.',
        'The problem asks for the best path starting anywhere, so every cell is a candidate start.',
      ],
      edgeCases: [
        'Equal-valued neighbors do not continue the path.',
        'Memoize per cell, not per full traversal path.',
        'A single cell is a valid path of length 1.',
      ],
      complexity: 'Time O(mn), space O(mn) for memo plus recursion stack in the worst case.',
    },
    {
      lc: 743,
      title: 'Network Delay Time',
      slug: 'network-delay-time',
      category: 'graphs',
      approaches: ['shortest-path', 'dijkstra', 'bellman-ford'],
      requested: true,
      summary: 'This is single-source shortest path on a directed weighted graph. Dijkstra is the fast default because all weights are nonnegative, but Bellman-Ford is the clean relaxation baseline.',
      instinct: 'The answer is not the first reach time from naive traversal. It is the maximum of the shortest arrival times from the source to every node.',
      example: 'Build an adjacency list from k. In Dijkstra, the min-heap always pops the node with the smallest currently-known distance. In Bellman-Ford, repeatedly relax every edge and keep improving distances until no better route remains or you finish V - 1 rounds.',
      signals: [
        'Weighted edges mean plain BFS is not enough.',
        'The final answer is max(dist[node]), not the sum of weights.',
        'Because weights are nonnegative, Dijkstra is safe and efficient.',
      ],
      edgeCases: [
        'If any node remains unreachable, return -1.',
        'Nodes are 1-indexed in the problem statement, so size your structures carefully.',
        'Bellman-Ford space is O(V); Dijkstra with adjacency lists uses O(V + E) space.',
      ],
      complexity: 'Dijkstra with a heap: time O((V + E) log V), space O(V + E). Bellman-Ford: time O(VE), space O(V).',
    },
    {
      lc: 787,
      title: 'Cheapest Flights Within K Stops',
      slug: 'cheapest-flights-within-k-stops',
      category: 'graphs',
      approaches: ['shortest-path', 'bellman-ford'],
      requested: false,
      summary: 'The stop bound means you must control how many edges have been used. Bellman-Ford style layering does that naturally.',
      instinct: 'Ordinary shortest-path intuition can break when path length in edges is constrained. The trick is to separate “best cost using at most t edges” from the next layer of updates.',
      example: 'Keep a copy of the previous distance array, then relax every flight into a fresh array exactly K + 1 times. That prevents an update from reusing another update from the same round and accidentally using too many stops.',
      signals: [
        'The phrase “at most K stops” is a big hint to think in layers.',
        'You need history from the previous round, not the partially updated current round.',
        'Repeated edge relaxation mirrors the edge-count constraint directly.',
      ],
      edgeCases: [
        'Use a backup array each round so one iteration equals one extra edge.',
        'If the destination stays infinite, return -1.',
        'K stops means at most K + 1 edges.',
      ],
      complexity: 'Layered Bellman-Ford: time O((K + 1)E), space O(V).',
    },
    {
      lc: 1631,
      title: 'Path With Minimum Effort',
      slug: 'path-with-minimum-effort',
      category: 'graphs',
      approaches: ['shortest-path', 'dijkstra'],
      requested: false,
      summary: 'Redefine the path cost. Here a path costs its worst edge, so Dijkstra minimizes the maximum jump seen so far.',
      instinct: 'The path metric is unusual, but it is still monotone: extending a path can only keep or increase its effort. That makes a Dijkstra-style best-first search valid.',
      example: 'When moving to a neighbor, the new effort is max(current effort, height difference). Push that into the min-heap. The first time you pop the destination, you have found the smallest possible maximum edge on any path.',
      signals: [
        'The objective is “minimize the worst step,” not “minimize the sum.”',
        'The state still obeys a best-first monotone property.',
        'A heap helps you finalize the current lowest-effort frontier first.',
      ],
      edgeCases: [
        'The start cell begins with effort 0.',
        'Do not sum edge costs; always take the max along the path.',
        'Skip stale heap entries whose effort is worse than the recorded best.',
      ],
      complexity: 'Time O(mn log(mn)), space O(mn).',
    },
    {
      lc: 287,
      title: 'Find the Duplicate Number',
      slug: 'find-the-duplicate-number',
      category: 'linked-lists',
      approaches: ['floyd-cycle', 'fast-slow'],
      requested: true,
      summary: 'Treat values as next pointers. The array becomes a linked list with a cycle, and the duplicate value is the cycle entrance.',
      instinct: 'The breakthrough is to stop seeing an array and start seeing pointer chasing. Because every value is in [1, n], each element points to another valid index.',
      example: 'Run slow = nums[slow] and fast = nums[nums[fast]] until they meet. Then reset one pointer to the start and move both one step at a time. Their next meeting point is the duplicate number.',
      signals: [
        'The values map cleanly to valid indices, which creates an implicit graph.',
        'The problem forbids modifying the array and wants O(1) extra space.',
        'A duplicate forces two paths to merge, which creates a cycle in the functional graph.',
      ],
      edgeCases: [
        'Start pointer movement from nums[0] / nums[nums[0]] or an equivalent consistent scheme.',
        'Do not sort or mark visited if the constraints forbid mutation or extra space.',
        'The duplicate can appear more than twice; the cycle argument still works.',
      ],
      complexity: 'Time O(n), space O(1).',
    },
    {
      lc: 142,
      title: 'Linked List Cycle II',
      slug: 'linked-list-cycle-ii',
      category: 'linked-lists',
      approaches: ['floyd-cycle', 'fast-slow'],
      requested: false,
      summary: 'Classic Floyd cycle entrance. After the collision, one pointer resets to head and both move one step at a time.',
      instinct: 'This problem teaches the same pointer geometry as Find the Duplicate Number, but on an explicit linked list instead of a hidden one.',
      example: 'First detect whether a cycle exists with fast and slow pointers. If they meet, reset slow to head. Move slow and fast one step together; the node where they meet next is the cycle start.',
      signals: [
        'You need the cycle entrance, not just a boolean cycle check.',
        'O(1) extra space rules out a visited set.',
        'A collision inside the cycle contains enough distance information to recover the entrance.',
      ],
      edgeCases: [
        'Handle the no-cycle case before phase two.',
        'Lists of length 0 or 1 cannot have a usable cycle entrance unless self-looped.',
        'Do not advance fast without checking fast and fast.next.',
      ],
      complexity: 'Time O(n), space O(1).',
    },
    {
      lc: 143,
      title: 'Reorder List',
      slug: 'reorder-list',
      category: 'linked-lists',
      approaches: ['fast-slow', 'reverse-and-merge'],
      requested: true,
      summary: 'Break the job into three phases: find the middle, reverse the second half, then zip the two halves together.',
      instinct: 'You cannot pull from both ends of a singly linked list directly. The clean workaround is to convert the back half into forward order by reversing it.',
      example: 'Use fast and slow to find the midpoint, cut the list, reverse the second half, then alternate nodes from the first and reversed second halves: L0 -> Ln -> L1 -> Ln-1 -> ...',
      signals: [
        'The target order alternates front and back, which is impossible with only forward traversal unless you reverse one side.',
        'Fast and slow pointers locate the split point cleanly.',
        'The final merge is just careful pointer weaving.',
      ],
      edgeCases: [
        'Cut the list at the midpoint before reversing or you can create cycles.',
        'Odd-length lists leave one extra node in the first half.',
        'Preserve next pointers before rewiring during the merge step.',
      ],
      complexity: 'Time O(n), extra space O(1).',
    },
    {
      lc: 234,
      title: 'Palindrome Linked List',
      slug: 'palindrome-linked-list',
      category: 'linked-lists',
      approaches: ['fast-slow', 'reverse-and-merge'],
      requested: false,
      summary: 'Find the middle, reverse the second half, and compare the two forward walks.',
      instinct: 'Comparing both ends of a singly linked list has the same obstacle as Reorder List: the back half must be reversed first.',
      example: 'Fast and slow pointers find the midpoint. Reverse the second half, compare node values from the head and from the reversed half, and optionally restore the list afterward if mutation matters.',
      signals: [
        'You need symmetric comparison on a one-way structure.',
        'The midpoint split is naturally handled by fast and slow pointers.',
        'Reversal converts a two-ended comparison into two forward scans.',
      ],
      edgeCases: [
        'For odd lengths, skip the exact middle before comparison.',
        'Be clear whether the interviewer cares about restoring the original list.',
        'Handle 0- or 1-node lists as trivially palindromic.',
      ],
      complexity: 'Time O(n), extra space O(1).',
    },
    {
      lc: 78,
      title: 'Subsets',
      slug: 'subsets',
      category: 'backtracking',
      approaches: ['iterative-cascading'],
      requested: true,
      summary: 'Every new number doubles the existing power set: keep all current subsets, then clone each one with the new number appended.',
      instinct: 'You do not always need a recursion tree. For the clean base subset problem, iterative cascading is often the simplest and most teachable mental model.',
      example: 'Start with [[]]. When you see 1, add [1]. When you see 2, duplicate all current subsets and append 2 to each duplicate. That directly mirrors the include-or-not choice without explicit recursion.',
      signals: [
        'The question asks for the full power set.',
        'Each element independently either appears or does not appear.',
        'The output naturally doubles with every new element.',
      ],
      edgeCases: [
        'The empty subset must be included.',
        'Because the output has size 2^n, output cost dominates for large n.',
        'A fresh copy is required before appending to avoid aliasing existing subsets.',
      ],
      complexity: 'Time O(n · 2^n), output space O(n · 2^n).',
    },
    {
      lc: 90,
      title: 'Subsets II',
      slug: 'subsets-ii',
      category: 'backtracking',
      approaches: ['iterative-cascading', 'backtracking'],
      requested: true,
      summary: 'Sort first. For duplicates, only extend the subsets created in the previous round so you do not regenerate the same subset.',
      instinct: 'The base Subsets idea still works, but duplicates mean you must control which old subsets are allowed to branch when you see the same value again.',
      example: 'After sorting, when nums[i] differs from nums[i - 1], extend every current subset. When it is equal, extend only the subsets created during the previous iteration. That prevents duplicate copies like [2] from being built twice.',
      signals: [
        'The duplicate values are the whole difficulty, so sorting is usually step one.',
        'You need a rule that distinguishes new subsets from old subsets.',
        'Backtracking solutions also work, but the iterative boundary trick is elegant.',
      ],
      edgeCases: [
        'Sorting is required before duplicate control works.',
        'The subset count is still exponential in the worst case.',
        'Do not append duplicates to all existing subsets when the current value matches the previous one.',
      ],
      complexity: 'Time O(n · 2^n), output space O(n · 2^n).',
    },
    {
      lc: 39,
      title: 'Combination Sum',
      slug: 'combination-sum',
      category: 'backtracking',
      approaches: ['backtracking'],
      requested: false,
      summary: 'The state is just “remaining target” plus “where I am allowed to start.” Stay on the same index if reuse is allowed.',
      instinct: 'Combination-building problems become manageable when each recursive call shrinks the remaining target and never revisits earlier candidates.',
      example: 'Sort if you want cleaner pruning. At candidate i, either take it and recurse with the same i because reuse is allowed, or skip it by moving to i + 1. The recursion tree mirrors the include/skip decision.',
      signals: [
        'The answer is a collection of combinations, not just a count.',
        'Candidates can be reused, so the index does not always advance after taking a number.',
        'Remaining target is the natural progress metric.',
      ],
      edgeCases: [
        'Stop the branch once the remaining target becomes negative.',
        'A remaining target of 0 means the current path is a full answer.',
        'Sorting is optional for correctness but useful for early pruning.',
      ],
      complexity: 'Time is output-sensitive and exponential in the number of valid combinations; recursion depth is O(target / minCandidate).',
    },
    {
      lc: 93,
      title: 'Restore IP Addresses',
      slug: 'restore-ip-addresses',
      category: 'backtracking',
      approaches: ['backtracking', 'string-parsing'],
      requested: false,
      summary: 'This is bounded parsing with pruning. Build exactly four segments and reject illegal chunks immediately.',
      instinct: 'The space of possible cuts looks large until you notice the structure is tiny: four parts, each length 1 to 3, each value 0 to 255, and no leading zeros except the single digit 0.',
      example: 'Backtrack by choosing the next segment length 1 to 3. Keep the segment only if it is within 0 to 255 and has no leading zero. Once you place four valid segments and consume the whole string, emit the IP address.',
      signals: [
        'The answer is a small structured format, not an unbounded partition problem.',
        'Most branches are invalid and should die immediately.',
        'Leading-zero rules are a parsing trap the interviewer expects you to mention.',
      ],
      edgeCases: [
        'Reject segments like 00, 01, and 256.',
        'You need exactly four segments and must consume the entire string.',
        'Because segment count is fixed, this search is effectively constant-sized under the problem constraints.',
      ],
      complexity: 'The search is bounded by the fixed four-segment structure; practically constant under the problem constraints, with recursion depth O(4).',
    },
    {
      lc: 306,
      title: 'Additive Number',
      slug: 'additive-number',
      category: 'strings',
      approaches: ['string-parsing', 'string-addition'],
      requested: true,
      summary: 'The first two numbers determine the rest. Enumerate only those two starting cuts, then validate the remaining suffix by repeated string addition.',
      instinct: 'Do not generate every partition of the string. Once the first two numbers are fixed, the entire additive sequence is forced.',
      example: 'Try every split for the first two numbers, reject illegal leading-zero cases like "02", then repeatedly check whether the remaining suffix starts with stringAdd(a, b). Using string arithmetic avoids overflow and keeps the parser faithful to the prompt.',
      signals: [
        'The structure is deterministic after the first two choices.',
        'Leading zeros are part of the real difficulty, not a minor detail.',
        'String addition is safer than converting huge substrings to integers.',
      ],
      edgeCases: [
        'The single digit "0" is valid, but values like "01" are not.',
        'You need at least three numbers in the final sequence.',
        'A startswith-style suffix check keeps the validation logic clean.',
      ],
      complexity: 'Worst-case time O(n^3) from choosing the first two cuts and validating the remaining suffix; extra space O(n) for recursive or iterative string construction.',
    },
    {
      lc: 67,
      title: 'Add Binary',
      slug: 'add-binary',
      category: 'strings',
      approaches: ['string-addition'],
      requested: true,
      summary: 'Simulate carry from right to left exactly like a hardware adder, but in base 2.',
      instinct: 'When the input is already a digit string, there is no need to convert the whole number. Just walk from the least significant bit, keep a carry, and build the answer backwards.',
      example: 'Read a and b from the end. At each step, sum carry + current bit from a + current bit from b, push sum % 2, and update carry = Math.floor(sum / 2). Reverse the accumulated digits at the end.',
      signals: [
        'You only need local digit information plus a carry.',
        'The shorter string can be treated as contributing 0 once it runs out.',
        'This is a simulation problem, not a parsing problem.',
      ],
      edgeCases: [
        'If one string is shorter, treat missing positions as 0.',
        'Append the final carry if it remains after the loop.',
        'Build the result backward or prepend carefully to avoid quadratic string cost.',
      ],
      complexity: 'Time O(max(m, n)), space O(max(m, n)).',
    },
    {
      lc: 415,
      title: 'Add Strings',
      slug: 'add-strings',
      category: 'strings',
      approaches: ['string-addition'],
      requested: false,
      summary: 'The same carry mechanic as Add Binary, but base 10 instead of base 2.',
      instinct: 'This is the decimal sibling of Add Binary and a good interview cross-check that you really understand the carry pattern instead of memorizing a binary-specific trick.',
      example: 'Walk from the end of both strings, sum digitA + digitB + carry, write sum % 10, and update carry = Math.floor(sum / 10). Reverse at the end.',
      signals: [
        'Numbers are given as strings, so whole-number conversion is discouraged or unsafe.',
        'Per-digit carry is the only state needed.',
        'This is the exact same mental model as manual arithmetic.',
      ],
      edgeCases: [
        'Different lengths are handled by treating missing digits as 0.',
        'Do not forget the leftover carry after the loop.',
        'Leading zeros are usually irrelevant to correctness but may appear in tests.',
      ],
      complexity: 'Time O(max(m, n)), space O(max(m, n)).',
    },
    {
      lc: 137,
      title: 'Single Number II',
      slug: 'single-number-ii',
      category: 'bit-manipulation',
      approaches: ['bit-counting'],
      requested: true,
      summary: 'Count each bit position modulo 3. The surviving bits belong to the number that appears once.',
      instinct: 'If every repeated value appears the same fixed number of times, counting whole values is overkill. Count each bit column independently.',
      example: 'For each of 32 bit positions, count how many numbers have that bit set. count % 3 reveals whether the single number has that bit. Reconstruct the answer bit by bit.',
      signals: [
        'The repetition pattern is uniform: every noise value appears exactly three times.',
        'Bit positions are independent, so a frequency map by full integer is not necessary.',
        'The modulo operation is the real invariant.',
      ],
      edgeCases: [
        'Negative numbers need sign handling in languages with fixed-width signed integers.',
        'Use a consistent bit width, usually 32 bits for this problem.',
        'Modulo must be applied per bit position, not to the whole sum of values.',
      ],
      complexity: 'Time O(32n), which is O(n); space O(1).',
    },
    {
      lc: 338,
      title: 'Counting Bits',
      slug: 'counting-bits',
      category: 'bit-manipulation',
      approaches: ['bit-counting'],
      requested: false,
      summary: 'Reuse previous answers: bits[i] = bits[i >> 1] + (i & 1).',
      instinct: 'The key is to notice that shifting right drops the least significant bit, so every answer can be built from a smaller answer you already know.',
      example: 'If i = 13 (1101), then i >> 1 = 6 (110). bits[13] is bits[6] plus 1 because the last bit of 13 is set. That turns the whole table into one pass.',
      signals: [
        'You need answers for every value from 0 through n, so reuse between neighbors matters.',
        'Bit shifting naturally exposes a recurrence.',
        'This is dynamic programming disguised as bit manipulation.',
      ],
      edgeCases: [
        'bits[0] must start at 0.',
        'Either recurrence bits[i] = bits[i >> 1] + (i & 1) or bits[i] = bits[i & (i - 1)] + 1 works.',
        'The output array itself dominates the space cost.',
      ],
      complexity: 'Time O(n), space O(n) for the output array.',
    },
    {
      lc: 208,
      title: 'Implement Trie (Prefix Tree)',
      slug: 'implement-trie-prefix-tree',
      category: 'trie',
      approaches: ['trie'],
      requested: false,
      summary: 'Store one node per prefix so insert, search, and startsWith all become simple character walks.',
      instinct: 'If many queries ask about shared prefixes, it is wasteful to store and rescan each full word independently.',
      example: 'Each node stores children by character plus an isWord flag. insert walks and creates nodes as needed, search requires the final node to be marked as a full word, and startsWith only cares that the prefix path exists.',
      signals: [
        'The operations are explicitly prefix-based.',
        'Multiple words share the same front segments.',
        'The data structure should make prefix existence cheap.',
      ],
      edgeCases: [
        'An inserted empty string is rare but conceptually means marking the root as a word.',
        'search and startsWith differ only in whether isWord must be true at the end.',
        'Space grows with the total number of characters stored across distinct prefixes.',
      ],
      complexity: 'Each operation is O(L) for word length L; total trie space is O(total stored characters).',
    },
    {
      lc: 212,
      title: 'Word Search II',
      slug: 'word-search-ii',
      category: 'trie',
      approaches: ['trie', 'dfs', 'backtracking'],
      requested: false,
      summary: 'Build a trie for the dictionary, then DFS the board while pruning the moment the current path is no longer a valid prefix.',
      instinct: 'Searching every word separately repeats the same prefix work over and over. A trie shares that work and lets failed paths die early.',
      example: 'Insert all words into a trie. From every board cell, DFS through adjacent cells while walking the trie in parallel. If the next character is missing in the trie, stop immediately. When a trie node marks a word, record it and optionally delete it to avoid duplicates.',
      signals: [
        'Many target words share prefixes.',
        'Board search branches heavily, so pruning quality matters more than raw DFS.',
        'The trie turns “does any word still match this prefix?” into an O(1)-ish child lookup.',
      ],
      edgeCases: [
        'Mark board cells as visited during the current path only.',
        'Deduplicate found words if multiple paths reach the same terminal word.',
        'Pruning trie branches after a word is found can improve runtime in practice.',
      ],
      complexity: 'Trie build: O(total word characters). Search worst case: O(mn · 4^L) for maximum word length L, with strong pruning in practice; extra space is the trie plus DFS path state.',
    },
  ];

  const CATEGORY_INDEX = new Map(CATEGORY_META.map((item, index) => [item.key, { ...item, order: index }]));
  const APPROACH_INDEX = new Map(APPROACH_META.map((item, index) => [item.key, { ...item, order: index }]));
  const CODE_BY_LC = window.interviewPrepCodeByLc || {};

  let activeCategory = 'all';
  let activeApproach = 'all';
  let searchTerm = '';
  let sortMode = 'featured';

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function problemUrl(problem) {
    return `https://leetcode.com/problems/${problem.slug}/`;
  }

  function problemCardId(problemOrLc) {
    const lc = typeof problemOrLc === 'object' ? problemOrLc.lc : problemOrLc;
    return `problem-lc-${lc}`;
  }

  function normalize(value) {
    return String(value || '').toLowerCase();
  }

  function getSearchInput() {
    return document.getElementById('interview-search');
  }

  function clearSearchInput() {
    const input = getSearchInput();
    if (input) input.value = '';
  }

  function countProblemsForCategory(categoryKey) {
    return PROBLEMS.filter((problem) => problem.category === categoryKey).length;
  }

  function countProblemsForApproach(approachKey) {
    return PROBLEMS.filter((problem) => problem.approaches.includes(approachKey)).length;
  }

  function buildSearchText(problem) {
    const category = CATEGORY_INDEX.get(problem.category);
    const approachLabels = problem.approaches
      .map((key) => APPROACH_INDEX.get(key))
      .filter(Boolean)
      .map((item) => item.label)
      .join(' ');

    return normalize([
      problem.title,
      `lc ${problem.lc}`,
      category ? category.label : '',
      approachLabels,
      problem.summary,
      problem.instinct,
      problem.example,
      problem.signals.join(' '),
      problem.edgeCases.join(' '),
      problem.complexity,
    ].join(' '));
  }

  function matchesFilters(problem) {
    if (activeCategory !== 'all' && problem.category !== activeCategory) return false;
    if (activeApproach !== 'all' && !problem.approaches.includes(activeApproach)) return false;
    if (searchTerm && !buildSearchText(problem).includes(searchTerm)) return false;
    return true;
  }

  function compareProblems(a, b) {
    if (sortMode === 'lc-asc') return a.lc - b.lc;
    if (sortMode === 'lc-desc') return b.lc - a.lc;
    if (sortMode === 'title') return a.title.localeCompare(b.title);
    if (sortMode === 'category') {
      const categoryCompare = CATEGORY_INDEX.get(a.category).order - CATEGORY_INDEX.get(b.category).order;
      if (categoryCompare !== 0) return categoryCompare;
      return a.lc - b.lc;
    }

    if (a.requested !== b.requested) return a.requested ? -1 : 1;

    const categoryCompare = CATEGORY_INDEX.get(a.category).order - CATEGORY_INDEX.get(b.category).order;
    if (categoryCompare !== 0) return categoryCompare;

    return a.lc - b.lc;
  }

  function buttonClasses(active, tone) {
    if (active) {
      return 'border-transparent bg-slate-900 text-white shadow-sm';
    }

    return tone === 'soft'
      ? 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white'
      : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50';
  }

  function renderExampleJumpButtons(problems, filterKind, filterKey, isActive) {
    const baseClasses = isActive
      ? 'border-white/20 bg-white/10 text-white hover:bg-white/15'
      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white';

    return problems.map((problem) => {
      return `<button type="button" data-filter-kind="${escapeHtml(filterKind)}" data-filter-key="${escapeHtml(filterKey)}" data-jump-lc="${escapeHtml(problem.lc)}" class="rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${baseClasses}">LC ${escapeHtml(problem.lc)} · ${escapeHtml(problem.title)}</button>`;
    }).join('');
  }

  function scrollToSection(targetId) {
    requestAnimationFrame(() => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  function highlightProblemCard(targetId) {
    const card = document.getElementById(targetId);
    if (!card) return;

    card.classList.add('ring-2', 'ring-teal-400', 'ring-offset-2');
    window.setTimeout(() => {
      card.classList.remove('ring-2', 'ring-teal-400', 'ring-offset-2');
    }, 1400);
  }

  function jumpToProblem(lc) {
    const targetId = problemCardId(lc);
    requestAnimationFrame(() => {
      const el = document.getElementById(targetId);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      highlightProblemCard(targetId);
    });
  }

  function renderCategorySummary() {
    const container = document.getElementById('interview-category-summary');
    if (!container) return;

    container.innerHTML = CATEGORY_META.map((category) => {
      const examples = PROBLEMS.filter((problem) => problem.category === category.key).slice(0, 3);
      const isActive = activeCategory === category.key;

      return `
        <article class="rounded-[1.75rem] border ${isActive ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-slate-200 bg-white text-slate-900 shadow-sm'} p-5 transition-colors">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] ${isActive ? 'text-slate-300' : 'text-slate-500'}">${escapeHtml(String(countProblemsForCategory(category.key)).padStart(2, '0'))} drills</p>
              <h3 class="mt-2 text-xl font-semibold">${escapeHtml(category.label)}</h3>
            </div>
            <button type="button" data-filter-kind="category" data-filter-key="${escapeHtml(category.key)}" data-scroll-target="problem-browser" class="rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${isActive ? 'border-white/30 bg-white/10 text-white hover:bg-white/15' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}">
              ${isActive ? 'Active' : 'See drills'}
            </button>
          </div>
          <p class="mt-3 text-sm leading-6 ${isActive ? 'text-slate-200' : 'text-slate-600'}">${escapeHtml(category.instinct)}</p>
          <p class="mt-4 text-xs font-medium uppercase tracking-[0.14em] ${isActive ? 'text-slate-300' : 'text-slate-500'}">Example set</p>
          <div class="mt-3 flex flex-wrap gap-2">
            ${renderExampleJumpButtons(examples, 'category', category.key, isActive)}
          </div>
        </article>
      `;
    }).join('');
  }

  function renderApproachSummary() {
    const container = document.getElementById('interview-approach-summary');
    if (!container) return;

    container.innerHTML = APPROACH_META.map((approach) => {
      const examples = PROBLEMS.filter((problem) => problem.approaches.includes(approach.key)).slice(0, 3);
      const isActive = activeApproach === approach.key;

      return `
        <article class="rounded-[1.75rem] border ${isActive ? 'border-teal-600 bg-teal-600 text-white shadow-lg' : 'border-slate-200 bg-white text-slate-900 shadow-sm'} p-5 transition-colors">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] ${isActive ? 'text-teal-100' : 'text-slate-500'}">${escapeHtml(String(countProblemsForApproach(approach.key)).padStart(2, '0'))} examples</p>
              <h3 class="mt-2 text-xl font-semibold">${escapeHtml(approach.label)}</h3>
            </div>
            <button type="button" data-filter-kind="approach" data-filter-key="${escapeHtml(approach.key)}" data-scroll-target="problem-browser" class="rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${isActive ? 'border-white/30 bg-white/10 text-white hover:bg-white/15' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}">
              ${isActive ? 'Active' : 'Focus'}
            </button>
          </div>
          <p class="mt-3 text-sm leading-6 ${isActive ? 'text-teal-50' : 'text-slate-600'}">${escapeHtml(approach.cue)}</p>
          <p class="mt-4 text-xs font-medium uppercase tracking-[0.14em] ${isActive ? 'text-teal-100' : 'text-slate-500'}">Example set</p>
          <div class="mt-3 flex flex-wrap gap-2">
            ${renderExampleJumpButtons(examples, 'approach', approach.key, isActive)}
          </div>
        </article>
      `;
    }).join('');
  }

  function renderFilters() {
    const categoryContainer = document.getElementById('interview-category-filters');
    const approachContainer = document.getElementById('interview-approach-filters');
    if (!categoryContainer || !approachContainer) return;

    const categoryButtons = [
      `<button type="button" data-filter-kind="category" data-filter-key="all" class="rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${buttonClasses(activeCategory === 'all')}">All categories <span class="ml-1 text-xs opacity-70">${PROBLEMS.length}</span></button>`,
    ].concat(CATEGORY_META.map((category) => {
      const count = countProblemsForCategory(category.key);
      return `<button type="button" data-filter-kind="category" data-filter-key="${escapeHtml(category.key)}" class="rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${buttonClasses(activeCategory === category.key)}">${escapeHtml(category.label)} <span class="ml-1 text-xs opacity-70">${count}</span></button>`;
    }));

    const approachButtons = [
      `<button type="button" data-filter-kind="approach" data-filter-key="all" class="rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${buttonClasses(activeApproach === 'all', 'soft')}">All approaches <span class="ml-1 text-xs opacity-70">${PROBLEMS.length}</span></button>`,
    ].concat(APPROACH_META.map((approach) => {
      const count = countProblemsForApproach(approach.key);
      return `<button type="button" data-filter-kind="approach" data-filter-key="${escapeHtml(approach.key)}" class="rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${buttonClasses(activeApproach === approach.key, 'soft')}">${escapeHtml(approach.label)} <span class="ml-1 text-xs opacity-70">${count}</span></button>`;
    }));

    categoryContainer.innerHTML = categoryButtons.join('');
    approachContainer.innerHTML = approachButtons.join('');
  }

  function renderProblemCard(problem) {
    const category = CATEGORY_INDEX.get(problem.category);
    const codeSnippet = CODE_BY_LC[problem.lc] || '# Example code is coming soon.';
    const approachChips = problem.approaches
      .map((key) => APPROACH_INDEX.get(key))
      .filter(Boolean)
      .map((approach) => {
        return `<button type="button" data-filter-kind="approach" data-filter-key="${escapeHtml(approach.key)}" class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-white">${escapeHtml(approach.label)}</button>`;
      })
      .join('');

    return `
      <article id="${escapeHtml(problemCardId(problem))}" class="rounded-[1.75rem] border ${problem.requested ? 'border-teal-200 bg-teal-50/40' : 'border-slate-200 bg-white'} p-5 shadow-sm transition-shadow">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="inline-flex items-center rounded-full ${problem.requested ? 'bg-teal-600 text-white' : 'bg-slate-900 text-white'} px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]">LC ${escapeHtml(problem.lc)}</span>
              ${problem.requested ? '<span class="inline-flex items-center rounded-full border border-teal-200 bg-white px-3 py-1 text-xs font-semibold text-teal-700">Requested anchor</span>' : ''}
            </div>
            <h3 class="mt-3 text-2xl font-semibold tracking-tight text-slate-950">${escapeHtml(problem.title)}</h3>
          </div>
          <div class="flex flex-wrap gap-2">
            <a href="${escapeHtml(problemUrl(problem))}" target="_blank" rel="noopener" class="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
              Official LeetCode
            </a>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <button type="button" data-filter-kind="category" data-filter-key="${escapeHtml(problem.category)}" class="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50">${escapeHtml(category.label)}</button>
          ${approachChips}
        </div>

        <div class="mt-5 space-y-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Core Move</p>
            <p class="mt-2 text-sm leading-6 text-slate-700">${escapeHtml(problem.summary)}</p>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Instinct</p>
            <p class="mt-2 text-sm leading-6 text-slate-700">${escapeHtml(problem.instinct)}</p>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Exemplary Walkthrough</p>
            <p class="mt-2 text-sm leading-6 text-slate-700">${escapeHtml(problem.example)}</p>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">What To Look For</p>
            <ul class="mt-2 space-y-2 text-sm leading-6 text-slate-700">
              ${problem.signals.map((item) => `<li class="flex gap-2"><span class="mt-[0.4rem] h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500"></span><span>${escapeHtml(item)}</span></li>`).join('')}
            </ul>
          </div>
        </div>

        <details class="mt-5 rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3">
          <summary class="cursor-pointer list-none text-sm font-semibold text-slate-900">
            Example code
          </summary>
          <div class="mt-4">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Python Reference</p>
            <pre class="mt-3 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100"><code>${escapeHtml(codeSnippet)}</code></pre>
          </div>
        </details>

        <details class="mt-4 rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3">
          <summary class="cursor-pointer list-none text-sm font-semibold text-slate-900">
            Edge cases and Big O
          </summary>
          <div class="mt-4 grid gap-4 lg:grid-cols-[1.15fr,0.85fr]">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Edge Cases</p>
              <ul class="mt-2 space-y-2 text-sm leading-6 text-slate-700">
                ${problem.edgeCases.map((item) => `<li class="flex gap-2"><span class="mt-[0.4rem] h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400"></span><span>${escapeHtml(item)}</span></li>`).join('')}
              </ul>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Complexity</p>
              <p class="mt-2 text-sm leading-6 text-slate-700">${escapeHtml(problem.complexity)}</p>
            </div>
          </div>
        </details>
      </article>
    `;
  }

  function renderProblems() {
    const container = document.getElementById('interview-problem-grid');
    const stats = document.getElementById('interview-result-stats');
    if (!container || !stats) return;

    const filtered = PROBLEMS.filter(matchesFilters).sort(compareProblems);
    const categoryText = activeCategory === 'all' ? 'all categories' : CATEGORY_INDEX.get(activeCategory).label;
    const approachText = activeApproach === 'all' ? 'all approaches' : APPROACH_INDEX.get(activeApproach).label;

    stats.textContent = `${filtered.length} of ${PROBLEMS.length} problems shown • ${categoryText} • ${approachText}`;

    if (!filtered.length) {
      container.innerHTML = `
        <div class="xl:col-span-2 rounded-[1.75rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p class="text-lg font-semibold text-slate-900">No drills match that combination yet.</p>
          <p class="mt-2 text-sm leading-6 text-slate-600">Try clearing one filter or searching for a broader keyword like "graph", "carry", "trie", or "dp".</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(renderProblemCard).join('');
  }

  function renderAll() {
    renderCategorySummary();
    renderApproachSummary();
    renderFilters();
    renderProblems();
  }

  function bindControls() {
    const root = document.querySelector('[data-page-root="interview-prep"]');
    if (!root || root.dataset.interviewPrepBound === 'true') return;
    root.dataset.interviewPrepBound = 'true';

    const search = getSearchInput();
    const sort = document.getElementById('interview-sort');
    if (search) {
      search.value = searchTerm;
      search.addEventListener('input', (event) => {
        searchTerm = normalize(event.target.value.trim());
        renderAll();
      });
    }

    if (sort) {
      sort.value = sortMode;
      sort.addEventListener('change', (event) => {
        sortMode = event.target.value || 'featured';
        renderAll();
      });
    }

    root.addEventListener('click', (event) => {
      const button = event.target.closest('[data-filter-kind],[data-jump-lc],[data-scroll-target]');
      if (!button || !root.contains(button)) return;

      const kind = button.getAttribute('data-filter-kind');
      const key = button.getAttribute('data-filter-key');
      const jumpLc = button.getAttribute('data-jump-lc');
      const scrollTarget = button.getAttribute('data-scroll-target');
      const isFocusedAction = Boolean(jumpLc || scrollTarget);

      if (kind && key) {
        if (isFocusedAction) {
          if (kind === 'category') {
            activeCategory = key;
            activeApproach = 'all';
          } else if (kind === 'approach') {
            activeApproach = key;
            activeCategory = 'all';
          }
          searchTerm = '';
          clearSearchInput();
        } else {
          if (kind === 'category') activeCategory = key;
          if (kind === 'approach') activeApproach = key;
        }
      }

      renderAll();

      if (jumpLc) {
        jumpToProblem(jumpLc);
        return;
      }

      if (scrollTarget) {
        scrollToSection(scrollTarget);
      }
    });
  }

  window.setupInterviewPrep = function setupInterviewPrep() {
    renderAll();
    bindControls();
  };
})();
