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
- general_chatYou're redesigning the frontend UI of AlgoCoach AI (Next.js app, DSA tutor chatbot). Currently it's a plain black screen with a tiny input at the bottom, which looks unfinished. Redesign it into a polished, modern chat interface. DO NOT touch backend logic, API routes, auth (JWT), or SSE streaming. Keep all existing functionality (chat, Progress page, Logout) and only change the UI/UX layer. Use Tailwind + shadcn/ui + lucide-react if already in the project, otherwise add them.

## Reference style (inspired by a "Cortex" AI chat UI)
Clean, airy, light theme with soft lavender/purple accents, lots of whitespace, soft shadows, rounded everything.

## Design tokens
- Background: #FAFAFB (app), white (cards/panels). Sidebar bg: #F7F7F9 with a subtle right border (#ECECF1).
- Primary text: #0B0B0F, secondary: #6B6B76, muted: #A0A0AB.
- Accent: soft purple #A78BFA / #8B5CF6, tint backgrounds #F3EFFF, tint borders #E4DBFF.
- Primary buttons: solid near-black (#0B0B0F), white text.
- Radii (slightly rounder than the reference): buttons/chips 12px, cards 20px, main input card 24px, pills fully rounded.
- Shadows: very soft, e.g. 0 8px 30px rgba(139, 92, 246, 0.08). 1px borders in #ECECF1.
- Font: Inter (or Geist). Hero heading 40-44px semibold, tight tracking.
- Add dark mode via CSS variables + a toggle (nice to have), same palette inverted.

## Layout
1. **Left sidebar (260px, collapsible with a toggle button, becomes a slide-over drawer on mobile):**
   - Top: logo mark (small purple rounded square with an icon) + "AlgoCoach" + collapse button.
   - Black full-width "+ New chat" button.
   - Search input with a ⌘K badge on the right (can open a simple filter of past chats).
   - Nav items with lucide icons: Practice, Progress (links to the existing Progress page), Topics/Library, History.
   - Chat history list grouped by "Today / Yesterday / Previous 7 days", single-line truncated titles, hover + active state with a light purple tint. If history isn't stored yet, use auto-generated titles from the first message in localStorage or the existing API.
   - Bottom: user card (avatar/initials, name, email) with a Logout icon button. Wire it to the existing logout.
2. **Top bar (inside main area):** left: a pill dropdown showing the current mode/model (e.g. "AlgoCoach · Tutor"). Right: ghost icon buttons (link/share), "Export chat" outlined button (export conversation as .md), and optional black pill button.
3. **Empty state (hero), vertically centered:**
   - A soft glowing purple/lavender orb (CSS radial gradients + blur, with a slow floating/pulse animation).
   - "Hello, {username}" in a purple gradient text, then big black heading: "What DSA problem are you working on today?"
   - **Large input card** (max-w ~720px): rounded-3xl, white, soft purple border + glow on focus, auto-growing textarea with placeholder "Ask about a problem or algorithm...". Enter = send, Shift+Enter = newline.
     - Bottom toolbar inside the card: lavender pill chip "Hint mode" (toggle: gives hints instead of full solutions), small icon buttons for Language (C++/Python/Java dropdown) and Difficulty, and a circular purple send button on the right (disabled state when empty, spinner while streaming).
   - Below the input, a thin tinted strip with a "Saved prompts" sparkle label on the left and "Attach file/code" button on the right (can be a stub if not supported).
   - **3 suggestion cards** in a row (stack on mobile), each with an icon, bold title, and a 2-line muted description. Clicking one fills + sends the prompt:
     - "Explain a Pattern": "Explain the sliding window pattern with an example."
     - "Debug My Solution": "Help me find the bug in my two-pointer solution."
     - "Get a Hint": "Give me a hint for Two Sum without spoiling the answer."
4. **Chat state (after first message):**
   - Hero disappears with a smooth fade; messages show in a centered column (max-w ~768px).
   - User messages: right-aligned, light purple tinted bubble, rounded-2xl. Assistant messages: left-aligned, no heavy bubble, small avatar, full markdown rendering (react-markdown + remark-gfm), code blocks with syntax highlighting, language label and a "Copy" button, rounded-xl.
   - Streaming: show a typing/dots indicator and render tokens as they arrive from the existing SSE stream; auto-scroll to bottom, with a "scroll to bottom" button if the user scrolled up.
   - The input card sticks to the bottom (same component, now smaller), with a footer line: "AlgoCoach can make mistakes. Verify important solutions."
5. **Footer/floating:**

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
