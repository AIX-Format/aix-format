/**
 * AIX API Key Tester
 * Run: node apps/studio/scripts/test-apis.mjs
 *
 * Tests: Groq (Whisper STT) + xAI Grok (chat)
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath   = resolve(__dirname, "../.env.local");

// ── Load .env.local manually ───────────────────────────────────────────────
if (!existsSync(envPath)) {
  console.error("❌  .env.local not found at:", envPath);
  console.error("    Create it first:\n");
  console.error("    GROQ_API_KEY=gsk_...");
  console.error("    XAI_API_KEY=xai-...\n");
  process.exit(1);
}

const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter(l => l && !l.startsWith("#") && l.includes("="))
    .map(l => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const GROQ_KEY = env.GROQ_API_KEY;
const XAI_KEY  = env.XAI_API_KEY;

const ok  = (label) => console.log(`  ✅  ${label}`);
const fail = (label, msg) => console.log(`  ❌  ${label}: ${msg}`);
const sep  = () => console.log("─".repeat(50));

// ── Test 1: Groq ───────────────────────────────────────────────────────────
async function testGroq() {
  console.log("\n🎙️  Testing Groq (chat completions — whisper model check)");
  sep();

  if (!GROQ_KEY) { fail("GROQ_API_KEY", "not set in .env.local"); return; }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_KEY}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        model:      "llama-3.3-70b-versatile",
        messages:   [{ role: "user", content: "Reply with exactly: GROQ_OK" }],
        max_tokens: 10,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      fail("Groq chat", `HTTP ${res.status} — ${err.error?.message ?? JSON.stringify(err)}`);
      return;
    }

    const data  = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim();
    ok(`Groq chat → "${reply}" (model: ${data.model})`);
    ok(`Groq latency: ${data.usage?.total_tokens} tokens`);
  } catch (e) {
    fail("Groq", e.message);
  }
}

// ── Test 2: xAI Grok ──────────────────────────────────────────────────────
async function testGrok() {
  console.log("\n🤖  Testing xAI Grok (chat completions)");
  sep();

  if (!XAI_KEY) { fail("XAI_API_KEY", "not set in .env.local"); return; }

  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${XAI_KEY}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        model:      "grok-3-mini",
        messages:   [{ role: "user", content: "Reply with exactly: GROK_OK" }],
        max_tokens: 10,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      fail("Grok chat", `HTTP ${res.status} — ${err.error?.message ?? JSON.stringify(err)}`);
      return;
    }

    const data  = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim();
    ok(`Grok chat → "${reply}" (model: ${data.model})`);
    ok(`Grok usage: ${JSON.stringify(data.usage)}`);
  } catch (e) {
    fail("Grok", e.message);
  }
}

// ── Run ────────────────────────────────────────────────────────────────────
console.log("\n🔑  AIX API Key Tester");
sep();
console.log(`  GROQ_API_KEY : ${GROQ_KEY  ? GROQ_KEY.slice(0,8)  + "..." : "❌ missing"}`);
console.log(`  XAI_API_KEY  : ${XAI_KEY   ? XAI_KEY.slice(0,8)   + "..." : "❌ missing"}`);

await testGroq();
await testGrok();

console.log("\n" + "═".repeat(50));
console.log("  Done.\n");
