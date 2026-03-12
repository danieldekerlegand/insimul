/**
 * Schedule Executor
 *
 * Reads NPC routine data (TimeBlock schedules) and drives actual NPC movement
 * through their daily activities using NPCMovementController.
 *
 * Features:
 * - Game time system: configurable real-to-game time ratio
 * - Schedule phases: sleep, morning, commute, work, evening
 * - Personality-modified wake/sleep times
 * - Player conversation interrupts with resume
 * - Schedule catch-up on late NPCs
 */

import { Vector3 } from '@babylonjs/core';
import type { NPCMovementController, MovementSpeed } from './NPCMovementController';

// ---------- Types ----------

/** TimeBlock from routine-system.ts (server-side) — mirrored here for client use */
export interface TimeBlock {
  startHour: number; // 0-23
  endHour: number;   // 0-23
  location: string;  // business ID, residence ID, or description
  locationType: string; // 'home' | 'work' | 'leisure' | 'school'
  occasion: string;     // 'working' | 'relaxing' | 'sleeping' | etc.
}

export interface DailyRoutine {
  day: TimeBlock[];
  night: TimeBlock[];
}

export interface RoutineData {
  characterId: string;
  routine: DailyRoutine;
  lastUpdated: number;
}

/** Schedule phase labels for readability */
export type SchedulePhase =
  | 'sleep'       // 22-06 (default)
  | 'morning'     // 06-07
  | 'commute_work' // 07-08
  | 'work'        // 08-17
  | 'commute_home' // 17-18
  | 'evening'     // 18-22
  | 'custom';     // routine-defined block

export interface SchedulePhaseInfo {
  phase: SchedulePhase;
  startHour: number;
  endHour: number;
  location: string;
  locationType: string;
  occasion: string;
}

/** Per-NPC schedule tracking */
interface NPCScheduleState {
  npcId: string;
  /** Current phase the NPC is executing */
  currentPhase: SchedulePhaseInfo | null;
  /** Whether the NPC has arrived at their current phase location */
  hasArrived: boolean;
  /** Whether the NPC is paused for player conversation */
  isPaused: boolean;
  /** Whether this NPC works a night shift */
  isNightShift: boolean;
  /** Personality-modified wake hour */
  wakeHour: number;
  /** Personality-modified sleep hour */
  sleepHour: number;
  /** Last game hour this NPC's schedule was evaluated */
  lastEvaluatedHour: number;
}

/** Personality data (Big Five) */
export interface PersonalityData {
  openness?: number;
  conscientiousness?: number;
  extroversion?: number;
  agreeableness?: number;
  neuroticism?: number;
}

/** Character data as stored on NPCInstance.characterData */
export interface ScheduleCharacterData {
  id: string;
  firstName?: string;
  lastName?: string;
  personality?: PersonalityData;
  customData?: {
    routine?: RoutineData;
    [key: string]: any;
  };
  currentOccupationId?: string;
  [key: string]: any;
}

/** Building data reference for location resolution */
export interface BuildingLocation {
  id: string;
  position: Vector3;
  metadata?: any;
}

/** Options for creating ScheduleExecutor */
export interface ScheduleExecutorOptions {
  /** Real milliseconds per game hour (default: 60000 = 1 minute per hour) */
  msPerGameHour?: number;
  /** Starting game hour (0-23, default: 8) */
  startingHour?: number;
  /** Enable schedule execution (default: true) */
  enabled?: boolean;
}

// ---------- Constants ----------

/** Default: 1 real minute = 1 game hour */
const DEFAULT_MS_PER_GAME_HOUR = 60_000;

/** Default schedule phases for NPCs without custom routines */
const DEFAULT_PHASES: SchedulePhaseInfo[] = [
  { phase: 'sleep', startHour: 22, endHour: 6, location: 'home', locationType: 'home', occasion: 'sleeping' },
  { phase: 'morning', startHour: 6, endHour: 7, location: 'home', locationType: 'home', occasion: 'relaxing' },
  { phase: 'commute_work', startHour: 7, endHour: 8, location: 'work', locationType: 'work', occasion: 'commuting' },
  { phase: 'work', startHour: 8, endHour: 17, location: 'work', locationType: 'work', occasion: 'working' },
  { phase: 'commute_home', startHour: 17, endHour: 18, location: 'home', locationType: 'home', occasion: 'commuting' },
  { phase: 'evening', startHour: 18, endHour: 22, location: 'home', locationType: 'home', occasion: 'relaxing' },
];

/** Night-shift schedule */
const NIGHT_SHIFT_PHASES: SchedulePhaseInfo[] = [
  { phase: 'sleep', startHour: 6, endHour: 18, location: 'home', locationType: 'home', occasion: 'sleeping' },
  { phase: 'evening', startHour: 18, endHour: 19, location: 'home', locationType: 'home', occasion: 'relaxing' },
  { phase: 'commute_work', startHour: 19, endHour: 20, location: 'work', locationType: 'work', occasion: 'commuting' },
  { phase: 'work', startHour: 20, endHour: 5, location: 'work', locationType: 'work', occasion: 'working' },
  { phase: 'commute_home', startHour: 5, endHour: 6, location: 'home', locationType: 'home', occasion: 'commuting' },
];

// ---------- ScheduleExecutor ----------

export class ScheduleExecutor {
  /** Per-NPC schedule state */
  private npcStates: Map<string, NPCScheduleState> = new Map();

  /** NPC movement controllers keyed by NPC ID */
  private movementControllers: Map<string, NPCMovementController> = new Map();

  /** Building lookup: ID → position */
  private buildingLocations: Map<string, BuildingLocation> = new Map();

  /** Home positions per NPC (fallback) */
  private homePositions: Map<string, Vector3> = new Map();

  /** Work positions per NPC */
  private workPositions: Map<string, Vector3> = new Map();

  /** Character data per NPC */
  private characterData: Map<string, ScheduleCharacterData> = new Map();

  /** Game clock state */
  private _gameHour: number;
  private _gameMinute: number = 0;
  private _accumulatedMs: number = 0;
  private _msPerGameHour: number;
  private _enabled: boolean;

  /** Whether we're running (update is being called) */
  private _running: boolean = false;

  constructor(options: ScheduleExecutorOptions = {}) {
    this._msPerGameHour = options.msPerGameHour ?? DEFAULT_MS_PER_GAME_HOUR;
    this._gameHour = options.startingHour ?? 8;
    this._enabled = options.enabled ?? true;
  }

  // ---------- Registration ----------

  /**
   * Register an NPC for schedule execution.
   */
  registerNPC(
    npcId: string,
    controller: NPCMovementController,
    character: ScheduleCharacterData,
    homePos: Vector3,
    workPos?: Vector3,
  ): void {
    this.movementControllers.set(npcId, controller);
    this.characterData.set(npcId, character);
    this.homePositions.set(npcId, homePos.clone());
    if (workPos) {
      this.workPositions.set(npcId, workPos.clone());
    }

    const personality = character.personality;
    const conscientiousness = personality?.conscientiousness ?? 0;
    const isNightShift = this.detectNightShift(character);

    // Personality-modified wake/sleep times
    // High conscientiousness → early riser (05:00); low → night owl (23:00)
    let wakeHour: number;
    let sleepHour: number;

    if (isNightShift) {
      // Night shift workers wake late, sleep in morning
      wakeHour = 17 + Math.round((1 - conscientiousness) * 1); // 17-18
      sleepHour = 6 + Math.round((1 - conscientiousness) * 1);  // 6-7
    } else {
      // Day shift: conscientiousness moves wake 5-7, sleep 21-23
      wakeHour = 6 - Math.round(Math.max(0, conscientiousness) * 1);  // 5-6
      sleepHour = 22 + Math.round(Math.max(0, -conscientiousness) * 1); // 22-23
    }

    const state: NPCScheduleState = {
      npcId,
      currentPhase: null,
      hasArrived: false,
      isPaused: false,
      isNightShift,
      wakeHour: Math.max(0, Math.min(23, wakeHour)),
      sleepHour: Math.max(0, Math.min(23, sleepHour)),
      lastEvaluatedHour: -1,
    };
    this.npcStates.set(npcId, state);
  }

  /**
   * Unregister an NPC.
   */
  unregisterNPC(npcId: string): void {
    this.npcStates.delete(npcId);
    this.movementControllers.delete(npcId);
    this.characterData.delete(npcId);
    this.homePositions.delete(npcId);
    this.workPositions.delete(npcId);
  }

  /**
   * Register a building location for location resolution.
   */
  registerBuilding(id: string, position: Vector3, metadata?: any): void {
    this.buildingLocations.set(id, { id, position: position.clone(), metadata });
  }

  // ---------- Game Clock ----------

  /** Current game hour (0-23) */
  get gameHour(): number { return this._gameHour; }

  /** Current game minute (0-59) */
  get gameMinute(): number { return Math.floor(this._gameMinute); }

  /** Formatted time string HH:MM */
  get gameTimeString(): string {
    const h = String(this._gameHour).padStart(2, '0');
    const m = String(this.gameMinute).padStart(2, '0');
    return `${h}:${m}`;
  }

  /** Whether it's currently daytime (6-18) */
  get isDaytime(): boolean {
    return this._gameHour >= 6 && this._gameHour < 18;
  }

  /** Set game time directly (for loading saves) */
  setGameTime(hour: number, minute: number = 0): void {
    this._gameHour = Math.max(0, Math.min(23, Math.floor(hour)));
    this._gameMinute = Math.max(0, Math.min(59, minute));
    this._accumulatedMs = 0;
  }

  /** Set time scale */
  setTimeScale(msPerGameHour: number): void {
    this._msPerGameHour = Math.max(1000, msPerGameHour);
  }

  /** Enable or disable schedule execution */
  setEnabled(enabled: boolean): void {
    this._enabled = enabled;
  }

  get enabled(): boolean { return this._enabled; }

  // ---------- Conversation Interrupts ----------

  /**
   * Pause an NPC's schedule for player conversation.
   * NPCMovementController.startConversation() should also be called separately.
   */
  pauseForConversation(npcId: string): void {
    const state = this.npcStates.get(npcId);
    if (state) {
      state.isPaused = true;
    }
  }

  /**
   * Resume an NPC's schedule after conversation ends.
   */
  resumeAfterConversation(npcId: string): void {
    const state = this.npcStates.get(npcId);
    if (state) {
      state.isPaused = false;
      // Force re-evaluation to catch up to current schedule
      state.lastEvaluatedHour = -1;
    }
  }

  // ---------- Main Update ----------

  /**
   * Call this every frame with delta time in milliseconds.
   * Advances the game clock and evaluates NPC schedules.
   */
  update(deltaTimeMs: number): void {
    if (!this._enabled) return;
    this._running = true;

    // Advance game clock
    this._accumulatedMs += deltaTimeMs;
    const msPerMinute = this._msPerGameHour / 60;

    while (this._accumulatedMs >= msPerMinute) {
      this._accumulatedMs -= msPerMinute;
      this._gameMinute += 1;

      if (this._gameMinute >= 60) {
        this._gameMinute -= 60;
        this._gameHour = (this._gameHour + 1) % 24;
      }
    }

    // Evaluate schedules (staggered: spread across frames)
    const entries = Array.from(this.npcStates.entries());
    const frameSlot = Math.floor(performance.now() / 16.67) % 10; // 10-frame window
    for (let i = 0; i < entries.length; i++) {
      // Stagger: only evaluate NPCs whose index matches the current frame slot
      if (i % 10 !== frameSlot) continue;

      const [npcId, state] = entries[i];
      if (state.isPaused) continue;

      this.evaluateNPCSchedule(npcId, state);
    }
  }

  // ---------- Schedule Evaluation ----------

  private evaluateNPCSchedule(npcId: string, state: NPCScheduleState): void {
    const currentHour = this._gameHour;

    // Only re-evaluate when the hour changes (or forced via lastEvaluatedHour = -1)
    if (state.lastEvaluatedHour === currentHour) return;
    state.lastEvaluatedHour = currentHour;

    const targetPhase = this.getPhaseForHour(npcId, currentHour);
    if (!targetPhase) return;

    // Check if phase changed
    const phaseChanged = !state.currentPhase ||
      state.currentPhase.phase !== targetPhase.phase ||
      state.currentPhase.location !== targetPhase.location;

    if (phaseChanged) {
      state.currentPhase = targetPhase;
      state.hasArrived = false;
      this.executePhaseTransition(npcId, state, targetPhase);
    }
  }

  /**
   * Determine which schedule phase an NPC should be in at the given hour.
   * Uses custom routine data if available, otherwise falls back to default phases.
   */
  private getPhaseForHour(npcId: string, hour: number): SchedulePhaseInfo | null {
    const character = this.characterData.get(npcId);
    const routineData = character?.customData?.routine;

    // If character has custom routine data, build phases from TimeBlocks
    if (routineData?.routine) {
      const phase = this.getPhaseFromRoutine(routineData.routine, hour);
      if (phase) return phase;
    }

    // Otherwise use default schedule (personality-adjusted)
    const state = this.npcStates.get(npcId);
    if (!state) return null;

    const phases = state.isNightShift ? NIGHT_SHIFT_PHASES : DEFAULT_PHASES;
    return this.findPhaseForHour(phases, hour, state.wakeHour, state.sleepHour);
  }

  /**
   * Build a SchedulePhaseInfo from TimeBlock routine data.
   */
  private getPhaseFromRoutine(routine: DailyRoutine, hour: number): SchedulePhaseInfo | null {
    const timeOfDay = (hour >= 6 && hour < 18) ? 'day' : 'night';
    const blocks = timeOfDay === 'day' ? routine.day : routine.night;

    if (!blocks || blocks.length === 0) return null;

    for (const block of blocks) {
      if (this.isHourInRange(hour, block.startHour, block.endHour)) {
        return {
          phase: 'custom',
          startHour: block.startHour,
          endHour: block.endHour,
          location: block.location,
          locationType: block.locationType || 'home',
          occasion: block.occasion || 'relaxing',
        };
      }
    }

    // No matching block — return a default idle-at-home phase
    return {
      phase: 'sleep',
      startHour: hour,
      endHour: (hour + 1) % 24,
      location: 'home',
      locationType: 'home',
      occasion: 'relaxing',
    };
  }

  /**
   * Find the matching default phase for a given hour, with personality adjustments.
   */
  private findPhaseForHour(
    phases: SchedulePhaseInfo[],
    hour: number,
    wakeHour: number,
    sleepHour: number,
  ): SchedulePhaseInfo | null {
    // Override sleep phase boundaries with personality-adjusted times
    for (const phase of phases) {
      let startH = phase.startHour;
      let endH = phase.endHour;

      // Adjust sleep phase boundaries
      if (phase.phase === 'sleep') {
        startH = sleepHour;
        endH = wakeHour;
      } else if (phase.phase === 'morning') {
        startH = wakeHour;
      }

      if (this.isHourInRange(hour, startH, endH)) {
        return { ...phase, startHour: startH, endHour: endH };
      }
    }

    // Fallback: idle at home
    return {
      phase: 'evening',
      startHour: hour,
      endHour: (hour + 1) % 24,
      location: 'home',
      locationType: 'home',
      occasion: 'relaxing',
    };
  }

  /**
   * Check if an hour is within a range that may wrap around midnight.
   */
  private isHourInRange(hour: number, start: number, end: number): boolean {
    if (start <= end) {
      return hour >= start && hour < end;
    }
    // Wraps around midnight (e.g., 22-06)
    return hour >= start || hour < end;
  }

  // ---------- Phase Execution ----------

  /**
   * Execute a schedule phase transition: resolve target location and issue movement command.
   */
  private executePhaseTransition(
    npcId: string,
    state: NPCScheduleState,
    phase: SchedulePhaseInfo,
  ): void {
    const controller = this.movementControllers.get(npcId);
    if (!controller) return;

    const targetPos = this.resolveLocation(npcId, phase.location, phase.locationType);
    if (!targetPos) {
      // Can't resolve location — mark arrived so we don't retry every frame
      state.hasArrived = true;
      return;
    }

    // Choose speed based on phase
    const speed = this.getMovementSpeed(phase);

    controller.moveTo(targetPos, speed, () => {
      // On arrival
      const currentState = this.npcStates.get(npcId);
      if (currentState) {
        currentState.hasArrived = true;
      }
    });
  }

  /**
   * Resolve a location string to a world position.
   * Location can be: 'home', 'work', a building ID, or a description.
   */
  private resolveLocation(npcId: string, location: string, locationType: string): Vector3 | null {
    // Direct references
    if (location === 'home' || locationType === 'home') {
      return this.homePositions.get(npcId) || null;
    }
    if (location === 'work' || locationType === 'work') {
      return this.workPositions.get(npcId) || this.homePositions.get(npcId) || null;
    }

    // Try building lookup by ID
    const building = this.buildingLocations.get(location);
    if (building) {
      // Return a position near the building (offset to avoid being inside)
      const offset = new Vector3(
        (Math.random() - 0.5) * 8,
        0,
        (Math.random() - 0.5) * 8,
      );
      return building.position.add(offset);
    }

    // Try locationType as fallback
    if (locationType === 'leisure') {
      // Leisure: pick a random building or stay near home
      return this.homePositions.get(npcId) || null;
    }
    if (locationType === 'school') {
      // School: try finding a school building, otherwise home
      const schoolBuilding = this.findBuildingByType('school');
      return schoolBuilding?.position || this.homePositions.get(npcId) || null;
    }

    // Fallback to home
    return this.homePositions.get(npcId) || null;
  }

  /**
   * Find a building by metadata type (e.g., 'school', 'tavern').
   */
  private findBuildingByType(buildingType: string): BuildingLocation | null {
    const entries = Array.from(this.buildingLocations.values());
    for (const loc of entries) {
      if (loc.metadata?.buildingType === buildingType ||
          loc.metadata?.type === buildingType) {
        return loc;
      }
    }
    return null;
  }

  /**
   * Choose movement speed based on schedule phase.
   */
  private getMovementSpeed(phase: SchedulePhaseInfo): MovementSpeed {
    switch (phase.phase) {
      case 'commute_work':
      case 'commute_home':
        return 'walk';
      case 'morning':
      case 'evening':
        return 'stroll';
      case 'custom':
        // Commuting occasions = walk, otherwise stroll
        return phase.occasion === 'commuting' ? 'walk' : 'stroll';
      default:
        return 'stroll';
    }
  }

  // ---------- Night Shift Detection ----------

  /**
   * Detect if a character works a night shift based on their routine data or occupation.
   */
  private detectNightShift(character: ScheduleCharacterData): boolean {
    const routine = character.customData?.routine?.routine;
    if (routine?.night) {
      // If night blocks contain work occasions, it's a night shift
      for (const block of routine.night) {
        if (block.occasion === 'working' && block.locationType === 'work') {
          return true;
        }
      }
    }
    // Could also check occupation type, but routine data is more reliable
    return false;
  }

  // ---------- Query ----------

  /**
   * Get the current schedule state for an NPC.
   */
  getNPCScheduleState(npcId: string): NPCScheduleState | undefined {
    return this.npcStates.get(npcId);
  }

  /**
   * Get all registered NPC IDs.
   */
  getRegisteredNPCs(): string[] {
    return Array.from(this.npcStates.keys());
  }

  /**
   * Get the current activity description for an NPC.
   */
  getCurrentActivity(npcId: string): { phase: string; occasion: string; location: string } | null {
    const state = this.npcStates.get(npcId);
    if (!state?.currentPhase) return null;
    return {
      phase: state.currentPhase.phase,
      occasion: state.currentPhase.occasion,
      location: state.currentPhase.location,
    };
  }

  /**
   * Get the number of registered NPCs.
   */
  get npcCount(): number {
    return this.npcStates.size;
  }

  // ---------- Cleanup ----------

  dispose(): void {
    this._running = false;
    this._enabled = false;
    this.npcStates.clear();
    this.movementControllers.clear();
    this.characterData.clear();
    this.homePositions.clear();
    this.workPositions.clear();
    this.buildingLocations.clear();
  }
}
