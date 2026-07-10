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
