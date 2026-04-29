#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { signManifest } from '../core/src/security/signature.js';

function detectFormat(content, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.json') return 'json';
  if (ext === '.yaml' || ext === '.yml') return 'yaml';
  return content.trim().startsWith('{') ? 'json' : 'yaml';
}

function parseAix(content, format) {
  return format === 'json' ? JSON.parse(content) : yaml.load(content, { schema: yaml.JSON_SCHEMA });
}

const args = process.argv.slice(2);
const inputPath = args[0];
const keyArgIndex = args.findIndex((a) => a === '--private-key');
const kidArgIndex = args.findIndex((a) => a === '--kid');
const privateKeyPath = keyArgIndex !== -1 ? args[keyArgIndex + 1] : null;
const kid = kidArgIndex !== -1 ? args[kidArgIndex + 1] : 'local-ed25519';

if (!inputPath || !privateKeyPath) {
  console.error('Usage: node scripts/agent-sign.js <manifest.aix> --private-key <ed25519-private.pem> [--kid <key-id>]');
  process.exit(1);
}

try {
  const resolvedInput = path.resolve(inputPath);
  const raw = fs.readFileSync(resolvedInput, 'utf8');
  const format = detectFormat(raw, resolvedInput);
  const manifest = parseAix(raw, format);
  manifest.security = manifest.security && typeof manifest.security === 'object' ? manifest.security : {};

  const privateKeyPem = fs.readFileSync(path.resolve(privateKeyPath), 'utf8');
  const result = signManifest(manifest, privateKeyPem, kid);

  manifest.security.checksum = { algorithm: 'sha256', value: result.checksum };
  manifest.security.signature = result.signature;

  const output = format === 'json'
    ? `${JSON.stringify(manifest, null, 2)}\n`
    : yaml.dump(manifest, { sortKeys: true, noRefs: true, lineWidth: 120 });

  fs.writeFileSync(resolvedInput, output, 'utf8');
  console.log(`✅ signed: ${resolvedInput}`);
  console.log(`checksum=${result.checksum}`);
  console.log(`signature_b64=${result.signature.value}`);
  console.log(`canonical_bytes=${Buffer.byteLength(result.canonicalString, 'utf8')}`);
} catch (error) {
  console.error(`❌ signing failed: ${error.message}`);
  process.exit(1);
}
