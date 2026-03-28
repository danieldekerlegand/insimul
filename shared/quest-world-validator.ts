/**
 * Quest World Validator
 *
 * Validates that quest objectives can actually be completed given the actual
 * world data in a WorldIR. Unlike quest-feasibility-validator.ts (which checks
 * action mappings), this module checks that referenced NPCs, items, locations,
 * and documents actually exist in the world.
 */

import type {
  WorldIR,
  QuestIR,
  CharacterIR,
  NPCIR,
  BuildingIR,
  ItemIR,
  TextIR,
  NPCDialogueContext,
} from './game-engine/ir-types';

// ── Types ───────────────────────────────────────────────────────────────────

export interface WorldValidationIssue {
  questId: string;
  questTitle: string;
  objectiveIndex: number;
  objectiveType: string;
  severity: 'error' | 'warning';
  message: string;
}

export interface WorldValidationReport {
  feasible: QuestIR[];
  infeasible: QuestIR[];
  warnings: string[];
  issues: WorldValidationIssue[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function normalizeStr(s: string): string {
  return s.toLowerCase().trim();
}

function buildCharacterNameMap(characters: CharacterIR[]): Map<string, CharacterIR> {
  const map = new Map<string, CharacterIR>();
  for (const c of characters) {
    map.set(c.id, c);
    const fullName = `${c.firstName} ${c.lastName}`.trim();
    map.set(normalizeStr(fullName), c);
    map.set(normalizeStr(c.firstName), c);
    if (c.lastName) map.set(normalizeStr(c.lastName), c);
  }
  return map;
}

function buildNpcCharacterIds(npcs: NPCIR[]): Set<string> {
  return new Set(npcs.map(n => n.characterId));
}

function buildDialogueContextMap(contexts: NPCDialogueContext[]): Map<string, NPCDialogueContext> {
  const map = new Map<string, NPCDialogueContext>();
  for (const dc of contexts) {
    map.set(dc.characterId, dc);
    map.set(normalizeStr(dc.characterName), dc);
  }
  return map;
}

function buildBuildingNameMap(buildings: BuildingIR[]): Map<string, BuildingIR> {
  const map = new Map<string, BuildingIR>();
  for (const b of buildings) {
    map.set(b.id, b);
    if (b.spec?.buildingRole) {
      map.set(normalizeStr(b.spec.buildingRole), b);
    }
  }
  return map;
}

function buildItemNameMap(items: ItemIR[]): Map<string, ItemIR> {
  const map = new Map<string, ItemIR>();
  for (const item of items) {
    map.set(item.id, item);
    map.set(normalizeStr(item.name), item);
  }
  return map;
}

function buildTextMap(texts: TextIR[]): Map<string, TextIR> {
  const map = new Map<string, TextIR>();
  for (const t of texts) {
    map.set(t.id, t);
    map.set(normalizeStr(t.title), t);
  }
  return map;
}

function findCharacter(
  ref: string,
  charMap: Map<string, CharacterIR>,
): CharacterIR | undefined {
  return charMap.get(ref) ?? charMap.get(normalizeStr(ref));
}

function findBuilding(
  ref: string,
  buildingMap: Map<string, BuildingIR>,
  buildings: BuildingIR[],
): BuildingIR | undefined {
  const direct = buildingMap.get(ref) ?? buildingMap.get(normalizeStr(ref));
  if (direct) return direct;
  // Fuzzy match on building role or settlement name
  const norm = normalizeStr(ref);
  return buildings.find(b =>
    normalizeStr(b.spec?.buildingRole ?? '').includes(norm) ||
    normalizeStr(b.id).includes(norm),
  );
}

function findItem(
  ref: string,
  itemMap: Map<string, ItemIR>,
  lootItemNames: Set<string>,
): boolean {
  if (itemMap.has(ref) || itemMap.has(normalizeStr(ref))) return true;
  return lootItemNames.has(normalizeStr(ref));
}

function findText(
  ref: string,
  textMap: Map<string, TextIR>,
): TextIR | undefined {
  return textMap.get(ref) ?? textMap.get(normalizeStr(ref));
}

// ── Objective type validators ───────────────────────────────────────────────

const NPC_OBJECTIVE_TYPES = new Set([
  'talk_to_npc', 'complete_conversation', 'conversation_initiation',
  'build_friendship', 'give_gift', 'escort_npc', 'introduce_self',
  'ask_for_directions', 'order_food', 'haggle_price',
  'teach_vocabulary', 'teach_phrase', 'listen_and_repeat',
  'listening_comprehension',
]);

const LOCATION_OBJECTIVE_TYPES = new Set([
  'visit_location', 'discover_location', 'navigate_language',
  'follow_directions',
]);

const ITEM_OBJECTIVE_TYPES = new Set([
  'collect_item', 'deliver_item', 'craft_item', 'give_gift',
]);

const TEXT_OBJECTIVE_TYPES = new Set([
  'collect_text', 'find_text', 'read_text', 'complete_reading',
  'comprehension_quiz',
]);

// ── Core validator ──────────────────────────────────────────────────────────

/**
 * Validate all quests in a WorldIR against the actual world data.
 * Checks that referenced NPCs, items, locations, and texts exist.
 */
export function validateQuestsAgainstWorld(worldIR: WorldIR): WorldValidationReport {
  const issues: WorldValidationIssue[] = [];
  const feasible: QuestIR[] = [];
  const infeasible: QuestIR[] = [];
  const warnings: string[] = [];

  const characters = worldIR.entities.characters;
  const npcs = worldIR.entities.npcs;
  const buildings = worldIR.entities.buildings;
  const items = worldIR.systems.items;
  const lootTables = worldIR.systems.lootTables;
  const texts = worldIR.systems.texts;
  const dialogueContexts = worldIR.systems.dialogueContexts;

  const charMap = buildCharacterNameMap(characters);
  const npcCharacterIds = buildNpcCharacterIds(npcs);
  const dialogueMap = buildDialogueContextMap(dialogueContexts);
  const buildingMap = buildBuildingNameMap(buildings);
  const itemMap = buildItemNameMap(items);
  const textMap = buildTextMap(texts);

  // Build loot table item names set
  const lootItemNames = new Set<string>();
  for (const lt of lootTables) {
    for (const entry of lt.entries) {
      lootItemNames.add(normalizeStr(entry.itemName));
    }
  }

  // Build location names set from buildings and settlements
  const locationNames = new Set<string>();
  for (const b of buildings) {
    locationNames.add(normalizeStr(b.id));
    if (b.spec?.buildingRole) locationNames.add(normalizeStr(b.spec.buildingRole));
  }
  for (const s of worldIR.geography.settlements) {
    locationNames.add(normalizeStr(s.id));
    locationNames.add(normalizeStr(s.name));
  }

  for (const quest of worldIR.systems.quests) {
    const questIssues: WorldValidationIssue[] = [];

    // Check assignedBy NPC exists
    if (quest.assignedByCharacterId) {
      const char = findCharacter(quest.assignedByCharacterId, charMap);
      if (!char) {
        questIssues.push({
          questId: quest.id,
          questTitle: quest.title,
          objectiveIndex: -1,
          objectiveType: '',
          severity: 'warning',
          message: `Quest assigned by character "${quest.assignedByCharacterId}" who does not exist in the world`,
        });
      } else if (!npcCharacterIds.has(char.id)) {
        questIssues.push({
          questId: quest.id,
          questTitle: quest.title,
          objectiveIndex: -1,
          objectiveType: '',
          severity: 'warning',
          message: `Quest assigned by character "${quest.assignedBy}" who exists but is not an NPC in the world`,
        });
      }
    }

    // Check quest location exists
    if (quest.locationId && !findBuilding(quest.locationId, buildingMap, buildings)) {
      const inSettlements = worldIR.geography.settlements.some(
        s => s.id === quest.locationId || normalizeStr(s.name) === normalizeStr(quest.locationId!),
      );
      if (!inSettlements) {
        questIssues.push({
          questId: quest.id,
          questTitle: quest.title,
          objectiveIndex: -1,
          objectiveType: '',
          severity: 'warning',
          message: `Quest location "${quest.locationId}" not found as a building or settlement`,
        });
      }
    }

    // Check each objective
    if (quest.objectives && Array.isArray(quest.objectives)) {
      for (let i = 0; i < quest.objectives.length; i++) {
        const obj = quest.objectives[i];
        if (!obj || typeof obj !== 'object') continue;
        const objType = obj.type as string;
        if (!objType) continue;

        // NPC-based objectives
        if (NPC_OBJECTIVE_TYPES.has(objType)) {
          const npcRef = obj.npcId || obj.npcName || obj.target;
          if (npcRef) {
            const char = findCharacter(npcRef, charMap);
            if (!char) {
              questIssues.push({
                questId: quest.id,
                questTitle: quest.title,
                objectiveIndex: i,
                objectiveType: objType,
                severity: 'error',
                message: `Objective references NPC "${npcRef}" who does not exist in the world`,
              });
            } else {
              // Check NPC has dialogue context for conversation types
              const needsDialogue = ['talk_to_npc', 'complete_conversation', 'conversation_initiation',
                'ask_for_directions', 'order_food', 'haggle_price', 'introduce_self',
                'listening_comprehension', 'teach_vocabulary', 'teach_phrase'].includes(objType);
              if (needsDialogue) {
                const hasContext = dialogueMap.has(char.id) || dialogueMap.has(normalizeStr(`${char.firstName} ${char.lastName}`));
                if (!hasContext) {
                  questIssues.push({
                    questId: quest.id,
                    questTitle: quest.title,
                    objectiveIndex: i,
                    objectiveType: objType,
                    severity: 'warning',
                    message: `NPC "${npcRef}" has no dialogue context — conversation objectives may not work`,
                  });
                }
              }
            }
          }
        }

        // Location-based objectives
        if (LOCATION_OBJECTIVE_TYPES.has(objType)) {
          const locRef = obj.locationId || obj.locationName || obj.target;
          if (locRef) {
            const normLoc = normalizeStr(locRef);
            const found = locationNames.has(normLoc) ||
              findBuilding(locRef, buildingMap, buildings) !== undefined ||
              Array.from(locationNames).some(ln => ln.includes(normLoc) || normLoc.includes(ln));
            if (!found) {
              questIssues.push({
                questId: quest.id,
                questTitle: quest.title,
                objectiveIndex: i,
                objectiveType: objType,
                severity: 'error',
                message: `Objective references location "${locRef}" which does not exist in the world`,
              });
            }
          }
        }

        // Item-based objectives
        if (ITEM_OBJECTIVE_TYPES.has(objType)) {
          const itemRef = obj.itemId || obj.itemName || obj.target;
          if (itemRef && !findItem(itemRef, itemMap, lootItemNames)) {
            questIssues.push({
              questId: quest.id,
              questTitle: quest.title,
              objectiveIndex: i,
              objectiveType: objType,
              severity: 'error',
              message: `Objective references item "${itemRef}" which does not exist in items or loot tables`,
            });
          }
        }

        // Text-based objectives
        if (TEXT_OBJECTIVE_TYPES.has(objType)) {
          const textRef = obj.textId || obj.textName || obj.target;
          if (textRef && !findText(textRef, textMap)) {
            questIssues.push({
              questId: quest.id,
              questTitle: quest.title,
              objectiveIndex: i,
              objectiveType: objType,
              severity: 'warning',
              message: `Objective references text "${textRef}" which does not exist — text collection objectives rely on world spawning`,
            });
          }
        }
      }
    }

    issues.push(...questIssues);

    const hasErrors = questIssues.some(i => i.severity === 'error');
    if (hasErrors) {
      infeasible.push(quest);
    } else {
      feasible.push(quest);
    }

    // Collect warning strings
    for (const issue of questIssues) {
      warnings.push(`[${issue.severity.toUpperCase()}] Quest "${quest.title}" (${quest.id}): ${issue.message}`);
    }
  }

  return { feasible, infeasible, warnings, issues };
}
