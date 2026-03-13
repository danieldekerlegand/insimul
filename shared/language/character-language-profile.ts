/**
 * Character Language Profile
 *
 * Defines structured language capabilities for NPCs:
 * primary language, English fluency, difficulty tier, and vocabulary specialization.
 * Used for reliable prompt construction in language-learning worlds.
 */

export interface CharacterLanguageProfile {
  primaryLanguage: string;           // Target language (e.g., "French")
  englishFluency: EnglishFluency;    // How well they speak English
  difficultyTier: DifficultyTier;    // Conversation difficulty for the player
  vocabularySpecialization: string[]; // Categories they know well (e.g., ['food', 'cooking'])
  speechStyle: SpeechStyle;          // How they speak
  bilingualRatio: number;            // 0-1: how much target language they mix in (0 = all English, 1 = all target)
}

export type EnglishFluency = 'none' | 'basic' | 'moderate' | 'fluent' | 'native';
export type DifficultyTier = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type SpeechStyle = 'formal' | 'casual' | 'verbose' | 'terse' | 'poetic' | 'scholarly';

/**
 * Mapping from occupation to vocabulary specialization categories
 */
export const OCCUPATION_VOCABULARY_MAP: Record<string, string[]> = {
  baker: ['food', 'numbers', 'shopping', 'greetings'],
  farmer: ['nature', 'animals', 'food', 'weather'],
  blacksmith: ['professions', 'household', 'actions', 'numbers'],
  merchant: ['shopping', 'numbers', 'directions', 'greetings'],
  teacher: ['social', 'numbers', 'time', 'actions'],
  doctor: ['body', 'emotions', 'actions', 'family'],
  soldier: ['directions', 'actions', 'clothing', 'body'],
  priest: ['social', 'emotions', 'family', 'time'],
  innkeeper: ['food', 'greetings', 'shopping', 'household'],
  fisherman: ['nature', 'animals', 'weather', 'food'],
  guard: ['directions', 'social', 'actions', 'time'],
  scholar: ['social', 'time', 'actions', 'nature'],
  tailor: ['clothing', 'colors', 'shopping', 'numbers'],
  carpenter: ['household', 'actions', 'nature', 'numbers'],
  mayor: ['social', 'time', 'places', 'greetings'],
};

/**
 * Generate a language profile for a character based on their occupation and traits
 */
export function generateLanguageProfile(
  occupation: string,
  targetLanguage: string,
  personalityTraits?: string[]
): CharacterLanguageProfile {
  const vocabSpec = OCCUPATION_VOCABULARY_MAP[occupation.toLowerCase()] || ['greetings', 'social'];

  // Determine difficulty based on occupation
  let difficultyTier: DifficultyTier;
  let englishFluency: EnglishFluency;
  let bilingualRatio: number;
  let speechStyle: SpeechStyle;

  const educatedOccupations = ['scholar', 'teacher', 'priest', 'mayor', 'doctor'];
  const simpleOccupations = ['farmer', 'fisherman', 'guard'];

  if (educatedOccupations.includes(occupation.toLowerCase())) {
    difficultyTier = 'advanced';
    englishFluency = 'moderate';
    bilingualRatio = 0.8;
    speechStyle = 'formal';
  } else if (simpleOccupations.includes(occupation.toLowerCase())) {
    difficultyTier = 'beginner';
    englishFluency = 'basic';
    bilingualRatio = 0.4;
    speechStyle = 'casual';
  } else {
    difficultyTier = 'intermediate';
    englishFluency = 'moderate';
    bilingualRatio = 0.6;
    speechStyle = 'casual';
  }

  // Adjust for personality traits
  if (personalityTraits) {
    if (personalityTraits.includes('talkative') || personalityTraits.includes('friendly')) {
      speechStyle = 'verbose';
    }
    if (personalityTraits.includes('scholarly') || personalityTraits.includes('wise')) {
      speechStyle = 'scholarly';
      difficultyTier = 'advanced';
    }
    if (personalityTraits.includes('grumpy') || personalityTraits.includes('shy')) {
      speechStyle = 'terse';
    }
  }

  return {
    primaryLanguage: targetLanguage,
    englishFluency,
    difficultyTier,
    vocabularySpecialization: vocabSpec,
    speechStyle,
    bilingualRatio,
  };
}

/**
 * Build a prompt fragment describing this NPC's language behavior
 */
export function buildLanguageProfilePrompt(profile: CharacterLanguageProfile): string {
  const fluencyDesc: Record<EnglishFluency, string> = {
    none: 'speaks NO English at all — only speaks in the target language',
    basic: 'speaks very basic English with many errors, prefers the target language',
    moderate: 'speaks conversational English but naturally mixes in target language words and phrases',
    fluent: 'speaks good English but uses target language for emphasis and cultural terms',
    native: 'speaks English natively but can switch to the target language on request',
  };

  const styleDesc: Record<SpeechStyle, string> = {
    formal: 'Uses formal, polite speech patterns',
    casual: 'Speaks casually and naturally',
    verbose: 'Loves to chat and gives detailed explanations',
    terse: 'Speaks briefly with short, direct sentences',
    poetic: 'Uses poetic, flowery language',
    scholarly: 'Uses academic, precise vocabulary',
  };

  return `This NPC's primary language is ${profile.primaryLanguage}. They ${fluencyDesc[profile.englishFluency]}. ${styleDesc[profile.speechStyle]}. They specialize in topics related to: ${profile.vocabularySpecialization.join(', ')}. In conversations, approximately ${Math.round(profile.bilingualRatio * 100)}% of their speech should be in ${profile.primaryLanguage}.`;
}
