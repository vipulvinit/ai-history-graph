"use client";

import { useState } from "react";
import SearchBar from "../components/SearchBar";
import GraphView from "../components/GraphView";
import SidePanel from "../components/SidePanel";

// Basic shape based on our models
interface Node { id: string; group: string; description: string; }
interface Edge { source: string; target: string; label: string; snippet?: string; }
export interface GraphData { nodes: Node[]; links: Edge[]; }

export default function Home() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);

  // We pass this function down to SearchBar so it can update the graph
  const handleDataReceived = (data: GraphData) => {
    setGraphData(data);
    setSelectedEntity(null); // Reset side panel on new search
  };

  return (
    <main className="flex h-screen w-screen bg-neutral-950 text-white overflow-hidden">
      
      {/* Left Area: The Graph and Search */}
      <div className="flex-1 relative flex flex-col">
        
        {/* Floating Search Bar */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-2xl px-4">
          <SearchBar onDataReceived={handleDataReceived} />
        </div>

        {/* The Interactive Canvas */}
        <div className="flex-1 w-full h-full bg-neutral-900/50">
          <GraphView data={graphData} onNodeClick={setSelectedEntity} />
        </div>

      </div>

      {/* Right Area: Context Panel */}
      <div className="w-96 border-l border-neutral-800 bg-neutral-950 p-6 overflow-y-auto hidden md:block">
        <SidePanel selectedEntity={selectedEntity} graphData={graphData} />
      </div>

    </main>
  );
}