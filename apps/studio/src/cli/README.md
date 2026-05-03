# 🧬 AIX CLI — Animated Terminal Dashboard

Claude Code-style terminal UI for AIX Studio with live pets, meta engine status, and bus event stream.

## Run

```bash
cd apps/studio
pnpm cli
```

## Keybindings

| Key | Action |
|-----|--------|
| `1` | Dashboard view |
| `2` | Pets view |
| `3` | Meta view |
| `f` | Feed Volt |
| `m` | Trigger Meta loop |
| `q` | Quit |

## What you see

- **Header**: ASCII AIX banner + spinner animation
- **Pet Swarm**: All 5 pets with mood colors, XP bars, level — live animated
- **Meta Engine**: ReAct loop phase cycling with entropy bar
- **Bus Log**: Last 8 events streaming from the bus
- **Status bar**: Keyboard shortcuts

## Architecture

```
cli/
├── index.tsx          ← entry point
├── AIXApp.tsx         ← root layout
├── components/
│   ├── Header.tsx     ← ASCII banner + spinner
│   ├── PetRow.tsx     ← single pet row with animations
│   ├── BusLog.tsx     ← scrolling event log
│   ├── MetaStatus.tsx ← meta phase + entropy
│   └── InputBar.tsx   ← keybind hints
└── hooks/
    ├── usePetLoop.ts  ← circular watch ring + XP
    └── useBusEvents.ts← mock bus stream
```

## Connect to real bus

Replace mock data in `hooks/useBusEvents.ts`:

```ts
// swap mock interval with real EventEmitter
bus.on('*', (topic, payload) => {
  setEvents(prev => [...prev.slice(-20), { topic, payload: JSON.stringify(payload), ... }]);
});
```
