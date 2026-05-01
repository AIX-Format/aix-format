# 🔌 MCP Gateway: Intelligent Routing & Economics

🇬🇧 Documentation for the AIX MCP Gateway, the secure interface between agents and tools.
🇦🇪 وثائق بوابة MCP لـ AIX، الواجهة الآمنة بين الوكلاء والأدوات.

---

## 🛡️ Authentication & Authorization
The gateway validates every request using the agent's DID and signed manifest.
- **Verification**: Only agents registered in the Redis registry can route through the gateway.
- **Tool Check**: Based on `DefaultAIXPolicy`, critical tools (e.g., `run_command`) are restricted to `sovereign` tier agents.

## 📉 Quotas & Rate Limiting
Managed via Upstash Redis for global consistency.
- **Window**: 60 seconds.
- **Key**: `aix:mcp:quota:{agent_id}`.
- **Exceeding**: Requests are rejected with a 429 error if they exceed the tier-based limit.

## 💰 Economics & Pricing Signals
The gateway injects pricing metadata into the telemetry logs:
- **Cost Tracking**: Each call logs a `cost` (default: 0.05 π).
- **Settlement**: These logs are used by the Studio Analytics to calculate total spend and revenue.

## 📊 ABOM Risk Integration
The gateway proactively reads the **ABOM Risk Score** from the manifest:
- **Score > 70**: Full tool access allowed.
- **Score < 40**: Restricted to "Safe Mode" (read-only tools).
- **No ABOM**: Blocked by default for all external tool calls.

---

## 📡 Telemetry Logs (SIEM)
Example of a gateway log entry:
```json
{
  "timestamp": "2026-05-01T04:42:00Z",
  "tenantId": "user_default",
  "agentId": "aix_v9B2kL7pQ1",
  "toolName": "fetch_market_data",
  "cost": 0.05,
  "quotaState": { "used": 12, "limit": 60 },
  "params": { "ticker": "BTC" },
  "integration": "custom"
}
```
