import { test } from 'node:test';
import assert from 'node:assert';
import { scanAgent } from '../abom-scanner.js';

test('scanAgent() → Perfect score for fully compliant agent', () => {
  const agent = {
    meta: { version: '1.3.0', type: 'persona' },
    abom: {
      integrity_hash: 'sha256-xyz',
      model: { provider: 'openai' },
      dataset: { sources: ['verified-dataset'] },
      governance: { human_oversight: true },
      risk_level: 'low'
    },
    identity_layer: { id: 'did:axiom:123', kyc_tier: 'verified' },
    security: { sandboxed: true }
  };
  
  const report = scanAgent(agent);
  assert.ok(report.score >= 90);
  assert.strictEqual(report.grade, 'A');
});

test('scanAgent() → Fails Rule 11 (High-risk missing provenance)', () => {
  const agent = {
    abom: {
      risk_level: 'high', // High risk!
      integrity_hash: 'xyz'
      // missing build_provenance
    },
    security: { sandboxed: false }
  };
  
  const report = scanAgent(agent);
  const risk = report.risks.find(r => r.message.includes('missing build provenance'));
  assert.ok(risk, 'Should detect missing build provenance for high-risk agent');
  assert.strictEqual(risk.severity, 'critical');
});

test('scanAgent() → Passes Rule 11 (High-risk with provenance)', () => {
  const agent = {
    abom: {
      risk_level: 'high',
      integrity_hash: 'xyz',
      build_provenance: {
        builder_id: 'aix-studio',
        build_type: 'automated',
        verified: true
      }
    }
  };
  
  const report = scanAgent(agent);
  const risk = report.risks.find(r => r.message.includes('missing build provenance'));
  assert.strictEqual(risk, undefined, 'Should not have provenance risk');
});

test('scanAgent() → Fails Rule 12 (SaaS-heavy missing services)', () => {
  const agent = {
    meta: { type: 'saas' },
    abom: {
      saas_services: [] // Empty!
    }
  };
  
  const report = scanAgent(agent);
  const risk = report.risks.find(r => r.message.includes('missing service declarations'));
  assert.ok(risk, 'Should detect missing SaaS services for SaaS-heavy agent');
});

test('scanAgent() → Detects dangerous capabilities and triggers high-risk rules', () => {
  const agent = {
    abom: {
      capabilities: ['shell_exec'], // Dangerous!
      integrity_hash: 'xyz'
      // missing build_provenance and governance policy
    }
  };
  
  const report = scanAgent(agent);
  assert.ok(report.risks.some(r => r.message.includes('Dangerous capabilities')), 'Should detect dangerous capabilities');
  assert.ok(report.risks.some(r => r.message.includes('missing build provenance')), 'Should trigger Rule 11 due to dangerous capabilities');
});
