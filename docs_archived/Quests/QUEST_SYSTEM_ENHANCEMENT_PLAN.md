# Quest System Enhancement Plan

## Executive Summary

The current quest system is tightly coupled with language-learning mechanics. While this works well for the original use case, it limits the system's flexibility for other game types. This plan outlines how to abstract the quest infrastructure to support multiple game types while maintaining backward compatibility with language-learning features.

## Current State Analysis

### Strengths
- ✅ Solid data structure with flexible objectives and rewards
- ✅ AI-driven quest generation through NPC dialogue
- ✅ Quest tracking infrastructure (QuestObjectManager)
- ✅ Visual feedback in 3D game (QuestTracker UI, quest objects)
- ✅ Multiple quest types and difficulty levels
- ✅ Experience points and reward system
- ✅ Automatic quest generation during world creation

### Limitations
- ❌ All quest types are language-learning focused (conversation, translation, vocabulary, grammar, cultural)
- ❌ Objective types limited to: collect_item, visit_location, talk_to_npc, use_vocabulary, complete_conversation
- ❌ No combat, crafting, building, or exploration objectives
- ❌ Quest generation doesn't adapt to world type/setting
- ❌ Limited quest progression (no chains, branching, or prerequisites)
- ❌ Minimal in-game quest guidance (no waypoints, quest zones)
- ❌ Rewards are primarily experience points (no items, skills, unlocks)
- ❌ No quest failure conditions or time limits

## Design Philosophy

### Core Principles

1. **Game Type Agnostic**: Quest infrastructure should work for any game type
2. **Backward Compatible**: Existing language-learning quests continue to work
3. **Modular Quest Types**: Quest types defined as plugins/modules
4. **World-Aware Generation**: Quest generation adapts to world setting
5. **Rich Player Experience**: Enhanced visual feedback and progression

### Quest Type Architecture

```typescript
// New abstraction layer
interface QuestTypeDefinition {
  id: string; // 'language-learning', 'rpg', 'strategy', etc.
  name: string;
  questCategories: QuestCategory[];
  objectiveTypes: ObjectiveType[];
  rewardTypes: RewardType[];
  difficultyScaling: DifficultyConfig;
  generationPrompt: (world: World) => string;
}

interface QuestCategory {
  id: string; // 'vocabulary', 'combat', 'crafting', etc.
  name: string;
  icon: string;
  description: string;
}

interface ObjectiveType {
  id: string; // 'use_vocabulary', 'defeat_enemies', 'craft_item', etc.
  name: string;
  trackingLogic: (context: GameContext) => number;
  completionCheck: (progress: any) => boolean;
  visualIndicator?: (scene: Scene, objective: Objective) => void;
}
```

## Implementation Plan

---

## Phase 1: Schema Extension & Abstraction

### 1.1 Extend Quest Schema

**File**: [shared/schema.ts](shared/schema.ts) (line ~514)

Add new fields to `quests` table:

```typescript
export const quests = pgTable("quests", {
  // ... existing fields ...

  // NEW: Game type this quest belongs to
  gameType: varchar("game_type", { length: 100 }).default("language-learning"),

  // NEW: Quest chain/series
  questChainId: varchar("quest_chain_id", { length: 255 }),
  questChainOrder: integer("quest_chain_order"),

  // NEW: Prerequisites
  prerequisiteQuestIds: text("prerequisite_quest_ids").array(),

  // NEW: Failure conditions
  failureConditions: jsonb("failure_conditions"),
  expiresAt: timestamp("expires_at"),

  // NEW: Enhanced rewards
  itemRewards: jsonb("item_rewards"), // [{itemId, quantity, name}]
  skillRewards: jsonb("skill_rewards"), // [{skillId, name, level}]
  unlocks: jsonb("unlocks"), // [{type: 'area' | 'npc' | 'feature', id}]

  // NEW: Quest giver/receiver
  questGiverId: varchar("quest_giver_id", { length: 255 }),
  questReceiverId: varchar("quest_receiver_id", { length: 255 }),

  // ... existing fields ...
});
```

### 1.2 Create Quest Type Registry

**File**: Create `shared/quest-types/index.ts`

```typescript
export const QUEST_TYPE_REGISTRY: Record<string, QuestTypeDefinition> = {
  'language-learning': languageLearningQuestType,
  'rpg': rpgQuestType,
  'strategy': strategyQuestType,
  'adventure': adventureQuestType,
  'survival': survivalQuestType,
};

export function getQuestTypeForWorld(world: World): QuestTypeDefinition {
  const gameType = world.gameType || world.worldType;
  return QUEST_TYPE_REGISTRY[gameType] || QUEST_TYPE_REGISTRY['language-learning'];
}
```

### 1.3 Define Language Learning Quest Type (Existing)

**File**: Create `shared/quest-types/language-learning.ts`

Extract existing logic into modular definition:

```typescript
export const languageLearningQuestType: QuestTypeDefinition = {
  id: 'language-learning',
  name: 'Language Learning',
  questCategories: [
    { id: 'conversation', name: 'Conversation', icon: '💬', description: 'Practice speaking' },
    { id: 'vocabulary', name: 'Vocabulary', icon: '📚', description: 'Learn new words' },
    { id: 'grammar', name: 'Grammar', icon: '📝', description: 'Master grammar patterns' },
    { id: 'translation', name: 'Translation', icon: '🔄', description: 'Translate text' },
    { id: 'cultural', name: 'Cultural', icon: '🌍', description: 'Learn about culture' },
  ],
  objectiveTypes: [
    {
      id: 'use_vocabulary',
      name: 'Use Vocabulary',
      trackingLogic: (context) => context.vocabularyUsage?.length || 0,
      completionCheck: (progress) => progress.vocabularyUsed >= progress.vocabularyRequired,
    },
    {
      id: 'complete_conversation',
      name: 'Complete Conversation',
      trackingLogic: (context) => context.conversationTurns || 0,
      completionCheck: (progress) => progress.conversationTurns >= progress.requiredTurns,
    },
    // ... other existing objective types
  ],
  rewardTypes: ['experience', 'fluency'],
  difficultyScaling: {
    beginner: { xp: 10, multiplier: 1 },
    intermediate: { xp: 25, multiplier: 1.5 },
    advanced: { xp: 50, multiplier: 2 },
  },
  generationPrompt: (world) => `Generate a language-learning quest for ${world.targetLanguage}...`,
};
```

### 1.4 Define RPG Quest Type (New)

**File**: Create `shared/quest-types/rpg.ts`

```typescript
export const rpgQuestType: QuestTypeDefinition = {
  id: 'rpg',
  name: 'RPG Quests',
  questCategories: [
    { id: 'combat', name: 'Combat', icon: '⚔️', description: 'Defeat enemies' },
    { id: 'collection', name: 'Collection', icon: '📦', description: 'Gather items' },
    { id: 'exploration', name: 'Exploration', icon: '🗺️', description: 'Discover locations' },
    { id: 'escort', name: 'Escort', icon: '🛡️', description: 'Protect NPCs' },
    { id: 'delivery', name: 'Delivery', icon: '📨', description: 'Transport items' },
    { id: 'crafting', name: 'Crafting', icon: '🔨', description: 'Create items' },
    { id: 'social', name: 'Social', icon: '🤝', description: 'Interact with NPCs' },
  ],
  objectiveTypes: [
    {
      id: 'defeat_enemies',
      name: 'Defeat Enemies',
      trackingLogic: (context) => context.enemiesDefeated || 0,
      completionCheck: (progress) => progress.defeated >= progress.required,
      visualIndicator: (scene, objective) => {
        // Spawn enemy markers
      },
    },
    {
      id: 'collect_items',
      name: 'Collect Items',
      trackingLogic: (context) => context.itemsCollected || 0,
      completionCheck: (progress) => progress.collected >= progress.required,
      visualIndicator: (scene, objective) => {
        // Spawn collectible markers
      },
    },
    {
      id: 'reach_location',
      name: 'Reach Location',
      trackingLogic: (context) => context.playerPosition,
      completionCheck: (progress) => Vector3.Distance(progress.playerPos, progress.targetPos) < 5,
      visualIndicator: (scene, objective) => {
        // Show waypoint
      },
    },
    // ... more RPG objectives
  ],
  rewardTypes: ['experience', 'items', 'gold', 'skills', 'reputation'],
  difficultyScaling: {
    easy: { xp: 50, gold: 100, multiplier: 1 },
    normal: { xp: 100, gold: 250, multiplier: 1.5 },
    hard: { xp: 200, gold: 500, multiplier: 2 },
    legendary: { xp: 500, gold: 1000, multiplier: 3 },
  },
  generationPrompt: (world) => {
    const setting = world.worldType || 'fantasy';
    return `Generate an RPG quest for a ${setting} world. Include combat, exploration, or social objectives appropriate to the setting.`;
  },
};
```

---

## Phase 2: Quest Generation Enhancement

### 2.1 World-Type-Aware Quest Generation

**File**: [server/routes.ts](server/routes.ts) (new endpoint)

Add new endpoint for generating quests based on world type:

```typescript
app.post('/api/worlds/:worldId/quests/generate', async (req, res) => {
  const { worldId } = req.params;
  const { count = 5, category, difficulty } = req.body;

  const world = await storage.getWorld(worldId);
  if (!world) return res.status(404).json({ error: 'World not found' });

  const questType = getQuestTypeForWorld(world);
  const generatedQuests = [];

  for (let i = 0; i < count; i++) {
    const quest = await generateQuestForType({
      world,
      questType,
      category: category || randomCategory(questType),
      difficulty: difficulty || 'normal',
    });

    const created = await storage.createQuest(quest);
    generatedQuests.push(created);
  }

  res.json({ quests: generatedQuests });
});

async function generateQuestForType(params: {
  world: World;
  questType: QuestTypeDefinition;
  category: string;
  difficulty: string;
}): Promise<InsertQuest> {
  const { world, questType, category, difficulty } = params;

  // Build AI prompt
  const prompt = `${questType.generationPrompt(world)}

Category: ${category}
Difficulty: ${difficulty}
World Setting: ${world.worldType}
World Description: ${world.description}

Generate a quest with:
- Title (appropriate to setting)
- Description (narrative context)
- 2-4 objectives from available types: ${questType.objectiveTypes.map(o => o.id).join(', ')}
- Rewards (${questType.rewardTypes.join(', ')})

Return JSON: { title, description, objectives: [{ type, description, target, required }], rewards: { ... } }`;

  const response = await callLLM(prompt);
  const questData = JSON.parse(response);

  // Map to schema
  return {
    worldId: world.id,
    gameType: questType.id,
    questType: category,
    difficulty,
    title: questData.title,
    description: questData.description,
    objectives: questData.objectives,
    experienceReward: questType.difficultyScaling[difficulty].xp,
    rewards: questData.rewards,
    status: 'available',
  };
}
```

### 2.2 Update Dialogue Quest Assignment

**File**: [client/src/components/CharacterChatDialog.tsx](client/src/components/CharacterChatDialog.tsx) (line ~221)

Update system prompt to be world-type aware:

```typescript
const questType = getQuestTypeForWorld(world);
const availableCategories = questType.questCategories.map(c => c.id).join(', ');
const availableObjectives = questType.objectiveTypes.map(o => o.id).join(', ');

const systemPrompt = `You are ${character.name} in a ${world.worldType} world.

When assigning quests, use this format:
**QUEST_ASSIGN**
Title: [quest title]
Type: [one of: ${availableCategories}]
Description: [quest description]
Objectives:
- [objective 1 (type: ${availableObjectives})]
- [objective 2]
Rewards:
- [reward 1]
- [reward 2]
**QUEST_ASSIGN_END**

Available quest categories: ${questType.questCategories.map(c => `${c.name} (${c.description})`).join(', ')}

Create quests that fit the ${world.worldType} setting and current conversation context.`;
```

---

## Phase 3: Enhanced Objective Tracking

### 3.1 Extend QuestObjectManager

**File**: [client/src/components/3DGame/QuestObjectManager.ts](client/src/components/3DGame/QuestObjectManager.ts)

Add new objective handlers:

```typescript
export class QuestObjectManager {
  // ... existing code ...

  // NEW: Track combat
  private enemiesDefeated: Map<string, number> = new Map();

  public registerEnemyDefeat(enemyType: string, questId: string): void {
    const key = `${questId}_${enemyType}`;
    const current = this.enemiesDefeated.get(key) || 0;
    this.enemiesDefeated.set(key, current + 1);

    this.checkQuestProgress(questId, 'defeat_enemies', {
      enemyType,
      defeated: current + 1,
    });
  }

  // NEW: Track crafting
  public registerItemCrafted(itemType: string, questId: string): void {
    this.checkQuestProgress(questId, 'craft_item', {
      itemType,
      crafted: true,
    });
  }

  // NEW: Track location discovery
  public registerLocationDiscovered(locationId: string): void {
    const activeQuests = this.getActiveQuests();

    for (const quest of activeQuests) {
      const objectives = quest.objectives.filter(
        (obj) => obj.type === 'discover_location' && obj.target === locationId
      );

      for (const objective of objectives) {
        this.checkQuestProgress(quest.id, 'discover_location', {
          locationId,
          discovered: true,
        });
      }
    }
  }

  // NEW: Generic progress checker
  private checkQuestProgress(
    questId: string,
    objectiveType: string,
    progressData: any
  ): void {
    const quest = this.activeQuests.find(q => q.id === questId);
    if (!quest) return;

    const objectives = quest.objectives.filter(obj => obj.type === objectiveType);

    for (const objective of objectives) {
      const questType = getQuestTypeForWorld(this.world);
      const objectiveTypeDef = questType.objectiveTypes.find(
        ot => ot.id === objectiveType
      );

      if (!objectiveTypeDef) continue;

      const isComplete = objectiveTypeDef.completionCheck({
        ...objective,
        ...progressData,
      });

      if (isComplete) {
        this.completeObjective(questId, objective.id);
      }
    }
  }

  // ... rest of existing code ...
}
```

### 3.2 Integrate with BabylonGame Combat

**File**: [client/src/components/3DGame/BabylonGame.ts](client/src/components/3DGame/BabylonGame.ts)

Add hooks for combat events:

```typescript
// In combat system (if exists) or add new combat manager
public handleEnemyDefeated(enemyType: string, enemyId: string): void {
  // Get active quests with combat objectives
  const activeQuests = this.questObjectManager?.getActiveQuests() || [];

  for (const quest of activeQuests) {
    const combatObjectives = quest.objectives.filter(
      obj => obj.type === 'defeat_enemies' && obj.target === enemyType
    );

    if (combatObjectives.length > 0) {
      this.questObjectManager?.registerEnemyDefeat(enemyType, quest.id);
    }
  }

  // Visual feedback
  this.showCombatReward(enemyType);
}
```

---

## Phase 4: Visual Enhancements

### 4.1 Quest Waypoint System

**File**: Create `client/src/components/3DGame/QuestWaypointManager.ts`

```typescript
import { Scene, Mesh, MeshBuilder, StandardMaterial, Color3, Vector3, Animation } from '@babylonjs/core';

export class QuestWaypointManager {
  private scene: Scene;
  private waypoints: Map<string, Mesh> = new Map();

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Create a waypoint marker for a quest objective
   */
  public createWaypoint(
    objectiveId: string,
    position: Vector3,
    color: Color3 = new Color3(1, 0.8, 0),
    height: number = 20
  ): void {
    if (this.waypoints.has(objectiveId)) {
      this.removeWaypoint(objectiveId);
    }

    // Create beam of light
    const beam = MeshBuilder.CreateCylinder(
      `waypoint_beam_${objectiveId}`,
      { height, diameter: 0.5 },
      this.scene
    );

    beam.position = position.clone();
    beam.position.y += height / 2;

    const beamMat = new StandardMaterial(`waypoint_mat_${objectiveId}`, this.scene);
    beamMat.emissiveColor = color;
    beamMat.alpha = 0.6;
    beam.material = beamMat;

    // Create top marker
    const marker = MeshBuilder.CreateSphere(
      `waypoint_marker_${objectiveId}`,
      { diameter: 2 },
      this.scene
    );

    marker.position = position.clone();
    marker.position.y += height + 1;
    marker.parent = beam;

    const markerMat = new StandardMaterial(`waypoint_marker_mat_${objectiveId}`, this.scene);
    markerMat.emissiveColor = color;
    markerMat.diffuseColor = color;
    marker.material = markerMat;

    // Pulsing animation
    const pulseAnim = new Animation(
      `waypoint_pulse_${objectiveId}`,
      'scaling',
      30,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    pulseAnim.setKeys([
      { frame: 0, value: new Vector3(1, 1, 1) },
      { frame: 30, value: new Vector3(1.3, 1.3, 1.3) },
      { frame: 60, value: new Vector3(1, 1, 1) },
    ]);

    marker.animations.push(pulseAnim);
    this.scene.beginAnimation(marker, 0, 60, true);

    this.waypoints.set(objectiveId, beam);
  }

  /**
   * Remove a waypoint
   */
  public removeWaypoint(objectiveId: string): void {
    const waypoint = this.waypoints.get(objectiveId);
    if (waypoint) {
      this.scene.stopAnimation(waypoint);
      waypoint.dispose();
      this.waypoints.delete(objectiveId);
    }
  }

  /**
   * Update waypoint position
   */
  public updateWaypointPosition(objectiveId: string, position: Vector3): void {
    const waypoint = this.waypoints.get(objectiveId);
    if (waypoint) {
      waypoint.position = position.clone();
      waypoint.position.y += waypoint.scaling.y / 2;
    }
  }

  /**
   * Clear all waypoints
   */
  public clearAll(): void {
    this.waypoints.forEach((waypoint, id) => {
      this.removeWaypoint(id);
    });
  }

  public dispose(): void {
    this.clearAll();
  }
}
```

### 4.2 Integrate Waypoints with Quest Tracker

**File**: [client/src/components/3DGame/BabylonQuestTracker.ts](client/src/components/3DGame/BabylonQuestTracker.ts)

Add waypoint toggle:

```typescript
import { QuestWaypointManager } from './QuestWaypointManager';

export class BabylonQuestTracker {
  private waypointManager: QuestWaypointManager;
  private showWaypoints: boolean = true;

  constructor(scene: Scene, worldId: string) {
    // ... existing code ...
    this.waypointManager = new QuestWaypointManager(scene);
  }

  private updateQuestDisplay(): void {
    // ... existing code ...

    // Update waypoints
    if (this.showWaypoints) {
      this.updateWaypoints();
    }
  }

  private updateWaypoints(): void {
    // Clear existing waypoints
    this.waypointManager.clearAll();

    // Add waypoints for active quest objectives
    for (const quest of this.activeQuests) {
      for (const objective of quest.objectives) {
        if (objective.completed) continue;

        // Different colors for different objective types
        let color = new Color3(1, 0.8, 0); // Gold default

        if (objective.type === 'defeat_enemies') {
          color = new Color3(1, 0, 0); // Red for combat
        } else if (objective.type === 'reach_location' || objective.type === 'discover_location') {
          color = new Color3(0, 1, 1); // Cyan for exploration
        } else if (objective.type === 'talk_to_npc') {
          color = new Color3(0, 1, 0); // Green for social
        }

        // Get position from objective data
        const position = this.getObjectivePosition(objective);
        if (position) {
          this.waypointManager.createWaypoint(
            objective.id,
            position,
            color
          );
        }
      }
    }
  }

  private getObjectivePosition(objective: any): Vector3 | null {
    // Extract position based on objective type
    if (objective.position) {
      return new Vector3(objective.position.x, objective.position.y, objective.position.z);
    }

    // For NPC objectives, find NPC position
    if (objective.type === 'talk_to_npc' && objective.target) {
      const npc = this.findNPCById(objective.target);
      if (npc) {
        return npc.position.clone();
      }
    }

    return null;
  }

  public dispose(): void {
    // ... existing code ...
    this.waypointManager.dispose();
  }
}
```

### 4.3 Enhanced Quest UI with Categories

**File**: [client/src/components/3DGame/BabylonQuestTracker.ts](client/src/components/3DGame/BabylonQuestTracker.ts)

Update quest card rendering to show category icons:

```typescript
private createQuestCard(quest: Quest): GUI.Rectangle {
  // ... existing code ...

  // Get quest type definition
  const questType = getQuestTypeForWorld(this.world);
  const category = questType.questCategories.find(c => c.id === quest.questType);

  // Add category icon
  if (category) {
    const iconText = new GUI.TextBlock();
    iconText.text = category.icon;
    iconText.fontSize = 24;
    iconText.color = 'white';
    iconText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    iconText.paddingLeft = '10px';
    iconText.paddingTop = '10px';
    card.addControl(iconText);
  }

  // ... rest of existing code ...
}
```

---

## Phase 5: Quest Chains & Prerequisites

### 5.1 Quest Chain Manager

**File**: Create `server/services/quest-chain-manager.ts`

```typescript
import type { Quest, InsertQuest } from '@shared/schema';

export interface QuestChain {
  id: string;
  name: string;
  description: string;
  worldId: string;
  quests: Quest[];
  isLinear: boolean; // If true, must complete in order
}

export class QuestChainManager {
  /**
   * Create a quest chain
   */
  async createQuestChain(
    chainData: Omit<QuestChain, 'quests'>,
    quests: InsertQuest[]
  ): Promise<QuestChain> {
    const chainId = `chain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Add chain info to each quest
    const chainQuests = quests.map((quest, index) => ({
      ...quest,
      questChainId: chainId,
      questChainOrder: index,
      prerequisiteQuestIds: chainData.isLinear && index > 0
        ? [quests[index - 1].id!]
        : [],
    }));

    // Save quests
    const createdQuests = [];
    for (const quest of chainQuests) {
      const created = await storage.createQuest(quest);
      createdQuests.push(created);
    }

    return {
      id: chainId,
      ...chainData,
      quests: createdQuests,
    };
  }

  /**
   * Check if player can accept a quest (prerequisites met)
   */
  async canAcceptQuest(quest: Quest, playerId: string): Promise<boolean> {
    if (!quest.prerequisiteQuestIds || quest.prerequisiteQuestIds.length === 0) {
      return true;
    }

    const playerQuests = await storage.getQuestsByPlayer(playerId);
    const completedQuestIds = playerQuests
      .filter(q => q.status === 'completed')
      .map(q => q.id);

    // Check if all prerequisites are completed
    return quest.prerequisiteQuestIds.every(prereqId =>
      completedQuestIds.includes(prereqId)
    );
  }

  /**
   * Get next quest in chain
   */
  async getNextQuestInChain(currentQuest: Quest): Promise<Quest | null> {
    if (!currentQuest.questChainId) return null;

    const chainQuests = await storage.getQuestsByChain(currentQuest.questChainId);
    const nextOrder = (currentQuest.questChainOrder || 0) + 1;

    return chainQuests.find(q => q.questChainOrder === nextOrder) || null;
  }

  /**
   * Get quest chain progress
   */
  async getChainProgress(chainId: string, playerId: string): Promise<{
    total: number;
    completed: number;
    current: Quest | null;
  }> {
    const chainQuests = await storage.getQuestsByChain(chainId);
    const playerQuests = await storage.getQuestsByPlayer(playerId);

    const completedCount = chainQuests.filter(q =>
      playerQuests.some(pq => pq.id === q.id && pq.status === 'completed')
    ).length;

    const currentQuest = chainQuests
      .filter(q => !playerQuests.some(pq => pq.id === q.id && pq.status === 'completed'))
      .sort((a, b) => (a.questChainOrder || 0) - (b.questChainOrder || 0))[0] || null;

    return {
      total: chainQuests.length,
      completed: completedCount,
      current: currentQuest,
    };
  }
}
```

### 5.2 Add Chain Generation Endpoint

**File**: [server/routes.ts](server/routes.ts)

```typescript
app.post('/api/worlds/:worldId/quest-chains/generate', async (req, res) => {
  const { worldId } = req.params;
  const { name, description, questCount = 5, isLinear = true } = req.body;

  const world = await storage.getWorld(worldId);
  if (!world) return res.status(404).json({ error: 'World not found' });

  const questType = getQuestTypeForWorld(world);

  // Generate chain narrative
  const chainPrompt = `Create a ${questCount}-quest chain for a ${world.worldType} world.

Chain Name: ${name || 'Auto-generated'}
Chain Theme: ${description || 'Epic adventure'}

Generate ${questCount} connected quests that tell a story. Each quest should build on the previous one.

Return JSON:
{
  chainName: "...",
  chainDescription: "...",
  quests: [
    { title, description, category, difficulty, objectives: [...] },
    ...
  ]
}`;

  const response = await callLLM(chainPrompt);
  const chainData = JSON.parse(response);

  // Create quest chain
  const questChainManager = new QuestChainManager();
  const chain = await questChainManager.createQuestChain(
    {
      id: '',
      name: chainData.chainName,
      description: chainData.chainDescription,
      worldId,
      isLinear,
    },
    chainData.quests.map(q => ({
      worldId,
      gameType: questType.id,
      questType: q.category,
      difficulty: q.difficulty,
      title: q.title,
      description: q.description,
      objectives: q.objectives,
      status: 'available',
    }))
  );

  res.json({ chain });
});
```

---

## Phase 6: Testing & Rollout

### 6.1 Migration Script

**File**: Create `server/migrations/003-quest-system-enhancement.ts`

```typescript
export async function migrateQuestSystem() {
  console.log('[Quest Migration] Starting quest system enhancement migration...');

  // 1. Add new columns to quests table
  await db.execute(sql`
    ALTER TABLE quests
    ADD COLUMN IF NOT EXISTS game_type VARCHAR(100) DEFAULT 'language-learning',
    ADD COLUMN IF NOT EXISTS quest_chain_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS quest_chain_order INTEGER,
    ADD COLUMN IF NOT EXISTS prerequisite_quest_ids TEXT[],
    ADD COLUMN IF NOT EXISTS failure_conditions JSONB,
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS item_rewards JSONB,
    ADD COLUMN IF NOT EXISTS skill_rewards JSONB,
    ADD COLUMN IF NOT EXISTS unlocks JSONB,
    ADD COLUMN IF NOT EXISTS quest_giver_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS quest_receiver_id VARCHAR(255)
  `);

  // 2. Update existing quests to have gameType = 'language-learning'
  await db.execute(sql`
    UPDATE quests
    SET game_type = 'language-learning'
    WHERE game_type IS NULL
  `);

  console.log('[Quest Migration] Quest system enhancement migration complete');
}
```

### 6.2 Testing Checklist

#### Unit Tests
- [ ] Quest type registry loads all types
- [ ] Quest generation works for each game type
- [ ] Objective tracking works for new objective types
- [ ] Quest chain creation and ordering
- [ ] Prerequisite checking logic

#### Integration Tests
- [ ] Generate RPG quest via API
- [ ] Complete combat objective in 3D game
- [ ] Waypoint rendering for different objective types
- [ ] Quest chain progress tracking
- [ ] Dialogue-based quest assignment with new categories

#### Manual Testing
- [ ] Create medieval-fantasy world → generates RPG quests
- [ ] Create language-learning world → generates vocabulary quests
- [ ] Complete combat quest in 3D game
- [ ] Follow waypoints to quest objectives
- [ ] Complete quest chain (5 quests)
- [ ] Check that prerequisites block quest acceptance

### 6.3 Rollout Plan

**Phase 1: Backend** (Week 1)
- Run migration script
- Deploy quest type registry
- Add new quest generation endpoints
- Test with existing worlds

**Phase 2: 3D Game** (Week 2)
- Deploy QuestWaypointManager
- Update QuestObjectManager with new objectives
- Add combat/crafting hooks
- Test in development environment

**Phase 3: UI/UX** (Week 3)
- Update BabylonQuestTracker with category icons
- Add waypoint toggle in settings
- Update quest creation dialogs
- Polish animations and visual feedback

**Phase 4: Content** (Week 4)
- Generate base quest chains for each world type
- Create quest templates library
- Document quest creation guidelines
- Train AI models on new quest formats

---

## Future Enhancements

### Post-Launch Features

1. **Dynamic Quest Scaling**: Adjust difficulty based on player level/skill
2. **Procedural Quest Generation**: AI creates infinite quests on-the-fly
3. **Quest Board System**: Public quest board where players can pick quests
4. **Faction Quests**: Reputation-based quests with different factions
5. **Daily/Weekly Quests**: Time-limited repeatable quests
6. **Co-op Quests**: Multi-player quest objectives
7. **Branching Narratives**: Player choices affect quest outcomes
8. **Quest Sharing**: Players can create and share custom quests

### World Type Expansion

Create quest types for:
- **Mystery/Detective**: Investigation, clue-finding, interrogation
- **Horror**: Survival, escape, resource management
- **Puzzle**: Logic puzzles, environmental challenges
- **Sports**: Training, competitions, team management
- **Business**: Economy, trading, building empire

---

## Success Metrics

### KPIs

1. **Quest Completion Rate**: % of accepted quests completed
2. **Average Quests per Player**: Engagement metric
3. **Quest Type Distribution**: Balance across categories
4. **Time to Complete**: Average quest duration
5. **Chain Completion Rate**: % of players finishing quest chains
6. **Player Retention**: Impact of quest system on retention

### Goals

- 70%+ quest completion rate
- 5+ quests per active player per week
- <5% quest abandonment due to bugs/confusion
- Balanced distribution across quest categories (no single category >40%)
- 50%+ chain completion rate for linear chains

---

## Conclusion

This enhancement plan transforms the quest system from a language-learning-specific feature into a flexible, game-type-agnostic infrastructure that supports multiple genres while maintaining backward compatibility. The modular quest type architecture allows easy expansion to new game types, and the enhanced tracking and visual systems provide a richer player experience.

The implementation is broken into manageable phases with clear deliverables and success criteria. Each phase builds on the previous one, allowing for iterative testing and refinement.
