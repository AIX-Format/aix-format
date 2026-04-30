import { Cpu, Shield, Zap, Activity } from "lucide-react";

export default function AnalyticsLoading() {
  return (
    <main className="min-h-screen pt-24 pb-16 px-6 max-w-7xl mx-auto animate-pulse">
      <div className="mb-10">
        <div className="h-10 w-64 bg-white/10 rounded-lg mb-2" />
        <div className="h-5 w-96 bg-white/5 rounded-lg" />
      </div>

      {/* Row 1: Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-panel rounded-2xl p-6 border border-white/10 h-32" />
        ))}
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="glass-panel rounded-3xl p-8 border border-white/10 h-80" />
        <div className="glass-panel rounded-3xl p-8 border border-white/10 h-80" />
      </div>

      {/* Row 3: Activity Feed */}
      <div className="glass-panel rounded-3xl border border-white/10 h-96" />
    </main>
  );
}
