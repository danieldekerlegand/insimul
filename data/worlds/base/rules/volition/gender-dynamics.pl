%% Ensemble Volition Rules: gender-dynamics
%% Source: data/ensemble/volitionRules/gender-dynamics.json
%% Converted: 2026-04-02T20:09:49.726Z
%% Total rules: 6

rule_likelihood(animals_beg_to_humans, 1).
rule_type(animals_beg_to_humans, volition).
% Animals beg to humans
rule_active(animals_beg_to_humans).
rule_category(animals_beg_to_humans, gender_dynamics).
rule_source(animals_beg_to_humans, ensemble).
rule_priority(animals_beg_to_humans, 5).
rule_applies(animals_beg_to_humans, X, Y) :-
    trait(Y, human).
rule_effect(animals_beg_to_humans, set_intent(X, beg, Y, 5)).

rule_likelihood(a_woman_can_be_flattered_by_a_sensible_compliment, 1).
rule_type(a_woman_can_be_flattered_by_a_sensible_compliment, volition).
% A woman can be flattered by a sensible compliment
rule_active(a_woman_can_be_flattered_by_a_sensible_compliment).
rule_category(a_woman_can_be_flattered_by_a_sensible_compliment, gender_dynamics).
rule_source(a_woman_can_be_flattered_by_a_sensible_compliment, ensemble).
rule_priority(a_woman_can_be_flattered_by_a_sensible_compliment, 3).
rule_applies(a_woman_can_be_flattered_by_a_sensible_compliment, X, Y) :-
    trait(X, female),
    directed_status(X, Y, esteems),
    attribute(Y, sensitiveness, Sensitiveness_val), Sensitiveness_val > 20,
    attribute(Y, propriety, Propriety_val), Propriety_val > 50.
rule_effect(a_woman_can_be_flattered_by_a_sensible_compliment, modify_network(X, Y, affinity, '+', 3)).

rule_likelihood(a_scorned_man_is_judgmental_of_women_in_general, 1).
rule_type(a_scorned_man_is_judgmental_of_women_in_general, volition).
% A scorned man is judgmental of women in general
rule_active(a_scorned_man_is_judgmental_of_women_in_general).
rule_category(a_scorned_man_is_judgmental_of_women_in_general, gender_dynamics).
rule_source(a_scorned_man_is_judgmental_of_women_in_general, ensemble).
rule_priority(a_scorned_man_is_judgmental_of_women_in_general, 5).
rule_applies(a_scorned_man_is_judgmental_of_women_in_general, X, Y) :-
    trait(X, male),
    status(X, upset),
    attribute(X, sensitiveness, Sensitiveness_val), Sensitiveness_val > 75,
    status(X, embarrassed),
    trait(Y, female),
    trait(Y, flirtatious).
rule_effect(a_scorned_man_is_judgmental_of_women_in_general, modify_network(X, Y, affinity, '+', 5)).

rule_likelihood(one_man_liking_a_woman_will_make_other_men_like_that_woman, 1).
rule_type(one_man_liking_a_woman_will_make_other_men_like_that_woman, volition).
% One man liking a woman will make other men like that woman
rule_active(one_man_liking_a_woman_will_make_other_men_like_that_woman).
rule_category(one_man_liking_a_woman_will_make_other_men_like_that_woman, gender_dynamics).
rule_source(one_man_liking_a_woman_will_make_other_men_like_that_woman, ensemble).
rule_priority(one_man_liking_a_woman_will_make_other_men_like_that_woman, 5).
rule_applies(one_man_liking_a_woman_will_make_other_men_like_that_woman, X, Y) :-
    trait(Y, male),
    trait(X, female),
    trait('z', male),
    network(Y, X, affinity, Affinity_val), Affinity_val < 60,
    network('z', X, affinity, Affinity_val), Affinity_val > 60.
rule_effect(one_man_liking_a_woman_will_make_other_men_like_that_woman, modify_network('z', X, affinity, '+', 3)).
rule_effect(one_man_liking_a_woman_will_make_other_men_like_that_woman, modify_network('z', X, curiosity, '+', 5)).

rule_likelihood(gobsmacked_women_ignore_proposals_from_other_men, 1).
rule_type(gobsmacked_women_ignore_proposals_from_other_men, volition).
% Gobsmacked women ignore proposals from other men
rule_active(gobsmacked_women_ignore_proposals_from_other_men).
rule_category(gobsmacked_women_ignore_proposals_from_other_men, gender_dynamics).
rule_source(gobsmacked_women_ignore_proposals_from_other_men, ensemble).
rule_priority(gobsmacked_women_ignore_proposals_from_other_men, 5).
rule_applies(gobsmacked_women_ignore_proposals_from_other_men, X, Y) :-
    trait(X, female),
    attribute(X, self_assuredness, Self_assuredness_val), Self_assuredness_val < 50,
    trait(X, honest),
    trait(Y, flirtatious),
    status(X, gobsmacked).
rule_effect(gobsmacked_women_ignore_proposals_from_other_men, modify_network(X, Y, affinity, '-', 5)).

rule_likelihood(an_educated_woman_knows_her_place_and_will_enjoy_the_company_of_someone_like_her, 1).
rule_type(an_educated_woman_knows_her_place_and_will_enjoy_the_company_of_someone_like_her, volition).
% An educated woman knows her place and will enjoy the company of someone like her
rule_active(an_educated_woman_knows_her_place_and_will_enjoy_the_company_of_someone_like_her).
rule_category(an_educated_woman_knows_her_place_and_will_enjoy_the_company_of_someone_like_her, gender_dynamics).
rule_source(an_educated_woman_knows_her_place_and_will_enjoy_the_company_of_someone_like_her, ensemble).
rule_priority(an_educated_woman_knows_her_place_and_will_enjoy_the_company_of_someone_like_her, 1).
rule_applies(an_educated_woman_knows_her_place_and_will_enjoy_the_company_of_someone_like_her, X, Y) :-
    trait(X, female),
    attribute(X, propriety, Propriety_val), Propriety_val > 70,
    attribute(Y, propriety, Propriety_val), Propriety_val > 70,
    \+ trait(X, talkative),
    \+ trait(Y, talkative),
    trait(Y, female).
rule_effect(an_educated_woman_knows_her_place_and_will_enjoy_the_company_of_someone_like_her, modify_network(X, Y, affinity, '+', 2)).

