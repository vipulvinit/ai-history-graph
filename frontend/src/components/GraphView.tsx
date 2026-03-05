"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => <div className="text-neutral-500 animate-pulse">Initializing physics engine...</div>,
});

interface GraphViewProps {
  data: any;
  onNodeClick: (node: any) => void;
}

export default function GraphView({ data, onNodeClick }: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(null); // NEW: A reference to the graph engine itself
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // 1. Handle Window Resizing
  useEffect(() => {
    if (!containerRef.current) return;
    const updateDimensions = () => {
      setDimensions({
        width: containerRef.current?.clientWidth || 800,
        height: containerRef.current?.clientHeight || 600,
      });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // 2. Tweak the Physics Engine!
  useEffect(() => {
    if (fgRef.current) {
      // Make the nodes repel each other much harder so they don't overlap (-400 is a strong push)
      fgRef.current.d3Force('charge').strength(-400);
      
      // Make the links (edges) longer so you can easily see the connections
      fgRef.current.d3Force('link').distance(120);
    }
  }, [data]); // Re-run this physics tweak whenever new AI data arrives

  if (!data || !data.nodes) {
    return (
      <div className="w-full h-full bg-neutral-950 flex flex-col items-center justify-center text-neutral-600">
        <p className="text-lg">Awaiting historical query...</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full bg-neutral-950 flex items-center justify-center cursor-move">
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={data}
        backgroundColor="#0a0a0a"
        
        // --- NEW: Custom Canvas Drawing for Always-On Labels ---
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          // 1. Draw the colorful circle
          const radius = 6;
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
          ctx.fillStyle = 
            node.group === "Person" ? "#3b82f6" :
            node.group === "Event" ? "#ef4444" : 
            node.group === "Location" ? "#10b981" : "#a855f7";
          ctx.fill();

          // 2. Draw the text perfectly centered below the circle
          const label = node.id;
          const fontSize = 12 / globalScale; // Scales text dynamically as you zoom
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillStyle = "#e5e5e5"; // Bright white/gray text
          
          // Position the text slightly below the radius of the node
          ctx.fillText(label, node.x, node.y + radius + 2);
        }}
        // --------------------------------------------------------

        linkColor={() => "#525252"}
        linkWidth={1.5}
        linkDirectionalParticles={3}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={1}
        onNodeClick={onNodeClick}
      />
    </div>
  );
}