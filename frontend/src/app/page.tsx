"use client";

import dynamic from 'next/dynamic';
import { useState } from "react";
import SearchBar from "../components/SearchBar";
import SidePanel from "../components/SidePanel";
import TerminalLoader from "../components/TerminalLoader";
import { Loader2 } from "lucide-react"; // Added icon for the expanding state

interface Node { id: string; group: string; description: string; }
interface Edge { source: any; target: any; label: string; snippet?: string; }
export interface GraphData { nodes: Node[]; links: Edge[]; }

const ForceGraph3D = dynamic(() => import('../components/Graph3D'), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center text-neutral-500 font-mono text-sm">Initializing 3D Engine...</div>
});

export default function Home() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // NEW: State to track when God Mode is fetching
  const [isExpanding, setIsExpanding] = useState(false);

  const handleDataReceived = (data: GraphData) => {
    setGraphData(data);
    setSelectedEntity(null); 
    setIsLoading(false); 
  };

  // NEW: The God Mode Merge Logic
  const handleNodeDoubleClick = async (node: any) => {
    if (isExpanding || !graphData) return;
    
    setIsExpanding(true);

    try {
      const response = await fetch("https://history-graph-api.onrender.com/api/generate-graph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // We send the ID (name) of the node they just double-clicked!
        body: JSON.stringify({ query: node.id }), 
      });

      if (!response.ok) throw new Error("Expansion failed");
      const newData = await response.json();

      // Merge the newly fetched data into the existing galaxy
      setGraphData((prevData) => {
        if (!prevData) return newData;

        // 1. Create sets to track what we already have
        const existingNodeIds = new Set(prevData.nodes.map(n => n.id));
        const existingLinks = new Set(prevData.links.map(l => {
          const src = typeof l.source === 'object' ? l.source.id : l.source;
          const tgt = typeof l.target === 'object' ? l.target.id : l.target;
          return `${src}-${tgt}`;
        }));

        // 2. Filter out duplicates
        const uniqueNewNodes = newData.nodes.filter((n: any) => !existingNodeIds.has(n.id));
        const uniqueNewLinks = (newData.links || newData.edges || []).filter((l: any) => {
          const src = typeof l.source === 'object' ? l.source.id : l.source;
          const tgt = typeof l.target === 'object' ? l.target.id : l.target;
          return !existingLinks.has(`${src}-${tgt}`) && !existingLinks.has(`${tgt}-${src}`);
        });

        // 3. Combine them!
        return {
          nodes: [...prevData.nodes, ...uniqueNewNodes],
          links: [...prevData.links, ...uniqueNewLinks]
        };
      });

    } catch (error) {
      console.error("Failed to expand graph:", error);
    } finally {
      setIsExpanding(false);
    }
  };

  return (
    <main className="flex h-screen w-screen bg-[radial-gradient(ellipse_at_center,_#080d1e_0%,_#000000_80%)] text-white overflow-hidden relative">
      
      {/* NEW: God Mode "Expanding" Indicator */}
      {isExpanding && (
        <div className="absolute top-6 right-[400px] z-50 flex items-center bg-black/50 backdrop-blur-md border border-[#00e5ff]/30 px-4 py-2 rounded-full shadow-[0_0_15px_rgba(0,229,255,0.2)] text-[#00e5ff] text-sm font-mono animate-pulse">
          <Loader2 size={16} className="animate-spin mr-2" />
          Expanding Network...
        </div>
      )}

      {/* Left Column: The 3D Canvas Area */}
      <div className="flex-1 relative flex flex-col">
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-4">
          <SearchBar onDataReceived={handleDataReceived} setIsLoading={setIsLoading} />
        </div>

        <div className="flex-1 w-full h-full bg-transparent">
          {isLoading ? (
            <TerminalLoader />
          ) : graphData && graphData.nodes.length > 0 ? (
            <ForceGraph3D 
              data={graphData} 
              onNodeClick={setSelectedEntity} 
              onNodeDoubleClick={handleNodeDoubleClick}
            />
          ) : graphData && graphData.nodes.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-red-400 font-mono text-sm">
              Temporal anomaly detected. No records found for that query. Try a broader search.
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-500 font-mono text-sm">
              Enter a historical query to ignite the 3D galaxy...
            </div>
          )}
        </div>
      </div>

      {/* Right Column: The Glass UI Side Panel */}
      <div className="w-96 shrink-0 border-l border-white/10 bg-black/30 backdrop-blur-xl p-6 overflow-y-auto hidden md:block shadow-2xl z-20 relative">
        <SidePanel selectedEntity={selectedEntity} graphData={graphData} />
      </div>

    </main>
  );
}