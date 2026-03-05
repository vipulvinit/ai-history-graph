import sqlite3
import json
from app.models import GraphResponse

DB_PATH = "graph_cache.db"

def init_db():
    """Creates the SQLite database and the cache table if it doesn't exist."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # We store the exact search query as the ID, and the JSON graph as the text
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS search_cache (
            query TEXT PRIMARY KEY,
            graph_data TEXT
        )
    """)
    conn.commit()
    conn.close()

def get_cached_graph(query: str) -> GraphResponse | None:
    """Checks if a query has already been searched. If yes, returns the JSON instantly."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # We lowercase the query so "Cold War" and "cold war" hit the same cache
    cursor.execute("SELECT graph_data FROM search_cache WHERE query = ?", (query.lower().strip(),))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        print(f"[+] CACHE HIT! Loading '{query}' instantly from SQLite.")
        raw_json = json.loads(row[0])
        return GraphResponse(**raw_json)
    
    return None

def save_to_cache(query: str, graph_data: GraphResponse, limit: int = 10000):
    """Saves a fresh AI-generated graph and enforces a hard cap on the database size."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Convert the Pydantic model to a JSON string
    json_string = graph_data.model_dump_json()
    
    # 1. Insert or update the new search
    cursor.execute(
        "INSERT OR REPLACE INTO search_cache (query, graph_data) VALUES (?, ?)", 
        (query.lower().strip(), json_string)
    )
    
    # 2. Enforce the Rolling Cache Cap!
    # This deletes the oldest rows, keeping only the newest 10,000.
    cursor.execute(f"""
        DELETE FROM search_cache 
        WHERE rowid NOT IN (
            SELECT rowid FROM search_cache 
            ORDER BY rowid DESC 
            LIMIT {limit}
        )
    """)
    
    conn.commit()
    conn.close()
    print(f"[+] Saved '{query}' to global cache. (Cap enforced at {limit} searches)")