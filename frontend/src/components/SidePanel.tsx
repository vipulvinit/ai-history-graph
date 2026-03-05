"use client";

import { Info, Link as LinkIcon, BookOpen, Quote, Calendar, MapPin, BrainCircuit } from "lucide-react";
import { GraphData } from "../app/page";

interface SidePanelProps {
  selectedEntity: any | null;
  graphData: GraphData | null;
}

export default function SidePanel({ selectedEntity, graphData }: SidePanelProps) {
  if (!selectedEntity) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-neutral-600 space-y-4 text-center">
        <Info size={48} strokeWidth={1.5} />
        <p className="text-sm">Click on any node in the graph<br />to explore its historical context.</p>
      </div>
    );
  }

  // BUG FIX: Unpack the mutated objects back into strings before checking!
  const relatedLinks = graphData?.links.filter((link: any) => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    return sourceId === selectedEntity.id || targetId === selectedEntity.id;
  }) || [];

  return (
    <div className="flex flex-col h-full text-neutral-300 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* Header & Badges */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
            {selectedEntity.group}
          </span>
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight">{selectedEntity.id}</h2>
        
        {/* NEW: Dynamic Rich Metadata Rendering */}
        <div className="flex flex-wrap gap-3 mt-4 text-xs text-neutral-400">
          {(selectedEntity.birth_year || selectedEntity.death_year) && (
            <div className="flex items-center"><Calendar size={14} className="mr-1"/> {selectedEntity.birth_year || "?"} - {selectedEntity.death_year || "?"}</div>
          )}
          {(selectedEntity.start_year || selectedEntity.end_year) && (
            <div className="flex items-center"><Calendar size={14} className="mr-1"/> {selectedEntity.start_year || "?"} - {selectedEntity.end_year || "?"}</div>
          )}
          {selectedEntity.location && (
            <div className="flex items-center"><MapPin size={14} className="mr-1"/> {selectedEntity.location}</div>
          )}
          {selectedEntity.origin_era && (
            <div className="flex items-center"><Info size={14} className="mr-1"/> Era: {selectedEntity.origin_era}</div>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-3 flex items-center">
          <BookOpen size={14} className="mr-2" /> Overview / Principle
        </h3>
        <p className="text-sm leading-relaxed text-neutral-300">
          {selectedEntity.description}
        </p>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-4 flex items-center">
          <LinkIcon size={14} className="mr-2" /> Known Links ({relatedLinks.length})
        </h3>
        <ul className="space-y-3 text-sm">
          {relatedLinks.map((conn: any, idx) => {
            const sourceId = typeof conn.source === 'object' ? conn.source.id : conn.source;
            const targetId = typeof conn.target === 'object' ? conn.target.id : conn.target;
            
            const isSource = sourceId === selectedEntity.id;
            const targetName = isSource ? targetId : sourceId;
            const directionLabel = isSource ? conn.label : `← ${conn.label}`;

            return (
              <li key={idx} className="bg-neutral-900/50 p-3 rounded-lg border border-neutral-800/50 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 font-mono text-[10px] uppercase tracking-wider bg-neutral-950 px-2 py-1 rounded">
                    {directionLabel}
                  </span>
                  <span className="text-white font-medium text-right truncate">
                    {targetName}
                  </span>
                </div>
                
                {/* NEW: Confidence Score and Snippet */}
                {conn.confidence_score && (
                  <div className="flex items-center text-[10px] text-green-400 font-mono mt-1">
                    <BrainCircuit size={12} className="mr-1"/> Confidence: {conn.confidence_score}/10
                  </div>
                )}
                {conn.snippet && (
                  <div className="text-xs text-neutral-500 italic mt-1 border-l-2 border-neutral-700 pl-2">
                    "{conn.snippet}"
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}