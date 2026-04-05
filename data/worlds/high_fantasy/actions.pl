%% Insimul Actions: High Fantasy
%% Source: data/worlds/high_fantasy/actions.pl
%% Created: 2026-04-03
%% Total: 12 actions

%% cast_spell
% Action: cast_spell
% Channel arcane energy to produce a magical effect
% Type: magic / arcane

action(cast_spell, 'cast_spell', arcane, 25).
action_difficulty(cast_spell, 0.7).
action_duration(cast_spell, 2).
action_category(cast_spell, arcane).
action_verb(cast_spell, past, 'cast a spell on').
action_verb(cast_spell, present, 'casts a spell on').
action_target_type(cast_spell, other).
action_requires_target(cast_spell).
action_range(cast_spell, 15).
action_prerequisite(cast_spell, (occupation(Actor, Occ), (Occ = wizard ; Occ = archmage ; Occ = enchantress))).
action_effect(cast_spell, (assert(status(Target, enchanted)))).
can_perform(Actor, cast_spell, Target) :-
    (occupation(Actor, wizard) ; occupation(Actor, archmage) ; occupation(Actor, enchantress)),
    near(Actor, Target, 15).

%% forge_rune_weapon
% Action: forge_rune_weapon
% Inscribe magical runes into a weapon at the dwarven forge
% Type: craft / enchanting

action(forge_rune_weapon, 'forge_rune_weapon', craft, 40).
action_difficulty(forge_rune_weapon, 0.9).
action_duration(forge_rune_weapon, 6).
action_category(forge_rune_weapon, craft).
action_verb(forge_rune_weapon, past, 'forged a rune weapon').
action_verb(forge_rune_weapon, present, 'forges a rune weapon').
action_target_type(forge_rune_weapon, self).
action_prerequisite(forge_rune_weapon, (race(Actor, dwarf), at_location(Actor, forge))).
action_effect(forge_rune_weapon, (add_item(Actor, rune_weapon))).
can_perform(Actor, forge_rune_weapon, _) :-
    race(Actor, dwarf), at_location(Actor, forge).

%% commune_with_nature
% Action: commune_with_nature
% Enter a trance to communicate with the spirits of the forest
% Type: magic / druidic

action(commune_with_nature, 'commune_with_nature', druidic, 15).
action_difficulty(commune_with_nature, 0.5).
action_duration(commune_with_nature, 3).
action_category(commune_with_nature, druidic).
action_verb(commune_with_nature, past, 'communed with nature').
action_verb(commune_with_nature, present, 'communes with nature').
action_target_type(commune_with_nature, self).
action_prerequisite(commune_with_nature, (occupation(Actor, druid))).
action_effect(commune_with_nature, (assert(status(Actor, nature_attuned)))).
can_perform(Actor, commune_with_nature, _) :-
    occupation(Actor, druid), at_location(Actor, forest).

%% scout_frontier
% Action: scout_frontier
% Patrol the wilderness border for threats and signs of danger
% Type: exploration / military

action(scout_frontier, 'scout_frontier', exploration, 15).
action_difficulty(scout_frontier, 0.5).
action_duration(scout_frontier, 4).
action_category(scout_frontier, exploration).
action_verb(scout_frontier, past, 'scouted the frontier').
action_verb(scout_frontier, present, 'scouts the frontier').
action_target_type(scout_frontier, self).
action_prerequisite(scout_frontier, (occupation(Actor, ranger))).
action_effect(scout_frontier, (assert(status(Actor, scouting)))).
can_perform(Actor, scout_frontier, _) :-
    occupation(Actor, ranger).

%% negotiate_alliance
% Action: negotiate_alliance
% Attempt to forge a diplomatic alliance between factions
% Type: social / diplomacy

action(negotiate_alliance, 'negotiate_alliance', diplomacy, 10).
action_difficulty(negotiate_alliance, 0.8).
action_duration(negotiate_alliance, 3).
action_category(negotiate_alliance, diplomacy).
action_verb(negotiate_alliance, past, 'negotiated an alliance with').
action_verb(negotiate_alliance, present, 'negotiates an alliance with').
action_target_type(negotiate_alliance, other).
action_requires_target(negotiate_alliance).
action_range(negotiate_alliance, 5).
action_prerequisite(negotiate_alliance, (near(Actor, Target, 5))).
action_effect(negotiate_alliance, (modify_relationship(Actor, Target, trust, 3))).
can_perform(Actor, negotiate_alliance, Target) :-
    near(Actor, Target, 5),
    (occupation(Actor, king) ; occupation(Actor, queen) ; occupation(Actor, lord)).

%% enchant_item
% Action: enchant_item
% Imbue an item with magical properties
% Type: craft / enchanting

action(enchant_item, 'enchant_item', craft, 30).
action_difficulty(enchant_item, 0.8).
action_duration(enchant_item, 4).
action_category(enchant_item, craft).
action_verb(enchant_item, past, 'enchanted an item').
action_verb(enchant_item, present, 'enchants an item').
action_target_type(enchant_item, self).
action_prerequisite(enchant_item, (occupation(Actor, enchantress), has_item(Actor, gem))).
action_effect(enchant_item, (remove_item(Actor, gem), add_item(Actor, enchanted_item))).
can_perform(Actor, enchant_item, _) :-
    occupation(Actor, enchantress), has_item(Actor, gem).

%% mine_mithril
% Action: mine_mithril
% Extract mithril ore from the deep mines
% Type: labor / mining

action(mine_mithril, 'mine_mithril', labor, 30).
action_difficulty(mine_mithril, 0.7).
action_duration(mine_mithril, 5).
action_category(mine_mithril, labor).
action_verb(mine_mithril, past, 'mined mithril').
action_verb(mine_mithril, present, 'mines mithril').
action_target_type(mine_mithril, self).
action_prerequisite(mine_mithril, (race(Actor, dwarf), at_location(Actor, deep_mines))).
action_effect(mine_mithril, (add_item(Actor, mithril_ore))).
can_perform(Actor, mine_mithril, _) :-
    race(Actor, dwarf), at_location(Actor, deep_mines).

%% train_squire
% Action: train_squire
% Instruct a young warrior in the arts of combat and chivalry
% Type: social / training

action(train_squire, 'train_squire', social, 15).
action_difficulty(train_squire, 0.5).
action_duration(train_squire, 3).
action_category(train_squire, social).
action_verb(train_squire, past, 'trained').
action_verb(train_squire, present, 'trains').
action_target_type(train_squire, other).
action_requires_target(train_squire).
action_range(train_squire, 3).
action_prerequisite(train_squire, (near(Actor, Target, 3), occupation(Target, squire))).
action_effect(train_squire, (modify_attribute(Target, strength, 2), modify_relationship(Actor, Target, trust, 2))).
can_perform(Actor, train_squire, Target) :-
    near(Actor, Target, 3), occupation(Target, squire).

%% brew_elven_draught
% Action: brew_elven_draught
% Prepare a restorative elven potion from rare herbs
% Type: craft / alchemy

action(brew_elven_draught, 'brew_elven_draught', craft, 20).
action_difficulty(brew_elven_draught, 0.6).
action_duration(brew_elven_draught, 3).
action_category(brew_elven_draught, craft).
action_verb(brew_elven_draught, past, 'brewed an elven draught').
action_verb(brew_elven_draught, present, 'brews an elven draught').
action_target_type(brew_elven_draught, self).
action_prerequisite(brew_elven_draught, (race(Actor, elf), has_item(Actor, starleaf))).
action_effect(brew_elven_draught, (remove_item(Actor, starleaf), add_item(Actor, elven_draught))).
can_perform(Actor, brew_elven_draught, _) :-
    race(Actor, elf), has_item(Actor, starleaf).

%% post_quest
% Action: post_quest
% Post a quest on the adventurers guild board
% Type: social / management

action(post_quest, 'post_quest', social, 5).
action_difficulty(post_quest, 0.2).
action_duration(post_quest, 1).
action_category(post_quest, social).
action_verb(post_quest, past, 'posted a quest').
action_verb(post_quest, present, 'posts a quest').
action_target_type(post_quest, self).
action_prerequisite(post_quest, (occupation(Actor, guild_master))).
action_effect(post_quest, (assert(status(guild_board, quest_available)))).
can_perform(Actor, post_quest, _) :-
    occupation(Actor, guild_master).

%% summon_ward
% Action: summon_ward
% Create a protective magical barrier around a location
% Type: magic / defense

action(summon_ward, 'summon_ward', arcane, 20).
action_difficulty(summon_ward, 0.6).
action_duration(summon_ward, 2).
action_category(summon_ward, arcane).
action_verb(summon_ward, past, 'summoned a ward').
action_verb(summon_ward, present, 'summons a ward').
action_target_type(summon_ward, self).
action_prerequisite(summon_ward, ((occupation(Actor, wizard) ; occupation(Actor, archmage)))).
action_effect(summon_ward, (assert(status(Actor, warded)))).
can_perform(Actor, summon_ward, _) :-
    (occupation(Actor, wizard) ; occupation(Actor, archmage)).

%% trade_gems
% Action: trade_gems
% Negotiate the sale of precious gems and minerals
% Type: commerce / trade

action(trade_gems, 'trade_gems', commerce, 5).
action_difficulty(trade_gems, 0.4).
action_duration(trade_gems, 1).
action_category(trade_gems, commerce).
action_verb(trade_gems, past, 'traded gems with').
action_verb(trade_gems, present, 'trades gems with').
action_target_type(trade_gems, other).
action_requires_target(trade_gems).
action_range(trade_gems, 5).
action_prerequisite(trade_gems, (has_item(Actor, gem), near(Actor, Target, 5))).
action_effect(trade_gems, (remove_item(Actor, gem), add_gold(Actor, 50), modify_relationship(Actor, Target, trust, 1))).
can_perform(Actor, trade_gems, Target) :-
    has_item(Actor, gem), near(Actor, Target, 5).
