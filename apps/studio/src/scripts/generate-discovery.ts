/**
 * Standalone Script to generate .well-known/agent.aix.json from an AIX manifest.
 * Usage: npx ts-node generate-discovery.ts path/to/agent.aix server_url
 */

import fs from 'fs';
import path from 'path';
import { generateAIXDiscovery, formatWellKnownDiscovery } from '../lib/mcp-generator';

const manifestPath = process.argv[2];
const serverUrl = process.argv[3] || 'https://your-agent-server.com';

if (!manifestPath) {
  console.error("Please provide a path to an AIX manifest file.");
  process.exit(1);
}

try {
  const content = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(content);
  
  const discovery = generateAIXDiscovery(manifest, serverUrl);
  const formatted = formatWellKnownDiscovery(discovery);
  
  const outDir = path.join(process.cwd(), '.well-known');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  
  const outFile = path.join(outDir, 'agent.aix.json');
  fs.writeFileSync(outFile, formatted);
  
  console.log(`Successfully generated discovery file at: ${outFile}`);
  console.log("Compliance: W3C Server Metadata Discovery (Draft 2026)");
} catch (error) {
  console.error("Error generating discovery file:", error);
}
