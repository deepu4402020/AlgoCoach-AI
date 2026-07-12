# Two Pointers

## Pattern Explanation
The Two Pointers pattern involves using two pointers to iterate through an array or list, often starting from opposite ends or moving at different speeds. It is used to minimize the number of loops and optimize the time complexity, typically reducing an O(N^2) or O(N^3) solution to O(N) or O(N log N).

## When to use it
- The input is a sorted array, list, or string.
- You need to find a set of elements that fulfill certain constraints (e.g., finding a pair that sums to a target).
- You are dealing with questions related to contiguous subarrays, but it's simpler than a full sliding window.
- Reversing an array or a string in place.
- Checking for a palindrome.

## Worked Example: Valid Palindrome
**Problem:** Given a string, determine if it is a palindrome, considering only alphanumeric characters and ignoring cases.

**Code:**
```python
def is_palindrome(s: str) -> bool:
    left, right = 0, len(s) - 1
    
    while left < right:
        while left < right and not s[left].isalnum():
            left += 1
        while left < right and not s[right].isalnum():
            right -= 1
            
        if s[left].lower() != s[right].lower():
            return False
            
        left += 1
        right -= 1
        
    return True
```

## Common Pitfalls
- **Off-by-one errors:** Be careful with the condition in the `while` loop (`left < right` vs `left <= right`). Usually, if you need to compare two distinct elements, use `left < right`.
- **Infinite loops:** Ensure that the pointers are always updated (moved closer to each other) within the loop, even if certain conditions are skipped (like skipping non-alphanumeric characters).
- **Unsorted input:** For problems like "Two Sum II" where you find a pair that adds to a target, the array MUST be sorted. If it's not sorted, a hash map approach is usually better.

## Time and Space Complexity
- **Time Complexity:** O(N), where N is the number of elements in the array/string. We process each element at most once.
- **Space Complexity:** O(1), as we only use two integer pointers regardless of the input size.
