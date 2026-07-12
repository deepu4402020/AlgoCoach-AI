# Heaps / Priority Queues

## Pattern Explanation
A Heap is a specialized tree-based data structure that satisfies the heap property: in a max heap, for any given node C, if P is a parent node of C, then the key of P is greater than or equal to the key of C. In a min heap, the parent is less than or equal to the child. Priority Queues are abstract data types usually implemented using Heaps, where elements are dequeued based on their priority (highest or lowest).

## When to use it
- The problem asks for the "top K", "kth smallest", "kth largest", or "k most frequent" elements.
- You need to repeatedly access or remove the maximum or minimum element dynamically as data streams in.
- Algorithms like Dijkstra's Shortest Path or Prim's Minimum Spanning Tree.

## Worked Example: Kth Largest Element in an Array
**Problem:** Given an integer array `nums` and an integer `k`, return the `k`th largest element in the array.

**Code:**
```python
import heapq

def findKthLargest(nums: list[int], k: int) -> int:
    # We use a min-heap of size k to keep track of the k largest elements seen so far.
    min_heap = []
    
    for num in nums:
        heapq.heappush(min_heap, num)
        # If heap size exceeds k, remove the smallest element in the heap.
        if len(min_heap) > k:
            heapq.heappop(min_heap)
            
    # The root of the min-heap is the kth largest element overall.
    return min_heap[0]
```

## Common Pitfalls
- **Min-Heap vs Max-Heap:** Python's `heapq` module only provides a min-heap. To use it as a max-heap, you must push the negated values (e.g., `heapq.heappush(heap, -val)`). Remember to negate the value again when popping.
- **Custom Objects:** When pushing tuples into a heap (e.g., `(frequency, word)`), the heap sorts by the first element. If the first elements are equal, it compares the second elements. This can crash if the second elements are objects that don't support comparison. Use a wrapper class or an incrementing counter as a tie-breaker.
- **Heap Size Management:** For "Top K" problems, keeping the heap size exactly at K (popping when size > K) ensures O(N log K) time complexity rather than O(N log N) if you push everything first.

## Time and Space Complexity
- **Time Complexity:** 
  - Heapify an array: O(N)
  - Push/Pop: O(log N)
  - Top K approach (maintaining size K): O(N log K)
- **Space Complexity:** O(K) for maintaining a heap of size K.
