%% Ensemble Volition Rules: general
%% Source: data/ensemble/volitionRules/general.json
%% Converted: 2026-04-02T20:09:49.726Z
%% Total rules: 13

rule_likelihood(beg_when_you_are_hungry, 1).
rule_type(beg_when_you_are_hungry, volition).
% Beg when you are hungry
rule_active(beg_when_you_are_hungry).
rule_category(beg_when_you_are_hungry, general).
rule_source(beg_when_you_are_hungry, ensemble).
rule_priority(beg_when_you_are_hungry, 3).
rule_applies(beg_when_you_are_hungry, X, Y) :-
    status(X, hungry).
rule_effect(beg_when_you_are_hungry, set_intent(X, beg, Y, 3)).

rule_likelihood(being_self_assured_and_appropriate_makes_one_likeable, 1).
rule_type(being_self_assured_and_appropriate_makes_one_likeable, volition).
% Being self assured and appropriate makes one likeable
rule_active(being_self_assured_and_appropriate_makes_one_likeable).
rule_category(being_self_assured_and_appropriate_makes_one_likeable, general).
rule_source(being_self_assured_and_appropriate_makes_one_likeable, ensemble).
rule_priority(being_self_assured_and_appropriate_makes_one_likeable, 1).
rule_applies(being_self_assured_and_appropriate_makes_one_likeable, X, Y) :-
    attribute(X, self_assuredness, Self_assuredness_val), Self_assuredness_val > 50,
    attribute(X, propriety, Propriety_val), Propriety_val > 50.
rule_effect(being_self_assured_and_appropriate_makes_one_likeable, modify_network(Y, X, affinity, '+', 1)).

rule_likelihood(wine_makes_discussion_more_enjoyable, 1).
rule_type(wine_makes_discussion_more_enjoyable, volition).
% Wine makes discussion more enjoyable
rule_active(wine_makes_discussion_more_enjoyable).
rule_category(wine_makes_discussion_more_enjoyable, general).
rule_source(wine_makes_discussion_more_enjoyable, ensemble).
rule_priority(wine_makes_discussion_more_enjoyable, 5).
rule_applies(wine_makes_discussion_more_enjoyable, X, Y) :-
    trait(X, female),
    status(X, inebriated),
    network(X, Y, affinity, Affinity_val), Affinity_val > 60,
    attribute(Y, charisma, Charisma_val), Charisma_val > 60.
rule_effect(wine_makes_discussion_more_enjoyable, modify_network(X, Y, affinity, '+', 5)).
rule_effect(wine_makes_discussion_more_enjoyable, modify_network(Y, X, affinity, '+', 5)).

rule_likelihood(no_greet_and_neutral_for_high_status_dismiss, 1).
rule_type(no_greet_and_neutral_for_high_status_dismiss, volition).
% No Greet and neutral for high status -> dismiss
rule_active(no_greet_and_neutral_for_high_status_dismiss).
rule_category(no_greet_and_neutral_for_high_status_dismiss, general).
rule_source(no_greet_and_neutral_for_high_status_dismiss, ensemble).
rule_priority(no_greet_and_neutral_for_high_status_dismiss, 5).
rule_applies(no_greet_and_neutral_for_high_status_dismiss, X, Y) :-
    event(X, met),
    event(Y, neutral),
    attribute(X, status_individual, Status_individual_val), Status_individual_val > 50.
rule_effect(no_greet_and_neutral_for_high_status_dismiss, set_intent(X, dismiss, Y, 5)).

rule_likelihood(people_may_develop_negative_feelings_towards_strong_individuals_when_they_witness_or_experience_unpleasant_events_involving_them, 1).
rule_type(people_may_develop_negative_feelings_towards_strong_individuals_when_they_witness_or_experience_unpleasant_events_involving_them, volition).
% People may develop negative feelings towards strong individuals when they witness or experience unpleasant events involving them
rule_active(people_may_develop_negative_feelings_towards_strong_individuals_when_they_witness_or_experience_unpleasant_events_involving_them).
rule_category(people_may_develop_negative_feelings_towards_strong_individuals_when_they_witness_or_experience_unpleasant_events_involving_them, general).
rule_source(people_may_develop_negative_feelings_towards_strong_individuals_when_they_witness_or_experience_unpleasant_events_involving_them, ensemble).
rule_priority(people_may_develop_negative_feelings_towards_strong_individuals_when_they_witness_or_experience_unpleasant_events_involving_them, 3).
rule_applies(people_may_develop_negative_feelings_towards_strong_individuals_when_they_witness_or_experience_unpleasant_events_involving_them, X, Y) :-
    event(X, nice).
rule_effect(people_may_develop_negative_feelings_towards_strong_individuals_when_they_witness_or_experience_unpleasant_events_involving_them, set_intent(X, antagonize, Y, -3)).

rule_likelihood(people_may_develop_negative_feelings_towards_strong_individuals_when_they_perceive_them_as_a_threat_within_the_last, 1).
rule_type(people_may_develop_negative_feelings_towards_strong_individuals_when_they_perceive_them_as_a_threat_within_the_last, volition).
% People may develop negative feelings towards strong individuals when they perceive them as a threat within the last
rule_active(people_may_develop_negative_feelings_towards_strong_individuals_when_they_perceive_them_as_a_threat_within_the_last).
rule_category(people_may_develop_negative_feelings_towards_strong_individuals_when_they_perceive_them_as_a_threat_within_the_last, general).
rule_source(people_may_develop_negative_feelings_towards_strong_individuals_when_they_perceive_them_as_a_threat_within_the_last, ensemble).
rule_priority(people_may_develop_negative_feelings_towards_strong_individuals_when_they_perceive_them_as_a_threat_within_the_last, 1).
rule_applies(people_may_develop_negative_feelings_towards_strong_individuals_when_they_perceive_them_as_a_threat_within_the_last, X, Y) :-
    event(X, nice).
rule_effect(people_may_develop_negative_feelings_towards_strong_individuals_when_they_perceive_them_as_a_threat_within_the_last, set_intent(X, antagonize, Y, -2)).

rule_likelihood(people_are_likely_to_be_more_candid_with_those_they_perceive_as_less_altruistic, 1).
rule_type(people_are_likely_to_be_more_candid_with_those_they_perceive_as_less_altruistic, volition).
% People are likely to be more candid with those they perceive as less altruistic.
rule_active(people_are_likely_to_be_more_candid_with_those_they_perceive_as_less_altruistic).
rule_category(people_are_likely_to_be_more_candid_with_those_they_perceive_as_less_altruistic, general).
rule_source(people_are_likely_to_be_more_candid_with_those_they_perceive_as_less_altruistic, ensemble).
rule_priority(people_are_likely_to_be_more_candid_with_those_they_perceive_as_less_altruistic, 1).
rule_applies(people_are_likely_to_be_more_candid_with_those_they_perceive_as_less_altruistic, X, Y) :-
    attribute(X, altruism, Altruism_val), Altruism_val < 7.
rule_effect(people_are_likely_to_be_more_candid_with_those_they_perceive_as_less_altruistic, set_intent(X, candid, Y, -1)).

rule_likelihood(people_with_selfish_traits_seek_out_strong_individuals_as_potential_partners, 1).
rule_type(people_with_selfish_traits_seek_out_strong_individuals_as_potential_partners, volition).
% People with selfish traits seek out strong individuals as potential partners.
rule_active(people_with_selfish_traits_seek_out_strong_individuals_as_potential_partners).
rule_category(people_with_selfish_traits_seek_out_strong_individuals_as_potential_partners, general).
rule_source(people_with_selfish_traits_seek_out_strong_individuals_as_potential_partners, ensemble).
rule_priority(people_with_selfish_traits_seek_out_strong_individuals_as_potential_partners, 1).
rule_applies(people_with_selfish_traits_seek_out_strong_individuals_as_potential_partners, X, Y) :-
    trait(X, selfish).
rule_effect(people_with_selfish_traits_seek_out_strong_individuals_as_potential_partners, set_intent(X, candid, Y, -1)).

rule_likelihood(default_indifference, 1).
rule_type(default_indifference, volition).
% default indifference
rule_active(default_indifference).
rule_category(default_indifference, general).
rule_source(default_indifference, ensemble).
rule_priority(default_indifference, 1).
rule_applies(default_indifference, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val > 5.
rule_effect(default_indifference, set_intent(X, indifferent, Y, 0)).

rule_likelihood(people_seeking_solace_after_a_breakup, 1).
rule_type(people_seeking_solace_after_a_breakup, volition).
% People seeking solace after a breakup
rule_active(people_seeking_solace_after_a_breakup).
rule_category(people_seeking_solace_after_a_breakup, general).
rule_source(people_seeking_solace_after_a_breakup, ensemble).
rule_priority(people_seeking_solace_after_a_breakup, 3).
rule_applies(people_seeking_solace_after_a_breakup, X, Y) :-
    status(X, heartbroken).
rule_effect(people_seeking_solace_after_a_breakup, set_intent(X, trust, Y, -3)).

rule_likelihood(you_are_more_likely_to_act_depressed_if_you_are_depressed, 1).
rule_type(you_are_more_likely_to_act_depressed_if_you_are_depressed, volition).
% You are more likely to act depressed if you are depressed
rule_active(you_are_more_likely_to_act_depressed_if_you_are_depressed).
rule_category(you_are_more_likely_to_act_depressed_if_you_are_depressed, general).
rule_source(you_are_more_likely_to_act_depressed_if_you_are_depressed, ensemble).
rule_priority(you_are_more_likely_to_act_depressed_if_you_are_depressed, 1).
rule_applies(you_are_more_likely_to_act_depressed_if_you_are_depressed, X, Y) :-
    mood(X, depressed).
rule_effect(you_are_more_likely_to_act_depressed_if_you_are_depressed, set_intent(X, depressed, Y, 1)).

rule_likelihood(you_are_more_likely_to_joke_around_if_you_have_high_humor, 1).
rule_type(you_are_more_likely_to_joke_around_if_you_have_high_humor, volition).
% You are more likely to joke around if you have high humor
rule_active(you_are_more_likely_to_joke_around_if_you_have_high_humor).
rule_category(you_are_more_likely_to_joke_around_if_you_have_high_humor, general).
rule_source(you_are_more_likely_to_joke_around_if_you_have_high_humor, ensemble).
rule_priority(you_are_more_likely_to_joke_around_if_you_have_high_humor, 1).
rule_applies(you_are_more_likely_to_joke_around_if_you_have_high_humor, X, Y) :-
    attribute(X, humor, Humor_val), Humor_val > 60.
rule_effect(you_are_more_likely_to_joke_around_if_you_have_high_humor, set_intent(X, jokearound, Y, 1)).

rule_likelihood(people_are_nice_to_those_who_have_been_nice_to_them_recently, 1).
rule_type(people_are_nice_to_those_who_have_been_nice_to_them_recently, volition).
% People are nice to those who have been nice to them recently
rule_active(people_are_nice_to_those_who_have_been_nice_to_them_recently).
rule_category(people_are_nice_to_those_who_have_been_nice_to_them_recently, general).
rule_source(people_are_nice_to_those_who_have_been_nice_to_them_recently, ensemble).
rule_priority(people_are_nice_to_those_who_have_been_nice_to_them_recently, 3).
rule_applies(people_are_nice_to_those_who_have_been_nice_to_them_recently, X, Y) :-
    event(Y, nice).
rule_effect(people_are_nice_to_those_who_have_been_nice_to_them_recently, set_intent(X, kind, Y, 3)).

