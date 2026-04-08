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

const ACTION_EVENT_MAP: Record<string, { emitsEvent: string | null; gameActivityVerb?: string }> = {
  // ── Social / Conversation ──────────────────────────────────────────────
  talk_to_npc:        { emitsEvent: 'npc_talked' },
  greet:              { emitsEvent: 'npc_talked', gameActivityVerb: 'greet' },
  compliment_npc:     { emitsEvent: 'conversational_action_completed' },
  insult_npc:         { emitsEvent: 'conversational_action_completed' },
  threaten:           { emitsEvent: 'conversational_action_completed' },
  flirt:              { emitsEvent: 'conversational_action_completed' },
  persuade:           { emitsEvent: 'conversational_action_completed' },
  bribe:              { emitsEvent: 'conversational_action_completed' },
  gossip:             { emitsEvent: 'conversational_action_completed' },
  confess:            { emitsEvent: 'conversational_action_completed' },
  apologize:          { emitsEvent: 'conversational_action_completed' },
  comfort:            { emitsEvent: 'conversational_action_completed' },
  argue:              { emitsEvent: 'conversational_action_completed' },
  joke:               { emitsEvent: 'conversational_action_completed' },
  share_story:        { emitsEvent: 'conversational_action_completed' },
  ask_about:          { emitsEvent: 'conversational_action_completed' },
  answer_question:    { emitsEvent: 'conversational_action_completed' },
  introduce_self:     { emitsEvent: 'conversational_action_completed' },
  request_quest:      { emitsEvent: 'conversational_action_completed' },
  trade:              { emitsEvent: 'conversational_action_completed' },
  eavesdrop:          { emitsEvent: 'conversation_overheard' },
  teach_vocabulary:   { emitsEvent: 'conversational_action_completed' },

  // ── Language Learning ──────────────────────────────────────────────────
  examine_object:     { emitsEvent: 'object_examined' },
  read_sign:          { emitsEvent: 'sign_read' },
  read_book:          { emitsEvent: 'text_read' },
  write_response:     { emitsEvent: 'writing_submitted' },
  describe_scene:     { emitsEvent: 'writing_submitted' },
  listen_and_repeat:  { emitsEvent: 'pronunciation_attempt' },
  point_and_name:     { emitsEvent: 'object_pointed_and_named' },
  ask_for_directions: { emitsEvent: 'npc_talked' },
  order_food:         { emitsEvent: 'food_ordered' },
  haggle_price:       { emitsEvent: 'price_haggled' },

  // ── Items ──────────────────────────────────────────────────────────────
  collect_item:       { emitsEvent: 'item_collected' },
  craft_item:         { emitsEvent: 'item_crafted' },
  equip_item:         { emitsEvent: 'item_equipped' },
  use_item:           { emitsEvent: 'item_used' },
  drop_item:          { emitsEvent: 'item_dropped' },
  give_gift:          { emitsEvent: 'gift_given' },
  buy_item:           { emitsEvent: 'item_purchased' },
  sell_item:          { emitsEvent: 'item_sold' },
  steal:              { emitsEvent: 'item_collected' },
  consume:            { emitsEvent: 'item_used' },

  // ── Exploration ────────────────────────────────────────────────────────
  enter_building:     { emitsEvent: 'location_visited' },
  travel_to_location: { emitsEvent: 'location_visited' },

  // ── Physical / Resource ────────────────────────────────────────────────
  fish:               { emitsEvent: 'physical_action_completed' },
  mine_rock:          { emitsEvent: 'physical_action_completed' },
  chop_tree:          { emitsEvent: 'physical_action_completed' },
  gather:             { emitsEvent: 'physical_action_completed' },
  gather_herb:        { emitsEvent: 'physical_action_completed' },
  cook:               { emitsEvent: 'physical_action_completed' },
  farm_plant:         { emitsEvent: 'physical_action_completed' },
  farm_water:         { emitsEvent: 'physical_action_completed' },
  farm_harvest:       { emitsEvent: 'physical_action_completed' },
  paint:              { emitsEvent: 'physical_action_completed' },
  sweep:              { emitsEvent: 'physical_action_completed' },
  work:               { emitsEvent: 'physical_action_completed' },
  fix_repair:         { emitsEvent: 'physical_action_completed' },
  rest:               { emitsEvent: 'physical_action_completed' },
  sleep:              { emitsEvent: 'physical_action_completed' },

  // ── Combat ─────────────────────────────────────────────────────────────
  attack_enemy:       { emitsEvent: 'enemy_defeated' },
  defend:             { emitsEvent: 'combat_action' },
  sword_attack:       { emitsEvent: 'combat_action' },
  sword_combo:        { emitsEvent: 'combat_action' },
  sword_dash:         { emitsEvent: 'combat_action' },
  sword_block:        { emitsEvent: 'combat_action' },
  shield_bash:        { emitsEvent: 'combat_action' },
  shield_block:       { emitsEvent: 'combat_action' },
  shield_dash:        { emitsEvent: 'combat_action' },
  melee_hook:         { emitsEvent: 'combat_action' },
  punch:              { emitsEvent: 'combat_action' },
  punch_heavy:        { emitsEvent: 'combat_action' },
  throw_projectile:   { emitsEvent: 'combat_action' },
  cast_spell:         { emitsEvent: 'combat_action' },
  spell_channel:      { emitsEvent: 'combat_action' },
  pistol_shoot:       { emitsEvent: 'combat_action' },

  // ── Missing social/conversation ─────────────────────────────────────────
  talk:               { emitsEvent: 'npc_talked', gameActivityVerb: 'talk_to_npc' },
  accept_quest:       { emitsEvent: 'quest_accepted' },
  escort_npc:         { emitsEvent: 'npc_talked', gameActivityVerb: 'escort_npc' },
  observe_activity:   { emitsEvent: 'activity_observed' },
  express:            { emitsEvent: null, gameActivityVerb: 'express' },

  // ── Missing physical/resource ──────────────────────────────────────────
  mine:               { emitsEvent: 'physical_action_completed', gameActivityVerb: 'mine_rock' },
  harvest:            { emitsEvent: 'physical_action_completed', gameActivityVerb: 'farm_harvest' },
  craft:              { emitsEvent: 'item_crafted', gameActivityVerb: 'craft_item' },
  chop_wood:          { emitsEvent: 'physical_action_completed', gameActivityVerb: 'chop_tree' },
  farm:               { emitsEvent: 'physical_action_completed', gameActivityVerb: 'farm_plant' },
  pick_up:            { emitsEvent: 'item_collected', gameActivityVerb: 'collect_item' },
  open_container:     { emitsEvent: 'item_collected', gameActivityVerb: 'collect_item' },
  investigate:        { emitsEvent: 'object_examined', gameActivityVerb: 'examine_object' },
  interact:           { emitsEvent: 'object_examined', gameActivityVerb: 'examine_object' },

  // ── Missing mental ─────────────────────────────────────────────────────
  learn_word:         { emitsEvent: 'vocabulary_used' },
  solve_puzzle:       { emitsEvent: 'puzzle_solved' },
  pray:               { emitsEvent: null, gameActivityVerb: 'pray' },
  take_photo:         { emitsEvent: 'photo_taken' },

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
  sit_talk:           { emitsEvent: 'npc_talked', gameActivityVerb: 'talk_to_npc' },
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

    // Skip if already populated
    if (action.emitsEvent !== undefined && action.emitsEvent !== null && action.gameActivityVerb) {
      skipped++;
      continue;
    }

    const updates: Record<string, any> = {
      emitsEvent: mapping.emitsEvent,
      gameActivityVerb: mapping.gameActivityVerb || name,
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
