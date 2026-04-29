"use client";

import { motion } from "framer-motion";
import { FileCode, Shield, Zap, Info } from "lucide-react";

interface DiscoveryPreviewProps {
  manifest: any;
}

export function DiscoveryPreview({ manifest }: DiscoveryPreviewProps) {
  const discovery = {
    "@context": "https://www.w3.org/ns/ai-agent",
    "spec_version": "1.3.0",
    "name": manifest.meta?.name || "Unnamed Agent",
    "identity": {
      "did": manifest.identity_layer?.id || "did:axiom:pending",
      "kyc_tier": manifest.identity_layer?.kyc_tier || 0
    },
    "capabilities": {
      "mcp": {
        "tools": (manifest.skills || []).map((s: any) => s.name)
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
        <Info className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm">
          This preview shows how your agent will appear to the MCP discovery layer and other agents on the network.
        </p>
      </div>

      <div className="rounded-2xl bg-black/40 border border-white/10 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono text-gray-300">agent.aix.json (MCP Discovery)</span>
          </div>
          <div className="flex items-center gap-2">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live Preview</span>
          </div>
        </div>
        <pre className="p-6 text-[11px] font-mono text-blue-300 overflow-x-auto leading-relaxed max-h-[400px]">
          {JSON.stringify(discovery, null, 2)}
        </pre>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-2 mb-2 text-white font-bold text-sm">
            <Shield className="w-4 h-4 text-emerald-400" />
            W3C Compliant
          </div>
          <p className="text-xs text-gray-500">Matches the latest Server Metadata Discovery draft (2026).</p>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-2 mb-2 text-white font-bold text-sm">
            <Zap className="w-4 h-4 text-amber-400" />
            MCP Ready
          </div>
          <p className="text-xs text-gray-500">Exposes skills as standardized tools for cross-agent calls.</p>
        </div>
      </div>
    </div>
  );
}
