from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models import SearchRequest, GraphResponse
import asyncio

from app.services.fetcher import fetch_historical_context
from app.services.extractor import extract_knowledge_graph
from app.services.database import init_db, get_cached_graph, save_to_cache # NEW IMPORTS

# Initialize the database file when the app boots up!
init_db()

app = FastAPI(title="Historical Knowledge Graph Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://chrono-graph.vercel.app" # <-- THE MAGIC KEY
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/generate-graph", response_model=GraphResponse)
async def generate_graph(request: SearchRequest):
    print(f"\n==================================================")
    print(f"[*] Analyzing: {request.query}")
    print(f"==================================================")
    
    # --- 1. THE CACHE CHECK ---
    cached_result = get_cached_graph(request.query)
    if cached_result:
        # If it's in the database, return it instantly! No web scraping, no AI API calls.
        # We add a tiny 0.3s sleep just so the frontend UI loading spinner looks smooth.
        await asyncio.sleep(0.3) 
        return cached_result
    
    # --- 2. THE HEAVY LIFTING (Only runs if cache is missed) ---
    wiki_text = await asyncio.to_thread(fetch_historical_context, request.query)
    
    if not wiki_text:
        return GraphResponse(nodes=[], links=[])

    graph_data = await asyncio.to_thread(extract_knowledge_graph, wiki_text)
    
    # --- 3. SAVE TO CACHE FOR NEXT TIME ---
    if graph_data.nodes: # Only save if the AI actually found something useful
        save_to_cache(request.query, graph_data)
        
    return graph_data