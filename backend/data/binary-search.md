# Binary Search

## Pattern Explanation
Binary Search is a divide-and-conquer algorithm used to find the position of a target value within a sorted array. It compares the target value to the middle element of the array. If they are not equal, the half in which the target cannot lie is eliminated, and the search continues on the remaining half, again taking the middle element to compare to the target value, and repeating this until the target value is found or the search space is empty.

## When to use it
- The input space is sorted or monotonic (increasing or decreasing).
- The problem asks to find an element, find a boundary, or find an optimal solution (e.g., "minimum capacity to ship packages").
- When you need a time complexity of O(log N). If a naive solution is O(N), see if you can search the answer space monotonically.

## Worked Example: Search Insert Position
**Problem:** Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order. You must write an algorithm with O(log n) runtime complexity.

**Code:**
```python
def searchInsert(nums: list[int], target: int) -> int:
    left, right = 0, len(nums) - 1
    
    while left <= right:
        mid = left + (right - left) // 2 # Avoids integer overflow in other languages
        
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
            
    return left
```

## Common Pitfalls
- **Integer Overflow:** Calculating `mid = (left + right) / 2` can cause overflow in languages with fixed integer sizes like C++ or Java if `left` and `right` are very large. Use `left + (right - left) / 2` instead.
- **Infinite Loops:** If the condition is `left < right` or `left <= right`, ensure that `left` and `right` are updated correctly (e.g., `left = mid + 1` or `right = mid - 1`). If you use `left = mid`, it might get stuck when `left` and `right` are adjacent.
- **Boundary Conditions:** Deciding whether to return `left`, `right`, or something else when the target is not found depends on the specific problem. Always trace with a small example.

## Time and Space Complexity
- **Time Complexity:** O(log N), because the search space is halved in each step.
- **Space Complexity:** O(1) for the iterative implementation. O(log N) for the recursive implementation due to the call stack.
