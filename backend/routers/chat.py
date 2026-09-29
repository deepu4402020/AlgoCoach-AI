from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from agents.graph import graph_app
from langchain_core.messages import HumanMessage, AIMessage
from models import User, ProblemAttempt
from dependencies import get_current_user
from database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
import json
import uuid
import logging
from fastapi import BackgroundTasks
from services.llm import get_openai_client
from sqlalchemy.future import select

logger = logging.getLogger(__name__)

router = APIRouter()

# Global variable to store last route for debugging
LAST_ROUTE = "general_chat"

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    reply: Optional[str] = None
    error: Optional[str] = None

# A simple helper to guess pattern from text
# #F
def infer_pattern(text: str) -> str:
    text = text.lower()
    patterns = {
        "two pointers": "two-pointers",
        "sliding window": "sliding-window",
        "binary search": "binary-search",
        "knapsack": "dp-knapsack",
        "bfs": "graph-bfs-dfs",
        "dfs": "graph-bfs-dfs",
        "backtracking": "backtracking",
        "heap": "heaps",
        "trie": "tries"
    }
    for key, val in patterns.items():
        if key in text:
            return val
    return "unknown"

async def update_user_learning_profile(user_id: str, message: str, reply: str, db: AsyncSession):
    try:
        result = await db.execute(select(User).filter(User.id == user_id))
        user = result.scalars().first()
        if not user:
            return
        
        current_profile = getattr(user, "learning_profile", "No specific patterns identified yet.")
        
        client = get_openai_client()
        prompt = f"""You are analyzing a student's learning progress. 
Current Profile: {current_profile}
Latest Interaction:
Student: {message}
Coach: {reply}

Update the student's learning profile to reflect any new patterns they struggle with or have mastered. Keep it concise, under 3 sentences. If no update is needed, output the Current Profile exactly."""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0
        )
        new_profile = response.choices[0].message.content.strip()
        user.learning_profile = new_profile
        await db.commit()
    except Exception as e:
        logger.error(f"Failed to update profile: {e}")

@router.post("/chat")
async def chat_endpoint(request: ChatRequest, background_tasks: BackgroundTasks, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    global LAST_ROUTE
    
    config = {"configurable": {"thread_id": current_user.id}, "recursion_limit": 5}
    input_message = HumanMessage(content=request.message)
    learning_profile = getattr(current_user, "learning_profile", "No specific patterns identified yet.")
    
    async def event_generator():
        final_reply = ""
        global LAST_ROUTE
        hint_level = 0
        
        try:
            async for event_type, payload in graph_app.astream(
                {"messages": [input_message], "user_id": current_user.id, "learning_profile": learning_profile},
                config,
                stream_mode=["messages", "updates"]
            ):
                if event_type == "messages":
                    chunk, metadata = payload
                    if chunk.content:
                        final_reply += chunk.content
                        # Yield accumulated text for the frontend
                        yield f"data: {json.dumps({'reply': final_reply})}\n\n"
                        
                elif event_type == "updates":
                    # Extract info from node outputs if needed
                    for node_name, node_output in payload.items():
                        if isinstance(node_output, dict):
                            if "route" in node_output:
                                LAST_ROUTE = node_output["route"]
                            if "hint_level" in node_output:
                                hint_level = node_output["hint_level"]
                                
            # Stage 4: Log problem attempt if routed to hint or review
            if LAST_ROUTE in ["hint_request", "code_review_request", "hint", "review"]:
                pattern_tag = infer_pattern(request.message + " " + final_reply)
                
                outcome = "in_progress"
                if LAST_ROUTE in ["code_review_request", "review"] and "correct" in final_reply.lower():
                    outcome = "solved"
                    
                attempt = ProblemAttempt(
                    user_id=current_user.id,
                    problem_name="unknown",
                    pattern_tag=pattern_tag,
                    hint_level_reached=hint_level,
                    outcome=outcome
                )
                db.add(attempt)
                await db.commit()
                
            # Trigger background task to update memory
            if final_reply:
                background_tasks.add_task(update_user_learning_profile, current_user.id, request.message, final_reply, db)
                
        except Exception as e:
            logger.error(f"Error in chat endpoint: {e}", exc_info=True)
            yield f"data: {json.dumps({'error': 'Oops! AlgoCoach is having trouble connecting to its brain right now. Please try again later.'})}\n\n"
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")
