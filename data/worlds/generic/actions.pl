%% Insimul Actions: Generic Fantasy World
%% Source: data/worlds/generic/actions.pl
%% Created: 2026-04-03
%% Total: 12 actions

%% forge_weapon
% Action: forge_weapon
% Craft a weapon at the smithy
% Type: craft / craft

action(forge_weapon, 'forge_weapon', craft, 30).
action_difficulty(forge_weapon, 0.6).
action_duration(forge_weapon, 4).
action_category(forge_weapon, craft).
action_verb(forge_weapon, past, 'forged a weapon').
action_verb(forge_weapon, present, 'forges a weapon').
action_target_type(forge_weapon, self).
action_prerequisite(forge_weapon, (at_location(Actor, smithy))).
action_effect(forge_weapon, (add_item(Actor, weapon))).
can_perform(Actor, forge_weapon, _) :-
    at_location(Actor, smithy), trait(Actor, hardworking).

%% gather_herbs
% Action: gather_herbs
% Collect medicinal herbs from the wilderness
% Type: gather / survival

action(gather_herbs, 'gather_herbs', survival, 10).
action_difficulty(gather_herbs, 0.3).
action_duration(gather_herbs, 2).
action_category(gather_herbs, survival).
action_verb(gather_herbs, past, 'gathered herbs').
action_verb(gather_herbs, present, 'gathers herbs').
action_target_type(gather_herbs, self).
action_prerequisite(gather_herbs, (at_location(Actor, wilderness))).
action_effect(gather_herbs, (add_item(Actor, herbs))).
can_perform(Actor, gather_herbs, _) :-
    at_location(Actor, wilderness).

%% barter_goods
% Action: barter_goods
% Exchange goods with another character at the market
% Type: social / commerce

action(barter_goods, 'barter_goods', commerce, 5).
action_difficulty(barter_goods, 0.4).
action_duration(barter_goods, 1).
action_category(barter_goods, commerce).
action_verb(barter_goods, past, 'bartered goods with').
action_verb(barter_goods, present, 'barters goods with').
action_target_type(barter_goods, other).
action_requires_target(barter_goods).
action_range(barter_goods, 5).
action_prerequisite(barter_goods, (near(Actor, Target, 5))).
action_effect(barter_goods, (modify_relationship(Actor, Target, trust, 1))).
can_perform(Actor, barter_goods, Target) :-
    near(Actor, Target, 5).

%% patrol_roads
% Action: patrol_roads
% Walk the roads to keep them safe from bandits
% Type: duty / combat

action(patrol_roads, 'patrol_roads', combat, 15).
action_difficulty(patrol_roads, 0.5).
action_duration(patrol_roads, 3).
action_category(patrol_roads, combat).
action_verb(patrol_roads, past, 'patrolled the roads').
action_verb(patrol_roads, present, 'patrols the roads').
action_target_type(patrol_roads, self).
action_prerequisite(patrol_roads, (trait(Actor, courageous))).
action_effect(patrol_roads, (assert(status(Actor, on_patrol)))).
can_perform(Actor, patrol_roads, _) :-
    trait(Actor, courageous).

%% brew_potion
% Action: brew_potion
% Create a healing or utility potion
% Type: craft / alchemy

action(brew_potion, 'brew_potion', craft, 20).
action_difficulty(brew_potion, 0.7).
action_duration(brew_potion, 3).
action_category(brew_potion, craft).
action_verb(brew_potion, past, 'brewed a potion').
action_verb(brew_potion, present, 'brews a potion').
action_target_type(brew_potion, self).
action_prerequisite(brew_potion, (has_item(Actor, herbs))).
action_effect(brew_potion, (remove_item(Actor, herbs), add_item(Actor, potion))).
can_perform(Actor, brew_potion, _) :-
    has_item(Actor, herbs), trait(Actor, wise).

%% tell_story
% Action: tell_story
% Share a tale or legend with an audience at the tavern
% Type: social / entertainment

action(tell_story, 'tell_story', social, 5).
action_difficulty(tell_story, 0.3).
action_duration(tell_story, 2).
action_category(tell_story, social).
action_verb(tell_story, past, 'told a story to').
action_verb(tell_story, present, 'tells a story to').
action_target_type(tell_story, other).
action_requires_target(tell_story).
action_range(tell_story, 10).
action_prerequisite(tell_story, (at_location(Actor, tavern))).
action_effect(tell_story, (modify_relationship(Actor, Target, friendship, 2))).
can_perform(Actor, tell_story, Target) :-
    at_location(Actor, tavern), near(Actor, Target, 10).

%% pray_at_temple
% Action: pray_at_temple
% Offer prayers at the local temple for guidance or blessing
% Type: spiritual / faith

action(pray_at_temple, 'pray_at_temple', faith, 5).
action_difficulty(pray_at_temple, 0.1).
action_duration(pray_at_temple, 1).
action_category(pray_at_temple, faith).
action_verb(pray_at_temple, past, 'prayed at the temple').
action_verb(pray_at_temple, present, 'prays at the temple').
action_target_type(pray_at_temple, self).
action_prerequisite(pray_at_temple, (at_location(Actor, temple))).
action_effect(pray_at_temple, (assert(status(Actor, blessed)))).
can_perform(Actor, pray_at_temple, _) :-
    at_location(Actor, temple).

%% train_combat
% Action: train_combat
% Practice combat skills with a sparring partner
% Type: combat / training

action(train_combat, 'train_combat', combat, 20).
action_difficulty(train_combat, 0.5).
action_duration(train_combat, 2).
action_category(train_combat, combat).
action_verb(train_combat, past, 'trained with').
action_verb(train_combat, present, 'trains with').
action_target_type(train_combat, other).
action_requires_target(train_combat).
action_range(train_combat, 3).
action_prerequisite(train_combat, (near(Actor, Target, 3))).
action_effect(train_combat, (modify_attribute(Actor, strength, 1))).
can_perform(Actor, train_combat, Target) :-
    near(Actor, Target, 3).

%% tend_farm
% Action: tend_farm
% Work the fields to grow crops
% Type: labor / agriculture

action(tend_farm, 'tend_farm', labor, 15).
action_difficulty(tend_farm, 0.3).
action_duration(tend_farm, 4).
action_category(tend_farm, labor).
action_verb(tend_farm, past, 'tended the farm').
action_verb(tend_farm, present, 'tends the farm').
action_target_type(tend_farm, self).
action_prerequisite(tend_farm, (at_location(Actor, farm))).
action_effect(tend_farm, (add_item(Actor, crops))).
can_perform(Actor, tend_farm, _) :-
    at_location(Actor, farm).

%% pick_lock
% Action: pick_lock
% Attempt to open a locked door or chest
% Type: stealth / thievery

action(pick_lock, 'pick_lock', stealth, 10).
action_difficulty(pick_lock, 0.8).
action_duration(pick_lock, 1).
action_category(pick_lock, stealth).
action_verb(pick_lock, past, 'picked a lock').
action_verb(pick_lock, present, 'picks a lock').
action_target_type(pick_lock, self).
action_prerequisite(pick_lock, (has_item(Actor, lockpick))).
action_effect(pick_lock, (assert(status(Actor, trespassing)))).
can_perform(Actor, pick_lock, _) :-
    has_item(Actor, lockpick), trait(Actor, mischievous).

%% heal_wound
% Action: heal_wound
% Treat an injured character with herbs and bandages
% Type: support / healing

action(heal_wound, 'heal_wound', support, 10).
action_difficulty(heal_wound, 0.5).
action_duration(heal_wound, 2).
action_category(heal_wound, support).
action_verb(heal_wound, past, 'healed').
action_verb(heal_wound, present, 'heals').
action_target_type(heal_wound, other).
action_requires_target(heal_wound).
action_range(heal_wound, 3).
action_prerequisite(heal_wound, (has_item(Actor, herbs), status(Target, wounded))).
action_effect(heal_wound, (retract(status(Target, wounded)), assert(status(Target, recovering)))).
can_perform(Actor, heal_wound, Target) :-
    has_item(Actor, herbs), status(Target, wounded), near(Actor, Target, 3).

%% stand_guard
% Action: stand_guard
% Keep watch over a location through the night
% Type: duty / defense

action(stand_guard, 'stand_guard', combat, 10).
action_difficulty(stand_guard, 0.3).
action_duration(stand_guard, 6).
action_category(stand_guard, combat).
action_verb(stand_guard, past, 'stood guard').
action_verb(stand_guard, present, 'stands guard').
action_target_type(stand_guard, self).
action_prerequisite(stand_guard, (trait(Actor, disciplined))).
action_effect(stand_guard, (assert(status(Actor, on_watch)))).
can_perform(Actor, stand_guard, _) :-
    trait(Actor, disciplined).
