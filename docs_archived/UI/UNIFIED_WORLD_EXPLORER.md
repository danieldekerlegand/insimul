# Unified World Explorer - Merged UI

## Overview

The Characters and Locations tabs have been merged into a single **Unified World Explorer** that provides comprehensive navigation through the world hierarchy with access to both locations AND characters at every level.

## What Was Merged

### Previously (Duplicated)
- **Characters Tab**: World → Countries → States → Settlements → Characters → Character Detail
- **Locations Tab**: World → Countries → States → Settlements → Lots & Businesses

### Now (Unified)
- **World Explorer Tab**: World → Countries → States → Settlements → (Locations + Characters)

## New Architecture

### Main Component
- `UnifiedWorldExplorerTab.tsx` - Orchestrates the entire navigation and state management

### Location View Components (`components/locations/`)
- `CountryDetailView.tsx` - Country info + States list + Settlements list
- `StateDetailView.tsx` - State info + Settlements list
- `SettlementDetailView.tsx` - Settlement info + Characters button + Lots + Businesses

### Character View Components (`components/characters/`)
- `CountriesListView.tsx` - Grid of countries
- `StatesListView.tsx` - Grid of states
- `SettlementsListView.tsx` - Grid of settlements
- `CharactersListView.tsx` - List of characters in a settlement
- `CharacterDetailView.tsx` - Full character profile

### Dialog Components (Reused)
- `CharacterEditDialog.tsx` - Edit character details (with breadcrumb navigation)
- `CharacterChatDialog.tsx` - Chat with characters
- `CountryDialog.tsx` - Create/edit countries
- `StateDialog.tsx` - Create/edit states
- `SettlementDialog.tsx` - Create/edit settlements

## Navigation Flow

```
World (Countries List)
  ↓ Select Country
Country Detail
  - Country Info Card
  - States Section (with "Add State")
  - Settlements Section (with "Add Settlement")
  ↓ Select State
State Detail
  - State Info Card
  - Settlements Section (with "Add Settlement")
  ↓ Select Settlement
Settlement Detail
  - Settlement Info Card
  - **Characters Section** (shows count + "View All Characters" button)
  - Lots Section
  - Businesses Section
  ↓ Click "View All Characters"
Characters List
  - Character Cards
  - "Add Character" button
  ↓ Select Character
Character Detail
  - Character Info
  - Personality, Skills, Traits
  - Relationships
  - Family Tree
  - "Edit" and "Talk" buttons
```

## Key Features

### 1. Unified Breadcrumb Navigation
All breadcrumb items are clickable and allow jumping to any level:
```
[← Back]  World > Valoria > Aldermoor > Goldspire > Characters > John Smith
          ^^^^^   ^^^^^^^^   ^^^^^^^^^   ^^^^^^^^^   ^^^^^^^^^^   ^^^^^^^^^^
       (clickable)(clickable)(clickable) (clickable)  (clickable)  (current)
```

### 2. Seamless Context Switching
- Navigate from location management to character management without losing context
- Settlement detail shows character count
- One click takes you to character list
- Easy navigation back to locations

### 3. Location CRUD
- Add/edit countries, states, and settlements
- View lots and businesses
- See settlement statistics (population, terrain, generation)

### 4. Character Management
- Create new characters
- View character details
- Edit character information
- Chat with characters (using Gemini API)
- Navigate character relationships
- View family trees

### 5. Smart State Management
- Caches fetched data to minimize API calls
- Properly clears subordinate levels when navigating up
- Maintains character list separately from all-characters list (for relationships)

## Usage

### In the UI
Both the "Characters" and "Locations" tabs now show the same unified interface:
- Click **Characters** tab → See World Explorer
- Click **Locations** tab → See World Explorer (same component)

### Adding the Component
```typescript
import { UnifiedWorldExplorerTab } from '@/components/UnifiedWorldExplorerTab';

<UnifiedWorldExplorerTab worldId={selectedWorld} />
```

## Benefits

### ✅ No Code Duplication
- Single navigation system
- Shared breadcrumb logic
- Reusable view components

### ✅ Better UX
- No confusion about which tab to use
- Natural flow from locations to characters
- Consistent navigation patterns throughout

### ✅ Easier Maintenance
- One place to update navigation logic
- Centralized state management
- Modular component architecture

### ✅ Better Context
- See character count while viewing a settlement
- Navigate between locations and characters without losing place
- Full hierarchy always visible in breadcrumbs

## Removed Files (Can Be Deleted)
- `HierarchicalCharactersTab.tsx` - Replaced by UnifiedWorldExplorerTab
- `HierarchicalLocationsTab.tsx` - Replaced by UnifiedWorldExplorerTab
- `LocationsTab.tsx` - Old flat locations tab (if it still exists)

## Migration Notes

The integration is complete and both tabs now use the unified component. The old separate tabs can be safely deleted to reduce code duplication.

If you need tab-specific behavior (e.g., starting at a different view level), you can pass an optional prop to UnifiedWorldExplorerTab.
