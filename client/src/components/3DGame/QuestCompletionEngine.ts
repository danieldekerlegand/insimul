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

  // collect_item / purchase
  itemName?: string;
  itemCount?: number;
  collectedCount?: number;

  // order_food / haggle_price (mercantile)
  merchantId?: string;
  businessType?: string;
  itemsPurchased?: string[];

  // talk_to_npc
  npcId?: string;
  npcName?: string;

  // vocabulary / conversation / pronunciation
  targetWords?: string[];
  wordsUsed?: string[];
  requiredCount?: number;
  currentCount?: number;

  // conversation_initiation
  npcInitiated?: boolean;
  responseQuality?: number;
  minResponseQuality?: number;

  // pronunciation_check scoring
  pronunciationScores?: number[];
  minAverageScore?: number;
  targetPhrases?: string[];

  // write_response / describe_scene
  writingPrompt?: string;
  writtenResponses?: string[];
  minWordCount?: number;

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

  // pronunciation (additional fields — pronunciationScores defined above)
  pronunciationBestScore?: number;
  targetPhrase?: string;

  // photograph_subject
  targetSubject?: string;
  targetCategory?: 'item' | 'npc' | 'building' | 'nature';
  targetActivity?: string;
  photographedSubjects?: string[];

  // teach_vocabulary / teach_phrase
  wordsTaught?: string[];
  phrasesTaught?: string[];

  // find_text / read_text
  textId?: string;
  textsFound?: string[];
  textsRead?: string[];

  // comprehension_quiz
  quizQuestions?: { question: string; correctAnswer: string; options?: string[] }[];
  quizAnswered?: number;
  quizCorrect?: number;
  quizPassThreshold?: number;

  // timed objectives
  timeLimitSeconds?: number;
  startedAt?: number;

  // dependency ordering — objective IDs that must be completed before this one
  dependsOn?: string[];
  // numeric order for simple sequential completion (lower = earlier)
  order?: number;
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
  | { type: 'location_discovery'; locationId: string; locationName?: string; questId?: string }
  | { type: 'arrival'; npcOrItemId: string; destinationReached: boolean; questId?: string }
  | { type: 'reputation_gain'; factionId: string; amount: number; questId?: string }
  | { type: 'listening_answer'; isCorrect: boolean; questId?: string }
  | { type: 'translation_attempt'; isCorrect: boolean; questId?: string }
  | { type: 'navigation_waypoint'; questId?: string }
  | { type: 'pronunciation_attempt'; passed: boolean; score?: number; phrase?: string; questId?: string }
  | { type: 'location_visit'; questId: string; objectiveId: string }
  | { type: 'objective_direct_complete'; questId: string; objectiveId: string }
  | { type: 'conversation_initiation'; npcId: string; accepted: boolean; responseQuality?: number; questId?: string }
  | { type: 'writing_submitted'; text: string; wordCount: number; questId?: string }
  | { type: 'teach_word'; npcId: string; word: string; questId?: string }
  | { type: 'teach_phrase_to_npc'; npcId: string; phrase: string; questId?: string }
  | { type: 'object_identified'; objectName: string; questId?: string }
  | { type: 'object_examined'; objectName: string; questId?: string }
  | { type: 'sign_read'; signId: string; questId?: string }
  | { type: 'object_pointed_and_named'; objectName: string; questId?: string }
  | { type: 'npc_conversation_turn'; npcId: string; topicTag?: string; questId?: string }
  | { type: 'gift_given'; npcId: string; itemName: string; questId?: string }
  | { type: 'direction_step_completed'; questId?: string }
  | { type: 'food_ordered'; itemName: string; merchantId: string; businessType: string; questId?: string }
  | { type: 'price_haggled'; itemName: string; merchantId: string; typedWord: string; questId?: string }
  | { type: 'text_found'; textId: string; textName: string; questId?: string }
  | { type: 'text_read'; textId: string; questId?: string }
  | { type: 'comprehension_answer'; isCorrect: boolean; questId?: string }
  | { type: 'photo_taken'; subjectName: string; subjectCategory: 'item' | 'npc' | 'building' | 'nature'; subjectActivity?: string; questId?: string }
  | { type: 'assessment_phase_completed'; phaseId: string; score: number; maxScore: number; questId: string; objectiveId: string };

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
        this.trackLocationVisit(event.locationId, event.locationName || event.locationId, event.questId);
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
      case 'conversation_initiation':
        this.trackConversationInitiation(event.npcId, event.accepted, event.responseQuality, event.questId);
        break;
      case 'writing_submitted':
        this.trackWritingSubmission(event.text, event.wordCount, event.questId);
        break;
      case 'teach_word':
        this.trackTeachWord(event.npcId, event.word, event.questId);
        break;
      case 'teach_phrase_to_npc':
        this.trackTeachPhrase(event.npcId, event.phrase, event.questId);
        break;
      case 'object_identified':
        this.trackObjectIdentified(event.objectName, event.questId);
        break;
      case 'object_examined':
        this.trackObjectExamined(event.objectName, event.questId);
        break;
      case 'sign_read':
        this.trackSignRead(event.signId, event.questId);
        break;
      case 'object_pointed_and_named':
        this.trackPointAndName(event.objectName, event.questId);
        break;
      case 'npc_conversation_turn':
        this.trackNpcConversationTurn(event.npcId, event.topicTag, event.questId);
        break;
      case 'gift_given':
        this.trackGiftGiven(event.npcId, event.itemName, event.questId);
        break;
      case 'direction_step_completed':
        this.trackDirectionStep(event.questId);
        break;
      case 'food_ordered':
        this.trackFoodOrdered(event.itemName, event.merchantId, event.businessType, event.questId);
        break;
      case 'price_haggled':
        this.trackPriceHaggled(event.itemName, event.merchantId, event.typedWord, event.questId);
        break;
      case 'text_found':
        this.trackTextFound(event.textId, event.textName, event.questId);
        break;
      case 'text_read':
        this.trackTextRead(event.textId, event.questId);
        break;
      case 'comprehension_answer':
        this.trackComprehensionAnswer(event.isCorrect, event.questId);
        break;
      case 'photo_taken':
        this.trackPhotoTaken(event.subjectName, event.subjectCategory, event.subjectActivity, event.questId);
        break;
      case 'assessment_phase_completed':
        this.completeObjective(event.questId, event.objectiveId);
        break;
    }
  }

  // ── Core completion logic ───────────────────────────────────────────────

  completeObjective(questId: string, objectiveId: string): boolean {
    const quest = this.quests.find(q => q.id === questId);
    if (!quest) return false;

    const objective = quest.objectives?.find(o => o.id === objectiveId);
    if (!objective || objective.completed) return false;

    if (this.isObjectiveLocked(quest, objective)) return false;

    objective.completed = true;
    this.onObjectiveCompleted?.(questId, objectiveId);

    const allComplete = quest.objectives?.every(o => o.completed);
    if (allComplete) {
      this.onQuestCompleted?.(questId);
    }

    return true;
  }

  /**
   * Check if an objective is locked due to unmet dependencies.
   * An objective is locked if:
   * 1. It has `dependsOn` IDs and any of those objectives are incomplete, OR
   * 2. It has an `order` value and any objective with a lower `order` is incomplete.
   */
  isObjectiveLocked(quest: CompletionQuest, objective: CompletionObjective): boolean {
    const objectives = quest.objectives || [];

    // Check explicit dependsOn
    if (objective.dependsOn && objective.dependsOn.length > 0) {
      for (const depId of objective.dependsOn) {
        const dep = objectives.find(o => o.id === depId);
        if (dep && !dep.completed) return true;
      }
    }

    // Check order-based sequencing
    if (objective.order != null) {
      for (const other of objectives) {
        if (other.id === objective.id) continue;
        if (other.order != null && other.order < objective.order && !other.completed) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get all currently available (unlocked, incomplete) objectives for a quest.
   */
  getAvailableObjectives(questId: string): CompletionObjective[] {
    const quest = this.quests.find(q => q.id === questId);
    if (!quest) return [];

    return (quest.objectives || []).filter(
      o => !o.completed && !this.isObjectiveLocked(quest, o),
    );
  }

  /**
   * Unified check: is a specific objective complete?
   * All UI components should use this instead of reading objective fields directly.
   */
  isObjectiveComplete(questId: string, objectiveId: string): boolean {
    const quest = this.quests.find(q => q.id === questId);
    if (!quest) return false;
    const objective = quest.objectives?.find(o => o.id === objectiveId);
    return !!objective?.completed;
  }

  /**
   * Check if all objectives for a quest are complete.
   */
  isQuestComplete(questId: string): boolean {
    const quest = this.quests.find(q => q.id === questId);
    if (!quest?.objectives?.length) return false;
    return quest.objectives.every(o => o.completed);
  }

  /**
   * Get all locked (incomplete, dependencies not met) objectives for a quest.
   */
  getLockedObjectives(questId: string): CompletionObjective[] {
    const quest = this.quests.find(q => q.id === questId);
    if (!quest) return [];

    return (quest.objectives || []).filter(
      o => !o.completed && this.isObjectiveLocked(quest, o),
    );
  }

  // ── Type-specific tracking methods ──────────────────────────────────────

  trackNPCConversation(npcId: string, questId?: string): void {
    this.forEachObjective(questId, 'talk_to_npc', (quest, obj) => {
      if (obj.npcId === npcId) {
        this.completeObjective(quest.id, obj.id);
      }
    });
  }

  trackConversationInitiation(npcId: string, accepted: boolean, responseQuality?: number, questId?: string): void {
    if (!accepted) return;

    this.forEachObjective(questId, 'conversation_initiation', (quest, obj) => {
      if (obj.npcId && obj.npcId !== npcId) return;

      obj.currentCount = (obj.currentCount || 0) + 1;

      if (responseQuality !== undefined) {
        obj.responseQuality = responseQuality;
      }

      const minQuality = obj.minResponseQuality ?? 0;
      const meetsQuality = (responseQuality ?? 100) >= minQuality;

      if (obj.currentCount >= (obj.requiredCount || 1) && meetsQuality) {
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

  trackLocationVisit(locationId: string, locationName: string, questId?: string): void {
    const lowerName = locationName.toLowerCase();
    const lowerId = locationId.toLowerCase();

    this.forEachObjective(questId, ['visit_location', 'discover_location'], (quest, obj) => {
      const objName = (obj.locationName || '').toLowerCase();
      if (!objName) return;

      // Match against zone ID, zone name, or check if either contains the other
      if (objName === lowerId || objName === lowerName ||
          lowerName.includes(objName) || objName.includes(lowerName)) {
        this.completeObjective(quest.id, obj.id);
      }
    });
  }

  /** @deprecated Use trackLocationVisit instead */
  trackLocationDiscovery(locationId: string, questId?: string): void {
    this.trackLocationVisit(locationId, locationId, questId);
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

  trackWritingSubmission(text: string, wordCount: number, questId?: string): void {
    this.forEachObjective(questId, ['write_response', 'describe_scene'], (quest, obj) => {
      if (!obj.writtenResponses) obj.writtenResponses = [];
      obj.writtenResponses.push(text);
      obj.currentCount = (obj.currentCount || 0) + 1;

      const minWords = obj.minWordCount || 0;
      if (minWords > 0 && wordCount < minWords) return;

      if (obj.currentCount >= (obj.requiredCount || 1)) {
        this.completeObjective(quest.id, obj.id);
      }
    });
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

  // ── Object interaction tracking ─────────────────────────────────────

  trackObjectIdentified(objectName: string, questId?: string): void {
    const lowerName = objectName.toLowerCase();

    this.forEachObjective(questId, 'identify_object', (quest, obj) => {
      obj.currentCount = (obj.currentCount || 0) + 1;
      if (obj.currentCount >= (obj.requiredCount || 1)) {
        this.completeObjective(quest.id, obj.id);
      }
    });
  }

  trackObjectExamined(objectName: string, questId?: string): void {
    this.forEachObjective(questId, 'examine_object', (quest, obj) => {
      obj.currentCount = (obj.currentCount || 0) + 1;
      if (obj.currentCount >= (obj.requiredCount || 1)) {
        this.completeObjective(quest.id, obj.id);
      }
    });
  }

  trackSignRead(signId: string, questId?: string): void {
    this.forEachObjective(questId, 'read_sign', (quest, obj) => {
      obj.currentCount = (obj.currentCount || 0) + 1;
      if (obj.currentCount >= (obj.requiredCount || 1)) {
        this.completeObjective(quest.id, obj.id);
      }
    });
  }

  trackPointAndName(objectName: string, questId?: string): void {
    this.forEachObjective(questId, 'point_and_name', (quest, obj) => {
      obj.currentCount = (obj.currentCount || 0) + 1;
      if (obj.currentCount >= (obj.requiredCount || 1)) {
        this.completeObjective(quest.id, obj.id);
      }
    });
  }

  // ── Conversation-based objective tracking ──────────────────────────

  /**
   * Track conversation turns with NPCs for objectives that complete through
   * sustained dialogue: ask_for_directions, order_food, haggle_price,
   * introduce_self, build_friendship.
   * The topicTag helps match the right objective type (e.g. 'directions', 'order', 'haggle', 'introduction').
   */
  trackNpcConversationTurn(npcId: string, topicTag?: string, questId?: string): void {
    // Map topic tags to objective types for targeted matching
    const tagToTypes: Record<string, string[]> = {
      directions: ['ask_for_directions'],
      order: ['order_food'],
      haggle: ['haggle_price'],
      introduction: ['introduce_self'],
      friendship: ['build_friendship'],
    };

    const targetTypes = topicTag && tagToTypes[topicTag]
      ? tagToTypes[topicTag]
      : ['ask_for_directions', 'order_food', 'haggle_price', 'introduce_self', 'build_friendship'];

    this.forEachObjective(questId, targetTypes, (quest, obj) => {
      if (obj.npcId && obj.npcId !== npcId) return;

      obj.currentCount = (obj.currentCount || 0) + 1;
      if (obj.currentCount >= (obj.requiredCount || 1)) {
        this.completeObjective(quest.id, obj.id);
      }
    });
  }

  trackGiftGiven(npcId: string, itemName: string, questId?: string): void {
    this.forEachObjective(questId, 'give_gift', (quest, obj) => {
      if (obj.npcId && obj.npcId !== npcId) return;
      this.completeObjective(quest.id, obj.id);
    });
  }

  trackDirectionStep(questId?: string): void {
    this.forEachObjective(questId, 'follow_directions', (quest, obj) => {
      obj.stepsCompleted = (obj.stepsCompleted || 0) + 1;
      obj.currentCount = obj.stepsCompleted;

      if (obj.stepsCompleted >= (obj.stepsRequired || obj.requiredCount || 1)) {
        this.completeObjective(quest.id, obj.id);
      }
    });
  }

  // ── Mercantile objective tracking ──────────────────────────────────

  trackFoodOrdered(itemName: string, merchantId: string, businessType: string, questId?: string): void {
    this.forEachObjective(questId, 'order_food', (quest, obj) => {
      if (obj.merchantId && obj.merchantId !== merchantId) return;

      obj.itemsPurchased = obj.itemsPurchased || [];
      obj.itemsPurchased.push(itemName);
      obj.currentCount = (obj.currentCount || 0) + 1;

      if (obj.currentCount >= (obj.requiredCount || 1)) {
        this.completeObjective(quest.id, obj.id);
      }
    });
  }

  trackPriceHaggled(itemName: string, merchantId: string, typedWord: string, questId?: string): void {
    this.forEachObjective(questId, 'haggle_price', (quest, obj) => {
      if (obj.merchantId && obj.merchantId !== merchantId) return;

      obj.currentCount = (obj.currentCount || 0) + 1;

      if (obj.currentCount >= (obj.requiredCount || 1)) {
        this.completeObjective(quest.id, obj.id);
      }
    });
  }

  // ── Text / reading / comprehension tracking ──────────────────────────

  trackTextFound(textId: string, textName: string, questId?: string): void {
    const lowerName = textName.toLowerCase();

    this.forEachObjective(questId, 'find_text', (quest, obj) => {
      const targetName = (obj.itemName || '').toLowerCase();
      if (targetName && targetName !== lowerName && targetName !== textId) return;

      obj.textsFound = obj.textsFound || [];
      if (obj.textsFound.includes(textId)) return;

      obj.textsFound.push(textId);
      obj.currentCount = (obj.currentCount || 0) + 1;

      if (obj.currentCount >= (obj.requiredCount || 1)) {
        this.completeObjective(quest.id, obj.id);
      }
    });
  }

  trackTextRead(textId: string, questId?: string): void {
    this.forEachObjective(questId, 'read_text', (quest, obj) => {
      if (obj.textId && obj.textId !== textId) return;

      obj.textsRead = obj.textsRead || [];
      if (obj.textsRead.includes(textId)) return;

      obj.textsRead.push(textId);
      obj.currentCount = (obj.currentCount || 0) + 1;

      if (obj.currentCount >= (obj.requiredCount || 1)) {
        this.completeObjective(quest.id, obj.id);
      }
    });
  }

  trackComprehensionAnswer(isCorrect: boolean, questId?: string): void {
    this.forEachObjective(questId, 'comprehension_quiz', (quest, obj) => {
      obj.quizAnswered = (obj.quizAnswered || 0) + 1;
      if (isCorrect) {
        obj.quizCorrect = (obj.quizCorrect || 0) + 1;
      }
      obj.currentCount = obj.quizCorrect || 0;

      const required = obj.requiredCount || obj.quizQuestions?.length || 3;
      const threshold = obj.quizPassThreshold ?? required;
      if (obj.quizCorrect! >= threshold) {
        this.completeObjective(quest.id, obj.id);
      }
    });
  }

  trackPhotoTaken(subjectName: string, subjectCategory: 'item' | 'npc' | 'building' | 'nature', subjectActivity?: string, questId?: string): void {
    const lowerName = subjectName.toLowerCase();
    const lowerActivity = subjectActivity?.toLowerCase();

    this.forEachObjective(questId, 'photograph_subject', (quest, obj) => {
      // If objective specifies a category, it must match
      if (obj.targetCategory && obj.targetCategory !== subjectCategory) return;

      // If objective specifies a target subject, it must match
      if (obj.targetSubject && obj.targetSubject.toLowerCase() !== lowerName) return;

      // If objective specifies a target activity, it must match
      if (obj.targetActivity) {
        if (!lowerActivity) return;
        if (!lowerActivity.includes(obj.targetActivity.toLowerCase())) return;
      }

      // Track unique subjects photographed (include activity in key for activity-specific objectives)
      const trackingKey = obj.targetActivity ? `${lowerName}:${lowerActivity}` : lowerName;
      obj.photographedSubjects = obj.photographedSubjects || [];
      if (obj.photographedSubjects.includes(trackingKey)) return;

      obj.photographedSubjects.push(trackingKey);
      obj.currentCount = (obj.currentCount || 0) + 1;

      if (obj.currentCount >= (obj.requiredCount || 1)) {
        this.completeObjective(quest.id, obj.id);
      }
    });
  }

  // ── Serialization ──────────────────────────────────────────────────────

  /** Progress-relevant fields that change at runtime and need persistence. */
  private static readonly PROGRESS_FIELDS: Array<keyof CompletionObjective> = [
    'completed', 'collectedCount', 'wordsUsed', 'currentCount',
    'npcInitiated', 'responseQuality', 'pronunciationScores',
    'pronunciationBestScore', 'writtenResponses', 'enemiesDefeated',
    'craftedCount', 'arrived', 'delivered', 'reputationGained',
    'questionsAnswered', 'questionsCorrect', 'translationsCompleted',
    'translationsCorrect', 'waypointsReached', 'stepsCompleted',
    'wordsTaught', 'phrasesTaught', 'startedAt', 'itemsPurchased',
    'textsFound', 'textsRead', 'quizAnswered', 'quizCorrect',
    'photographedSubjects',
  ];

  /**
   * Export mutable objective progress for all quests.
   * Returns a map of questId → array of { id, ...progressFields }.
   */
  serializeObjectiveStates(): Record<string, Array<Record<string, any>>> {
    const result: Record<string, Array<Record<string, any>>> = {};
    for (const quest of this.quests) {
      if (!quest.objectives?.length) continue;
      const objectiveStates: Array<Record<string, any>> = [];
      for (const obj of quest.objectives) {
        const state: Record<string, any> = { id: obj.id };
        let hasProgress = false;
        for (const field of QuestCompletionEngine.PROGRESS_FIELDS) {
          const value = obj[field];
          if (value !== undefined && value !== false && value !== null && value !== 0) {
            state[field] = value;
            hasProgress = true;
          }
        }
        if (hasProgress) {
          objectiveStates.push(state);
        }
      }
      if (objectiveStates.length > 0) {
        result[quest.id] = objectiveStates;
      }
    }
    return result;
  }

  /**
   * Restore objective progress from previously serialized state.
   * Merges saved progress into existing quest objectives by matching objective IDs.
   */
  restoreObjectiveStates(states: Record<string, Array<Record<string, any>>>): void {
    if (!states) return;
    for (const [questId, savedObjectives] of Object.entries(states)) {
      const quest = this.quests.find(q => q.id === questId);
      if (!quest?.objectives) continue;

      for (const saved of savedObjectives) {
        const obj = quest.objectives.find(o => o.id === saved.id);
        if (!obj) continue;
        for (const [key, value] of Object.entries(saved)) {
          if (key === 'id') continue;
          (obj as any)[key] = value;
        }
      }
    }
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

      // Snapshot eligible objectives before iteration so that completing
      // one objective within the callback doesn't immediately unlock the next.
      const eligible = (quest.objectives || []).filter(
        obj => !obj.completed && types.includes(obj.type) && !this.isObjectiveLocked(quest, obj),
      );

      for (const obj of eligible) {
        if (obj.completed) continue; // re-check in case a prior callback already completed it
        callback(quest, obj);
      }
    }
  }
}
