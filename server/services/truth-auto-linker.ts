/**
 * Truth Auto-Linker Service
 *
 * When a truth entry is created or updated, scans its content and title for
 * references to known entities (rules, actions, quests, items, characters,
 * locations) and creates bidirectional `relatedTruthIds` links.
 *
 * Also scans entity content for truth references and links back.
 */

import type { IStorage } from '../db/storage';

/** Entity types that support relatedTruthIds */
type LinkableEntityType = 'rule' | 'action' | 'quest' | 'item' | 'grammar' | 'language';

interface LinkResult {
  truthId: string;
  linkedEntities: Array<{ type: LinkableEntityType; id: string; name: string }>;
  linkedTruths: string[];
}

/**
 * Scan truth content for entity references and create bidirectional links.
 * Call after creating or updating a truth entry.
 */
export async function autoLinkTruth(
  storage: IStorage,
  truthId: string,
  worldId: string,
): Promise<LinkResult> {
  const truth = await storage.getTruth(truthId);
  if (!truth) {
    return { truthId, linkedEntities: [], linkedTruths: [] };
  }

  const searchText = `${truth.title} ${truth.content}`.toLowerCase();
  const linkedEntities: LinkResult['linkedEntities'] = [];

  // Fetch all entities for this world in parallel
  const [rules, actions, quests, items] = await Promise.all([
    storage.getRulesByWorld(worldId),
    storage.getActionsByWorld(worldId),
    storage.getQuestsByWorld(worldId),
    storage.getItemsByWorld(worldId),
  ]);

  // Check rules for name/ID matches
  for (const rule of rules) {
    if (isReferenced(searchText, rule.id, rule.name)) {
      linkedEntities.push({ type: 'rule', id: rule.id, name: rule.name });
      await addTruthIdToEntity(storage, 'rule', rule.id, truthId, rule.relatedTruthIds);
    }
  }

  // Check actions
  for (const action of actions) {
    if (isReferenced(searchText, action.id, action.name)) {
      linkedEntities.push({ type: 'action', id: action.id, name: action.name });
      await addTruthIdToEntity(storage, 'action', action.id, truthId, action.relatedTruthIds);
    }
  }

  // Check quests
  for (const quest of quests) {
    const questName = quest.title ?? quest.description ?? '';
    if (isReferenced(searchText, quest.id, questName)) {
      linkedEntities.push({ type: 'quest', id: quest.id, name: questName });
      await addTruthIdToEntity(storage, 'quest', quest.id, truthId, quest.relatedTruthIds);
    }
  }

  // Check items
  for (const item of items) {
    if (isReferenced(searchText, item.id, item.name)) {
      linkedEntities.push({ type: 'item', id: item.id, name: item.name });
      await addTruthIdToEntity(storage, 'item', item.id, truthId, item.relatedTruthIds);
    }
  }

  // Also scan for truth-to-truth references (e.g., content mentions another truth's title)
  const allTruths = await storage.getTruthsByWorld(worldId);
  const linkedTruths: string[] = [];

  for (const otherTruth of allTruths) {
    if (otherTruth.id === truthId) continue;
    // Check if this truth references another truth by title
    if (otherTruth.title && searchText.includes(otherTruth.title.toLowerCase())) {
      linkedTruths.push(otherTruth.id);
      // Add causal link if not already present
      const existingCauses = (truth.causesTruthIds as string[]) || [];
      if (!existingCauses.includes(otherTruth.id)) {
        await storage.updateTruth(truthId, {
          causesTruthIds: [...existingCauses, otherTruth.id],
        });
      }
    }
  }

  return { truthId, linkedEntities, linkedTruths };
}

/**
 * Scan all entities in a world for truth references and create links.
 * Useful as a batch operation after importing truths.
 */
export async function autoLinkAllTruths(
  storage: IStorage,
  worldId: string,
): Promise<{ processed: number; linksCreated: number }> {
  const truths = await storage.getTruthsByWorld(worldId);
  let linksCreated = 0;

  for (const truth of truths) {
    const result = await autoLinkTruth(storage, truth.id, worldId);
    linksCreated += result.linkedEntities.length + result.linkedTruths.length;
  }

  return { processed: truths.length, linksCreated };
}

/**
 * Reverse scan: check if an entity's content references any truths and link them.
 * Call after creating or updating a rule/action/quest/item.
 */
export async function autoLinkEntityToTruths(
  storage: IStorage,
  entityType: LinkableEntityType,
  entityId: string,
  entityContent: string,
  worldId: string,
  existingTruthIds: string[] = [],
): Promise<string[]> {
  const truths = await storage.getTruthsByWorld(worldId);
  const searchText = entityContent.toLowerCase();
  const newTruthIds = [...existingTruthIds];

  for (const truth of truths) {
    if (newTruthIds.includes(truth.id)) continue;
    if (truth.title && searchText.includes(truth.title.toLowerCase())) {
      newTruthIds.push(truth.id);
    }
  }

  // Update the entity if new links were found
  if (newTruthIds.length > existingTruthIds.length) {
    await updateEntityTruthIds(storage, entityType, entityId, newTruthIds);
  }

  return newTruthIds;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function isReferenced(searchText: string, id: string, name: string): boolean {
  // Check by ID (exact match as a word boundary)
  if (searchText.includes(id.toLowerCase())) return true;
  // Check by name (must be 3+ chars to avoid false positives)
  if (name && name.length >= 3 && searchText.includes(name.toLowerCase())) return true;
  return false;
}

async function addTruthIdToEntity(
  storage: IStorage,
  entityType: LinkableEntityType,
  entityId: string,
  truthId: string,
  existingTruthIds?: string[] | null,
): Promise<void> {
  const existing = existingTruthIds || [];
  if (existing.includes(truthId)) return;
  const updated = [...existing, truthId];
  await updateEntityTruthIds(storage, entityType, entityId, updated);
}

async function updateEntityTruthIds(
  storage: IStorage,
  entityType: LinkableEntityType,
  entityId: string,
  truthIds: string[],
): Promise<void> {
  switch (entityType) {
    case 'rule':
      await storage.updateRule(entityId, { relatedTruthIds: truthIds });
      break;
    case 'action':
      await storage.updateAction(entityId, { relatedTruthIds: truthIds });
      break;
    case 'quest':
      await storage.updateQuest(entityId, { relatedTruthIds: truthIds });
      break;
    case 'item':
      await storage.updateItem(entityId, { relatedTruthIds: truthIds });
      break;
    case 'grammar':
      await storage.updateGrammar(entityId, { relatedTruthIds: truthIds });
      break;
    case 'language':
      // Languages use a different update method
      await storage.updateWorldLanguage(entityId, { relatedTruthIds: truthIds } as any);
      break;
  }
}
