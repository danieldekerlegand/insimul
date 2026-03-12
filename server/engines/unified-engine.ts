import { type Rule, type Grammar, type Character, type World, type InsertTruth } from "@shared/schema";
import { type IStorage } from "../db/storage";
import { TraceryService } from "../services/tracery-service";
import { getWorldTypeDefaults, type WorldTypeRates } from "./world-type-defaults.js";

/**
 * Effect types that can be generated from rule execution
 */
export interface Effect {
  type: 'generate_text' | 'modify_attribute' | 'create_entity' | 'trigger_event';
  target?: string;
  action?: string;
  traceryTemplate?: string;
  variables?: Record<string, any>;
  [key: string]: any;
}

/**
 * Character state snapshot at a specific timestep
 */
export interface CharacterSnapshot {
  timestep: number;
  characterId: string;
  attributes: {
    firstName: string;
    lastName: string;
    birthYear: number;
    gender: string;
    isAlive: boolean;
    occupation: string | null;
    currentLocation: string | null;
    status: string;
  };
  relationships: {
    spouseId: string | null;
    parentIds: string[];
    childIds: string[];
    friendIds: string[];
  };
  customAttributes: Record<string, any>;
}

/**
 * Rule execution record with context
 */
export interface RuleExecutionRecord {
  timestep: number;
  ruleId: string;
  ruleName: string;
  ruleType: string;
  conditions: any[];
  effectsExecuted: Array<{
    type: string;
    description: string;
    success: boolean;
  }>;
  charactersAffected: string[];
  narrativeGenerated: string | null;
  timestamp: Date;
}

/**
 * Result of a single simulation step
 */
export interface SimulationStepResult {
  narratives: string[];
  events: Array<{
    type: string;
    description: string;
    timestamp: Date;
  }>;
  rulesExecuted: string[];
  truthsCreated: string[]; // IDs of Truth entries created
  characterSnapshots: Map<number, Map<string, CharacterSnapshot>>; // timestep -> characterId -> snapshot
  ruleExecutionSequence: RuleExecutionRecord[];
  success: boolean;
  error?: string;
}

/**
 * Simulation context that tracks state during execution
 */
export interface SimulationContext {
  worldId: string;
  simulationId: string;
  characters: Character[];
  world: World;
  narrativeOutput: string[];
  events: Array<{ type: string; description: string; timestamp: Date }>;
  rulesExecuted: string[];
  truthsCreated: string[]; // Track created Truth IDs
  currentTimestep: number; // Track current timestep for Truth entries
  characterSnapshots: Map<number, Map<string, CharacterSnapshot>>; // timestep -> characterId -> snapshot
  ruleExecutionSequence: RuleExecutionRecord[];
  currentRuleExecution: RuleExecutionRecord | null; // Track current rule being executed
  variables: Record<string, any>;
}

/**
 * Configuration for a simulation run.
 */
export interface SimulationConfig {
  /**
   * 'lo-fi' skips observation, routines, and detailed social dynamics.
   * 'hi-fi' activates all TotT subsystems every timestep.
   */
  simulationMode: 'lo-fi' | 'hi-fi';

  /** Number of timesteps to run (default 1) */
  steps?: number;

  /** Override world-type rate table (merged with world-type defaults) */
  rateOverrides?: Partial<WorldTypeRates>;
}

/**
 * Result of a hi-fi simulation run across multiple timesteps.
 */
export interface HiFiSimulationResult {
  /** Per-step results */
  stepResults: SimulationStepResult[];

  /** Aggregate stats */
  totalObservations: number;
  totalSocializations: number;
  totalLifeEvents: {
    marriages: number;
    conceptions: number;
    births: number;
    divorces: number;
    deaths: number;
  };
  totalGriefInitiated: number;
  totalConstructionUpdates: number;
  totalKnowledgePropagations: number;
  totalRandomTownEvents: number;

  /** The resolved rate table used for this run */
  rates: WorldTypeRates;

  success: boolean;
  error?: string;
}

/**
 * InsimulSimulationEngine
 *
 * Unified simulation engine that handles both Prolog and JavaScript-based
 * rule execution with integrated Tracery narrative generation.
 */
export class InsimulSimulationEngine {
  private storage: IStorage;
  private rules: Map<string, Rule> = new Map();
  private grammars: Map<string, Grammar> = new Map();
  private context: SimulationContext | null = null;
  private prologSynced: Set<string> = new Set(); // Track which worlds have been synced

  constructor(storage: IStorage) {
    this.storage = storage;
  }

  /**
   * Sync world data to Prolog knowledge base
   */
  private async syncWorldToProlog(worldId: string): Promise<void> {
    // Only sync once per world per engine instance
    if (this.prologSynced.has(worldId)) {
      console.log(`✅ World ${worldId} already synced to Prolog`);
      return;
    }

    try {
      console.log(`🔄 Syncing world ${worldId} to Prolog...`);
      const { createPrologSyncService } = await import('./prolog/prolog-sync.js');
      const { PrologManager } = await import('./prolog/prolog-manager.js');
      
      const kbFile = `knowledge_base_${worldId}.pl`;
      const prologManager = new PrologManager(kbFile, worldId);
      await prologManager.initialize();
      
      const syncService = createPrologSyncService(this.storage, prologManager);
      await syncService.syncWorldToProlog(worldId);
      
      this.prologSynced.add(worldId);
      console.log(`✅ World ${worldId} synced to Prolog`);
    } catch (error) {
      console.warn(`⚠️  Failed to sync world ${worldId} to Prolog:`, error);
      // Don't throw - allow simulation to continue without Prolog
    }
  }

  /**
   * Load rules from the database for a specific world
   */
  async loadRules(worldId: string): Promise<void> {
    const rules = await this.storage.getRulesByWorld(worldId);
    this.rules.clear();
    rules.forEach(rule => {
      this.rules.set(rule.id, rule);
    });
  }

  /**
   * Load grammars from the database for a specific world
   */
  async loadGrammars(worldId: string): Promise<void> {
    const grammars = await this.storage.getGrammarsByWorld(worldId);
    this.grammars.clear();
    grammars.forEach(grammar => {
      this.grammars.set(grammar.name, grammar);
    });
  }

  /**
   * Initialize simulation context with world and character data
   */
  async initializeContext(worldId: string, simulationId: string): Promise<void> {
    const world = await this.storage.getWorld(worldId);
    if (!world) {
      throw new Error(`World ${worldId} not found`);
    }

    const characters = await this.storage.getCharactersByWorld(worldId);

    // Sync world data to Prolog knowledge base
    await this.syncWorldToProlog(worldId);

    this.context = {
      worldId,
      simulationId,
      world,
      characters,
      narrativeOutput: [],
      events: [],
      rulesExecuted: [],
      truthsCreated: [],
      currentTimestep: 0,
      characterSnapshots: new Map(),
      ruleExecutionSequence: [],
      currentRuleExecution: null,
      variables: {}
    };

    // Capture initial character states at timestep 0
    await this.captureCharacterSnapshots(0);
  }

  /**
   * Execute a single simulation step using Prolog engine
   *
   * @param worldId - The world ID
   * @param simulationId - The simulation ID
   * @returns SimulationStepResult with narratives, events, and executed rules
   */
  async executeStep(
    worldId: string,
    simulationId: string
  ): Promise<SimulationStepResult> {
    try {
      // Initialize if not already done
      if (!this.context || this.context.worldId !== worldId) {
        await this.loadRules(worldId);
        await this.loadGrammars(worldId);
        await this.initializeContext(worldId, simulationId);
      }

      // Increment timestep
      if (this.context) {
        this.context.currentTimestep++;
      }

      // Execute with Prolog engine (only mode)
      return await this.executePrologStep();
    } catch (error) {
      return {
        narratives: [],
        events: [],
        rulesExecuted: [],
        truthsCreated: [],
        characterSnapshots: new Map(),
        ruleExecutionSequence: [],
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Execute a step using Prolog engine
   */
  private async executePrologStep(): Promise<SimulationStepResult> {
    if (!this.context) {
      throw new Error('Context not initialized');
    }

    try {
      const { PrologManager } = await import('./prolog/prolog-manager.js');
      const { InsimulRuleCompiler } = await import('../../client/src/lib/unified-syntax.js');
      
      const kbFile = `knowledge_base_${this.context.worldId}.pl`;
      const prologManager = new PrologManager(kbFile, this.context.worldId);
      await prologManager.initialize();

      // Convert Insimul rules to Prolog format and add to knowledge base
      const compiler = new InsimulRuleCompiler();
      for (const [ruleId, rule] of Array.from(this.rules)) {
        try {
          // Compile rule to Insimul format first
          const insimulRules = compiler.compile(rule.content, 'insimul');
          
          // Convert to Prolog
          const prologRule = compiler.generateSwiProlog(insimulRules);
          
          // Add rule to Prolog
          await prologManager.addRule(prologRule);
          
          console.log(`✅ Added rule ${rule.name} to Prolog`);
        } catch (error) {
          console.warn(`⚠️  Failed to convert rule ${rule.name} to Prolog:`, error);
        }
      }

      // Query Prolog for triggered rules
      // For now, we execute all rules that have conditions satisfied
      for (const [ruleId, rule] of Array.from(this.rules)) {
        await this.startRuleExecution(ruleId, rule);
        
        // Try to execute rule effects from parsedContent (legacy) or let Prolog handle them
        const parsedContent = (rule as any).parsedContent;
        const effects: Effect[] = (parsedContent && Array.isArray(parsedContent.effects)) ? parsedContent.effects : [];
        for (const effect of effects) {
          await this.executeEffect(effect, rule.name);
        }
        
        await this.finishRuleExecution();
        this.context.rulesExecuted.push(rule.name);
        await this.captureCharacterSnapshots(this.context.currentTimestep);
      }

      return {
        narratives: this.context.narrativeOutput,
        events: this.context.events,
        rulesExecuted: this.context.rulesExecuted,
        truthsCreated: this.context.truthsCreated,
        characterSnapshots: this.context.characterSnapshots,
        ruleExecutionSequence: this.context.ruleExecutionSequence,
        success: true
      };
    } catch (error) {
      console.error('❌ Prolog execution error:', error);
      
      // Return error result instead of falling back
      return {
        narratives: this.context?.narrativeOutput || [],
        events: this.context?.events || [],
        rulesExecuted: this.context?.rulesExecuted || [],
        truthsCreated: this.context?.truthsCreated || [],
        characterSnapshots: this.context?.characterSnapshots || new Map(),
        ruleExecutionSequence: this.context?.ruleExecutionSequence || [],
        success: false,
        error: `Prolog execution failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Execute a single effect from a rule
   */
  private async executeEffect(effect: Effect, ruleName: string): Promise<void> {
    if (!this.context) {
      throw new Error('Context not initialized');
    }

    switch (effect.type) {
      case 'generate_text':
        await this.executeGenerateTextEffect(effect);
        break;

      case 'modify_attribute':
        await this.executeModifyAttributeEffect(effect);
        break;

      case 'create_entity':
        await this.executeCreateEntityEffect(effect);
        break;

      case 'trigger_event':
        await this.executeTriggerEventEffect(effect, ruleName);
        break;

      default:
        console.warn(`Unknown effect type: ${effect.type}`);
    }
  }

  /**
   * Execute a generate_text effect using Tracery
   */
  private async executeGenerateTextEffect(effect: Effect): Promise<void> {
    if (!this.context) return;

    const templateName = effect.traceryTemplate;
    if (!templateName) {
      console.warn('generate_text effect missing traceryTemplate');
      return;
    }

    // Look up the grammar
    const grammar = this.grammars.get(templateName);
    if (!grammar) {
      console.warn(`Grammar "${templateName}" not found`);
      this.context.narrativeOutput.push(`[Missing grammar: ${templateName}]`);
      return;
    }

    try {
      // Merge effect variables with context variables
      const variables = {
        ...this.context.variables,
        ...(effect.variables || {})
      };

      // Expand the grammar using TraceryService
      const narrative = TraceryService.expand(
        grammar.grammar as Record<string, string | string[]>,
        variables
      );

      // Add to narrative output
      this.context.narrativeOutput.push(narrative);

      // Also create an event for the narrative
      this.context.events.push({
        type: 'narrative',
        description: narrative,
        timestamp: new Date()
      });

      // Track narrative generation in current rule execution
      this.trackNarrativeGenerated(narrative);
      this.trackEffectExecution(effect, true, `Generated narrative from ${templateName}`);

      // Track characters from variables
      for (const [key, value] of Object.entries(variables)) {
        const char = this.context.characters.find(
          c => `${c.firstName} ${c.lastName}` === value || c.firstName === value
        );
        if (char) {
          this.trackCharacterAffected(char.id);
        }
      }

      // Create Truth entry for this narrative event
      await this.createTruthFromNarrative(narrative, templateName, variables);
    } catch (error) {
      console.error(`Error expanding grammar "${templateName}":`, error);
      this.context.narrativeOutput.push(`[Error: Failed to expand grammar ${templateName}]`);
      this.trackEffectExecution(effect, false, `Failed to expand grammar ${templateName}: ${error}`);
    }
  }

  /**
   * Execute a modify_attribute effect
   */
  private async executeModifyAttributeEffect(effect: Effect): Promise<void> {
    if (!this.context) return;

    // TODO: Implement attribute modification
    // This would update character/entity attributes based on the effect
    this.context.events.push({
      type: 'attribute_modified',
      description: `Modified ${effect.target}: ${effect.action}`,
      timestamp: new Date()
    });

    this.trackEffectExecution(effect, true, `Modified ${effect.target}: ${effect.action}`);
    if (effect.target) {
      // Try to find character by name or ID
      const char = this.context.characters.find(c => c.id === effect.target || c.firstName === effect.target);
      if (char) {
        this.trackCharacterAffected(char.id);
      }
    }
  }

  /**
   * Execute a create_entity effect
   */
  private async executeCreateEntityEffect(effect: Effect): Promise<void> {
    if (!this.context) return;

    // TODO: Implement entity creation
    // This would create new characters, locations, items, etc.
    this.context.events.push({
      type: 'entity_created',
      description: `Created ${effect.target}`,
      timestamp: new Date()
    });

    this.trackEffectExecution(effect, true, `Created entity: ${effect.target}`);
  }

  /**
   * Execute a trigger_event effect
   */
  private async executeTriggerEventEffect(effect: Effect, ruleName: string): Promise<void> {
    if (!this.context) return;

    this.context.events.push({
      type: effect.action || 'custom_event',
      description: `Rule "${ruleName}" triggered event: ${effect.target || 'unknown'}`,
      timestamp: new Date()
    });

    this.trackEffectExecution(
      effect,
      true,
      `Triggered event: ${effect.target || 'unknown'}`
    );
  }

  /**
   * Get the current simulation context
   */
  getContext(): SimulationContext | null {
    return this.context;
  }

  /**
   * Set the current timestep for Truth generation
   */
  setTimestep(timestep: number): void {
    if (this.context) {
      this.context.currentTimestep = timestep;
    }
  }

  /**
   * Create a Truth entry from a narrative event
   */
  private async createTruthFromNarrative(
    narrative: string,
    grammarName: string,
    variables: Record<string, any>
  ): Promise<void> {
    if (!this.context) return;

    try {
      // Extract character names from variables to link related characters
      const relatedCharacterIds: string[] = [];
      for (const [key, value] of Object.entries(variables)) {
        // Try to find character by name
        const char = this.context.characters.find(
          c => `${c.firstName} ${c.lastName}` === value || c.firstName === value
        );
        if (char) {
          relatedCharacterIds.push(char.id);
        }
      }

      const truthEntry: InsertTruth = {
        worldId: this.context.worldId,
        timestep: this.context.currentTimestep,
        timestepDuration: 1,
        entryType: 'event',
        title: `Simulation Event (${grammarName})`,
        content: narrative,
        relatedCharacterIds,
        tags: ['simulation', 'narrative', grammarName],
        importance: 5,
        isPublic: true,
        source: 'simulation_generated',
        sourceData: {
          simulationId: this.context.simulationId,
          grammarName,
          timestep: this.context.currentTimestep,
          variables
        }
      };

      const truth = await this.storage.createTruth(truthEntry);
      this.context.truthsCreated.push(truth.id);
    } catch (error) {
      console.error('Error creating Truth from narrative:', error);
    }
  }

  /**
   * Create a Truth entry from a generic event
   */
  private async createTruthFromEvent(
    event: { type: string; description: string; timestamp: Date },
    ruleName: string
  ): Promise<void> {
    if (!this.context) return;

    try {
      // Map event type to Truth entry type
      const entryTypeMap: Record<string, string> = {
        'attribute_modified': 'milestone',
        'entity_created': 'event',
        'custom_event': 'event',
        'narrative': 'event'
      };

      const truthEntry: InsertTruth = {
        worldId: this.context.worldId,
        timestep: this.context.currentTimestep,
        timestepDuration: 1,
        entryType: (entryTypeMap[event.type] || 'event') as any,
        title: `${ruleName}: ${event.type}`,
        content: event.description,
        relatedCharacterIds: [],
        tags: ['simulation', event.type, ruleName],
        importance: 3,
        isPublic: true,
        source: 'simulation_generated',
        sourceData: {
          simulationId: this.context.simulationId,
          ruleName,
          eventType: event.type,
          timestep: this.context.currentTimestep
        }
      };

      const truth = await this.storage.createTruth(truthEntry);
      this.context.truthsCreated.push(truth.id);
    } catch (error) {
      console.error('Error creating Truth from event:', error);
    }
  }

  /**
   * Create Truth entries for all accumulated events
   */
  async createTruthsForEvents(ruleName: string): Promise<void> {
    if (!this.context) return;

    // Create Truth entries for non-narrative events
    for (const event of this.context.events) {
      if (event.type !== 'narrative') {
        await this.createTruthFromEvent(event, ruleName);
      }
    }
  }

  /**
   * Capture character state snapshots at a specific timestep
   */
  private async captureCharacterSnapshots(timestep: number): Promise<void> {
    if (!this.context) return;

    const timestepSnapshots = new Map<string, CharacterSnapshot>();

    for (const character of this.context.characters) {
      const snapshot: CharacterSnapshot = {
        timestep,
        characterId: character.id,
        attributes: {
          firstName: character.firstName,
          lastName: character.lastName,
          birthYear: character.birthYear ?? 0,
          gender: character.gender,
          isAlive: character.isAlive ?? true,
          occupation: character.occupation || null,
          currentLocation: character.currentLocation || null,
          status: character.status || 'active'
        },
        relationships: {
          spouseId: character.spouseId || null,
          parentIds: character.parentIds || [],
          childIds: character.childIds || [],
          friendIds: character.friendIds || []
        },
        customAttributes: {
          personality: character.personality,
          socialAttributes: character.socialAttributes,
          thoughts: character.thoughts
        }
      };

      timestepSnapshots.set(character.id, snapshot);
    }

    this.context.characterSnapshots.set(timestep, timestepSnapshots);
  }

  /**
   * Start tracking a rule execution
   */
  private async startRuleExecution(ruleId: string, rule: Rule): Promise<void> {
    if (!this.context) return;

    const parsedContent = (rule as any).parsedContent;

    this.context.currentRuleExecution = {
      timestep: this.context.currentTimestep,
      ruleId,
      ruleName: rule.name,
      ruleType: rule.ruleType || 'unknown',
      conditions: (parsedContent?.conditions as any[]) || [],
      effectsExecuted: [],
      charactersAffected: [],
      narrativeGenerated: null,
      timestamp: new Date()
    };
  }

  /**
   * Finish tracking a rule execution
   */
  private async finishRuleExecution(): Promise<void> {
    if (!this.context || !this.context.currentRuleExecution) return;

    // Add completed rule execution to sequence
    this.context.ruleExecutionSequence.push(this.context.currentRuleExecution);
    this.context.currentRuleExecution = null;
  }

  /**
   * Track an effect execution
   */
  private trackEffectExecution(effect: Effect, success: boolean, description: string): void {
    if (!this.context?.currentRuleExecution) return;

    this.context.currentRuleExecution.effectsExecuted.push({
      type: effect.type,
      description,
      success
    });
  }

  /**
   * Track character affected by current rule
   */
  private trackCharacterAffected(characterId: string): void {
    if (!this.context?.currentRuleExecution) return;

    if (!this.context.currentRuleExecution.charactersAffected.includes(characterId)) {
      this.context.currentRuleExecution.charactersAffected.push(characterId);
    }
  }

  /**
   * Track narrative generated by current rule
   */
  private trackNarrativeGenerated(narrative: string): void {
    if (!this.context?.currentRuleExecution) return;

    this.context.currentRuleExecution.narrativeGenerated = narrative;
  }

  /**
   * Get character state diff between two timesteps
   */
  getCharacterDiff(
    characterId: string,
    fromTimestep: number,
    toTimestep: number
  ): { changed: boolean; changes: Array<{ field: string; from: any; to: any }> } | null {
    if (!this.context) return null;

    const fromSnapshot = this.context.characterSnapshots.get(fromTimestep)?.get(characterId);
    const toSnapshot = this.context.characterSnapshots.get(toTimestep)?.get(characterId);

    if (!fromSnapshot || !toSnapshot) return null;

    const changes: Array<{ field: string; from: any; to: any }> = [];

    // Check attributes
    for (const [key, value] of Object.entries(toSnapshot.attributes)) {
      if (fromSnapshot.attributes[key as keyof typeof fromSnapshot.attributes] !== value) {
        changes.push({
          field: `attributes.${key}`,
          from: fromSnapshot.attributes[key as keyof typeof fromSnapshot.attributes],
          to: value
        });
      }
    }

    // Check relationships
    if (fromSnapshot.relationships.spouseId !== toSnapshot.relationships.spouseId) {
      changes.push({
        field: 'relationships.spouseId',
        from: fromSnapshot.relationships.spouseId,
        to: toSnapshot.relationships.spouseId
      });
    }

    // Check array relationships
    const checkArrayDiff = (field: string, from: string[], to: string[]) => {
      const added = to.filter(id => !from.includes(id));
      const removed = from.filter(id => !to.includes(id));
      if (added.length > 0 || removed.length > 0) {
        changes.push({
          field: `relationships.${field}`,
          from: { ids: from, removed },
          to: { ids: to, added }
        });
      }
    };

    checkArrayDiff('parentIds', fromSnapshot.relationships.parentIds, toSnapshot.relationships.parentIds);
    checkArrayDiff('childIds', fromSnapshot.relationships.childIds, toSnapshot.relationships.childIds);
    checkArrayDiff('friendIds', fromSnapshot.relationships.friendIds, toSnapshot.relationships.friendIds);

    return {
      changed: changes.length > 0,
      changes
    };
  }

  /**
   * Resolve the effective rate table for a world, merging world-type defaults
   * with any user-supplied overrides.
   */
  private resolveRates(world: World, overrides?: Partial<WorldTypeRates>): WorldTypeRates {
    const base = getWorldTypeDefaults((world as any).worldType);
    if (!overrides) return base;
    return { ...base, ...overrides };
  }

  /**
   * US-D.01: Lo-Fi Simulation Mode
   *
   * Fast 140-year historical compression. Samples a fraction of timesteps
   * (default 3.6% per TotT) and only runs lightweight demographic systems:
   * life events, economics, construction — no routines, observation, or
   * social dynamics.  Target: 140 years in < 30 seconds.
   */
  async simulateLoFi(
    worldId: string,
    simulationId: string,
    config: SimulationConfig & { samplingRate?: number }
  ): Promise<HiFiSimulationResult> {
    const DAYS_PER_YEAR = 365;
    const years = config.steps ?? 140;
    const totalDays = years * DAYS_PER_YEAR;
    const samplingRate = (config as any).samplingRate ?? 3.6; // percent
    const sampleEvery = Math.max(1, Math.round(100 / samplingRate));

    const totalLifeEvents = { marriages: 0, conceptions: 0, births: 0, divorces: 0, deaths: 0 };
    let totalConstructionUpdates = 0;
    let totalRandomTownEvents = 0;
    const stepResults: SimulationStepResult[] = [];

    try {
      if (!this.context || this.context.worldId !== worldId) {
        await this.loadRules(worldId);
        await this.loadGrammars(worldId);
        await this.initializeContext(worldId, simulationId);
      }
      if (!this.context) throw new Error('Failed to initialize simulation context');

      const rates = this.resolveRates(this.context.world, config.rateOverrides);

      // Lazy-import only the lightweight systems needed for lo-fi
      const [
        { executeSimulationTimestep },
        { calculateDeathProbability, die },
        { processDeathGrief, updateGrief },
        { processAllConstructions },
        { checkRandomEvents },
        { updateAppearanceForAge },
      ] = await Promise.all([
        import('../extensions/tott/autonomous-behavior-system.js'),
        import('../extensions/tott/lifecycle-system.js'),
        import('../extensions/tott/grieving-system.js'),
        import('../extensions/tott/building-commission-system.js'),
        import('../extensions/tott/town-events-system.js'),
        import('../extensions/tott/appearance-system.js'),
      ]);

      for (let day = 0; day < totalDays; day++) {
        this.context.currentTimestep++;
        const ts = this.context.currentTimestep;

        // Only sample a fraction of timesteps for detailed processing
        if (day % sampleEvery !== 0) continue;

        const hour = ts % 24;
        const timeOfDay: 'day' | 'night' = (hour >= 6 && hour < 22) ? 'day' : 'night';

        // Core life events (marriage, reproduction, birth, divorce)
        try {
          const simResult: any = await executeSimulationTimestep(worldId, ts, timeOfDay, hour);
          if (simResult.lifeEvents) {
            totalLifeEvents.marriages += (simResult.lifeEvents.marriages?.length ?? 0);
            totalLifeEvents.conceptions += (simResult.lifeEvents.conceptions?.length ?? 0);
            totalLifeEvents.births += (simResult.lifeEvents.births?.length ?? 0);
            totalLifeEvents.divorces += (simResult.lifeEvents.divorces?.length ?? 0);
          }
        } catch { /* skip */ }

        // Death checks
        try {
          const characters = await this.storage.getCharactersByWorld(worldId);
          for (const character of characters) {
            if (!character.isAlive) continue;
            const age = (character as any).customData?.age ?? 0;
            const baseProb = calculateDeathProbability(age);
            // Scale probability by sample interval so aggregate rate is correct
            const adjustedProb = baseProb * rates.deathRateMultiplier * sampleEvery;
            if (Math.random() < adjustedProb) {
              await die(character.id, 'old_age' as any, character.currentLocation || 'unknown', ts);
              totalLifeEvents.deaths++;
              try { await processDeathGrief(character.id, worldId, ts); } catch { /* skip */ }
            }
          }
        } catch { /* skip */ }

        // Grief updates (batched)
        try {
          const characters = await this.storage.getCharactersByWorld(worldId);
          for (const c of characters) await updateGrief(c.id, ts);
        } catch { /* skip */ }

        // Construction progress
        try {
          const r = await processAllConstructions(worldId, ts);
          totalConstructionUpdates += (r as any)?.processed ?? 0;
        } catch { /* skip */ }

        // Town events (less frequent in lo-fi)
        if (day % (sampleEvery * 10) === 0) {
          try {
            const evts = await checkRandomEvents(worldId, ts);
            totalRandomTownEvents += evts.length;
          } catch { /* skip */ }
        }

        // Appearance aging (once per simulated year)
        if (day % DAYS_PER_YEAR === 0) {
          try {
            const characters = await this.storage.getCharactersByWorld(worldId);
            for (const c of characters) {
              const appearance = (c as any).customData?.appearance;
              if (appearance) updateAppearanceForAge(appearance, (c as any).customData?.age ?? 0);
            }
          } catch { /* skip */ }
        }
      }

      return {
        stepResults,
        totalObservations: 0,
        totalSocializations: 0,
        totalLifeEvents,
        totalGriefInitiated: 0,
        totalConstructionUpdates,
        totalKnowledgePropagations: 0,
        totalRandomTownEvents,
        rates,
        success: true,
      };
    } catch (error) {
      return {
        stepResults: [],
        totalObservations: 0,
        totalSocializations: 0,
        totalLifeEvents: { marriages: 0, conceptions: 0, births: 0, divorces: 0, deaths: 0 },
        totalGriefInitiated: 0,
        totalConstructionUpdates: 0,
        totalKnowledgePropagations: 0,
        totalRandomTownEvents: 0,
        rates: this.resolveRates(this.context?.world ?? {} as World, config.rateOverrides),
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * US-D.01: Hi-Fi Simulation Mode
   *
   * Runs the full simulation with ALL Talk of the Town subsystems active:
   *   1. Routines & whereabouts
   *   2. Observation (characters perceive surroundings)
   *   3. Socializing (conversations, charge/spark/trust updates)
   *   4. Knowledge propagation & decay
   *   5. Mental model deterioration
   *   6. Life events (marriage, reproduction, birth, divorce)
   *   7. Death checks & grieving
   *   8. Economics (salary payments, market updates)
   *   9. Hiring & business dynamics
   *  10. Education progress
   *  11. Construction progress
   *  12. Town events & random events
   *  13. Drama recognition
   *  14. Appearance aging
   *  15. Artifact aging
   *  16. Salience decay
   *  17. Prolog rule execution (same as executeStep)
   *
   * @param worldId       The world to simulate
   * @param simulationId  Unique identifier for this simulation run
   * @param config        Simulation configuration
   */
  async simulateHiFi(
    worldId: string,
    simulationId: string,
    config: SimulationConfig
  ): Promise<HiFiSimulationResult> {
    const steps = config.steps ?? 1;

    // Aggregate counters
    let totalObservations = 0;
    let totalSocializations = 0;
    const totalLifeEvents = { marriages: 0, conceptions: 0, births: 0, divorces: 0, deaths: 0 };
    let totalGriefInitiated = 0;
    let totalConstructionUpdates = 0;
    let totalKnowledgePropagations = 0;
    let totalRandomTownEvents = 0;
    const stepResults: SimulationStepResult[] = [];

    try {
      // Initialize context if needed
      if (!this.context || this.context.worldId !== worldId) {
        await this.loadRules(worldId);
        await this.loadGrammars(worldId);
        await this.initializeContext(worldId, simulationId);
      }

      if (!this.context) {
        throw new Error('Failed to initialize simulation context');
      }

      const rates = this.resolveRates(this.context.world, config.rateOverrides);

      // Lazy-import all TotT modules so we don't pay the cost if hi-fi is never used
      const [
        { updateAllWhereabouts },
        { executeSimulationTimestep, checkForMarriageProposals, checkForReproduction, checkForBirths, checkForDivorces, updateDynamicTracking },
        { propagateAllKnowledge },
        { decaySalience },
        { calculateDeathProbability, die },
        { processDeathGrief, updateGrief },
        { paySalaries },
        { processAllConstructions },
        { checkRandomEvents, decayMorale },
        { excavateDrama },
        { updateAppearanceForAge },
        { ageArtifact, getArtifactsByWorld },
        { updateStudentProgress },
      ] = await Promise.all([
        import('../extensions/tott/routine-system.js'),
        import('../extensions/tott/autonomous-behavior-system.js'),
        import('../extensions/tott/knowledge-system.js'),
        import('../extensions/tott/social-dynamics-system.js'),
        import('../extensions/tott/lifecycle-system.js'),
        import('../extensions/tott/grieving-system.js'),
        import('../extensions/tott/economics-system.js'),
        import('../extensions/tott/building-commission-system.js'),
        import('../extensions/tott/town-events-system.js'),
        import('../extensions/tott/drama-recognition-system.js'),
        import('../extensions/tott/appearance-system.js'),
        import('../extensions/tott/artifact-system.js'),
        import('../extensions/tott/education-system.js'),
      ]);

      for (let step = 0; step < steps; step++) {
        this.context.currentTimestep++;
        const ts = this.context.currentTimestep;
        // Simple hour/time-of-day derivation (cycle through 24h)
        const hour = ts % 24;
        const timeOfDay: 'day' | 'night' = (hour >= 6 && hour < 22) ? 'day' : 'night';

        // ── 1. Routines & whereabouts ──────────────────────────────────
        try {
          await updateAllWhereabouts(worldId, ts, timeOfDay, hour);
        } catch (err) {
          console.warn(`[hi-fi] routines error at step ${ts}:`, err);
        }

        // ── 2-4. Observation, Socializing, Life events (via executeSimulationTimestep) ─
        try {
          const simResult: any = await executeSimulationTimestep(worldId, ts, timeOfDay, hour);
          totalObservations += (simResult.observations?.length ?? 0);
          totalSocializations += (simResult.socializations?.length ?? 0);
          if (simResult.lifeEvents) {
            totalLifeEvents.marriages += (simResult.lifeEvents.marriages?.length ?? 0);
            totalLifeEvents.conceptions += (simResult.lifeEvents.conceptions?.length ?? 0);
            totalLifeEvents.births += (simResult.lifeEvents.births?.length ?? 0);
            totalLifeEvents.divorces += (simResult.lifeEvents.divorces?.length ?? 0);
          }
        } catch (err) {
          console.warn(`[hi-fi] core sim step error at step ${ts}:`, err);
        }

        // ── 5. Knowledge propagation (between co-located characters) ──
        try {
          const characters = await this.storage.getCharactersByWorld(worldId);
          // Group characters by location for knowledge exchange
          const byLocation = new Map<string, typeof characters>();
          for (const c of characters) {
            const loc = c.currentLocation || 'unknown';
            if (!byLocation.has(loc)) byLocation.set(loc, []);
            byLocation.get(loc)!.push(c);
          }
          for (const [, group] of Array.from(byLocation.entries())) {
            for (let i = 0; i < group.length; i++) {
              for (let j = i + 1; j < group.length; j++) {
                await propagateAllKnowledge(group[i].id, group[j].id, ts);
                totalKnowledgePropagations++;
              }
            }
          }
        } catch (err) {
          console.warn(`[hi-fi] knowledge propagation error at step ${ts}:`, err);
        }

        // ── 6. Salience decay (mental model deterioration) ─────────────
        try {
          const characters = await this.storage.getCharactersByWorld(worldId);
          for (const character of characters) {
            await decaySalience(character.id);
          }
        } catch (err) {
          console.warn(`[hi-fi] salience decay error at step ${ts}:`, err);
        }

        // ── 7. Death checks ────────────────────────────────────────────
        try {
          const characters = await this.storage.getCharactersByWorld(worldId);
          for (const character of characters) {
            if (!character.isAlive) continue;
            const age = (character as any).customData?.age ?? 0;
            const baseProb = calculateDeathProbability(age);
            const adjustedProb = baseProb * rates.deathRateMultiplier;
            if (Math.random() < adjustedProb) {
              await die(character.id, 'old_age' as any, character.currentLocation || 'unknown', ts);
              totalLifeEvents.deaths++;
              // Trigger grief for related characters
              try {
                await processDeathGrief(character.id, worldId, ts);
                totalGriefInitiated++;
              } catch (griefErr) {
                console.warn(`[hi-fi] grief error for ${character.id}:`, griefErr);
              }
            }
          }
        } catch (err) {
          console.warn(`[hi-fi] death check error at step ${ts}:`, err);
        }

        // ── 8. Grief updates ───────────────────────────────────────────
        try {
          const characters = await this.storage.getCharactersByWorld(worldId);
          for (const character of characters) {
            await updateGrief(character.id, ts);
          }
        } catch (err) {
          console.warn(`[hi-fi] grief update error at step ${ts}:`, err);
        }

        // ── 9. Economics: salary payments (once per "month" = every 30 steps)
        if (ts % 30 === 0) {
          try {
            await paySalaries(worldId, ts);
          } catch (err) {
            console.warn(`[hi-fi] salary payment error at step ${ts}:`, err);
          }
        }

        // ── 10. Education progress ─────────────────────────────────────
        try {
          const characters = await this.storage.getCharactersByWorld(worldId);
          for (const character of characters) {
            await updateStudentProgress(character.id, ts);
          }
        } catch (err) {
          console.warn(`[hi-fi] education error at step ${ts}:`, err);
        }

        // ── 11. Construction progress ──────────────────────────────────
        try {
          const constructionResult = await processAllConstructions(worldId, ts);
          totalConstructionUpdates += (constructionResult as any)?.processed ?? 0;
        } catch (err) {
          console.warn(`[hi-fi] construction error at step ${ts}:`, err);
        }

        // ── 12. Town events & morale decay ─────────────────────────────
        try {
          const randomEvents = await checkRandomEvents(worldId, ts);
          totalRandomTownEvents += randomEvents.length;
          await decayMorale(worldId);
        } catch (err) {
          console.warn(`[hi-fi] town events error at step ${ts}:`, err);
        }

        // ── 13. Appearance aging (once per "year" = every 365 steps) ───
        if (ts % 365 === 0) {
          try {
            const characters = await this.storage.getCharactersByWorld(worldId);
            for (const character of characters) {
              const appearance = (character as any).customData?.appearance;
              if (appearance) {
                const age = (character as any).customData?.age ?? 0;
                updateAppearanceForAge(appearance, age);
              }
            }
          } catch (err) {
            console.warn(`[hi-fi] appearance aging error at step ${ts}:`, err);
          }
        }

        // ── 14. Artifact aging (once per "year") ───────────────────────
        if (ts % 365 === 0) {
          try {
            const artifacts = await getArtifactsByWorld(worldId);
            for (const artifact of artifacts) {
              await ageArtifact(artifact.id, 1);
            }
          } catch (err) {
            console.warn(`[hi-fi] artifact aging error at step ${ts}:`, err);
          }
        }

        // ── 15. Prolog rule execution (same as standard executeStep) ───
        const prologResult = await this.executePrologStep();
        stepResults.push(prologResult);

        // Capture character snapshots
        await this.captureCharacterSnapshots(ts);
      }

      // ── 16. Drama recognition (once at end of run) ─────────────────
      try {
        await excavateDrama(worldId);
      } catch (err) {
        console.warn(`[hi-fi] drama recognition error:`, err);
      }

      return {
        stepResults,
        totalObservations,
        totalSocializations,
        totalLifeEvents,
        totalGriefInitiated,
        totalConstructionUpdates,
        totalKnowledgePropagations,
        totalRandomTownEvents,
        rates,
        success: true,
      };
    } catch (error) {
      return {
        stepResults,
        totalObservations,
        totalSocializations,
        totalLifeEvents,
        totalGriefInitiated,
        totalConstructionUpdates,
        totalKnowledgePropagations,
        totalRandomTownEvents,
        rates: getWorldTypeDefaults(null),
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Reset the engine state
   */
  reset(): void {
    this.context = null;
    this.rules.clear();
    this.grammars.clear();
  }
}
