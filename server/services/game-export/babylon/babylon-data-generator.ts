/**
 * Babylon.js Data Generator
 *
 * Splits the WorldIR into individual JSON data files that the
 * Babylon.js game loads at runtime.
 */

import type { WorldIR } from '@shared/game-engine/ir-types';
import type { GeneratedFile } from './babylon-project-generator';

export function generateDataFiles(ir: WorldIR): GeneratedFile[] {
  const files: GeneratedFile[] = [];

  // Full IR (for reference / advanced usage)
  files.push({
    path: 'public/data/world_ir.json',
    content: JSON.stringify(ir, null, 2),
  });

  // Characters
  files.push({
    path: 'public/data/characters.json',
    content: JSON.stringify(ir.entities.characters, null, 2),
  });

  // NPCs (merged with character data for convenience)
  const npcsWithData = ir.entities.npcs.map(npc => {
    const char = ir.entities.characters.find(c => c.id === npc.characterId);
    return {
      ...npc,
      name: char ? `${char.firstName} ${char.lastName}`.trim() : npc.characterId,
      occupation: char?.occupation || null,
      gender: char?.gender || 'unknown',
      personality: char?.personality || null,
      skills: char?.skills || {},
    };
  });
  files.push({
    path: 'public/data/npcs.json',
    content: JSON.stringify(npcsWithData, null, 2),
  });

  // Quests
  files.push({
    path: 'public/data/quests.json',
    content: JSON.stringify(ir.systems.quests, null, 2),
  });

  // Actions (world + base combined)
  files.push({
    path: 'public/data/actions.json',
    content: JSON.stringify([...ir.systems.actions, ...ir.systems.baseActions], null, 2),
  });

  // Rules (world + base combined)
  files.push({
    path: 'public/data/rules.json',
    content: JSON.stringify([...ir.systems.rules, ...ir.systems.baseRules], null, 2),
  });

  // Items
  if (ir.systems.items?.length > 0) {
    files.push({
      path: 'public/data/items.json',
      content: JSON.stringify(ir.systems.items, null, 2),
    });
  }

  // Loot tables
  if (ir.systems.lootTables?.length > 0) {
    files.push({
      path: 'public/data/loot_tables.json',
      content: JSON.stringify(ir.systems.lootTables, null, 2),
    });
  }

  // Geography
  files.push({
    path: 'public/data/geography.json',
    content: JSON.stringify({
      terrainSize: ir.geography.terrainSize,
      countries: ir.geography.countries,
      states: ir.geography.states,
      settlements: ir.geography.settlements,
      waterFeatures: ir.geography.waterFeatures,
    }, null, 2),
  });

  // Buildings
  files.push({
    path: 'public/data/buildings.json',
    content: JSON.stringify(ir.entities.buildings, null, 2),
  });

  // Roads
  files.push({
    path: 'public/data/roads.json',
    content: JSON.stringify(ir.entities.roads, null, 2),
  });

  // Nature objects
  files.push({
    path: 'public/data/nature.json',
    content: JSON.stringify(ir.entities.natureObjects, null, 2),
  });

  // Dungeons
  if (ir.entities.dungeons.length > 0) {
    files.push({
      path: 'public/data/dungeons.json',
      content: JSON.stringify(ir.entities.dungeons, null, 2),
    });
  }

  // Theme
  files.push({
    path: 'public/data/theme.json',
    content: JSON.stringify(ir.theme, null, 2),
  });

  // Player config
  files.push({
    path: 'public/data/player.json',
    content: JSON.stringify(ir.player, null, 2),
  });

  // Combat config
  files.push({
    path: 'public/data/combat.json',
    content: JSON.stringify(ir.combat, null, 2),
  });

  // UI config
  files.push({
    path: 'public/data/ui.json',
    content: JSON.stringify(ir.ui, null, 2),
  });

  // Survival (if present)
  if (ir.survival) {
    files.push({
      path: 'public/data/survival.json',
      content: JSON.stringify(ir.survival, null, 2),
    });
  }

  // Resources (if present)
  if (ir.resources) {
    files.push({
      path: 'public/data/resources.json',
      content: JSON.stringify(ir.resources, null, 2),
    });
  }

  // Grammars (for procedural text)
  if (ir.systems.grammars.length > 0) {
    files.push({
      path: 'public/data/grammars.json',
      content: JSON.stringify(ir.systems.grammars, null, 2),
    });
  }

  // Truths (world lore)
  if (ir.systems.truths.length > 0) {
    files.push({
      path: 'public/data/truths.json',
      content: JSON.stringify(ir.systems.truths, null, 2),
    });
  }

  // Prolog knowledge base
  if (ir.systems.knowledgeBase) {
    files.push({
      path: 'public/data/knowledge-base.pl',
      content: ir.systems.knowledgeBase,
    });
  }

  return files;
}
