# Geographical Hierarchy System

## Overview

The Insimul world system has been refactored to separate the abstract concept of a "world" from its geographical entities. This enables support for multiple countries, states, and settlements within a single world, and allows for complex scenarios like wars, territorial changes, and multi-world sci-fi settings.

## Hierarchy Structure

```
World (Abstract Universe/Reality)
  └── Country (Nation-State)
        ├── State (Province/Territory) [Optional]
        │     └── Settlement (City/Town/Village)
        └── Settlement (City/Town/Village)
```

## Entity Definitions

### World
An abstract universe or reality that can contain multiple countries and geographical entities.

**Key Fields:**
- `name` - Name of the world/universe
- `description` - World setting and theme
- `currentYear` - Current year in the world timeline
- `systemTypes` - Simulation systems used (insimul, ensemble, kismet, tott)
- `culturalValues` - World-level cultural defaults
- `generationConfig` - Default generation parameters

**Example:** "Medieval Realm", "Sci-Fi Universe Alpha", "Fantasy Multiverse"

### Country
A nation-state within a world with its own government, economy, and culture.

**Key Fields:**
- `worldId` - Parent world
- `name` - Country name
- `governmentType` - monarchy, republic, democracy, feudal, theocracy, empire
- `economicSystem` - feudal, mercantile, agricultural, trade-based, mixed
- `foundedYear` - Year the country was founded
- `alliances` - Array of allied country IDs
- `enemies` - Array of enemy country IDs
- `isActive` - Whether the country still exists
- `dissolvedYear` - When the country ceased to exist

**Example:** "Kingdom of Valoria", "Republic of New Haven"

### State
A region within a country (province, territory, duchy, county).

**Key Fields:**
- `worldId` - Parent world
- `countryId` - Parent country
- `name` - State name
- `stateType` - province, state, territory, region, duchy, county
- `terrain` - plains, hills, mountains, coast, river, forest, desert
- `governorId` - Character ID of the governor/ruler
- `previousCountryIds` - For tracking annexations/wars
- `annexationHistory` - Historical record of territorial changes

**Example:** "Province of Aldermoor", "Duchy of Ravenshollow"

### Settlement
A city, town, or village where characters live and events occur.

**Key Fields:**
- `worldId` - Parent world
- `countryId` - Parent country (can be null for independent settlements)
- `stateId` - Parent state (optional)
- `name` - Settlement name
- `settlementType` - city, town, village
- `terrain` - Geographic terrain type
- `population` - Current population
- `foundedYear` - Year founded
- `districts` - Array of district/neighborhood data
- `streets` - Array of street data
- `landmarks` - Array of landmark data
- `familyTrees` - Genealogical data for families
- `currentGeneration` - Current generation number
- `previousCountryIds` - For tracking ownership changes
- `annexationHistory` - Record of wars/territorial changes

**Example:** "Goldspire" (city), "Thornbrook" (village)

## Database Schema

All geographical entities now have proper foreign key relationships:

- `lots.settlementId` → `settlements.id`
- `businesses.settlementId` → `settlements.id`
- `residences.settlementId` → `settlements.id`
- `settlements.countryId` → `countries.id`
- `settlements.stateId` → `states.id`
- `states.countryId` → `countries.id`
- `countries.worldId` → `worlds.id`

## API Endpoints

### Worlds
- `GET /api/worlds` - List all worlds
- `POST /api/worlds` - Create a new world
- `GET /api/worlds/:id` - Get world details
- `PUT /api/worlds/:id` - Update world
- `DELETE /api/worlds/:id` - Delete world

### Countries
- `GET /api/worlds/:worldId/countries` - List countries in a world
- `POST /api/worlds/:worldId/countries` - Create a country
- `GET /api/countries/:id` - Get country details
- `PUT /api/countries/:id` - Update country
- `DELETE /api/countries/:id` - Delete country

### States
- `GET /api/countries/:countryId/states` - List states in a country
- `POST /api/countries/:countryId/states` - Create a state
- `GET /api/states/:id` - Get state details
- `PUT /api/states/:id` - Update state
- `DELETE /api/states/:id` - Delete state

### Settlements
- `GET /api/worlds/:worldId/settlements` - List all settlements in a world
- `GET /api/countries/:countryId/settlements` - List settlements in a country
- `POST /api/worlds/:worldId/settlements` - Create a settlement
- `GET /api/settlements/:id` - Get settlement details
- `PUT /api/settlements/:id` - Update settlement
- `DELETE /api/settlements/:id` - Delete settlement

### Procedural Generation
- `POST /api/generate/world` - Generate a complete world with country and settlement
- `POST /api/generate/genealogy/:worldId` - Generate genealogy for a world
- `POST /api/generate/geography/:settlementId` - Generate geography for a settlement
- `GET /api/generate/presets` - Get preset configurations

## Usage Examples

### Creating a World Manually

1. **Create the World:**
```typescript
const world = await fetch('/api/worlds', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Medieval Realm',
    description: 'A feudal fantasy world',
    currentYear: 1200,
    systemTypes: ['insimul', 'tott']
  })
});
```

2. **Create a Country:**
```typescript
const country = await fetch(`/api/worlds/${worldId}/countries`, {
  method: 'POST',
  body: JSON.stringify({
    name: 'Kingdom of Valoria',
    governmentType: 'monarchy',
    economicSystem: 'feudal',
    foundedYear: 1150
  })
});
```

3. **Create a Settlement:**
```typescript
const settlement = await fetch(`/api/worlds/${worldId}/settlements`, {
  method: 'POST',
  body: JSON.stringify({
    countryId: countryId,
    name: 'Goldspire',
    settlementType: 'city',
    terrain: 'plains',
    foundedYear: 1160,
    population: 25000
  })
});
```

### Using Procedural Generation

Generate a complete world with one command:

```typescript
const result = await fetch('/api/generate/world', {
  method: 'POST',
  body: JSON.stringify({
    worldName: 'Medieval Realm',
    settlementName: 'Thornbrook',
    settlementType: 'village',
    terrain: 'forest',
    foundedYear: 1200,
    currentYear: 1300,
    numFoundingFamilies: 5,
    generations: 4,
    marriageRate: 0.8,
    fertilityRate: 0.7,
    deathRate: 0.4,
    generateGeography: true,
    generateGenealogy: true,
    governmentType: 'feudal',
    economicSystem: 'agricultural'
  })
});

// Returns: { worldId, countryId, settlementId, population, families, generations, districts, buildings }
```

### Using Presets

```typescript
// Get available presets
const presets = await fetch('/api/generate/presets').then(r => r.json());

// Available presets:
// - medievalVillage
// - colonialTown
// - modernCity
// - fantasyRealm

// Generate using a preset (with custom overrides)
const result = await fetch('/api/generate/world', {
  method: 'POST',
  body: JSON.stringify({
    ...presets.medievalVillage,
    settlementName: 'My Custom Village'
  })
});
```

## War and Territorial Changes

The system supports tracking territorial changes through wars:

```typescript
// When a settlement changes ownership
await fetch(`/api/settlements/${settlementId}`, {
  method: 'PUT',
  body: JSON.stringify({
    previousCountryIds: [...previousCountryIds, oldCountryId],
    countryId: newCountryId,
    annexationHistory: [
      ...existingHistory,
      {
        year: 1250,
        event: 'Conquered by Kingdom of Eastland',
        previousCountryId: oldCountryId,
        newCountryId: newCountryId
      }
    ]
  })
});
```

## UI Components

### WorldCreateDialog
Creates only the abstract world without settlement-specific data.

**Usage:**
```tsx
<WorldCreateDialog 
  onCreateWorld={(data) => createWorldMutation.mutate(data)}
  isLoading={createWorldMutation.isPending}
/>
```

### GenerateTab
Provides full procedural generation with presets and configuration options.

**Features:**
- Preset selection (Medieval Village, Colonial Town, etc.)
- World and settlement naming
- Settlement type selection (village, town, city)
- Terrain selection (7 types)
- Time period configuration
- Population parameters
- Genealogy and geography toggles

## Migration Notes

### For Existing Code

If you have existing code that references world-level fields that have been moved:

**Before:**
```typescript
world.population
world.governmentType
world.economicSystem
world.locations
world.buildings
world.landmarks
```

**After:**
```typescript
// These are now at the settlement level
settlement.population
country.governmentType
country.economicSystem
settlement.districts
settlement.streets
settlement.landmarks
```

### Data Migration

Existing worlds in the database will need to be migrated:
1. Create a country for each world
2. Create a settlement for each world with the appropriate data
3. Update lots, businesses, and residences with settlementId references

## Future Enhancements

This structure enables:
- **Multiple Worlds:** Sci-fi scenarios with parallel universes or alternate realities
- **Complex Politics:** Dynamic alliances, wars, and territorial changes
- **State-Level Governance:** Add governors, local laws, and regional policies
- **Migration Systems:** Characters moving between settlements
- **Trade Networks:** Economic systems spanning multiple settlements
- **Multi-Settlement Families:** Genealogies that span multiple cities
- **Historical Simulation:** Track how territories change over centuries

## TypeScript Types

```typescript
import type { 
  World, 
  InsertWorld,
  Country, 
  InsertCountry,
  State, 
  InsertState,
  Settlement, 
  InsertSettlement 
} from '@shared/schema';
```

All types are properly exported and available for use throughout the application.
