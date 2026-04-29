#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { verifyManifest } from '../core/src/security/signature.js';

function detectFormat(content, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.json') return 'json';
  if (ext === '.yaml' || ext === '.yml') return 'yaml';
  return content.trim().startsWith('{') ? 'json' : 'yaml';
}

const args = process.argv.slice(2);
const inputPath = args[0];
const keyArgIndex = args.findIndex((a) => a === '--public-key');
const publicKeyPath = keyArgIndex !== -1 ? args[keyArgIndex + 1] : null;

if (!inputPath || !publicKeyPath) {
  console.error('Usage: node scripts/agent-verify.js <manifest.aix> --public-key <ed25519-public.pem>');
  process.exit(1);
}

try {
  const resolvedInput = path.resolve(inputPath);
  const raw = fs.readFileSync(resolvedInput, 'utf8');
  const format = detectFormat(raw, resolvedInput);
  const manifest = format === 'json' ? JSON.parse(raw) : yaml.load(raw, { schema: yaml.JSON_SCHEMA });
  const publicKeyPem = fs.readFileSync(path.resolve(publicKeyPath), 'utf8');

  const result = verifyManifest(manifest, publicKeyPem);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
} catch (error) {
  console.error(`❌ verification failed: ${error.message}`);
  process.exit(1);
}
