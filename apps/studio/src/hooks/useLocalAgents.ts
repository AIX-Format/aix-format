import { useState, useEffect } from 'react';
import { AgentManifest } from '../lib/types';

const STORAGE_KEY = 'aix_local_agents';

export function useLocalAgents() {
  const [agents, setAgents] = useState<AgentManifest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setAgents(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse local agents:', e);
      }
    }
    setLoading(false);
  }, []);

  const saveAgents = (newAgents: AgentManifest[]) => {
    setAgents(newAgents);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAgents));
  };

  const addAgent = (agent: AgentManifest) => {
    const exists = agents.find(a => a.meta.id === agent.meta.id);
    if (exists) {
      const updated = agents.map(a => a.meta.id === agent.meta.id ? agent : a);
      saveAgents(updated);
    } else {
      saveAgents([...agents, agent]);
    }
  };

  const getAgent = (id: string) => {
    return agents.find(a => a.meta.id === id);
  };

  const deleteAgent = (id: string) => {
    saveAgents(agents.filter(a => a.meta.id !== id));
  };

  return { agents, addAgent, getAgent, deleteAgent, loading };
}
