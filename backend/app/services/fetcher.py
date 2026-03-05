import wikipedia

def fetch_historical_context(query: str) -> str:
    """
    Searches Wikipedia for multiple entities and stitches brief summaries together to save tokens.
    """
    print(f"[*] Searching Wikipedia for multi-context: {query}")
    try:
        # Ask Wikipedia for the top 2 results to ensure both sides of a complex query are caught
        search_results = wikipedia.search(query, results=2)
        
        if not search_results:
            return ""
            
        combined_text = ""
        
        for title in search_results:
            print(f"[*] Fetching component: {title}")
            try:
                page = wikipedia.page(title, auto_suggest=False)
                
                # TOKEN SAVER: Split the summary by periods and take only the first 4 sentences.
                # This gives the AI the core facts without the fluff.
                sentences = page.summary.split(". ")[:4]
                short_summary = ". ".join(sentences) + "."
                
                combined_text += f"--- {title} ---\n{short_summary}\n\n"
                
            except wikipedia.exceptions.DisambiguationError:
                # If a term is too vague, skip it to save time
                print(f"[*] Skipped vague term: {title}")
                continue
            except wikipedia.exceptions.PageError:
                continue

        return combined_text
        
    except Exception as e:
        print(f"[!] Fetcher error: {str(e)}")
        return ""