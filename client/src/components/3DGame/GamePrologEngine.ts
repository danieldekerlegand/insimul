/**
 * Game Prolog Engine
 *
 * Client-side Prolog engine for the Babylon.js game runtime.
 * Wraps tau-prolog (via shared TauPrologEngine) to provide:
 *   - Loading Prolog knowledge base on game start
 *   - Real-time fact assertion/retraction as game state changes
 *   - Rule condition evaluation via Prolog queries
 *   - Action prerequisite checking
 *   - Quest completion evaluation
 */

import { TauPrologEngine } from '@shared/prolog/tau-engine';
import { getNPCReasoningRules, getPersonalityFacts, getRelationshipFacts, getEmotionalStateFacts } from '@shared/prolog/npc-reasoning';
import { getTotTPredicates } from '@shared/prolog/tott-predicates';
import { getAdvancedPredicates } from '@shared/prolog/advanced-predicates';
import type { GameEventBus, GameEvent, ItemTaxonomy } from './GameEventBus';

export interface GameState {
  playerCharacterId: string;
  playerName: string;
  playerEnergy: number;
  playerPosition?: { x: number; y: number; z: number };
  currentSettlement?: string;
  nearbyNPCs: string[];
}

export class GamePrologEngine {
  private engine: TauPrologEngine;
  private initialized = false;
  private eventBusUnsubscribe: (() => void) | null = null;
  private activeQuestIds: string[] = [];
  private onQuestCompleted?: (questId: string) => void;
  /** Track per-item quantities so has_item/3 stays accurate. */
  private itemQuantities = new Map<string, number>();

  constructor() {
    this.engine = new TauPrologEngine();
  }

  /**
   * Set callback for when Prolog determines a quest is complete.
   */
  setOnQuestCompleted(callback: (questId: string) => void): void {
    this.onQuestCompleted = callback;
  }

  /**
   * Register active quest IDs for re-evaluation.
   */
  setActiveQuests(questIds: string[]): void {
    this.activeQuestIds = questIds;
  }

  /**
   * Subscribe to game events and assert corresponding Prolog facts.
   * This bridges the event bus to the Prolog knowledge base.
   */
  subscribeToEventBus(eventBus: GameEventBus): void {
    if (this.eventBusUnsubscribe) {
      this.eventBusUnsubscribe();
    }
    this.eventBusUnsubscribe = eventBus.onAny((event: GameEvent) => {
      this.handleGameEvent(event).catch((e) => {
        console.warn('[GamePrologEngine] Error handling game event:', e);
      });
    });
  }

  /**
   * Handle a game event by asserting Prolog facts and re-evaluating quests.
   */
  private async handleGameEvent(event: GameEvent): Promise<void> {
    if (!this.initialized) return;

    switch (event.type) {
      case 'item_collected': {
        const name = this.sanitize(event.itemName);
        await this.engine.assertFact(`collected(player, ${name}, ${event.quantity})`);
        await this.engine.assertFact(`has(player, ${name})`);
        await this.updateItemQuantity(name, event.quantity);
        if (event.taxonomy) {
          await this.assertItemTaxonomy(name, event.taxonomy);
        }
        break;
      }
      case 'enemy_defeated':
        await this.engine.assertFact(
          `defeated(player, ${this.sanitize(event.enemyType)})`
        );
        break;
      case 'location_visited':
        await this.engine.assertFact(
          `visited(player, ${this.sanitize(event.locationId)})`
        );
        break;
      case 'npc_talked':
        await this.engine.assertFact(
          `talked_to(player, ${this.sanitize(event.npcId)}, ${event.turnCount})`
        );
        break;
      case 'item_delivered':
        await this.engine.assertFact(
          `delivered(player, ${this.sanitize(event.npcId)}, ${this.sanitize(event.itemName)})`
        );
        break;
      case 'vocabulary_used':
        await this.engine.assertFact(
          `vocab_used(player, ${this.sanitize(event.word)}, ${event.correct ? 1 : 0})`
        );
        break;
      case 'item_crafted': {
        const name = this.sanitize(event.itemName);
        await this.engine.assertFact(`crafted(player, ${name}, ${event.quantity})`);
        await this.engine.assertFact(`has(player, ${name})`);
        await this.updateItemQuantity(name, event.quantity);
        if (event.taxonomy) {
          await this.assertItemTaxonomy(name, event.taxonomy);
        }
        break;
      }
      case 'location_discovered':
        await this.engine.assertFact(
          `discovered(player, ${this.sanitize(event.locationId)})`
        );
        break;
      case 'settlement_entered':
        await this.engine.assertFact(
          `visited(player, ${this.sanitize(event.settlementId)})`
        );
        break;
      case 'reputation_changed':
        await this.engine.assertFact(
          `reputation_change(player, ${this.sanitize(event.factionId)}, ${event.delta})`
        );
        break;
      case 'quest_accepted':
        await this.engine.assertFact(
          `quest_active(player, ${this.sanitize(event.questId)})`
        );
        break;
      case 'quest_completed':
        await this.engine.assertFact(
          `quest_completed(player, ${this.sanitize(event.questId)})`
        );
        break;
      case 'puzzle_solved':
        await this.engine.assertFact(
          `puzzle_solved(player, ${this.sanitize(event.puzzleId)})`
        );
        break;
      case 'item_removed':
      case 'item_dropped': {
        const name = this.sanitize(event.itemName);
        const qty = event.quantity || 1;
        await this.updateItemQuantity(name, -qty);
        const remaining = this.itemQuantities.get(name) || 0;
        if (remaining <= 0) {
          await this.engine.retractFact(`has(player, ${name})`);
        }
        break;
      }
      case 'item_used': {
        const name = this.sanitize(event.itemName);
        await this.updateItemQuantity(name, -1);
        const remaining = this.itemQuantities.get(name) || 0;
        if (remaining <= 0) {
          await this.engine.retractFact(`has(player, ${name})`);
        }
        break;
      }
      case 'item_equipped':
        await this.engine.assertFact(
          `equipped(player, ${this.sanitize(event.itemName)}, ${this.sanitize(event.slot)})`
        );
        break;
      case 'item_unequipped':
        await this.engine.retractFact(
          `equipped(player, ${this.sanitize(event.itemName)}, ${this.sanitize(event.slot)})`
        );
        break;
      default:
        return; // No re-evaluation needed for unhandled events
    }

    // Re-evaluate active quest postconditions after fact assertion
    await this.reevaluateQuests();
  }

  /**
   * Re-evaluate all active quests to see if any are now complete.
   */
  private async reevaluateQuests(): Promise<void> {
    for (const questId of this.activeQuestIds) {
      const complete = await this.isQuestComplete(questId, 'player');
      if (complete && this.onQuestCompleted) {
        this.onQuestCompleted(questId);
      }
    }
  }

  /**
   * Initialize inventory items as Prolog facts.
   * Call after initialize() to sync existing inventory to Prolog.
   */
  async initializeInventory(items: Array<{
    id: string; name: string; type?: string; value?: number; quantity?: number;
    category?: string; material?: string; baseType?: string; rarity?: string;
  }>): Promise<void> {
    if (!this.initialized) return;
    for (const item of items) {
      const name = this.sanitize(item.name);
      const qty = item.quantity || 1;
      await this.engine.assertFact(`has(player, ${name})`);
      await this.engine.assertFact(`has_item(player, ${name}, ${qty})`);
      this.itemQuantities.set(name, (this.itemQuantities.get(name) || 0) + qty);
      if (item.type) {
        await this.engine.assertFact(`item_type(${name}, ${this.sanitize(item.type)})`);
      }
      if (item.value !== undefined && item.value > 0) {
        await this.engine.assertFact(`item_value(${name}, ${item.value})`);
      }
      // Assert taxonomy
      await this.assertItemTaxonomy(name, {
        category: item.category,
        material: item.material,
        baseType: item.baseType,
        rarity: item.rarity,
        itemType: item.type,
      });
    }
    console.log(`[GamePrologEngine] Initialized ${items.length} inventory items as Prolog facts`);
  }

  /**
   * Initialize the engine with game data.
   * Call once at game start after data is loaded.
   */
  async initialize(data: {
    characters: any[];
    settlements: any[];
    rules: any[];
    actions: any[];
    quests: any[];
    truths: any[];
    content?: string; // Pre-generated .pl content from server
  }): Promise<void> {
    this.engine.clear();
    this.itemQuantities.clear();

    // If server provided pre-generated Prolog content, load it
    if (data.content) {
      await this.engine.consult(data.content);
    }

    // Assert character facts
    for (const char of data.characters) {
      const charId = this.sanitize(`${char.firstName}_${char.lastName}_${char.id}`);
      await this.engine.assertFact(`person(${charId})`);
      if (char.firstName) {
        await this.engine.assertFact(`name(${charId}, '${this.escape(char.firstName + ' ' + (char.lastName || ''))}')`);
      }
      if (char.age) await this.engine.assertFact(`age(${charId}, ${char.age})`);
      if (char.occupation) await this.engine.assertFact(`occupation(${charId}, ${this.sanitize(char.occupation)})`);
      if (char.gender) await this.engine.assertFact(`gender(${charId}, ${this.sanitize(char.gender)})`);
    }

    // Assert settlement facts
    for (const settlement of data.settlements) {
      const sId = this.sanitize(settlement.name || settlement.id);
      await this.engine.assertFact(`settlement(${sId})`);
      if (settlement.type) await this.engine.assertFact(`settlement_type(${sId}, ${this.sanitize(settlement.type)})`);
    }

    // Load Prolog content from rules (content IS Prolog), actions, quests
    for (const rule of data.rules) {
      if (rule.content) {
        try { await this.engine.consult(rule.content); } catch { /* skip invalid */ }
      }
    }
    for (const action of data.actions) {
      if (action.content) {
        try { await this.engine.consult(action.content); } catch { /* skip invalid */ }
      }
    }
    for (const quest of data.quests) {
      if (quest.content) {
        try { await this.engine.consult(quest.content); } catch { /* skip invalid */ }
      }
    }

    // Load NPC reasoning rules
    try {
      await this.engine.consult(getNPCReasoningRules());
    } catch (e) {
      console.warn('[GamePrologEngine] Failed to load NPC reasoning rules:', e);
    }

    // Load TotT social simulation predicates
    try {
      await this.engine.consult(getTotTPredicates());
    } catch (e) {
      console.warn('[GamePrologEngine] Failed to load TotT predicates:', e);
    }

    // Load advanced predicates (resources, probabilistic, abductive, meta, procedural)
    try {
      await this.engine.consult(getAdvancedPredicates());
    } catch (e) {
      console.warn('[GamePrologEngine] Failed to load advanced predicates:', e);
    }

    // Assert personality facts for characters that have them
    for (const char of data.characters) {
      const charId = this.sanitize(`${char.firstName}_${char.lastName}_${char.id}`);
      if (char.personality) {
        const facts = getPersonalityFacts(charId, char.personality);
        for (const f of facts) {
          await this.engine.assertFact(f);
        }
      }
      // Mood/emotional state
      if (char.mood || char.energy) {
        const emotionFacts = getEmotionalStateFacts(charId, {
          mood: char.mood,
          energy: char.energy,
        });
        for (const f of emotionFacts) {
          await this.engine.assertFact(f);
        }
      }
    }

    this.initialized = true;
    console.log('[GamePrologEngine] Initialized:', this.engine.getStats());
  }

  /**
   * Update game state facts (call each frame or on state change).
   */
  async updateGameState(state: GameState): Promise<void> {
    if (!this.initialized) return;

    const playerId = this.sanitize(state.playerCharacterId);

    // Retract old dynamic game state
    await this.retractPattern('energy', playerId);
    await this.retractPattern('at_location', playerId);
    await this.retractPattern('nearby_npc', playerId);

    // Assert current state
    await this.engine.assertFact(`energy(${playerId}, ${state.playerEnergy})`);

    if (state.currentSettlement) {
      await this.engine.assertFact(`at_location(${playerId}, ${this.sanitize(state.currentSettlement)})`);
    }

    for (const npcId of state.nearbyNPCs) {
      await this.engine.assertFact(`nearby_npc(${playerId}, ${this.sanitize(npcId)})`);
    }
  }

  /**
   * Check if an action's Prolog prerequisites are met.
   */
  async canPerformAction(actionId: string, actorId: string, targetId?: string): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    if (!this.initialized) return { allowed: true };

    const actionAtom = this.sanitize(actionId);
    const actorAtom = this.sanitize(actorId);

    try {
      let query: string;
      if (targetId) {
        query = `can_perform(${actorAtom}, ${actionAtom}, ${this.sanitize(targetId)})`;
      } else {
        query = `can_perform(${actorAtom}, ${actionAtom})`;
      }

      const result = await this.engine.queryOnce(query);
      if (result) {
        return { allowed: true };
      }

      return { allowed: false, reason: `Prerequisites not met for action: ${actionId}` };
    } catch {
      // If query fails, allow by default (graceful degradation)
      return { allowed: true };
    }
  }

  /**
   * Check if a quest is available to the player.
   */
  async isQuestAvailable(questId: string, playerId: string): Promise<boolean> {
    if (!this.initialized) return true;

    try {
      const result = await this.engine.queryOnce(
        `quest_available(${this.sanitize(playerId)}, ${this.sanitize(questId)})`
      );
      return !!result;
    } catch {
      return true;
    }
  }

  /**
   * Check if a quest is complete for the player.
   */
  async isQuestComplete(questId: string, playerId: string): Promise<boolean> {
    if (!this.initialized) return false;

    try {
      const result = await this.engine.queryOnce(
        `quest_complete(${this.sanitize(playerId)}, ${this.sanitize(questId)})`
      );
      return !!result;
    } catch {
      return false;
    }
  }

  /**
   * Check if a specific quest stage is complete.
   */
  async isStageComplete(questId: string, stageId: string, playerId: string): Promise<boolean> {
    if (!this.initialized) return false;

    try {
      const result = await this.engine.queryOnce(
        `stage_complete(${this.sanitize(playerId)}, ${this.sanitize(questId)}, ${this.sanitize(stageId)})`
      );
      return !!result;
    } catch {
      return false;
    }
  }

  /**
   * Evaluate a rule condition via Prolog query.
   * Returns true if the condition is satisfied.
   */
  async evaluateCondition(prologGoal: string): Promise<boolean> {
    if (!this.initialized) return true;

    try {
      const result = await this.engine.queryOnce(prologGoal);
      return !!result;
    } catch {
      return true; // Graceful degradation
    }
  }

  /**
   * Find all applicable rules for a context.
   */
  async getApplicableRules(actorId: string): Promise<string[]> {
    if (!this.initialized) return [];

    try {
      const results = await this.engine.query(
        `rule_applies(RuleName, ${this.sanitize(actorId)}, _)`
      );
      return results.map(r => String(r.RuleName || ''));
    } catch {
      return [];
    }
  }

  /**
   * Assert a new fact during gameplay (e.g., item pickup, quest progress).
   */
  async assertFact(fact: string): Promise<void> {
    if (!this.initialized) return;
    await this.engine.assertFact(fact);
  }

  /**
   * Retract a fact during gameplay (e.g., item used, status removed).
   */
  async retractFact(fact: string): Promise<void> {
    if (!this.initialized) return;
    await this.engine.retractFact(fact);
  }

  /**
   * Run an arbitrary Prolog query and return results.
   */
  async query(goal: string): Promise<Record<string, any>[]> {
    if (!this.initialized) return [];
    return this.engine.query(goal);
  }

  /**
   * Get engine stats for debugging.
   */
  getStats(): { factCount: number; ruleCount: number } {
    return this.engine.getStats();
  }

  // ── NPC Intelligence Queries ──────────────────────────────────────────────

  /**
   * Determine who an NPC should talk to based on personality and relationships.
   */
  async whoShouldTalkTo(npcId: string): Promise<string[]> {
    if (!this.initialized) return [];
    try {
      const results = await this.engine.query(`should_talk_to(${this.sanitize(npcId)}, Y)`);
      return results.map(r => String(r.Y || '')).filter(Boolean);
    } catch { return []; }
  }

  /**
   * Get preferred dialogue topics for an NPC.
   */
  async getPreferredTopics(npcId: string): Promise<string[]> {
    if (!this.initialized) return [];
    try {
      const results = await this.engine.query(`prefers_topic(${this.sanitize(npcId)}, Topic)`);
      return results.map(r => String(r.Topic || '')).filter(Boolean);
    } catch { return []; }
  }

  /**
   * Get an NPC's conflict resolution style.
   */
  async getConflictStyle(npcId: string): Promise<string | null> {
    if (!this.initialized) return null;
    try {
      const result = await this.engine.queryOnce(`conflict_style(${this.sanitize(npcId)}, Style)`);
      return result ? String(result.Style || '') : null;
    } catch { return null; }
  }

  /**
   * Check if an NPC wants to socialize.
   */
  async wantsToSocialize(npcId: string): Promise<boolean> {
    if (!this.initialized) return false;
    try {
      const result = await this.engine.queryOnce(`wants_to_socialize(${this.sanitize(npcId)})`);
      return !!result;
    } catch { return false; }
  }

  /**
   * Check if an NPC is grieving.
   */
  async isGrieving(npcId: string): Promise<boolean> {
    if (!this.initialized) return false;
    try {
      const result = await this.engine.queryOnce(`is_grieving(${this.sanitize(npcId)})`);
      return !!result;
    } catch { return false; }
  }

  /**
   * Check if this is a first meeting between NPC and player.
   */
  async isFirstMeeting(npcId: string, playerId: string): Promise<boolean> {
    if (!this.initialized) return true;
    try {
      const result = await this.engine.queryOnce(
        `\\+ has_mental_model(${this.sanitize(npcId)}, ${this.sanitize(playerId)})`
      );
      return !!result;
    } catch { return true; }
  }

  /**
   * Get NPCs that should be avoided by a given NPC.
   */
  async whoToAvoid(npcId: string): Promise<string[]> {
    if (!this.initialized) return [];
    try {
      const results = await this.engine.query(`should_avoid(${this.sanitize(npcId)}, Y)`);
      return results.map(r => String(r.Y || '')).filter(Boolean);
    } catch { return []; }
  }

  /**
   * Check if an NPC is willing to share knowledge with another.
   */
  async isWillingToShare(npcId: string, targetId: string): Promise<boolean> {
    if (!this.initialized) return true;
    try {
      const result = await this.engine.queryOnce(
        `willing_to_share(${this.sanitize(npcId)}, ${this.sanitize(targetId)})`
      );
      return !!result;
    } catch { return true; }
  }

  /**
   * Update NPC personality facts.
   */
  async updateNPCPersonality(npcId: string, personality: {
    openness?: number;
    conscientiousness?: number;
    extroversion?: number;
    agreeableness?: number;
    neuroticism?: number;
  }): Promise<void> {
    if (!this.initialized) return;
    const id = this.sanitize(npcId);
    await this.retractPattern('personality', id);
    const facts = getPersonalityFacts(id, personality);
    for (const f of facts) {
      await this.engine.assertFact(f);
    }
  }

  /**
   * Update NPC emotional state.
   */
  async updateNPCEmotionalState(npcId: string, state: {
    mood?: string;
    stressLevel?: number;
    socialDesire?: number;
    energy?: number;
  }): Promise<void> {
    if (!this.initialized) return;
    const id = this.sanitize(npcId);
    await this.retractPattern('mood', id);
    await this.retractPattern('stress_level', id);
    await this.retractPattern('social_desire', id);
    const facts = getEmotionalStateFacts(id, state);
    for (const f of facts) {
      await this.engine.assertFact(f);
    }
  }

  /**
   * Update NPC relationship facts.
   */
  async updateNPCRelationship(npc1Id: string, npc2Id: string, relationship: {
    charge?: number;
    trust?: number;
    conversationCount?: number;
    isFriend?: boolean;
    isEnemy?: boolean;
  }): Promise<void> {
    if (!this.initialized) return;
    const id1 = this.sanitize(npc1Id);
    const id2 = this.sanitize(npc2Id);
    // Retract old relationship facts for this pair
    await this.retractPattern('relationship_charge', id1, id2);
    await this.retractPattern('relationship_trust', id1, id2);
    await this.retractPattern('conversation_count', id1, id2);
    await this.retractPattern('friends', id1, id2);
    await this.retractPattern('enemies', id1, id2);
    const facts = getRelationshipFacts(id1, id2, relationship);
    for (const f of facts) {
      await this.engine.assertFact(f);
    }
  }

  /**
   * Record that the player performed an action on an NPC.
   */
  async recordPlayerAction(playerId: string, npcId: string, actionName: string): Promise<void> {
    if (!this.initialized) return;
    const pId = this.sanitize(playerId);
    const nId = this.sanitize(npcId);
    const action = this.sanitize(actionName);
    await this.engine.assertFact(`player_action(${pId}, ${nId}, ${action})`);
  }

  /**
   * Initialize world item definitions into Prolog (taxonomy, IS-A chains).
   * Call at game start with all world items so Prolog knows about every item type.
   */
  async initializeWorldItems(items: Array<{
    name: string; itemType?: string; value?: number;
    category?: string; material?: string; baseType?: string; rarity?: string;
  }>): Promise<void> {
    if (!this.initialized) return;
    for (const item of items) {
      const name = this.sanitize(item.name);
      if (item.itemType) {
        await this.engine.assertFact(`item_type(${name}, ${this.sanitize(item.itemType)})`);
      }
      if (item.value !== undefined && item.value > 0) {
        await this.engine.assertFact(`item_value(${name}, ${item.value})`);
      }
      await this.assertItemTaxonomy(name, {
        category: item.category,
        material: item.material,
        baseType: item.baseType,
        rarity: item.rarity,
        itemType: item.itemType,
      });
    }
    console.log(`[GamePrologEngine] Initialized ${items.length} world item definitions as Prolog facts`);
  }

  /**
   * Load built-in IS-A reasoning rules so Prolog can reason hierarchically about items.
   * e.g., "does the player have a weapon?" queries item_is_a(X, weapon).
   */
  async loadItemReasoningRules(): Promise<void> {
    if (!this.initialized) return;
    const rules = `
% IS-A reasoning: an item is-a its category
item_is_a(Item, Category) :- item_category(Item, Category).
% IS-A reasoning: an item is-a its base type
item_is_a(Item, BaseType) :- item_base_type(Item, BaseType).
% IS-A reasoning: an item is-a its item type
item_is_a(Item, Type) :- item_type(Item, Type).

% Check if player has any item of a given category/type
has_item_of_type(Player, Type) :- has(Player, Item), item_is_a(Item, Type).

% Check if player has at least N of an item
has_at_least(Player, Item, N) :- has_item(Player, Item, Qty), Qty >= N.

% Count total items of a type across all item names
count_items_of_type(Player, Type, Total) :-
  findall(Qty, (has_item(Player, Item, Qty), item_is_a(Item, Type)), Qtys),
  sumlist(Qtys, Total).

% Helper: sum a list
sumlist([], 0).
sumlist([H|T], S) :- sumlist(T, S1), S is S1 + H.
`;
    try {
      await this.engine.consult(rules);
      console.log('[GamePrologEngine] Loaded item IS-A reasoning rules');
    } catch (e) {
      console.warn('[GamePrologEngine] Failed to load item reasoning rules:', e);
    }
  }

  /**
   * Export the current knowledge base as Prolog text.
   */
  exportKnowledgeBase(): string {
    return this.engine.export();
  }

  /**
   * Dispose the engine.
   */
  dispose(): void {
    if (this.eventBusUnsubscribe) {
      this.eventBusUnsubscribe();
      this.eventBusUnsubscribe = null;
    }
    this.engine.clear();
    this.initialized = false;
    this.itemQuantities.clear();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Assert taxonomy facts for an item (category, material, baseType, rarity, IS-A chain).
   * Safe to call multiple times; duplicate facts are idempotent in tau-prolog.
   */
  private async assertItemTaxonomy(itemName: string, taxonomy: ItemTaxonomy): Promise<void> {
    if (taxonomy.category) {
      await this.engine.assertFact(`item_category(${itemName}, ${this.sanitize(taxonomy.category)})`);
      await this.engine.assertFact(`item_is_a(${itemName}, ${this.sanitize(taxonomy.category)})`);
    }
    if (taxonomy.material) {
      await this.engine.assertFact(`item_material(${itemName}, ${this.sanitize(taxonomy.material)})`);
    }
    if (taxonomy.baseType) {
      await this.engine.assertFact(`item_base_type(${itemName}, ${this.sanitize(taxonomy.baseType)})`);
      await this.engine.assertFact(`item_is_a(${itemName}, ${this.sanitize(taxonomy.baseType)})`);
    }
    if (taxonomy.rarity) {
      await this.engine.assertFact(`item_rarity(${itemName}, ${this.sanitize(taxonomy.rarity)})`);
    }
    if (taxonomy.itemType) {
      await this.engine.assertFact(`item_is_a(${itemName}, ${this.sanitize(taxonomy.itemType)})`);
    }
  }

  /**
   * Update the quantity of an item in the player's inventory.
   * Retracts old has_item/3 and asserts the new quantity.
   */
  private async updateItemQuantity(itemName: string, delta: number): Promise<void> {
    const oldQty = this.itemQuantities.get(itemName) || 0;
    const newQty = Math.max(0, oldQty + delta);
    this.itemQuantities.set(itemName, newQty);
    // Retract old quantity fact
    await this.retractPattern('has_item', 'player', itemName);
    // Assert new quantity (even if 0 — the has/2 retraction handles boolean presence)
    if (newQty > 0) {
      await this.engine.assertFact(`has_item(player, ${itemName}, ${newQty})`);
    }
  }

  private async retractPattern(predicate: string, firstArg: string, secondArg?: string): Promise<void> {
    const allFacts = this.engine.getAllFacts();
    const prefix = secondArg
      ? `${predicate}(${firstArg}, ${secondArg}`
      : `${predicate}(${firstArg}`;
    for (const fact of allFacts) {
      if (fact.startsWith(prefix)) {
        await this.engine.retractFact(fact.replace(/\.\s*$/, ''));
      }
    }
  }

  private sanitize(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/^([0-9])/, '_$1')
      .replace(/_+/g, '_')
      .replace(/_$/, '');
  }

  private escape(str: string): string {
    return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  }
}
