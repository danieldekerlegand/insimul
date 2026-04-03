%% Ensemble Volition Rules: virtue-morality
%% Source: data/ensemble/volitionRules/virtue-morality.json
%% Converted: 2026-04-02T20:09:49.730Z
%% Total rules: 15

rule_likelihood(devout_women_have_affinity_for_men_who_show_propriety, 1).
rule_type(devout_women_have_affinity_for_men_who_show_propriety, volition).
% Devout women have affinity for men who show propriety
rule_active(devout_women_have_affinity_for_men_who_show_propriety).
rule_category(devout_women_have_affinity_for_men_who_show_propriety, virtue_morality).
rule_source(devout_women_have_affinity_for_men_who_show_propriety, ensemble).
rule_priority(devout_women_have_affinity_for_men_who_show_propriety, 5).
rule_applies(devout_women_have_affinity_for_men_who_show_propriety, X, Y) :-
    trait(Y, female),
    trait(X, male),
    attribute(X, propriety, Propriety_val), Propriety_val > 50,
    trait(Y, devout).
rule_effect(devout_women_have_affinity_for_men_who_show_propriety, modify_network(Y, X, affinity, '+', 5)).

rule_likelihood(female_poor_virtuous_no_dishonor_to_love, 1).
rule_type(female_poor_virtuous_no_dishonor_to_love, volition).
% female poor virtuous no dishonor to love
rule_active(female_poor_virtuous_no_dishonor_to_love).
rule_category(female_poor_virtuous_no_dishonor_to_love, virtue_morality).
rule_source(female_poor_virtuous_no_dishonor_to_love, ensemble).
rule_priority(female_poor_virtuous_no_dishonor_to_love, 5).
rule_applies(female_poor_virtuous_no_dishonor_to_love, X, Y) :-
    trait(X, female),
    trait(X, poor),
    trait(X, virtuous),
    trait(Y, male).
rule_effect(female_poor_virtuous_no_dishonor_to_love, modify_network(Y, X, affinity, '+', 5)).

rule_likelihood(a_rich_old_man_can_have_an_affinity_for_non_virtuous_young_women, 1).
rule_type(a_rich_old_man_can_have_an_affinity_for_non_virtuous_young_women, volition).
% A rich old man can have an affinity for non-virtuous young women
rule_active(a_rich_old_man_can_have_an_affinity_for_non_virtuous_young_women).
rule_category(a_rich_old_man_can_have_an_affinity_for_non_virtuous_young_women, virtue_morality).
rule_source(a_rich_old_man_can_have_an_affinity_for_non_virtuous_young_women, ensemble).
rule_priority(a_rich_old_man_can_have_an_affinity_for_non_virtuous_young_women, 5).
rule_applies(a_rich_old_man_can_have_an_affinity_for_non_virtuous_young_women, X, Y) :-
    trait(X, female),
    \+ trait(X, old),
    trait(X, poor),
    trait(Y, rich),
    trait(Y, generous),
    \+ trait(X, virtuous).
rule_effect(a_rich_old_man_can_have_an_affinity_for_non_virtuous_young_women, modify_network(Y, X, curiosity, '+', 5)).
rule_effect(a_rich_old_man_can_have_an_affinity_for_non_virtuous_young_women, modify_network(Y, X, affinity, '+', 5)).
rule_effect(a_rich_old_man_can_have_an_affinity_for_non_virtuous_young_women, set_relationship(Y, X, ally, 5)).

rule_likelihood(the_clergy_disapproves_of_improper_speech, 1).
rule_type(the_clergy_disapproves_of_improper_speech, volition).
% The clergy disapproves of improper speech
rule_active(the_clergy_disapproves_of_improper_speech).
rule_category(the_clergy_disapproves_of_improper_speech, virtue_morality).
rule_source(the_clergy_disapproves_of_improper_speech, ensemble).
rule_priority(the_clergy_disapproves_of_improper_speech, 5).
rule_applies(the_clergy_disapproves_of_improper_speech, X, Y) :-
    attribute(X, propriety, Propriety_val), Propriety_val < 50,
    trait(Y, clergy),
    trait(X, indiscreet),
    trait(Y, devout).
rule_effect(the_clergy_disapproves_of_improper_speech, modify_network(Y, X, affinity, '+', 5)).

rule_likelihood(a_virtuous_beautiful_poor_girl_does_not_affinity_for_man, 1).
rule_type(a_virtuous_beautiful_poor_girl_does_not_affinity_for_man, volition).
% A virtuous beautiful poor girl does not affinity for man
rule_active(a_virtuous_beautiful_poor_girl_does_not_affinity_for_man).
rule_category(a_virtuous_beautiful_poor_girl_does_not_affinity_for_man, virtue_morality).
rule_source(a_virtuous_beautiful_poor_girl_does_not_affinity_for_man, ensemble).
rule_priority(a_virtuous_beautiful_poor_girl_does_not_affinity_for_man, 1).
rule_applies(a_virtuous_beautiful_poor_girl_does_not_affinity_for_man, X, Y) :-
    trait(X, female),
    trait(X, poor),
    trait(X, beautiful),
    trait(Y, male),
    trait(X, virtuous).
rule_effect(a_virtuous_beautiful_poor_girl_does_not_affinity_for_man, modify_network(X, Y, affinity, '-', 2)).
rule_effect(a_virtuous_beautiful_poor_girl_does_not_affinity_for_man, modify_network(X, Y, curiosity, '-', 2)).

rule_likelihood(kind_virtuous_sensitive_women_have_increased_affinity_for_shy_men, 1).
rule_type(kind_virtuous_sensitive_women_have_increased_affinity_for_shy_men, volition).
% Kind, virtuous, sensitive women have increased affinity for shy men
rule_active(kind_virtuous_sensitive_women_have_increased_affinity_for_shy_men).
rule_category(kind_virtuous_sensitive_women_have_increased_affinity_for_shy_men, virtue_morality).
rule_source(kind_virtuous_sensitive_women_have_increased_affinity_for_shy_men, ensemble).
rule_priority(kind_virtuous_sensitive_women_have_increased_affinity_for_shy_men, 3).
rule_applies(kind_virtuous_sensitive_women_have_increased_affinity_for_shy_men, X, Y) :-
    attribute(X, sensitiveness, Sensitiveness_val), Sensitiveness_val > 60,
    trait(X, kind),
    trait(X, virtuous),
    trait(Y, shy),
    trait(Y, male),
    trait(X, female).
rule_effect(kind_virtuous_sensitive_women_have_increased_affinity_for_shy_men, modify_network(X, Y, affinity, '+', 3)).
rule_effect(kind_virtuous_sensitive_women_have_increased_affinity_for_shy_men, modify_network(Y, X, curiosity, '+', 3)).

rule_likelihood(being_talkative_and_deceitful_is_annoying_to_virtuous_people, 1).
rule_type(being_talkative_and_deceitful_is_annoying_to_virtuous_people, volition).
% Being talkative and deceitful is annoying to virtuous people
rule_active(being_talkative_and_deceitful_is_annoying_to_virtuous_people).
rule_category(being_talkative_and_deceitful_is_annoying_to_virtuous_people, virtue_morality).
rule_source(being_talkative_and_deceitful_is_annoying_to_virtuous_people, ensemble).
rule_priority(being_talkative_and_deceitful_is_annoying_to_virtuous_people, 3).
rule_applies(being_talkative_and_deceitful_is_annoying_to_virtuous_people, X, Y) :-
    trait(X, deceitful),
    trait(X, talkative),
    trait(Y, virtuous).
rule_effect(being_talkative_and_deceitful_is_annoying_to_virtuous_people, modify_network(X, Y, affinity, '+', 2)).
rule_effect(being_talkative_and_deceitful_is_annoying_to_virtuous_people, modify_network(Y, 'z', emulation, '+', 3)).

rule_likelihood(people_seek_companions_with_higher_social_standing_when_their_own_honor_is_moderately_low, 1).
rule_type(people_seek_companions_with_higher_social_standing_when_their_own_honor_is_moderately_low, volition).
% People seek companions with higher social standing when their own honor is moderately low.
rule_active(people_seek_companions_with_higher_social_standing_when_their_own_honor_is_moderately_low).
rule_category(people_seek_companions_with_higher_social_standing_when_their_own_honor_is_moderately_low, virtue_morality).
rule_source(people_seek_companions_with_higher_social_standing_when_their_own_honor_is_moderately_low, ensemble).
rule_priority(people_seek_companions_with_higher_social_standing_when_their_own_honor_is_moderately_low, 1).
rule_applies(people_seek_companions_with_higher_social_standing_when_their_own_honor_is_moderately_low, X, Y) :-
    attribute(X, honor, Honor_val), Honor_val < 7.
rule_effect(people_seek_companions_with_higher_social_standing_when_their_own_honor_is_moderately_low, set_intent(X, candid, Y, -2)).

rule_likelihood(people_seek_companionship_with_individuals_of_higher_honor_status, 1).
rule_type(people_seek_companionship_with_individuals_of_higher_honor_status, volition).
% People seek companionship with individuals of higher honor status.
rule_active(people_seek_companionship_with_individuals_of_higher_honor_status).
rule_category(people_seek_companionship_with_individuals_of_higher_honor_status, virtue_morality).
rule_source(people_seek_companionship_with_individuals_of_higher_honor_status, ensemble).
rule_priority(people_seek_companionship_with_individuals_of_higher_honor_status, 1).
rule_applies(people_seek_companionship_with_individuals_of_higher_honor_status, X, Y) :-
    attribute(X, honor, Honor_val), Honor_val > 12.
rule_effect(people_seek_companionship_with_individuals_of_higher_honor_status, set_intent(X, favor, Y, 2)).

rule_likelihood(people_desire_to_honor_strong_individuals_in_their_social_network, 1).
rule_type(people_desire_to_honor_strong_individuals_in_their_social_network, volition).
% People desire to honor strong individuals in their social network.
rule_active(people_desire_to_honor_strong_individuals_in_their_social_network).
rule_category(people_desire_to_honor_strong_individuals_in_their_social_network, virtue_morality).
rule_source(people_desire_to_honor_strong_individuals_in_their_social_network, ensemble).
rule_priority(people_desire_to_honor_strong_individuals_in_their_social_network, 1).
rule_applies(people_desire_to_honor_strong_individuals_in_their_social_network, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val > 6.
rule_effect(people_desire_to_honor_strong_individuals_in_their_social_network, set_intent(X, honor, Y, 2)).

rule_likelihood(people_seek_to_increase_their_honor_by_associating_with_individuals_of_higher_honor, 1).
rule_type(people_seek_to_increase_their_honor_by_associating_with_individuals_of_higher_honor, volition).
% People seek to increase their honor by associating with individuals of higher honor.
rule_active(people_seek_to_increase_their_honor_by_associating_with_individuals_of_higher_honor).
rule_category(people_seek_to_increase_their_honor_by_associating_with_individuals_of_higher_honor, virtue_morality).
rule_source(people_seek_to_increase_their_honor_by_associating_with_individuals_of_higher_honor, ensemble).
rule_priority(people_seek_to_increase_their_honor_by_associating_with_individuals_of_higher_honor, 5).
rule_applies(people_seek_to_increase_their_honor_by_associating_with_individuals_of_higher_honor, X, Y) :-
    attribute(X, honor, Honor_val), Honor_val < 7.
rule_effect(people_seek_to_increase_their_honor_by_associating_with_individuals_of_higher_honor, set_intent(X, honor, Y, -5)).

rule_likelihood(people_seek_to_increase_their_social_honor_by_associating_with_individuals_of_higher_status, 1).
rule_type(people_seek_to_increase_their_social_honor_by_associating_with_individuals_of_higher_status, volition).
% People seek to increase their social honor by associating with individuals of higher status.
rule_active(people_seek_to_increase_their_social_honor_by_associating_with_individuals_of_higher_status).
rule_category(people_seek_to_increase_their_social_honor_by_associating_with_individuals_of_higher_status, virtue_morality).
rule_source(people_seek_to_increase_their_social_honor_by_associating_with_individuals_of_higher_status, ensemble).
rule_priority(people_seek_to_increase_their_social_honor_by_associating_with_individuals_of_higher_status, 5).
rule_applies(people_seek_to_increase_their_social_honor_by_associating_with_individuals_of_higher_status, X, Y) :-
    attribute(X, honor, Honor_val), Honor_val > 12.
rule_effect(people_seek_to_increase_their_social_honor_by_associating_with_individuals_of_higher_status, set_intent(X, honor, Y, 5)).

rule_likelihood(people_seek_companionship_with_individuals_of_higher_honor_status, 1).
rule_type(people_seek_companionship_with_individuals_of_higher_honor_status, volition).
% People seek companionship with individuals of higher honor status.
rule_active(people_seek_companionship_with_individuals_of_higher_honor_status).
rule_category(people_seek_companionship_with_individuals_of_higher_honor_status, virtue_morality).
rule_source(people_seek_companionship_with_individuals_of_higher_honor_status, ensemble).
rule_priority(people_seek_companionship_with_individuals_of_higher_honor_status, 1).
rule_applies(people_seek_companionship_with_individuals_of_higher_honor_status, X, Y) :-
    attribute(X, honor, Honor_val), Honor_val > 12.
rule_effect(people_seek_companionship_with_individuals_of_higher_honor_status, set_intent(X, kind, Y, 1)).

rule_likelihood(people_seek_companionship_with_individuals_of_higher_honor_status, 1).
rule_type(people_seek_companionship_with_individuals_of_higher_honor_status, volition).
% People seek companionship with individuals of higher honor status.
rule_active(people_seek_companionship_with_individuals_of_higher_honor_status).
rule_category(people_seek_companionship_with_individuals_of_higher_honor_status, virtue_morality).
rule_source(people_seek_companionship_with_individuals_of_higher_honor_status, ensemble).
rule_priority(people_seek_companionship_with_individuals_of_higher_honor_status, 1).
rule_applies(people_seek_companionship_with_individuals_of_higher_honor_status, X, Y) :-
    attribute(X, honor, Honor_val), Honor_val < 7.
rule_effect(people_seek_companionship_with_individuals_of_higher_honor_status, set_intent(X, manipulate, Y, 2)).

rule_likelihood(people_seek_to_influence_their_social_circle_by_associating_with_individuals_of_higher_honor, 1).
rule_type(people_seek_to_influence_their_social_circle_by_associating_with_individuals_of_higher_honor, volition).
% People seek to influence their social circle by associating with individuals of higher honor.
rule_active(people_seek_to_influence_their_social_circle_by_associating_with_individuals_of_higher_honor).
rule_category(people_seek_to_influence_their_social_circle_by_associating_with_individuals_of_higher_honor, virtue_morality).
rule_source(people_seek_to_influence_their_social_circle_by_associating_with_individuals_of_higher_honor, ensemble).
rule_priority(people_seek_to_influence_their_social_circle_by_associating_with_individuals_of_higher_honor, 1).
rule_applies(people_seek_to_influence_their_social_circle_by_associating_with_individuals_of_higher_honor, X, Y) :-
    attribute(X, honor, Honor_val), Honor_val > 12.
rule_effect(people_seek_to_influence_their_social_circle_by_associating_with_individuals_of_higher_honor, set_intent(X, manipulate, Y, -2)).

