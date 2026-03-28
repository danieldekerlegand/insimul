/**
 * NPC Ambient Conversation Manager
 *
 * Lightweight system that pairs nearby NPCs into visual conversations.
 * No API calls, no TTS — just talk/listen animations exchanged on a timer.
 *
 * When the player is close enough to a conversing pair, an "eavesdrop" prompt
 * appears. If the player eavesdrops, the game opens the chat panel in
 * eavesdrop mode and runs a real conversation through the same streaming
 * pipeline used for player-NPC dialogue.
 */

import { Vector3, Scene, Mesh } from '@babylonjs/core';
import { NPCTalkingIndicator } from './NPCTalkingIndicator';
import { GREETINGS } from '@shared/language/utils';
import type { GamePrologEngine } from '../logic/GamePrologEngine';

/** Short ambient dialogue phrases in target languages for NPC-NPC speech bubbles. */
const AMBIENT_DIALOGUE_PHRASES: Record<string, string[]> = {
  French: ['Oui, bien sûr!', 'Ah bon?', 'C\'est vrai?', 'Exactement!', 'Pas mal!', 'Incroyable!', 'Tu as raison.', 'Quelle histoire!'],
  Spanish: ['¡Sí, claro!', '¿De verdad?', '¡Exacto!', '¡No me digas!', '¡Qué bien!', 'Tienes razón.', '¡Increíble!', '¡Qué historia!'],
  German: ['Ja, natürlich!', 'Wirklich?', 'Genau!', 'Nicht schlecht!', 'Unglaublich!', 'Du hast Recht.', 'Was für eine Geschichte!'],
  Italian: ['Sì, certo!', 'Davvero?', 'Esatto!', 'Incredibile!', 'Hai ragione.', 'Che storia!', 'Non male!'],
  Portuguese: ['Sim, claro!', 'Sério?', 'Exatamente!', 'Incrível!', 'Você tem razão.', 'Que história!'],
  Japanese: ['そうですね！', 'ほんとう？', 'なるほど！', 'すごい！', 'そうだね。', 'えー！'],
  Chinese: ['是的！', '真的吗？', '没错！', '太厉害了！', '你说得对。', '不错！'],
  'Mandarin Chinese': ['是的！', '真的吗？', '没错！', '太厉害了！', '你说得对。', '不错！'],
  Korean: ['맞아요!', '정말요?', '대단해요!', '그래요!', '맞아, 맞아!'],
  Russian: ['Да, конечно!', 'Правда?', 'Точно!', 'Невероятно!', 'Ты прав.'],
};

interface NPCInstance {
  mesh: Mesh;
  state: string;
  id: string;
  name: string;
}

export interface AmbientConversation {
  id: string;
  participants: [string, string];
  startTime: number;
  /** Which participant is currently "talking" (index 0 or 1) */
  activeSpeakerIdx: number;
  /** Timer handle for alternating talk animations */
  alternateTimer: number | null;
}

/** Callback to trigger NPC animations (talk/idle/listen) */
type AnimationChangeCallback = (npcId: string, animation: string) => void;

/** Callback invoked when eavesdrop is available/unavailable near the player */
type EavesdropPromptCallback = (
  available: boolean,
  npc1Id?: string,
  npc2Id?: string,
  npc1Name?: string,
  npc2Name?: string
) => void;

/** Callback invoked when the player activates eavesdrop */
type EavesdropActivateCallback = (npc1Id: string, npc2Id: string) => void;

export class NPCAmbientConversationManager {
  private scene: Scene;

  // NPC tracking
  private npcMeshes: Map<string, NPCInstance> = new Map();

  // Active visual-only conversations (no API calls)
  private activeConversations: Map<string, AmbientConversation> = new Map();
  private conversationCooldowns: Map<string, number> = new Map();

  // Settings
  private checkIntervalMs = 5000;
  private minCooldownMs = 30000;
  private maxSimultaneous = 3;
  /** How long each NPC "talks" before the other responds (ms) */
  private talkTurnDurationMs = 3000;
  /** Total conversation duration before NPCs part ways (ms) */
  private conversationDurationMs = 20000;
  /** Max distance between two NPCs to start a conversation */
  private pairingRadius = 8;
  /** Distance within which the player sees the eavesdrop prompt */
  private eavesdropRadius = 12;
  /** Minimum distance NPCs maintain during conversation */
  private minSeparation = 2.0;

  // Timers
  private checkTimer: number | null = null;

  // Pause flag
  private _paused = false;

  // Player tracking
  private playerMesh: Mesh | null = null;

  // Talking indicator for "..." chat bubbles
  private talkingIndicator: NPCTalkingIndicator | null = null;

  // Callbacks
  private onAnimationChange: AnimationChangeCallback | null = null;
  private onEavesdropPrompt: EavesdropPromptCallback | null = null;
  private onEavesdropActivate: EavesdropActivateCallback | null = null;

  // Eavesdrop state
  private currentEavesdropConvId: string | null = null;
  private lastPromptConvId: string | null = null;

  // Target language for ambient dialogue phrases
  private targetLanguage: string = 'English';

  constructor(scene: Scene, _worldId: string, talkingIndicator: NPCTalkingIndicator) {
    this.scene = scene;
    this.talkingIndicator = talkingIndicator;
  }

  // --- Public API ---

  public setPlayerMesh(mesh: Mesh): void {
    this.playerMesh = mesh;
  }

  public registerNPC(npcId: string, npcName: string, mesh: Mesh, state: string): void {
    this.npcMeshes.set(npcId, { mesh, state, id: npcId, name: npcName });
  }

  public unregisterNPC(npcId: string): void {
    this.npcMeshes.delete(npcId);
    this.conversationCooldowns.delete(npcId);
    for (const [convId, conv] of Array.from(this.activeConversations.entries())) {
      if (conv.participants.includes(npcId)) {
        this.endConversation(convId);
      }
    }
  }

  public setPrologEngine(_engine: GamePrologEngine): void {
    // Prolog-based matching not used in lightweight ambient system
  }

  public setTargetLanguage(language: string): void {
    this.targetLanguage = language;
  }

  public setAnimationCallback(cb: AnimationChangeCallback): void {
    this.onAnimationChange = cb;
  }

  public setEavesdropPromptCallback(cb: EavesdropPromptCallback): void {
    this.onEavesdropPrompt = cb;
  }

  public setEavesdropActivateCallback(cb: EavesdropActivateCallback): void {
    this.onEavesdropActivate = cb;
  }

  public pause(): void { this._paused = true; }
  public resume(): void { this._paused = false; }

  public start(): void {
    if (this.checkTimer !== null) return;
    this.checkTimer = window.setInterval(() => this.tick(), this.checkIntervalMs);
  }

  public stop(): void {
    if (this.checkTimer !== null) {
      window.clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
    for (const convId of Array.from(this.activeConversations.keys())) {
      this.endConversation(convId);
    }
  }

  public isInConversation(npcId: string): boolean {
    return Array.from(this.activeConversations.values()).some(
      conv => conv.participants.includes(npcId)
    );
  }

  public getActiveConversationCount(): number {
    return this.activeConversations.size;
  }

  /**
   * If the NPC is in an ambient conversation, return the partner's id and name.
   */
  public getConversationPartner(npcId: string): { partnerId: string; partnerName: string } | null {
    for (const conv of this.activeConversations.values()) {
      const idx = conv.participants.indexOf(npcId);
      if (idx !== -1) {
        const partnerId = conv.participants[idx === 0 ? 1 : 0];
        const partnerNpc = this.npcMeshes.get(partnerId);
        return {
          partnerId,
          partnerName: partnerNpc?.name || partnerId,
        };
      }
    }
    return null;
  }

  /**
   * Called by BabylonGame when the player presses the eavesdrop key (F).
   */
  public activateEavesdrop(): void {
    if (!this.lastPromptConvId) return;
    const conv = this.activeConversations.get(this.lastPromptConvId);
    if (!conv) return;

    this.currentEavesdropConvId = this.lastPromptConvId;
    const [id1, id2] = conv.participants;
    this.onEavesdropActivate?.(id1, id2);
  }

  /**
   * Called when eavesdrop conversation ends (player closes panel or walks away).
   */
  public endEavesdrop(): void {
    this.currentEavesdropConvId = null;
  }

  public updateSettings(settings: {
    hearingRadius?: number;
    maxSimultaneousConversations?: number;
    conversationCheckInterval?: number;
  }): void {
    if (settings.maxSimultaneousConversations !== undefined) {
      this.maxSimultaneous = settings.maxSimultaneousConversations;
    }
    if (settings.conversationCheckInterval !== undefined) {
      this.checkIntervalMs = settings.conversationCheckInterval;
      if (this.checkTimer !== null) {
        this.stop();
        this.start();
      }
    }
  }

  public dispose(): void {
    this.stop();
    this.npcMeshes.clear();
    this.conversationCooldowns.clear();
  }

  // --- Core tick ---

  private tick(): void {
    if (this._paused) return;
    const now = Date.now();

    // Expire old conversations
    for (const [convId, conv] of Array.from(this.activeConversations.entries())) {
      if (now - conv.startTime > this.conversationDurationMs) {
        this.endConversation(convId);
      }
    }

    // Try to start new conversations
    if (this.activeConversations.size < this.maxSimultaneous) {
      this.tryStartConversation(now);
    }

    // Update eavesdrop prompt based on player proximity
    this.updateEavesdropPrompt();
  }

  // --- Pairing logic ---

  private tryStartConversation(now: number): void {
    const available: NPCInstance[] = [];

    for (const npc of Array.from(this.npcMeshes.values())) {
      if (this.isInConversation(npc.id)) continue;
      if (npc.state === 'combat') continue;
      if (!npc.mesh.isEnabled()) continue;

      const lastChat = this.conversationCooldowns.get(npc.id) || 0;
      if (now - lastChat < this.minCooldownMs) continue;

      available.push(npc);
    }

    if (available.length < 2) return;

    // Find closest pair within pairing radius
    let bestPair: [NPCInstance, NPCInstance] | null = null;
    let bestDist = Infinity;

    for (let i = 0; i < available.length - 1; i++) {
      for (let j = i + 1; j < available.length; j++) {
        const d = Vector3.Distance(available[i].mesh.position, available[j].mesh.position);
        if (d <= this.pairingRadius && d < bestDist) {
          bestDist = d;
          bestPair = [available[i], available[j]];
        }
      }
    }

    if (!bestPair) return;
    if (Math.random() > 0.5) return; // 50% chance per tick

    this.startConversation(bestPair[0], bestPair[1], now);
  }

  private startConversation(npc1: NPCInstance, npc2: NPCInstance, now: number): void {
    const convId = `conv_${now}_${npc1.id}_${npc2.id}`;

    // Face each other and enforce separation
    this.faceEachOther(npc1.mesh, npc2.mesh);

    const conv: AmbientConversation = {
      id: convId,
      participants: [npc1.id, npc2.id],
      startTime: now,
      activeSpeakerIdx: 0,
      alternateTimer: null,
    };

    this.activeConversations.set(convId, conv);
    this.conversationCooldowns.set(npc1.id, now);
    this.conversationCooldowns.set(npc2.id, now);

    // Start alternating talk animations
    this.setTalkAnimations(conv);
    conv.alternateTimer = window.setInterval(() => {
      if (!this.activeConversations.has(convId)) return;
      conv.activeSpeakerIdx = conv.activeSpeakerIdx === 0 ? 1 : 0;
      this.setTalkAnimations(conv);
    }, this.talkTurnDurationMs);
  }

  private setTalkAnimations(conv: AmbientConversation): void {
    const speakerId = conv.participants[conv.activeSpeakerIdx];
    const listenerId = conv.participants[conv.activeSpeakerIdx === 0 ? 1 : 0];
    this.onAnimationChange?.(speakerId, 'talk');
    this.onAnimationChange?.(listenerId, 'idle');

    // Show a target-language snippet in the speech bubble (or "..." fallback)
    const speakerNPC = this.npcMeshes.get(speakerId);
    if (this.talkingIndicator && speakerNPC) {
      this.talkingIndicator.hide(listenerId);
      const snippet = this.pickAmbientSnippet();
      if (snippet) {
        this.talkingIndicator.show(speakerId, speakerNPC.mesh, snippet);
      } else {
        this.talkingIndicator.show(speakerId, speakerNPC.mesh);
      }
    }
  }

  /** Pick a random target-language snippet for ambient NPC-NPC speech bubbles. */
  private pickAmbientSnippet(): string | undefined {
    const lang = this.targetLanguage;
    if (!lang || lang === 'English') return undefined;

    const greetings = GREETINGS[lang];
    if (!greetings || greetings.length === 0) return undefined;

    // Mix greeting snippets with simple ambient phrases
    const ambientPhrases = AMBIENT_DIALOGUE_PHRASES[lang];
    const pool = ambientPhrases ? [...greetings, ...ambientPhrases] : greetings;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  private endConversation(convId: string): void {
    const conv = this.activeConversations.get(convId);
    if (!conv) return;

    if (conv.alternateTimer !== null) {
      window.clearInterval(conv.alternateTimer);
    }

    // Reset both to idle and hide chat bubbles
    for (const pid of conv.participants) {
      this.onAnimationChange?.(pid, 'idle');
      this.talkingIndicator?.hide(pid);
    }

    this.activeConversations.delete(convId);

    // Clear eavesdrop prompt if it was for this conversation
    if (this.lastPromptConvId === convId) {
      this.lastPromptConvId = null;
      this.onEavesdropPrompt?.(false);
    }
    if (this.currentEavesdropConvId === convId) {
      this.currentEavesdropConvId = null;
    }
  }

  // --- Eavesdrop proximity check ---

  private updateEavesdropPrompt(): void {
    if (!this.playerMesh || this._paused) {
      if (this.lastPromptConvId) {
        this.lastPromptConvId = null;
        this.onEavesdropPrompt?.(false);
      }
      return;
    }

    const playerPos = this.playerMesh.position;
    let closestConv: AmbientConversation | null = null;
    let closestDist = Infinity;

    for (const conv of Array.from(this.activeConversations.values())) {
      // Skip if already eavesdropping on this conversation
      if (this.currentEavesdropConvId === conv.id) continue;

      const npc1 = this.npcMeshes.get(conv.participants[0]);
      const npc2 = this.npcMeshes.get(conv.participants[1]);
      if (!npc1 || !npc2) continue;

      const midpoint = Vector3.Center(npc1.mesh.position, npc2.mesh.position);
      const dist = Vector3.Distance(playerPos, midpoint);

      if (dist <= this.eavesdropRadius && dist < closestDist) {
        closestDist = dist;
        closestConv = conv;
      }
    }

    if (closestConv) {
      if (this.lastPromptConvId !== closestConv.id) {
        this.lastPromptConvId = closestConv.id;
        const npc1 = this.npcMeshes.get(closestConv.participants[0]);
        const npc2 = this.npcMeshes.get(closestConv.participants[1]);
        this.onEavesdropPrompt?.(
          true,
          closestConv.participants[0],
          closestConv.participants[1],
          npc1?.name,
          npc2?.name
        );
      }
    } else if (this.lastPromptConvId) {
      this.lastPromptConvId = null;
      this.onEavesdropPrompt?.(false);
    }
  }

  // --- Helpers ---

  private faceEachOther(mesh1: Mesh, mesh2: Mesh): void {
    const diff = mesh2.position.subtract(mesh1.position);
    const dist = diff.length();
    if (dist < this.minSeparation && dist > 0.01) {
      const pushDir = diff.normalize();
      const pushAmount = (this.minSeparation - dist) / 2;
      mesh1.position.subtractInPlace(pushDir.scale(pushAmount));
      mesh2.position.addInPlace(pushDir.scale(pushAmount));
    }

    const dir1to2 = mesh2.position.subtract(mesh1.position).normalize();
    const dir2to1 = mesh1.position.subtract(mesh2.position).normalize();
    mesh1.rotation.y = Math.atan2(dir1to2.x, dir1to2.z) + Math.PI;
    mesh2.rotation.y = Math.atan2(dir2to1.x, dir2to1.z) + Math.PI;
  }
}
