import time
import logging
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from services.retriever import retrieve
from agents.state import CoachState

logger = logging.getLogger(__name__)

async def supervisor_node(state: CoachState) -> dict:
    messages = state["messages"]
    last_message = messages[-1].content.lower() if messages else ""
    
    if "```" in last_message or "def " in last_message or "class " in last_message:
        return {"route": "code_review_request"}
    
    if any(word in last_message for word in ["hint", "stuck", "help me started", "what next"]):
        return {"route": "hint_request"}
        
    if any(word in last_message for word in ["what is", "how does", "explain", "concept"]):
        return {"route": "concept_question"}
        
    system_prompt = """Classify the user's message as one of the following exact labels:
- concept_question
- hint_request
- code_review_request
- general_chat

Respond with ONLY the label, nothing else.
"""
    try:
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.0, max_tokens=20)
        msgs = [SystemMessage(content=system_prompt), HumanMessage(content=last_message)]
        response = await llm.ainvoke(msgs)
        route = response.content.strip()
        if route not in ["concept_question", "hint_request", "code_review_request", "general_chat"]:
            route = "general_chat"
    except Exception:
        route = "general_chat"
        
    logger.info(f"supervisor_node routed to: {route}")
    return {"route": route}

async def concept_node(state: CoachState) -> dict:
    messages = state["messages"]
    last_message = messages[-1].content
    
    chunks = retrieve(last_message, k=3)
    
    system_prompt = "You are AlgoCoach, a friendly DSA tutor. Answer the student's conceptual question based ONLY on the following context. If the answer is not in the context, say you aren't sure but try to help generally.\n\nContext:\n"
    system_prompt += "\n\n".join(chunks)
    system_prompt += f"\n\nStudent Learning Profile:\n{state.get('learning_profile', 'None')}"
    
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)
    start_time = time.time()
    response = await llm.ainvoke([SystemMessage(content=system_prompt)] + messages)
    logger.info(f"concept_node handled question with LLM latency {time.time() - start_time:.2f}s")
    
    return {
        "messages": [response],
        "retrieved_context": chunks
    }

async def hint_node(state: CoachState) -> dict:
    messages = state["messages"]
    last_message = messages[-1].content
    current_level = state.get("hint_level", 0)
    
    chunks = retrieve(last_message, k=2)
    
    if current_level == 0:
        instruction = "Give a very gentle hint. Ask a clarifying question about their approach. DO NOT give away the pattern or the code."
    elif current_level == 1:
        instruction = "Nudge them toward the right data structure or algorithmic pattern (e.g., Two Pointers, Sliding Window). Explain WHY it might be useful."
    elif current_level == 2:
        instruction = "Give them a structural hint or high-level pseudocode. Outline the steps they need to take."
    else:
        instruction = "Walk through the approach clearly, explaining the logic step-by-step. Still, ask them to try writing the code themselves."
        
    system_prompt = f"You are AlgoCoach, a friendly DSA tutor. The student is stuck and needs a hint. \n\nINSTRUCTION: {instruction}\n\nReference Material (if relevant):\n"
    system_prompt += "\n\n".join(chunks)
    system_prompt += f"\n\nStudent Learning Profile:\n{state.get('learning_profile', 'None')}"
    
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)
    start_time = time.time()
    response = await llm.ainvoke([SystemMessage(content=system_prompt)] + messages)
    logger.info(f"hint_node provided hint_level {current_level} with LLM latency {time.time() - start_time:.2f}s")
    
    return {
        "messages": [response],
        "hint_level": current_level + 1,
        "retrieved_context": chunks
    }

async def review_node(state: CoachState) -> dict:
    messages = state["messages"]
    
    system_prompt = """You are AlgoCoach, an expert DSA reviewer. 
Review the user's code and provide feedback ONLY on:
1. Correctness and edge cases.
2. Time and space complexity.
3. One concrete improvement.

Keep it encouraging. DO NOT rewrite their entire solution for them."""
    system_prompt += f"\n\nStudent Learning Profile:\n{state.get('learning_profile', 'None')}"

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.5)
    start_time = time.time()
    response = await llm.ainvoke([SystemMessage(content=system_prompt)] + messages)
    logger.info(f"review_node completed review with LLM latency {time.time() - start_time:.2f}s")
    
    return {
        "messages": [response],
        "hint_level": 0
    }

async def general_node(state: CoachState) -> dict:
    messages = state["messages"]
    
    system_prompt = f"You are AlgoCoach, a friendly and encouraging DSA tutor. Respond to the user's general conversation naturally.\n\nStudent Learning Profile:\n{state.get('learning_profile', 'None')}"
    
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)
    start_time = time.time()
    response = await llm.ainvoke([SystemMessage(content=system_prompt)] + messages[-5:])
    logger.info(f"general_node handled chat with LLM latency {time.time() - start_time:.2f}s")
    
    return {
        "messages": [response]
    }
