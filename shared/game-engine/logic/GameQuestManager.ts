/**
 * GameQuestManager — Client-side quest generation orchestrator.
 *
 * Replaces server API calls for quest generation, completion, and lifecycle
 * management. All quest generators from shared/quests/ are called locally,
 * with results persisted via QuestStorageProvider (SaveGameQuestStorage for
 * standalone games, MongoQuestStorage for the in-app game).
 *
 * Key responsibilities:
 *   - Generate quests from all 17+ generators on demand or via triggers
 *   - Complete quests with bonus XP, streak, and chain completion
 *   - Auto-replenish quest pool when it runs low (depletion monitoring)
 *   - Manage daily/recurring quest rotation
 *   - Manage guild quest progression
 *   - Wire into GameEventBus for automatic triggers
 */

import type { GameEventBus } from './GameEventBus';
import type { GamePrologEngine } from './GamePrologEngine';
import type { QuestStorageProvider } from '../../quests/quest-storage-provider';
import type { Quest, InsertQuest, World, Character, Settlement, Business } from '../../schema';
import { convertQuestToProlog } from '../../prolog/quest-converter';

// Import all quest generators
import { generateSeedQuests, type SeedQuestOptions } from '../../quests/quest-seed-generator';
import { assignQuests, type WorldContext, type AssignmentOptions } from '../../quests/quest-assignment-engine';
import { generateBusinessRoleplayQuests } from '../../quests/business-roleplay-quest-generator';
import { generateEmergencyQuests } from '../../quests/emergency-quest-generator';
import { generateMysteryQuest } from '../../quests/mystery-quest-generator';
import { generateReadingQuests } from '../../quests/reading-quest-generator';
import { generateSideQuests } from '../../quests/side-quest-generator';
import { generateFetchQuests } from '../../quests/fetch-quest-generator';
import { generateMultiNpcQuests } from '../../quests/multi-npc-quest-generator';
import { generateShoppingQuests } from '../../quests/shopping-quest-generator';
import { generateCraftingQuests } from '../../quests/crafting-quest-generator';
import { generateNumberPracticeQuests } from '../../quests/number-practice-quest-generator';
import { generateWeatherTimeQuests } from '../../quests/weather-time-quest-generator';
import { generateErrorCorrectionQuests } from '../../quests/error-correction-quest-generator';
import { generateAdaptiveQuests, computeCategoryWeights, selectWeightedCategories } from '../../quests/adaptive-quest-generator';
import { checkAndReplenishQuests, countActiveQuests } from '../../quests/quest-depletion-monitor';
import { generateRecurringQuests, getRecurringQuestStatus } from '../../quests/daily-quest-manager';
import { GuildQuestManager } from '../../quests/guild-quest-manager';
import { QuestChainManager, type ChainCompletionResult } from '../../quests/quest-chain-manager';

// ── Types ────────────────────────────────────────────────────────────────────

export interface GameQuestManagerConfig {
  storage: QuestStorageProvider;
  eventBus: GameEventBus;
  prologEngine?: GamePrologEngine | null;
  worldId: string;
  playerName: string;
  playerCharacterId?: string;
  targetLanguage?: string;
}

export interface QuestCompletionResult {
  quest: Quest;
  bonusXP: number;
  streakCount: number;
  chainCompletion: ChainCompletionResult | null;
  replenished: Quest[];
}

// ── Manager ──────────────────────────────────────────────────────────────────

export class GameQuestManager {
  private storage: QuestStorageProvider;
  private eventBus: GameEventBus;
  private prologEngine: GamePrologEngine | null;
  private worldId: string;
  private playerName: string;
  private playerCharacterId?: string;
  private targetLanguage: string;
  private guildManager: GuildQuestManager;
  private chainManager: QuestChainManager;
  private _eventUnsubscribers: Array<() => void> = [];

  constructor(config: GameQuestManagerConfig) {
    this.storage = config.storage;
    this.eventBus = config.eventBus;
    this.prologEngine = config.prologEngine ?? null;
    this.worldId = config.worldId;
    this.playerName = config.playerName;
    this.playerCharacterId = config.playerCharacterId;
    this.targetLanguage = config.targetLanguage ?? 'French';
    this.guildManager = new GuildQuestManager();
    this.chainManager = new QuestChainManager(config.storage);

    this._wireEventBus();
  }

  dispose(): void {
    for (const unsub of this._eventUnsubscribers) unsub();
    this._eventUnsubscribers = [];
  }

  // ── Quest Generation ──────────────────────────────────────────────────────

  /** Generate seed quests (one per objective type). */
  async generateSeedQuests(onlyTypes?: string[]): Promise<Quest[]> {
    const ctx = await this._buildSeedContext();
    const quests = generateSeedQuests({
      ...ctx,
      onlyTypes,
      assignedTo: this.playerName,
    });
    return this._saveQuests(quests);
  }

  /** Generate quests using the assignment engine (proficiency-aware). */
  async generateAssignedQuests(options?: Partial<AssignmentOptions>): Promise<Quest[]> {
    const ctx = await this._buildWorldContext();
    const quests = assignQuests(ctx, {
      count: 3,
      playerName: this.playerName,
      playerCharacterId: this.playerCharacterId,
      ...options,
    });
    return this._saveQuests(quests);
  }

  /** Generate business roleplay quests for nearby businesses. */
  async generateBusinessRoleplayQuests(filter?: {
    businessType?: string;
    difficulty?: string;
  }): Promise<Quest[]> {
    const [world, characters, businesses] = await Promise.all([
      this.storage.getWorld(this.worldId),
      this.storage.getCharactersByWorld(this.worldId),
      this.storage.getBusinessesByWorld(this.worldId),
    ]);
    if (!world) return [];
    const quests = generateBusinessRoleplayQuests({
      world,
      characters,
      businesses,
      targetLanguage: this.targetLanguage,
      playerName: this.playerName,
      ...filter,
    } as any);
    return this._saveQuests(quests.map((q: any) => q as InsertQuest));
  }

  /** Generate time-pressure emergency quests. */
  async generateEmergencyQuests(filter?: {
    scenario?: string;
    difficulty?: string;
  }): Promise<Quest[]> {
    const [world, characters, businesses] = await Promise.all([
      this.storage.getWorld(this.worldId),
      this.storage.getCharactersByWorld(this.worldId),
      this.storage.getBusinessesByWorld(this.worldId),
    ]);
    if (!world) return [];
    const quests = generateEmergencyQuests({
      world,
      characters,
      businesses,
      targetLanguage: this.targetLanguage,
      playerName: this.playerName,
      ...filter,
    } as any);
    return this._saveQuests(quests.map((q: any) => q as InsertQuest));
  }

  /** Generate a detective/mystery quest via Prolog reasoning. */
  async generateMysteryQuest(opts?: {
    victimId?: string;
    crimeType?: string;
  }): Promise<Quest | null> {
    const quest = await generateMysteryQuest(this.storage, this.worldId, opts);
    if (!quest) return null;
    const saved = await this._saveQuests([{
      worldId: this.worldId,
      assignedTo: this.playerName,
      title: quest.title,
      description: quest.description,
      questType: 'mystery',
      difficulty: 'intermediate',
      targetLanguage: this.targetLanguage,
      status: 'active',
      experienceReward: 100,
      objectives: quest.objectives.map((obj, i) => ({
        id: `obj_${i}`,
        type: obj.type,
        description: obj.description,
        completed: false,
        current: 0,
        required: 1,
      })),
      tags: ['mystery', 'generated'],
    } as InsertQuest]);
    return saved[0] ?? null;
  }

  /** Generate reading comprehension quests. */
  async generateReadingQuests(maxQuests?: number): Promise<Quest[]> {
    const [world, characters] = await Promise.all([
      this.storage.getWorld(this.worldId),
      this.storage.getCharactersByWorld(this.worldId),
    ]);
    if (!world) return [];
    const quests = generateReadingQuests({
      world,
      characters,
      texts: [], // TODO: pass game texts when available in storage
      targetLanguage: this.targetLanguage,
      playerName: this.playerName,
      maxQuests,
    } as any);
    return this._saveQuests(quests);
  }

  /** Generate NPC occupation-based side quests. */
  async generateSideQuests(maxQuests?: number): Promise<Quest[]> {
    const [world, characters, settlements] = await Promise.all([
      this.storage.getWorld(this.worldId),
      this.storage.getCharactersByWorld(this.worldId),
      this.storage.getSettlementsByWorld(this.worldId),
    ]);
    if (!world) return [];
    const quests = generateSideQuests({
      world,
      characters,
      settlements,
      targetLanguage: this.targetLanguage,
      playerName: this.playerName,
      maxQuests,
    } as any);
    return this._saveQuests(quests);
  }

  /** Generate fetch/collection quests. */
  async generateFetchQuests(difficulty?: string, maxQuests?: number): Promise<Quest[]> {
    const [world, characters, settlements] = await Promise.all([
      this.storage.getWorld(this.worldId),
      this.storage.getCharactersByWorld(this.worldId),
      this.storage.getSettlementsByWorld(this.worldId),
    ]);
    if (!world) return [];
    const quests = generateFetchQuests({
      world,
      characters,
      settlements,
      targetLanguage: this.targetLanguage,
      playerName: this.playerName,
      difficulty,
      maxQuests,
    } as any);
    return this._saveQuests(quests);
  }

  /** Generate multi-NPC cross-business quests. */
  async generateMultiNpcQuests(opts?: { difficulty?: string; maxQuests?: number }): Promise<Quest[]> {
    const [world, characters, businesses] = await Promise.all([
      this.storage.getWorld(this.worldId),
      this.storage.getCharactersByWorld(this.worldId),
      this.storage.getBusinessesByWorld(this.worldId),
    ]);
    if (!world) return [];
    const quests = generateMultiNpcQuests({
      world,
      characters,
      businesses,
      targetLanguage: this.targetLanguage,
      playerName: this.playerName,
      ...opts,
    } as any);
    return this._saveQuests(quests.map((q: any) => q as InsertQuest));
  }

  /** Generate shopping/economic vocabulary quests. */
  async generateShoppingQuests(opts?: { difficulty?: string; maxQuests?: number }): Promise<Quest[]> {
    const [world, characters, businesses] = await Promise.all([
      this.storage.getWorld(this.worldId),
      this.storage.getCharactersByWorld(this.worldId),
      this.storage.getBusinessesByWorld(this.worldId),
    ]);
    if (!world) return [];
    const quests = generateShoppingQuests({
      world,
      characters,
      businesses,
      targetLanguage: this.targetLanguage,
      playerName: this.playerName,
      ...opts,
    } as any);
    return this._saveQuests(quests);
  }

  /** Generate language-gated crafting quests. */
  async generateCraftingQuests(opts?: { cefrLevel?: string; maxQuests?: number }): Promise<Quest[]> {
    const [world, characters] = await Promise.all([
      this.storage.getWorld(this.worldId),
      this.storage.getCharactersByWorld(this.worldId),
    ]);
    if (!world) return [];
    const quests = generateCraftingQuests({
      world,
      characters,
      craftableItems: [], // TODO: populate from world items
      targetLanguage: this.targetLanguage,
      playerName: this.playerName,
      ...opts,
    } as any);
    return this._saveQuests(quests);
  }

  /** Generate number/counting vocabulary quests. */
  async generateNumberPracticeQuests(opts?: { cefrLevel?: string; maxQuests?: number }): Promise<Quest[]> {
    const [world, characters, businesses] = await Promise.all([
      this.storage.getWorld(this.worldId),
      this.storage.getCharactersByWorld(this.worldId),
      this.storage.getBusinessesByWorld(this.worldId),
    ]);
    if (!world) return [];
    const quests = generateNumberPracticeQuests({
      world,
      characters,
      businesses,
      targetLanguage: this.targetLanguage,
      playerName: this.playerName,
      ...opts,
    } as any);
    return this._saveQuests(quests);
  }

  /** Generate weather/time-of-day vocabulary quests. */
  async generateWeatherTimeQuests(currentHour: number): Promise<Quest[]> {
    const ctx = await this._buildWorldContext();
    const quests = generateWeatherTimeQuests({
      ...ctx,
      schedule: { currentHour, timeOfDay: currentHour >= 6 && currentHour < 20 ? 'day' : 'night' },
      targetLanguage: this.targetLanguage,
      playerName: this.playerName,
    } as any);
    return this._saveQuests(quests.map((q: any) => q as InsertQuest));
  }

  /** Generate error-correction quests based on player's language mistakes. */
  async generateErrorCorrectionQuests(languageProgress: any): Promise<Quest[]> {
    const ctx = await this._buildWorldContext();
    const quests = generateErrorCorrectionQuests(ctx, languageProgress, {
      playerName: this.playerName,
      targetLanguage: this.targetLanguage,
    } as any);
    return this._saveQuests(quests.map((q: any) => q as InsertQuest));
  }

  /** Generate adaptive quests based on learning profile. */
  async generateAdaptiveQuests(profile: any, languageProgress?: any): Promise<Quest[]> {
    const ctx = await this._buildWorldContext();
    const quests = generateAdaptiveQuests(ctx, profile, {
      playerName: this.playerName,
      targetLanguage: this.targetLanguage,
      languageProgress,
    } as any);
    return this._saveQuests(quests.map((q: any) => q as InsertQuest));
  }

  // ── Quest Completion ──────────────────────────────────────────────────────

  /** Complete a quest: apply rewards, check chain, auto-replenish. */
  async completeQuest(questId: string): Promise<QuestCompletionResult | null> {
    const allQuests = await this.storage.getQuestsByWorld(this.worldId);
    const quest = allQuests.find(q => q.id === questId);
    if (!quest) return null;

    // Mark completed
    const completed = await this.storage.updateQuest(questId, {
      status: 'completed',
      completedAt: new Date(),
    });
    if (!completed) return null;

    // Calculate streak
    const recentCompleted = allQuests.filter(
      q => q.status === 'completed' && q.assignedTo === this.playerName,
    );
    const streakCount = recentCompleted.length + 1;

    // Calculate bonus XP (10% per streak, max 50%)
    const baseXP = quest.experienceReward || 0;
    const streakBonus = Math.min(0.5, streakCount * 0.1);
    const bonusXP = Math.round(baseXP * streakBonus);

    // Check quest chain completion
    let chainCompletion: ChainCompletionResult | null = null;
    if (quest.questChainId) {
      chainCompletion = await this.chainManager.checkChainCompletion(completed);
    }

    // Auto-replenish quest pool
    const replenished = await this._checkAndReplenish(allQuests);

    // Emit completion event
    this.eventBus.emit({
      type: 'quest_completed',
      questId,
      questTitle: quest.title,
      questType: quest.questType,
      experienceReward: baseXP + bonusXP,
      bonusXP,
      streakCount,
    } as any);

    return {
      quest: completed,
      bonusXP,
      streakCount,
      chainCompletion,
      replenished,
    };
  }

  // ── Depletion Monitoring ──────────────────────────────────────────────────

  /** Check if quest pool is low and auto-generate replacements. */
  private async _checkAndReplenish(existingQuests?: Quest[]): Promise<Quest[]> {
    const quests = existingQuests ?? await this.storage.getQuestsByWorld(this.worldId);
    const ctx = await this._buildWorldContext();

    const result = await checkAndReplenishQuests(
      quests,
      ctx,
      this.playerName,
      { minActiveQuests: 3, replenishCount: 3 },
      async (quest) => this.storage.createQuest(quest),
    );

    return result.generatedQuests || [];
  }

  // ── Daily Quest Rotation ──────────────────────────────────────────────────

  /** Check and generate recurring/daily quests. */
  async checkDailyReset(): Promise<{ generated: Quest[]; status: any }> {
    const quests = await this.storage.getQuestsByWorld(this.worldId);
    const ctx = await this._buildWorldContext();

    const status = await getRecurringQuestStatus(
      quests, this.playerName, this.worldId,
      async (id, data) => {
        await this.storage.updateQuest(id, data as any);
        return quests.find(q => q.id === id);
      },
    );
    const generated = await generateRecurringQuests(
      { ...ctx, existingQuests: quests },
      this.playerName,
      'daily',
      async (quest) => {
        const saved = await this._saveQuests([quest as InsertQuest]);
        return saved[0];
      },
      { dailyQuestCount: 3 },
    );

    const saved = generated;

    if (saved.length > 0) {
      this.eventBus.emit({ type: 'daily_quests_reset' } as any);
    }

    return { generated: saved, status };
  }

  // ── Guild Quests ──────────────────────────────────────────────────────────

  /** Receive the next quest from a guild, assigning the guild master NPC. */
  async receiveGuildQuest(guildId: string, characters?: Array<{ id?: string; name?: string; firstName?: string; lastName?: string; occupation?: string | null }>): Promise<Quest | null> {
    const quests = await this.storage.getQuestsByWorld(this.worldId);
    const questId = this.guildManager.receiveNextQuest(guildId as any, quests, characters);
    if (!questId) return null;
    const quest = quests.find(q => q.id === questId);
    return quest ?? null;
  }

  /** Get guild progress for all guilds. */
  async getGuildProgress(): Promise<Map<string, any>> {
    const quests = await this.storage.getQuestsByWorld(this.worldId);
    return this.guildManager.getAllGuildProgress(quests);
  }

  // ── NPC Guidance ──────────────────────────────────────────────────────────

  /** Get quest guidance for an NPC (what should the NPC talk about). */
  async getNpcQuestGuidance(npcId: string): Promise<{
    hasGuidance: boolean;
    systemPromptAddition?: string;
  } | null> {
    try {
      const quests = await this.storage.getQuestsByWorld(this.worldId);
      const activeQuests = quests.filter(
        q => q.status === 'active' && q.assignedTo === this.playerName,
      );

      // Find quests where this NPC is relevant (assigned by them, or objectives target them)
      const relevantQuests = activeQuests.filter(q => {
        if (q.assignedByCharacterId === npcId) return true;
        const objectives = (q.objectives || []) as any[];
        return objectives.some((obj: any) => obj.npcId === npcId || obj.target === npcId);
      });

      if (relevantQuests.length === 0) return { hasGuidance: false };

      // Build guidance prompt from relevant quest objectives
      const lines = relevantQuests.flatMap(q => {
        const incomplete = ((q.objectives || []) as any[]).filter((o: any) => !o.completed);
        return incomplete.map((o: any) => `- Quest "${q.title}": ${o.description}`);
      });

      return {
        hasGuidance: true,
        systemPromptAddition: `The player has active quests involving you:\n${lines.join('\n')}\nNaturally steer the conversation toward helping with these objectives.`,
      };
    } catch {
      return null;
    }
  }

  // ── Radiant Quest Distribution ─────────────────────────────────────────

  /**
   * Distribute available quests to NPCs so they show quest indicators.
   * Staggered: only `maxOffering` NPCs will have quests at a time.
   * Quests are set to status='available' with assignedByCharacterId pointing
   * to the NPC who offers them. When the player talks to that NPC,
   * the QuestOfferPanel shows and the quest becomes 'active' on accept.
   *
   * Call this at game start and periodically to refresh offerings.
   */
  async distributeRadiantQuests(maxOffering: number = 5): Promise<number> {
    const [quests, characters] = await Promise.all([
      this.storage.getQuestsByWorld(this.worldId),
      this.storage.getCharactersByWorld(this.worldId),
    ]);

    // Count how many NPCs already have available quests
    const currentlyOffering = new Set(
      quests
        .filter(q => q.status === 'available' && q.assignedByCharacterId)
        .map(q => q.assignedByCharacterId),
    );

    const slotsAvailable = maxOffering - currentlyOffering.size;
    if (slotsAvailable <= 0) return 0;

    // Find unassigned available quests that could be offered by NPCs
    const unassigned = quests.filter(
      q => q.status === 'available' && !q.assignedByCharacterId && q.assignedTo === this.playerName,
    );

    if (unassigned.length === 0) return 0;

    // Find eligible NPCs (alive, not already offering, has an occupation)
    const eligibleNpcs = characters.filter(c => {
      if (!c.isAlive) return false;
      if (currentlyOffering.has(c.id)) return false;
      if (!c.occupation) return false;
      return true;
    });

    if (eligibleNpcs.length === 0) return 0;

    // Shuffle NPCs and quests for variety
    const shuffledNpcs = [...eligibleNpcs].sort(() => Math.random() - 0.5);
    const shuffledQuests = [...unassigned].sort(() => Math.random() - 0.5);

    let distributed = 0;
    for (let i = 0; i < Math.min(slotsAvailable, shuffledNpcs.length, shuffledQuests.length); i++) {
      const npc = shuffledNpcs[i];
      const quest = shuffledQuests[i];

      await this.storage.updateQuest(quest.id, {
        assignedByCharacterId: npc.id,
        assignedBy: `${npc.firstName} ${npc.lastName}`,
      } as any);

      distributed++;
    }

    return distributed;
  }

  /**
   * When a quest is accepted from an NPC, mark it as active.
   * Called by the QuestOfferPanel accept flow.
   */
  async acceptQuestFromNpc(questId: string): Promise<Quest | null> {
    const updated = await this.storage.updateQuest(questId, {
      status: 'active',
    } as any);
    return updated ?? null;
  }

  // ── Internal Helpers ──────────────────────────────────────────────────────

  private async _buildWorldContext(): Promise<WorldContext> {
    const [world, characters, settlements, quests] = await Promise.all([
      this.storage.getWorld(this.worldId),
      this.storage.getCharactersByWorld(this.worldId),
      this.storage.getSettlementsByWorld(this.worldId),
      this.storage.getQuestsByWorld(this.worldId),
    ]);
    return {
      world: world as World,
      characters,
      settlements,
      existingQuests: quests,
    };
  }

  private async _buildSeedContext(): Promise<SeedQuestOptions> {
    const [world, characters, settlements] = await Promise.all([
      this.storage.getWorld(this.worldId),
      this.storage.getCharactersByWorld(this.worldId),
      this.storage.getSettlementsByWorld(this.worldId),
    ]);
    return {
      world: world as World,
      characters,
      settlements,
    };
  }

  /** Persist generated quests, adding Prolog content to each. */
  private async _saveQuests(quests: InsertQuest[]): Promise<Quest[]> {
    const saved: Quest[] = [];
    for (const quest of quests) {
      // Ensure required fields
      if (!quest.worldId) (quest as any).worldId = this.worldId;
      if (!quest.assignedTo) (quest as any).assignedTo = this.playerName;
      if (!quest.targetLanguage) (quest as any).targetLanguage = this.targetLanguage;
      if (!quest.gameType) (quest as any).gameType = 'language-learning';

      // Generate Prolog content
      if (!quest.content) {
        try {
          const result = convertQuestToProlog(quest as any);
          if (result.prologContent) (quest as any).content = result.prologContent;
        } catch { /* non-fatal */ }
      }

      try {
        const created = await this.storage.createQuest(quest);
        saved.push(created);

        // Load Prolog content into live engine if available
        if (this.prologEngine && created.content) {
          try {
            await this.prologEngine.assertFact(created.content);
          } catch { /* non-fatal */ }
        }
      } catch (err) {
        console.warn('[GameQuestManager] Failed to save quest:', (err as Error)?.message);
      }
    }
    return saved;
  }

  /** Wire event bus listeners for automatic triggers. */
  private _wireEventBus(): void {
    // Auto-replenish on quest completion, then redistribute to NPCs
    this._eventUnsubscribers.push(
      this.eventBus.on('quest_completed', () => {
        this._checkAndReplenish()
          .then(() => this.distributeRadiantQuests(5))
          .catch(() => {});
      }),
    );

    // Daily reset check on hour change + weather/time quest generation
    this._eventUnsubscribers.push(
      this.eventBus.on('hour_changed' as any, (event: any) => {
        const hour = event?.hour;
        // Check daily reset at midnight or 6 AM
        if (hour === 0 || hour === 6) {
          this.checkDailyReset().catch(() => {});
        }
        // Generate weather/time quests at key times (morning, afternoon, evening)
        if (hour === 8 || hour === 14 || hour === 19) {
          this.generateWeatherTimeQuests(hour).catch(() => {});
        }
      }),
    );

    // Generate contextual quests when entering a settlement
    this._eventUnsubscribers.push(
      this.eventBus.on('settlement_entered' as any, () => {
        // Generate shopping and business roleplay quests for the new area
        this._generateContextualQuests().catch(() => {});
      }),
    );

    // Generate adaptive quests after assessment completion
    this._eventUnsubscribers.push(
      this.eventBus.on('assessment_completed' as any, (event: any) => {
        if (event?.cefrLevel) {
          // Generate error-correction quests based on assessment results
          this.generateErrorCorrectionQuests(event).catch(() => {});
        }
      }),
    );
  }

  /**
   * Generate contextual quests based on the player's current situation.
   * Called when entering new areas, visiting shops, etc.
   * Limits generation to avoid overwhelming the player.
   */
  private async _generateContextualQuests(): Promise<void> {
    const quests = await this.storage.getQuestsByWorld(this.worldId);
    const activeCount = countActiveQuests(quests, this.playerName, this.worldId);
    const pendingCount = quests.filter(
      q => q.worldId === this.worldId && q.assignedTo === this.playerName
        && q.status === 'available' && !q.assignedByCharacterId,
    ).length;

    // Don't generate more if player already has plenty (active + pending for distribution)
    if (activeCount + pendingCount >= 8) return;

    // Pick 1-2 contextual generators at random for variety
    const generators = [
      () => this.generateShoppingQuests({ maxQuests: 1 }),
      () => this.generateSideQuests(1),
      () => this.generateFetchQuests(undefined, 1),
      () => this.generateNumberPracticeQuests({ maxQuests: 1 }),
    ];

    const shuffled = generators.sort(() => Math.random() - 0.5);
    const toRun = shuffled.slice(0, 2);

    for (const gen of toRun) {
      try {
        const generated = await gen();
        if (generated.length > 0) {
          // Distribute the new quest to an NPC
          await this.distributeRadiantQuests(5);
          break; // Only add one contextual quest per trigger
        }
      } catch { /* non-fatal */ }
    }
  }
}
