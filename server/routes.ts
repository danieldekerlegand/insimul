import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from './db/storage';
import { createTelemetryRoutes } from './routes/telemetry-routes';
import { createHistoryRoutes } from './routes/history-routes';
import { createAssessmentRoutes } from './routes/assessment-routes';
import { enrichHistoricalEvents, type WorldContext } from './services/llm-event-enrichment.js';
import { prologAutoSync } from './engines/prolog/prolog-auto-sync';
import { convertActionToProlog } from '../shared/prolog/action-converter';
import { convertQuestToProlog } from '../shared/prolog/quest-converter';
import { extractAllMetadata, extractActionMetadata } from '../shared/prolog/prolog-metadata-extractor';
import { nameGenerator } from './generators/name-generator.js';
import { isGeminiConfigured, getModel, GEMINI_MODELS } from './config/gemini.js';
import {
  generateLanguage,
  getLanguageById,
  getLanguagesByWorld,
  getLanguagesByScope,
  getLanguageChatHistory,
  sendLanguageChatMessage
} from "./services/language-service.js";
import { grammarTemplates, getCategories as getGrammarCategories, getAllTags as getAllGrammarTags, getTemplate as getGrammarTemplate } from './services/grammar-templates.js';
import { seedGrammars } from './seed/seed-grammars.js';
import {
  insertRuleSchema,
  insertGrammarSchema,
  insertCharacterSchema,
  insertWorldSchema,
  insertCountrySchema,
  insertStateSchema,
  insertSettlementSchema,
  insertSimulationSchema,
  insertActionSchema,
  insertTruthSchema,
  insertItemSchema,
  insertVisualAssetSchema,
  type InsertRule,
  type Rule
} from "@shared/schema";
import { z } from "zod";
import { addImpulse, getImpulseStrength, decayImpulses } from "./extensions/kismet/impulse-system.js";
import { setRelationship, modifyRelationship, queryRelationships } from "./extensions/tott/relationship-utils.js";
import { selectVolition } from "./extensions/kismet/volition-system.js";
import { 
  evaluateCandidate, 
  fillVacancy, 
  fireEmployee, 
  findCandidates,
  getBusinessEmployees,
  getOccupationHistory,
  promoteEmployee 
} from "./extensions/tott/hiring-system.js";
import { 
  generateEvent, 
  getCharacterEvents, 
  getWorldEvents, 
  triggerAutomaticEvents,
  createBirthEvent,
  createMarriageEvent 
} from "./extensions/tott/event-system.js";
import { 
  setRoutine, 
  getCurrentActivity, 
  getCharactersAtLocation, 
  updateWhereabouts, 
  generateDefaultRoutine,
  getRoutine,
  updateAllWhereabouts 
} from "./extensions/tott/routine-system.js";
import {
  getRelationshipDetails,
  updateRelationship,
  getSalience,
  updateSalience,
  getMostSalientPeople,
  socialize,
  simulateLocationSocializing,
  getSocialSummary
} from "./extensions/tott/social-dynamics-system.js";
import {
  initializeMentalModel,
  getMentalModel,
  addKnownFact,
  addKnownValue,
  addBelief,
  propagateKnowledge,
  propagateAllKnowledge,
  initializeCoworkerKnowledge,
  initializeFamilyKnowledge,
  getKnowledgeSummary
} from "./extensions/tott/knowledge-system.js";
import {
  startConversation,
  continueConversation,
  endConversation,
  simulateConversation,
  getConversation,
  getCharacterConversationHistory
} from "./extensions/tott/conversation-system.js";
import {
  getWealth,
  addMoney,
  subtractMoney,
  transferMoney,
  getWealthDistribution,
  hireEmployee as economicsHireEmployee,
  fireEmployee as economicsFireEmployee,
  promoteEmployee as economicsPromoteEmployee,
  paySalaries,
  executeTrade,
  getTradeHistory,
  getMarketData,
  updateMarketPrice,
  createLoan,
  repayDebt,
  getCharacterDebts,
  getEconomicStats,
  getUnemploymentRate
} from "./extensions/tott/economics-system.js";
import {
  scheduleEvent,
  startEvent,
  endEvent,
  addAttendee,
  removeAttendee,
  getEvent,
  getWorldEvents as getTownEvents,
  getUpcomingEvents,
  scheduleFestival,
  scheduleMarket,
  scheduleWedding,
  scheduleFuneral,
  triggerDisaster,
  scheduleCommunityMeeting,
  getCommunityMorale,
  adjustCommunityMorale,
  getEventHistory,
  populateEventAttendance,
  checkRandomEvents
} from "./extensions/tott/town-events-system.js";
import { 
  foundBusiness, 
  closeBusiness, 
  transferOwnership, 
  getBusinessSummary,
  getCharacterBusinesses,
  getBusinessesByStatus,
  getBusinessStatistics 
} from "./extensions/tott/business-system.js";
import { WorldGenerator } from "./generators/world-generator.js";
import { registerAuthRoutes } from "./routes/auth-routes.js";
import { registerPlaythroughRoutes } from "./routes/playthrough-routes.js";
import { registerExportRoutes } from "./routes/export-routes.js";
import { AuthService } from "./services/auth-service.js";
import { autoLinkTruth } from "./services/truth-auto-linker.js";
import { canEditWorld, canAccessWorld } from "./middleware/permissions.js";

// Helper function to generate narrative text from actual characters
function generateNarrative(characters: any[]): string {
  if (characters.length === 0) {
    return "The simulation runs its course, with various events unfolding across the realm.";
  }
  
  const character = characters[Math.floor(Math.random() * characters.length)];
  const name = `${character.firstName} ${character.lastName}`;
  const title = character.socialAttributes?.title || "a notable figure";
  
  const narrativeTemplates = [
    `${name}, ${title}, takes decisive action that will shape the future of the realm.`,
    `The actions of ${name} set in motion a chain of events affecting the social fabric of the world.`,
    `${name} navigates complex social dynamics, their choices rippling through the community.`,
    `As ${title}, ${name} faces challenges that test their resolve and influence.`,
    `The story of ${name} unfolds, intertwining with the fates of others in unexpected ways.`,
  ];
  
  return narrativeTemplates[Math.floor(Math.random() * narrativeTemplates.length)];
}

// Helper function to generate detailed simulation results from actual data
async function generateDetailedResults(
  worldId: string,
  rulesCount: number, 
  eventsCount: number, 
  charactersCount: number
) {
  // Fetch actual rules and characters from the database
  const rules = await storage.getRulesByWorld(worldId);
  const characters = await storage.getCharactersByWorld(worldId);
  
  // Generate rule execution descriptions from actual rules
  const selectedRules = [];
  const shuffledRules = [...rules].sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(rulesCount, shuffledRules.length); i++) {
    const rule = shuffledRules[i];
    selectedRules.push(`${rule.name} (${rule.sourceFormat})`);
  }
  
  // If we don't have enough rules, add generic ones
  while (selectedRules.length < rulesCount) {
    selectedRules.push(`Generic rule ${selectedRules.length + 1} executed`);
  }

  // Generate events based on characters and rules
  const selectedEvents = [];
  for (let i = 0; i < eventsCount; i++) {
    if (characters.length > 0) {
      const char = characters[Math.floor(Math.random() * characters.length)];
      const eventTemplates = [
        `${char.firstName} ${char.lastName} engaged in social interaction`,
        `${char.firstName} ${char.lastName} made a significant decision`,
        `Events unfolded involving ${char.firstName} ${char.lastName}`,
        `${char.firstName} ${char.lastName}'s actions influenced the world state`,
      ];
      selectedEvents.push(eventTemplates[Math.floor(Math.random() * eventTemplates.length)]);
    } else {
      selectedEvents.push(`Simulation event ${i + 1} occurred`);
    }
  }

  // Generate affected characters with their actual data
  const affectedCharacters = [];
  const shuffledCharacters = [...characters].sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(charactersCount, shuffledCharacters.length); i++) {
    const char = shuffledCharacters[i];
    const actions = [
      "participated in simulation",
      "state was updated",
      "interacted with others",
      "was affected by rules",
      "experienced changes"
    ];
    affectedCharacters.push({
      name: `${char.firstName} ${char.lastName}`,
      action: actions[Math.floor(Math.random() * actions.length)]
    });
  }

  return {
    rulesExecuted: selectedRules,
    eventsGenerated: selectedEvents,
    charactersAffected: affectedCharacters
  };
}

export async function registerRoutes(app: Express): Promise<Server> {

  // Register authentication routes
  registerAuthRoutes(app);

  // Register playthrough routes
  registerPlaythroughRoutes(app);

  // Register game export routes (IR generation, engine export)
  registerExportRoutes(app);

  // Worlds (now the primary containers, replacing projects)
  app.get("/api/worlds", async (req, res) => {
    try {
      const { visibility } = req.query;
      let worlds = await storage.getWorlds();

      // Filter by visibility if specified
      if (visibility) {
        worlds = worlds.filter(w => w.visibility === visibility);
      }

      // Get current user if authenticated
      const token = req.headers.authorization?.split(' ')[1];
      const payload = token ? AuthService.verifyToken(token) : null;
      const currentUserId = payload?.userId;

      // Enrich worlds with ownership info and player count
      const enrichedWorlds = await Promise.all(
        worlds.map(async (world) => {
          // Get playthrough count for this world
          const playthroughs = await storage.getPlaythroughsByWorld(world.id);
          const playerCount = new Set(playthroughs.map(p => p.userId)).size;

          return {
            ...world,
            isOwner: currentUserId === world.ownerId,
            playerCount,
          };
        })
      );

      res.json(enrichedWorlds);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch worlds" });
    }
  });

  // Get a single world by ID
  app.get("/api/worlds/:id", async (req, res) => {
    try {
      const world = await storage.getWorld(req.params.id);
      if (!world) {
        return res.status(404).json({ error: "World not found" });
      }

      // Get current user if authenticated
      const token = req.headers.authorization?.split(' ')[1];
      const payload = token ? AuthService.verifyToken(token) : null;
      const currentUserId = payload?.userId;

      // Get playthrough count for this world
      const playthroughs = await storage.getPlaythroughsByWorld(world.id);
      const playerCount = new Set(playthroughs.map(p => p.userId)).size;

      res.json({
        ...world,
        isOwner: currentUserId === world.ownerId,
        playerCount,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch world" });
    }
  });

  app.get("/api/gemini/status", (req, res) => {
    try {
      const configured = isGeminiConfigured();
      res.json({ configured });
    } catch (error) {
      res.status(500).json({ error: "Failed to check Gemini status" });
    }
  });

  // Generate rule using AI (single or bulk)
  app.post("/api/generate-rule", async (req, res) => {
    try {
      console.log('AI Generation Request:', { ...req.body, prompt: req.body.prompt?.substring(0, 50) });

      // Check for API key early
      if (!isGeminiConfigured()) {
        console.error('Gemini API not configured');
        return res.status(500).json({
          error: "AI service not configured. Please set GEMINI_API_KEY in your .env file"
        });
      }
      
      const { generateRule, generateBulkRules } = await import("./services/gemini-ai.js");
      const { prompt, sourceFormat, bulkCreate = false } = req.body;
      
      if (!prompt || !sourceFormat) {
        return res.status(400).json({ error: "Missing prompt or sourceFormat" });
      }

      console.log(`Generating ${bulkCreate ? 'bulk' : 'single'} rule for system: ${sourceFormat}`);
      
      const generatedRule = bulkCreate 
        ? await generateBulkRules(prompt, sourceFormat)
        : await generateRule(prompt, sourceFormat);
      
      console.log('Rule generated successfully');
      res.json({ rule: generatedRule, isBulk: bulkCreate });
    } catch (error) {
      console.error("Error generating rule:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate rule";
      res.status(500).json({ error: errorMessage });
    }
  });

  // Edit rule using AI
  app.post("/api/edit-rule", async (req, res) => {
    try {
      const { editRuleWithAI } = await import("./services/gemini-ai.js");
      const { currentContent, editInstructions, sourceFormat } = req.body;
      
      if (!currentContent || !editInstructions || !sourceFormat) {
        return res.status(400).json({ error: "Missing required fields: currentContent, editInstructions, or sourceFormat" });
      }

      const editedRule = await editRuleWithAI(currentContent, editInstructions, sourceFormat);
        
      res.json({ rule: editedRule });
    } catch (error) {
      console.error("Error editing rule:", error);
      res.status(500).json({ error: "Failed to edit rule with AI" });
    }
  });

  // Social Rules - Get rules for a world or all base rules
  app.get("/api/worlds/:worldId/rules", async (req, res) => {
    try {
      const rules = await storage.getRulesByWorld(req.params.worldId);
      res.json(rules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch social rules" });
    }
  });

  // Batch convert world rules to Prolog — rules' content IS Prolog now, so this
  // just extracts metadata from content and updates DB columns.
  app.post("/api/worlds/:worldId/rules/convert-all", async (req, res) => {
    try {
      const rules = await storage.getRulesByWorld(req.params.worldId);
      let converted = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (const rule of rules) {
        if (!rule.content) {
          skipped++;
          continue;
        }
        try {
          const meta = extractAllMetadata(rule.content);
          await storage.updateRule(rule.id, {
            ...(meta.priority != null ? { priority: meta.priority } : {}),
            ...(meta.likelihood != null ? { likelihood: meta.likelihood } : {}),
            ...(meta.ruleType ? { ruleType: meta.ruleType } : {}),
            ...(meta.category ? { category: meta.category } : {}),
          });
          converted++;
        } catch (err: any) {
          errors.push(`Rule "${rule.name}" (${rule.id}): ${err.message || String(err)}`);
        }
      }

      res.json({ converted, skipped, errors });
    } catch (error: any) {
      console.error('Error batch converting world rules:', error);
      res.status(500).json({ error: error.message || 'Failed to batch convert rules' });
    }
  });

  // Cache for rules by world to avoid repeated database calls
const rulesCache = new Map<string, { rules: Rule[]; timestamp: number }>();
const RULES_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// Cache for base rules to avoid repeated database calls
let baseRulesCache: Rule[] | null = null;
let baseRulesCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get base rules (must be registered before /api/rules/:id to avoid route conflict)
app.get("/api/rules/base", async (req, res) => {
  try {
    // Check cache first
    const now = Date.now();
    if (baseRulesCache && (now - baseRulesCacheTime) < CACHE_DURATION) {
      console.log(`Returning cached base rules (${baseRulesCache.length} rules)`);
      return res.json(baseRulesCache);
    }

    // Support pagination via query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;

    // If pagination is requested, don't cache
    if (req.query.page || req.query.limit) {
      console.log(`Returning paginated base rules, page ${page}, limit ${limit}`);
      const rules = await storage.getBaseRules({ page, limit });
      return res.json({
        rules,
        pagination: {
          page,
          limit,
          hasMore: rules.length === limit // Simple heuristic
        }
      });
    }

    // Add timeout handling (30 seconds)
    const rules = await Promise.race([
      storage.getBaseRules(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database timeout')), 30000)
      )
    ]) as Rule[];

    // Update cache
    baseRulesCache = rules;
    baseRulesCacheTime = now;

    console.log(`Found ${rules.length} base rules`);
    if (rules.length > 0) {
      console.log('First base rule:', {
        id: rules[0].id,
        name: rules[0].name,
        isBase: rules[0].isBase,
        worldId: rules[0].worldId,
        worldIdType: typeof rules[0].worldId
      });
    }
    res.json(rules);
  } catch (error) {
    console.error('Error fetching base rules:', error);
    // Return cached rules if available, otherwise empty array
    if (baseRulesCache) {
      console.log('Database timeout, returning cached base rules');
      return res.json(baseRulesCache);
    }
    // Return empty array instead of error to prevent game from failing
    res.json([]);
  }
});

// Batch convert base rules — content IS Prolog now, extract metadata only.
app.post("/api/rules/base/convert-all", async (req, res) => {
  try {
    const rules = await storage.getBaseRules({ includeContent: true, limit: 1000 });
    let converted = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const rule of rules) {
      if (!rule.content) {
        skipped++;
        continue;
      }
      try {
        const meta = extractAllMetadata(rule.content);
        await storage.updateRule(rule.id, {
          ...(meta.priority != null ? { priority: meta.priority } : {}),
          ...(meta.likelihood != null ? { likelihood: meta.likelihood } : {}),
          ...(meta.ruleType ? { ruleType: meta.ruleType } : {}),
          ...(meta.category ? { category: meta.category } : {}),
        });
        converted++;
      } catch (err: any) {
        errors.push(`Rule "${rule.name}" (${rule.id}): ${err.message || String(err)}`);
      }
    }

    res.json({ converted, skipped, errors });
  } catch (error: any) {
    console.error('Error batch converting base rules:', error);
    res.status(500).json({ error: error.message || 'Failed to batch convert rules' });
  }
});

// Categorize uncategorized base rules by keyword matching
app.post("/api/rules/base/categorize", async (req, res) => {
  try {
    const rules = await storage.getBaseRules({ includeContent: true, limit: 1000 });
    const uncategorizedRules = rules.filter((r: any) => !r.category);

    const categoryKeywords: Record<string, string[]> = {
      employment: ["employ", "hire", "fire", "job", "work", "occupation"],
      social: ["friend", "social", "relationship", "talk", "gossip"],
      business: ["business", "shop", "store", "market"],
      economics: ["money", "wealth", "trade", "buy", "sell", "price", "gold"],
      life_events: ["marry", "birth", "death", "age", "child", "parent"],
      personality: ["personality", "trait", "mood", "emotion"],
      cognition: ["know", "believe", "learn", "think", "remember"],
      governance: ["law", "govern", "council", "authority", "tax"],
      education: ["school", "teach", "student", "degree"],
      health: ["health", "sick", "heal", "doctor"],
      conflict: ["fight", "conflict", "war", "attack", "defend"],
      environment: ["weather", "season", "nature", "environment"],
    };

    let categorized = 0;
    let uncategorizedCount = 0;

    for (const rule of uncategorizedRules) {
      const text = `${rule.name || ''} ${rule.description || ''}`.toLowerCase();
      let matched: string | null = null;

      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some((kw) => text.includes(kw))) {
          matched = category;
          break;
        }
      }

      if (matched) {
        await storage.updateRule(rule.id, { category: matched });
        categorized++;
      } else {
        uncategorizedCount++;
      }
    }

    res.json({ categorized, uncategorized: uncategorizedCount });
  } catch (error: any) {
    console.error('Error categorizing base rules:', error);
    res.status(500).json({ error: error.message || 'Failed to categorize rules' });
  }
});

// Get single rule with content
app.get("/api/rules/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const rule = await storage.getRuleWithContent(id);
    
    if (!rule) {
      return res.status(404).json({ error: "Rule not found" });
    }
    
    res.json(rule);
  } catch (error) {
    console.error("Failed to fetch rule:", error);
    res.status(500).json({ error: "Failed to fetch rule" });
  }
});

// Get rules (with optional worldId filter)
app.get("/api/rules", async (req, res) => {
  try {
    const { worldId, page, limit } = req.query;
    
    let rules: Rule[];
    const cacheKey = (worldId as string) || 'base';
    const now = Date.now();
    
    // Check cache first (only if not paginated)
    const cached = rulesCache.get(cacheKey);
    const isPaginated = page || limit;
    
    if (!isPaginated && cached && (now - cached.timestamp) < RULES_CACHE_DURATION) {
      console.log(`Returning cached rules for ${cacheKey} (${cached.rules.length} rules)`);
      return res.json(cached.rules);
    }
    
    if (worldId) {
      // Get rules for specific world with timeout
      rules = await Promise.race([
        storage.getRulesByWorld(worldId as string),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database timeout')), 5000)
        )
      ]) as Rule[];
    } else {
      // Handle pagination for base rules
      if (isPaginated) {
        const pageNum = parseInt(page as string) || 1;
        const limitNum = parseInt(limit as string) || 100;
        console.log(`Returning paginated base rules, page ${pageNum}, limit ${limitNum}`);
        rules = await storage.getBaseRules({ page: pageNum, limit: limitNum });
        return res.json({
          rules,
          pagination: {
            page: pageNum,
            limit: limitNum,
            hasMore: rules.length === limitNum
          }
        });
      } else {
        // Get all base rules (with timeout)
        rules = await Promise.race([
          storage.getBaseRules(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database timeout')), 30000)
          )
        ]) as Rule[];
      }
    }
    
    // Update cache (only if not paginated)
    if (!isPaginated) {
      rulesCache.set(cacheKey, { rules, timestamp: now });
    }
    
    res.json(rules);
  } catch (error) {
    console.error("Failed to fetch rules:", error);
    // Return cached rules if available, otherwise empty array
    const { worldId } = req.query;
    const cacheKey = (worldId as string) || 'base';
    const cached = rulesCache.get(cacheKey);
    if (cached) {
      console.log(`Database timeout for ${cacheKey}, returning cached rules`);
      return res.json(cached.rules);
    }
    // Return empty array instead of error to prevent game from failing
    res.json([]);
  }
});


  // Legacy route for backward compatibility
  app.get("/api/projects/:projectId/rules", async (req, res) => {
    try {
      const rules = await storage.getRulesByWorld(req.params.projectId);
      res.json(rules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch social rules" });
    }
  });

  app.post("/api/rules", async (req, res) => {
    try {
      // If isBase is true, set worldId to null and ensure isBase flag
      const data = req.body.isBase ? { ...req.body, worldId: null, isBase: true } : req.body;
      
      // Log incoming data for debugging
      console.log('Creating rule:', {
        name: data.name,
        isBase: data.isBase,
        worldId: data.worldId,
        sourceFormat: data.sourceFormat,
        hasContent: !!data.content,
      });

      const validatedData = insertRuleSchema.parse(data);
      console.log('After validation:', {
        name: validatedData.name,
        isBase: validatedData.isBase,
        worldId: validatedData.worldId,
        worldIdType: typeof validatedData.worldId
      });

      // Extract metadata from Prolog content to populate DB columns
      if (validatedData.content) {
        try {
          const meta = extractAllMetadata(validatedData.content);
          if (meta.priority != null) (validatedData as any).priority = meta.priority;
          if (meta.likelihood != null) (validatedData as any).likelihood = meta.likelihood;
          if (meta.ruleType) (validatedData as any).ruleType = meta.ruleType;
          if (meta.category) (validatedData as any).category = meta.category;
        } catch (e) {
          console.warn('[PrologMetadata] Failed to extract metadata from rule content:', e);
        }
      }

      // Clear relevant caches when creating new rule
      baseRulesCache = null;
      baseRulesCacheTime = 0;
      rulesCache.clear();

      const rule = await storage.createRule(validatedData);
      console.log('Created rule in DB:', {
        id: rule.id,
        name: rule.name,
        isBase: rule.isBase,
        worldId: rule.worldId,
        worldIdType: typeof rule.worldId
      });
      
      res.status(201).json(rule);
    } catch (error) {
      console.error("Failed to create rule:", error);
      console.error("Request body:", JSON.stringify(req.body, null, 2));
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid rule data", 
          details: error.errors,
          receivedData: {
            name: req.body.name,
            sourceFormat: req.body.sourceFormat,
            isBase: req.body.isBase
          }
        });
      }
      
      res.status(500).json({ 
        error: "Failed to create rule",
        message: error instanceof Error ? error.message : String(error),
        details: error instanceof Error ? error.stack : undefined
      });
    }
  });

  app.put("/api/rules/:id", async (req, res) => {
    try {
      const validatedData = insertRuleSchema.partial().parse(req.body);

      // Extract metadata from Prolog content when content changes
      if (validatedData.content) {
        try {
          const meta = extractAllMetadata(validatedData.content);
          if (meta.priority != null) (validatedData as any).priority = meta.priority;
          if (meta.likelihood != null) (validatedData as any).likelihood = meta.likelihood;
          if (meta.ruleType) (validatedData as any).ruleType = meta.ruleType;
          if (meta.category) (validatedData as any).category = meta.category;
        } catch (e) {
          console.warn('[PrologMetadata] Failed to extract metadata from rule content:', e);
        }
      }

      // Clear relevant caches when updating rule
      baseRulesCache = null;
      baseRulesCacheTime = 0;
      rulesCache.clear();

      const rule = await storage.updateRule(req.params.id, validatedData);
      if (!rule) {
        return res.status(404).json({ error: "Rule not found" });
      }
      res.json(rule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid rule data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update rule" });
    }
  });

  app.delete("/api/rules/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteRule(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Rule not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete rule" });
    }
  });

  // Get rules by category (base rules)
  app.get("/api/rules/category/:category", async (req, res) => {
    try {
      const rules = await storage.getBaseRulesByCategory(req.params.category);
      res.json(rules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rules by category" });
    }
  });

  // ============================================================
  // Grammar operations - Tracery templates for narrative generation
  // ============================================================

  app.get("/api/worlds/:worldId/grammars", async (req, res) => {
    try {
      const grammars = await storage.getGrammarsByWorld(req.params.worldId);
      res.json(grammars);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch grammars" });
    }
  });

  // Get grammar templates (MUST come before /api/grammars/:id)
  app.get("/api/grammars/templates", async (req, res) => {
    try {
      res.json({
        templates: grammarTemplates,
        categories: getGrammarCategories(),
        tags: getAllGrammarTags(),
      });
    } catch (error) {
      console.error("Error fetching templates:", error);
      console.error("Error details:", error instanceof Error ? error.message : error);
      console.error("Error stack:", error instanceof Error ? error.stack : 'No stack');
      res.status(500).json({ error: "Failed to fetch templates", details: error instanceof Error ? error.message : String(error) });
    }
  });

  // Get template by ID
  app.get("/api/grammars/templates/:id", async (req, res) => {
    try {
      const template = getGrammarTemplate(req.params.id);
      
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ error: "Failed to fetch template" });
    }
  });

  app.get("/api/grammars/:id", async (req, res) => {
    try {
      const grammar = await storage.getGrammar(req.params.id);
      if (!grammar) {
        return res.status(404).json({ error: "Grammar not found" });
      }
      res.json(grammar);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch grammar" });
    }
  });

  app.get("/api/worlds/:worldId/grammars/:name", async (req, res) => {
    try {
      const grammar = await storage.getGrammarByName(req.params.worldId, req.params.name);
      if (!grammar) {
        return res.status(404).json({ error: "Grammar not found" });
      }
      res.json(grammar);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch grammar" });
    }
  });

  app.post("/api/grammars", async (req, res) => {
    try {
      const validatedData = insertGrammarSchema.parse(req.body);
      const grammar = await storage.createGrammar(validatedData);
      res.json(grammar);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid grammar data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create grammar" });
    }
  });

  app.put("/api/grammars/:id", async (req, res) => {
    try {
      const validatedData = insertGrammarSchema.partial().parse(req.body);
      const grammar = await storage.updateGrammar(req.params.id, validatedData);
      if (!grammar) {
        return res.status(404).json({ error: "Grammar not found" });
      }
      res.json(grammar);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid grammar data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update grammar" });
    }
  });

  app.delete("/api/grammars/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteGrammar(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Grammar not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete grammar" });
    }
  });

  app.post("/api/grammars/test", async (req, res) => {
    try {
      const { TraceryService } = await import("./services/tracery-service.js");
      const { grammar, variables = {}, iterations = 5, truthBindings, worldId } = req.body;

      if (!grammar) {
        return res.status(400).json({ error: "Grammar is required" });
      }

      // Validate grammar has origin
      if (!grammar.origin) {
        return res.status(400).json({ error: "Grammar must have an 'origin' symbol" });
      }

      // If truth bindings and worldId are provided, resolve them against world truths
      if (truthBindings && Array.isArray(truthBindings) && truthBindings.length > 0 && worldId) {
        const rawTruths = await storage.getTruthsByWorld(worldId);
        const truths = rawTruths.map(t => ({
          ...t,
          tags: t.tags ?? undefined,
        }));
        const results: string[] = [];
        const safeIterations = Math.min(iterations, 20);
        for (let i = 0; i < safeIterations; i++) {
          results.push(
            TraceryService.expandWithTruthBindings(grammar, truthBindings, truths as any, variables)
          );
        }
        return res.json({ results });
      }

      // Generate multiple variations without truth bindings
      const results = TraceryService.test(grammar, variables, Math.min(iterations, 20));

      res.json({ results });
    } catch (error) {
      console.error("Error testing grammar:", error);
      res.status(500).json({ error: "Failed to test grammar" });
    }
  });

  // Generate grammar using AI
  app.post("/api/grammars/generate", async (req, res) => {
    try {
      const { grammarGenerator } = await import("./services/grammar-generator.js");
      const { description, theme, complexity, symbolCount, worldId } = req.body;

      if (!description) {
        return res.status(400).json({ error: "Description is required" });
      }

      // Get world context if worldId provided
      let worldContext;
      if (worldId) {
        const world = await storage.getWorld(worldId);
        if (world) {
          worldContext = {
            worldName: world.name,
            worldDescription: world.description || undefined,
          };
        }
      }

      const generated = await grammarGenerator.generateGrammar({
        description,
        theme,
        complexity: complexity || 'medium',
        symbolCount: symbolCount || 5,
        worldContext,
      });

      res.json(generated);
    } catch (error) {
      console.error("Error generating grammar:", error);
      res.status(500).json({ 
        error: "Failed to generate grammar", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Extend existing grammar
  app.post("/api/grammars/:id/extend", async (req, res) => {
    try {
      const { grammarGenerator } = await import("./services/grammar-generator.js");
      const { extensionTheme, addRules = 5 } = req.body;

      if (!extensionTheme) {
        return res.status(400).json({ error: "Extension theme is required" });
      }

      const grammar = await storage.getGrammar(req.params.id);
      if (!grammar) {
        return res.status(404).json({ error: "Grammar not found" });
      }

      const extended = await grammarGenerator.extendGrammar(
        grammar.grammar,
        extensionTheme,
        addRules
      );

      res.json({ grammar: extended });
    } catch (error) {
      console.error("Error extending grammar:", error);
      res.status(500).json({ 
        error: "Failed to extend grammar",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Generate grammar from examples
  app.post("/api/grammars/from-examples", async (req, res) => {
    try {
      const { grammarGenerator } = await import("./services/grammar-generator.js");
      const { examples, symbolName = 'origin' } = req.body;

      if (!examples || !Array.isArray(examples) || examples.length === 0) {
        return res.status(400).json({ error: "Examples array is required" });
      }

      const grammar = await grammarGenerator.grammarFromExamples(examples, symbolName);

      res.json({ grammar });
    } catch (error) {
      console.error("Error creating grammar from examples:", error);
      res.status(500).json({ 
        error: "Failed to create grammar from examples",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // ============================================================
  // Name Generation Endpoints
  // ============================================================

  // Generate name using Tracery
  app.post("/api/worlds/:worldId/names/generate", async (req, res) => {
    try {
      const { NameGenerator } = await import("./services/name-generator.js");
      const nameGen = new NameGenerator(storage);
      
      const { count = 1, culture, grammarId, grammarName, gender } = req.body;

      const names = await nameGen.generateNames(req.params.worldId, {
        count,
        culture,
        grammarId,
        grammarName,
        gender,
      });

      res.json({ names });
    } catch (error) {
      console.error("Error generating names:", error);
      res.status(500).json({ 
        error: "Failed to generate names",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Generate single name
  app.post("/api/worlds/:worldId/names/generate-one", async (req, res) => {
    try {
      const { NameGenerator } = await import("./services/name-generator.js");
      const nameGen = new NameGenerator(storage);
      
      const { culture, grammarId, grammarName, gender } = req.body;

      const name = await nameGen.generateName(req.params.worldId, {
        culture,
        grammarId,
        grammarName,
        gender,
      });

      res.json(name);
    } catch (error) {
      console.error("Error generating name:", error);
      res.status(500).json({ 
        error: "Failed to generate name",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get available name grammars for world
  app.get("/api/worlds/:worldId/names/grammars", async (req, res) => {
    try {
      const { NameGenerator } = await import("./services/name-generator.js");
      const nameGen = new NameGenerator(storage);
      
      const grammars = await nameGen.getNameGrammars(req.params.worldId);

      res.json({ grammars });
    } catch (error) {
      console.error("Error fetching name grammars:", error);
      res.status(500).json({ error: "Failed to fetch name grammars" });
    }
  });

  // Get available cultures from name grammars
  app.get("/api/worlds/:worldId/names/cultures", async (req, res) => {
    try {
      const { NameGenerator } = await import("./services/name-generator.js");
      const nameGen = new NameGenerator(storage);
      
      const cultures = await nameGen.getCultures(req.params.worldId);

      res.json({ cultures });
    } catch (error) {
      console.error("Error fetching cultures:", error);
      res.status(500).json({ error: "Failed to fetch cultures" });
    }
  });

  // ============================================================
  // Legacy /api/files endpoints - maps to individual rules
  // These provide backward compatibility for the frontend
  // ============================================================

  // Get all "files" (rules grouped by world)
  app.get("/api/worlds/:worldId/files", async (req, res) => {
    try {
      const rules = await storage.getRulesByWorld(req.params.worldId);
      
      // Transform rules to look like "files" for backward compatibility
      const files = rules.map(rule => ({
        id: rule.id,
        name: rule.name,
        path: `Rules/${rule.name}`,
        content: rule.content,
        sourceFormat: rule.sourceFormat,
        worldId: rule.worldId,
      }));
      
      res.json(files);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch files" });
    }
  });

  // Create a new "file" (actually creates individual rules)
  app.post("/api/files", async (req, res) => {
    try {
      const { name, path, content, sourceFormat, worldId } = req.body;
      
      if (!name || !content || !sourceFormat || !worldId) {
        return res.status(400).json({ error: "Missing required fields: name, content, sourceFormat, worldId" });
      }

      // Create a single rule with the content
      // The content may contain multiple rules, but we store it as one entity
      const rule = await storage.createRule({
        worldId,
        name: name,
        content: content,
        sourceFormat: sourceFormat,
        ruleType: 'trigger',
        priority: 5,
        likelihood: 1.0,
        tags: [],
        isActive: true,
      });

      res.status(201).json({
        id: rule.id,
        name: rule.name,
        path: `Rules/${rule.name}`,
        content: rule.content,
        sourceFormat: rule.sourceFormat,
        worldId: rule.worldId,
      });
    } catch (error) {
      console.error("Failed to create file:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid file data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create file" });
    }
  });

  // Update a "file" (updates a rule)
  app.put("/api/files/:id", async (req, res) => {
    try {
      const { content, name, sourceFormat } = req.body;
      
      const updateData: Partial<InsertRule> = {};
      if (content !== undefined) updateData.content = content;
      if (name !== undefined) updateData.name = name;
      if (sourceFormat !== undefined) updateData.sourceFormat = sourceFormat;

      const rule = await storage.updateRule(req.params.id, updateData);
      if (!rule) {
        return res.status(404).json({ error: "File not found" });
      }

      // Return in "file" format
      res.json({
        id: rule.id,
        name: rule.name,
        path: `Rules/${rule.name}`,
        content: rule.content,
        sourceFormat: rule.sourceFormat,
        worldId: rule.worldId,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid file data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update file" });
    }
  });

  // Delete a "file" (deletes a rule)
  app.delete("/api/files/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteRule(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "File not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete file" });
    }
  });

  // Characters
  app.get("/api/worlds/:worldId/characters", async (req, res) => {
    try {
      const characters = await storage.getCharactersByWorld(req.params.worldId);
      res.json(characters);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch characters" });
    }
  });

  app.post("/api/worlds/:worldId/characters", async (req, res) => {
    try {
      const { worldId } = req.params;

      // Check permissions
      const token = req.headers.authorization?.split(' ')[1];
      const payload = token ? AuthService.verifyToken(token) : null;

      if (!(await canEditWorld(payload?.userId, worldId))) {
        return res.status(403).json({ error: "You don't have permission to edit this world" });
      }

      console.log("=== CREATE CHARACTER REQUEST ===");
      console.log("worldId from params:", worldId);
      console.log("Request body:", JSON.stringify(req.body, null, 2));

      // Ensure worldId is included in the data
      const characterData = { ...req.body, worldId };
      console.log("Character data with worldId:", JSON.stringify(characterData, null, 2));

      const validatedData = insertCharacterSchema.parse(characterData);
      console.log("Validated data:", JSON.stringify(validatedData, null, 2));

      const character = await storage.createCharacter(validatedData);
      console.log("Character created successfully:", character);
      console.log("=== END CREATE CHARACTER ===");

      // Auto-sync to Prolog
      prologAutoSync.onCharacterChanged(worldId, character as any).catch(e => console.warn('[PrologAutoSync] character create:', e));

      res.status(201).json(character);
    } catch (error) {
      console.error("Failed to create character:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ error: "Invalid character data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create character" });
    }
  });

  app.post("/api/characters", async (req, res) => {
    try {
      const validatedData = insertCharacterSchema.parse(req.body);
      const character = await storage.createCharacter(validatedData);

      // Auto-sync to Prolog
      if (character.worldId) {
        prologAutoSync.onCharacterChanged(character.worldId, character as any).catch(e => console.warn('[PrologAutoSync] character create:', e));
      }

      res.status(201).json(character);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid character data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create character" });
    }
  });

  app.patch("/api/characters/:id", async (req, res) => {
    try {
      const { id } = req.params;

      // Get character to find its world
      const existingCharacter = await storage.getCharacter(id);
      if (!existingCharacter) {
        return res.status(404).json({ error: "Character not found" });
      }

      // Check permissions
      const token = req.headers.authorization?.split(' ')[1];
      const payload = token ? AuthService.verifyToken(token) : null;

      if (!(await canEditWorld(payload?.userId, existingCharacter.worldId))) {
        return res.status(403).json({ error: "You don't have permission to edit this world" });
      }

      const validatedData = insertCharacterSchema.partial().parse(req.body);
      const character = await storage.updateCharacter(id, validatedData);
      if (!character) {
        return res.status(404).json({ error: "Character not found" });
      }

      // Auto-sync to Prolog
      prologAutoSync.onCharacterChanged(character.worldId, character as any).catch(e => console.warn('[PrologAutoSync] character update:', e));

      res.json(character);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid character data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update character" });
    }
  });

  app.delete("/api/characters/:id", async (req, res) => {
    try {
      const { id } = req.params;

      // Get character to find its world
      const existingCharacter = await storage.getCharacter(id);
      if (!existingCharacter) {
        return res.status(404).json({ error: "Character not found" });
      }

      // Check permissions
      const token = req.headers.authorization?.split(' ')[1];
      const payload = token ? AuthService.verifyToken(token) : null;

      if (!(await canEditWorld(payload?.userId, existingCharacter.worldId))) {
        return res.status(403).json({ error: "You don't have permission to edit this world" });
      }

      // Capture info before deleting
      const charWorldId = existingCharacter.worldId;
      const charFirstName = existingCharacter.firstName;
      const charLastName = existingCharacter.lastName;

      const deleted = await storage.deleteCharacter(id);
      if (!deleted) {
        return res.status(404).json({ error: "Character not found" });
      }

      // Auto-sync to Prolog
      prologAutoSync.onCharacterDeleted(charWorldId, id, charFirstName, charLastName).catch(e => console.warn('[PrologAutoSync] character delete:', e));

      res.status(204).send();
    } catch (error) {
      console.error("Failed to delete character:", error);
      res.status(500).json({ error: "Failed to delete character" });
    }
  });
  
  // Character impulse endpoint (integrated extension)
  app.post("/api/characters/:id/impulse", async (req, res) => {
    try {
      const { type, strength, target } = req.body;
      
      if (!type || strength === undefined) {
        return res.status(400).json({ error: "Missing required fields: type, strength" });
      }
      
      await addImpulse(req.params.id, type, strength, target);
      const currentStrength = await getImpulseStrength(req.params.id, type, target);
      
      res.json({ 
        success: true,
        characterId: req.params.id,
        type,
        target,
        currentStrength 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to add impulse" });
    }
  });
  
  // Character relationship endpoint (integrated extension)
  app.post("/api/characters/:id/relationship", async (req, res) => {
    try {
      const { targetCharacterId, type, strength, reciprocal } = req.body;
      
      if (!targetCharacterId || !type || strength === undefined) {
        return res.status(400).json({ 
          error: "Missing required fields: targetCharacterId, type, strength" 
        });
      }
      
      await setRelationship(
        req.params.id,
        targetCharacterId,
        type,
        strength,
        reciprocal
      );
      
      res.json({ 
        success: true,
        fromCharacterId: req.params.id,
        toCharacterId: targetCharacterId,
        type,
        strength,
        reciprocal
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to set relationship" });
    }
  });
  
  // Character volition selection endpoint (integrated extension)
  app.get("/api/characters/:id/select-action", async (req, res) => {
    try {
      const character = await storage.getCharacter(req.params.id);
      if (!character) {
        return res.status(404).json({ error: "Character not found" });
      }
      
      const selectedRule = await selectVolition(req.params.id, character.worldId);
      
      if (!selectedRule) {
        return res.json({ 
          characterId: req.params.id,
          action: null,
          message: "No suitable action found based on current state"
        });
      }
      
      res.json({
        characterId: req.params.id,
        action: selectedRule.name,
        ruleId: selectedRule.id,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to select action" });
    }
  });

  app.post("/api/worlds", async (req, res) => {
    try {
      const validatedData = insertWorldSchema.parse(req.body);

      // Set owner if user is authenticated
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        const payload = AuthService.verifyToken(token);
        if (payload) {
          validatedData.ownerId = payload.userId;
        }
      }

      const world = await storage.createWorld(validatedData);

      // REQUIRED: Ensure world has an asset collection assigned
      // This assigns a default collection based on world type if none is selected
      try {
        const { ensureWorldHasAssetCollection } = await import('./services/default-asset-collection.js');
        await ensureWorldHasAssetCollection(world.id);
      } catch (collectionError) {
        console.error("Failed to assign asset collection to world", world.id, collectionError);
        // This is critical - we should fail world creation if we can't assign a collection
        await storage.deleteWorld(world.id);
        return res.status(500).json({ 
          error: "Failed to assign asset collection to world",
          details: collectionError instanceof Error ? collectionError.message : String(collectionError)
        });
      }

      // Note: 3D assets are now managed through asset collections
      // Users can populate collections via the Polyhaven browser UI
      
      // Fetch the updated world with collection assignment
      const updatedWorld = await storage.getWorld(world.id);
      res.status(201).json(updatedWorld || world);
    } catch (error) {
      console.error("POST /api/worlds error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid world data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create world" });
    }
  });

  app.patch("/api/worlds/:id", async (req, res) => {
    try {
      const { id } = req.params;

      // Verify authentication
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const payload = AuthService.verifyToken(token);
      if (!payload) {
        return res.status(401).json({ error: "Invalid token" });
      }

      // Check if user can edit this world (handles legacy worlds without owner)
      if (!(await canEditWorld(payload.userId, id))) {
        return res.status(403).json({ error: "Only the world owner can modify settings" });
      }

      // Update world settings
      const updatedWorld = await storage.updateWorld(id, req.body);
      if (!updatedWorld) {
        return res.status(404).json({ error: "World not found" });
      }

      res.json(updatedWorld);
    } catch (error) {
      console.error("PATCH /api/worlds/:id error:", error);
      res.status(500).json({ error: "Failed to update world" });
    }
  });

  app.delete("/api/worlds/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`🗑️  API: Delete world request for ${id}`);

      // Check ownership - get world first
      const world = await storage.getWorld(id);
      if (!world) {
        console.log(`❌ API: World ${id} not found`);
        return res.status(404).json({ error: "World not found" });
      }

      // Verify authentication and ownership
      const token = req.headers.authorization?.split(' ')[1];
      const payload = token ? AuthService.verifyToken(token) : null;

      if (!(await canEditWorld(payload?.userId, id))) {
        return res.status(403).json({ error: "Only the world owner can delete this world" });
      }

      const success = await storage.deleteWorld(id);

      if (success) {
        console.log(`✅ API: World ${id} deleted successfully`);
        res.status(200).json({ success: true, message: "World deleted successfully" });
      } else {
        console.log(`❌ API: World ${id} not found`);
        res.status(404).json({ error: "World not found" });
      }
    } catch (error) {
      console.error("DELETE /api/worlds/:id error:", error);
      res.status(500).json({
        error: "Failed to delete world",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Language routes
  app.get("/api/worlds/:worldId/languages", async (req, res) => {
    try {
      const { worldId } = req.params;
      const languages = await getLanguagesByWorld(worldId);
      res.json(languages);
    } catch (error) {
      console.error("Failed to fetch languages:", error);
      res.status(500).json({ error: "Failed to fetch languages" });
    }
  });

  app.get("/api/worlds/:worldId/languages/:scopeType/:scopeId", async (req, res) => {
    try {
      const { worldId, scopeType, scopeId } = req.params;
      const validScopes = ["world", "country", "state", "settlement"];
      if (!validScopes.includes(scopeType)) {
        return res.status(400).json({ error: "Invalid scopeType" });
      }

      const languages = await getLanguagesByScope(worldId, scopeType as any, scopeId);
      res.json(languages);
    } catch (error) {
      console.error("Failed to fetch languages by scope:", error);
      res.status(500).json({ error: "Failed to fetch languages for scope" });
    }
  });

  app.post("/api/worlds/:worldId/languages/generate", async (req, res) => {
    try {
      const { worldId } = req.params;
      const { scopeType, scopeId, config, description, makePrimary, mode } = req.body;

      const token = req.headers.authorization?.split(" ")[1];
      const payload = token ? AuthService.verifyToken(token) : null;

      if (!(await canEditWorld(payload?.userId, worldId))) {
        return res.status(403).json({ error: "You don't have permission to edit this world" });
      }

      const validScopes = ["world", "country", "state", "settlement"];
      if (!scopeType || !validScopes.includes(scopeType)) {
        return res.status(400).json({ error: "Invalid or missing scopeType" });
      }
      if (!scopeId) {
        return res.status(400).json({ error: "scopeId is required" });
      }
      if (!config) {
        return res.status(400).json({ error: "config is required" });
      }

      const language = await generateLanguage({
        worldId,
        scopeType,
        scopeId,
        config,
        description,
        makePrimary,
        mode,
      });

      res.status(201).json(language);
    } catch (error) {
      console.error("Failed to generate language:", error);
      res.status(500).json({ error: "Failed to generate language" });
    }
  });

  app.get("/api/languages/:id", async (req, res) => {
    try {
      const language = await getLanguageById(req.params.id);
      if (!language) {
        return res.status(404).json({ error: "Language not found" });
      }
      res.json(language);
    } catch (error) {
      console.error("Failed to fetch language:", error);
      res.status(500).json({ error: "Failed to fetch language" });
    }
  });

  app.delete("/api/languages/:id", async (req, res) => {
    try {
      const language = await getLanguageById(req.params.id);
      if (!language) {
        return res.status(404).json({ error: "Language not found" });
      }

      const token = req.headers.authorization?.split(" ")[1];
      const payload = token ? AuthService.verifyToken(token) : null;

      if (!(await canEditWorld(payload?.userId, language.worldId))) {
        return res.status(403).json({ error: "You don't have permission to edit this world" });
      }

      const deleted = await storage.deleteWorldLanguage(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Language not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Failed to delete language:", error);
      res.status(500).json({ error: "Failed to delete language" });
    }
  });

  app.get("/api/languages/:id/chat", async (req, res) => {
    try {
      const language = await getLanguageById(req.params.id);
      if (!language) {
        return res.status(404).json({ error: "Language not found" });
      }
      const history = await getLanguageChatHistory(req.params.id);
      res.json(history);
    } catch (error) {
      console.error("Failed to fetch language chat history:", error);
      res.status(500).json({ error: "Failed to fetch language chat history" });
    }
  });

  app.post("/api/languages/:id/chat", async (req, res) => {
    try {
      const language = await getLanguageById(req.params.id);
      if (!language) {
        return res.status(404).json({ error: "Language not found" });
      }

      const token = req.headers.authorization?.split(" ")[1];
      const payload = token ? AuthService.verifyToken(token) : null;
      const { worldId, scopeType, scopeId, message } = req.body;

      if (!worldId || !message) {
        return res.status(400).json({ error: "worldId and message are required" });
      }

      const result = await sendLanguageChatMessage({
        languageId: req.params.id,
        worldId,
        scopeType,
        scopeId,
        userId: payload?.userId ?? null,
        message,
      });

      res.json(result);
    } catch (error) {
      console.error("Failed to send language chat message:", error);
      res.status(500).json({ error: "Failed to send language chat message" });
    }
  });

  // Country routes
  app.get("/api/worlds/:worldId/countries", async (req, res) => {
    try {
      const countries = await storage.getCountriesByWorld(req.params.worldId);
      res.json(countries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch countries" });
    }
  });

  // State routes
  app.get("/api/worlds/:worldId/states", async (req, res) => {
    try {
      const states = await storage.getStatesByWorld(req.params.worldId);
      res.json(states);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch states" });
    }
  });

  app.post("/api/worlds/:worldId/countries", async (req, res) => {
    try {
      const { worldId } = req.params;

      // Check permissions
      const token = req.headers.authorization?.split(' ')[1];
      const payload = token ? AuthService.verifyToken(token) : null;

      if (!(await canEditWorld(payload?.userId, worldId))) {
        return res.status(403).json({ error: "You don't have permission to edit this world" });
      }

      const validatedData = insertCountrySchema.parse(req.body);
      const country = await storage.createCountry({
        ...validatedData,
        worldId
      });
      res.status(201).json(country);
    } catch (error) {
      console.error("Failed to create country:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid country data", details: error.errors });
      }
      res.status(500).json({
        error: "Failed to create country",
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get("/api/countries/:id", async (req, res) => {
    try {
      const country = await storage.getCountry(req.params.id);
      if (!country) {
        return res.status(404).json({ error: "Country not found" });
      }
      res.json(country);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch country" });
    }
  });

  app.put("/api/countries/:id", async (req, res) => {
    try {
      const { id } = req.params;

      // Get country to find its world
      const existingCountry = await storage.getCountry(id);
      if (!existingCountry) {
        return res.status(404).json({ error: "Country not found" });
      }

      // Check permissions
      const token = req.headers.authorization?.split(' ')[1];
      const payload = token ? AuthService.verifyToken(token) : null;

      if (!(await canEditWorld(payload?.userId, existingCountry.worldId))) {
        return res.status(403).json({ error: "You don't have permission to edit this world" });
      }

      const country = await storage.updateCountry(id, req.body);
      if (!country) {
        return res.status(404).json({ error: "Country not found" });
      }
      res.json(country);
    } catch (error) {
      res.status(500).json({ error: "Failed to update country" });
    }
  });

  app.delete("/api/countries/:id", async (req, res) => {
    try {
      const { id } = req.params;

      // Get country to find its world
      const existingCountry = await storage.getCountry(id);
      if (!existingCountry) {
        return res.status(404).json({ error: "Country not found" });
      }

      // Check permissions
      const token = req.headers.authorization?.split(' ')[1];
      const payload = token ? AuthService.verifyToken(token) : null;

      if (!(await canEditWorld(payload?.userId, existingCountry.worldId))) {
        return res.status(403).json({ error: "You don't have permission to edit this world" });
      }

      const success = await storage.deleteCountry(id);
      if (!success) {
        return res.status(404).json({ error: "Country not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete country" });
    }
  });

  // State routes
  app.get("/api/countries/:countryId/states", async (req, res) => {
    try {
      const states = await storage.getStatesByCountry(req.params.countryId);
      res.json(states);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch states" });
    }
  });

  app.post("/api/countries/:countryId/states", async (req, res) => {
    try {
      const stateData = { ...req.body, countryId: req.params.countryId };
      const validatedData = insertStateSchema.parse(stateData);
      const state = await storage.createState(validatedData);
      res.status(201).json(state);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid state data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create state" });
    }
  });

  app.delete("/api/states/:id", async (req, res) => {
    try {
      const success = await storage.deleteState(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "State not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete state" });
    }
  });

  // Settlement routes
  app.get("/api/worlds/:worldId/settlements", async (req, res) => {
    try {
      const settlements = await storage.getSettlementsByWorld(req.params.worldId);
      res.json(settlements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settlements" });
    }
  });

  app.get("/api/countries/:countryId/settlements", async (req, res) => {
    try {
      const settlements = await storage.getSettlementsByCountry(req.params.countryId);
      res.json(settlements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settlements" });
    }
  });

  app.get("/api/states/:stateId/settlements", async (req, res) => {
    try {
      const settlements = await storage.getSettlementsByState(req.params.stateId);
      res.json(settlements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settlements" });
    }
  });

  app.post("/api/worlds/:worldId/settlements", async (req, res) => {
    try {
      const { worldId } = req.params;

      // Check permissions
      const token = req.headers.authorization?.split(' ')[1];
      const payload = token ? AuthService.verifyToken(token) : null;

      if (!(await canEditWorld(payload?.userId, worldId))) {
        return res.status(403).json({ error: "You don't have permission to edit this world" });
      }

      const settlementData = { ...req.body, worldId };
      const validatedData = insertSettlementSchema.parse(settlementData);
      const settlement = await storage.createSettlement(validatedData);

      // Auto-sync to Prolog
      prologAutoSync.onSettlementChanged(worldId, settlement as any).catch(e => console.warn('[PrologAutoSync] settlement create:', e));

      res.status(201).json(settlement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid settlement data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create settlement" });
    }
  });

  app.get("/api/settlements/:id", async (req, res) => {
    try {
      const settlement = await storage.getSettlement(req.params.id);
      if (!settlement) {
        return res.status(404).json({ error: "Settlement not found" });
      }
      res.json(settlement);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settlement" });
    }
  });

  app.put("/api/settlements/:id", async (req, res) => {
    try {
      const { id } = req.params;

      // Get settlement to find its world
      const existingSettlement = await storage.getSettlement(id);
      if (!existingSettlement) {
        return res.status(404).json({ error: "Settlement not found" });
      }

      // Check permissions
      const token = req.headers.authorization?.split(' ')[1];
      const payload = token ? AuthService.verifyToken(token) : null;

      if (!(await canEditWorld(payload?.userId, existingSettlement.worldId))) {
        return res.status(403).json({ error: "You don't have permission to edit this world" });
      }

      const settlement = await storage.updateSettlement(id, req.body);
      if (!settlement) {
        return res.status(404).json({ error: "Settlement not found" });
      }

      // Auto-sync to Prolog
      prologAutoSync.onSettlementChanged(settlement.worldId, settlement as any).catch(e => console.warn('[PrologAutoSync] settlement update:', e));

      res.json(settlement);
    } catch (error) {
      res.status(500).json({ error: "Failed to update settlement" });
    }
  });

  app.delete("/api/settlements/:id", async (req, res) => {
    try {
      const { id } = req.params;

      // Get settlement to find its world
      const existingSettlement = await storage.getSettlement(id);
      if (!existingSettlement) {
        return res.status(404).json({ error: "Settlement not found" });
      }

      // Check permissions
      const token = req.headers.authorization?.split(' ')[1];
      const payload = token ? AuthService.verifyToken(token) : null;

      if (!(await canEditWorld(payload?.userId, existingSettlement.worldId))) {
        return res.status(403).json({ error: "You don't have permission to edit this world" });
      }

      const settlementWorldId = existingSettlement.worldId;
      const settlementName = existingSettlement.name;

      const success = await storage.deleteSettlement(id);
      if (!success) {
        return res.status(404).json({ error: "Settlement not found" });
      }

      // Auto-sync to Prolog
      prologAutoSync.onSettlementDeleted(settlementWorldId, settlementName).catch(e => console.warn('[PrologAutoSync] settlement delete:', e));

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete settlement" });
    }
  });

  // Lots routes
  app.get("/api/settlements/:settlementId/lots", async (req, res) => {
    try {
      const lots = await storage.getLotsBySettlement(req.params.settlementId);
      res.json(lots);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lots" });
    }
  });

  app.post("/api/lots", async (req, res) => {
    try {
      const lot = await storage.createLot(req.body);
      res.status(201).json(lot);
    } catch (error) {
      res.status(500).json({ error: "Failed to create lot" });
    }
  });

  // Businesses routes
  app.get("/api/settlements/:settlementId/businesses", async (req, res) => {
    try {
      const businesses = await storage.getBusinessesBySettlement(req.params.settlementId);
      res.json(businesses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch businesses" });
    }
  });

  app.post("/api/businesses", async (req, res) => {
    try {
      const business = await storage.createBusiness(req.body);

      // Auto-sync to Prolog
      if (business.worldId) {
        const owner = business.ownerId ? await storage.getCharacter(business.ownerId) : undefined;
        prologAutoSync.onBusinessChanged(business.worldId, business as any, owner as any).catch(e => console.warn('[PrologAutoSync] business create:', e));
      }

      res.status(201).json(business);
    } catch (error) {
      res.status(500).json({ error: "Failed to create business" });
    }
  });

  // Business Management endpoints (TotT Business System)
  app.post("/api/businesses/found", async (req, res) => {
    try {
      const { worldId, founderId, name, businessType, address, currentYear, currentTimestep, initialVacancies } = req.body;
      
      if (!worldId || !founderId || !name || !businessType || !address || currentYear === undefined || currentTimestep === undefined) {
        return res.status(400).json({ error: "Missing required fields: worldId, founderId, name, businessType, address, currentYear, currentTimestep" });
      }
      
      const business = await foundBusiness({
        worldId,
        founderId,
        name,
        businessType,
        address,
        currentYear,
        currentTimestep,
        initialVacancies
      });

      // Auto-sync to Prolog
      const founder = await storage.getCharacter(founderId);
      prologAutoSync.onBusinessChanged(worldId, business as any, founder as any).catch(e => console.warn('[PrologAutoSync] business found:', e));

      res.status(201).json(business);
    } catch (error) {
      res.status(500).json({ error: "Failed to found business", details: (error as Error).message });
    }
  });

  app.post("/api/businesses/:id/close", async (req, res) => {
    try {
      const { reason, currentYear, currentTimestep, notifyEmployees } = req.body;
      
      if (!reason || currentYear === undefined || currentTimestep === undefined) {
        return res.status(400).json({ error: "Missing required fields: reason, currentYear, currentTimestep" });
      }
      
      await closeBusiness({
        businessId: req.params.id,
        reason,
        currentYear,
        currentTimestep,
        notifyEmployees
      });
      
      res.json({ success: true, message: "Business closed successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to close business", details: (error as Error).message });
    }
  });

  app.post("/api/businesses/:id/transfer-ownership", async (req, res) => {
    try {
      const { newOwnerId, transferReason, salePrice, currentYear, currentTimestep } = req.body;
      
      if (!newOwnerId || !transferReason || currentYear === undefined || currentTimestep === undefined) {
        return res.status(400).json({ error: "Missing required fields: newOwnerId, transferReason, currentYear, currentTimestep" });
      }
      
      await transferOwnership({
        businessId: req.params.id,
        newOwnerId,
        transferReason,
        salePrice,
        currentYear,
        currentTimestep
      });
      
      res.json({ success: true, message: "Ownership transferred successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to transfer ownership", details: (error as Error).message });
    }
  });

  app.get("/api/businesses/:id/summary", async (req, res) => {
    try {
      const summary = await getBusinessSummary(req.params.id);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to get business summary", details: (error as Error).message });
    }
  });

  app.get("/api/characters/:id/businesses", async (req, res) => {
    try {
      const businesses = await getCharacterBusinesses(req.params.id);
      res.json(businesses);
    } catch (error) {
      res.status(500).json({ error: "Failed to get character businesses" });
    }
  });

  app.get("/api/worlds/:id/businesses", async (req, res) => {
    try {
      const { isOutOfBusiness } = req.query;
      const isOutOfBusinessBool = isOutOfBusiness === 'true' ? true : isOutOfBusiness === 'false' ? false : undefined;
      
      const businesses = await getBusinessesByStatus(req.params.id, isOutOfBusinessBool);
      res.json(businesses);
    } catch (error) {
      res.status(500).json({ error: "Failed to get businesses" });
    }
  });

  app.get("/api/worlds/:id/business-statistics", async (req, res) => {
    try {
      const stats = await getBusinessStatistics(req.params.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to get business statistics" });
    }
  });

  // Business hiring endpoints (TotT Hiring System)
  app.get("/api/businesses/:id/employees", async (req, res) => {
    try {
      const business = await storage.getBusiness(req.params.id);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }
      const employees = await getBusinessEmployees(req.params.id, business.worldId);
      res.json(employees);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });

  app.post("/api/businesses/:id/find-candidates", async (req, res) => {
    try {
      const { vocation, shift, hiringManagerId, currentYear, limit } = req.body;
      const business = await storage.getBusiness(req.params.id);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }
      
      const candidates = await findCandidates(
        req.params.id,
        vocation,
        shift,
        hiringManagerId,
        business.worldId,
        currentYear || 1900,
        limit || 10
      );
      res.json(candidates);
    } catch (error) {
      res.status(500).json({ error: "Failed to find candidates", details: (error as Error).message });
    }
  });

  app.post("/api/businesses/:id/hire", async (req, res) => {
    try {
      const { candidateId, vocation, shift, hiringManagerId, currentYear, isSupplemental, hiredAsFavor } = req.body;
      
      if (!candidateId || !vocation || !shift || !hiringManagerId) {
        return res.status(400).json({ error: "Missing required fields: candidateId, vocation, shift, hiringManagerId" });
      }
      
      await fillVacancy(
        req.params.id,
        candidateId,
        vocation,
        shift,
        hiringManagerId,
        currentYear || 1900,
        isSupplemental || false,
        hiredAsFavor || false
      );
      
      res.json({ success: true, message: "Candidate hired successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to hire candidate", details: (error as Error).message });
    }
  });

  app.post("/api/businesses/:id/evaluate-candidate", async (req, res) => {
    try {
      const { candidateId, vocation, hiringManagerId, currentYear } = req.body;
      
      if (!candidateId || !vocation || !hiringManagerId) {
        return res.status(400).json({ error: "Missing required fields: candidateId, vocation, hiringManagerId" });
      }
      
      const evaluation = await evaluateCandidate(
        req.params.id,
        candidateId,
        vocation,
        hiringManagerId,
        currentYear || 1900
      );
      
      res.json(evaluation);
    } catch (error) {
      res.status(500).json({ error: "Failed to evaluate candidate", details: (error as Error).message });
    }
  });

  // Character employment endpoints (TotT Hiring System)
  app.delete("/api/characters/:id/employment", async (req, res) => {
    try {
      const { reason, currentYear } = req.body;
      
      if (!reason) {
        return res.status(400).json({ error: "Missing required field: reason" });
      }
      
      await fireEmployee(req.params.id, reason, currentYear || 1900);
      res.json({ success: true, message: "Employee terminated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to terminate employment", details: (error as Error).message });
    }
  });

  app.get("/api/characters/:id/occupation-history", async (req, res) => {
    try {
      const history = await getOccupationHistory(req.params.id);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch occupation history" });
    }
  });

  app.post("/api/characters/:id/promote", async (req, res) => {
    try {
      const { newVocation, newLevel } = req.body;
      
      if (!newVocation || newLevel === undefined) {
        return res.status(400).json({ error: "Missing required fields: newVocation, newLevel" });
      }
      
      await promoteEmployee(req.params.id, newVocation, newLevel);
      res.json({ success: true, message: "Employee promoted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to promote employee", details: (error as Error).message });
    }
  });

  // Residences routes
  app.get("/api/settlements/:settlementId/residences", async (req, res) => {
    try {
      const residences = await storage.getResidencesBySettlement(req.params.settlementId);
      res.json(residences);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch residences" });
    }
  });

  app.post("/api/residences", async (req, res) => {
    try {
      const residence = await storage.createResidence(req.body);
      res.status(201).json(residence);
    } catch (error) {
      res.status(500).json({ error: "Failed to create residence" });
    }
  });

  // Event System endpoints (TotT Event System)
  app.post("/api/events", async (req, res) => {
    try {
      const { worldId, currentYear, currentTimestep, season, characterId, eventType, autoGenerateNarrative, customData } = req.body;
      
      if (!worldId || currentYear === undefined || currentTimestep === undefined) {
        return res.status(400).json({ error: "Missing required fields: worldId, currentYear, currentTimestep" });
      }
      
      const event = await generateEvent({
        worldId,
        currentYear,
        currentTimestep,
        season,
        characterId,
        eventType,
        autoGenerateNarrative: autoGenerateNarrative !== false
      }, customData);
      
      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate event", details: (error as Error).message });
    }
  });

  app.get("/api/characters/:id/events", async (req, res) => {
    try {
      const { eventType, startYear, endYear, limit } = req.query;
      const events = await getCharacterEvents(req.params.id, {
        eventType: eventType as any,
        startYear: startYear ? parseInt(startYear as string) : undefined,
        endYear: endYear ? parseInt(endYear as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined
      });
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch character events" });
    }
  });

  app.get("/api/worlds/:id/events", async (req, res) => {
    try {
      const { eventType, characterId, startYear, endYear, limit } = req.query;
      const events = await getWorldEvents(req.params.id, {
        eventType: eventType as any,
        characterId: characterId as string,
        startYear: startYear ? parseInt(startYear as string) : undefined,
        endYear: endYear ? parseInt(endYear as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined
      });
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch world events" });
    }
  });

  app.post("/api/worlds/:id/trigger-events", async (req, res) => {
    try {
      const { currentYear, currentTimestep } = req.body;
      
      if (currentYear === undefined || currentTimestep === undefined) {
        return res.status(400).json({ error: "Missing required fields: currentYear, currentTimestep" });
      }
      
      const events = await triggerAutomaticEvents(req.params.id, currentYear, currentTimestep);
      res.json({ success: true, eventsGenerated: events.length, events });
    } catch (error) {
      res.status(500).json({ error: "Failed to trigger automatic events", details: (error as Error).message });
    }
  });

  app.post("/api/events/birth", async (req, res) => {
    try {
      const { worldId, parentIds, currentYear, currentTimestep, childData } = req.body;
      
      if (!worldId || !parentIds || !Array.isArray(parentIds) || currentYear === undefined || currentTimestep === undefined) {
        return res.status(400).json({ error: "Missing required fields: worldId, parentIds (array), currentYear, currentTimestep" });
      }
      
      const result = await createBirthEvent(worldId, parentIds, currentYear, currentTimestep, childData);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to create birth event", details: (error as Error).message });
    }
  });

  app.post("/api/events/marriage", async (req, res) => {
    try {
      const { worldId, characterId1, characterId2, currentYear, currentTimestep } = req.body;
      
      if (!worldId || !characterId1 || !characterId2 || currentYear === undefined || currentTimestep === undefined) {
        return res.status(400).json({ error: "Missing required fields: worldId, characterId1, characterId2, currentYear, currentTimestep" });
      }
      
      const event = await createMarriageEvent(worldId, characterId1, characterId2, currentYear, currentTimestep);
      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to create marriage event", details: (error as Error).message });
    }
  });

  // Routine System endpoints (TotT Routine System)
  app.post("/api/characters/:id/routine", async (req, res) => {
    try {
      const { routine } = req.body;
      
      if (!routine || !routine.day || !routine.night) {
        return res.status(400).json({ error: "Missing required field: routine (must have day and night schedules)" });
      }
      
      await setRoutine(req.params.id, routine);
      res.json({ success: true, message: "Routine set successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to set routine", details: (error as Error).message });
    }
  });

  app.get("/api/characters/:id/routine", async (req, res) => {
    try {
      const routine = await getRoutine(req.params.id);
      if (!routine) {
        return res.status(404).json({ error: "No routine found for character" });
      }
      res.json(routine);
    } catch (error) {
      res.status(500).json({ error: "Failed to get routine" });
    }
  });

  app.post("/api/characters/:id/routine/generate", async (req, res) => {
    try {
      const routine = await generateDefaultRoutine(req.params.id);
      await setRoutine(req.params.id, routine);
      res.json({ success: true, routine });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate routine", details: (error as Error).message });
    }
  });

  app.get("/api/characters/:id/activity", async (req, res) => {
    try {
      const { timeOfDay, currentHour } = req.query;
      
      if (!timeOfDay) {
        return res.status(400).json({ error: "Missing required query parameter: timeOfDay" });
      }
      
      const activity = await getCurrentActivity(
        req.params.id,
        timeOfDay as 'day' | 'night',
        currentHour ? parseInt(currentHour as string) : 12
      );
      
      if (!activity) {
        return res.status(404).json({ error: "No activity found for character at this time" });
      }
      
      res.json(activity);
    } catch (error) {
      res.status(500).json({ error: "Failed to get current activity" });
    }
  });

  app.post("/api/characters/:id/whereabouts", async (req, res) => {
    try {
      const { worldId, location, locationType, occasion, timestep, timeOfDay } = req.body;
      
      if (!worldId || !location || !locationType || !occasion || timestep === undefined || !timeOfDay) {
        return res.status(400).json({ error: "Missing required fields: worldId, location, locationType, occasion, timestep, timeOfDay" });
      }
      
      await updateWhereabouts(worldId, req.params.id, location, locationType, occasion, timestep, timeOfDay);
      res.json({ success: true, message: "Whereabouts updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update whereabouts", details: (error as Error).message });
    }
  });

  app.get("/api/worlds/:id/locations/:location/characters", async (req, res) => {
    try {
      const { timeOfDay, currentHour } = req.query;
      
      const characters = await getCharactersAtLocation(
        req.params.id,
        req.params.location,
        timeOfDay as 'day' | 'night' | undefined,
        currentHour ? parseInt(currentHour as string) : undefined
      );
      
      res.json(characters);
    } catch (error) {
      res.status(500).json({ error: "Failed to get characters at location" });
    }
  });

  app.post("/api/worlds/:id/whereabouts/update-all", async (req, res) => {
    try {
      const { timestep, timeOfDay, currentHour } = req.body;
      
      if (timestep === undefined || !timeOfDay || currentHour === undefined) {
        return res.status(400).json({ error: "Missing required fields: timestep, timeOfDay, currentHour" });
      }
      
      const updatedCount = await updateAllWhereabouts(req.params.id, timestep, timeOfDay, currentHour);
      res.json({ success: true, updatedCount, message: `Updated ${updatedCount} character whereabouts` });
    } catch (error) {
      res.status(500).json({ error: "Failed to update all whereabouts", details: (error as Error).message });
    }
  });

  // Social Dynamics System endpoints (Phase 5: TotT Social Dynamics)
  
  // Get relationship details between two characters
  app.get("/api/relationships/:char1Id/:char2Id", async (req, res) => {
    try {
      const { currentYear } = req.query;
      
      if (!currentYear) {
        return res.status(400).json({ error: "currentYear is required" });
      }
      
      const relationship = await getRelationshipDetails(
        req.params.char1Id,
        req.params.char2Id,
        parseInt(currentYear as string)
      );
      
      res.json(relationship);
    } catch (error) {
      res.status(500).json({ error: "Failed to get relationship details", details: (error as Error).message });
    }
  });
  
  // Update relationship after interaction
  app.post("/api/relationships/:char1Id/:char2Id/interact", async (req, res) => {
    try {
      const { interactionQuality, currentYear } = req.body;
      
      if (!interactionQuality || !currentYear) {
        return res.status(400).json({ error: "interactionQuality and currentYear are required" });
      }
      
      const relationship = await updateRelationship(
        req.params.char1Id,
        req.params.char2Id,
        interactionQuality,
        currentYear
      );
      
      res.json(relationship);
    } catch (error) {
      res.status(500).json({ error: "Failed to update relationship", details: (error as Error).message });
    }
  });
  
  // Get salience (importance) of one character to another
  app.get("/api/salience/:observerId/:subjectId", async (req, res) => {
    try {
      const salience = await getSalience(req.params.observerId, req.params.subjectId);
      res.json({ salience });
    } catch (error) {
      res.status(500).json({ error: "Failed to get salience", details: (error as Error).message });
    }
  });
  
  // Update salience after observation/interaction
  app.post("/api/salience/:observerId/:subjectId", async (req, res) => {
    try {
      const { boost } = req.body;
      
      const salience = await updateSalience(
        req.params.observerId,
        req.params.subjectId,
        boost
      );
      
      res.json({ salience });
    } catch (error) {
      res.status(500).json({ error: "Failed to update salience", details: (error as Error).message });
    }
  });
  
  // Get most salient (important) people for a character
  app.get("/api/characters/:id/salient-people", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const salientPeople = await getMostSalientPeople(req.params.id, limit);
      res.json(salientPeople);
    } catch (error) {
      res.status(500).json({ error: "Failed to get salient people", details: (error as Error).message });
    }
  });
  
  // Simulate a social interaction between two characters
  app.post("/api/social/interact", async (req, res) => {
    try {
      const { initiatorId, targetId, location, currentYear } = req.body;
      
      if (!initiatorId || !targetId || !location || !currentYear) {
        return res.status(400).json({ error: "initiatorId, targetId, location, and currentYear are required" });
      }
      
      const result = await socialize(initiatorId, targetId, location, currentYear);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to simulate interaction", details: (error as Error).message });
    }
  });
  
  // Simulate autonomous socializing at a location
  app.post("/api/worlds/:worldId/locations/:location/socialize", async (req, res) => {
    try {
      const { timestep, currentYear } = req.body;
      
      if (timestep === undefined || !currentYear) {
        return res.status(400).json({ error: "timestep and currentYear are required" });
      }
      
      const interactions = await simulateLocationSocializing(
        req.params.worldId,
        req.params.location,
        timestep,
        currentYear
      );
      
      res.json({
        success: true,
        interactionCount: interactions.length,
        interactions
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to simulate location socializing", details: (error as Error).message });
    }
  });
  
  // Get social summary for a character
  app.get("/api/characters/:id/social-summary", async (req, res) => {
    try {
      const { currentYear } = req.query;
      
      if (!currentYear) {
        return res.status(400).json({ error: "currentYear is required" });
      }
      
      const summary = await getSocialSummary(req.params.id, parseInt(currentYear as string));
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to get social summary", details: (error as Error).message });
    }
  });

  // Knowledge & Belief System endpoints (Phase 6: TotT Knowledge)
  
  // Initialize mental model
  app.post("/api/knowledge/init", async (req, res) => {
    try {
      const { observerId, subjectId, initialFacts, relationshipType, currentTimestep } = req.body;
      
      if (!observerId || !subjectId) {
        return res.status(400).json({ error: "observerId and subjectId are required" });
      }
      
      const model = await initializeMentalModel(
        observerId,
        subjectId,
        initialFacts || ['name'],
        relationshipType,
        currentTimestep || 0
      );

      // Auto-sync knowledge to Prolog
      const observer = await storage.getCharacter(observerId);
      const subject = await storage.getCharacter(subjectId);
      if (observer && subject && observer.worldId) {
        prologAutoSync.onKnowledgeChanged(observer.worldId, observer as any, subjectId, subject as any).catch(e => console.warn('[PrologAutoSync] knowledge init:', e));
      }

      res.json(model);
    } catch (error) {
      res.status(500).json({ error: "Failed to initialize mental model", details: (error as Error).message });
    }
  });
  
  // Get mental model
  app.get("/api/knowledge/:observerId/:subjectId", async (req, res) => {
    try {
      const { currentTimestep } = req.query;
      
      const model = await getMentalModel(
        req.params.observerId,
        req.params.subjectId,
        true,
        currentTimestep ? parseInt(currentTimestep as string) : 0
      );
      
      res.json(model);
    } catch (error) {
      res.status(500).json({ error: "Failed to get mental model", details: (error as Error).message });
    }
  });
  
  // Get all knowledge for an observer
  app.get("/api/knowledge/:observerId", async (req, res) => {
    try {
      const summary = await getKnowledgeSummary(req.params.observerId);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to get knowledge summary", details: (error as Error).message });
    }
  });
  
  // Add known fact
  app.post("/api/knowledge/add-fact", async (req, res) => {
    try {
      const { observerId, subjectId, fact, currentTimestep } = req.body;
      
      if (!observerId || !subjectId || !fact) {
        return res.status(400).json({ error: "observerId, subjectId, and fact are required" });
      }
      
      await addKnownFact(observerId, subjectId, fact, currentTimestep || 0);

      // Auto-sync knowledge to Prolog
      const observer = await storage.getCharacter(observerId);
      const subject = await storage.getCharacter(subjectId);
      if (observer && subject && observer.worldId) {
        prologAutoSync.onKnowledgeChanged(observer.worldId, observer as any, subjectId, subject as any).catch(e => console.warn('[PrologAutoSync] knowledge add-fact:', e));
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to add known fact", details: (error as Error).message });
    }
  });
  
  // Add known value
  app.post("/api/knowledge/add-value", async (req, res) => {
    try {
      const { observerId, subjectId, attribute, value, currentTimestep } = req.body;
      
      if (!observerId || !subjectId || !attribute || value === undefined) {
        return res.status(400).json({ error: "observerId, subjectId, attribute, and value are required" });
      }
      
      await addKnownValue(observerId, subjectId, attribute, value, currentTimestep || 0);

      // Auto-sync knowledge to Prolog
      const observer = await storage.getCharacter(observerId);
      const subject = await storage.getCharacter(subjectId);
      if (observer && subject && observer.worldId) {
        prologAutoSync.onKnowledgeChanged(observer.worldId, observer as any, subjectId, subject as any).catch(e => console.warn('[PrologAutoSync] knowledge add-value:', e));
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to add known value", details: (error as Error).message });
    }
  });
  
  // Add belief
  app.post("/api/knowledge/add-belief", async (req, res) => {
    try {
      const { observerId, subjectId, quality, confidence, evidence, currentTimestep } = req.body;
      
      if (!observerId || !subjectId || !quality || confidence === undefined || !evidence) {
        return res.status(400).json({ error: "observerId, subjectId, quality, confidence, and evidence are required" });
      }
      
      const belief = await addBelief(
        observerId,
        subjectId,
        quality,
        confidence,
        evidence,
        currentTimestep || 0
      );

      // Auto-sync knowledge to Prolog
      const observer = await storage.getCharacter(observerId);
      const subject = await storage.getCharacter(subjectId);
      if (observer && subject && observer.worldId) {
        prologAutoSync.onKnowledgeChanged(observer.worldId, observer as any, subjectId, subject as any).catch(e => console.warn('[PrologAutoSync] knowledge add-belief:', e));
      }

      res.json(belief);
    } catch (error) {
      res.status(500).json({ error: "Failed to add belief", details: (error as Error).message });
    }
  });
  
  // Propagate knowledge from speaker to listener
  app.post("/api/knowledge/propagate", async (req, res) => {
    try {
      const { speakerId, listenerId, subjectId, currentTimestep, trustOverride } = req.body;
      
      if (!speakerId || !listenerId || !subjectId || currentTimestep === undefined) {
        return res.status(400).json({ error: "speakerId, listenerId, subjectId, and currentTimestep are required" });
      }
      
      const result = await propagateKnowledge(
        speakerId,
        listenerId,
        subjectId,
        currentTimestep,
        trustOverride
      );
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to propagate knowledge", details: (error as Error).message });
    }
  });
  
  // Propagate all knowledge from speaker to listener
  app.post("/api/knowledge/propagate-all", async (req, res) => {
    try {
      const { speakerId, listenerId, currentTimestep } = req.body;
      
      if (!speakerId || !listenerId || currentTimestep === undefined) {
        return res.status(400).json({ error: "speakerId, listenerId, and currentTimestep are required" });
      }
      
      const results = await propagateAllKnowledge(speakerId, listenerId, currentTimestep);
      
      res.json({
        success: true,
        propagationCount: results.length,
        results
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to propagate all knowledge", details: (error as Error).message });
    }
  });
  
  // Initialize coworker knowledge for a business
  app.post("/api/knowledge/init-coworkers", async (req, res) => {
    try {
      const { businessId, worldId, currentTimestep } = req.body;
      
      if (!businessId || !worldId) {
        return res.status(400).json({ error: "businessId and worldId are required" });
      }
      
      const initialized = await initializeCoworkerKnowledge(businessId, worldId, currentTimestep || 0);
      
      res.json({
        success: true,
        initialized,
        message: `Initialized knowledge for ${initialized} coworker pairs`
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to initialize coworker knowledge", details: (error as Error).message });
    }
  });
  
  // Initialize family knowledge for a character
  app.post("/api/knowledge/init-family", async (req, res) => {
    try {
      const { characterId, currentTimestep } = req.body;
      
      if (!characterId) {
        return res.status(400).json({ error: "characterId is required" });
      }
      
      const initialized = await initializeFamilyKnowledge(characterId, currentTimestep || 0);
      
      res.json({
        success: true,
        initialized,
        message: `Initialized knowledge for ${initialized} family members`
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to initialize family knowledge", details: (error as Error).message });
    }
  });

  // Conversation System endpoints (Phase 7: TotT Conversations)
  
  // Start conversation
  app.post("/api/conversations/start", async (req, res) => {
    try {
      const { initiatorId, targetId, location, currentTimestep } = req.body;
      
      if (!initiatorId || !targetId || !location || currentTimestep === undefined) {
        return res.status(400).json({ error: "initiatorId, targetId, location, and currentTimestep are required" });
      }
      
      const conversation = await startConversation(initiatorId, targetId, location, currentTimestep);
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: "Failed to start conversation", details: (error as Error).message });
    }
  });
  
  // Continue conversation
  app.post("/api/conversations/:id/continue", async (req, res) => {
    try {
      const { currentTimestep } = req.body;
      
      if (currentTimestep === undefined) {
        return res.status(400).json({ error: "currentTimestep is required" });
      }
      
      const utterance = await continueConversation(req.params.id, currentTimestep);
      
      if (!utterance) {
        return res.status(404).json({ error: "Conversation not found or ended" });
      }
      
      res.json(utterance);
    } catch (error) {
      res.status(500).json({ error: "Failed to continue conversation", details: (error as Error).message });
    }
  });
  
  // End conversation
  app.post("/api/conversations/:id/end", async (req, res) => {
    try {
      const { currentTimestep } = req.body;
      
      if (currentTimestep === undefined) {
        return res.status(400).json({ error: "currentTimestep is required" });
      }
      
      const conversation = await endConversation(req.params.id, currentTimestep);
      
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: "Failed to end conversation", details: (error as Error).message });
    }
  });
  
  // Get conversation
  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const conversation = await getConversation(req.params.id);
      
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: "Failed to get conversation", details: (error as Error).message });
    }
  });
  
  // Simulate full conversation
  app.post("/api/conversations/simulate", async (req, res) => {
    try {
      const { char1Id, char2Id, location, duration, currentTimestep } = req.body;
      
      if (!char1Id || !char2Id || !location || currentTimestep === undefined) {
        return res.status(400).json({ error: "char1Id, char2Id, location, and currentTimestep are required" });
      }
      
      const conversation = await simulateConversation(
        char1Id,
        char2Id,
        location,
        duration || 5,
        currentTimestep
      );
      
      res.json({
        success: true,
        conversation,
        utteranceCount: conversation.utterances.length,
        knowledgeTransfers: conversation.knowledgeTransfers.length,
        liesDetected: conversation.liesDetected.length,
        eavesdroppers: conversation.eavesdroppers.length
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to simulate conversation", details: (error as Error).message });
    }
  });
  
  // Get character conversation history
  app.get("/api/conversations/character/:id/history", async (req, res) => {
    try {
      const history = await getCharacterConversationHistory(req.params.id);
      
      if (!history) {
        return res.status(404).json({ error: "Character not found" });
      }
      
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to get conversation history", details: (error as Error).message });
    }
  });

  // Economics System endpoints (Phase 9: TotT Economics)
  
  // Get character wealth
  app.get("/api/economy/wealth/:characterId", async (req, res) => {
    try {
      const wealth = await getWealth(req.params.characterId);
      res.json(wealth);
    } catch (error) {
      res.status(500).json({ error: "Failed to get wealth", details: (error as Error).message });
    }
  });
  
  // Add money
  app.post("/api/economy/wealth/add", async (req, res) => {
    try {
      const { characterId, amount, reason, currentTimestep } = req.body;
      
      if (!characterId || amount === undefined || !reason || currentTimestep === undefined) {
        return res.status(400).json({ error: "characterId, amount, reason, and currentTimestep are required" });
      }
      
      const wealth = await addMoney(characterId, amount, reason, currentTimestep);
      res.json(wealth);
    } catch (error) {
      res.status(500).json({ error: "Failed to add money", details: (error as Error).message });
    }
  });
  
  // Subtract money
  app.post("/api/economy/wealth/subtract", async (req, res) => {
    try {
      const { characterId, amount, reason, currentTimestep } = req.body;
      
      if (!characterId || amount === undefined || !reason || currentTimestep === undefined) {
        return res.status(400).json({ error: "characterId, amount, reason, and currentTimestep are required" });
      }
      
      const wealth = await subtractMoney(characterId, amount, reason, currentTimestep);
      res.json(wealth);
    } catch (error) {
      res.status(500).json({ error: "Failed to subtract money", details: (error as Error).message });
    }
  });
  
  // Transfer money
  app.post("/api/economy/wealth/transfer", async (req, res) => {
    try {
      const { fromId, toId, amount, reason, currentTimestep } = req.body;
      
      if (!fromId || !toId || amount === undefined || !reason || currentTimestep === undefined) {
        return res.status(400).json({ error: "fromId, toId, amount, reason, and currentTimestep are required" });
      }
      
      const result = await transferMoney(fromId, toId, amount, reason, currentTimestep);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to transfer money", details: (error as Error).message });
    }
  });
  
  // Get wealth distribution
  app.get("/api/economy/wealth/distribution/:worldId", async (req, res) => {
    try {
      const distribution = await getWealthDistribution(req.params.worldId);
      res.json(distribution);
    } catch (error) {
      res.status(500).json({ error: "Failed to get wealth distribution", details: (error as Error).message });
    }
  });
  
  // Hire employee
  app.post("/api/economy/employment/hire", async (req, res) => {
    try {
      const { employeeId, businessId, occupation, salary, currentTimestep } = req.body;
      
      if (!employeeId || !businessId || !occupation || salary === undefined || currentTimestep === undefined) {
        return res.status(400).json({ error: "employeeId, businessId, occupation, salary, and currentTimestep are required" });
      }
      
      const contract = await economicsHireEmployee(employeeId, businessId, occupation, salary, currentTimestep);
      res.json(contract);
    } catch (error) {
      res.status(500).json({ error: "Failed to hire employee", details: (error as Error).message });
    }
  });
  
  // Fire employee
  app.post("/api/economy/employment/fire", async (req, res) => {
    try {
      const { employeeId, businessId, reason, currentTimestep } = req.body;
      
      if (!employeeId || !businessId || !reason || currentTimestep === undefined) {
        return res.status(400).json({ error: "employeeId, businessId, reason, and currentTimestep are required" });
      }
      
      await economicsFireEmployee(employeeId, businessId, reason, currentTimestep);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to fire employee", details: (error as Error).message });
    }
  });
  
  // Promote employee
  app.post("/api/economy/employment/promote", async (req, res) => {
    try {
      const { employeeId, businessId, newPosition, newSalary, currentTimestep } = req.body;
      
      if (!employeeId || !businessId || !newPosition || newSalary === undefined || currentTimestep === undefined) {
        return res.status(400).json({ error: "employeeId, businessId, newPosition, newSalary, and currentTimestep are required" });
      }
      
      const contract = await economicsPromoteEmployee(employeeId, businessId, newPosition, newSalary, currentTimestep);
      res.json(contract);
    } catch (error) {
      res.status(500).json({ error: "Failed to promote employee", details: (error as Error).message });
    }
  });
  
  // Pay salaries
  app.post("/api/economy/employment/pay-salaries", async (req, res) => {
    try {
      const { worldId, currentTimestep } = req.body;
      
      if (!worldId || currentTimestep === undefined) {
        return res.status(400).json({ error: "worldId and currentTimestep are required" });
      }
      
      const totalPaid = await paySalaries(worldId, currentTimestep);
      res.json({ success: true, totalPaid });
    } catch (error) {
      res.status(500).json({ error: "Failed to pay salaries", details: (error as Error).message });
    }
  });
  
  // Execute trade
  app.post("/api/economy/trade", async (req, res) => {
    try {
      const { sellerId, buyerId, item, quantity, location, currentTimestep } = req.body;
      
      if (!sellerId || !buyerId || !item || quantity === undefined || !location || currentTimestep === undefined) {
        return res.status(400).json({ error: "sellerId, buyerId, item, quantity, location, and currentTimestep are required" });
      }
      
      const trade = await executeTrade(sellerId, buyerId, item, quantity, location, currentTimestep);
      res.json(trade);
    } catch (error) {
      res.status(500).json({ error: "Failed to execute trade", details: (error as Error).message });
    }
  });
  
  // Get trade history
  app.get("/api/economy/trade/history/:characterId", async (req, res) => {
    try {
      const history = await getTradeHistory(req.params.characterId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to get trade history", details: (error as Error).message });
    }
  });
  
  // Get market prices
  app.get("/api/economy/market/prices/:worldId", async (req, res) => {
    try {
      const { currentTimestep } = req.query;
      const market = await getMarketData(req.params.worldId, currentTimestep ? parseInt(currentTimestep as string) : Date.now());
      res.json(market);
    } catch (error) {
      res.status(500).json({ error: "Failed to get market data", details: (error as Error).message });
    }
  });
  
  // Update market price
  app.post("/api/economy/market/price", async (req, res) => {
    try {
      const { worldId, item, newPrice } = req.body;
      
      if (!worldId || !item || newPrice === undefined) {
        return res.status(400).json({ error: "worldId, item, and newPrice are required" });
      }
      
      const market = await updateMarketPrice(worldId, item, newPrice);
      res.json(market);
    } catch (error) {
      res.status(500).json({ error: "Failed to update market price", details: (error as Error).message });
    }
  });
  
  // Create loan
  app.post("/api/economy/loan/create", async (req, res) => {
    try {
      const { debtorId, creditorId, amount, interestRate, dueDate, currentTimestep } = req.body;
      
      if (!debtorId || !creditorId || amount === undefined || currentTimestep === undefined) {
        return res.status(400).json({ error: "debtorId, creditorId, amount, and currentTimestep are required" });
      }
      
      const debt = await createLoan(debtorId, creditorId, amount, interestRate, dueDate, currentTimestep);
      res.json(debt);
    } catch (error) {
      res.status(500).json({ error: "Failed to create loan", details: (error as Error).message });
    }
  });
  
  // Repay debt
  app.post("/api/economy/loan/repay", async (req, res) => {
    try {
      const { debtId, amount, currentTimestep } = req.body;
      
      if (!debtId || amount === undefined || currentTimestep === undefined) {
        return res.status(400).json({ error: "debtId, amount, and currentTimestep are required" });
      }
      
      const debt = await repayDebt(debtId, amount, currentTimestep);
      res.json(debt);
    } catch (error) {
      res.status(500).json({ error: "Failed to repay debt", details: (error as Error).message });
    }
  });
  
  // Get character debts
  app.get("/api/economy/loan/:characterId", async (req, res) => {
    try {
      const debts = await getCharacterDebts(req.params.characterId);
      res.json(debts);
    } catch (error) {
      res.status(500).json({ error: "Failed to get character debts", details: (error as Error).message });
    }
  });
  
  // Get economic statistics
  app.get("/api/economy/stats/:worldId", async (req, res) => {
    try {
      const stats = await getEconomicStats(req.params.worldId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to get economic stats", details: (error as Error).message });
    }
  });
  
  // Get unemployment rate
  app.get("/api/economy/stats/:worldId/unemployment", async (req, res) => {
    try {
      const rate = await getUnemploymentRate(req.params.worldId);
      res.json({ unemploymentRate: rate });
    } catch (error) {
      res.status(500).json({ error: "Failed to get unemployment rate", details: (error as Error).message });
    }
  });

  // Town Events & Community System endpoints (Phase 10: TotT Town Events) - THE FINAL PHASE!
  
  // Schedule event
  app.post("/api/events/schedule", async (req, res) => {
    try {
      const { worldId, type, name, location, scheduledTimestep, duration, organizers } = req.body;
      
      if (!worldId || !type || !name || !location || scheduledTimestep === undefined || duration === undefined) {
        return res.status(400).json({ error: "worldId, type, name, location, scheduledTimestep, and duration are required" });
      }
      
      const event = await scheduleEvent(worldId, type, name, location, scheduledTimestep, duration, organizers || []);
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to schedule event", details: (error as Error).message });
    }
  });
  
  // Start event
  app.post("/api/events/:id/start", async (req, res) => {
    try {
      const { currentTimestep } = req.body;
      
      if (currentTimestep === undefined) {
        return res.status(400).json({ error: "currentTimestep is required" });
      }
      
      const event = await startEvent(req.params.id, currentTimestep);
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to start event", details: (error as Error).message });
    }
  });
  
  // End event
  app.post("/api/events/:id/end", async (req, res) => {
    try {
      const { currentTimestep } = req.body;
      
      if (currentTimestep === undefined) {
        return res.status(400).json({ error: "currentTimestep is required" });
      }
      
      const event = await endEvent(req.params.id, currentTimestep);
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to end event" });
    }
  });
  
  // Remove attendee
  app.post("/api/events/:id/leave", async (req, res) => {
    try {
      const { characterId } = req.body;
      
      if (!characterId) {
        return res.status(400).json({ error: "characterId is required" });
      }
      
      await removeAttendee(req.params.id, characterId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove attendee", details: (error as Error).message });
    }
  });
  
  // Get event details
  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = getEvent(req.params.id);
      
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to get event", details: (error as Error).message });
    }
  });
  
  // Get all events for world
  app.get("/api/events/world/:worldId", async (req, res) => {
    try {
      const events = await getTownEvents(req.params.worldId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to get world events", details: (error as Error).message });
    }
  });
  
  // Get upcoming events
  app.get("/api/events/world/:worldId/upcoming", async (req, res) => {
    try {
      const { currentTimestep } = req.query;
      
      if (!currentTimestep) {
        return res.status(400).json({ error: "currentTimestep is required" });
      }
      
      const events = await getUpcomingEvents(req.params.worldId, parseInt(currentTimestep as string));
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to get upcoming events", details: (error as Error).message });
    }
  });
  
  // Get event history
  app.get("/api/events/world/:worldId/history", async (req, res) => {
    try {
      const { limit } = req.query;
      const history = await getEventHistory(req.params.worldId, limit ? parseInt(limit as string) : 50);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to get event history", details: (error as Error).message });
    }
  });
  
  // Schedule festival
  app.post("/api/events/festival", async (req, res) => {
    try {
      const { worldId, festivalType, location, scheduledTimestep } = req.body;
      
      if (!worldId || !festivalType || !location || scheduledTimestep === undefined) {
        return res.status(400).json({ error: "worldId, festivalType, location, and scheduledTimestep are required" });
      }
      
      const festival = await scheduleFestival(worldId, festivalType, location, scheduledTimestep);
      res.json(festival);
    } catch (error) {
      res.status(500).json({ error: "Failed to schedule festival", details: (error as Error).message });
    }
  });
  
  // Schedule market
  app.post("/api/events/market", async (req, res) => {
    try {
      const { worldId, location, scheduledTimestep } = req.body;
      
      if (!worldId || !location || scheduledTimestep === undefined) {
        return res.status(400).json({ error: "worldId, location, and scheduledTimestep are required" });
      }
      
      const market = await scheduleMarket(worldId, location, scheduledTimestep);
      res.json(market);
    } catch (error) {
      res.status(500).json({ error: "Failed to schedule market", details: (error as Error).message });
    }
  });
  
  // Schedule wedding
  app.post("/api/events/wedding", async (req, res) => {
    try {
      const { worldId, spouse1Id, spouse2Id, location, scheduledTimestep } = req.body;
      
      if (!worldId || !spouse1Id || !spouse2Id || !location || scheduledTimestep === undefined) {
        return res.status(400).json({ error: "worldId, spouse1Id, spouse2Id, location, and scheduledTimestep are required" });
      }
      
      const wedding = await scheduleWedding(worldId, spouse1Id, spouse2Id, location, scheduledTimestep);
      res.json(wedding);
    } catch (error) {
      res.status(500).json({ error: "Failed to schedule wedding", details: (error as Error).message });
    }
  });
  
  // Schedule funeral
  app.post("/api/events/funeral", async (req, res) => {
    try {
      const { worldId, deceasedId, location, scheduledTimestep } = req.body;
      
      if (!worldId || !deceasedId || !location || scheduledTimestep === undefined) {
        return res.status(400).json({ error: "worldId, deceasedId, location, and scheduledTimestep are required" });
      }
      
      const funeral = await scheduleFuneral(worldId, deceasedId, location, scheduledTimestep);
      res.json(funeral);
    } catch (error) {
      res.status(500).json({ error: "Failed to schedule funeral", details: (error as Error).message });
    }
  });
  
  // Trigger disaster
  app.post("/api/events/disaster", async (req, res) => {
    try {
      const { worldId, disasterType, severity, location, currentTimestep } = req.body;
      
      if (!worldId || !disasterType || !severity || !location || currentTimestep === undefined) {
        return res.status(400).json({ error: "worldId, disasterType, severity, location, and currentTimestep are required" });
      }
      
      const disaster = await triggerDisaster(worldId, disasterType, severity, location, currentTimestep);
      res.json(disaster);
    } catch (error) {
      res.status(500).json({ error: "Failed to trigger disaster", details: (error as Error).message });
    }
  });
  
  // Schedule community meeting
  app.post("/api/events/meeting", async (req, res) => {
    try {
      const { worldId, purpose, location, scheduledTimestep } = req.body;
      
      if (!worldId || !purpose || !location || scheduledTimestep === undefined) {
        return res.status(400).json({ error: "worldId, purpose, location, and scheduledTimestep are required" });
      }
      
      const meeting = await scheduleCommunityMeeting(worldId, purpose, location, scheduledTimestep);
      res.json(meeting);
    } catch (error) {
      res.status(500).json({ error: "Failed to schedule community meeting", details: (error as Error).message });
    }
  });
  
  // Get community morale
  app.get("/api/community/:worldId/morale", async (req, res) => {
    try {
      const morale = getCommunityMorale(req.params.worldId);
      res.json({ morale });
    } catch (error) {
      res.status(500).json({ error: "Failed to get community morale", details: (error as Error).message });
    }
  });
  
  // Adjust community morale
  app.post("/api/community/:worldId/morale", async (req, res) => {
    try {
      const { amount } = req.body;
      
      if (amount === undefined) {
        return res.status(400).json({ error: "amount is required" });
      }
      
      const newMorale = await adjustCommunityMorale(req.params.worldId, amount);
      res.json({ morale: newMorale });
    } catch (error) {
      res.status(500).json({ error: "Failed to adjust community morale", details: (error as Error).message });
    }
  });
  
  // Populate event attendance
  app.post("/api/events/:id/populate-attendance", async (req, res) => {
    try {
      const { attendanceRate } = req.body;
      
      const event = getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      await populateEventAttendance(event, attendanceRate);
      res.json({ success: true, attendees: event.attendees.length });
    } catch (error) {
      res.status(500).json({ error: "Failed to populate attendance", details: (error as Error).message });
    }
  });
  
  // Check for random events
  app.post("/api/events/world/:worldId/check-random", async (req, res) => {
    try {
      const { currentTimestep } = req.body;
      
      if (currentTimestep === undefined) {
        return res.status(400).json({ error: "currentTimestep is required" });
      }
      
      const events = await checkRandomEvents(req.params.worldId, currentTimestep);
      res.json({ triggeredEvents: events });
    } catch (error) {
      res.status(500).json({ error: "Failed to check random events", details: (error as Error).message });
    }
  });

  // World generation endpoints
  app.post("/api/generate/world", async (req, res) => {
    try {
      const generator = new WorldGenerator();
      const config = req.body;
      
      const result = await generator.generateWorld(config);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error("World generation error:", error);
      res.status(500).json({ error: "Failed to generate world", details: (error as Error).message });
    }
  });
  
  app.post("/api/generate/genealogy/:worldId", async (req, res) => {
    try {
      const generator = new WorldGenerator();
      const result = await generator.generateGenealogy(req.params.worldId, req.body);
      
      res.json({
        success: true,
        families: result.families.length,
        totalCharacters: result.totalCharacters,
        generations: result.generations
      });
    } catch (error) {
      console.error("Genealogy generation error:", error);
      res.status(500).json({ error: "Failed to generate genealogy", details: (error as Error).message });
    }
  });
  
  app.post("/api/generate/geography/:worldId", async (req, res) => {
    try {
      const generator = new WorldGenerator();
      const result = await generator.generateGeography(req.params.worldId, req.body);
      
      res.json({
        success: true,
        districts: result.districts.length,
        streets: result.streets.length,
        buildings: result.buildings.length,
        landmarks: result.landmarks.length
      });
    } catch (error) {
      console.error("Geography generation error:", error);
      res.status(500).json({ error: "Failed to generate geography", details: (error as Error).message });
    }
  });
  
  app.get("/api/generate/presets", async (req, res) => {
    try {
      const presets = WorldGenerator.getPresets();
      res.json(presets);
    } catch (error) {
      res.status(500).json({ error: "Failed to get presets" });
    }
  });

  // Hierarchical generation endpoint
  app.post("/api/generate/hierarchical", async (req, res) => {
    try {
      const config = req.body;
      const { worldType, customPrompt, customLabel, gameType } = config;
      let totalPopulation = 0;
      let numCountriesCreated = 0;
      let numStates = 0;
      let numSettlements = 0;

      // Resolve per-country configs: new format (countries array) or flat legacy fields
      const countryConfigs: Array<{
        terrain: string;
        foundedYear: number;
        generateStates: boolean;
        numStatesPerCountry: number;
        numCitiesPerState: number;
        numTownsPerState: number;
        numVillagesPerState: number;
        numFoundingFamilies: number;
        generations: number;
        marriageRate: number;
        fertilityRate: number;
        deathRate: number;
      }> = config.countries && Array.isArray(config.countries) && config.countries.length > 0
        ? config.countries
        : Array(config.numCountries || 1).fill(null).map(() => ({
            terrain: config.terrain || 'plains',
            foundedYear: config.foundedYear || 1850,
            generateStates: config.generateStates !== false,
            numStatesPerCountry: config.numStatesPerCountry || 1,
            numCitiesPerState: config.numCitiesPerState ?? 0,
            numTownsPerState: config.numTownsPerState ?? 1,
            numVillagesPerState: config.numVillagesPerState ?? 0,
            numFoundingFamilies: config.numFoundingFamilies || 10,
            generations: config.generations || 4,
            marriageRate: config.marriageRate || 0.7,
            fertilityRate: config.fertilityRate || 0.6,
            deathRate: config.deathRate || 0.3,
          }));

      const numCountriesTotal = countryConfigs.length;

      // Single-shot mode: Generate ALL names in one API call (much faster)
      const useSingleShot = config.useSingleShot !== false;

      if (useSingleShot && nameGenerator.isEnabled() && config.generateGenealogy) {
        console.log('🚀 Using SINGLE-SHOT generation mode for maximum efficiency...');

        const world = await storage.getWorld(config.worldId);

        // Build settlement plan across ALL countries
        const settlementPlan: Array<{ type: 'city' | 'town' | 'village'; numFamilies: number; childrenPerFamily: number }> = [];
        // Track which settlements belong to which country (for later assignment)
        const countrySettlementRanges: Array<{ start: number; end: number; statesCount: number }> = [];

        for (const cc of countryConfigs) {
          const statesCount = cc.generateStates ? (cc.numStatesPerCountry || 1) : 1;
          const startIdx = settlementPlan.length;
          for (let j = 0; j < statesCount; j++) {
            for (let k = 0; k < (cc.numCitiesPerState || 0); k++) {
              settlementPlan.push({ type: 'city', numFamilies: cc.numFoundingFamilies || 10, childrenPerFamily: 2 });
            }
            for (let k = 0; k < (cc.numTownsPerState || 0); k++) {
              settlementPlan.push({ type: 'town', numFamilies: cc.numFoundingFamilies || 10, childrenPerFamily: 2 });
            }
            for (let k = 0; k < (cc.numVillagesPerState || 0); k++) {
              settlementPlan.push({ type: 'village', numFamilies: cc.numFoundingFamilies || 10, childrenPerFamily: 2 });
            }
          }
          countrySettlementRanges.push({ start: startIdx, end: settlementPlan.length, statesCount });
        }

        if (settlementPlan.length === 0) {
          console.log('⚠️ No settlements to generate, skipping single-shot mode');
          // Fall through to traditional generation
        } else {
          // Compute total states for name generation
          const totalStatesForNames = countryConfigs.reduce((sum, cc) => sum + (cc.generateStates ? (cc.numStatesPerCountry || 1) : 0), 0);

          // Generate ALL names in ONE API call
          const allNames = await nameGenerator.generateCompleteWorldNames({
            worldId: config.worldId,
            worldName: world?.name || 'Unknown World',
            worldDescription: config.worldDescription || world?.description || undefined,
            worldType,
            customPrompt,
            customLabel,
            gameType,
            numCountries: numCountriesTotal,
            numStatesPerCountry: totalStatesForNames > 0 ? Math.ceil(totalStatesForNames / numCountriesTotal) : 0,
            governmentType: config.governmentType || 'monarchy',
            settlements: settlementPlan
          });

          console.log(`✅ Generated names complete!`);

          let stateNameIdx = 0;

          // Create countries using per-country configs
          for (let ci = 0; ci < numCountriesTotal; ci++) {
            const cc = countryConfigs[ci];
            const countryNameData = allNames.countries[ci] || {
              name: `Kingdom ${ci + 1}`,
              description: `A ${config.governmentType || 'monarchial'} realm`
            };

            const country = await storage.createCountry({
              worldId: config.worldId,
              name: countryNameData.name,
              description: countryNameData.description,
              governmentType: config.governmentType || 'monarchy',
              economicSystem: config.economicSystem || 'agricultural',
              foundedYear: cc.foundedYear
            });
            numCountriesCreated++;

            const range = countrySettlementRanges[ci];
            const statesCount = range.statesCount;
            let settlementIdx = range.start;

            const settlementsPerState = statesCount > 0 ? Math.ceil((range.end - range.start) / statesCount) : (range.end - range.start);

            for (let j = 0; j < statesCount; j++) {
              let stateId = null;

              if (cc.generateStates) {
                const stateName = allNames.states[stateNameIdx]?.name || `Province ${stateNameIdx + 1}`;
                const state = await storage.createState({
                  worldId: config.worldId,
                  countryId: country.id,
                  name: stateName,
                  stateType: 'province',
                  terrain: cc.terrain || 'plains'
                });
                stateId = state.id;
                numStates++;
                stateNameIdx++;
              }

              // Create settlements for this state
              const stateSettlementEnd = Math.min(settlementIdx + settlementsPerState, range.end);
              while (settlementIdx < stateSettlementEnd) {
                const plan = settlementPlan[settlementIdx];
                const settlementName = allNames.settlements[settlementIdx]?.name || `${plan.type} ${settlementIdx}`;

                const settlement = await storage.createSettlement({
                  worldId: config.worldId,
                  countryId: country.id,
                  stateId: stateId,
                  name: settlementName,
                  settlementType: plan.type,
                  terrain: cc.terrain || 'plains',
                  population: 0,
                  foundedYear: cc.foundedYear
                });
                numSettlements++;

                // Create families using pre-generated names
                const familiesForSettlement = allNames.families.filter((f: any) => f.settlementIndex === settlementIdx);

                for (const familyData of familiesForSettlement) {
                  const father = await storage.createCharacter({
                    worldId: config.worldId,
                    firstName: familyData.fatherFirstName,
                    lastName: familyData.surname,
                    gender: 'male',
                    birthYear: cc.foundedYear - 25,
                    isAlive: true,
                    currentLocation: settlement.id,
                    socialAttributes: { generation: 0, founderFamily: true }
                  });

                  const mother = await storage.createCharacter({
                    worldId: config.worldId,
                    firstName: familyData.motherFirstName,
                    lastName: familyData.surname,
                    maidenName: familyData.motherMaidenName,
                    gender: 'female',
                    birthYear: cc.foundedYear - 23,
                    isAlive: true,
                    spouseId: father.id,
                    currentLocation: settlement.id,
                    socialAttributes: { generation: 0, founderFamily: true }
                  });

                  await storage.updateCharacter(father.id, { spouseId: mother.id });

                  const childIds = [];
                  for (const childData of familyData.children || []) {
                    const child = await storage.createCharacter({
                      worldId: config.worldId,
                      firstName: childData.firstName,
                      lastName: familyData.surname,
                      gender: childData.gender,
                      birthYear: cc.foundedYear + 1,
                      isAlive: true,
                      parentIds: [father.id, mother.id],
                      currentLocation: settlement.id,
                      socialAttributes: { generation: 1 }
                    });
                    childIds.push(child.id);
                    totalPopulation++;
                  }

                  await storage.updateCharacter(father.id, { childIds });
                  await storage.updateCharacter(mother.id, { childIds });
                  totalPopulation += 2;
                }

                settlementIdx++;
              }
            }
          }

          // Generate geography for all settlements
          if (config.generateGeography) {
            const allSettlements = await storage.getSettlementsByWorld(config.worldId);
            const generator = new WorldGenerator();
            for (const settlement of allSettlements) {
              const cc = countryConfigs[0]; // Use first country's foundedYear as fallback
              await generator.generateGeography(settlement.id, {
                foundedYear: settlement.foundedYear || cc.foundedYear
              });
            }
            console.log(`🗺️  Generated geography for ${allSettlements.length} settlements`);
          }

          console.log(`🎉 Single-shot generation complete: ${numSettlements} settlements, ${totalPopulation} characters`);

          // Auto-generate Prolog content
          try {
            const [worldRules, worldActions, worldQuests] = await Promise.all([
              storage.getRulesByWorld(config.worldId),
              storage.getActionsByWorld(config.worldId),
              storage.getQuestsByWorld(config.worldId),
            ]);
            let prologConverted = 0;
            for (const rule of worldRules) {
              if (rule.content) {
                try { const meta = extractAllMetadata(rule.content); await storage.updateRule(rule.id, { ...(meta.priority != null ? { priority: meta.priority } : {}), ...(meta.ruleType ? { ruleType: meta.ruleType } : {}) }); prologConverted++; } catch {}
              }
            }
            for (const action of worldActions) {
              if (!action.content) {
                try { const r = convertActionToProlog(action as any); if (r.prologContent) { await storage.updateAction(action.id, { content: r.prologContent }); prologConverted++; } } catch {}
              }
            }
            for (const quest of worldQuests) {
              if (!quest.content) {
                try { const r = convertQuestToProlog(quest as any); if (r.prologContent) { await storage.updateQuest(quest.id, { content: r.prologContent }); prologConverted++; } } catch {}
              }
            }
            if (prologConverted > 0) console.log(`🔮 Auto-generated Prolog content for ${prologConverted} entities`);
          } catch (e) {
            console.warn('[PrologAutoConvert] Failed during world generation:', e);
          }

          return res.json({
            success: true,
            numCountries: numCountriesCreated,
            numStates,
            numSettlements,
            totalPopulation,
            singleShot: true
          });
        }
      }

      // Traditional (fallback) generation — iterate per-country configs
      for (let ci = 0; ci < numCountriesTotal; ci++) {
        const cc = countryConfigs[ci];

        // Generate country name
        const world = await storage.getWorld(config.worldId);
        let countryName = numCountriesTotal > 1
          ? `Kingdom ${ci + 1}`
          : 'Kingdom';
        let countryDescription = `A ${config.governmentType || 'monarchial'} realm`;

        if (nameGenerator.isEnabled() && world) {
          try {
            const generatedName = await nameGenerator.generateSettlementName({
              worldName: world.name || 'Unknown World',
              worldDescription: world.description || undefined,
              settlementType: 'city',
              terrain: cc.terrain || 'plains'
            });
            if (generatedName && generatedName.length > 0) {
              countryName = generatedName;
            }
            if (world.description) {
              countryDescription = `A ${config.governmentType || 'monarchial'} realm in ${world.description}`;
            }
          } catch (error) {
            console.warn(`Failed to generate country name, using fallback: ${error}`);
          }
        }

        const country = await storage.createCountry({
          worldId: config.worldId,
          name: countryName,
          description: countryDescription,
          governmentType: config.governmentType || 'monarchy',
          economicSystem: config.economicSystem || 'agricultural',
          foundedYear: cc.foundedYear
        });
        numCountriesCreated++;

        const numStatesForCountry = cc.generateStates ? (cc.numStatesPerCountry || 1) : 1;

        for (let j = 0; j < numStatesForCountry; j++) {
          let stateId = null;

          if (cc.generateStates) {
            const stateName = `Province ${j + 1}`;
            const state = await storage.createState({
              worldId: config.worldId,
              countryId: country.id,
              name: stateName,
              stateType: 'province',
              terrain: cc.terrain || 'plains'
            });
            stateId = state.id;
            numStates++;
          }

          const numCities = cc.numCitiesPerState || 0;
          const numTowns = cc.numTownsPerState || 0;
          const numVillages = cc.numVillagesPerState || 0;

          // Helper to create settlements with batch name generation
          const createSettlements = async (type: 'city' | 'town' | 'village', count: number) => {
            if (count === 0) return;

            let settlementNames: string[];
            if (nameGenerator.isEnabled()) {
              try {
                const contexts = Array(count).fill(null).map(() => ({
                  worldName: world?.name || 'Unknown World',
                  worldDescription: world?.description || undefined,
                  countryName: country.name,
                  countryDescription: country.description || undefined,
                  countryGovernment: country.governmentType || undefined,
                  countryEconomy: country.economicSystem || undefined,
                  settlementType: type,
                  terrain: cc.terrain || 'plains'
                }));
                settlementNames = await nameGenerator.generateSettlementNamesBatch(contexts);
                console.log(`   🏙️  Generated ${settlementNames.length} ${type} names in batch`);
              } catch (error) {
                console.warn(`Failed to batch generate settlement names, using fallbacks: ${error}`);
                settlementNames = Array(count).fill(null).map((_, k) =>
                  `${type.charAt(0).toUpperCase() + type.slice(1)} ${k + 1}`
                );
              }
            } else {
              settlementNames = Array(count).fill(null).map((_, k) =>
                `${type.charAt(0).toUpperCase() + type.slice(1)} ${k + 1}`
              );
            }

            for (let k = 0; k < count; k++) {
              const settlement = await storage.createSettlement({
                worldId: config.worldId,
                countryId: country.id,
                stateId: stateId,
                name: settlementNames[k],
                settlementType: type,
                terrain: cc.terrain || 'plains',
                population: 0,
                foundedYear: cc.foundedYear,
                generationConfig: {
                  numFoundingFamilies: cc.numFoundingFamilies || 10,
                  generations: cc.generations || 4,
                  marriageRate: cc.marriageRate || 0.7,
                  fertilityRate: cc.fertilityRate || 0.6,
                  deathRate: cc.deathRate || 0.3
                }
              });
              numSettlements++;

              if (config.generateGenealogy) {
                const generator = new WorldGenerator();
                const genealogyResult = await generator.generateGenealogy(config.worldId, {
                  settlementId: settlement.id,
                  numFoundingFamilies: cc.numFoundingFamilies || 10,
                  generations: cc.generations || 4,
                  marriageRate: cc.marriageRate || 0.7,
                  fertilityRate: cc.fertilityRate || 0.6,
                  deathRate: cc.deathRate || 0.3,
                  startYear: cc.foundedYear || 1900
                });
                totalPopulation += genealogyResult.totalCharacters;
              }

              if (config.generateGeography) {
                const generator = new WorldGenerator();
                await generator.generateGeography(settlement.id, {
                  foundedYear: cc.foundedYear
                });
              }
            }
          };

          await createSettlements('city', numCities);
          await createSettlements('town', numTowns);
          await createSettlements('village', numVillages);
        }
      }

      // Auto-generate Prolog content
      try {
        const [worldRules, worldActions, worldQuests] = await Promise.all([
          storage.getRulesByWorld(config.worldId),
          storage.getActionsByWorld(config.worldId),
          storage.getQuestsByWorld(config.worldId),
        ]);
        let prologConverted = 0;
        for (const rule of worldRules) {
          if (rule.content) {
            try { const meta = extractAllMetadata(rule.content); await storage.updateRule(rule.id, { ...(meta.priority != null ? { priority: meta.priority } : {}), ...(meta.ruleType ? { ruleType: meta.ruleType } : {}) }); prologConverted++; } catch {}
          }
        }
        for (const action of worldActions) {
          if (!action.content) {
            try { const r = convertActionToProlog(action as any); if (r.prologContent) { await storage.updateAction(action.id, { content: r.prologContent }); prologConverted++; } } catch {}
          }
        }
        for (const quest of worldQuests) {
          if (!quest.content) {
            try { const r = convertQuestToProlog(quest as any); if (r.prologContent) { await storage.updateQuest(quest.id, { content: r.prologContent }); prologConverted++; } } catch {}
          }
        }
        if (prologConverted > 0) console.log(`🔮 Auto-generated Prolog content for ${prologConverted} entities`);
      } catch (e) {
        console.warn('[PrologAutoConvert] Failed during world generation:', e);
      }

      res.json({
        success: true,
        numCountries: numCountriesCreated,
        numStates,
        numSettlements,
        totalPopulation
      });
    } catch (error) {
      console.error("Hierarchical generation error:", error);
      res.status(500).json({ error: "Failed to generate hierarchy", details: (error as Error).message });
    }
  });

  // Extend existing locations
  app.post("/api/generate/extend", async (req, res) => {
    try {
      const config = req.body;
      let newSettlements = 0;
      let newCharacters = 0;

      // Determine the target for extension
      const targetCountryId = config.countryId;
      const targetStateId = config.stateId;
      const targetSettlementId = config.settlementId;

      // If extending a specific settlement with more generations
      if (targetSettlementId && config.addGenerations > 0) {
        const generator = new WorldGenerator();
        const genealogyResult = await generator.generateGenealogy(config.worldId, {
          settlementId: targetSettlementId,
          numFoundingFamilies: config.numFoundingFamilies || 5,
          generations: config.addGenerations,
          marriageRate: config.marriageRate || 0.7,
          fertilityRate: config.fertilityRate || 0.6,
          deathRate: config.deathRate || 0.3,
          startYear: config.foundedYear || config.currentYear || 1900
        });
        newCharacters += genealogyResult.totalCharacters;
      }

      // Add new settlements to a country or state
      const parentCountryId = targetStateId ? (await storage.getState(targetStateId))?.countryId : targetCountryId;
      
      if (parentCountryId) {
        // Fetch context for name generation
        const world = await storage.getWorld(config.worldId);
        const country = await storage.getCountry(parentCountryId);
        const state = targetStateId ? await storage.getState(targetStateId) : null;
        
        const createSettlements = async (type: 'city' | 'town' | 'village', count: number) => {
          if (count === 0) return;
          
          // Batch generate all settlement names at once
          let settlementNames: string[];
          if (nameGenerator.isEnabled()) {
            try {
              const contexts = Array(count).fill(null).map(() => ({
                worldName: world?.name || 'Unknown World',
                worldDescription: world?.description || undefined,
                countryName: country?.name || undefined,
                countryDescription: country?.description || undefined,
                countryGovernment: country?.governmentType || undefined,
                countryEconomy: country?.economicSystem || undefined,
                stateName: state?.name || undefined,
                settlementType: type,
                terrain: config.terrain || 'plains'
              }));
              settlementNames = await nameGenerator.generateSettlementNamesBatch(contexts);
              console.log(`   🏙️  Batch generated ${settlementNames.length} ${type} names`);
            } catch (error) {
              console.warn(`Failed to batch generate settlement names: ${error}`);
              settlementNames = Array(count).fill(null).map((_, i) => 
                `${type.charAt(0).toUpperCase() + type.slice(1)} ${i + 1}`
              );
            }
          } else {
            settlementNames = Array(count).fill(null).map((_, i) => 
              `${type.charAt(0).toUpperCase() + type.slice(1)} ${i + 1}`
            );
          }

          for (let i = 0; i < count; i++) {
            const settlementName = settlementNames[i];
            
            const settlementData = {
              worldId: config.worldId,
              countryId: parentCountryId,
              stateId: targetStateId,
              name: settlementName,
              settlementType: type,
              terrain: config.terrain || 'plains',
              population: 0,
              foundedYear: config.foundedYear || 1850,
              generationConfig: {
                numFoundingFamilies: config.numFoundingFamilies || 10,
                generations: config.generations || 4,
                marriageRate: config.marriageRate || 0.7,
                fertilityRate: config.fertilityRate || 0.6,
                deathRate: config.deathRate || 0.3
              }
            };
            
            const settlement = await storage.createSettlement(settlementData);
            newSettlements++;
            
            // Generate genealogy for new settlement
            if (config.generateGenealogy) {
              const generator = new WorldGenerator();
              const genealogyResult = await generator.generateGenealogy(config.worldId, {
                settlementId: settlement.id,
                numFoundingFamilies: config.numFoundingFamilies || 10,
                generations: config.generations || 4,
                marriageRate: config.marriageRate || 0.7,
                fertilityRate: config.fertilityRate || 0.6,
                deathRate: config.deathRate || 0.3,
                startYear: config.foundedYear || config.currentYear || 1850
              });
              newCharacters += genealogyResult.totalCharacters;
            }
            
            // Generate geography for new settlement
            if (config.generateGeography) {
              const generator = new WorldGenerator();
              await generator.generateGeography(settlement.id, {
                foundedYear: config.foundedYear || 1850
              });
            }
          }
        };
        
        await createSettlements('city', config.addCities || 0);
        await createSettlements('town', config.addTowns || 0);
        await createSettlements('village', config.addVillages || 0);
      }

      res.json({
        success: true,
        newSettlements,
        newCharacters
      });
    } catch (error) {
      console.error("Extension error:", error);
      res.status(500).json({ error: "Failed to extend location", details: (error as Error).message });
    }
  });

  // Progress tracking endpoints
  app.get("/api/progress/:taskId", async (req, res) => {
    try {
      const { progressTracker } = await import("./utils/progress-tracker.js");
      const progress = progressTracker.getLatestProgress(req.params.taskId);
      
      if (!progress) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to get progress" });
    }
  });

  // Complete world generation (societies + rules + actions + quests)
  app.post("/api/generate/complete-world", async (req, res) => {
    try {
      const { worldId, worldType, customPrompt, customLabel, gameType, worldName, worldDescription, worldLanguages: requestedWorldLanguages, learningTargetLanguage } = req.body;

      // Validate: language-learning worlds must specify a learning target language
      if (gameType === 'language-learning' && !learningTargetLanguage) {
        return res.status(400).json({ error: "Language-learning worlds require a learning target language. Add at least one world language and mark it as the learning target." });
      }

      const { progressTracker } = await import("./utils/progress-tracker.js");
      const taskId = `world-gen-${worldId}-${Date.now()}`;

      // Start tracking progress
      progressTracker.startTask(taskId);

      // Return taskId immediately so frontend can start polling
      res.json({ taskId, message: "Generation started" });
      
      // Run generation in background
      (async () => {
        try {
          progressTracker.updateProgress(taskId, 'initializing', 'Preparing world generation...', 5);
          
          console.log(`🌍 Generating complete world: ${worldName}...`);
          console.log(`   World Type: ${worldType || 'default'}`);
          console.log(`   Custom Prompt: ${customPrompt ? 'Yes' : 'No'}`);

          const existingWorld = await storage.getWorld(worldId);
          // Prefer learningTargetLanguage from request, fall back to deprecated world.targetLanguage
          const worldTargetLanguage = learningTargetLanguage || existingWorld?.targetLanguage || null;

          // Enrich the world description with the world type
      const worldTypeDescriptions: Record<string, string> = {
        'medieval-fantasy': 'A medieval fantasy realm with knights, castles, magic, and dragons',
        'high-fantasy': 'An epic high fantasy world with multiple races, powerful magic, and legendary quests',
        'low-fantasy': 'A realistic low fantasy world with subtle magical elements woven into everyday life',
        'dark-fantasy': 'A dark fantasy world of gothic horror and supernatural dread',
        'urban-fantasy': 'A modern urban fantasy setting where magic lurks beneath the surface of city life',
        'sci-fi-space': 'A space opera universe with interstellar travel, alien civilizations, and galactic empires',
        'cyberpunk': 'A cyberpunk dystopia of high tech and low life, dominated by mega-corporations',
        'post-apocalyptic': 'A post-apocalyptic wasteland where survivors struggle in a devastated world',
        'steampunk': 'A steampunk world where Victorian aesthetics meet advanced steam-powered technology',
        'dieselpunk': 'A dieselpunk setting combining 1920s-1950s aesthetics with advanced diesel technology',
        'historical-ancient': 'An ancient civilization inspired by Rome, Greece, Egypt, and other classical cultures',
        'historical-medieval': 'A historically accurate medieval setting drawn from European or Asian history',
        'historical-renaissance': 'A Renaissance world of art, science, political intrigue, and cultural rebirth',
        'historical-victorian': 'A Victorian era world marked by industrial revolution, colonialism, and social change',
        'wild-west': 'A Wild West frontier of cowboys, outlaws, and dusty frontier towns',
        'modern-realistic': 'A contemporary modern world with real-world issues and challenges',
        'superhero': 'A superhero world where powered individuals protect society from threats',
        'horror': 'A horror world of supernatural terrors and psychological dread',
        'mythological': 'A mythological world where gods, myths, and legendary creatures shape reality',
        'solarpunk': 'An optimistic solarpunk future built on sustainable technology and harmony with nature',
      };

      const enrichedDescription = customPrompt ||
        (worldType && worldTypeDescriptions[worldType]) ||
        worldDescription ||
        'A procedurally generated world';

      // Update the world with the enriched description
      await storage.updateWorld(worldId, {
        description: enrichedDescription,
      });

      let totalPopulation = 0;
      let numRules = 0;
      let numActions = 0;
      let numQuests = 0;
      let numItems = 0;
      let numGrammars = 0;
      let numCountries = 0;
      let numSettlements = 0;
      
      // Step 1: Generate hierarchical geography (countries, states, settlements, characters)
      console.log('📍 Step 1: Generating geography and societies...');
          progressTracker.updateProgress(taskId, 'geography', 'Generating countries, settlements, and societies...', 10);
      const hierarchicalResponse = await fetch(`${req.protocol}://${req.get('host')}/api/generate/hierarchical`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worldId,
          worldType,
          customPrompt,
          customLabel,
          gameType,
          worldDescription: enrichedDescription,
          generateGenealogy: req.body.generateGenealogy !== false,
          generateGeography: req.body.generateGeography !== false,
          governmentType: 'monarchy',
          economicSystem: 'feudal',
          // Per-country configs (new format) — falls back to flat defaults in hierarchical endpoint
          countries: req.body.countries,
        })
      });
      
      if (hierarchicalResponse.ok) {
        const result = await hierarchicalResponse.json();
        totalPopulation = result.totalPopulation || 0;
        numCountries = result.numCountries || 0;
        numSettlements = result.numSettlements || 0;
        console.log(`✅ Created ${numCountries} countries, ${numSettlements} settlements, ${totalPopulation} characters`);
            progressTracker.updateProgress(taskId, 'geography-complete', `Created ${numSettlements} settlements with ${totalPopulation} characters`, 40);
      }

      // Step 1b: Create world language records
      // For language-learning worlds: create a "real" WorldLanguage for the target
      // language (isLearningTarget=true) and optionally a constructed conlang.
      if (gameType === 'language-learning' && worldTargetLanguage) {
        try {
          console.log(`🗣️ Creating world language records for target "${worldTargetLanguage}"...`);

          // 1) Create a "real" WorldLanguage record for the actual target language
          const { getLanguageBCP47 } = await import("@shared/language-utils");
          await storage.createWorldLanguage({
            worldId,
            scopeType: "world",
            scopeId: worldId,
            name: worldTargetLanguage,
            description: `The ${worldTargetLanguage} language — the player's learning target.`,
            kind: "real",
            realCode: getLanguageBCP47(worldTargetLanguage),
            isPrimary: true,
            isLearningTarget: true,
            influenceLanguageIds: [],
            realInfluenceCodes: [],
            config: null,
            features: null,
            phonemes: null,
            grammar: null,
            writingSystem: null,
            culturalContext: null,
            phoneticInventory: null,
            sampleWords: null,
            sampleTexts: null,
            etymology: null,
            dialectVariations: null,
            learningModules: null,
          });
          console.log(`🗣️ Real language record created for ${worldTargetLanguage}.`);

          // Note: For language-learning worlds, we only create the real language
          // record above. A constructed conlang would confuse learners who need
          // accurate target-language data (phonemes, grammar, vocabulary).
          console.log(`🗣️ Real language record created — skipping conlang generation for language-learning world.`);
        } catch (error) {
          console.warn('⚠️ Language generation skipped:', (error as Error).message);
        }
      }

      // Step 1c: Create WorldLanguage records for explicitly requested world languages
      if (Array.isArray(requestedWorldLanguages) && requestedWorldLanguages.length > 0) {
        try {
          const { getLanguageBCP47: getBCP47 } = await import("@shared/language-utils");
          // Check which languages already have records (e.g., the learning target created in step 1b)
          const existingLangs = await storage.getWorldLanguagesByWorld(worldId);
          const existingNames = new Set(existingLangs.map(l => l.name));

          for (const langName of requestedWorldLanguages) {
            if (existingNames.has(langName)) continue;
            await storage.createWorldLanguage({
              worldId,
              scopeType: "world",
              scopeId: worldId,
              name: langName,
              description: `The ${langName} language spoken in ${worldName}.`,
              kind: "real",
              realCode: getBCP47(langName),
              isPrimary: existingLangs.length === 0, // primary if no others exist yet
              isLearningTarget: false,
              influenceLanguageIds: [],
              realInfluenceCodes: [],
              config: null,
              features: null,
              phonemes: null,
              grammar: null,
              writingSystem: null,
              culturalContext: null,
              phoneticInventory: null,
              sampleWords: null,
              sampleTexts: null,
              etymology: null,
              dialectVariations: null,
              learningModules: null,
            });
            console.log(`🗣️ World language record created: ${langName}`);
          }
        } catch (error) {
          console.warn('⚠️ World language creation skipped:', (error as Error).message);
        }
      }

      // Step 2: Generate character truths (backstories, traits, secrets)
      if (isGeminiConfigured() && totalPopulation > 0) {
        console.log('📖 Step 2: Generating character truths...');
        progressTracker.updateProgress(taskId, 'truths', 'Creating character backstories and secrets...', 45);
        try {
          const { GoogleGenerativeAI } = await import("@google/generative-ai");
          const { getGeminiApiKey, GEMINI_MODELS } = await import("./config/gemini.js");
          
          // Fetch all characters from the world
          const characters = await storage.getCharactersByWorld(worldId);
          
          if (characters.length > 0) {
            const worldContext = customPrompt || 
              `A ${worldType || 'medieval-fantasy'} world named "${worldName}". ${worldDescription || ''}`;
            
            // Limit to first 50 characters to avoid overwhelming the context window
            const charactersToProcess = characters.slice(0, 50);
            
            const truthsPrompt = `Generate interesting character truths (backstories, personality traits, secrets, relationships) for ${charactersToProcess.length} characters in ${worldContext}.

For each character, create 2-3 truths that include:
- A defining personality trait or quirk
- A secret or hidden aspect of their past
- A relationship truth or social connection

Return as a JSON array with this structure:
[
  {
    "characterIndex": 0,
    "truths": [
      {
        "title": "Brief truth title",
        "content": "1-2 sentence description",
        "entryType": "trait|secret|relationship|backstory",
        "importance": 1-10
      }
    ]
  }
]

Character list:
${charactersToProcess.map((c, i) => `${i}. ${c.firstName} ${c.lastName} (${c.gender}, age ${c.birthYear ? ((worldDescription?.match(/year (\d+)/)?.[1] || 1900) - c.birthYear) : 'unknown'})`).join('\n')}

Make truths fitting for the world's theme and each character's context.`;
            
            const genAI = new GoogleGenerativeAI(getGeminiApiKey()!);
            const model = genAI.getGenerativeModel({ 
              model: GEMINI_MODELS.PRO,
              generationConfig: {
                temperature: 0.95,
                responseMimeType: 'application/json',
              }
            });
            
            const result = await model.generateContent(truthsPrompt);
            const text = result.response.text().trim();
            const generatedTruths = JSON.parse(text);
            
            let numTruths = 0;
            
            // Parse and save truths
            if (Array.isArray(generatedTruths)) {
              for (const charTruths of generatedTruths) {
                const character = charactersToProcess[charTruths.characterIndex];
                if (character && Array.isArray(charTruths.truths)) {
                  for (const truth of charTruths.truths) {
                    if (truth.title && truth.content) {
                      await storage.createTruth({
                        worldId,
                        characterId: character.id,
                        title: truth.title,
                        content: truth.content,
                        entryType: truth.entryType || 'backstory',
                        importance: truth.importance || 5,
                        isPublic: false,
                        source: 'ai_generated',
                        tags: ['generated', 'ai'],
                      });
                      numTruths++;
                    }
                  }
                }
              }
            }
            
            console.log(`✅ Generated ${numTruths} character truths`);
            progressTracker.updateProgress(taskId, 'truths-complete', `Created ${numTruths} character truths`, 48);
          }
        } catch (error) {
          console.warn('⚠️ Character truth generation skipped:', (error as Error).message);
        }
      }

      // Step 3: Generate AI-powered rules if API key is available
      if (isGeminiConfigured()) {
        console.log('📜 Step 3: Generating social rules...');
            progressTracker.updateProgress(taskId, 'rules', 'Generating social rules and norms...', 55);
        try {
          const { GoogleGenerativeAI } = await import("@google/generative-ai");
          const { getGeminiApiKey, GEMINI_MODELS } = await import("./config/gemini.js");
          
          const worldContext = customPrompt || 
            `A ${worldType || 'medieval-fantasy'} world named "${worldName}". ${worldDescription || ''}`;
          
          const rulesPrompt = `Generate 10 social rules and norms for ${worldContext}.

Include rules about:
- Social hierarchy and status
- Cultural customs and etiquette
- Taboos and forbidden actions
- Traditions and rituals
- Daily life expectations

Return as a JSON array with this structure:
[
  {
    "name": "Short descriptive rule name",
    "content": "The actual rule in Insimul format",
    "ruleType": "social|cultural|legal|moral"
  }
]

IMPORTANT: The "content" field must be a complete Insimul rule following this exact syntax:

rule rule_name {
  when (
    Condition1(?var1) and
    Condition2(?var2)
  )
  then {
    effect_action(?var1)
    another_effect(?var2)
  }
  priority: 5
  tags: [social, generated]
}

Example for a social hierarchy rule:
rule respect_nobility {
  when (
    Character(?commoner) and
    Character(?noble) and
    has_status(?commoner, "commoner") and
    has_status(?noble, "nobility") and
    meets(?commoner, ?noble)
  )
  then {
    bow_to(?commoner, ?noble)
    increase_relationship(?noble, ?commoner, 5)
  }
  priority: 7
  tags: [social, hierarchy]
}

Make the rule names creative and fitting for the world's theme. Example for cyberpunk: "corporate_respect_protocol" or "neural_privacy_law"`;
          
          const genAI = new GoogleGenerativeAI(getGeminiApiKey()!);
          const model = genAI.getGenerativeModel({ 
            model: GEMINI_MODELS.PRO,
            generationConfig: {
              temperature: 0.9,
              responseMimeType: 'application/json',
            }
          });
          
          const result = await model.generateContent(rulesPrompt);
          const text = result.response.text().trim();
          const generatedRules = JSON.parse(text);
          
          // Parse and save rules
          if (Array.isArray(generatedRules)) {
            for (const rule of generatedRules.slice(0, 10)) {
              if (rule.name && rule.content) {
                await storage.createRule({
                  worldId,
                  name: rule.name,
                  content: rule.content,
                  sourceFormat: 'insimul',
                  ruleType: rule.ruleType || 'default',
                  priority: 5,
                  likelihood: 1.0,
                  tags: ['generated', 'ai'],
                  isActive: true,
                });
                numRules++;
              }
            }
          }
          console.log(`✅ Generated ${numRules} rules`);
          progressTracker.updateProgress(taskId, 'rules-complete', `Generated ${numRules} social rules`, 65);
        } catch (error) {
          console.warn('⚠️ Rule generation skipped:', (error as Error).message);
        }
      }

      // Step 4: Generate AI-powered actions
      if (isGeminiConfigured()) {
        console.log('⚔️ Step 4: Generating actions...');
        progressTracker.updateProgress(taskId, 'actions', 'Generating character actions...', 75);
        try {
          const { GoogleGenerativeAI } = await import("@google/generative-ai");
          const { getGeminiApiKey, GEMINI_MODELS } = await import("./config/gemini.js");
          
          const worldContext = customPrompt || 
            `A ${worldType || 'medieval-fantasy'} world named "${worldName}". ${worldDescription || ''}`;
          
          const actionsPrompt = `Generate 10 character actions for ${worldContext}.

Include diverse action types:
- Social interactions (talking, persuading, befriending)
- Physical actions (moving, working, fighting)
- Mental actions (thinking, planning, studying)
- Cultural actions specific to this world's theme

Return as a JSON array with this structure:
[
  {
    "name": "Creative action name fitting the world",
    "description": "What this action does and when it's used",
    "actionType": "social|combat|movement|mental|economic"
  }
]

Make the action names thematic and immersive. Example for cyberpunk: "Jack Into Matrix", "Corporate Negotiation", "Street Chase"`;
          
          const genAI = new GoogleGenerativeAI(getGeminiApiKey()!);
          const model = genAI.getGenerativeModel({ 
            model: GEMINI_MODELS.PRO,
            generationConfig: {
              temperature: 0.9,
              responseMimeType: 'application/json',
            }
          });
          
          const result = await model.generateContent(actionsPrompt);
          const text = result.response.text().trim();
          const generatedActions = JSON.parse(text);
          
          // Parse and save actions
          if (Array.isArray(generatedActions)) {
            for (const action of generatedActions.slice(0, 10)) {
              if (action.name && action.description) {
                const actionData: any = {
                  worldId,
                  name: action.name,
                  description: action.description,
                  actionType: action.actionType || 'social',
                  sourceFormat: 'prolog',
                  tags: ['generated', 'ai'],
                  isActive: true,
                };
                // Auto-generate Prolog content
                try {
                  const result = convertActionToProlog(actionData);
                  if (result.prologContent) actionData.content = result.prologContent;
                } catch (e) {
                  console.warn('[ActionProlog] Failed to convert generated action:', e);
                }
                await storage.createAction(actionData);
                numActions++;
              }
            }
          }
          console.log(`✅ Generated ${numActions} actions`);
          progressTracker.updateProgress(taskId, 'actions-complete', `Generated ${numActions} actions`, 85);
        } catch (error) {
          console.warn('⚠️ Action generation skipped:', (error as Error).message);
        }
      }
      
      // Step 5: Generate AI-powered quests
      if (isGeminiConfigured()) {
        console.log('🎯 Step 5: Generating quests...');
        progressTracker.updateProgress(taskId, 'quests', 'Generating quest storylines...', 92);
        try {
          const { generateQuests } = await import("./services/gemini-ai.js");

          const worldContext = customPrompt ||
            `A ${worldType || 'medieval-fantasy'} world named "${worldName}". ${worldDescription || ''}`;

          const generatedQuests = await generateQuests(worldContext, 8);

          for (const quest of generatedQuests) {
            const questData: any = {
              worldId,
              title: quest.title,
              description: quest.description,
              questType: quest.questType,
              difficulty: quest.difficulty,
              targetLanguage: worldTargetLanguage || 'English',
              assignedTo: 'Player',
              status: 'active',
              objectives: quest.objectives,
              rewards: quest.rewards || {},
              tags: ['generated', 'ai'],
            };
            // Auto-generate Prolog content
            try {
              const result = convertQuestToProlog(questData);
              if (result.prologContent) questData.content = result.prologContent;
            } catch (e) {
              console.warn('[QuestProlog] Failed to convert generated quest:', e);
            }
            await storage.createQuest(questData);
            numQuests++;
          }
          console.log(`✅ Generated ${numQuests} quests`);
          progressTracker.updateProgress(taskId, 'quests-complete', `Generated ${numQuests} quests`, 95);
        } catch (error) {
          console.warn('⚠️ Quest generation skipped:', (error as Error).message);
        }
      }

      // Step 6: Generate world-specific items
      if (isGeminiConfigured()) {
        console.log('🎒 Step 6: Generating world items...');
        progressTracker.updateProgress(taskId, 'items', 'Generating world-specific items...', 96);
        try {
          const { GoogleGenerativeAI } = await import("@google/generative-ai");
          const { getGeminiApiKey, GEMINI_MODELS } = await import("./config/gemini.js");

          const worldContext = customPrompt ||
            `A ${worldType || 'medieval-fantasy'} world named "${worldName}". ${worldDescription || ''}`;

          const itemsPrompt = `Generate 15-20 items unique to this game world: ${worldContext}.

These should be world-specific items that would NOT exist in a generic base item list.
Include a mix of:
- Themed weapons or tools specific to this world's culture/technology
- Local food, drink, or consumables with regional flavor
- Cultural artifacts, collectibles, or quest-worthy objects
- Crafting materials unique to this world's environment
- Key/quest items that hint at world lore

For each item, provide ALL of these fields:
[
  {
    "name": "Unique item name fitting the world",
    "description": "Flavorful 1-2 sentence description",
    "itemType": "weapon|armor|consumable|food|drink|tool|material|collectible|key|quest",
    "icon": "single emoji",
    "value": 0-100,
    "sellValue": 0-60,
    "weight": 0.1-10,
    "category": "melee_weapon|ranged_weapon|light_armor|heavy_armor|shield|potion|ingredient|raw_material|refined_material|ore|tool|container|light_source|food|drink|document|treasure|jewelry|explosive|medical|currency|collectible|key|ammunition|fuel|gemstone|furniture|stimulant|data|component|survival|utility",
    "material": "iron|steel|wood|leather|stone|cloth|bone|glass|gold|silver|copper|composite|fiber|paper|clay|null",
    "baseType": "the generic archetype this item belongs to (sword, bow, potion, herb, ore, book, etc.)",
    "rarity": "common|uncommon|rare|epic|legendary",
    "effects": {"health": 0, "energy": 0, "attackPower": 0} or null,
    "lootWeight": 0-50,
    "tags": ["tag1", "tag2"]
  }
]

IMPORTANT: Return ONLY the JSON array, no markdown.`;

          const genAI = new GoogleGenerativeAI(getGeminiApiKey()!);
          const model = genAI.getGenerativeModel({
            model: GEMINI_MODELS.PRO,
            generationConfig: {
              temperature: 0.9,
              responseMimeType: 'application/json',
            }
          });

          const result = await model.generateContent(itemsPrompt);
          const text = result.response.text().trim();
          const generatedItems = JSON.parse(text);

          if (Array.isArray(generatedItems)) {
            for (const item of generatedItems.slice(0, 20)) {
              if (item.name && item.itemType) {
                await storage.createItem({
                  worldId,
                  name: item.name,
                  description: item.description || '',
                  itemType: item.itemType,
                  icon: item.icon || '',
                  value: item.value ?? 0,
                  sellValue: item.sellValue ?? 0,
                  weight: item.weight ?? 1,
                  tradeable: item.tradeable !== false,
                  stackable: item.stackable !== false,
                  maxStack: item.maxStack ?? (item.stackable === false ? 1 : 20),
                  category: item.category || null,
                  material: item.material || null,
                  baseType: item.baseType || null,
                  rarity: item.rarity || 'common',
                  effects: item.effects || null,
                  lootWeight: item.lootWeight ?? 0,
                  tags: Array.isArray(item.tags) ? [...item.tags, 'generated', 'ai'] : ['generated', 'ai'],
                  worldType: worldType || null,
                });
                numItems++;
              }
            }
          }
          console.log(`✅ Generated ${numItems} world items`);
          progressTracker.updateProgress(taskId, 'items-complete', `Generated ${numItems} world items`, 97);
        } catch (error) {
          console.warn('⚠️ Item generation skipped:', (error as Error).message);
        }
      }

      // Step 7: Setup grammars (generate for custom world types, use seeded for preset types)
      if (customLabel && customPrompt && isGeminiConfigured()) {
        // Custom world type: Generate custom grammars with LLM
        console.log(`📝 Step 7: Generating custom grammars for "${customLabel}"...`);
        progressTracker.updateProgress(taskId, 'grammars', 'Generating custom procedural grammars...', 98);
        try {
          const { grammarGenerator } = await import("./services/grammar-generator.js");

          const generatedGrammars = await grammarGenerator.generateCustomGrammars(
            customLabel,
            customPrompt,
            worldTargetLanguage || undefined
          );

          // Save each grammar to the database with worldId
          for (const grammar of generatedGrammars) {
            await storage.createGrammar({
              worldId,
              name: grammar.name,
              description: grammar.description,
              grammar: grammar.grammar,
              tags: grammar.tags,
              worldType: customLabel,
              gameType: gameType,
              isActive: true,
            });
            numGrammars++;
          }

          console.log(`✅ Generated ${numGrammars} custom grammars for ${customLabel}`);
          progressTracker.updateProgress(taskId, 'grammars-complete', `Generated ${numGrammars} custom grammars`, 99);
        } catch (error) {
          console.warn('⚠️ Custom grammar generation failed:', (error as Error).message);
        }
      } else if (worldType) {
        // Preset world type: Seed static grammars from seed-grammars.ts
        console.log(`📝 Step 7: Seeding static grammars for ${worldType}...`);
        progressTracker.updateProgress(taskId, 'grammars', `Seeding pre-generated grammars for ${worldType}`, 98);

        try {
          // Filter grammars by worldType
          const worldTypeGrammars = seedGrammars.filter((g: any) =>
            g.worldType === worldType || (g.tags && g.tags.includes(worldType))
          );

          // For language-learning worlds with a target language and Gemini available,
          // generate language-appropriate name grammars instead of using generic English ones
          const nameGrammarTags = ['names', 'character', 'settlement', 'location', 'business', 'establishment'];
          const isNameGrammar = (g: any) => g.tags?.some((t: string) => nameGrammarTags.includes(t)) || g.name?.includes('_names');
          let nonNameGrammars = worldTypeGrammars;
          let generatedLangNames = false;

          if (worldTargetLanguage && isGeminiConfigured()) {
            nonNameGrammars = worldTypeGrammars.filter((g: any) => !isNameGrammar(g));
            const nameGrammarsCount = worldTypeGrammars.length - nonNameGrammars.length;
            if (nameGrammarsCount > 0) {
              console.log(`  🗣️ Generating ${worldTargetLanguage}-appropriate name grammars via LLM (replacing ${nameGrammarsCount} generic ones)...`);
              try {
                const { grammarGenerator } = await import("./services/grammar-generator.js");
                const langGrammars = await grammarGenerator.generateCustomGrammars(
                  worldType,
                  `A ${worldType} world set in a ${worldTargetLanguage}-speaking region.`,
                  worldTargetLanguage
                );
                for (const grammar of langGrammars) {
                  await storage.createGrammar({
                    worldId,
                    name: grammar.name,
                    description: grammar.description,
                    grammar: grammar.grammar,
                    tags: grammar.tags,
                    worldType,
                    gameType,
                    isActive: true,
                  });
                  numGrammars++;
                }
                generatedLangNames = true;
                console.log(`  ✅ Generated ${langGrammars.length} ${worldTargetLanguage}-specific name grammars`);
              } catch (error) {
                console.warn(`  ⚠️ Language-specific name generation failed, falling back to static:`, (error as Error).message);
                nonNameGrammars = worldTypeGrammars; // Fall back to all static grammars
              }
            }
          }

          console.log(`  Found ${nonNameGrammars.length} ${generatedLangNames ? 'non-name ' : ''}grammars for ${worldType}`);

          // Insert each grammar into the database
          for (const grammar of nonNameGrammars) {
            await storage.createGrammar({
              worldId,
              name: grammar.name,
              description: grammar.description,
              grammar: grammar.grammar,
              tags: grammar.tags || [],
              worldType: grammar.worldType || worldType,
              gameType: gameType,
              isActive: grammar.isActive !== false,
            });
            numGrammars++;
          }

          console.log(`✅ Seeded ${numGrammars} grammars for ${worldType}${generatedLangNames ? ` (with ${worldTargetLanguage} names)` : ''}`);
          progressTracker.updateProgress(taskId, 'grammars-complete', `Seeded ${numGrammars} grammars`, 99);
        } catch (error) {
          console.warn('⚠️ Grammar seeding failed:', (error as Error).message);
        }
      } else {
        console.log('📝 Step 7: No specific grammars configured');
        progressTracker.updateProgress(taskId, 'grammars', 'Using default grammars', 99);
      }

      // Step 8: Auto-generate Prolog content for actions/quests that lack it
      try {
        const [worldActions, worldQuests] = await Promise.all([
          storage.getActionsByWorld(worldId),
          storage.getQuestsByWorld(worldId),
        ]);
        let prologConverted = 0;
        for (const action of worldActions) {
          if (!action.content) {
            try {
              const r = convertActionToProlog(action as any);
              if (r.prologContent) {
                await storage.updateAction(action.id, { content: r.prologContent });
                prologConverted++;
              }
            } catch {}
          }
        }
        for (const quest of worldQuests) {
          if (!quest.content) {
            try {
              const r = convertQuestToProlog(quest as any);
              if (r.prologContent) {
                await storage.updateQuest(quest.id, { content: r.prologContent });
                prologConverted++;
              }
            } catch {}
          }
        }
        if (prologConverted > 0) console.log(`🔮 Auto-generated Prolog content for ${prologConverted} entities`);
      } catch (e) {
        console.warn('[PrologAutoConvert] Failed:', e);
      }

      console.log(`🎉 Complete world generation finished!`);

          progressTracker.completeTask(taskId, `World generated! ${totalPopulation} characters, ${numRules} rules, ${numActions} actions, ${numQuests} quests, ${numItems} items, ${numGrammars} grammars`);
        } catch (error) {
          console.error("Complete world generation error:", error);
          progressTracker.failTask(taskId, error instanceof Error ? error.message : 'Unknown error');
        }
      })();
    } catch (error) {
      console.error("Failed to start world generation:", error);
      res.status(500).json({ error: "Failed to start world generation" });
    }
  });

  // World-centric Simulations routes
  app.get("/api/worlds/:worldId/simulations", async (req, res) => {
    try {
      const simulations = await storage.getSimulationsByWorld(req.params.worldId);
      res.json(simulations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch simulations" });
    }
  });

  app.post("/api/worlds/:worldId/simulations", async (req, res) => {
    try {
      const { worldId } = req.params;

      // Check permissions - creating simulations requires edit access
      const token = req.headers.authorization?.split(' ')[1];
      const payload = token ? AuthService.verifyToken(token) : null;

      if (!(await canEditWorld(payload?.userId, worldId))) {
        return res.status(403).json({ error: "You don't have permission to create simulations in this world" });
      }

      // Ensure worldId is included in the data
      const simulationData = { ...req.body, worldId };
      const validatedData = insertSimulationSchema.parse(simulationData);
      const simulation = await storage.createSimulation(validatedData);
      res.status(201).json(simulation);
    } catch (error) {
      console.error("Failed to create simulation:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid simulation data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create simulation" });
    }
  });

  app.post("/api/simulations", async (req, res) => {
    try {
      const validatedData = insertSimulationSchema.parse(req.body);
      const simulation = await storage.createSimulation(validatedData);
      res.status(201).json(simulation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid simulation data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create simulation" });
    }
  });

  // Insimul Engine API
  app.post("/api/simulations/:id/run", async (req, res) => {
    try {
      const simulation = await storage.getSimulation(req.params.id);
      if (!simulation) {
        return res.status(404).json({ error: "Simulation not found" });
      }
      
      // Parse simulation parameters from request body
      const config = req.body || {};
      const {
        sourceFormats = ["insimul"],
        maxRules = 12,
        maxEvents = 8,
        maxCharacters = 6,
        timeRange = { start: 0, end: 100, step: 1 },
        contentFocus = "all", // all, politics, romance, conflict, trade, magic
        executionSpeed = "normal", // fast, normal, detailed
        executionEngine = "default", // default, prolog
        worldId
      } = config;
      
      // Use worldId from config or fallback to simulation's worldId
      const targetWorldId = worldId || simulation.worldId;
      if (!targetWorldId) {
        return res.status(400).json({ error: "World ID is required" });
      }
      
      // Update simulation with new configuration
      await storage.updateSimulation(req.params.id, { 
        status: "running",
        config: {
          sourceFormats,
          maxRules,
          maxEvents, 
          maxCharacters,
          timeRange,
          contentFocus,
          executionSpeed,
          executionEngine
        },
        worldId: targetWorldId
      });
      
      // Choose execution method based on engine type
      let results;
      let executionTimeMs = 0;
      const startTime = Date.now();
      
      if (executionEngine === "prolog") {
        // Use SWI Prolog engine - wrap in comprehensive try/catch
        try {
          const { InsimulSimulationEngine } = await import("./engines/unified-engine.js");
          const engine = new InsimulSimulationEngine(storage);

          // Get world and characters for simulation
          const world = await storage.getWorld(targetWorldId);
          const characters = await storage.getCharactersByWorld(targetWorldId);
          const rules = await storage.getRulesByWorld(targetWorldId);

          console.log(`Prolog simulation data check:`, {
            worldExists: !!world,
            targetWorldId,
            charactersCount: characters.length,
            rulesCount: rules.length,
            worldName: world?.name
          });

          if (world && characters.length > 0 && rules.length > 0) {
            // Load rules and grammars
            await engine.loadRules(targetWorldId);
            await engine.loadGrammars(targetWorldId);
            await engine.initializeContext(targetWorldId, simulation.id);

            // Execute simulation with Prolog engine
            const stepResults = await engine.executeStep(targetWorldId, simulation.id);
            executionTimeMs = Date.now() - startTime;
            
            results = {
              executionTime: executionTimeMs,
              rulesExecuted: rules.length,
              eventsGenerated: stepResults.events.length,
              charactersAffected: Math.min(characters.length, maxCharacters),
              narrative: stepResults.narratives.length > 0 ? stepResults.narratives.join('\n') : 'Prolog simulation completed.',
              // Add detailed results
              rulesExecutedList: rules.map((r: any) => r.name),
              eventsGeneratedList: stepResults.events.map((e: any) => e.type || 'Unknown event'),
              charactersAffectedList: characters.slice(0, maxCharacters).map((c: any) => c.firstName)
            };
          } else {
            // Provide meaningful fallback when data is insufficient
            executionTimeMs = Date.now() - startTime;
            results = {
              executionTime: executionTimeMs,
              rulesExecuted: rules?.length || 0,
              eventsGenerated: 0,
              charactersAffected: characters?.length || 0,
              narrative: `Insufficient data for Prolog simulation - World: ${world ? 'exists' : 'missing'}, Characters: ${characters.length}, Rules: ${rules.length}. Using default execution instead.`,
              rulesExecutedList: rules?.map((r: any) => r.name) || ['No rules available'],
              eventsGeneratedList: ['Fallback execution completed'],
              charactersAffectedList: (characters || []).map((c: any) => c.firstName || 'Unknown')
            };
          }
        } catch (error) {
          console.error('Prolog execution error:', error);
          // Fallback to default execution with guaranteed numeric values
          const characters = await storage.getCharactersByWorld(targetWorldId);
          const rules = await storage.getRulesByWorld(targetWorldId);
          executionTimeMs = Math.max(1, Date.now() - startTime); // Ensure positive number
          results = {
            executionTime: executionTimeMs,
            rulesExecuted: rules?.length || 0,
            eventsGenerated: 0,
            charactersAffected: Math.min(characters?.length || 0, maxCharacters),
            narrative: `Prolog execution failed: ${error instanceof Error ? error.message : 'Unknown error'}. Using default execution instead.`,
            rulesExecutedList: rules?.map((r: any) => r.name) || ['No rules available'],
            eventsGeneratedList: ['Prolog fallback executed'],
            charactersAffectedList: (characters || []).slice(0, maxCharacters).map((c: any) => c.firstName || 'Unknown')
          };
        }
      } else {
        // Default execution using unified engine
        try {
          const { InsimulSimulationEngine } = await import("./engines/unified-engine.js");
          const engine = new InsimulSimulationEngine(storage);

          // Get world and characters for simulation
          const world = await storage.getWorld(targetWorldId);
          const characters = await storage.getCharactersByWorld(targetWorldId);
          const rules = await storage.getRulesByWorld(targetWorldId);

          if (world && rules.length > 0) {
            // Load rules and grammars
            await engine.loadRules(targetWorldId);
            await engine.loadGrammars(targetWorldId);
            await engine.initializeContext(targetWorldId, simulation.id);

            // Execute simulation with default engine
            const stepResults = await engine.executeStep(targetWorldId, simulation.id);
            executionTimeMs = Date.now() - startTime;

            // Convert Map to plain object for JSON serialization
            const characterSnapshotsObj: any = {};
            if (stepResults.characterSnapshots) {
              stepResults.characterSnapshots.forEach((timestepMap, timestep) => {
                characterSnapshotsObj[timestep] = {};
                timestepMap.forEach((snapshot, charId) => {
                  characterSnapshotsObj[timestep][charId] = snapshot;
                });
              });
            }

            results = {
              executionTime: executionTimeMs,
              rulesExecuted: stepResults.rulesExecuted.length,
              eventsGenerated: stepResults.events.length,
              charactersAffected: Math.min(characters.length, maxCharacters),
              narrative: stepResults.narratives.length > 0 ? stepResults.narratives.join('\n\n') : 'Simulation completed with no narrative output.',
              truthsCreated: stepResults.truthsCreated || [],
              ruleExecutionSequence: stepResults.ruleExecutionSequence || [],
              characterSnapshots: characterSnapshotsObj,
              rulesExecutedList: stepResults.rulesExecuted,
              eventsGeneratedList: stepResults.events.map((e: any) => e.description || e.type || 'Unknown event'),
              charactersAffectedList: characters.slice(0, maxCharacters).map((c: any) => c.firstName)
            };
          } else {
            // Fallback to mock execution if no rules
            const processingTime = executionSpeed === "fast" ? 500 :
              executionSpeed === "detailed" ? 2000 : 1000;
            await new Promise(resolve => setTimeout(resolve, processingTime));

            executionTimeMs = Date.now() - startTime;

            const rulesExecutedCount = 0;
            const eventsGeneratedCount = 1;
            const charactersAffectedCount = Math.min(characters?.length || 0, maxCharacters);
            const narrative = characters && characters.length > 0 ? generateNarrative(characters) : 'No characters available for simulation.';

            // Generate detailed results using actual data from the world
            const detailedResults = await generateDetailedResults(
              targetWorldId,
              rulesExecutedCount,
              eventsGeneratedCount,
              charactersAffectedCount
            );

            results = {
              executionTime: executionTimeMs,
              rulesExecuted: rulesExecutedCount,
              eventsGenerated: eventsGeneratedCount,
              charactersAffected: charactersAffectedCount,
              narrative: narrative,
              rulesExecutedList: detailedResults.rulesExecuted,
              eventsGeneratedList: detailedResults.eventsGenerated,
              charactersAffectedList: detailedResults.charactersAffected
            };
          }
        } catch (error) {
          console.error('Default execution error:', error);
          // Fallback to simple mock execution
          const processingTime = executionSpeed === "fast" ? 500 :
            executionSpeed === "detailed" ? 2000 : 1000;
          await new Promise(resolve => setTimeout(resolve, processingTime));

          executionTimeMs = Date.now() - startTime;
          const characters = await storage.getCharactersByWorld(targetWorldId);

          results = {
            executionTime: executionTimeMs,
            rulesExecuted: 0,
            eventsGenerated: 1,
            charactersAffected: Math.min(characters?.length || 0, maxCharacters),
            narrative: `Default execution failed: ${error instanceof Error ? error.message : 'Unknown error'}. Fallback completed.`,
            rulesExecutedList: ['Execution error fallback'],
            eventsGeneratedList: ['Error during execution'],
            charactersAffectedList: (characters || []).slice(0, maxCharacters).map((c: any) => c.firstName || 'Unknown')
          };
        }
      }
      
      // Update simulation with results and completed status
      const updatedSimulation = await storage.updateSimulation(req.params.id, {
        status: "completed",
        results: results,
        executionTime: executionTimeMs,
        rulesExecuted: results.rulesExecuted || 0,
        eventsGenerated: results.eventsGenerated || 0,
        narrativeOutput: [results.narrative || 'Simulation completed.']
      });
      
      res.json({ 
        message: "Simulation completed successfully", 
        status: "completed",
        simulationId: simulation.id,
        results: results
      });
    } catch (error) {
      // Update status to failed if there's an error
      await storage.updateSimulation(req.params.id, { status: "failed" });
      res.status(500).json({ error: "Failed to run simulation" });
    }
  });

  app.put("/api/simulations/:id", async (req, res) => {
    try {
      const validatedData = insertSimulationSchema.partial().parse(req.body);
      const simulation = await storage.updateSimulation(req.params.id, validatedData);
      if (!simulation) {
        return res.status(404).json({ error: "Simulation not found" });
      }
      res.json(simulation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid simulation data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update simulation" });
    }
  });

  // Rule validation and testing
  app.post("/api/rules/validate", async (req, res) => {
    try {
      const { content, sourceFormat } = req.body;
      
      // Basic syntax validation based on system type
      const validation: {
        isValid: boolean;
        errors: string[];
        warnings: string[];
        suggestions: string[];
      } = {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: []
      };

      if (!content || content.trim() === '') {
        validation.isValid = false;
        validation.errors.push("Rule content cannot be empty");
        return res.json(validation);
      }

      if (sourceFormat === "insimul") {
        // Insimul syntax validation
        if (!content.includes("rule ")) {
          validation.isValid = false;
          validation.errors.push("Insimul rules must start with 'rule' keyword");
        }
        if (!content.includes("when (")) {
          validation.isValid = false;
          validation.errors.push("Insimul rules must have a 'when' clause");
        }
        if (!content.includes("then {")) {
          validation.isValid = false;
          validation.errors.push("Insimul rules must have a 'then' clause");
        }
        // Check for balanced braces
        const openBraces = (content.match(/{/g) || []).length;
        const closeBraces = (content.match(/}/g) || []).length;
        if (openBraces !== closeBraces) {
          validation.isValid = false;
          validation.errors.push(`Unbalanced braces: ${openBraces} opening, ${closeBraces} closing`);
        }
        // Check for balanced parentheses
        const openParens = (content.match(/\(/g) || []).length;
        const closeParens = (content.match(/\)/g) || []).length;
        if (openParens !== closeParens) {
          validation.isValid = false;
          validation.errors.push(`Unbalanced parentheses: ${openParens} opening, ${closeParens} closing`);
        }
        if (!content.includes("priority:") && !content.includes("priority :")) {
          validation.warnings.push("Consider adding a priority value for rule ordering");
        }
      } else if (sourceFormat === "ensemble") {
        // Ensemble syntax validation
        if (!content.includes("rule ")) {
          validation.isValid = false;
          validation.errors.push("Ensemble rules must contain 'rule' keyword");
        }
        if (!content.includes("when (")) {
          validation.isValid = false;
          validation.errors.push("Ensemble rules must have a 'when' clause with conditions");
        }
        if (!content.includes("then {")) {
          validation.isValid = false;
          validation.errors.push("Ensemble rules must have a 'then' clause with effects");
        }
        // Check for Person predicate pattern
        if (!content.match(/Person\(\?[\w]+\)/)) {
          validation.warnings.push("Ensemble rules typically use Person(?variable) pattern");
        }
      } else if (sourceFormat === "kismet") {
        // Kismet syntax validation (Prolog-based)
        if (!content.includes("trait ") && !content.includes(":-")) {
          validation.warnings.push("Kismet rules typically define traits or use Prolog syntax (:-) for predicates");
        }
        if (!content.includes(".")) {
          validation.isValid = false;
          validation.errors.push("Kismet rules must end with a period");
        }
        if (content.includes("trait ") && !content.includes("likelihood:")) {
          validation.warnings.push("Kismet traits should specify a likelihood value");
        }
        // Check for common Kismet patterns
        if (content.includes("+++") || content.includes("---")) {
          validation.suggestions.push("Good use of Kismet relationship modifiers (+++ or ---)");
        }
      } else if (sourceFormat === "tott") {
        // Talk of the Town syntax validation
        if (!content.includes("rule ") && !content.includes("def ")) {
          validation.warnings.push("TotT rules typically use 'rule' or 'def' keywords");
        }
        if (content.includes("genealogy") || content.includes("family")) {
          validation.suggestions.push("Good use of TotT genealogy features");
        }
      }

      res.json(validation);
    } catch (error) {
      console.error("Validation error:", error);
      res.status(500).json({ error: "Failed to validate rule" });
    }
  });

  app.post("/api/simulations/:id/run", async (req, res) => {
    try {
      const simulation = await storage.getSimulation(req.params.id);
      if (!simulation) {
        return res.status(404).json({ error: "Simulation not found" });
      }

      // Update simulation status to running
      await storage.updateSimulation(req.params.id, { status: "running" });

      // Simulate processing time
      setTimeout(async () => {
        const results = {
          executionTime: Math.random() * 1000 + 500,
          rulesExecuted: Math.floor(Math.random() * 50) + 10,
          eventsGenerated: Math.floor(Math.random() * 20) + 5,
          charactersAffected: Math.floor(Math.random() * 15) + 3,
          narrative: "Lord Edmund Blackwater has passed away at the age of 67. His eldest son, Sir Richard Blackwater, will be crowned as the new Duke of Riverlands in a ceremony next month."
        };

        await storage.updateSimulation(req.params.id, { 
          status: "completed",
          results 
        });
      }, 2000);

      res.json({ message: "Simulation started", status: "running" });
    } catch (error) {
      res.status(500).json({ error: "Failed to run simulation" });
    }
  });

  // ============================================================
  // TTS/STT Endpoints (migrated from Python server.py)
  // ============================================================

  app.post("/api/tts", async (req, res) => {
    try {
      const { textToSpeech } = await import("./services/tts-stt.js");
      const { transcript, text, voice = "Kore", gender = "neutral", encoding = "MP3" } = req.body;
      const textToConvert = transcript || text;

      console.log("TTS request received:", { text: textToConvert?.substring(0, 50), voice, gender, encoding, bodyKeys: Object.keys(req.body) });

      if (!textToConvert || textToConvert.trim() === '') {
        console.error("TTS error: No text provided. Body:", req.body);
        return res.status(400).json({ error: "No text provided" });
      }

      const audioBuffer = await textToSpeech(textToConvert, voice, gender, encoding);

      // Set appropriate content type based on encoding
      const contentType = encoding === "WAV" ? 'audio/wav' : 'audio/mpeg';
      res.setHeader('Content-Type', contentType);
      res.send(audioBuffer);
    } catch (error) {
      console.error("TTS error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to generate speech" });
    }
  });

  // Setup multer for file uploads
  const multer = (await import("multer")).default;
  const upload = multer({ storage: multer.memoryStorage() });

  app.post("/api/stt", upload.single('audio'), async (req, res) => {
    try {
      const { speechToText } = await import("./services/tts-stt.js");

      let audioBuffer: Buffer;
      let mimeType = 'audio/wav';

      // Handle file upload
      if (req.file) {
        audioBuffer = req.file.buffer;
        mimeType = req.file.mimetype;
      }
      // Handle JSON with base64 audio
      else if (req.body.audio) {
        const { audio, mimeType: bodyMimeType = 'audio/wav' } = req.body;
        audioBuffer = Buffer.from(audio, 'base64');
        mimeType = bodyMimeType;
      } else {
        return res.status(400).json({ error: "No audio data provided" });
      }

      const transcript = await speechToText(audioBuffer, mimeType);

      res.json({ transcript });
    } catch (error) {
      console.error("STT error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to transcribe audio" });
    }
  });

  // Gemini Chat Endpoint
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const {
        systemPrompt,
        messages,
        temperature = 0.7,
        maxTokens = 1000,
        audioInput, // Base64 encoded audio
        returnAudio = false, // Whether to return audio response
        voice = 'Kore',
        stream = false, // Whether to stream response
        worldId, // Optional: for Prolog-first routing
        npcId, // Optional: NPC being spoken to
        playerId // Optional: player character ID
      } = req.body;

      // Try Prolog-first routing for simple queries (reduces Gemini API calls)
      if (worldId && !audioInput && messages?.length > 0) {
        const lastMsg = messages[messages.length - 1];
        const userText = (lastMsg?.parts?.[0]?.text || '').toLowerCase().trim();
        if (userText) {
          try {
            const { prologLLMRouter } = await import('./services/prolog-llm-router.js');
            let queryType: string | null = null;
            const greetings = ['hello', 'hi', 'hey', 'greetings', 'good day', 'good morning', 'good evening', 'howdy'];
            const farewells = ['bye', 'goodbye', 'farewell', 'see you', 'later', 'take care', 'good night'];
            const trade = ['buy', 'sell', 'trade', 'wares', 'shop', 'purchase', 'merchandise', 'goods'];

            if (greetings.some(g => userText.startsWith(g) || userText === g)) queryType = 'greeting';
            else if (farewells.some(f => userText.startsWith(f) || userText === f)) queryType = 'farewell';
            else if (trade.some(t => userText.includes(t))) queryType = 'trade_offer';

            if (queryType) {
              const prologResult = await prologLLMRouter.tryPrologFirst(worldId, queryType, {
                speakerId: npcId,
                listenerId: playerId || 'player',
              });
              if (prologResult.answered && prologResult.confidence >= 0.6) {
                console.log(`[PrologLLMRouter] Handled "${queryType}" without Gemini (confidence: ${prologResult.confidence})`);
                const responseData: any = { response: prologResult.answer, source: prologResult.source };
                if (returnAudio) {
                  try {
                    const { textToSpeech } = await import("./services/tts-stt.js");
                    const audioBuffer = await textToSpeech(prologResult.answer!, voice);
                    if (audioBuffer) {
                      responseData.audio = `data:audio/mp3;base64,${audioBuffer.toString('base64')}`;
                    }
                  } catch { /* audio generation optional */ }
                }
                return res.json(responseData);
              }
            }
          } catch (e) {
            // Prolog routing failed, fall through to Gemini
            console.warn('[PrologLLMRouter] Error in chat routing:', e);
          }
        }
      }

      if (!isGeminiConfigured()) {
        return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
      }

      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const { getGeminiApiKey } = await import('./config/gemini.js');

      const genAI = new GoogleGenerativeAI(getGeminiApiKey()!);
      
      // Use a model that supports audio if audio input is provided
      const model = genAI.getGenerativeModel({
        model: audioInput ? "gemini-2.5-pro" : GEMINI_MODELS.PRO,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        }
      });

      let userTranscript: string | undefined;
      let lastMessageContent: any;

      // Handle audio input
      if (audioInput) {
        // Import speech-to-text
        const { speechToText } = await import("./services/tts-stt.js");
        
        // Decode base64 audio
        const base64Data = audioInput.includes(',') ? audioInput.split(',')[1] : audioInput;
        const audioBuffer = Buffer.from(base64Data, 'base64');
        
        // Get transcript
        userTranscript = await speechToText(audioBuffer, 'audio/webm');
        lastMessageContent = { text: userTranscript };
      } else {
        // Use text from the last message
        const lastMessage = messages[messages.length - 1];
        lastMessageContent = lastMessage.parts[0];
      }

      // Build the conversation with system prompt
      const chat = model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }]
          },
          {
            role: 'model',
            parts: [{ text: 'I understand. I will roleplay as this character.' }]
          },
          ...messages.slice(0, -1) // All messages except the last one
        ]
      });

      // Send the message
      console.log("Sending to Gemini:", lastMessageContent.text?.substring(0, 100) || "[Audio message]");
      
      const result = await chat.sendMessage(lastMessageContent.text);
      
      // Log the full response for debugging
      console.log("Gemini response object:", JSON.stringify(result.response, null, 2));
      
      const response = result.response.text();
      
      if (!response || response.trim() === '') {
        console.error("Gemini returned empty response. Candidates:", result.response.candidates);
        console.error("Prompt feedback:", result.response.promptFeedback);
        return res.status(500).json({ 
          error: "Gemini returned empty response. This may be due to safety filters.",
          details: {
            promptFeedback: result.response.promptFeedback,
            candidates: result.response.candidates
          }
        });
      }

      console.log("Gemini response:", response.substring(0, 100));

      // Prepare response object
      const responseData: any = { response };

      // Add user transcript if we had audio input
      if (userTranscript) {
        responseData.userTranscript = userTranscript;
      }

      // Generate audio if requested
      if (returnAudio) {
        try {
          const { textToSpeech } = await import("./services/tts-stt.js");
          const gender = voice === 'Kore' ? 'female' : 'male';
          const audioBuffer = await textToSpeech(response, voice, gender, "MP3");
          // Convert to base64 for JSON response
          responseData.audio = audioBuffer.toString('base64');
        } catch (audioError) {
          console.error("Failed to generate audio:", audioError);
          // Continue without audio
        }
      }

      res.json(responseData);
    } catch (error) {
      console.error("Gemini chat error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to get chat response" });
    }
  });

  app.get("/api/tts/get_available_voices", async (req, res) => {
    try {
      const { getAvailableVoices } = await import("./services/tts-stt.js");
      const voices = getAvailableVoices();
      res.json(voices);
    } catch (error) {
      res.status(500).json({ error: "Failed to get available voices" });
    }
  });

  // ============================================================
  // Character Interaction Endpoints (migrated from Python server.py)
  // ============================================================

  app.post("/api/character/getResponse", async (req, res) => {
    try {
      const { getCharacterResponse } = await import("./services/character-interaction.js");
      const { userQuery, charID } = req.body;

      if (!userQuery || !charID) {
        return res.status(400).json({ error: "Missing userQuery or charID" });
      }

      const result = await getCharacterResponse(userQuery, charID);
      res.json(result);
    } catch (error) {
      console.error("Character response error:", error);
      res.status(500).json({ error: "Failed to get character response" });
    }
  });

  app.post("/api/character/create", async (req, res) => {
    try {
      const validatedData = insertCharacterSchema.parse(req.body);
      const character = await storage.createCharacter(validatedData);
      res.json({ charID: character.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid character data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create character" });
    }
  });

  app.post("/api/character/update", async (req, res) => {
    try {
      const { id, ...updateData } = req.body;
      if (!id) {
        return res.status(400).json({ error: "Missing character ID" });
      }

      const validatedData = insertCharacterSchema.partial().parse(updateData);
      await storage.updateCharacter(id, validatedData);
      res.json({ STATUS: "SUCCESS" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid character data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update character" });
    }
  });

  app.post("/api/character/get", async (req, res) => {
    try {
      const { charID } = req.body;
      if (!charID) {
        return res.status(400).json({ error: "Missing charID" });
      }

      const character = await storage.getCharacter(charID);
      if (!character) {
        return res.status(404).json({ error: "Character not found" });
      }

      res.json({
        charID: character.id,
        name: `${character.firstName} ${character.lastName || ''}`.trim(),
        ...character
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get character" });
    }
  });

  app.post("/api/character/list", async (req, res) => {
    try {
      const { worldId } = req.body;

      if (worldId) {
        const characters = await storage.getCharactersByWorld(worldId);
        res.json(characters.map(c => ({
          charID: c.id,
          name: `${c.firstName} ${c.lastName || ''}`.trim()
        })));
      } else {
        // Return all characters across all worlds
        const worlds = await storage.getWorlds();
        const allCharacters = [];
        for (const world of worlds) {
          const chars = await storage.getCharactersByWorld(world.id);
          allCharacters.push(...chars);
        }
        res.json(allCharacters.map(c => ({
          charID: c.id,
          name: `${c.firstName} ${c.lastName || ''}`.trim()
        })));
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to list characters" });
    }
  });

  app.post("/api/character/getActions", async (req, res) => {
    try {
      const { getCharacterActions } = await import("./services/character-interaction.js");
      const { charID } = req.body;

      if (!charID) {
        return res.status(400).json({ error: "Missing charID" });
      }

      const actions = await getCharacterActions(charID);
      res.json({ actions });
    } catch (error) {
      res.status(500).json({ error: "Failed to get character actions" });
    }
  });

  app.post("/api/character/getActionResponse", async (req, res) => {
    try {
      const { getActionResponse } = await import("./services/character-interaction.js");
      const { charID, action, context } = req.body;

      if (!charID || !action) {
        return res.status(400).json({ error: "Missing charID or action" });
      }

      const actionResponse = await getActionResponse(charID, action, context);
      res.json({ actionResponse });
    } catch (error) {
      res.status(500).json({ error: "Failed to get action response" });
    }
  });

  app.post("/api/character/narrative/list-sections", async (req, res) => {
    try {
      const { listNarrativeSections } = await import("./services/character-interaction.js");
      const sections = listNarrativeSections();
      res.json(sections);
    } catch (error) {
      res.status(500).json({ error: "Failed to list narrative sections" });
    }
  });

  app.post("/api/character/narrative/list-triggers", async (req, res) => {
    try {
      const { listNarrativeTriggers } = await import("./services/character-interaction.js");
      const triggers = listNarrativeTriggers();
      res.json(triggers);
    } catch (error) {
      res.status(500).json({ error: "Failed to list narrative triggers" });
    }
  });

  // ============================================================
  // Experience Endpoints (migrated from Python server.py)
  // ============================================================

  app.post("/api/xp/experiences/update", async (req, res) => {
    try {
      // This would integrate with your experience/session tracking system
      // For now, return a success status
      res.json({ status: "updated" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update experience" });
    }
  });

  app.post("/api/xp/sessions/detail", async (req, res) => {
    try {
      // This would retrieve session details from your storage
      // For now, return mock data
      res.json({ session: "mock_session_detail" });
    } catch (error) {
      res.status(500).json({ error: "Failed to get session detail" });
    }
  });

  // ============================================================
  // Prolog Knowledge Base Management Endpoints
  // ============================================================

  app.get("/api/prolog/facts", async (req, res) => {
    try {
      const { PrologManager } = await import("./engines/prolog/prolog-manager.js");
      const worldId = req.query.worldId as string | undefined;

      // Create manager instance for this world (or use default)
      const kbFile = worldId
        ? `knowledge_base_${worldId}.pl`
        : 'knowledge_base.pl';
      const manager = new PrologManager(kbFile, worldId);
      await manager.initialize();

      const facts = manager.getAllFacts();
      res.json({
        status: 'success',
        facts
      });
    } catch (error) {
      console.error("Error getting facts:", error);
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post("/api/prolog/facts", async (req, res) => {
    try {
      const { PrologManager } = await import("./engines/prolog/prolog-manager.js");
      const { fact, worldId } = req.body;

      if (!fact) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing fact in request body'
        });
      }

      const trimmedFact = fact.trim();
      if (!trimmedFact) {
        return res.status(400).json({
          status: 'error',
          message: 'Fact cannot be empty'
        });
      }

      // Create manager instance for this world (or use default)
      const kbFile = worldId
        ? `knowledge_base_${worldId}.pl`
        : 'knowledge_base.pl';
      const manager = new PrologManager(kbFile, worldId);
      await manager.initialize();

      // Add fact to knowledge base
      const result = await manager.addFact(trimmedFact);
      if (result) {
        return res.json({
          status: 'success',
          message: 'Fact added successfully',
          fact: trimmedFact
        });
      } else {
        return res.status(400).json({
          status: 'error',
          message: 'Failed to add fact - possibly malformed syntax'
        });
      }

    } catch (error) {
      console.error("Error adding fact:", error);
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post("/api/prolog/rules", async (req, res) => {
    try {
      const { PrologManager } = await import("./engines/prolog/prolog-manager.js");
      const { rule, worldId } = req.body;

      if (!rule) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing rule in request body'
        });
      }

      const trimmedRule = rule.trim();
      if (!trimmedRule) {
        return res.status(400).json({
          status: 'error',
          message: 'Rule cannot be empty'
        });
      }

      // Create manager instance for this world (or use default)
      const kbFile = worldId
        ? `knowledge_base_${worldId}.pl`
        : 'knowledge_base.pl';
      const manager = new PrologManager(kbFile, worldId);
      await manager.initialize();

      // Add rule to knowledge base
      const result = await manager.addRule(trimmedRule);
      if (result) {
        return res.json({
          status: 'success',
          message: 'Rule added successfully',
          rule: trimmedRule
        });
      } else {
        return res.status(400).json({
          status: 'error',
          message: 'Failed to add rule - possibly malformed syntax'
        });
      }

    } catch (error) {
      console.error("Error adding rule:", error);
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post("/api/prolog/query", async (req, res) => {
    try {
      const { PrologManager } = await import("./engines/prolog/prolog-manager.js");
      const { query, worldId } = req.body;

      if (!query) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing query in request body'
        });
      }

      const trimmedQuery = query.trim();
      if (!trimmedQuery) {
        return res.status(400).json({
          status: 'error',
          message: 'Query cannot be empty'
        });
      }

      // Create manager instance for this world (or use default)
      const kbFile = worldId
        ? `knowledge_base_${worldId}.pl`
        : 'knowledge_base.pl';
      const manager = new PrologManager(kbFile, worldId);
      await manager.initialize();

      // Execute query
      const results = await manager.query(trimmedQuery);

      return res.json({
        status: 'success',
        query: trimmedQuery,
        results,
        count: results.length
      });

    } catch (error) {
      console.error("Error executing query:", error);
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post("/api/prolog/clear", async (req, res) => {
    try {
      const { PrologManager } = await import("./engines/prolog/prolog-manager.js");
      const { worldId } = req.body;

      // Create manager instance for this world (or use default)
      const kbFile = worldId
        ? `knowledge_base_${worldId}.pl`
        : 'knowledge_base.pl';
      const manager = new PrologManager(kbFile, worldId);
      await manager.initialize();

      await manager.clearKnowledgeBase();
      res.json({
        status: 'success',
        message: 'Knowledge base cleared successfully'
      });
    } catch (error) {
      console.error("Error clearing knowledge base:", error);
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post("/api/prolog/save", async (req, res) => {
    try {
      const { PrologManager } = await import("./engines/prolog/prolog-manager.js");
      const { worldId } = req.body;

      // Create manager instance for this world (or use default)
      const kbFile = worldId
        ? `knowledge_base_${worldId}.pl`
        : 'knowledge_base.pl';
      const manager = new PrologManager(kbFile, worldId);
      await manager.initialize();

      await manager.saveToFile();
      res.json({
        status: 'success',
        message: 'Knowledge base saved successfully'
      });
    } catch (error) {
      console.error("Error saving knowledge base:", error);
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post("/api/prolog/load", async (req, res) => {
    try {
      const { PrologManager } = await import("./engines/prolog/prolog-manager.js");
      const { worldId } = req.body;

      // Create manager instance for this world (or use default)
      const kbFile = worldId
        ? `knowledge_base_${worldId}.pl`
        : 'knowledge_base.pl';
      const manager = new PrologManager(kbFile, worldId);
      await manager.initialize();

      await manager.loadFromFile();
      res.json({
        status: 'success',
        message: 'Knowledge base loaded successfully'
      });
    } catch (error) {
      console.error("Error loading knowledge base:", error);
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get("/api/prolog/export", async (req, res) => {
    try {
      const { PrologManager } = await import("./engines/prolog/prolog-manager.js");
      const worldId = req.query.worldId as string | undefined;

      // Create manager instance for this world (or use default)
      const kbFile = worldId
        ? `knowledge_base_${worldId}.pl`
        : 'knowledge_base.pl';
      const manager = new PrologManager(kbFile, worldId);
      await manager.initialize();

      const content = manager.exportKnowledgeBase();
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${kbFile}"`);
      res.send(content);
    } catch (error) {
      console.error("Error exporting knowledge base:", error);
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post("/api/prolog/sync", async (req, res) => {
    try {
      const { createPrologSyncService } = await import("./engines/prolog/prolog-sync.js");
      const { PrologManager } = await import("./engines/prolog/prolog-manager.js");
      const { worldId } = req.body;

      if (!worldId) {
        return res.status(400).json({
          status: "error",
          message: "World ID is required"
        });
      }

      const kbFile = worldId ? `knowledge_base_${worldId}.pl` : 'knowledge_base.pl';
      const prologManager = new PrologManager(kbFile, worldId);
      await prologManager.initialize();

      const syncService = createPrologSyncService(storage, prologManager);
      
      // Clear existing facts before syncing
      await syncService.clearWorldFromProlog(worldId);

      // Sync all world data (SWI-Prolog)
      await syncService.syncWorldToProlog(worldId);

      // Also sync to tau-prolog (portable engine)
      const characters = await storage.getCharactersByWorld(worldId);
      const settlements = await storage.getSettlementsByWorld(worldId);
      const businesses = typeof (storage as any).getBusinessesByWorld === 'function'
        ? await (storage as any).getBusinessesByWorld(worldId)
        : [];
      const truths = await storage.getTruthsByWorld(worldId);
      const tauStats = await prologAutoSync.syncWorld(worldId, {
        characters: characters as any[],
        settlements: settlements as any[],
        businesses,
        truths: truths as any[],
      });

      res.json({
        status: "success",
        message: `World ${worldId} synced to Prolog knowledge base`,
        factsCount: prologManager.getAllFacts().length,
        tauProlog: tauStats,
      });
    } catch (error: any) {
      console.error('❌ Error syncing to Prolog:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to sync to Prolog",
        details: error.stack
      });
    }
  });

  // Core predicates schema endpoint (serves core-predicates.json)
  app.get("/api/prolog/predicates", async (_req, res) => {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'server', 'schema', 'core-predicates.json');
      const content = fs.readFileSync(filePath, 'utf-8');
      res.json(JSON.parse(content));
    } catch (error: any) {
      res.status(500).json({ error: "Failed to load core predicates", message: error.message });
    }
  });

  // Tau-prolog query endpoint (uses auto-synced in-memory knowledge base)
  app.post("/api/prolog/tau/query", async (req, res) => {
    try {
      const { worldId, query: queryString, maxResults } = req.body;

      if (!worldId || !queryString) {
        return res.status(400).json({ error: "worldId and query are required" });
      }

      // Auto-sync world if not yet loaded
      if (!prologAutoSync.isWorldSynced(worldId)) {
        const characters = await storage.getCharactersByWorld(worldId);
        const settlements = await storage.getSettlementsByWorld(worldId);
        const businesses = typeof (storage as any).getBusinessesByWorld === 'function'
          ? await (storage as any).getBusinessesByWorld(worldId)
          : [];
        const truths = await storage.getTruthsByWorld(worldId);
        await prologAutoSync.syncWorld(worldId, {
          characters: characters as any[],
          settlements: settlements as any[],
          businesses,
          truths: truths as any[],
        });
      }

      const result = await prologAutoSync.query(worldId, queryString, maxResults || 100);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Query failed" });
    }
  });

  // Tau-prolog stats endpoint
  app.get("/api/prolog/tau/stats/:worldId", async (req, res) => {
    try {
      const { worldId } = req.params;
      const stats = prologAutoSync.getWorldStats(worldId);
      res.json({
        ...stats,
        synced: prologAutoSync.isWorldSynced(worldId),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to get stats" });
    }
  });

  // Tau-prolog export endpoint
  app.get("/api/prolog/tau/export/:worldId", async (req, res) => {
    try {
      const { worldId } = req.params;
      const program = prologAutoSync.exportWorld(worldId);
      // Return as JSON so both ApiDataSource (expects {content: string}) and
      // direct consumers can parse it consistently
      res.json({ content: program });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to export" });
    }
  });

  // Tau-prolog sync-back endpoint: sync Prolog state changes back to DB
  app.post("/api/prolog/tau/sync-back/:worldId", async (req, res) => {
    try {
      const { worldId } = req.params;
      if (!prologAutoSync.isWorldSynced(worldId)) {
        return res.status(400).json({
          error: "World not synced to Prolog yet. Run DB → Prolog sync first.",
        });
      }
      const result = await prologAutoSync.syncPrologToDatabase(worldId);
      res.json({
        status: result.errors.length === 0 ? "success" : "partial",
        changesApplied: result.changesApplied,
        details: result.details,
        errors: result.errors,
        timestamp: result.timestamp.toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Sync-back failed" });
    }
  });

  // ── Prolog-LLM Router ────────────────────────────────────────────────────

  // Route query through Prolog first before falling back to AI
  app.post("/api/prolog/tau/smart-query", async (req, res) => {
    try {
      const { prologLLMRouter } = await import("./services/prolog-llm-router.js");
      const { worldId, queryType, params } = req.body;
      if (!worldId || !queryType) {
        return res.status(400).json({ error: "worldId and queryType are required" });
      }
      const result = await prologLLMRouter.tryPrologFirst(worldId, queryType, params || {});
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Smart query failed" });
    }
  });

  // Get available smart query types
  app.get("/api/prolog/tau/smart-query/types", async (_req, res) => {
    try {
      const { prologLLMRouter } = await import("./services/prolog-llm-router.js");
      res.json({ types: prologLLMRouter.getQueryTypes() });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── Prolog Simulation & Testing Endpoints ─────────────────────────────────

  // What-if query: temporarily assert facts, run query, then retract
  app.post("/api/prolog/tau/what-if", async (req, res) => {
    try {
      const { worldId, hypotheticalFacts, query: queryString, maxResults } = req.body;
      if (!worldId || !queryString) {
        return res.status(400).json({ error: "worldId and query are required" });
      }

      const engine = prologAutoSync.getEngine(worldId);
      const tempFacts: string[] = hypotheticalFacts || [];

      // Assert hypothetical facts
      for (const fact of tempFacts) {
        await engine.assertFact(fact);
      }

      // Run query
      const result = await engine.query(queryString, maxResults || 20);

      // Retract hypothetical facts
      for (const fact of tempFacts) {
        await engine.retractFact(fact);
      }

      res.json({
        status: result.success ? 'success' : 'no_results',
        results: result.bindings,
        count: result.bindings.length,
        hypotheticalFacts: tempFacts,
        query: queryString,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "What-if query failed" });
    }
  });

  // Consistency checker: find contradictions in knowledge base
  app.post("/api/prolog/tau/consistency-check", async (req, res) => {
    try {
      const { worldId } = req.body;
      if (!worldId) {
        return res.status(400).json({ error: "worldId is required" });
      }

      const engine = prologAutoSync.getEngine(worldId);
      const issues: { type: string; description: string; details?: any }[] = [];

      // Check 1: Person both alive and dead
      const aliveAndDead = await engine.query("person(X), alive(X), dead(X)", 50);
      if (aliveAndDead.success && aliveAndDead.bindings.length > 0) {
        for (const b of aliveAndDead.bindings) {
          issues.push({ type: 'contradiction', description: `${b.X} is both alive and dead` });
        }
      }

      // Check 2: Person married to self
      const selfMarried = await engine.query("married_to(X, X)", 50);
      if (selfMarried.success && selfMarried.bindings.length > 0) {
        for (const b of selfMarried.bindings) {
          issues.push({ type: 'contradiction', description: `${b.X} is married to themselves` });
        }
      }

      // Check 3: Parent of self
      const selfParent = await engine.query("parent_of(X, X)", 50);
      if (selfParent.success && selfParent.bindings.length > 0) {
        for (const b of selfParent.bindings) {
          issues.push({ type: 'contradiction', description: `${b.X} is their own parent` });
        }
      }

      // Check 4: Negative age
      const negAge = await engine.query("age(X, A), A < 0", 50);
      if (negAge.success && negAge.bindings.length > 0) {
        for (const b of negAge.bindings) {
          issues.push({ type: 'invalid_value', description: `${b.X} has negative age: ${b.A}` });
        }
      }

      // Check 5: Person with no age
      const noAge = await engine.query("person(X), \\+ age(X, _)", 100);
      if (noAge.success && noAge.bindings.length > 0) {
        for (const b of noAge.bindings) {
          issues.push({ type: 'missing_data', description: `${b.X} has no age defined` });
        }
      }

      // Check 6: Person with no gender
      const noGender = await engine.query("person(X), \\+ gender(X, _)", 100);
      if (noGender.success && noGender.bindings.length > 0) {
        for (const b of noGender.bindings) {
          issues.push({ type: 'missing_data', description: `${b.X} has no gender defined` });
        }
      }

      // Check 7: Asymmetric marriage (X married to Y but not Y to X)
      const asymMarriage = await engine.query("married_to(X, Y), \\+ married_to(Y, X)", 50);
      if (asymMarriage.success && asymMarriage.bindings.length > 0) {
        for (const b of asymMarriage.bindings) {
          issues.push({ type: 'inconsistency', description: `${b.X} married to ${b.Y} but not reciprocated` });
        }
      }

      // Check 8: Dead person with active occupation
      const deadWorking = await engine.query("dead(X), occupation(X, O), O \\= none", 50);
      if (deadWorking.success && deadWorking.bindings.length > 0) {
        for (const b of deadWorking.bindings) {
          issues.push({ type: 'inconsistency', description: `${b.X} is dead but has occupation: ${b.O}` });
        }
      }

      const stats = engine.getStats();

      res.json({
        status: 'success',
        issues,
        issueCount: issues.length,
        summary: {
          contradictions: issues.filter(i => i.type === 'contradiction').length,
          inconsistencies: issues.filter(i => i.type === 'inconsistency').length,
          missingData: issues.filter(i => i.type === 'missing_data').length,
          invalidValues: issues.filter(i => i.type === 'invalid_value').length,
        },
        knowledgeBaseStats: stats,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Consistency check failed" });
    }
  });

  // Scenario test: run a series of queries and assertions to validate world state
  app.post("/api/prolog/tau/scenario-test", async (req, res) => {
    try {
      const { worldId, scenarios } = req.body;
      if (!worldId || !scenarios || !Array.isArray(scenarios)) {
        return res.status(400).json({ error: "worldId and scenarios array are required" });
      }

      const engine = prologAutoSync.getEngine(worldId);
      const results: { name: string; query: string; expected: string; actual: string; passed: boolean }[] = [];

      for (const scenario of scenarios) {
        const { name, setup, query: queryStr, expect } = scenario;

        // Setup: temporarily assert facts
        const setupFacts: string[] = setup || [];
        for (const fact of setupFacts) {
          await engine.assertFact(fact);
        }

        // Run query
        const result = await engine.query(queryStr, 20);

        // Evaluate expectation
        let passed = false;
        let actual = '';

        if (expect === 'true' || expect === true) {
          passed = result.success && result.bindings.length > 0;
          actual = passed ? 'true (has results)' : 'false (no results)';
        } else if (expect === 'false' || expect === false) {
          passed = !result.success || result.bindings.length === 0;
          actual = passed ? 'false (no results)' : 'true (has results)';
        } else if (typeof expect === 'number') {
          passed = result.bindings.length === expect;
          actual = `${result.bindings.length} results`;
        } else {
          passed = result.success;
          actual = result.success ? `${result.bindings.length} results` : 'query failed';
        }

        results.push({
          name: name || queryStr,
          query: queryStr,
          expected: String(expect),
          actual,
          passed,
        });

        // Teardown: retract setup facts
        for (const fact of setupFacts) {
          await engine.retractFact(fact);
        }
      }

      const passCount = results.filter(r => r.passed).length;
      res.json({
        status: 'success',
        results,
        summary: {
          total: results.length,
          passed: passCount,
          failed: results.length - passCount,
          passRate: results.length > 0 ? Math.round((passCount / results.length) * 100) : 0,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Scenario test failed" });
    }
  });

  // Batch convert ALL rules, actions, and quests for a world to Prolog
  app.post("/api/worlds/:worldId/prolog/convert-all", async (req, res) => {
    try {
      const { worldId } = req.params;
      const includeBase = req.body?.includeBase !== false; // default true
      const results: Record<string, { converted: number; skipped: number; errors: string[] }> = {};

      // World rules — content IS Prolog now, extract metadata only
      const worldRules = await storage.getRulesByWorld(worldId);
      results.worldRules = { converted: 0, skipped: 0, errors: [] };
      for (const rule of worldRules) {
        if (!rule.content) { results.worldRules.skipped++; continue; }
        try {
          const meta = extractAllMetadata(rule.content);
          await storage.updateRule(rule.id, {
            ...(meta.priority != null ? { priority: meta.priority } : {}),
            ...(meta.likelihood != null ? { likelihood: meta.likelihood } : {}),
            ...(meta.ruleType ? { ruleType: meta.ruleType } : {}),
            ...(meta.category ? { category: meta.category } : {}),
          });
          results.worldRules.converted++;
        } catch (err: any) { results.worldRules.errors.push(`Rule "${rule.name}": ${err.message || String(err)}`); }
      }

      // Base rules (optional) — content IS Prolog now, extract metadata only
      if (includeBase) {
        const baseRules = await storage.getBaseRules({ includeContent: true, limit: 2000 });
        results.baseRules = { converted: 0, skipped: 0, errors: [] };
        for (const rule of baseRules) {
          if (!rule.content) { results.baseRules.skipped++; continue; }
          try {
            const meta = extractAllMetadata(rule.content);
            await storage.updateRule(rule.id, {
              ...(meta.priority != null ? { priority: meta.priority } : {}),
              ...(meta.likelihood != null ? { likelihood: meta.likelihood } : {}),
              ...(meta.ruleType ? { ruleType: meta.ruleType } : {}),
              ...(meta.category ? { category: meta.category } : {}),
            });
            results.baseRules.converted++;
          } catch (err: any) { results.baseRules.errors.push(`Rule "${rule.name}": ${err.message || String(err)}`); }
        }
      }

      // World actions
      const actions = await storage.getActionsByWorld(worldId);
      results.worldActions = { converted: 0, skipped: 0, errors: [] };
      for (const action of actions) {
        if (action.content) { results.worldActions.skipped++; continue; }
        try {
          const r = convertActionToProlog(action as any);
          if (r.prologContent) { await storage.updateAction(action.id, { content: r.prologContent }); results.worldActions.converted++; }
          else results.worldActions.skipped++;
        } catch (err: any) { results.worldActions.errors.push(`Action "${action.name}": ${err.message || String(err)}`); }
      }

      // Base actions
      if (includeBase) {
        const baseActions = await storage.getBaseActions();
        results.baseActions = { converted: 0, skipped: 0, errors: [] };
        for (const action of baseActions) {
          if (action.content) { results.baseActions.skipped++; continue; }
          try {
            const r = convertActionToProlog(action as any);
            if (r.prologContent) { await storage.updateAction(action.id, { content: r.prologContent }); results.baseActions.converted++; }
            else results.baseActions.skipped++;
          } catch (err: any) { results.baseActions.errors.push(`Action "${action.name}": ${err.message || String(err)}`); }
        }
      }

      // World quests
      const quests = await storage.getQuestsByWorld(worldId);
      results.worldQuests = { converted: 0, skipped: 0, errors: [] };
      for (const quest of quests) {
        if (quest.content) { results.worldQuests.skipped++; continue; }
        try {
          const r = convertQuestToProlog(quest as any);
          if (r.prologContent) { await storage.updateQuest(quest.id, { content: r.prologContent }); results.worldQuests.converted++; }
          else results.worldQuests.skipped++;
        } catch (err: any) { results.worldQuests.errors.push(`Quest "${quest.title}": ${err.message || String(err)}`); }
      }

      // Invalidate caches
      baseRulesCache = null;
      baseRulesCacheTime = 0;
      rulesCache.clear();

      res.json(results);
    } catch (error: any) {
      console.error('Error batch converting world to Prolog:', error);
      res.status(500).json({ error: error.message || 'Failed to batch convert' });
    }
  });

  // Coverage report: which predicates are referenced by rules/actions/quests
  app.get("/api/prolog/tau/coverage/:worldId", async (req, res) => {
    try {
      const { worldId } = req.params;
      const fs = await import('fs');
      const path = await import('path');

      // Load core predicates
      const predPath = path.join(process.cwd(), 'server', 'schema', 'core-predicates.json');
      const predData = JSON.parse(fs.readFileSync(predPath, 'utf-8'));
      const predicateNames = Object.keys(predData.predicates || {});

      // Fetch world content
      const [rules, actions, quests] = await Promise.all([
        storage.getRulesByWorld(worldId),
        storage.getActionsByWorld(worldId),
        storage.getQuestsByWorld(worldId),
      ]);

      // Analyze coverage
      const coverage: Record<string, { rules: number; actions: number; quests: number; total: number }> = {};
      for (const name of predicateNames) {
        coverage[name] = { rules: 0, actions: 0, quests: 0, total: 0 };
      }

      const countOccurrences = (content: string | null | undefined, predName: string): number => {
        if (!content) return 0;
        const regex = new RegExp(`\\b${predName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\(`, 'g');
        return (content.match(regex) || []).length;
      };

      for (const rule of rules) {
        for (const name of predicateNames) {
          const count = countOccurrences(rule.content, name);
          if (count > 0) { coverage[name].rules += count; coverage[name].total += count; }
        }
      }
      for (const action of actions) {
        for (const name of predicateNames) {
          const count = countOccurrences((action as any).content, name);
          if (count > 0) { coverage[name].actions += count; coverage[name].total += count; }
        }
      }
      for (const quest of quests) {
        for (const name of predicateNames) {
          const count = countOccurrences((quest as any).content, name);
          if (count > 0) { coverage[name].quests += count; coverage[name].total += count; }
        }
      }

      const covered = Object.values(coverage).filter(c => c.total > 0).length;
      const uncovered = Object.values(coverage).filter(c => c.total === 0).length;

      res.json({
        status: 'success',
        coverage,
        summary: {
          totalPredicates: predicateNames.length,
          covered,
          uncovered,
          coveragePercent: predicateNames.length > 0 ? Math.round((covered / predicateNames.length) * 100) : 0,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Coverage report failed" });
    }
  });

  app.post("/api/prolog/import", async (req, res) => {
    try {
      const { PrologManager } = await import("./engines/prolog/prolog-manager.js");
      const { content, worldId } = req.body;

      if (!content) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing content in request body'
        });
      }

      // Create manager instance for this world (or use default)
      const kbFile = worldId
        ? `knowledge_base_${worldId}.pl`
        : 'knowledge_base.pl';
      const manager = new PrologManager(kbFile, worldId);
      await manager.initialize();

      await manager.importKnowledgeBase(content);
      res.json({
        status: 'success',
        message: 'Knowledge base imported successfully'
      });
    } catch (error) {
      console.error("Error importing knowledge base:", error);
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Actions
  app.get("/api/worlds/:worldId/actions", async (req, res) => {
    try {
      const actions = await storage.getActionsByWorld(req.params.worldId);
      res.json(actions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch actions" });
    }
  });

  app.get("/api/worlds/:worldId/actions/type/:actionType", async (req, res) => {
    try {
      const actions = await storage.getActionsByType(req.params.worldId, req.params.actionType);
      res.json(actions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch actions by type" });
    }
  });

  // Get all base actions - MUST come before /api/actions/:id
  app.get("/api/actions/base", async (req, res) => {
    try {
      console.log('Fetching base actions...');
      const actions = await storage.getBaseActions();
      console.log(`Found ${actions.length} base actions`);
      if (actions.length > 0) {
        console.log('First base action:', {
          id: actions[0].id,
          name: actions[0].name,
          isBase: actions[0].isBase,
          worldId: actions[0].worldId,
          worldIdType: typeof actions[0].worldId
        });
      }
      res.json(actions);
    } catch (error) {
      console.error('Error fetching base actions:', error);
      res.status(500).json({ error: "Failed to fetch base actions" });
    }
  });

  // Batch convert base actions to Prolog
  app.post("/api/actions/base/convert-all", async (req, res) => {
    try {
      const actions = await storage.getBaseActions();
      let converted = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (const action of actions) {
        if (action.content) {
          skipped++;
          continue;
        }
        try {
          const result = convertActionToProlog(action as any);
          if (result.prologContent) {
            await storage.updateAction(action.id, { content: result.prologContent });
            converted++;
          } else {
            skipped++;
          }
        } catch (err: any) {
          errors.push(`Action "${action.name}" (${action.id}): ${err.message || String(err)}`);
        }
      }

      res.json({ converted, skipped, errors });
    } catch (error: any) {
      console.error('Error batch converting base actions:', error);
      res.status(500).json({ error: error.message || 'Failed to batch convert actions' });
    }
  });

  // Batch convert world actions to Prolog
  app.post("/api/worlds/:worldId/actions/convert-all", async (req, res) => {
    try {
      const actions = await storage.getActionsByWorld(req.params.worldId);
      let converted = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (const action of actions) {
        if (action.content) {
          skipped++;
          continue;
        }
        try {
          const result = convertActionToProlog(action as any);
          if (result.prologContent) {
            await storage.updateAction(action.id, { content: result.prologContent });
            converted++;
          } else {
            skipped++;
          }
        } catch (err: any) {
          errors.push(`Action "${action.name}" (${action.id}): ${err.message || String(err)}`);
        }
      }

      res.json({ converted, skipped, errors });
    } catch (error: any) {
      console.error('Error batch converting world actions:', error);
      res.status(500).json({ error: error.message || 'Failed to batch convert actions' });
    }
  });

  // Get actions by type (base actions)
  app.get("/api/actions/type/:actionType", async (req, res) => {
    try {
      const actions = await storage.getBaseActionsByType(req.params.actionType);
      res.json(actions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch actions by type" });
    }
  });

  app.get("/api/actions/:id", async (req, res) => {
    try {
      const action = await storage.getAction(req.params.id);
      if (!action) {
        return res.status(404).json({ error: "Action not found" });
      }
      res.json(action);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch action" });
    }
  });

  app.post("/api/actions", async (req, res) => {
    try {
      // If isBase is true, set worldId to null and ensure isBase flag
      const data = req.body.isBase ? { ...req.body, worldId: null, isBase: true } : req.body;
      
      // Log incoming data for debugging
      console.log('Creating action:', {
        name: data.name,
        isBase: data.isBase,
        worldId: data.worldId,
        actionType: data.actionType,
        sourceFormat: data.sourceFormat
      });
      
      const validatedData = insertActionSchema.parse(data);
      console.log('After validation:', {
        name: validatedData.name,
        isBase: validatedData.isBase,
        worldId: validatedData.worldId,
        worldIdType: typeof validatedData.worldId
      });

      // Auto-generate Prolog content if not provided
      if (!validatedData.content && validatedData.name) {
        try {
          const result = convertActionToProlog(validatedData as any);
          (validatedData as any).content = result.prologContent;
        } catch (e) {
          console.warn('[ActionProlog] Failed to convert action:', e);
        }
      }

      // Extract denormalized metadata from Prolog content
      if ((validatedData as any).content) {
        try {
          const meta = extractActionMetadata((validatedData as any).content);
          if (meta.actionType) (validatedData as any).actionType = meta.actionType;
          if (meta.energyCost != null) (validatedData as any).energyCost = meta.energyCost;
          if (meta.difficulty != null) (validatedData as any).difficulty = meta.difficulty;
          if (meta.duration != null) (validatedData as any).duration = meta.duration;
          if (meta.targetType) (validatedData as any).targetType = meta.targetType;
          if (meta.cooldown != null) (validatedData as any).cooldown = meta.cooldown;
        } catch (e) {
          console.warn('[ActionMetadata] Failed to extract metadata:', e);
        }
      }

      const action = await storage.createAction(validatedData);
      console.log('Created action in DB:', {
        id: action.id,
        name: action.name,
        isBase: action.isBase,
        worldId: action.worldId,
        worldIdType: typeof action.worldId
      });
      
      res.status(201).json(action);
    } catch (error) {
      console.error("Failed to create action:", error);
      console.error("Request body:", JSON.stringify(req.body, null, 2));
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid action data", 
          details: error.errors,
          receivedData: {
            name: req.body.name,
            actionType: req.body.actionType,
            isBase: req.body.isBase
          }
        });
      }
      
      res.status(500).json({ 
        error: "Failed to create action",
        message: error instanceof Error ? error.message : String(error),
        details: error instanceof Error ? error.stack : undefined
      });
    }
  });

  app.post("/api/worlds/:worldId/actions", async (req, res) => {
    try {
      const { worldId } = req.params;

      // Check permissions
      const token = req.headers.authorization?.split(' ')[1];
      const payload = token ? AuthService.verifyToken(token) : null;

      if (!(await canEditWorld(payload?.userId, worldId))) {
        return res.status(403).json({ error: "You don't have permission to edit this world" });
      }

      const actionData = { ...req.body, worldId };
      const validatedData = insertActionSchema.parse(actionData);

      // Auto-generate Prolog content if not provided
      if (!validatedData.content && validatedData.name) {
        try {
          const result = convertActionToProlog(validatedData as any);
          (validatedData as any).content = result.prologContent;
        } catch (e) {
          console.warn('[ActionProlog] Failed to convert action:', e);
        }
      }

      // Extract denormalized metadata from Prolog content
      if ((validatedData as any).content) {
        try {
          const meta = extractActionMetadata((validatedData as any).content);
          if (meta.actionType) (validatedData as any).actionType = meta.actionType;
          if (meta.energyCost != null) (validatedData as any).energyCost = meta.energyCost;
          if (meta.difficulty != null) (validatedData as any).difficulty = meta.difficulty;
          if (meta.duration != null) (validatedData as any).duration = meta.duration;
          if (meta.targetType) (validatedData as any).targetType = meta.targetType;
          if (meta.cooldown != null) (validatedData as any).cooldown = meta.cooldown;
        } catch (e) {
          console.warn('[ActionMetadata] Failed to extract metadata:', e);
        }
      }

      const action = await storage.createAction(validatedData);
      res.status(201).json(action);
    } catch (error) {
      console.error("Failed to create action:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid action data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create action" });
    }
  });

  app.put("/api/actions/:id", async (req, res) => {
    try {
      const { id } = req.params;

      // Get action to find its world
      const existingAction = await storage.getAction(id);
      if (!existingAction) {
        return res.status(404).json({ error: "Action not found" });
      }

      // Check permissions
      const token = req.headers.authorization?.split(' ')[1];
      const payload = token ? AuthService.verifyToken(token) : null;

      if (!(await canEditWorld(payload?.userId, existingAction.worldId))) {
        return res.status(403).json({ error: "You don't have permission to edit this world" });
      }

      const validatedData = insertActionSchema.partial().parse(req.body);

      // Re-generate Prolog content on update
      if (validatedData.name || validatedData.content) {
        try {
          const merged = { ...existingAction, ...validatedData };
          const result = convertActionToProlog(merged as any);
          (validatedData as any).content = result.prologContent;
        } catch (e) {
          console.warn('[ActionProlog] Failed to convert action on update:', e);
        }
      }

      // Extract denormalized metadata from Prolog content
      if ((validatedData as any).content) {
        try {
          const meta = extractActionMetadata((validatedData as any).content);
          if (meta.actionType) (validatedData as any).actionType = meta.actionType;
          if (meta.energyCost != null) (validatedData as any).energyCost = meta.energyCost;
          if (meta.difficulty != null) (validatedData as any).difficulty = meta.difficulty;
          if (meta.duration != null) (validatedData as any).duration = meta.duration;
          if (meta.targetType) (validatedData as any).targetType = meta.targetType;
          if (meta.cooldown != null) (validatedData as any).cooldown = meta.cooldown;
        } catch (e) {
          console.warn('[ActionMetadata] Failed to extract metadata:', e);
        }
      }

      const action = await storage.updateAction(id, validatedData);
      if (!action) {
        return res.status(404).json({ error: "Action not found" });
      }
      res.json(action);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid action data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update action" });
    }
  });

  app.delete("/api/actions/:id", async (req, res) => {
    try {
      const { id } = req.params;

      // Get action to find its world
      const existingAction = await storage.getAction(id);
      if (!existingAction) {
        return res.status(404).json({ error: "Action not found" });
      }

      // Check permissions
      const token = req.headers.authorization?.split(' ')[1];
      const payload = token ? AuthService.verifyToken(token) : null;

      if (!(await canEditWorld(payload?.userId, existingAction.worldId))) {
        return res.status(403).json({ error: "You don't have permission to edit this world" });
      }

      const deleted = await storage.deleteAction(id);
      if (!deleted) {
        return res.status(404).json({ error: "Action not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete action" });
    }
  });


  // Per-World Base Resource Configuration
  app.get("/api/worlds/:worldId/base-resources/config", async (req, res) => {
    try {
      const world = await storage.getWorld(req.params.worldId);
      if (!world) {
        return res.status(404).json({ error: "World not found" });
      }
      
      // Return configuration from world.config or default to all enabled
      const config = {
        enabledBaseRules: world.config?.enabledBaseRules || [],
        disabledBaseRules: world.config?.disabledBaseRules || [],
        enabledBaseActions: world.config?.enabledBaseActions || [],
        disabledBaseActions: world.config?.disabledBaseActions || []
      };
      
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch base resource config" });
    }
  });

  app.post("/api/worlds/:worldId/base-resources/toggle", async (req, res) => {
    try {
      const { resourceId, resourceType, enabled } = req.body;
      const world = await storage.getWorld(req.params.worldId);
      
      if (!world) {
        return res.status(404).json({ error: "World not found" });
      }

      const config = world.config || {};
      
      if (resourceType === 'rule') {
        if (!config.enabledBaseRules) config.enabledBaseRules = [];
        if (!config.disabledBaseRules) config.disabledBaseRules = [];
        
        if (enabled) {
          config.enabledBaseRules = [...config.enabledBaseRules.filter((id: string) => id !== resourceId), resourceId];
          config.disabledBaseRules = config.disabledBaseRules.filter((id: string) => id !== resourceId);
        } else {
          config.disabledBaseRules = [...config.disabledBaseRules.filter((id: string) => id !== resourceId), resourceId];
          config.enabledBaseRules = config.enabledBaseRules.filter((id: string) => id !== resourceId);
        }
      } else if (resourceType === 'action') {
        if (!config.enabledBaseActions) config.enabledBaseActions = [];
        if (!config.disabledBaseActions) config.disabledBaseActions = [];
        
        if (enabled) {
          config.enabledBaseActions = [...config.enabledBaseActions.filter((id: string) => id !== resourceId), resourceId];
          config.disabledBaseActions = config.disabledBaseActions.filter((id: string) => id !== resourceId);
        } else {
          config.disabledBaseActions = [...config.disabledBaseActions.filter((id: string) => id !== resourceId), resourceId];
          config.enabledBaseActions = config.enabledBaseActions.filter((id: string) => id !== resourceId);
        }
      }

      await storage.updateWorld(req.params.worldId, { config });
      
      res.json({ message: "Base resource toggle updated", config });
    } catch (error) {
      console.error("Failed to toggle base resource:", error);
      res.status(500).json({ error: "Failed to toggle base resource" });
    }
  });

  // World 3D asset configuration (now resolved from asset collections)
  app.get("/api/worlds/:worldId/3d-config", async (req, res) => {
    try {
      const { worldId } = req.params;
      const { getWorld3DConfigForWorld } = await import('./services/asset-collection-resolver.js');
      const config = await getWorld3DConfigForWorld(worldId);
      res.json(config);
    } catch (error: any) {
      console.error("Failed to get 3D config:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/worlds/:worldId/3d-config", async (req, res) => {
    try {
      const { worldId } = req.params;
      const { updateWorld3DConfig } = await import('./services/asset-collection-resolver.js');
      const config = await updateWorld3DConfig(worldId, req.body);
      res.json(config);
    } catch (error: any) {
      console.error("Failed to update 3D config:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Note: sync-defaults endpoint removed - 3D assets are now managed through asset collections
  // Users can populate collections via the Polyhaven browser UI (Auto-Select Assets feature)

  // Truths
  app.get("/api/worlds/:worldId/truth", async (req, res) => {
    try {
      const entries = await storage.getTruthsByWorld(req.params.worldId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch Truths" });
    }
  });

  app.get("/api/characters/:characterId/truth", async (req, res) => {
    try {
      const entries = await storage.getTruthsByCharacter(req.params.characterId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch character truth" });
    }
  });

  app.get("/api/truth/:id", async (req, res) => {
    try {
      const entry = await storage.getTruth(req.params.id);
      if (!entry) {
        return res.status(404).json({ error: "Truth entry not found" });
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch truth entry" });
    }
  });

  app.post("/api/worlds/:worldId/truth", async (req, res) => {
    try {
      const entryData = { ...req.body, worldId: req.params.worldId };
      const validatedData = insertTruthSchema.parse(entryData);
      const entry = await storage.createTruth(validatedData);

      // Auto-sync item ownership to Prolog
      if ((entry as any).entryType === 'ownership' && (entry as any).characterId) {
        const owner = await storage.getCharacter((entry as any).characterId);
        prologAutoSync.onTruthChanged(req.params.worldId, entry as any, owner as any).catch(e => console.warn('[PrologAutoSync] truth create:', e));
      }

      // Auto-link truth to related entities bidirectionally
      autoLinkTruth(storage, entry.id, req.params.worldId).catch(e => console.warn('[TruthAutoLinker]', e));

      res.status(201).json(entry);
    } catch (error) {
      console.error("Failed to create truth entry:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid truth entry data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create truth entry" });
    }
  });

  app.post("/api/truth", async (req, res) => {
    try {
      const validatedData = insertTruthSchema.parse(req.body);
      const entry = await storage.createTruth(validatedData);

      // Auto-sync item ownership to Prolog
      if ((entry as any).entryType === 'ownership' && (entry as any).characterId && (entry as any).worldId) {
        const owner = await storage.getCharacter((entry as any).characterId);
        prologAutoSync.onTruthChanged((entry as any).worldId, entry as any, owner as any).catch(e => console.warn('[PrologAutoSync] truth create:', e));
      }

      // Auto-link truth to related entities bidirectionally
      if ((entry as any).worldId) {
        autoLinkTruth(storage, entry.id, (entry as any).worldId).catch(e => console.warn('[TruthAutoLinker]', e));
      }

      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid truth entry data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create truth entry" });
    }
  });

  app.put("/api/truth/:id", async (req, res) => {
    try {
      const validatedData = insertTruthSchema.partial().parse(req.body);
      const entry = await storage.updateTruth(req.params.id, validatedData);
      if (!entry) {
        return res.status(404).json({ error: "Truth entry not found" });
      }

      // Auto-sync item ownership to Prolog
      if ((entry as any).entryType === 'ownership' && (entry as any).characterId && (entry as any).worldId) {
        const owner = await storage.getCharacter((entry as any).characterId);
        prologAutoSync.onTruthChanged((entry as any).worldId, entry as any, owner as any).catch(e => console.warn('[PrologAutoSync] truth update:', e));
      }

      // Re-link truth after content update
      if ((entry as any).worldId) {
        autoLinkTruth(storage, entry.id, (entry as any).worldId).catch(e => console.warn('[TruthAutoLinker]', e));
      }

      res.json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid truth entry data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update truth entry" });
    }
  });

  // Batch auto-link all truths in a world
  app.post("/api/worlds/:worldId/truths/auto-link", async (req, res) => {
    try {
      const { autoLinkAllTruths } = await import("./services/truth-auto-linker.js");
      const result = await autoLinkAllTruths(storage as any, req.params.worldId);
      res.json(result);
    } catch (error) {
      console.error("Failed to auto-link truths:", error);
      res.status(500).json({ error: "Failed to auto-link truths" });
    }
  });

  app.delete("/api/truth/:id", async (req, res) => {
    try {
      // Get truth before deleting for Prolog sync
      const existingTruth = await storage.getTruth(req.params.id);

      const deleted = await storage.deleteTruth(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Truth entry not found" });
      }

      // Auto-sync to Prolog
      if (existingTruth && (existingTruth as any).worldId) {
        prologAutoSync.onTruthDeleted((existingTruth as any).worldId, existingTruth as any).catch(e => console.warn('[PrologAutoSync] truth delete:', e));
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete truth entry" });
    }
  });

  // ============================================================
  // Quest Endpoints
  // ============================================================

  app.get("/api/worlds/:worldId/quests", async (req, res) => {
    try {
      const quests = await storage.getQuestsByWorld(req.params.worldId);
      res.json(quests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quests" });
    }
  });

  app.get("/api/quests/player/:playerName", async (req, res) => {
    try {
      const quests = await storage.getQuestsByPlayer(req.params.playerName);
      res.json(quests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch player quests" });
    }
  });

  app.get("/api/quests/character/:characterId", async (req, res) => {
    try {
      const quests = await storage.getQuestsByPlayerCharacterId(req.params.characterId);
      res.json(quests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch character quests" });
    }
  });

  // Batch convert world quests to Prolog
  app.post("/api/worlds/:worldId/quests/convert-all", async (req, res) => {
    try {
      const quests = await storage.getQuestsByWorld(req.params.worldId);
      let converted = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (const quest of quests) {
        if (quest.content) {
          skipped++;
          continue;
        }
        try {
          const result = convertQuestToProlog(quest as any);
          if (result.prologContent) {
            await storage.updateQuest(quest.id, { content: result.prologContent });
            converted++;
          } else {
            skipped++;
          }
        } catch (err: any) {
          errors.push(`Quest "${quest.title}" (${quest.id}): ${err.message || String(err)}`);
        }
      }

      res.json({ converted, skipped, errors });
    } catch (error: any) {
      console.error('Error batch converting world quests:', error);
      res.status(500).json({ error: error.message || 'Failed to batch convert quests' });
    }
  });

  app.post("/api/worlds/:worldId/quests", async (req, res) => {
    try {
      const questData = { ...req.body, worldId: req.params.worldId };

      // Auto-generate Prolog content
      if (!questData.content && questData.title) {
        try {
          const result = convertQuestToProlog(questData);
          questData.content = result.prologContent;
        } catch (e) {
          console.warn('[QuestProlog] Failed to convert quest:', e);
        }
      }

      const quest = await storage.createQuest(questData);
      res.status(201).json(quest);
    } catch (error) {
      res.status(500).json({ error: "Failed to create quest" });
    }
  });

  app.get("/api/quests/:id", async (req, res) => {
    try {
      const quest = await storage.getQuest(req.params.id);
      if (!quest) {
        return res.status(404).json({ error: "Quest not found" });
      }
      res.json(quest);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quest" });
    }
  });

  app.put("/api/quests/:id", async (req, res) => {
    try {
      // Re-generate Prolog content on update if relevant fields changed
      if (req.body.title || req.body.objectives || req.body.completionCriteria) {
        try {
          const existing = await storage.getQuest(req.params.id);
          if (existing) {
            const merged = { ...existing, ...req.body };
            const result = convertQuestToProlog(merged as any);
            req.body.content = result.prologContent;
          }
        } catch (e) {
          console.warn('[QuestProlog] Failed to convert quest on update:', e);
        }
      }

      const quest = await storage.updateQuest(req.params.id, req.body);
      if (!quest) {
        return res.status(404).json({ error: "Quest not found" });
      }
      res.json(quest);
    } catch (error) {
      res.status(500).json({ error: "Failed to update quest" });
    }
  });

  app.delete("/api/quests/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteQuest(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Quest not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete quest" });
    }
  });

  // ============= ITEMS =============

  // Get all items for a world (includes matching base items)
  app.get("/api/worlds/:worldId/items", async (req, res) => {
    try {
      const items = await storage.getItemsByWorld(req.params.worldId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch items" });
    }
  });

  // Get base item templates
  app.get("/api/items/base", async (req, res) => {
    try {
      const worldType = req.query.worldType as string | undefined;
      const items = await storage.getBaseItems(worldType);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch base items" });
    }
  });

  // Get single item
  app.get("/api/items/:id", async (req, res) => {
    try {
      const item = await storage.getItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch item" });
    }
  });

  // Create item for a world
  app.post("/api/worlds/:worldId/items", async (req, res) => {
    try {
      const { worldId } = req.params;

      const token = req.headers.authorization?.split(' ')[1];
      const payload = token ? AuthService.verifyToken(token) : null;

      if (!(await canEditWorld(payload?.userId, worldId))) {
        return res.status(403).json({ error: "You don't have permission to edit this world" });
      }

      const itemData = { ...req.body, worldId };
      const validatedData = insertItemSchema.parse(itemData);
      const item = await storage.createItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid item data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create item" });
    }
  });

  // Update item
  app.put("/api/items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const existingItem = await storage.getItem(id);
      if (!existingItem) {
        return res.status(404).json({ error: "Item not found" });
      }

      if (existingItem.worldId) {
        const token = req.headers.authorization?.split(' ')[1];
        const payload = token ? AuthService.verifyToken(token) : null;
        if (!(await canEditWorld(payload?.userId, existingItem.worldId))) {
          return res.status(403).json({ error: "You don't have permission to edit this world" });
        }
      }

      const validatedData = insertItemSchema.partial().parse(req.body);
      const item = await storage.updateItem(id, validatedData);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid item data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update item" });
    }
  });

  // Delete item
  app.delete("/api/items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const existingItem = await storage.getItem(id);
      if (!existingItem) {
        return res.status(404).json({ error: "Item not found" });
      }

      if (existingItem.worldId) {
        const token = req.headers.authorization?.split(' ')[1];
        const payload = token ? AuthService.verifyToken(token) : null;
        if (!(await canEditWorld(payload?.userId, existingItem.worldId))) {
          return res.status(403).json({ error: "You don't have permission to edit this world" });
        }
      }

      const deleted = await storage.deleteItem(id);
      if (!deleted) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete item" });
    }
  });

  // Quest Generation Endpoints
  app.post("/api/worlds/:worldId/quests/generate", async (req, res) => {
    try {
      const { worldId } = req.params;
      const { count = 5, category, difficulty, assignedTo } = req.body;

      const world = await storage.getWorld(worldId);
      if (!world) {
        return res.status(404).json({ error: "World not found" });
      }

      // Import quest generator dynamically
      const { generateQuestsForWorld } = await import('./services/quest-generator.js');

      const generatedQuests = await generateQuestsForWorld(world, count, {
        category,
        difficulty,
        assignedTo
      });

      // Save generated quests to database (with Prolog content)
      const createdQuests = [];
      for (const questData of generatedQuests) {
        // Auto-generate Prolog content for each generated quest
        if (!questData.content && questData.title) {
          try {
            const result = convertQuestToProlog(questData as any);
            (questData as any).content = result.prologContent;
          } catch (e) {
            console.warn('[QuestProlog] Failed to convert generated quest:', e);
          }
        }
        const created = await storage.createQuest(questData);
        createdQuests.push(created);
      }

      res.status(201).json({
        count: createdQuests.length,
        quests: createdQuests
      });
    } catch (error) {
      console.error('[Quest Generation] Error:', error);
      res.status(500).json({ error: "Failed to generate quests" });
    }
  });

  // Mystery Quest Generation (Prolog abductive reasoning)
  app.post("/api/worlds/:worldId/quests/generate-mystery", async (req, res) => {
    try {
      const { worldId } = req.params;
      const { victimId, crimeType } = req.body;

      const world = await storage.getWorld(worldId);
      if (!world) {
        return res.status(404).json({ error: "World not found" });
      }

      const { generateMysteryQuest } = await import('./services/mystery-quest-generator.js');
      const mystery = await generateMysteryQuest(worldId, { victimId, crimeType });

      if (!mystery) {
        return res.status(422).json({
          error: "Could not generate mystery quest",
          detail: "Not enough data in the Prolog knowledge base (needs characters with relationships, enemies, or wealth)."
        });
      }

      // Optionally persist as a regular quest
      const questData = {
        worldId,
        title: mystery.title,
        description: mystery.description,
        category: 'mystery',
        difficulty: 'hard',
        objectives: mystery.objectives as any,
        customData: {
          mysteryType: crimeType || 'auto',
          victim: mystery.victim,
          suspects: mystery.suspects,
          clues: mystery.clues,
          solution: mystery.solution,
        },
      };

      // Auto-generate Prolog content for mystery quest
      try {
        const result = convertQuestToProlog(questData as any);
        if (result.prologContent) (questData as any).content = result.prologContent;
      } catch (e) {
        console.warn('[QuestProlog] Failed to convert mystery quest:', e);
      }

      let savedQuest = null;
      try {
        savedQuest = await storage.createQuest(questData);
      } catch (e) {
        console.warn('[MysteryQuest] Failed to persist quest:', e);
      }

      res.status(201).json({
        quest: savedQuest,
        mystery,
      });
    } catch (error) {
      console.error('[MysteryQuest] Error:', error);
      res.status(500).json({ error: "Failed to generate mystery quest" });
    }
  });

  // Quest Chain Endpoints
  app.post("/api/worlds/:worldId/quest-chains/generate", async (req, res) => {
    try {
      const { worldId } = req.params;
      const { name, description, questCount = 5, isLinear = true, category, difficulty } = req.body;

      const world = await storage.getWorld(worldId);
      if (!world) {
        return res.status(404).json({ error: "World not found" });
      }

      // Import quest generator and chain manager
      const { generateQuestsForWorld } = await import('./services/quest-generator.js');
      const { questChainManager } = await import('./services/quest-chain-manager.js');

      // Generate quests for the chain
      const generatedQuests = await generateQuestsForWorld(world, questCount, {
        category,
        difficulty,
      });

      // Create quest chain
      const chain = await questChainManager.createQuestChain(
        {
          id: '',
          name: name || `Quest Chain ${Date.now()}`,
          description: description || 'A series of connected quests',
          worldId,
          isLinear,
        },
        generatedQuests
      );

      res.status(201).json({ chain });
    } catch (error) {
      console.error('[Quest Chain Generation] Error:', error);
      res.status(500).json({ error: "Failed to generate quest chain" });
    }
  });

  app.get("/api/worlds/:worldId/quest-chains", async (req, res) => {
    try {
      const { worldId } = req.params;
      const { questChainManager } = await import('./services/quest-chain-manager.js');

      const chains = await questChainManager.getQuestChains(worldId);
      res.json({ chains });
    } catch (error) {
      console.error('[Quest Chains] Error:', error);
      res.status(500).json({ error: "Failed to fetch quest chains" });
    }
  });

  app.get("/api/quest-chains/:chainId/progress/:playerId", async (req, res) => {
    try {
      const { chainId, playerId } = req.params;
      const { worldId } = req.query;

      if (!worldId) {
        return res.status(400).json({ error: "worldId query parameter required" });
      }

      const { questChainManager } = await import('./services/quest-chain-manager.js');
      const progress = await questChainManager.getChainProgress(
        chainId,
        worldId as string,
        playerId
      );

      res.json({ progress });
    } catch (error) {
      console.error('[Quest Chain Progress] Error:', error);
      res.status(500).json({ error: "Failed to fetch chain progress" });
    }
  });

  // Ensemble truth file import
  app.post("/api/worlds/:worldId/truth/import-ensemble", async (req, res) => {
    try {
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ error: "Missing truth file content" });
      }

      // Parse Ensemble truth format
      let truthData;
      try {
        truthData = JSON.parse(content);
      } catch (parseError) {
        return res.status(400).json({ error: "Invalid JSON format" });
      }

      const importedEntries = [];

      // Handle Ensemble history format: { history: [{ pos: 0, data: [...] }] }
      if (truthData.history && Array.isArray(truthData.history)) {
        console.log(`Importing Ensemble history with ${truthData.history.length} timesteps`);
        
        // Fetch all characters in this world to match names
        const worldCharacters = await storage.getCharactersByWorld(req.params.worldId);
        console.log(`Found ${worldCharacters.length} characters in world for name matching`);
        
        // Create a map of character names to IDs (case-insensitive)
        const characterNameMap = new Map<string, string>();
        worldCharacters.forEach(char => {
          const fullName = `${char.firstName} ${char.lastName}`.toLowerCase();
          const firstName = char.firstName.toLowerCase();
          characterNameMap.set(fullName, char.id);
          characterNameMap.set(firstName, char.id);
        });
        
        for (const historyEntry of truthData.history) {
          const timestep = historyEntry.pos || 0;
          const dataItems = historyEntry.data || [];
          
          console.log(`Processing timestep ${timestep} with ${dataItems.length} items`);
          
          for (const item of dataItems) {
            // Try to find matching character IDs for both first and second
            let firstCharacterId: string | null = null;
            let secondCharacterId: string | null = null;
            
            if (item.first) {
              const firstNameLower = item.first.toLowerCase();
              firstCharacterId = characterNameMap.get(firstNameLower) || null;
              if (firstCharacterId) {
                console.log(`Matched character "${item.first}" to ID ${firstCharacterId}`);
              }
            }
            
            if (item.second) {
              const secondNameLower = item.second.toLowerCase();
              secondCharacterId = characterNameMap.get(secondNameLower) || null;
              if (secondCharacterId) {
                console.log(`Matched character "${item.second}" to ID ${secondCharacterId}`);
              }
            }
            
            // Build a descriptive title and content
            let title = "";
            let content = "";
            
            if (item.category === "trait") {
              title = `${item.type} trait`;
              content = `${item.first || 'Character'} has the ${item.type} trait (value: ${item.value})`;
            } else if (item.category === "relationship") {
              title = `${item.type} relationship`;
              content = `${item.first || 'Character 1'} and ${item.second || 'Character 2'} have a ${item.type} relationship (value: ${item.value})`;
            } else if (item.category === "status") {
              title = `Status: ${item.type}`;
              content = `${item.first || 'Character'} status: ${item.type} = ${item.value}`;
            } else if (item.category === "language") {
              title = `${item.type} fluency`;
              content = `${item.first || 'Character'} has ${item.value}/100 fluency in ${item.type}`;
            } else {
              title = `${item.category || 'Event'}: ${item.type || 'Unknown'}`;
              content = JSON.stringify(item, null, 2);
            }
            
            // Collect all related character IDs
            const relatedCharacterIds = [firstCharacterId, secondCharacterId].filter(Boolean) as string[];
            
            // For traits, status, and language: create entry for the subject (first) character
            if (item.category === "trait" || item.category === "status" || item.category === "language") {
              if (firstCharacterId) {
                const entry = await storage.createTruth({
                  worldId: req.params.worldId,
                  characterId: firstCharacterId,
                  title: title,
                  content: content,
                  entryType: item.category || "event",
                  timestep: timestep,
                  timestepDuration: 1,
                  timeYear: null,
                  timeSeason: null,
                  timeDescription: `Timestep ${timestep}`,
                  relatedCharacterIds: relatedCharacterIds.length > 0 ? relatedCharacterIds : null,
                  relatedLocationIds: null,
                  tags: [item.category, item.type].filter(Boolean),
                  importance: 5,
                  isPublic: true,
                  source: "imported_ensemble_history",
                  sourceData: item,
                });
                importedEntries.push(entry);
              }
            } 
            // For relationships: create entries for BOTH characters
            else if (item.category === "relationship") {
              // Create entry for first character
              if (firstCharacterId) {
                const entry1 = await storage.createTruth({
                  worldId: req.params.worldId,
                  characterId: firstCharacterId,
                  title: title,
                  content: content,
                  entryType: item.category || "event",
                  timestep: timestep,
                  timestepDuration: 1,
                  timeYear: null,
                  timeSeason: null,
                  timeDescription: `Timestep ${timestep}`,
                  relatedCharacterIds: relatedCharacterIds.length > 0 ? relatedCharacterIds : null,
                  relatedLocationIds: null,
                  tags: [item.category, item.type].filter(Boolean),
                  importance: 5,
                  isPublic: true,
                  source: "imported_ensemble_history",
                  sourceData: item,
                });
                importedEntries.push(entry1);
              }
              
              // Create entry for second character
              if (secondCharacterId) {
                const entry2 = await storage.createTruth({
                  worldId: req.params.worldId,
                  characterId: secondCharacterId,
                  title: title,
                  content: content,
                  entryType: item.category || "event",
                  timestep: timestep,
                  timestepDuration: 1,
                  timeYear: null,
                  timeSeason: null,
                  timeDescription: `Timestep ${timestep}`,
                  relatedCharacterIds: relatedCharacterIds.length > 0 ? relatedCharacterIds : null,
                  relatedLocationIds: null,
                  tags: [item.category, item.type].filter(Boolean),
                  importance: 5,
                  isPublic: true,
                  source: "imported_ensemble_history",
                  sourceData: item,
                });
                importedEntries.push(entry2);
              }
            }
            // For other categories: create a single world-level entry
            else {
              const entry = await storage.createTruth({
                worldId: req.params.worldId,
                characterId: firstCharacterId, // Use first character if available
                title: title,
                content: content,
                entryType: item.category || "event",
                timestep: timestep,
                timestepDuration: 1,
                timeYear: null,
                timeSeason: null,
                timeDescription: `Timestep ${timestep}`,
                relatedCharacterIds: relatedCharacterIds.length > 0 ? relatedCharacterIds : null,
                relatedLocationIds: null,
                tags: [item.category, item.type].filter(Boolean),
                importance: 5,
                isPublic: true,
                source: "imported_ensemble_history",
                sourceData: item,
              });
              importedEntries.push(entry);
            }
          }
        }
      } 
      // Handle direct array format (legacy or custom)
      else if (Array.isArray(truthData)) {
        console.log(`Importing direct array with ${truthData.length} items`);
        
        for (const item of truthData) {
          const entry = await storage.createTruth({
            worldId: req.params.worldId,
            characterId: item.characterId || null,
            title: item.title || item.name || "Untitled Event",
            content: item.content || item.description || "",
            entryType: item.type || "event",
            timestep: item.timestep || 0,
            timestepDuration: item.timestepDuration || null,
            timeYear: item.year || null,
            timeSeason: item.season || null,
            timeDescription: item.timeDescription || null,
            relatedCharacterIds: item.relatedCharacters || [],
            relatedLocationIds: item.relatedLocations || [],
            tags: item.tags || [],
            importance: item.importance || 5,
            isPublic: item.isPublic !== false,
            source: "imported_ensemble",
            sourceData: item,
          });
          importedEntries.push(entry);
        }
      } else {
        return res.status(400).json({ error: "Unrecognized truth data format" });
      }

      console.log(`Successfully imported ${importedEntries.length} Truths`);

      res.json({
        message: "Truth imported successfully",
        count: importedEntries.length,
        entries: importedEntries,
      });
    } catch (error) {
      console.error("Failed to import Ensemble truth:", error);
      res.status(500).json({ error: "Failed to import truth" });
    }
  });

  // ============================================================================
  // PREDICATE SCHEMA API (Phase 1: Core Schema Loading)
  // ============================================================================
  
  const { predicateDiscovery } = await import("./services/predicate-discovery.js");

  // Get all predicates (for autocomplete and documentation)
  app.get("/api/predicates", async (req, res) => {
    try {
      const predicates = await predicateDiscovery.getAllPredicates();
      
      res.json({
        count: predicates.length,
        predicates: predicates.map(p => ({
          name: p.name,
          arity: p.arity,
          description: p.description,
          category: p.category,
          examples: p.examples,
          source: p.source,
          builtIn: p.builtIn || false,
          usageCount: p.usageCount,
          confidence: p.confidence,
          args: p.args
        }))
      });
    } catch (error) {
      console.error("Failed to fetch predicates:", error);
      res.status(500).json({ error: "Failed to fetch predicates" });
    }
  });

  // Get predicates by name (all arities)
  app.get("/api/predicates/name/:name", async (req, res) => {
    try {
      const predicates = await predicateDiscovery.getPredicatesByName(req.params.name);
      
      if (predicates.length === 0) {
        return res.status(404).json({ error: `Predicate '${req.params.name}' not found` });
      }
      
      res.json({
        name: req.params.name,
        variants: predicates.map(p => ({
          arity: p.arity,
          description: p.description,
          examples: p.examples,
          source: p.source,
          usageCount: p.usageCount,
          args: p.args
        }))
      });
    } catch (error) {
      console.error("Failed to fetch predicate info:", error);
      res.status(500).json({ error: "Failed to fetch predicate info" });
    }
  });

  // Get predicate by exact name and arity
  app.get("/api/predicates/:name/:arity", async (req, res) => {
    try {
      const arity = parseInt(req.params.arity);
      if (isNaN(arity)) {
        return res.status(400).json({ error: "Arity must be a number" });
      }
      
      const predicate = await predicateDiscovery.getPredicate(req.params.name, arity);
      
      if (!predicate) {
        // Try to find similar predicates for helpful error message
        const similar = await predicateDiscovery.findSimilar(req.params.name);
        return res.status(404).json({ 
          error: `Predicate '${req.params.name}/${arity}' not found`,
          suggestions: similar.length > 0 ? similar : undefined
        });
      }
      
      res.json(predicate);
    } catch (error) {
      console.error("Failed to fetch predicate:", error);
      res.status(500).json({ error: "Failed to fetch predicate" });
    }
  });

  // Get all predicate names
  app.get("/api/predicates/names", async (req, res) => {
    try {
      const names = await predicateDiscovery.getAllPredicateNames();
      res.json({ names });
    } catch (error) {
      console.error("Failed to fetch predicate names:", error);
      res.status(500).json({ error: "Failed to fetch predicate names" });
    }
  });

  // Get all categories
  app.get("/api/predicates/categories", async (req, res) => {
    try {
      const categories = await predicateDiscovery.getCategories();
      res.json({ categories });
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Get predicates by category
  app.get("/api/predicates/category/:category", async (req, res) => {
    try {
      const predicates = await predicateDiscovery.getPredicatesByCategory(req.params.category);
      res.json({
        category: req.params.category,
        count: predicates.length,
        predicates
      });
    } catch (error) {
      console.error("Failed to fetch predicates by category:", error);
      res.status(500).json({ error: "Failed to fetch predicates by category" });
    }
  });

  // Find similar predicates (spell check)
  app.get("/api/predicates/similar/:name", async (req, res) => {
    try {
      const maxDistance = req.query.maxDistance ? parseInt(req.query.maxDistance as string) : 2;
      const similar = await predicateDiscovery.findSimilar(req.params.name, maxDistance);
      
      res.json({
        query: req.params.name,
        suggestions: similar
      });
    } catch (error) {
      console.error("Failed to find similar predicates:", error);
      res.status(500).json({ error: "Failed to find similar predicates" });
    }
  });

  // Reload schemas (useful for development)
  app.post("/api/predicates/reload", async (req, res) => {
    try {
      await predicateDiscovery.reload();
      const predicates = await predicateDiscovery.getAllPredicates();
      
      res.json({ 
        message: "Schemas reloaded successfully",
        count: predicates.length
      });
    } catch (error) {
      console.error("Failed to reload schemas:", error);
      res.status(500).json({ error: "Failed to reload schemas" });
    }
  });

  // ============================================================================
  // PREDICATE VALIDATION API (Phase 3: Non-Blocking Validation)
  // ============================================================================
  
  const { PredicateValidator } = await import("./services/predicate-validator.js");
  const validator = new PredicateValidator(predicateDiscovery);

  // Validate rule content (non-blocking, returns warnings)
  app.post("/api/rules/validate", async (req, res) => {
    try {
      const { content } = req.body;
      
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: "Rule content is required" });
      }
      
      const result = await validator.validateRule(content);
      
      res.json({
        valid: true,  // Always true - never blocks
        warnings: result.warnings,
        predicatesFound: result.predicatesFound,
        unknownPredicates: result.unknownPredicates
      });
    } catch (error) {
      console.error("Validation failed:", error);
      res.status(500).json({ error: "Validation failed" });
    }
  });

  // Get autocomplete suggestions for partial predicate name
  app.get("/api/predicates/autocomplete/:partial", async (req, res) => {
    try {
      const maxResults = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const suggestions = await validator.getAutocompleteSuggestions(req.params.partial, maxResults);
      
      res.json({
        query: req.params.partial,
        suggestions
      });
    } catch (error) {
      console.error("Failed to get autocomplete suggestions:", error);
      res.status(500).json({ error: "Failed to get autocomplete suggestions" });
    }
  });

  // Get detailed help for a predicate
  app.get("/api/predicates/help/:name", async (req, res) => {
    try {
      const help = await validator.getPredicateHelp(req.params.name);
      
      if (!help) {
        return res.status(404).json({ error: `No help available for predicate '${req.params.name}'` });
      }
      
      res.json(help);
    } catch (error) {
      console.error("Failed to get predicate help:", error);
      res.status(500).json({ error: "Failed to get predicate help" });
    }
  });

  // Validate multiple rules at once
  app.post("/api/rules/validate-batch", async (req, res) => {
    try {
      const { rules } = req.body;
      
      if (!Array.isArray(rules)) {
        return res.status(400).json({ error: "Rules array is required" });
      }
      
      const results = await validator.validateRules(rules);
      
      res.json({
        totalRules: rules.length,
        results: Object.fromEntries(results.entries())
      });
    } catch (error) {
      console.error("Batch validation failed:", error);
      res.status(500).json({ error: "Batch validation failed" });
    }
  });

  // ============================================================================
  // PREDICATE DISCOVERY API (Phase 2: Auto-Discovery)
  // ============================================================================

  // Trigger predicate discovery for a specific world
  app.post("/api/worlds/:id/discover-predicates", async (req, res) => {
    try {
      const result = await predicateDiscovery.discoverPredicatesInWorld(req.params.id);
      
      res.json({
        message: "Predicate discovery complete",
        worldId: req.params.id,
        newPredicates: result.newPredicates,
        updatedPredicates: result.updatedPredicates,
        totalPredicates: result.totalPredicates
      });
    } catch (error) {
      console.error("Failed to discover predicates:", error);
      res.status(500).json({ error: "Failed to discover predicates" });
    }
  });

  // Trigger global predicate discovery (all worlds)
  app.post("/api/predicates/discover-global", async (req, res) => {
    try {
      const result = await predicateDiscovery.discoverPredicatesGlobally();
      
      res.json({
        message: "Global predicate discovery complete",
        worldsScanned: result.worldsScanned,
        totalPredicates: result.totalPredicates
      });
    } catch (error) {
      console.error("Failed to discover predicates globally:", error);
      res.status(500).json({ error: "Failed to discover predicates globally" });
    }
  });

  // ============================================================================
  // PREDICATE ENHANCEMENTS API (Phase 5: Annotations, Strict Mode, Export)
  // ============================================================================

  const { PredicateDocumentationExporter } = await import("./services/predicate-documentation.js");
  const docExporter = new PredicateDocumentationExporter(predicateDiscovery);

  // Add or update world-specific annotation
  app.post("/api/worlds/:worldId/predicates/:name/:arity/annotate", async (req, res) => {
    try {
      const { worldId, name, arity } = req.params;
      const { description, category, examples, addedBy } = req.body;
      
      await predicateDiscovery.annotate({
        predicateName: name,
        arity: parseInt(arity),
        worldId,
        description,
        category,
        examples,
        addedBy
      });
      
      res.json({
        message: "Annotation added successfully",
        predicate: `${name}/${arity}`,
        worldId
      });
    } catch (error) {
      console.error("Failed to add annotation:", error);
      res.status(500).json({ error: "Failed to add annotation" });
    }
  });

  // Get annotation for a predicate in a world
  app.get("/api/worlds/:worldId/predicates/:name/:arity/annotation", async (req, res) => {
    try {
      const { worldId, name, arity } = req.params;
      const annotation = predicateDiscovery.getAnnotation(worldId, name, parseInt(arity));
      
      if (!annotation) {
        return res.status(404).json({ error: "Annotation not found" });
      }
      
      res.json(annotation);
    } catch (error) {
      console.error("Failed to get annotation:", error);
      res.status(500).json({ error: "Failed to get annotation" });
    }
  });

  // Get all annotations for a world
  app.get("/api/worlds/:worldId/annotations", async (req, res) => {
    try {
      const annotations = predicateDiscovery.getWorldAnnotations(req.params.worldId);
      res.json({ annotations });
    } catch (error) {
      console.error("Failed to get annotations:", error);
      res.status(500).json({ error: "Failed to get annotations" });
    }
  });

  // Delete annotation
  app.delete("/api/worlds/:worldId/predicates/:name/:arity/annotation", async (req, res) => {
    try {
      const { worldId, name, arity } = req.params;
      const deleted = predicateDiscovery.deleteAnnotation(worldId, name, parseInt(arity));
      
      if (!deleted) {
        return res.status(404).json({ error: "Annotation not found" });
      }
      
      res.json({ message: "Annotation deleted successfully" });
    } catch (error) {
      console.error("Failed to delete annotation:", error);
      res.status(500).json({ error: "Failed to delete annotation" });
    }
  });

  // Update validation configuration
  app.post("/api/validation/config", async (req, res) => {
    try {
      validator.setConfig(req.body);
      res.json({
        message: "Validation configuration updated",
        config: validator.getConfig()
      });
    } catch (error) {
      console.error("Failed to update config:", error);
      res.status(500).json({ error: "Failed to update validation config" });
    }
  });

  // Get validation configuration
  app.get("/api/validation/config", async (req, res) => {
    try {
      res.json({ config: validator.getConfig() });
    } catch (error) {
      console.error("Failed to get config:", error);
      res.status(500).json({ error: "Failed to get validation config" });
    }
  });

  // Export documentation
  app.get("/api/predicates/export/:format", async (req, res) => {
    try {
      const format = req.params.format as 'markdown' | 'html' | 'json';
      const worldId = req.query.worldId as string | undefined;
      
      if (!['markdown', 'html', 'json'].includes(format)) {
        return res.status(400).json({ error: "Invalid format. Use: markdown, html, or json" });
      }
      
      const documentation = await docExporter.exportDocumentation(format, worldId);
      
      // Set appropriate content type
      const contentType = {
        markdown: 'text/markdown',
        html: 'text/html',
        json: 'application/json'
      }[format];
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="predicates.${format}"`);
      res.send(documentation);
    } catch (error) {
      console.error("Failed to export documentation:", error);
      res.status(500).json({ error: "Failed to export documentation" });
    }
  });

  // ============= VISUAL ASSETS & IMAGE GENERATION =============

  // Import visual asset generator
  const { visualAssetGenerator } = await import('./services/visual-asset-generator.js');
  const { imageGenerator } = await import('./services/image-generation.js');

  // Get all visual assets (across all worlds and collections)
  app.get("/api/assets", async (req, res) => {
    try {
      const { ids } = req.query;
      
      let assets;
      if (ids && typeof ids === 'string') {
        // Fetch specific assets by IDs
        const idArray = ids.split(',');
        assets = await Promise.all(
          idArray.map(id => storage.getVisualAsset(id))
        );
        assets = assets.filter(Boolean); // Remove any null results
      } else {
        // Fetch all assets
        assets = await storage.getAllVisualAssets();
      }

      res.json(assets);
    } catch (error: any) {
      console.error("Failed to get all visual assets:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get available image generation providers
  app.get("/api/assets/providers", async (req, res) => {
    try {
      const providers = await imageGenerator.getAvailableProviders();
      res.json({ providers });
    } catch (error: any) {
      console.error("Failed to get providers:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get all visual assets for a world
  // Also merges in assets from the world's selected asset collection
  // (base collection assets have no worldId, so they must be fetched separately)
  app.get("/api/worlds/:worldId/assets", async (req, res) => {
    try {
      const { worldId } = req.params;
      const { assetType } = req.query;

      let assets;
      if (assetType) {
        assets = await storage.getVisualAssetsByType(worldId, assetType as string);
      } else {
        assets = await storage.getVisualAssetsByWorld(worldId);
      }

      // Merge in assets from the world's selected asset collection
      // This ensures base/shared collection assets are available to BabylonGame
      try {
        const world = await storage.getWorld(worldId);
        const collectionId = (world as any)?.selectedAssetCollectionId;
        if (collectionId) {
          const collection = await storage.getAssetCollection(collectionId);
          if (collection?.assetIds && Array.isArray(collection.assetIds) && collection.assetIds.length > 0) {
            // Get IDs that aren't already in the world assets
            const existingIds = new Set(assets.map((a: any) => a.id));
            const missingIds = (collection.assetIds as string[]).filter(id => !existingIds.has(id));
            
            if (missingIds.length > 0) {
              const collectionAssets = await storage.getVisualAssetsByIds(missingIds);
              assets = [...assets, ...collectionAssets];
            }
          }
        }
      } catch (collectionError) {
        // Non-fatal: world assets still work, just without collection assets
        console.warn(`Failed to merge collection assets for world ${worldId}:`, collectionError);
      }

      res.json(assets);
    } catch (error: any) {
      console.error("Failed to get visual assets:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get visual assets for a specific entity
  app.get("/api/assets/:entityType/:entityId", async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const assets = await storage.getVisualAssetsByEntity(entityId, entityType);
      res.json(assets);
    } catch (error: any) {
      console.error("Failed to get entity assets:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get a specific visual asset
  app.get("/api/assets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const asset = await storage.getVisualAsset(id);
      if (!asset) {
        return res.status(404).json({ error: "Asset not found" });
      }
      res.json(asset);
    } catch (error: any) {
      console.error("Failed to get visual asset:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create/register a Visual Asset for a world (used for 3D models and manual uploads)
  app.post("/api/worlds/:worldId/model-assets", async (req, res) => {
    try {
      const { worldId } = req.params;
      const world = await storage.getWorld(worldId);
      if (!world) {
        return res.status(404).json({ error: "World not found" });
      }

      const assetData = insertVisualAssetSchema.parse({
        ...req.body,
        worldId,
      });

      const asset = await storage.createVisualAsset(assetData);
      res.status(201).json(asset);
    } catch (error: any) {
      console.error("Failed to create model asset:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid asset data", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Generate character portrait
  app.post("/api/characters/:characterId/generate-portrait", async (req, res) => {
    try {
      const { characterId } = req.params;
      const { provider = 'flux', params } = req.body;

      const assetId = await visualAssetGenerator.generateCharacterPortrait(
        characterId,
        provider,
        params
      );

      const asset = await storage.getVisualAsset(assetId);
      res.json(asset);
    } catch (error: any) {
      console.error("Failed to generate character portrait:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate character portrait variants
  app.post("/api/characters/:characterId/generate-portrait-variants", async (req, res) => {
    try {
      const { characterId } = req.params;
      const { provider = 'flux', variantCount = 3, params } = req.body;

      const assetIds = await visualAssetGenerator.generateCharacterPortraitVariants(
        characterId,
        provider,
        variantCount,
        params
      );

      const assets = await Promise.all(
        assetIds.map(id => storage.getVisualAsset(id))
      );

      res.json({ assetIds, assets, count: assets.length });
    } catch (error: any) {
      console.error("Failed to generate character portrait variants:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate character texture/skin for 3D models
  app.post("/api/characters/:characterId/generate-texture", async (req, res) => {
    try {
      const { characterId } = req.params;
      const { 
        textureType = 'face', 
        artStyle = 'stylized', 
        provider = 'flux', 
        params 
      } = req.body;

      const assetId = await visualAssetGenerator.generateCharacterTexture(
        characterId,
        textureType,
        artStyle,
        provider,
        params
      );

      const asset = await storage.getVisualAsset(assetId);
      res.json(asset);
    } catch (error: any) {
      console.error("Failed to generate character texture:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Batch generate all character textures (face, body, clothing)
  app.post("/api/characters/:characterId/generate-textures", async (req, res) => {
    try {
      const { characterId } = req.params;
      const { artStyle = 'stylized', provider = 'flux', params } = req.body;

      const assetIds = await visualAssetGenerator.batchGenerateCharacterTextures(
        characterId,
        artStyle,
        provider,
        params
      );

      const assets = await Promise.all(
        assetIds.map(id => storage.getVisualAsset(id))
      );

      res.json({ assetIds, assets, count: assets.length });
    } catch (error: any) {
      console.error("Failed to generate character textures:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete visual asset (for variant cleanup)
  app.delete("/api/assets/:assetId", async (req, res) => {
    try {
      const { assetId } = req.params;
      await storage.deleteVisualAsset(assetId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Failed to delete asset:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate building exterior
  app.post("/api/businesses/:businessId/generate-exterior", async (req, res) => {
    try {
      const { businessId } = req.params;
      const { provider = 'flux', params } = req.body;

      const assetId = await visualAssetGenerator.generateBuildingExterior(
        businessId,
        provider,
        params
      );

      const asset = await storage.getVisualAsset(assetId);
      res.json(asset);
    } catch (error: any) {
      console.error("Failed to generate building exterior:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate settlement map
  app.post("/api/settlements/:settlementId/generate-map", async (req, res) => {
    try {
      const { settlementId } = req.params;
      const { mapType = 'terrain', provider = 'flux', params } = req.body;

      const assetId = await visualAssetGenerator.generateSettlementMap(
        settlementId,
        mapType,
        provider,
        params
      );

      const asset = await storage.getVisualAsset(assetId);
      res.json(asset);
    } catch (error: any) {
      console.error("Failed to generate settlement map:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate world overview map
  app.post("/api/worlds/:worldId/generate-world-map", async (req, res) => {
    try {
      const { worldId } = req.params;
      const { mapStyle = 'fantasy', provider = 'flux', params } = req.body;

      const assetId = await visualAssetGenerator.generateWorldMap(
        worldId,
        mapStyle,
        provider,
        params
      );

      const asset = await storage.getVisualAsset(assetId);
      res.json(asset);
    } catch (error: any) {
      console.error("Failed to generate world map:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate texture (legacy endpoint)
  app.post("/api/worlds/:worldId/generate-texture", async (req, res) => {
    try {
      const { worldId } = req.params;
      const { textureType, material, style, provider = 'flux', params } = req.body;

      if (!textureType || !material) {
        return res.status(400).json({ error: "textureType and material are required" });
      }

      const assetId = await visualAssetGenerator.generateTexture(
        worldId,
        textureType,
        material,
        provider,
        style,
        params
      );

      const asset = await storage.getVisualAsset(assetId);
      res.json(asset);
    } catch (error: any) {
      console.error("Failed to generate texture:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============= ENHANCED TEXTURE GENERATION =============
  const { textureGenerator } = await import('./services/texture-generator.js');

  // Get available texture presets for a world style
  app.get("/api/textures/presets", async (req, res) => {
    try {
      const { worldStyle = 'generic' } = req.query;
      const presets = textureGenerator.getTexturePresets(worldStyle as any);
      const styles = textureGenerator.getWorldStyles();
      res.json({ presets, styles, currentStyle: worldStyle });
    } catch (error: any) {
      console.error("Failed to get texture presets:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate AI texture with advanced options
  app.post("/api/textures/generate", async (req, res) => {
    try {
      const {
        worldId,
        category,
        material,
        worldStyle,
        provider = 'flux',
        quality = 'high',
        size = 1024,
        seamless = true,
        weathered = false,
        damaged = false,
        customPrompt,
        negativePrompt,
      } = req.body;

      if (!worldId || !category || !material) {
        return res.status(400).json({ 
          error: "worldId, category, and material are required",
          example: {
            worldId: "world-id-here",
            category: "ground|wall|material|ceiling|road|nature",
            material: "stone tiles",
            worldStyle: "medieval-fantasy",
            provider: "flux|dalle|stable-diffusion",
            quality: "standard|high|ultra",
            size: 1024,
            seamless: true,
            weathered: false,
            damaged: false,
          }
        });
      }

      const assetId = await textureGenerator.generateTexture({
        worldId,
        category,
        material,
        worldStyle,
        provider,
        quality,
        size,
        seamless,
        weathered,
        damaged,
        customPrompt,
        negativePrompt,
      });

      const asset = await storage.getVisualAsset(assetId);
      res.json(asset);
    } catch (error: any) {
      console.error("Failed to generate AI texture:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate a set of textures from presets
  app.post("/api/textures/generate-set", async (req, res) => {
    try {
      const {
        worldId,
        worldStyle = 'generic',
        provider = 'flux',
        presetNames,
      } = req.body;

      if (!worldId) {
        return res.status(400).json({ error: "worldId is required" });
      }

      const assetIds = await textureGenerator.generateTextureSet(
        worldId,
        worldStyle,
        provider,
        presetNames
      );

      const assets = await Promise.all(
        assetIds.map(id => storage.getVisualAsset(id))
      );

      res.json({ 
        assetIds, 
        assets: assets.filter(Boolean),
        count: assetIds.length 
      });
    } catch (error: any) {
      console.error("Failed to generate texture set:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Batch generate character portraits
  app.post("/api/worlds/:worldId/batch-generate-portraits", async (req, res) => {
    try {
      const { worldId } = req.params;
      const { provider = 'flux', params } = req.body;

      const assetIds = await visualAssetGenerator.batchGenerateCharacterPortraits(
        worldId,
        provider,
        params
      );

      res.json({ assetIds, count: assetIds.length });
    } catch (error: any) {
      console.error("Failed to batch generate portraits:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Batch generate building exteriors
  app.post("/api/worlds/:worldId/batch-generate-buildings", async (req, res) => {
    try {
      const { worldId } = req.params;
      const { provider = 'flux', params } = req.body;

      const assetIds = await visualAssetGenerator.batchGenerateBuildingExteriors(
        worldId,
        provider,
        params
      );

      res.json({ assetIds, count: assetIds.length });
    } catch (error: any) {
      console.error("Failed to batch generate buildings:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Batch generate settlement maps
  app.post("/api/worlds/:worldId/batch-generate-maps", async (req, res) => {
    try {
      const { worldId } = req.params;
      const { provider = 'flux', params } = req.body;

      // Get all settlements in the world
      const settlements = await storage.getSettlements(worldId);
      const assetIds: string[] = [];

      // Generate maps for each settlement
      for (const settlement of settlements) {
        const settlementAssetIds = await visualAssetGenerator.batchGenerateSettlementMaps(
          settlement.id,
          provider,
          params
        );
        assetIds.push(...settlementAssetIds);
      }

      res.json({ assetIds, count: assetIds.length });
    } catch (error: any) {
      console.error("Failed to batch generate maps:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate character sprite sheet
  app.post("/api/characters/:characterId/generate-sprite", async (req, res) => {
    try {
      const { characterId } = req.params;
      const {
        animationType = 'walk',
        viewAngle = 'side',
        frameCount = 8,
        provider = 'flux',
        params
      } = req.body;

      const assetId = await visualAssetGenerator.generateCharacterSprite(
        characterId,
        animationType,
        viewAngle,
        frameCount,
        provider,
        params
      );

      const asset = await storage.getVisualAsset(assetId);
      res.json(asset);
    } catch (error: any) {
      console.error("Failed to generate character sprite:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Batch generate all sprite animations for a character
  app.post("/api/characters/:characterId/generate-all-sprites", async (req, res) => {
    try {
      const { characterId } = req.params;
      const { viewAngle = 'side', provider = 'flux', params } = req.body;

      const assetIds = await visualAssetGenerator.batchGenerateCharacterSprites(
        characterId,
        viewAngle,
        provider,
        params
      );

      res.json({ assetIds, count: assetIds.length });
    } catch (error: any) {
      console.error("Failed to batch generate character sprites:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate single artifact image
  app.post("/api/worlds/:worldId/artifacts/:artifactId/generate-image", async (req, res) => {
    try {
      const { worldId, artifactId } = req.params;
      const { provider = 'flux', params } = req.body;

      // Get world to access artifacts
      const world = await storage.getWorld(worldId);
      if (!world) {
        return res.status(404).json({ error: "World not found" });
      }

      const customData = (world as any).customData || {};
      const artifacts = customData.artifacts as Record<string, any> || {};
      const artifact = artifacts[artifactId];

      if (!artifact) {
        return res.status(404).json({ error: "Artifact not found" });
      }

      const assetId = await visualAssetGenerator.generateArtifactImage(
        worldId,
        artifactId,
        artifact.type,
        artifact.name,
        artifact.description,
        provider,
        params
      );

      const asset = await storage.getVisualAsset(assetId);
      res.json(asset);
    } catch (error: any) {
      console.error("Failed to generate artifact image:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Batch generate artifact images
  app.post("/api/worlds/:worldId/batch-generate-artifacts", async (req, res) => {
    try {
      const { worldId } = req.params;
      const { provider = 'flux', params } = req.body;

      const assetIds = await visualAssetGenerator.batchGenerateArtifactImages(
        worldId,
        provider,
        params
      );

      res.json({ assetIds, count: assetIds.length });
    } catch (error: any) {
      console.error("Failed to batch generate artifacts:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get all artifacts in a world
  app.get("/api/worlds/:worldId/artifacts", async (req, res) => {
    try {
      const { worldId } = req.params;

      const world = await storage.getWorld(worldId);
      if (!world) {
        return res.status(404).json({ error: "World not found" });
      }

      const customData = (world as any).customData || {};
      const artifacts = customData.artifacts as Record<string, any> || {};
      const artifactList = Object.values(artifacts).filter((a: any) => !a.destroyed);

      res.json(artifactList);
    } catch (error: any) {
      console.error("Failed to get artifacts:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get world stats (for batch generation UI)
  app.get("/api/worlds/:worldId/stats", async (req, res) => {
    try {
      const { worldId } = req.params;

      const characters = await storage.getCharacters(worldId);
      const businesses = await storage.getBusinessesByWorld(worldId);
      const settlements = await storage.getSettlements(worldId);

      // Get artifact count
      const world = await storage.getWorld(worldId);
      const customData = (world as any)?.customData || {};
      const artifacts = customData.artifacts as Record<string, any> || {};
      const artifactCount = Object.values(artifacts).filter((a: any) => !a.destroyed).length;

      res.json({
        characters: characters.length,
        businesses: businesses.length,
        settlements: settlements.length,
        artifacts: artifactCount,
      });
    } catch (error: any) {
      console.error("Failed to get world stats:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get generation jobs for a world
  app.get("/api/worlds/:worldId/generation-jobs", async (req, res) => {
    try {
      const { worldId } = req.params;
      const { status } = req.query;

      let jobs;
      if (status) {
        jobs = await storage.getGenerationJobsByStatus(worldId, status as string);
      } else {
        jobs = await storage.getGenerationJobsByWorld(worldId);
      }

      res.json(jobs);
    } catch (error: any) {
      console.error("Failed to get generation jobs:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get generation job status
  app.get("/api/generation-jobs/:jobId", async (req, res) => {
    try {
      const { jobId } = req.params;
      const job = await storage.getGenerationJob(jobId);

      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      res.json(job);
    } catch (error: any) {
      console.error("Failed to get generation job:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Cancel a generation job
  app.post("/api/generation-jobs/:jobId/cancel", async (req, res) => {
    try {
      const { jobId } = req.params;
      const { jobQueueManager } = await import('./services/job-queue-manager.js');

      await jobQueueManager.cancelJob(jobId);
      const job = await storage.getGenerationJob(jobId);

      res.json(job);
    } catch (error: any) {
      console.error("Failed to cancel generation job:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get queue status for a world
  app.get("/api/worlds/:worldId/queue-status", async (req, res) => {
    try {
      const { worldId } = req.params;
      const { jobQueueManager } = await import('./services/job-queue-manager.js');

      const status = await jobQueueManager.getQueueStatus(worldId);
      res.json(status);
    } catch (error: any) {
      console.error("Failed to get queue status:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Queue batch portrait generation for settlement
  app.post("/api/settlements/:settlementId/queue-batch-portraits", async (req, res) => {
    try {
      const { settlementId } = req.params;
      const { provider = 'flux', params } = req.body;

      // Get all characters in the settlement
      const settlement = await storage.getSettlement(settlementId);
      if (!settlement) {
        return res.status(404).json({ error: "Settlement not found" });
      }

      const characters = await storage.getCharacters(settlement.worldId);
      const settlementCharacters = characters.filter(c =>
        c.residenceId && c.residenceId === settlementId
      );

      if (settlementCharacters.length === 0) {
        return res.status(400).json({ error: "No characters found in settlement" });
      }

      const targetEntityIds = settlementCharacters.map(c => c.id);

      // Create batch generation job
      const job = await storage.createGenerationJob({
        worldId: settlement.worldId,
        jobType: 'batch_generation',
        assetType: 'character_portrait',
        targetEntityId: settlementId,
        targetEntityType: 'settlement',
        prompt: `Batch generate portraits for ${settlementCharacters.length} characters in ${settlement.name}`,
        generationProvider: provider,
        generationParams: {
          ...params,
          targetEntityIds,
        },
        batchSize: settlementCharacters.length,
        status: 'queued',
      });

      res.json({
        job,
        characterCount: settlementCharacters.length,
        message: `Queued batch generation for ${settlementCharacters.length} character portraits`,
      });
    } catch (error: any) {
      console.error("Failed to queue batch portrait generation:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Queue batch building exterior generation
  app.post("/api/settlements/:settlementId/queue-batch-buildings", async (req, res) => {
    try {
      const { settlementId } = req.params;
      const { provider = 'flux', params } = req.body;

      const settlement = await storage.getSettlement(settlementId);
      if (!settlement) {
        return res.status(404).json({ error: "Settlement not found" });
      }

      const businesses = await storage.getBusinesses(settlement.worldId);
      const settlementBusinesses = businesses.filter(b => b.settlementId === settlementId);

      if (settlementBusinesses.length === 0) {
        return res.status(400).json({ error: "No businesses found in settlement" });
      }

      const targetEntityIds = settlementBusinesses.map(b => b.id);

      const job = await storage.createGenerationJob({
        worldId: settlement.worldId,
        jobType: 'batch_generation',
        assetType: 'building_exterior',
        targetEntityId: settlementId,
        targetEntityType: 'settlement',
        prompt: `Batch generate building exteriors for ${settlementBusinesses.length} businesses in ${settlement.name}`,
        generationProvider: provider,
        generationParams: {
          ...params,
          targetEntityIds,
        },
        batchSize: settlementBusinesses.length,
        status: 'queued',
      });

      res.json({
        job,
        buildingCount: settlementBusinesses.length,
        message: `Queued batch generation for ${settlementBusinesses.length} building exteriors`,
      });
    } catch (error: any) {
      console.error("Failed to queue batch building generation:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete visual asset
  app.delete("/api/assets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteVisualAsset(id);

      if (!success) {
        return res.status(404).json({ error: "Asset not found" });
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Failed to delete visual asset:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Archive visual asset (soft delete - keeps file, marks as archived)
  app.post("/api/assets/:id/archive", async (req, res) => {
    try {
      const { id } = req.params;
      const asset = await storage.getVisualAsset(id);

      if (!asset) {
        return res.status(404).json({ error: "Asset not found" });
      }

      const updatedAsset = await storage.updateVisualAsset(id, {
        status: 'archived',
        isActive: false,
      });

      res.json(updatedAsset);
    } catch (error: any) {
      console.error("Failed to archive visual asset:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Restore archived visual asset
  app.post("/api/assets/:id/restore", async (req, res) => {
    try {
      const { id } = req.params;
      const asset = await storage.getVisualAsset(id);

      if (!asset) {
        return res.status(404).json({ error: "Asset not found" });
      }

      const updatedAsset = await storage.updateVisualAsset(id, {
        status: 'completed',
        isActive: true,
      });

      res.json(updatedAsset);
    } catch (error: any) {
      console.error("Failed to restore visual asset:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get generation history for an entity
  app.get("/api/entities/:entityType/:entityId/asset-history", async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const { assetType, includeArchived = 'true' } = req.query;

      let assets: any[] = [];

      // Get all assets for this entity based on entity type
      if (entityType === 'character') {
        assets = await storage.getAssetsByCharacter(entityId);
      } else if (entityType === 'business') {
        assets = await storage.getAssetsByBusiness(entityId);
      } else if (entityType === 'settlement') {
        assets = await storage.getAssetsBySettlement(entityId);
      } else {
        return res.status(400).json({ error: 'Invalid entity type' });
      }

      // Filter by asset type if specified
      if (assetType) {
        assets = assets.filter((a: any) => a.assetType === assetType);
      }

      // Include or exclude archived assets
      if (includeArchived === 'false') {
        assets = assets.filter((a: any) => a.status !== 'archived');
      }

      // Sort by creation date (newest first)
      assets.sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      res.json(assets);
    } catch (error: any) {
      console.error("Failed to get asset history:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get global asset collections (for admin panel)
  app.get("/api/asset-collections", async (req, res) => {
    try {
      const isBase = req.query.isBase === 'true';

      // Return all asset collections (no longer filtered by world)
      let collections = await storage.getAllAssetCollections();

      // Filter by isBase if requested
      if (isBase) {
        collections = collections.filter((c: any) => c.isBase === true);
      }

      res.json(collections);
    } catch (error: any) {
      console.error("Failed to get asset collections:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get asset collections for a world
  app.get("/api/worlds/:worldId/asset-collections", async (req, res) => {
    try {
      const { worldId } = req.params;
      const collections = await storage.getAssetCollectionsByWorld(worldId);
      res.json(collections);
    } catch (error: any) {
      console.error("Failed to get asset collections:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create asset collection
  app.post("/api/asset-collections", async (req, res) => {
    try {
      const collection = await storage.createAssetCollection(req.body);
      res.json(collection);
    } catch (error: any) {
      console.error("Failed to create asset collection:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update asset collection
  app.patch("/api/asset-collections/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const collection = await storage.updateAssetCollection(id, req.body);

      if (!collection) {
        return res.status(404).json({ error: "Collection not found" });
      }

      res.json(collection);
    } catch (error: any) {
      console.error("Failed to update asset collection:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get a single asset collection by ID
  app.get("/api/asset-collections/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const collection = await storage.getAssetCollection(id);

      if (!collection) {
        return res.status(404).json({ error: "Collection not found" });
      }

      res.json(collection);
    } catch (error: any) {
      console.error("Failed to get asset collection:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete an asset collection
  app.delete("/api/asset-collections/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteAssetCollection(id);

      if (!deleted) {
        return res.status(404).json({ error: "Collection not found" });
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Failed to delete asset collection:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Migration endpoint: Assign default collections to all worlds without one
  app.post("/api/asset-collections/migrate-defaults", async (req, res) => {
    try {
      const { assignDefaultCollectionsToAllWorlds } = await import('./services/default-asset-collection.js');
      const result = await assignDefaultCollectionsToAllWorlds();
      
      res.json({
        message: `Successfully assigned default collections to ${result.updated} worlds`,
        updated: result.updated,
        errors: result.errors
      });
    } catch (error: any) {
      console.error("Failed to migrate default collections:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============= POLYHAVEN INTEGRATION =============

  // Import Polyhaven API service
  const polyhavenApi = await import('./services/polyhaven-api.js');

  // Query Polyhaven assets
  app.get("/api/polyhaven/assets", async (req, res) => {
    try {
      const { type, categories } = req.query;
      const assetType = (type as 'models' | 'hdris' | 'textures') || 'models';
      const categoryList = categories ? (categories as string).split(',') : undefined;
      
      const assets = await polyhavenApi.queryPolyhavenAssets(assetType, categoryList);
      res.json(assets);
    } catch (error: any) {
      console.error("Failed to query Polyhaven assets:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Auto-select Polyhaven assets for a collection
  app.post("/api/polyhaven/auto-select", async (req, res) => {
    try {
      const { collectionType, worldType } = req.body;
      
      console.log('[Auto-Select] Received request:', { collectionType, worldType });
      
      if (!worldType) {
        return res.status(400).json({ error: "worldType is required" });
      }
      
      const assets = await polyhavenApi.autoSelectPolyhavenAssets(collectionType, worldType);
      console.log('[Auto-Select] Found assets:', assets.length);
      res.json(assets);
    } catch (error: any) {
      console.error("Failed to auto-select Polyhaven assets:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get file info for a specific Polyhaven asset
  app.get("/api/polyhaven/assets/:assetId/files", async (req, res) => {
    try {
      const { assetId } = req.params;
      const files = await polyhavenApi.getPolyhavenAssetFiles(assetId);
      res.json(files);
    } catch (error: any) {
      console.error("Failed to get Polyhaven asset files:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get model URL for a Polyhaven asset
  app.get("/api/polyhaven/assets/:assetId/model-url", async (req, res) => {
    try {
      const { assetId } = req.params;
      const { resolution } = req.query;
      const modelInfo = await polyhavenApi.getPolyhavenModelUrl(assetId, resolution as string);
      res.json(modelInfo);
    } catch (error: any) {
      console.error("Failed to get Polyhaven model URL:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Download a Polyhaven asset, create a VisualAsset record, and optionally assign to a collection slot
  app.post("/api/polyhaven/download-and-register", async (req, res) => {
    try {
      const {
        polyhavenAssetId,
        assetType,
        name,
        description,
        worldId,
        collectionId,
        slotCategory,
        slotKey,
        tags,
        resolution
      } = req.body;

      if (!polyhavenAssetId || !assetType || !name) {
        return res.status(400).json({
          error: "polyhavenAssetId, assetType, and name are required"
        });
      }

      // 1. Get the download URL from Polyhaven
      const modelInfo = await polyhavenApi.getPolyhavenModelUrl(polyhavenAssetId, resolution);

      // 2. Download the asset to local storage
      const earlyDownloader = await import('./services/asset-downloader.js');
      const downloadResult = await earlyDownloader.preprocessPolyhavenAsset(
        modelInfo.url,
        assetType,
        polyhavenAssetId,
        modelInfo.companionFiles
      );

      // 3. Create a VisualAsset record in the database
      const asset = await storage.createVisualAsset({
        worldId: worldId || null,
        name,
        description: description || `Polyhaven asset: ${polyhavenAssetId}`,
        assetType,
        filePath: downloadResult.localPath,
        fileName: downloadResult.localPath.split('/').pop() || `${polyhavenAssetId}.glb`,
        fileSize: downloadResult.metadata.fileSize,
        mimeType: 'model/gltf-binary',
        generationProvider: 'manual',
        purpose: 'procedural',
        usageContext: '3d_game',
        tags: tags || ['polyhaven', 'model'],
        metadata: {
          polyhavenId: polyhavenAssetId,
          resolution: modelInfo.resolution,
          originalUrl: downloadResult.metadata.originalUrl,
          companionFiles: Object.keys(modelInfo.companionFiles),
        },
      });

      // 4. Optionally assign to an asset collection slot
      let updatedCollection = null;
      if (collectionId && slotCategory && slotKey) {
        const collection = await storage.getAssetCollection(collectionId);
        if (collection) {
          const slotUpdate: Record<string, any> = {};
          const currentSlot = (collection as any)[slotCategory] || {};
          slotUpdate[slotCategory] = { ...currentSlot, [slotKey]: `/${downloadResult.localPath}` };

          // Also add the asset ID to the collection's assetIds array
          const currentIds = collection.assetIds || [];
          if (!currentIds.includes(asset.id)) {
            slotUpdate.assetIds = [...currentIds, asset.id];
          }

          updatedCollection = await storage.updateAssetCollection(collectionId, slotUpdate);
        }
      }

      res.json({
        success: true,
        asset,
        localPath: downloadResult.localPath,
        collection: updatedCollection ? { id: updatedCollection.id, name: updatedCollection.name } : null,
      });
    } catch (error: any) {
      console.error("Failed to download and register Polyhaven asset:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // List available asset collection templates
  app.get("/api/asset-collection-templates", async (_req, res) => {
    try {
      const { listTemplates } = await import('./services/asset-collection-templates.js');
      res.json(listTemplates());
    } catch (error: any) {
      console.error("Failed to list templates:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Populate an asset collection from a template (downloads all assets)
  app.post("/api/asset-collections/:collectionId/populate-from-template", async (req, res) => {
    try {
      const { collectionId } = req.params;
      const { worldType } = req.body;

      if (!worldType) {
        return res.status(400).json({ error: "worldType is required" });
      }

      const collection = await storage.getAssetCollection(collectionId);
      if (!collection) {
        return res.status(404).json({ error: "Collection not found" });
      }

      const { getTemplateForWorldType } = await import('./services/asset-collection-templates.js');
      const template = getTemplateForWorldType(worldType);
      if (!template) {
        return res.status(404).json({ error: `No template found for world type: ${worldType}` });
      }

      const templateDownloader = await import('./services/asset-downloader.js');
      const results: Array<{
        polyhavenId: string;
        slotKey: string;
        success: boolean;
        assetId?: string;
        error?: string;
      }> = [];

      // Track collection slot updates to batch-apply at the end
      const slotUpdates: Record<string, Record<string, string>> = {};
      const newAssetIds: string[] = [...(collection.assetIds || [])];

      for (const entry of template.assets) {
        try {
          // Get download URL
          const modelInfo = await polyhavenApi.getPolyhavenModelUrl(entry.polyhavenId);

          // Download
          const downloadResult = await templateDownloader.preprocessPolyhavenAsset(
            modelInfo.url,
            entry.assetType,
            entry.polyhavenId,
            modelInfo.companionFiles
          );

          // Create VisualAsset record
          const asset = await storage.createVisualAsset({
            worldId: collection.worldType || null,
            name: entry.name,
            description: entry.description || `Polyhaven: ${entry.polyhavenId}`,
            assetType: entry.assetType,
            filePath: downloadResult.localPath,
            fileName: downloadResult.localPath.split('/').pop() || `${entry.polyhavenId}.glb`,
            fileSize: downloadResult.metadata.fileSize,
            mimeType: 'model/gltf-binary',
            generationProvider: 'manual',
            purpose: 'procedural',
            usageContext: '3d_game',
            tags: ['polyhaven', 'template', ...template.tags],
            metadata: {
              polyhavenId: entry.polyhavenId,
              resolution: modelInfo.resolution,
              templateWorldType: worldType,
            },
          });

          // Accumulate slot update
          if (!slotUpdates[entry.slotCategory]) {
            slotUpdates[entry.slotCategory] = {
              ...((collection as any)[entry.slotCategory] || {}),
            };
          }
          slotUpdates[entry.slotCategory][entry.slotKey] = `/${downloadResult.localPath}`;

          if (!newAssetIds.includes(asset.id)) {
            newAssetIds.push(asset.id);
          }

          results.push({
            polyhavenId: entry.polyhavenId,
            slotKey: `${entry.slotCategory}.${entry.slotKey}`,
            success: true,
            assetId: asset.id,
          });
        } catch (err: any) {
          console.warn(`Template populate: failed to download ${entry.polyhavenId}: ${err.message}`);
          results.push({
            polyhavenId: entry.polyhavenId,
            slotKey: `${entry.slotCategory}.${entry.slotKey}`,
            success: false,
            error: err.message,
          });
        }
      }

      // Batch-apply all slot updates to the collection
      const collectionUpdate: Record<string, any> = { assetIds: newAssetIds };
      for (const [category, slots] of Object.entries(slotUpdates)) {
        collectionUpdate[category] = slots;
      }
      const updatedCollection = await storage.updateAssetCollection(collectionId, collectionUpdate);

      const succeeded = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      res.json({
        success: true,
        template: template.name,
        totalAssets: template.assets.length,
        succeeded,
        failed,
        results,
        collection: updatedCollection
          ? { id: updatedCollection.id, name: updatedCollection.name }
          : null,
      });
    } catch (error: any) {
      console.error("Failed to populate collection from template:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create a new collection from a template (creates collection + downloads all assets)
  app.post("/api/asset-collections/create-from-template", async (req, res) => {
    try {
      const { worldType, collectionName } = req.body;

      if (!worldType) {
        return res.status(400).json({ error: "worldType is required" });
      }

      const { getTemplateForWorldType } = await import('./services/asset-collection-templates.js');
      const template = getTemplateForWorldType(worldType);
      if (!template) {
        return res.status(404).json({ error: `No template found for world type: ${worldType}` });
      }

      // Create the collection first
      const newCollection = await storage.createAssetCollection({
        name: collectionName || template.name,
        description: template.description,
        collectionType: template.collectionType,
        worldType: template.worldType,
        tags: template.tags,
        isPublic: true,
        isActive: true,
        isBase: false,
      });

      // Now populate it — reuse the populate endpoint logic inline
      const templateDownloader = await import('./services/asset-downloader.js');
      const results: Array<{ polyhavenId: string; success: boolean; error?: string }> = [];
      const slotUpdates: Record<string, Record<string, string>> = {};
      const newAssetIds: string[] = [];

      for (const entry of template.assets) {
        try {
          const modelInfo = await polyhavenApi.getPolyhavenModelUrl(entry.polyhavenId);
          const downloadResult = await templateDownloader.preprocessPolyhavenAsset(
            modelInfo.url,
            entry.assetType,
            entry.polyhavenId,
            modelInfo.companionFiles
          );

          const asset = await storage.createVisualAsset({
            worldId: null,
            name: entry.name,
            description: entry.description || `Polyhaven: ${entry.polyhavenId}`,
            assetType: entry.assetType,
            filePath: downloadResult.localPath,
            fileName: downloadResult.localPath.split('/').pop() || `${entry.polyhavenId}.glb`,
            fileSize: downloadResult.metadata.fileSize,
            mimeType: 'model/gltf-binary',
            generationProvider: 'manual',
            purpose: 'procedural',
            usageContext: '3d_game',
            tags: ['polyhaven', 'template', ...template.tags],
            metadata: { polyhavenId: entry.polyhavenId, resolution: modelInfo.resolution },
          });

          if (!slotUpdates[entry.slotCategory]) {
            slotUpdates[entry.slotCategory] = {};
          }
          slotUpdates[entry.slotCategory][entry.slotKey] = `/${downloadResult.localPath}`;
          newAssetIds.push(asset.id);
          results.push({ polyhavenId: entry.polyhavenId, success: true });
        } catch (err: any) {
          results.push({ polyhavenId: entry.polyhavenId, success: false, error: err.message });
        }
      }

      // Update collection with all slots
      const collectionUpdate: Record<string, any> = { assetIds: newAssetIds };
      for (const [category, slots] of Object.entries(slotUpdates)) {
        collectionUpdate[category] = slots;
      }
      await storage.updateAssetCollection(newCollection.id, collectionUpdate);

      const succeeded = results.filter(r => r.success).length;

      res.json({
        success: true,
        collection: { id: newCollection.id, name: newCollection.name },
        template: template.name,
        totalAssets: template.assets.length,
        succeeded,
        failed: results.filter(r => !r.success).length,
        results,
      });
    } catch (error: any) {
      console.error("Failed to create collection from template:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============= SKETCHFAB INTEGRATION =============

  const sketchfabApi = await import('./services/sketchfab-api.js');

  // Check Sketchfab integration status
  app.get("/api/sketchfab/status", async (_req, res) => {
    res.json({
      configured: sketchfabApi.isConfigured(),
      searchAvailable: true,
      downloadAvailable: sketchfabApi.isConfigured(),
    });
  });

  // Search Sketchfab models (public — no auth required)
  app.get("/api/sketchfab/search", async (req, res) => {
    try {
      const { q, sort_by, categories, maxFaceCount, cursor, count } = req.query;
      if (!q) {
        return res.status(400).json({ error: "q (query) parameter is required" });
      }
      const result = await sketchfabApi.searchModels(q as string, {
        downloadable: true,
        sort_by: (sort_by as any) || 'likeCount',
        categories: categories ? (categories as string).split(',') : undefined,
        maxFaceCount: maxFaceCount ? parseInt(maxFaceCount as string, 10) : undefined,
        cursor: cursor as string,
        count: count ? parseInt(count as string, 10) : 24,
      });
      res.json(result);
    } catch (error: any) {
      console.error("Failed to search Sketchfab:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get model details by UID (public)
  app.get("/api/sketchfab/models/:uid", async (req, res) => {
    try {
      const model = await sketchfabApi.getModel(req.params.uid);
      res.json(model);
    } catch (error: any) {
      console.error("Failed to get Sketchfab model:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get download URL for a model (requires SKETCHFAB_API_TOKEN)
  app.get("/api/sketchfab/models/:uid/download-url", async (req, res) => {
    try {
      const info = await sketchfabApi.getDownloadUrl(req.params.uid);
      res.json(info);
    } catch (error: any) {
      console.error("Failed to get Sketchfab download URL:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Auto-select Sketchfab models for a world type
  app.post("/api/sketchfab/auto-select", async (req, res) => {
    try {
      const { worldType } = req.body;
      if (!worldType) {
        return res.status(400).json({ error: "worldType is required" });
      }
      const models = await sketchfabApi.autoSelectModels(worldType);
      res.json(models);
    } catch (error: any) {
      console.error("Failed to auto-select Sketchfab models:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Download a Sketchfab model, create a VisualAsset, optionally assign to collection
  app.post("/api/sketchfab/download-and-register", async (req, res) => {
    try {
      const {
        sketchfabUid,
        assetType,
        name,
        description,
        worldId,
        collectionId,
        slotCategory,
        slotKey,
        tags,
      } = req.body;

      if (!sketchfabUid || !assetType || !name) {
        return res.status(400).json({
          error: "sketchfabUid, assetType, and name are required",
        });
      }

      // 1. Get the time-limited download URL
      const downloadInfo = await sketchfabApi.getDownloadUrl(sketchfabUid);

      // 2. Download and extract
      const sketchfabDownloader = await import('./services/asset-downloader.js');
      const downloadResult = await sketchfabDownloader.preprocessSketchfabAsset(
        downloadInfo.gltfUrl,
        assetType,
        sketchfabUid,
        name
      );

      // 3. Create VisualAsset record
      const isGlb = downloadResult.localPath.endsWith('.glb');
      const asset = await storage.createVisualAsset({
        worldId: worldId || null,
        name,
        description: description || `Sketchfab model: ${sketchfabUid}`,
        assetType,
        filePath: downloadResult.localPath,
        fileName: downloadResult.localPath.split('/').pop() || `scene.${isGlb ? 'glb' : 'gltf'}`,
        fileSize: downloadResult.metadata.fileSize,
        mimeType: isGlb ? 'model/gltf-binary' : 'model/gltf+json',
        generationProvider: 'manual',
        purpose: 'procedural',
        usageContext: '3d_game',
        tags: tags || ['sketchfab', 'model'],
        metadata: {
          sketchfabUid,
          originalUrl: downloadResult.metadata.originalUrl,
          format: downloadResult.metadata.format,
        },
      });

      // 4. Optionally assign to a collection slot
      let updatedCollection = null;
      if (collectionId && slotCategory && slotKey) {
        const collection = await storage.getAssetCollection(collectionId);
        if (collection) {
          const currentSlotData = (collection as any)[slotCategory] as Record<string, string> || {};
          const existingAssetIds: string[] = (collection.assetIds as string[]) || [];
          await storage.updateAssetCollection(collectionId, {
            [slotCategory]: { ...currentSlotData, [slotKey]: `/${downloadResult.localPath}` },
            assetIds: [...existingAssetIds, asset.id],
          } as any);
          updatedCollection = await storage.getAssetCollection(collectionId);
        }
      }

      res.json({
        success: true,
        asset: { id: asset.id, name: asset.name, filePath: asset.filePath },
        collection: updatedCollection ? { id: updatedCollection.id, name: updatedCollection.name } : null,
      });
    } catch (error: any) {
      console.error("Failed to download and register Sketchfab asset:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============= ASSET MARKETPLACE CATALOG =============

  app.get("/api/asset-marketplaces", async (_req, res) => {
    try {
      const catalog = await import('../shared/asset-marketplace-catalog.js');
      res.json(catalog.ASSET_MARKETPLACES);
    } catch (error: any) {
      console.error("Failed to load marketplace catalog:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============= FREESOUND API INTEGRATION =============

  // Import Freesound API service
  const freesoundApi = await import('./services/freesound-api.js');
  const assetDownloader = await import('./services/asset-downloader.js');

  // Search Freesound for audio assets
  app.get("/api/freesound/search", async (req, res) => {
    try {
      const { query, license, minDuration, maxDuration, sort, pageSize, page } = req.query;
      
      if (!query) {
        return res.status(400).json({ error: "query parameter is required" });
      }

      const results = await freesoundApi.searchSounds({
        query: query as string,
        license: (license as 'cc0' | 'Attribution' | 'Attribution Noncommercial') || 'cc0',
        minDuration: minDuration ? parseFloat(minDuration as string) : undefined,
        maxDuration: maxDuration ? parseFloat(maxDuration as string) : undefined,
        sort: (sort as any) || 'downloads_desc',
        pageSize: pageSize ? parseInt(pageSize as string, 10) : 15,
        page: page ? parseInt(page as string, 10) : 1
      });

      res.json(results);
    } catch (error: any) {
      console.error("Failed to search Freesound:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Auto-select audio assets for a world type and role
  app.post("/api/freesound/auto-select", async (req, res) => {
    try {
      const { audioRole, worldType } = req.body;
      
      if (!audioRole || !worldType) {
        return res.status(400).json({ error: "audioRole and worldType are required" });
      }

      const sounds = await freesoundApi.autoSelectAudioAssets(audioRole, worldType);
      res.json({ sounds });
    } catch (error: any) {
      console.error("Failed to auto-select Freesound assets:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get info for a specific Freesound sound
  app.get("/api/freesound/sounds/:soundId", async (req, res) => {
    try {
      const { soundId } = req.params;
      const sound = await freesoundApi.getSoundInfo(parseInt(soundId, 10));
      res.json(sound);
    } catch (error: any) {
      console.error("Failed to get Freesound sound info:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Download and cache a Freesound audio asset
  app.post("/api/freesound/download", async (req, res) => {
    try {
      const { soundId, soundName, assetType, previewUrl } = req.body;
      
      if (!soundId || !previewUrl) {
        return res.status(400).json({ error: "soundId and previewUrl are required" });
      }

      const result = await assetDownloader.preprocessFreesoundAsset(
        previewUrl,
        assetType || 'audio_effect',
        soundId,
        soundName
      );

      res.json({
        success: true,
        localPath: result.localPath,
        metadata: result.metadata
      });
    } catch (error: any) {
      console.error("Failed to download Freesound asset:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Download and register a Freesound asset as a VisualAsset in the database
  app.post("/api/freesound/import", async (req, res) => {
    try {
      const { soundId, soundName, soundDescription, assetType, previewUrl, worldId, tags } = req.body;
      
      if (!soundId || !previewUrl || !soundName) {
        return res.status(400).json({ error: "soundId, soundName, and previewUrl are required" });
      }

      // Download the audio file
      const downloadResult = await assetDownloader.preprocessFreesoundAsset(
        previewUrl,
        assetType || 'audio_effect',
        soundId,
        soundName
      );

      // Create a VisualAsset record in the database
      const asset = await storage.createVisualAsset({
        worldId: worldId || null,
        name: soundName,
        description: soundDescription || `Audio from Freesound (ID: ${soundId})`,
        assetType: assetType || 'audio_effect',
        filePath: downloadResult.localPath,
        fileName: downloadResult.localPath.split('/').pop() || `${soundId}.mp3`,
        fileSize: downloadResult.metadata.fileSize,
        mimeType: 'audio/mpeg',
        generationProvider: 'manual',
        purpose: 'procedural',
        usageContext: '3d_game',
        tags: tags || ['audio', 'freesound'],
        metadata: {
          freesoundId: soundId,
          originalUrl: downloadResult.metadata.originalUrl
        }
      });

      res.json({
        success: true,
        asset,
        localPath: downloadResult.localPath
      });
    } catch (error: any) {
      console.error("Failed to import Freesound asset:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============= ASSET EXPORT & DOWNLOAD =============

  // Import export service
  const assetExport = await import('./services/asset-export.js');

  // Export assets as ZIP
  app.post("/api/assets/export", async (req, res) => {
    try {
      const { assetIds, format, quality, includeMetadata, zipName } = req.body;

      if (!assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
        return res.status(400).json({ error: "assetIds array is required" });
      }

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${zipName || 'asset-export'}.zip"`);

      await assetExport.exportAssetsAsZip(
        {
          assetIds,
          format: format || 'original',
          quality: quality || 90,
          includeMetadata: includeMetadata !== false,
          zipName
        },
        res
      );
    } catch (error: any) {
      console.error("Failed to export assets:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Export collection as ZIP
  app.post("/api/asset-collections/:id/export", async (req, res) => {
    try {
      const { id } = req.params;
      const { format, quality, includeMetadata, zipName } = req.body;

      const collection = await storage.getAssetCollection(id);
      if (!collection) {
        return res.status(404).json({ error: "Collection not found" });
      }

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${zipName || `collection-${collection.name}`}.zip"`);

      await assetExport.exportCollectionAsZip(
        id,
        {
          format: format || 'original',
          quality: quality || 90,
          includeMetadata: includeMetadata !== false,
          zipName
        },
        res
      );
    } catch (error: any) {
      console.error("Failed to export collection:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Download single asset with format conversion
  app.get("/api/assets/:id/download", async (req, res) => {
    try {
      const { id } = req.params;
      const { format, quality } = req.query;

      const result = await assetExport.getAssetFile(
        id,
        (format as 'png' | 'webp' | 'jpeg' | 'original') || 'original',
        quality ? parseInt(quality as string) : 90
      );

      if (!result) {
        return res.status(404).json({ error: "Asset not found" });
      }

      res.setHeader('Content-Type', result.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
      res.send(result.buffer);
    } catch (error: any) {
      console.error("Failed to download asset:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get export preview (metadata without generating the export)
  app.post("/api/assets/export/preview", async (req, res) => {
    try {
      const { assetIds } = req.body;

      if (!assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
        return res.status(400).json({ error: "assetIds array is required" });
      }

      const preview = await assetExport.getExportPreview(assetIds);
      res.json(preview);
    } catch (error: any) {
      console.error("Failed to get export preview:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Cleanup assets (dry run or actual deletion)
  app.post("/api/assets/cleanup", async (req, res) => {
    try {
      const { worldId, olderThanDays, status, dryRun } = req.body;

      const result = await assetExport.cleanupAssets({
        worldId,
        olderThanDays,
        status,
        dryRun: dryRun !== false // Default to dry run for safety
      });

      res.json(result);
    } catch (error: any) {
      console.error("Failed to cleanup assets:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============= IMAGE UPSCALING & ENHANCEMENT =============

  // Import upscaling service
  const imageUpscaling = await import('./services/image-upscaling.js');

  // Upscale an image
  app.post("/api/assets/:id/upscale", async (req, res) => {
    try {
      const { id } = req.params;
      const { scale, model, faceEnhancement } = req.body;

      const result = await imageUpscaling.upscaleImage(id, {
        scale: scale || 2,
        model,
        faceEnhancement
      });

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({ success: true, newAssetId: result.newAssetId });
    } catch (error: any) {
      console.error("Failed to upscale image:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Enhance an image with filters
  app.post("/api/assets/:id/enhance", async (req, res) => {
    try {
      const { id } = req.params;
      const { brightness, contrast, saturation, sharpness, denoise } = req.body;

      const result = await imageUpscaling.enhanceImage(id, {
        brightness,
        contrast,
        saturation,
        sharpness,
        denoise
      });

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({ success: true, newAssetId: result.newAssetId });
    } catch (error: any) {
      console.error("Failed to enhance image:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Analyze image quality
  app.get("/api/assets/:id/quality", async (req, res) => {
    try {
      const { id } = req.params;

      const metrics = await imageUpscaling.analyzeImageQuality(id);

      if (!metrics) {
        return res.status(404).json({ error: "Asset not found or analysis failed" });
      }

      res.json(metrics);
    } catch (error: any) {
      console.error("Failed to analyze quality:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Compare two images
  app.get("/api/assets/compare/:originalId/:processedId", async (req, res) => {
    try {
      const { originalId, processedId } = req.params;

      const comparison = await imageUpscaling.compareImages(originalId, processedId);

      if (!comparison) {
        return res.status(404).json({ error: "Assets not found or comparison failed" });
      }

      res.json(comparison);
    } catch (error: any) {
      console.error("Failed to compare images:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ─── Ownership / Inventory / Mercantile ─────────────────────────────────────

  // Get entity inventory (character or player)
  app.get("/api/worlds/:worldId/entities/:entityId/inventory", async (req, res) => {
    try {
      const { worldId, entityId } = req.params;
      const truths = await storage.getTruthsByWorld(worldId);
      const inventoryTruths = truths.filter(
        (t: any) => t.entryType === 'ownership' && t.characterId === entityId
      );
      const items = inventoryTruths.map((t: any) => {
        const data = typeof t.customData === 'string' ? JSON.parse(t.customData) : (t.customData || {});
        return {
          id: data.itemId || t.id,
          name: data.itemName || t.title,
          description: data.itemDescription || t.content,
          type: data.itemType || 'collectible',
          quantity: data.quantity || 1,
          value: data.value || 0,
          sellValue: data.sellValue || 0,
          tradeable: data.tradeable !== false,
          truthId: t.id,
        };
      });
      res.json({ entityId, items, gold: 0 });
    } catch (error) {
      console.error("Failed to get entity inventory:", error);
      res.status(500).json({ error: "Failed to get entity inventory" });
    }
  });

  // Transfer item between entities (buy, sell, steal, give, discard)
  app.post("/api/worlds/:worldId/inventory/transfer", async (req, res) => {
    try {
      const { worldId } = req.params;
      const { fromEntityId, toEntityId, itemId, itemName, itemDescription, itemType, quantity, transactionType, totalPrice } = req.body;

      if (!worldId || !itemId || !transactionType) {
        return res.status(400).json({ error: "Missing required fields: itemId, transactionType" });
      }

      const timestamp = Date.now();

      // Create ownership truth for receiver (if not discard)
      if (toEntityId && transactionType !== 'discard') {
        await storage.createTruth({
          worldId,
          characterId: toEntityId,
          title: `Acquired: ${itemName || itemId}`,
          content: `${toEntityId} acquired ${itemName || itemId} via ${transactionType}`,
          entryType: 'ownership',
          importance: 3,
          isPublic: true,
          timestep: 0,
          tags: ['ownership', 'inventory', transactionType],
          customData: {
            itemId,
            itemName: itemName || itemId,
            itemDescription: itemDescription || '',
            itemType: itemType || 'collectible',
            quantity: quantity || 1,
            value: totalPrice || 0,
            sellValue: Math.floor((totalPrice || 0) * 0.7),
            tradeable: true,
            transactionType,
            fromEntityId: fromEntityId || null,
            timestamp,
          },
        });
      }

      // Remove ownership truth from sender (if applicable)
      if (fromEntityId) {
        const senderTruths = await storage.getTruthsByWorld(worldId);
        const matchingTruth = senderTruths.find(
          (t: any) =>
            t.entryType === 'ownership' &&
            t.characterId === fromEntityId &&
            (typeof t.customData === 'object' ? t.customData?.itemId : undefined) === itemId
        );
        if (matchingTruth) {
          const existingData = typeof matchingTruth.customData === 'object' ? matchingTruth.customData as any : {};
          const existingQty = existingData.quantity || 1;
          const removeQty = quantity || 1;
          if (removeQty >= existingQty) {
            await storage.deleteTruth(matchingTruth.id);
          } else {
            await storage.updateTruth(matchingTruth.id, {
              customData: { ...existingData, quantity: existingQty - removeQty },
            });
          }
        }
      }

      // Create a transaction event truth
      await storage.createTruth({
        worldId,
        characterId: fromEntityId || toEntityId,
        title: `Transaction: ${transactionType} ${itemName || itemId}`,
        content: `${transactionType} of ${itemName || itemId} (qty: ${quantity || 1}) for ${totalPrice || 0} gold`,
        entryType: 'event',
        importance: 2,
        isPublic: true,
        timestep: 0,
        tags: ['transaction', transactionType, 'mercantile'],
        customData: {
          transactionType,
          itemId,
          itemName: itemName || itemId,
          quantity: quantity || 1,
          totalPrice: totalPrice || 0,
          fromEntityId: fromEntityId || null,
          toEntityId: toEntityId || null,
          timestamp,
        },
      });

      res.json({
        success: true,
        transactionType,
        itemId,
        quantity: quantity || 1,
        totalPrice: totalPrice || 0,
        timestamp,
      });
    } catch (error) {
      console.error("Failed to transfer item:", error);
      res.status(500).json({ error: "Failed to transfer item" });
    }
  });

  // Get merchant inventory for an NPC
  app.get("/api/worlds/:worldId/merchants/:merchantId/inventory", async (req, res) => {
    try {
      const { worldId, merchantId } = req.params;
      const character = await storage.getCharacter(merchantId);
      if (!character) {
        return res.status(404).json({ error: "Merchant not found" });
      }

      const occupation = (character.occupation || '').toLowerCase();
      const isMerchant = ['merchant', 'shopkeeper', 'trader', 'vendor', 'blacksmith', 'apothecary', 'baker', 'butcher', 'tailor', 'jeweler', 'armorer', 'weaponsmith'].some(
        term => occupation.includes(term)
      );

      if (!isMerchant) {
        return res.status(400).json({ error: "Character is not a merchant" });
      }

      // Generate stock based on merchant type
      const merchantStock = generateMerchantStock(occupation, worldId);

      res.json({
        merchantId,
        merchantName: `${character.firstName} ${character.lastName}`,
        items: merchantStock.items,
        goldReserve: merchantStock.goldReserve,
        buyMultiplier: merchantStock.buyMultiplier,
        sellMultiplier: merchantStock.sellMultiplier,
      });
    } catch (error) {
      console.error("Failed to get merchant inventory:", error);
      res.status(500).json({ error: "Failed to get merchant inventory" });
    }
  });

  // Enrich historical event narratives with LLM
  app.post("/api/worlds/:worldId/history/enrich", async (req, res) => {
    try {
      const { worldId } = req.params;
      const tierParam = req.query.tier ? parseInt(req.query.tier as string, 10) : undefined;
      const tier = tierParam === 1 || tierParam === 2 || tierParam === 3 ? tierParam : undefined;

      const world = await storage.getWorld(worldId);
      if (!world) {
        return res.status(404).json({ error: "World not found" });
      }

      const truths = await storage.getTruthsByWorld(worldId);
      if (truths.length === 0) {
        return res.json({ enriched: 0, results: [] });
      }

      // Build world context
      const settlements = await storage.getSettlementsByWorld(worldId);
      const characters = await storage.getCharactersByWorld(worldId);
      const countries = typeof (storage as any).getCountriesByWorld === 'function'
        ? await (storage as any).getCountriesByWorld(worldId)
        : [];

      const worldContext: WorldContext = {
        worldName: world.name,
        worldDescription: world.description ?? undefined,
        settlements: settlements.map((s: any) => ({ name: s.name, description: s.description })),
        countries: countries.map((c: any) => ({ name: c.name, description: c.description })),
        characters: characters.map((c: any) => ({
          id: c.id,
          firstName: c.firstName,
          lastName: c.lastName,
          description: c.description,
          occupation: c.occupation,
        })),
      };

      const results = await enrichHistoricalEvents(truths as any[], worldContext, tier);

      // Update truth entries with enriched content
      let updated = 0;
      for (const result of results) {
        if (result.enrichedContent !== result.originalContent) {
          await storage.updateTruth(result.id, { content: result.enrichedContent });
          updated++;
        }
      }

      res.json({
        enriched: updated,
        total: results.length,
        byTier: {
          tier1: results.filter((r) => r.tier === 1).length,
          tier2: results.filter((r) => r.tier === 2).length,
          tier3: results.filter((r) => r.tier === 3).length,
        },
        results: results.map((r) => ({
          id: r.id,
          tier: r.tier,
          changed: r.enrichedContent !== r.originalContent,
        })),
      });
    } catch (error) {
      console.error("Failed to enrich historical events:", error);
      res.status(500).json({ error: "Failed to enrich historical events", details: (error as Error).message });
    }
  });

  // Register telemetry, evaluation, engagement, and external API routes
  app.use('/api', createTelemetryRoutes(storage));

  // Register history import/export routes
  app.use('/api', createHistoryRoutes(storage));

  // Register assessment session routes
  app.use('/api', createAssessmentRoutes(storage));

  const httpServer = createServer(app);
  return httpServer;
}

// ─── Merchant Stock Generation ────────────────────────────────────────────

function generateMerchantStock(occupation: string, worldId: string) {
  const stockTemplates: Record<string, Array<{ name: string; type: string; basePrice: number; description: string }>> = {
    default: [
      { name: 'Bread', type: 'food', basePrice: 2, description: 'A fresh loaf of bread' },
      { name: 'Water Flask', type: 'drink', basePrice: 1, description: 'A flask of clean water' },
      { name: 'Torch', type: 'tool', basePrice: 3, description: 'A sturdy torch for dark places' },
      { name: 'Rope', type: 'tool', basePrice: 5, description: 'Strong hemp rope, 50 feet' },
      { name: 'Healing Herb', type: 'consumable', basePrice: 8, description: 'A herb with mild restorative properties' },
    ],
    blacksmith: [
      { name: 'Iron Sword', type: 'weapon', basePrice: 25, description: 'A well-forged iron sword' },
      { name: 'Iron Shield', type: 'armor', basePrice: 20, description: 'A sturdy iron shield' },
      { name: 'Chainmail Vest', type: 'armor', basePrice: 40, description: 'A vest of interlocking iron rings' },
      { name: 'Dagger', type: 'weapon', basePrice: 10, description: 'A sharp steel dagger' },
      { name: 'Iron Pickaxe', type: 'tool', basePrice: 15, description: 'A heavy pickaxe for mining' },
    ],
    apothecary: [
      { name: 'Health Potion', type: 'consumable', basePrice: 15, description: 'Restores a moderate amount of health' },
      { name: 'Antidote', type: 'consumable', basePrice: 12, description: 'Cures common poisons' },
      { name: 'Energy Tonic', type: 'consumable', basePrice: 10, description: 'Restores energy and vigor' },
      { name: 'Healing Salve', type: 'consumable', basePrice: 8, description: 'A soothing salve for wounds' },
      { name: 'Rare Herbs', type: 'material', basePrice: 20, description: 'A bundle of rare medicinal herbs' },
    ],
    baker: [
      { name: 'Bread', type: 'food', basePrice: 2, description: 'A fresh loaf of bread' },
      { name: 'Meat Pie', type: 'food', basePrice: 5, description: 'A hearty meat pie' },
      { name: 'Sweet Roll', type: 'food', basePrice: 3, description: 'A delicious sweet roll' },
      { name: 'Trail Rations', type: 'food', basePrice: 8, description: 'Packed food for long journeys' },
    ],
    tailor: [
      { name: 'Leather Boots', type: 'armor', basePrice: 12, description: 'Comfortable leather boots' },
      { name: 'Traveler\'s Cloak', type: 'armor', basePrice: 15, description: 'A warm cloak for the road' },
      { name: 'Leather Gloves', type: 'armor', basePrice: 8, description: 'Sturdy leather gloves' },
      { name: 'Fine Clothes', type: 'collectible', basePrice: 25, description: 'Elegant garments' },
    ],
    jeweler: [
      { name: 'Silver Ring', type: 'collectible', basePrice: 30, description: 'A finely crafted silver ring' },
      { name: 'Gold Amulet', type: 'collectible', basePrice: 50, description: 'An ornate gold amulet' },
      { name: 'Gemstone', type: 'material', basePrice: 40, description: 'A polished precious gemstone' },
    ],
  };

  // Determine which template to use
  let templateKey = 'default';
  for (const key of Object.keys(stockTemplates)) {
    if (occupation.includes(key)) {
      templateKey = key;
      break;
    }
  }

  const template = stockTemplates[templateKey];
  const items = template.map((item, index) => ({
    id: `merchant_item_${templateKey}_${index}`,
    name: item.name,
    description: item.description,
    type: item.type,
    quantity: 1,
    buyPrice: item.basePrice,
    sellPrice: Math.floor(item.basePrice * 0.6),
    stock: Math.floor(Math.random() * 5) + 1,
    maxStock: 10,
    value: item.basePrice,
    tradeable: true,
  }));

  return {
    items,
    goldReserve: 200 + Math.floor(Math.random() * 300),
    buyMultiplier: 1.0,
    sellMultiplier: 0.6,
  };
}
