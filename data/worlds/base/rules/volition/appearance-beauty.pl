%% Ensemble Volition Rules: appearance-beauty
%% Source: data/ensemble/volitionRules/appearance-beauty.json
%% Converted: 2026-04-02T20:09:49.723Z
%% Total rules: 5

rule_likelihood(a_beautiful_worker_is_envied_by_other_workers, 1).
rule_type(a_beautiful_worker_is_envied_by_other_workers, volition).
% A beautiful worker is envied by other workers
rule_active(a_beautiful_worker_is_envied_by_other_workers).
rule_category(a_beautiful_worker_is_envied_by_other_workers, appearance_beauty).
rule_source(a_beautiful_worker_is_envied_by_other_workers, ensemble).
rule_priority(a_beautiful_worker_is_envied_by_other_workers, 5).
rule_applies(a_beautiful_worker_is_envied_by_other_workers, X, Y) :-
    directed_status(X, Y, jealous_of),
    trait(Y, beautiful),
    trait(X, deceitful).
rule_effect(a_beautiful_worker_is_envied_by_other_workers, modify_network(Y, X, affinity, '+', 5)).

rule_likelihood(an_upset_and_beautiful_woman_can_charm_a_sensitive_rich_man, 1).
rule_type(an_upset_and_beautiful_woman_can_charm_a_sensitive_rich_man, volition).
% An upset and beautiful woman can charm a sensitive rich man
rule_active(an_upset_and_beautiful_woman_can_charm_a_sensitive_rich_man).
rule_category(an_upset_and_beautiful_woman_can_charm_a_sensitive_rich_man, appearance_beauty).
rule_source(an_upset_and_beautiful_woman_can_charm_a_sensitive_rich_man, ensemble).
rule_priority(an_upset_and_beautiful_woman_can_charm_a_sensitive_rich_man, 5).
rule_applies(an_upset_and_beautiful_woman_can_charm_a_sensitive_rich_man, X, Y) :-
    trait(X, charming),
    trait(X, beautiful),
    trait(X, female),
    status(X, upset),
    trait(Y, rich),
    attribute(Y, sensitiveness, Sensitiveness_val), Sensitiveness_val > 50.
rule_effect(an_upset_and_beautiful_woman_can_charm_a_sensitive_rich_man, modify_network(Y, X, affinity, '+', 5)).

rule_likelihood(being_well_dressed_for_an_occasion_will_tend_to_positively_attract_others, 1).
rule_type(being_well_dressed_for_an_occasion_will_tend_to_positively_attract_others, volition).
% Being well-dressed for an occasion will tend to positively attract others
rule_active(being_well_dressed_for_an_occasion_will_tend_to_positively_attract_others).
rule_category(being_well_dressed_for_an_occasion_will_tend_to_positively_attract_others, appearance_beauty).
rule_source(being_well_dressed_for_an_occasion_will_tend_to_positively_attract_others, ensemble).
rule_priority(being_well_dressed_for_an_occasion_will_tend_to_positively_attract_others, 3).
rule_applies(being_well_dressed_for_an_occasion_will_tend_to_positively_attract_others, X, Y) :-
    attribute(X, propriety, Propriety_val), Propriety_val > 60,
    trait(X, beautiful),
    trait(X, elegantly_dressed),
    trait(Y, inconsistent).
rule_effect(being_well_dressed_for_an_occasion_will_tend_to_positively_attract_others, modify_network(Y, X, affinity, '+', 3)).
rule_effect(being_well_dressed_for_an_occasion_will_tend_to_positively_attract_others, set_relationship(Y, X, ally, 3)).

rule_likelihood(unattractive_poor_independent_women_are_less_likely_to_marry, 1).
rule_type(unattractive_poor_independent_women_are_less_likely_to_marry, volition).
% Unattractive, poor, independent women are less likely to marry
rule_active(unattractive_poor_independent_women_are_less_likely_to_marry).
rule_category(unattractive_poor_independent_women_are_less_likely_to_marry, appearance_beauty).
rule_source(unattractive_poor_independent_women_are_less_likely_to_marry, ensemble).
rule_priority(unattractive_poor_independent_women_are_less_likely_to_marry, 5).
rule_applies(unattractive_poor_independent_women_are_less_likely_to_marry, X, Y) :-
    trait(X, female),
    \+ trait(X, beautiful),
    trait(X, charming),
    \+ trait(X, rich),
    \+ relationship(X, Y, married),
    trait(Y, male),
    trait(X, intelligent).
rule_effect(unattractive_poor_independent_women_are_less_likely_to_marry, modify_network(X, Y, affinity, '-', 5)).
rule_effect(unattractive_poor_independent_women_are_less_likely_to_marry, modify_network(X, Y, curiosity, '-', 5)).

rule_likelihood(beautiful_kind_unhappy_poor_people_may_gain_sympathy_from_young_generous_sensitive_rich_people, 1).
rule_type(beautiful_kind_unhappy_poor_people_may_gain_sympathy_from_young_generous_sensitive_rich_people, volition).
% Beautiful, kind, unhappy poor people may gain sympathy from young, generous, sensitive rich people
rule_active(beautiful_kind_unhappy_poor_people_may_gain_sympathy_from_young_generous_sensitive_rich_people).
rule_category(beautiful_kind_unhappy_poor_people_may_gain_sympathy_from_young_generous_sensitive_rich_people, appearance_beauty).
rule_source(beautiful_kind_unhappy_poor_people_may_gain_sympathy_from_young_generous_sensitive_rich_people, ensemble).
rule_priority(beautiful_kind_unhappy_poor_people_may_gain_sympathy_from_young_generous_sensitive_rich_people, 5).
rule_applies(beautiful_kind_unhappy_poor_people_may_gain_sympathy_from_young_generous_sensitive_rich_people, X, Y) :-
    trait(X, young),
    trait(Y, beautiful),
    trait(Y, kind),
    \+ trait(Y, young),
    \+ status(Y, happy),
    trait(X, generous),
    trait(X, rich),
    trait(Y, poor),
    attribute(X, sensitiveness, Sensitiveness_val), Sensitiveness_val > 60.
rule_effect(beautiful_kind_unhappy_poor_people_may_gain_sympathy_from_young_generous_sensitive_rich_people, modify_network(Y, X, affinity, '+', 5)).

