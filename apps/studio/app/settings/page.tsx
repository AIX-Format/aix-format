'use client';
import { useState, useEffect } from 'react';

interface EnvStatus {
  key: string;
  set: boolean;
  masked?: string;
}

export default function SettingsPage() {
  const [envStatus, setEnvStatus] = useState<EnvStatus[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saved, setSaved]         = useState(false);
  const [keys, setKeys]           = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/health').then(r => r.json()).then(d => {
      setEnvStatus(d.envStatus ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function saveKeys() {
    const res = await fetch('/api/settings/env', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keys }),
    });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
  }

  const ALL_KEYS = [
    { key: 'OPENAI_API_KEY',          label: 'OpenAI API Key',          placeholder: 'sk-…',      required: true  },
    { key: 'ANTHROPIC_API_KEY',       label: 'Anthropic API Key',       placeholder: 'sk-ant-…', required: false },
    { key: 'OLLAMA_BASE_URL',         label: 'Ollama Base URL',         placeholder: 'http://localhost:11434', required: false },
    { key: 'KV_REST_API_URL',         label: 'Upstash Redis URL',       placeholder: 'https://….upstash.io',  required: true  },
    { key: 'KV_REST_API_TOKEN',       label: 'Upstash Redis Token',     placeholder: '…',         required: true  },
    { key: 'NEXT_PUBLIC_APP_URL',     label: 'App URL',                 placeholder: 'http://localhost:3000', required: false },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-white">🔑 Settings</h1>
        <p className="text-zinc-400 mt-1">Environment vault — set once, works everywhere</p>
      </div>

      {/* Current Status */}
      <div className="aix-card">
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-4">Current Status</p>
        {loading ? <p className="text-zinc-500 text-sm">Checking…</p> : (
          <div className="space-y-2">
            {ALL_KEYS.map(({ key, label, required }) => {
              const status = envStatus.find(e => e.key === key);
              return (
                <div key={key} className="flex items-center justify-between py-2 border-b border-zinc-800">
                  <div>
                    <span className="text-sm text-zinc-300">{label}</span>
                    {required && <span className="ml-2 text-xs text-red-400">required</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {status?.masked && <span className="text-xs text-zinc-500 font-mono">{status.masked}</span>}
                    <span className={`w-2 h-2 rounded-full ${status?.set ? 'bg-green-400' : 'bg-red-500'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Update Keys */}
      <div className="aix-card space-y-4">
        <p className="text-xs text-zinc-500 uppercase tracking-wider">Update Keys</p>
        <div className="text-xs text-yellow-400 bg-yellow-900/20 border border-yellow-800 rounded-lg p-3">
          ⚡ Keys are written to <code className="font-mono">.env.local</code> and <code className="font-mono">.env.vault</code>.
          Run <code className="font-mono">bash scripts/setup-env.sh</code> once to sync all environments.
        </div>
        {ALL_KEYS.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="text-xs text-zinc-500">{label}</label>
            <input
              type="password"
              placeholder={placeholder}
              value={keys[key] ?? ''}
              onChange={e => setKeys(prev => ({ ...prev, [key]: e.target.value }))}
              className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2
                         text-zinc-300 text-sm focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        ))}
        <button onClick={saveKeys}
          className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
          {saved ? '✓ Saved' : '💾 Save to Vault'}
        </button>
      </div>

      {/* One-time setup instructions */}
      <div className="aix-card">
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">One-time Setup</p>
        <div className="space-y-2 text-sm text-zinc-400 font-mono bg-zinc-800 rounded-lg p-4">
          <p className="text-zinc-500"># Run ONCE — syncs all IDEs + platforms</p>
          <p>cp .env.example .env.local</p>
          <p className="text-zinc-500"># Fill your keys in .env.local, then:</p>
          <p>bash scripts/setup-env.sh</p>
          <p className="text-zinc-500"># After this, every tool reads from .env.vault</p>
          <p className="text-zinc-500"># VS Code, Cursor, Claude, Vercel — all synced</p>
        </div>
      </div>
    </div>
  );
}
