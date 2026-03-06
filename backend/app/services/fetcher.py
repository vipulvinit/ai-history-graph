import wikipedia
import re

def fetch_wikipedia_content(query: str, max_sentences: int = 15) -> str:
    """
    Intelligently splits complex queries and fetches context for multiple entities.
    """
    print(f"[*] Fetching Wikipedia context for: {query}")
    
    # 1. Split the query by common comparative words (and, vs, versus)
    split_pattern = r'\b(and|vs\.?|versus)\b'
    parts = re.split(split_pattern, query, flags=re.IGNORECASE)
    
    # 2. Clean up the split list to only keep the actual entities
    ignore_words = ['and', 'vs', 'vs.', 'versus']
    entities = [p.strip() for p in parts if p.lower().strip() not in ignore_words and p.strip()]
    
    # Fallback just in case the split didn't work
    if not entities:
        entities = [query]

    combined_context = []
    
    # 3. Fetch Wikipedia for each separate entity
    for entity in entities:
        try:
            # Search for the best matching page title first
            search_results = wikipedia.search(entity)
            if not search_results:
                print(f"[-] No Wikipedia page found for '{entity}'")
                continue
                
            best_match = search_results[0]
            
            # Split the sentence allowance evenly between entities
            sentences_per_entity = max(5, max_sentences // len(entities))
            summary = wikipedia.summary(best_match, sentences=sentences_per_entity)
            
            combined_context.append(f"--- Context for {best_match} ---\n{summary}")
            print(f"[+] Successfully fetched: {best_match}")
            
        except wikipedia.exceptions.DisambiguationError as e:
            # If Wikipedia isn't sure which one we mean, just grab the first option
            try:
                summary = wikipedia.summary(e.options[0], sentences=sentences_per_entity)
                combined_context.append(f"--- Context for {e.options[0]} ---\n{summary}")
                print(f"[+] Resolved disambiguation to: {e.options[0]}")
            except Exception:
                pass
        except Exception as e:
            print(f"[-] Error fetching '{entity}': {e}")
            
    # 4. Stitch it all together into one big text block for the AI
    final_text = "\n\n".join(combined_context)
    return final_text