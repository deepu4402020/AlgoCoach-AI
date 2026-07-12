import json
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from services.llm import get_openai_client
from services.retriever import retrieve
from agents.state import CoachState

def supervisor_node(state: CoachState) -> dict:
    """
    Decides the route based on the latest user message.
    Routes: "concept_question", "hint_request", "code_review_request", "general_chat"
    """
    messages = state["messages"]
    last_message = messages[-1].content.lower() if messages else ""
    
    # 1. Fast path routing (Keyword/code block detection)
    if "```" in last_message or "def " in last_message or "class " in last_message:
        return {"route": "code_review_request"}
    
    if any(word in last_message for word in ["hint", "stuck", "help me started", "what next"]):
        return {"route": "hint_request"}
        
    if any(word in last_message for word in ["what is", "how does", "explain", "concept"]):
        return {"route": "concept_question"}
        
    # 2. Fallback to LLM classification
    client = get_openai_client()
    system_prompt = """Classify the user's message as one of the following exact labels:
- concept_question
- hint_request
- code_review_request
- general_chat

Respond with ONLY the label, nothing else.
"""
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": last_message}
            ],
            temperature=0.0,
            max_tokens=20
        )
        route = response.choices[0].message.content.strip()
        if route not in ["concept_question", "hint_request", "code_review_request", "general_chat"]:
            route = "general_chat"
    except Exception:
        route = "general_chat"
        
    return {"route": route}

def concept_node(state: CoachState) -> dict:
    """Answers a conceptual question using retrieved context."""
    messages = state["messages"]
    last_message = messages[-1].content
    
    # Retrieve relevant context
    chunks = retrieve(last_message, k=3)
    
    # Generate answer
    client = get_openai_client()
    
    system_prompt = "You are AlgoCoach, a friendly DSA tutor. Answer the student's conceptual question based ONLY on the following context. If the answer is not in the context, say you aren't sure but try to help generally.\n\nContext:\n"
    system_prompt += "\n\n".join(chunks)
    
    # Convert state messages to openai format
    openai_msgs = [{"role": "system", "content": system_prompt}]
    for msg in messages:
        if isinstance(msg, HumanMessage):
            openai_msgs.append({"role": "user", "content": msg.content})
        elif isinstance(msg, AIMessage):
            openai_msgs.append({"role": "assistant", "content": msg.content})
            
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=openai_msgs,
        temperature=0.7
    )
    
    reply = response.choices[0].message.content
    return {
        "messages": [AIMessage(content=reply)],
        "retrieved_context": chunks
    }

def hint_node(state: CoachState) -> dict:
    """Provides a scaled hint based on hint_level."""
    messages = state["messages"]
    last_message = messages[-1].content
    current_level = state.get("hint_level", 0)
    
    chunks = retrieve(last_message, k=2)
    
    # Determine the type of hint to give
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
    
    client = get_openai_client()
    openai_msgs = [{"role": "system", "content": system_prompt}]
    for msg in messages:
        if isinstance(msg, HumanMessage):
            openai_msgs.append({"role": "user", "content": msg.content})
        elif isinstance(msg, AIMessage):
            openai_msgs.append({"role": "assistant", "content": msg.content})
            
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=openai_msgs,
        temperature=0.7
    )
    
    reply = response.choices[0].message.content
    
    return {
        "messages": [AIMessage(content=reply)],
        "hint_level": current_level + 1,
        "retrieved_context": chunks
    }

def review_node(state: CoachState) -> dict:
    """Reviews the user's code."""
    messages = state["messages"]
    
    system_prompt = """You are AlgoCoach, an expert DSA reviewer. 
Review the user's code and provide feedback ONLY on:
1. Correctness and edge cases.
2. Time and space complexity.
3. One concrete improvement.

Keep it encouraging. DO NOT rewrite their entire solution for them."""

    client = get_openai_client()
    openai_msgs = [{"role": "system", "content": system_prompt}]
    for msg in messages:
        if isinstance(msg, HumanMessage):
            openai_msgs.append({"role": "user", "content": msg.content})
        elif isinstance(msg, AIMessage):
            openai_msgs.append({"role": "assistant", "content": msg.content})
            
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=openai_msgs,
        temperature=0.5
    )
    
    reply = response.choices[0].message.content
    return {
        "messages": [AIMessage(content=reply)],
        "hint_level": 0 # Reset hint level since they wrote code
    }

def general_node(state: CoachState) -> dict:
    """Handles general chit-chat without RAG."""
    messages = state["messages"]
    
    system_prompt = "You are AlgoCoach, a friendly and encouraging DSA tutor. Respond to the user's general conversation naturally."
    
    client = get_openai_client()
    openai_msgs = [{"role": "system", "content": system_prompt}]
    for msg in messages[-5:]: # Only need recent history for general chat
        if isinstance(msg, HumanMessage):
            openai_msgs.append({"role": "user", "content": msg.content})
        elif isinstance(msg, AIMessage):
            openai_msgs.append({"role": "assistant", "content": msg.content})
            
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=openai_msgs,
        temperature=0.7
    )
    
    reply = response.choices[0].message.content
    return {
        "messages": [AIMessage(content=reply)]
    }
