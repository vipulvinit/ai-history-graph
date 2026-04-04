"use client";

import { useState, useEffect } from "react";
import { Terminal } from "lucide-react";

export default function TerminalLoader() {
  const [textIndex, setTextIndex] = useState(0);
  
  const messages = [
    "Waking historical AI engine from deep sleep...",
    "Establishing neural link to Wikipedia archives...",
    "Querying temporal data...",
    "Synthesizing entities and mapping relationships...",
    "Calculating 3D physics coordinates...",
    "Almost there, rendering spatial graph..."
  ];

  useEffect(() => {
    // Cycle to the next message every 5.5 seconds
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev < messages.length - 1 ? prev + 1 : prev));
    }, 5500);
    
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-transparent font-mono ">
      <div className="p-8 rounded-lg border border-neutral-800 bg-black/80 flex flex-col items-center shadow-[0_0_30px_rgba(0,229,255,0.1)]">
        <Terminal size={40} className="mb-6 text-[#00e5ff] animate-pulse" />
        
        <div className="flex items-center text-sm md:text-base text-[#00e5ff]">
          <span className="mr-3 opacity-70">&gt;</span>
          <span className="tracking-wide">{messages[textIndex]}</span>
          <span className="animate-ping ml-1 w-2 h-4 bg-[#00e5ff] inline-block"></span>
        </div>
        
        <p className="mt-8 text-neutral-600 text-[10px] uppercase tracking-widest">
          Cold start may take up to 50 seconds
        </p>
      </div>
    </div>
  );
}