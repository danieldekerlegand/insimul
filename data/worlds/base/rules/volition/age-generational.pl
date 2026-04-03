%% Ensemble Volition Rules: age-generational
%% Source: data/ensemble/volitionRules/age-generational.json
%% Converted: 2026-04-02T20:09:49.721Z
%% Total rules: 1

rule_likelihood(children_may_bother_older_grumpy_people, 1).
rule_type(children_may_bother_older_grumpy_people, volition).
% Children may bother older, grumpy people
rule_active(children_may_bother_older_grumpy_people).
rule_category(children_may_bother_older_grumpy_people, age_generational).
rule_source(children_may_bother_older_grumpy_people, ensemble).
rule_priority(children_may_bother_older_grumpy_people, 5).
rule_applies(children_may_bother_older_grumpy_people, X, Y) :-
    trait(X, child),
    \+ trait(Y, child),
    trait(Y, cold),
    attribute(Y, sensitiveness, Sensitiveness_val), Sensitiveness_val < 50.
rule_effect(children_may_bother_older_grumpy_people, modify_network(X, Y, affinity, '+', 5)).

