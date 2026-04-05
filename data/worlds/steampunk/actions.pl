%% Insimul Actions: Steampunk
%% Source: data/worlds/steampunk/actions.pl
%% Created: 2026-04-03
%% Total: 12 actions
%%
%% Predicate schema (base_actions style):
%%   action/4 -- action(AtomId, Name, Category, EnergyCost)
%%   action_difficulty/2, action_duration/2, action_category/2
%%   action_verb/3, action_target_type/2
%%   action_prerequisite/2, action_effect/2, can_perform/3

%% repair_clockwork
action(repair_clockwork, 'repair_clockwork', craft, 3).
action_difficulty(repair_clockwork, 0.4).
action_duration(repair_clockwork, 2).
action_category(repair_clockwork, craft).
action_verb(repair_clockwork, past, 'repaired').
action_verb(repair_clockwork, present, 'repairs').
action_target_type(repair_clockwork, item).
action_prerequisite(repair_clockwork, (has_item(Actor, tinker_toolkit))).
action_effect(repair_clockwork, (assert(repaired(Actor, Target)))).
can_perform(Actor, repair_clockwork, Target) :-
    has_item(Actor, tinker_toolkit).

%% pilot_airship
action(pilot_airship, 'pilot_airship', transport, 5).
action_difficulty(pilot_airship, 0.6).
action_duration(pilot_airship, 4).
action_category(pilot_airship, transport).
action_verb(pilot_airship, past, 'piloted').
action_verb(pilot_airship, present, 'pilots').
action_target_type(pilot_airship, location).
action_prerequisite(pilot_airship, (has_item(Actor, airship_ticket))).
action_effect(pilot_airship, (assert(traveled(Actor, Target)))).
can_perform(Actor, pilot_airship, Target) :-
    has_item(Actor, airship_ticket).

%% forge_component
action(forge_component, 'forge_component', craft, 4).
action_difficulty(forge_component, 0.5).
action_duration(forge_component, 3).
action_category(forge_component, craft).
action_verb(forge_component, past, 'forged').
action_verb(forge_component, present, 'forges').
action_target_type(forge_component, item).
action_prerequisite(forge_component, (has_item(Actor, brass_gears), has_item(Actor, copper_piping))).
action_effect(forge_component, (assert(crafted(Actor, Target)))).
can_perform(Actor, forge_component, Target) :-
    has_item(Actor, brass_gears), has_item(Actor, copper_piping).

%% refine_aether
action(refine_aether, 'refine_aether', craft, 6).
action_difficulty(refine_aether, 0.7).
action_duration(refine_aether, 3).
action_category(refine_aether, craft).
action_verb(refine_aether, past, 'refined').
action_verb(refine_aether, present, 'refines').
action_target_type(refine_aether, item).
action_prerequisite(refine_aether, (has_item(Actor, aether_crystal))).
action_effect(refine_aether, (assert(refined(Actor, Target)))).
can_perform(Actor, refine_aether, Target) :-
    has_item(Actor, aether_crystal).

%% send_pneumatic_message
action(send_pneumatic_message, 'send_pneumatic_message', social, 1).
action_difficulty(send_pneumatic_message, 0.1).
action_duration(send_pneumatic_message, 1).
action_category(send_pneumatic_message, social).
action_verb(send_pneumatic_message, past, 'sent a message to').
action_verb(send_pneumatic_message, present, 'sends a message to').
action_target_type(send_pneumatic_message, other).
action_prerequisite(send_pneumatic_message, (has_item(Actor, pneumatic_message))).
action_effect(send_pneumatic_message, (assert(contacted(Actor, Target)))).
can_perform(Actor, send_pneumatic_message, Target) :-
    has_item(Actor, pneumatic_message).

%% attend_salon
action(attend_salon, 'attend_salon', social, 2).
action_difficulty(attend_salon, 0.3).
action_duration(attend_salon, 2).
action_category(attend_salon, social).
action_verb(attend_salon, past, 'attended the salon with').
action_verb(attend_salon, present, 'attends the salon with').
action_target_type(attend_salon, other).
action_prerequisite(attend_salon, (attribute(Actor, propriety, P), P > 50)).
action_effect(attend_salon, (assert(debated(Actor, Target)))).
can_perform(Actor, attend_salon, Target) :-
    attribute(Actor, propriety, P), P > 50.

%% operate_steam_engine
action(operate_steam_engine, 'operate_steam_engine', work, 4).
action_difficulty(operate_steam_engine, 0.5).
action_duration(operate_steam_engine, 3).
action_category(operate_steam_engine, work).
action_verb(operate_steam_engine, past, 'operated').
action_verb(operate_steam_engine, present, 'operates').
action_target_type(operate_steam_engine, item).
action_prerequisite(operate_steam_engine, (has_item(Actor, pressure_gauge))).
action_effect(operate_steam_engine, (assert(operated(Actor, Target)))).
can_perform(Actor, operate_steam_engine, Target) :-
    has_item(Actor, pressure_gauge).

%% mine_ore
action(mine_ore, 'mine_ore', work, 5).
action_difficulty(mine_ore, 0.5).
action_duration(mine_ore, 4).
action_category(mine_ore, work).
action_verb(mine_ore, past, 'mined').
action_verb(mine_ore, present, 'mines').
action_target_type(mine_ore, location).
action_prerequisite(mine_ore, (location(Actor, coppermouth))).
action_effect(mine_ore, (assert(mined(Actor, Target)))).
can_perform(Actor, mine_ore, Target) :-
    location(Actor, coppermouth).

%% read_blueprint
action(read_blueprint, 'read_blueprint', knowledge, 2).
action_difficulty(read_blueprint, 0.3).
action_duration(read_blueprint, 1).
action_category(read_blueprint, knowledge).
action_verb(read_blueprint, past, 'studied').
action_verb(read_blueprint, present, 'studies').
action_target_type(read_blueprint, item).
action_prerequisite(read_blueprint, (has_item(Actor, blueprint_scroll))).
action_effect(read_blueprint, (assert(learned_blueprint(Actor, Target)))).
can_perform(Actor, read_blueprint, Target) :-
    has_item(Actor, blueprint_scroll).

%% navigate_airship
action(navigate_airship, 'navigate_airship', transport, 3).
action_difficulty(navigate_airship, 0.5).
action_duration(navigate_airship, 2).
action_category(navigate_airship, transport).
action_verb(navigate_airship, past, 'navigated').
action_verb(navigate_airship, present, 'navigates').
action_target_type(navigate_airship, location).
action_prerequisite(navigate_airship, (has_item(Actor, gyro_compass))).
action_effect(navigate_airship, (assert(charted_course(Actor, Target)))).
can_perform(Actor, navigate_airship, Target) :-
    has_item(Actor, gyro_compass).

%% visit_steam_baths
action(visit_steam_baths, 'visit_steam_baths', social, 2).
action_difficulty(visit_steam_baths, 0.1).
action_duration(visit_steam_baths, 2).
action_category(visit_steam_baths, social).
action_verb(visit_steam_baths, past, 'visited the steam baths with').
action_verb(visit_steam_baths, present, 'visits the steam baths with').
action_target_type(visit_steam_baths, other).
action_prerequisite(visit_steam_baths, true).
action_effect(visit_steam_baths, (assert(relaxed(Actor, Target)))).
can_perform(Actor, visit_steam_baths, _Target) :-
    location(Actor, ironhaven).

%% assemble_automaton
action(assemble_automaton, 'assemble_automaton', craft, 8).
action_difficulty(assemble_automaton, 0.8).
action_duration(assemble_automaton, 5).
action_category(assemble_automaton, craft).
action_verb(assemble_automaton, past, 'assembled').
action_verb(assemble_automaton, present, 'assembles').
action_target_type(assemble_automaton, item).
action_prerequisite(assemble_automaton, (has_item(Actor, automaton_servo), has_item(Actor, aether_crystal))).
action_effect(assemble_automaton, (assert(built_automaton(Actor, Target)))).
can_perform(Actor, assemble_automaton, Target) :-
    has_item(Actor, automaton_servo), has_item(Actor, aether_crystal).
