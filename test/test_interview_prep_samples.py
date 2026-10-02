import copy
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def read(rel_path):
    return (ROOT / rel_path).read_text(encoding="utf-8")


def extract_code_snippets():
    data = read("js/interview-prep-data.js")
    pattern = re.compile(r"^\s*(\d+): String\.raw`(.*?)`,?\s*(?=^\s*\d+:|^\s*};)", re.MULTILINE | re.DOTALL)
    snippets = {int(match.group(1)): match.group(2) for match in pattern.finditer(data)}
    return snippets


def extract_problem_lcs():
    page_js = read("js/interview-prep.js")
    return {int(value) for value in re.findall(r"^\s*lc:\s*(\d+),", page_js, re.MULTILINE)}


class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def linked_list(values):
    dummy = ListNode()
    tail = dummy
    nodes = []
    for value in values:
        tail.next = ListNode(value)
        tail = tail.next
        nodes.append(tail)
    return dummy.next, nodes


def to_list(head, limit=50):
    out = []
    seen = 0
    while head is not None and seen < limit:
        out.append(head.val)
        head = head.next
        seen += 1
    return out


def canonical_nested(items):
    return sorted(tuple(item) for item in items)


class InterviewPrepSampleTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.snippets = extract_code_snippets()

    def exec_snippet(self, lc):
        namespace = {"ListNode": ListNode, "TreeNode": TreeNode}
        exec(self.snippets[lc], namespace)
        return namespace

    def test_every_interview_problem_has_a_code_snippet(self):
        snippet_keys = set(self.snippets)
        problem_keys = extract_problem_lcs()
        self.assertEqual(snippet_keys, problem_keys)

    def test_sample_snippets_execute_on_representative_cases(self):
        cases = {
            3: self.check_3,
            15: self.check_15,
            33: self.check_33,
            39: self.check_39,
            55: self.check_55,
            56: self.check_56,
            67: self.check_67,
            72: self.check_72,
            78: self.check_78,
            90: self.check_90,
            93: self.check_93,
            97: self.check_97,
            98: self.check_98,
            102: self.check_102,
            1094: self.check_1094,
            137: self.check_137,
            146: self.check_146,
            142: self.check_142,
            143: self.check_143,
            200: self.check_200,
            207: self.check_207,
            208: self.check_208,
            212: self.check_212,
            234: self.check_234,
            253: self.check_253,
            287: self.check_287,
            307: self.check_307,
            306: self.check_306,
            312: self.check_312,
            329: self.check_329,
            338: self.check_338,
            347: self.check_347,
            415: self.check_415,
            516: self.check_516,
            560: self.check_560,
            684: self.check_684,
            739: self.check_739,
            743: self.check_743,
            787: self.check_787,
            875: self.check_875,
            973: self.check_973,
            981: self.check_981,
            994: self.check_994,
            1631: self.check_1631,
        }

        self.assertEqual(set(cases), set(self.snippets))

        for lc, checker in cases.items():
            with self.subTest(lc=lc):
                checker()

    def check_39(self):
        ns = self.exec_snippet(39)
        result = ns["combinationSum"]([2, 3, 6, 7], 7)
        self.assertEqual(canonical_nested(result), [(2, 2, 3), (7,)])

    def check_3(self):
        ns = self.exec_snippet(3)
        self.assertEqual(ns["lengthOfLongestSubstring"]("abcabcbb"), 3)
        self.assertEqual(ns["lengthOfLongestSubstring"]("bbbbb"), 1)
        self.assertEqual(ns["lengthOfLongestSubstring"](""), 0)

    def check_15(self):
        ns = self.exec_snippet(15)
        result = ns["threeSum"]([-1, 0, 1, 2, -1, -4])
        self.assertEqual(canonical_nested(result), [(-1, -1, 2), (-1, 0, 1)])

    def check_33(self):
        ns = self.exec_snippet(33)
        self.assertEqual(ns["search"]([4, 5, 6, 7, 0, 1, 2], 0), 4)
        self.assertEqual(ns["search"]([4, 5, 6, 7, 0, 1, 2], 3), -1)

    def check_67(self):
        ns = self.exec_snippet(67)
        self.assertEqual(ns["addBinary"]("11", "1"), "100")
        self.assertEqual(ns["addBinary"]("1010", "1011"), "10101")

    def check_55(self):
        ns = self.exec_snippet(55)
        self.assertTrue(ns["canJump"]([2, 3, 1, 1, 4]))
        self.assertFalse(ns["canJump"]([3, 2, 1, 0, 4]))

    def check_56(self):
        ns = self.exec_snippet(56)
        result = ns["merge"]([[1, 3], [2, 6], [8, 10], [15, 18]])
        self.assertEqual(result, [[1, 6], [8, 10], [15, 18]])

    def check_72(self):
        ns = self.exec_snippet(72)
        self.assertEqual(ns["minDistance"]("horse", "ros"), 3)
        self.assertEqual(ns["minDistance"]("", "abc"), 3)

    def check_78(self):
        ns = self.exec_snippet(78)
        result = ns["subsets"]([1, 2])
        self.assertEqual(canonical_nested(result), [(), (1,), (1, 2), (2,)])

    def check_90(self):
        ns = self.exec_snippet(90)
        result = ns["subsetsWithDup"]([1, 2, 2])
        self.assertEqual(canonical_nested(result), [(), (1,), (1, 2), (1, 2, 2), (2,), (2, 2)])

    def check_93(self):
        ns = self.exec_snippet(93)
        result = set(ns["restoreIpAddresses"]("25525511135"))
        self.assertEqual(result, {"255.255.11.135", "255.255.111.35"})

    def check_97(self):
        ns = self.exec_snippet(97)
        self.assertTrue(ns["isInterleave"]("aabcc", "dbbca", "aadbbcbcac"))
        self.assertFalse(ns["isInterleave"]("aabcc", "dbbca", "aadbbbaccc"))

    def check_137(self):
        ns = self.exec_snippet(137)
        self.assertEqual(ns["singleNumber"]([2, 2, 3, 2]), 3)
        self.assertEqual(ns["singleNumber"]([-2, -2, -2, -7]), -7)

    def check_1094(self):
        ns = self.exec_snippet(1094)
        trips = [[2, 1, 5], [3, 3, 7]]
        self.assertFalse(ns["carPooling"](trips, 4))
        self.assertTrue(ns["carPooling"](trips, 5))

    def check_98(self):
        ns = self.exec_snippet(98)
        valid = TreeNode(2, TreeNode(1), TreeNode(3))
        invalid = TreeNode(5, TreeNode(1), TreeNode(4, TreeNode(3), TreeNode(6)))
        self.assertTrue(ns["isValidBST"](valid))
        self.assertFalse(ns["isValidBST"](invalid))

    def check_102(self):
        ns = self.exec_snippet(102)
        root = TreeNode(3)
        root.left = TreeNode(9)
        root.right = TreeNode(20, TreeNode(15), TreeNode(7))
        self.assertEqual(ns["levelOrder"](root), [[3], [9, 20], [15, 7]])

    def check_146(self):
        ns = self.exec_snippet(146)
        cache = ns["LRUCache"](2)
        cache.put(1, 1)
        cache.put(2, 2)
        self.assertEqual(cache.get(1), 1)
        cache.put(3, 3)
        self.assertEqual(cache.get(2), -1)
        cache.put(4, 4)
        self.assertEqual(cache.get(1), -1)
        self.assertEqual(cache.get(3), 3)
        self.assertEqual(cache.get(4), 4)

    def check_142(self):
        ns = self.exec_snippet(142)
        head, nodes = linked_list([3, 2, 0, -4])
        nodes[-1].next = nodes[1]
        self.assertIs(ns["detectCycle"](head), nodes[1])

    def check_143(self):
        ns = self.exec_snippet(143)
        head, _ = linked_list([1, 2, 3, 4])
        ns["reorderList"](head)
        self.assertEqual(to_list(head), [1, 4, 2, 3])

    def check_200(self):
        ns = self.exec_snippet(200)
        grid = [
            ["1", "1", "0", "0", "0"],
            ["1", "1", "0", "0", "0"],
            ["0", "0", "1", "0", "0"],
            ["0", "0", "0", "1", "1"],
        ]
        self.assertEqual(ns["numIslands"](copy.deepcopy(grid)), 3)

    def check_207(self):
        ns = self.exec_snippet(207)
        self.assertTrue(ns["canFinish"](2, [[1, 0]]))
        self.assertFalse(ns["canFinish"](2, [[1, 0], [0, 1]]))

    def check_208(self):
        ns = self.exec_snippet(208)
        trie = ns["Trie"]()
        trie.insert("apple")
        self.assertTrue(trie.search("apple"))
        self.assertFalse(trie.search("app"))
        self.assertTrue(trie.startsWith("app"))
        trie.insert("app")
        self.assertTrue(trie.search("app"))

    def check_212(self):
        ns = self.exec_snippet(212)
        board = [
            ["o", "a", "a", "n"],
            ["e", "t", "a", "e"],
            ["i", "h", "k", "r"],
            ["i", "f", "l", "v"],
        ]
        words = ["oath", "pea", "eat", "rain"]
        self.assertEqual(set(ns["findWords"](copy.deepcopy(board), words)), {"oath", "eat"})

    def check_234(self):
        ns = self.exec_snippet(234)
        head, _ = linked_list([1, 2, 2, 1])
        self.assertTrue(ns["isPalindrome"](head))
        head, _ = linked_list([1, 2])
        self.assertFalse(ns["isPalindrome"](head))

    def check_253(self):
        ns = self.exec_snippet(253)
        intervals = [[0, 30], [5, 10], [15, 20]]
        self.assertEqual(ns["minMeetingRooms"](intervals), 2)

    def check_287(self):
        ns = self.exec_snippet(287)
        self.assertEqual(ns["findDuplicate"]([1, 3, 4, 2, 2]), 2)

    def check_307(self):
        ns = self.exec_snippet(307)
        arr = ns["NumArray"]([1, 3, 5])
        self.assertEqual(arr.sumRange(0, 2), 9)
        arr.update(1, 2)
        self.assertEqual(arr.sumRange(0, 2), 8)
        self.assertEqual(arr.sumRange(1, 1), 2)

    def check_306(self):
        ns = self.exec_snippet(306)
        self.assertTrue(ns["isAdditiveNumber"]("112358"))
        self.assertFalse(ns["isAdditiveNumber"]("1023"))

    def check_312(self):
        ns = self.exec_snippet(312)
        self.assertEqual(ns["maxCoins"]([3, 1, 5, 8]), 167)

    def check_329(self):
        ns = self.exec_snippet(329)
        matrix = [[9, 9, 4], [6, 6, 8], [2, 1, 1]]
        self.assertEqual(ns["longestIncreasingPath"](matrix), 4)

    def check_338(self):
        ns = self.exec_snippet(338)
        self.assertEqual(ns["countBits"](5), [0, 1, 1, 2, 1, 2])

    def check_347(self):
        ns = self.exec_snippet(347)
        result = ns["topKFrequent"]([1, 1, 1, 2, 2, 3], 2)
        self.assertEqual(set(result), {1, 2})
        self.assertEqual(len(result), 2)

    def check_415(self):
        ns = self.exec_snippet(415)
        self.assertEqual(ns["addStrings"]("456", "77"), "533")

    def check_516(self):
        ns = self.exec_snippet(516)
        self.assertEqual(ns["longestPalindromeSubseq"]("bbbab"), 4)

    def check_560(self):
        ns = self.exec_snippet(560)
        self.assertEqual(ns["subarraySum"]([1, 1, 1], 2), 2)
        self.assertEqual(ns["subarraySum"]([1, 2, 3], 3), 2)

    def check_684(self):
        ns = self.exec_snippet(684)
        self.assertEqual(ns["findRedundantConnection"]([[1, 2], [1, 3], [2, 3]]), [2, 3])

    def check_739(self):
        ns = self.exec_snippet(739)
        temps = [73, 74, 75, 71, 69, 72, 76, 73]
        self.assertEqual(ns["dailyTemperatures"](temps), [1, 1, 4, 2, 1, 1, 0, 0])

    def check_743(self):
        ns = self.exec_snippet(743)
        times = [[2, 1, 1], [2, 3, 1], [3, 4, 1]]
        self.assertEqual(ns["networkDelayTime"](times, 4, 2), 2)

    def check_787(self):
        ns = self.exec_snippet(787)
        flights = [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]]
        self.assertEqual(ns["findCheapestPrice"](4, flights, 0, 3, 1), 700)

    def check_875(self):
        ns = self.exec_snippet(875)
        self.assertEqual(ns["minEatingSpeed"]([3, 6, 7, 11], 8), 4)

    def check_973(self):
        ns = self.exec_snippet(973)
        points = [[1, 3], [-2, 2], [2, -2]]
        result = ns["kClosest"]([point[:] for point in points], 2)
        self.assertEqual({tuple(point) for point in result}, {(-2, 2), (2, -2)})

    def check_981(self):
        ns = self.exec_snippet(981)
        store = ns["TimeMap"]()
        store.set("foo", "bar", 1)
        self.assertEqual(store.get("foo", 1), "bar")
        self.assertEqual(store.get("foo", 3), "bar")
        store.set("foo", "bar2", 4)
        self.assertEqual(store.get("foo", 4), "bar2")
        self.assertEqual(store.get("foo", 5), "bar2")

    def check_994(self):
        ns = self.exec_snippet(994)
        grid = [[2, 1, 1], [1, 1, 0], [0, 1, 1]]
        self.assertEqual(ns["orangesRotting"](copy.deepcopy(grid)), 4)

    def check_1631(self):
        ns = self.exec_snippet(1631)
        heights = [[1, 2, 2], [3, 8, 2], [5, 3, 5]]
        self.assertEqual(ns["minimumEffortPath"](heights), 2)


if __name__ == "__main__":
    unittest.main()
