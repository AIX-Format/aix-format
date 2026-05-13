/**
 * Tests for documentation files added/modified in the Echo369 ecosystem PR.
 *
 * Covers: AGENTS.md               — repo operating manual for AI coding agents
 *         AIX_STACK_VERSIONING.md — independent SemVer + Echo369 codename doctrine
 *         AXIOM.md                — §4.5 Extended Ecosystem / satellite-layer additions
 *
 * Strategy: parse markdown as plain text and assert that:
 *  - required sections / headings are present
 *  - canonical constants (protocol version, codename, spec ID) are stated correctly
 *  - cross-references between documents are consistent
 *  - satellite layer definitions are complete and correct
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO = path.resolve(__dirname, '..');

function readDoc(relPath) {
  return fs.readFileSync(path.join(REPO, relPath), 'utf8');
}

// ---------------------------------------------------------------------------
// AGENTS.md

describe('AGENTS.md', () => {
  let doc;

  it('file exists and is non-empty', () => {
    const p = path.join(REPO, 'AGENTS.md');
    assert.ok(fs.existsSync(p), 'AGENTS.md must exist at repo root');
    doc = fs.readFileSync(p, 'utf8');
    assert.ok(doc.length > 0, 'AGENTS.md must not be empty');
  });

  it('identifies aix-format as the L1 protocol layer', () => {
    doc = readDoc('AGENTS.md');
    assert.ok(
      doc.includes('L1') && doc.includes('aix-format'),
      'AGENTS.md must identify aix-format as L1',
    );
  });

  it('states the current stack codename is Echo369', () => {
    doc = readDoc('AGENTS.md');
    assert.ok(doc.includes('Echo369'), 'AGENTS.md must state the Echo369 codename');
  });

  it('states the spec ID as AIX/1.0', () => {
    doc = readDoc('AGENTS.md');
    assert.ok(doc.includes('AIX/1.0'), 'AGENTS.md must reference the AIX/1.0 spec ID');
  });

  it('states the protocol version constant AIX_PROTOCOL_VERSION as "0.369.0"', () => {
    doc = readDoc('AGENTS.md');
    assert.ok(
      doc.includes('AIX_PROTOCOL_VERSION') && doc.includes('"0.369.0"'),
      'AGENTS.md must document AIX_PROTOCOL_VERSION = "0.369.0"',
    );
  });

  it('references AXIOM.md', () => {
    doc = readDoc('AGENTS.md');
    assert.ok(doc.includes('AXIOM.md'), 'AGENTS.md must reference AXIOM.md');
  });

  it('references AIX_STACK_VERSIONING.md', () => {
    doc = readDoc('AGENTS.md');
    assert.ok(
      doc.includes('AIX_STACK_VERSIONING.md'),
      'AGENTS.md must reference AIX_STACK_VERSIONING.md',
    );
  });

  it('contains a "Repository structure" section', () => {
    doc = readDoc('AGENTS.md');
    assert.ok(
      doc.includes('Repository structure') || doc.includes('## Repository structure'),
      'AGENTS.md must contain a Repository structure section',
    );
  });

  it('lists assets/ directory in the repo structure', () => {
    doc = readDoc('AGENTS.md');
    assert.ok(
      doc.includes('assets/'),
      'AGENTS.md repo structure must include assets/ directory',
    );
  });

  it('lists tests/ directory in the repo structure', () => {
    doc = readDoc('AGENTS.md');
    assert.ok(
      doc.includes('tests/'),
      'AGENTS.md repo structure must include tests/ directory',
    );
  });

  it('contains a "Sovereign / protected paths" section', () => {
    doc = readDoc('AGENTS.md');
    assert.ok(
      doc.includes('Sovereign') && doc.includes('protected'),
      'AGENTS.md must have a Sovereign / protected paths section',
    );
  });

  it('marks AXIOM.md as a sovereign protected file', () => {
    doc = readDoc('AGENTS.md');
    // The section must list AXIOM.md under protected paths
    const sovereignIdx = doc.indexOf('Sovereign');
    const axiomRefIdx = doc.indexOf('AXIOM.md', sovereignIdx);
    assert.ok(
      axiomRefIdx !== -1,
      'Sovereign/protected section must reference AXIOM.md',
    );
  });

  it('contains a "Commands" section with a pnpm test command', () => {
    doc = readDoc('AGENTS.md');
    assert.ok(doc.includes('## Commands'), 'AGENTS.md must have a Commands section');
    assert.ok(
      doc.includes('pnpm') && doc.includes('test'),
      'Commands section must include a pnpm test command',
    );
  });

  it('contains a "Testing rules" section', () => {
    doc = readDoc('AGENTS.md');
    assert.ok(
      doc.includes('Testing rules') || doc.includes('## Testing'),
      'AGENTS.md must contain a Testing rules section',
    );
  });

  it('mentions no-mock policy for sovereign components', () => {
    doc = readDoc('AGENTS.md');
    assert.ok(
      doc.includes('No mocks') || doc.includes('no mocks') || doc.includes('sovereign components'),
      'AGENTS.md must document the no-mock policy for sovereign components',
    );
  });

  it('lists satellite repos (AlphaAxiom, PiWorker-OS, GemClaw)', () => {
    doc = readDoc('AGENTS.md');
    assert.ok(doc.includes('AlphaAxiom'), 'AGENTS.md must mention AlphaAxiom satellite');
    assert.ok(doc.includes('PiWorker-OS'), 'AGENTS.md must mention PiWorker-OS satellite');
    assert.ok(doc.includes('GemClaw'), 'AGENTS.md must mention GemClaw satellite');
  });

  it('states Apache-2.0 license requirement', () => {
    doc = readDoc('AGENTS.md');
    assert.ok(
      doc.includes('Apache-2.0'),
      'AGENTS.md must state the Apache-2.0 license requirement',
    );
  });

  it('specifies kebab-case for branch names', () => {
    doc = readDoc('AGENTS.md');
    assert.ok(
      doc.includes('kebab-case'),
      'AGENTS.md must specify kebab-case for branch names',
    );
  });

  it('mentions Conventional Commits requirement', () => {
    doc = readDoc('AGENTS.md');
    assert.ok(
      doc.includes('Conventional Commits'),
      'AGENTS.md must require Conventional Commits',
    );
  });

  it('contains a "Cross-stack awareness" section', () => {
    doc = readDoc('AGENTS.md');
    assert.ok(
      doc.includes('Cross-stack'),
      'AGENTS.md must contain a Cross-stack awareness section',
    );
  });

  it('states that L2 iqra consumes from L1', () => {
    doc = readDoc('AGENTS.md');
    assert.ok(
      doc.includes('iqra') && doc.includes('consumes'),
      'AGENTS.md must state that L2 iqra consumes from L1',
    );
  });

  // Boundary / regression: file must NOT claim the old 9-agent count
  it('does not claim a 9-agent contributor count (reduced to 5 in this PR)', () => {
    doc = readDoc('AGENTS.md');
    // The PR reduced agent count from 9 to 5; AGENTS.md should not say "9 AI"
    assert.ok(
      !doc.includes('9 AI') && !doc.includes('9 of the 12'),
      'AGENTS.md must not carry the stale 9-agent contributor count',
    );
  });
});

// ---------------------------------------------------------------------------
// AIX_STACK_VERSIONING.md

describe('AIX_STACK_VERSIONING.md', () => {
  let doc;

  it('file exists and is non-empty', () => {
    const p = path.join(REPO, 'AIX_STACK_VERSIONING.md');
    assert.ok(fs.existsSync(p), 'AIX_STACK_VERSIONING.md must exist at repo root');
    doc = fs.readFileSync(p, 'utf8');
    assert.ok(doc.length > 0, 'AIX_STACK_VERSIONING.md must not be empty');
  });

  it('opens with a reference to AXIOM.md', () => {
    doc = readDoc('AIX_STACK_VERSIONING.md');
    // File must direct readers to AXIOM.md first
    assert.ok(
      doc.includes('AXIOM.md'),
      'AIX_STACK_VERSIONING.md must reference AXIOM.md',
    );
  });

  it('states the one-sentence doctrine in section 1', () => {
    doc = readDoc('AIX_STACK_VERSIONING.md');
    assert.ok(
      doc.includes('## 1.') || doc.includes('## 1 '),
      'AIX_STACK_VERSIONING.md must have a section 1',
    );
    assert.ok(
      doc.includes('independently') && doc.includes('SemVer'),
      'section 1 must state that repos version independently using SemVer',
    );
  });

  it('states the current codename is Echo369', () => {
    doc = readDoc('AIX_STACK_VERSIONING.md');
    assert.ok(doc.includes('Echo369'), 'must state Echo369 as the current codename');
  });

  it('states the current spec ID as AIX/1.0', () => {
    doc = readDoc('AIX_STACK_VERSIONING.md');
    assert.ok(doc.includes('AIX/1.0'), 'must state AIX/1.0 as the current spec');
  });

  it('defines three version surfaces in section 3', () => {
    doc = readDoc('AIX_STACK_VERSIONING.md');
    assert.ok(
      doc.includes('## 3.') || doc.includes('three version surfaces') || doc.includes('## 3 '),
      'must have section 3 covering the three version surfaces',
    );
    // All three must be described
    assert.ok(
      doc.includes('3.1') || doc.includes('App version'),
      'must describe the app version surface (3.1)',
    );
    assert.ok(
      doc.includes('3.2') || doc.includes('stackVersion'),
      'must describe the AIX Stack compatibility surface (3.2)',
    );
    assert.ok(
      doc.includes('3.3') || doc.includes('README badges'),
      'must describe the README badges surface (3.3)',
    );
  });

  it('provides a package.json example with the aix metadata block', () => {
    doc = readDoc('AIX_STACK_VERSIONING.md');
    assert.ok(
      doc.includes('"stackVersion"') && doc.includes('"stackCodename"'),
      'must include a package.json example with stackVersion and stackCodename fields',
    );
    assert.ok(
      doc.includes('"spec"') && doc.includes('"layer"') && doc.includes('"authority"'),
      'aix metadata block must include spec, layer, and authority fields',
    );
  });

  it('contains the codename roadmap table in section 4', () => {
    doc = readDoc('AIX_STACK_VERSIONING.md');
    assert.ok(
      doc.includes('## 4.') || doc.includes('codename roadmap'),
      'must have section 4 with the codename roadmap',
    );
    assert.ok(doc.includes('Echo369'), 'roadmap must list Echo369 as Current window');
    assert.ok(doc.includes('Resonance'), 'roadmap must list Resonance as the Next window');
    assert.ok(doc.includes('Sovereignty'), 'roadmap must list Sovereignty as the Then window');
  });

  it('correctly maps Echo369 to AIX/1.0 in the codename roadmap table', () => {
    doc = readDoc('AIX_STACK_VERSIONING.md');
    // The codename table row should read: | Current | **Echo369** | `AIX/1.0` | ...
    // Find the "Current" row in the table and assert it contains both Echo369 and AIX/1.0.
    const currentRowMatch = doc.match(/\|\s*Current\s*\|[^|\n]*Echo369[^|\n]*\|\s*`?AIX\/1\.0`?/);
    assert.ok(
      currentRowMatch !== null,
      'The codename roadmap table must map Echo369 (Current window) to spec AIX/1.0 in the same row',
    );
  });

  it('describes the 369 motif in section 6', () => {
    doc = readDoc('AIX_STACK_VERSIONING.md');
    assert.ok(
      doc.includes('## 6.') || doc.includes('369 motif'),
      'must have section 6 describing the 369 motif',
    );
    assert.ok(
      doc.includes('AIX_PROTOCOL_VERSION'),
      'section 6 must reference AIX_PROTOCOL_VERSION',
    );
    assert.ok(
      doc.includes('0.369.0'),
      'section 6 must state the protocol version 0.369.0',
    );
  });

  it('states the 369 motif is NOT encoded in satellite app versions', () => {
    doc = readDoc('AIX_STACK_VERSIONING.md');
    assert.ok(
      doc.includes('not') && doc.includes("package.json#version"),
      'must clarify the 369 motif does not bleed into consumer-facing package.json#version',
    );
  });

  it('lists all seven ecosystem repositories in the maturity table', () => {
    doc = readDoc('AIX_STACK_VERSIONING.md');
    const expected = [
      'aix-format',
      'iqra',
      'aix-agent-skills',
      'AlphaAxiom',
      'PiWorker-OS',
      'GemClaw',
      'axiomid-project',
    ];
    for (const repo of expected) {
      assert.ok(doc.includes(repo), `maturity table must include repo: ${repo}`);
    }
  });

  it('contains a migration guide for satellite repos in section 7', () => {
    doc = readDoc('AIX_STACK_VERSIONING.md');
    assert.ok(
      doc.includes('## 7.') || doc.includes('Migration guide'),
      'must have section 7 with migration instructions for satellite repos',
    );
    // The six migration steps should be mentioned
    assert.ok(
      doc.includes('aix metadata block') ||
        (doc.includes('stackVersion') && doc.includes('stackCodename')),
      'migration guide must mention the aix metadata block fields',
    );
  });

  it('lists the required README badges for satellite repos', () => {
    doc = readDoc('AIX_STACK_VERSIONING.md');
    // The badges described use img.shields.io
    assert.ok(
      doc.includes('img.shields.io'),
      'migration guide must reference img.shields.io badge format',
    );
  });

  it('ends with the closing rule (section 8) referencing strict SemVer 2.0.0', () => {
    doc = readDoc('AIX_STACK_VERSIONING.md');
    assert.ok(
      doc.includes('## 8.') || doc.includes('closing rule'),
      'must have section 8 with the closing rule',
    );
    assert.ok(
      doc.includes('SemVer 2.0.0'),
      'closing rule must reference strict SemVer 2.0.0',
    );
  });

  // Boundary: must not claim fixed lockstep versioning
  it('explicitly forbids bumping satellite SemVer in lockstep with aix-format', () => {
    doc = readDoc('AIX_STACK_VERSIONING.md');
    assert.ok(
      doc.includes('MUST NOT') || doc.includes('must not'),
      'must explicitly forbid lockstep SemVer bumping in satellite repos',
    );
  });
});

// ---------------------------------------------------------------------------
// AXIOM.md §4.5 Extended Ecosystem additions

describe('AXIOM.md §4.5 Extended Ecosystem', () => {
  let doc;

  it('AXIOM.md exists at repo root', () => {
    const p = path.join(REPO, 'AXIOM.md');
    assert.ok(fs.existsSync(p), 'AXIOM.md must exist at repo root');
    doc = fs.readFileSync(p, 'utf8');
    assert.ok(doc.length > 0, 'AXIOM.md must not be empty');
  });

  it('contains the new §4.5 Extended Ecosystem section', () => {
    doc = readDoc('AXIOM.md');
    assert.ok(
      doc.includes('4.5') && (doc.includes('Extended Ecosystem') || doc.includes('Satellite Layers')),
      'AXIOM.md must contain the §4.5 Extended Ecosystem section',
    );
  });

  it('defines L0 as the axiomid-project root authority', () => {
    doc = readDoc('AXIOM.md');
    assert.ok(
      doc.includes('axiomid-project') && doc.includes('L0'),
      'AXIOM.md must define axiomid-project as L0 root authority',
    );
  });

  it('defines L4 AlphaAxiom as a satellite trading layer', () => {
    doc = readDoc('AXIOM.md');
    assert.ok(
      doc.includes('AlphaAxiom') && doc.includes('L4'),
      'AXIOM.md must define AlphaAxiom as L4 satellite',
    );
  });

  it('defines L5 PiWorker-OS as a satellite Pi layer', () => {
    doc = readDoc('AXIOM.md');
    assert.ok(
      doc.includes('PiWorker-OS') || doc.includes('PiWorker'),
      'AXIOM.md must define PiWorker-OS as L5 satellite',
    );
  });

  it('defines L6 GemClaw as a satellite voice layer', () => {
    doc = readDoc('AXIOM.md');
    assert.ok(
      doc.includes('GemClaw') && doc.includes('L6'),
      'AXIOM.md must define GemClaw as L6 satellite',
    );
  });

  it('states the four invariants for satellite topology', () => {
    doc = readDoc('AXIOM.md');
    assert.ok(
      doc.includes('Invariants') || doc.includes('invariants') || doc.includes('4.5.1'),
      'AXIOM.md §4.5 must state the invariants for satellite topology',
    );
    // Invariant 1: dependency direction
    assert.ok(
      doc.includes('Dependency direction') || doc.includes('dependency direction'),
      'invariant 1 (dependency direction) must be stated',
    );
    // Invariant 2: money flows upward
    assert.ok(
      doc.includes('Money flows') || doc.includes('money flows'),
      'invariant 2 (money flows upward) must be stated',
    );
    // Invariant 3: identity flows downward
    assert.ok(
      doc.includes('Identity flows') || doc.includes('identity flows'),
      'invariant 3 (identity flows downward) must be stated',
    );
    // Invariant 4: trust flows centrally
    assert.ok(
      doc.includes('Trust flows') || doc.includes('trust flows'),
      'invariant 4 (trust flows centrally) must be stated',
    );
  });

  it('clarifies that satellites are NOT members of the Sovereign Stack (§4.5.2)', () => {
    doc = readDoc('AXIOM.md');
    assert.ok(
      doc.includes('4.5.2') || (doc.includes('satellite') && doc.includes('NOT')),
      'AXIOM.md must clarify satellites are not members of the Sovereign Stack',
    );
  });

  it('requires coordinated PRs for cross-tier changes (§4.5.3)', () => {
    doc = readDoc('AXIOM.md');
    assert.ok(
      doc.includes('coordinated PRs') || doc.includes('4.5.3'),
      'AXIOM.md must require coordinated PRs for cross-tier changes',
    );
  });

  it('updates the Versions convention row to reference AIX_STACK_VERSIONING.md', () => {
    doc = readDoc('AXIOM.md');
    assert.ok(
      doc.includes('AIX_STACK_VERSIONING.md'),
      'AXIOM.md §6 Versions row must reference the versioning doctrine file',
    );
  });

  it('adds the Stack codename convention row with Echo369', () => {
    doc = readDoc('AXIOM.md');
    assert.ok(
      doc.includes('Stack codename') && doc.includes('Echo369'),
      'AXIOM.md conventions table must have a Stack codename row with Echo369',
    );
  });

  it('adds the Stack compatibility convention row', () => {
    doc = readDoc('AXIOM.md');
    assert.ok(
      doc.includes('Stack compatibility') || doc.includes('aix.stackVersion'),
      'AXIOM.md conventions table must have a Stack compatibility row',
    );
  });

  it('clarifies that THREE_SIXTY_NINE is the anchor for the Echo369 codename (§8)', () => {
    doc = readDoc('AXIOM.md');
    assert.ok(
      doc.includes('THREE_SIXTY_NINE') && doc.includes('Echo369'),
      'AXIOM.md §8 must link the THREE_SIXTY_NINE constant to the Echo369 codename',
    );
  });

  it('states the 369 motif must not bleed into consumer app versions', () => {
    doc = readDoc('AXIOM.md');
    assert.ok(
      doc.includes('AIX_STACK_VERSIONING.md') &&
        (doc.includes('§6') || doc.includes('motif')),
      'AXIOM.md §8 must refer readers to the versioning doctrine for the 369 motif boundary',
    );
  });

  // Boundary / regression: the old adjacent product repos paragraph was removed
  it('no longer lists repos as "Adjacent product repos" in the old flat format', () => {
    doc = readDoc('AXIOM.md');
    // The old phrasing was "Adjacent product repos live under the same authority but are not in the strict Sovereign Stack"
    assert.ok(
      !doc.includes('Adjacent product repos'),
      'AXIOM.md must not use the removed "Adjacent product repos" phrasing',
    );
  });
});

// ---------------------------------------------------------------------------
// Cross-document consistency

describe('Cross-document consistency', () => {
  it('AGENTS.md and AIX_STACK_VERSIONING.md agree on the current codename (Echo369)', () => {
    const agents = readDoc('AGENTS.md');
    const versioning = readDoc('AIX_STACK_VERSIONING.md');
    assert.ok(agents.includes('Echo369'), 'AGENTS.md must name Echo369 as current codename');
    assert.ok(versioning.includes('Echo369'), 'AIX_STACK_VERSIONING.md must name Echo369 as current codename');
  });

  it('AGENTS.md and AXIOM.md agree on the current spec (AIX/1.0)', () => {
    const agents = readDoc('AGENTS.md');
    const axiom = readDoc('AXIOM.md');
    assert.ok(agents.includes('AIX/1.0'), 'AGENTS.md must reference AIX/1.0 spec');
    assert.ok(axiom.includes('AIX/1.0'), 'AXIOM.md must reference AIX/1.0 spec');
  });

  it('all three docs agree on the protocol version anchor (0.369.0)', () => {
    const agents = readDoc('AGENTS.md');
    const versioning = readDoc('AIX_STACK_VERSIONING.md');
    const axiom = readDoc('AXIOM.md');
    assert.ok(agents.includes('0.369.0'), 'AGENTS.md must state protocol version 0.369.0');
    assert.ok(versioning.includes('0.369.0'), 'AIX_STACK_VERSIONING.md must state protocol version 0.369.0');
    assert.ok(axiom.includes('0.369.0'), 'AXIOM.md must state protocol version 0.369.0');
  });

  it('all three docs agree on the satellite repos (AlphaAxiom, PiWorker-OS, GemClaw)', () => {
    const docs = ['AGENTS.md', 'AIX_STACK_VERSIONING.md', 'AXIOM.md'].map(readDoc);
    for (const [name, doc] of [['AGENTS.md', docs[0]], ['AIX_STACK_VERSIONING.md', docs[1]], ['AXIOM.md', docs[2]]]) {
      assert.ok(doc.includes('AlphaAxiom'), `${name} must mention AlphaAxiom`);
      assert.ok(
        doc.includes('PiWorker'),
        `${name} must mention PiWorker-OS`,
      );
      assert.ok(doc.includes('GemClaw'), `${name} must mention GemClaw`);
    }
  });

  it('AGENTS.md cross-references AIX_STACK_VERSIONING.md and AXIOM.md correctly', () => {
    const doc = readDoc('AGENTS.md');
    assert.ok(doc.includes('AIX_STACK_VERSIONING.md'), 'AGENTS.md must link to AIX_STACK_VERSIONING.md');
    assert.ok(doc.includes('AXIOM.md'), 'AGENTS.md must link to AXIOM.md');
  });

  it('AIX_STACK_VERSIONING.md cross-references AXIOM.md', () => {
    const doc = readDoc('AIX_STACK_VERSIONING.md');
    assert.ok(doc.includes('AXIOM.md'), 'AIX_STACK_VERSIONING.md must reference AXIOM.md');
  });

  it('AXIOM.md cross-references AIX_STACK_VERSIONING.md for the versioning doctrine', () => {
    const doc = readDoc('AXIOM.md');
    assert.ok(
      doc.includes('AIX_STACK_VERSIONING.md'),
      'AXIOM.md must cross-reference AIX_STACK_VERSIONING.md',
    );
  });
});
