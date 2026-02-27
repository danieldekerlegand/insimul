/**
 * Language Progress Tracker
 *
 * Tracks vocabulary usage, grammar patterns, and fluency progression
 * during conversations in the 3D game. Integrates with the quest system
 * for language-learning objectives.
 */

import type { WorldLanguage } from '@shared/language';
import type { WorldLanguageContext } from '@shared/language-utils';
import {
  LanguageProgress,
  VocabularyEntry,
  VocabularyUsage,
  ConversationRecord,
  FluencyGainResult,
  GrammarPattern,
  GrammarFeedback,
  calculateMasteryLevel,
  calculateFluencyGain,
  parseGrammarFeedbackBlock,
} from '@shared/language-progress';

export class LanguageProgressTracker {
  private progress: LanguageProgress;
  private currentConversation: Partial<ConversationRecord> | null = null;
  private worldLanguageContext: WorldLanguageContext | null = null;

  // Per-conversation grammar counters
  private conversationGrammarCorrect: number = 0;
  private conversationGrammarErrors: number = 0;

  // Callbacks
  private onFluencyGain: ((result: FluencyGainResult) => void) | null = null;
  private onNewWordLearned: ((entry: VocabularyEntry) => void) | null = null;
  private onWordMastered: ((entry: VocabularyEntry) => void) | null = null;
  private onVocabularyUsed: ((usages: VocabularyUsage[]) => void) | null = null;
  private onGrammarFeedback: ((feedback: GrammarFeedback) => void) | null = null;

  constructor(playerId: string, worldId: string, language: string) {
    this.progress = {
      playerId,
      worldId,
      language,
      overallFluency: 0,
      vocabulary: [],
      grammarPatterns: [],
      conversations: [],
      totalConversations: 0,
      totalWordsLearned: 0,
      totalCorrectUsages: 0,
      streakDays: 0,
      lastActivityTimestamp: Date.now(),
    };
  }

  /**
   * Set the world language context for vocabulary matching
   */
  public setWorldLanguageContext(context: WorldLanguageContext): void {
    this.worldLanguageContext = context;
  }

  /**
   * Start tracking a new conversation
   */
  public startConversation(characterId: string, characterName: string): void {
    this.currentConversation = {
      id: `conv_${Date.now()}`,
      characterId,
      characterName,
      timestamp: Date.now(),
      turns: 0,
      wordsUsed: [],
      targetLanguagePercentage: 0,
      fluencyGained: 0,
      grammarErrorCount: 0,
      grammarCorrectCount: 0,
    };
    this.conversationGrammarCorrect = 0;
    this.conversationGrammarErrors = 0;
  }

  /**
   * Analyze a player message for target language vocabulary usage
   */
  public analyzePlayerMessage(message: string): VocabularyUsage[] {
    const usages: VocabularyUsage[] = [];

    if (!this.worldLanguageContext?.primaryLanguage) return usages;
    const language = this.worldLanguageContext.primaryLanguage;

    // Check against known vocabulary (from conlang sample words)
    if (language.sampleWords) {
      for (const [english, conlang] of Object.entries(language.sampleWords)) {
        if (message.toLowerCase().includes(conlang.toLowerCase())) {
          usages.push({
            word: conlang,
            meaning: english,
            usedCorrectly: true,
            category: this.categorizeWord(english),
          });
        }
      }
    }

    // Check against already-learned vocabulary
    for (const entry of this.progress.vocabulary) {
      if (message.toLowerCase().includes(entry.word.toLowerCase())) {
        const alreadyCounted = usages.some(u => u.word === entry.word);
        if (!alreadyCounted) {
          usages.push({
            word: entry.word,
            meaning: entry.meaning,
            usedCorrectly: true,
          });
        }
      }
    }

    // Update tracking
    if (usages.length > 0) {
      this.recordVocabularyUsage(usages);
      this.onVocabularyUsed?.(usages);
    }

    // Update conversation
    if (this.currentConversation) {
      this.currentConversation.turns = (this.currentConversation.turns || 0) + 1;
      for (const usage of usages) {
        if (!this.currentConversation.wordsUsed?.includes(usage.word)) {
          this.currentConversation.wordsUsed?.push(usage.word);
        }
      }
    }

    return usages;
  }

  /**
   * Analyze an NPC response to extract new vocabulary for the player to learn
   */
  public analyzeNPCResponse(response: string): VocabularyEntry[] {
    const newWords: VocabularyEntry[] = [];

    if (!this.worldLanguageContext?.primaryLanguage) return newWords;
    const language = this.worldLanguageContext.primaryLanguage;

    if (language.sampleWords) {
      for (const [english, conlang] of Object.entries(language.sampleWords)) {
        if (response.includes(conlang)) {
          // Check if player already knows this word
          const existing = this.progress.vocabulary.find(v => v.word === conlang);
          if (existing) {
            existing.timesEncountered++;
            existing.lastEncountered = Date.now();
            existing.context = this.extractContext(response, conlang);
            existing.masteryLevel = calculateMasteryLevel(
              existing.timesEncountered,
              existing.timesUsedCorrectly
            );
          } else {
            // New word encountered
            const entry: VocabularyEntry = {
              word: conlang,
              language: language.name,
              meaning: english,
              category: this.categorizeWord(english),
              timesEncountered: 1,
              timesUsedCorrectly: 0,
              timesUsedIncorrectly: 0,
              lastEncountered: Date.now(),
              masteryLevel: 'new',
              context: this.extractContext(response, conlang),
            };
            this.progress.vocabulary.push(entry);
            this.progress.totalWordsLearned++;
            newWords.push(entry);
            this.onNewWordLearned?.(entry);
          }
        }
      }
    }

    return newWords;
  }

  /**
   * Parse the structured grammar feedback block from an NPC response.
   * Returns the feedback data and the cleaned response with the block removed.
   */
  public parseGrammarFeedback(response: string): { feedback: GrammarFeedback | null; cleanedResponse: string } {
    return parseGrammarFeedbackBlock(response);
  }

  /**
   * Record grammar feedback and update grammar pattern tracking
   */
  public recordGrammarFeedback(feedback: GrammarFeedback): void {
    if (feedback.status === 'no_target_language') return;

    if (feedback.status === 'correct') {
      this.conversationGrammarCorrect++;
      this.trackGrammarPattern('general_correctness', true, '');
    } else if (feedback.status === 'corrected') {
      this.conversationGrammarErrors += feedback.errorCount;

      // Track individual grammar patterns
      for (const error of feedback.errors) {
        this.trackGrammarPattern(error.pattern, false, error.incorrect);
      }
    }

    this.onGrammarFeedback?.(feedback);
  }

  /**
   * Record vocabulary usage and update mastery
   */
  private recordVocabularyUsage(usages: VocabularyUsage[]): void {
    for (const usage of usages) {
      let entry = this.progress.vocabulary.find(v => v.word === usage.word);

      if (!entry) {
        entry = {
          word: usage.word,
          language: this.progress.language,
          meaning: usage.meaning,
          category: usage.category,
          timesEncountered: 1,
          timesUsedCorrectly: 0,
          timesUsedIncorrectly: 0,
          lastEncountered: Date.now(),
          masteryLevel: 'new',
        };
        this.progress.vocabulary.push(entry);
        this.progress.totalWordsLearned++;
      }

      entry.timesEncountered++;
      entry.lastEncountered = Date.now();

      if (usage.usedCorrectly) {
        entry.timesUsedCorrectly++;
        this.progress.totalCorrectUsages++;
      } else {
        entry.timesUsedIncorrectly++;
      }

      const oldMastery = entry.masteryLevel;
      entry.masteryLevel = calculateMasteryLevel(
        entry.timesEncountered,
        entry.timesUsedCorrectly
      );

      if (oldMastery !== 'mastered' && entry.masteryLevel === 'mastered') {
        this.onWordMastered?.(entry);
      }
    }
  }

  /**
   * Track a grammar pattern (correct or incorrect usage)
   */
  private trackGrammarPattern(patternName: string, correct: boolean, example: string): void {
    const language = this.progress.language;
    let pattern = this.progress.grammarPatterns.find(
      p => p.pattern === patternName && p.language === language
    );

    if (!pattern) {
      pattern = {
        id: `gp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        pattern: patternName,
        language,
        timesUsedCorrectly: 0,
        timesUsedIncorrectly: 0,
        mastered: false,
        examples: [],
      };
      this.progress.grammarPatterns.push(pattern);
    }

    if (correct) {
      pattern.timesUsedCorrectly++;
    } else {
      pattern.timesUsedIncorrectly++;
    }

    // Add example (keep last 5)
    if (example && !pattern.examples.includes(example)) {
      pattern.examples.push(example);
      if (pattern.examples.length > 5) {
        pattern.examples.shift();
      }
    }

    // Check mastery: correct >= 10 times and accuracy >= 80%
    const total = pattern.timesUsedCorrectly + pattern.timesUsedIncorrectly;
    pattern.mastered = pattern.timesUsedCorrectly >= 10 &&
                       (pattern.timesUsedCorrectly / total) >= 0.8;
  }

  /**
   * End the current conversation and calculate fluency gain
   */
  public endConversation(): FluencyGainResult | null {
    if (!this.currentConversation) return null;

    const conv = this.currentConversation as ConversationRecord;
    const turns = conv.turns || 0;
    const wordsUsed = conv.wordsUsed?.length || 0;

    // Calculate target language usage percentage
    conv.targetLanguagePercentage = turns > 0 ? Math.min(100, (wordsUsed / turns) * 50) : 0;

    // Calculate grammar score (0.0-1.0)
    const totalGrammarTurns = this.conversationGrammarCorrect + this.conversationGrammarErrors;
    const grammarScore = totalGrammarTurns > 0
      ? this.conversationGrammarCorrect / totalGrammarTurns
      : 1.0; // Default to 1.0 if no target language was used (no penalty)

    // Store grammar stats on conversation record
    conv.grammarErrorCount = this.conversationGrammarErrors;
    conv.grammarCorrectCount = this.conversationGrammarCorrect;

    // Calculate fluency gain
    const result = calculateFluencyGain(
      this.progress.overallFluency,
      wordsUsed,
      grammarScore,
      turns,
      conv.targetLanguagePercentage
    );

    this.progress.overallFluency = result.newFluency;
    conv.fluencyGained = result.gain;

    // Save conversation
    this.progress.conversations.push(conv);
    this.progress.totalConversations++;
    this.progress.lastActivityTimestamp = Date.now();

    // Reset per-conversation grammar counters
    this.conversationGrammarCorrect = 0;
    this.conversationGrammarErrors = 0;

    this.currentConversation = null;
    this.onFluencyGain?.(result);

    return result;
  }

  /**
   * Extract a short context snippet around a word
   */
  private extractContext(text: string, word: string): string {
    const idx = text.toLowerCase().indexOf(word.toLowerCase());
    if (idx === -1) return '';

    const start = Math.max(0, idx - 30);
    const end = Math.min(text.length, idx + word.length + 30);
    let snippet = text.substring(start, end);

    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';

    return snippet;
  }

  /**
   * Categorize a word based on its English meaning
   */
  private categorizeWord(englishMeaning: string): string {
    const lower = englishMeaning.toLowerCase();
    const categories: [string, string[]][] = [
      ['greetings', ['hello', 'hi', 'goodbye', 'bye', 'welcome', 'greetings']],
      ['numbers', ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'number']],
      ['food', ['food', 'eat', 'drink', 'water', 'bread', 'fruit', 'meat', 'hungry', 'thirsty']],
      ['family', ['mother', 'father', 'sister', 'brother', 'family', 'child', 'parent']],
      ['nature', ['tree', 'river', 'mountain', 'sky', 'sun', 'moon', 'star', 'forest', 'ocean']],
      ['body', ['hand', 'head', 'eye', 'heart', 'arm', 'leg', 'mouth', 'ear']],
      ['emotions', ['happy', 'sad', 'angry', 'love', 'fear', 'joy', 'hope']],
      ['actions', ['go', 'come', 'run', 'walk', 'speak', 'see', 'hear', 'give', 'take', 'make']],
      ['colors', ['red', 'blue', 'green', 'yellow', 'black', 'white', 'color']],
      ['time', ['day', 'night', 'morning', 'evening', 'today', 'tomorrow', 'yesterday']],
    ];

    for (const [category, keywords] of categories) {
      if (keywords.some(k => lower.includes(k))) {
        return category;
      }
    }

    return 'general';
  }

  // -- Getters --

  public getProgress(): LanguageProgress { return { ...this.progress }; }
  public getFluency(): number { return this.progress.overallFluency; }
  public getVocabulary(): VocabularyEntry[] { return [...this.progress.vocabulary]; }
  public getTotalWordsLearned(): number { return this.progress.totalWordsLearned; }

  public getVocabularyByMastery(level: VocabularyEntry['masteryLevel']): VocabularyEntry[] {
    return this.progress.vocabulary.filter(v => v.masteryLevel === level);
  }

  public getVocabularyByCategory(category: string): VocabularyEntry[] {
    return this.progress.vocabulary.filter(v => v.category === category);
  }

  public getRecentConversations(count: number = 5): ConversationRecord[] {
    return this.progress.conversations.slice(-count);
  }

  public getGrammarPatterns(): GrammarPattern[] {
    return [...this.progress.grammarPatterns];
  }

  public getWeakGrammarPatterns(): GrammarPattern[] {
    return this.progress.grammarPatterns
      .filter(p => !p.mastered && p.timesUsedIncorrectly > 0)
      .sort((a, b) => b.timesUsedIncorrectly - a.timesUsedIncorrectly);
  }

  /**
   * Export progress for saving
   */
  public exportProgress(): string {
    return JSON.stringify(this.progress);
  }

  /**
   * Import progress from save
   */
  public importProgress(json: string): void {
    try {
      this.progress = JSON.parse(json);
    } catch (e) {
      console.error('[LanguageProgressTracker] Failed to import progress:', e);
    }
  }

  // Callback setters
  public setOnFluencyGain(cb: (result: FluencyGainResult) => void): void { this.onFluencyGain = cb; }
  public setOnNewWordLearned(cb: (entry: VocabularyEntry) => void): void { this.onNewWordLearned = cb; }
  public setOnWordMastered(cb: (entry: VocabularyEntry) => void): void { this.onWordMastered = cb; }
  public setOnVocabularyUsed(cb: (usages: VocabularyUsage[]) => void): void { this.onVocabularyUsed = cb; }
  public setOnGrammarFeedback(cb: (feedback: GrammarFeedback) => void): void { this.onGrammarFeedback = cb; }

  /**
   * Dispose
   */
  public dispose(): void {
    this.currentConversation = null;
    this.worldLanguageContext = null;
  }
}
