# Phase 2 Implementation Plan: Reputation System & NPC Reactions

## Overview
Phase 2 adds deep integration of rules into the gameplay through a reputation/karma system, NPC reactions, and graduated enforcement. This document outlines the complete implementation plan.

## ✅ Completed: Database Schema

The reputation system database schema has been implemented in `shared/schema.ts`:

### Reputations Table
```typescript
export const reputations = pgTable("reputations", {
  id, playthroughId, userId,
  entityType,  // settlement, country, faction, character
  entityId,    // ID of the entity
  score,       // -100 to 100
  violationCount, warningCount, lastViolation,
  violationHistory,  // Array of violation records
  standing,    // hostile, unfriendly, neutral, friendly, revered
  isBanned, banExpiry,
  totalFinesPaid, outstandingFines,
  hasDiscounts, hasSpecialAccess,
  // ... metadata fields
});
```

### Reputation Score Scale
- **-100 to -50**: Hostile/Enemy
- **-49 to -1**: Unfriendly
- **0**: Neutral (starting point)
- **1 to 50**: Friendly
- **51 to 100**: Revered/Hero

### Violation Tracking
Each violation records:
- Type of rule violated
- Severity (minor, moderate, severe)
- Timestamp
- Penalty applied (warning, fine, combat, banishment)

---

## 🔄 Remaining Implementation Tasks

### 1. API Endpoints (server/routes.ts)

#### GET /api/playthroughs/:playthroughId/reputations
Get all reputations for a playthrough

#### GET /api/playthroughs/:playthroughId/reputations/:settlementId
Get reputation for specific settlement

#### POST /api/playthroughs/:playthroughId/reputations/:settlementId/violate
Record a rule violation and adjust reputation
```typescript
{
  violationType: string,
  severity: 'minor' | 'moderate' | 'severe',
  ruleId: string,
  description: string
}
```

#### POST /api/playthroughs/:playthroughId/reputations/:settlementId/adjust
Manually adjust reputation (for quest rewards, etc.)
```typescript
{
  amount: number,  // -100 to 100
  reason: string
}
```

---

### 2. Reputation UI Display (client/src/components/3DGame/BabylonGUIManager.ts)

Add a reputation indicator panel to the HUD:

```typescript
private createReputationPanel() {
  // Panel showing current settlement reputation
  // - Settlement name
  // - Reputation bar (colored based on standing)
  // - Standing text (Hostile/Unfriendly/Neutral/Friendly/Revered)
  // - Warning indicator if violations > 0
  // - Ban indicator if banned
}

public updateReputation(data: {
  settlementName: string;
  score: number;
  standing: string;
  isBanned: boolean;
  violationCount: number;
}) {
  // Update the reputation display
  // Color the bar: red (hostile) -> yellow (neutral) -> green (friendly)
}
```

**Location**: Add to HUD (top-left or bottom-left)

---

### 3. Graduated Enforcement System

Implement progressive penalties based on violation count:

#### Enforcement Levels
1. **First Violation (Warning)**
   - Play warning sound (`playRuleWarningSound()`)
   - Toast notification: "Warning: [rule name]"
   - -5 reputation
   - No other penalty

2. **Second Violation (Fine)**
   - Play warning sound
   - Toast: "Fine imposed: 50 gold"
   - -10 reputation
   - Energy penalty: -20
   - Record outstanding fine

3. **Third Violation (Combat/Expulsion Attempt)**
   - Play violation sound (`playRuleViolationSound()`)
   - Toast: "Settlement guards alerted!"
   - -25 reputation
   - Spawn guard NPCs (if guard system exists)
   - OR Force teleport player outside zone

4. **Fourth+ Violation (Banishment)**
   - Play violation sound
   - Toast: "BANISHED from [settlement]"
   - -50 reputation (hostile standing)
   - Set `isBanned = true`
   - `banExpiry = now + 24 hours` (in-game time)
   - Force teleport outside zone
   - Zone boundary turns RED when banned

#### Implementation Location
Create `client/src/systems/ReputationEnforcement.ts`:

```typescript
export class ReputationEnforcement {
  checkViolation(playthrough: string, settlement: string, ruleType: string) {
    // 1. Fetch current reputation
    // 2. Increment violation count
    // 3. Determine penalty level
    // 4. Apply penalty
    // 5. Update reputation
    // 6. Play appropriate audio
    // 7. Show toast notification
  }

  applyPenalty(level: number, context: ViolationContext) {
    switch(level) {
      case 1: return this.applyWarning(context);
      case 2: return this.applyFine(context);
      case 3: return this.applyCombat(context);
      case 4: return this.applyBanishment(context);
    }
  }
}
```

---

### 4. NPC Reactions to Rule Violations

#### NPC Behavior Changes

**When player violates a rule in settlement:**

1. **Nearby NPCs React**
   - NPCs within 50 units look at player
   - Dialogue changes to negative ("You're not welcome here!")
   - Some NPCs may flee (civilians)

2. **Disposition Updates**
   - NPC's disposition toward player decreases
   - Affects dialogue options
   - Affects quest availability

3. **Guard Behavior** (if guard NPCs exist)
   - Guards move toward player
   - Issue verbal warning first
   - Attack if player doesn't leave/comply

#### Implementation Location
Modify `client/src/components/3DGame/BabylonWorld.tsx`:

```typescript
// In zone detection system, add:
function checkRuleViolations() {
  if (!currentZone) return;

  // Check if player is performing forbidden actions in this zone
  // (e.g., combat in safe zone, trespassing, etc.)

  if (violationDetected) {
    handleRuleViolation({
      settlementId: currentZone.id,
      ruleType: 'combat_in_settlement',
      severity: 'moderate'
    });
  }
}

function handleRuleViolation(violation: ViolationData) {
  // 1. Record violation via API
  // 2. Trigger NPC reactions
  // 3. Apply graduated penalty
  // 4. Update UI
}
```

---

### 5. NPC Flee Behavior

Add flee behavior when combat starts in settlements:

```typescript
function triggerNPCFlee(settlementId: string, epicenter: Vector3) {
  npcMeshesRef.current.forEach((npc, npcId) => {
    const npcPos = npc.mesh.position;
    const distance = Vector3.Distance(npcPos, epicenter);

    if (distance < 100) {  // Within flee radius
      // Calculate flee direction (away from epicenter)
      const fleeDirection = npcPos.subtract(epicenter).normalize();
      const fleeTarget = npcPos.add(fleeDirection.scale(50));

      // Animate NPC running away
      npc.controller?.moveTo(fleeTarget);

      // Change NPC state
      npc.state = 'fleeing';
      npc.fleeUntil = Date.now() + 5000; // Flee for 5 seconds
    }
  });
}
```

**Trigger conditions:**
- Player attacks in settlement
- Combat action detected in safe zone
- Explosion/loud noise in populated area

---

### 6. Zone Access Restrictions Based on Reputation

Modify zone detection to check reputation:

```typescript
// In zone detection system:
async function checkZoneAccess(zone: ZoneData) {
  const reputation = await fetchReputation(playthroughId, zone.id);

  if (reputation.isBanned) {
    // Block entry
    toast({
      title: "Access Denied",
      description: `You are banned from ${zone.name}`,
      variant: "destructive"
    });

    // Play violation sound
    playRuleViolationSound();

    // Push player back
    pushPlayerOutOfZone(zone);

    // Change zone boundary color to RED
    updateZoneBoundaryColor(zone.id, new Color3(1, 0, 0));

    return false;
  }

  if (reputation.standing === 'hostile') {
    // Allow entry but warn
    toast({
      title: "Hostile Territory",
      description: "You are not welcome here. Guards may attack on sight.",
      variant: "warning"
    });
  }

  return true;
}

function pushPlayerOutOfZone(zone: ZoneData) {
  const playerPos = playerMeshRef.current.position;
  const zoneCenter = zone.position;

  // Calculate direction away from zone center
  const pushDirection = playerPos.subtract(zoneCenter).normalize();
  const safePosition = zoneCenter.add(pushDirection.scale(zone.radius + 10));

  // Smoothly move player to safe position
  animatePlayerTo(safePosition);
}
```

---

### 7. Visual Indicators for Reputation

**Zone Boundary Color Changes:**
- **Green**: Friendly/Revered (current behavior)
- **Blue**: Neutral (current behavior)
- **Yellow**: Unfriendly (warning)
- **Red**: Hostile/Banned (danger)

**Minimap Changes:**
- Banned zones show with red border
- Friendly zones show with green fill
- Hostile zones pulse red

---

## Testing Plan

### Unit Tests
1. Reputation calculation
2. Violation tracking
3. Graduated enforcement logic

### Integration Tests
1. Full violation → penalty flow
2. Reputation affecting zone access
3. NPC reactions to violations
4. Ban expiry and restoration

### Manual Testing Scenarios

#### Scenario 1: Graduated Enforcement
1. Enter settlement (neutral reputation)
2. Commit minor violation → Warning
3. Commit second violation → Fine
4. Commit third violation → Combat alert
5. Commit fourth violation → Banishment
6. Verify unable to re-enter

#### Scenario 2: Reputation Recovery
1. Get banned from settlement
2. Wait for ban to expire (or complete redemption quest)
3. Re-enter settlement
4. Perform helpful actions to rebuild reputation

#### Scenario 3: NPC Reactions
1. Violate rule near NPCs
2. Verify NPCs react (look at player, change dialogue)
3. Verify flee behavior triggers appropriately

---

## File Changes Summary

### Modified Files
- ✅ `shared/schema.ts` - Added reputations table
- `server/routes.ts` - Add reputation endpoints
- `client/src/components/3DGame/BabylonWorld.tsx` - Violation detection & enforcement
- `client/src/components/3DGame/BabylonGUIManager.ts` - Reputation UI

### New Files
- `client/src/systems/ReputationEnforcement.ts` - Graduated enforcement logic
- `server/services/reputation-service.ts` - Reputation business logic
- `client/src/hooks/useReputation.ts` - React hook for reputation data

---

## API Design

### GET /api/playthroughs/:playthroughId/reputations
```json
{
  "settlements": [
    {
      "entityId": "settlement-123",
      "entityType": "settlement",
      "name": "Rivertown",
      "score": 25,
      "standing": "friendly",
      "violationCount": 1,
      "isBanned": false
    }
  ]
}
```

### POST /api/playthroughs/:playthroughId/reputations/:entityId/violate
**Request:**
```json
{
  "violationType": "combat_in_safe_zone",
  "severity": "moderate",
  "ruleId": "rule-456",
  "description": "Player attacked NPC in marketplace"
}
```

**Response:**
```json
{
  "previousScore": 25,
  "newScore": 15,
  "previousStanding": "friendly",
  "newStanding": "neutral",
  "violationCount": 2,
  "penaltyApplied": "fine",
  "penaltyAmount": 50,
  "message": "Fine imposed: 50 gold. Second violation recorded."
}
```

---

## Next Steps

1. **Implement API Endpoints** (1-2 hours)
   - Add routes to `server/routes.ts`
   - Create `reputation-service.ts`

2. **Add Reputation UI** (1-2 hours)
   - Reputation panel in HUD
   - Update hook for real-time data

3. **Implement Graduated Enforcement** (2-3 hours)
   - Create `ReputationEnforcement.ts`
   - Integrate with zone detection
   - Test penalty progression

4. **Add NPC Reactions** (2-3 hours)
   - Implement flee behavior
   - Disposition changes
   - Guard spawning (if applicable)

5. **Zone Access Control** (1-2 hours)
   - Ban enforcement
   - Visual indicators
   - Push-back mechanism

6. **Testing & Polish** (2-3 hours)
   - Test all scenarios
   - Balance reputation values
   - Tune penalties

**Total Estimated Time: 9-16 hours**

---

## Future Enhancements (Phase 3+)

- **Faction System**: Reputation with multiple factions
- **Quest Integration**: Quests to restore reputation
- **Dynamic Pricing**: Merchants charge more/less based on reputation
- **Special Titles**: Achieve titles at high reputation (Hero, Champion, etc.)
- **Witness System**: Only lose reputation if NPCs witness violations
- **Reputation Decay**: Slowly restore reputation over time
- **Alliance Effects**: High reputation with one faction affects others

