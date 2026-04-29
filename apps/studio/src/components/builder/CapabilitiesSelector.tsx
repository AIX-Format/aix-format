"use client";

import { useState } from "react";
import { Check, Cpu, Globe, Lock, MessageSquare, Database, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

const capabilities = [
  { id: "nlp", label: "Natural Language", icon: MessageSquare, desc: "Process and generate text" },
  { id: "web", label: "Web Access", icon: Globe, desc: "Browse and fetch real-time data" },
  { id: "crypto", label: "Pi Network", icon: Lock, desc: "Handle Pi payments and wallets" },
  { id: "db", label: "Memory (Vector)", icon: Database, desc: "Long-term state persistence" },
  { id: "compute", label: "Code Execution", icon: Terminal, desc: "Run sandboxed code" },
  { id: "vision", label: "Vision", icon: Cpu, desc: "Analyze images and video" },
];

export function CapabilitiesSelector() {
  const [selected, setSelected] = useState<string[]>(["nlp"]);

  const toggle = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {capabilities.map((cap) => {
        const isSelected = selected.includes(cap.id);
        const Icon = cap.icon;

        return (
          <button
            key={cap.id}
            onClick={() => toggle(cap.id)}
            className={cn(
              "p-4 rounded-2xl border text-left transition-all relative group",
              isSelected 
                ? "bg-[var(--color-primary-dim)]/10 border-[var(--color-primary-dim)]/40 shadow-[0_0_15px_rgba(0,243,255,0.05)]" 
                : "bg-white/[0.02] border-white/[0.08] hover:border-white/[0.2]"
            )}
          >
            <div className="flex items-start justify-between">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors",
                isSelected ? "bg-[var(--color-primary)] text-black" : "bg-white/[0.05] text-[var(--color-on-surface-variant)] group-hover:text-white"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                  <Check className="w-3 h-3 text-black" />
                </div>
              )}
            </div>
            <h3 className={cn("font-bold text-sm mb-1", isSelected ? "text-white" : "text-[var(--color-on-surface-variant)] group-hover:text-white")}>
              {cap.label}
            </h3>
            <p className="text-[10px] text-[var(--color-on-surface-variant)] uppercase tracking-tight opacity-70">
              {cap.desc}
            </p>
          </button>
        );
      })}
    </div>
  );
}
