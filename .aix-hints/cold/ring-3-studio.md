# @aix-hint: ring-3-studio — Cold Memory
# Ring 3 (BODY) — External I/O, UI, Pi Integration
# Language: TypeScript + React (Next.js)
# Made with Moe Abdelaziz

## Purpose
Ring 3 is the face of AIX — the Studio application deployed on axiomid.app.
It handles user interaction, Pi Network integration, marketplace, and agent management.

## Key Files
| File | Role |
|------|------|
| `apps/studio/src/app/layout.tsx` | Root layout — loads Pi SDK via CDN |
| `apps/studio/src/components/providers/WalletProvider.tsx` | WagmiProvider + Pi.init() |
| `apps/studio/src/lib/wallet-config.ts` | RainbowKit + WalletConnect config |
| `apps/studio/next.config.ts` | CSP headers, Pi validation-key headers |
| `apps/studio/vercel.json` | Deployment config, www→bare domain redirect |
| `apps/studio/public/validation-key.txt` | Pi domain verification file |

## Pi Network Integration Status
| Step | Status | Notes |
|------|--------|-------|
| 1-7 | ✅ Done | App registered in Pi Developer Portal |
| 8 | ⚠️ Stuck | Domain validation — X-Frame-Options conflict fixed |
| 9-10 | ❌ Pending | Require Step 8 completion |

## WalletConnect Status
- ProjectId: Loaded from `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` env var
- Value in `.env.local`: `da5be88025eba75c383463a8030f4de4`
- **Audit note:** ID appears to be a real WalletConnect Cloud project ID, not hardcoded in source
- Chains: mainnet, sepolia, polygon, arbitrum, optimism, base

## Deployment
- Platform: Vercel
- Domain: `axiomid.app` (custom domain)
- Region: `iad1`
- Framework: Next.js

## Known Issues
- `X-Frame-Options: SAMEORIGIN` was blocking Pi Browser iframe (FIXED)
- Pi SDK loaded via `afterInteractive` strategy (correct for external CDN)
- Multiple Pi.init() calls across components (needs centralization)
