# AIX Format Specification

> **A**rtificial **I**ntelligence e**X**change - Standard File Format for AI Agents

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.4.0--pre--release-orange.svg)](https://github.com/Moeabdelaziz007/aix-format)
[![Node](https://img.shields.io/badge/node->=18.0.0-brightgreen.svg)](https://nodejs.org)
[![Status](https://img.shields.io/badge/status-experimental-yellow.svg)](https://github.com/Moeabdelaziz007/aix-format)

---

## ⚠️ **PRE-RELEASE STATUS**

**Current Version:** v0.4.0 (Experimental)  
**Development Time:** 37 hours (October 2025)  
**Status:** 🧪 Seeking early adopters and feedback  
**Testing:** Being validated in [Amrikyy Travel Platform](https://amrikyy.ai)

**This is a pre-release version.** The API may change based on real-world usage and feedback. We'll promote to v1.0 after validation with 100+ real users.

---

**Author:** Mohamed H Abdelaziz  
**Organization:** AMRIKYY AI Solutions  
**Contact:** amrikyy@gmail.com  
**Academic Email:** abdela1@students.kennesaw.edu  
**Copyright © 2025** Mohamed H Abdelaziz / AMRIKYY AI Solutions

---

## 📖 Overview

**AIX (Artificial Intelligence e**X**change)** is an experimental file format for packaging and distributing AI agents. Built in 37 hours of focused development, it provides a structured approach to defining agent personality, capabilities, tool integrations, memory configurations, and security features.

### Why AIX?

- **🔒 Security Focused**: Checksums, digital signatures, and encryption support
- **🔄 Multi-Format**: Supports YAML, JSON, and TOML
- **📦 Self-Contained**: Agent definition in a single file
- **🎯 Human Readable**: Easy to write and understand
- **🚀 Extensible**: Custom fields and future-proof design
- **✅ Schema Validated**: JSON Schema validation included

### Current Limitations

- ⚠️ **Pre-release**: API may change based on feedback
- ⚠️ **Limited testing**: Currently being validated in one production system
- ⚠️ **Seeking feedback**: We need real-world usage to improve
- ⚠️ **v1.0 target**: After 100+ users validate the design

---

## 🏛️ Root Authority (AxiomID)

Every AIX Enhanced message is governed by **axiomid.app** as the sole Root Authority for Agent DIDs (`did:axiom:axiomid.app:<id>`).
The AIX format includes an `identity_layer` block that supports cryptographic verification via `Ed25519` and `secp256k1` signatures.

## ✨ Key Features

### 1. **Comprehensive Agent Definition**
Define your AI agent's personality, skills, and behavior in a structured format:
- Persona configuration (tone, style, constraints)
- Skills and capabilities
- API integrations
- MCP (Model Context Protocol) server configurations
- Memory management (episodic, semantic, procedural)

### 2. **Multi-Format Support**
Write AIX files in your preferred format:
- **YAML**: Human-friendly, easy to read and write
- **JSON**: Universal compatibility
- **TOML**: Configuration-focused syntax

### 3. **Security by Design**
- **SHA-256 Checksums**: Verify file integrity
- **Digital Signatures**: RSA/Ed25519 signature support
- **Encryption Metadata**: Track encryption status
- **Capability Restrictions**: Define allowed operations

### 4. **Enhanced Agent Requirements**
- **Hardware Requirements**: CPU, memory, storage, and GPU specifications
- **Software Dependencies**: Runtime and library requirements
- **Network Requirements**: Bandwidth and domain access specifications

### 5. **Pricing Model Support**
- **Pay-per-call**: Cost per API invocation
- **Subscription**: Monthly fees with usage tiers
- **Tiered Pricing**: Volume-based pricing models
- **Multi-currency**: Support for SOL, USD, and other currencies

### 6. **Identity Layer (Axiom Standard)**
- **Blockchain Integration**: Native Solana support
- **Wallet Management**: Public key identification
- **Decentralized Identifiers**: DID document support
- **Verifiable Credentials**: Certification verification

### 7. **Economic Layer (Axiom Standard)**
- **Token Economics**: AXIOM token support
- **Task Pricing**: Cost-per-task models
- **Reputation Systems**: Minimum reputation requirements
- **Revenue Sharing**: Distribution models

### 8. **Tool Integration**
- Native API integration definitions
- MCP server configurations
- Authentication and rate limiting
- Custom tool parameters

### 9. **Memory Systems**
- Episodic memory (conversation history)
- Semantic memory (knowledge graphs)
- Procedural memory (workflows)
- Vector database support

---

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/amrikyy/aix-format.git
cd aix-format

# Install dependencies
npm install

# Run tests
npm test
```

### Basic Usage

#### 1. Create an AIX File

Create a file named `my-agent.aix` (YAML format):

```yaml
# My First AIX Agent
meta:
  version: "1.0"
  id: "550e8400-e29b-41d4-a716-446655440000"
  name: "My Assistant"
  created: "2025-01-12T10:30:00Z"
  author: "Your Name"

persona:
  role: "helpful assistant"
  tone: "friendly and professional"
  instructions: "Help users with their questions clearly and concisely."

skills:
  - name: "general_knowledge"
    description: "Answer general knowledge questions"
    enabled: true

security:
  checksum:
    algorithm: "sha256"
    value: "abc123..."
```

#### 2. Validate the AIX File

```bash
# Using the CLI tool
node bin/aix-validate.js my-agent.aix

# Or programmatically
node -e "
const { AIXParser } = require('./core/parser.js');
const parser = new AIXParser();
const agent = parser.parseFile('my-agent.aix');
console.log('Valid!', agent.meta.name);
"
```

#### 3. Convert Between Formats

```bash
# Convert YAML to JSON
node bin/aix-convert.js my-agent.aix my-agent.json --format json

# Convert JSON to TOML
node bin/aix-convert.js my-agent.json my-agent.toml --format toml
```

---

## 📂 Project Structure

```
aix-format/
├── docs/                      # Documentation
│   ├── AIX_SPEC.md           # Complete technical specification
│   └── AIX_PARSER_DOC.md     # Parser implementation guide
├── core/                      # Core implementation
│   └── parser.js             # Reference parser (zero dependencies)
├── examples/                  # Example AIX files
│   ├── persona-agent.aix     # Conversational agent example
│   ├── tool-agent.aix        # API integration example
│   ├── hybrid-agent.aix      # Full-featured research assistant
│   ├── enhanced-agent.aix    # Enhanced agent with requirements/pricing
│   └── axiom-agent.aix.json  # Axiom standard agent example
├── schemas/                   # Validation schemas
│   ├── aix-v1.schema.json    # JSON Schema for AIX v1.0
│   ├── aix-enhanced.schema.json # Enhanced schema with requirements/pricing
│   └── axiom-aix.schema.json # Axiom standard schema (Digital DNA)
├── bin/                       # CLI tools
│   ├── aix-validate.js       # Validation utility
│   └── aix-convert.js        # Format conversion utility
├── tests/                     # Test suite
│   └── parser.test.js        # Parser tests
├── COPYRIGHT.md               # Copyright notice
├── LICENSE.md                 # MIT License with attribution
├── README.md                  # This file
└── package.json              # NPM package configuration
```

---

## 🛠️ CLI Tools

### aix-validate

Validate AIX files for correctness:

```bash
node bin/aix-validate.js <file.aix>

# Options:
#   --schema    Use JSON schema validation
#   --security  Verify checksums and signatures
#   --verbose   Show detailed validation results
```

**Example:**
```bash
node bin/aix-validate.js examples/persona-agent.aix --security --verbose
```

### aix-convert

Convert AIX files between formats:

```bash
node bin/aix-convert.js <input> <output> --format <yaml|json|toml>

# The tool automatically:
#   - Detects input format
#   - Validates structure
#   - Recalculates checksums
#   - Preserves all data
```

**Example:**
```bash
node bin/aix-convert.js my-agent.yaml my-agent.json --format json
```

---

## 🔐 Security Features

### Checksum Verification

Every AIX file can include a SHA-256 checksum to verify integrity:

```yaml
security:
  checksum:
    algorithm: "sha256"
    value: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    scope: "content"  # What's included in checksum
```

### Digital Signatures

Support for cryptographic signatures:

```yaml
security:
  signature:
    algorithm: "RSA-SHA256"
    value: "base64-encoded-signature"
    public_key: "-----BEGIN PUBLIC KEY-----\n..."
    signer: "author@example.com"
    timestamp: "2025-01-12T10:30:00Z"
```

### Capability Restrictions

Define what the agent is allowed to do:

```yaml
security:
  capabilities:
    allowed_operations:
      - "read_files"
      - "call_apis"
    restricted_domains:
      - "localhost"
      - "*.internal"
    max_api_calls_per_minute: 60
```

---

## 🧩 Enhanced Features

### Requirements Section

Define hardware, software, and network requirements for agent deployment:

```yaml
requirements:
  hardware:
    cpu_cores: 2
    memory_mb: 1024
    storage_mb: 512
    gpu_required: false
  software:
    runtime: "Python 3.9+"
    dependencies:
      - "requests>=2.28.0"
      - "beautifulsoup4>=4.11.0"
    python_version: "3.9"
  network:
    internet_access: true
    bandwidth_mbps: 10
    allowed_domains:
      - "*.webscraper.io"
      - "api.openai.com"
```

### Pricing Section

Specify pricing models for agent usage in decentralized economies:

```yaml
pricing:
  model: "pay_per_call"
  cost_per_call:
    amount: 0.001
    currency: "SOL"
```

### Identity Layer (Axiom Standard)

Define agent identity and wallet information:

```json
"identity_layer": {
  "network": "solana",
  "wallet_pubkey": "CcrbGS99N45XPZBLRxeN6q76P93iog6qGdLAiK839d6g",
  "did_document": "did:axiom:12345"
}
```

### Economic Layer (Axiom Standard)

Specify agent economic models:

```json
"economics": {
  "token": "AXIOM",
  "cost_per_task": 5,
  "min_reputation_required": 50
}
```

---

## 📚 Documentation

- **[AIX Specification](docs/AIX_SPEC.md)**: Complete technical specification
- **[Parser Documentation](docs/AIX_PARSER_DOC.md)**: Implementation guide
- **[Examples](examples/)**: Sample AIX files for different use cases

---

## 🧪 Development

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run linter
npm run lint

# Generate documentation
npm run docs
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
node tests/parser.test.js
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Report Issues**: Found a bug? [Open an issue](https://github.com/amrikyy/aix-format/issues)
2. **Suggest Features**: Have an idea? Start a discussion
3. **Submit PRs**: Fork, create a branch, and submit a pull request
4. **Improve Docs**: Documentation improvements are always welcome

### Contribution Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Maintain attribution in file headers
- Sign commits with GPG (recommended)

---

## 📄 License

This project is licensed under the **MIT License with Attribution Requirements**.

Copyright (c) 2025 Mohamed H Abdelaziz / AMRIKYY AI Solutions

See [LICENSE.md](LICENSE.md) for full license text.  
See [COPYRIGHT.md](COPYRIGHT.md) for complete copyright notice.

### Attribution

When using this specification, please include:

```
Based on the AIX Format Specification by Mohamed H Abdelaziz / AMRIKYY AI Solutions
https://github.com/amrikyy/aix-format
```

---

## 📞 Support

### Contact

- **Email**: amrikyy@gmail.com
- **Academic Email**: abdela1@students.kennesaw.edu
- **Website**: https://amrikyy.ai
- **Issues**: https://github.com/amrikyy/aix-format/issues

### Community

- **Discussions**: https://github.com/amrikyy/aix-format/discussions
- **Wiki**: https://github.com/amrikyy/aix-format/wiki

---

## 🗺️ Roadmap to v1.0

**Current: v0.4.0** (Pre-release)

- [x] v0.1: Initial specification and parser (37 hours)
- [x] v0.2: Security model and error handling
- [x] v0.3: Requirements and pricing models
- [x] v0.4: Axiom standard with identity and economics layers
- [ ] v0.5: Get 10 early adopters to test
- [ ] v0.6: Incorporate feedback, stabilize API
- [ ] v0.9: Beta testing with 50+ users
- [ ] **v1.0: First stable release** (after 100+ users validate)

**Post v1.0:**
- [ ] v1.x: Python and Go implementations
- [ ] v2.0: Multi-agent coordination (if users need it)

---

## 🙏 Acknowledgments

Special thanks to:
- The AI development community
- Contributors and early adopters
- Standards organizations (IETF, W3C, OpenAPI Initiative)

---

## 📜 Version History

- **v0.4.0** (November 18, 2025): Pre-release
  - Axiom standard with identity and economics layers
  - New axiom-aix.schema.json for Digital DNA
  - Example Axiom agent with complete specification
  - Updated documentation and specification
  - **Status:** Seeking early adopters for feedback

- **v0.3.0** (November 18, 2025): Pre-release
  - Enhanced schema with requirements and pricing sections
  - New example agent with resource requirements
  - Updated documentation and specification
  - **Status:** Seeking early adopters for feedback

- **v0.2.0** (October 14, 2025): Pre-release
  - Complete specification (11,334 lines)
  - Reference Node.js parser (zero dependencies)
  - CLI tools (validate, convert)
  - Example agents (3 realistic examples)
  - JSON Schema validation
  - Production-grade error handling
  - Security model with detached manifests
  - **Development time:** 37 hours of focused work
  - **Status:** Seeking early adopters for feedback

---

## 🙏 **Want to Help?**

This is a **37-hour-old project** seeking validation!

**Early Adopters Wanted:**
- Try AIX in your project
- Report what works and what doesn't
- Suggest improvements
- Help us reach v1.0

**Feedback Channels:**
- [GitHub Issues](https://github.com/amrikyy/aix-format/issues)
- [Discussions](https://github.com/amrikyy/aix-format/discussions)
- Email: amrikyy@gmail.com

---

**Built with ❤️ by Mohamed H Abdelaziz / AMRIKYY AI Solutions**

*Building the future of AI agent portability - one user at a time.*