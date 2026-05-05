# @aix-hint: ring-1-zkkyc — Cold Memory
# Ring 1 (SOUL) — Identity, KYC, Lifecycle
# Language: TypeScript
# Made with Moe Abdelaziz

## Purpose
Ring 1 handles all identity-related operations. It is the "soul" of each agent — 
the cryptographic proof that they exist, are verified, and are authorized.

## Key Files
| File | Role |
|------|------|
| `packages/pi-kyc/src/index.ts` | Pi KYC bridge — issues `did:axiom:axiomid.app:` identities |
| `packages/aix-zkkyc/` | Zero-knowledge KYC proof verification |
| `apps/studio/src/hooks/useAuth.ts` | Frontend auth hook (Pi + fallback) |
| `apps/studio/src/hooks/usePi.ts` | Pi SDK hook (init, auth, payments) |
| `apps/studio/src/lib/pi-network.ts` | Pi Network client (API v2) |

## Trust Chain
- Every KYC verification → TrustChain.append()
- DID format: `did:axiom:axiomid.app:{uuid}`
- Authority: always `axiomid.app`

## Current State
- Pi auth hook exists but has duplicate init calls
- ZK proof modal built but not connected to live Pi KYC
- `useAuth.ts` has dev fallback when Pi SDK unavailable

## Known Issues
- Multiple Pi.init() calls across components
- `useAuth.ts` had hardcoded sandbox:true (fixed)
- Pi Developer Portal domain validation pending (Step 8)
