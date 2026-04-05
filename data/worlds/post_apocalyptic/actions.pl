%% Insimul Actions: Post-Apocalyptic Wasteland
%% Source: data/worlds/post_apocalyptic/actions.pl
%% Created: 2026-04-03
%% Total: 12 actions
%%
%% Predicate schema (follows base actions format):
%%   action/4 -- action(AtomId, Name, ActionType, EnergyCost)
%%   action_difficulty/2, action_duration/2, action_category/2
%%   action_verb/3, action_target_type/2
%%   action_prerequisite/2, action_effect/2
%%   can_perform/3

%% Scavenge Ruins
action(scavenge_ruins, 'scavenge_ruins', exploration, 15).
action_difficulty(scavenge_ruins, 0.4).
action_duration(scavenge_ruins, 3).
action_category(scavenge_ruins, survival).
action_verb(scavenge_ruins, past, 'scavenged').
action_verb(scavenge_ruins, present, 'scavenges').
action_target_type(scavenge_ruins, location).
action_prerequisite(scavenge_ruins, (location(Actor, Ruins), ruin_site(Ruins))).
action_effect(scavenge_ruins, (random_loot(Actor, wasteland_loot_table))).
can_perform(Actor, scavenge_ruins, Ruins) :-
    location(Actor, Ruins), ruin_site(Ruins).

%% Purify Water
action(purify_water, 'purify_water', crafting, 10).
action_difficulty(purify_water, 0.2).
action_duration(purify_water, 2).
action_category(purify_water, survival).
action_verb(purify_water, past, 'purified water').
action_verb(purify_water, present, 'purifies water').
action_target_type(purify_water, self).
action_prerequisite(purify_water, (has_item(Actor, water_filter, _), near_water_source(Actor))).
action_effect(purify_water, (assert(has_item(Actor, purified_water, 1)))).
can_perform(Actor, purify_water, _) :-
    has_item(Actor, water_filter, _), near_water_source(Actor).

%% Craft Weapon
action(craft_weapon, 'craft_weapon', crafting, 20).
action_difficulty(craft_weapon, 0.5).
action_duration(craft_weapon, 4).
action_category(craft_weapon, crafting).
action_verb(craft_weapon, past, 'crafted a weapon').
action_verb(craft_weapon, present, 'crafts a weapon').
action_target_type(craft_weapon, self).
action_prerequisite(craft_weapon, (has_item(Actor, scrap_metal, N), N >= 3, in_building(Actor))).
action_effect(craft_weapon, (retract(has_item(Actor, scrap_metal, 3)), assert(has_item(Actor, scrap_machete, 1)))).
can_perform(Actor, craft_weapon, _) :-
    has_item(Actor, scrap_metal, N), N >= 3, in_building(Actor).

%% Heal Wound
action(heal_wound, 'heal_wound', medical, 10).
action_difficulty(heal_wound, 0.3).
action_duration(heal_wound, 2).
action_category(heal_wound, survival).
action_verb(heal_wound, past, 'treated wounds').
action_verb(heal_wound, present, 'treats wounds').
action_target_type(heal_wound, other).
action_prerequisite(heal_wound, (has_item(Actor, medkit_pa, _), near(Actor, Target, 3))).
action_effect(heal_wound, (modify_health(Target, 25), retract(has_item(Actor, medkit_pa, 1)))).
can_perform(Actor, heal_wound, Target) :-
    has_item(Actor, medkit_pa, _), near(Actor, Target, 3).

%% Scout Area
action(scout_area, 'scout_area', exploration, 12).
action_difficulty(scout_area, 0.3).
action_duration(scout_area, 2).
action_category(scout_area, survival).
action_verb(scout_area, past, 'scouted the area').
action_verb(scout_area, present, 'scouts the area').
action_target_type(scout_area, location).
action_prerequisite(scout_area, (location(Actor, Zone))).
action_effect(scout_area, (reveal_area(Actor, Zone), assert(scouted(Actor, Zone)))).
can_perform(Actor, scout_area, Zone) :-
    location(Actor, Zone).

%% Barter Trade
action(barter_trade, 'barter_trade', economic, 5).
action_difficulty(barter_trade, 0.3).
action_duration(barter_trade, 1).
action_category(barter_trade, commerce).
action_verb(barter_trade, past, 'bartered with').
action_verb(barter_trade, present, 'barters with').
action_target_type(barter_trade, other).
action_prerequisite(barter_trade, (near(Actor, Target, 5), npc_will_trade(Target))).
action_effect(barter_trade, (initiate_trade(Actor, Target))).
can_perform(Actor, barter_trade, Target) :-
    near(Actor, Target, 5), npc_will_trade(Target).

%% Set Up Camp
action(set_up_camp, 'set_up_camp', survival, 15).
action_difficulty(set_up_camp, 0.2).
action_duration(set_up_camp, 3).
action_category(set_up_camp, survival).
action_verb(set_up_camp, past, 'set up camp').
action_verb(set_up_camp, present, 'sets up camp').
action_target_type(set_up_camp, location).
action_prerequisite(set_up_camp, (location(Actor, Zone), \+ irradiated(Zone))).
action_effect(set_up_camp, (assert(camp(Actor, Zone)), assert(shelter(Actor)))).
can_perform(Actor, set_up_camp, Zone) :-
    location(Actor, Zone), \+ irradiated(Zone).

%% Use Geiger Counter
action(use_geiger, 'use_geiger', exploration, 5).
action_difficulty(use_geiger, 0.1).
action_duration(use_geiger, 1).
action_category(use_geiger, survival).
action_verb(use_geiger, past, 'scanned for radiation').
action_verb(use_geiger, present, 'scans for radiation').
action_target_type(use_geiger, self).
action_prerequisite(use_geiger, (has_item(Actor, geiger_counter, _))).
action_effect(use_geiger, (reveal_radiation_levels(Actor))).
can_perform(Actor, use_geiger, _) :-
    has_item(Actor, geiger_counter, _).

%% Fortify Position
action(fortify_position, 'fortify_position', crafting, 20).
action_difficulty(fortify_position, 0.4).
action_duration(fortify_position, 4).
action_category(fortify_position, defense).
action_verb(fortify_position, past, 'fortified the position').
action_verb(fortify_position, present, 'fortifies the position').
action_target_type(fortify_position, location).
action_prerequisite(fortify_position, (has_item(Actor, scrap_metal, N), N >= 5, in_building(Actor))).
action_effect(fortify_position, (retract(has_item(Actor, scrap_metal, 5)), modify_defense(Location, 10))).
can_perform(Actor, fortify_position, Location) :-
    has_item(Actor, scrap_metal, N), N >= 5, location(Actor, Location), in_building(Actor).

%% Signal for Help
action(signal_for_help, 'signal_for_help', social, 5).
action_difficulty(signal_for_help, 0.1).
action_duration(signal_for_help, 1).
action_category(signal_for_help, survival).
action_verb(signal_for_help, past, 'sent a distress signal').
action_verb(signal_for_help, present, 'sends a distress signal').
action_target_type(signal_for_help, self).
action_prerequisite(signal_for_help, (has_item(Actor, signal_flare, _))).
action_effect(signal_for_help, (retract(has_item(Actor, signal_flare, 1)), alert_nearby_allies(Actor))).
can_perform(Actor, signal_for_help, _) :-
    has_item(Actor, signal_flare, _).

%% Sneak Past
action(sneak_past, 'sneak_past', stealth, 10).
action_difficulty(sneak_past, 0.6).
action_duration(sneak_past, 2).
action_category(sneak_past, stealth).
action_verb(sneak_past, past, 'sneaked past').
action_verb(sneak_past, present, 'sneaks past').
action_target_type(sneak_past, other).
action_prerequisite(sneak_past, (near(Actor, Target, 10), \+ detected(Actor, Target))).
action_effect(sneak_past, (move_past(Actor, Target))).
can_perform(Actor, sneak_past, Target) :-
    near(Actor, Target, 10), \+ detected(Actor, Target).

%% Harvest Herbs
action(harvest_herbs, 'harvest_herbs', gathering, 8).
action_difficulty(harvest_herbs, 0.2).
action_duration(harvest_herbs, 2).
action_category(harvest_herbs, survival).
action_verb(harvest_herbs, past, 'harvested herbs').
action_verb(harvest_herbs, present, 'harvests herbs').
action_target_type(harvest_herbs, location).
action_prerequisite(harvest_herbs, (location(Actor, Zone), has_flora(Zone))).
action_effect(harvest_herbs, (assert(has_item(Actor, rad_herbs, 1)))).
can_perform(Actor, harvest_herbs, Zone) :-
    location(Actor, Zone), has_flora(Zone).
