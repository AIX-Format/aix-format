import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const schemaPath = path.join(rootDir, 'schemas/aix.schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const validate = ajv.compile(schema);

const examplesDir = path.join(rootDir, 'examples');
const files = fs.readdirSync(examplesDir).filter(f => f.endsWith('.aix.json'));

console.log(`🔍 Validating ${files.length} examples against AIX v1.3 schema...\n`);

let failed = 0;

files.forEach(file => {
  const filePath = path.join(examplesDir, file);
  const manifest = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const valid = validate(manifest);
  
  if (valid) {
    console.log(`✅ ${file}: VALID`);
  } else {
    failed++;
    console.log(`❌ ${file}: INVALID`);
    validate.errors.forEach(err => {
      console.log(`   - ${err.instancePath} ${err.message}`);
    });
  }
});

console.log(`\nSummary: ${files.length - failed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
}
