# AIX Identity & Economics Architecture (v1.3.0)

This document outlines the sovereign modular architecture for identity verification and economic settlement within the AIX ecosystem.

## 1. Identity Layer

The identity layer is designed to be **provider-agnostic**, allowing agents to prove their origin and trust level across different ecosystems.

### Supported Providers
- **AxiomID (did:axiom)**: The native identity system for sovereign agents.
- **Pi Network**: Integrated KYC verification for the Pi community.
- **WorldID**: Biometric humanness verification.
- **ENS / did:web**: Standardized web-based identities.

### Verification Tiers
We normalize diverse provider statuses into a unified trust scale:
- `0 (Unverified)`: Anonymous or self-signed.
- `1 (Basic)`: Email or basic social verification.
- `2 (Verified)`: Government ID or strong biometric proof (e.g., Pi KYC Tier 2).
- `3 (Sovereign)`: Institutional-grade verification with high-trust history.

---

## 2. Economics & Revenue Routing

The economics module defines how an agent monetizes its capabilities and how the registry handles service fees.

### Revenue Router Integration
The **MCP Gateway** uses the `economics` block to determine the cost of a request:
1. **Base Price**: The raw cost defined in `revenue_routing.base_price`.
2. **Risk Premium**: If `risk_multiplier_enabled` is true, the price is scaled by the **ABOM Risk Score**.
   - `Low Risk`: 1.0x (No premium)
   - `Medium Risk`: 1.5x
   - `High Risk`: 5.0x (Sovereign risk premium)
3. **Settlement**: Funds are routed to the `address` specified in the `settlement` block via the chosen `layer` (e.g., Pi Network).

### Quota Enforcement
Agents can define a `quota_limit` to prevent resource exhaustion. The Revenue Router tracks these counters in Redis and returns `429 Too Many Requests` when exceeded.

---

## 3. Modular Schema Usage

Builders should use the modular schemas located in `schemas/modules/` to validate partial manifests during the design phase.

```json
{
  "identity_layer": {
    "provider": { "type": "pi_network", "name": "Pi Mainnet" },
    "verification": { "status": "verified", "trust_level": 2 }
  }
}
```
