/**
 * ContextualActionResolver
 *
 * Determines the available actions for a given InteractableTarget.
 * Each action carries French/English labels for language learning,
 * plus energy/duration/tool metadata for the ContextualActionMenu.
 *
 * This resolver is the single source of truth for "what can the player do
 * with this target?" — replacing the hard-coded switch in handleUnifiedInteraction.
 */

import type { InteractableTarget } from '../InteractionPromptSystem';
import type { PlayerActionSystem, PhysicalActionType } from '../PlayerActionSystem';
import type { ContextualAction } from './ContextualActionMenu';

// ── Action icons ─────────────────────────────────────────────────────────────

const PHYSICAL_ACTION_ICONS: Record<string, string> = {
  fishing: '🎣',
  mining: '⛏️',
  harvesting: '🌾',
  cooking: '🍳',
  crafting: '🔨',
  painting: '🎨',
  reading: '📖',
  praying: '🙏',
  sweeping: '🧹',
  chopping: '🪓',
  herbalism: '🌿',
  farm_plant: '🌱',
  farm_water: '💧',
  farm_harvest: '🌾',
};

// ── French action labels ─────────────────────────────────────────────────────

const ACTION_FRENCH_LABELS: Record<string, { label: string; labelTranslation: string }> = {
  // Social
  talk: { label: 'Parler', labelTranslation: 'Talk' },
  eavesdrop: { label: 'Écouter', labelTranslation: 'Eavesdrop' },

  // Navigation
  enter: { label: 'Entrer', labelTranslation: 'Enter' },

  // Examine
  examine: { label: 'Examiner', labelTranslation: 'Examine' },
  read: { label: 'Lire', labelTranslation: 'Read' },
  pick_up: { label: 'Ramasser', labelTranslation: 'Pick Up' },

  // Romance / Social
  give_gift: { label: 'Offrir un cadeau', labelTranslation: 'Give Gift' },

  // Containers
  open: { label: 'Ouvrir', labelTranslation: 'Open' },

  // Furniture
  sit: { label: "S'asseoir", labelTranslation: 'Sit' },
  use: { label: 'Utiliser', labelTranslation: 'Use' },

  // Physical actions
  fishing: { label: 'Pêcher', labelTranslation: 'Fish' },
  mining: { label: 'Miner', labelTranslation: 'Mine' },
  harvesting: { label: 'Récolter', labelTranslation: 'Harvest' },
  cooking: { label: 'Cuisiner', labelTranslation: 'Cook' },
  crafting: { label: 'Fabriquer', labelTranslation: 'Craft' },
  painting: { label: 'Peindre', labelTranslation: 'Paint' },
  reading: { label: 'Lire', labelTranslation: 'Read' },
  praying: { label: 'Prier', labelTranslation: 'Pray' },
  sweeping: { label: 'Balayer', labelTranslation: 'Sweep' },
  chopping: { label: 'Couper', labelTranslation: 'Chop' },
  herbalism: { label: 'Herboriser', labelTranslation: 'Gather Herbs' },
  farm_plant: { label: 'Planter', labelTranslation: 'Plant' },
  farm_water: { label: 'Arroser', labelTranslation: 'Water' },
  farm_harvest: { label: 'Récolter', labelTranslation: 'Harvest' },
};

// ── Context required for resolution ──────────────────────────────────────────

export interface ActionResolverContext {
  /** PlayerActionSystem for checking physical action availability. */
  playerActionSystem: PlayerActionSystem | null;
  /** Nearby action hotspot types (from InteractionPromptSystem). */
  nearbyActionHotspotTypes: string[];
  /** Whether the player is inside a building. */
  isInsideBuilding: boolean;
  /** Current building business type (if inside). */
  currentBusinessType: string | null;
  /** Whether this NPC is a placed interior NPC with business interactions. */
  hasBusinessInteractions: boolean;
  /** Whether the player has items in their inventory (for give_gift). */
  hasInventoryItems: boolean;
}

// ── Resolver ─────────────────────────────────────────────────────────────────

/**
 * Resolve available actions for a target. Returns a flat list of ContextualAction
 * objects suitable for the ContextualActionMenu.
 */
export function resolveActions(
  target: InteractableTarget,
  context: ActionResolverContext,
): ContextualAction[] {
  switch (target.type) {
    case 'npc':
      return resolveNPCActions(target, context);
    case 'npc_eavesdrop':
      return resolveEavesdropActions(target);
    case 'building':
      return resolveBuildingActions(target);
    case 'sign':
    case 'object':
      return resolveObjectActions(target);
    case 'notice_board':
      return resolveNoticeBoardActions(target);
    case 'furniture':
      return resolveFurnitureActions(target);
    case 'action_hotspot':
      return resolvePhysicalActions(target, context);
    case 'container':
      return resolveContainerActions(target);
    case 'crafting_station':
      return resolveCraftingStationActions(target);
    default:
      return [];
  }
}

/**
 * Resolve the menu title for a target.
 */
export function resolveMenuOptions(target: InteractableTarget): { title: string; titleIcon?: string } {
  switch (target.type) {
    case 'npc':
    case 'npc_eavesdrop':
      return { title: target.name, titleIcon: '👤' };
    case 'building':
      return { title: target.name, titleIcon: '🏠' };
    case 'sign':
    case 'object':
      return { title: target.name || 'Object', titleIcon: '🔍' };
    case 'notice_board':
      return { title: target.name || 'Notice Board', titleIcon: '📋' };
    case 'furniture':
      return { title: target.name || 'Furniture', titleIcon: '🪑' };
    case 'action_hotspot':
      return { title: 'Actions', titleIcon: '💪' };
    case 'container':
      return { title: target.name || 'Container', titleIcon: '📦' };
    case 'crafting_station':
      return { title: target.name || 'Crafting Station', titleIcon: '🔨' };
    default:
      return { title: 'Interact' };
  }
}

// ── Per-type resolvers ───────────────────────────────────────────────────────

function resolveNPCActions(
  target: InteractableTarget,
  context: ActionResolverContext,
): ContextualAction[] {
  const actions: ContextualAction[] = [];

  // Talk is always available for NPCs
  actions.push({
    id: '__talk__',
    icon: '💬',
    ...ACTION_FRENCH_LABELS.talk,
    canPerform: true,
    category: 'social',
  });

  // If inside a business and NPC has business interactions, add a business action
  if (context.isInsideBuilding && context.hasBusinessInteractions) {
    actions.push({
      id: '__business__',
      icon: '🏪',
      label: 'Services',
      labelTranslation: 'Business Services',
      canPerform: true,
      category: 'social',
    });
  }

  // Give Gift — physical romance action, available when player has inventory items
  actions.push({
    id: '__give_gift__',
    icon: '🎁',
    ...ACTION_FRENCH_LABELS.give_gift,
    canPerform: context.hasInventoryItems,
    reason: context.hasInventoryItems ? undefined : 'No items to give',
    category: 'social',
  });

  return actions;
}

function resolveEavesdropActions(_target: InteractableTarget): ContextualAction[] {
  return [{
    id: '__eavesdrop__',
    icon: '👂',
    ...ACTION_FRENCH_LABELS.eavesdrop,
    canPerform: true,
    category: 'social',
  }];
}

function resolveBuildingActions(target: InteractableTarget): ContextualAction[] {
  return [{
    id: '__enter_building__',
    icon: '🚪',
    ...ACTION_FRENCH_LABELS.enter,
    description: target.name,
    canPerform: true,
    category: 'navigation',
  }];
}

function resolveObjectActions(target: InteractableTarget): ContextualAction[] {
  const actions: ContextualAction[] = [];

  // Check if it's a book that can be picked up
  if (target.objectRole === 'book' && target.mesh.metadata?.bookData) {
    actions.push({
      id: '__pick_up_book__',
      icon: '📕',
      ...ACTION_FRENCH_LABELS.pick_up,
      canPerform: true,
      category: 'inventory',
    });
  } else if (target.possessable) {
    // Any possessable world item can be picked up
    actions.push({
      id: '__pick_up__',
      icon: '🤲',
      ...ACTION_FRENCH_LABELS.pick_up,
      canPerform: true,
      category: 'inventory',
    });
  }

  // Examine is always available
  actions.push({
    id: '__examine__',
    icon: '🔍',
    ...ACTION_FRENCH_LABELS.examine,
    canPerform: true,
    category: 'examine',
  });

  return actions;
}

function resolveNoticeBoardActions(_target: InteractableTarget): ContextualAction[] {
  return [{
    id: '__read_notice_board__',
    icon: '📋',
    ...ACTION_FRENCH_LABELS.read,
    canPerform: true,
    category: 'examine',
  }];
}

function resolveFurnitureActions(target: InteractableTarget): ContextualAction[] {
  const actions: ContextualAction[] = [];
  const fType = target.furnitureType;

  if (fType === 'seat' || fType === 'bed') {
    actions.push({
      id: '__furniture_sit__',
      icon: fType === 'bed' ? '🛏️' : '🪑',
      ...ACTION_FRENCH_LABELS.sit,
      canPerform: true,
      category: 'physical',
    });
  } else if (fType === 'bookshelf') {
    actions.push({
      id: '__furniture_read__',
      icon: '📚',
      ...ACTION_FRENCH_LABELS.read,
      canPerform: true,
      category: 'examine',
    });
  } else if (fType === 'workstation') {
    actions.push({
      id: '__furniture_use__',
      icon: '🔧',
      ...ACTION_FRENCH_LABELS.use,
      canPerform: true,
      category: 'physical',
    });
  } else {
    // Generic furniture interaction
    actions.push({
      id: '__furniture_use__',
      icon: '✋',
      ...ACTION_FRENCH_LABELS.use,
      canPerform: true,
      category: 'physical',
    });
  }

  return actions;
}

function resolvePhysicalActions(
  target: InteractableTarget,
  context: ActionResolverContext,
): ContextualAction[] {
  if (!context.playerActionSystem) return [];

  // Gather all nearby action hotspot types (not just the targeted one)
  const hotspotTypes = context.nearbyActionHotspotTypes.length > 0
    ? context.nearbyActionHotspotTypes
    : target.actionHotspotType ? [target.actionHotspotType] : [];

  if (hotspotTypes.length === 0) return [];

  const availability = context.playerActionSystem.checkAvailability(
    hotspotTypes as PhysicalActionType[],
  );

  return availability.map((entry) => {
    const frenchLabels = ACTION_FRENCH_LABELS[entry.definition.type] ?? {
      label: entry.definition.displayName,
      labelTranslation: entry.definition.displayName,
    };

    return {
      id: `__physical_${entry.definition.type}__`,
      icon: PHYSICAL_ACTION_ICONS[entry.definition.type] ?? '⚙️',
      ...frenchLabels,
      energyCost: entry.definition.energyCost,
      duration: entry.definition.duration,
      requiredTool: entry.definition.requiredTool,
      canPerform: entry.canPerform,
      reason: entry.reason,
      category: 'physical' as const,
    };
  });
}

function resolveContainerActions(target: InteractableTarget): ContextualAction[] {
  const actions: ContextualAction[] = [];

  actions.push({
    id: '__open_container__',
    icon: target.containerType === 'chest' ? '🗃️' : target.containerType === 'barrel' ? '🛢️' : '📦',
    ...ACTION_FRENCH_LABELS.open,
    description: target.name,
    canPerform: true,
    category: 'inventory',
  });

  return actions;
}

function resolveCraftingStationActions(target: InteractableTarget): ContextualAction[] {
  const stationType = target.craftingStationType ?? 'workbench';
  const labels: Record<string, { label: string; labelTranslation: string; icon: string }> = {
    kitchen_stove: { label: 'Cuisiner', labelTranslation: 'Cook', icon: '🍳' },
    alchemy_table: { label: 'Préparer', labelTranslation: 'Brew', icon: '⚗️' },
    workbench: { label: 'Fabriquer', labelTranslation: 'Craft', icon: '🔨' },
  };
  const info = labels[stationType] ?? labels.workbench;

  return [{
    id: `__craft_at_${stationType}__`,
    icon: info.icon,
    label: info.label,
    labelTranslation: info.labelTranslation,
    canPerform: true,
    category: 'physical',
  }];
}
