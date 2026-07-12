# Sliding Window

## Pattern Explanation
The Sliding Window pattern is an extension of the Two Pointers pattern. It involves creating a "window" of elements (usually a contiguous subarray or substring) and moving this window across the data structure to perform calculations. The window size can be fixed or dynamic (variable-sized). This technique avoids recalculating overlapping parts of the window.

## When to use it
- The problem asks for the maximum, minimum, longest, or shortest something among all contiguous subarrays or substrings.
- Examples include: "Maximum sum subarray of size K", "Longest substring without repeating characters", "Minimum size subarray sum".
- If the problem involves subsequences (not contiguous), sliding window cannot be used.

## Worked Example: Maximum Sum Subarray of Size K
**Problem:** Given an array of positive numbers and a positive number 'k', find the maximum sum of any contiguous subarray of size 'k'.

**Code:**
```python
def max_sub_array_of_size_k(k: int, arr: list[int]) -> int:
    max_sum = 0
    window_sum = 0
    window_start = 0

    for window_end in range(len(arr)):
        window_sum += arr[window_end]  # add the next element
        
        # slide the window, we don't need to slide if we've not hit the required window size of 'k'
        if window_end >= k - 1:
            max_sum = max(max_sum, window_sum)
            window_sum -= arr[window_start]  # subtract the element going out
            window_start += 1  # slide the window ahead
            
    return max_sum
```

## Common Pitfalls
- **Updating state correctly:** When sliding a dynamic window, remember to update the state (e.g., a dictionary of character frequencies) properly when `window_start` moves forward.
- **Inner loop condition:** In dynamic windows, the `while` loop that shrinks the window must have the correct condition (e.g., `while window_sum >= target:`).
- **Off-by-one errors:** Calculating the window size correctly. The size of a window from `start` to `end` inclusive is `end - start + 1`.

## Time and Space Complexity
- **Time Complexity:** O(N). Although there might be an inner `while` loop (in variable-sized windows), each element is added to the window at most once and removed at most once. Therefore, the inner loop runs a total of N times across all iterations of the outer loop.
- **Space Complexity:** O(1) for fixed size windows (like sum calculations). O(K) where K is the number of distinct elements if a hash map is used to track frequencies (e.g., in string problems).
