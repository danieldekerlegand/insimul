%% Insimul Actions: Urban Fantasy -- Veilhaven
%% Source: data/worlds/urban_fantasy/actions.pl
%% Created: 2026-04-03
%% Total: 12 actions
%%
%% Format follows base_actions.pl pattern

%% activate_glamour
% Action: activate_glamour
% Fae disguises their true appearance with an illusion
% Type: magic / illusion

action(activate_glamour, 'activate_glamour', magic, 10).
action_difficulty(activate_glamour, 0.3).
action_duration(activate_glamour, 1).
action_category(activate_glamour, illusion).
action_verb(activate_glamour, past, 'activated glamour').
action_verb(activate_glamour, present, 'activates glamour').
action_target_type(activate_glamour, self).
action_prerequisite(activate_glamour, (species(Actor, fae))).
action_effect(activate_glamour, (assert(glamoured(Actor)))).
can_perform(Actor, activate_glamour, _) :-
    species(Actor, fae), \+ glamoured(Actor).

%% dispel_glamour
% Action: dispel_glamour
% Use veil sight or cold iron to see through a fae illusion
% Type: magic / perception

action(dispel_glamour, 'dispel_glamour', magic, 15).
action_difficulty(dispel_glamour, 0.5).
action_duration(dispel_glamour, 1).
action_category(dispel_glamour, perception).
action_verb(dispel_glamour, past, 'dispelled glamour on').
action_verb(dispel_glamour, present, 'dispels glamour on').
action_target_type(dispel_glamour, other).
action_requires_target(dispel_glamour).
action_range(dispel_glamour, 5).
action_prerequisite(dispel_glamour, (has_item(Actor, veil_sight_potion))).
action_effect(dispel_glamour, (retract(glamoured(Target)))).
can_perform(Actor, dispel_glamour, Target) :-
    near(Actor, Target, 5), glamoured(Target).

%% brew_potion
% Action: brew_potion
% Create an alchemical preparation at an apothecary
% Type: crafting / alchemy

action(brew_potion, 'brew_potion', crafting, 20).
action_difficulty(brew_potion, 0.6).
action_duration(brew_potion, 3).
action_category(brew_potion, alchemy).
action_verb(brew_potion, past, 'brewed a potion').
action_verb(brew_potion, present, 'brews a potion').
action_target_type(brew_potion, none).
action_prerequisite(brew_potion, (at_location(Actor, apothecary))).
action_effect(brew_potion, (assert(has_item(Actor, potion)))).
can_perform(Actor, brew_potion, _) :-
    at_location(Actor, apothecary).

%% investigate_scene
% Action: investigate_scene
% Search a location for supernatural clues and evidence
% Type: investigation / detection

action(investigate_scene, 'investigate_scene', investigation, 15).
action_difficulty(investigate_scene, 0.4).
action_duration(investigate_scene, 2).
action_category(investigate_scene, detection).
action_verb(investigate_scene, past, 'investigated').
action_verb(investigate_scene, present, 'investigates').
action_target_type(investigate_scene, location).
action_prerequisite(investigate_scene, true).
action_effect(investigate_scene, (assert(investigated(Actor, Location)))).
can_perform(Actor, investigate_scene, Location) :-
    at_location(Actor, Location).

%% ward_location
% Action: ward_location
% Place protective wards around a building or area
% Type: magic / warding

action(ward_location, 'ward_location', magic, 25).
action_difficulty(ward_location, 0.7).
action_duration(ward_location, 4).
action_category(ward_location, warding).
action_verb(ward_location, past, 'warded').
action_verb(ward_location, present, 'wards').
action_target_type(ward_location, location).
action_prerequisite(ward_location, (has_item(Actor, protection_ward))).
action_effect(ward_location, (assert(warded(Location)))).
can_perform(Actor, ward_location, Location) :-
    at_location(Actor, Location), has_item(Actor, protection_ward).

%% shift_form
% Action: shift_form
% Werewolf transforms between human and wolf form
% Type: supernatural / transformation

action(shift_form, 'shift_form', supernatural, 30).
action_difficulty(shift_form, 0.5).
action_duration(shift_form, 1).
action_category(shift_form, transformation).
action_verb(shift_form, past, 'shifted form').
action_verb(shift_form, present, 'shifts form').
action_target_type(shift_form, self).
action_prerequisite(shift_form, (species(Actor, werewolf))).
action_effect(shift_form, (assert(wolf_form(Actor)))).
can_perform(Actor, shift_form, _) :-
    species(Actor, werewolf).

%% feed_vampire
% Action: feed_vampire
% Vampire consumes blood from an ethical source
% Type: supernatural / sustenance

action(feed_vampire, 'feed_vampire', supernatural, 10).
action_difficulty(feed_vampire, 0.2).
action_duration(feed_vampire, 1).
action_category(feed_vampire, sustenance).
action_verb(feed_vampire, past, 'fed').
action_verb(feed_vampire, present, 'feeds').
action_target_type(feed_vampire, none).
action_prerequisite(feed_vampire, (species(Actor, vampire), has_item(Actor, blood_vial))).
action_effect(feed_vampire, (retract(has_item(Actor, blood_vial)), assert(fed(Actor)))).
can_perform(Actor, feed_vampire, _) :-
    species(Actor, vampire), has_item(Actor, blood_vial).

%% sense_supernatural
% Action: sense_supernatural
% Detect nearby supernatural beings or magical effects
% Type: perception / detection

action(sense_supernatural, 'sense_supernatural', perception, 10).
action_difficulty(sense_supernatural, 0.3).
action_duration(sense_supernatural, 1).
action_category(sense_supernatural, detection).
action_verb(sense_supernatural, past, 'sensed supernatural presence').
action_verb(sense_supernatural, present, 'senses supernatural presence').
action_target_type(sense_supernatural, area).
action_range(sense_supernatural, 20).
action_prerequisite(sense_supernatural, true).
action_effect(sense_supernatural, (assert(sensed_area(Actor, Location)))).
can_perform(Actor, sense_supernatural, _) :-
    (species(Actor, Sp), Sp \= human) ; has_item(Actor, moonstone_pendant).

%% trade_underreach
% Action: trade_underreach
% Buy or sell supernatural goods at the Waystation market
% Type: commerce / black_market

action(trade_underreach, 'trade_underreach', commerce, 5).
action_difficulty(trade_underreach, 0.4).
action_duration(trade_underreach, 2).
action_category(trade_underreach, black_market).
action_verb(trade_underreach, past, 'traded at the Waystation').
action_verb(trade_underreach, present, 'trades at the Waystation').
action_target_type(trade_underreach, none).
action_prerequisite(trade_underreach, (at_location(Actor, waystation), has_item(Actor, underreach_token))).
action_effect(trade_underreach, (assert(traded(Actor, waystation)))).
can_perform(Actor, trade_underreach, _) :-
    at_location(Actor, waystation), has_item(Actor, underreach_token).

%% patrol_territory
% Action: patrol_territory
% Werewolf patrols their packs territory for intruders
% Type: faction / territorial

action(patrol_territory, 'patrol_territory', faction, 15).
action_difficulty(patrol_territory, 0.3).
action_duration(patrol_territory, 3).
action_category(patrol_territory, territorial).
action_verb(patrol_territory, past, 'patrolled territory').
action_verb(patrol_territory, present, 'patrols territory').
action_target_type(patrol_territory, area).
action_prerequisite(patrol_territory, (faction(Actor, docklands_pack))).
action_effect(patrol_territory, (assert(patrolled(Actor, docklands)))).
can_perform(Actor, patrol_territory, _) :-
    faction(Actor, docklands_pack).

%% invoke_threshold
% Action: invoke_threshold
% Strengthen a buildings magical threshold to bar entry
% Type: magic / warding

action(invoke_threshold, 'invoke_threshold', magic, 20).
action_difficulty(invoke_threshold, 0.5).
action_duration(invoke_threshold, 2).
action_category(invoke_threshold, warding).
action_verb(invoke_threshold, past, 'invoked threshold').
action_verb(invoke_threshold, present, 'invokes threshold').
action_target_type(invoke_threshold, location).
action_prerequisite(invoke_threshold, (at_location(Actor, Building), is_residence(Building))).
action_effect(invoke_threshold, (assert(threshold_active(Building)))).
can_perform(Actor, invoke_threshold, Building) :-
    at_location(Actor, Building), is_residence(Building).

%% read_aura
% Action: read_aura
% Sense the emotional and magical state of another being
% Type: perception / empathy

action(read_aura, 'read_aura', perception, 10).
action_difficulty(read_aura, 0.4).
action_duration(read_aura, 1).
action_category(read_aura, empathy).
action_verb(read_aura, past, 'read the aura of').
action_verb(read_aura, present, 'reads the aura of').
action_target_type(read_aura, other).
action_requires_target(read_aura).
action_range(read_aura, 5).
action_prerequisite(read_aura, (near(Actor, Target, 5))).
action_effect(read_aura, (assert(aura_read(Actor, Target)))).
can_perform(Actor, read_aura, Target) :-
    near(Actor, Target, 5),
    (species(Actor, fae) ; occupation(Actor, fortune_teller)).
