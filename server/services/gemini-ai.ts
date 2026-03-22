import { getGenAI, isGeminiConfigured, GEMINI_MODELS, THINKING_LEVELS } from "../config/gemini.js";

export async function generateRule(prompt: string, sourceFormat: string): Promise<string> {
  if (!isGeminiConfigured()) {
    throw new Error("Gemini API key is not configured");
  }

  const ai = getGenAI();

  let formatExample = '';
  
  if (sourceFormat === 'insimul') {
    formatExample = `For Insimul format, use this structure:
rule rule_name {
  when (
    condition1 and
    condition2
  )
  then {
    effect1
    effect2
  }
  priority: 5
  tags: [tag1, tag2]
}`;
  } else if (sourceFormat === 'ensemble') {
    formatExample = `For Ensemble format, use JSON structure:
{
  "triggerRules": {
    "fileName": "triggerRules",
    "type": "trigger",
    "rules": [
      {
        "name": "rule_name",
        "conditions": [
          {
            "category": "relationship",
            "type": "parent_of",
            "first": "?x",
            "second": "?y"
          }
        ],
        "effects": [
          {
            "category": "status",
            "type": "inherit_title",
            "first": "?y",
            "value": true
          }
        ]
      }
    ]
  }
}`;
  } else if (sourceFormat === 'kismet') {
    formatExample = `For Kismet format, use Prolog-style syntax:
default trait trait_name(>Self, <Other):
  +++condition1,
  +++condition2.
  likelihood: 0.8`;
  } else if (sourceFormat === 'tott') {
    formatExample = `For Talk of the Town format, use JSON structure:
{
  "trigger_rules": [
    {
      "name": "rule_name",
      "type": "trigger",
      "priority": 5,
      "conditions": [
        {
          "type": "predicate",
          "predicate": "is_married",
          "first": "?person"
        }
      ],
      "effects": [
        {
          "type": "set",
          "target": "?person",
          "action": "relationship_status",
          "value": "married"
        }
      ],
      "tags": ["marriage", "relationship"],
      "active": true
    }
  ]
}`;
  }

  const systemPrompt = `You are an expert in narrative AI systems and rule generation. Generate a single rule based on the user's prompt for the ${sourceFormat} system format.

${formatExample}

Generate a complete, syntactically correct rule that implements the user's request. Be creative but realistic. Return ONLY the rule code in the proper format for ${sourceFormat}, no explanations or markdown.`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODELS.PRO,
    config: {
      systemInstruction: systemPrompt,
      thinkingConfig: { thinkingLevel: THINKING_LEVELS.MEDIUM },
    },
    contents: `Generate a ${sourceFormat} rule for: ${prompt}`,
  });

  if (!response.text) {
    throw new Error("AI service returned empty response");
  }

  return response.text;
}

export async function generateBulkRules(prompt: string, sourceFormat: string): Promise<string> {
  if (!isGeminiConfigured()) {
    throw new Error("Gemini API key is not configured");
  }

  const ai = getGenAI();

  let formatExample = '';
  
  if (sourceFormat === 'insimul') {
    formatExample = `For Insimul format, generate multiple rules like:
rule rule_name_1 {
  when (condition1)
  then { effect1 }
  priority: 5
}

rule rule_name_2 {
  when (condition2)
  then { effect2 }
  priority: 5
}`;
  } else if (sourceFormat === 'ensemble') {
    formatExample = `For Ensemble format, generate multiple rules in JSON:
{
  "triggerRules": {
    "fileName": "triggerRules",
    "type": "trigger",
    "rules": [
      {
        "name": "rule1",
        "conditions": [...],
        "effects": [...]
      },
      {
        "name": "rule2",
        "conditions": [...],
        "effects": [...]
      }
    ]
  }
}`;
  } else if (sourceFormat === 'kismet') {
    formatExample = `For Kismet format, generate multiple traits:
default trait trait_name_1(>Self):
  +++condition1.
  likelihood: 0.8

default trait trait_name_2(>Self):
  +++condition2.
  likelihood: 0.7`;
  } else if (sourceFormat === 'tott') {
    formatExample = `For Talk of the Town format, generate multiple rules in JSON:
{
  "trigger_rules": [
    {
      "name": "rule1",
      "type": "trigger",
      "conditions": [...],
      "effects": [...]
    },
    {
      "name": "rule2",
      "type": "trigger",
      "conditions": [...],
      "effects": [...]
    }
  ]
}`;
  }

  const systemPrompt = `You are an expert in narrative AI systems and rule generation. Generate MULTIPLE related rules based on the user's prompt for the ${sourceFormat} system format.

${formatExample}

Generate multiple complete, syntactically correct rules that work together to implement the user's request. Create at least 3-5 related rules that complement each other. Be creative but realistic. Return ONLY the rule code in the proper format for ${sourceFormat}, no explanations or markdown.`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODELS.PRO,
    config: {
      systemInstruction: systemPrompt,
      thinkingConfig: { thinkingLevel: THINKING_LEVELS.MEDIUM },
    },
    contents: `Generate multiple ${sourceFormat} rules for: ${prompt}`,
  });

  if (!response.text) {
    throw new Error("AI service returned empty response");
  }

  return response.text;
}

export interface GeneratedQuest {
  title: string;
  description: string;
  questType: 'main' | 'side' | 'character';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  objectives: Array<{
    type: string;
    description: string;
    target?: string;
    required?: number;
  }>;
  rewards?: {
    experience?: number;
    gold?: number;
    items?: Array<{ name: string; quantity: number }>;
  };
}

export async function generateQuests(worldContext: string, count: number = 5): Promise<GeneratedQuest[]> {
  if (!isGeminiConfigured()) {
    throw new Error("Gemini API key is not configured");
  }

  const ai = getGenAI();

  const systemPrompt = `You are a quest designer for narrative RPG worlds. Generate quests as a JSON array.

Each quest must have this exact structure:
{
  "title": "Short quest title",
  "description": "A paragraph describing the quest story and goals.",
  "questType": "main" | "side" | "character",
  "difficulty": "beginner" | "intermediate" | "advanced" | "expert",
  "objectives": [
    { "type": "reach_location" | "talk_to_npc" | "collect_items" | "defeat_enemies" | "escort" | "investigate", "description": "What to do", "target": "target_id", "required": 1 }
  ],
  "rewards": { "experience": 100, "gold": 50 }
}

Return ONLY a valid JSON array of quest objects. No markdown, no code fences, no explanation.`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODELS.PRO,
    config: {
      systemInstruction: systemPrompt,
      thinkingConfig: { thinkingLevel: THINKING_LEVELS.MEDIUM },
    },
    contents: `Generate ${count} quests for this world: ${worldContext}. Include a mix of main quests, side quests, and character-driven storylines.`,
  });

  if (!response.text) {
    throw new Error("AI service returned empty response");
  }

  // Strip markdown fences if present
  let text = response.text.trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }

  const parsed = JSON.parse(text);
  const quests: GeneratedQuest[] = Array.isArray(parsed) ? parsed : [parsed];

  // Validate and sanitize each quest
  return quests.map(q => ({
    title: String(q.title || 'Untitled Quest').slice(0, 200),
    description: String(q.description || '').slice(0, 2000),
    questType: ['main', 'side', 'character'].includes(q.questType) ? q.questType : 'side',
    difficulty: ['beginner', 'intermediate', 'advanced', 'expert'].includes(q.difficulty) ? q.difficulty : 'intermediate',
    objectives: Array.isArray(q.objectives) ? q.objectives.map((o: any) => ({
      type: String(o.type || 'investigate'),
      description: String(o.description || ''),
      target: o.target ? String(o.target) : undefined,
      required: typeof o.required === 'number' ? o.required : undefined,
    })) : [],
    rewards: q.rewards ? {
      experience: typeof q.rewards.experience === 'number' ? q.rewards.experience : undefined,
      gold: typeof q.rewards.gold === 'number' ? q.rewards.gold : undefined,
      items: Array.isArray(q.rewards.items) ? q.rewards.items : undefined,
    } : undefined,
  }));
}

export async function editRuleWithAI(currentContent: string, editInstructions: string, sourceFormat: string): Promise<string> {
  if (!isGeminiConfigured()) {
    throw new Error("Gemini API key is not configured");
  }

  const ai = getGenAI();

  const systemPrompt = `You are an expert in narrative AI systems and rule editing. You will receive existing rule code and instructions for how to modify it.

For Insimul format:
rule rule_name {
  when (
    conditions here
  )
  then {
    effects here
  }
  priority: number
  tags: [tag1, tag2]
}

For Ensemble format:
rule rule_name {
  when (Person(?x) and condition(?x))
  then {
    effect(?x)
  }
}

For Kismet format:
default trait trait_name(>Self):
  +++condition.
  likelihood: 0.8

Modify the existing rule according to the user's instructions. Maintain the ${sourceFormat} format and correct syntax. Return ONLY the modified rule code, no explanations.`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODELS.PRO,
    config: {
      systemInstruction: systemPrompt,
      thinkingConfig: { thinkingLevel: THINKING_LEVELS.LOW },
    },
    contents: `Current rule:\n\n${currentContent}\n\nEdit instructions: ${editInstructions}\n\nReturn the complete modified rule in ${sourceFormat} format.`,
  });

  if (!response.text) {
    throw new Error("AI service returned empty response");
  }

  return response.text;
}