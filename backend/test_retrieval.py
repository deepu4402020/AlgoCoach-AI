import sys
import os

# Add backend directory to sys.path so we can import services
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.retriever import retrieve

def main():
    queries = [
        "When should I use a sliding window?",
        "What is the time complexity of a Trie insert?",
        "How do I solve the 0/1 knapsack problem?",
        "Explain the difference between BFS and DFS.",
        "How do I find the kth largest element?"
    ]
    
    print("Testing Retrieval System\n" + "="*40)
    
    for i, query in enumerate(queries):
        print(f"\nQuery {i+1}: '{query}'")
        print("-" * 40)
        
        chunks = retrieve(query, k=3) # Let's print top 3 to keep output manageable
        
        if not chunks:
            print("No chunks retrieved. Did you run ingest.py?")
            continue
            
        for j, chunk in enumerate(chunks):
            # Print a preview of the chunk (first 100 chars)
            preview = chunk[:150].replace('\n', ' ') + "..."
            print(f"  Result {j+1}: {preview}")
            
if __name__ == "__main__":
    main()
