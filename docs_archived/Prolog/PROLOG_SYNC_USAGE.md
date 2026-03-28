# Prolog Sync Service - Usage Guide

## Overview

The **PrologSyncService** synchronizes Insimul database data (MongoDB/PostgreSQL) to the Prolog knowledge base, ensuring a 1:1 correspondence between Insimul entities and Prolog facts.

## Features

✅ **Character Synchronization** - Converts characters to Prolog facts  
✅ **Relationship Mapping** - Family, spouse, and friend relationships  
✅ **Location Tracking** - Settlements and character locations  
✅ **Business Data** - Business ownership and types  
✅ **Helper Rules** - Automatically adds common inference rules  
✅ **Clean Format** - Prolog-compatible atom names and escaped strings

## Quick Start

### 1. Access Prolog Tab

Navigate to: **Truth → Prolog Knowledge Base**

### 2. Sync Your World

Click the **"Sync from DB"** button to synchronize your world data to Prolog.

### 3. Query the Knowledge Base

Use standard Prolog queries to explore your world:

```prolog
% Find all people
?- person(X).

% Find married couples
?- married_to(X, Y).

% Find parents and children
?- parent_of(Parent, Child).

% Find siblings
?- sibling_of(X, Y).

% Find people at a location
?- at_location(Person, Location).
```

## Synced Data

### Characters → Prolog Facts

Each character generates multiple facts:

```prolog
person(john_smith_abc123).
first_name(john_smith_abc123, 'John').
last_name(john_smith_abc123, 'Smith').
full_name(john_smith_abc123, 'John Smith').
gender(john_smith_abc123, male).
birth_year(john_smith_abc123, 1990).
age(john_smith_abc123, 35).
alive(john_smith_abc123).
occupation(john_smith_abc123, blacksmith).
at_location(john_smith_abc123, castle).
```

### Relationships → Prolog Facts

```prolog
% Marriage
married_to(john_smith_abc123, jane_doe_def456).
spouse_of(john_smith_abc123, jane_doe_def456).

% Family
parent_of(john_smith_abc123, mary_smith_ghi789).
child_of(mary_smith_ghi789, john_smith_abc123).

% Friends
friend_of(john_smith_abc123, bob_jones_jkl012).
```

### Locations → Prolog Facts

```prolog
settlement(castle).
settlement_name(castle, 'Castle').
settlement_type(castle, city).
population(castle, 50000).
```

### Businesses → Prolog Facts

```prolog
business(blacksmith_shop).
business_name(blacksmith_shop, 'Blacksmith Shop').
business_type(blacksmith_shop, crafting).
owns(john_smith_abc123, blacksmith_shop).
business_owner(blacksmith_shop, john_smith_abc123).
```

## Helper Rules

The sync automatically adds inference rules:

### Family Relationships

```prolog
% Siblings share at least one parent
sibling_of(X, Y) :- parent_of(P, X), parent_of(P, Y), X \= Y.

% Grandparents
grandparent_of(GP, GC) :- parent_of(GP, P), parent_of(P, GC).

% Ancestors (transitive)
ancestor_of(A, D) :- parent_of(A, D).
ancestor_of(A, D) :- parent_of(A, X), ancestor_of(X, D).
```

### Status Predicates

```prolog
% Unmarried people
unmarried(X) :- person(X), \+ married_to(X, _).

% People at same location
same_location(X, Y) :- at_location(X, L), at_location(Y, L), X \= Y.

% Eldest child in family
eldest_child(X) :- person(X), parent_of(P, X), birth_year(X, BY), 
    \+ (parent_of(P, Y), birth_year(Y, BY2), BY2 < BY).

% Adults and children
adult(X) :- age(X, A), A >= 18.
child(X) :- age(X, A), A < 18.
```

## Example Queries

### Find All Nobles

```prolog
?- person(X), occupation(X, noble).
```

### Find Potential Marriage Partners

```prolog
?- person(X), person(Y), X \= Y, 
   unmarried(X), unmarried(Y), 
   adult(X), adult(Y),
   same_location(X, Y).
```

### Find All Ancestors of a Person

```prolog
?- ancestor_of(Ancestor, john_smith_abc123).
```

### Find Business Owners

```prolog
?- owns(Owner, Business), business_type(Business, crafting).
```

### Find Family Trees

```prolog
?- parent_of(Parent, Child), 
   parent_of(Grandparent, Parent).
```

## API Usage

### Trigger Sync via API

```bash
curl -X POST http://localhost:5001/api/prolog/sync \
  -H "Content-Type: application/json" \
  -d '{"worldId": "your-world-id"}'
```

Response:

```json
{
  "status": "success",
  "message": "World synced to Prolog knowledge base",
  "factsCount": 1234
}
```

### Programmatic Usage

```typescript
import { createPrologSyncService } from './server/prolog-sync';
import { PrologManager } from './server/prolog-manager';
import { storage } from './server/storage';

// Create instances
const prologManager = new PrologManager('kb.pl', worldId);
await prologManager.initialize();

const syncService = createPrologSyncService(storage, prologManager);

// Sync world
await syncService.syncWorldToProlog(worldId);

// Query
const results = await prologManager.query('person(X)');
console.log(results);
```

## Advanced Usage

### Custom Rules

Add your own rules to extend the knowledge base:

```prolog
% Noble succession rule
can_inherit(Child, Title) :- 
    parent_of(Parent, Child),
    occupation(Parent, noble),
    eldest_child(Child),
    alive(Child).

% Marriage eligibility
eligible_for_marriage(X) :-
    person(X),
    unmarried(X),
    adult(X),
    alive(X).
```

### Batch Queries

Execute multiple queries programmatically:

```typescript
const queries = [
  'person(X), occupation(X, noble)',
  'married_to(X, Y)',
  'sibling_of(X, Y)'
];

for (const query of queries) {
  const results = await prologManager.query(query);
  console.log(`${query}:`, results);
}
```

### Export Knowledge Base

Download your Prolog knowledge base as a `.pl` file:

1. Click "Export" button in Prolog tab
2. File is saved as `knowledge_base_{worldId}.pl`
3. Can be loaded into SWI-Prolog directly

## Integration with Simulations

### Auto-Sync on Simulation Start

The sync service can be called automatically when starting a simulation:

```typescript
// In simulation engine
async runSimulation(worldId: string) {
  // Sync to Prolog before running
  await this.syncToPrologManager.syncWorldToProlog(worldId);
  
  // Run simulation logic...
  await this.executeRules();
}
```

### Use Prolog for Rule Reasoning

```typescript
// Query Prolog for rule conditions
const canInherit = await prologManager.query(
  `can_inherit(${childId}, title)`
);

if (canInherit.length > 0) {
  // Apply inheritance effect
  await this.applyInheritance(childId);
}
```

## Troubleshooting

### Issue: "SWI Prolog not available"

**Solution**: Install SWI-Prolog:

```bash
# macOS
brew install swi-prolog

# Ubuntu/Debian
apt-get install swi-prolog

# Windows
# Download from https://www.swi-prolog.org/download/stable
```

### Issue: "Invalid Prolog syntax"

**Solution**: Check that facts/rules end with a period and use valid Prolog syntax.

### Issue: "No facts synced"

**Solution**: 
1. Ensure world has characters and data
2. Check console for sync errors
3. Verify worldId is correct

### Issue: "Query returns no results"

**Solution**:
1. Click "Refresh Facts" to reload
2. Verify facts exist with: `?- person(X).`
3. Check variable names match (case-sensitive)

## Performance Considerations

- **Sync Time**: ~1-2 seconds for 100 characters
- **Fact Count**: ~10-15 facts per character
- **Query Speed**: Milliseconds for simple queries
- **Memory**: ~1KB per character in Prolog format

## Best Practices

1. **Sync Before Querying**: Always sync after database changes
2. **Use Helper Rules**: Leverage built-in inference rules
3. **Export Regularly**: Backup knowledge base before clearing
4. **Test Queries**: Test in Prolog tab before using in code
5. **Clear When Needed**: Clear and re-sync if data gets out of sync

## Next Steps

- **Phase 2**: Auto-sync on simulation start
- **Phase 3**: Use Prolog for rule execution in simulations
- **Phase 4**: Add more inference rules (noble succession, etc.)
- **Phase 5**: Visualization of Prolog reasoning process

## Related Files

- `server/prolog-sync.ts` - Sync service implementation
- `server/prolog-manager.ts` - Prolog knowledge base manager
- `server/routes.ts` - API endpoint: `/api/prolog/sync`
- `client/src/components/PrologKnowledgeBase.tsx` - UI component
- `PROLOG_INTEGRATION_ANALYSIS.md` - Integration strategy

## Resources

- [SWI-Prolog Documentation](https://www.swi-prolog.org/pldoc/doc_for?object=manual)
- [Prolog Tutorial](https://www.tutorialspoint.com/prolog/index.htm)
- [Logic Programming Basics](https://en.wikipedia.org/wiki/Logic_programming)
