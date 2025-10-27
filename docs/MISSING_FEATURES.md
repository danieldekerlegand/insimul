# Missing Features from Old Editor (editor.tsx)

This document tracks functionality present in the old `client/src/pages/editor.tsx` that needs to be integrated into the new modern UI (`client/src/pages/modern.tsx`).

## ✅ Features Added to Modern UI

### 1. Character Chat Dialog with Quest Generation
- **Added to**: `HierarchicalCharactersTab`
- **Location**: Character detail view has "Talk" button
- **Features**:
  - Voice conversation with characters
  - Speech-to-text and text-to-speech
  - Language-aware conversations (French/English fluency)
  - Automatic quest generation based on conversation context
  - Quest progress tracking
  - Integration with character truths

## ❌ Missing Features That Need Implementation

### 2. Export/Import Functionality
**Current Status**: Not implemented in modern UI
**Old Location**: Editor sidebar under "Data Management"
**Components Needed**:
- `ExportDialog` - Export rules and characters to JSON
- `ImportDialog` - Import rules and characters from JSON

**Implementation Plan**:
- Add export/import buttons to ModernNavbar or each hierarchical tab
- Wire up existing `ExportDialog` and `ImportDialog` components

### 3. Simulation Management
**Current Status**: Placeholder card only in modern UI
**Old Location**: Full simulation tab with create, configure, and run
**Components Needed**:
- `SimulationCreateDialog` - Create new simulations
- `SimulationConfigDialog` - Configure simulation parameters
- Simulation list with status tracking
- Simulation results display

**Implementation Plan**:
- Create `HierarchicalSimulationsTab` component
- Include simulation creation, configuration, and execution
- Display simulation status and results

### 4. World Details Dialog
**Current Status**: Not accessible in modern UI
**Old Location**: Editor sidebar "World Info" button
**Component Needed**:
- `WorldDetailsDialog` - View and edit world metadata

**Implementation Plan**:
- Add "World Info" button to ModernNavbar
- Wire up existing `WorldDetailsDialog` component

### 5. Rule Generation with AI
**Current Status**: Not fully integrated in modern UI
**Old Location**: Rule create dialog with AI generation option
**Features**:
- Generate rules using AI prompts
- Bulk rule generation
- Rule editing with AI assistance

**Implementation Plan**:
- Already implemented in `HierarchicalRulesTab`
- Verify all features are working

### 6. Action Edit Dialog
**Current Status**: ✅ Created but may need testing
**Component**: `ActionEditDialog`
- Edit action properties
- Delete actions with confirmation

### 7. Truth Management Integration
**Current Status**: Has dedicated `TruthTab` in modern UI
**Features Present**:
- Create/edit/delete truths
- Link truths to characters
- Timestep-based truth tracking

## Priority Order for Implementation

1. **High Priority**:
   - Export/Import functionality (essential for data management)
   - Simulation management (core feature)
   
2. **Medium Priority**:
   - World Details dialog (nice to have for world metadata)
   
3. **Low Priority** (Already Working):
   - Character chat with quests ✅
   - Hierarchical rules/characters/locations/actions ✅
   - Truth management ✅
   - Quest management ✅

## Testing Checklist

### Character Chat & Quest Generation
- [ ] Talk button opens chat dialog
- [ ] Character greets in appropriate language
- [ ] Conversation generates quests automatically
- [ ] Quest progress updates during conversation
- [ ] Quests appear in Quests tab
- [ ] Voice features work (STT/TTS)

### Actions Tab
- [ ] Create action button works
- [ ] Action list displays correctly
- [ ] Click action to view details
- [ ] Edit action updates properly
- [ ] Delete action with confirmation
- [ ] Navigation breadcrumb works

### Characters Tab
- [ ] Create character button works
- [ ] Character list displays correctly
- [ ] Click character to view details
- [ ] Edit character updates properly
- [ ] Delete character with confirmation
- [ ] Talk button opens chat dialog
- [ ] Relationships are clickable and navigate
- [ ] Family tree navigation works
- [ ] Navigation breadcrumb works

### Locations Tab
- [ ] Create country/state/settlement works
- [ ] Navigation through hierarchy works
- [ ] View details for each level
- [ ] Edit/delete functionality works
- [ ] Breadcrumb navigation works

### Rules Tab
- [ ] Create rule (blank or AI-generated)
- [ ] Edit rule content
- [ ] Delete rule with confirmation
- [ ] Category filtering works
- [ ] System type filtering works
- [ ] AI generation with prompts works
- [ ] Bulk rule generation works

## Notes

The old editor (`editor.tsx`) should be considered deprecated once all missing features are implemented in the modern UI. The new hierarchical tabs provide a much better UX with:

- Consistent navigation patterns
- Beautiful gradient styling
- Proper drill-down functionality
- Better organization of features
- Improved mobile responsiveness

The character chat feature is particularly important as it:
1. Enables interactive language learning
2. Automatically generates contextual quests
3. Tracks quest progress in real-time
4. Provides voice interaction capabilities
5. Respects character language fluency levels
