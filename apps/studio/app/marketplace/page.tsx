'use client';
import { useState, useEffect } from 'react';

interface Plugin {
  id:          string;
  name:        string;
  description: string;
  category:    'research' | 'code' | 'data' | 'communication' | 'utility';
  author:      string;
  stars:       number;
  installs:    number;
  installed:   boolean;
  free:        boolean;
  tags:        string[];
}

const CATEGORY_COLORS: Record<string, string> = {
  research:      'bg-blue-500/20 text-blue-300',
  code:          'bg-green-500/20 text-green-300',
  data:          'bg-yellow-500/20 text-yellow-300',
  communication: 'bg-purple-500/20 text-purple-300',
  utility:       'bg-zinc-500/20 text-zinc-300',
};

export default function MarketplacePage() {
  const [plugins, setPlugins]     = useState<Plugin[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('all');
  const [installing, setInstalling] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/marketplace')
      .then(r => r.json())
      .then(d => { setPlugins(d.plugins ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = plugins.filter(p => {
    const matchSearch   = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'all' || p.category === category;
    return matchSearch && matchCategory;
  });

  async function install(pluginId: string) {
    setInstalling(pluginId);
    try {
      await fetch('/api/marketplace/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pluginId }),
      });
      setPlugins(prev => prev.map(p => p.id === pluginId ? { ...p, installed: true, installs: p.installs + 1 } : p));
    } finally {
      setInstalling(null);
    }
  }

  const categories = ['all', 'research', 'code', 'data', 'communication', 'utility'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">🛒 Marketplace</h1>
        <p className="text-zinc-400 mt-1">Plug-and-play agent skills for AIX Studio</p>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 flex-wrap">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search plugins…"
          className="flex-1 min-w-60 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2
                     text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
        />
        <div className="flex gap-2">
          {categories.map(c => (
            <button key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-2 rounded-lg text-sm capitalize transition-colors
                ${ category === c
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-900 border border-zinc-700 text-zinc-400 hover:border-zinc-500' }`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="text-sm text-zinc-500">
        {loading ? 'Loading plugins…' : `${filtered.length} plugins`}
        {!loading && plugins.filter(p => p.installed).length > 0 &&
          ` · ${plugins.filter(p => p.installed).length} installed`}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aix-card animate-pulse h-48 bg-zinc-900" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(plugin => (
            <div key={plugin.id} className="aix-card flex flex-col gap-3">
              {/* Top row */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-white">{plugin.name}</p>
                  <p className="text-xs text-zinc-500">by {plugin.author}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full capitalize ${CATEGORY_COLORS[plugin.category]}`}>
                  {plugin.category}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-zinc-400 flex-1">{plugin.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {plugin.tags.map(t => (
                  <span key={t} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">{t}</span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <div className="flex gap-3 text-xs text-zinc-500">
                  <span>⭐ {plugin.stars.toLocaleString()}</span>
                  <span>📦 {plugin.installs.toLocaleString()}</span>
                  {plugin.free && <span className="text-green-400">Free</span>}
                </div>
                <button
                  onClick={() => install(plugin.id)}
                  disabled={plugin.installed || installing === plugin.id}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all
                    ${ plugin.installed
                      ? 'bg-green-900/30 text-green-400 cursor-default'
                      : installing === plugin.id
                      ? 'bg-zinc-700 text-zinc-400 cursor-wait'
                      : 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer' }`}>
                  {plugin.installed ? '✓ Installed' : installing === plugin.id ? 'Installing…' : 'Install'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
