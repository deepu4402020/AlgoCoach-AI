# Backtracking

## Pattern Explanation
Backtracking is an algorithmic paradigm for solving problems recursively by trying to build a solution incrementally, one piece at a time, removing those solutions that fail to satisfy the constraints of the problem at any point in time (by "backtracking" to the previous step). It's essentially an optimized DFS exploration of all possible states.

## When to use it
- The problem asks for *all possible combinations, permutations, or subsets* that satisfy a condition.
- You are solving a constraint satisfaction problem like Sudoku, N-Queens, or finding paths in a maze.
- The input size is usually small (e.g., N < 20), because backtracking explores an exponential search space.

## Worked Example: Subsets
**Problem:** Given an integer array `nums` of unique elements, return all possible subsets (the power set).

**Code:**
```python
def subsets(nums: list[int]) -> list[list[int]]:
    result = []
    
    def backtrack(start_index, current_subset):
        # We add the current subset to the result at every step
        result.append(list(current_subset))
        
        for i in range(start_index, len(nums)):
            # Include the element
            current_subset.append(nums[i])
            # Move on to the next element
            backtrack(i + 1, current_subset)
            # Exclude the element (backtrack)
            current_subset.pop()
            
    backtrack(0, [])
    return result
```

## Common Pitfalls
- **Reference vs Copy:** A very common mistake is appending the `current_subset` list directly to `result`. Since lists are passed by reference, modifying `current_subset` later will change the one in `result`. Always append a copy: `result.append(list(current_subset))`.
- **Forgetting to Backtrack:** Forgetting the `.pop()` step after the recursive call means you aren't actually backtracking, leading to invalid states.
- **Duplicate Results:** If the input has duplicates, you must sort the input first and skip identical adjacent elements in the loop (`if i > start_index and nums[i] == nums[i-1]: continue`).

## Time and Space Complexity
- **Time Complexity:** O(N * 2^N) for subsets. We generate 2^N subsets, and copying each takes up to O(N) time. For permutations, it's O(N * N!).
- **Space Complexity:** O(N) to maintain the `current_subset` and the call stack. The space required for the output array `result` is O(N * 2^N), but auxiliary space is just O(N).
