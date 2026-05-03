'use client';
import { useState } from 'react';

interface AgentResult {
  output:    string;
  success:   boolean;
  steps:     number;
  cost:      number;
  modelUsed: string;
  happiness: number;
  duration:  number;
}

export default function AgentsPage() {
  const [agentId, setAgentId]   = useState('agent-1');
  const [task, setTask]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<AgentResult | null>(null);
  const [error, setError]       = useState('');
  const [streamLog, setStreamLog] = useState<string[]>([]);
  const [streaming, setStreaming] = useState(false);

  async function runAgent() {
    setLoading(true); setResult(null); setError('');
    try {
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, task }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Unknown error');
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function streamAgent() {
    setStreaming(true); setStreamLog([]); setError('');
    try {
      const res = await fetch(`/api/agent/stream?agentId=${agentId}&task=${encodeURIComponent(task)}`);
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const lines = text.split('\n').filter(l => l.startsWith('data:'));
        for (const line of lines) {
          try {
            const event = JSON.parse(line.replace('data:', '').trim());
            setStreamLog(prev => [...prev, JSON.stringify(event, null, 2)]);
          } catch {}
        }
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-white">🤖 Agents</h1>
        <p className="text-zinc-400 mt-1">Run agent tasks powered by real LLM calls</p>
      </div>

      {/* Config */}
      <div className="aix-card space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-zinc-500 uppercase tracking-wider">Agent ID</label>
            <input value={agentId} onChange={e => setAgentId(e.target.value)}
              className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2
                         text-zinc-100 focus:outline-none focus:border-blue-500 text-sm" />
          </div>
        </div>
        <div>
          <label className="text-xs text-zinc-500 uppercase tracking-wider">Task</label>
          <textarea
            value={task}
            onChange={e => setTask(e.target.value)}
            rows={3}
            placeholder="Describe what the agent should do…"
            className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2
                       text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 text-sm resize-none"
          />
        </div>
        <div className="flex gap-3">
          <button onClick={runAgent} disabled={loading || !task}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700
                       disabled:text-zinc-500 text-white rounded-lg font-medium transition-colors">
            {loading ? '⏳ Running…' : '▶ Run'}
          </button>
          <button onClick={streamAgent} disabled={streaming || !task}
            className="px-6 py-2 bg-purple-700 hover:bg-purple-600 disabled:bg-zinc-700
                       disabled:text-zinc-500 text-white rounded-lg font-medium transition-colors">
            {streaming ? '📡 Streaming…' : '📡 Stream'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 text-red-300 text-sm">
          ❌ {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="aix-card space-y-4">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${result.success ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="font-semibold text-white">{result.success ? 'Success' : 'Failed'}</span>
          </div>
          <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{result.output}</p>
          <div className="grid grid-cols-4 gap-3 pt-3 border-t border-zinc-800">
            {[
              { label: 'Steps',     value: result.steps },
              { label: 'Model',     value: result.modelUsed },
              { label: 'Cost',      value: `$${result.cost.toFixed(5)}` },
              { label: 'Happiness', value: `${(result.happiness * 100).toFixed(0)}%` },
            ].map(m => (
              <div key={m.label}>
                <p className="text-xs text-zinc-500">{m.label}</p>
                <p className="text-sm font-medium text-zinc-200">{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stream log */}
      {streamLog.length > 0 && (
        <div className="aix-card">
          <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">Stream Events</p>
          <div className="space-y-2 max-h-80 overflow-auto font-mono text-xs">
            {streamLog.map((l, i) => (
              <pre key={i} className="text-zinc-400 bg-zinc-800 rounded p-2">{l}</pre>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
