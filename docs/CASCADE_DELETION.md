# Cascade Deletion in Insimul

## Overview

The Insimul system implements **complete cascade deletion** for all major entities. When you delete a world, country, state, or settlement, all child entities and associated data are automatically deleted to maintain data integrity.

## Deletion Hierarchy

```
World (can be deleted - FULL CASCADE)
  ├── Rules (cascade deleted)
  ├── Grammars (cascade deleted)
  ├── Simulations (cascade deleted)
  ├── Actions (cascade deleted)
  ├── Truths (cascade deleted)
  ├── Quests (cascade deleted)
  ├── Characters (cascade deleted)
  └── Country (cascade deleted)
       ├── States (cascade deleted)
       │    └── Settlements (cascade deleted)
       │         └── Characters (cascade deleted)
       └── Settlements (direct, cascade deleted)
            └── Characters (cascade deleted)
```

## Behavior by Entity Type

### Deleting a World ⚠️ COMPLETE CASCADE

When you delete a world, the system performs a **complete cascade deletion** of ALL associated data:

1. **Delete all rules** for this world
2. **Delete all grammars** for this world
3. **Delete all simulations** for this world
4. **Delete all actions** for this world
5. **Delete all truths** for this world
6. **Delete all quests** for this world
7. **Delete all characters** for this world
8. **Delete all settlements** (which cascades to lots, businesses, residences)
9. **Delete all states** (which cascades to their settlements)
10. **Delete all countries** (which cascades to their states and settlements)
11. **Delete the world** itself

**Console Output:**
```
🗑️  Deleting world <id> with full cascade...
   Deleting world: <name>
   ✓ Deleted X rules
   ✓ Deleted Y grammars
   ✓ Deleted Z simulations
   ✓ Deleted A actions
   ✓ Deleted B truths
   ✓ Deleted C quests
   ✓ Deleted D characters
   Found E settlements to delete
      🗑️  Deleting settlement <id> with cascade...
         ...
   Found F states to delete
      🗑️  Deleting state <id> with cascade...
         ...
   Found G countries to delete
   🗑️  Deleting country <id> with cascade...
      ...
   ✅ World <id> (<name>) and all associated data deleted successfully
```

⚠️ **WARNING**: This operation is **irreversible** and will delete EVERYTHING associated with the world!

### Deleting a Country

When you delete a country, the system will:

1. **Delete all states** in that country (which triggers state cascade deletion)
2. **Delete all settlements** directly in the country (without a state)
3. **Delete all characters** whose `currentLocation` is set to the country ID
4. **Delete the country** itself

**Console Output:**
```
🗑️  Deleting country <id> with cascade...
   Found X states to delete
   Found Y direct settlements to delete
   Deleted Z orphaned characters
   ✅ Country <id> deleted successfully
```

### Deleting a State

When you delete a state, the system will:

1. **Delete all settlements** in that state (which triggers settlement cascade deletion)
2. **Delete all characters** whose `currentLocation` is set to the state ID
3. **Delete the state** itself

**Console Output:**
```
   🗑️  Deleting state <id> with cascade...
      Found X settlements to delete
      Deleted Y orphaned characters
      ✅ State <id> deleted
```

### Deleting a Settlement

When you delete a settlement, the system will:

1. **Delete all characters** whose `currentLocation` is set to the settlement ID
2. **Delete all characters** whose `currentResidenceId` is set to the settlement ID
3. **(Future)** Delete all lots, businesses, and residences when schemas are implemented
4. **Delete the settlement** itself

**Console Output:**
```
      🗑️  Deleting settlement <id> with cascade...
         Found X characters to delete
         Deleted Y characters by residence
         ✅ Settlement <id> deleted (X characters removed)
```

## Character Location Fields

Characters can be associated with geographical entities through:

- `currentLocation` - The settlement ID where the character currently resides
- `currentResidenceId` - The residence ID (which belongs to a settlement)

Both fields are checked during cascade deletion to ensure no orphaned characters remain.

## Implementation Details

### Code Location
- File: `server/mongo-storage.ts`
- Methods:
  - `deleteWorld(id: string): Promise<boolean>` ← **NEW: Full cascade**
  - `deleteCountry(id: string): Promise<boolean>`
  - `deleteState(id: string): Promise<boolean>`
  - `deleteSettlement(id: string): Promise<boolean>`

### Logging
Comprehensive console logging helps track the cascade deletion process:
- Emoji indicators show hierarchy level (🗑️ for entity being deleted)
- Indentation shows cascade depth
- Counts show how many child entities are affected
- Success messages (✅) confirm completion

### Future Enhancements

When Lots, Businesses, and Residences get proper MongoDB schemas, add:

```typescript
// In deleteSettlement():
await LotModel.deleteMany({ settlementId: id });
await BusinessModel.deleteMany({ settlementId: id });
await ResidenceModel.deleteMany({ settlementId: id });
```

## Testing Cascade Deletion

### Testing World Deletion

To test complete world cascade deletion:

1. **Create a test world with full data**:
   ```bash
   POST /api/worlds
   POST /api/countries
   POST /api/settlements
   POST /api/characters
   POST /api/rules
   POST /api/simulations
   ```

2. **Delete the world** and watch cascade logs:
   ```bash
   DELETE /api/worlds/:id
   ```

3. **Verify EVERYTHING is gone**:
   ```bash
   GET /api/worlds/:id       # Should return 404
   GET /api/countries        # Should not include any from deleted world
   GET /api/settlements      # Should not include any from deleted world
   GET /api/characters       # Should not include any from deleted world
   GET /api/rules            # Should not include any from deleted world
   GET /api/simulations      # Should not include any from deleted world
   ```

### Testing Country Deletion

To test country cascade deletion:

1. **Create a test world with geography**:
   ```bash
   POST /api/worlds
   POST /api/countries
   POST /api/settlements
   ```

2. **Create test characters**:
   ```bash
   POST /api/characters
   # Set currentLocation to settlement ID
   ```

3. **Delete the country** and check logs:
   ```bash
   DELETE /api/countries/:id
   ```

4. **Verify all entities are gone**:
   ```bash
   GET /api/countries/:id  # Should return 404
   GET /api/settlements    # Should not include deleted settlements
   GET /api/characters     # Should not include deleted characters
   ```

## Notes

- **World deletion is comprehensive**: ALL entities scoped to the world are deleted (rules, grammars, actions, simulations, truths, quests, characters, countries, states, settlements)
- **Country deletion preserves world data**: When deleting a country, world-level entities (rules, simulations, etc.) are preserved
- **Deletion is permanent** - there is no undo functionality
- **Performance**: Large worlds with many entities may take significant time to delete due to cascade operations
- **Atomicity**: Each deletion operation is independent; if one fails, others may still succeed
- **Order matters**: World deletion proceeds in a specific order to avoid foreign key issues:
  1. Rules, grammars, simulations (no dependencies)
  2. Actions, truths, quests (no dependencies)
  3. Characters (before settlements, to avoid orphans)
  4. Settlements (with their own cascades)
  5. States (with their own cascades)
  6. Countries (with their own cascades)
  7. World itself (final step)

## Error Handling

If cascade deletion encounters an error:
- The error will be logged to the console
- The API will return a 500 error with details
- Some child entities may already be deleted before the error occurred
- Manual cleanup may be required in edge cases
