import os
import sys

# Add backend directory to sys.path to import services
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.services.retriever import init_retriever, retrieve, chunk_documents
from backend.services.llm import get_openai_client

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
        
        client = get_openai_client()
        context_str = "\n".join(chunks)
        
        prompt = f"""You are an expert AI evaluator judging a RAG system.
Query: "{query}"
Expected Concept: {expected_pattern}
Retrieved Context:
{context_str}

Task (Context Relevance): Does the retrieved context contain sufficient information or specifically mention the expected concept to answer the query? Answer strictly YES or NO."""

        try:
            res = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.0,
                max_tokens=10
            )
            found = "YES" in res.choices[0].message.content.strip().upper()
        except Exception as e:
            print(f"LLM Eval error: {e}")
            found = False
                
        if found:
            correct += 1
        else:
            print(f"[FAIL] Query: '{query}' -> Expected: {expected_pattern}")
            
    accuracy = (correct / total) * 100
    print(f"Context Relevance (LLM-Judged) Accuracy: {accuracy:.2f}% ({correct}/{total})")

if __name__ == "__main__":
    evaluate_retrieval()
