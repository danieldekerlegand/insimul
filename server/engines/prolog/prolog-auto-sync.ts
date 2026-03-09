/**
 * Prolog Auto-Sync Service
 *
 * Incrementally syncs entity changes to tau-prolog knowledge bases.
 * Each world gets its own TauPrologEngine instance. When an entity is
 * created, updated, or deleted, only the relevant facts are modified —
 * no full re-sync needed.
 *
 * Usage in route handlers:
 *   await prologAutoSync.onCharacterChanged(worldId, character);
 *   await prologAutoSync.onCharacterDeleted(worldId, characterId);
 *   await prologAutoSync.onSettlementChanged(worldId, settlement);
 *   // etc.
 */

import { TauPrologEngine } from '../../../shared/prolog/tau-engine';
import { getNPCReasoningRules } from '../../../shared/prolog/npc-reasoning';
import { getTotTPredicates } from '../../../shared/prolog/tott-predicates';
import { getAdvancedPredicates } from '../../../shared/prolog/advanced-predicates';
import { storage } from '../../db/storage';

// ── Types ───────────────────────────────────────────────────────────────────

interface CharacterData {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  birthYear?: number | null;
  isAlive?: boolean;
  occupation?: string | null;
  currentLocation?: string | null;
  spouseId?: string | null;
  parentIds?: string[];
  friendIds?: string[];
  mentalModels?: any;
}

interface SettlementData {
  id: string;
  name: string;
  settlementType?: string | null;
  population?: number | null;
}

interface BusinessData {
  id: string;
  name: string;
  businessType?: string | null;
  ownerId?: string | null;
}

interface TruthData {
  id: string;
  worldId: string;
  characterId?: string | null;
  entryType?: string;
  customData?: any;
}

// ── Helper rules (loaded once per engine) ───────────────────────────────────

const HELPER_RULES = [
  'sibling_of(X, Y) :- parent_of(P, X), parent_of(P, Y), X \\= Y',
  'grandparent_of(GP, GC) :- parent_of(GP, P), parent_of(P, GC)',
  'ancestor_of(A, D) :- parent_of(A, D)',
  'ancestor_of(A, D) :- parent_of(A, X), ancestor_of(X, D)',
  'unmarried(X) :- person(X), \\+ married_to(X, _)',
  'same_location(X, Y) :- at_location(X, L), at_location(Y, L), X \\= Y',
  'adult(X) :- age(X, A), A >= 18',
  'child_person(X) :- age(X, A), A < 18',
  'owns_item(X, Item) :- has_item(X, Item, Q), Q > 0',
  'has_item_type(X, Type) :- has_item(X, Item, _), item_type(Item, Type)',
  'is_merchant(X) :- person(X), occupation(X, Occ), (Occ = merchant ; Occ = shopkeeper ; Occ = trader)',
  'strong_belief(Observer, Subject, Quality) :- believes(Observer, Subject, Quality, C), C >= 0.7',
  'weak_belief(Observer, Subject, Quality) :- believes(Observer, Subject, Quality, C), C < 0.4',
  'knows_well(Observer, Subject) :- mental_model_confidence(Observer, Subject, C), C >= 0.6',
  'stranger(Observer, Subject) :- person(Observer), person(Subject), \\+ has_mental_model(Observer, Subject)',
  'can_share_knowledge(Speaker, Listener, Subject, Fact) :- knows(Speaker, Subject, Fact), \\+ knows(Listener, Subject, Fact), has_mental_model(Speaker, Listener)',
  // Knowledge propagation rules
  'should_propagate(Speaker, Listener, Subject, Fact) :- can_share_knowledge(Speaker, Listener, Subject, Fact), mental_model_confidence(Speaker, Listener, C), C >= 0.3',
  'trusted_source(Listener, Speaker) :- mental_model_confidence(Listener, Speaker, C), C >= 0.5',
  'has_evidence_for(Observer, Subject, Quality) :- evidence(Observer, Subject, Quality, _, _, _)',
  'belief_supported(Observer, Subject, Quality) :- believes(Observer, Subject, Quality, C), C >= 0.5, has_evidence_for(Observer, Subject, Quality)',
  'belief_unsupported(Observer, Subject, Quality) :- believes(Observer, Subject, Quality, _), \\+ has_evidence_for(Observer, Subject, Quality)',
  // Mental model reasoning
  'mutual_knowledge(A, B, Fact) :- knows(A, B, Fact), knows(B, A, Fact)',
  'one_sided_knowledge(A, B, Fact) :- knows(A, B, Fact), \\+ knows(B, A, Fact)',
  'knows_about(Observer, Subject) :- has_mental_model(Observer, Subject), mental_model_confidence(Observer, Subject, C), C > 0',
];

// ── Service ─────────────────────────────────────────────────────────────────

// Predicates we track for Prolog → DB sync-back
const SYNC_BACK_PREDICATES = [
  'married_to',
  'dead',
  'occupation',
  'wealth',
  'friend_of',
  'enemy_of',
] as const;

type SyncBackPredicate = typeof SYNC_BACK_PREDICATES[number];

/** Parsed Prolog fact with predicate name and arguments. */
interface ParsedFact {
  predicate: string;
  args: string[];
  raw: string;
}

/** Result of a sync-back operation. */
export interface SyncBackResult {
  worldId: string;
  changesApplied: number;
  details: string[];
  errors: string[];
  timestamp: Date;
}

export class PrologAutoSync {
  private engines: Map<string, TauPrologEngine> = new Map();
  private initialized: Map<string, boolean> = new Map();
  /** Snapshot of sync-back predicate facts from last sync, keyed by worldId. */
  private lastSyncedFacts: Map<string, Map<string, Set<string>>> = new Map();
  /** Bidirectional sync interval timers, keyed by worldId. */
  private syncTimers: Map<string, ReturnType<typeof setInterval>> = new Map();

  /**
   * Get or create the tau-prolog engine for a world.
   */
  getEngine(worldId: string): TauPrologEngine {
    let engine = this.engines.get(worldId);
    if (!engine) {
      engine = new TauPrologEngine();
      this.engines.set(worldId, engine);
    }
    return engine;
  }

  /**
   * Ensure helper rules are loaded (idempotent).
   */
  private async ensureInitialized(worldId: string): Promise<TauPrologEngine> {
    const engine = this.getEngine(worldId);
    if (!this.initialized.get(worldId)) {
      await engine.addRules(HELPER_RULES);
      // Load NPC reasoning rules (lifecycle, decision-making, social, emotional)
      try {
        await engine.consult(getNPCReasoningRules());
      } catch (e) {
        console.warn('[PrologAutoSync] Failed to load NPC reasoning rules:', e);
      }
      // Load TotT social simulation predicates (hiring, social, economics, lifecycle)
      try {
        await engine.consult(getTotTPredicates());
      } catch (e) {
        console.warn('[PrologAutoSync] Failed to load TotT predicates:', e);
      }
      // Load advanced predicates (resources, probabilistic, abductive, meta, procedural)
      try {
        await engine.consult(getAdvancedPredicates());
      } catch (e) {
        console.warn('[PrologAutoSync] Failed to load advanced predicates:', e);
      }
      this.initialized.set(worldId, true);
    }
    return engine;
  }

  /**
   * Remove a world's engine (e.g. when world is deleted).
   */
  removeWorld(worldId: string): void {
    const engine = this.engines.get(worldId);
    if (engine) {
      engine.clear();
      this.engines.delete(worldId);
      this.initialized.delete(worldId);
    }
  }

  // ── Character sync ──────────────────────────────────────────────────────

  /**
   * Called after a character is created or updated.
   */
  async onCharacterChanged(worldId: string, character: CharacterData): Promise<void> {
    const engine = await this.ensureInitialized(worldId);
    const charId = sanitizeAtom(`${character.firstName}_${character.lastName}_${character.id}`);

    // Remove old facts for this character, then re-add
    await this.removeCharacterFacts(engine, charId);

    const facts: string[] = [];

    // Core
    facts.push(`person(${charId})`);
    facts.push(`first_name(${charId}, '${escapeString(character.firstName)}')`);
    facts.push(`last_name(${charId}, '${escapeString(character.lastName)}')`);
    facts.push(`full_name(${charId}, '${escapeString(`${character.firstName} ${character.lastName}`)}')`);
    facts.push(`gender(${charId}, ${sanitizeAtom(character.gender)})`);

    // Age & alive status
    if (character.birthYear != null) {
      facts.push(`birth_year(${charId}, ${character.birthYear})`);
      if (character.isAlive !== false) {
        const age = new Date().getFullYear() - character.birthYear;
        facts.push(`age(${charId}, ${age})`);
        facts.push(`alive(${charId})`);
      } else {
        facts.push(`dead(${charId})`);
      }
    }

    if (character.occupation) {
      facts.push(`occupation(${charId}, ${sanitizeAtom(character.occupation)})`);
    }

    if (character.currentLocation) {
      facts.push(`at_location(${charId}, ${sanitizeAtom(character.currentLocation)})`);
    }

    await engine.assertFacts(facts);
  }

  /**
   * Called after a character is deleted.
   */
  async onCharacterDeleted(worldId: string, characterId: string, firstName?: string, lastName?: string): Promise<void> {
    const engine = await this.ensureInitialized(worldId);
    // If we know the name, use it for the atom; otherwise use just the ID
    const charId = firstName && lastName
      ? sanitizeAtom(`${firstName}_${lastName}_${characterId}`)
      : sanitizeAtom(characterId);

    await this.removeCharacterFacts(engine, charId);
  }

  private async removeCharacterFacts(engine: TauPrologEngine, charId: string): Promise<void> {
    // Find and remove all facts containing this character ID
    const allFacts = engine.getAllFacts();
    for (const fact of allFacts) {
      if (fact.includes(`(${charId})`) || fact.includes(`(${charId},`) || fact.includes(`, ${charId})`) || fact.includes(`, ${charId},`)) {
        await engine.retractFact(fact.replace(/\.\s*$/, ''));
      }
    }
  }

  // ── Relationship sync ─────────────────────────────────────────────────

  /**
   * Called after a relationship change (marriage, friendship, parentage).
   * Pass the full character with updated relationship fields.
   */
  async onRelationshipChanged(worldId: string, character: CharacterData, allCharacters: CharacterData[]): Promise<void> {
    const engine = await this.ensureInitialized(worldId);
    const charId = sanitizeAtom(`${character.firstName}_${character.lastName}_${character.id}`);

    // Remove old relationship facts for this character
    const relPredicates = ['married_to', 'spouse_of', 'parent_of', 'child_of', 'friend_of'];
    const allFacts = engine.getAllFacts();
    for (const fact of allFacts) {
      for (const pred of relPredicates) {
        if (fact.startsWith(`${pred}(${charId},`) || fact.includes(`, ${charId})`)) {
          await engine.retractFact(fact.replace(/\.\s*$/, ''));
        }
      }
    }

    const facts: string[] = [];

    // Spouse
    if (character.spouseId) {
      const spouse = allCharacters.find(c => c.id === character.spouseId);
      if (spouse) {
        const spouseAtom = sanitizeAtom(`${spouse.firstName}_${spouse.lastName}_${spouse.id}`);
        facts.push(`married_to(${charId}, ${spouseAtom})`);
        facts.push(`spouse_of(${charId}, ${spouseAtom})`);
      }
    }

    // Parents
    if (character.parentIds) {
      for (const parentId of character.parentIds) {
        const parent = allCharacters.find(c => c.id === parentId);
        if (parent) {
          const parentAtom = sanitizeAtom(`${parent.firstName}_${parent.lastName}_${parent.id}`);
          facts.push(`parent_of(${parentAtom}, ${charId})`);
          facts.push(`child_of(${charId}, ${parentAtom})`);
        }
      }
    }

    // Friends
    if (character.friendIds) {
      for (const friendId of character.friendIds) {
        const friend = allCharacters.find(c => c.id === friendId);
        if (friend) {
          const friendAtom = sanitizeAtom(`${friend.firstName}_${friend.lastName}_${friend.id}`);
          facts.push(`friend_of(${charId}, ${friendAtom})`);
        }
      }
    }

    if (facts.length > 0) {
      await engine.assertFacts(facts);
    }
  }

  // ── Settlement sync ───────────────────────────────────────────────────

  /**
   * Called after a settlement is created or updated.
   */
  async onSettlementChanged(worldId: string, settlement: SettlementData): Promise<void> {
    const engine = await this.ensureInitialized(worldId);
    const settlementId = sanitizeAtom(settlement.name);

    await this.removeSettlementFacts(engine, settlementId);

    const facts: string[] = [];
    facts.push(`settlement(${settlementId})`);
    facts.push(`settlement_name(${settlementId}, '${escapeString(settlement.name)}')`);

    if (settlement.settlementType) {
      facts.push(`settlement_type(${settlementId}, ${sanitizeAtom(settlement.settlementType)})`);
    }

    if (settlement.population != null) {
      facts.push(`population(${settlementId}, ${settlement.population})`);
    }

    await engine.assertFacts(facts);
  }

  /**
   * Called after a settlement is deleted.
   */
  async onSettlementDeleted(worldId: string, settlementName: string): Promise<void> {
    const engine = await this.ensureInitialized(worldId);
    await this.removeSettlementFacts(engine, sanitizeAtom(settlementName));
  }

  private async removeSettlementFacts(engine: TauPrologEngine, settlementId: string): Promise<void> {
    const predicates = ['settlement', 'settlement_name', 'settlement_type', 'population'];
    const allFacts = engine.getAllFacts();
    for (const fact of allFacts) {
      for (const pred of predicates) {
        if (fact.startsWith(`${pred}(${settlementId})`) || fact.startsWith(`${pred}(${settlementId},`)) {
          await engine.retractFact(fact.replace(/\.\s*$/, ''));
        }
      }
    }
  }

  // ── Business sync ─────────────────────────────────────────────────────

  /**
   * Called after a business is created or updated.
   */
  async onBusinessChanged(worldId: string, business: BusinessData, ownerCharacter?: CharacterData): Promise<void> {
    const engine = await this.ensureInitialized(worldId);
    const businessId = sanitizeAtom(business.name);

    await this.removeBusinessFacts(engine, businessId);

    const facts: string[] = [];
    facts.push(`business(${businessId})`);
    facts.push(`business_name(${businessId}, '${escapeString(business.name)}')`);

    if (business.businessType) {
      facts.push(`business_type(${businessId}, ${sanitizeAtom(business.businessType)})`);
    }

    if (business.ownerId && ownerCharacter) {
      const ownerId = sanitizeAtom(`${ownerCharacter.firstName}_${ownerCharacter.lastName}_${ownerCharacter.id}`);
      facts.push(`owns(${ownerId}, ${businessId})`);
      facts.push(`business_owner(${businessId}, ${ownerId})`);
    }

    await engine.assertFacts(facts);
  }

  /**
   * Called after a business is deleted/closed.
   */
  async onBusinessDeleted(worldId: string, businessName: string): Promise<void> {
    const engine = await this.ensureInitialized(worldId);
    await this.removeBusinessFacts(engine, sanitizeAtom(businessName));
  }

  private async removeBusinessFacts(engine: TauPrologEngine, businessId: string): Promise<void> {
    const predicates = ['business', 'business_name', 'business_type', 'owns', 'business_owner'];
    const allFacts = engine.getAllFacts();
    for (const fact of allFacts) {
      for (const pred of predicates) {
        if (fact.includes(`(${businessId})`) || fact.includes(`(${businessId},`) || fact.includes(`, ${businessId})`)) {
          await engine.retractFact(fact.replace(/\.\s*$/, ''));
          break;
        }
      }
    }
  }

  // ── Truth/Item ownership sync ─────────────────────────────────────────

  /**
   * Called after a truth entry is created or updated.
   * Handles item ownership truths specifically.
   */
  async onTruthChanged(worldId: string, truth: TruthData, ownerCharacter?: CharacterData): Promise<void> {
    if (truth.entryType !== 'ownership') return;

    const engine = await this.ensureInitialized(worldId);
    const data = truth.customData || {};
    if (!truth.characterId || !data.itemId) return;

    if (!ownerCharacter) return;

    const charId = sanitizeAtom(`${ownerCharacter.firstName}_${ownerCharacter.lastName}_${ownerCharacter.id}`);
    const itemId = sanitizeAtom(data.itemId);

    // Remove old facts for this item
    await this.removeItemFacts(engine, itemId);

    const facts: string[] = [];
    facts.push(`has_item(${charId}, ${itemId}, ${data.quantity || 1})`);
    facts.push(`item_name(${itemId}, '${escapeString(data.itemName || data.itemId)}')`);

    if (data.itemType) {
      facts.push(`item_type(${itemId}, ${sanitizeAtom(data.itemType)})`);
    }
    if (data.value) {
      facts.push(`item_value(${itemId}, ${data.value})`);
    }

    await engine.assertFacts(facts);
  }

  /**
   * Called after a truth entry is deleted.
   */
  async onTruthDeleted(worldId: string, truth: TruthData): Promise<void> {
    if (truth.entryType !== 'ownership') return;

    const engine = await this.ensureInitialized(worldId);
    const data = truth.customData || {};
    if (!data.itemId) return;

    await this.removeItemFacts(engine, sanitizeAtom(data.itemId));
  }

  private async removeItemFacts(engine: TauPrologEngine, itemId: string): Promise<void> {
    const predicates = ['has_item', 'item_name', 'item_type', 'item_value'];
    const allFacts = engine.getAllFacts();
    for (const fact of allFacts) {
      for (const pred of predicates) {
        if (fact.includes(`${itemId}`)) {
          await engine.retractFact(fact.replace(/\.\s*$/, ''));
          break;
        }
      }
    }
  }

  // ── Knowledge sync ────────────────────────────────────────────────────

  /**
   * Called after knowledge/belief is added to a character's mental model.
   */
  async onKnowledgeChanged(worldId: string, observer: CharacterData, subjectId: string, subject: CharacterData): Promise<void> {
    const engine = await this.ensureInitialized(worldId);
    const observerId = sanitizeAtom(`${observer.firstName}_${observer.lastName}_${observer.id}`);
    const subjectPrologId = sanitizeAtom(`${subject.firstName}_${subject.lastName}_${subject.id}`);

    const knowledge = (observer.mentalModels as any) || { mentalModels: {} };
    const models = knowledge.mentalModels || {};
    const model = models[subjectId];
    if (!model) return;

    // Remove old knowledge facts for this observer-subject pair
    const allFacts = engine.getAllFacts();
    for (const fact of allFacts) {
      if (fact.includes(`(${observerId}, ${subjectPrologId}`) || fact.includes(`(${observerId}, ${subjectPrologId},`)) {
        const knowledgePredicates = ['has_mental_model', 'mental_model_confidence', 'mental_model_updated', 'knows', 'knows_value', 'believes', 'evidence'];
        for (const pred of knowledgePredicates) {
          if (fact.startsWith(`${pred}(`)) {
            await engine.retractFact(fact.replace(/\.\s*$/, ''));
            break;
          }
        }
      }
    }

    const facts: string[] = [];
    facts.push(`has_mental_model(${observerId}, ${subjectPrologId})`);
    facts.push(`mental_model_confidence(${observerId}, ${subjectPrologId}, ${model.confidence || 0.5})`);

    if (model.lastUpdated) {
      facts.push(`mental_model_updated(${observerId}, ${subjectPrologId}, ${model.lastUpdated})`);
    }

    // Known facts
    if (model.knownFacts) {
      for (const [fact, known] of Object.entries(model.knownFacts)) {
        if (known) {
          facts.push(`knows(${observerId}, ${subjectPrologId}, ${sanitizeAtom(fact as string)})`);
        }
      }
    }

    // Known values
    if (model.knownValues) {
      for (const [attr, value] of Object.entries(model.knownValues)) {
        const valueAtom = typeof value === 'string' ? `'${escapeString(value)}'` : String(value);
        facts.push(`knows_value(${observerId}, ${subjectPrologId}, ${sanitizeAtom(attr)}, ${valueAtom})`);
      }
    }

    // Beliefs
    if (model.beliefs) {
      for (const [quality, belief] of Object.entries(model.beliefs)) {
        const b = belief as any;
        facts.push(`believes(${observerId}, ${subjectPrologId}, ${sanitizeAtom(quality)}, ${b.confidence || 0.5})`);

        // Sync evidence for this belief
        if (b.evidence && Array.isArray(b.evidence)) {
          for (const evt of b.evidence) {
            const typeAtom = sanitizeAtom(evt.type || 'unknown');
            const strength = evt.strength || 0.5;
            const timestamp = evt.timestamp || 0;
            facts.push(`evidence(${observerId}, ${subjectPrologId}, ${sanitizeAtom(quality)}, ${typeAtom}, ${strength}, ${timestamp})`);
          }
        }
      }
    }

    await engine.assertFacts(facts);
  }

  // ── Bulk sync (initial load) ──────────────────────────────────────────

  /**
   * Bulk-sync an entire world's data into tau-prolog.
   * Called on first access or when "Sync from DB" is explicitly triggered.
   */
  async syncWorld(worldId: string, data: {
    characters: CharacterData[];
    settlements: SettlementData[];
    businesses: BusinessData[];
    truths?: TruthData[];
  }): Promise<{ factCount: number; ruleCount: number }> {
    // Reset engine for this world
    this.removeWorld(worldId);
    const engine = await this.ensureInitialized(worldId);

    // Characters
    for (const char of data.characters) {
      await this.onCharacterChanged(worldId, char);
    }

    // Relationships (need all characters for lookups)
    for (const char of data.characters) {
      if (char.spouseId || (char.parentIds && char.parentIds.length) || (char.friendIds && char.friendIds.length)) {
        await this.onRelationshipChanged(worldId, char, data.characters);
      }
    }

    // Settlements
    for (const settlement of data.settlements) {
      await this.onSettlementChanged(worldId, settlement);
    }

    // Businesses
    for (const business of data.businesses) {
      const owner = business.ownerId ? data.characters.find(c => c.id === business.ownerId) : undefined;
      await this.onBusinessChanged(worldId, business, owner);
    }

    // Truths (item ownership)
    if (data.truths) {
      for (const truth of data.truths) {
        if (truth.entryType === 'ownership' && truth.characterId) {
          const owner = data.characters.find(c => c.id === truth.characterId);
          await this.onTruthChanged(worldId, truth, owner);
        }
      }
    }

    return engine.getStats();
  }

  /**
   * Query the knowledge base for a world.
   */
  async query(worldId: string, queryString: string, maxResults?: number) {
    const engine = await this.ensureInitialized(worldId);
    return engine.query(queryString, maxResults);
  }

  /**
   * Export knowledge base for a world as a .pl string.
   */
  exportWorld(worldId: string): string {
    const engine = this.getEngine(worldId);
    return engine.export();
  }

  /**
   * Get stats for a world's knowledge base.
   */
  getWorldStats(worldId: string) {
    const engine = this.getEngine(worldId);
    return engine.getStats();
  }

  /**
   * Check if a world has been synced.
   */
  isWorldSynced(worldId: string): boolean {
    return this.initialized.has(worldId);
  }

  // ── Prolog → DB sync-back ───────────────────────────────────────────────

  /**
   * Parse a Prolog fact string like "married_to(alice, bob)" into structured form.
   */
  private parseFact(factStr: string): ParsedFact | null {
    const cleaned = factStr.replace(/\.\s*$/, '').trim();
    const match = cleaned.match(/^(\w+)\((.+)\)$/);
    if (!match) return null;
    const predicate = match[1];
    // Split arguments, handling nested terms and quoted atoms
    const argsStr = match[2];
    const args: string[] = [];
    let depth = 0;
    let current = '';
    for (let i = 0; i < argsStr.length; i++) {
      const ch = argsStr[i];
      if (ch === '(' || ch === '[') depth++;
      else if (ch === ')' || ch === ']') depth--;
      else if (ch === ',' && depth === 0) {
        args.push(current.trim());
        current = '';
        continue;
      }
      current += ch;
    }
    if (current.trim()) args.push(current.trim());
    return { predicate, args, raw: cleaned };
  }

  /**
   * Build a lookup from Prolog atom → character DB id.
   * Prolog atoms are formatted as `firstname_lastname_dbid`.
   */
  private buildAtomToIdMap(characters: { id: string; firstName: string; lastName: string }[]): Map<string, string> {
    const map = new Map<string, string>();
    for (const c of characters) {
      const atom = sanitizeAtom(`${c.firstName}_${c.lastName}_${c.id}`);
      map.set(atom, c.id);
    }
    return map;
  }

  /**
   * Extract the current sync-back predicate facts from the engine,
   * grouped by predicate name.
   */
  private extractSyncBackFacts(engine: TauPrologEngine): Map<string, Set<string>> {
    const result = new Map<string, Set<string>>();
    for (const pred of SYNC_BACK_PREDICATES) {
      result.set(pred, new Set());
    }
    const allFacts = engine.getAllFacts();
    for (const fact of allFacts) {
      const parsed = this.parseFact(fact);
      if (parsed && (SYNC_BACK_PREDICATES as readonly string[]).includes(parsed.predicate)) {
        result.get(parsed.predicate)!.add(parsed.raw);
      }
    }
    return result;
  }

  /**
   * Sync state changes from the Prolog knowledge base back to the database.
   *
   * Compares current Prolog facts against the last known snapshot and writes
   * only the differences back to MongoDB. Tracked predicates:
   *   - married_to(A, B) → update character spouseId
   *   - dead(X) → set character isAlive=false
   *   - occupation(X, Job) → update character occupation
   *   - friend_of(A, B) → update character friendIds
   *   - enemy_of(A, B) → update character relationships (enemy)
   *   - wealth(X, Amount) → store in character's customData/socialAttributes
   */
  async syncPrologToDatabase(worldId: string): Promise<SyncBackResult> {
    const result: SyncBackResult = {
      worldId,
      changesApplied: 0,
      details: [],
      errors: [],
      timestamp: new Date(),
    };

    const engine = this.engines.get(worldId);
    if (!engine) {
      result.errors.push('No Prolog engine found for this world. Sync DB → Prolog first.');
      return result;
    }

    // Fetch all characters for this world
    const characters = await storage.getCharactersByWorld(worldId);
    if (characters.length === 0) {
      result.details.push('No characters in world — nothing to sync back.');
      return result;
    }

    const atomToId = this.buildAtomToIdMap(characters);
    const charById = new Map(characters.map(c => [c.id, c]));

    // Get current facts and previous snapshot
    const currentFacts = this.extractSyncBackFacts(engine);
    const previousFacts = this.lastSyncedFacts.get(worldId);

    // Determine new/removed facts per predicate
    const newFacts = new Map<string, Set<string>>();
    const removedFacts = new Map<string, Set<string>>();

    for (const pred of SYNC_BACK_PREDICATES) {
      const curr = currentFacts.get(pred) || new Set<string>();
      const prev = previousFacts?.get(pred) || new Set<string>();
      const added = new Set<string>();
      const removed = new Set<string>();
      Array.from(curr).forEach(f => { if (!prev.has(f)) added.add(f); });
      Array.from(prev).forEach(f => { if (!curr.has(f)) removed.add(f); });
      newFacts.set(pred, added);
      removedFacts.set(pred, removed);
    }

    // If first sync, just snapshot — don't write changes (we don't know what's "new")
    if (!previousFacts) {
      this.lastSyncedFacts.set(worldId, currentFacts);
      result.details.push('Initial snapshot captured. Changes will be detected on next sync.');
      return result;
    }

    // ── Apply changes ──────────────────────────────────────────────────

    // 1. married_to(A, B) — new marriages
    for (const factStr of Array.from(newFacts.get('married_to')!)) {
      const parsed = this.parseFact(factStr);
      if (!parsed || parsed.args.length < 2) continue;
      const idA = atomToId.get(parsed.args[0]);
      const idB = atomToId.get(parsed.args[1]);
      if (idA && idB) {
        try {
          await storage.updateCharacter(idA, { spouseId: idB });
          await storage.updateCharacter(idB, { spouseId: idA });
          result.changesApplied += 2;
          result.details.push(`Married: ${parsed.args[0]} ↔ ${parsed.args[1]}`);
        } catch (e: any) {
          result.errors.push(`Failed to update marriage ${parsed.args[0]} ↔ ${parsed.args[1]}: ${e.message}`);
        }
      }
    }

    // married_to removed — clear spouseId if it matches
    for (const factStr of Array.from(removedFacts.get('married_to')!)) {
      const parsed = this.parseFact(factStr);
      if (!parsed || parsed.args.length < 2) continue;
      const idA = atomToId.get(parsed.args[0]);
      const idB = atomToId.get(parsed.args[1]);
      if (idA && idB) {
        try {
          const charA = charById.get(idA);
          const charB = charById.get(idB);
          if (charA?.spouseId === idB) {
            await storage.updateCharacter(idA, { spouseId: null as any });
            result.changesApplied++;
          }
          if (charB?.spouseId === idA) {
            await storage.updateCharacter(idB, { spouseId: null as any });
            result.changesApplied++;
          }
          result.details.push(`Unmarried: ${parsed.args[0]} ↔ ${parsed.args[1]}`);
        } catch (e: any) {
          result.errors.push(`Failed to clear marriage ${parsed.args[0]} ↔ ${parsed.args[1]}: ${e.message}`);
        }
      }
    }

    // 2. dead(X) — character death
    for (const factStr of Array.from(newFacts.get('dead')!)) {
      const parsed = this.parseFact(factStr);
      if (!parsed || parsed.args.length < 1) continue;
      const id = atomToId.get(parsed.args[0]);
      if (id) {
        try {
          await storage.updateCharacter(id, { isAlive: false, status: 'deceased' });
          result.changesApplied++;
          result.details.push(`Died: ${parsed.args[0]}`);
        } catch (e: any) {
          result.errors.push(`Failed to mark dead ${parsed.args[0]}: ${e.message}`);
        }
      }
    }

    // dead(X) removed — character resurrection (rare but handle it)
    for (const factStr of Array.from(removedFacts.get('dead')!)) {
      const parsed = this.parseFact(factStr);
      if (!parsed || parsed.args.length < 1) continue;
      const id = atomToId.get(parsed.args[0]);
      if (id) {
        try {
          await storage.updateCharacter(id, { isAlive: true, status: 'active' });
          result.changesApplied++;
          result.details.push(`Revived: ${parsed.args[0]}`);
        } catch (e: any) {
          result.errors.push(`Failed to revive ${parsed.args[0]}: ${e.message}`);
        }
      }
    }

    // 3. occupation(X, Job) — occupation changes
    for (const factStr of Array.from(newFacts.get('occupation')!)) {
      const parsed = this.parseFact(factStr);
      if (!parsed || parsed.args.length < 2) continue;
      const id = atomToId.get(parsed.args[0]);
      if (id) {
        try {
          const job = parsed.args[1].replace(/^'|'$/g, '');
          await storage.updateCharacter(id, { occupation: job });
          result.changesApplied++;
          result.details.push(`Occupation: ${parsed.args[0]} → ${job}`);
        } catch (e: any) {
          result.errors.push(`Failed to update occupation ${parsed.args[0]}: ${e.message}`);
        }
      }
    }

    // 4. wealth(X, Amount) — wealth changes stored in socialAttributes
    for (const factStr of Array.from(newFacts.get('wealth')!)) {
      const parsed = this.parseFact(factStr);
      if (!parsed || parsed.args.length < 2) continue;
      const id = atomToId.get(parsed.args[0]);
      if (id) {
        try {
          const amount = parseFloat(parsed.args[1]) || 0;
          const char = charById.get(id);
          const social = (char?.socialAttributes as Record<string, any>) || {};
          await storage.updateCharacter(id, {
            socialAttributes: { ...social, wealth: amount },
          });
          result.changesApplied++;
          result.details.push(`Wealth: ${parsed.args[0]} → ${amount}`);
        } catch (e: any) {
          result.errors.push(`Failed to update wealth ${parsed.args[0]}: ${e.message}`);
        }
      }
    }

    // 5. friend_of(A, B) — friendship additions
    // Collect all current friend_of facts per character, then diff against DB
    const friendAdditions = new Map<string, Set<string>>();
    const friendRemovals = new Map<string, Set<string>>();

    for (const factStr of Array.from(newFacts.get('friend_of')!)) {
      const parsed = this.parseFact(factStr);
      if (!parsed || parsed.args.length < 2) continue;
      const idA = atomToId.get(parsed.args[0]);
      const idB = atomToId.get(parsed.args[1]);
      if (idA && idB) {
        if (!friendAdditions.has(idA)) friendAdditions.set(idA, new Set());
        friendAdditions.get(idA)!.add(idB);
      }
    }

    for (const factStr of Array.from(removedFacts.get('friend_of')!)) {
      const parsed = this.parseFact(factStr);
      if (!parsed || parsed.args.length < 2) continue;
      const idA = atomToId.get(parsed.args[0]);
      const idB = atomToId.get(parsed.args[1]);
      if (idA && idB) {
        if (!friendRemovals.has(idA)) friendRemovals.set(idA, new Set());
        friendRemovals.get(idA)!.add(idB);
      }
    }

    // Apply friend changes
    const friendCharIds = new Set([...Array.from(friendAdditions.keys()), ...Array.from(friendRemovals.keys())]);
    for (const charId of Array.from(friendCharIds)) {
      const char = charById.get(charId);
      if (!char) continue;
      const currentFriends = new Set<string>((char.friendIds as string[]) || []);
      const additions = friendAdditions.get(charId);
      const removals = friendRemovals.get(charId);
      if (additions) Array.from(additions).forEach(fid => currentFriends.add(fid));
      if (removals) Array.from(removals).forEach(fid => currentFriends.delete(fid));
      try {
        await storage.updateCharacter(charId, { friendIds: Array.from(currentFriends) });
        result.changesApplied++;
        if (additions?.size) result.details.push(`Friends added for ${charId}: +${additions.size}`);
        if (removals?.size) result.details.push(`Friends removed for ${charId}: -${removals.size}`);
      } catch (e: any) {
        result.errors.push(`Failed to update friends for ${charId}: ${e.message}`);
      }
    }

    // 6. enemy_of(A, B) — enemy relationships stored in character.relationships
    const enemyAdditions = new Map<string, Set<string>>();
    const enemyRemovals = new Map<string, Set<string>>();

    for (const factStr of Array.from(newFacts.get('enemy_of')!)) {
      const parsed = this.parseFact(factStr);
      if (!parsed || parsed.args.length < 2) continue;
      const idA = atomToId.get(parsed.args[0]);
      const idB = atomToId.get(parsed.args[1]);
      if (idA && idB) {
        if (!enemyAdditions.has(idA)) enemyAdditions.set(idA, new Set());
        enemyAdditions.get(idA)!.add(idB);
      }
    }

    for (const factStr of Array.from(removedFacts.get('enemy_of')!)) {
      const parsed = this.parseFact(factStr);
      if (!parsed || parsed.args.length < 2) continue;
      const idA = atomToId.get(parsed.args[0]);
      const idB = atomToId.get(parsed.args[1]);
      if (idA && idB) {
        if (!enemyRemovals.has(idA)) enemyRemovals.set(idA, new Set());
        enemyRemovals.get(idA)!.add(idB);
      }
    }

    const enemyCharIds = new Set([...Array.from(enemyAdditions.keys()), ...Array.from(enemyRemovals.keys())]);
    for (const charId of Array.from(enemyCharIds)) {
      const char = charById.get(charId);
      if (!char) continue;
      const rels = (char.relationships as Record<string, any>) || {};
      const enemies = new Set<string>((rels.enemyIds as string[]) || []);
      const additions = enemyAdditions.get(charId);
      const removals = enemyRemovals.get(charId);
      if (additions) Array.from(additions).forEach(eid => enemies.add(eid));
      if (removals) Array.from(removals).forEach(eid => enemies.delete(eid));
      try {
        await storage.updateCharacter(charId, {
          relationships: { ...rels, enemyIds: Array.from(enemies) },
        });
        result.changesApplied++;
        if (additions?.size) result.details.push(`Enemies added for ${charId}: +${additions.size}`);
        if (removals?.size) result.details.push(`Enemies removed for ${charId}: -${removals.size}`);
      } catch (e: any) {
        result.errors.push(`Failed to update enemies for ${charId}: ${e.message}`);
      }
    }

    // Update the snapshot
    this.lastSyncedFacts.set(worldId, currentFacts);

    console.log(`[PrologAutoSync] Sync-back for world ${worldId}: ${result.changesApplied} changes, ${result.errors.length} errors`);
    return result;
  }

  /**
   * Start periodic bidirectional sync (Prolog → DB) for a world.
   * The DB → Prolog direction is handled by the existing event-driven hooks.
   */
  startBidirectionalSync(worldId: string, intervalMs: number = 30000): void {
    // Don't start duplicate timers
    if (this.syncTimers.has(worldId)) {
      console.warn(`[PrologAutoSync] Bidirectional sync already running for world ${worldId}`);
      return;
    }

    // Take an initial snapshot so the first interval detects real changes
    const engine = this.engines.get(worldId);
    if (engine) {
      this.lastSyncedFacts.set(worldId, this.extractSyncBackFacts(engine));
    }

    const timer = setInterval(async () => {
      try {
        await this.syncPrologToDatabase(worldId);
      } catch (e) {
        console.error(`[PrologAutoSync] Bidirectional sync error for world ${worldId}:`, e);
      }
    }, intervalMs);

    this.syncTimers.set(worldId, timer);
    console.log(`[PrologAutoSync] Bidirectional sync started for world ${worldId} (every ${intervalMs}ms)`);
  }

  /**
   * Stop periodic bidirectional sync for a world.
   */
  stopBidirectionalSync(worldId: string): void {
    const timer = this.syncTimers.get(worldId);
    if (timer) {
      clearInterval(timer);
      this.syncTimers.delete(worldId);
      console.log(`[PrologAutoSync] Bidirectional sync stopped for world ${worldId}`);
    }
  }
}

// ── String helpers ──────────────────────────────────────────────────────────

function sanitizeAtom(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/^([0-9])/, '_$1')
    .replace(/_+/g, '_');
}

function escapeString(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

// ── Singleton ───────────────────────────────────────────────────────────────

export const prologAutoSync = new PrologAutoSync();
