import os
import re
import chromadb
from sentence_transformers import SentenceTransformer

# Constants
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
CHROMA_DB_DIR = os.path.join(BASE_DIR, "chroma_db")
COLLECTION_NAME = "dsa_patterns"
EMBEDDING_MODEL_NAME = "BAAI/bge-small-en-v1.5"

def load_and_chunk_markdown(file_path):
    """
    Reads a markdown file and splits it into chunks based on '##' headings.
    Returns a list of dictionaries containing the text and metadata.
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split by '## ' but keep the heading text
    # The regex looks for '## ' at the start of a line and captures everything until the next '## '
    parts = re.split(r'\n## ', '\n' + content)
    
    chunks = []
    file_name = os.path.basename(file_path)
    
    for i, part in enumerate(parts):
        part = part.strip()
        if not part:
            continue
            
        if i == 0 or part.startswith('# '):
            # This is likely the title part before the first ##, or the main # title
            heading = "Introduction"
            text = part
        else:
            # Re-attach '## ' and extract the heading
            text = '## ' + part
            heading = part.split('\n')[0].strip()
            
        chunks.append({
            "text": text,
            "metadata": {
                "source": file_name,
                "heading": heading
            }
        })
        
    return chunks

def main():
    print(f"Loading embedding model '{EMBEDDING_MODEL_NAME}'...")
    model = SentenceTransformer(EMBEDDING_MODEL_NAME)
    
    print(f"Initializing ChromaDB at '{CHROMA_DB_DIR}'...")
    chroma_client = chromadb.PersistentClient(path=CHROMA_DB_DIR)
    
    # Get or create collection
    collection = chroma_client.get_or_create_collection(name=COLLECTION_NAME)
    
    # Clear existing data if any (optional, but good for idempotency during dev)
    # ChromaDB doesn't have a simple "clear collection" if you don't know the IDs, 
    # but we can just delete and recreate it.
    try:
        chroma_client.delete_collection(name=COLLECTION_NAME)
        collection = chroma_client.create_collection(name=COLLECTION_NAME)
        print("Cleared existing collection.")
    except Exception:
        pass
    
    print("Processing markdown files...")
    all_chunks = []
    
    for filename in os.listdir(DATA_DIR):
        if filename.endswith(".md"):
            file_path = os.path.join(DATA_DIR, filename)
            chunks = load_and_chunk_markdown(file_path)
            all_chunks.extend(chunks)
            
    if not all_chunks:
        print("No markdown files found in data directory.")
        return

    print(f"Created {len(all_chunks)} chunks from {len(os.listdir(DATA_DIR))} files.")
    
    # Prepare data for Chroma
    texts = [chunk["text"] for chunk in all_chunks]
    metadatas = [chunk["metadata"] for chunk in all_chunks]
    ids = [f"chunk_{i}" for i in range(len(all_chunks))]
    
    print("Computing embeddings...")
    embeddings = model.encode(texts, show_progress_bar=True)
    
    print("Storing in ChromaDB...")
    collection.add(
        embeddings=embeddings.tolist(),
        documents=texts,
        metadatas=metadatas,
        ids=ids
    )
    
    print("Ingestion complete!")

if __name__ == "__main__":
    main()
