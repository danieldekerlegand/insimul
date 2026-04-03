%% Ensemble Volition Rules: familiarity-strangers
%% Source: data/ensemble/volitionRules/familiarity-strangers.json
%% Converted: 2026-04-02T20:09:49.725Z
%% Total rules: 1

rule_likelihood(unfamiliar_beautiful_women_may_attract_attention_from_others, 1).
rule_type(unfamiliar_beautiful_women_may_attract_attention_from_others, volition).
% Unfamiliar beautiful women may attract attention from others
rule_active(unfamiliar_beautiful_women_may_attract_attention_from_others).
rule_category(unfamiliar_beautiful_women_may_attract_attention_from_others, familiarity_strangers).
rule_source(unfamiliar_beautiful_women_may_attract_attention_from_others, ensemble).
rule_priority(unfamiliar_beautiful_women_may_attract_attention_from_others, 3).
rule_applies(unfamiliar_beautiful_women_may_attract_attention_from_others, X, Y) :-
    trait(X, female),
    trait(X, beautiful),
    \+ trait(X, well_known).
rule_effect(unfamiliar_beautiful_women_may_attract_attention_from_others, modify_network(X, Y, curiosity, '+', 3)).
rule_effect(unfamiliar_beautiful_women_may_attract_attention_from_others, modify_network(Y, X, curiosity, '+', 3)).

