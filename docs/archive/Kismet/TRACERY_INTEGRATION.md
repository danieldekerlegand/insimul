# Tracery Integration for Insimul

## Overview

This document describes the complete Tracery grammar integration for the Insimul procedural narrative engine. Tracery grammars have been successfully integrated to provide procedural text generation capabilities similar to the Kismet engine.

## Architecture

### Components

1. **TraceryService** (`server/tracery-service.ts`)
   - Wraps the `tracery-grammar` library
   - Provides grammar expansion with variable substitution
   - Includes validation and testing utilities
   - Supports base English modifiers (capitalize, a, s, ed, etc.)

2. **Unified Simulation Engine** (`server/engines/unified-engine.ts`)
   - Central simulation engine that handles rule execution
   - Integrates Tracery grammar expansion
   - Supports both Prolog and JavaScript execution modes
   - Manages simulation context and state

3. **Seed Grammars** (`server/seed-grammars.ts`)
   - Pre-built grammar libraries ported from Kismet
   - Includes 6 ready-to-use grammars for various themes
   - Automatically seeded when creating new worlds

4. **Database Integration**
   - Grammars stored as first-class database entities
   - Full CRUD API via `/api/grammars` endpoints
   - Per-world scoping for multi-world support

## Tracery Features Implemented

### ✅ Fully Implemented

- **Grammar Storage**: Database-backed with full CRUD operations
- **Grammar Expansion**: Complete Tracery rule expansion via `grammar.flatten()`
- **Variable Substitution**: Pass variables to grammars via `tracery_generate()`
- **Base English Modifiers**: All standard modifiers (capitalize, a, s, ed, etc.)
- **Nested Rules**: Support for recursive grammar rules
- **Rule-Grammar Integration**: Rules can trigger grammar expansion via effects
- **Name Generation**: Pre-built grammars for various naming schemes
- **Narrative Generation**: Template-based story generation

### Comparison with Kismet

| Feature | Kismet | Insimul | Status |
|---------|--------|---------|--------|
| Grammar Storage | JSON files | Database (MongoDB/PostgreSQL) | ✅ Better |
| Grammar Loading | File-based | API-based CRUD | ✅ Better |
| Base English Modifiers | ✅ | ✅ | ✅ Equal |
| .capitalize modifier | ✅ | ✅ | ✅ Equal |
| Grammar Expansion | ✅ | ✅ | ✅ Equal |
| Bracket notation | ✅ `[a|b]` | N/A (uses Tracery syntax) | Different |
| Variable substitution | Before expansion | During expansion | ✅ Better |
| Pre-built grammars | 4 files | 6 grammars | ✅ Better |
| Multi-user support | ❌ | ✅ | ✅ Better |
| Reusability | Per-file | Per-world | ✅ Better |

**Verdict**: ✅ **Insimul implements all Tracery features from Kismet**, plus additional capabilities.

## Available Seed Grammars

Six pre-built Tracery grammars are automatically seeded for each world:

1. **barbarian_names** - Syllable-based barbarian name generation
   - Example: "Ragkin Dorkul", "Nanhulsul of Sulnorhun"

2. **fantasy_names** - Fantasy names with weather and color themes
   - Example: "Storm Viridian", "Thunder Moonwalker"

3. **fantasy_towns** - Fantasy settlement names
   - Example: "Eagrose", "Dortaria", "Lindblum"

4. **edwardian_names** - Historical Edwardian-era names
   - Example: "Beatrice Chesterton", "Alaric Wimplefield"

5. **american_names** - Contemporary American names
   - Example: "James Smith", "Jennifer Garcia"

6. **succession_ceremony** - Example narrative template
   - Example: "Princess Elara is crowned the new ruler of Aldermere. The ceremony is grand and solemn."

## Usage in Rules

### Basic Syntax

Rules can generate narrative text using the `tracery_generate()` function:

```
rule succession_event {
  when {
    Character(?heir) and
    dies(?lord) and
    parent_of(?lord, ?heir)
  }
  then {
    inherit_title(?heir)
    tracery_generate("succession_ceremony", {heir: ?heir.name})
  }
}
```

### How It Works

1. **Rule fires** when conditions match
2. **Effect created** with type `generate_text`
3. **Grammar lookup** via `storage.getGrammarByName(worldId, "succession_ceremony")`
4. **Variable injection** - `{heir: "Princess Elara"}` merged into grammar
5. **Tracery expansion** - Grammar rules expanded with variables
6. **Narrative output** - Result added to simulation narratives

### Effect Structure

When parsed, the `tracery_generate()` call becomes:

```typescript
{
  type: 'generate_text',
  target: 'narrative',
  action: 'generate',
  traceryTemplate: 'succession_ceremony',
  variables: { heir: '?heir.name' }
}
```

## API Endpoints

### Grammar Management

```
GET    /api/worlds/:worldId/grammars       List all grammars for a world
GET    /api/grammars/:id                   Get grammar by ID
GET    /api/worlds/:worldId/grammars/:name Get grammar by name
POST   /api/grammars                       Create new grammar
PUT    /api/grammars/:id                   Update grammar
DELETE /api/grammars/:id                   Delete grammar
```

### Example: Create Grammar

```bash
POST /api/grammars
Content-Type: application/json

{
  "worldId": "world_123",
  "name": "battle_descriptions",
  "description": "Combat narrative generation",
  "grammar": {
    "origin": ["#attacker# strikes #defender# with #weapon#!"],
    "weapon": ["sword", "axe", "spear", "dagger"],
    "attacker": ["The warrior", "The knight", "The hero"],
    "defender": ["the enemy", "the foe", "the villain"]
  },
  "tags": ["combat", "narrative"],
  "isActive": true
}
```

## TraceryService API

### Expand Grammar

```typescript
import { TraceryService } from './server/tracery-service';

const grammar = {
  origin: ["#name# the #adjective#"],
  name: ["Alice", "Bob", "Charlie"],
  adjective: ["Brave", "Wise", "Swift"]
};

const result = TraceryService.expand(grammar);
// Output: "Bob the Wise"
```

### Expand with Variables

```typescript
const grammar = {
  origin: ["#hero# defeated #villain#!"],
  villain: ["the dragon", "the demon", "the tyrant"]
};

const variables = { hero: "Sir Lancelot" };
const result = TraceryService.expand(grammar, variables);
// Output: "Sir Lancelot defeated the dragon!"
```

### Validate Grammar

```typescript
try {
  TraceryService.validate(grammar);
  console.log('Grammar is valid');
} catch (error) {
  console.error('Invalid grammar:', error.message);
}
```

### Test Multiple Variations

```typescript
const results = TraceryService.test(grammar, variables, 5);
// Returns array of 5 different expansions
```

## Execution Flow

### Prolog Execution vs. Tracery Execution

**Important Clarification**: Prolog and Tracery are **independent systems** that work together:

- **Prolog Engine**: Handles logical inference and rule matching
  - Located in `server/prolog-manager.ts`
  - Executes via SWI Prolog interpreter (`swipl`)
  - Used when `executionEngine === "prolog"`

- **Tracery Engine**: Handles narrative text generation
  - Located in `server/tracery-service.ts`
  - Expands grammars into narrative text
  - Triggered by `generate_text` effects from rules

### Simulation Flow

```
1. User runs simulation
   ↓
2. Unified engine loads rules and grammars
   ↓
3. Rules execute (Prolog or JavaScript)
   ↓
4. Rule fires → Creates effects
   ↓
5. Effect type: generate_text
   ↓
6. Look up grammar by name
   ↓
7. TraceryService.expand(grammar, variables)
   ↓
8. Add narrative to simulation output
   ↓
9. Return results to client
```

## Database Schema

```typescript
grammars {
  id: string (UUID)
  worldId: string (foreign key)
  name: string (unique per world)
  description: string
  grammar: jsonb (Tracery grammar object)
  tags: string[]
  isActive: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

## Testing

### Run Tracery Tests

```bash
cd insimul
npx tsx server/test-tracery.ts
```

This will test:
- Basic grammar expansion
- Variable substitution
- Modifier support (.capitalize)
- Name generation
- Grammar validation
- Multiple iterations

### Expected Output

```
=== Tracery Integration Test ===

Test 1: Basic Grammar Expansion
--------------------------------
  1. Hello, World!
  2. Hello, Tracery!
  3. Hello, Universe!

[... more tests ...]

Summary:
  - 6 seed grammars available
  - Basic expansion: ✓
  - Variable substitution: ✓
  - Modifiers (.capitalize): ✓
  - Name generation: ✓
  - Validation: ✓
  - Multiple iterations: ✓
```

## Database Seeding

Grammars are automatically seeded when creating a new world:

```bash
npm run db:reset  # Reset database
npm run db:seed   # Seed with sample world + grammars
```

Or programmatically:

```typescript
import { MongoSimpleInitializer } from './server/database/mongo-init-simple';

const initializer = new MongoSimpleInitializer();
await initializer.seedSampleWorld(); // Includes grammars
```

## Example Integration

### Create a Custom Grammar

```typescript
// In your world setup
const customGrammar = {
  worldId: worldId,
  name: "weather_descriptions",
  description: "Dynamic weather narrative",
  grammar: {
    origin: ["The weather is #condition# and #temperature#."],
    condition: ["clear", "cloudy", "rainy", "stormy", "foggy"],
    temperature: ["warm", "cool", "cold", "hot", "mild"]
  },
  tags: ["weather", "environment"],
  isActive: true
};

await storage.createGrammar(customGrammar);
```

### Use in a Rule

```typescript
const weatherRule = {
  worldId: worldId,
  name: "daily_weather",
  content: `
    rule daily_weather {
      when { time_of_day(?time) and ?time == "dawn" }
      then { tracery_generate("weather_descriptions", {}) }
    }
  `,
  systemType: "insimul",
  ruleType: "trigger",
  priority: 5,
  enabled: true,
  parsedContent: {
    effects: [{
      type: 'generate_text',
      traceryTemplate: 'weather_descriptions',
      variables: {}
    }]
  }
};

await storage.createRule(weatherRule);
```

## File Structure

```
insimul/
├── server/
│   ├── tracery-service.ts          # Tracery wrapper service
│   ├── seed-grammars.ts            # Pre-built grammars from Kismet
│   ├── test-tracery.ts             # Test suite
│   ├── example-tracery-rule.ts     # Example rules using Tracery
│   ├── engines/
│   │   └── unified-engine.ts       # Simulation engine with Tracery
│   ├── database/
│   │   └── mongo-init-simple.ts    # Includes grammar seeding
│   └── routes.ts                   # Updated with unified engine
└── shared/
    └── schema.ts                   # Grammar database schema
```

## Key Improvements Over Kismet

1. **Database-Backed**: Grammars stored in database, not files
2. **Multi-User**: Per-world grammars with isolation
3. **Dynamic**: Create/update grammars via API at runtime
4. **Reusable**: One grammar shared by multiple rules
5. **Validated**: Built-in validation and error handling
6. **Scalable**: Supports unlimited grammars per world
7. **Versioned**: Track creation/update timestamps

## Migration from Kismet

To port Kismet `.tracery` files:

1. Read JSON file:
   ```typescript
   const grammar = JSON.parse(fs.readFileSync('fantasy.tracery', 'utf-8'));
   ```

2. Create in Insimul:
   ```typescript
   await storage.createGrammar({
     worldId: worldId,
     name: 'fantasy_names',
     description: 'Fantasy name generation',
     grammar: grammar,
     tags: ['names', 'fantasy'],
     isActive: true
   });
   ```

3. Reference in rules:
   ```
   tracery_generate("fantasy_names", {})
   ```

## Troubleshooting

### Grammar Not Found

```
Error: Grammar "succession_ceremony" not found
```

**Solution**: Ensure grammar exists for the world:
```typescript
const grammars = await storage.getGrammarsByWorld(worldId);
console.log('Available grammars:', grammars.map(g => g.name));
```

### Variable Not Substituted

```
Output: "#heir# is crowned" (instead of "Princess Elara is crowned")
```

**Solution**: Check that variables are properly passed:
```typescript
// Correct
tracery_generate("succession_ceremony", {heir: "Princess Elara"})

// Incorrect
tracery_generate("succession_ceremony", {})
```

### Modifier Not Working

```
Output: "cat" (instead of "Cat")
```

**Solution**: Ensure modifier syntax is correct:
```typescript
// Correct
{ animal: ["#word.capitalize#"] }

// Incorrect
{ animal: ["#word#.capitalize"] }
```

## Future Enhancements

Potential additions:

1. **Custom Modifiers**: Allow users to define custom text transformations
2. **Grammar Versioning**: Track grammar changes over time
3. **Grammar Import/Export**: Share grammars between worlds
4. **Visual Grammar Editor**: UI for creating grammars without JSON
5. **Grammar Templates**: Pre-built templates for common narrative types
6. **A/B Testing**: Compare different grammar variations
7. **Analytics**: Track which grammars are most used
8. **Conditional Rules**: Grammars that change based on world state

## Conclusion

Tracery integration in Insimul is **complete and fully functional**. All features from Kismet have been implemented, with additional improvements for multi-user, database-backed operation. The system is ready for production use with:

- ✅ Grammar expansion
- ✅ Variable substitution
- ✅ Modifier support
- ✅ Pre-built libraries
- ✅ Database persistence
- ✅ API endpoints
- ✅ Rule integration
- ✅ Comprehensive testing

The integration provides a powerful procedural narrative generation system that can create rich, varied text output for simulations and interactive storytelling.
