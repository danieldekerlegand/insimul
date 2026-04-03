%% Ensemble Volition Rules: personality-traits
%% Source: data/ensemble/volitionRules/personality-traits.json
%% Converted: 2026-04-02T20:09:49.728Z
%% Total rules: 20

rule_likelihood(young_children_may_find_joy_in_spending_time_with_caring_adults, 1).
rule_type(young_children_may_find_joy_in_spending_time_with_caring_adults, volition).
% Young children may find joy in spending time with caring adults
rule_active(young_children_may_find_joy_in_spending_time_with_caring_adults).
rule_category(young_children_may_find_joy_in_spending_time_with_caring_adults, personality_traits).
rule_source(young_children_may_find_joy_in_spending_time_with_caring_adults, ensemble).
rule_priority(young_children_may_find_joy_in_spending_time_with_caring_adults, 5).
rule_applies(young_children_may_find_joy_in_spending_time_with_caring_adults, X, Y) :-
    trait(X, child),
    directed_status(Y, X, cares_for),
    \+ trait(Y, child).
rule_effect(young_children_may_find_joy_in_spending_time_with_caring_adults, modify_network(X, Y, affinity, '+', 5)).

rule_likelihood(a_young_and_shy_man_may_be_less_enterprising_toward_women, 1).
rule_type(a_young_and_shy_man_may_be_less_enterprising_toward_women, volition).
% A young and shy man may be less enterprising toward women
rule_active(a_young_and_shy_man_may_be_less_enterprising_toward_women).
rule_category(a_young_and_shy_man_may_be_less_enterprising_toward_women, personality_traits).
rule_source(a_young_and_shy_man_may_be_less_enterprising_toward_women, ensemble).
rule_priority(a_young_and_shy_man_may_be_less_enterprising_toward_women, 5).
rule_applies(a_young_and_shy_man_may_be_less_enterprising_toward_women, X, Y) :-
    trait(X, young),
    trait(X, male),
    trait(X, shy),
    trait(Y, female).
rule_effect(a_young_and_shy_man_may_be_less_enterprising_toward_women, modify_network(X, Y, curiosity, '-', 5)).

rule_likelihood(you_are_more_likely_to_be_humble_if_you_are_depressed, 1).
rule_type(you_are_more_likely_to_be_humble_if_you_are_depressed, volition).
% You are more likely to be humble if you are depressed
rule_active(you_are_more_likely_to_be_humble_if_you_are_depressed).
rule_category(you_are_more_likely_to_be_humble_if_you_are_depressed, personality_traits).
rule_source(you_are_more_likely_to_be_humble_if_you_are_depressed, ensemble).
rule_priority(you_are_more_likely_to_be_humble_if_you_are_depressed, 1).
rule_applies(you_are_more_likely_to_be_humble_if_you_are_depressed, X, Y) :-
    mood(X, depressed).
rule_effect(you_are_more_likely_to_be_humble_if_you_are_depressed, set_intent(X, humble, Y, 1)).

rule_likelihood(people_are_less_kind_to_people_they_haven_t_met, 1).
rule_type(people_are_less_kind_to_people_they_haven_t_met, volition).
% People are less kind to people they haven’t met
rule_active(people_are_less_kind_to_people_they_haven_t_met).
rule_category(people_are_less_kind_to_people_they_haven_t_met, personality_traits).
rule_source(people_are_less_kind_to_people_they_haven_t_met, ensemble).
rule_priority(people_are_less_kind_to_people_they_haven_t_met, 3).
rule_applies(people_are_less_kind_to_people_they_haven_t_met, X, Y) :-
    \+ relationship(X, Y, met).
rule_effect(people_are_less_kind_to_people_they_haven_t_met, set_intent(X, kind, Y, -4)).

rule_likelihood(people_are_less_kind_to_those_they_are_unattracted_to, 1).
rule_type(people_are_less_kind_to_those_they_are_unattracted_to, volition).
% People are less kind to those they are unattracted to
rule_active(people_are_less_kind_to_those_they_are_unattracted_to).
rule_category(people_are_less_kind_to_those_they_are_unattracted_to, personality_traits).
rule_source(people_are_less_kind_to_those_they_are_unattracted_to, ensemble).
rule_priority(people_are_less_kind_to_those_they_are_unattracted_to, 1).
rule_applies(people_are_less_kind_to_those_they_are_unattracted_to, X, Y) :-
    network(X, Y, attraction, Attraction_val), Attraction_val < 4.
rule_effect(people_are_less_kind_to_those_they_are_unattracted_to, set_intent(X, kind, Y, -1)).

rule_likelihood(people_are_a_very_kind_to_those_they_are_very_attracted_to, 1).
rule_type(people_are_a_very_kind_to_those_they_are_very_attracted_to, volition).
% People are a very kind to those they are very attracted to
rule_active(people_are_a_very_kind_to_those_they_are_very_attracted_to).
rule_category(people_are_a_very_kind_to_those_they_are_very_attracted_to, personality_traits).
rule_source(people_are_a_very_kind_to_those_they_are_very_attracted_to, ensemble).
rule_priority(people_are_a_very_kind_to_those_they_are_very_attracted_to, 3).
rule_applies(people_are_a_very_kind_to_those_they_are_very_attracted_to, X, Y) :-
    network(X, Y, attraction, Attraction_val), Attraction_val > 7.
rule_effect(people_are_a_very_kind_to_those_they_are_very_attracted_to, set_intent(X, kind, Y, 3)).

rule_likelihood(loyal_people_are_kind, 1).
rule_type(loyal_people_are_kind, volition).
% Loyal people are kind
rule_active(loyal_people_are_kind).
rule_category(loyal_people_are_kind, personality_traits).
rule_source(loyal_people_are_kind, ensemble).
rule_priority(loyal_people_are_kind, 1).
rule_applies(loyal_people_are_kind, X, Y) :-
    trait(X, loyal).
rule_effect(loyal_people_are_kind, set_intent(X, kind, Y, 1)).

rule_likelihood(shy_people_are_less_kind, 1).
rule_type(shy_people_are_less_kind, volition).
% Shy people are less kind
rule_active(shy_people_are_less_kind).
rule_category(shy_people_are_less_kind, personality_traits).
rule_source(shy_people_are_less_kind, ensemble).
rule_priority(shy_people_are_less_kind, 1).
rule_applies(shy_people_are_less_kind, X, Y) :-
    trait(X, shy).
rule_effect(shy_people_are_less_kind, set_intent(X, kind, Y, -1)).

rule_likelihood(jerks_are_much_less_likely_to_be_kind, 1).
rule_type(jerks_are_much_less_likely_to_be_kind, volition).
% Jerks are much less likely to be kind
rule_active(jerks_are_much_less_likely_to_be_kind).
rule_category(jerks_are_much_less_likely_to_be_kind, personality_traits).
rule_source(jerks_are_much_less_likely_to_be_kind, ensemble).
rule_priority(jerks_are_much_less_likely_to_be_kind, 3).
rule_applies(jerks_are_much_less_likely_to_be_kind, X, Y) :-
    trait(X, jerk).
rule_effect(jerks_are_much_less_likely_to_be_kind, set_intent(X, kind, Y, -4)).

rule_likelihood(fans_of_the_restaurant_are_kind_because_they_are_in_a_good_mood_at_the_restaurant, 1).
rule_type(fans_of_the_restaurant_are_kind_because_they_are_in_a_good_mood_at_the_restaurant, volition).
% Fans of the restaurant are kind because they are in a good mood at the restaurant
rule_active(fans_of_the_restaurant_are_kind_because_they_are_in_a_good_mood_at_the_restaurant).
rule_category(fans_of_the_restaurant_are_kind_because_they_are_in_a_good_mood_at_the_restaurant, personality_traits).
rule_source(fans_of_the_restaurant_are_kind_because_they_are_in_a_good_mood_at_the_restaurant, ensemble).
rule_priority(fans_of_the_restaurant_are_kind_because_they_are_in_a_good_mood_at_the_restaurant, 1).
rule_applies(fans_of_the_restaurant_are_kind_because_they_are_in_a_good_mood_at_the_restaurant, X, Y) :-
    status(X, fan_of_restaurant).
rule_effect(fans_of_the_restaurant_are_kind_because_they_are_in_a_good_mood_at_the_restaurant, set_intent(X, kind, Y, 2)).

rule_likelihood(people_are_less_kind_to_those_who_have_been_rude_to_them_recently, 1).
rule_type(people_are_less_kind_to_those_who_have_been_rude_to_them_recently, volition).
% People are less kind to those who have been rude to them recently
rule_active(people_are_less_kind_to_those_who_have_been_rude_to_them_recently).
rule_category(people_are_less_kind_to_those_who_have_been_rude_to_them_recently, personality_traits).
rule_source(people_are_less_kind_to_those_who_have_been_rude_to_them_recently, ensemble).
rule_priority(people_are_less_kind_to_those_who_have_been_rude_to_them_recently, 3).
rule_applies(people_are_less_kind_to_those_who_have_been_rude_to_them_recently, X, Y) :-
    event(Y, rude).
rule_effect(people_are_less_kind_to_those_who_have_been_rude_to_them_recently, set_intent(X, kind, Y, -3)).

rule_likelihood(people_are_more_rude_to_people_they_haven_t_met, 1).
rule_type(people_are_more_rude_to_people_they_haven_t_met, volition).
% People are more rude to people they haven’t met
rule_active(people_are_more_rude_to_people_they_haven_t_met).
rule_category(people_are_more_rude_to_people_they_haven_t_met, personality_traits).
rule_source(people_are_more_rude_to_people_they_haven_t_met, ensemble).
rule_priority(people_are_more_rude_to_people_they_haven_t_met, 1).
rule_applies(people_are_more_rude_to_people_they_haven_t_met, X, Y) :-
    \+ relationship(X, Y, met).
rule_effect(people_are_more_rude_to_people_they_haven_t_met, set_intent(X, rude, Y, 2)).

rule_likelihood(people_are_a_little_more_rude_to_those_they_are_unattracted_to, 1).
rule_type(people_are_a_little_more_rude_to_those_they_are_unattracted_to, volition).
% People are a little more rude to those they are unattracted to
rule_active(people_are_a_little_more_rude_to_those_they_are_unattracted_to).
rule_category(people_are_a_little_more_rude_to_those_they_are_unattracted_to, personality_traits).
rule_source(people_are_a_little_more_rude_to_those_they_are_unattracted_to, ensemble).
rule_priority(people_are_a_little_more_rude_to_those_they_are_unattracted_to, 1).
rule_applies(people_are_a_little_more_rude_to_those_they_are_unattracted_to, X, Y) :-
    network(X, Y, attraction, Attraction_val), Attraction_val < 4.
rule_effect(people_are_a_little_more_rude_to_those_they_are_unattracted_to, set_intent(X, rude, Y, 1)).

rule_likelihood(people_are_much_less_rude_to_those_that_they_are_attracted_to, 1).
rule_type(people_are_much_less_rude_to_those_that_they_are_attracted_to, volition).
% People are much less rude to those that they are attracted to
rule_active(people_are_much_less_rude_to_those_that_they_are_attracted_to).
rule_category(people_are_much_less_rude_to_those_that_they_are_attracted_to, personality_traits).
rule_source(people_are_much_less_rude_to_those_that_they_are_attracted_to, ensemble).
rule_priority(people_are_much_less_rude_to_those_that_they_are_attracted_to, 5).
rule_applies(people_are_much_less_rude_to_those_that_they_are_attracted_to, X, Y) :-
    network(X, Y, attraction, Attraction_val), Attraction_val > 7.
rule_effect(people_are_much_less_rude_to_those_that_they_are_attracted_to, set_intent(X, rude, Y, -5)).

rule_likelihood(loyal_people_are_less_rude, 1).
rule_type(loyal_people_are_less_rude, volition).
% Loyal people are less rude
rule_active(loyal_people_are_less_rude).
rule_category(loyal_people_are_less_rude, personality_traits).
rule_source(loyal_people_are_less_rude, ensemble).
rule_priority(loyal_people_are_less_rude, 1).
rule_applies(loyal_people_are_less_rude, X, Y) :-
    trait(X, loyal).
rule_effect(loyal_people_are_less_rude, set_intent(X, rude, Y, -1)).

rule_likelihood(shy_people_are_less_rude, 1).
rule_type(shy_people_are_less_rude, volition).
% Shy people are less rude
rule_active(shy_people_are_less_rude).
rule_category(shy_people_are_less_rude, personality_traits).
rule_source(shy_people_are_less_rude, ensemble).
rule_priority(shy_people_are_less_rude, 1).
rule_applies(shy_people_are_less_rude, X, Y) :-
    trait(X, shy).
rule_effect(shy_people_are_less_rude, set_intent(X, rude, Y, -2)).

rule_likelihood(jerks_are_very_rude, 1).
rule_type(jerks_are_very_rude, volition).
% Jerks are very rude
rule_active(jerks_are_very_rude).
rule_category(jerks_are_very_rude, personality_traits).
rule_source(jerks_are_very_rude, ensemble).
rule_priority(jerks_are_very_rude, 3).
rule_applies(jerks_are_very_rude, X, Y) :-
    trait(X, jerk).
rule_effect(jerks_are_very_rude, set_intent(X, rude, Y, 4)).

rule_likelihood(fans_of_the_restaurant_are_less_rude, 1).
rule_type(fans_of_the_restaurant_are_less_rude, volition).
% Fans of the restaurant are less rude
rule_active(fans_of_the_restaurant_are_less_rude).
rule_category(fans_of_the_restaurant_are_less_rude, personality_traits).
rule_source(fans_of_the_restaurant_are_less_rude, ensemble).
rule_priority(fans_of_the_restaurant_are_less_rude, 1).
rule_applies(fans_of_the_restaurant_are_less_rude, X, Y) :-
    status(X, fan_of_restaurant).
rule_effect(fans_of_the_restaurant_are_less_rude, set_intent(X, rude, Y, -2)).

rule_likelihood(people_are_less_rude_to_those_who_have_been_nice_to_them_recently, 1).
rule_type(people_are_less_rude_to_those_who_have_been_nice_to_them_recently, volition).
% People are less rude to those who have been nice to them recently
rule_active(people_are_less_rude_to_those_who_have_been_nice_to_them_recently).
rule_category(people_are_less_rude_to_those_who_have_been_nice_to_them_recently, personality_traits).
rule_source(people_are_less_rude_to_those_who_have_been_nice_to_them_recently, ensemble).
rule_priority(people_are_less_rude_to_those_who_have_been_nice_to_them_recently, 1).
rule_applies(people_are_less_rude_to_those_who_have_been_nice_to_them_recently, X, Y) :-
    event(Y, nice).
rule_effect(people_are_less_rude_to_those_who_have_been_nice_to_them_recently, set_intent(X, rude, Y, -2)).

rule_likelihood(people_are_more_rude_to_those_who_have_been_rude_to_them_recently, 1).
rule_type(people_are_more_rude_to_those_who_have_been_rude_to_them_recently, volition).
% People are more rude to those who have been rude to them recently
rule_active(people_are_more_rude_to_those_who_have_been_rude_to_them_recently).
rule_category(people_are_more_rude_to_those_who_have_been_rude_to_them_recently, personality_traits).
rule_source(people_are_more_rude_to_those_who_have_been_rude_to_them_recently, ensemble).
rule_priority(people_are_more_rude_to_those_who_have_been_rude_to_them_recently, 3).
rule_applies(people_are_more_rude_to_those_who_have_been_rude_to_them_recently, X, Y) :-
    event(Y, rude).
rule_effect(people_are_more_rude_to_those_who_have_been_rude_to_them_recently, set_intent(X, rude, Y, 4)).




