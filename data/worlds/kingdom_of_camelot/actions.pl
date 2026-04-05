%% Insimul Actions: Kingdom of Camelot
%% Source: data/worlds/kingdom_of_camelot/actions.pl
%% Created: 2026-04-03
%% Total: 12 actions
%%
%% Predicate schema follows base_actions.pl format

%% joust_opponent
%% Engage in a jousting match at the tournament fields
%% Type: combat / tournament

action(joust_opponent, 'joust_opponent', combat, 15).
action_difficulty(joust_opponent, 0.6).
action_duration(joust_opponent, 3).
action_category(joust_opponent, tournament).
action_verb(joust_opponent, past, 'jousted against').
action_verb(joust_opponent, present, 'jousts against').
action_target_type(joust_opponent, other).
action_requires_target(joust_opponent).
action_range(joust_opponent, 10).
action_prerequisite(joust_opponent, (at_location(Actor, lot_cam_7))).
action_effect(joust_opponent, (assert(competed(Actor, Target)))).
can_perform(Actor, joust_opponent, Target) :-
    at_location(Actor, lot_cam_7),
    near(Actor, Target, 10).

%% embark_on_quest
%% Depart on a quest to prove knightly valor or seek a holy relic
%% Type: exploration / quest

action(embark_on_quest, 'embark_on_quest', exploration, 20).
action_difficulty(embark_on_quest, 0.5).
action_duration(embark_on_quest, 10).
action_category(embark_on_quest, quest).
action_verb(embark_on_quest, past, 'embarked on a quest').
action_verb(embark_on_quest, present, 'embarks on a quest').
action_target_type(embark_on_quest, none).
action_effect(embark_on_quest, (assert(status(Actor, questing)))).
can_perform(Actor, embark_on_quest, _) :-
    attribute(Actor, honor, Honor_val), Honor_val > 3.

%% hold_court
%% Preside over court at the Great Hall to hear petitions and render judgment
%% Type: social / governance

action(hold_court, 'hold_court', social, 10).
action_difficulty(hold_court, 0.4).
action_duration(hold_court, 5).
action_category(hold_court, governance).
action_verb(hold_court, past, 'held court').
action_verb(hold_court, present, 'holds court').
action_target_type(hold_court, none).
action_prerequisite(hold_court, (status(Actor, ruler))).
action_effect(hold_court, (assert(event(court_session, Actor)))).
can_perform(Actor, hold_court, _) :-
    status(Actor, ruler),
    at_location(Actor, lot_cam_1).

%% train_combat
%% Practice sword fighting and combat drills at the Training Grounds
%% Type: combat / training

action(train_combat, 'train_combat', combat, 10).
action_difficulty(train_combat, 0.3).
action_duration(train_combat, 3).
action_category(train_combat, training).
action_verb(train_combat, past, 'trained in combat').
action_verb(train_combat, present, 'trains in combat').
action_target_type(train_combat, none).
action_prerequisite(train_combat, (at_location(Actor, lot_cam_8))).
action_effect(train_combat, (assert(trained(Actor, combat)))).
can_perform(Actor, train_combat, _) :-
    at_location(Actor, lot_cam_8).

%% swear_oath
%% Swear an oath of loyalty or service before witnesses at the Round Table
%% Type: social / ceremony

action(swear_oath, 'swear_oath', social, 5).
action_difficulty(swear_oath, 0.2).
action_duration(swear_oath, 2).
action_category(swear_oath, ceremony).
action_verb(swear_oath, past, 'swore an oath to').
action_verb(swear_oath, present, 'swears an oath to').
action_target_type(swear_oath, other).
action_requires_target(swear_oath).
action_range(swear_oath, 5).
action_prerequisite(swear_oath, (at_location(Actor, lot_cam_2))).
action_effect(swear_oath, (assert(relationship(Actor, Target, sworn_to)))).
can_perform(Actor, swear_oath, Target) :-
    at_location(Actor, lot_cam_2),
    near(Actor, Target, 5).

%% consult_merlin
%% Seek magical advice or knowledge from Merlin at his tower
%% Type: social / magic

action(consult_merlin, 'consult_merlin', social, 5).
action_difficulty(consult_merlin, 0.3).
action_duration(consult_merlin, 2).
action_category(consult_merlin, magic).
action_verb(consult_merlin, past, 'consulted Merlin').
action_verb(consult_merlin, present, 'consults Merlin').
action_target_type(consult_merlin, specific).
action_requires_target(consult_merlin).
action_range(consult_merlin, 5).
action_effect(consult_merlin, (assert(consulted(Actor, wizard_merlin)))).
can_perform(Actor, consult_merlin, wizard_merlin) :-
    at_location(Actor, lot_cam_17),
    near(Actor, wizard_merlin, 5).

%% pray_at_chapel
%% Pray at the Chapel of the Holy Light for blessings or guidance
%% Type: social / religious

action(pray_at_chapel, 'pray_at_chapel', social, 3).
action_difficulty(pray_at_chapel, 0.1).
action_duration(pray_at_chapel, 2).
action_category(pray_at_chapel, religious).
action_verb(pray_at_chapel, past, 'prayed at the chapel').
action_verb(pray_at_chapel, present, 'prays at the chapel').
action_target_type(pray_at_chapel, none).
action_prerequisite(pray_at_chapel, (at_location(Actor, lot_cam_4))).
action_effect(pray_at_chapel, (assert(status(Actor, blessed)))).
can_perform(Actor, pray_at_chapel, _) :-
    at_location(Actor, lot_cam_4).

%% forge_weapon
%% Commission or craft a weapon at the Ironheart Smithy
%% Type: crafting / blacksmith

action(forge_weapon, 'forge_weapon', crafting, 15).
action_difficulty(forge_weapon, 0.5).
action_duration(forge_weapon, 4).
action_category(forge_weapon, blacksmith).
action_verb(forge_weapon, past, 'forged a weapon').
action_verb(forge_weapon, present, 'forges a weapon').
action_target_type(forge_weapon, none).
action_prerequisite(forge_weapon, (at_location(Actor, lot_cam_11))).
action_effect(forge_weapon, (assert(crafted(Actor, weapon)))).
can_perform(Actor, forge_weapon, _) :-
    at_location(Actor, lot_cam_11).

%% drink_at_tavern
%% Spend time drinking mead and socializing at the Crossed Swords Tavern
%% Type: social / leisure

action(drink_at_tavern, 'drink_at_tavern', social, 5).
action_difficulty(drink_at_tavern, 0.1).
action_duration(drink_at_tavern, 2).
action_category(drink_at_tavern, leisure).
action_verb(drink_at_tavern, past, 'drank at the tavern').
action_verb(drink_at_tavern, present, 'drinks at the tavern').
action_target_type(drink_at_tavern, none).
action_prerequisite(drink_at_tavern, (at_location(Actor, lot_cam_10))).
action_effect(drink_at_tavern, (assert(status(Actor, relaxed)))).
can_perform(Actor, drink_at_tavern, _) :-
    at_location(Actor, lot_cam_10).

%% challenge_to_duel
%% Issue a formal challenge to single combat to settle a dispute
%% Type: combat / honor

action(challenge_to_duel, 'challenge_to_duel', combat, 10).
action_difficulty(challenge_to_duel, 0.5).
action_duration(challenge_to_duel, 3).
action_category(challenge_to_duel, honor).
action_verb(challenge_to_duel, past, 'challenged to a duel').
action_verb(challenge_to_duel, present, 'challenges to a duel').
action_target_type(challenge_to_duel, other).
action_requires_target(challenge_to_duel).
action_range(challenge_to_duel, 10).
action_effect(challenge_to_duel, (assert(status(Actor, dueling)))).
can_perform(Actor, challenge_to_duel, Target) :-
    near(Actor, Target, 10),
    attribute(Actor, honor, Honor_val), Honor_val > 3.

%% patrol_outer_lands
%% Ride out to patrol the dangerous wilderness beyond the castle walls
%% Type: exploration / military

action(patrol_outer_lands, 'patrol_outer_lands', exploration, 12).
action_difficulty(patrol_outer_lands, 0.4).
action_duration(patrol_outer_lands, 6).
action_category(patrol_outer_lands, military).
action_verb(patrol_outer_lands, past, 'patrolled the outer lands').
action_verb(patrol_outer_lands, present, 'patrols the outer lands').
action_target_type(patrol_outer_lands, none).
action_effect(patrol_outer_lands, (assert(status(Actor, patrolling)))).
can_perform(Actor, patrol_outer_lands, _) :-
    attribute(Actor, combat_skill, Skill_val), Skill_val > 4.

%% study_ancient_lore
%% Research magical and historical texts in the Library of Ancient Lore
%% Type: education / research

action(study_ancient_lore, 'study_ancient_lore', education, 8).
action_difficulty(study_ancient_lore, 0.3).
action_duration(study_ancient_lore, 3).
action_category(study_ancient_lore, research).
action_verb(study_ancient_lore, past, 'studied ancient lore').
action_verb(study_ancient_lore, present, 'studies ancient lore').
action_target_type(study_ancient_lore, none).
action_prerequisite(study_ancient_lore, (at_location(Actor, lot_cam_20))).
action_effect(study_ancient_lore, (assert(studied(Actor, lore)))).
can_perform(Actor, study_ancient_lore, _) :-
    at_location(Actor, lot_cam_20).
