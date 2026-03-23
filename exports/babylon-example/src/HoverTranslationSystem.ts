/**
 * HoverTranslationSystem
 *
 * Manages hover-to-translate functionality for target-language text in the game.
 * Stores vocabulary hints from NPC responses and provides translations when
 * the player hovers over individual words in the chat panel.
 *
 * Works with BabylonChatPanel to:
 *  1. Store vocab hints extracted from NPC metadata
 *  2. Look up translations for individual words
 *  3. Fetch on-demand translations for unknown words via API
 */

export interface VocabHint {
  word: string;
  translation: string;
  context?: string;
}

export interface TranslationResult {
  word: string;
  translation: string;
  context?: string;
  source: 'vocab_hint' | 'cache' | 'api';
}

export class HoverTranslationSystem {
  /** word (lowercase) → translation info */
  private _translations: Map<string, VocabHint> = new Map();
  /** In-flight API requests to avoid duplicate fetches */
  private _pendingRequests: Map<string, Promise<TranslationResult | null>> = new Map();
  private _targetLanguage: string | null = null;

  setTargetLanguage(lang: string): void {
    this._targetLanguage = lang;
  }

  getTargetLanguage(): string | null {
    return this._targetLanguage;
  }

  /**
   * Ingest vocab hints from the metadata extraction endpoint.
   * Each hint is { word, translation, context }.
   */
  addVocabHints(hints: VocabHint[]): void {
    for (const hint of hints) {
      if (!hint.word || !hint.translation) continue;
      this._translations.set(this.normalizeWord(hint.word), hint);
    }
  }

  /**
   * Look up a cached translation for a word. Returns null if not found.
   */
  getTranslation(word: string): VocabHint | null {
    return this._translations.get(this.normalizeWord(word)) ?? null;
  }

  /**
   * Get all stored translations.
   */
  getAllTranslations(): Map<string, VocabHint> {
    return new Map(this._translations);
  }

  /**
   * Fetch a translation from the server API. Caches the result.
   * Returns null if the API call fails or the language is not set.
   */
  async fetchTranslation(word: string): Promise<TranslationResult | null> {
    const normalized = this.normalizeWord(word);

    // Check cache first
    const cached = this._translations.get(normalized);
    if (cached) {
      return { word: cached.word, translation: cached.translation, context: cached.context, source: 'cache' };
    }

    // Check if already fetching
    const pending = this._pendingRequests.get(normalized);
    if (pending) return pending;

    if (!this._targetLanguage) return null;

    const promise = this._fetchFromAPI(word, normalized);
    this._pendingRequests.set(normalized, promise);

    try {
      const result = await promise;
      return result;
    } finally {
      this._pendingRequests.delete(normalized);
    }
  }

  /**
   * Check if a word looks like it could be target-language text
   * (i.e., not a common English word or punctuation).
   */
  isLikelyTargetLanguage(word: string): boolean {
    const cleaned = this.stripPunctuation(word).toLowerCase();
    if (cleaned.length <= 1) return false;
    if (COMMON_ENGLISH_WORDS.has(cleaned)) return false;
    // If we have a translation for it, it's definitely target language
    if (this._translations.has(cleaned)) return true;
    // Words with non-ASCII characters are likely target language
    if (/[^\x00-\x7F]/.test(cleaned)) return true;
    // Default: if target language is set and word isn't obviously English, assume target
    return false;
  }

  /**
   * Split text into word tokens, preserving whitespace and punctuation
   * for accurate rendering. Each token has the original text and whether
   * it's a hoverable word.
   */
  tokenize(text: string): Array<{ text: string; isWord: boolean }> {
    const tokens: Array<{ text: string; isWord: boolean }> = [];
    // Match sequences of word chars (including unicode) or non-word sequences
    const regex = /(\S+|\s+)/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const token = match[1];
      const isWord = /\S/.test(token) && this.stripPunctuation(token).length > 0;
      tokens.push({ text: token, isWord });
    }
    return tokens;
  }

  /** Strip leading/trailing punctuation from a word */
  stripPunctuation(word: string): string {
    // Strip common punctuation characters from start/end, preserving accented letters
    return word.replace(/^[^\w\u00C0-\u024F]+|[^\w\u00C0-\u024F]+$/g, '');
  }

  /** Clear all cached translations */
  clear(): void {
    this._translations.clear();
    this._pendingRequests.clear();
  }

  /** Get the count of cached translations */
  get size(): number {
    return this._translations.size;
  }

  private normalizeWord(word: string): string {
    return this.stripPunctuation(word).toLowerCase();
  }

  private async _fetchFromAPI(originalWord: string, normalized: string): Promise<TranslationResult | null> {
    try {
      const res = await fetch('/api/conversation/translate-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: originalWord,
          targetLanguage: this._targetLanguage,
        }),
      });

      if (!res.ok) return null;

      const data = await res.json();
      if (data.translation) {
        const hint: VocabHint = {
          word: originalWord,
          translation: data.translation,
          context: data.context,
        };
        this._translations.set(normalized, hint);
        return { ...hint, source: 'api' };
      }
      return null;
    } catch {
      return null;
    }
  }
}

/**
 * Small set of very common English words to exclude from hover-to-translate.
 * Only includes function words and the most frequent English words.
 */
const COMMON_ENGLISH_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
  'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
  'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each',
  'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
  'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  'just', 'because', 'but', 'and', 'or', 'if', 'while', 'although',
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you',
  'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself',
  'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them',
  'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this',
  'that', 'these', 'those', 'am', 'about', 'up', 'down', 'don', 't',
  'hello', 'hi', 'yes', 'no', 'ok', 'okay', 'please', 'thank', 'thanks',
  'sorry', 'well', 'oh', 'um', 'uh', 'like', 'know', 'think', 'want',
  'get', 'go', 'come', 'make', 'see', 'look', 'say', 'said', 'tell',
  'told', 'ask', 'asked', 'try', 'let', 'put', 'take', 'give', 'got',
]);
