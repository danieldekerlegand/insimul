# Simulation System Analysis & Enhancement Plan

## Current State Analysis

### ✅ What Works

The Simulation system has a **solid foundation** with these working components:

1. **SimulationCreateDialog** - Create simulations with configuration
2. **SimulationConfigDialog** - Advanced pre-run configuration (4 tabs)
3. **Unified Engine** - Executes rules and generates narrative via Tracery
4. **Database Schema** - Complete temporal tracking with timesteps
5. **API Endpoints** - Full CRUD + execution endpoints
6. **Old UI Integration** - Fully functional in editor.tsx

### ❌ What's Broken

**Run Simulation button in Modern UI** (`modern.tsx` line 127-130):
- Button exists but has **NO click handler**
- Not wrapped in `SimulationConfigDialog`
- Missing mutation hooks and state management
- No simulation list/results display

## Simulation Capabilities

### What Simulations Track

Based on the database schema and execution engine, simulations track:

| Data Type | How It's Tracked | Displayed |
|-----------|------------------|-----------|
| **Rules Executed** | Array of rule names that fired | ✅ Count + List |
| **Events Generated** | Event objects with type/description/timestamp | ✅ Count + List |
| **Characters Affected** | Character names + actions performed | ✅ Count + List |
| **Narrative Output** | Tracery-generated text | ✅ Full text |
| **Execution Time** | Milliseconds to complete | ✅ Performance metric |
| **Timestep Progress** | Current time vs end time | ✅ Progress bar |
| **Character State Changes** | Via `modify_attribute` effects | ⚠️ Tracked but not visualized |
| **Entity Creation** | Via `create_entity` effects | ⚠️ Tracked but not visualized |
| **Error Log** | Failures during execution | ⚠️ Stored but not displayed |

### Current Visualization (editor.tsx)

```
┌─────────────────────────────────────────┐
│ Simulation: "Noble Succession Test"    │
│ Status: ● completed                     │
├─────────────────────────────────────────┤
│ ┌──────────┬──────────┬──────────┬─────┐│
│ │Exec Time │Rules (8) │Events (5)│Chars││
│ │125ms     │          │          │ (4) ││
│ └──────────┴──────────┴──────────┴─────┘│
│                                          │
│ Narrative:                               │
│ "Princess Elara is crowned the new...   │
│  The ceremony is grand and solemn..."   │
└─────────────────────────────────────────┘
```

**Limitations:**
- Static results display (no timeline)
- No character state diff view
- No rule execution sequence
- No event cause/effect chains
- Can't scrub through timesteps

## World Truth Integration Potential

###  Current World Truth Features

The World Truth system provides:

1. **TimelineDial Widget** - Slider for temporal navigation
2. **Timestep-based Tracking** - Generic time units
3. **Past/Present/Future Tabs** - Automatic filtering by current timestep
4. **Entry Types** - event, backstory, relationship, achievement, milestone, prophecy, plan
5. **Character Association** - Link truths to characters
6. **Source Tracking** - imported_ensemble, user_created, simulation_generated

### Integration Gap

**Currently:** Simulations run but DON'T create Truth entries.

**Result:** No way to:
- View simulation history over time
- Compare multiple simulation runs
- Track character development across timesteps
- See rule execution timeline
- Scrub through simulation events

### Proposed Integration Architecture

```
Simulation Execution
        ↓
   Each timestep (e.g., t=0 to t=100)
        ↓
   Rules execute → Events generated
        ↓
   Create Truth entries:
   ├─ Event truths for each generated event
   ├─ Relationship truths for character interactions
   ├─ Achievement truths for milestones
   └─ Source: "simulation_generated"
        ↓
   Store with timestep from simulation currentTime
        ↓
   User can scrub timeline to see:
   ├─ What happened at t=5, t=10, t=15...
   ├─ Character state at any point
   └─ Rule execution history
```

## Enhanced Visualization Plan

### Option 1: Embedded Timeline in Results

Add TimelineDial to simulation results view:

```
┌─────────────────────────────────────────────────┐
│ Simulation Results: "Noble Succession Test"    │
├─────────────────────────────────────────────────┤
│ Timeline: [◄◄] [◄] [═════●═══════] [►] [►►]  │
│           t=0            t=42         t=100    │
├─────────────────────────────────────────────────┤
│ At timestep 42:                                 │
│ ┌───────────────────────────────────────────┐ │
│ │ 2 rules executed:                         │ │
│ │ • noble_succession (insimul)              │ │
│ │ • inheritance_ceremony (kismet)           │ │
│ └───────────────────────────────────────────┘ │
│ ┌───────────────────────────────────────────┐ │
│ │ 3 events generated:                       │ │
│ │ • Princess Elara inherits title           │ │
│ │ • Coronation ceremony begins              │ │
│ │ • Lord Edmund dies                        │ │
│ └───────────────────────────────────────────┘ │
│ ┌───────────────────────────────────────────┐ │
│ │ Narrative:                                │ │
│ │ "Princess Elara is crowned the new ruler  │ │
│ │  of Aldermere. The ceremony is grand..."  │ │
│ └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Option 2: Truth Tab Integration

Link simulations to World Truth:

```
┌─────────────────────────────────────────┐
│ World Truth (127 entries)              │
├─────────────────────────────────────────┤
│ Timeline: [◄◄] [◄] [═══●═════] [►] [►►]│
│           t=-50       t=0      t=50     │
├─────────────────────────────────────────┤
│ [Past] [Present] [Future]               │
├─────────────────────────────────────────┤
│ Present (t=0):                          │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ ⚡ Event | 👤 Princess Elara          │ │
│ │ t=0 | Simulation: Noble Succession  │ │
│ │                                      │ │
│ │ "Princess Elara is crowned the new  │ │
│ │  ruler of Aldermere..."              │ │
│ │                                      │ │
│ │ 🏷 succession, royalty, ceremony     │ │
│ │ 📋 Source: simulation_generated      │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ 💔 Relationship | 👤 Lord Edmund     │ │
│ │ t=0 | Simulation: Noble Succession  │ │
│ │                                      │ │
│ │ "Lord Edmund dies, ending his reign"│ │
│ │                                      │ │
│ │ Related: Princess Elara              │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Option 3: Unified Timeline View

New "Simulation History" tab with combined view:

```
┌─────────────────────────────────────────────────┐
│ Simulation: Noble Succession Test              │
│ Status: ● completed (100 timesteps)            │
├─────────────────────────────────────────────────┤
│ [Summary] [Timeline] [Characters] [Truths]     │
├─────────────────────────────────────────────────┤
│ Timeline View:                                  │
│                                                  │
│ t=0  ●─────────────────────────────────────►   │
│      │ World initialized                        │
│      │ 12 characters, 5 locations               │
│                                                  │
│ t=15 ●                                           │
│      │ 🎲 Rule: noble_succession                │
│      │ → Lord Edmund dies                       │
│      │ → Princess Elara inherits title          │
│      │ 👤 Affected: Elara, Edmund               │
│                                                  │
│ t=15 ●                                           │
│      │ 🎲 Rule: inheritance_ceremony            │
│      │ → Coronation event created               │
│      │ 📖 Narrative generated (Tracery)         │
│      │ "Princess Elara is crowned..."           │
│                                                  │
│ t=30 ●                                           │
│      │ 🎲 Rule: political_rivalry               │
│      │ → Duke Marcus challenges claim           │
│      │ 👤 Affected: Elara, Marcus, Edmund       │
│                                                  │
│ t=45 ●                                           │
│      │ 🎲 Rule: conflict_resolution             │
│      │ → Alliance formed                        │
│      │ 💑 Relationship: Elara ↔ Marcus          │
│                                                  │
│ t=100 ●                                          │
│       │ Simulation complete                     │
│       │ 8 rules, 23 events, 7 characters        │
└─────────────────────────────────────────────────┘
```

## Implementation Requirements

### Phase 1: Fix Modern UI Run Simulation Button

**Files to modify:**
- `/client/src/pages/modern.tsx`

**Changes needed:**
1. Import `SimulationConfigDialog` and `SimulationCreateDialog`
2. Add React Query hooks for simulations
3. Add `runSimulationMutation` with API call
4. Wrap button in `SimulationConfigDialog`
5. Display simulation list and results
6. Add toast notifications

### Phase 2: Create Truth Entries from Simulations

**Files to modify:**
- `/server/engines/unified-engine.ts`

**New functionality:**
1. After each simulation step, create Truth entries:
   ```typescript
   private async createTruthFromEvent(
     event: SimulationEvent,
     timestep: number,
     simulationId: string
   ): Promise<Truth> {
     return await storage.createTruth({
       worldId: this.context.worldId,
       timestep: timestep,
       entryType: event.type === 'narrative' ? 'event' : event.type,
       title: `Simulation Event at t=${timestep}`,
       content: event.description,
       relatedCharacterIds: extractCharacterIds(event),
       source: 'simulation_generated',
       sourceData: {
         simulationId: simulationId,
         eventType: event.type,
         timestamp: event.timestamp
       },
       isPublic: true,
       importance: 5
     });
   }
   ```

2. Track character state changes as truths:
   ```typescript
   private async createCharacterStateTruth(
     characterId: string,
     change: string,
     timestep: number
   ): Promise<Truth> {
     return await storage.createTruth({
       worldId: this.context.worldId,
       characterId: characterId,
       timestep: timestep,
       entryType: 'milestone',
       title: `Character State Change`,
       content: change,
       source: 'simulation_generated',
       importance: 3
     });
   }
   ```

### Phase 3: Timeline Visualization

**New Component:** `SimulationTimelineView.tsx`

**Features:**
1. Embed TimelineDial widget
2. Filter Truth entries by simulation source
3. Display events at each timestep
4. Show character state diffs
5. Expandable rule execution details

**Props:**
```typescript
interface SimulationTimelineViewProps {
  simulationId: string;
  worldId: string;
  startTime: number;
  endTime: number;
  results: SimulationStepResult;
}
```

### Phase 4: Character State Tracking

**New feature:** Character snapshots at each timestep

**Implementation:**
1. Before simulation: capture initial character state
2. At each timestep: detect character changes
3. Create truth entries for significant changes
4. Allow "diff" view between timesteps

**Example snapshot:**
```typescript
interface CharacterSnapshot {
  timestep: number;
  characterId: string;
  attributes: Record<string, any>;
  relationships: Array<{
    targetId: string;
    type: string;
    strength: number;
  }>;
  location: string;
  status: string;
}
```

## Database Schema Enhancements

### Current Simulation Schema (Good)

```typescript
{
  startTime: integer (0)
  endTime: integer (100)
  currentTime: integer (tracks progress)
  timeStep: integer (1)
  results: jsonb (stores outcomes)
  narrativeOutput: string[] (Tracery text)
}
```

### Proposed Additions

```typescript
{
  // Add timestep-indexed events
  timelineEvents: jsonb {
    [timestep: number]: {
      rulesExecuted: string[];
      eventsGenerated: SimulationEvent[];
      charactersAffected: string[];
      narrative: string;
    }
  }

  // Character state snapshots
  characterSnapshots: jsonb {
    [timestep: number]: {
      [characterId: string]: CharacterSnapshot
    }
  }

  // Truth entries created
  generatedTruthIds: string[] (references to truth entries)
}
```

## Use Case Scenarios

### Scenario 1: Noble Succession Simulation

**Setup:**
- World with royal family (King, Queen, 2 children)
- Rules: succession, inheritance, coronation ceremonies
- Grammars: succession_ceremony, barbarian_names

**Run Simulation:**
1. User clicks "Run Simulation"
2. Configures: t=0 to t=100, default engine
3. Simulation executes

**At t=15:** King dies
- `noble_succession` rule fires
- Creates Truth: "King Edmund dies" (event, public)
- Princess Elara inherits title
- Creates Truth: "Princess Elara becomes Queen" (achievement)
- Tracery generates: "Princess Elara is crowned the new ruler of Aldermere..."

**At t=30:** Political challenge
- `political_rivalry` rule fires
- Duke Marcus challenges claim
- Creates Truth: "Duke Marcus contests succession" (event)
- Relationship changes: Elara ↔ Marcus = -0.5 (hostile)
- Creates Truth: "Elara and Marcus become rivals" (relationship)

**At t=45:** Resolution
- `conflict_resolution` rule fires
- Alliance formed through marriage
- Creates Truth: "Elara and Marcus ally" (relationship)
- Narrative: "The alliance between Elara and Marcus brings peace..."

**Result:** User can scrub timeline and see:
- t=0: Initial state
- t=15: Death → Succession → Coronation
- t=30: Political challenge
- t=45: Resolution
- t=100: Final state

### Scenario 2: Character Development Over Time

**Setup:**
- Character: John Smith (peasant)
- Rules: skill_progression, social_mobility, relationship_building

**Simulation tracks:**
- t=0: John (farmer, skill=2)
- t=20: John learns blacksmithing (skill=4)
- t=40: John opens shop (occupation change)
- t=60: John marries Mary (relationship created)
- t=80: John becomes guild master (status promotion)
- t=100: John retires (life milestone)

**Truth entries created:**
- 6 milestone truths (one per major change)
- 1 relationship truth (marriage)
- 1 achievement truth (guild master)
- Multiple event truths (skill gains, shop opening)

**Visualization:** Timeline shows John's complete life arc with scrubbing

## API Additions Needed

### New Endpoints

```
GET /api/simulations/:id/timeline
  → Returns timestep-indexed events

GET /api/simulations/:id/truths
  → Returns all Truth entries created by simulation

GET /api/simulations/:id/characters/:characterId/timeline
  → Returns character state changes over time

POST /api/simulations/:id/regenerate-truths
  → Recreate Truth entries from existing results
```

## Testing Plan

### Test 1: Basic Simulation with Truth Generation
1. Create world with 2 characters
2. Add `succession_ceremony` grammar
3. Add succession rule with `tracery_generate()`
4. Run simulation
5. Verify Truth entries created
6. Check timeline displays correctly

### Test 2: Timeline Scrubbing
1. Run simulation with t=0 to t=50
2. Navigate to World Truth tab
3. Use TimelineDial to scrub through timesteps
4. Verify events appear at correct times
5. Check Past/Present/Future filtering

### Test 3: Character State Tracking
1. Run simulation with character attribute changes
2. Create snapshots at each timestep
3. View character at different points in time
4. Verify state diffs are accurate

### Test 4: Multiple Simulations
1. Run 3 different simulations
2. Verify Truth entries are distinguishable by source
3. Check that timeline can filter by simulation
4. Ensure no data conflicts

## Conclusion

### Summary

The Simulation system has a **solid foundation** but is missing:
1. ❌ Working Run button in modern UI
2. ❌ Truth entry generation from results
3. ❌ Timeline visualization of events
4. ❌ Character state tracking over time
5. ❌ Integration with World Truth scrubbing

### Recommendations

**Priority 1:** Fix Run Simulation button (1-2 hours)
- Immediate value: Users can test Tracery integration
- Low risk: Copy working code from editor.tsx

**Priority 2:** Truth entry generation (3-4 hours)
- High value: Enables timeline visualization
- Medium risk: Requires unified-engine.ts changes

**Priority 3:** Timeline visualization (6-8 hours)
- Highest value: Complete simulation experience
- Medium risk: New component development

**Priority 4:** Character state tracking (4-6 hours)
- Nice-to-have: Enhanced insights
- Low risk: Builds on existing Truth system

### Next Steps

1. Fix modern.tsx Run Simulation button (now)
2. Test Tracery execution end-to-end
3. Implement Truth generation in unified-engine.ts
4. Build SimulationTimelineView component
5. Integrate with World Truth tab

This creates a **complete narrative simulation system** with:
- ✅ Procedural text generation (Tracery)
- ✅ Rule-based logic (Prolog + JavaScript)
- ✅ Temporal tracking (Truth system)
- ✅ Timeline visualization (TimelineDial)
- ✅ Character development tracking
- ✅ Event causality chains
