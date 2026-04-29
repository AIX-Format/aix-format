"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Copy, ExternalLink, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DIDCardProps {
  did: string;
  name: string;
  type?: string;
  issuedAt?: string;
  className?: string;
}

export function DIDCard({ did, name, type = "Sovereign Identity", issuedAt, className }: DIDCardProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(did);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c101c]/60 backdrop-blur-xl p-6 shadow-2xl",
        className
      )}
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00dbe9]/5 blur-[60px] rounded-full -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#d2bbff]/5 blur-[50px] rounded-full -ml-12 -mb-12" />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#00dbe9]/10 border border-[#00dbe9]/20 shadow-[0_0_15px_rgba(0,219,233,0.1)]">
              <Shield className="w-5 h-5 text-[#00dbe9]" />
            </div>
            <div>
              <h3 className="text-white font-bold tracking-tight">{name}</h3>
              <p className="text-[10px] text-[#00dbe9] font-bold uppercase tracking-widest">{type}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-tighter">Active</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#8888a0] uppercase tracking-wider">Axiom Identifier (DID)</label>
            <div className="flex items-center gap-2 group">
              <div className="flex-1 bg-black/40 border border-white/[0.05] rounded-lg px-3 py-2.5 font-mono text-[11px] text-[#d2bbff] truncate transition-colors group-hover:border-white/10">
                {did}
              </div>
              <button 
                onClick={handleCopy}
                className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] hover:border-white/20 text-[#8888a0] hover:text-white transition-all active:scale-95"
                title="Copy DID"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-[#00dbe9]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-[#404050] uppercase tracking-widest">Authority</span>
              <p className="text-xs text-white/80 font-medium">axiomid.app</p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-[#404050] uppercase tracking-widest">Status</span>
              <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-white/[0.05] flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-[#404050] uppercase tracking-[0.2em]">Created</span>
            <span className="text-[10px] text-[#8888a0]">{issuedAt || new Date().toLocaleDateString()}</span>
          </div>
          <button className="flex items-center gap-1.5 text-[10px] font-bold text-[#00dbe9] hover:text-white transition-colors uppercase tracking-widest">
            View details
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
