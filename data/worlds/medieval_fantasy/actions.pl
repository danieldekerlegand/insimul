%% Insimul Actions: Medieval Fantasy
%% Source: data/worlds/medieval_fantasy/actions.pl
%% Created: 2026-04-03
%% Total: 12 actions
%%
%% Predicate schema follows base_actions.pl format

%% forge_weapon -- Smith a weapon at a forge
action(forge_weapon, 'forge_weapon', crafting, 5).
action_difficulty(forge_weapon, 0.4).
action_duration(forge_weapon, 3).
action_category(forge_weapon, crafting).
action_verb(forge_weapon, past, 'forged').
action_verb(forge_weapon, present, 'forges').
action_target_type(forge_weapon, self).
action_range(forge_weapon, 3).
action_prerequisite(forge_weapon, (at_location(Actor, smithy))).
action_effect(forge_weapon, (assert(has_item(Actor, forged_weapon, 1)))).
can_perform(Actor, forge_weapon, _Target) :-
    at_location(Actor, smithy).

%% brew_potion -- Create a potion from gathered ingredients
action(brew_potion, 'brew_potion', crafting, 3).
action_difficulty(brew_potion, 0.5).
action_duration(brew_potion, 2).
action_category(brew_potion, alchemy).
action_verb(brew_potion, past, 'brewed').
action_verb(brew_potion, present, 'brews').
action_target_type(brew_potion, self).
action_range(brew_potion, 3).
action_prerequisite(brew_potion, (at_location(Actor, apothecary))).
action_prerequisite(brew_potion, (has_item(Actor, herb, _))).
action_effect(brew_potion, (assert(has_item(Actor, potion, 1)))).
can_perform(Actor, brew_potion, _Target) :-
    at_location(Actor, apothecary),
    has_item(Actor, herb, _).

%% pray_at_cathedral -- Seek divine blessing at the Cathedral of Light
action(pray_at_cathedral, 'pray_at_cathedral', spiritual, 0).
action_difficulty(pray_at_cathedral, 0.1).
action_duration(pray_at_cathedral, 2).
action_category(pray_at_cathedral, faith).
action_verb(pray_at_cathedral, past, 'prayed').
action_verb(pray_at_cathedral, present, 'prays').
action_target_type(pray_at_cathedral, self).
action_range(pray_at_cathedral, 5).
action_prerequisite(pray_at_cathedral, (at_location(Actor, cathedral))).
action_effect(pray_at_cathedral, (assert(status(Actor, blessed)))).
can_perform(Actor, pray_at_cathedral, _Target) :-
    at_location(Actor, cathedral).

%% challenge_to_duel -- Issue a formal challenge to another character
action(challenge_to_duel, 'challenge_to_duel', social, 5).
action_difficulty(challenge_to_duel, 0.6).
action_duration(challenge_to_duel, 1).
action_category(challenge_to_duel, combat).
action_verb(challenge_to_duel, past, 'challenged').
action_verb(challenge_to_duel, present, 'challenges').
action_target_type(challenge_to_duel, other).
action_requires_target(challenge_to_duel).
action_range(challenge_to_duel, 10).
action_prerequisite(challenge_to_duel, (near(Actor, Target, 10))).
action_effect(challenge_to_duel, (assert(status(Actor, dueling)))).
action_effect(challenge_to_duel, (assert(status(Target, dueling)))).
can_perform(Actor, challenge_to_duel, Target) :-
    near(Actor, Target, 10).

%% gather_herbs -- Collect herbs from the forest
action(gather_herbs, 'gather_herbs', gathering, 2).
action_difficulty(gather_herbs, 0.2).
action_duration(gather_herbs, 2).
action_category(gather_herbs, nature).
action_verb(gather_herbs, past, 'gathered herbs').
action_verb(gather_herbs, present, 'gathers herbs').
action_target_type(gather_herbs, self).
action_range(gather_herbs, 5).
action_prerequisite(gather_herbs, (at_location(Actor, forest))).
action_effect(gather_herbs, (assert(has_item(Actor, herb, 1)))).
can_perform(Actor, gather_herbs, _Target) :-
    at_location(Actor, forest).

%% mine_ore -- Extract ore from the Silverdeep shafts
action(mine_ore, 'mine_ore', gathering, 3).
action_difficulty(mine_ore, 0.3).
action_duration(mine_ore, 3).
action_category(mine_ore, mining).
action_verb(mine_ore, past, 'mined').
action_verb(mine_ore, present, 'mines').
action_target_type(mine_ore, self).
action_range(mine_ore, 3).
action_prerequisite(mine_ore, (at_location(Actor, mine))).
action_effect(mine_ore, (assert(has_item(Actor, silver_ore, 1)))).
can_perform(Actor, mine_ore, _Target) :-
    at_location(Actor, mine).

%% sneak -- Move through an area undetected
action(sneak, 'sneak', stealth, 2).
action_difficulty(sneak, 0.4).
action_duration(sneak, 1).
action_category(sneak, stealth).
action_verb(sneak, past, 'snuck past').
action_verb(sneak, present, 'sneaks past').
action_target_type(sneak, self).
action_range(sneak, 5).
action_prerequisite(sneak, (attribute(Actor, cunningness, C), C > 40)).
action_effect(sneak, (assert(status(Actor, hidden)))).
can_perform(Actor, sneak, _Target) :-
    attribute(Actor, cunningness, C), C > 40.

%% petition_the_king -- Request an audience with King Aldric
action(petition_the_king, 'petition_the_king', social, 3).
action_difficulty(petition_the_king, 0.3).
action_duration(petition_the_king, 2).
action_category(petition_the_king, politics).
action_verb(petition_the_king, past, 'petitioned').
action_verb(petition_the_king, present, 'petitions').
action_target_type(petition_the_king, other).
action_requires_target(petition_the_king).
action_range(petition_the_king, 10).
action_prerequisite(petition_the_king, (at_location(Actor, castle))).
action_effect(petition_the_king, (assert(event(Actor, audience_granted)))).
can_perform(Actor, petition_the_king, _Target) :-
    at_location(Actor, castle).

%% pick_lock -- Attempt to open a locked door or chest
action(pick_lock, 'pick_lock', stealth, 3).
action_difficulty(pick_lock, 0.5).
action_duration(pick_lock, 1).
action_category(pick_lock, thievery).
action_verb(pick_lock, past, 'picked the lock').
action_verb(pick_lock, present, 'picks the lock').
action_target_type(pick_lock, self).
action_range(pick_lock, 2).
action_prerequisite(pick_lock, (attribute(Actor, cunningness, C), C > 50)).
action_effect(pick_lock, (assert(event(Actor, lock_opened)))).
can_perform(Actor, pick_lock, _Target) :-
    attribute(Actor, cunningness, C), C > 50.

%% enchant_item -- Apply a magical enchantment to an item
action(enchant_item, 'enchant_item', crafting, 8).
action_difficulty(enchant_item, 0.7).
action_duration(enchant_item, 4).
action_category(enchant_item, magic).
action_verb(enchant_item, past, 'enchanted').
action_verb(enchant_item, present, 'enchants').
action_target_type(enchant_item, self).
action_range(enchant_item, 3).
action_prerequisite(enchant_item, (attribute(Actor, cultural_knowledge, CK), CK > 70)).
action_effect(enchant_item, (assert(event(Actor, item_enchanted)))).
can_perform(Actor, enchant_item, _Target) :-
    attribute(Actor, cultural_knowledge, CK), CK > 70.

%% rest_at_inn -- Rest and recover at a village inn
action(rest_at_inn, 'rest_at_inn', recovery, 2).
action_difficulty(rest_at_inn, 0.1).
action_duration(rest_at_inn, 4).
action_category(rest_at_inn, rest).
action_verb(rest_at_inn, past, 'rested').
action_verb(rest_at_inn, present, 'rests').
action_target_type(rest_at_inn, self).
action_range(rest_at_inn, 5).
action_prerequisite(rest_at_inn, (at_location(Actor, inn))).
action_prerequisite(rest_at_inn, (gold(Actor, G), G >= 2)).
action_effect(rest_at_inn, (assert(status(Actor, rested)))).
action_effect(rest_at_inn, (modify_gold(Actor, -2))).
can_perform(Actor, rest_at_inn, _Target) :-
    at_location(Actor, inn),
    gold(Actor, G), G >= 2.

%% scout_area -- Survey the surrounding area for threats or resources
action(scout_area, 'scout_area', exploration, 2).
action_difficulty(scout_area, 0.3).
action_duration(scout_area, 2).
action_category(scout_area, reconnaissance).
action_verb(scout_area, past, 'scouted').
action_verb(scout_area, present, 'scouts').
action_target_type(scout_area, self).
action_range(scout_area, 20).
action_prerequisite(scout_area, (attribute(Actor, self_assuredness, SA), SA > 30)).
action_effect(scout_area, (assert(event(Actor, area_scouted)))).
can_perform(Actor, scout_area, _Target) :-
    attribute(Actor, self_assuredness, SA), SA > 30.
