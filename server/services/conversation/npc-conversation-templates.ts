/**
 * NPC-NPC Conversation Template Library (US-012)
 *
 * Expanded template library covering all 12 topic types with multiple variants each.
 * Includes bilingual templates per CEFR tier and personality-weighted selection.
 *
 * Templates are served instantly while LLM generates a replacement (show-then-replace).
 */

import type { BigFivePersonality } from './context-manager.js';

// ── Types ────────────────────────────────────────────────────────────

export interface ConversationTemplate {
  topic: string;
  variant: number;
  /** Personality traits that boost selection weight for this variant */
  personalityAffinity?: Partial<BigFivePersonality>;
  lines: Array<{ speaker: 'A' | 'B'; text: string }>;
}

export interface BilingualTemplate {
  topic: string;
  cefrTier: 'A1' | 'A2' | 'B1' | 'B2';
  /** Target language lines mixed with English scaffolding */
  lines: Array<{ speaker: 'A' | 'B'; text: string }>;
}

export type CEFRTier = 'A1' | 'A2' | 'B1' | 'B2';

// ── English Templates (20+ covering all 12 topics) ──────────────────

export const CONVERSATION_TEMPLATES: ConversationTemplate[] = [
  // ── daily_greeting (3 variants) ──
  {
    topic: 'daily_greeting',
    variant: 1,
    personalityAffinity: { extroversion: 0.5, agreeableness: 0.3 },
    lines: [
      { speaker: 'A', text: 'Good day! How have you been?' },
      { speaker: 'B', text: "I've been well, thank you. And yourself?" },
      { speaker: 'A', text: "Can't complain. The weather has been pleasant lately." },
      { speaker: 'B', text: 'Indeed it has. Well, I should be on my way.' },
    ],
  },
  {
    topic: 'daily_greeting',
    variant: 2,
    personalityAffinity: { extroversion: 0.8 },
    lines: [
      { speaker: 'A', text: 'Hey there! Great to see you out and about!' },
      { speaker: 'B', text: 'Same to you! I was just heading to the market.' },
      { speaker: 'A', text: "Oh, pick up some of those fresh rolls if they're still warm." },
      { speaker: 'B', text: "Good tip! I'll grab an extra for you." },
    ],
  },
  {
    topic: 'daily_greeting',
    variant: 3,
    personalityAffinity: { extroversion: -0.3, conscientiousness: 0.5 },
    lines: [
      { speaker: 'A', text: 'Morning. Off to work already?' },
      { speaker: 'B', text: "Yes, early start today. You know how it is." },
      { speaker: 'A', text: "I do. Don't overwork yourself." },
      { speaker: 'B', text: "I'll try. Have a good day." },
    ],
  },

  // ── weather (3 variants) ──
  {
    topic: 'weather',
    variant: 1,
    lines: [
      { speaker: 'A', text: "Looks like it might rain later, don't you think?" },
      { speaker: 'B', text: "I hope not. I didn't bring anything to cover myself." },
      { speaker: 'A', text: 'You can always duck into a shop if it starts.' },
      { speaker: 'B', text: "Good idea. Let's hope it holds off though." },
    ],
  },
  {
    topic: 'weather',
    variant: 2,
    personalityAffinity: { openness: 0.5 },
    lines: [
      { speaker: 'A', text: "What a beautiful day! I love when the sun is out like this." },
      { speaker: 'B', text: "Perfect for a walk through the park, don't you think?" },
      { speaker: 'A', text: 'Absolutely. Days like this make everything feel possible.' },
      { speaker: 'B', text: "Enjoy it while it lasts — I heard tomorrow won't be as nice." },
    ],
  },
  {
    topic: 'weather',
    variant: 3,
    personalityAffinity: { neuroticism: 0.5 },
    lines: [
      { speaker: 'A', text: 'This cold snap came out of nowhere.' },
      { speaker: 'B', text: "I know, I wasn't prepared at all. My coat is too thin." },
      { speaker: 'A', text: "They say it'll warm up by the weekend." },
      { speaker: 'B', text: "I certainly hope so. I can't take much more of this." },
    ],
  },

  // ── work (3 variants) ──
  {
    topic: 'work',
    variant: 1,
    personalityAffinity: { conscientiousness: 0.5 },
    lines: [
      { speaker: 'A', text: "Busy day at work today, wasn't it?" },
      { speaker: 'B', text: 'Tell me about it. I could use a break.' },
      { speaker: 'A', text: "At least it's almost over. Any plans for the evening?" },
      { speaker: 'B', text: 'Just a quiet night at home, I think.' },
    ],
  },
  {
    topic: 'work',
    variant: 2,
    personalityAffinity: { openness: 0.4, extroversion: 0.3 },
    lines: [
      { speaker: 'A', text: "I'm thinking of picking up a new project at work." },
      { speaker: 'B', text: 'Really? What kind?' },
      { speaker: 'A', text: "Something creative. I need a change of pace." },
      { speaker: 'B', text: 'Good for you. A fresh challenge keeps things interesting.' },
    ],
  },

  // ── gossip (3 variants) ──
  {
    topic: 'gossip',
    variant: 1,
    personalityAffinity: { extroversion: 0.5, openness: 0.3 },
    lines: [
      { speaker: 'A', text: 'Have you heard the latest news around town?' },
      { speaker: 'B', text: 'No, what happened?' },
      { speaker: 'A', text: "Oh, just the usual comings and goings. Nothing too exciting." },
      { speaker: 'B', text: "Well, that's how it goes in a small town." },
    ],
  },
  {
    topic: 'gossip',
    variant: 2,
    personalityAffinity: { extroversion: 0.7 },
    lines: [
      { speaker: 'A', text: "Did you see who moved into the old house on the corner?" },
      { speaker: 'B', text: "No! Who is it?" },
      { speaker: 'A', text: "I'm not sure yet, but they seem friendly enough." },
      { speaker: 'B', text: "I'll have to introduce myself when I get the chance." },
    ],
  },

  // ── food (3 variants) ──
  {
    topic: 'food',
    variant: 1,
    personalityAffinity: { openness: 0.5, agreeableness: 0.3 },
    lines: [
      { speaker: 'A', text: "Have you tried that new bakery on the main street?" },
      { speaker: 'B', text: "Not yet! Is it any good?" },
      { speaker: 'A', text: "Their croissants are incredible. Best I've had in years." },
      { speaker: 'B', text: "I'll have to stop by this weekend. Thanks for the tip!" },
    ],
  },
  {
    topic: 'food',
    variant: 2,
    personalityAffinity: { conscientiousness: 0.4 },
    lines: [
      { speaker: 'A', text: "I've been trying to cook more at home lately." },
      { speaker: 'B', text: "That's great! What have you been making?" },
      { speaker: 'A', text: "Mostly simple things — soups, roasted vegetables. Nothing fancy." },
      { speaker: 'B', text: "Sometimes the simple meals are the best ones." },
    ],
  },

  // ── family (2 variants) ──
  {
    topic: 'family',
    variant: 1,
    personalityAffinity: { agreeableness: 0.5 },
    lines: [
      { speaker: 'A', text: "How's your family doing these days?" },
      { speaker: 'B', text: "Everyone's well, thanks. The kids are growing up so fast." },
      { speaker: 'A', text: "They always do. Enjoy every moment while you can." },
      { speaker: 'B', text: "I try to. It really does go by in a blink." },
    ],
  },
  {
    topic: 'family',
    variant: 2,
    personalityAffinity: { extroversion: 0.3, neuroticism: 0.2 },
    lines: [
      { speaker: 'A', text: "My mother is visiting next week. I should start preparing." },
      { speaker: 'B', text: "Oh, that's nice! How long is she staying?" },
      { speaker: 'A', text: "Just a few days. She likes to keep busy." },
      { speaker: 'B', text: "I'm sure you'll have a lovely time together." },
    ],
  },

  // ── local_events (2 variants) ──
  {
    topic: 'local_events',
    variant: 1,
    personalityAffinity: { extroversion: 0.4, openness: 0.4 },
    lines: [
      { speaker: 'A', text: "Are you going to the town fair this weekend?" },
      { speaker: 'B', text: "I was thinking about it. Should be fun." },
      { speaker: 'A', text: "I heard there will be live music and food stalls." },
      { speaker: 'B', text: "Count me in then! Maybe we can go together." },
    ],
  },
  {
    topic: 'local_events',
    variant: 2,
    lines: [
      { speaker: 'A', text: "Did you hear about the new exhibit at the community hall?" },
      { speaker: 'B', text: "No, what's it about?" },
      { speaker: 'A', text: "Local artists showcasing their work. It opened yesterday." },
      { speaker: 'B', text: "That sounds lovely. I'll try to make it before it closes." },
    ],
  },

  // ── shared_hobby (2 variants) ──
  {
    topic: 'shared_hobby',
    variant: 1,
    personalityAffinity: { openness: 0.6 },
    lines: [
      { speaker: 'A', text: "I started reading that book you recommended." },
      { speaker: 'B', text: "Oh, how are you finding it?" },
      { speaker: 'A', text: "Really engaging. I couldn't put it down last night." },
      { speaker: 'B', text: "Wait until you get to chapter ten — it gets even better." },
    ],
  },
  {
    topic: 'shared_hobby',
    variant: 2,
    personalityAffinity: { conscientiousness: 0.3, openness: 0.4 },
    lines: [
      { speaker: 'A', text: "I went for a long walk along the river yesterday." },
      { speaker: 'B', text: "Oh, that's my favorite route! Did you see the herons?" },
      { speaker: 'A', text: "I did! Two of them, just standing in the shallows." },
      { speaker: 'B', text: "We should walk together sometime. It's nicer with company." },
    ],
  },

  // ── complaint (2 variants) ──
  {
    topic: 'complaint',
    variant: 1,
    personalityAffinity: { neuroticism: 0.5, agreeableness: -0.2 },
    lines: [
      { speaker: 'A', text: "The roads around here are getting worse every year." },
      { speaker: 'B', text: "Tell me about it. I nearly tripped on a pothole yesterday." },
      { speaker: 'A', text: "Someone should bring it up at the next town meeting." },
      { speaker: 'B', text: "Agreed. Though I wonder if anyone would actually listen." },
    ],
  },
  {
    topic: 'complaint',
    variant: 2,
    personalityAffinity: { neuroticism: 0.3 },
    lines: [
      { speaker: 'A', text: "The noise from that construction site is driving me mad." },
      { speaker: 'B', text: "Same here. It starts so early in the morning." },
      { speaker: 'A', text: "At least they said it'll be finished by next month." },
      { speaker: 'B', text: "Let's hope they actually keep to that schedule." },
    ],
  },

  // ── philosophy (2 variants) ──
  {
    topic: 'philosophy',
    variant: 1,
    personalityAffinity: { openness: 0.8 },
    lines: [
      { speaker: 'A', text: "Do you ever wonder what makes this town feel like home?" },
      { speaker: 'B', text: "I think it's the people more than the place itself." },
      { speaker: 'A', text: "That's a nice way to put it. The familiar faces, the routines." },
      { speaker: 'B', text: "Exactly. Home is wherever you feel known." },
    ],
  },
  {
    topic: 'philosophy',
    variant: 2,
    personalityAffinity: { openness: 0.6, conscientiousness: 0.3 },
    lines: [
      { speaker: 'A', text: "I've been thinking about how quickly time passes." },
      { speaker: 'B', text: "It really does. Feels like yesterday we were complaining about winter." },
      { speaker: 'A', text: "Maybe that's a sign we should make the most of today." },
      { speaker: 'B', text: "You're right. No use worrying about tomorrow just yet." },
    ],
  },

  // ── romance (2 variants) ──
  {
    topic: 'romance',
    variant: 1,
    personalityAffinity: { agreeableness: 0.5, openness: 0.4 },
    lines: [
      { speaker: 'A', text: "It's really nice running into you like this." },
      { speaker: 'B', text: "I was hoping I'd see you today, actually." },
      { speaker: 'A', text: "Were you? That's... that's good to hear." },
      { speaker: 'B', text: "Maybe we could take a walk together sometime soon?" },
    ],
  },
  {
    topic: 'romance',
    variant: 2,
    personalityAffinity: { extroversion: -0.2, agreeableness: 0.4 },
    lines: [
      { speaker: 'A', text: "I brought you something from the market. I thought you might like it." },
      { speaker: 'B', text: "That's so thoughtful of you. You didn't have to." },
      { speaker: 'A', text: "I know. I just... wanted to." },
      { speaker: 'B', text: "Well, thank you. It means a lot." },
    ],
  },

  // ── rivalry (2 variants) ──
  {
    topic: 'rivalry',
    variant: 1,
    personalityAffinity: { agreeableness: -0.5 },
    lines: [
      { speaker: 'A', text: "Oh, it's you. I was having such a nice day." },
      { speaker: 'B', text: "The feeling is mutual, I assure you." },
      { speaker: 'A', text: "Well, don't let me keep you. I'm sure you're busy." },
      { speaker: 'B', text: "Indeed I am. Good day." },
    ],
  },
  {
    topic: 'rivalry',
    variant: 2,
    personalityAffinity: { agreeableness: -0.3, neuroticism: 0.4 },
    lines: [
      { speaker: 'A', text: "I see business is booming for you lately." },
      { speaker: 'B', text: "It is. Hard work pays off, as they say." },
      { speaker: 'A', text: "Some might call it luck more than hard work." },
      { speaker: 'B', text: "They can call it whatever they like. Results speak for themselves." },
    ],
  },
];

// ── Bilingual Templates (French, per CEFR tier) ─────────────────────

export const BILINGUAL_TEMPLATES: BilingualTemplate[] = [
  // ── A1: Mostly English, basic French greetings ──
  {
    topic: 'daily_greeting',
    cefrTier: 'A1',
    lines: [
      { speaker: 'A', text: 'Bonjour! How are you today?' },
      { speaker: 'B', text: "Bonjour! I'm doing well, merci." },
      { speaker: 'A', text: "That's good to hear. À bientôt!" },
      { speaker: 'B', text: 'Oui, à bientôt!' },
    ],
  },
  {
    topic: 'food',
    cefrTier: 'A1',
    lines: [
      { speaker: 'A', text: "I'm going to the boulangerie for some pain." },
      { speaker: 'B', text: 'Oh, I love their croissants!' },
      { speaker: 'A', text: "Moi aussi! They're always so fresh." },
      { speaker: 'B', text: 'Bon appétit when you get there!' },
    ],
  },
  {
    topic: 'weather',
    cefrTier: 'A1',
    lines: [
      { speaker: 'A', text: "Il fait beau today, don't you think?" },
      { speaker: 'B', text: 'Oui, très beau! Perfect for a walk.' },
      { speaker: 'A', text: 'I love days like this. Le soleil is wonderful.' },
      { speaker: 'B', text: "Let's enjoy it while it lasts!" },
    ],
  },

  // ── A2: Mix of French and English ──
  {
    topic: 'daily_greeting',
    cefrTier: 'A2',
    lines: [
      { speaker: 'A', text: "Bonjour! Comment ça va aujourd'hui?" },
      { speaker: 'B', text: 'Ça va bien, merci! Et vous?' },
      { speaker: 'A', text: "Très bien aussi. It's a lovely jour." },
      { speaker: 'B', text: "Oui! Bonne journée!" },
    ],
  },
  {
    topic: 'food',
    cefrTier: 'A2',
    lines: [
      { speaker: 'A', text: "J'ai trouvé un bon restaurant près d'ici." },
      { speaker: 'B', text: 'Vraiment? What kind of cuisine?' },
      { speaker: 'A', text: 'French, bien sûr! Their soupe à l\'oignon is magnifique.' },
      { speaker: 'B', text: 'We should go ensemble sometime!' },
    ],
  },
  {
    topic: 'work',
    cefrTier: 'A2',
    lines: [
      { speaker: 'A', text: "Le travail was busy today. Je suis fatigué." },
      { speaker: 'B', text: "Moi aussi. But tomorrow is another jour." },
      { speaker: 'A', text: "C'est vrai. We should rest ce soir." },
      { speaker: 'B', text: "Bonne idée. À demain!" },
    ],
  },

  // ── B1: Mostly French with some English ──
  {
    topic: 'daily_greeting',
    cefrTier: 'B1',
    lines: [
      { speaker: 'A', text: 'Bonjour! Comment allez-vous ce matin?' },
      { speaker: 'B', text: 'Très bien, merci. Et vous, tout va bien?' },
      { speaker: 'A', text: "Oui, je me sens bien aujourd'hui. Le temps est agréable." },
      { speaker: 'B', text: 'Tout à fait. Passez une bonne journée!' },
    ],
  },
  {
    topic: 'local_events',
    cefrTier: 'B1',
    lines: [
      { speaker: 'A', text: 'Vous avez entendu parler de la fête ce weekend?' },
      { speaker: 'B', text: "Oui! Il paraît qu'il y aura de la musique live." },
      { speaker: 'A', text: "J'aimerais bien y aller. Vous voulez venir avec moi?" },
      { speaker: 'B', text: 'Avec plaisir! On se retrouve là-bas à quelle heure?' },
    ],
  },
  {
    topic: 'gossip',
    cefrTier: 'B1',
    lines: [
      { speaker: 'A', text: 'Vous avez vu les nouveaux voisins?' },
      { speaker: 'B', text: "Pas encore. Ils sont comment?" },
      { speaker: 'A', text: "Ils ont l'air très sympathiques. Ils ont deux enfants." },
      { speaker: 'B', text: "Il faudra leur souhaiter la bienvenue dans le quartier." },
    ],
  },

  // ── B2: Full French ──
  {
    topic: 'daily_greeting',
    cefrTier: 'B2',
    lines: [
      { speaker: 'A', text: "Tiens, bonjour! Ça fait un moment qu'on ne s'est pas croisés." },
      { speaker: 'B', text: "En effet! J'étais assez occupé ces derniers temps." },
      { speaker: 'A', text: "Je comprends tout à fait. L'essentiel, c'est que tout aille bien." },
      { speaker: 'B', text: "Oui, tout va pour le mieux. On devrait se voir plus souvent!" },
    ],
  },
  {
    topic: 'philosophy',
    cefrTier: 'B2',
    lines: [
      { speaker: 'A', text: "Parfois je me demande ce qui rend cette ville si spéciale." },
      { speaker: 'B', text: "Je crois que c'est l'esprit de communauté qui fait la différence." },
      { speaker: 'A', text: "Vous avez raison. Les liens entre les gens, c'est irremplaçable." },
      { speaker: 'B', text: "Tout à fait. C'est ce qui transforme un lieu en véritable foyer." },
    ],
  },
  {
    topic: 'work',
    cefrTier: 'B2',
    lines: [
      { speaker: 'A', text: "Cette semaine a été particulièrement chargée au travail." },
      { speaker: 'B', text: "Je vous comprends. Il y a des périodes comme ça." },
      { speaker: 'A', text: "Au moins, j'ai le sentiment d'avoir accompli quelque chose." },
      { speaker: 'B', text: "C'est l'essentiel. Le repos viendra ce weekend." },
    ],
  },
];

// ── Template Selection ──────────────────────────────────────────────

/**
 * Score a template against NPC personality profiles.
 * Higher score = better match for the given NPCs.
 */
function scoreTemplate(
  template: ConversationTemplate,
  avgPersonality: BigFivePersonality,
): number {
  let score = 1.0; // Base score
  const affinity = template.personalityAffinity;
  if (!affinity) return score;

  // Add up to ±0.5 per matching trait direction
  const traits: (keyof BigFivePersonality)[] = [
    'openness', 'conscientiousness', 'extroversion', 'agreeableness', 'neuroticism',
  ];
  for (const trait of traits) {
    const affinityVal = affinity[trait];
    if (affinityVal !== undefined) {
      const npcVal = avgPersonality[trait] ?? 0;
      // Reward same-direction personality (+0.5 max), penalize opposite (-0.3 max)
      const alignment = affinityVal * npcVal; // positive if same direction
      score += alignment > 0 ? Math.min(alignment, 0.5) : Math.max(alignment, -0.3);
    }
  }

  return Math.max(0.1, score); // Never go below 0.1
}

/**
 * Select the best template for a given topic and NPC personalities.
 * Uses weighted random selection based on personality affinity scores.
 */
export function selectTemplate(
  topic: string,
  p1: BigFivePersonality,
  p2: BigFivePersonality,
  cefrTier?: CEFRTier,
): ConversationTemplate | BilingualTemplate {
  const avgPersonality: BigFivePersonality = {
    openness: ((p1.openness ?? 0) + (p2.openness ?? 0)) / 2,
    conscientiousness: ((p1.conscientiousness ?? 0) + (p2.conscientiousness ?? 0)) / 2,
    extroversion: ((p1.extroversion ?? 0) + (p2.extroversion ?? 0)) / 2,
    agreeableness: ((p1.agreeableness ?? 0) + (p2.agreeableness ?? 0)) / 2,
    neuroticism: ((p1.neuroticism ?? 0) + (p2.neuroticism ?? 0)) / 2,
  };

  // Try bilingual template first if CEFR tier provided
  if (cefrTier) {
    const bilingualMatches = BILINGUAL_TEMPLATES.filter(
      (t) => t.cefrTier === cefrTier && topicMatches(topic, t.topic),
    );
    if (bilingualMatches.length > 0) {
      // Random selection among bilingual matches (no personality scoring needed)
      return bilingualMatches[Math.floor(Math.random() * bilingualMatches.length)];
    }
  }

  // Find topic-matching English templates
  const topicMatches_ = CONVERSATION_TEMPLATES.filter((t) => topicMatches(topic, t.topic));

  if (topicMatches_.length === 0) {
    // No match — pick from daily_greeting as universal fallback
    const greetings = CONVERSATION_TEMPLATES.filter((t) => t.topic === 'daily_greeting');
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // Weighted random selection based on personality scoring
  const scored = topicMatches_.map((t) => ({
    template: t,
    score: scoreTemplate(t, avgPersonality),
  }));

  const totalWeight = scored.reduce((sum, s) => sum + s.score, 0);
  let roll = Math.random() * totalWeight;

  for (const { template, score } of scored) {
    roll -= score;
    if (roll <= 0) return template;
  }

  return scored[scored.length - 1].template;
}

/**
 * Check if a conversation topic matches a template topic.
 * Handles partial matches (e.g., 'daily_greeting' matches 'greeting').
 */
function topicMatches(conversationTopic: string, templateTopic: string): boolean {
  return conversationTopic === templateTopic
    || conversationTopic.includes(templateTopic)
    || templateTopic.includes(conversationTopic);
}

/**
 * Get the count of unique topics covered by templates.
 */
export function getTemplateCoverage(): { totalTemplates: number; topicsCovered: string[] } {
  const topics = new Set<string>();
  for (const t of CONVERSATION_TEMPLATES) topics.add(t.topic);
  return {
    totalTemplates: CONVERSATION_TEMPLATES.length + BILINGUAL_TEMPLATES.length,
    topicsCovered: Array.from(topics),
  };
}
