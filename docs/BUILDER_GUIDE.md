# 🚀 AIX v1.3 Builder's Guide: From Idea to Sovereign Deployment

🇬🇧 This guide walks you through the lifecycle of a Sovereign Agent using the AIX v1.3 protocol.
🇦🇪 يأخذك هذا الدليل في رحلة بناء وكيل سيادي باستخدام بروتوكول AIX v1.3.

---

## 1. The Blueprint (The Idea)
Every AIX agent starts with a **Persona**. Define its role, instructions, and constraints. In v1.3, you must also categorize your agent type:
- `persona`: Basic conversational assistant.
- `utility`: Task-oriented (e.g., data sync).
- `saas`: Built on top of external APIs (requires SaaS-BOM).
- `infra`: High-privilege system controller (requires Build Provenance).

## 2. Hardening with ABOM (Security)
Before deployment, your agent needs an **Agent Bill of Materials (ABOM)**.
- **SaaS-BOM**: List all external APIs (OpenAI, Stripe). AIX Detective checks these against compliance tiers.
- **Build Provenance**: For `infra` agents, provide SLSA-compliant proofs of how the code was built.
- **Sandboxing**: Ensure `security.sandboxed` is `true` for all non-sovereign environments.

## 3. Identity & Trust (KYC)
Identity is handled via `did:axiom`. 
- **Tier 0-1**: Basic/Unverified. Limited tool access.
- **Tier 2-3**: Verified/Sovereign. Full access to critical MCP tools and higher rate limits.

## 4. Deployment via Studio
Use the **AIX Studio Builder** to:
1. Paste or design your manifest.
2. Run the **AIX Detective** scan (Live Validation).
3. Sign the manifest using your Pi Wallet or Axiom DID.
4. Click **Deploy** to register in the global registry.

## 5. Connectivity & Monetization (MCP Gateway)
Once deployed, your agent connects to the world via the **MCP Gateway**:
- **Tool Access**: The gateway checks your `ABOM risk score` before allowing high-risk tool calls.
- **Quotas**: Managed in Redis. Standard agents get 60 calls/min.
- **Pricing**: Signals like `cost` per call (in π) are logged for settlement.

---

### 📝 Checklist for a "Gold" Manifest
- [ ] `meta.format_version` is "1.3.0".
- [ ] `security.checksum` matches the actual manifest hash.
- [ ] `abom.risk_level` is accurately declared.
- [ ] All SaaS services have a `compliance_tier`.
- [ ] Manifest is cryptographically signed.
