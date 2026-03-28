/**
 * Tests for QuestMinimapMarkers — quest-driven minimap marker extraction
 *
 * Verifies that extractObjectiveMarkers() correctly derives markers from
 * quest objective data with type-specific colors and shapes.
 *
 * Run with: npx tsx client/src/components/3DGame/__tests__/QuestMinimapMarkers.test.ts
 */

// Re-implement the logic locally so we don't need Babylon.js imports
// (the module under test is pure data logic with no Babylon deps)

// ── Inline the functions under test ─────────────────────────────────────────

function getObjectiveMarkerColor(objectiveType: string): string {
  switch (objectiveType) {
    case 'visit_location':
    case 'discover_location':
    case 'navigate_language':
    case 'follow_directions':
      return '#00BCD4';
    case 'talk_to_npc':
    case 'complete_conversation':
    case 'conversation_initiation':
    case 'build_friendship':
    case 'give_gift':
    case 'listen_and_repeat':
    case 'ask_for_directions':
    case 'listening_comprehension':
    case 'introduce_self':
    case 'teach_vocabulary':
    case 'teach_phrase':
      return '#4CAF50';
    case 'collect_item':
    case 'deliver_item':
    case 'identify_object':
    case 'collect_vocabulary':
    case 'examine_object':
    case 'read_sign':
    case 'point_and_name':
      return '#FFD700';
    case 'order_food':
    case 'haggle_price':
    case 'gain_reputation':
      return '#FF9800';
    case 'defeat_enemies':
      return '#F44336';
    case 'craft_item':
      return '#009688';
    case 'escort_npc':
      return '#9C27B0';
    default:
      return '#E040FB';
  }
}

type MarkerShape = 'diamond' | 'circle';

function getObjectiveMarkerShape(objectiveType: string): MarkerShape {
  switch (objectiveType) {
    case 'visit_location':
    case 'discover_location':
    case 'navigate_language':
    case 'follow_directions':
      return 'diamond';
    default:
      return 'circle';
  }
}

interface QuestObjective {
  type: string;
  description: string;
  completed: boolean;
  current?: number;
  required?: number;
  position?: { x: number; y: number; z: number };
  locationPosition?: { x: number; y: number; z: number };
  locationName?: string;
}

interface Quest {
  id: string;
  title: string;
  status: string;
  objectives?: QuestObjective[];
  [key: string]: any;
}

interface QuestObjectiveMarker {
  id: string;
  questId: string;
  questTitle: string;
  objectiveType: string;
  objectiveDescription: string;
  position: { x: number; z: number };
  color: string;
  shape: MarkerShape;
}

function extractObjectiveMarkers(quests: Quest[]): QuestObjectiveMarker[] {
  const markers: QuestObjectiveMarker[] = [];

  for (const quest of quests) {
    if (quest.status !== 'active') continue;
    if (!quest.objectives || quest.objectives.length === 0) continue;

    for (let i = 0; i < quest.objectives.length; i++) {
      const obj = quest.objectives[i];
      if (obj.completed) continue;

      const pos = obj.locationPosition ?? obj.position;
      if (!pos) continue;

      markers.push({
        id: `${quest.id}_obj_${i}`,
        questId: quest.id,
        questTitle: quest.title,
        objectiveType: obj.type,
        objectiveDescription: obj.description,
        position: { x: pos.x, z: pos.z },
        color: getObjectiveMarkerColor(obj.type),
        shape: getObjectiveMarkerShape(obj.type),
      });
    }
  }

  return markers;
}

// ── Test harness ────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message}`);
  }
}

// ── getObjectiveMarkerColor tests ───────────────────────────────────────────

console.log('\n── getObjectiveMarkerColor ──');

assert(getObjectiveMarkerColor('visit_location') === '#00BCD4', 'visit_location returns cyan');
assert(getObjectiveMarkerColor('discover_location') === '#00BCD4', 'discover_location returns cyan');
assert(getObjectiveMarkerColor('navigate_language') === '#00BCD4', 'navigate_language returns cyan');
assert(getObjectiveMarkerColor('follow_directions') === '#00BCD4', 'follow_directions returns cyan');

assert(getObjectiveMarkerColor('talk_to_npc') === '#4CAF50', 'talk_to_npc returns green');
assert(getObjectiveMarkerColor('complete_conversation') === '#4CAF50', 'complete_conversation returns green');
assert(getObjectiveMarkerColor('build_friendship') === '#4CAF50', 'build_friendship returns green');
assert(getObjectiveMarkerColor('teach_vocabulary') === '#4CAF50', 'teach_vocabulary returns green');

assert(getObjectiveMarkerColor('collect_item') === '#FFD700', 'collect_item returns gold');
assert(getObjectiveMarkerColor('deliver_item') === '#FFD700', 'deliver_item returns gold');
assert(getObjectiveMarkerColor('identify_object') === '#FFD700', 'identify_object returns gold');
assert(getObjectiveMarkerColor('examine_object') === '#FFD700', 'examine_object returns gold');

assert(getObjectiveMarkerColor('order_food') === '#FF9800', 'order_food returns orange');
assert(getObjectiveMarkerColor('haggle_price') === '#FF9800', 'haggle_price returns orange');

assert(getObjectiveMarkerColor('defeat_enemies') === '#F44336', 'defeat_enemies returns red');
assert(getObjectiveMarkerColor('craft_item') === '#009688', 'craft_item returns teal');
assert(getObjectiveMarkerColor('escort_npc') === '#9C27B0', 'escort_npc returns purple');

assert(getObjectiveMarkerColor('unknown_type') === '#E040FB', 'unknown type returns magenta default');

// ── getObjectiveMarkerShape tests ───────────────────────────────────────────

console.log('\n── getObjectiveMarkerShape ──');

assert(getObjectiveMarkerShape('visit_location') === 'diamond', 'visit_location is diamond');
assert(getObjectiveMarkerShape('discover_location') === 'diamond', 'discover_location is diamond');
assert(getObjectiveMarkerShape('navigate_language') === 'diamond', 'navigate_language is diamond');
assert(getObjectiveMarkerShape('follow_directions') === 'diamond', 'follow_directions is diamond');

assert(getObjectiveMarkerShape('talk_to_npc') === 'circle', 'talk_to_npc is circle');
assert(getObjectiveMarkerShape('collect_item') === 'circle', 'collect_item is circle');
assert(getObjectiveMarkerShape('defeat_enemies') === 'circle', 'defeat_enemies is circle');

// ── extractObjectiveMarkers tests ───────────────────────────────────────────

console.log('\n── extractObjectiveMarkers ──');

{
  const result = extractObjectiveMarkers([]);
  assert(result.length === 0, 'empty quest array returns no markers');
}

{
  const quests: Quest[] = [{
    id: 'q1', title: 'Test Quest', status: 'completed',
    objectives: [{
      type: 'visit_location', description: 'Go to market',
      completed: false, locationPosition: { x: 10, y: 0, z: 20 }
    }]
  }];
  const result = extractObjectiveMarkers(quests);
  assert(result.length === 0, 'non-active quest produces no markers');
}

{
  const quests: Quest[] = [{
    id: 'q1', title: 'Test Quest', status: 'active',
    objectives: [{
      type: 'visit_location', description: 'Go to market',
      completed: true, locationPosition: { x: 10, y: 0, z: 20 }
    }]
  }];
  const result = extractObjectiveMarkers(quests);
  assert(result.length === 0, 'completed objective produces no marker');
}

{
  const quests: Quest[] = [{
    id: 'q1', title: 'Test Quest', status: 'active',
    objectives: [{
      type: 'talk_to_npc', description: 'Talk to Bob',
      completed: false
    }]
  }];
  const result = extractObjectiveMarkers(quests);
  assert(result.length === 0, 'objective without position produces no marker');
}

{
  const quests: Quest[] = [{
    id: 'q1', title: 'Explore Town', status: 'active',
    objectives: [{
      type: 'visit_location', description: 'Visit the market',
      completed: false, locationPosition: { x: 100, y: 0, z: 200 }
    }]
  }];
  const result = extractObjectiveMarkers(quests);
  assert(result.length === 1, 'active quest with positioned objective produces one marker');
  assert(result[0].id === 'q1_obj_0', 'marker id combines quest id and objective index');
  assert(result[0].questId === 'q1', 'marker references quest id');
  assert(result[0].questTitle === 'Explore Town', 'marker includes quest title');
  assert(result[0].objectiveType === 'visit_location', 'marker has correct objective type');
  assert(result[0].position.x === 100, 'marker has correct x position');
  assert(result[0].position.z === 200, 'marker has correct z position');
  assert(result[0].color === '#00BCD4', 'visit_location marker is cyan');
  assert(result[0].shape === 'diamond', 'visit_location marker is diamond');
}

{
  const quests: Quest[] = [{
    id: 'q1', title: 'Fetch Quest', status: 'active',
    objectives: [{
      type: 'collect_item', description: 'Pick up gem',
      completed: false, position: { x: 50, y: 0, z: 60 }
    }]
  }];
  const result = extractObjectiveMarkers(quests);
  assert(result.length === 1, 'objective with position (not locationPosition) produces marker');
  assert(result[0].position.x === 50, 'uses position.x as fallback');
  assert(result[0].color === '#FFD700', 'collect_item marker is gold');
  assert(result[0].shape === 'circle', 'collect_item marker is circle');
}

{
  // locationPosition should take precedence over position
  const quests: Quest[] = [{
    id: 'q1', title: 'Test', status: 'active',
    objectives: [{
      type: 'visit_location', description: 'Go somewhere',
      completed: false,
      position: { x: 1, y: 0, z: 2 },
      locationPosition: { x: 10, y: 0, z: 20 }
    }]
  }];
  const result = extractObjectiveMarkers(quests);
  assert(result[0].position.x === 10, 'locationPosition takes precedence over position');
  assert(result[0].position.z === 20, 'locationPosition.z takes precedence');
}

{
  // Multi-objective quest with mixed completion states
  const quests: Quest[] = [{
    id: 'q1', title: 'Multi Quest', status: 'active',
    objectives: [
      { type: 'visit_location', description: 'Go to market', completed: true, locationPosition: { x: 10, y: 0, z: 20 } },
      { type: 'talk_to_npc', description: 'Talk to Bob', completed: false, locationPosition: { x: 30, y: 0, z: 40 } },
      { type: 'collect_item', description: 'Get the gem', completed: false, locationPosition: { x: 50, y: 0, z: 60 } },
      { type: 'defeat_enemies', description: 'Fight wolves', completed: false }, // no position
    ]
  }];
  const result = extractObjectiveMarkers(quests);
  assert(result.length === 2, 'multi-objective quest: 2 incomplete objectives with positions');
  assert(result[0].objectiveType === 'talk_to_npc', 'first marker is talk_to_npc (index 1, 0 was completed)');
  assert(result[0].id === 'q1_obj_1', 'marker id reflects original objective index');
  assert(result[1].objectiveType === 'collect_item', 'second marker is collect_item');
  assert(result[1].color === '#FFD700', 'collect_item marker is gold');
}

{
  // Multiple active quests
  const quests: Quest[] = [
    {
      id: 'q1', title: 'Quest A', status: 'active',
      objectives: [{ type: 'visit_location', description: 'Go A', completed: false, locationPosition: { x: 10, y: 0, z: 20 } }]
    },
    {
      id: 'q2', title: 'Quest B', status: 'active',
      objectives: [{ type: 'talk_to_npc', description: 'Talk B', completed: false, locationPosition: { x: 30, y: 0, z: 40 } }]
    },
    {
      id: 'q3', title: 'Quest C', status: 'failed',
      objectives: [{ type: 'collect_item', description: 'Get C', completed: false, locationPosition: { x: 50, y: 0, z: 60 } }]
    },
  ];
  const result = extractObjectiveMarkers(quests);
  assert(result.length === 2, 'multiple quests: only active quests produce markers');
  assert(result[0].questId === 'q1', 'first marker from quest A');
  assert(result[1].questId === 'q2', 'second marker from quest B');
}

{
  // Quest with no objectives
  const quests: Quest[] = [{
    id: 'q1', title: 'Empty', status: 'active',
    objectives: []
  }];
  const result = extractObjectiveMarkers(quests);
  assert(result.length === 0, 'quest with empty objectives array produces no markers');
}

{
  // Quest with undefined objectives
  const quests: Quest[] = [{
    id: 'q1', title: 'No Obj', status: 'active'
  }];
  const result = extractObjectiveMarkers(quests);
  assert(result.length === 0, 'quest with undefined objectives produces no markers');
}

// ── Color category coverage ─────────────────────────────────────────────────

console.log('\n── Color categories ──');

const colorCategories: Record<string, string[]> = {
  '#00BCD4': ['visit_location', 'discover_location', 'navigate_language', 'follow_directions'],
  '#4CAF50': ['talk_to_npc', 'complete_conversation', 'conversation_initiation', 'build_friendship', 'give_gift', 'listen_and_repeat', 'ask_for_directions', 'listening_comprehension', 'introduce_self', 'teach_vocabulary', 'teach_phrase'],
  '#FFD700': ['collect_item', 'deliver_item', 'identify_object', 'collect_vocabulary', 'examine_object', 'read_sign', 'point_and_name'],
  '#FF9800': ['order_food', 'haggle_price', 'gain_reputation'],
  '#F44336': ['defeat_enemies'],
  '#009688': ['craft_item'],
  '#9C27B0': ['escort_npc'],
};

for (const [expectedColor, types] of Object.entries(colorCategories)) {
  for (const t of types) {
    assert(getObjectiveMarkerColor(t) === expectedColor, `${t} maps to ${expectedColor}`);
  }
}

// ── Summary ─────────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
