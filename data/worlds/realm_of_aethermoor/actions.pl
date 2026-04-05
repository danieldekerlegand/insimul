%% Insimul Actions: Realm of Aethermoor
%% Source: data/worlds/realm_of_aethermoor/actions.pl
%% Created: 2026-04-03
%% Total: 12 actions
%%
%% Predicate schema:
%%   action/4 -- action(AtomId, Name, Category, EnergyCost)
%%   action_difficulty/2, action_duration/2, action_category/2
%%   action_verb/3, action_target_type/2
%%   action_requires_target/1, action_range/2
%%   action_prerequisite/2, action_effect/2, can_perform/3

%% cast_spell
%% Channel aether energy to cast a spell through a focus crystal
action(cast_spell, 'cast_spell', magic, 3).
action_difficulty(cast_spell, 0.5).
action_duration(cast_spell, 2).
action_category(cast_spell, magic).
action_verb(cast_spell, past, 'cast a spell').
action_verb(cast_spell, present, 'casts a spell').
action_target_type(cast_spell, other).
action_requires_target(cast_spell).
action_range(cast_spell, 10).
action_prerequisite(cast_spell, (attribute(Actor, magical_affinity, Mag), Mag > 30, has_item(Actor, focus_crystal))).
action_effect(cast_spell, (assert(spell_cast(Actor, Target)))).
can_perform(Actor, cast_spell, Target) :-
    attribute(Actor, magical_affinity, Mag), Mag > 30,
    has_item(Actor, focus_crystal),
    near(Actor, Target, 10).

%% draw_aether
%% Draw raw magical energy from an Aether Well
action(draw_aether, 'draw_aether', magic, 2).
action_difficulty(draw_aether, 0.3).
action_duration(draw_aether, 3).
action_category(draw_aether, magic).
action_verb(draw_aether, past, 'drew aether energy').
action_verb(draw_aether, present, 'draws aether energy').
action_target_type(draw_aether, location).
action_range(draw_aether, 3).
action_prerequisite(draw_aether, (at_location(Actor, Loc), building(Loc, civic, aether_well))).
action_effect(draw_aether, (assert(aether_charged(Actor)))).
can_perform(Actor, draw_aether, _Target) :-
    at_location(Actor, Loc),
    building(Loc, civic, aether_well).

%% forge_weapon
%% Craft a weapon at a smithy using metal and aether
action(forge_weapon, 'forge_weapon', crafting, 4).
action_difficulty(forge_weapon, 0.6).
action_duration(forge_weapon, 5).
action_category(forge_weapon, crafting).
action_verb(forge_weapon, past, 'forged a weapon').
action_verb(forge_weapon, present, 'forges a weapon').
action_target_type(forge_weapon, object).
action_range(forge_weapon, 2).
action_prerequisite(forge_weapon, (attribute(Actor, craftsmanship, Craft), Craft > 40, at_location(Actor, Loc), building(Loc, business, smithy))).
action_effect(forge_weapon, (assert(weapon_forged(Actor, Target)))).
can_perform(Actor, forge_weapon, _Target) :-
    attribute(Actor, craftsmanship, Craft), Craft > 40,
    at_location(Actor, Loc),
    building(Loc, business, smithy).

%% brew_potion
%% Brew a magical potion at an apothecary
action(brew_potion, 'brew_potion', crafting, 3).
action_difficulty(brew_potion, 0.4).
action_duration(brew_potion, 3).
action_category(brew_potion, crafting).
action_verb(brew_potion, past, 'brewed a potion').
action_verb(brew_potion, present, 'brews a potion').
action_target_type(brew_potion, object).
action_range(brew_potion, 2).
action_prerequisite(brew_potion, (at_location(Actor, Loc), building(Loc, business, apothecary))).
action_effect(brew_potion, (assert(has_item(Actor, healing_potion)))).
can_perform(Actor, brew_potion, _Target) :-
    at_location(Actor, Loc),
    building(Loc, business, apothecary).

%% enchant_item
%% Infuse an item with magical properties at an enchantment workshop
action(enchant_item, 'enchant_item', magic, 4).
action_difficulty(enchant_item, 0.7).
action_duration(enchant_item, 4).
action_category(enchant_item, magic).
action_verb(enchant_item, past, 'enchanted an item').
action_verb(enchant_item, present, 'enchants an item').
action_target_type(enchant_item, object).
action_requires_target(enchant_item).
action_range(enchant_item, 2).
action_prerequisite(enchant_item, (attribute(Actor, magical_affinity, Mag), Mag > 50, at_location(Actor, Loc), building(Loc, business, workshop))).
action_effect(enchant_item, (assert(enchanted(Target)))).
can_perform(Actor, enchant_item, Target) :-
    attribute(Actor, magical_affinity, Mag), Mag > 50,
    at_location(Actor, Loc),
    building(Loc, business, workshop).

%% read_grimoire
%% Study a grimoire to learn new spells or lore
action(read_grimoire, 'read_grimoire', knowledge, 2).
action_difficulty(read_grimoire, 0.4).
action_duration(read_grimoire, 3).
action_category(read_grimoire, knowledge).
action_verb(read_grimoire, past, 'read a grimoire').
action_verb(read_grimoire, present, 'reads a grimoire').
action_target_type(read_grimoire, object).
action_range(read_grimoire, 0).
action_prerequisite(read_grimoire, (has_item(Actor, grimoire_elemental))).
action_effect(read_grimoire, (assert(spell_learned(Actor, Target)))).
can_perform(Actor, read_grimoire, _Target) :-
    has_item(Actor, grimoire_elemental).

%% melee_attack
%% Engage in close-quarters combat with a melee weapon
action(melee_attack, 'melee_attack', combat, 2).
action_difficulty(melee_attack, 0.4).
action_duration(melee_attack, 1).
action_category(melee_attack, combat).
action_verb(melee_attack, past, 'attacked').
action_verb(melee_attack, present, 'attacks').
action_target_type(melee_attack, other).
action_requires_target(melee_attack).
action_range(melee_attack, 3).
action_prerequisite(melee_attack, (attribute(Actor, combat_skill, Combat), Combat > 20)).
action_effect(melee_attack, (assert(in_combat(Actor, Target)))).
can_perform(Actor, melee_attack, Target) :-
    attribute(Actor, combat_skill, Combat), Combat > 20,
    near(Actor, Target, 3).

%% ranged_attack
%% Fire a ranged weapon at a target
action(ranged_attack, 'ranged_attack', combat, 2).
action_difficulty(ranged_attack, 0.5).
action_duration(ranged_attack, 1).
action_category(ranged_attack, combat).
action_verb(ranged_attack, past, 'shot at').
action_verb(ranged_attack, present, 'shoots at').
action_target_type(ranged_attack, other).
action_requires_target(ranged_attack).
action_range(ranged_attack, 20).
action_prerequisite(ranged_attack, (has_item(Actor, elven_longbow))).
action_effect(ranged_attack, (assert(in_combat(Actor, Target)))).
can_perform(Actor, ranged_attack, Target) :-
    has_item(Actor, elven_longbow),
    near(Actor, Target, 20).

%% heal_target
%% Use divine or herbal magic to heal a wounded ally
action(heal_target, 'heal_target', magic, 3).
action_difficulty(heal_target, 0.4).
action_duration(heal_target, 2).
action_category(heal_target, magic).
action_verb(heal_target, past, 'healed').
action_verb(heal_target, present, 'heals').
action_target_type(heal_target, other).
action_requires_target(heal_target).
action_range(heal_target, 5).
action_prerequisite(heal_target, (attribute(Actor, empathy, Emp), Emp > 40)).
action_effect(heal_target, (retract(status(Target, wounded)), assert(status(Target, healthy)))).
can_perform(Actor, heal_target, Target) :-
    attribute(Actor, empathy, Emp), Emp > 40,
    near(Actor, Target, 5).

%% trade_goods
%% Exchange goods with a merchant or at a market stall
action(trade_goods, 'trade_goods', commerce, 1).
action_difficulty(trade_goods, 0.2).
action_duration(trade_goods, 2).
action_category(trade_goods, commerce).
action_verb(trade_goods, past, 'traded goods').
action_verb(trade_goods, present, 'trades goods').
action_target_type(trade_goods, other).
action_requires_target(trade_goods).
action_range(trade_goods, 5).
action_prerequisite(trade_goods, (near(Actor, Target, 5))).
action_effect(trade_goods, (assert(traded(Actor, Target)))).
can_perform(Actor, trade_goods, Target) :-
    near(Actor, Target, 5).

%% meditate_at_well
%% Meditate at an Aether Well to receive visions or restore energy
action(meditate_at_well, 'meditate_at_well', spiritual, 1).
action_difficulty(meditate_at_well, 0.2).
action_duration(meditate_at_well, 4).
action_category(meditate_at_well, spiritual).
action_verb(meditate_at_well, past, 'meditated at the well').
action_verb(meditate_at_well, present, 'meditates at the well').
action_target_type(meditate_at_well, none).
action_range(meditate_at_well, 3).
action_prerequisite(meditate_at_well, (at_location(Actor, Loc), building(Loc, civic, aether_well))).
action_effect(meditate_at_well, (assert(vision_received(Actor)))).
can_perform(Actor, meditate_at_well, _Target) :-
    at_location(Actor, Loc),
    building(Loc, civic, aether_well).

%% cut_gemstone
%% Cut and polish raw gems at a dwarven workshop
action(cut_gemstone, 'cut_gemstone', crafting, 2).
action_difficulty(cut_gemstone, 0.5).
action_duration(cut_gemstone, 3).
action_category(cut_gemstone, crafting).
action_verb(cut_gemstone, past, 'cut a gemstone').
action_verb(cut_gemstone, present, 'cuts a gemstone').
action_target_type(cut_gemstone, object).
action_range(cut_gemstone, 2).
action_prerequisite(cut_gemstone, (attribute(Actor, craftsmanship, Craft), Craft > 50, at_location(Actor, Loc), building(Loc, business, workshop))).
action_effect(cut_gemstone, (assert(has_item(Actor, ironpeak_gemstone)))).
can_perform(Actor, cut_gemstone, _Target) :-
    attribute(Actor, craftsmanship, Craft), Craft > 50,
    at_location(Actor, Loc),
    building(Loc, business, workshop).
