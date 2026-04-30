import { Suspense } from "react";
import { getRegistry } from "@/lib/registry";
import { RegistryEntry } from "@/lib/types";
import { Shield, Cpu, Activity, Zap, BarChart3, PieChart, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

export const revalidate = 30; // 30 second ISR

async function getHealth() {
  try {
    // In a server component, we can call the internal logic or the URL if it's absolute
    // For simplicity, we'll assume healthy or fetch via absolute URL if needed.
    // Here we'll just mock it or skip it as the registry is the main data source.
    return { status: 'healthy', config: { hasSalt: true } };
  } catch {
    return { status: 'degraded' };
  }
}

export default async function AnalyticsPage() {
  const agents = await getRegistry();
  const health = await getHealth();

  // Stats Calculations
  const totalAgents = agents.length;
  const kycVerified = agents.filter(a => a.kyc_tier === 'verified' || a.kyc_tier === 'institutional').length;
  const deployedCount = agents.filter(a => a.deployment?.status === 'deployed').length;
  const abomScanned = agents.filter(a => a.abom).length;

  // KYC Tier Distribution
  const kycStats = {
    unverified: agents.filter(a => a.kyc_tier === 'unverified' || !a.kyc_tier).length,
    basic: agents.filter(a => a.kyc_tier === 'basic').length,
    verified: agents.filter(a => a.kyc_tier === 'verified').length,
    institutional: agents.filter(a => a.kyc_tier === 'institutional').length,
  };

  // Capabilities Frequency
  const capMap: Record<string, number> = {};
  agents.forEach(a => {
    a.capabilities?.forEach(cap => {
      capMap[cap] = (capMap[cap] || 0) + 1;
    });
  });
  const sortedCaps = Object.entries(capMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const recentActivity = [...agents]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 10);

  return (
    <main className="min-h-screen pt-24 pb-16 px-6 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-display font-bold text-white mb-2">Studio Analytics</h1>
        <p className="text-[var(--color-on-surface-variant)]">Real-time performance metrics across the AIX ecosystem.</p>
      </div>

      {/* Row 1: Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          title="Total Agents" 
          value={totalAgents} 
          icon={<Cpu className="w-5 h-5 text-[var(--color-primary)]" />} 
          description="Global registry entries"
        />
        <StatCard 
          title="KYC Verified" 
          value={kycVerified} 
          icon={<Shield className="w-5 h-5 text-[var(--color-accent)]" />} 
          description={`${Math.round((kycVerified/totalAgents || 0) * 100)}% of total agents`}
        />
        <StatCard 
          title="Deployed" 
          value={deployedCount} 
          icon={<Zap className="w-5 h-5 text-[var(--color-secondary)]" />} 
          active={health.status === 'healthy'}
          description="Live on-chain/edge nodes"
        />
        <StatCard 
          title="ABOM Scanned" 
          value={abomScanned} 
          icon={<Activity className="w-5 h-5 text-green-400" />} 
          description="Compliance verified"
        />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* KYC Distribution Donut */}
        <div className="glass-panel rounded-3xl p-8 border border-white/10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <PieChart className="w-5 h-5 text-[var(--color-primary)]" />
              <h3 className="text-xl font-display font-bold text-white">Identity Distribution</h3>
            </div>
            <span className="text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)]">By KYC Tier</span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="relative w-48 h-48 flex-shrink-0">
              <div 
                className="absolute inset-0 rounded-full" 
                style={{
                  background: `conic-gradient(
                    #00dbe9 0% ${((kycStats.institutional + kycStats.verified) / totalAgents) * 100 || 0}%,
                    #8b5cf6 ${((kycStats.institutional + kycStats.verified) / totalAgents) * 100 || 0}% ${((kycStats.institutional + kycStats.verified + kycStats.basic) / totalAgents) * 100 || 0}%,
                    rgba(255,255,255,0.1) ${((kycStats.institutional + kycStats.verified + kycStats.basic) / totalAgents) * 100 || 0}% 100%
                  )`
                }}
              />
              <div className="absolute inset-4 rounded-full bg-[#050507] flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">{totalAgents}</span>
                <span className="text-[10px] text-[var(--color-on-surface-variant)] uppercase">Agents</span>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <ChartLegend label="Institutional" count={kycStats.institutional} color="bg-[var(--color-primary)]" total={totalAgents} />
              <ChartLegend label="Verified" count={kycStats.verified} color="bg-[var(--color-primary)] opacity-70" total={totalAgents} />
              <ChartLegend label="Basic" count={kycStats.basic} color="bg-[#8b5cf6]" total={totalAgents} />
              <ChartLegend label="Unverified" count={kycStats.unverified} color="bg-white/10" total={totalAgents} />
            </div>
          </div>
        </div>

        {/* Capabilities Frequency Bar Chart */}
        <div className="glass-panel rounded-3xl p-8 border border-white/10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-[var(--color-secondary)]" />
              <h3 className="text-xl font-display font-bold text-white">Top Capabilities</h3>
            </div>
            <span className="text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)]">Market Demand</span>
          </div>

          <div className="space-y-6">
            {sortedCaps.length > 0 ? sortedCaps.map(([cap, count]) => (
              <div key={cap} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white font-medium">{cap}</span>
                  <span className="text-[var(--color-on-surface-variant)]">{count} Agents</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full transition-all duration-1000"
                    style={{ width: `${(count / totalAgents) * 100}%` }}
                  />
                </div>
              </div>
            )) : (
              <div className="h-full flex items-center justify-center text-[var(--color-on-surface-variant)]">
                No capability data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Activity Feed */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
        <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-[var(--color-primary)]" />
            <h3 className="text-xl font-display font-bold text-white">Registry Activity</h3>
          </div>
          <Link href="/marketplace" className="text-xs text-[var(--color-primary)] hover:underline">View All</Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] text-[10px] uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                <th className="px-8 py-4 font-semibold">Agent Name</th>
                <th className="px-8 py-4 font-semibold">Role</th>
                <th className="px-8 py-4 font-semibold">KYC Status</th>
                <th className="px-8 py-4 font-semibold">Deployment</th>
                <th className="px-8 py-4 font-semibold">Published</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {recentActivity.map((agent) => (
                <tr key={agent.did} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-container)] flex items-center justify-center border border-white/10">
                        <Cpu className="w-4 h-4 text-[var(--color-primary)]" />
                      </div>
                      <span className="font-medium text-white group-hover:text-[var(--color-primary)] transition-colors">{agent.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-sm text-[var(--color-on-surface-variant)]">
                    {agent.role}
                  </td>
                  <td className="px-8 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      agent.kyc_tier === 'verified' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                      agent.kyc_tier === 'institutional' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      'bg-white/5 text-[var(--color-on-surface-variant)]'
                    }`}>
                      {agent.kyc_tier}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    {agent.deployment ? (
                      <div className="flex items-center gap-2 text-xs text-[var(--color-success)]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Deployed</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-[var(--color-on-surface-variant)] opacity-50">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Local Only</span>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-4 text-xs text-[var(--color-on-surface-faint)]">
                    {new Date(agent.publishedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function StatCard({ title, value, icon, description, active = true }: any) {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10 hover:border-[var(--color-primary-dim)] transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-xl bg-white/5 group-hover:bg-[var(--color-primary-dim)] transition-colors">
          {icon}
        </div>
        {!active && <span className="text-[10px] font-bold text-[var(--color-error)] uppercase">Offline</span>}
      </div>
      <div className="space-y-1">
        <h4 className="text-[var(--color-on-surface-variant)] text-sm font-medium">{title}</h4>
        <div className="text-3xl font-display font-bold text-white tracking-tight">{value}</div>
        <p className="text-[10px] text-[var(--color-on-surface-faint)] leading-tight">{description}</p>
      </div>
    </div>
  );
}

function ChartLegend({ label, count, color, total }: any) {
  const percentage = Math.round((count / total) * 100) || 0;
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-sm ${color}`} />
        <span className="text-sm text-[var(--color-on-surface-variant)] group-hover:text-white transition-colors">{label}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs font-mono text-[var(--color-on-surface-faint)]">{count}</span>
        <span className="text-sm font-bold text-white w-10 text-right">{percentage}%</span>
      </div>
    </div>
  );
}
