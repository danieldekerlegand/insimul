%% Insimul Actions: Tropical Pirate
%% Source: data/worlds/tropical_pirate/actions.pl
%% Created: 2026-04-03
%% Total: 12 actions
%%
%% Predicate schema (base_actions style):
%%   action/4 -- action(AtomId, Name, Category, EnergyCost)
%%   action_difficulty/2, action_duration/2, action_category/2
%%   action_verb/3, action_target_type/2
%%   action_prerequisite/2, action_effect/2, can_perform/3

%% sword_fight
action(sword_fight, 'sword_fight', combat, 4).
action_difficulty(sword_fight, 0.5).
action_duration(sword_fight, 2).
action_category(sword_fight, combat).
action_verb(sword_fight, past, 'dueled').
action_verb(sword_fight, present, 'duels').
action_target_type(sword_fight, other).
action_prerequisite(sword_fight, (has_item(Actor, cutlass))).
action_effect(sword_fight, (assert(fought(Actor, Target)))).
can_perform(Actor, sword_fight, Target) :-
    has_item(Actor, cutlass).

%% fire_pistol
action(fire_pistol, 'fire_pistol', combat, 3).
action_difficulty(fire_pistol, 0.4).
action_duration(fire_pistol, 1).
action_category(fire_pistol, combat).
action_verb(fire_pistol, past, 'shot at').
action_verb(fire_pistol, present, 'shoots at').
action_target_type(fire_pistol, other).
action_prerequisite(fire_pistol, (has_item(Actor, flintlock_pistol))).
action_effect(fire_pistol, (assert(shot_at(Actor, Target)))).
can_perform(Actor, fire_pistol, Target) :-
    has_item(Actor, flintlock_pistol).

%% navigate_ship
action(navigate_ship, 'navigate_ship', transport, 4).
action_difficulty(navigate_ship, 0.5).
action_duration(navigate_ship, 3).
action_category(navigate_ship, transport).
action_verb(navigate_ship, past, 'navigated to').
action_verb(navigate_ship, present, 'navigates to').
action_target_type(navigate_ship, location).
action_prerequisite(navigate_ship, (has_item(Actor, compass))).
action_effect(navigate_ship, (assert(sailed_to(Actor, Target)))).
can_perform(Actor, navigate_ship, Target) :-
    has_item(Actor, compass).

%% board_ship
action(board_ship, 'board_ship', combat, 5).
action_difficulty(board_ship, 0.6).
action_duration(board_ship, 2).
action_category(board_ship, combat).
action_verb(board_ship, past, 'boarded').
action_verb(board_ship, present, 'boards').
action_target_type(board_ship, other).
action_prerequisite(board_ship, (has_item(Actor, pirate_grappling_hook))).
action_effect(board_ship, (assert(boarded(Actor, Target)))).
can_perform(Actor, board_ship, Target) :-
    has_item(Actor, pirate_grappling_hook).

%% search_for_treasure
action(search_for_treasure, 'search_for_treasure', exploration, 5).
action_difficulty(search_for_treasure, 0.6).
action_duration(search_for_treasure, 4).
action_category(search_for_treasure, exploration).
action_verb(search_for_treasure, past, 'searched for treasure at').
action_verb(search_for_treasure, present, 'searches for treasure at').
action_target_type(search_for_treasure, location).
action_prerequisite(search_for_treasure, (has_item(Actor, treasure_map))).
action_effect(search_for_treasure, (assert(treasure_found(Actor, Target)))).
can_perform(Actor, search_for_treasure, Target) :-
    has_item(Actor, treasure_map).

%% drink_rum
action(drink_rum, 'drink_rum', social, 1).
action_difficulty(drink_rum, 0.1).
action_duration(drink_rum, 1).
action_category(drink_rum, social).
action_verb(drink_rum, past, 'drank rum with').
action_verb(drink_rum, present, 'drinks rum with').
action_target_type(drink_rum, other).
action_prerequisite(drink_rum, (has_item(Actor, bottle_of_rum))).
action_effect(drink_rum, (assert(drank_with(Actor, Target)))).
can_perform(Actor, drink_rum, Target) :-
    has_item(Actor, bottle_of_rum).

%% scout_horizon
action(scout_horizon, 'scout_horizon', exploration, 2).
action_difficulty(scout_horizon, 0.2).
action_duration(scout_horizon, 1).
action_category(scout_horizon, exploration).
action_verb(scout_horizon, past, 'scouted').
action_verb(scout_horizon, present, 'scouts').
action_target_type(scout_horizon, location).
action_prerequisite(scout_horizon, (has_item(Actor, spyglass))).
action_effect(scout_horizon, (assert(spotted(Actor, Target)))).
can_perform(Actor, scout_horizon, Target) :-
    has_item(Actor, spyglass).

%% repair_hull
action(repair_hull, 'repair_hull', craft, 4).
action_difficulty(repair_hull, 0.5).
action_duration(repair_hull, 3).
action_category(repair_hull, craft).
action_verb(repair_hull, past, 'repaired').
action_verb(repair_hull, present, 'repairs').
action_target_type(repair_hull, item).
action_prerequisite(repair_hull, (has_item(Actor, rope_coil))).
action_effect(repair_hull, (assert(repaired(Actor, Target)))).
can_perform(Actor, repair_hull, Target) :-
    has_item(Actor, rope_coil).

%% sell_plunder
action(sell_plunder, 'sell_plunder', trade, 2).
action_difficulty(sell_plunder, 0.3).
action_duration(sell_plunder, 1).
action_category(sell_plunder, trade).
action_verb(sell_plunder, past, 'sold plunder to').
action_verb(sell_plunder, present, 'sells plunder to').
action_target_type(sell_plunder, other).
action_prerequisite(sell_plunder, (has_item(Actor, gold_doubloon))).
action_effect(sell_plunder, (assert(traded_with(Actor, Target)))).
can_perform(Actor, sell_plunder, Target) :-
    has_item(Actor, gold_doubloon).

%% administer_medicine
action(administer_medicine, 'administer_medicine', medical, 2).
action_difficulty(administer_medicine, 0.3).
action_duration(administer_medicine, 1).
action_category(administer_medicine, medical).
action_verb(administer_medicine, past, 'treated').
action_verb(administer_medicine, present, 'treats').
action_target_type(administer_medicine, other).
action_prerequisite(administer_medicine, (has_item(Actor, medicine_pouch))).
action_effect(administer_medicine, (assert(healed(Actor, Target)))).
can_perform(Actor, administer_medicine, Target) :-
    has_item(Actor, medicine_pouch).

%% fire_cannon
action(fire_cannon, 'fire_cannon', combat, 6).
action_difficulty(fire_cannon, 0.6).
action_duration(fire_cannon, 2).
action_category(fire_cannon, combat).
action_verb(fire_cannon, past, 'fired upon').
action_verb(fire_cannon, present, 'fires upon').
action_target_type(fire_cannon, other).
action_prerequisite(fire_cannon, (has_item(Actor, cannonball), has_item(Actor, powder_keg))).
action_effect(fire_cannon, (assert(bombarded(Actor, Target)))).
can_perform(Actor, fire_cannon, Target) :-
    has_item(Actor, cannonball), has_item(Actor, powder_keg).

%% raise_jolly_roger
action(raise_jolly_roger, 'raise_jolly_roger', social, 1).
action_difficulty(raise_jolly_roger, 0.1).
action_duration(raise_jolly_roger, 1).
action_category(raise_jolly_roger, social).
action_verb(raise_jolly_roger, past, 'raised the Jolly Roger at').
action_verb(raise_jolly_roger, present, 'raises the Jolly Roger at').
action_target_type(raise_jolly_roger, location).
action_prerequisite(raise_jolly_roger, (has_item(Actor, jolly_roger))).
action_effect(raise_jolly_roger, (assert(intimidated(Actor, Target)))).
can_perform(Actor, raise_jolly_roger, Target) :-
    has_item(Actor, jolly_roger).
