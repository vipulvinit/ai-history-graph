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
      <div className="h-full flex flex-col items-center justify-center text-neutral-400 space-y-4 text-center">
        <Info size={48} strokeWidth={1.5} className="text-white/20" />
        <p className="text-sm font-light">Click on any glowing node<br />to explore its history.</p>
      </div>
    );
  }

  const relatedLinks = graphData?.links.filter((link: any) => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    return sourceId === selectedEntity.id || targetId === selectedEntity.id;
  }) || [];

  return (
    <div className="flex flex-col h-full text-neutral-200 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* Header & Badges */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          {/* NEW: Glowing Cyan Glass Badge */}
          <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/30 rounded backdrop-blur-sm">
            {selectedEntity.group}
          </span>
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">{selectedEntity.id}</h2>
        
        <div className="flex flex-wrap gap-3 mt-4 text-xs text-neutral-300">
          {(selectedEntity.birth_year || selectedEntity.death_year) && (
            <div className="flex items-center"><Calendar size={14} className="mr-1 opacity-70"/> {selectedEntity.birth_year || "?"} - {selectedEntity.death_year || "?"}</div>
          )}
          {(selectedEntity.start_year || selectedEntity.end_year) && (
            <div className="flex items-center"><Calendar size={14} className="mr-1 opacity-70"/> {selectedEntity.start_year || "?"} - {selectedEntity.end_year || "?"}</div>
          )}
          {selectedEntity.location && (
            <div className="flex items-center"><MapPin size={14} className="mr-1 opacity-70"/> {selectedEntity.location}</div>
          )}
          {selectedEntity.origin_era && (
            <div className="flex items-center"><Info size={14} className="mr-1 opacity-70"/> Era: {selectedEntity.origin_era}</div>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3 flex items-center">
          <BookOpen size={14} className="mr-2" /> Overview / Principle
        </h3>
        <p className="text-sm leading-relaxed text-neutral-200 font-light">
          {selectedEntity.description}
        </p>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-4 flex items-center">
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
              // NEW: Frosted glass list items instead of solid gray blocks
              <li key={idx} className="bg-white/5 backdrop-blur-md p-3 rounded-lg border border-white/10 flex flex-col gap-2 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[#00e5ff] font-mono text-[10px] uppercase tracking-wider bg-black/40 px-2 py-1 rounded border border-white/5">
                    {directionLabel}
                  </span>
                  <span className="text-white font-medium text-right truncate drop-shadow-md">
                    {targetName}
                  </span>
                </div>
                
                {conn.confidence_score && (
                  <div className="flex items-center text-[10px] text-green-400 font-mono mt-1">
                    <BrainCircuit size={12} className="mr-1"/> Confidence: {conn.confidence_score}/10
                  </div>
                )}
                {conn.snippet && (
                  <div className="text-xs text-neutral-400 italic mt-1 border-l-2 border-white/20 pl-2">
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