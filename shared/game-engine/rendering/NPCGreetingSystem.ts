/**
 * NPC Greeting System — Target-Language Greetings & Ambient Dialogue
 *
 * Makes NPCs feel alive by having them greet the player using the world's
 * target language. Features:
 *  - Passive greetings when player passes within proximity of an NPC
 *  - 40% base chance scaled by extroversion + reputation
 *  - Greetings vary by time of day, relationship level, and NPC personality
 *  - First-time greetings include name and occupation
 *  - 5-minute cooldown per NPC
 *  - Speech bubbles with target-language text + English subtitle
 *  - Player can respond with G key to start conversation
 *  - Interior greetings from business owners on building entry
 *
 * Integration:
 *  - NPCTalkingIndicator: speech bubble display
 *  - GameEventBus: emits npc_greeting events for learning tracking
 *  - shared/language/utils: multi-language greeting banks
 */

import { Vector3, Mesh } from '@babylonjs/core';
import { GREETINGS, INTRODUCTIONS, HELP_OFFERS } from '@shared/language/utils';
import type { GameEventBus } from '../logic/GameEventBus';
import type { NPCTalkingIndicator } from './NPCTalkingIndicator';

// ── Types ──────────────────────────────────────────────────────────────────

export interface GreetableNPC {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  mesh: Mesh;
  occupation?: string;
  personality: {
    openness: number;
    conscientiousness: number;
    extroversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  /** Relationship strength with the player (0-1) */
  playerReputation: number;
  /** Whether this NPC owns a business the player might enter */
  isBusinessOwner: boolean;
  /** Business/building ID the NPC owns, if any */
  businessBuildingId?: string;
}

export interface GreetingConfig {
  /** Radius in world units to trigger a greeting */
  greetingRadius: number;
  /** Base probability of greeting (before personality/reputation scaling) */
  baseProbability: number;
  /** Cooldown between greetings from the same NPC (ms) */
  cooldownMs: number;
  /** How long the speech bubble stays visible (ms) */
  bubbleDurationMs: number;
  /** Whether to show English subtitle below target-language text */
  showSubtitle: boolean;
  /** Target language for greetings */
  targetLanguage: string;
}

const DEFAULT_CONFIG: GreetingConfig = {
  greetingRadius: 5,
  baseProbability: 0.4,
  cooldownMs: 300_000, // 5 minutes
  bubbleDurationMs: 4000,
  showSubtitle: true,
  targetLanguage: 'English',
};

/** Time-of-day greeting keys mapped from game hour */
type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night';

/** Time-of-day specific greeting templates per language */
const TIME_GREETINGS: Record<string, Record<TimePeriod, string[]>> = {
  English: {
    morning: ['Good morning!', 'Morning!', 'Beautiful morning!'],
    afternoon: ['Good afternoon!', 'Afternoon!', 'Nice day!'],
    evening: ['Good evening!', 'Evening!', 'Lovely evening!'],
    night: ['Good night!', 'Still up?', 'Late night, huh?'],
  },
  French: {
    morning: ['Bonjour !', 'Bon matin !', 'Belle matinée !'],
    afternoon: ['Bon après-midi !', 'Bonjour !', 'Belle journée !'],
    evening: ['Bonsoir !', 'Belle soirée !'],
    night: ['Bonne nuit !', 'Encore debout ?'],
  },
  Spanish: {
    morning: ['¡Buenos días!', '¡Buen día!', '¡Bonita mañana!'],
    afternoon: ['¡Buenas tardes!', '¡Buena tarde!'],
    evening: ['¡Buenas noches!', '¡Bonita noche!'],
    night: ['¡Buenas noches!', '¿Todavía despierto?'],
  },
  German: {
    morning: ['Guten Morgen!', 'Morgen!', 'Schöner Morgen!'],
    afternoon: ['Guten Tag!', 'Schöner Tag!'],
    evening: ['Guten Abend!', 'Schöner Abend!'],
    night: ['Gute Nacht!', 'Noch wach?'],
  },
  Italian: {
    morning: ['Buongiorno!', 'Buon mattino!'],
    afternoon: ['Buon pomeriggio!', 'Buongiorno!'],
    evening: ['Buonasera!', 'Bella serata!'],
    night: ['Buonanotte!', 'Ancora sveglio?'],
  },
  Japanese: {
    morning: ['おはようございます！', 'おはよう！'],
    afternoon: ['こんにちは！'],
    evening: ['こんばんは！'],
    night: ['おやすみなさい！', 'まだ起きてるの？'],
  },
  Portuguese: {
    morning: ['Bom dia!', 'Boa manhã!'],
    afternoon: ['Boa tarde!'],
    evening: ['Boa noite!'],
    night: ['Boa noite!', 'Ainda acordado?'],
  },
  Korean: {
    morning: ['좋은 아침이에요!', '안녕하세요!'],
    afternoon: ['안녕하세요!'],
    evening: ['좋은 저녁이에요!'],
    night: ['안녕히 주무세요!'],
  },
  Chinese: {
    morning: ['早上好！', '早安！'],
    afternoon: ['下午好！'],
    evening: ['晚上好！'],
    night: ['晚安！'],
  },
  'Mandarin Chinese': {
    morning: ['早上好！', '早安！'],
    afternoon: ['下午好！'],
    evening: ['晚上好！'],
    night: ['晚安！'],
  },
  Russian: {
    morning: ['Доброе утро!', 'Утро доброе!'],
    afternoon: ['Добрый день!'],
    evening: ['Добрый вечер!'],
    night: ['Доброй ночи!'],
  },
};

/** English translations of time-period greetings for subtitles */
const TIME_GREETING_TRANSLATIONS: Record<TimePeriod, string> = {
  morning: 'Good morning!',
  afternoon: 'Good afternoon!',
  evening: 'Good evening!',
  night: 'Good night!',
};

// ── Helpers ────────────────────────────────────────────────────────────────

function getTimePeriod(gameHour: number): TimePeriod {
  if (gameHour >= 5 && gameHour < 12) return 'morning';
  if (gameHour >= 12 && gameHour < 17) return 'afternoon';
  if (gameHour >= 17 && gameHour < 21) return 'evening';
  return 'night';
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── System ─────────────────────────────────────────────────────────────────

export class NPCGreetingSystem {
  private config: GreetingConfig;
  private eventBus: GameEventBus;
  private talkingIndicator: NPCTalkingIndicator;

  private npcs: Map<string, GreetableNPC> = new Map();
  private playerMesh: Mesh | null = null;

  /** Cooldown timestamps: npcId → last greeting time */
  private cooldowns: Map<string, number> = new Map();
  /** NPCs the player has already met (for first-time greetings) */
  private metNPCs: Set<string> = new Set();
  /** Active bubble timers: npcId → timeout handle */
  private bubbleTimers: Map<string, number> = new Map();

  /** Time-of-day provider (game hour 0-23) */
  private getGameHour: () => number = () => 12;

  /** Callback to open chat with an NPC */
  private onOpenChat: ((npcId: string) => Promise<void>) | null = null;
  /** Callback to check if player is in conversation */
  private isPlayerInConversation: () => boolean = () => false;

  /** Pending greeting prompt the player can accept with G key */
  private pendingGreetingNpcId: string | null = null;

  /** Callback to show/hide the "Press G" prompt */
  private onShowRespondPrompt: ((show: boolean, npcName?: string) => void) | null = null;

  constructor(
    eventBus: GameEventBus,
    talkingIndicator: NPCTalkingIndicator,
    config?: Partial<GreetingConfig>,
  ) {
    this.eventBus = eventBus;
    this.talkingIndicator = talkingIndicator;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ── Public API ──────────────────────────────────────────────────────────

  setPlayerMesh(mesh: Mesh): void {
    this.playerMesh = mesh;
  }

  setTimeOfDayProvider(fn: () => number): void {
    this.getGameHour = fn;
  }

  setOpenChatCallback(fn: (npcId: string) => Promise<void>): void {
    this.onOpenChat = fn;
  }

  setPlayerConversationCheck(fn: () => boolean): void {
    this.isPlayerInConversation = fn;
  }

  setRespondPromptCallback(fn: (show: boolean, npcName?: string) => void): void {
    this.onShowRespondPrompt = fn;
  }

  setTargetLanguage(language: string): void {
    this.config.targetLanguage = language;
  }

  updateConfig(partial: Partial<GreetingConfig>): void {
    Object.assign(this.config, partial);
  }

  registerNPC(npc: GreetableNPC): void {
    this.npcs.set(npc.id, npc);
  }

  updateNPC(npcId: string, updates: Partial<GreetableNPC>): void {
    const npc = this.npcs.get(npcId);
    if (npc) Object.assign(npc, updates);
  }

  unregisterNPC(npcId: string): void {
    this.npcs.delete(npcId);
    this.cooldowns.delete(npcId);
    this.clearBubble(npcId);
  }

  /** Mark an NPC as met (won't get first-time introduction again). */
  markAsMet(npcId: string): void {
    this.metNPCs.add(npcId);
  }

  /** Check if an NPC has been met before. */
  hasMet(npcId: string): boolean {
    return this.metNPCs.has(npcId);
  }

  /** Get the NPC ID of the pending greeting prompt, if any. */
  getPendingGreetingNpcId(): string | null {
    return this.pendingGreetingNpcId;
  }

  /**
   * Player pressed G to respond to a greeting. Opens chat with the NPC.
   * Returns true if a greeting was accepted.
   */
  async acceptGreeting(): Promise<boolean> {
    if (!this.pendingGreetingNpcId || !this.onOpenChat) return false;

    const npcId = this.pendingGreetingNpcId;
    const npc = this.npcs.get(npcId);
    this.clearBubble(npcId);
    this.pendingGreetingNpcId = null;
    this.onShowRespondPrompt?.(false);

    this.eventBus.emit({
      type: 'npc_initiated_conversation',
      npcId,
      npcName: npc?.name || 'Unknown',
      accepted: true,
    });

    await this.onOpenChat(npcId);
    return true;
  }

  /**
   * Main update — call each frame or on a throttled interval.
   * Checks player proximity to all NPCs and triggers greetings.
   */
  update(): void {
    if (!this.playerMesh || this.isPlayerInConversation()) return;

    const now = Date.now();
    const playerPos = this.playerMesh.position;
    const gameHour = this.getGameHour();
    const timePeriod = getTimePeriod(gameHour);

    // Clear pending greeting if player moved away
    if (this.pendingGreetingNpcId) {
      const pendingNpc = this.npcs.get(this.pendingGreetingNpcId);
      if (pendingNpc) {
        const dist = Vector3.Distance(playerPos, pendingNpc.mesh.position);
        if (dist > this.config.greetingRadius * 2) {
          this.clearBubble(this.pendingGreetingNpcId);
          this.pendingGreetingNpcId = null;
          this.onShowRespondPrompt?.(false);
        }
      }
    }

    for (const npc of Array.from(this.npcs.values())) {
      // Skip if NPC mesh is disabled or already has a bubble
      if (!npc.mesh.isEnabled()) continue;
      if (this.bubbleTimers.has(npc.id)) continue;

      // Check distance
      const dist = Vector3.Distance(playerPos, npc.mesh.position);
      if (dist > this.config.greetingRadius) continue;

      // Check cooldown
      const lastGreeting = this.cooldowns.get(npc.id) || 0;
      if (now - lastGreeting < this.config.cooldownMs) continue;

      // Calculate greeting probability
      const prob = this.calculateGreetingProbability(npc);
      if (Math.random() > prob) {
        // Failed the roll — set a short cooldown so we don't re-roll every frame
        this.cooldowns.set(npc.id, now - this.config.cooldownMs + 30_000);
        continue;
      }

      // Trigger greeting
      this.triggerGreeting(npc, timePeriod, now);
    }
  }

  /**
   * Trigger a business-owner greeting when the player enters a building.
   * Call this from the building entry system.
   */
  triggerBusinessOwnerGreeting(buildingId: string): void {
    for (const npc of Array.from(this.npcs.values())) {
      if (!npc.isBusinessOwner || npc.businessBuildingId !== buildingId) continue;

      const now = Date.now();
      const lastGreeting = this.cooldowns.get(npc.id) || 0;
      if (now - lastGreeting < this.config.cooldownMs) return;

      const timePeriod = getTimePeriod(this.getGameHour());
      this.triggerGreeting(npc, timePeriod, now);
      return;
    }
  }

  /** Serialize met-NPC set for save/load. */
  serialize(): { metNPCs: string[]; cooldowns: Array<[string, number]> } {
    return {
      metNPCs: Array.from(this.metNPCs),
      cooldowns: Array.from(this.cooldowns.entries()),
    };
  }

  /** Deserialize saved state. */
  deserialize(data: { metNPCs?: string[]; cooldowns?: Array<[string, number]> }): void {
    if (data.metNPCs) this.metNPCs = new Set(data.metNPCs);
    if (data.cooldowns) this.cooldowns = new Map(data.cooldowns);
  }

  dispose(): void {
    for (const timer of Array.from(this.bubbleTimers.values())) {
      window.clearTimeout(timer);
    }
    this.bubbleTimers.clear();
    this.npcs.clear();
    this.cooldowns.clear();
    this.metNPCs.clear();
    this.pendingGreetingNpcId = null;
  }

  // ── Internal ────────────────────────────────────────────────────────────

  /**
   * Calculate the probability of an NPC greeting the player.
   * Base 40%, scaled by extroversion and reputation.
   */
  calculateGreetingProbability(npc: GreetableNPC): number {
    let prob = this.config.baseProbability;

    // Extroversion scales ±20% (extroversion 0→-0.2, 0.5→0, 1.0→+0.2)
    prob += (npc.personality.extroversion - 0.5) * 0.4;

    // Reputation scales ±15%
    prob += npc.personality.agreeableness * 0.1;
    prob += npc.playerReputation * 0.15;

    return Math.max(0.05, Math.min(0.95, prob));
  }

  /**
   * Build a greeting in the target language, with optional English subtitle.
   * First-time greetings include the NPC's name and occupation.
   */
  buildGreeting(
    npc: GreetableNPC,
    timePeriod: TimePeriod,
  ): { targetText: string; subtitle: string } {
    const lang = this.config.targetLanguage;
    const isFirstMeeting = !this.metNPCs.has(npc.id);

    // Pick time-appropriate greeting
    const timeGreetings = TIME_GREETINGS[lang]?.[timePeriod];
    const fallbackGreetings = GREETINGS[lang] || GREETINGS['English'];
    const greetingText = timeGreetings
      ? pickRandom(timeGreetings)
      : pickRandom(fallbackGreetings);

    let targetText = greetingText;
    let subtitle = TIME_GREETING_TRANSLATIONS[timePeriod];

    if (isFirstMeeting) {
      // Add name introduction in target language
      const introFn = INTRODUCTIONS[lang] || INTRODUCTIONS['English'];
      const intro = introFn(npc.firstName, npc.lastName);
      targetText += ' ' + intro;

      subtitle += ` I'm ${npc.firstName} ${npc.lastName}.`;

      // Add occupation if available
      if (npc.occupation) {
        const helpOffers = HELP_OFFERS[lang] || HELP_OFFERS['English'];
        if (helpOffers.length > 0) {
          targetText += ' ' + pickRandom(helpOffers);
          subtitle += ` (${npc.occupation})`;
        }
      }
    }

    // If target language IS English, no need for subtitle
    if (lang === 'English') {
      subtitle = '';
    }

    return { targetText, subtitle };
  }

  private triggerGreeting(npc: GreetableNPC, timePeriod: TimePeriod, now: number): void {
    this.cooldowns.set(npc.id, now);

    const { targetText, subtitle } = this.buildGreeting(npc, timePeriod);

    // Format display text: target language + subtitle
    const displayText = subtitle && this.config.showSubtitle
      ? `${targetText}\n(${subtitle})`
      : targetText;

    // Show speech bubble
    this.talkingIndicator.show(npc.id, npc.mesh, displayText);

    // Set up auto-hide timer
    const timer = window.setTimeout(() => {
      this.clearBubble(npc.id);
      if (this.pendingGreetingNpcId === npc.id) {
        this.pendingGreetingNpcId = null;
        this.onShowRespondPrompt?.(false);
      }
    }, this.config.bubbleDurationMs);
    this.bubbleTimers.set(npc.id, timer);

    // Set as pending greeting for G key response
    this.pendingGreetingNpcId = npc.id;
    this.onShowRespondPrompt?.(true, npc.name);

    // Mark as met after first greeting
    if (!this.metNPCs.has(npc.id)) {
      this.metNPCs.add(npc.id);
    }

    // Emit event for tracking
    this.eventBus.emit({
      type: 'npc_greeting',
      npcId: npc.id,
      npcName: npc.name,
      language: this.config.targetLanguage,
      greetingText: targetText,
      isFirstMeeting: !this.metNPCs.has(npc.id),
    });
  }

  private clearBubble(npcId: string): void {
    const timer = this.bubbleTimers.get(npcId);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      this.bubbleTimers.delete(npcId);
    }
    this.talkingIndicator.hide(npcId);
  }
}
