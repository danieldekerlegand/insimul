%% Insimul Actions: Dark Fantasy Cursed Lands
%% Source: data/worlds/dark_fantasy/actions.pl
%% Created: 2026-04-03
%% Total: 12 actions
%%
%% Format follows base_actions.pl pattern:
%%   action/4, action_difficulty/2, action_duration/2, action_category/2,
%%   action_verb/3, action_target_type/2, action_prerequisite/2, action_effect/2,
%%   can_perform/3

%% ═══════════════════════════════════════════════════════════
%% Purification and Faith Actions
%% ═══════════════════════════════════════════════════════════

%% purify_with_ash
% Action: purify_with_ash
% Apply sanctified ash to cleanse corruption from a person or object
% Type: faith / purification

action(purify_with_ash, 'purify_with_ash', faith, 10).
action_difficulty(purify_with_ash, 0.4).
action_duration(purify_with_ash, 3).
action_category(purify_with_ash, purification).
action_verb(purify_with_ash, past, 'purified').
action_verb(purify_with_ash, present, 'purifies').
action_target_type(purify_with_ash, other).
action_requires_target(purify_with_ash).
action_range(purify_with_ash, 3).
action_prerequisite(purify_with_ash, (near(Actor, Target, 3))).
action_prerequisite(purify_with_ash, (has_item(Actor, sanctified_ash, N), N > 0)).
action_effect(purify_with_ash, (modify_attribute(Target, corruption, -15))).
action_effect(purify_with_ash, (modify_item(Actor, sanctified_ash, -1))).
can_perform(Actor, purify_with_ash, Target) :-
    near(Actor, Target, 3),
    has_item(Actor, sanctified_ash, N), N > 0.

%% exorcise_spirit
% Action: exorcise_spirit
% Perform the rite of exorcism to banish or free a bound spirit
% Type: faith / exorcism

action(exorcise_spirit, 'exorcise_spirit', faith, 20).
action_difficulty(exorcise_spirit, 0.8).
action_duration(exorcise_spirit, 5).
action_category(exorcise_spirit, exorcism).
action_verb(exorcise_spirit, past, 'exorcised').
action_verb(exorcise_spirit, present, 'exorcises').
action_target_type(exorcise_spirit, other).
action_requires_target(exorcise_spirit).
action_range(exorcise_spirit, 5).
action_prerequisite(exorcise_spirit, (status(Actor, exorcist))).
action_prerequisite(exorcise_spirit, (status(Target, bound_spirit))).
action_prerequisite(exorcise_spirit, (has_item(Actor, sanctified_ash, N), N > 0)).
action_prerequisite(exorcise_spirit, (has_item(Actor, silver_implement, M), M > 0)).
action_effect(exorcise_spirit, (retract(status(Target, bound_spirit)))).
action_effect(exorcise_spirit, (assert(status(Target, freed_spirit)))).
action_effect(exorcise_spirit, (modify_attribute(Actor, corruption, 5))).
can_perform(Actor, exorcise_spirit, Target) :-
    status(Actor, exorcist),
    status(Target, bound_spirit),
    has_item(Actor, sanctified_ash, N), N > 0,
    has_item(Actor, silver_implement, M), M > 0.

%% pray_at_shrine
% Action: pray_at_shrine
% Pray at a consecrated shrine to restore willpower and reduce corruption
% Type: faith / devotion

action(pray_at_shrine, 'pray_at_shrine', faith, 5).
action_difficulty(pray_at_shrine, 0.1).
action_duration(pray_at_shrine, 2).
action_category(pray_at_shrine, devotion).
action_verb(pray_at_shrine, past, 'prayed').
action_verb(pray_at_shrine, present, 'prays').
action_target_type(pray_at_shrine, location).
action_prerequisite(pray_at_shrine, (at_location(Actor, shrine))).
action_effect(pray_at_shrine, (modify_attribute(Actor, willpower, 10))).
action_effect(pray_at_shrine, (modify_attribute(Actor, corruption, -5))).
can_perform(Actor, pray_at_shrine, _Target) :-
    at_location(Actor, shrine).

%% ═══════════════════════════════════════════════════════════
%% Dark Magic Actions
%% ═══════════════════════════════════════════════════════════

%% corrupt_target
% Action: corrupt_target
% Channel dark energy to increase corruption in a target
% Type: dark_magic / corruption

action(corrupt_target, 'corrupt_target', dark_magic, 15).
action_difficulty(corrupt_target, 0.6).
action_duration(corrupt_target, 2).
action_category(corrupt_target, corruption).
action_verb(corrupt_target, past, 'corrupted').
action_verb(corrupt_target, present, 'corrupts').
action_target_type(corrupt_target, other).
action_requires_target(corrupt_target).
action_range(corrupt_target, 8).
action_prerequisite(corrupt_target, (attribute(Actor, dark_magic, DM), DM > 30)).
action_prerequisite(corrupt_target, (near(Actor, Target, 8))).
action_effect(corrupt_target, (modify_attribute(Target, corruption, 20))).
action_effect(corrupt_target, (modify_attribute(Actor, corruption, 5))).
can_perform(Actor, corrupt_target, Target) :-
    attribute(Actor, dark_magic, DM), DM > 30,
    near(Actor, Target, 8).

%% raise_thrall
% Action: raise_thrall
% Animate a corpse as a mindless undead servant
% Type: dark_magic / necromancy

action(raise_thrall, 'raise_thrall', dark_magic, 25).
action_difficulty(raise_thrall, 0.7).
action_duration(raise_thrall, 4).
action_category(raise_thrall, necromancy).
action_verb(raise_thrall, past, 'raised').
action_verb(raise_thrall, present, 'raises').
action_target_type(raise_thrall, corpse).
action_requires_target(raise_thrall).
action_range(raise_thrall, 3).
action_prerequisite(raise_thrall, (attribute(Actor, dark_magic, DM), DM > 50)).
action_prerequisite(raise_thrall, (near(Actor, Target, 3))).
action_prerequisite(raise_thrall, (is_corpse(Target))).
action_effect(raise_thrall, (assert(status(Target, thrall)))).
action_effect(raise_thrall, (assert(bound_to(Target, Actor)))).
action_effect(raise_thrall, (modify_attribute(Actor, corruption, 15))).
can_perform(Actor, raise_thrall, Target) :-
    attribute(Actor, dark_magic, DM), DM > 50,
    near(Actor, Target, 3),
    is_corpse(Target).

%% drain_life_force
% Action: drain_life_force
% Siphon vitality from a living target to heal the caster
% Type: dark_magic / vampiric

action(drain_life_force, 'drain_life_force', dark_magic, 20).
action_difficulty(drain_life_force, 0.6).
action_duration(drain_life_force, 2).
action_category(drain_life_force, vampiric).
action_verb(drain_life_force, past, 'drained').
action_verb(drain_life_force, present, 'drains').
action_target_type(drain_life_force, other).
action_requires_target(drain_life_force).
action_range(drain_life_force, 5).
action_prerequisite(drain_life_force, (attribute(Actor, dark_magic, DM), DM > 40)).
action_prerequisite(drain_life_force, (near(Actor, Target, 5))).
action_prerequisite(drain_life_force, (alive(Target))).
action_effect(drain_life_force, (modify_health(Target, -25))).
action_effect(drain_life_force, (modify_health(Actor, 15))).
action_effect(drain_life_force, (modify_attribute(Actor, corruption, 10))).
can_perform(Actor, drain_life_force, Target) :-
    attribute(Actor, dark_magic, DM), DM > 40,
    near(Actor, Target, 5),
    alive(Target).

%% commune_with_dead
% Action: commune_with_dead
% Open a channel to speak with a deceased spirit through the thin veil
% Type: dark_magic / spirit

action(commune_with_dead, 'commune_with_dead', dark_magic, 15).
action_difficulty(commune_with_dead, 0.5).
action_duration(commune_with_dead, 3).
action_category(commune_with_dead, spirit).
action_verb(commune_with_dead, past, 'communed with').
action_verb(commune_with_dead, present, 'communes with').
action_target_type(commune_with_dead, other).
action_requires_target(commune_with_dead).
action_range(commune_with_dead, 10).
action_prerequisite(commune_with_dead, (attribute(Actor, dark_magic, DM), DM > 20)).
action_prerequisite(commune_with_dead, (\+ alive(Target))).
action_effect(commune_with_dead, (assert(communed_with(Actor, Target)))).
action_effect(commune_with_dead, (modify_attribute(Actor, corruption, 5))).
can_perform(Actor, commune_with_dead, Target) :-
    attribute(Actor, dark_magic, DM), DM > 20,
    \+ alive(Target).

%% ═══════════════════════════════════════════════════════════
%% Survival and Combat Actions
%% ═══════════════════════════════════════════════════════════

%% apply_plague_treatment
% Action: apply_plague_treatment
% Treat Ashrot symptoms with herbal fumigants and leeching salts
% Type: medical / plague_treatment

action(apply_plague_treatment, 'apply_plague_treatment', medical, 10).
action_difficulty(apply_plague_treatment, 0.5).
action_duration(apply_plague_treatment, 3).
action_category(apply_plague_treatment, plague_treatment).
action_verb(apply_plague_treatment, past, 'treated').
action_verb(apply_plague_treatment, present, 'treats').
action_target_type(apply_plague_treatment, other).
action_requires_target(apply_plague_treatment).
action_range(apply_plague_treatment, 2).
action_prerequisite(apply_plague_treatment, (attribute(Actor, medicine, Med), Med > 40)).
action_prerequisite(apply_plague_treatment, (near(Actor, Target, 2))).
action_prerequisite(apply_plague_treatment, (status(Target, plague_infected))).
action_effect(apply_plague_treatment, (modify_health(Target, 20))).
action_effect(apply_plague_treatment, (assert(status(Target, treated)))).
can_perform(Actor, apply_plague_treatment, Target) :-
    attribute(Actor, medicine, Med), Med > 40,
    near(Actor, Target, 2),
    status(Target, plague_infected).

%% forge_silver_weapon
% Action: forge_silver_weapon
% Craft a weapon with silver edges effective against undead
% Type: crafting / smithing

action(forge_silver_weapon, 'forge_silver_weapon', crafting, 15).
action_difficulty(forge_silver_weapon, 0.7).
action_duration(forge_silver_weapon, 6).
action_category(forge_silver_weapon, smithing).
action_verb(forge_silver_weapon, past, 'forged').
action_verb(forge_silver_weapon, present, 'forges').
action_target_type(forge_silver_weapon, self).
action_prerequisite(forge_silver_weapon, (attribute(Actor, craftsmanship, C), C > 60)).
action_prerequisite(forge_silver_weapon, (has_item(Actor, silver_ingot, N), N > 0)).
action_prerequisite(forge_silver_weapon, (at_location(Actor, forge))).
action_effect(forge_silver_weapon, (assert(has_item(Actor, silver_weapon, 1)))).
action_effect(forge_silver_weapon, (modify_item(Actor, silver_ingot, -1))).
can_perform(Actor, forge_silver_weapon, _Target) :-
    attribute(Actor, craftsmanship, C), C > 60,
    has_item(Actor, silver_ingot, N), N > 0,
    at_location(Actor, forge).

%% strike_with_silver
% Action: strike_with_silver
% Attack an undead creature with a silver weapon for increased damage
% Type: combat / anti_undead

action(strike_with_silver, 'strike_with_silver', combat, 5).
action_difficulty(strike_with_silver, 0.4).
action_duration(strike_with_silver, 1).
action_category(strike_with_silver, anti_undead).
action_verb(strike_with_silver, past, 'struck').
action_verb(strike_with_silver, present, 'strikes').
action_target_type(strike_with_silver, other).
action_requires_target(strike_with_silver).
action_range(strike_with_silver, 3).
action_prerequisite(strike_with_silver, (has_item(Actor, silver_weapon, N), N > 0)).
action_prerequisite(strike_with_silver, (near(Actor, Target, 3))).
action_prerequisite(strike_with_silver, (attribute(Target, corruption, C), C > 50)).
action_effect(strike_with_silver, (modify_health(Target, -40))).
can_perform(Actor, strike_with_silver, Target) :-
    has_item(Actor, silver_weapon, N), N > 0,
    near(Actor, Target, 3),
    attribute(Target, corruption, C), C > 50.

%% brew_ward_potion
% Action: brew_ward_potion
% Brew a potion that temporarily protects against corruption and undead detection
% Type: alchemy / warding

action(brew_ward_potion, 'brew_ward_potion', alchemy, 10).
action_difficulty(brew_ward_potion, 0.5).
action_duration(brew_ward_potion, 4).
action_category(brew_ward_potion, warding).
action_verb(brew_ward_potion, past, 'brewed').
action_verb(brew_ward_potion, present, 'brews').
action_target_type(brew_ward_potion, self).
action_prerequisite(brew_ward_potion, (attribute(Actor, herbalism, H), H > 50)).
action_prerequisite(brew_ward_potion, (has_item(Actor, blight_herb, N), N > 0)).
action_effect(brew_ward_potion, (assert(has_item(Actor, ward_potion, 1)))).
action_effect(brew_ward_potion, (modify_item(Actor, blight_herb, -1))).
can_perform(Actor, brew_ward_potion, _Target) :-
    attribute(Actor, herbalism, H), H > 50,
    has_item(Actor, blight_herb, N), N > 0.

%% maintain_swamp_wards
% Action: maintain_swamp_wards
% Renew the ancient protective wards around Hollowmere using blood and herbs
% Type: ritual / warding

action(maintain_swamp_wards, 'maintain_swamp_wards', ritual, 20).
action_difficulty(maintain_swamp_wards, 0.6).
action_duration(maintain_swamp_wards, 5).
action_category(maintain_swamp_wards, warding).
action_verb(maintain_swamp_wards, past, 'maintained the wards').
action_verb(maintain_swamp_wards, present, 'maintains the wards').
action_target_type(maintain_swamp_wards, location).
action_prerequisite(maintain_swamp_wards, (status(Actor, ward_keeper))).
action_prerequisite(maintain_swamp_wards, (at_location(Actor, hollowmere))).
action_prerequisite(maintain_swamp_wards, (attribute(Actor, herbalism, H), H > 60)).
action_effect(maintain_swamp_wards, (assert(ward_active(hollowmere, renewed)))).
action_effect(maintain_swamp_wards, (modify_attribute(Actor, corruption, 5))).
can_perform(Actor, maintain_swamp_wards, _Target) :-
    status(Actor, ward_keeper),
    at_location(Actor, hollowmere),
    attribute(Actor, herbalism, H), H > 60.
