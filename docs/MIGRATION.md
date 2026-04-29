# AIX Schema Migration Guide

> **Version:** v1.2 → v1.3  
> **Date:** 2026-04-29  
> **Author:** Mohamed Abdelaziz — AMRIKYY AI Solutions

## Overview

AIX Format v1.3 consolidates three previously separate schema files into **one canonical bundled schema**: `schemas/aix.schema.json`.

## Deprecated Schema Files

| Old File | Status | Replacement |
|---|---|---|
| `schemas/aix-v1.schema.json` | ⚠️ **DEPRECATED** | `schemas/aix.schema.json` |
| `schemas/axiom-aix.schema.json` | ⚠️ **DEPRECATED** | `schemas/aix.schema.json` |
| `schemas/aix-enhanced.schema.json` | ⚠️ **DEPRECATED** (was canonical base) | `schemas/aix.schema.json` |

All three files remain in the repo for backward compatibility only. **Do not add new features to them.**

## What Changed in v1.3

### 1. Single Bundled Schema

```jsonc
// OLD: multi-file $ref pattern
{ "$ref": "./defs/semver.json" }

// NEW: bundled $defs in single file
{ "$ref": "#/$defs/SemVer" }
```

### 2. JSON Schema Draft 2020-12

```jsonc
// OLD (Draft 7 in some files)
"$schema": "http://json-schema.org/draft-07/schema#"

// NEW
"$schema": "https://json-schema.org/draft/2020-12/schema"
```

### 3. New `$defs` Available

| `$def` | Description | Pattern/Format |
|---|---|---|
| `SemVer` | Semantic version | `^\d+\.\d+(\.\d+)?` |
| `ISODateTime` | ISO 8601 date-time | `format: date-time` |
| `UUIDv4` | UUID v4 | Standard UUID v4 regex |
| `AxiomDID` | Axiom DID | `^did:axiom:axiomid\.app:` |
| `PublicKey` | Ed25519 / secp256k1 public key | `{ algorithm, value }` |
| `Signature` | Cryptographic signature | `{ algorithm, value }` |
| `MetaArbiterConfig` | Meta Arbiter orchestration config | See below |

### 4. New `meta_arbiter` Optional Field

Added to support the **Meta Arbiter** (العقل المدبر) orchestration system described in the AIX agent architecture spec.

```yaml
# Example: AIX file with meta_arbiter config
meta_arbiter:
  activation_threshold: 0.65
  concurrent_systems_limit: 3
  response_time_target_sec: 4.0
  coordination_strategy: collaborative
  growth_milestones_enabled: true
  growth_milestone_level: intermediate
  decision_criteria:
    urgency: 0.30
    complexity: 0.25
    resource_availability: 0.20
    user_preference: 0.15
    system_capability: 0.10
  alert_thresholds:
    response_time_sec: 5.0
    accuracy: 0.85
    error_rate: 0.05
    resource_usage: 0.80
```

### 5. TypeScript Types Generated

Run once to generate `types/aix.d.ts`:

```bash
npm install
npm run generate:types:unified
```

This produces typed interfaces for all AIX sections including:
- `AIXDocument` — root document interface
- `Meta`, `Persona`, `Security`, `IdentityLayer`
- `Skill`, `API`, `MCP`, `Memory`
- `Economics`, `PiNetwork`, `ABOM`
- `LiveVoice`, `Requirements`
- `MetaArbiterConfig` — NEW in v1.3

## Validator Migration

### Before (Ajv with multi-file)

```typescript
// Old pattern — required multiple addSchema() calls
import Ajv from 'ajv';
const ajv = new Ajv();
ajv.addSchema(require('./defs/semver.json'));
ajv.addSchema(require('./defs/isodatetime.json'));
const validate = ajv.compile(require('./aix-v1.schema.json'));
```

### After (Ajv with bundled schema)

```typescript
// New pattern — single import, zero external $refs
import Ajv from 'ajv/dist/2020';
import schema from '../schemas/aix.schema.json' assert { type: 'json' };

const ajv = new Ajv({ strict: true, allErrors: true });
const validate = ajv.compile(schema);

if (!validate(doc)) {
  console.error(validate.errors);
}
```

## Parser Migration

The parser now has a fully typed TypeScript implementation at `core/parser.ts`.

```typescript
// TypeScript — full type safety
import { AIXParser } from 'aix-format';
import type { AIXDocument, MetaArbiterConfig } from 'aix-format/types/aix';

const parser = new AIXParser();
const agent = parser.parse(aixContent);

// Typed getters
console.log(agent.meta.name);          // string
console.log(agent.identity_layer.id);  // string (AxiomDID)
console.log(agent.meta_arbiter);       // MetaArbiterConfig | undefined
console.log(agent.getCapabilities());  // string[] - includes 'meta_arbiter' if present
```

## Changelog

### v1.3.0 (2026-04-29)
- feat: unified bundled `schemas/aix.schema.json` (supersedes aix-v1, axiom-aix, aix-enhanced)
- feat: JSON Schema Draft 2020-12 upgrade
- feat: `$defs` block with SemVer, ISODateTime, UUIDv4, AxiomDID, PublicKey, Signature, MetaArbiterConfig
- feat: `meta_arbiter` optional property in AIXDocument
- feat: `core/parser.ts` — TypeScript implementation with full type safety
- feat: `tsconfig.json` for TypeScript compilation
- feat: `npm run generate:types:unified` script
- feat: `npm run build` script (tsc)
- chore: package.json version 1.2.0 → 1.3.0
- chore: added `types/aix.d.ts` to `files[]` in package.json
- chore: `json-schema-to-typescript` and `typescript` added as devDependencies
