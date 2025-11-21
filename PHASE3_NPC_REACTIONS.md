# Phase 3: NPC Reactions Implementation

## Overview
Phase 3 adds dynamic NPC behavioral responses to rule violations, creating a living world where NPCs react realistically to player actions. This includes flee behavior, disposition changes, and guard spawning.

## ✅ Implementation Summary

All three major NPC reaction features have been successfully implemented:
1. **NPC Flee Behavior** - Civilians flee from violations
2. **NPC Disposition System** - NPCs change attitude based on player reputation
3. **Guard NPC Spawning** - Guards appear to enforce rules

---

## Feature 1: NPC Behavioral States

### NPCState Type
```typescript
type NPCState = 'idle' | 'fleeing' | 'pursuing' | 'alert' | 'returning';
```

- **idle**: NPC at home position, no active behavior
- **fleeing**: NPC running away from danger (violations)
- **pursuing**: Guard chasing player
- **alert**: Guard on high alert, stationary
- **returning**: NPC walking back to home position

### NPCRole Type
```typescript
type NPCRole = 'civilian' | 'guard' | 'merchant' | 'questgiver';
```

NPCs are automatically categorized based on their `occupation` field:
- **guard**: Occupation contains "guard", "soldier", or "officer"
- **merchant**: Occupation contains "merchant", "shopkeeper", or "trader"
- **questgiver**: NPC has quest marker
- **civilian**: Default role

### Extended NPCInstance Interface
```typescript
interface NPCInstance {
  mesh: Mesh;
  controller?: CharacterController | null;
  questMarker?: Mesh | null;

  // New behavioral fields
  state: NPCState;
  role: NPCRole;
  homePosition?: Vector3;      // Original spawn position
  stateExpiry?: number;        // Timestamp when state expires
  fleeTarget?: Vector3;        // Where NPC is fleeing to
  pursuitTarget?: Vector3;     // Where guard is pursuing
  disposition: number;         // -100 to +100
}
```

---

## Feature 2: NPC Flee Behavior

### Implementation: `triggerNPCFlee()`
**Location**: `BabylonWorld.tsx:2898-2937`

When rule violations occur (combat or banishment), civilian NPCs flee away from the player.

```typescript
function triggerNPCFlee(
  npcMeshesRef: Map<string, NPCInstance>,
  epicenter: Vector3,
  fleeRadius: number = 100
)
```

**Parameters**:
- `npcMeshesRef`: Map of all active NPCs
- `epicenter`: Center point of danger (player position)
- `fleeRadius`: Distance within which NPCs will flee (default 100 units)

**Behavior**:
1. Calculate distance from each NPC to epicenter
2. If NPC is within flee radius:
   - Set state to `'fleeing'`
   - Calculate flee direction (away from epicenter)
   - Set flee target 50 units away
   - Apply pale/fear color tint (RGB: 0.9, 0.9, 0.95)
   - Set state expiry to 5 seconds

**Visual Feedback**:
- NPCs turn slightly pale/white when fleeing (fear effect)
- NPCs move at 0.5 units/frame toward flee target
- After reaching flee target, NPCs return home

**Notes**:
- Guards never flee (role === 'guard')
- Original material color is restored when returning to idle

---

## Feature 3: Guard NPC Spawning

### Implementation: `spawnGuardNPC()`
**Location**: `BabylonWorld.tsx:2939-3017`

Dynamically spawns hostile guard NPCs when combat penalty is triggered.

```typescript
async function spawnGuardNPC({
  settlement,
  scene,
  targetPosition
}: {
  settlement: { id: string; name: string; position: Vector3 };
  scene: Scene;
  targetPosition?: Vector3;
}): Promise<NPCInstance | null>
```

**Parameters**:
- `settlement`: Settlement where guard spawns
- `scene`: Babylon.js scene
- `targetPosition`: Optional player position for pursuit

**Behavior**:
1. Clone NPC template mesh
2. Spawn near settlement center (random offset ±5 units)
3. Apply red armor material (diffuse: RGB 0.8, 0.2, 0.2)
4. Set role to `'guard'`
5. Set state to `'pursuing'` if targetPosition provided, else `'alert'`
6. Set disposition to -100 (hostile)

**Visual Features**:
- Guards have distinctive red armor/clothing
- Guards move faster than civilians (0.7 units/frame vs 0.5)
- Guards pursue player position
- Guards become alert when reaching player

**Integration**:
- Spawned during combat penalty (violation #3)
- 2 guards spawn per combat violation
- Guards are added to npcMeshesRef for state management
- Guards show "Guards Alerted!" toast notification

---

## Feature 4: NPC Disposition System

### Implementation: `updateNPCDispositions()`
**Location**: `BabylonWorld.tsx:3019-3055`

NPCs gradually adjust their attitude toward the player based on reputation score.

```typescript
function updateNPCDispositions(
  npcMeshesRef: Map<string, NPCInstance>,
  reputationScore: number
)
```

**Disposition Mechanics**:
- Disposition range: -100 (hostile) to +100 (friendly)
- Disposition moves 20% toward reputation score each update
- Smooth transition creates gradual attitude changes
- Visual feedback via material color tinting

**Color Coding**:
| Disposition | Color Tint | Visual Effect |
|------------|------------|---------------|
| < -50 (Hostile) | Red | Original * 0.8 + (0.2, 0, 0) |
| -50 to 50 (Neutral) | Normal | Original color restored |
| > 50 (Friendly) | Green | Original * 0.8 + (0, 0.2, 0.1) |

**Notes**:
- Only affects civilians (guards excluded)
- Only applies when NPC is in `'idle'` state
- Original color metadata must be stored on spawn
- Updated automatically when `currentReputation` changes

---

## Feature 5: NPC State Update Loop

### Implementation: useEffect Hook
**Location**: `BabylonWorld.tsx:1432-1530`

Continuous update loop managing NPC behaviors based on their state.

**Update Frequency**: Every 100ms

**State Transitions**:

#### Fleeing → Returning
- When NPC reaches flee target (distance < 2 units)
- Or when state expires (5 seconds)

#### Returning → Idle
- When NPC reaches home position (distance < 1 unit)
- Original material color restored

#### Pursuing → Alert
- When guard reaches player (distance < 5 units)
- Guard stays alert for 10 seconds

#### Alert → Idle
- When alert state expires (10 seconds)

**Movement Speeds**:
- Fleeing: 0.5 units/frame
- Returning: 0.3 units/frame
- Pursuing (guards): 0.7 units/frame

---

## Integration with Graduated Enforcement

### Violation Level Reactions

| Violation # | Penalty Level | NPC Reaction |
|------------|---------------|--------------|
| 1 | Warning | None |
| 2 | Fine | None |
| 3 | Combat | **NPCs flee** + **2 guards spawn** |
| 4+ | Banishment | **NPCs flee** + player expelled |

### handleViolation() Integration
**Location**: `BabylonWorld.tsx:1069-1118`

```typescript
// Combat penalty (level 3)
if (violationResult.penaltyApplied === 'combat') {
  // Trigger NPC flee within 100 units
  triggerNPCFlee(npcMeshesRef.current, playerPos, 100);

  // Spawn 2 guard NPCs
  for (let i = 0; i < 2; i++) {
    spawnGuardNPC({...}).then(guard => {
      npcMeshesRef.current.set(guardId, guard);
    });
  }
}

// Banishment penalty (level 4)
if (violationResult.penaltyApplied === 'banishment') {
  // Wider flee radius for dramatic effect
  triggerNPCFlee(npcMeshesRef.current, playerPos, 120);
}
```

### Disposition Update Integration
**Location**: `BabylonWorld.tsx:1532-1537`

Automatically triggered when `currentReputation` changes:
```typescript
useEffect(() => {
  if (currentReputation && npcMeshesRef.current.size > 0) {
    updateNPCDispositions(npcMeshesRef.current, currentReputation.score);
  }
}, [currentReputation]);
```

---

## Testing Instructions

### Test 1: NPC Flee Behavior
1. Start game and enter a settlement with NPCs
2. Press **V** key twice (get to violation #2)
3. Press **V** third time (combat penalty)
4. **Expected Results**:
   - All civilian NPCs within 100 units turn pale and run away
   - NPCs move away from player position
   - After 5 seconds, NPCs walk back to home positions
   - NPC colors restore to normal when home

### Test 2: Guard Spawning
1. Follow "Test 1" to trigger combat penalty
2. **Expected Results**:
   - 2 guard NPCs spawn near settlement center
   - Guards have red armor/clothing
   - Guards move toward player position
   - Toast shows "Guards Alerted!" message
   - Guards become stationary when reaching player (5 unit range)
   - Guards stay alert for 10 seconds

### Test 3: NPC Disposition Changes
1. Enter a settlement and observe NPC colors (normal)
2. Press **V** once (warning) - NPC colors unchanged
3. Press **V** again (fine) - NPCs turn slightly red
4. Press **V** again (combat) - NPCs turn more red (hostile)
5. **Expected Results**:
   - NPC colors gradually shift based on reputation
   - Hostile: Red tint
   - Neutral: Normal color
   - Friendly: Green tint (after positive reputation gain)

### Test 4: State Persistence
1. Trigger NPC flee (violation #3)
2. Watch NPCs flee for 5 seconds
3. Observe NPCs return home
4. **Expected Results**:
   - NPCs flee → return → idle state progression
   - Movement speeds: flee (0.5) > return (0.3)
   - Colors: pale during flee → normal when idle

---

## Code Organization

### New Types & Interfaces
- `BabylonWorld.tsx:117-135` - NPCState, NPCRole, extended NPCInstance

### New Functions
- `BabylonWorld.tsx:2898-2937` - `triggerNPCFlee()`
- `BabylonWorld.tsx:2939-3017` - `spawnGuardNPC()`
- `BabylonWorld.tsx:3019-3055` - `updateNPCDispositions()`

### Modified Functions
- `BabylonWorld.tsx:2880-2996` - `spawnNPCInstance()` - Added role detection, state init, color metadata
- `BabylonWorld.tsx:988-1120` - `handleViolation()` - Added NPC reaction triggers

### New Hooks
- `BabylonWorld.tsx:1432-1530` - NPC state update loop
- `BabylonWorld.tsx:1532-1537` - Disposition update on reputation change

---

## Technical Details

### Material Color Metadata
Each NPC material stores original color:
```typescript
mat.metadata = { originalColor: mat.diffuseColor.clone() };
```

This allows:
- Flee behavior to apply pale tint
- Disposition system to apply red/green tints
- Color restoration when returning to idle

### Guard Identification
Guards are identifiable by:
1. Role field: `npc.role === 'guard'`
2. Visual: Red material (diffuse: 0.8, 0.2, 0.2)
3. Behavior: Never flee, always pursue
4. Disposition: Always -100 (hostile)

### State Management
States are managed via:
- `npc.state` - Current state
- `npc.stateExpiry` - Timestamp for auto-transition
- `npc.fleeTarget` / `npc.pursuitTarget` - Movement targets
- `npc.homePosition` - Return destination

---

## Performance Considerations

### Update Loop Optimization
- Runs every 100ms (not every frame)
- Only updates NPCs with active states
- Guards only pursue when in 'pursuing' state
- Early returns for missing mesh/data

### Guard Cleanup
**TODO**: Guards are currently persistent. Future enhancement:
- Despawn guards after 60 seconds of alert state
- Limit max guards per settlement (e.g., 4-6 max)
- Reuse guard instances instead of creating new ones

### Flee Radius
- Default: 100 units for combat
- 120 units for banishment
- Limits performance impact to nearby NPCs only

---

## Future Enhancements

### 1. NPC Dialogue Changes
Modify chat responses based on disposition:
- Hostile (<-50): "Get away from me!" / Refuse dialogue
- Unfriendly (-49 to 0): Short, curt responses
- Friendly (1-50): Normal dialogue
- Revered (51+): Enthusiastic, helpful responses

### 2. Guard Combat System
- Guards attack player on contact
- Health/damage system
- Defeat guards or flee to escape
- Reputation hit for attacking guards

### 3. Witness System
- Only NPCs who witness violation react
- Line-of-sight checks
- Distance-based awareness
- Reputation only changes if witnessed

### 4. NPC Memory
- NPCs remember past violations
- Faster disposition decline on repeat violations
- Permanent hostile disposition after severe violations
- Quest to restore individual NPC relationships

### 5. Role-Specific Behaviors
- Merchants: Refuse service when hostile
- Guards: Patrol routes when not pursuing
- Civilians: Report violations to guards
- Quest Givers: Lock quests based on disposition

---

## Files Modified

- ✅ `client/src/components/3DGame/BabylonWorld.tsx`
  - Added NPCState and NPCRole types
  - Extended NPCInstance interface with behavioral fields
  - Implemented triggerNPCFlee() function (+40 lines)
  - Implemented spawnGuardNPC() function (+79 lines)
  - Implemented updateNPCDispositions() function (+37 lines)
  - Added NPC state update loop useEffect (+99 lines)
  - Added disposition update useEffect (+6 lines)
  - Modified spawnNPCInstance() for role detection (+19 lines)
  - Modified handleViolation() for NPC reactions (+49 lines)
  - Added material color metadata storage (+7 lines)

### Total Lines Added: ~336 lines

---

## Testing Checklist

- [x] NPCs flee when combat violation triggered
- [x] NPCs have pale color tint when fleeing
- [x] NPCs return home after fleeing
- [x] NPCs restore original color when idle
- [x] Guards spawn at settlement during combat
- [x] Guards have red armor/clothing
- [x] Guards pursue player position
- [x] Guards become alert when reaching player
- [x] NPC disposition changes based on reputation
- [x] NPC color tints reflect disposition
- [x] State transitions work correctly (flee → return → idle)
- [x] Guards excluded from flee behavior
- [x] Movement speeds correct (flee: 0.5, return: 0.3, pursue: 0.7)
- [x] Toast notifications show for guard spawns

---

## Known Limitations

1. **Guard Persistence**: Guards remain indefinitely (no despawn)
2. **No Combat**: Guards don't damage player (visual only)
3. **No NPC Dialogue Integration**: Disposition doesn't affect chat yet
4. **Simple Movement**: NPCs move in straight lines (no pathfinding)
5. **No Collision**: NPCs can overlap during flee/return
6. **Memory**: NPCs don't remember past interactions (fresh each session)

These limitations are acceptable for Phase 3 and can be addressed in future phases as needed.

---

## Success Metrics

✅ **All Core Features Implemented**:
- 9. NPC Flee Behavior ✅
- 10. NPC Disposition Changes ✅
- 11. Guard NPC Spawning ✅

✅ **Integration Complete**:
- Flee triggers on combat/banishment violations ✅
- Guards spawn on combat violations ✅
- Dispositions update with reputation changes ✅

✅ **Visual Feedback**:
- Color changes for flee/disposition ✅
- Red armor for guards ✅
- Smooth state transitions ✅

**Phase 3 is complete and ready for gameplay!**
