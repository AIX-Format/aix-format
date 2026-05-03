import { useState, useEffect } from 'react';
import type { BusEvent } from '../components/BusLog.js';

const MOCK_EVENTS: Omit<BusEvent, 'id' | 'ts'>[] = [
  { topic: 'meta:phase',  payload: 'observe → decide',       color: 'green'   },
  { topic: 'pet:xp',     payload: 'volt +3 xp (ring bonus)', color: 'yellow'  },
  { topic: 'meta:phase',  payload: 'decide → act',           color: 'green'   },
  { topic: 'trust:sign', payload: 'mutation signed OK',      color: 'yellow'  },
  { topic: 'pet:mood',   payload: 'drop: sad → neutral',     color: 'magenta' },
  { topic: 'gateway:in', payload: 'route /skill/heap-boost', color: 'cyan'    },
  { topic: 'meta:phase',  payload: 'act → reflect',          color: 'green'   },
  { topic: 'pet:xp',     payload: 'bull +1 xp',              color: 'yellow'  },
  { topic: 'meta:phase',  payload: 'reflect → observe',      color: 'green'   },
  { topic: 'pet:mood',   payload: 'volt: ecstatic ✦',        color: 'magenta' },
];

let counter = 0;

export function useBusEvents() {
  const [events, setEvents] = useState<BusEvent[]>([]);

  useEffect(() => {
    let idx = 0;
    const t = setInterval(() => {
      const mock = MOCK_EVENTS[idx % MOCK_EVENTS.length];
      idx++;
      const now = new Date();
      const ts = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;
      setEvents(prev => [
        ...prev.slice(-20),
        { ...mock, id: String(counter++), ts },
      ]);
    }, 1200);
    return () => clearInterval(t);
  }, []);

  return { events };
}
