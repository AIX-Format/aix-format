# Legacy AIX Schemas

This directory contains deprecated schema files that have been superseded by the unified `aix.schema.json` in the parent directory.

## Deprecated Schemas

- **aix-v1.schema.json** - Original v1.0 schema (superseded by unified schema)
- **aix-enhanced.schema.json** - Enhanced schema with additional features (merged into unified schema)
- **axiom-aix.schema.json** - Axiom-specific schema (merged into unified schema)
- **aix.schema.head.json** - Header-only schema (merged into unified schema)
- **aix.schema.remote.json** - Remote reference schema (merged into unified schema)

## Current Schema

The current authoritative schema is:
- **../aix.schema.json** - Unified AIX Format v1.3 Schema

Per ADR-001, `aix.schema.json` is the Single Source of Truth for all AIX document structures.

## Migration

If you are using any of these legacy schemas, please migrate to `aix.schema.json`. The unified schema includes all features from the legacy schemas with improved organization and modularity.

---

**Note**: These files are kept for historical reference only and should not be used in new implementations.