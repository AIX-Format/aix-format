# 🐾 AIX Pet Apps — Integration Guide

## Quick Start

```typescript
import { PetAppsCoordinator, PET_REGISTRY } from './pet-apps';

// 1. Initialize coordinator
const coordinator = new PetAppsCoordinator({
  secretKey: process.env.AIX_PET_SECRET!,
  onBusEvent: (event) => console.log(`[BUS] ${event.topic}`, event.payload),
  onMoodChange: (petId, mood) => console.log(`[MOOD] ${petId} is now ${mood.mood} (τ=${mood.τ})`),
  onSkillError: (petId, skill, err) => console.error(`[ERROR] ${petId}/${skill}: ${err}`),
});

// 2. Spawn pets
coordinator.spawn('chrono');   // 🗓️ Calendar & Alarms
coordinator.spawn('volt');     // ⚡ System Booster
coordinator.spawn('shade');    // 🕵️ Web Spy
coordinator.spawn('bull');     // 📈 Trading Signals
coordinator.spawn('drop');     // 🪂 Airdrop Hunter

// 3. Listen to all bus events
coordinator.on('bus:event', (event) => {
  // Route to other AIX systems (gateway, trust-chain, etc.)
  if (event.topic === 'pet.trade.signal') {
    // Forward to trading engine
  }
});

// 4. Feed pets to keep them alive
coordinator.feed('volt');

// 5. Get widget data for UI
const voltWidgets = coordinator.getWidgetData('volt');
console.log(voltWidgets);

// 6. Cleanup
coordinator.destroy();
```

## Bus Topics Reference

| Topic | Pet | Frequency | Payload |
|-------|-----|-----------|---------|
| `pet.alarm.fire` | 🗓️ Chrono | 1 min | `{ alarms, suggestion, timestamp }` |
| `pet.boost.applied` | ⚡ Volt | 30 sec | `{ metrics, optimizations, boosted }` |
| `pet.spy.alert` | 🕵️ Shade | 5 min | `{ alerts, news, watchlist }` |
| `pet.trade.signal` | 📈 Bull | 1 min | `{ signals, strongSignals, recommendation }` |
| `pet.airdrop.found` | 🪂 Drop | 10 min | `{ opportunities, totalScanned, newFindings }` |

## Mood → τ Mapping

| Mood | Base τ | Streak Bonus | Floor |
|------|--------|--------------|-------|
| ecstatic | 0.9 | +0.02×streak (max 0.1) | 0.1 |
| happy | 0.7 | +0.02×streak (max 0.1) | 0.1 |
| neutral | 0.5 | +0.02×streak (max 0.1) | 0.1 |
| tired | 0.3 | +0.02×streak (max 0.1) | 0.1 |
| dying | 0.1 | +0.02×streak (max 0.1) | 0.1 |

## Architecture Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    PetAppsCoordinator                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ MoodEngine  │  │ SkillRunner │  │ PetTrustChain       │  │
│  │ (τ compute) │  │ (cron loop) │  │ (SHA-256 sign)      │  │
│  └──────┬──────┘  └──────┬──────┘  └─────────────────────┘  │
│         │                │                                    │
│  ┌──────▼────────────────▼──────┐                           │
│  │      PetInstance (×5)        │                           │
│  │  ┌────────────────────────┐  │                           │
│  │  │ Chrono → pet.alarm.fire│  │                           │
│  │  │ Volt   → pet.boost...  │  │                           │
│  │  │ Shade  → pet.spy.alert │  │                           │
│  │  │ Bull   → pet.trade...  │  │                           │
│  │  │ Drop   → pet.airdrop.. │  │                           │
│  │  └────────────────────────┘  │                           │
│  └──────────────┬───────────────┘                           │
│                 │                                            │
│         bus.emit() ──→ AIX Event Bus                        │
└─────────────────────────────────────────────────────────────┘
```

## Integration with Existing AIX Systems

### 1. Gateway Integration

```typescript
// Forward pet events to gateway
coordinator.on('bus:event', async (event) => {
  await gateway.route({
    source: 'pet',
    petId: event.petId,
    topic: event.topic,
    payload: event.payload,
    τ: event.τ,
  });
});
```

### 2. Trust Chain Integration

Every bus event is automatically signed with SHA-256:

```typescript
signature = SHA256(petId + topic + timestamp + payload + secretKey)
```

### 3. Watcher Agent Integration

```typescript
coordinator.on('pet:skill:complete', ({ petId, success }) => {
  watcherAgent.observe({
    type: success ? 'PET_SKILL_SUCCESS' : 'PET_SKILL_FAIL',
    agentId: petId,
    score: success ? +5 : -2,
  });
});
```

### 4. Resonance Engine Integration

Track pet performance for specialization:

```typescript
coordinator.on('pet:skill:complete', ({ petId, skill }) => {
  resonanceEngine.recordPerformance({
    agentId: petId,
    taskType: skill,
    success: true,
    timestamp: Date.now(),
  });
});
```

## File Structure

```
packages/aix-core/src/pets/
├── pet-apps.ts          ← Main architecture (this file)
├── mood-engine.ts       ← (optional) Extract MoodEngine
├── skill-runner.ts      ← (optional) Extract SkillRunner
├── trust-chain.ts       ← (optional) Extract PetTrustChain
└── index.ts             ← Barrel export
```

## Adding a New Pet

```typescript
const myPet: PetDefinition = {
  id: 'my-pet',
  emoji: '🤖',
  name: 'MyPet',
  description: 'Does something cool',
  skills: [{
    id: 'my-skill',
    name: 'My Skill',
    cronExpression: '*/5 * * * *',
    intervalMs: 300000,
    busTopic: 'pet.my.event',
    async execute(ctx) {
      ctx.bus.emit('pet.my.event', { data: 'hello' });
      return { success: true, data: {}, moodImpact: 0.05, energyCost: 0.1, metadata: {} };
    },
  }],
  widgets: [],
  defaultMood: { mood: 'neutral', τ: 0.5, energy: 0.7, lastFed: Date.now(), streak: 0 },
};

PET_REGISTRY['my-pet'] = myPet;
coordinator.spawn('my-pet');
```

## The 10 Meta-Thinking Patterns

| # | Pattern | What It Does |
|---|---------|--------------|
| 1 | Recursive Observation Grid | Every component watches every other — accountability without control |
| 2 | Hyper-Recursive Loops | Standard → Meta → Hyper → Omega (self-pruning) |
| 3 | Cross-Domain Synthesis | ExpectationEngine → UCB1 → Bandit → TrustChain chains discovered automatically |
| 4 | Self-Modifying Code | Modules propose their own diffs based on performance trends |
| 5 | Emergent Property Detection | Swarm specialization, lineage competition, compression learning |
| 6 | Continuous Experimentation | Auto A/B tests based on system state |
| 7 | Meta-Cognitive Visualization | 7 layers: real-time → historical → predictive → counterfactual → meta → epoch → narrative |
| 8 | Universal Bus Compression | Bus recognizes patterns, emits meta-events, auto-summarizes |
| 9 | Blind Spot Detection | Finds unwatched components, auto-spawns observation loops |
| 10 | Omega Pruning | System decides which parts of itself live or die |

## Key Creative Connections

```
Accountability Cascade:
WatcherAgent → CuriosityEngine → FailureLearning → ResonanceEngine → WatcherAgent
→ Circular accountability = no silent degradation

Compression-Intelligence Loop:
Less code → Faster execution → More experiments → Better mutations → Smarter code → Better compression
→ Recursive amplification

Trust-Transparency Flywheel:
TrustChain → User trust → More usage → More data → Better Resonance → Better UCB1 → Higher quality → Stronger TrustChain
→ Flywheel effect

Mood-Energy Ecosystem:
Pets emit events → Watcher scores → Mood changes → τ changes → Quality changes → Events change
→ Living ecosystem balance
```

## How It Grows Every Day

```
Day 1: System runs, collects metrics
Day 2: SelfOptimizingComponents detect patterns, queue improvements  
Day 3: MetaLoopCoordinator discovers cross-loop synergies
Day 4: SynthesisEngine finds emergent chains
Day 5: ContinuousExperimentEngine runs A/B tests
Day 6: Winning configs auto-applied
Day 7: SelfModifyingModules propose code mutations
Week 2: Omega pruning removes weak loops, spawns strong ones
Week 3: System architecture evolves without human intervention
```

## Why This Beats Traditional Approaches

| Aspect | Traditional | This Framework |
|--------|-------------|----------------|
| Code Size | Separate files per engine | Single integrated orchestrator |
| Self-Awareness | Manual logging | Automatic reflection every 60s |
| Cross-Loop | Documented but manual | Auto-wired 5 synergies |
| Experiments | Requires human setup | Auto-generated from system state |
| Visualization | Static dashboards | 7-layer meta-narrative |
| Evolution | Human-driven | Omega pruning (system decides) |
| Philosophy | "Build tools" | "Architect trust for intelligence" |

**The difference**: Traditional gives you tools. This gives you a living system that improves its own ability to improve.

## Next Steps

```typescript
// 1. Drop into your codebase
cp meta-orchestrator.ts packages/aix-core/src/
cp meta-cognitive-framework.ts packages/aix-core/src/
cp pet-apps.ts packages/aix-core/src/pets/
cp meta-experiments.ts packages/aix-core/src/

// 2. Initialize
import { MetaLoopCoordinator, UniversalBus } from './meta-orchestrator';
const bus = new UniversalBus();
const coordinator = new MetaLoopCoordinator(bus);

// 3. Spawn pets
coordinator.spawn('chrono');
coordinator.spawn('volt');
coordinator.spawn('shade');
coordinator.spawn('bull');
coordinator.spawn('drop');

// 4. Watch it grow
// The system now runs experiments, discovers patterns, and evolves itself
```

Your codebase will be smarter tomorrow than it is today. Automatically. 🧬

---

**Made with 🧬 by Moe Abdelaziz**