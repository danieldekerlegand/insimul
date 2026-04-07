/**
 * Prolog-LLM Router
 *
 * Routes queries through Prolog first to reduce LLM API calls.
 * If Prolog can answer the query (factual lookups, simple decisions,
 * template-based responses), it returns the result directly.
 * Otherwise, it falls through to the AI service.
 *
 * Usage:
 *   const result = await prologLLMRouter.tryPrologFirst(worldId, queryType, params);
 *   if (result.answered) {
 *     // Use result.answer directly
 *   } else {
 *     // Fall through to AI
 *   }
 */

import { prologAutoSync } from '../engines/prolog/prolog-auto-sync';

interface PrologRouterResult {
  answered: boolean;
  answer?: string;
  source: 'prolog' | 'template' | 'ai_needed';
  confidence: number;
  query?: string;
}

// ── Template responses ────────────────────────────────────────────────────

const GREETING_TEMPLATES: Record<string, string[]> = {
  en: [
    'Good day, traveler.',
    'Well met!',
    'Hello there.',
    'Greetings, friend.',
    'Welcome.',
  ],
  fr: [
    'Bonjour, voyageur.',
    'Bienvenue!',
    'Salut!',
    'Bonjour, comment allez-vous?',
    'Bonne journée!',
  ],
  es: [
    '¡Buenos días, viajero!',
    '¡Bienvenido!',
    '¡Hola!',
    '¿Cómo estás?',
    '¡Buenas!',
  ],
  de: [
    'Guten Tag, Reisender.',
    'Willkommen!',
    'Hallo!',
    'Grüß Gott!',
    'Sei gegrüßt!',
  ],
};

const FAREWELL_TEMPLATES: Record<string, string[]> = {
  en: [
    'Farewell, safe travels.',
    'Until next time.',
    'May your path be clear.',
    'Take care out there.',
    'Goodbye for now.',
  ],
  fr: [
    'Au revoir, bon voyage.',
    'À bientôt!',
    'Bonne route!',
    'À la prochaine.',
    'Portez-vous bien!',
  ],
  es: [
    '¡Adiós, buen viaje!',
    '¡Hasta luego!',
    '¡Hasta la próxima!',
    '¡Cuídate!',
    '¡Que te vaya bien!',
  ],
  de: [
    'Auf Wiedersehen, gute Reise.',
    'Bis zum nächsten Mal!',
    'Pass auf dich auf!',
    'Leb wohl!',
    'Bis bald!',
  ],
};

const TRADE_TEMPLATES = [
  'I have fine wares for sale. Care to take a look?',
  'Looking to buy or sell? I can help with both.',
  'My prices are fair, I assure you.',
];

function pickTemplate(templates: string[]): string {
  return templates[Math.floor(Math.random() * templates.length)];
}

/** Get templates for a language, falling back to English */
function getGreetingTemplates(targetLanguage?: string): string[] {
  const lang = targetLanguage?.toLowerCase().slice(0, 2) || 'en';
  return GREETING_TEMPLATES[lang] || GREETING_TEMPLATES.en;
}

function getFarewellTemplates(targetLanguage?: string): string[] {
  const lang = targetLanguage?.toLowerCase().slice(0, 2) || 'en';
  return FAREWELL_TEMPLATES[lang] || FAREWELL_TEMPLATES.en;
}

// ── Router ────────────────────────────────────────────────────────────────

export class PrologLLMRouter {
  /**
   * Try to answer a query using Prolog before falling back to AI.
   */
  async tryPrologFirst(
    worldId: string,
    queryType: string,
    params: Record<string, any>,
    targetLanguage?: string,
  ): Promise<PrologRouterResult> {
    try {
      const engine = prologAutoSync.getEngine(worldId);

      switch (queryType) {
        case 'character_info': {
          const { characterId, field } = params;
          if (!characterId || !field) break;

          const fieldMap: Record<string, string> = {
            age: `age(${characterId}, X)`,
            gender: `gender(${characterId}, X)`,
            occupation: `occupation(${characterId}, X)`,
            location: `at_location(${characterId}, X)`,
            alive: `alive(${characterId})`,
            spouse: `married_to(${characterId}, X)`,
          };

          const query = fieldMap[field];
          if (query) {
            const result = await engine.query(query, 1);
            if (result.success && result.bindings.length > 0) {
              const value = result.bindings[0].X ?? 'true';
              return {
                answered: true,
                answer: `${value}`,
                source: 'prolog',
                confidence: 1.0,
                query,
              };
            }
          }
          break;
        }

        case 'relationship': {
          const { person1, person2 } = params;
          if (!person1 || !person2) break;

          // Check various relationship types
          const checks = [
            { query: `married_to(${person1}, ${person2})`, label: 'married' },
            { query: `parent_of(${person1}, ${person2})`, label: 'parent' },
            { query: `parent_of(${person2}, ${person1})`, label: 'child' },
            { query: `sibling_of(${person1}, ${person2})`, label: 'sibling' },
            { query: `friends(${person1}, ${person2})`, label: 'friend' },
            { query: `enemies(${person1}, ${person2})`, label: 'enemy' },
          ];

          for (const check of checks) {
            const result = await engine.queryOnce(check.query);
            if (result) {
              return {
                answered: true,
                answer: check.label,
                source: 'prolog',
                confidence: 1.0,
                query: check.query,
              };
            }
          }

          return {
            answered: true,
            answer: 'no known relationship',
            source: 'prolog',
            confidence: 0.8,
          };
        }

        case 'greeting': {
          const { speakerId, listenerId } = params;
          const isEnemy = speakerId && listenerId
            ? await engine.queryOnce(`enemies(${speakerId}, ${listenerId})`)
            : false;

          if (isEnemy) {
            return {
              answered: true,
              answer: 'What do you want?',
              source: 'template',
              confidence: 0.7,
            };
          }

          return {
            answered: true,
            answer: pickTemplate(getGreetingTemplates(targetLanguage)),
            source: 'template',
            confidence: 0.6,
          };
        }

        case 'farewell':
          return {
            answered: true,
            answer: pickTemplate(getFarewellTemplates(targetLanguage)),
            source: 'template',
            confidence: 0.6,
          };

        case 'trade_offer':
          return {
            answered: true,
            answer: pickTemplate(TRADE_TEMPLATES),
            source: 'template',
            confidence: 0.6,
          };

        case 'should_socialize': {
          const { characterId } = params;
          if (!characterId) break;
          const result = await engine.queryOnce(`should_socialize(${characterId})`);
          return {
            answered: true,
            answer: result ? 'yes' : 'no',
            source: 'prolog',
            confidence: 0.9,
            query: `should_socialize(${characterId})`,
          };
        }

        case 'can_marry': {
          const { person1, person2 } = params;
          if (!person1 || !person2) break;
          const result = await engine.queryOnce(`can_marry(${person1}, ${person2})`);
          return {
            answered: true,
            answer: result ? 'yes' : 'no',
            source: 'prolog',
            confidence: 1.0,
            query: `can_marry(${person1}, ${person2})`,
          };
        }

        case 'quest_available': {
          const { questId, characterId } = params;
          if (!questId || !characterId) break;
          const result = await engine.queryOnce(`quest_available(${questId}, ${characterId})`);
          return {
            answered: true,
            answer: result ? 'available' : 'not_available',
            source: 'prolog',
            confidence: 1.0,
            query: `quest_available(${questId}, ${characterId})`,
          };
        }
      }
    } catch (e) {
      // Prolog failed, fall through to AI
    }

    return {
      answered: false,
      source: 'ai_needed',
      confidence: 0,
    };
  }

  /**
   * Get stats on how many queries Prolog could handle vs AI.
   */
  getQueryTypes(): string[] {
    return [
      'character_info',
      'relationship',
      'greeting',
      'farewell',
      'trade_offer',
      'should_socialize',
      'can_marry',
      'quest_available',
    ];
  }
}

// Singleton
export const prologLLMRouter = new PrologLLMRouter();
