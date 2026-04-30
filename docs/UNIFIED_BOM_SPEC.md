# مواصفات المنتج: طبقة الرؤية الموحّدة (Unified BOM) عبر AIX

## 1) الفكرة باختصار
هذه ليست مجرد SBOM مطوّرة؛ هذه طبقة رؤية موحّدة لسلسلة توريد الأنظمة الوكيلية. يمثّل Unified BOM منصة تكتشف وتربط تلقائياً بين تطبيقات SaaS المستخدمة، خدمات ونماذج الذكاء الاصطناعي (AI Models)، والوكلاء (Agents) المعرّفين بصيغة AIX. من خلال جعل AIX نقطة الارتكاز (Anchor Object)، ننتج BOM موحّد يُصدّر كحزمة جاهزة لالتزامات الامتثال مثل EU AI Act.

## 2) المشكلة
تكمن الفجوة الحالية في أن أدوات SBOM التقليدية لم تعد كافية وحدها، والمشكلة في السوق اليوم ليست نقص الأدوات، بل تشتت خرائط الاعتماد:
- **SaaS خارج الرؤية:** تعتمد الشركات بشدة على التطبيقات السحابية ولكنها تفتقر للرؤية الواضحة عن الخدمات المستخدمة أو الـ APIs المتصلة (Shadow SaaS).
- **AI assets غير موثقة جيداً:** الموديلات، مصادر البيانات، ومنصات الـ ML تعمل كصناديق سوداء وتتحرك في مسار منفصل عن أمان التطبيقات.
- **Agents تضيف طبقة تشغيل جديدة:** الأنظمة الوكيلية تخلق عقداً تقنية جديدة تجمع بين كود محلي، ونماذج ذكية، وتطبيقات خارجية، مما يتطلب تمثيلاً مستقلاً قادراً على توضيح هذه التعقيدات لفرق الأمان والامتثال.

## 3) ما الذي يقدمه AIX هنا
القيمة الحقيقية هنا أن AIX لا يوثّق الوكيل فقط، بل يصبح نقطة الربط المركزية (Anchor Object) بين SaaS وAI والبنية التحتية. يوفر AIX حلاً جذرياً عبر:
- **Agent Identity:** هوية فريدة وموثقة للوكيل (مربوطة بـ `did:axiom:axiomid.app:<id>`).
- **Dependency Mapping:** خريطة اعتماديات دقيقة تربط أدوات MCP، النماذج، والبيانات، بخدمات SaaS والسحابة.
- **Policy Attachment:** تضمين سياسات الأمان والاقتصاد في صميم المانيفست.
- **Traceability:** تتبع واضح لمسارات تدفق البيانات ومصدر النماذج.
- **Compliance Export:** دعم الجاهزية للامتثال عبر توفير حزمة أدلة (Evidence Package) ووثائق تقنية لجهات التدقيق.

## 4) نموذج البيانات
لتحقيق الرؤية الموحدة، تم توسيع نموذج AIX (Schema) لإدراج كتلة `unified_bom` التي تكمل مكوّنات `abom` وتوجهها بشكل صريح نحو الامتثال وإدارة المخاطر متعددة الطبقات.

```json
{
  "unified_bom": {
    "saas_refs": [
      "pkg:saas/github/github-actions@v3",
      "pkg:saas/hubspot/crm-api@v1"
    ],
    "ai_refs": [
      "pkg:huggingface/meta-llama/Llama-3-8b",
      "pkg:dataset/internal/customer-support-logs"
    ],
    "infra_refs": [
      "pkg:aws/lambda/agent-runner",
      "pkg:azure/cosmosdb/agent-memory"
    ],
    "risk_refs": [
      "risk:high-pii-exposure",
      "risk:external-llm-data-retention"
    ],
    "compliance_profiles": [
      "EU_AI_ACT_HIGH_RISK",
      "SOC2_TYPE_2"
    ],
    "export_artifacts": [
      "https://compliance.axiom.example/bundles/agent-123.zip"
    ]
  }
}
```

*ملاحظة التصميم: تم فصل `unified_bom` كقسم جديد ليكون أوضح لعمليات الامتثال والتقارير متعددة الطبقات، بدلاً من إثقال قسم `abom` الداخلي المرتبط بالمكونات التقنية المباشرة للوكيل.*

## 5) المكوّنات التقنية (Technical Design)
لبناء نظام يغذي هذا المانيفست آلياً، يتألف المعمار التقني من المكوّنات التالية:
- **Collectors (مجسات الاكتشاف):**
  - *SaaS Discoverer:* يقرأ الأكواد لاكتشاف استدعاءات SaaS APIs و الـ Webhooks، أو يتكامل مع أنظمة SSPM.
  - *AI/Model Discoverer:* يحلل المانيفست والأكواد لاستكشاف model providers، vector DBs، وdatasets.
  - *Agent/AIX Ingestor:* محرك يقرأ أي `.aix.json` في المستودع ويستخرج الحقول الحساسة (mcp, security, requirements).
- **Correlation Engine (محرّك الدمج):** يأخذ مخرجات الـ Collectors ويبني رسمة بيانية (Graph) تربط: `Agents ↔ SaaS ↔ Models ↔ Data ↔ Cloud Resources`.
- **Risk/Compliance Engine (محرّك المخاطر والامتثال):** يطبق قواعد الامتثال. (مثال: إذا كان الوكيل مصنفاً كـ High-Risk في EU AI Act، ويستخدم LLM خارجي، ويفتقر إلى `ai_refs` صالحة، يرفع إنذار Severity: High).
- **Exporter (وحدة التصدير):** نظام لتوليد حزم تقارير مدمجة (Compliance Bundles) جاهزة للمراجعة.
- **MCP Integration:** خوادم MCP توفر أدوات حية مثل `list_unified_bom(agent_id)` أو `export_compliance_bundle(agent_id, 'EU_AI_ACT')` لتمكين المطورين من استجواب حالة الامتثال مباشرة من الـ IDE.

## 6) حالات الاستخدام
- **رؤية موحدة لفرق الأمان (Security Visibility):** بدلاً من التنقل بين أدوات منفصلة، يضغط مدير الأمان زراً في لوحة التحكم فيرى الوكيل (Agent X)، والـ CRM الذي يقرأ منه (SaaS)، والـ LLM الخارجي الذي يحلل البيانات (AI)، ومكان الاستضافة (Infra).
- **وثائق EU AI Act الآلية (Technical Documentation):** عندما يطلب المدقق الخارجي تقرير الامتثال لوكيل يراجع العقود القانونية، يقوم النظام بتوليد AI-SBOM و SaaS-BOM مدمجين معاً بفضل الـ Anchor Object (AIX).
- **منع تسرب البيانات (Data Lineage & Drift):** اكتشاف أي استخدام لمكتبة SaaS أو نموذج جديد لم يُصرح به مسبقاً في `unified_bom` الخاص بالوكيل، ومنع تشغيله عبر الـ CI/CD Pipeline.

## 7) التنفيذ داخل الريبو (Implementation within `aix-format`)
هذا المنتج يترجم داخل مستودع `aix-format` من خلال:
- **Schema Updates:** توسيع `schemas/aix-enhanced.schema.json` ليشمل `unified_bom` ضمن المخطط الرئيسي للوكيل.
- **Examples:** إنشاء مانيفست متكامل (مثل `examples/agent-unified-bom.aix.json`) يوضح الهيكلية بدقة.
- **TypeScript Types:** إعادة توليد الأنواع (`npm run generate:types:unified`) ليعكس الـ Schema الجديد.
- **CI Validation:** دمج عمليات فحص Unified BOM في GitHub Actions لاكتشاف التغيرات الهيكلية (Schema Drift) وضمان سلامة الترابط.
