"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { SovereignStatusBar } from "@/components/layout/SovereignStatusBar";
import { ShoppingCart, Star, Shield, Zap, Search, Filter } from "lucide-react";

const agents = [
  { id: 1, name: "Research Analyst Pro", role: "Data Scientist", price: "0.5", rating: 4.9, reviews: 128, status: "online", kyc: true, color: "#6366f1", tags: ["research", "summarization"], description: "Advanced research agent with multi-source data aggregation and Pi KYC-verified identity." },
  { id: 2, name: "Customer Support Bot", role: "Support Specialist", price: "0.1", rating: 4.7, reviews: 342, status: "online", kyc: true, color: "#8b5cf6", tags: ["support", "nlp"], description: "24/7 sovereign support agent with verified human oversight and Ed25519 signed payloads." },
  { id: 3, name: "Code Review Agent", role: "Senior Engineer", price: "1.0", rating: 4.8, reviews: 89, status: "online", kyc: true, color: "#06b6d4", tags: ["coding", "security"], description: "Autonomous code review and security audit agent anchored to Pi Network identity." },
  { id: 4, name: "Robotics Controller", role: "VLA Agent", price: "2.5", rating: 4.6, reviews: 41, status: "offline", kyc: true, color: "#f59e0b", tags: ["robotics", "openpi"], description: "Vision-Language-Action agent compatible with openpi and π0.7 — the only AIX VLA agent." },
  { id: 5, name: "Finance Forecaster", role: "Quant Analyst", price: "0.8", rating: 4.5, reviews: 212, status: "online", kyc: true, color: "#10b981", tags: ["finance", "ml"], description: "Time-series forecasting agent with M2M micropayment settlement via Pi Protocol v23." },
  { id: 6, name: "Content Generator", role: "Creative Writer", price: "0.3", rating: 4.4, reviews: 567, status: "online", kyc: false, color: "#ec4899", tags: ["content", "creative"], description: "Multi-lingual content agent — KYC verification pending. Use in sandbox mode only." },
];

const tags = ["All", "research", "support", "coding", "robotics", "finance", "content"];

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");

  const filtered = agents.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase());
    const matchTag = activeTag === "All" || a.tags.includes(activeTag);
    return matchSearch && matchTag;
  });

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-[family-name:var(--font-manrope)]">
      <Navbar />
      <div className="pt-28 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text text-gradient tracking-tight mb-2">
            Agent Marketplace
          </h1>
          <p className="text-gray-400 text-lg">Discover sovereign AI agents — all KYC-verified via Pi Network.</p>
        </motion.div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search agents..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[rgba(255,255,255,0.05)] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)]/50 transition"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="text-gray-500 w-4 h-4" />
            {tags.map(tag => (
              <button key={tag} onClick={() => setActiveTag(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeTag === tag
                    ? "bg-[var(--color-primary)] text-black"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden" animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        >
          {filtered.map(agent => (
            <motion.div key={agent.id}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              className="glass-panel rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg" style={{ background: agent.color }}>
                    {agent.name[0]}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">{agent.name}</h3>
                    <p className="text-xs text-gray-500">{agent.role}</p>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full mt-1 ${agent.status === 'online' ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
              </div>

              <p className="text-xs text-gray-400 mb-4 leading-relaxed">{agent.description}</p>

              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {agent.tags.map(t => (
                  <span key={t} className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-gray-400 border border-white/10">{t}</span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs text-gray-300">{agent.rating}</span>
                  <span className="text-xs text-gray-600">({agent.reviews})</span>
                </div>
                {agent.kyc ? (
                  <span className="flex items-center gap-1 text-[10px] text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full">
                    <Shield className="w-2.5 h-2.5" /> KYC Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-full">
                    <Zap className="w-2.5 h-2.5" /> Pending KYC
                  </span>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-white">{agent.price}</span>
                  <span className="text-xs text-gray-500 ml-1">π / call</span>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)] text-black text-xs font-bold hover:brightness-110 transition">
                  <ShoppingCart className="w-3.5 h-3.5" /> Deploy
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-24 text-gray-500">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No agents found.</p>
            <p className="text-sm mt-1">Try a different search or filter.</p>
          </div>
        )}
      </div>
      <SovereignStatusBar />
    </div>
  );
}
