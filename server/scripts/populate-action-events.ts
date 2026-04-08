#!/usr/bin/env tsx
/**
 * Populate emitsEvent and gameActivityVerb for all actions in the database.
 *
 * Maps each action to the game event that triggers it and the canonical
 * activity verb for taxonomy tracking.
 *
 * Usage:
 *   npx tsx server/scripts/populate-action-events.ts
 *   npx tsx server/scripts/populate-action-events.ts --dry-run
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const DRY_RUN = process.argv.includes('--dry-run');

// ── Event mappings by action name ───────────────────────────────────────────
// Format: actionName → { emitsEvent, gameActivityVerb }
// emitsEvent = the GameEventBus event name that triggers this action
// gameActivityVerb = the canonical activity verb (defaults to action name)
// null emitsEvent = animation-only action (no game state change)

const ACTION_EVENT_MAP: Record<string, { emitsEvent: string | null; gameActivityVerb?: string; completesObjectiveType?: string }> = {
  // ── Social / Conversation ──────────────────────────────────────────────
  talk_to_npc:        { emitsEvent: 'npc_talked', completesObjectiveType: 'talk_to_npc' },
  greet:              { emitsEvent: 'npc_talked', gameActivityVerb: 'greet', completesObjectiveType: 'talk_to_npc' },
  compliment_npc:     { emitsEvent: 'conversational_action_completed', completesObjectiveType: 'complete_conversation' },
  insult_npc:         { emitsEvent: 'conversational_action_completed', completesObjectiveType: 'complete_conversation' },
  threaten:           { emitsEvent: 'conversational_action_completed', completesObjectiveType: 'complete_conversation' },
  flirt:              { emitsEvent: 'conversational_action_completed', completesObjectiveType: 'complete_conversation' },
  persuade:           { emitsEvent: 'conversational_action_completed', completesObjectiveType: 'complete_conversation' },
  bribe:              { emitsEvent: 'conversational_action_completed', completesObjectiveType: 'complete_conversation' },
  gossip:             { emitsEvent: 'conversational_action_completed', completesObjectiveType: 'complete_conversation' },
  confess:            { emitsEvent: 'conversational_action_completed', completesObjectiveType: 'complete_conversation' },
  apologize:          { emitsEvent: 'conversational_action_completed', completesObjectiveType: 'complete_conversation' },
  comfort:            { emitsEvent: 'conversational_action_completed', completesObjectiveType: 'complete_conversation' },
  argue:              { emitsEvent: 'conversational_action_completed', completesObjectiveType: 'complete_conversation' },
  joke:               { emitsEvent: 'conversational_action_completed', completesObjectiveType: 'complete_conversation' },
  share_story:        { emitsEvent: 'conversational_action_completed', completesObjectiveType: 'complete_conversation' },
  ask_about:          { emitsEvent: 'conversational_action_completed', completesObjectiveType: 'complete_conversation' },
  answer_question:    { emitsEvent: 'conversational_action_completed', completesObjectiveType: 'complete_conversation' },
  introduce_self:     { emitsEvent: 'conversational_action_completed', completesObjectiveType: 'introduce_self' },
  request_quest:      { emitsEvent: 'conversational_action_completed', completesObjectiveType: 'talk_to_npc' },
  trade:              { emitsEvent: 'conversational_action_completed', completesObjectiveType: 'complete_conversation' },
  eavesdrop:          { emitsEvent: 'conversation_overheard', completesObjectiveType: 'eavesdrop' },
  teach_vocabulary:   { emitsEvent: 'conversational_action_completed', completesObjectiveType: 'use_vocabulary' },

  // ── Language Learning ──────────────────────────────────────────────────
  examine_object:     { emitsEvent: 'object_examined', completesObjectiveType: 'examine_object' },
  read_sign:          { emitsEvent: 'sign_read', completesObjectiveType: 'read_sign' },
  read_book:          { emitsEvent: 'text_read', completesObjectiveType: 'read_text' },
  write_response:     { emitsEvent: 'writing_submitted', completesObjectiveType: 'write_response' },
  describe_scene:     { emitsEvent: 'writing_submitted', completesObjectiveType: 'describe_scene' },
  listen_and_repeat:  { emitsEvent: 'pronunciation_attempt', completesObjectiveType: 'listen_and_repeat' },
  point_and_name:     { emitsEvent: 'object_pointed_and_named', completesObjectiveType: 'point_and_name' },
  ask_for_directions: { emitsEvent: 'npc_talked', completesObjectiveType: 'ask_for_directions' },
  order_food:         { emitsEvent: 'food_ordered', completesObjectiveType: 'order_food' },
  haggle_price:       { emitsEvent: 'price_haggled', completesObjectiveType: 'haggle_price' },

  // ── Items ──────────────────────────────────────────────────────────────
  collect_item:       { emitsEvent: 'item_collected', completesObjectiveType: 'collect_item' },
  craft_item:         { emitsEvent: 'item_crafted', completesObjectiveType: 'craft_item' },
  equip_item:         { emitsEvent: 'item_equipped', completesObjectiveType: 'equip_item' },
  use_item:           { emitsEvent: 'item_used', completesObjectiveType: 'use_item' },
  drop_item:          { emitsEvent: 'item_dropped', completesObjectiveType: 'drop_item' },
  give_gift:          { emitsEvent: 'gift_given', completesObjectiveType: 'give_gift' },
  buy_item:           { emitsEvent: 'item_purchased', completesObjectiveType: 'buy_item' },
  sell_item:          { emitsEvent: 'item_sold', completesObjectiveType: 'sell_item' },
  steal:              { emitsEvent: 'item_collected', completesObjectiveType: 'collect_item' },
  consume:            { emitsEvent: 'item_used', completesObjectiveType: 'use_item' },

  // ── Exploration ────────────────────────────────────────────────────────
  enter_building:     { emitsEvent: 'location_visited', completesObjectiveType: 'visit_location' },
  travel_to_location: { emitsEvent: 'location_visited', completesObjectiveType: 'visit_location' },

  // ── Physical / Resource ────────────────────────────────────────────────
  fish:               { emitsEvent: 'physical_action_completed', completesObjectiveType: 'physical_action' },
  mine_rock:          { emitsEvent: 'physical_action_completed', completesObjectiveType: 'physical_action' },
  chop_tree:          { emitsEvent: 'physical_action_completed', completesObjectiveType: 'physical_action' },
  gather:             { emitsEvent: 'physical_action_completed', completesObjectiveType: 'collect_item' },
  gather_herb:        { emitsEvent: 'physical_action_completed', completesObjectiveType: 'collect_item' },
  cook:               { emitsEvent: 'physical_action_completed', completesObjectiveType: 'craft_item' },
  farm_plant:         { emitsEvent: 'physical_action_completed', completesObjectiveType: 'physical_action' },
  farm_water:         { emitsEvent: 'physical_action_completed', completesObjectiveType: 'physical_action' },
  farm_harvest:       { emitsEvent: 'physical_action_completed', completesObjectiveType: 'collect_item' },
  paint:              { emitsEvent: 'physical_action_completed', completesObjectiveType: 'physical_action' },
  sweep:              { emitsEvent: 'physical_action_completed', completesObjectiveType: 'physical_action' },
  work:               { emitsEvent: 'physical_action_completed', completesObjectiveType: 'physical_action' },
  fix_repair:         { emitsEvent: 'physical_action_completed', completesObjectiveType: 'physical_action' },
  rest:               { emitsEvent: 'physical_action_completed', completesObjectiveType: 'physical_action' },
  sleep:              { emitsEvent: 'physical_action_completed', completesObjectiveType: 'physical_action' },

  // ── Combat ─────────────────────────────────────────────────────────────
  attack_enemy:       { emitsEvent: 'enemy_defeated', completesObjectiveType: 'defeat_enemies' },
  defend:             { emitsEvent: 'combat_action', completesObjectiveType: 'combat_action' },
  sword_attack:       { emitsEvent: 'combat_action', completesObjectiveType: 'combat_action' },
  sword_combo:        { emitsEvent: 'combat_action', completesObjectiveType: 'combat_action' },
  sword_dash:         { emitsEvent: 'combat_action', completesObjectiveType: 'combat_action' },
  sword_block:        { emitsEvent: 'combat_action', completesObjectiveType: 'combat_action' },
  shield_bash:        { emitsEvent: 'combat_action', completesObjectiveType: 'combat_action' },
  shield_block:       { emitsEvent: 'combat_action', completesObjectiveType: 'combat_action' },
  shield_dash:        { emitsEvent: 'combat_action', completesObjectiveType: 'combat_action' },
  melee_hook:         { emitsEvent: 'combat_action', completesObjectiveType: 'combat_action' },
  punch:              { emitsEvent: 'combat_action', completesObjectiveType: 'combat_action' },
  punch_heavy:        { emitsEvent: 'combat_action', completesObjectiveType: 'combat_action' },
  throw_projectile:   { emitsEvent: 'combat_action', completesObjectiveType: 'combat_action' },
  cast_spell:         { emitsEvent: 'combat_action', completesObjectiveType: 'combat_action' },
  spell_channel:      { emitsEvent: 'combat_action', completesObjectiveType: 'combat_action' },
  pistol_shoot:       { emitsEvent: 'combat_action', completesObjectiveType: 'combat_action' },

  // ── Missing social/conversation ─────────────────────────────────────────
  talk:               { emitsEvent: 'npc_talked', gameActivityVerb: 'talk_to_npc', completesObjectiveType: 'talk_to_npc' },
  accept_quest:       { emitsEvent: 'quest_accepted', completesObjectiveType: 'accept_quest' },
  escort_npc:         { emitsEvent: 'npc_talked', gameActivityVerb: 'escort_npc', completesObjectiveType: 'escort_npc' },
  observe_activity:   { emitsEvent: 'activity_observed', completesObjectiveType: 'observe_activity' },
  express:            { emitsEvent: null, gameActivityVerb: 'express' },

  // ── Missing physical/resource ──────────────────────────────────────────
  mine:               { emitsEvent: 'physical_action_completed', gameActivityVerb: 'mine_rock', completesObjectiveType: 'physical_action' },
  harvest:            { emitsEvent: 'physical_action_completed', gameActivityVerb: 'farm_harvest', completesObjectiveType: 'collect_item' },
  craft:              { emitsEvent: 'item_crafted', gameActivityVerb: 'craft_item', completesObjectiveType: 'craft_item' },
  chop_wood:          { emitsEvent: 'physical_action_completed', gameActivityVerb: 'chop_tree', completesObjectiveType: 'physical_action' },
  farm:               { emitsEvent: 'physical_action_completed', gameActivityVerb: 'farm_plant', completesObjectiveType: 'physical_action' },
  pick_up:            { emitsEvent: 'item_collected', gameActivityVerb: 'collect_item', completesObjectiveType: 'collect_item' },
  open_container:     { emitsEvent: 'item_collected', gameActivityVerb: 'collect_item', completesObjectiveType: 'collect_item' },
  investigate:        { emitsEvent: 'object_examined', gameActivityVerb: 'examine_object', completesObjectiveType: 'examine_object' },
  interact:           { emitsEvent: 'object_examined', gameActivityVerb: 'examine_object', completesObjectiveType: 'examine_object' },

  // ── Missing mental ─────────────────────────────────────────────────────
  learn_word:         { emitsEvent: 'vocabulary_used', completesObjectiveType: 'use_vocabulary' },
  solve_puzzle:       { emitsEvent: 'puzzle_solved', completesObjectiveType: 'solve_puzzle' },
  pray:               { emitsEvent: null, gameActivityVerb: 'pray' },
  take_photo:         { emitsEvent: 'photo_taken', completesObjectiveType: 'photograph_subject' },

  // ── Assessment / lifecycle ────────────────────────────────────────────
  complete_assessment: { emitsEvent: 'assessment_completed', completesObjectiveType: 'complete_assessment' },
  take_assessment:     { emitsEvent: 'assessment_started', gameActivityVerb: 'complete_assessment', completesObjectiveType: 'complete_assessment' },
  build_friendship:    { emitsEvent: 'npc_relationship_changed', completesObjectiveType: 'build_friendship' },
  discover_clue:       { emitsEvent: 'clue_discovered', completesObjectiveType: 'collect_clue' },
  translate:           { emitsEvent: 'translation_attempt', gameActivityVerb: 'translate', completesObjectiveType: 'translation_challenge' },
  pronounce:           { emitsEvent: 'pronunciation_attempt', gameActivityVerb: 'pronounce', completesObjectiveType: 'pronunciation_check' },

  // ── Missing movement (animation-only) ──────────────────────────────────
  walk_formal:        { emitsEvent: null },
  jog:                { emitsEvent: null },
  sprint:             { emitsEvent: null },
  crouch_walk:        { emitsEvent: null },
  crouch_idle:        { emitsEvent: null },
  roll:               { emitsEvent: null },
  swim:               { emitsEvent: null },
  swim_idle:          { emitsEvent: null },
  slide:              { emitsEvent: null },
  climb:              { emitsEvent: null },
  ninja_jump:         { emitsEvent: null },
  walk_carry:         { emitsEvent: null },
  move:               { emitsEvent: null },
  drive:              { emitsEvent: null },
  mount_vehicle:      { emitsEvent: null },

  // ── Missing social (animation-only) ────────────────────────────────────
  sit_down:           { emitsEvent: null },
  sit_idle:           { emitsEvent: null },
  sit_talk:           { emitsEvent: 'npc_talked', gameActivityVerb: 'talk_to_npc', completesObjectiveType: 'talk_to_npc' },
  stand_up:           { emitsEvent: null },
  fold_arms:          { emitsEvent: null },
  nod_yes:            { emitsEvent: null },
  shake_head_no:      { emitsEvent: null },
  phone_call:         { emitsEvent: null },
  lean_railing:       { emitsEvent: null },
  call_out:           { emitsEvent: null },
  get_up:             { emitsEvent: null },
  hold_torch:         { emitsEvent: null },
  hold_lantern:       { emitsEvent: null },

  // ── Animation-only (no game state change) ──────────────────────────────
  idle:               { emitsEvent: null },
  walk:               { emitsEvent: null },
  run:                { emitsEvent: null },
  jump:               { emitsEvent: null },
  sit:                { emitsEvent: null },
  dance:              { emitsEvent: null },
  clap:               { emitsEvent: null },
  wave:               { emitsEvent: null },
  point:              { emitsEvent: null },
  push_object:        { emitsEvent: null },
  die:                { emitsEvent: null },
  hit_head:           { emitsEvent: null },
  hit_reaction:       { emitsEvent: null },
  knockback:          { emitsEvent: null },
  react:              { emitsEvent: null },
  sword_idle:         { emitsEvent: null },
  pistol_aim:         { emitsEvent: null },
  pistol_reload:      { emitsEvent: null },
  zombie_attack:      { emitsEvent: null },
  zombie_idle:        { emitsEvent: null },
  zombie_walk:        { emitsEvent: null },
};

async function main() {
  const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URL || '';
  if (!mongoUrl) { console.error('No MONGO_URL'); process.exit(1); }

  console.log(`\n=== Populate Action Events ${DRY_RUN ? '(DRY RUN)' : ''} ===\n`);

  await mongoose.connect(mongoUrl);
  const db = mongoose.connection.db!;

  const actionsCollection = db.collection('actions');
  const actions = await actionsCollection.find({}).toArray();
  console.log(`Found ${actions.length} actions\n`);

  let updated = 0;
  let skipped = 0;
  let unmapped = 0;

  for (const action of actions) {
    const name = action.name;
    const mapping = ACTION_EVENT_MAP[name];

    if (!mapping) {
      // Check if it's an Ensemble-imported action or world-specific
      if (!action.isBase) {
        skipped++;
        continue;
      }
      console.log(`  ⚠️  UNMAPPED: ${name} (${action.actionType || '?'})`);
      unmapped++;
      continue;
    }

    // Always update to ensure completesObjectiveType is populated

    const updates: Record<string, any> = {
      emitsEvent: mapping.emitsEvent,
      gameActivityVerb: mapping.gameActivityVerb || name,
      completesObjectiveType: mapping.completesObjectiveType || null,
      updatedAt: new Date(),
    };

    if (!DRY_RUN) {
      await actionsCollection.updateOne(
        { _id: action._id },
        { $set: updates },
      );
    }

    const eventLabel = mapping.emitsEvent || '(animation-only)';
    console.log(`  ✓ ${name} → ${eventLabel}`);
    updated++;
  }

  console.log(`\n=== Done: ${updated} updated, ${skipped} skipped, ${unmapped} unmapped ===\n`);

  if (unmapped > 0) {
    console.log('Unmapped actions need manual mapping in ACTION_EVENT_MAP above.\n');
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('Script failed:', err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
