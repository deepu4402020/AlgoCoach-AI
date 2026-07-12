import sys
import os
import asyncio

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from langchain_core.messages import HumanMessage, AIMessage
from agents.graph import graph_app

async def test_agent():
    print("Testing LangGraph Setup")
    
    config = {"configurable": {"thread_id": "test_thread"}}
    
    test_queries = [
        "Explain the sliding window pattern",
        "I need a hint for the two sum problem",
        "```python\ndef sum(a, b):\n  return a + b\n```",
        "Hello!"
    ]
    
    for q in test_queries:
        print(f"\nUser: {q}")
        print("-" * 40)
        
        async for event in graph_app.astream({"messages": [HumanMessage(content=q)]}, config, stream_mode="values"):
            if "route" in event:
                print(f"[DEBUG Route]: {event['route']}")
                
            if "messages" in event and event["messages"]:
                last_msg = event["messages"][-1]
                if isinstance(last_msg, AIMessage):
                    print(f"Coach: {last_msg.content}")

if __name__ == "__main__":
    asyncio.run(test_agent())
