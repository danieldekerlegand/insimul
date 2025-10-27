# Proper Kismet Integration into Insimul

## What Was Wrong

The initial Kismet "integration" created a parallel system with:
- Separate storage fields (`kismetImpulses`, `kismetRelationships`)
- Duplicate managers and routers
- Isolated from the existing rule system
- Redundant APIs when similar functionality already existed

## What We Fixed

Removed the parallel system and properly integrated Kismet features as **extensions** to the existing Insimul infrastructure:

### 1. Impulses → Character's `mentalModels` Field

Instead of creating `socialAttributes.kismetImpulses`, we use the existing `mentalModels` field:

```javascript
character.mentalModels = {
  impulses: {
    "romantic:alice": { type: "romantic", target: "alice", strength: 0.8, decay: 0.05, timestamp: ... },
    "aggressive": { type: "aggressive", strength: 0.3, decay: 0.1, timestamp: ... }
  },
  beliefs: { ... }  // Other mental model data
}
```

### 2. Relationships → Character's `relationships` Field

Instead of creating `socialAttributes.kismetRelationships`, we use the existing `relationships` field:

```javascript
character.relationships = {
  "bob": { 
    type: "romantic", 
    strength: 0.8,        // My feelings toward Bob
    reciprocal: 0.3,      // Bob's feelings toward me
    lastModified: ...
  }
}
```

### 3. Volitions → Enhanced Rule System

Instead of a separate volition system, we enhance the existing rule system:
- Volition rules are just rules with `ruleType: "volition"`
- Use existing condition system with new predicates (`impulse`, `relationship`)
- Weighted selection uses the existing `priority` field

### 4. Directional Operators → Already Parsed!

The `unified-syntax.ts` already handles `>Self` and `<Other` - we just needed to use it:
```javascript
// This was already supported in the parser!
condition: {
  type: 'predicate',
  predicate: 'relationship',
  first: '>Self',  // Already parsed correctly
  second: 'otherId',
  value: { type: 'romantic', strength: 0.5 }
}
```

## New API Endpoints (Minimal, Integrated)

Instead of 17+ new Kismet endpoints, we added just 3 extensions to existing character endpoints:

```bash
POST /api/characters/:id/impulse       # Add/update impulse
POST /api/characters/:id/relationship  # Set relationship  
GET  /api/characters/:id/select-action # Select volition
```

## File Structure

```
server/
  extensions/              # Extensions to existing system
    impulse-system.ts      # Impulse utilities (120 lines)
    relationship-utils.ts  # Relationship utilities (180 lines)
    volition-system.ts     # Volition selection (190 lines)
  routes.ts               # Added 3 endpoints to existing routes
```

Total: ~500 lines instead of ~3000+ lines of parallel system

## How It Works Now

### Example: Character with Romantic Impulse

1. **Add impulse** (stores in existing `mentalModels` field):
```javascript
await addImpulse('alice', 'romantic', 0.8, 'bob');
```

2. **Create volition rule** (normal rule with conditions):
```javascript
{
  worldId: 'world1',
  name: 'confess_love',
  ruleType: 'volition',
  conditions: [
    { 
      type: 'predicate',
      predicate: 'impulse',
      value: { type: 'romantic', strength: 0.7 }
    }
  ],
  effects: [
    { type: 'create_relationship', target: 'bob', action: 'confess' }
  ]
}
```

3. **Select action** (uses existing rule system):
```javascript
const action = await selectVolition('alice', 'world1');
// Returns the 'confess_love' rule if conditions are met
```

## Benefits of Proper Integration

1. **No Duplication**: Uses existing database fields
2. **Consistent API**: Extends character endpoints instead of creating new namespace
3. **Unified System**: Impulses and relationships work with existing rules
4. **Smaller Codebase**: ~500 lines vs ~3000+ lines
5. **Better Maintainability**: Extensions instead of parallel systems
6. **Already Compatible**: Works with existing import/export and UI

## Key Insight

Insimul already had the infrastructure for these features:
- JSONB fields that can store any structure
- A flexible rule system with conditions and effects
- Unified syntax parser that handles directional operators
- Character storage with relationship tracking

The Kismet features just needed to be **used within** the existing system, not **built alongside** it.
