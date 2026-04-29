"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { SovereignStatusBar } from "@/components/layout/SovereignStatusBar";
import { useLocalAgents } from "@/hooks/useLocalAgents";
import { DiscoveryPreview } from "@/components/studio/DiscoveryPreview";
import { 
  Shield, 
  Zap, 
  BrainCircuit, 
  ArrowLeft, 
  Globe,
  Trash2,
  FileCode
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function AgentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { getAgent, deleteAgent } = useLocalAgents();
  const agentId = params.id as string;
  const agent = getAgent(agentId);
  const [activeTab, setActiveTab] = useState<"overview" | "capabilities" | "discovery">("overview");

  if (!agent) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Agent Not Found</h1>
          <Link href="/marketplace" className="btn btn-primary">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this agent?")) {
      deleteAgent(agentId);
      router.push("/my-agents");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-[family-name:var(--font-geist-sans)]">
      <Navbar />
      
      <div className="pt-28 pb-20 px-6 md:px-12 max-w-5xl mx-auto">
        {/* Back Button */}
        <Link href="/marketplace" className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Marketplace</span>
        </Link>

        {/* Hero Section */}
        <div className="relative mb-12 p-8 rounded-3xl bg-white/[0.03] border border-white/10 overflow-hidden">
          <div 
            className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px] opacity-20"
            style={{ backgroundColor: agent.color || "#00d4ff" }}
          />
          
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div 
              className="w-24 h-24 rounded-3xl flex items-center justify-center border-2"
              style={{ 
                background: `linear-gradient(135deg, ${agent.color}20, ${agent.color}40)`,
                borderColor: `${agent.color}40`,
                boxShadow: `0 0 30px ${agent.color}30`
              }}
            >
              <BrainCircuit className="w-12 h-12" style={{ color: agent.color }} />
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-4xl font-black text-white tracking-tight">{agent.manifest.meta.name}</h1>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                  <Shield className="w-3 h-3" />
                  AxiomID Verified
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
                  v{agent.manifest.meta.version}
                </span>
              </div>
              <p className="text-gray-400 text-lg max-w-2xl">{agent.manifest.meta.description}</p>
            </div>

            <div className="flex gap-3">
              <button className="btn btn-primary px-8">Hire Agent</button>
              <button 
                onClick={handleDelete}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-white/10 mb-8">
          {(["overview", "capabilities", "discovery"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
                activeTab === tab ? "text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)]" 
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === "overview" && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="md:col-span-2 space-y-6">
                <section className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    Identity Layer
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-black/20">
                      <span className="text-gray-400 text-sm">Axiom DID</span>
                      <span className="text-white font-mono text-xs">{agent.manifest.identity_layer.id}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-black/20">
                      <span className="text-gray-400 text-sm">KYC Trust Tier</span>
                      <span className="text-amber-400 font-bold">Tier {agent.manifest.identity_layer.kyc_tier || 0}</span>
                    </div>
                  </div>
                </section>

                <section className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Economics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-black/20">
                      <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Model</p>
                      <p className="text-white capitalize font-bold">{agent.manifest.economics.pricing_model}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-black/20">
                      <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Currency</p>
                      <p className="text-white font-bold">{agent.manifest.economics.currency || 'PI'}</p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                  <h4 className="text-white font-bold mb-4">Performance</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Success Rate</span>
                        <span className="text-white font-bold">{agent.successRate || 100}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${agent.successRate || 100}%` }} />
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Tasks Completed</p>
                      <p className="text-2xl font-black text-white">{(agent.tasksCompleted || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "capabilities" && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agent.manifest.skills.map((skill, index) => (
                  <div key={index} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                        <Zap className="w-4 h-4" />
                      </div>
                      <h4 className="text-white font-bold">{skill.name}</h4>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2">{skill.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "discovery" && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
            >
              <DiscoveryPreview manifest={agent.manifest} />
            </motion.div>
          )}
        </div>
      </div>

      <SovereignStatusBar />
    </div>
  );
}
