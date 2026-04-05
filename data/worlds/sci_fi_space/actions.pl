%% Insimul Actions: Sci-Fi Space
%% Source: data/worlds/sci_fi_space/actions.pl
%% Created: 2026-04-03
%% Total: 12 actions
%%
%% Predicate schema (follows base actions format):
%%   action/4 -- action(AtomId, Name, ActionType, EnergyCost)
%%   action_difficulty/2, action_duration/2, action_category/2
%%   action_verb/3, action_target_type/2
%%   action_prerequisite/2, action_effect/2
%%   can_perform/3

%% Scan Area
action(scan_area, 'scan_area', exploration, 5).
action_difficulty(scan_area, 0.1).
action_duration(scan_area, 1).
action_category(scan_area, exploration).
action_verb(scan_area, past, 'scanned the area').
action_verb(scan_area, present, 'scans the area').
action_target_type(scan_area, location).
action_prerequisite(scan_area, (has_item(Actor, data_pad, _))).
action_effect(scan_area, (reveal_area(Actor, Zone), assert(scanned(Actor, Zone)))).
can_perform(Actor, scan_area, Zone) :-
    has_item(Actor, data_pad, _), location(Actor, Zone).

%% Repair Systems
action(repair_systems, 'repair_systems', crafting, 15).
action_difficulty(repair_systems, 0.4).
action_duration(repair_systems, 3).
action_category(repair_systems, engineering).
action_verb(repair_systems, past, 'repaired the system').
action_verb(repair_systems, present, 'repairs the system').
action_target_type(repair_systems, location).
action_prerequisite(repair_systems, (has_item(Actor, repair_kit, _), damaged_system(Target))).
action_effect(repair_systems, (repair(Target), modify_durability(Target, 50))).
can_perform(Actor, repair_systems, Target) :-
    has_item(Actor, repair_kit, _), near(Actor, Target, 3), damaged_system(Target).

%% Initiate FTL Jump
action(ftl_jump, 'ftl_jump', navigation, 25).
action_difficulty(ftl_jump, 0.6).
action_duration(ftl_jump, 1).
action_category(ftl_jump, navigation).
action_verb(ftl_jump, past, 'jumped to FTL').
action_verb(ftl_jump, present, 'initiates FTL jump').
action_target_type(ftl_jump, self).
action_prerequisite(ftl_jump, (on_ship(Actor), has_item(Actor, ftl_nav_chart, _))).
action_effect(ftl_jump, (move_to_system(Actor, Destination), consume_fuel(Ship, 50))).
can_perform(Actor, ftl_jump, _) :-
    on_ship(Actor), has_item(Actor, ftl_nav_chart, _).

%% Hack Terminal
action(hack_terminal, 'hack_terminal', stealth, 15).
action_difficulty(hack_terminal, 0.5).
action_duration(hack_terminal, 2).
action_category(hack_terminal, hacking).
action_verb(hack_terminal, past, 'hacked the terminal').
action_verb(hack_terminal, present, 'hacks the terminal').
action_target_type(hack_terminal, location).
action_prerequisite(hack_terminal, (near(Actor, Terminal, 2), terminal(Terminal), has_item(Actor, encryption_key, _))).
action_effect(hack_terminal, (access_data(Actor, Terminal), assert(hacked(Terminal)))).
can_perform(Actor, hack_terminal, Terminal) :-
    near(Actor, Terminal, 2), terminal(Terminal), has_item(Actor, encryption_key, _).

%% Administer Medi-Gel
action(administer_medi_gel, 'administer_medi_gel', medical, 5).
action_difficulty(administer_medi_gel, 0.2).
action_duration(administer_medi_gel, 1).
action_category(administer_medi_gel, medical).
action_verb(administer_medi_gel, past, 'applied medi-gel').
action_verb(administer_medi_gel, present, 'applies medi-gel').
action_target_type(administer_medi_gel, other).
action_prerequisite(administer_medi_gel, (has_item(Actor, medi_gel, _), near(Actor, Target, 3))).
action_effect(administer_medi_gel, (modify_health(Target, 30), consume_item(Actor, medi_gel, 1))).
can_perform(Actor, administer_medi_gel, Target) :-
    has_item(Actor, medi_gel, _), near(Actor, Target, 3).

%% EVA Spacewalk
action(eva_spacewalk, 'eva_spacewalk', exploration, 20).
action_difficulty(eva_spacewalk, 0.5).
action_duration(eva_spacewalk, 4).
action_category(eva_spacewalk, exploration).
action_verb(eva_spacewalk, past, 'performed a spacewalk').
action_verb(eva_spacewalk, present, 'performs a spacewalk').
action_target_type(eva_spacewalk, self).
action_prerequisite(eva_spacewalk, (wearing(Actor, eva_suit), has_item(Actor, oxygen_canister, _))).
action_effect(eva_spacewalk, (assert(in_eva(Actor)), consume_item(Actor, oxygen_canister, 1))).
can_perform(Actor, eva_spacewalk, _) :-
    wearing(Actor, eva_suit), has_item(Actor, oxygen_canister, _).

%% Trade with Thassari
action(trade_thassari, 'trade_thassari', economic, 5).
action_difficulty(trade_thassari, 0.3).
action_duration(trade_thassari, 2).
action_category(trade_thassari, commerce).
action_verb(trade_thassari, past, 'traded with the Thassari').
action_verb(trade_thassari, present, 'trades with the Thassari').
action_target_type(trade_thassari, other).
action_prerequisite(trade_thassari, (near(Actor, Target, 5), faction(Target, thassari))).
action_effect(trade_thassari, (initiate_trade(Actor, Target), modify_reputation(Actor, thassari, 5))).
can_perform(Actor, trade_thassari, Target) :-
    near(Actor, Target, 5), faction(Target, thassari).

%% Smuggle Goods
action(smuggle_goods, 'smuggle_goods', stealth, 10).
action_difficulty(smuggle_goods, 0.6).
action_duration(smuggle_goods, 2).
action_category(smuggle_goods, smuggling).
action_verb(smuggle_goods, past, 'smuggled goods').
action_verb(smuggle_goods, present, 'smuggles goods').
action_target_type(smuggle_goods, self).
action_prerequisite(smuggle_goods, (has_item(Actor, contraband_spice, _), location(Actor, Zone))).
action_effect(smuggle_goods, (move_contraband(Actor, Zone))).
can_perform(Actor, smuggle_goods, _) :-
    has_item(Actor, contraband_spice, _).

%% Collect Biological Sample
action(collect_sample, 'collect_sample', exploration, 10).
action_difficulty(collect_sample, 0.3).
action_duration(collect_sample, 2).
action_category(collect_sample, research).
action_verb(collect_sample, past, 'collected a sample').
action_verb(collect_sample, present, 'collects a sample').
action_target_type(collect_sample, location).
action_prerequisite(collect_sample, (location(Actor, Zone), has_flora_or_fauna(Zone))).
action_effect(collect_sample, (assert(has_sample(Actor, Zone)))).
can_perform(Actor, collect_sample, Zone) :-
    location(Actor, Zone), has_flora_or_fauna(Zone).

%% Dock Ship
action(dock_ship, 'dock_ship', navigation, 10).
action_difficulty(dock_ship, 0.3).
action_duration(dock_ship, 1).
action_category(dock_ship, navigation).
action_verb(dock_ship, past, 'docked the ship').
action_verb(dock_ship, present, 'docks the ship').
action_target_type(dock_ship, location).
action_prerequisite(dock_ship, (on_ship(Actor), near_station(Actor, Station))).
action_effect(dock_ship, (assert(docked(Ship, Station)), move_to(Actor, Station))).
can_perform(Actor, dock_ship, Station) :-
    on_ship(Actor), near_station(Actor, Station).

%% Plant Hydroponic Crop
action(plant_crop, 'plant_crop', crafting, 10).
action_difficulty(plant_crop, 0.2).
action_duration(plant_crop, 2).
action_category(plant_crop, agriculture).
action_verb(plant_crop, past, 'planted crops').
action_verb(plant_crop, present, 'plants crops').
action_target_type(plant_crop, location).
action_prerequisite(plant_crop, (has_item(Actor, hydroponic_seeds, _), location(Actor, Zone), hydroponic_bay(Zone))).
action_effect(plant_crop, (consume_item(Actor, hydroponic_seeds, 1), assert(growing(Zone, crop)))).
can_perform(Actor, plant_crop, Zone) :-
    has_item(Actor, hydroponic_seeds, _), location(Actor, Zone), hydroponic_bay(Zone).

%% Send Transmission
action(send_transmission, 'send_transmission', social, 5).
action_difficulty(send_transmission, 0.1).
action_duration(send_transmission, 1).
action_category(send_transmission, communication).
action_verb(send_transmission, past, 'sent a transmission').
action_verb(send_transmission, present, 'sends a transmission').
action_target_type(send_transmission, other).
action_prerequisite(send_transmission, (has_item(Actor, data_pad, _), in_comms_range(Actor, Target))).
action_effect(send_transmission, (deliver_message(Actor, Target))).
can_perform(Actor, send_transmission, Target) :-
    has_item(Actor, data_pad, _), in_comms_range(Actor, Target).
