# 🔧 Webpack Issues - Complete Fix Guide

## 🚨 Critical Fix Applied

### Issue: Invalid transpilePackages in next.config.ts
**Problem:** Referenced non-existent packages causing webpack to fail
```typescript
// ❌ BEFORE (WRONG)
transpilePackages: ["@aix-core/storage", "aix-format"]

// ✅ AFTER (FIXED)
transpilePackages: ["@aix-format/aix-zkkyc", "@aix-format/mcp-gateway"]
```

**Root Cause:** Configuration copied from template without updating package names

**Status:** ✅ FIXED in [`apps/studio/next.config.ts`](../apps/studio/next.config.ts:17)

---

## 🔍 Common Webpack Errors & Solutions

### 1. Module Not Found Errors

#### Error Pattern:
```
Module not found: Can't resolve '@rainbow-me/rainbowkit'
Module not found: Can't resolve 'wagmi'
```

**Solution:**
```bash
cd apps/studio
rm -rf node_modules .next
pnpm install
```

**Why:** Dependencies not installed after package.json changes

---

### 2. Invalid Hook Call Errors

#### Error Pattern:
```
Error: Invalid hook call. Hooks can only be called inside the body of a function component.
```

**Common Causes:**
1. Multiple React versions
2. Missing 'use client' directive
3. React.memo on page.tsx files

**Solution:**
```bash
# Check for duplicate React
pnpm list react

# If duplicates found, dedupe
pnpm dedupe
```

**Code Fix:**
```typescript
// ✅ Add 'use client' at TOP of file (line 1)
'use client';

import React from 'react';

// ❌ DON'T use React.memo on page.tsx
export default function Page() { ... }

// ✅ DO use React.memo on components
export const MyComponent = React.memo(function MyComponent() { ... });
```

---

### 3. Webpack Compilation Errors

#### Error Pattern:
```
./src/components/MyComponent.tsx
Module parse failed: Unexpected token
```

**Solution 1: Check TypeScript Config**
```json
// tsconfig.json must have:
{
  "compilerOptions": {
    "jsx": "preserve",  // NOT "react" or "react-jsx"
    "lib": ["dom", "dom.iterable", "esnext"]
  }
}
```

**Solution 2: Check File Extensions**
```bash
# Find files with wrong extensions
find src -name "*.js" -o -name "*.jsx" | grep -v node_modules

# Rename if needed
mv src/component.js src/component.tsx
```

---

### 4. Dynamic Import Errors

#### Error Pattern:
```
Error: Element type is invalid: expected a string (for built-in components)
```

**Solution:**
```typescript
// ❌ WRONG
const Component = dynamic(() => import('./Component'));

// ✅ CORRECT
const Component = dynamic(() => import('./Component'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});
```

---

### 5. CSS/Style Import Errors

#### Error Pattern:
```
Module parse failed: Unexpected character '@' (1:0)
```

**Solution:**
```typescript
// ✅ Import CSS in layout.tsx or _app.tsx
import './globals.css';

// ❌ DON'T import CSS in components (unless CSS modules)
```

---

### 6. Environment Variable Errors

#### Error Pattern:
```
ReferenceError: process is not defined
```

**Solution:**
```typescript
// ❌ WRONG (client-side)
const apiKey = process.env.API_KEY;

// ✅ CORRECT (client-side)
const apiKey = process.env.NEXT_PUBLIC_API_KEY;

// ✅ CORRECT (server-side only)
// In API routes or Server Components
const apiKey = process.env.API_KEY;
```

---

### 7. Monorepo Package Resolution

#### Error Pattern:
```
Module not found: Can't resolve '@aix-format/package-name'
```

**Solution 1: Check pnpm-workspace.yaml**
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**Solution 2: Install from workspace root**
```bash
# From workspace root
pnpm install

# NOT from apps/studio
```

**Solution 3: Add to transpilePackages**
```typescript
// next.config.ts
transpilePackages: [
  "@aix-format/aix-zkkyc",
  "@aix-format/mcp-gateway"
]
```

---

### 8. Build Cache Issues

#### Error Pattern:
```
Error: ENOENT: no such file or directory
Unexpected token in JSON
```

**Solution:**
```bash
cd apps/studio

# Clear all caches
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo

# Reinstall
pnpm install
pnpm build
```

---

### 9. TypeScript Type Errors

#### Error Pattern:
```
Type error: Cannot find module '@/components/...' or its corresponding type declarations
```

**Solution: Check tsconfig.json paths**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]  // Must match your structure
    }
  }
}
```

---

### 10. Webpack Memory Issues

#### Error Pattern:
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Solution:**
```bash
# Increase Node memory
export NODE_OPTIONS="--max-old-space-size=4096"
pnpm build

# Or in package.json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
}
```

---

## 🛠️ Complete Troubleshooting Workflow

### Step 1: Clean Everything
```bash
cd apps/studio
rm -rf node_modules .next .turbo
rm -rf node_modules/.cache
```

### Step 2: Verify Configuration
```bash
# Check package.json has correct dependencies
cat package.json | grep -A 5 "dependencies"

# Check tsconfig.json is valid
cat tsconfig.json | jq .

# Check next.config.ts syntax
npx tsc --noEmit next.config.ts
```

### Step 3: Reinstall Dependencies
```bash
# From workspace root
cd ../..
pnpm install

# Verify installation
cd apps/studio
ls node_modules/@rainbow-me/rainbowkit
ls node_modules/wagmi
```

### Step 4: Test Build
```bash
# Try build with verbose output
pnpm build --debug

# If fails, check specific error
pnpm build 2>&1 | tee build.log
```

### Step 5: Check for Common Issues
```bash
# Find 'use client' issues
grep -r "use client" src/ | grep -v "^'use client'"

# Find React.memo on pages
find src/app -name "page.tsx" -exec grep -l "React.memo" {} \;

# Find invalid displayName
grep -r "function.displayName" src/

# Find missing dependencies
grep -r "from ['\"]" src/ | grep -v node_modules | cut -d: -f2 | sort -u
```

---

## 🚀 Quick Fix Script

Save as `scripts/webpack-fix.sh`:

```bash
#!/bin/bash
set -e

echo "🔧 AIX Webpack Auto-Fix"
echo "======================="

cd apps/studio

echo "1️⃣ Cleaning build artifacts..."
rm -rf .next .turbo node_modules/.cache

echo "2️⃣ Checking configuration..."
if ! grep -q '"@aix-format/aix-zkkyc"' next.config.ts; then
  echo "⚠️  WARNING: transpilePackages may be incorrect"
fi

echo "3️⃣ Reinstalling dependencies..."
cd ../..
pnpm install
cd apps/studio

echo "4️⃣ Running build..."
if pnpm build; then
  echo "✅ Build successful!"
else
  echo "❌ Build failed. Check errors above."
  exit 1
fi
```

**Usage:**
```bash
chmod +x scripts/webpack-fix.sh
./scripts/webpack-fix.sh
```

---

## 📊 Verification Checklist

After applying fixes, verify:

- [ ] `pnpm install` completes without errors
- [ ] `node_modules/@rainbow-me/rainbowkit` exists
- [ ] `node_modules/wagmi` exists
- [ ] `pnpm build` completes successfully
- [ ] `.next` directory created
- [ ] No TypeScript errors in build output
- [ ] No webpack warnings about missing modules
- [ ] `pnpm start` runs without errors

---

## 🔗 Related Documentation

- [`CRITICAL_FIXES_APPLIED.md`](CRITICAL_FIXES_APPLIED.md) - All fixes applied
- [`NEXT_STEPS.md`](../NEXT_STEPS.md) - Deployment guide
- [`package.json`](../apps/studio/package.json) - Dependencies
- [`next.config.ts`](../apps/studio/next.config.ts) - Webpack config
- [`tsconfig.json`](../apps/studio/tsconfig.json) - TypeScript config

---

## 🆘 Still Having Issues?

### Get Detailed Error Info:
```bash
cd apps/studio
pnpm build --debug 2>&1 | tee webpack-error.log
```

### Check Specific Module:
```bash
# Check if module exists
ls node_modules/@rainbow-me/rainbowkit

# Check module exports
cat node_modules/@rainbow-me/rainbowkit/package.json | jq .exports
```

### Verify Next.js Version:
```bash
pnpm list next
# Should show: next@15.1.4
```

### Test in Development Mode:
```bash
pnpm dev
# If dev works but build fails, it's likely a production-only issue
```

---

**Last Updated:** 2026-05-03  
**Status:** ✅ transpilePackages fixed, ready for testing