# 🔧 Environment Setup Guide

This guide explains how to configure environment variables for the AIX Format project.

## 📋 Quick Start

1. **Copy the example file:**
   ```bash
   # For root project
   cp .env.example .env
   
   # For Studio app
   cp apps/studio/.env.example apps/studio/.env.local
   ```

2. **Fill in your values** (see sections below)

3. **Validate your configuration:**
   ```typescript
   import { validateEnv } from '@/lib/env';
   
   const { valid, missing, warnings } = validateEnv();
   if (!valid) {
     console.error('Missing required env vars:', missing);
   }
   ```

## 🔴 Critical Variables (Required for Production)

### Upstash Redis
**Required for:** Storage, sessions, pulse stream, agent registry

```bash
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

**How to get:**
1. Go to [upstash.com](https://upstash.com)
2. Create a new Redis database
3. Copy the REST API URL and token

### Security Secrets
**Critical:** Change these in production!

```bash
AIX_UID_HASH_SALT=your_random_salt_here_change_in_production
JWT_SECRET=your_jwt_secret_change_in_production
```

**How to generate secure values:**
```bash
# Generate random salt (32 bytes)
openssl rand -base64 32

# Generate JWT secret (64 bytes)
openssl rand -base64 64
```

## 🟡 Important Variables (Features Disabled Without These)

### Voice Services

#### Groq (Voice Transcription)
```bash
GROQ_API_KEY=gsk_your_groq_key
```
- Get from: [console.groq.com/keys](https://console.groq.com/keys)
- Free tier available
- Used for: Whisper large-v3 speech-to-text

#### Google Gemini (Voice Chat)
```bash
GOOGLE_GENERATIVE_AI_API_KEY=AIza_your_google_key
```
- Get from: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
- Used for: Gemini 2.0 Flash voice wizard

#### xAI Grok (Voice Commands)
```bash
XAI_API_KEY=xai-your_grok_key
```
- Get from: [console.x.ai](https://console.x.ai)
- Used for: Global voice command intelligence
- **Security:** Revoke immediately if exposed

### Pi Network (Authentication & Payments)

```bash
PI_API_KEY=your_pi_api_key
PI_APP_ID=your_pi_app_id
NEXT_PUBLIC_PI_APP_ID=your_pi_app_id
PI_ENVIRONMENT=sandbox  # or 'production'
NEXT_PUBLIC_PI_ENABLED=true
```

**How to get:**
1. Go to [develop.pi](https://develop.pi)
2. Create a new app
3. Verify your domain in Pi Developer Portal
4. Copy API key and App ID

**Environments:**
- `sandbox` - For testing (testnet)
- `production` - For mainnet (real Pi)

### Payment Integrations

#### Stripe
```bash
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```
- Get from: [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)

#### WalletConnect
```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```
- Get from: [cloud.walletconnect.com](https://cloud.walletconnect.com)

#### Crypto Payments
```bash
NEXT_PUBLIC_CRYPTO_ENABLED=true
PROTOCOL_TREASURY_ADDRESS=0xYourTreasuryAddress
```

### Telegram Integration
```bash
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```
- Get from: [@BotFather](https://t.me/BotFather) → `/newbot`

## 🟢 Optional Variables (AI Services)

### OpenAI
```bash
OPENAI_API_KEY=your_openai_api_key
```
- Used for: Embeddings, semantic memory
- Get from: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### Anthropic Claude
```bash
ANTHROPIC_API_KEY=your_anthropic_api_key
```
- Get from: [console.anthropic.com](https://console.anthropic.com)

### Google AI
```bash
GOOGLE_AI_API_KEY=your_google_ai_api_key
```
- Different from Gemini above
- Get from: [makersuite.google.com](https://makersuite.google.com)

## ⚙️ App Configuration

### URLs
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Your app URL
NEXT_PUBLIC_VERCEL_URL=your-app.vercel.app  # Vercel deployment
```

### Versioning
```bash
NEXT_PUBLIC_STUDIO_VERSION=1.3.0
```

### Logging
```bash
NEXT_PUBLIC_LOG_LEVEL=info  # debug | info | warn | error
DEBUG=false
```

### Node Environment
```bash
NODE_ENV=development  # development | production | test
```

## 🔐 Identity & Security

### AxiomID (DID Verification)
```bash
AXIOM_AUTHORITY=axiomid.app
AXIOM_API_KEY=your_axiom_api_key
```

### ZK-KYC
```bash
ZK_VERIFICATION_KEY={"your":"verification","key":"here"}
```

## 📊 Monitoring & Debugging

### Sentry (Error Tracking)
```bash
SENTRY_DSN=your_sentry_dsn
```
- Get from: [sentry.io](https://sentry.io)

### Development Flags
```bash
DEBUG=false
SKIP_SIGNATURE_VERIFICATION=false  # NEVER true in production!
ANALYZE=false  # Bundle analyzer
```

## 🚀 Vercel CI/CD

**Set these in GitHub Secrets, NOT in .env files:**

```bash
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

## 🛠️ Backend Services

### Swarm Router (Go)
```bash
SWARM_ROUTER_PORT=8080
```

## 📝 Environment File Hierarchy

The project uses multiple environment files:

1. **Root `.env`** - Core services (Redis, identity, security)
2. **`apps/studio/.env.local`** - Studio-specific (Next.js, voice, payments)
3. **Package-specific** - Some packages may have their own `.env` files

### Loading Order (Next.js)
1. `.env.local` (highest priority, gitignored)
2. `.env.development` or `.env.production`
3. `.env`

## ✅ Validation

Use the built-in validation function:

```typescript
import { validateEnv, env } from '@/lib/env';

// Validate on app startup
const validation = validateEnv();

if (!validation.valid) {
  console.error('❌ Missing required environment variables:');
  validation.missing.forEach(key => console.error(`  - ${key}`));
  process.exit(1);
}

if (validation.warnings.length > 0) {
  console.warn('⚠️ Environment warnings:');
  validation.warnings.forEach(msg => console.warn(`  - ${msg}`));
}

// Access typed environment variables
console.log('App URL:', env.NEXT_PUBLIC_APP_URL);
console.log('Pi Environment:', env.PI_ENVIRONMENT);
```

## 🔒 Security Best Practices

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use different values** for development and production
3. **Rotate secrets regularly** - Especially after team changes
4. **Use environment-specific files** - `.env.local`, `.env.production`
5. **Validate on startup** - Use `validateEnv()` function
6. **Monitor for leaks** - Use tools like `git-secrets`
7. **Use secret managers** - For production (AWS Secrets Manager, Vault, etc.)

## 🐛 Troubleshooting

### "Missing required env: X"
- Check if the variable is set in your `.env` file
- Restart your dev server after changing `.env`
- For Next.js, `NEXT_PUBLIC_*` vars require rebuild

### "Redis connection failed"
- Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- Check if your IP is allowed in Upstash dashboard
- Test connection: `curl $UPSTASH_REDIS_REST_URL/ping -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN"`

### "Voice features not working"
- Check `GROQ_API_KEY` is set
- Verify `GOOGLE_GENERATIVE_AI_API_KEY` is valid
- Check API quotas in respective dashboards

### "Pi Network authentication failed"
- Verify domain is registered in Pi Developer Portal
- Check `PI_ENVIRONMENT` matches your testing mode
- Ensure `NEXT_PUBLIC_PI_APP_ID` is set (client-side)

## 📚 Related Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Security Guide](./SECURITY.md)
- [API Documentation](./API_EXCELLENCE.md)
- [Architecture Overview](./ARCHITECTURE.md)

## 🆘 Need Help?

- Check [GitHub Issues](https://github.com/your-repo/issues)
- Join our [Discord](https://discord.gg/your-invite)
- Read the [Contributing Guide](../CONTRIBUTING.md)