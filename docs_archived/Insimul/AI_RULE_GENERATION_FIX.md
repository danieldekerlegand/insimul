# AI Rule Generation and Translation Fix

## Issues Identified

1. **AI Generation Format Issues**: The AI was generating rules in Insimul format regardless of the selected system type (Ensemble, Kismet, Talk of the Town)
2. **Missing Translation Functionality**: The modern UI refactor removed the rule translation functionality that allowed converting rules between different engine formats

## Fixes Applied

### 1. Fixed AI Generation Prompts (`server/gemini-ai.ts`)

Updated both `generateRule()` and `generateBulkRules()` functions to use correct format examples:

#### Ensemble Format (JSON)
```json
{
  "triggerRules": {
    "fileName": "triggerRules",
    "type": "trigger",
    "rules": [
      {
        "name": "rule_name",
        "conditions": [
          {
            "category": "relationship",
            "type": "parent_of",
            "first": "?x",
            "second": "?y"
          }
        ],
        "effects": [
          {
            "category": "status",
            "type": "inherit_title",
            "first": "?y",
            "value": true
          }
        ]
      }
    ]
  }
}
```

#### Kismet Format (Prolog)
```prolog
default trait trait_name(>Self, <Other):
  +++condition1,
  +++condition2.
  likelihood: 0.8
```

#### Talk of the Town Format (JSON)
```json
{
  "trigger_rules": [
    {
      "name": "rule_name",
      "type": "trigger",
      "priority": 5,
      "conditions": [
        {
          "type": "predicate",
          "predicate": "is_married",
          "first": "?person"
        }
      ],
      "effects": [
        {
          "type": "set",
          "target": "?person",
          "action": "relationship_status",
          "value": "married"
        }
      ],
      "tags": ["marriage", "relationship"],
      "active": true
    }
  ]
}
```

### 2. Rule Translation Infrastructure (Already Exists)

The codebase already has complete translation infrastructure:

- **`client/src/lib/unified-syntax.ts`**: `InsimulRuleCompiler` class that can parse rules from any format
- **`client/src/lib/rule-exporter.ts`**: `RuleExporter` class that can export to any format
- **Supported conversions**:
  - Insimul ↔ Ensemble
  - Insimul ↔ Kismet
  - Insimul ↔ Talk of the Town
  - Ensemble ↔ Kismet
  - Any format ↔ Any format (via Insimul intermediate representation)

### 3. Translation Functionality Status

**Old Editor** (`pages/editor.tsx`):
- ✅ Automatic format conversion when changing system type dropdown
- ✅ Round-robin translation tests (Insimul → Ensemble → Insimul, etc.)
- ✅ Uses `RuleExporter.exportToFormat()` method

**Modern UI** (`components/HierarchicalRulesTab.tsx`):
- ❌ No translation functionality
- ❌ Cannot convert rules between formats
- ❌ Only shows systemType, doesn't allow changing it

## Recommended Next Steps

### Option 1: Add Translation to Rule Detail View
Add a "Convert to..." dropdown in the HierarchicalRulesTab detail view that allows translating a rule to a different format.

### Option 2: Bulk Translation Dialog
Create a dialog that allows selecting multiple rules and converting them all to a target format at once.

### Option 3: Restore Old Editor Auto-Conversion
Add automatic format conversion when editing a rule's systemType field.

## Testing AI Generation

To test the fixed AI generation:

1. Open the modern UI
2. Navigate to Rules tab
3. Click "Create Rule"
4. Select system type (Ensemble, Kismet, or TotT)
5. Use AI Generator tab
6. Enter a prompt like "Create a rule for noble succession"
7. Verify the generated rule is in the correct format for the selected system

## Translation Usage Examples

```typescript
import { InsimulRuleCompiler } from '@/lib/unified-syntax';
import { RuleExporter } from '@/lib/rule-exporter';

const compiler = new InsimulRuleCompiler();
const exporter = new RuleExporter();

// Parse rules from Ensemble JSON
const ensembleRules = compiler.compile(ensembleJsonString, 'ensemble');

// Convert to Kismet Prolog
const kismetContent = exporter.exportToFormat(ensembleRules, 'kismet', false, []);

// Parse Kismet back
const kismetRules = compiler.compile(kismetContent, 'kismet');

// Convert to Talk of the Town JSON
const tottContent = exporter.exportToFormat(kismetRules, 'tott', false, []);
```

## Format Documentation

### Ensemble
- **File Types**: `triggerRules.json`, `volitionRules.json`, `actions.json`
- **Structure**: JSON with `conditions` and `effects` arrays
- **Variables**: Use `?x`, `?y` syntax
- **Categories**: `relationship`, `status`, `trait`, `event`

### Kismet
- **Syntax**: Prolog-style with `default trait` and `pattern` definitions
- **Variables**: Use `>Self`, `<Other`, `?x` syntax
- **Operators**: `+++` (must be true), `---` (must be false)
- **Likelihood**: Float value 0.0-1.0

### Talk of the Town
- **Structure**: JSON with categorized rule sections
- **Rule Types**: `trigger_rules`, `genealogy_rules`, `character_rules`
- **Python Integration**: Can export to Python class format
- **Predicates**: Event-based system with person/place/time contexts

## Related Files

- `server/gemini-ai.ts` - AI generation prompts (FIXED)
- `client/src/lib/unified-syntax.ts` - Rule compiler/parser
- `client/src/lib/rule-exporter.ts` - Rule format exporter
- `client/src/components/HierarchicalRulesTab.tsx` - Modern rules UI (needs translation)
- `client/src/pages/editor.tsx` - Old editor with working translation
- `client/src/components/ExportDialog.tsx` - Bulk export to formats
