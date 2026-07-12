from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chat

app = FastAPI(title="AlgoCoach AI Backend")

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to AlgoCoach AI Backend!"}

@app.get("/debug/last-route")
def get_last_route():
    from routers.chat import LAST_ROUTE
    return {"last_route": LAST_ROUTE}
