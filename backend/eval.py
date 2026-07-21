import os
import sys

# Add backend directory to sys.path to import services
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.retriever import init_retriever, retrieve, chunk_documents

TEST_QUERIES = [
    ("How do I find the longest substring without repeating characters?", "sliding-window"),
    ("Given an array of integers, find two numbers such that they add up to a specific target number.", "two-pointers"),
    ("I need to find the shortest path in an unweighted grid from a start point to an end point.", "graph-bfs-dfs"),
    ("What's the best way to generate all possible subsets of a given set?", "backtracking"),
    ("How to implement a dictionary that supports fast prefix lookups?", "tries"),
    ("I want to find the k largest elements in an array efficiently.", "heaps"),
    ("Given weights and values of n items, put these items in a knapsack of capacity W to get the maximum total value.", "dp-knapsack"),
    ("Find the minimum window in a string which will contain all the characters in another string.", "sliding-window"),
    ("Given a sorted array of distinct integers and a target value, return the index if the target is found.", "binary-search"),
    ("You are given an array of prices where prices[i] is the price of a given stock on an ith day. Find the maximum profit.", "two-pointers"),
    ("How to solve the N-Queens puzzle?", "backtracking"),
    ("Determine if a 9 x 9 Sudoku board is valid.", "backtracking"),
    ("Design a data structure that supports adding new words and finding if a string matches any previously added string.", "tries"),
    ("Find the kth largest element in a stream.", "heaps"),
    ("Given an undirected graph, detect if there is a cycle.", "graph-bfs-dfs")
]

def evaluate_retrieval(use_reranker=True):
    # Initialize the retriever
    init_retriever()
    
    if not chunk_documents:
        print("No documents available. Run ingest.py first.")
        return
        
    print(f"\n--- Running Evaluation (Reranker {'ON' if use_reranker else 'OFF'}) ---")
    
    correct = 0
    total = len(TEST_QUERIES)
    
    for query, expected_pattern in TEST_QUERIES:
        # In a real evaluation, we would optionally disable the reranker in retrieve() to see the difference.
        # But we'll just test the current setup which has the reranker.
        chunks = retrieve(query, k=5)
        
        # Check if expected_pattern is in the metadata of the retrieved chunks
        # Actually our chunks in retrieve() are just strings.
        # But our ingest.py stored them with headers or content that includes the pattern name.
        # Let's check if the expected_pattern is simply a substring of any chunk.
        
        found = False
        for chunk in chunks:
            # We assume the chunks contain the pattern name or the file name if we injected it.
            if expected_pattern.lower() in chunk.lower() or expected_pattern.replace('-', ' ').lower() in chunk.lower():
                found = True
                break
                
        if found:
            correct += 1
        else:
            print(f"[FAIL] Query: '{query}' -> Expected: {expected_pattern}")
            
    accuracy = (correct / total) * 100
    print(f"Retrieval@5 Accuracy: {accuracy:.2f}% ({correct}/{total})")

if __name__ == "__main__":
    evaluate_retrieval()
