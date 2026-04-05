%% Insimul Actions: New Earth Colony
%% Source: data/worlds/new_earth_colony/actions.pl
%% Created: 2026-04-03
%% Total: 12 actions
%%
%% Predicate schema:
%%   action/4 -- action(AtomId, Name, Category, EnergyCost)
%%   action_difficulty/2, action_duration/2, action_category/2
%%   action_verb/3, action_target_type/2
%%   action_requires_target/1, action_range/2
%%   action_prerequisite/2, action_effect/2, can_perform/3

%% conduct_eva
%% Exit the colony to perform extravehicular activity on the surface
action(conduct_eva, 'conduct_eva', exploration, 3).
action_difficulty(conduct_eva, 0.4).
action_duration(conduct_eva, 4).
action_category(conduct_eva, exploration).
action_verb(conduct_eva, past, 'conducted EVA').
action_verb(conduct_eva, present, 'conducts EVA').
action_target_type(conduct_eva, location).
action_range(conduct_eva, 0).
action_prerequisite(conduct_eva, (has_item(Actor, eva_suit_mk3))).
action_effect(conduct_eva, (assert(status(Actor, on_surface)))).
can_perform(Actor, conduct_eva, _Target) :-
    has_item(Actor, eva_suit_mk3).

%% collect_sample
%% Collect an alien flora or mineral sample from the surface
action(collect_sample, 'collect_sample', science, 2).
action_difficulty(collect_sample, 0.3).
action_duration(collect_sample, 2).
action_category(collect_sample, science).
action_verb(collect_sample, past, 'collected a sample').
action_verb(collect_sample, present, 'collects a sample').
action_target_type(collect_sample, object).
action_range(collect_sample, 3).
action_prerequisite(collect_sample, (status(Actor, on_surface))).
action_effect(collect_sample, (assert(has_item(Actor, alien_flora_sample)))).
can_perform(Actor, collect_sample, _Target) :-
    status(Actor, on_surface).

%% scan_minerals
%% Use the mineral scanner to survey a grid sector for deposits
action(scan_minerals, 'scan_minerals', science, 2).
action_difficulty(scan_minerals, 0.3).
action_duration(scan_minerals, 3).
action_category(scan_minerals, science).
action_verb(scan_minerals, past, 'scanned for minerals').
action_verb(scan_minerals, present, 'scans for minerals').
action_target_type(scan_minerals, location).
action_range(scan_minerals, 10).
action_prerequisite(scan_minerals, (has_item(Actor, mineral_scanner))).
action_effect(scan_minerals, (assert(surveyed(Actor, Target)))).
can_perform(Actor, scan_minerals, _Target) :-
    has_item(Actor, mineral_scanner).

%% repair_system
%% Use engineering tools to repair damaged colony infrastructure
action(repair_system, 'repair_system', engineering, 3).
action_difficulty(repair_system, 0.5).
action_duration(repair_system, 4).
action_category(repair_system, engineering).
action_verb(repair_system, past, 'repaired the system').
action_verb(repair_system, present, 'repairs the system').
action_target_type(repair_system, object).
action_requires_target(repair_system).
action_range(repair_system, 3).
action_prerequisite(repair_system, (attribute(Actor, technical_skill, Skill), Skill > 40)).
action_effect(repair_system, (assert(repaired(Target)))).
can_perform(Actor, repair_system, Target) :-
    attribute(Actor, technical_skill, Skill), Skill > 40,
    near(Actor, Target, 3).

%% plant_crops
%% Plant and tend hydroponic crops in the biodome farms
action(plant_crops, 'plant_crops', agriculture, 2).
action_difficulty(plant_crops, 0.2).
action_duration(plant_crops, 3).
action_category(plant_crops, agriculture).
action_verb(plant_crops, past, 'planted crops').
action_verb(plant_crops, present, 'plants crops').
action_target_type(plant_crops, location).
action_range(plant_crops, 2).
action_prerequisite(plant_crops, (at_location(Actor, Loc), building(Loc, business, hydroponic_farm))).
action_effect(plant_crops, (assert(crop_planted(Actor, Target)))).
can_perform(Actor, plant_crops, Target) :-
    at_location(Actor, Loc),
    building(Loc, business, hydroponic_farm).

%% pilot_shuttle
%% Fly a shuttle between colony settlements
action(pilot_shuttle, 'pilot_shuttle', transport, 3).
action_difficulty(pilot_shuttle, 0.6).
action_duration(pilot_shuttle, 5).
action_category(pilot_shuttle, transport).
action_verb(pilot_shuttle, past, 'piloted the shuttle').
action_verb(pilot_shuttle, present, 'pilots the shuttle').
action_target_type(pilot_shuttle, location).
action_range(pilot_shuttle, 0).
action_prerequisite(pilot_shuttle, (attribute(Actor, piloting_skill, Skill), Skill > 50)).
action_effect(pilot_shuttle, (retract(at_location(Actor, _)), assert(at_location(Actor, Target)))).
can_perform(Actor, pilot_shuttle, _Target) :-
    attribute(Actor, piloting_skill, Skill), Skill > 50.

%% analyze_data
%% Process research data at a laboratory terminal
action(analyze_data, 'analyze_data', science, 2).
action_difficulty(analyze_data, 0.4).
action_duration(analyze_data, 3).
action_category(analyze_data, science).
action_verb(analyze_data, past, 'analyzed the data').
action_verb(analyze_data, present, 'analyzes data').
action_target_type(analyze_data, object).
action_range(analyze_data, 2).
action_prerequisite(analyze_data, (attribute(Actor, intelligence, Int), Int > 50)).
action_effect(analyze_data, (assert(data_analyzed(Actor, Target)))).
can_perform(Actor, analyze_data, Target) :-
    attribute(Actor, intelligence, Int), Int > 50,
    at_location(Actor, Loc),
    building(Loc, business, laboratory).

%% administer_medical
%% Provide medical treatment to a colonist at the medical bay
action(administer_medical, 'administer_medical', medical, 2).
action_difficulty(administer_medical, 0.5).
action_duration(administer_medical, 2).
action_category(administer_medical, medical).
action_verb(administer_medical, past, 'administered medical treatment').
action_verb(administer_medical, present, 'administers medical treatment').
action_target_type(administer_medical, other).
action_requires_target(administer_medical).
action_range(administer_medical, 3).
action_prerequisite(administer_medical, (at_location(Actor, Loc), building(Loc, business, medical_bay))).
action_effect(administer_medical, (retract(status(Target, injured)), assert(status(Target, healthy)))).
can_perform(Actor, administer_medical, Target) :-
    at_location(Actor, Loc),
    building(Loc, business, medical_bay),
    near(Actor, Target, 3).

%% broadcast_message
%% Send a message via the deep space communications array
action(broadcast_message, 'broadcast_message', communication, 1).
action_difficulty(broadcast_message, 0.2).
action_duration(broadcast_message, 1).
action_category(broadcast_message, communication).
action_verb(broadcast_message, past, 'broadcast a message').
action_verb(broadcast_message, present, 'broadcasts a message').
action_target_type(broadcast_message, none).
action_range(broadcast_message, 0).
action_prerequisite(broadcast_message, (at_location(Actor, Loc), building(Loc, civic, communications_array))).
action_effect(broadcast_message, (assert(message_sent(Actor)))).
can_perform(Actor, broadcast_message, _Target) :-
    at_location(Actor, Loc),
    building(Loc, civic, communications_array).

%% recharge_suit
%% Recharge EVA suit oxygen and power at a depot
action(recharge_suit, 'recharge_suit', maintenance, 1).
action_difficulty(recharge_suit, 0.1).
action_duration(recharge_suit, 1).
action_category(recharge_suit, maintenance).
action_verb(recharge_suit, past, 'recharged the suit').
action_verb(recharge_suit, present, 'recharges the suit').
action_target_type(recharge_suit, none).
action_range(recharge_suit, 2).
action_prerequisite(recharge_suit, (has_item(Actor, eva_suit_mk3))).
action_effect(recharge_suit, (assert(suit_charged(Actor)))).
can_perform(Actor, recharge_suit, _Target) :-
    has_item(Actor, eva_suit_mk3),
    at_location(Actor, Loc),
    building(Loc, business, equipment_depot).

%% trade_resources
%% Exchange resources with another colonist or at the cargo depot
action(trade_resources, 'trade_resources', commerce, 1).
action_difficulty(trade_resources, 0.2).
action_duration(trade_resources, 2).
action_category(trade_resources, commerce).
action_verb(trade_resources, past, 'traded resources').
action_verb(trade_resources, present, 'trades resources').
action_target_type(trade_resources, other).
action_requires_target(trade_resources).
action_range(trade_resources, 5).
action_prerequisite(trade_resources, (near(Actor, Target, 5))).
action_effect(trade_resources, (assert(traded(Actor, Target)))).
can_perform(Actor, trade_resources, Target) :-
    near(Actor, Target, 5).

%% query_ai_core
%% Access the AI Core Nexus for information or analysis
action(query_ai_core, 'query_ai_core', technology, 1).
action_difficulty(query_ai_core, 0.3).
action_duration(query_ai_core, 2).
action_category(query_ai_core, technology).
action_verb(query_ai_core, past, 'queried the AI core').
action_verb(query_ai_core, present, 'queries the AI core').
action_target_type(query_ai_core, none).
action_range(query_ai_core, 0).
action_prerequisite(query_ai_core, (at_location(Actor, Loc), building(Loc, civic, ai_core))).
action_effect(query_ai_core, (assert(ai_consulted(Actor)))).
can_perform(Actor, query_ai_core, _Target) :-
    at_location(Actor, Loc),
    building(Loc, civic, ai_core).
