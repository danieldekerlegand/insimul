# Procedural Generation System Update

## Overview

The procedural generation system has been completely overhauled to support the full geographical hierarchy (World → Country → State → Settlement) with flexible configuration options.

## What Was Implemented

### 1. ProceduralGenerateTab Component ✅

Created `/client/src/components/ProceduralGenerateTab.tsx` with comprehensive generation options:

#### Generation Modes
- **Generate New**: Create entire hierarchies from scratch
- **Extend Existing**: Add content to existing countries, states, or settlements

#### Configuration Options

**Country Generation:**
- Number of countries (1-10)
- Government type (monarchy, republic, democracy, feudal, theocracy, empire)
- Economic system (feudal, mercantile, agricultural, trade-based, mixed)

**State/Province Generation:**
- Toggle state generation on/off
- Number of states per country (1-10)
- State type (province, state, territory, region, duchy, county)

**Settlement Generation:**
- Number of cities per state (0-5)
- Number of towns per state (0-10)
- Number of villages per state (0-20)
- Terrain type (plains, hills, mountains, coast, river, forest, desert)

**Population Settings:**
- Founded year and current year
- Founding families per settlement (2-30)
- Generations to simulate (1-10)
- Marriage rate (20-100%)
- Fertility rate (20-100%)
- Death rate (10-80%)

**Generation Toggles:**
- Generate geography (districts, streets, buildings)
- Generate genealogy (families, characters)
- Generate businesses

#### Extension Options

When extending existing locations:
- Select country to extend
- Select state (if applicable)
- Add cities (0-5)
- Add towns (0-10)
- Add villages (0-20)
- Add generations to existing settlements (0-5)

### 2. Backend API Endpoints ✅

Added two new endpoints in `/server/routes.ts`:

#### POST /api/generate/hierarchical
Generates complete geographical hierarchies with:
- Multiple countries
- States within each country (optional)
- Settlements (cities, towns, villages) within each state/country
- Genealogy for each settlement
- Geography for each settlement

**Response:**
```json
{
  "success": true,
  "numCountries": 2,
  "numStates": 6,
  "numSettlements": 18,
  "totalPopulation": 1250
}
```

#### POST /api/generate/extend
Extends existing locations by:
- Adding new settlements to countries or states
- Adding more generations to existing settlements
- Generating genealogy and geography for new content

**Response:**
```json
{
  "success": true,
  "newSettlements": 5,
  "newCharacters": 150
}
```

### 3. Geography Map Improvements ✅

Updated `/client/src/components/visualization/GeographyMap.tsx`:

**Features:**
- Settlement selector dropdown
- Fetches settlements for the world
- Loads geography data for selected settlement
- Displays districts, streets, buildings, landmarks
- Interactive layers toggle
- Zoom and pan controls
- Click-to-select buildings and landmarks
- Shows helpful message when no settlements exist

**Fixes:**
- Now correctly fetches from settlement data instead of deprecated world.config.geography
- Supports multiple settlements per world
- Added proper error handling

### 4. Integration with Modern UI ✅

Updated `/client/src/pages/modern.tsx`:
- Replaced `GenerateTab` with `ProceduralGenerateTab`
- Passes `worldId` to component
- Fully integrated with tab navigation system

## Usage Examples

### Generate a Medieval Kingdom

```typescript
{
  worldId: "world-123",
  numCountries: 1,
  governmentType: "monarchy",
  economicSystem: "feudal",
  generateStates: true,
  numStatesPerCountry: 5,
  stateType: "duchy",
  numCitiesPerState: 1,
  numTownsPerState: 2,
  numVillagesPerState: 5,
  terrain: "hills",
  foundedYear: 1200,
  currentYear: 1300,
  numFoundingFamilies: 10,
  generations: 4,
  marriageRate: 0.8,
  fertilityRate: 0.7,
  deathRate: 0.4,
  generateGeography: true,
  generateGenealogy: true,
  generateBusinesses: true
}
```

This creates:
- 1 kingdom
- 5 duchies
- 5 cities, 10 towns, 25 villages (40 total settlements)
- ~400 characters across 4 generations
- Geography for each settlement

### Generate Multiple Countries

```typescript
{
  worldId: "world-123",
  numCountries: 3,
  countryPrefix: "Kingdom",
  generateStates: false,
  numCitiesPerState: 2,
  numTownsPerState: 3,
  numVillagesPerState: 5,
  // ... other settings
}
```

Creates 3 kingdoms, each with 2 cities, 3 towns, and 5 villages directly (no intermediate states).

### Extend an Existing Country

```typescript
{
  worldId: "world-123",
  countryId: "country-456",
  addCities: 1,
  addTowns: 2,
  addVillages: 3,
  addGenerations: 2,
  generateGeography: true,
  generateGenealogy: true
}
```

Adds 6 new settlements to the country and extends the population by 2 more generations.

## Features

### Hierarchical Generation
- Generate complete world hierarchies in one operation
- Flexible configuration at each level
- Automatic relationship management (parent-child links)

### Scalability
- Generate from single village to multi-country empires
- Add 1-10 countries at once
- Each country can have 1-10 states
- Each state can have up to 35 settlements (5+10+20)

### Extension System
- Add content to existing worlds without regeneration
- Grow settlements with more generations
- Add new settlements to existing regions
- Preserve existing data while extending

### Visual Feedback
- Real-time progress indication
- Detailed success messages
- Error handling with helpful messages
- Summary statistics after generation

### Geography Map
- Interactive visualization
- Settlement selector
- Layer toggles (districts, streets, buildings, landmarks)
- Zoom and pan controls
- Click-to-inspect functionality

## Technical Architecture

### Frontend Components
- `ProceduralGenerateTab.tsx` - Main generation UI
- `GeographyMap.tsx` - Map visualization
- `GenealogyViewer.tsx` - Family tree visualization

### Backend Services
- `WorldGenerator` - Core generation logic
- `GenealogyGenerator` - Family/character generation
- `GeographyGenerator` - Settlement layout generation
- Storage layer - CRUD for countries, states, settlements

### API Flow
```
UI Configuration
  ↓
POST /api/generate/hierarchical
  ↓
For each country:
  Create country
  ↓
  For each state (if enabled):
    Create state
    ↓
    For each settlement type (city/town/village):
      Create settlement
      ↓
      Generate genealogy (if enabled)
      ↓
      Generate geography (if enabled)
```

## Migration Notes

### From Old GenerateTab

The old `GenerateTab` only supported:
- Single settlement generation
- Limited configuration options
- No geographical hierarchy

The new `ProceduralGenerateTab` adds:
- Full hierarchical generation
- Multiple countries/states/settlements
- Extension mode for existing locations
- More granular control over population
- Better integration with the geographical system

### Backward Compatibility

The old `/api/generate/world` endpoint still exists and works for single-settlement generation. The new endpoints supplement rather than replace the existing functionality.

## Future Enhancements

Potential additions:
- **Preset Templates**: Save and load custom generation configurations
- **Cultural Variation**: Different naming conventions per region
- **Trade Routes**: Automatic generation of economic connections
- **Historical Events**: Generate wars, alliances, migrations
- **Character Migration**: Move characters between settlements
- **Dynamic Growth**: Simulate population changes over time
- **Advanced Geography**: Rivers, mountain ranges, climate zones
- **Political Boundaries**: Dynamic territory changes

## Testing Checklist

- [ ] Generate single country with multiple states
- [ ] Generate multiple countries
- [ ] Generate without states (direct country → settlement)
- [ ] Extend existing country with new settlements
- [ ] Extend existing settlement with more generations
- [ ] Toggle geography generation on/off
- [ ] Toggle genealogy generation on/off
- [ ] Verify Geography Map displays correctly
- [ ] Test settlement selector in map
- [ ] Verify all settlements are created with correct relationships
- [ ] Check that population statistics are accurate
- [ ] Test edge cases (0 settlements, max settlements)
- [ ] Verify error handling for invalid configurations

## Summary

The procedural generation system now provides:
- ✅ Full hierarchical world generation
- ✅ Flexible configuration at every level
- ✅ Extension system for existing worlds
- ✅ Fixed and improved Geography Map
- ✅ Professional UI with clear options
- ✅ Comprehensive backend API support
- ✅ Integration with modern UI

Users can now generate complex, multi-country worlds with thousands of characters across hundreds of settlements, all from a single intuitive interface.
