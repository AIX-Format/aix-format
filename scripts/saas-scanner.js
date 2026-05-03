#!/usr/bin/env node
/**
 * saas-scanner.js — ABOM SaaS Dependency Scanner
 * 
 * Auto-detects SaaS dependencies in package.json and flags unapproved ones.
 * Part of the AIX Security Protocol.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const RESET  = '\x1b[0m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN  = '\x1b[32m';
const BOLD   = '\x1b[1m';

// Approved Whitelist (should match docs/ABOM_SAAS_BOM.md)
const WHITELIST = new Set([
  'openai',
  'anthropic',
  'ibm-watsonx-ai',
  'google-cloud/vertexai',
  'pinecone-client',
  'mongodb',
  'redis',
  '@upstash/redis',
  'langchain',
  'zod',
  'js-yaml',
  'smol-toml',
  'tweetnacl',
  'tweetnacl-util',
  'crypto-js',
  'uuid',
  '@noble/hashes',
  'json-schema-to-typescript',
  'framer-motion',
  'lucide-react',
  'sonner',
  'clsx',
  'tailwind-merge',
  'tailwindcss',
  'postcss',
  'postcss-loader',
  '@tailwindcss/postcss',
  'typescript',
  'ts-node',
  'vitest',
  '@vitest/coverage-v8',
  'playwright',
  '@playwright/test',
  '@modelcontextprotocol/sdk',
  'crypto',
  'buffer'
]);

function scanPackageJson(filePath) {
  console.log(`${BOLD}Scanning ${filePath}...${RESET}`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`${RED}Error: ${filePath} not found.${RESET}`);
    return [];
  }

  const pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const violations = [];

  for (const dep of Object.keys(deps)) {
    // Ignore internal packages (workspace:*)
    if (deps[dep].startsWith('workspace:')) continue;
    
    // Ignore @types
    if (dep.startsWith('@types/')) continue;

    if (!WHITELIST.has(dep)) {
      violations.push(dep);
    }
  }

  return violations;
}

function logAuditEntry(violations, totalDeps) {
  const auditDir = '.aix/audit';
  if (!fs.existsSync(auditDir)) fs.mkdirSync(auditDir, { recursive: true });

  const timestamp = new Date().toISOString();
  const status = violations.length === 0 ? 'CLEAN' : 'VIOLATION';
  const entry = `[${timestamp}] Scan Status: ${status} | Total Deps: ${totalDeps} | Violations: ${violations.join(', ') || 'None'}\n`;
  
  const hash = crypto.createHash('sha256').update(entry).digest('hex');
  const auditLine = `${hash} | ${entry}`;

  fs.appendFileSync(path.join(auditDir, 'saas-scans.log'), auditLine);
  console.log(`${GREEN}Audit entry generated: ${hash.substring(0, 8)}...${RESET}`);
}

// Main execution
const rootPackage = 'package.json';
const violations = scanPackageJson(rootPackage);
const pkg = JSON.parse(fs.readFileSync(rootPackage, 'utf8'));
const totalDeps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).length;

if (violations.length > 0) {
  console.error(`\n${RED}${BOLD}❌ SECURITY VIOLATION: Unapproved SaaS dependencies found:${RESET}`);
  for (const v of violations) {
    console.log(`  - ${YELLOW}${v}${RESET}`);
  }
  logAuditEntry(violations, totalDeps);
  process.exit(1);
} else {
  console.log(`\n${GREEN}${BOLD}✅ SaaS Scan Passed: All dependencies are in the approved whitelist.${RESET}`);
  logAuditEntry([], totalDeps);
  process.exit(0);
}
