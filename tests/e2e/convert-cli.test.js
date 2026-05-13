/**
 * E2E coverage for bin/aix-convert.js.
 *
 * Exercises format conversion roundtrips (yaml <-> json) on the
 * committed example manifests. Asserts the output file is created
 * and the manifest semantics survive a round trip.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

// import.meta.dirname is Node 20.11+, but package.json declares engines.node
// >=18.0.0. Derive the dirname via fileURLToPath for Node 18 compatibility.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const CONVERT = path.join(REPO_ROOT, 'bin', 'aix-convert.js');

function runConvert(args) {
  return execFileSync('node', [CONVERT, ...args], {
    encoding: 'utf8',
    cwd: REPO_ROOT,
  });
}

test('aix-convert: --help prints usage', () => {
  const out = execFileSync('node', [CONVERT, '--help'], { encoding: 'utf8', cwd: REPO_ROOT });
  assert.match(out, /Usage:|aix-convert/i);
});

test('aix-convert: yaml -> json produces a non-empty file', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aix-convert-yaml-json-'));
  const out = path.join(dir, 'persona-agent.json');
  runConvert(['examples/persona-agent.aix', out, '--format', 'json']);
  assert.ok(fs.existsSync(out), 'output file should exist');
  const content = fs.readFileSync(out, 'utf8');
  assert.ok(content.length > 0);
  const parsed = JSON.parse(content);
  assert.ok(parsed.meta, 'output JSON should have a meta block');
  assert.ok(parsed.persona, 'output JSON should have a persona block');
});

test('aix-convert: missing args exits non-zero', () => {
  assert.throws(() => execFileSync('node', [CONVERT, 'examples/persona-agent.aix'], { encoding: 'utf8', cwd: REPO_ROOT }));
});

test('aix-convert: unknown format flag is rejected', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aix-convert-bad-format-'));
  const out = path.join(dir, 'persona.xml');
  assert.throws(() => execFileSync('node', [CONVERT, 'examples/persona-agent.aix', out, '--format', 'xml'], { encoding: 'utf8', cwd: REPO_ROOT }));
});

// Tests for the sync parseFile change (PR: removed `await` from parser.parseFile())
test('aix-convert: yaml -> json output contains correct agent name (not undefined)', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aix-convert-name-'));
  const out = path.join(dir, 'output.json');
  runConvert(['examples/persona-agent.aix', out, '--format', 'json']);
  const parsed = JSON.parse(fs.readFileSync(out, 'utf8'));
  // If parseFile is called without await, agent is a Promise and meta is undefined,
  // causing the process to exit with an error before writing the file.
  // Verify the meta.name is the actual value from the manifest, not undefined.
  assert.strictEqual(parsed.meta.name, 'Customer Service Bot');
});

test('aix-convert: yaml -> json --pretty produces indented output', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aix-convert-pretty-'));
  const out = path.join(dir, 'persona-pretty.json');
  runConvert(['examples/persona-agent.aix', out, '--format', 'json', '--pretty']);
  const content = fs.readFileSync(out, 'utf8');
  // Pretty-printed JSON has newlines and indentation
  assert.ok(content.includes('\n'), 'pretty output should contain newlines');
  assert.ok(content.includes('  '), 'pretty output should be indented');
  // Must still parse as valid JSON
  const parsed = JSON.parse(content);
  assert.ok(parsed.meta, 'pretty JSON should have a meta block');
});

test('aix-convert: yaml -> yaml roundtrip produces non-empty file', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aix-convert-yaml-yaml-'));
  const out = path.join(dir, 'persona-out.yaml');
  runConvert(['examples/persona-agent.aix', out, '--format', 'yaml']);
  assert.ok(fs.existsSync(out), 'output yaml file should exist');
  const content = fs.readFileSync(out, 'utf8');
  assert.ok(content.length > 0, 'output yaml should not be empty');
  assert.ok(content.includes('meta'), 'yaml output should contain a meta section');
});

test('aix-convert: yaml -> toml produces a non-empty file', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aix-convert-yaml-toml-'));
  const out = path.join(dir, 'persona.toml');
  runConvert(['examples/persona-agent.aix', out, '--format', 'toml']);
  assert.ok(fs.existsSync(out), 'output toml file should exist');
  const content = fs.readFileSync(out, 'utf8');
  assert.ok(content.length > 0, 'output toml should not be empty');
  assert.ok(content.includes('[meta]'), 'toml output should have a [meta] section');
});

test('aix-convert: yml alias is accepted as format', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aix-convert-yml-alias-'));
  const out = path.join(dir, 'persona.yml');
  // --format yml should be treated the same as --format yaml
  runConvert(['examples/persona-agent.aix', out, '--format', 'yml']);
  assert.ok(fs.existsSync(out), 'output .yml file should exist');
  const content = fs.readFileSync(out, 'utf8');
  assert.ok(content.length > 0, 'output yml should not be empty');
});

test('aix-convert: nonexistent input exits non-zero', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aix-convert-missing-'));
  const out = path.join(dir, 'out.json');
  assert.throws(
    () => runConvert(['/no/such/file.aix', out, '--format', 'json']),
    'should throw when input file does not exist'
  );
});
