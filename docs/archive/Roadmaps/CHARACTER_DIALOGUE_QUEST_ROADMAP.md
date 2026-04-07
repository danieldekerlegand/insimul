# Character Dialogue & Quest Integration Roadmap

## Executive Summary

This document outlines the current state of character dialogue and quest systems in Insimul, identifies gaps between the editor and 3D game implementations, and provides a phased roadmap for aligning and expanding these features to create a cohesive character-driven quest experience.

---

## Current State Analysis

### Character Dialogue System

#### Editor Implementation (`CharacterChatDialog.tsx`)
**Strengths:**
- ✅ Rich system prompt with character context (truths, personality, relationships, location)
- ✅ Language fluency awareness (French/English switching)
- ✅ Embedded quest assignment via `**QUEST_ASSIGN**` markers in AI responses
- ✅ Automatic quest creation from conversation context (`createAutomaticQuest`)
- ✅ Text-to-speech and speech-to-text support
- ✅ World context integration (world truths, target language)
- ✅ Quest type adaptation based on world type (language-learning vs RPG)

**Limitations:**
- ❌ Primarily used in editor context, not fully integrated with 3D game flow
- ❌ Quest completion tracking not directly linked to dialogue continuation
- ❌ No "talk to NPC to complete quest" objective handling
- ❌ Character knowledge of active quests is limited

#### 3D Game Implementation (`BabylonChatPanel.ts`)
**Strengths:**
- ✅ Babylon.js GUI-based chat interface
- ✅ Basic character context (name, age, gender, occupation)
- ✅ Voice recording and TTS playback
- ✅ Quest progress tracking hooks (`onVocabularyUsed`, `onConversationTurn`)
- ✅ Dialogue actions system (`BabylonDialogueActions.ts`)
- ✅ NPCTalkingIndicator visual feedback

**Limitations:**
- ❌ Simplified system prompt (missing truths, detailed personality)
- ❌ No quest assignment capability within game dialogue
- ❌ No quest completion detection when talking to quest giver
- ❌ Dialogue actions not connected to quest objectives
- ❌ No character awareness of player's active quests

### Quest System

#### Backend (`quest-generator.ts`, `quest-chain-manager.ts`)
**Strengths:**
- ✅ World-type-aware quest generation (language-learning, RPG)
- ✅ Quest chains with prerequisites
- ✅ Dialogue-context quest generation
- ✅ Multiple objective types support
- ✅ Flexible difficulty scaling

**Limitations:**
- ❌ `talk_to_npc` objective completion not triggered from actual dialogue
- ❌ Quest assignment from dialogue uses placeholder LLM (mock responses)
- ❌ No "return to NPC" quest completion flow

#### 3D Game (`QuestObjectManager.ts`, `BabylonQuestTracker.ts`)
**Strengths:**
- ✅ Comprehensive objective tracking (collect, visit, defeat, craft, etc.)
- ✅ `talk_to_npc` objective type defined
- ✅ Vocabulary and conversation turn tracking
- ✅ Quest waypoint system
- ✅ Visual quest indicators

**Limitations:**
- ❌ `trackNPCConversation()` exists but not called from chat panel
- ❌ No quest giver indicators (!, ?, ✓) on NPCs
- ❌ No quest acceptance dialog in 3D game
- ❌ No quest turn-in dialog when returning to NPC

---

## Gap Analysis: Editor vs 3D Game

| Feature | Editor | 3D Game | Gap |
|---------|--------|---------|-----|
| Character context depth | Full (truths, personality, relationships) | Basic (name, occupation) | High |
| Quest assignment via dialogue | ✅ Yes | ❌ No | Critical |
| Quest completion via dialogue | ❌ No | Partial (tracking only) | High |
| Talk-to-NPC objective completion | ❌ Not tracked | ❌ Not triggered | Critical |
| Quest giver indicators | N/A | ❌ No | Medium |
| Quest acceptance UI | ❌ Auto-created | ❌ No acceptance flow | High |
| Return-to-NPC quest flow | ❌ No | ❌ No | Critical |
| Dialogue affects quest state | ❌ One-way (creates) | ❌ Limited | High |

---

## Roadmap

### Phase 1: Align 3D Game Dialogue with Editor (Foundation) ✅ COMPLETED

**Goal:** Bring 3D game dialogue to feature parity with editor dialogue.

**Status:** Completed on Feb 6, 2026

#### 1.1 Enhance BabylonChatPanel System Prompt ✅
**File:** `client/src/components/3DGame/BabylonChatPanel.ts`

**Implemented:**
- Added `Truth` and `World` interfaces for type safety
- Enhanced `buildSystemPrompt()` to include:
  - Language fluency extraction from truths
  - Character truths (filtered by timestep)
  - World context (world truths)
  - Personality traits
  - Relationship context (friends, coworkers, spouse)
  - Quest assignment capability with `**QUEST_ASSIGN**` markers
- Added `fetchWorldData()` to load world context
- Added `parseAndCreateQuest()` to extract and create quests from AI responses
- Added `showQuestNotification()` for visual feedback on quest assignment

#### 1.2 Quest Assignment in 3D Game ✅
**Implemented:**
- AI can now assign quests using `**QUEST_ASSIGN**` markers
- Quests are automatically created via API
- Visual notification shown when quest assigned
- Quest tracker updates automatically

### Phase 2: Quest Completion via Dialogue ✅ COMPLETED

**Status:** Completed on Feb 6, 2026

#### 2.1 Talk-to-NPC Objective Completion ✅
**Implemented:**
- Added `onNPCConversationStarted` callback to BabylonChatPanel
- Connected to `QuestObjectManager.trackNPCConversation()` in BabylonGame
- NPC conversations now trigger quest objective completion

#### 2.2 Quest Turn-in Flow ✅
**Implemented:**
- Added `checkQuestTurnIn()` method to detect completable quests when talking to NPC
- Added `showQuestTurnInDialog()` for quest turn-in UI
- Added `turnInQuest()` to complete quest via API
- Added `showQuestCompletionCelebration()` for celebration animation
- Added `onQuestTurnedIn` callback for external tracking

#### 2.3 Quest Giver Indicators ✅
**File:** `client/src/components/3DGame/QuestIndicatorManager.ts` (NEW)

**Implemented:**
- Created `QuestIndicatorManager` class
- Visual indicators above NPCs:
  - `!` (gold) - NPC has available quest
  - `?` (silver) - Quest in progress from this NPC
  - `✓` (green) - Quest ready to turn in
- Floating animation for indicators
- Auto-update when quests change
- Integrated with BabylonGame

---

### Phase 3: Advanced Quest Features (Future)

```typescript
// Add truths and detailed context to buildSystemPrompt()
private async buildSystemPrompt(truths: any[]): Promise<string> {
  // Include:
  // - Character truths (filtered by timestep)
  // - Personality traits
  // - Relationships (friends, coworkers, spouse)
  // - World truths/context
  // - Language skills
  // - Quest assignment capability
  // - Active quest awareness
}
```

**Tasks:**
- [ ] Pass truths array to BabylonChatPanel.show()
- [ ] Implement full system prompt building (match CharacterChatDialog)
- [ ] Add world context fetching
- [ ] Include active quest information in prompt

#### 1.2 Add Quest Assignment to 3D Game Dialogue
**Files:** `BabylonChatPanel.ts`

```typescript
// Parse quest markers from AI response
private parseAndCreateQuest(response: string): Promise<string> {
  // Match **QUEST_ASSIGN** ... **END_QUEST** blocks
  // Create quest via API
  // Trigger onQuestAssigned callback
  // Return cleaned response
}
```

**Tasks:**
- [ ] Port `parseAndCreateQuest` from CharacterChatDialog
- [ ] Connect to `onQuestAssigned` callback (already exists)
- [ ] Add toast notification for quest creation
- [ ] Update quest tracker after assignment

---

### Phase 2: Quest-Dialogue Integration (Core)

**Goal:** Enable quests to be completed by talking to characters.

#### 2.1 Talk-to-NPC Objective Completion
**File:** `BabylonChatPanel.ts`, `QuestObjectManager.ts`

When player talks to an NPC, check if any active quests have `talk_to_npc` objectives for that NPC.

```typescript
// In BabylonChatPanel - when conversation starts
public show(character: Character, truths: any[], npcMesh?: Mesh) {
  // ... existing code ...
  
  // Check for quest objectives
  this.checkQuestObjectives(character.id);
}

private checkQuestObjectives(npcId: string) {
  // Notify QuestObjectManager to track conversation
  this.onNPCConversationStarted?.(npcId);
}
```

**Tasks:**
- [ ] Add `onNPCConversationStarted` callback to BabylonChatPanel
- [ ] Connect callback to QuestObjectManager.trackNPCConversation()
- [ ] Trigger objective completion when matching NPC is talked to
- [ ] Show objective completion notification

#### 2.2 Quest Turn-In Flow
**New Feature:** When player returns to quest giver after completing objectives, allow them to turn in the quest.

```typescript
// New method in BabylonChatPanel
private async checkQuestTurnIn(characterId: string) {
  // Get quests assigned by this character
  const quests = await this.getQuestsFromNPC(characterId);
  
  // Find quests ready to turn in (all objectives complete)
  const completableQuests = quests.filter(q => 
    q.status === 'active' && 
    this.allObjectivesComplete(q)
  );
  
  if (completableQuests.length > 0) {
    // Show turn-in dialog
    this.showQuestTurnInDialog(completableQuests);
  }
}
```

**Tasks:**
- [ ] Add quest completion check on dialogue open
- [ ] Create quest turn-in UI panel
- [ ] Handle reward distribution
- [ ] Update quest status to 'completed'
- [ ] Show completion celebration/notification

#### 2.3 Quest Giver Indicators
**File:** Create `client/src/components/3DGame/QuestIndicatorManager.ts`

Display visual indicators above NPCs:
- **!** (yellow) - Has available quest
- **?** (yellow) - Quest in progress (assigned by this NPC)
- **✓** (green) - Quest ready to turn in

```typescript
export class QuestIndicatorManager {
  private indicators: Map<string, GUI.TextBlock> = new Map();
  
  public updateIndicators(npcs: Character[], quests: Quest[]) {
    npcs.forEach(npc => {
      const indicator = this.getIndicatorForNPC(npc, quests);
      this.setIndicator(npc.id, indicator);
    });
  }
  
  private getIndicatorForNPC(npc: Character, quests: Quest[]): string | null {
    // Check if NPC has quest ready to turn in
    const turnInQuest = quests.find(q => 
      q.assignedByCharacterId === npc.id && 
      q.status === 'active' && 
      this.isQuestComplete(q)
    );
    if (turnInQuest) return '✓'; // Green checkmark
    
    // Check if NPC has active quest
    const activeQuest = quests.find(q => 
      q.assignedByCharacterId === npc.id && 
      q.status === 'active'
    );
    if (activeQuest) return '?'; // Yellow question mark
    
    // Check if NPC can give new quest (based on character role, personality, etc.)
    if (this.canGiveQuest(npc)) return '!'; // Yellow exclamation
    
    return null;
  }
}
```

**Tasks:**
- [ ] Create QuestIndicatorManager class
- [ ] Integrate with NPC rendering system
- [ ] Update indicators when quests change
- [ ] Add pulsing/animation effects

---

### Phase 3: Dialogue-Driven Quest Objectives (Advanced)

**Goal:** Allow quests to be completed entirely through dialogue choices and conversation.

#### 3.1 Dialogue-Based Quest Objectives
Add new objective types that are completed through conversation:

```typescript
export type DialogueObjectiveType =
  | 'ask_about_topic'      // Ask NPC about specific topic
  | 'convince_npc'         // Persuade NPC to do something
  | 'gather_information'   // Learn specific information
  | 'deliver_message'      // Deliver verbal message to NPC
  | 'negotiate'            // Reach agreement with NPC
  | 'interrogate'          // Extract information from NPC
  | 'befriend'             // Increase relationship to threshold
  | 'intimidate';          // Successfully intimidate NPC
```

**Implementation:**
```typescript
// Track dialogue choices and AI responses for objective completion
private trackDialogueObjective(
  userMessage: string, 
  aiResponse: string, 
  npcId: string
) {
  const activeQuests = this.getActiveQuestsWithNPC(npcId);
  
  activeQuests.forEach(quest => {
    quest.objectives.forEach(objective => {
      if (this.isDialogueObjective(objective)) {
        this.evaluateDialogueObjective(objective, userMessage, aiResponse);
      }
    });
  });
}

// Use AI to evaluate if objective is satisfied
private async evaluateDialogueObjective(
  objective: QuestObjective,
  userMessage: string,
  aiResponse: string
): Promise<boolean> {
  const prompt = `Given this conversation:
    User: ${userMessage}
    NPC: ${aiResponse}
    
    Does this satisfy the objective: "${objective.description}"?
    Respond with YES or NO and brief explanation.`;
  
  const result = await this.callAI(prompt);
  return result.includes('YES');
}
```

**Tasks:**
- [ ] Define dialogue objective types in schema
- [ ] Implement objective tracking in chat panel
- [ ] Add AI-based objective evaluation
- [ ] Create dialogue objective completion notifications

#### 3.2 Branching Dialogue with Quest Consequences
Allow dialogue choices to affect quest outcomes:

```typescript
interface DialogueChoice {
  id: string;
  text: string;
  questEffects?: {
    completeObjective?: string;  // Objective ID to complete
    failObjective?: string;      // Objective ID to fail
    unlockBranch?: string;       // Quest branch to unlock
    modifyRelationship?: {
      npcId: string;
      amount: number;
    };
  };
}
```

**Tasks:**
- [ ] Design branching dialogue schema
- [ ] Implement choice-based quest effects
- [ ] Add quest failure conditions
- [ ] Create branching quest visualization

#### 3.3 Character Memory of Quest Conversations
Characters remember previous quest-related conversations:

```typescript
interface QuestConversationMemory {
  questId: string;
  npcId: string;
  conversationSummary: string;
  keyTopicsDiscussed: string[];
  lastInteraction: Date;
  playerChoices: string[];
}

// Include in system prompt
const questMemory = await this.getQuestConversationMemory(characterId);
const memoryContext = questMemory.map(m => 
  `Previous conversation about "${m.questId}": ${m.conversationSummary}`
).join('\n');
```

**Tasks:**
- [ ] Create conversation memory storage
- [ ] Summarize quest conversations
- [ ] Include memory in character prompts
- [ ] Allow characters to reference past discussions

---

### Phase 4: NPC-Initiated Interactions (Enhancement)

**Goal:** Allow NPCs to proactively offer quests and information.

#### 4.1 NPC Quest Offering System
NPCs can approach the player to offer quests:

```typescript
interface NPCQuestOffer {
  npcId: string;
  questTemplate: string;
  triggerConditions: {
    playerLevel?: number;
    completedQuests?: string[];
    relationshipThreshold?: number;
    proximityRequired?: boolean;
    timeOfDay?: string;
  };
  offerDialogue: string;
}

// In NPC behavior system
public checkQuestOffers(player: Player) {
  this.questOffers.forEach(offer => {
    if (this.meetsConditions(player, offer.triggerConditions)) {
      this.initiateQuestOffer(offer);
    }
  });
}
```

**Tasks:**
- [ ] Design quest offer trigger system
- [ ] Implement NPC approach behavior
- [ ] Create quest offer dialogue UI
- [ ] Add ambient NPC callouts ("Psst! Over here!")

#### 4.2 Dynamic Quest Generation from Conversation
Generate quests dynamically based on conversation topics:

```typescript
// When player asks about problems, rumors, work, etc.
private async generateContextualQuest(
  conversation: Message[],
  character: Character,
  world: World
): Promise<Quest | null> {
  const prompt = `Based on this conversation with ${character.name}:
    ${conversation.map(m => `${m.role}: ${m.content}`).join('\n')}
    
    Generate a relevant quest that fits:
    - Character's role: ${character.occupation}
    - World type: ${world.worldType}
    - Current topics discussed
    
    Return null if no natural quest opportunity exists.`;
  
  return await this.generateQuest(prompt);
}
```

**Tasks:**
- [ ] Implement contextual quest detection
- [ ] Create natural quest emergence in dialogue
- [ ] Balance quest generation frequency
- [ ] Add player control over auto-quest generation

---

### Phase 5: Multi-NPC Quest Interactions (Complex)

**Goal:** Support quests involving multiple NPCs and interconnected conversations.

#### 5.1 Information Gathering Quests
Player must talk to multiple NPCs to piece together information:

```typescript
interface InformationGatheringQuest {
  questId: string;
  informationPieces: {
    id: string;
    npcId: string;
    topic: string;
    clueText: string;
    obtained: boolean;
  }[];
  requiredPieces: number;
  solution?: string; // Revealed when enough pieces gathered
}
```

**Tasks:**
- [ ] Design information piece schema
- [ ] Track gathered information
- [ ] Reveal conclusions when threshold met
- [ ] Add clue journal/notes UI

#### 5.2 NPC Referral System
NPCs can direct player to other NPCs:

```typescript
// Character knows about other characters and can provide directions
const referralPrompt = `If player asks about ${topic}, you might suggest:
  - ${relatedNPC.name} at ${relatedNPC.location} knows about this
  - You heard ${rumorSource.name} talking about similar things`;
```

**Tasks:**
- [ ] Build NPC knowledge graph
- [ ] Implement referral dialogue
- [ ] Track referral chains for quests
- [ ] Add "X sent me" dialogue options

#### 5.3 Negotiation/Mediation Quests
Player must negotiate between NPCs:

```typescript
interface MediationQuest {
  questId: string;
  parties: {
    npcId: string;
    position: string;
    acceptableOutcomes: string[];
  }[];
  successCondition: 'agreement' | 'compromise' | 'one_sided';
  currentState: 'gathering_info' | 'negotiating' | 'resolved' | 'failed';
}
```

**Tasks:**
- [ ] Design mediation quest structure
- [ ] Track NPC positions and flexibility
- [ ] Implement negotiation dialogue system
- [ ] Add reputation consequences

---

## Implementation Priority

### High Priority (Phase 1-2)
1. **Enhance 3D game system prompt** - Critical for feature parity
2. **Add quest assignment to 3D game dialogue** - Core functionality gap
3. **Implement talk-to-NPC objective completion** - Currently broken
4. **Add quest turn-in flow** - Essential for quest completion
5. **Quest giver indicators** - Important UX improvement

### Medium Priority (Phase 3)
6. **Dialogue-based objectives** - Enhances quest variety
7. **Branching dialogue consequences** - Adds depth
8. **Conversation memory** - Improves immersion

### Lower Priority (Phase 4-5)
9. **NPC-initiated quests** - Nice-to-have
10. **Dynamic quest generation** - Advanced feature
11. **Multi-NPC quests** - Complex feature

---

## Technical Dependencies

### Schema Changes
```typescript
// Add to quests table
dialogueObjectives: jsonb("dialogue_objectives"),
conversationMemory: jsonb("conversation_memory"),
questGiverIndicator: varchar("quest_giver_indicator"), // '!', '?', '✓'

// Add to characters table  
canGiveQuests: boolean("can_give_quests").default(true),
questTopics: text("quest_topics").array(),
```

### New API Endpoints
```typescript
// Quest-dialogue endpoints
POST /api/quests/:questId/turn-in
GET /api/characters/:characterId/available-quests
POST /api/quests/:questId/dialogue-progress
GET /api/quests/by-npc/:npcId

// Dialogue memory
GET /api/characters/:characterId/conversation-memory
POST /api/characters/:characterId/conversation-memory
```

### New Components
- `QuestIndicatorManager.ts` - NPC quest indicators
- `QuestTurnInDialog.ts` - Babylon.js turn-in UI
- `QuestAcceptanceDialog.ts` - Babylon.js acceptance UI
- `DialogueObjectiveTracker.ts` - Track dialogue objectives

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Talk-to-NPC quest completion rate | 90%+ |
| Quest turn-in success rate | 95%+ |
| Dialogue-based quests completed | Track adoption |
| Player engagement with NPC dialogue | +25% |
| Quest assignment via dialogue (3D game) | Feature parity with editor |

---

## Timeline Estimate

| Phase | Duration | Prerequisites |
|-------|----------|---------------|
| Phase 1 | 1-2 weeks | None |
| Phase 2 | 2-3 weeks | Phase 1 |
| Phase 3 | 2-3 weeks | Phase 2 |
| Phase 4 | 2-3 weeks | Phase 3 |
| Phase 5 | 3-4 weeks | Phase 4 |

**Total: 10-15 weeks for full implementation**

---

## References

- `client/src/components/CharacterChatDialog.tsx` - Editor dialogue implementation
- `client/src/components/3DGame/BabylonChatPanel.ts` - 3D game dialogue
- `client/src/components/3DGame/QuestObjectManager.ts` - Quest tracking
- `server/services/quest-generator.ts` - Quest generation
- `docs/QUEST_SYSTEM_ENHANCEMENT_PLAN.md` - Quest system architecture
- `docs/RPG_ACTIONS_QUESTS_PLAN.md` - Action/quest UX design
