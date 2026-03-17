/**
 * NPC Ambient Conversation Manager
 *
 * Manages NPC-to-NPC conversations in the 3D game world.
 * Only runs conversations when the player is nearby to optimize performance.
 * Uses the existing conversation system API and TTS for natural dialogue.
 */

import { Vector3, Scene, Mesh } from '@babylonjs/core';
import { NPCTalkingIndicator } from './NPCTalkingIndicator';
import type { GamePrologEngine } from './GamePrologEngine';

interface NPCInstance {
  mesh: Mesh;
  state: string;
  id: string;
  name: string;
}

interface ActiveConversation {
  conversationId: string;
  participants: [string, string];
  startTime: number;
  currentUtteranceIndex: number;
  isComplete: boolean;
}

interface ConversationUtterance {
  id: string;
  speaker: string;
  listener: string;
  text: string;
  timestamp: number;
  tone: string;
}

interface ConversationData {
  id: string;
  participants: [string, string];
  utterances: ConversationUtterance[];
  endTimestep?: number;
}

export class NPCAmbientConversationManager {
  private scene: Scene;
  private worldId: string;
  private talkingIndicator: NPCTalkingIndicator;

  // Player tracking
  private playerMesh: Mesh | null = null;
  private hearingRadius: number = 30; // Distance at which player can hear conversations

  // NPC tracking
  private npcMeshes: Map<string, NPCInstance> = new Map();

  // Active conversations
  private activeConversations: Map<string, ActiveConversation> = new Map();
  private conversationCooldowns: Map<string, number> = new Map(); // Track when NPCs last chatted

  // Settings
  private conversationCheckInterval: number = 5000; // Check every 5 seconds
  private minConversationCooldown: number = 60000; // 1 minute between conversations per NPC
  private maxSimultaneousConversations: number = 3; // Limit to avoid overwhelming player
  private utteranceDelay: number = 3000; // 3 seconds between utterances

  // Timers
  private checkTimer: number | null = null;
  private utteranceTimers: Map<string, number> = new Map();

  // Audio
  private currentlySpeaking: Set<string> = new Set();

  // Pause ambient conversations while the player is talking to an NPC
  private _paused = false;

  // Prolog engine for personality-based conversation matching
  private prologEngine: GamePrologEngine | null = null;

  constructor(scene: Scene, worldId: string, talkingIndicator: NPCTalkingIndicator) {
    this.scene = scene;
    this.worldId = worldId;
    this.talkingIndicator = talkingIndicator;
  }

  /**
   * Set the player mesh for proximity detection
   */
  public setPlayerMesh(playerMesh: Mesh): void {
    this.playerMesh = playerMesh;
  }

  /**
   * Register an NPC for conversation tracking
   */
  public registerNPC(npcId: string, npcName: string, mesh: Mesh, state: string): void {
    this.npcMeshes.set(npcId, {
      mesh,
      state,
      id: npcId,
      name: npcName
    });
  }

  /**
   * Set the Prolog engine for personality-based conversation selection.
   */
  public setPrologEngine(engine: GamePrologEngine): void {
    this.prologEngine = engine;
  }

  /** Pause ambient conversations (e.g. while player is in a conversation). */
  public pause(): void { this._paused = true; }

  /** Resume ambient conversations. */
  public resume(): void { this._paused = false; }

  /**
   * Unregister an NPC
   */
  public unregisterNPC(npcId: string): void {
    this.npcMeshes.delete(npcId);
    this.conversationCooldowns.delete(npcId);

    // End any conversations involving this NPC
    for (const [convId, conv] of this.activeConversations.entries()) {
      if (conv.participants.includes(npcId)) {
        this.endConversation(convId);
      }
    }
  }

  /**
   * Start the conversation manager
   */
  public start(): void {
    if (this.checkTimer !== null) {
      console.warn('[NPCAmbientConversationManager] Already started');
      return;
    }

    console.log('[NPCAmbientConversationManager] Starting ambient conversation system');

    this.checkTimer = window.setInterval(() => {
      this.checkForNewConversations();
    }, this.conversationCheckInterval);
  }

  /**
   * Stop the conversation manager
   */
  public stop(): void {
    if (this.checkTimer !== null) {
      window.clearInterval(this.checkTimer);
      this.checkTimer = null;
    }

    // Clear all utterance timers
    for (const timer of this.utteranceTimers.values()) {
      window.clearTimeout(timer);
    }
    this.utteranceTimers.clear();

    // End all active conversations
    for (const convId of this.activeConversations.keys()) {
      this.endConversation(convId);
    }

    console.log('[NPCAmbientConversationManager] Stopped ambient conversation system');
  }

  /**
   * Check if new conversations should start
   */
  private async checkForNewConversations(): Promise<void> {
    if (!this.playerMesh || this._paused) return;

    // Don't start more conversations if we're at the limit
    if (this.activeConversations.size >= this.maxSimultaneousConversations) {
      return;
    }

    const now = Date.now();
    const playerPos = this.playerMesh.position;

    // Find NPCs within hearing range who are available to chat
    const availableNPCs: NPCInstance[] = [];

    for (const npc of this.npcMeshes.values()) {
      // Skip NPCs who are already in conversations
      const inConversation = Array.from(this.activeConversations.values()).some(
        conv => conv.participants.includes(npc.id)
      );
      if (inConversation) continue;

      // Skip NPCs on cooldown
      const lastConversation = this.conversationCooldowns.get(npc.id) || 0;
      if (now - lastConversation < this.minConversationCooldown) continue;

      // Skip NPCs not in idle state
      if (npc.state !== 'idle') continue;

      // Check if NPC is within hearing range of player
      const distance = Vector3.Distance(playerPos, npc.mesh.position);
      if (distance <= this.hearingRadius) {
        availableNPCs.push(npc);
      }
    }

    // Need at least 2 NPCs to have a conversation
    if (availableNPCs.length < 2) return;

    // If Prolog engine is available, use personality-based partner selection
    if (this.prologEngine && availableNPCs.length >= 2) {
      for (const npc of availableNPCs) {
        try {
          const wantsTo = await this.prologEngine.wantsToSocialize(npc.id);
          if (!wantsTo) continue;

          const preferredPartners = await this.prologEngine.whoShouldTalkTo(npc.id);
          const avoidList = await this.prologEngine.whoToAvoid(npc.id);
          const avoidSet = new Set(avoidList);

          for (const partnerId of preferredPartners) {
            const partner = availableNPCs.find(n => n.id === partnerId);
            if (!partner || avoidSet.has(partnerId)) continue;
            const distance = Vector3.Distance(npc.mesh.position, partner.mesh.position);
            if (distance <= 8) {
              await this.startConversation(npc.id, partnerId);
              return;
            }
          }
        } catch {
          // Fall through to proximity-based selection
        }
      }
    }

    // Fallback: Find pairs of NPCs who are close to each other
    for (let i = 0; i < availableNPCs.length - 1; i++) {
      for (let j = i + 1; j < availableNPCs.length; j++) {
        const npc1 = availableNPCs[i];
        const npc2 = availableNPCs[j];

        const distance = Vector3.Distance(npc1.mesh.position, npc2.mesh.position);

        // NPCs should be close to each other (within 5 units)
        if (distance <= 5) {
          // Random chance to start conversation (30%)
          if (Math.random() < 0.3) {
            await this.startConversation(npc1.id, npc2.id);
            return; // Only start one conversation per check
          }
        }
      }
    }
  }

  /**
   * Start a new conversation between two NPCs
   */
  private async startConversation(npc1Id: string, npc2Id: string): Promise<void> {
    try {
      console.log(`[NPCAmbientConversationManager] Starting conversation between ${npc1Id} and ${npc2Id}`);

      const npc1 = this.npcMeshes.get(npc1Id);
      const npc2 = this.npcMeshes.get(npc2Id);
      if (!npc1 || !npc2) return;

      // Make the two NPCs face each other
      this.faceEachOther(npc1.mesh, npc2.mesh);

      // Get a location for the conversation (midpoint between NPCs)
      const midpoint = Vector3.Center(npc1.mesh.position, npc2.mesh.position);
      const location = `location_${Math.floor(midpoint.x)}_${Math.floor(midpoint.z)}`;

      // Call the conversation API to simulate a short conversation
      const response = await fetch('/api/conversations/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          char1Id: npc1Id,
          char2Id: npc2Id,
          location,
          duration: 3, // 3 utterances back and forth
          currentTimestep: Math.floor(Date.now() / 1000)
        })
      });

      if (!response.ok) {
        console.error('[NPCAmbientConversationManager] Failed to start conversation:', response.statusText);
        return;
      }

      const conversationData: ConversationData = await response.json();

      // Track active conversation
      const activeConv: ActiveConversation = {
        conversationId: conversationData.id,
        participants: [npc1Id, npc2Id],
        startTime: Date.now(),
        currentUtteranceIndex: 0,
        isComplete: false
      };

      this.activeConversations.set(conversationData.id, activeConv);

      // Update cooldowns
      this.conversationCooldowns.set(npc1Id, Date.now());
      this.conversationCooldowns.set(npc2Id, Date.now());

      // Start playing utterances
      this.playConversationUtterances(conversationData);

    } catch (error) {
      console.error('[NPCAmbientConversationManager] Error starting conversation:', error);
    }
  }

  /**
   * Play conversation utterances sequentially with TTS
   */
  private async playConversationUtterances(conversationData: ConversationData): Promise<void> {
    const activeConv = this.activeConversations.get(conversationData.id);
    if (!activeConv) return;

    // Safety check: ensure utterances exist
    if (!conversationData.utterances || !Array.isArray(conversationData.utterances)) {
      console.warn('[NPCAmbientConversationManager] Conversation has no utterances:', conversationData.id);
      this.endConversation(conversationData.id);
      return;
    }

    for (let i = 0; i < conversationData.utterances.length; i++) {
      const utterance = conversationData.utterances[i];

      // Check if conversation was cancelled
      if (!this.activeConversations.has(conversationData.id)) {
        break;
      }

      // Wait before speaking
      if (i > 0) {
        await new Promise(resolve => {
          const timer = window.setTimeout(resolve, this.utteranceDelay);
          this.utteranceTimers.set(`${conversationData.id}_${i}`, timer);
        });
      }

      // Speak utterance
      await this.speakUtterance(utterance);

      activeConv.currentUtteranceIndex = i + 1;
    }

    // Mark conversation as complete and clean up
    activeConv.isComplete = true;
    this.endConversation(conversationData.id);
  }

  /**
   * Speak a single utterance using TTS
   */
  private async speakUtterance(utterance: ConversationUtterance): Promise<void> {
    const speakerNPC = this.npcMeshes.get(utterance.speaker);
    if (!speakerNPC) return;

    try {
      console.log(`[NPCAmbientConversationManager] ${speakerNPC.name}: "${utterance.text}"`);

      this.currentlySpeaking.add(utterance.speaker);

      // Show talking indicator with the utterance text
      this.talkingIndicator.show(utterance.speaker, speakerNPC.mesh, utterance.text);

      // Get character gender for voice selection
      const characterRes = await fetch(`/api/characters/${utterance.speaker}`);
      if (!characterRes.ok) {
        throw new Error('Failed to fetch character data');
      }
      const characterData = await characterRes.json();
      const gender = characterData.gender || 'neutral';

      // Use TTS API with emotional tone from utterance
      const ttsResponse = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: utterance.text,
          voice: gender === 'female' ? 'Kore' : 'Charon',
          gender,
          emotionalTone: utterance.tone || undefined
        })
      });

      if (ttsResponse.ok) {
        const audioBlob = await ttsResponse.blob();
        await this.playAudioBlob(audioBlob);
      } else {
        // Fallback to browser TTS
        await this.browserTextToSpeech(utterance.text, gender);
      }

    } catch (error) {
      console.error('[NPCAmbientConversationManager] Error speaking utterance:', error);
      // Fallback to browser TTS on error
      await this.browserTextToSpeech(utterance.text, 'neutral');
    } finally {
      // Hide talking indicator
      this.talkingIndicator.hide(utterance.speaker);
      this.currentlySpeaking.delete(utterance.speaker);
    }
  }

  /**
   * Play audio blob
   */
  private playAudioBlob(blob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(URL.createObjectURL(blob));
      audio.onended = () => {
        URL.revokeObjectURL(audio.src);
        resolve();
      };
      audio.onerror = (error) => {
        URL.revokeObjectURL(audio.src);
        reject(error);
      };
      audio.play();
    });
  }

  /**
   * Fallback browser text-to-speech
   */
  private browserTextToSpeech(text: string, gender: string): Promise<void> {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = gender === 'female' ? 1.2 : 0.8;

      const voices = speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.startsWith('en'));
      if (voice) utterance.voice = voice;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      speechSynthesis.speak(utterance);
    });
  }

  /**
   * End a conversation
   */
  private endConversation(conversationId: string): void {
    const conv = this.activeConversations.get(conversationId);
    if (!conv) return;

    console.log(`[NPCAmbientConversationManager] Ending conversation ${conversationId}`);

    // Clear any pending utterance timers
    for (const [key, timer] of this.utteranceTimers.entries()) {
      if (key.startsWith(conversationId)) {
        window.clearTimeout(timer);
        this.utteranceTimers.delete(key);
      }
    }

    // Hide talking indicators for participants
    for (const participantId of conv.participants) {
      if (this.currentlySpeaking.has(participantId)) {
        this.talkingIndicator.hide(participantId);
        this.currentlySpeaking.delete(participantId);
      }
    }

    this.activeConversations.delete(conversationId);
  }

  /**
   * Get number of active conversations
   */
  public getActiveConversationCount(): number {
    return this.activeConversations.size;
  }

  /**
   * Check if an NPC is currently in a conversation
   */
  public isInConversation(npcId: string): boolean {
    return Array.from(this.activeConversations.values()).some(
      conv => conv.participants.includes(npcId)
    );
  }

  /**
   * Update settings
   */
  public updateSettings(settings: {
    hearingRadius?: number;
    maxSimultaneousConversations?: number;
    conversationCheckInterval?: number;
  }): void {
    if (settings.hearingRadius !== undefined) {
      this.hearingRadius = settings.hearingRadius;
    }
    if (settings.maxSimultaneousConversations !== undefined) {
      this.maxSimultaneousConversations = settings.maxSimultaneousConversations;
    }
    if (settings.conversationCheckInterval !== undefined) {
      // Restart timer with new interval
      if (this.checkTimer !== null) {
        this.stop();
        this.conversationCheckInterval = settings.conversationCheckInterval;
        this.start();
      } else {
        this.conversationCheckInterval = settings.conversationCheckInterval;
      }
    }
  }

  /**
   * Rotate two NPC meshes to face each other.
   */
  private faceEachOther(mesh1: Mesh, mesh2: Mesh): void {
    const dir1to2 = mesh2.position.subtract(mesh1.position).normalize();
    const dir2to1 = mesh1.position.subtract(mesh2.position).normalize();

    mesh1.rotation.y = Math.atan2(dir1to2.x, dir1to2.z) + Math.PI;
    mesh2.rotation.y = Math.atan2(dir2to1.x, dir2to1.z) + Math.PI;
  }

  /**
   * Dispose of the manager
   */
  public dispose(): void {
    this.stop();
    this.npcMeshes.clear();
    this.conversationCooldowns.clear();
    this.currentlySpeaking.clear();
  }
}
