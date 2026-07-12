# Dynamic Programming: 0/1 Knapsack

## Pattern Explanation
The 0/1 Knapsack pattern is a foundational dynamic programming concept. You are given a set of items, each with a weight and a value, and a knapsack with a maximum weight capacity. The goal is to determine the maximum value you can carry in the knapsack. It's called "0/1" because you can either include an item (1) or exclude it (0); you cannot take fractions of an item.

## When to use it
- The problem involves making a choice between taking an item or leaving it to maximize or minimize some value, subject to a constraint (like capacity).
- Problems asking for combinations that sum to a specific target (Subset Sum).
- You notice overlapping subproblems: the optimal solution for a capacity `C` depends on the optimal solutions for smaller capacities.

## Worked Example: 0/1 Knapsack
**Problem:** Given weights and values of `n` items, put these items in a knapsack of capacity `W` to get the maximum total value in the knapsack.

**Code:**
```python
def knapsack(values: list[int], weights: list[int], W: int) -> int:
    n = len(values)
    # dp[i][j] will store the max value using first i items and capacity j
    dp = [[0 for _ in range(W + 1)] for _ in range(n + 1)]

    for i in range(1, n + 1):
        for w in range(1, W + 1):
            if weights[i-1] <= w:
                # Max of (including the item) or (excluding the item)
                dp[i][w] = max(values[i-1] + dp[i-1][w-weights[i-1]], dp[i-1][w])
            else:
                # Item is too heavy, must exclude it
                dp[i][w] = dp[i-1][w]
                
    return dp[n][W]
```

## Common Pitfalls
- **Index Out of Bounds:** Be extremely careful with indexing, especially shifting by 1 when the DP table has a row/col for the "empty" or "0" state.
- **State Definition:** Incorrectly defining what `dp[i][j]` represents will doom the solution. Write down the definition explicitly before coding.
- **Space Optimization:** The 2D DP table can often be optimized to a 1D array because `dp[i]` only depends on `dp[i-1]`. In the 1D version, you must iterate through capacities *backwards* to avoid using an item multiple times.

## Time and Space Complexity
- **Time Complexity:** O(N * W), where N is the number of items and W is the knapsack capacity. This is pseudo-polynomial time.
- **Space Complexity:** O(N * W) for the 2D array approach. This can be optimized to O(W) using a 1D array.
