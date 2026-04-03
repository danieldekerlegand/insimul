%% Ensemble Volition Rules: relationship-closeness
%% Source: data/ensemble/volitionRules/relationship-closeness.json
%% Converted: 2026-04-02T20:09:49.728Z
%% Total rules: 5

rule_likelihood(everyone_wants_to_increase_closeness, 1).
rule_type(everyone_wants_to_increase_closeness, volition).
% Everyone Wants to Increase Closeness
rule_active(everyone_wants_to_increase_closeness).
rule_category(everyone_wants_to_increase_closeness, relationship_closeness).
rule_source(everyone_wants_to_increase_closeness, ensemble).
rule_priority(everyone_wants_to_increase_closeness, 5).
rule_applies(everyone_wants_to_increase_closeness, X, Y) :-
    network(X, Y, closeness, Closeness_val), Closeness_val > 0.
rule_effect(everyone_wants_to_increase_closeness, modify_network(X, Y, closeness, '+', 5)).

rule_likelihood(people_want_to_get_closer_to_smart_people, 1).
rule_type(people_want_to_get_closer_to_smart_people, volition).
% People want to get closer to smart people
rule_active(people_want_to_get_closer_to_smart_people).
rule_category(people_want_to_get_closer_to_smart_people, relationship_closeness).
rule_source(people_want_to_get_closer_to_smart_people, ensemble).
rule_priority(people_want_to_get_closer_to_smart_people, 5).
rule_applies(people_want_to_get_closer_to_smart_people, X, Y) :-
    trait(X, anyone),
    attribute(Y, intelligence, Intelligence_val), Intelligence_val > 20.
rule_effect(people_want_to_get_closer_to_smart_people, modify_network(X, Y, closeness, '+', 5)).

rule_likelihood(people_want_to_get_closer_to_strong_people, 1).
rule_type(people_want_to_get_closer_to_strong_people, volition).
% People want to get closer to strong people
rule_active(people_want_to_get_closer_to_strong_people).
rule_category(people_want_to_get_closer_to_strong_people, relationship_closeness).
rule_source(people_want_to_get_closer_to_strong_people, ensemble).
rule_priority(people_want_to_get_closer_to_strong_people, 5).
rule_applies(people_want_to_get_closer_to_strong_people, X, Y) :-
    trait(X, anyone),
    attribute(Y, strength, Strength_val), Strength_val > 20.
rule_effect(people_want_to_get_closer_to_strong_people, modify_network(X, Y, closeness, '+', 5)).

rule_likelihood(people_s_desire_to_get_closer_within_their_extended_network_exceeding_a_strength_threshold_leads_them_to, 1).
rule_type(people_s_desire_to_get_closer_within_their_extended_network_exceeding_a_strength_threshold_leads_them_to, volition).
% People’s desire to get closer within their extended network exceeding a strength threshold leads them to
rule_active(people_s_desire_to_get_closer_within_their_extended_network_exceeding_a_strength_threshold_leads_them_to).
rule_category(people_s_desire_to_get_closer_within_their_extended_network_exceeding_a_strength_threshold_leads_them_to, relationship_closeness).
rule_source(people_s_desire_to_get_closer_within_their_extended_network_exceeding_a_strength_threshold_leads_them_to, ensemble).
rule_priority(people_s_desire_to_get_closer_within_their_extended_network_exceeding_a_strength_threshold_leads_them_to, 5).
rule_applies(people_s_desire_to_get_closer_within_their_extended_network_exceeding_a_strength_threshold_leads_them_to, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, mean).
rule_effect(people_s_desire_to_get_closer_within_their_extended_network_exceeding_a_strength_threshold_leads_them_to, set_intent(X, antagonize, Y, 5)).

rule_likelihood(people_s_average_desire_to_get_closer_increases_when_they_are_within_9_30_turns, 1).
rule_type(people_s_average_desire_to_get_closer_increases_when_they_are_within_9_30_turns, volition).
% People’s average desire to get closer increases when they are within 9-30 turns
rule_active(people_s_average_desire_to_get_closer_increases_when_they_are_within_9_30_turns).
rule_category(people_s_average_desire_to_get_closer_increases_when_they_are_within_9_30_turns, relationship_closeness).
rule_source(people_s_average_desire_to_get_closer_increases_when_they_are_within_9_30_turns, ensemble).
rule_priority(people_s_average_desire_to_get_closer_increases_when_they_are_within_9_30_turns, 1).
rule_applies(people_s_average_desire_to_get_closer_increases_when_they_are_within_9_30_turns, X, Y) :-
    event(X, mean).
rule_effect(people_s_average_desire_to_get_closer_increases_when_they_are_within_9_30_turns, set_intent(X, romance, Y, -2)).




