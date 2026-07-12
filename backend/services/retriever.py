import os
import chromadb
from sentence_transformers import SentenceTransformer
from rank_bm25 import BM25Okapi

# Configuration
CHROMA_DB_DIR = os.path.join(os.path.dirname(__file__), "..", "chroma_db")
COLLECTION_NAME = "dsa_patterns"
EMBEDDING_MODEL_NAME = "BAAI/bge-small-en-v1.5"
RRF_K = 60

# We will initialize these lazily or at startup
chroma_client = None
collection = None
embedding_model = None
bm25 = None
chunk_documents = [] # To map index from BM25 to actual text

def init_retriever():
    global chroma_client, collection, embedding_model, bm25, chunk_documents
    
    if collection is not None:
        return # Already initialized
        
    print("Initializing retriever...")
    try:
        chroma_client = chromadb.PersistentClient(path=CHROMA_DB_DIR)
        collection = chroma_client.get_collection(name=COLLECTION_NAME)
    except Exception as e:
        print(f"Error connecting to ChromaDB (make sure you ran ingest.py): {e}")
        return
        
    print(f"Loading embedding model '{EMBEDDING_MODEL_NAME}'...")
    embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)
    
    print("Building BM25 index from ChromaDB documents...")
    # Fetch all documents to build the BM25 index
    all_data = collection.get(include=["documents"])
    chunk_documents = all_data["documents"]
    
    if not chunk_documents:
        print("No documents found in ChromaDB collection.")
        return
        
    # Tokenize documents for BM25
    tokenized_corpus = [doc.lower().split() for doc in chunk_documents]
    bm25 = BM25Okapi(tokenized_corpus)
    print(f"Retriever initialized with {len(chunk_documents)} chunks.")

def retrieve(query: str, k: int = 5) -> list[str]:
    """
    Retrieves the top k most relevant chunks using Reciprocal Rank Fusion (RRF)
    over ChromaDB (dense) and BM25 (sparse) results.
    """
    if collection is None:
        init_retriever()
        
    if collection is None or not chunk_documents:
        return [] # Still not initialized, likely no data
        
    # 1. Dense Retrieval (ChromaDB)
    query_embedding = embedding_model.encode(query).tolist()
    dense_results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(20, len(chunk_documents)),
        include=["documents", "distances"]
    )
    
    dense_docs = dense_results["documents"][0]
    
    # 2. Sparse Retrieval (BM25)
    tokenized_query = query.lower().split()
    bm25_scores = bm25.get_scores(tokenized_query)
    
    # Get top 20 BM25 results
    top_n = min(20, len(chunk_documents))
    bm25_indices = sorted(range(len(bm25_scores)), key=lambda i: bm25_scores[i], reverse=True)[:top_n]
    sparse_docs = [chunk_documents[i] for i in bm25_indices]
    
    # 3. Reciprocal Rank Fusion (RRF)
    rrf_scores = {}
    
    # Process dense rankings
    for rank, doc in enumerate(dense_docs):
        if doc not in rrf_scores:
            rrf_scores[doc] = 0.0
        rrf_scores[doc] += 1.0 / (rank + 1 + RRF_K)
        
    # Process sparse rankings
    for rank, doc in enumerate(sparse_docs):
        if doc not in rrf_scores:
            rrf_scores[doc] = 0.0
        rrf_scores[doc] += 1.0 / (rank + 1 + RRF_K)
        
    # 4. Sort and return top k
    sorted_fused_results = sorted(rrf_scores.items(), key=lambda item: item[1], reverse=True)
    top_chunks = [doc for doc, score in sorted_fused_results[:k]]
    
    return top_chunks
