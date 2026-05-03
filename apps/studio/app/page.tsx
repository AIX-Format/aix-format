import Link from 'next/link';

async function getHealth() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/health`,
      { next: { revalidate: 30 } }
    );
    return res.ok ? res.json() : null;
  } catch { return null; }
}

export default async function DashboardPage() {
  const health = await getHealth();

  const stats = [
    { label: 'LLM Provider',  value: health?.llm ?? 'detecting…',  color: 'text-green-400' },
    { label: 'Redis',         value: health?.redis ?? 'checking…', color: 'text-blue-400'  },
    { label: 'TS Errors',     value: health?.tsErrors ?? '—',       color: 'text-yellow-400' },
    { label: 'Health Score',  value: health?.score ? `${health.score}/100` : '—', color: 'text-purple-400' },
  ];

  const quickLinks = [
    { href: '/marketplace', emoji: '🛒', title: 'Marketplace',  desc: 'Browse & install agent plugins' },
    { href: '/agents',      emoji: '🤖', title: 'Agents',       desc: 'Launch and monitor agent tasks' },
    { href: '/simulate',    emoji: '⚡', title: 'Simulate',     desc: 'Parallel swarm dry-run testing' },
    { href: '/settings',    emoji: '🔑', title: 'Settings',     desc: 'API keys & environment vault' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">AIX Studio</h1>
        <p className="text-zinc-400 mt-1">Agent Runtime v0.369 — Phases 1–5 Complete</p>
      </div>

      {/* Status Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="aix-card">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickLinks.map(l => (
          <Link key={l.href} href={l.href}
            className="aix-card flex items-center gap-4 cursor-pointer hover:border-blue-500/50">
            <span className="text-4xl">{l.emoji}</span>
            <div>
              <p className="font-semibold text-white">{l.title}</p>
              <p className="text-sm text-zinc-400">{l.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="aix-card">
        <h2 className="font-semibold text-white mb-4">🧬 System Evolution</h2>
        <div className="space-y-2 text-sm">
          {[
            { phase: '5', label: 'Parallel Sim + Public API + 33 Automation Gems', done: true },
            { phase: '4', label: 'Frontend Evolution Loop — 9 Strategies × 4 Metrics', done: true },
            { phase: '3', label: 'LLM Provider + Gateway Bridge + Agent Runtime', done: true },
            { phase: '2', label: 'Meta-Compression — Tree Shaking + Key Unification', done: true },
            { phase: '1', label: 'Rust Core + 6 Philosophical Engines', done: true },
            { phase: '6', label: 'Marketplace + E2E Web App', done: false },
          ].map(p => (
            <div key={p.phase} className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${p.done ? 'bg-green-400' : 'bg-zinc-600'} pulse-dot`} />
              <span className="text-zinc-500 w-8">P{p.phase}</span>
              <span className={p.done ? 'text-zinc-300' : 'text-zinc-500'}>{p.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
