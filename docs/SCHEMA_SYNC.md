# 🔄 Schema-Type Synchronization System
## نظام مزامنة Schema-Type التلقائي

> **The Hidden Killer**: TypeScript types silently diverge from JSON schemas over time, causing runtime validation failures that static analysis cannot catch.

---

## 📋 Table of Contents | جدول المحتويات

1. [Overview | نظرة عامة](#overview)
2. [The Problem | المشكلة](#the-problem)
3. [The Solution | الحل](#the-solution)
4. [Architecture | البنية](#architecture)
5. [Usage | الاستخدام](#usage)
6. [CI Integration | تكامل CI](#ci-integration)
7. [Configuration | التكوين](#configuration)
8. [Troubleshooting | استكشاف الأخطاء](#troubleshooting)

---

## Overview | نظرة عامة

The Schema-Type Sync system is a **bidirectional validation tool** that ensures perfect synchronization between:

- **JSON Schema** (`schemas/aix.schema.json`) - The canonical source of truth
- **TypeScript Types** (`packages/aix-types/index.d.ts`) - Manually maintained type definitions

نظام مزامنة Schema-Type هو **أداة تحقق ثنائية الاتجاه** تضمن المزامنة المثالية بين:

- **JSON Schema** - مصدر الحقيقة الأساسي
- **TypeScript Types** - تعريفات الأنواع المكتوبة يدوياً

---

## The Problem | المشكلة

### Real-World Impact

In production, the v1.2 → v1.3 migration caused critical failures because:

1. **Silent Divergence**: Developers edited TypeScript types without updating schemas
2. **Runtime Failures**: JSON validation rejected valid manifests
3. **No Detection**: Static type checking couldn't catch the mismatch
4. **Production Bugs**: Agents failed to deploy despite passing TypeScript compilation

في الإنتاج، تسببت الترحيل من v1.2 إلى v1.3 في فشل حرج بسبب:

1. **الانحراف الصامت**: المطورون عدلوا أنواع TypeScript دون تحديث schemas
2. **فشل وقت التشغيل**: التحقق من JSON رفض manifests صالحة
3. **عدم الكشف**: فحص الأنواع الثابت لم يستطع اكتشاف عدم التطابق
4. **أخطاء الإنتاج**: فشل نشر الوكلاء رغم نجاح تجميع TypeScript

### Example Drift Scenario

```typescript
// schemas/aix.schema.json
{
  "properties": {
    "meta": {
      "required": ["version", "id", "name", "format_version"]
    }
  }
}

// packages/aix-types/index.d.ts (WRONG - Drift!)
interface Meta {
  version: string;
  id: string;
  name: string;
  // Missing: format_version (required in schema!)
}
```

**Result**: Runtime validation fails even though TypeScript compiles successfully.

---

## The Solution | الحل

### Automated Bidirectional Validation

The system performs three types of checks:

1. **Missing Fields Detection**
   - Fields in schema but not in TypeScript
   - Fields in TypeScript but not in schema

2. **Type Mismatch Detection**
   - `string` vs `number`
   - `required` vs `optional`
   - Enum value differences

3. **Structural Validation**
   - Nested object consistency
   - Array type matching
   - Union type alignment

### Enforcement Points

1. **CI Pipeline**: Runs on every PR and main branch commit
2. **Pre-commit Hook**: Optional local validation
3. **Manual Check**: `npm run schema:sync:check`

---

## Architecture | البنية

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                  Schema-Type Sync System                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  JSON Schema     │         │  TypeScript      │         │
│  │  (Source)        │◄───────►│  Types (Manual)  │         │
│  └──────────────────┘         └──────────────────┘         │
│           │                            │                     │
│           │                            │                     │
│           ▼                            ▼                     │
│  ┌─────────────────────────────────────────────┐           │
│  │     scripts/schema-type-sync.ts             │           │
│  │  ┌─────────────────────────────────────┐   │           │
│  │  │  1. Extract Fields (AST Parsing)    │   │           │
│  │  │  2. Compare Bidirectionally         │   │           │
│  │  │  3. Generate Drift Report           │   │           │
│  │  └─────────────────────────────────────┘   │           │
│  └─────────────────────────────────────────────┘           │
│                       │                                      │
│                       ▼                                      │
│  ┌─────────────────────────────────────────────┐           │
│  │  .generated/schema-drift-report.txt         │           │
│  │  • Missing fields                            │           │
│  │  • Type mismatches                           │           │
│  │  • Actionable fix instructions               │           │
│  └─────────────────────────────────────────────┘           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Key Files

| File | Purpose | الغرض |
|------|---------|-------|
| `scripts/schema-type-sync.ts` | Main validation script | سكريبت التحقق الرئيسي |
| `schema-sync.config.json` | Configuration | ملف التكوين |
| `.github/workflows/studio-ci.yml` | CI integration | تكامل CI |
| `.husky/pre-commit` | Pre-commit hook | خطاف ما قبل الـ commit |
| `.generated/schema-drift-report.txt` | Drift report output | تقرير الانحراف |

---

## Usage | الاستخدام

### Basic Commands

```bash
# Check for drift
npm run schema:sync:check

# Auto-fix (regenerate types from schema)
npm run schema:sync:fix

# View last drift report
cat .generated/schema-drift-report.txt
```

### Workflow Example

#### Adding a New Field

```bash
# 1. Edit schema first (source of truth)
vim schemas/aix.schema.json

# Add new field:
{
  "properties": {
    "new_field": {
      "type": "string",
      "description": "New feature field"
    }
  }
}

# 2. Update TypeScript types to match
vim packages/aix-types/index.d.ts

# Add to interface:
interface AIXManifest {
  new_field?: string;
}

# 3. Verify sync
npm run schema:sync:check

# 4. Commit both files
git add schemas/aix.schema.json packages/aix-types/index.d.ts
git commit -m "feat(schema): add new_field to AIXManifest"
```

---

## CI Integration | تكامل CI

### GitHub Actions Workflow

The drift check runs automatically in `.github/workflows/studio-ci.yml`:

```yaml
- name: Schema-Type Sync Verification
  run: npm run schema:sync:check
  env:
    CI: true
```

### Execution Order

1. Install dependencies
2. TypeScript type check
3. **Schema-Type Sync Check** ← Blocks PR if drift detected
4. Build
5. Tests

### Failure Behavior

When drift is detected:

1. ❌ CI job fails
2. 📄 Drift report uploaded as artifact
3. 🚫 PR cannot be merged
4. 📧 Optional notifications sent (Slack/Discord)

---

## Configuration | التكوين

### schema-sync.config.json

```json
{
  "ignore_patterns": [
    "*.test.ts",
    "**/__tests__/**"
  ],
  
  "custom_type_mappings": {
    "ISODateTime": "string",
    "AxiomDID": "string"
  },
  
  "validation_rules": {
    "require_descriptions": true,
    "enforce_required_fields": true,
    "strict_type_matching": true
  },
  
  "ci_config": {
    "fail_on_drift": true,
    "generate_artifacts": true
  }
}
```

### Customization Options

| Option | Description | الوصف |
|--------|-------------|--------|
| `ignore_patterns` | Files to skip | الملفات المتجاهلة |
| `custom_type_mappings` | Type aliases | أسماء الأنواع المستعارة |
| `fail_on_drift` | Exit code 1 on drift | الخروج بخطأ عند الانحراف |
| `generate_artifacts` | Save reports | حفظ التقارير |

---

## Troubleshooting | استكشاف الأخطاء

### Common Issues

#### 1. "Missing field in TypeScript"

**Problem**: Schema has a field that TypeScript doesn't.

**Solution**:
```typescript
// Add to packages/aix-types/index.d.ts
interface AIXManifest {
  missing_field: string; // Add this
}
```

#### 2. "Type mismatch"

**Problem**: Schema says `number`, TypeScript says `string`.

**Solution**: Align the types:
```json
// schemas/aix.schema.json
"age": { "type": "number" }
```
```typescript
// packages/aix-types/index.d.ts
age: number; // Match schema
```

#### 3. "Required vs Optional mismatch"

**Problem**: Schema marks field as required, TypeScript marks it optional.

**Solution**:
```json
// Schema
"required": ["name"]
```
```typescript
// TypeScript (remove ?)
name: string; // Not name?: string
```

### Debug Mode

```bash
# Run with verbose output
DEBUG=schema-sync npm run schema:sync:check

# View full AST extraction
npm run schema:sync:check -- --verbose
```

---

## Best Practices | أفضل الممارسات

### ✅ DO

- Always edit `schemas/aix.schema.json` first
- Update `packages/aix-types/index.d.ts` to match
- Run `npm run schema:sync:check` before committing
- Commit schema and types together
- Review drift reports carefully

### ❌ DON'T

- Never edit `types/parser.d.ts` (auto-generated)
- Don't skip the sync check with `--no-verify`
- Don't commit schema without updating types
- Don't ignore drift warnings

---

## Future Enhancements | التحسينات المستقبلية

- [ ] Auto-fix suggestions with code generation
- [ ] Slack/Discord notifications for drift
- [ ] Visual diff viewer in CI
- [ ] Schema migration tools
- [ ] Type coverage metrics

---

## Support | الدعم

For issues or questions:

- 📧 Email: amrikyy@gmail.com
- 🐛 GitHub Issues: [aix-format/issues](https://github.com/Moeabdelaziz007/aix-format/issues)
- 📚 Docs: [CONTRIBUTING.md](../CONTRIBUTING.md)

---

**Built with ❤️ by Mohamed Abdelaziz - AMRIKYY AI Solutions**

*"We are not building tools; we are architecting the trust layer for the future of intelligence."*