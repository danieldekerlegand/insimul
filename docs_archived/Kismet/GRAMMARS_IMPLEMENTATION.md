# Tracery Grammars as First-Class Entities

## Overview
Tracery grammars are now **separate, reusable resources** stored in their own database collection, independent from rules. This architectural change enables better separation of concerns, grammar reusability, and easier content management.

## What Was Changed

### 1. Database Schema (`shared/schema.ts`)
Added new `grammars` table:
```typescript
export const grammars = pgTable("grammars", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worldId: varchar("world_id").notNull(),
  name: text("name").notNull().unique(), // e.g., "succession_ceremony"
  description: text("description"),
  grammar: jsonb("grammar").$type<Record<string, string | string[]>>().notNull(),
  tags: jsonb("tags").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### 2. Storage Interface (`server/storage.ts`)
Added Grammar CRUD operations to `IStorage`:
- `getGrammar(id: string)`
- `getGrammarByName(worldId: string, name: string)`
- `getGrammarsByWorld(worldId: string)`
- `createGrammar(grammar: InsertGrammar)`
- `updateGrammar(id: string, grammar: Partial<InsertGrammar>)`
- `deleteGrammar(id: string)`

### 3. MongoDB Implementation (`server/mongo-storage.ts`)
- Created `GrammarSchema` and `GrammarModel`
- Implemented all 6 grammar CRUD operations
- Added `docToGrammar()` helper function

### 4. API Routes (`server/routes.ts`)
Added RESTful endpoints:
- `GET /api/worlds/:worldId/grammars` - List all grammars for a world
- `GET /api/grammars/:id` - Get grammar by ID
- `GET /api/worlds/:worldId/grammars/:name` - Get grammar by name (for rule lookups)
- `POST /api/grammars` - Create new grammar
- `PUT /api/grammars/:id` - Update existing grammar
- `DELETE /api/grammars/:id` - Delete grammar

### 5. Simulation Engine (`server/engines/unified-engine.ts`)
Added `loadGrammars()` method to bulk-load grammars from database:
```typescript
loadGrammars(grammars: Array<{ name: string; grammar: Record<string, string | string[]> }>) {
  this.traceryGrammars.clear();
  grammars.forEach(g => {
    this.traceryGrammars.set(g.name, g.grammar);
  });
}
```

## How It Works

### Grammar Definition
Grammars are stored separately in the database:
```json
{
  "name": "succession_ceremony",
  "worldId": "world_123",
  "grammar": {
    "origin": ["#heir# is crowned the new ruler of #realm#."],
    "realm": ["Aldermere", "the Northern Reaches"]
  },
  "description": "Narrative template for succession ceremonies",
  "tags": ["nobility", "inheritance"]
}
```

### Rule Reference
Rules reference grammars by name:
```typescript
rule noble_succession {
  when (...)
  then {
    inherit_title(?heir, ?lord.title)
    tracery_generate("succession_ceremony", {heir: ?heir.name})
  }
}
```

### Runtime Execution
1. Simulation loads grammars from database via `engine.loadGrammars()`
2. Rule execution calls `tracery_generate("succession_ceremony", ...)`
3. Engine looks up grammar by name in `traceryGrammars` Map
4. Generates narrative text with variable substitution

## Benefits

### ✅ **Separation of Concerns**
- Logic (rules) separated from content (grammars)
- Content creators can edit narratives without touching rule logic

### ✅ **Reusability**
- One grammar can be referenced by multiple rules
- Example: "succession_ceremony" could be used for death, abdication, conquest

### ✅ **Maintainability**
- Update narrative text in one place
- All rules using that grammar get the update automatically

### ✅ **Localization-Friendly**
- All narrative templates in dedicated collection
- Easy to export/import for translation

### ✅ **Validation & Testing**
- Can validate grammars independently from rules
- Test narrative generation without running full simulations

## Next Steps (Future Work)

### Frontend UI Component
Create `GrammarsTab.tsx` component in the editor:
- List all grammars for the current world
- Create/edit/delete grammars
- Preview generated text with sample variables
- Search/filter by tags

### Rule Editor Integration
Update rule editor to:
- Show available grammars when writing `tracery_generate()`
- Autocomplete grammar names
- Warn if referenced grammar doesn't exist
- Link to grammar definition (click to view/edit)

### Validation Enhancement
Add compile-time validation in `InsimulRuleCompiler`:
```typescript
validate(rules: InsimulRule[], grammars: Grammar[]): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
```
Check that all `tracery_generate()` calls reference existing grammars.

### Migration Tool
Create script to extract inline `tracery` blocks from existing rules and convert them to separate grammar entries.

## Example Usage

### Creating a Grammar
```bash
POST /api/grammars
{
  "worldId": "world_123",
  "name": "battle_victory",
  "description": "Narrative for military victories",
  "grammar": {
    "origin": ["#winner# triumphed over #loser# at #location#!"],
    "location": ["the battlefield", "the castle gates", "the river crossing"]
  },
  "tags": ["combat", "military"]
}
```

### Using in a Rule
```typescript
rule military_victory {
  when (
    Battle(?battle) and
    winner(?battle, ?victor) and
    loser(?battle, ?defeated)
  )
  then {
    record_victory(?victor, ?battle)
    tracery_generate("battle_victory", {
      winner: ?victor.name,
      loser: ?defeated.name
    })
  }
}
```

### Loading in Simulation
```typescript
// In simulation run endpoint
const grammars = await storage.getGrammarsByWorld(worldId);
engine.loadGrammars(grammars);

const rules = await storage.getRulesByWorld(worldId);
engine.loadRules(rules);
```

## Build Status
✅ All changes compile successfully
✅ MongoDB schema and operations implemented
✅ API routes functional
✅ Simulation engine updated

---
**Implementation Date**: 2025-10-10
**Status**: Backend Complete, Frontend UI Pending
