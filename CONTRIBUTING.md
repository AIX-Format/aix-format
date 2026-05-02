# Contributing to AIX Sovereign Protocol

Welcome to the future of sovereign, machine-to-machine AI. We are building the foundational format for portable, secure, and monetizable AI agents. 

We operate on the principles of **10x Moonshot thinking**, **First Principles engineering**, and **Rigorous Mathematical Logic**.

## 🚀 How to Contribute

### 1. The AIX Standard (Core)
We are constantly refining the AIX JSON Schema (`schemas/aix.schema.json`). If you find an edge case in agent identity, economics, or risk scoring, open a PR with:
- The schema change.
- A "Golden Manifest" in `tests/golden_manifests/` demonstrating the use case.
- Updated validation logic in `packages/aix-core`.

### 2. The Studio (Next.js)
The AIX Studio is our flagship IDE for agent builders. Areas of focus:
- **Voice Wizard**: Enhancing the STT/LLM/TTS pipeline.
- **ABOM Scanner**: Improving forensic detection of supply-chain risks.
- **Identity UI**: Streamlining Pi Network KYC and did:axiom management.

### 3. MCP Servers
Build and register new MCP servers that agents can use to interact with the world.

## 🛠 Development Workflow

### Setup
```bash
git clone https://github.com/Moeabdelaziz007/aix-format.git
npm install
npm run studio:dev
```

### Before EVERY commit — Non-negotiable:
1.  **Build Validation**: `cd apps/studio && npm run build` (must pass).
2.  **Type Check**: `npx tsc --noEmit` (must pass).
3.  **Schema-Type Sync**: `npm run schema:sync:check` (must pass).
4.  **Route Scan**: `node --loader ts-node/esm scripts/validate-routes.ts`.

### Commit format:
We use [Conventional Commits](https://www.conventionalcommits.org/):
- `feat(studio): ...`
- `fix(core): ...`
- `docs(arch): ...`

## 🛡 Code Standards & Rules
- **Directives**: `'use client'` must be the first line on all hook/browser files.
- **Aliases**: Always use `@/` alias; never use relative imports.
- **Storage**: `localStorage` only inside `useEffect` + `try/catch`.
- **Typing**: `AgentRecord` must always be imported from `@/lib/types`.
- **BOM Logic**: Use `capabilities`, never `apis` (v1.3 standard).
- **Schema Sync**: NEVER edit `types/parser.d.ts` manually. Always edit `schemas/aix.schema.json` first, then run `npm run generate:types:unified`.

## 📐 Schema-Type Synchronization

### The Problem (المشكلة)
TypeScript types can silently diverge from JSON schemas over time, causing runtime validation failures that static analysis cannot catch. This exact issue caused v1.2 → v1.3 type conflicts in production.

### The Solution (الحل)
We use a **bidirectional validation system** that runs automatically in CI:

1. **Source of Truth**: `schemas/aix.schema.json` is the canonical definition
2. **Generated Types**: `packages/aix-types/index.d.ts` contains manually maintained types
3. **Automated Sync**: `scripts/schema-type-sync.ts` detects drift between them

### How to Fix Schema Drift (كيفية إصلاح الانحراف)

#### Scenario 1: You need to add a new field
```bash
# 1. Edit the schema (NOT the types)
vim schemas/aix.schema.json

# 2. Update the TypeScript types manually to match
vim packages/aix-types/index.d.ts

# 3. Verify sync
npm run schema:sync:check

# 4. If drift detected, review the report
cat .generated/schema-drift-report.txt

# 5. Commit both files together
git add schemas/aix.schema.json packages/aix-types/index.d.ts
git commit -m "feat(schema): add new field to AIXManifest"
```

#### Scenario 2: CI reports drift
```bash
# 1. Download the drift report artifact from GitHub Actions
# 2. Review the exact discrepancies
# 3. Edit schemas/aix.schema.json to match your intent
# 4. Update packages/aix-types/index.d.ts accordingly
# 5. Run npm run schema:sync:check locally
# 6. Push the fix
```

#### Scenario 3: Quick fix for generated types
```bash
# If you only changed the schema and forgot to update types:
npm run schema:sync:fix
```

### Common Drift Scenarios (سيناريوهات الانحراف الشائعة)

| Issue | الحل / Solution |
|-------|----------------|
| Missing field in TypeScript | Add the field to the interface in `packages/aix-types/index.d.ts` |
| Missing field in Schema | Add the property to `schemas/aix.schema.json` |
| Type mismatch | Ensure schema `type` matches TypeScript type (e.g., `string` → `string`, `number` → `number`) |
| Required vs Optional | Schema `required` array must match TypeScript `?` optional markers |
| Enum mismatch | Schema `enum` values must match TypeScript union types exactly |

### Pre-commit Hook (Optional)
Enable local validation before every commit:
```bash
chmod +x .husky/pre-commit
```

This will run `npm run schema:sync:check` automatically. Skip with `git commit --no-verify` if needed.

---

*“The best way to predict the future is to architect it.”*
