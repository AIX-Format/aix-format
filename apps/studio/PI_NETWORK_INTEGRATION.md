# 🥧 Pi Network Integration Guide

Complete E2E frontend implementation with Pi Network authentication and payments for the AIX Studio.

## 📋 What's Been Built

### 1. **Pi Network SDK Integration** ✅
- Global type definitions for Pi SDK ([`src/app/globals.d.ts`](src/app/globals.d.ts))
- Environment configuration ([`.env.example`](.env.example))
- Pi Network client library ([`src/lib/pi-network.ts`](src/lib/pi-network.ts))

### 2. **Custom React Hook** ✅
- **`usePi`** hook ([`src/hooks/usePi.ts`](src/hooks/usePi.ts))
  - Automatic SDK initialization
  - Authentication flow
  - Payment creation
  - Session management
  - Error handling

### 3. **UI Components** ✅

#### PiAuth Component
- Location: [`src/components/pi/PiAuth.tsx`](src/components/pi/PiAuth.tsx)
- Features:
  - Pi Network authentication
  - Domain setup instructions
  - User info display
  - KYC status indicator
  - Balance display
  - Sandbox/Production mode toggle

#### PiPayment Component
- Location: [`src/components/pi/PiPayment.tsx`](src/components/pi/PiPayment.tsx)
- Features:
  - Payment creation
  - Real-time status updates
  - Transaction confirmation
  - Error handling
  - Balance checking

### 4. **API Endpoints** ✅

#### Payment Approval
- **POST** `/api/pi/approve-payment`
- Validates and approves Pi Network payments
- Location: [`src/app/api/pi/approve-payment/route.ts`](src/app/api/pi/approve-payment/route.ts)

#### Payment Completion
- **POST** `/api/pi/complete-payment`
- Completes Pi Network transactions
- Location: [`src/app/api/pi/complete-payment/route.ts`](src/app/api/pi/complete-payment/route.ts)

### 5. **Enhanced Dashboard** ✅
- Location: [`src/app/dashboard/page.tsx`](src/app/dashboard/page.tsx)
- Features:
  - Real-time agent metrics
  - Live activity feed
  - Performance analytics
  - Pi Network integration
  - Mo Gawdat happiness scores
  - System status monitoring

## 🚀 Getting Started

### Step 1: Environment Setup

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Get your Pi Network credentials:
   - Visit [Pi Developer Portal](https://develop.pi)
   - Create or select your app
   - Copy your **API Key** and **App ID**

3. Add to `.env.local`:
```env
# Pi Network Configuration
PI_API_KEY=your_pi_api_key_here
PI_APP_ID=your_pi_app_id_here
NEXT_PUBLIC_PI_APP_ID=your_pi_app_id_here
PI_ENVIRONMENT=sandbox  # or 'production' for mainnet
```

### Step 2: Domain Verification

1. Go to [Pi Developer Portal](https://develop.pi)
2. Navigate to your app settings
3. Add your domain to the whitelist:
   - For local dev: `http://localhost:3000`
   - For production: `https://yourdomain.com`
4. Save and wait for verification

### Step 3: Run the App

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000/dashboard` to see the dashboard with Pi integration.

## 📱 Usage Examples

### Using the PiAuth Component

```tsx
import { PiAuth } from "@/components/pi/PiAuth";

function MyPage() {
  return (
    <PiAuth
      sandbox={true}
      scopes={["username", "payments"]}
      onAuthenticated={(user) => {
        console.log("User authenticated:", user);
      }}
      onError={(error) => {
        console.error("Auth error:", error);
      }}
    />
  );
}
```

### Using the PiPayment Component

```tsx
import { PiPayment } from "@/components/pi/PiPayment";

function AgentDeployment() {
  return (
    <PiPayment
      amount={1.5}
      memo="Deploy AI Agent"
      metadata={{ agentId: "agent-123", type: "deployment" }}
      onSuccess={(paymentId, txid) => {
        console.log("Payment successful:", paymentId, txid);
      }}
      onError={(error) => {
        console.error("Payment failed:", error);
      }}
    />
  );
}
```

### Using the usePi Hook

```tsx
import { usePi } from "@/hooks/usePi";

function MyComponent() {
  const { 
    isReady, 
    isAuthenticated, 
    user, 
    authenticate, 
    createPayment 
  } = usePi({ sandbox: true });

  const handleAuth = async () => {
    try {
      await authenticate();
      console.log("Authenticated!");
    } catch (error) {
      console.error("Auth failed:", error);
    }
  };

  const handlePayment = async () => {
    try {
      const result = await createPayment({
        amount: 1.0,
        memo: "Test payment",
        metadata: { test: true },
      });
      console.log("Payment created:", result);
    } catch (error) {
      console.error("Payment failed:", error);
    }
  };

  return (
    <div>
      {!isAuthenticated ? (
        <button onClick={handleAuth} disabled={!isReady}>
          Connect Pi
        </button>
      ) : (
        <button onClick={handlePayment}>
          Pay 1.0 π
        </button>
      )}
    </div>
  );
}
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐    ┌──────────────┐                   │
│  │   PiAuth     │    │  PiPayment   │                   │
│  │  Component   │    │  Component   │                   │
│  └──────┬───────┘    └──────┬───────┘                   │
│         │                   │                            │
│         └───────┬───────────┘                            │
│                 │                                         │
│         ┌───────▼────────┐                               │
│         │   usePi Hook   │                               │
│         └───────┬────────┘                               │
│                 │                                         │
│         ┌───────▼────────┐                               │
│         │  Pi SDK (CDN)  │                               │
│         └───────┬────────┘                               │
│                 │                                         │
├─────────────────┼─────────────────────────────────────────┤
│                 │         Backend API                     │
│         ┌───────▼────────┐                               │
│         │ Payment Routes │                               │
│         │  - approve     │                               │
│         │  - complete    │                               │
│         └───────┬────────┘                               │
│                 │                                         │
│         ┌───────▼────────┐                               │
│         │ PiNetworkClient│                               │
│         └───────┬────────┘                               │
│                 │                                         │
└─────────────────┼─────────────────────────────────────────┘
                  │
          ┌───────▼────────┐
          │  Pi Network    │
          │   API (v2)     │
          └────────────────┘
```

## 🔐 Security Best Practices

1. **Never commit `.env.local`** - It contains sensitive API keys
2. **Use environment variables** - Never hardcode credentials
3. **Validate payments server-side** - Always verify payment amounts and status
4. **Implement rate limiting** - Protect your API endpoints
5. **Use HTTPS in production** - Required by Pi Network
6. **Verify KYC status** - Check user verification before critical operations

## 🎨 Features

### Dashboard (`/dashboard`)
- ✅ Real-time agent metrics
- ✅ Live activity feed (simulated)
- ✅ Performance analytics placeholder
- ✅ Pi Network authentication
- ✅ User account info
- ✅ System status monitoring
- ✅ Quick actions
- ✅ Mo Gawdat happiness scores

### Marketplace (`/marketplace`)
- ✅ Agent browsing
- ✅ Search and filters
- ✅ KYC verification badges
- ✅ Agent ratings
- ✅ Responsive grid layout

### Landing Page (`/`)
- ✅ Hero section
- ✅ Agent cards
- ✅ KYC setup
- ✅ Voice orb
- ✅ Setup wizard

## 📊 Next Steps

### Phase 2: Swarm Simulator (Priority)
- [ ] Design swarm architecture
- [ ] Implement `SwarmSimulator` class
- [ ] Add agent-to-agent communication
- [ ] Create performance monitoring
- [ ] Build visualization components
- [ ] Add export functionality

### Phase 3: API Gems (33 Utilities)
- [ ] LLM Tricks (10 gems)
- [ ] Performance (8 gems)
- [ ] Error Handling (5 gems)
- [ ] State Management (5 gems)
- [ ] Security (5 gems)

### Enhancements
- [ ] Add WebSocket for real-time updates
- [ ] Implement actual analytics charts
- [ ] Add payment history
- [ ] Create agent deployment flow
- [ ] Add transaction receipts
- [ ] Implement refund system
- [ ] Add payment webhooks

## 🐛 Troubleshooting

### Pi SDK Not Loading
- Check that the script tag is in `layout.tsx`
- Verify domain is whitelisted in Pi Developer Portal
- Check browser console for errors

### Authentication Fails
- Verify API key and App ID are correct
- Check environment (sandbox vs production)
- Ensure domain is verified
- Try clearing browser cache

### Payment Errors
- Verify user has sufficient Pi balance
- Check payment amount is valid (> 0)
- Ensure user is authenticated
- Check API endpoint responses

## 📚 Resources

- [Pi Network Developer Docs](https://developers.minepi.com/)
- [Pi SDK Reference](https://developers.minepi.com/doc/javascript-sdk)
- [Pi Developer Portal](https://develop.pi)
- [AIX Format Spec](../../docs/AIX_SPEC.md)

## 🤝 Contributing

When adding new Pi Network features:

1. Update type definitions in `globals.d.ts`
2. Add environment variables to `.env.example`
3. Document in this README
4. Add error handling
5. Test in sandbox mode first
6. Update API documentation

## 📝 License

Part of the AIX Format project. See main LICENSE file.

---

**Built with ❤️ for the Pi Network ecosystem**