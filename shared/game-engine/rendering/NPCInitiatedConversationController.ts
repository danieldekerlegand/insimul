/**
 * NPCInitiatedConversationController
 *
 * Enables NPCs to proactively approach the player and initiate conversation.
 * Evaluates nearby NPCs periodically using personality traits (extroversion,
 * agreeableness), relationship strength, mood, and time of day to determine
 * if an NPC wants to talk to the player. When an NPC approaches, a greeting
 * prompt is shown and the player can accept (G key) or ignore.
 */

import { Vector3 } from '@babylonjs/core';

// ── Types ──────────────────────────────────────────────────────────────

/** NPC data needed for approach evaluation */
export interface ApproachableNPC {
  id: string;
  name: string;
  position: Vector3;
  personality: {
    openness: number;
    conscientiousness: number;
    extroversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  relationships: Record<string, { type?: string; strength?: number; trust?: number }>;
  mood: string;
  isInConversation: boolean;
  occupation?: string;
}

/** State of an NPC approach attempt */
export interface ApproachAttempt {
  npcId: string;
  npcName: string;
  startTime: number;
  greeting: string;
  /** Whether the NPC has reached the player */
  hasReached: boolean;
  /** Whether the greeting prompt is visible */
  promptShown: boolean;
}

/** State of an active callout (brief proximity greeting without NPC walking toward player) */
export interface CalloutAttempt {
  npcId: string;
  npcName: string;
  startTime: number;
  greeting: string;
  isQuestBearer: boolean;
}

/** State of an active walking interrupt (brief one-liner as player walks past NPC) */
export interface WalkingInterruptAttempt {
  npcId: string;
  npcName: string;
  startTime: number;
  phrase: string;
  isQuestBearer: boolean;
}

/** Walking interrupt setting: On (include vocabulary), Reduced (simple only), Off */
export type WalkingInterruptSetting = 'on' | 'reduced' | 'off';

/** Environment context for context-aware greetings */
export interface GreetingEnvironment {
  weather: string;
  timePeriod: string;
  /** Whether the NPC has an active quest for the player */
  hasActiveQuestForPlayer: boolean;
  /** Whether the player is new to town */
  playerIsNew: boolean;
}

/** Callbacks for approach events */
export interface ApproachCallbacks {
  /** Move NPC toward a position */
  onMoveTo: (npcId: string, targetPosition: Vector3, speed: 'stroll' | 'walk') => void;
  /** Face NPC toward a position */
  onFaceDirection: (npcId: string, targetPosition: Vector3) => void;
  /** Change NPC animation */
  onAnimationChange: (npcId: string, state: string) => void;
  /** Show greeting notification to the player */
  onShowGreeting: (npcId: string, npcName: string, greeting: string) => void;
  /** Dismiss greeting notification */
  onDismissGreeting: (npcId: string) => void;
  /** Open chat with NPC (player accepted) */
  onOpenChat: (npcId: string) => Promise<void>;
  /** Get current game hour (0-23) */
  getGameHour: () => number;
  /** Get player position */
  getPlayerPosition: () => Vector3 | null;
  /** Check if player is already in a conversation */
  isPlayerInConversation: () => boolean;
  /** Emit event to GameEventBus */
  onEmitEvent?: (event: any) => void;
  /** Get current environment for context-aware greetings */
  getEnvironment?: () => GreetingEnvironment | null;
  /** Get a cached greeting from the server greeting cache (returns null on miss) */
  getCachedGreeting?: (npcId: string, context?: string) => string | null;
  /** Show a brief speech bubble callout above an NPC (4 seconds) */
  onShowCallout?: (npcId: string, npcName: string, text: string, isQuestBearer: boolean) => void;
  /** Dismiss a callout speech bubble */
  onDismissCallout?: (npcId: string) => void;
  /** Check if an NPC is a quest bearer (has quests available for the player) */
  isNpcQuestBearer?: (npcId: string) => boolean;
  /** Get current player velocity in units per second */
  getPlayerVelocity?: () => number;
  /** Show a brief walking interrupt speech bubble above NPC (2 seconds, smaller) */
  onShowWalkingInterrupt?: (npcId: string, npcName: string, text: string, isQuestBearer: boolean) => void;
  /** Dismiss a walking interrupt speech bubble */
  onDismissWalkingInterrupt?: (npcId: string) => void;
}

// ── Constants ──────────────────────────────────────────────────────────

/** How often to evaluate NPC approach desire (in game-minutes) */
const EVAL_INTERVAL_GAME_MINUTES = 3;

/** Max distance to consider an NPC for approach */
const APPROACH_EVAL_RADIUS = 15;

/** Distance at which the NPC stops and greets */
const GREETING_DISTANCE = 3.0;

/** How long the greeting prompt stays visible (ms) */
const GREETING_TIMEOUT_MS = 15000;

/** Cooldown after an NPC approaches (successful or not), in ms */
const APPROACH_COOLDOWN_MS = 120000;

/** Radius at which to trigger LLM context pre-warming */
const PRE_WARM_RADIUS = 10;

/** Cooldown between pre-warm triggers for the same NPC (ms) */
const PRE_WARM_COOLDOWN_MS = 60000;

/** Max simultaneous approach attempts */
const MAX_APPROACHES = 1;

// ── Callout Constants ─────────────────────────────────────────────────

/** How often to evaluate callouts (in game-seconds) */
const CALLOUT_EVAL_INTERVAL_GAME_SECONDS = 30;

/** Range at which NPCs can call out to the player */
const CALLOUT_RADIUS = 8;

/** Base probability for a callout */
const CALLOUT_BASE_PROBABILITY = 0.2;

/** How long the callout speech bubble is visible (ms) */
const CALLOUT_BUBBLE_DURATION_MS = 4000;

/** How long the '[G] Respond' prompt stays visible after the bubble (ms) */
const CALLOUT_RESPOND_DURATION_MS = 3000;

/** Cooldown per NPC after a callout (ms) */
const CALLOUT_NPC_COOLDOWN_MS = 60000;

/** Global cooldown between any callout (ms) */
const CALLOUT_GLOBAL_COOLDOWN_MS = 15000;

/** Probability override for quest-bearer NPCs */
const CALLOUT_QUEST_BEARER_PROBABILITY = 0.5;

// ── Walking Interrupt Constants ───────────────────────────────────────

/** Minimum player velocity (units/sec) to be considered walking */
const WALKING_VELOCITY_THRESHOLD = 1.0;

/** Range within which NPCs can fire walking interrupts */
const WALKING_INTERRUPT_RADIUS = 6;

/** Base probability for a walking interrupt */
const WALKING_INTERRUPT_BASE_PROBABILITY = 0.1;

/** Extrovert bonus for walking interrupts */
const WALKING_INTERRUPT_EXTROVERT_BONUS = 0.1;

/** Quest-bearer bonus for walking interrupts */
const WALKING_INTERRUPT_QUEST_BEARER_BONUS = 0.15;

/** How long the walking interrupt speech bubble is visible (ms) */
const WALKING_INTERRUPT_BUBBLE_DURATION_MS = 2000;

/** How long the '[G] Stop and chat' prompt stays visible after the bubble (ms) */
const WALKING_INTERRUPT_RESPOND_DURATION_MS = 3000;

/** Cooldown per NPC after a walking interrupt (ms) — 3 minutes */
const WALKING_INTERRUPT_NPC_COOLDOWN_MS = 180000;

/** Global cooldown between any walking interrupt (ms) — 8 seconds */
const WALKING_INTERRUPT_GLOBAL_COOLDOWN_MS = 8000;

/** How often to evaluate walking interrupts (real ms) */
const WALKING_INTERRUPT_EVAL_INTERVAL_MS = 1500;

// ── Greetings ──────────────────────────────────────────────────────────

const GREETINGS_BY_MOOD: Record<string, string[]> = {
  happy: [
    'Hey there! Got a moment?',
    'Oh, hello! I was hoping to run into you.',
    'Hi! Mind if we chat?',
  ],
  excited: [
    'You won\'t believe what happened!',
    'Hey! I\'ve got something to tell you!',
    'Oh good, I found you!',
  ],
  sad: [
    'Hey... do you have a minute?',
    'I could really use someone to talk to...',
    'Mind if I bend your ear?',
  ],
  angry: [
    'We need to talk.',
    'Hey. Got a minute?',
    'I need to get something off my chest.',
  ],
  neutral: [
    'Hello! Do you have a moment?',
    'Hey, got a second to chat?',
    'Hi there! Can we talk?',
    'Excuse me, do you have a moment?',
  ],
};

/** Context-aware greetings that reference the environment */
const GREETINGS_BY_CONTEXT: Record<string, string[]> = {
  // Weather-specific
  weather_rain: [
    'Terrible weather, isn\'t it? Got a moment to talk?',
    'Quick, while we\'re both out in this rain — can we chat?',
    'I know it\'s wet out, but I need to talk to you.',
  ],
  weather_storm: [
    'We should get inside! But first, a quick word?',
    'This storm! Are you alright? I wanted to ask you something.',
  ],
  weather_snow: [
    'Beautiful snowfall, isn\'t it? Got a moment?',
    'Brrr! Cold one today. Mind if we chat?',
  ],
  // Time-specific
  time_dawn: [
    'You\'re up early! Got a moment?',
    'Good morning! I was hoping to catch you before the day gets busy.',
  ],
  time_evening: [
    'Nice evening, isn\'t it? Got a second?',
    'Hey, before you turn in for the night — can we talk?',
  ],
  time_night: [
    'Can\'t sleep either? Got a moment?',
    'Late night, huh? I need to talk to you about something.',
  ],
  // Quest-specific
  quest_active: [
    'How\'s that task coming along? Got an update?',
    'I\'ve been meaning to check in with you about that job.',
    'Any progress on what I asked? Let\'s talk.',
  ],
  // Player is new
  player_new: [
    'Hey, you\'re new around here, aren\'t you? Welcome!',
    'I don\'t think we\'ve met. I\'m from around here — got a moment?',
    'New face in town! Come, let me introduce myself.',
  ],
};

// ── Walking Interrupt Phrases ─────────────────────────────────────────

const WALKING_INTERRUPT_PHRASES: Record<string, string[]> = {
  happy: [
    'Hey, nice day!',
    'Good to see you!',
    'Looking good out there!',
  ],
  excited: [
    'Oh! Come back later!',
    'Hey, I have news!',
    'Wait — never mind, go on!',
  ],
  sad: [
    'Take care out there...',
    'Be safe...',
    'Sigh... carry on.',
  ],
  angry: [
    'Watch where you\'re going!',
    'Hmph.',
    'In a rush, are we?',
  ],
  neutral: [
    'Hey there!',
    'Morning!',
    'Off somewhere?',
    'Safe travels!',
    'Good day!',
    'Hello!',
  ],
};

const WALKING_INTERRUPT_QUEST_PHRASES: string[] = [
  'Hey! I could use your help!',
  'Wait — got a job for you!',
  'Excuse me! Got a moment?',
  'Over here! I need someone!',
  'Hey you! I have work!',
];

function getWalkingInterruptPhrase(mood: string, isQuestBearer: boolean): string {
  if (isQuestBearer && Math.random() < 0.6) {
    return WALKING_INTERRUPT_QUEST_PHRASES[Math.floor(Math.random() * WALKING_INTERRUPT_QUEST_PHRASES.length)];
  }
  const phrases = WALKING_INTERRUPT_PHRASES[mood] || WALKING_INTERRUPT_PHRASES.neutral;
  return phrases[Math.floor(Math.random() * phrases.length)];
}

function getGreeting(mood: string, _npcName: string, env?: GreetingEnvironment | null): string {
  // Try context-aware greetings first (30% chance each if applicable)
  if (env) {
    const contextGreetings: string[] = [];

    // Quest context takes highest priority
    if (env.hasActiveQuestForPlayer && Math.random() < 0.6) {
      contextGreetings.push(...(GREETINGS_BY_CONTEXT.quest_active ?? []));
    }
    // Player is new
    if (env.playerIsNew && Math.random() < 0.5) {
      contextGreetings.push(...(GREETINGS_BY_CONTEXT.player_new ?? []));
    }
    // Weather context
    if (env.weather !== 'clear' && Math.random() < 0.4) {
      const weatherKey = `weather_${env.weather}`;
      contextGreetings.push(...(GREETINGS_BY_CONTEXT[weatherKey] ?? []));
    }
    // Time context
    if ((env.timePeriod === 'dawn' || env.timePeriod === 'night' || env.timePeriod === 'evening') && Math.random() < 0.3) {
      const timeKey = `time_${env.timePeriod}`;
      contextGreetings.push(...(GREETINGS_BY_CONTEXT[timeKey] ?? []));
    }

    if (contextGreetings.length > 0) {
      return contextGreetings[Math.floor(Math.random() * contextGreetings.length)];
    }
  }

  // Fall back to mood-based greetings
  const moodGreetings = GREETINGS_BY_MOOD[mood] || GREETINGS_BY_MOOD.neutral;
  return moodGreetings[Math.floor(Math.random() * moodGreetings.length)];
}

// ── Controller ─────────────────────────────────────────────────────────

export class NPCInitiatedConversationController {
  private callbacks: ApproachCallbacks;
  private npcs: Map<string, ApproachableNPC> = new Map();
  private activeApproach: ApproachAttempt | null = null;
  private approachCooldowns: Map<string, number> = new Map();
  private preWarmCooldowns: Map<string, number> = new Map();
  private lastPreWarmedNpcId: string | null = null;
  private accumulatedGameMinutes = 0;
  private lastEvalGameMinute = 0;
  private greetingTimer: ReturnType<typeof setTimeout> | null = null;
  private _paused = false;

  // Callout state
  private calloutCooldowns: Map<string, number> = new Map();
  private lastGlobalCalloutTime = 0;
  private activeCallout: CalloutAttempt | null = null;
  private calloutBubbleTimer: ReturnType<typeof setTimeout> | null = null;
  private calloutRespondTimer: ReturnType<typeof setTimeout> | null = null;
  private accumulatedGameSeconds = 0;
  private lastCalloutEvalGameSecond = 0;

  // Walking interrupt state
  private walkingInterruptCooldowns: Map<string, number> = new Map();
  private lastGlobalWalkingInterruptTime = 0;
  private activeWalkingInterrupt: WalkingInterruptAttempt | null = null;
  private walkingInterruptBubbleTimer: ReturnType<typeof setTimeout> | null = null;
  private walkingInterruptRespondTimer: ReturnType<typeof setTimeout> | null = null;
  private lastWalkingInterruptEvalTime = 0;
  private _walkingInterruptSetting: WalkingInterruptSetting = 'on';

  constructor(callbacks: ApproachCallbacks) {
    this.callbacks = callbacks;
  }

  /** Register an NPC for approach evaluation. */
  registerNPC(npc: ApproachableNPC): void {
    this.npcs.set(npc.id, npc);
  }

  /** Update NPC data. */
  updateNPC(npcId: string, updates: Partial<ApproachableNPC>): void {
    const npc = this.npcs.get(npcId);
    if (npc) {
      Object.assign(npc, updates);
    }
  }

  /** Unregister an NPC. */
  unregisterNPC(npcId: string): void {
    this.npcs.delete(npcId);
    if (this.activeApproach?.npcId === npcId) {
      this.cancelApproach();
    }
  }

  /** Pause evaluation (e.g., during player conversation). */
  pause(): void {
    this._paused = true;
  }

  /** Resume evaluation. */
  resume(): void {
    this._paused = false;
  }

  /** Whether an NPC is currently approaching the player. */
  hasActiveApproach(): boolean {
    return this.activeApproach !== null;
  }

  /** Get the ID of the NPC currently approaching. */
  getApproachingNPCId(): string | null {
    return this.activeApproach?.npcId ?? null;
  }

  /** Whether a callout is currently active. */
  hasActiveCallout(): boolean {
    return this.activeCallout !== null;
  }

  /** Get the active callout attempt (for testing). */
  getActiveCallout(): CalloutAttempt | null {
    return this.activeCallout;
  }

  /**
   * Player accepted the NPC's conversation request (pressed G near approaching NPC).
   * Opens chat and cleans up the approach state.
   */
  async acceptApproach(): Promise<boolean> {
    if (!this.activeApproach?.promptShown) return false;

    const npcId = this.activeApproach.npcId;
    this.clearGreetingTimer();
    this.callbacks.onDismissGreeting(npcId);

    this.callbacks.onEmitEvent?.({
      type: 'npc_initiated_conversation',
      npcId,
      npcName: this.activeApproach.npcName,
      accepted: true,
    });

    this.activeApproach = null;
    await this.callbacks.onOpenChat(npcId);
    return true;
  }

  /**
   * Player responded to a callout (pressed G near calling-out NPC).
   * Opens chat and cleans up the callout state.
   */
  async acceptCallout(): Promise<boolean> {
    if (!this.activeCallout) return false;

    const npcId = this.activeCallout.npcId;
    const npcName = this.activeCallout.npcName;
    this.clearCalloutTimers();
    this.callbacks.onDismissCallout?.(npcId);

    this.callbacks.onEmitEvent?.({
      type: 'npc_callout',
      npcId,
      npcName,
      accepted: true,
      isQuestBearer: this.activeCallout.isQuestBearer,
    });

    this.activeCallout = null;
    await this.callbacks.onOpenChat(npcId);
    return true;
  }

  /** Whether a walking interrupt is currently active. */
  hasActiveWalkingInterrupt(): boolean {
    return this.activeWalkingInterrupt !== null;
  }

  /** Get the active walking interrupt (for testing). */
  getActiveWalkingInterrupt(): WalkingInterruptAttempt | null {
    return this.activeWalkingInterrupt;
  }

  /** Set the walking interrupt setting. */
  setWalkingInterruptSetting(setting: WalkingInterruptSetting): void {
    this._walkingInterruptSetting = setting;
  }

  /** Get the walking interrupt setting. */
  getWalkingInterruptSetting(): WalkingInterruptSetting {
    return this._walkingInterruptSetting;
  }

  /** Check if player is currently walking (velocity above threshold). */
  isPlayerWalking(): boolean {
    const velocity = this.callbacks.getPlayerVelocity?.() ?? 0;
    return velocity > WALKING_VELOCITY_THRESHOLD;
  }

  /**
   * Player responded to a walking interrupt (pressed G near interrupting NPC).
   * Opens chat and cleans up the walking interrupt state.
   */
  async acceptWalkingInterrupt(): Promise<boolean> {
    if (!this.activeWalkingInterrupt) return false;

    const npcId = this.activeWalkingInterrupt.npcId;
    const npcName = this.activeWalkingInterrupt.npcName;
    this.clearWalkingInterruptTimers();
    this.callbacks.onDismissWalkingInterrupt?.(npcId);

    this.callbacks.onEmitEvent?.({
      type: 'walking_interrupt',
      npcId,
      npcName,
      accepted: true,
      isQuestBearer: this.activeWalkingInterrupt.isQuestBearer,
    });

    this.activeWalkingInterrupt = null;
    await this.callbacks.onOpenChat(npcId);
    return true;
  }

  /**
   * Frame update. Call every frame with delta time.
   * @param deltaTimeMs Real time since last frame
   * @param msPerGameHour Real ms per game hour
   */
  update(deltaTimeMs: number, msPerGameHour: number): void {
    if (this._paused) return;

    const gameMinutesDelta = (deltaTimeMs / msPerGameHour) * 60;
    this.accumulatedGameMinutes += gameMinutesDelta;

    const gameSecondsDelta = gameMinutesDelta * 60;
    this.accumulatedGameSeconds += gameSecondsDelta;

    // Evaluate approach periodically
    if (this.accumulatedGameMinutes - this.lastEvalGameMinute >= EVAL_INTERVAL_GAME_MINUTES) {
      this.lastEvalGameMinute = this.accumulatedGameMinutes;
      this.evaluateApproach();
    }

    // Evaluate callouts every 30 game-seconds
    if (this.accumulatedGameSeconds - this.lastCalloutEvalGameSecond >= CALLOUT_EVAL_INTERVAL_GAME_SECONDS) {
      this.lastCalloutEvalGameSecond = this.accumulatedGameSeconds;
      this.evaluateCallout();
    }

    // Evaluate walking interrupts every 1.5 seconds (real time) when player is walking
    if (this._walkingInterruptSetting !== 'off') {
      const nowMs = Date.now();
      if (nowMs - this.lastWalkingInterruptEvalTime >= WALKING_INTERRUPT_EVAL_INTERVAL_MS) {
        this.lastWalkingInterruptEvalTime = nowMs;
        if (this.isPlayerWalking()) {
          this.evaluateWalkingInterrupt();
        }
      }
    }

    // Evaluate pre-warm on every update tick (debounced by cooldown per NPC)
    this.evaluatePreWarm();

    // Update active approach (check if NPC reached player)
    if (this.activeApproach && !this.activeApproach.hasReached) {
      this.updateApproach();
    }
  }

  /** Calculate approach probability for a single NPC toward the player. */
  calculateApproachProbability(
    npc: ApproachableNPC,
    playerRelationship: { strength?: number; trust?: number } | undefined,
    gameHour: number,
  ): number {
    // Base from extroversion (0–0.35)
    let prob = npc.personality.extroversion * 0.35;

    // Agreeableness bonus (0–0.15)
    prob += npc.personality.agreeableness * 0.15;

    // Relationship bonus (0–0.25)
    const relStrength = playerRelationship?.strength ?? 0;
    prob += relStrength * 0.25;

    // Mood modifier
    const positiveMoods = new Set(['happy', 'excited', 'content', 'grateful', 'amused']);
    const negativeMoods = new Set(['angry', 'sad', 'fearful', 'disgusted', 'anxious']);
    if (positiveMoods.has(npc.mood)) {
      prob += 0.1;
    } else if (negativeMoods.has(npc.mood)) {
      prob -= 0.05;
    }

    // Neuroticism penalty (shy/anxious NPCs less likely to approach)
    prob -= npc.personality.neuroticism * 0.15;

    // Time of day: more social during day
    if (gameHour >= 8 && gameHour <= 20) {
      prob += 0.05;
    } else {
      prob -= 0.15;
    }

    return Math.max(0, Math.min(1, prob));
  }

  /**
   * Evaluate whether to pre-warm LLM context for the nearest NPC within range.
   * Debounced: only fires for the single nearest NPC, with a 60s cooldown per NPC.
   * Cancels pre-warm if player moves away (lastPreWarmedNpcId reset).
   */
  private evaluatePreWarm(): void {
    if (this.callbacks.isPlayerInConversation()) return;

    const playerPos = this.callbacks.getPlayerPosition();
    if (!playerPos) return;

    const now = Date.now();
    let nearestNpc: ApproachableNPC | null = null;
    let nearestDist = PRE_WARM_RADIUS + 1;

    const npcList = Array.from(this.npcs.values());
    for (const npc of npcList) {
      if (npc.isInConversation) continue;

      const dx = playerPos.x - npc.position.x;
      const dz = playerPos.z - npc.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist <= PRE_WARM_RADIUS && dist < nearestDist) {
        nearestDist = dist;
        nearestNpc = npc;
      }
    }

    // If no NPC in range, reset tracking
    if (!nearestNpc) {
      this.lastPreWarmedNpcId = null;
      return;
    }

    // Skip if already pre-warmed this NPC recently
    const lastPreWarm = this.preWarmCooldowns.get(nearestNpc.id) ?? 0;
    if (now - lastPreWarm < PRE_WARM_COOLDOWN_MS) return;

    // Skip if this is the same NPC we just pre-warmed (player hasn't moved away)
    if (this.lastPreWarmedNpcId === nearestNpc.id) return;

    // Fire pre-warm event
    this.preWarmCooldowns.set(nearestNpc.id, now);
    this.lastPreWarmedNpcId = nearestNpc.id;

    this.callbacks.onEmitEvent?.({
      type: 'player_near_npc',
      npcId: nearestNpc.id,
      npcName: nearestNpc.name,
      worldId: '', // Filled by BabylonGame listener
      distance: nearestDist,
    });
  }

  /** Evaluate whether any NPC should approach the player. */
  private evaluateApproach(): void {
    if (this.activeApproach) return;
    if (this.callbacks.isPlayerInConversation()) return;

    const playerPos = this.callbacks.getPlayerPosition();
    if (!playerPos) return;

    const gameHour = this.callbacks.getGameHour();
    const now = Date.now();

    let bestNpc: ApproachableNPC | null = null;
    let bestScore = 0;

    const npcList = Array.from(this.npcs.values());
    for (const npc of npcList) {
      // Skip unavailable NPCs
      if (npc.isInConversation) continue;

      // Skip if on cooldown
      const lastApproach = this.approachCooldowns.get(npc.id) ?? 0;
      if (now - lastApproach < APPROACH_COOLDOWN_MS) continue;

      // Check distance
      const dx = playerPos.x - npc.position.x;
      const dz = playerPos.z - npc.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist > APPROACH_EVAL_RADIUS) continue;

      // Calculate probability
      const playerRel = npc.relationships['player'];
      const prob = this.calculateApproachProbability(npc, playerRel, gameHour);

      if (prob > bestScore) {
        bestScore = prob;
        bestNpc = npc;
      }
    }

    // Roll against probability
    if (bestNpc && Math.random() < bestScore) {
      this.startApproach(bestNpc);
    }
  }

  /** Start an NPC approach toward the player. */
  private startApproach(npc: ApproachableNPC): void {
    const playerPos = this.callbacks.getPlayerPosition();
    if (!playerPos) return;

    const env = this.callbacks.getEnvironment?.() ?? null;
    // Prefer server-side cached greeting (LLM-generated, CEFR-aware);
    // fall back to local template greetings
    const greetingContext = env ? this.mapEnvToGreetingContext(env) : undefined;
    const cachedGreeting = this.callbacks.getCachedGreeting?.(npc.id, greetingContext);
    const greeting = cachedGreeting ?? getGreeting(npc.mood, npc.name, env);

    this.activeApproach = {
      npcId: npc.id,
      npcName: npc.name,
      startTime: Date.now(),
      greeting,
      hasReached: false,
      promptShown: false,
    };

    this.approachCooldowns.set(npc.id, Date.now());

    // Walk NPC toward a point near the player
    const dirToPlayer = playerPos.subtract(npc.position).normalize();
    const approachTarget = playerPos.subtract(dirToPlayer.scale(GREETING_DISTANCE));
    this.callbacks.onMoveTo(npc.id, approachTarget, 'walk');

    this.callbacks.onEmitEvent?.({
      type: 'npc_initiated_conversation',
      npcId: npc.id,
      npcName: npc.name,
      accepted: false,
    });
  }

  /** Check if the approaching NPC has reached the player. */
  private updateApproach(): void {
    if (!this.activeApproach) return;

    const npc = this.npcs.get(this.activeApproach.npcId);
    const playerPos = this.callbacks.getPlayerPosition();
    if (!npc || !playerPos) {
      this.cancelApproach();
      return;
    }

    // Check distance
    const dx = playerPos.x - npc.position.x;
    const dz = playerPos.z - npc.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist <= GREETING_DISTANCE * 1.5) {
      this.activeApproach.hasReached = true;
      this.activeApproach.promptShown = true;

      // Face the player
      this.callbacks.onFaceDirection(npc.id, playerPos);
      this.callbacks.onAnimationChange(npc.id, 'talk');

      // Show greeting
      this.callbacks.onShowGreeting(
        npc.id,
        this.activeApproach.npcName,
        this.activeApproach.greeting,
      );

      // Auto-dismiss after timeout
      this.greetingTimer = setTimeout(() => {
        this.dismissApproach();
      }, GREETING_TIMEOUT_MS);
    }

    // If NPC has been walking for too long without reaching, cancel
    const elapsed = Date.now() - this.activeApproach.startTime;
    if (elapsed > 10000 && !this.activeApproach.hasReached) {
      this.cancelApproach();
    }
  }

  /** Dismiss the current approach (timeout or player walked away). */
  private dismissApproach(): void {
    if (!this.activeApproach) return;

    const npcId = this.activeApproach.npcId;
    this.clearGreetingTimer();
    this.callbacks.onDismissGreeting(npcId);
    this.callbacks.onAnimationChange(npcId, 'idle');

    this.callbacks.onEmitEvent?.({
      type: 'npc_initiated_conversation',
      npcId,
      npcName: this.activeApproach.npcName,
      accepted: false,
    });

    this.activeApproach = null;
  }

  /** Cancel the approach entirely (NPC unregistered, etc.). */
  private cancelApproach(): void {
    if (!this.activeApproach) return;

    const npcId = this.activeApproach.npcId;
    this.clearGreetingTimer();
    this.callbacks.onDismissGreeting(npcId);
    this.callbacks.onAnimationChange(npcId, 'idle');
    this.activeApproach = null;
  }

  /** Map environment info to greeting cache context key. */
  private mapEnvToGreetingContext(
    env: GreetingEnvironment,
  ): 'morning' | 'afternoon' | 'evening' | 'rainy' | 'general' {
    if (env.weather === 'rain' || env.weather === 'storm') return 'rainy';
    if (env.timePeriod === 'dawn' || env.timePeriod === 'morning') return 'morning';
    if (env.timePeriod === 'evening' || env.timePeriod === 'night') return 'evening';
    if (env.timePeriod === 'afternoon') return 'afternoon';
    return 'general';
  }

  private clearGreetingTimer(): void {
    if (this.greetingTimer !== null) {
      clearTimeout(this.greetingTimer);
      this.greetingTimer = null;
    }
  }

  // ── Callout System ──────────────────────────────────────────────────

  /**
   * Calculate the probability of an NPC calling out to the player.
   * Uses personality traits similar to calculateApproachProbability().
   */
  calculateCalloutProbability(npc: ApproachableNPC, isQuestBearer: boolean): number {
    // Quest bearers have a fixed high probability
    if (isQuestBearer) return CALLOUT_QUEST_BEARER_PROBABILITY;

    let prob = CALLOUT_BASE_PROBABILITY;

    // Extroverts are more likely to call out (+20% if extroversion > 0.7)
    if (npc.personality.extroversion > 0.7) {
      prob += 0.2;
    }

    // Introverts are less likely (-10% if extroversion < 0.3)
    if (npc.personality.extroversion < 0.3) {
      prob -= 0.1;
    }

    return Math.max(0, Math.min(1, prob));
  }

  /**
   * Evaluate whether any nearby NPC should call out to the player.
   * Runs every 30 game-seconds. Fires a brief speech bubble without
   * the NPC walking toward the player.
   */
  private evaluateCallout(): void {
    // Don't callout if there's already an active callout, approach, or conversation
    if (this.activeCallout) return;
    if (this.activeApproach) return;
    if (this.callbacks.isPlayerInConversation()) return;

    const playerPos = this.callbacks.getPlayerPosition();
    if (!playerPos) return;

    const now = Date.now();

    // Global cooldown check
    if (now - this.lastGlobalCalloutTime < CALLOUT_GLOBAL_COOLDOWN_MS) return;

    const candidates: Array<{ npc: ApproachableNPC; dist: number; isQuestBearer: boolean; prob: number }> = [];

    const npcList = Array.from(this.npcs.values());
    for (const npc of npcList) {
      if (npc.isInConversation) continue;

      // Per-NPC cooldown
      const lastCallout = this.calloutCooldowns.get(npc.id) ?? 0;
      if (now - lastCallout < CALLOUT_NPC_COOLDOWN_MS) continue;

      // Also skip if on approach cooldown (recently approached)
      const lastApproach = this.approachCooldowns.get(npc.id) ?? 0;
      if (now - lastApproach < APPROACH_COOLDOWN_MS) continue;

      // Distance check
      const dx = playerPos.x - npc.position.x;
      const dz = playerPos.z - npc.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist > CALLOUT_RADIUS) continue;

      const isQuestBearer = this.callbacks.isNpcQuestBearer?.(npc.id) ?? false;
      const prob = this.calculateCalloutProbability(npc, isQuestBearer);

      candidates.push({ npc, dist, isQuestBearer, prob });
    }

    if (candidates.length === 0) return;

    // Sort by probability descending (quest bearers first), then distance
    candidates.sort((a, b) => b.prob - a.prob || a.dist - b.dist);

    const best = candidates[0];

    // Roll against probability
    if (Math.random() >= best.prob) return;

    this.startCallout(best.npc, best.isQuestBearer);
  }

  /** Start a callout from an NPC. */
  private startCallout(npc: ApproachableNPC, isQuestBearer: boolean): void {
    const env = this.callbacks.getEnvironment?.() ?? null;
    const greetingContext = env ? this.mapEnvToGreetingContext(env) : undefined;
    const cachedGreeting = this.callbacks.getCachedGreeting?.(npc.id, greetingContext);
    const greeting = cachedGreeting ?? getGreeting(npc.mood, npc.name, env);

    const now = Date.now();
    this.calloutCooldowns.set(npc.id, now);
    this.lastGlobalCalloutTime = now;

    this.activeCallout = {
      npcId: npc.id,
      npcName: npc.name,
      startTime: now,
      greeting,
      isQuestBearer,
    };

    // Show the speech bubble
    this.callbacks.onShowCallout?.(npc.id, npc.name, greeting, isQuestBearer);

    // Emit callout event
    this.callbacks.onEmitEvent?.({
      type: 'npc_callout',
      npcId: npc.id,
      npcName: npc.name,
      accepted: false,
      isQuestBearer,
    });

    // Auto-dismiss bubble after 4 seconds, then show respond prompt for 3 seconds
    this.calloutBubbleTimer = setTimeout(() => {
      this.calloutBubbleTimer = null;
      // After bubble dismisses, the respond window continues for 3 more seconds
      this.calloutRespondTimer = setTimeout(() => {
        this.calloutRespondTimer = null;
        this.dismissCallout();
      }, CALLOUT_RESPOND_DURATION_MS);
    }, CALLOUT_BUBBLE_DURATION_MS);
  }

  /** Dismiss the active callout. */
  private dismissCallout(): void {
    if (!this.activeCallout) return;
    const npcId = this.activeCallout.npcId;
    this.clearCalloutTimers();
    this.callbacks.onDismissCallout?.(npcId);
    this.activeCallout = null;
  }

  private clearCalloutTimers(): void {
    if (this.calloutBubbleTimer !== null) {
      clearTimeout(this.calloutBubbleTimer);
      this.calloutBubbleTimer = null;
    }
    if (this.calloutRespondTimer !== null) {
      clearTimeout(this.calloutRespondTimer);
      this.calloutRespondTimer = null;
    }
  }

  // ── Walking Interrupt System ─────────────────────────────────────────

  /**
   * Calculate the probability of an NPC firing a walking interrupt.
   * Lower base probability than callouts since these fire more frequently.
   */
  calculateWalkingInterruptProbability(npc: ApproachableNPC, isQuestBearer: boolean): number {
    let prob = WALKING_INTERRUPT_BASE_PROBABILITY;

    // Extroverts are more likely to call out
    if (npc.personality.extroversion > 0.7) {
      prob += WALKING_INTERRUPT_EXTROVERT_BONUS;
    }

    // Quest-bearers get a bonus
    if (isQuestBearer) {
      prob += WALKING_INTERRUPT_QUEST_BEARER_BONUS;
    }

    return Math.max(0, Math.min(1, prob));
  }

  /**
   * Evaluate whether any nearby NPC should fire a walking interrupt.
   * Runs every 1-2 seconds when the player is walking.
   * NPCs within 6 units call out brief one-liners.
   */
  private evaluateWalkingInterrupt(): void {
    // Don't interrupt if there's already an active interrupt, callout, approach, or conversation
    if (this.activeWalkingInterrupt) return;
    if (this.activeCallout) return;
    if (this.activeApproach) return;
    if (this.callbacks.isPlayerInConversation()) return;

    const playerPos = this.callbacks.getPlayerPosition();
    if (!playerPos) return;

    const now = Date.now();

    // Global cooldown check
    if (now - this.lastGlobalWalkingInterruptTime < WALKING_INTERRUPT_GLOBAL_COOLDOWN_MS) return;

    const candidates: Array<{ npc: ApproachableNPC; dist: number; isQuestBearer: boolean; prob: number }> = [];

    const npcList = Array.from(this.npcs.values());
    for (const npc of npcList) {
      if (npc.isInConversation) continue;

      // Per-NPC walking interrupt cooldown (3 minutes)
      const lastInterrupt = this.walkingInterruptCooldowns.get(npc.id) ?? 0;
      if (now - lastInterrupt < WALKING_INTERRUPT_NPC_COOLDOWN_MS) continue;

      // Also skip if on callout cooldown (recently called out)
      const lastCallout = this.calloutCooldowns.get(npc.id) ?? 0;
      if (now - lastCallout < CALLOUT_NPC_COOLDOWN_MS) continue;

      // Distance check — tighter radius than callouts (6 vs 8)
      const dx = playerPos.x - npc.position.x;
      const dz = playerPos.z - npc.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist > WALKING_INTERRUPT_RADIUS) continue;

      const isQuestBearer = this.callbacks.isNpcQuestBearer?.(npc.id) ?? false;
      const prob = this.calculateWalkingInterruptProbability(npc, isQuestBearer);

      candidates.push({ npc, dist, isQuestBearer, prob });
    }

    if (candidates.length === 0) return;

    // Sort by probability descending, then distance
    candidates.sort((a, b) => b.prob - a.prob || a.dist - b.dist);

    const best = candidates[0];

    // Roll against probability
    if (Math.random() >= best.prob) return;

    this.startWalkingInterrupt(best.npc, best.isQuestBearer);
  }

  /** Start a walking interrupt from an NPC. */
  private startWalkingInterrupt(npc: ApproachableNPC, isQuestBearer: boolean): void {
    const phrase = getWalkingInterruptPhrase(npc.mood, isQuestBearer);

    const now = Date.now();
    this.walkingInterruptCooldowns.set(npc.id, now);
    this.lastGlobalWalkingInterruptTime = now;

    this.activeWalkingInterrupt = {
      npcId: npc.id,
      npcName: npc.name,
      startTime: now,
      phrase,
      isQuestBearer,
    };

    // Show the brief speech bubble
    this.callbacks.onShowWalkingInterrupt?.(npc.id, npc.name, phrase, isQuestBearer);

    // Emit walking interrupt event
    this.callbacks.onEmitEvent?.({
      type: 'walking_interrupt',
      npcId: npc.id,
      npcName: npc.name,
      accepted: false,
      isQuestBearer,
    });

    // Auto-dismiss bubble after 2 seconds, then respond prompt for 3 seconds
    this.walkingInterruptBubbleTimer = setTimeout(() => {
      this.walkingInterruptBubbleTimer = null;
      this.walkingInterruptRespondTimer = setTimeout(() => {
        this.walkingInterruptRespondTimer = null;
        this.dismissWalkingInterrupt();
      }, WALKING_INTERRUPT_RESPOND_DURATION_MS);
    }, WALKING_INTERRUPT_BUBBLE_DURATION_MS);
  }

  /** Dismiss the active walking interrupt. */
  private dismissWalkingInterrupt(): void {
    if (!this.activeWalkingInterrupt) return;
    const npcId = this.activeWalkingInterrupt.npcId;
    this.clearWalkingInterruptTimers();
    this.callbacks.onDismissWalkingInterrupt?.(npcId);
    this.activeWalkingInterrupt = null;
  }

  private clearWalkingInterruptTimers(): void {
    if (this.walkingInterruptBubbleTimer !== null) {
      clearTimeout(this.walkingInterruptBubbleTimer);
      this.walkingInterruptBubbleTimer = null;
    }
    if (this.walkingInterruptRespondTimer !== null) {
      clearTimeout(this.walkingInterruptRespondTimer);
      this.walkingInterruptRespondTimer = null;
    }
  }

  /** Clean up all resources. */
  dispose(): void {
    this.clearGreetingTimer();
    this.clearCalloutTimers();
    this.clearWalkingInterruptTimers();
    this.activeApproach = null;
    this.activeCallout = null;
    this.activeWalkingInterrupt = null;
    this.npcs.clear();
    this.approachCooldowns.clear();
    this.preWarmCooldowns.clear();
    this.calloutCooldowns.clear();
    this.walkingInterruptCooldowns.clear();
    this.lastPreWarmedNpcId = null;
    this.lastGlobalCalloutTime = 0;
    this.lastGlobalWalkingInterruptTime = 0;
  }
}
