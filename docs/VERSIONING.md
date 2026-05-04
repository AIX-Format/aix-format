---
title: AIX Versioning Policy
version: 0.369.0
---
## القاعدة
- النسخة الرسمية الوحيدة: 0.369.0
- MAJOR: تغيير schema يكسر compatibility
- MINOR: إضافة fields جديدة (backward compatible)
- PATCH: bug fixes + docs

## مصادر الحقيقة
- schemas/aix.schema.json → "$schema_version"
- package.json (root) → "version"
- README.md → badge + header
