from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chat, auth, progress
from contextlib import asynccontextmanager
from database import engine, Base
import models

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(title="AlgoCoach AI Backend", lifespan=lifespan)

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(progress.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to AlgoCoach AI Backend!"}

@app.get("/debug/last-route")
def get_last_route():
    from routers.chat import LAST_ROUTE
    return {"last_route": LAST_ROUTE}
