%% Ensemble Volition Rules: emulation-imitation
%% Source: data/ensemble/volitionRules/emulation-imitation.json
%% Converted: 2026-04-02T20:09:49.725Z
%% Total rules: 8

rule_likelihood(propriety_is_often_imitated, 1).
rule_type(propriety_is_often_imitated, volition).
% Propriety is often imitated
rule_active(propriety_is_often_imitated).
rule_category(propriety_is_often_imitated, emulation_imitation).
rule_source(propriety_is_often_imitated, ensemble).
rule_priority(propriety_is_often_imitated, 3).
rule_applies(propriety_is_often_imitated, X, Y) :-
    attribute(X, propriety, Propriety_val), Propriety_val > 70,
    trait(X, male),
    attribute(X, sophistication, Sophistication_val), Sophistication_val > 80.
rule_effect(propriety_is_often_imitated, modify_network(Y, X, emulation, '+', 3)).

rule_likelihood(a_poor_young_man_can_follow_a_rich_man_to_do_improper_things_for_money, 1).
rule_type(a_poor_young_man_can_follow_a_rich_man_to_do_improper_things_for_money, volition).
% A poor young man can follow a rich man to do improper things for money
rule_active(a_poor_young_man_can_follow_a_rich_man_to_do_improper_things_for_money).
rule_category(a_poor_young_man_can_follow_a_rich_man_to_do_improper_things_for_money, emulation_imitation).
rule_source(a_poor_young_man_can_follow_a_rich_man_to_do_improper_things_for_money, ensemble).
rule_priority(a_poor_young_man_can_follow_a_rich_man_to_do_improper_things_for_money, 5).
rule_applies(a_poor_young_man_can_follow_a_rich_man_to_do_improper_things_for_money, X, Y) :-
    trait(X, poor),
    trait(Y, rich),
    attribute(Y, propriety, Propriety_val), Propriety_val < 33,
    trait(X, young).
rule_effect(a_poor_young_man_can_follow_a_rich_man_to_do_improper_things_for_money, modify_network(Y, X, emulation, '+', 5)).

rule_likelihood(provincials_imitate_non_provincials, 1).
rule_type(provincials_imitate_non_provincials, volition).
% Provincials imitate non-provincials
rule_active(provincials_imitate_non_provincials).
rule_category(provincials_imitate_non_provincials, emulation_imitation).
rule_source(provincials_imitate_non_provincials, ensemble).
rule_priority(provincials_imitate_non_provincials, 3).
rule_applies(provincials_imitate_non_provincials, X, Y) :-
    trait(X, provincial),
    \+ trait(Y, provincial).
rule_effect(provincials_imitate_non_provincials, modify_network(Y, X, emulation, '+', 3)).

rule_likelihood(financial_dependent_people_emulate_their_sophisticated_benefactors, 1).
rule_type(financial_dependent_people_emulate_their_sophisticated_benefactors, volition).
% Financial dependent people emulate their sophisticated benefactors
rule_active(financial_dependent_people_emulate_their_sophisticated_benefactors).
rule_category(financial_dependent_people_emulate_their_sophisticated_benefactors, emulation_imitation).
rule_source(financial_dependent_people_emulate_their_sophisticated_benefactors, ensemble).
rule_priority(financial_dependent_people_emulate_their_sophisticated_benefactors, 5).
rule_applies(financial_dependent_people_emulate_their_sophisticated_benefactors, X, Y) :-
    directed_status(X, Y, financially_dependent_on),
    trait(Y, rich),
    relationship(X, Y, ally),
    attribute(X, sophistication, Sophistication_val), Sophistication_val < 50,
    attribute(Y, sophistication, Sophistication_val), Sophistication_val > 50,
    trait(X, young).
rule_effect(financial_dependent_people_emulate_their_sophisticated_benefactors, modify_network(Y, X, emulation, '+', 5)).

rule_likelihood(sensitive_low_propriety_will_tend_to_emulate_upset_behavior, 1).
rule_type(sensitive_low_propriety_will_tend_to_emulate_upset_behavior, volition).
% Sensitive / low propriety will tend to emulate upset behavior
rule_active(sensitive_low_propriety_will_tend_to_emulate_upset_behavior).
rule_category(sensitive_low_propriety_will_tend_to_emulate_upset_behavior, emulation_imitation).
rule_source(sensitive_low_propriety_will_tend_to_emulate_upset_behavior, ensemble).
rule_priority(sensitive_low_propriety_will_tend_to_emulate_upset_behavior, 1).
rule_applies(sensitive_low_propriety_will_tend_to_emulate_upset_behavior, X, Y) :-
    status(X, upset),
    attribute(X, propriety, Propriety_val), Propriety_val < 50,
    attribute(Y, propriety, Propriety_val), Propriety_val < 50,
    attribute(Y, sensitiveness, Sensitiveness_val), Sensitiveness_val > 50.
rule_effect(sensitive_low_propriety_will_tend_to_emulate_upset_behavior, modify_network(X, Y, emulation, '+', 2)).

rule_likelihood(vain_and_elegant_rich_people_want_others_to_like_and_imitate_them, 1).
rule_type(vain_and_elegant_rich_people_want_others_to_like_and_imitate_them, volition).
% Vain and elegant rich people want others to like and imitate them
rule_active(vain_and_elegant_rich_people_want_others_to_like_and_imitate_them).
rule_category(vain_and_elegant_rich_people_want_others_to_like_and_imitate_them, emulation_imitation).
rule_source(vain_and_elegant_rich_people_want_others_to_like_and_imitate_them, ensemble).
rule_priority(vain_and_elegant_rich_people_want_others_to_like_and_imitate_them, 5).
rule_applies(vain_and_elegant_rich_people_want_others_to_like_and_imitate_them, X, Y) :-
    trait(X, rich),
    trait(X, elegantly_dressed),
    attribute(X, sophistication, Sophistication_val), Sophistication_val > 60,
    trait(X, vain).
rule_effect(vain_and_elegant_rich_people_want_others_to_like_and_imitate_them, modify_network(X, Y, emulation, '+', 5)).
rule_effect(vain_and_elegant_rich_people_want_others_to_like_and_imitate_them, modify_network(X, Y, curiosity, '+', 5)).

rule_likelihood(people_are_likely_to_emulate_others_of_very_high_social_standing, 1).
rule_type(people_are_likely_to_emulate_others_of_very_high_social_standing, volition).
% People are likely to emulate others of very high social standing
rule_active(people_are_likely_to_emulate_others_of_very_high_social_standing).
rule_category(people_are_likely_to_emulate_others_of_very_high_social_standing, emulation_imitation).
rule_source(people_are_likely_to_emulate_others_of_very_high_social_standing, ensemble).
rule_priority(people_are_likely_to_emulate_others_of_very_high_social_standing, 5).
rule_applies(people_are_likely_to_emulate_others_of_very_high_social_standing, X, Y) :-
    attribute(X, social_standing, Social_standing_val), Social_standing_val > 70,
    trait(X, rich),
    attribute(Y, propriety, Propriety_val), Propriety_val > 50.
rule_effect(people_are_likely_to_emulate_others_of_very_high_social_standing, modify_network(X, Y, emulation, '+', 5)).

rule_likelihood(children_may_want_to_imitate_musicians, 1).
rule_type(children_may_want_to_imitate_musicians, volition).
% Children may want to imitate musicians
rule_active(children_may_want_to_imitate_musicians).
rule_category(children_may_want_to_imitate_musicians, emulation_imitation).
rule_source(children_may_want_to_imitate_musicians, ensemble).
rule_priority(children_may_want_to_imitate_musicians, 5).
rule_applies(children_may_want_to_imitate_musicians, X, Y) :-
    trait(X, child),
    trait(Y, musician).
rule_effect(children_may_want_to_imitate_musicians, modify_network(X, Y, emulation, '+', 5)).

