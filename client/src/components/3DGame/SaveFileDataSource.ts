/**
 * SaveFileDataSource — reads game data from an embedded world snapshot
 * and writes mutations to an in-memory currentState.
 *
 * This replaces the ApiDataSource for gameplay. All reads come from the
 * save file's worldSnapshot (no DB queries). Writes go to currentState
 * which is periodically persisted back to the save file via PUT /api/saves/:id.
 *
 * Stateless API calls (AI chat, TTS/STT, translation) still go to the server.
 */

import type { IDataSource, IQuestOverlay, GenerationJobSummary, NpcConversationResult } from '@shared/game-engine/data-source';
import type { VisualAsset } from '@shared/schema';
import type { SaveFile, CurrentGameState, WorldSnapshot, PlaytraceEntry, ConversationSummary } from '@shared/save-file';
import type { DataSource } from './DataSource';
import type { QuestStorageProvider } from '@shared/quests/quest-storage-provider';
import { PlaythroughQuestOverlay } from '@shared/game-engine/logic/PlaythroughQuestOverlay';
import { createSaveGameQuestStorage, type ExportedWorldData } from '@shared/quests/save-game-quest-storage';

export class SaveFileDataSource implements DataSource {
  public questOverlay: PlaythroughQuestOverlay | null = null;
  private questStorage: QuestStorageProvider | null = null;

  private saveId: string;
  private snapshot: WorldSnapshot;
  private state: CurrentGameState;
  private conversations: ConversationSummary[];
  private playtraces: PlaytraceEntry[];
  private authToken: string;
  private baseUrl: string;
  private dirty = false;
  private autoSaveTimer: ReturnType<typeof setInterval> | null = null;

  constructor(saveFile: SaveFile, authToken: string, baseUrl: string = '') {
    this.saveId = saveFile.id;
    this.snapshot = saveFile.worldSnapshot;
    this.state = saveFile.currentState || {} as CurrentGameState;
    this.conversations = saveFile.conversations || [];
    this.playtraces = saveFile.playtraces || [];
    this.authToken = authToken;
    this.baseUrl = baseUrl;

    // Ensure all nested state objects exist (save files created before defaults may be missing them)
    if (!this.state.player) this.state.player = { position: {x:0,y:0,z:0}, rotation: {x:0,y:0,z:0}, gold: 100, health: 100, energy: 100, inventory: [], cefrLevel: null, effectiveFluency: null };
    if (!this.state.quests) this.state.quests = { progress: {}, dynamicQuests: [] };
    if (!this.state.quests.progress) this.state.quests.progress = {};
    if (!this.state.quests.dynamicQuests) this.state.quests.dynamicQuests = [];
    if (!this.state.npcs) this.state.npcs = { relationships: {}, romance: {}, merchantStates: {} };
    if (!this.state.npcs.relationships) this.state.npcs.relationships = {};
    if (!this.state.reputation) this.state.reputation = { settlements: {} };
    if (!this.state.reputation.settlements) this.state.reputation.settlements = {};
    if (!this.state.containers) this.state.containers = { containers: {} };
    if (!this.state.languageProgress) this.state.languageProgress = { vocabulary: [], grammarPatterns: [], totalXP: 0, level: 1 };
    if (!this.state.prologFacts) this.state.prologFacts = [];
    if (!this.state.extensions) this.state.extensions = {};

    // Initialize quest overlay and storage provider
    this.questOverlay = new PlaythroughQuestOverlay();
    // Restore overlay state from saved quest progress
    if (this.state.quests.progress && Object.keys(this.state.quests.progress).length > 0) {
      this.questOverlay.deserialize({
        overrides: this.state.quests.progress,
        created: Object.fromEntries(
          this.state.quests.dynamicQuests.map(q => [q.id, q])
        ),
      });
    }

    // Build ExportedWorldData from snapshot for quest storage
    const exportedData: ExportedWorldData = {
      world: this.snapshot.world as any,
      quests: this.snapshot.quests as any[],
      characters: this.snapshot.characters as any[],
      businesses: this.snapshot.lots
        .filter(l => l.building?.buildingCategory === 'business')
        .map(l => ({ ...l.building, id: l.id, settlementId: l.settlementId })) as any[],
      settlements: this.snapshot.settlements as any[],
      truths: [],
    };
    this.questStorage = createSaveGameQuestStorage(exportedData, this.questOverlay);

    // Auto-save every 60 seconds if dirty
    this.autoSaveTimer = setInterval(() => {
      if (this.dirty) this.persistToServer().catch(console.error);
    }, 60_000);
  }

  dispose() {
    if (this.autoSaveTimer) clearInterval(this.autoSaveTimer);
    // Final save
    if (this.dirty) this.persistToServer().catch(console.error);
  }

  /** Record a playtrace entry. Only significant actions get traced. */
  trace(action: string, description: string, details: Record<string, any> = {}) {
    // Only trace significant gameplay actions, not routine state updates
    const significant = ['quest_created', 'quest_completed', 'quest_branched', 'item_transferred',
      'conversation', 'game_started', 'reputation_adjusted'];
    if (!significant.includes(action)) return;

    this.playtraces.push({
      timestamp: new Date().toISOString(),
      action,
      description,
      details,
    });
  }

  /** Persist current state + conversations + playtraces to the server */
  async persistToServer(): Promise<void> {
    try {
      // Sync quest overlay state back into currentState before saving
      if (this.questOverlay) {
        const overlayState = this.questOverlay.serialize();
        this.state.quests.progress = (overlayState.overrides || {}) as any;
        this.state.quests.dynamicQuests = Object.values(overlayState.created || {}) as any[];
      }

      // Save state
      await fetch(`${this.baseUrl}/api/saves/${this.saveId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.authToken}` },
        body: JSON.stringify({
          currentState: this.state,
          conversations: this.conversations,
        }),
      });

      // Append new playtraces
      if (this.playtraces.length > 0) {
        await fetch(`${this.baseUrl}/api/saves/${this.saveId}/playtraces`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.authToken}` },
          body: JSON.stringify({ traces: this.playtraces }),
        });
        this.playtraces = [];
      }

      this.dirty = false;
      console.log('[SaveFileDS] Saved to server');
    } catch (e) {
      console.error('[SaveFileDS] Failed to persist:', e);
    }
  }

  private getHeaders(): Record<string, string> {
    return { Authorization: `Bearer ${this.authToken}` };
  }

  // ── Read methods (from snapshot) ──────────────────────────────────────

  async loadWorld(_worldId: string) { return this.snapshot.world; }
  async loadCharacters(_worldId: string) { return this.snapshot.characters; }
  async loadQuests(_worldId: string) {
    // Use the overlay to merge base quests with playthrough-local changes
    if (this.questOverlay) {
      return this.questOverlay.mergeQuests(this.snapshot.quests as any[]);
    }
    return [...this.snapshot.quests, ...this.state.quests.dynamicQuests];
  }
  async loadRules(_worldId: string) { return this.snapshot.rules; }
  async loadActions(_worldId: string) { return this.snapshot.actions; }
  async loadBaseRules() { return []; }
  async loadBaseActions() { return []; }
  async loadCountries(_worldId: string) { return this.snapshot.countries; }
  async loadStates(_worldId: string) { return []; }
  async loadBaseResources(_worldId: string) { return {}; }
  async loadConfig3D(_worldId: string) { return null; }
  async loadTruths(_worldId: string, _playthroughId?: string) { return []; }
  async loadGeography(_worldId: string) { return null; }
  async loadAIConfig(_worldId: string) { return null; }
  async loadDialogueContexts(_worldId: string) { return []; }
  async loadPrologContent(_worldId: string) { return null; }
  async loadWorldItems(_worldId: string) { return []; }
  async loadTexts(_worldId: string) { return []; }
  async getLanguages(_worldId: string) { return []; }
  async loadGenerationJobs(_worldId: string): Promise<GenerationJobSummary[]> { return []; }
  async loadAssets(_worldId: string) { return []; }
  async loadCharacter(characterId: string) {
    return this.snapshot.characters.find(c => c.id === characterId) || null;
  }

  async loadSettlements(_worldId: string) {
    return this.snapshot.settlements.map(s => ({
      ...s,
      lots: this.snapshot.lots.filter(l => l.settlementId === s.id),
    }));
  }

  async loadSettlementBusinesses(settlementId: string) {
    return this.snapshot.lots
      .filter(l => l.settlementId === settlementId && l.building?.buildingCategory === 'business')
      .map(l => ({ ...l.building, id: l.id, lotId: l.id, address: l.address, settlementId }));
  }

  async loadSettlementLots(settlementId: string) {
    return this.snapshot.lots.filter(l => l.settlementId === settlementId);
  }

  async loadSettlementResidences(settlementId: string) {
    return this.snapshot.lots
      .filter(l => l.settlementId === settlementId && l.building?.buildingCategory === 'residence')
      .map(l => ({ ...l, ...l.building, lotId: l.id }));
  }

  // ── Playthrough lifecycle (managed via save file, not DB) ────────────

  async listPlaythroughs(_worldId: string, _authToken: string) { return []; }
  async startPlaythrough(_worldId: string, _authToken: string, _name: string) { return { id: this.saveId }; }
  async getPlaythrough(_playthroughId: string) { return { id: this.saveId, status: 'active' }; }
  async updatePlaythrough(_playthroughId: string, _data: any) { return { id: this.saveId }; }
  async deletePlaythrough(_playthroughId: string) {}
  async markPlaythroughInitialized(_playthroughId: string) {}

  // ── Quests (write to currentState) ───────────────────────────────────

  getQuestStorageProvider(): QuestStorageProvider | null {
    return this.questStorage;
  }

  async createDynamicQuest(_worldId: string, questData: any) {
    // Use the quest storage provider so the overlay tracks it
    if (this.questStorage) {
      const quest = await this.questStorage.createQuest(questData as any);
      this.state.quests.dynamicQuests.push(quest as any);
      this.dirty = true;
      this.trace('quest_created', `Created dynamic quest: ${questData.name || questData.title}`, { questId: quest.id });
      return quest;
    }
    // Fallback
    const id = `dynamic_quest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const quest = { ...questData, id, status: 'active' };
    this.state.quests.dynamicQuests.push(quest);
    this.dirty = true;
    this.trace('quest_created', `Created dynamic quest: ${questData.name || questData.title}`, { questId: id });
    return quest;
  }

  async branchQuest(_worldId: string, questId: string, choiceId: string, targetStageId?: string) {
    if (!this.state.quests.progress[questId]) {
      this.state.quests.progress[questId] = { status: 'active', currentStageIndex: 0, stageData: {}, completedAt: null };
    }
    this.state.quests.progress[questId].stageData[`branch_${choiceId}`] = targetStageId || choiceId;
    this.dirty = true;
    this.trace('quest_branched', `Quest ${questId} branched`, { questId, choiceId, targetStageId });
    return { success: true };
  }

  async updateQuest(questId: string, data: any) {
    if (this.questOverlay) {
      this.questOverlay.updateQuest(questId, data);
    }
    this.dirty = true;
    this.trace('quest_updated', `Quest ${questId} updated`, { questId, ...data });
  }

  async completeQuest(_worldId: string, questId: string) {
    if (this.questOverlay) {
      this.questOverlay.updateQuest(questId, { status: 'completed', completedAt: new Date().toISOString() });
    }
    this.dirty = true;
    this.trace('quest_completed', `Completed quest ${questId}`, { questId });
    return { success: true };
  }

  async getNpcQuestGuidance(_worldId: string, _npcId: string) { return null; }
  async getMainQuestJournal(_worldId: string, _playerId: string, _cefrLevel?: string) { return null; }
  async tryUnlockMainQuest(_worldId: string, _playerId: string, _cefrLevel: string) {}
  async recordMainQuestCompletion(_worldId: string, _playerId: string, _questType: string, _cefrLevel?: string) { return {}; }
  async saveQuestProgress(_playthroughId: string, questProgress: any) {
    Object.assign(this.state.quests.progress, questProgress);
    this.dirty = true;
  }
  async loadQuestProgress(_playthroughId: string) { return this.state.quests.progress; }

  // ── Inventory & containers (write to currentState) ───────────────────

  async getEntityInventory(_worldId: string, _entityId: string) { return { items: [] }; }
  async transferItem(_worldId: string, transfer: any) {
    this.state.player.inventory = this.state.player.inventory || [];
    // Simple transfer logic — add to player inventory
    if (transfer.toEntityId === 'player' || !transfer.toEntityId) {
      this.state.player.inventory.push({
        id: transfer.itemId,
        name: transfer.itemName,
        type: transfer.itemType,
        quantity: transfer.quantity || 1,
      });
    }
    if (transfer.totalPrice) {
      this.state.player.gold -= transfer.totalPrice;
    }
    this.dirty = true;
    this.trace('item_transferred', `Transferred ${transfer.itemName}`, transfer);
    return { success: true };
  }
  async getMerchantInventory(_worldId: string, merchantId: string, _businessType?: string) {
    const lot = this.snapshot.lots.find(l => l.id === merchantId);
    return lot?.building?.businessData?.inventory || { items: [] };
  }
  async getPlayerInventory(_worldId: string, _playerId: string) {
    return { items: this.state.player.inventory };
  }
  async getContainerContents(containerId: string) {
    return this.state.containers.containers[containerId] || { items: [] };
  }
  async loadContainers(_worldId: string) { return []; }
  async loadContainersByLocation(_worldId: string, _location: any) { return []; }
  async updateContainer(containerId: string, data: any) {
    this.state.containers.containers[containerId] = data;
    this.dirty = true;
    return data;
  }
  async transferContainerItem(containerId: string, transfer: any) {
    this.dirty = true;
    this.trace('container_transfer', `Container ${containerId} transfer`, transfer);
    return { success: true };
  }

  // ── Save/Load (managed via save file) ────────────────────────────────

  async saveGameState(_worldId: string, _playthroughId: string, _slotIndex: number, state: any) {
    // Merge the GameSaveState into our currentState
    if (state.player) {
      this.state.player.position = state.player.position || this.state.player.position;
      this.state.player.rotation = state.player.rotation || this.state.player.rotation;
      this.state.player.gold = state.player.gold ?? this.state.player.gold;
      this.state.player.health = state.player.health ?? this.state.player.health;
      this.state.player.energy = state.player.energy ?? this.state.player.energy;
      this.state.player.inventory = state.player.inventory || this.state.player.inventory;
    }
    if (state.questProgress) {
      Object.assign(this.state.quests.progress, state.questProgress);
    }
    if (state.relationships) {
      Object.assign(this.state.npcs.relationships, state.relationships);
    }
    this.dirty = true;
    await this.persistToServer();
  }

  async loadGameState(_worldId: string, _playthroughId: string, _slotIndex: number) {
    // Convert currentState back to GameSaveState format
    return {
      version: 3,
      slotIndex: 0,
      savedAt: new Date().toISOString(),
      gameTime: 0,
      player: this.state.player,
      npcs: [],
      relationships: this.state.npcs.relationships,
      romance: this.state.npcs.romance,
      merchants: [],
      currentZone: null,
      questProgress: this.state.quests.progress,
    };
  }

  async deleteGameState(_worldId: string, _playthroughId: string, _slotIndex: number) {}

  // ── Conversations (stored in save file) ──────────────────────────────

  async saveConversation(_playthroughId: string, conversation: any) {
    const existing = this.conversations.find(c => c.npcCharacterId === conversation.npcCharacterId);
    if (existing) {
      existing.recentTurns.push(...(conversation.turns || []));
      existing.totalTurnCount += conversation.turnCount || 0;
      existing.wordsUsed.push(...(conversation.wordsUsed || []));
      existing.newWordsLearned.push(...(conversation.newWordsLearned || []));
    } else {
      this.conversations.push({
        npcCharacterId: conversation.npcCharacterId,
        npcCharacterName: conversation.npcCharacterName || '',
        compressedHistory: null,
        recentTurns: conversation.turns || [],
        totalTurnCount: conversation.turnCount || 0,
        lastLocationId: conversation.locationId || null,
        lastLocationName: conversation.locationName || null,
        wordsUsed: conversation.wordsUsed || [],
        newWordsLearned: conversation.newWordsLearned || [],
        topics: conversation.topics || [],
      });
    }
    this.dirty = true;
    this.trace('conversation', `Talked to ${conversation.npcCharacterName}`, { npcId: conversation.npcCharacterId });
    return { id: conversation.npcCharacterId };
  }

  async updateConversation(_playthroughId: string, _conversationId: string, updates: any) {
    this.dirty = true;
    return updates;
  }

  async getConversations(_playthroughId: string, npcCharacterId?: string) {
    if (npcCharacterId) {
      return this.conversations.filter(c => c.npcCharacterId === npcCharacterId);
    }
    return this.conversations;
  }

  // ── Stateless API calls (still go to server) ─────────────────────────

  async startNpcNpcConversation(worldId: string, npc1Id: string, npc2Id: string, topic?: string): Promise<NpcConversationResult | null> {
    try {
      // Route through SDK if available
      const { getInsimulClient } = await import('@shared/game-engine/InsimulClientRegistry');
      const client = getInsimulClient();
      if (client) {
        return await client.simulateNpcConversation({ npc1Id, npc2Id, worldId, topic }) as any;
      }
      // Direct fetch fallback
      const res = await fetch(`${this.baseUrl}/api/worlds/${worldId}/npc-npc-conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...this.getHeaders() },
        body: JSON.stringify({ npc1Id, npc2Id, topic }),
      });
      return res.ok ? await res.json() : null;
    } catch { return null; }
  }

  async simulateRichConversation(worldId: string, char1Id: string, char2Id: string, turnCount?: number) {
    try {
      const { getInsimulClient } = await import('@shared/game-engine/InsimulClientRegistry');
      const client = getInsimulClient();
      if (client) {
        return await client.simulateRichConversation({ char1Id, char2Id, worldId, turnCount });
      }
      const res = await fetch(`${this.baseUrl}/api/conversations/simulate-rich`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...this.getHeaders() },
        body: JSON.stringify({ char1Id, char2Id, worldId, turnCount }),
      });
      return res.ok ? await res.json() : null;
    } catch { return null; }
  }

  async checkConversationHealth(_baseUrl?: string) { return true; }

  // ── Relationships & reputation (write to currentState) ───────────────

  async loadPlaythroughRelationships(_playthroughId: string) {
    return Object.entries(this.state.npcs.relationships).map(([npcId, rel]) => ({
      fromCharacterId: 'player',
      toCharacterId: npcId,
      ...rel,
    }));
  }

  async getReputations(_playthroughId: string) {
    return Object.entries(this.state.reputation.settlements).map(([settlementId, rep]) => ({
      settlementId,
      ...rep,
    }));
  }

  async updatePlaythroughRelationship(_playthroughId: string, _fromCharacterId: string, toCharacterId: string, data: any) {
    this.state.npcs.relationships[toCharacterId] = {
      ...this.state.npcs.relationships[toCharacterId],
      ...data,
    };
    this.dirty = true;
    this.trace('relationship_changed', `Relationship with ${toCharacterId} changed`, data);
    return data;
  }

  async adjustReputation(_playthroughId: string, entityType: string, entityId: string, amount: number, reason: string) {
    if (entityType === 'settlement') {
      if (!this.state.reputation.settlements[entityId]) {
        this.state.reputation.settlements[entityId] = { standing: 0, fines: 0, title: null };
      }
      this.state.reputation.settlements[entityId].standing += amount;
    }
    this.dirty = true;
    this.trace('reputation_adjusted', `Reputation ${amount > 0 ? '+' : ''}${amount} for ${entityType} ${entityId}: ${reason}`, { entityType, entityId, amount, reason });
    return { success: true };
  }

  async payFines(_playthroughId: string, settlementId: string) {
    if (this.state.reputation.settlements[settlementId]) {
      this.state.reputation.settlements[settlementId].fines = 0;
    }
    this.dirty = true;
    return { success: true };
  }

  // ── Language learning (write to currentState) ────────────────────────

  async loadLanguageProgress(_playerId: string, _worldId: string) { return this.state.languageProgress; }
  async saveLanguageProgress(data: any) {
    Object.assign(this.state.languageProgress, data.progress || {});
    if (data.vocabulary) this.state.languageProgress.vocabulary = data.vocabulary;
    if (data.grammarPatterns) this.state.languageProgress.grammarPatterns = data.grammarPatterns;
    this.dirty = true;
  }
  async getLanguageProfile(_worldId: string, _playerId: string) { return { cefrLevel: this.state.player.cefrLevel }; }
  async loadReadingProgress() { return null; }
  async syncReadingProgress(_data: any) {}

  // ── Assessment (TODO: fold into quest/Prolog system) ─────────────────

  async createAssessmentSession(data: any) {
    // TODO: Replace with Prolog quest initiation: quest_language(assessment_type, language).
    console.warn('[SaveFileDS] createAssessmentSession stubbed — TODO: integrate via Prolog');
    return { id: `stub-${Date.now()}`, ...data };
  }
  async submitAssessmentPhase(sessionId: string, phaseId: string, data: any) {
    // TODO: Replace with Prolog fact: phase_score(PlayerID, PhaseID, Score, MaxScore).
    console.warn('[SaveFileDS] submitAssessmentPhase stubbed — TODO: integrate via Prolog');
    return { sessionId, phaseId, ...data };
  }
  async completeAssessment(sessionId: string, data: any) {
    // TODO: Replace with Prolog fact: assessment_complete(PlayerID, SessionID, Score, CEFR).
    console.warn('[SaveFileDS] completeAssessment stubbed — TODO: integrate via Prolog');
    return { sessionId, ...data };
  }
  async getPlayerAssessments(_playerId: string, _worldId: string) { return []; }

  // ── Media (stateless — still goes to server) ─────────────────────────

  async textToSpeech(text: string, voice: string, gender: string, targetLanguage?: string | null): Promise<Blob | null> {
    try {
      // Route through SDK if available
      const { getInsimulClient } = await import('@shared/game-engine/InsimulClientRegistry');
      const client = getInsimulClient();
      if (client) {
        const buffer = await client.synthesizeSpeech(text, { voice, gender });
        return buffer ? new Blob([buffer], { type: 'audio/mp3' }) : null;
      }
      // Direct fetch fallback
      const res = await fetch(`${this.baseUrl}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...this.getHeaders() },
        body: JSON.stringify({ text, voice, gender, targetLanguage }),
      });
      return res.ok ? await res.blob() : null;
    } catch { return null; }
  }

  async resolveAssetById(_assetId: string): Promise<VisualAsset | null> { return null; }
  resolveAssetUrl(_assetId: string): string | null { return null; }
  async getPortfolio(_worldId: string, _playerName: string) { return null; }
}
