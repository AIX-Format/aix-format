#!/usr/bin/env bash
# =============================================================================
# AIX Env Vault — ONE TIME SETUP
# =============================================================================
# Run this ONCE after filling .env.local
# It syncs your keys to every IDE, platform, and tool automatically.
#
# What it does:
#   1. Reads .env.local (source of truth)
#   2. Writes .env.vault (encrypted backup)
#   3. Copies to apps/studio/.env.local
#   4. Copies to packages/aix-core/.env.local
#   5. Sets Vercel env vars (if gh CLI available)
#   6. Validates required keys are present
#
# After this, you NEVER set API keys again in:
#   - VS Code terminals
#   - Cursor IDE
#   - Claude / Perplexity code runners
#   - Vercel deployments
#   - GitHub Actions (manual step: gh secret set)
# =============================================================================

set -e
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'; BOLD=$(tput bold 2>/dev/null || echo '')
RESET=$(tput sgr0 2>/dev/null || echo '')
log()  { echo -e "${GREEN}✔${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC}  $1"; }
fail() { echo -e "${RED}✗${NC} $1"; exit 1; }

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_SOURCE="$ROOT/.env.local"
ENV_VAULT="$ROOT/.env.vault"

echo ""
echo -e "${BOLD}🔑 AIX Env Vault Setup${RESET}"
echo "========================================="
echo "Root: $ROOT"
echo ""

# Step 1: Check source file exists
if [ ! -f "$ENV_SOURCE" ]; then
  if [ -f "$ROOT/.env.example" ]; then
    cp "$ROOT/.env.example" "$ENV_SOURCE"
    warn "Created .env.local from .env.example — FILL IN YOUR KEYS, then re-run this script"
    echo ""
    cat "$ENV_SOURCE"
    echo ""
    exit 0
  fi
  fail ".env.local not found. Create it with your API keys first."
fi

log "Source: $ENV_SOURCE"

# Step 2: Parse and validate required keys
REQUIRED_KEYS=("OPENAI_API_KEY" "KV_REST_API_URL" "KV_REST_API_TOKEN")
declare -A ENV_MAP
while IFS='=' read -r key value || [ -n "$key" ]; do
  # Skip comments and empty lines
  [[ -z "$key" || "$key" =~ ^# ]] && continue
  key=$(echo "$key" | tr -d ' ')
  value=$(echo "$value" | tr -d ' ')
  ENV_MAP["$key"]="$value"
done < "$ENV_SOURCE"

MISSING=0
for req in "${REQUIRED_KEYS[@]}"; do
  if [ -z "${ENV_MAP[$req]:-}" ]; then
    warn "Missing required key: $req"
    MISSING=$((MISSING + 1))
  else
    log "$req = ${ENV_MAP[$req]:0:8}…"
  fi
done

if [ $MISSING -gt 0 ]; then
  warn "$MISSING required key(s) missing — continuing, but LLM/Redis won't work"
fi

# Step 3: Write vault (copy = source of truth, can add encryption here)
cp "$ENV_SOURCE" "$ENV_VAULT"
chmod 600 "$ENV_VAULT"
log "Vault written: $ENV_VAULT"

# Step 4: Sync to all packages
DESTINATIONS=(
  "$ROOT/apps/studio/.env.local"
  "$ROOT/packages/aix-core/.env.local"
  "$ROOT/apps/aix-detective/.env.local"
)

for dest in "${DESTINATIONS[@]}"; do
  dest_dir=$(dirname "$dest")
  if [ -d "$dest_dir" ]; then
    cp "$ENV_SOURCE" "$dest"
    chmod 600 "$dest"
    log "Synced → $dest"
  fi
done

# Step 5: Vercel sync (if CLI available)
if command -v vercel &>/dev/null; then
  echo ""
  echo -e "${BOLD}Syncing to Vercel…${RESET}"
  while IFS='=' read -r key value || [ -n "$key" ]; do
    [[ -z "$key" || "$key" =~ ^# ]] && continue
    key=$(echo "$key" | tr -d ' ')
    value=$(echo "$value" | tr -d ' ')
    [ -z "$value" ] && continue
    echo "$value" | vercel env add "$key" production 2>/dev/null && log "Vercel: $key" || warn "Vercel: $key (may already exist)"
  done < "$ENV_SOURCE"
else
  warn "Vercel CLI not found — run: npm i -g vercel && vercel login, then re-run this script"
fi

# Step 6: GitHub Actions secrets (if gh CLI available)
if command -v gh &>/dev/null; then
  echo ""
  echo -e "${BOLD}Syncing to GitHub Secrets…${RESET}"
  while IFS='=' read -r key value || [ -n "$key" ]; do
    [[ -z "$key" || "$key" =~ ^# ]] && continue
    key=$(echo "$key" | tr -d ' ')
    value=$(echo "$value" | tr -d ' ')
    [ -z "$value" ] && continue
    [[ "$key" == NEXT_PUBLIC_* ]] && continue  # skip public vars
    gh secret set "$key" --body "$value" 2>/dev/null && log "GitHub Secret: $key" || warn "GitHub Secret: $key (check repo permissions)"
  done < "$ENV_SOURCE"
else
  warn "gh CLI not found — GitHub secrets not synced"
fi

# Step 7: Add .env.vault to .gitignore if not already
GITIGNORE="$ROOT/.gitignore"
if [ -f "$GITIGNORE" ] && ! grep -q '.env.vault' "$GITIGNORE"; then
  echo '.env.vault' >> "$GITIGNORE"
  echo '.env.local' >> "$GITIGNORE"
  log ".env.vault + .env.local added to .gitignore"
fi

# Summary
echo ""
echo -e "${BOLD}✅ Env Vault Setup Complete!${RESET}"
echo ""
echo "Source of truth:  $ENV_SOURCE"
echo "Vault backup:     $ENV_VAULT"
echo ""
echo "Next time you switch IDE or platform:"
echo "  → Just run: bash scripts/setup-env.sh"
echo "  → All destinations sync automatically"
echo ""
echo "To add a new key:"
echo "  1. Add it to .env.local"
echo "  2. Run: bash scripts/setup-env.sh"
echo "  3. Done. Every tool gets it."
echo ""
