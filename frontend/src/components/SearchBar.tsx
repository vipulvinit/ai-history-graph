"use client";
import { useState } from "react";
import { Search, Loader2 } from "lucide-react";

interface SearchBarProps {
  onDataReceived: (data: any) => void;
  setIsLoading: (loading: boolean) => void; 
}

export default function SearchBar({ onDataReceived, setIsLoading: setGlobalLoading }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!query.trim()) return;

    setIsLocalLoading(true);
    setGlobalLoading(true); 
    
    try {
      const response = await fetch("https://history-graph-api.onrender.com/api/generate-graph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query }), 
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      onDataReceived(data);

    } catch (error) {
      console.error("Failed to fetch graph data:", error);
      setGlobalLoading(false); 
    } finally {
      setIsLocalLoading(false);
      setQuery(""); 
    }
  };

  return (
    <form 
      onSubmit={handleSearch}
      // NEW: Frosted Glass styling for the main bar
      className="flex items-center w-full bg-black/40 backdrop-blur-md border border-white/10 rounded-full shadow-2xl overflow-hidden focus-within:border-[#00e5ff]/50 focus-within:ring-1 focus-within:ring-[#00e5ff]/50 transition-all duration-300"
    >
      <div className="pl-5 pr-3 text-neutral-400">
        {isLocalLoading ? (
          <Loader2 size={20} className="animate-spin text-[#00e5ff]" />
        ) : (
          <Search size={20} />
        )}
      </div>
      
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search an era (e.g., Crusades and Palestine-Israel conflict)..."
        className="flex-1 bg-transparent py-4 text-white placeholder-neutral-400 focus:outline-none"
        disabled={isLocalLoading}
      />
      
      <button
        type="submit"
        disabled={isLocalLoading || !query.trim()}
        // NEW: Frosted Glass styling for the button
        className="px-6 py-4 bg-white/5 text-neutral-300 font-medium hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-l border-white/10"
      >
        {isLocalLoading ? "Analyzing..." : "Map History"}
      </button>
    </form>
  );
}