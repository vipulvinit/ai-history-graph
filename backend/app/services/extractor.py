import json
import re
import os
from groq import Groq
from app.models import GraphResponse
from dotenv import load_dotenv

# Load the API key from your .env file
load_dotenv()

# Initialize the cloud client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def extract_knowledge_graph(wiki_text: str) -> GraphResponse:
    """
    Passes historical text to Groq's blazing-fast Cloud LLM to extract nodes and edges.
    """
    print("[*] Sending text to Groq Cloud (Llama 3) for extraction...")

    prompt = f"""
    You are an expert historian AI. Read the following historical summaries and extract a single, unified knowledge graph.
    
    CRITICAL INSTRUCTION: You are receiving text about multiple distinct topics. Your ABSOLUTE PRIMARY GOAL is to find the historical, thematic, or philosophical bridge connecting them. 
    If the provided text does not explicitly state the connection, you MUST use your own internal historical knowledge to create at least one linking edge (e.g., 'INFLUENCED', 'INSPIRED', 'REJECTED') that bridges the two main topics. 
    THE GRAPH MUST NOT HAVE DISCONNECTED CLUSTERS. Every node must eventually connect to the overarching web.
    
    Return strictly valid JSON.
    The JSON must follow this exact structure:
    {{
        "nodes": [
            {{
                "id": "Name of Person", "group": "Person", "description": "Summary", 
                "birth_year": "YYYY or null", "death_year": "YYYY or null"
            }},
            {{
                "id": "Title of Event", "group": "Event", "description": "Summary", 
                "start_year": "YYYY or null", "end_year": "YYYY or null", "location": "Location or null"
            }},
            {{
                "id": "Name of Concept", "group": "Concept", "description": "Core Principle", 
                "origin_era": "Era or null"
            }}
        ],
        "links": [
            {{
                "source": "Entity 1 ID", "target": "Entity 2 ID", 
                "label": "CAUSED" | "INFLUENCED" | "OPPOSED" | "INSPIRED", 
                "confidence_score": 0-10, 
                "snippet": "Exact quote from text, OR If you used internal knowledge to bridge the topics, write a concise 1-sentence historical explanation of how they connect."
            }}
        ]
    }}
    Text to analyze:
    {wiki_text}
    """

    try:
        # Call the Groq API with JSON mode strictly enforced!
        response = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.1-8b-instant", 
            temperature=0.1, 
            response_format={"type": "json_object"} # <-- THE MAGIC BULLET
        )

        result = response.choices[0].message.content

        # Parse the string into a Python dictionary
        data = json.loads(result.strip())

        # --- NEW: The Graph Firewall ---
        # 1. Create a quick lookup list of every valid Node ID
        valid_node_ids = {node["id"] for node in data.get("nodes", [])}
        
        # 2. Filter out any links that point to ghosts
        safe_links = []
        for link in data.get("links", []):
            if link["source"] in valid_node_ids and link["target"] in valid_node_ids:
                safe_links.append(link)
            else:
                print(f"[!] AI Hallucination Caught: Dropped invalid link from '{link['source']}' to '{link['target']}'")
        
        # 3. Replace the dirty links with our cleaned list
        data["links"] = safe_links
        # --------------------------------

        print(f"[*] Successfully extracted {len(data.get('nodes', []))} nodes and {len(data.get('links', []))} relationships in record time!")

        return GraphResponse(**data)

    except json.JSONDecodeError:
        print("[!] ML Extraction failed: Model did not return valid JSON.")
        # NEW: Print the actual raw output so we can see exactly how it messed up if it happens again!
        print(f"[!] Raw AI Output:\n{result}\n") 
        return GraphResponse(nodes=[], links=[])
    except Exception as e:
        print(f"[!] API Engine error: {e}")
        return GraphResponse(nodes=[], links=[])