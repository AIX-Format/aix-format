#!/usr/bin/env tsx
/**
 * AIX Frontend Evolution Loop
 * apps/studio — Next.js App Router
 *
 * Same meta-loop philosophy as backend evolve.ts:
 *   measure → pick strategy → apply → re-measure → repeat
 *
 * Metrics (4 axes, weighted):
 *   bundleKB       ← next build output (First Load JS)
 *   lighthousePerf ← Lighthouse CI headless (0–100)
 *   componentCount ← static count of .tsx files in src/
 *   renderScore    ← proxy: useEffect without dep array count
 *
 * Convergence: gain < 0.5% for 3 consecutive rounds
 * Max rounds:  69
 *
 * Usage:
 *   cd apps/studio
 *   npx tsx scripts/evolve-frontend.ts
 *   npx tsx scripts/evolve-frontend.ts --rounds 10 --dry-run
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { applyStrategy, STRATEGIES, Strategy } from './strategies/index';

// ─── Config ────────────────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, '..');
const SRC  = path.join(ROOT, 'src');
const LOG  = path.join(ROOT, 'evolution-log.jsonl');

const MAX_ROUNDS        = parseInt(process.env.ROUNDS  || '69', 10);
const CONVERGE_DELTA    = parseFloat(process.env.DELTA  || '0.005');  // 0.5%
const CONVERGE_PATIENCE = 3;
const DRY_RUN           = process.argv.includes('--dry-run');

// ─── Types ─────────────────────────────────────────────────────────────────

interface FrontendScore {
  bundleKB:       number;   // lower = better
  lighthousePerf: number;   // higher = better  (0–100)
  componentCount: number;   // lower = better
  renderScore:    number;   // lower = better   (bad useEffect count)
  timestamp:      number;
}

interface RoundLog {
  round:          number;
  strategy:       string;
  before:         FrontendScore;
  after:          FrontendScore;
  gain:           number;
  converging:     boolean;
  dryRun:         boolean;
}

// ─── Measurement ───────────────────────────────────────────────────────────

/**
 * Parse First Load JS from `next build` stdout
 * Looks for lines like:  ○ /  79.4 kB
 */
function measureBundle(): number {
  try {
    const out = execSync('npm run build 2>&1', {
      cwd: ROOT,
      timeout: 120_000,
      encoding: 'utf8',
    });
    // First Load JS shared is the most stable number
    const match = out.match(/First Load JS shared by all\s+([\d.]+)\s*(kB|MB)/i);
    if (!match) return 999;
    const value = parseFloat(match[1]);
    return match[2].toLowerCase() === 'mb' ? value * 1024 : value;
  } catch {
    return 999;
  }
}

/**
 * Run Lighthouse CI headless if available, else return 0 (skip)
 */
function measureLighthouse(): number {
  try {
    const out = execSync(
      'npx lhci autorun --collect.url=http://localhost:3000 --collect.numberOfRuns=1 2>&1',
      { cwd: ROOT, timeout: 60_000, encoding: 'utf8' }
    );
    const match = out.match(/performance[^\d]+(\d+)/i);
    return match ? parseInt(match[1], 10) : 0;
  } catch {
    return 0;  // Lighthouse not installed — skip axis, weight redistributes
  }
}

/**
 * Count .tsx files in src/ = component count proxy
 */
function measureComponentCount(): number {
  function walk(dir: string): number {
    let count = 0;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) count += walk(full);
      else if (entry.name.endsWith('.tsx')) count++;
    }
    return count;
  }
  return fs.existsSync(SRC) ? walk(SRC) : 0;
}

/**
 * Count useEffect calls missing dependency array = render score
 * Pattern: useEffect(\( => {  without second argument
 */
function measureRenderScore(): number {
  function walk(dir: string): number {
    let count = 0;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { count += walk(full); continue; }
      if (!entry.name.match(/\.(tsx|ts|jsx|js)$/)) continue;
      const src = fs.readFileSync(full, 'utf8');
      // useEffect with arrow fn but no second arg on same/next line
      const matches = src.match(/useEffect\s*\(\s*(?:async\s*)?\(\s*\)\s*=>/g);
      if (matches) {
        // count ones not followed by a dep array
        for (const m of matches) {
          const idx = src.indexOf(m);
          const after = src.slice(idx + m.length, idx + m.length + 300);
          if (!after.match(/},\s*\[/)) count++;
        }
      }
    }
    return count;
  }
  return fs.existsSync(SRC) ? walk(SRC) : 0;
}

/**
 * Composite score — returns a single number (higher = better)
 * bundleKB uses inverted scale anchored at 500KB
 */
function composite(s: FrontendScore): number {
  const bundleNorm    = Math.max(0, 1 - s.bundleKB / 500);   // 0–1, higher better
  const lighthouseNorm = s.lighthousePerf / 100;              // 0–1
  const componentNorm = Math.max(0, 1 - s.componentCount / 200); // assume 200 = max
  const renderNorm    = Math.max(0, 1 - s.renderScore / 50);  // assume 50 = max

  // Weights: bundle 40%, lighthouse 30%, component 15%, render 15%
  // If lighthouse = 0 (skipped), redistribute its weight to bundle
  const lhWeight = s.lighthousePerf > 0 ? 0.30 : 0;
  const bWeight  = s.lighthousePerf > 0 ? 0.40 : 0.70;

  return (
    bundleNorm    * bWeight +
    lighthouseNorm * lhWeight +
    componentNorm * 0.15 +
    renderNorm    * 0.15
  );
}

function measure(): FrontendScore {
  console.log('  📏 Measuring bundle...');
  const bundleKB       = measureBundle();
  console.log('  💡 Measuring Lighthouse...');
  const lighthousePerf = measureLighthouse();
  console.log('  🧱 Counting components...');
  const componentCount = measureComponentCount();
  console.log('  🔄 Measuring render score...');
  const renderScore    = measureRenderScore();
  return { bundleKB, lighthousePerf, componentCount, renderScore, timestamp: Date.now() };
}

// ─── Strategy Selection ────────────────────────────────────────────────────

/**
 * Pick the strategy with the highest expected gain
 * Each strategy reports its own estimated gain before application
 */
async function pickBestStrategy(
  score: FrontendScore,
  applied: Set<string>
): Promise<Strategy | null> {
  const candidates = STRATEGIES.filter(s => !applied.has(s.id));
  if (candidates.length === 0) return null;

  const ranked = candidates
    .map(s => ({ strategy: s, estimate: s.estimate(score, SRC) }))
    .filter(x => x.estimate > 0)
    .sort((a, b) => b.estimate - a.estimate);

  return ranked[0]?.strategy ?? null;
}

// ─── Evolution Loop ────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱 AIX Frontend Evolution Loop');
  console.log(`   App:      apps/studio (Next.js App Router)`);
  console.log(`   Max:      ${MAX_ROUNDS} rounds`);
  console.log(`   Converge: gain < ${CONVERGE_DELTA * 100}% for ${CONVERGE_PATIENCE} rounds`);
  console.log(`   Dry run:  ${DRY_RUN}\n`);

  const appliedStrategies = new Set<string>();
  let stagnantRounds = 0;
  let round = 0;

  console.log('📏 Baseline measurement...');
  let current = measure();
  console.log(`   Bundle: ${current.bundleKB.toFixed(1)} KB`);
  console.log(`   Lighthouse: ${current.lighthousePerf}`);
  console.log(`   Components: ${current.componentCount}`);
  console.log(`   Render score: ${current.renderScore}`);
  console.log(`   Composite: ${composite(current).toFixed(4)}\n`);

  while (round < MAX_ROUNDS) {
    round++;
    console.log(`\n▶️  Round ${round}/${MAX_ROUNDS}`);

    const strategy = await pickBestStrategy(current, appliedStrategies);
    if (!strategy) {
      console.log('  ✅ All strategies applied. Stopping.');
      break;
    }

    console.log(`  🔧 Strategy: ${strategy.id} — ${strategy.description}`);
    const estimated = strategy.estimate(current, SRC);
    console.log(`  📊 Estimated gain: +${(estimated * 100).toFixed(2)}%`);

    if (!DRY_RUN) {
      try {
        const filesChanged = await strategy.apply(SRC, ROOT);
        console.log(`  📁 Files changed: ${filesChanged}`);
        appliedStrategies.add(strategy.id);
      } catch (err: any) {
        console.error(`  ❌ Strategy failed: ${err.message}`);
        appliedStrategies.add(strategy.id);  // skip on failure
        continue;
      }
    } else {
      appliedStrategies.add(strategy.id);
    }

    console.log('  📏 Re-measuring...');
    const next = DRY_RUN ? current : measure();

    const scoreBefore = composite(current);
    const scoreAfter  = composite(next);
    const gain        = scoreBefore > 0 ? (scoreAfter - scoreBefore) / scoreBefore : 0;

    console.log(`  📊 Composite: ${scoreBefore.toFixed(4)} → ${scoreAfter.toFixed(4)} (gain: ${(gain * 100).toFixed(2)}%)`);
    console.log(`  📦 Bundle: ${current.bundleKB.toFixed(1)} → ${next.bundleKB.toFixed(1)} KB`);
    console.log(`  ⚡ Lighthouse: ${current.lighthousePerf} → ${next.lighthousePerf}`);
    console.log(`  🧱 Components: ${current.componentCount} → ${next.componentCount}`);
    console.log(`  🔄 Render score: ${current.renderScore} → ${next.renderScore}`);

    const log: RoundLog = {
      round,
      strategy: strategy.id,
      before:   current,
      after:    next,
      gain,
      converging: gain < CONVERGE_DELTA,
      dryRun: DRY_RUN,
    };
    fs.appendFileSync(LOG, JSON.stringify(log) + '\n');

    if (gain < CONVERGE_DELTA) {
      stagnantRounds++;
      console.log(`  ⏳ Stagnant round ${stagnantRounds}/${CONVERGE_PATIENCE}`);
      if (stagnantRounds >= CONVERGE_PATIENCE) {
        console.log('\n✅ Converged! Stopping early.');
        break;
      }
    } else {
      stagnantRounds = 0;
    }

    current = next;
  }

  console.log('\n🎉 Evolution complete!');
  console.log(`   Rounds run:    ${round}`);
  console.log(`   Strategies:    ${appliedStrategies.size}`);
  console.log(`   Final bundle:  ${current.bundleKB.toFixed(1)} KB`);
  console.log(`   Final LH:      ${current.lighthousePerf}`);
  console.log(`   Final composite: ${composite(current).toFixed(4)}`);
  console.log(`   Log: ${LOG}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
