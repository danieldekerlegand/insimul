/**
 * Language Utilities
 *
 * Shared utilities for dynamic language detection, fluency extraction,
 * greeting generation, and language-aware system prompt building.
 * Replaces the hardcoded French/English logic in dialogue systems.
 */

import type { WorldLanguage } from './language';

// ==========================================
// Types
// ==========================================

export interface LanguageFluency {
  language: string;
  fluency: number;
  isNative: boolean;
}

export interface Truth {
  id?: string;
  characterId?: string | null;
  entryType?: string;
  title?: string;
  content?: string;
  timestep?: number;
  sourceData?: { value?: number; language?: string; [key: string]: any };
  [key: string]: any;
}

export interface WorldLanguageContext {
  targetLanguage: string;
  worldLanguages: WorldLanguage[];
  primaryLanguage: WorldLanguage | null;
}

export interface CharacterInfo {
  firstName: string;
  lastName: string;
  age?: number | null;
  gender?: string;
  occupation?: string | null;
  currentLocation?: string | null;
  personality?: Record<string, any> | null;
  friendIds?: string[];
  coworkerIds?: string[];
  spouseId?: string | null;
}

// ==========================================
// Greeting Data (25+ languages)
// ==========================================

export const GREETINGS: Record<string, string[]> = {
  'English': ['Hello!', 'Hi there!', 'Good day!', 'Hey!', 'Greetings!'],
  'French': ['Bonjour!', 'Salut!', 'Coucou!', 'Bonsoir!'],
  'Spanish': ['¡Hola!', '¡Buenos días!', '¿Qué tal?', '¡Buenas tardes!'],
  'German': ['Hallo!', 'Guten Tag!', 'Grüß Gott!', 'Moin!'],
  'Italian': ['Ciao!', 'Buongiorno!', 'Salve!', 'Buonasera!'],
  'Portuguese': ['Olá!', 'Bom dia!', 'Oi!', 'Boa tarde!'],
  'Japanese': ['こんにちは！', 'やあ！', 'どうも！', 'おはようございます！'],
  'Chinese': ['你好！', '嗨！', '您好！', '大家好！'],
  'Mandarin Chinese': ['你好！', '嗨！', '您好！', '大家好！'],
  'Korean': ['안녕하세요!', '안녕!', '반갑습니다!'],
  'Arabic': ['!مرحبا', '!أهلاً', '!السلام عليكم'],
  'Russian': ['Привет!', 'Здравствуйте!', 'Добрый день!'],
  'Hindi': ['नमस्ते!', 'नमस्कार!', 'प्रणाम!'],
  'Turkish': ['Merhaba!', 'Selam!', 'İyi günler!'],
  'Dutch': ['Hallo!', 'Goedendag!', 'Hoi!', 'Dag!'],
  'Swedish': ['Hej!', 'Hallå!', 'God dag!', 'Tjena!'],
  'Norwegian': ['Hei!', 'Hallo!', 'God dag!', 'Morn!'],
  'Danish': ['Hej!', 'Goddag!', 'Hallo!'],
  'Finnish': ['Hei!', 'Moi!', 'Terve!', 'Päivää!'],
  'Polish': ['Cześć!', 'Dzień dobry!', 'Witam!', 'Hej!'],
  'Czech': ['Ahoj!', 'Dobrý den!', 'Nazdar!'],
  'Greek': ['Γεια σου!', 'Γεια σας!', 'Καλημέρα!'],
  'Thai': ['สวัสดี!', 'หวัดดี!'],
  'Vietnamese': ['Xin chào!', 'Chào bạn!'],
  'Indonesian': ['Halo!', 'Selamat siang!', 'Apa kabar?'],
  'Malay': ['Hai!', 'Selamat!', 'Apa khabar?'],
  'Swahili': ['Habari!', 'Jambo!', 'Salama!'],
  'Hebrew': ['!שלום', '!היי', '!מה נשמע'],
  'Persian': ['!سلام', '!درود', '!خوش آمدید'],
  'Ukrainian': ['Привіт!', 'Добрий день!', 'Вітаю!'],
  'Romanian': ['Bună!', 'Salut!', 'Bună ziua!'],
  'Hungarian': ['Szia!', 'Helló!', 'Jó napot!'],
  'Bengali': ['নমস্কার!', 'হ্যালো!'],
  'Tagalog': ['Kumusta!', 'Mabuhay!', 'Hello po!'],
  'Urdu': ['!السلام علیکم', '!ہیلو', '!آداب'],
  'Latin': ['Salve!', 'Ave!', 'Salvete!'],
};

// Introductions in each language ("I'm [name]")
export const INTRODUCTIONS: Record<string, (firstName: string, lastName: string) => string> = {
  'English': (f, l) => `I'm ${f} ${l}.`,
  'French': (f, l) => `Je m'appelle ${f} ${l}.`,
  'Spanish': (f, l) => `Me llamo ${f} ${l}.`,
  'German': (f, l) => `Ich bin ${f} ${l}.`,
  'Italian': (f, l) => `Sono ${f} ${l}.`,
  'Portuguese': (f, l) => `Eu sou ${f} ${l}.`,
  'Japanese': (f, l) => `${l}${f}です。`,
  'Chinese': (f, l) => `我是${l}${f}。`,
  'Mandarin Chinese': (f, l) => `我是${l}${f}。`,
  'Korean': (f, l) => `저는 ${l}${f}입니다.`,
  'Arabic': (f, l) => `.أنا ${f} ${l}`,
  'Russian': (f, l) => `Меня зовут ${f} ${l}.`,
  'Hindi': (f, l) => `मेरा नाम ${f} ${l} है।`,
  'Turkish': (f, l) => `Ben ${f} ${l}.`,
  'Dutch': (f, l) => `Ik ben ${f} ${l}.`,
  'Swedish': (f, l) => `Jag heter ${f} ${l}.`,
  'Norwegian': (f, l) => `Jeg heter ${f} ${l}.`,
  'Danish': (f, l) => `Jeg hedder ${f} ${l}.`,
  'Finnish': (f, l) => `Olen ${f} ${l}.`,
  'Polish': (f, l) => `Jestem ${f} ${l}.`,
  'Czech': (f, l) => `Jsem ${f} ${l}.`,
  'Greek': (f, l) => `Είμαι ο ${f} ${l}.`,
  'Thai': (f, l) => `ผมชื่อ ${f} ${l}`,
  'Vietnamese': (f, l) => `Tôi là ${f} ${l}.`,
  'Indonesian': (f, l) => `Saya ${f} ${l}.`,
  'Swahili': (f, l) => `Mimi ni ${f} ${l}.`,
  'Latin': (f, l) => `${f} ${l} sum.`,
};

// "How can I help?" in each language
export const HELP_OFFERS: Record<string, string[]> = {
  'English': ['How can I help you today?', 'What can I do for you?', 'Need anything?'],
  'French': ['Comment puis-je vous aider?', 'Que puis-je faire pour vous?'],
  'Spanish': ['¿En qué puedo ayudarle?', '¿Qué necesita?', '¿Cómo le puedo ayudar?'],
  'German': ['Wie kann ich Ihnen helfen?', 'Was kann ich für Sie tun?'],
  'Italian': ['Come posso aiutarti?', 'Di cosa hai bisogno?'],
  'Portuguese': ['Como posso ajudar?', 'O que precisa?'],
  'Japanese': ['何かお手伝いできますか？', 'どうしましたか？'],
  'Chinese': ['我能帮你什么？', '有什么需要帮忙的吗？'],
  'Mandarin Chinese': ['我能帮你什么？', '有什么需要帮忙的吗？'],
  'Korean': ['무엇을 도와드릴까요?', '필요한 것이 있으신가요?'],
  'Russian': ['Чем могу помочь?', 'Что вам нужно?'],
  'Arabic': ['كيف يمكنني مساعدتك؟'],
  'Hindi': ['मैं आपकी कैसे मदद कर सकता हूँ?'],
  'Turkish': ['Size nasıl yardımcı olabilirim?'],
  'Dutch': ['Hoe kan ik u helpen?', 'Wat kan ik voor u doen?'],
};

// ==========================================
// BCP 47 Language Code Mapping
// ==========================================

/**
 * Map a language name to its BCP 47 code for TTS and browser APIs.
 */
export function getLanguageBCP47(languageName: string): string {
  const BCP47_MAP: Record<string, string> = {
    'English': 'en-US',
    'French': 'fr-FR',
    'Spanish': 'es-ES',
    'German': 'de-DE',
    'Italian': 'it-IT',
    'Portuguese': 'pt-BR',
    'Japanese': 'ja-JP',
    'Chinese': 'zh-CN',
    'Mandarin Chinese': 'zh-CN',
    'Korean': 'ko-KR',
    'Arabic': 'ar-SA',
    'Russian': 'ru-RU',
    'Hindi': 'hi-IN',
    'Turkish': 'tr-TR',
    'Dutch': 'nl-NL',
    'Swedish': 'sv-SE',
    'Norwegian': 'nb-NO',
    'Danish': 'da-DK',
    'Finnish': 'fi-FI',
    'Polish': 'pl-PL',
    'Czech': 'cs-CZ',
    'Greek': 'el-GR',
    'Thai': 'th-TH',
    'Vietnamese': 'vi-VN',
    'Indonesian': 'id-ID',
    'Malay': 'ms-MY',
    'Swahili': 'sw-KE',
    'Hebrew': 'he-IL',
    'Persian': 'fa-IR',
    'Ukrainian': 'uk-UA',
    'Romanian': 'ro-RO',
    'Hungarian': 'hu-HU',
    'Bengali': 'bn-BD',
    'Tagalog': 'tl-PH',
    'Urdu': 'ur-PK',
    'Latin': 'la',
  };

  return BCP47_MAP[languageName] || 'en-US';
}

// ==========================================
// Fluency Extraction
// ==========================================

/**
 * Extract all language fluencies from character truths.
 * Replaces the hardcoded French/English detection.
 */
export function extractLanguageFluencies(truths: Truth[]): LanguageFluency[] {
  const presentTruths = truths.filter(t => t.timestep === 0);

  // Find all language-related truths
  const languageTruths = presentTruths.filter(t =>
    t.entryType === 'language' ||
    (t.content && t.content.includes('fluency'))
  );

  const fluencies: LanguageFluency[] = [];
  const seenLanguages = new Set<string>();

  for (const truth of languageTruths) {
    // Try to extract language name
    let languageName: string | null = null;

    // Pattern 1: title like "French Language" or "Spanish Language"
    if (truth.title) {
      const titleMatch = truth.title.match(/^(\w[\w\s]*?)\s+Language$/i);
      if (titleMatch) {
        languageName = titleMatch[1];
      }
    }

    // Pattern 2: content like "fluency in French" or "X/100 fluency in Spanish"
    if (!languageName && truth.content) {
      const contentMatch = truth.content.match(/fluency in ([\w\s]+?)(?:\s*[.!,]|$)/i);
      if (contentMatch) {
        languageName = contentMatch[1].trim();
      }
    }

    // Pattern 3: sourceData has language field
    if (!languageName && truth.sourceData?.language) {
      languageName = truth.sourceData.language;
    }

    if (!languageName || seenLanguages.has(languageName.toLowerCase())) continue;
    seenLanguages.add(languageName.toLowerCase());

    // Extract fluency value
    let fluency = 0;

    if (truth.sourceData?.value !== undefined) {
      fluency = truth.sourceData.value;
    } else if (truth.content) {
      const fluencyMatch = truth.content.match(/(\d+)\/100/);
      if (fluencyMatch) {
        fluency = parseInt(fluencyMatch[1]);
      }
    }

    fluencies.push({
      language: languageName,
      fluency,
      isNative: fluency >= 90,
    });
  }

  // If no language truths found, default to English
  if (fluencies.length === 0) {
    fluencies.push({ language: 'English', fluency: 100, isNative: true });
  }

  // Sort by fluency descending
  return fluencies.sort((a, b) => b.fluency - a.fluency);
}

/**
 * Get the fluency level label for a numeric fluency value
 */
export function getFluencyLevel(fluency: number): string {
  if (fluency >= 90) return 'native';
  if (fluency >= 70) return 'fluent';
  if (fluency >= 50) return 'conversational';
  if (fluency >= 30) return 'basic';
  return 'beginner';
}

// ==========================================
// Greeting Generation
// ==========================================

/**
 * Build a greeting for a character in their dominant language.
 * Supports all languages in GREETINGS, with fallback to English.
 */
export function buildGreeting(
  character: CharacterInfo,
  truths: Truth[],
  targetLanguage?: string
): string {
  const fluencies = extractLanguageFluencies(truths);
  const dominant = fluencies[0]; // highest fluency

  const { firstName, lastName } = character;
  const lang = dominant.language;

  // Get greeting in dominant language
  const greetings = GREETINGS[lang] || GREETINGS['English'];
  const greeting = greetings[Math.floor(Math.random() * greetings.length)];

  // Get introduction in dominant language
  const introFn = INTRODUCTIONS[lang] || INTRODUCTIONS['English'];
  const intro = introFn(firstName, lastName);

  // Get help offer in dominant language
  const helpOffers = HELP_OFFERS[lang] || HELP_OFFERS['English'];
  const help = helpOffers[Math.floor(Math.random() * helpOffers.length)];

  // For low-fluency dominant speakers, simplify
  if (dominant.fluency < 50) {
    // Very basic: just greeting + name
    return `${greeting} ${INTRODUCTIONS['English'](firstName, lastName)}`;
  }

  return `${greeting} ${intro} ${help}`;
}

/**
 * Build a greeting for a conlang-speaking character.
 * Uses sample words from the conlang if available.
 */
export function buildConlangGreeting(
  character: CharacterInfo,
  conlang: WorldLanguage
): string {
  const { firstName, lastName } = character;

  if (conlang.sampleWords) {
    // Try to use conlang greeting words
    const greetingWord = conlang.sampleWords['hello'] ||
                         conlang.sampleWords['greeting'] ||
                         conlang.sampleWords['greetings'] ||
                         null;

    if (greetingWord) {
      return `${greetingWord}! I'm ${firstName} ${lastName}. (That means "hello" in ${conlang.name}!)`;
    }
  }

  // Fallback: English greeting with conlang mention
  return `Hello! I'm ${firstName} ${lastName}. I speak ${conlang.name} — ask me about it!`;
}

// ==========================================
// System Prompt Building
// ==========================================

/**
 * Build the language skills section of a system prompt.
 * Dynamically supports all detected languages.
 */
export function buildLanguageSection(
  fluencies: LanguageFluency[],
  targetLanguage?: string
): string {
  const dominant = fluencies[0];

  let section = `LANGUAGE SKILLS:\n`;
  for (const f of fluencies) {
    section += `- ${f.language}: ${f.fluency}/100 (${getFluencyLevel(f.fluency)})\n`;
  }
  section += `- Native language: ${dominant.language}\n`;

  section += `\nBEHAVIOR:\n`;
  section += `1. Speak ${dominant.language} by default.\n`;

  // If there's a target language and the character knows it
  if (targetLanguage && targetLanguage !== dominant.language) {
    const targetFluency = fluencies.find(f =>
      f.language.toLowerCase() === targetLanguage.toLowerCase()
    );

    if (targetFluency) {
      if (targetFluency.fluency < 50) {
        section += `2. If the user speaks ${targetLanguage}, try to respond but struggle: use simple words, make grammatical errors, sometimes apologize for poor skills.\n`;
      } else if (targetFluency.fluency < 70) {
        section += `2. If the user speaks ${targetLanguage}, respond in ${targetLanguage} but show limitations: occasional errors, simpler grammar, sometimes search for words.\n`;
      } else {
        section += `2. If the user speaks ${targetLanguage}, respond fluently in ${targetLanguage}.\n`;
      }
    } else {
      section += `2. If the user speaks ${targetLanguage}, you don't know it — stay in ${dominant.language} and apologize.\n`;
    }
  } else if (fluencies.length > 1) {
    const secondary = fluencies[1];
    if (secondary.fluency < 50) {
      section += `2. If the user speaks ${secondary.language}, struggle with it: use simple words, make errors.\n`;
    } else if (secondary.fluency < 70) {
      section += `2. If the user speaks ${secondary.language}, respond with some limitations.\n`;
    } else {
      section += `2. If the user speaks ${secondary.language}, respond fluently.\n`;
    }
  }

  // Code-switching behavior for multilingual characters
  if (fluencies.length >= 2) {
    const languages = fluencies.map(f => f.language);
    section += `\nCODE-SWITCHING:\n`;
    section += `- You can switch between ${languages.join(' and ')} naturally in conversation.\n`;
    section += `- Use ${dominant.language} for emotional expressions and exclamations.\n`;
    if (fluencies.some(f => f.fluency < 70 && f.fluency >= 30)) {
      section += `- When struggling in a weaker language, mix in words from ${dominant.language} and apologize.\n`;
    }
    section += `- Translate important terms when switching languages.\n`;
  }

  section += `\nGENERAL:\n`;
  section += `3. Keep responses under 3 sentences unless asked for more.\n`;
  section += `4. You can talk about your location, the world, your relationships, and your daily life.\n`;

  return section;
}

/**
 * Build conlang context for the system prompt when the world uses a constructed language.
 */
export function buildConlangContext(language: WorldLanguage): string {
  if (language.kind !== 'constructed') return '';

  let context = `\nCONSTRUCTED LANGUAGE: ${language.name}\n`;

  if (language.sampleWords && Object.keys(language.sampleWords).length > 0) {
    context += `\nVocabulary to use:\n`;
    const entries = Object.entries(language.sampleWords);
    for (const [english, conlang] of entries.slice(0, 30)) {
      context += `- "${english}" = "${conlang}"\n`;
    }
  }

  if (language.grammar) {
    context += `\nGrammar rules:\n`;
    context += `- Word order: ${language.features?.wordOrder || 'SVO'}\n`;
    if (language.grammar.verbTenses) {
      context += `- Verb tenses: ${language.grammar.verbTenses.join(', ')}\n`;
    }
    if (language.grammar.nounCases) {
      context += `- Noun cases: ${language.grammar.nounCases.join(', ')}\n`;
    }
  }

  if (language.sampleTexts && language.sampleTexts.length > 0) {
    context += `\nExample phrases:\n`;
    for (const sample of language.sampleTexts.slice(0, 5)) {
      context += `- "${sample.english}" → "${sample.language}"\n`;
    }
  }

  context += `\nWhen speaking ${language.name}, use the vocabulary above and follow the grammar rules.\n`;
  context += `Mix ${language.name} words with English explanations to help the player learn.\n`;

  return context;
}

/**
 * Build the world language context section for system prompts.
 */
export function buildWorldLanguageSection(worldContext: WorldLanguageContext): string {
  let section = '';

  if (worldContext.targetLanguage && worldContext.targetLanguage !== 'English') {
    section += `\nWORLD LANGUAGE: This world's primary language is ${worldContext.targetLanguage}.\n`;
    section += `- NPCs in this world commonly speak ${worldContext.targetLanguage}.\n`;
    section += `- Help the player practice ${worldContext.targetLanguage} naturally in conversation.\n`;
  }

  // Add conlang context if the primary language is constructed
  if (worldContext.primaryLanguage && worldContext.primaryLanguage.kind === 'constructed') {
    section += buildConlangContext(worldContext.primaryLanguage);
  }

  return section;
}

/**
 * Build the full language-aware system prompt for character dialogue.
 * This replaces the hardcoded French/English system prompt builder.
 */
export function buildLanguageAwareSystemPrompt(
  character: CharacterInfo,
  truths: Truth[],
  worldContext?: WorldLanguageContext
): string {
  const presentTruths = truths.filter(t => t.timestep === 0);
  const fluencies = extractLanguageFluencies(truths);

  const { firstName, lastName, age, gender, occupation, currentLocation, personality, friendIds, coworkerIds, spouseId } = character;

  let prompt = `You are ${firstName} ${lastName} (${age || '?'} years old, ${gender || 'unknown'}, ${occupation || 'no occupation'}).

CURRENT LOCATION: ${currentLocation || 'Unknown'}

${buildLanguageSection(fluencies, worldContext?.targetLanguage)}
`;

  // Add world language context
  if (worldContext) {
    prompt += buildWorldLanguageSection(worldContext);
    prompt += '\n';
  }

  // Add character truths (skip language truths already processed)
  const characterTruths = presentTruths.filter(t =>
    !t.content?.includes('fluency') && t.entryType !== 'language'
  );
  if (characterTruths.length > 0) {
    prompt += `Current Truths about you:\n`;
    for (const truth of characterTruths) {
      prompt += `- ${truth.content}\n`;
    }
    prompt += '\n';
  }

  // Add world context
  const worldTruths = truths.filter(t => t.timestep === 0 && !t.characterId);
  if (worldTruths.length > 0) {
    prompt += `Known facts about the world:\n`;
    for (const truth of worldTruths.slice(0, 10)) {
      prompt += `- ${truth.content}\n`;
    }
    prompt += '\n';
  }

  // Add personality traits
  if (personality && Object.keys(personality).length > 0) {
    prompt += `Personality Traits:\n`;
    for (const [key, value] of Object.entries(personality)) {
      prompt += `- ${key}: ${value}\n`;
    }
    prompt += '\n';
  }

  // Add relationships context
  if (friendIds && friendIds.length > 0) {
    prompt += `Friends: You have ${friendIds.length} friends in this world.\n`;
  }
  if (coworkerIds && coworkerIds.length > 0) {
    prompt += `Coworkers: You work with ${coworkerIds.length} colleagues.\n`;
  }
  if (spouseId) {
    prompt += `Family: You are married.\n`;
  }

  // Quest system
  prompt += `\nQUEST SYSTEM: You can assign quests using this format:
**QUEST_ASSIGN**
Title: [short title]
Description: [1-2 sentences]
Type: [quest category - varies by world type]
Difficulty: [beginner/intermediate/advanced for language learning, or easy/normal/hard/legendary for RPG worlds]
[Additional fields based on quest type]
**END_QUEST**

AVAILABLE QUEST TYPES (varies by world):
- Language Learning: conversation, translation, vocabulary, grammar, cultural
- RPG/Fantasy: combat, collection, exploration, escort, delivery, crafting, social
- Choose quest types that fit the world setting and current conversation context

Only assign quests when natural in conversation. Base difficulty on player's experience level.

Stay in character. Show your abilities authentically. You can reference your location, the world, and your life experiences.`;

  return prompt;
}
