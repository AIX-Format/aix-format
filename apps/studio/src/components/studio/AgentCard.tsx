"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Shield, BrainCircuit, Zap, MoreHorizontal, TrendingUp } from "lucide-react";

interface AgentCardProps {
  name: string;
  role: string;
  price: string;
  status: "online" | "offline" | "busy";
  color?: string;
  successRate?: number;
  tasksCompleted?: number;
}

// ─── Status config — stable, defined outside component ───────────────────────
const STATUS_CONFIG = {
  online:  { label: "Online",  dot: "status-online",  textColor: "text-[var(--color-success)]"  },
  offline: { label: "Offline", dot: "status-offline", textColor: "text-[var(--color-on-surface-faint)]" },
  busy:    { label: "Busy",    dot: "status-busy",    textColor: "text-[var(--color-warning)]"  },
} as const;

export const AgentCard = memo(function AgentCard({
  name,
  role,
  price,
  status,
  color = "#00d4ff",
  successRate = 98.4,
  tasksCompleted = 1247,
}: AgentCardProps) {
  const statusConfig = STATUS_CONFIG[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{
        duration: 0.25,
        ease: [0.16, 1, 0.3, 1],
        layout: { duration: 0.2 }
      }}
      className="card group relative overflow-hidden p-0 h-full"
      style={{ willChange: 'transform' }}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] opacity-70 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />

      {/* Ambient background glow */}
      <div
        className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-700"
        style={{ backgroundColor: color }}
      />

      <div className="relative z-10 p-5 flex flex-col gap-4 h-full">

        {/* ── Top row ── */}
        <div className="flex items-start justify-between gap-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center border flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
            style={{
              background:  `linear-gradient(135deg, ${color}15, ${color}28)`,
              borderColor: `${color}35`,
              boxShadow:   `0 0 20px ${color}18`,
              willChange: 'transform',
            }}
          >
            <BrainCircuit className="w-7 h-7" style={{ color }} />
          </div>

          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] ${statusConfig.textColor} transition-all duration-200`}>
              <span className={`status-dot ${statusConfig.dot}`} />
              {statusConfig.label}
            </span>
            <button
              className="btn btn-ghost btn-sm w-8 h-8 p-0 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white/[0.08]"
              aria-label="Agent options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Info ── */}
        <div className="flex-shrink-0">
          <h3 className="text-lg font-display font-bold text-white tracking-tight leading-tight mb-1">{name}</h3>
          <p className="text-sm text-[var(--color-on-surface-variant)] leading-snug">{role}</p>
        </div>

        {/* ── Metrics ── */}
        <div className="grid grid-cols-2 gap-2.5 flex-shrink-0">
          <div className="bg-white/[0.04] rounded-xl px-3 py-2 border border-white/[0.06] transition-colors duration-150 hover:bg-white/[0.06] hover:border-white/[0.10]">
            <p className="text-[9px] text-[var(--color-on-surface-faint)] uppercase tracking-wider font-semibold mb-1">Success</p>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[var(--color-success)]" />
              <span className="text-base font-bold text-white tabular-nums">{successRate}%</span>
            </div>
          </div>
          <div className="bg-white/[0.04] rounded-xl px-3 py-2 border border-white/[0.06] transition-colors duration-150 hover:bg-white/[0.06] hover:border-white/[0.10]">
            <p className="text-[9px] text-[var(--color-on-surface-faint)] uppercase tracking-wider font-semibold mb-1">Tasks</p>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span className="text-base font-bold text-white tabular-nums">{tasksCompleted.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] mt-auto">
          <div className="flex-shrink-0">
            <p className="text-[9px] text-[var(--color-on-surface-faint)] uppercase tracking-wider font-semibold mb-0.5">Cost / Task</p>
            <p className="text-xl font-bold text-white flex items-center gap-1.5">
              <span style={{ color }} className="text-lg">π</span>
              <span className="tabular-nums">{price}</span>
            </p>
          </div>

          {/*
            FIX: Replaced inline onMouseEnter/Leave JS handlers with CSS-only hover.
            JS event handlers on buttons force React re-renders + paint on every
            mouse movement — causing the 150ms input delay seen on adjacent inputs.
            CSS transitions are GPU-composited and never touch the React tree.
          */}
          <button
            className="agent-card-hire-btn btn btn-sm rounded-xl px-4 py-2 text-sm font-semibold"
            style={{
              // CSS custom properties so the :hover rule in globals.css can read them
              ["--agent-color" as string]: color,
            } as React.CSSProperties}
            aria-label={`Hire ${name}`}
          >
            Hire
          </button>
        </div>

        {/* KYC verified hover badge */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] px-3 py-1 rounded-full pointer-events-none"
        >
          <Shield className="w-3 h-3 text-[var(--color-success)]" />
          <span className="text-[10px] font-semibold text-[var(--color-success)]">AxiomID Verified</span>
        </motion.div>
      </div>
    </motion.div>
  );
});
