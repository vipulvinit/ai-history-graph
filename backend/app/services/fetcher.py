import requests
import re

def fetch_historical_context(query: str, max_sentences: int = 15) -> str:
    """
    Intelligently fetches context using Wikipedia's modern REST API.
    Includes User-Agent headers to prevent cloud-server blocks.
    """
    print(f"[*] Fetching Wikipedia context for: {query}")
    
    split_pattern = r'\b(and|vs\.?|versus)\b'
    parts = re.split(split_pattern, query, flags=re.IGNORECASE)
    ignore_words = ['and', 'vs', 'vs.', 'versus']
    entities = [p.strip() for p in parts if p.lower().strip() not in ignore_words and p.strip()]
    
    if not entities:
        entities = [query]

    combined_context = []
    
    # NEW: Wikipedia requires a User-Agent from cloud servers.
    # We declare our app so they don't block our deployed IP.
    headers = {
        'User-Agent': 'HistoricalGraphApp/1.0 (Educational Project)'
    }
    
    for entity in entities:
        try:
            # 1. Search for the exact Wikipedia title via the official search API
            search_url = f"https://en.wikipedia.org/w/api.php?action=opensearch&search={entity}&limit=1&namespace=0&format=json"
            
            # Pass the passport!
            search_resp = requests.get(search_url, headers=headers)
            
            # Safety check: Did Wikipedia block us?
            if search_resp.status_code != 200:
                print(f"[-] WIKI BLOCKED SEARCH: {search_resp.status_code} - {search_resp.text[:50]}")
                continue
                
            search_data = search_resp.json()
            
            if not search_data[1]:
                print(f"[-] No Wikipedia page found for '{entity}'")
                continue
                
            best_match = search_data[1][0]
            
            # 2. Fetch the summary using the modern REST API
            formatted_title = best_match.replace(" ", "_")
            summary_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{formatted_title}"
            
            # Pass the passport again!
            summary_resp = requests.get(summary_url, headers=headers)
            
            # Safety check
            if summary_resp.status_code != 200:
                print(f"[-] WIKI BLOCKED SUMMARY: {summary_resp.status_code} - {summary_resp.text[:50]}")
                continue
                
            summary_data = summary_resp.json()
            
            if 'extract' in summary_data:
                summary = summary_data['extract']
                combined_context.append(f"--- Context for {best_match} ---\n{summary}")
                print(f"[+] Successfully fetched: {best_match}")
            else:
                print(f"[-] Could not extract summary for '{best_match}'")
                
        except Exception as e:
            print(f"[-] Error fetching '{entity}': {e}")
            
    final_text = "\n\n".join(combined_context)
    return final_text