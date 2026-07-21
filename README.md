# AlgoCoach AI

AlgoCoach AI is an AI coding coach for DSA (Data Structures & Algorithms) practice. 


## Tech Stack
- **Frontend**: Next.js 15 (App Router, TypeScript, Tailwind, shadcn/ui)
- **Backend**: FastAPI (Python)
- **LLM**: OpenAI (gpt-4o-mini)

---

## Setup & Running Locally

### Backend (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables:
   Copy `.env.example` to `.env` and add your OpenAI API Key:
   ```bash
   cp .env.example .env
   # Edit .env to add your OPENAI_API_KEY
   ```
5. Run the backend server:
   ```bash
   uvicorn main:app --reload
   ```
   The backend will start at `http://localhost:8000`.

### Frontend (Next.js)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   # Ensure NEXT_PUBLIC_BACKEND_URL is set (defaults to http://localhost:8000)
   ```
4. Run the frontend development server:
   ```bash
   npm run dev
   ```
   The frontend will start at `http://localhost:3000`.

Open `http://localhost:3000` in your browser to interact with AlgoCoach!

---

## Architecture

```text
User (browser)
   │
   ▼
Next.js frontend (chat UI, streaming responses, progress dashboard)
   │  fetch/streaming (SSE)
   ▼
FastAPI backend
   │
   ├── /auth  → JWT login/signup
   ├── /chat  → invokes LangGraph graph.astream()
   ├── /progress → CRUD on user's problem history
   │
   ▼
LangGraph graph (in-process, Python)
   │
   ├── Supervisor/Router node   → decides which agent handles the message
   ├── Concept Coach agent       → explains a DSA concept (uses RAG)
   ├── Hint Agent                → gives progressive hints for a problem (uses RAG, never gives full solution first)
   ├── Code Review agent         → reviews user's pasted code (complexity, edge cases, style)
   └── Progress node             → writes a summary of the turn into SQLite
   │
   ▼
RAG layer (retriever tool callable by any agent)
   │
   ├── ChromaDB (vector store: DSA notes, patterns)
   ├── BM25 index (same corpus, keyword side)
   └── Reranker (cross-encoder) → top-5 chunks → injected into agent prompt
```

---

## Deployment
- **Frontend**: Designed to be deployed on [Vercel](https://vercel.com).
- **Backend**: Designed to be deployed on [Render](https://render.com) or [Railway](https://railway.app).

## Known limitations / what I'd do next
- **Database**: Would move to Postgres + pgvector for concurrent users instead of SQLite and ChromaDB.
- **Observability**: Would add Langfuse tracing for production observability instead of local structured logs.
- **State Management**: Would replace MemorySaver checkpointer with a persistent one (e.g. Postgres-backed) for multi-instance deployment.
