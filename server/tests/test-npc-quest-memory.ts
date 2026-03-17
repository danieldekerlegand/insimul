/**
 * Unit tests for NPC quest interaction memory service
 *
 * Tests:
 * - Memory stores, retrieves, and updates correctly
 * - Quest assignment tracking
 * - Quest outcome recording (completed, failed, abandoned)
 * - Reliability scoring
 * - Disposition calculation
 * - Dialogue context generation
 * - Interaction capping
 * - Multiple NPC-player pairs
 */

import {
  NPCQuestMemoryService,
  InMemoryQuestMemoryStorage,
  getPlayerReliability,
  getQuestDisposition,
} from '../services/conversation/npc-quest-memory.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  PASS: ${message}`);
    passed++;
  } else {
    console.error(`  FAIL: ${message}`);
    failed++;
  }
}

const NPC_ID = 'npc-001';
const PLAYER_ID = 'player-001';
const WORLD_ID = 'world-001';

// ── Tests ────────────────────────────────────────────────────────────

async function testGetMemoryReturnsNullForNewPair() {
  console.log('\n--- getMemory returns null for new pair ---');
  const storage = new InMemoryQuestMemoryStorage();
  const service = new NPCQuestMemoryService(storage);
  const memory = await service.getMemory(NPC_ID, PLAYER_ID, WORLD_ID);
  assert(memory === null, 'New NPC-player pair returns null');
}

async function testRecordQuestAssigned() {
  console.log('\n--- recordQuestAssigned creates entry ---');
  const storage = new InMemoryQuestMemoryStorage();
  const service = new NPCQuestMemoryService(storage);

  const memory = await service.recordQuestAssigned(NPC_ID, PLAYER_ID, WORLD_ID, 'quest-1', 'Find the Gem');

  assert(memory !== null, 'Memory is created');
  assert(memory.npcId === NPC_ID, 'NPC ID matches');
  assert(memory.playerId === PLAYER_ID, 'Player ID matches');
  assert(memory.worldId === WORLD_ID, 'World ID matches');
  assert(memory.totalQuestsGiven === 1, 'Total quests given is 1');
  assert(memory.questInteractions.length === 1, 'One interaction recorded');
  assert(memory.questInteractions[0].questId === 'quest-1', 'Quest ID matches');
  assert(memory.questInteractions[0].questTitle === 'Find the Gem', 'Quest title matches');
  assert(memory.questInteractions[0].outcome === 'assigned', 'Outcome is assigned');
  assert(memory.questInteractions[0].resolvedAt === null, 'Not yet resolved');
}

async function testMultipleQuestAssignments() {
  console.log('\n--- Multiple quest assignments ---');
  const storage = new InMemoryQuestMemoryStorage();
  const service = new NPCQuestMemoryService(storage);

  await service.recordQuestAssigned(NPC_ID, PLAYER_ID, WORLD_ID, 'quest-1', 'Find the Gem');
  const memory = await service.recordQuestAssigned(NPC_ID, PLAYER_ID, WORLD_ID, 'quest-2', 'Deliver the Letter');

  assert(memory.totalQuestsGiven === 2, 'Total quests given is 2');
  assert(memory.questInteractions.length === 2, 'Two interactions recorded');
}

async function testRecordQuestCompleted() {
  console.log('\n--- recordQuestOutcome completed ---');
  const storage = new InMemoryQuestMemoryStorage();
  const service = new NPCQuestMemoryService(storage);

  await service.recordQuestAssigned(NPC_ID, PLAYER_ID, WORLD_ID, 'quest-1', 'Find the Gem');
  const memory = await service.recordQuestOutcome(NPC_ID, PLAYER_ID, WORLD_ID, 'quest-1', 'completed');

  assert(memory.completedCount === 1, 'Completed count is 1');
  assert(memory.failedCount === 0, 'Failed count is 0');
  assert(memory.abandonedCount === 0, 'Abandoned count is 0');
  assert(memory.questInteractions[0].outcome === 'completed', 'Outcome updated to completed');
  assert(memory.questInteractions[0].resolvedAt !== null, 'Resolved timestamp set');
}

async function testRecordQuestFailed() {
  console.log('\n--- recordQuestOutcome failed ---');
  const storage = new InMemoryQuestMemoryStorage();
  const service = new NPCQuestMemoryService(storage);

  await service.recordQuestAssigned(NPC_ID, PLAYER_ID, WORLD_ID, 'quest-1', 'Find the Gem');
  const memory = await service.recordQuestOutcome(NPC_ID, PLAYER_ID, WORLD_ID, 'quest-1', 'failed');

  assert(memory.completedCount === 0, 'Completed count is 0');
  assert(memory.failedCount === 1, 'Failed count is 1');
  assert(memory.questInteractions[0].outcome === 'failed', 'Outcome updated to failed');
}

async function testRecordQuestAbandoned() {
  console.log('\n--- recordQuestOutcome abandoned ---');
  const storage = new InMemoryQuestMemoryStorage();
  const service = new NPCQuestMemoryService(storage);

  await service.recordQuestAssigned(NPC_ID, PLAYER_ID, WORLD_ID, 'quest-1', 'Find the Gem');
  const memory = await service.recordQuestOutcome(NPC_ID, PLAYER_ID, WORLD_ID, 'quest-1', 'abandoned');

  assert(memory.abandonedCount === 1, 'Abandoned count is 1');
  assert(memory.questInteractions[0].outcome === 'abandoned', 'Outcome updated to abandoned');
}

async function testOutcomeWithoutPriorAssignment() {
  console.log('\n--- Outcome without prior assignment ---');
  const storage = new InMemoryQuestMemoryStorage();
  const service = new NPCQuestMemoryService(storage);

  // Record a completion for a quest that wasn't tracked via this NPC
  const memory = await service.recordQuestOutcome(NPC_ID, PLAYER_ID, WORLD_ID, 'quest-orphan', 'completed');

  assert(memory.totalQuestsGiven === 1, 'Creates a minimal record');
  assert(memory.completedCount === 1, 'Completed count is 1');
  assert(memory.questInteractions.length === 1, 'One interaction');
}

async function testReliabilityScoring() {
  console.log('\n--- Reliability scoring ---');
  const storage = new InMemoryQuestMemoryStorage();
  const service = new NPCQuestMemoryService(storage);

  // No history => neutral 0.5
  const empty = await service.recordQuestAssigned(NPC_ID, PLAYER_ID, WORLD_ID, 'q1', 'Quest 1');
  assert(getPlayerReliability(empty) === 0.5, 'Neutral reliability for no resolved quests');

  // 1 completed
  await service.recordQuestOutcome(NPC_ID, PLAYER_ID, WORLD_ID, 'q1', 'completed');
  let memory = (await service.getMemory(NPC_ID, PLAYER_ID, WORLD_ID))!;
  assert(getPlayerReliability(memory) === 1.0, 'Perfect reliability with 1 completion');

  // Add a failure
  await service.recordQuestAssigned(NPC_ID, PLAYER_ID, WORLD_ID, 'q2', 'Quest 2');
  await service.recordQuestOutcome(NPC_ID, PLAYER_ID, WORLD_ID, 'q2', 'failed');
  memory = (await service.getMemory(NPC_ID, PLAYER_ID, WORLD_ID))!;
  assert(getPlayerReliability(memory) === 0.5, '50% reliability with 1 complete, 1 fail');
}

async function testDispositionCalculation() {
  console.log('\n--- Disposition calculation ---');
  const storage = new InMemoryQuestMemoryStorage();
  const service = new NPCQuestMemoryService(storage);

  // High reliability => eager
  await service.recordQuestAssigned(NPC_ID, PLAYER_ID, WORLD_ID, 'q1', 'Q1');
  await service.recordQuestOutcome(NPC_ID, PLAYER_ID, WORLD_ID, 'q1', 'completed');
  let memory = (await service.getMemory(NPC_ID, PLAYER_ID, WORLD_ID))!;
  assert(getQuestDisposition(memory) === 'eager', 'Eager after successful completion');

  // Mixed => cautious
  await service.recordQuestAssigned(NPC_ID, PLAYER_ID, WORLD_ID, 'q2', 'Q2');
  await service.recordQuestOutcome(NPC_ID, PLAYER_ID, WORLD_ID, 'q2', 'failed');
  memory = (await service.getMemory(NPC_ID, PLAYER_ID, WORLD_ID))!;
  assert(getQuestDisposition(memory) === 'cautious', 'Cautious with mixed results');

  // All failed => reluctant
  const storage2 = new InMemoryQuestMemoryStorage();
  const service2 = new NPCQuestMemoryService(storage2);
  await service2.recordQuestAssigned(NPC_ID, PLAYER_ID, WORLD_ID, 'q1', 'Q1');
  await service2.recordQuestOutcome(NPC_ID, PLAYER_ID, WORLD_ID, 'q1', 'failed');
  memory = (await service2.getMemory(NPC_ID, PLAYER_ID, WORLD_ID))!;
  assert(getQuestDisposition(memory) === 'reluctant', 'Reluctant after all failures');
}

async function testGetInteractionsByOutcome() {
  console.log('\n--- Get interactions by outcome ---');
  const storage = new InMemoryQuestMemoryStorage();
  const service = new NPCQuestMemoryService(storage);

  await service.recordQuestAssigned(NPC_ID, PLAYER_ID, WORLD_ID, 'q1', 'Quest 1');
  await service.recordQuestAssigned(NPC_ID, PLAYER_ID, WORLD_ID, 'q2', 'Quest 2');
  await service.recordQuestAssigned(NPC_ID, PLAYER_ID, WORLD_ID, 'q3', 'Quest 3');
  await service.recordQuestOutcome(NPC_ID, PLAYER_ID, WORLD_ID, 'q1', 'completed');
  await service.recordQuestOutcome(NPC_ID, PLAYER_ID, WORLD_ID, 'q2', 'failed');

  const completed = await service.getInteractionsByOutcome(NPC_ID, PLAYER_ID, WORLD_ID, 'completed');
  const failed = await service.getInteractionsByOutcome(NPC_ID, PLAYER_ID, WORLD_ID, 'failed');
  const assigned = await service.getInteractionsByOutcome(NPC_ID, PLAYER_ID, WORLD_ID, 'assigned');

  assert(completed.length === 1, 'One completed interaction');
  assert(failed.length === 1, 'One failed interaction');
  assert(assigned.length === 1, 'One still-assigned interaction');
}

async function testGetInteractionsForUnknownPair() {
  console.log('\n--- Get interactions for unknown pair ---');
  const storage = new InMemoryQuestMemoryStorage();
  const service = new NPCQuestMemoryService(storage);

  const result = await service.getInteractionsByOutcome(NPC_ID, PLAYER_ID, WORLD_ID, 'completed');
  assert(result.length === 0, 'Empty array for unknown pair');
}

async function testDialogueContextGeneration() {
  console.log('\n--- Dialogue context generation ---');
  const storage = new InMemoryQuestMemoryStorage();
  const service = new NPCQuestMemoryService(storage);

  // No history => null
  let context = await service.getQuestContextForDialogue(NPC_ID, PLAYER_ID, WORLD_ID);
  assert(context === null, 'Null context for no history');

  // With history
  await service.recordQuestAssigned(NPC_ID, PLAYER_ID, WORLD_ID, 'q1', 'Find the Gem');
  await service.recordQuestOutcome(NPC_ID, PLAYER_ID, WORLD_ID, 'q1', 'completed');
  await service.recordQuestAssigned(NPC_ID, PLAYER_ID, WORLD_ID, 'q2', 'Deliver Letter');
  await service.recordQuestOutcome(NPC_ID, PLAYER_ID, WORLD_ID, 'q2', 'failed');

  context = await service.getQuestContextForDialogue(NPC_ID, PLAYER_ID, WORLD_ID);
  assert(context !== null, 'Context generated');
  assert(context!.includes('2 quest(s)'), 'Mentions total quests');
  assert(context!.includes('1 completed'), 'Mentions completions');
  assert(context!.includes('1 failed'), 'Mentions failures');
  assert(context!.includes('cautious'), 'Mentions disposition');
  assert(context!.includes('Deliver Letter'), 'Mentions last quest title');
}

async function testMultipleNPCPlayerPairs() {
  console.log('\n--- Multiple NPC-player pairs ---');
  const storage = new InMemoryQuestMemoryStorage();
  const service = new NPCQuestMemoryService(storage);

  await service.recordQuestAssigned('npc-A', 'player-1', WORLD_ID, 'q1', 'Q1');
  await service.recordQuestAssigned('npc-B', 'player-1', WORLD_ID, 'q2', 'Q2');
  await service.recordQuestAssigned('npc-A', 'player-2', WORLD_ID, 'q3', 'Q3');

  const memA1 = await service.getMemory('npc-A', 'player-1', WORLD_ID);
  const memB1 = await service.getMemory('npc-B', 'player-1', WORLD_ID);
  const memA2 = await service.getMemory('npc-A', 'player-2', WORLD_ID);
  const memNone = await service.getMemory('npc-B', 'player-2', WORLD_ID);

  assert(memA1 !== null, 'NPC-A / Player-1 has memory');
  assert(memB1 !== null, 'NPC-B / Player-1 has memory');
  assert(memA2 !== null, 'NPC-A / Player-2 has memory');
  assert(memNone === null, 'NPC-B / Player-2 has no memory');
  assert(memA1!.questInteractions[0].questId === 'q1', 'Correct quest for pair A-1');
  assert(memB1!.questInteractions[0].questId === 'q2', 'Correct quest for pair B-1');
}

async function testReliabilityEdgeCases() {
  console.log('\n--- Reliability edge cases ---');

  // All abandoned
  const storage = new InMemoryQuestMemoryStorage();
  const service = new NPCQuestMemoryService(storage);
  await service.recordQuestAssigned(NPC_ID, PLAYER_ID, WORLD_ID, 'q1', 'Q1');
  await service.recordQuestOutcome(NPC_ID, PLAYER_ID, WORLD_ID, 'q1', 'abandoned');
  const memory = (await service.getMemory(NPC_ID, PLAYER_ID, WORLD_ID))!;
  assert(getPlayerReliability(memory) === 0, 'Zero reliability when all abandoned');
  assert(getQuestDisposition(memory) === 'reluctant', 'Reluctant when all abandoned');
}

// ── Runner ───────────────────────────────────────────────────────────

async function run() {
  console.log('=== NPC Quest Interaction Memory Service Tests ===\n');

  await testGetMemoryReturnsNullForNewPair();
  await testRecordQuestAssigned();
  await testMultipleQuestAssignments();
  await testRecordQuestCompleted();
  await testRecordQuestFailed();
  await testRecordQuestAbandoned();
  await testOutcomeWithoutPriorAssignment();
  await testReliabilityScoring();
  await testDispositionCalculation();
  await testGetInteractionsByOutcome();
  await testGetInteractionsForUnknownPair();
  await testDialogueContextGeneration();
  await testMultipleNPCPlayerPairs();
  await testReliabilityEdgeCases();

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});
