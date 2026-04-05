%% Insimul Rules: Tropical Pirate
%% Source: data/worlds/tropical_pirate/rules.pl
%% Created: 2026-04-03
%% Total: 12 rules
%%
%% Predicate schema (ensemble volition style):
%%   rule_likelihood/2, rule_type/2, rule_active/1
%%   rule_category/2, rule_source/2, rule_priority/2
%%   rule_applies/3, rule_effect/2

%% Pirate crews bond through shared danger
rule_likelihood(crews_bond_shared_danger, 3).
rule_type(crews_bond_shared_danger, volition).
rule_active(crews_bond_shared_danger).
rule_category(crews_bond_shared_danger, friendship_affinity).
rule_source(crews_bond_shared_danger, tropical_pirate).
rule_priority(crews_bond_shared_danger, 5).
rule_applies(crews_bond_shared_danger, X, Y) :-
    trait(X, daring), trait(Y, daring),
    location(X, Loc), location(Y, Loc).
rule_effect(crews_bond_shared_danger, set_intent(X, befriend, Y, 5)).

%% Rival captains antagonize each other for dominance
rule_likelihood(rival_captains_antagonize, 3).
rule_type(rival_captains_antagonize, volition).
rule_active(rival_captains_antagonize).
rule_category(rival_captains_antagonize, antagonism_hostility).
rule_source(rival_captains_antagonize, tropical_pirate).
rule_priority(rival_captains_antagonize, 5).
rule_applies(rival_captains_antagonize, X, Y) :-
    trait(X, commanding), trait(Y, commanding),
    X \= Y, relationship(X, Y, rivals).
rule_effect(rival_captains_antagonize, set_intent(X, antagonize, Y, 5)).

%% Greedy individuals distrust everyone around treasure
rule_likelihood(greedy_distrust_near_treasure, 2).
rule_type(greedy_distrust_near_treasure, volition).
rule_active(greedy_distrust_near_treasure).
rule_category(greedy_distrust_near_treasure, distrust).
rule_source(greedy_distrust_near_treasure, tropical_pirate).
rule_priority(greedy_distrust_near_treasure, 4).
rule_applies(greedy_distrust_near_treasure, X, Y) :-
    trait(X, greedy),
    attribute(X, cunningness, CX), CX > 60.
rule_effect(greedy_distrust_near_treasure, set_intent(X, distrust, Y, 4)).

%% Military officers pursue known pirates
rule_likelihood(officers_pursue_pirates, 3).
rule_type(officers_pursue_pirates, volition).
rule_active(officers_pursue_pirates).
rule_category(officers_pursue_pirates, law_enforcement).
rule_source(officers_pursue_pirates, tropical_pirate).
rule_priority(officers_pursue_pirates, 5).
rule_applies(officers_pursue_pirates, X, Y) :-
    trait(X, disciplined), trait(X, honorable),
    trait(Y, cunning), relationship(X, Y, enemies).
rule_effect(officers_pursue_pirates, set_intent(X, antagonize, Y, 5)).

%% Charming rogues befriend the influential
rule_likelihood(rogues_befriend_influential, 2).
rule_type(rogues_befriend_influential, volition).
rule_active(rogues_befriend_influential).
rule_category(rogues_befriend_influential, social_climbing).
rule_source(rogues_befriend_influential, tropical_pirate).
rule_priority(rogues_befriend_influential, 3).
rule_applies(rogues_befriend_influential, X, Y) :-
    trait(X, charming),
    attribute(Y, charisma, Ch), Ch > 70.
rule_effect(rogues_befriend_influential, set_intent(X, befriend, Y, 3)).

%% Rebels sympathize with other free spirits
rule_likelihood(rebels_sympathize_free_spirits, 2).
rule_type(rebels_sympathize_free_spirits, volition).
rule_active(rebels_sympathize_free_spirits).
rule_category(rebels_sympathize_free_spirits, friendship_affinity).
rule_source(rebels_sympathize_free_spirits, tropical_pirate).
rule_priority(rebels_sympathize_free_spirits, 3).
rule_applies(rebels_sympathize_free_spirits, X, Y) :-
    trait(X, rebellious), trait(Y, adventurous).
rule_effect(rebels_sympathize_free_spirits, set_intent(X, befriend, Y, 3)).

%% Aristocrats look down on common pirates
rule_likelihood(aristocrats_disdain_pirates, 2).
rule_type(aristocrats_disdain_pirates, volition).
rule_active(aristocrats_disdain_pirates).
rule_category(aristocrats_disdain_pirates, class_conflict).
rule_source(aristocrats_disdain_pirates, tropical_pirate).
rule_priority(aristocrats_disdain_pirates, 4).
rule_applies(aristocrats_disdain_pirates, X, Y) :-
    trait(X, aristocratic), trait(X, proud),
    attribute(Y, propriety, P), P < 50.
rule_effect(aristocrats_disdain_pirates, set_intent(X, antagonize, Y, 3)).

%% Superstitious sailors distrust the eccentric
rule_likelihood(superstitious_distrust_eccentric, 1).
rule_type(superstitious_distrust_eccentric, volition).
rule_active(superstitious_distrust_eccentric).
rule_category(superstitious_distrust_eccentric, distrust).
rule_source(superstitious_distrust_eccentric, tropical_pirate).
rule_priority(superstitious_distrust_eccentric, 2).
rule_applies(superstitious_distrust_eccentric, X, Y) :-
    trait(X, superstitious), trait(Y, eccentric).
rule_effect(superstitious_distrust_eccentric, set_intent(X, distrust, Y, 2)).

%% Fierce warriors respect other skilled fighters
rule_likelihood(fierce_respect_skilled, 2).
rule_type(fierce_respect_skilled, volition).
rule_active(fierce_respect_skilled).
rule_category(fierce_respect_skilled, respect).
rule_source(fierce_respect_skilled, tropical_pirate).
rule_priority(fierce_respect_skilled, 3).
rule_applies(fierce_respect_skilled, X, Y) :-
    trait(X, fierce), trait(Y, tough),
    attribute(Y, self_assuredness, SA), SA > 70.
rule_effect(fierce_respect_skilled, set_intent(X, respect, Y, 3)).

%% Unscrupulous dealers exploit the desperate
rule_likelihood(dealers_exploit_desperate, 2).
rule_type(dealers_exploit_desperate, volition).
rule_active(dealers_exploit_desperate).
rule_category(dealers_exploit_desperate, exploitation).
rule_source(dealers_exploit_desperate, tropical_pirate).
rule_priority(dealers_exploit_desperate, 4).
rule_applies(dealers_exploit_desperate, X, Y) :-
    trait(X, unscrupulous),
    attribute(X, cunningness, CX), CX > 70,
    attribute(Y, self_assuredness, SA), SA < 50.
rule_effect(dealers_exploit_desperate, set_intent(X, manipulate, Y, 4)).

%% Devout individuals seek to redeem the wicked
rule_likelihood(devout_seek_redemption, 1).
rule_type(devout_seek_redemption, volition).
rule_active(devout_seek_redemption).
rule_category(devout_seek_redemption, moral_guidance).
rule_source(devout_seek_redemption, tropical_pirate).
rule_priority(devout_seek_redemption, 2).
rule_applies(devout_seek_redemption, X, Y) :-
    trait(X, devout), trait(X, compassionate),
    trait(Y, ruthless).
rule_effect(devout_seek_redemption, set_intent(X, befriend, Y, 2)).

%% Loyal first mates protect their captain
rule_likelihood(loyal_mates_protect_captain, 3).
rule_type(loyal_mates_protect_captain, volition).
rule_active(loyal_mates_protect_captain).
rule_category(loyal_mates_protect_captain, loyalty).
rule_source(loyal_mates_protect_captain, tropical_pirate).
rule_priority(loyal_mates_protect_captain, 5).
rule_applies(loyal_mates_protect_captain, X, Y) :-
    trait(X, loyal), relationship(X, Y, allies),
    trait(Y, charismatic).
rule_effect(loyal_mates_protect_captain, set_intent(X, protect, Y, 5)).
