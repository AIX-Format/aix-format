"use client";

import { AgentCard } from "@/components/agents/AgentCard";
import { useLocalAgents } from "@/hooks/useLocalAgents";
import { Plus } from "lucide-react";
import Link from "next/link";

export function AgentsDashboard() {
  const { agents, loaded } = useLocalAgents();
  
  const displayAgents = agents.slice(0, 2);

  if (!loaded) {
    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-white mb-2">My Agents</h2>
        <div className="text-gray-400 text-sm">Loading agents...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">My Agents</h2>
        <Link
          href="/builder"
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg text-primary text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Agent
        </Link>
      </div>
      
      {displayAgents.length === 0 ? (
        <div className="border border-white/10 rounded-2xl p-8 text-center bg-white/5">
          <p className="text-gray-400 mb-4">No agents created yet</p>
          <Link
            href="/builder"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 rounded-xl text-black font-semibold transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Your First Agent
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 w-full max-w-lg">
          {displayAgents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
            />
          ))}
        </div>
      )}
    </div>
  );
}
