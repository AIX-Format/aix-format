# 🧬 AIX Meta-Loop Scripts

Automated tools for self-improving codebase maintenance and deployment.

---

## 📁 Scripts Overview

### 1. `vercel-auto-fix.sh` - Automated Build & Deploy Loop
**Purpose:** Automatically build, detect errors, fix them, and deploy to Vercel until success.

**Features:**
- ✅ Detects 6 types of build errors
- ✅ Auto-fixes common issues
- ✅ Deploys to Vercel on success
- ✅ Detailed logging

**Usage:**
```bash
# Make executable
chmod +x scripts/vercel-auto-fix.sh

# Run with default settings (max 10 iterations)
./scripts/vercel-auto-fix.sh

# Run with custom max iterations
./scripts/vercel-auto-fix.sh --max-iterations 20
```

**What it fixes automatically:**
1. **'use client' directive position** - Moves to top of file
2. **Missing modules** - Installs @rainbow-me/rainbowkit, next-auth, etc.
3. **Import/export mismatches** - Detects and logs for manual fix
4. **TypeScript errors** - Detects and logs (complex fixes need manual intervention)
5. **Syntax errors** - Detects and logs
6. **Environment variable errors** - Removes problematic .env.production

**Output:**
- `vercel-build-YYYYMMDD-HHMMSS.log` - Build output
- `auto-fixes-YYYYMMDD-HHMMSS.log` - Fix actions taken
- `vercel-deploy.log` - Deployment output

---

### 2. `meta-loop-cleaner.sh` - Code Quality Scanner
**Purpose:** Scan codebase for 10 common code quality issues and anti-patterns.

**Features:**
- ✅ Detects 10 code smell patterns
- ✅ Dry-run mode for safe scanning
- ✅ Aggressive mode for auto-fixes
- ✅ Detailed statistics

**Usage:**
```bash
# Make executable
chmod +x scripts/meta-loop-cleaner.sh

# Scan only (no changes)
./scripts/meta-loop-cleaner.sh --dry-run

# Scan and auto-fix
./scripts/meta-loop-cleaner.sh --aggressive

# Both modes
./scripts/meta-loop-cleaner.sh --dry-run --aggressive
```

**What it detects:**
1. **Dangerous Type Assertions** - `as unknown` usage
2. **Missing Error Handling** - Empty catch blocks
3. **Console.log in Production** - Debug statements
4. **TODO/FIXME Comments** - Unfinished work
5. **Duplicate Imports** - Same import twice
6. **Unused Variables** - Declared but never used
7. **Long Functions** - Functions >100 lines
8. **Magic Numbers** - Hardcoded values
9. **Circular Dependencies** - Excessive parent imports
10. **Missing TypeScript Types** - `: any` and `: unknown`

**Output:**
- `meta-loop-YYYYMMDD-HHMMSS.log` - Scan results

---

## 🚀 Quick Start Guide

### First Time Setup

1. **Install dependencies:**
```bash
cd apps/studio
pnpm install
```

2. **Make scripts executable:**
```bash
chmod +x scripts/*.sh
```

3. **Install Vercel CLI (if deploying):**
```bash
npm i -g vercel
vercel login
```

### Typical Workflow

#### Scenario 1: Fix Build Errors Automatically
```bash
# Run auto-fix loop
./scripts/vercel-auto-fix.sh

# Check logs if it fails
cat vercel-build-*.log
cat auto-fixes-*.log
```

#### Scenario 2: Code Quality Check Before Commit
```bash
# Scan for issues
./scripts/meta-loop-cleaner.sh --dry-run

# Fix automatically
./scripts/meta-loop-cleaner.sh --aggressive

# Review changes
git diff
```

#### Scenario 3: Full CI/CD Pipeline
```bash
# 1. Clean code
./scripts/meta-loop-cleaner.sh --aggressive

# 2. Build and deploy
./scripts/vercel-auto-fix.sh

# 3. Verify deployment
# Check URL in output
```

---

## 📊 Current Codebase Stats

- **Total Lines:** 36,194
- **Total Files:** ~150 (TS/TSX)
- **Average Lines/File:** ~241

---

## 🔧 Troubleshooting

### Script won't run
```bash
# Make sure it's executable
chmod +x scripts/vercel-auto-fix.sh

# Check bash is available
which bash
```

### Build still fails after auto-fix
```bash
# Check the build log
cat vercel-build-*.log

# Look for errors that need manual intervention
grep "error" vercel-build-*.log
```

### Vercel deployment fails
```bash
# Make sure you're logged in
vercel whoami

# Check if project is linked
vercel link

# Try manual deployment
cd apps/studio
vercel --prod
```

---

## 🎯 Best Practices

1. **Always run dry-run first** before aggressive mode
2. **Review auto-fixes** before committing
3. **Keep logs** for debugging
4. **Run cleaner** before every PR
5. **Use auto-fix** for CI/CD pipelines

---

## 📝 Adding New Patterns

To add a new error pattern to `vercel-auto-fix.sh`:

1. Create detection function:
```bash
detect_new_pattern() {
  log "🔍 Checking for new pattern..."
  local errors=$(grep "pattern" "$BUILD_LOG" || true)
  if [ -n "$errors" ]; then
    warn "Found new pattern"
    # Fix logic here
    return 1
  fi
  return 0
}
```

2. Add to `auto_fix_all()`:
```bash
if detect_new_pattern; then
  ((fixed++))
fi
```

---

## 🤝 Contributing

When adding new auto-fix strategies:
- ✅ Always test in dry-run mode first
- ✅ Add detailed logging
- ✅ Handle edge cases
- ✅ Update this README

---

## 📚 Related Documentation

- [Critical Fixes Applied](../docs/CRITICAL_FIXES_APPLIED.md)
- [Next Steps Guide](../NEXT_STEPS.md)
- [Fixes Summary](../FIXES_SUMMARY.md)

---

**Made with ❤️ by AIX Evolution Mode**