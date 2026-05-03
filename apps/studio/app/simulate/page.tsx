'use client';
import { useState } from 'react';

type Pattern = 'race' | 'consensus' | 'pipeline' | 'scatter-gather';

interface AgentRow { id: string; task: string; }
interface SimOutcome {
  agentId: string; name: string; success: boolean;
  output?: string; cost: number; duration: number; happiness?: number;
}
interface SimResult {
  pattern: Pattern; duration: number;
  winner?: SimOutcome; results: SimOutcome[];
}

export default function SimulatePage() {
  const [pattern, setPattern]   = useState<Pattern>('race');
  const [agents, setAgents]     = useState<AgentRow[]>([
    { id: 'a1', task: 'Summarize the benefits of AI agents' },
    { id: 'a2', task: 'Summarize the benefits of AI agents' },
  ]);
  const [dryRun, setDryRun]     = useState(true);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<SimResult | null>(null);

  function addAgent() {
    setAgents(prev => [...prev, { id: `a${prev.length + 1}`, task: '' }]);
  }
  function updateAgent(idx: number, field: keyof AgentRow, value: string) {
    setAgents(prev => prev.map((a, i) => i === idx ? { ...a, [field]: value } : a));
  }
  function removeAgent(idx: number) {
    setAgents(prev => prev.filter((_, i) => i !== idx));
  }

  async function runSim() {
    setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/agent/swarm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agents: agents.map(a => ({ agentId: a.id, name: a.id, task: a.task })),
          pattern,
          dryRun,
        }),
      });
      setResult(await res.json());
    } finally {
      setLoading(false);
    }
  }

  const patterns: Pattern[] = ['race', 'consensus', 'pipeline', 'scatter-gather'];
  const patternDesc: Record<Pattern, string> = {
    'race':           'First agent to finish wins',
    'consensus':      'Majority vote on result',
    'pipeline':       'Output of A feeds B feeds C',
    'scatter-gather': 'Fan-out sub-tasks, aggregate',
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white">⚡ Simulate</h1>
        <p className="text-zinc-400 mt-1">Parallel swarm simulation — test topology before spending tokens</p>
      </div>

      {/* Pattern selector */}
      <div className="aix-card">
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Pattern</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {patterns.map(p => (
            <button key={p} onClick={() => setPattern(p)}
              className={`p-3 rounded-xl text-sm text-left transition-all border
                ${ pattern === p
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500' }`}>
              <p className="font-medium capitalize">{p}</p>
              <p className="text-xs opacity-70 mt-1">{patternDesc[p]}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Agents */}
      <div className="aix-card space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Agents ({agents.length})</p>
          <button onClick={addAgent}
            className="text-xs text-blue-400 hover:text-blue-300 border border-blue-800 px-3 py-1 rounded-lg">+ Add</button>
        </div>
        {agents.map((agent, idx) => (
          <div key={idx} className="flex gap-2">
            <input value={agent.id}
              onChange={e => updateAgent(idx, 'id', e.target.value)}
              className="w-24 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2
                         text-zinc-300 text-sm focus:outline-none focus:border-blue-500"
              placeholder="id" />
            <input value={agent.task}
              onChange={e => updateAgent(idx, 'task', e.target.value)}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2
                         text-zinc-300 text-sm focus:outline-none focus:border-blue-500"
              placeholder="Task description…" />
            {agents.length > 1 && (
              <button onClick={() => removeAgent(idx)}
                className="text-zinc-600 hover:text-red-400 px-2">✕</button>
            )}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={dryRun} onChange={e => setDryRun(e.target.checked)}
            className="w-4 h-4 rounded" />
          <span className="text-sm text-zinc-300">Dry-run (no LLM cost)</span>
        </label>
        <button onClick={runSim} disabled={loading}
          className="px-6 py-2 bg-green-700 hover:bg-green-600 disabled:bg-zinc-700
                     text-white rounded-lg font-medium transition-colors">
          {loading ? '⏳ Simulating…' : '⚡ Run Simulation'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="aix-card space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white capitalize">{result.pattern} — {result.duration}ms</span>
            {result.winner && (
              <span className="text-sm text-green-400">🏆 {result.winner.name}</span>
            )}
          </div>
          <div className="space-y-2">
            {result.results.map((r, i) => (
              <div key={i} className={`rounded-lg p-3 text-sm ${
                r.success ? 'bg-green-900/20 border border-green-800' : 'bg-red-900/20 border border-red-900'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-zinc-200">{r.name}</span>
                  <div className="flex gap-3 text-xs text-zinc-500">
                    <span>{r.duration}ms</span>
                    <span>${r.cost.toFixed(5)}</span>
                    {r.happiness && <span>{(r.happiness * 100).toFixed(0)}% happy</span>}
                  </div>
                </div>
                {r.output && <p className="text-zinc-400 text-xs mt-1 truncate">{r.output}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
