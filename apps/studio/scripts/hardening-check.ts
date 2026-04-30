
import fs from 'fs';
import path from 'path';

const STUDIO_PKG_PATH = './package.json';
const EXPECTED_VERSIONS = {
  'next': '^16',
  'framer-motion': '^12',
  'tailwindcss': '^4',
  '@tailwindcss/postcss': '^4',
  '@vercel/analytics': '^2'
};

function checkHardening() {
  console.log('🛡️  Running AIX Studio Hardening Check...');
  
  const pkg = JSON.parse(fs.readFileSync(STUDIO_PKG_PATH, 'utf-8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  
  let errors = 0;

  // 1. Check for js-yaml (Should be removed)
  if (deps['js-yaml'] || deps['@types/js-yaml']) {
    console.error('❌ ERROR: js-yaml found in dependencies. It must be removed to avoid build issues.');
    errors++;
  }

  // 2. Check Version Compatibility
  for (const [name, version] of Object.entries(EXPECTED_VERSIONS)) {
    if (!deps[name]) {
      console.error(`❌ ERROR: Missing critical dependency: ${name}`);
      errors++;
    } else if (!deps[name].startsWith(version.replace('^', ''))) {
       // Simple version check
       console.warn(`⚠️  WARNING: ${name} version is ${deps[name]}, expected ${version}`);
    }
  }

  // 3. Peer Dependencies check (React 19 for Next 16)
  if (!deps['react']?.startsWith('^19') && !deps['react']?.startsWith('19')) {
    console.error('❌ ERROR: React 19 is required for Next.js 16/Studio Hardening.');
    errors++;
  }

  if (errors > 0) {
    console.log(`\n❌ Hardening check failed with ${errors} errors.`);
    process.exit(1);
  } else {
    console.log('\n✅ Studio Hardening check passed!');
  }
}

checkHardening();
