/**
 * 🛠️ AI Tool Claim Utility (Pi Network)
 * 
 * This script generates the required `pi-claim.json` for domain ownership proof.
 * Usage:
 *   AIX_PRIVATE_KEY=... npx tsx pi-claim-util.ts --domain axiomid.app --id iqra-sovereign
 */

import { AxiomPi } from '../packages/pi-kyc/src/index';
import fs from 'fs';
import path from 'path';

async function main() {
  const args = process.argv.slice(2);
  const domainArg = args.find(a => a.startsWith('--domain'))?.split('=')[1] || 'axiomid.app';
  const idArg = args.find(a => a.startsWith('--id'))?.split('=')[1] || 'iqra-sovereign';
  const envArg = args.find(a => a.startsWith('--env'))?.split('=')[1] || 'production';

  const privateKey = process.env.AIX_PRIVATE_KEY;

  if (!privateKey) {
    console.error('❌ Error: AIX_PRIVATE_KEY environment variable is missing.');
    process.exit(1);
  }

  console.log(`📡 Generating Pi Network Domain Claim for: ${domainArg}`);
  
  const ownerDid = `did:axiom:${domainArg}:${idArg}`;
  
  try {
    const artifact = AxiomPi.createClaim({
      domain: domainArg,
      ownerDid,
      environment: envArg as 'sandbox' | 'production',
    }, privateKey);

    const outputPath = path.join(process.cwd(), 'pi-claim.json');
    fs.writeFileSync(outputPath, JSON.stringify(artifact, null, 2));

    console.log(`✅ Success! Claim artifact generated at: ${outputPath}`);
    console.log(`ℹ️  Upload this file to: https://${domainArg}/.well-known/pi-claim.json`);
  } catch (error: any) {
    console.error(`❌ Failed to generate claim: ${error.message}`);
    process.exit(1);
  }
}

main();
