/**
 * Quest Completion Engine
 *
 * Unified, pure-logic engine for quest objective completion detection.
 * Centralizes all objective progress tracking and completion checking
 * with no Babylon.js or rendering dependencies.
 *
 * QuestObjectManager delegates all completion logic here, keeping only
 * scene/visual concerns (mesh spawning, animations, proximity checks).
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface CompletionObjective {
  id: string;
  questId: string;
  type: string;
  description: string;
  completed: boolean;

  // collect_item
  itemName?: string;
  itemCount?: number;
  collectedCount?: number;

  // talk_to_npc
  npcId?: string;
  npcName?: string;

  // vocabulary / conversation / pronunciation
  targetWords?: string[];
  wordsUsed?: string[];
  requiredCount?: number;
  currentCount?: number;

  // pronunciation_check scoring
  pronunciationScores?: number[];
  minAverageScore?: number;
  targetPhrases?: string[];

  // defeat_enemies
  enemyType?: string;
  enemiesDefeated?: number;
  enemiesRequired?: number;

  // craft_item
  craftedItemId?: string;
  craftedCount?: number;

  // escort / deliver
  escortNpcId?: string;
  arrived?: boolean;
  delivered?: boolean;

  // reputation
  factionId?: string;
  reputationGained?: number;
  reputationRequired?: number;

  // listening_comprehension
  comprehensionQuestions?: { question: string; correctAnswer: string }[];
  questionsAnswered?: number;
  questionsCorrect?: number;

  // translation_challenge
  translationPhrases?: { source: string; expected: string; language: string }[];
  translationsCompleted?: number;
  translationsCorrect?: number;

  // navigate_language
  navigationWaypoints?: { instruction: string; targetPosition?: any }[];
  waypointsReached?: number;
  stepsCompleted?: number;
  stepsRequired?: number;

  // location
  locationName?: string;

  // deliver_item
  itemId?: string;

  // pronunciation
  pronunciationScores?: number[];
  pronunciationBestScore?: number;
  targetPhrase?: string;

  // teach_vocabulary / teach_phrase
  wordsTaught?: string[];
  phrasesTaught?: string[];

  // timed objectives
  timeLimitSeconds?: number;
  startedAt?: number;
}

export interface CompletionQuest {
  id: string;
  objectives?: CompletionObjective[];
}

export type ObjectiveCompletedCallback = (questId: string, objectiveId: string) => void;
export type QuestCompletedCallback = (questId: string) => void;

// ── Event types for trackEvent dispatch ──────────────────────────────────────

export type CompletionEvent =
  | { type: 'npc_conversation'; npcId: string; questId?: string }
  | { type: 'vocabulary_usage'; word: string; questId?: string }
  | { type: 'conversation_turn'; keywords: string[]; questId?: string }
  | { type: 'collect_item_by_name'; itemName: string; questId?: string }
  | { type: 'item_delivery'; npcId: string; playerItemNames: string[]; questId?: string }
  | { type: 'inventory_check'; playerItemNames: string[]; questId?: string }
  | { type: 'enemy_defeat'; enemyType: string; questId?: string }
  | { type: 'item_crafted'; itemId: string; questId?: string }
  | { type: 'location_discovery'; locationId: string; questId?: string }
  | { type: 'arrival'; npcOrItemId: string; destinationReached: boolean; questId?: string }
  | { type: 'reputation_gain'; factionId: string; amount: number; questId?: string }
  | { type: 'listening_answer'; isCorrect: boolean; questId?: string }
  | { type: 'translation_attempt'; isCorrect: boolean; questId?: string }
  | { type: 'navigation_waypoint'; questId?: string }
  | { type: 'pronunciation_attempt'; passed: boolean; score?: number; phrase?: string; questId?: string }
  | { type: 'location_visit'; questId: string; objectiveId: string }
  | { type: 'objective_direct_complete'; questId: string; objectiveId: string }
  | { type: 'teach_word'; npcId: string; word: string; questId?: string }
  | { type: 'teach_phrase_to_npc'; npcId: string; phrase: string; questId?: string };

// ── Engine ───────────────────────────────────────────────────────────────────

export class QuestCompletionEngine {
  private quests: CompletionQuest[] = [];
  private onObjectiveCompleted: ObjectiveCompletedCallback | null = null;
  private onQuestCompleted: QuestCompletedCallback | null = null;

  // ── Quest management ────────────────────────────────────────────────────

  addQuest(quest: CompletionQuest): void {
    this.quests.push(quest);
  }

  removeQuest(questId: string): void {
    const idx = this.quests.findIndex(q => q.id === questId);
    if (idx !== -1) this.quests.splice(idx, 1);
  }

  getQuests(): CompletionQuest[] {
    return this.quests;
  }

  clear(): void {
    this.quests = [];
  }

  // ── Callbacks ───────────────────────────────────────────────────────────

  setOnObjectiveCompleted(cb: ObjectiveCompletedCallback): void {
    this.onObjectiveCompleted = cb;
  }

  setOnQuestCompleted(cb: QuestCompletedCallback): void {
    this.onQuestCompleted = cb;
  }

  // ── Unified event dispatch ──────────────────────────────────────────────

  trackEvent(event: CompletionEvent): void {
    switch (event.type) {
      case 'npc_conversation':
        this.trackNPCConversation(event.npcId, event.questId);
        break;
      case 'vocabulary_usage':
        this.trackVocabularyUsage(event.word, event.questId);
        break;
      case 'conversation_turn':
        this.trackConversationTurn(event.keywords, event.questId);
        break;
      case 'collect_item_by_name':
        this.trackCollectedItemByName(event.itemName, event.questId);
        break;
      case 'item_delivery':
        this.trackItemDelivery(event.npcId, event.playerItemNames, event.questId);
        break;
      case 'inventory_check':
        this.checkInventoryObjectives(event.playerItemNames, event.questId);
        break;
      case 'enemy_defeat':
        this.trackEnemyDefeat(event.enemyType, event.questId);
        break;
      case 'item_crafted':
        this.trackItemCrafted(event.itemId, event.questId);
        break;
      case 'location_discovery':
        this.trackLocationDiscovery(event.locationId, event.questId);
        break;
      case 'arrival':
        this.trackArrival(event.npcOrItemId, event.destinationReached, event.questId);
        break;
      case 'reputation_gain':
        this.trackReputationGain(event.factionId, event.amount, event.questId);
        break;
      case 'listening_answer':
        this.trackListeningAnswer(event.isCorrect, event.questId);
        break;
      case 'translation_attempt':
        this.trackTranslationAttempt(event.isCorrect, event.questId);
        break;
      case 'navigation_waypoint':
        this.trackNavigationWaypoint(event.questId);
        break;
      case 'pronunciation_attempt':
        this.trackPronunciationAttempt(event.passed, event.questId, event.score, event.phrase);
        break;
      case 'location_visit':
        this.completeObjective(event.questId, event.objectiveId);
        break;
      case 'objective_direct_complete':
        this.completeObjective(event.questId, event.objectiveId);
        break;
      case 'teach_word':
        this.trackTeachWord(event.npcId, event.word, event.questId);
        break;
      case 'teach_phrase_to_npc':
        this.trackTeachPhrase(event.npcId, event.phrase, event.questId);
        break;
    }
  }

  // ── Core completion logic ───────────────────────────────────────────────

  completeObjective(questId: string, objectiveId: string): boolean {
    const quest = this.quests.find(q => q.id === questId);
    if (!quest) return false;

    const objective = quest.objectives?.find(o => o.id === objectiveId);
    if (!objective || objective.completed) return false;

    objective.completed = true;
    this.onObjectiveCompleted?.(questId, objectiveId);

    const allComplete = quest.objectives?.every(o => o.completed);
    if (allComplete) {
      this.onQuestCompleted?.(questId);
    }

    return true;
  }

  // ── Type-specific tracking methods ──────────────────────────────────────

  trackNPCConversation(npcId: string, questId?: string): void {
    this.forEachObjective(questId, 'talk_to_npc', (quest, obj) => {
      if (obj.npcId === npcId) {
        this.completeObjective(quest.id, obj.id);
      }
    });
  }

  trackVocabularyUsage(word: string, questId?: string): void {
    const lowerWord = word.toLowerCase();

    this.forEachObjective(questId, ['use_vocabulary', 'collect_vocabulary'], (quest, obj) => {
      if (obj.targetWords && obj.targetWords.length > 0) {
        if (!obj.targetWords.includes(lowerWord)) return;
      }

      obj.wordsUsed = obj.wordsUsed || [];
      if (obj.wordsUsed.includes(lowerWord)) return;

      obj.wordsUsed.push(lowerWord);
      obj.currentCount = (obj.currentCount || 0) + 1;

      if (obj.currentCount >= (obj.requiredCount || 10)) {
        this.completeObjective(quest.id, obj.id);
      }
    });
  }

  trackConversationTurn(keywords: string[], questId?: string): void {
    this.forEachObjective(questId, 'complete_conversation', (quest, obj) => {
      obj.currentCount = (obj.currentCount || 0) + 1;

      if (obj.currentCount >= (obj.requiredCount || 5)) {
        this.completeObjective(quest.id, obj.id);
      }
    });
  }

  trackCollectedItemByName(itemName: string, questId?: string): void {
    const key = itemName.toLowerCase();

    this.forEachObjective(questId, 'collect_item', (quest, obj) => {
      const objName = (obj.itemName || '').toLowerCase();
      if (objName && objName === key) {
        this.completeObjective(quest.id, obj.id);
      }
    });
  }

  trackItemDelivery(npcId: string, playerItemNames: string[], questId?: string): void {
    const normalizedItems = playerItemNames.map(n => n.toLowerCase());

    this.forEachObjective(questId, 'deliver_item', (quest, obj) => {
      const matchesNpc = obj.npcId === npcId || !obj.npcId;
      const matchesItem = obj.itemName &&
        normalizedItems.includes(obj.itemName.toLowerCase());

      if (matchesNpc && matchesItem) {
        obj.delivered = true;
        this.completeObjective(quest.id, obj.id);
      }
    });
  }

  checkInventoryObjectives(playerItemNames: string[], questId?: string): void {
    const normalizedItems = playerItemNames.map(n => n.toLowerCase());

    this.forEachObjective(questId, ['collect_item', 'collect_items'], (quest, obj) => {
      const objName = (obj.itemName || '').toLowerCase();
      if (objName && normalizedItems.includes(objName)) {
        this.completeObjective(quest.id, obj.id);
      }
    });
  }

  trackEnemyDefeat(enemyType: string, questId?: string): void {
    this.forEachObjective(questId, 'defeat_enemies', (quest, obj) => {
      if (obj.enemyType === enemyType || !obj.enemyType) {
        obj.enemiesDefeated = (obj.enemiesDefeated || 0) + 1;

        if (obj.enemiesDefeated >= (obj.enemiesRequired || 1)) {
          this.completeObjective(quest.id, obj.id);
        }
      }
    });
  }

  trackItemCrafted(itemId: string, questId?: string): void {
    this.forEachObjective(questId, 'craft_item', (quest, obj) => {
      if (obj.craftedItemId === itemId) {
        obj.craftedCount = (obj.craftedCount || 0) + 1;

        if (obj.craftedCount >= (obj.requiredCount || 1)) {
          this.completeObjective(quest.id, obj.id);
        }
      }
    });
  }

  trackLocationDiscovery(locationId: string, questId?: string): void {
    this.forEachObjective(questId, 'discover_location', (quest, obj) => {
      if (obj.locationName === locationId) {
        this.completeObjective(quest.id, obj.id);
      }
    });
  }

  trackArrival(npcOrItemId: string, destinationReached: boolean, questId?: string): void {
    this.forEachObjective(questId, ['escort_npc', 'deliver_item'], (quest, obj) => {
      if (destinationReached) {
        if (obj.type === 'escort_npc') {
          obj.arrived = true;
        } else {
          obj.delivered = true;
        }
        this.completeObjective(quest.id, obj.id);
      }
    });
  }

  trackReputationGain(factionId: string, amount: number, questId?: string): void {
    this.forEachObjective(questId, 'gain_reputation', (quest, obj) => {
      if (obj.factionId === factionId) {
        obj.reputationGained = (obj.reputationGained || 0) + amount;

        if (obj.reputationGained >= (obj.reputationRequired || 100)) {
          this.completeObjective(quest.id, obj.id);
        }
      }
    });
  }

  trackListeningAnswer(isCorrect: boolean, questId?: string): void {
    this.forEachObjective(questId, 'listening_comprehension', (quest, obj) => {
      obj.questionsAnswered = (obj.questionsAnswered || 0) + 1;
      if (isCorrect) {
        obj.questionsCorrect = (obj.questionsCorrect || 0) + 1;
      }
      obj.currentCount = obj.questionsAnswered;

      const required = obj.requiredCount || obj.comprehensionQuestions?.length || 3;
      if (obj.questionsCorrect! >= required) {
        this.completeObjective(quest.id, obj.id);
      }
    });
  }

  trackTranslationAttempt(isCorrect: boolean, questId?: string): void {
    this.forEachObjective(questId, 'translation_challenge', (quest, obj) => {
      if (isCorrect) {
        obj.translationsCorrect = (obj.translationsCorrect || 0) + 1;
      }
      obj.translationsCompleted = (obj.translationsCompleted || 0) + 1;
      obj.currentCount = obj.translationsCorrect || 0;

      const required = obj.requiredCount || obj.translationPhrases?.length || 3;
      if (obj.translationsCorrect! >= required) {
        this.completeObjective(quest.id, obj.id);
      }
    });
  }

  trackNavigationWaypoint(questId?: string): { nextWaypointIndex: number; completed: boolean; objective?: CompletionObjective } | null {
    let result: { nextWaypointIndex: number; completed: boolean; objective?: CompletionObjective } | null = null;

    this.forEachObjective(questId, 'navigate_language', (quest, obj) => {
      obj.waypointsReached = (obj.waypointsReached || 0) + 1;
      obj.stepsCompleted = obj.waypointsReached;

      const waypoints = obj.navigationWaypoints || [];
      const nextIdx = obj.waypointsReached;

      if (nextIdx >= (obj.stepsRequired || waypoints.length)) {
        this.completeObjective(quest.id, obj.id);
        result = { nextWaypointIndex: nextIdx, completed: true, objective: obj };
      } else {
        result = { nextWaypointIndex: nextIdx, completed: false, objective: obj };
      }
    });

    return result;
  }

  trackPronunciationAttempt(passed: boolean, questId?: string, score?: number, phrase?: string): void {
    const pronunciationTypes = ['pronunciation_check', 'listen_and_repeat', 'speak_phrase'];

    this.forEachObjective(questId, pronunciationTypes, (quest, obj) => {
      // Store pronunciation score data
      if (score !== undefined) {
        if (!obj.pronunciationScores) obj.pronunciationScores = [];
        obj.pronunciationScores.push(score);
        if (score > (obj.pronunciationBestScore ?? 0)) {
          obj.pronunciationBestScore = score;
        }
      }

      if (passed) {
        obj.currentCount = (obj.currentCount || 0) + 1;

        const required = obj.requiredCount || 3;
        if (obj.currentCount >= required) {
          // If minAverageScore is set, check average before completing
          const scores = obj.pronunciationScores || [];
          if (obj.minAverageScore && obj.minAverageScore > 0 && scores.length > 0) {
            const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
            if (avg >= obj.minAverageScore) {
              this.completeObjective(quest.id, obj.id);
            }
          } else {
            this.completeObjective(quest.id, obj.id);
          }
        }
      }
    });
  }

  getPronunciationStats(questId: string, objectiveId: string): { scores: number[]; average: number; passed: number } | null {
    const quest = this.quests.find(q => q.id === questId);
    const obj = quest?.objectives?.find(o => o.id === objectiveId);
    if (!obj || obj.type !== 'pronunciation_check') return null;

    const scores = obj.pronunciationScores || [];
    const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return { scores, average, passed: scores.length };
  }

  // ── Timed objectives ────────────────────────────────────────────────────

  checkTimedObjectives(): string[] {
    const expired: string[] = [];
    const now = Date.now();

    for (const quest of this.quests) {
      for (const obj of quest.objectives || []) {
        if (obj.completed) continue;
        if (!obj.timeLimitSeconds || !obj.startedAt) continue;

        const elapsedSec = (now - obj.startedAt) / 1000;
        if (elapsedSec > obj.timeLimitSeconds) {
          obj.completed = true;
          expired.push(`Time expired: ${obj.description}`);
        }
      }
    }

    return expired;
  }

  getObjectiveTimeRemaining(objectiveId: string): number | null {
    for (const quest of this.quests) {
      const obj = quest.objectives?.find(o => o.id === objectiveId);
      if (obj?.timeLimitSeconds && obj.startedAt) {
        const elapsed = (Date.now() - obj.startedAt) / 1000;
        return Math.max(0, obj.timeLimitSeconds - elapsed);
      }
    }
    return null;
  }

  // ── Teaching tracking ──────────────────────────────────────────────────

  trackTeachWord(npcId: string, word: string, questId?: string): void {
    const lowerWord = word.toLowerCase();

    this.forEachObjective(questId, 'teach_vocabulary', (quest, obj) => {
      if (obj.npcId && obj.npcId !== npcId) return;

      obj.wordsTaught = obj.wordsTaught || [];
      if (obj.wordsTaught.includes(lowerWord)) return;

      obj.wordsTaught.push(lowerWord);
      obj.currentCount = (obj.currentCount || 0) + 1;

      if (obj.currentCount >= (obj.requiredCount || 3)) {
        this.completeObjective(quest.id, obj.id);
      }
    });
  }

  trackTeachPhrase(npcId: string, phrase: string, questId?: string): void {
    const lowerPhrase = phrase.toLowerCase();

    this.forEachObjective(questId, 'teach_phrase', (quest, obj) => {
      if (obj.npcId && obj.npcId !== npcId) return;

      obj.phrasesTaught = obj.phrasesTaught || [];
      if (obj.phrasesTaught.includes(lowerPhrase)) return;

      obj.phrasesTaught.push(lowerPhrase);
      obj.currentCount = (obj.currentCount || 0) + 1;

      if (obj.currentCount >= (obj.requiredCount || 1)) {
        this.completeObjective(quest.id, obj.id);
      }
    });
  }

  // ── Internal helper ─────────────────────────────────────────────────────

  private forEachObjective(
    questId: string | undefined,
    type: string | string[],
    callback: (quest: CompletionQuest, objective: CompletionObjective) => void,
  ): void {
    const types = Array.isArray(type) ? type : [type];

    for (const quest of this.quests) {
      if (questId && quest.id !== questId) continue;

      for (const obj of quest.objectives || []) {
        if (obj.completed) continue;
        if (!types.includes(obj.type)) continue;
        callback(quest, obj);
      }
    }
  }
}
