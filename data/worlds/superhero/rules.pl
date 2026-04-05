%% Insimul Rules: Superhero
%% Source: data/worlds/superhero/rules.pl
%% Created: 2026-04-03
%% Total: 12 rules
%%
%% Predicate schema (ensemble volition style):
%%   rule_likelihood/2, rule_type/2, rule_active/1
%%   rule_category/2, rule_source/2, rule_priority/2
%%   rule_applies/3, rule_effect/2

%% Heroes ally with other heroes against shared threats
rule_likelihood(heroes_ally_against_threats, 3).
rule_type(heroes_ally_against_threats, volition).
rule_active(heroes_ally_against_threats).
rule_category(heroes_ally_against_threats, alliance).
rule_source(heroes_ally_against_threats, superhero).
rule_priority(heroes_ally_against_threats, 5).
rule_applies(heroes_ally_against_threats, X, Y) :-
    trait(X, heroic), trait(Y, heroic), X \= Y.
rule_effect(heroes_ally_against_threats, set_intent(X, ally, Y, 5)).

%% Villains antagonize heroes on sight
rule_likelihood(villains_antagonize_heroes, 3).
rule_type(villains_antagonize_heroes, volition).
rule_active(villains_antagonize_heroes).
rule_category(villains_antagonize_heroes, antagonism_hostility).
rule_source(villains_antagonize_heroes, superhero).
rule_priority(villains_antagonize_heroes, 5).
rule_applies(villains_antagonize_heroes, X, Y) :-
    trait(X, megalomaniac), trait(Y, heroic).
rule_effect(villains_antagonize_heroes, set_intent(X, antagonize, Y, 5)).

%% Manipulative individuals exploit the trusting
rule_likelihood(manipulative_exploit_trusting, 2).
rule_type(manipulative_exploit_trusting, volition).
rule_active(manipulative_exploit_trusting).
rule_category(manipulative_exploit_trusting, exploitation).
rule_source(manipulative_exploit_trusting, superhero).
rule_priority(manipulative_exploit_trusting, 4).
rule_applies(manipulative_exploit_trusting, X, Y) :-
    trait(X, manipulative), trait(Y, honest).
rule_effect(manipulative_exploit_trusting, set_intent(X, manipulate, Y, 4)).

%% Protective heroes defend civilians
rule_likelihood(protective_heroes_defend, 3).
rule_type(protective_heroes_defend, volition).
rule_active(protective_heroes_defend).
rule_category(protective_heroes_defend, protection).
rule_source(protective_heroes_defend, superhero).
rule_priority(protective_heroes_defend, 5).
rule_applies(protective_heroes_defend, X, Y) :-
    trait(X, protective), trait(Y, community_minded).
rule_effect(protective_heroes_defend, set_intent(X, protect, Y, 5)).

%% Ambitious reporters pursue powerful individuals
rule_likelihood(reporters_pursue_powerful, 2).
rule_type(reporters_pursue_powerful, volition).
rule_active(reporters_pursue_powerful).
rule_category(reporters_pursue_powerful, investigation).
rule_source(reporters_pursue_powerful, superhero).
rule_priority(reporters_pursue_powerful, 3).
rule_applies(reporters_pursue_powerful, X, Y) :-
    trait(X, perceptive), trait(X, ambitious),
    attribute(Y, cunningness, C), C > 70.
rule_effect(reporters_pursue_powerful, set_intent(X, investigate, Y, 3)).

%% Conflicted mercenaries waver between factions
rule_likelihood(mercenary_faction_wavering, 1).
rule_type(mercenary_faction_wavering, volition).
rule_active(mercenary_faction_wavering).
rule_category(mercenary_faction_wavering, loyalty_conflict).
rule_source(mercenary_faction_wavering, superhero).
rule_priority(mercenary_faction_wavering, 3).
rule_applies(mercenary_faction_wavering, X, Y) :-
    trait(X, conflicted), trait(X, mercenary),
    trait(Y, heroic).
rule_effect(mercenary_faction_wavering, set_intent(X, befriend, Y, 2)).

%% Brilliant minds respect other intellectuals
rule_likelihood(brilliant_respect_intellect, 2).
rule_type(brilliant_respect_intellect, volition).
rule_active(brilliant_respect_intellect).
rule_category(brilliant_respect_intellect, respect).
rule_source(brilliant_respect_intellect, superhero).
rule_priority(brilliant_respect_intellect, 3).
rule_applies(brilliant_respect_intellect, X, Y) :-
    trait(X, brilliant), trait(Y, brilliant), X \= Y.
rule_effect(brilliant_respect_intellect, set_intent(X, respect, Y, 3)).

%% Impulsive fighters clash with the aggressive
rule_likelihood(impulsive_clash_aggressive, 2).
rule_type(impulsive_clash_aggressive, volition).
rule_active(impulsive_clash_aggressive).
rule_category(impulsive_clash_aggressive, antagonism_hostility).
rule_source(impulsive_clash_aggressive, superhero).
rule_priority(impulsive_clash_aggressive, 4).
rule_applies(impulsive_clash_aggressive, X, Y) :-
    trait(X, impulsive), trait(Y, aggressive).
rule_effect(impulsive_clash_aggressive, set_intent(X, antagonize, Y, 4)).

%% Loyal allies defend their teammates reputation
rule_likelihood(loyal_defend_reputation, 2).
rule_type(loyal_defend_reputation, volition).
rule_active(loyal_defend_reputation).
rule_category(loyal_defend_reputation, loyalty).
rule_source(loyal_defend_reputation, superhero).
rule_priority(loyal_defend_reputation, 4).
rule_applies(loyal_defend_reputation, X, Y) :-
    trait(X, loyal), relationship(X, Y, allies).
rule_effect(loyal_defend_reputation, set_intent(X, protect, Y, 4)).

%% Vindictive villains pursue grudges relentlessly
rule_likelihood(vindictive_pursue_grudges, 2).
rule_type(vindictive_pursue_grudges, volition).
rule_active(vindictive_pursue_grudges).
rule_category(vindictive_pursue_grudges, vendetta).
rule_source(vindictive_pursue_grudges, superhero).
rule_priority(vindictive_pursue_grudges, 5).
rule_applies(vindictive_pursue_grudges, X, Y) :-
    trait(X, vindictive), relationship(X, Y, enemies).
rule_effect(vindictive_pursue_grudges, set_intent(X, antagonize, Y, 5)).

%% Political figures seek alliances with powerful metahumans
rule_likelihood(politicians_seek_metahuman_allies, 2).
rule_type(politicians_seek_metahuman_allies, volition).
rule_active(politicians_seek_metahuman_allies).
rule_category(politicians_seek_metahuman_allies, political_alliance).
rule_source(politicians_seek_metahuman_allies, superhero).
rule_priority(politicians_seek_metahuman_allies, 3).
rule_applies(politicians_seek_metahuman_allies, X, Y) :-
    trait(X, political), trait(Y, heroic),
    attribute(Y, charisma, Ch), Ch > 70.
rule_effect(politicians_seek_metahuman_allies, set_intent(X, befriend, Y, 3)).

%% Streetwise youth navigate between factions
rule_likelihood(streetwise_navigate_factions, 1).
rule_type(streetwise_navigate_factions, volition).
rule_active(streetwise_navigate_factions).
rule_category(streetwise_navigate_factions, survival).
rule_source(streetwise_navigate_factions, superhero).
rule_priority(streetwise_navigate_factions, 2).
rule_applies(streetwise_navigate_factions, X, Y) :-
    trait(X, streetwise), trait(X, young),
    attribute(Y, cunningness, C), C > 60.
rule_effect(streetwise_navigate_factions, set_intent(X, befriend, Y, 2)).
