# Graph: BFS and DFS

## Pattern Explanation
Breadth-First Search (BFS) and Depth-First Search (DFS) are fundamental algorithms for traversing or searching tree or graph data structures.
- **BFS** explores the graph level by level, radiating outwards from the starting node. It uses a Queue.
- **DFS** explores as far as possible along each branch before backtracking. It uses a Stack (or the call stack via recursion).

## When to use it
- **BFS:** Finding the shortest path in an unweighted graph, finding the minimum number of steps to reach a state, level-order traversal of trees.
- **DFS:** Exploring all possible paths, checking connectivity, topological sorting, finding connected components, maze-solving where you just need *a* path.

## Worked Example: Number of Islands (DFS)
**Problem:** Given an `m x n` 2D binary grid `grid` which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.

**Code:**
```python
def numIslands(grid: list[list[str]]) -> int:
    if not grid:
        return 0

    rows, cols = len(grid), len(grid[0])
    islands = 0

    def dfs(r, c):
        if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] == "0":
            return
        
        grid[r][c] = "0" # Mark as visited by sinking the island
        
        dfs(r - 1, c) # Up
        dfs(r + 1, c) # Down
        dfs(r, c - 1) # Left
        dfs(r, c + 1) # Right

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1":
                islands += 1
                dfs(r, c)
                
    return islands
```

## Common Pitfalls
- **Infinite Loops (Cycles):** In graphs with cycles, failing to keep track of `visited` nodes will lead to infinite loops. Always use a `Set` or modify the input matrix (if allowed) to track visited nodes.
- **Queue vs Stack:** Accidentally using a Stack when BFS is needed (e.g., shortest path) will yield incorrect results.
- **Recursion Depth:** In Python, the recursion limit can be hit for very deep graphs using DFS. An iterative DFS with an explicit stack might be needed for huge graphs.

## Time and Space Complexity
- **Time Complexity:** O(V + E), where V is the number of vertices (nodes) and E is the number of edges. We visit every node and every edge at least once.
- **Space Complexity:** O(V) in the worst case for the call stack in DFS (e.g., a skewed tree/graph) or the queue in BFS (when the widest level has many nodes).
