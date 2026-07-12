# Tries (Prefix Trees)

## Pattern Explanation
A Trie (pronounced "try") is a tree-like data structure used to efficiently store and retrieve keys in a dataset of strings. It's often called a prefix tree because all descendants of a node have a common prefix of the string associated with that node.

## When to use it
- The problem involves prefix matching (e.g., autocomplete systems).
- Finding words in a dictionary (e.g., Word Search II).
- When you have a large set of strings and need fast search, insertion, and prefix operations. A Trie can be more space-efficient than a Hash Set if many words share prefixes.

## Worked Example: Implement Trie (Prefix Tree)
**Problem:** Implement a Trie class with `insert`, `search`, and `startsWith` methods.

**Code:**
```python
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end_of_word = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        current = self.root
        for char in word:
            if char not in current.children:
                current.children[char] = TrieNode()
            current = current.children[char]
        current.is_end_of_word = True

    def search(self, word: str) -> bool:
        current = self.root
        for char in word:
            if char not in current.children:
                return False
            current = current.children[char]
        return current.is_end_of_word

    def startsWith(self, prefix: str) -> bool:
        current = self.root
        for char in prefix:
            if char not in current.children:
                return False
            current = current.children[char]
        return True
```

## Common Pitfalls
- **Memory Overhead:** Each node contains a dictionary of children. For character sets like ASCII, an array of size 26 or 256 can be used instead of a hash map to speed up lookups, but it consumes more memory if the tree is sparse.
- **Forgetting the End Marker:** Forgetting to set `is_end_of_word = True` during insertion, or forgetting to check it during a full-word `search`, leads to incorrect answers where prefixes are mistakenly treated as full words.

## Time and Space Complexity
- **Time Complexity:**
  - Insert: O(L), where L is the length of the word.
  - Search: O(L)
  - StartsWith: O(L)
- **Space Complexity:** O(N * L) in the worst case (where N is the number of words inserted and there is no prefix overlap). In practice, it's often much less due to shared prefixes.
