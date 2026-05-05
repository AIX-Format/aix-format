# @aix-hint: ring-2-swarm — Cold Memory
# Ring 2 (MIND) — Routing, Learning, Swarm Intelligence
# Language: Go (primary) + TypeScript (bus bridge)
# Made with Moe Abdelaziz

## Purpose
Ring 2 is the decision-making layer. The Go SwarmRouter receives tasks,
scores agents by capability, and routes with circuit-breaker protection.
It connects to TypeScript via Redis Pub/Sub for quantum resonance events.

## Key Files
| File | Role |
|------|------|
| `packages/aix-agency/swarm_router.go` | Main routing hub — scores, routes, dead-letters |
| `packages/aix-agency/pkg/bus/redis.go` | Go Redis bus — emits & subscribes to ring events |
| `packages/aix-core/src/core/bus.ts` | TS event bus — publishes to `aix:ring:{N}:{TYPE}` |
| `packages/aix-core/src/memory/publishEvent.ts` | TS memory event publisher |

## Cross-Language Bridge
```
TS Bus.emitPulse() → Redis PUBLISH "aix:ring:2:QUANTUM_BURST"
                              ↓
Go SubscribeToRing(2) → swarm_router.go applies 1.5x boost
```

## Half-Loop Verification
See: `docs/HALF_LOOP_REPORT.md`

## Circuit Breaker
- Failure threshold: 5
- Success threshold: 3
- Open duration: 30s
- States: CLOSED → OPEN → HALF-OPEN → CLOSED

## Known Issues
- `ListenForResonance()` references `r.ResonanceEnabled` and `r.bus` — not defined in struct
- `EmitHealthEvent()` has TODO for production Redis publish
- Quantum boost applied twice in `scoreAgent()` (lines 362-368 AND 374-382)
