%% Ensemble Volition Rules — Combined
%% Generated: 2026-04-02T20:09:49.730Z
%% Total: 800 rules from 32 categories

%% ═══════════════════════════════════════════════════════════
%% Category: age-generational
%% ═══════════════════════════════════════════════════════════

%% Ensemble Volition Rules: age-generational
%% Source: data/ensemble/volitionRules/age-generational.json
%% Converted: 2026-04-02T20:09:49.730Z
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

%% ═══════════════════════════════════════════════════════════
%% Category: antagonism-hostility
%% ═══════════════════════════════════════════════════════════

%% Ensemble Volition Rules: antagonism-hostility
%% Source: data/ensemble/volitionRules/antagonism-hostility.json
%% Converted: 2026-04-02T20:09:49.730Z
%% Total rules: 74

rule_likelihood(rivals_antagonize_each_other, 1).
rule_type(rivals_antagonize_each_other, volition).
% Rivals antagonize each other
rule_active(rivals_antagonize_each_other).
rule_category(rivals_antagonize_each_other, antagonism_hostility).
rule_source(rivals_antagonize_each_other, ensemble).
rule_priority(rivals_antagonize_each_other, 5).
rule_applies(rivals_antagonize_each_other, X, Y) :-
    directed_status(X, Y, rivals).
rule_effect(rivals_antagonize_each_other, set_intent(X, antagonize, Y, 5)).

rule_likelihood(feuding_leads_to_antagonism, 1).
rule_type(feuding_leads_to_antagonism, volition).
% Feuding leads to antagonism
rule_active(feuding_leads_to_antagonism).
rule_category(feuding_leads_to_antagonism, antagonism_hostility).
rule_source(feuding_leads_to_antagonism, ensemble).
rule_priority(feuding_leads_to_antagonism, 5).
rule_applies(feuding_leads_to_antagonism, X, Y) :-
    directed_status(X, Y, feuding).
rule_effect(feuding_leads_to_antagonism, set_intent(X, antagonize, Y, 5)).

rule_likelihood(bosses_are_less_antagonistic_to_their_employees, 1).
rule_type(bosses_are_less_antagonistic_to_their_employees, volition).
% Bosses are less antagonistic to their employees
rule_active(bosses_are_less_antagonistic_to_their_employees).
rule_category(bosses_are_less_antagonistic_to_their_employees, antagonism_hostility).
rule_source(bosses_are_less_antagonistic_to_their_employees, ensemble).
rule_priority(bosses_are_less_antagonistic_to_their_employees, 1).
rule_applies(bosses_are_less_antagonistic_to_their_employees, X, Y) :-
    directed_status(X, Y, is_boss_of).
rule_effect(bosses_are_less_antagonistic_to_their_employees, set_intent(X, antagonize, Y, -1)).

rule_likelihood(people_are_less_antagonistic_to_those_they_idolize, 1).
rule_type(people_are_less_antagonistic_to_those_they_idolize, volition).
% People are less antagonistic to those they idolize
rule_active(people_are_less_antagonistic_to_those_they_idolize).
rule_category(people_are_less_antagonistic_to_those_they_idolize, antagonism_hostility).
rule_source(people_are_less_antagonistic_to_those_they_idolize, ensemble).
rule_priority(people_are_less_antagonistic_to_those_they_idolize, 1).
rule_applies(people_are_less_antagonistic_to_those_they_idolize, X, Y) :-
    directed_status(X, Y, idolize).
rule_effect(people_are_less_antagonistic_to_those_they_idolize, set_intent(X, antagonize, Y, -1)).

rule_likelihood(people_are_less_antagonistic_to_their_friends, 1).
rule_type(people_are_less_antagonistic_to_their_friends, volition).
% People are less antagonistic to their friends
rule_active(people_are_less_antagonistic_to_their_friends).
rule_category(people_are_less_antagonistic_to_their_friends, antagonism_hostility).
rule_source(people_are_less_antagonistic_to_their_friends, ensemble).
rule_priority(people_are_less_antagonistic_to_their_friends, 1).
rule_applies(people_are_less_antagonistic_to_their_friends, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val > 6.
rule_effect(people_are_less_antagonistic_to_their_friends, set_intent(X, antagonize, Y, -2)).

rule_likelihood(people_are_less_antagonistic_to_those_they_have_romantic_feelings_for, 1).
rule_type(people_are_less_antagonistic_to_those_they_have_romantic_feelings_for, volition).
% People are less antagonistic to those they have romantic feelings for
rule_active(people_are_less_antagonistic_to_those_they_have_romantic_feelings_for).
rule_category(people_are_less_antagonistic_to_those_they_have_romantic_feelings_for, antagonism_hostility).
rule_source(people_are_less_antagonistic_to_those_they_have_romantic_feelings_for, ensemble).
rule_priority(people_are_less_antagonistic_to_those_they_have_romantic_feelings_for, 1).
rule_applies(people_are_less_antagonistic_to_those_they_have_romantic_feelings_for, X, Y) :-
    network(X, Y, romance, Romance_val), Romance_val > 6.
rule_effect(people_are_less_antagonistic_to_those_they_have_romantic_feelings_for, set_intent(X, antagonize, Y, -2)).

rule_likelihood(people_are_less_antagonistic_to_those_they_trust, 1).
rule_type(people_are_less_antagonistic_to_those_they_trust, volition).
% People are less antagonistic to those they trust
rule_active(people_are_less_antagonistic_to_those_they_trust).
rule_category(people_are_less_antagonistic_to_those_they_trust, antagonism_hostility).
rule_source(people_are_less_antagonistic_to_those_they_trust, ensemble).
rule_priority(people_are_less_antagonistic_to_those_they_trust, 1).
rule_applies(people_are_less_antagonistic_to_those_they_trust, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val > 6.
rule_effect(people_are_less_antagonistic_to_those_they_trust, set_intent(X, antagonize, Y, -2)).

rule_likelihood(people_are_less_antagonistic_to_those_they_respect, 1).
rule_type(people_are_less_antagonistic_to_those_they_respect, volition).
% People are less antagonistic to those they respect
rule_active(people_are_less_antagonistic_to_those_they_respect).
rule_category(people_are_less_antagonistic_to_those_they_respect, antagonism_hostility).
rule_source(people_are_less_antagonistic_to_those_they_respect, ensemble).
rule_priority(people_are_less_antagonistic_to_those_they_respect, 1).
rule_applies(people_are_less_antagonistic_to_those_they_respect, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val > 6.
rule_effect(people_are_less_antagonistic_to_those_they_respect, set_intent(X, antagonize, Y, -1)).

rule_likelihood(people_tend_to_antagonize_those_they_perceive_as_more_dominant_in_their_social_circle, 1).
rule_type(people_tend_to_antagonize_those_they_perceive_as_more_dominant_in_their_social_circle, volition).
% People tend to antagonize those they perceive as more dominant in their social circle.
rule_active(people_tend_to_antagonize_those_they_perceive_as_more_dominant_in_their_social_circle).
rule_category(people_tend_to_antagonize_those_they_perceive_as_more_dominant_in_their_social_circle, antagonism_hostility).
rule_source(people_tend_to_antagonize_those_they_perceive_as_more_dominant_in_their_social_circle, ensemble).
rule_priority(people_tend_to_antagonize_those_they_perceive_as_more_dominant_in_their_social_circle, 5).
rule_applies(people_tend_to_antagonize_those_they_perceive_as_more_dominant_in_their_social_circle, X, Y) :-
    network(X, Y, antagonism, Antagonism_val), Antagonism_val > 6.
rule_effect(people_tend_to_antagonize_those_they_perceive_as_more_dominant_in_their_social_circle, set_intent(X, antagonize, Y, 5)).

rule_likelihood(people_are_more_antagonistic_to_those_they_are_indebted_to, 1).
rule_type(people_are_more_antagonistic_to_those_they_are_indebted_to, volition).
% People are more antagonistic to those they are indebted to
rule_active(people_are_more_antagonistic_to_those_they_are_indebted_to).
rule_category(people_are_more_antagonistic_to_those_they_are_indebted_to, antagonism_hostility).
rule_source(people_are_more_antagonistic_to_those_they_are_indebted_to, ensemble).
rule_priority(people_are_more_antagonistic_to_those_they_are_indebted_to, 1).
rule_applies(people_are_more_antagonistic_to_those_they_are_indebted_to, X, Y) :-
    network(X, Y, indebted, Indebted_val), Indebted_val > 6.
rule_effect(people_are_more_antagonistic_to_those_they_are_indebted_to, set_intent(X, antagonize, Y, -1)).

rule_likelihood(people_tend_to_antagonize_weaker_friends_while_seeking_stronger_connections, 1).
rule_type(people_tend_to_antagonize_weaker_friends_while_seeking_stronger_connections, volition).
% People tend to antagonize weaker friends while seeking stronger connections.
rule_active(people_tend_to_antagonize_weaker_friends_while_seeking_stronger_connections).
rule_category(people_tend_to_antagonize_weaker_friends_while_seeking_stronger_connections, antagonism_hostility).
rule_source(people_tend_to_antagonize_weaker_friends_while_seeking_stronger_connections, ensemble).
rule_priority(people_tend_to_antagonize_weaker_friends_while_seeking_stronger_connections, 1).
rule_applies(people_tend_to_antagonize_weaker_friends_while_seeking_stronger_connections, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val > 3,
    network(X, Y, friendship, Friendship_val), Friendship_val < 7.
rule_effect(people_tend_to_antagonize_weaker_friends_while_seeking_stronger_connections, set_intent(X, antagonize, Y, -1)).

rule_likelihood(people_tend_to_antagonize_those_who_are_more_powerful_than_them_but_less_so, 1).
rule_type(people_tend_to_antagonize_those_who_are_more_powerful_than_them_but_less_so, volition).
% People tend to antagonize those who are more powerful than them but less so.
rule_active(people_tend_to_antagonize_those_who_are_more_powerful_than_them_but_less_so).
rule_category(people_tend_to_antagonize_those_who_are_more_powerful_than_them_but_less_so, antagonism_hostility).
rule_source(people_tend_to_antagonize_those_who_are_more_powerful_than_them_but_less_so, ensemble).
rule_priority(people_tend_to_antagonize_those_who_are_more_powerful_than_them_but_less_so, 1).
rule_applies(people_tend_to_antagonize_those_who_are_more_powerful_than_them_but_less_so, X, Y) :-
    intent(X, antagonize, Y),
    intent(X, antagonize, Y).
rule_effect(people_tend_to_antagonize_those_who_are_more_powerful_than_them_but_less_so, set_intent(X, antagonize, Y, 2)).

rule_likelihood(people_tend_to_antagonize_weaker_connections_when_they_have_strong_friendships_with_others, 1).
rule_type(people_tend_to_antagonize_weaker_connections_when_they_have_strong_friendships_with_others, volition).
% People tend to antagonize weaker connections when they have strong friendships with others.
rule_active(people_tend_to_antagonize_weaker_connections_when_they_have_strong_friendships_with_others).
rule_category(people_tend_to_antagonize_weaker_connections_when_they_have_strong_friendships_with_others, antagonism_hostility).
rule_source(people_tend_to_antagonize_weaker_connections_when_they_have_strong_friendships_with_others, ensemble).
rule_priority(people_tend_to_antagonize_weaker_connections_when_they_have_strong_friendships_with_others, 1).
rule_applies(people_tend_to_antagonize_weaker_connections_when_they_have_strong_friendships_with_others, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val < 4.
rule_effect(people_tend_to_antagonize_weaker_connections_when_they_have_strong_friendships_with_others, set_intent(X, antagonize, Y, 2)).

rule_likelihood(people_tend_to_antagonize_those_they_perceive_as_more_influential_or_dominant_within_their_social, 1).
rule_type(people_tend_to_antagonize_those_they_perceive_as_more_influential_or_dominant_within_their_social, volition).
% People tend to antagonize those they perceive as more influential or dominant within their social
rule_active(people_tend_to_antagonize_those_they_perceive_as_more_influential_or_dominant_within_their_social).
rule_category(people_tend_to_antagonize_those_they_perceive_as_more_influential_or_dominant_within_their_social, antagonism_hostility).
rule_source(people_tend_to_antagonize_those_they_perceive_as_more_influential_or_dominant_within_their_social, ensemble).
rule_priority(people_tend_to_antagonize_those_they_perceive_as_more_influential_or_dominant_within_their_social, 1).
rule_applies(people_tend_to_antagonize_those_they_perceive_as_more_influential_or_dominant_within_their_social, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val < 4.
rule_effect(people_tend_to_antagonize_those_they_perceive_as_more_influential_or_dominant_within_their_social, set_intent(X, antagonize, Y, 1)).

rule_likelihood(people_may_feel_antagonized_towards_those_they_perceive_as_less_respectful_than_others, 1).
rule_type(people_may_feel_antagonized_towards_those_they_perceive_as_less_respectful_than_others, volition).
% People may feel antagonized towards those they perceive as less respectful than others.
rule_active(people_may_feel_antagonized_towards_those_they_perceive_as_less_respectful_than_others).
rule_category(people_may_feel_antagonized_towards_those_they_perceive_as_less_respectful_than_others, antagonism_hostility).
rule_source(people_may_feel_antagonized_towards_those_they_perceive_as_less_respectful_than_others, ensemble).
rule_priority(people_may_feel_antagonized_towards_those_they_perceive_as_less_respectful_than_others, 1).
rule_applies(people_may_feel_antagonized_towards_those_they_perceive_as_less_respectful_than_others, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val < 4.
rule_effect(people_may_feel_antagonized_towards_those_they_perceive_as_less_respectful_than_others, set_intent(X, antagonize, Y, 2)).

rule_likelihood(people_tend_to_distance_themselves_from_those_they_antagonize_significantly, 1).
rule_type(people_tend_to_distance_themselves_from_those_they_antagonize_significantly, volition).
% People tend to distance themselves from those they antagonize significantly.
rule_active(people_tend_to_distance_themselves_from_those_they_antagonize_significantly).
rule_category(people_tend_to_distance_themselves_from_those_they_antagonize_significantly, antagonism_hostility).
rule_source(people_tend_to_distance_themselves_from_those_they_antagonize_significantly, ensemble).
rule_priority(people_tend_to_distance_themselves_from_those_they_antagonize_significantly, 1).
rule_applies(people_tend_to_distance_themselves_from_those_they_antagonize_significantly, X, Y) :-
    intent(X, antagonize, Y).
rule_effect(people_tend_to_distance_themselves_from_those_they_antagonize_significantly, set_intent(X, antagonize, Y, -2)).

rule_likelihood(people_may_develop_antagonistic_feelings_towards_strong_individuals_when_they_perceive_them_as_a_threat, 1).
rule_type(people_may_develop_antagonistic_feelings_towards_strong_individuals_when_they_perceive_them_as_a_threat, volition).
% People may develop antagonistic feelings towards strong individuals when they perceive them as a threat.
rule_active(people_may_develop_antagonistic_feelings_towards_strong_individuals_when_they_perceive_them_as_a_threat).
rule_category(people_may_develop_antagonistic_feelings_towards_strong_individuals_when_they_perceive_them_as_a_threat, antagonism_hostility).
rule_source(people_may_develop_antagonistic_feelings_towards_strong_individuals_when_they_perceive_them_as_a_threat, ensemble).
rule_priority(people_may_develop_antagonistic_feelings_towards_strong_individuals_when_they_perceive_them_as_a_threat, 1).
rule_applies(people_may_develop_antagonistic_feelings_towards_strong_individuals_when_they_perceive_them_as_a_threat, X, Y) :-
    status(X, successful).
rule_effect(people_may_develop_antagonistic_feelings_towards_strong_individuals_when_they_perceive_them_as_a_threat, set_intent(X, antagonize, Y, -2)).

rule_likelihood(people_seeking_solace_after_heartbreak_may_unintentionally_antagonize_their_crush, 1).
rule_type(people_seeking_solace_after_heartbreak_may_unintentionally_antagonize_their_crush, volition).
% People seeking solace after heartbreak may unintentionally antagonize their crush.
rule_active(people_seeking_solace_after_heartbreak_may_unintentionally_antagonize_their_crush).
rule_category(people_seeking_solace_after_heartbreak_may_unintentionally_antagonize_their_crush, antagonism_hostility).
rule_source(people_seeking_solace_after_heartbreak_may_unintentionally_antagonize_their_crush, ensemble).
rule_priority(people_seeking_solace_after_heartbreak_may_unintentionally_antagonize_their_crush, 1).
rule_applies(people_seeking_solace_after_heartbreak_may_unintentionally_antagonize_their_crush, X, Y) :-
    status(X, heartbroken).
rule_effect(people_seeking_solace_after_heartbreak_may_unintentionally_antagonize_their_crush, set_intent(X, antagonize, Y, 1)).

rule_likelihood(people_with_a_fearful_status_are_likely_to_antagonize_others, 1).
rule_type(people_with_a_fearful_status_are_likely_to_antagonize_others, volition).
% People with a fearful status are likely to antagonize others.
rule_active(people_with_a_fearful_status_are_likely_to_antagonize_others).
rule_category(people_with_a_fearful_status_are_likely_to_antagonize_others, antagonism_hostility).
rule_source(people_with_a_fearful_status_are_likely_to_antagonize_others, ensemble).
rule_priority(people_with_a_fearful_status_are_likely_to_antagonize_others, 1).
rule_applies(people_with_a_fearful_status_are_likely_to_antagonize_others, X, Y) :-
    status(X, fearful).
rule_effect(people_with_a_fearful_status_are_likely_to_antagonize_others, set_intent(X, antagonize, Y, 1)).

rule_likelihood(people_envy_strong_individuals_and_intend_to_antagonize_them, 1).
rule_type(people_envy_strong_individuals_and_intend_to_antagonize_them, volition).
% People envy strong individuals and intend to antagonize them.
rule_active(people_envy_strong_individuals_and_intend_to_antagonize_them).
rule_category(people_envy_strong_individuals_and_intend_to_antagonize_them, antagonism_hostility).
rule_source(people_envy_strong_individuals_and_intend_to_antagonize_them, ensemble).
rule_priority(people_envy_strong_individuals_and_intend_to_antagonize_them, 1).
rule_applies(people_envy_strong_individuals_and_intend_to_antagonize_them, X, Y) :-
    directed_status(X, Y, envy).
rule_effect(people_envy_strong_individuals_and_intend_to_antagonize_them, set_intent(X, antagonize, Y, 2)).

rule_likelihood(people_are_antagonized_by_those_they_fear, 1).
rule_type(people_are_antagonized_by_those_they_fear, volition).
% People are antagonized by those they fear.
rule_active(people_are_antagonized_by_those_they_fear).
rule_category(people_are_antagonized_by_those_they_fear, antagonism_hostility).
rule_source(people_are_antagonized_by_those_they_fear, ensemble).
rule_priority(people_are_antagonized_by_those_they_fear, 1).
rule_applies(people_are_antagonized_by_those_they_fear, X, Y) :-
    directed_status(X, Y, afraid_of).
rule_effect(people_are_antagonized_by_those_they_fear, set_intent(X, antagonize, Y, 1)).

rule_likelihood(people_with_low_altruism_levels_may_seek_to_antagonize_those_they_perceive_as, 1).
rule_type(people_with_low_altruism_levels_may_seek_to_antagonize_those_they_perceive_as, volition).
% People with low altruism levels may seek to antagonize those they perceive as
rule_active(people_with_low_altruism_levels_may_seek_to_antagonize_those_they_perceive_as).
rule_category(people_with_low_altruism_levels_may_seek_to_antagonize_those_they_perceive_as, antagonism_hostility).
rule_source(people_with_low_altruism_levels_may_seek_to_antagonize_those_they_perceive_as, ensemble).
rule_priority(people_with_low_altruism_levels_may_seek_to_antagonize_those_they_perceive_as, 1).
rule_applies(people_with_low_altruism_levels_may_seek_to_antagonize_those_they_perceive_as, X, Y) :-
    attribute(X, altruism, Altruism_val), Altruism_val < 7.
rule_effect(people_with_low_altruism_levels_may_seek_to_antagonize_those_they_perceive_as, set_intent(X, antagonize, Y, 2)).

rule_likelihood(people_with_lower_wisdom_seek_to_antagonize_those_they_perceive_as_more_knowledgeable, 1).
rule_type(people_with_lower_wisdom_seek_to_antagonize_those_they_perceive_as_more_knowledgeable, volition).
% People with lower wisdom seek to antagonize those they perceive as more knowledgeable.
rule_active(people_with_lower_wisdom_seek_to_antagonize_those_they_perceive_as_more_knowledgeable).
rule_category(people_with_lower_wisdom_seek_to_antagonize_those_they_perceive_as_more_knowledgeable, antagonism_hostility).
rule_source(people_with_lower_wisdom_seek_to_antagonize_those_they_perceive_as_more_knowledgeable, ensemble).
rule_priority(people_with_lower_wisdom_seek_to_antagonize_those_they_perceive_as_more_knowledgeable, 1).
rule_applies(people_with_lower_wisdom_seek_to_antagonize_those_they_perceive_as_more_knowledgeable, X, Y) :-
    attribute(X, wisdom, Wisdom_val), Wisdom_val < 7.
rule_effect(people_with_lower_wisdom_seek_to_antagonize_those_they_perceive_as_more_knowledgeable, set_intent(X, antagonize, Y, 2)).

rule_likelihood(people_with_high_altruism_levels_may_inadvertently_antagonize_those_they_are, 1).
rule_type(people_with_high_altruism_levels_may_inadvertently_antagonize_those_they_are, volition).
% People with high altruism levels may inadvertently antagonize those they are
rule_active(people_with_high_altruism_levels_may_inadvertently_antagonize_those_they_are).
rule_category(people_with_high_altruism_levels_may_inadvertently_antagonize_those_they_are, antagonism_hostility).
rule_source(people_with_high_altruism_levels_may_inadvertently_antagonize_those_they_are, ensemble).
rule_priority(people_with_high_altruism_levels_may_inadvertently_antagonize_those_they_are, 1).
rule_applies(people_with_high_altruism_levels_may_inadvertently_antagonize_those_they_are, X, Y) :-
    attribute(X, altruism, Altruism_val), Altruism_val > 12.
rule_effect(people_with_high_altruism_levels_may_inadvertently_antagonize_those_they_are, set_intent(X, antagonize, Y, -1)).

rule_likelihood(people_may_feel_antagonized_towards_less_wise_individuals_when_they_encounter_someone_with_greater_wisdom, 1).
rule_type(people_may_feel_antagonized_towards_less_wise_individuals_when_they_encounter_someone_with_greater_wisdom, volition).
% People may feel antagonized towards less wise individuals when they encounter someone with greater wisdom.
rule_active(people_may_feel_antagonized_towards_less_wise_individuals_when_they_encounter_someone_with_greater_wisdom).
rule_category(people_may_feel_antagonized_towards_less_wise_individuals_when_they_encounter_someone_with_greater_wisdom, antagonism_hostility).
rule_source(people_may_feel_antagonized_towards_less_wise_individuals_when_they_encounter_someone_with_greater_wisdom, ensemble).
rule_priority(people_may_feel_antagonized_towards_less_wise_individuals_when_they_encounter_someone_with_greater_wisdom, 1).
rule_applies(people_may_feel_antagonized_towards_less_wise_individuals_when_they_encounter_someone_with_greater_wisdom, X, Y) :-
    attribute(X, wisdom, Wisdom_val), Wisdom_val > 12.
rule_effect(people_may_feel_antagonized_towards_less_wise_individuals_when_they_encounter_someone_with_greater_wisdom, set_intent(X, antagonize, Y, -2)).

rule_likelihood(people_may_antagonize_weaker_individuals_when_they_are_friendly_towards_stronger_ones, 1).
rule_type(people_may_antagonize_weaker_individuals_when_they_are_friendly_towards_stronger_ones, volition).
% People may antagonize weaker individuals when they are friendly towards stronger ones.
rule_active(people_may_antagonize_weaker_individuals_when_they_are_friendly_towards_stronger_ones).
rule_category(people_may_antagonize_weaker_individuals_when_they_are_friendly_towards_stronger_ones, antagonism_hostility).
rule_source(people_may_antagonize_weaker_individuals_when_they_are_friendly_towards_stronger_ones, ensemble).
rule_priority(people_may_antagonize_weaker_individuals_when_they_are_friendly_towards_stronger_ones, 1).
rule_applies(people_may_antagonize_weaker_individuals_when_they_are_friendly_towards_stronger_ones, X, Y) :-
    trait(X, friendly).
rule_effect(people_may_antagonize_weaker_individuals_when_they_are_friendly_towards_stronger_ones, set_intent(X, antagonize, Y, -1)).

rule_likelihood(people_with_xenophobic_traits_may_inadvertently_antagonize_others, 1).
rule_type(people_with_xenophobic_traits_may_inadvertently_antagonize_others, volition).
% People with xenophobic traits may inadvertently antagonize others.
rule_active(people_with_xenophobic_traits_may_inadvertently_antagonize_others).
rule_category(people_with_xenophobic_traits_may_inadvertently_antagonize_others, antagonism_hostility).
rule_source(people_with_xenophobic_traits_may_inadvertently_antagonize_others, ensemble).
rule_priority(people_with_xenophobic_traits_may_inadvertently_antagonize_others, 1).
rule_applies(people_with_xenophobic_traits_may_inadvertently_antagonize_others, X, Y) :-
    trait(X, xenophobic).
rule_effect(people_with_xenophobic_traits_may_inadvertently_antagonize_others, set_intent(X, antagonize, Y, 1)).

rule_likelihood(people_s_average_interest_in_strong_individuals_increases_to_antagonize_their_crush, 1).
rule_type(people_s_average_interest_in_strong_individuals_increases_to_antagonize_their_crush, volition).
% People’s average interest in strong individuals increases to antagonize their crush.
rule_active(people_s_average_interest_in_strong_individuals_increases_to_antagonize_their_crush).
rule_category(people_s_average_interest_in_strong_individuals_increases_to_antagonize_their_crush, antagonism_hostility).
rule_source(people_s_average_interest_in_strong_individuals_increases_to_antagonize_their_crush, ensemble).
rule_priority(people_s_average_interest_in_strong_individuals_increases_to_antagonize_their_crush, 3).
rule_applies(people_s_average_interest_in_strong_individuals_increases_to_antagonize_their_crush, X, Y) :-
    event(X, mean).
rule_effect(people_s_average_interest_in_strong_individuals_increases_to_antagonize_their_crush, set_intent(X, antagonize, Y, 3)).

rule_likelihood(people_may_feel_antagonized_towards_those_they_did_a_favor_for_recently, 1).
rule_type(people_may_feel_antagonized_towards_those_they_did_a_favor_for_recently, volition).
% People may feel antagonized towards those they did a favor for recently.
rule_active(people_may_feel_antagonized_towards_those_they_did_a_favor_for_recently).
rule_category(people_may_feel_antagonized_towards_those_they_did_a_favor_for_recently, antagonism_hostility).
rule_source(people_may_feel_antagonized_towards_those_they_did_a_favor_for_recently, ensemble).
rule_priority(people_may_feel_antagonized_towards_those_they_did_a_favor_for_recently, 1).
rule_applies(people_may_feel_antagonized_towards_those_they_did_a_favor_for_recently, X, Y) :-
    event(X, did_a_favor_for).
rule_effect(people_may_feel_antagonized_towards_those_they_did_a_favor_for_recently, set_intent(X, antagonize, Y, -2)).

rule_likelihood(people_may_develop_antagonism_towards_their_public_friends_when_both_are_considered_strong_by_others, 1).
rule_type(people_may_develop_antagonism_towards_their_public_friends_when_both_are_considered_strong_by_others, volition).
% People may develop antagonism towards their public friends when both are considered strong by others.
rule_active(people_may_develop_antagonism_towards_their_public_friends_when_both_are_considered_strong_by_others).
rule_category(people_may_develop_antagonism_towards_their_public_friends_when_both_are_considered_strong_by_others, antagonism_hostility).
rule_source(people_may_develop_antagonism_towards_their_public_friends_when_both_are_considered_strong_by_others, ensemble).
rule_priority(people_may_develop_antagonism_towards_their_public_friends_when_both_are_considered_strong_by_others, 1).
rule_applies(people_may_develop_antagonism_towards_their_public_friends_when_both_are_considered_strong_by_others, X, Y) :-
    directed_status(X, 'z', public_friends),
    directed_status(Y, 'z', public_friends).
rule_effect(people_may_develop_antagonism_towards_their_public_friends_when_both_are_considered_strong_by_others, set_intent(X, antagonize, Y, -1)).

rule_likelihood(people_in_feuding_status_with_both_individual_a_and_b_are_likely_to_antagonize_each, 1).
rule_type(people_in_feuding_status_with_both_individual_a_and_b_are_likely_to_antagonize_each, volition).
% People in feuding status with both individual A and B are likely to antagonize each
rule_active(people_in_feuding_status_with_both_individual_a_and_b_are_likely_to_antagonize_each).
rule_category(people_in_feuding_status_with_both_individual_a_and_b_are_likely_to_antagonize_each, antagonism_hostility).
rule_source(people_in_feuding_status_with_both_individual_a_and_b_are_likely_to_antagonize_each, ensemble).
rule_priority(people_in_feuding_status_with_both_individual_a_and_b_are_likely_to_antagonize_each, 1).
rule_applies(people_in_feuding_status_with_both_individual_a_and_b_are_likely_to_antagonize_each, X, Y) :-
    directed_status(X, 'z', feuding),
    directed_status(Y, 'z', feuding).
rule_effect(people_in_feuding_status_with_both_individual_a_and_b_are_likely_to_antagonize_each, set_intent(X, antagonize, Y, -2)).

rule_likelihood(people_idolizing_both_person_x_and_y_may_lead_to_antagonism_between_them, 1).
rule_type(people_idolizing_both_person_x_and_y_may_lead_to_antagonism_between_them, volition).
% People idolizing both person X and Y may lead to antagonism between them.
rule_active(people_idolizing_both_person_x_and_y_may_lead_to_antagonism_between_them).
rule_category(people_idolizing_both_person_x_and_y_may_lead_to_antagonism_between_them, antagonism_hostility).
rule_source(people_idolizing_both_person_x_and_y_may_lead_to_antagonism_between_them, ensemble).
rule_priority(people_idolizing_both_person_x_and_y_may_lead_to_antagonism_between_them, 1).
rule_applies(people_idolizing_both_person_x_and_y_may_lead_to_antagonism_between_them, X, Y) :-
    directed_status(X, 'z', idolize),
    directed_status(Y, 'z', idolize).
rule_effect(people_idolizing_both_person_x_and_y_may_lead_to_antagonism_between_them, set_intent(X, antagonize, Y, -1)).

rule_likelihood(people_harboring_rivalry_towards_both_individuals_x_and_y_are_inclined_to_antagonize, 1).
rule_type(people_harboring_rivalry_towards_both_individuals_x_and_y_are_inclined_to_antagonize, volition).
% People harboring rivalry towards both individuals X and Y are inclined to antagonize
rule_active(people_harboring_rivalry_towards_both_individuals_x_and_y_are_inclined_to_antagonize).
rule_category(people_harboring_rivalry_towards_both_individuals_x_and_y_are_inclined_to_antagonize, antagonism_hostility).
rule_source(people_harboring_rivalry_towards_both_individuals_x_and_y_are_inclined_to_antagonize, ensemble).
rule_priority(people_harboring_rivalry_towards_both_individuals_x_and_y_are_inclined_to_antagonize, 1).
rule_applies(people_harboring_rivalry_towards_both_individuals_x_and_y_are_inclined_to_antagonize, X, Y) :-
    directed_status(X, 'z', rivals),
    directed_status(Y, 'z', rivals).
rule_effect(people_harboring_rivalry_towards_both_individuals_x_and_y_are_inclined_to_antagonize, set_intent(X, antagonize, Y, -1)).

rule_likelihood(people_may_feel_antagonized_towards_each_other_when_both_have_more_than_6_friends_in_common, 1).
rule_type(people_may_feel_antagonized_towards_each_other_when_both_have_more_than_6_friends_in_common, volition).
% People may feel antagonized towards each other when both have more than 6 friends in common
rule_active(people_may_feel_antagonized_towards_each_other_when_both_have_more_than_6_friends_in_common).
rule_category(people_may_feel_antagonized_towards_each_other_when_both_have_more_than_6_friends_in_common, antagonism_hostility).
rule_source(people_may_feel_antagonized_towards_each_other_when_both_have_more_than_6_friends_in_common, ensemble).
rule_priority(people_may_feel_antagonized_towards_each_other_when_both_have_more_than_6_friends_in_common, 1).
rule_applies(people_may_feel_antagonized_towards_each_other_when_both_have_more_than_6_friends_in_common, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    network(Y, 'z', friendship, Friendship_val), Friendship_val > 6.
rule_effect(people_may_feel_antagonized_towards_each_other_when_both_have_more_than_6_friends_in_common, set_intent(X, antagonize, Y, -2)).

rule_likelihood(people_are_more_inclined_to_antagonize_their_crush_when_they_perceive_themselves_as_less, 1).
rule_type(people_are_more_inclined_to_antagonize_their_crush_when_they_perceive_themselves_as_less, volition).
% People are more inclined to antagonize their crush when they perceive themselves as less
rule_active(people_are_more_inclined_to_antagonize_their_crush_when_they_perceive_themselves_as_less).
rule_category(people_are_more_inclined_to_antagonize_their_crush_when_they_perceive_themselves_as_less, antagonism_hostility).
rule_source(people_are_more_inclined_to_antagonize_their_crush_when_they_perceive_themselves_as_less, ensemble).
rule_priority(people_are_more_inclined_to_antagonize_their_crush_when_they_perceive_themselves_as_less, 3).
rule_applies(people_are_more_inclined_to_antagonize_their_crush_when_they_perceive_themselves_as_less, X, Y) :-
    network(X, 'z', romance, Romance_val), Romance_val > 6,
    network(Y, 'z', romance, Romance_val), Romance_val > 6.
rule_effect(people_are_more_inclined_to_antagonize_their_crush_when_they_perceive_themselves_as_less, set_intent(X, antagonize, Y, 3)).

rule_likelihood(people_tend_to_antagonize_those_more_closely_connected_within_their_social_network_than_others, 1).
rule_type(people_tend_to_antagonize_those_more_closely_connected_within_their_social_network_than_others, volition).
% People tend to antagonize those more closely connected within their social network than others.
rule_active(people_tend_to_antagonize_those_more_closely_connected_within_their_social_network_than_others).
rule_category(people_tend_to_antagonize_those_more_closely_connected_within_their_social_network_than_others, antagonism_hostility).
rule_source(people_tend_to_antagonize_those_more_closely_connected_within_their_social_network_than_others, ensemble).
rule_priority(people_tend_to_antagonize_those_more_closely_connected_within_their_social_network_than_others, 1).
rule_applies(people_tend_to_antagonize_those_more_closely_connected_within_their_social_network_than_others, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    network(Y, 'z', familial, Familial_val), Familial_val > 6.
rule_effect(people_tend_to_antagonize_those_more_closely_connected_within_their_social_network_than_others, set_intent(X, antagonize, Y, -1)).

rule_likelihood(people_are_more_likely_to_antagonize_weaker_friends_over_stronger_ones_when_both_have_a_similar, 1).
rule_type(people_are_more_likely_to_antagonize_weaker_friends_over_stronger_ones_when_both_have_a_similar, volition).
% People are more likely to antagonize weaker friends over stronger ones when both have a similar
rule_active(people_are_more_likely_to_antagonize_weaker_friends_over_stronger_ones_when_both_have_a_similar).
rule_category(people_are_more_likely_to_antagonize_weaker_friends_over_stronger_ones_when_both_have_a_similar, antagonism_hostility).
rule_source(people_are_more_likely_to_antagonize_weaker_friends_over_stronger_ones_when_both_have_a_similar, ensemble).
rule_priority(people_are_more_likely_to_antagonize_weaker_friends_over_stronger_ones_when_both_have_a_similar, 1).
rule_applies(people_are_more_likely_to_antagonize_weaker_friends_over_stronger_ones_when_both_have_a_similar, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val < 4,
    network(Y, 'z', friendship, Friendship_val), Friendship_val < 4.
rule_effect(people_are_more_likely_to_antagonize_weaker_friends_over_stronger_ones_when_both_have_a_similar, set_intent(X, antagonize, Y, -2)).

rule_likelihood(people_tend_to_antagonize_those_they_are_less_trusting_of_when_both_parties_have_a_low, 1).
rule_type(people_tend_to_antagonize_those_they_are_less_trusting_of_when_both_parties_have_a_low, volition).
% People tend to antagonize those they are less trusting of when both parties have a low
rule_active(people_tend_to_antagonize_those_they_are_less_trusting_of_when_both_parties_have_a_low).
rule_category(people_tend_to_antagonize_those_they_are_less_trusting_of_when_both_parties_have_a_low, antagonism_hostility).
rule_source(people_tend_to_antagonize_those_they_are_less_trusting_of_when_both_parties_have_a_low, ensemble).
rule_priority(people_tend_to_antagonize_those_they_are_less_trusting_of_when_both_parties_have_a_low, 1).
rule_applies(people_tend_to_antagonize_those_they_are_less_trusting_of_when_both_parties_have_a_low, X, Y) :-
    network(X, 'Z', trust, Trust_val), Trust_val < 4,
    intent(Y, trust, 'z').
rule_effect(people_tend_to_antagonize_those_they_are_less_trusting_of_when_both_parties_have_a_low, set_intent(X, antagonize, Y, -1)).

rule_likelihood(people_tend_to_antagonize_those_they_perceive_as_less_respectful_than_themselves_or_their_cr, 1).
rule_type(people_tend_to_antagonize_those_they_perceive_as_less_respectful_than_themselves_or_their_cr, volition).
% People tend to antagonize those they perceive as less respectful than themselves or their cr
rule_active(people_tend_to_antagonize_those_they_perceive_as_less_respectful_than_themselves_or_their_cr).
rule_category(people_tend_to_antagonize_those_they_perceive_as_less_respectful_than_themselves_or_their_cr, antagonism_hostility).
rule_source(people_tend_to_antagonize_those_they_perceive_as_less_respectful_than_themselves_or_their_cr, ensemble).
rule_priority(people_tend_to_antagonize_those_they_perceive_as_less_respectful_than_themselves_or_their_cr, 1).
rule_applies(people_tend_to_antagonize_those_they_perceive_as_less_respectful_than_themselves_or_their_cr, X, Y) :-
    network(X, 'z', respect, Respect_val), Respect_val < 4,
    intent(Y, antagonize, 'z').
rule_effect(people_tend_to_antagonize_those_they_perceive_as_less_respectful_than_themselves_or_their_cr, set_intent(X, antagonize, Y, -1)).

rule_likelihood(people_tend_to_antagonize_their_crushes_when_they_have_fewer_than_7_friends_and, 1).
rule_type(people_tend_to_antagonize_their_crushes_when_they_have_fewer_than_7_friends_and, volition).
% People tend to antagonize their crushes when they have fewer than 7 friends and
rule_active(people_tend_to_antagonize_their_crushes_when_they_have_fewer_than_7_friends_and).
rule_category(people_tend_to_antagonize_their_crushes_when_they_have_fewer_than_7_friends_and, antagonism_hostility).
rule_source(people_tend_to_antagonize_their_crushes_when_they_have_fewer_than_7_friends_and, ensemble).
rule_priority(people_tend_to_antagonize_their_crushes_when_they_have_fewer_than_7_friends_and, 1).
rule_applies(people_tend_to_antagonize_their_crushes_when_they_have_fewer_than_7_friends_and, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, nice).
rule_effect(people_tend_to_antagonize_their_crushes_when_they_have_fewer_than_7_friends_and, set_intent(X, antagonize, Y, -2)).

rule_likelihood(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_in_common_and, 1).
rule_type(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_in_common_and, volition).
% People tend to antagonize their crush when they have more than six friends in common and
rule_active(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_in_common_and).
rule_category(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_in_common_and, antagonism_hostility).
rule_source(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_in_common_and, ensemble).
rule_priority(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_in_common_and, 5).
rule_applies(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_in_common_and, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, mean).
rule_effect(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_in_common_and, set_intent(X, antagonize, Y, 5)).

rule_likelihood(people_may_develop_antagonism_towards_their_friends_who_have_recently_done_favors_for_them, 1).
rule_type(people_may_develop_antagonism_towards_their_friends_who_have_recently_done_favors_for_them, volition).
% People may develop antagonism towards their friends who have recently done favors for them.
rule_active(people_may_develop_antagonism_towards_their_friends_who_have_recently_done_favors_for_them).
rule_category(people_may_develop_antagonism_towards_their_friends_who_have_recently_done_favors_for_them, antagonism_hostility).
rule_source(people_may_develop_antagonism_towards_their_friends_who_have_recently_done_favors_for_them, ensemble).
rule_priority(people_may_develop_antagonism_towards_their_friends_who_have_recently_done_favors_for_them, 5).
rule_applies(people_may_develop_antagonism_towards_their_friends_who_have_recently_done_favors_for_them, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, did_a_favor_for).
rule_effect(people_may_develop_antagonism_towards_their_friends_who_have_recently_done_favors_for_them, set_intent(X, antagonize, Y, -5)).

rule_likelihood(people_may_feel_antagonized_towards_their_crush_after_being_in_the_company_of_strong_individuals_for, 1).
rule_type(people_may_feel_antagonized_towards_their_crush_after_being_in_the_company_of_strong_individuals_for, volition).
% People may feel antagonized towards their crush after being in the company of strong individuals for
rule_active(people_may_feel_antagonized_towards_their_crush_after_being_in_the_company_of_strong_individuals_for).
rule_category(people_may_feel_antagonized_towards_their_crush_after_being_in_the_company_of_strong_individuals_for, antagonism_hostility).
rule_source(people_may_feel_antagonized_towards_their_crush_after_being_in_the_company_of_strong_individuals_for, ensemble).
rule_priority(people_may_feel_antagonized_towards_their_crush_after_being_in_the_company_of_strong_individuals_for, 1).
rule_applies(people_may_feel_antagonized_towards_their_crush_after_being_in_the_company_of_strong_individuals_for, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, nice).
rule_effect(people_may_feel_antagonized_towards_their_crush_after_being_in_the_company_of_strong_individuals_for, set_intent(X, antagonize, Y, -1)).

rule_likelihood(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_in_common, 1).
rule_type(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_in_common, volition).
% People tend to antagonize their crush when they have more than six friends in common.
rule_active(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_in_common).
rule_category(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_in_common, antagonism_hostility).
rule_source(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_in_common, ensemble).
rule_priority(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_in_common, 3).
rule_applies(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_in_common, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, mean).
rule_effect(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_in_common, set_intent(X, antagonize, Y, 3)).

rule_likelihood(people_may_feel_antagonized_towards_those_they_helped_recently_if_their_friendship_strength_is_above_a_certain, 1).
rule_type(people_may_feel_antagonized_towards_those_they_helped_recently_if_their_friendship_strength_is_above_a_certain, volition).
% People may feel antagonized towards those they helped recently if their friendship strength is above a certain
rule_active(people_may_feel_antagonized_towards_those_they_helped_recently_if_their_friendship_strength_is_above_a_certain).
rule_category(people_may_feel_antagonized_towards_those_they_helped_recently_if_their_friendship_strength_is_above_a_certain, antagonism_hostility).
rule_source(people_may_feel_antagonized_towards_those_they_helped_recently_if_their_friendship_strength_is_above_a_certain, ensemble).
rule_priority(people_may_feel_antagonized_towards_those_they_helped_recently_if_their_friendship_strength_is_above_a_certain, 3).
rule_applies(people_may_feel_antagonized_towards_those_they_helped_recently_if_their_friendship_strength_is_above_a_certain, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, did_a_favor_for).
rule_effect(people_may_feel_antagonized_towards_those_they_helped_recently_if_their_friendship_strength_is_above_a_certain, set_intent(X, antagonize, Y, -3)).

rule_likelihood(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_within_a_year, 1).
rule_type(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_within_a_year, volition).
% People tend to antagonize their crush when they have more than six friends within a year
rule_active(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_within_a_year).
rule_category(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_within_a_year, antagonism_hostility).
rule_source(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_within_a_year, ensemble).
rule_priority(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_within_a_year, 1).
rule_applies(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_within_a_year, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, mean).
rule_effect(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_within_a_year, set_intent(X, antagonize, Y, 1)).

rule_likelihood(people_who_have_a_strong_desire_to_antagonize_their_crush_due_to_having_more_than, 1).
rule_type(people_who_have_a_strong_desire_to_antagonize_their_crush_due_to_having_more_than, volition).
% People who have a strong desire to antagonize their crush due to having more than 
rule_active(people_who_have_a_strong_desire_to_antagonize_their_crush_due_to_having_more_than).
rule_category(people_who_have_a_strong_desire_to_antagonize_their_crush_due_to_having_more_than, antagonism_hostility).
rule_source(people_who_have_a_strong_desire_to_antagonize_their_crush_due_to_having_more_than, ensemble).
rule_priority(people_who_have_a_strong_desire_to_antagonize_their_crush_due_to_having_more_than, 1).
rule_applies(people_who_have_a_strong_desire_to_antagonize_their_crush_due_to_having_more_than, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, did_a_favor_for).
rule_effect(people_who_have_a_strong_desire_to_antagonize_their_crush_due_to_having_more_than, set_intent(X, antagonize, Y, -1)).

rule_likelihood(people_tend_to_antagonize_their_crush_when_they_are_within_a_close_knit_social, 1).
rule_type(people_tend_to_antagonize_their_crush_when_they_are_within_a_close_knit_social, volition).
% People tend to antagonize their crush when they are within a close-knit social
rule_active(people_tend_to_antagonize_their_crush_when_they_are_within_a_close_knit_social).
rule_category(people_tend_to_antagonize_their_crush_when_they_are_within_a_close_knit_social, antagonism_hostility).
rule_source(people_tend_to_antagonize_their_crush_when_they_are_within_a_close_knit_social, ensemble).
rule_priority(people_tend_to_antagonize_their_crush_when_they_are_within_a_close_knit_social, 5).
rule_applies(people_tend_to_antagonize_their_crush_when_they_are_within_a_close_knit_social, X, Y) :-
    network(X, 'z', romance, Romance_val), Romance_val > 6,
    event(Y, mean).
rule_effect(people_tend_to_antagonize_their_crush_when_they_are_within_a_close_knit_social, set_intent(X, antagonize, Y, 5)).

rule_likelihood(people_are_likely_to_antagonize_their_crush_after_doing_a_favor_for_them_within_the_past, 1).
rule_type(people_are_likely_to_antagonize_their_crush_after_doing_a_favor_for_them_within_the_past, volition).
% People are likely to antagonize their crush after doing a favor for them within the past
rule_active(people_are_likely_to_antagonize_their_crush_after_doing_a_favor_for_them_within_the_past).
rule_category(people_are_likely_to_antagonize_their_crush_after_doing_a_favor_for_them_within_the_past, antagonism_hostility).
rule_source(people_are_likely_to_antagonize_their_crush_after_doing_a_favor_for_them_within_the_past, ensemble).
rule_priority(people_are_likely_to_antagonize_their_crush_after_doing_a_favor_for_them_within_the_past, 5).
rule_applies(people_are_likely_to_antagonize_their_crush_after_doing_a_favor_for_them_within_the_past, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, did_a_favor_for).
rule_effect(people_are_likely_to_antagonize_their_crush_after_doing_a_favor_for_them_within_the_past, set_intent(X, antagonize, Y, -5)).

rule_likelihood(people_tend_to_antagonize_their_crush_when_they_are_within_a_close_knit_family, 1).
rule_type(people_tend_to_antagonize_their_crush_when_they_are_within_a_close_knit_family, volition).
% People tend to antagonize their crush when they are within a close-knit family
rule_active(people_tend_to_antagonize_their_crush_when_they_are_within_a_close_knit_family).
rule_category(people_tend_to_antagonize_their_crush_when_they_are_within_a_close_knit_family, antagonism_hostility).
rule_source(people_tend_to_antagonize_their_crush_when_they_are_within_a_close_knit_family, ensemble).
rule_priority(people_tend_to_antagonize_their_crush_when_they_are_within_a_close_knit_family, 3).
rule_applies(people_tend_to_antagonize_their_crush_when_they_are_within_a_close_knit_family, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, mean).
rule_effect(people_tend_to_antagonize_their_crush_when_they_are_within_a_close_knit_family, set_intent(X, antagonize, Y, 3)).

rule_likelihood(people_may_develop_antagonistic_feelings_towards_their_crush_over_time_if_they_have_a_larger_than, 1).
rule_type(people_may_develop_antagonistic_feelings_towards_their_crush_over_time_if_they_have_a_larger_than, volition).
% People may develop antagonistic feelings towards their crush over time if they have a larger than
rule_active(people_may_develop_antagonistic_feelings_towards_their_crush_over_time_if_they_have_a_larger_than).
rule_category(people_may_develop_antagonistic_feelings_towards_their_crush_over_time_if_they_have_a_larger_than, antagonism_hostility).
rule_source(people_may_develop_antagonistic_feelings_towards_their_crush_over_time_if_they_have_a_larger_than, ensemble).
rule_priority(people_may_develop_antagonistic_feelings_towards_their_crush_over_time_if_they_have_a_larger_than, 1).
rule_applies(people_may_develop_antagonistic_feelings_towards_their_crush_over_time_if_they_have_a_larger_than, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, mean).
rule_effect(people_may_develop_antagonistic_feelings_towards_their_crush_over_time_if_they_have_a_larger_than, set_intent(X, antagonize, Y, 1)).

rule_likelihood(people_may_develop_antagonism_towards_those_they_ve_favored_recently_if_their_familial_network, 1).
rule_type(people_may_develop_antagonism_towards_those_they_ve_favored_recently_if_their_familial_network, volition).
% People may develop antagonism towards those they’ve favored recently if their familial network
rule_active(people_may_develop_antagonism_towards_those_they_ve_favored_recently_if_their_familial_network).
rule_category(people_may_develop_antagonism_towards_those_they_ve_favored_recently_if_their_familial_network, antagonism_hostility).
rule_source(people_may_develop_antagonism_towards_those_they_ve_favored_recently_if_their_familial_network, ensemble).
rule_priority(people_may_develop_antagonism_towards_those_they_ve_favored_recently_if_their_familial_network, 1).
rule_applies(people_may_develop_antagonism_towards_those_they_ve_favored_recently_if_their_familial_network, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, did_a_favor_for).
rule_effect(people_may_develop_antagonism_towards_those_they_ve_favored_recently_if_their_familial_network, set_intent(X, antagonize, Y, -1)).

rule_likelihood(people_with_high_antagonism_towards_strong_individuals_and_a_recent_interest_in_their_crush_are_likely, 1).
rule_type(people_with_high_antagonism_towards_strong_individuals_and_a_recent_interest_in_their_crush_are_likely, volition).
% People with high antagonism towards strong individuals and a recent interest in their crush are likely
rule_active(people_with_high_antagonism_towards_strong_individuals_and_a_recent_interest_in_their_crush_are_likely).
rule_category(people_with_high_antagonism_towards_strong_individuals_and_a_recent_interest_in_their_crush_are_likely, antagonism_hostility).
rule_source(people_with_high_antagonism_towards_strong_individuals_and_a_recent_interest_in_their_crush_are_likely, ensemble).
rule_priority(people_with_high_antagonism_towards_strong_individuals_and_a_recent_interest_in_their_crush_are_likely, 3).
rule_applies(people_with_high_antagonism_towards_strong_individuals_and_a_recent_interest_in_their_crush_are_likely, X, Y) :-
    network(X, 'z', antagonism, Antagonism_val), Antagonism_val > 6,
    event(Y, mean).
rule_effect(people_with_high_antagonism_towards_strong_individuals_and_a_recent_interest_in_their_crush_are_likely, set_intent(X, antagonize, Y, -3)).

rule_likelihood(people_with_high_antagonism_towards_strong_individuals_and_who_have_recently_done_a_favor_for_someone_may, 1).
rule_type(people_with_high_antagonism_towards_strong_individuals_and_who_have_recently_done_a_favor_for_someone_may, volition).
% People with high antagonism towards strong individuals and who have recently done a favor for someone may
rule_active(people_with_high_antagonism_towards_strong_individuals_and_who_have_recently_done_a_favor_for_someone_may).
rule_category(people_with_high_antagonism_towards_strong_individuals_and_who_have_recently_done_a_favor_for_someone_may, antagonism_hostility).
rule_source(people_with_high_antagonism_towards_strong_individuals_and_who_have_recently_done_a_favor_for_someone_may, ensemble).
rule_priority(people_with_high_antagonism_towards_strong_individuals_and_who_have_recently_done_a_favor_for_someone_may, 3).
rule_applies(people_with_high_antagonism_towards_strong_individuals_and_who_have_recently_done_a_favor_for_someone_may, X, Y) :-
    network(X, 'z', antagonism, Antagonism_val), Antagonism_val > 6,
    event(Y, did_a_favor_for).
rule_effect(people_with_high_antagonism_towards_strong_individuals_and_who_have_recently_done_a_favor_for_someone_may, set_intent(X, antagonize, Y, 3)).

rule_likelihood(people_tend_to_antagonize_weaker_individuals_when_they_are_significantly_more_attracted_to_someone_else, 1).
rule_type(people_tend_to_antagonize_weaker_individuals_when_they_are_significantly_more_attracted_to_someone_else, volition).
% People tend to antagonize weaker individuals when they are significantly more attracted to someone else
rule_active(people_tend_to_antagonize_weaker_individuals_when_they_are_significantly_more_attracted_to_someone_else).
rule_category(people_tend_to_antagonize_weaker_individuals_when_they_are_significantly_more_attracted_to_someone_else, antagonism_hostility).
rule_source(people_tend_to_antagonize_weaker_individuals_when_they_are_significantly_more_attracted_to_someone_else, ensemble).
rule_priority(people_tend_to_antagonize_weaker_individuals_when_they_are_significantly_more_attracted_to_someone_else, 1).
rule_applies(people_tend_to_antagonize_weaker_individuals_when_they_are_significantly_more_attracted_to_someone_else, X, Y) :-
    network(X, 'z', antagonism, Antagonism_val), Antagonism_val > 6,
    event(Y, mean).
rule_effect(people_tend_to_antagonize_weaker_individuals_when_they_are_significantly_more_attracted_to_someone_else, set_intent(X, antagonize, Y, -2)).

rule_likelihood(people_with_high_antagonism_towards_others_x_z_who_did_a_favor_for_someone, 1).
rule_type(people_with_high_antagonism_towards_others_x_z_who_did_a_favor_for_someone, volition).
% People with high antagonism towards others (x > z) who did a favor for someone
rule_active(people_with_high_antagonism_towards_others_x_z_who_did_a_favor_for_someone).
rule_category(people_with_high_antagonism_towards_others_x_z_who_did_a_favor_for_someone, antagonism_hostility).
rule_source(people_with_high_antagonism_towards_others_x_z_who_did_a_favor_for_someone, ensemble).
rule_priority(people_with_high_antagonism_towards_others_x_z_who_did_a_favor_for_someone, 1).
rule_applies(people_with_high_antagonism_towards_others_x_z_who_did_a_favor_for_someone, X, Y) :-
    network(X, 'z', antagonism, Antagonism_val), Antagonism_val > 6,
    event(Y, did_a_favor_for).
rule_effect(people_with_high_antagonism_towards_others_x_z_who_did_a_favor_for_someone, set_intent(X, antagonize, Y, 2)).

rule_likelihood(people_want_to_antagonize_those_they_are_more_distant_from_than_their_crush_by_6, 1).
rule_type(people_want_to_antagonize_those_they_are_more_distant_from_than_their_crush_by_6, volition).
% People want to antagonize those they are more distant from than their crush by 6
rule_active(people_want_to_antagonize_those_they_are_more_distant_from_than_their_crush_by_6).
rule_category(people_want_to_antagonize_those_they_are_more_distant_from_than_their_crush_by_6, antagonism_hostility).
rule_source(people_want_to_antagonize_those_they_are_more_distant_from_than_their_crush_by_6, ensemble).
rule_priority(people_want_to_antagonize_those_they_are_more_distant_from_than_their_crush_by_6, 1).
rule_applies(people_want_to_antagonize_those_they_are_more_distant_from_than_their_crush_by_6, X, Y) :-
    network(X, 'z', antagonism, Antagonism_val), Antagonism_val > 6,
    event(Y, mean).
rule_effect(people_want_to_antagonize_those_they_are_more_distant_from_than_their_crush_by_6, set_intent(X, antagonize, Y, -1)).

rule_likelihood(people_who_have_a_high_antagonism_level_towards_someone_and_have_been_favored_by_that_person, 1).
rule_type(people_who_have_a_high_antagonism_level_towards_someone_and_have_been_favored_by_that_person, volition).
% People who have a high antagonism level towards someone and have been favored by that person
rule_active(people_who_have_a_high_antagonism_level_towards_someone_and_have_been_favored_by_that_person).
rule_category(people_who_have_a_high_antagonism_level_towards_someone_and_have_been_favored_by_that_person, antagonism_hostility).
rule_source(people_who_have_a_high_antagonism_level_towards_someone_and_have_been_favored_by_that_person, ensemble).
rule_priority(people_who_have_a_high_antagonism_level_towards_someone_and_have_been_favored_by_that_person, 1).
rule_applies(people_who_have_a_high_antagonism_level_towards_someone_and_have_been_favored_by_that_person, X, Y) :-
    network(X, 'z', antagonism, Antagonism_val), Antagonism_val > 6,
    event(Y, did_a_favor_for).
rule_effect(people_who_have_a_high_antagonism_level_towards_someone_and_have_been_favored_by_that_person, set_intent(X, antagonize, Y, 1)).

rule_likelihood(people_seek_to_reduce_antagonism_towards_stronger_individuals_in_their_social_network, 1).
rule_type(people_seek_to_reduce_antagonism_towards_stronger_individuals_in_their_social_network, volition).
% People seek to reduce antagonism towards stronger individuals in their social network.
rule_active(people_seek_to_reduce_antagonism_towards_stronger_individuals_in_their_social_network).
rule_category(people_seek_to_reduce_antagonism_towards_stronger_individuals_in_their_social_network, antagonism_hostility).
rule_source(people_seek_to_reduce_antagonism_towards_stronger_individuals_in_their_social_network, ensemble).
rule_priority(people_seek_to_reduce_antagonism_towards_stronger_individuals_in_their_social_network, 1).
rule_applies(people_seek_to_reduce_antagonism_towards_stronger_individuals_in_their_social_network, X, Y) :-
    network(X, Y, antagonism, Antagonism_val), Antagonism_val > 6.
rule_effect(people_seek_to_reduce_antagonism_towards_stronger_individuals_in_their_social_network, set_intent(X, candid, Y, -2)).

rule_likelihood(people_with_feuding_relationships_seek_to_date_their_crushes_despite_the_conflicts, 1).
rule_type(people_with_feuding_relationships_seek_to_date_their_crushes_despite_the_conflicts, volition).
% People with feuding relationships seek to date their crushes despite the conflicts.
rule_active(people_with_feuding_relationships_seek_to_date_their_crushes_despite_the_conflicts).
rule_category(people_with_feuding_relationships_seek_to_date_their_crushes_despite_the_conflicts, antagonism_hostility).
rule_source(people_with_feuding_relationships_seek_to_date_their_crushes_despite_the_conflicts, ensemble).
rule_priority(people_with_feuding_relationships_seek_to_date_their_crushes_despite_the_conflicts, 1).
rule_applies(people_with_feuding_relationships_seek_to_date_their_crushes_despite_the_conflicts, X, Y) :-
    directed_status(X, 'z', feuding),
    directed_status(Y, 'z', feuding).
rule_effect(people_with_feuding_relationships_seek_to_date_their_crushes_despite_the_conflicts, set_intent(X, candid, Y, 1)).

rule_likelihood(people_desire_to_associate_with_those_who_are_less_antagonistic_towards_their_connections, 1).
rule_type(people_desire_to_associate_with_those_who_are_less_antagonistic_towards_their_connections, volition).
% People desire to associate with those who are less antagonistic towards their connections.
rule_active(people_desire_to_associate_with_those_who_are_less_antagonistic_towards_their_connections).
rule_category(people_desire_to_associate_with_those_who_are_less_antagonistic_towards_their_connections, antagonism_hostility).
rule_source(people_desire_to_associate_with_those_who_are_less_antagonistic_towards_their_connections, ensemble).
rule_priority(people_desire_to_associate_with_those_who_are_less_antagonistic_towards_their_connections, 1).
rule_applies(people_desire_to_associate_with_those_who_are_less_antagonistic_towards_their_connections, X, Y) :-
    network(X, 'z', antagonism, Antagonism_val), Antagonism_val > 6,
    network(Y, 'z', antagonism, Antagonism_val), Antagonism_val > 6.
rule_effect(people_desire_to_associate_with_those_who_are_less_antagonistic_towards_their_connections, set_intent(X, candid, Y, 2)).

rule_likelihood(people_seek_to_distance_themselves_from_feuding_individuals, 1).
rule_type(people_seek_to_distance_themselves_from_feuding_individuals, volition).
% People seek to distance themselves from feuding individuals.
rule_active(people_seek_to_distance_themselves_from_feuding_individuals).
rule_category(people_seek_to_distance_themselves_from_feuding_individuals, antagonism_hostility).
rule_source(people_seek_to_distance_themselves_from_feuding_individuals, ensemble).
rule_priority(people_seek_to_distance_themselves_from_feuding_individuals, 3).
rule_applies(people_seek_to_distance_themselves_from_feuding_individuals, X, Y) :-
    directed_status(X, Y, feuding).
rule_effect(people_seek_to_distance_themselves_from_feuding_individuals, set_intent(X, favor, Y, -3)).

rule_likelihood(people_tend_to_avoid_strong_individuals_due_to_antagonism_however_they_may_develop_romantic, 1).
rule_type(people_tend_to_avoid_strong_individuals_due_to_antagonism_however_they_may_develop_romantic, volition).
% People tend to avoid strong individuals due to antagonism. However, they may develop romantic
rule_active(people_tend_to_avoid_strong_individuals_due_to_antagonism_however_they_may_develop_romantic).
rule_category(people_tend_to_avoid_strong_individuals_due_to_antagonism_however_they_may_develop_romantic, antagonism_hostility).
rule_source(people_tend_to_avoid_strong_individuals_due_to_antagonism_however_they_may_develop_romantic, ensemble).
rule_priority(people_tend_to_avoid_strong_individuals_due_to_antagonism_however_they_may_develop_romantic, 5).
rule_applies(people_tend_to_avoid_strong_individuals_due_to_antagonism_however_they_may_develop_romantic, X, Y) :-
    network(X, Y, antagonism, Antagonism_val), Antagonism_val > 6.
rule_effect(people_tend_to_avoid_strong_individuals_due_to_antagonism_however_they_may_develop_romantic, set_intent(X, favor, Y, -5)).

rule_likelihood(people_with_feuding_relationships_towards_strong_individuals_and_their_respective_counterparts_desire_to_form_a_favor, 1).
rule_type(people_with_feuding_relationships_towards_strong_individuals_and_their_respective_counterparts_desire_to_form_a_favor, volition).
% People with feuding relationships towards strong individuals and their respective counterparts desire to form a favor
rule_active(people_with_feuding_relationships_towards_strong_individuals_and_their_respective_counterparts_desire_to_form_a_favor).
rule_category(people_with_feuding_relationships_towards_strong_individuals_and_their_respective_counterparts_desire_to_form_a_favor, antagonism_hostility).
rule_source(people_with_feuding_relationships_towards_strong_individuals_and_their_respective_counterparts_desire_to_form_a_favor, ensemble).
rule_priority(people_with_feuding_relationships_towards_strong_individuals_and_their_respective_counterparts_desire_to_form_a_favor, 1).
rule_applies(people_with_feuding_relationships_towards_strong_individuals_and_their_respective_counterparts_desire_to_form_a_favor, X, Y) :-
    directed_status(X, 'z', feuding),
    directed_status(Y, 'z', feuding).
rule_effect(people_with_feuding_relationships_towards_strong_individuals_and_their_respective_counterparts_desire_to_form_a_favor, set_intent(X, favor, Y, 1)).

rule_likelihood(people_desire_to_form_connections_with_influential_individuals_when_they_have_a_strong_antagonistic_network_sentiment, 1).
rule_type(people_desire_to_form_connections_with_influential_individuals_when_they_have_a_strong_antagonistic_network_sentiment, volition).
% People desire to form connections with influential individuals when they have a strong antagonistic network sentiment
rule_active(people_desire_to_form_connections_with_influential_individuals_when_they_have_a_strong_antagonistic_network_sentiment).
rule_category(people_desire_to_form_connections_with_influential_individuals_when_they_have_a_strong_antagonistic_network_sentiment, antagonism_hostility).
rule_source(people_desire_to_form_connections_with_influential_individuals_when_they_have_a_strong_antagonistic_network_sentiment, ensemble).
rule_priority(people_desire_to_form_connections_with_influential_individuals_when_they_have_a_strong_antagonistic_network_sentiment, 1).
rule_applies(people_desire_to_form_connections_with_influential_individuals_when_they_have_a_strong_antagonistic_network_sentiment, X, Y) :-
    network(X, 'z', antagonism, Antagonism_val), Antagonism_val > 6,
    event(Y, mean).
rule_effect(people_desire_to_form_connections_with_influential_individuals_when_they_have_a_strong_antagonistic_network_sentiment, set_intent(X, favor, Y, 1)).

rule_likelihood(people_with_feuding_relationships_seek_to_improve_their_honor_by_getting_closer_to_influential_individuals, 1).
rule_type(people_with_feuding_relationships_seek_to_improve_their_honor_by_getting_closer_to_influential_individuals, volition).
% People with feuding relationships seek to improve their honor by getting closer to influential individuals.
rule_active(people_with_feuding_relationships_seek_to_improve_their_honor_by_getting_closer_to_influential_individuals).
rule_category(people_with_feuding_relationships_seek_to_improve_their_honor_by_getting_closer_to_influential_individuals, antagonism_hostility).
rule_source(people_with_feuding_relationships_seek_to_improve_their_honor_by_getting_closer_to_influential_individuals, ensemble).
rule_priority(people_with_feuding_relationships_seek_to_improve_their_honor_by_getting_closer_to_influential_individuals, 1).
rule_applies(people_with_feuding_relationships_seek_to_improve_their_honor_by_getting_closer_to_influential_individuals, X, Y) :-
    directed_status(X, Y, feuding).
rule_effect(people_with_feuding_relationships_seek_to_improve_their_honor_by_getting_closer_to_influential_individuals, set_intent(X, honor, Y, -2)).

rule_likelihood(people_with_feuding_relationships_aim_to_ingratiate_themselves_towards_those_they_have_conflicts_with, 1).
rule_type(people_with_feuding_relationships_aim_to_ingratiate_themselves_towards_those_they_have_conflicts_with, volition).
% People with feuding relationships aim to ingratiate themselves towards those they have conflicts with
rule_active(people_with_feuding_relationships_aim_to_ingratiate_themselves_towards_those_they_have_conflicts_with).
rule_category(people_with_feuding_relationships_aim_to_ingratiate_themselves_towards_those_they_have_conflicts_with, antagonism_hostility).
rule_source(people_with_feuding_relationships_aim_to_ingratiate_themselves_towards_those_they_have_conflicts_with, ensemble).
rule_priority(people_with_feuding_relationships_aim_to_ingratiate_themselves_towards_those_they_have_conflicts_with, 3).
rule_applies(people_with_feuding_relationships_aim_to_ingratiate_themselves_towards_those_they_have_conflicts_with, X, Y) :-
    directed_status(X, Y, feuding).
rule_effect(people_with_feuding_relationships_aim_to_ingratiate_themselves_towards_those_they_have_conflicts_with, set_intent(X, ingratiate, Y, -3)).

rule_likelihood(people_seek_to_ingratiate_themselves_with_those_they_have_a_significant_antagonistic_relationship_towards, 1).
rule_type(people_seek_to_ingratiate_themselves_with_those_they_have_a_significant_antagonistic_relationship_towards, volition).
% People seek to ingratiate themselves with those they have a significant antagonistic relationship towards
rule_active(people_seek_to_ingratiate_themselves_with_those_they_have_a_significant_antagonistic_relationship_towards).
rule_category(people_seek_to_ingratiate_themselves_with_those_they_have_a_significant_antagonistic_relationship_towards, antagonism_hostility).
rule_source(people_seek_to_ingratiate_themselves_with_those_they_have_a_significant_antagonistic_relationship_towards, ensemble).
rule_priority(people_seek_to_ingratiate_themselves_with_those_they_have_a_significant_antagonistic_relationship_towards, 1).
rule_applies(people_seek_to_ingratiate_themselves_with_those_they_have_a_significant_antagonistic_relationship_towards, X, Y) :-
    network(X, Y, antagonism, Antagonism_val), Antagonism_val > 6.
rule_effect(people_seek_to_ingratiate_themselves_with_those_they_have_a_significant_antagonistic_relationship_towards, set_intent(X, ingratiate, Y, -1)).

rule_likelihood(people_avoid_getting_close_to_feuding_individuals, 1).
rule_type(people_avoid_getting_close_to_feuding_individuals, volition).
% People avoid getting close to feuding individuals
rule_active(people_avoid_getting_close_to_feuding_individuals).
rule_category(people_avoid_getting_close_to_feuding_individuals, antagonism_hostility).
rule_source(people_avoid_getting_close_to_feuding_individuals, ensemble).
rule_priority(people_avoid_getting_close_to_feuding_individuals, 5).
rule_applies(people_avoid_getting_close_to_feuding_individuals, X, Y) :-
    directed_status(X, Y, feuding).
rule_effect(people_avoid_getting_close_to_feuding_individuals, set_intent(X, kind, Y, -5)).

rule_likelihood(people_tend_to_avoid_strong_antagonists_and_may_seek_emotional_connections_with_those_they_have_cr, 1).
rule_type(people_tend_to_avoid_strong_antagonists_and_may_seek_emotional_connections_with_those_they_have_cr, volition).
% People tend to avoid strong antagonists and may seek emotional connections with those they have cr
rule_active(people_tend_to_avoid_strong_antagonists_and_may_seek_emotional_connections_with_those_they_have_cr).
rule_category(people_tend_to_avoid_strong_antagonists_and_may_seek_emotional_connections_with_those_they_have_cr, antagonism_hostility).
rule_source(people_tend_to_avoid_strong_antagonists_and_may_seek_emotional_connections_with_those_they_have_cr, ensemble).
rule_priority(people_tend_to_avoid_strong_antagonists_and_may_seek_emotional_connections_with_those_they_have_cr, 5).
rule_applies(people_tend_to_avoid_strong_antagonists_and_may_seek_emotional_connections_with_those_they_have_cr, X, Y) :-
    network(X, Y, antagonism, Antagonism_val), Antagonism_val > 6.
rule_effect(people_tend_to_avoid_strong_antagonists_and_may_seek_emotional_connections_with_those_they_have_cr, set_intent(X, kind, Y, -5)).

rule_likelihood(people_seek_to_distance_themselves_from_individuals_with_strong_antagonistic_influences, 1).
rule_type(people_seek_to_distance_themselves_from_individuals_with_strong_antagonistic_influences, volition).
% People seek to distance themselves from individuals with strong antagonistic influences.
rule_active(people_seek_to_distance_themselves_from_individuals_with_strong_antagonistic_influences).
rule_category(people_seek_to_distance_themselves_from_individuals_with_strong_antagonistic_influences, antagonism_hostility).
rule_source(people_seek_to_distance_themselves_from_individuals_with_strong_antagonistic_influences, ensemble).
rule_priority(people_seek_to_distance_themselves_from_individuals_with_strong_antagonistic_influences, 3).
rule_applies(people_seek_to_distance_themselves_from_individuals_with_strong_antagonistic_influences, X, Y) :-
    network(X, Y, antagonism, Antagonism_val), Antagonism_val < 4.
rule_effect(people_seek_to_distance_themselves_from_individuals_with_strong_antagonistic_influences, set_intent(X, kind, Y, 3)).

rule_likelihood(people_seek_to_reduce_antagonism_and_increase_positive_influence_in_their_social_networks, 1).
rule_type(people_seek_to_reduce_antagonism_and_increase_positive_influence_in_their_social_networks, volition).
% People seek to reduce antagonism and increase positive influence in their social networks.
rule_active(people_seek_to_reduce_antagonism_and_increase_positive_influence_in_their_social_networks).
rule_category(people_seek_to_reduce_antagonism_and_increase_positive_influence_in_their_social_networks, antagonism_hostility).
rule_source(people_seek_to_reduce_antagonism_and_increase_positive_influence_in_their_social_networks, ensemble).
rule_priority(people_seek_to_reduce_antagonism_and_increase_positive_influence_in_their_social_networks, 1).
rule_applies(people_seek_to_reduce_antagonism_and_increase_positive_influence_in_their_social_networks, X, Y) :-
    network(X, Y, antagonism, Antagonism_val), Antagonism_val > 6.
rule_effect(people_seek_to_reduce_antagonism_and_increase_positive_influence_in_their_social_networks, set_intent(X, manipulate, Y, 2)).

rule_likelihood(people_with_feuding_relationships_aim_to_increase_trust_towards_strong_individuals, 1).
rule_type(people_with_feuding_relationships_aim_to_increase_trust_towards_strong_individuals, volition).
% People with feuding relationships aim to increase trust towards strong individuals.
rule_active(people_with_feuding_relationships_aim_to_increase_trust_towards_strong_individuals).
rule_category(people_with_feuding_relationships_aim_to_increase_trust_towards_strong_individuals, antagonism_hostility).
rule_source(people_with_feuding_relationships_aim_to_increase_trust_towards_strong_individuals, ensemble).
rule_priority(people_with_feuding_relationships_aim_to_increase_trust_towards_strong_individuals, 5).
rule_applies(people_with_feuding_relationships_aim_to_increase_trust_towards_strong_individuals, X, Y) :-
    directed_status(X, Y, feuding).
rule_effect(people_with_feuding_relationships_aim_to_increase_trust_towards_strong_individuals, set_intent(X, trust, Y, -5)).

rule_likelihood(people_seek_to_reduce_antagonism_and_increase_trust_towards_stronger_individuals_in_their_network, 1).
rule_type(people_seek_to_reduce_antagonism_and_increase_trust_towards_stronger_individuals_in_their_network, volition).
% People seek to reduce antagonism and increase trust towards stronger individuals in their network.
rule_active(people_seek_to_reduce_antagonism_and_increase_trust_towards_stronger_individuals_in_their_network).
rule_category(people_seek_to_reduce_antagonism_and_increase_trust_towards_stronger_individuals_in_their_network, antagonism_hostility).
rule_source(people_seek_to_reduce_antagonism_and_increase_trust_towards_stronger_individuals_in_their_network, ensemble).
rule_priority(people_seek_to_reduce_antagonism_and_increase_trust_towards_stronger_individuals_in_their_network, 5).
rule_applies(people_seek_to_reduce_antagonism_and_increase_trust_towards_stronger_individuals_in_their_network, X, Y) :-
    network(X, Y, antagonism, Antagonism_val), Antagonism_val > 6.
rule_effect(people_seek_to_reduce_antagonism_and_increase_trust_towards_stronger_individuals_in_their_network, set_intent(X, trust, Y, -5)).

%% ═══════════════════════════════════════════════════════════
%% Category: appearance-beauty
%% ═══════════════════════════════════════════════════════════

%% Ensemble Volition Rules: appearance-beauty
%% Source: data/ensemble/volitionRules/appearance-beauty.json
%% Converted: 2026-04-02T20:09:49.731Z
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

%% ═══════════════════════════════════════════════════════════
%% Category: attention-seeking
%% ═══════════════════════════════════════════════════════════

%% Ensemble Volition Rules: attention-seeking
%% Source: data/ensemble/volitionRules/attention-seeking.json
%% Converted: 2026-04-02T20:09:49.731Z
%% Total rules: 15

rule_likelihood(unattractive_men_draw_less_attention_from_others, 1).
rule_type(unattractive_men_draw_less_attention_from_others, volition).
% Unattractive men draw less attention from others
rule_active(unattractive_men_draw_less_attention_from_others).
rule_category(unattractive_men_draw_less_attention_from_others, attention_seeking).
rule_source(unattractive_men_draw_less_attention_from_others, ensemble).
rule_priority(unattractive_men_draw_less_attention_from_others, 8).
rule_applies(unattractive_men_draw_less_attention_from_others, X, Y) :-
    \+ trait(X, beautiful),
    trait(X, female),
    trait(Y, male),
    attribute(X, charisma, Charisma_val), Charisma_val < 30.
rule_effect(unattractive_men_draw_less_attention_from_others, modify_network(Y, X, curiosity, '-', 10)).
rule_effect(unattractive_men_draw_less_attention_from_others, set_relationship(Y, X, esteem, -10)).

rule_likelihood(poor_women_of_low_social_standing_attract_attention_when_elegantly_dressed, 1).
rule_type(poor_women_of_low_social_standing_attract_attention_when_elegantly_dressed, volition).
% Poor women of low social standing attract attention when elegantly dressed
rule_active(poor_women_of_low_social_standing_attract_attention_when_elegantly_dressed).
rule_category(poor_women_of_low_social_standing_attract_attention_when_elegantly_dressed, attention_seeking).
rule_source(poor_women_of_low_social_standing_attract_attention_when_elegantly_dressed, ensemble).
rule_priority(poor_women_of_low_social_standing_attract_attention_when_elegantly_dressed, 5).
rule_applies(poor_women_of_low_social_standing_attract_attention_when_elegantly_dressed, X, Y) :-
    attribute(X, social_standing, Social_standing_val), Social_standing_val < 50,
    trait(X, poor),
    trait(X, elegantly_dressed),
    trait(X, female).
rule_effect(poor_women_of_low_social_standing_attract_attention_when_elegantly_dressed, modify_network(Y, X, curiosity, '+', 5)).
rule_effect(poor_women_of_low_social_standing_attract_attention_when_elegantly_dressed, set_relationship(Y, X, esteem, -5)).

rule_likelihood(a_shy_young_male_may_seek_the_attention_of_the_employee_of_the_woman_he_is_interested_in, 1).
rule_type(a_shy_young_male_may_seek_the_attention_of_the_employee_of_the_woman_he_is_interested_in, volition).
% A shy young male may seek the attention of the employee of the woman he is interested in
rule_active(a_shy_young_male_may_seek_the_attention_of_the_employee_of_the_woman_he_is_interested_in).
rule_category(a_shy_young_male_may_seek_the_attention_of_the_employee_of_the_woman_he_is_interested_in, attention_seeking).
rule_source(a_shy_young_male_may_seek_the_attention_of_the_employee_of_the_woman_he_is_interested_in, ensemble).
rule_priority(a_shy_young_male_may_seek_the_attention_of_the_employee_of_the_woman_he_is_interested_in, 5).
rule_applies(a_shy_young_male_may_seek_the_attention_of_the_employee_of_the_woman_he_is_interested_in, X, Y) :-
    trait(X, male),
    trait(X, young),
    trait('z', female),
    trait('z', young),
    trait('z', beautiful),
    attribute(Y, social_standing, Social_standing_val), Social_standing_val < 33,
    directed_status(Y, 'z', financially_dependent_on),
    trait(X, shy).
rule_effect(a_shy_young_male_may_seek_the_attention_of_the_employee_of_the_woman_he_is_interested_in, modify_network(X, Y, curiosity, '+', 5)).

rule_likelihood(non_virtuous_men_draw_the_attention_of_sex_workers, 1).
rule_type(non_virtuous_men_draw_the_attention_of_sex_workers, volition).
% Non-virtuous men draw the attention of sex workers
rule_active(non_virtuous_men_draw_the_attention_of_sex_workers).
rule_category(non_virtuous_men_draw_the_attention_of_sex_workers, attention_seeking).
rule_source(non_virtuous_men_draw_the_attention_of_sex_workers, ensemble).
rule_priority(non_virtuous_men_draw_the_attention_of_sex_workers, 5).
rule_applies(non_virtuous_men_draw_the_attention_of_sex_workers, X, Y) :-
    attribute(X, propriety, Propriety_val), Propriety_val < 30,
    trait(X, male),
    \+ trait(X, virtuous),
    trait(Y, criminal),
    trait(Y, poor).
rule_effect(non_virtuous_men_draw_the_attention_of_sex_workers, modify_network(Y, X, curiosity, '+', 5)).

rule_likelihood(beautiful_modest_poor_people_inspire_attention_and_affinity_in_rich_people, 1).
rule_type(beautiful_modest_poor_people_inspire_attention_and_affinity_in_rich_people, volition).
% Beautiful, modest, poor people inspire attention and affinity in rich people
rule_active(beautiful_modest_poor_people_inspire_attention_and_affinity_in_rich_people).
rule_category(beautiful_modest_poor_people_inspire_attention_and_affinity_in_rich_people, attention_seeking).
rule_source(beautiful_modest_poor_people_inspire_attention_and_affinity_in_rich_people, ensemble).
rule_priority(beautiful_modest_poor_people_inspire_attention_and_affinity_in_rich_people, 5).
rule_applies(beautiful_modest_poor_people_inspire_attention_and_affinity_in_rich_people, X, Y) :-
    trait(X, beautiful),
    trait(X, modest),
    trait(X, poor),
    trait(Y, rich),
    attribute(Y, social_standing, Social_standing_val), Social_standing_val > 60.
rule_effect(beautiful_modest_poor_people_inspire_attention_and_affinity_in_rich_people, modify_network(Y, X, curiosity, '+', 5)).
rule_effect(beautiful_modest_poor_people_inspire_attention_and_affinity_in_rich_people, modify_network(Y, X, affinity, '+', 5)).

rule_likelihood(people_with_high_social_standing_attract_attention_from_workers, 1).
rule_type(people_with_high_social_standing_attract_attention_from_workers, volition).
% People with high social standing attract attention from workers
rule_active(people_with_high_social_standing_attract_attention_from_workers).
rule_category(people_with_high_social_standing_attract_attention_from_workers, attention_seeking).
rule_source(people_with_high_social_standing_attract_attention_from_workers, ensemble).
rule_priority(people_with_high_social_standing_attract_attention_from_workers, 5).
rule_applies(people_with_high_social_standing_attract_attention_from_workers, X, Y) :-
    attribute(X, social_standing, Social_standing_val), Social_standing_val > 70,
    trait(X, rich),
    network(X, Y, affinity, Affinity_val), Affinity_val > 75,
    trait(Y, security_guard),
    attribute('z', propriety, Propriety_val), Propriety_val > 50,
    network('z', X, emulation, Emulation_val), Emulation_val > 50.
rule_effect(people_with_high_social_standing_attract_attention_from_workers, modify_network(Y, X, affinity, '+', 5)).

rule_likelihood(poor_crying_children_may_receive_attention_from_kind_curious_people, 1).
rule_type(poor_crying_children_may_receive_attention_from_kind_curious_people, volition).
% Poor, crying children may receive attention from kind, curious people
rule_active(poor_crying_children_may_receive_attention_from_kind_curious_people).
rule_category(poor_crying_children_may_receive_attention_from_kind_curious_people, attention_seeking).
rule_source(poor_crying_children_may_receive_attention_from_kind_curious_people, ensemble).
rule_priority(poor_crying_children_may_receive_attention_from_kind_curious_people, 5).
rule_applies(poor_crying_children_may_receive_attention_from_kind_curious_people, X, Y) :-
    trait(X, child),
    status(X, upset),
    attribute(Y, nosiness, Nosiness_val), Nosiness_val > 50,
    trait(Y, kind),
    trait(Y, attendee),
    trait(X, poor),
    trait(Y, female),
    attribute(Y, sensitiveness, Sensitiveness_val), Sensitiveness_val > 60.
rule_effect(poor_crying_children_may_receive_attention_from_kind_curious_people, modify_network(X, Y, affinity, '+', 5)).
rule_effect(poor_crying_children_may_receive_attention_from_kind_curious_people, modify_network(Y, X, curiosity, '+', 5)).

rule_likelihood(amused_and_happy_tourists_may_attract_the_attention_of_locals, 1).
rule_type(amused_and_happy_tourists_may_attract_the_attention_of_locals, volition).
% Amused and happy tourists may attract the attention of locals
rule_active(amused_and_happy_tourists_may_attract_the_attention_of_locals).
rule_category(amused_and_happy_tourists_may_attract_the_attention_of_locals, attention_seeking).
rule_source(amused_and_happy_tourists_may_attract_the_attention_of_locals, ensemble).
rule_priority(amused_and_happy_tourists_may_attract_the_attention_of_locals, 3).
rule_applies(amused_and_happy_tourists_may_attract_the_attention_of_locals, X, Y) :-
    attribute(X, cultural_knowledge, Cultural_knowledge_val), Cultural_knowledge_val > 80,
    attribute(Y, cultural_knowledge, Cultural_knowledge_val), Cultural_knowledge_val < 30,
    status(Y, happy),
    status(Y, amused),
    trait(Y, foreigner).
rule_effect(amused_and_happy_tourists_may_attract_the_attention_of_locals, modify_network(X, Y, curiosity, '+', 3)).

rule_likelihood(nosy_indiscreet_children_may_try_to_get_attention_from_others, 1).
rule_type(nosy_indiscreet_children_may_try_to_get_attention_from_others, volition).
% Nosy, indiscreet children may try to get attention from others
rule_active(nosy_indiscreet_children_may_try_to_get_attention_from_others).
rule_category(nosy_indiscreet_children_may_try_to_get_attention_from_others, attention_seeking).
rule_source(nosy_indiscreet_children_may_try_to_get_attention_from_others, ensemble).
rule_priority(nosy_indiscreet_children_may_try_to_get_attention_from_others, 5).
rule_applies(nosy_indiscreet_children_may_try_to_get_attention_from_others, X, Y) :-
    attribute(X, nosiness, Nosiness_val), Nosiness_val > 60,
    trait(X, child),
    trait(X, indiscreet).
rule_effect(nosy_indiscreet_children_may_try_to_get_attention_from_others, modify_network(X, Y, curiosity, '+', 5)).
rule_effect(nosy_indiscreet_children_may_try_to_get_attention_from_others, modify_network(Y, X, curiosity, '-', 3)).

rule_likelihood(appropriately_behaved_rich_people_may_attract_less_attention_from_non_rich_people, 1).
rule_type(appropriately_behaved_rich_people_may_attract_less_attention_from_non_rich_people, volition).
% Appropriately behaved rich people may attract less attention from non-rich people
rule_active(appropriately_behaved_rich_people_may_attract_less_attention_from_non_rich_people).
rule_category(appropriately_behaved_rich_people_may_attract_less_attention_from_non_rich_people, attention_seeking).
rule_source(appropriately_behaved_rich_people_may_attract_less_attention_from_non_rich_people, ensemble).
rule_priority(appropriately_behaved_rich_people_may_attract_less_attention_from_non_rich_people, 3).
rule_applies(appropriately_behaved_rich_people_may_attract_less_attention_from_non_rich_people, X, Y) :-
    trait(X, rich),
    \+ trait(Y, rich),
    attribute(X, propriety, Propriety_val), Propriety_val > 70.
rule_effect(appropriately_behaved_rich_people_may_attract_less_attention_from_non_rich_people, modify_network(X, Y, curiosity, '-', 3)).

rule_likelihood(shy_embarrassed_sensitive_people_have_less_desire_to_attract_attention, 1).
rule_type(shy_embarrassed_sensitive_people_have_less_desire_to_attract_attention, volition).
% Shy, embarrassed, sensitive people have less desire to attract attention
rule_active(shy_embarrassed_sensitive_people_have_less_desire_to_attract_attention).
rule_category(shy_embarrassed_sensitive_people_have_less_desire_to_attract_attention, attention_seeking).
rule_source(shy_embarrassed_sensitive_people_have_less_desire_to_attract_attention, ensemble).
rule_priority(shy_embarrassed_sensitive_people_have_less_desire_to_attract_attention, 1).
rule_applies(shy_embarrassed_sensitive_people_have_less_desire_to_attract_attention, X, Y) :-
    trait(X, shy),
    attribute(X, sensitiveness, Sensitiveness_val), Sensitiveness_val > 60,
    status(X, embarrassed),
    network(X, Y, affinity, Affinity_val), Affinity_val > 60.
rule_effect(shy_embarrassed_sensitive_people_have_less_desire_to_attract_attention, modify_network(X, Y, curiosity, '-', 1)).

rule_likelihood(a_young_provincial_may_draw_the_attention_of_a_pickpocket, 1).
rule_type(a_young_provincial_may_draw_the_attention_of_a_pickpocket, volition).
% A young provincial may draw the attention of a pickpocket
rule_active(a_young_provincial_may_draw_the_attention_of_a_pickpocket).
rule_category(a_young_provincial_may_draw_the_attention_of_a_pickpocket, attention_seeking).
rule_source(a_young_provincial_may_draw_the_attention_of_a_pickpocket, ensemble).
rule_priority(a_young_provincial_may_draw_the_attention_of_a_pickpocket, 5).
rule_applies(a_young_provincial_may_draw_the_attention_of_a_pickpocket, X, Y) :-
    trait(X, provincial),
    \+ trait(X, old),
    trait(Y, pickpocket).
rule_effect(a_young_provincial_may_draw_the_attention_of_a_pickpocket, modify_network(X, Y, affinity, '+', 5)).
rule_effect(a_young_provincial_may_draw_the_attention_of_a_pickpocket, modify_network(Y, X, curiosity, '+', 5)).

rule_likelihood(a_rich_old_man_may_focus_his_attention_on_a_poor_young_woman, 1).
rule_type(a_rich_old_man_may_focus_his_attention_on_a_poor_young_woman, volition).
% A rich old man may focus his attention on a poor young woman
rule_active(a_rich_old_man_may_focus_his_attention_on_a_poor_young_woman).
rule_category(a_rich_old_man_may_focus_his_attention_on_a_poor_young_woman, attention_seeking).
rule_source(a_rich_old_man_may_focus_his_attention_on_a_poor_young_woman, ensemble).
rule_priority(a_rich_old_man_may_focus_his_attention_on_a_poor_young_woman, 5).
rule_applies(a_rich_old_man_may_focus_his_attention_on_a_poor_young_woman, X, Y) :-
    trait(X, male),
    \+ trait(X, beautiful),
    trait(X, old),
    trait(Y, female),
    trait(Y, poor),
    trait(Y, young),
    trait(X, rich).
rule_effect(a_rich_old_man_may_focus_his_attention_on_a_poor_young_woman, modify_network(Y, X, curiosity, '+', 5)).
rule_effect(a_rich_old_man_may_focus_his_attention_on_a_poor_young_woman, modify_network(X, Y, affinity, '+', 5)).
rule_effect(a_rich_old_man_may_focus_his_attention_on_a_poor_young_woman, modify_network(X, Y, curiosity, '+', 5)).

rule_likelihood(unhappy_people_seek_to_increase_attention_from_sensitive_people_who_have_a_high_affinity_for_them, 1).
rule_type(unhappy_people_seek_to_increase_attention_from_sensitive_people_who_have_a_high_affinity_for_them, volition).
% Unhappy people seek to increase attention from sensitive people who have a high affinity for them
rule_active(unhappy_people_seek_to_increase_attention_from_sensitive_people_who_have_a_high_affinity_for_them).
rule_category(unhappy_people_seek_to_increase_attention_from_sensitive_people_who_have_a_high_affinity_for_them, attention_seeking).
rule_source(unhappy_people_seek_to_increase_attention_from_sensitive_people_who_have_a_high_affinity_for_them, ensemble).
rule_priority(unhappy_people_seek_to_increase_attention_from_sensitive_people_who_have_a_high_affinity_for_them, 5).
rule_applies(unhappy_people_seek_to_increase_attention_from_sensitive_people_who_have_a_high_affinity_for_them, X, Y) :-
    network(X, Y, affinity, Affinity_val), Affinity_val > 60,
    \+ status(Y, happy),
    attribute(X, sensitiveness, Sensitiveness_val), Sensitiveness_val > 60.
rule_effect(unhappy_people_seek_to_increase_attention_from_sensitive_people_who_have_a_high_affinity_for_them, modify_network(Y, X, curiosity, '+', 5)).

rule_likelihood(boastful_people_want_to_draw_attention_to_themselves_but_leave_others_annoyed, 1).
rule_type(boastful_people_want_to_draw_attention_to_themselves_but_leave_others_annoyed, volition).
% Boastful people want to draw attention to themselves but leave others annoyed
rule_active(boastful_people_want_to_draw_attention_to_themselves_but_leave_others_annoyed).
rule_category(boastful_people_want_to_draw_attention_to_themselves_but_leave_others_annoyed, attention_seeking).
rule_source(boastful_people_want_to_draw_attention_to_themselves_but_leave_others_annoyed, ensemble).
rule_priority(boastful_people_want_to_draw_attention_to_themselves_but_leave_others_annoyed, 5).
rule_applies(boastful_people_want_to_draw_attention_to_themselves_but_leave_others_annoyed, X, Y) :-
    trait(X, intimidating).
rule_effect(boastful_people_want_to_draw_attention_to_themselves_but_leave_others_annoyed, modify_network(X, Y, curiosity, '+', 5)).
rule_effect(boastful_people_want_to_draw_attention_to_themselves_but_leave_others_annoyed, modify_network(Y, Y, affinity, '-', 1)).
rule_effect(boastful_people_want_to_draw_attention_to_themselves_but_leave_others_annoyed, modify_network(X, Y, emulation, '+', 5)).

%% ═══════════════════════════════════════════════════════════
%% Category: attributes-self-improvement
%% ═══════════════════════════════════════════════════════════

%% Ensemble Volition Rules: attributes-self-improvement
%% Source: data/ensemble/volitionRules/attributes-self-improvement.json
%% Converted: 2026-04-02T20:09:49.731Z
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

%% ═══════════════════════════════════════════════════════════
%% Category: betrayal-revenge
%% ═══════════════════════════════════════════════════════════

%% Ensemble Volition Rules: betrayal-revenge
%% Source: data/ensemble/volitionRules/betrayal-revenge.json
%% Converted: 2026-04-02T20:09:49.731Z
%% Total rules: 30

rule_likelihood(evil_seeks_vengeance_on_good, 1).
rule_type(evil_seeks_vengeance_on_good, volition).
% Evil seeks vengeance on good.
rule_active(evil_seeks_vengeance_on_good).
rule_category(evil_seeks_vengeance_on_good, betrayal_revenge).
rule_source(evil_seeks_vengeance_on_good, ensemble).
rule_priority(evil_seeks_vengeance_on_good, 5).
rule_applies(evil_seeks_vengeance_on_good, X, Y) :-
    trait(X, evil),
    trait(Y, good).
rule_effect(evil_seeks_vengeance_on_good, modify_bond(X, Y, vengeance, '+', 5)).

rule_likelihood(a_rich_person_discovering_a_lie_from_a_false_rich_person_is_more_likely_to_seek_revenge, 1).
rule_type(a_rich_person_discovering_a_lie_from_a_false_rich_person_is_more_likely_to_seek_revenge, volition).
% A rich person discovering a lie from a false rich person is more likely to seek revenge
rule_active(a_rich_person_discovering_a_lie_from_a_false_rich_person_is_more_likely_to_seek_revenge).
rule_category(a_rich_person_discovering_a_lie_from_a_false_rich_person_is_more_likely_to_seek_revenge, betrayal_revenge).
rule_source(a_rich_person_discovering_a_lie_from_a_false_rich_person_is_more_likely_to_seek_revenge, ensemble).
rule_priority(a_rich_person_discovering_a_lie_from_a_false_rich_person_is_more_likely_to_seek_revenge, 3).
rule_applies(a_rich_person_discovering_a_lie_from_a_false_rich_person_is_more_likely_to_seek_revenge, X, Y) :-
    event(X, caught_in_a_lie_by),
    attribute(Y, social_standing, Social_standing_val), Social_standing_val > 66,
    trait(Y, credulous),
    directed_status(Y, X, trusts),
    network(Y, X, credibility, Credibility_val), Credibility_val > 66,
    attribute(X, social_standing, Social_standing_val), Social_standing_val < 33,
    trait(X, elegantly_dressed).
rule_effect(a_rich_person_discovering_a_lie_from_a_false_rich_person_is_more_likely_to_seek_revenge, set_relationship(X, Y, esteem, 3)).
rule_effect(a_rich_person_discovering_a_lie_from_a_false_rich_person_is_more_likely_to_seek_revenge, set_relationship(Y, X, esteem, 2)).
rule_effect(a_rich_person_discovering_a_lie_from_a_false_rich_person_is_more_likely_to_seek_revenge, modify_network(X, Y, credibility, '+', 3)).

rule_likelihood(liars_may_retaliate_when_exposed, 1).
rule_type(liars_may_retaliate_when_exposed, volition).
% Liars may retaliate when exposed
rule_active(liars_may_retaliate_when_exposed).
rule_category(liars_may_retaliate_when_exposed, betrayal_revenge).
rule_source(liars_may_retaliate_when_exposed, ensemble).
rule_priority(liars_may_retaliate_when_exposed, 5).
rule_applies(liars_may_retaliate_when_exposed, X, Y) :-
    trait(X, deceptive),
    event(X, caught_in_a_lie_by).
rule_effect(liars_may_retaliate_when_exposed, modify_network(X, Y, curiosity, '+', 5)).

rule_likelihood(people_harbor_resentment_towards_those_who_betray_them, 1).
rule_type(people_harbor_resentment_towards_those_who_betray_them, volition).
% People harbor resentment towards those who betray them.
rule_active(people_harbor_resentment_towards_those_who_betray_them).
rule_category(people_harbor_resentment_towards_those_who_betray_them, betrayal_revenge).
rule_source(people_harbor_resentment_towards_those_who_betray_them, ensemble).
rule_priority(people_harbor_resentment_towards_those_who_betray_them, 5).
rule_applies(people_harbor_resentment_towards_those_who_betray_them, X, Y) :-
    directed_status(X, Y, betrayed_by).
rule_effect(people_harbor_resentment_towards_those_who_betray_them, set_intent(X, antagonize, Y, 5)).

rule_likelihood(people_feel_antagonized_towards_those_who_betrayed_them_both_individually_and_collectively, 1).
rule_type(people_feel_antagonized_towards_those_who_betrayed_them_both_individually_and_collectively, volition).
% People feel antagonized towards those who betrayed them both individually and collectively.
rule_active(people_feel_antagonized_towards_those_who_betrayed_them_both_individually_and_collectively).
rule_category(people_feel_antagonized_towards_those_who_betrayed_them_both_individually_and_collectively, betrayal_revenge).
rule_source(people_feel_antagonized_towards_those_who_betrayed_them_both_individually_and_collectively, ensemble).
rule_priority(people_feel_antagonized_towards_those_who_betrayed_them_both_individually_and_collectively, 1).
rule_applies(people_feel_antagonized_towards_those_who_betrayed_them_both_individually_and_collectively, X, Y) :-
    directed_status(X, 'z', betrayed_by),
    directed_status(Y, 'z', betrayed_by).
rule_effect(people_feel_antagonized_towards_those_who_betrayed_them_both_individually_and_collectively, set_intent(X, antagonize, Y, -1)).

rule_likelihood(people_who_have_been_betrayed_by_someone_z_and_desire_to_distance_themselves_from_that_person, 1).
rule_type(people_who_have_been_betrayed_by_someone_z_and_desire_to_distance_themselves_from_that_person, volition).
% People who have been betrayed by someone (z) and desire to distance themselves from that person
rule_active(people_who_have_been_betrayed_by_someone_z_and_desire_to_distance_themselves_from_that_person).
rule_category(people_who_have_been_betrayed_by_someone_z_and_desire_to_distance_themselves_from_that_person, betrayal_revenge).
rule_source(people_who_have_been_betrayed_by_someone_z_and_desire_to_distance_themselves_from_that_person, ensemble).
rule_priority(people_who_have_been_betrayed_by_someone_z_and_desire_to_distance_themselves_from_that_person, 3).
rule_applies(people_who_have_been_betrayed_by_someone_z_and_desire_to_distance_themselves_from_that_person, X, Y) :-
    directed_status(X, 'z', betrayed_by),
    event(Y, nice).
rule_effect(people_who_have_been_betrayed_by_someone_z_and_desire_to_distance_themselves_from_that_person, set_intent(X, antagonize, Y, 3)).

rule_likelihood(people_who_have_been_betrayed_by_someone_z_and_mean_something_significant_to_them_within_the, 1).
rule_type(people_who_have_been_betrayed_by_someone_z_and_mean_something_significant_to_them_within_the, volition).
% People who have been betrayed by someone (z) and mean something significant to them within the
rule_active(people_who_have_been_betrayed_by_someone_z_and_mean_something_significant_to_them_within_the).
rule_category(people_who_have_been_betrayed_by_someone_z_and_mean_something_significant_to_them_within_the, betrayal_revenge).
rule_source(people_who_have_been_betrayed_by_someone_z_and_mean_something_significant_to_them_within_the, ensemble).
rule_priority(people_who_have_been_betrayed_by_someone_z_and_mean_something_significant_to_them_within_the, 3).
rule_applies(people_who_have_been_betrayed_by_someone_z_and_mean_something_significant_to_them_within_the, X, Y) :-
    directed_status(X, 'z', betrayed_by),
    event(Y, mean).
rule_effect(people_who_have_been_betrayed_by_someone_z_and_mean_something_significant_to_them_within_the, set_intent(X, antagonize, Y, -3)).

rule_likelihood(people_who_have_been_betrayed_by_someone_z_and_have_received_a_favor_from_their_cr, 1).
rule_type(people_who_have_been_betrayed_by_someone_z_and_have_received_a_favor_from_their_cr, volition).
% People who have been betrayed by someone (z) and have received a favor from their cr
rule_active(people_who_have_been_betrayed_by_someone_z_and_have_received_a_favor_from_their_cr).
rule_category(people_who_have_been_betrayed_by_someone_z_and_have_received_a_favor_from_their_cr, betrayal_revenge).
rule_source(people_who_have_been_betrayed_by_someone_z_and_have_received_a_favor_from_their_cr, ensemble).
rule_priority(people_who_have_been_betrayed_by_someone_z_and_have_received_a_favor_from_their_cr, 3).
rule_applies(people_who_have_been_betrayed_by_someone_z_and_have_received_a_favor_from_their_cr, X, Y) :-
    directed_status(X, 'z', betrayed_by),
    event(Y, did_a_favor_for).
rule_effect(people_who_have_been_betrayed_by_someone_z_and_have_received_a_favor_from_their_cr, set_intent(X, antagonize, Y, 3)).

rule_likelihood(people_feel_antagonized_towards_those_who_betrayed_them_and_are_less_likely_to_date_their_cr, 1).
rule_type(people_feel_antagonized_towards_those_who_betrayed_them_and_are_less_likely_to_date_their_cr, volition).
% People feel antagonized towards those who betrayed them and are less likely to date their cr
rule_active(people_feel_antagonized_towards_those_who_betrayed_them_and_are_less_likely_to_date_their_cr).
rule_category(people_feel_antagonized_towards_those_who_betrayed_them_and_are_less_likely_to_date_their_cr, betrayal_revenge).
rule_source(people_feel_antagonized_towards_those_who_betrayed_them_and_are_less_likely_to_date_their_cr, ensemble).
rule_priority(people_feel_antagonized_towards_those_who_betrayed_them_and_are_less_likely_to_date_their_cr, 1).
rule_applies(people_feel_antagonized_towards_those_who_betrayed_them_and_are_less_likely_to_date_their_cr, X, Y) :-
    directed_status(X, 'z', betrayed_by),
    event(Y, nice).
rule_effect(people_feel_antagonized_towards_those_who_betrayed_them_and_are_less_likely_to_date_their_cr, set_intent(X, antagonize, Y, 2)).

rule_likelihood(people_who_have_been_betrayed_by_someone_z_and_mean_something_significant_to_them_within_the, 1).
rule_type(people_who_have_been_betrayed_by_someone_z_and_mean_something_significant_to_them_within_the, volition).
% People who have been betrayed by someone (z) and mean something significant to them within the
rule_active(people_who_have_been_betrayed_by_someone_z_and_mean_something_significant_to_them_within_the).
rule_category(people_who_have_been_betrayed_by_someone_z_and_mean_something_significant_to_them_within_the, betrayal_revenge).
rule_source(people_who_have_been_betrayed_by_someone_z_and_mean_something_significant_to_them_within_the, ensemble).
rule_priority(people_who_have_been_betrayed_by_someone_z_and_mean_something_significant_to_them_within_the, 1).
rule_applies(people_who_have_been_betrayed_by_someone_z_and_mean_something_significant_to_them_within_the, X, Y) :-
    directed_status(X, 'z', betrayed_by),
    event(Y, mean).
rule_effect(people_who_have_been_betrayed_by_someone_z_and_mean_something_significant_to_them_within_the, set_intent(X, antagonize, Y, -2)).

rule_likelihood(people_who_have_been_betrayed_by_someone_z_and_did_a_favor_for_their_crush, 1).
rule_type(people_who_have_been_betrayed_by_someone_z_and_did_a_favor_for_their_crush, volition).
% People who have been betrayed by someone (z) and did a favor for their crush
rule_active(people_who_have_been_betrayed_by_someone_z_and_did_a_favor_for_their_crush).
rule_category(people_who_have_been_betrayed_by_someone_z_and_did_a_favor_for_their_crush, betrayal_revenge).
rule_source(people_who_have_been_betrayed_by_someone_z_and_did_a_favor_for_their_crush, ensemble).
rule_priority(people_who_have_been_betrayed_by_someone_z_and_did_a_favor_for_their_crush, 1).
rule_applies(people_who_have_been_betrayed_by_someone_z_and_did_a_favor_for_their_crush, X, Y) :-
    directed_status(X, 'z', betrayed_by),
    event(Y, did_a_favor_for).
rule_effect(people_who_have_been_betrayed_by_someone_z_and_did_a_favor_for_their_crush, set_intent(X, antagonize, Y, 2)).

rule_likelihood(people_who_have_been_betrayed_by_someone_z_and_had_a_positive_interaction_with_their_cr, 1).
rule_type(people_who_have_been_betrayed_by_someone_z_and_had_a_positive_interaction_with_their_cr, volition).
% People who have been betrayed by someone (z) and had a positive interaction with their cr
rule_active(people_who_have_been_betrayed_by_someone_z_and_had_a_positive_interaction_with_their_cr).
rule_category(people_who_have_been_betrayed_by_someone_z_and_had_a_positive_interaction_with_their_cr, betrayal_revenge).
rule_source(people_who_have_been_betrayed_by_someone_z_and_had_a_positive_interaction_with_their_cr, ensemble).
rule_priority(people_who_have_been_betrayed_by_someone_z_and_had_a_positive_interaction_with_their_cr, 1).
rule_applies(people_who_have_been_betrayed_by_someone_z_and_had_a_positive_interaction_with_their_cr, X, Y) :-
    directed_status(X, 'z', betrayed_by),
    event(Y, nice).
rule_effect(people_who_have_been_betrayed_by_someone_z_and_had_a_positive_interaction_with_their_cr, set_intent(X, antagonize, Y, 1)).

rule_likelihood(people_who_have_been_betrayed_by_someone_z_and_feel_the_mean_actions_towards_them_occurred, 1).
rule_type(people_who_have_been_betrayed_by_someone_z_and_feel_the_mean_actions_towards_them_occurred, volition).
% People who have been betrayed by someone (z) and feel the mean actions towards them occurred
rule_active(people_who_have_been_betrayed_by_someone_z_and_feel_the_mean_actions_towards_them_occurred).
rule_category(people_who_have_been_betrayed_by_someone_z_and_feel_the_mean_actions_towards_them_occurred, betrayal_revenge).
rule_source(people_who_have_been_betrayed_by_someone_z_and_feel_the_mean_actions_towards_them_occurred, ensemble).
rule_priority(people_who_have_been_betrayed_by_someone_z_and_feel_the_mean_actions_towards_them_occurred, 1).
rule_applies(people_who_have_been_betrayed_by_someone_z_and_feel_the_mean_actions_towards_them_occurred, X, Y) :-
    directed_status(X, 'z', betrayed_by),
    event(Y, mean).
rule_effect(people_who_have_been_betrayed_by_someone_z_and_feel_the_mean_actions_towards_them_occurred, set_intent(X, antagonize, Y, -1)).

rule_likelihood(people_who_have_been_betrayed_by_someone_z_and_have_done_a_favor_for_their_cr, 1).
rule_type(people_who_have_been_betrayed_by_someone_z_and_have_done_a_favor_for_their_cr, volition).
% People who have been betrayed by someone (z) and have done a favor for their cr
rule_active(people_who_have_been_betrayed_by_someone_z_and_have_done_a_favor_for_their_cr).
rule_category(people_who_have_been_betrayed_by_someone_z_and_have_done_a_favor_for_their_cr, betrayal_revenge).
rule_source(people_who_have_been_betrayed_by_someone_z_and_have_done_a_favor_for_their_cr, ensemble).
rule_priority(people_who_have_been_betrayed_by_someone_z_and_have_done_a_favor_for_their_cr, 1).
rule_applies(people_who_have_been_betrayed_by_someone_z_and_have_done_a_favor_for_their_cr, X, Y) :-
    directed_status(X, 'z', betrayed_by),
    event(Y, did_a_favor_for).
rule_effect(people_who_have_been_betrayed_by_someone_z_and_have_done_a_favor_for_their_cr, set_intent(X, antagonize, Y, 1)).

rule_likelihood(people_avoid_dating_those_who_have_betrayed_them, 1).
rule_type(people_avoid_dating_those_who_have_betrayed_them, volition).
% People avoid dating those who have betrayed them.
rule_active(people_avoid_dating_those_who_have_betrayed_them).
rule_category(people_avoid_dating_those_who_have_betrayed_them, betrayal_revenge).
rule_source(people_avoid_dating_those_who_have_betrayed_them, ensemble).
rule_priority(people_avoid_dating_those_who_have_betrayed_them, 5).
rule_applies(people_avoid_dating_those_who_have_betrayed_them, X, Y) :-
    directed_status(X, Y, betrayed_by).
rule_effect(people_avoid_dating_those_who_have_betrayed_them, set_intent(X, candid, Y, -5)).

rule_likelihood(people_seeking_candid_relationships_with_individuals_they_ve_been_betrayed_by, 1).
rule_type(people_seeking_candid_relationships_with_individuals_they_ve_been_betrayed_by, volition).
% People seeking candid relationships with individuals they’ve been betrayed by.
rule_active(people_seeking_candid_relationships_with_individuals_they_ve_been_betrayed_by).
rule_category(people_seeking_candid_relationships_with_individuals_they_ve_been_betrayed_by, betrayal_revenge).
rule_source(people_seeking_candid_relationships_with_individuals_they_ve_been_betrayed_by, ensemble).
rule_priority(people_seeking_candid_relationships_with_individuals_they_ve_been_betrayed_by, 5).
rule_applies(people_seeking_candid_relationships_with_individuals_they_ve_been_betrayed_by, X, Y) :-
    directed_status(X, 'z', betrayed_by),
    directed_status(Y, 'z', betrayed_by).
rule_effect(people_seeking_candid_relationships_with_individuals_they_ve_been_betrayed_by, set_intent(X, candid, Y, 5)).

rule_likelihood(people_intending_to_be_closer_after_being_betrayed_by_someone_and_having_a_significant_event_occur_within, 1).
rule_type(people_intending_to_be_closer_after_being_betrayed_by_someone_and_having_a_significant_event_occur_within, volition).
% People intending to be closer after being betrayed by someone and having a significant event occur within
rule_active(people_intending_to_be_closer_after_being_betrayed_by_someone_and_having_a_significant_event_occur_within).
rule_category(people_intending_to_be_closer_after_being_betrayed_by_someone_and_having_a_significant_event_occur_within, betrayal_revenge).
rule_source(people_intending_to_be_closer_after_being_betrayed_by_someone_and_having_a_significant_event_occur_within, ensemble).
rule_priority(people_intending_to_be_closer_after_being_betrayed_by_someone_and_having_a_significant_event_occur_within, 1).
rule_applies(people_intending_to_be_closer_after_being_betrayed_by_someone_and_having_a_significant_event_occur_within, X, Y) :-
    directed_status(X, 'z', betrayed_by),
    event(Y, mean).
rule_effect(people_intending_to_be_closer_after_being_betrayed_by_someone_and_having_a_significant_event_occur_within, set_intent(X, candid, Y, 2)).

rule_likelihood(people_with_a_betrayed_relationship_status_towards_someone_want_to_date_their_crush_if_they_have_had, 1).
rule_type(people_with_a_betrayed_relationship_status_towards_someone_want_to_date_their_crush_if_they_have_had, volition).
% People with a betrayed relationship status towards someone want to date their crush if they have had
rule_active(people_with_a_betrayed_relationship_status_towards_someone_want_to_date_their_crush_if_they_have_had).
rule_category(people_with_a_betrayed_relationship_status_towards_someone_want_to_date_their_crush_if_they_have_had, betrayal_revenge).
rule_source(people_with_a_betrayed_relationship_status_towards_someone_want_to_date_their_crush_if_they_have_had, ensemble).
rule_priority(people_with_a_betrayed_relationship_status_towards_someone_want_to_date_their_crush_if_they_have_had, 1).
rule_applies(people_with_a_betrayed_relationship_status_towards_someone_want_to_date_their_crush_if_they_have_had, X, Y) :-
    directed_status(X, 'z', betrayed_by),
    event(Y, mean).
rule_effect(people_with_a_betrayed_relationship_status_towards_someone_want_to_date_their_crush_if_they_have_had, set_intent(X, candid, Y, 1)).

rule_likelihood(people_avoid_being_betrayed_by_others_and_may_favor_those_who_have_not_caused_them_to_feel_bet, 1).
rule_type(people_avoid_being_betrayed_by_others_and_may_favor_those_who_have_not_caused_them_to_feel_bet, volition).
% People avoid being betrayed by others and may favor those who have not caused them to feel bet
rule_active(people_avoid_being_betrayed_by_others_and_may_favor_those_who_have_not_caused_them_to_feel_bet).
rule_category(people_avoid_being_betrayed_by_others_and_may_favor_those_who_have_not_caused_them_to_feel_bet, betrayal_revenge).
rule_source(people_avoid_being_betrayed_by_others_and_may_favor_those_who_have_not_caused_them_to_feel_bet, ensemble).
rule_priority(people_avoid_being_betrayed_by_others_and_may_favor_those_who_have_not_caused_them_to_feel_bet, 5).
rule_applies(people_avoid_being_betrayed_by_others_and_may_favor_those_who_have_not_caused_them_to_feel_bet, X, Y) :-
    directed_status(X, Y, betrayed_by).
rule_effect(people_avoid_being_betrayed_by_others_and_may_favor_those_who_have_not_caused_them_to_feel_bet, set_intent(X, favor, Y, -5)).

rule_likelihood(people_develop_a_favor_towards_their_crush_after_feeling_betrayed_by_someone_else, 1).
rule_type(people_develop_a_favor_towards_their_crush_after_feeling_betrayed_by_someone_else, volition).
% People develop a favor towards their crush after feeling betrayed by someone else.
rule_active(people_develop_a_favor_towards_their_crush_after_feeling_betrayed_by_someone_else).
rule_category(people_develop_a_favor_towards_their_crush_after_feeling_betrayed_by_someone_else, betrayal_revenge).
rule_source(people_develop_a_favor_towards_their_crush_after_feeling_betrayed_by_someone_else, ensemble).
rule_priority(people_develop_a_favor_towards_their_crush_after_feeling_betrayed_by_someone_else, 1).
rule_applies(people_develop_a_favor_towards_their_crush_after_feeling_betrayed_by_someone_else, X, Y) :-
    directed_status(X, 'z', betrayed_by),
    event(Y, mean).
rule_effect(people_develop_a_favor_towards_their_crush_after_feeling_betrayed_by_someone_else, set_intent(X, favor, Y, 2)).

rule_likelihood(people_who_have_been_betrayed_by_someone_z_and_feel_the_mean_action_occurred_within_a, 1).
rule_type(people_who_have_been_betrayed_by_someone_z_and_feel_the_mean_action_occurred_within_a, volition).
% People who have been betrayed by someone (z) and feel the mean action occurred within a
rule_active(people_who_have_been_betrayed_by_someone_z_and_feel_the_mean_action_occurred_within_a).
rule_category(people_who_have_been_betrayed_by_someone_z_and_feel_the_mean_action_occurred_within_a, betrayal_revenge).
rule_source(people_who_have_been_betrayed_by_someone_z_and_feel_the_mean_action_occurred_within_a, ensemble).
rule_priority(people_who_have_been_betrayed_by_someone_z_and_feel_the_mean_action_occurred_within_a, 1).
rule_applies(people_who_have_been_betrayed_by_someone_z_and_feel_the_mean_action_occurred_within_a, X, Y) :-
    directed_status(X, 'z', betrayed_by),
    event(Y, mean).
rule_effect(people_who_have_been_betrayed_by_someone_z_and_feel_the_mean_action_occurred_within_a, set_intent(X, favor, Y, 1)).

rule_likelihood(people_feel_betrayed_by_someone_and_seek_to_distance_themselves_from_that_person, 1).
rule_type(people_feel_betrayed_by_someone_and_seek_to_distance_themselves_from_that_person, volition).
% People feel betrayed by someone and seek to distance themselves from that person.
rule_active(people_feel_betrayed_by_someone_and_seek_to_distance_themselves_from_that_person).
rule_category(people_feel_betrayed_by_someone_and_seek_to_distance_themselves_from_that_person, betrayal_revenge).
rule_source(people_feel_betrayed_by_someone_and_seek_to_distance_themselves_from_that_person, ensemble).
rule_priority(people_feel_betrayed_by_someone_and_seek_to_distance_themselves_from_that_person, 3).
rule_applies(people_feel_betrayed_by_someone_and_seek_to_distance_themselves_from_that_person, X, Y) :-
    directed_status(X, Y, betrayed_by).
rule_effect(people_feel_betrayed_by_someone_and_seek_to_distance_themselves_from_that_person, set_intent(X, honor, Y, -3)).

rule_likelihood(people_may_develop_negative_feelings_towards_those_who_betray_them, 1).
rule_type(people_may_develop_negative_feelings_towards_those_who_betray_them, volition).
% People may develop negative feelings towards those who betray them.
rule_active(people_may_develop_negative_feelings_towards_those_who_betray_them).
rule_category(people_may_develop_negative_feelings_towards_those_who_betray_them, betrayal_revenge).
rule_source(people_may_develop_negative_feelings_towards_those_who_betray_them, ensemble).
rule_priority(people_may_develop_negative_feelings_towards_those_who_betray_them, 1).
rule_applies(people_may_develop_negative_feelings_towards_those_who_betray_them, X, Y) :-
    directed_status(X, Y, betrayed_by).
rule_effect(people_may_develop_negative_feelings_towards_those_who_betray_them, set_intent(X, idealize, Y, -2)).

rule_likelihood(people_want_to_distance_themselves_from_those_who_betrayed_them, 1).
rule_type(people_want_to_distance_themselves_from_those_who_betrayed_them, volition).
% People want to distance themselves from those who betrayed them.
rule_active(people_want_to_distance_themselves_from_those_who_betrayed_them).
rule_category(people_want_to_distance_themselves_from_those_who_betrayed_them, betrayal_revenge).
rule_source(people_want_to_distance_themselves_from_those_who_betrayed_them, ensemble).
rule_priority(people_want_to_distance_themselves_from_those_who_betrayed_them, 5).
rule_applies(people_want_to_distance_themselves_from_those_who_betrayed_them, X, Y) :-
    directed_status(X, Y, betrayed_by).
rule_effect(people_want_to_distance_themselves_from_those_who_betrayed_them, set_intent(X, kind, Y, -5)).

rule_likelihood(people_desire_to_distance_themselves_from_those_they_ve_been_betrayed_by, 1).
rule_type(people_desire_to_distance_themselves_from_those_they_ve_been_betrayed_by, volition).
% People desire to distance themselves from those they’ve been betrayed by.
rule_active(people_desire_to_distance_themselves_from_those_they_ve_been_betrayed_by).
rule_category(people_desire_to_distance_themselves_from_those_they_ve_been_betrayed_by, betrayal_revenge).
rule_source(people_desire_to_distance_themselves_from_those_they_ve_been_betrayed_by, ensemble).
rule_priority(people_desire_to_distance_themselves_from_those_they_ve_been_betrayed_by, 1).
rule_applies(people_desire_to_distance_themselves_from_those_they_ve_been_betrayed_by, X, Y) :-
    directed_status(X, 'z', betrayed_by),
    directed_status(Y, 'z', betrayed_by).
rule_effect(people_desire_to_distance_themselves_from_those_they_ve_been_betrayed_by, set_intent(X, kind, Y, 2)).

rule_likelihood(people_with_a_betrayed_status_by_someone_want_to_get_closer_to_their_crush_after_an_event, 1).
rule_type(people_with_a_betrayed_status_by_someone_want_to_get_closer_to_their_crush_after_an_event, volition).
% People with a betrayed status by someone want to get closer to their crush after an event
rule_active(people_with_a_betrayed_status_by_someone_want_to_get_closer_to_their_crush_after_an_event).
rule_category(people_with_a_betrayed_status_by_someone_want_to_get_closer_to_their_crush_after_an_event, betrayal_revenge).
rule_source(people_with_a_betrayed_status_by_someone_want_to_get_closer_to_their_crush_after_an_event, ensemble).
rule_priority(people_with_a_betrayed_status_by_someone_want_to_get_closer_to_their_crush_after_an_event, 1).
rule_applies(people_with_a_betrayed_status_by_someone_want_to_get_closer_to_their_crush_after_an_event, X, Y) :-
    directed_status(X, 'z', betrayed_by),
    event(Y, mean).
rule_effect(people_with_a_betrayed_status_by_someone_want_to_get_closer_to_their_crush_after_an_event, set_intent(X, kind, Y, 2)).

rule_likelihood(people_who_have_been_betrayed_by_someone_z_and_mean_something_significant_to_them_within_the, 1).
rule_type(people_who_have_been_betrayed_by_someone_z_and_mean_something_significant_to_them_within_the, volition).
% People who have been betrayed by someone (z) and mean something significant to them within the
rule_active(people_who_have_been_betrayed_by_someone_z_and_mean_something_significant_to_them_within_the).
rule_category(people_who_have_been_betrayed_by_someone_z_and_mean_something_significant_to_them_within_the, betrayal_revenge).
rule_source(people_who_have_been_betrayed_by_someone_z_and_mean_something_significant_to_them_within_the, ensemble).
rule_priority(people_who_have_been_betrayed_by_someone_z_and_mean_something_significant_to_them_within_the, 1).
rule_applies(people_who_have_been_betrayed_by_someone_z_and_mean_something_significant_to_them_within_the, X, Y) :-
    directed_status(X, 'z', betrayed_by),
    event(Y, mean).
rule_effect(people_who_have_been_betrayed_by_someone_z_and_mean_something_significant_to_them_within_the, set_intent(X, kind, Y, 1)).

rule_likelihood(people_attempt_to_influence_others_through_betrayal_or_manipulation_by_someone_they_perceive_as_strong, 1).
rule_type(people_attempt_to_influence_others_through_betrayal_or_manipulation_by_someone_they_perceive_as_strong, volition).
% People attempt to influence others through betrayal or manipulation by someone they perceive as strong
rule_active(people_attempt_to_influence_others_through_betrayal_or_manipulation_by_someone_they_perceive_as_strong).
rule_category(people_attempt_to_influence_others_through_betrayal_or_manipulation_by_someone_they_perceive_as_strong, betrayal_revenge).
rule_source(people_attempt_to_influence_others_through_betrayal_or_manipulation_by_someone_they_perceive_as_strong, ensemble).
rule_priority(people_attempt_to_influence_others_through_betrayal_or_manipulation_by_someone_they_perceive_as_strong, 1).
rule_applies(people_attempt_to_influence_others_through_betrayal_or_manipulation_by_someone_they_perceive_as_strong, X, Y) :-
    directed_status(X, Y, betrayed_by).
rule_effect(people_attempt_to_influence_others_through_betrayal_or_manipulation_by_someone_they_perceive_as_strong, set_intent(X, manipulate, Y, 2)).

rule_likelihood(people_don_t_romantically_pursue_those_who_betray_them, 1).
rule_type(people_don_t_romantically_pursue_those_who_betray_them, volition).
% People don’t romantically pursue those who betray them.
rule_active(people_don_t_romantically_pursue_those_who_betray_them).
rule_category(people_don_t_romantically_pursue_those_who_betray_them, betrayal_revenge).
rule_source(people_don_t_romantically_pursue_those_who_betray_them, ensemble).
rule_priority(people_don_t_romantically_pursue_those_who_betray_them, 1).
rule_applies(people_don_t_romantically_pursue_those_who_betray_them, X, Y) :-
    directed_status(X, Y, betrayed_by).
rule_effect(people_don_t_romantically_pursue_those_who_betray_them, set_intent(X, romance, Y, -2)).

rule_likelihood(people_feel_betrayed_by_someone_and_develop_distrust_towards_them, 1).
rule_type(people_feel_betrayed_by_someone_and_develop_distrust_towards_them, volition).
% People feel betrayed by someone and develop distrust towards them.
rule_active(people_feel_betrayed_by_someone_and_develop_distrust_towards_them).
rule_category(people_feel_betrayed_by_someone_and_develop_distrust_towards_them, betrayal_revenge).
rule_source(people_feel_betrayed_by_someone_and_develop_distrust_towards_them, ensemble).
rule_priority(people_feel_betrayed_by_someone_and_develop_distrust_towards_them, 5).
rule_applies(people_feel_betrayed_by_someone_and_develop_distrust_towards_them, X, Y) :-
    directed_status(X, Y, betrayed_by).
rule_effect(people_feel_betrayed_by_someone_and_develop_distrust_towards_them, set_intent(X, trust, Y, -5)).

%% ═══════════════════════════════════════════════════════════
%% Category: cultural-provincial
%% ═══════════════════════════════════════════════════════════

%% Ensemble Volition Rules: cultural-provincial
%% Source: data/ensemble/volitionRules/cultural-provincial.json
%% Converted: 2026-04-02T20:09:49.731Z
%% Total rules: 2

rule_likelihood(foreigners_may_dislike_mocking_locals, 1).
rule_type(foreigners_may_dislike_mocking_locals, volition).
% Foreigners may dislike mocking locals
rule_active(foreigners_may_dislike_mocking_locals).
rule_category(foreigners_may_dislike_mocking_locals, cultural_provincial).
rule_source(foreigners_may_dislike_mocking_locals, ensemble).
rule_priority(foreigners_may_dislike_mocking_locals, 5).
rule_applies(foreigners_may_dislike_mocking_locals, X, Y) :-
    trait(Y, foreigner),
    trait(X, mocking).
rule_effect(foreigners_may_dislike_mocking_locals, modify_network(Y, 'z', affinity, '+', 5)).

rule_likelihood(foreigners_may_become_flattered_by_locals, 1).
rule_type(foreigners_may_become_flattered_by_locals, volition).
% Foreigners may become flattered by locals
rule_active(foreigners_may_become_flattered_by_locals).
rule_category(foreigners_may_become_flattered_by_locals, cultural_provincial).
rule_source(foreigners_may_become_flattered_by_locals, ensemble).
rule_priority(foreigners_may_become_flattered_by_locals, 5).
rule_applies(foreigners_may_become_flattered_by_locals, X, Y) :-
    trait(X, foreigner),
    \+ trait(Y, provincial),
    status(X, flattered),
    network(Y, X, curiosity, Curiosity_val), Curiosity_val > 60.
rule_effect(foreigners_may_become_flattered_by_locals, modify_network(X, Y, affinity, '+', 5)).

%% ═══════════════════════════════════════════════════════════
%% Category: deception-manipulation
%% ═══════════════════════════════════════════════════════════

%% Ensemble Volition Rules: deception-manipulation
%% Source: data/ensemble/volitionRules/deception-manipulation.json
%% Converted: 2026-04-02T20:09:49.731Z
%% Total rules: 22

rule_likelihood(an_intelligent_provincial_can_have_allies_in_low_social_classes, 1).
rule_type(an_intelligent_provincial_can_have_allies_in_low_social_classes, volition).
% An intelligent provincial can have allies in low social classes
rule_active(an_intelligent_provincial_can_have_allies_in_low_social_classes).
rule_category(an_intelligent_provincial_can_have_allies_in_low_social_classes, deception_manipulation).
rule_source(an_intelligent_provincial_can_have_allies_in_low_social_classes, ensemble).
rule_priority(an_intelligent_provincial_can_have_allies_in_low_social_classes, 3).
rule_applies(an_intelligent_provincial_can_have_allies_in_low_social_classes, X, Y) :-
    trait(X, provincial),
    trait(X, male),
    attribute(Y, social_standing, Social_standing_val), Social_standing_val < 30.
rule_effect(an_intelligent_provincial_can_have_allies_in_low_social_classes, set_relationship(Y, X, ally, 3)).

rule_likelihood(a_cunning_greedy_person_can_take_advantage_of_rich_person_s_love_for_another, 1).
rule_type(a_cunning_greedy_person_can_take_advantage_of_rich_person_s_love_for_another, volition).
% A cunning, greedy person can take advantage of rich person’s love for another
rule_active(a_cunning_greedy_person_can_take_advantage_of_rich_person_s_love_for_another).
rule_category(a_cunning_greedy_person_can_take_advantage_of_rich_person_s_love_for_another, deception_manipulation).
rule_source(a_cunning_greedy_person_can_take_advantage_of_rich_person_s_love_for_another, ensemble).
rule_priority(a_cunning_greedy_person_can_take_advantage_of_rich_person_s_love_for_another, 5).
rule_applies(a_cunning_greedy_person_can_take_advantage_of_rich_person_s_love_for_another, X, Y) :-
    attribute(Y, cunningness, Cunningness_val), Cunningness_val > 50,
    directed_status(X, 'z', cares_for),
    trait(X, rich),
    trait(Y, greedy),
    trait(X, generous).
rule_effect(a_cunning_greedy_person_can_take_advantage_of_rich_person_s_love_for_another, set_relationship(Y, X, ally, 5)).
rule_effect(a_cunning_greedy_person_can_take_advantage_of_rich_person_s_love_for_another, modify_network(Y, 'z', affinity, '+', 5)).
rule_effect(a_cunning_greedy_person_can_take_advantage_of_rich_person_s_love_for_another, modify_network(Y, 'z', curiosity, '+', 5)).

rule_likelihood(provincials_believe_rich_people_are_credible, 1).
rule_type(provincials_believe_rich_people_are_credible, volition).
% Provincials believe rich people are credible
rule_active(provincials_believe_rich_people_are_credible).
rule_category(provincials_believe_rich_people_are_credible, deception_manipulation).
rule_source(provincials_believe_rich_people_are_credible, ensemble).
rule_priority(provincials_believe_rich_people_are_credible, 5).
rule_applies(provincials_believe_rich_people_are_credible, X, Y) :-
    trait(X, provincial),
    trait(Y, rich).
rule_effect(provincials_believe_rich_people_are_credible, modify_network(X, Y, credibility, '+', 5)).

rule_likelihood(a_deceptive_and_charismatic_man_inspires_a_credulous_honest_woman_to_increase_interest, 1).
rule_type(a_deceptive_and_charismatic_man_inspires_a_credulous_honest_woman_to_increase_interest, volition).
% A deceptive and charismatic man inspires a credulous honest woman to increase interest
rule_active(a_deceptive_and_charismatic_man_inspires_a_credulous_honest_woman_to_increase_interest).
rule_category(a_deceptive_and_charismatic_man_inspires_a_credulous_honest_woman_to_increase_interest, deception_manipulation).
rule_source(a_deceptive_and_charismatic_man_inspires_a_credulous_honest_woman_to_increase_interest, ensemble).
rule_priority(a_deceptive_and_charismatic_man_inspires_a_credulous_honest_woman_to_increase_interest, 5).
rule_applies(a_deceptive_and_charismatic_man_inspires_a_credulous_honest_woman_to_increase_interest, X, Y) :-
    trait(X, credulous),
    trait(X, honest),
    trait(Y, deceptive),
    trait(X, female),
    trait(Y, male),
    attribute(Y, charisma, Charisma_val), Charisma_val > 50.
rule_effect(a_deceptive_and_charismatic_man_inspires_a_credulous_honest_woman_to_increase_interest, modify_network(Y, X, curiosity, '+', 5)).
rule_effect(a_deceptive_and_charismatic_man_inspires_a_credulous_honest_woman_to_increase_interest, modify_network(X, Y, affinity, '+', 5)).

rule_likelihood(a_greedy_cunning_deceptive_person_wants_to_be_believed_by_a_credulous_person, 1).
rule_type(a_greedy_cunning_deceptive_person_wants_to_be_believed_by_a_credulous_person, volition).
% A greedy, cunning, deceptive person wants to be believed by a credulous person
rule_active(a_greedy_cunning_deceptive_person_wants_to_be_believed_by_a_credulous_person).
rule_category(a_greedy_cunning_deceptive_person_wants_to_be_believed_by_a_credulous_person, deception_manipulation).
rule_source(a_greedy_cunning_deceptive_person_wants_to_be_believed_by_a_credulous_person, ensemble).
rule_priority(a_greedy_cunning_deceptive_person_wants_to_be_believed_by_a_credulous_person, 5).
rule_applies(a_greedy_cunning_deceptive_person_wants_to_be_believed_by_a_credulous_person, X, Y) :-
    directed_status(X, Y, financially_dependent_on),
    trait(Y, greedy),
    attribute(Y, cunningness, Cunningness_val), Cunningness_val > 50,
    trait(X, credulous),
    trait(Y, deceptive).
rule_effect(a_greedy_cunning_deceptive_person_wants_to_be_believed_by_a_credulous_person, modify_network(Y, X, credibility, '+', 5)).

rule_likelihood(being_caught_in_a_lie_results_in_decreased_affinity, 1).
rule_type(being_caught_in_a_lie_results_in_decreased_affinity, volition).
% Being caught in a lie results in decreased affinity
rule_active(being_caught_in_a_lie_results_in_decreased_affinity).
rule_category(being_caught_in_a_lie_results_in_decreased_affinity, deception_manipulation).
rule_source(being_caught_in_a_lie_results_in_decreased_affinity, ensemble).
rule_priority(being_caught_in_a_lie_results_in_decreased_affinity, 8).
rule_applies(being_caught_in_a_lie_results_in_decreased_affinity, X, Y) :-
    event(Y, caught_in_a_lie_by).
rule_effect(being_caught_in_a_lie_results_in_decreased_affinity, modify_network(X, Y, affinity, '+', 10)).
rule_effect(being_caught_in_a_lie_results_in_decreased_affinity, modify_network(Y, X, credibility, '+', 3)).

rule_likelihood(an_young_academic_mocks_cunning_actresses, 1).
rule_type(an_young_academic_mocks_cunning_actresses, volition).
% An young academic mocks cunning actresses
rule_active(an_young_academic_mocks_cunning_actresses).
rule_category(an_young_academic_mocks_cunning_actresses, deception_manipulation).
rule_source(an_young_academic_mocks_cunning_actresses, ensemble).
rule_priority(an_young_academic_mocks_cunning_actresses, 5).
rule_applies(an_young_academic_mocks_cunning_actresses, X, Y) :-
    trait(Y, male),
    trait(Y, mocking),
    trait(Y, academic),
    trait(Y, young),
    directed_status(Y, X, ridicules),
    directed_status(X, Y, resentful_of),
    trait(X, female),
    attribute(X, cunningness, Cunningness_val), Cunningness_val > 80,
    trait(X, security_guard).
rule_effect(an_young_academic_mocks_cunning_actresses, set_relationship(X, Y, esteem, 5)).

rule_likelihood(a_confidential_servant_wants_to_blackmail_her_naive_mistress, 1).
rule_type(a_confidential_servant_wants_to_blackmail_her_naive_mistress, volition).
% A confidential servant wants to blackmail her naive mistress
rule_active(a_confidential_servant_wants_to_blackmail_her_naive_mistress).
rule_category(a_confidential_servant_wants_to_blackmail_her_naive_mistress, deception_manipulation).
rule_source(a_confidential_servant_wants_to_blackmail_her_naive_mistress, ensemble).
rule_priority(a_confidential_servant_wants_to_blackmail_her_naive_mistress, 5).
rule_applies(a_confidential_servant_wants_to_blackmail_her_naive_mistress, X, Y) :-
    trait(X, stagehand),
    trait(X, greedy),
    \+ trait(X, trustworthy),
    trait(Y, female),
    trait(Y, credulous),
    trait(Y, young),
    attribute(X, cunningness, Cunningness_val), Cunningness_val > 30,
    network(Y, X, affinity, Affinity_val), Affinity_val > 50.
rule_effect(a_confidential_servant_wants_to_blackmail_her_naive_mistress, set_relationship(X, Y, rivals, 5)).

rule_likelihood(unsophisticated_people_encourage_flirty_hypocrites_to_like_them, 1).
rule_type(unsophisticated_people_encourage_flirty_hypocrites_to_like_them, volition).
% Unsophisticated people encourage flirty hypocrites to like them
rule_active(unsophisticated_people_encourage_flirty_hypocrites_to_like_them).
rule_category(unsophisticated_people_encourage_flirty_hypocrites_to_like_them, deception_manipulation).
rule_source(unsophisticated_people_encourage_flirty_hypocrites_to_like_them, ensemble).
rule_priority(unsophisticated_people_encourage_flirty_hypocrites_to_like_them, 3).
rule_applies(unsophisticated_people_encourage_flirty_hypocrites_to_like_them, X, Y) :-
    trait(X, devout),
    trait(X, hypocritical),
    trait(X, flirtatious),
    attribute(Y, sophistication, Sophistication_val), Sophistication_val < 50,
    trait(X, rich).
rule_effect(unsophisticated_people_encourage_flirty_hypocrites_to_like_them, modify_network(Y, X, affinity, '+', 3)).

rule_likelihood(women_who_catch_their_lovers_in_a_lie_lose_affinity_for_them, 1).
rule_type(women_who_catch_their_lovers_in_a_lie_lose_affinity_for_them, volition).
% Women who catch their lovers in a lie lose affinity for them
rule_active(women_who_catch_their_lovers_in_a_lie_lose_affinity_for_them).
rule_category(women_who_catch_their_lovers_in_a_lie_lose_affinity_for_them, deception_manipulation).
rule_source(women_who_catch_their_lovers_in_a_lie_lose_affinity_for_them, ensemble).
rule_priority(women_who_catch_their_lovers_in_a_lie_lose_affinity_for_them, 5).
rule_applies(women_who_catch_their_lovers_in_a_lie_lose_affinity_for_them, X, Y) :-
    trait(X, male),
    trait(Y, female),
    relationship(X, Y, lovers),
    event(X, caught_in_a_lie_by).
rule_effect(women_who_catch_their_lovers_in_a_lie_lose_affinity_for_them, modify_network(Y, X, affinity, '+', 5)).

rule_likelihood(people_who_like_others_seek_to_emulate_them_and_become_allies, 1).
rule_type(people_who_like_others_seek_to_emulate_them_and_become_allies, volition).
% People who like others seek to emulate them and become allies
rule_active(people_who_like_others_seek_to_emulate_them_and_become_allies).
rule_category(people_who_like_others_seek_to_emulate_them_and_become_allies, deception_manipulation).
rule_source(people_who_like_others_seek_to_emulate_them_and_become_allies, ensemble).
rule_priority(people_who_like_others_seek_to_emulate_them_and_become_allies, 5).
rule_applies(people_who_like_others_seek_to_emulate_them_and_become_allies, X, Y) :-
    network(X, Y, affinity, Affinity_val), Affinity_val > 60.
rule_effect(people_who_like_others_seek_to_emulate_them_and_become_allies, modify_network(X, Y, emulation, '+', 5)).
rule_effect(people_who_like_others_seek_to_emulate_them_and_become_allies, modify_network(X, Y, curiosity, '+', 5)).
rule_effect(people_who_like_others_seek_to_emulate_them_and_become_allies, set_relationship(X, Y, ally, 5)).

rule_likelihood(devout_hypocrites_are_disdained_by_perceptive_people, 1).
rule_type(devout_hypocrites_are_disdained_by_perceptive_people, volition).
% Devout hypocrites are disdained by perceptive people
rule_active(devout_hypocrites_are_disdained_by_perceptive_people).
rule_category(devout_hypocrites_are_disdained_by_perceptive_people, deception_manipulation).
rule_source(devout_hypocrites_are_disdained_by_perceptive_people, ensemble).
rule_priority(devout_hypocrites_are_disdained_by_perceptive_people, 5).
rule_applies(devout_hypocrites_are_disdained_by_perceptive_people, X, Y) :-
    trait(X, devout),
    trait(X, hypocritical),
    trait(X, deceptive),
    network(X, Y, affinity, Affinity_val), Affinity_val > 60,
    trait(Y, penetrating).
rule_effect(devout_hypocrites_are_disdained_by_perceptive_people, modify_network(Y, Y, affinity, '+', 5)).

rule_likelihood(ambitious_cunning_people_may_take_advantage_of_other_people_s_friendships, 1).
rule_type(ambitious_cunning_people_may_take_advantage_of_other_people_s_friendships, volition).
% Ambitious, cunning people may take advantage of other people’s friendships
rule_active(ambitious_cunning_people_may_take_advantage_of_other_people_s_friendships).
rule_category(ambitious_cunning_people_may_take_advantage_of_other_people_s_friendships, deception_manipulation).
rule_source(ambitious_cunning_people_may_take_advantage_of_other_people_s_friendships, ensemble).
rule_priority(ambitious_cunning_people_may_take_advantage_of_other_people_s_friendships, 5).
rule_applies(ambitious_cunning_people_may_take_advantage_of_other_people_s_friendships, X, Y) :-
    trait(X, ambitious),
    attribute(X, cunningness, Cunningness_val), Cunningness_val > 50,
    network(Y, 'z', affinity, Affinity_val), Affinity_val > 70,
    relationship(X, 'z', friends),
    trait(X, greedy),
    trait(Y, generous).
rule_effect(ambitious_cunning_people_may_take_advantage_of_other_people_s_friendships, set_relationship(X, Y, ally, 5)).

rule_likelihood(vain_talkative_people_may_gossip_and_be_indiscreet_to_make_friends, 1).
rule_type(vain_talkative_people_may_gossip_and_be_indiscreet_to_make_friends, volition).
% Vain, talkative people may gossip and be indiscreet to make friends
rule_active(vain_talkative_people_may_gossip_and_be_indiscreet_to_make_friends).
rule_category(vain_talkative_people_may_gossip_and_be_indiscreet_to_make_friends, deception_manipulation).
rule_source(vain_talkative_people_may_gossip_and_be_indiscreet_to_make_friends, ensemble).
rule_priority(vain_talkative_people_may_gossip_and_be_indiscreet_to_make_friends, 3).
rule_applies(vain_talkative_people_may_gossip_and_be_indiscreet_to_make_friends, X, Y) :-
    trait(X, vain),
    trait(X, talkative),
    trait(X, indiscreet).
rule_effect(vain_talkative_people_may_gossip_and_be_indiscreet_to_make_friends, modify_network(X, Y, curiosity, '+', 3)).
rule_effect(vain_talkative_people_may_gossip_and_be_indiscreet_to_make_friends, set_relationship(X, Y, ally, 3)).

rule_likelihood(virtuous_women_may_not_want_to_be_friends_or_allies_with_non_virtuous_women, 1).
rule_type(virtuous_women_may_not_want_to_be_friends_or_allies_with_non_virtuous_women, volition).
% Virtuous women may not want to be friends or allies with non-virtuous women
rule_active(virtuous_women_may_not_want_to_be_friends_or_allies_with_non_virtuous_women).
rule_category(virtuous_women_may_not_want_to_be_friends_or_allies_with_non_virtuous_women, deception_manipulation).
rule_source(virtuous_women_may_not_want_to_be_friends_or_allies_with_non_virtuous_women, ensemble).
rule_priority(virtuous_women_may_not_want_to_be_friends_or_allies_with_non_virtuous_women, 5).
rule_applies(virtuous_women_may_not_want_to_be_friends_or_allies_with_non_virtuous_women, X, Y) :-
    \+ trait(X, virtuous),
    trait(X, female),
    trait(Y, female),
    trait(Y, virtuous).
rule_effect(virtuous_women_may_not_want_to_be_friends_or_allies_with_non_virtuous_women, modify_network(Y, X, affinity, '-', 5)).
rule_effect(virtuous_women_may_not_want_to_be_friends_or_allies_with_non_virtuous_women, set_relationship(Y, X, ally, -5)).

rule_likelihood(credulous_people_have_less_desire_to_ally_with_others_who_are_caught_in_a_lie, 1).
rule_type(credulous_people_have_less_desire_to_ally_with_others_who_are_caught_in_a_lie, volition).
% Credulous people have less desire to ally with others who are caught in a lie
rule_active(credulous_people_have_less_desire_to_ally_with_others_who_are_caught_in_a_lie).
rule_category(credulous_people_have_less_desire_to_ally_with_others_who_are_caught_in_a_lie, deception_manipulation).
rule_source(credulous_people_have_less_desire_to_ally_with_others_who_are_caught_in_a_lie, ensemble).
rule_priority(credulous_people_have_less_desire_to_ally_with_others_who_are_caught_in_a_lie, 5).
rule_applies(credulous_people_have_less_desire_to_ally_with_others_who_are_caught_in_a_lie, X, Y) :-
    trait(X, credulous),
    event(Y, caught_in_a_lie_by).
rule_effect(credulous_people_have_less_desire_to_ally_with_others_who_are_caught_in_a_lie, modify_network(X, Y, affinity, '-', 5)).
rule_effect(credulous_people_have_less_desire_to_ally_with_others_who_are_caught_in_a_lie, set_relationship(X, Y, ally, -5)).

rule_likelihood(two_people_catching_a_third_in_a_lie_may_be_more_likely_to_become_allies, 1).
rule_type(two_people_catching_a_third_in_a_lie_may_be_more_likely_to_become_allies, volition).
% Two people catching a third in a lie may be more likely to become allies
rule_active(two_people_catching_a_third_in_a_lie_may_be_more_likely_to_become_allies).
rule_category(two_people_catching_a_third_in_a_lie_may_be_more_likely_to_become_allies, deception_manipulation).
rule_source(two_people_catching_a_third_in_a_lie_may_be_more_likely_to_become_allies, ensemble).
rule_priority(two_people_catching_a_third_in_a_lie_may_be_more_likely_to_become_allies, 5).
rule_applies(two_people_catching_a_third_in_a_lie_may_be_more_likely_to_become_allies, X, Y) :-
    event(X, caught_in_a_lie_by),
    network(Y, 'z', affinity, Affinity_val), Affinity_val > 50,
    event(X, caught_in_a_lie_by),
    trait('z', credulous).
rule_effect(two_people_catching_a_third_in_a_lie_may_be_more_likely_to_become_allies, set_relationship(Y, 'z', ally, 5)).

rule_likelihood(cunning_seductive_men_may_seek_to_increase_affinity_and_attention_from_credulous_young_women, 1).
rule_type(cunning_seductive_men_may_seek_to_increase_affinity_and_attention_from_credulous_young_women, volition).
% Cunning, seductive men may seek to increase affinity and attention from credulous young women
rule_active(cunning_seductive_men_may_seek_to_increase_affinity_and_attention_from_credulous_young_women).
rule_category(cunning_seductive_men_may_seek_to_increase_affinity_and_attention_from_credulous_young_women, deception_manipulation).
rule_source(cunning_seductive_men_may_seek_to_increase_affinity_and_attention_from_credulous_young_women, ensemble).
rule_priority(cunning_seductive_men_may_seek_to_increase_affinity_and_attention_from_credulous_young_women, 5).
rule_applies(cunning_seductive_men_may_seek_to_increase_affinity_and_attention_from_credulous_young_women, X, Y) :-
    trait(X, female),
    trait(X, young),
    trait(X, credulous),
    attribute(Y, cunningness, Cunningness_val), Cunningness_val > 50,
    trait(Y, flirtatious),
    trait(Y, male).
rule_effect(cunning_seductive_men_may_seek_to_increase_affinity_and_attention_from_credulous_young_women, modify_network(Y, X, affinity, '+', 5)).
rule_effect(cunning_seductive_men_may_seek_to_increase_affinity_and_attention_from_credulous_young_women, modify_network(Y, X, curiosity, '+', 5)).

rule_likelihood(intelligent_virtuous_women_distrust_seductive_cunning_men, 1).
rule_type(intelligent_virtuous_women_distrust_seductive_cunning_men, volition).
% Intelligent, virtuous women distrust seductive, cunning men
rule_active(intelligent_virtuous_women_distrust_seductive_cunning_men).
rule_category(intelligent_virtuous_women_distrust_seductive_cunning_men, deception_manipulation).
rule_source(intelligent_virtuous_women_distrust_seductive_cunning_men, ensemble).
rule_priority(intelligent_virtuous_women_distrust_seductive_cunning_men, 5).
rule_applies(intelligent_virtuous_women_distrust_seductive_cunning_men, X, Y) :-
    trait(X, female),
    trait(X, virtuous),
    trait(X, intelligent),
    trait(Y, male),
    attribute(Y, cunningness, Cunningness_val), Cunningness_val > 60,
    trait(Y, flirtatious).
rule_effect(intelligent_virtuous_women_distrust_seductive_cunning_men, modify_network(X, Y, affinity, '-', 5)).
rule_effect(intelligent_virtuous_women_distrust_seductive_cunning_men, modify_network(Y, X, credibility, '+', 5)).

rule_likelihood(gossips_may_repel_others, 1).
rule_type(gossips_may_repel_others, volition).
% Gossips may repel others
rule_active(gossips_may_repel_others).
rule_category(gossips_may_repel_others, deception_manipulation).
rule_source(gossips_may_repel_others, ensemble).
rule_priority(gossips_may_repel_others, 3).
rule_applies(gossips_may_repel_others, X, Y) :-
    trait(X, talkative),
    trait(X, indiscreet).
rule_effect(gossips_may_repel_others, modify_network(Y, X, affinity, '-', 3)).
rule_effect(gossips_may_repel_others, modify_network(X, Y, affinity, '-', 1)).

rule_likelihood(people_manipulate_their_subordinates_to_gain_influence, 1).
rule_type(people_manipulate_their_subordinates_to_gain_influence, volition).
% People manipulate their subordinates to gain influence.
rule_active(people_manipulate_their_subordinates_to_gain_influence).
rule_category(people_manipulate_their_subordinates_to_gain_influence, deception_manipulation).
rule_source(people_manipulate_their_subordinates_to_gain_influence, ensemble).
rule_priority(people_manipulate_their_subordinates_to_gain_influence, 1).
rule_applies(people_manipulate_their_subordinates_to_gain_influence, X, Y) :-
    directed_status(X, Y, is_boss_of).
rule_effect(people_manipulate_their_subordinates_to_gain_influence, set_intent(X, manipulate, Y, 1)).

rule_likelihood(people_with_selfish_traits_manipulate_others_to_get_closer, 1).
rule_type(people_with_selfish_traits_manipulate_others_to_get_closer, volition).
% People with selfish traits manipulate others to get closer.
rule_active(people_with_selfish_traits_manipulate_others_to_get_closer).
rule_category(people_with_selfish_traits_manipulate_others_to_get_closer, deception_manipulation).
rule_source(people_with_selfish_traits_manipulate_others_to_get_closer, ensemble).
rule_priority(people_with_selfish_traits_manipulate_others_to_get_closer, 3).
rule_applies(people_with_selfish_traits_manipulate_others_to_get_closer, X, Y) :-
    trait(X, selfish).
rule_effect(people_with_selfish_traits_manipulate_others_to_get_closer, set_intent(X, manipulate, Y, 3)).

%% ═══════════════════════════════════════════════════════════
%% Category: dominance-power
%% ═══════════════════════════════════════════════════════════

%% Ensemble Volition Rules: dominance-power
%% Source: data/ensemble/volitionRules/dominance-power.json
%% Converted: 2026-04-02T20:09:49.731Z
%% Total rules: 83

rule_likelihood(rich_old_people_intimidate_young_poor_people, 1).
rule_type(rich_old_people_intimidate_young_poor_people, volition).
% Rich old people intimidate young poor people
rule_active(rich_old_people_intimidate_young_poor_people).
rule_category(rich_old_people_intimidate_young_poor_people, dominance_power).
rule_source(rich_old_people_intimidate_young_poor_people, ensemble).
rule_priority(rich_old_people_intimidate_young_poor_people, 5).
rule_applies(rich_old_people_intimidate_young_poor_people, X, Y) :-
    trait(X, old),
    trait(X, rich),
    trait(Y, young),
    trait(Y, poor).
rule_effect(rich_old_people_intimidate_young_poor_people, modify_network(Y, X, affinity, '-', 5)).

rule_likelihood(new_dominance_rule, 1).
rule_type(new_dominance_rule, volition).
% New Dominance Rule
rule_active(new_dominance_rule).
rule_category(new_dominance_rule, dominance_power).
rule_source(new_dominance_rule, ensemble).
rule_priority(new_dominance_rule, 5).
rule_applies(new_dominance_rule, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val > 5.
rule_effect(new_dominance_rule, set_intent(X, dominate, Y, 5)).

rule_likelihood(people_s_desire_to_get_closer_increases_when_they_perceive_others_as_more_influential_or_strong, 1).
rule_type(people_s_desire_to_get_closer_increases_when_they_perceive_others_as_more_influential_or_strong, volition).
% People’s desire to get closer increases when they perceive others as more influential or strong
rule_active(people_s_desire_to_get_closer_increases_when_they_perceive_others_as_more_influential_or_strong).
rule_category(people_s_desire_to_get_closer_increases_when_they_perceive_others_as_more_influential_or_strong, dominance_power).
rule_source(people_s_desire_to_get_closer_increases_when_they_perceive_others_as_more_influential_or_strong, ensemble).
rule_priority(people_s_desire_to_get_closer_increases_when_they_perceive_others_as_more_influential_or_strong, 1).
rule_applies(people_s_desire_to_get_closer_increases_when_they_perceive_others_as_more_influential_or_strong, X, Y) :-
    event(X, mean).
rule_effect(people_s_desire_to_get_closer_increases_when_they_perceive_others_as_more_influential_or_strong, set_intent(X, antagonize, Y, 2)).

rule_likelihood(people_s_desire_to_be_closer_to_influential_individuals_and_recent_romantic_events_influence_their_intent, 1).
rule_type(people_s_desire_to_be_closer_to_influential_individuals_and_recent_romantic_events_influence_their_intent, volition).
% People’s desire to be closer to influential individuals and recent romantic events influence their intent
rule_active(people_s_desire_to_be_closer_to_influential_individuals_and_recent_romantic_events_influence_their_intent).
rule_category(people_s_desire_to_be_closer_to_influential_individuals_and_recent_romantic_events_influence_their_intent, dominance_power).
rule_source(people_s_desire_to_be_closer_to_influential_individuals_and_recent_romantic_events_influence_their_intent, ensemble).
rule_priority(people_s_desire_to_be_closer_to_influential_individuals_and_recent_romantic_events_influence_their_intent, 1).
rule_applies(people_s_desire_to_be_closer_to_influential_individuals_and_recent_romantic_events_influence_their_intent, X, Y) :-
    network(X, 'z', romance, Romance_val), Romance_val > 6,
    event(Y, romantic).
rule_effect(people_s_desire_to_be_closer_to_influential_individuals_and_recent_romantic_events_influence_their_intent, set_intent(X, antagonize, Y, 2)).

rule_likelihood(people_seek_to_form_connections_with_influential_individuals, 1).
rule_type(people_seek_to_form_connections_with_influential_individuals, volition).
% People seek to form connections with influential individuals
rule_active(people_seek_to_form_connections_with_influential_individuals).
rule_category(people_seek_to_form_connections_with_influential_individuals, dominance_power).
rule_source(people_seek_to_form_connections_with_influential_individuals, ensemble).
rule_priority(people_seek_to_form_connections_with_influential_individuals, 1).
rule_applies(people_seek_to_form_connections_with_influential_individuals, X, Y) :-
    directed_status(X, Y, public_friends).
rule_effect(people_seek_to_form_connections_with_influential_individuals, set_intent(X, candid, Y, 2)).

rule_likelihood(people_desire_to_be_in_close_proximity_with_influential_individuals, 1).
rule_type(people_desire_to_be_in_close_proximity_with_influential_individuals, volition).
% People desire to be in close proximity with influential individuals.
rule_active(people_desire_to_be_in_close_proximity_with_influential_individuals).
rule_category(people_desire_to_be_in_close_proximity_with_influential_individuals, dominance_power).
rule_source(people_desire_to_be_in_close_proximity_with_influential_individuals, ensemble).
rule_priority(people_desire_to_be_in_close_proximity_with_influential_individuals, 1).
rule_applies(people_desire_to_be_in_close_proximity_with_influential_individuals, X, Y) :-
    network(X, Y, romance, Romance_val), Romance_val > 6.
rule_effect(people_desire_to_be_in_close_proximity_with_influential_individuals, set_intent(X, candid, Y, 2)).

rule_likelihood(people_desire_to_connect_with_influential_individuals_within_their_social_circle, 1).
rule_type(people_desire_to_connect_with_influential_individuals_within_their_social_circle, volition).
% People desire to connect with influential individuals within their social circle.
rule_active(people_desire_to_connect_with_influential_individuals_within_their_social_circle).
rule_category(people_desire_to_connect_with_influential_individuals_within_their_social_circle, dominance_power).
rule_source(people_desire_to_connect_with_influential_individuals_within_their_social_circle, ensemble).
rule_priority(people_desire_to_connect_with_influential_individuals_within_their_social_circle, 1).
rule_applies(people_desire_to_connect_with_influential_individuals_within_their_social_circle, X, Y) :-
    network(X, Y, familial, Familial_val), Familial_val > 6.
rule_effect(people_desire_to_connect_with_influential_individuals_within_their_social_circle, set_intent(X, candid, Y, 2)).

rule_likelihood(people_seek_closer_connections_with_influential_individuals_within_their_social_network, 1).
rule_type(people_seek_closer_connections_with_influential_individuals_within_their_social_network, volition).
% People seek closer connections with influential individuals within their social network.
rule_active(people_seek_closer_connections_with_influential_individuals_within_their_social_network).
rule_category(people_seek_closer_connections_with_influential_individuals_within_their_social_network, dominance_power).
rule_source(people_seek_closer_connections_with_influential_individuals_within_their_social_network, ensemble).
rule_priority(people_seek_closer_connections_with_influential_individuals_within_their_social_network, 1).
rule_applies(people_seek_closer_connections_with_influential_individuals_within_their_social_network, X, Y) :-
    network(X, Y, romance, Romance_val), Romance_val > 3,
    network(X, Y, romance, Romance_val), Romance_val < 7.
rule_effect(people_seek_closer_connections_with_influential_individuals_within_their_social_network, set_intent(X, candid, Y, 1)).

rule_likelihood(people_seek_closer_connections_with_influential_individuals_within_their_network, 1).
rule_type(people_seek_closer_connections_with_influential_individuals_within_their_network, volition).
% People seek closer connections with influential individuals within their network.
rule_active(people_seek_closer_connections_with_influential_individuals_within_their_network).
rule_category(people_seek_closer_connections_with_influential_individuals_within_their_network, dominance_power).
rule_source(people_seek_closer_connections_with_influential_individuals_within_their_network, ensemble).
rule_priority(people_seek_closer_connections_with_influential_individuals_within_their_network, 1).
rule_applies(people_seek_closer_connections_with_influential_individuals_within_their_network, X, Y) :-
    network(X, Y, familial, Familial_val), Familial_val > 3,
    network(X, Y, familial, Familial_val), Familial_val < 7.
rule_effect(people_seek_closer_connections_with_influential_individuals_within_their_network, set_intent(X, candid, Y, 1)).

rule_likelihood(people_desire_to_form_friendships_with_individuals_they_perceive_as_more_influential_than_themselves, 1).
rule_type(people_desire_to_form_friendships_with_individuals_they_perceive_as_more_influential_than_themselves, volition).
% People desire to form friendships with individuals they perceive as more influential than themselves.
rule_active(people_desire_to_form_friendships_with_individuals_they_perceive_as_more_influential_than_themselves).
rule_category(people_desire_to_form_friendships_with_individuals_they_perceive_as_more_influential_than_themselves, dominance_power).
rule_source(people_desire_to_form_friendships_with_individuals_they_perceive_as_more_influential_than_themselves, ensemble).
rule_priority(people_desire_to_form_friendships_with_individuals_they_perceive_as_more_influential_than_themselves, 1).
rule_applies(people_desire_to_form_friendships_with_individuals_they_perceive_as_more_influential_than_themselves, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val < 4.
rule_effect(people_desire_to_form_friendships_with_individuals_they_perceive_as_more_influential_than_themselves, set_intent(X, candid, Y, -2)).

rule_likelihood(people_seek_closer_connections_with_influential_individuals_in_their_network, 1).
rule_type(people_seek_closer_connections_with_influential_individuals_in_their_network, volition).
% People seek closer connections with influential individuals in their network.
rule_active(people_seek_closer_connections_with_influential_individuals_in_their_network).
rule_category(people_seek_closer_connections_with_influential_individuals_in_their_network, dominance_power).
rule_source(people_seek_closer_connections_with_influential_individuals_in_their_network, ensemble).
rule_priority(people_seek_closer_connections_with_influential_individuals_in_their_network, 1).
rule_applies(people_seek_closer_connections_with_influential_individuals_in_their_network, X, Y) :-
    network(X, Y, familial, Familial_val), Familial_val < 4.
rule_effect(people_seek_closer_connections_with_influential_individuals_in_their_network, set_intent(X, candid, Y, -2)).

rule_likelihood(people_with_a_guilty_conscience_may_seek_proximity_to_influential_individuals, 1).
rule_type(people_with_a_guilty_conscience_may_seek_proximity_to_influential_individuals, volition).
% People with a guilty conscience may seek proximity to influential individuals.
rule_active(people_with_a_guilty_conscience_may_seek_proximity_to_influential_individuals).
rule_category(people_with_a_guilty_conscience_may_seek_proximity_to_influential_individuals, dominance_power).
rule_source(people_with_a_guilty_conscience_may_seek_proximity_to_influential_individuals, ensemble).
rule_priority(people_with_a_guilty_conscience_may_seek_proximity_to_influential_individuals, 1).
rule_applies(people_with_a_guilty_conscience_may_seek_proximity_to_influential_individuals, X, Y) :-
    status(X, guilty).
rule_effect(people_with_a_guilty_conscience_may_seek_proximity_to_influential_individuals, set_intent(X, candid, Y, -1)).

rule_likelihood(people_seek_proximity_to_influential_individuals_with_high_social_standing, 1).
rule_type(people_seek_proximity_to_influential_individuals_with_high_social_standing, volition).
% People seek proximity to influential individuals with high social standing.
rule_active(people_seek_proximity_to_influential_individuals_with_high_social_standing).
rule_category(people_seek_proximity_to_influential_individuals_with_high_social_standing, dominance_power).
rule_source(people_seek_proximity_to_influential_individuals_with_high_social_standing, ensemble).
rule_priority(people_seek_proximity_to_influential_individuals_with_high_social_standing, 1).
rule_applies(people_seek_proximity_to_influential_individuals_with_high_social_standing, X, Y) :-
    attribute(X, honor, Honor_val), Honor_val > 12.
rule_effect(people_seek_proximity_to_influential_individuals_with_high_social_standing, set_intent(X, candid, Y, 2)).

rule_likelihood(people_with_high_altruism_seek_to_connect_with_influential_individuals, 1).
rule_type(people_with_high_altruism_seek_to_connect_with_influential_individuals, volition).
% People with high altruism seek to connect with influential individuals.
rule_active(people_with_high_altruism_seek_to_connect_with_influential_individuals).
rule_category(people_with_high_altruism_seek_to_connect_with_influential_individuals, dominance_power).
rule_source(people_with_high_altruism_seek_to_connect_with_influential_individuals, ensemble).
rule_priority(people_with_high_altruism_seek_to_connect_with_influential_individuals, 1).
rule_applies(people_with_high_altruism_seek_to_connect_with_influential_individuals, X, Y) :-
    attribute(X, altruism, Altruism_val), Altruism_val > 12.
rule_effect(people_with_high_altruism_seek_to_connect_with_influential_individuals, set_intent(X, candid, Y, 1)).

rule_likelihood(people_desire_to_be_in_the_company_of_influential_individuals, 1).
rule_type(people_desire_to_be_in_the_company_of_influential_individuals, volition).
% People desire to be in the company of influential individuals.
rule_active(people_desire_to_be_in_the_company_of_influential_individuals).
rule_category(people_desire_to_be_in_the_company_of_influential_individuals, dominance_power).
rule_source(people_desire_to_be_in_the_company_of_influential_individuals, ensemble).
rule_priority(people_desire_to_be_in_the_company_of_influential_individuals, 1).
rule_applies(people_desire_to_be_in_the_company_of_influential_individuals, X, Y) :-
    event(X, nice).
rule_effect(people_desire_to_be_in_the_company_of_influential_individuals, set_intent(X, candid, Y, 2)).

rule_likelihood(people_aspire_to_connect_with_influential_individuals_in_their_social_circles, 1).
rule_type(people_aspire_to_connect_with_influential_individuals_in_their_social_circles, volition).
% People aspire to connect with influential individuals in their social circles.
rule_active(people_aspire_to_connect_with_influential_individuals_in_their_social_circles).
rule_category(people_aspire_to_connect_with_influential_individuals_in_their_social_circles, dominance_power).
rule_source(people_aspire_to_connect_with_influential_individuals_in_their_social_circles, ensemble).
rule_priority(people_aspire_to_connect_with_influential_individuals_in_their_social_circles, 1).
rule_applies(people_aspire_to_connect_with_influential_individuals_in_their_social_circles, X, Y) :-
    directed_status(X, 'z', is_boss_of),
    directed_status(Y, 'z', is_boss_of).
rule_effect(people_aspire_to_connect_with_influential_individuals_in_their_social_circles, set_intent(X, candid, Y, 1)).

rule_likelihood(people_seek_to_connect_with_influential_individuals_when_they_have_a_strong_desire_for_someone_and_it_has, 1).
rule_type(people_seek_to_connect_with_influential_individuals_when_they_have_a_strong_desire_for_someone_and_it_has, volition).
% People seek to connect with influential individuals when they have a strong desire for someone and it has
rule_active(people_seek_to_connect_with_influential_individuals_when_they_have_a_strong_desire_for_someone_and_it_has).
rule_category(people_seek_to_connect_with_influential_individuals_when_they_have_a_strong_desire_for_someone_and_it_has, dominance_power).
rule_source(people_seek_to_connect_with_influential_individuals_when_they_have_a_strong_desire_for_someone_and_it_has, ensemble).
rule_priority(people_seek_to_connect_with_influential_individuals_when_they_have_a_strong_desire_for_someone_and_it_has, 1).
rule_applies(people_seek_to_connect_with_influential_individuals_when_they_have_a_strong_desire_for_someone_and_it_has, X, Y) :-
    network(X, 'z', antagonism, Antagonism_val), Antagonism_val > 6,
    event(Y, mean).
rule_effect(people_seek_to_connect_with_influential_individuals_when_they_have_a_strong_desire_for_someone_and_it_has, set_intent(X, candid, Y, 2)).

rule_likelihood(people_desire_to_connect_with_influential_individuals_when_they_have_a_strong_interest_in_someone_and_it_has, 1).
rule_type(people_desire_to_connect_with_influential_individuals_when_they_have_a_strong_interest_in_someone_and_it_has, volition).
% People desire to connect with influential individuals when they have a strong interest in someone and it has
rule_active(people_desire_to_connect_with_influential_individuals_when_they_have_a_strong_interest_in_someone_and_it_has).
rule_category(people_desire_to_connect_with_influential_individuals_when_they_have_a_strong_interest_in_someone_and_it_has, dominance_power).
rule_source(people_desire_to_connect_with_influential_individuals_when_they_have_a_strong_interest_in_someone_and_it_has, ensemble).
rule_priority(people_desire_to_connect_with_influential_individuals_when_they_have_a_strong_interest_in_someone_and_it_has, 1).
rule_applies(people_desire_to_connect_with_influential_individuals_when_they_have_a_strong_interest_in_someone_and_it_has, X, Y) :-
    network(X, 'z', antagonism, Antagonism_val), Antagonism_val > 6,
    event(Y, mean).
rule_effect(people_desire_to_connect_with_influential_individuals_when_they_have_a_strong_interest_in_someone_and_it_has, set_intent(X, candid, Y, 1)).

rule_likelihood(people_are_inclined_to_seek_closer_relationships_with_influential_individuals, 1).
rule_type(people_are_inclined_to_seek_closer_relationships_with_influential_individuals, volition).
% People are inclined to seek closer relationships with influential individuals.
rule_active(people_are_inclined_to_seek_closer_relationships_with_influential_individuals).
rule_category(people_are_inclined_to_seek_closer_relationships_with_influential_individuals, dominance_power).
rule_source(people_are_inclined_to_seek_closer_relationships_with_influential_individuals, ensemble).
rule_priority(people_are_inclined_to_seek_closer_relationships_with_influential_individuals, 5).
rule_applies(people_are_inclined_to_seek_closer_relationships_with_influential_individuals, X, Y) :-
    network(X, Y, romance, Romance_val), Romance_val > 6.
rule_effect(people_are_inclined_to_seek_closer_relationships_with_influential_individuals, set_intent(X, favor, Y, 5)).

rule_likelihood(people_seek_proximity_to_influential_individuals_for_personal_growth_and_connections, 1).
rule_type(people_seek_proximity_to_influential_individuals_for_personal_growth_and_connections, volition).
% People seek proximity to influential individuals for personal growth and connections.
rule_active(people_seek_proximity_to_influential_individuals_for_personal_growth_and_connections).
rule_category(people_seek_proximity_to_influential_individuals_for_personal_growth_and_connections, dominance_power).
rule_source(people_seek_proximity_to_influential_individuals_for_personal_growth_and_connections, ensemble).
rule_priority(people_seek_proximity_to_influential_individuals_for_personal_growth_and_connections, 5).
rule_applies(people_seek_proximity_to_influential_individuals_for_personal_growth_and_connections, X, Y) :-
    network(X, Y, familial, Familial_val), Familial_val > 6.
rule_effect(people_seek_proximity_to_influential_individuals_for_personal_growth_and_connections, set_intent(X, favor, Y, 5)).

rule_likelihood(people_seek_proximity_to_influential_individuals_due_to_gratitude, 1).
rule_type(people_seek_proximity_to_influential_individuals_due_to_gratitude, volition).
% People seek proximity to influential individuals due to gratitude.
rule_active(people_seek_proximity_to_influential_individuals_due_to_gratitude).
rule_category(people_seek_proximity_to_influential_individuals_due_to_gratitude, dominance_power).
rule_source(people_seek_proximity_to_influential_individuals_due_to_gratitude, ensemble).
rule_priority(people_seek_proximity_to_influential_individuals_due_to_gratitude, 1).
rule_applies(people_seek_proximity_to_influential_individuals_due_to_gratitude, X, Y) :-
    network(X, Y, gratitude, Gratitude_val), Gratitude_val < 4.
rule_effect(people_seek_proximity_to_influential_individuals_due_to_gratitude, set_intent(X, favor, Y, -2)).

rule_likelihood(people_are_inclined_to_seek_companionship_with_influential_individuals, 1).
rule_type(people_are_inclined_to_seek_companionship_with_influential_individuals, volition).
% People are inclined to seek companionship with influential individuals.
rule_active(people_are_inclined_to_seek_companionship_with_influential_individuals).
rule_category(people_are_inclined_to_seek_companionship_with_influential_individuals, dominance_power).
rule_source(people_are_inclined_to_seek_companionship_with_influential_individuals, ensemble).
rule_priority(people_are_inclined_to_seek_companionship_with_influential_individuals, 3).
rule_applies(people_are_inclined_to_seek_companionship_with_influential_individuals, X, Y) :-
    trait(X, helpful).
rule_effect(people_are_inclined_to_seek_companionship_with_influential_individuals, set_intent(X, favor, Y, 3)).

rule_likelihood(people_seek_companionship_with_influential_individuals_to_form_connections, 1).
rule_type(people_seek_companionship_with_influential_individuals_to_form_connections, volition).
% People seek companionship with influential individuals to form connections.
rule_active(people_seek_companionship_with_influential_individuals_to_form_connections).
rule_category(people_seek_companionship_with_influential_individuals_to_form_connections, dominance_power).
rule_source(people_seek_companionship_with_influential_individuals_to_form_connections, ensemble).
rule_priority(people_seek_companionship_with_influential_individuals_to_form_connections, 3).
rule_applies(people_seek_companionship_with_influential_individuals_to_form_connections, X, Y) :-
    event(X, mean).
rule_effect(people_seek_companionship_with_influential_individuals_to_form_connections, set_intent(X, favor, Y, -3)).

rule_likelihood(people_develop_a_preference_to_be_around_influential_individuals, 1).
rule_type(people_develop_a_preference_to_be_around_influential_individuals, volition).
% People develop a preference to be around influential individuals.
rule_active(people_develop_a_preference_to_be_around_influential_individuals).
rule_category(people_develop_a_preference_to_be_around_influential_individuals, dominance_power).
rule_source(people_develop_a_preference_to_be_around_influential_individuals, ensemble).
rule_priority(people_develop_a_preference_to_be_around_influential_individuals, 1).
rule_applies(people_develop_a_preference_to_be_around_influential_individuals, X, Y) :-
    event(X, mean).
rule_effect(people_develop_a_preference_to_be_around_influential_individuals, set_intent(X, favor, Y, -1)).

rule_likelihood(people_are_inclined_to_strengthen_their_connections_with_influential_individuals_and_seek_companionship_from_those, 1).
rule_type(people_are_inclined_to_strengthen_their_connections_with_influential_individuals_and_seek_companionship_from_those, volition).
% People are inclined to strengthen their connections with influential individuals and seek companionship from those
rule_active(people_are_inclined_to_strengthen_their_connections_with_influential_individuals_and_seek_companionship_from_those).
rule_category(people_are_inclined_to_strengthen_their_connections_with_influential_individuals_and_seek_companionship_from_those, dominance_power).
rule_source(people_are_inclined_to_strengthen_their_connections_with_influential_individuals_and_seek_companionship_from_those, ensemble).
rule_priority(people_are_inclined_to_strengthen_their_connections_with_influential_individuals_and_seek_companionship_from_those, 1).
rule_applies(people_are_inclined_to_strengthen_their_connections_with_influential_individuals_and_seek_companionship_from_those, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    network(Y, 'z', friendship, Friendship_val), Friendship_val > 6.
rule_effect(people_are_inclined_to_strengthen_their_connections_with_influential_individuals_and_seek_companionship_from_those, set_intent(X, favor, Y, 2)).

rule_likelihood(people_are_inclined_to_seek_connections_with_influential_individuals_and_their_romantic_interests, 1).
rule_type(people_are_inclined_to_seek_connections_with_influential_individuals_and_their_romantic_interests, volition).
% People are inclined to seek connections with influential individuals and their romantic interests.
rule_active(people_are_inclined_to_seek_connections_with_influential_individuals_and_their_romantic_interests).
rule_category(people_are_inclined_to_seek_connections_with_influential_individuals_and_their_romantic_interests, dominance_power).
rule_source(people_are_inclined_to_seek_connections_with_influential_individuals_and_their_romantic_interests, ensemble).
rule_priority(people_are_inclined_to_seek_connections_with_influential_individuals_and_their_romantic_interests, 3).
rule_applies(people_are_inclined_to_seek_connections_with_influential_individuals_and_their_romantic_interests, X, Y) :-
    network(X, 'z', romance, Romance_val), Romance_val > 6,
    network(Y, 'z', romance, Romance_val), Romance_val > 6.
rule_effect(people_are_inclined_to_seek_connections_with_influential_individuals_and_their_romantic_interests, set_intent(X, favor, Y, -3)).

rule_likelihood(people_desire_to_associate_with_those_they_perceive_as_more_influential_or_popular_than_themselves, 1).
rule_type(people_desire_to_associate_with_those_they_perceive_as_more_influential_or_popular_than_themselves, volition).
% People desire to associate with those they perceive as more influential or popular than themselves.
rule_active(people_desire_to_associate_with_those_they_perceive_as_more_influential_or_popular_than_themselves).
rule_category(people_desire_to_associate_with_those_they_perceive_as_more_influential_or_popular_than_themselves, dominance_power).
rule_source(people_desire_to_associate_with_those_they_perceive_as_more_influential_or_popular_than_themselves, ensemble).
rule_priority(people_desire_to_associate_with_those_they_perceive_as_more_influential_or_popular_than_themselves, 1).
rule_applies(people_desire_to_associate_with_those_they_perceive_as_more_influential_or_popular_than_themselves, X, Y) :-
    network(X, 'z', antagonism, Antagonism_val), Antagonism_val > 6,
    network(Y, 'z', antagonism, Antagonism_val), Antagonism_val > 6.
rule_effect(people_desire_to_associate_with_those_they_perceive_as_more_influential_or_popular_than_themselves, set_intent(X, favor, Y, 1)).

rule_likelihood(people_seek_to_form_friendships_with_influential_individuals_and_have_positive_interactions_within_a_short_timeframe, 1).
rule_type(people_seek_to_form_friendships_with_influential_individuals_and_have_positive_interactions_within_a_short_timeframe, volition).
% People seek to form friendships with influential individuals and have positive interactions within a short timeframe
rule_active(people_seek_to_form_friendships_with_influential_individuals_and_have_positive_interactions_within_a_short_timeframe).
rule_category(people_seek_to_form_friendships_with_influential_individuals_and_have_positive_interactions_within_a_short_timeframe, dominance_power).
rule_source(people_seek_to_form_friendships_with_influential_individuals_and_have_positive_interactions_within_a_short_timeframe, ensemble).
rule_priority(people_seek_to_form_friendships_with_influential_individuals_and_have_positive_interactions_within_a_short_timeframe, 1).
rule_applies(people_seek_to_form_friendships_with_influential_individuals_and_have_positive_interactions_within_a_short_timeframe, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, nice).
rule_effect(people_seek_to_form_friendships_with_influential_individuals_and_have_positive_interactions_within_a_short_timeframe, set_intent(X, favor, Y, 1)).

rule_likelihood(people_seek_closer_friendships_with_influential_individuals_and_prioritize_dating_their_crushes, 1).
rule_type(people_seek_closer_friendships_with_influential_individuals_and_prioritize_dating_their_crushes, volition).
% People seek closer friendships with influential individuals and prioritize dating their crushes
rule_active(people_seek_closer_friendships_with_influential_individuals_and_prioritize_dating_their_crushes).
rule_category(people_seek_closer_friendships_with_influential_individuals_and_prioritize_dating_their_crushes, dominance_power).
rule_source(people_seek_closer_friendships_with_influential_individuals_and_prioritize_dating_their_crushes, ensemble).
rule_priority(people_seek_closer_friendships_with_influential_individuals_and_prioritize_dating_their_crushes, 3).
rule_applies(people_seek_closer_friendships_with_influential_individuals_and_prioritize_dating_their_crushes, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, mean).
rule_effect(people_seek_closer_friendships_with_influential_individuals_and_prioritize_dating_their_crushes, set_intent(X, favor, Y, -3)).

rule_likelihood(people_seek_to_deepen_connections_with_influential_individuals_when_they_have_had_meaningful_interactions_within_the, 1).
rule_type(people_seek_to_deepen_connections_with_influential_individuals_when_they_have_had_meaningful_interactions_within_the, volition).
% People seek to deepen connections with influential individuals when they have had meaningful interactions within the
rule_active(people_seek_to_deepen_connections_with_influential_individuals_when_they_have_had_meaningful_interactions_within_the).
rule_category(people_seek_to_deepen_connections_with_influential_individuals_when_they_have_had_meaningful_interactions_within_the, dominance_power).
rule_source(people_seek_to_deepen_connections_with_influential_individuals_when_they_have_had_meaningful_interactions_within_the, ensemble).
rule_priority(people_seek_to_deepen_connections_with_influential_individuals_when_they_have_had_meaningful_interactions_within_the, 1).
rule_applies(people_seek_to_deepen_connections_with_influential_individuals_when_they_have_had_meaningful_interactions_within_the, X, Y) :-
    network(X, 'z', romance, Romance_val), Romance_val > 6,
    event(Y, mean).
rule_effect(people_seek_to_deepen_connections_with_influential_individuals_when_they_have_had_meaningful_interactions_within_the, set_intent(X, favor, Y, -1)).

rule_likelihood(people_tend_to_seek_closer_relationships_with_influential_individuals_and_have_a_strong_desire_for_their_crush, 1).
rule_type(people_tend_to_seek_closer_relationships_with_influential_individuals_and_have_a_strong_desire_for_their_crush, volition).
% People tend to seek closer relationships with influential individuals and have a strong desire for their crush
rule_active(people_tend_to_seek_closer_relationships_with_influential_individuals_and_have_a_strong_desire_for_their_crush).
rule_category(people_tend_to_seek_closer_relationships_with_influential_individuals_and_have_a_strong_desire_for_their_crush, dominance_power).
rule_source(people_tend_to_seek_closer_relationships_with_influential_individuals_and_have_a_strong_desire_for_their_crush, ensemble).
rule_priority(people_tend_to_seek_closer_relationships_with_influential_individuals_and_have_a_strong_desire_for_their_crush, 5).
rule_applies(people_tend_to_seek_closer_relationships_with_influential_individuals_and_have_a_strong_desire_for_their_crush, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, mean).
rule_effect(people_tend_to_seek_closer_relationships_with_influential_individuals_and_have_a_strong_desire_for_their_crush, set_intent(X, favor, Y, -5)).

rule_likelihood(people_seek_closer_connections_with_influential_individuals_and_have_a_strong_inclination_to_date_their_crush, 1).
rule_type(people_seek_closer_connections_with_influential_individuals_and_have_a_strong_inclination_to_date_their_crush, volition).
% People seek closer connections with influential individuals and have a strong inclination to date their crush
rule_active(people_seek_closer_connections_with_influential_individuals_and_have_a_strong_inclination_to_date_their_crush).
rule_category(people_seek_closer_connections_with_influential_individuals_and_have_a_strong_inclination_to_date_their_crush, dominance_power).
rule_source(people_seek_closer_connections_with_influential_individuals_and_have_a_strong_inclination_to_date_their_crush, ensemble).
rule_priority(people_seek_closer_connections_with_influential_individuals_and_have_a_strong_inclination_to_date_their_crush, 3).
rule_applies(people_seek_closer_connections_with_influential_individuals_and_have_a_strong_inclination_to_date_their_crush, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, mean).
rule_effect(people_seek_closer_connections_with_influential_individuals_and_have_a_strong_inclination_to_date_their_crush, set_intent(X, favor, Y, -3)).

rule_likelihood(people_desire_to_connect_with_influential_individuals_and_are_inclined_towards_dating_their_crushes, 1).
rule_type(people_desire_to_connect_with_influential_individuals_and_are_inclined_towards_dating_their_crushes, volition).
% People desire to connect with influential individuals and are inclined towards dating their crushes
rule_active(people_desire_to_connect_with_influential_individuals_and_are_inclined_towards_dating_their_crushes).
rule_category(people_desire_to_connect_with_influential_individuals_and_are_inclined_towards_dating_their_crushes, dominance_power).
rule_source(people_desire_to_connect_with_influential_individuals_and_are_inclined_towards_dating_their_crushes, ensemble).
rule_priority(people_desire_to_connect_with_influential_individuals_and_are_inclined_towards_dating_their_crushes, 1).
rule_applies(people_desire_to_connect_with_influential_individuals_and_are_inclined_towards_dating_their_crushes, X, Y) :-
    network(X, 'z', antagonism, Antagonism_val), Antagonism_val > 6,
    event(Y, mean).
rule_effect(people_desire_to_connect_with_influential_individuals_and_are_inclined_towards_dating_their_crushes, set_intent(X, favor, Y, 2)).

rule_likelihood(people_may_seek_to_improve_their_social_standing_by_associating_with_influential_individuals_when_they_have_recently, 1).
rule_type(people_may_seek_to_improve_their_social_standing_by_associating_with_influential_individuals_when_they_have_recently, volition).
% People may seek to improve their social standing by associating with influential individuals when they have recently
rule_active(people_may_seek_to_improve_their_social_standing_by_associating_with_influential_individuals_when_they_have_recently).
rule_category(people_may_seek_to_improve_their_social_standing_by_associating_with_influential_individuals_when_they_have_recently, dominance_power).
rule_source(people_may_seek_to_improve_their_social_standing_by_associating_with_influential_individuals_when_they_have_recently, ensemble).
rule_priority(people_may_seek_to_improve_their_social_standing_by_associating_with_influential_individuals_when_they_have_recently, 1).
rule_applies(people_may_seek_to_improve_their_social_standing_by_associating_with_influential_individuals_when_they_have_recently, X, Y) :-
    network(X, 'z', antagonism, Antagonism_val), Antagonism_val > 6,
    event(Y, did_a_favor_for).
rule_effect(people_may_seek_to_improve_their_social_standing_by_associating_with_influential_individuals_when_they_have_recently, set_intent(X, favor, Y, -1)).

rule_likelihood(people_desire_to_associate_with_influential_individuals_for_personal_growth_and_respect, 1).
rule_type(people_desire_to_associate_with_influential_individuals_for_personal_growth_and_respect, volition).
% People desire to associate with influential individuals for personal growth and respect.
rule_active(people_desire_to_associate_with_influential_individuals_for_personal_growth_and_respect).
rule_category(people_desire_to_associate_with_influential_individuals_for_personal_growth_and_respect, dominance_power).
rule_source(people_desire_to_associate_with_influential_individuals_for_personal_growth_and_respect, ensemble).
rule_priority(people_desire_to_associate_with_influential_individuals_for_personal_growth_and_respect, 1).
rule_applies(people_desire_to_associate_with_influential_individuals_for_personal_growth_and_respect, X, Y) :-
    directed_status(X, Y, public_friends).
rule_effect(people_desire_to_associate_with_influential_individuals_for_personal_growth_and_respect, set_intent(X, honor, Y, 1)).

rule_likelihood(people_desire_to_pursue_relationships_with_individuals_they_perceive_as_more_influential_or_popular, 1).
rule_type(people_desire_to_pursue_relationships_with_individuals_they_perceive_as_more_influential_or_popular, volition).
% People desire to pursue relationships with individuals they perceive as more influential or popular.
rule_active(people_desire_to_pursue_relationships_with_individuals_they_perceive_as_more_influential_or_popular).
rule_category(people_desire_to_pursue_relationships_with_individuals_they_perceive_as_more_influential_or_popular, dominance_power).
rule_source(people_desire_to_pursue_relationships_with_individuals_they_perceive_as_more_influential_or_popular, ensemble).
rule_priority(people_desire_to_pursue_relationships_with_individuals_they_perceive_as_more_influential_or_popular, 1).
rule_applies(people_desire_to_pursue_relationships_with_individuals_they_perceive_as_more_influential_or_popular, X, Y) :-
    network(X, Y, romance, Romance_val), Romance_val > 6.
rule_effect(people_desire_to_pursue_relationships_with_individuals_they_perceive_as_more_influential_or_popular, set_intent(X, honor, Y, 1)).

rule_likelihood(people_desire_to_associate_with_influential_individuals_despite_existing_rivalries, 1).
rule_type(people_desire_to_associate_with_influential_individuals_despite_existing_rivalries, volition).
% People desire to associate with influential individuals despite existing rivalries.
rule_active(people_desire_to_associate_with_influential_individuals_despite_existing_rivalries).
rule_category(people_desire_to_associate_with_influential_individuals_despite_existing_rivalries, dominance_power).
rule_source(people_desire_to_associate_with_influential_individuals_despite_existing_rivalries, ensemble).
rule_priority(people_desire_to_associate_with_influential_individuals_despite_existing_rivalries, 1).
rule_applies(people_desire_to_associate_with_influential_individuals_despite_existing_rivalries, X, Y) :-
    network(X, Y, antagonism, Antagonism_val), Antagonism_val > 6.
rule_effect(people_desire_to_associate_with_influential_individuals_despite_existing_rivalries, set_intent(X, honor, Y, -1)).

rule_likelihood(people_seek_to_strengthen_connections_with_influential_individuals, 1).
rule_type(people_seek_to_strengthen_connections_with_influential_individuals, volition).
% People seek to strengthen connections with influential individuals.
rule_active(people_seek_to_strengthen_connections_with_influential_individuals).
rule_category(people_seek_to_strengthen_connections_with_influential_individuals, dominance_power).
rule_source(people_seek_to_strengthen_connections_with_influential_individuals, ensemble).
rule_priority(people_seek_to_strengthen_connections_with_influential_individuals, 1).
rule_applies(people_seek_to_strengthen_connections_with_influential_individuals, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val < 4.
rule_effect(people_seek_to_strengthen_connections_with_influential_individuals, set_intent(X, honor, Y, -2)).

rule_likelihood(people_seek_to_honor_their_connections_with_influential_individuals, 1).
rule_type(people_seek_to_honor_their_connections_with_influential_individuals, volition).
% People seek to honor their connections with influential individuals.
rule_active(people_seek_to_honor_their_connections_with_influential_individuals).
rule_category(people_seek_to_honor_their_connections_with_influential_individuals, dominance_power).
rule_source(people_seek_to_honor_their_connections_with_influential_individuals, ensemble).
rule_priority(people_seek_to_honor_their_connections_with_influential_individuals, 1).
rule_applies(people_seek_to_honor_their_connections_with_influential_individuals, X, Y) :-
    status(X, successful).
rule_effect(people_seek_to_honor_their_connections_with_influential_individuals, set_intent(X, honor, Y, 1)).

rule_likelihood(people_seek_to_honor_their_connections_with_influential_individuals, 1).
rule_type(people_seek_to_honor_their_connections_with_influential_individuals, volition).
% People seek to honor their connections with influential individuals.
rule_active(people_seek_to_honor_their_connections_with_influential_individuals).
rule_category(people_seek_to_honor_their_connections_with_influential_individuals, dominance_power).
rule_source(people_seek_to_honor_their_connections_with_influential_individuals, ensemble).
rule_priority(people_seek_to_honor_their_connections_with_influential_individuals, 1).
rule_applies(people_seek_to_honor_their_connections_with_influential_individuals, X, Y) :-
    trait(X, friendly).
rule_effect(people_seek_to_honor_their_connections_with_influential_individuals, set_intent(X, honor, Y, 1)).

rule_likelihood(people_seek_to_associate_with_influential_individuals_despite_their_initial_discomfort, 1).
rule_type(people_seek_to_associate_with_influential_individuals_despite_their_initial_discomfort, volition).
% People seek to associate with influential individuals despite their initial discomfort.
rule_active(people_seek_to_associate_with_influential_individuals_despite_their_initial_discomfort).
rule_category(people_seek_to_associate_with_influential_individuals_despite_their_initial_discomfort, dominance_power).
rule_source(people_seek_to_associate_with_influential_individuals_despite_their_initial_discomfort, ensemble).
rule_priority(people_seek_to_associate_with_influential_individuals_despite_their_initial_discomfort, 1).
rule_applies(people_seek_to_associate_with_influential_individuals_despite_their_initial_discomfort, X, Y) :-
    event(X, mean).
rule_effect(people_seek_to_associate_with_influential_individuals_despite_their_initial_discomfort, set_intent(X, honor, Y, -2)).

rule_likelihood(people_seek_companionship_with_influential_individuals_to_gain_respect_and_admiration, 1).
rule_type(people_seek_companionship_with_influential_individuals_to_gain_respect_and_admiration, volition).
% People seek companionship with influential individuals to gain respect and admiration.
rule_active(people_seek_companionship_with_influential_individuals_to_gain_respect_and_admiration).
rule_category(people_seek_companionship_with_influential_individuals_to_gain_respect_and_admiration, dominance_power).
rule_source(people_seek_companionship_with_influential_individuals_to_gain_respect_and_admiration, ensemble).
rule_priority(people_seek_companionship_with_influential_individuals_to_gain_respect_and_admiration, 1).
rule_applies(people_seek_companionship_with_influential_individuals_to_gain_respect_and_admiration, X, Y) :-
    event(X, mean).
rule_effect(people_seek_companionship_with_influential_individuals_to_gain_respect_and_admiration, set_intent(X, honor, Y, -1)).

rule_likelihood(people_desire_to_strengthen_connections_with_influential_individuals_in_their_network, 1).
rule_type(people_desire_to_strengthen_connections_with_influential_individuals_in_their_network, volition).
% People desire to strengthen connections with influential individuals in their network.
rule_active(people_desire_to_strengthen_connections_with_influential_individuals_in_their_network).
rule_category(people_desire_to_strengthen_connections_with_influential_individuals_in_their_network, dominance_power).
rule_source(people_desire_to_strengthen_connections_with_influential_individuals_in_their_network, ensemble).
rule_priority(people_desire_to_strengthen_connections_with_influential_individuals_in_their_network, 1).
rule_applies(people_desire_to_strengthen_connections_with_influential_individuals_in_their_network, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    network(Y, 'z', familial, Familial_val), Familial_val > 6.
rule_effect(people_desire_to_strengthen_connections_with_influential_individuals_in_their_network, set_intent(X, honor, Y, 1)).

rule_likelihood(people_seek_to_strengthen_friendships_with_influential_individuals_within_a_short_timeframe_after_showing_interest, 1).
rule_type(people_seek_to_strengthen_friendships_with_influential_individuals_within_a_short_timeframe_after_showing_interest, volition).
% People seek to strengthen friendships with influential individuals within a short timeframe after showing interest
rule_active(people_seek_to_strengthen_friendships_with_influential_individuals_within_a_short_timeframe_after_showing_interest).
rule_category(people_seek_to_strengthen_friendships_with_influential_individuals_within_a_short_timeframe_after_showing_interest, dominance_power).
rule_source(people_seek_to_strengthen_friendships_with_influential_individuals_within_a_short_timeframe_after_showing_interest, ensemble).
rule_priority(people_seek_to_strengthen_friendships_with_influential_individuals_within_a_short_timeframe_after_showing_interest, 3).
rule_applies(people_seek_to_strengthen_friendships_with_influential_individuals_within_a_short_timeframe_after_showing_interest, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, mean).
rule_effect(people_seek_to_strengthen_friendships_with_influential_individuals_within_a_short_timeframe_after_showing_interest, set_intent(X, honor, Y, -3)).

rule_likelihood(people_desire_to_strengthen_friendships_with_influential_individuals_and_prioritize_dating_their_cr, 1).
rule_type(people_desire_to_strengthen_friendships_with_influential_individuals_and_prioritize_dating_their_cr, volition).
% People desire to strengthen friendships with influential individuals and prioritize dating their cr
rule_active(people_desire_to_strengthen_friendships_with_influential_individuals_and_prioritize_dating_their_cr).
rule_category(people_desire_to_strengthen_friendships_with_influential_individuals_and_prioritize_dating_their_cr, dominance_power).
rule_source(people_desire_to_strengthen_friendships_with_influential_individuals_and_prioritize_dating_their_cr, ensemble).
rule_priority(people_desire_to_strengthen_friendships_with_influential_individuals_and_prioritize_dating_their_cr, 1).
rule_applies(people_desire_to_strengthen_friendships_with_influential_individuals_and_prioritize_dating_their_cr, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, mean).
rule_effect(people_desire_to_strengthen_friendships_with_influential_individuals_and_prioritize_dating_their_cr, set_intent(X, honor, Y, -1)).

rule_likelihood(people_s_desire_to_strengthen_connections_with_influential_individuals_decreases_over_time_if_they_haven, 1).
rule_type(people_s_desire_to_strengthen_connections_with_influential_individuals_decreases_over_time_if_they_haven, volition).
% People’s desire to strengthen connections with influential individuals decreases over time if they haven
rule_active(people_s_desire_to_strengthen_connections_with_influential_individuals_decreases_over_time_if_they_haven).
rule_category(people_s_desire_to_strengthen_connections_with_influential_individuals_decreases_over_time_if_they_haven, dominance_power).
rule_source(people_s_desire_to_strengthen_connections_with_influential_individuals_decreases_over_time_if_they_haven, ensemble).
rule_priority(people_s_desire_to_strengthen_connections_with_influential_individuals_decreases_over_time_if_they_haven, 3).
rule_applies(people_s_desire_to_strengthen_connections_with_influential_individuals_decreases_over_time_if_they_haven, X, Y) :-
    network(X, 'z', romance, Romance_val), Romance_val > 6,
    event(Y, mean).
rule_effect(people_s_desire_to_strengthen_connections_with_influential_individuals_decreases_over_time_if_they_haven, set_intent(X, honor, Y, -3)).

rule_likelihood(people_desire_to_connect_with_influential_individuals_and_have_a_strong_interest_in_their_crush_within_the, 1).
rule_type(people_desire_to_connect_with_influential_individuals_and_have_a_strong_interest_in_their_crush_within_the, volition).
% People desire to connect with influential individuals and have a strong interest in their crush within the
rule_active(people_desire_to_connect_with_influential_individuals_and_have_a_strong_interest_in_their_crush_within_the).
rule_category(people_desire_to_connect_with_influential_individuals_and_have_a_strong_interest_in_their_crush_within_the, dominance_power).
rule_source(people_desire_to_connect_with_influential_individuals_and_have_a_strong_interest_in_their_crush_within_the, ensemble).
rule_priority(people_desire_to_connect_with_influential_individuals_and_have_a_strong_interest_in_their_crush_within_the, 1).
rule_applies(people_desire_to_connect_with_influential_individuals_and_have_a_strong_interest_in_their_crush_within_the, X, Y) :-
    network(X, 'z', romance, Romance_val), Romance_val > 6,
    event(Y, mean).
rule_effect(people_desire_to_connect_with_influential_individuals_and_have_a_strong_interest_in_their_crush_within_the, set_intent(X, honor, Y, -2)).

rule_likelihood(people_seek_romantic_connections_with_influential_individuals_when_they_have_been_consistently_interested_in_their_cr, 1).
rule_type(people_seek_romantic_connections_with_influential_individuals_when_they_have_been_consistently_interested_in_their_cr, volition).
% People seek romantic connections with influential individuals when they have been consistently interested in their cr
rule_active(people_seek_romantic_connections_with_influential_individuals_when_they_have_been_consistently_interested_in_their_cr).
rule_category(people_seek_romantic_connections_with_influential_individuals_when_they_have_been_consistently_interested_in_their_cr, dominance_power).
rule_source(people_seek_romantic_connections_with_influential_individuals_when_they_have_been_consistently_interested_in_their_cr, ensemble).
rule_priority(people_seek_romantic_connections_with_influential_individuals_when_they_have_been_consistently_interested_in_their_cr, 1).
rule_applies(people_seek_romantic_connections_with_influential_individuals_when_they_have_been_consistently_interested_in_their_cr, X, Y) :-
    network(X, 'z', romance, Romance_val), Romance_val > 6,
    event(Y, mean).
rule_effect(people_seek_romantic_connections_with_influential_individuals_when_they_have_been_consistently_interested_in_their_cr, set_intent(X, honor, Y, -1)).

rule_likelihood(people_aim_to_strengthen_connections_with_influential_individuals_and_prioritize_dating_their_crush, 1).
rule_type(people_aim_to_strengthen_connections_with_influential_individuals_and_prioritize_dating_their_crush, volition).
% People aim to strengthen connections with influential individuals and prioritize dating their crush
rule_active(people_aim_to_strengthen_connections_with_influential_individuals_and_prioritize_dating_their_crush).
rule_category(people_aim_to_strengthen_connections_with_influential_individuals_and_prioritize_dating_their_crush, dominance_power).
rule_source(people_aim_to_strengthen_connections_with_influential_individuals_and_prioritize_dating_their_crush, ensemble).
rule_priority(people_aim_to_strengthen_connections_with_influential_individuals_and_prioritize_dating_their_crush, 3).
rule_applies(people_aim_to_strengthen_connections_with_influential_individuals_and_prioritize_dating_their_crush, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, mean).
rule_effect(people_aim_to_strengthen_connections_with_influential_individuals_and_prioritize_dating_their_crush, set_intent(X, honor, Y, -3)).

rule_likelihood(people_aim_to_strengthen_familial_ties_with_influential_individuals_and_prioritize_honoring, 1).
rule_type(people_aim_to_strengthen_familial_ties_with_influential_individuals_and_prioritize_honoring, volition).
% People aim to strengthen familial ties with influential individuals and prioritize honoring
rule_active(people_aim_to_strengthen_familial_ties_with_influential_individuals_and_prioritize_honoring).
rule_category(people_aim_to_strengthen_familial_ties_with_influential_individuals_and_prioritize_honoring, dominance_power).
rule_source(people_aim_to_strengthen_familial_ties_with_influential_individuals_and_prioritize_honoring, ensemble).
rule_priority(people_aim_to_strengthen_familial_ties_with_influential_individuals_and_prioritize_honoring, 1).
rule_applies(people_aim_to_strengthen_familial_ties_with_influential_individuals_and_prioritize_honoring, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, mean).
rule_effect(people_aim_to_strengthen_familial_ties_with_influential_individuals_and_prioritize_honoring, set_intent(X, honor, Y, -2)).

rule_likelihood(people_seek_to_ingratiate_themselves_with_influential_individuals_through_public_friendships, 1).
rule_type(people_seek_to_ingratiate_themselves_with_influential_individuals_through_public_friendships, volition).
% People seek to ingratiate themselves with influential individuals through public friendships.
rule_active(people_seek_to_ingratiate_themselves_with_influential_individuals_through_public_friendships).
rule_category(people_seek_to_ingratiate_themselves_with_influential_individuals_through_public_friendships, dominance_power).
rule_source(people_seek_to_ingratiate_themselves_with_influential_individuals_through_public_friendships, ensemble).
rule_priority(people_seek_to_ingratiate_themselves_with_influential_individuals_through_public_friendships, 1).
rule_applies(people_seek_to_ingratiate_themselves_with_influential_individuals_through_public_friendships, X, Y) :-
    directed_status(X, Y, public_friends).
rule_effect(people_seek_to_ingratiate_themselves_with_influential_individuals_through_public_friendships, set_intent(X, ingratiate, Y, 1)).

rule_likelihood(people_seek_to_ingratiate_themselves_with_influential_individuals, 1).
rule_type(people_seek_to_ingratiate_themselves_with_influential_individuals, volition).
% People seek to ingratiate themselves with influential individuals.
rule_active(people_seek_to_ingratiate_themselves_with_influential_individuals).
rule_category(people_seek_to_ingratiate_themselves_with_influential_individuals, dominance_power).
rule_source(people_seek_to_ingratiate_themselves_with_influential_individuals, ensemble).
rule_priority(people_seek_to_ingratiate_themselves_with_influential_individuals, 1).
rule_applies(people_seek_to_ingratiate_themselves_with_influential_individuals, X, Y) :-
    status(X, successful).
rule_effect(people_seek_to_ingratiate_themselves_with_influential_individuals, set_intent(X, ingratiate, Y, -1)).

rule_likelihood(people_seek_to_ingratiate_themselves_with_influential_individuals, 1).
rule_type(people_seek_to_ingratiate_themselves_with_influential_individuals, volition).
% People seek to ingratiate themselves with influential individuals.
rule_active(people_seek_to_ingratiate_themselves_with_influential_individuals).
rule_category(people_seek_to_ingratiate_themselves_with_influential_individuals, dominance_power).
rule_source(people_seek_to_ingratiate_themselves_with_influential_individuals, ensemble).
rule_priority(people_seek_to_ingratiate_themselves_with_influential_individuals, 1).
rule_applies(people_seek_to_ingratiate_themselves_with_influential_individuals, X, Y) :-
    event(X, mean).
rule_effect(people_seek_to_ingratiate_themselves_with_influential_individuals, set_intent(X, ingratiate, Y, -1)).

rule_likelihood(people_seek_companionship_with_influential_individuals, 1).
rule_type(people_seek_companionship_with_influential_individuals, volition).
% People seek companionship with influential individuals
rule_active(people_seek_companionship_with_influential_individuals).
rule_category(people_seek_companionship_with_influential_individuals, dominance_power).
rule_source(people_seek_companionship_with_influential_individuals, ensemble).
rule_priority(people_seek_companionship_with_influential_individuals, 1).
rule_applies(people_seek_companionship_with_influential_individuals, X, Y) :-
    directed_status(X, Y, public_friends).
rule_effect(people_seek_companionship_with_influential_individuals, set_intent(X, kind, Y, 2)).

rule_likelihood(people_desire_to_be_romantically_involved_with_influential_individuals, 1).
rule_type(people_desire_to_be_romantically_involved_with_influential_individuals, volition).
% People desire to be romantically involved with influential individuals.
rule_active(people_desire_to_be_romantically_involved_with_influential_individuals).
rule_category(people_desire_to_be_romantically_involved_with_influential_individuals, dominance_power).
rule_source(people_desire_to_be_romantically_involved_with_influential_individuals, ensemble).
rule_priority(people_desire_to_be_romantically_involved_with_influential_individuals, 1).
rule_applies(people_desire_to_be_romantically_involved_with_influential_individuals, X, Y) :-
    directed_status(X, Y, publicly_romantically_committed_to).
rule_effect(people_desire_to_be_romantically_involved_with_influential_individuals, set_intent(X, kind, Y, 2)).

rule_likelihood(people_seek_connections_with_influential_individuals_within_their_extended_network, 1).
rule_type(people_seek_connections_with_influential_individuals_within_their_extended_network, volition).
% People seek connections with influential individuals within their extended network.
rule_active(people_seek_connections_with_influential_individuals_within_their_extended_network).
rule_category(people_seek_connections_with_influential_individuals_within_their_extended_network, dominance_power).
rule_source(people_seek_connections_with_influential_individuals_within_their_extended_network, ensemble).
rule_priority(people_seek_connections_with_influential_individuals_within_their_extended_network, 1).
rule_applies(people_seek_connections_with_influential_individuals_within_their_extended_network, X, Y) :-
    network(X, Y, familial, Familial_val), Familial_val > 6.
rule_effect(people_seek_connections_with_influential_individuals_within_their_extended_network, set_intent(X, kind, Y, 2)).

rule_likelihood(people_seek_closer_connections_with_influential_individuals_in_their_network, 1).
rule_type(people_seek_closer_connections_with_influential_individuals_in_their_network, volition).
% People seek closer connections with influential individuals in their network.
rule_active(people_seek_closer_connections_with_influential_individuals_in_their_network).
rule_category(people_seek_closer_connections_with_influential_individuals_in_their_network, dominance_power).
rule_source(people_seek_closer_connections_with_influential_individuals_in_their_network, ensemble).
rule_priority(people_seek_closer_connections_with_influential_individuals_in_their_network, 5).
rule_applies(people_seek_closer_connections_with_influential_individuals_in_their_network, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val < 4.
rule_effect(people_seek_closer_connections_with_influential_individuals_in_their_network, set_intent(X, kind, Y, -5)).

rule_likelihood(people_seek_closer_connections_with_influential_individuals_in_their_network, 1).
rule_type(people_seek_closer_connections_with_influential_individuals_in_their_network, volition).
% People seek closer connections with influential individuals in their network.
rule_active(people_seek_closer_connections_with_influential_individuals_in_their_network).
rule_category(people_seek_closer_connections_with_influential_individuals_in_their_network, dominance_power).
rule_source(people_seek_closer_connections_with_influential_individuals_in_their_network, ensemble).
rule_priority(people_seek_closer_connections_with_influential_individuals_in_their_network, 1).
rule_applies(people_seek_closer_connections_with_influential_individuals_in_their_network, X, Y) :-
    network(X, Y, familial, Familial_val), Familial_val < 4.
rule_effect(people_seek_closer_connections_with_influential_individuals_in_their_network, set_intent(X, kind, Y, -1)).

rule_likelihood(people_seek_respect_from_influential_individuals_in_their_network, 1).
rule_type(people_seek_respect_from_influential_individuals_in_their_network, volition).
% People seek respect from influential individuals in their network.
rule_active(people_seek_respect_from_influential_individuals_in_their_network).
rule_category(people_seek_respect_from_influential_individuals_in_their_network, dominance_power).
rule_source(people_seek_respect_from_influential_individuals_in_their_network, ensemble).
rule_priority(people_seek_respect_from_influential_individuals_in_their_network, 1).
rule_applies(people_seek_respect_from_influential_individuals_in_their_network, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val < 4.
rule_effect(people_seek_respect_from_influential_individuals_in_their_network, set_intent(X, kind, Y, -1)).

rule_likelihood(people_seek_companionship_with_influential_individuals, 1).
rule_type(people_seek_companionship_with_influential_individuals, volition).
% People seek companionship with influential individuals.
rule_active(people_seek_companionship_with_influential_individuals).
rule_category(people_seek_companionship_with_influential_individuals, dominance_power).
rule_source(people_seek_companionship_with_influential_individuals, ensemble).
rule_priority(people_seek_companionship_with_influential_individuals, 1).
rule_applies(people_seek_companionship_with_influential_individuals, X, Y) :-
    trait(X, helpful).
rule_effect(people_seek_companionship_with_influential_individuals, set_intent(X, kind, Y, 2)).

rule_likelihood(people_seek_companionship_with_influential_individuals, 1).
rule_type(people_seek_companionship_with_influential_individuals, volition).
% People seek companionship with influential individuals.
rule_active(people_seek_companionship_with_influential_individuals).
rule_category(people_seek_companionship_with_influential_individuals, dominance_power).
rule_source(people_seek_companionship_with_influential_individuals, ensemble).
rule_priority(people_seek_companionship_with_influential_individuals, 3).
rule_applies(people_seek_companionship_with_influential_individuals, X, Y) :-
    event(X, did_a_favor_for).
rule_effect(people_seek_companionship_with_influential_individuals, set_intent(X, kind, Y, 3)).

rule_likelihood(people_desire_to_associate_with_influential_individuals_and_develop_romantic_interests_in_their_crushes, 1).
rule_type(people_desire_to_associate_with_influential_individuals_and_develop_romantic_interests_in_their_crushes, volition).
% People desire to associate with influential individuals and develop romantic interests in their crushes.
rule_active(people_desire_to_associate_with_influential_individuals_and_develop_romantic_interests_in_their_crushes).
rule_category(people_desire_to_associate_with_influential_individuals_and_develop_romantic_interests_in_their_crushes, dominance_power).
rule_source(people_desire_to_associate_with_influential_individuals_and_develop_romantic_interests_in_their_crushes, ensemble).
rule_priority(people_desire_to_associate_with_influential_individuals_and_develop_romantic_interests_in_their_crushes, 1).
rule_applies(people_desire_to_associate_with_influential_individuals_and_develop_romantic_interests_in_their_crushes, X, Y) :-
    event(X, nice).
rule_effect(people_desire_to_associate_with_influential_individuals_and_develop_romantic_interests_in_their_crushes, set_intent(X, kind, Y, 2)).

rule_likelihood(people_desire_to_befriend_or_associate_with_influential_individuals, 1).
rule_type(people_desire_to_befriend_or_associate_with_influential_individuals, volition).
% People desire to befriend or associate with influential individuals.
rule_active(people_desire_to_befriend_or_associate_with_influential_individuals).
rule_category(people_desire_to_befriend_or_associate_with_influential_individuals, dominance_power).
rule_source(people_desire_to_befriend_or_associate_with_influential_individuals, ensemble).
rule_priority(people_desire_to_befriend_or_associate_with_influential_individuals, 1).
rule_applies(people_desire_to_befriend_or_associate_with_influential_individuals, X, Y) :-
    event(X, mean).
rule_effect(people_desire_to_befriend_or_associate_with_influential_individuals, set_intent(X, kind, Y, -2)).

rule_likelihood(people_are_inclined_to_seek_companionship_with_influential_individuals, 1).
rule_type(people_are_inclined_to_seek_companionship_with_influential_individuals, volition).
% People are inclined to seek companionship with influential individuals.
rule_active(people_are_inclined_to_seek_companionship_with_influential_individuals).
rule_category(people_are_inclined_to_seek_companionship_with_influential_individuals, dominance_power).
rule_source(people_are_inclined_to_seek_companionship_with_influential_individuals, ensemble).
rule_priority(people_are_inclined_to_seek_companionship_with_influential_individuals, 1).
rule_applies(people_are_inclined_to_seek_companionship_with_influential_individuals, X, Y) :-
    event(X, did_a_favor_for).
rule_effect(people_are_inclined_to_seek_companionship_with_influential_individuals, set_intent(X, kind, Y, 2)).

rule_likelihood(people_seek_companionship_with_influential_individuals, 1).
rule_type(people_seek_companionship_with_influential_individuals, volition).
% People seek companionship with influential individuals.
rule_active(people_seek_companionship_with_influential_individuals).
rule_category(people_seek_companionship_with_influential_individuals, dominance_power).
rule_source(people_seek_companionship_with_influential_individuals, ensemble).
rule_priority(people_seek_companionship_with_influential_individuals, 1).
rule_applies(people_seek_companionship_with_influential_individuals, X, Y) :-
    event(X, mean).
rule_effect(people_seek_companionship_with_influential_individuals, set_intent(X, kind, Y, -1)).

rule_likelihood(people_seek_companionship_with_influential_individuals, 1).
rule_type(people_seek_companionship_with_influential_individuals, volition).
% People seek companionship with influential individuals.
rule_active(people_seek_companionship_with_influential_individuals).
rule_category(people_seek_companionship_with_influential_individuals, dominance_power).
rule_source(people_seek_companionship_with_influential_individuals, ensemble).
rule_priority(people_seek_companionship_with_influential_individuals, 1).
rule_applies(people_seek_companionship_with_influential_individuals, X, Y) :-
    event(X, did_a_favor_for).
rule_effect(people_seek_companionship_with_influential_individuals, set_intent(X, kind, Y, 1)).

rule_likelihood(people_seek_to_form_friendships_with_influential_individuals_and_have_recently_experienced_positive_social_interactions, 1).
rule_type(people_seek_to_form_friendships_with_influential_individuals_and_have_recently_experienced_positive_social_interactions, volition).
% People seek to form friendships with influential individuals and have recently experienced positive social interactions.
rule_active(people_seek_to_form_friendships_with_influential_individuals_and_have_recently_experienced_positive_social_interactions).
rule_category(people_seek_to_form_friendships_with_influential_individuals_and_have_recently_experienced_positive_social_interactions, dominance_power).
rule_source(people_seek_to_form_friendships_with_influential_individuals_and_have_recently_experienced_positive_social_interactions, ensemble).
rule_priority(people_seek_to_form_friendships_with_influential_individuals_and_have_recently_experienced_positive_social_interactions, 1).
rule_applies(people_seek_to_form_friendships_with_influential_individuals_and_have_recently_experienced_positive_social_interactions, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, nice).
rule_effect(people_seek_to_form_friendships_with_influential_individuals_and_have_recently_experienced_positive_social_interactions, set_intent(X, kind, Y, 2)).

rule_likelihood(people_tend_to_seek_closer_friendships_with_influential_individuals_and_have_a_recent_interest_in_dating, 1).
rule_type(people_tend_to_seek_closer_friendships_with_influential_individuals_and_have_a_recent_interest_in_dating, volition).
% People tend to seek closer friendships with influential individuals and have a recent interest in dating
rule_active(people_tend_to_seek_closer_friendships_with_influential_individuals_and_have_a_recent_interest_in_dating).
rule_category(people_tend_to_seek_closer_friendships_with_influential_individuals_and_have_a_recent_interest_in_dating, dominance_power).
rule_source(people_tend_to_seek_closer_friendships_with_influential_individuals_and_have_a_recent_interest_in_dating, ensemble).
rule_priority(people_tend_to_seek_closer_friendships_with_influential_individuals_and_have_a_recent_interest_in_dating, 3).
rule_applies(people_tend_to_seek_closer_friendships_with_influential_individuals_and_have_a_recent_interest_in_dating, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, mean).
rule_effect(people_tend_to_seek_closer_friendships_with_influential_individuals_and_have_a_recent_interest_in_dating, set_intent(X, kind, Y, -3)).

rule_likelihood(people_seek_to_strengthen_connections_with_influential_individuals_and_prioritize_recent_interactions_over_older_ones, 1).
rule_type(people_seek_to_strengthen_connections_with_influential_individuals_and_prioritize_recent_interactions_over_older_ones, volition).
% People seek to strengthen connections with influential individuals and prioritize recent interactions over older ones
rule_active(people_seek_to_strengthen_connections_with_influential_individuals_and_prioritize_recent_interactions_over_older_ones).
rule_category(people_seek_to_strengthen_connections_with_influential_individuals_and_prioritize_recent_interactions_over_older_ones, dominance_power).
rule_source(people_seek_to_strengthen_connections_with_influential_individuals_and_prioritize_recent_interactions_over_older_ones, ensemble).
rule_priority(people_seek_to_strengthen_connections_with_influential_individuals_and_prioritize_recent_interactions_over_older_ones, 1).
rule_applies(people_seek_to_strengthen_connections_with_influential_individuals_and_prioritize_recent_interactions_over_older_ones, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, mean).
rule_effect(people_seek_to_strengthen_connections_with_influential_individuals_and_prioritize_recent_interactions_over_older_ones, set_intent(X, kind, Y, -2)).

rule_likelihood(people_desire_to_form_closer_relationships_with_influential_individuals_when_they_have_a_strong_romantic_interest_in, 1).
rule_type(people_desire_to_form_closer_relationships_with_influential_individuals_when_they_have_a_strong_romantic_interest_in, volition).
% People desire to form closer relationships with influential individuals when they have a strong romantic interest in
rule_active(people_desire_to_form_closer_relationships_with_influential_individuals_when_they_have_a_strong_romantic_interest_in).
rule_category(people_desire_to_form_closer_relationships_with_influential_individuals_when_they_have_a_strong_romantic_interest_in, dominance_power).
rule_source(people_desire_to_form_closer_relationships_with_influential_individuals_when_they_have_a_strong_romantic_interest_in, ensemble).
rule_priority(people_desire_to_form_closer_relationships_with_influential_individuals_when_they_have_a_strong_romantic_interest_in, 3).
rule_applies(people_desire_to_form_closer_relationships_with_influential_individuals_when_they_have_a_strong_romantic_interest_in, X, Y) :-
    network(X, 'z', romance, Romance_val), Romance_val > 6,
    event(Y, mean).
rule_effect(people_desire_to_form_closer_relationships_with_influential_individuals_when_they_have_a_strong_romantic_interest_in, set_intent(X, kind, Y, -3)).

rule_likelihood(people_seek_closer_connections_with_influential_individuals_and_have_a_strong_intent_to_date_their_crush_within, 1).
rule_type(people_seek_closer_connections_with_influential_individuals_and_have_a_strong_intent_to_date_their_crush_within, volition).
% People seek closer connections with influential individuals and have a strong intent to date their crush within
rule_active(people_seek_closer_connections_with_influential_individuals_and_have_a_strong_intent_to_date_their_crush_within).
rule_category(people_seek_closer_connections_with_influential_individuals_and_have_a_strong_intent_to_date_their_crush_within, dominance_power).
rule_source(people_seek_closer_connections_with_influential_individuals_and_have_a_strong_intent_to_date_their_crush_within, ensemble).
rule_priority(people_seek_closer_connections_with_influential_individuals_and_have_a_strong_intent_to_date_their_crush_within, 1).
rule_applies(people_seek_closer_connections_with_influential_individuals_and_have_a_strong_intent_to_date_their_crush_within, X, Y) :-
    network(X, 'z', romance, Romance_val), Romance_val > 6,
    event(Y, mean).
rule_effect(people_seek_closer_connections_with_influential_individuals_and_have_a_strong_intent_to_date_their_crush_within, set_intent(X, kind, Y, -2)).

rule_likelihood(people_seek_romantic_connections_with_influential_individuals_and_have_a_strong_interest_in_their_crush_within, 1).
rule_type(people_seek_romantic_connections_with_influential_individuals_and_have_a_strong_interest_in_their_crush_within, volition).
% People seek romantic connections with influential individuals and have a strong interest in their crush within
rule_active(people_seek_romantic_connections_with_influential_individuals_and_have_a_strong_interest_in_their_crush_within).
rule_category(people_seek_romantic_connections_with_influential_individuals_and_have_a_strong_interest_in_their_crush_within, dominance_power).
rule_source(people_seek_romantic_connections_with_influential_individuals_and_have_a_strong_interest_in_their_crush_within, ensemble).
rule_priority(people_seek_romantic_connections_with_influential_individuals_and_have_a_strong_interest_in_their_crush_within, 1).
rule_applies(people_seek_romantic_connections_with_influential_individuals_and_have_a_strong_interest_in_their_crush_within, X, Y) :-
    network(X, 'z', romance, Romance_val), Romance_val > 6,
    event(Y, mean).
rule_effect(people_seek_romantic_connections_with_influential_individuals_and_have_a_strong_interest_in_their_crush_within, set_intent(X, kind, Y, -1)).

rule_likelihood(people_desire_to_form_closer_bonds_with_influential_individuals_and_have_a_positive_intent_towards_dating, 1).
rule_type(people_desire_to_form_closer_bonds_with_influential_individuals_and_have_a_positive_intent_towards_dating, volition).
% People desire to form closer bonds with influential individuals and have a positive intent towards dating
rule_active(people_desire_to_form_closer_bonds_with_influential_individuals_and_have_a_positive_intent_towards_dating).
rule_category(people_desire_to_form_closer_bonds_with_influential_individuals_and_have_a_positive_intent_towards_dating, dominance_power).
rule_source(people_desire_to_form_closer_bonds_with_influential_individuals_and_have_a_positive_intent_towards_dating, ensemble).
rule_priority(people_desire_to_form_closer_bonds_with_influential_individuals_and_have_a_positive_intent_towards_dating, 1).
rule_applies(people_desire_to_form_closer_bonds_with_influential_individuals_and_have_a_positive_intent_towards_dating, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, nice).
rule_effect(people_desire_to_form_closer_bonds_with_influential_individuals_and_have_a_positive_intent_towards_dating, set_intent(X, kind, Y, 1)).

rule_likelihood(people_seek_closer_connections_with_influential_individuals_when_they_have_had_frequent_interactions_within_the_past_week, 1).
rule_type(people_seek_closer_connections_with_influential_individuals_when_they_have_had_frequent_interactions_within_the_past_week, volition).
% People seek closer connections with influential individuals when they have had frequent interactions within the past week.
rule_active(people_seek_closer_connections_with_influential_individuals_when_they_have_had_frequent_interactions_within_the_past_week).
rule_category(people_seek_closer_connections_with_influential_individuals_when_they_have_had_frequent_interactions_within_the_past_week, dominance_power).
rule_source(people_seek_closer_connections_with_influential_individuals_when_they_have_had_frequent_interactions_within_the_past_week, ensemble).
rule_priority(people_seek_closer_connections_with_influential_individuals_when_they_have_had_frequent_interactions_within_the_past_week, 3).
rule_applies(people_seek_closer_connections_with_influential_individuals_when_they_have_had_frequent_interactions_within_the_past_week, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, mean).
rule_effect(people_seek_closer_connections_with_influential_individuals_when_they_have_had_frequent_interactions_within_the_past_week, set_intent(X, kind, Y, -3)).

rule_likelihood(people_desire_to_connect_with_influential_individuals_and_have_a_strong_interest_in_their_crush_within_the, 1).
rule_type(people_desire_to_connect_with_influential_individuals_and_have_a_strong_interest_in_their_crush_within_the, volition).
% People desire to connect with influential individuals and have a strong interest in their crush within the
rule_active(people_desire_to_connect_with_influential_individuals_and_have_a_strong_interest_in_their_crush_within_the).
rule_category(people_desire_to_connect_with_influential_individuals_and_have_a_strong_interest_in_their_crush_within_the, dominance_power).
rule_source(people_desire_to_connect_with_influential_individuals_and_have_a_strong_interest_in_their_crush_within_the, ensemble).
rule_priority(people_desire_to_connect_with_influential_individuals_and_have_a_strong_interest_in_their_crush_within_the, 1).
rule_applies(people_desire_to_connect_with_influential_individuals_and_have_a_strong_interest_in_their_crush_within_the, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, mean).
rule_effect(people_desire_to_connect_with_influential_individuals_and_have_a_strong_interest_in_their_crush_within_the, set_intent(X, kind, Y, -2)).

rule_likelihood(people_seek_to_form_closer_bonds_with_influential_individuals_within_a_year_of_noticing_their_cr, 1).
rule_type(people_seek_to_form_closer_bonds_with_influential_individuals_within_a_year_of_noticing_their_cr, volition).
% People seek to form closer bonds with influential individuals within a year of noticing their cr
rule_active(people_seek_to_form_closer_bonds_with_influential_individuals_within_a_year_of_noticing_their_cr).
rule_category(people_seek_to_form_closer_bonds_with_influential_individuals_within_a_year_of_noticing_their_cr, dominance_power).
rule_source(people_seek_to_form_closer_bonds_with_influential_individuals_within_a_year_of_noticing_their_cr, ensemble).
rule_priority(people_seek_to_form_closer_bonds_with_influential_individuals_within_a_year_of_noticing_their_cr, 1).
rule_applies(people_seek_to_form_closer_bonds_with_influential_individuals_within_a_year_of_noticing_their_cr, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, mean).
rule_effect(people_seek_to_form_closer_bonds_with_influential_individuals_within_a_year_of_noticing_their_cr, set_intent(X, kind, Y, -1)).

rule_likelihood(people_attempt_to_influence_others_by_associating_with_influential_individuals, 1).
rule_type(people_attempt_to_influence_others_by_associating_with_influential_individuals, volition).
% People attempt to influence others by associating with influential individuals.
rule_active(people_attempt_to_influence_others_by_associating_with_influential_individuals).
rule_category(people_attempt_to_influence_others_by_associating_with_influential_individuals, dominance_power).
rule_source(people_attempt_to_influence_others_by_associating_with_influential_individuals, ensemble).
rule_priority(people_attempt_to_influence_others_by_associating_with_influential_individuals, 1).
rule_applies(people_attempt_to_influence_others_by_associating_with_influential_individuals, X, Y) :-
    directed_status(X, Y, feuding).
rule_effect(people_attempt_to_influence_others_by_associating_with_influential_individuals, set_intent(X, manipulate, Y, 2)).

rule_likelihood(people_desire_to_be_in_closer_proximity_with_influential_individuals_than_their_current_connections, 1).
rule_type(people_desire_to_be_in_closer_proximity_with_influential_individuals_than_their_current_connections, volition).
% People desire to be in closer proximity with influential individuals than their current connections.
rule_active(people_desire_to_be_in_closer_proximity_with_influential_individuals_than_their_current_connections).
rule_category(people_desire_to_be_in_closer_proximity_with_influential_individuals_than_their_current_connections, dominance_power).
rule_source(people_desire_to_be_in_closer_proximity_with_influential_individuals_than_their_current_connections, ensemble).
rule_priority(people_desire_to_be_in_closer_proximity_with_influential_individuals_than_their_current_connections, 5).
rule_applies(people_desire_to_be_in_closer_proximity_with_influential_individuals_than_their_current_connections, X, Y) :-
    network(X, Y, romance, Romance_val), Romance_val < 4.
rule_effect(people_desire_to_be_in_closer_proximity_with_influential_individuals_than_their_current_connections, set_intent(X, romance, Y, -5)).

rule_likelihood(people_desire_to_form_romantic_connections_with_influential_individuals, 1).
rule_type(people_desire_to_form_romantic_connections_with_influential_individuals, volition).
% People desire to form romantic connections with influential individuals.
rule_active(people_desire_to_form_romantic_connections_with_influential_individuals).
rule_category(people_desire_to_form_romantic_connections_with_influential_individuals, dominance_power).
rule_source(people_desire_to_form_romantic_connections_with_influential_individuals, ensemble).
rule_priority(people_desire_to_form_romantic_connections_with_influential_individuals, 3).
rule_applies(people_desire_to_form_romantic_connections_with_influential_individuals, X, Y) :-
    event(X, mean).
rule_effect(people_desire_to_form_romantic_connections_with_influential_individuals, set_intent(X, romance, Y, -3)).

rule_likelihood(people_seeking_to_deepen_connections_with_influential_individuals_and_having_a_strong_romantic_interest_in_their, 1).
rule_type(people_seeking_to_deepen_connections_with_influential_individuals_and_having_a_strong_romantic_interest_in_their, volition).
% People seeking to deepen connections with influential individuals and having a strong romantic interest in their
rule_active(people_seeking_to_deepen_connections_with_influential_individuals_and_having_a_strong_romantic_interest_in_their).
rule_category(people_seeking_to_deepen_connections_with_influential_individuals_and_having_a_strong_romantic_interest_in_their, dominance_power).
rule_source(people_seeking_to_deepen_connections_with_influential_individuals_and_having_a_strong_romantic_interest_in_their, ensemble).
rule_priority(people_seeking_to_deepen_connections_with_influential_individuals_and_having_a_strong_romantic_interest_in_their, 1).
rule_applies(people_seeking_to_deepen_connections_with_influential_individuals_and_having_a_strong_romantic_interest_in_their, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, mean).
rule_effect(people_seeking_to_deepen_connections_with_influential_individuals_and_having_a_strong_romantic_interest_in_their, set_intent(X, romance, Y, -2)).

rule_likelihood(people_seek_closer_connections_with_influential_individuals_to_increase_trust_levels_in_their_relationships, 1).
rule_type(people_seek_closer_connections_with_influential_individuals_to_increase_trust_levels_in_their_relationships, volition).
% People seek closer connections with influential individuals to increase trust levels in their relationships.
rule_active(people_seek_closer_connections_with_influential_individuals_to_increase_trust_levels_in_their_relationships).
rule_category(people_seek_closer_connections_with_influential_individuals_to_increase_trust_levels_in_their_relationships, dominance_power).
rule_source(people_seek_closer_connections_with_influential_individuals_to_increase_trust_levels_in_their_relationships, ensemble).
rule_priority(people_seek_closer_connections_with_influential_individuals_to_increase_trust_levels_in_their_relationships, 3).
rule_applies(people_seek_closer_connections_with_influential_individuals_to_increase_trust_levels_in_their_relationships, X, Y) :-
    network(X, Y, romance, Romance_val), Romance_val > 6.
rule_effect(people_seek_closer_connections_with_influential_individuals_to_increase_trust_levels_in_their_relationships, set_intent(X, trust, Y, 3)).

rule_likelihood(people_desire_to_strengthen_their_connections_with_influential_individuals_and_seek_trust_in_those_relationships, 1).
rule_type(people_desire_to_strengthen_their_connections_with_influential_individuals_and_seek_trust_in_those_relationships, volition).
% People desire to strengthen their connections with influential individuals and seek trust in those relationships.
rule_active(people_desire_to_strengthen_their_connections_with_influential_individuals_and_seek_trust_in_those_relationships).
rule_category(people_desire_to_strengthen_their_connections_with_influential_individuals_and_seek_trust_in_those_relationships, dominance_power).
rule_source(people_desire_to_strengthen_their_connections_with_influential_individuals_and_seek_trust_in_those_relationships, ensemble).
rule_priority(people_desire_to_strengthen_their_connections_with_influential_individuals_and_seek_trust_in_those_relationships, 3).
rule_applies(people_desire_to_strengthen_their_connections_with_influential_individuals_and_seek_trust_in_those_relationships, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    network(Y, 'z', friendship, Friendship_val), Friendship_val > 6.
rule_effect(people_desire_to_strengthen_their_connections_with_influential_individuals_and_seek_trust_in_those_relationships, set_intent(X, trust, Y, 3)).

rule_likelihood(people_s_desire_to_strengthen_friendships_with_influential_individuals_and_recent_positive_interactions_within_the, 1).
rule_type(people_s_desire_to_strengthen_friendships_with_influential_individuals_and_recent_positive_interactions_within_the, volition).
% People’s desire to strengthen friendships with influential individuals and recent positive interactions within the
rule_active(people_s_desire_to_strengthen_friendships_with_influential_individuals_and_recent_positive_interactions_within_the).
rule_category(people_s_desire_to_strengthen_friendships_with_influential_individuals_and_recent_positive_interactions_within_the, dominance_power).
rule_source(people_s_desire_to_strengthen_friendships_with_influential_individuals_and_recent_positive_interactions_within_the, ensemble).
rule_priority(people_s_desire_to_strengthen_friendships_with_influential_individuals_and_recent_positive_interactions_within_the, 1).
rule_applies(people_s_desire_to_strengthen_friendships_with_influential_individuals_and_recent_positive_interactions_within_the, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, mean).
rule_effect(people_s_desire_to_strengthen_friendships_with_influential_individuals_and_recent_positive_interactions_within_the, set_intent(X, trust, Y, -2)).

%% ═══════════════════════════════════════════════════════════
%% Category: emotional-states
%% ═══════════════════════════════════════════════════════════

%% Ensemble Volition Rules: emotional-states
%% Source: data/ensemble/volitionRules/emotional-states.json
%% Converted: 2026-04-02T20:09:49.731Z
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

%% ═══════════════════════════════════════════════════════════
%% Category: emulation-imitation
%% ═══════════════════════════════════════════════════════════

%% Ensemble Volition Rules: emulation-imitation
%% Source: data/ensemble/volitionRules/emulation-imitation.json
%% Converted: 2026-04-02T20:09:49.732Z
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

%% ═══════════════════════════════════════════════════════════
%% Category: familiarity-strangers
%% ═══════════════════════════════════════════════════════════

%% Ensemble Volition Rules: familiarity-strangers
%% Source: data/ensemble/volitionRules/familiarity-strangers.json
%% Converted: 2026-04-02T20:09:49.732Z
%% Total rules: 1

rule_likelihood(unfamiliar_beautiful_women_may_attract_attention_from_others, 1).
rule_type(unfamiliar_beautiful_women_may_attract_attention_from_others, volition).
% Unfamiliar beautiful women may attract attention from others
rule_active(unfamiliar_beautiful_women_may_attract_attention_from_others).
rule_category(unfamiliar_beautiful_women_may_attract_attention_from_others, familiarity_strangers).
rule_source(unfamiliar_beautiful_women_may_attract_attention_from_others, ensemble).
rule_priority(unfamiliar_beautiful_women_may_attract_attention_from_others, 3).
rule_applies(unfamiliar_beautiful_women_may_attract_attention_from_others, X, Y) :-
    trait(X, female),
    trait(X, beautiful),
    \+ trait(X, well_known).
rule_effect(unfamiliar_beautiful_women_may_attract_attention_from_others, modify_network(X, Y, curiosity, '+', 3)).
rule_effect(unfamiliar_beautiful_women_may_attract_attention_from_others, modify_network(Y, X, curiosity, '+', 3)).

%% ═══════════════════════════════════════════════════════════
%% Category: favors-obligations
%% ═══════════════════════════════════════════════════════════

%% Ensemble Volition Rules: favors-obligations
%% Source: data/ensemble/volitionRules/favors-obligations.json
%% Converted: 2026-04-02T20:09:49.732Z
%% Total rules: 60

rule_likelihood(powerful_indifferent_rich_people_draw_attention_to_themselves, 1).
rule_type(powerful_indifferent_rich_people_draw_attention_to_themselves, volition).
% Powerful, indifferent, rich people draw attention to themselves
rule_active(powerful_indifferent_rich_people_draw_attention_to_themselves).
rule_category(powerful_indifferent_rich_people_draw_attention_to_themselves, favors_obligations).
rule_source(powerful_indifferent_rich_people_draw_attention_to_themselves, ensemble).
rule_priority(powerful_indifferent_rich_people_draw_attention_to_themselves, 5).
rule_applies(powerful_indifferent_rich_people_draw_attention_to_themselves, X, Y) :-
    trait(X, rich),
    trait(X, indifferent),
    attribute(X, self_assuredness, Self_assuredness_val), Self_assuredness_val > 70,
    trait(Y, attendee),
    attribute(Y, social_standing, Social_standing_val), Social_standing_val < 60,
    attribute(X, social_standing, Social_standing_val), Social_standing_val > 85.
rule_effect(powerful_indifferent_rich_people_draw_attention_to_themselves, modify_network(Y, X, curiosity, '+', 5)).

rule_likelihood(someone_who_is_grateful_could_do_everything_for_the_one_he_owes_a_favor_to, 1).
rule_type(someone_who_is_grateful_could_do_everything_for_the_one_he_owes_a_favor_to, volition).
% Someone who is grateful could do everything for the one he owes a favor to
rule_active(someone_who_is_grateful_could_do_everything_for_the_one_he_owes_a_favor_to).
rule_category(someone_who_is_grateful_could_do_everything_for_the_one_he_owes_a_favor_to, favors_obligations).
rule_source(someone_who_is_grateful_could_do_everything_for_the_one_he_owes_a_favor_to, ensemble).
rule_priority(someone_who_is_grateful_could_do_everything_for_the_one_he_owes_a_favor_to, 3).
rule_applies(someone_who_is_grateful_could_do_everything_for_the_one_he_owes_a_favor_to, X, Y) :-
    status(X, grateful),
    directed_status(X, Y, owes_a_favor_to),
    trait(X, provincial),
    relationship(X, Y, friends).
rule_effect(someone_who_is_grateful_could_do_everything_for_the_one_he_owes_a_favor_to, set_relationship(X, Y, esteem, 3)).
rule_effect(someone_who_is_grateful_could_do_everything_for_the_one_he_owes_a_favor_to, modify_network(X, Y, affinity, '+', 3)).

rule_likelihood(someone_who_is_grateful_could_do_everything_for_the_one_he_owes_a_favor_to, 1).
rule_type(someone_who_is_grateful_could_do_everything_for_the_one_he_owes_a_favor_to, volition).
% Someone who is grateful could do everything for the one he owes a favor to
rule_active(someone_who_is_grateful_could_do_everything_for_the_one_he_owes_a_favor_to).
rule_category(someone_who_is_grateful_could_do_everything_for_the_one_he_owes_a_favor_to, favors_obligations).
rule_source(someone_who_is_grateful_could_do_everything_for_the_one_he_owes_a_favor_to, ensemble).
rule_priority(someone_who_is_grateful_could_do_everything_for_the_one_he_owes_a_favor_to, 3).
rule_applies(someone_who_is_grateful_could_do_everything_for_the_one_he_owes_a_favor_to, X, Y) :-
    status(X, grateful),
    directed_status(X, Y, owes_a_favor_to),
    trait(X, provincial),
    relationship(X, Y, friends).
rule_effect(someone_who_is_grateful_could_do_everything_for_the_one_he_owes_a_favor_to, set_relationship(X, Y, esteem, 3)).
rule_effect(someone_who_is_grateful_could_do_everything_for_the_one_he_owes_a_favor_to, modify_network(X, Y, affinity, '+', 3)).

rule_likelihood(a_person_may_want_to_befriend_a_powerful_person_s_lover, 1).
rule_type(a_person_may_want_to_befriend_a_powerful_person_s_lover, volition).
% A person may want to befriend a powerful person’s lover
rule_active(a_person_may_want_to_befriend_a_powerful_person_s_lover).
rule_category(a_person_may_want_to_befriend_a_powerful_person_s_lover, favors_obligations).
rule_source(a_person_may_want_to_befriend_a_powerful_person_s_lover, ensemble).
rule_priority(a_person_may_want_to_befriend_a_powerful_person_s_lover, 5).
rule_applies(a_person_may_want_to_befriend_a_powerful_person_s_lover, X, Y) :-
    relationship(Y, 'z', lovers),
    attribute(Y, social_standing, Social_standing_val), Social_standing_val > 80.
rule_effect(a_person_may_want_to_befriend_a_powerful_person_s_lover, set_relationship(X, 'z', ally, 5)).

rule_likelihood(a_happy_elegant_man_may_be_followed_by_other_young_men, 1).
rule_type(a_happy_elegant_man_may_be_followed_by_other_young_men, volition).
% A happy, elegant man may be followed by other young men
rule_active(a_happy_elegant_man_may_be_followed_by_other_young_men).
rule_category(a_happy_elegant_man_may_be_followed_by_other_young_men, favors_obligations).
rule_source(a_happy_elegant_man_may_be_followed_by_other_young_men, ensemble).
rule_priority(a_happy_elegant_man_may_be_followed_by_other_young_men, 5).
rule_applies(a_happy_elegant_man_may_be_followed_by_other_young_men, X, Y) :-
    trait(X, male),
    trait(Y, young),
    attribute(X, sophistication, Sophistication_val), Sophistication_val > 50,
    trait(X, elegantly_dressed),
    trait(Y, male),
    trait(Y, young).
rule_effect(a_happy_elegant_man_may_be_followed_by_other_young_men, modify_network(Y, X, affinity, '+', 5)).
rule_effect(a_happy_elegant_man_may_be_followed_by_other_young_men, modify_network(Y, X, curiosity, '+', 5)).
rule_effect(a_happy_elegant_man_may_be_followed_by_other_young_men, set_relationship(Y, X, ally, 5)).

rule_likelihood(some_lower_class_urbanites_may_be_nosy_and_unsophisticated, 1).
rule_type(some_lower_class_urbanites_may_be_nosy_and_unsophisticated, volition).
% Some lower class urbanites may be nosy and unsophisticated
rule_active(some_lower_class_urbanites_may_be_nosy_and_unsophisticated).
rule_category(some_lower_class_urbanites_may_be_nosy_and_unsophisticated, favors_obligations).
rule_source(some_lower_class_urbanites_may_be_nosy_and_unsophisticated, ensemble).
rule_priority(some_lower_class_urbanites_may_be_nosy_and_unsophisticated, 5).
rule_applies(some_lower_class_urbanites_may_be_nosy_and_unsophisticated, X, Y) :-
    \+ trait(X, provincial),
    attribute(X, nosiness, Nosiness_val), Nosiness_val > 50,
    attribute(X, sophistication, Sophistication_val), Sophistication_val < 40,
    attribute(X, propriety, Propriety_val), Propriety_val < 40,
    \+ trait(X, rich).
rule_effect(some_lower_class_urbanites_may_be_nosy_and_unsophisticated, modify_network(Y, X, curiosity, '+', 5)).

rule_likelihood(people_of_high_social_standing_may_want_less_attention_from_inappropriately_behaved_people_of_lower_social_standing, 1).
rule_type(people_of_high_social_standing_may_want_less_attention_from_inappropriately_behaved_people_of_lower_social_standing, volition).
% People of high social standing may want less attention from inappropriately behaved people of lower social standing
rule_active(people_of_high_social_standing_may_want_less_attention_from_inappropriately_behaved_people_of_lower_social_standing).
rule_category(people_of_high_social_standing_may_want_less_attention_from_inappropriately_behaved_people_of_lower_social_standing, favors_obligations).
rule_source(people_of_high_social_standing_may_want_less_attention_from_inappropriately_behaved_people_of_lower_social_standing, ensemble).
rule_priority(people_of_high_social_standing_may_want_less_attention_from_inappropriately_behaved_people_of_lower_social_standing, 5).
rule_applies(people_of_high_social_standing_may_want_less_attention_from_inappropriately_behaved_people_of_lower_social_standing, X, Y) :-
    attribute(X, propriety, Propriety_val), Propriety_val < 50,
    network(X, Y, affinity, Affinity_val), Affinity_val > 60,
    attribute(X, social_standing, Social_standing_val), Social_standing_val < 50,
    attribute(Y, social_standing, Social_standing_val), Social_standing_val > 50.
rule_effect(people_of_high_social_standing_may_want_less_attention_from_inappropriately_behaved_people_of_lower_social_standing, modify_network(Y, X, curiosity, '-', 5)).

rule_likelihood(grateful_people_who_owe_a_favor_to_their_friend_may_want_to_please_that_friend, 1).
rule_type(grateful_people_who_owe_a_favor_to_their_friend_may_want_to_please_that_friend, volition).
% Grateful people who owe a favor to their friend may want to please that friend
rule_active(grateful_people_who_owe_a_favor_to_their_friend_may_want_to_please_that_friend).
rule_category(grateful_people_who_owe_a_favor_to_their_friend_may_want_to_please_that_friend, favors_obligations).
rule_source(grateful_people_who_owe_a_favor_to_their_friend_may_want_to_please_that_friend, ensemble).
rule_priority(grateful_people_who_owe_a_favor_to_their_friend_may_want_to_please_that_friend, 5).
rule_applies(grateful_people_who_owe_a_favor_to_their_friend_may_want_to_please_that_friend, X, Y) :-
    relationship(X, Y, friends),
    directed_status(X, Y, owes_a_favor_to),
    status(X, grateful).
rule_effect(grateful_people_who_owe_a_favor_to_their_friend_may_want_to_please_that_friend, modify_network(X, Y, affinity, '+', 5)).

rule_likelihood(honest_people_may_want_to_increase_their_credibility_with_those_they_are_indebted_to, 1).
rule_type(honest_people_may_want_to_increase_their_credibility_with_those_they_are_indebted_to, volition).
% Honest people may want to increase their credibility with those they are indebted to
rule_active(honest_people_may_want_to_increase_their_credibility_with_those_they_are_indebted_to).
rule_category(honest_people_may_want_to_increase_their_credibility_with_those_they_are_indebted_to, favors_obligations).
rule_source(honest_people_may_want_to_increase_their_credibility_with_those_they_are_indebted_to, ensemble).
rule_priority(honest_people_may_want_to_increase_their_credibility_with_those_they_are_indebted_to, 3).
rule_applies(honest_people_may_want_to_increase_their_credibility_with_those_they_are_indebted_to, X, Y) :-
    directed_status(X, Y, owes_a_favor_to),
    trait(X, honest).
rule_effect(honest_people_may_want_to_increase_their_credibility_with_those_they_are_indebted_to, modify_network(X, Y, credibility, '+', 3)).

rule_likelihood(lower_status_people_are_more_likely_to_be_helpful_if_they_were_treated_too_formally_by_an_outsider, 1).
rule_type(lower_status_people_are_more_likely_to_be_helpful_if_they_were_treated_too_formally_by_an_outsider, volition).
% Lower status people are more likely to be helpful if they were treated too formally by an outsider
rule_active(lower_status_people_are_more_likely_to_be_helpful_if_they_were_treated_too_formally_by_an_outsider).
rule_category(lower_status_people_are_more_likely_to_be_helpful_if_they_were_treated_too_formally_by_an_outsider, favors_obligations).
rule_source(lower_status_people_are_more_likely_to_be_helpful_if_they_were_treated_too_formally_by_an_outsider, ensemble).
rule_priority(lower_status_people_are_more_likely_to_be_helpful_if_they_were_treated_too_formally_by_an_outsider, 5).
rule_applies(lower_status_people_are_more_likely_to_be_helpful_if_they_were_treated_too_formally_by_an_outsider, X, Y) :-
    attribute(X, status_individual, Status_individual_val), Status_individual_val < 51,
    event(Y, formal),
    status(Y, outsider).
rule_effect(lower_status_people_are_more_likely_to_be_helpful_if_they_were_treated_too_formally_by_an_outsider, set_intent(X, help, Y, 5)).

rule_likelihood(lower_status_people_are_more_likely_to_be_helpful_when_you_were_positive_and_made_a_neutral_request, 1).
rule_type(lower_status_people_are_more_likely_to_be_helpful_when_you_were_positive_and_made_a_neutral_request, volition).
% Lower Status people are more likely to be helpful when you were positive and made a neutral request
rule_active(lower_status_people_are_more_likely_to_be_helpful_when_you_were_positive_and_made_a_neutral_request).
rule_category(lower_status_people_are_more_likely_to_be_helpful_when_you_were_positive_and_made_a_neutral_request, favors_obligations).
rule_source(lower_status_people_are_more_likely_to_be_helpful_when_you_were_positive_and_made_a_neutral_request, ensemble).
rule_priority(lower_status_people_are_more_likely_to_be_helpful_when_you_were_positive_and_made_a_neutral_request, 5).
rule_applies(lower_status_people_are_more_likely_to_be_helpful_when_you_were_positive_and_made_a_neutral_request, X, Y) :-
    event(X, positive),
    event(Y, neutral),
    attribute(X, status_individual, Status_individual_val), Status_individual_val < 51.
rule_effect(lower_status_people_are_more_likely_to_be_helpful_when_you_were_positive_and_made_a_neutral_request, set_intent(X, help, Y, 5)).

rule_likelihood(people_may_develop_negative_feelings_towards_those_they_ve_been_favored_by, 1).
rule_type(people_may_develop_negative_feelings_towards_those_they_ve_been_favored_by, volition).
% People may develop negative feelings towards those they’ve been favored by.
rule_active(people_may_develop_negative_feelings_towards_those_they_ve_been_favored_by).
rule_category(people_may_develop_negative_feelings_towards_those_they_ve_been_favored_by, favors_obligations).
rule_source(people_may_develop_negative_feelings_towards_those_they_ve_been_favored_by, ensemble).
rule_priority(people_may_develop_negative_feelings_towards_those_they_ve_been_favored_by, 3).
rule_applies(people_may_develop_negative_feelings_towards_those_they_ve_been_favored_by, X, Y) :-
    event(X, did_a_favor_for).
rule_effect(people_may_develop_negative_feelings_towards_those_they_ve_been_favored_by, set_intent(X, antagonize, Y, -3)).

rule_likelihood(people_may_develop_negative_feelings_towards_those_who_did_a_favor_for_them, 1).
rule_type(people_may_develop_negative_feelings_towards_those_who_did_a_favor_for_them, volition).
% People may develop negative feelings towards those who did a favor for them.
rule_active(people_may_develop_negative_feelings_towards_those_who_did_a_favor_for_them).
rule_category(people_may_develop_negative_feelings_towards_those_who_did_a_favor_for_them, favors_obligations).
rule_source(people_may_develop_negative_feelings_towards_those_who_did_a_favor_for_them, ensemble).
rule_priority(people_may_develop_negative_feelings_towards_those_who_did_a_favor_for_them, 1).
rule_applies(people_may_develop_negative_feelings_towards_those_who_did_a_favor_for_them, X, Y) :-
    event(X, did_a_favor_for).
rule_effect(people_may_develop_negative_feelings_towards_those_who_did_a_favor_for_them, set_intent(X, antagonize, Y, -1)).

rule_likelihood(people_may_develop_negative_feelings_towards_those_they_have_previously_favored, 1).
rule_type(people_may_develop_negative_feelings_towards_those_they_have_previously_favored, volition).
% People may develop negative feelings towards those they have previously favored.
rule_active(people_may_develop_negative_feelings_towards_those_they_have_previously_favored).
rule_category(people_may_develop_negative_feelings_towards_those_they_have_previously_favored, favors_obligations).
rule_source(people_may_develop_negative_feelings_towards_those_they_have_previously_favored, ensemble).
rule_priority(people_may_develop_negative_feelings_towards_those_they_have_previously_favored, 3).
rule_applies(people_may_develop_negative_feelings_towards_those_they_have_previously_favored, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, did_a_favor_for).
rule_effect(people_may_develop_negative_feelings_towards_those_they_have_previously_favored, set_intent(X, antagonize, Y, -3)).

rule_likelihood(people_favor_getting_closer_to_strong_individuals_in_their_social_circle, 1).
rule_type(people_favor_getting_closer_to_strong_individuals_in_their_social_circle, volition).
% People favor getting closer to strong individuals in their social circle.
rule_active(people_favor_getting_closer_to_strong_individuals_in_their_social_circle).
rule_category(people_favor_getting_closer_to_strong_individuals_in_their_social_circle, favors_obligations).
rule_source(people_favor_getting_closer_to_strong_individuals_in_their_social_circle, ensemble).
rule_priority(people_favor_getting_closer_to_strong_individuals_in_their_social_circle, 1).
rule_applies(people_favor_getting_closer_to_strong_individuals_in_their_social_circle, X, Y) :-
    directed_status(X, Y, public_friends).
rule_effect(people_favor_getting_closer_to_strong_individuals_in_their_social_circle, set_intent(X, favor, Y, 2)).

rule_likelihood(people_favor_strong_individuals_in_a_publicly_romantic_relationship_with_them, 1).
rule_type(people_favor_strong_individuals_in_a_publicly_romantic_relationship_with_them, volition).
% People favor strong individuals in a publicly romantic relationship with them.
rule_active(people_favor_strong_individuals_in_a_publicly_romantic_relationship_with_them).
rule_category(people_favor_strong_individuals_in_a_publicly_romantic_relationship_with_them, favors_obligations).
rule_source(people_favor_strong_individuals_in_a_publicly_romantic_relationship_with_them, ensemble).
rule_priority(people_favor_strong_individuals_in_a_publicly_romantic_relationship_with_them, 1).
rule_applies(people_favor_strong_individuals_in_a_publicly_romantic_relationship_with_them, X, Y) :-
    directed_status(X, Y, publicly_romantically_committed_to).
rule_effect(people_favor_strong_individuals_in_a_publicly_romantic_relationship_with_them, set_intent(X, favor, Y, 2)).

rule_likelihood(people_seek_favor_from_their_superiors, 1).
rule_type(people_seek_favor_from_their_superiors, volition).
% People seek favor from their superiors.
rule_active(people_seek_favor_from_their_superiors).
rule_category(people_seek_favor_from_their_superiors, favors_obligations).
rule_source(people_seek_favor_from_their_superiors, ensemble).
rule_priority(people_seek_favor_from_their_superiors, 1).
rule_applies(people_seek_favor_from_their_superiors, X, Y) :-
    directed_status(X, Y, is_boss_of).
rule_effect(people_seek_favor_from_their_superiors, set_intent(X, favor, Y, 1)).

rule_likelihood(people_idolize_strong_individuals_and_develop_a_favorable_intent_towards_them, 1).
rule_type(people_idolize_strong_individuals_and_develop_a_favorable_intent_towards_them, volition).
% People idolize strong individuals and develop a favorable intent towards them.
rule_active(people_idolize_strong_individuals_and_develop_a_favorable_intent_towards_them).
rule_category(people_idolize_strong_individuals_and_develop_a_favorable_intent_towards_them, favors_obligations).
rule_source(people_idolize_strong_individuals_and_develop_a_favorable_intent_towards_them, ensemble).
rule_priority(people_idolize_strong_individuals_and_develop_a_favorable_intent_towards_them, 1).
rule_applies(people_idolize_strong_individuals_and_develop_a_favorable_intent_towards_them, X, Y) :-
    directed_status(X, Y, idolize).
rule_effect(people_idolize_strong_individuals_and_develop_a_favorable_intent_towards_them, set_intent(X, favor, Y, 2)).

rule_likelihood(people_have_a_strong_respect_for_individuals_with_high_social_influence_and_are_inclined_to_develop_favorable, 1).
rule_type(people_have_a_strong_respect_for_individuals_with_high_social_influence_and_are_inclined_to_develop_favorable, volition).
% People have a strong respect for individuals with high social influence and are inclined to develop favorable
rule_active(people_have_a_strong_respect_for_individuals_with_high_social_influence_and_are_inclined_to_develop_favorable).
rule_category(people_have_a_strong_respect_for_individuals_with_high_social_influence_and_are_inclined_to_develop_favorable, favors_obligations).
rule_source(people_have_a_strong_respect_for_individuals_with_high_social_influence_and_are_inclined_to_develop_favorable, ensemble).
rule_priority(people_have_a_strong_respect_for_individuals_with_high_social_influence_and_are_inclined_to_develop_favorable, 1).
rule_applies(people_have_a_strong_respect_for_individuals_with_high_social_influence_and_are_inclined_to_develop_favorable, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val > 6.
rule_effect(people_have_a_strong_respect_for_individuals_with_high_social_influence_and_are_inclined_to_develop_favorable, set_intent(X, favor, Y, 2)).

rule_likelihood(people_have_a_favorable_intent_towards_stronger_individuals_when_their_indebtedness_level_exceeds_that, 1).
rule_type(people_have_a_favorable_intent_towards_stronger_individuals_when_their_indebtedness_level_exceeds_that, volition).
% People have a favorable intent towards stronger individuals when their indebtedness level exceeds that
rule_active(people_have_a_favorable_intent_towards_stronger_individuals_when_their_indebtedness_level_exceeds_that).
rule_category(people_have_a_favorable_intent_towards_stronger_individuals_when_their_indebtedness_level_exceeds_that, favors_obligations).
rule_source(people_have_a_favorable_intent_towards_stronger_individuals_when_their_indebtedness_level_exceeds_that, ensemble).
rule_priority(people_have_a_favorable_intent_towards_stronger_individuals_when_their_indebtedness_level_exceeds_that, 3).
rule_applies(people_have_a_favorable_intent_towards_stronger_individuals_when_their_indebtedness_level_exceeds_that, X, Y) :-
    network(X, Y, indebted, Indebted_val), Indebted_val > 6.
rule_effect(people_have_a_favorable_intent_towards_stronger_individuals_when_their_indebtedness_level_exceeds_that, set_intent(X, favor, Y, 3)).

rule_likelihood(people_tend_to_favor_closer_friends_over_weaker_acquaintances, 1).
rule_type(people_tend_to_favor_closer_friends_over_weaker_acquaintances, volition).
% People tend to favor closer friends over weaker acquaintances.
rule_active(people_tend_to_favor_closer_friends_over_weaker_acquaintances).
rule_category(people_tend_to_favor_closer_friends_over_weaker_acquaintances, favors_obligations).
rule_source(people_tend_to_favor_closer_friends_over_weaker_acquaintances, ensemble).
rule_priority(people_tend_to_favor_closer_friends_over_weaker_acquaintances, 1).
rule_applies(people_tend_to_favor_closer_friends_over_weaker_acquaintances, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val < 4.
rule_effect(people_tend_to_favor_closer_friends_over_weaker_acquaintances, set_intent(X, favor, Y, -2)).

rule_likelihood(people_tend_to_favor_strong_individuals_in_their_network, 1).
rule_type(people_tend_to_favor_strong_individuals_in_their_network, volition).
% People tend to favor strong individuals in their network.
rule_active(people_tend_to_favor_strong_individuals_in_their_network).
rule_category(people_tend_to_favor_strong_individuals_in_their_network, favors_obligations).
rule_source(people_tend_to_favor_strong_individuals_in_their_network, ensemble).
rule_priority(people_tend_to_favor_strong_individuals_in_their_network, 1).
rule_applies(people_tend_to_favor_strong_individuals_in_their_network, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val < 4.
rule_effect(people_tend_to_favor_strong_individuals_in_their_network, set_intent(X, favor, Y, -1)).

rule_likelihood(people_tend_to_favor_stronger_individuals_in_their_social_network, 1).
rule_type(people_tend_to_favor_stronger_individuals_in_their_social_network, volition).
% People tend to favor stronger individuals in their social network.
rule_active(people_tend_to_favor_stronger_individuals_in_their_social_network).
rule_category(people_tend_to_favor_stronger_individuals_in_their_social_network, favors_obligations).
rule_source(people_tend_to_favor_stronger_individuals_in_their_social_network, ensemble).
rule_priority(people_tend_to_favor_stronger_individuals_in_their_social_network, 1).
rule_applies(people_tend_to_favor_stronger_individuals_in_their_social_network, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val < 4.
rule_effect(people_tend_to_favor_stronger_individuals_in_their_social_network, set_intent(X, favor, Y, -2)).

rule_likelihood(people_develop_a_favorable_intent_towards_strong_individuals_when_they_perceive_themselves_as_successful, 1).
rule_type(people_develop_a_favorable_intent_towards_strong_individuals_when_they_perceive_themselves_as_successful, volition).
% People develop a favorable intent towards strong individuals when they perceive themselves as successful.
rule_active(people_develop_a_favorable_intent_towards_strong_individuals_when_they_perceive_themselves_as_successful).
rule_category(people_develop_a_favorable_intent_towards_strong_individuals_when_they_perceive_themselves_as_successful, favors_obligations).
rule_source(people_develop_a_favorable_intent_towards_strong_individuals_when_they_perceive_themselves_as_successful, ensemble).
rule_priority(people_develop_a_favorable_intent_towards_strong_individuals_when_they_perceive_themselves_as_successful, 1).
rule_applies(people_develop_a_favorable_intent_towards_strong_individuals_when_they_perceive_themselves_as_successful, X, Y) :-
    status(X, successful).
rule_effect(people_develop_a_favorable_intent_towards_strong_individuals_when_they_perceive_themselves_as_successful, set_intent(X, favor, Y, 2)).

rule_likelihood(people_develop_a_favorable_disposition_towards_strong_individuals_when_they_feel_guilty, 1).
rule_type(people_develop_a_favorable_disposition_towards_strong_individuals_when_they_feel_guilty, volition).
% People develop a favorable disposition towards strong individuals when they feel guilty.
rule_active(people_develop_a_favorable_disposition_towards_strong_individuals_when_they_feel_guilty).
rule_category(people_develop_a_favorable_disposition_towards_strong_individuals_when_they_feel_guilty, favors_obligations).
rule_source(people_develop_a_favorable_disposition_towards_strong_individuals_when_they_feel_guilty, ensemble).
rule_priority(people_develop_a_favorable_disposition_towards_strong_individuals_when_they_feel_guilty, 1).
rule_applies(people_develop_a_favorable_disposition_towards_strong_individuals_when_they_feel_guilty, X, Y) :-
    status(X, guilty).
rule_effect(people_develop_a_favorable_disposition_towards_strong_individuals_when_they_feel_guilty, set_intent(X, favor, Y, 1)).

rule_likelihood(people_envy_others_strong_connections_and_favor_forming_relationships_with_those_they_admire_rule_name, 1).
rule_type(people_envy_others_strong_connections_and_favor_forming_relationships_with_those_they_admire_rule_name, volition).
% People envy others’ strong connections and favor forming relationships with those they admire. Rule Name
rule_active(people_envy_others_strong_connections_and_favor_forming_relationships_with_those_they_admire_rule_name).
rule_category(people_envy_others_strong_connections_and_favor_forming_relationships_with_those_they_admire_rule_name, favors_obligations).
rule_source(people_envy_others_strong_connections_and_favor_forming_relationships_with_those_they_admire_rule_name, ensemble).
rule_priority(people_envy_others_strong_connections_and_favor_forming_relationships_with_those_they_admire_rule_name, 1).
rule_applies(people_envy_others_strong_connections_and_favor_forming_relationships_with_those_they_admire_rule_name, X, Y) :-
    directed_status(X, Y, envy).
rule_effect(people_envy_others_strong_connections_and_favor_forming_relationships_with_those_they_admire_rule_name, set_intent(X, favor, Y, -2)).

rule_likelihood(people_want_to_increase_their_social_standing_by_doing_favors_for_influential_individuals, 1).
rule_type(people_want_to_increase_their_social_standing_by_doing_favors_for_influential_individuals, volition).
% People want to increase their social standing by doing favors for influential individuals.
rule_active(people_want_to_increase_their_social_standing_by_doing_favors_for_influential_individuals).
rule_category(people_want_to_increase_their_social_standing_by_doing_favors_for_influential_individuals, favors_obligations).
rule_source(people_want_to_increase_their_social_standing_by_doing_favors_for_influential_individuals, ensemble).
rule_priority(people_want_to_increase_their_social_standing_by_doing_favors_for_influential_individuals, 5).
rule_applies(people_want_to_increase_their_social_standing_by_doing_favors_for_influential_individuals, X, Y) :-
    event(X, did_a_favor_for).
rule_effect(people_want_to_increase_their_social_standing_by_doing_favors_for_influential_individuals, set_intent(X, favor, Y, 5)).

rule_likelihood(people_with_high_altruism_seek_to_establish_favorable_relationships, 1).
rule_type(people_with_high_altruism_seek_to_establish_favorable_relationships, volition).
% People with high altruism seek to establish favorable relationships.
rule_active(people_with_high_altruism_seek_to_establish_favorable_relationships).
rule_category(people_with_high_altruism_seek_to_establish_favorable_relationships, favors_obligations).
rule_source(people_with_high_altruism_seek_to_establish_favorable_relationships, ensemble).
rule_priority(people_with_high_altruism_seek_to_establish_favorable_relationships, 3).
rule_applies(people_with_high_altruism_seek_to_establish_favorable_relationships, X, Y) :-
    attribute(X, altruism, Altruism_val), Altruism_val > 12.
rule_effect(people_with_high_altruism_seek_to_establish_favorable_relationships, set_intent(X, favor, Y, 3)).

rule_likelihood(people_are_inclined_to_favor_strong_individuals_as_friends, 1).
rule_type(people_are_inclined_to_favor_strong_individuals_as_friends, volition).
% People are inclined to favor strong individuals as friends.
rule_active(people_are_inclined_to_favor_strong_individuals_as_friends).
rule_category(people_are_inclined_to_favor_strong_individuals_as_friends, favors_obligations).
rule_source(people_are_inclined_to_favor_strong_individuals_as_friends, ensemble).
rule_priority(people_are_inclined_to_favor_strong_individuals_as_friends, 1).
rule_applies(people_are_inclined_to_favor_strong_individuals_as_friends, X, Y) :-
    trait(X, friendly).
rule_effect(people_are_inclined_to_favor_strong_individuals_as_friends, set_intent(X, favor, Y, 1)).

rule_likelihood(people_develop_a_favorable_intent_towards_strong_individuals_when_they_have_recently_experienced_positive_interactions_with_them, 1).
rule_type(people_develop_a_favorable_intent_towards_strong_individuals_when_they_have_recently_experienced_positive_interactions_with_them, volition).
% People develop a favorable intent towards strong individuals when they have recently experienced positive interactions with them.
rule_active(people_develop_a_favorable_intent_towards_strong_individuals_when_they_have_recently_experienced_positive_interactions_with_them).
rule_category(people_develop_a_favorable_intent_towards_strong_individuals_when_they_have_recently_experienced_positive_interactions_with_them, favors_obligations).
rule_source(people_develop_a_favorable_intent_towards_strong_individuals_when_they_have_recently_experienced_positive_interactions_with_them, ensemble).
rule_priority(people_develop_a_favorable_intent_towards_strong_individuals_when_they_have_recently_experienced_positive_interactions_with_them, 1).
rule_applies(people_develop_a_favorable_intent_towards_strong_individuals_when_they_have_recently_experienced_positive_interactions_with_them, X, Y) :-
    event(X, nice).
rule_effect(people_develop_a_favorable_intent_towards_strong_individuals_when_they_have_recently_experienced_positive_interactions_with_them, set_intent(X, favor, Y, 2)).

rule_likelihood(people_intend_to_do_favors_for_influential_individuals, 1).
rule_type(people_intend_to_do_favors_for_influential_individuals, volition).
% People intend to do favors for influential individuals.
rule_active(people_intend_to_do_favors_for_influential_individuals).
rule_category(people_intend_to_do_favors_for_influential_individuals, favors_obligations).
rule_source(people_intend_to_do_favors_for_influential_individuals, ensemble).
rule_priority(people_intend_to_do_favors_for_influential_individuals, 3).
rule_applies(people_intend_to_do_favors_for_influential_individuals, X, Y) :-
    event(X, did_a_favor_for).
rule_effect(people_intend_to_do_favors_for_influential_individuals, set_intent(X, favor, Y, 3)).

rule_likelihood(people_develop_a_favorable_intent_towards_strong_individuals_after_observing_positive_interactions_within_the_last_month_to, 1).
rule_type(people_develop_a_favorable_intent_towards_strong_individuals_after_observing_positive_interactions_within_the_last_month_to, volition).
% People develop a favorable intent towards strong individuals after observing positive interactions within the last month to
rule_active(people_develop_a_favorable_intent_towards_strong_individuals_after_observing_positive_interactions_within_the_last_month_to).
rule_category(people_develop_a_favorable_intent_towards_strong_individuals_after_observing_positive_interactions_within_the_last_month_to, favors_obligations).
rule_source(people_develop_a_favorable_intent_towards_strong_individuals_after_observing_positive_interactions_within_the_last_month_to, ensemble).
rule_priority(people_develop_a_favorable_intent_towards_strong_individuals_after_observing_positive_interactions_within_the_last_month_to, 1).
rule_applies(people_develop_a_favorable_intent_towards_strong_individuals_after_observing_positive_interactions_within_the_last_month_to, X, Y) :-
    event(X, nice).
rule_effect(people_develop_a_favorable_intent_towards_strong_individuals_after_observing_positive_interactions_within_the_last_month_to, set_intent(X, favor, Y, 1)).

rule_likelihood(people_develop_a_favorable_disposition_towards_strong_individuals, 1).
rule_type(people_develop_a_favorable_disposition_towards_strong_individuals, volition).
% People develop a favorable disposition towards strong individuals.
rule_active(people_develop_a_favorable_disposition_towards_strong_individuals).
rule_category(people_develop_a_favorable_disposition_towards_strong_individuals, favors_obligations).
rule_source(people_develop_a_favorable_disposition_towards_strong_individuals, ensemble).
rule_priority(people_develop_a_favorable_disposition_towards_strong_individuals, 1).
rule_applies(people_develop_a_favorable_disposition_towards_strong_individuals, X, Y) :-
    event(X, mean).
rule_effect(people_develop_a_favorable_disposition_towards_strong_individuals, set_intent(X, favor, Y, -2)).

rule_likelihood(people_intend_to_do_favors_for_influential_individuals_due_to_past_actions, 1).
rule_type(people_intend_to_do_favors_for_influential_individuals_due_to_past_actions, volition).
% People intend to do favors for influential individuals due to past actions.
rule_active(people_intend_to_do_favors_for_influential_individuals_due_to_past_actions).
rule_category(people_intend_to_do_favors_for_influential_individuals_due_to_past_actions, favors_obligations).
rule_source(people_intend_to_do_favors_for_influential_individuals_due_to_past_actions, ensemble).
rule_priority(people_intend_to_do_favors_for_influential_individuals_due_to_past_actions, 1).
rule_applies(people_intend_to_do_favors_for_influential_individuals_due_to_past_actions, X, Y) :-
    event(X, did_a_favor_for).
rule_effect(people_intend_to_do_favors_for_influential_individuals_due_to_past_actions, set_intent(X, favor, Y, 2)).

rule_likelihood(people_have_a_positive_intent_to_do_favors_for_strong_individuals_within_the_last_month, 1).
rule_type(people_have_a_positive_intent_to_do_favors_for_strong_individuals_within_the_last_month, volition).
% People have a positive intent to do favors for strong individuals within the last month.
rule_active(people_have_a_positive_intent_to_do_favors_for_strong_individuals_within_the_last_month).
rule_category(people_have_a_positive_intent_to_do_favors_for_strong_individuals_within_the_last_month, favors_obligations).
rule_source(people_have_a_positive_intent_to_do_favors_for_strong_individuals_within_the_last_month, ensemble).
rule_priority(people_have_a_positive_intent_to_do_favors_for_strong_individuals_within_the_last_month, 1).
rule_applies(people_have_a_positive_intent_to_do_favors_for_strong_individuals_within_the_last_month, X, Y) :-
    event(X, did_a_favor_for).
rule_effect(people_have_a_positive_intent_to_do_favors_for_strong_individuals_within_the_last_month, set_intent(X, favor, Y, 1)).

rule_likelihood(people_have_a_strong_desire_to_favor_their_crush_when_they_are_within_close_proximity_of_friends, 1).
rule_type(people_have_a_strong_desire_to_favor_their_crush_when_they_are_within_close_proximity_of_friends, volition).
% People have a strong desire to favor their crush when they are within close proximity of friends
rule_active(people_have_a_strong_desire_to_favor_their_crush_when_they_are_within_close_proximity_of_friends).
rule_category(people_have_a_strong_desire_to_favor_their_crush_when_they_are_within_close_proximity_of_friends, favors_obligations).
rule_source(people_have_a_strong_desire_to_favor_their_crush_when_they_are_within_close_proximity_of_friends, ensemble).
rule_priority(people_have_a_strong_desire_to_favor_their_crush_when_they_are_within_close_proximity_of_friends, 1).
rule_applies(people_have_a_strong_desire_to_favor_their_crush_when_they_are_within_close_proximity_of_friends, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, nice).
rule_effect(people_have_a_strong_desire_to_favor_their_crush_when_they_are_within_close_proximity_of_friends, set_intent(X, favor, Y, 1)).

rule_likelihood(people_tend_to_favor_those_with_stronger_connections_when_their_crushes_are_within_recent_social_circles, 1).
rule_type(people_tend_to_favor_those_with_stronger_connections_when_their_crushes_are_within_recent_social_circles, volition).
% People tend to favor those with stronger connections when their crushes are within recent social circles.
rule_active(people_tend_to_favor_those_with_stronger_connections_when_their_crushes_are_within_recent_social_circles).
rule_category(people_tend_to_favor_those_with_stronger_connections_when_their_crushes_are_within_recent_social_circles, favors_obligations).
rule_source(people_tend_to_favor_those_with_stronger_connections_when_their_crushes_are_within_recent_social_circles, ensemble).
rule_priority(people_tend_to_favor_those_with_stronger_connections_when_their_crushes_are_within_recent_social_circles, 5).
rule_applies(people_tend_to_favor_those_with_stronger_connections_when_their_crushes_are_within_recent_social_circles, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, mean).
rule_effect(people_tend_to_favor_those_with_stronger_connections_when_their_crushes_are_within_recent_social_circles, set_intent(X, favor, Y, -5)).

rule_likelihood(people_are_likely_to_do_a_favor_for_strong_individuals_they_ve_recently_become_friends_with, 1).
rule_type(people_are_likely_to_do_a_favor_for_strong_individuals_they_ve_recently_become_friends_with, volition).
% People are likely to do a favor for strong individuals they’ve recently become friends with.
rule_active(people_are_likely_to_do_a_favor_for_strong_individuals_they_ve_recently_become_friends_with).
rule_category(people_are_likely_to_do_a_favor_for_strong_individuals_they_ve_recently_become_friends_with, favors_obligations).
rule_source(people_are_likely_to_do_a_favor_for_strong_individuals_they_ve_recently_become_friends_with, ensemble).
rule_priority(people_are_likely_to_do_a_favor_for_strong_individuals_they_ve_recently_become_friends_with, 3).
rule_applies(people_are_likely_to_do_a_favor_for_strong_individuals_they_ve_recently_become_friends_with, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, did_a_favor_for).
rule_effect(people_are_likely_to_do_a_favor_for_strong_individuals_they_ve_recently_become_friends_with, set_intent(X, favor, Y, 3)).

rule_likelihood(people_are_likely_to_do_a_favor_for_strong_individuals_if_they_have_been_friends_with_them_for_more, 1).
rule_type(people_are_likely_to_do_a_favor_for_strong_individuals_if_they_have_been_friends_with_them_for_more, volition).
% People are likely to do a favor for strong individuals if they have been friends with them for more
rule_active(people_are_likely_to_do_a_favor_for_strong_individuals_if_they_have_been_friends_with_them_for_more).
rule_category(people_are_likely_to_do_a_favor_for_strong_individuals_if_they_have_been_friends_with_them_for_more, favors_obligations).
rule_source(people_are_likely_to_do_a_favor_for_strong_individuals_if_they_have_been_friends_with_them_for_more, ensemble).
rule_priority(people_are_likely_to_do_a_favor_for_strong_individuals_if_they_have_been_friends_with_them_for_more, 1).
rule_applies(people_are_likely_to_do_a_favor_for_strong_individuals_if_they_have_been_friends_with_them_for_more, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, did_a_favor_for).
rule_effect(people_are_likely_to_do_a_favor_for_strong_individuals_if_they_have_been_friends_with_them_for_more, set_intent(X, favor, Y, 2)).

rule_likelihood(people_tend_to_favor_those_with_stronger_connections_when_their_crushes_are_within_a_close_social_circle, 1).
rule_type(people_tend_to_favor_those_with_stronger_connections_when_their_crushes_are_within_a_close_social_circle, volition).
% People tend to favor those with stronger connections when their crushes are within a close social circle
rule_active(people_tend_to_favor_those_with_stronger_connections_when_their_crushes_are_within_a_close_social_circle).
rule_category(people_tend_to_favor_those_with_stronger_connections_when_their_crushes_are_within_a_close_social_circle, favors_obligations).
rule_source(people_tend_to_favor_those_with_stronger_connections_when_their_crushes_are_within_a_close_social_circle, ensemble).
rule_priority(people_tend_to_favor_those_with_stronger_connections_when_their_crushes_are_within_a_close_social_circle, 1).
rule_applies(people_tend_to_favor_those_with_stronger_connections_when_their_crushes_are_within_a_close_social_circle, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, mean).
rule_effect(people_tend_to_favor_those_with_stronger_connections_when_their_crushes_are_within_a_close_social_circle, set_intent(X, favor, Y, -1)).

rule_likelihood(people_who_have_a_strong_social_network_with_more_than_six_friends_and_have_recently_done_a_favor_for, 1).
rule_type(people_who_have_a_strong_social_network_with_more_than_six_friends_and_have_recently_done_a_favor_for, volition).
% People who have a strong social network with more than six friends and have recently done a favor for
rule_active(people_who_have_a_strong_social_network_with_more_than_six_friends_and_have_recently_done_a_favor_for).
rule_category(people_who_have_a_strong_social_network_with_more_than_six_friends_and_have_recently_done_a_favor_for, favors_obligations).
rule_source(people_who_have_a_strong_social_network_with_more_than_six_friends_and_have_recently_done_a_favor_for, ensemble).
rule_priority(people_who_have_a_strong_social_network_with_more_than_six_friends_and_have_recently_done_a_favor_for, 1).
rule_applies(people_who_have_a_strong_social_network_with_more_than_six_friends_and_have_recently_done_a_favor_for, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, did_a_favor_for).
rule_effect(people_who_have_a_strong_social_network_with_more_than_six_friends_and_have_recently_done_a_favor_for, set_intent(X, favor, Y, 1)).

rule_likelihood(people_are_inclined_to_form_closer_bonds_with_influential_individuals_and_have_a_favorable_intent, 1).
rule_type(people_are_inclined_to_form_closer_bonds_with_influential_individuals_and_have_a_favorable_intent, volition).
% People are inclined to form closer bonds with influential individuals and have a favorable intent
rule_active(people_are_inclined_to_form_closer_bonds_with_influential_individuals_and_have_a_favorable_intent).
rule_category(people_are_inclined_to_form_closer_bonds_with_influential_individuals_and_have_a_favorable_intent, favors_obligations).
rule_source(people_are_inclined_to_form_closer_bonds_with_influential_individuals_and_have_a_favorable_intent, ensemble).
rule_priority(people_are_inclined_to_form_closer_bonds_with_influential_individuals_and_have_a_favorable_intent, 5).
rule_applies(people_are_inclined_to_form_closer_bonds_with_influential_individuals_and_have_a_favorable_intent, X, Y) :-
    network(X, 'z', romance, Romance_val), Romance_val > 6,
    event(Y, mean).
rule_effect(people_are_inclined_to_form_closer_bonds_with_influential_individuals_and_have_a_favorable_intent, set_intent(X, favor, Y, -5)).

rule_likelihood(people_develop_a_favorable_intent_towards_getting_closer_to_strong_individuals_when_they_have_been_meaningfully_interact, 1).
rule_type(people_develop_a_favorable_intent_towards_getting_closer_to_strong_individuals_when_they_have_been_meaningfully_interact, volition).
% People develop a favorable intent towards getting closer to strong individuals when they have been meaningfully interact
rule_active(people_develop_a_favorable_intent_towards_getting_closer_to_strong_individuals_when_they_have_been_meaningfully_interact).
rule_category(people_develop_a_favorable_intent_towards_getting_closer_to_strong_individuals_when_they_have_been_meaningfully_interact, favors_obligations).
rule_source(people_develop_a_favorable_intent_towards_getting_closer_to_strong_individuals_when_they_have_been_meaningfully_interact, ensemble).
rule_priority(people_develop_a_favorable_intent_towards_getting_closer_to_strong_individuals_when_they_have_been_meaningfully_interact, 3).
rule_applies(people_develop_a_favorable_intent_towards_getting_closer_to_strong_individuals_when_they_have_been_meaningfully_interact, X, Y) :-
    network(X, 'z', romance, Romance_val), Romance_val > 6,
    event(Y, mean).
rule_effect(people_develop_a_favorable_intent_towards_getting_closer_to_strong_individuals_when_they_have_been_meaningfully_interact, set_intent(X, favor, Y, -3)).

rule_likelihood(people_feel_indebted_to_their_strong_connections_and_are_likely_to_do_favors_for_them, 1).
rule_type(people_feel_indebted_to_their_strong_connections_and_are_likely_to_do_favors_for_them, volition).
% People feel indebted to their strong connections and are likely to do favors for them.
rule_active(people_feel_indebted_to_their_strong_connections_and_are_likely_to_do_favors_for_them).
rule_category(people_feel_indebted_to_their_strong_connections_and_are_likely_to_do_favors_for_them, favors_obligations).
rule_source(people_feel_indebted_to_their_strong_connections_and_are_likely_to_do_favors_for_them, ensemble).
rule_priority(people_feel_indebted_to_their_strong_connections_and_are_likely_to_do_favors_for_them, 1).
rule_applies(people_feel_indebted_to_their_strong_connections_and_are_likely_to_do_favors_for_them, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, did_a_favor_for).
rule_effect(people_feel_indebted_to_their_strong_connections_and_are_likely_to_do_favors_for_them, set_intent(X, favor, Y, 2)).

rule_likelihood(people_who_have_a_strong_familial_network_with_more_than_six_connections_and_have_done_a_favor_for, 1).
rule_type(people_who_have_a_strong_familial_network_with_more_than_six_connections_and_have_done_a_favor_for, volition).
% People who have a strong familial network with more than six connections and have done a favor for
rule_active(people_who_have_a_strong_familial_network_with_more_than_six_connections_and_have_done_a_favor_for).
rule_category(people_who_have_a_strong_familial_network_with_more_than_six_connections_and_have_done_a_favor_for, favors_obligations).
rule_source(people_who_have_a_strong_familial_network_with_more_than_six_connections_and_have_done_a_favor_for, ensemble).
rule_priority(people_who_have_a_strong_familial_network_with_more_than_six_connections_and_have_done_a_favor_for, 1).
rule_applies(people_who_have_a_strong_familial_network_with_more_than_six_connections_and_have_done_a_favor_for, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, did_a_favor_for).
rule_effect(people_who_have_a_strong_familial_network_with_more_than_six_connections_and_have_done_a_favor_for, set_intent(X, favor, Y, 1)).

rule_likelihood(people_are_inclined_to_seek_connections_with_influential_individuals_when_they_have_recently_done_a_favor_for, 1).
rule_type(people_are_inclined_to_seek_connections_with_influential_individuals_when_they_have_recently_done_a_favor_for, volition).
% People are inclined to seek connections with influential individuals when they have recently done a favor for
rule_active(people_are_inclined_to_seek_connections_with_influential_individuals_when_they_have_recently_done_a_favor_for).
rule_category(people_are_inclined_to_seek_connections_with_influential_individuals_when_they_have_recently_done_a_favor_for, favors_obligations).
rule_source(people_are_inclined_to_seek_connections_with_influential_individuals_when_they_have_recently_done_a_favor_for, ensemble).
rule_priority(people_are_inclined_to_seek_connections_with_influential_individuals_when_they_have_recently_done_a_favor_for, 1).
rule_applies(people_are_inclined_to_seek_connections_with_influential_individuals_when_they_have_recently_done_a_favor_for, X, Y) :-
    network(X, 'z', antagonism, Antagonism_val), Antagonism_val > 6,
    event(Y, did_a_favor_for).
rule_effect(people_are_inclined_to_seek_connections_with_influential_individuals_when_they_have_recently_done_a_favor_for, set_intent(X, favor, Y, -2)).

rule_likelihood(people_desire_to_honor_stronger_connections_when_indebtedness_level_exceeds_a_certain_threshold, 1).
rule_type(people_desire_to_honor_stronger_connections_when_indebtedness_level_exceeds_a_certain_threshold, volition).
% People desire to honor stronger connections when indebtedness level exceeds a certain threshold.
rule_active(people_desire_to_honor_stronger_connections_when_indebtedness_level_exceeds_a_certain_threshold).
rule_category(people_desire_to_honor_stronger_connections_when_indebtedness_level_exceeds_a_certain_threshold, favors_obligations).
rule_source(people_desire_to_honor_stronger_connections_when_indebtedness_level_exceeds_a_certain_threshold, ensemble).
rule_priority(people_desire_to_honor_stronger_connections_when_indebtedness_level_exceeds_a_certain_threshold, 1).
rule_applies(people_desire_to_honor_stronger_connections_when_indebtedness_level_exceeds_a_certain_threshold, X, Y) :-
    network(X, Y, indebted, Indebted_val), Indebted_val > 6.
rule_effect(people_desire_to_honor_stronger_connections_when_indebtedness_level_exceeds_a_certain_threshold, set_intent(X, honor, Y, 1)).

rule_likelihood(people_seek_to_honor_strong_individuals_by_doing_favors, 1).
rule_type(people_seek_to_honor_strong_individuals_by_doing_favors, volition).
% People seek to honor strong individuals by doing favors.
rule_active(people_seek_to_honor_strong_individuals_by_doing_favors).
rule_category(people_seek_to_honor_strong_individuals_by_doing_favors, favors_obligations).
rule_source(people_seek_to_honor_strong_individuals_by_doing_favors, ensemble).
rule_priority(people_seek_to_honor_strong_individuals_by_doing_favors, 1).
rule_applies(people_seek_to_honor_strong_individuals_by_doing_favors, X, Y) :-
    event(X, did_a_favor_for).
rule_effect(people_seek_to_honor_strong_individuals_by_doing_favors, set_intent(X, honor, Y, 2)).

rule_likelihood(people_want_to_ingratiate_themselves_with_individuals_they_are_indebted_to_more_than_others, 1).
rule_type(people_want_to_ingratiate_themselves_with_individuals_they_are_indebted_to_more_than_others, volition).
% People want to ingratiate themselves with individuals they are indebted to more than others
rule_active(people_want_to_ingratiate_themselves_with_individuals_they_are_indebted_to_more_than_others).
rule_category(people_want_to_ingratiate_themselves_with_individuals_they_are_indebted_to_more_than_others, favors_obligations).
rule_source(people_want_to_ingratiate_themselves_with_individuals_they_are_indebted_to_more_than_others, ensemble).
rule_priority(people_want_to_ingratiate_themselves_with_individuals_they_are_indebted_to_more_than_others, 1).
rule_applies(people_want_to_ingratiate_themselves_with_individuals_they_are_indebted_to_more_than_others, X, Y) :-
    network(X, Y, indebted, Indebted_val), Indebted_val > 6.
rule_effect(people_want_to_ingratiate_themselves_with_individuals_they_are_indebted_to_more_than_others, set_intent(X, ingratiate, Y, 2)).

rule_likelihood(people_want_to_ingratiate_themselves_with_those_they_ve_done_favors_for_recently, 1).
rule_type(people_want_to_ingratiate_themselves_with_those_they_ve_done_favors_for_recently, volition).
% People want to ingratiate themselves with those they’ve done favors for recently.
rule_active(people_want_to_ingratiate_themselves_with_those_they_ve_done_favors_for_recently).
rule_category(people_want_to_ingratiate_themselves_with_those_they_ve_done_favors_for_recently, favors_obligations).
rule_source(people_want_to_ingratiate_themselves_with_those_they_ve_done_favors_for_recently, ensemble).
rule_priority(people_want_to_ingratiate_themselves_with_those_they_ve_done_favors_for_recently, 1).
rule_applies(people_want_to_ingratiate_themselves_with_those_they_ve_done_favors_for_recently, X, Y) :-
    event(X, did_a_favor_for).
rule_effect(people_want_to_ingratiate_themselves_with_those_they_ve_done_favors_for_recently, set_intent(X, ingratiate, Y, 1)).

rule_likelihood(people_may_develop_feelings_of_envy_towards_those_they_perceive_as_more_successful_or_powerful, 1).
rule_type(people_may_develop_feelings_of_envy_towards_those_they_perceive_as_more_successful_or_powerful, volition).
% People may develop feelings of envy towards those they perceive as more successful or powerful.
rule_active(people_may_develop_feelings_of_envy_towards_those_they_perceive_as_more_successful_or_powerful).
rule_category(people_may_develop_feelings_of_envy_towards_those_they_perceive_as_more_successful_or_powerful, favors_obligations).
rule_source(people_may_develop_feelings_of_envy_towards_those_they_perceive_as_more_successful_or_powerful, ensemble).
rule_priority(people_may_develop_feelings_of_envy_towards_those_they_perceive_as_more_successful_or_powerful, 1).
rule_applies(people_may_develop_feelings_of_envy_towards_those_they_perceive_as_more_successful_or_powerful, X, Y) :-
    directed_status(X, Y, envy).
rule_effect(people_may_develop_feelings_of_envy_towards_those_they_perceive_as_more_successful_or_powerful, set_intent(X, kind, Y, -2)).

rule_likelihood(people_are_likely_to_develop_a_desire_for_friendship_with_strong_individuals_due_to_past_favors, 1).
rule_type(people_are_likely_to_develop_a_desire_for_friendship_with_strong_individuals_due_to_past_favors, volition).
% People are likely to develop a desire for friendship with strong individuals due to past favors.
rule_active(people_are_likely_to_develop_a_desire_for_friendship_with_strong_individuals_due_to_past_favors).
rule_category(people_are_likely_to_develop_a_desire_for_friendship_with_strong_individuals_due_to_past_favors, favors_obligations).
rule_source(people_are_likely_to_develop_a_desire_for_friendship_with_strong_individuals_due_to_past_favors, ensemble).
rule_priority(people_are_likely_to_develop_a_desire_for_friendship_with_strong_individuals_due_to_past_favors, 1).
rule_applies(people_are_likely_to_develop_a_desire_for_friendship_with_strong_individuals_due_to_past_favors, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, did_a_favor_for).
rule_effect(people_are_likely_to_develop_a_desire_for_friendship_with_strong_individuals_due_to_past_favors, set_intent(X, kind, Y, 1)).

rule_likelihood(people_with_a_strong_network_of_family_connections_who_have_recently_done_favors_for_their_crush_are, 1).
rule_type(people_with_a_strong_network_of_family_connections_who_have_recently_done_favors_for_their_crush_are, volition).
% People with a strong network of family connections who have recently done favors for their crush are
rule_active(people_with_a_strong_network_of_family_connections_who_have_recently_done_favors_for_their_crush_are).
rule_category(people_with_a_strong_network_of_family_connections_who_have_recently_done_favors_for_their_crush_are, favors_obligations).
rule_source(people_with_a_strong_network_of_family_connections_who_have_recently_done_favors_for_their_crush_are, ensemble).
rule_priority(people_with_a_strong_network_of_family_connections_who_have_recently_done_favors_for_their_crush_are, 1).
rule_applies(people_with_a_strong_network_of_family_connections_who_have_recently_done_favors_for_their_crush_are, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, did_a_favor_for).
rule_effect(people_with_a_strong_network_of_family_connections_who_have_recently_done_favors_for_their_crush_are, set_intent(X, kind, Y, 1)).

rule_likelihood(people_seek_to_form_closer_bonds_with_influential_individuals_due_to_a_favor_received_within_the_past, 1).
rule_type(people_seek_to_form_closer_bonds_with_influential_individuals_due_to_a_favor_received_within_the_past, volition).
% People seek to form closer bonds with influential individuals due to a favor received within the past
rule_active(people_seek_to_form_closer_bonds_with_influential_individuals_due_to_a_favor_received_within_the_past).
rule_category(people_seek_to_form_closer_bonds_with_influential_individuals_due_to_a_favor_received_within_the_past, favors_obligations).
rule_source(people_seek_to_form_closer_bonds_with_influential_individuals_due_to_a_favor_received_within_the_past, ensemble).
rule_priority(people_seek_to_form_closer_bonds_with_influential_individuals_due_to_a_favor_received_within_the_past, 1).
rule_applies(people_seek_to_form_closer_bonds_with_influential_individuals_due_to_a_favor_received_within_the_past, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, did_a_favor_for).
rule_effect(people_seek_to_form_closer_bonds_with_influential_individuals_due_to_a_favor_received_within_the_past, set_intent(X, kind, Y, 1)).

rule_likelihood(people_who_have_a_strong_familial_network_with_more_than_six_connections_and_have_done_a_favor_for, 1).
rule_type(people_who_have_a_strong_familial_network_with_more_than_six_connections_and_have_done_a_favor_for, volition).
% People who have a strong familial network with more than six connections and have done a favor for
rule_active(people_who_have_a_strong_familial_network_with_more_than_six_connections_and_have_done_a_favor_for).
rule_category(people_who_have_a_strong_familial_network_with_more_than_six_connections_and_have_done_a_favor_for, favors_obligations).
rule_source(people_who_have_a_strong_familial_network_with_more_than_six_connections_and_have_done_a_favor_for, ensemble).
rule_priority(people_who_have_a_strong_familial_network_with_more_than_six_connections_and_have_done_a_favor_for, 1).
rule_applies(people_who_have_a_strong_familial_network_with_more_than_six_connections_and_have_done_a_favor_for, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, did_a_favor_for).
rule_effect(people_who_have_a_strong_familial_network_with_more_than_six_connections_and_have_done_a_favor_for, set_intent(X, kind, Y, 1)).

rule_likelihood(people_are_influenced_to_seek_connections_with_individuals_they_perceive_as_more_powerful, 1).
rule_type(people_are_influenced_to_seek_connections_with_individuals_they_perceive_as_more_powerful, volition).
% People are influenced to seek connections with individuals they perceive as more powerful.
rule_active(people_are_influenced_to_seek_connections_with_individuals_they_perceive_as_more_powerful).
rule_category(people_are_influenced_to_seek_connections_with_individuals_they_perceive_as_more_powerful, favors_obligations).
rule_source(people_are_influenced_to_seek_connections_with_individuals_they_perceive_as_more_powerful, ensemble).
rule_priority(people_are_influenced_to_seek_connections_with_individuals_they_perceive_as_more_powerful, 1).
rule_applies(people_are_influenced_to_seek_connections_with_individuals_they_perceive_as_more_powerful, X, Y) :-
    directed_status(X, Y, rivals).
rule_effect(people_are_influenced_to_seek_connections_with_individuals_they_perceive_as_more_powerful, set_intent(X, manipulate, Y, 2)).

rule_likelihood(people_have_a_lower_trust_towards_weaker_connections_compared_to_stronger_ones_in_their_social_network, 1).
rule_type(people_have_a_lower_trust_towards_weaker_connections_compared_to_stronger_ones_in_their_social_network, volition).
% People have a lower trust towards weaker connections compared to stronger ones in their social network.
rule_active(people_have_a_lower_trust_towards_weaker_connections_compared_to_stronger_ones_in_their_social_network).
rule_category(people_have_a_lower_trust_towards_weaker_connections_compared_to_stronger_ones_in_their_social_network, favors_obligations).
rule_source(people_have_a_lower_trust_towards_weaker_connections_compared_to_stronger_ones_in_their_social_network, ensemble).
rule_priority(people_have_a_lower_trust_towards_weaker_connections_compared_to_stronger_ones_in_their_social_network, 3).
rule_applies(people_have_a_lower_trust_towards_weaker_connections_compared_to_stronger_ones_in_their_social_network, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val < 4.
rule_effect(people_have_a_lower_trust_towards_weaker_connections_compared_to_stronger_ones_in_their_social_network, set_intent(X, trust, Y, -3)).

rule_likelihood(people_develop_trust_towards_those_they_have_done_favors_for_recently, 1).
rule_type(people_develop_trust_towards_those_they_have_done_favors_for_recently, volition).
% People develop trust towards those they have done favors for recently.
rule_active(people_develop_trust_towards_those_they_have_done_favors_for_recently).
rule_category(people_develop_trust_towards_those_they_have_done_favors_for_recently, favors_obligations).
rule_source(people_develop_trust_towards_those_they_have_done_favors_for_recently, ensemble).
rule_priority(people_develop_trust_towards_those_they_have_done_favors_for_recently, 3).
rule_applies(people_develop_trust_towards_those_they_have_done_favors_for_recently, X, Y) :-
    event(X, did_a_favor_for).
rule_effect(people_develop_trust_towards_those_they_have_done_favors_for_recently, set_intent(X, trust, Y, 3)).

rule_likelihood(people_develop_trust_towards_those_they_have_done_favors_for_recently, 1).
rule_type(people_develop_trust_towards_those_they_have_done_favors_for_recently, volition).
% People develop trust towards those they have done favors for recently.
rule_active(people_develop_trust_towards_those_they_have_done_favors_for_recently).
rule_category(people_develop_trust_towards_those_they_have_done_favors_for_recently, favors_obligations).
rule_source(people_develop_trust_towards_those_they_have_done_favors_for_recently, ensemble).
rule_priority(people_develop_trust_towards_those_they_have_done_favors_for_recently, 1).
rule_applies(people_develop_trust_towards_those_they_have_done_favors_for_recently, X, Y) :-
    event(X, did_a_favor_for).
rule_effect(people_develop_trust_towards_those_they_have_done_favors_for_recently, set_intent(X, trust, Y, 2)).

rule_likelihood(people_develop_trust_towards_those_they_ve_done_favors_for, 1).
rule_type(people_develop_trust_towards_those_they_ve_done_favors_for, volition).
% People develop trust towards those they’ve done favors for.
rule_active(people_develop_trust_towards_those_they_ve_done_favors_for).
rule_category(people_develop_trust_towards_those_they_ve_done_favors_for, favors_obligations).
rule_source(people_develop_trust_towards_those_they_ve_done_favors_for, ensemble).
rule_priority(people_develop_trust_towards_those_they_ve_done_favors_for, 1).
rule_applies(people_develop_trust_towards_those_they_ve_done_favors_for, X, Y) :-
    event(X, did_a_favor_for).
rule_effect(people_develop_trust_towards_those_they_ve_done_favors_for, set_intent(X, trust, Y, 1)).

%% ═══════════════════════════════════════════════════════════
%% Category: fear-apprehension
%% ═══════════════════════════════════════════════════════════

%% Ensemble Volition Rules: fear-apprehension
%% Source: data/ensemble/volitionRules/fear-apprehension.json
%% Converted: 2026-04-02T20:09:49.732Z
%% Total rules: 9

rule_likelihood(generous_mentor_has_no_fear_of_mentoree, 1).
rule_type(generous_mentor_has_no_fear_of_mentoree, volition).
% Generous mentor has no fear of mentoree
rule_active(generous_mentor_has_no_fear_of_mentoree).
rule_category(generous_mentor_has_no_fear_of_mentoree, fear_apprehension).
rule_source(generous_mentor_has_no_fear_of_mentoree, ensemble).
rule_priority(generous_mentor_has_no_fear_of_mentoree, 5).
rule_applies(generous_mentor_has_no_fear_of_mentoree, X, Y) :-
    directed_status(X, Y, cares_for),
    directed_status(Y, X, esteems),
    trait(X, generous).
rule_effect(generous_mentor_has_no_fear_of_mentoree, modify_network(X, Y, emulation, '+', 5)).
rule_effect(generous_mentor_has_no_fear_of_mentoree, modify_network(Y, X, credibility, '+', 5)).
rule_effect(generous_mentor_has_no_fear_of_mentoree, set_relationship(X, Y, rivals, -3)).

rule_likelihood(man_with_low_self_confidence_fears_rival_in_love, 1).
rule_type(man_with_low_self_confidence_fears_rival_in_love, volition).
% Man with low self-confidence fears rival in love
rule_active(man_with_low_self_confidence_fears_rival_in_love).
rule_category(man_with_low_self_confidence_fears_rival_in_love, fear_apprehension).
rule_source(man_with_low_self_confidence_fears_rival_in_love, ensemble).
rule_priority(man_with_low_self_confidence_fears_rival_in_love, 5).
rule_applies(man_with_low_self_confidence_fears_rival_in_love, X, Y) :-
    attribute(X, self_assuredness, Self_assuredness_val), Self_assuredness_val < 40,
    relationship(X, Y, lovers),
    relationship(Y, 'z', ally),
    trait(X, male),
    trait(Y, female),
    trait('z', male).
rule_effect(man_with_low_self_confidence_fears_rival_in_love, set_relationship(X, 'z', rivals, 5)).
rule_effect(man_with_low_self_confidence_fears_rival_in_love, modify_network(X, Y, affinity, '-', 2)).

rule_likelihood(hypocrites_are_afraid_of_being_exposed_by_others, 1).
rule_type(hypocrites_are_afraid_of_being_exposed_by_others, volition).
% Hypocrites are afraid of being exposed by others
rule_active(hypocrites_are_afraid_of_being_exposed_by_others).
rule_category(hypocrites_are_afraid_of_being_exposed_by_others, fear_apprehension).
rule_source(hypocrites_are_afraid_of_being_exposed_by_others, ensemble).
rule_priority(hypocrites_are_afraid_of_being_exposed_by_others, 5).
rule_applies(hypocrites_are_afraid_of_being_exposed_by_others, X, Y) :-
    trait(X, hypocritical),
    directed_status(X, Y, threatened_by).
rule_effect(hypocrites_are_afraid_of_being_exposed_by_others, modify_network(Y, X, affinity, '-', 5)).
rule_effect(hypocrites_are_afraid_of_being_exposed_by_others, set_relationship(X, Y, esteem, 5)).

rule_likelihood(people_with_a_fearful_status_seek_candid_relationships_to_overcome_their_apprehension, 1).
rule_type(people_with_a_fearful_status_seek_candid_relationships_to_overcome_their_apprehension, volition).
% People with a fearful status seek candid relationships to overcome their apprehension.
rule_active(people_with_a_fearful_status_seek_candid_relationships_to_overcome_their_apprehension).
rule_category(people_with_a_fearful_status_seek_candid_relationships_to_overcome_their_apprehension, fear_apprehension).
rule_source(people_with_a_fearful_status_seek_candid_relationships_to_overcome_their_apprehension, ensemble).
rule_priority(people_with_a_fearful_status_seek_candid_relationships_to_overcome_their_apprehension, 1).
rule_applies(people_with_a_fearful_status_seek_candid_relationships_to_overcome_their_apprehension, X, Y) :-
    status(X, fearful).
rule_effect(people_with_a_fearful_status_seek_candid_relationships_to_overcome_their_apprehension, set_intent(X, candid, Y, -2)).

rule_likelihood(people_are_afraid_of_being_disliked_by_others, 1).
rule_type(people_are_afraid_of_being_disliked_by_others, volition).
% People are afraid of being disliked by others.
rule_active(people_are_afraid_of_being_disliked_by_others).
rule_category(people_are_afraid_of_being_disliked_by_others, fear_apprehension).
rule_source(people_are_afraid_of_being_disliked_by_others, ensemble).
rule_priority(people_are_afraid_of_being_disliked_by_others, 5).
rule_applies(people_are_afraid_of_being_disliked_by_others, X, Y) :-
    directed_status(X, Y, afraid_of).
rule_effect(people_are_afraid_of_being_disliked_by_others, set_intent(X, candid, Y, -5)).

rule_likelihood(people_are_afraid_of_both_their_crush_and_strong_individuals_they_have_a_candid_intent_to_get, 1).
rule_type(people_are_afraid_of_both_their_crush_and_strong_individuals_they_have_a_candid_intent_to_get, volition).
% People are afraid of both their crush and strong individuals. They have a candid intent to get
rule_active(people_are_afraid_of_both_their_crush_and_strong_individuals_they_have_a_candid_intent_to_get).
rule_category(people_are_afraid_of_both_their_crush_and_strong_individuals_they_have_a_candid_intent_to_get, fear_apprehension).
rule_source(people_are_afraid_of_both_their_crush_and_strong_individuals_they_have_a_candid_intent_to_get, ensemble).
rule_priority(people_are_afraid_of_both_their_crush_and_strong_individuals_they_have_a_candid_intent_to_get, 1).
rule_applies(people_are_afraid_of_both_their_crush_and_strong_individuals_they_have_a_candid_intent_to_get, X, Y) :-
    directed_status(X, 'z', afraid_of),
    directed_status(Y, 'z', afraid_of).
rule_effect(people_are_afraid_of_both_their_crush_and_strong_individuals_they_have_a_candid_intent_to_get, set_intent(X, candid, Y, 2)).

rule_likelihood(people_manipulate_their_fear_to_get_closer_to_strong_individuals, 1).
rule_type(people_manipulate_their_fear_to_get_closer_to_strong_individuals, volition).
% People manipulate their fear to get closer to strong individuals.
rule_active(people_manipulate_their_fear_to_get_closer_to_strong_individuals).
rule_category(people_manipulate_their_fear_to_get_closer_to_strong_individuals, fear_apprehension).
rule_source(people_manipulate_their_fear_to_get_closer_to_strong_individuals, ensemble).
rule_priority(people_manipulate_their_fear_to_get_closer_to_strong_individuals, 1).
rule_applies(people_manipulate_their_fear_to_get_closer_to_strong_individuals, X, Y) :-
    directed_status(X, Y, afraid_of).
rule_effect(people_manipulate_their_fear_to_get_closer_to_strong_individuals, set_intent(X, manipulate, Y, 1)).

rule_likelihood(people_with_a_fearful_status_seek_trust_from_others, 1).
rule_type(people_with_a_fearful_status_seek_trust_from_others, volition).
% People with a fearful status seek trust from others.
rule_active(people_with_a_fearful_status_seek_trust_from_others).
rule_category(people_with_a_fearful_status_seek_trust_from_others, fear_apprehension).
rule_source(people_with_a_fearful_status_seek_trust_from_others, ensemble).
rule_priority(people_with_a_fearful_status_seek_trust_from_others, 1).
rule_applies(people_with_a_fearful_status_seek_trust_from_others, X, Y) :-
    status(X, fearful).
rule_effect(people_with_a_fearful_status_seek_trust_from_others, set_intent(X, trust, Y, -2)).

rule_likelihood(people_are_afraid_of_being_judged_by_others_when_they_trust_their_crush, 1).
rule_type(people_are_afraid_of_being_judged_by_others_when_they_trust_their_crush, volition).
% People are afraid of being judged by others when they trust their crush.
rule_active(people_are_afraid_of_being_judged_by_others_when_they_trust_their_crush).
rule_category(people_are_afraid_of_being_judged_by_others_when_they_trust_their_crush, fear_apprehension).
rule_source(people_are_afraid_of_being_judged_by_others_when_they_trust_their_crush, ensemble).
rule_priority(people_are_afraid_of_being_judged_by_others_when_they_trust_their_crush, 3).
rule_applies(people_are_afraid_of_being_judged_by_others_when_they_trust_their_crush, X, Y) :-
    directed_status(X, Y, afraid_of).
rule_effect(people_are_afraid_of_being_judged_by_others_when_they_trust_their_crush, set_intent(X, trust, Y, -3)).

%% ═══════════════════════════════════════════════════════════
%% Category: friendship-alliance
%% ═══════════════════════════════════════════════════════════

%% Ensemble Volition Rules: friendship-alliance
%% Source: data/ensemble/volitionRules/friendship-alliance.json
%% Converted: 2026-04-02T20:09:49.732Z
%% Total rules: 68

rule_likelihood(the_hero_really_wants_to_increase_closeness_to_the_love, 1).
rule_type(the_hero_really_wants_to_increase_closeness_to_the_love, volition).
% The hero REALLY wants to increase closeness to the love
rule_active(the_hero_really_wants_to_increase_closeness_to_the_love).
rule_category(the_hero_really_wants_to_increase_closeness_to_the_love, friendship_alliance).
rule_source(the_hero_really_wants_to_increase_closeness_to_the_love, ensemble).
rule_priority(the_hero_really_wants_to_increase_closeness_to_the_love, 8).
rule_applies(the_hero_really_wants_to_increase_closeness_to_the_love, X, Y) :-
    trait(X, hero),
    trait(Y, love).
rule_effect(the_hero_really_wants_to_increase_closeness_to_the_love, modify_network(X, Y, closeness, '+', 20)).

rule_likelihood(the_love_generally_doesn_t_want_to_get_close_to_the_hero, 1).
rule_type(the_love_generally_doesn_t_want_to_get_close_to_the_hero, volition).
% The love generally doesn’t want to get close to the hero
rule_active(the_love_generally_doesn_t_want_to_get_close_to_the_hero).
rule_category(the_love_generally_doesn_t_want_to_get_close_to_the_hero, friendship_alliance).
rule_source(the_love_generally_doesn_t_want_to_get_close_to_the_hero, ensemble).
rule_priority(the_love_generally_doesn_t_want_to_get_close_to_the_hero, 8).
rule_applies(the_love_generally_doesn_t_want_to_get_close_to_the_hero, X, Y) :-
    trait(X, love),
    trait(Y, hero).
rule_effect(the_love_generally_doesn_t_want_to_get_close_to_the_hero, modify_network(X, Y, closeness, '-', 10)).

rule_likelihood(being_friends_can_lead_to_the_friend_zone, 1).
rule_type(being_friends_can_lead_to_the_friend_zone, volition).
% Being friends can lead to the friend zone
rule_active(being_friends_can_lead_to_the_friend_zone).
rule_category(being_friends_can_lead_to_the_friend_zone, friendship_alliance).
rule_source(being_friends_can_lead_to_the_friend_zone, ensemble).
rule_priority(being_friends_can_lead_to_the_friend_zone, 5).
rule_applies(being_friends_can_lead_to_the_friend_zone, X, Y) :-
    relationship(X, Y, friends_with).
rule_effect(being_friends_can_lead_to_the_friend_zone, set_relationship(X, Y, dating, -5)).

rule_likelihood(everyone_is_friendly, 1).
rule_type(everyone_is_friendly, volition).
% Everyone is friendly!
rule_active(everyone_is_friendly).
rule_category(everyone_is_friendly, friendship_alliance).
rule_source(everyone_is_friendly, ensemble).
rule_priority(everyone_is_friendly, 5).
rule_applies(everyone_is_friendly, X, Y) :-
    bond(X, Y, kinship, Kinship_val), Kinship_val > 0.
rule_effect(everyone_is_friendly, modify_bond(X, Y, kinship, '+', 5)).

rule_likelihood(a_show_of_kindness_and_generosity_wins_friends, 1).
rule_type(a_show_of_kindness_and_generosity_wins_friends, volition).
% A show of kindness and generosity wins friends
rule_active(a_show_of_kindness_and_generosity_wins_friends).
rule_category(a_show_of_kindness_and_generosity_wins_friends, friendship_alliance).
rule_source(a_show_of_kindness_and_generosity_wins_friends, ensemble).
rule_priority(a_show_of_kindness_and_generosity_wins_friends, 5).
rule_applies(a_show_of_kindness_and_generosity_wins_friends, X, Y) :-
    trait(Y, generous),
    trait(Y, female),
    trait(Y, honest),
    trait(Y, merchant).
rule_effect(a_show_of_kindness_and_generosity_wins_friends, modify_network(X, Y, affinity, '+', 5)).

rule_likelihood(innocent_looks_and_manners_inspire_friendship, 1).
rule_type(innocent_looks_and_manners_inspire_friendship, volition).
% Innocent looks and manners inspire friendship
rule_active(innocent_looks_and_manners_inspire_friendship).
rule_category(innocent_looks_and_manners_inspire_friendship, friendship_alliance).
rule_source(innocent_looks_and_manners_inspire_friendship, ensemble).
rule_priority(innocent_looks_and_manners_inspire_friendship, 5).
rule_applies(innocent_looks_and_manners_inspire_friendship, X, Y) :-
    trait(X, innocent_looking),
    trait(X, male),
    trait(X, rich).
rule_effect(innocent_looks_and_manners_inspire_friendship, set_relationship(X, Y, esteem, 5)).

rule_likelihood(a_tender_disposition_makes_one_want_friends, 1).
rule_type(a_tender_disposition_makes_one_want_friends, volition).
% A tender disposition makes one want friends
rule_active(a_tender_disposition_makes_one_want_friends).
rule_category(a_tender_disposition_makes_one_want_friends, friendship_alliance).
rule_source(a_tender_disposition_makes_one_want_friends, ensemble).
rule_priority(a_tender_disposition_makes_one_want_friends, 5).
rule_applies(a_tender_disposition_makes_one_want_friends, X, Y) :-
    trait(X, kind),
    trait(X, generous).
rule_effect(a_tender_disposition_makes_one_want_friends, modify_network(X, Y, affinity, '+', 5)).

rule_likelihood(an_eccentric_man_and_his_friends_tend_to_repel_women, 1).
rule_type(an_eccentric_man_and_his_friends_tend_to_repel_women, volition).
% An eccentric man and his friends tend to repel women
rule_active(an_eccentric_man_and_his_friends_tend_to_repel_women).
rule_category(an_eccentric_man_and_his_friends_tend_to_repel_women, friendship_alliance).
rule_source(an_eccentric_man_and_his_friends_tend_to_repel_women, ensemble).
rule_priority(an_eccentric_man_and_his_friends_tend_to_repel_women, 5).
rule_applies(an_eccentric_man_and_his_friends_tend_to_repel_women, X, Y) :-
    trait(X, male),
    trait('z', male),
    trait(Y, female),
    directed_status(X, 'z', trusts).
rule_effect(an_eccentric_man_and_his_friends_tend_to_repel_women, modify_network(X, Y, curiosity, '-', 5)).
rule_effect(an_eccentric_man_and_his_friends_tend_to_repel_women, modify_network('z', Y, curiosity, '-', 5)).

rule_likelihood(honesty_strengthens_friendship, 1).
rule_type(honesty_strengthens_friendship, volition).
% Honesty strengthens friendship
rule_active(honesty_strengthens_friendship).
rule_category(honesty_strengthens_friendship, friendship_alliance).
rule_source(honesty_strengthens_friendship, ensemble).
rule_priority(honesty_strengthens_friendship, 5).
rule_applies(honesty_strengthens_friendship, X, Y) :-
    directed_status(X, Y, esteems),
    trait(Y, honest).
rule_effect(honesty_strengthens_friendship, set_relationship(X, Y, esteem, 5)).

rule_likelihood(a_greedy_financially_dependent_friend_is_liked_less_by_others, 1).
rule_type(a_greedy_financially_dependent_friend_is_liked_less_by_others, volition).
% A greedy, financially dependent friend is liked less by others
rule_active(a_greedy_financially_dependent_friend_is_liked_less_by_others).
rule_category(a_greedy_financially_dependent_friend_is_liked_less_by_others, friendship_alliance).
rule_source(a_greedy_financially_dependent_friend_is_liked_less_by_others, ensemble).
rule_priority(a_greedy_financially_dependent_friend_is_liked_less_by_others, 5).
rule_applies(a_greedy_financially_dependent_friend_is_liked_less_by_others, X, Y) :-
    directed_status(X, Y, financially_dependent_on),
    trait(X, greedy),
    relationship(X, Y, friends).
rule_effect(a_greedy_financially_dependent_friend_is_liked_less_by_others, modify_network(Y, X, affinity, '+', 5)).

rule_likelihood(friends_want_their_friends_to_dislike_the_same_people, 1).
rule_type(friends_want_their_friends_to_dislike_the_same_people, volition).
% Friends want their friends to dislike the same people
rule_active(friends_want_their_friends_to_dislike_the_same_people).
rule_category(friends_want_their_friends_to_dislike_the_same_people, friendship_alliance).
rule_source(friends_want_their_friends_to_dislike_the_same_people, ensemble).
rule_priority(friends_want_their_friends_to_dislike_the_same_people, 5).
rule_applies(friends_want_their_friends_to_dislike_the_same_people, X, Y) :-
    directed_status(Y, 'z', jealous_of),
    relationship(X, Y, friends),
    network(Y, 'z', affinity, Affinity_val), Affinity_val < 50.
rule_effect(friends_want_their_friends_to_dislike_the_same_people, modify_network(X, 'z', affinity, '-', 5)).
rule_effect(friends_want_their_friends_to_dislike_the_same_people, modify_network(X, 'z', curiosity, '-', 5)).
rule_effect(friends_want_their_friends_to_dislike_the_same_people, set_relationship(X, 'z', ally, -5)).

rule_likelihood(people_are_less_inclined_to_ally_with_those_they_cannot_trust, 1).
rule_type(people_are_less_inclined_to_ally_with_those_they_cannot_trust, volition).
% People are less inclined to ally with those they cannot trust
rule_active(people_are_less_inclined_to_ally_with_those_they_cannot_trust).
rule_category(people_are_less_inclined_to_ally_with_those_they_cannot_trust, friendship_alliance).
rule_source(people_are_less_inclined_to_ally_with_those_they_cannot_trust, ensemble).
rule_priority(people_are_less_inclined_to_ally_with_those_they_cannot_trust, 5).
rule_applies(people_are_less_inclined_to_ally_with_those_they_cannot_trust, X, Y) :-
    \+ trait(X, trustworthy),
    \+ directed_status(X, Y, trusts).
rule_effect(people_are_less_inclined_to_ally_with_those_they_cannot_trust, set_relationship(X, Y, ally, 5)).
rule_effect(people_are_less_inclined_to_ally_with_those_they_cannot_trust, set_relationship(X, Y, esteem, 5)).

rule_likelihood(workers_who_feel_socially_connected_may_defy_their_employers, 1).
rule_type(workers_who_feel_socially_connected_may_defy_their_employers, volition).
% Workers who feel socially connected may defy their employers
rule_active(workers_who_feel_socially_connected_may_defy_their_employers).
rule_category(workers_who_feel_socially_connected_may_defy_their_employers, friendship_alliance).
rule_source(workers_who_feel_socially_connected_may_defy_their_employers, ensemble).
rule_priority(workers_who_feel_socially_connected_may_defy_their_employers, 3).
rule_applies(workers_who_feel_socially_connected_may_defy_their_employers, X, Y) :-
    trait(X, stagehand),
    status(X, feeling_socially_connected),
    trait(X, wearing_a_uniform),
    directed_status(X, Y, financially_dependent_on).
rule_effect(workers_who_feel_socially_connected_may_defy_their_employers, modify_network(X, Y, credibility, '+', 3)).

rule_likelihood(a_young_man_is_less_likely_to_become_friends_with_an_old_man, 1).
rule_type(a_young_man_is_less_likely_to_become_friends_with_an_old_man, volition).
% A young man is less likely to become friends with an old man
rule_active(a_young_man_is_less_likely_to_become_friends_with_an_old_man).
rule_category(a_young_man_is_less_likely_to_become_friends_with_an_old_man, friendship_alliance).
rule_source(a_young_man_is_less_likely_to_become_friends_with_an_old_man, ensemble).
rule_priority(a_young_man_is_less_likely_to_become_friends_with_an_old_man, 1).
rule_applies(a_young_man_is_less_likely_to_become_friends_with_an_old_man, X, Y) :-
    trait(X, young),
    trait(Y, old),
    trait(X, male),
    trait(Y, male).
rule_effect(a_young_man_is_less_likely_to_become_friends_with_an_old_man, set_relationship(X, Y, esteem, -2)).
rule_effect(a_young_man_is_less_likely_to_become_friends_with_an_old_man, modify_network(X, Y, affinity, '-', 2)).

rule_likelihood(rich_people_of_high_social_standing_are_less_likely_to_befriend_non_rich_people_of_low_social_standing, 1).
rule_type(rich_people_of_high_social_standing_are_less_likely_to_befriend_non_rich_people_of_low_social_standing, volition).
% Rich people of high social standing are less likely to befriend non-rich people of low social standing
rule_active(rich_people_of_high_social_standing_are_less_likely_to_befriend_non_rich_people_of_low_social_standing).
rule_category(rich_people_of_high_social_standing_are_less_likely_to_befriend_non_rich_people_of_low_social_standing, friendship_alliance).
rule_source(rich_people_of_high_social_standing_are_less_likely_to_befriend_non_rich_people_of_low_social_standing, ensemble).
rule_priority(rich_people_of_high_social_standing_are_less_likely_to_befriend_non_rich_people_of_low_social_standing, 5).
rule_applies(rich_people_of_high_social_standing_are_less_likely_to_befriend_non_rich_people_of_low_social_standing, X, Y) :-
    attribute(X, propriety, Propriety_val), Propriety_val > 70,
    trait(X, rich),
    \+ trait(Y, rich),
    attribute(X, social_standing, Social_standing_val), Social_standing_val > 70,
    attribute(Y, social_standing, Social_standing_val), Social_standing_val < 50.
rule_effect(rich_people_of_high_social_standing_are_less_likely_to_befriend_non_rich_people_of_low_social_standing, modify_network(X, Y, affinity, '-', 3)).
rule_effect(rich_people_of_high_social_standing_are_less_likely_to_befriend_non_rich_people_of_low_social_standing, set_relationship(X, Y, ally, -5)).

rule_likelihood(friends_want_to_be_held_in_mutual_esteem, 1).
rule_type(friends_want_to_be_held_in_mutual_esteem, volition).
% Friends want to be held in mutual esteem
rule_active(friends_want_to_be_held_in_mutual_esteem).
rule_category(friends_want_to_be_held_in_mutual_esteem, friendship_alliance).
rule_source(friends_want_to_be_held_in_mutual_esteem, ensemble).
rule_priority(friends_want_to_be_held_in_mutual_esteem, 5).
rule_applies(friends_want_to_be_held_in_mutual_esteem, X, Y) :-
    relationship(X, Y, friends).
rule_effect(friends_want_to_be_held_in_mutual_esteem, set_relationship(X, Y, esteem, 5)).
rule_effect(friends_want_to_be_held_in_mutual_esteem, set_relationship(Y, X, esteem, 5)).

rule_likelihood(workers_may_want_to_ally_with_rich_people, 1).
rule_type(workers_may_want_to_ally_with_rich_people, volition).
% Workers may want to ally with rich people
rule_active(workers_may_want_to_ally_with_rich_people).
rule_category(workers_may_want_to_ally_with_rich_people, friendship_alliance).
rule_source(workers_may_want_to_ally_with_rich_people, ensemble).
rule_priority(workers_may_want_to_ally_with_rich_people, 5).
rule_applies(workers_may_want_to_ally_with_rich_people, X, Y) :-
    trait(X, rich),
    trait(X, rich),
    trait(Y, stagehand),
    directed_status(Y, X, financially_dependent_on).
rule_effect(workers_may_want_to_ally_with_rich_people, modify_network(Y, X, credibility, '+', 5)).

rule_likelihood(two_sensitive_children_may_become_friends, 1).
rule_type(two_sensitive_children_may_become_friends, volition).
% Two sensitive children may become friends
rule_active(two_sensitive_children_may_become_friends).
rule_category(two_sensitive_children_may_become_friends, friendship_alliance).
rule_source(two_sensitive_children_may_become_friends, ensemble).
rule_priority(two_sensitive_children_may_become_friends, 5).
rule_applies(two_sensitive_children_may_become_friends, X, Y) :-
    trait(X, child),
    attribute(X, sensitiveness, Sensitiveness_val), Sensitiveness_val > 66,
    trait(Y, child),
    attribute(Y, sensitiveness, Sensitiveness_val), Sensitiveness_val > 66.
rule_effect(two_sensitive_children_may_become_friends, modify_network(X, Y, affinity, '+', 3)).
rule_effect(two_sensitive_children_may_become_friends, modify_network(X, Y, curiosity, '+', 2)).
rule_effect(two_sensitive_children_may_become_friends, modify_network(X, Y, affinity, '+', 1)).
rule_effect(two_sensitive_children_may_become_friends, set_relationship(X, Y, ally, 5)).

rule_likelihood(a_man_with_no_cultural_knowledge_does_not_want_to_lose_his_rich_friend_s_esteem, 1).
rule_type(a_man_with_no_cultural_knowledge_does_not_want_to_lose_his_rich_friend_s_esteem, volition).
% A man with no cultural knowledge does not want to lose his rich friend’s esteem
rule_active(a_man_with_no_cultural_knowledge_does_not_want_to_lose_his_rich_friend_s_esteem).
rule_category(a_man_with_no_cultural_knowledge_does_not_want_to_lose_his_rich_friend_s_esteem, friendship_alliance).
rule_source(a_man_with_no_cultural_knowledge_does_not_want_to_lose_his_rich_friend_s_esteem, ensemble).
rule_priority(a_man_with_no_cultural_knowledge_does_not_want_to_lose_his_rich_friend_s_esteem, 5).
rule_applies(a_man_with_no_cultural_knowledge_does_not_want_to_lose_his_rich_friend_s_esteem, X, Y) :-
    attribute(X, cultural_knowledge, Cultural_knowledge_val), Cultural_knowledge_val < 50,
    attribute(Y, cultural_knowledge, Cultural_knowledge_val), Cultural_knowledge_val > 70,
    trait(Y, rich),
    \+ trait(X, rich),
    trait(X, wearing_a_first_responder_uniform),
    attribute(Y, sophistication, Sophistication_val), Sophistication_val > 70.
rule_effect(a_man_with_no_cultural_knowledge_does_not_want_to_lose_his_rich_friend_s_esteem, set_relationship(X, Y, esteem, 5)).
rule_effect(a_man_with_no_cultural_knowledge_does_not_want_to_lose_his_rich_friend_s_esteem, modify_network(X, Y, credibility, '+', 5)).
rule_effect(a_man_with_no_cultural_knowledge_does_not_want_to_lose_his_rich_friend_s_esteem, modify_network(X, Y, curiosity, '-', 2)).

rule_likelihood(some_people_tell_secrets_to_make_friends, 1).
rule_type(some_people_tell_secrets_to_make_friends, volition).
% Some people tell secrets to make friends
rule_active(some_people_tell_secrets_to_make_friends).
rule_category(some_people_tell_secrets_to_make_friends, friendship_alliance).
rule_source(some_people_tell_secrets_to_make_friends, ensemble).
rule_priority(some_people_tell_secrets_to_make_friends, 5).
rule_applies(some_people_tell_secrets_to_make_friends, X, Y) :-
    trait(Y, indiscreet),
    attribute(X, nosiness, Nosiness_val), Nosiness_val > 50.
rule_effect(some_people_tell_secrets_to_make_friends, modify_network(X, Y, affinity, '+', 5)).

rule_likelihood(friends_want_their_friends_to_emulate_them_and_like_the_same_things, 1).
rule_type(friends_want_their_friends_to_emulate_them_and_like_the_same_things, volition).
% Friends want their friends to emulate them and like the same things
rule_active(friends_want_their_friends_to_emulate_them_and_like_the_same_things).
rule_category(friends_want_their_friends_to_emulate_them_and_like_the_same_things, friendship_alliance).
rule_source(friends_want_their_friends_to_emulate_them_and_like_the_same_things, ensemble).
rule_priority(friends_want_their_friends_to_emulate_them_and_like_the_same_things, 3).
rule_applies(friends_want_their_friends_to_emulate_them_and_like_the_same_things, X, Y) :-
    relationship(X, Y, friends).
rule_effect(friends_want_their_friends_to_emulate_them_and_like_the_same_things, modify_network(X, Y, emulation, '+', 3)).

rule_likelihood(people_will_become_less_suspicious_of_those_who_their_friends_trust, 1).
rule_type(people_will_become_less_suspicious_of_those_who_their_friends_trust, volition).
% People will become less suspicious of those who their friends trust
rule_active(people_will_become_less_suspicious_of_those_who_their_friends_trust).
rule_category(people_will_become_less_suspicious_of_those_who_their_friends_trust, friendship_alliance).
rule_source(people_will_become_less_suspicious_of_those_who_their_friends_trust, ensemble).
rule_priority(people_will_become_less_suspicious_of_those_who_their_friends_trust, 5).
rule_applies(people_will_become_less_suspicious_of_those_who_their_friends_trust, X, Y) :-
    network(X, Y, affinity, Affinity_val), Affinity_val > 75,
    relationship(X, 'z', friends),
    directed_status('z', Y, suspicious_of),
    directed_status(X, 'z', esteems),
    trait(X, virtuous).
rule_effect(people_will_become_less_suspicious_of_those_who_their_friends_trust, modify_network('z', Y, affinity, '+', 3)).
rule_effect(people_will_become_less_suspicious_of_those_who_their_friends_trust, modify_network(X, Y, credibility, '+', 5)).

rule_likelihood(a_friend_of_a_friend_is_more_likely_to_become_an_ally, 1).
rule_type(a_friend_of_a_friend_is_more_likely_to_become_an_ally, volition).
% A friend of a friend is more likely to become an ally
rule_active(a_friend_of_a_friend_is_more_likely_to_become_an_ally).
rule_category(a_friend_of_a_friend_is_more_likely_to_become_an_ally, friendship_alliance).
rule_source(a_friend_of_a_friend_is_more_likely_to_become_an_ally, ensemble).
rule_priority(a_friend_of_a_friend_is_more_likely_to_become_an_ally, 5).
rule_applies(a_friend_of_a_friend_is_more_likely_to_become_an_ally, X, Y) :-
    relationship(X, Y, friends),
    relationship(Y, 'z', friends),
    trait(Y, kind).
rule_effect(a_friend_of_a_friend_is_more_likely_to_become_an_ally, set_relationship(X, 'z', ally, 5)).

rule_likelihood(honor_and_virtue_increase_affinity_in_friendship, 1).
rule_type(honor_and_virtue_increase_affinity_in_friendship, volition).
% Honor and virtue increase affinity in friendship
rule_active(honor_and_virtue_increase_affinity_in_friendship).
rule_category(honor_and_virtue_increase_affinity_in_friendship, friendship_alliance).
rule_source(honor_and_virtue_increase_affinity_in_friendship, ensemble).
rule_priority(honor_and_virtue_increase_affinity_in_friendship, 5).
rule_applies(honor_and_virtue_increase_affinity_in_friendship, X, Y) :-
    relationship(X, Y, friends),
    trait(Y, virtuous),
    trait(Y, honest),
    trait(Y, kind).
rule_effect(honor_and_virtue_increase_affinity_in_friendship, modify_network(X, Y, affinity, '+', 5)).

rule_likelihood(virtuous_friends_want_to_inspire_their_inappropriate_friends, 1).
rule_type(virtuous_friends_want_to_inspire_their_inappropriate_friends, volition).
% Virtuous friends want to inspire their inappropriate friends
rule_active(virtuous_friends_want_to_inspire_their_inappropriate_friends).
rule_category(virtuous_friends_want_to_inspire_their_inappropriate_friends, friendship_alliance).
rule_source(virtuous_friends_want_to_inspire_their_inappropriate_friends, ensemble).
rule_priority(virtuous_friends_want_to_inspire_their_inappropriate_friends, 5).
rule_applies(virtuous_friends_want_to_inspire_their_inappropriate_friends, X, Y) :-
    relationship(X, Y, friends),
    attribute(Y, propriety, Propriety_val), Propriety_val < 50,
    trait(X, virtuous).
rule_effect(virtuous_friends_want_to_inspire_their_inappropriate_friends, modify_network(X, Y, emulation, '+', 5)).

rule_likelihood(children_who_are_friends_may_not_look_for_an_other_child_s_attention, 1).
rule_type(children_who_are_friends_may_not_look_for_an_other_child_s_attention, volition).
% Children who are friends may not look for an other child’s attention
rule_active(children_who_are_friends_may_not_look_for_an_other_child_s_attention).
rule_category(children_who_are_friends_may_not_look_for_an_other_child_s_attention, friendship_alliance).
rule_source(children_who_are_friends_may_not_look_for_an_other_child_s_attention, ensemble).
rule_priority(children_who_are_friends_may_not_look_for_an_other_child_s_attention, 3).
rule_applies(children_who_are_friends_may_not_look_for_an_other_child_s_attention, X, Y) :-
    trait(X, child),
    trait(Y, child),
    relationship(X, Y, friends),
    relationship(X, Y, ally),
    trait('z', child).
rule_effect(children_who_are_friends_may_not_look_for_an_other_child_s_attention, modify_network(X, 'z', curiosity, '+', 3)).
rule_effect(children_who_are_friends_may_not_look_for_an_other_child_s_attention, modify_network(Y, 'z', curiosity, '+', 3)).

rule_likelihood(someone_might_tell_a_secret_to_make_friends, 1).
rule_type(someone_might_tell_a_secret_to_make_friends, volition).
% Someone might tell a secret to make friends
rule_active(someone_might_tell_a_secret_to_make_friends).
rule_category(someone_might_tell_a_secret_to_make_friends, friendship_alliance).
rule_source(someone_might_tell_a_secret_to_make_friends, ensemble).
rule_priority(someone_might_tell_a_secret_to_make_friends, 5).
rule_applies(someone_might_tell_a_secret_to_make_friends, X, Y) :-
    trait(Y, indiscreet),
    attribute(X, nosiness, Nosiness_val), Nosiness_val > 50.
rule_effect(someone_might_tell_a_secret_to_make_friends, modify_network(X, Y, affinity, '+', 5)).

rule_likelihood(non_rich_virtuous_people_want_to_befriend_similar_people, 1).
rule_type(non_rich_virtuous_people_want_to_befriend_similar_people, volition).
% Non-rich, virtuous people want to befriend similar people
rule_active(non_rich_virtuous_people_want_to_befriend_similar_people).
rule_category(non_rich_virtuous_people_want_to_befriend_similar_people, friendship_alliance).
rule_source(non_rich_virtuous_people_want_to_befriend_similar_people, ensemble).
rule_priority(non_rich_virtuous_people_want_to_befriend_similar_people, 5).
rule_applies(non_rich_virtuous_people_want_to_befriend_similar_people, X, Y) :-
    trait(X, virtuous),
    trait(X, young),
    \+ trait(X, rich),
    trait(Y, virtuous),
    \+ trait(Y, young),
    trait(Y, rich),
    relationship(X, Y, friends).
rule_effect(non_rich_virtuous_people_want_to_befriend_similar_people, modify_network(X, Y, affinity, '+', 5)).
rule_effect(non_rich_virtuous_people_want_to_befriend_similar_people, set_relationship(X, Y, ally, 5)).
rule_effect(non_rich_virtuous_people_want_to_befriend_similar_people, modify_network(X, Y, emulation, '+', 5)).

rule_likelihood(people_have_a_strong_desire_to_befriend_those_with_more_connections, 1).
rule_type(people_have_a_strong_desire_to_befriend_those_with_more_connections, volition).
% People have a strong desire to befriend those with more connections.
rule_active(people_have_a_strong_desire_to_befriend_those_with_more_connections).
rule_category(people_have_a_strong_desire_to_befriend_those_with_more_connections, friendship_alliance).
rule_source(people_have_a_strong_desire_to_befriend_those_with_more_connections, ensemble).
rule_priority(people_have_a_strong_desire_to_befriend_those_with_more_connections, 1).
rule_applies(people_have_a_strong_desire_to_befriend_those_with_more_connections, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val > 6.
rule_effect(people_have_a_strong_desire_to_befriend_those_with_more_connections, set_intent(X, candid, Y, 2)).

rule_likelihood(people_seek_to_increase_their_connections_with_both_public_friends_of_type_z_and_other_individuals_who_are_also, 1).
rule_type(people_seek_to_increase_their_connections_with_both_public_friends_of_type_z_and_other_individuals_who_are_also, volition).
% People seek to increase their connections with both public friends of type z and other individuals who are also
rule_active(people_seek_to_increase_their_connections_with_both_public_friends_of_type_z_and_other_individuals_who_are_also).
rule_category(people_seek_to_increase_their_connections_with_both_public_friends_of_type_z_and_other_individuals_who_are_also, friendship_alliance).
rule_source(people_seek_to_increase_their_connections_with_both_public_friends_of_type_z_and_other_individuals_who_are_also, ensemble).
rule_priority(people_seek_to_increase_their_connections_with_both_public_friends_of_type_z_and_other_individuals_who_are_also, 1).
rule_applies(people_seek_to_increase_their_connections_with_both_public_friends_of_type_z_and_other_individuals_who_are_also, X, Y) :-
    directed_status(X, 'z', public_friends),
    directed_status(Y, 'z', public_friends).
rule_effect(people_seek_to_increase_their_connections_with_both_public_friends_of_type_z_and_other_individuals_who_are_also, set_intent(X, candid, Y, 1)).

rule_likelihood(people_are_likely_to_develop_mutual_friendships_when_they_both_have_a_strong_desire_for_friendship_with, 1).
rule_type(people_are_likely_to_develop_mutual_friendships_when_they_both_have_a_strong_desire_for_friendship_with, volition).
% People are likely to develop mutual friendships when they both have a strong desire for friendship with
rule_active(people_are_likely_to_develop_mutual_friendships_when_they_both_have_a_strong_desire_for_friendship_with).
rule_category(people_are_likely_to_develop_mutual_friendships_when_they_both_have_a_strong_desire_for_friendship_with, friendship_alliance).
rule_source(people_are_likely_to_develop_mutual_friendships_when_they_both_have_a_strong_desire_for_friendship_with, ensemble).
rule_priority(people_are_likely_to_develop_mutual_friendships_when_they_both_have_a_strong_desire_for_friendship_with, 1).
rule_applies(people_are_likely_to_develop_mutual_friendships_when_they_both_have_a_strong_desire_for_friendship_with, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    network(Y, 'z', friendship, Friendship_val), Friendship_val > 6.
rule_effect(people_are_likely_to_develop_mutual_friendships_when_they_both_have_a_strong_desire_for_friendship_with, set_intent(X, candid, Y, 2)).

rule_likelihood(people_are_interested_in_forming_friendships_with_individuals_who_have_a_strong_network_of_friends, 1).
rule_type(people_are_interested_in_forming_friendships_with_individuals_who_have_a_strong_network_of_friends, volition).
% People are interested in forming friendships with individuals who have a strong network of friends.
rule_active(people_are_interested_in_forming_friendships_with_individuals_who_have_a_strong_network_of_friends).
rule_category(people_are_interested_in_forming_friendships_with_individuals_who_have_a_strong_network_of_friends, friendship_alliance).
rule_source(people_are_interested_in_forming_friendships_with_individuals_who_have_a_strong_network_of_friends, ensemble).
rule_priority(people_are_interested_in_forming_friendships_with_individuals_who_have_a_strong_network_of_friends, 1).
rule_applies(people_are_interested_in_forming_friendships_with_individuals_who_have_a_strong_network_of_friends, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val < 4,
    network(Y, 'z', friendship, Friendship_val), Friendship_val < 4.
rule_effect(people_are_interested_in_forming_friendships_with_individuals_who_have_a_strong_network_of_friends, set_intent(X, candid, Y, 1)).

rule_likelihood(people_have_a_strong_desire_to_get_closer_friends_with_those_they_are_more_connected_to_within_the_last, 1).
rule_type(people_have_a_strong_desire_to_get_closer_friends_with_those_they_are_more_connected_to_within_the_last, volition).
% People have a strong desire to get closer friends with those they are more connected to within the last
rule_active(people_have_a_strong_desire_to_get_closer_friends_with_those_they_are_more_connected_to_within_the_last).
rule_category(people_have_a_strong_desire_to_get_closer_friends_with_those_they_are_more_connected_to_within_the_last, friendship_alliance).
rule_source(people_have_a_strong_desire_to_get_closer_friends_with_those_they_are_more_connected_to_within_the_last, ensemble).
rule_priority(people_have_a_strong_desire_to_get_closer_friends_with_those_they_are_more_connected_to_within_the_last, 1).
rule_applies(people_have_a_strong_desire_to_get_closer_friends_with_those_they_are_more_connected_to_within_the_last, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, mean).
rule_effect(people_have_a_strong_desire_to_get_closer_friends_with_those_they_are_more_connected_to_within_the_last, set_intent(X, candid, Y, -1)).

rule_likelihood(people_desire_to_become_closer_friends_with_strong_individuals_when_they_have_had_a_meaningful_interaction_within_the, 1).
rule_type(people_desire_to_become_closer_friends_with_strong_individuals_when_they_have_had_a_meaningful_interaction_within_the, volition).
% People desire to become closer friends with strong individuals when they have had a meaningful interaction within the
rule_active(people_desire_to_become_closer_friends_with_strong_individuals_when_they_have_had_a_meaningful_interaction_within_the).
rule_category(people_desire_to_become_closer_friends_with_strong_individuals_when_they_have_had_a_meaningful_interaction_within_the, friendship_alliance).
rule_source(people_desire_to_become_closer_friends_with_strong_individuals_when_they_have_had_a_meaningful_interaction_within_the, ensemble).
rule_priority(people_desire_to_become_closer_friends_with_strong_individuals_when_they_have_had_a_meaningful_interaction_within_the, 1).
rule_applies(people_desire_to_become_closer_friends_with_strong_individuals_when_they_have_had_a_meaningful_interaction_within_the, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, mean).
rule_effect(people_desire_to_become_closer_friends_with_strong_individuals_when_they_have_had_a_meaningful_interaction_within_the, set_intent(X, candid, Y, -1)).

rule_likelihood(people_seek_new_friends_when_they_have_more_than_5_close_connections_and_haven_t_expressed_interest, 1).
rule_type(people_seek_new_friends_when_they_have_more_than_5_close_connections_and_haven_t_expressed_interest, volition).
% People seek new friends when they have more than 5 close connections and haven’t expressed interest
rule_active(people_seek_new_friends_when_they_have_more_than_5_close_connections_and_haven_t_expressed_interest).
rule_category(people_seek_new_friends_when_they_have_more_than_5_close_connections_and_haven_t_expressed_interest, friendship_alliance).
rule_source(people_seek_new_friends_when_they_have_more_than_5_close_connections_and_haven_t_expressed_interest, ensemble).
rule_priority(people_seek_new_friends_when_they_have_more_than_5_close_connections_and_haven_t_expressed_interest, 1).
rule_applies(people_seek_new_friends_when_they_have_more_than_5_close_connections_and_haven_t_expressed_interest, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, mean).
rule_effect(people_seek_new_friends_when_they_have_more_than_5_close_connections_and_haven_t_expressed_interest, set_intent(X, candid, Y, -1)).

rule_likelihood(people_have_a_strong_desire_to_befriend_those_with_more_connections, 1).
rule_type(people_have_a_strong_desire_to_befriend_those_with_more_connections, volition).
% People have a strong desire to befriend those with more connections.
rule_active(people_have_a_strong_desire_to_befriend_those_with_more_connections).
rule_category(people_have_a_strong_desire_to_befriend_those_with_more_connections, friendship_alliance).
rule_source(people_have_a_strong_desire_to_befriend_those_with_more_connections, ensemble).
rule_priority(people_have_a_strong_desire_to_befriend_those_with_more_connections, 5).
rule_applies(people_have_a_strong_desire_to_befriend_those_with_more_connections, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val > 6.
rule_effect(people_have_a_strong_desire_to_befriend_those_with_more_connections, set_intent(X, favor, Y, 5)).

rule_likelihood(people_seek_to_form_stronger_connections_with_those_who_are_equally_close_knit_in_their_social_circles, 1).
rule_type(people_seek_to_form_stronger_connections_with_those_who_are_equally_close_knit_in_their_social_circles, volition).
% People seek to form stronger connections with those who are equally close-knit in their social circles
rule_active(people_seek_to_form_stronger_connections_with_those_who_are_equally_close_knit_in_their_social_circles).
rule_category(people_seek_to_form_stronger_connections_with_those_who_are_equally_close_knit_in_their_social_circles, friendship_alliance).
rule_source(people_seek_to_form_stronger_connections_with_those_who_are_equally_close_knit_in_their_social_circles, ensemble).
rule_priority(people_seek_to_form_stronger_connections_with_those_who_are_equally_close_knit_in_their_social_circles, 3).
rule_applies(people_seek_to_form_stronger_connections_with_those_who_are_equally_close_knit_in_their_social_circles, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    network(Y, 'z', familial, Familial_val), Familial_val > 6.
rule_effect(people_seek_to_form_stronger_connections_with_those_who_are_equally_close_knit_in_their_social_circles, set_intent(X, favor, Y, 3)).

rule_likelihood(people_desire_stronger_friendships_when_their_current_number_of_friends_is_below_a_certain_threshold, 1).
rule_type(people_desire_stronger_friendships_when_their_current_number_of_friends_is_below_a_certain_threshold, volition).
% People desire stronger friendships when their current number of friends is below a certain threshold.
rule_active(people_desire_stronger_friendships_when_their_current_number_of_friends_is_below_a_certain_threshold).
rule_category(people_desire_stronger_friendships_when_their_current_number_of_friends_is_below_a_certain_threshold, friendship_alliance).
rule_source(people_desire_stronger_friendships_when_their_current_number_of_friends_is_below_a_certain_threshold, ensemble).
rule_priority(people_desire_stronger_friendships_when_their_current_number_of_friends_is_below_a_certain_threshold, 1).
rule_applies(people_desire_stronger_friendships_when_their_current_number_of_friends_is_below_a_certain_threshold, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val > 6.
rule_effect(people_desire_stronger_friendships_when_their_current_number_of_friends_is_below_a_certain_threshold, set_intent(X, honor, Y, 1)).

rule_likelihood(people_desire_stronger_friendships_with_multiple_connections_to_influence_their_pursuit_of_honor, 1).
rule_type(people_desire_stronger_friendships_with_multiple_connections_to_influence_their_pursuit_of_honor, volition).
% People desire stronger friendships with multiple connections to influence their pursuit of honor.
rule_active(people_desire_stronger_friendships_with_multiple_connections_to_influence_their_pursuit_of_honor).
rule_category(people_desire_stronger_friendships_with_multiple_connections_to_influence_their_pursuit_of_honor, friendship_alliance).
rule_source(people_desire_stronger_friendships_with_multiple_connections_to_influence_their_pursuit_of_honor, ensemble).
rule_priority(people_desire_stronger_friendships_with_multiple_connections_to_influence_their_pursuit_of_honor, 1).
rule_applies(people_desire_stronger_friendships_with_multiple_connections_to_influence_their_pursuit_of_honor, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    network(Y, 'z', friendship, Friendship_val), Friendship_val > 6.
rule_effect(people_desire_stronger_friendships_with_multiple_connections_to_influence_their_pursuit_of_honor, set_intent(X, honor, Y, 2)).

rule_likelihood(people_desire_to_honor_their_closest_friends_within_a_year_of_meeting, 1).
rule_type(people_desire_to_honor_their_closest_friends_within_a_year_of_meeting, volition).
% People desire to honor their closest friends within a year of meeting.
rule_active(people_desire_to_honor_their_closest_friends_within_a_year_of_meeting).
rule_category(people_desire_to_honor_their_closest_friends_within_a_year_of_meeting, friendship_alliance).
rule_source(people_desire_to_honor_their_closest_friends_within_a_year_of_meeting, ensemble).
rule_priority(people_desire_to_honor_their_closest_friends_within_a_year_of_meeting, 1).
rule_applies(people_desire_to_honor_their_closest_friends_within_a_year_of_meeting, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, mean).
rule_effect(people_desire_to_honor_their_closest_friends_within_a_year_of_meeting, set_intent(X, honor, Y, -2)).

rule_likelihood(people_desire_stronger_friendships_when_their_social_network_connections_exceed_a_certain_threshold, 1).
rule_type(people_desire_stronger_friendships_when_their_social_network_connections_exceed_a_certain_threshold, volition).
% People desire stronger friendships when their social network connections exceed a certain threshold.
rule_active(people_desire_stronger_friendships_when_their_social_network_connections_exceed_a_certain_threshold).
rule_category(people_desire_stronger_friendships_when_their_social_network_connections_exceed_a_certain_threshold, friendship_alliance).
rule_source(people_desire_stronger_friendships_when_their_social_network_connections_exceed_a_certain_threshold, ensemble).
rule_priority(people_desire_stronger_friendships_when_their_social_network_connections_exceed_a_certain_threshold, 5).
rule_applies(people_desire_stronger_friendships_when_their_social_network_connections_exceed_a_certain_threshold, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val > 6.
rule_effect(people_desire_stronger_friendships_when_their_social_network_connections_exceed_a_certain_threshold, set_intent(X, kind, Y, 5)).

rule_likelihood(people_desire_to_befriend_those_they_perceive_as_strong, 1).
rule_type(people_desire_to_befriend_those_they_perceive_as_strong, volition).
% People desire to befriend those they perceive as strong.
rule_active(people_desire_to_befriend_those_they_perceive_as_strong).
rule_category(people_desire_to_befriend_those_they_perceive_as_strong, friendship_alliance).
rule_source(people_desire_to_befriend_those_they_perceive_as_strong, ensemble).
rule_priority(people_desire_to_befriend_those_they_perceive_as_strong, 3).
rule_applies(people_desire_to_befriend_those_they_perceive_as_strong, X, Y) :-
    status(X, successful).
rule_effect(people_desire_to_befriend_those_they_perceive_as_strong, set_intent(X, kind, Y, 3)).

rule_likelihood(people_with_high_altruism_seek_companionship_from_equally_selfless_individuals, 1).
rule_type(people_with_high_altruism_seek_companionship_from_equally_selfless_individuals, volition).
% People with high altruism seek companionship from equally selfless individuals.
rule_active(people_with_high_altruism_seek_companionship_from_equally_selfless_individuals).
rule_category(people_with_high_altruism_seek_companionship_from_equally_selfless_individuals, friendship_alliance).
rule_source(people_with_high_altruism_seek_companionship_from_equally_selfless_individuals, ensemble).
rule_priority(people_with_high_altruism_seek_companionship_from_equally_selfless_individuals, 1).
rule_applies(people_with_high_altruism_seek_companionship_from_equally_selfless_individuals, X, Y) :-
    attribute(X, altruism, Altruism_val), Altruism_val > 12.
rule_effect(people_with_high_altruism_seek_companionship_from_equally_selfless_individuals, set_intent(X, kind, Y, 2)).

rule_likelihood(people_seek_companionship_with_individuals_exhibiting_friendly_traits, 1).
rule_type(people_seek_companionship_with_individuals_exhibiting_friendly_traits, volition).
% People seek companionship with individuals exhibiting friendly traits.
rule_active(people_seek_companionship_with_individuals_exhibiting_friendly_traits).
rule_category(people_seek_companionship_with_individuals_exhibiting_friendly_traits, friendship_alliance).
rule_source(people_seek_companionship_with_individuals_exhibiting_friendly_traits, ensemble).
rule_priority(people_seek_companionship_with_individuals_exhibiting_friendly_traits, 3).
rule_applies(people_seek_companionship_with_individuals_exhibiting_friendly_traits, X, Y) :-
    trait(X, friendly).
rule_effect(people_seek_companionship_with_individuals_exhibiting_friendly_traits, set_intent(X, kind, Y, 3)).

rule_likelihood(people_desire_to_befriend_strong_individuals, 1).
rule_type(people_desire_to_befriend_strong_individuals, volition).
% People desire to befriend strong individuals.
rule_active(people_desire_to_befriend_strong_individuals).
rule_category(people_desire_to_befriend_strong_individuals, friendship_alliance).
rule_source(people_desire_to_befriend_strong_individuals, ensemble).
rule_priority(people_desire_to_befriend_strong_individuals, 3).
rule_applies(people_desire_to_befriend_strong_individuals, X, Y) :-
    event(X, nice).
rule_effect(people_desire_to_befriend_strong_individuals, set_intent(X, kind, Y, 3)).

rule_likelihood(people_desire_to_befriend_strong_individuals_when_they_have_had_a_positive_interaction_with_them_within_the_last, 1).
rule_type(people_desire_to_befriend_strong_individuals_when_they_have_had_a_positive_interaction_with_them_within_the_last, volition).
% People desire to befriend strong individuals when they have had a positive interaction with them within the last
rule_active(people_desire_to_befriend_strong_individuals_when_they_have_had_a_positive_interaction_with_them_within_the_last).
rule_category(people_desire_to_befriend_strong_individuals_when_they_have_had_a_positive_interaction_with_them_within_the_last, friendship_alliance).
rule_source(people_desire_to_befriend_strong_individuals_when_they_have_had_a_positive_interaction_with_them_within_the_last, ensemble).
rule_priority(people_desire_to_befriend_strong_individuals_when_they_have_had_a_positive_interaction_with_them_within_the_last, 1).
rule_applies(people_desire_to_befriend_strong_individuals_when_they_have_had_a_positive_interaction_with_them_within_the_last, X, Y) :-
    event(X, nice).
rule_effect(people_desire_to_befriend_strong_individuals_when_they_have_had_a_positive_interaction_with_them_within_the_last, set_intent(X, kind, Y, 1)).

rule_likelihood(people_seek_companionship_with_individuals_who_are_both_friends_of_public_figures_and_admired_by_their_pe, 1).
rule_type(people_seek_companionship_with_individuals_who_are_both_friends_of_public_figures_and_admired_by_their_pe, volition).
% People seek companionship with individuals who are both friends of public figures and admired by their pe
rule_active(people_seek_companionship_with_individuals_who_are_both_friends_of_public_figures_and_admired_by_their_pe).
rule_category(people_seek_companionship_with_individuals_who_are_both_friends_of_public_figures_and_admired_by_their_pe, friendship_alliance).
rule_source(people_seek_companionship_with_individuals_who_are_both_friends_of_public_figures_and_admired_by_their_pe, ensemble).
rule_priority(people_seek_companionship_with_individuals_who_are_both_friends_of_public_figures_and_admired_by_their_pe, 1).
rule_applies(people_seek_companionship_with_individuals_who_are_both_friends_of_public_figures_and_admired_by_their_pe, X, Y) :-
    directed_status(X, 'z', public_friends),
    directed_status(Y, 'z', public_friends).
rule_effect(people_seek_companionship_with_individuals_who_are_both_friends_of_public_figures_and_admired_by_their_pe, set_intent(X, kind, Y, 2)).

rule_likelihood(people_desire_to_strengthen_their_connections_with_both_strong_individuals_and_close_friends, 1).
rule_type(people_desire_to_strengthen_their_connections_with_both_strong_individuals_and_close_friends, volition).
% People desire to strengthen their connections with both strong individuals and close friends.
rule_active(people_desire_to_strengthen_their_connections_with_both_strong_individuals_and_close_friends).
rule_category(people_desire_to_strengthen_their_connections_with_both_strong_individuals_and_close_friends, friendship_alliance).
rule_source(people_desire_to_strengthen_their_connections_with_both_strong_individuals_and_close_friends, ensemble).
rule_priority(people_desire_to_strengthen_their_connections_with_both_strong_individuals_and_close_friends, 3).
rule_applies(people_desire_to_strengthen_their_connections_with_both_strong_individuals_and_close_friends, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    network(Y, 'z', friendship, Friendship_val), Friendship_val > 6.
rule_effect(people_desire_to_strengthen_their_connections_with_both_strong_individuals_and_close_friends, set_intent(X, kind, Y, 3)).

rule_likelihood(people_seek_stronger_connections_with_both_their_siblings_and_close_friends, 1).
rule_type(people_seek_stronger_connections_with_both_their_siblings_and_close_friends, volition).
% People seek stronger connections with both their siblings and close friends.
rule_active(people_seek_stronger_connections_with_both_their_siblings_and_close_friends).
rule_category(people_seek_stronger_connections_with_both_their_siblings_and_close_friends, friendship_alliance).
rule_source(people_seek_stronger_connections_with_both_their_siblings_and_close_friends, ensemble).
rule_priority(people_seek_stronger_connections_with_both_their_siblings_and_close_friends, 1).
rule_applies(people_seek_stronger_connections_with_both_their_siblings_and_close_friends, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    network(Y, 'z', familial, Familial_val), Familial_val > 6.
rule_effect(people_seek_stronger_connections_with_both_their_siblings_and_close_friends, set_intent(X, kind, Y, 2)).

rule_likelihood(people_with_a_strong_network_of_friends_friendship_count_6_who_have_recently_done_fav, 1).
rule_type(people_with_a_strong_network_of_friends_friendship_count_6_who_have_recently_done_fav, volition).
% People with a strong network of friends (friendship count >6) who have recently done fav
rule_active(people_with_a_strong_network_of_friends_friendship_count_6_who_have_recently_done_fav).
rule_category(people_with_a_strong_network_of_friends_friendship_count_6_who_have_recently_done_fav, friendship_alliance).
rule_source(people_with_a_strong_network_of_friends_friendship_count_6_who_have_recently_done_fav, ensemble).
rule_priority(people_with_a_strong_network_of_friends_friendship_count_6_who_have_recently_done_fav, 1).
rule_applies(people_with_a_strong_network_of_friends_friendship_count_6_who_have_recently_done_fav, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, did_a_favor_for).
rule_effect(people_with_a_strong_network_of_friends_friendship_count_6_who_have_recently_done_fav, set_intent(X, kind, Y, 1)).

rule_likelihood(people_are_likely_to_seek_friendships_with_individuals_they_perceive_as_strong_when_their_existing_friends_have, 1).
rule_type(people_are_likely_to_seek_friendships_with_individuals_they_perceive_as_strong_when_their_existing_friends_have, volition).
% People are likely to seek friendships with individuals they perceive as strong when their existing friends have
rule_active(people_are_likely_to_seek_friendships_with_individuals_they_perceive_as_strong_when_their_existing_friends_have).
rule_category(people_are_likely_to_seek_friendships_with_individuals_they_perceive_as_strong_when_their_existing_friends_have, friendship_alliance).
rule_source(people_are_likely_to_seek_friendships_with_individuals_they_perceive_as_strong_when_their_existing_friends_have, ensemble).
rule_priority(people_are_likely_to_seek_friendships_with_individuals_they_perceive_as_strong_when_their_existing_friends_have, 1).
rule_applies(people_are_likely_to_seek_friendships_with_individuals_they_perceive_as_strong_when_their_existing_friends_have, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, nice).
rule_effect(people_are_likely_to_seek_friendships_with_individuals_they_perceive_as_strong_when_their_existing_friends_have, set_intent(X, kind, Y, 1)).

rule_likelihood(people_seek_to_form_new_friendships_with_individuals_who_are_perceived_as_stronger_within_a_short_time, 1).
rule_type(people_seek_to_form_new_friendships_with_individuals_who_are_perceived_as_stronger_within_a_short_time, volition).
% People seek to form new friendships with individuals who are perceived as stronger within a short time
rule_active(people_seek_to_form_new_friendships_with_individuals_who_are_perceived_as_stronger_within_a_short_time).
rule_category(people_seek_to_form_new_friendships_with_individuals_who_are_perceived_as_stronger_within_a_short_time, friendship_alliance).
rule_source(people_seek_to_form_new_friendships_with_individuals_who_are_perceived_as_stronger_within_a_short_time, ensemble).
rule_priority(people_seek_to_form_new_friendships_with_individuals_who_are_perceived_as_stronger_within_a_short_time, 1).
rule_applies(people_seek_to_form_new_friendships_with_individuals_who_are_perceived_as_stronger_within_a_short_time, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, mean).
rule_effect(people_seek_to_form_new_friendships_with_individuals_who_are_perceived_as_stronger_within_a_short_time, set_intent(X, kind, Y, -1)).

rule_likelihood(people_are_influenced_to_form_closer_friendships_with_individuals_perceived_as_stronger_than_themselves, 1).
rule_type(people_are_influenced_to_form_closer_friendships_with_individuals_perceived_as_stronger_than_themselves, volition).
% People are influenced to form closer friendships with individuals perceived as stronger than themselves.
rule_active(people_are_influenced_to_form_closer_friendships_with_individuals_perceived_as_stronger_than_themselves).
rule_category(people_are_influenced_to_form_closer_friendships_with_individuals_perceived_as_stronger_than_themselves, friendship_alliance).
rule_source(people_are_influenced_to_form_closer_friendships_with_individuals_perceived_as_stronger_than_themselves, ensemble).
rule_priority(people_are_influenced_to_form_closer_friendships_with_individuals_perceived_as_stronger_than_themselves, 1).
rule_applies(people_are_influenced_to_form_closer_friendships_with_individuals_perceived_as_stronger_than_themselves, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val > 6.
rule_effect(people_are_influenced_to_form_closer_friendships_with_individuals_perceived_as_stronger_than_themselves, set_intent(X, manipulate, Y, -2)).

rule_likelihood(people_are_influenced_to_form_friendships_with_individuals_perceived_as_stronger_when_the_difference_in_their_strength, 1).
rule_type(people_are_influenced_to_form_friendships_with_individuals_perceived_as_stronger_when_the_difference_in_their_strength, volition).
% People are influenced to form friendships with individuals perceived as stronger when the difference in their strength
rule_active(people_are_influenced_to_form_friendships_with_individuals_perceived_as_stronger_when_the_difference_in_their_strength).
rule_category(people_are_influenced_to_form_friendships_with_individuals_perceived_as_stronger_when_the_difference_in_their_strength, friendship_alliance).
rule_source(people_are_influenced_to_form_friendships_with_individuals_perceived_as_stronger_when_the_difference_in_their_strength, ensemble).
rule_priority(people_are_influenced_to_form_friendships_with_individuals_perceived_as_stronger_when_the_difference_in_their_strength, 1).
rule_applies(people_are_influenced_to_form_friendships_with_individuals_perceived_as_stronger_when_the_difference_in_their_strength, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val < 4.
rule_effect(people_are_influenced_to_form_friendships_with_individuals_perceived_as_stronger_when_the_difference_in_their_strength, set_intent(X, manipulate, Y, 2)).

rule_likelihood(people_have_a_strong_desire_to_form_friendships_with_individuals_who_are_more_popular_than_themselves, 1).
rule_type(people_have_a_strong_desire_to_form_friendships_with_individuals_who_are_more_popular_than_themselves, volition).
% People have a strong desire to form friendships with individuals who are more popular than themselves.
rule_active(people_have_a_strong_desire_to_form_friendships_with_individuals_who_are_more_popular_than_themselves).
rule_category(people_have_a_strong_desire_to_form_friendships_with_individuals_who_are_more_popular_than_themselves, friendship_alliance).
rule_source(people_have_a_strong_desire_to_form_friendships_with_individuals_who_are_more_popular_than_themselves, ensemble).
rule_priority(people_have_a_strong_desire_to_form_friendships_with_individuals_who_are_more_popular_than_themselves, 5).
rule_applies(people_have_a_strong_desire_to_form_friendships_with_individuals_who_are_more_popular_than_themselves, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val > 6.
rule_effect(people_have_a_strong_desire_to_form_friendships_with_individuals_who_are_more_popular_than_themselves, set_intent(X, trust, Y, 5)).

rule_likelihood(people_s_desire_to_trust_their_friends_increases_over_time_if_they_have_more_than_5_connections, 1).
rule_type(people_s_desire_to_trust_their_friends_increases_over_time_if_they_have_more_than_5_connections, volition).
% People’s desire to trust their friends increases over time if they have more than 5 connections
rule_active(people_s_desire_to_trust_their_friends_increases_over_time_if_they_have_more_than_5_connections).
rule_category(people_s_desire_to_trust_their_friends_increases_over_time_if_they_have_more_than_5_connections, friendship_alliance).
rule_source(people_s_desire_to_trust_their_friends_increases_over_time_if_they_have_more_than_5_connections, ensemble).
rule_priority(people_s_desire_to_trust_their_friends_increases_over_time_if_they_have_more_than_5_connections, 3).
rule_applies(people_s_desire_to_trust_their_friends_increases_over_time_if_they_have_more_than_5_connections, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, mean).
rule_effect(people_s_desire_to_trust_their_friends_increases_over_time_if_they_have_more_than_5_connections, set_intent(X, trust, Y, -3)).

rule_likelihood(people_seek_to_deepen_trust_with_friends_they_ve_been_close_for_over_30_days, 1).
rule_type(people_seek_to_deepen_trust_with_friends_they_ve_been_close_for_over_30_days, volition).
% People seek to deepen trust with friends they’ve been close for over 30 days
rule_active(people_seek_to_deepen_trust_with_friends_they_ve_been_close_for_over_30_days).
rule_category(people_seek_to_deepen_trust_with_friends_they_ve_been_close_for_over_30_days, friendship_alliance).
rule_source(people_seek_to_deepen_trust_with_friends_they_ve_been_close_for_over_30_days, ensemble).
rule_priority(people_seek_to_deepen_trust_with_friends_they_ve_been_close_for_over_30_days, 1).
rule_applies(people_seek_to_deepen_trust_with_friends_they_ve_been_close_for_over_30_days, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, mean).
rule_effect(people_seek_to_deepen_trust_with_friends_they_ve_been_close_for_over_30_days, set_intent(X, trust, Y, -1)).

rule_likelihood(you_are_more_likely_to_have_disdain_for_someone_you_are_not_friendly_towards, 1).
rule_type(you_are_more_likely_to_have_disdain_for_someone_you_are_not_friendly_towards, volition).
% You are more likely to have disdain for someone you are not friendly towards
rule_active(you_are_more_likely_to_have_disdain_for_someone_you_are_not_friendly_towards).
rule_category(you_are_more_likely_to_have_disdain_for_someone_you_are_not_friendly_towards, friendship_alliance).
rule_source(you_are_more_likely_to_have_disdain_for_someone_you_are_not_friendly_towards, ensemble).
rule_priority(you_are_more_likely_to_have_disdain_for_someone_you_are_not_friendly_towards, 1).
rule_applies(you_are_more_likely_to_have_disdain_for_someone_you_are_not_friendly_towards, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val < 3.
rule_effect(you_are_more_likely_to_have_disdain_for_someone_you_are_not_friendly_towards, set_intent(X, disdain, Y, 2)).

rule_likelihood(you_are_more_likely_to_be_friendly_towards_someone_you_have_high_friendship_with, 1).
rule_type(you_are_more_likely_to_be_friendly_towards_someone_you_have_high_friendship_with, volition).
% You are more likely to be friendly towards someone you have high friendship with
rule_active(you_are_more_likely_to_be_friendly_towards_someone_you_have_high_friendship_with).
rule_category(you_are_more_likely_to_be_friendly_towards_someone_you_have_high_friendship_with, friendship_alliance).
rule_source(you_are_more_likely_to_be_friendly_towards_someone_you_have_high_friendship_with, ensemble).
rule_priority(you_are_more_likely_to_be_friendly_towards_someone_you_have_high_friendship_with, 1).
rule_applies(you_are_more_likely_to_be_friendly_towards_someone_you_have_high_friendship_with, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val > 6.
rule_effect(you_are_more_likely_to_be_friendly_towards_someone_you_have_high_friendship_with, set_intent(X, befriend, Y, 2)).

rule_likelihood(if_you_are_happy_you_re_more_likely_to_be_friendly, 1).
rule_type(if_you_are_happy_you_re_more_likely_to_be_friendly, volition).
% If you are happy, you’re more likely to be friendly
rule_active(if_you_are_happy_you_re_more_likely_to_be_friendly).
rule_category(if_you_are_happy_you_re_more_likely_to_be_friendly, friendship_alliance).
rule_source(if_you_are_happy_you_re_more_likely_to_be_friendly, ensemble).
rule_priority(if_you_are_happy_you_re_more_likely_to_be_friendly, 1).
rule_applies(if_you_are_happy_you_re_more_likely_to_be_friendly, X, Y) :-
    attribute(X, happiness, Happiness_val), Happiness_val > 50.
rule_effect(if_you_are_happy_you_re_more_likely_to_be_friendly, set_intent(X, befriend, Y, 1)).

rule_likelihood(you_are_more_likely_to_be_humble_if_you_are_not_close_friends, 1).
rule_type(you_are_more_likely_to_be_humble_if_you_are_not_close_friends, volition).
% You are more likely to be humble if you are not close friends
rule_active(you_are_more_likely_to_be_humble_if_you_are_not_close_friends).
rule_category(you_are_more_likely_to_be_humble_if_you_are_not_close_friends, friendship_alliance).
rule_source(you_are_more_likely_to_be_humble_if_you_are_not_close_friends, ensemble).
rule_priority(you_are_more_likely_to_be_humble_if_you_are_not_close_friends, 1).
rule_applies(you_are_more_likely_to_be_humble_if_you_are_not_close_friends, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val < 4.
rule_effect(you_are_more_likely_to_be_humble_if_you_are_not_close_friends, set_intent(X, humble, Y, 1)).

rule_likelihood(you_are_more_likely_to_put_down_someone_you_are_not_friends_with, 1).
rule_type(you_are_more_likely_to_put_down_someone_you_are_not_friends_with, volition).
% You are more likely to put down someone you are not friends with
rule_active(you_are_more_likely_to_put_down_someone_you_are_not_friends_with).
rule_category(you_are_more_likely_to_put_down_someone_you_are_not_friends_with, friendship_alliance).
rule_source(you_are_more_likely_to_put_down_someone_you_are_not_friends_with, ensemble).
rule_priority(you_are_more_likely_to_put_down_someone_you_are_not_friends_with, 1).
rule_applies(you_are_more_likely_to_put_down_someone_you_are_not_friends_with, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val < 3.
rule_effect(you_are_more_likely_to_put_down_someone_you_are_not_friends_with, set_intent(X, putdown, Y, 2)).

rule_likelihood(people_aren_t_kind_to_people_they_are_not_friendly_with, 1).
rule_type(people_aren_t_kind_to_people_they_are_not_friendly_with, volition).
% People aren’t kind to people they are not friendly with
rule_active(people_aren_t_kind_to_people_they_are_not_friendly_with).
rule_category(people_aren_t_kind_to_people_they_are_not_friendly_with, friendship_alliance).
rule_source(people_aren_t_kind_to_people_they_are_not_friendly_with, ensemble).
rule_priority(people_aren_t_kind_to_people_they_are_not_friendly_with, 3).
rule_applies(people_aren_t_kind_to_people_they_are_not_friendly_with, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val < 4.
rule_effect(people_aren_t_kind_to_people_they_are_not_friendly_with, set_intent(X, kind, Y, -3)).

rule_likelihood(people_are_kind_to_people_they_have_high_friendly_feelings_for, 1).
rule_type(people_are_kind_to_people_they_have_high_friendly_feelings_for, volition).
% People are kind to people they have high friendly feelings for
rule_active(people_are_kind_to_people_they_have_high_friendly_feelings_for).
rule_category(people_are_kind_to_people_they_have_high_friendly_feelings_for, friendship_alliance).
rule_source(people_are_kind_to_people_they_have_high_friendly_feelings_for, ensemble).
rule_priority(people_are_kind_to_people_they_have_high_friendly_feelings_for, 3).
rule_applies(people_are_kind_to_people_they_have_high_friendly_feelings_for, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val > 7.
rule_effect(people_are_kind_to_people_they_have_high_friendly_feelings_for, set_intent(X, kind, Y, 3)).

rule_likelihood(friendly_people_are_kind, 1).
rule_type(friendly_people_are_kind, volition).
% Friendly people are kind
rule_active(friendly_people_are_kind).
rule_category(friendly_people_are_kind, friendship_alliance).
rule_source(friendly_people_are_kind, ensemble).
rule_priority(friendly_people_are_kind, 3).
rule_applies(friendly_people_are_kind, X, Y) :-
    trait(X, friendly).
rule_effect(friendly_people_are_kind, set_intent(X, kind, Y, 3)).

rule_likelihood(people_are_a_little_more_rude_to_people_they_don_t_feel_friendly_with, 1).
rule_type(people_are_a_little_more_rude_to_people_they_don_t_feel_friendly_with, volition).
% People are a little more rude to people they don’t feel friendly with
rule_active(people_are_a_little_more_rude_to_people_they_don_t_feel_friendly_with).
rule_category(people_are_a_little_more_rude_to_people_they_don_t_feel_friendly_with, friendship_alliance).
rule_source(people_are_a_little_more_rude_to_people_they_don_t_feel_friendly_with, ensemble).
rule_priority(people_are_a_little_more_rude_to_people_they_don_t_feel_friendly_with, 3).
rule_applies(people_are_a_little_more_rude_to_people_they_don_t_feel_friendly_with, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val < 4.
rule_effect(people_are_a_little_more_rude_to_people_they_don_t_feel_friendly_with, set_intent(X, rude, Y, 4)).

rule_likelihood(people_are_much_less_rude_to_they_that_they_have_friendly_feelings_towards, 1).
rule_type(people_are_much_less_rude_to_they_that_they_have_friendly_feelings_towards, volition).
% People are much less rude to they that they have friendly feelings towards
rule_active(people_are_much_less_rude_to_they_that_they_have_friendly_feelings_towards).
rule_category(people_are_much_less_rude_to_they_that_they_have_friendly_feelings_towards, friendship_alliance).
rule_source(people_are_much_less_rude_to_they_that_they_have_friendly_feelings_towards, ensemble).
rule_priority(people_are_much_less_rude_to_they_that_they_have_friendly_feelings_towards, 3).
rule_applies(people_are_much_less_rude_to_they_that_they_have_friendly_feelings_towards, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val > 7.
rule_effect(people_are_much_less_rude_to_they_that_they_have_friendly_feelings_towards, set_intent(X, rude, Y, -3)).

rule_likelihood(friendly_people_don_t_want_to_be_rude, 1).
rule_type(friendly_people_don_t_want_to_be_rude, volition).
% Friendly people don’t want to be rude
rule_active(friendly_people_don_t_want_to_be_rude).
rule_category(friendly_people_don_t_want_to_be_rude, friendship_alliance).
rule_source(friendly_people_don_t_want_to_be_rude, ensemble).
rule_priority(friendly_people_don_t_want_to_be_rude, 3).
rule_applies(friendly_people_don_t_want_to_be_rude, X, Y) :-
    trait(X, friendly).
rule_effect(friendly_people_don_t_want_to_be_rude, set_intent(X, rude, Y, -4)).

%% ═══════════════════════════════════════════════════════════
%% Category: gender-dynamics
%% ═══════════════════════════════════════════════════════════

%% Ensemble Volition Rules: gender-dynamics
%% Source: data/ensemble/volitionRules/gender-dynamics.json
%% Converted: 2026-04-02T20:09:49.732Z
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

%% ═══════════════════════════════════════════════════════════
%% Category: general
%% ═══════════════════════════════════════════════════════════

%% Ensemble Volition Rules: general
%% Source: data/ensemble/volitionRules/general.json
%% Converted: 2026-04-02T20:09:49.732Z
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

%% ═══════════════════════════════════════════════════════════
%% Category: idolization-envy
%% ═══════════════════════════════════════════════════════════

%% Ensemble Volition Rules: idolization-envy
%% Source: data/ensemble/volitionRules/idolization-envy.json
%% Converted: 2026-04-02T20:09:49.732Z
%% Total rules: 18

rule_likelihood(people_idolize_strong_individuals_but_may_not_necessarily_date_them_directly, 1).
rule_type(people_idolize_strong_individuals_but_may_not_necessarily_date_them_directly, volition).
% People idolize strong individuals but may not necessarily date them directly.
rule_active(people_idolize_strong_individuals_but_may_not_necessarily_date_them_directly).
rule_category(people_idolize_strong_individuals_but_may_not_necessarily_date_them_directly, idolization_envy).
rule_source(people_idolize_strong_individuals_but_may_not_necessarily_date_them_directly, ensemble).
rule_priority(people_idolize_strong_individuals_but_may_not_necessarily_date_them_directly, 1).
rule_applies(people_idolize_strong_individuals_but_may_not_necessarily_date_them_directly, X, Y) :-
    directed_status(X, Y, idolize).
rule_effect(people_idolize_strong_individuals_but_may_not_necessarily_date_them_directly, set_intent(X, candid, Y, -1)).

rule_likelihood(people_envy_stronger_individuals_and_seek_to_date_them, 1).
rule_type(people_envy_stronger_individuals_and_seek_to_date_them, volition).
% People envy stronger individuals and seek to date them.
rule_active(people_envy_stronger_individuals_and_seek_to_date_them).
rule_category(people_envy_stronger_individuals_and_seek_to_date_them, idolization_envy).
rule_source(people_envy_stronger_individuals_and_seek_to_date_them, ensemble).
rule_priority(people_envy_stronger_individuals_and_seek_to_date_them, 3).
rule_applies(people_envy_stronger_individuals_and_seek_to_date_them, X, Y) :-
    directed_status(X, Y, envy).
rule_effect(people_envy_stronger_individuals_and_seek_to_date_them, set_intent(X, candid, Y, -3)).

rule_likelihood(people_idolize_strong_individuals_and_are_interested_in_dating_their_crushes_who_also_hold, 1).
rule_type(people_idolize_strong_individuals_and_are_interested_in_dating_their_crushes_who_also_hold, volition).
% People idolize strong individuals and are interested in dating their crushes who also hold
rule_active(people_idolize_strong_individuals_and_are_interested_in_dating_their_crushes_who_also_hold).
rule_category(people_idolize_strong_individuals_and_are_interested_in_dating_their_crushes_who_also_hold, idolization_envy).
rule_source(people_idolize_strong_individuals_and_are_interested_in_dating_their_crushes_who_also_hold, ensemble).
rule_priority(people_idolize_strong_individuals_and_are_interested_in_dating_their_crushes_who_also_hold, 1).
rule_applies(people_idolize_strong_individuals_and_are_interested_in_dating_their_crushes_who_also_hold, X, Y) :-
    directed_status(X, 'z', idolize),
    directed_status(Y, 'z', idolize).
rule_effect(people_idolize_strong_individuals_and_are_interested_in_dating_their_crushes_who_also_hold, set_intent(X, candid, Y, 1)).

rule_likelihood(people_idolize_strong_individuals_and_develop_a_desire_to_honor_them, 1).
rule_type(people_idolize_strong_individuals_and_develop_a_desire_to_honor_them, volition).
% People idolize strong individuals and develop a desire to honor them.
rule_active(people_idolize_strong_individuals_and_develop_a_desire_to_honor_them).
rule_category(people_idolize_strong_individuals_and_develop_a_desire_to_honor_them, idolization_envy).
rule_source(people_idolize_strong_individuals_and_develop_a_desire_to_honor_them, ensemble).
rule_priority(people_idolize_strong_individuals_and_develop_a_desire_to_honor_them, 3).
rule_applies(people_idolize_strong_individuals_and_develop_a_desire_to_honor_them, X, Y) :-
    directed_status(X, Y, idolize).
rule_effect(people_idolize_strong_individuals_and_develop_a_desire_to_honor_them, set_intent(X, honor, Y, 3)).

rule_likelihood(people_envy_others_connections_with_strong_individuals_and_seek_to_form_similar_relationships, 1).
rule_type(people_envy_others_connections_with_strong_individuals_and_seek_to_form_similar_relationships, volition).
% People envy others’ connections with strong individuals and seek to form similar relationships.
rule_active(people_envy_others_connections_with_strong_individuals_and_seek_to_form_similar_relationships).
rule_category(people_envy_others_connections_with_strong_individuals_and_seek_to_form_similar_relationships, idolization_envy).
rule_source(people_envy_others_connections_with_strong_individuals_and_seek_to_form_similar_relationships, ensemble).
rule_priority(people_envy_others_connections_with_strong_individuals_and_seek_to_form_similar_relationships, 1).
rule_applies(people_envy_others_connections_with_strong_individuals_and_seek_to_form_similar_relationships, X, Y) :-
    directed_status(X, Y, envy).
rule_effect(people_envy_others_connections_with_strong_individuals_and_seek_to_form_similar_relationships, set_intent(X, honor, Y, -1)).

rule_likelihood(people_tend_to_idealize_those_they_are_attracted_to_or_wish_to_be_closer_to, 1).
rule_type(people_tend_to_idealize_those_they_are_attracted_to_or_wish_to_be_closer_to, volition).
% People tend to idealize those they are attracted to or wish to be closer to.
rule_active(people_tend_to_idealize_those_they_are_attracted_to_or_wish_to_be_closer_to).
rule_category(people_tend_to_idealize_those_they_are_attracted_to_or_wish_to_be_closer_to, idolization_envy).
rule_source(people_tend_to_idealize_those_they_are_attracted_to_or_wish_to_be_closer_to, ensemble).
rule_priority(people_tend_to_idealize_those_they_are_attracted_to_or_wish_to_be_closer_to, 1).
rule_applies(people_tend_to_idealize_those_they_are_attracted_to_or_wish_to_be_closer_to, X, Y) :-
    directed_status(X, Y, feuding).
rule_effect(people_tend_to_idealize_those_they_are_attracted_to_or_wish_to_be_closer_to, set_intent(X, idealize, Y, -1)).

rule_likelihood(people_idolizing_someone_increases_their_idealization_of_that_person, 1).
rule_type(people_idolizing_someone_increases_their_idealization_of_that_person, volition).
% People idolizing someone increases their idealization of that person.
rule_active(people_idolizing_someone_increases_their_idealization_of_that_person).
rule_category(people_idolizing_someone_increases_their_idealization_of_that_person, idolization_envy).
rule_source(people_idolizing_someone_increases_their_idealization_of_that_person, ensemble).
rule_priority(people_idolizing_someone_increases_their_idealization_of_that_person, 3).
rule_applies(people_idolizing_someone_increases_their_idealization_of_that_person, X, Y) :-
    directed_status(X, Y, idolize).
rule_effect(people_idolizing_someone_increases_their_idealization_of_that_person, set_intent(X, idealize, Y, 3)).

rule_likelihood(people_tend_to_idealize_those_they_fear, 1).
rule_type(people_tend_to_idealize_those_they_fear, volition).
% People tend to idealize those they fear.
rule_active(people_tend_to_idealize_those_they_fear).
rule_category(people_tend_to_idealize_those_they_fear, idolization_envy).
rule_source(people_tend_to_idealize_those_they_fear, ensemble).
rule_priority(people_tend_to_idealize_those_they_fear, 1).
rule_applies(people_tend_to_idealize_those_they_fear, X, Y) :-
    status(X, fearful).
rule_effect(people_tend_to_idealize_those_they_fear, set_intent(X, idealize, Y, -1)).

rule_likelihood(people_envy_and_idealize_strong_individuals, 1).
rule_type(people_envy_and_idealize_strong_individuals, volition).
% People envy and idealize strong individuals.
rule_active(people_envy_and_idealize_strong_individuals).
rule_category(people_envy_and_idealize_strong_individuals, idolization_envy).
rule_source(people_envy_and_idealize_strong_individuals, ensemble).
rule_priority(people_envy_and_idealize_strong_individuals, 1).
rule_applies(people_envy_and_idealize_strong_individuals, X, Y) :-
    directed_status(X, Y, envy).
rule_effect(people_envy_and_idealize_strong_individuals, set_intent(X, idealize, Y, -1)).

rule_likelihood(people_are_afraid_of_weak_individuals_and_idealize_strong_people, 1).
rule_type(people_are_afraid_of_weak_individuals_and_idealize_strong_people, volition).
% People are afraid of weak individuals and idealize strong people.
rule_active(people_are_afraid_of_weak_individuals_and_idealize_strong_people).
rule_category(people_are_afraid_of_weak_individuals_and_idealize_strong_people, idolization_envy).
rule_source(people_are_afraid_of_weak_individuals_and_idealize_strong_people, ensemble).
rule_priority(people_are_afraid_of_weak_individuals_and_idealize_strong_people, 1).
rule_applies(people_are_afraid_of_weak_individuals_and_idealize_strong_people, X, Y) :-
    directed_status(X, Y, afraid_of).
rule_effect(people_are_afraid_of_weak_individuals_and_idealize_strong_people, set_intent(X, idealize, Y, -1)).

rule_likelihood(people_tend_to_idealize_individuals_with_high_altruism_levels, 1).
rule_type(people_tend_to_idealize_individuals_with_high_altruism_levels, volition).
% People tend to idealize individuals with high altruism levels.
rule_active(people_tend_to_idealize_individuals_with_high_altruism_levels).
rule_category(people_tend_to_idealize_individuals_with_high_altruism_levels, idolization_envy).
rule_source(people_tend_to_idealize_individuals_with_high_altruism_levels, ensemble).
rule_priority(people_tend_to_idealize_individuals_with_high_altruism_levels, 1).
rule_applies(people_tend_to_idealize_individuals_with_high_altruism_levels, X, Y) :-
    attribute(X, altruism, Altruism_val), Altruism_val < 7.
rule_effect(people_tend_to_idealize_individuals_with_high_altruism_levels, set_intent(X, idealize, Y, -2)).

rule_likelihood(people_idealize_strong_individuals_when_their_altruism_level_exceeds_a_threshold, 1).
rule_type(people_idealize_strong_individuals_when_their_altruism_level_exceeds_a_threshold, volition).
% People idealize strong individuals when their altruism level exceeds a threshold.
rule_active(people_idealize_strong_individuals_when_their_altruism_level_exceeds_a_threshold).
rule_category(people_idealize_strong_individuals_when_their_altruism_level_exceeds_a_threshold, idolization_envy).
rule_source(people_idealize_strong_individuals_when_their_altruism_level_exceeds_a_threshold, ensemble).
rule_priority(people_idealize_strong_individuals_when_their_altruism_level_exceeds_a_threshold, 1).
rule_applies(people_idealize_strong_individuals_when_their_altruism_level_exceeds_a_threshold, X, Y) :-
    attribute(X, altruism, Altruism_val), Altruism_val > 12.
rule_effect(people_idealize_strong_individuals_when_their_altruism_level_exceeds_a_threshold, set_intent(X, idealize, Y, 2)).

rule_likelihood(people_idealizing_others_to_enhance_their_self_image, 1).
rule_type(people_idealizing_others_to_enhance_their_self_image, volition).
% People idealizing others to enhance their self-image.
rule_active(people_idealizing_others_to_enhance_their_self_image).
rule_category(people_idealizing_others_to_enhance_their_self_image, idolization_envy).
rule_source(people_idealizing_others_to_enhance_their_self_image, ensemble).
rule_priority(people_idealizing_others_to_enhance_their_self_image, 3).
rule_applies(people_idealizing_others_to_enhance_their_self_image, X, Y) :-
    trait(X, selfish).
rule_effect(people_idealizing_others_to_enhance_their_self_image, set_intent(X, idealize, Y, -3)).

rule_likelihood(people_idolizing_both_person_x_and_y_leads_to_an_increased_desire_for_dating_their_cr, 1).
rule_type(people_idolizing_both_person_x_and_y_leads_to_an_increased_desire_for_dating_their_cr, volition).
% People idolizing both person X and Y leads to an increased desire for dating their cr
rule_active(people_idolizing_both_person_x_and_y_leads_to_an_increased_desire_for_dating_their_cr).
rule_category(people_idolizing_both_person_x_and_y_leads_to_an_increased_desire_for_dating_their_cr, idolization_envy).
rule_source(people_idolizing_both_person_x_and_y_leads_to_an_increased_desire_for_dating_their_cr, ensemble).
rule_priority(people_idolizing_both_person_x_and_y_leads_to_an_increased_desire_for_dating_their_cr, 3).
rule_applies(people_idolizing_both_person_x_and_y_leads_to_an_increased_desire_for_dating_their_cr, X, Y) :-
    directed_status(X, 'z', idolize),
    directed_status(Y, 'z', idolize).
rule_effect(people_idolizing_both_person_x_and_y_leads_to_an_increased_desire_for_dating_their_cr, set_intent(X, idealize, Y, 3)).

rule_likelihood(people_idolize_strong_individuals_and_seek_to_ingratiate_themselves_with_them, 1).
rule_type(people_idolize_strong_individuals_and_seek_to_ingratiate_themselves_with_them, volition).
% People idolize strong individuals and seek to ingratiate themselves with them.
rule_active(people_idolize_strong_individuals_and_seek_to_ingratiate_themselves_with_them).
rule_category(people_idolize_strong_individuals_and_seek_to_ingratiate_themselves_with_them, idolization_envy).
rule_source(people_idolize_strong_individuals_and_seek_to_ingratiate_themselves_with_them, ensemble).
rule_priority(people_idolize_strong_individuals_and_seek_to_ingratiate_themselves_with_them, 3).
rule_applies(people_idolize_strong_individuals_and_seek_to_ingratiate_themselves_with_them, X, Y) :-
    directed_status(X, Y, idolize).
rule_effect(people_idolize_strong_individuals_and_seek_to_ingratiate_themselves_with_them, set_intent(X, ingratiate, Y, 3)).

rule_likelihood(people_idolize_and_seek_companionship_with_strong_individuals, 1).
rule_type(people_idolize_and_seek_companionship_with_strong_individuals, volition).
% People idolize and seek companionship with strong individuals.
rule_active(people_idolize_and_seek_companionship_with_strong_individuals).
rule_category(people_idolize_and_seek_companionship_with_strong_individuals, idolization_envy).
rule_source(people_idolize_and_seek_companionship_with_strong_individuals, ensemble).
rule_priority(people_idolize_and_seek_companionship_with_strong_individuals, 1).
rule_applies(people_idolize_and_seek_companionship_with_strong_individuals, X, Y) :-
    directed_status(X, Y, idolize).
rule_effect(people_idolize_and_seek_companionship_with_strong_individuals, set_intent(X, kind, Y, 2)).

rule_likelihood(people_envy_others_strong_connections_and_attempt_to_manipulate_their_social_standing, 1).
rule_type(people_envy_others_strong_connections_and_attempt_to_manipulate_their_social_standing, volition).
% People envy others’ strong connections and attempt to manipulate their social standing.
rule_active(people_envy_others_strong_connections_and_attempt_to_manipulate_their_social_standing).
rule_category(people_envy_others_strong_connections_and_attempt_to_manipulate_their_social_standing, idolization_envy).
rule_source(people_envy_others_strong_connections_and_attempt_to_manipulate_their_social_standing, ensemble).
rule_priority(people_envy_others_strong_connections_and_attempt_to_manipulate_their_social_standing, 1).
rule_applies(people_envy_others_strong_connections_and_attempt_to_manipulate_their_social_standing, X, Y) :-
    directed_status(X, Y, envy).
rule_effect(people_envy_others_strong_connections_and_attempt_to_manipulate_their_social_standing, set_intent(X, manipulate, Y, 1)).

rule_likelihood(people_idolize_strong_individuals_and_develop_trust_towards_them, 1).
rule_type(people_idolize_strong_individuals_and_develop_trust_towards_them, volition).
% People idolize strong individuals and develop trust towards them.
rule_active(people_idolize_strong_individuals_and_develop_trust_towards_them).
rule_category(people_idolize_strong_individuals_and_develop_trust_towards_them, idolization_envy).
rule_source(people_idolize_strong_individuals_and_develop_trust_towards_them, ensemble).
rule_priority(people_idolize_strong_individuals_and_develop_trust_towards_them, 1).
rule_applies(people_idolize_strong_individuals_and_develop_trust_towards_them, X, Y) :-
    directed_status(X, Y, idolize).
rule_effect(people_idolize_strong_individuals_and_develop_trust_towards_them, set_intent(X, trust, Y, 1)).

%% ═══════════════════════════════════════════════════════════
%% Category: ingratiation-impression
%% ═══════════════════════════════════════════════════════════

%% Ensemble Volition Rules: ingratiation-impression
%% Source: data/ensemble/volitionRules/ingratiation-impression.json
%% Converted: 2026-04-02T20:09:49.732Z
%% Total rules: 37

rule_likelihood(poor_people_can_be_more_impressed_by_a_spectacle_of_faith_than_true_virtue, 1).
rule_type(poor_people_can_be_more_impressed_by_a_spectacle_of_faith_than_true_virtue, volition).
% Poor people can be more impressed by a spectacle of faith than true virtue
rule_active(poor_people_can_be_more_impressed_by_a_spectacle_of_faith_than_true_virtue).
rule_category(poor_people_can_be_more_impressed_by_a_spectacle_of_faith_than_true_virtue, ingratiation_impression).
rule_source(poor_people_can_be_more_impressed_by_a_spectacle_of_faith_than_true_virtue, ensemble).
rule_priority(poor_people_can_be_more_impressed_by_a_spectacle_of_faith_than_true_virtue, 3).
rule_applies(poor_people_can_be_more_impressed_by_a_spectacle_of_faith_than_true_virtue, X, Y) :-
    trait(X, clergy),
    trait(Y, poor),
    trait(X, hypocritical).
rule_effect(poor_people_can_be_more_impressed_by_a_spectacle_of_faith_than_true_virtue, modify_network(X, Y, emulation, '+', 3)).

rule_likelihood(children_may_be_positively_impressed_by_sensitive_caring_people, 1).
rule_type(children_may_be_positively_impressed_by_sensitive_caring_people, volition).
% Children may be positively impressed by sensitive, caring people
rule_active(children_may_be_positively_impressed_by_sensitive_caring_people).
rule_category(children_may_be_positively_impressed_by_sensitive_caring_people, ingratiation_impression).
rule_source(children_may_be_positively_impressed_by_sensitive_caring_people, ensemble).
rule_priority(children_may_be_positively_impressed_by_sensitive_caring_people, 3).
rule_applies(children_may_be_positively_impressed_by_sensitive_caring_people, X, Y) :-
    trait(X, child),
    \+ trait(Y, child),
    trait(Y, innocent_looking),
    attribute(Y, sensitiveness, Sensitiveness_val), Sensitiveness_val > 66,
    directed_status(Y, X, cares_for).
rule_effect(children_may_be_positively_impressed_by_sensitive_caring_people, set_relationship(X, Y, esteem, 3)).
rule_effect(children_may_be_positively_impressed_by_sensitive_caring_people, modify_network(Y, X, affinity, '+', 2)).
rule_effect(children_may_be_positively_impressed_by_sensitive_caring_people, modify_network(Y, X, emulation, '+', 3)).

rule_likelihood(charismatic_jokers_can_impress_groups_of_friends, 1).
rule_type(charismatic_jokers_can_impress_groups_of_friends, volition).
% Charismatic jokers can impress groups of friends
rule_active(charismatic_jokers_can_impress_groups_of_friends).
rule_category(charismatic_jokers_can_impress_groups_of_friends, ingratiation_impression).
rule_source(charismatic_jokers_can_impress_groups_of_friends, ensemble).
rule_priority(charismatic_jokers_can_impress_groups_of_friends, 5).
rule_applies(charismatic_jokers_can_impress_groups_of_friends, X, Y) :-
    trait(X, joker),
    attribute(X, charisma, Charisma_val), Charisma_val > 70,
    relationship(Y, 'z', friends).
rule_effect(charismatic_jokers_can_impress_groups_of_friends, modify_network(Y, X, affinity, '+', 5)).
rule_effect(charismatic_jokers_can_impress_groups_of_friends, modify_network('z', X, affinity, '+', 5)).

rule_likelihood(people_want_to_ingratiate_themselves_with_those_who_are_publicly_romantically_committed, 1).
rule_type(people_want_to_ingratiate_themselves_with_those_who_are_publicly_romantically_committed, volition).
% People want to ingratiate themselves with those who are publicly romantically committed
rule_active(people_want_to_ingratiate_themselves_with_those_who_are_publicly_romantically_committed).
rule_category(people_want_to_ingratiate_themselves_with_those_who_are_publicly_romantically_committed, ingratiation_impression).
rule_source(people_want_to_ingratiate_themselves_with_those_who_are_publicly_romantically_committed, ensemble).
rule_priority(people_want_to_ingratiate_themselves_with_those_who_are_publicly_romantically_committed, 1).
rule_applies(people_want_to_ingratiate_themselves_with_those_who_are_publicly_romantically_committed, X, Y) :-
    directed_status(X, Y, publicly_romantically_committed_to).
rule_effect(people_want_to_ingratiate_themselves_with_those_who_are_publicly_romantically_committed, set_intent(X, ingratiate, Y, 1)).

rule_likelihood(people_want_to_ingratiate_themselves_with_their_superiors, 1).
rule_type(people_want_to_ingratiate_themselves_with_their_superiors, volition).
% People want to ingratiate themselves with their superiors.
rule_active(people_want_to_ingratiate_themselves_with_their_superiors).
rule_category(people_want_to_ingratiate_themselves_with_their_superiors, ingratiation_impression).
rule_source(people_want_to_ingratiate_themselves_with_their_superiors, ensemble).
rule_priority(people_want_to_ingratiate_themselves_with_their_superiors, 1).
rule_applies(people_want_to_ingratiate_themselves_with_their_superiors, X, Y) :-
    directed_status(X, Y, is_boss_of).
rule_effect(people_want_to_ingratiate_themselves_with_their_superiors, set_intent(X, ingratiate, Y, 1)).

rule_likelihood(people_want_to_ingratiate_themselves_with_those_they_consider_rivals, 1).
rule_type(people_want_to_ingratiate_themselves_with_those_they_consider_rivals, volition).
% People want to ingratiate themselves with those they consider rivals.
rule_active(people_want_to_ingratiate_themselves_with_those_they_consider_rivals).
rule_category(people_want_to_ingratiate_themselves_with_those_they_consider_rivals, ingratiation_impression).
rule_source(people_want_to_ingratiate_themselves_with_those_they_consider_rivals, ensemble).
rule_priority(people_want_to_ingratiate_themselves_with_those_they_consider_rivals, 1).
rule_applies(people_want_to_ingratiate_themselves_with_those_they_consider_rivals, X, Y) :-
    directed_status(X, Y, rivals).
rule_effect(people_want_to_ingratiate_themselves_with_those_they_consider_rivals, set_intent(X, ingratiate, Y, -1)).

rule_likelihood(people_seek_to_ingratiate_themselves_with_those_they_respect_significantly, 1).
rule_type(people_seek_to_ingratiate_themselves_with_those_they_respect_significantly, volition).
% People seek to ingratiate themselves with those they respect significantly.
rule_active(people_seek_to_ingratiate_themselves_with_those_they_respect_significantly).
rule_category(people_seek_to_ingratiate_themselves_with_those_they_respect_significantly, ingratiation_impression).
rule_source(people_seek_to_ingratiate_themselves_with_those_they_respect_significantly, ensemble).
rule_priority(people_seek_to_ingratiate_themselves_with_those_they_respect_significantly, 1).
rule_applies(people_seek_to_ingratiate_themselves_with_those_they_respect_significantly, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val > 6.
rule_effect(people_seek_to_ingratiate_themselves_with_those_they_respect_significantly, set_intent(X, ingratiate, Y, 1)).

rule_likelihood(people_seek_to_ingratiate_themselves_with_those_they_respect_more_than_others, 1).
rule_type(people_seek_to_ingratiate_themselves_with_those_they_respect_more_than_others, volition).
% People seek to ingratiate themselves with those they respect more than others.
rule_active(people_seek_to_ingratiate_themselves_with_those_they_respect_more_than_others).
rule_category(people_seek_to_ingratiate_themselves_with_those_they_respect_more_than_others, ingratiation_impression).
rule_source(people_seek_to_ingratiate_themselves_with_those_they_respect_more_than_others, ensemble).
rule_priority(people_seek_to_ingratiate_themselves_with_those_they_respect_more_than_others, 1).
rule_applies(people_seek_to_ingratiate_themselves_with_those_they_respect_more_than_others, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val < 4.
rule_effect(people_seek_to_ingratiate_themselves_with_those_they_respect_more_than_others, set_intent(X, ingratiate, Y, -2)).

rule_likelihood(people_aim_to_ingratiate_themselves_with_individuals_of_strong_influence_when_they_feel_guilty, 1).
rule_type(people_aim_to_ingratiate_themselves_with_individuals_of_strong_influence_when_they_feel_guilty, volition).
% People aim to ingratiate themselves with individuals of strong influence when they feel guilty.
rule_active(people_aim_to_ingratiate_themselves_with_individuals_of_strong_influence_when_they_feel_guilty).
rule_category(people_aim_to_ingratiate_themselves_with_individuals_of_strong_influence_when_they_feel_guilty, ingratiation_impression).
rule_source(people_aim_to_ingratiate_themselves_with_individuals_of_strong_influence_when_they_feel_guilty, ensemble).
rule_priority(people_aim_to_ingratiate_themselves_with_individuals_of_strong_influence_when_they_feel_guilty, 1).
rule_applies(people_aim_to_ingratiate_themselves_with_individuals_of_strong_influence_when_they_feel_guilty, X, Y) :-
    status(X, guilty).
rule_effect(people_aim_to_ingratiate_themselves_with_individuals_of_strong_influence_when_they_feel_guilty, set_intent(X, ingratiate, Y, 2)).

rule_likelihood(people_with_a_fearful_status_seek_to_ingratiate_themselves_towards_others, 1).
rule_type(people_with_a_fearful_status_seek_to_ingratiate_themselves_towards_others, volition).
% People with a fearful status seek to ingratiate themselves towards others.
rule_active(people_with_a_fearful_status_seek_to_ingratiate_themselves_towards_others).
rule_category(people_with_a_fearful_status_seek_to_ingratiate_themselves_towards_others, ingratiation_impression).
rule_source(people_with_a_fearful_status_seek_to_ingratiate_themselves_towards_others, ensemble).
rule_priority(people_with_a_fearful_status_seek_to_ingratiate_themselves_towards_others, 1).
rule_applies(people_with_a_fearful_status_seek_to_ingratiate_themselves_towards_others, X, Y) :-
    status(X, fearful).
rule_effect(people_with_a_fearful_status_seek_to_ingratiate_themselves_towards_others, set_intent(X, ingratiate, Y, 2)).

rule_likelihood(people_who_are_afraid_of_someone_person_x_may_try_to_ingratiate_themselves_with, 1).
rule_type(people_who_are_afraid_of_someone_person_x_may_try_to_ingratiate_themselves_with, volition).
% People who are afraid of someone (Person x) may try to ingratiate themselves with
rule_active(people_who_are_afraid_of_someone_person_x_may_try_to_ingratiate_themselves_with).
rule_category(people_who_are_afraid_of_someone_person_x_may_try_to_ingratiate_themselves_with, ingratiation_impression).
rule_source(people_who_are_afraid_of_someone_person_x_may_try_to_ingratiate_themselves_with, ensemble).
rule_priority(people_who_are_afraid_of_someone_person_x_may_try_to_ingratiate_themselves_with, 1).
rule_applies(people_who_are_afraid_of_someone_person_x_may_try_to_ingratiate_themselves_with, X, Y) :-
    directed_status(X, Y, afraid_of).
rule_effect(people_who_are_afraid_of_someone_person_x_may_try_to_ingratiate_themselves_with, set_intent(X, ingratiate, Y, 2)).

rule_likelihood(people_seek_to_ingratiate_themselves_with_individuals_of_higher_honor_status, 1).
rule_type(people_seek_to_ingratiate_themselves_with_individuals_of_higher_honor_status, volition).
% People seek to ingratiate themselves with individuals of higher honor status.
rule_active(people_seek_to_ingratiate_themselves_with_individuals_of_higher_honor_status).
rule_category(people_seek_to_ingratiate_themselves_with_individuals_of_higher_honor_status, ingratiation_impression).
rule_source(people_seek_to_ingratiate_themselves_with_individuals_of_higher_honor_status, ensemble).
rule_priority(people_seek_to_ingratiate_themselves_with_individuals_of_higher_honor_status, 1).
rule_applies(people_seek_to_ingratiate_themselves_with_individuals_of_higher_honor_status, X, Y) :-
    attribute(X, honor, Honor_val), Honor_val < 7.
rule_effect(people_seek_to_ingratiate_themselves_with_individuals_of_higher_honor_status, set_intent(X, ingratiate, Y, 1)).

rule_likelihood(people_seek_to_ingratiate_themselves_with_individuals_of_high_charisma, 1).
rule_type(people_seek_to_ingratiate_themselves_with_individuals_of_high_charisma, volition).
% People seek to ingratiate themselves with individuals of high charisma.
rule_active(people_seek_to_ingratiate_themselves_with_individuals_of_high_charisma).
rule_category(people_seek_to_ingratiate_themselves_with_individuals_of_high_charisma, ingratiation_impression).
rule_source(people_seek_to_ingratiate_themselves_with_individuals_of_high_charisma, ensemble).
rule_priority(people_seek_to_ingratiate_themselves_with_individuals_of_high_charisma, 3).
rule_applies(people_seek_to_ingratiate_themselves_with_individuals_of_high_charisma, X, Y) :-
    attribute(X, charisma, Charisma_val), Charisma_val < 7.
rule_effect(people_seek_to_ingratiate_themselves_with_individuals_of_high_charisma, set_intent(X, ingratiate, Y, 3)).

rule_likelihood(people_s_positive_actions_towards_others_with_strong_characteristics_aim_to_ingratiate_themselves, 1).
rule_type(people_s_positive_actions_towards_others_with_strong_characteristics_aim_to_ingratiate_themselves, volition).
% People’s positive actions towards others with strong characteristics aim to ingratiate themselves.
rule_active(people_s_positive_actions_towards_others_with_strong_characteristics_aim_to_ingratiate_themselves).
rule_category(people_s_positive_actions_towards_others_with_strong_characteristics_aim_to_ingratiate_themselves, ingratiation_impression).
rule_source(people_s_positive_actions_towards_others_with_strong_characteristics_aim_to_ingratiate_themselves, ensemble).
rule_priority(people_s_positive_actions_towards_others_with_strong_characteristics_aim_to_ingratiate_themselves, 1).
rule_applies(people_s_positive_actions_towards_others_with_strong_characteristics_aim_to_ingratiate_themselves, X, Y) :-
    event(X, nice).
rule_effect(people_s_positive_actions_towards_others_with_strong_characteristics_aim_to_ingratiate_themselves, set_intent(X, ingratiate, Y, 1)).

rule_likelihood(people_seek_to_ingratiate_themselves_with_their_crush_by_becoming_public_friends_of_mutual, 1).
rule_type(people_seek_to_ingratiate_themselves_with_their_crush_by_becoming_public_friends_of_mutual, volition).
% People seek to ingratiate themselves with their crush by becoming public friends of mutual
rule_active(people_seek_to_ingratiate_themselves_with_their_crush_by_becoming_public_friends_of_mutual).
rule_category(people_seek_to_ingratiate_themselves_with_their_crush_by_becoming_public_friends_of_mutual, ingratiation_impression).
rule_source(people_seek_to_ingratiate_themselves_with_their_crush_by_becoming_public_friends_of_mutual, ensemble).
rule_priority(people_seek_to_ingratiate_themselves_with_their_crush_by_becoming_public_friends_of_mutual, 1).
rule_applies(people_seek_to_ingratiate_themselves_with_their_crush_by_becoming_public_friends_of_mutual, X, Y) :-
    directed_status(X, 'z', public_friends),
    directed_status(Y, 'z', public_friends).
rule_effect(people_seek_to_ingratiate_themselves_with_their_crush_by_becoming_public_friends_of_mutual, set_intent(X, ingratiate, Y, 2)).

rule_likelihood(people_seek_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_feelings_for, 1).
rule_type(people_seek_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_feelings_for, volition).
% People seek to ingratiate themselves with individuals they perceive as strong when their feelings for
rule_active(people_seek_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_feelings_for).
rule_category(people_seek_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_feelings_for, ingratiation_impression).
rule_source(people_seek_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_feelings_for, ensemble).
rule_priority(people_seek_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_feelings_for, 1).
rule_applies(people_seek_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_feelings_for, X, Y) :-
    network(X, 'z', antagonism, Antagonism_val), Antagonism_val > 6,
    event(Y, mean).
rule_effect(people_seek_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_feelings_for, set_intent(X, ingratiate, Y, 2)).

rule_likelihood(people_desire_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_social_network, 1).
rule_type(people_desire_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_social_network, volition).
% People desire to ingratiate themselves with individuals they perceive as strong when their social network
rule_active(people_desire_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_social_network).
rule_category(people_desire_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_social_network, ingratiation_impression).
rule_source(people_desire_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_social_network, ensemble).
rule_priority(people_desire_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_social_network, 1).
rule_applies(people_desire_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_social_network, X, Y) :-
    network(X, 'z', antagonism, Antagonism_val), Antagonism_val > 6,
    event(Y, mean).
rule_effect(people_desire_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_social_network, set_intent(X, ingratiate, Y, 1)).

rule_likelihood(people_worry_less_about_impressing_their_family, 1).
rule_type(people_worry_less_about_impressing_their_family, volition).
% People worry less about impressing their family
rule_active(people_worry_less_about_impressing_their_family).
rule_category(people_worry_less_about_impressing_their_family, ingratiation_impression).
rule_source(people_worry_less_about_impressing_their_family, ensemble).
rule_priority(people_worry_less_about_impressing_their_family, 1).
rule_applies(people_worry_less_about_impressing_their_family, X, Y) :-
    relationship(X, Y, family).
rule_effect(people_worry_less_about_impressing_their_family, set_intent(X, impress, Y, -2)).

rule_likelihood(people_want_to_impress_their_coworkers_a_little, 1).
rule_type(people_want_to_impress_their_coworkers_a_little, volition).
% People want to impress their coworkers a little
rule_active(people_want_to_impress_their_coworkers_a_little).
rule_category(people_want_to_impress_their_coworkers_a_little, ingratiation_impression).
rule_source(people_want_to_impress_their_coworkers_a_little, ensemble).
rule_priority(people_want_to_impress_their_coworkers_a_little, 1).
rule_applies(people_want_to_impress_their_coworkers_a_little, X, Y) :-
    relationship(X, Y, coworker).
rule_effect(people_want_to_impress_their_coworkers_a_little, set_intent(X, impress, Y, 1)).

rule_likelihood(people_want_to_impress_people_they_are_dating, 1).
rule_type(people_want_to_impress_people_they_are_dating, volition).
% People want to impress people they are dating
rule_active(people_want_to_impress_people_they_are_dating).
rule_category(people_want_to_impress_people_they_are_dating, ingratiation_impression).
rule_source(people_want_to_impress_people_they_are_dating, ensemble).
rule_priority(people_want_to_impress_people_they_are_dating, 3).
rule_applies(people_want_to_impress_people_they_are_dating, X, Y) :-
    relationship(X, Y, dating).
rule_effect(people_want_to_impress_people_they_are_dating, set_intent(X, impress, Y, 3)).

rule_likelihood(people_don_t_want_to_impress_people_they_don_t_have_friendly_feeling_towards, 1).
rule_type(people_don_t_want_to_impress_people_they_don_t_have_friendly_feeling_towards, volition).
% People don’t want to impress people they don’t have friendly feeling towards
rule_active(people_don_t_want_to_impress_people_they_don_t_have_friendly_feeling_towards).
rule_category(people_don_t_want_to_impress_people_they_don_t_have_friendly_feeling_towards, ingratiation_impression).
rule_source(people_don_t_want_to_impress_people_they_don_t_have_friendly_feeling_towards, ensemble).
rule_priority(people_don_t_want_to_impress_people_they_don_t_have_friendly_feeling_towards, 1).
rule_applies(people_don_t_want_to_impress_people_they_don_t_have_friendly_feeling_towards, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val < 4.
rule_effect(people_don_t_want_to_impress_people_they_don_t_have_friendly_feeling_towards, set_intent(X, impress, Y, -2)).

rule_likelihood(people_want_to_impress_people_they_have_very_friendly_feeling_towards, 1).
rule_type(people_want_to_impress_people_they_have_very_friendly_feeling_towards, volition).
% People want to impress people they have very friendly feeling towards
rule_active(people_want_to_impress_people_they_have_very_friendly_feeling_towards).
rule_category(people_want_to_impress_people_they_have_very_friendly_feeling_towards, ingratiation_impression).
rule_source(people_want_to_impress_people_they_have_very_friendly_feeling_towards, ensemble).
rule_priority(people_want_to_impress_people_they_have_very_friendly_feeling_towards, 1).
rule_applies(people_want_to_impress_people_they_have_very_friendly_feeling_towards, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val > 7.
rule_effect(people_want_to_impress_people_they_have_very_friendly_feeling_towards, set_intent(X, impress, Y, 1)).

rule_likelihood(people_very_much_want_to_impress_people_they_are_attracted_to, 1).
rule_type(people_very_much_want_to_impress_people_they_are_attracted_to, volition).
% People very much want to impress people they are attracted to
rule_active(people_very_much_want_to_impress_people_they_are_attracted_to).
rule_category(people_very_much_want_to_impress_people_they_are_attracted_to, ingratiation_impression).
rule_source(people_very_much_want_to_impress_people_they_are_attracted_to, ensemble).
rule_priority(people_very_much_want_to_impress_people_they_are_attracted_to, 5).
rule_applies(people_very_much_want_to_impress_people_they_are_attracted_to, X, Y) :-
    network(X, Y, attraction, Attraction_val), Attraction_val > 7.
rule_effect(people_very_much_want_to_impress_people_they_are_attracted_to, set_intent(X, impress, Y, 6)).

rule_likelihood(people_want_to_impress_people_they_are_a_little_attracted_to, 1).
rule_type(people_want_to_impress_people_they_are_a_little_attracted_to, volition).
% People want to impress people they are a little attracted to
rule_active(people_want_to_impress_people_they_are_a_little_attracted_to).
rule_category(people_want_to_impress_people_they_are_a_little_attracted_to, ingratiation_impression).
rule_source(people_want_to_impress_people_they_are_a_little_attracted_to, ensemble).
rule_priority(people_want_to_impress_people_they_are_a_little_attracted_to, 1).
rule_applies(people_want_to_impress_people_they_are_a_little_attracted_to, X, Y) :-
    network(X, Y, attraction, Attraction_val), Attraction_val > 3,
    network(X, Y, attraction, Attraction_val), Attraction_val < 8.
rule_effect(people_want_to_impress_people_they_are_a_little_attracted_to, set_intent(X, impress, Y, 2)).

rule_likelihood(people_very_much_want_to_impress_people_they_respect, 1).
rule_type(people_very_much_want_to_impress_people_they_respect, volition).
% People very much want to impress people they respect
rule_active(people_very_much_want_to_impress_people_they_respect).
rule_category(people_very_much_want_to_impress_people_they_respect, ingratiation_impression).
rule_source(people_very_much_want_to_impress_people_they_respect, ensemble).
rule_priority(people_very_much_want_to_impress_people_they_respect, 5).
rule_applies(people_very_much_want_to_impress_people_they_respect, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val > 7.
rule_effect(people_very_much_want_to_impress_people_they_respect, set_intent(X, impress, Y, 6)).

rule_likelihood(people_don_t_want_to_impress_people_they_don_t_respect, 1).
rule_type(people_don_t_want_to_impress_people_they_don_t_respect, volition).
% People don’t want to impress people they don’t respect
rule_active(people_don_t_want_to_impress_people_they_don_t_respect).
rule_category(people_don_t_want_to_impress_people_they_don_t_respect, ingratiation_impression).
rule_source(people_don_t_want_to_impress_people_they_don_t_respect, ensemble).
rule_priority(people_don_t_want_to_impress_people_they_don_t_respect, 3).
rule_applies(people_don_t_want_to_impress_people_they_don_t_respect, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val < 4.
rule_effect(people_don_t_want_to_impress_people_they_don_t_respect, set_intent(X, impress, Y, -4)).

rule_likelihood(shy_people_want_to_impress_people, 1).
rule_type(shy_people_want_to_impress_people, volition).
% Shy people want to impress people
rule_active(shy_people_want_to_impress_people).
rule_category(shy_people_want_to_impress_people, ingratiation_impression).
rule_source(shy_people_want_to_impress_people, ensemble).
rule_priority(shy_people_want_to_impress_people, 3).
rule_applies(shy_people_want_to_impress_people, X, Y) :-
    trait(X, shy).
rule_effect(shy_people_want_to_impress_people, set_intent(X, impress, Y, 3)).

rule_likelihood(a_loyal_employee_wants_to_impress_people, 1).
rule_type(a_loyal_employee_wants_to_impress_people, volition).
% A loyal employee wants to impress people
rule_active(a_loyal_employee_wants_to_impress_people).
rule_category(a_loyal_employee_wants_to_impress_people, ingratiation_impression).
rule_source(a_loyal_employee_wants_to_impress_people, ensemble).
rule_priority(a_loyal_employee_wants_to_impress_people, 3).
rule_applies(a_loyal_employee_wants_to_impress_people, X, Y) :-
    trait(X, employee),
    trait(X, loyal).
rule_effect(a_loyal_employee_wants_to_impress_people, set_intent(X, impress, Y, 4)).

rule_likelihood(employees_generally_don_t_care_about_impressing_people, 1).
rule_type(employees_generally_don_t_care_about_impressing_people, volition).
% Employees generally don’t care about impressing people
rule_active(employees_generally_don_t_care_about_impressing_people).
rule_category(employees_generally_don_t_care_about_impressing_people, ingratiation_impression).
rule_source(employees_generally_don_t_care_about_impressing_people, ensemble).
rule_priority(employees_generally_don_t_care_about_impressing_people, 1).
rule_applies(employees_generally_don_t_care_about_impressing_people, X, Y) :-
    trait(X, employee).
rule_effect(employees_generally_don_t_care_about_impressing_people, set_intent(X, impress, Y, -1)).

rule_likelihood(jerks_don_t_want_to_impress_people, 1).
rule_type(jerks_don_t_want_to_impress_people, volition).
% Jerks don’t want to impress people
rule_active(jerks_don_t_want_to_impress_people).
rule_category(jerks_don_t_want_to_impress_people, ingratiation_impression).
rule_source(jerks_don_t_want_to_impress_people, ensemble).
rule_priority(jerks_don_t_want_to_impress_people, 3).
rule_applies(jerks_don_t_want_to_impress_people, X, Y) :-
    trait(X, jerk).
rule_effect(jerks_don_t_want_to_impress_people, set_intent(X, impress, Y, -3)).

rule_likelihood(hangry_people_don_t_have_time_to_impress_people, 1).
rule_type(hangry_people_don_t_have_time_to_impress_people, volition).
% Hangry people don’t have time to impress people
rule_active(hangry_people_don_t_have_time_to_impress_people).
rule_category(hangry_people_don_t_have_time_to_impress_people, ingratiation_impression).
rule_source(hangry_people_don_t_have_time_to_impress_people, ensemble).
rule_priority(hangry_people_don_t_have_time_to_impress_people, 1).
rule_applies(hangry_people_don_t_have_time_to_impress_people, X, Y) :-
    status(X, hangry).
rule_effect(hangry_people_don_t_have_time_to_impress_people, set_intent(X, impress, Y, -2)).

rule_likelihood(employees_want_to_impress_their_boss, 1).
rule_type(employees_want_to_impress_their_boss, volition).
% Employees want to impress their boss
rule_active(employees_want_to_impress_their_boss).
rule_category(employees_want_to_impress_their_boss, ingratiation_impression).
rule_source(employees_want_to_impress_their_boss, ensemble).
rule_priority(employees_want_to_impress_their_boss, 5).
rule_applies(employees_want_to_impress_their_boss, X, Y) :-
    trait(X, employee),
    directed_status(Y, X, is_boss_of).
rule_effect(employees_want_to_impress_their_boss, set_intent(X, impress, Y, 6)).

rule_likelihood(bosses_care_a_lot_about_impressing_their_employees, 1).
rule_type(bosses_care_a_lot_about_impressing_their_employees, volition).
% Bosses care a lot about impressing their employees
rule_active(bosses_care_a_lot_about_impressing_their_employees).
rule_category(bosses_care_a_lot_about_impressing_their_employees, ingratiation_impression).
rule_source(bosses_care_a_lot_about_impressing_their_employees, ensemble).
rule_priority(bosses_care_a_lot_about_impressing_their_employees, 5).
rule_applies(bosses_care_a_lot_about_impressing_their_employees, X, Y) :-
    directed_status(X, Y, is_boss_of),
    trait(Y, employee).
rule_effect(bosses_care_a_lot_about_impressing_their_employees, set_intent(X, impress, Y, 7)).

rule_likelihood(people_don_t_want_to_impress_people_who_have_been_rude_to_them_recently, 1).
rule_type(people_don_t_want_to_impress_people_who_have_been_rude_to_them_recently, volition).
% People don’t want to impress people who have been rude to them recently
rule_active(people_don_t_want_to_impress_people_who_have_been_rude_to_them_recently).
rule_category(people_don_t_want_to_impress_people_who_have_been_rude_to_them_recently, ingratiation_impression).
rule_source(people_don_t_want_to_impress_people_who_have_been_rude_to_them_recently, ensemble).
rule_priority(people_don_t_want_to_impress_people_who_have_been_rude_to_them_recently, 1).
rule_applies(people_don_t_want_to_impress_people_who_have_been_rude_to_them_recently, X, Y) :-
    event(Y, rude).
rule_effect(people_don_t_want_to_impress_people_who_have_been_rude_to_them_recently, set_intent(X, impress, Y, -1)).

rule_likelihood(people_really_want_their_boss_to_be_impressed_with_them_if_they_respect_them, 1).
rule_type(people_really_want_their_boss_to_be_impressed_with_them_if_they_respect_them, volition).
% People really want their boss to be impressed with them if they respect them.
rule_active(people_really_want_their_boss_to_be_impressed_with_them_if_they_respect_them).
rule_category(people_really_want_their_boss_to_be_impressed_with_them_if_they_respect_them, ingratiation_impression).
rule_source(people_really_want_their_boss_to_be_impressed_with_them_if_they_respect_them, ensemble).
rule_priority(people_really_want_their_boss_to_be_impressed_with_them_if_they_respect_them, 3).
rule_applies(people_really_want_their_boss_to_be_impressed_with_them_if_they_respect_them, X, Y) :-
    directed_status(Y, X, is_boss_of),
    network(X, Y, respect, Respect_val), Respect_val > 3,
    network(X, Y, respect, Respect_val), Respect_val < 8.
rule_effect(people_really_want_their_boss_to_be_impressed_with_them_if_they_respect_them, set_intent(X, impress, Y, 4)).

rule_likelihood(people_want_to_impress_people_who_have_flirted_with_them_recently, 1).
rule_type(people_want_to_impress_people_who_have_flirted_with_them_recently, volition).
% People want to impress people who have flirted with them recently
rule_active(people_want_to_impress_people_who_have_flirted_with_them_recently).
rule_category(people_want_to_impress_people_who_have_flirted_with_them_recently, ingratiation_impression).
rule_source(people_want_to_impress_people_who_have_flirted_with_them_recently, ensemble).
rule_priority(people_want_to_impress_people_who_have_flirted_with_them_recently, 1).
rule_applies(people_want_to_impress_people_who_have_flirted_with_them_recently, X, Y) :-
    event(Y, flirted_with).
rule_effect(people_want_to_impress_people_who_have_flirted_with_them_recently, set_intent(X, impress, Y, 2)).

rule_likelihood(people_don_t_want_to_impress_people_who_have_embarrassed_themselves_recently, 1).
rule_type(people_don_t_want_to_impress_people_who_have_embarrassed_themselves_recently, volition).
% People don’t want to impress people who have embarrassed themselves recently
rule_active(people_don_t_want_to_impress_people_who_have_embarrassed_themselves_recently).
rule_category(people_don_t_want_to_impress_people_who_have_embarrassed_themselves_recently, ingratiation_impression).
rule_source(people_don_t_want_to_impress_people_who_have_embarrassed_themselves_recently, ensemble).
rule_priority(people_don_t_want_to_impress_people_who_have_embarrassed_themselves_recently, 3).
rule_applies(people_don_t_want_to_impress_people_who_have_embarrassed_themselves_recently, X, Y) :-
    event(Y, embarrassment),
    trait('z', anyone),
    trait(X, anyone).
rule_effect(people_don_t_want_to_impress_people_who_have_embarrassed_themselves_recently, set_intent(X, impress, Y, -3)).

%% ═══════════════════════════════════════════════════════════
%% Category: marriage-family
%% ═══════════════════════════════════════════════════════════

%% Ensemble Volition Rules: marriage-family
%% Source: data/ensemble/volitionRules/marriage-family.json
%% Converted: 2026-04-02T20:09:49.733Z
%% Total rules: 40

rule_likelihood(an_honest_married_woman_has_no_affinity_with_another_man, 1).
rule_type(an_honest_married_woman_has_no_affinity_with_another_man, volition).
% An honest married woman has no affinity with another man
rule_active(an_honest_married_woman_has_no_affinity_with_another_man).
rule_category(an_honest_married_woman_has_no_affinity_with_another_man, marriage_family).
rule_source(an_honest_married_woman_has_no_affinity_with_another_man, ensemble).
rule_priority(an_honest_married_woman_has_no_affinity_with_another_man, 5).
rule_applies(an_honest_married_woman_has_no_affinity_with_another_man, X, Y) :-
    trait(X, female),
    trait(X, honest),
    trait(Y, male),
    relationship(X, 'z', married),
    network(Y, X, affinity, Affinity_val), Affinity_val > 50.
rule_effect(an_honest_married_woman_has_no_affinity_with_another_man, modify_network(X, Y, affinity, '+', 5)).

rule_likelihood(a_sad_rich_person_can_inspire_sympathy, 1).
rule_type(a_sad_rich_person_can_inspire_sympathy, volition).
% A sad, rich person can inspire sympathy
rule_active(a_sad_rich_person_can_inspire_sympathy).
rule_category(a_sad_rich_person_can_inspire_sympathy, marriage_family).
rule_source(a_sad_rich_person_can_inspire_sympathy, ensemble).
rule_priority(a_sad_rich_person_can_inspire_sympathy, 5).
rule_applies(a_sad_rich_person_can_inspire_sympathy, X, Y) :-
    status(X, upset),
    trait(X, rich),
    trait(X, trustworthy),
    directed_status(Y, X, cares_for).
rule_effect(a_sad_rich_person_can_inspire_sympathy, modify_network(Y, X, affinity, '+', 5)).

rule_likelihood(an_unsophisticated_and_rude_police_officer_can_offend_rich_person, 1).
rule_type(an_unsophisticated_and_rude_police_officer_can_offend_rich_person, volition).
% An unsophisticated and rude police officer can offend rich person
rule_active(an_unsophisticated_and_rude_police_officer_can_offend_rich_person).
rule_category(an_unsophisticated_and_rude_police_officer_can_offend_rich_person, marriage_family).
rule_source(an_unsophisticated_and_rude_police_officer_can_offend_rich_person, ensemble).
rule_priority(an_unsophisticated_and_rude_police_officer_can_offend_rich_person, 5).
rule_applies(an_unsophisticated_and_rude_police_officer_can_offend_rich_person, X, Y) :-
    attribute(X, sophistication, Sophistication_val), Sophistication_val < 50,
    trait(X, police_officer),
    trait(Y, rich),
    directed_status(Y, X, offended_by),
    trait(X, boorish).
rule_effect(an_unsophisticated_and_rude_police_officer_can_offend_rich_person, modify_network(Y, X, affinity, '+', 5)).
rule_effect(an_unsophisticated_and_rude_police_officer_can_offend_rich_person, modify_network(Y, X, curiosity, '+', 5)).

rule_likelihood(a_suspicious_husband_with_an_honest_wife_can_become_a_rival_of_other_men, 1).
rule_type(a_suspicious_husband_with_an_honest_wife_can_become_a_rival_of_other_men, volition).
% A suspicious husband with an honest wife can become a rival of other men
rule_active(a_suspicious_husband_with_an_honest_wife_can_become_a_rival_of_other_men).
rule_category(a_suspicious_husband_with_an_honest_wife_can_become_a_rival_of_other_men, marriage_family).
rule_source(a_suspicious_husband_with_an_honest_wife_can_become_a_rival_of_other_men, ensemble).
rule_priority(a_suspicious_husband_with_an_honest_wife_can_become_a_rival_of_other_men, 5).
rule_applies(a_suspicious_husband_with_an_honest_wife_can_become_a_rival_of_other_men, X, Y) :-
    directed_status(X, Y, suspicious_of),
    relationship(X, 'z', married),
    trait(Y, intimidating),
    trait('z', beautiful),
    trait('z', female),
    trait('z', honest),
    network(Y, 'z', affinity, Affinity_val), Affinity_val > 70.
rule_effect(a_suspicious_husband_with_an_honest_wife_can_become_a_rival_of_other_men, set_relationship(X, Y, rivals, 5)).
rule_effect(a_suspicious_husband_with_an_honest_wife_can_become_a_rival_of_other_men, modify_network('z', Y, curiosity, '+', 5)).
rule_effect(a_suspicious_husband_with_an_honest_wife_can_become_a_rival_of_other_men, set_relationship(X, 'z', ally, 5)).

rule_likelihood(a_devout_person_s_severity_can_repel_vain_people, 1).
rule_type(a_devout_person_s_severity_can_repel_vain_people, volition).
% A devout person’s severity can repel vain people
rule_active(a_devout_person_s_severity_can_repel_vain_people).
rule_category(a_devout_person_s_severity_can_repel_vain_people, marriage_family).
rule_source(a_devout_person_s_severity_can_repel_vain_people, ensemble).
rule_priority(a_devout_person_s_severity_can_repel_vain_people, 3).
rule_applies(a_devout_person_s_severity_can_repel_vain_people, X, Y) :-
    \+ trait(X, devout),
    trait(X, vain),
    trait(Y, devout).
rule_effect(a_devout_person_s_severity_can_repel_vain_people, modify_network(X, Y, affinity, '-', 3)).

rule_likelihood(an_unsophisticated_person_wants_to_be_esteemed_by_rich_person, 1).
rule_type(an_unsophisticated_person_wants_to_be_esteemed_by_rich_person, volition).
% An unsophisticated person wants to be esteemed by rich person
rule_active(an_unsophisticated_person_wants_to_be_esteemed_by_rich_person).
rule_category(an_unsophisticated_person_wants_to_be_esteemed_by_rich_person, marriage_family).
rule_source(an_unsophisticated_person_wants_to_be_esteemed_by_rich_person, ensemble).
rule_priority(an_unsophisticated_person_wants_to_be_esteemed_by_rich_person, 5).
rule_applies(an_unsophisticated_person_wants_to_be_esteemed_by_rich_person, X, Y) :-
    attribute(X, sophistication, Sophistication_val), Sophistication_val < 50,
    directed_status(X, Y, esteems),
    trait(Y, rich).
rule_effect(an_unsophisticated_person_wants_to_be_esteemed_by_rich_person, modify_network(Y, X, affinity, '+', 5)).

rule_likelihood(a_financially_dependent_person_will_have_less_affinity_for_someone_resented_by_their_benefactor, 1).
rule_type(a_financially_dependent_person_will_have_less_affinity_for_someone_resented_by_their_benefactor, volition).
% A financially dependent person will have less affinity for someone resented by their benefactor
rule_active(a_financially_dependent_person_will_have_less_affinity_for_someone_resented_by_their_benefactor).
rule_category(a_financially_dependent_person_will_have_less_affinity_for_someone_resented_by_their_benefactor, marriage_family).
rule_source(a_financially_dependent_person_will_have_less_affinity_for_someone_resented_by_their_benefactor, ensemble).
rule_priority(a_financially_dependent_person_will_have_less_affinity_for_someone_resented_by_their_benefactor, 5).
rule_applies(a_financially_dependent_person_will_have_less_affinity_for_someone_resented_by_their_benefactor, X, Y) :-
    directed_status(X, Y, financially_dependent_on),
    directed_status(Y, 'z', resentful_of),
    directed_status(X, 'z', esteems),
    trait('z', disdainful),
    trait('z', hypocritical),
    trait(Y, deceptive).
rule_effect(a_financially_dependent_person_will_have_less_affinity_for_someone_resented_by_their_benefactor, modify_network(X, 'z', affinity, '-', 5)).

rule_likelihood(people_are_more_likely_to_ally_themselves_with_kind_person_of_similar_social_standing, 1).
rule_type(people_are_more_likely_to_ally_themselves_with_kind_person_of_similar_social_standing, volition).
% People are more likely to ally themselves with kind person of similar social standing
rule_active(people_are_more_likely_to_ally_themselves_with_kind_person_of_similar_social_standing).
rule_category(people_are_more_likely_to_ally_themselves_with_kind_person_of_similar_social_standing, marriage_family).
rule_source(people_are_more_likely_to_ally_themselves_with_kind_person_of_similar_social_standing, ensemble).
rule_priority(people_are_more_likely_to_ally_themselves_with_kind_person_of_similar_social_standing, 5).
rule_applies(people_are_more_likely_to_ally_themselves_with_kind_person_of_similar_social_standing, X, Y) :-
    attribute(Y, social_standing, Social_standing_val), Social_standing_val > 50,
    attribute(X, social_standing, Social_standing_val), Social_standing_val > 50,
    trait(Y, kind),
    directed_status(X, Y, trusts).
rule_effect(people_are_more_likely_to_ally_themselves_with_kind_person_of_similar_social_standing, set_relationship(X, Y, ally, 5)).

rule_likelihood(a_rich_charming_and_talkative_man_loves_a_pretty_attendeee_married_to_another_man, 1).
rule_type(a_rich_charming_and_talkative_man_loves_a_pretty_attendeee_married_to_another_man, volition).
% A rich, charming and talkative man loves a pretty attendeee married to another man 
rule_active(a_rich_charming_and_talkative_man_loves_a_pretty_attendeee_married_to_another_man).
rule_category(a_rich_charming_and_talkative_man_loves_a_pretty_attendeee_married_to_another_man, marriage_family).
rule_source(a_rich_charming_and_talkative_man_loves_a_pretty_attendeee_married_to_another_man, ensemble).
rule_priority(a_rich_charming_and_talkative_man_loves_a_pretty_attendeee_married_to_another_man, 5).
rule_applies(a_rich_charming_and_talkative_man_loves_a_pretty_attendeee_married_to_another_man, X, Y) :-
    trait(Y, male),
    trait(Y, rich),
    trait(Y, talkative),
    relationship(Y, X, lovers),
    relationship(X, 'z', married),
    trait(Y, charming),
    trait(X, beautiful),
    trait(X, attendee).
rule_effect(a_rich_charming_and_talkative_man_loves_a_pretty_attendeee_married_to_another_man, set_relationship(X, Y, ally, 5)).

rule_likelihood(rich_person_less_volition_to_increase_affinity_with_attendee_with_low_self_assurance, 1).
rule_type(rich_person_less_volition_to_increase_affinity_with_attendee_with_low_self_assurance, volition).
% rich person less volition to increase affinity with attendee with low self-assurance
rule_active(rich_person_less_volition_to_increase_affinity_with_attendee_with_low_self_assurance).
rule_category(rich_person_less_volition_to_increase_affinity_with_attendee_with_low_self_assurance, marriage_family).
rule_source(rich_person_less_volition_to_increase_affinity_with_attendee_with_low_self_assurance, ensemble).
rule_priority(rich_person_less_volition_to_increase_affinity_with_attendee_with_low_self_assurance, 3).
rule_applies(rich_person_less_volition_to_increase_affinity_with_attendee_with_low_self_assurance, X, Y) :-
    trait(Y, attendee),
    attribute(Y, self_assuredness, Self_assuredness_val), Self_assuredness_val < 50,
    trait(X, rich).
rule_effect(rich_person_less_volition_to_increase_affinity_with_attendee_with_low_self_assurance, modify_network(X, Y, affinity, '-', 3)).

rule_likelihood(rich_person_lady_who_hates_her_provincial_husband_would_try_to_compromise_her_husband, 1).
rule_type(rich_person_lady_who_hates_her_provincial_husband_would_try_to_compromise_her_husband, volition).
% rich person lady who hates her provincial husband would try to compromise her husband
rule_active(rich_person_lady_who_hates_her_provincial_husband_would_try_to_compromise_her_husband).
rule_category(rich_person_lady_who_hates_her_provincial_husband_would_try_to_compromise_her_husband, marriage_family).
rule_source(rich_person_lady_who_hates_her_provincial_husband_would_try_to_compromise_her_husband, ensemble).
rule_priority(rich_person_lady_who_hates_her_provincial_husband_would_try_to_compromise_her_husband, 5).
rule_applies(rich_person_lady_who_hates_her_provincial_husband_would_try_to_compromise_her_husband, X, Y) :-
    trait(X, female),
    relationship(X, Y, married),
    directed_status(X, Y, financially_dependent_on),
    directed_status(X, Y, hates),
    \+ trait(X, provincial),
    trait(Y, provincial),
    attribute(X, social_standing, Social_standing_val), Social_standing_val > 66.
rule_effect(rich_person_lady_who_hates_her_provincial_husband_would_try_to_compromise_her_husband, modify_network(X, Y, affinity, '+', 2)).
rule_effect(rich_person_lady_who_hates_her_provincial_husband_would_try_to_compromise_her_husband, modify_network(X, Y, credibility, '+', 5)).

rule_likelihood(provincial_attendee_males_married_to_rich_person_women_have_less_affinity_with_provincial_attendee, 1).
rule_type(provincial_attendee_males_married_to_rich_person_women_have_less_affinity_with_provincial_attendee, volition).
% Provincial attendee males married to rich person women have less affinity with Provincial attendee
rule_active(provincial_attendee_males_married_to_rich_person_women_have_less_affinity_with_provincial_attendee).
rule_category(provincial_attendee_males_married_to_rich_person_women_have_less_affinity_with_provincial_attendee, marriage_family).
rule_source(provincial_attendee_males_married_to_rich_person_women_have_less_affinity_with_provincial_attendee, ensemble).
rule_priority(provincial_attendee_males_married_to_rich_person_women_have_less_affinity_with_provincial_attendee, 3).
rule_applies(provincial_attendee_males_married_to_rich_person_women_have_less_affinity_with_provincial_attendee, X, Y) :-
    trait(Y, attendee),
    trait(X, rich),
    trait(Y, male),
    trait(X, female),
    trait(Y, disdainful),
    trait(Y, provincial),
    relationship(Y, X, married),
    trait('z', attendee),
    trait('z', provincial),
    network('z', Y, affinity, Affinity_val), Affinity_val > 65.
rule_effect(provincial_attendee_males_married_to_rich_person_women_have_less_affinity_with_provincial_attendee, modify_network(Y, 'z', affinity, '+', 3)).
rule_effect(provincial_attendee_males_married_to_rich_person_women_have_less_affinity_with_provincial_attendee, modify_network(Y, 'z', emulation, '+', 3)).
rule_effect(provincial_attendee_males_married_to_rich_person_women_have_less_affinity_with_provincial_attendee, modify_network('z', Y, emulation, '+', 3)).

rule_likelihood(a_charismatic_and_elegantly_dressed_person_is_more_likely_to_draw_attention, 1).
rule_type(a_charismatic_and_elegantly_dressed_person_is_more_likely_to_draw_attention, volition).
% A charismatic and elegantly dressed person is more likely to draw attention
rule_active(a_charismatic_and_elegantly_dressed_person_is_more_likely_to_draw_attention).
rule_category(a_charismatic_and_elegantly_dressed_person_is_more_likely_to_draw_attention, marriage_family).
rule_source(a_charismatic_and_elegantly_dressed_person_is_more_likely_to_draw_attention, ensemble).
rule_priority(a_charismatic_and_elegantly_dressed_person_is_more_likely_to_draw_attention, 5).
rule_applies(a_charismatic_and_elegantly_dressed_person_is_more_likely_to_draw_attention, X, Y) :-
    attribute(X, charisma, Charisma_val), Charisma_val > 66,
    trait(Y, credulous),
    attribute(Y, social_standing, Social_standing_val), Social_standing_val > 66,
    trait(X, elegantly_dressed).
rule_effect(a_charismatic_and_elegantly_dressed_person_is_more_likely_to_draw_attention, modify_network(X, Y, curiosity, '+', 5)).

rule_likelihood(urbanite_children_have_less_affinity_for_their_provincial_parents, 1).
rule_type(urbanite_children_have_less_affinity_for_their_provincial_parents, volition).
% Urbanite children have less affinity for their provincial parents
rule_active(urbanite_children_have_less_affinity_for_their_provincial_parents).
rule_category(urbanite_children_have_less_affinity_for_their_provincial_parents, marriage_family).
rule_source(urbanite_children_have_less_affinity_for_their_provincial_parents, ensemble).
rule_priority(urbanite_children_have_less_affinity_for_their_provincial_parents, 3).
rule_applies(urbanite_children_have_less_affinity_for_their_provincial_parents, X, Y) :-
    trait(Y, intimidating),
    attribute(Y, self_assuredness, Self_assuredness_val), Self_assuredness_val > 60,
    attribute(Y, social_standing, Social_standing_val), Social_standing_val > 40,
    attribute(X, social_standing, Social_standing_val), Social_standing_val < 30,
    trait(X, merchant),
    trait(Y, disdainful),
    relationship(Y, X, ally),
    trait(Y, young),
    trait(X, old).
rule_effect(urbanite_children_have_less_affinity_for_their_provincial_parents, set_relationship(Y, X, ally, 3)).
rule_effect(urbanite_children_have_less_affinity_for_their_provincial_parents, modify_network(Y, X, emulation, '+', 3)).

rule_likelihood(provincial_attendee_males_married_to_a_rich_woman_have_less_affinity_with_other_provincial_attendees, 1).
rule_type(provincial_attendee_males_married_to_a_rich_woman_have_less_affinity_with_other_provincial_attendees, volition).
% Provincial attendee males married to a rich woman have less affinity with other provincial attendees
rule_active(provincial_attendee_males_married_to_a_rich_woman_have_less_affinity_with_other_provincial_attendees).
rule_category(provincial_attendee_males_married_to_a_rich_woman_have_less_affinity_with_other_provincial_attendees, marriage_family).
rule_source(provincial_attendee_males_married_to_a_rich_woman_have_less_affinity_with_other_provincial_attendees, ensemble).
rule_priority(provincial_attendee_males_married_to_a_rich_woman_have_less_affinity_with_other_provincial_attendees, 3).
rule_applies(provincial_attendee_males_married_to_a_rich_woman_have_less_affinity_with_other_provincial_attendees, X, Y) :-
    trait(Y, attendee),
    trait(X, rich),
    trait(Y, male),
    trait(X, female),
    trait(Y, disdainful),
    trait(Y, provincial),
    relationship(Y, X, married),
    trait('z', attendee),
    trait('z', provincial),
    network('z', Y, affinity, Affinity_val), Affinity_val > 65.
rule_effect(provincial_attendee_males_married_to_a_rich_woman_have_less_affinity_with_other_provincial_attendees, modify_network(Y, 'z', affinity, '+', 3)).
rule_effect(provincial_attendee_males_married_to_a_rich_woman_have_less_affinity_with_other_provincial_attendees, modify_network(Y, 'z', emulation, '+', 3)).

rule_likelihood(spineless_poor_husbands_let_their_ambitious_wives_walk_all_over_them, 1).
rule_type(spineless_poor_husbands_let_their_ambitious_wives_walk_all_over_them, volition).
% Spineless, poor husbands let their ambitious wives walk all over them
rule_active(spineless_poor_husbands_let_their_ambitious_wives_walk_all_over_them).
rule_category(spineless_poor_husbands_let_their_ambitious_wives_walk_all_over_them, marriage_family).
rule_source(spineless_poor_husbands_let_their_ambitious_wives_walk_all_over_them, ensemble).
rule_priority(spineless_poor_husbands_let_their_ambitious_wives_walk_all_over_them, 3).
rule_applies(spineless_poor_husbands_let_their_ambitious_wives_walk_all_over_them, X, Y) :-
    relationship(X, Y, married),
    trait(Y, female),
    trait(X, kind),
    trait(X, male),
    status(X, tired),
    \+ trait(X, rich),
    trait(Y, greedy),
    trait(Y, ambitious),
    \+ trait(Y, rich).
rule_effect(spineless_poor_husbands_let_their_ambitious_wives_walk_all_over_them, set_relationship(Y, X, esteem, -3)).
rule_effect(spineless_poor_husbands_let_their_ambitious_wives_walk_all_over_them, modify_network(Y, X, affinity, '-', 3)).

rule_likelihood(people_who_trust_another_person_are_less_likely_to_trust_those_distrusted_by_that_person, 1).
rule_type(people_who_trust_another_person_are_less_likely_to_trust_those_distrusted_by_that_person, volition).
% People who trust another person are less likely to trust those distrusted by that person
rule_active(people_who_trust_another_person_are_less_likely_to_trust_those_distrusted_by_that_person).
rule_category(people_who_trust_another_person_are_less_likely_to_trust_those_distrusted_by_that_person, marriage_family).
rule_source(people_who_trust_another_person_are_less_likely_to_trust_those_distrusted_by_that_person, ensemble).
rule_priority(people_who_trust_another_person_are_less_likely_to_trust_those_distrusted_by_that_person, 5).
rule_applies(people_who_trust_another_person_are_less_likely_to_trust_those_distrusted_by_that_person, X, Y) :-
    directed_status(X, 'z', hates),
    directed_status(Y, X, trusts),
    trait(X, deceptive),
    network(Y, 'z', affinity, Affinity_val), Affinity_val > 50.
rule_effect(people_who_trust_another_person_are_less_likely_to_trust_those_distrusted_by_that_person, modify_network(Y, 'z', affinity, '-', 5)).
rule_effect(people_who_trust_another_person_are_less_likely_to_trust_those_distrusted_by_that_person, modify_network(X, Y, credibility, '+', 5)).

rule_likelihood(a_foreign_person_may_draw_the_attention_of_others, 1).
rule_type(a_foreign_person_may_draw_the_attention_of_others, volition).
% A foreign person may draw the attention of others
rule_active(a_foreign_person_may_draw_the_attention_of_others).
rule_category(a_foreign_person_may_draw_the_attention_of_others, marriage_family).
rule_source(a_foreign_person_may_draw_the_attention_of_others, ensemble).
rule_priority(a_foreign_person_may_draw_the_attention_of_others, 3).
rule_applies(a_foreign_person_may_draw_the_attention_of_others, X, Y) :-
    trait(X, foreigner),
    \+ trait(Y, foreigner).
rule_effect(a_foreign_person_may_draw_the_attention_of_others, modify_network(Y, X, curiosity, '+', 3)).

rule_likelihood(unhappy_resentful_non_rich_people_married_to_other_non_rich_people_may_be_less_likely_to_esteem_their_spouse, 1).
rule_type(unhappy_resentful_non_rich_people_married_to_other_non_rich_people_may_be_less_likely_to_esteem_their_spouse, volition).
% Unhappy, resentful, non-rich people married to other non-rich people may be less likely to esteem their spouse
rule_active(unhappy_resentful_non_rich_people_married_to_other_non_rich_people_may_be_less_likely_to_esteem_their_spouse).
rule_category(unhappy_resentful_non_rich_people_married_to_other_non_rich_people_may_be_less_likely_to_esteem_their_spouse, marriage_family).
rule_source(unhappy_resentful_non_rich_people_married_to_other_non_rich_people_may_be_less_likely_to_esteem_their_spouse, ensemble).
rule_priority(unhappy_resentful_non_rich_people_married_to_other_non_rich_people_may_be_less_likely_to_esteem_their_spouse, 5).
rule_applies(unhappy_resentful_non_rich_people_married_to_other_non_rich_people_may_be_less_likely_to_esteem_their_spouse, X, Y) :-
    relationship(X, Y, married),
    trait(X, rich),
    \+ trait(Y, rich),
    \+ status(X, happy),
    \+ trait(X, rich),
    directed_status(X, Y, resentful_of).
rule_effect(unhappy_resentful_non_rich_people_married_to_other_non_rich_people_may_be_less_likely_to_esteem_their_spouse, set_relationship(X, Y, esteem, -5)).

rule_likelihood(two_people_with_a_high_affinity_for_a_third_person_may_become_rivals, 1).
rule_type(two_people_with_a_high_affinity_for_a_third_person_may_become_rivals, volition).
% Two people with a high affinity for a third person may become rivals
rule_active(two_people_with_a_high_affinity_for_a_third_person_may_become_rivals).
rule_category(two_people_with_a_high_affinity_for_a_third_person_may_become_rivals, marriage_family).
rule_source(two_people_with_a_high_affinity_for_a_third_person_may_become_rivals, ensemble).
rule_priority(two_people_with_a_high_affinity_for_a_third_person_may_become_rivals, 5).
rule_applies(two_people_with_a_high_affinity_for_a_third_person_may_become_rivals, X, Y) :-
    network(X, 'z', affinity, Affinity_val), Affinity_val > 80,
    network(Y, 'z', affinity, Affinity_val), Affinity_val > 80.
rule_effect(two_people_with_a_high_affinity_for_a_third_person_may_become_rivals, set_relationship(X, Y, rivals, 5)).
rule_effect(two_people_with_a_high_affinity_for_a_third_person_may_become_rivals, set_relationship(Y, X, rivals, 5)).

rule_likelihood(when_flattered_by_someone_they_trust_a_person_may_do_a_lot_to_please, 1).
rule_type(when_flattered_by_someone_they_trust_a_person_may_do_a_lot_to_please, volition).
% When flattered by someone they trust, a person may do a lot to please
rule_active(when_flattered_by_someone_they_trust_a_person_may_do_a_lot_to_please).
rule_category(when_flattered_by_someone_they_trust_a_person_may_do_a_lot_to_please, marriage_family).
rule_source(when_flattered_by_someone_they_trust_a_person_may_do_a_lot_to_please, ensemble).
rule_priority(when_flattered_by_someone_they_trust_a_person_may_do_a_lot_to_please, 5).
rule_applies(when_flattered_by_someone_they_trust_a_person_may_do_a_lot_to_please, X, Y) :-
    status(X, flattered),
    directed_status(X, Y, trusts).
rule_effect(when_flattered_by_someone_they_trust_a_person_may_do_a_lot_to_please, modify_network(X, Y, affinity, '+', 5)).

rule_likelihood(a_naive_woman_may_fail_to_recognize_when_her_husband_is_jealous_of_a_suitor, 1).
rule_type(a_naive_woman_may_fail_to_recognize_when_her_husband_is_jealous_of_a_suitor, volition).
% A naive woman may fail to recognize when her husband is jealous of a suitor
rule_active(a_naive_woman_may_fail_to_recognize_when_her_husband_is_jealous_of_a_suitor).
rule_category(a_naive_woman_may_fail_to_recognize_when_her_husband_is_jealous_of_a_suitor, marriage_family).
rule_source(a_naive_woman_may_fail_to_recognize_when_her_husband_is_jealous_of_a_suitor, ensemble).
rule_priority(a_naive_woman_may_fail_to_recognize_when_her_husband_is_jealous_of_a_suitor, 5).
rule_applies(a_naive_woman_may_fail_to_recognize_when_her_husband_is_jealous_of_a_suitor, X, Y) :-
    trait(X, female),
    trait(X, credulous),
    trait(Y, male),
    relationship(X, Y, married),
    relationship(Y, 'z', friends),
    trait('z', male),
    directed_status(Y, 'z', jealous_of).
rule_effect(a_naive_woman_may_fail_to_recognize_when_her_husband_is_jealous_of_a_suitor, modify_network(Y, X, affinity, '+', 5)).

rule_likelihood(a_rich_person_may_use_a_non_rich_person_to_gain_the_esteem_of_others, 1).
rule_type(a_rich_person_may_use_a_non_rich_person_to_gain_the_esteem_of_others, volition).
% A rich person may use a non-rich person to gain the esteem of others
rule_active(a_rich_person_may_use_a_non_rich_person_to_gain_the_esteem_of_others).
rule_category(a_rich_person_may_use_a_non_rich_person_to_gain_the_esteem_of_others, marriage_family).
rule_source(a_rich_person_may_use_a_non_rich_person_to_gain_the_esteem_of_others, ensemble).
rule_priority(a_rich_person_may_use_a_non_rich_person_to_gain_the_esteem_of_others, 5).
rule_applies(a_rich_person_may_use_a_non_rich_person_to_gain_the_esteem_of_others, X, Y) :-
    directed_status(X, Y, owes_a_favor_to),
    trait(Y, ambitious),
    trait(Y, rich),
    attribute(Y, social_standing, Social_standing_val), Social_standing_val > 70,
    relationship(X, 'z', friends),
    trait('z', rich),
    attribute('z', social_standing, Social_standing_val), Social_standing_val > 85,
    \+ trait(X, rich).
rule_effect(a_rich_person_may_use_a_non_rich_person_to_gain_the_esteem_of_others, set_relationship(Y, X, ally, 5)).
rule_effect(a_rich_person_may_use_a_non_rich_person_to_gain_the_esteem_of_others, modify_network(Y, X, curiosity, '+', 5)).
rule_effect(a_rich_person_may_use_a_non_rich_person_to_gain_the_esteem_of_others, set_relationship(Y, X, esteem, 5)).
rule_effect(a_rich_person_may_use_a_non_rich_person_to_gain_the_esteem_of_others, set_relationship(X, Y, esteem, -3)).

rule_likelihood(an_esteemed_self_assured_person_has_only_little_desire_to_increase_another_s_affinity, 1).
rule_type(an_esteemed_self_assured_person_has_only_little_desire_to_increase_another_s_affinity, volition).
% An esteemed, self-assured person has only little desire to increase another’s affinity
rule_active(an_esteemed_self_assured_person_has_only_little_desire_to_increase_another_s_affinity).
rule_category(an_esteemed_self_assured_person_has_only_little_desire_to_increase_another_s_affinity, marriage_family).
rule_source(an_esteemed_self_assured_person_has_only_little_desire_to_increase_another_s_affinity, ensemble).
rule_priority(an_esteemed_self_assured_person_has_only_little_desire_to_increase_another_s_affinity, 1).
rule_applies(an_esteemed_self_assured_person_has_only_little_desire_to_increase_another_s_affinity, X, Y) :-
    directed_status(X, Y, esteems),
    attribute(Y, self_assuredness, Self_assuredness_val), Self_assuredness_val > 70.
rule_effect(an_esteemed_self_assured_person_has_only_little_desire_to_increase_another_s_affinity, modify_network(Y, X, affinity, '+', 1)).

rule_likelihood(young_women_trust_honest_older_men_when_both_esteem_a_third_person, 1).
rule_type(young_women_trust_honest_older_men_when_both_esteem_a_third_person, volition).
% Young women trust honest, older men when both esteem a third person
rule_active(young_women_trust_honest_older_men_when_both_esteem_a_third_person).
rule_category(young_women_trust_honest_older_men_when_both_esteem_a_third_person, marriage_family).
rule_source(young_women_trust_honest_older_men_when_both_esteem_a_third_person, ensemble).
rule_priority(young_women_trust_honest_older_men_when_both_esteem_a_third_person, 5).
rule_applies(young_women_trust_honest_older_men_when_both_esteem_a_third_person, X, Y) :-
    trait(X, young),
    trait(X, female),
    directed_status(X, Y, trusts),
    trait(Y, honest),
    trait(Y, old),
    trait(Y, male),
    directed_status(X, 'z', esteems),
    directed_status(Y, 'z', esteems).
rule_effect(young_women_trust_honest_older_men_when_both_esteem_a_third_person, set_relationship(X, Y, ally, 5)).
rule_effect(young_women_trust_honest_older_men_when_both_esteem_a_third_person, modify_network(X, Y, curiosity, '+', 5)).

rule_likelihood(an_attendee_with_little_education_is_talkative_and_will_enjoy_the_company_of_a_talkative_person, 1).
rule_type(an_attendee_with_little_education_is_talkative_and_will_enjoy_the_company_of_a_talkative_person, volition).
% An attendee with little education is talkative and will enjoy the company of a talkative person
rule_active(an_attendee_with_little_education_is_talkative_and_will_enjoy_the_company_of_a_talkative_person).
rule_category(an_attendee_with_little_education_is_talkative_and_will_enjoy_the_company_of_a_talkative_person, marriage_family).
rule_source(an_attendee_with_little_education_is_talkative_and_will_enjoy_the_company_of_a_talkative_person, ensemble).
rule_priority(an_attendee_with_little_education_is_talkative_and_will_enjoy_the_company_of_a_talkative_person, 1).
rule_applies(an_attendee_with_little_education_is_talkative_and_will_enjoy_the_company_of_a_talkative_person, X, Y) :-
    trait(X, attendee),
    trait(X, female),
    trait(X, talkative),
    trait(Y, talkative).
rule_effect(an_attendee_with_little_education_is_talkative_and_will_enjoy_the_company_of_a_talkative_person, modify_network(X, Y, affinity, '+', 1)).

rule_likelihood(you_are_more_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them, 1).
rule_type(you_are_more_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them, volition).
% You are more likely to be reluctable to somebody if a family member has low trust toward them.
rule_active(you_are_more_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them).
rule_category(you_are_more_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them, marriage_family).
rule_source(you_are_more_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them, ensemble).
rule_priority(you_are_more_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them, 1).
rule_applies(you_are_more_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them, X, Y) :-
    network('z', Y, trust, Trust_val), Trust_val < 4,
    status(X, family),
    status('z', family).
rule_effect(you_are_more_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them, set_intent(X, reluctant, Y, 1)).

rule_likelihood(you_are_less_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them, 1).
rule_type(you_are_less_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them, volition).
% You are less likely to be reluctable to somebody if a family member has low trust toward them.
rule_active(you_are_less_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them).
rule_category(you_are_less_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them, marriage_family).
rule_source(you_are_less_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them, ensemble).
rule_priority(you_are_less_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them, 1).
rule_applies(you_are_less_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them, X, Y) :-
    network('z', Y, trust, Trust_val), Trust_val > 6,
    status(X, family),
    status('z', family).
rule_effect(you_are_less_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them, set_intent(X, reluctant, Y, -1)).

rule_likelihood(people_are_more_likely_to_deny_someone_something_if_that_person_has_been_rude, 1).
rule_type(people_are_more_likely_to_deny_someone_something_if_that_person_has_been_rude, volition).
% People are more likely to deny someone something if that person has been rude
rule_active(people_are_more_likely_to_deny_someone_something_if_that_person_has_been_rude).
rule_category(people_are_more_likely_to_deny_someone_something_if_that_person_has_been_rude, marriage_family).
rule_source(people_are_more_likely_to_deny_someone_something_if_that_person_has_been_rude, ensemble).
rule_priority(people_are_more_likely_to_deny_someone_something_if_that_person_has_been_rude, 8).
rule_applies(people_are_more_likely_to_deny_someone_something_if_that_person_has_been_rude, X, Y) :-
    event(Y, rude).
rule_effect(people_are_more_likely_to_deny_someone_something_if_that_person_has_been_rude, set_intent(X, deny, Y, 10)).

rule_likelihood(if_the_someone_is_negative_and_is_neutral_to_a_high_status_person_one_s_volition_for_dismiss_is_increased, 1).
rule_type(if_the_someone_is_negative_and_is_neutral_to_a_high_status_person_one_s_volition_for_dismiss_is_increased, volition).
% If the someone is negative and is neutral to a high status person, one’s volition for dismiss is increased
rule_active(if_the_someone_is_negative_and_is_neutral_to_a_high_status_person_one_s_volition_for_dismiss_is_increased).
rule_category(if_the_someone_is_negative_and_is_neutral_to_a_high_status_person_one_s_volition_for_dismiss_is_increased, marriage_family).
rule_source(if_the_someone_is_negative_and_is_neutral_to_a_high_status_person_one_s_volition_for_dismiss_is_increased, ensemble).
rule_priority(if_the_someone_is_negative_and_is_neutral_to_a_high_status_person_one_s_volition_for_dismiss_is_increased, 5).
rule_applies(if_the_someone_is_negative_and_is_neutral_to_a_high_status_person_one_s_volition_for_dismiss_is_increased, X, Y) :-
    event(X, negative),
    event(Y, neutral),
    attribute(X, status_individual, Status_individual_val), Status_individual_val > 50.
rule_effect(if_the_someone_is_negative_and_is_neutral_to_a_high_status_person_one_s_volition_for_dismiss_is_increased, set_intent(X, dismiss, Y, 5)).

rule_likelihood(if_you_negatively_greet_and_respectfully_requested_to_a_low_status_person_increase_dismiss_volition, 1).
rule_type(if_you_negatively_greet_and_respectfully_requested_to_a_low_status_person_increase_dismiss_volition, volition).
% If you negatively greet and respectfully requested to a low status person -> increase dismiss volition
rule_active(if_you_negatively_greet_and_respectfully_requested_to_a_low_status_person_increase_dismiss_volition).
rule_category(if_you_negatively_greet_and_respectfully_requested_to_a_low_status_person_increase_dismiss_volition, marriage_family).
rule_source(if_you_negatively_greet_and_respectfully_requested_to_a_low_status_person_increase_dismiss_volition, ensemble).
rule_priority(if_you_negatively_greet_and_respectfully_requested_to_a_low_status_person_increase_dismiss_volition, 5).
rule_applies(if_you_negatively_greet_and_respectfully_requested_to_a_low_status_person_increase_dismiss_volition, X, Y) :-
    event(X, negative),
    event(Y, respectful),
    attribute(X, status_individual, Status_individual_val), Status_individual_val < 51.
rule_effect(if_you_negatively_greet_and_respectfully_requested_to_a_low_status_person_increase_dismiss_volition, set_intent(X, dismiss, Y, 5)).

rule_likelihood(low_status_person_is_more_likely_to_be_hospitable_if_treated_informally, 1).
rule_type(low_status_person_is_more_likely_to_be_hospitable_if_treated_informally, volition).
% Low status person is more likely to be hospitable if treated informally
rule_active(low_status_person_is_more_likely_to_be_hospitable_if_treated_informally).
rule_category(low_status_person_is_more_likely_to_be_hospitable_if_treated_informally, marriage_family).
rule_source(low_status_person_is_more_likely_to_be_hospitable_if_treated_informally, ensemble).
rule_priority(low_status_person_is_more_likely_to_be_hospitable_if_treated_informally, 5).
rule_applies(low_status_person_is_more_likely_to_be_hospitable_if_treated_informally, X, Y) :-
    event(Y, informal),
    attribute(X, status_individual, Status_individual_val), Status_individual_val < 51.
rule_effect(low_status_person_is_more_likely_to_be_hospitable_if_treated_informally, set_intent(X, hospitable, Y, 5)).

rule_likelihood(a_high_status_person_is_more_hospitable_if_the_other_person_is_formal, 1).
rule_type(a_high_status_person_is_more_hospitable_if_the_other_person_is_formal, volition).
% A high status person is more hospitable if the other person is formal
rule_active(a_high_status_person_is_more_hospitable_if_the_other_person_is_formal).
rule_category(a_high_status_person_is_more_hospitable_if_the_other_person_is_formal, marriage_family).
rule_source(a_high_status_person_is_more_hospitable_if_the_other_person_is_formal, ensemble).
rule_priority(a_high_status_person_is_more_hospitable_if_the_other_person_is_formal, 5).
rule_applies(a_high_status_person_is_more_hospitable_if_the_other_person_is_formal, X, Y) :-
    attribute(X, status_individual, Status_individual_val), Status_individual_val > 50,
    event(Y, formal).
rule_effect(a_high_status_person_is_more_hospitable_if_the_other_person_is_formal, set_intent(X, hospitable, Y, 5)).

rule_likelihood(if_someone_is_positive_and_neutral_to_a_high_status_person_then_other_increases_volition_for_reluctance, 1).
rule_type(if_someone_is_positive_and_neutral_to_a_high_status_person_then_other_increases_volition_for_reluctance, volition).
% If someone is positive and neutral to a high status person then other increases volition for reluctance
rule_active(if_someone_is_positive_and_neutral_to_a_high_status_person_then_other_increases_volition_for_reluctance).
rule_category(if_someone_is_positive_and_neutral_to_a_high_status_person_then_other_increases_volition_for_reluctance, marriage_family).
rule_source(if_someone_is_positive_and_neutral_to_a_high_status_person_then_other_increases_volition_for_reluctance, ensemble).
rule_priority(if_someone_is_positive_and_neutral_to_a_high_status_person_then_other_increases_volition_for_reluctance, 5).
rule_applies(if_someone_is_positive_and_neutral_to_a_high_status_person_then_other_increases_volition_for_reluctance, X, Y) :-
    event(X, positive),
    event(Y, neutral),
    attribute(X, status_individual, Status_individual_val), Status_individual_val > 50.
rule_effect(if_someone_is_positive_and_neutral_to_a_high_status_person_then_other_increases_volition_for_reluctance, set_intent(X, reluctant, Y, 5)).

rule_likelihood(people_s_desire_to_get_closer_within_their_extended_family_network_diminishes_when_they_have_recently_experienced, 1).
rule_type(people_s_desire_to_get_closer_within_their_extended_family_network_diminishes_when_they_have_recently_experienced, volition).
% People’s desire to get closer within their extended family network diminishes when they have recently experienced
rule_active(people_s_desire_to_get_closer_within_their_extended_family_network_diminishes_when_they_have_recently_experienced).
rule_category(people_s_desire_to_get_closer_within_their_extended_family_network_diminishes_when_they_have_recently_experienced, marriage_family).
rule_source(people_s_desire_to_get_closer_within_their_extended_family_network_diminishes_when_they_have_recently_experienced, ensemble).
rule_priority(people_s_desire_to_get_closer_within_their_extended_family_network_diminishes_when_they_have_recently_experienced, 1).
rule_applies(people_s_desire_to_get_closer_within_their_extended_family_network_diminishes_when_they_have_recently_experienced, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, nice).
rule_effect(people_s_desire_to_get_closer_within_their_extended_family_network_diminishes_when_they_have_recently_experienced, set_intent(X, antagonize, Y, -1)).

rule_likelihood(people_tend_to_seek_stronger_connections_with_those_who_have_a_larger_social_network_within_the_same_family, 1).
rule_type(people_tend_to_seek_stronger_connections_with_those_who_have_a_larger_social_network_within_the_same_family, volition).
% People tend to seek stronger connections with those who have a larger social network within the same family.
rule_active(people_tend_to_seek_stronger_connections_with_those_who_have_a_larger_social_network_within_the_same_family).
rule_category(people_tend_to_seek_stronger_connections_with_those_who_have_a_larger_social_network_within_the_same_family, marriage_family).
rule_source(people_tend_to_seek_stronger_connections_with_those_who_have_a_larger_social_network_within_the_same_family, ensemble).
rule_priority(people_tend_to_seek_stronger_connections_with_those_who_have_a_larger_social_network_within_the_same_family, 1).
rule_applies(people_tend_to_seek_stronger_connections_with_those_who_have_a_larger_social_network_within_the_same_family, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, mean).
rule_effect(people_tend_to_seek_stronger_connections_with_those_who_have_a_larger_social_network_within_the_same_family, set_intent(X, favor, Y, -1)).

rule_likelihood(people_desire_to_trust_and_connect_with_both_of_their_closest_family_members, 1).
rule_type(people_desire_to_trust_and_connect_with_both_of_their_closest_family_members, volition).
% People desire to trust and connect with both of their closest family members.
rule_active(people_desire_to_trust_and_connect_with_both_of_their_closest_family_members).
rule_category(people_desire_to_trust_and_connect_with_both_of_their_closest_family_members, marriage_family).
rule_source(people_desire_to_trust_and_connect_with_both_of_their_closest_family_members, ensemble).
rule_priority(people_desire_to_trust_and_connect_with_both_of_their_closest_family_members, 1).
rule_applies(people_desire_to_trust_and_connect_with_both_of_their_closest_family_members, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    network(Y, 'z', familial, Familial_val), Familial_val > 6.
rule_effect(people_desire_to_trust_and_connect_with_both_of_their_closest_family_members, set_intent(X, trust, Y, 2)).

rule_likelihood(people_s_desire_to_get_closer_within_their_extended_family_network_and_having_a_long_standing_interest, 1).
rule_type(people_s_desire_to_get_closer_within_their_extended_family_network_and_having_a_long_standing_interest, volition).
% People’s desire to get closer within their extended family network and having a long-standing interest
rule_active(people_s_desire_to_get_closer_within_their_extended_family_network_and_having_a_long_standing_interest).
rule_category(people_s_desire_to_get_closer_within_their_extended_family_network_and_having_a_long_standing_interest, marriage_family).
rule_source(people_s_desire_to_get_closer_within_their_extended_family_network_and_having_a_long_standing_interest, ensemble).
rule_priority(people_s_desire_to_get_closer_within_their_extended_family_network_and_having_a_long_standing_interest, 1).
rule_applies(people_s_desire_to_get_closer_within_their_extended_family_network_and_having_a_long_standing_interest, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, mean).
rule_effect(people_s_desire_to_get_closer_within_their_extended_family_network_and_having_a_long_standing_interest, set_intent(X, trust, Y, -1)).

rule_likelihood(family_members_are_kind_to_one_another, 1).
rule_type(family_members_are_kind_to_one_another, volition).
% Family members are kind to one another
rule_active(family_members_are_kind_to_one_another).
rule_category(family_members_are_kind_to_one_another, marriage_family).
rule_source(family_members_are_kind_to_one_another, ensemble).
rule_priority(family_members_are_kind_to_one_another, 3).
rule_applies(family_members_are_kind_to_one_another, X, Y) :-
    relationship(X, Y, family).
rule_effect(family_members_are_kind_to_one_another, set_intent(X, kind, Y, 3)).

rule_likelihood(people_are_less_rude_to_their_family, 1).
rule_type(people_are_less_rude_to_their_family, volition).
% People are less rude to their family
rule_active(people_are_less_rude_to_their_family).
rule_category(people_are_less_rude_to_their_family, marriage_family).
rule_source(people_are_less_rude_to_their_family, ensemble).
rule_priority(people_are_less_rude_to_their_family, 3).
rule_applies(people_are_less_rude_to_their_family, X, Y) :-
    relationship(X, Y, family).
rule_effect(people_are_less_rude_to_their_family, set_intent(X, rude, Y, -3)).

%% ═══════════════════════════════════════════════════════════
%% Category: occupation-roles
%% ═══════════════════════════════════════════════════════════

%% Ensemble Volition Rules: occupation-roles
%% Source: data/ensemble/volitionRules/occupation-roles.json
%% Converted: 2026-04-02T20:09:49.733Z
%% Total rules: 10

rule_likelihood(a_worker_does_not_appreciate_being_underpaid, 1).
rule_type(a_worker_does_not_appreciate_being_underpaid, volition).
% A worker does not appreciate being underpaid
rule_active(a_worker_does_not_appreciate_being_underpaid).
rule_category(a_worker_does_not_appreciate_being_underpaid, occupation_roles).
rule_source(a_worker_does_not_appreciate_being_underpaid, ensemble).
rule_priority(a_worker_does_not_appreciate_being_underpaid, 5).
rule_applies(a_worker_does_not_appreciate_being_underpaid, X, Y) :-
    \+ trait(X, generous),
    trait(X, rich),
    trait(Y, stagehand),
    directed_status(Y, X, offended_by).
rule_effect(a_worker_does_not_appreciate_being_underpaid, modify_network(Y, X, affinity, '+', 5)).

rule_likelihood(young_male_police_officers_tend_to_engage_with_criminals, 1).
rule_type(young_male_police_officers_tend_to_engage_with_criminals, volition).
% Young male police officers tend to engage with criminals
rule_active(young_male_police_officers_tend_to_engage_with_criminals).
rule_category(young_male_police_officers_tend_to_engage_with_criminals, occupation_roles).
rule_source(young_male_police_officers_tend_to_engage_with_criminals, ensemble).
rule_priority(young_male_police_officers_tend_to_engage_with_criminals, 5).
rule_applies(young_male_police_officers_tend_to_engage_with_criminals, X, Y) :-
    trait(X, male),
    trait(X, police_officer),
    trait(Y, female),
    trait(Y, criminal).
rule_effect(young_male_police_officers_tend_to_engage_with_criminals, modify_network(X, Y, affinity, '+', 5)).

rule_likelihood(a_chatty_merchant_can_disgust_sophisticated_people, 1).
rule_type(a_chatty_merchant_can_disgust_sophisticated_people, volition).
% A chatty merchant can disgust sophisticated people
rule_active(a_chatty_merchant_can_disgust_sophisticated_people).
rule_category(a_chatty_merchant_can_disgust_sophisticated_people, occupation_roles).
rule_source(a_chatty_merchant_can_disgust_sophisticated_people, ensemble).
rule_priority(a_chatty_merchant_can_disgust_sophisticated_people, 8).
rule_applies(a_chatty_merchant_can_disgust_sophisticated_people, X, Y) :-
    trait(X, merchant),
    trait(X, honest),
    attribute(X, propriety, Propriety_val), Propriety_val < 40,
    attribute(Y, sophistication, Sophistication_val), Sophistication_val > 60,
    trait(X, talkative).
rule_effect(a_chatty_merchant_can_disgust_sophisticated_people, set_relationship(Y, X, esteem, 10)).

rule_likelihood(a_servant_is_cooperative_when_he_is_well_paid_by_a_generous_benefactor, 1).
rule_type(a_servant_is_cooperative_when_he_is_well_paid_by_a_generous_benefactor, volition).
% A servant is cooperative when he is well paid by a generous benefactor
rule_active(a_servant_is_cooperative_when_he_is_well_paid_by_a_generous_benefactor).
rule_category(a_servant_is_cooperative_when_he_is_well_paid_by_a_generous_benefactor, occupation_roles).
rule_source(a_servant_is_cooperative_when_he_is_well_paid_by_a_generous_benefactor, ensemble).
rule_priority(a_servant_is_cooperative_when_he_is_well_paid_by_a_generous_benefactor, 5).
rule_applies(a_servant_is_cooperative_when_he_is_well_paid_by_a_generous_benefactor, X, Y) :-
    directed_status(X, Y, financially_dependent_on),
    trait(X, stagehand),
    trait(Y, rich),
    trait(Y, generous).
rule_effect(a_servant_is_cooperative_when_he_is_well_paid_by_a_generous_benefactor, modify_network(X, Y, affinity, '+', 5)).

rule_likelihood(a_worker_does_not_want_to_engage_with_upset_and_inappropriate_employers, 1).
rule_type(a_worker_does_not_want_to_engage_with_upset_and_inappropriate_employers, volition).
% A worker does not want to engage with upset and inappropriate employers
rule_active(a_worker_does_not_want_to_engage_with_upset_and_inappropriate_employers).
rule_category(a_worker_does_not_want_to_engage_with_upset_and_inappropriate_employers, occupation_roles).
rule_source(a_worker_does_not_want_to_engage_with_upset_and_inappropriate_employers, ensemble).
rule_priority(a_worker_does_not_want_to_engage_with_upset_and_inappropriate_employers, 5).
rule_applies(a_worker_does_not_want_to_engage_with_upset_and_inappropriate_employers, X, Y) :-
    attribute(X, propriety, Propriety_val), Propriety_val < 50,
    trait(X, rich),
    status(X, upset),
    directed_status(Y, X, financially_dependent_on),
    trait(Y, stagehand).
rule_effect(a_worker_does_not_want_to_engage_with_upset_and_inappropriate_employers, modify_network(Y, X, curiosity, '+', 5)).

rule_likelihood(coworkers_are_a_little_kind_to_one_another, 1).
rule_type(coworkers_are_a_little_kind_to_one_another, volition).
% Coworkers are a little kind to one another
rule_active(coworkers_are_a_little_kind_to_one_another).
rule_category(coworkers_are_a_little_kind_to_one_another, occupation_roles).
rule_source(coworkers_are_a_little_kind_to_one_another, ensemble).
rule_priority(coworkers_are_a_little_kind_to_one_another, 1).
rule_applies(coworkers_are_a_little_kind_to_one_another, X, Y) :-
    relationship(X, Y, coworker).
rule_effect(coworkers_are_a_little_kind_to_one_another, set_intent(X, kind, Y, 1)).

rule_likelihood(employees_on_break_want_to_be_left_alone, 1).
rule_type(employees_on_break_want_to_be_left_alone, volition).
% Employees on break want to be left alone
rule_active(employees_on_break_want_to_be_left_alone).
rule_category(employees_on_break_want_to_be_left_alone, occupation_roles).
rule_source(employees_on_break_want_to_be_left_alone, ensemble).
rule_priority(employees_on_break_want_to_be_left_alone, 5).
rule_applies(employees_on_break_want_to_be_left_alone, X, Y) :-
    status(X, on_break),
    trait(X, employee),
    \+ trait(Y, employee).
rule_effect(employees_on_break_want_to_be_left_alone, set_intent(X, kind, Y, -6)).

rule_likelihood(bosses_are_kind_to_their_punctual_employees, 1).
rule_type(bosses_are_kind_to_their_punctual_employees, volition).
% Bosses are kind to their punctual employees
rule_active(bosses_are_kind_to_their_punctual_employees).
rule_category(bosses_are_kind_to_their_punctual_employees, occupation_roles).
rule_source(bosses_are_kind_to_their_punctual_employees, ensemble).
rule_priority(bosses_are_kind_to_their_punctual_employees, 8).
rule_applies(bosses_are_kind_to_their_punctual_employees, X, Y) :-
    directed_status(X, Y, is_boss_of),
    trait(X, punctual).
rule_effect(bosses_are_kind_to_their_punctual_employees, set_intent(X, kind, Y, 10)).

rule_likelihood(people_are_a_little_less_rude_to_their_coworkers, 1).
rule_type(people_are_a_little_less_rude_to_their_coworkers, volition).
% People are a little less rude to their coworkers
rule_active(people_are_a_little_less_rude_to_their_coworkers).
rule_category(people_are_a_little_less_rude_to_their_coworkers, occupation_roles).
rule_source(people_are_a_little_less_rude_to_their_coworkers, ensemble).
rule_priority(people_are_a_little_less_rude_to_their_coworkers, 1).
rule_applies(people_are_a_little_less_rude_to_their_coworkers, X, Y) :-
    relationship(X, Y, coworker).
rule_effect(people_are_a_little_less_rude_to_their_coworkers, set_intent(X, rude, Y, -1)).

rule_likelihood(employees_are_more_rude_to_non_employees_when_they_are_on_break, 1).
rule_type(employees_are_more_rude_to_non_employees_when_they_are_on_break, volition).
% Employees are more rude to non-employees when they are on break
rule_active(employees_are_more_rude_to_non_employees_when_they_are_on_break).
rule_category(employees_are_more_rude_to_non_employees_when_they_are_on_break, occupation_roles).
rule_source(employees_are_more_rude_to_non_employees_when_they_are_on_break, ensemble).
rule_priority(employees_are_more_rude_to_non_employees_when_they_are_on_break, 1).
rule_applies(employees_are_more_rude_to_non_employees_when_they_are_on_break, X, Y) :-
    status(X, on_break),
    trait(X, employee),
    \+ trait(Y, employee).
rule_effect(employees_are_more_rude_to_non_employees_when_they_are_on_break, set_intent(X, rude, Y, 2)).

%% ═══════════════════════════════════════════════════════════
%% Category: personality-traits
%% ═══════════════════════════════════════════════════════════

%% Ensemble Volition Rules: personality-traits
%% Source: data/ensemble/volitionRules/personality-traits.json
%% Converted: 2026-04-02T20:09:49.733Z
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

%% ═══════════════════════════════════════════════════════════
%% Category: protection-helping
%% ═══════════════════════════════════════════════════════════

%% Ensemble Volition Rules: protection-helping
%% Source: data/ensemble/volitionRules/protection-helping.json
%% Converted: 2026-04-02T20:09:49.733Z
%% Total rules: 12

rule_likelihood(seductive_men_help_or_flirt_with_clumsy_beautiful_women, 1).
rule_type(seductive_men_help_or_flirt_with_clumsy_beautiful_women, volition).
% Seductive men help or flirt with clumsy, beautiful women
rule_active(seductive_men_help_or_flirt_with_clumsy_beautiful_women).
rule_category(seductive_men_help_or_flirt_with_clumsy_beautiful_women, protection_helping).
rule_source(seductive_men_help_or_flirt_with_clumsy_beautiful_women, ensemble).
rule_priority(seductive_men_help_or_flirt_with_clumsy_beautiful_women, 1).
rule_applies(seductive_men_help_or_flirt_with_clumsy_beautiful_women, X, Y) :-
    trait(X, beautiful),
    trait(X, awkward),
    trait(X, female),
    trait(Y, male),
    trait(Y, flirtatious),
    attribute(Y, propriety, Propriety_val), Propriety_val > 50.
rule_effect(seductive_men_help_or_flirt_with_clumsy_beautiful_women, modify_network(Y, X, curiosity, '+', 2)).

rule_likelihood(a_sensitive_generous_person_is_more_likely_to_help_upset_not_virtuous_other_person, 1).
rule_type(a_sensitive_generous_person_is_more_likely_to_help_upset_not_virtuous_other_person, volition).
% A sensitive generous person is more likely to help upset not virtuous other person
rule_active(a_sensitive_generous_person_is_more_likely_to_help_upset_not_virtuous_other_person).
rule_category(a_sensitive_generous_person_is_more_likely_to_help_upset_not_virtuous_other_person, protection_helping).
rule_source(a_sensitive_generous_person_is_more_likely_to_help_upset_not_virtuous_other_person, ensemble).
rule_priority(a_sensitive_generous_person_is_more_likely_to_help_upset_not_virtuous_other_person, 5).
rule_applies(a_sensitive_generous_person_is_more_likely_to_help_upset_not_virtuous_other_person, X, Y) :-
    attribute(Y, sensitiveness, Sensitiveness_val), Sensitiveness_val > 60,
    status(X, upset),
    trait(X, young),
    trait(Y, generous),
    \+ trait(Y, young).
rule_effect(a_sensitive_generous_person_is_more_likely_to_help_upset_not_virtuous_other_person, modify_network(Y, X, affinity, '+', 3)).
rule_effect(a_sensitive_generous_person_is_more_likely_to_help_upset_not_virtuous_other_person, modify_network(X, Y, emulation, '+', 5)).

rule_likelihood(a_young_rich_personman_tends_to_help_a_wounded_and_inebriated_man, 1).
rule_type(a_young_rich_personman_tends_to_help_a_wounded_and_inebriated_man, volition).
% A young rich personman tends to help a wounded and inebriated man
rule_active(a_young_rich_personman_tends_to_help_a_wounded_and_inebriated_man).
rule_category(a_young_rich_personman_tends_to_help_a_wounded_and_inebriated_man, protection_helping).
rule_source(a_young_rich_personman_tends_to_help_a_wounded_and_inebriated_man, ensemble).
rule_priority(a_young_rich_personman_tends_to_help_a_wounded_and_inebriated_man, 1).
rule_applies(a_young_rich_personman_tends_to_help_a_wounded_and_inebriated_man, X, Y) :-
    trait(X, rich),
    status(Y, inebriated),
    attribute(X, sensitiveness, Sensitiveness_val), Sensitiveness_val > 60.
rule_effect(a_young_rich_personman_tends_to_help_a_wounded_and_inebriated_man, modify_network(Y, X, curiosity, '+', 2)).

rule_likelihood(young_nosy_cunning_first_responders_are_likely_to_help_young_rich_people_in_distress, 1).
rule_type(young_nosy_cunning_first_responders_are_likely_to_help_young_rich_people_in_distress, volition).
% Young, nosy, cunning, first responders are likely to help young, rich people in distress
rule_active(young_nosy_cunning_first_responders_are_likely_to_help_young_rich_people_in_distress).
rule_category(young_nosy_cunning_first_responders_are_likely_to_help_young_rich_people_in_distress, protection_helping).
rule_source(young_nosy_cunning_first_responders_are_likely_to_help_young_rich_people_in_distress, ensemble).
rule_priority(young_nosy_cunning_first_responders_are_likely_to_help_young_rich_people_in_distress, 5).
rule_applies(young_nosy_cunning_first_responders_are_likely_to_help_young_rich_people_in_distress, X, Y) :-
    trait(Y, male),
    attribute(Y, cunningness, Cunningness_val), Cunningness_val > 70,
    trait(Y, wearing_a_first_responder_uniform),
    attribute(Y, nosiness, Nosiness_val), Nosiness_val > 60,
    trait(X, male),
    trait(X, rich),
    directed_status(X, 'z', threatened_by),
    attribute(X, sophistication, Sophistication_val), Sophistication_val > 60,
    trait(Y, young),
    trait(X, young).
rule_effect(young_nosy_cunning_first_responders_are_likely_to_help_young_rich_people_in_distress, set_relationship(Y, X, ally, 5)).
rule_effect(young_nosy_cunning_first_responders_are_likely_to_help_young_rich_people_in_distress, set_relationship(Y, X, esteem, 5)).
rule_effect(young_nosy_cunning_first_responders_are_likely_to_help_young_rich_people_in_distress, set_relationship('z', Y, rivals, 5)).

rule_likelihood(people_who_care_for_each_other_may_protect_one_another, 1).
rule_type(people_who_care_for_each_other_may_protect_one_another, volition).
% People who care for each other may protect one another
rule_active(people_who_care_for_each_other_may_protect_one_another).
rule_category(people_who_care_for_each_other_may_protect_one_another, protection_helping).
rule_source(people_who_care_for_each_other_may_protect_one_another, ensemble).
rule_priority(people_who_care_for_each_other_may_protect_one_another, 5).
rule_applies(people_who_care_for_each_other_may_protect_one_another, X, Y) :-
    directed_status(X, Y, cares_for),
    directed_status(Y, 'z', threatened_by).
rule_effect(people_who_care_for_each_other_may_protect_one_another, set_relationship(X, Y, ally, 5)).

rule_likelihood(an_honest_person_may_help_a_sexually_harassed_girl, 1).
rule_type(an_honest_person_may_help_a_sexually_harassed_girl, volition).
% An honest person may help a sexually harassed girl
rule_active(an_honest_person_may_help_a_sexually_harassed_girl).
rule_category(an_honest_person_may_help_a_sexually_harassed_girl, protection_helping).
rule_source(an_honest_person_may_help_a_sexually_harassed_girl, ensemble).
rule_priority(an_honest_person_may_help_a_sexually_harassed_girl, 5).
rule_applies(an_honest_person_may_help_a_sexually_harassed_girl, X, Y) :-
    trait(X, honest),
    trait(X, attendee),
    directed_status(X, Y, cares_for),
    trait(Y, young),
    event(Y, harassed),
    trait(Y, female).
rule_effect(an_honest_person_may_help_a_sexually_harassed_girl, modify_network(X, Y, curiosity, '+', 5)).
rule_effect(an_honest_person_may_help_a_sexually_harassed_girl, modify_network(Y, X, affinity, '+', 5)).

rule_likelihood(people_may_fight_to_protect_their_friends_who_are_threatened_by_another, 1).
rule_type(people_may_fight_to_protect_their_friends_who_are_threatened_by_another, volition).
% People may fight to protect their friends who are threatened by another
rule_active(people_may_fight_to_protect_their_friends_who_are_threatened_by_another).
rule_category(people_may_fight_to_protect_their_friends_who_are_threatened_by_another, protection_helping).
rule_source(people_may_fight_to_protect_their_friends_who_are_threatened_by_another, ensemble).
rule_priority(people_may_fight_to_protect_their_friends_who_are_threatened_by_another, 5).
rule_applies(people_may_fight_to_protect_their_friends_who_are_threatened_by_another, X, Y) :-
    relationship(X, Y, friends),
    directed_status(Y, X, threatened_by).
rule_effect(people_may_fight_to_protect_their_friends_who_are_threatened_by_another, set_relationship(X, X, rivals, 5)).

rule_likelihood(a_woman_might_help_her_friend_s_lover, 1).
rule_type(a_woman_might_help_her_friend_s_lover, volition).
% A woman might help her friend’s lover
rule_active(a_woman_might_help_her_friend_s_lover).
rule_category(a_woman_might_help_her_friend_s_lover, protection_helping).
rule_source(a_woman_might_help_her_friend_s_lover, ensemble).
rule_priority(a_woman_might_help_her_friend_s_lover, 5).
rule_applies(a_woman_might_help_her_friend_s_lover, X, Y) :-
    relationship(X, Y, lovers),
    relationship(X, 'z', friends),
    trait(X, female),
    trait('z', female),
    trait(Y, male),
    network('z', Y, affinity, Affinity_val), Affinity_val > 50.
rule_effect(a_woman_might_help_her_friend_s_lover, modify_network('z', Y, affinity, '+', 3)).
rule_effect(a_woman_might_help_her_friend_s_lover, modify_network(Y, 'z', affinity, '+', 3)).
rule_effect(a_woman_might_help_her_friend_s_lover, set_relationship(Y, 'z', ally, 5)).
rule_effect(a_woman_might_help_her_friend_s_lover, set_relationship('z', Y, ally, 5)).

rule_likelihood(high_status_people_are_more_likely_to_be_helpful_if_you_recently_were_respectful_and_positive, 1).
rule_type(high_status_people_are_more_likely_to_be_helpful_if_you_recently_were_respectful_and_positive, volition).
% High status people are more likely to be helpful if you recently were respectful and positive
rule_active(high_status_people_are_more_likely_to_be_helpful_if_you_recently_were_respectful_and_positive).
rule_category(high_status_people_are_more_likely_to_be_helpful_if_you_recently_were_respectful_and_positive, protection_helping).
rule_source(high_status_people_are_more_likely_to_be_helpful_if_you_recently_were_respectful_and_positive, ensemble).
rule_priority(high_status_people_are_more_likely_to_be_helpful_if_you_recently_were_respectful_and_positive, 5).
rule_applies(high_status_people_are_more_likely_to_be_helpful_if_you_recently_were_respectful_and_positive, X, Y) :-
    event(Y, respectful),
    event(X, positive),
    attribute(X, status_individual, Status_individual_val), Status_individual_val > 50.
rule_effect(high_status_people_are_more_likely_to_be_helpful_if_you_recently_were_respectful_and_positive, set_intent(X, help, Y, 5)).

rule_likelihood(people_are_inclined_to_form_closer_bonds_with_individuals_they_have_helped_recently, 1).
rule_type(people_are_inclined_to_form_closer_bonds_with_individuals_they_have_helped_recently, volition).
% People are inclined to form closer bonds with individuals they have helped recently.
rule_active(people_are_inclined_to_form_closer_bonds_with_individuals_they_have_helped_recently).
rule_category(people_are_inclined_to_form_closer_bonds_with_individuals_they_have_helped_recently, protection_helping).
rule_source(people_are_inclined_to_form_closer_bonds_with_individuals_they_have_helped_recently, ensemble).
rule_priority(people_are_inclined_to_form_closer_bonds_with_individuals_they_have_helped_recently, 3).
rule_applies(people_are_inclined_to_form_closer_bonds_with_individuals_they_have_helped_recently, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(X, did_a_favor_for).
rule_effect(people_are_inclined_to_form_closer_bonds_with_individuals_they_have_helped_recently, set_intent(X, favor, Y, 3)).

rule_likelihood(people_want_to_honor_strong_individuals_they_ve_helped, 1).
rule_type(people_want_to_honor_strong_individuals_they_ve_helped, volition).
% People want to honor strong individuals they’ve helped.
rule_active(people_want_to_honor_strong_individuals_they_ve_helped).
rule_category(people_want_to_honor_strong_individuals_they_ve_helped, protection_helping).
rule_source(people_want_to_honor_strong_individuals_they_ve_helped, ensemble).
rule_priority(people_want_to_honor_strong_individuals_they_ve_helped, 1).
rule_applies(people_want_to_honor_strong_individuals_they_ve_helped, X, Y) :-
    event(X, did_a_favor_for).
rule_effect(people_want_to_honor_strong_individuals_they_ve_helped, set_intent(X, honor, Y, 1)).

rule_likelihood(people_with_a_strong_desire_for_connections_are_likely_to_form_friendships_when_they_have_helped_their_cr, 1).
rule_type(people_with_a_strong_desire_for_connections_are_likely_to_form_friendships_when_they_have_helped_their_cr, volition).
% People with a strong desire for connections are likely to form friendships when they have helped their cr
rule_active(people_with_a_strong_desire_for_connections_are_likely_to_form_friendships_when_they_have_helped_their_cr).
rule_category(people_with_a_strong_desire_for_connections_are_likely_to_form_friendships_when_they_have_helped_their_cr, protection_helping).
rule_source(people_with_a_strong_desire_for_connections_are_likely_to_form_friendships_when_they_have_helped_their_cr, ensemble).
rule_priority(people_with_a_strong_desire_for_connections_are_likely_to_form_friendships_when_they_have_helped_their_cr, 1).
rule_applies(people_with_a_strong_desire_for_connections_are_likely_to_form_friendships_when_they_have_helped_their_cr, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, did_a_favor_for).
rule_effect(people_with_a_strong_desire_for_connections_are_likely_to_form_friendships_when_they_have_helped_their_cr, set_intent(X, kind, Y, 1)).

%% ═══════════════════════════════════════════════════════════
%% Category: relationship-closeness
%% ═══════════════════════════════════════════════════════════

%% Ensemble Volition Rules: relationship-closeness
%% Source: data/ensemble/volitionRules/relationship-closeness.json
%% Converted: 2026-04-02T20:09:49.733Z
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

%% ═══════════════════════════════════════════════════════════
%% Category: reputation-esteem
%% ═══════════════════════════════════════════════════════════

%% Ensemble Volition Rules: reputation-esteem
%% Source: data/ensemble/volitionRules/reputation-esteem.json
%% Converted: 2026-04-02T20:09:49.733Z
%% Total rules: 20

rule_likelihood(humble_guys_like_increasing_respect_for_others, 1).
rule_type(humble_guys_like_increasing_respect_for_others, volition).
% Humble guys like increasing respect for others
rule_active(humble_guys_like_increasing_respect_for_others).
rule_category(humble_guys_like_increasing_respect_for_others, reputation_esteem).
rule_source(humble_guys_like_increasing_respect_for_others, ensemble).
rule_priority(humble_guys_like_increasing_respect_for_others, 5).
rule_applies(humble_guys_like_increasing_respect_for_others, X, Y) :-
    trait(X, humble).
rule_effect(humble_guys_like_increasing_respect_for_others, modify_network(X, Y, respect, '+', 5)).

rule_likelihood(proud_guys_don_t_like_increasing_respect_towards_others, 1).
rule_type(proud_guys_don_t_like_increasing_respect_towards_others, volition).
% Proud guys don’t like increasing respect towards others
rule_active(proud_guys_don_t_like_increasing_respect_towards_others).
rule_category(proud_guys_don_t_like_increasing_respect_towards_others, reputation_esteem).
rule_source(proud_guys_don_t_like_increasing_respect_towards_others, ensemble).
rule_priority(proud_guys_don_t_like_increasing_respect_towards_others, 5).
rule_applies(proud_guys_don_t_like_increasing_respect_towards_others, X, Y) :-
    trait(X, proud).
rule_effect(proud_guys_don_t_like_increasing_respect_towards_others, modify_network(X, Y, respect, '-', 5)).

rule_likelihood(an_old_urbanite_esteems_a_young_provincial_s_good_manners, 1).
rule_type(an_old_urbanite_esteems_a_young_provincial_s_good_manners, volition).
% An old urbanite esteems a young provincial’s good manners
rule_active(an_old_urbanite_esteems_a_young_provincial_s_good_manners).
rule_category(an_old_urbanite_esteems_a_young_provincial_s_good_manners, reputation_esteem).
rule_source(an_old_urbanite_esteems_a_young_provincial_s_good_manners, ensemble).
rule_priority(an_old_urbanite_esteems_a_young_provincial_s_good_manners, 5).
rule_applies(an_old_urbanite_esteems_a_young_provincial_s_good_manners, X, Y) :-
    trait(X, provincial),
    \+ trait(X, old),
    trait(Y, old),
    \+ trait(Y, provincial),
    attribute(X, propriety, Propriety_val), Propriety_val > 50.
rule_effect(an_old_urbanite_esteems_a_young_provincial_s_good_manners, modify_network(X, Y, affinity, '+', 5)).

rule_likelihood(a_poorly_dressed_man_inspires_despise, 1).
rule_type(a_poorly_dressed_man_inspires_despise, volition).
% A poorly dressed man inspires despise
rule_active(a_poorly_dressed_man_inspires_despise).
rule_category(a_poorly_dressed_man_inspires_despise, reputation_esteem).
rule_source(a_poorly_dressed_man_inspires_despise, ensemble).
rule_priority(a_poorly_dressed_man_inspires_despise, 5).
rule_applies(a_poorly_dressed_man_inspires_despise, X, Y) :-
    trait(X, poorly_dressed),
    trait(X, male).
rule_effect(a_poorly_dressed_man_inspires_despise, modify_network(Y, X, credibility, '+', 5)).
rule_effect(a_poorly_dressed_man_inspires_despise, modify_network(Y, X, affinity, '+', 5)).

rule_likelihood(devout_people_do_not_esteem_others, 1).
rule_type(devout_people_do_not_esteem_others, volition).
% Devout people do not esteem others
rule_active(devout_people_do_not_esteem_others).
rule_category(devout_people_do_not_esteem_others, reputation_esteem).
rule_source(devout_people_do_not_esteem_others, ensemble).
rule_priority(devout_people_do_not_esteem_others, 5).
rule_applies(devout_people_do_not_esteem_others, X, Y) :-
    trait(X, devout),
    \+ trait(Y, devout).
rule_effect(devout_people_do_not_esteem_others, set_relationship(X, Y, esteem, 2)).
rule_effect(devout_people_do_not_esteem_others, modify_network(X, Y, affinity, '+', 5)).

rule_likelihood(a_young_provincial_may_be_looked_upon_with_disdain_by_rich_peoeple, 1).
rule_type(a_young_provincial_may_be_looked_upon_with_disdain_by_rich_peoeple, volition).
% A young provincial may be looked upon with disdain by rich peoeple
rule_active(a_young_provincial_may_be_looked_upon_with_disdain_by_rich_peoeple).
rule_category(a_young_provincial_may_be_looked_upon_with_disdain_by_rich_peoeple, reputation_esteem).
rule_source(a_young_provincial_may_be_looked_upon_with_disdain_by_rich_peoeple, ensemble).
rule_priority(a_young_provincial_may_be_looked_upon_with_disdain_by_rich_peoeple, 8).
rule_applies(a_young_provincial_may_be_looked_upon_with_disdain_by_rich_peoeple, X, Y) :-
    attribute(X, social_standing, Social_standing_val), Social_standing_val > 66,
    attribute(X, social_standing, Social_standing_val), Social_standing_val < 33,
    trait(X, provincial),
    trait(X, rich),
    trait(X, young).
rule_effect(a_young_provincial_may_be_looked_upon_with_disdain_by_rich_peoeple, modify_network(X, X, credibility, '+', 3)).
rule_effect(a_young_provincial_may_be_looked_upon_with_disdain_by_rich_peoeple, modify_network(X, X, emulation, '+', 3)).
rule_effect(a_young_provincial_may_be_looked_upon_with_disdain_by_rich_peoeple, set_relationship(X, X, esteem, -10)).

rule_likelihood(disdainful_vain_rich_people_do_not_like_non_rich_people, 1).
rule_type(disdainful_vain_rich_people_do_not_like_non_rich_people, volition).
% Disdainful vain, rich, people do not like non-rich people
rule_active(disdainful_vain_rich_people_do_not_like_non_rich_people).
rule_category(disdainful_vain_rich_people_do_not_like_non_rich_people, reputation_esteem).
rule_source(disdainful_vain_rich_people_do_not_like_non_rich_people, ensemble).
rule_priority(disdainful_vain_rich_people_do_not_like_non_rich_people, 1).
rule_applies(disdainful_vain_rich_people_do_not_like_non_rich_people, X, Y) :-
    trait(X, rich),
    trait(X, vain),
    trait(X, disdainful),
    \+ trait(Y, rich).
rule_effect(disdainful_vain_rich_people_do_not_like_non_rich_people, set_relationship(X, Y, esteem, 2)).
rule_effect(disdainful_vain_rich_people_do_not_like_non_rich_people, modify_network(X, Y, affinity, '+', 2)).

rule_likelihood(elegantly_dressed_men_may_be_more_esteemed, 1).
rule_type(elegantly_dressed_men_may_be_more_esteemed, volition).
% Elegantly dressed men may be more esteemed
rule_active(elegantly_dressed_men_may_be_more_esteemed).
rule_category(elegantly_dressed_men_may_be_more_esteemed, reputation_esteem).
rule_source(elegantly_dressed_men_may_be_more_esteemed, ensemble).
rule_priority(elegantly_dressed_men_may_be_more_esteemed, 3).
rule_applies(elegantly_dressed_men_may_be_more_esteemed, X, Y) :-
    trait(X, elegantly_dressed),
    trait(X, male).
rule_effect(elegantly_dressed_men_may_be_more_esteemed, set_relationship(Y, X, esteem, 3)).

rule_likelihood(no_greet_respectful_request_for_low_status_dismiss, 1).
rule_type(no_greet_respectful_request_for_low_status_dismiss, volition).
% No greet + Respectful request for low status -> dismiss
rule_active(no_greet_respectful_request_for_low_status_dismiss).
rule_category(no_greet_respectful_request_for_low_status_dismiss, reputation_esteem).
rule_source(no_greet_respectful_request_for_low_status_dismiss, ensemble).
rule_priority(no_greet_respectful_request_for_low_status_dismiss, 5).
rule_applies(no_greet_respectful_request_for_low_status_dismiss, X, Y) :-
    \+ event(X, met),
    event(Y, respectful),
    attribute(X, status_individual, Status_individual_val), Status_individual_val < 51.
rule_effect(no_greet_respectful_request_for_low_status_dismiss, set_intent(X, dismiss, Y, 5)).

rule_likelihood(people_seek_connections_with_individuals_they_respect_more_than_others, 1).
rule_type(people_seek_connections_with_individuals_they_respect_more_than_others, volition).
% People seek connections with individuals they respect more than others.
rule_active(people_seek_connections_with_individuals_they_respect_more_than_others).
rule_category(people_seek_connections_with_individuals_they_respect_more_than_others, reputation_esteem).
rule_source(people_seek_connections_with_individuals_they_respect_more_than_others, ensemble).
rule_priority(people_seek_connections_with_individuals_they_respect_more_than_others, 1).
rule_applies(people_seek_connections_with_individuals_they_respect_more_than_others, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val > 6.
rule_effect(people_seek_connections_with_individuals_they_respect_more_than_others, set_intent(X, candid, Y, 1)).

rule_likelihood(people_seek_candidates_with_high_respect_from_both_peers_and_superiors, 1).
rule_type(people_seek_candidates_with_high_respect_from_both_peers_and_superiors, volition).
% People seek candidates with high respect from both peers and superiors.
rule_active(people_seek_candidates_with_high_respect_from_both_peers_and_superiors).
rule_category(people_seek_candidates_with_high_respect_from_both_peers_and_superiors, reputation_esteem).
rule_source(people_seek_candidates_with_high_respect_from_both_peers_and_superiors, ensemble).
rule_priority(people_seek_candidates_with_high_respect_from_both_peers_and_superiors, 1).
rule_applies(people_seek_candidates_with_high_respect_from_both_peers_and_superiors, X, Y) :-
    network(X, 'z', respect, Respect_val), Respect_val < 4,
    network(Y, 'z', respect, Respect_val), Respect_val < 4.
rule_effect(people_seek_candidates_with_high_respect_from_both_peers_and_superiors, set_intent(X, candid, Y, 1)).

rule_likelihood(people_seek_to_associate_with_individuals_of_high_respect_and_admiration, 1).
rule_type(people_seek_to_associate_with_individuals_of_high_respect_and_admiration, volition).
% People seek to associate with individuals of high respect and admiration.
rule_active(people_seek_to_associate_with_individuals_of_high_respect_and_admiration).
rule_category(people_seek_to_associate_with_individuals_of_high_respect_and_admiration, reputation_esteem).
rule_source(people_seek_to_associate_with_individuals_of_high_respect_and_admiration, ensemble).
rule_priority(people_seek_to_associate_with_individuals_of_high_respect_and_admiration, 3).
rule_applies(people_seek_to_associate_with_individuals_of_high_respect_and_admiration, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val > 6.
rule_effect(people_seek_to_associate_with_individuals_of_high_respect_and_admiration, set_intent(X, honor, Y, 3)).

rule_likelihood(people_seek_respect_from_individuals_with_higher_levels_of_influence, 1).
rule_type(people_seek_respect_from_individuals_with_higher_levels_of_influence, volition).
% People seek respect from individuals with higher levels of influence.
rule_active(people_seek_respect_from_individuals_with_higher_levels_of_influence).
rule_category(people_seek_respect_from_individuals_with_higher_levels_of_influence, reputation_esteem).
rule_source(people_seek_respect_from_individuals_with_higher_levels_of_influence, ensemble).
rule_priority(people_seek_respect_from_individuals_with_higher_levels_of_influence, 1).
rule_applies(people_seek_respect_from_individuals_with_higher_levels_of_influence, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val < 4.
rule_effect(people_seek_respect_from_individuals_with_higher_levels_of_influence, set_intent(X, honor, Y, -2)).

rule_likelihood(people_seek_respect_from_strong_individuals_and_are_motivated_to_honor_those_connections, 1).
rule_type(people_seek_respect_from_strong_individuals_and_are_motivated_to_honor_those_connections, volition).
% People seek respect from strong individuals and are motivated to honor those connections.
rule_active(people_seek_respect_from_strong_individuals_and_are_motivated_to_honor_those_connections).
rule_category(people_seek_respect_from_strong_individuals_and_are_motivated_to_honor_those_connections, reputation_esteem).
rule_source(people_seek_respect_from_strong_individuals_and_are_motivated_to_honor_those_connections, ensemble).
rule_priority(people_seek_respect_from_strong_individuals_and_are_motivated_to_honor_those_connections, 1).
rule_applies(people_seek_respect_from_strong_individuals_and_are_motivated_to_honor_those_connections, X, Y) :-
    network(X, 'z', respect, Respect_val), Respect_val > 6,
    network(Y, 'z', respect, Respect_val), Respect_val > 6.
rule_effect(people_seek_respect_from_strong_individuals_and_are_motivated_to_honor_those_connections, set_intent(X, honor, Y, 1)).

rule_likelihood(people_seek_to_associate_with_individuals_of_high_respect_within_their_social_network, 1).
rule_type(people_seek_to_associate_with_individuals_of_high_respect_within_their_social_network, volition).
% People seek to associate with individuals of high respect within their social network.
rule_active(people_seek_to_associate_with_individuals_of_high_respect_within_their_social_network).
rule_category(people_seek_to_associate_with_individuals_of_high_respect_within_their_social_network, reputation_esteem).
rule_source(people_seek_to_associate_with_individuals_of_high_respect_within_their_social_network, ensemble).
rule_priority(people_seek_to_associate_with_individuals_of_high_respect_within_their_social_network, 1).
rule_applies(people_seek_to_associate_with_individuals_of_high_respect_within_their_social_network, X, Y) :-
    network(X, 'z', respect, Respect_val), Respect_val < 4,
    network(Y, 'z', respect, Respect_val), Respect_val < 4.
rule_effect(people_seek_to_associate_with_individuals_of_high_respect_within_their_social_network, set_intent(X, honor, Y, 1)).

rule_likelihood(people_seek_connections_with_individuals_who_command_respect_and_admiration, 1).
rule_type(people_seek_connections_with_individuals_who_command_respect_and_admiration, volition).
% People seek connections with individuals who command respect and admiration.
rule_active(people_seek_connections_with_individuals_who_command_respect_and_admiration).
rule_category(people_seek_connections_with_individuals_who_command_respect_and_admiration, reputation_esteem).
rule_source(people_seek_connections_with_individuals_who_command_respect_and_admiration, ensemble).
rule_priority(people_seek_connections_with_individuals_who_command_respect_and_admiration, 1).
rule_applies(people_seek_connections_with_individuals_who_command_respect_and_admiration, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val > 6.
rule_effect(people_seek_connections_with_individuals_who_command_respect_and_admiration, set_intent(X, kind, Y, 2)).

rule_likelihood(people_are_less_kind_to_people_they_don_t_respect, 1).
rule_type(people_are_less_kind_to_people_they_don_t_respect, volition).
% People are less kind to people they don’t respect
rule_active(people_are_less_kind_to_people_they_don_t_respect).
rule_category(people_are_less_kind_to_people_they_don_t_respect, reputation_esteem).
rule_source(people_are_less_kind_to_people_they_don_t_respect, ensemble).
rule_priority(people_are_less_kind_to_people_they_don_t_respect, 1).
rule_applies(people_are_less_kind_to_people_they_don_t_respect, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val < 4.
rule_effect(people_are_less_kind_to_people_they_don_t_respect, set_intent(X, kind, Y, -2)).

rule_likelihood(people_are_kind_to_those_they_respect, 1).
rule_type(people_are_kind_to_those_they_respect, volition).
% People are kind to those they respect
rule_active(people_are_kind_to_those_they_respect).
rule_category(people_are_kind_to_those_they_respect, reputation_esteem).
rule_source(people_are_kind_to_those_they_respect, ensemble).
rule_priority(people_are_kind_to_those_they_respect, 1).
rule_applies(people_are_kind_to_those_they_respect, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val > 7.
rule_effect(people_are_kind_to_those_they_respect, set_intent(X, kind, Y, 2)).

rule_likelihood(people_are_much_more_rude_to_those_that_they_don_t_respect, 1).
rule_type(people_are_much_more_rude_to_those_that_they_don_t_respect, volition).
% People are much more rude to those that they don’t respect
rule_active(people_are_much_more_rude_to_those_that_they_don_t_respect).
rule_category(people_are_much_more_rude_to_those_that_they_don_t_respect, reputation_esteem).
rule_source(people_are_much_more_rude_to_those_that_they_don_t_respect, ensemble).
rule_priority(people_are_much_more_rude_to_those_that_they_don_t_respect, 3).
rule_applies(people_are_much_more_rude_to_those_that_they_don_t_respect, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val < 4.
rule_effect(people_are_much_more_rude_to_those_that_they_don_t_respect, set_intent(X, rude, Y, 4)).

rule_likelihood(people_are_less_rude_to_people_they_respect_a_lot, 1).
rule_type(people_are_less_rude_to_people_they_respect_a_lot, volition).
% People are less rude to people they respect a lot
rule_active(people_are_less_rude_to_people_they_respect_a_lot).
rule_category(people_are_less_rude_to_people_they_respect_a_lot, reputation_esteem).
rule_source(people_are_less_rude_to_people_they_respect_a_lot, ensemble).
rule_priority(people_are_less_rude_to_people_they_respect_a_lot, 3).
rule_applies(people_are_less_rude_to_people_they_respect_a_lot, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val > 7.
rule_effect(people_are_less_rude_to_people_they_respect_a_lot, set_intent(X, rude, Y, -3)).

%% ═══════════════════════════════════════════════════════════
%% Category: rivalry-conflict
%% ═══════════════════════════════════════════════════════════

%% Ensemble Volition Rules: rivalry-conflict
%% Source: data/ensemble/volitionRules/rivalry-conflict.json
%% Converted: 2026-04-02T20:09:49.733Z
%% Total rules: 18

rule_likelihood(the_hero_doesn_t_particularly_want_to_get_closer_to_the_rival, 1).
rule_type(the_hero_doesn_t_particularly_want_to_get_closer_to_the_rival, volition).
% The hero doesn’t particularly want to get closer to the rival
rule_active(the_hero_doesn_t_particularly_want_to_get_closer_to_the_rival).
rule_category(the_hero_doesn_t_particularly_want_to_get_closer_to_the_rival, rivalry_conflict).
rule_source(the_hero_doesn_t_particularly_want_to_get_closer_to_the_rival, ensemble).
rule_priority(the_hero_doesn_t_particularly_want_to_get_closer_to_the_rival, 8).
rule_applies(the_hero_doesn_t_particularly_want_to_get_closer_to_the_rival, X, Y) :-
    trait(X, hero),
    trait(Y, rival).
rule_effect(the_hero_doesn_t_particularly_want_to_get_closer_to_the_rival, modify_network(X, Y, closeness, '-', 10)).

rule_likelihood(you_don_t_fight_with_your_friends, 1).
rule_type(you_don_t_fight_with_your_friends, volition).
% You don’t fight with your friends
rule_active(you_don_t_fight_with_your_friends).
rule_category(you_don_t_fight_with_your_friends, rivalry_conflict).
rule_source(you_don_t_fight_with_your_friends, ensemble).
rule_priority(you_don_t_fight_with_your_friends, 5).
rule_applies(you_don_t_fight_with_your_friends, X, Y) :-
    relationship(X, Y, playmates).
rule_effect(you_don_t_fight_with_your_friends, set_intent(X, fight, Y, -5)).

rule_likelihood(beauty_creates_rivalry, 1).
rule_type(beauty_creates_rivalry, volition).
% Beauty creates rivalry
rule_active(beauty_creates_rivalry).
rule_category(beauty_creates_rivalry, rivalry_conflict).
rule_source(beauty_creates_rivalry, ensemble).
rule_priority(beauty_creates_rivalry, 5).
rule_applies(beauty_creates_rivalry, X, Y) :-
    trait(X, beautiful),
    attribute(X, charisma, Charisma_val), Charisma_val < 81,
    attribute(Y, charisma, Charisma_val), Charisma_val > 80,
    trait(Y, beautiful),
    trait(X, female),
    trait(Y, female).
rule_effect(beauty_creates_rivalry, modify_network(X, Y, affinity, '+', 5)).
rule_effect(beauty_creates_rivalry, set_relationship(X, Y, rivals, 5)).
rule_effect(beauty_creates_rivalry, set_relationship(Y, X, esteem, 2)).

rule_likelihood(attendees_who_offend_musicians_are_disliked, 1).
rule_type(attendees_who_offend_musicians_are_disliked, volition).
% Attendees who offend musicians are disliked
rule_active(attendees_who_offend_musicians_are_disliked).
rule_category(attendees_who_offend_musicians_are_disliked, rivalry_conflict).
rule_source(attendees_who_offend_musicians_are_disliked, ensemble).
rule_priority(attendees_who_offend_musicians_are_disliked, 5).
rule_applies(attendees_who_offend_musicians_are_disliked, X, Y) :-
    trait(X, female),
    trait(X, joker),
    trait(Y, male),
    directed_status(Y, X, offended_by),
    trait(X, eccentric),
    trait(Y, security_guard).
rule_effect(attendees_who_offend_musicians_are_disliked, modify_network(Y, X, affinity, '+', 5)).

rule_likelihood(ambitious_rivals_will_prefer_a_third_s_judgement, 1).
rule_type(ambitious_rivals_will_prefer_a_third_s_judgement, volition).
% Ambitious rivals will prefer a third’s judgement
rule_active(ambitious_rivals_will_prefer_a_third_s_judgement).
rule_category(ambitious_rivals_will_prefer_a_third_s_judgement, rivalry_conflict).
rule_source(ambitious_rivals_will_prefer_a_third_s_judgement, ensemble).
rule_priority(ambitious_rivals_will_prefer_a_third_s_judgement, 3).
rule_applies(ambitious_rivals_will_prefer_a_third_s_judgement, X, Y) :-
    relationship(X, Y, rivals),
    trait(X, ambitious),
    trait(Y, ambitious),
    \+ relationship(Y, 'z', ally).
rule_effect(ambitious_rivals_will_prefer_a_third_s_judgement, modify_network(X, 'z', credibility, '+', 2)).
rule_effect(ambitious_rivals_will_prefer_a_third_s_judgement, modify_network(X, Y, credibility, '-', 3)).

rule_likelihood(beautiful_well_dressed_women_are_often_rivals, 1).
rule_type(beautiful_well_dressed_women_are_often_rivals, volition).
% Beautiful, well-dressed women are often rivals
rule_active(beautiful_well_dressed_women_are_often_rivals).
rule_category(beautiful_well_dressed_women_are_often_rivals, rivalry_conflict).
rule_source(beautiful_well_dressed_women_are_often_rivals, ensemble).
rule_priority(beautiful_well_dressed_women_are_often_rivals, 3).
rule_applies(beautiful_well_dressed_women_are_often_rivals, X, Y) :-
    trait(X, female),
    trait(X, beautiful),
    trait(Y, female),
    trait(X, elegantly_dressed),
    trait(Y, vain),
    trait(Y, elegantly_dressed),
    trait(Y, beautiful).
rule_effect(beautiful_well_dressed_women_are_often_rivals, set_relationship(Y, X, rivals, 3)).

rule_likelihood(young_impudent_and_vicious_men_are_more_prone_to_offend_others, 1).
rule_type(young_impudent_and_vicious_men_are_more_prone_to_offend_others, volition).
% Young, impudent, and vicious men are more prone to offend others
rule_active(young_impudent_and_vicious_men_are_more_prone_to_offend_others).
rule_category(young_impudent_and_vicious_men_are_more_prone_to_offend_others, rivalry_conflict).
rule_source(young_impudent_and_vicious_men_are_more_prone_to_offend_others, ensemble).
rule_priority(young_impudent_and_vicious_men_are_more_prone_to_offend_others, 3).
rule_applies(young_impudent_and_vicious_men_are_more_prone_to_offend_others, X, Y) :-
    trait(X, impudent),
    trait(X, young),
    attribute(X, propriety, Propriety_val), Propriety_val < 33,
    \+ trait(X, trustworthy),
    \+ relationship(X, Y, esteem).
rule_effect(young_impudent_and_vicious_men_are_more_prone_to_offend_others, modify_network(X, Y, credibility, '+', 1)).
rule_effect(young_impudent_and_vicious_men_are_more_prone_to_offend_others, modify_network(X, Y, affinity, '+', 3)).
rule_effect(young_impudent_and_vicious_men_are_more_prone_to_offend_others, modify_network(X, Y, emulation, '+', 1)).

rule_likelihood(your_friend_s_rival_may_also_become_your_rival, 1).
rule_type(your_friend_s_rival_may_also_become_your_rival, volition).
% Your friend’s rival may also become your rival
rule_active(your_friend_s_rival_may_also_become_your_rival).
rule_category(your_friend_s_rival_may_also_become_your_rival, rivalry_conflict).
rule_source(your_friend_s_rival_may_also_become_your_rival, ensemble).
rule_priority(your_friend_s_rival_may_also_become_your_rival, 5).
rule_applies(your_friend_s_rival_may_also_become_your_rival, X, Y) :-
    relationship(X, 'z', rivals),
    relationship(Y, X, friends).
rule_effect(your_friend_s_rival_may_also_become_your_rival, set_relationship(Y, 'z', rivals, 5)).

rule_likelihood(your_friend_s_enemies_may_bother_you, 1).
rule_type(your_friend_s_enemies_may_bother_you, volition).
% Your friend’s enemies may bother you
rule_active(your_friend_s_enemies_may_bother_you).
rule_category(your_friend_s_enemies_may_bother_you, rivalry_conflict).
rule_source(your_friend_s_enemies_may_bother_you, ensemble).
rule_priority(your_friend_s_enemies_may_bother_you, 5).
rule_applies(your_friend_s_enemies_may_bother_you, X, Y) :-
    directed_status(X, Y, owes_a_favor_to),
    relationship(Y, 'z', rivals).
rule_effect(your_friend_s_enemies_may_bother_you, modify_network(X, 'z', affinity, '+', 5)).
rule_effect(your_friend_s_enemies_may_bother_you, set_relationship(X, 'z', rivals, 5)).

rule_likelihood(drunk_people_are_more_likely_to_offend_others, 1).
rule_type(drunk_people_are_more_likely_to_offend_others, volition).
% Drunk people are more likely to offend others
rule_active(drunk_people_are_more_likely_to_offend_others).
rule_category(drunk_people_are_more_likely_to_offend_others, rivalry_conflict).
rule_source(drunk_people_are_more_likely_to_offend_others, ensemble).
rule_priority(drunk_people_are_more_likely_to_offend_others, 5).
rule_applies(drunk_people_are_more_likely_to_offend_others, X, Y) :-
    status(X, inebriated),
    trait(X, security_guard),
    directed_status(Y, X, offended_by),
    attribute(Y, sophistication, Sophistication_val), Sophistication_val > 50.
rule_effect(drunk_people_are_more_likely_to_offend_others, modify_network(Y, X, affinity, '+', 5)).

rule_likelihood(offended_people_may_encourage_others_to_also_be_offended, 1).
rule_type(offended_people_may_encourage_others_to_also_be_offended, volition).
% Offended people may encourage others to also be offended
rule_active(offended_people_may_encourage_others_to_also_be_offended).
rule_category(offended_people_may_encourage_others_to_also_be_offended, rivalry_conflict).
rule_source(offended_people_may_encourage_others_to_also_be_offended, ensemble).
rule_priority(offended_people_may_encourage_others_to_also_be_offended, 5).
rule_applies(offended_people_may_encourage_others_to_also_be_offended, X, Y) :-
    directed_status(X, 'z', offended_by),
    attribute(Y, propriety, Propriety_val), Propriety_val > 75.
rule_effect(offended_people_may_encourage_others_to_also_be_offended, modify_network(X, Y, emulation, '+', 5)).

rule_likelihood(honest_people_who_esteem_someone_offended_by_them_may_seek_to_undo_that_perception, 1).
rule_type(honest_people_who_esteem_someone_offended_by_them_may_seek_to_undo_that_perception, volition).
% Honest people who esteem someone offended by them may seek to undo that perception
rule_active(honest_people_who_esteem_someone_offended_by_them_may_seek_to_undo_that_perception).
rule_category(honest_people_who_esteem_someone_offended_by_them_may_seek_to_undo_that_perception, rivalry_conflict).
rule_source(honest_people_who_esteem_someone_offended_by_them_may_seek_to_undo_that_perception, ensemble).
rule_priority(honest_people_who_esteem_someone_offended_by_them_may_seek_to_undo_that_perception, 8).
rule_applies(honest_people_who_esteem_someone_offended_by_them_may_seek_to_undo_that_perception, X, Y) :-
    directed_status(X, Y, esteems),
    directed_status(Y, X, offended_by),
    trait(X, honest).
rule_effect(honest_people_who_esteem_someone_offended_by_them_may_seek_to_undo_that_perception, modify_network(X, Y, affinity, '+', 10)).
rule_effect(honest_people_who_esteem_someone_offended_by_them_may_seek_to_undo_that_perception, modify_network(X, Y, curiosity, '+', 10)).

rule_likelihood(virtuous_people_lose_affinity_for_self_assured_non_virtuous_people_who_have_offended_them, 1).
rule_type(virtuous_people_lose_affinity_for_self_assured_non_virtuous_people_who_have_offended_them, volition).
% Virtuous people lose affinity for self-assured, non-virtuous people who have offended them
rule_active(virtuous_people_lose_affinity_for_self_assured_non_virtuous_people_who_have_offended_them).
rule_category(virtuous_people_lose_affinity_for_self_assured_non_virtuous_people_who_have_offended_them, rivalry_conflict).
rule_source(virtuous_people_lose_affinity_for_self_assured_non_virtuous_people_who_have_offended_them, ensemble).
rule_priority(virtuous_people_lose_affinity_for_self_assured_non_virtuous_people_who_have_offended_them, 3).
rule_applies(virtuous_people_lose_affinity_for_self_assured_non_virtuous_people_who_have_offended_them, X, Y) :-
    \+ trait(X, virtuous),
    attribute(X, self_assuredness, Self_assuredness_val), Self_assuredness_val > 60,
    trait(Y, virtuous),
    directed_status(Y, X, offended_by).
rule_effect(virtuous_people_lose_affinity_for_self_assured_non_virtuous_people_who_have_offended_them, modify_network(Y, X, affinity, '+', 3)).

rule_likelihood(people_may_become_enemies_when_one_mistreats_relatives_of_the_other, 1).
rule_type(people_may_become_enemies_when_one_mistreats_relatives_of_the_other, volition).
% People may become enemies when one mistreats relatives of the other
rule_active(people_may_become_enemies_when_one_mistreats_relatives_of_the_other).
rule_category(people_may_become_enemies_when_one_mistreats_relatives_of_the_other, rivalry_conflict).
rule_source(people_may_become_enemies_when_one_mistreats_relatives_of_the_other, ensemble).
rule_priority(people_may_become_enemies_when_one_mistreats_relatives_of_the_other, 5).
rule_applies(people_may_become_enemies_when_one_mistreats_relatives_of_the_other, X, Y) :-
    trait(X, male),
    trait(X, attendee),
    trait(X, wearing_a_first_responder_uniform),
    trait(Y, male),
    trait(Y, attendee),
    trait(Y, wearing_a_first_responder_uniform),
    relationship(Y, 'z', married),
    trait('z', female),
    event(Y, harmed),
    network(X, 'z', affinity, Affinity_val), Affinity_val > 66.
rule_effect(people_may_become_enemies_when_one_mistreats_relatives_of_the_other, modify_network(X, Y, affinity, '-', 5)).
rule_effect(people_may_become_enemies_when_one_mistreats_relatives_of_the_other, set_relationship(X, Y, rivals, 5)).

rule_likelihood(if_someone_ridicules_one_s_friend_he_may_become_a_rival, 1).
rule_type(if_someone_ridicules_one_s_friend_he_may_become_a_rival, volition).
% If someone ridicules one’s friend, he may become a rival
rule_active(if_someone_ridicules_one_s_friend_he_may_become_a_rival).
rule_category(if_someone_ridicules_one_s_friend_he_may_become_a_rival, rivalry_conflict).
rule_source(if_someone_ridicules_one_s_friend_he_may_become_a_rival, ensemble).
rule_priority(if_someone_ridicules_one_s_friend_he_may_become_a_rival, 5).
rule_applies(if_someone_ridicules_one_s_friend_he_may_become_a_rival, X, Y) :-
    relationship(X, Y, friends),
    directed_status(X, Y, ridicules).
rule_effect(if_someone_ridicules_one_s_friend_he_may_become_a_rival, set_relationship(X, X, rivals, 5)).

rule_likelihood(a_man_may_by_jealous_of_another_man_approaching_the_woman_he_loves, 1).
rule_type(a_man_may_by_jealous_of_another_man_approaching_the_woman_he_loves, volition).
% A man may by jealous of another man approaching the woman he loves
rule_active(a_man_may_by_jealous_of_another_man_approaching_the_woman_he_loves).
rule_category(a_man_may_by_jealous_of_another_man_approaching_the_woman_he_loves, rivalry_conflict).
rule_source(a_man_may_by_jealous_of_another_man_approaching_the_woman_he_loves, ensemble).
rule_priority(a_man_may_by_jealous_of_another_man_approaching_the_woman_he_loves, 5).
rule_applies(a_man_may_by_jealous_of_another_man_approaching_the_woman_he_loves, X, Y) :-
    network(X, Y, affinity, Affinity_val), Affinity_val > 80,
    trait(X, male),
    trait(Y, female),
    trait(X, male),
    network(X, Y, curiosity, Curiosity_val), Curiosity_val > 60.
rule_effect(a_man_may_by_jealous_of_another_man_approaching_the_woman_he_loves, set_relationship(X, X, rivals, 5)).

rule_likelihood(people_have_a_desire_to_connect_with_both_rivals_x_and_y, 1).
rule_type(people_have_a_desire_to_connect_with_both_rivals_x_and_y, volition).
% People have a desire to connect with both rivals x and y.
rule_active(people_have_a_desire_to_connect_with_both_rivals_x_and_y).
rule_category(people_have_a_desire_to_connect_with_both_rivals_x_and_y, rivalry_conflict).
rule_source(people_have_a_desire_to_connect_with_both_rivals_x_and_y, ensemble).
rule_priority(people_have_a_desire_to_connect_with_both_rivals_x_and_y, 1).
rule_applies(people_have_a_desire_to_connect_with_both_rivals_x_and_y, X, Y) :-
    directed_status(X, 'z', rivals),
    directed_status(Y, 'z', rivals).
rule_effect(people_have_a_desire_to_connect_with_both_rivals_x_and_y, set_intent(X, candid, Y, 2)).

rule_likelihood(people_are_inclined_to_get_closer_when_rivals_have_a_mutual_rivalry_towards_the_same, 1).
rule_type(people_are_inclined_to_get_closer_when_rivals_have_a_mutual_rivalry_towards_the_same, volition).
% People are inclined to get closer when rivals have a mutual rivalry towards the same
rule_active(people_are_inclined_to_get_closer_when_rivals_have_a_mutual_rivalry_towards_the_same).
rule_category(people_are_inclined_to_get_closer_when_rivals_have_a_mutual_rivalry_towards_the_same, rivalry_conflict).
rule_source(people_are_inclined_to_get_closer_when_rivals_have_a_mutual_rivalry_towards_the_same, ensemble).
rule_priority(people_are_inclined_to_get_closer_when_rivals_have_a_mutual_rivalry_towards_the_same, 1).
rule_applies(people_are_inclined_to_get_closer_when_rivals_have_a_mutual_rivalry_towards_the_same, X, Y) :-
    directed_status(X, 'z', rivals),
    directed_status(Y, 'z', rivals).
rule_effect(people_are_inclined_to_get_closer_when_rivals_have_a_mutual_rivalry_towards_the_same, set_intent(X, favor, Y, 2)).

%% ═══════════════════════════════════════════════════════════
%% Category: romantic-attraction
%% ═══════════════════════════════════════════════════════════

%% Ensemble Volition Rules: romantic-attraction
%% Source: data/ensemble/volitionRules/romantic-attraction.json
%% Converted: 2026-04-02T20:09:49.734Z
%% Total rules: 116

rule_likelihood(people_want_to_date_their_crush, 1).
rule_type(people_want_to_date_their_crush, volition).
% People Want to Date Their Crush
rule_active(people_want_to_date_their_crush).
rule_category(people_want_to_date_their_crush, romantic_attraction).
rule_source(people_want_to_date_their_crush, ensemble).
rule_priority(people_want_to_date_their_crush, 5).
rule_applies(people_want_to_date_their_crush, X, Y) :-
    directed_status(X, Y, crushing_on).
rule_effect(people_want_to_date_their_crush, set_relationship(X, Y, dating, 5)).

rule_likelihood(attraction_makes_people_want_to_start_dating, 1).
rule_type(attraction_makes_people_want_to_start_dating, volition).
% Attraction makes people want to start dating.
rule_active(attraction_makes_people_want_to_start_dating).
rule_category(attraction_makes_people_want_to_start_dating, romantic_attraction).
rule_source(attraction_makes_people_want_to_start_dating, ensemble).
rule_priority(attraction_makes_people_want_to_start_dating, 5).
rule_applies(attraction_makes_people_want_to_start_dating, X, Y) :-
    directed_status(X, Y, attracted_to).
rule_effect(attraction_makes_people_want_to_start_dating, set_relationship(X, Y, involved_with, 5)).

rule_likelihood(similar_interest_suggests_affinity_up_movies, 1).
rule_type(similar_interest_suggests_affinity_up_movies, volition).
% Similar interest suggests affinity up (movies).
rule_active(similar_interest_suggests_affinity_up_movies).
rule_category(similar_interest_suggests_affinity_up_movies, romantic_attraction).
rule_source(similar_interest_suggests_affinity_up_movies, ensemble).
rule_priority(similar_interest_suggests_affinity_up_movies, 3).
rule_applies(similar_interest_suggests_affinity_up_movies, X, Y) :-
    trait(X, cinema_buff),
    trait(Y, cinema_buff).
rule_effect(similar_interest_suggests_affinity_up_movies, modify_network(X, Y, affinity, '+', 3)).

rule_likelihood(similar_interest_movies_makes_people_less_likely_to_start_dating, 1).
rule_type(similar_interest_movies_makes_people_less_likely_to_start_dating, volition).
% Similar interest (movies) makes people LESS Likely to start dating
rule_active(similar_interest_movies_makes_people_less_likely_to_start_dating).
rule_category(similar_interest_movies_makes_people_less_likely_to_start_dating, romantic_attraction).
rule_source(similar_interest_movies_makes_people_less_likely_to_start_dating, ensemble).
rule_priority(similar_interest_movies_makes_people_less_likely_to_start_dating, 3).
rule_applies(similar_interest_movies_makes_people_less_likely_to_start_dating, X, Y) :-
    trait(X, cinema_buff),
    trait(Y, cinema_buff).
rule_effect(similar_interest_movies_makes_people_less_likely_to_start_dating, set_relationship(X, Y, involved_with, -3)).

rule_likelihood(in_fact_similar_interest_movies_makes_people_more_likely_to_stop_dating, 1).
rule_type(in_fact_similar_interest_movies_makes_people_more_likely_to_stop_dating, volition).
% In fact, Similar interest  (movies) makes people MORE Likely to STOP dating
rule_active(in_fact_similar_interest_movies_makes_people_more_likely_to_stop_dating).
rule_category(in_fact_similar_interest_movies_makes_people_more_likely_to_stop_dating, romantic_attraction).
rule_source(in_fact_similar_interest_movies_makes_people_more_likely_to_stop_dating, ensemble).
rule_priority(in_fact_similar_interest_movies_makes_people_more_likely_to_stop_dating, 3).
rule_applies(in_fact_similar_interest_movies_makes_people_more_likely_to_stop_dating, X, Y) :-
    trait(X, cinema_buff),
    trait(Y, cinema_buff).
rule_effect(in_fact_similar_interest_movies_makes_people_more_likely_to_stop_dating, set_relationship(X, Y, involved_with, 3)).

rule_likelihood(a_flirtatious_innocent_looking_man_can_gain_the_trust_of_a_rich_woman, 1).
rule_type(a_flirtatious_innocent_looking_man_can_gain_the_trust_of_a_rich_woman, volition).
% A flirtatious, innocent looking man can gain the trust of a rich woman
rule_active(a_flirtatious_innocent_looking_man_can_gain_the_trust_of_a_rich_woman).
rule_category(a_flirtatious_innocent_looking_man_can_gain_the_trust_of_a_rich_woman, romantic_attraction).
rule_source(a_flirtatious_innocent_looking_man_can_gain_the_trust_of_a_rich_woman, ensemble).
rule_priority(a_flirtatious_innocent_looking_man_can_gain_the_trust_of_a_rich_woman, 5).
rule_applies(a_flirtatious_innocent_looking_man_can_gain_the_trust_of_a_rich_woman, X, Y) :-
    trait(X, innocent_looking),
    trait(X, flirtatious),
    trait(X, male),
    trait(Y, female),
    trait(Y, rich).
rule_effect(a_flirtatious_innocent_looking_man_can_gain_the_trust_of_a_rich_woman, modify_network(Y, X, affinity, '+', 5)).
rule_effect(a_flirtatious_innocent_looking_man_can_gain_the_trust_of_a_rich_woman, set_relationship(X, Y, ally, 5)).

rule_likelihood(a_beautiful_female_inspires_greater_affection_from_flirtatious_males, 1).
rule_type(a_beautiful_female_inspires_greater_affection_from_flirtatious_males, volition).
% A beautiful female inspires greater affection from flirtatious males
rule_active(a_beautiful_female_inspires_greater_affection_from_flirtatious_males).
rule_category(a_beautiful_female_inspires_greater_affection_from_flirtatious_males, romantic_attraction).
rule_source(a_beautiful_female_inspires_greater_affection_from_flirtatious_males, ensemble).
rule_priority(a_beautiful_female_inspires_greater_affection_from_flirtatious_males, 5).
rule_applies(a_beautiful_female_inspires_greater_affection_from_flirtatious_males, X, Y) :-
    trait(X, female),
    trait(X, beautiful),
    trait(Y, male),
    trait(Y, flirtatious).
rule_effect(a_beautiful_female_inspires_greater_affection_from_flirtatious_males, modify_network(Y, X, affinity, '+', 5)).

rule_likelihood(non_reciprocal_same_sex_flirtation_can_be_unwanted, 1).
rule_type(non_reciprocal_same_sex_flirtation_can_be_unwanted, volition).
% Non-reciprocal same-sex flirtation can be unwanted
rule_active(non_reciprocal_same_sex_flirtation_can_be_unwanted).
rule_category(non_reciprocal_same_sex_flirtation_can_be_unwanted, romantic_attraction).
rule_source(non_reciprocal_same_sex_flirtation_can_be_unwanted, ensemble).
rule_priority(non_reciprocal_same_sex_flirtation_can_be_unwanted, 8).
rule_applies(non_reciprocal_same_sex_flirtation_can_be_unwanted, X, Y) :-
    attribute(X, propriety, Propriety_val), Propriety_val < 33,
    attribute(X, self_assuredness, Self_assuredness_val), Self_assuredness_val > 66,
    attribute(Y, charisma, Charisma_val), Charisma_val > 66,
    trait(X, male),
    trait(Y, male),
    trait(X, flirtatious).
rule_effect(non_reciprocal_same_sex_flirtation_can_be_unwanted, modify_network(X, Y, affinity, '+', 5)).
rule_effect(non_reciprocal_same_sex_flirtation_can_be_unwanted, modify_network(Y, X, affinity, '+', 10)).

rule_likelihood(a_poor_young_girl_can_have_an_affinity_for_a_rich_older_man, 1).
rule_type(a_poor_young_girl_can_have_an_affinity_for_a_rich_older_man, volition).
% A poor young girl can have an affinity for a rich older man
rule_active(a_poor_young_girl_can_have_an_affinity_for_a_rich_older_man).
rule_category(a_poor_young_girl_can_have_an_affinity_for_a_rich_older_man, romantic_attraction).
rule_source(a_poor_young_girl_can_have_an_affinity_for_a_rich_older_man, ensemble).
rule_priority(a_poor_young_girl_can_have_an_affinity_for_a_rich_older_man, 5).
rule_applies(a_poor_young_girl_can_have_an_affinity_for_a_rich_older_man, X, Y) :-
    trait(X, female),
    \+ trait(X, old),
    trait(X, poor),
    trait(Y, rich),
    trait(Y, generous),
    \+ trait(X, virtuous).
rule_effect(a_poor_young_girl_can_have_an_affinity_for_a_rich_older_man, modify_network(X, Y, curiosity, '+', 5)).
rule_effect(a_poor_young_girl_can_have_an_affinity_for_a_rich_older_man, modify_network(X, Y, affinity, '+', 5)).
rule_effect(a_poor_young_girl_can_have_an_affinity_for_a_rich_older_man, set_relationship(X, Y, esteem, 5)).
rule_effect(a_poor_young_girl_can_have_an_affinity_for_a_rich_older_man, set_relationship(Y, X, ally, 5)).

rule_likelihood(people_have_an_affinity_for_older_rich_male_government_officials, 1).
rule_type(people_have_an_affinity_for_older_rich_male_government_officials, volition).
% People have an affinity for older, rich, male government officials
rule_active(people_have_an_affinity_for_older_rich_male_government_officials).
rule_category(people_have_an_affinity_for_older_rich_male_government_officials, romantic_attraction).
rule_source(people_have_an_affinity_for_older_rich_male_government_officials, ensemble).
rule_priority(people_have_an_affinity_for_older_rich_male_government_officials, 5).
rule_applies(people_have_an_affinity_for_older_rich_male_government_officials, X, Y) :-
    trait(X, government_official),
    trait(X, rich),
    trait(X, old),
    trait(X, male).
rule_effect(people_have_an_affinity_for_older_rich_male_government_officials, modify_network(Y, X, affinity, '+', 5)).

rule_likelihood(an_old_man_in_love_with_young_woman_is_often_rejected, 1).
rule_type(an_old_man_in_love_with_young_woman_is_often_rejected, volition).
% An old man in love with young woman is often rejected
rule_active(an_old_man_in_love_with_young_woman_is_often_rejected).
rule_category(an_old_man_in_love_with_young_woman_is_often_rejected, romantic_attraction).
rule_source(an_old_man_in_love_with_young_woman_is_often_rejected, ensemble).
rule_priority(an_old_man_in_love_with_young_woman_is_often_rejected, 8).
rule_applies(an_old_man_in_love_with_young_woman_is_often_rejected, X, Y) :-
    trait(X, young),
    trait(X, female),
    trait(X, beautiful),
    attribute(X, charisma, Charisma_val), Charisma_val > 60,
    trait(Y, old),
    trait(Y, male),
    network(Y, X, affinity, Affinity_val), Affinity_val > 75,
    network(X, Y, affinity, Affinity_val), Affinity_val < 50.
rule_effect(an_old_man_in_love_with_young_woman_is_often_rejected, modify_network(X, Y, affinity, '-', 10)).
rule_effect(an_old_man_in_love_with_young_woman_is_often_rejected, modify_network(X, Y, curiosity, '-', 10)).
rule_effect(an_old_man_in_love_with_young_woman_is_often_rejected, set_relationship(X, Y, esteem, -10)).

rule_likelihood(a_lover_is_jealous_of_a_handsome_and_rich_rival, 1).
rule_type(a_lover_is_jealous_of_a_handsome_and_rich_rival, volition).
% A lover is jealous of a handsome and rich rival
rule_active(a_lover_is_jealous_of_a_handsome_and_rich_rival).
rule_category(a_lover_is_jealous_of_a_handsome_and_rich_rival, romantic_attraction).
rule_source(a_lover_is_jealous_of_a_handsome_and_rich_rival, ensemble).
rule_priority(a_lover_is_jealous_of_a_handsome_and_rich_rival, 8).
rule_applies(a_lover_is_jealous_of_a_handsome_and_rich_rival, X, Y) :-
    trait(X, rich),
    trait(X, male),
    trait(Y, male),
    attribute(Y, sensitiveness, Sensitiveness_val), Sensitiveness_val > 50,
    relationship(Y, 'z', lovers),
    trait('z', female),
    trait('z', greedy).
rule_effect(a_lover_is_jealous_of_a_handsome_and_rich_rival, set_relationship(Y, X, rivals, 10)).

rule_likelihood(a_kind_and_charming_man_inspires_increased_affinity_in_women, 1).
rule_type(a_kind_and_charming_man_inspires_increased_affinity_in_women, volition).
% A kind and charming man inspires increased affinity in women
rule_active(a_kind_and_charming_man_inspires_increased_affinity_in_women).
rule_category(a_kind_and_charming_man_inspires_increased_affinity_in_women, romantic_attraction).
rule_source(a_kind_and_charming_man_inspires_increased_affinity_in_women, ensemble).
rule_priority(a_kind_and_charming_man_inspires_increased_affinity_in_women, 5).
rule_applies(a_kind_and_charming_man_inspires_increased_affinity_in_women, X, Y) :-
    trait(X, kind),
    trait(X, charming),
    trait(X, male),
    trait(Y, female).
rule_effect(a_kind_and_charming_man_inspires_increased_affinity_in_women, modify_network(Y, X, affinity, '+', 5)).

rule_likelihood(a_lover_is_moved_by_extreme_emotions_of_their_upset_partner, 1).
rule_type(a_lover_is_moved_by_extreme_emotions_of_their_upset_partner, volition).
% A lover is moved by extreme emotions of their upset partner
rule_active(a_lover_is_moved_by_extreme_emotions_of_their_upset_partner).
rule_category(a_lover_is_moved_by_extreme_emotions_of_their_upset_partner, romantic_attraction).
rule_source(a_lover_is_moved_by_extreme_emotions_of_their_upset_partner, ensemble).
rule_priority(a_lover_is_moved_by_extreme_emotions_of_their_upset_partner, 5).
rule_applies(a_lover_is_moved_by_extreme_emotions_of_their_upset_partner, X, Y) :-
    status(Y, upset),
    relationship(X, Y, lovers),
    attribute(Y, sensitiveness, Sensitiveness_val), Sensitiveness_val > 75,
    attribute(X, sensitiveness, Sensitiveness_val), Sensitiveness_val > 50.
rule_effect(a_lover_is_moved_by_extreme_emotions_of_their_upset_partner, modify_network(X, Y, affinity, '+', 5)).

rule_likelihood(a_poor_girl_is_harassed_and_attacked_by_a_seductive_man, 1).
rule_type(a_poor_girl_is_harassed_and_attacked_by_a_seductive_man, volition).
% A poor girl is harassed and attacked by a seductive man
rule_active(a_poor_girl_is_harassed_and_attacked_by_a_seductive_man).
rule_category(a_poor_girl_is_harassed_and_attacked_by_a_seductive_man, romantic_attraction).
rule_source(a_poor_girl_is_harassed_and_attacked_by_a_seductive_man, ensemble).
rule_priority(a_poor_girl_is_harassed_and_attacked_by_a_seductive_man, 8).
rule_applies(a_poor_girl_is_harassed_and_attacked_by_a_seductive_man, X, Y) :-
    trait(X, male),
    trait(X, wearing_a_first_responder_uniform),
    event(X, harassed),
    event(Y, impressed),
    trait(Y, young),
    trait(Y, female),
    trait(Y, poor),
    trait(X, flirtatious).
rule_effect(a_poor_girl_is_harassed_and_attacked_by_a_seductive_man, set_relationship(Y, X, rivals, 10)).

rule_likelihood(an_old_clergy_seducer_harasses_a_young_criminal, 1).
rule_type(an_old_clergy_seducer_harasses_a_young_criminal, volition).
% An old clergy seducer harasses a young criminal
rule_active(an_old_clergy_seducer_harasses_a_young_criminal).
rule_category(an_old_clergy_seducer_harasses_a_young_criminal, romantic_attraction).
rule_source(an_old_clergy_seducer_harasses_a_young_criminal, ensemble).
rule_priority(an_old_clergy_seducer_harasses_a_young_criminal, 5).
rule_applies(an_old_clergy_seducer_harasses_a_young_criminal, X, Y) :-
    trait(X, male),
    trait(X, clergy),
    trait(X, old),
    trait(X, flirtatious),
    \+ trait(X, beautiful),
    trait(Y, female),
    trait(Y, young),
    event(Y, harassed),
    trait(Y, criminal).
rule_effect(an_old_clergy_seducer_harasses_a_young_criminal, set_relationship(X, Y, rivals, 5)).

rule_likelihood(gratitude_for_a_service_increases_affinity_and_emulation, 1).
rule_type(gratitude_for_a_service_increases_affinity_and_emulation, volition).
% Gratitude for a service increases affinity and emulation
rule_active(gratitude_for_a_service_increases_affinity_and_emulation).
rule_category(gratitude_for_a_service_increases_affinity_and_emulation, romantic_attraction).
rule_source(gratitude_for_a_service_increases_affinity_and_emulation, ensemble).
rule_priority(gratitude_for_a_service_increases_affinity_and_emulation, 3).
rule_applies(gratitude_for_a_service_increases_affinity_and_emulation, X, Y) :-
    directed_status(X, Y, owes_a_favor_to),
    network(X, Y, affinity, Affinity_val), Affinity_val > 50,
    status(X, grateful).
rule_effect(gratitude_for_a_service_increases_affinity_and_emulation, modify_network(X, Y, affinity, '+', 3)).
rule_effect(gratitude_for_a_service_increases_affinity_and_emulation, modify_network(X, Y, emulation, '+', 3)).

rule_likelihood(people_may_leverage_the_influence_of_their_friends_lovers, 1).
rule_type(people_may_leverage_the_influence_of_their_friends_lovers, volition).
% People may leverage the influence of their friends’ lovers
rule_active(people_may_leverage_the_influence_of_their_friends_lovers).
rule_category(people_may_leverage_the_influence_of_their_friends_lovers, romantic_attraction).
rule_source(people_may_leverage_the_influence_of_their_friends_lovers, ensemble).
rule_priority(people_may_leverage_the_influence_of_their_friends_lovers, 3).
rule_applies(people_may_leverage_the_influence_of_their_friends_lovers, X, Y) :-
    relationship(X, Y, friends),
    relationship(Y, 'z', lovers),
    trait('z', rich),
    attribute('z', social_standing, Social_standing_val), Social_standing_val > 80.
rule_effect(people_may_leverage_the_influence_of_their_friends_lovers, set_relationship(X, Y, ally, 3)).
rule_effect(people_may_leverage_the_influence_of_their_friends_lovers, set_relationship(Y, 'z', ally, 3)).

rule_likelihood(poor_provincial_seductive_joker_men_more_frequently_attempt_to_seduce_women, 1).
rule_type(poor_provincial_seductive_joker_men_more_frequently_attempt_to_seduce_women, volition).
% Poor, provincial, seductive, joker men more frequently attempt to seduce women
rule_active(poor_provincial_seductive_joker_men_more_frequently_attempt_to_seduce_women).
rule_category(poor_provincial_seductive_joker_men_more_frequently_attempt_to_seduce_women, romantic_attraction).
rule_source(poor_provincial_seductive_joker_men_more_frequently_attempt_to_seduce_women, ensemble).
rule_priority(poor_provincial_seductive_joker_men_more_frequently_attempt_to_seduce_women, 5).
rule_applies(poor_provincial_seductive_joker_men_more_frequently_attempt_to_seduce_women, X, Y) :-
    trait(Y, joker),
    trait(Y, provincial),
    trait(Y, innocent_looking),
    trait(Y, male),
    trait(Y, flirtatious),
    trait(X, female),
    trait(Y, deceptive),
    trait(Y, poor),
    trait(X, flirtatious).
rule_effect(poor_provincial_seductive_joker_men_more_frequently_attempt_to_seduce_women, modify_network(X, Y, affinity, '+', 3)).
rule_effect(poor_provincial_seductive_joker_men_more_frequently_attempt_to_seduce_women, set_relationship(X, Y, ally, 5)).

rule_likelihood(men_flirting_with_several_women_tend_to_want_the_female_with_a_higher_rank, 1).
rule_type(men_flirting_with_several_women_tend_to_want_the_female_with_a_higher_rank, volition).
% Men flirting with several women tend to want the female with a higher rank
rule_active(men_flirting_with_several_women_tend_to_want_the_female_with_a_higher_rank).
rule_category(men_flirting_with_several_women_tend_to_want_the_female_with_a_higher_rank, romantic_attraction).
rule_source(men_flirting_with_several_women_tend_to_want_the_female_with_a_higher_rank, ensemble).
rule_priority(men_flirting_with_several_women_tend_to_want_the_female_with_a_higher_rank, 3).
rule_applies(men_flirting_with_several_women_tend_to_want_the_female_with_a_higher_rank, X, Y) :-
    trait(Y, male),
    trait(X, female),
    trait(Y, poor),
    trait('z', rich),
    trait(X, poor),
    trait('z', female),
    trait(Y, innocent_looking),
    trait(Y, flirtatious).
rule_effect(men_flirting_with_several_women_tend_to_want_the_female_with_a_higher_rank, modify_network(Y, X, affinity, '+', 1)).
rule_effect(men_flirting_with_several_women_tend_to_want_the_female_with_a_higher_rank, modify_network(Y, 'z', affinity, '+', 3)).

rule_likelihood(if_a_male_flirts_with_a_female_and_shows_less_interest_she_will_be_more_likely_to_want_him, 1).
rule_type(if_a_male_flirts_with_a_female_and_shows_less_interest_she_will_be_more_likely_to_want_him, volition).
% If a male flirts with a female and shows less interest, she will be more likely to want him
rule_active(if_a_male_flirts_with_a_female_and_shows_less_interest_she_will_be_more_likely_to_want_him).
rule_category(if_a_male_flirts_with_a_female_and_shows_less_interest_she_will_be_more_likely_to_want_him, romantic_attraction).
rule_source(if_a_male_flirts_with_a_female_and_shows_less_interest_she_will_be_more_likely_to_want_him, ensemble).
rule_priority(if_a_male_flirts_with_a_female_and_shows_less_interest_she_will_be_more_likely_to_want_him, 3).
rule_applies(if_a_male_flirts_with_a_female_and_shows_less_interest_she_will_be_more_likely_to_want_him, X, Y) :-
    network(X, Y, affinity, Affinity_val), Affinity_val < 60,
    trait(X, male),
    trait(Y, female),
    event(X, flirted_with),
    network(Y, X, affinity, Affinity_val), Affinity_val > 60.
rule_effect(if_a_male_flirts_with_a_female_and_shows_less_interest_she_will_be_more_likely_to_want_him, modify_network(X, Y, curiosity, '-', 2)).
rule_effect(if_a_male_flirts_with_a_female_and_shows_less_interest_she_will_be_more_likely_to_want_him, set_relationship(Y, X, ally, 3)).
rule_effect(if_a_male_flirts_with_a_female_and_shows_less_interest_she_will_be_more_likely_to_want_him, modify_network(Y, X, curiosity, '+', 3)).

rule_likelihood(beautiful_flirty_people_will_seek_to_attact_attention, 1).
rule_type(beautiful_flirty_people_will_seek_to_attact_attention, volition).
% Beautiful, flirty people will seek to attact attention
rule_active(beautiful_flirty_people_will_seek_to_attact_attention).
rule_category(beautiful_flirty_people_will_seek_to_attact_attention, romantic_attraction).
rule_source(beautiful_flirty_people_will_seek_to_attact_attention, ensemble).
rule_priority(beautiful_flirty_people_will_seek_to_attact_attention, 3).
rule_applies(beautiful_flirty_people_will_seek_to_attact_attention, X, Y) :-
    attribute(X, charisma, Charisma_val), Charisma_val > 60,
    trait(X, beautiful),
    trait(X, flirtatious).
rule_effect(beautiful_flirty_people_will_seek_to_attact_attention, modify_network(X, Y, curiosity, '+', 3)).

rule_likelihood(a_rich_man_seducing_a_poor_young_woman_is_less_likely_to_take_no_for_an_answer, 1).
rule_type(a_rich_man_seducing_a_poor_young_woman_is_less_likely_to_take_no_for_an_answer, volition).
% A rich man seducing a poor young woman is less likely to take no for an answer
rule_active(a_rich_man_seducing_a_poor_young_woman_is_less_likely_to_take_no_for_an_answer).
rule_category(a_rich_man_seducing_a_poor_young_woman_is_less_likely_to_take_no_for_an_answer, romantic_attraction).
rule_source(a_rich_man_seducing_a_poor_young_woman_is_less_likely_to_take_no_for_an_answer, ensemble).
rule_priority(a_rich_man_seducing_a_poor_young_woman_is_less_likely_to_take_no_for_an_answer, 3).
rule_applies(a_rich_man_seducing_a_poor_young_woman_is_less_likely_to_take_no_for_an_answer, X, Y) :-
    trait(Y, male),
    trait(Y, rich),
    trait(X, poor),
    trait(X, female),
    attribute(Y, self_assuredness, Self_assuredness_val), Self_assuredness_val > 60,
    trait(Y, flirtatious),
    trait(Y, intimidating),
    directed_status(X, Y, financially_dependent_on),
    directed_status(X, Y, offended_by).
rule_effect(a_rich_man_seducing_a_poor_young_woman_is_less_likely_to_take_no_for_an_answer, modify_network(Y, X, affinity, '+', 3)).
rule_effect(a_rich_man_seducing_a_poor_young_woman_is_less_likely_to_take_no_for_an_answer, modify_network(Y, X, curiosity, '+', 3)).
rule_effect(a_rich_man_seducing_a_poor_young_woman_is_less_likely_to_take_no_for_an_answer, set_relationship(Y, X, ally, 3)).

rule_likelihood(married_people_dislike_people_who_flirt_with_their_spouse, 1).
rule_type(married_people_dislike_people_who_flirt_with_their_spouse, volition).
% Married people dislike people who flirt with their spouse
rule_active(married_people_dislike_people_who_flirt_with_their_spouse).
rule_category(married_people_dislike_people_who_flirt_with_their_spouse, romantic_attraction).
rule_source(married_people_dislike_people_who_flirt_with_their_spouse, ensemble).
rule_priority(married_people_dislike_people_who_flirt_with_their_spouse, 8).
rule_applies(married_people_dislike_people_who_flirt_with_their_spouse, X, Y) :-
    relationship(X, Y, married),
    trait('z', flirtatious).
rule_effect(married_people_dislike_people_who_flirt_with_their_spouse, modify_network(X, 'z', affinity, '-', 10)).

rule_likelihood(old_generous_rich_women_may_have_an_affinity_for_poor_attractive_men, 1).
rule_type(old_generous_rich_women_may_have_an_affinity_for_poor_attractive_men, volition).
% Old, generous, rich women may have an affinity for poor, attractive men
rule_active(old_generous_rich_women_may_have_an_affinity_for_poor_attractive_men).
rule_category(old_generous_rich_women_may_have_an_affinity_for_poor_attractive_men, romantic_attraction).
rule_source(old_generous_rich_women_may_have_an_affinity_for_poor_attractive_men, ensemble).
rule_priority(old_generous_rich_women_may_have_an_affinity_for_poor_attractive_men, 5).
rule_applies(old_generous_rich_women_may_have_an_affinity_for_poor_attractive_men, X, Y) :-
    trait(X, male),
    trait(Y, female),
    trait(Y, rich),
    trait(Y, generous),
    \+ trait(X, rich),
    trait(Y, old),
    trait(X, innocent_looking).
rule_effect(old_generous_rich_women_may_have_an_affinity_for_poor_attractive_men, modify_network(Y, X, affinity, '+', 5)).

rule_likelihood(a_shy_man_may_be_less_enterprising_toward_the_woman_he_loves, 1).
rule_type(a_shy_man_may_be_less_enterprising_toward_the_woman_he_loves, volition).
% A shy man may be less enterprising toward the woman he loves
rule_active(a_shy_man_may_be_less_enterprising_toward_the_woman_he_loves).
rule_category(a_shy_man_may_be_less_enterprising_toward_the_woman_he_loves, romantic_attraction).
rule_source(a_shy_man_may_be_less_enterprising_toward_the_woman_he_loves, ensemble).
rule_priority(a_shy_man_may_be_less_enterprising_toward_the_woman_he_loves, 5).
rule_applies(a_shy_man_may_be_less_enterprising_toward_the_woman_he_loves, X, Y) :-
    trait(X, shy),
    trait(X, male),
    trait(Y, female),
    network(X, Y, affinity, Affinity_val), Affinity_val > 75.
rule_effect(a_shy_man_may_be_less_enterprising_toward_the_woman_he_loves, modify_network(X, Y, curiosity, '-', 5)).

rule_likelihood(rich_men_may_be_more_attentive_to_charming_women_in_order_to_seduce_that_woman_s_acquaintance, 1).
rule_type(rich_men_may_be_more_attentive_to_charming_women_in_order_to_seduce_that_woman_s_acquaintance, volition).
% Rich men may be more attentive to charming women in order to seduce that woman’s acquaintance
rule_active(rich_men_may_be_more_attentive_to_charming_women_in_order_to_seduce_that_woman_s_acquaintance).
rule_category(rich_men_may_be_more_attentive_to_charming_women_in_order_to_seduce_that_woman_s_acquaintance, romantic_attraction).
rule_source(rich_men_may_be_more_attentive_to_charming_women_in_order_to_seduce_that_woman_s_acquaintance, ensemble).
rule_priority(rich_men_may_be_more_attentive_to_charming_women_in_order_to_seduce_that_woman_s_acquaintance, 5).
rule_applies(rich_men_may_be_more_attentive_to_charming_women_in_order_to_seduce_that_woman_s_acquaintance, X, Y) :-
    trait(X, male),
    trait(X, rich),
    trait(Y, female),
    trait(Y, rich),
    trait('z', female),
    trait('z', charming),
    relationship(Y, 'z', ally),
    network(X, 'z', affinity, Affinity_val), Affinity_val > 80,
    trait('z', rich).
rule_effect(rich_men_may_be_more_attentive_to_charming_women_in_order_to_seduce_that_woman_s_acquaintance, modify_network(X, 'z', affinity, '+', 5)).
rule_effect(rich_men_may_be_more_attentive_to_charming_women_in_order_to_seduce_that_woman_s_acquaintance, modify_network(X, Y, curiosity, '+', 5)).

rule_likelihood(a_seductive_and_attractive_woman_doesn_t_want_to_be_financially_controlled_by_a_rich_man, 1).
rule_type(a_seductive_and_attractive_woman_doesn_t_want_to_be_financially_controlled_by_a_rich_man, volition).
% A seductive and attractive woman doesn’t want to be financially controlled by a rich man
rule_active(a_seductive_and_attractive_woman_doesn_t_want_to_be_financially_controlled_by_a_rich_man).
rule_category(a_seductive_and_attractive_woman_doesn_t_want_to_be_financially_controlled_by_a_rich_man, romantic_attraction).
rule_source(a_seductive_and_attractive_woman_doesn_t_want_to_be_financially_controlled_by_a_rich_man, ensemble).
rule_priority(a_seductive_and_attractive_woman_doesn_t_want_to_be_financially_controlled_by_a_rich_man, 5).
rule_applies(a_seductive_and_attractive_woman_doesn_t_want_to_be_financially_controlled_by_a_rich_man, X, Y) :-
    trait(X, beautiful),
    trait(X, flirtatious),
    trait(Y, rich),
    trait(Y, rich),
    trait(X, female),
    trait(Y, male),
    \+ directed_status(X, 'z', financially_dependent_on),
    trait('z', male).
rule_effect(a_seductive_and_attractive_woman_doesn_t_want_to_be_financially_controlled_by_a_rich_man, modify_network(X, Y, affinity, '-', 5)).
rule_effect(a_seductive_and_attractive_woman_doesn_t_want_to_be_financially_controlled_by_a_rich_man, modify_network(X, Y, curiosity, '-', 5)).

rule_likelihood(young_unsophisticated_women_may_have_increased_affinity_for_charming_charismatic_men, 1).
rule_type(young_unsophisticated_women_may_have_increased_affinity_for_charming_charismatic_men, volition).
% Young, unsophisticated women may have increased affinity for charming, charismatic men
rule_active(young_unsophisticated_women_may_have_increased_affinity_for_charming_charismatic_men).
rule_category(young_unsophisticated_women_may_have_increased_affinity_for_charming_charismatic_men, romantic_attraction).
rule_source(young_unsophisticated_women_may_have_increased_affinity_for_charming_charismatic_men, ensemble).
rule_priority(young_unsophisticated_women_may_have_increased_affinity_for_charming_charismatic_men, 5).
rule_applies(young_unsophisticated_women_may_have_increased_affinity_for_charming_charismatic_men, X, Y) :-
    trait(X, young),
    trait(X, female),
    trait(Y, charming),
    trait(Y, male),
    attribute(Y, charisma, Charisma_val), Charisma_val > 60,
    attribute(X, sophistication, Sophistication_val), Sophistication_val < 60.
rule_effect(young_unsophisticated_women_may_have_increased_affinity_for_charming_charismatic_men, modify_network(X, Y, affinity, '+', 5)).

rule_likelihood(charismatic_lovers_may_encourage_inpropriety, 1).
rule_type(charismatic_lovers_may_encourage_inpropriety, volition).
% Charismatic lovers may encourage inpropriety
rule_active(charismatic_lovers_may_encourage_inpropriety).
rule_category(charismatic_lovers_may_encourage_inpropriety, romantic_attraction).
rule_source(charismatic_lovers_may_encourage_inpropriety, ensemble).
rule_priority(charismatic_lovers_may_encourage_inpropriety, 5).
rule_applies(charismatic_lovers_may_encourage_inpropriety, X, Y) :-
    attribute(X, charisma, Charisma_val), Charisma_val > 70,
    trait(X, beautiful),
    attribute(X, propriety, Propriety_val), Propriety_val < 50,
    relationship(X, Y, lovers),
    directed_status(Y, X, cares_for).
rule_effect(charismatic_lovers_may_encourage_inpropriety, modify_network(X, Y, emulation, '+', 5)).

rule_likelihood(rich_people_may_enjoy_a_financially_imbalanced_relationship_with_an_attractive_lover, 1).
rule_type(rich_people_may_enjoy_a_financially_imbalanced_relationship_with_an_attractive_lover, volition).
% Rich people may enjoy a financially imbalanced relationship with an attractive lover
rule_active(rich_people_may_enjoy_a_financially_imbalanced_relationship_with_an_attractive_lover).
rule_category(rich_people_may_enjoy_a_financially_imbalanced_relationship_with_an_attractive_lover, romantic_attraction).
rule_source(rich_people_may_enjoy_a_financially_imbalanced_relationship_with_an_attractive_lover, ensemble).
rule_priority(rich_people_may_enjoy_a_financially_imbalanced_relationship_with_an_attractive_lover, 3).
rule_applies(rich_people_may_enjoy_a_financially_imbalanced_relationship_with_an_attractive_lover, X, Y) :-
    trait(X, rich),
    attribute(Y, charisma, Charisma_val), Charisma_val > 70,
    trait(X, male),
    trait(Y, female),
    directed_status(Y, X, financially_dependent_on),
    relationship(Y, X, lovers).
rule_effect(rich_people_may_enjoy_a_financially_imbalanced_relationship_with_an_attractive_lover, modify_network(X, Y, affinity, '+', 3)).

rule_likelihood(charming_lovers_may_draw_positive_attention_despite_their_mocking_behavior, 1).
rule_type(charming_lovers_may_draw_positive_attention_despite_their_mocking_behavior, volition).
% Charming lovers may draw positive attention despite their mocking behavior
rule_active(charming_lovers_may_draw_positive_attention_despite_their_mocking_behavior).
rule_category(charming_lovers_may_draw_positive_attention_despite_their_mocking_behavior, romantic_attraction).
rule_source(charming_lovers_may_draw_positive_attention_despite_their_mocking_behavior, ensemble).
rule_priority(charming_lovers_may_draw_positive_attention_despite_their_mocking_behavior, 5).
rule_applies(charming_lovers_may_draw_positive_attention_despite_their_mocking_behavior, X, Y) :-
    trait(X, mocking),
    trait(X, female),
    trait(X, charming),
    trait(Y, male),
    relationship(X, Y, lovers).
rule_effect(charming_lovers_may_draw_positive_attention_despite_their_mocking_behavior, modify_network(Y, X, affinity, '+', 5)).

rule_likelihood(daughters_caught_with_their_lovers_may_become_more_cautious, 1).
rule_type(daughters_caught_with_their_lovers_may_become_more_cautious, volition).
% Daughters caught with their lovers may become more cautious
rule_active(daughters_caught_with_their_lovers_may_become_more_cautious).
rule_category(daughters_caught_with_their_lovers_may_become_more_cautious, romantic_attraction).
rule_source(daughters_caught_with_their_lovers_may_become_more_cautious, ensemble).
rule_priority(daughters_caught_with_their_lovers_may_become_more_cautious, 3).
rule_applies(daughters_caught_with_their_lovers_may_become_more_cautious, X, Y) :-
    relationship(X, Y, ally),
    directed_status(X, Y, cares_for),
    directed_status(Y, X, financially_dependent_on),
    event(Y, caught_in_a_lie_by),
    trait(X, female),
    trait(Y, female).
rule_effect(daughters_caught_with_their_lovers_may_become_more_cautious, modify_network(Y, X, credibility, '+', 3)).
rule_effect(daughters_caught_with_their_lovers_may_become_more_cautious, set_relationship(X, Y, esteem, 1)).

rule_likelihood(a_young_boy_may_fall_in_love_with_a_young_caring_woman, 1).
rule_type(a_young_boy_may_fall_in_love_with_a_young_caring_woman, volition).
% A young boy may fall in love with a young caring woman
rule_active(a_young_boy_may_fall_in_love_with_a_young_caring_woman).
rule_category(a_young_boy_may_fall_in_love_with_a_young_caring_woman, romantic_attraction).
rule_source(a_young_boy_may_fall_in_love_with_a_young_caring_woman, ensemble).
rule_priority(a_young_boy_may_fall_in_love_with_a_young_caring_woman, 5).
rule_applies(a_young_boy_may_fall_in_love_with_a_young_caring_woman, X, Y) :-
    trait(X, child),
    trait(X, male),
    trait(Y, female),
    trait(Y, young),
    directed_status(Y, X, cares_for).
rule_effect(a_young_boy_may_fall_in_love_with_a_young_caring_woman, modify_network(X, Y, affinity, '+', 5)).
rule_effect(a_young_boy_may_fall_in_love_with_a_young_caring_woman, modify_network(X, Y, curiosity, '+', 5)).

rule_likelihood(mothers_can_become_angry_with_their_unmarried_daughter_s_lover, 1).
rule_type(mothers_can_become_angry_with_their_unmarried_daughter_s_lover, volition).
% Mothers can become angry with their unmarried daughter’s lover
rule_active(mothers_can_become_angry_with_their_unmarried_daughter_s_lover).
rule_category(mothers_can_become_angry_with_their_unmarried_daughter_s_lover, romantic_attraction).
rule_source(mothers_can_become_angry_with_their_unmarried_daughter_s_lover, ensemble).
rule_priority(mothers_can_become_angry_with_their_unmarried_daughter_s_lover, 5).
rule_applies(mothers_can_become_angry_with_their_unmarried_daughter_s_lover, X, Y) :-
    trait(X, female),
    trait(Y, male),
    relationship(X, Y, lovers),
    \+ relationship(X, Y, married),
    directed_status(X, 'z', financially_dependent_on),
    trait('z', female).
rule_effect(mothers_can_become_angry_with_their_unmarried_daughter_s_lover, modify_network('z', Y, affinity, '+', 5)).
rule_effect(mothers_can_become_angry_with_their_unmarried_daughter_s_lover, modify_network(Y, 'z', affinity, '+', 5)).
rule_effect(mothers_can_become_angry_with_their_unmarried_daughter_s_lover, modify_network(X, Y, affinity, '+', 2)).
rule_effect(mothers_can_become_angry_with_their_unmarried_daughter_s_lover, modify_network(Y, X, affinity, '+', 2)).
rule_effect(mothers_can_become_angry_with_their_unmarried_daughter_s_lover, set_relationship(X, Y, ally, 3)).
rule_effect(mothers_can_become_angry_with_their_unmarried_daughter_s_lover, modify_network(Y, 'z', credibility, '+', 5)).

rule_likelihood(people_s_desire_to_get_closer_in_a_romantic_network_when_the_difference_between_their_current_connection, 1).
rule_type(people_s_desire_to_get_closer_in_a_romantic_network_when_the_difference_between_their_current_connection, volition).
% People’s desire to get closer in a romantic network when the difference between their current connection
rule_active(people_s_desire_to_get_closer_in_a_romantic_network_when_the_difference_between_their_current_connection).
rule_category(people_s_desire_to_get_closer_in_a_romantic_network_when_the_difference_between_their_current_connection, romantic_attraction).
rule_source(people_s_desire_to_get_closer_in_a_romantic_network_when_the_difference_between_their_current_connection, ensemble).
rule_priority(people_s_desire_to_get_closer_in_a_romantic_network_when_the_difference_between_their_current_connection, 1).
rule_applies(people_s_desire_to_get_closer_in_a_romantic_network_when_the_difference_between_their_current_connection, X, Y) :-
    network(X, Y, romance, Romance_val), Romance_val > 3,
    network(X, Y, romance, Romance_val), Romance_val < 7.
rule_effect(people_s_desire_to_get_closer_in_a_romantic_network_when_the_difference_between_their_current_connection, set_intent(X, antagonize, Y, -1)).

rule_likelihood(people_s_crushes_have_a_strong_influence_on_their_social_behavior_within_the_last_year, 1).
rule_type(people_s_crushes_have_a_strong_influence_on_their_social_behavior_within_the_last_year, volition).
% People’s crushes have a strong influence on their social behavior within the last year.
rule_active(people_s_crushes_have_a_strong_influence_on_their_social_behavior_within_the_last_year).
rule_category(people_s_crushes_have_a_strong_influence_on_their_social_behavior_within_the_last_year, romantic_attraction).
rule_source(people_s_crushes_have_a_strong_influence_on_their_social_behavior_within_the_last_year, ensemble).
rule_priority(people_s_crushes_have_a_strong_influence_on_their_social_behavior_within_the_last_year, 1).
rule_applies(people_s_crushes_have_a_strong_influence_on_their_social_behavior_within_the_last_year, X, Y) :-
    event(X, mean).
rule_effect(people_s_crushes_have_a_strong_influence_on_their_social_behavior_within_the_last_year, set_intent(X, antagonize, Y, 1)).

rule_likelihood(people_have_a_strong_antipathy_towards_both_individual_a_and_their_crush, 1).
rule_type(people_have_a_strong_antipathy_towards_both_individual_a_and_their_crush, volition).
% People have a strong antipathy towards both individual A and their crush.
rule_active(people_have_a_strong_antipathy_towards_both_individual_a_and_their_crush).
rule_category(people_have_a_strong_antipathy_towards_both_individual_a_and_their_crush, romantic_attraction).
rule_source(people_have_a_strong_antipathy_towards_both_individual_a_and_their_crush, ensemble).
rule_priority(people_have_a_strong_antipathy_towards_both_individual_a_and_their_crush, 1).
rule_applies(people_have_a_strong_antipathy_towards_both_individual_a_and_their_crush, X, Y) :-
    intent(X, antagonize, 'z'),
    intent(Y, antagonize, 'z').
rule_effect(people_have_a_strong_antipathy_towards_both_individual_a_and_their_crush, set_intent(X, antagonize, Y, -2)).

rule_likelihood(people_seek_romantic_connections_with_individuals_perceived_as_stronger_than_themselves_and_have_recently_expressed_interest_in, 1).
rule_type(people_seek_romantic_connections_with_individuals_perceived_as_stronger_than_themselves_and_have_recently_expressed_interest_in, volition).
% People seek romantic connections with individuals perceived as stronger than themselves and have recently expressed interest in
rule_active(people_seek_romantic_connections_with_individuals_perceived_as_stronger_than_themselves_and_have_recently_expressed_interest_in).
rule_category(people_seek_romantic_connections_with_individuals_perceived_as_stronger_than_themselves_and_have_recently_expressed_interest_in, romantic_attraction).
rule_source(people_seek_romantic_connections_with_individuals_perceived_as_stronger_than_themselves_and_have_recently_expressed_interest_in, ensemble).
rule_priority(people_seek_romantic_connections_with_individuals_perceived_as_stronger_than_themselves_and_have_recently_expressed_interest_in, 3).
rule_applies(people_seek_romantic_connections_with_individuals_perceived_as_stronger_than_themselves_and_have_recently_expressed_interest_in, X, Y) :-
    network(X, 'z', romance, Romance_val), Romance_val > 6,
    event(Y, romantic).
rule_effect(people_seek_romantic_connections_with_individuals_perceived_as_stronger_than_themselves_and_have_recently_expressed_interest_in, set_intent(X, antagonize, Y, 3)).

rule_likelihood(people_s_desire_to_get_closer_within_a_strong_social_network_and_recent_romantic_events_increase_the, 1).
rule_type(people_s_desire_to_get_closer_within_a_strong_social_network_and_recent_romantic_events_increase_the, volition).
% People’s desire to get closer within a strong social network and recent romantic events increase the
rule_active(people_s_desire_to_get_closer_within_a_strong_social_network_and_recent_romantic_events_increase_the).
rule_category(people_s_desire_to_get_closer_within_a_strong_social_network_and_recent_romantic_events_increase_the, romantic_attraction).
rule_source(people_s_desire_to_get_closer_within_a_strong_social_network_and_recent_romantic_events_increase_the, ensemble).
rule_priority(people_s_desire_to_get_closer_within_a_strong_social_network_and_recent_romantic_events_increase_the, 1).
rule_applies(people_s_desire_to_get_closer_within_a_strong_social_network_and_recent_romantic_events_increase_the, X, Y) :-
    network(X, 'z', romance, Romance_val), Romance_val > 6,
    event(Y, mean).
rule_effect(people_s_desire_to_get_closer_within_a_strong_social_network_and_recent_romantic_events_increase_the, set_intent(X, antagonize, Y, 1)).

rule_likelihood(people_are_romantically_committed_to_their_crushes_and_have_a_strong_intent_towards_dating, 1).
rule_type(people_are_romantically_committed_to_their_crushes_and_have_a_strong_intent_towards_dating, volition).
% People are romantically committed to their crushes and have a strong intent towards dating
rule_active(people_are_romantically_committed_to_their_crushes_and_have_a_strong_intent_towards_dating).
rule_category(people_are_romantically_committed_to_their_crushes_and_have_a_strong_intent_towards_dating, romantic_attraction).
rule_source(people_are_romantically_committed_to_their_crushes_and_have_a_strong_intent_towards_dating, ensemble).
rule_priority(people_are_romantically_committed_to_their_crushes_and_have_a_strong_intent_towards_dating, 1).
rule_applies(people_are_romantically_committed_to_their_crushes_and_have_a_strong_intent_towards_dating, X, Y) :-
    directed_status(X, Y, publicly_romantically_committed_to).
rule_effect(people_are_romantically_committed_to_their_crushes_and_have_a_strong_intent_towards_dating, set_intent(X, candid, Y, 2)).

rule_likelihood(people_seek_friends_within_a_moderate_friendship_proximity_range_to_their_crush, 1).
rule_type(people_seek_friends_within_a_moderate_friendship_proximity_range_to_their_crush, volition).
% People seek friends within a moderate friendship proximity range to their crush.
rule_active(people_seek_friends_within_a_moderate_friendship_proximity_range_to_their_crush).
rule_category(people_seek_friends_within_a_moderate_friendship_proximity_range_to_their_crush, romantic_attraction).
rule_source(people_seek_friends_within_a_moderate_friendship_proximity_range_to_their_crush, ensemble).
rule_priority(people_seek_friends_within_a_moderate_friendship_proximity_range_to_their_crush, 1).
rule_applies(people_seek_friends_within_a_moderate_friendship_proximity_range_to_their_crush, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val > 3,
    network(X, Y, friendship, Friendship_val), Friendship_val < 7.
rule_effect(people_seek_friends_within_a_moderate_friendship_proximity_range_to_their_crush, set_intent(X, candid, Y, 1)).

rule_likelihood(people_with_a_successful_status_are_more_likely_to_be_interested_in_dating_their_crush, 1).
rule_type(people_with_a_successful_status_are_more_likely_to_be_interested_in_dating_their_crush, volition).
% People with a successful status are more likely to be interested in dating their crush.
rule_active(people_with_a_successful_status_are_more_likely_to_be_interested_in_dating_their_crush).
rule_category(people_with_a_successful_status_are_more_likely_to_be_interested_in_dating_their_crush, romantic_attraction).
rule_source(people_with_a_successful_status_are_more_likely_to_be_interested_in_dating_their_crush, ensemble).
rule_priority(people_with_a_successful_status_are_more_likely_to_be_interested_in_dating_their_crush, 1).
rule_applies(people_with_a_successful_status_are_more_likely_to_be_interested_in_dating_their_crush, X, Y) :-
    status(X, successful).
rule_effect(people_with_a_successful_status_are_more_likely_to_be_interested_in_dating_their_crush, set_intent(X, candid, Y, 1)).

rule_likelihood(people_seek_companions_with_greater_wisdom_when_they_desire_a_closer_relationship_or_potential_romantic_interest, 1).
rule_type(people_seek_companions_with_greater_wisdom_when_they_desire_a_closer_relationship_or_potential_romantic_interest, volition).
% People seek companions with greater wisdom when they desire a closer relationship or potential romantic interest.
rule_active(people_seek_companions_with_greater_wisdom_when_they_desire_a_closer_relationship_or_potential_romantic_interest).
rule_category(people_seek_companions_with_greater_wisdom_when_they_desire_a_closer_relationship_or_potential_romantic_interest, romantic_attraction).
rule_source(people_seek_companions_with_greater_wisdom_when_they_desire_a_closer_relationship_or_potential_romantic_interest, ensemble).
rule_priority(people_seek_companions_with_greater_wisdom_when_they_desire_a_closer_relationship_or_potential_romantic_interest, 1).
rule_applies(people_seek_companions_with_greater_wisdom_when_they_desire_a_closer_relationship_or_potential_romantic_interest, X, Y) :-
    attribute(X, wisdom, Wisdom_val), Wisdom_val > 12.
rule_effect(people_seek_companions_with_greater_wisdom_when_they_desire_a_closer_relationship_or_potential_romantic_interest, set_intent(X, candid, Y, 2)).

rule_likelihood(people_are_attracted_to_individuals_with_high_charisma_levels_when_seeking_a_romantic_partner, 1).
rule_type(people_are_attracted_to_individuals_with_high_charisma_levels_when_seeking_a_romantic_partner, volition).
% People are attracted to individuals with high charisma levels when seeking a romantic partner.
rule_active(people_are_attracted_to_individuals_with_high_charisma_levels_when_seeking_a_romantic_partner).
rule_category(people_are_attracted_to_individuals_with_high_charisma_levels_when_seeking_a_romantic_partner, romantic_attraction).
rule_source(people_are_attracted_to_individuals_with_high_charisma_levels_when_seeking_a_romantic_partner, ensemble).
rule_priority(people_are_attracted_to_individuals_with_high_charisma_levels_when_seeking_a_romantic_partner, 1).
rule_applies(people_are_attracted_to_individuals_with_high_charisma_levels_when_seeking_a_romantic_partner, X, Y) :-
    attribute(X, charisma, Charisma_val), Charisma_val > 12.
rule_effect(people_are_attracted_to_individuals_with_high_charisma_levels_when_seeking_a_romantic_partner, set_intent(X, candid, Y, 2)).

rule_likelihood(people_desire_to_date_their_crushes_after_a_positive_social_interaction_within_the_last_month, 1).
rule_type(people_desire_to_date_their_crushes_after_a_positive_social_interaction_within_the_last_month, volition).
% People desire to date their crushes after a positive social interaction within the last month.
rule_active(people_desire_to_date_their_crushes_after_a_positive_social_interaction_within_the_last_month).
rule_category(people_desire_to_date_their_crushes_after_a_positive_social_interaction_within_the_last_month, romantic_attraction).
rule_source(people_desire_to_date_their_crushes_after_a_positive_social_interaction_within_the_last_month, ensemble).
rule_priority(people_desire_to_date_their_crushes_after_a_positive_social_interaction_within_the_last_month, 1).
rule_applies(people_desire_to_date_their_crushes_after_a_positive_social_interaction_within_the_last_month, X, Y) :-
    event(X, nice).
rule_effect(people_desire_to_date_their_crushes_after_a_positive_social_interaction_within_the_last_month, set_intent(X, candid, Y, 1)).

rule_likelihood(people_are_interested_in_strong_individuals_and_have_a_significant_desire_to_date_their_crushes_who_also, 1).
rule_type(people_are_interested_in_strong_individuals_and_have_a_significant_desire_to_date_their_crushes_who_also, volition).
% People are interested in strong individuals and have a significant desire to date their crushes who also
rule_active(people_are_interested_in_strong_individuals_and_have_a_significant_desire_to_date_their_crushes_who_also).
rule_category(people_are_interested_in_strong_individuals_and_have_a_significant_desire_to_date_their_crushes_who_also, romantic_attraction).
rule_source(people_are_interested_in_strong_individuals_and_have_a_significant_desire_to_date_their_crushes_who_also, ensemble).
rule_priority(people_are_interested_in_strong_individuals_and_have_a_significant_desire_to_date_their_crushes_who_also, 5).
rule_applies(people_are_interested_in_strong_individuals_and_have_a_significant_desire_to_date_their_crushes_who_also, X, Y) :-
    network(X, 'z', romance, Romance_val), Romance_val > 6,
    network(Y, 'z', romance, Romance_val), Romance_val > 6.
rule_effect(people_are_interested_in_strong_individuals_and_have_a_significant_desire_to_date_their_crushes_who_also, set_intent(X, candid, Y, -5)).

rule_likelihood(people_seeking_romance_with_strong_individuals_and_having_a_high_interest_in_their_crush_within_the_past, 1).
rule_type(people_seeking_romance_with_strong_individuals_and_having_a_high_interest_in_their_crush_within_the_past, volition).
% People seeking romance with strong individuals and having a high interest in their crush within the past
rule_active(people_seeking_romance_with_strong_individuals_and_having_a_high_interest_in_their_crush_within_the_past).
rule_category(people_seeking_romance_with_strong_individuals_and_having_a_high_interest_in_their_crush_within_the_past, romantic_attraction).
rule_source(people_seeking_romance_with_strong_individuals_and_having_a_high_interest_in_their_crush_within_the_past, ensemble).
rule_priority(people_seeking_romance_with_strong_individuals_and_having_a_high_interest_in_their_crush_within_the_past, 1).
rule_applies(people_seeking_romance_with_strong_individuals_and_having_a_high_interest_in_their_crush_within_the_past, X, Y) :-
    network(X, 'z', romance, Romance_val), Romance_val > 6,
    event(Y, mean).
rule_effect(people_seeking_romance_with_strong_individuals_and_having_a_high_interest_in_their_crush_within_the_past, set_intent(X, candid, Y, -1)).

rule_likelihood(people_with_a_strong_desire_to_form_romantic_connections_seek_out_individuals_who_are_highly_sought_after_by, 1).
rule_type(people_with_a_strong_desire_to_form_romantic_connections_seek_out_individuals_who_are_highly_sought_after_by, volition).
% People with a strong desire to form romantic connections seek out individuals who are highly sought after by
rule_active(people_with_a_strong_desire_to_form_romantic_connections_seek_out_individuals_who_are_highly_sought_after_by).
rule_category(people_with_a_strong_desire_to_form_romantic_connections_seek_out_individuals_who_are_highly_sought_after_by, romantic_attraction).
rule_source(people_with_a_strong_desire_to_form_romantic_connections_seek_out_individuals_who_are_highly_sought_after_by, ensemble).
rule_priority(people_with_a_strong_desire_to_form_romantic_connections_seek_out_individuals_who_are_highly_sought_after_by, 1).
rule_applies(people_with_a_strong_desire_to_form_romantic_connections_seek_out_individuals_who_are_highly_sought_after_by, X, Y) :-
    network(X, 'z', romance, Romance_val), Romance_val > 6,
    event(Y, mean).
rule_effect(people_with_a_strong_desire_to_form_romantic_connections_seek_out_individuals_who_are_highly_sought_after_by, set_intent(X, candid, Y, -1)).

rule_likelihood(people_with_a_strong_familial_network_of_at_least_6_connections_are_likely_to_develop_romantic, 1).
rule_type(people_with_a_strong_familial_network_of_at_least_6_connections_are_likely_to_develop_romantic, volition).
% People with a strong familial network of at least 6 connections are likely to develop romantic
rule_active(people_with_a_strong_familial_network_of_at_least_6_connections_are_likely_to_develop_romantic).
rule_category(people_with_a_strong_familial_network_of_at_least_6_connections_are_likely_to_develop_romantic, romantic_attraction).
rule_source(people_with_a_strong_familial_network_of_at_least_6_connections_are_likely_to_develop_romantic, ensemble).
rule_priority(people_with_a_strong_familial_network_of_at_least_6_connections_are_likely_to_develop_romantic, 1).
rule_applies(people_with_a_strong_familial_network_of_at_least_6_connections_are_likely_to_develop_romantic, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, mean).
rule_effect(people_with_a_strong_familial_network_of_at_least_6_connections_are_likely_to_develop_romantic, set_intent(X, candid, Y, -1)).

rule_likelihood(people_in_publicly_romantic_commitment_seek_to_honor_their_relationship_status, 1).
rule_type(people_in_publicly_romantic_commitment_seek_to_honor_their_relationship_status, volition).
% People in publicly romantic commitment seek to honor their relationship status.
rule_active(people_in_publicly_romantic_commitment_seek_to_honor_their_relationship_status).
rule_category(people_in_publicly_romantic_commitment_seek_to_honor_their_relationship_status, romantic_attraction).
rule_source(people_in_publicly_romantic_commitment_seek_to_honor_their_relationship_status, ensemble).
rule_priority(people_in_publicly_romantic_commitment_seek_to_honor_their_relationship_status, 1).
rule_applies(people_in_publicly_romantic_commitment_seek_to_honor_their_relationship_status, X, Y) :-
    directed_status(X, Y, publicly_romantically_committed_to).
rule_effect(people_in_publicly_romantic_commitment_seek_to_honor_their_relationship_status, set_intent(X, honor, Y, 1)).

rule_likelihood(people_desire_to_honor_their_crush_within_a_close_knit_social_circle_over_time, 1).
rule_type(people_desire_to_honor_their_crush_within_a_close_knit_social_circle_over_time, volition).
% People desire to honor their crush within a close-knit social circle over time.
rule_active(people_desire_to_honor_their_crush_within_a_close_knit_social_circle_over_time).
rule_category(people_desire_to_honor_their_crush_within_a_close_knit_social_circle_over_time, romantic_attraction).
rule_source(people_desire_to_honor_their_crush_within_a_close_knit_social_circle_over_time, ensemble).
rule_priority(people_desire_to_honor_their_crush_within_a_close_knit_social_circle_over_time, 1).
rule_applies(people_desire_to_honor_their_crush_within_a_close_knit_social_circle_over_time, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, mean).
rule_effect(people_desire_to_honor_their_crush_within_a_close_knit_social_circle_over_time, set_intent(X, honor, Y, -1)).

rule_likelihood(people_desire_stronger_connections_with_those_they_are_romantically_interested_in, 1).
rule_type(people_desire_stronger_connections_with_those_they_are_romantically_interested_in, volition).
% People desire stronger connections with those they are romantically interested in.
rule_active(people_desire_stronger_connections_with_those_they_are_romantically_interested_in).
rule_category(people_desire_stronger_connections_with_those_they_are_romantically_interested_in, romantic_attraction).
rule_source(people_desire_stronger_connections_with_those_they_are_romantically_interested_in, ensemble).
rule_priority(people_desire_stronger_connections_with_those_they_are_romantically_interested_in, 3).
rule_applies(people_desire_stronger_connections_with_those_they_are_romantically_interested_in, X, Y) :-
    network(X, 'z', romance, Romance_val), Romance_val > 6,
    network(Y, 'z', romance, Romance_val), Romance_val > 6.
rule_effect(people_desire_stronger_connections_with_those_they_are_romantically_interested_in, set_intent(X, kind, Y, -3)).

rule_likelihood(people_desire_to_date_their_crush_after_feeling_a_strong_connection_within_the_last_week, 1).
rule_type(people_desire_to_date_their_crush_after_feeling_a_strong_connection_within_the_last_week, volition).
% People desire to date their crush after feeling a strong connection within the last week.
rule_active(people_desire_to_date_their_crush_after_feeling_a_strong_connection_within_the_last_week).
rule_category(people_desire_to_date_their_crush_after_feeling_a_strong_connection_within_the_last_week, romantic_attraction).
rule_source(people_desire_to_date_their_crush_after_feeling_a_strong_connection_within_the_last_week, ensemble).
rule_priority(people_desire_to_date_their_crush_after_feeling_a_strong_connection_within_the_last_week, 1).
rule_applies(people_desire_to_date_their_crush_after_feeling_a_strong_connection_within_the_last_week, X, Y) :-
    network(X, 'z', romance, Romance_val), Romance_val > 6,
    event(Y, romantic).
rule_effect(people_desire_to_date_their_crush_after_feeling_a_strong_connection_within_the_last_week, set_intent(X, kind, Y, -2)).

rule_likelihood(people_s_desire_to_be_in_a_romantic_relationship_with_their_crush_increases_as_they_get, 1).
rule_type(people_s_desire_to_be_in_a_romantic_relationship_with_their_crush_increases_as_they_get, volition).
% People’s desire to be in a romantic relationship with their crush increases as they get
rule_active(people_s_desire_to_be_in_a_romantic_relationship_with_their_crush_increases_as_they_get).
rule_category(people_s_desire_to_be_in_a_romantic_relationship_with_their_crush_increases_as_they_get, romantic_attraction).
rule_source(people_s_desire_to_be_in_a_romantic_relationship_with_their_crush_increases_as_they_get, ensemble).
rule_priority(people_s_desire_to_be_in_a_romantic_relationship_with_their_crush_increases_as_they_get, 1).
rule_applies(people_s_desire_to_be_in_a_romantic_relationship_with_their_crush_increases_as_they_get, X, Y) :-
    network(X, 'z', romance, Romance_val), Romance_val > 6,
    event(Y, romantic).
rule_effect(people_s_desire_to_be_in_a_romantic_relationship_with_their_crush_increases_as_they_get, set_intent(X, kind, Y, -1)).

rule_likelihood(people_seek_to_increase_respect_from_others_while_dating_their_crushes, 1).
rule_type(people_seek_to_increase_respect_from_others_while_dating_their_crushes, volition).
% People seek to increase respect from others while dating their crushes.
rule_active(people_seek_to_increase_respect_from_others_while_dating_their_crushes).
rule_category(people_seek_to_increase_respect_from_others_while_dating_their_crushes, romantic_attraction).
rule_source(people_seek_to_increase_respect_from_others_while_dating_their_crushes, ensemble).
rule_priority(people_seek_to_increase_respect_from_others_while_dating_their_crushes, 1).
rule_applies(people_seek_to_increase_respect_from_others_while_dating_their_crushes, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val > 6.
rule_effect(people_seek_to_increase_respect_from_others_while_dating_their_crushes, set_intent(X, manipulate, Y, -1)).

rule_likelihood(people_are_influenced_to_form_friendships_with_both_strong_individuals_and_their_crushes_simultaneously, 1).
rule_type(people_are_influenced_to_form_friendships_with_both_strong_individuals_and_their_crushes_simultaneously, volition).
% People are influenced to form friendships with both strong individuals and their crushes simultaneously.
rule_active(people_are_influenced_to_form_friendships_with_both_strong_individuals_and_their_crushes_simultaneously).
rule_category(people_are_influenced_to_form_friendships_with_both_strong_individuals_and_their_crushes_simultaneously, romantic_attraction).
rule_source(people_are_influenced_to_form_friendships_with_both_strong_individuals_and_their_crushes_simultaneously, ensemble).
rule_priority(people_are_influenced_to_form_friendships_with_both_strong_individuals_and_their_crushes_simultaneously, 3).
rule_applies(people_are_influenced_to_form_friendships_with_both_strong_individuals_and_their_crushes_simultaneously, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    network(Y, 'z', friendship, Friendship_val), Friendship_val > 6.
rule_effect(people_are_influenced_to_form_friendships_with_both_strong_individuals_and_their_crushes_simultaneously, set_intent(X, manipulate, Y, -3)).

rule_likelihood(people_seek_stronger_connections_with_both_their_peers_and_crushes_to_increase_romantic_interest, 1).
rule_type(people_seek_stronger_connections_with_both_their_peers_and_crushes_to_increase_romantic_interest, volition).
% People seek stronger connections with both their peers and crushes to increase romantic interest.
rule_active(people_seek_stronger_connections_with_both_their_peers_and_crushes_to_increase_romantic_interest).
rule_category(people_seek_stronger_connections_with_both_their_peers_and_crushes_to_increase_romantic_interest, romantic_attraction).
rule_source(people_seek_stronger_connections_with_both_their_peers_and_crushes_to_increase_romantic_interest, ensemble).
rule_priority(people_seek_stronger_connections_with_both_their_peers_and_crushes_to_increase_romantic_interest, 3).
rule_applies(people_seek_stronger_connections_with_both_their_peers_and_crushes_to_increase_romantic_interest, X, Y) :-
    network(X, 'z', romance, Romance_val), Romance_val > 6,
    network(Y, 'z', romance, Romance_val), Romance_val > 6.
rule_effect(people_seek_stronger_connections_with_both_their_peers_and_crushes_to_increase_romantic_interest, set_intent(X, manipulate, Y, 3)).

rule_likelihood(people_in_a_publicly_romantic_relationship_with_someone_else_are_likely_to_pursue_dating_their, 1).
rule_type(people_in_a_publicly_romantic_relationship_with_someone_else_are_likely_to_pursue_dating_their, volition).
% People in a publicly romantic relationship with someone else are likely to pursue dating their
rule_active(people_in_a_publicly_romantic_relationship_with_someone_else_are_likely_to_pursue_dating_their).
rule_category(people_in_a_publicly_romantic_relationship_with_someone_else_are_likely_to_pursue_dating_their, romantic_attraction).
rule_source(people_in_a_publicly_romantic_relationship_with_someone_else_are_likely_to_pursue_dating_their, ensemble).
rule_priority(people_in_a_publicly_romantic_relationship_with_someone_else_are_likely_to_pursue_dating_their, 1).
rule_applies(people_in_a_publicly_romantic_relationship_with_someone_else_are_likely_to_pursue_dating_their, X, Y) :-
    directed_status(X, Y, publicly_romantically_committed_to).
rule_effect(people_in_a_publicly_romantic_relationship_with_someone_else_are_likely_to_pursue_dating_their, set_intent(X, romance, Y, 2)).

rule_likelihood(people_are_inclined_to_form_romantic_interests_towards_individuals_they_perceive_as_strong, 1).
rule_type(people_are_inclined_to_form_romantic_interests_towards_individuals_they_perceive_as_strong, volition).
% People are inclined to form romantic interests towards individuals they perceive as strong.
rule_active(people_are_inclined_to_form_romantic_interests_towards_individuals_they_perceive_as_strong).
rule_category(people_are_inclined_to_form_romantic_interests_towards_individuals_they_perceive_as_strong, romantic_attraction).
rule_source(people_are_inclined_to_form_romantic_interests_towards_individuals_they_perceive_as_strong, ensemble).
rule_priority(people_are_inclined_to_form_romantic_interests_towards_individuals_they_perceive_as_strong, 1).
rule_applies(people_are_inclined_to_form_romantic_interests_towards_individuals_they_perceive_as_strong, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val > 6.
rule_effect(people_are_inclined_to_form_romantic_interests_towards_individuals_they_perceive_as_strong, set_intent(X, romance, Y, -1)).

rule_likelihood(people_desire_to_increase_their_romantic_connections_with_individuals_who_have_a_strong_social_network, 1).
rule_type(people_desire_to_increase_their_romantic_connections_with_individuals_who_have_a_strong_social_network, volition).
% People desire to increase their romantic connections with individuals who have a strong social network.
rule_active(people_desire_to_increase_their_romantic_connections_with_individuals_who_have_a_strong_social_network).
rule_category(people_desire_to_increase_their_romantic_connections_with_individuals_who_have_a_strong_social_network, romantic_attraction).
rule_source(people_desire_to_increase_their_romantic_connections_with_individuals_who_have_a_strong_social_network, ensemble).
rule_priority(people_desire_to_increase_their_romantic_connections_with_individuals_who_have_a_strong_social_network, 5).
rule_applies(people_desire_to_increase_their_romantic_connections_with_individuals_who_have_a_strong_social_network, X, Y) :-
    network(X, Y, romance, Romance_val), Romance_val > 6.
rule_effect(people_desire_to_increase_their_romantic_connections_with_individuals_who_have_a_strong_social_network, set_intent(X, romance, Y, 5)).

rule_likelihood(people_seeking_solace_after_a_breakup_aim_to_form_romantic_connections, 1).
rule_type(people_seeking_solace_after_a_breakup_aim_to_form_romantic_connections, volition).
% People seeking solace after a breakup aim to form romantic connections.
rule_active(people_seeking_solace_after_a_breakup_aim_to_form_romantic_connections).
rule_category(people_seeking_solace_after_a_breakup_aim_to_form_romantic_connections, romantic_attraction).
rule_source(people_seeking_solace_after_a_breakup_aim_to_form_romantic_connections, ensemble).
rule_priority(people_seeking_solace_after_a_breakup_aim_to_form_romantic_connections, 3).
rule_applies(people_seeking_solace_after_a_breakup_aim_to_form_romantic_connections, X, Y) :-
    status(X, heartbroken).
rule_effect(people_seeking_solace_after_a_breakup_aim_to_form_romantic_connections, set_intent(X, romance, Y, -3)).

rule_likelihood(people_develop_romantic_intent_towards_strong_individuals_within_the_last_week, 1).
rule_type(people_develop_romantic_intent_towards_strong_individuals_within_the_last_week, volition).
% People develop romantic intent towards strong individuals within the last week.
rule_active(people_develop_romantic_intent_towards_strong_individuals_within_the_last_week).
rule_category(people_develop_romantic_intent_towards_strong_individuals_within_the_last_week, romantic_attraction).
rule_source(people_develop_romantic_intent_towards_strong_individuals_within_the_last_week, ensemble).
rule_priority(people_develop_romantic_intent_towards_strong_individuals_within_the_last_week, 3).
rule_applies(people_develop_romantic_intent_towards_strong_individuals_within_the_last_week, X, Y) :-
    event(X, romantic).
rule_effect(people_develop_romantic_intent_towards_strong_individuals_within_the_last_week, set_intent(X, romance, Y, 3)).

rule_likelihood(people_develop_romantic_intent_towards_strong_individuals_after_a_significant_event_within_the_past_month, 1).
rule_type(people_develop_romantic_intent_towards_strong_individuals_after_a_significant_event_within_the_past_month, volition).
% People develop romantic intent towards strong individuals after a significant event within the past month.
rule_active(people_develop_romantic_intent_towards_strong_individuals_after_a_significant_event_within_the_past_month).
rule_category(people_develop_romantic_intent_towards_strong_individuals_after_a_significant_event_within_the_past_month, romantic_attraction).
rule_source(people_develop_romantic_intent_towards_strong_individuals_after_a_significant_event_within_the_past_month, ensemble).
rule_priority(people_develop_romantic_intent_towards_strong_individuals_after_a_significant_event_within_the_past_month, 1).
rule_applies(people_develop_romantic_intent_towards_strong_individuals_after_a_significant_event_within_the_past_month, X, Y) :-
    event(X, romantic).
rule_effect(people_develop_romantic_intent_towards_strong_individuals_after_a_significant_event_within_the_past_month, set_intent(X, romance, Y, 2)).

rule_likelihood(people_have_romantic_intent_towards_their_crush_within_the_last_month, 1).
rule_type(people_have_romantic_intent_towards_their_crush_within_the_last_month, volition).
% People have romantic intent towards their crush within the last month.
rule_active(people_have_romantic_intent_towards_their_crush_within_the_last_month).
rule_category(people_have_romantic_intent_towards_their_crush_within_the_last_month, romantic_attraction).
rule_source(people_have_romantic_intent_towards_their_crush_within_the_last_month, ensemble).
rule_priority(people_have_romantic_intent_towards_their_crush_within_the_last_month, 1).
rule_applies(people_have_romantic_intent_towards_their_crush_within_the_last_month, X, Y) :-
    event(X, romantic).
rule_effect(people_have_romantic_intent_towards_their_crush_within_the_last_month, set_intent(X, romance, Y, 1)).

rule_likelihood(people_develop_romantic_intent_towards_strong_individuals_over_time, 1).
rule_type(people_develop_romantic_intent_towards_strong_individuals_over_time, volition).
% People develop romantic intent towards strong individuals over time.
rule_active(people_develop_romantic_intent_towards_strong_individuals_over_time).
rule_category(people_develop_romantic_intent_towards_strong_individuals_over_time, romantic_attraction).
rule_source(people_develop_romantic_intent_towards_strong_individuals_over_time, ensemble).
rule_priority(people_develop_romantic_intent_towards_strong_individuals_over_time, 1).
rule_applies(people_develop_romantic_intent_towards_strong_individuals_over_time, X, Y) :-
    event(X, mean).
rule_effect(people_develop_romantic_intent_towards_strong_individuals_over_time, set_intent(X, romance, Y, -1)).

rule_likelihood(people_seek_romantic_connections_with_individuals_who_have_a_strong_social_network_within_the_last_8_turns, 1).
rule_type(people_seek_romantic_connections_with_individuals_who_have_a_strong_social_network_within_the_last_8_turns, volition).
% People seek romantic connections with individuals who have a strong social network within the last 8 turns
rule_active(people_seek_romantic_connections_with_individuals_who_have_a_strong_social_network_within_the_last_8_turns).
rule_category(people_seek_romantic_connections_with_individuals_who_have_a_strong_social_network_within_the_last_8_turns, romantic_attraction).
rule_source(people_seek_romantic_connections_with_individuals_who_have_a_strong_social_network_within_the_last_8_turns, ensemble).
rule_priority(people_seek_romantic_connections_with_individuals_who_have_a_strong_social_network_within_the_last_8_turns, 3).
rule_applies(people_seek_romantic_connections_with_individuals_who_have_a_strong_social_network_within_the_last_8_turns, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, mean).
rule_effect(people_seek_romantic_connections_with_individuals_who_have_a_strong_social_network_within_the_last_8_turns, set_intent(X, romance, Y, -3)).

rule_likelihood(people_with_a_strong_desire_for_friendship_and_who_have_been_in_close_proximity_to_their_crush, 1).
rule_type(people_with_a_strong_desire_for_friendship_and_who_have_been_in_close_proximity_to_their_crush, volition).
% People with a strong desire for friendship and who have been in close proximity to their crush
rule_active(people_with_a_strong_desire_for_friendship_and_who_have_been_in_close_proximity_to_their_crush).
rule_category(people_with_a_strong_desire_for_friendship_and_who_have_been_in_close_proximity_to_their_crush, romantic_attraction).
rule_source(people_with_a_strong_desire_for_friendship_and_who_have_been_in_close_proximity_to_their_crush, ensemble).
rule_priority(people_with_a_strong_desire_for_friendship_and_who_have_been_in_close_proximity_to_their_crush, 1).
rule_applies(people_with_a_strong_desire_for_friendship_and_who_have_been_in_close_proximity_to_their_crush, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, mean).
rule_effect(people_with_a_strong_desire_for_friendship_and_who_have_been_in_close_proximity_to_their_crush, set_intent(X, romance, Y, -2)).

rule_likelihood(people_with_a_strong_desire_for_friendship_and_having_had_romantic_intent_towards_their_crush_within_the, 1).
rule_type(people_with_a_strong_desire_for_friendship_and_having_had_romantic_intent_towards_their_crush_within_the, volition).
% People with a strong desire for friendship and having had romantic intent towards their crush within the
rule_active(people_with_a_strong_desire_for_friendship_and_having_had_romantic_intent_towards_their_crush_within_the).
rule_category(people_with_a_strong_desire_for_friendship_and_having_had_romantic_intent_towards_their_crush_within_the, romantic_attraction).
rule_source(people_with_a_strong_desire_for_friendship_and_having_had_romantic_intent_towards_their_crush_within_the, ensemble).
rule_priority(people_with_a_strong_desire_for_friendship_and_having_had_romantic_intent_towards_their_crush_within_the, 1).
rule_applies(people_with_a_strong_desire_for_friendship_and_having_had_romantic_intent_towards_their_crush_within_the, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, mean).
rule_effect(people_with_a_strong_desire_for_friendship_and_having_had_romantic_intent_towards_their_crush_within_the, set_intent(X, romance, Y, -1)).

rule_likelihood(people_seek_romantic_connections_with_individuals_who_are_well_connected_within_their_social_circles, 1).
rule_type(people_seek_romantic_connections_with_individuals_who_are_well_connected_within_their_social_circles, volition).
% People seek romantic connections with individuals who are well-connected within their social circles.
rule_active(people_seek_romantic_connections_with_individuals_who_are_well_connected_within_their_social_circles).
rule_category(people_seek_romantic_connections_with_individuals_who_are_well_connected_within_their_social_circles, romantic_attraction).
rule_source(people_seek_romantic_connections_with_individuals_who_are_well_connected_within_their_social_circles, ensemble).
rule_priority(people_seek_romantic_connections_with_individuals_who_are_well_connected_within_their_social_circles, 3).
rule_applies(people_seek_romantic_connections_with_individuals_who_are_well_connected_within_their_social_circles, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, mean).
rule_effect(people_seek_romantic_connections_with_individuals_who_are_well_connected_within_their_social_circles, set_intent(X, romance, Y, -3)).

rule_likelihood(people_desire_romantic_connections_with_individuals_they_perceive_as_strong_within_a_close_network_when_the_average, 1).
rule_type(people_desire_romantic_connections_with_individuals_they_perceive_as_strong_within_a_close_network_when_the_average, volition).
% People desire romantic connections with individuals they perceive as strong within a close network when the average
rule_active(people_desire_romantic_connections_with_individuals_they_perceive_as_strong_within_a_close_network_when_the_average).
rule_category(people_desire_romantic_connections_with_individuals_they_perceive_as_strong_within_a_close_network_when_the_average, romantic_attraction).
rule_source(people_desire_romantic_connections_with_individuals_they_perceive_as_strong_within_a_close_network_when_the_average, ensemble).
rule_priority(people_desire_romantic_connections_with_individuals_they_perceive_as_strong_within_a_close_network_when_the_average, 1).
rule_applies(people_desire_romantic_connections_with_individuals_they_perceive_as_strong_within_a_close_network_when_the_average, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, mean).
rule_effect(people_desire_romantic_connections_with_individuals_they_perceive_as_strong_within_a_close_network_when_the_average, set_intent(X, romance, Y, -1)).

rule_likelihood(people_seek_to_form_romantic_connections_with_individuals_who_are_highly_regarded_within_their_social_circles, 1).
rule_type(people_seek_to_form_romantic_connections_with_individuals_who_are_highly_regarded_within_their_social_circles, volition).
% People seek to form romantic connections with individuals who are highly regarded within their social circles.
rule_active(people_seek_to_form_romantic_connections_with_individuals_who_are_highly_regarded_within_their_social_circles).
rule_category(people_seek_to_form_romantic_connections_with_individuals_who_are_highly_regarded_within_their_social_circles, romantic_attraction).
rule_source(people_seek_to_form_romantic_connections_with_individuals_who_are_highly_regarded_within_their_social_circles, ensemble).
rule_priority(people_seek_to_form_romantic_connections_with_individuals_who_are_highly_regarded_within_their_social_circles, 5).
rule_applies(people_seek_to_form_romantic_connections_with_individuals_who_are_highly_regarded_within_their_social_circles, X, Y) :-
    network(X, 'z', romance, Romance_val), Romance_val > 6,
    network(Y, 'z', romance, Romance_val), Romance_val > 6.
rule_effect(people_seek_to_form_romantic_connections_with_individuals_who_are_highly_regarded_within_their_social_circles, set_intent(X, romance, Y, -5)).

rule_likelihood(people_seek_trust_from_public_friends_when_they_have_a_crush, 1).
rule_type(people_seek_trust_from_public_friends_when_they_have_a_crush, volition).
% People seek trust from public friends when they have a crush.
rule_active(people_seek_trust_from_public_friends_when_they_have_a_crush).
rule_category(people_seek_trust_from_public_friends_when_they_have_a_crush, romantic_attraction).
rule_source(people_seek_trust_from_public_friends_when_they_have_a_crush, ensemble).
rule_priority(people_seek_trust_from_public_friends_when_they_have_a_crush, 1).
rule_applies(people_seek_trust_from_public_friends_when_they_have_a_crush, X, Y) :-
    directed_status(X, Y, public_friends).
rule_effect(people_seek_trust_from_public_friends_when_they_have_a_crush, set_intent(X, trust, Y, 1)).

rule_likelihood(people_desire_to_trust_individuals_they_are_romantically_committed_with, 1).
rule_type(people_desire_to_trust_individuals_they_are_romantically_committed_with, volition).
% People desire to trust individuals they are romantically committed with.
rule_active(people_desire_to_trust_individuals_they_are_romantically_committed_with).
rule_category(people_desire_to_trust_individuals_they_are_romantically_committed_with, romantic_attraction).
rule_source(people_desire_to_trust_individuals_they_are_romantically_committed_with, ensemble).
rule_priority(people_desire_to_trust_individuals_they_are_romantically_committed_with, 1).
rule_applies(people_desire_to_trust_individuals_they_are_romantically_committed_with, X, Y) :-
    directed_status(X, Y, publicly_romantically_committed_to).
rule_effect(people_desire_to_trust_individuals_they_are_romantically_committed_with, set_intent(X, trust, Y, 1)).

rule_likelihood(people_s_average_trust_in_strong_individuals_decreases_over_time_if_they_have_not_been_dating, 1).
rule_type(people_s_average_trust_in_strong_individuals_decreases_over_time_if_they_have_not_been_dating, volition).
% People’s average trust in strong individuals decreases over time if they have not been dating
rule_active(people_s_average_trust_in_strong_individuals_decreases_over_time_if_they_have_not_been_dating).
rule_category(people_s_average_trust_in_strong_individuals_decreases_over_time_if_they_have_not_been_dating, romantic_attraction).
rule_source(people_s_average_trust_in_strong_individuals_decreases_over_time_if_they_have_not_been_dating, ensemble).
rule_priority(people_s_average_trust_in_strong_individuals_decreases_over_time_if_they_have_not_been_dating, 5).
rule_applies(people_s_average_trust_in_strong_individuals_decreases_over_time_if_they_have_not_been_dating, X, Y) :-
    event(X, mean).
rule_effect(people_s_average_trust_in_strong_individuals_decreases_over_time_if_they_have_not_been_dating, set_intent(X, trust, Y, -5)).

rule_likelihood(people_desire_stronger_connections_with_both_crush_and_peers_to_increase_trust, 1).
rule_type(people_desire_stronger_connections_with_both_crush_and_peers_to_increase_trust, volition).
% People desire stronger connections with both crush and peers to increase trust.
rule_active(people_desire_stronger_connections_with_both_crush_and_peers_to_increase_trust).
rule_category(people_desire_stronger_connections_with_both_crush_and_peers_to_increase_trust, romantic_attraction).
rule_source(people_desire_stronger_connections_with_both_crush_and_peers_to_increase_trust, ensemble).
rule_priority(people_desire_stronger_connections_with_both_crush_and_peers_to_increase_trust, 3).
rule_applies(people_desire_stronger_connections_with_both_crush_and_peers_to_increase_trust, X, Y) :-
    network(X, 'z', romance, Romance_val), Romance_val > 6,
    network(Y, 'z', romance, Romance_val), Romance_val > 6.
rule_effect(people_desire_stronger_connections_with_both_crush_and_peers_to_increase_trust, set_intent(X, trust, Y, -3)).

rule_likelihood(people_develop_trust_towards_their_crush_after_frequent_positive_encounters_within_the_last_week, 1).
rule_type(people_develop_trust_towards_their_crush_after_frequent_positive_encounters_within_the_last_week, volition).
% People develop trust towards their crush after frequent positive encounters within the last week.
rule_active(people_develop_trust_towards_their_crush_after_frequent_positive_encounters_within_the_last_week).
rule_category(people_develop_trust_towards_their_crush_after_frequent_positive_encounters_within_the_last_week, romantic_attraction).
rule_source(people_develop_trust_towards_their_crush_after_frequent_positive_encounters_within_the_last_week, ensemble).
rule_priority(people_develop_trust_towards_their_crush_after_frequent_positive_encounters_within_the_last_week, 1).
rule_applies(people_develop_trust_towards_their_crush_after_frequent_positive_encounters_within_the_last_week, X, Y) :-
    network(X, 'z', romance, Romance_val), Romance_val > 6,
    event(Y, nice).
rule_effect(people_develop_trust_towards_their_crush_after_frequent_positive_encounters_within_the_last_week, set_intent(X, trust, Y, -1)).

rule_likelihood(people_develop_trust_towards_their_crush_when_they_have_been_in_a_romantic_event_within_the_past, 1).
rule_type(people_develop_trust_towards_their_crush_when_they_have_been_in_a_romantic_event_within_the_past, volition).
% People develop trust towards their crush when they have been in a romantic event within the past
rule_active(people_develop_trust_towards_their_crush_when_they_have_been_in_a_romantic_event_within_the_past).
rule_category(people_develop_trust_towards_their_crush_when_they_have_been_in_a_romantic_event_within_the_past, romantic_attraction).
rule_source(people_develop_trust_towards_their_crush_when_they_have_been_in_a_romantic_event_within_the_past, ensemble).
rule_priority(people_develop_trust_towards_their_crush_when_they_have_been_in_a_romantic_event_within_the_past, 1).
rule_applies(people_develop_trust_towards_their_crush_when_they_have_been_in_a_romantic_event_within_the_past, X, Y) :-
    network(X, 'z', romance, Romance_val), Romance_val > 6,
    event(Y, romantic).
rule_effect(people_develop_trust_towards_their_crush_when_they_have_been_in_a_romantic_event_within_the_past, set_intent(X, trust, Y, -2)).

rule_likelihood(people_seek_romantic_connections_with_individuals_who_have_a_strong_social_network_and_whom_they_ve_had, 1).
rule_type(people_seek_romantic_connections_with_individuals_who_have_a_strong_social_network_and_whom_they_ve_had, volition).
% People seek romantic connections with individuals who have a strong social network and whom they’ve had
rule_active(people_seek_romantic_connections_with_individuals_who_have_a_strong_social_network_and_whom_they_ve_had).
rule_category(people_seek_romantic_connections_with_individuals_who_have_a_strong_social_network_and_whom_they_ve_had, romantic_attraction).
rule_source(people_seek_romantic_connections_with_individuals_who_have_a_strong_social_network_and_whom_they_ve_had, ensemble).
rule_priority(people_seek_romantic_connections_with_individuals_who_have_a_strong_social_network_and_whom_they_ve_had, 1).
rule_applies(people_seek_romantic_connections_with_individuals_who_have_a_strong_social_network_and_whom_they_ve_had, X, Y) :-
    network(X, 'z', romance, Romance_val), Romance_val > 6,
    event(Y, romantic).
rule_effect(people_seek_romantic_connections_with_individuals_who_have_a_strong_social_network_and_whom_they_ve_had, set_intent(X, trust, Y, -1)).

rule_likelihood(people_seek_stronger_connections_when_they_have_a_high_romantic_interest_in_someone_and_trust_has_been_established, 1).
rule_type(people_seek_stronger_connections_when_they_have_a_high_romantic_interest_in_someone_and_trust_has_been_established, volition).
% People seek stronger connections when they have a high romantic interest in someone and trust has been established
rule_active(people_seek_stronger_connections_when_they_have_a_high_romantic_interest_in_someone_and_trust_has_been_established).
rule_category(people_seek_stronger_connections_when_they_have_a_high_romantic_interest_in_someone_and_trust_has_been_established, romantic_attraction).
rule_source(people_seek_stronger_connections_when_they_have_a_high_romantic_interest_in_someone_and_trust_has_been_established, ensemble).
rule_priority(people_seek_stronger_connections_when_they_have_a_high_romantic_interest_in_someone_and_trust_has_been_established, 1).
rule_applies(people_seek_stronger_connections_when_they_have_a_high_romantic_interest_in_someone_and_trust_has_been_established, X, Y) :-
    network(X, 'z', romance, Romance_val), Romance_val > 6,
    event(Y, mean).
rule_effect(people_seek_stronger_connections_when_they_have_a_high_romantic_interest_in_someone_and_trust_has_been_established, set_intent(X, trust, Y, -2)).

rule_likelihood(people_seek_stronger_connections_with_individuals_they_are_romantically_interested_in_when_their_trust_level_towards_those, 1).
rule_type(people_seek_stronger_connections_with_individuals_they_are_romantically_interested_in_when_their_trust_level_towards_those, volition).
% People seek stronger connections with individuals they are romantically interested in when their trust level towards those
rule_active(people_seek_stronger_connections_with_individuals_they_are_romantically_interested_in_when_their_trust_level_towards_those).
rule_category(people_seek_stronger_connections_with_individuals_they_are_romantically_interested_in_when_their_trust_level_towards_those, romantic_attraction).
rule_source(people_seek_stronger_connections_with_individuals_they_are_romantically_interested_in_when_their_trust_level_towards_those, ensemble).
rule_priority(people_seek_stronger_connections_with_individuals_they_are_romantically_interested_in_when_their_trust_level_towards_those, 1).
rule_applies(people_seek_stronger_connections_with_individuals_they_are_romantically_interested_in_when_their_trust_level_towards_those, X, Y) :-
    network(X, 'z', romance, Romance_val), Romance_val > 6,
    event(Y, mean).
rule_effect(people_seek_stronger_connections_with_individuals_they_are_romantically_interested_in_when_their_trust_level_towards_those, set_intent(X, trust, Y, -1)).

rule_likelihood(people_seek_to_increase_trust_with_their_crush_within_8_turns_based_on_a_strong_network_connection, 1).
rule_type(people_seek_to_increase_trust_with_their_crush_within_8_turns_based_on_a_strong_network_connection, volition).
% People seek to increase trust with their crush within 8 turns based on a strong network connection
rule_active(people_seek_to_increase_trust_with_their_crush_within_8_turns_based_on_a_strong_network_connection).
rule_category(people_seek_to_increase_trust_with_their_crush_within_8_turns_based_on_a_strong_network_connection, romantic_attraction).
rule_source(people_seek_to_increase_trust_with_their_crush_within_8_turns_based_on_a_strong_network_connection, ensemble).
rule_priority(people_seek_to_increase_trust_with_their_crush_within_8_turns_based_on_a_strong_network_connection, 3).
rule_applies(people_seek_to_increase_trust_with_their_crush_within_8_turns_based_on_a_strong_network_connection, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, mean).
rule_effect(people_seek_to_increase_trust_with_their_crush_within_8_turns_based_on_a_strong_network_connection, set_intent(X, trust, Y, -3)).

rule_likelihood(you_are_more_likely_to_be_romantic_towards_someone_you_have_high_romance_with, 1).
rule_type(you_are_more_likely_to_be_romantic_towards_someone_you_have_high_romance_with, volition).
% You are more likely to be romantic towards someone you have high romance with
rule_active(you_are_more_likely_to_be_romantic_towards_someone_you_have_high_romance_with).
rule_category(you_are_more_likely_to_be_romantic_towards_someone_you_have_high_romance_with, romantic_attraction).
rule_source(you_are_more_likely_to_be_romantic_towards_someone_you_have_high_romance_with, ensemble).
rule_priority(you_are_more_likely_to_be_romantic_towards_someone_you_have_high_romance_with, 1).
rule_applies(you_are_more_likely_to_be_romantic_towards_someone_you_have_high_romance_with, X, Y) :-
    network(X, Y, romance, Romance_val), Romance_val > 7.
rule_effect(you_are_more_likely_to_be_romantic_towards_someone_you_have_high_romance_with, set_intent(X, romance, Y, 2)).

rule_likelihood(you_are_more_likely_to_be_romantic_if_you_are_happy, 1).
rule_type(you_are_more_likely_to_be_romantic_if_you_are_happy, volition).
% You are more likely to be romantic if you are happy
rule_active(you_are_more_likely_to_be_romantic_if_you_are_happy).
rule_category(you_are_more_likely_to_be_romantic_if_you_are_happy, romantic_attraction).
rule_source(you_are_more_likely_to_be_romantic_if_you_are_happy, ensemble).
rule_priority(you_are_more_likely_to_be_romantic_if_you_are_happy, 1).
rule_applies(you_are_more_likely_to_be_romantic_if_you_are_happy, X, Y) :-
    mood(X, happy).
rule_effect(you_are_more_likely_to_be_romantic_if_you_are_happy, set_intent(X, romance, Y, 1)).

rule_likelihood(you_are_more_likely_to_suck_up_towards_someone_you_feel_romantic_towards, 1).
rule_type(you_are_more_likely_to_suck_up_towards_someone_you_feel_romantic_towards, volition).
% You are more likely to suck up towards someone you feel romantic towards
rule_active(you_are_more_likely_to_suck_up_towards_someone_you_feel_romantic_towards).
rule_category(you_are_more_likely_to_suck_up_towards_someone_you_feel_romantic_towards, romantic_attraction).
rule_source(you_are_more_likely_to_suck_up_towards_someone_you_feel_romantic_towards, ensemble).
rule_priority(you_are_more_likely_to_suck_up_towards_someone_you_feel_romantic_towards, 1).
rule_applies(you_are_more_likely_to_suck_up_towards_someone_you_feel_romantic_towards, X, Y) :-
    network(X, Y, romance, Romance_val), Romance_val > 7.
rule_effect(you_are_more_likely_to_suck_up_towards_someone_you_feel_romantic_towards, set_intent(X, suckup, Y, 2)).

rule_likelihood(people_are_much_more_kind_to_people_they_are_dating, 1).
rule_type(people_are_much_more_kind_to_people_they_are_dating, volition).
% People are much more kind to people they are dating
rule_active(people_are_much_more_kind_to_people_they_are_dating).
rule_category(people_are_much_more_kind_to_people_they_are_dating, romantic_attraction).
rule_source(people_are_much_more_kind_to_people_they_are_dating, ensemble).
rule_priority(people_are_much_more_kind_to_people_they_are_dating, 5).
rule_applies(people_are_much_more_kind_to_people_they_are_dating, X, Y) :-
    relationship(X, Y, dating).
rule_effect(people_are_much_more_kind_to_people_they_are_dating, set_intent(X, kind, Y, 5)).

rule_likelihood(people_aren_t_nice_to_people_they_are_dating_if_that_person_is_dating_someone_else, 1).
rule_type(people_aren_t_nice_to_people_they_are_dating_if_that_person_is_dating_someone_else, volition).
% People aren’t nice to people they are dating if that person is dating someone else.
rule_active(people_aren_t_nice_to_people_they_are_dating_if_that_person_is_dating_someone_else).
rule_category(people_aren_t_nice_to_people_they_are_dating_if_that_person_is_dating_someone_else, romantic_attraction).
rule_source(people_aren_t_nice_to_people_they_are_dating_if_that_person_is_dating_someone_else, ensemble).
rule_priority(people_aren_t_nice_to_people_they_are_dating_if_that_person_is_dating_someone_else, 3).
rule_applies(people_aren_t_nice_to_people_they_are_dating_if_that_person_is_dating_someone_else, X, Y) :-
    relationship(X, Y, dating),
    relationship(Y, 'z', dating).
rule_effect(people_aren_t_nice_to_people_they_are_dating_if_that_person_is_dating_someone_else, set_intent(X, kind, Y, -4)).

rule_likelihood(people_are_a_little_kind_to_those_who_have_flirted_with_them_recently, 1).
rule_type(people_are_a_little_kind_to_those_who_have_flirted_with_them_recently, volition).
% People are a little kind to those who have flirted with them recently
rule_active(people_are_a_little_kind_to_those_who_have_flirted_with_them_recently).
rule_category(people_are_a_little_kind_to_those_who_have_flirted_with_them_recently, romantic_attraction).
rule_source(people_are_a_little_kind_to_those_who_have_flirted_with_them_recently, ensemble).
rule_priority(people_are_a_little_kind_to_those_who_have_flirted_with_them_recently, 1).
rule_applies(people_are_a_little_kind_to_those_who_have_flirted_with_them_recently, X, Y) :-
    event(Y, flirted_with).
rule_effect(people_are_a_little_kind_to_those_who_have_flirted_with_them_recently, set_intent(X, kind, Y, 1)).

rule_likelihood(people_are_less_rude_to_people_they_are_dating, 1).
rule_type(people_are_less_rude_to_people_they_are_dating, volition).
% People are less rude to people they are dating
rule_active(people_are_less_rude_to_people_they_are_dating).
rule_category(people_are_less_rude_to_people_they_are_dating, romantic_attraction).
rule_source(people_are_less_rude_to_people_they_are_dating, ensemble).
rule_priority(people_are_less_rude_to_people_they_are_dating, 3).
rule_applies(people_are_less_rude_to_people_they_are_dating, X, Y) :-
    relationship(X, Y, dating).
rule_effect(people_are_less_rude_to_people_they_are_dating, set_intent(X, rude, Y, -4)).

rule_likelihood(people_are_more_rude_to_people_they_are_dating_but_unattracted_to, 1).
rule_type(people_are_more_rude_to_people_they_are_dating_but_unattracted_to, volition).
% People are more rude to people they are dating but unattracted to
rule_active(people_are_more_rude_to_people_they_are_dating_but_unattracted_to).
rule_category(people_are_more_rude_to_people_they_are_dating_but_unattracted_to, romantic_attraction).
rule_source(people_are_more_rude_to_people_they_are_dating_but_unattracted_to, ensemble).
rule_priority(people_are_more_rude_to_people_they_are_dating_but_unattracted_to, 5).
rule_applies(people_are_more_rude_to_people_they_are_dating_but_unattracted_to, X, Y) :-
    relationship(X, Y, dating),
    network(X, Y, attraction, Attraction_val), Attraction_val < 4.
rule_effect(people_are_more_rude_to_people_they_are_dating_but_unattracted_to, set_intent(X, rude, Y, 5)).

rule_likelihood(people_aren_t_nice_to_people_they_are_dating_if_that_person_is_dating_someone_else, 1).
rule_type(people_aren_t_nice_to_people_they_are_dating_if_that_person_is_dating_someone_else, volition).
% People aren’t nice to people they are dating if that person is dating someone else.
rule_active(people_aren_t_nice_to_people_they_are_dating_if_that_person_is_dating_someone_else).
rule_category(people_aren_t_nice_to_people_they_are_dating_if_that_person_is_dating_someone_else, romantic_attraction).
rule_source(people_aren_t_nice_to_people_they_are_dating_if_that_person_is_dating_someone_else, ensemble).
rule_priority(people_aren_t_nice_to_people_they_are_dating_if_that_person_is_dating_someone_else, 5).
rule_applies(people_aren_t_nice_to_people_they_are_dating_if_that_person_is_dating_someone_else, X, Y) :-
    relationship(X, Y, dating),
    relationship(Y, 'z', dating).
rule_effect(people_aren_t_nice_to_people_they_are_dating_if_that_person_is_dating_someone_else, set_intent(X, rude, Y, 5)).

rule_likelihood(people_are_less_rude_to_those_who_have_flirted_with_them_recently, 1).
rule_type(people_are_less_rude_to_those_who_have_flirted_with_them_recently, volition).
% People are less rude to those who have flirted with them recently
rule_active(people_are_less_rude_to_those_who_have_flirted_with_them_recently).
rule_category(people_are_less_rude_to_those_who_have_flirted_with_them_recently, romantic_attraction).
rule_source(people_are_less_rude_to_those_who_have_flirted_with_them_recently, ensemble).
rule_priority(people_are_less_rude_to_those_who_have_flirted_with_them_recently, 1).
rule_applies(people_are_less_rude_to_those_who_have_flirted_with_them_recently, X, Y) :-
    event(Y, flirted_with).
rule_effect(people_are_less_rude_to_those_who_have_flirted_with_them_recently, set_intent(X, rude, Y, -2)).

rule_likelihood(people_are_much_more_rude_to_those_that_they_aren_t_attracted_to_if_they_have_flirted_with_them_recently, 1).
rule_type(people_are_much_more_rude_to_those_that_they_aren_t_attracted_to_if_they_have_flirted_with_them_recently, volition).
% People are much more rude to those that they aren’t attracted to if they have flirted with them recently
rule_active(people_are_much_more_rude_to_those_that_they_aren_t_attracted_to_if_they_have_flirted_with_them_recently).
rule_category(people_are_much_more_rude_to_those_that_they_aren_t_attracted_to_if_they_have_flirted_with_them_recently, romantic_attraction).
rule_source(people_are_much_more_rude_to_those_that_they_aren_t_attracted_to_if_they_have_flirted_with_them_recently, ensemble).
rule_priority(people_are_much_more_rude_to_those_that_they_aren_t_attracted_to_if_they_have_flirted_with_them_recently, 5).
rule_applies(people_are_much_more_rude_to_those_that_they_aren_t_attracted_to_if_they_have_flirted_with_them_recently, X, Y) :-
    event(Y, flirted_with),
    network(X, Y, attraction, Attraction_val), Attraction_val < 4.
rule_effect(people_are_much_more_rude_to_those_that_they_aren_t_attracted_to_if_they_have_flirted_with_them_recently, set_intent(X, rude, Y, 5)).

rule_likelihood(people_are_more_rude_to_those_they_are_unattracted_to_who_have_ever_flirted_with_them_ever, 1).
rule_type(people_are_more_rude_to_those_they_are_unattracted_to_who_have_ever_flirted_with_them_ever, volition).
% People are more rude to those they are unattracted to who have ever flirted with them ever
rule_active(people_are_more_rude_to_those_they_are_unattracted_to_who_have_ever_flirted_with_them_ever).
rule_category(people_are_more_rude_to_those_they_are_unattracted_to_who_have_ever_flirted_with_them_ever, romantic_attraction).
rule_source(people_are_more_rude_to_those_they_are_unattracted_to_who_have_ever_flirted_with_them_ever, ensemble).
rule_priority(people_are_more_rude_to_those_they_are_unattracted_to_who_have_ever_flirted_with_them_ever, 3).
rule_applies(people_are_more_rude_to_those_they_are_unattracted_to_who_have_ever_flirted_with_them_ever, X, Y) :-
    event(Y, flirted_with),
    network(X, Y, attraction, Attraction_val), Attraction_val < 4.
rule_effect(people_are_more_rude_to_those_they_are_unattracted_to_who_have_ever_flirted_with_them_ever, set_intent(X, rude, Y, 3)).

rule_likelihood(people_are_much_less_rude_to_those_who_they_are_attracted_to_if_they_flirted_with_them_recently, 1).
rule_type(people_are_much_less_rude_to_those_who_they_are_attracted_to_if_they_flirted_with_them_recently, volition).
% People are much less rude to those who they are attracted to if they flirted with them recently
rule_active(people_are_much_less_rude_to_those_who_they_are_attracted_to_if_they_flirted_with_them_recently).
rule_category(people_are_much_less_rude_to_those_who_they_are_attracted_to_if_they_flirted_with_them_recently, romantic_attraction).
rule_source(people_are_much_less_rude_to_those_who_they_are_attracted_to_if_they_flirted_with_them_recently, ensemble).
rule_priority(people_are_much_less_rude_to_those_who_they_are_attracted_to_if_they_flirted_with_them_recently, 5).
rule_applies(people_are_much_less_rude_to_those_who_they_are_attracted_to_if_they_flirted_with_them_recently, X, Y) :-
    event(Y, flirted_with),
    network(X, Y, attraction, Attraction_val), Attraction_val > 7.
rule_effect(people_are_much_less_rude_to_those_who_they_are_attracted_to_if_they_flirted_with_them_recently, set_intent(X, rude, Y, -5)).

rule_likelihood(people_don_t_flirt_with_their_family, 1).
rule_type(people_don_t_flirt_with_their_family, volition).
% People don’t flirt with their family
rule_active(people_don_t_flirt_with_their_family).
rule_category(people_don_t_flirt_with_their_family, romantic_attraction).
rule_source(people_don_t_flirt_with_their_family, ensemble).
rule_priority(people_don_t_flirt_with_their_family, 8).
rule_applies(people_don_t_flirt_with_their_family, X, Y) :-
    relationship(X, Y, family).
rule_effect(people_don_t_flirt_with_their_family, set_intent(X, flirt, Y, -999)).

rule_likelihood(people_are_more_inclined_in_general_to_flirt_with_their_coworkers, 1).
rule_type(people_are_more_inclined_in_general_to_flirt_with_their_coworkers, volition).
% People are more inclined in general to flirt with their coworkers
rule_active(people_are_more_inclined_in_general_to_flirt_with_their_coworkers).
rule_category(people_are_more_inclined_in_general_to_flirt_with_their_coworkers, romantic_attraction).
rule_source(people_are_more_inclined_in_general_to_flirt_with_their_coworkers, ensemble).
rule_priority(people_are_more_inclined_in_general_to_flirt_with_their_coworkers, 1).
rule_applies(people_are_more_inclined_in_general_to_flirt_with_their_coworkers, X, Y) :-
    relationship(X, Y, coworker),
    network(X, Y, attraction, Attraction_val), Attraction_val > 3,
    network(X, Y, attraction, Attraction_val), Attraction_val < 8.
rule_effect(people_are_more_inclined_in_general_to_flirt_with_their_coworkers, set_intent(X, flirt, Y, 2)).

rule_likelihood(people_are_more_inclined_in_general_to_flirt_with_their_coworkers_even_if_they_aren_t_attracted_to_them, 1).
rule_type(people_are_more_inclined_in_general_to_flirt_with_their_coworkers_even_if_they_aren_t_attracted_to_them, volition).
% People are more inclined in general to flirt with their coworkers even if they aren’t attracted to them
rule_active(people_are_more_inclined_in_general_to_flirt_with_their_coworkers_even_if_they_aren_t_attracted_to_them).
rule_category(people_are_more_inclined_in_general_to_flirt_with_their_coworkers_even_if_they_aren_t_attracted_to_them, romantic_attraction).
rule_source(people_are_more_inclined_in_general_to_flirt_with_their_coworkers_even_if_they_aren_t_attracted_to_them, ensemble).
rule_priority(people_are_more_inclined_in_general_to_flirt_with_their_coworkers_even_if_they_aren_t_attracted_to_them, 1).
rule_applies(people_are_more_inclined_in_general_to_flirt_with_their_coworkers_even_if_they_aren_t_attracted_to_them, X, Y) :-
    relationship(X, Y, coworker),
    network(X, Y, attraction, Attraction_val), Attraction_val < 4.
rule_effect(people_are_more_inclined_in_general_to_flirt_with_their_coworkers_even_if_they_aren_t_attracted_to_them, set_intent(X, flirt, Y, 1)).

rule_likelihood(people_are_much_more_flirty_with_people_they_are_dating, 1).
rule_type(people_are_much_more_flirty_with_people_they_are_dating, volition).
% People are much more flirty with people they are dating
rule_active(people_are_much_more_flirty_with_people_they_are_dating).
rule_category(people_are_much_more_flirty_with_people_they_are_dating, romantic_attraction).
rule_source(people_are_much_more_flirty_with_people_they_are_dating, ensemble).
rule_priority(people_are_much_more_flirty_with_people_they_are_dating, 5).
rule_applies(people_are_much_more_flirty_with_people_they_are_dating, X, Y) :-
    relationship(X, Y, dating).
rule_effect(people_are_much_more_flirty_with_people_they_are_dating, set_intent(X, flirt, Y, 5)).

rule_likelihood(people_flirt_less_with_people_they_don_t_have_friendly_feeling_towards, 1).
rule_type(people_flirt_less_with_people_they_don_t_have_friendly_feeling_towards, volition).
% People flirt less with people they don’t have friendly feeling towards
rule_active(people_flirt_less_with_people_they_don_t_have_friendly_feeling_towards).
rule_category(people_flirt_less_with_people_they_don_t_have_friendly_feeling_towards, romantic_attraction).
rule_source(people_flirt_less_with_people_they_don_t_have_friendly_feeling_towards, ensemble).
rule_priority(people_flirt_less_with_people_they_don_t_have_friendly_feeling_towards, 3).
rule_applies(people_flirt_less_with_people_they_don_t_have_friendly_feeling_towards, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val < 4.
rule_effect(people_flirt_less_with_people_they_don_t_have_friendly_feeling_towards, set_intent(X, flirt, Y, -3)).

rule_likelihood(friend_zone_people_flirt_less_with_people_they_have_a_lot_of_friendly_feeling_towards_as_long_as_they_aren_t_dating, 1).
rule_type(friend_zone_people_flirt_less_with_people_they_have_a_lot_of_friendly_feeling_towards_as_long_as_they_aren_t_dating, volition).
% Friend zone. People flirt less with people they have a lot of friendly feeling towards as long as they aren’t dating
rule_active(friend_zone_people_flirt_less_with_people_they_have_a_lot_of_friendly_feeling_towards_as_long_as_they_aren_t_dating).
rule_category(friend_zone_people_flirt_less_with_people_they_have_a_lot_of_friendly_feeling_towards_as_long_as_they_aren_t_dating, romantic_attraction).
rule_source(friend_zone_people_flirt_less_with_people_they_have_a_lot_of_friendly_feeling_towards_as_long_as_they_aren_t_dating, ensemble).
rule_priority(friend_zone_people_flirt_less_with_people_they_have_a_lot_of_friendly_feeling_towards_as_long_as_they_aren_t_dating, 3).
rule_applies(friend_zone_people_flirt_less_with_people_they_have_a_lot_of_friendly_feeling_towards_as_long_as_they_aren_t_dating, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val > 7,
    \+ relationship(X, Y, dating).
rule_effect(friend_zone_people_flirt_less_with_people_they_have_a_lot_of_friendly_feeling_towards_as_long_as_they_aren_t_dating, set_intent(X, flirt, Y, -3)).

rule_likelihood(people_don_t_flirt_with_people_they_are_unattracted_to, 1).
rule_type(people_don_t_flirt_with_people_they_are_unattracted_to, volition).
% People don’t flirt with people they are unattracted to
rule_active(people_don_t_flirt_with_people_they_are_unattracted_to).
rule_category(people_don_t_flirt_with_people_they_are_unattracted_to, romantic_attraction).
rule_source(people_don_t_flirt_with_people_they_are_unattracted_to, ensemble).
rule_priority(people_don_t_flirt_with_people_they_are_unattracted_to, 3).
rule_applies(people_don_t_flirt_with_people_they_are_unattracted_to, X, Y) :-
    network(X, Y, attraction, Attraction_val), Attraction_val < 4.
rule_effect(people_don_t_flirt_with_people_they_are_unattracted_to, set_intent(X, flirt, Y, -3)).

rule_likelihood(people_want_to_flirt_a_little_by_default, 1).
rule_type(people_want_to_flirt_a_little_by_default, volition).
% People want to flirt a little by default
rule_active(people_want_to_flirt_a_little_by_default).
rule_category(people_want_to_flirt_a_little_by_default, romantic_attraction).
rule_source(people_want_to_flirt_a_little_by_default, ensemble).
rule_priority(people_want_to_flirt_a_little_by_default, 1).
rule_applies(people_want_to_flirt_a_little_by_default, X, Y) :-
    network(X, Y, attraction, Attraction_val), Attraction_val > 3,
    network(X, Y, attraction, Attraction_val), Attraction_val < 8.
rule_effect(people_want_to_flirt_a_little_by_default, set_intent(X, flirt, Y, 1)).

rule_likelihood(people_are_flirty_with_people_they_are_attracted_to, 1).
rule_type(people_are_flirty_with_people_they_are_attracted_to, volition).
% People are flirty with people they are attracted to
rule_active(people_are_flirty_with_people_they_are_attracted_to).
rule_category(people_are_flirty_with_people_they_are_attracted_to, romantic_attraction).
rule_source(people_are_flirty_with_people_they_are_attracted_to, ensemble).
rule_priority(people_are_flirty_with_people_they_are_attracted_to, 5).
rule_applies(people_are_flirty_with_people_they_are_attracted_to, X, Y) :-
    network(X, Y, attraction, Attraction_val), Attraction_val > 7.
rule_effect(people_are_flirty_with_people_they_are_attracted_to, set_intent(X, flirt, Y, 5)).

rule_likelihood(people_don_t_want_to_flirt_with_people_they_don_t_respect, 1).
rule_type(people_don_t_want_to_flirt_with_people_they_don_t_respect, volition).
% People don’t want to flirt with people they don’t respect
rule_active(people_don_t_want_to_flirt_with_people_they_don_t_respect).
rule_category(people_don_t_want_to_flirt_with_people_they_don_t_respect, romantic_attraction).
rule_source(people_don_t_want_to_flirt_with_people_they_don_t_respect, ensemble).
rule_priority(people_don_t_want_to_flirt_with_people_they_don_t_respect, 1).
rule_applies(people_don_t_want_to_flirt_with_people_they_don_t_respect, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val < 4.
rule_effect(people_don_t_want_to_flirt_with_people_they_don_t_respect, set_intent(X, flirt, Y, -2)).

rule_likelihood(people_flirt_less_with_people_they_respect_a_lot, 1).
rule_type(people_flirt_less_with_people_they_respect_a_lot, volition).
% People flirt less with people they respect a lot
rule_active(people_flirt_less_with_people_they_respect_a_lot).
rule_category(people_flirt_less_with_people_they_respect_a_lot, romantic_attraction).
rule_source(people_flirt_less_with_people_they_respect_a_lot, ensemble).
rule_priority(people_flirt_less_with_people_they_respect_a_lot, 1).
rule_applies(people_flirt_less_with_people_they_respect_a_lot, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val > 7.
rule_effect(people_flirt_less_with_people_they_respect_a_lot, set_intent(X, flirt, Y, -2)).

rule_likelihood(friendly_people_are_a_little_flirty, 1).
rule_type(friendly_people_are_a_little_flirty, volition).
% Friendly people are a little flirty
rule_active(friendly_people_are_a_little_flirty).
rule_category(friendly_people_are_a_little_flirty, romantic_attraction).
rule_source(friendly_people_are_a_little_flirty, ensemble).
rule_priority(friendly_people_are_a_little_flirty, 1).
rule_applies(friendly_people_are_a_little_flirty, X, Y) :-
    trait(X, friendly).
rule_effect(friendly_people_are_a_little_flirty, set_intent(X, flirt, Y, 1)).

rule_likelihood(shy_people_are_less_flirty, 1).
rule_type(shy_people_are_less_flirty, volition).
% Shy people are less flirty
rule_active(shy_people_are_less_flirty).
rule_category(shy_people_are_less_flirty, romantic_attraction).
rule_source(shy_people_are_less_flirty, ensemble).
rule_priority(shy_people_are_less_flirty, 3).
rule_applies(shy_people_are_less_flirty, X, Y) :-
    trait(X, shy).
rule_effect(shy_people_are_less_flirty, set_intent(X, flirt, Y, -4)).

rule_likelihood(employees_are_less_flirty_with_non_employees, 1).
rule_type(employees_are_less_flirty_with_non_employees, volition).
% Employees are less flirty with non-employees
rule_active(employees_are_less_flirty_with_non_employees).
rule_category(employees_are_less_flirty_with_non_employees, romantic_attraction).
rule_source(employees_are_less_flirty_with_non_employees, ensemble).
rule_priority(employees_are_less_flirty_with_non_employees, 3).
rule_applies(employees_are_less_flirty_with_non_employees, X, Y) :-
    trait(X, employee),
    \+ trait(Y, employee).
rule_effect(employees_are_less_flirty_with_non_employees, set_intent(X, flirt, Y, -3)).

rule_likelihood(hangry_people_are_less_flirty, 1).
rule_type(hangry_people_are_less_flirty, volition).
% Hangry people are less flirty
rule_active(hangry_people_are_less_flirty).
rule_category(hangry_people_are_less_flirty, romantic_attraction).
rule_source(hangry_people_are_less_flirty, ensemble).
rule_priority(hangry_people_are_less_flirty, 1).
rule_applies(hangry_people_are_less_flirty, X, Y) :-
    status(X, hangry).
rule_effect(hangry_people_are_less_flirty, set_intent(X, flirt, Y, -2)).

rule_likelihood(employees_are_flirty_with_one_another_when_on_break, 1).
rule_type(employees_are_flirty_with_one_another_when_on_break, volition).
% Employees are flirty with one another when on break
rule_active(employees_are_flirty_with_one_another_when_on_break).
rule_category(employees_are_flirty_with_one_another_when_on_break, romantic_attraction).
rule_source(employees_are_flirty_with_one_another_when_on_break, ensemble).
rule_priority(employees_are_flirty_with_one_another_when_on_break, 3).
rule_applies(employees_are_flirty_with_one_another_when_on_break, X, Y) :-
    status(X, on_break),
    trait(X, employee),
    trait(Y, employee).
rule_effect(employees_are_flirty_with_one_another_when_on_break, set_intent(X, flirt, Y, 4)).

rule_likelihood(bosses_are_less_flirty_with_their_employees, 1).
rule_type(bosses_are_less_flirty_with_their_employees, volition).
% Bosses are less flirty with their employees
rule_active(bosses_are_less_flirty_with_their_employees).
rule_category(bosses_are_less_flirty_with_their_employees, romantic_attraction).
rule_source(bosses_are_less_flirty_with_their_employees, ensemble).
rule_priority(bosses_are_less_flirty_with_their_employees, 3).
rule_applies(bosses_are_less_flirty_with_their_employees, X, Y) :-
    directed_status(X, Y, is_boss_of),
    trait(Y, employee).
rule_effect(bosses_are_less_flirty_with_their_employees, set_intent(X, flirt, Y, -3)).

rule_likelihood(people_want_to_flirt_with_people_who_were_nice_to_them_recently, 1).
rule_type(people_want_to_flirt_with_people_who_were_nice_to_them_recently, volition).
% People want to flirt with people who were nice to them recently
rule_active(people_want_to_flirt_with_people_who_were_nice_to_them_recently).
rule_category(people_want_to_flirt_with_people_who_were_nice_to_them_recently, romantic_attraction).
rule_source(people_want_to_flirt_with_people_who_were_nice_to_them_recently, ensemble).
rule_priority(people_want_to_flirt_with_people_who_were_nice_to_them_recently, 1).
rule_applies(people_want_to_flirt_with_people_who_were_nice_to_them_recently, X, Y) :-
    event(Y, nice).
rule_effect(people_want_to_flirt_with_people_who_were_nice_to_them_recently, set_intent(X, flirt, Y, 1)).

rule_likelihood(people_don_t_want_to_flirt_with_people_who_were_rude_to_them_recently, 1).
rule_type(people_don_t_want_to_flirt_with_people_who_were_rude_to_them_recently, volition).
% People don’t want to flirt with people who were rude to them recently
rule_active(people_don_t_want_to_flirt_with_people_who_were_rude_to_them_recently).
rule_category(people_don_t_want_to_flirt_with_people_who_were_rude_to_them_recently, romantic_attraction).
rule_source(people_don_t_want_to_flirt_with_people_who_were_rude_to_them_recently, ensemble).
rule_priority(people_don_t_want_to_flirt_with_people_who_were_rude_to_them_recently, 3).
rule_applies(people_don_t_want_to_flirt_with_people_who_were_rude_to_them_recently, X, Y) :-
    event(Y, rude).
rule_effect(people_don_t_want_to_flirt_with_people_who_were_rude_to_them_recently, set_intent(X, flirt, Y, -3)).

rule_likelihood(people_want_to_flirt_with_people_who_flirted_with_them_recently, 1).
rule_type(people_want_to_flirt_with_people_who_flirted_with_them_recently, volition).
% People want to flirt with people who flirted with them recently
rule_active(people_want_to_flirt_with_people_who_flirted_with_them_recently).
rule_category(people_want_to_flirt_with_people_who_flirted_with_them_recently, romantic_attraction).
rule_source(people_want_to_flirt_with_people_who_flirted_with_them_recently, ensemble).
rule_priority(people_want_to_flirt_with_people_who_flirted_with_them_recently, 3).
rule_applies(people_want_to_flirt_with_people_who_flirted_with_them_recently, X, Y) :-
    event(Y, flirted_with).
rule_effect(people_want_to_flirt_with_people_who_flirted_with_them_recently, set_intent(X, flirt, Y, 3)).

rule_likelihood(people_don_t_want_to_flirt_with_people_who_have_embarrassed_themself_recently, 1).
rule_type(people_don_t_want_to_flirt_with_people_who_have_embarrassed_themself_recently, volition).
% People don’t want to flirt with people who have embarrassed themself recently
rule_active(people_don_t_want_to_flirt_with_people_who_have_embarrassed_themself_recently).
rule_category(people_don_t_want_to_flirt_with_people_who_have_embarrassed_themself_recently, romantic_attraction).
rule_source(people_don_t_want_to_flirt_with_people_who_have_embarrassed_themself_recently, ensemble).
rule_priority(people_don_t_want_to_flirt_with_people_who_have_embarrassed_themself_recently, 3).
rule_applies(people_don_t_want_to_flirt_with_people_who_have_embarrassed_themself_recently, X, Y) :-
    event(Y, embarrassment),
    trait('z', anyone).
rule_effect(people_don_t_want_to_flirt_with_people_who_have_embarrassed_themself_recently, set_intent(X, flirt, Y, -4)).

%% ═══════════════════════════════════════════════════════════
%% Category: social-connection
%% ═══════════════════════════════════════════════════════════

%% Ensemble Volition Rules: social-connection
%% Source: data/ensemble/volitionRules/social-connection.json
%% Converted: 2026-04-02T20:09:49.734Z
%% Total rules: 10

rule_likelihood(people_seek_to_connect_with_individuals_who_have_strong_familial_ties, 1).
rule_type(people_seek_to_connect_with_individuals_who_have_strong_familial_ties, volition).
% People seek to connect with individuals who have strong familial ties.
rule_active(people_seek_to_connect_with_individuals_who_have_strong_familial_ties).
rule_category(people_seek_to_connect_with_individuals_who_have_strong_familial_ties, social_connection).
rule_source(people_seek_to_connect_with_individuals_who_have_strong_familial_ties, ensemble).
rule_priority(people_seek_to_connect_with_individuals_who_have_strong_familial_ties, 3).
rule_applies(people_seek_to_connect_with_individuals_who_have_strong_familial_ties, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    network(Y, 'z', familial, Familial_val), Familial_val > 6.
rule_effect(people_seek_to_connect_with_individuals_who_have_strong_familial_ties, set_intent(X, candid, Y, 3)).

rule_likelihood(people_with_a_strong_desire_to_connect_and_the_recent_positive_mean_interaction_within_8_turns_are_likely, 1).
rule_type(people_with_a_strong_desire_to_connect_and_the_recent_positive_mean_interaction_within_8_turns_are_likely, volition).
% People with a strong desire to connect and the recent positive mean interaction within 8 turns are likely
rule_active(people_with_a_strong_desire_to_connect_and_the_recent_positive_mean_interaction_within_8_turns_are_likely).
rule_category(people_with_a_strong_desire_to_connect_and_the_recent_positive_mean_interaction_within_8_turns_are_likely, social_connection).
rule_source(people_with_a_strong_desire_to_connect_and_the_recent_positive_mean_interaction_within_8_turns_are_likely, ensemble).
rule_priority(people_with_a_strong_desire_to_connect_and_the_recent_positive_mean_interaction_within_8_turns_are_likely, 1).
rule_applies(people_with_a_strong_desire_to_connect_and_the_recent_positive_mean_interaction_within_8_turns_are_likely, X, Y) :-
    network(X, 'z', romance, Romance_val), Romance_val > 6,
    event(Y, mean).
rule_effect(people_with_a_strong_desire_to_connect_and_the_recent_positive_mean_interaction_within_8_turns_are_likely, set_intent(X, candid, Y, -1)).

rule_likelihood(people_with_a_strong_familial_network_of_connections_with_at_least_6_members_and_who, 1).
rule_type(people_with_a_strong_familial_network_of_connections_with_at_least_6_members_and_who, volition).
% People with a strong familial network of connections (with at least 6 members) and who
rule_active(people_with_a_strong_familial_network_of_connections_with_at_least_6_members_and_who).
rule_category(people_with_a_strong_familial_network_of_connections_with_at_least_6_members_and_who, social_connection).
rule_source(people_with_a_strong_familial_network_of_connections_with_at_least_6_members_and_who, ensemble).
rule_priority(people_with_a_strong_familial_network_of_connections_with_at_least_6_members_and_who, 1).
rule_applies(people_with_a_strong_familial_network_of_connections_with_at_least_6_members_and_who, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, mean).
rule_effect(people_with_a_strong_familial_network_of_connections_with_at_least_6_members_and_who, set_intent(X, candid, Y, -1)).

rule_likelihood(people_with_a_strong_familial_network_of_connections_greater_than_6_and_who_have_had_an_interest, 1).
rule_type(people_with_a_strong_familial_network_of_connections_greater_than_6_and_who_have_had_an_interest, volition).
% People with a strong familial network of connections greater than 6 and who have had an interest
rule_active(people_with_a_strong_familial_network_of_connections_greater_than_6_and_who_have_had_an_interest).
rule_category(people_with_a_strong_familial_network_of_connections_greater_than_6_and_who_have_had_an_interest, social_connection).
rule_source(people_with_a_strong_familial_network_of_connections_greater_than_6_and_who_have_had_an_interest, ensemble).
rule_priority(people_with_a_strong_familial_network_of_connections_greater_than_6_and_who_have_had_an_interest, 1).
rule_applies(people_with_a_strong_familial_network_of_connections_greater_than_6_and_who_have_had_an_interest, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, mean).
rule_effect(people_with_a_strong_familial_network_of_connections_greater_than_6_and_who_have_had_an_interest, set_intent(X, candid, Y, -1)).

rule_likelihood(people_feel_gratitude_towards_others_with_a_higher_network_influence_score_than_themselves, 1).
rule_type(people_feel_gratitude_towards_others_with_a_higher_network_influence_score_than_themselves, volition).
% People feel gratitude towards others with a higher network influence score than themselves.
rule_active(people_feel_gratitude_towards_others_with_a_higher_network_influence_score_than_themselves).
rule_category(people_feel_gratitude_towards_others_with_a_higher_network_influence_score_than_themselves, social_connection).
rule_source(people_feel_gratitude_towards_others_with_a_higher_network_influence_score_than_themselves, ensemble).
rule_priority(people_feel_gratitude_towards_others_with_a_higher_network_influence_score_than_themselves, 3).
rule_applies(people_feel_gratitude_towards_others_with_a_higher_network_influence_score_than_themselves, X, Y) :-
    network(X, Y, gratitude, Gratitude_val), Gratitude_val > 6.
rule_effect(people_feel_gratitude_towards_others_with_a_higher_network_influence_score_than_themselves, set_intent(X, favor, Y, 3)).

rule_likelihood(people_seek_companionship_with_those_exhibiting_high_altruism_levels, 1).
rule_type(people_seek_companionship_with_those_exhibiting_high_altruism_levels, volition).
% People seek companionship with those exhibiting high altruism levels.
rule_active(people_seek_companionship_with_those_exhibiting_high_altruism_levels).
rule_category(people_seek_companionship_with_those_exhibiting_high_altruism_levels, social_connection).
rule_source(people_seek_companionship_with_those_exhibiting_high_altruism_levels, ensemble).
rule_priority(people_seek_companionship_with_those_exhibiting_high_altruism_levels, 1).
rule_applies(people_seek_companionship_with_those_exhibiting_high_altruism_levels, X, Y) :-
    attribute(X, altruism, Altruism_val), Altruism_val < 7.
rule_effect(people_seek_companionship_with_those_exhibiting_high_altruism_levels, set_intent(X, favor, Y, -2)).

rule_likelihood(people_seek_stronger_connections_when_they_have_a_moderate_sized_network_of_acquaintances, 1).
rule_type(people_seek_stronger_connections_when_they_have_a_moderate_sized_network_of_acquaintances, volition).
% People seek stronger connections when they have a moderate-sized network of acquaintances.
rule_active(people_seek_stronger_connections_when_they_have_a_moderate_sized_network_of_acquaintances).
rule_category(people_seek_stronger_connections_when_they_have_a_moderate_sized_network_of_acquaintances, social_connection).
rule_source(people_seek_stronger_connections_when_they_have_a_moderate_sized_network_of_acquaintances, ensemble).
rule_priority(people_seek_stronger_connections_when_they_have_a_moderate_sized_network_of_acquaintances, 1).
rule_applies(people_seek_stronger_connections_when_they_have_a_moderate_sized_network_of_acquaintances, X, Y) :-
    network(X, Y, familial, Familial_val), Familial_val > 6.
rule_effect(people_seek_stronger_connections_when_they_have_a_moderate_sized_network_of_acquaintances, set_intent(X, honor, Y, 1)).

rule_likelihood(people_desire_stronger_connections_with_individuals_of_higher_social_influence_in_their_network, 1).
rule_type(people_desire_stronger_connections_with_individuals_of_higher_social_influence_in_their_network, volition).
% People desire stronger connections with individuals of higher social influence in their network.
rule_active(people_desire_stronger_connections_with_individuals_of_higher_social_influence_in_their_network).
rule_category(people_desire_stronger_connections_with_individuals_of_higher_social_influence_in_their_network, social_connection).
rule_source(people_desire_stronger_connections_with_individuals_of_higher_social_influence_in_their_network, ensemble).
rule_priority(people_desire_stronger_connections_with_individuals_of_higher_social_influence_in_their_network, 5).
rule_applies(people_desire_stronger_connections_with_individuals_of_higher_social_influence_in_their_network, X, Y) :-
    network(X, Y, romance, Romance_val), Romance_val > 6.
rule_effect(people_desire_stronger_connections_with_individuals_of_higher_social_influence_in_their_network, set_intent(X, kind, Y, 5)).

rule_likelihood(people_seek_to_associate_with_individuals_of_greater_influence_due_to_gratitude, 1).
rule_type(people_seek_to_associate_with_individuals_of_greater_influence_due_to_gratitude, volition).
% People seek to associate with individuals of greater influence due to gratitude.
rule_active(people_seek_to_associate_with_individuals_of_greater_influence_due_to_gratitude).
rule_category(people_seek_to_associate_with_individuals_of_greater_influence_due_to_gratitude, social_connection).
rule_source(people_seek_to_associate_with_individuals_of_greater_influence_due_to_gratitude, ensemble).
rule_priority(people_seek_to_associate_with_individuals_of_greater_influence_due_to_gratitude, 3).
rule_applies(people_seek_to_associate_with_individuals_of_greater_influence_due_to_gratitude, X, Y) :-
    network(X, Y, gratitude, Gratitude_val), Gratitude_val > 6.
rule_effect(people_seek_to_associate_with_individuals_of_greater_influence_due_to_gratitude, set_intent(X, kind, Y, 3)).

rule_likelihood(people_seek_companionship_with_those_who_exhibit_high_altruism_levels, 1).
rule_type(people_seek_companionship_with_those_who_exhibit_high_altruism_levels, volition).
% People seek companionship with those who exhibit high altruism levels.
rule_active(people_seek_companionship_with_those_who_exhibit_high_altruism_levels).
rule_category(people_seek_companionship_with_those_who_exhibit_high_altruism_levels, social_connection).
rule_source(people_seek_companionship_with_those_who_exhibit_high_altruism_levels, ensemble).
rule_priority(people_seek_companionship_with_those_who_exhibit_high_altruism_levels, 1).
rule_applies(people_seek_companionship_with_those_who_exhibit_high_altruism_levels, X, Y) :-
    attribute(X, altruism, Altruism_val), Altruism_val < 7.
rule_effect(people_seek_companionship_with_those_who_exhibit_high_altruism_levels, set_intent(X, kind, Y, -2)).

%% ═══════════════════════════════════════════════════════════
%% Category: social-distance
%% ═══════════════════════════════════════════════════════════

%% Ensemble Volition Rules: social-distance
%% Source: data/ensemble/volitionRules/social-distance.json
%% Converted: 2026-04-02T20:09:49.734Z
%% Total rules: 26

rule_likelihood(people_may_avoid_offending_their_friends_enemies, 1).
rule_type(people_may_avoid_offending_their_friends_enemies, volition).
% People may avoid offending their friends’ enemies
rule_active(people_may_avoid_offending_their_friends_enemies).
rule_category(people_may_avoid_offending_their_friends_enemies, social_distance).
rule_source(people_may_avoid_offending_their_friends_enemies, ensemble).
rule_priority(people_may_avoid_offending_their_friends_enemies, 5).
rule_applies(people_may_avoid_offending_their_friends_enemies, X, Y) :-
    relationship(X, 'z', rivals),
    relationship(Y, X, friends).
rule_effect(people_may_avoid_offending_their_friends_enemies, modify_network(Y, 'z', affinity, '+', 5)).

rule_likelihood(grateful_modest_people_receiving_a_gift_may_avoid_making_others_jealous, 1).
rule_type(grateful_modest_people_receiving_a_gift_may_avoid_making_others_jealous, volition).
% Grateful, modest people receiving a gift may avoid making others jealous
rule_active(grateful_modest_people_receiving_a_gift_may_avoid_making_others_jealous).
rule_category(grateful_modest_people_receiving_a_gift_may_avoid_making_others_jealous, social_distance).
rule_source(grateful_modest_people_receiving_a_gift_may_avoid_making_others_jealous, ensemble).
rule_priority(grateful_modest_people_receiving_a_gift_may_avoid_making_others_jealous, 5).
rule_applies(grateful_modest_people_receiving_a_gift_may_avoid_making_others_jealous, X, Y) :-
    status(X, grateful),
    trait(X, honest),
    trait(X, modest),
    trait(Y, generous),
    directed_status('z', X, jealous_of).
rule_effect(grateful_modest_people_receiving_a_gift_may_avoid_making_others_jealous, modify_network(X, 'z', curiosity, '-', 3)).
rule_effect(grateful_modest_people_receiving_a_gift_may_avoid_making_others_jealous, modify_network(X, Y, affinity, '+', 5)).

rule_likelihood(people_with_a_high_affinity_for_others_want_to_avoid_the_attention_of_nosy_friends, 1).
rule_type(people_with_a_high_affinity_for_others_want_to_avoid_the_attention_of_nosy_friends, volition).
% People with a high affinity for others want to avoid the attention of nosy friends
rule_active(people_with_a_high_affinity_for_others_want_to_avoid_the_attention_of_nosy_friends).
rule_category(people_with_a_high_affinity_for_others_want_to_avoid_the_attention_of_nosy_friends, social_distance).
rule_source(people_with_a_high_affinity_for_others_want_to_avoid_the_attention_of_nosy_friends, ensemble).
rule_priority(people_with_a_high_affinity_for_others_want_to_avoid_the_attention_of_nosy_friends, 5).
rule_applies(people_with_a_high_affinity_for_others_want_to_avoid_the_attention_of_nosy_friends, X, Y) :-
    attribute(X, nosiness, Nosiness_val), Nosiness_val > 60,
    network('z', Y, affinity, Affinity_val), Affinity_val > 70,
    relationship(X, Y, friends).
rule_effect(people_with_a_high_affinity_for_others_want_to_avoid_the_attention_of_nosy_friends, modify_network('z', Y, curiosity, '+', 5)).

rule_likelihood(if_somebody_s_trustfulness_is_low_then_they_will_be_more_likely_to_be_reluctant, 1).
rule_type(if_somebody_s_trustfulness_is_low_then_they_will_be_more_likely_to_be_reluctant, volition).
% If somebody’s trustfulness is low, then they will be more likely to be reluctant.
rule_active(if_somebody_s_trustfulness_is_low_then_they_will_be_more_likely_to_be_reluctant).
rule_category(if_somebody_s_trustfulness_is_low_then_they_will_be_more_likely_to_be_reluctant, social_distance).
rule_source(if_somebody_s_trustfulness_is_low_then_they_will_be_more_likely_to_be_reluctant, ensemble).
rule_priority(if_somebody_s_trustfulness_is_low_then_they_will_be_more_likely_to_be_reluctant, 3).
rule_applies(if_somebody_s_trustfulness_is_low_then_they_will_be_more_likely_to_be_reluctant, X, Y) :-
    attribute(X, trustfulness, Trustfulness_val), Trustfulness_val < 33.
rule_effect(if_somebody_s_trustfulness_is_low_then_they_will_be_more_likely_to_be_reluctant, set_intent(X, reluctant, Y, 3)).

rule_likelihood(if_someone_is_interacting_with_an_outsider_then_they_will_be_more_likely_to_be_reluctant, 1).
rule_type(if_someone_is_interacting_with_an_outsider_then_they_will_be_more_likely_to_be_reluctant, volition).
% If someone is interacting with an outsider, then they will be more likely to be reluctant.
rule_active(if_someone_is_interacting_with_an_outsider_then_they_will_be_more_likely_to_be_reluctant).
rule_category(if_someone_is_interacting_with_an_outsider_then_they_will_be_more_likely_to_be_reluctant, social_distance).
rule_source(if_someone_is_interacting_with_an_outsider_then_they_will_be_more_likely_to_be_reluctant, ensemble).
rule_priority(if_someone_is_interacting_with_an_outsider_then_they_will_be_more_likely_to_be_reluctant, 5).
rule_applies(if_someone_is_interacting_with_an_outsider_then_they_will_be_more_likely_to_be_reluctant, X, Y) :-
    status(Y, outsider).
rule_effect(if_someone_is_interacting_with_an_outsider_then_they_will_be_more_likely_to_be_reluctant, set_intent(X, reluctant, Y, 5)).

rule_likelihood(if_someone_has_positively_met_an_outsider_then_they_are_less_likely_to_be_reluctant, 1).
rule_type(if_someone_has_positively_met_an_outsider_then_they_are_less_likely_to_be_reluctant, volition).
% If someone has positively met an outsider, then they are less likely to be reluctant.
rule_active(if_someone_has_positively_met_an_outsider_then_they_are_less_likely_to_be_reluctant).
rule_category(if_someone_has_positively_met_an_outsider_then_they_are_less_likely_to_be_reluctant, social_distance).
rule_source(if_someone_has_positively_met_an_outsider_then_they_are_less_likely_to_be_reluctant, ensemble).
rule_priority(if_someone_has_positively_met_an_outsider_then_they_are_less_likely_to_be_reluctant, 3).
rule_applies(if_someone_has_positively_met_an_outsider_then_they_are_less_likely_to_be_reluctant, X, Y) :-
    status(Y, outsider),
    event(X, met),
    event(Y, positive).
rule_effect(if_someone_has_positively_met_an_outsider_then_they_are_less_likely_to_be_reluctant, set_intent(X, reluctant, Y, -3)).

rule_likelihood(if_someone_has_negatively_met_an_outsider_then_they_are_more_likely_to_be_reluctant, 1).
rule_type(if_someone_has_negatively_met_an_outsider_then_they_are_more_likely_to_be_reluctant, volition).
% If someone has negatively met an outsider, then they are more likely to be reluctant.
rule_active(if_someone_has_negatively_met_an_outsider_then_they_are_more_likely_to_be_reluctant).
rule_category(if_someone_has_negatively_met_an_outsider_then_they_are_more_likely_to_be_reluctant, social_distance).
rule_source(if_someone_has_negatively_met_an_outsider_then_they_are_more_likely_to_be_reluctant, ensemble).
rule_priority(if_someone_has_negatively_met_an_outsider_then_they_are_more_likely_to_be_reluctant, 3).
rule_applies(if_someone_has_negatively_met_an_outsider_then_they_are_more_likely_to_be_reluctant, X, Y) :-
    status(Y, outsider),
    event(X, met),
    event(Y, negative).
rule_effect(if_someone_has_negatively_met_an_outsider_then_they_are_more_likely_to_be_reluctant, set_intent(X, reluctant, Y, 3)).

rule_likelihood(if_you_have_low_familiarity_towards_someone_you_are_more_likely_to_be_reluctant, 1).
rule_type(if_you_have_low_familiarity_towards_someone_you_are_more_likely_to_be_reluctant, volition).
% If you have low familiarity towards someone, you are more likely to be reluctant.
rule_active(if_you_have_low_familiarity_towards_someone_you_are_more_likely_to_be_reluctant).
rule_category(if_you_have_low_familiarity_towards_someone_you_are_more_likely_to_be_reluctant, social_distance).
rule_source(if_you_have_low_familiarity_towards_someone_you_are_more_likely_to_be_reluctant, ensemble).
rule_priority(if_you_have_low_familiarity_towards_someone_you_are_more_likely_to_be_reluctant, 1).
rule_applies(if_you_have_low_familiarity_towards_someone_you_are_more_likely_to_be_reluctant, X, Y) :-
    network(X, Y, familiarity, Familiarity_val), Familiarity_val < 4.
rule_effect(if_you_have_low_familiarity_towards_someone_you_are_more_likely_to_be_reluctant, set_intent(X, reluctant, Y, 1)).

rule_likelihood(if_you_have_high_familiarity_towars_someone_you_are_less_likely_to_be_reluctant_towards_them, 1).
rule_type(if_you_have_high_familiarity_towars_someone_you_are_less_likely_to_be_reluctant_towards_them, volition).
% If you have high familiarity towars someone you are less likely to be reluctant towards them.
rule_active(if_you_have_high_familiarity_towars_someone_you_are_less_likely_to_be_reluctant_towards_them).
rule_category(if_you_have_high_familiarity_towars_someone_you_are_less_likely_to_be_reluctant_towards_them, social_distance).
rule_source(if_you_have_high_familiarity_towars_someone_you_are_less_likely_to_be_reluctant_towards_them, ensemble).
rule_priority(if_you_have_high_familiarity_towars_someone_you_are_less_likely_to_be_reluctant_towards_them, 1).
rule_applies(if_you_have_high_familiarity_towars_someone_you_are_less_likely_to_be_reluctant_towards_them, X, Y) :-
    intent(X, reluctant, Y).
rule_effect(if_you_have_high_familiarity_towars_someone_you_are_less_likely_to_be_reluctant_towards_them, set_intent(X, reluctant, Y, -1)).

rule_likelihood(people_are_more_likely_to_be_reluctant_to_somebody_if_their_family_members_don_t_trust_them, 1).
rule_type(people_are_more_likely_to_be_reluctant_to_somebody_if_their_family_members_don_t_trust_them, volition).
% People are more likely to be reluctant to somebody if their family members don’t trust them.
rule_active(people_are_more_likely_to_be_reluctant_to_somebody_if_their_family_members_don_t_trust_them).
rule_category(people_are_more_likely_to_be_reluctant_to_somebody_if_their_family_members_don_t_trust_them, social_distance).
rule_source(people_are_more_likely_to_be_reluctant_to_somebody_if_their_family_members_don_t_trust_them, ensemble).
rule_priority(people_are_more_likely_to_be_reluctant_to_somebody_if_their_family_members_don_t_trust_them, 1).
rule_applies(people_are_more_likely_to_be_reluctant_to_somebody_if_their_family_members_don_t_trust_them, X, Y) :-
    network('z', Y, trust, Trust_val), Trust_val < 5,
    status(X, family),
    status('z', family).
rule_effect(people_are_more_likely_to_be_reluctant_to_somebody_if_their_family_members_don_t_trust_them, set_intent(X, reluctant, Y, 1)).

rule_likelihood(high_status_person_has_more_likely_to_be_reluctant_if_they_are_treated_informally, 1).
rule_type(high_status_person_has_more_likely_to_be_reluctant_if_they_are_treated_informally, volition).
% High status person has more likely to be reluctant if they are treated informally
rule_active(high_status_person_has_more_likely_to_be_reluctant_if_they_are_treated_informally).
rule_category(high_status_person_has_more_likely_to_be_reluctant_if_they_are_treated_informally, social_distance).
rule_source(high_status_person_has_more_likely_to_be_reluctant_if_they_are_treated_informally, ensemble).
rule_priority(high_status_person_has_more_likely_to_be_reluctant_if_they_are_treated_informally, 5).
rule_applies(high_status_person_has_more_likely_to_be_reluctant_if_they_are_treated_informally, X, Y) :-
    event(Y, informal),
    attribute(X, status_individual, Status_individual_val), Status_individual_val > 50.
rule_effect(high_status_person_has_more_likely_to_be_reluctant_if_they_are_treated_informally, set_intent(X, reluctant, Y, 5)).

rule_likelihood(high_status_person_negative_respectful_request_inceased_reluctant_volition, 1).
rule_type(high_status_person_negative_respectful_request_inceased_reluctant_volition, volition).
% High Status person: Negative + Respectful Request -> inceased reluctant volition
rule_active(high_status_person_negative_respectful_request_inceased_reluctant_volition).
rule_category(high_status_person_negative_respectful_request_inceased_reluctant_volition, social_distance).
rule_source(high_status_person_negative_respectful_request_inceased_reluctant_volition, ensemble).
rule_priority(high_status_person_negative_respectful_request_inceased_reluctant_volition, 5).
rule_applies(high_status_person_negative_respectful_request_inceased_reluctant_volition, X, Y) :-
    event(X, negative),
    event(Y, respectful),
    attribute(X, status_individual, Status_individual_val), Status_individual_val > 50.
rule_effect(high_status_person_negative_respectful_request_inceased_reluctant_volition, set_intent(X, reluctant, Y, 5)).

rule_likelihood(no_greet_respectful_request_for_high_status_increased_reluctant_volition, 1).
rule_type(no_greet_respectful_request_for_high_status_increased_reluctant_volition, volition).
% No greet + respectful request for high status--> increased reluctant volition
rule_active(no_greet_respectful_request_for_high_status_increased_reluctant_volition).
rule_category(no_greet_respectful_request_for_high_status_increased_reluctant_volition, social_distance).
rule_source(no_greet_respectful_request_for_high_status_increased_reluctant_volition, ensemble).
rule_priority(no_greet_respectful_request_for_high_status_increased_reluctant_volition, 5).
rule_applies(no_greet_respectful_request_for_high_status_increased_reluctant_volition, X, Y) :-
    \+ event(Y, met),
    event(Y, respectful),
    attribute(X, status_individual, Status_individual_val), Status_individual_val > 50.
rule_effect(no_greet_respectful_request_for_high_status_increased_reluctant_volition, set_intent(X, reluctant, Y, 5)).

rule_likelihood(no_greet_neutral_request_for_a_low_status_person_reluctant_volition_increased, 1).
rule_type(no_greet_neutral_request_for_a_low_status_person_reluctant_volition_increased, volition).
% No Greet + neutral request for a low status person -> reluctant volition increased
rule_active(no_greet_neutral_request_for_a_low_status_person_reluctant_volition_increased).
rule_category(no_greet_neutral_request_for_a_low_status_person_reluctant_volition_increased, social_distance).
rule_source(no_greet_neutral_request_for_a_low_status_person_reluctant_volition_increased, ensemble).
rule_priority(no_greet_neutral_request_for_a_low_status_person_reluctant_volition_increased, 5).
rule_applies(no_greet_neutral_request_for_a_low_status_person_reluctant_volition_increased, X, Y) :-
    \+ event(X, met),
    event(Y, neutral),
    attribute(X, status_individual, Status_individual_val), Status_individual_val < 51.
rule_effect(no_greet_neutral_request_for_a_low_status_person_reluctant_volition_increased, set_intent(X, reluctant, Y, 5)).

rule_likelihood(positive_and_respectful_request_to_a_low_status_person_increased_reluctant_volition, 1).
rule_type(positive_and_respectful_request_to_a_low_status_person_increased_reluctant_volition, volition).
% Positive and respectful request to a low status person -> increased reluctant volition
rule_active(positive_and_respectful_request_to_a_low_status_person_increased_reluctant_volition).
rule_category(positive_and_respectful_request_to_a_low_status_person_increased_reluctant_volition, social_distance).
rule_source(positive_and_respectful_request_to_a_low_status_person_increased_reluctant_volition, ensemble).
rule_priority(positive_and_respectful_request_to_a_low_status_person_increased_reluctant_volition, 5).
rule_applies(positive_and_respectful_request_to_a_low_status_person_increased_reluctant_volition, X, Y) :-
    event(X, positive),
    event(Y, respectful),
    attribute(X, status_individual, Status_individual_val), Status_individual_val < 51.
rule_effect(positive_and_respectful_request_to_a_low_status_person_increased_reluctant_volition, set_intent(X, reluctant, Y, 5)).

rule_likelihood(negative_and_neutral_request_to_a_low_status_person_increased_reluctant_volition, 1).
rule_type(negative_and_neutral_request_to_a_low_status_person_increased_reluctant_volition, volition).
% Negative and neutral request to a low status person -> increased reluctant volition
rule_active(negative_and_neutral_request_to_a_low_status_person_increased_reluctant_volition).
rule_category(negative_and_neutral_request_to_a_low_status_person_increased_reluctant_volition, social_distance).
rule_source(negative_and_neutral_request_to_a_low_status_person_increased_reluctant_volition, ensemble).
rule_priority(negative_and_neutral_request_to_a_low_status_person_increased_reluctant_volition, 5).
rule_applies(negative_and_neutral_request_to_a_low_status_person_increased_reluctant_volition, X, Y) :-
    event(X, negative),
    event(Y, neutral),
    attribute(X, status_individual, Status_individual_val), Status_individual_val < 51.
rule_effect(negative_and_neutral_request_to_a_low_status_person_increased_reluctant_volition, set_intent(X, reluctant, Y, 5)).

rule_likelihood(people_seek_to_distance_themselves_from_average_individuals_when_they_have_a_strong_attraction_towards_someone_and_it, 1).
rule_type(people_seek_to_distance_themselves_from_average_individuals_when_they_have_a_strong_attraction_towards_someone_and_it, volition).
% People seek to distance themselves from average individuals when they have a strong attraction towards someone and it
rule_active(people_seek_to_distance_themselves_from_average_individuals_when_they_have_a_strong_attraction_towards_someone_and_it).
rule_category(people_seek_to_distance_themselves_from_average_individuals_when_they_have_a_strong_attraction_towards_someone_and_it, social_distance).
rule_source(people_seek_to_distance_themselves_from_average_individuals_when_they_have_a_strong_attraction_towards_someone_and_it, ensemble).
rule_priority(people_seek_to_distance_themselves_from_average_individuals_when_they_have_a_strong_attraction_towards_someone_and_it, 3).
rule_applies(people_seek_to_distance_themselves_from_average_individuals_when_they_have_a_strong_attraction_towards_someone_and_it, X, Y) :-
    network(X, 'z', romance, Romance_val), Romance_val > 6,
    event(Y, mean).
rule_effect(people_seek_to_distance_themselves_from_average_individuals_when_they_have_a_strong_attraction_towards_someone_and_it, set_intent(X, antagonize, Y, 3)).

rule_likelihood(people_avoid_dating_their_rivals_partners, 1).
rule_type(people_avoid_dating_their_rivals_partners, volition).
% People avoid dating their rivals’ partners.
rule_active(people_avoid_dating_their_rivals_partners).
rule_category(people_avoid_dating_their_rivals_partners, social_distance).
rule_source(people_avoid_dating_their_rivals_partners, ensemble).
rule_priority(people_avoid_dating_their_rivals_partners, 1).
rule_applies(people_avoid_dating_their_rivals_partners, X, Y) :-
    directed_status(X, Y, rivals).
rule_effect(people_avoid_dating_their_rivals_partners, set_intent(X, candid, Y, -2)).

rule_likelihood(people_desire_to_be_in_the_presence_of_influential_individuals_while_avoiding_their_crush, 1).
rule_type(people_desire_to_be_in_the_presence_of_influential_individuals_while_avoiding_their_crush, volition).
% People desire to be in the presence of influential individuals while avoiding their crush.
rule_active(people_desire_to_be_in_the_presence_of_influential_individuals_while_avoiding_their_crush).
rule_category(people_desire_to_be_in_the_presence_of_influential_individuals_while_avoiding_their_crush, social_distance).
rule_source(people_desire_to_be_in_the_presence_of_influential_individuals_while_avoiding_their_crush, ensemble).
rule_priority(people_desire_to_be_in_the_presence_of_influential_individuals_while_avoiding_their_crush, 1).
rule_applies(people_desire_to_be_in_the_presence_of_influential_individuals_while_avoiding_their_crush, X, Y) :-
    event(X, mean).
rule_effect(people_desire_to_be_in_the_presence_of_influential_individuals_while_avoiding_their_crush, set_intent(X, candid, Y, -1)).

rule_likelihood(people_avoid_dating_their_rivals_partners, 1).
rule_type(people_avoid_dating_their_rivals_partners, volition).
% People avoid dating their rivals’ partners.
rule_active(people_avoid_dating_their_rivals_partners).
rule_category(people_avoid_dating_their_rivals_partners, social_distance).
rule_source(people_avoid_dating_their_rivals_partners, ensemble).
rule_priority(people_avoid_dating_their_rivals_partners, 1).
rule_applies(people_avoid_dating_their_rivals_partners, X, Y) :-
    directed_status(X, Y, rivals).
rule_effect(people_avoid_dating_their_rivals_partners, set_intent(X, favor, Y, -2)).

rule_likelihood(people_avoid_those_they_are_afraid_of_and_may_favor_getting_closer_to_strong_individuals, 1).
rule_type(people_avoid_those_they_are_afraid_of_and_may_favor_getting_closer_to_strong_individuals, volition).
% People avoid those they are afraid of and may favor getting closer to strong individuals.
rule_active(people_avoid_those_they_are_afraid_of_and_may_favor_getting_closer_to_strong_individuals).
rule_category(people_avoid_those_they_are_afraid_of_and_may_favor_getting_closer_to_strong_individuals, social_distance).
rule_source(people_avoid_those_they_are_afraid_of_and_may_favor_getting_closer_to_strong_individuals, ensemble).
rule_priority(people_avoid_those_they_are_afraid_of_and_may_favor_getting_closer_to_strong_individuals, 1).
rule_applies(people_avoid_those_they_are_afraid_of_and_may_favor_getting_closer_to_strong_individuals, X, Y) :-
    directed_status(X, Y, afraid_of).
rule_effect(people_avoid_those_they_are_afraid_of_and_may_favor_getting_closer_to_strong_individuals, set_intent(X, favor, Y, 1)).

rule_likelihood(people_avoid_dating_their_rivals_partners_when_they_desire_to_improve_social_standing, 1).
rule_type(people_avoid_dating_their_rivals_partners_when_they_desire_to_improve_social_standing, volition).
% People avoid dating their rivals’ partners when they desire to improve social standing.
rule_active(people_avoid_dating_their_rivals_partners_when_they_desire_to_improve_social_standing).
rule_category(people_avoid_dating_their_rivals_partners_when_they_desire_to_improve_social_standing, social_distance).
rule_source(people_avoid_dating_their_rivals_partners_when_they_desire_to_improve_social_standing, ensemble).
rule_priority(people_avoid_dating_their_rivals_partners_when_they_desire_to_improve_social_standing, 1).
rule_applies(people_avoid_dating_their_rivals_partners_when_they_desire_to_improve_social_standing, X, Y) :-
    directed_status(X, Y, rivals).
rule_effect(people_avoid_dating_their_rivals_partners_when_they_desire_to_improve_social_standing, set_intent(X, honor, Y, -1)).

rule_likelihood(people_avoid_dating_their_rivals_partners, 1).
rule_type(people_avoid_dating_their_rivals_partners, volition).
% People avoid dating their rivals’ partners.
rule_active(people_avoid_dating_their_rivals_partners).
rule_category(people_avoid_dating_their_rivals_partners, social_distance).
rule_source(people_avoid_dating_their_rivals_partners, ensemble).
rule_priority(people_avoid_dating_their_rivals_partners, 3).
rule_applies(people_avoid_dating_their_rivals_partners, X, Y) :-
    directed_status(X, Y, rivals).
rule_effect(people_avoid_dating_their_rivals_partners, set_intent(X, kind, Y, -3)).

rule_likelihood(people_avoid_xenophobic_individuals_to_seek_companionship_with_others, 1).
rule_type(people_avoid_xenophobic_individuals_to_seek_companionship_with_others, volition).
% People avoid xenophobic individuals to seek companionship with others.
rule_active(people_avoid_xenophobic_individuals_to_seek_companionship_with_others).
rule_category(people_avoid_xenophobic_individuals_to_seek_companionship_with_others, social_distance).
rule_source(people_avoid_xenophobic_individuals_to_seek_companionship_with_others, ensemble).
rule_priority(people_avoid_xenophobic_individuals_to_seek_companionship_with_others, 1).
rule_applies(people_avoid_xenophobic_individuals_to_seek_companionship_with_others, X, Y) :-
    trait(X, xenophobic).
rule_effect(people_avoid_xenophobic_individuals_to_seek_companionship_with_others, set_intent(X, kind, Y, -1)).

rule_likelihood(people_avoid_romantic_advances_when_they_feel_embarrassed, 1).
rule_type(people_avoid_romantic_advances_when_they_feel_embarrassed, volition).
% People avoid romantic advances when they feel embarrassed.
rule_active(people_avoid_romantic_advances_when_they_feel_embarrassed).
rule_category(people_avoid_romantic_advances_when_they_feel_embarrassed, social_distance).
rule_source(people_avoid_romantic_advances_when_they_feel_embarrassed, ensemble).
rule_priority(people_avoid_romantic_advances_when_they_feel_embarrassed, 1).
rule_applies(people_avoid_romantic_advances_when_they_feel_embarrassed, X, Y) :-
    status(X, embarrassed).
rule_effect(people_avoid_romantic_advances_when_they_feel_embarrassed, set_intent(X, romance, Y, -1)).

rule_likelihood(people_avoid_dating_their_rivals_partners, 1).
rule_type(people_avoid_dating_their_rivals_partners, volition).
% People avoid dating their rivals’ partners.
rule_active(people_avoid_dating_their_rivals_partners).
rule_category(people_avoid_dating_their_rivals_partners, social_distance).
rule_source(people_avoid_dating_their_rivals_partners, ensemble).
rule_priority(people_avoid_dating_their_rivals_partners, 3).
rule_applies(people_avoid_dating_their_rivals_partners, X, Y) :-
    directed_status(X, Y, rivals).
rule_effect(people_avoid_dating_their_rivals_partners, set_intent(X, trust, Y, -3)).

%% ═══════════════════════════════════════════════════════════
%% Category: trust-credibility
%% ═══════════════════════════════════════════════════════════

%% Ensemble Volition Rules: trust-credibility
%% Source: data/ensemble/volitionRules/trust-credibility.json
%% Converted: 2026-04-02T20:09:49.734Z
%% Total rules: 34

rule_likelihood(an_elegantly_dressed_man_inspires_credibility_and_attention, 1).
rule_type(an_elegantly_dressed_man_inspires_credibility_and_attention, volition).
% An elegantly dressed man inspires credibility and attention
rule_active(an_elegantly_dressed_man_inspires_credibility_and_attention).
rule_category(an_elegantly_dressed_man_inspires_credibility_and_attention, trust_credibility).
rule_source(an_elegantly_dressed_man_inspires_credibility_and_attention, ensemble).
rule_priority(an_elegantly_dressed_man_inspires_credibility_and_attention, 5).
rule_applies(an_elegantly_dressed_man_inspires_credibility_and_attention, X, Y) :-
    trait(X, elegantly_dressed),
    trait(X, male).
rule_effect(an_elegantly_dressed_man_inspires_credibility_and_attention, modify_network(Y, X, credibility, '+', 5)).
rule_effect(an_elegantly_dressed_man_inspires_credibility_and_attention, modify_network(Y, X, curiosity, '+', 5)).

rule_likelihood(innocent_looking_women_inspire_trust, 1).
rule_type(innocent_looking_women_inspire_trust, volition).
% Innocent looking women inspire trust
rule_active(innocent_looking_women_inspire_trust).
rule_category(innocent_looking_women_inspire_trust, trust_credibility).
rule_source(innocent_looking_women_inspire_trust, ensemble).
rule_priority(innocent_looking_women_inspire_trust, 1).
rule_applies(innocent_looking_women_inspire_trust, X, Y) :-
    trait(X, female),
    trait(X, innocent_looking).
rule_effect(innocent_looking_women_inspire_trust, modify_network(Y, X, credibility, '+', 2)).

rule_likelihood(for_a_member_of_the_clergy_an_elegantly_dressed_academic_has_no_credibility, 1).
rule_type(for_a_member_of_the_clergy_an_elegantly_dressed_academic_has_no_credibility, volition).
% For a member of the clergy, an elegantly dressed academic has no credibility
rule_active(for_a_member_of_the_clergy_an_elegantly_dressed_academic_has_no_credibility).
rule_category(for_a_member_of_the_clergy_an_elegantly_dressed_academic_has_no_credibility, trust_credibility).
rule_source(for_a_member_of_the_clergy_an_elegantly_dressed_academic_has_no_credibility, ensemble).
rule_priority(for_a_member_of_the_clergy_an_elegantly_dressed_academic_has_no_credibility, 5).
rule_applies(for_a_member_of_the_clergy_an_elegantly_dressed_academic_has_no_credibility, X, Y) :-
    trait(X, clergy),
    trait(Y, elegantly_dressed),
    trait(Y, academic).
rule_effect(for_a_member_of_the_clergy_an_elegantly_dressed_academic_has_no_credibility, modify_network(X, Y, credibility, '+', 5)).

rule_likelihood(people_are_often_suspicious_of_flatterery, 1).
rule_type(people_are_often_suspicious_of_flatterery, volition).
% People are often suspicious of flatterery
rule_active(people_are_often_suspicious_of_flatterery).
rule_category(people_are_often_suspicious_of_flatterery, trust_credibility).
rule_source(people_are_often_suspicious_of_flatterery, ensemble).
rule_priority(people_are_often_suspicious_of_flatterery, 5).
rule_applies(people_are_often_suspicious_of_flatterery, X, Y) :-
    trait(X, kind),
    trait(Y, unctuous).
rule_effect(people_are_often_suspicious_of_flatterery, modify_network(X, Y, affinity, '+', 5)).

rule_likelihood(an_unattractive_honest_man_does_not_want_to_mingle, 1).
rule_type(an_unattractive_honest_man_does_not_want_to_mingle, volition).
% An unattractive, honest man does not want to mingle
rule_active(an_unattractive_honest_man_does_not_want_to_mingle).
rule_category(an_unattractive_honest_man_does_not_want_to_mingle, trust_credibility).
rule_source(an_unattractive_honest_man_does_not_want_to_mingle, ensemble).
rule_priority(an_unattractive_honest_man_does_not_want_to_mingle, 5).
rule_applies(an_unattractive_honest_man_does_not_want_to_mingle, X, Y) :-
    trait(X, male),
    trait(X, honest),
    attribute(X, charisma, Charisma_val), Charisma_val < 30,
    \+ trait(X, rich),
    trait(X, eccentric).
rule_effect(an_unattractive_honest_man_does_not_want_to_mingle, modify_network(X, Y, affinity, '-', 5)).
rule_effect(an_unattractive_honest_man_does_not_want_to_mingle, modify_network(X, Y, curiosity, '+', 5)).

rule_likelihood(attractive_and_trustworthy_people_lead_suspicious_people_to_have_increased_credibility_in_them, 1).
rule_type(attractive_and_trustworthy_people_lead_suspicious_people_to_have_increased_credibility_in_them, volition).
% Attractive and trustworthy people lead suspicious people to have increased credibility in them
rule_active(attractive_and_trustworthy_people_lead_suspicious_people_to_have_increased_credibility_in_them).
rule_category(attractive_and_trustworthy_people_lead_suspicious_people_to_have_increased_credibility_in_them, trust_credibility).
rule_source(attractive_and_trustworthy_people_lead_suspicious_people_to_have_increased_credibility_in_them, ensemble).
rule_priority(attractive_and_trustworthy_people_lead_suspicious_people_to_have_increased_credibility_in_them, 5).
rule_applies(attractive_and_trustworthy_people_lead_suspicious_people_to_have_increased_credibility_in_them, X, Y) :-
    directed_status(X, Y, suspicious_of),
    attribute(Y, charisma, Charisma_val), Charisma_val > 60,
    trait(Y, innocent_looking).
rule_effect(attractive_and_trustworthy_people_lead_suspicious_people_to_have_increased_credibility_in_them, modify_network(Y, X, credibility, '+', 5)).

rule_likelihood(generous_honest_rich_people_arise_less_suspicion_from_others, 1).
rule_type(generous_honest_rich_people_arise_less_suspicion_from_others, volition).
% Generous, honest, rich people arise less suspicion from others
rule_active(generous_honest_rich_people_arise_less_suspicion_from_others).
rule_category(generous_honest_rich_people_arise_less_suspicion_from_others, trust_credibility).
rule_source(generous_honest_rich_people_arise_less_suspicion_from_others, ensemble).
rule_priority(generous_honest_rich_people_arise_less_suspicion_from_others, 5).
rule_applies(generous_honest_rich_people_arise_less_suspicion_from_others, X, Y) :-
    trait(X, generous),
    trait(X, honest),
    trait(X, rich),
    trait(X, rich),
    directed_status(Y, X, suspicious_of),
    directed_status(X, 'z', cares_for),
    relationship(Y, 'z', friends).
rule_effect(generous_honest_rich_people_arise_less_suspicion_from_others, modify_network(Y, X, affinity, '+', 5)).
rule_effect(generous_honest_rich_people_arise_less_suspicion_from_others, set_relationship(X, Y, esteem, 5)).

rule_likelihood(happy_trusting_people_see_others_as_credible, 1).
rule_type(happy_trusting_people_see_others_as_credible, volition).
% Happy, trusting people see others as credible
rule_active(happy_trusting_people_see_others_as_credible).
rule_category(happy_trusting_people_see_others_as_credible, trust_credibility).
rule_source(happy_trusting_people_see_others_as_credible, ensemble).
rule_priority(happy_trusting_people_see_others_as_credible, 5).
rule_applies(happy_trusting_people_see_others_as_credible, X, Y) :-
    status(X, happy),
    directed_status(X, Y, trusts),
    trait(X, credulous),
    trait(Y, generous).
rule_effect(happy_trusting_people_see_others_as_credible, modify_network(X, Y, credibility, '+', 5)).
rule_effect(happy_trusting_people_see_others_as_credible, set_relationship(X, Y, ally, 5)).

rule_likelihood(honest_trustworthy_self_assured_rich_people_may_inspire_admiration, 1).
rule_type(honest_trustworthy_self_assured_rich_people_may_inspire_admiration, volition).
% Honest, trustworthy, self-assured rich people may inspire admiration
rule_active(honest_trustworthy_self_assured_rich_people_may_inspire_admiration).
rule_category(honest_trustworthy_self_assured_rich_people_may_inspire_admiration, trust_credibility).
rule_source(honest_trustworthy_self_assured_rich_people_may_inspire_admiration, ensemble).
rule_priority(honest_trustworthy_self_assured_rich_people_may_inspire_admiration, 3).
rule_applies(honest_trustworthy_self_assured_rich_people_may_inspire_admiration, X, Y) :-
    attribute(X, self_assuredness, Self_assuredness_val), Self_assuredness_val > 60,
    trait(X, rich),
    trait(X, honest),
    trait(X, trustworthy).
rule_effect(honest_trustworthy_self_assured_rich_people_may_inspire_admiration, modify_network(Y, X, affinity, '+', 3)).

rule_likelihood(those_who_are_resented_and_distrusted_may_want_to_improve_their_credibility, 1).
rule_type(those_who_are_resented_and_distrusted_may_want_to_improve_their_credibility, volition).
% Those who are resented and distrusted may want to improve their credibility
rule_active(those_who_are_resented_and_distrusted_may_want_to_improve_their_credibility).
rule_category(those_who_are_resented_and_distrusted_may_want_to_improve_their_credibility, trust_credibility).
rule_source(those_who_are_resented_and_distrusted_may_want_to_improve_their_credibility, ensemble).
rule_priority(those_who_are_resented_and_distrusted_may_want_to_improve_their_credibility, 5).
rule_applies(those_who_are_resented_and_distrusted_may_want_to_improve_their_credibility, X, Y) :-
    directed_status(Y, X, resentful_of),
    \+ directed_status(Y, X, trusts).
rule_effect(those_who_are_resented_and_distrusted_may_want_to_improve_their_credibility, modify_network(X, Y, credibility, '+', 5)).

rule_likelihood(rich_credulous_men_increase_affinity_for_devout_provincials, 1).
rule_type(rich_credulous_men_increase_affinity_for_devout_provincials, volition).
% Rich, credulous men increase affinity for devout provincials
rule_active(rich_credulous_men_increase_affinity_for_devout_provincials).
rule_category(rich_credulous_men_increase_affinity_for_devout_provincials, trust_credibility).
rule_source(rich_credulous_men_increase_affinity_for_devout_provincials, ensemble).
rule_priority(rich_credulous_men_increase_affinity_for_devout_provincials, 5).
rule_applies(rich_credulous_men_increase_affinity_for_devout_provincials, X, Y) :-
    trait(Y, credulous),
    trait(X, provincial),
    trait(Y, rich),
    trait(X, devout),
    trait(X, trustworthy).
rule_effect(rich_credulous_men_increase_affinity_for_devout_provincials, modify_network(Y, X, affinity, '+', 5)).

rule_likelihood(poor_people_may_desire_to_gain_the_trust_of_rich_people, 1).
rule_type(poor_people_may_desire_to_gain_the_trust_of_rich_people, volition).
% Poor people may desire to gain the trust of rich people
rule_active(poor_people_may_desire_to_gain_the_trust_of_rich_people).
rule_category(poor_people_may_desire_to_gain_the_trust_of_rich_people, trust_credibility).
rule_source(poor_people_may_desire_to_gain_the_trust_of_rich_people, ensemble).
rule_priority(poor_people_may_desire_to_gain_the_trust_of_rich_people, 5).
rule_applies(poor_people_may_desire_to_gain_the_trust_of_rich_people, X, Y) :-
    trait(X, poor),
    directed_status(X, Y, jealous_of),
    trait(Y, rich).
rule_effect(poor_people_may_desire_to_gain_the_trust_of_rich_people, modify_network(X, Y, credibility, '+', 5)).

rule_likelihood(devout_and_trustworthy_clergy_members_inspire_respect, 1).
rule_type(devout_and_trustworthy_clergy_members_inspire_respect, volition).
% Devout and trustworthy clergy members inspire respect
rule_active(devout_and_trustworthy_clergy_members_inspire_respect).
rule_category(devout_and_trustworthy_clergy_members_inspire_respect, trust_credibility).
rule_source(devout_and_trustworthy_clergy_members_inspire_respect, ensemble).
rule_priority(devout_and_trustworthy_clergy_members_inspire_respect, 5).
rule_applies(devout_and_trustworthy_clergy_members_inspire_respect, X, Y) :-
    trait(Y, devout),
    trait(Y, clergy),
    trait(Y, trustworthy).
rule_effect(devout_and_trustworthy_clergy_members_inspire_respect, modify_network(X, Y, affinity, '+', 5)).

rule_likelihood(someone_in_love_will_trust_their_loved_one_if_he_she_rejects_other_suitors, 1).
rule_type(someone_in_love_will_trust_their_loved_one_if_he_she_rejects_other_suitors, volition).
% Someone in love will trust their loved one if he/she rejects other suitors
rule_active(someone_in_love_will_trust_their_loved_one_if_he_she_rejects_other_suitors).
rule_category(someone_in_love_will_trust_their_loved_one_if_he_she_rejects_other_suitors, trust_credibility).
rule_source(someone_in_love_will_trust_their_loved_one_if_he_she_rejects_other_suitors, ensemble).
rule_priority(someone_in_love_will_trust_their_loved_one_if_he_she_rejects_other_suitors, 5).
rule_applies(someone_in_love_will_trust_their_loved_one_if_he_she_rejects_other_suitors, X, Y) :-
    network(X, Y, affinity, Affinity_val), Affinity_val > 80,
    directed_status(X, X, jealous_of),
    network(Y, X, curiosity, Curiosity_val), Curiosity_val < 33.
rule_effect(someone_in_love_will_trust_their_loved_one_if_he_she_rejects_other_suitors, set_relationship(X, Y, esteem, 5)).

rule_likelihood(workers_are_not_likely_to_increase_affinity_esteem_and_credibility_for_their_employers, 1).
rule_type(workers_are_not_likely_to_increase_affinity_esteem_and_credibility_for_their_employers, volition).
% Workers are not likely to increase affinity, esteem, and credibility for their employers
rule_active(workers_are_not_likely_to_increase_affinity_esteem_and_credibility_for_their_employers).
rule_category(workers_are_not_likely_to_increase_affinity_esteem_and_credibility_for_their_employers, trust_credibility).
rule_source(workers_are_not_likely_to_increase_affinity_esteem_and_credibility_for_their_employers, ensemble).
rule_priority(workers_are_not_likely_to_increase_affinity_esteem_and_credibility_for_their_employers, 1).
rule_applies(workers_are_not_likely_to_increase_affinity_esteem_and_credibility_for_their_employers, X, Y) :-
    trait(X, stagehand),
    directed_status(X, Y, financially_dependent_on),
    directed_status(X, Y, resentful_of).
rule_effect(workers_are_not_likely_to_increase_affinity_esteem_and_credibility_for_their_employers, modify_network(X, Y, affinity, '-', 1)).
rule_effect(workers_are_not_likely_to_increase_affinity_esteem_and_credibility_for_their_employers, set_relationship(X, Y, esteem, -2)).
rule_effect(workers_are_not_likely_to_increase_affinity_esteem_and_credibility_for_their_employers, modify_network(X, Y, credibility, '-', 1)).

rule_likelihood(people_are_more_likely_to_consider_strong_individuals_as_potential_partners_based_on_trust_levels, 1).
rule_type(people_are_more_likely_to_consider_strong_individuals_as_potential_partners_based_on_trust_levels, volition).
% People are more likely to consider strong individuals as potential partners based on trust levels.
rule_active(people_are_more_likely_to_consider_strong_individuals_as_potential_partners_based_on_trust_levels).
rule_category(people_are_more_likely_to_consider_strong_individuals_as_potential_partners_based_on_trust_levels, trust_credibility).
rule_source(people_are_more_likely_to_consider_strong_individuals_as_potential_partners_based_on_trust_levels, ensemble).
rule_priority(people_are_more_likely_to_consider_strong_individuals_as_potential_partners_based_on_trust_levels, 1).
rule_applies(people_are_more_likely_to_consider_strong_individuals_as_potential_partners_based_on_trust_levels, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val > 7.
rule_effect(people_are_more_likely_to_consider_strong_individuals_as_potential_partners_based_on_trust_levels, set_intent(X, candid, Y, 2)).

rule_likelihood(people_are_less_likely_to_date_those_they_don_t_trust_significantly_more_than_others, 1).
rule_type(people_are_less_likely_to_date_those_they_don_t_trust_significantly_more_than_others, volition).
% People are less likely to date those they don’t trust significantly more than others.
rule_active(people_are_less_likely_to_date_those_they_don_t_trust_significantly_more_than_others).
rule_category(people_are_less_likely_to_date_those_they_don_t_trust_significantly_more_than_others, trust_credibility).
rule_source(people_are_less_likely_to_date_those_they_don_t_trust_significantly_more_than_others, ensemble).
rule_priority(people_are_less_likely_to_date_those_they_don_t_trust_significantly_more_than_others, 1).
rule_applies(people_are_less_likely_to_date_those_they_don_t_trust_significantly_more_than_others, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val < 4.
rule_effect(people_are_less_likely_to_date_those_they_don_t_trust_significantly_more_than_others, set_intent(X, candid, Y, -2)).

rule_likelihood(people_are_inclined_to_form_connections_with_individuals_they_trust_more_than_others_in_their_social_network, 1).
rule_type(people_are_inclined_to_form_connections_with_individuals_they_trust_more_than_others_in_their_social_network, volition).
% People are inclined to form connections with individuals they trust more than others in their social network.
rule_active(people_are_inclined_to_form_connections_with_individuals_they_trust_more_than_others_in_their_social_network).
rule_category(people_are_inclined_to_form_connections_with_individuals_they_trust_more_than_others_in_their_social_network, trust_credibility).
rule_source(people_are_inclined_to_form_connections_with_individuals_they_trust_more_than_others_in_their_social_network, ensemble).
rule_priority(people_are_inclined_to_form_connections_with_individuals_they_trust_more_than_others_in_their_social_network, 1).
rule_applies(people_are_inclined_to_form_connections_with_individuals_they_trust_more_than_others_in_their_social_network, X, Y) :-
    network(X, 'z', trust, Trust_val), Trust_val < 4,
    network(Y, 'z', trust, Trust_val), Trust_val < 4.
rule_effect(people_are_inclined_to_form_connections_with_individuals_they_trust_more_than_others_in_their_social_network, set_intent(X, candid, Y, 1)).

rule_likelihood(people_have_a_strong_inclination_to_form_closer_bonds_with_individuals_they_trust_significantly, 1).
rule_type(people_have_a_strong_inclination_to_form_closer_bonds_with_individuals_they_trust_significantly, volition).
% People have a strong inclination to form closer bonds with individuals they trust significantly.
rule_active(people_have_a_strong_inclination_to_form_closer_bonds_with_individuals_they_trust_significantly).
rule_category(people_have_a_strong_inclination_to_form_closer_bonds_with_individuals_they_trust_significantly, trust_credibility).
rule_source(people_have_a_strong_inclination_to_form_closer_bonds_with_individuals_they_trust_significantly, ensemble).
rule_priority(people_have_a_strong_inclination_to_form_closer_bonds_with_individuals_they_trust_significantly, 1).
rule_applies(people_have_a_strong_inclination_to_form_closer_bonds_with_individuals_they_trust_significantly, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val > 6.
rule_effect(people_have_a_strong_inclination_to_form_closer_bonds_with_individuals_they_trust_significantly, set_intent(X, favor, Y, 2)).

rule_likelihood(people_desire_to_connect_with_individuals_they_trust_more_than_others, 1).
rule_type(people_desire_to_connect_with_individuals_they_trust_more_than_others, volition).
% People desire to connect with individuals they trust more than others.
rule_active(people_desire_to_connect_with_individuals_they_trust_more_than_others).
rule_category(people_desire_to_connect_with_individuals_they_trust_more_than_others, trust_credibility).
rule_source(people_desire_to_connect_with_individuals_they_trust_more_than_others, ensemble).
rule_priority(people_desire_to_connect_with_individuals_they_trust_more_than_others, 3).
rule_applies(people_desire_to_connect_with_individuals_they_trust_more_than_others, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val > 6.
rule_effect(people_desire_to_connect_with_individuals_they_trust_more_than_others, set_intent(X, kind, Y, 3)).

rule_likelihood(people_desire_to_associate_with_individuals_they_trust_more_than_others, 1).
rule_type(people_desire_to_associate_with_individuals_they_trust_more_than_others, volition).
% People desire to associate with individuals they trust more than others.
rule_active(people_desire_to_associate_with_individuals_they_trust_more_than_others).
rule_category(people_desire_to_associate_with_individuals_they_trust_more_than_others, trust_credibility).
rule_source(people_desire_to_associate_with_individuals_they_trust_more_than_others, ensemble).
rule_priority(people_desire_to_associate_with_individuals_they_trust_more_than_others, 3).
rule_applies(people_desire_to_associate_with_individuals_they_trust_more_than_others, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val < 4.
rule_effect(people_desire_to_associate_with_individuals_they_trust_more_than_others, set_intent(X, kind, Y, -3)).

rule_likelihood(people_seek_to_increase_trust_with_stronger_individuals_but_may_inadvertently_decrease_their_own_intentional, 1).
rule_type(people_seek_to_increase_trust_with_stronger_individuals_but_may_inadvertently_decrease_their_own_intentional, volition).
% People seek to increase trust with stronger individuals but may inadvertently decrease their own intentional
rule_active(people_seek_to_increase_trust_with_stronger_individuals_but_may_inadvertently_decrease_their_own_intentional).
rule_category(people_seek_to_increase_trust_with_stronger_individuals_but_may_inadvertently_decrease_their_own_intentional, trust_credibility).
rule_source(people_seek_to_increase_trust_with_stronger_individuals_but_may_inadvertently_decrease_their_own_intentional, ensemble).
rule_priority(people_seek_to_increase_trust_with_stronger_individuals_but_may_inadvertently_decrease_their_own_intentional, 1).
rule_applies(people_seek_to_increase_trust_with_stronger_individuals_but_may_inadvertently_decrease_their_own_intentional, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val > 6.
rule_effect(people_seek_to_increase_trust_with_stronger_individuals_but_may_inadvertently_decrease_their_own_intentional, set_intent(X, manipulate, Y, -1)).

rule_likelihood(people_desire_to_trust_stronger_individuals_in_their_network_when_the_number_of_strong_connections_exceeds_six, 1).
rule_type(people_desire_to_trust_stronger_individuals_in_their_network_when_the_number_of_strong_connections_exceeds_six, volition).
% People desire to trust stronger individuals in their network when the number of strong connections exceeds six.
rule_active(people_desire_to_trust_stronger_individuals_in_their_network_when_the_number_of_strong_connections_exceeds_six).
rule_category(people_desire_to_trust_stronger_individuals_in_their_network_when_the_number_of_strong_connections_exceeds_six, trust_credibility).
rule_source(people_desire_to_trust_stronger_individuals_in_their_network_when_the_number_of_strong_connections_exceeds_six, ensemble).
rule_priority(people_desire_to_trust_stronger_individuals_in_their_network_when_the_number_of_strong_connections_exceeds_six, 1).
rule_applies(people_desire_to_trust_stronger_individuals_in_their_network_when_the_number_of_strong_connections_exceeds_six, X, Y) :-
    network(X, Y, familial, Familial_val), Familial_val > 6.
rule_effect(people_desire_to_trust_stronger_individuals_in_their_network_when_the_number_of_strong_connections_exceeds_six, set_intent(X, trust, Y, 2)).

rule_likelihood(people_seek_to_increase_trust_with_individuals_they_perceive_as_strong, 1).
rule_type(people_seek_to_increase_trust_with_individuals_they_perceive_as_strong, volition).
% People seek to increase trust with individuals they perceive as strong.
rule_active(people_seek_to_increase_trust_with_individuals_they_perceive_as_strong).
rule_category(people_seek_to_increase_trust_with_individuals_they_perceive_as_strong, trust_credibility).
rule_source(people_seek_to_increase_trust_with_individuals_they_perceive_as_strong, ensemble).
rule_priority(people_seek_to_increase_trust_with_individuals_they_perceive_as_strong, 5).
rule_applies(people_seek_to_increase_trust_with_individuals_they_perceive_as_strong, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val > 6.
rule_effect(people_seek_to_increase_trust_with_individuals_they_perceive_as_strong, set_intent(X, trust, Y, 5)).

rule_likelihood(people_desire_to_trust_and_form_closer_relationships_with_individuals_they_respect_significantly, 1).
rule_type(people_desire_to_trust_and_form_closer_relationships_with_individuals_they_respect_significantly, volition).
% People desire to trust and form closer relationships with individuals they respect significantly.
rule_active(people_desire_to_trust_and_form_closer_relationships_with_individuals_they_respect_significantly).
rule_category(people_desire_to_trust_and_form_closer_relationships_with_individuals_they_respect_significantly, trust_credibility).
rule_source(people_desire_to_trust_and_form_closer_relationships_with_individuals_they_respect_significantly, ensemble).
rule_priority(people_desire_to_trust_and_form_closer_relationships_with_individuals_they_respect_significantly, 1).
rule_applies(people_desire_to_trust_and_form_closer_relationships_with_individuals_they_respect_significantly, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val > 6.
rule_effect(people_desire_to_trust_and_form_closer_relationships_with_individuals_they_respect_significantly, set_intent(X, trust, Y, 2)).

rule_likelihood(people_seek_to_increase_trust_with_weaker_individuals_but_decrease_it_when_interacting_with_stronger_ones, 1).
rule_type(people_seek_to_increase_trust_with_weaker_individuals_but_decrease_it_when_interacting_with_stronger_ones, volition).
% People seek to increase trust with weaker individuals but decrease it when interacting with stronger ones.
rule_active(people_seek_to_increase_trust_with_weaker_individuals_but_decrease_it_when_interacting_with_stronger_ones).
rule_category(people_seek_to_increase_trust_with_weaker_individuals_but_decrease_it_when_interacting_with_stronger_ones, trust_credibility).
rule_source(people_seek_to_increase_trust_with_weaker_individuals_but_decrease_it_when_interacting_with_stronger_ones, ensemble).
rule_priority(people_seek_to_increase_trust_with_weaker_individuals_but_decrease_it_when_interacting_with_stronger_ones, 5).
rule_applies(people_seek_to_increase_trust_with_weaker_individuals_but_decrease_it_when_interacting_with_stronger_ones, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val < 4.
rule_effect(people_seek_to_increase_trust_with_weaker_individuals_but_decrease_it_when_interacting_with_stronger_ones, set_intent(X, trust, Y, -5)).

rule_likelihood(people_seek_trust_with_those_who_are_highly_respected_in_their_network, 1).
rule_type(people_seek_trust_with_those_who_are_highly_respected_in_their_network, volition).
% People seek trust with those who are highly respected in their network.
rule_active(people_seek_trust_with_those_who_are_highly_respected_in_their_network).
rule_category(people_seek_trust_with_those_who_are_highly_respected_in_their_network, trust_credibility).
rule_source(people_seek_trust_with_those_who_are_highly_respected_in_their_network, ensemble).
rule_priority(people_seek_trust_with_those_who_are_highly_respected_in_their_network, 1).
rule_applies(people_seek_trust_with_those_who_are_highly_respected_in_their_network, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val < 4.
rule_effect(people_seek_trust_with_those_who_are_highly_respected_in_their_network, set_intent(X, trust, Y, -2)).

rule_likelihood(people_with_xenophobic_traits_may_struggle_to_build_trust_in_others, 1).
rule_type(people_with_xenophobic_traits_may_struggle_to_build_trust_in_others, volition).
% People with xenophobic traits may struggle to build trust in others.
rule_active(people_with_xenophobic_traits_may_struggle_to_build_trust_in_others).
rule_category(people_with_xenophobic_traits_may_struggle_to_build_trust_in_others, trust_credibility).
rule_source(people_with_xenophobic_traits_may_struggle_to_build_trust_in_others, ensemble).
rule_priority(people_with_xenophobic_traits_may_struggle_to_build_trust_in_others, 3).
rule_applies(people_with_xenophobic_traits_may_struggle_to_build_trust_in_others, X, Y) :-
    trait(X, xenophobic).
rule_effect(people_with_xenophobic_traits_may_struggle_to_build_trust_in_others, set_intent(X, trust, Y, -3)).

rule_likelihood(people_develop_trust_towards_strong_individuals_over_time, 1).
rule_type(people_develop_trust_towards_strong_individuals_over_time, volition).
% People develop trust towards strong individuals over time.
rule_active(people_develop_trust_towards_strong_individuals_over_time).
rule_category(people_develop_trust_towards_strong_individuals_over_time, trust_credibility).
rule_source(people_develop_trust_towards_strong_individuals_over_time, ensemble).
rule_priority(people_develop_trust_towards_strong_individuals_over_time, 1).
rule_applies(people_develop_trust_towards_strong_individuals_over_time, X, Y) :-
    event(X, nice).
rule_effect(people_develop_trust_towards_strong_individuals_over_time, set_intent(X, trust, Y, 2)).

rule_likelihood(people_develop_trust_towards_strong_individuals_over_time_when_they_have_had_positive_interactions, 1).
rule_type(people_develop_trust_towards_strong_individuals_over_time_when_they_have_had_positive_interactions, volition).
% People develop trust towards strong individuals over time when they have had positive interactions.
rule_active(people_develop_trust_towards_strong_individuals_over_time_when_they_have_had_positive_interactions).
rule_category(people_develop_trust_towards_strong_individuals_over_time_when_they_have_had_positive_interactions, trust_credibility).
rule_source(people_develop_trust_towards_strong_individuals_over_time_when_they_have_had_positive_interactions, ensemble).
rule_priority(people_develop_trust_towards_strong_individuals_over_time_when_they_have_had_positive_interactions, 1).
rule_applies(people_develop_trust_towards_strong_individuals_over_time_when_they_have_had_positive_interactions, X, Y) :-
    event(X, nice).
rule_effect(people_develop_trust_towards_strong_individuals_over_time_when_they_have_had_positive_interactions, set_intent(X, trust, Y, 1)).

rule_likelihood(people_seek_to_increase_trust_with_strong_individuals_within_a_recent_timeframe, 1).
rule_type(people_seek_to_increase_trust_with_strong_individuals_within_a_recent_timeframe, volition).
% People seek to increase trust with strong individuals within a recent timeframe.
rule_active(people_seek_to_increase_trust_with_strong_individuals_within_a_recent_timeframe).
rule_category(people_seek_to_increase_trust_with_strong_individuals_within_a_recent_timeframe, trust_credibility).
rule_source(people_seek_to_increase_trust_with_strong_individuals_within_a_recent_timeframe, ensemble).
rule_priority(people_seek_to_increase_trust_with_strong_individuals_within_a_recent_timeframe, 1).
rule_applies(people_seek_to_increase_trust_with_strong_individuals_within_a_recent_timeframe, X, Y) :-
    event(X, mean).
rule_effect(people_seek_to_increase_trust_with_strong_individuals_within_a_recent_timeframe, set_intent(X, trust, Y, -2)).

rule_likelihood(people_develop_trust_towards_strong_individuals_when_they_have_been_consistently_attracted_to_them_for_at_least, 1).
rule_type(people_develop_trust_towards_strong_individuals_when_they_have_been_consistently_attracted_to_them_for_at_least, volition).
% People develop trust towards strong individuals when they have been consistently attracted to them for at least
rule_active(people_develop_trust_towards_strong_individuals_when_they_have_been_consistently_attracted_to_them_for_at_least).
rule_category(people_develop_trust_towards_strong_individuals_when_they_have_been_consistently_attracted_to_them_for_at_least, trust_credibility).
rule_source(people_develop_trust_towards_strong_individuals_when_they_have_been_consistently_attracted_to_them_for_at_least, ensemble).
rule_priority(people_develop_trust_towards_strong_individuals_when_they_have_been_consistently_attracted_to_them_for_at_least, 3).
rule_applies(people_develop_trust_towards_strong_individuals_when_they_have_been_consistently_attracted_to_them_for_at_least, X, Y) :-
    network(X, 'z', romance, Romance_val), Romance_val > 6,
    event(Y, mean).
rule_effect(people_develop_trust_towards_strong_individuals_when_they_have_been_consistently_attracted_to_them_for_at_least, set_intent(X, trust, Y, -3)).

rule_likelihood(people_seek_to_increase_trust_with_those_they_are_already_somewhat_close_to_within_the_last_9, 1).
rule_type(people_seek_to_increase_trust_with_those_they_are_already_somewhat_close_to_within_the_last_9, volition).
% People seek to increase trust with those they are already somewhat close to within the last 9-
rule_active(people_seek_to_increase_trust_with_those_they_are_already_somewhat_close_to_within_the_last_9).
rule_category(people_seek_to_increase_trust_with_those_they_are_already_somewhat_close_to_within_the_last_9, trust_credibility).
rule_source(people_seek_to_increase_trust_with_those_they_are_already_somewhat_close_to_within_the_last_9, ensemble).
rule_priority(people_seek_to_increase_trust_with_those_they_are_already_somewhat_close_to_within_the_last_9, 1).
rule_applies(people_seek_to_increase_trust_with_those_they_are_already_somewhat_close_to_within_the_last_9, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, mean).
rule_effect(people_seek_to_increase_trust_with_those_they_are_already_somewhat_close_to_within_the_last_9, set_intent(X, trust, Y, -2)).

rule_likelihood(you_are_more_likely_to_shut_down_someone_you_don_t_trust, 1).
rule_type(you_are_more_likely_to_shut_down_someone_you_don_t_trust, volition).
% You are more likely to shut down someone you don’t trust
rule_active(you_are_more_likely_to_shut_down_someone_you_don_t_trust).
rule_category(you_are_more_likely_to_shut_down_someone_you_don_t_trust, trust_credibility).
rule_source(you_are_more_likely_to_shut_down_someone_you_don_t_trust, ensemble).
rule_priority(you_are_more_likely_to_shut_down_someone_you_don_t_trust, 1).
rule_applies(you_are_more_likely_to_shut_down_someone_you_don_t_trust, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val < 3.
rule_effect(you_are_more_likely_to_shut_down_someone_you_don_t_trust, set_intent(X, shutdown, Y, 2)).

%% ═══════════════════════════════════════════════════════════
%% Category: virtue-morality
%% ═══════════════════════════════════════════════════════════

%% Ensemble Volition Rules: virtue-morality
%% Source: data/ensemble/volitionRules/virtue-morality.json
%% Converted: 2026-04-02T20:09:49.734Z
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

%% ═══════════════════════════════════════════════════════════
%% Category: wealth-class
%% ═══════════════════════════════════════════════════════════

%% Ensemble Volition Rules: wealth-class
%% Source: data/ensemble/volitionRules/wealth-class.json
%% Converted: 2026-04-02T20:09:49.734Z
%% Total rules: 6

rule_likelihood(a_rich_man_doesn_t_want_to_be_liked_for_his_money, 1).
rule_type(a_rich_man_doesn_t_want_to_be_liked_for_his_money, volition).
% A rich man doesn’t want to be liked for his money
rule_active(a_rich_man_doesn_t_want_to_be_liked_for_his_money).
rule_category(a_rich_man_doesn_t_want_to_be_liked_for_his_money, wealth_class).
rule_source(a_rich_man_doesn_t_want_to_be_liked_for_his_money, ensemble).
rule_priority(a_rich_man_doesn_t_want_to_be_liked_for_his_money, 5).
rule_applies(a_rich_man_doesn_t_want_to_be_liked_for_his_money, X, Y) :-
    directed_status(X, Y, suspicious_of),
    trait(Y, ambitious),
    trait(Y, greedy),
    trait(X, rich),
    trait(X, male),
    trait(Y, female),
    attribute(X, charisma, Charisma_val), Charisma_val > 50.
rule_effect(a_rich_man_doesn_t_want_to_be_liked_for_his_money, modify_network(X, Y, curiosity, '+', 5)).

rule_likelihood(a_vain_young_woman_can_be_attracted_to_a_rich_man, 1).
rule_type(a_vain_young_woman_can_be_attracted_to_a_rich_man, volition).
% A vain young woman can be attracted to a rich man
rule_active(a_vain_young_woman_can_be_attracted_to_a_rich_man).
rule_category(a_vain_young_woman_can_be_attracted_to_a_rich_man, wealth_class).
rule_source(a_vain_young_woman_can_be_attracted_to_a_rich_man, ensemble).
rule_priority(a_vain_young_woman_can_be_attracted_to_a_rich_man, 8).
rule_applies(a_vain_young_woman_can_be_attracted_to_a_rich_man, X, Y) :-
    attribute(X, social_standing, Social_standing_val), Social_standing_val > 50,
    trait(X, male),
    trait(X, rich),
    attribute(Y, social_standing, Social_standing_val), Social_standing_val < 50,
    trait(Y, female),
    trait(Y, vain).
rule_effect(a_vain_young_woman_can_be_attracted_to_a_rich_man, modify_network(Y, X, affinity, '+', 10)).

rule_likelihood(workers_may_take_advantage_of_gullible_rich_people, 1).
rule_type(workers_may_take_advantage_of_gullible_rich_people, volition).
% Workers may take advantage of gullible rich people
rule_active(workers_may_take_advantage_of_gullible_rich_people).
rule_category(workers_may_take_advantage_of_gullible_rich_people, wealth_class).
rule_source(workers_may_take_advantage_of_gullible_rich_people, ensemble).
rule_priority(workers_may_take_advantage_of_gullible_rich_people, 5).
rule_applies(workers_may_take_advantage_of_gullible_rich_people, X, Y) :-
    trait(X, stagehand),
    trait(Y, rich),
    trait(Y, credulous),
    trait(Y, rich),
    trait(X, greedy).
rule_effect(workers_may_take_advantage_of_gullible_rich_people, modify_network(X, Y, affinity, '+', 5)).

rule_likelihood(poor_people_with_low_cultural_knowledge_may_attract_derision, 1).
rule_type(poor_people_with_low_cultural_knowledge_may_attract_derision, volition).
% Poor people with low cultural knowledge may attract derision
rule_active(poor_people_with_low_cultural_knowledge_may_attract_derision).
rule_category(poor_people_with_low_cultural_knowledge_may_attract_derision, wealth_class).
rule_source(poor_people_with_low_cultural_knowledge_may_attract_derision, ensemble).
rule_priority(poor_people_with_low_cultural_knowledge_may_attract_derision, 3).
rule_applies(poor_people_with_low_cultural_knowledge_may_attract_derision, X, Y) :-
    attribute(X, cultural_knowledge, Cultural_knowledge_val), Cultural_knowledge_val < 50,
    \+ trait(X, rich),
    attribute(Y, cultural_knowledge, Cultural_knowledge_val), Cultural_knowledge_val > 60.
rule_effect(poor_people_with_low_cultural_knowledge_may_attract_derision, modify_network(Y, X, affinity, '-', 3)).
rule_effect(poor_people_with_low_cultural_knowledge_may_attract_derision, modify_network(Y, X, emulation, '+', 3)).

rule_likelihood(greedy_people_like_their_partners_less_when_they_are_poor, 1).
rule_type(greedy_people_like_their_partners_less_when_they_are_poor, volition).
% Greedy people like their partners less when they are poor
rule_active(greedy_people_like_their_partners_less_when_they_are_poor).
rule_category(greedy_people_like_their_partners_less_when_they_are_poor, wealth_class).
rule_source(greedy_people_like_their_partners_less_when_they_are_poor, ensemble).
rule_priority(greedy_people_like_their_partners_less_when_they_are_poor, 5).
rule_applies(greedy_people_like_their_partners_less_when_they_are_poor, X, Y) :-
    trait(X, greedy),
    \+ trait(Y, rich),
    directed_status(X, Y, financially_dependent_on),
    relationship(X, Y, lovers).
rule_effect(greedy_people_like_their_partners_less_when_they_are_poor, modify_network(X, Y, affinity, '+', 5)).

rule_likelihood(good_conversationalists_have_no_use_for_poor_conversationalists, 1).
rule_type(good_conversationalists_have_no_use_for_poor_conversationalists, volition).
% Good conversationalists have no use for poor conversationalists
rule_active(good_conversationalists_have_no_use_for_poor_conversationalists).
rule_category(good_conversationalists_have_no_use_for_poor_conversationalists, wealth_class).
rule_source(good_conversationalists_have_no_use_for_poor_conversationalists, ensemble).
rule_priority(good_conversationalists_have_no_use_for_poor_conversationalists, 5).
rule_applies(good_conversationalists_have_no_use_for_poor_conversationalists, X, Y) :-
    attribute(X, sophistication, Sophistication_val), Sophistication_val < 50,
    attribute(X, propriety, Propriety_val), Propriety_val < 50,
    attribute(Y, sophistication, Sophistication_val), Sophistication_val > 65.
rule_effect(good_conversationalists_have_no_use_for_poor_conversationalists, modify_network(Y, X, curiosity, '+', 5)).
rule_effect(good_conversationalists_have_no_use_for_poor_conversationalists, set_relationship(Y, X, esteem, 5)).
rule_effect(good_conversationalists_have_no_use_for_poor_conversationalists, modify_network(X, Y, curiosity, '+', 2)).





