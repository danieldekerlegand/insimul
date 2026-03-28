/**
 * ActionHotspotGenerator
 *
 * Generates physical action hotspot locations during world generation.
 * Places fishing spots near water, herb gathering spots in forests/gardens,
 * cooking stations in restaurants/homes, and mining spots near rock formations.
 *
 * Each hotspot carries vocabulary metadata so completing an action teaches
 * the player the target-language words for items produced.
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface ActionHotspot {
  id: string;
  actionType: string;
  position: { x: number; z: number };
  locationId: string;
  locationName: string;
  /** Vocabulary taught when action is performed here */
  vocabulary: HotspotVocabulary[];
  /** Visual indicator type for the hotspot */
  indicatorType: 'particle' | 'ground_marker' | 'glow';
}

export interface HotspotVocabulary {
  targetWord: string;
  translation: string;
  category: string;
}

export interface WorldLocation {
  id: string;
  name: string;
  type: string;
  position?: { x: number; z: number };
  businessType?: string;
  hasWater?: boolean;
  hasForest?: boolean;
  hasGarden?: boolean;
  hasRocks?: boolean;
}

// ── Hotspot vocabulary definitions ───────────────────────────────────────────

const FISHING_VOCABULARY: HotspotVocabulary[] = [
  { targetWord: 'poisson', translation: 'fish', category: 'food' },
  { targetWord: 'rivière', translation: 'river', category: 'nature' },
  { targetWord: 'lac', translation: 'lake', category: 'nature' },
  { targetWord: 'canne à pêche', translation: 'fishing rod', category: 'tool' },
  { targetWord: 'eau', translation: 'water', category: 'nature' },
];

const HERBALISM_VOCABULARY: HotspotVocabulary[] = [
  { targetWord: 'herbe', translation: 'herb', category: 'plant' },
  { targetWord: 'jardin', translation: 'garden', category: 'place' },
  { targetWord: 'fleur', translation: 'flower', category: 'plant' },
  { targetWord: 'feuille', translation: 'leaf', category: 'plant' },
  { targetWord: 'racine', translation: 'root', category: 'plant' },
];

const COOKING_VOCABULARY: HotspotVocabulary[] = [
  { targetWord: 'cuisine', translation: 'cooking/kitchen', category: 'activity' },
  { targetWord: 'repas', translation: 'meal', category: 'food' },
  { targetWord: 'recette', translation: 'recipe', category: 'food' },
  { targetWord: 'four', translation: 'oven', category: 'tool' },
  { targetWord: 'casserole', translation: 'pot', category: 'tool' },
];

const MINING_VOCABULARY: HotspotVocabulary[] = [
  { targetWord: 'pierre', translation: 'stone', category: 'material' },
  { targetWord: 'minerai', translation: 'ore', category: 'material' },
  { targetWord: 'pioche', translation: 'pickaxe', category: 'tool' },
  { targetWord: 'mine', translation: 'mine', category: 'place' },
  { targetWord: 'fer', translation: 'iron', category: 'material' },
];

const CRAFTING_VOCABULARY: HotspotVocabulary[] = [
  { targetWord: 'forge', translation: 'forge', category: 'place' },
  { targetWord: 'marteau', translation: 'hammer', category: 'tool' },
  { targetWord: 'enclume', translation: 'anvil', category: 'tool' },
  { targetWord: 'bois', translation: 'wood', category: 'material' },
  { targetWord: 'atelier', translation: 'workshop', category: 'place' },
];

// ── Action → environment matching rules ──────────────────────────────────────

interface HotspotRule {
  actionType: string;
  matchCondition: (loc: WorldLocation) => boolean;
  vocabulary: HotspotVocabulary[];
  indicatorType: 'particle' | 'ground_marker' | 'glow';
}

const HOTSPOT_RULES: HotspotRule[] = [
  {
    actionType: 'fishing',
    matchCondition: (loc) => !!loc.hasWater || ['river', 'lake', 'pond', 'marsh', 'canal', 'dock', 'harbor', 'port'].includes(loc.type),
    vocabulary: FISHING_VOCABULARY,
    indicatorType: 'particle',
  },
  {
    actionType: 'herbalism',
    matchCondition: (loc) => !!loc.hasForest || !!loc.hasGarden || ['forest', 'garden', 'meadow', 'farm', 'greenhouse', 'grove'].includes(loc.type) || loc.businessType === 'HerbShop',
    vocabulary: HERBALISM_VOCABULARY,
    indicatorType: 'ground_marker',
  },
  {
    actionType: 'cooking',
    matchCondition: (loc) => ['Restaurant', 'Bakery', 'Tavern', 'Inn'].includes(loc.businessType || '') || loc.type === 'residence',
    vocabulary: COOKING_VOCABULARY,
    indicatorType: 'glow',
  },
  {
    actionType: 'mining',
    matchCondition: (loc) => !!loc.hasRocks || ['mine', 'quarry', 'cave', 'mountain'].includes(loc.type) || loc.businessType === 'Blacksmith',
    vocabulary: MINING_VOCABULARY,
    indicatorType: 'ground_marker',
  },
  {
    actionType: 'crafting',
    matchCondition: (loc) => ['Blacksmith', 'Carpenter', 'Workshop'].includes(loc.businessType || ''),
    vocabulary: CRAFTING_VOCABULARY,
    indicatorType: 'glow',
  },
];

// ── Generator ────────────────────────────────────────────────────────────────

export class ActionHotspotGenerator {
  /**
   * Generate action hotspots for a list of world locations.
   * Returns hotspots placed at appropriate locations based on location type,
   * business type, and terrain features.
   */
  static generate(locations: WorldLocation[]): ActionHotspot[] {
    const hotspots: ActionHotspot[] = [];
    let idCounter = 0;

    for (const loc of locations) {
      if (!loc.position) continue;

      for (const rule of HOTSPOT_RULES) {
        if (rule.matchCondition(loc)) {
          // Offset hotspot slightly from the location center
          const offset = ActionHotspotGenerator.getOffset(idCounter);
          hotspots.push({
            id: `hotspot-${idCounter++}`,
            actionType: rule.actionType,
            position: {
              x: loc.position.x + offset.x,
              z: loc.position.z + offset.z,
            },
            locationId: loc.id,
            locationName: loc.name,
            vocabulary: rule.vocabulary,
            indicatorType: rule.indicatorType,
          });
        }
      }
    }

    return hotspots;
  }

  /**
   * Generate quest suggestions that use hotspots.
   * Returns quest templates that reference specific hotspot locations.
   */
  static generateQuestSuggestions(hotspots: ActionHotspot[]): Array<{
    actionType: string;
    questDescription: string;
    vocabulary: HotspotVocabulary[];
    locationName: string;
  }> {
    const suggestions: Array<{
      actionType: string;
      questDescription: string;
      vocabulary: HotspotVocabulary[];
      locationName: string;
    }> = [];

    const QUEST_TEMPLATES: Record<string, string> = {
      fishing: 'Catch a fish at the {location}',
      herbalism: 'Gather herbs from the {location}',
      cooking: 'Cook a meal at the {location}',
      mining: 'Mine ore at the {location}',
      crafting: 'Craft an item at the {location}',
    };

    for (const hotspot of hotspots) {
      const template = QUEST_TEMPLATES[hotspot.actionType];
      if (!template) continue;

      suggestions.push({
        actionType: hotspot.actionType,
        questDescription: template.replace('{location}', hotspot.locationName),
        vocabulary: hotspot.vocabulary,
        locationName: hotspot.locationName,
      });
    }

    return suggestions;
  }

  private static getOffset(index: number): { x: number; z: number } {
    // Spread hotspots in a small circle around the location
    const angle = (index * 137.5 * Math.PI) / 180; // golden angle
    const radius = 2;
    return {
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
    };
  }
}
