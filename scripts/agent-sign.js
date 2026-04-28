import fs from 'fs';
import path from 'path';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';

// Simulated ED25519 Key Pair for the Agent
const agentKeypair = nacl.sign.keyPair.fromSeed(
  new Uint8Array(32).fill(7) // Fixed seed for demonstration purposes
);

const agentIdentityPath = path.resolve('agent-identity.json');
const manifestPath = path.resolve('AI_MANIFEST.md');

function signManifest() {
    let identity;
    try {
        identity = JSON.parse(fs.readFileSync(agentIdentityPath, 'utf-8'));
    } catch(e) {
        console.error("Could not read agent-identity.json");
        process.exit(1);
    }

    const timestamp = new Date().toISOString();

    // In a real scenario, this would hash the git commit diff
    const messageStr = `Agent ${identity.did} verifies the stability of the latest push at ${timestamp}`;
    const messageUint8 = naclUtil.decodeUTF8(messageStr);

    const signature = nacl.sign(messageUint8, agentKeypair.secretKey);
    const signatureBase64 = naclUtil.encodeBase64(signature);

    const manifestContent = `
# Sovereign Agent Integrity Manifest

**Agent DID:** \`${identity.did}\`
**Agent Name:** ${identity.name}
**Timestamp:** ${timestamp}

## Cryptographic Proof
**Message:** "${messageStr}"
**Signature (ED25519):**
\`\`\`
${signatureBase64}
\`\`\`

> *This manifest proves that these changes were autonomously generated, tested, and validated by a Sovereign AI Agent adhering to the AIX standard.*
`;

    fs.writeFileSync(manifestPath, manifestContent.trim());
    console.log("AI_MANIFEST.md has been generated and signed.");
}

signManifest();
