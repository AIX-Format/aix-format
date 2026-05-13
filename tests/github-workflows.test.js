/**
 * GitHub Workflows Validation Tests
 *
 * Tests for the CI/CD workflow files added in this PR:
 *   - .github/CODEOWNERS
 *   - .github/workflows/ai-guardrails.yml
 *   - .github/workflows/aix-validation.yml
 *   - .github/workflows/ci.yml
 *   - .github/workflows/dead-code-scan.yml
 *   - .github/workflows/evolution.yml
 *   - .github/workflows/health-autonomy.yml
 *   - .github/workflows/health-check.yml
 *   - .github/workflows/jules-scheduled.yml
 *   - .github/workflows/pattern-watcher.yml
 *   - .github/workflows/quality.yml
 *   - .github/workflows/schema-drift-check.yml
 *   - .github/workflows/security-signature-gate.yml
 *   - .github/workflows/sovereign-pulse.yml
 *   - .github/workflows/studio-ci.yml
 *   - .github/workflows/studio-protection.yml
 *   - .github/workflows/swarm-router-sync.yml
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const WORKFLOWS_DIR = path.join(ROOT, '.github', 'workflows');

/**
 * Load and parse a workflow YAML file by name.
 * Returns the parsed object.
 */
function loadWorkflow(filename) {
  const filePath = path.join(WORKFLOWS_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf8');
  return yaml.load(content);
}

/**
 * Check that a workflow file exists and return its path.
 */
function workflowPath(filename) {
  return path.join(WORKFLOWS_DIR, filename);
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Assert a workflow object has the minimum required top-level fields.
 */
function assertBasicWorkflowStructure(wf, filename) {
  expect(wf, `${filename} must not be null`).not.toBeNull();
  expect(typeof wf.name, `${filename} must have a 'name' field`).toBe('string');
  expect(wf.on, `${filename} must have an 'on' field`).toBeDefined();
  expect(wf.jobs, `${filename} must have a 'jobs' field`).toBeDefined();
  expect(typeof wf.jobs, `${filename} jobs must be an object`).toBe('object');
}

/**
 * Assert every job in a workflow has a 'runs-on' and 'steps' field.
 */
function assertJobsHaveRunsOnAndSteps(wf, filename) {
  for (const [jobId, job] of Object.entries(wf.jobs)) {
    expect(job['runs-on'], `${filename} job '${jobId}' must have 'runs-on'`).toBeDefined();
    expect(Array.isArray(job.steps), `${filename} job '${jobId}' must have 'steps' array`).toBe(true);
    expect(job.steps.length, `${filename} job '${jobId}' must have at least one step`).toBeGreaterThan(0);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKFLOW FILES EXIST
// ─────────────────────────────────────────────────────────────────────────────

describe('GitHub Workflow Files — Existence', () => {
  const expectedWorkflows = [
    'ai-guardrails.yml',
    'aix-validation.yml',
    'ci.yml',
    'dead-code-scan.yml',
    'evolution.yml',
    'health-autonomy.yml',
    'health-check.yml',
    'jules-scheduled.yml',
    'pattern-watcher.yml',
    'quality.yml',
    'schema-drift-check.yml',
    'security-signature-gate.yml',
    'sovereign-pulse.yml',
    'studio-ci.yml',
    'studio-protection.yml',
    'swarm-router-sync.yml',
  ];

  for (const filename of expectedWorkflows) {
    it(`workflow file '${filename}' exists`, () => {
      expect(fs.existsSync(workflowPath(filename))).toBe(true);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// VALID YAML
// ─────────────────────────────────────────────────────────────────────────────

describe('GitHub Workflow Files — Valid YAML', () => {
  const workflowFiles = fs
    .readdirSync(WORKFLOWS_DIR)
    .filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'));

  for (const filename of workflowFiles) {
    it(`'${filename}' is valid YAML`, () => {
      const filePath = path.join(WORKFLOWS_DIR, filename);
      const content = fs.readFileSync(filePath, 'utf8');
      expect(() => yaml.load(content)).not.toThrow();
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// BASIC STRUCTURE (name, on, jobs)
// ─────────────────────────────────────────────────────────────────────────────

describe('GitHub Workflow Files — Basic Structure', () => {
  const workflowFiles = fs
    .readdirSync(WORKFLOWS_DIR)
    .filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'));

  for (const filename of workflowFiles) {
    it(`'${filename}' has required top-level fields (name, on, jobs)`, () => {
      const wf = loadWorkflow(filename);
      assertBasicWorkflowStructure(wf, filename);
    });

    it(`'${filename}' jobs each have 'runs-on' and 'steps'`, () => {
      const wf = loadWorkflow(filename);
      assertJobsHaveRunsOnAndSteps(wf, filename);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ai-guardrails.yml
// ─────────────────────────────────────────────────────────────────────────────

describe('ai-guardrails.yml', () => {
  let wf;

  beforeEach(() => {
    wf = loadWorkflow('ai-guardrails.yml');
  });

  it('triggers only on pull_request to main', () => {
    expect(wf.on).toHaveProperty('pull_request');
    expect(wf.on.pull_request.branches).toContain('main');
  });

  it('has concurrency group to cancel in-progress runs', () => {
    expect(wf.concurrency).toBeDefined();
    expect(wf.concurrency['cancel-in-progress']).toBe(true);
    expect(wf.concurrency.group).toContain('ai-guardrails');
  });

  it('defines the detect-ai-origin job', () => {
    expect(wf.jobs['detect-ai-origin']).toBeDefined();
  });

  it('detect-ai-origin outputs is_ai_pr and has_high_risk_files', () => {
    const job = wf.jobs['detect-ai-origin'];
    expect(job.outputs).toBeDefined();
    expect(job.outputs.is_ai_pr).toBeDefined();
    expect(job.outputs.has_high_risk_files).toBeDefined();
  });

  it('ai-security-scan job depends on detect-ai-origin', () => {
    const job = wf.jobs['ai-security-scan'];
    expect(job).toBeDefined();
    expect(job.needs).toBe('detect-ai-origin');
  });

  it('ai-security-scan runs only when is_ai_pr is true', () => {
    const job = wf.jobs['ai-security-scan'];
    expect(job.if).toContain('is_ai_pr');
    expect(job.if).toContain('true');
  });

  it('ai-full-test job depends on detect-ai-origin', () => {
    const job = wf.jobs['ai-full-test'];
    expect(job).toBeDefined();
    expect(job.needs).toBe('detect-ai-origin');
  });

  it('high-risk-gate job exists and depends on detect-ai-origin', () => {
    const job = wf.jobs['high-risk-gate'];
    expect(job).toBeDefined();
    expect(job.needs).toBe('detect-ai-origin');
  });

  it('high-risk-gate condition checks both is_ai_pr and has_high_risk_files', () => {
    const job = wf.jobs['high-risk-gate'];
    expect(job.if).toContain('is_ai_pr');
    expect(job.if).toContain('has_high_risk_files');
  });

  it('sets NODE_VERSION env var to "20"', () => {
    expect(wf.env).toBeDefined();
    expect(wf.env.NODE_VERSION).toBe('20');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// aix-validation.yml
// ─────────────────────────────────────────────────────────────────────────────

describe('aix-validation.yml', () => {
  let wf;

  beforeEach(() => {
    wf = loadWorkflow('aix-validation.yml');
  });

  it('triggers on pull_request for AIX-related file paths', () => {
    expect(wf.on.pull_request).toBeDefined();
    const paths = wf.on.pull_request.paths;
    expect(paths).toContain('**/*.aix');
    expect(paths).toContain('**/*.aix.json');
    expect(paths).toContain('schemas/**');
    expect(paths).toContain('core/**');
  });

  it('has concurrency group that cancels in-progress runs', () => {
    expect(wf.concurrency).toBeDefined();
    expect(wf.concurrency['cancel-in-progress']).toBe(true);
    expect(wf.concurrency.group).toContain('aix-validate');
  });

  it('validate-aix-files job has a checkout step', () => {
    const job = wf.jobs['validate-aix-files'];
    expect(job).toBeDefined();
    const checkoutStep = job.steps.find(
      (s) => s.uses && s.uses.startsWith('actions/checkout')
    );
    expect(checkoutStep).toBeDefined();
  });

  it('validate-aix-files job installs pnpm and node', () => {
    const job = wf.jobs['validate-aix-files'];
    const pnpmStep = job.steps.find(
      (s) => s.uses && s.uses.startsWith('pnpm/action-setup')
    );
    const nodeStep = job.steps.find(
      (s) => s.uses && s.uses.startsWith('actions/setup-node')
    );
    expect(pnpmStep).toBeDefined();
    expect(nodeStep).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ci.yml
// ─────────────────────────────────────────────────────────────────────────────

describe('ci.yml', () => {
  let wf;

  beforeEach(() => {
    wf = loadWorkflow('ci.yml');
  });

  it('triggers on push to main and pull_request to main', () => {
    expect(wf.on.push).toBeDefined();
    expect(wf.on.push.branches).toContain('main');
    expect(wf.on.pull_request).toBeDefined();
    expect(wf.on.pull_request.branches).toContain('main');
  });

  it('ignores documentation changes via paths-ignore', () => {
    const prIgnore = wf.on.pull_request['paths-ignore'];
    expect(prIgnore).toBeDefined();
    expect(prIgnore).toContain('docs/**');
    expect(prIgnore).toContain('**/*.md');
    const pushIgnore = wf.on.push['paths-ignore'];
    expect(pushIgnore).toContain('docs/**');
  });

  it('has a build job and a test job', () => {
    expect(wf.jobs.build).toBeDefined();
    expect(wf.jobs.test).toBeDefined();
  });

  it('deploy job depends on build and test', () => {
    const deploy = wf.jobs.deploy;
    expect(deploy).toBeDefined();
    expect(deploy.needs).toContain('build');
    expect(deploy.needs).toContain('test');
  });

  it('deploy job only runs on push to main (not PRs)', () => {
    const deploy = wf.jobs.deploy;
    expect(deploy.if).toContain('refs/heads/main');
    expect(deploy.if).toContain('push');
  });

  it('deploy job uses production environment', () => {
    const deploy = wf.jobs.deploy;
    expect(deploy.environment).toBe('production');
  });

  it('build job sets working-directory to apps/studio', () => {
    const build = wf.jobs.build;
    expect(build.defaults).toBeDefined();
    expect(build.defaults.run).toBeDefined();
    expect(build.defaults.run['working-directory']).toBe('apps/studio');
  });

  it('has concurrency group to prevent duplicate CI runs', () => {
    expect(wf.concurrency).toBeDefined();
    expect(wf.concurrency['cancel-in-progress']).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// dead-code-scan.yml
// ─────────────────────────────────────────────────────────────────────────────

describe('dead-code-scan.yml', () => {
  let wf;

  beforeEach(() => {
    wf = loadWorkflow('dead-code-scan.yml');
  });

  it('triggers on pull_request, push to main, and schedule', () => {
    expect(wf.on.pull_request).toBeDefined();
    expect(wf.on.push).toBeDefined();
    expect(wf.on.push.branches).toContain('main');
    expect(wf.on.schedule).toBeDefined();
    expect(Array.isArray(wf.on.schedule)).toBe(true);
  });

  it('schedule runs weekly (Monday at midnight UTC)', () => {
    const cron = wf.on.schedule[0].cron;
    expect(cron).toBe('0 0 * * 1');
  });

  it('has write permissions for pull-requests and issues', () => {
    expect(wf.permissions).toBeDefined();
    expect(wf.permissions['pull-requests']).toBe('write');
    expect(wf.permissions.issues).toBe('write');
    expect(wf.permissions.contents).toBe('read');
  });

  it('dead-code-archaeology job has a timeout', () => {
    const job = wf.jobs['dead-code-archaeology'];
    expect(job).toBeDefined();
    expect(job['timeout-minutes']).toBeDefined();
    expect(typeof job['timeout-minutes']).toBe('number');
  });

  it('uploads both markdown and JSON reports as artifacts', () => {
    const job = wf.jobs['dead-code-archaeology'];
    const uploadSteps = job.steps.filter(
      (s) => s.uses && s.uses.startsWith('actions/upload-artifact')
    );
    expect(uploadSteps.length).toBeGreaterThanOrEqual(2);
  });

  it('supports workflow_dispatch manual trigger', () => {
    expect(wf.on.workflow_dispatch).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// evolution.yml
// ─────────────────────────────────────────────────────────────────────────────

describe('evolution.yml', () => {
  let wf;

  beforeEach(() => {
    wf = loadWorkflow('evolution.yml');
  });

  it('triggers on schedule (every 6 hours) and workflow_dispatch', () => {
    expect(wf.on.schedule).toBeDefined();
    expect(wf.on.schedule[0].cron).toBe('0 */6 * * *');
    expect(wf.on.workflow_dispatch).toBeDefined();
  });

  it('uses external API keys from secrets', () => {
    const job = wf.jobs.evolve;
    const metaStep = job.steps.find(
      (s) => s.env && s.env.GROQ_API_KEY
    );
    expect(metaStep).toBeDefined();
    expect(metaStep.env.GROQ_API_KEY).toContain('secrets.GROQ_API_KEY');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// health-autonomy.yml
// ─────────────────────────────────────────────────────────────────────────────

describe('health-autonomy.yml', () => {
  let wf;

  beforeEach(() => {
    wf = loadWorkflow('health-autonomy.yml');
  });

  it('triggers on push to main, pull_request, and schedule', () => {
    expect(wf.on.push).toBeDefined();
    expect(wf.on.pull_request).toBeDefined();
    expect(wf.on.schedule).toBeDefined();
  });

  it('schedule runs daily (midnight UTC)', () => {
    const cron = wf.on.schedule[0].cron;
    expect(cron).toBe('0 0 * * *');
  });

  it('has write permissions for issues and pull-requests', () => {
    expect(wf.permissions).toBeDefined();
    expect(wf.permissions.issues).toBe('write');
    expect(wf.permissions['pull-requests']).toBe('write');
  });

  it('auto-remediate job depends on health-check', () => {
    const job = wf.jobs['auto-remediate'];
    expect(job).toBeDefined();
    expect(job.needs).toBe('health-check');
  });

  it('auto-remediate only runs on main branch pushes (not PRs)', () => {
    const job = wf.jobs['auto-remediate'];
    expect(job.if).toContain('refs/heads/main');
    expect(job.if).toContain('pull_request');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// health-check.yml
// ─────────────────────────────────────────────────────────────────────────────

describe('health-check.yml', () => {
  let wf;

  beforeEach(() => {
    wf = loadWorkflow('health-check.yml');
  });

  it('triggers on schedule (every Sunday) and workflow_dispatch', () => {
    expect(wf.on.schedule).toBeDefined();
    expect(wf.on.workflow_dispatch).toBeDefined();
    const cron = wf.on.schedule[0].cron;
    expect(cron).toBe('0 0 * * 0');
  });

  it('health-check job runs with pnpm test', () => {
    const job = wf.jobs['health-check'];
    expect(job).toBeDefined();
    const testStep = job.steps.find(
      (s) => s.run && s.run.includes('pnpm test')
    );
    expect(testStep).toBeDefined();
  });

  it('checks for did:axiom legacy references (identity compliance)', () => {
    const job = wf.jobs['health-check'];
    const identityStep = job.steps.find(
      (s) => s.run && s.run.includes('did:axiom')
    );
    expect(identityStep).toBeDefined();
  });

  it('posts a step summary at the end', () => {
    const job = wf.jobs['health-check'];
    const summaryStep = job.steps.find(
      (s) => s.run && s.run.includes('GITHUB_STEP_SUMMARY')
    );
    expect(summaryStep).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// jules-scheduled.yml
// ─────────────────────────────────────────────────────────────────────────────

describe('jules-scheduled.yml', () => {
  let wf;

  beforeEach(() => {
    wf = loadWorkflow('jules-scheduled.yml');
  });

  it('triggers on schedule (Sunday 02:00 UTC) and workflow_dispatch', () => {
    expect(wf.on.schedule).toBeDefined();
    const cron = wf.on.schedule[0].cron;
    expect(cron).toBe('0 2 * * 0');
    expect(wf.on.workflow_dispatch).toBeDefined();
  });

  it('workflow_dispatch has a task input with multiple options', () => {
    const inputs = wf.on.workflow_dispatch.inputs;
    expect(inputs).toBeDefined();
    expect(inputs.task).toBeDefined();
    expect(inputs.task.type).toBe('choice');
    expect(inputs.task.options).toContain('weekly-audit');
    expect(inputs.task.options).toContain('security-scan');
    expect(inputs.task.options).toContain('dependency-update');
  });

  it('defines protocol-audit, security-scan, and dependency-check jobs', () => {
    expect(wf.jobs['protocol-audit']).toBeDefined();
    expect(wf.jobs['security-scan']).toBeDefined();
    expect(wf.jobs['dependency-check']).toBeDefined();
  });

  it('protocol-audit runs on schedule or weekly-audit task', () => {
    const job = wf.jobs['protocol-audit'];
    expect(job.if).toContain('weekly-audit');
    expect(job.if).toContain('schedule');
  });

  it('security-scan checks for hardcoded private keys', () => {
    const job = wf.jobs['security-scan'];
    const scanStep = job.steps.find(
      (s) => s.run && s.run.includes('privateKey') && s.run.includes('secretKey')
    );
    expect(scanStep).toBeDefined();
  });

  it('dependency-check uses pnpm outdated', () => {
    const job = wf.jobs['dependency-check'];
    const checkStep = job.steps.find(
      (s) => s.run && s.run.includes('pnpm outdated')
    );
    expect(checkStep).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// pattern-watcher.yml
// ─────────────────────────────────────────────────────────────────────────────

describe('pattern-watcher.yml', () => {
  let wf;

  beforeEach(() => {
    wf = loadWorkflow('pattern-watcher.yml');
  });

  it('triggers on push and pull_request to main', () => {
    expect(wf.on.push.branches).toContain('main');
    expect(wf.on.pull_request.branches).toContain('main');
  });

  it('watch-patterns job runs the pattern-watcher script', () => {
    const job = wf.jobs['watch-patterns'];
    expect(job).toBeDefined();
    const patternStep = job.steps.find(
      (s) => s.run && s.run.includes('pattern-watcher.js')
    );
    expect(patternStep).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// quality.yml
// ─────────────────────────────────────────────────────────────────────────────

describe('quality.yml', () => {
  let wf;

  beforeEach(() => {
    wf = loadWorkflow('quality.yml');
  });

  it('triggers on pull_request and weekly schedule', () => {
    expect(wf.on.pull_request).toBeDefined();
    expect(wf.on.schedule).toBeDefined();
    expect(wf.on.schedule[0].cron).toBe('0 0 * * 0');
  });

  it('dead-code job runs the dead-code-scan.sh script', () => {
    const job = wf.jobs['dead-code'];
    expect(job).toBeDefined();
    const scanStep = job.steps.find(
      (s) => s.run && s.run.includes('dead-code-scan.sh')
    );
    expect(scanStep).toBeDefined();
  });

  it('dead-code job uploads a dead-code report artifact', () => {
    const job = wf.jobs['dead-code'];
    const uploadStep = job.steps.find(
      (s) => s.uses && s.uses.startsWith('actions/upload-artifact')
    );
    expect(uploadStep).toBeDefined();
    expect(uploadStep.with.name).toBe('dead-code-report');
  });

  it('dead-code scan continues on error (does not block)', () => {
    const job = wf.jobs['dead-code'];
    const scanStep = job.steps.find(
      (s) => s.run && s.run.includes('dead-code-scan.sh')
    );
    expect(scanStep['continue-on-error']).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// schema-drift-check.yml
// ─────────────────────────────────────────────────────────────────────────────

describe('schema-drift-check.yml', () => {
  let wf;

  beforeEach(() => {
    wf = loadWorkflow('schema-drift-check.yml');
  });

  it('triggers on pull_request for schema/types/package changes', () => {
    expect(wf.on.pull_request).toBeDefined();
    const paths = wf.on.pull_request.paths;
    expect(paths).toContain('schemas/**');
    expect(paths).toContain('types/**');
  });

  it('triggers on push to main for schema/types changes', () => {
    expect(wf.on.push).toBeDefined();
    expect(wf.on.push.branches).toContain('main');
    const paths = wf.on.push.paths;
    expect(paths).toContain('schemas/**');
    expect(paths).toContain('types/**');
  });

  it('schema-drift job backs up committed types before regenerating', () => {
    const job = wf.jobs['schema-drift'];
    expect(job).toBeDefined();
    const backupStep = job.steps.find(
      (s) => s.run && s.run.includes('types/parser.d.ts.committed')
    );
    expect(backupStep).toBeDefined();
  });

  it('schema-drift job regenerates types from schema', () => {
    const job = wf.jobs['schema-drift'];
    const regenStep = job.steps.find(
      (s) => s.run && s.run.includes('generate:types:unified')
    );
    expect(regenStep).toBeDefined();
  });

  it('schema-drift job compares regenerated vs committed types', () => {
    const job = wf.jobs['schema-drift'];
    const diffStep = job.steps.find(
      (s) => s.run && s.run.includes('diff')
    );
    expect(diffStep).toBeDefined();
  });

  it('schema-drift job uploads the diff as an artifact when drift is found', () => {
    const job = wf.jobs['schema-drift'];
    const uploadStep = job.steps.find(
      (s) =>
        s.uses &&
        s.uses.startsWith('actions/upload-artifact') &&
        s.if &&
        s.if.includes('drift')
    );
    expect(uploadStep).toBeDefined();
  });

  it('schema-drift job fails the build when drift is detected', () => {
    const job = wf.jobs['schema-drift'];
    const failStep = job.steps.find(
      (s) => s.if && s.if.includes('drift') && s.run && s.run.includes('exit 1')
    );
    expect(failStep).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// security-signature-gate.yml
// ─────────────────────────────────────────────────────────────────────────────

describe('security-signature-gate.yml', () => {
  let wf;

  beforeEach(() => {
    wf = loadWorkflow('security-signature-gate.yml');
  });

  it('triggers on pull_request for core/scripts/tests changes', () => {
    expect(wf.on.pull_request).toBeDefined();
    const paths = wf.on.pull_request.paths;
    expect(paths).toContain('core/**');
    expect(paths).toContain('scripts/**');
    expect(paths).toContain('tests/**');
  });

  it('triggers on push to main and master', () => {
    expect(wf.on.push).toBeDefined();
    expect(wf.on.push.branches).toContain('main');
    expect(wf.on.push.branches).toContain('master');
  });

  it('sign-verify-gate job runs parser and security tests', () => {
    const job = wf.jobs['sign-verify-gate'];
    expect(job).toBeDefined();
    const testStep = job.steps.find(
      (s) => s.run && s.run.includes('security-gate.test.js')
    );
    expect(testStep).toBeDefined();
  });

  it('sign-verify-gate runs sign-verify e2e tests', () => {
    const job = wf.jobs['sign-verify-gate'];
    const testStep = job.steps.find(
      (s) => s.run && s.run.includes('sign-verify.test.js')
    );
    expect(testStep).toBeDefined();
  });

  it('sign-verify-gate uses node --test runner', () => {
    const job = wf.jobs['sign-verify-gate'];
    const testStep = job.steps.find(
      (s) => s.run && s.run.includes('node --test')
    );
    expect(testStep).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// studio-ci.yml
// ─────────────────────────────────────────────────────────────────────────────

describe('studio-ci.yml', () => {
  let wf;

  beforeEach(() => {
    wf = loadWorkflow('studio-ci.yml');
  });

  it('triggers on push to main and pull_request to main', () => {
    expect(wf.on.push.branches).toContain('main');
    expect(wf.on.pull_request.branches).toContain('main');
  });

  it('ignores documentation-only changes', () => {
    const prIgnore = wf.on.pull_request['paths-ignore'];
    expect(prIgnore).toContain('docs/**');
    expect(prIgnore).toContain('**/*.md');
  });

  it('has concurrency group to cancel in-progress runs', () => {
    expect(wf.concurrency).toBeDefined();
    expect(wf.concurrency['cancel-in-progress']).toBe(true);
    expect(wf.concurrency.group).toContain('studio-ci');
  });

  it('studio-build-check job has a timeout', () => {
    const job = wf.jobs['studio-build-check'];
    expect(job).toBeDefined();
    expect(job['timeout-minutes']).toBeDefined();
  });

  it('studio-build-check builds Next.js', () => {
    const job = wf.jobs['studio-build-check'];
    const buildStep = job.steps.find(
      (s) => s.name && s.name.toLowerCase().includes('build')
    );
    expect(buildStep).toBeDefined();
  });

  it('route-validation job depends on studio-build-check', () => {
    const job = wf.jobs['route-validation'];
    expect(job).toBeDefined();
    expect(job.needs).toBe('studio-build-check');
  });

  it('route-validation checks for broken cross-package imports', () => {
    const job = wf.jobs['route-validation'];
    const checkStep = job.steps.find(
      (s) => s.run && s.run.includes('core')
    );
    expect(checkStep).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// studio-protection.yml
// ─────────────────────────────────────────────────────────────────────────────

describe('studio-protection.yml', () => {
  let wf;

  beforeEach(() => {
    wf = loadWorkflow('studio-protection.yml');
  });

  it('triggers only on pull_request to main', () => {
    expect(wf.on.pull_request).toBeDefined();
    expect(wf.on.pull_request.branches).toContain('main');
  });

  it('triggers on high-risk studio file changes', () => {
    const paths = wf.on.pull_request.paths;
    expect(paths).toContain('apps/studio/app/layout.tsx');
    expect(paths).toContain('apps/studio/app/globals.css');
    expect(paths).toContain('apps/studio/next.config.ts');
    expect(paths).toContain('apps/studio/package.json');
  });

  it('has concurrency group to cancel in-progress runs', () => {
    expect(wf.concurrency).toBeDefined();
    expect(wf.concurrency['cancel-in-progress']).toBe(true);
  });

  it('defines studio-build-gate, studio-baseline-compliance, and studio-ai-gate jobs', () => {
    expect(wf.jobs['studio-build-gate']).toBeDefined();
    expect(wf.jobs['studio-baseline-compliance']).toBeDefined();
    expect(wf.jobs['studio-ai-gate']).toBeDefined();
  });

  it('studio-ai-gate depends on build-gate and baseline-compliance', () => {
    const job = wf.jobs['studio-ai-gate'];
    expect(job.needs).toContain('studio-build-gate');
    expect(job.needs).toContain('studio-baseline-compliance');
  });

  it('studio-baseline-compliance checks for Tailwind v3 regression', () => {
    const job = wf.jobs['studio-baseline-compliance'];
    const tailwindStep = job.steps.find(
      (s) => s.run && s.run.includes('@tailwind base')
    );
    expect(tailwindStep).toBeDefined();
  });

  it('studio-baseline-compliance checks for deprecated externalDir', () => {
    const job = wf.jobs['studio-baseline-compliance'];
    const extDirStep = job.steps.find(
      (s) => s.run && s.run.includes('externalDir')
    );
    expect(extDirStep).toBeDefined();
  });

  it('studio-ai-gate blocks AI PRs without human-reviewed label', () => {
    const job = wf.jobs['studio-ai-gate'];
    const gateStep = job.steps.find(
      (s) => s.run && s.run.includes('human-reviewed') && s.run.includes('exit 1')
    );
    expect(gateStep).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// swarm-router-sync.yml
// ─────────────────────────────────────────────────────────────────────────────

describe('swarm-router-sync.yml', () => {
  let wf;

  beforeEach(() => {
    wf = loadWorkflow('swarm-router-sync.yml');
  });

  it('triggers on changes to SwarmRouter source files', () => {
    const pushPaths = wf.on.push.paths;
    expect(pushPaths).toContain('swarm_router.go');
    expect(pushPaths).toContain('packages/aix-core/src/SwarmRouter.ts');
  });

  it('triggers on push to main and develop', () => {
    expect(wf.on.push.branches).toContain('main');
    expect(wf.on.push.branches).toContain('develop');
  });

  it('supports workflow_dispatch for manual sync checks', () => {
    expect(wf.on.workflow_dispatch).toBeDefined();
  });

  it('defines sync-verification, go-tests, and typescript-tests jobs', () => {
    expect(wf.jobs['sync-verification']).toBeDefined();
    expect(wf.jobs['go-tests']).toBeDefined();
    expect(wf.jobs['typescript-tests']).toBeDefined();
  });

  it('sync-verification checks for CircuitBreaker presence', () => {
    const job = wf.jobs['sync-verification'];
    const cbStep = job.steps.find(
      (s) => s.run && s.run.includes('CircuitBreaker')
    );
    expect(cbStep).toBeDefined();
  });

  it('sync-verification checks for RouterMetrics presence', () => {
    const job = wf.jobs['sync-verification'];
    const metricsStep = job.steps.find(
      (s) => s.run && s.run.includes('RouterMetrics')
    );
    expect(metricsStep).toBeDefined();
  });

  it('sync-verification checks fallback chain limit', () => {
    const job = wf.jobs['sync-verification'];
    const fallbackStep = job.steps.find(
      (s) => s.run && s.run.includes('fallback chain limit')
    );
    expect(fallbackStep).toBeDefined();
  });

  it('go-tests job sets up Go environment', () => {
    const job = wf.jobs['go-tests'];
    const goStep = job.steps.find(
      (s) => s.uses && s.uses.startsWith('actions/setup-go')
    );
    expect(goStep).toBeDefined();
  });

  it('go-tests runs with race detection and coverage', () => {
    const job = wf.jobs['go-tests'];
    const testStep = job.steps.find(
      (s) => s.run && s.run.includes('go test') && s.run.includes('-race')
    );
    expect(testStep).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CODEOWNERS
// ─────────────────────────────────────────────────────────────────────────────

describe('CODEOWNERS', () => {
  const codeownersPath = path.join(ROOT, '.github', 'CODEOWNERS');
  let content;

  beforeEach(() => {
    content = fs.readFileSync(codeownersPath, 'utf8');
  });

  it('CODEOWNERS file exists', () => {
    expect(fs.existsSync(codeownersPath)).toBe(true);
  });

  it('has @Moeabdelaziz007 as the primary owner', () => {
    expect(content).toContain('@Moeabdelaziz007');
  });

  it('assigns ownership for governance files', () => {
    expect(content).toMatch(/AGENT_GOVERNANCE\.md\s+@Moeabdelaziz007/);
    expect(content).toMatch(/ARCH_DECISIONS\.md\s+@Moeabdelaziz007/);
    expect(content).toMatch(/CLAUDE\.md\s+@Moeabdelaziz007/);
  });

  it('assigns ownership for CI/CD workflows directory', () => {
    expect(content).toMatch(/\.github\/workflows\/\s+@Moeabdelaziz007/);
  });

  it('assigns ownership for schemas and types directories', () => {
    expect(content).toMatch(/schemas\/\s+@Moeabdelaziz007/);
    expect(content).toMatch(/types\/\s+@Moeabdelaziz007/);
  });

  it('assigns ownership for core library files', () => {
    expect(content).toMatch(/core\/parser\.ts\s+@Moeabdelaziz007/);
    expect(content).toMatch(/core\/parser\.js\s+@Moeabdelaziz007/);
    expect(content).toMatch(/core\/error_handler\.js\s+@Moeabdelaziz007/);
  });

  it('assigns ownership for studio high-risk zone', () => {
    expect(content).toMatch(/apps\/studio\/app\/layout\.tsx\s+@Moeabdelaziz007/);
    expect(content).toMatch(/apps\/studio\/app\/globals\.css\s+@Moeabdelaziz007/);
    expect(content).toMatch(/apps\/studio\/next\.config\.ts\s+@Moeabdelaziz007/);
    expect(content).toMatch(/apps\/studio\/lib\/\s+@Moeabdelaziz007/);
  });

  it('assigns ownership for security and economics directories', () => {
    expect(content).toMatch(/security\/\s+@Moeabdelaziz007/);
    expect(content).toMatch(/economics\/\s+@Moeabdelaziz007/);
  });

  it('CODEOWNERS file itself is owned by @Moeabdelaziz007', () => {
    expect(content).toMatch(/\.github\/CODEOWNERS\s+@Moeabdelaziz007/);
  });

  it('does not have any lines with owner references missing the @ prefix', () => {
    const lines = content.split('\n').filter(
      (line) => !line.startsWith('#') && line.trim().length > 0
    );
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2) {
        // All owner references must start with @
        const owners = parts.slice(1);
        for (const owner of owners) {
          expect(owner).toMatch(/^@/);
        }
      }
    }
  });
});