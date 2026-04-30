
# AIX Studio Build Hardening & Troubleshooting

This document outlines common build issues in `apps/studio` and the hardening layer implemented in PR #63 to prevent them.

## 🛡️ Hardening Layer (PR #63)

We have implemented an automated check in `apps/studio/scripts/hardening-check.ts` that runs before every build to ensure:
1. **Zero Dependency YAML**: `js-yaml` is prohibited in the studio bundle to avoid ESM/CJS resolution conflicts and Vercel build failures.
2. **Version Lock**: Critical versions for `next`, `framer-motion`, and `tailwindcss` are validated.
3. **Peer Deps**: React 19 compatibility is checked.

## 🛠️ Common Build Errors & Fixes

### 1. `MODULE_NOT_FOUND` (js-yaml)
- **Cause**: Import of `js-yaml` in a client-side component where the environment (e.g. Turbopack or Vercel) fails to resolve the dynamic module.
- **Fix**: Use `parseYamlLight` from `@/lib/utils` instead of `js-yaml`.

### 2. `Hydration Overlay Error` (framer-motion)
- **Cause**: Version mismatch between `framer-motion` and `react`.
- **Fix**: Run `npm install framer-motion@latest` and ensure `react@19` is used.

### 3. `Tailwind PostCSS Warning`
- **Cause**: Missing `@tailwindcss/postcss` with Tailwind 4.
- **Fix**: Ensure `@tailwindcss/postcss` is present in `package.json` and `postcss.config.mjs` is correctly configured.

### 4. `TypeScript Type Clash`
- **Cause**: Outdated `@types` packages for React.
- **Fix**: Synchronize `@types/react` and `@types/react-dom` to `^19`.

## 🚀 Running the Hardening Check
To manually verify the environment:
```bash
npx ts-node scripts/hardening-check.ts
```
