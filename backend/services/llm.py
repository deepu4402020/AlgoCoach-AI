import os
import traceback
from openai import OpenAI

# Initialize OpenAI client. It will automatically look for OPENAI_API_KEY in environment variables.
# We instantiate it once.
client = None

def get_openai_client():
    global client
    if client is None:
        client = OpenAI()
    return client

SYSTEM_PROMPT = """You are AlgoCoach, a friendly DSA (Data Structures and Algorithms) tutor.
Your goal is to help students understand data structures and algorithms problems.
Never give the full solution immediately — first ask what they've tried, give hints, and guide them to the answer.
"""

def generate_chat_reply(message: str, history: list[dict], context_chunks: list[str] = None) -> dict:
    """
    Calls the OpenAI API to generate a reply.
    history should be a list of dicts like [{"role": "user", "content": "..."}]
    Returns a dict like {"reply": "..."} or {"error": "..."} gracefully.
    """
    try:
        system_content = SYSTEM_PROMPT
        if context_chunks:
            system_content += "\n\nUse the following reference material if relevant to help answer the user's question:\n"
            for i, chunk in enumerate(context_chunks):
                system_content += f"\n--- Reference {i+1} ---\n{chunk}\n"
                
        messages = [{"role": "system", "content": system_content}]
        
        # append history
        messages.extend(history)
        
        # append the current message
        messages.append({"role": "user", "content": message})
        
        openai_client = get_openai_client()
        
        chat_completion = openai_client.chat.completions.create(
            messages=messages,
            model="gpt-4o-mini",
            temperature=0.7,
            max_tokens=1024,
        )
        
        return {"reply": chat_completion.choices[0].message.content}
        
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        traceback.print_exc()
        return {"error": "Oops! AlgoCoach is having trouble connecting to its brain right now. Please try again later."}
