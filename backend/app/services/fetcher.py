import requests
import re

def fetch_historical_context(query: str, max_sentences: int = 15) -> str:
    """
    Intelligently fetches context using Wikipedia's modern REST API.
    Bypasses the buggy 'wikipedia' pip package entirely.
    """
    print(f"[*] Fetching Wikipedia context for: {query}")
    
    split_pattern = r'\b(and|vs\.?|versus)\b'
    parts = re.split(split_pattern, query, flags=re.IGNORECASE)
    ignore_words = ['and', 'vs', 'vs.', 'versus']
    entities = [p.strip() for p in parts if p.lower().strip() not in ignore_words and p.strip()]
    
    if not entities:
        entities = [query]

    combined_context = []
    
    for entity in entities:
        try:
            # 1. Search for the exact Wikipedia title via the official search API
            search_url = f"https://en.wikipedia.org/w/api.php?action=opensearch&search={entity}&limit=1&namespace=0&format=json"
            search_resp = requests.get(search_url).json()
            
            if not search_resp[1]:
                print(f"[-] No Wikipedia page found for '{entity}'")
                continue
                
            best_match = search_resp[1][0]
            
            # 2. Fetch the summary using the modern REST API
            formatted_title = best_match.replace(" ", "_")
            summary_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{formatted_title}"
            summary_resp = requests.get(summary_url).json()
            
            if 'extract' in summary_resp:
                summary = summary_resp['extract']
                combined_context.append(f"--- Context for {best_match} ---\n{summary}")
                print(f"[+] Successfully fetched: {best_match}")
            else:
                print(f"[-] Could not extract summary for '{best_match}'")
                
        except Exception as e:
            print(f"[-] Error fetching '{entity}': {e}")
            
    final_text = "\n\n".join(combined_context)
    return final_text