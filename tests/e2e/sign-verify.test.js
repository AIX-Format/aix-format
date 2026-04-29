import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { execFileSync } from 'child_process';

function makeManifest() {
  return {
    meta: { version: '1.0.0', id: 'did:axiom:axiomid.app:550e8400-e29b-41d4-a716-446655440000', name: 'E2E', created: '2026-01-12T10:30:00Z', author: 'QA' },
    persona: { role: 'assistant', instructions: 'help' },
    identity_layer: { id: 'did:axiom:axiomid.app:550e8400-e29b-41d4-a716-446655440000', authority: 'axiomid.app', issuedAt: '2026-01-12T10:30:00Z' },
    security: {}
  };
}

test('SIGN -> OK, TAMPER -> FAIL, WRONG_KEY -> FAIL', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aix-sign-'));
  const manifestPath = path.join(dir, 'agent.aix.json');
  const keyA = crypto.generateKeyPairSync('ed25519');
  const keyB = crypto.generateKeyPairSync('ed25519');

  const privA = path.join(dir, 'a_priv.pem');
  const pubA = path.join(dir, 'a_pub.pem');
  const pubB = path.join(dir, 'b_pub.pem');
  fs.writeFileSync(privA, keyA.privateKey.export({ type: 'pkcs8', format: 'pem' }));
  fs.writeFileSync(pubA, keyA.publicKey.export({ type: 'spki', format: 'pem' }));
  fs.writeFileSync(pubB, keyB.publicKey.export({ type: 'spki', format: 'pem' }));
  fs.writeFileSync(manifestPath, JSON.stringify(makeManifest(), null, 2));

  const signOut = execFileSync('node', ['scripts/agent-sign.js', manifestPath, '--private-key', privA, '--kid', 'key-a'], { encoding: 'utf8' });
  assert.match(signOut, /checksum=/);
  assert.match(signOut, /signature_b64=/);

  const verifyOk = execFileSync('node', ['scripts/agent-verify.js', manifestPath, '--public-key', pubA], { encoding: 'utf8' });
  const okJson = JSON.parse(verifyOk);
  assert.equal(okJson.ok, true);
  assert.equal(okJson.signatureValid, true);
  assert.equal(okJson.checksumValid, true);

  const tampered = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  tampered.persona.instructions = 'tampered';
  fs.writeFileSync(manifestPath, JSON.stringify(tampered, null, 2));

  assert.throws(() => execFileSync('node', ['scripts/agent-verify.js', manifestPath, '--public-key', pubA], { encoding: 'utf8' }));
  assert.throws(() => execFileSync('node', ['scripts/agent-verify.js', manifestPath, '--public-key', pubB], { encoding: 'utf8' }));
});
