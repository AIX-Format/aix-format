## For Human Developers
- Setup: pnpm install → pnpm dev
- Branch naming: feat/*, fix/*, chore/*, docs/*
- Commit format: conventional commits
- Before PR: pnpm tsc --noEmit && pnpm build must pass

## For AI Agents (Jules, AIX, AIX)
- ALWAYS read .cursor/rules/ or .github/AGENT_GOVERNANCE.md first
- NEVER modify: schemas/core/aix.schema.json without human approval
- NEVER modify: packages/aix-dna/ Rust code without human approval
- ALWAYS run pnpm tsc --noEmit before committing
- ALWAYS write task.md before implementing architectural changes
- Risk Tier: 🔴 = human approval required / 🟡 = PR + review / 🟢 = direct commit

## Protected Files
- `security/`
- `economics/`
- Pi KYC logic
- `identity_layer/`
- `apps/studio/app/layout.tsx`
- `apps/studio/app/globals.css`
- `apps/studio/next.config.ts`
- Pi SDK integration
- `AgenticKycSetup`
- `LiveValidator`
- any file touching private keys or tokens
