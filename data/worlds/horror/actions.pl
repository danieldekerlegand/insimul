%% Insimul Actions: Horror World
%% Source: data/worlds/horror/actions.pl
%% Created: 2026-04-03
%% Total: 12 actions
%%
%% Predicate schema (matches base_actions.pl format):
%%   action/4 -- action(AtomId, Name, ActionType, EnergyCost)
%%   action_difficulty/2, action_duration/2, action_category/2
%%   action_verb/3, action_target_type/2
%%   action_requires_target/1, action_range/2
%%   action_prerequisite/2, action_effect/2, can_perform/3

%% investigate_location
%% Search a location for clues about supernatural activity
action(investigate_location, 'investigate_location', investigation, 3).
action_difficulty(investigate_location, 0.4).
action_duration(investigate_location, 3).
action_category(investigate_location, investigation).
action_verb(investigate_location, past, 'investigated').
action_verb(investigate_location, present, 'investigates').
action_target_type(investigate_location, location).
action_range(investigate_location, 3).
action_prerequisite(investigate_location, (has_item(Actor, flashlight, _))).
action_effect(investigate_location, (assert(clue_found(Actor, Location)))).
can_perform(Actor, investigate_location, _Location) :-
    has_item(Actor, flashlight, _).

%% barricade_door
%% Reinforce a door against intrusion
action(barricade_door, 'barricade_door', survival, 4).
action_difficulty(barricade_door, 0.3).
action_duration(barricade_door, 2).
action_category(barricade_door, fortification).
action_verb(barricade_door, past, 'barricaded').
action_verb(barricade_door, present, 'barricades').
action_target_type(barricade_door, location).
action_range(barricade_door, 3).
action_prerequisite(barricade_door, (has_item(Actor, boarding_planks, _))).
action_effect(barricade_door, (assert(barricaded(Location)))).
action_effect(barricade_door, (retract(has_item(Actor, boarding_planks, _)))).
can_perform(Actor, barricade_door, _Location) :-
    has_item(Actor, boarding_planks, _).

%% draw_ward
%% Draw a protective circle or sigil with ritual chalk
action(draw_ward, 'draw_ward', ritual, 3).
action_difficulty(draw_ward, 0.5).
action_duration(draw_ward, 2).
action_category(draw_ward, protection).
action_verb(draw_ward, past, 'drew a ward at').
action_verb(draw_ward, present, 'draws a ward at').
action_target_type(draw_ward, location).
action_range(draw_ward, 2).
action_prerequisite(draw_ward, (has_item(Actor, ritual_chalk, _))).
action_effect(draw_ward, (assert(warded(Location)))).
action_effect(draw_ward, (retract(has_item(Actor, ritual_chalk, _)))).
can_perform(Actor, draw_ward, _Location) :-
    has_item(Actor, ritual_chalk, _).

%% read_occult_tome
%% Study a forbidden text to gain knowledge at the cost of sanity
action(read_occult_tome, 'read_occult_tome', ritual, 2).
action_difficulty(read_occult_tome, 0.6).
action_duration(read_occult_tome, 4).
action_category(read_occult_tome, forbidden_knowledge).
action_verb(read_occult_tome, past, 'read the occult tome').
action_verb(read_occult_tome, present, 'reads the occult tome').
action_target_type(read_occult_tome, none).
action_range(read_occult_tome, 0).
action_prerequisite(read_occult_tome, (has_item(Actor, occult_tome, _))).
action_effect(read_occult_tome, (assert(forbidden_knowledge(Actor)))).
action_effect(read_occult_tome, (modify_attribute(Actor, sanity, -10))).
can_perform(Actor, read_occult_tome, _) :-
    has_item(Actor, occult_tome, _).

%% apply_salt_ward
%% Pour blessed salt in a protective line or circle
action(apply_salt_ward, 'apply_salt_ward', ritual, 1).
action_difficulty(apply_salt_ward, 0.2).
action_duration(apply_salt_ward, 1).
action_category(apply_salt_ward, protection).
action_verb(apply_salt_ward, past, 'laid a salt ward at').
action_verb(apply_salt_ward, present, 'lays a salt ward at').
action_target_type(apply_salt_ward, location).
action_range(apply_salt_ward, 3).
action_prerequisite(apply_salt_ward, (has_item(Actor, protective_salt, _))).
action_effect(apply_salt_ward, (assert(salt_warded(Location)))).
action_effect(apply_salt_ward, (retract(has_item(Actor, protective_salt, _)))).
can_perform(Actor, apply_salt_ward, _Location) :-
    has_item(Actor, protective_salt, _).

%% throw_holy_water
%% Hurl holy water at a supernatural entity
action(throw_holy_water, 'throw_holy_water', combat, 2).
action_difficulty(throw_holy_water, 0.4).
action_duration(throw_holy_water, 1).
action_category(throw_holy_water, supernatural_defense).
action_verb(throw_holy_water, past, 'threw holy water at').
action_verb(throw_holy_water, present, 'throws holy water at').
action_target_type(throw_holy_water, other).
action_requires_target(throw_holy_water).
action_range(throw_holy_water, 5).
action_prerequisite(throw_holy_water, (has_item(Actor, holy_water, _))).
action_effect(throw_holy_water, (assert(entity_repelled(Target)))).
action_effect(throw_holy_water, (retract(has_item(Actor, holy_water, _)))).
can_perform(Actor, throw_holy_water, Target) :-
    has_item(Actor, holy_water, _),
    near(Actor, Target, 5).

%% brew_elixir
%% Prepare a sanity-restoring elixir from herbs
action(brew_elixir, 'brew_elixir', crafting, 3).
action_difficulty(brew_elixir, 0.6).
action_duration(brew_elixir, 3).
action_category(brew_elixir, alchemy).
action_verb(brew_elixir, past, 'brewed an elixir').
action_verb(brew_elixir, present, 'brews an elixir').
action_target_type(brew_elixir, none).
action_range(brew_elixir, 0).
action_prerequisite(brew_elixir, (status(Actor, apothecary))).
action_effect(brew_elixir, (assert(has_item(Actor, sanity_elixir, 1)))).
can_perform(Actor, brew_elixir, _) :-
    status(Actor, apothecary).

%% pray_for_protection
%% Offer prayers to strengthen faith-based protections
action(pray_for_protection, 'pray_for_protection', ritual, 2).
action_difficulty(pray_for_protection, 0.3).
action_duration(pray_for_protection, 2).
action_category(pray_for_protection, faith).
action_verb(pray_for_protection, past, 'prayed for protection').
action_verb(pray_for_protection, present, 'prays for protection').
action_target_type(pray_for_protection, none).
action_range(pray_for_protection, 0).
action_prerequisite(pray_for_protection, (trait(Actor, devout))).
action_effect(pray_for_protection, (modify_attribute(Actor, sanity, 5))).
can_perform(Actor, pray_for_protection, _) :-
    trait(Actor, devout).

%% consult_witch
%% Seek cryptic guidance from Agnes Wight
action(consult_witch, 'consult_witch', social, 2).
action_difficulty(consult_witch, 0.4).
action_duration(consult_witch, 2).
action_category(consult_witch, occult).
action_verb(consult_witch, past, 'consulted').
action_verb(consult_witch, present, 'consults').
action_target_type(consult_witch, other).
action_requires_target(consult_witch).
action_range(consult_witch, 5).
action_prerequisite(consult_witch, (status(Target, witch))).
action_effect(consult_witch, (assert(prophecy_received(Actor)))).
action_effect(consult_witch, (modify_attribute(Actor, sanity, -3))).
can_perform(Actor, consult_witch, Target) :-
    status(Target, witch),
    near(Actor, Target, 5).

%% light_torch
%% Ignite a torch or lantern to ward off darkness
action(light_torch, 'light_torch', survival, 1).
action_difficulty(light_torch, 0.1).
action_duration(light_torch, 0).
action_category(light_torch, survival).
action_verb(light_torch, past, 'lit a torch').
action_verb(light_torch, present, 'lights a torch').
action_target_type(light_torch, none).
action_range(light_torch, 0).
action_prerequisite(light_torch, (has_item(Actor, matches_hr, _))).
action_effect(light_torch, (assert(has_light(Actor)))).
can_perform(Actor, light_torch, _) :-
    has_item(Actor, matches_hr, _).

%% search_for_clues
%% Carefully examine objects and documents for hidden information
action(search_for_clues, 'search_for_clues', investigation, 2).
action_difficulty(search_for_clues, 0.3).
action_duration(search_for_clues, 2).
action_category(search_for_clues, investigation).
action_verb(search_for_clues, past, 'searched for clues').
action_verb(search_for_clues, present, 'searches for clues').
action_target_type(search_for_clues, location).
action_range(search_for_clues, 3).
action_effect(search_for_clues, (assert(area_searched(Actor, Location)))).
can_perform(Actor, search_for_clues, _Location) :-
    alive(Actor).

%% fire_revolver
%% Discharge a firearm at a threat
action(fire_revolver, 'fire_revolver', combat, 2).
action_difficulty(fire_revolver, 0.5).
action_duration(fire_revolver, 1).
action_category(fire_revolver, combat).
action_verb(fire_revolver, past, 'fired at').
action_verb(fire_revolver, present, 'fires at').
action_target_type(fire_revolver, other).
action_requires_target(fire_revolver).
action_range(fire_revolver, 15).
action_prerequisite(fire_revolver, (has_item(Actor, revolver, _))).
action_effect(fire_revolver, (assert(shot_fired(Actor, Target)))).
can_perform(Actor, fire_revolver, Target) :-
    has_item(Actor, revolver, _),
    near(Actor, Target, 15).
