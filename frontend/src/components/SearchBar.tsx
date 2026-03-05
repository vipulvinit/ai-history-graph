"use client";
import { useState } from "react";
import { Search, Loader2 } from "lucide-react";

// Add this interface
interface SearchBarProps {
  onDataReceived: (data: any) => void;
}

// Pass the prop into the function
export default function SearchBar({ onDataReceived }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!query.trim()) return;

    setIsLoading(true);
    
    try {
      const response = await fetch("https://history-graph-api.onrender.com/api/generate-graph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query }), 
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      
      // FIRE THE PROP HERE TO UPDATE THE WHOLE APP!
      onDataReceived(data);

    } catch (error) {
      console.error("Failed to fetch graph data:", error);
    } finally {
      setIsLoading(false);
      setQuery(""); 
    }
  };

// ... keep the exact same return (JSX) statement from before! ...

  return (
    <form 
      onSubmit={handleSearch}
      className="flex items-center w-full bg-neutral-900 border border-neutral-700 rounded-full shadow-2xl overflow-hidden focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all duration-300"
    >
      <div className="pl-5 pr-3 text-neutral-400">
        {isLoading ? (
          <Loader2 size={20} className="animate-spin text-blue-400" />
        ) : (
          <Search size={20} />
        )}
      </div>
      
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search an era (e.g., Crusades and Palestine-Israel conflict)..."
        className="flex-1 bg-transparent py-4 text-white placeholder-neutral-500 focus:outline-none"
        disabled={isLoading}
      />
      
      <button
        type="submit"
        disabled={isLoading || !query.trim()}
        className="px-6 py-4 bg-neutral-800 text-neutral-300 font-medium hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-l border-neutral-700"
      >
        {isLoading ? "Analyzing Text..." : "Map History"}
      </button>
    </form>
  );
}