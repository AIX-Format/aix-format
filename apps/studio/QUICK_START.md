# 🚀 Quick Start Guide - AIX Studio with Pi Network

Get your AI agent marketplace running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Pi Network Developer account
- Git

## Step 1: Clone & Install (1 min)

```bash
# Clone the repository
git clone <your-repo-url>
cd aix-format

# Install dependencies
npm install
```

## Step 2: Pi Network Setup (2 min)

### Get Your Credentials

1. Visit [Pi Developer Portal](https://develop.pi)
2. Sign in with your Pi account
3. Click "Create App" or select existing app
4. Copy your **API Key** and **App ID**

### Whitelist Your Domain

1. In Pi Developer Portal, go to App Settings
2. Add these domains:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
3. Click "Save" and wait for verification (usually instant)

## Step 3: Configure Environment (1 min)

```bash
# Navigate to studio app
cd apps/studio

# Copy environment template
cp .env.example .env.local

# Edit .env.local and add your Pi credentials
```

Add these lines to `.env.local`:

```env
# Pi Network (REQUIRED)
PI_API_KEY=your_pi_api_key_here
PI_APP_ID=your_pi_app_id_here
NEXT_PUBLIC_PI_APP_ID=your_pi_app_id_here
PI_ENVIRONMENT=sandbox

# Optional but recommended
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
GROQ_API_KEY=gsk_your_key
GOOGLE_GENERATIVE_AI_API_KEY=AIza_your_key
```

## Step 4: Run the App (1 min)

```bash
# From apps/studio directory
npm run dev
```

Visit: **http://localhost:3000**

## 🎉 You're Ready!

### Try These Pages:

1. **Landing Page**: http://localhost:3000
   - See the hero section
   - View agent cards
   - Check out the voice orb

2. **Dashboard**: http://localhost:3000/dashboard
   - Connect your Pi account
   - View real-time metrics
   - Monitor agent activity

3. **Marketplace**: http://localhost:3000/marketplace
   - Browse available agents
   - Filter by KYC status
   - Search agents

## 🧪 Test Pi Integration

### Test Authentication

1. Go to Dashboard
2. Click "Connect with Pi"
3. Approve in Pi Browser
4. See your account info displayed

### Test Payment (Sandbox)

```tsx
// Add to any page
import { PiPayment } from "@/components/pi/PiPayment";

<PiPayment
  amount={0.1}
  memo="Test Payment"
  onSuccess={(id, txid) => console.log("Success!", id, txid)}
/>
```

## 🐛 Troubleshooting

### "Pi SDK not loaded"
- Check that domain is whitelisted in Pi Developer Portal
- Clear browser cache and reload
- Check browser console for errors

### "Authentication failed"
- Verify API Key and App ID are correct
- Make sure you're using the right environment (sandbox/production)
- Check that `.env.local` is in `apps/studio/` directory

### "Module not found" errors
- Run `npm install` from root directory
- Try `npm run build` to check for TypeScript errors
- Restart the dev server

## 📚 Next Steps

### Explore the Code

- **Components**: `apps/studio/src/components/pi/`
- **Hooks**: `apps/studio/src/hooks/usePi.ts`
- **API Routes**: `apps/studio/src/app/api/pi/`
- **Dashboard**: `apps/studio/src/app/dashboard/page.tsx`

### Read the Docs

- [Pi Network Integration Guide](./PI_NETWORK_INTEGRATION.md)
- [AIX Format Spec](../../docs/AIX_SPEC.md)
- [Architecture](../../docs/ARCHITECTURE.md)

### Deploy to Production

1. Update environment to `production`:
   ```env
   PI_ENVIRONMENT=production
   ```

2. Use production Pi credentials

3. Deploy to Vercel/Netlify:
   ```bash
   npm run build
   ```

4. Add environment variables in hosting platform

5. Update domain whitelist in Pi Developer Portal

## 🎯 What You Can Build

- **Agent Marketplace**: Buy/sell AI agents with Pi
- **Agent Deployment**: Deploy agents with Pi payments
- **Subscription Services**: Recurring Pi payments
- **Agent Rentals**: Hourly/daily agent access
- **Premium Features**: Unlock features with Pi
- **Tipping System**: Tip agent creators

## 💡 Pro Tips

1. **Start in Sandbox**: Always test in sandbox mode first
2. **Check Balance**: Verify user has sufficient Pi before payments
3. **Handle Errors**: Always implement error handling
4. **Verify KYC**: Check KYC status for high-value transactions
5. **Log Everything**: Use console.log for debugging
6. **Test Payments**: Use small amounts (0.01 π) for testing

## 🤝 Need Help?

- Check [Pi Developer Docs](https://developers.minepi.com/)
- Read [Troubleshooting Guide](./PI_NETWORK_INTEGRATION.md#troubleshooting)
- Open an issue on GitHub
- Join Pi Developer Community

## ✅ Checklist

- [ ] Node.js 18+ installed
- [ ] Pi Developer account created
- [ ] API Key and App ID obtained
- [ ] Domain whitelisted in Pi Portal
- [ ] `.env.local` configured
- [ ] Dependencies installed
- [ ] Dev server running
- [ ] Pi authentication tested
- [ ] Dashboard accessible
- [ ] Marketplace loading

---

**Happy Building! 🥧🚀**