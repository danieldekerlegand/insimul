%% Ensemble Volition Rules: cultural-provincial
%% Source: data/ensemble/volitionRules/cultural-provincial.json
%% Converted: 2026-04-02T20:09:49.724Z
%% Total rules: 2

rule_likelihood(foreigners_may_dislike_mocking_locals, 1).
rule_type(foreigners_may_dislike_mocking_locals, volition).
% Foreigners may dislike mocking locals
rule_active(foreigners_may_dislike_mocking_locals).
rule_category(foreigners_may_dislike_mocking_locals, cultural_provincial).
rule_source(foreigners_may_dislike_mocking_locals, ensemble).
rule_priority(foreigners_may_dislike_mocking_locals, 5).
rule_applies(foreigners_may_dislike_mocking_locals, X, Y) :-
    trait(Y, foreigner),
    trait(X, mocking).
rule_effect(foreigners_may_dislike_mocking_locals, modify_network(Y, 'z', affinity, '+', 5)).

rule_likelihood(foreigners_may_become_flattered_by_locals, 1).
rule_type(foreigners_may_become_flattered_by_locals, volition).
% Foreigners may become flattered by locals
rule_active(foreigners_may_become_flattered_by_locals).
rule_category(foreigners_may_become_flattered_by_locals, cultural_provincial).
rule_source(foreigners_may_become_flattered_by_locals, ensemble).
rule_priority(foreigners_may_become_flattered_by_locals, 5).
rule_applies(foreigners_may_become_flattered_by_locals, X, Y) :-
    trait(X, foreigner),
    \+ trait(Y, provincial),
    status(X, flattered),
    network(Y, X, curiosity, Curiosity_val), Curiosity_val > 60.
rule_effect(foreigners_may_become_flattered_by_locals, modify_network(X, Y, affinity, '+', 5)).

