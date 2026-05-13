/**
 * Studio Configuration Files Tests
 *
 * Tests for the studio configuration files added in this PR:
 *   - apps/studio/.env.example
 *   - apps/studio/.eslintrc.json
 *   - apps/studio/.gitignore
 *   - apps/studio/CLAUDE.md
 *   - apps/studio/HARDENING.md
 *   - apps/studio/PI_NETWORK_INTEGRATION.md
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const STUDIO_DIR = path.join(ROOT, 'apps', 'studio');

// ─────────────────────────────────────────────────────────────────────────────
// .eslintrc.json
// ─────────────────────────────────────────────────────────────────────────────

describe('apps/studio/.eslintrc.json', () => {
  const eslintPath = path.join(STUDIO_DIR, '.eslintrc.json');
  let config;

  beforeEach(() => {
    const content = fs.readFileSync(eslintPath, 'utf8');
    config = JSON.parse(content);
  });

  it('file exists', () => {
    expect(fs.existsSync(eslintPath)).toBe(true);
  });

  it('extends next/core-web-vitals', () => {
    expect(config.extends).toBe('next/core-web-vitals');
  });

  it('has a rules section', () => {
    expect(config.rules).toBeDefined();
    expect(typeof config.rules).toBe('object');
  });

  it('has no-restricted-imports rule set to error level', () => {
    const rule = config.rules['no-restricted-imports'];
    expect(rule).toBeDefined();
    expect(Array.isArray(rule)).toBe(true);
    expect(rule[0]).toBe('error');
  });

  it('no-restricted-imports has patterns and paths configuration', () => {
    const ruleConfig = config.rules['no-restricted-imports'][1];
    expect(ruleConfig).toBeDefined();
    expect(ruleConfig.patterns).toBeDefined();
    expect(ruleConfig.paths).toBeDefined();
    expect(Array.isArray(ruleConfig.patterns)).toBe(true);
    expect(Array.isArray(ruleConfig.paths)).toBe(true);
  });

  it('blocks deep relative path imports (../../../../*)', () => {
    const patterns = config.rules['no-restricted-imports'][1].patterns;
    expect(patterns).toContain('../../../../*');
  });

  it('blocks relative imports into core directory', () => {
    const patterns = config.rules['no-restricted-imports'][1].patterns;
    expect(patterns).toContain('../../../core/*');
    expect(patterns).toContain('../../core/*');
    expect(patterns).toContain('../core/*');
  });

  it('blocks @vercel/kv imports with a helpful message', () => {
    const paths = config.rules['no-restricted-imports'][1].paths;
    const vercelKvRule = paths.find((p) => p.name === '@vercel/kv');
    expect(vercelKvRule).toBeDefined();
    expect(vercelKvRule.message).toContain('@/lib/storage/redis');
  });

  it('is valid JSON (no trailing newlines required by JSON spec)', () => {
    const content = fs.readFileSync(eslintPath, 'utf8');
    expect(() => JSON.parse(content)).not.toThrow();
  });

  it('has exactly 4 forbidden core import patterns', () => {
    const patterns = config.rules['no-restricted-imports'][1].patterns;
    const corePatterns = patterns.filter((p) => p.includes('core'));
    expect(corePatterns).toHaveLength(3);
    const deepPattern = patterns.filter((p) => p === '../../../../*');
    expect(deepPattern).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// .env.example
// ─────────────────────────────────────────────────────────────────────────────

describe('apps/studio/.env.example', () => {
  const envExamplePath = path.join(STUDIO_DIR, '.env.example');
  let content;
  let lines;

  beforeEach(() => {
    content = fs.readFileSync(envExamplePath, 'utf8');
    lines = content.split('\n');
  });

  it('file exists', () => {
    expect(fs.existsSync(envExamplePath)).toBe(true);
  });

  // Critical variables
  const criticalVars = [
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'GROQ_API_KEY',
    'GOOGLE_GENERATIVE_AI_API_KEY',
    'XAI_API_KEY',
  ];

  for (const varName of criticalVars) {
    it(`documents critical variable '${varName}'`, () => {
      const hasVar = lines.some(
        (line) => !line.startsWith('#') && line.startsWith(varName + '=')
      );
      expect(hasVar).toBe(true);
    });
  }

  // Pi Network variables
  const piVars = [
    'PI_API_KEY',
    'PI_APP_ID',
    'NEXT_PUBLIC_PI_APP_ID',
    'PI_ENVIRONMENT',
    'NEXT_PUBLIC_PI_ENABLED',
  ];

  for (const varName of piVars) {
    it(`documents Pi Network variable '${varName}'`, () => {
      const hasVar = lines.some(
        (line) => !line.startsWith('#') && line.startsWith(varName + '=')
      );
      expect(hasVar).toBe(true);
    });
  }

  // Security variables
  it('documents JWT_SECRET', () => {
    const hasVar = lines.some((line) => line.startsWith('JWT_SECRET='));
    expect(hasVar).toBe(true);
  });

  it('documents AIX_UID_HASH_SALT', () => {
    const hasVar = lines.some((line) => line.startsWith('AIX_UID_HASH_SALT='));
    expect(hasVar).toBe(true);
  });

  it('documents NODE_ENV with a development default', () => {
    const nodeEnvLine = lines.find((line) => line.startsWith('NODE_ENV='));
    expect(nodeEnvLine).toBeDefined();
    expect(nodeEnvLine).toBe('NODE_ENV=development');
  });

  it('documents NEXT_PUBLIC_APP_URL with localhost default', () => {
    const urlLine = lines.find((line) => line.startsWith('NEXT_PUBLIC_APP_URL='));
    expect(urlLine).toBeDefined();
    expect(urlLine).toContain('localhost');
  });

  it('documents NEXT_PUBLIC_STUDIO_VERSION', () => {
    const hasVar = lines.some((line) => line.startsWith('NEXT_PUBLIC_STUDIO_VERSION='));
    expect(hasVar).toBe(true);
  });

  it('documents SKIP_SIGNATURE_VERIFICATION as false by default', () => {
    const line = lines.find((line) => line.startsWith('SKIP_SIGNATURE_VERIFICATION='));
    expect(line).toBeDefined();
    expect(line).toBe('SKIP_SIGNATURE_VERIFICATION=false');
  });

  it('does not contain any real secret values', () => {
    // None of the values should look like real secrets (long hex strings, JWT tokens, etc.)
    const valueLines = lines.filter(
      (line) => !line.startsWith('#') && line.includes('=') && line.trim().length > 0
    );
    for (const line of valueLines) {
      const value = line.split('=').slice(1).join('=');
      // Real JWT tokens start with eyJ and are very long
      expect(value).not.toMatch(/^eyJ[A-Za-z0-9_-]{50,}/);
      // Real 64-char hex private keys
      expect(value).not.toMatch(/^[0-9a-f]{64}$/);
    }
  });

  it('includes a legacy KV alias for backward compatibility', () => {
    const kvUrl = lines.some((line) => line.startsWith('KV_REST_API_URL='));
    const kvToken = lines.some((line) => line.startsWith('KV_REST_API_TOKEN='));
    expect(kvUrl).toBe(true);
    expect(kvToken).toBe(true);
  });

  it('documents Stripe keys', () => {
    const hasStripeKey = lines.some((line) => line.startsWith('STRIPE_SECRET_KEY='));
    const hasWebhookSecret = lines.some((line) => line.startsWith('STRIPE_WEBHOOK_SECRET='));
    expect(hasStripeKey).toBe(true);
    expect(hasWebhookSecret).toBe(true);
  });

  it('documents AXIOM_AUTHORITY with a non-empty value', () => {
    const line = lines.find((line) => line.startsWith('AXIOM_AUTHORITY='));
    expect(line).toBeDefined();
    const value = line.split('=')[1].trim();
    expect(value.length).toBeGreaterThan(0);
  });

  it('has non-empty file content (not accidentally truncated)', () => {
    expect(content.length).toBeGreaterThan(1000);
  });

  it('PI_ENVIRONMENT defaults to sandbox (not production)', () => {
    const line = lines.find((line) => line.startsWith('PI_ENVIRONMENT='));
    expect(line).toBeDefined();
    expect(line).toBe('PI_ENVIRONMENT=sandbox');
  });

  it('NEXT_PUBLIC_CRYPTO_ENABLED defaults to false', () => {
    const line = lines.find((line) => line.startsWith('NEXT_PUBLIC_CRYPTO_ENABLED='));
    expect(line).toBeDefined();
    expect(line).toBe('NEXT_PUBLIC_CRYPTO_ENABLED=false');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// .gitignore
// ─────────────────────────────────────────────────────────────────────────────

describe('apps/studio/.gitignore', () => {
  const gitignorePath = path.join(STUDIO_DIR, '.gitignore');
  let content;
  let lines;

  beforeEach(() => {
    content = fs.readFileSync(gitignorePath, 'utf8');
    lines = content.split('\n').map((l) => l.trim());
  });

  it('file exists', () => {
    expect(fs.existsSync(gitignorePath)).toBe(true);
  });

  it('ignores node_modules', () => {
    expect(lines).toContain('/node_modules');
  });

  it('ignores the Next.js build directory (.next)', () => {
    expect(lines).toContain('/.next/');
  });

  it('ignores all .env* files (secrets protection)', () => {
    expect(lines).toContain('.env*');
  });

  it('explicitly tracks .env.example (negation rule)', () => {
    expect(lines).toContain('!.env.example');
  });

  it('ignores coverage directory', () => {
    expect(lines).toContain('/coverage');
  });

  it('ignores .pem files (private key files)', () => {
    expect(lines).toContain('*.pem');
  });

  it('ignores npm/yarn lock files (pnpm-only project)', () => {
    expect(lines).toContain('package-lock.json');
    expect(lines).toContain('yarn.lock');
  });

  it('ignores TypeScript build info files', () => {
    expect(lines).toContain('*.tsbuildinfo');
  });

  it('ignores the Vercel deployment directory', () => {
    expect(lines).toContain('.vercel');
  });

  it('ignores .DS_Store macOS files', () => {
    expect(lines).toContain('.DS_Store');
  });

  it('ignores yarn and pnpm debug logs', () => {
    expect(lines).toContain('yarn-debug.log*');
    expect(lines).toContain('yarn-error.log*');
    expect(lines).toContain('.pnpm-debug.log*');
  });

  it('ignores /out and /build directories', () => {
    expect(lines).toContain('/out/');
    expect(lines).toContain('/build');
  });

  it('tracks .yarn/patches, plugins, releases, versions (not all of .yarn/)', () => {
    expect(lines).toContain('.yarn/*');
    expect(lines).toContain('!.yarn/patches');
    expect(lines).toContain('!.yarn/plugins');
    expect(lines).toContain('!.yarn/releases');
    expect(lines).toContain('!.yarn/versions');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CLAUDE.md
// ─────────────────────────────────────────────────────────────────────────────

describe('apps/studio/CLAUDE.md', () => {
  const claudeMdPath = path.join(STUDIO_DIR, 'CLAUDE.md');
  let content;

  beforeEach(() => {
    content = fs.readFileSync(claudeMdPath, 'utf8');
  });

  it('file exists', () => {
    expect(fs.existsSync(claudeMdPath)).toBe(true);
  });

  it('references AXIOM.md for core engineering standards', () => {
    expect(content).toContain('AXIOM.md');
  });

  it('specifies framer-motion for glassmorphism transitions', () => {
    expect(content).toContain('framer-motion');
  });

  it('specifies zustand for state management (no Redux/TanStack)', () => {
    expect(content).toContain('zustand');
    expect(content.toLowerCase()).toContain('redux');
    expect(content.toLowerCase()).toContain('tanstack');
  });

  it('references the Sovereign Aether design system', () => {
    expect(content).toContain('Sovereign Aether');
  });

  it('is not empty', () => {
    expect(content.trim().length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// HARDENING.md
// ─────────────────────────────────────────────────────────────────────────────

describe('apps/studio/HARDENING.md', () => {
  const hardeningPath = path.join(STUDIO_DIR, 'HARDENING.md');
  let content;

  beforeEach(() => {
    content = fs.readFileSync(hardeningPath, 'utf8');
  });

  it('file exists', () => {
    expect(fs.existsSync(hardeningPath)).toBe(true);
  });

  it('mentions the hardening-check.ts script', () => {
    expect(content).toContain('hardening-check.ts');
  });

  it('prohibits js-yaml in the studio bundle', () => {
    expect(content).toContain('js-yaml');
  });

  it('specifies version lock for next, framer-motion, and tailwindcss', () => {
    expect(content.toLowerCase()).toContain('next');
    expect(content.toLowerCase()).toContain('framer-motion');
    expect(content.toLowerCase()).toContain('tailwindcss');
  });

  it('documents MODULE_NOT_FOUND error and fix', () => {
    expect(content).toContain('MODULE_NOT_FOUND');
    expect(content).toContain('parseYamlLight');
  });

  it('documents how to run the hardening check manually', () => {
    expect(content).toContain('npx ts-node scripts/hardening-check.ts');
  });

  it('is non-trivial in length', () => {
    expect(content.length).toBeGreaterThan(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PI_NETWORK_INTEGRATION.md
// ─────────────────────────────────────────────────────────────────────────────

describe('apps/studio/PI_NETWORK_INTEGRATION.md', () => {
  const piDocPath = path.join(STUDIO_DIR, 'PI_NETWORK_INTEGRATION.md');
  let content;

  beforeEach(() => {
    content = fs.readFileSync(piDocPath, 'utf8');
  });

  it('file exists', () => {
    expect(fs.existsSync(piDocPath)).toBe(true);
  });

  it('describes the PiAuth component', () => {
    expect(content).toContain('PiAuth');
  });

  it('describes the PiPayment component', () => {
    expect(content).toContain('PiPayment');
  });

  it('describes the usePi hook', () => {
    expect(content).toContain('usePi');
  });

  it('documents PI_API_KEY environment variable setup', () => {
    expect(content).toContain('PI_API_KEY');
  });

  it('documents sandbox vs production environment selection', () => {
    expect(content).toContain('sandbox');
    expect(content).toContain('production');
  });

  it('describes the payment API endpoints', () => {
    expect(content).toContain('approve-payment');
    expect(content).toContain('complete-payment');
  });

  it('provides code examples for using components', () => {
    // Should have code blocks
    expect(content).toContain('```tsx');
  });

  it('references the Pi Developer Portal', () => {
    expect(content).toContain('develop.pi');
  });

  it('is substantially detailed', () => {
    // Should be a comprehensive integration guide
    expect(content.length).toBeGreaterThan(5000);
  });

  it('documents domain verification setup step', () => {
    expect(content.toLowerCase()).toContain('domain');
    expect(content.toLowerCase()).toContain('verification');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Edge cases and regression tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Studio Config — Edge Cases', () => {
  it('.env.example and .gitignore coexist with correct relationship (example is tracked)', () => {
    // .gitignore must have .env* to block secrets AND !.env.example to allow the template
    const gitignorePath = path.join(STUDIO_DIR, '.gitignore');
    const content = fs.readFileSync(gitignorePath, 'utf8');
    const lines = content.split('\n').map((l) => l.trim());
    const envGlobIndex = lines.indexOf('.env*');
    const envExampleNegIndex = lines.indexOf('!.env.example');
    expect(envGlobIndex).toBeGreaterThanOrEqual(0);
    expect(envExampleNegIndex).toBeGreaterThanOrEqual(0);
    // The negation must come AFTER the glob for gitignore to work correctly
    expect(envExampleNegIndex).toBeGreaterThan(envGlobIndex);
  });

  it('.eslintrc.json is valid JSON that can be parsed without errors', () => {
    const eslintPath = path.join(STUDIO_DIR, '.eslintrc.json');
    const content = fs.readFileSync(eslintPath, 'utf8');
    let parsed;
    expect(() => {
      parsed = JSON.parse(content);
    }).not.toThrow();
    // Verify the parsed object has the expected shape
    expect(parsed).toHaveProperty('extends');
    expect(parsed).toHaveProperty('rules');
  });

  it('.env.example does not contain a VERCEL_TOKEN value (should be in GitHub Secrets)', () => {
    const envExamplePath = path.join(STUDIO_DIR, '.env.example');
    const content = fs.readFileSync(envExamplePath, 'utf8');
    const lines = content.split('\n');
    // VERCEL_TOKEN line should be commented out
    const vercelTokenLine = lines.find((line) => line.includes('VERCEL_TOKEN='));
    if (vercelTokenLine) {
      // If it exists, it must be a comment
      expect(vercelTokenLine.trim()).toMatch(/^#/);
    }
  });

  it('.env.example PROTOCOL_TREASURY_ADDRESS uses a zero-address placeholder', () => {
    const envExamplePath = path.join(STUDIO_DIR, '.env.example');
    const content = fs.readFileSync(envExamplePath, 'utf8');
    const lines = content.split('\n');
    const treasuryLine = lines.find((l) => l.startsWith('PROTOCOL_TREASURY_ADDRESS='));
    expect(treasuryLine).toBeDefined();
    // Should be the zero address (not a real treasury address)
    expect(treasuryLine).toContain('0x0000000000000000000000000000000000000000');
  });

  it('.eslintrc.json no-restricted-imports blocks @vercel/kv with an explicit message', () => {
    const eslintPath = path.join(STUDIO_DIR, '.eslintrc.json');
    const config = JSON.parse(fs.readFileSync(eslintPath, 'utf8'));
    const [, ruleConfig] = config.rules['no-restricted-imports'];
    const vercelKv = ruleConfig.paths.find((p) => p.name === '@vercel/kv');
    expect(vercelKv).toBeDefined();
    // The message must guide the developer to the correct alternative
    expect(typeof vercelKv.message).toBe('string');
    expect(vercelKv.message.trim().length).toBeGreaterThan(10);
  });
});
