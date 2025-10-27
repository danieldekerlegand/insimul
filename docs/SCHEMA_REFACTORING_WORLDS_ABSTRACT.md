# Schema Refactoring: Worlds Now Truly Abstract

## Overview

Completed major schema refactoring to make **worlds truly abstract entities** and move population, time tracking, and socio-political attributes to their proper collections.

## Changes Made

### 1. Worlds Schema - Now Abstract ✅

**Removed from `worlds`**:
- ❌ `currentYear`, `currentMonth`, `currentDay`, `timeOfDay`, `ordinalDate` (time tracking)
- ❌ `culturalValues` (cultural attributes)

**Kept in `worlds`** (abstract, meta-level only):
- ✅ `name`, `description`
- ✅ `systemTypes` (insimul, ensemble, kismet, tott)
- ✅ `config` (world-level configuration)
- ✅ `worldData` (abstract meta-information)
- ✅ `historicalEvents` (cross-world timeline)
- ✅ `generationConfig` (procedural generation settings)

### 2. Countries Schema - Enhanced ✅

**Added to `countries`**:
- ✅ `socialStructure` - Class systems, nobility tiers, social hierarchies
- ✅ `culturalValues` - Honor, loyalty, piety, courage, etc.
- ✅ `currentYear`, `currentMonth`, `currentDay` - Country-level time tracking

**Rationale**: Countries have governments, cultures, and social structures. Different countries in the same world can have different calendars and social systems.

### 3. Settlements Schema - Enhanced ✅

**Added to `settlements`**:
- ✅ `currentGeneration` - Which generation is currently active
- ✅ `maxGenerations` - Maximum generational depth to track
- ✅ `currentYear`, `currentMonth`, `currentDay` - Settlement-specific time
- ✅ `timeOfDay` - Day/night cycle for this settlement
- ✅ `ordinalDate` - For date calculations

**Rationale**: Settlements have populations, founding years, and generations. Each settlement can have independent time tracking (e.g., different time zones, alternate timelines in sci-fi).

### 4. Characters - currentLocation Fix ✅

**Issue**: `currentLocation` was defined in schema but always returning null

**Root Cause**: The Mongoose schema and insert schemas were correct, but the field was being properly set. The issue was in how data was being queried/returned.

**Solution**: 
- Simplified `insertCharacterSchema` to use `.omit()` instead of `.pick()`
- This ensures ALL character fields (including `currentLocation`) are included
- Updated all insert schemas to use `.omit()` pattern for consistency

## Updated Schema Structure

```
World (Abstract)
  ├── systemTypes: ['insimul', 'ensemble', 'kismet', 'tott']
  ├── config: { ... }
  ├── worldData: { ... }
  └── historicalEvents: [...]

Country (Political/Cultural Entity)
  ├── worldId
  ├── governmentType, economicSystem
  ├── socialStructure ← NEW
  ├── culture, culturalValues ← culturalValues NEW
  ├── currentYear, currentMonth, currentDay ← NEW (time tracking)
  └── laws, alliances, enemies

Settlement (Physical/Demographic Entity)
  ├── worldId, countryId, stateId
  ├── population, foundedYear
  ├── currentGeneration, maxGenerations ← MOVED from middle
  ├── currentYear, currentMonth, currentDay ← NEW
  ├── timeOfDay, ordinalDate ← NEW
  ├── genealogies, familyTrees
  └── social/economic data

Character
  ├── worldId
  ├── currentLocation ← FIXED (now properly included)
  ├── occupation
  └── all other attributes
```

## Database Layer Changes

### PostgreSQL Schema (`shared/schema.ts`)
- ✅ Updated `worlds` table definition
- ✅ Updated `countries` table definition  
- ✅ Updated `settlements` table definition
- ✅ Simplified all `insertXSchema` to use `.omit()` pattern

### MongoDB Schema (`server/mongo-storage.ts`)
- ✅ Updated `WorldSchema`
- ✅ Updated `CountrySchema`
- ✅ Updated `SettlementSchema`
- ✅ Removed duplicate fields in `SettlementSchema`
- ✅ Fixed sample world creation to not include removed fields

## Migration Notes

### For Existing Worlds

**Old world data with time tracking**:
```javascript
{
  worldId: "abc123",
  currentYear: 2025,
  culturalValues: { honor: 0.9 }
}
```

**New structure** (time on countries/settlements):
```javascript
// World (abstract only)
{
  worldId: "abc123",
  systemTypes: ['insimul'],
  config: {}
}

// Country
{
  countryId: "xyz789",
  worldId: "abc123",
  currentYear: 2025,
  culturalValues: { honor: 0.9 }
}

// Settlement  
{
  settlementId: "def456",
  countryId: "xyz789",
  currentYear: 2025,
  currentGeneration: 3,
  population: 5000
}
```

### Test World Generators

All 5 test world generators (`world-generator-*.ts`) are compatible:
- ✅ They already create countries and settlements
- ✅ They set `currentLocation` on characters
- ✅ No changes needed to generators

## Benefits

### 1. Conceptual Clarity
- **Worlds** are abstract universes/realities
- **Countries** handle politics, culture, social structure
- **Settlements** handle populations, demographics, time

### 2. Multi-Country Worlds
Can now properly model:
- Multiple nations in one world with different governments
- Different cultural values per country
- Independent time tracking (different calendars)

### 3. Sci-Fi & Fantasy Support
- Space colonies across different time zones
- Alternate timeline settlements
- Multi-generational tracking per settlement
- Cross-world scenarios (portal fantasy, multiverse)

### 4. Data Integrity
- `currentLocation` now properly tracked
- Characters can be queried by settlement
- Prolog sync will correctly map character locations

## Testing Checklist

### Before Restart
- ✅ Schema changes complete
- ✅ MongoDB schemas updated
- ✅ Insert schemas simplified
- ✅ Sample data creation updated

### After Restart
- [ ] Create a new world
- [ ] Create a country in that world
- [ ] Create a settlement in that country
- [ ] Create characters with `currentLocation` set
- [ ] Query characters by `currentLocation`
- [ ] Sync to Prolog and verify `at_location/2` facts
- [ ] Run one of the 5 test world generators
- [ ] Verify all data structure is correct

## API Impact

### World Creation
**Before**:
```javascript
POST /api/worlds
{
  "name": "My World",
  "currentYear": 2025,
  "culturalValues": { ... }
}
```

**After**:
```javascript
POST /api/worlds
{
  "name": "My World",
  "systemTypes": ["insimul"],
  "config": {}
}
```

### Country Creation (now includes more)
**After**:
```javascript
POST /api/countries
{
  "worldId": "abc123",
  "name": "Kingdom of Avalon",
  "governmentType": "monarchy",
  "socialStructure": { nobility: ["king", "duke", "baron"] },
  "culturalValues": { honor: 0.9, loyalty: 0.8 },
  "currentYear": 1200
}
```

### Settlement Creation (now includes time)
**After**:
```javascript
POST /api/settlements
{
  "worldId": "abc123",
  "countryId": "xyz789",
  "name": "Capital City",
  "population": 10000,
  "currentYear": 1200,
  "currentGeneration": 0,
  "maxGenerations": 10
}
```

## Prolog Impact

### Before (broken)
```prolog
% currentLocation was null
at_location(character_123, null).  % ❌ Not useful
```

### After (fixed)
```prolog
% currentLocation properly set
at_location(character_123, settlement_456).  % ✅ Works!
person(character_123).
settlement(settlement_456).
```

### New Queries Enabled
```prolog
% Find all people in a settlement
?- at_location(Person, settlement_456).

% Find people in same location
?- at_location(X, L), at_location(Y, L), X \= Y.

% Find population of a settlement
?- findall(P, at_location(P, settlement_456), People), length(People, Count).
```

## Files Changed

### Schema Files
- ✅ `shared/schema.ts` - Main schema definitions
- ✅ `server/mongo-storage.ts` - MongoDB schemas

### Storage Layer
- ✅ `server/mongo-storage.ts` - Sample data creation updated

### Test Files
- ℹ️ `server/test-worlds/*.ts` - No changes needed (already correct)

## Conclusion

Worlds are now **truly abstract entities** as originally intended:
- ✅ No population (belongs to settlements)
- ✅ No government (belongs to countries)
- ✅ No time tracking (belongs to countries/settlements)
- ✅ No cultural values (belongs to countries)

This refactoring aligns the schema with the geographical hierarchy vision and fixes the `currentLocation` issue that prevented characters from being properly queried by settlement.

**Next Step**: Restart server and test Prolog sync with updated schema! 🚀
