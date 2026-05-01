'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronDown, 
  Database, 
  Clock, 
  Zap, 
  Cpu,
  BrainCircuit,
  Info
} from 'lucide-react';
import Link from 'next/link';

interface MemoryNode {
  id: string;
  label: string;
  children?: MemoryNode[];
  metadata?: any;
}

interface WikiBrainProps {
  agentId: string;
}

export const WikiBrain: React.FC<WikiBrainProps> = ({ agentId }) => {
  const [tree, setTree] = useState<MemoryNode | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['root', 'sessions', 'facts', 'skills']));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTree() {
      try {
        const res = await fetch(`/api/agents/${agentId}/memory/tree`);
        const data = await res.json();
        if (data.success) setTree(data.tree);
      } catch (e) {
        console.error("Failed to fetch WikiBrain:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchTree();
  }, [agentId]);

  const toggleExpand = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  const renderNode = (node: MemoryNode, depth = 0) => {
    const isExpanded = expanded.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="select-none">
        <div 
          className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-colors ${
            depth === 0 ? 'bg-indigo-500/10 border border-indigo-500/20 mb-2' : 'hover:bg-white/5'
          }`}
          style={{ marginLeft: `${depth * 16}px` }}
          onClick={() => hasChildren && toggleExpand(node.id)}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown size={14} className="text-white/40" /> : <ChevronRight size={14} className="text-white/40" />
          ) : (
            <div className="w-3.5" />
          )}
          
          <div className="text-sm font-medium flex items-center gap-2">
            {node.id === 'root' && <BrainCircuit size={16} className="text-indigo-400" />}
            {node.id === 'sessions' && <Clock size={14} className="text-blue-400" />}
            {node.id === 'facts' && <Database size={14} className="text-emerald-400" />}
            {node.id === 'skills' && <Zap size={14} className="text-amber-400" />}
            
            <span className={depth === 0 ? 'font-black uppercase tracking-widest text-xs' : 'text-white/80'}>
              {node.label}
            </span>
            
            {node.metadata?.summary && (
              <span className="text-[10px] text-white/20 truncate max-w-[200px]">
                - {node.metadata.summary}
              </span>
            )}
          </div>

          {!hasChildren && node.metadata && (
            <button className="ml-auto p-1 opacity-0 group-hover:opacity-100 hover:text-white transition-all text-white/20">
              <Info size={12} />
            </button>
          )}
        </div>

        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {node.children?.map(child => renderNode(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  if (loading) return <div className="h-40 bg-white/5 rounded-2xl animate-pulse" />;

  return (
    <div className="p-6 bg-zinc-950 border border-white/5 rounded-3xl shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em] flex items-center gap-2">
          <BrainCircuit size={16} />
          WikiBrain Explorer
        </h3>
        <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
          Memory Hierarchy v2
        </div>
      </div>

      <div className="space-y-1">
        {tree && renderNode(tree)}
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
        <div className="text-[10px] text-white/30 font-medium max-w-[200px]">
          Knowledge nodes are automatically indexed via the Sovereign Gateway pulse loop.
        </div>
        <button className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-[10px] font-black text-white transition-all shadow-lg shadow-indigo-500/20">
          RE-INDEX BRAIN
        </button>
      </div>
    </div>
  );
};
