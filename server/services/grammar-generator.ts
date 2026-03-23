/**
 * AI-Powered Grammar Generator
 * Uses an LLM provider to generate Tracery grammars from natural language descriptions
 */

import { type ILLMProvider, createLLMProvider } from './llm-provider.js';

interface GrammarGenerationRequest {
  description: string;
  theme?: string;
  complexity?: 'simple' | 'medium' | 'complex';
  symbolCount?: number;
  worldContext?: {
    worldName?: string;
    worldDescription?: string;
    culturalValues?: any;
  };
}

/** Rich world context for grammar generation */
export interface GrammarWorldContext {
  worldName?: string;
  worldDescription?: string;
  worldType?: string;
  gameType?: string;
  targetLanguage?: string;
  countryName?: string;
  countryDescription?: string;
  governmentType?: string;
  economicSystem?: string;
  terrain?: string;
  customPrompt?: string;
}

interface GeneratedGrammar {
  name: string;
  description: string;
  grammar: Record<string, string | string[]>;
  tags: string[];
}

export class GrammarGenerator {
  private provider: ILLMProvider;

  constructor(provider?: ILLMProvider) {
    this.provider = provider ?? createLLMProvider({ provider: 'gemini' });
  }

  /**
   * Generate a Tracery grammar from a natural language description
   */
  async generateGrammar(request: GrammarGenerationRequest): Promise<GeneratedGrammar> {
    const prompt = this.buildPrompt(request);

    try {
      const result = await this.provider.generate({ prompt });

      // Parse the AI response
      const generated = this.parseResponse(result.text, request);

      // Validate the generated grammar
      this.validateGrammar(generated.grammar);

      return generated;
    } catch (error) {
      console.error('Error generating grammar:', error);
      throw new Error(`Failed to generate grammar: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extend an existing grammar with new variations
   */
  async extendGrammar(
    existingGrammar: Record<string, string | string[]>,
    extensionTheme: string,
    addRules: number = 5
  ): Promise<Record<string, string | string[]>> {
    const prompt = `You are extending an existing Tracery grammar with new variations.

Existing Grammar:
${JSON.stringify(existingGrammar, null, 2)}

Extension Theme: ${extensionTheme}
Add approximately ${addRules} new variations to relevant symbols.

Instructions:
1. Keep all existing symbols and values
2. Add ${addRules} new variations that fit the extension theme
3. Maintain consistency with the existing style
4. Return ONLY valid JSON in Tracery format
5. Do not explain, just return the JSON

Return the extended grammar as JSON:`;

    try {
      const result = await this.provider.generate({ prompt });
      const extended = this.extractJSON(result.text);

      this.validateGrammar(extended);
      return extended;
    } catch (error) {
      console.error('Error extending grammar:', error);
      throw new Error(`Failed to extend grammar: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a grammar from example outputs
   */
  async grammarFromExamples(
    examples: string[],
    symbolName: string = 'origin'
  ): Promise<Record<string, string | string[]>> {
    const prompt = `You are creating a Tracery grammar by analyzing example outputs.

Examples:
${examples.map((ex, i) => `${i + 1}. "${ex}"`).join('\n')}

Instructions:
1. Analyze the examples to identify patterns and variations
2. Extract common structures and create reusable symbols
3. Create a Tracery grammar that can generate similar outputs
4. The main symbol should be "${symbolName}"
5. Create sub-symbols for repeated patterns
6. Return ONLY valid JSON in Tracery format
7. Do not explain, just return the JSON

Example Tracery format:
{
  "origin": ["#greeting# #name#!"],
  "greeting": ["Hello", "Hi", "Greetings"],
  "name": ["World", "Friend", "Traveler"]
}

Return the grammar as JSON:`;

    try {
      const result = await this.provider.generate({ prompt });
      const grammar = this.extractJSON(result.text);

      this.validateGrammar(grammar);
      return grammar;
    } catch (error) {
      console.error('Error creating grammar from examples:', error);
      throw new Error(`Failed to create grammar from examples: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /** All grammar categories we generate */
  static readonly GRAMMAR_CATEGORIES = [
    'character', 'settlement', 'business', 'country', 'street', 'item', 'action', 'quest'
  ] as const;

  /**
   * Generate custom grammars for a world type.
   * Creates 8 grammars covering all name types: character, settlement, business,
   * country, street, item, action, and quest.
   * Uses rich world context to produce culturally specific, expansive grammars.
   * Generates in parallel batches to minimize wall-clock time.
   */
  async generateCustomGrammars(
    customLabel: string,
    customPrompt: string,
    targetLanguage?: string,
    worldContext?: GrammarWorldContext,
    onProgress?: (message: string, batchIndex: number, totalBatches: number) => void
  ): Promise<GeneratedGrammar[]> {
    console.log(`🎨 Generating custom grammars for: ${customLabel}${targetLanguage ? ` (target language: ${targetLanguage})` : ''}`);

    // Build a rich context block shared across all grammar prompts
    const ctx = worldContext || {};
    let contextBlock = '';
    if (ctx.worldName) contextBlock += `World Name: ${ctx.worldName}\n`;
    if (ctx.worldType) contextBlock += `World Type: ${ctx.worldType}\n`;
    if (customLabel !== ctx.worldType) contextBlock += `World Type Label: ${customLabel}\n`;
    if (ctx.worldDescription) contextBlock += `World Description: ${ctx.worldDescription}\n`;
    if (ctx.countryName) contextBlock += `Country: ${ctx.countryName}${ctx.countryDescription ? ` — ${ctx.countryDescription}` : ''}\n`;
    if (ctx.governmentType) contextBlock += `Government: ${ctx.governmentType}\n`;
    if (ctx.economicSystem) contextBlock += `Economy: ${ctx.economicSystem}\n`;
    if (ctx.terrain) contextBlock += `Terrain: ${ctx.terrain}\n`;
    if (ctx.gameType) contextBlock += `Game Type: ${ctx.gameType}\n`;
    if (customPrompt) contextBlock += `Theme/Setting: ${customPrompt}\n`;

    // Helper function for retry with exponential backoff
    const retryWithBackoff = async <T>(
      fn: () => Promise<T>,
      grammarType: string,
      maxRetries: number = 3,
      initialDelay: number = 2000
    ): Promise<T> => {
      let lastError: Error | null = null;
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          return await fn();
        } catch (error) {
          lastError = error as Error;
          if (attempt < maxRetries - 1) {
            const delay = initialDelay * Math.pow(2, attempt);
            console.log(`    ⏳ Retry ${attempt + 1}/${maxRetries - 1} for ${grammarType} in ${delay / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      throw lastError;
    };

    const labelSlug = customLabel.toLowerCase().replace(/\s+/g, '_');

    type CategoryType = typeof GrammarGenerator.GRAMMAR_CATEGORIES[number];

    const tagMap: Record<CategoryType, string[]> = {
      character: ['generated', 'names', 'character', customLabel],
      settlement: ['generated', 'names', 'settlement', 'location', customLabel],
      business: ['generated', 'names', 'business', 'establishment', customLabel],
      country: ['generated', 'names', 'country', customLabel],
      street: ['generated', 'names', 'street', 'road', customLabel],
      item: ['generated', 'names', 'item', customLabel],
      action: ['generated', 'names', 'action', customLabel],
      quest: ['generated', 'names', 'quest', customLabel],
    };

    // Generate all 8 grammars in parallel batches of 4 to avoid rate limits
    const categories = [...GrammarGenerator.GRAMMAR_CATEGORIES];
    const grammars: GeneratedGrammar[] = [];
    const batchSize = 4;

    for (let batchStart = 0; batchStart < categories.length; batchStart += batchSize) {
      const batch = categories.slice(batchStart, batchStart + batchSize);
      const batchIndex = Math.floor(batchStart / batchSize);
      const totalBatches = Math.ceil(categories.length / batchSize);
      console.log(`  📝 Generating batch ${batchIndex + 1}: ${batch.join(', ')}...`);
      onProgress?.(`Generating batch ${batchIndex + 1}/${totalBatches}: ${batch.join(', ')}...`, batchIndex, totalBatches);

      const results = await Promise.allSettled(
        batch.map(category =>
          retryWithBackoff(
            () => this.generateNameGrammar(category, customLabel, targetLanguage, contextBlock),
            `${category} names`
          ).then(grammar => ({
            category,
            grammar,
          }))
        )
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          const { category, grammar } = result.value;
          grammars.push({
            name: `${labelSlug}_${category}_names`,
            description: `${category.charAt(0).toUpperCase() + category.slice(1)} names for ${customLabel} world${ctx.worldName ? ` "${ctx.worldName}"` : ''}`,
            grammar,
            tags: tagMap[category as CategoryType],
          });
          console.log(`  ✅ ${category} names generated (${Object.keys(grammar).length} symbols)`);
        } else {
          console.error(`  ❌ Failed to generate ${(result as any).reason?.category || 'unknown'} names: ${result.reason}`);
        }
      }
    }

    console.log(`✅ ${grammars.length}/${categories.length} grammars generated for ${customLabel}`);
    return grammars;
  }

  /**
   * Generate a rich, expansive Tracery grammar for a specific name category.
   * Produces 12-20 symbols with 10-20+ items each for high combinatorial variety.
   */
  private async generateNameGrammar(
    category: typeof GrammarGenerator.GRAMMAR_CATEGORIES[number],
    worldLabel: string,
    targetLanguage?: string,
    contextBlock?: string
  ): Promise<Record<string, string | string[]>> {
    const langDirective = targetLanguage
      ? `CRITICAL: All names MUST be in ${targetLanguage}. Use authentic ${targetLanguage} naming conventions, vocabulary, and cultural patterns. Do NOT use English names or anglicized versions.`
      : '';

    const categoryPrompts: Record<string, string> = {
      character: `Generate a Tracery grammar for CHARACTER NAMES in this world.

The grammar must produce full names (first + last).
Include:
- "origin" — patterns combining first and last names, e.g. ["#maleFirst# #surname#", "#femaleFirst# #surname#"]
- "maleFirst" — at least 20 male first names authentic to this setting
- "femaleFirst" — at least 20 female first names authentic to this setting
- "surname" — at least 15 standalone surnames PLUS compositional patterns like "#surnamePrefix##surnameSuffix#"
- "surnamePrefix" — at least 10 surname prefixes/roots
- "surnameSuffix" — at least 10 surname endings
- Additional symbols for patronymics, nicknames, titles, or cultural naming patterns as appropriate
- "nickname" — at least 10 common nicknames or diminutives for this culture

Names should reflect the specific cultural/regional setting, NOT generic names.`,

      settlement: `Generate a Tracery grammar for SETTLEMENT NAMES (cities, towns, villages) in this world.

The grammar must produce place names with high variety.
Include:
- "origin" — at least 5 structural patterns mixing the symbols below
- "base" — at least 15 standalone settlement base words
- "prefix" — at least 12 geographic/cultural prefixes
- "suffix" — at least 12 settlement type suffixes (equivalent of -ville, -ton, -burg, etc.)
- "feature" — at least 12 geographic feature words (river, hill, bridge, port, etc.)
- "modifier" — at least 10 directional/descriptive modifiers
- "saint" or "notable" — at least 10 culturally significant personal names used in place names
- "river" — at least 10 river/water body names for this region
- "region" — at least 10 regional/landscape terms
- Additional symbols for any culture-specific naming patterns (articles, compound patterns, etc.)

Settlement names should feel like real places from this specific cultural region, not generic fantasy.`,

      business: `Generate a Tracery grammar for BUSINESS/ESTABLISHMENT NAMES in this world.

The grammar must produce shop, restaurant, and service names with variety.
Include:
- "origin" — at least 6 structural patterns (e.g. "#ownerSurname#'s #shopType#", "The #adjective# #shopType#", "#article# #adjective# #noun#")
- "ownerSurname" — at least 15 plausible owner surnames for this culture
- "shopType" — at least 15 types of businesses (bakery, tavern, smithy, market, etc.) in the target language
- "adjective" — at least 15 descriptive adjectives (golden, old, grand, little, etc.)
- "noun" — at least 10 evocative nouns used in business names
- "article" — articles/determiners appropriate for this language
- Additional symbols for cultural business naming conventions

Business names should reflect what real businesses would be called in this setting.`,

      country: `Generate a Tracery grammar for COUNTRY/NATION NAMES in this world.

The grammar must produce sovereign nation or kingdom names.
Include:
- "origin" — at least 6 structural patterns (e.g. "The #governmentType# of #placeName#", "#adjective# #landTerm#", "#founderName#'s #landTerm#")
- "placeName" — at least 15 standalone country base names (culturally authentic)
- "adjective" — at least 12 national adjectives (united, holy, grand, free, etc.)
- "landTerm" — at least 10 terms for countries/territories (realm, republic, empire, federation, etc.)
- "governmentType" — at least 8 government type titles (kingdom, duchy, confederation, etc.)
- "founderName" — at least 10 legendary founder/hero names
- "prefix" — at least 10 geographic/cultural prefixes
- "suffix" — at least 10 nation name suffixes (-ia, -land, -stan, etc.)

Country names should feel like real sovereign entities with gravitas and cultural authenticity.`,

      street: `Generate a Tracery grammar for STREET/ROAD NAMES in this world.

The grammar must produce street and road names with variety.
Include:
- "origin" — at least 6 structural patterns (e.g. "#personName# #streetType#", "#adjective# #streetType#", "#streetType# #feature#")
- "personName" — at least 15 culturally authentic personal names used to name streets
- "streetType" — at least 10 road type words (street, avenue, lane, boulevard, road, way, alley, etc.) in the target language
- "adjective" — at least 12 descriptive words (main, grand, high, old, new, broad, narrow, etc.)
- "feature" — at least 12 geographic/landmark features (river, market, church, park, hill, gate, etc.)
- "number" — at least 10 ordinal numbers in the target language (1st, 2nd, 3rd etc.)
- "direction" — at least 4 cardinal directions in the target language
- Additional symbols for culture-specific street naming patterns

Street names should feel like real addresses people would use in this setting.`,

      item: `Generate a Tracery grammar for ITEM NAMES (weapons, tools, food, artifacts, materials) in this world.

The grammar must produce diverse item names across multiple categories.
Include:
- "origin" — at least 8 structural patterns (e.g. "#material# #weaponType#", "#adjective# #foodType#", "#article# #artifact#")
- "material" — at least 12 materials (iron, wood, silver, obsidian, silk, etc.) fitting this world
- "weaponType" — at least 10 weapon/tool types
- "foodType" — at least 10 food/drink items authentic to this culture
- "artifact" — at least 10 artifact/collectible base names
- "adjective" — at least 15 descriptive modifiers (ancient, enchanted, rusty, fresh, etc.)
- "craftedBy" — at least 8 maker/origin descriptors
- "article" — articles appropriate for this language
- Additional symbols for rarity prefixes, material suffixes, and cultural item naming patterns

Items should feel like real objects that exist in this world's economy and culture.`,

      action: `Generate a Tracery grammar for ACTION NAMES (character activities and interactions) in this world.

The grammar must produce thematic action names that characters perform.
Include:
- "origin" — at least 8 structural patterns (e.g. "#verb# #target#", "#adjective# #verb#", "#socialVerb# with #npcRole#")
- "verb" — at least 15 action verbs fitting this world (trade, duel, enchant, negotiate, etc.)
- "socialVerb" — at least 10 social interaction verbs (befriend, persuade, gossip, celebrate, etc.)
- "target" — at least 10 action target objects (goods, information, territory, etc.)
- "adjective" — at least 10 action modifiers (stealthy, bold, diplomatic, etc.)
- "npcRole" — at least 10 NPC roles that can be interaction targets (merchant, guard, elder, etc.)
- "location" — at least 8 locations where actions take place (market, tavern, court, etc.)
- Additional symbols for world-specific activity patterns

Action names should feel like meaningful activities in this world's daily life and culture.`,

      quest: `Generate a Tracery grammar for QUEST TITLES (mission/storyline names) in this world.

The grammar must produce compelling quest titles with narrative flavor.
Include:
- "origin" — at least 8 structural patterns (e.g. "The #adjective# #noun#", "#verb# the #target#", "#npcName#'s #questNoun#")
- "adjective" — at least 15 evocative adjectives (lost, forbidden, ancient, burning, etc.)
- "noun" — at least 15 quest-worthy nouns (artifact, secret, legacy, relic, covenant, etc.)
- "verb" — at least 10 quest action verbs (retrieve, protect, uncover, destroy, etc.)
- "target" — at least 10 quest target objects (crown, scroll, key, tome, etc.)
- "npcName" — at least 10 culturally authentic NPC names used in quest titles
- "questNoun" — at least 10 quest type words (request, trial, bargain, journey, prophecy, etc.)
- "location" — at least 8 evocative place names for quest destinations
- Additional symbols for world-specific quest naming conventions

Quest titles should feel like chapter titles from an adventure story set in this world.`,
    };

    const prompt = `You are an expert in ${targetLanguage || 'English'} naming conventions and Tracery procedural grammar.

WORLD CONTEXT:
${contextBlock || `World Type: ${worldLabel}`}
${langDirective}

${categoryPrompts[category]}

TRACERY FORMAT RULES:
- Use #symbolName# to reference other symbols
- "origin" is the entry point — it MUST exist
- Each symbol maps to an array of strings
- Strings can contain #references# to other symbols
- Use Tracery modifiers INSIDE the hash marks: #name.capitalize# (NOT ((.capitalize)) — that syntax does not work)
- Every #referenced# symbol must be defined

QUALITY REQUIREMENTS:
- Aim for 12-20 symbols total
- Each leaf symbol (no sub-references) should have 10-20+ items
- Compositional symbols (with sub-references) should have 4-8 patterns
- Total combinatorial output should produce 500+ unique names
- Names must be culturally and linguistically authentic to the setting
- NO generic English-default names unless the world is explicitly English-speaking

Return ONLY valid JSON. No markdown fences, no explanation, just the JSON object.`;

    const result = await this.provider.generate({ prompt });
    const grammar = this.extractJSON(result.text);
    this.validateGrammar(grammar);
    return grammar;
  }

  /**
   * Build the generation prompt
   */
  private buildPrompt(request: GrammarGenerationRequest): string {
    const { description, theme, complexity = 'medium', symbolCount = 5, worldContext } = request;

    let contextInfo = '';
    if (worldContext?.worldName) {
      contextInfo += `\nWorld: ${worldContext.worldName}`;
    }
    if (worldContext?.worldDescription) {
      contextInfo += `\nWorld Description: ${worldContext.worldDescription}`;
    }

    const complexityGuide = {
      simple: '3-5 symbols with 2-4 variations each',
      medium: '5-8 symbols with 3-6 variations each',
      complex: '8-12 symbols with 5-10 variations each',
    };

    return `You are a Tracery grammar expert. Create a procedural text generation grammar.

Description: ${description}
${theme ? `Theme: ${theme}` : ''}
Complexity: ${complexity} (${complexityGuide[complexity]})
Target Symbols: ~${symbolCount}${contextInfo}

Tracery Grammar Format:
- Use #symbol# syntax to reference other symbols
- The "origin" symbol is the entry point
- Each symbol maps to an array of possible values
- Values can reference other symbols

Example:
{
  "origin": ["#character# #action# #object#"],
  "character": ["The warrior", "The mage", "The rogue"],
  "action": ["strikes", "enchants", "steals"],
  "object": ["the sword", "the artifact", "the treasure"]
}

Instructions:
1. Create a Tracery grammar that matches the description
2. Include an "origin" symbol as the entry point
3. Create ${symbolCount} symbols with meaningful names
4. Each symbol should have multiple variations
5. Use nested symbol references for complexity
6. Make it thematic and creative
7. Return ONLY valid JSON, no explanations or markdown
8. Ensure all referenced symbols are defined

Return the grammar as JSON:`;
  }

  /**
   * Parse AI response into GeneratedGrammar
   */
  private parseResponse(response: string, request: GrammarGenerationRequest): GeneratedGrammar {
    const grammar = this.extractJSON(response);
    
    // Generate a name based on description
    const name = this.generateName(request.description, request.theme);
    
    // Generate appropriate tags
    const tags = this.generateTags(request);
    
    return {
      name,
      description: request.description,
      grammar,
      tags,
    };
  }

  /**
   * Extract JSON from AI response (handles markdown code blocks)
   */
  private extractJSON(response: string): Record<string, string | string[]> {
    // Remove markdown code blocks if present
    let jsonText = response.trim();
    
    // Remove ```json and ``` markers
    jsonText = jsonText.replace(/^```json\s*/i, '');
    jsonText = jsonText.replace(/^```\s*/, '');
    jsonText = jsonText.replace(/\s*```$/, '');
    
    // Find JSON object
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
    }
  }

  /**
   * Validate grammar structure
   */
  private validateGrammar(grammar: Record<string, string | string[]>): void {
    if (!grammar || typeof grammar !== 'object') {
      throw new Error('Grammar must be an object');
    }
    
    if (!grammar.origin) {
      throw new Error('Grammar must have an "origin" symbol');
    }
    
    // Check that origin is not empty
    const originValues = Array.isArray(grammar.origin) ? grammar.origin : [grammar.origin];
    if (originValues.length === 0 || originValues.every(v => !v)) {
      throw new Error('Grammar "origin" symbol cannot be empty');
    }
    
    // Check for symbols with no values
    for (const [key, value] of Object.entries(grammar)) {
      const values = Array.isArray(value) ? value : [value];
      if (values.length === 0 || values.every(v => !v)) {
        throw new Error(`Symbol "${key}" has no values`);
      }
    }
  }

  /**
   * Generate a name from description
   */
  private generateName(description: string, theme?: string): string {
    const words = description.toLowerCase().split(' ').slice(0, 3);
    const cleanWords = words
      .map(w => w.replace(/[^a-z0-9]/g, ''))
      .filter(w => w.length > 2);
    
    if (cleanWords.length === 0) {
      return theme ? `${theme}_grammar` : 'generated_grammar';
    }
    
    return cleanWords.join('_');
  }

  /**
   * Generate appropriate tags
   */
  private generateTags(request: GrammarGenerationRequest): string[] {
    const tags: string[] = ['generated'];
    
    if (request.theme) {
      tags.push(request.theme.toLowerCase().replace(/\s+/g, '_'));
    }
    
    // Extract key words from description
    const keywords = ['combat', 'dialogue', 'description', 'name', 'location', 'event', 'action', 'quest'];
    const desc = request.description.toLowerCase();
    
    keywords.forEach(keyword => {
      if (desc.includes(keyword)) {
        tags.push(keyword);
      }
    });
    
    return Array.from(new Set(tags)); // Remove duplicates
  }
}

// Export singleton instance
export const grammarGenerator = new GrammarGenerator();
