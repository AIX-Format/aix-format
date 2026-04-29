"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { SovereignStatusBar } from "@/components/layout/SovereignStatusBar";
import { Plus, Shield, Activity, Trash2, Settings, Play, Pause, ExternalLink, FileCode } from "lucide-react";

const initialAgents = [
  { id: 1, name: "Data Analyzer Pro", role: "Data Scientist", price: "0.5", status: "online", kyc: true, color: "#6366f1", calls: 1420, earnings: "710", did: "did:axiom:axiomid.app:agent_001" },
  { id: 2, name: "Customer Support Bot", role: "Support Specialist", price: "0.1", status: "offline", kyc: true, color: "#8b5cf6", calls: 380, earnings: "38", did: "did:axiom:axiomid.app:agent_002" },
];

export default function MyAgentsPage() {
  const [agents, setAgents] = useState(initialAgents);
  const [showDeploy, setShowDeploy] = useState(false);

  const toggleStatus = (id: number) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, status: a.status === 'online' ? 'offline' : 'online' } : a));
  };

  const removeAgent = (id: number) => {
    setAgents(prev => prev.filter(a => a.id !== id));
  };

  const totalEarnings = agents.reduce((sum, a) => sum + parseFloat(a.earnings), 0).toFixed(1);
  const totalCalls = agents.reduce((sum, a) => sum + a.calls, 0);
  const onlineCount = agents.filter(a => a.status === 'online').length;

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-[family-name:var(--font-manrope)]">
      <Navbar />
      <div className="pt-28 pb-20 px-6 md:px-12 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-10 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text text-gradient tracking-tight mb-2">My Agents</h1>
            <p className="text-gray-400">Manage your sovereign AI agents — KYC-anchored & Pi-signed.</p>
          </div>
          <button onClick={() => setShowDeploy(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-primary)] text-black text-sm font-bold hover:brightness-110 transition shadow-[0_0_22px_rgba(57,255,20,0.3)]">
            <Plus className="w-4 h-4" /> Deploy New Agent
          </button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "Total Agents", value: agents.length, icon: <FileCode className="w-4 h-4" />, color: "text-indigo-400" },
            { label: "Online Now", value: onlineCount, icon: <Activity className="w-4 h-4" />, color: "text-green-400" },
            { label: "Total Earnings", value: `${totalEarnings} π`, icon: <Shield className="w-4 h-4" />, color: "text-yellow-400" },
          ].map(s => (
            <div key={s.label} className="glass-panel rounded-xl p-4 border border-white/5">
              <div className={`flex items-center gap-2 mb-1 ${s.color}`}>{s.icon}<span className="text-xs">{s.label}</span></div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Agents List */}
        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {agents.map(agent => (
              <motion.div key={agent.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="glass-panel rounded-2xl p-5 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0" style={{ background: agent.color }}>
                  {agent.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-white font-semibold">{agent.name}</h3>
                    {agent.kyc && (
                      <span className="flex items-center gap-1 text-[10px] text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full">
                        <Shield className="w-2.5 h-2.5" /> KYC
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{agent.did}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>{agent.calls.toLocaleString()} calls</span>
                    <span className="text-yellow-400 font-semibold">{agent.earnings} π earned</span>
                    <span className="font-mono">{agent.price} π/call</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleStatus(agent.id)}
                    className={`p-2 rounded-full border transition-all ${
                      agent.status === 'online'
                        ? 'border-green-400/30 text-green-400 hover:bg-green-400/10'
                        : 'border-gray-600 text-gray-500 hover:bg-white/5'
                    }`}>
                    {agent.status === 'online' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button className="p-2 rounded-full border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition">
                    <Settings className="w-4 h-4" />
                  </button>
                  <a href={`https://axiomid.app/agent/${agent.id}`} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-full border border-white/10 text-gray-400 hover:text-[var(--color-primary)] hover:bg-white/5 transition">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button onClick={() => removeAgent(agent.id)}
                    className="p-2 rounded-full border border-red-500/20 text-red-400 hover:bg-red-500/10 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {agents.length === 0 && (
            <div className="text-center py-24 text-gray-500">
              <FileCode className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No agents deployed yet.</p>
              <p className="text-sm mt-1">Deploy your first sovereign agent to get started.</p>
              <button onClick={() => setShowDeploy(true)}
                className="mt-6 px-6 py-2.5 rounded-full bg-[var(--color-primary)] text-black text-sm font-bold hover:brightness-110 transition">
                Deploy First Agent
              </button>
            </div>
          )}
        </div>

        {/* Deploy Modal */}
        <AnimatePresence>
          {showDeploy && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
              onClick={() => setShowDeploy(false)}
            >
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="glass-panel-heavy rounded-2xl p-8 max-w-md w-full border border-white/10"
                onClick={e => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold text-white mb-2">Deploy New Agent</h2>
                <p className="text-sm text-gray-400 mb-6">Configure and sign your <code className="text-[var(--color-primary)]">.aix</code> payload with Pi KYC identity.</p>
                <div className="flex flex-col gap-3">
                  <input type="text" placeholder="Agent name" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[var(--color-primary)]/50" />
                  <input type="text" placeholder="Role / Specialty" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[var(--color-primary)]/50" />
                  <input type="number" placeholder="Price per call (π)" className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[var(--color-primary)]/50" />
                </div>
                <div className="mt-6 flex gap-3">
                  <button className="flex-1 px-4 py-2.5 rounded-full bg-[var(--color-primary)] text-black text-sm font-bold hover:brightness-110 transition">Sign & Deploy</button>
                  <button onClick={() => setShowDeploy(false)} className="px-4 py-2.5 rounded-full border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition">Cancel</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <SovereignStatusBar />
    </div>
  );
}
