# 📝 AIX v1.3 Manifest Examples

🇬🇧 Real-world manifest templates for various agent archetypes.
🇦🇪 نماذج بيانات حقيقية لأنواع مختلفة من الوكلاء.

---

### 1. Low-Risk Persona (The Helper)
Ideal for basic assistants and chat interfaces.
- **Path**: `tests/golden_manifests/low-risk.aix.json`
- **Key Features**: High Trust Score, no external SaaS dependencies, sandboxed by default.

### 2. High-Risk Infrastructure Agent (The Controller)
For agents managing servers, databases, or critical hardware.
- **Path**: `tests/golden_manifests/high-risk-infra.aix.json`
- **Key Features**: Mandatory `build_provenance`, critical tool access, highest KYC tier.

### 3. SaaS-Heavy Integration Agent (The Bridge)
For agents that sync data between OpenAI, Stripe, and other third-party services.
- **Path**: `tests/golden_manifests/saas-heavy.aix.json`
- **Key Features**: Comprehensive `saas_services` list (SaaS-BOM), compliance tier validation.

### 4. Sovereign Sovereign Agent (The Auditor)
The gold standard. Full protocol compliance with hardware-backed identity.
- **Path**: `tests/golden_manifests/sovereign-agent.aix.json`
- **Key Features**: SLSA L3 provenance, `sovereign` security level, identity tier 3.

---

## 🛠️ How to use these examples
1. Copy the JSON content.
2. Paste into the **AIX Studio Builder**.
3. Modify the `persona.instructions` to fit your needs.
4. Run the **Detective** scan to ensure your modifications didn't break security invariants.
