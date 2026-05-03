# ⚡ Quick Environment Setup

Get up and running in 5 minutes!

## 🚀 Quick Start

```bash
# 1. Copy example files
cp .env.example .env
cp apps/studio/.env.example apps/studio/.env.local

# 2. Get your free API keys (5 minutes)
# See sections below for each service

# 3. Validate your setup
npm run validate:env
```

## 🔑 Get Your Free API Keys

### 1. Upstash Redis (Required - 2 minutes)
**Free tier: 10,000 commands/day**

1. Go to [upstash.com](https://upstash.com)
2. Sign up with GitHub
3. Click "Create Database"
4. Copy REST URL and Token
5. Paste into `.env`:
   ```bash
   UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your_token_here
   ```

### 2. Groq (Voice - 1 minute)
**Free tier: 14,400 requests/day**

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up
3. Go to API Keys → Create API Key
4. Paste into `.env.local`:
   ```bash
   GROQ_API_KEY=gsk_your_key_here
   ```

### 3. Google Gemini (Voice - 1 minute)
**Free tier: 1,500 requests/day**

1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Paste into `.env.local`:
   ```bash
   GOOGLE_GENERATIVE_AI_API_KEY=AIza_your_key_here
   ```

### 4. xAI Grok (Voice - 1 minute)
**Free tier: Available**

1. Go to [console.x.ai](https://console.x.ai)
2. Sign up
3. Create API Key
4. Paste into `.env.local`:
   ```bash
   XAI_API_KEY=xai-your_key_here
   ```

## ✅ Verify Setup

```bash
npm run validate:env
```

You should see:
```
✓ VALIDATION PASSED
```

## 🎯 Minimal Working Configuration

For local development, you only need:

```bash
# .env
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# apps/studio/.env.local
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
GROQ_API_KEY=gsk_your_key
GOOGLE_GENERATIVE_AI_API_KEY=AIza_your_key
XAI_API_KEY=xai-your_key
```

## 🔒 Security Checklist

Before deploying to production:

- [ ] Change `AIX_UID_HASH_SALT` to a random value
- [ ] Change `JWT_SECRET` to a random value
- [ ] Set `PI_ENVIRONMENT=production` (if using Pi Network)
- [ ] Set `SKIP_SIGNATURE_VERIFICATION=false`
- [ ] Add `SENTRY_DSN` for error tracking
- [ ] Review all API keys and rotate if needed

Generate secure secrets:
```bash
# Generate random salt
openssl rand -base64 32

# Generate JWT secret
openssl rand -base64 64
```

## 🐛 Troubleshooting

### "Missing required env: UPSTASH_REDIS_REST_URL"
- Make sure you copied `.env.example` to `.env`
- Restart your dev server after changing `.env`

### "Redis connection failed"
- Check your Upstash dashboard
- Verify URL and token are correct
- Test connection:
  ```bash
  curl $UPSTASH_REDIS_REST_URL/ping \
    -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN"
  ```

### "Voice features not working"
- Verify all three voice API keys are set
- Check API quotas in respective dashboards
- Restart dev server

## 📚 Next Steps

- [Full Environment Setup Guide](./ENVIRONMENT_SETUP.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Architecture Overview](./ARCHITECTURE.md)

## 🆘 Need Help?

- [GitHub Issues](https://github.com/Moeabdelaziz007/aix-format/issues)
- [Full Documentation](./ENVIRONMENT_SETUP.md)