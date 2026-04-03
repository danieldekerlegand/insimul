%% Ensemble Volition Rules: attributes-self-improvement
%% Source: data/ensemble/volitionRules/attributes-self-improvement.json
%% Converted: 2026-04-02T20:09:49.723Z
%% Total rules: 6

rule_likelihood(weak_people_desire_strength, 1).
rule_type(weak_people_desire_strength, volition).
% Weak people desire strength
rule_active(weak_people_desire_strength).
rule_category(weak_people_desire_strength, attributes_self_improvement).
rule_source(weak_people_desire_strength, ensemble).
rule_priority(weak_people_desire_strength, 5).
rule_applies(weak_people_desire_strength, X, Y) :-
    attribute(X, strength, Strength_val), Strength_val < 10.
rule_effect(weak_people_desire_strength, modify_attribute(X, strength, '+', 5)).

rule_likelihood(everyone_desires_intelligence, 1).
rule_type(everyone_desires_intelligence, volition).
% Everyone desires intelligence
rule_active(everyone_desires_intelligence).
rule_category(everyone_desires_intelligence, attributes_self_improvement).
rule_source(everyone_desires_intelligence, ensemble).
rule_priority(everyone_desires_intelligence, 5).
rule_applies(everyone_desires_intelligence, X, Y) :-
    trait(X, anyone).
rule_effect(everyone_desires_intelligence, modify_attribute(X, intelligence, '+', 5)).

rule_likelihood(everyone_desires_strength, 1).
rule_type(everyone_desires_strength, volition).
% Everyone Desires Strength
rule_active(everyone_desires_strength).
rule_category(everyone_desires_strength, attributes_self_improvement).
rule_source(everyone_desires_strength, ensemble).
rule_priority(everyone_desires_strength, 5).
rule_applies(everyone_desires_strength, X, Y) :-
    trait(X, anyone).
rule_effect(everyone_desires_strength, modify_attribute(X, strength, '+', 5)).

rule_likelihood(high_magicka_link_allows_intelligence_training, 1).
rule_type(high_magicka_link_allows_intelligence_training, volition).
% High magicka link allows intelligence training.
rule_active(high_magicka_link_allows_intelligence_training).
rule_category(high_magicka_link_allows_intelligence_training, attributes_self_improvement).
rule_source(high_magicka_link_allows_intelligence_training, ensemble).
rule_priority(high_magicka_link_allows_intelligence_training, 5).
rule_applies(high_magicka_link_allows_intelligence_training, X, Y) :-
    bond(X, Y, magicka_link, Magicka_link_val), Magicka_link_val > 9,
    attribute(X, intelligence, Intelligence_val), Intelligence_val < 10,
    attribute(Y, intelligence, Intelligence_val), Intelligence_val > 10.
rule_effect(high_magicka_link_allows_intelligence_training, modify_attribute(X, intelligence, '+', 5)).

rule_likelihood(everyone_is_smart, 1).
rule_type(everyone_is_smart, volition).
% Everyone is smart!
rule_active(everyone_is_smart).
rule_category(everyone_is_smart, attributes_self_improvement).
rule_source(everyone_is_smart, ensemble).
rule_priority(everyone_is_smart, 5).
rule_applies(everyone_is_smart, X, Y) :-
    bond(X, Y, kinship, Kinship_val), Kinship_val > 0.
rule_effect(everyone_is_smart, modify_attribute(X, intelligence, '+', 5)).

rule_likelihood(people_s_average_desire_to_be_close_increases_towards_strong_individuals, 1).
rule_type(people_s_average_desire_to_be_close_increases_towards_strong_individuals, volition).
% People’s average desire to be close increases towards strong individuals.
rule_active(people_s_average_desire_to_be_close_increases_towards_strong_individuals).
rule_category(people_s_average_desire_to_be_close_increases_towards_strong_individuals, attributes_self_improvement).
rule_source(people_s_average_desire_to_be_close_increases_towards_strong_individuals, ensemble).
rule_priority(people_s_average_desire_to_be_close_increases_towards_strong_individuals, 3).
rule_applies(people_s_average_desire_to_be_close_increases_towards_strong_individuals, X, Y) :-
    event(X, mean).
rule_effect(people_s_average_desire_to_be_close_increases_towards_strong_individuals, set_intent(X, kind, Y, -3)).




