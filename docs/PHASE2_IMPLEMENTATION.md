# Phase 2 Implementation: Unified Timeline View with Truth Generation

## Overview

Phase 2 successfully implements **automatic Truth entry generation** from simulation events, along with a **Unified Timeline View** that allows users to scrub through simulation history timestep-by-timestep.

## What Was Implemented

### ✅ 1. Truth Entry Generation in Unified Engine

**File:** [server/engines/unified-engine.ts](server/engines/unified-engine.ts)

**New Capabilities:**

#### A. Timestep Tracking
- Added `currentTimestep` to simulation context
- Added `truthsCreated` array to track generated Truth IDs
- New method `setTimestep(number)` for manual timestep control

#### B. Automatic Truth Creation
```typescript
private async createTruthFromNarrative(
  narrative: string,
  grammarName: string,
  variables: Record<string, any>
): Promise<void>
```

**Features:**
- Automatically creates Truth entry when Tracery generates narrative
- Extracts character names from variables and links them
- Tags entries with `['simulation', 'narrative', grammarName]`
- Stores source as `'simulation_generated'`
- Includes simulation metadata in `sourceData`

#### C. Event Truth Creation
```typescript
private async createTruthFromEvent(
  event: { type: string; description: string; timestamp: Date },
  ruleName: string
): Promise<void>
```

**Maps event types to Truth entry types:**
- `attribute_modified` → `milestone`
- `entity_created` → `event`
- `custom_event` → `event`
- `narrative` → `event`

#### D. Character Linking
Automatically finds and links characters mentioned in narrative variables:
```typescript
const char = this.context.characters.find(
  c => `${c.firstName} ${c.lastName}` === value || c.firstName === value
);
```

### ✅ 2. SimulationTimelineView Component

**File:** [client/src/components/SimulationTimelineView.tsx](client/src/components/SimulationTimelineView.tsx)

**Features:**

#### A. Timeline Navigation
- Embeds `TimelineDial` widget for scrubbing
- Automatically calculates timestep range from simulation events
- Real-time filtering as user navigates timeline

#### B. Past/Present/Future Tabs
- **Past:** Events that ended before current timestep (sorted newest first)
- **Present:** Events active at current timestep
- **Future:** Events starting after current timestep (sorted earliest first)

#### C. Rich Event Cards
Each Truth entry displays:
- Entry type icon (⚡ event, 📜 backstory, 💔 relationship, etc.)
- Title and entry type badge
- Grammar name badge (for Tracery-generated events)
- Timestep (`t=N`) with duration
- Full narrative content
- Related characters
- Tags (filtered to exclude 'simulation')

#### D. Empty States
- Helpful message when no timeline events exist
- Instructions to use `tracery_generate()` in rules
- Empty state for each tab when no events at that time

### ✅ 3. Modern UI Integration

**File:** [client/src/pages/modern.tsx](client/src/pages/modern.tsx)

**Changes:**
- Imported `SimulationTimelineView` component
- Added timeline view below results section
- Shows "Created N timeline events" message
- Only displays timeline if truths were created

**UI Flow:**
```
Simulation Card
├─ Name, Description, Status
├─ Configure & Run Button
└─ Results (if completed)
    ├─ Execution metrics (4-column grid)
    ├─ Generated narrative
    ├─ "Created N timeline events" message
    └─ SimulationTimelineView (expandable timeline)
```

### ✅ 4. Backend Truth Tracking

**File:** [server/routes.ts](server/routes.ts)

**Enhanced result object:**
```javascript
{
  executionTime: number,
  rulesExecuted: number,
  eventsGenerated: number,
  charactersAffected: number,
  narrative: string,
  truthsCreated: string[],  // NEW: Array of Truth IDs
  rulesExecutedList: string[],
  eventsGeneratedList: string[],
  charactersAffectedList: string[]
}
```

## How It Works

### Simulation → Truth Generation Flow

```
1. User runs simulation
         ↓
2. Unified engine executes rules
         ↓
3. Rule triggers tracery_generate() effect
         ↓
4. Tracery expands grammar with variables
         ↓
5. Narrative created → executeGenerateTextEffect()
         ↓
6. createTruthFromNarrative() called automatically
         ↓
7. Truth entry created with:
   - timestep = context.currentTimestep
   - entryType = 'event'
   - source = 'simulation_generated'
   - sourceData = { simulationId, grammarName, timestep, variables }
   - relatedCharacterIds = extracted from variables
         ↓
8. Truth ID added to context.truthsCreated[]
         ↓
9. Simulation results include truthsCreated array
         ↓
10. SimulationTimelineView loads and filters truths
         ↓
11. User can scrub timeline to see events at each timestep
```

### Example Truth Entry Created

When a simulation runs the succession rule:

**Input:**
- Grammar: `succession_ceremony`
- Variables: `{heir: "Princess Elara"}`
- Timestep: `15`

**Output Truth Entry:**
```json
{
  "id": "truth_xyz",
  "worldId": "world_123",
  "timestep": 15,
  "timestepDuration": 1,
  "entryType": "event",
  "title": "Simulation Event (succession_ceremony)",
  "content": "Princess Elara is crowned the new ruler of Aldermere. The ceremony is grand and solemn.",
  "relatedCharacterIds": ["char_elara_id"],
  "tags": ["simulation", "narrative", "succession_ceremony"],
  "importance": 5,
  "isPublic": true,
  "source": "simulation_generated",
  "sourceData": {
    "simulationId": "sim_456",
    "grammarName": "succession_ceremony",
    "timestep": 15,
    "variables": { "heir": "Princess Elara" }
  }
}
```

## Data Model

### Enhanced Simulation Context

```typescript
interface SimulationContext {
  worldId: string;
  simulationId: string;
  characters: Character[];
  world: World;
  narrativeOutput: string[];
  events: Array<{ type, description, timestamp }>;
  rulesExecuted: string[];
  truthsCreated: string[];      // NEW
  currentTimestep: number;      // NEW
  variables: Record<string, any>;
}
```

### Enhanced Step Result

```typescript
interface SimulationStepResult {
  narratives: string[];
  events: Array<{ type, description, timestamp }>;
  rulesExecuted: string[];
  truthsCreated: string[];      // NEW
  success: boolean;
  error?: string;
}
```

## User Experience

### Before Phase 2:
```
Run Simulation → See results once → No way to explore what happened over time
```

### After Phase 2:
```
Run Simulation → See results + Timeline → Scrub through timesteps → See events at each moment
```

### Timeline Interaction:

1. **Initial View (t=0):**
   - Timeline dial at start
   - Shows all events at timestep 0
   - Future tab shows all upcoming events

2. **Navigate to t=15:**
   - Drag timeline dial to 15
   - Past tab shows events from t=0-14
   - Present tab shows events at t=15 (e.g., succession ceremony)
   - Future tab shows events from t=16+

3. **View Event Details:**
   - Click on event card
   - See full narrative
   - See related characters
   - See which grammar generated it
   - See tags for filtering

## API Enhancements

### New Truth Endpoints Used

```
GET /api/worlds/:worldId/truth
  → Fetches all truths for world (filtered client-side by simulation ID)

POST /api/truth
  → Creates new Truth entry (called automatically by engine)
```

### Simulation Results Enhancement

```javascript
// Before
{
  executionTime: 125,
  rulesExecuted: 3,
  eventsGenerated: 5,
  narrative: "..."
}

// After
{
  executionTime: 125,
  rulesExecuted: 3,
  eventsGenerated: 5,
  narrative: "...",
  truthsCreated: ["truth_1", "truth_2", "truth_3"]  // NEW
}
```

## Testing Scenarios

### Scenario 1: Simple Narrative Generation

**Setup:**
- 1 rule with `tracery_generate("succession_ceremony", {heir: "John"})`
- 1 grammar `succession_ceremony`
- 2 characters (John, Mary)

**Expected Behavior:**
1. Run simulation
2. Rule fires at t=0
3. Tracery generates narrative
4. Truth entry created automatically
5. Timeline shows 1 event at t=0
6. Event card displays narrative and links John

**Verification:**
```sql
SELECT * FROM truths WHERE source = 'simulation_generated'
```

### Scenario 2: Multi-Timestep Simulation

**Setup:**
- Simulation with `startTime=0`, `endTime=50`
- Multiple rules that fire at different timesteps

**Expected Behavior:**
1. Events created at t=0, t=15, t=30, t=45
2. Timeline range auto-calculated to 0-45
3. User can scrub to see each event
4. Past/Present/Future tabs update dynamically

### Scenario 3: Character Linking

**Setup:**
- Rule with `tracery_generate("battle", {attacker: "Alice", defender: "Bob"})`
- 2 characters: Alice and Bob

**Expected Behavior:**
1. Truth entry created with `relatedCharacterIds = [alice_id, bob_id]`
2. Timeline event shows "Related: Alice, Bob"
3. Can filter events by character involvement

## Database Impact

### Truth Table Growth

For each simulation:
- **1 Truth entry per Tracery narrative** generated
- **1 Truth entry per non-narrative event** (optional, via `createTruthsForEvents()`)

**Example:**
- 10-step simulation
- 3 rules fire per step
- 2 Tracery narratives per rule execution
- Total: **60 Truth entries** created

### Storage Considerations

```typescript
// Typical Truth entry size
{
  id: 36 bytes (UUID)
  worldId: 36 bytes
  timestep: 4 bytes
  title: ~50 bytes
  content: ~200 bytes (narrative text)
  sourceData: ~150 bytes (JSON)
  tags: ~50 bytes
  Total: ~526 bytes per entry
}
```

**For 100-timestep simulation:**
- ~60,000 bytes (58 KB) of Truth data
- Indexed by worldId, timestep, source
- Queryable via timeline UI

## Performance Optimizations

### Client-Side Filtering

SimulationTimelineView filters truths client-side:
```typescript
const simulationTruths = allTruths.filter(truth =>
  truth.source === 'simulation_generated' &&
  truth.sourceData?.simulationId === simulationId
);
```

**Benefits:**
- No additional API calls per timestep change
- Instant timeline scrubbing
- Shared query cache with World Truth feature

### Database Queries

```sql
-- Single query to load all simulation truths
SELECT * FROM truths
WHERE worldId = ?
  AND source = 'simulation_generated'
```

## Integration with Existing Features

### World Truth Tab

Simulation-generated truths **automatically appear** in World Truth:
- Filter by `source = 'simulation_generated'`
- See simulation events alongside user-created truths
- Use same timeline scrubbing interface
- Compare multiple simulation runs

### Character Pages

Related characters linked in truths:
- Can query `GET /api/characters/:id/truth`
- See simulation events affecting that character
- Track character development over simulation timesteps

## Future Enhancements

### Phase 3 Possibilities:

1. **Character State Snapshots**
   - Capture character attributes at each timestep
   - Show before/after diffs
   - Visualize character development arcs

2. **Rule Execution Sequence**
   - Show which rules fired in order
   - Display cause-effect chains
   - Highlight rule interactions

3. **Event Causality Graph**
   - Connect events via dependencies
   - Show "X led to Y which caused Z"
   - Interactive graph visualization

4. **Simulation Comparison**
   - Run multiple simulations
   - Compare timelines side-by-side
   - Identify divergence points

5. **Export Timeline as Story**
   - Convert Truth entries to narrative prose
   - Export as PDF/Markdown document
   - Include character sheets and world state

6. **Advanced Filtering**
   - Filter by character involvement
   - Filter by grammar type
   - Filter by importance level
   - Search narrative content

## Files Modified

| File | Changes |
|------|---------|
| `server/engines/unified-engine.ts` | Added Truth generation methods, timestep tracking |
| `server/routes.ts` | Added `truthsCreated` to results object |
| `client/src/components/SimulationTimelineView.tsx` | **NEW** - Complete timeline UI |
| `client/src/pages/modern.tsx` | Integrated timeline view into Simulations tab |

## Files Created

- ✅ `client/src/components/SimulationTimelineView.tsx` (335 lines)
- ✅ `PHASE2_IMPLEMENTATION.md` (this document)

## Summary

Phase 2 delivers a **complete simulation timeline system** that:

✅ Automatically creates Truth entries from simulation events
✅ Tracks timesteps for temporal navigation
✅ Provides rich timeline visualization with scrubbing
✅ Links characters to narrative events
✅ Integrates seamlessly with existing World Truth feature
✅ Requires zero manual intervention from users

**Result:** Users can now run simulations and **see exactly what happened at each timestep**, with full narrative context and character involvement tracking.

## Next Steps

**Ready for Testing:**
1. Create a simulation with rules using `tracery_generate()`
2. Run the simulation
3. Verify Truth entries created in database
4. Use timeline to scrub through events
5. Check Past/Present/Future tabs work correctly

**Recommended Test:**
```
1. Create rule with tracery_generate("succession_ceremony", {heir: ?heir.name})
2. Ensure succession_ceremony grammar exists (from seed data)
3. Run simulation
4. Verify timeline appears below results
5. Drag timeline dial to see events at different timesteps
```

The system is ready for end-to-end testing! 🎉
