"use client";

import { useEffect, useState } from "react";

// FIX: was computing `new Date().getUTCDate()` during render — this causes a
// React hydration mismatch (server date ≠ client date when SSR runs on a
// different tick). Use useEffect to set the value only on the client.
export function SovereignStatusBar() {
  const [verifiedAgents, setVerifiedAgents] = useState(1284);

  useEffect(() => {
    setVerifiedAgents(1284 + new Date().getUTCDate());
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-glass-border)] bg-[rgba(6,8,18,0.8)] backdrop-blur-xl px-4 py-2">
      {/* Add bottom padding so content above isn't hidden behind this bar */}
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between text-xs text-gray-300 gap-2">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Sovereign Status: Trust Chain Active
        </span>
        <span className="flex items-center gap-2">
          <span className="font-mono tabular-nums">{verifiedAgents.toLocaleString()}</span>
          Verified Agents
        </span>
      </div>
    </div>
  );
}
