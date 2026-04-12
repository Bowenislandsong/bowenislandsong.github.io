(function () {
  'use strict';

  window.interviewPrepCodeByLc = {
    3: String.raw`def lengthOfLongestSubstring(s):
    last_seen = {}
    left = 0
    best = 0

    for right, ch in enumerate(s):
        if ch in last_seen and last_seen[ch] >= left:
            left = last_seen[ch] + 1
        last_seen[ch] = right
        best = max(best, right - left + 1)

    return best`,
    15: String.raw`def threeSum(nums):
    nums.sort()
    result = []

    for i, value in enumerate(nums):
        if i > 0 and value == nums[i - 1]:
            continue
        if value > 0:
            break

        left, right = i + 1, len(nums) - 1
        while left < right:
            total = value + nums[left] + nums[right]
            if total < 0:
                left += 1
            elif total > 0:
                right -= 1
            else:
                result.append([value, nums[left], nums[right]])
                left += 1
                right -= 1

                while left < right and nums[left] == nums[left - 1]:
                    left += 1
                while left < right and nums[right] == nums[right + 1]:
                    right -= 1

    return result`,
    33: String.raw`def search(nums, target):
    left, right = 0, len(nums) - 1

    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid

        if nums[left] <= nums[mid]:
            if nums[left] <= target < nums[mid]:
                right = mid - 1
            else:
                left = mid + 1
        else:
            if nums[mid] < target <= nums[right]:
                left = mid + 1
            else:
                right = mid - 1

    return -1`,
    55: String.raw`def canJump(nums):
    furthest = 0

    for index, jump in enumerate(nums):
        if index > furthest:
            return False
        furthest = max(furthest, index + jump)

    return True`,
    56: String.raw`def merge(intervals):
    if not intervals:
        return []

    intervals.sort(key=lambda interval: interval[0])
    merged = [intervals[0][:]]

    for start, end in intervals[1:]:
        if start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])

    return merged`,
    39: String.raw`def combinationSum(candidates, target):
    result = []
    candidates.sort()

    def dfs(start, remaining, path):
        if remaining == 0:
            result.append(path[:])
            return

        for i in range(start, len(candidates)):
            value = candidates[i]
            if value > remaining:
                break

            path.append(value)
            dfs(i, remaining - value, path)
            path.pop()

    dfs(0, target, [])
    return result`,
    67: String.raw`def addBinary(a, b):
    i = len(a) - 1
    j = len(b) - 1
    carry = 0
    out = []

    while i >= 0 or j >= 0 or carry:
        total = carry
        if i >= 0:
            total += int(a[i])
            i -= 1
        if j >= 0:
            total += int(b[j])
            j -= 1

        out.append(str(total % 2))
        carry = total // 2

    return ''.join(reversed(out))`,
    72: String.raw`def minDistance(word1, word2):
    prev = list(range(len(word2) + 1))

    for i, c1 in enumerate(word1, 1):
        curr = [i] + [0] * len(word2)
        for j, c2 in enumerate(word2, 1):
            if c1 == c2:
                curr[j] = prev[j - 1]
            else:
                curr[j] = 1 + min(
                    prev[j],      # delete
                    curr[j - 1],  # insert
                    prev[j - 1],  # replace
                )
        prev = curr

    return prev[-1]`,
    78: String.raw`def subsets(nums):
    result = [[]]

    for num in nums:
        additions = [subset + [num] for subset in result]
        result.extend(additions)

    return result`,
    90: String.raw`def subsetsWithDup(nums):
    nums.sort()
    result = [[]]
    start = 0

    for i, num in enumerate(nums):
        if i > 0 and nums[i] == nums[i - 1]:
            base = result[start:]
        else:
            base = result[:]

        start = len(result)
        for subset in base:
            result.append(subset + [num])

    return result`,
    93: String.raw`def restoreIpAddresses(s):
    result = []

    def valid(part):
        if len(part) > 1 and part[0] == '0':
            return False
        return int(part) <= 255

    def dfs(index, parts, path):
        if parts == 4:
            if index == len(s):
                result.append('.'.join(path))
            return

        for length in range(1, 4):
            if index + length > len(s):
                break

            part = s[index:index + length]
            if not valid(part):
                continue

            path.append(part)
            dfs(index + length, parts + 1, path)
            path.pop()

    dfs(0, 0, [])
    return result`,
    97: String.raw`def isInterleave(s1, s2, s3):
    if len(s1) + len(s2) != len(s3):
        return False

    dp = [False] * (len(s2) + 1)
    dp[0] = True

    for j in range(1, len(s2) + 1):
        dp[j] = dp[j - 1] and s2[j - 1] == s3[j - 1]

    for i in range(1, len(s1) + 1):
        dp[0] = dp[0] and s1[i - 1] == s3[i - 1]
        for j in range(1, len(s2) + 1):
            take_s1 = dp[j] and s1[i - 1] == s3[i + j - 1]
            take_s2 = dp[j - 1] and s2[j - 1] == s3[i + j - 1]
            dp[j] = take_s1 or take_s2

    return dp[-1]`,
    98: String.raw`def isValidBST(root):
    def dfs(node, low, high):
        if node is None:
            return True
        if not (low < node.val < high):
            return False
        return dfs(node.left, low, node.val) and dfs(node.right, node.val, high)

    return dfs(root, float('-inf'), float('inf'))`,
    102: String.raw`from collections import deque


def levelOrder(root):
    if root is None:
        return []

    queue = deque([root])
    result = []

    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left is not None:
                queue.append(node.left)
            if node.right is not None:
                queue.append(node.right)
        result.append(level)

    return result`,
    137: String.raw`def singleNumber(nums):
    answer = 0

    for bit in range(32):
        total = sum((num >> bit) & 1 for num in nums)
        if total % 3:
            answer |= 1 << bit

    if answer >= 1 << 31:
        answer -= 1 << 32

    return answer`,
    146: String.raw`from collections import OrderedDict


class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = OrderedDict()

    def get(self, key):
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key, value):
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value

        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)`,
    142: String.raw`def detectCycle(head):
    slow = fast = head

    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            break
    else:
        return None

    slow = head
    while slow != fast:
        slow = slow.next
        fast = fast.next

    return slow`,
    143: String.raw`def reorderList(head):
    if not head or not head.next:
        return

    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next

    second = slow.next
    slow.next = None

    prev = None
    while second:
        nxt = second.next
        second.next = prev
        prev = second
        second = nxt

    first, second = head, prev
    while second:
        next_first = first.next
        next_second = second.next

        first.next = second
        second.next = next_first

        first = next_first
        second = next_second`,
    200: String.raw`def numIslands(grid):
    if not grid or not grid[0]:
        return 0

    rows, cols = len(grid), len(grid[0])
    seen = set()
    islands = 0

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] != '1' or (r, c) in seen:
                continue

            islands += 1
            stack = [(r, c)]
            seen.add((r, c))

            while stack:
                cr, cc = stack.pop()
                for nr, nc in ((cr + 1, cc), (cr - 1, cc), (cr, cc + 1), (cr, cc - 1)):
                    if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == '1' and (nr, nc) not in seen:
                        seen.add((nr, nc))
                        stack.append((nr, nc))

    return islands`,
    207: String.raw`from collections import defaultdict, deque


def canFinish(numCourses, prerequisites):
    graph = defaultdict(list)
    indegree = [0] * numCourses

    for course, prereq in prerequisites:
        graph[prereq].append(course)
        indegree[course] += 1

    queue = deque([course for course in range(numCourses) if indegree[course] == 0])
    completed = 0

    while queue:
        course = queue.popleft()
        completed += 1
        for nxt in graph[course]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                queue.append(nxt)

    return completed == numCourses`,
    208: String.raw`class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_word = False


class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_word = True

    def _walk(self, prefix):
        node = self.root
        for ch in prefix:
            if ch not in node.children:
                return None
            node = node.children[ch]
        return node

    def search(self, word):
        node = self._walk(word)
        return bool(node and node.is_word)

    def startsWith(self, prefix):
        return self._walk(prefix) is not None`,
    212: String.raw`def findWords(board, words):
    trie = {}
    END = '#'
    for word in words:
        node = trie
        for ch in word:
            node = node.setdefault(ch, {})
        node[END] = word

    rows, cols = len(board), len(board[0])
    found = []

    def dfs(r, c, parent):
        ch = board[r][c]
        if ch not in parent:
            return

        node = parent[ch]
        word = node.pop(END, None)
        if word is not None:
            found.append(word)

        board[r][c] = '*'
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] != '*':
                dfs(nr, nc, node)
        board[r][c] = ch

        if not node:
            parent.pop(ch)

    for r in range(rows):
        for c in range(cols):
            dfs(r, c, trie)

    return found`,
    234: String.raw`def isPalindrome(head):
    if not head or not head.next:
        return True

    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next

    prev = None
    while slow:
        nxt = slow.next
        slow.next = prev
        prev = slow
        slow = nxt

    left, right = head, prev
    while right:
        if left.val != right.val:
            return False
        left = left.next
        right = right.next

    return True`,
    253: String.raw`def minMeetingRooms(intervals):
    if not intervals:
        return 0

    starts = sorted(start for start, _ in intervals)
    ends = sorted(end for _, end in intervals)

    rooms = 0
    best = 0
    end_ptr = 0

    for start in starts:
        while end_ptr < len(ends) and start >= ends[end_ptr]:
            rooms -= 1
            end_ptr += 1
        rooms += 1
        best = max(best, rooms)

    return best`,
    287: String.raw`def findDuplicate(nums):
    slow = nums[0]
    fast = nums[nums[0]]

    while slow != fast:
        slow = nums[slow]
        fast = nums[nums[fast]]

    slow = 0
    while slow != fast:
        slow = nums[slow]
        fast = nums[fast]

    return slow`,
    307: String.raw`class NumArray:
    def __init__(self, nums):
        self.n = len(nums)
        self.nums = nums[:]
        self.bit = [0] * (self.n + 1)
        for index, value in enumerate(nums, 1):
            self._add(index, value)

    def _add(self, index, delta):
        while index <= self.n:
            self.bit[index] += delta
            index += index & -index

    def _prefix_sum(self, index):
        total = 0
        while index > 0:
            total += self.bit[index]
            index -= index & -index
        return total

    def update(self, index, val):
        delta = val - self.nums[index]
        self.nums[index] = val
        self._add(index + 1, delta)

    def sumRange(self, left, right):
        return self._prefix_sum(right + 1) - self._prefix_sum(left)`,
    306: String.raw`def isAdditiveNumber(num):
    def add_strings(a, b):
        i = len(a) - 1
        j = len(b) - 1
        carry = 0
        out = []

        while i >= 0 or j >= 0 or carry:
            total = carry
            if i >= 0:
                total += ord(a[i]) - ord('0')
                i -= 1
            if j >= 0:
                total += ord(b[j]) - ord('0')
                j -= 1
            out.append(str(total % 10))
            carry = total // 10

        return ''.join(reversed(out))

    def valid(first, second, rest):
        while rest:
            third = add_strings(first, second)
            if not rest.startswith(third):
                return False
            first, second = second, third
            rest = rest[len(third):]
        return True

    n = len(num)
    for i in range(1, n):
        first = num[:i]
        if len(first) > 1 and first[0] == '0':
            break

        for j in range(i + 1, n):
            second = num[i:j]
            if len(second) > 1 and second[0] == '0':
                break
            if valid(first, second, num[j:]):
                return True

    return False`,
    312: String.raw`def maxCoins(nums):
    balloons = [1] + nums + [1]
    n = len(balloons)
    dp = [[0] * n for _ in range(n)]

    for length in range(2, n):
        for left in range(n - length):
            right = left + length
            for k in range(left + 1, right):
                dp[left][right] = max(
                    dp[left][right],
                    dp[left][k] + dp[k][right] + balloons[left] * balloons[k] * balloons[right],
                )

    return dp[0][n - 1]`,
    329: String.raw`from functools import lru_cache


def longestIncreasingPath(matrix):
    rows, cols = len(matrix), len(matrix[0])

    @lru_cache(None)
    def dfs(r, c):
        best = 1
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < rows and 0 <= nc < cols and matrix[nr][nc] > matrix[r][c]:
                best = max(best, 1 + dfs(nr, nc))
        return best

    return max(dfs(r, c) for r in range(rows) for c in range(cols))`,
    338: String.raw`def countBits(n):
    bits = [0] * (n + 1)
    for value in range(1, n + 1):
        bits[value] = bits[value >> 1] + (value & 1)
    return bits`,
    347: String.raw`import heapq
from collections import Counter


def topKFrequent(nums, k):
    counts = Counter(nums)
    heap = []

    for value, freq in counts.items():
        heapq.heappush(heap, (freq, value))
        if len(heap) > k:
            heapq.heappop(heap)

    return [value for _, value in heap]`,
    415: String.raw`def addStrings(num1, num2):
    i = len(num1) - 1
    j = len(num2) - 1
    carry = 0
    out = []

    while i >= 0 or j >= 0 or carry:
        total = carry
        if i >= 0:
            total += ord(num1[i]) - ord('0')
            i -= 1
        if j >= 0:
            total += ord(num2[j]) - ord('0')
            j -= 1

        out.append(str(total % 10))
        carry = total // 10

    return ''.join(reversed(out))`,
    516: String.raw`def longestPalindromeSubseq(s):
    n = len(s)
    dp = [[0] * n for _ in range(n)]

    for i in range(n - 1, -1, -1):
        dp[i][i] = 1
        for j in range(i + 1, n):
            if s[i] == s[j]:
                dp[i][j] = 2 + dp[i + 1][j - 1]
            else:
                dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])

    return dp[0][n - 1]`,
    560: String.raw`from collections import defaultdict


def subarraySum(nums, k):
    prefix_counts = defaultdict(int)
    prefix_counts[0] = 1

    prefix = 0
    total = 0
    for num in nums:
        prefix += num
        total += prefix_counts[prefix - k]
        prefix_counts[prefix] += 1

    return total`,
    684: String.raw`def findRedundantConnection(edges):
    parent = list(range(len(edges) + 1))
    rank = [0] * (len(edges) + 1)

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(a, b):
        root_a = find(a)
        root_b = find(b)
        if root_a == root_b:
            return False

        if rank[root_a] < rank[root_b]:
            root_a, root_b = root_b, root_a
        parent[root_b] = root_a
        if rank[root_a] == rank[root_b]:
            rank[root_a] += 1
        return True

    for a, b in edges:
        if not union(a, b):
            return [a, b]`,
    739: String.raw`def dailyTemperatures(temperatures):
    answer = [0] * len(temperatures)
    stack = []

    for index, temperature in enumerate(temperatures):
        while stack and temperature > temperatures[stack[-1]]:
            prev = stack.pop()
            answer[prev] = index - prev
        stack.append(index)

    return answer`,
    743: String.raw`import heapq
from collections import defaultdict


def networkDelayTime(times, n, k):
    graph = defaultdict(list)
    for src, dst, weight in times:
        graph[src].append((dst, weight))

    dist = {k: 0}
    heap = [(0, k)]

    while heap:
        time, node = heapq.heappop(heap)
        if time > dist.get(node, float('inf')):
            continue

        for nxt, weight in graph[node]:
            cand = time + weight
            if cand < dist.get(nxt, float('inf')):
                dist[nxt] = cand
                heapq.heappush(heap, (cand, nxt))

    if len(dist) != n:
        return -1
    return max(dist.values())`,
    787: String.raw`def findCheapestPrice(n, flights, src, dst, k):
    dist = [float('inf')] * n
    dist[src] = 0

    for _ in range(k + 1):
        next_dist = dist[:]
        for start, end, price in flights:
            if dist[start] == float('inf'):
                continue
            next_dist[end] = min(next_dist[end], dist[start] + price)
        dist = next_dist

    return -1 if dist[dst] == float('inf') else dist[dst]`,
    875: String.raw`def minEatingSpeed(piles, h):
    left, right = 1, max(piles)

    def hours_needed(speed):
        return sum((pile + speed - 1) // speed for pile in piles)

    while left < right:
        mid = (left + right) // 2
        if hours_needed(mid) <= h:
            right = mid
        else:
            left = mid + 1

    return left`,
    973: String.raw`def kClosest(points, k):
    def distance(index):
        x, y = points[index]
        return x * x + y * y

    def partition(left, right, pivot_index):
        pivot_distance = distance(pivot_index)
        points[pivot_index], points[right] = points[right], points[pivot_index]
        store = left

        for index in range(left, right):
            if distance(index) <= pivot_distance:
                points[store], points[index] = points[index], points[store]
                store += 1

        points[store], points[right] = points[right], points[store]
        return store

    left, right = 0, len(points) - 1
    target = k - 1

    while left <= right:
        pivot_index = (left + right) // 2
        pivot_index = partition(left, right, pivot_index)
        if pivot_index == target:
            break
        if pivot_index < target:
            left = pivot_index + 1
        else:
            right = pivot_index - 1

    return points[:k]`,
    981: String.raw`from collections import defaultdict


class TimeMap:
    def __init__(self):
        self.store = defaultdict(list)

    def set(self, key, value, timestamp):
        self.store[key].append((timestamp, value))

    def get(self, key, timestamp):
        items = self.store.get(key, [])
        left, right = 0, len(items) - 1
        answer = ''

        while left <= right:
            mid = (left + right) // 2
            if items[mid][0] <= timestamp:
                answer = items[mid][1]
                left = mid + 1
            else:
                right = mid - 1

        return answer`,
    994: String.raw`from collections import deque


def orangesRotting(grid):
    rows, cols = len(grid), len(grid[0])
    queue = deque()
    fresh = 0

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                queue.append((r, c, 0))
            elif grid[r][c] == 1:
                fresh += 1

    minutes = 0
    while queue:
        r, c, dist = queue.popleft()
        minutes = max(minutes, dist)
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                grid[nr][nc] = 2
                fresh -= 1
                queue.append((nr, nc, dist + 1))

    return -1 if fresh else minutes`,
    1094: String.raw`def carPooling(trips, capacity):
    events = []
    for passengers, start, end in trips:
        events.append((start, passengers))
        events.append((end, -passengers))

    events.sort(key=lambda event: (event[0], event[1]))

    load = 0
    for _, delta in events:
        load += delta
        if load > capacity:
            return False

    return True`,
    1631: String.raw`import heapq


def minimumEffortPath(heights):
    rows, cols = len(heights), len(heights[0])
    best = [[float('inf')] * cols for _ in range(rows)]
    best[0][0] = 0
    heap = [(0, 0, 0)]

    while heap:
        effort, r, c = heapq.heappop(heap)
        if (r, c) == (rows - 1, cols - 1):
            return effort
        if effort > best[r][c]:
            continue

        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < rows and 0 <= nc < cols:
                step = abs(heights[nr][nc] - heights[r][c])
                cand = max(effort, step)
                if cand < best[nr][nc]:
                    best[nr][nc] = cand
                    heapq.heappush(heap, (cand, nr, nc))

    return 0`,
  };
})();
