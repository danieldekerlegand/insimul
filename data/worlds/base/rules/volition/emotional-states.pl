%% Ensemble Volition Rules: emotional-states
%% Source: data/ensemble/volitionRules/emotional-states.json
%% Converted: 2026-04-02T20:09:49.725Z
%% Total rules: 10

rule_likelihood(hangry, 1).
rule_type(hangry, volition).
% Hangry
rule_active(hangry).
rule_category(hangry, emotional_states).
rule_source(hangry, ensemble).
rule_priority(hangry, 1).
rule_applies(hangry, X, Y) :-
    status(X, hungry).
rule_effect(hangry, set_intent(X, fight, Y, 2)).

rule_likelihood(vain_indifferent_people_do_not_care_about_upset_sensitive_people, 1).
rule_type(vain_indifferent_people_do_not_care_about_upset_sensitive_people, volition).
% Vain, indifferent people do not care about upset, sensitive people
rule_active(vain_indifferent_people_do_not_care_about_upset_sensitive_people).
rule_category(vain_indifferent_people_do_not_care_about_upset_sensitive_people, emotional_states).
rule_source(vain_indifferent_people_do_not_care_about_upset_sensitive_people, ensemble).
rule_priority(vain_indifferent_people_do_not_care_about_upset_sensitive_people, 5).
rule_applies(vain_indifferent_people_do_not_care_about_upset_sensitive_people, X, Y) :-
    attribute(X, sensitiveness, Sensitiveness_val), Sensitiveness_val < 50,
    trait(X, indifferent),
    trait(X, vain),
    attribute(Y, sensitiveness, Sensitiveness_val), Sensitiveness_val > 60,
    status(Y, upset).
rule_effect(vain_indifferent_people_do_not_care_about_upset_sensitive_people, modify_network(X, Y, affinity, '-', 5)).
rule_effect(vain_indifferent_people_do_not_care_about_upset_sensitive_people, modify_network(X, Y, curiosity, '+', 5)).

rule_likelihood(unhappy_upset_people_may_seek_kind_sensitive_people, 1).
rule_type(unhappy_upset_people_may_seek_kind_sensitive_people, volition).
% Unhappy, upset people may seek kind, sensitive people
rule_active(unhappy_upset_people_may_seek_kind_sensitive_people).
rule_category(unhappy_upset_people_may_seek_kind_sensitive_people, emotional_states).
rule_source(unhappy_upset_people_may_seek_kind_sensitive_people, ensemble).
rule_priority(unhappy_upset_people_may_seek_kind_sensitive_people, 3).
rule_applies(unhappy_upset_people_may_seek_kind_sensitive_people, X, Y) :-
    \+ status(X, happy),
    trait(Y, kind),
    status(X, upset),
    attribute(Y, sensitiveness, Sensitiveness_val), Sensitiveness_val > 50.
rule_effect(unhappy_upset_people_may_seek_kind_sensitive_people, modify_network(X, Y, affinity, '+', 3)).
rule_effect(unhappy_upset_people_may_seek_kind_sensitive_people, modify_network(X, Y, curiosity, '+', 3)).
rule_effect(unhappy_upset_people_may_seek_kind_sensitive_people, modify_network(Y, X, affinity, '+', 3)).

rule_likelihood(people_feel_candid_towards_strong_individuals_when_they_are_embarrassed, 1).
rule_type(people_feel_candid_towards_strong_individuals_when_they_are_embarrassed, volition).
% People feel candid towards strong individuals when they are embarrassed.
rule_active(people_feel_candid_towards_strong_individuals_when_they_are_embarrassed).
rule_category(people_feel_candid_towards_strong_individuals_when_they_are_embarrassed, emotional_states).
rule_source(people_feel_candid_towards_strong_individuals_when_they_are_embarrassed, ensemble).
rule_priority(people_feel_candid_towards_strong_individuals_when_they_are_embarrassed, 1).
rule_applies(people_feel_candid_towards_strong_individuals_when_they_are_embarrassed, X, Y) :-
    status(X, embarrassed).
rule_effect(people_feel_candid_towards_strong_individuals_when_they_are_embarrassed, set_intent(X, candid, Y, 1)).

rule_likelihood(people_desire_to_become_more_candid_with_those_they_are_embarrassed_by_within_a_short_timeframe, 1).
rule_type(people_desire_to_become_more_candid_with_those_they_are_embarrassed_by_within_a_short_timeframe, volition).
% People desire to become more candid with those they are embarrassed by within a short timeframe
rule_active(people_desire_to_become_more_candid_with_those_they_are_embarrassed_by_within_a_short_timeframe).
rule_category(people_desire_to_become_more_candid_with_those_they_are_embarrassed_by_within_a_short_timeframe, emotional_states).
rule_source(people_desire_to_become_more_candid_with_those_they_are_embarrassed_by_within_a_short_timeframe, ensemble).
rule_priority(people_desire_to_become_more_candid_with_those_they_are_embarrassed_by_within_a_short_timeframe, 1).
rule_applies(people_desire_to_become_more_candid_with_those_they_are_embarrassed_by_within_a_short_timeframe, X, Y) :-
    event(X, embarrassment).
rule_effect(people_desire_to_become_more_candid_with_those_they_are_embarrassed_by_within_a_short_timeframe, set_intent(X, candid, Y, 2)).

rule_likelihood(people_seek_candid_relationships_after_feeling_embarrassed_by_others_opinions, 1).
rule_type(people_seek_candid_relationships_after_feeling_embarrassed_by_others_opinions, volition).
% People seek candid relationships after feeling embarrassed by others’ opinions.
rule_active(people_seek_candid_relationships_after_feeling_embarrassed_by_others_opinions).
rule_category(people_seek_candid_relationships_after_feeling_embarrassed_by_others_opinions, emotional_states).
rule_source(people_seek_candid_relationships_after_feeling_embarrassed_by_others_opinions, ensemble).
rule_priority(people_seek_candid_relationships_after_feeling_embarrassed_by_others_opinions, 1).
rule_applies(people_seek_candid_relationships_after_feeling_embarrassed_by_others_opinions, X, Y) :-
    event(X, embarrassment).
rule_effect(people_seek_candid_relationships_after_feeling_embarrassed_by_others_opinions, set_intent(X, candid, Y, 1)).

rule_likelihood(you_are_more_likely_to_joke_around_when_you_are_happy, 1).
rule_type(you_are_more_likely_to_joke_around_when_you_are_happy, volition).
% You are more likely to joke around when you are happy
rule_active(you_are_more_likely_to_joke_around_when_you_are_happy).
rule_category(you_are_more_likely_to_joke_around_when_you_are_happy, emotional_states).
rule_source(you_are_more_likely_to_joke_around_when_you_are_happy, ensemble).
rule_priority(you_are_more_likely_to_joke_around_when_you_are_happy, 1).
rule_applies(you_are_more_likely_to_joke_around_when_you_are_happy, X, Y) :-
    attribute(X, happiness, Happiness_val), Happiness_val > 70.
rule_effect(you_are_more_likely_to_joke_around_when_you_are_happy, set_intent(X, jokearound, Y, 1)).

rule_likelihood(people_are_much_less_kind_when_they_are_hangry, 1).
rule_type(people_are_much_less_kind_when_they_are_hangry, volition).
% People are much less kind when they are hangry
rule_active(people_are_much_less_kind_when_they_are_hangry).
rule_category(people_are_much_less_kind_when_they_are_hangry, emotional_states).
rule_source(people_are_much_less_kind_when_they_are_hangry, ensemble).
rule_priority(people_are_much_less_kind_when_they_are_hangry, 3).
rule_applies(people_are_much_less_kind_when_they_are_hangry, X, Y) :-
    status(X, hangry).
rule_effect(people_are_much_less_kind_when_they_are_hangry, set_intent(X, kind, Y, -4)).

rule_likelihood(hangry_people_are_very_rude, 1).
rule_type(hangry_people_are_very_rude, volition).
% Hangry people are very rude
rule_active(hangry_people_are_very_rude).
rule_category(hangry_people_are_very_rude, emotional_states).
rule_source(hangry_people_are_very_rude, ensemble).
rule_priority(hangry_people_are_very_rude, 5).
rule_applies(hangry_people_are_very_rude, X, Y) :-
    status(X, hangry).
rule_effect(hangry_people_are_very_rude, set_intent(X, rude, Y, 5)).

rule_likelihood(people_are_more_rude_to_those_who_have_embarrassed_themself_in_front_of_them_recently, 1).
rule_type(people_are_more_rude_to_those_who_have_embarrassed_themself_in_front_of_them_recently, volition).
% People are more rude to those who have embarrassed themself in front of them recently
rule_active(people_are_more_rude_to_those_who_have_embarrassed_themself_in_front_of_them_recently).
rule_category(people_are_more_rude_to_those_who_have_embarrassed_themself_in_front_of_them_recently, emotional_states).
rule_source(people_are_more_rude_to_those_who_have_embarrassed_themself_in_front_of_them_recently, ensemble).
rule_priority(people_are_more_rude_to_those_who_have_embarrassed_themself_in_front_of_them_recently, 1).
rule_applies(people_are_more_rude_to_those_who_have_embarrassed_themself_in_front_of_them_recently, X, Y) :-
    event(Y, embarrassment).
rule_effect(people_are_more_rude_to_those_who_have_embarrassed_themself_in_front_of_them_recently, set_intent(X, rude, Y, 2)).




