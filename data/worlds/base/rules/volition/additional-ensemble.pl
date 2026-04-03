%% Additional Ensemble Volition Rules
%% Extracted from world export (not in base rule set)
%% Total: 325 rules

%% ─── Antagonism Hostility (46 rules) ───


rule_likelihood(people_tend_to_antagonize_those_they_perceive_as_more_dominant_in_their_social_circle, 1).
rule_type(people_tend_to_antagonize_those_they_perceive_as_more_dominant_in_their_social_circle, volition).
% People tend to antagonize those they perceive as more dominant in their social circle.
rule_active(people_tend_to_antagonize_those_they_perceive_as_more_dominant_in_their_social_c).
rule_category(people_tend_to_antagonize_those_they_perceive_as_more_dominant_in_their_social_c, antagonism_hostility).
rule_source(people_tend_to_antagonize_those_they_perceive_as_more_dominant_in_their_social_c, ensemble).
rule_priority(people_tend_to_antagonize_those_they_perceive_as_more_dominant_in_their_social_c, 5).
rule_applies(people_tend_to_antagonize_those_they_perceive_as_more_dominant_in_their_social_c, X, Y) :-
    network(X, Y, antagonism, Antagonism_val), Antagonism_val > 6.
rule_effect(people_tend_to_antagonize_those_they_perceive_as_more_dominant_in_their_social_c, set_intent(X, antagonize, Y, 5)).


rule_likelihood(people_tend_to_antagonize_weaker_connections_when_they_have_strong_friendships_with_others, 1).
rule_type(people_tend_to_antagonize_weaker_connections_when_they_have_strong_friendships_with_others, volition).
% People tend to antagonize weaker connections when they have strong friendships with others.
rule_active(people_tend_to_antagonize_weaker_connections_when_they_have_strong_friendships_w).
rule_category(people_tend_to_antagonize_weaker_connections_when_they_have_strong_friendships_w, antagonism_hostility).
rule_source(people_tend_to_antagonize_weaker_connections_when_they_have_strong_friendships_w, ensemble).
rule_priority(people_tend_to_antagonize_weaker_connections_when_they_have_strong_friendships_w, 2).
rule_applies(people_tend_to_antagonize_weaker_connections_when_they_have_strong_friendships_w, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val < 4.
rule_effect(people_tend_to_antagonize_weaker_connections_when_they_have_strong_friendships_w, set_intent(X, antagonize, Y, 2)).


rule_likelihood(people_tend_to_antagonize_those_they_perceive_as_more_influential_or_dominant_within_their_social, 1).
rule_type(people_tend_to_antagonize_those_they_perceive_as_more_influential_or_dominant_within_their_social, volition).
% People tend to antagonize those they perceive as more influential or dominant within their social
rule_active(people_tend_to_antagonize_those_they_perceive_as_more_influential_or_dominant_wi).
rule_category(people_tend_to_antagonize_those_they_perceive_as_more_influential_or_dominant_wi, antagonism_hostility).
rule_source(people_tend_to_antagonize_those_they_perceive_as_more_influential_or_dominant_wi, ensemble).
rule_priority(people_tend_to_antagonize_those_they_perceive_as_more_influential_or_dominant_wi, 1).
rule_applies(people_tend_to_antagonize_those_they_perceive_as_more_influential_or_dominant_wi, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val < 4.
rule_effect(people_tend_to_antagonize_those_they_perceive_as_more_influential_or_dominant_wi, set_intent(X, antagonize, Y, 1)).


rule_likelihood(people_may_feel_antagonized_towards_those_they_perceive_as_less_respectful_than_others, 1).
rule_type(people_may_feel_antagonized_towards_those_they_perceive_as_less_respectful_than_others, volition).
% People may feel antagonized towards those they perceive as less respectful than others.
rule_active(people_may_feel_antagonized_towards_those_they_perceive_as_less_respectful_than).
rule_category(people_may_feel_antagonized_towards_those_they_perceive_as_less_respectful_than, antagonism_hostility).
rule_source(people_may_feel_antagonized_towards_those_they_perceive_as_less_respectful_than, ensemble).
rule_priority(people_may_feel_antagonized_towards_those_they_perceive_as_less_respectful_than, 2).
rule_applies(people_may_feel_antagonized_towards_those_they_perceive_as_less_respectful_than, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val < 4.
rule_effect(people_may_feel_antagonized_towards_those_they_perceive_as_less_respectful_than, set_intent(X, antagonize, Y, 2)).


rule_likelihood(people_may_develop_antagonistic_feelings_towards_strong_individuals_when_they_perceive_them_as_a_threat, 1).
rule_type(people_may_develop_antagonistic_feelings_towards_strong_individuals_when_they_perceive_them_as_a_threat, volition).
% People may develop antagonistic feelings towards strong individuals when they perceive them as a threat.
rule_active(people_may_develop_antagonistic_feelings_towards_strong_individuals_when_they_pe).
rule_category(people_may_develop_antagonistic_feelings_towards_strong_individuals_when_they_pe, antagonism_hostility).
rule_source(people_may_develop_antagonistic_feelings_towards_strong_individuals_when_they_pe, ensemble).
rule_priority(people_may_develop_antagonistic_feelings_towards_strong_individuals_when_they_pe, 2).
rule_applies(people_may_develop_antagonistic_feelings_towards_strong_individuals_when_they_pe, X, _) :-
    status(X, successful).
rule_effect(people_may_develop_antagonistic_feelings_towards_strong_individuals_when_they_pe, set_intent(X, antagonize, Y, -2)).


rule_likelihood(people_seeking_solace_after_heartbreak_may_unintentionally_antagonize_their_crush, 1).
rule_type(people_seeking_solace_after_heartbreak_may_unintentionally_antagonize_their_crush, volition).
% People seeking solace after heartbreak may unintentionally antagonize their crush.
rule_active(people_seeking_solace_after_heartbreak_may_unintentionally_antagonize_their_crus).
rule_category(people_seeking_solace_after_heartbreak_may_unintentionally_antagonize_their_crus, antagonism_hostility).
rule_source(people_seeking_solace_after_heartbreak_may_unintentionally_antagonize_their_crus, ensemble).
rule_priority(people_seeking_solace_after_heartbreak_may_unintentionally_antagonize_their_crus, 1).
rule_applies(people_seeking_solace_after_heartbreak_may_unintentionally_antagonize_their_crus, X, _) :-
    status(X, heartbroken).
rule_effect(people_seeking_solace_after_heartbreak_may_unintentionally_antagonize_their_crus, set_intent(X, antagonize, Y, 1)).


rule_likelihood(people_with_lower_wisdom_seek_to_antagonize_those_they_perceive_as_more_knowledgeable, 1).
rule_type(people_with_lower_wisdom_seek_to_antagonize_those_they_perceive_as_more_knowledgeable, volition).
% People with lower wisdom seek to antagonize those they perceive as more knowledgeable.
rule_active(people_with_lower_wisdom_seek_to_antagonize_those_they_perceive_as_more_knowledg).
rule_category(people_with_lower_wisdom_seek_to_antagonize_those_they_perceive_as_more_knowledg, antagonism_hostility).
rule_source(people_with_lower_wisdom_seek_to_antagonize_those_they_perceive_as_more_knowledg, ensemble).
rule_priority(people_with_lower_wisdom_seek_to_antagonize_those_they_perceive_as_more_knowledg, 2).
rule_applies(people_with_lower_wisdom_seek_to_antagonize_those_they_perceive_as_more_knowledg, X, _) :-
    attribute(X, wisdom, Wisdom_val), Wisdom_val < 7.
rule_effect(people_with_lower_wisdom_seek_to_antagonize_those_they_perceive_as_more_knowledg, set_intent(X, antagonize, Y, 2)).


rule_likelihood(people_may_feel_antagonized_towards_less_wise_individuals_when_they_encounter_someone_with_greater_wisdom, 1).
rule_type(people_may_feel_antagonized_towards_less_wise_individuals_when_they_encounter_someone_with_greater_wisdom, volition).
% People may feel antagonized towards less wise individuals when they encounter someone with greater wisdom.
rule_active(people_may_feel_antagonized_towards_less_wise_individuals_when_they_encounter_so).
rule_category(people_may_feel_antagonized_towards_less_wise_individuals_when_they_encounter_so, antagonism_hostility).
rule_source(people_may_feel_antagonized_towards_less_wise_individuals_when_they_encounter_so, ensemble).
rule_priority(people_may_feel_antagonized_towards_less_wise_individuals_when_they_encounter_so, 2).
rule_applies(people_may_feel_antagonized_towards_less_wise_individuals_when_they_encounter_so, X, _) :-
    attribute(X, wisdom, Wisdom_val), Wisdom_val > 12.
rule_effect(people_may_feel_antagonized_towards_less_wise_individuals_when_they_encounter_so, set_intent(X, antagonize, Y, -2)).


rule_likelihood(people_may_antagonize_weaker_individuals_when_they_are_friendly_towards_stronger_ones, 1).
rule_type(people_may_antagonize_weaker_individuals_when_they_are_friendly_towards_stronger_ones, volition).
% People may antagonize weaker individuals when they are friendly towards stronger ones.
rule_active(people_may_antagonize_weaker_individuals_when_they_are_friendly_towards_stronger).
rule_category(people_may_antagonize_weaker_individuals_when_they_are_friendly_towards_stronger, antagonism_hostility).
rule_source(people_may_antagonize_weaker_individuals_when_they_are_friendly_towards_stronger, ensemble).
rule_priority(people_may_antagonize_weaker_individuals_when_they_are_friendly_towards_stronger, 1).
rule_applies(people_may_antagonize_weaker_individuals_when_they_are_friendly_towards_stronger, X, _) :-
    trait(X, friendly).
rule_effect(people_may_antagonize_weaker_individuals_when_they_are_friendly_towards_stronger, set_intent(X, antagonize, Y, -1)).


rule_likelihood(people_s_average_interest_in_strong_individuals_increases_to_antagonize_their_crush, 1).
rule_type(people_s_average_interest_in_strong_individuals_increases_to_antagonize_their_crush, volition).
% People’s average interest in strong individuals increases to antagonize their crush.
rule_active(people_s_average_interest_in_strong_individuals_increases_to_antagonize_their_cr).
rule_category(people_s_average_interest_in_strong_individuals_increases_to_antagonize_their_cr, antagonism_hostility).
rule_source(people_s_average_interest_in_strong_individuals_increases_to_antagonize_their_cr, ensemble).
rule_priority(people_s_average_interest_in_strong_individuals_increases_to_antagonize_their_cr, 3).
rule_applies(people_s_average_interest_in_strong_individuals_increases_to_antagonize_their_cr, X, Y) :-
    event(X, Y, mean, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_s_average_interest_in_strong_individuals_increases_to_antagonize_their_cr, set_intent(X, antagonize, Y, 3)).


rule_likelihood(people_may_develop_antagonism_towards_their_public_friends_when_both_are_considered_strong_by_others, 1).
rule_type(people_may_develop_antagonism_towards_their_public_friends_when_both_are_considered_strong_by_others, volition).
% People may develop antagonism towards their public friends when both are considered strong by others.
rule_active(people_may_develop_antagonism_towards_their_public_friends_when_both_are_conside).
rule_category(people_may_develop_antagonism_towards_their_public_friends_when_both_are_conside, antagonism_hostility).
rule_source(people_may_develop_antagonism_towards_their_public_friends_when_both_are_conside, ensemble).
rule_priority(people_may_develop_antagonism_towards_their_public_friends_when_both_are_conside, 1).
rule_applies(people_may_develop_antagonism_towards_their_public_friends_when_both_are_conside, X, Z) :-
    directed_status(X, Z, public_friends),
    directed_status(Y, Z, public_friends).
rule_effect(people_may_develop_antagonism_towards_their_public_friends_when_both_are_conside, set_intent(X, antagonize, Y, -1)).


rule_likelihood(people_in_feuding_status_with_both_individual_a_and_b_are_likely_to_antagonize_each, 1).
rule_type(people_in_feuding_status_with_both_individual_a_and_b_are_likely_to_antagonize_each, volition).
% People in feuding status with both individual A and B are likely to antagonize each
rule_active(people_in_feuding_status_with_both_individual_a_and_b_are_likely_to_antagonize_e).
rule_category(people_in_feuding_status_with_both_individual_a_and_b_are_likely_to_antagonize_e, antagonism_hostility).
rule_source(people_in_feuding_status_with_both_individual_a_and_b_are_likely_to_antagonize_e, ensemble).
rule_priority(people_in_feuding_status_with_both_individual_a_and_b_are_likely_to_antagonize_e, 2).
rule_applies(people_in_feuding_status_with_both_individual_a_and_b_are_likely_to_antagonize_e, X, Z) :-
    directed_status(X, Z, feuding),
    directed_status(Y, Z, feuding).
rule_effect(people_in_feuding_status_with_both_individual_a_and_b_are_likely_to_antagonize_e, set_intent(X, antagonize, Y, -2)).


rule_likelihood(people_harboring_rivalry_towards_both_individuals_x_and_y_are_inclined_to_antagonize, 1).
rule_type(people_harboring_rivalry_towards_both_individuals_x_and_y_are_inclined_to_antagonize, volition).
% People harboring rivalry towards both individuals X and Y are inclined to antagonize
rule_active(people_harboring_rivalry_towards_both_individuals_x_and_y_are_inclined_to_antago).
rule_category(people_harboring_rivalry_towards_both_individuals_x_and_y_are_inclined_to_antago, antagonism_hostility).
rule_source(people_harboring_rivalry_towards_both_individuals_x_and_y_are_inclined_to_antago, ensemble).
rule_priority(people_harboring_rivalry_towards_both_individuals_x_and_y_are_inclined_to_antago, 1).
rule_applies(people_harboring_rivalry_towards_both_individuals_x_and_y_are_inclined_to_antago, X, Z) :-
    directed_status(X, Z, rivals),
    directed_status(Y, Z, rivals).
rule_effect(people_harboring_rivalry_towards_both_individuals_x_and_y_are_inclined_to_antago, set_intent(X, antagonize, Y, -1)).


rule_likelihood(people_may_feel_antagonized_towards_each_other_when_both_have_more_than_6_friends_in_common, 1).
rule_type(people_may_feel_antagonized_towards_each_other_when_both_have_more_than_6_friends_in_common, volition).
% People may feel antagonized towards each other when both have more than 6 friends in common
rule_active(people_may_feel_antagonized_towards_each_other_when_both_have_more_than_6_friend).
rule_category(people_may_feel_antagonized_towards_each_other_when_both_have_more_than_6_friend, antagonism_hostility).
rule_source(people_may_feel_antagonized_towards_each_other_when_both_have_more_than_6_friend, ensemble).
rule_priority(people_may_feel_antagonized_towards_each_other_when_both_have_more_than_6_friend, 2).
rule_applies(people_may_feel_antagonized_towards_each_other_when_both_have_more_than_6_friend, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    network(Y, Z, friendship, Friendship_val), Friendship_val > 6.
rule_effect(people_may_feel_antagonized_towards_each_other_when_both_have_more_than_6_friend, set_intent(X, antagonize, Y, -2)).


rule_likelihood(people_are_more_inclined_to_antagonize_their_crush_when_they_perceive_themselves_as_less, 1).
rule_type(people_are_more_inclined_to_antagonize_their_crush_when_they_perceive_themselves_as_less, volition).
% People are more inclined to antagonize their crush when they perceive themselves as less
rule_active(people_are_more_inclined_to_antagonize_their_crush_when_they_perceive_themselves).
rule_category(people_are_more_inclined_to_antagonize_their_crush_when_they_perceive_themselves, antagonism_hostility).
rule_source(people_are_more_inclined_to_antagonize_their_crush_when_they_perceive_themselves, ensemble).
rule_priority(people_are_more_inclined_to_antagonize_their_crush_when_they_perceive_themselves, 3).
rule_applies(people_are_more_inclined_to_antagonize_their_crush_when_they_perceive_themselves, X, Z) :-
    network(X, Z, romance, Romance_val), Romance_val > 6,
    network(Y, Z, romance, Romance_val), Romance_val > 6.
rule_effect(people_are_more_inclined_to_antagonize_their_crush_when_they_perceive_themselves, set_intent(X, antagonize, Y, 3)).


rule_likelihood(people_tend_to_antagonize_those_more_closely_connected_within_their_social_network_than_others, 1).
rule_type(people_tend_to_antagonize_those_more_closely_connected_within_their_social_network_than_others, volition).
% People tend to antagonize those more closely connected within their social network than others.
rule_active(people_tend_to_antagonize_those_more_closely_connected_within_their_social_netwo).
rule_category(people_tend_to_antagonize_those_more_closely_connected_within_their_social_netwo, antagonism_hostility).
rule_source(people_tend_to_antagonize_those_more_closely_connected_within_their_social_netwo, ensemble).
rule_priority(people_tend_to_antagonize_those_more_closely_connected_within_their_social_netwo, 1).
rule_applies(people_tend_to_antagonize_those_more_closely_connected_within_their_social_netwo, X, Z) :-
    network(X, Z, familial, Familial_val), Familial_val > 6,
    network(Y, Z, familial, Familial_val), Familial_val > 6.
rule_effect(people_tend_to_antagonize_those_more_closely_connected_within_their_social_netwo, set_intent(X, antagonize, Y, -1)).


rule_likelihood(people_are_more_likely_to_antagonize_weaker_friends_over_stronger_ones_when_both_have_a_similar, 1).
rule_type(people_are_more_likely_to_antagonize_weaker_friends_over_stronger_ones_when_both_have_a_similar, volition).
% People are more likely to antagonize weaker friends over stronger ones when both have a similar
rule_active(people_are_more_likely_to_antagonize_weaker_friends_over_stronger_ones_when_both).
rule_category(people_are_more_likely_to_antagonize_weaker_friends_over_stronger_ones_when_both, antagonism_hostility).
rule_source(people_are_more_likely_to_antagonize_weaker_friends_over_stronger_ones_when_both, ensemble).
rule_priority(people_are_more_likely_to_antagonize_weaker_friends_over_stronger_ones_when_both, 2).
rule_applies(people_are_more_likely_to_antagonize_weaker_friends_over_stronger_ones_when_both, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val < 4,
    network(Y, Z, friendship, Friendship_val), Friendship_val < 4.
rule_effect(people_are_more_likely_to_antagonize_weaker_friends_over_stronger_ones_when_both, set_intent(X, antagonize, Y, -2)).


rule_likelihood(people_tend_to_antagonize_those_they_are_less_trusting_of_when_both_parties_have_a_low, 1).
rule_type(people_tend_to_antagonize_those_they_are_less_trusting_of_when_both_parties_have_a_low, volition).
% People tend to antagonize those they are less trusting of when both parties have a low
rule_active(people_tend_to_antagonize_those_they_are_less_trusting_of_when_both_parties_have).
rule_category(people_tend_to_antagonize_those_they_are_less_trusting_of_when_both_parties_have, antagonism_hostility).
rule_source(people_tend_to_antagonize_those_they_are_less_trusting_of_when_both_parties_have, ensemble).
rule_priority(people_tend_to_antagonize_those_they_are_less_trusting_of_when_both_parties_have, 1).
rule_applies(people_tend_to_antagonize_those_they_are_less_trusting_of_when_both_parties_have, X, Z) :-
    network(X, Z, trust, Trust_val), Trust_val < 4,
    intent(Y, trust, Z, _).
rule_effect(people_tend_to_antagonize_those_they_are_less_trusting_of_when_both_parties_have, set_intent(X, antagonize, Y, -1)).


rule_likelihood(people_tend_to_antagonize_those_they_perceive_as_less_respectful_than_themselves_or_their_cr, 1).
rule_type(people_tend_to_antagonize_those_they_perceive_as_less_respectful_than_themselves_or_their_cr, volition).
% People tend to antagonize those they perceive as less respectful than themselves or their cr
rule_active(people_tend_to_antagonize_those_they_perceive_as_less_respectful_than_themselves).
rule_category(people_tend_to_antagonize_those_they_perceive_as_less_respectful_than_themselves, antagonism_hostility).
rule_source(people_tend_to_antagonize_those_they_perceive_as_less_respectful_than_themselves, ensemble).
rule_priority(people_tend_to_antagonize_those_they_perceive_as_less_respectful_than_themselves, 1).
rule_applies(people_tend_to_antagonize_those_they_perceive_as_less_respectful_than_themselves, X, Z) :-
    network(X, Z, respect, Respect_val), Respect_val < 4,
    intent(Y, antagonize, Z, _).
rule_effect(people_tend_to_antagonize_those_they_perceive_as_less_respectful_than_themselves, set_intent(X, antagonize, Y, -1)).


rule_likelihood(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_in_common_and, 1).
rule_type(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_in_common_and, volition).
% People tend to antagonize their crush when they have more than six friends in common and
rule_active(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_in_co).
rule_category(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_in_co, antagonism_hostility).
rule_source(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_in_co, ensemble).
rule_priority(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_in_co, 5).
rule_applies(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_in_co, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_in_co, set_intent(X, antagonize, Y, 5)).


rule_likelihood(people_may_develop_antagonism_towards_their_friends_who_have_recently_done_favors_for_them, 1).
rule_type(people_may_develop_antagonism_towards_their_friends_who_have_recently_done_favors_for_them, volition).
% People may develop antagonism towards their friends who have recently done favors for them.
rule_active(people_may_develop_antagonism_towards_their_friends_who_have_recently_done_favor).
rule_category(people_may_develop_antagonism_towards_their_friends_who_have_recently_done_favor, antagonism_hostility).
rule_source(people_may_develop_antagonism_towards_their_friends_who_have_recently_done_favor, ensemble).
rule_priority(people_may_develop_antagonism_towards_their_friends_who_have_recently_done_favor, 5).
rule_applies(people_may_develop_antagonism_towards_their_friends_who_have_recently_done_favor, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    event(Y, Z, did_a_favor_for, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_may_develop_antagonism_towards_their_friends_who_have_recently_done_favor, set_intent(X, antagonize, Y, -5)).


rule_likelihood(people_may_feel_antagonized_towards_their_crush_after_being_in_the_company_of_strong_individuals_for, 1).
rule_type(people_may_feel_antagonized_towards_their_crush_after_being_in_the_company_of_strong_individuals_for, volition).
% People may feel antagonized towards their crush after being in the company of strong individuals for
rule_active(people_may_feel_antagonized_towards_their_crush_after_being_in_the_company_of_st).
rule_category(people_may_feel_antagonized_towards_their_crush_after_being_in_the_company_of_st, antagonism_hostility).
rule_source(people_may_feel_antagonized_towards_their_crush_after_being_in_the_company_of_st, ensemble).
rule_priority(people_may_feel_antagonized_towards_their_crush_after_being_in_the_company_of_st, 1).
rule_applies(people_may_feel_antagonized_towards_their_crush_after_being_in_the_company_of_st, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    event(Y, Z, nice, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_may_feel_antagonized_towards_their_crush_after_being_in_the_company_of_st, set_intent(X, antagonize, Y, -1)).


rule_likelihood(people_may_feel_antagonized_towards_those_they_helped_recently_if_their_friendship_strength_is_above_a_certain, 1).
rule_type(people_may_feel_antagonized_towards_those_they_helped_recently_if_their_friendship_strength_is_above_a_certain, volition).
% People may feel antagonized towards those they helped recently if their friendship strength is above a certain
rule_active(people_may_feel_antagonized_towards_those_they_helped_recently_if_their_friendsh).
rule_category(people_may_feel_antagonized_towards_those_they_helped_recently_if_their_friendsh, antagonism_hostility).
rule_source(people_may_feel_antagonized_towards_those_they_helped_recently_if_their_friendsh, ensemble).
rule_priority(people_may_feel_antagonized_towards_those_they_helped_recently_if_their_friendsh, 3).
rule_applies(people_may_feel_antagonized_towards_those_they_helped_recently_if_their_friendsh, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    event(Y, Z, did_a_favor_for, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_may_feel_antagonized_towards_those_they_helped_recently_if_their_friendsh, set_intent(X, antagonize, Y, -3)).


rule_likelihood(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_within_a_year, 1).
rule_type(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_within_a_year, volition).
% People tend to antagonize their crush when they have more than six friends within a year
rule_active(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_withi).
rule_category(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_withi, antagonism_hostility).
rule_source(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_withi, ensemble).
rule_priority(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_withi, 1).
rule_applies(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_withi, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 31, TurnsAgo =< 9999.
rule_effect(people_tend_to_antagonize_their_crush_when_they_have_more_than_six_friends_withi, set_intent(X, antagonize, Y, 1)).


rule_likelihood(people_who_have_a_strong_desire_to_antagonize_their_crush_due_to_having_more_than, 1).
rule_type(people_who_have_a_strong_desire_to_antagonize_their_crush_due_to_having_more_than, volition).
% People who have a strong desire to antagonize their crush due to having more than 
rule_active(people_who_have_a_strong_desire_to_antagonize_their_crush_due_to_having_more_tha).
rule_category(people_who_have_a_strong_desire_to_antagonize_their_crush_due_to_having_more_tha, antagonism_hostility).
rule_source(people_who_have_a_strong_desire_to_antagonize_their_crush_due_to_having_more_tha, ensemble).
rule_priority(people_who_have_a_strong_desire_to_antagonize_their_crush_due_to_having_more_tha, 1).
rule_applies(people_who_have_a_strong_desire_to_antagonize_their_crush_due_to_having_more_tha, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    event(Y, Z, did_a_favor_for, TurnsAgo), TurnsAgo >= 31, TurnsAgo =< 9999.
rule_effect(people_who_have_a_strong_desire_to_antagonize_their_crush_due_to_having_more_tha, set_intent(X, antagonize, Y, -1)).


rule_likelihood(people_are_likely_to_antagonize_their_crush_after_doing_a_favor_for_them_within_the_past, 1).
rule_type(people_are_likely_to_antagonize_their_crush_after_doing_a_favor_for_them_within_the_past, volition).
% People are likely to antagonize their crush after doing a favor for them within the past
rule_active(people_are_likely_to_antagonize_their_crush_after_doing_a_favor_for_them_within).
rule_category(people_are_likely_to_antagonize_their_crush_after_doing_a_favor_for_them_within, antagonism_hostility).
rule_source(people_are_likely_to_antagonize_their_crush_after_doing_a_favor_for_them_within, ensemble).
rule_priority(people_are_likely_to_antagonize_their_crush_after_doing_a_favor_for_them_within, 5).
rule_applies(people_are_likely_to_antagonize_their_crush_after_doing_a_favor_for_them_within, X, Z) :-
    network(X, Z, familial, Familial_val), Familial_val > 6,
    event(Y, Z, did_a_favor_for, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_are_likely_to_antagonize_their_crush_after_doing_a_favor_for_them_within, set_intent(X, antagonize, Y, -5)).


rule_likelihood(people_may_develop_antagonistic_feelings_towards_their_crush_over_time_if_they_have_a_larger_than, 1).
rule_type(people_may_develop_antagonistic_feelings_towards_their_crush_over_time_if_they_have_a_larger_than, volition).
% People may develop antagonistic feelings towards their crush over time if they have a larger than
rule_active(people_may_develop_antagonistic_feelings_towards_their_crush_over_time_if_they_h).
rule_category(people_may_develop_antagonistic_feelings_towards_their_crush_over_time_if_they_h, antagonism_hostility).
rule_source(people_may_develop_antagonistic_feelings_towards_their_crush_over_time_if_they_h, ensemble).
rule_priority(people_may_develop_antagonistic_feelings_towards_their_crush_over_time_if_they_h, 1).
rule_applies(people_may_develop_antagonistic_feelings_towards_their_crush_over_time_if_they_h, X, Z) :-
    network(X, Z, familial, Familial_val), Familial_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 31, TurnsAgo =< 9999.
rule_effect(people_may_develop_antagonistic_feelings_towards_their_crush_over_time_if_they_h, set_intent(X, antagonize, Y, 1)).


rule_likelihood(people_may_develop_antagonism_towards_those_they_ve_favored_recently_if_their_familial_network, 1).
rule_type(people_may_develop_antagonism_towards_those_they_ve_favored_recently_if_their_familial_network, volition).
% People may develop antagonism towards those they’ve favored recently if their familial network
rule_active(people_may_develop_antagonism_towards_those_they_ve_favored_recently_if_their_fa).
rule_category(people_may_develop_antagonism_towards_those_they_ve_favored_recently_if_their_fa, antagonism_hostility).
rule_source(people_may_develop_antagonism_towards_those_they_ve_favored_recently_if_their_fa, ensemble).
rule_priority(people_may_develop_antagonism_towards_those_they_ve_favored_recently_if_their_fa, 1).
rule_applies(people_may_develop_antagonism_towards_those_they_ve_favored_recently_if_their_fa, X, Z) :-
    network(X, Z, familial, Familial_val), Familial_val > 6,
    event(Y, Z, did_a_favor_for, TurnsAgo), TurnsAgo >= 31, TurnsAgo =< 9999.
rule_effect(people_may_develop_antagonism_towards_those_they_ve_favored_recently_if_their_fa, set_intent(X, antagonize, Y, -1)).


rule_likelihood(people_with_high_antagonism_towards_strong_individuals_and_a_recent_interest_in_their_crush_are_likely, 1).
rule_type(people_with_high_antagonism_towards_strong_individuals_and_a_recent_interest_in_their_crush_are_likely, volition).
% People with high antagonism towards strong individuals and a recent interest in their crush are likely
rule_active(people_with_high_antagonism_towards_strong_individuals_and_a_recent_interest_in).
rule_category(people_with_high_antagonism_towards_strong_individuals_and_a_recent_interest_in, antagonism_hostility).
rule_source(people_with_high_antagonism_towards_strong_individuals_and_a_recent_interest_in, ensemble).
rule_priority(people_with_high_antagonism_towards_strong_individuals_and_a_recent_interest_in, 3).
rule_applies(people_with_high_antagonism_towards_strong_individuals_and_a_recent_interest_in, X, Z) :-
    network(X, Z, antagonism, Antagonism_val), Antagonism_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_with_high_antagonism_towards_strong_individuals_and_a_recent_interest_in, set_intent(X, antagonize, Y, -3)).


rule_likelihood(people_with_high_antagonism_towards_strong_individuals_and_who_have_recently_done_a_favor_for_someone_may, 1).
rule_type(people_with_high_antagonism_towards_strong_individuals_and_who_have_recently_done_a_favor_for_someone_may, volition).
% People with high antagonism towards strong individuals and who have recently done a favor for someone may
rule_active(people_with_high_antagonism_towards_strong_individuals_and_who_have_recently_don).
rule_category(people_with_high_antagonism_towards_strong_individuals_and_who_have_recently_don, antagonism_hostility).
rule_source(people_with_high_antagonism_towards_strong_individuals_and_who_have_recently_don, ensemble).
rule_priority(people_with_high_antagonism_towards_strong_individuals_and_who_have_recently_don, 3).
rule_applies(people_with_high_antagonism_towards_strong_individuals_and_who_have_recently_don, X, Z) :-
    network(X, Z, antagonism, Antagonism_val), Antagonism_val > 6,
    event(Y, Z, did_a_favor_for, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_with_high_antagonism_towards_strong_individuals_and_who_have_recently_don, set_intent(X, antagonize, Y, 3)).


rule_likelihood(people_tend_to_antagonize_weaker_individuals_when_they_are_significantly_more_attracted_to_someone_else, 1).
rule_type(people_tend_to_antagonize_weaker_individuals_when_they_are_significantly_more_attracted_to_someone_else, volition).
% People tend to antagonize weaker individuals when they are significantly more attracted to someone else
rule_active(people_tend_to_antagonize_weaker_individuals_when_they_are_significantly_more_at).
rule_category(people_tend_to_antagonize_weaker_individuals_when_they_are_significantly_more_at, antagonism_hostility).
rule_source(people_tend_to_antagonize_weaker_individuals_when_they_are_significantly_more_at, ensemble).
rule_priority(people_tend_to_antagonize_weaker_individuals_when_they_are_significantly_more_at, 2).
rule_applies(people_tend_to_antagonize_weaker_individuals_when_they_are_significantly_more_at, X, Z) :-
    network(X, Z, antagonism, Antagonism_val), Antagonism_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_tend_to_antagonize_weaker_individuals_when_they_are_significantly_more_at, set_intent(X, antagonize, Y, -2)).


rule_likelihood(people_who_have_a_high_antagonism_level_towards_someone_and_have_been_favored_by_that_person, 1).
rule_type(people_who_have_a_high_antagonism_level_towards_someone_and_have_been_favored_by_that_person, volition).
% People who have a high antagonism level towards someone and have been favored by that person
rule_active(people_who_have_a_high_antagonism_level_towards_someone_and_have_been_favored_by).
rule_category(people_who_have_a_high_antagonism_level_towards_someone_and_have_been_favored_by, antagonism_hostility).
rule_source(people_who_have_a_high_antagonism_level_towards_someone_and_have_been_favored_by, ensemble).
rule_priority(people_who_have_a_high_antagonism_level_towards_someone_and_have_been_favored_by, 1).
rule_applies(people_who_have_a_high_antagonism_level_towards_someone_and_have_been_favored_by, X, Z) :-
    network(X, Z, antagonism, Antagonism_val), Antagonism_val > 6,
    event(Y, Z, did_a_favor_for, TurnsAgo), TurnsAgo >= 31, TurnsAgo =< 9999.
rule_effect(people_who_have_a_high_antagonism_level_towards_someone_and_have_been_favored_by, set_intent(X, antagonize, Y, 1)).


rule_likelihood(people_seek_to_reduce_antagonism_towards_stronger_individuals_in_their_social_network, 1).
rule_type(people_seek_to_reduce_antagonism_towards_stronger_individuals_in_their_social_network, volition).
% People seek to reduce antagonism towards stronger individuals in their social network.
rule_active(people_seek_to_reduce_antagonism_towards_stronger_individuals_in_their_social_ne).
rule_category(people_seek_to_reduce_antagonism_towards_stronger_individuals_in_their_social_ne, antagonism_hostility).
rule_source(people_seek_to_reduce_antagonism_towards_stronger_individuals_in_their_social_ne, ensemble).
rule_priority(people_seek_to_reduce_antagonism_towards_stronger_individuals_in_their_social_ne, 2).
rule_applies(people_seek_to_reduce_antagonism_towards_stronger_individuals_in_their_social_ne, X, Y) :-
    network(X, Y, antagonism, Antagonism_val), Antagonism_val > 6.
rule_effect(people_seek_to_reduce_antagonism_towards_stronger_individuals_in_their_social_ne, set_intent(X, candid, Y, -2)).


rule_likelihood(people_with_feuding_relationships_seek_to_date_their_crushes_despite_the_conflicts, 1).
rule_type(people_with_feuding_relationships_seek_to_date_their_crushes_despite_the_conflicts, volition).
% People with feuding relationships seek to date their crushes despite the conflicts.
rule_active(people_with_feuding_relationships_seek_to_date_their_crushes_despite_the_conflic).
rule_category(people_with_feuding_relationships_seek_to_date_their_crushes_despite_the_conflic, antagonism_hostility).
rule_source(people_with_feuding_relationships_seek_to_date_their_crushes_despite_the_conflic, ensemble).
rule_priority(people_with_feuding_relationships_seek_to_date_their_crushes_despite_the_conflic, 1).
rule_applies(people_with_feuding_relationships_seek_to_date_their_crushes_despite_the_conflic, X, Z) :-
    directed_status(X, Z, feuding),
    directed_status(Y, Z, feuding).
rule_effect(people_with_feuding_relationships_seek_to_date_their_crushes_despite_the_conflic, set_intent(X, candid, Y, 1)).


rule_likelihood(people_desire_to_associate_with_those_who_are_less_antagonistic_towards_their_connections, 1).
rule_type(people_desire_to_associate_with_those_who_are_less_antagonistic_towards_their_connections, volition).
% People desire to associate with those who are less antagonistic towards their connections.
rule_active(people_desire_to_associate_with_those_who_are_less_antagonistic_towards_their_co).
rule_category(people_desire_to_associate_with_those_who_are_less_antagonistic_towards_their_co, antagonism_hostility).
rule_source(people_desire_to_associate_with_those_who_are_less_antagonistic_towards_their_co, ensemble).
rule_priority(people_desire_to_associate_with_those_who_are_less_antagonistic_towards_their_co, 2).
rule_applies(people_desire_to_associate_with_those_who_are_less_antagonistic_towards_their_co, X, Z) :-
    network(X, Z, antagonism, Antagonism_val), Antagonism_val > 6,
    network(Y, Z, antagonism, Antagonism_val), Antagonism_val > 6.
rule_effect(people_desire_to_associate_with_those_who_are_less_antagonistic_towards_their_co, set_intent(X, candid, Y, 2)).


rule_likelihood(people_tend_to_avoid_strong_individuals_due_to_antagonism_however_they_may_develop_romantic, 1).
rule_type(people_tend_to_avoid_strong_individuals_due_to_antagonism_however_they_may_develop_romantic, volition).
% People tend to avoid strong individuals due to antagonism. However, they may develop romantic
rule_active(people_tend_to_avoid_strong_individuals_due_to_antagonism_however_they_may_dev).
rule_category(people_tend_to_avoid_strong_individuals_due_to_antagonism_however_they_may_dev, antagonism_hostility).
rule_source(people_tend_to_avoid_strong_individuals_due_to_antagonism_however_they_may_dev, ensemble).
rule_priority(people_tend_to_avoid_strong_individuals_due_to_antagonism_however_they_may_dev, 5).
rule_applies(people_tend_to_avoid_strong_individuals_due_to_antagonism_however_they_may_dev, X, Y) :-
    network(X, Y, antagonism, Antagonism_val), Antagonism_val > 6.
rule_effect(people_tend_to_avoid_strong_individuals_due_to_antagonism_however_they_may_dev, set_intent(X, favor, Y, -5)).


rule_likelihood(people_with_feuding_relationships_towards_strong_individuals_and_their_respective_counterparts_desire_to_form_a_favor, 1).
rule_type(people_with_feuding_relationships_towards_strong_individuals_and_their_respective_counterparts_desire_to_form_a_favor, volition).
% People with feuding relationships towards strong individuals and their respective counterparts desire to form a favor
rule_active(people_with_feuding_relationships_towards_strong_individuals_and_their_respectiv).
rule_category(people_with_feuding_relationships_towards_strong_individuals_and_their_respectiv, antagonism_hostility).
rule_source(people_with_feuding_relationships_towards_strong_individuals_and_their_respectiv, ensemble).
rule_priority(people_with_feuding_relationships_towards_strong_individuals_and_their_respectiv, 1).
rule_applies(people_with_feuding_relationships_towards_strong_individuals_and_their_respectiv, X, Z) :-
    directed_status(X, Z, feuding),
    directed_status(Y, Z, feuding).
rule_effect(people_with_feuding_relationships_towards_strong_individuals_and_their_respectiv, set_intent(X, favor, Y, 1)).


rule_likelihood(people_desire_to_form_connections_with_influential_individuals_when_they_have_a_strong_antagonistic_network_sentiment, 1).
rule_type(people_desire_to_form_connections_with_influential_individuals_when_they_have_a_strong_antagonistic_network_sentiment, volition).
% People desire to form connections with influential individuals when they have a strong antagonistic network sentiment
rule_active(people_desire_to_form_connections_with_influential_individuals_when_they_have_a).
rule_category(people_desire_to_form_connections_with_influential_individuals_when_they_have_a, antagonism_hostility).
rule_source(people_desire_to_form_connections_with_influential_individuals_when_they_have_a, ensemble).
rule_priority(people_desire_to_form_connections_with_influential_individuals_when_they_have_a, 1).
rule_applies(people_desire_to_form_connections_with_influential_individuals_when_they_have_a, X, Z) :-
    network(X, Z, antagonism, Antagonism_val), Antagonism_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_desire_to_form_connections_with_influential_individuals_when_they_have_a, set_intent(X, favor, Y, 1)).


rule_likelihood(people_with_feuding_relationships_seek_to_improve_their_honor_by_getting_closer_to_influential_individuals, 1).
rule_type(people_with_feuding_relationships_seek_to_improve_their_honor_by_getting_closer_to_influential_individuals, volition).
% People with feuding relationships seek to improve their honor by getting closer to influential individuals.
rule_active(people_with_feuding_relationships_seek_to_improve_their_honor_by_getting_closer).
rule_category(people_with_feuding_relationships_seek_to_improve_their_honor_by_getting_closer, antagonism_hostility).
rule_source(people_with_feuding_relationships_seek_to_improve_their_honor_by_getting_closer, ensemble).
rule_priority(people_with_feuding_relationships_seek_to_improve_their_honor_by_getting_closer, 2).
rule_applies(people_with_feuding_relationships_seek_to_improve_their_honor_by_getting_closer, X, Y) :-
    directed_status(X, Y, feuding).
rule_effect(people_with_feuding_relationships_seek_to_improve_their_honor_by_getting_closer, set_intent(X, honor, Y, -2)).


rule_likelihood(people_with_feuding_relationships_aim_to_ingratiate_themselves_towards_those_they_have_conflicts_with, 1).
rule_type(people_with_feuding_relationships_aim_to_ingratiate_themselves_towards_those_they_have_conflicts_with, volition).
% People with feuding relationships aim to ingratiate themselves towards those they have conflicts with
rule_active(people_with_feuding_relationships_aim_to_ingratiate_themselves_towards_those_the).
rule_category(people_with_feuding_relationships_aim_to_ingratiate_themselves_towards_those_the, antagonism_hostility).
rule_source(people_with_feuding_relationships_aim_to_ingratiate_themselves_towards_those_the, ensemble).
rule_priority(people_with_feuding_relationships_aim_to_ingratiate_themselves_towards_those_the, 3).
rule_applies(people_with_feuding_relationships_aim_to_ingratiate_themselves_towards_those_the, X, Y) :-
    directed_status(X, Y, feuding).
rule_effect(people_with_feuding_relationships_aim_to_ingratiate_themselves_towards_those_the, set_intent(X, ingratiate, Y, -3)).


rule_likelihood(people_seek_to_ingratiate_themselves_with_those_they_have_a_significant_antagonistic_relationship_towards, 1).
rule_type(people_seek_to_ingratiate_themselves_with_those_they_have_a_significant_antagonistic_relationship_towards, volition).
% People seek to ingratiate themselves with those they have a significant antagonistic relationship towards
rule_active(people_seek_to_ingratiate_themselves_with_those_they_have_a_significant_antagoni).
rule_category(people_seek_to_ingratiate_themselves_with_those_they_have_a_significant_antagoni, antagonism_hostility).
rule_source(people_seek_to_ingratiate_themselves_with_those_they_have_a_significant_antagoni, ensemble).
rule_priority(people_seek_to_ingratiate_themselves_with_those_they_have_a_significant_antagoni, 1).
rule_applies(people_seek_to_ingratiate_themselves_with_those_they_have_a_significant_antagoni, X, Y) :-
    network(X, Y, antagonism, Antagonism_val), Antagonism_val > 6.
rule_effect(people_seek_to_ingratiate_themselves_with_those_they_have_a_significant_antagoni, set_intent(X, ingratiate, Y, -1)).


rule_likelihood(people_tend_to_avoid_strong_antagonists_and_may_seek_emotional_connections_with_those_they_have_cr, 1).
rule_type(people_tend_to_avoid_strong_antagonists_and_may_seek_emotional_connections_with_those_they_have_cr, volition).
% People tend to avoid strong antagonists and may seek emotional connections with those they have cr
rule_active(people_tend_to_avoid_strong_antagonists_and_may_seek_emotional_connections_with).
rule_category(people_tend_to_avoid_strong_antagonists_and_may_seek_emotional_connections_with, antagonism_hostility).
rule_source(people_tend_to_avoid_strong_antagonists_and_may_seek_emotional_connections_with, ensemble).
rule_priority(people_tend_to_avoid_strong_antagonists_and_may_seek_emotional_connections_with, 5).
rule_applies(people_tend_to_avoid_strong_antagonists_and_may_seek_emotional_connections_with, X, Y) :-
    network(X, Y, antagonism, Antagonism_val), Antagonism_val > 6.
rule_effect(people_tend_to_avoid_strong_antagonists_and_may_seek_emotional_connections_with, set_intent(X, kind, Y, -5)).


rule_likelihood(people_seek_to_distance_themselves_from_individuals_with_strong_antagonistic_influences, 1).
rule_type(people_seek_to_distance_themselves_from_individuals_with_strong_antagonistic_influences, volition).
% People seek to distance themselves from individuals with strong antagonistic influences.
rule_active(people_seek_to_distance_themselves_from_individuals_with_strong_antagonistic_inf).
rule_category(people_seek_to_distance_themselves_from_individuals_with_strong_antagonistic_inf, antagonism_hostility).
rule_source(people_seek_to_distance_themselves_from_individuals_with_strong_antagonistic_inf, ensemble).
rule_priority(people_seek_to_distance_themselves_from_individuals_with_strong_antagonistic_inf, 3).
rule_applies(people_seek_to_distance_themselves_from_individuals_with_strong_antagonistic_inf, X, Y) :-
    network(X, Y, antagonism, Antagonism_val), Antagonism_val < 4.
rule_effect(people_seek_to_distance_themselves_from_individuals_with_strong_antagonistic_inf, set_intent(X, kind, Y, 3)).


rule_likelihood(people_seek_to_reduce_antagonism_and_increase_positive_influence_in_their_social_networks, 1).
rule_type(people_seek_to_reduce_antagonism_and_increase_positive_influence_in_their_social_networks, volition).
% People seek to reduce antagonism and increase positive influence in their social networks.
rule_active(people_seek_to_reduce_antagonism_and_increase_positive_influence_in_their_social).
rule_category(people_seek_to_reduce_antagonism_and_increase_positive_influence_in_their_social, antagonism_hostility).
rule_source(people_seek_to_reduce_antagonism_and_increase_positive_influence_in_their_social, ensemble).
rule_priority(people_seek_to_reduce_antagonism_and_increase_positive_influence_in_their_social, 2).
rule_applies(people_seek_to_reduce_antagonism_and_increase_positive_influence_in_their_social, X, Y) :-
    network(X, Y, antagonism, Antagonism_val), Antagonism_val > 6.
rule_effect(people_seek_to_reduce_antagonism_and_increase_positive_influence_in_their_social, set_intent(X, manipulate, Y, 2)).


rule_likelihood(people_with_feuding_relationships_aim_to_increase_trust_towards_strong_individuals, 1).
rule_type(people_with_feuding_relationships_aim_to_increase_trust_towards_strong_individuals, volition).
% People with feuding relationships aim to increase trust towards strong individuals.
rule_active(people_with_feuding_relationships_aim_to_increase_trust_towards_strong_individua).
rule_category(people_with_feuding_relationships_aim_to_increase_trust_towards_strong_individua, antagonism_hostility).
rule_source(people_with_feuding_relationships_aim_to_increase_trust_towards_strong_individua, ensemble).
rule_priority(people_with_feuding_relationships_aim_to_increase_trust_towards_strong_individua, 5).
rule_applies(people_with_feuding_relationships_aim_to_increase_trust_towards_strong_individua, X, Y) :-
    directed_status(X, Y, feuding).
rule_effect(people_with_feuding_relationships_aim_to_increase_trust_towards_strong_individua, set_intent(X, trust, Y, -5)).


rule_likelihood(people_seek_to_reduce_antagonism_and_increase_trust_towards_stronger_individuals_in_their_network, 1).
rule_type(people_seek_to_reduce_antagonism_and_increase_trust_towards_stronger_individuals_in_their_network, volition).
% People seek to reduce antagonism and increase trust towards stronger individuals in their network.
rule_active(people_seek_to_reduce_antagonism_and_increase_trust_towards_stronger_individuals).
rule_category(people_seek_to_reduce_antagonism_and_increase_trust_towards_stronger_individuals, antagonism_hostility).
rule_source(people_seek_to_reduce_antagonism_and_increase_trust_towards_stronger_individuals, ensemble).
rule_priority(people_seek_to_reduce_antagonism_and_increase_trust_towards_stronger_individuals, 5).
rule_applies(people_seek_to_reduce_antagonism_and_increase_trust_towards_stronger_individuals, X, Y) :-
    network(X, Y, antagonism, Antagonism_val), Antagonism_val > 6.
rule_effect(people_seek_to_reduce_antagonism_and_increase_trust_towards_stronger_individuals, set_intent(X, trust, Y, -5)).

%% ─── Appearance Beauty (1 rules) ───


rule_likelihood(beautiful_kind_unhappy_poor_people_may_gain_sympathy_from_young_generous_sensitive_rich_people, 1).
rule_type(beautiful_kind_unhappy_poor_people_may_gain_sympathy_from_young_generous_sensitive_rich_people, volition).
% Beautiful, kind, unhappy poor people may gain sympathy from young, generous, sensitive rich people
rule_active(beautiful_kind_unhappy_poor_people_may_gain_sympathy_from_young_generous_sen).
rule_category(beautiful_kind_unhappy_poor_people_may_gain_sympathy_from_young_generous_sen, appearance_beauty).
rule_source(beautiful_kind_unhappy_poor_people_may_gain_sympathy_from_young_generous_sen, ensemble).
rule_priority(beautiful_kind_unhappy_poor_people_may_gain_sympathy_from_young_generous_sen, 5).
rule_applies(beautiful_kind_unhappy_poor_people_may_gain_sympathy_from_young_generous_sen, X, Y) :-
    trait(X, young),
    trait(Y, beautiful),
    trait(Y, kind),
    \+ trait(Y, young),
    \+ status(Y, happy),
    trait(X, generous),
    trait(X, rich),
    trait(Y, poor),
    attribute(X, sensitiveness, Sensitiveness_val), Sensitiveness_val > 60.
rule_effect(beautiful_kind_unhappy_poor_people_may_gain_sympathy_from_young_generous_sen, modify_network(Y, X, affinity, '+', 0)).

%% ─── Attention Seeking (3 rules) ───


rule_likelihood(a_shy_young_male_may_seek_the_attention_of_the_employee_of_the_woman_he_is_interested_in, 1).
rule_type(a_shy_young_male_may_seek_the_attention_of_the_employee_of_the_woman_he_is_interested_in, volition).
% A shy young male may seek the attention of the employee of the woman he is interested in
rule_active(a_shy_young_male_may_seek_the_attention_of_the_employee_of_the_woman_he_is_inter).
rule_category(a_shy_young_male_may_seek_the_attention_of_the_employee_of_the_woman_he_is_inter, attention_seeking).
rule_source(a_shy_young_male_may_seek_the_attention_of_the_employee_of_the_woman_he_is_inter, ensemble).
rule_priority(a_shy_young_male_may_seek_the_attention_of_the_employee_of_the_woman_he_is_inter, 5).
rule_applies(a_shy_young_male_may_seek_the_attention_of_the_employee_of_the_woman_he_is_inter, X, Z) :-
    trait(X, male),
    trait(X, young),
    trait(Z, female),
    trait(Z, young),
    trait(Z, beautiful),
    attribute(Y, social_standing, Social_standing_val), Social_standing_val < 33,
    directed_status(Y, Z, financially_dependent_on),
    trait(X, shy).
rule_effect(a_shy_young_male_may_seek_the_attention_of_the_employee_of_the_woman_he_is_inter, modify_network(X, Y, curiosity, '+', 0)).


rule_likelihood(appropriately_behaved_rich_people_may_attract_less_attention_from_non_rich_people, 1).
rule_type(appropriately_behaved_rich_people_may_attract_less_attention_from_non_rich_people, volition).
% Appropriately behaved rich people may attract less attention from non-rich people
rule_active(appropriately_behaved_rich_people_may_attract_less_attention_from_non_rich_peopl).
rule_category(appropriately_behaved_rich_people_may_attract_less_attention_from_non_rich_peopl, attention_seeking).
rule_source(appropriately_behaved_rich_people_may_attract_less_attention_from_non_rich_peopl, ensemble).
rule_priority(appropriately_behaved_rich_people_may_attract_less_attention_from_non_rich_peopl, 3).
rule_applies(appropriately_behaved_rich_people_may_attract_less_attention_from_non_rich_peopl, X, Y) :-
    trait(X, rich),
    \+ trait(Y, rich),
    attribute(X, propriety, Propriety_val), Propriety_val > 70.
rule_effect(appropriately_behaved_rich_people_may_attract_less_attention_from_non_rich_peopl, modify_network(X, Y, curiosity, '+', 0)).


rule_likelihood(unhappy_people_seek_to_increase_attention_from_sensitive_people_who_have_a_high_affinity_for_them, 1).
rule_type(unhappy_people_seek_to_increase_attention_from_sensitive_people_who_have_a_high_affinity_for_them, volition).
% Unhappy people seek to increase attention from sensitive people who have a high affinity for them
rule_active(unhappy_people_seek_to_increase_attention_from_sensitive_people_who_have_a_high).
rule_category(unhappy_people_seek_to_increase_attention_from_sensitive_people_who_have_a_high, attention_seeking).
rule_source(unhappy_people_seek_to_increase_attention_from_sensitive_people_who_have_a_high, ensemble).
rule_priority(unhappy_people_seek_to_increase_attention_from_sensitive_people_who_have_a_high, 5).
rule_applies(unhappy_people_seek_to_increase_attention_from_sensitive_people_who_have_a_high, X, Y) :-
    network(X, Y, affinity, Affinity_val), Affinity_val > 60,
    \+ status(Y, happy),
    attribute(X, sensitiveness, Sensitiveness_val), Sensitiveness_val > 60.
rule_effect(unhappy_people_seek_to_increase_attention_from_sensitive_people_who_have_a_high, modify_network(Y, X, curiosity, '+', 0)).

%% ─── Betrayal Revenge (15 rules) ───


rule_likelihood(a_rich_person_discovering_a_lie_from_a_false_rich_person_is_more_likely_to_seek_revenge, 1).
rule_type(a_rich_person_discovering_a_lie_from_a_false_rich_person_is_more_likely_to_seek_revenge, volition).
% A rich person discovering a lie from a false rich person is more likely to seek revenge
rule_active(a_rich_person_discovering_a_lie_from_a_false_rich_person_is_more_likely_to_seek).
rule_category(a_rich_person_discovering_a_lie_from_a_false_rich_person_is_more_likely_to_seek, betrayal_revenge).
rule_source(a_rich_person_discovering_a_lie_from_a_false_rich_person_is_more_likely_to_seek, ensemble).
rule_priority(a_rich_person_discovering_a_lie_from_a_false_rich_person_is_more_likely_to_seek, 3).
rule_applies(a_rich_person_discovering_a_lie_from_a_false_rich_person_is_more_likely_to_seek, X, Y) :-
    event(X, Y, caught_in_a_lie_by, _),
    attribute(Y, social_standing, Social_standing_val), Social_standing_val > 66,
    trait(Y, credulous),
    directed_status(Y, X, trusts),
    network(Y, X, credibility, Credibility_val), Credibility_val > 66,
    attribute(X, social_standing, Social_standing_val), Social_standing_val < 33,
    trait(X, elegantly_dressed).
rule_effect(a_rich_person_discovering_a_lie_from_a_false_rich_person_is_more_likely_to_seek, add_relationship(X, Y, esteem)).
rule_effect(a_rich_person_discovering_a_lie_from_a_false_rich_person_is_more_likely_to_seek, add_relationship(Y, X, esteem)).
rule_effect(a_rich_person_discovering_a_lie_from_a_false_rich_person_is_more_likely_to_seek, modify_network(X, Y, credibility, '+', 0)).


rule_likelihood(people_feel_antagonized_towards_those_who_betrayed_them_both_individually_and_collectively, 1).
rule_type(people_feel_antagonized_towards_those_who_betrayed_them_both_individually_and_collectively, volition).
% People feel antagonized towards those who betrayed them both individually and collectively.
rule_active(people_feel_antagonized_towards_those_who_betrayed_them_both_individually_and_co).
rule_category(people_feel_antagonized_towards_those_who_betrayed_them_both_individually_and_co, betrayal_revenge).
rule_source(people_feel_antagonized_towards_those_who_betrayed_them_both_individually_and_co, ensemble).
rule_priority(people_feel_antagonized_towards_those_who_betrayed_them_both_individually_and_co, 1).
rule_applies(people_feel_antagonized_towards_those_who_betrayed_them_both_individually_and_co, X, Z) :-
    directed_status(X, Z, betrayed_by),
    directed_status(Y, Z, betrayed_by).
rule_effect(people_feel_antagonized_towards_those_who_betrayed_them_both_individually_and_co, set_intent(X, antagonize, Y, -1)).


rule_likelihood(people_who_have_been_betrayed_by_someone_z_and_desire_to_distance_themselves_from_that_person, 1).
rule_type(people_who_have_been_betrayed_by_someone_z_and_desire_to_distance_themselves_from_that_person, volition).
% People who have been betrayed by someone (z) and desire to distance themselves from that person
rule_active(people_who_have_been_betrayed_by_someone_z_and_desire_to_distance_themselves_f).
rule_category(people_who_have_been_betrayed_by_someone_z_and_desire_to_distance_themselves_f, betrayal_revenge).
rule_source(people_who_have_been_betrayed_by_someone_z_and_desire_to_distance_themselves_f, ensemble).
rule_priority(people_who_have_been_betrayed_by_someone_z_and_desire_to_distance_themselves_f, 3).
rule_applies(people_who_have_been_betrayed_by_someone_z_and_desire_to_distance_themselves_f, X, Z) :-
    directed_status(X, Z, betrayed_by),
    event(Y, Z, nice, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_who_have_been_betrayed_by_someone_z_and_desire_to_distance_themselves_f, set_intent(X, antagonize, Y, 3)).


rule_likelihood(people_who_have_been_betrayed_by_someone_z_and_mean_something_significant_to_them_within_the, 1).
rule_type(people_who_have_been_betrayed_by_someone_z_and_mean_something_significant_to_them_within_the, volition).
% People who have been betrayed by someone (z) and mean something significant to them within the
rule_active(people_who_have_been_betrayed_by_someone_z_and_mean_something_significant_to_t).
rule_category(people_who_have_been_betrayed_by_someone_z_and_mean_something_significant_to_t, betrayal_revenge).
rule_source(people_who_have_been_betrayed_by_someone_z_and_mean_something_significant_to_t, ensemble).
rule_priority(people_who_have_been_betrayed_by_someone_z_and_mean_something_significant_to_t, 1).
rule_applies(people_who_have_been_betrayed_by_someone_z_and_mean_something_significant_to_t, X, Z) :-
    directed_status(X, Z, betrayed_by),
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_who_have_been_betrayed_by_someone_z_and_mean_something_significant_to_t, set_intent(X, kind, Y, 1)).


rule_likelihood(people_who_have_been_betrayed_by_someone_z_and_have_received_a_favor_from_their_cr, 1).
rule_type(people_who_have_been_betrayed_by_someone_z_and_have_received_a_favor_from_their_cr, volition).
% People who have been betrayed by someone (z) and have received a favor from their cr
rule_active(people_who_have_been_betrayed_by_someone_z_and_have_received_a_favor_from_thei).
rule_category(people_who_have_been_betrayed_by_someone_z_and_have_received_a_favor_from_thei, betrayal_revenge).
rule_source(people_who_have_been_betrayed_by_someone_z_and_have_received_a_favor_from_thei, ensemble).
rule_priority(people_who_have_been_betrayed_by_someone_z_and_have_received_a_favor_from_thei, 3).
rule_applies(people_who_have_been_betrayed_by_someone_z_and_have_received_a_favor_from_thei, X, Z) :-
    directed_status(X, Z, betrayed_by),
    event(Y, Z, did_a_favor_for, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_who_have_been_betrayed_by_someone_z_and_have_received_a_favor_from_thei, set_intent(X, antagonize, Y, 3)).


rule_likelihood(people_feel_antagonized_towards_those_who_betrayed_them_and_are_less_likely_to_date_their_cr, 1).
rule_type(people_feel_antagonized_towards_those_who_betrayed_them_and_are_less_likely_to_date_their_cr, volition).
% People feel antagonized towards those who betrayed them and are less likely to date their cr
rule_active(people_feel_antagonized_towards_those_who_betrayed_them_and_are_less_likely_to_d).
rule_category(people_feel_antagonized_towards_those_who_betrayed_them_and_are_less_likely_to_d, betrayal_revenge).
rule_source(people_feel_antagonized_towards_those_who_betrayed_them_and_are_less_likely_to_d, ensemble).
rule_priority(people_feel_antagonized_towards_those_who_betrayed_them_and_are_less_likely_to_d, 2).
rule_applies(people_feel_antagonized_towards_those_who_betrayed_them_and_are_less_likely_to_d, X, Z) :-
    directed_status(X, Z, betrayed_by),
    event(Y, Z, nice, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_feel_antagonized_towards_those_who_betrayed_them_and_are_less_likely_to_d, set_intent(X, antagonize, Y, 2)).


rule_likelihood(people_who_have_been_betrayed_by_someone_z_and_had_a_positive_interaction_with_their_cr, 1).
rule_type(people_who_have_been_betrayed_by_someone_z_and_had_a_positive_interaction_with_their_cr, volition).
% People who have been betrayed by someone (z) and had a positive interaction with their cr
rule_active(people_who_have_been_betrayed_by_someone_z_and_had_a_positive_interaction_with).
rule_category(people_who_have_been_betrayed_by_someone_z_and_had_a_positive_interaction_with, betrayal_revenge).
rule_source(people_who_have_been_betrayed_by_someone_z_and_had_a_positive_interaction_with, ensemble).
rule_priority(people_who_have_been_betrayed_by_someone_z_and_had_a_positive_interaction_with, 1).
rule_applies(people_who_have_been_betrayed_by_someone_z_and_had_a_positive_interaction_with, X, Z) :-
    directed_status(X, Z, betrayed_by),
    event(Y, Z, nice, TurnsAgo), TurnsAgo >= 31, TurnsAgo =< 9999.
rule_effect(people_who_have_been_betrayed_by_someone_z_and_had_a_positive_interaction_with, set_intent(X, antagonize, Y, 1)).


rule_likelihood(people_who_have_been_betrayed_by_someone_z_and_feel_the_mean_actions_towards_them_occurred, 1).
rule_type(people_who_have_been_betrayed_by_someone_z_and_feel_the_mean_actions_towards_them_occurred, volition).
% People who have been betrayed by someone (z) and feel the mean actions towards them occurred
rule_active(people_who_have_been_betrayed_by_someone_z_and_feel_the_mean_actions_towards_t).
rule_category(people_who_have_been_betrayed_by_someone_z_and_feel_the_mean_actions_towards_t, betrayal_revenge).
rule_source(people_who_have_been_betrayed_by_someone_z_and_feel_the_mean_actions_towards_t, ensemble).
rule_priority(people_who_have_been_betrayed_by_someone_z_and_feel_the_mean_actions_towards_t, 1).
rule_applies(people_who_have_been_betrayed_by_someone_z_and_feel_the_mean_actions_towards_t, X, Z) :-
    directed_status(X, Z, betrayed_by),
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 31, TurnsAgo =< 9999.
rule_effect(people_who_have_been_betrayed_by_someone_z_and_feel_the_mean_actions_towards_t, set_intent(X, antagonize, Y, -1)).


rule_likelihood(people_intending_to_be_closer_after_being_betrayed_by_someone_and_having_a_significant_event_occur_within, 1).
rule_type(people_intending_to_be_closer_after_being_betrayed_by_someone_and_having_a_significant_event_occur_within, volition).
% People intending to be closer after being betrayed by someone and having a significant event occur within
rule_active(people_intending_to_be_closer_after_being_betrayed_by_someone_and_having_a_signi).
rule_category(people_intending_to_be_closer_after_being_betrayed_by_someone_and_having_a_signi, betrayal_revenge).
rule_source(people_intending_to_be_closer_after_being_betrayed_by_someone_and_having_a_signi, ensemble).
rule_priority(people_intending_to_be_closer_after_being_betrayed_by_someone_and_having_a_signi, 2).
rule_applies(people_intending_to_be_closer_after_being_betrayed_by_someone_and_having_a_signi, X, Z) :-
    directed_status(X, Z, betrayed_by),
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_intending_to_be_closer_after_being_betrayed_by_someone_and_having_a_signi, set_intent(X, candid, Y, 2)).


rule_likelihood(people_with_a_betrayed_relationship_status_towards_someone_want_to_date_their_crush_if_they_have_had, 1).
rule_type(people_with_a_betrayed_relationship_status_towards_someone_want_to_date_their_crush_if_they_have_had, volition).
% People with a betrayed relationship status towards someone want to date their crush if they have had
rule_active(people_with_a_betrayed_relationship_status_towards_someone_want_to_date_their_cr).
rule_category(people_with_a_betrayed_relationship_status_towards_someone_want_to_date_their_cr, betrayal_revenge).
rule_source(people_with_a_betrayed_relationship_status_towards_someone_want_to_date_their_cr, ensemble).
rule_priority(people_with_a_betrayed_relationship_status_towards_someone_want_to_date_their_cr, 1).
rule_applies(people_with_a_betrayed_relationship_status_towards_someone_want_to_date_their_cr, X, Z) :-
    directed_status(X, Z, betrayed_by),
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_with_a_betrayed_relationship_status_towards_someone_want_to_date_their_cr, set_intent(X, candid, Y, 1)).


rule_likelihood(people_avoid_being_betrayed_by_others_and_may_favor_those_who_have_not_caused_them_to_feel_bet, 1).
rule_type(people_avoid_being_betrayed_by_others_and_may_favor_those_who_have_not_caused_them_to_feel_bet, volition).
% People avoid being betrayed by others and may favor those who have not caused them to feel bet
rule_active(people_avoid_being_betrayed_by_others_and_may_favor_those_who_have_not_caused_th).
rule_category(people_avoid_being_betrayed_by_others_and_may_favor_those_who_have_not_caused_th, betrayal_revenge).
rule_source(people_avoid_being_betrayed_by_others_and_may_favor_those_who_have_not_caused_th, ensemble).
rule_priority(people_avoid_being_betrayed_by_others_and_may_favor_those_who_have_not_caused_th, 5).
rule_applies(people_avoid_being_betrayed_by_others_and_may_favor_those_who_have_not_caused_th, X, Y) :-
    directed_status(X, Y, betrayed_by).
rule_effect(people_avoid_being_betrayed_by_others_and_may_favor_those_who_have_not_caused_th, set_intent(X, favor, Y, -5)).


rule_likelihood(people_develop_a_favor_towards_their_crush_after_feeling_betrayed_by_someone_else, 1).
rule_type(people_develop_a_favor_towards_their_crush_after_feeling_betrayed_by_someone_else, volition).
% People develop a favor towards their crush after feeling betrayed by someone else.
rule_active(people_develop_a_favor_towards_their_crush_after_feeling_betrayed_by_someone_els).
rule_category(people_develop_a_favor_towards_their_crush_after_feeling_betrayed_by_someone_els, betrayal_revenge).
rule_source(people_develop_a_favor_towards_their_crush_after_feeling_betrayed_by_someone_els, ensemble).
rule_priority(people_develop_a_favor_towards_their_crush_after_feeling_betrayed_by_someone_els, 2).
rule_applies(people_develop_a_favor_towards_their_crush_after_feeling_betrayed_by_someone_els, X, Z) :-
    directed_status(X, Z, betrayed_by),
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_develop_a_favor_towards_their_crush_after_feeling_betrayed_by_someone_els, set_intent(X, favor, Y, 2)).


rule_likelihood(people_who_have_been_betrayed_by_someone_z_and_feel_the_mean_action_occurred_within_a, 1).
rule_type(people_who_have_been_betrayed_by_someone_z_and_feel_the_mean_action_occurred_within_a, volition).
% People who have been betrayed by someone (z) and feel the mean action occurred within a
rule_active(people_who_have_been_betrayed_by_someone_z_and_feel_the_mean_action_occurred_w).
rule_category(people_who_have_been_betrayed_by_someone_z_and_feel_the_mean_action_occurred_w, betrayal_revenge).
rule_source(people_who_have_been_betrayed_by_someone_z_and_feel_the_mean_action_occurred_w, ensemble).
rule_priority(people_who_have_been_betrayed_by_someone_z_and_feel_the_mean_action_occurred_w, 1).
rule_applies(people_who_have_been_betrayed_by_someone_z_and_feel_the_mean_action_occurred_w, X, Z) :-
    directed_status(X, Z, betrayed_by),
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_who_have_been_betrayed_by_someone_z_and_feel_the_mean_action_occurred_w, set_intent(X, favor, Y, 1)).


rule_likelihood(people_with_a_betrayed_status_by_someone_want_to_get_closer_to_their_crush_after_an_event, 1).
rule_type(people_with_a_betrayed_status_by_someone_want_to_get_closer_to_their_crush_after_an_event, volition).
% People with a betrayed status by someone want to get closer to their crush after an event
rule_active(people_with_a_betrayed_status_by_someone_want_to_get_closer_to_their_crush_after).
rule_category(people_with_a_betrayed_status_by_someone_want_to_get_closer_to_their_crush_after, betrayal_revenge).
rule_source(people_with_a_betrayed_status_by_someone_want_to_get_closer_to_their_crush_after, ensemble).
rule_priority(people_with_a_betrayed_status_by_someone_want_to_get_closer_to_their_crush_after, 2).
rule_applies(people_with_a_betrayed_status_by_someone_want_to_get_closer_to_their_crush_after, X, Z) :-
    directed_status(X, Z, betrayed_by),
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_with_a_betrayed_status_by_someone_want_to_get_closer_to_their_crush_after, set_intent(X, kind, Y, 2)).


rule_likelihood(people_attempt_to_influence_others_through_betrayal_or_manipulation_by_someone_they_perceive_as_strong, 1).
rule_type(people_attempt_to_influence_others_through_betrayal_or_manipulation_by_someone_they_perceive_as_strong, volition).
% People attempt to influence others through betrayal or manipulation by someone they perceive as strong
rule_active(people_attempt_to_influence_others_through_betrayal_or_manipulation_by_someone_t).
rule_category(people_attempt_to_influence_others_through_betrayal_or_manipulation_by_someone_t, betrayal_revenge).
rule_source(people_attempt_to_influence_others_through_betrayal_or_manipulation_by_someone_t, ensemble).
rule_priority(people_attempt_to_influence_others_through_betrayal_or_manipulation_by_someone_t, 2).
rule_applies(people_attempt_to_influence_others_through_betrayal_or_manipulation_by_someone_t, X, Y) :-
    directed_status(X, Y, betrayed_by).
rule_effect(people_attempt_to_influence_others_through_betrayal_or_manipulation_by_someone_t, set_intent(X, manipulate, Y, 2)).

%% ─── Business (2 rules) ───


rule_type(entrepreneurial_spirit, action).
rule_category(entrepreneurial_spirit, business).
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(entrepreneurial_spirit).
rule_priority(entrepreneurial_spirit, 6).
rule_likelihood(entrepreneurial_spirit, 0.15).

rule_applies(entrepreneurial_spirit, Person, _) :-
    person(Person),
    age(Person, Age), Age >= 25, Age =< 45,
    personality(Person, openness, O), O > 0.5,
    personality(Person, conscientiousness, C), C > 0.5,
    alive(Person).

rule_effect(entrepreneurial_spirit, Person, _, found_business(Person)).


rule_type(business_expansion, action).
rule_category(business_expansion, business).
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(business_expansion).
rule_priority(business_expansion, 5).
rule_likelihood(business_expansion, 0.3).

rule_applies(business_expansion, Owner, Business) :-
    person(Owner),
    business_owner(Business, Owner),
    business(Business).

rule_effect(business_expansion, Owner, Business, expand_business(Business)).

%% ─── Cognition (1 rules) ───


rule_type(remembering_old_friends, action).
rule_category(remembering_old_friends, cognition).
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(remembering_old_friends).
rule_priority(remembering_old_friends, 2).
rule_likelihood(remembering_old_friends, 0.1).

rule_applies(remembering_old_friends, Person1, Person2) :-
    person(Person1), person(Person2),
    Person1 \= Person2,
    friend_of(Person1, Person2),
    alive(Person1), alive(Person2).

rule_effect(remembering_old_friends, Person1, Person2, reconnect(Person1, Person2)).

%% ─── Commerce (2 rules) ───


rule_type(merchant_trade_route, action).
rule_category(merchant_trade_route, commerce).
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(merchant_trade_route).
rule_priority(merchant_trade_route, 6).
rule_likelihood(merchant_trade_route, 0.3).

rule_applies(merchant_trade_route, Merchant, _) :-
    person(Merchant),
    occupation(Merchant, merchant),
    alive(Merchant).

rule_effect(merchant_trade_route, Merchant, _, establish_trade_route(Merchant)).


rule_type(supply_demand_pricing, action).
rule_category(supply_demand_pricing, commerce).
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(supply_demand_pricing).
rule_priority(supply_demand_pricing, 5).
rule_likelihood(supply_demand_pricing, 0.6).

rule_applies(supply_demand_pricing, Business, _) :-
    business(Business),
    \+ business_out_of_business(Business).

rule_effect(supply_demand_pricing, Business, _, adjust_prices(Business)).

%% ─── Conflict (2 rules) ───


rule_type(rivalry_formation, action).
rule_category(rivalry_formation, conflict).
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(rivalry_formation).
rule_priority(rivalry_formation, 4).
rule_likelihood(rivalry_formation, 0.2).

rule_applies(rivalry_formation, Person1, Person2) :-
    person(Person1), person(Person2),
    Person1 \= Person2,
    personality(Person1, agreeableness, A), A < 0.3,
    \+ friend_of(Person1, Person2),
    alive(Person1), alive(Person2).

rule_effect(rivalry_formation, Person1, Person2, add_relationship(Person1, Person2, rival)).


rule_type(conflict_mediation, action).
rule_category(conflict_mediation, conflict).
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(conflict_mediation).
rule_priority(conflict_mediation, 5).
rule_likelihood(conflict_mediation, 0.4).

rule_applies(conflict_mediation, Mediator, Person1) :-
    person(Mediator), person(Person1),
    Mediator \= Person1,
    age(Mediator, Age), Age >= 50,
    personality(Mediator, agreeableness, A), A > 0.6,
    alive(Mediator), alive(Person1).

rule_effect(conflict_mediation, Mediator, Person1, mediate_conflict(Mediator, Person1)).

%% ─── Deception Manipulation (2 rules) ───


rule_likelihood(a_deceptive_and_charismatic_man_inspires_a_credulous_honest_woman_to_increase_interest, 1).
rule_type(a_deceptive_and_charismatic_man_inspires_a_credulous_honest_woman_to_increase_interest, volition).
% A deceptive and charismatic man inspires a credulous honest woman to increase interest
rule_active(a_deceptive_and_charismatic_man_inspires_a_credulous_honest_woman_to_increase_in).
rule_category(a_deceptive_and_charismatic_man_inspires_a_credulous_honest_woman_to_increase_in, deception_manipulation).
rule_source(a_deceptive_and_charismatic_man_inspires_a_credulous_honest_woman_to_increase_in, ensemble).
rule_priority(a_deceptive_and_charismatic_man_inspires_a_credulous_honest_woman_to_increase_in, 5).
rule_applies(a_deceptive_and_charismatic_man_inspires_a_credulous_honest_woman_to_increase_in, X, Y) :-
    trait(X, credulous),
    trait(X, honest),
    trait(Y, deceptive),
    trait(X, female),
    trait(Y, male),
    attribute(Y, charisma, Charisma_val), Charisma_val > 50.
rule_effect(a_deceptive_and_charismatic_man_inspires_a_credulous_honest_woman_to_increase_in, modify_network(Y, X, curiosity, '+', 0)).
rule_effect(a_deceptive_and_charismatic_man_inspires_a_credulous_honest_woman_to_increase_in, modify_network(X, Y, affinity, '+', 0)).


rule_likelihood(cunning_seductive_men_may_seek_to_increase_affinity_and_attention_from_credulous_young_women, 1).
rule_type(cunning_seductive_men_may_seek_to_increase_affinity_and_attention_from_credulous_young_women, volition).
% Cunning, seductive men may seek to increase affinity and attention from credulous young women
rule_active(cunning_seductive_men_may_seek_to_increase_affinity_and_attention_from_credulou).
rule_category(cunning_seductive_men_may_seek_to_increase_affinity_and_attention_from_credulou, deception_manipulation).
rule_source(cunning_seductive_men_may_seek_to_increase_affinity_and_attention_from_credulou, ensemble).
rule_priority(cunning_seductive_men_may_seek_to_increase_affinity_and_attention_from_credulou, 5).
rule_applies(cunning_seductive_men_may_seek_to_increase_affinity_and_attention_from_credulou, X, Y) :-
    trait(X, female),
    trait(X, young),
    trait(X, credulous),
    attribute(Y, cunningness, Cunningness_val), Cunningness_val > 50,
    trait(Y, flirtatious),
    trait(Y, male).
rule_effect(cunning_seductive_men_may_seek_to_increase_affinity_and_attention_from_credulou, modify_network(Y, X, affinity, '+', 0)).
rule_effect(cunning_seductive_men_may_seek_to_increase_affinity_and_attention_from_credulou, modify_network(Y, X, curiosity, '+', 0)).

%% ─── Dominance Power (46 rules) ───


rule_likelihood(people_s_desire_to_get_closer_increases_when_they_perceive_others_as_more_influential_or_strong, 1).
rule_type(people_s_desire_to_get_closer_increases_when_they_perceive_others_as_more_influential_or_strong, volition).
% People’s desire to get closer increases when they perceive others as more influential or strong
rule_active(people_s_desire_to_get_closer_increases_when_they_perceive_others_as_more_influe).
rule_category(people_s_desire_to_get_closer_increases_when_they_perceive_others_as_more_influe, dominance_power).
rule_source(people_s_desire_to_get_closer_increases_when_they_perceive_others_as_more_influe, ensemble).
rule_priority(people_s_desire_to_get_closer_increases_when_they_perceive_others_as_more_influe, 2).
rule_applies(people_s_desire_to_get_closer_increases_when_they_perceive_others_as_more_influe, X, Y) :-
    event(X, Y, mean, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_s_desire_to_get_closer_increases_when_they_perceive_others_as_more_influe, set_intent(X, antagonize, Y, 2)).


rule_likelihood(people_s_desire_to_be_closer_to_influential_individuals_and_recent_romantic_events_influence_their_intent, 1).
rule_type(people_s_desire_to_be_closer_to_influential_individuals_and_recent_romantic_events_influence_their_intent, volition).
% People’s desire to be closer to influential individuals and recent romantic events influence their intent
rule_active(people_s_desire_to_be_closer_to_influential_individuals_and_recent_romantic_even).
rule_category(people_s_desire_to_be_closer_to_influential_individuals_and_recent_romantic_even, dominance_power).
rule_source(people_s_desire_to_be_closer_to_influential_individuals_and_recent_romantic_even, ensemble).
rule_priority(people_s_desire_to_be_closer_to_influential_individuals_and_recent_romantic_even, 2).
rule_applies(people_s_desire_to_be_closer_to_influential_individuals_and_recent_romantic_even, X, Z) :-
    network(X, Z, romance, Romance_val), Romance_val > 6,
    event(Y, Z, romantic, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_s_desire_to_be_closer_to_influential_individuals_and_recent_romantic_even, set_intent(X, antagonize, Y, 2)).


rule_likelihood(people_seek_closer_connections_with_influential_individuals_within_their_social_network, 1).
rule_type(people_seek_closer_connections_with_influential_individuals_within_their_social_network, volition).
% People seek closer connections with influential individuals within their social network.
rule_active(people_seek_closer_connections_with_influential_individuals_within_their_social).
rule_category(people_seek_closer_connections_with_influential_individuals_within_their_social, dominance_power).
rule_source(people_seek_closer_connections_with_influential_individuals_within_their_social, ensemble).
rule_priority(people_seek_closer_connections_with_influential_individuals_within_their_social, 1).
rule_applies(people_seek_closer_connections_with_influential_individuals_within_their_social, X, Y) :-
    network(X, Y, romance, Romance_val), Romance_val > 3,
    network(X, Y, romance, Romance_val), Romance_val < 7.
rule_effect(people_seek_closer_connections_with_influential_individuals_within_their_social, set_intent(X, candid, Y, 1)).


rule_likelihood(people_desire_to_form_friendships_with_individuals_they_perceive_as_more_influential_than_themselves, 1).
rule_type(people_desire_to_form_friendships_with_individuals_they_perceive_as_more_influential_than_themselves, volition).
% People desire to form friendships with individuals they perceive as more influential than themselves.
rule_active(people_desire_to_form_friendships_with_individuals_they_perceive_as_more_influen).
rule_category(people_desire_to_form_friendships_with_individuals_they_perceive_as_more_influen, dominance_power).
rule_source(people_desire_to_form_friendships_with_individuals_they_perceive_as_more_influen, ensemble).
rule_priority(people_desire_to_form_friendships_with_individuals_they_perceive_as_more_influen, 2).
rule_applies(people_desire_to_form_friendships_with_individuals_they_perceive_as_more_influen, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val < 4.
rule_effect(people_desire_to_form_friendships_with_individuals_they_perceive_as_more_influen, set_intent(X, candid, Y, -2)).


rule_likelihood(people_seek_to_connect_with_influential_individuals_when_they_have_a_strong_desire_for_someone_and_it_has, 1).
rule_type(people_seek_to_connect_with_influential_individuals_when_they_have_a_strong_desire_for_someone_and_it_has, volition).
% People seek to connect with influential individuals when they have a strong desire for someone and it has
rule_active(people_seek_to_connect_with_influential_individuals_when_they_have_a_strong_desi).
rule_category(people_seek_to_connect_with_influential_individuals_when_they_have_a_strong_desi, dominance_power).
rule_source(people_seek_to_connect_with_influential_individuals_when_they_have_a_strong_desi, ensemble).
rule_priority(people_seek_to_connect_with_influential_individuals_when_they_have_a_strong_desi, 2).
rule_applies(people_seek_to_connect_with_influential_individuals_when_they_have_a_strong_desi, X, Z) :-
    network(X, Z, antagonism, Antagonism_val), Antagonism_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_seek_to_connect_with_influential_individuals_when_they_have_a_strong_desi, set_intent(X, candid, Y, 2)).


rule_likelihood(people_desire_to_connect_with_influential_individuals_when_they_have_a_strong_interest_in_someone_and_it_has, 1).
rule_type(people_desire_to_connect_with_influential_individuals_when_they_have_a_strong_interest_in_someone_and_it_has, volition).
% People desire to connect with influential individuals when they have a strong interest in someone and it has
rule_active(people_desire_to_connect_with_influential_individuals_when_they_have_a_strong_in).
rule_category(people_desire_to_connect_with_influential_individuals_when_they_have_a_strong_in, dominance_power).
rule_source(people_desire_to_connect_with_influential_individuals_when_they_have_a_strong_in, ensemble).
rule_priority(people_desire_to_connect_with_influential_individuals_when_they_have_a_strong_in, 1).
rule_applies(people_desire_to_connect_with_influential_individuals_when_they_have_a_strong_in, X, Z) :-
    network(X, Z, antagonism, Antagonism_val), Antagonism_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_desire_to_connect_with_influential_individuals_when_they_have_a_strong_in, set_intent(X, candid, Y, 1)).


rule_likelihood(people_seek_proximity_to_influential_individuals_for_personal_growth_and_connections, 1).
rule_type(people_seek_proximity_to_influential_individuals_for_personal_growth_and_connections, volition).
% People seek proximity to influential individuals for personal growth and connections.
rule_active(people_seek_proximity_to_influential_individuals_for_personal_growth_and_connect).
rule_category(people_seek_proximity_to_influential_individuals_for_personal_growth_and_connect, dominance_power).
rule_source(people_seek_proximity_to_influential_individuals_for_personal_growth_and_connect, ensemble).
rule_priority(people_seek_proximity_to_influential_individuals_for_personal_growth_and_connect, 5).
rule_applies(people_seek_proximity_to_influential_individuals_for_personal_growth_and_connect, X, Y) :-
    network(X, Y, familial, Familial_val), Familial_val > 6.
rule_effect(people_seek_proximity_to_influential_individuals_for_personal_growth_and_connect, set_intent(X, favor, Y, 5)).


rule_likelihood(people_are_inclined_to_strengthen_their_connections_with_influential_individuals_and_seek_companionship_from_those, 1).
rule_type(people_are_inclined_to_strengthen_their_connections_with_influential_individuals_and_seek_companionship_from_those, volition).
% People are inclined to strengthen their connections with influential individuals and seek companionship from those
rule_active(people_are_inclined_to_strengthen_their_connections_with_influential_individuals).
rule_category(people_are_inclined_to_strengthen_their_connections_with_influential_individuals, dominance_power).
rule_source(people_are_inclined_to_strengthen_their_connections_with_influential_individuals, ensemble).
rule_priority(people_are_inclined_to_strengthen_their_connections_with_influential_individuals, 2).
rule_applies(people_are_inclined_to_strengthen_their_connections_with_influential_individuals, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    network(Y, Z, friendship, Friendship_val), Friendship_val > 6.
rule_effect(people_are_inclined_to_strengthen_their_connections_with_influential_individuals, set_intent(X, favor, Y, 2)).


rule_likelihood(people_are_inclined_to_seek_connections_with_influential_individuals_and_their_romantic_interests, 1).
rule_type(people_are_inclined_to_seek_connections_with_influential_individuals_and_their_romantic_interests, volition).
% People are inclined to seek connections with influential individuals and their romantic interests.
rule_active(people_are_inclined_to_seek_connections_with_influential_individuals_and_their_r).
rule_category(people_are_inclined_to_seek_connections_with_influential_individuals_and_their_r, dominance_power).
rule_source(people_are_inclined_to_seek_connections_with_influential_individuals_and_their_r, ensemble).
rule_priority(people_are_inclined_to_seek_connections_with_influential_individuals_and_their_r, 3).
rule_applies(people_are_inclined_to_seek_connections_with_influential_individuals_and_their_r, X, Z) :-
    network(X, Z, romance, Romance_val), Romance_val > 6,
    network(Y, Z, romance, Romance_val), Romance_val > 6.
rule_effect(people_are_inclined_to_seek_connections_with_influential_individuals_and_their_r, set_intent(X, favor, Y, -3)).


rule_likelihood(people_desire_to_associate_with_those_they_perceive_as_more_influential_or_popular_than_themselves, 1).
rule_type(people_desire_to_associate_with_those_they_perceive_as_more_influential_or_popular_than_themselves, volition).
% People desire to associate with those they perceive as more influential or popular than themselves.
rule_active(people_desire_to_associate_with_those_they_perceive_as_more_influential_or_popul).
rule_category(people_desire_to_associate_with_those_they_perceive_as_more_influential_or_popul, dominance_power).
rule_source(people_desire_to_associate_with_those_they_perceive_as_more_influential_or_popul, ensemble).
rule_priority(people_desire_to_associate_with_those_they_perceive_as_more_influential_or_popul, 1).
rule_applies(people_desire_to_associate_with_those_they_perceive_as_more_influential_or_popul, X, Z) :-
    network(X, Z, antagonism, Antagonism_val), Antagonism_val > 6,
    network(Y, Z, antagonism, Antagonism_val), Antagonism_val > 6.
rule_effect(people_desire_to_associate_with_those_they_perceive_as_more_influential_or_popul, set_intent(X, favor, Y, 1)).


rule_likelihood(people_seek_to_form_friendships_with_influential_individuals_and_have_positive_interactions_within_a_short_timeframe, 1).
rule_type(people_seek_to_form_friendships_with_influential_individuals_and_have_positive_interactions_within_a_short_timeframe, volition).
% People seek to form friendships with influential individuals and have positive interactions within a short timeframe
rule_active(people_seek_to_form_friendships_with_influential_individuals_and_have_positive_i).
rule_category(people_seek_to_form_friendships_with_influential_individuals_and_have_positive_i, dominance_power).
rule_source(people_seek_to_form_friendships_with_influential_individuals_and_have_positive_i, ensemble).
rule_priority(people_seek_to_form_friendships_with_influential_individuals_and_have_positive_i, 1).
rule_applies(people_seek_to_form_friendships_with_influential_individuals_and_have_positive_i, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    event(Y, Z, nice, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_seek_to_form_friendships_with_influential_individuals_and_have_positive_i, set_intent(X, favor, Y, 1)).


rule_likelihood(people_seek_closer_friendships_with_influential_individuals_and_prioritize_dating_their_crushes, 1).
rule_type(people_seek_closer_friendships_with_influential_individuals_and_prioritize_dating_their_crushes, volition).
% People seek closer friendships with influential individuals and prioritize dating their crushes
rule_active(people_seek_closer_friendships_with_influential_individuals_and_prioritize_datin).
rule_category(people_seek_closer_friendships_with_influential_individuals_and_prioritize_datin, dominance_power).
rule_source(people_seek_closer_friendships_with_influential_individuals_and_prioritize_datin, ensemble).
rule_priority(people_seek_closer_friendships_with_influential_individuals_and_prioritize_datin, 3).
rule_applies(people_seek_closer_friendships_with_influential_individuals_and_prioritize_datin, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_seek_closer_friendships_with_influential_individuals_and_prioritize_datin, set_intent(X, favor, Y, -3)).


rule_likelihood(people_seek_to_deepen_connections_with_influential_individuals_when_they_have_had_meaningful_interactions_within_the, 1).
rule_type(people_seek_to_deepen_connections_with_influential_individuals_when_they_have_had_meaningful_interactions_within_the, volition).
% People seek to deepen connections with influential individuals when they have had meaningful interactions within the
rule_active(people_seek_to_deepen_connections_with_influential_individuals_when_they_have_ha).
rule_category(people_seek_to_deepen_connections_with_influential_individuals_when_they_have_ha, dominance_power).
rule_source(people_seek_to_deepen_connections_with_influential_individuals_when_they_have_ha, ensemble).
rule_priority(people_seek_to_deepen_connections_with_influential_individuals_when_they_have_ha, 1).
rule_applies(people_seek_to_deepen_connections_with_influential_individuals_when_they_have_ha, X, Z) :-
    network(X, Z, romance, Romance_val), Romance_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 31, TurnsAgo =< 9999.
rule_effect(people_seek_to_deepen_connections_with_influential_individuals_when_they_have_ha, set_intent(X, favor, Y, -1)).


rule_likelihood(people_tend_to_seek_closer_relationships_with_influential_individuals_and_have_a_strong_desire_for_their_crush, 1).
rule_type(people_tend_to_seek_closer_relationships_with_influential_individuals_and_have_a_strong_desire_for_their_crush, volition).
% People tend to seek closer relationships with influential individuals and have a strong desire for their crush
rule_active(people_tend_to_seek_closer_relationships_with_influential_individuals_and_have_a).
rule_category(people_tend_to_seek_closer_relationships_with_influential_individuals_and_have_a, dominance_power).
rule_source(people_tend_to_seek_closer_relationships_with_influential_individuals_and_have_a, ensemble).
rule_priority(people_tend_to_seek_closer_relationships_with_influential_individuals_and_have_a, 5).
rule_applies(people_tend_to_seek_closer_relationships_with_influential_individuals_and_have_a, X, Z) :-
    network(X, Z, familial, Familial_val), Familial_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_tend_to_seek_closer_relationships_with_influential_individuals_and_have_a, set_intent(X, favor, Y, -5)).


rule_likelihood(people_seek_closer_connections_with_influential_individuals_and_have_a_strong_inclination_to_date_their_crush, 1).
rule_type(people_seek_closer_connections_with_influential_individuals_and_have_a_strong_inclination_to_date_their_crush, volition).
% People seek closer connections with influential individuals and have a strong inclination to date their crush
rule_active(people_seek_closer_connections_with_influential_individuals_and_have_a_strong_in).
rule_category(people_seek_closer_connections_with_influential_individuals_and_have_a_strong_in, dominance_power).
rule_source(people_seek_closer_connections_with_influential_individuals_and_have_a_strong_in, ensemble).
rule_priority(people_seek_closer_connections_with_influential_individuals_and_have_a_strong_in, 3).
rule_applies(people_seek_closer_connections_with_influential_individuals_and_have_a_strong_in, X, Z) :-
    network(X, Z, familial, Familial_val), Familial_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_seek_closer_connections_with_influential_individuals_and_have_a_strong_in, set_intent(X, favor, Y, -3)).


rule_likelihood(people_desire_to_connect_with_influential_individuals_and_are_inclined_towards_dating_their_crushes, 1).
rule_type(people_desire_to_connect_with_influential_individuals_and_are_inclined_towards_dating_their_crushes, volition).
% People desire to connect with influential individuals and are inclined towards dating their crushes
rule_active(people_desire_to_connect_with_influential_individuals_and_are_inclined_towards_d).
rule_category(people_desire_to_connect_with_influential_individuals_and_are_inclined_towards_d, dominance_power).
rule_source(people_desire_to_connect_with_influential_individuals_and_are_inclined_towards_d, ensemble).
rule_priority(people_desire_to_connect_with_influential_individuals_and_are_inclined_towards_d, 2).
rule_applies(people_desire_to_connect_with_influential_individuals_and_are_inclined_towards_d, X, Z) :-
    network(X, Z, antagonism, Antagonism_val), Antagonism_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_desire_to_connect_with_influential_individuals_and_are_inclined_towards_d, set_intent(X, favor, Y, 2)).


rule_likelihood(people_may_seek_to_improve_their_social_standing_by_associating_with_influential_individuals_when_they_have_recently, 1).
rule_type(people_may_seek_to_improve_their_social_standing_by_associating_with_influential_individuals_when_they_have_recently, volition).
% People may seek to improve their social standing by associating with influential individuals when they have recently
rule_active(people_may_seek_to_improve_their_social_standing_by_associating_with_influential).
rule_category(people_may_seek_to_improve_their_social_standing_by_associating_with_influential, dominance_power).
rule_source(people_may_seek_to_improve_their_social_standing_by_associating_with_influential, ensemble).
rule_priority(people_may_seek_to_improve_their_social_standing_by_associating_with_influential, 1).
rule_applies(people_may_seek_to_improve_their_social_standing_by_associating_with_influential, X, Z) :-
    network(X, Z, antagonism, Antagonism_val), Antagonism_val > 6,
    event(Y, Y, did_a_favor_for, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_may_seek_to_improve_their_social_standing_by_associating_with_influential, set_intent(X, favor, Y, -1)).


rule_likelihood(people_desire_to_associate_with_influential_individuals_for_personal_growth_and_respect, 1).
rule_type(people_desire_to_associate_with_influential_individuals_for_personal_growth_and_respect, volition).
% People desire to associate with influential individuals for personal growth and respect.
rule_active(people_desire_to_associate_with_influential_individuals_for_personal_growth_and).
rule_category(people_desire_to_associate_with_influential_individuals_for_personal_growth_and, dominance_power).
rule_source(people_desire_to_associate_with_influential_individuals_for_personal_growth_and, ensemble).
rule_priority(people_desire_to_associate_with_influential_individuals_for_personal_growth_and, 1).
rule_applies(people_desire_to_associate_with_influential_individuals_for_personal_growth_and, X, Y) :-
    directed_status(X, Y, public_friends).
rule_effect(people_desire_to_associate_with_influential_individuals_for_personal_growth_and, set_intent(X, honor, Y, 1)).


rule_likelihood(people_desire_to_pursue_relationships_with_individuals_they_perceive_as_more_influential_or_popular, 1).
rule_type(people_desire_to_pursue_relationships_with_individuals_they_perceive_as_more_influential_or_popular, volition).
% People desire to pursue relationships with individuals they perceive as more influential or popular.
rule_active(people_desire_to_pursue_relationships_with_individuals_they_perceive_as_more_inf).
rule_category(people_desire_to_pursue_relationships_with_individuals_they_perceive_as_more_inf, dominance_power).
rule_source(people_desire_to_pursue_relationships_with_individuals_they_perceive_as_more_inf, ensemble).
rule_priority(people_desire_to_pursue_relationships_with_individuals_they_perceive_as_more_inf, 1).
rule_applies(people_desire_to_pursue_relationships_with_individuals_they_perceive_as_more_inf, X, Y) :-
    network(X, Y, romance, Romance_val), Romance_val > 6.
rule_effect(people_desire_to_pursue_relationships_with_individuals_they_perceive_as_more_inf, set_intent(X, honor, Y, 1)).


rule_likelihood(people_desire_to_associate_with_influential_individuals_despite_existing_rivalries, 1).
rule_type(people_desire_to_associate_with_influential_individuals_despite_existing_rivalries, volition).
% People desire to associate with influential individuals despite existing rivalries.
rule_active(people_desire_to_associate_with_influential_individuals_despite_existing_rivalri).
rule_category(people_desire_to_associate_with_influential_individuals_despite_existing_rivalri, dominance_power).
rule_source(people_desire_to_associate_with_influential_individuals_despite_existing_rivalri, ensemble).
rule_priority(people_desire_to_associate_with_influential_individuals_despite_existing_rivalri, 1).
rule_applies(people_desire_to_associate_with_influential_individuals_despite_existing_rivalri, X, Y) :-
    network(X, Y, antagonism, Antagonism_val), Antagonism_val > 6.
rule_effect(people_desire_to_associate_with_influential_individuals_despite_existing_rivalri, set_intent(X, honor, Y, -1)).


rule_likelihood(people_seek_to_associate_with_influential_individuals_despite_their_initial_discomfort, 1).
rule_type(people_seek_to_associate_with_influential_individuals_despite_their_initial_discomfort, volition).
% People seek to associate with influential individuals despite their initial discomfort.
rule_active(people_seek_to_associate_with_influential_individuals_despite_their_initial_disc).
rule_category(people_seek_to_associate_with_influential_individuals_despite_their_initial_disc, dominance_power).
rule_source(people_seek_to_associate_with_influential_individuals_despite_their_initial_disc, ensemble).
rule_priority(people_seek_to_associate_with_influential_individuals_despite_their_initial_disc, 2).
rule_applies(people_seek_to_associate_with_influential_individuals_despite_their_initial_disc, X, Y) :-
    event(X, Y, mean, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_seek_to_associate_with_influential_individuals_despite_their_initial_disc, set_intent(X, honor, Y, -2)).


rule_likelihood(people_seek_companionship_with_influential_individuals_to_gain_respect_and_admiration, 1).
rule_type(people_seek_companionship_with_influential_individuals_to_gain_respect_and_admiration, volition).
% People seek companionship with influential individuals to gain respect and admiration.
rule_active(people_seek_companionship_with_influential_individuals_to_gain_respect_and_admir).
rule_category(people_seek_companionship_with_influential_individuals_to_gain_respect_and_admir, dominance_power).
rule_source(people_seek_companionship_with_influential_individuals_to_gain_respect_and_admir, ensemble).
rule_priority(people_seek_companionship_with_influential_individuals_to_gain_respect_and_admir, 1).
rule_applies(people_seek_companionship_with_influential_individuals_to_gain_respect_and_admir, X, Y) :-
    event(X, Y, mean, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_seek_companionship_with_influential_individuals_to_gain_respect_and_admir, set_intent(X, honor, Y, -1)).


rule_likelihood(people_desire_to_strengthen_connections_with_influential_individuals_in_their_network, 1).
rule_type(people_desire_to_strengthen_connections_with_influential_individuals_in_their_network, volition).
% People desire to strengthen connections with influential individuals in their network.
rule_active(people_desire_to_strengthen_connections_with_influential_individuals_in_their_ne).
rule_category(people_desire_to_strengthen_connections_with_influential_individuals_in_their_ne, dominance_power).
rule_source(people_desire_to_strengthen_connections_with_influential_individuals_in_their_ne, ensemble).
rule_priority(people_desire_to_strengthen_connections_with_influential_individuals_in_their_ne, 1).
rule_applies(people_desire_to_strengthen_connections_with_influential_individuals_in_their_ne, X, Z) :-
    network(X, Z, familial, Familial_val), Familial_val > 6,
    network(Y, Z, familial, Familial_val), Familial_val > 6.
rule_effect(people_desire_to_strengthen_connections_with_influential_individuals_in_their_ne, set_intent(X, honor, Y, 1)).


rule_likelihood(people_seek_to_strengthen_friendships_with_influential_individuals_within_a_short_timeframe_after_showing_interest, 1).
rule_type(people_seek_to_strengthen_friendships_with_influential_individuals_within_a_short_timeframe_after_showing_interest, volition).
% People seek to strengthen friendships with influential individuals within a short timeframe after showing interest
rule_active(people_seek_to_strengthen_friendships_with_influential_individuals_within_a_shor).
rule_category(people_seek_to_strengthen_friendships_with_influential_individuals_within_a_shor, dominance_power).
rule_source(people_seek_to_strengthen_friendships_with_influential_individuals_within_a_shor, ensemble).
rule_priority(people_seek_to_strengthen_friendships_with_influential_individuals_within_a_shor, 3).
rule_applies(people_seek_to_strengthen_friendships_with_influential_individuals_within_a_shor, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_seek_to_strengthen_friendships_with_influential_individuals_within_a_shor, set_intent(X, honor, Y, -3)).


rule_likelihood(people_desire_to_strengthen_friendships_with_influential_individuals_and_prioritize_dating_their_cr, 1).
rule_type(people_desire_to_strengthen_friendships_with_influential_individuals_and_prioritize_dating_their_cr, volition).
% People desire to strengthen friendships with influential individuals and prioritize dating their cr
rule_active(people_desire_to_strengthen_friendships_with_influential_individuals_and_priorit).
rule_category(people_desire_to_strengthen_friendships_with_influential_individuals_and_priorit, dominance_power).
rule_source(people_desire_to_strengthen_friendships_with_influential_individuals_and_priorit, ensemble).
rule_priority(people_desire_to_strengthen_friendships_with_influential_individuals_and_priorit, 1).
rule_applies(people_desire_to_strengthen_friendships_with_influential_individuals_and_priorit, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 31, TurnsAgo =< 9999.
rule_effect(people_desire_to_strengthen_friendships_with_influential_individuals_and_priorit, set_intent(X, honor, Y, -1)).


rule_likelihood(people_s_desire_to_strengthen_connections_with_influential_individuals_decreases_over_time_if_they_haven, 1).
rule_type(people_s_desire_to_strengthen_connections_with_influential_individuals_decreases_over_time_if_they_haven, volition).
% People’s desire to strengthen connections with influential individuals decreases over time if they haven
rule_active(people_s_desire_to_strengthen_connections_with_influential_individuals_decreases).
rule_category(people_s_desire_to_strengthen_connections_with_influential_individuals_decreases, dominance_power).
rule_source(people_s_desire_to_strengthen_connections_with_influential_individuals_decreases, ensemble).
rule_priority(people_s_desire_to_strengthen_connections_with_influential_individuals_decreases, 3).
rule_applies(people_s_desire_to_strengthen_connections_with_influential_individuals_decreases, X, Z) :-
    network(X, Z, romance, Romance_val), Romance_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_s_desire_to_strengthen_connections_with_influential_individuals_decreases, set_intent(X, honor, Y, -3)).


rule_likelihood(people_desire_to_connect_with_influential_individuals_and_have_a_strong_interest_in_their_crush_within_the, 1).
rule_type(people_desire_to_connect_with_influential_individuals_and_have_a_strong_interest_in_their_crush_within_the, volition).
% People desire to connect with influential individuals and have a strong interest in their crush within the
rule_active(people_desire_to_connect_with_influential_individuals_and_have_a_strong_interest).
rule_category(people_desire_to_connect_with_influential_individuals_and_have_a_strong_interest, dominance_power).
rule_source(people_desire_to_connect_with_influential_individuals_and_have_a_strong_interest, ensemble).
rule_priority(people_desire_to_connect_with_influential_individuals_and_have_a_strong_interest, 2).
rule_applies(people_desire_to_connect_with_influential_individuals_and_have_a_strong_interest, X, Z) :-
    network(X, Z, familial, Familial_val), Familial_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_desire_to_connect_with_influential_individuals_and_have_a_strong_interest, set_intent(X, kind, Y, -2)).


rule_likelihood(people_seek_romantic_connections_with_influential_individuals_when_they_have_been_consistently_interested_in_their_cr, 1).
rule_type(people_seek_romantic_connections_with_influential_individuals_when_they_have_been_consistently_interested_in_their_cr, volition).
% People seek romantic connections with influential individuals when they have been consistently interested in their cr
rule_active(people_seek_romantic_connections_with_influential_individuals_when_they_have_bee).
rule_category(people_seek_romantic_connections_with_influential_individuals_when_they_have_bee, dominance_power).
rule_source(people_seek_romantic_connections_with_influential_individuals_when_they_have_bee, ensemble).
rule_priority(people_seek_romantic_connections_with_influential_individuals_when_they_have_bee, 1).
rule_applies(people_seek_romantic_connections_with_influential_individuals_when_they_have_bee, X, Z) :-
    network(X, Z, romance, Romance_val), Romance_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 31, TurnsAgo =< 9999.
rule_effect(people_seek_romantic_connections_with_influential_individuals_when_they_have_bee, set_intent(X, honor, Y, -1)).


rule_likelihood(people_aim_to_strengthen_connections_with_influential_individuals_and_prioritize_dating_their_crush, 1).
rule_type(people_aim_to_strengthen_connections_with_influential_individuals_and_prioritize_dating_their_crush, volition).
% People aim to strengthen connections with influential individuals and prioritize dating their crush
rule_active(people_aim_to_strengthen_connections_with_influential_individuals_and_prioritize).
rule_category(people_aim_to_strengthen_connections_with_influential_individuals_and_prioritize, dominance_power).
rule_source(people_aim_to_strengthen_connections_with_influential_individuals_and_prioritize, ensemble).
rule_priority(people_aim_to_strengthen_connections_with_influential_individuals_and_prioritize, 3).
rule_applies(people_aim_to_strengthen_connections_with_influential_individuals_and_prioritize, X, Z) :-
    network(X, Z, familial, Familial_val), Familial_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_aim_to_strengthen_connections_with_influential_individuals_and_prioritize, set_intent(X, honor, Y, -3)).


rule_likelihood(people_aim_to_strengthen_familial_ties_with_influential_individuals_and_prioritize_honoring, 1).
rule_type(people_aim_to_strengthen_familial_ties_with_influential_individuals_and_prioritize_honoring, volition).
% People aim to strengthen familial ties with influential individuals and prioritize honoring
rule_active(people_aim_to_strengthen_familial_ties_with_influential_individuals_and_prioriti).
rule_category(people_aim_to_strengthen_familial_ties_with_influential_individuals_and_prioriti, dominance_power).
rule_source(people_aim_to_strengthen_familial_ties_with_influential_individuals_and_prioriti, ensemble).
rule_priority(people_aim_to_strengthen_familial_ties_with_influential_individuals_and_prioriti, 2).
rule_applies(people_aim_to_strengthen_familial_ties_with_influential_individuals_and_prioriti, X, Z) :-
    network(X, Z, familial, Familial_val), Familial_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_aim_to_strengthen_familial_ties_with_influential_individuals_and_prioriti, set_intent(X, honor, Y, -2)).


rule_likelihood(people_seek_to_ingratiate_themselves_with_influential_individuals_through_public_friendships, 1).
rule_type(people_seek_to_ingratiate_themselves_with_influential_individuals_through_public_friendships, volition).
% People seek to ingratiate themselves with influential individuals through public friendships.
rule_active(people_seek_to_ingratiate_themselves_with_influential_individuals_through_public).
rule_category(people_seek_to_ingratiate_themselves_with_influential_individuals_through_public, dominance_power).
rule_source(people_seek_to_ingratiate_themselves_with_influential_individuals_through_public, ensemble).
rule_priority(people_seek_to_ingratiate_themselves_with_influential_individuals_through_public, 1).
rule_applies(people_seek_to_ingratiate_themselves_with_influential_individuals_through_public, X, Y) :-
    directed_status(X, Y, public_friends).
rule_effect(people_seek_to_ingratiate_themselves_with_influential_individuals_through_public, set_intent(X, ingratiate, Y, 1)).


rule_likelihood(people_seek_connections_with_influential_individuals_within_their_extended_network, 1).
rule_type(people_seek_connections_with_influential_individuals_within_their_extended_network, volition).
% People seek connections with influential individuals within their extended network.
rule_active(people_seek_connections_with_influential_individuals_within_their_extended_netwo).
rule_category(people_seek_connections_with_influential_individuals_within_their_extended_netwo, dominance_power).
rule_source(people_seek_connections_with_influential_individuals_within_their_extended_netwo, ensemble).
rule_priority(people_seek_connections_with_influential_individuals_within_their_extended_netwo, 2).
rule_applies(people_seek_connections_with_influential_individuals_within_their_extended_netwo, X, Y) :-
    network(X, Y, familial, Familial_val), Familial_val > 6.
rule_effect(people_seek_connections_with_influential_individuals_within_their_extended_netwo, set_intent(X, kind, Y, 2)).


rule_likelihood(people_desire_to_associate_with_influential_individuals_and_develop_romantic_interests_in_their_crushes, 1).
rule_type(people_desire_to_associate_with_influential_individuals_and_develop_romantic_interests_in_their_crushes, volition).
% People desire to associate with influential individuals and develop romantic interests in their crushes.
rule_active(people_desire_to_associate_with_influential_individuals_and_develop_romantic_int).
rule_category(people_desire_to_associate_with_influential_individuals_and_develop_romantic_int, dominance_power).
rule_source(people_desire_to_associate_with_influential_individuals_and_develop_romantic_int, ensemble).
rule_priority(people_desire_to_associate_with_influential_individuals_and_develop_romantic_int, 2).
rule_applies(people_desire_to_associate_with_influential_individuals_and_develop_romantic_int, X, Y) :-
    event(X, Y, nice, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_desire_to_associate_with_influential_individuals_and_develop_romantic_int, set_intent(X, kind, Y, 2)).


rule_likelihood(people_seek_to_form_friendships_with_influential_individuals_and_have_recently_experienced_positive_social_interactions, 1).
rule_type(people_seek_to_form_friendships_with_influential_individuals_and_have_recently_experienced_positive_social_interactions, volition).
% People seek to form friendships with influential individuals and have recently experienced positive social interactions.
rule_active(people_seek_to_form_friendships_with_influential_individuals_and_have_recently_e).
rule_category(people_seek_to_form_friendships_with_influential_individuals_and_have_recently_e, dominance_power).
rule_source(people_seek_to_form_friendships_with_influential_individuals_and_have_recently_e, ensemble).
rule_priority(people_seek_to_form_friendships_with_influential_individuals_and_have_recently_e, 2).
rule_applies(people_seek_to_form_friendships_with_influential_individuals_and_have_recently_e, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    event(Y, Z, nice, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_seek_to_form_friendships_with_influential_individuals_and_have_recently_e, set_intent(X, kind, Y, 2)).


rule_likelihood(people_tend_to_seek_closer_friendships_with_influential_individuals_and_have_a_recent_interest_in_dating, 1).
rule_type(people_tend_to_seek_closer_friendships_with_influential_individuals_and_have_a_recent_interest_in_dating, volition).
% People tend to seek closer friendships with influential individuals and have a recent interest in dating
rule_active(people_tend_to_seek_closer_friendships_with_influential_individuals_and_have_a_r).
rule_category(people_tend_to_seek_closer_friendships_with_influential_individuals_and_have_a_r, dominance_power).
rule_source(people_tend_to_seek_closer_friendships_with_influential_individuals_and_have_a_r, ensemble).
rule_priority(people_tend_to_seek_closer_friendships_with_influential_individuals_and_have_a_r, 3).
rule_applies(people_tend_to_seek_closer_friendships_with_influential_individuals_and_have_a_r, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_tend_to_seek_closer_friendships_with_influential_individuals_and_have_a_r, set_intent(X, kind, Y, -3)).


rule_likelihood(people_seek_to_strengthen_connections_with_influential_individuals_and_prioritize_recent_interactions_over_older_ones, 1).
rule_type(people_seek_to_strengthen_connections_with_influential_individuals_and_prioritize_recent_interactions_over_older_ones, volition).
% People seek to strengthen connections with influential individuals and prioritize recent interactions over older ones
rule_active(people_seek_to_strengthen_connections_with_influential_individuals_and_prioritiz).
rule_category(people_seek_to_strengthen_connections_with_influential_individuals_and_prioritiz, dominance_power).
rule_source(people_seek_to_strengthen_connections_with_influential_individuals_and_prioritiz, ensemble).
rule_priority(people_seek_to_strengthen_connections_with_influential_individuals_and_prioritiz, 2).
rule_applies(people_seek_to_strengthen_connections_with_influential_individuals_and_prioritiz, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_seek_to_strengthen_connections_with_influential_individuals_and_prioritiz, set_intent(X, kind, Y, -2)).


rule_likelihood(people_desire_to_form_closer_relationships_with_influential_individuals_when_they_have_a_strong_romantic_interest_in, 1).
rule_type(people_desire_to_form_closer_relationships_with_influential_individuals_when_they_have_a_strong_romantic_interest_in, volition).
% People desire to form closer relationships with influential individuals when they have a strong romantic interest in
rule_active(people_desire_to_form_closer_relationships_with_influential_individuals_when_the).
rule_category(people_desire_to_form_closer_relationships_with_influential_individuals_when_the, dominance_power).
rule_source(people_desire_to_form_closer_relationships_with_influential_individuals_when_the, ensemble).
rule_priority(people_desire_to_form_closer_relationships_with_influential_individuals_when_the, 3).
rule_applies(people_desire_to_form_closer_relationships_with_influential_individuals_when_the, X, Z) :-
    network(X, Z, romance, Romance_val), Romance_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_desire_to_form_closer_relationships_with_influential_individuals_when_the, set_intent(X, kind, Y, -3)).


rule_likelihood(people_seek_romantic_connections_with_influential_individuals_and_have_a_strong_interest_in_their_crush_within, 1).
rule_type(people_seek_romantic_connections_with_influential_individuals_and_have_a_strong_interest_in_their_crush_within, volition).
% People seek romantic connections with influential individuals and have a strong interest in their crush within
rule_active(people_seek_romantic_connections_with_influential_individuals_and_have_a_strong).
rule_category(people_seek_romantic_connections_with_influential_individuals_and_have_a_strong, dominance_power).
rule_source(people_seek_romantic_connections_with_influential_individuals_and_have_a_strong, ensemble).
rule_priority(people_seek_romantic_connections_with_influential_individuals_and_have_a_strong, 1).
rule_applies(people_seek_romantic_connections_with_influential_individuals_and_have_a_strong, X, Z) :-
    network(X, Z, romance, Romance_val), Romance_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 31, TurnsAgo =< 9999.
rule_effect(people_seek_romantic_connections_with_influential_individuals_and_have_a_strong, set_intent(X, kind, Y, -1)).


rule_likelihood(people_desire_to_form_closer_bonds_with_influential_individuals_and_have_a_positive_intent_towards_dating, 1).
rule_type(people_desire_to_form_closer_bonds_with_influential_individuals_and_have_a_positive_intent_towards_dating, volition).
% People desire to form closer bonds with influential individuals and have a positive intent towards dating
rule_active(people_desire_to_form_closer_bonds_with_influential_individuals_and_have_a_posit).
rule_category(people_desire_to_form_closer_bonds_with_influential_individuals_and_have_a_posit, dominance_power).
rule_source(people_desire_to_form_closer_bonds_with_influential_individuals_and_have_a_posit, ensemble).
rule_priority(people_desire_to_form_closer_bonds_with_influential_individuals_and_have_a_posit, 1).
rule_applies(people_desire_to_form_closer_bonds_with_influential_individuals_and_have_a_posit, X, Z) :-
    network(X, Z, familial, Familial_val), Familial_val > 6,
    event(Y, Z, nice, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_desire_to_form_closer_bonds_with_influential_individuals_and_have_a_posit, set_intent(X, kind, Y, 1)).


rule_likelihood(people_seek_closer_connections_with_influential_individuals_when_they_have_had_frequent_interactions_within_the_past_week, 1).
rule_type(people_seek_closer_connections_with_influential_individuals_when_they_have_had_frequent_interactions_within_the_past_week, volition).
% People seek closer connections with influential individuals when they have had frequent interactions within the past week.
rule_active(people_seek_closer_connections_with_influential_individuals_when_they_have_had_f).
rule_category(people_seek_closer_connections_with_influential_individuals_when_they_have_had_f, dominance_power).
rule_source(people_seek_closer_connections_with_influential_individuals_when_they_have_had_f, ensemble).
rule_priority(people_seek_closer_connections_with_influential_individuals_when_they_have_had_f, 3).
rule_applies(people_seek_closer_connections_with_influential_individuals_when_they_have_had_f, X, Z) :-
    network(X, Z, familial, Familial_val), Familial_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_seek_closer_connections_with_influential_individuals_when_they_have_had_f, set_intent(X, kind, Y, -3)).


rule_likelihood(people_seek_to_form_closer_bonds_with_influential_individuals_within_a_year_of_noticing_their_cr, 1).
rule_type(people_seek_to_form_closer_bonds_with_influential_individuals_within_a_year_of_noticing_their_cr, volition).
% People seek to form closer bonds with influential individuals within a year of noticing their cr
rule_active(people_seek_to_form_closer_bonds_with_influential_individuals_within_a_year_of_n).
rule_category(people_seek_to_form_closer_bonds_with_influential_individuals_within_a_year_of_n, dominance_power).
rule_source(people_seek_to_form_closer_bonds_with_influential_individuals_within_a_year_of_n, ensemble).
rule_priority(people_seek_to_form_closer_bonds_with_influential_individuals_within_a_year_of_n, 1).
rule_applies(people_seek_to_form_closer_bonds_with_influential_individuals_within_a_year_of_n, X, Z) :-
    network(X, Z, familial, Familial_val), Familial_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 31, TurnsAgo =< 9999.
rule_effect(people_seek_to_form_closer_bonds_with_influential_individuals_within_a_year_of_n, set_intent(X, kind, Y, -1)).


rule_likelihood(people_desire_to_be_in_closer_proximity_with_influential_individuals_than_their_current_connections, 1).
rule_type(people_desire_to_be_in_closer_proximity_with_influential_individuals_than_their_current_connections, volition).
% People desire to be in closer proximity with influential individuals than their current connections.
rule_active(people_desire_to_be_in_closer_proximity_with_influential_individuals_than_their).
rule_category(people_desire_to_be_in_closer_proximity_with_influential_individuals_than_their, dominance_power).
rule_source(people_desire_to_be_in_closer_proximity_with_influential_individuals_than_their, ensemble).
rule_priority(people_desire_to_be_in_closer_proximity_with_influential_individuals_than_their, 5).
rule_applies(people_desire_to_be_in_closer_proximity_with_influential_individuals_than_their, X, Y) :-
    network(X, Y, romance, Romance_val), Romance_val < 4.
rule_effect(people_desire_to_be_in_closer_proximity_with_influential_individuals_than_their, set_intent(X, romance, Y, -5)).


rule_likelihood(people_seeking_to_deepen_connections_with_influential_individuals_and_having_a_strong_romantic_interest_in_their, 1).
rule_type(people_seeking_to_deepen_connections_with_influential_individuals_and_having_a_strong_romantic_interest_in_their, volition).
% People seeking to deepen connections with influential individuals and having a strong romantic interest in their
rule_active(people_seeking_to_deepen_connections_with_influential_individuals_and_having_a_s).
rule_category(people_seeking_to_deepen_connections_with_influential_individuals_and_having_a_s, dominance_power).
rule_source(people_seeking_to_deepen_connections_with_influential_individuals_and_having_a_s, ensemble).
rule_priority(people_seeking_to_deepen_connections_with_influential_individuals_and_having_a_s, 2).
rule_applies(people_seeking_to_deepen_connections_with_influential_individuals_and_having_a_s, X, Z) :-
    network(X, Z, familial, Familial_val), Familial_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_seeking_to_deepen_connections_with_influential_individuals_and_having_a_s, set_intent(X, romance, Y, -2)).


rule_likelihood(people_seek_closer_connections_with_influential_individuals_to_increase_trust_levels_in_their_relationships, 1).
rule_type(people_seek_closer_connections_with_influential_individuals_to_increase_trust_levels_in_their_relationships, volition).
% People seek closer connections with influential individuals to increase trust levels in their relationships.
rule_active(people_seek_closer_connections_with_influential_individuals_to_increase_trust_le).
rule_category(people_seek_closer_connections_with_influential_individuals_to_increase_trust_le, dominance_power).
rule_source(people_seek_closer_connections_with_influential_individuals_to_increase_trust_le, ensemble).
rule_priority(people_seek_closer_connections_with_influential_individuals_to_increase_trust_le, 3).
rule_applies(people_seek_closer_connections_with_influential_individuals_to_increase_trust_le, X, Y) :-
    network(X, Y, romance, Romance_val), Romance_val > 6.
rule_effect(people_seek_closer_connections_with_influential_individuals_to_increase_trust_le, set_intent(X, trust, Y, 3)).


rule_likelihood(people_desire_to_strengthen_their_connections_with_influential_individuals_and_seek_trust_in_those_relationships, 1).
rule_type(people_desire_to_strengthen_their_connections_with_influential_individuals_and_seek_trust_in_those_relationships, volition).
% People desire to strengthen their connections with influential individuals and seek trust in those relationships.
rule_active(people_desire_to_strengthen_their_connections_with_influential_individuals_and_s).
rule_category(people_desire_to_strengthen_their_connections_with_influential_individuals_and_s, dominance_power).
rule_source(people_desire_to_strengthen_their_connections_with_influential_individuals_and_s, ensemble).
rule_priority(people_desire_to_strengthen_their_connections_with_influential_individuals_and_s, 3).
rule_applies(people_desire_to_strengthen_their_connections_with_influential_individuals_and_s, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    network(Y, Z, friendship, Friendship_val), Friendship_val > 6.
rule_effect(people_desire_to_strengthen_their_connections_with_influential_individuals_and_s, set_intent(X, trust, Y, 3)).


rule_likelihood(people_s_desire_to_strengthen_friendships_with_influential_individuals_and_recent_positive_interactions_within_the, 1).
rule_type(people_s_desire_to_strengthen_friendships_with_influential_individuals_and_recent_positive_interactions_within_the, volition).
% People’s desire to strengthen friendships with influential individuals and recent positive interactions within the
rule_active(people_s_desire_to_strengthen_friendships_with_influential_individuals_and_recen).
rule_category(people_s_desire_to_strengthen_friendships_with_influential_individuals_and_recen, dominance_power).
rule_source(people_s_desire_to_strengthen_friendships_with_influential_individuals_and_recen, ensemble).
rule_priority(people_s_desire_to_strengthen_friendships_with_influential_individuals_and_recen, 2).
rule_applies(people_s_desire_to_strengthen_friendships_with_influential_individuals_and_recen, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_s_desire_to_strengthen_friendships_with_influential_individuals_and_recen, set_intent(X, trust, Y, -2)).

%% ─── Economics (1 rules) ───


rule_type(economic_hardship_closure, action).
rule_category(economic_hardship_closure, economics).
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(economic_hardship_closure).
rule_priority(economic_hardship_closure, 7).
rule_likelihood(economic_hardship_closure, 0.6).

rule_applies(economic_hardship_closure, Owner, Business) :-
    person(Owner),
    business_owner(Business, Owner),
    business(Business),
    \+ business_out_of_business(Business).

rule_effect(economic_hardship_closure, _, Business, close_business(Business, economic_hardship)).

%% ─── Education (2 rules) ───


rule_type(apprenticeship, action).
rule_category(apprenticeship, education).
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(apprenticeship).
rule_priority(apprenticeship, 5).
rule_likelihood(apprenticeship, 0.25).

rule_applies(apprenticeship, Youth, Master) :-
    person(Youth), person(Master),
    Youth \= Master,
    age(Youth, Age), Age >= 14, Age =< 20,
    \+ occupation(Youth, _),
    occupation(Master, _),
    alive(Youth), alive(Master).

rule_effect(apprenticeship, Youth, Master, start_apprenticeship(Youth, Master)).


rule_type(knowledge_sharing, action).
rule_category(knowledge_sharing, education).
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(knowledge_sharing).
rule_priority(knowledge_sharing, 3).
rule_likelihood(knowledge_sharing, 0.2).

rule_applies(knowledge_sharing, Person1, Person2) :-
    person(Person1), person(Person2),
    Person1 \= Person2,
    friend_of(Person1, Person2),
    alive(Person1), alive(Person2).

rule_effect(knowledge_sharing, Person1, Person2, share_knowledge(Person1, Person2)).

%% ─── Emotional States (2 rules) ───


rule_likelihood(people_desire_to_become_more_candid_with_those_they_are_embarrassed_by_within_a_short_timeframe, 1).
rule_type(people_desire_to_become_more_candid_with_those_they_are_embarrassed_by_within_a_short_timeframe, volition).
% People desire to become more candid with those they are embarrassed by within a short timeframe
rule_active(people_desire_to_become_more_candid_with_those_they_are_embarrassed_by_within_a).
rule_category(people_desire_to_become_more_candid_with_those_they_are_embarrassed_by_within_a, emotional_states).
rule_source(people_desire_to_become_more_candid_with_those_they_are_embarrassed_by_within_a, ensemble).
rule_priority(people_desire_to_become_more_candid_with_those_they_are_embarrassed_by_within_a, 2).
rule_applies(people_desire_to_become_more_candid_with_those_they_are_embarrassed_by_within_a, X, Y) :-
    event(X, Y, embarrassment, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_desire_to_become_more_candid_with_those_they_are_embarrassed_by_within_a, set_intent(X, candid, Y, 2)).


rule_likelihood(people_are_more_rude_to_those_who_have_embarrassed_themself_in_front_of_them_recently, 1).
rule_type(people_are_more_rude_to_those_who_have_embarrassed_themself_in_front_of_them_recently, volition).
% Memory: What a Loser
rule_active(people_are_more_rude_to_those_who_have_embarrassed_themself_in_front_of_them_rec).
rule_category(people_are_more_rude_to_those_who_have_embarrassed_themself_in_front_of_them_rec, emotional_states).
rule_source(people_are_more_rude_to_those_who_have_embarrassed_themself_in_front_of_them_rec, ensemble).
rule_priority(people_are_more_rude_to_those_who_have_embarrassed_themself_in_front_of_them_rec, 2).
rule_applies(people_are_more_rude_to_those_who_have_embarrassed_themself_in_front_of_them_rec, Y, X) :-
    event(Y, X, embarrassment, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_are_more_rude_to_those_who_have_embarrassed_themself_in_front_of_them_rec, set_intent(X, rude, Y, 2)).

%% ─── Employment (3 rules) ───


rule_type(succession_planning, action).
rule_category(succession_planning, employment).
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(succession_planning).
rule_priority(succession_planning, 8).
rule_likelihood(succession_planning, 0.7).

rule_applies(succession_planning, Owner, Child) :-
    person(Owner), person(Child),
    age(Owner, Age), Age > 65,
    business_owner(_, Owner),
    parent_of(Owner, Child),
    age(Child, ChildAge), ChildAge > 25.

rule_effect(succession_planning, Owner, Child, hire(Child, owner)).
rule_effect(succession_planning, Owner, _, retire(Owner)).


rule_type(promote_loyal_employee, action).
rule_category(promote_loyal_employee, employment).
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(promote_loyal_employee).
rule_priority(promote_loyal_employee, 6).
rule_likelihood(promote_loyal_employee, 0.4).

rule_applies(promote_loyal_employee, Person, Business) :-
    person(Person),
    occupation(Person, worker),
    personality(Person, conscientiousness, C), C > 0.3.

rule_effect(promote_loyal_employee, Person, _, promote(Person)).


rule_type(unemployment_job_search, action).
rule_category(unemployment_job_search, employment).
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(unemployment_job_search).
rule_priority(unemployment_job_search, 5).
rule_likelihood(unemployment_job_search, 0.2).

rule_applies(unemployment_job_search, Person, _) :-
    person(Person),
    \+ occupation(Person, _),
    age(Person, Age), Age >= 18, Age =< 65,
    alive(Person).

rule_effect(unemployment_job_search, Person, _, seek_employment(Person)).

%% ─── Environment (2 rules) ───


rule_type(harvest_season, action).
rule_category(harvest_season, environment).
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(harvest_season).
rule_priority(harvest_season, 7).
rule_likelihood(harvest_season, 0.9).

rule_applies(harvest_season, Farmer, _) :-
    person(Farmer),
    occupation(Farmer, farmer),
    alive(Farmer).

rule_effect(harvest_season, Farmer, _, harvest_crops(Farmer)).


rule_type(natural_disaster_response, action).
rule_category(natural_disaster_response, environment).
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(natural_disaster_response).
rule_priority(natural_disaster_response, 10).
rule_likelihood(natural_disaster_response, 1.0).

rule_applies(natural_disaster_response, Settlement, _) :-
    settlement(Settlement),
    settlement_population(Settlement, Pop), Pop > 0.

rule_effect(natural_disaster_response, Settlement, _, organize_relief(Settlement)).

%% ─── Favors Obligations (31 rules) ───


rule_likelihood(people_of_high_social_standing_may_want_less_attention_from_inappropriately_behaved_people_of_lower_social_standing, 1).
rule_type(people_of_high_social_standing_may_want_less_attention_from_inappropriately_behaved_people_of_lower_social_standing, volition).
% People of high social standing may want less attention from inappropriately behaved people of lower social standing
rule_active(people_of_high_social_standing_may_want_less_attention_from_inappropriately_beha).
rule_category(people_of_high_social_standing_may_want_less_attention_from_inappropriately_beha, favors_obligations).
rule_source(people_of_high_social_standing_may_want_less_attention_from_inappropriately_beha, ensemble).
rule_priority(people_of_high_social_standing_may_want_less_attention_from_inappropriately_beha, 5).
rule_applies(people_of_high_social_standing_may_want_less_attention_from_inappropriately_beha, X, Y) :-
    attribute(X, propriety, Propriety_val), Propriety_val < 50,
    network(X, Y, affinity, Affinity_val), Affinity_val > 60,
    attribute(X, social_standing, Social_standing_val), Social_standing_val < 50,
    attribute(Y, social_standing, Social_standing_val), Social_standing_val > 50.
rule_effect(people_of_high_social_standing_may_want_less_attention_from_inappropriately_beha, modify_network(Y, X, curiosity, '+', 0)).


rule_likelihood(honest_people_may_want_to_increase_their_credibility_with_those_they_are_indebted_to, 1).
rule_type(honest_people_may_want_to_increase_their_credibility_with_those_they_are_indebted_to, volition).
% Honest people may want to increase their credibility with those they are indebted to
rule_active(honest_people_may_want_to_increase_their_credibility_with_those_they_are_indebte).
rule_category(honest_people_may_want_to_increase_their_credibility_with_those_they_are_indebte, favors_obligations).
rule_source(honest_people_may_want_to_increase_their_credibility_with_those_they_are_indebte, ensemble).
rule_priority(honest_people_may_want_to_increase_their_credibility_with_those_they_are_indebte, 3).
rule_applies(honest_people_may_want_to_increase_their_credibility_with_those_they_are_indebte, X, Y) :-
    directed_status(X, Y, owes_a_favor_to),
    trait(X, honest).
rule_effect(honest_people_may_want_to_increase_their_credibility_with_those_they_are_indebte, modify_network(X, Y, credibility, '+', 0)).


rule_likelihood(lower_status_people_are_more_likely_to_be_helpful_if_they_were_treated_too_formally_by_an_outsider, 1).
rule_type(lower_status_people_are_more_likely_to_be_helpful_if_they_were_treated_too_formally_by_an_outsider, volition).
% Lower status people are more likely to be helpful if they were treated too formally by an outsider
rule_active(lower_status_people_are_more_likely_to_be_helpful_if_they_were_treated_too_forma).
rule_category(lower_status_people_are_more_likely_to_be_helpful_if_they_were_treated_too_forma, favors_obligations).
rule_source(lower_status_people_are_more_likely_to_be_helpful_if_they_were_treated_too_forma, ensemble).
rule_priority(lower_status_people_are_more_likely_to_be_helpful_if_they_were_treated_too_forma, 5).
rule_applies(lower_status_people_are_more_likely_to_be_helpful_if_they_were_treated_too_forma, X, Y) :-
    attribute(X, status_individual, Status_individual_val), Status_individual_val < 51,
    event(Y, X, formal, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 2,
    status(Y, outsider).
rule_effect(lower_status_people_are_more_likely_to_be_helpful_if_they_were_treated_too_forma, set_intent(X, help, Y, 5)).


rule_likelihood(lower_status_people_are_more_likely_to_be_helpful_when_you_were_positive_and_made_a_neutral_request, 1).
rule_type(lower_status_people_are_more_likely_to_be_helpful_when_you_were_positive_and_made_a_neutral_request, volition).
% Lower Status people are more likely to be helpful when you were positive and made a neutral request
rule_active(lower_status_people_are_more_likely_to_be_helpful_when_you_were_positive_and_mad).
rule_category(lower_status_people_are_more_likely_to_be_helpful_when_you_were_positive_and_mad, favors_obligations).
rule_source(lower_status_people_are_more_likely_to_be_helpful_when_you_were_positive_and_mad, ensemble).
rule_priority(lower_status_people_are_more_likely_to_be_helpful_when_you_were_positive_and_mad, 5).
rule_applies(lower_status_people_are_more_likely_to_be_helpful_when_you_were_positive_and_mad, X, Y) :-
    event(X, Y, positive, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 2,
    event(Y, X, neutral, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 2,
    attribute(X, status_individual, Status_individual_val), Status_individual_val < 51.
rule_effect(lower_status_people_are_more_likely_to_be_helpful_when_you_were_positive_and_mad, set_intent(X, help, Y, 5)).


rule_likelihood(people_have_a_strong_respect_for_individuals_with_high_social_influence_and_are_inclined_to_develop_favorable, 1).
rule_type(people_have_a_strong_respect_for_individuals_with_high_social_influence_and_are_inclined_to_develop_favorable, volition).
% People have a strong respect for individuals with high social influence and are inclined to develop favorable
rule_active(people_have_a_strong_respect_for_individuals_with_high_social_influence_and_are).
rule_category(people_have_a_strong_respect_for_individuals_with_high_social_influence_and_are, favors_obligations).
rule_source(people_have_a_strong_respect_for_individuals_with_high_social_influence_and_are, ensemble).
rule_priority(people_have_a_strong_respect_for_individuals_with_high_social_influence_and_are, 2).
rule_applies(people_have_a_strong_respect_for_individuals_with_high_social_influence_and_are, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val > 6.
rule_effect(people_have_a_strong_respect_for_individuals_with_high_social_influence_and_are, set_intent(X, favor, Y, 2)).


rule_likelihood(people_have_a_favorable_intent_towards_stronger_individuals_when_their_indebtedness_level_exceeds_that, 1).
rule_type(people_have_a_favorable_intent_towards_stronger_individuals_when_their_indebtedness_level_exceeds_that, volition).
% People have a favorable intent towards stronger individuals when their indebtedness level exceeds that
rule_active(people_have_a_favorable_intent_towards_stronger_individuals_when_their_indebtedn).
rule_category(people_have_a_favorable_intent_towards_stronger_individuals_when_their_indebtedn, favors_obligations).
rule_source(people_have_a_favorable_intent_towards_stronger_individuals_when_their_indebtedn, ensemble).
rule_priority(people_have_a_favorable_intent_towards_stronger_individuals_when_their_indebtedn, 3).
rule_applies(people_have_a_favorable_intent_towards_stronger_individuals_when_their_indebtedn, X, Y) :-
    network(X, Y, indebted, Indebted_val), Indebted_val > 6.
rule_effect(people_have_a_favorable_intent_towards_stronger_individuals_when_their_indebtedn, set_intent(X, favor, Y, 3)).


rule_likelihood(people_develop_a_favorable_intent_towards_strong_individuals_when_they_perceive_themselves_as_successful, 1).
rule_type(people_develop_a_favorable_intent_towards_strong_individuals_when_they_perceive_themselves_as_successful, volition).
% People develop a favorable intent towards strong individuals when they perceive themselves as successful.
rule_active(people_develop_a_favorable_intent_towards_strong_individuals_when_they_perceive).
rule_category(people_develop_a_favorable_intent_towards_strong_individuals_when_they_perceive, favors_obligations).
rule_source(people_develop_a_favorable_intent_towards_strong_individuals_when_they_perceive, ensemble).
rule_priority(people_develop_a_favorable_intent_towards_strong_individuals_when_they_perceive, 2).
rule_applies(people_develop_a_favorable_intent_towards_strong_individuals_when_they_perceive, X, _) :-
    status(X, successful).
rule_effect(people_develop_a_favorable_intent_towards_strong_individuals_when_they_perceive, set_intent(X, favor, Y, 2)).


rule_likelihood(people_develop_a_favorable_disposition_towards_strong_individuals_when_they_feel_guilty, 1).
rule_type(people_develop_a_favorable_disposition_towards_strong_individuals_when_they_feel_guilty, volition).
% People develop a favorable disposition towards strong individuals when they feel guilty.
rule_active(people_develop_a_favorable_disposition_towards_strong_individuals_when_they_feel).
rule_category(people_develop_a_favorable_disposition_towards_strong_individuals_when_they_feel, favors_obligations).
rule_source(people_develop_a_favorable_disposition_towards_strong_individuals_when_they_feel, ensemble).
rule_priority(people_develop_a_favorable_disposition_towards_strong_individuals_when_they_feel, 1).
rule_applies(people_develop_a_favorable_disposition_towards_strong_individuals_when_they_feel, X, _) :-
    status(X, guilty).
rule_effect(people_develop_a_favorable_disposition_towards_strong_individuals_when_they_feel, set_intent(X, favor, Y, 1)).


rule_likelihood(people_envy_others_strong_connections_and_favor_forming_relationships_with_those_they_admire_rule_name, 1).
rule_type(people_envy_others_strong_connections_and_favor_forming_relationships_with_those_they_admire_rule_name, volition).
% People envy others’ strong connections and favor forming relationships with those they admire. Rule Name
rule_active(people_envy_others_strong_connections_and_favor_forming_relationships_with_thos).
rule_category(people_envy_others_strong_connections_and_favor_forming_relationships_with_thos, favors_obligations).
rule_source(people_envy_others_strong_connections_and_favor_forming_relationships_with_thos, ensemble).
rule_priority(people_envy_others_strong_connections_and_favor_forming_relationships_with_thos, 2).
rule_applies(people_envy_others_strong_connections_and_favor_forming_relationships_with_thos, X, Y) :-
    directed_status(X, Y, envy).
rule_effect(people_envy_others_strong_connections_and_favor_forming_relationships_with_thos, set_intent(X, favor, Y, -2)).


rule_likelihood(people_want_to_increase_their_social_standing_by_doing_favors_for_influential_individuals, 1).
rule_type(people_want_to_increase_their_social_standing_by_doing_favors_for_influential_individuals, volition).
% People want to increase their social standing by doing favors for influential individuals.
rule_active(people_want_to_increase_their_social_standing_by_doing_favors_for_influential_in).
rule_category(people_want_to_increase_their_social_standing_by_doing_favors_for_influential_in, favors_obligations).
rule_source(people_want_to_increase_their_social_standing_by_doing_favors_for_influential_in, ensemble).
rule_priority(people_want_to_increase_their_social_standing_by_doing_favors_for_influential_in, 5).
rule_applies(people_want_to_increase_their_social_standing_by_doing_favors_for_influential_in, X, Y) :-
    event(X, Y, did_a_favor_for, _).
rule_effect(people_want_to_increase_their_social_standing_by_doing_favors_for_influential_in, set_intent(X, favor, Y, 5)).


rule_likelihood(people_develop_a_favorable_intent_towards_strong_individuals_when_they_have_recently_experienced_positive_interactions_with_them, 1).
rule_type(people_develop_a_favorable_intent_towards_strong_individuals_when_they_have_recently_experienced_positive_interactions_with_them, volition).
% People develop a favorable intent towards strong individuals when they have recently experienced positive interactions with them.
rule_active(people_develop_a_favorable_intent_towards_strong_individuals_when_they_have_rece).
rule_category(people_develop_a_favorable_intent_towards_strong_individuals_when_they_have_rece, favors_obligations).
rule_source(people_develop_a_favorable_intent_towards_strong_individuals_when_they_have_rece, ensemble).
rule_priority(people_develop_a_favorable_intent_towards_strong_individuals_when_they_have_rece, 2).
rule_applies(people_develop_a_favorable_intent_towards_strong_individuals_when_they_have_rece, X, Y) :-
    event(X, Y, nice, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_develop_a_favorable_intent_towards_strong_individuals_when_they_have_rece, set_intent(X, favor, Y, 2)).


rule_likelihood(people_develop_a_favorable_intent_towards_strong_individuals_after_observing_positive_interactions_within_the_last_month_to, 1).
rule_type(people_develop_a_favorable_intent_towards_strong_individuals_after_observing_positive_interactions_within_the_last_month_to, volition).
% People develop a favorable intent towards strong individuals after observing positive interactions within the last month to
rule_active(people_develop_a_favorable_intent_towards_strong_individuals_after_observing_pos).
rule_category(people_develop_a_favorable_intent_towards_strong_individuals_after_observing_pos, favors_obligations).
rule_source(people_develop_a_favorable_intent_towards_strong_individuals_after_observing_pos, ensemble).
rule_priority(people_develop_a_favorable_intent_towards_strong_individuals_after_observing_pos, 1).
rule_applies(people_develop_a_favorable_intent_towards_strong_individuals_after_observing_pos, X, Y) :-
    event(X, Y, nice, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_develop_a_favorable_intent_towards_strong_individuals_after_observing_pos, set_intent(X, favor, Y, 1)).


rule_likelihood(people_have_a_positive_intent_to_do_favors_for_strong_individuals_within_the_last_month, 1).
rule_type(people_have_a_positive_intent_to_do_favors_for_strong_individuals_within_the_last_month, volition).
% People have a positive intent to do favors for strong individuals within the last month.
rule_active(people_have_a_positive_intent_to_do_favors_for_strong_individuals_within_the_las).
rule_category(people_have_a_positive_intent_to_do_favors_for_strong_individuals_within_the_las, favors_obligations).
rule_source(people_have_a_positive_intent_to_do_favors_for_strong_individuals_within_the_las, ensemble).
rule_priority(people_have_a_positive_intent_to_do_favors_for_strong_individuals_within_the_las, 1).
rule_applies(people_have_a_positive_intent_to_do_favors_for_strong_individuals_within_the_las, X, Y) :-
    event(X, Y, did_a_favor_for, TurnsAgo), TurnsAgo >= 31, TurnsAgo =< 9999.
rule_effect(people_have_a_positive_intent_to_do_favors_for_strong_individuals_within_the_las, set_intent(X, favor, Y, 1)).


rule_likelihood(people_have_a_strong_desire_to_favor_their_crush_when_they_are_within_close_proximity_of_friends, 1).
rule_type(people_have_a_strong_desire_to_favor_their_crush_when_they_are_within_close_proximity_of_friends, volition).
% People have a strong desire to favor their crush when they are within close proximity of friends
rule_active(people_have_a_strong_desire_to_favor_their_crush_when_they_are_within_close_prox).
rule_category(people_have_a_strong_desire_to_favor_their_crush_when_they_are_within_close_prox, favors_obligations).
rule_source(people_have_a_strong_desire_to_favor_their_crush_when_they_are_within_close_prox, ensemble).
rule_priority(people_have_a_strong_desire_to_favor_their_crush_when_they_are_within_close_prox, 1).
rule_applies(people_have_a_strong_desire_to_favor_their_crush_when_they_are_within_close_prox, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    event(Y, Z, nice, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_have_a_strong_desire_to_favor_their_crush_when_they_are_within_close_prox, set_intent(X, favor, Y, 1)).


rule_likelihood(people_tend_to_favor_those_with_stronger_connections_when_their_crushes_are_within_recent_social_circles, 1).
rule_type(people_tend_to_favor_those_with_stronger_connections_when_their_crushes_are_within_recent_social_circles, volition).
% People tend to favor those with stronger connections when their crushes are within recent social circles.
rule_active(people_tend_to_favor_those_with_stronger_connections_when_their_crushes_are_with).
rule_category(people_tend_to_favor_those_with_stronger_connections_when_their_crushes_are_with, favors_obligations).
rule_source(people_tend_to_favor_those_with_stronger_connections_when_their_crushes_are_with, ensemble).
rule_priority(people_tend_to_favor_those_with_stronger_connections_when_their_crushes_are_with, 5).
rule_applies(people_tend_to_favor_those_with_stronger_connections_when_their_crushes_are_with, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_tend_to_favor_those_with_stronger_connections_when_their_crushes_are_with, set_intent(X, favor, Y, -5)).


rule_likelihood(people_are_likely_to_do_a_favor_for_strong_individuals_they_ve_recently_become_friends_with, 1).
rule_type(people_are_likely_to_do_a_favor_for_strong_individuals_they_ve_recently_become_friends_with, volition).
% People are likely to do a favor for strong individuals they’ve recently become friends with.
rule_active(people_are_likely_to_do_a_favor_for_strong_individuals_they_ve_recently_become_f).
rule_category(people_are_likely_to_do_a_favor_for_strong_individuals_they_ve_recently_become_f, favors_obligations).
rule_source(people_are_likely_to_do_a_favor_for_strong_individuals_they_ve_recently_become_f, ensemble).
rule_priority(people_are_likely_to_do_a_favor_for_strong_individuals_they_ve_recently_become_f, 3).
rule_applies(people_are_likely_to_do_a_favor_for_strong_individuals_they_ve_recently_become_f, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    event(Y, Z, did_a_favor_for, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_are_likely_to_do_a_favor_for_strong_individuals_they_ve_recently_become_f, set_intent(X, favor, Y, 3)).


rule_likelihood(people_are_likely_to_do_a_favor_for_strong_individuals_if_they_have_been_friends_with_them_for_more, 1).
rule_type(people_are_likely_to_do_a_favor_for_strong_individuals_if_they_have_been_friends_with_them_for_more, volition).
% People are likely to do a favor for strong individuals if they have been friends with them for more
rule_active(people_are_likely_to_do_a_favor_for_strong_individuals_if_they_have_been_friends).
rule_category(people_are_likely_to_do_a_favor_for_strong_individuals_if_they_have_been_friends, favors_obligations).
rule_source(people_are_likely_to_do_a_favor_for_strong_individuals_if_they_have_been_friends, ensemble).
rule_priority(people_are_likely_to_do_a_favor_for_strong_individuals_if_they_have_been_friends, 2).
rule_applies(people_are_likely_to_do_a_favor_for_strong_individuals_if_they_have_been_friends, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    event(Y, Z, did_a_favor_for, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_are_likely_to_do_a_favor_for_strong_individuals_if_they_have_been_friends, set_intent(X, favor, Y, 2)).


rule_likelihood(people_who_have_a_strong_social_network_with_more_than_six_friends_and_have_recently_done_a_favor_for, 1).
rule_type(people_who_have_a_strong_social_network_with_more_than_six_friends_and_have_recently_done_a_favor_for, volition).
% People who have a strong social network with more than six friends and have recently done a favor for
rule_active(people_who_have_a_strong_social_network_with_more_than_six_friends_and_have_rece).
rule_category(people_who_have_a_strong_social_network_with_more_than_six_friends_and_have_rece, favors_obligations).
rule_source(people_who_have_a_strong_social_network_with_more_than_six_friends_and_have_rece, ensemble).
rule_priority(people_who_have_a_strong_social_network_with_more_than_six_friends_and_have_rece, 1).
rule_applies(people_who_have_a_strong_social_network_with_more_than_six_friends_and_have_rece, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    event(Y, Z, did_a_favor_for, TurnsAgo), TurnsAgo >= 31, TurnsAgo =< 9999.
rule_effect(people_who_have_a_strong_social_network_with_more_than_six_friends_and_have_rece, set_intent(X, favor, Y, 1)).


rule_likelihood(people_are_inclined_to_form_closer_bonds_with_influential_individuals_and_have_a_favorable_intent, 1).
rule_type(people_are_inclined_to_form_closer_bonds_with_influential_individuals_and_have_a_favorable_intent, volition).
% People are inclined to form closer bonds with influential individuals and have a favorable intent
rule_active(people_are_inclined_to_form_closer_bonds_with_influential_individuals_and_have_a).
rule_category(people_are_inclined_to_form_closer_bonds_with_influential_individuals_and_have_a, favors_obligations).
rule_source(people_are_inclined_to_form_closer_bonds_with_influential_individuals_and_have_a, ensemble).
rule_priority(people_are_inclined_to_form_closer_bonds_with_influential_individuals_and_have_a, 5).
rule_applies(people_are_inclined_to_form_closer_bonds_with_influential_individuals_and_have_a, X, Z) :-
    network(X, Z, romance, Romance_val), Romance_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_are_inclined_to_form_closer_bonds_with_influential_individuals_and_have_a, set_intent(X, favor, Y, -5)).


rule_likelihood(people_develop_a_favorable_intent_towards_getting_closer_to_strong_individuals_when_they_have_been_meaningfully_interact, 1).
rule_type(people_develop_a_favorable_intent_towards_getting_closer_to_strong_individuals_when_they_have_been_meaningfully_interact, volition).
% People develop a favorable intent towards getting closer to strong individuals when they have been meaningfully interact
rule_active(people_develop_a_favorable_intent_towards_getting_closer_to_strong_individuals_w).
rule_category(people_develop_a_favorable_intent_towards_getting_closer_to_strong_individuals_w, favors_obligations).
rule_source(people_develop_a_favorable_intent_towards_getting_closer_to_strong_individuals_w, ensemble).
rule_priority(people_develop_a_favorable_intent_towards_getting_closer_to_strong_individuals_w, 3).
rule_applies(people_develop_a_favorable_intent_towards_getting_closer_to_strong_individuals_w, X, Z) :-
    network(X, Z, romance, Romance_val), Romance_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_develop_a_favorable_intent_towards_getting_closer_to_strong_individuals_w, set_intent(X, favor, Y, -3)).


rule_likelihood(people_feel_indebted_to_their_strong_connections_and_are_likely_to_do_favors_for_them, 1).
rule_type(people_feel_indebted_to_their_strong_connections_and_are_likely_to_do_favors_for_them, volition).
% People feel indebted to their strong connections and are likely to do favors for them.
rule_active(people_feel_indebted_to_their_strong_connections_and_are_likely_to_do_favors_for).
rule_category(people_feel_indebted_to_their_strong_connections_and_are_likely_to_do_favors_for, favors_obligations).
rule_source(people_feel_indebted_to_their_strong_connections_and_are_likely_to_do_favors_for, ensemble).
rule_priority(people_feel_indebted_to_their_strong_connections_and_are_likely_to_do_favors_for, 2).
rule_applies(people_feel_indebted_to_their_strong_connections_and_are_likely_to_do_favors_for, X, Z) :-
    network(X, Z, familial, Familial_val), Familial_val > 6,
    event(Y, Z, did_a_favor_for, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_feel_indebted_to_their_strong_connections_and_are_likely_to_do_favors_for, set_intent(X, favor, Y, 2)).


rule_likelihood(people_who_have_a_strong_familial_network_with_more_than_six_connections_and_have_done_a_favor_for, 1).
rule_type(people_who_have_a_strong_familial_network_with_more_than_six_connections_and_have_done_a_favor_for, volition).
% People who have a strong familial network with more than six connections and have done a favor for
rule_active(people_who_have_a_strong_familial_network_with_more_than_six_connections_and_hav).
rule_category(people_who_have_a_strong_familial_network_with_more_than_six_connections_and_hav, favors_obligations).
rule_source(people_who_have_a_strong_familial_network_with_more_than_six_connections_and_hav, ensemble).
rule_priority(people_who_have_a_strong_familial_network_with_more_than_six_connections_and_hav, 1).
rule_applies(people_who_have_a_strong_familial_network_with_more_than_six_connections_and_hav, X, Z) :-
    network(X, Z, familial, Familial_val), Familial_val > 6,
    event(Y, Z, did_a_favor_for, TurnsAgo), TurnsAgo >= 31, TurnsAgo =< 9999.
rule_effect(people_who_have_a_strong_familial_network_with_more_than_six_connections_and_hav, set_intent(X, kind, Y, 1)).


rule_likelihood(people_are_inclined_to_seek_connections_with_influential_individuals_when_they_have_recently_done_a_favor_for, 1).
rule_type(people_are_inclined_to_seek_connections_with_influential_individuals_when_they_have_recently_done_a_favor_for, volition).
% People are inclined to seek connections with influential individuals when they have recently done a favor for
rule_active(people_are_inclined_to_seek_connections_with_influential_individuals_when_they_h).
rule_category(people_are_inclined_to_seek_connections_with_influential_individuals_when_they_h, favors_obligations).
rule_source(people_are_inclined_to_seek_connections_with_influential_individuals_when_they_h, ensemble).
rule_priority(people_are_inclined_to_seek_connections_with_influential_individuals_when_they_h, 2).
rule_applies(people_are_inclined_to_seek_connections_with_influential_individuals_when_they_h, X, Z) :-
    network(X, Z, antagonism, Antagonism_val), Antagonism_val > 6,
    event(Y, Z, did_a_favor_for, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_are_inclined_to_seek_connections_with_influential_individuals_when_they_h, set_intent(X, favor, Y, -2)).


rule_likelihood(people_desire_to_honor_stronger_connections_when_indebtedness_level_exceeds_a_certain_threshold, 1).
rule_type(people_desire_to_honor_stronger_connections_when_indebtedness_level_exceeds_a_certain_threshold, volition).
% People desire to honor stronger connections when indebtedness level exceeds a certain threshold.
rule_active(people_desire_to_honor_stronger_connections_when_indebtedness_level_exceeds_a_ce).
rule_category(people_desire_to_honor_stronger_connections_when_indebtedness_level_exceeds_a_ce, favors_obligations).
rule_source(people_desire_to_honor_stronger_connections_when_indebtedness_level_exceeds_a_ce, ensemble).
rule_priority(people_desire_to_honor_stronger_connections_when_indebtedness_level_exceeds_a_ce, 1).
rule_applies(people_desire_to_honor_stronger_connections_when_indebtedness_level_exceeds_a_ce, X, Y) :-
    network(X, Y, indebted, Indebted_val), Indebted_val > 6.
rule_effect(people_desire_to_honor_stronger_connections_when_indebtedness_level_exceeds_a_ce, set_intent(X, honor, Y, 1)).


rule_likelihood(people_want_to_ingratiate_themselves_with_individuals_they_are_indebted_to_more_than_others, 1).
rule_type(people_want_to_ingratiate_themselves_with_individuals_they_are_indebted_to_more_than_others, volition).
% People want to ingratiate themselves with individuals they are indebted to more than others
rule_active(people_want_to_ingratiate_themselves_with_individuals_they_are_indebted_to_more).
rule_category(people_want_to_ingratiate_themselves_with_individuals_they_are_indebted_to_more, favors_obligations).
rule_source(people_want_to_ingratiate_themselves_with_individuals_they_are_indebted_to_more, ensemble).
rule_priority(people_want_to_ingratiate_themselves_with_individuals_they_are_indebted_to_more, 2).
rule_applies(people_want_to_ingratiate_themselves_with_individuals_they_are_indebted_to_more, X, Y) :-
    network(X, Y, indebted, Indebted_val), Indebted_val > 6.
rule_effect(people_want_to_ingratiate_themselves_with_individuals_they_are_indebted_to_more, set_intent(X, ingratiate, Y, 2)).


rule_likelihood(people_may_develop_feelings_of_envy_towards_those_they_perceive_as_more_successful_or_powerful, 1).
rule_type(people_may_develop_feelings_of_envy_towards_those_they_perceive_as_more_successful_or_powerful, volition).
% People may develop feelings of envy towards those they perceive as more successful or powerful.
rule_active(people_may_develop_feelings_of_envy_towards_those_they_perceive_as_more_successf).
rule_category(people_may_develop_feelings_of_envy_towards_those_they_perceive_as_more_successf, favors_obligations).
rule_source(people_may_develop_feelings_of_envy_towards_those_they_perceive_as_more_successf, ensemble).
rule_priority(people_may_develop_feelings_of_envy_towards_those_they_perceive_as_more_successf, 2).
rule_applies(people_may_develop_feelings_of_envy_towards_those_they_perceive_as_more_successf, X, Y) :-
    directed_status(X, Y, envy).
rule_effect(people_may_develop_feelings_of_envy_towards_those_they_perceive_as_more_successf, set_intent(X, kind, Y, -2)).


rule_likelihood(people_are_likely_to_develop_a_desire_for_friendship_with_strong_individuals_due_to_past_favors, 1).
rule_type(people_are_likely_to_develop_a_desire_for_friendship_with_strong_individuals_due_to_past_favors, volition).
% People are likely to develop a desire for friendship with strong individuals due to past favors.
rule_active(people_are_likely_to_develop_a_desire_for_friendship_with_strong_individuals_due).
rule_category(people_are_likely_to_develop_a_desire_for_friendship_with_strong_individuals_due, favors_obligations).
rule_source(people_are_likely_to_develop_a_desire_for_friendship_with_strong_individuals_due, ensemble).
rule_priority(people_are_likely_to_develop_a_desire_for_friendship_with_strong_individuals_due, 1).
rule_applies(people_are_likely_to_develop_a_desire_for_friendship_with_strong_individuals_due, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    event(Y, Z, did_a_favor_for, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_are_likely_to_develop_a_desire_for_friendship_with_strong_individuals_due, set_intent(X, kind, Y, 1)).


rule_likelihood(people_with_a_strong_network_of_family_connections_who_have_recently_done_favors_for_their_crush_are, 1).
rule_type(people_with_a_strong_network_of_family_connections_who_have_recently_done_favors_for_their_crush_are, volition).
% People with a strong network of family connections who have recently done favors for their crush are
rule_active(people_with_a_strong_network_of_family_connections_who_have_recently_done_favors).
rule_category(people_with_a_strong_network_of_family_connections_who_have_recently_done_favors, favors_obligations).
rule_source(people_with_a_strong_network_of_family_connections_who_have_recently_done_favors, ensemble).
rule_priority(people_with_a_strong_network_of_family_connections_who_have_recently_done_favors, 1).
rule_applies(people_with_a_strong_network_of_family_connections_who_have_recently_done_favors, X, Z) :-
    network(X, Z, familial, Familial_val), Familial_val > 6,
    event(Y, Z, did_a_favor_for, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_with_a_strong_network_of_family_connections_who_have_recently_done_favors, set_intent(X, kind, Y, 1)).


rule_likelihood(people_seek_to_form_closer_bonds_with_influential_individuals_due_to_a_favor_received_within_the_past, 1).
rule_type(people_seek_to_form_closer_bonds_with_influential_individuals_due_to_a_favor_received_within_the_past, volition).
% People seek to form closer bonds with influential individuals due to a favor received within the past
rule_active(people_seek_to_form_closer_bonds_with_influential_individuals_due_to_a_favor_rec).
rule_category(people_seek_to_form_closer_bonds_with_influential_individuals_due_to_a_favor_rec, favors_obligations).
rule_source(people_seek_to_form_closer_bonds_with_influential_individuals_due_to_a_favor_rec, ensemble).
rule_priority(people_seek_to_form_closer_bonds_with_influential_individuals_due_to_a_favor_rec, 1).
rule_applies(people_seek_to_form_closer_bonds_with_influential_individuals_due_to_a_favor_rec, X, Z) :-
    network(X, Z, familial, Familial_val), Familial_val > 6,
    event(Y, Z, did_a_favor_for, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_seek_to_form_closer_bonds_with_influential_individuals_due_to_a_favor_rec, set_intent(X, kind, Y, 1)).


rule_likelihood(people_are_influenced_to_seek_connections_with_individuals_they_perceive_as_more_powerful, 1).
rule_type(people_are_influenced_to_seek_connections_with_individuals_they_perceive_as_more_powerful, volition).
% People are influenced to seek connections with individuals they perceive as more powerful.
rule_active(people_are_influenced_to_seek_connections_with_individuals_they_perceive_as_more).
rule_category(people_are_influenced_to_seek_connections_with_individuals_they_perceive_as_more, favors_obligations).
rule_source(people_are_influenced_to_seek_connections_with_individuals_they_perceive_as_more, ensemble).
rule_priority(people_are_influenced_to_seek_connections_with_individuals_they_perceive_as_more, 2).
rule_applies(people_are_influenced_to_seek_connections_with_individuals_they_perceive_as_more, X, Y) :-
    directed_status(X, Y, rivals).
rule_effect(people_are_influenced_to_seek_connections_with_individuals_they_perceive_as_more, set_intent(X, manipulate, Y, 2)).


rule_likelihood(people_have_a_lower_trust_towards_weaker_connections_compared_to_stronger_ones_in_their_social_network, 1).
rule_type(people_have_a_lower_trust_towards_weaker_connections_compared_to_stronger_ones_in_their_social_network, volition).
% People have a lower trust towards weaker connections compared to stronger ones in their social network.
rule_active(people_have_a_lower_trust_towards_weaker_connections_compared_to_stronger_ones_i).
rule_category(people_have_a_lower_trust_towards_weaker_connections_compared_to_stronger_ones_i, favors_obligations).
rule_source(people_have_a_lower_trust_towards_weaker_connections_compared_to_stronger_ones_i, ensemble).
rule_priority(people_have_a_lower_trust_towards_weaker_connections_compared_to_stronger_ones_i, 3).
rule_applies(people_have_a_lower_trust_towards_weaker_connections_compared_to_stronger_ones_i, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val < 4.
rule_effect(people_have_a_lower_trust_towards_weaker_connections_compared_to_stronger_ones_i, set_intent(X, trust, Y, -3)).

%% ─── Fear Apprehension (2 rules) ───


rule_likelihood(people_with_a_fearful_status_seek_candid_relationships_to_overcome_their_apprehension, 1).
rule_type(people_with_a_fearful_status_seek_candid_relationships_to_overcome_their_apprehension, volition).
% People with a fearful status seek candid relationships to overcome their apprehension.
rule_active(people_with_a_fearful_status_seek_candid_relationships_to_overcome_their_apprehe).
rule_category(people_with_a_fearful_status_seek_candid_relationships_to_overcome_their_apprehe, fear_apprehension).
rule_source(people_with_a_fearful_status_seek_candid_relationships_to_overcome_their_apprehe, ensemble).
rule_priority(people_with_a_fearful_status_seek_candid_relationships_to_overcome_their_apprehe, 2).
rule_applies(people_with_a_fearful_status_seek_candid_relationships_to_overcome_their_apprehe, X, _) :-
    status(X, fearful).
rule_effect(people_with_a_fearful_status_seek_candid_relationships_to_overcome_their_apprehe, set_intent(X, candid, Y, -2)).


rule_likelihood(people_are_afraid_of_both_their_crush_and_strong_individuals_they_have_a_candid_intent_to_get, 1).
rule_type(people_are_afraid_of_both_their_crush_and_strong_individuals_they_have_a_candid_intent_to_get, volition).
% People are afraid of both their crush and strong individuals. They have a candid intent to get
rule_active(people_are_afraid_of_both_their_crush_and_strong_individuals_they_have_a_candid).
rule_category(people_are_afraid_of_both_their_crush_and_strong_individuals_they_have_a_candid, fear_apprehension).
rule_source(people_are_afraid_of_both_their_crush_and_strong_individuals_they_have_a_candid, ensemble).
rule_priority(people_are_afraid_of_both_their_crush_and_strong_individuals_they_have_a_candid, 2).
rule_applies(people_are_afraid_of_both_their_crush_and_strong_individuals_they_have_a_candid, X, Z) :-
    directed_status(X, Z, afraid_of),
    directed_status(Y, Z, afraid_of).
rule_effect(people_are_afraid_of_both_their_crush_and_strong_individuals_they_have_a_candid, set_intent(X, candid, Y, 2)).

%% ─── Friendship Alliance (21 rules) ───


rule_likelihood(rich_people_of_high_social_standing_are_less_likely_to_befriend_non_rich_people_of_low_social_standing, 1).
rule_type(rich_people_of_high_social_standing_are_less_likely_to_befriend_non_rich_people_of_low_social_standing, volition).
% Rich people of high social standing are less likely to befriend non-rich people of low social standing
rule_active(rich_people_of_high_social_standing_are_less_likely_to_befriend_non_rich_people).
rule_category(rich_people_of_high_social_standing_are_less_likely_to_befriend_non_rich_people, friendship_alliance).
rule_source(rich_people_of_high_social_standing_are_less_likely_to_befriend_non_rich_people, ensemble).
rule_priority(rich_people_of_high_social_standing_are_less_likely_to_befriend_non_rich_people, 3).
rule_applies(rich_people_of_high_social_standing_are_less_likely_to_befriend_non_rich_people, X, Y) :-
    attribute(X, propriety, Propriety_val), Propriety_val > 70,
    trait(X, rich),
    \+ trait(Y, rich),
    attribute(X, social_standing, Social_standing_val), Social_standing_val > 70,
    attribute(Y, social_standing, Social_standing_val), Social_standing_val < 50.
rule_effect(rich_people_of_high_social_standing_are_less_likely_to_befriend_non_rich_people, modify_network(X, Y, affinity, '+', 0)).
rule_effect(rich_people_of_high_social_standing_are_less_likely_to_befriend_non_rich_people, add_relationship(X, Y, ally)).


rule_likelihood(people_seek_to_increase_their_connections_with_both_public_friends_of_type_z_and_other_individuals_who_are_also, 1).
rule_type(people_seek_to_increase_their_connections_with_both_public_friends_of_type_z_and_other_individuals_who_are_also, volition).
% People seek to increase their connections with both public friends of type z and other individuals who are also
rule_active(people_seek_to_increase_their_connections_with_both_public_friends_of_type_z_and).
rule_category(people_seek_to_increase_their_connections_with_both_public_friends_of_type_z_and, friendship_alliance).
rule_source(people_seek_to_increase_their_connections_with_both_public_friends_of_type_z_and, ensemble).
rule_priority(people_seek_to_increase_their_connections_with_both_public_friends_of_type_z_and, 1).
rule_applies(people_seek_to_increase_their_connections_with_both_public_friends_of_type_z_and, X, Z) :-
    directed_status(X, Z, public_friends),
    directed_status(Y, Z, public_friends).
rule_effect(people_seek_to_increase_their_connections_with_both_public_friends_of_type_z_and, set_intent(X, candid, Y, 1)).


rule_likelihood(people_are_likely_to_develop_mutual_friendships_when_they_both_have_a_strong_desire_for_friendship_with, 1).
rule_type(people_are_likely_to_develop_mutual_friendships_when_they_both_have_a_strong_desire_for_friendship_with, volition).
% People are likely to develop mutual friendships when they both have a strong desire for friendship with
rule_active(people_are_likely_to_develop_mutual_friendships_when_they_both_have_a_strong_des).
rule_category(people_are_likely_to_develop_mutual_friendships_when_they_both_have_a_strong_des, friendship_alliance).
rule_source(people_are_likely_to_develop_mutual_friendships_when_they_both_have_a_strong_des, ensemble).
rule_priority(people_are_likely_to_develop_mutual_friendships_when_they_both_have_a_strong_des, 2).
rule_applies(people_are_likely_to_develop_mutual_friendships_when_they_both_have_a_strong_des, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    network(Y, Z, friendship, Friendship_val), Friendship_val > 6.
rule_effect(people_are_likely_to_develop_mutual_friendships_when_they_both_have_a_strong_des, set_intent(X, candid, Y, 2)).


rule_likelihood(people_are_interested_in_forming_friendships_with_individuals_who_have_a_strong_network_of_friends, 1).
rule_type(people_are_interested_in_forming_friendships_with_individuals_who_have_a_strong_network_of_friends, volition).
% People are interested in forming friendships with individuals who have a strong network of friends.
rule_active(people_are_interested_in_forming_friendships_with_individuals_who_have_a_strong).
rule_category(people_are_interested_in_forming_friendships_with_individuals_who_have_a_strong, friendship_alliance).
rule_source(people_are_interested_in_forming_friendships_with_individuals_who_have_a_strong, ensemble).
rule_priority(people_are_interested_in_forming_friendships_with_individuals_who_have_a_strong, 1).
rule_applies(people_are_interested_in_forming_friendships_with_individuals_who_have_a_strong, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val < 4,
    network(Y, Z, friendship, Friendship_val), Friendship_val < 4.
rule_effect(people_are_interested_in_forming_friendships_with_individuals_who_have_a_strong, set_intent(X, candid, Y, 1)).


rule_likelihood(people_have_a_strong_desire_to_get_closer_friends_with_those_they_are_more_connected_to_within_the_last, 1).
rule_type(people_have_a_strong_desire_to_get_closer_friends_with_those_they_are_more_connected_to_within_the_last, volition).
% People have a strong desire to get closer friends with those they are more connected to within the last
rule_active(people_have_a_strong_desire_to_get_closer_friends_with_those_they_are_more_conne).
rule_category(people_have_a_strong_desire_to_get_closer_friends_with_those_they_are_more_conne, friendship_alliance).
rule_source(people_have_a_strong_desire_to_get_closer_friends_with_those_they_are_more_conne, ensemble).
rule_priority(people_have_a_strong_desire_to_get_closer_friends_with_those_they_are_more_conne, 1).
rule_applies(people_have_a_strong_desire_to_get_closer_friends_with_those_they_are_more_conne, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_have_a_strong_desire_to_get_closer_friends_with_those_they_are_more_conne, set_intent(X, candid, Y, -1)).


rule_likelihood(people_desire_to_become_closer_friends_with_strong_individuals_when_they_have_had_a_meaningful_interaction_within_the, 1).
rule_type(people_desire_to_become_closer_friends_with_strong_individuals_when_they_have_had_a_meaningful_interaction_within_the, volition).
% People desire to become closer friends with strong individuals when they have had a meaningful interaction within the
rule_active(people_desire_to_become_closer_friends_with_strong_individuals_when_they_have_ha).
rule_category(people_desire_to_become_closer_friends_with_strong_individuals_when_they_have_ha, friendship_alliance).
rule_source(people_desire_to_become_closer_friends_with_strong_individuals_when_they_have_ha, ensemble).
rule_priority(people_desire_to_become_closer_friends_with_strong_individuals_when_they_have_ha, 1).
rule_applies(people_desire_to_become_closer_friends_with_strong_individuals_when_they_have_ha, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_desire_to_become_closer_friends_with_strong_individuals_when_they_have_ha, set_intent(X, candid, Y, -1)).


rule_likelihood(people_seek_new_friends_when_they_have_more_than_5_close_connections_and_haven_t_expressed_interest, 1).
rule_type(people_seek_new_friends_when_they_have_more_than_5_close_connections_and_haven_t_expressed_interest, volition).
% People seek new friends when they have more than 5 close connections and haven’t expressed interest
rule_active(people_seek_new_friends_when_they_have_more_than_5_close_connections_and_haven_t).
rule_category(people_seek_new_friends_when_they_have_more_than_5_close_connections_and_haven_t, friendship_alliance).
rule_source(people_seek_new_friends_when_they_have_more_than_5_close_connections_and_haven_t, ensemble).
rule_priority(people_seek_new_friends_when_they_have_more_than_5_close_connections_and_haven_t, 1).
rule_applies(people_seek_new_friends_when_they_have_more_than_5_close_connections_and_haven_t, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 31, TurnsAgo =< 9999.
rule_effect(people_seek_new_friends_when_they_have_more_than_5_close_connections_and_haven_t, set_intent(X, candid, Y, -1)).


rule_likelihood(people_seek_to_form_stronger_connections_with_those_who_are_equally_close_knit_in_their_social_circles, 1).
rule_type(people_seek_to_form_stronger_connections_with_those_who_are_equally_close_knit_in_their_social_circles, volition).
% People seek to form stronger connections with those who are equally close-knit in their social circles
rule_active(people_seek_to_form_stronger_connections_with_those_who_are_equally_close_knit_i).
rule_category(people_seek_to_form_stronger_connections_with_those_who_are_equally_close_knit_i, friendship_alliance).
rule_source(people_seek_to_form_stronger_connections_with_those_who_are_equally_close_knit_i, ensemble).
rule_priority(people_seek_to_form_stronger_connections_with_those_who_are_equally_close_knit_i, 3).
rule_applies(people_seek_to_form_stronger_connections_with_those_who_are_equally_close_knit_i, X, Z) :-
    network(X, Z, familial, Familial_val), Familial_val > 6,
    network(Y, Z, familial, Familial_val), Familial_val > 6.
rule_effect(people_seek_to_form_stronger_connections_with_those_who_are_equally_close_knit_i, set_intent(X, favor, Y, 3)).


rule_likelihood(people_desire_stronger_friendships_when_their_current_number_of_friends_is_below_a_certain_threshold, 1).
rule_type(people_desire_stronger_friendships_when_their_current_number_of_friends_is_below_a_certain_threshold, volition).
% People desire stronger friendships when their current number of friends is below a certain threshold.
rule_active(people_desire_stronger_friendships_when_their_current_number_of_friends_is_below).
rule_category(people_desire_stronger_friendships_when_their_current_number_of_friends_is_below, friendship_alliance).
rule_source(people_desire_stronger_friendships_when_their_current_number_of_friends_is_below, ensemble).
rule_priority(people_desire_stronger_friendships_when_their_current_number_of_friends_is_below, 1).
rule_applies(people_desire_stronger_friendships_when_their_current_number_of_friends_is_below, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val > 6.
rule_effect(people_desire_stronger_friendships_when_their_current_number_of_friends_is_below, set_intent(X, honor, Y, 1)).


rule_likelihood(people_desire_stronger_friendships_with_multiple_connections_to_influence_their_pursuit_of_honor, 1).
rule_type(people_desire_stronger_friendships_with_multiple_connections_to_influence_their_pursuit_of_honor, volition).
% People desire stronger friendships with multiple connections to influence their pursuit of honor.
rule_active(people_desire_stronger_friendships_with_multiple_connections_to_influence_their).
rule_category(people_desire_stronger_friendships_with_multiple_connections_to_influence_their, friendship_alliance).
rule_source(people_desire_stronger_friendships_with_multiple_connections_to_influence_their, ensemble).
rule_priority(people_desire_stronger_friendships_with_multiple_connections_to_influence_their, 2).
rule_applies(people_desire_stronger_friendships_with_multiple_connections_to_influence_their, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    network(Y, Z, friendship, Friendship_val), Friendship_val > 6.
rule_effect(people_desire_stronger_friendships_with_multiple_connections_to_influence_their, set_intent(X, honor, Y, 2)).


rule_likelihood(people_desire_stronger_friendships_when_their_social_network_connections_exceed_a_certain_threshold, 1).
rule_type(people_desire_stronger_friendships_when_their_social_network_connections_exceed_a_certain_threshold, volition).
% People desire stronger friendships when their social network connections exceed a certain threshold.
rule_active(people_desire_stronger_friendships_when_their_social_network_connections_exceed).
rule_category(people_desire_stronger_friendships_when_their_social_network_connections_exceed, friendship_alliance).
rule_source(people_desire_stronger_friendships_when_their_social_network_connections_exceed, ensemble).
rule_priority(people_desire_stronger_friendships_when_their_social_network_connections_exceed, 5).
rule_applies(people_desire_stronger_friendships_when_their_social_network_connections_exceed, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val > 6.
rule_effect(people_desire_stronger_friendships_when_their_social_network_connections_exceed, set_intent(X, kind, Y, 5)).


rule_likelihood(people_desire_to_befriend_strong_individuals_when_they_have_had_a_positive_interaction_with_them_within_the_last, 1).
rule_type(people_desire_to_befriend_strong_individuals_when_they_have_had_a_positive_interaction_with_them_within_the_last, volition).
% People desire to befriend strong individuals when they have had a positive interaction with them within the last
rule_active(people_desire_to_befriend_strong_individuals_when_they_have_had_a_positive_inter).
rule_category(people_desire_to_befriend_strong_individuals_when_they_have_had_a_positive_inter, friendship_alliance).
rule_source(people_desire_to_befriend_strong_individuals_when_they_have_had_a_positive_inter, ensemble).
rule_priority(people_desire_to_befriend_strong_individuals_when_they_have_had_a_positive_inter, 1).
rule_applies(people_desire_to_befriend_strong_individuals_when_they_have_had_a_positive_inter, X, Y) :-
    event(X, Y, nice, TurnsAgo), TurnsAgo >= 31, TurnsAgo =< 9999.
rule_effect(people_desire_to_befriend_strong_individuals_when_they_have_had_a_positive_inter, set_intent(X, kind, Y, 1)).


rule_likelihood(people_seek_companionship_with_individuals_who_are_both_friends_of_public_figures_and_admired_by_their_pe, 1).
rule_type(people_seek_companionship_with_individuals_who_are_both_friends_of_public_figures_and_admired_by_their_pe, volition).
% People seek companionship with individuals who are both friends of public figures and admired by their pe
rule_active(people_seek_companionship_with_individuals_who_are_both_friends_of_public_figure).
rule_category(people_seek_companionship_with_individuals_who_are_both_friends_of_public_figure, friendship_alliance).
rule_source(people_seek_companionship_with_individuals_who_are_both_friends_of_public_figure, ensemble).
rule_priority(people_seek_companionship_with_individuals_who_are_both_friends_of_public_figure, 2).
rule_applies(people_seek_companionship_with_individuals_who_are_both_friends_of_public_figure, X, Z) :-
    directed_status(X, Z, public_friends),
    directed_status(Y, Z, public_friends).
rule_effect(people_seek_companionship_with_individuals_who_are_both_friends_of_public_figure, set_intent(X, kind, Y, 2)).


rule_likelihood(people_desire_to_strengthen_their_connections_with_both_strong_individuals_and_close_friends, 1).
rule_type(people_desire_to_strengthen_their_connections_with_both_strong_individuals_and_close_friends, volition).
% People desire to strengthen their connections with both strong individuals and close friends.
rule_active(people_desire_to_strengthen_their_connections_with_both_strong_individuals_and_c).
rule_category(people_desire_to_strengthen_their_connections_with_both_strong_individuals_and_c, friendship_alliance).
rule_source(people_desire_to_strengthen_their_connections_with_both_strong_individuals_and_c, ensemble).
rule_priority(people_desire_to_strengthen_their_connections_with_both_strong_individuals_and_c, 3).
rule_applies(people_desire_to_strengthen_their_connections_with_both_strong_individuals_and_c, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    network(Y, Z, friendship, Friendship_val), Friendship_val > 6.
rule_effect(people_desire_to_strengthen_their_connections_with_both_strong_individuals_and_c, set_intent(X, kind, Y, 3)).


rule_likelihood(people_with_a_strong_network_of_friends_friendship_count_6_who_have_recently_done_fav, 1).
rule_type(people_with_a_strong_network_of_friends_friendship_count_6_who_have_recently_done_fav, volition).
% People with a strong network of friends (friendship count >6) who have recently done fav
rule_active(people_with_a_strong_network_of_friends_friendship_count_6_who_have_recently).
rule_category(people_with_a_strong_network_of_friends_friendship_count_6_who_have_recently, friendship_alliance).
rule_source(people_with_a_strong_network_of_friends_friendship_count_6_who_have_recently, ensemble).
rule_priority(people_with_a_strong_network_of_friends_friendship_count_6_who_have_recently, 1).
rule_applies(people_with_a_strong_network_of_friends_friendship_count_6_who_have_recently, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    event(Y, Z, did_a_favor_for, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_with_a_strong_network_of_friends_friendship_count_6_who_have_recently, set_intent(X, kind, Y, 1)).


rule_likelihood(people_are_likely_to_seek_friendships_with_individuals_they_perceive_as_strong_when_their_existing_friends_have, 1).
rule_type(people_are_likely_to_seek_friendships_with_individuals_they_perceive_as_strong_when_their_existing_friends_have, volition).
% People are likely to seek friendships with individuals they perceive as strong when their existing friends have
rule_active(people_are_likely_to_seek_friendships_with_individuals_they_perceive_as_strong_w).
rule_category(people_are_likely_to_seek_friendships_with_individuals_they_perceive_as_strong_w, friendship_alliance).
rule_source(people_are_likely_to_seek_friendships_with_individuals_they_perceive_as_strong_w, ensemble).
rule_priority(people_are_likely_to_seek_friendships_with_individuals_they_perceive_as_strong_w, 1).
rule_applies(people_are_likely_to_seek_friendships_with_individuals_they_perceive_as_strong_w, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    event(Y, Z, nice, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_are_likely_to_seek_friendships_with_individuals_they_perceive_as_strong_w, set_intent(X, kind, Y, 1)).


rule_likelihood(people_seek_to_form_new_friendships_with_individuals_who_are_perceived_as_stronger_within_a_short_time, 1).
rule_type(people_seek_to_form_new_friendships_with_individuals_who_are_perceived_as_stronger_within_a_short_time, volition).
% People seek to form new friendships with individuals who are perceived as stronger within a short time
rule_active(people_seek_to_form_new_friendships_with_individuals_who_are_perceived_as_strong).
rule_category(people_seek_to_form_new_friendships_with_individuals_who_are_perceived_as_strong, friendship_alliance).
rule_source(people_seek_to_form_new_friendships_with_individuals_who_are_perceived_as_strong, ensemble).
rule_priority(people_seek_to_form_new_friendships_with_individuals_who_are_perceived_as_strong, 1).
rule_applies(people_seek_to_form_new_friendships_with_individuals_who_are_perceived_as_strong, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 31, TurnsAgo =< 9999.
rule_effect(people_seek_to_form_new_friendships_with_individuals_who_are_perceived_as_strong, set_intent(X, kind, Y, -1)).


rule_likelihood(people_are_influenced_to_form_closer_friendships_with_individuals_perceived_as_stronger_than_themselves, 1).
rule_type(people_are_influenced_to_form_closer_friendships_with_individuals_perceived_as_stronger_than_themselves, volition).
% People are influenced to form closer friendships with individuals perceived as stronger than themselves.
rule_active(people_are_influenced_to_form_closer_friendships_with_individuals_perceived_as_s).
rule_category(people_are_influenced_to_form_closer_friendships_with_individuals_perceived_as_s, friendship_alliance).
rule_source(people_are_influenced_to_form_closer_friendships_with_individuals_perceived_as_s, ensemble).
rule_priority(people_are_influenced_to_form_closer_friendships_with_individuals_perceived_as_s, 2).
rule_applies(people_are_influenced_to_form_closer_friendships_with_individuals_perceived_as_s, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val > 6.
rule_effect(people_are_influenced_to_form_closer_friendships_with_individuals_perceived_as_s, set_intent(X, manipulate, Y, -2)).


rule_likelihood(people_are_influenced_to_form_friendships_with_individuals_perceived_as_stronger_when_the_difference_in_their_strength, 1).
rule_type(people_are_influenced_to_form_friendships_with_individuals_perceived_as_stronger_when_the_difference_in_their_strength, volition).
% People are influenced to form friendships with individuals perceived as stronger when the difference in their strength
rule_active(people_are_influenced_to_form_friendships_with_individuals_perceived_as_stronger).
rule_category(people_are_influenced_to_form_friendships_with_individuals_perceived_as_stronger, friendship_alliance).
rule_source(people_are_influenced_to_form_friendships_with_individuals_perceived_as_stronger, ensemble).
rule_priority(people_are_influenced_to_form_friendships_with_individuals_perceived_as_stronger, 2).
rule_applies(people_are_influenced_to_form_friendships_with_individuals_perceived_as_stronger, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val < 4.
rule_effect(people_are_influenced_to_form_friendships_with_individuals_perceived_as_stronger, set_intent(X, manipulate, Y, 2)).


rule_likelihood(people_have_a_strong_desire_to_form_friendships_with_individuals_who_are_more_popular_than_themselves, 1).
rule_type(people_have_a_strong_desire_to_form_friendships_with_individuals_who_are_more_popular_than_themselves, volition).
% People have a strong desire to form friendships with individuals who are more popular than themselves.
rule_active(people_have_a_strong_desire_to_form_friendships_with_individuals_who_are_more_po).
rule_category(people_have_a_strong_desire_to_form_friendships_with_individuals_who_are_more_po, friendship_alliance).
rule_source(people_have_a_strong_desire_to_form_friendships_with_individuals_who_are_more_po, ensemble).
rule_priority(people_have_a_strong_desire_to_form_friendships_with_individuals_who_are_more_po, 5).
rule_applies(people_have_a_strong_desire_to_form_friendships_with_individuals_who_are_more_po, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val > 6.
rule_effect(people_have_a_strong_desire_to_form_friendships_with_individuals_who_are_more_po, set_intent(X, trust, Y, 5)).


rule_likelihood(people_s_desire_to_trust_their_friends_increases_over_time_if_they_have_more_than_5_connections, 1).
rule_type(people_s_desire_to_trust_their_friends_increases_over_time_if_they_have_more_than_5_connections, volition).
% People’s desire to trust their friends increases over time if they have more than 5 connections
rule_active(people_s_desire_to_trust_their_friends_increases_over_time_if_they_have_more_tha).
rule_category(people_s_desire_to_trust_their_friends_increases_over_time_if_they_have_more_tha, friendship_alliance).
rule_source(people_s_desire_to_trust_their_friends_increases_over_time_if_they_have_more_tha, ensemble).
rule_priority(people_s_desire_to_trust_their_friends_increases_over_time_if_they_have_more_tha, 3).
rule_applies(people_s_desire_to_trust_their_friends_increases_over_time_if_they_have_more_tha, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_s_desire_to_trust_their_friends_increases_over_time_if_they_have_more_tha, set_intent(X, trust, Y, -3)).

%% ─── General (2 rules) ───


rule_likelihood(people_may_develop_negative_feelings_towards_strong_individuals_when_they_witness_or_experience_unpleasant_events_involving_them, 1).
rule_type(people_may_develop_negative_feelings_towards_strong_individuals_when_they_witness_or_experience_unpleasant_events_involving_them, volition).
% People may develop negative feelings towards strong individuals when they witness or experience unpleasant events involving them
rule_active(people_may_develop_negative_feelings_towards_strong_individuals_when_they_witnes).
rule_category(people_may_develop_negative_feelings_towards_strong_individuals_when_they_witnes, general).
rule_source(people_may_develop_negative_feelings_towards_strong_individuals_when_they_witnes, ensemble).
rule_priority(people_may_develop_negative_feelings_towards_strong_individuals_when_they_witnes, 3).
rule_applies(people_may_develop_negative_feelings_towards_strong_individuals_when_they_witnes, X, Y) :-
    event(X, Y, nice, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_may_develop_negative_feelings_towards_strong_individuals_when_they_witnes, set_intent(X, antagonize, Y, -3)).


rule_likelihood(people_may_develop_negative_feelings_towards_strong_individuals_when_they_perceive_them_as_a_threat_within_the_last, 1).
rule_type(people_may_develop_negative_feelings_towards_strong_individuals_when_they_perceive_them_as_a_threat_within_the_last, volition).
% People may develop negative feelings towards strong individuals when they perceive them as a threat within the last
rule_active(people_may_develop_negative_feelings_towards_strong_individuals_when_they_percei).
rule_category(people_may_develop_negative_feelings_towards_strong_individuals_when_they_percei, general).
rule_source(people_may_develop_negative_feelings_towards_strong_individuals_when_they_percei, ensemble).
rule_priority(people_may_develop_negative_feelings_towards_strong_individuals_when_they_percei, 2).
rule_applies(people_may_develop_negative_feelings_towards_strong_individuals_when_they_percei, X, Y) :-
    event(X, Y, nice, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_may_develop_negative_feelings_towards_strong_individuals_when_they_percei, set_intent(X, antagonize, Y, -2)).

%% ─── Governance (2 rules) ───


rule_type(crime_punishment, action).
rule_category(crime_punishment, governance).
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(crime_punishment).
rule_priority(crime_punishment, 9).
rule_likelihood(crime_punishment, 0.8).

rule_applies(crime_punishment, Officer, Person) :-
    person(Officer), person(Person),
    Officer \= Person,
    occupation(Officer, police),
    alive(Officer), alive(Person).

rule_effect(crime_punishment, Officer, Person, arrest(Officer, Person)).


rule_type(election_cycle, action).
rule_category(election_cycle, governance).
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(election_cycle).
rule_priority(election_cycle, 7).
rule_likelihood(election_cycle, 1.0).

rule_applies(election_cycle, Settlement, _) :-
    settlement(Settlement),
    settlement_population(Settlement, Pop), Pop >= 50.

rule_effect(election_cycle, Settlement, _, hold_election(Settlement)).

%% ─── Health (2 rules) ───


rule_type(illness_spread, action).
rule_category(illness_spread, health).
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(illness_spread).
rule_priority(illness_spread, 7).
rule_likelihood(illness_spread, 0.15).

rule_applies(illness_spread, Person1, Person2) :-
    person(Person1), person(Person2),
    Person1 \= Person2,
    at_location(Person1, Loc),
    at_location(Person2, Loc),
    alive(Person1), alive(Person2).

rule_effect(illness_spread, _, Person2, infect(Person2)).


rule_type(seek_medical_help, action).
rule_category(seek_medical_help, health).
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(seek_medical_help).
rule_priority(seek_medical_help, 8).
rule_likelihood(seek_medical_help, 0.7).

rule_applies(seek_medical_help, Person, Doctor) :-
    person(Person), person(Doctor),
    Person \= Doctor,
    occupation(Doctor, doctor),
    alive(Person), alive(Doctor).

rule_effect(seek_medical_help, Person, Doctor, treat(Doctor, Person)).

%% ─── Idolization Envy (4 rules) ───


rule_likelihood(people_idolize_strong_individuals_and_are_interested_in_dating_their_crushes_who_also_hold, 1).
rule_type(people_idolize_strong_individuals_and_are_interested_in_dating_their_crushes_who_also_hold, volition).
% People idolize strong individuals and are interested in dating their crushes who also hold
rule_active(people_idolize_strong_individuals_and_are_interested_in_dating_their_crushes_who).
rule_category(people_idolize_strong_individuals_and_are_interested_in_dating_their_crushes_who, idolization_envy).
rule_source(people_idolize_strong_individuals_and_are_interested_in_dating_their_crushes_who, ensemble).
rule_priority(people_idolize_strong_individuals_and_are_interested_in_dating_their_crushes_who, 1).
rule_applies(people_idolize_strong_individuals_and_are_interested_in_dating_their_crushes_who, X, Z) :-
    directed_status(X, Z, idolize),
    directed_status(Y, Z, idolize).
rule_effect(people_idolize_strong_individuals_and_are_interested_in_dating_their_crushes_who, set_intent(X, candid, Y, 1)).


rule_likelihood(people_envy_others_connections_with_strong_individuals_and_seek_to_form_similar_relationships, 1).
rule_type(people_envy_others_connections_with_strong_individuals_and_seek_to_form_similar_relationships, volition).
% People envy others’ connections with strong individuals and seek to form similar relationships.
rule_active(people_envy_others_connections_with_strong_individuals_and_seek_to_form_similar).
rule_category(people_envy_others_connections_with_strong_individuals_and_seek_to_form_similar, idolization_envy).
rule_source(people_envy_others_connections_with_strong_individuals_and_seek_to_form_similar, ensemble).
rule_priority(people_envy_others_connections_with_strong_individuals_and_seek_to_form_similar, 1).
rule_applies(people_envy_others_connections_with_strong_individuals_and_seek_to_form_similar, X, Y) :-
    directed_status(X, Y, envy).
rule_effect(people_envy_others_connections_with_strong_individuals_and_seek_to_form_similar, set_intent(X, honor, Y, -1)).


rule_likelihood(people_idolizing_both_person_x_and_y_leads_to_an_increased_desire_for_dating_their_cr, 1).
rule_type(people_idolizing_both_person_x_and_y_leads_to_an_increased_desire_for_dating_their_cr, volition).
% People idolizing both person X and Y leads to an increased desire for dating their cr
rule_active(people_idolizing_both_person_x_and_y_leads_to_an_increased_desire_for_dating_the).
rule_category(people_idolizing_both_person_x_and_y_leads_to_an_increased_desire_for_dating_the, idolization_envy).
rule_source(people_idolizing_both_person_x_and_y_leads_to_an_increased_desire_for_dating_the, ensemble).
rule_priority(people_idolizing_both_person_x_and_y_leads_to_an_increased_desire_for_dating_the, 3).
rule_applies(people_idolizing_both_person_x_and_y_leads_to_an_increased_desire_for_dating_the, X, Z) :-
    directed_status(X, Z, idolize),
    directed_status(Y, Z, idolize).
rule_effect(people_idolizing_both_person_x_and_y_leads_to_an_increased_desire_for_dating_the, set_intent(X, idealize, Y, 3)).


rule_likelihood(people_envy_others_strong_connections_and_attempt_to_manipulate_their_social_standing, 1).
rule_type(people_envy_others_strong_connections_and_attempt_to_manipulate_their_social_standing, volition).
% People envy others’ strong connections and attempt to manipulate their social standing.
rule_active(people_envy_others_strong_connections_and_attempt_to_manipulate_their_social_st).
rule_category(people_envy_others_strong_connections_and_attempt_to_manipulate_their_social_st, idolization_envy).
rule_source(people_envy_others_strong_connections_and_attempt_to_manipulate_their_social_st, ensemble).
rule_priority(people_envy_others_strong_connections_and_attempt_to_manipulate_their_social_st, 1).
rule_applies(people_envy_others_strong_connections_and_attempt_to_manipulate_their_social_st, X, Y) :-
    directed_status(X, Y, envy).
rule_effect(people_envy_others_strong_connections_and_attempt_to_manipulate_their_social_st, set_intent(X, manipulate, Y, 1)).

%% ─── Ingratiation Impression (7 rules) ───


rule_likelihood(people_want_to_ingratiate_themselves_with_those_who_are_publicly_romantically_committed, 1).
rule_type(people_want_to_ingratiate_themselves_with_those_who_are_publicly_romantically_committed, volition).
% People want to ingratiate themselves with those who are publicly romantically committed
rule_active(people_want_to_ingratiate_themselves_with_those_who_are_publicly_romantically_co).
rule_category(people_want_to_ingratiate_themselves_with_those_who_are_publicly_romantically_co, ingratiation_impression).
rule_source(people_want_to_ingratiate_themselves_with_those_who_are_publicly_romantically_co, ensemble).
rule_priority(people_want_to_ingratiate_themselves_with_those_who_are_publicly_romantically_co, 1).
rule_applies(people_want_to_ingratiate_themselves_with_those_who_are_publicly_romantically_co, X, Y) :-
    directed_status(X, Y, publicly_romantically_committed_to).
rule_effect(people_want_to_ingratiate_themselves_with_those_who_are_publicly_romantically_co, set_intent(X, ingratiate, Y, 1)).


rule_likelihood(people_aim_to_ingratiate_themselves_with_individuals_of_strong_influence_when_they_feel_guilty, 1).
rule_type(people_aim_to_ingratiate_themselves_with_individuals_of_strong_influence_when_they_feel_guilty, volition).
% People aim to ingratiate themselves with individuals of strong influence when they feel guilty.
rule_active(people_aim_to_ingratiate_themselves_with_individuals_of_strong_influence_when_th).
rule_category(people_aim_to_ingratiate_themselves_with_individuals_of_strong_influence_when_th, ingratiation_impression).
rule_source(people_aim_to_ingratiate_themselves_with_individuals_of_strong_influence_when_th, ensemble).
rule_priority(people_aim_to_ingratiate_themselves_with_individuals_of_strong_influence_when_th, 2).
rule_applies(people_aim_to_ingratiate_themselves_with_individuals_of_strong_influence_when_th, X, _) :-
    status(X, guilty).
rule_effect(people_aim_to_ingratiate_themselves_with_individuals_of_strong_influence_when_th, set_intent(X, ingratiate, Y, 2)).


rule_likelihood(people_who_are_afraid_of_someone_person_x_may_try_to_ingratiate_themselves_with, 1).
rule_type(people_who_are_afraid_of_someone_person_x_may_try_to_ingratiate_themselves_with, volition).
% People who are afraid of someone (Person x) may try to ingratiate themselves with
rule_active(people_who_are_afraid_of_someone_person_x_may_try_to_ingratiate_themselves_wit).
rule_category(people_who_are_afraid_of_someone_person_x_may_try_to_ingratiate_themselves_wit, ingratiation_impression).
rule_source(people_who_are_afraid_of_someone_person_x_may_try_to_ingratiate_themselves_wit, ensemble).
rule_priority(people_who_are_afraid_of_someone_person_x_may_try_to_ingratiate_themselves_wit, 2).
rule_applies(people_who_are_afraid_of_someone_person_x_may_try_to_ingratiate_themselves_wit, X, Y) :-
    directed_status(X, Y, afraid_of).
rule_effect(people_who_are_afraid_of_someone_person_x_may_try_to_ingratiate_themselves_wit, set_intent(X, ingratiate, Y, 2)).


rule_likelihood(people_s_positive_actions_towards_others_with_strong_characteristics_aim_to_ingratiate_themselves, 1).
rule_type(people_s_positive_actions_towards_others_with_strong_characteristics_aim_to_ingratiate_themselves, volition).
% People’s positive actions towards others with strong characteristics aim to ingratiate themselves.
rule_active(people_s_positive_actions_towards_others_with_strong_characteristics_aim_to_ingr).
rule_category(people_s_positive_actions_towards_others_with_strong_characteristics_aim_to_ingr, ingratiation_impression).
rule_source(people_s_positive_actions_towards_others_with_strong_characteristics_aim_to_ingr, ensemble).
rule_priority(people_s_positive_actions_towards_others_with_strong_characteristics_aim_to_ingr, 1).
rule_applies(people_s_positive_actions_towards_others_with_strong_characteristics_aim_to_ingr, X, Y) :-
    event(X, Y, nice, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_s_positive_actions_towards_others_with_strong_characteristics_aim_to_ingr, set_intent(X, ingratiate, Y, 1)).


rule_likelihood(people_seek_to_ingratiate_themselves_with_their_crush_by_becoming_public_friends_of_mutual, 1).
rule_type(people_seek_to_ingratiate_themselves_with_their_crush_by_becoming_public_friends_of_mutual, volition).
% People seek to ingratiate themselves with their crush by becoming public friends of mutual
rule_active(people_seek_to_ingratiate_themselves_with_their_crush_by_becoming_public_friends).
rule_category(people_seek_to_ingratiate_themselves_with_their_crush_by_becoming_public_friends, ingratiation_impression).
rule_source(people_seek_to_ingratiate_themselves_with_their_crush_by_becoming_public_friends, ensemble).
rule_priority(people_seek_to_ingratiate_themselves_with_their_crush_by_becoming_public_friends, 2).
rule_applies(people_seek_to_ingratiate_themselves_with_their_crush_by_becoming_public_friends, X, Z) :-
    directed_status(X, Z, public_friends),
    directed_status(Y, Z, public_friends).
rule_effect(people_seek_to_ingratiate_themselves_with_their_crush_by_becoming_public_friends, set_intent(X, ingratiate, Y, 2)).


rule_likelihood(people_seek_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_feelings_for, 1).
rule_type(people_seek_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_feelings_for, volition).
% People seek to ingratiate themselves with individuals they perceive as strong when their feelings for
rule_active(people_seek_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_wh).
rule_category(people_seek_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_wh, ingratiation_impression).
rule_source(people_seek_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_wh, ensemble).
rule_priority(people_seek_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_wh, 2).
rule_applies(people_seek_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_wh, X, Z) :-
    network(X, Z, antagonism, Antagonism_val), Antagonism_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_seek_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_wh, set_intent(X, ingratiate, Y, 2)).


rule_likelihood(people_desire_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_social_network, 1).
rule_type(people_desire_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_social_network, volition).
% People desire to ingratiate themselves with individuals they perceive as strong when their social network
rule_active(people_desire_to_ingratiate_themselves_with_individuals_they_perceive_as_strong).
rule_category(people_desire_to_ingratiate_themselves_with_individuals_they_perceive_as_strong, ingratiation_impression).
rule_source(people_desire_to_ingratiate_themselves_with_individuals_they_perceive_as_strong, ensemble).
rule_priority(people_desire_to_ingratiate_themselves_with_individuals_they_perceive_as_strong, 1).
rule_applies(people_desire_to_ingratiate_themselves_with_individuals_they_perceive_as_strong, X, Z) :-
    network(X, Z, antagonism, Antagonism_val), Antagonism_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_desire_to_ingratiate_themselves_with_individuals_they_perceive_as_strong, set_intent(X, ingratiate, Y, 1)).

%% ─── Life Events (3 rules) ───


rule_type(retirement_decision, action).
rule_category(retirement_decision, life_events).
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(retirement_decision).
rule_priority(retirement_decision, 7).
rule_likelihood(retirement_decision, 0.5).

rule_applies(retirement_decision, Person, _) :-
    person(Person),
    age(Person, Age), Age >= 65,
    occupation(Person, _),
    \+ business_owner(_, Person),
    alive(Person).

rule_effect(retirement_decision, Person, _, retire(Person)).


rule_type(starting_family, action).
rule_category(starting_family, life_events).
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(starting_family).
rule_priority(starting_family, 6).
rule_likelihood(starting_family, 0.3).

rule_applies(starting_family, Person1, Person2) :-
    person(Person1), person(Person2),
    married_to(Person1, Person2),
    age(Person1, Age1), Age1 >= 25, Age1 =< 35,
    age(Person2, Age2), Age2 >= 25, Age2 =< 35,
    alive(Person1), alive(Person2).

rule_effect(starting_family, Person1, Person2, trigger_birth(Person1, Person2)).


rule_type(empty_nest_downsize, action).
rule_category(empty_nest_downsize, life_events).
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(empty_nest_downsize).
rule_priority(empty_nest_downsize, 4).
rule_likelihood(empty_nest_downsize, 0.2).

rule_applies(empty_nest_downsize, Person, _) :-
    person(Person),
    age(Person, Age), Age > 55,
    alive(Person).

rule_effect(empty_nest_downsize, Person, _, downsize_home(Person)).

%% ─── Marriage Family (19 rules) ───


rule_likelihood(a_financially_dependent_person_will_have_less_affinity_for_someone_resented_by_their_benefactor, 1).
rule_type(a_financially_dependent_person_will_have_less_affinity_for_someone_resented_by_their_benefactor, volition).
% A financially dependent person will have less affinity for someone resented by their benefactor
rule_active(a_financially_dependent_person_will_have_less_affinity_for_someone_resented_by_t).
rule_category(a_financially_dependent_person_will_have_less_affinity_for_someone_resented_by_t, marriage_family).
rule_source(a_financially_dependent_person_will_have_less_affinity_for_someone_resented_by_t, ensemble).
rule_priority(a_financially_dependent_person_will_have_less_affinity_for_someone_resented_by_t, 5).
rule_applies(a_financially_dependent_person_will_have_less_affinity_for_someone_resented_by_t, X, Y) :-
    directed_status(X, Y, financially_dependent_on),
    directed_status(Y, Z, resentful_of),
    directed_status(X, Z, esteems),
    trait(Z, disdainful),
    trait(Z, hypocritical),
    trait(Y, deceptive).
rule_effect(a_financially_dependent_person_will_have_less_affinity_for_someone_resented_by_t, modify_network(X, Z, affinity, '+', 0)).


rule_likelihood(people_are_more_likely_to_ally_themselves_with_kind_person_of_similar_social_standing, 1).
rule_type(people_are_more_likely_to_ally_themselves_with_kind_person_of_similar_social_standing, volition).
% People are more likely to ally themselves with kind person of similar social standing
rule_active(people_are_more_likely_to_ally_themselves_with_kind_person_of_similar_social_sta).
rule_category(people_are_more_likely_to_ally_themselves_with_kind_person_of_similar_social_sta, marriage_family).
rule_source(people_are_more_likely_to_ally_themselves_with_kind_person_of_similar_social_sta, ensemble).
rule_priority(people_are_more_likely_to_ally_themselves_with_kind_person_of_similar_social_sta, 5).
rule_applies(people_are_more_likely_to_ally_themselves_with_kind_person_of_similar_social_sta, Y, X) :-
    attribute(Y, social_standing, Social_standing_val), Social_standing_val > 50,
    attribute(X, social_standing, Social_standing_val), Social_standing_val > 50,
    trait(Y, kind),
    directed_status(X, Y, trusts).
rule_effect(people_are_more_likely_to_ally_themselves_with_kind_person_of_similar_social_sta, add_relationship(X, Y, ally)).


rule_likelihood(a_rich_charming_and_talkative_man_loves_a_pretty_attendeee_married_to_another_man, 1).
rule_type(a_rich_charming_and_talkative_man_loves_a_pretty_attendeee_married_to_another_man, volition).
% A rich, charming and talkative man loves a pretty attendeee married to another man 
rule_active(a_rich_charming_and_talkative_man_loves_a_pretty_attendeee_married_to_another_m).
rule_category(a_rich_charming_and_talkative_man_loves_a_pretty_attendeee_married_to_another_m, marriage_family).
rule_source(a_rich_charming_and_talkative_man_loves_a_pretty_attendeee_married_to_another_m, ensemble).
rule_priority(a_rich_charming_and_talkative_man_loves_a_pretty_attendeee_married_to_another_m, 5).
rule_applies(a_rich_charming_and_talkative_man_loves_a_pretty_attendeee_married_to_another_m, Y, X) :-
    trait(Y, male),
    trait(Y, rich),
    trait(Y, talkative),
    relationship(Y, X, lovers),
    relationship(X, Z, married),
    trait(Y, charming),
    trait(X, beautiful),
    trait(X, attendee).
rule_effect(a_rich_charming_and_talkative_man_loves_a_pretty_attendeee_married_to_another_m, add_relationship(X, Y, ally)).


rule_likelihood(rich_person_less_volition_to_increase_affinity_with_attendee_with_low_self_assurance, 1).
rule_type(rich_person_less_volition_to_increase_affinity_with_attendee_with_low_self_assurance, volition).
% rich person less volition to increase affinity with attendee with low self-assurance
rule_active(rich_person_less_volition_to_increase_affinity_with_attendee_with_low_self_assur).
rule_category(rich_person_less_volition_to_increase_affinity_with_attendee_with_low_self_assur, marriage_family).
rule_source(rich_person_less_volition_to_increase_affinity_with_attendee_with_low_self_assur, ensemble).
rule_priority(rich_person_less_volition_to_increase_affinity_with_attendee_with_low_self_assur, 3).
rule_applies(rich_person_less_volition_to_increase_affinity_with_attendee_with_low_self_assur, Y, X) :-
    trait(Y, attendee),
    attribute(Y, self_assuredness, Self_assuredness_val), Self_assuredness_val < 50,
    trait(X, rich).
rule_effect(rich_person_less_volition_to_increase_affinity_with_attendee_with_low_self_assur, modify_network(X, Y, affinity, '+', 0)).


rule_likelihood(rich_person_lady_who_hates_her_provincial_husband_would_try_to_compromise_her_husband, 1).
rule_type(rich_person_lady_who_hates_her_provincial_husband_would_try_to_compromise_her_husband, volition).
% rich person lady who hates her provincial husband would try to compromise her husband
rule_active(rich_person_lady_who_hates_her_provincial_husband_would_try_to_compromise_her_hu).
rule_category(rich_person_lady_who_hates_her_provincial_husband_would_try_to_compromise_her_hu, marriage_family).
rule_source(rich_person_lady_who_hates_her_provincial_husband_would_try_to_compromise_her_hu, ensemble).
rule_priority(rich_person_lady_who_hates_her_provincial_husband_would_try_to_compromise_her_hu, 5).
rule_applies(rich_person_lady_who_hates_her_provincial_husband_would_try_to_compromise_her_hu, X, Y) :-
    trait(X, female),
    relationship(X, Y, married),
    directed_status(X, Y, financially_dependent_on),
    directed_status(X, Y, hates),
    \+ trait(X, provincial),
    trait(Y, provincial),
    attribute(X, social_standing, Social_standing_val), Social_standing_val > 66.
rule_effect(rich_person_lady_who_hates_her_provincial_husband_would_try_to_compromise_her_hu, modify_network(X, Y, affinity, '+', 0)).
rule_effect(rich_person_lady_who_hates_her_provincial_husband_would_try_to_compromise_her_hu, modify_network(X, Y, credibility, '+', 0)).


rule_likelihood(provincial_attendee_males_married_to_rich_person_women_have_less_affinity_with_provincial_attendee, 1).
rule_type(provincial_attendee_males_married_to_rich_person_women_have_less_affinity_with_provincial_attendee, volition).
% Provincial attendee males married to rich person women have less affinity with Provincial attendee
rule_active(provincial_attendee_males_married_to_rich_person_women_have_less_affinity_with_p).
rule_category(provincial_attendee_males_married_to_rich_person_women_have_less_affinity_with_p, marriage_family).
rule_source(provincial_attendee_males_married_to_rich_person_women_have_less_affinity_with_p, ensemble).
rule_priority(provincial_attendee_males_married_to_rich_person_women_have_less_affinity_with_p, 3).
rule_applies(provincial_attendee_males_married_to_rich_person_women_have_less_affinity_with_p, Y, X) :-
    trait(Y, attendee),
    trait(X, rich),
    trait(Y, male),
    trait(X, female),
    trait(Y, disdainful),
    trait(Y, provincial),
    relationship(Y, X, married),
    trait(Z, attendee),
    trait(Z, provincial),
    network(Z, Y, affinity, Affinity_val), Affinity_val > 65.
rule_effect(provincial_attendee_males_married_to_rich_person_women_have_less_affinity_with_p, modify_network(Y, Z, affinity, '+', 0)).
rule_effect(provincial_attendee_males_married_to_rich_person_women_have_less_affinity_with_p, modify_network(Y, Z, emulation, '+', 0)).
rule_effect(provincial_attendee_males_married_to_rich_person_women_have_less_affinity_with_p, modify_network(Z, Y, emulation, '+', 0)).


rule_likelihood(provincial_attendee_males_married_to_a_rich_woman_have_less_affinity_with_other_provincial_attendees, 1).
rule_type(provincial_attendee_males_married_to_a_rich_woman_have_less_affinity_with_other_provincial_attendees, volition).
% Provincial attendee males married to a rich woman have less affinity with other provincial attendees
rule_active(provincial_attendee_males_married_to_a_rich_woman_have_less_affinity_with_other).
rule_category(provincial_attendee_males_married_to_a_rich_woman_have_less_affinity_with_other, marriage_family).
rule_source(provincial_attendee_males_married_to_a_rich_woman_have_less_affinity_with_other, ensemble).
rule_priority(provincial_attendee_males_married_to_a_rich_woman_have_less_affinity_with_other, 3).
rule_applies(provincial_attendee_males_married_to_a_rich_woman_have_less_affinity_with_other, Y, X) :-
    trait(Y, attendee),
    trait(X, rich),
    trait(Y, male),
    trait(X, female),
    trait(Y, disdainful),
    trait(Y, provincial),
    relationship(Y, X, married),
    trait(Z, attendee),
    trait(Z, provincial),
    network(Z, Y, affinity, Affinity_val), Affinity_val > 65.
rule_effect(provincial_attendee_males_married_to_a_rich_woman_have_less_affinity_with_other, modify_network(Y, Z, affinity, '+', 0)).
rule_effect(provincial_attendee_males_married_to_a_rich_woman_have_less_affinity_with_other, modify_network(Y, Z, emulation, '+', 0)).


rule_likelihood(people_who_trust_another_person_are_less_likely_to_trust_those_distrusted_by_that_person, 1).
rule_type(people_who_trust_another_person_are_less_likely_to_trust_those_distrusted_by_that_person, volition).
% People who trust another person are less likely to trust those distrusted by that person
rule_active(people_who_trust_another_person_are_less_likely_to_trust_those_distrusted_by_tha).
rule_category(people_who_trust_another_person_are_less_likely_to_trust_those_distrusted_by_tha, marriage_family).
rule_source(people_who_trust_another_person_are_less_likely_to_trust_those_distrusted_by_tha, ensemble).
rule_priority(people_who_trust_another_person_are_less_likely_to_trust_those_distrusted_by_tha, 5).
rule_applies(people_who_trust_another_person_are_less_likely_to_trust_those_distrusted_by_tha, X, Z) :-
    directed_status(X, Z, hates),
    directed_status(Y, X, trusts),
    trait(X, deceptive),
    network(Y, Z, affinity, Affinity_val), Affinity_val > 50.
rule_effect(people_who_trust_another_person_are_less_likely_to_trust_those_distrusted_by_tha, modify_network(Y, Z, affinity, '+', 0)).
rule_effect(people_who_trust_another_person_are_less_likely_to_trust_those_distrusted_by_tha, modify_network(X, Y, credibility, '+', 0)).


rule_likelihood(unhappy_resentful_non_rich_people_married_to_other_non_rich_people_may_be_less_likely_to_esteem_their_spouse, 1).
rule_type(unhappy_resentful_non_rich_people_married_to_other_non_rich_people_may_be_less_likely_to_esteem_their_spouse, volition).
% Unhappy, resentful, non-rich people married to other non-rich people may be less likely to esteem their spouse
rule_active(unhappy_resentful_non_rich_people_married_to_other_non_rich_people_may_be_less).
rule_category(unhappy_resentful_non_rich_people_married_to_other_non_rich_people_may_be_less, marriage_family).
rule_source(unhappy_resentful_non_rich_people_married_to_other_non_rich_people_may_be_less, ensemble).
rule_priority(unhappy_resentful_non_rich_people_married_to_other_non_rich_people_may_be_less, 5).
rule_applies(unhappy_resentful_non_rich_people_married_to_other_non_rich_people_may_be_less, X, Y) :-
    relationship(X, Y, married),
    trait(X, rich),
    \+ trait(Y, rich),
    \+ status(X, happy),
    \+ trait(X, rich),
    directed_status(X, Y, resentful_of).
rule_effect(unhappy_resentful_non_rich_people_married_to_other_non_rich_people_may_be_less, add_relationship(X, Y, esteem)).


rule_likelihood(an_esteemed_self_assured_person_has_only_little_desire_to_increase_another_s_affinity, 1).
rule_type(an_esteemed_self_assured_person_has_only_little_desire_to_increase_another_s_affinity, volition).
% An esteemed, self-assured person has only little desire to increase another’s affinity
rule_active(an_esteemed_self_assured_person_has_only_little_desire_to_increase_another_s_af).
rule_category(an_esteemed_self_assured_person_has_only_little_desire_to_increase_another_s_af, marriage_family).
rule_source(an_esteemed_self_assured_person_has_only_little_desire_to_increase_another_s_af, ensemble).
rule_priority(an_esteemed_self_assured_person_has_only_little_desire_to_increase_another_s_af, 1).
rule_applies(an_esteemed_self_assured_person_has_only_little_desire_to_increase_another_s_af, X, Y) :-
    directed_status(X, Y, esteems),
    attribute(Y, self_assuredness, Self_assuredness_val), Self_assuredness_val > 70.
rule_effect(an_esteemed_self_assured_person_has_only_little_desire_to_increase_another_s_af, modify_network(Y, X, affinity, '+', 0)).


rule_likelihood(an_attendee_with_little_education_is_talkative_and_will_enjoy_the_company_of_a_talkative_person, 1).
rule_type(an_attendee_with_little_education_is_talkative_and_will_enjoy_the_company_of_a_talkative_person, volition).
% An attendee with little education is talkative and will enjoy the company of a talkative person
rule_active(an_attendee_with_little_education_is_talkative_and_will_enjoy_the_company_of_a_t).
rule_category(an_attendee_with_little_education_is_talkative_and_will_enjoy_the_company_of_a_t, marriage_family).
rule_source(an_attendee_with_little_education_is_talkative_and_will_enjoy_the_company_of_a_t, ensemble).
rule_priority(an_attendee_with_little_education_is_talkative_and_will_enjoy_the_company_of_a_t, 1).
rule_applies(an_attendee_with_little_education_is_talkative_and_will_enjoy_the_company_of_a_t, X, Y) :-
    trait(X, attendee),
    trait(X, female),
    trait(X, talkative),
    trait(Y, talkative).
rule_effect(an_attendee_with_little_education_is_talkative_and_will_enjoy_the_company_of_a_t, modify_network(X, Y, affinity, '+', 0)).


rule_likelihood(you_are_more_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them, 1).
rule_type(you_are_more_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them, volition).
% You are more likely to be reluctable to somebody if a family member has low trust toward them.
rule_active(you_are_more_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trus).
rule_category(you_are_more_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trus, marriage_family).
rule_source(you_are_more_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trus, ensemble).
rule_priority(you_are_more_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trus, 1).
rule_applies(you_are_more_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trus, Z, Y) :-
    network(Z, Y, trust, Trust_val), Trust_val < 4,
    status(X, family),
    status(Z, family).
rule_effect(you_are_more_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trus, set_intent(X, reluctant, Y, 1)).


rule_likelihood(you_are_less_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them, 1).
rule_type(you_are_less_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them, volition).
% You are less likely to be reluctable to somebody if a family member has low trust toward them.
rule_active(you_are_less_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trus).
rule_category(you_are_less_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trus, marriage_family).
rule_source(you_are_less_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trus, ensemble).
rule_priority(you_are_less_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trus, 1).
rule_applies(you_are_less_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trus, Z, Y) :-
    network(Z, Y, trust, Trust_val), Trust_val > 6,
    status(X, family),
    status(Z, family).
rule_effect(you_are_less_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trus, set_intent(X, reluctant, Y, -1)).


rule_likelihood(if_the_someone_is_negative_and_is_neutral_to_a_high_status_person_one_s_volition_for_dismiss_is_increased, 1).
rule_type(if_the_someone_is_negative_and_is_neutral_to_a_high_status_person_one_s_volition_for_dismiss_is_increased, volition).
% If the someone is negative and is neutral to a high status person, one’s volition for dismiss is increased
rule_active(if_the_someone_is_negative_and_is_neutral_to_a_high_status_person_one_s_volitio).
rule_category(if_the_someone_is_negative_and_is_neutral_to_a_high_status_person_one_s_volitio, marriage_family).
rule_source(if_the_someone_is_negative_and_is_neutral_to_a_high_status_person_one_s_volitio, ensemble).
rule_priority(if_the_someone_is_negative_and_is_neutral_to_a_high_status_person_one_s_volitio, 5).
rule_applies(if_the_someone_is_negative_and_is_neutral_to_a_high_status_person_one_s_volitio, X, Y) :-
    event(X, Y, negative, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 2,
    event(Y, X, neutral, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 2,
    attribute(X, status_individual, Status_individual_val), Status_individual_val > 50.
rule_effect(if_the_someone_is_negative_and_is_neutral_to_a_high_status_person_one_s_volitio, set_intent(X, dismiss, Y, 5)).


rule_likelihood(if_you_negatively_greet_and_respectfully_requested_to_a_low_status_person_increase_dismiss_volition, 1).
rule_type(if_you_negatively_greet_and_respectfully_requested_to_a_low_status_person_increase_dismiss_volition, volition).
% If you negatively greet and respectfully requested to a low status person -> increase dismiss volition
rule_active(if_you_negatively_greet_and_respectfully_requested_to_a_low_status_person_inc).
rule_category(if_you_negatively_greet_and_respectfully_requested_to_a_low_status_person_inc, marriage_family).
rule_source(if_you_negatively_greet_and_respectfully_requested_to_a_low_status_person_inc, ensemble).
rule_priority(if_you_negatively_greet_and_respectfully_requested_to_a_low_status_person_inc, 5).
rule_applies(if_you_negatively_greet_and_respectfully_requested_to_a_low_status_person_inc, X, Y) :-
    event(X, Y, negative, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 2,
    event(Y, X, respectful, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 2,
    attribute(X, status_individual, Status_individual_val), Status_individual_val < 51.
rule_effect(if_you_negatively_greet_and_respectfully_requested_to_a_low_status_person_inc, set_intent(X, dismiss, Y, 5)).


rule_likelihood(if_someone_is_positive_and_neutral_to_a_high_status_person_then_other_increases_volition_for_reluctance, 1).
rule_type(if_someone_is_positive_and_neutral_to_a_high_status_person_then_other_increases_volition_for_reluctance, volition).
% If someone is positive and neutral to a high status person then other increases volition for reluctance
rule_active(if_someone_is_positive_and_neutral_to_a_high_status_person_then_other_increases).
rule_category(if_someone_is_positive_and_neutral_to_a_high_status_person_then_other_increases, marriage_family).
rule_source(if_someone_is_positive_and_neutral_to_a_high_status_person_then_other_increases, ensemble).
rule_priority(if_someone_is_positive_and_neutral_to_a_high_status_person_then_other_increases, 5).
rule_applies(if_someone_is_positive_and_neutral_to_a_high_status_person_then_other_increases, X, Y) :-
    event(X, Y, positive, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 2,
    event(Y, X, neutral, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 2,
    attribute(X, status_individual, Status_individual_val), Status_individual_val > 50.
rule_effect(if_someone_is_positive_and_neutral_to_a_high_status_person_then_other_increases, set_intent(X, reluctant, Y, 5)).


rule_likelihood(people_s_desire_to_get_closer_within_their_extended_family_network_diminishes_when_they_have_recently_experienced, 1).
rule_type(people_s_desire_to_get_closer_within_their_extended_family_network_diminishes_when_they_have_recently_experienced, volition).
% People’s desire to get closer within their extended family network diminishes when they have recently experienced
rule_active(people_s_desire_to_get_closer_within_their_extended_family_network_diminishes_wh).
rule_category(people_s_desire_to_get_closer_within_their_extended_family_network_diminishes_wh, marriage_family).
rule_source(people_s_desire_to_get_closer_within_their_extended_family_network_diminishes_wh, ensemble).
rule_priority(people_s_desire_to_get_closer_within_their_extended_family_network_diminishes_wh, 1).
rule_applies(people_s_desire_to_get_closer_within_their_extended_family_network_diminishes_wh, X, Z) :-
    network(X, Z, familial, Familial_val), Familial_val > 6,
    event(Y, Z, nice, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_s_desire_to_get_closer_within_their_extended_family_network_diminishes_wh, set_intent(X, antagonize, Y, -1)).


rule_likelihood(people_tend_to_seek_stronger_connections_with_those_who_have_a_larger_social_network_within_the_same_family, 1).
rule_type(people_tend_to_seek_stronger_connections_with_those_who_have_a_larger_social_network_within_the_same_family, volition).
% People tend to seek stronger connections with those who have a larger social network within the same family.
rule_active(people_tend_to_seek_stronger_connections_with_those_who_have_a_larger_social_net).
rule_category(people_tend_to_seek_stronger_connections_with_those_who_have_a_larger_social_net, marriage_family).
rule_source(people_tend_to_seek_stronger_connections_with_those_who_have_a_larger_social_net, ensemble).
rule_priority(people_tend_to_seek_stronger_connections_with_those_who_have_a_larger_social_net, 1).
rule_applies(people_tend_to_seek_stronger_connections_with_those_who_have_a_larger_social_net, X, Z) :-
    network(X, Z, familial, Familial_val), Familial_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 31, TurnsAgo =< 9999.
rule_effect(people_tend_to_seek_stronger_connections_with_those_who_have_a_larger_social_net, set_intent(X, favor, Y, -1)).


rule_likelihood(people_s_desire_to_get_closer_within_their_extended_family_network_and_having_a_long_standing_interest, 1).
rule_type(people_s_desire_to_get_closer_within_their_extended_family_network_and_having_a_long_standing_interest, volition).
% People’s desire to get closer within their extended family network and having a long-standing interest
rule_active(people_s_desire_to_get_closer_within_their_extended_family_network_and_having_a).
rule_category(people_s_desire_to_get_closer_within_their_extended_family_network_and_having_a, marriage_family).
rule_source(people_s_desire_to_get_closer_within_their_extended_family_network_and_having_a, ensemble).
rule_priority(people_s_desire_to_get_closer_within_their_extended_family_network_and_having_a, 1).
rule_applies(people_s_desire_to_get_closer_within_their_extended_family_network_and_having_a, X, Z) :-
    network(X, Z, familial, Familial_val), Familial_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 31, TurnsAgo =< 9999.
rule_effect(people_s_desire_to_get_closer_within_their_extended_family_network_and_having_a, set_intent(X, trust, Y, -1)).

%% ─── Personality (1 rules) ───


rule_type(conscientious_work_ethic, action).
rule_category(conscientious_work_ethic, personality).
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(conscientious_work_ethic).
rule_priority(conscientious_work_ethic, 4).
rule_likelihood(conscientious_work_ethic, 0.3).

rule_applies(conscientious_work_ethic, Person, _) :-
    person(Person),
    personality(Person, conscientiousness, C), C > 0.7,
    occupation(Person, _),
    alive(Person).

rule_effect(conscientious_work_ethic, Person, _, take_extra_responsibility(Person)).

%% ─── Personality Traits (1 rules) ───


rule_likelihood(fans_of_the_restaurant_are_kind_because_they_are_in_a_good_mood_at_the_restaurant, 1).
rule_type(fans_of_the_restaurant_are_kind_because_they_are_in_a_good_mood_at_the_restaurant, volition).
% Happiest Place on Earth
rule_active(fans_of_the_restaurant_are_kind_because_they_are_in_a_good_mood_at_the_restauran).
rule_category(fans_of_the_restaurant_are_kind_because_they_are_in_a_good_mood_at_the_restauran, personality_traits).
rule_source(fans_of_the_restaurant_are_kind_because_they_are_in_a_good_mood_at_the_restauran, ensemble).
rule_priority(fans_of_the_restaurant_are_kind_because_they_are_in_a_good_mood_at_the_restauran, 2).
rule_applies(fans_of_the_restaurant_are_kind_because_they_are_in_a_good_mood_at_the_restauran, X, _) :-
    status(X, fan_of_restaurant).
rule_effect(fans_of_the_restaurant_are_kind_because_they_are_in_a_good_mood_at_the_restauran, set_intent(X, kind, Y, 2)).

%% ─── Profession (2 rules) ───


rule_type(doctor_delivers_baby, action).
rule_category(doctor_delivers_baby, profession).
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(doctor_delivers_baby).
rule_priority(doctor_delivers_baby, 9).
rule_likelihood(doctor_delivers_baby, 1.0).

rule_applies(doctor_delivers_baby, Doctor, Mother) :-
    person(Doctor), person(Mother),
    occupation(Doctor, doctor),
    alive(Doctor), alive(Mother).

rule_effect(doctor_delivers_baby, Doctor, Mother, deliver_baby(Doctor, Mother)).


rule_type(lawyer_handles_divorce, action).
rule_category(lawyer_handles_divorce, profession).
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(lawyer_handles_divorce).
rule_priority(lawyer_handles_divorce, 8).
rule_likelihood(lawyer_handles_divorce, 1.0).

rule_applies(lawyer_handles_divorce, Lawyer, Person) :-
    person(Lawyer), person(Person),
    occupation(Lawyer, lawyer),
    married_to(Person, _),
    alive(Lawyer), alive(Person).

rule_effect(lawyer_handles_divorce, Lawyer, Person, file_divorce(Lawyer, Person)).

%% ─── Protection Helping (5 rules) ───


rule_likelihood(a_sensitive_generous_person_is_more_likely_to_help_upset_not_virtuous_other_person, 1).
rule_type(a_sensitive_generous_person_is_more_likely_to_help_upset_not_virtuous_other_person, volition).
% A sensitive generous person is more likely to help upset not virtuous other person
rule_active(a_sensitive_generous_person_is_more_likely_to_help_upset_not_virtuous_other_pers).
rule_category(a_sensitive_generous_person_is_more_likely_to_help_upset_not_virtuous_other_pers, protection_helping).
rule_source(a_sensitive_generous_person_is_more_likely_to_help_upset_not_virtuous_other_pers, ensemble).
rule_priority(a_sensitive_generous_person_is_more_likely_to_help_upset_not_virtuous_other_pers, 5).
rule_applies(a_sensitive_generous_person_is_more_likely_to_help_upset_not_virtuous_other_pers, Y, X) :-
    attribute(Y, sensitiveness, Sensitiveness_val), Sensitiveness_val > 60,
    status(X, upset),
    trait(X, young),
    trait(Y, generous),
    \+ trait(Y, young).
rule_effect(a_sensitive_generous_person_is_more_likely_to_help_upset_not_virtuous_other_pers, modify_network(Y, X, affinity, '+', 0)).
rule_effect(a_sensitive_generous_person_is_more_likely_to_help_upset_not_virtuous_other_pers, modify_network(X, Y, emulation, '+', 0)).


rule_likelihood(young_nosy_cunning_first_responders_are_likely_to_help_young_rich_people_in_distress, 1).
rule_type(young_nosy_cunning_first_responders_are_likely_to_help_young_rich_people_in_distress, volition).
% Young, nosy, cunning, first responders are likely to help young, rich people in distress
rule_active(young_nosy_cunning_first_responders_are_likely_to_help_young_rich_people_in).
rule_category(young_nosy_cunning_first_responders_are_likely_to_help_young_rich_people_in, protection_helping).
rule_source(young_nosy_cunning_first_responders_are_likely_to_help_young_rich_people_in, ensemble).
rule_priority(young_nosy_cunning_first_responders_are_likely_to_help_young_rich_people_in, 5).
rule_applies(young_nosy_cunning_first_responders_are_likely_to_help_young_rich_people_in, Y, X) :-
    trait(Y, male),
    attribute(Y, cunningness, Cunningness_val), Cunningness_val > 70,
    trait(Y, wearing_a_first_responder_uniform),
    attribute(Y, nosiness, Nosiness_val), Nosiness_val > 60,
    trait(X, male),
    trait(X, rich),
    directed_status(X, Z, threatened_by),
    attribute(X, sophistication, Sophistication_val), Sophistication_val > 60,
    trait(Y, young),
    trait(X, young).
rule_effect(young_nosy_cunning_first_responders_are_likely_to_help_young_rich_people_in, add_relationship(Y, X, ally)).
rule_effect(young_nosy_cunning_first_responders_are_likely_to_help_young_rich_people_in, add_relationship(Y, X, esteem)).
rule_effect(young_nosy_cunning_first_responders_are_likely_to_help_young_rich_people_in, add_relationship(Z, Y, rivals)).


rule_likelihood(high_status_people_are_more_likely_to_be_helpful_if_you_recently_were_respectful_and_positive, 1).
rule_type(high_status_people_are_more_likely_to_be_helpful_if_you_recently_were_respectful_and_positive, volition).
% High status people are more likely to be helpful if you recently were respectful and positive
rule_active(high_status_people_are_more_likely_to_be_helpful_if_you_recently_were_respectful).
rule_category(high_status_people_are_more_likely_to_be_helpful_if_you_recently_were_respectful, protection_helping).
rule_source(high_status_people_are_more_likely_to_be_helpful_if_you_recently_were_respectful, ensemble).
rule_priority(high_status_people_are_more_likely_to_be_helpful_if_you_recently_were_respectful, 5).
rule_applies(high_status_people_are_more_likely_to_be_helpful_if_you_recently_were_respectful, Y, X) :-
    event(Y, X, respectful, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 2,
    event(X, Y, positive, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 2,
    attribute(X, status_individual, Status_individual_val), Status_individual_val > 50.
rule_effect(high_status_people_are_more_likely_to_be_helpful_if_you_recently_were_respectful, set_intent(X, help, Y, 5)).


rule_likelihood(people_are_inclined_to_form_closer_bonds_with_individuals_they_have_helped_recently, 1).
rule_type(people_are_inclined_to_form_closer_bonds_with_individuals_they_have_helped_recently, volition).
% People are inclined to form closer bonds with individuals they have helped recently.
rule_active(people_are_inclined_to_form_closer_bonds_with_individuals_they_have_helped_recen).
rule_category(people_are_inclined_to_form_closer_bonds_with_individuals_they_have_helped_recen, protection_helping).
rule_source(people_are_inclined_to_form_closer_bonds_with_individuals_they_have_helped_recen, ensemble).
rule_priority(people_are_inclined_to_form_closer_bonds_with_individuals_they_have_helped_recen, 3).
rule_applies(people_are_inclined_to_form_closer_bonds_with_individuals_they_have_helped_recen, X, Z) :-
    network(X, Z, familial, Familial_val), Familial_val > 6,
    event(X, Z, did_a_favor_for, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_are_inclined_to_form_closer_bonds_with_individuals_they_have_helped_recen, set_intent(X, favor, Y, 3)).


rule_likelihood(people_with_a_strong_desire_for_connections_are_likely_to_form_friendships_when_they_have_helped_their_cr, 1).
rule_type(people_with_a_strong_desire_for_connections_are_likely_to_form_friendships_when_they_have_helped_their_cr, volition).
% People with a strong desire for connections are likely to form friendships when they have helped their cr
rule_active(people_with_a_strong_desire_for_connections_are_likely_to_form_friendships_when).
rule_category(people_with_a_strong_desire_for_connections_are_likely_to_form_friendships_when, protection_helping).
rule_source(people_with_a_strong_desire_for_connections_are_likely_to_form_friendships_when, ensemble).
rule_priority(people_with_a_strong_desire_for_connections_are_likely_to_form_friendships_when, 1).
rule_applies(people_with_a_strong_desire_for_connections_are_likely_to_form_friendships_when, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    event(Y, Z, did_a_favor_for, TurnsAgo), TurnsAgo >= 31, TurnsAgo =< 9999.
rule_effect(people_with_a_strong_desire_for_connections_are_likely_to_form_friendships_when, set_intent(X, kind, Y, 1)).

%% ─── Relationship Closeness (1 rules) ───


rule_likelihood(people_s_desire_to_get_closer_within_their_extended_network_exceeding_a_strength_threshold_leads_them_to, 1).
rule_type(people_s_desire_to_get_closer_within_their_extended_network_exceeding_a_strength_threshold_leads_them_to, volition).
% People’s desire to get closer within their extended network exceeding a strength threshold leads them to
rule_active(people_s_desire_to_get_closer_within_their_extended_network_exceeding_a_strength).
rule_category(people_s_desire_to_get_closer_within_their_extended_network_exceeding_a_strength, relationship_closeness).
rule_source(people_s_desire_to_get_closer_within_their_extended_network_exceeding_a_strength, ensemble).
rule_priority(people_s_desire_to_get_closer_within_their_extended_network_exceeding_a_strength, 5).
rule_applies(people_s_desire_to_get_closer_within_their_extended_network_exceeding_a_strength, X, Z) :-
    network(X, Z, familial, Familial_val), Familial_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_s_desire_to_get_closer_within_their_extended_network_exceeding_a_strength, set_intent(X, antagonize, Y, 5)).

%% ─── Reputation Esteem (2 rules) ───


rule_likelihood(people_seek_respect_from_strong_individuals_and_are_motivated_to_honor_those_connections, 1).
rule_type(people_seek_respect_from_strong_individuals_and_are_motivated_to_honor_those_connections, volition).
% People seek respect from strong individuals and are motivated to honor those connections.
rule_active(people_seek_respect_from_strong_individuals_and_are_motivated_to_honor_those_con).
rule_category(people_seek_respect_from_strong_individuals_and_are_motivated_to_honor_those_con, reputation_esteem).
rule_source(people_seek_respect_from_strong_individuals_and_are_motivated_to_honor_those_con, ensemble).
rule_priority(people_seek_respect_from_strong_individuals_and_are_motivated_to_honor_those_con, 1).
rule_applies(people_seek_respect_from_strong_individuals_and_are_motivated_to_honor_those_con, X, Z) :-
    network(X, Z, respect, Respect_val), Respect_val > 6,
    network(Y, Z, respect, Respect_val), Respect_val > 6.
rule_effect(people_seek_respect_from_strong_individuals_and_are_motivated_to_honor_those_con, set_intent(X, honor, Y, 1)).


rule_likelihood(people_seek_to_associate_with_individuals_of_high_respect_within_their_social_network, 1).
rule_type(people_seek_to_associate_with_individuals_of_high_respect_within_their_social_network, volition).
% People seek to associate with individuals of high respect within their social network.
rule_active(people_seek_to_associate_with_individuals_of_high_respect_within_their_social_ne).
rule_category(people_seek_to_associate_with_individuals_of_high_respect_within_their_social_ne, reputation_esteem).
rule_source(people_seek_to_associate_with_individuals_of_high_respect_within_their_social_ne, ensemble).
rule_priority(people_seek_to_associate_with_individuals_of_high_respect_within_their_social_ne, 1).
rule_applies(people_seek_to_associate_with_individuals_of_high_respect_within_their_social_ne, X, Z) :-
    network(X, Z, respect, Respect_val), Respect_val < 4,
    network(Y, Z, respect, Respect_val), Respect_val < 4.
rule_effect(people_seek_to_associate_with_individuals_of_high_respect_within_their_social_ne, set_intent(X, honor, Y, 1)).

%% ─── Rivalry Conflict (3 rules) ───


rule_likelihood(honest_people_who_esteem_someone_offended_by_them_may_seek_to_undo_that_perception, 1).
rule_type(honest_people_who_esteem_someone_offended_by_them_may_seek_to_undo_that_perception, volition).
% Honest people who esteem someone offended by them may seek to undo that perception
rule_active(honest_people_who_esteem_someone_offended_by_them_may_seek_to_undo_that_percepti).
rule_category(honest_people_who_esteem_someone_offended_by_them_may_seek_to_undo_that_percepti, rivalry_conflict).
rule_source(honest_people_who_esteem_someone_offended_by_them_may_seek_to_undo_that_percepti, ensemble).
rule_priority(honest_people_who_esteem_someone_offended_by_them_may_seek_to_undo_that_percepti, 10).
rule_applies(honest_people_who_esteem_someone_offended_by_them_may_seek_to_undo_that_percepti, X, Y) :-
    directed_status(X, Y, esteems),
    directed_status(Y, X, offended_by),
    trait(X, honest).
rule_effect(honest_people_who_esteem_someone_offended_by_them_may_seek_to_undo_that_percepti, modify_network(X, Y, affinity, '+', 0)).
rule_effect(honest_people_who_esteem_someone_offended_by_them_may_seek_to_undo_that_percepti, modify_network(X, Y, curiosity, '+', 0)).


rule_likelihood(virtuous_people_lose_affinity_for_self_assured_non_virtuous_people_who_have_offended_them, 1).
rule_type(virtuous_people_lose_affinity_for_self_assured_non_virtuous_people_who_have_offended_them, volition).
% Virtuous people lose affinity for self-assured, non-virtuous people who have offended them
rule_active(virtuous_people_lose_affinity_for_self_assured_non_virtuous_people_who_have_off).
rule_category(virtuous_people_lose_affinity_for_self_assured_non_virtuous_people_who_have_off, rivalry_conflict).
rule_source(virtuous_people_lose_affinity_for_self_assured_non_virtuous_people_who_have_off, ensemble).
rule_priority(virtuous_people_lose_affinity_for_self_assured_non_virtuous_people_who_have_off, 3).
rule_applies(virtuous_people_lose_affinity_for_self_assured_non_virtuous_people_who_have_off, X, Y) :-
    \+ trait(X, virtuous),
    attribute(X, self_assuredness, Self_assuredness_val), Self_assuredness_val > 60,
    trait(Y, virtuous),
    directed_status(Y, X, offended_by).
rule_effect(virtuous_people_lose_affinity_for_self_assured_non_virtuous_people_who_have_off, modify_network(Y, X, affinity, '+', 0)).


rule_likelihood(people_are_inclined_to_get_closer_when_rivals_have_a_mutual_rivalry_towards_the_same, 1).
rule_type(people_are_inclined_to_get_closer_when_rivals_have_a_mutual_rivalry_towards_the_same, volition).
% People are inclined to get closer when rivals have a mutual rivalry towards the same
rule_active(people_are_inclined_to_get_closer_when_rivals_have_a_mutual_rivalry_towards_the).
rule_category(people_are_inclined_to_get_closer_when_rivals_have_a_mutual_rivalry_towards_the, rivalry_conflict).
rule_source(people_are_inclined_to_get_closer_when_rivals_have_a_mutual_rivalry_towards_the, ensemble).
rule_priority(people_are_inclined_to_get_closer_when_rivals_have_a_mutual_rivalry_towards_the, 2).
rule_applies(people_are_inclined_to_get_closer_when_rivals_have_a_mutual_rivalry_towards_the, X, Z) :-
    directed_status(X, Z, rivals),
    directed_status(Y, Z, rivals).
rule_effect(people_are_inclined_to_get_closer_when_rivals_have_a_mutual_rivalry_towards_the, set_intent(X, favor, Y, 2)).

%% ─── Romantic Attraction (45 rules) ───


rule_likelihood(if_a_male_flirts_with_a_female_and_shows_less_interest_she_will_be_more_likely_to_want_him, 0.5).
rule_type(if_a_male_flirts_with_a_female_and_shows_less_interest_she_will_be_more_likely_to_want_him, volition).
% If a male flirts with a female and shows less interest, she will be more likely to want him
rule_active(if_a_male_flirts_with_a_female_and_shows_less_interest_she_will_be_more_likely).
rule_category(if_a_male_flirts_with_a_female_and_shows_less_interest_she_will_be_more_likely, romantic_attraction).
rule_source(if_a_male_flirts_with_a_female_and_shows_less_interest_she_will_be_more_likely, ensemble).
rule_priority(if_a_male_flirts_with_a_female_and_shows_less_interest_she_will_be_more_likely, 3).
rule_applies(if_a_male_flirts_with_a_female_and_shows_less_interest_she_will_be_more_likely, X, Y) :-
    network(X, Y, affinity, Affinity_val), Affinity_val < 60,
    trait(X, male),
    trait(Y, female),
    event(X, Y, flirted_with, _),
    network(Y, X, affinity, Affinity_val), Affinity_val > 60.
rule_effect(if_a_male_flirts_with_a_female_and_shows_less_interest_she_will_be_more_likely, modify_network(X, Y, curiosity, '+', 0)).
rule_effect(if_a_male_flirts_with_a_female_and_shows_less_interest_she_will_be_more_likely, add_relationship(Y, X, ally)).
rule_effect(if_a_male_flirts_with_a_female_and_shows_less_interest_she_will_be_more_likely, modify_network(Y, X, curiosity, '+', 0)).


rule_likelihood(rich_men_may_be_more_attentive_to_charming_women_in_order_to_seduce_that_woman_s_acquaintance, 0.5).
rule_type(rich_men_may_be_more_attentive_to_charming_women_in_order_to_seduce_that_woman_s_acquaintance, volition).
% Rich men may be more attentive to charming women in order to seduce that woman’s acquaintance
rule_active(rich_men_may_be_more_attentive_to_charming_women_in_order_to_seduce_that_woman_s).
rule_category(rich_men_may_be_more_attentive_to_charming_women_in_order_to_seduce_that_woman_s, romantic_attraction).
rule_source(rich_men_may_be_more_attentive_to_charming_women_in_order_to_seduce_that_woman_s, ensemble).
rule_priority(rich_men_may_be_more_attentive_to_charming_women_in_order_to_seduce_that_woman_s, 5).
rule_applies(rich_men_may_be_more_attentive_to_charming_women_in_order_to_seduce_that_woman_s, X, Y) :-
    trait(X, male),
    trait(X, rich),
    trait(Y, female),
    trait(Y, rich),
    trait(Z, female),
    trait(Z, charming),
    relationship(Y, Z, ally),
    network(X, Z, affinity, Affinity_val), Affinity_val > 80,
    trait(Z, rich).
rule_effect(rich_men_may_be_more_attentive_to_charming_women_in_order_to_seduce_that_woman_s, modify_network(X, Z, affinity, '+', 0)).
rule_effect(rich_men_may_be_more_attentive_to_charming_women_in_order_to_seduce_that_woman_s, modify_network(X, Y, curiosity, '+', 0)).


rule_likelihood(a_seductive_and_attractive_woman_doesn_t_want_to_be_financially_controlled_by_a_rich_man, 0.5).
rule_type(a_seductive_and_attractive_woman_doesn_t_want_to_be_financially_controlled_by_a_rich_man, volition).
% A seductive and attractive woman doesn’t want to be financially controlled by a rich man
rule_active(a_seductive_and_attractive_woman_doesn_t_want_to_be_financially_controlled_by_a).
rule_category(a_seductive_and_attractive_woman_doesn_t_want_to_be_financially_controlled_by_a, romantic_attraction).
rule_source(a_seductive_and_attractive_woman_doesn_t_want_to_be_financially_controlled_by_a, ensemble).
rule_priority(a_seductive_and_attractive_woman_doesn_t_want_to_be_financially_controlled_by_a, 5).
rule_applies(a_seductive_and_attractive_woman_doesn_t_want_to_be_financially_controlled_by_a, X, Y) :-
    trait(X, beautiful),
    trait(X, flirtatious),
    trait(Y, rich),
    trait(Y, rich),
    trait(X, female),
    trait(Y, male),
    \+ directed_status(X, Z, financially_dependent_on),
    trait(Z, male).
rule_effect(a_seductive_and_attractive_woman_doesn_t_want_to_be_financially_controlled_by_a, modify_network(X, Y, affinity, '+', 0)).
rule_effect(a_seductive_and_attractive_woman_doesn_t_want_to_be_financially_controlled_by_a, modify_network(X, Y, curiosity, '+', 0)).


rule_likelihood(young_unsophisticated_women_may_have_increased_affinity_for_charming_charismatic_men, 0.5).
rule_type(young_unsophisticated_women_may_have_increased_affinity_for_charming_charismatic_men, volition).
% Young, unsophisticated women may have increased affinity for charming, charismatic men
rule_active(young_unsophisticated_women_may_have_increased_affinity_for_charming_charismat).
rule_category(young_unsophisticated_women_may_have_increased_affinity_for_charming_charismat, romantic_attraction).
rule_source(young_unsophisticated_women_may_have_increased_affinity_for_charming_charismat, ensemble).
rule_priority(young_unsophisticated_women_may_have_increased_affinity_for_charming_charismat, 5).
rule_applies(young_unsophisticated_women_may_have_increased_affinity_for_charming_charismat, X, Y) :-
    trait(X, young),
    trait(X, female),
    trait(Y, charming),
    trait(Y, male),
    attribute(Y, charisma, Charisma_val), Charisma_val > 60,
    attribute(X, sophistication, Sophistication_val), Sophistication_val < 60.
rule_effect(young_unsophisticated_women_may_have_increased_affinity_for_charming_charismat, modify_network(X, Y, affinity, '+', 0)).


rule_likelihood(rich_people_may_enjoy_a_financially_imbalanced_relationship_with_an_attractive_lover, 0.5).
rule_type(rich_people_may_enjoy_a_financially_imbalanced_relationship_with_an_attractive_lover, volition).
% Rich people may enjoy a financially imbalanced relationship with an attractive lover
rule_active(rich_people_may_enjoy_a_financially_imbalanced_relationship_with_an_attractive_l).
rule_category(rich_people_may_enjoy_a_financially_imbalanced_relationship_with_an_attractive_l, romantic_attraction).
rule_source(rich_people_may_enjoy_a_financially_imbalanced_relationship_with_an_attractive_l, ensemble).
rule_priority(rich_people_may_enjoy_a_financially_imbalanced_relationship_with_an_attractive_l, 3).
rule_applies(rich_people_may_enjoy_a_financially_imbalanced_relationship_with_an_attractive_l, X, Y) :-
    trait(X, rich),
    attribute(Y, charisma, Charisma_val), Charisma_val > 70,
    trait(X, male),
    trait(Y, female),
    directed_status(Y, X, financially_dependent_on),
    relationship(Y, X, lovers).
rule_effect(rich_people_may_enjoy_a_financially_imbalanced_relationship_with_an_attractive_l, modify_network(X, Y, affinity, '+', 0)).


rule_likelihood(people_s_desire_to_get_closer_in_a_romantic_network_when_the_difference_between_their_current_connection, 0.5).
rule_type(people_s_desire_to_get_closer_in_a_romantic_network_when_the_difference_between_their_current_connection, volition).
% People’s desire to get closer in a romantic network when the difference between their current connection
rule_active(people_s_desire_to_get_closer_in_a_romantic_network_when_the_difference_between).
rule_category(people_s_desire_to_get_closer_in_a_romantic_network_when_the_difference_between, romantic_attraction).
rule_source(people_s_desire_to_get_closer_in_a_romantic_network_when_the_difference_between, ensemble).
rule_priority(people_s_desire_to_get_closer_in_a_romantic_network_when_the_difference_between, 1).
rule_applies(people_s_desire_to_get_closer_in_a_romantic_network_when_the_difference_between, X, Y) :-
    network(X, Y, romance, Romance_val), Romance_val > 3,
    network(X, Y, romance, Romance_val), Romance_val < 7.
rule_effect(people_s_desire_to_get_closer_in_a_romantic_network_when_the_difference_between, set_intent(X, antagonize, Y, -1)).


rule_likelihood(people_s_crushes_have_a_strong_influence_on_their_social_behavior_within_the_last_year, 0.5).
rule_type(people_s_crushes_have_a_strong_influence_on_their_social_behavior_within_the_last_year, volition).
% People’s crushes have a strong influence on their social behavior within the last year.
rule_active(people_s_crushes_have_a_strong_influence_on_their_social_behavior_within_the_las).
rule_category(people_s_crushes_have_a_strong_influence_on_their_social_behavior_within_the_las, romantic_attraction).
rule_source(people_s_crushes_have_a_strong_influence_on_their_social_behavior_within_the_las, ensemble).
rule_priority(people_s_crushes_have_a_strong_influence_on_their_social_behavior_within_the_las, 1).
rule_applies(people_s_crushes_have_a_strong_influence_on_their_social_behavior_within_the_las, X, Y) :-
    event(X, Y, mean, TurnsAgo), TurnsAgo >= 31, TurnsAgo =< 9999.
rule_effect(people_s_crushes_have_a_strong_influence_on_their_social_behavior_within_the_las, set_intent(X, antagonize, Y, 1)).


rule_likelihood(people_seek_romantic_connections_with_individuals_perceived_as_stronger_than_themselves_and_have_recently_expressed_interest_in, 0.5).
rule_type(people_seek_romantic_connections_with_individuals_perceived_as_stronger_than_themselves_and_have_recently_expressed_interest_in, volition).
% People seek romantic connections with individuals perceived as stronger than themselves and have recently expressed interest in
rule_active(people_seek_romantic_connections_with_individuals_perceived_as_stronger_than_the).
rule_category(people_seek_romantic_connections_with_individuals_perceived_as_stronger_than_the, romantic_attraction).
rule_source(people_seek_romantic_connections_with_individuals_perceived_as_stronger_than_the, ensemble).
rule_priority(people_seek_romantic_connections_with_individuals_perceived_as_stronger_than_the, 3).
rule_applies(people_seek_romantic_connections_with_individuals_perceived_as_stronger_than_the, X, Z) :-
    network(X, Z, romance, Romance_val), Romance_val > 6,
    event(Y, Z, romantic, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_seek_romantic_connections_with_individuals_perceived_as_stronger_than_the, set_intent(X, antagonize, Y, 3)).


rule_likelihood(people_s_desire_to_get_closer_within_a_strong_social_network_and_recent_romantic_events_increase_the, 0.5).
rule_type(people_s_desire_to_get_closer_within_a_strong_social_network_and_recent_romantic_events_increase_the, volition).
% People’s desire to get closer within a strong social network and recent romantic events increase the
rule_active(people_s_desire_to_get_closer_within_a_strong_social_network_and_recent_romantic).
rule_category(people_s_desire_to_get_closer_within_a_strong_social_network_and_recent_romantic, romantic_attraction).
rule_source(people_s_desire_to_get_closer_within_a_strong_social_network_and_recent_romantic, ensemble).
rule_priority(people_s_desire_to_get_closer_within_a_strong_social_network_and_recent_romantic, 1).
rule_applies(people_s_desire_to_get_closer_within_a_strong_social_network_and_recent_romantic, X, Z) :-
    network(X, Z, romance, Romance_val), Romance_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 31, TurnsAgo =< 9999.
rule_effect(people_s_desire_to_get_closer_within_a_strong_social_network_and_recent_romantic, set_intent(X, antagonize, Y, 1)).


rule_likelihood(people_are_romantically_committed_to_their_crushes_and_have_a_strong_intent_towards_dating, 0.5).
rule_type(people_are_romantically_committed_to_their_crushes_and_have_a_strong_intent_towards_dating, volition).
% People are romantically committed to their crushes and have a strong intent towards dating
rule_active(people_are_romantically_committed_to_their_crushes_and_have_a_strong_intent_towa).
rule_category(people_are_romantically_committed_to_their_crushes_and_have_a_strong_intent_towa, romantic_attraction).
rule_source(people_are_romantically_committed_to_their_crushes_and_have_a_strong_intent_towa, ensemble).
rule_priority(people_are_romantically_committed_to_their_crushes_and_have_a_strong_intent_towa, 2).
rule_applies(people_are_romantically_committed_to_their_crushes_and_have_a_strong_intent_towa, X, Y) :-
    directed_status(X, Y, publicly_romantically_committed_to).
rule_effect(people_are_romantically_committed_to_their_crushes_and_have_a_strong_intent_towa, set_intent(X, candid, Y, 2)).


rule_likelihood(people_with_a_successful_status_are_more_likely_to_be_interested_in_dating_their_crush, 0.5).
rule_type(people_with_a_successful_status_are_more_likely_to_be_interested_in_dating_their_crush, volition).
% People with a successful status are more likely to be interested in dating their crush.
rule_active(people_with_a_successful_status_are_more_likely_to_be_interested_in_dating_their).
rule_category(people_with_a_successful_status_are_more_likely_to_be_interested_in_dating_their, romantic_attraction).
rule_source(people_with_a_successful_status_are_more_likely_to_be_interested_in_dating_their, ensemble).
rule_priority(people_with_a_successful_status_are_more_likely_to_be_interested_in_dating_their, 1).
rule_applies(people_with_a_successful_status_are_more_likely_to_be_interested_in_dating_their, X, _) :-
    status(X, successful).
rule_effect(people_with_a_successful_status_are_more_likely_to_be_interested_in_dating_their, set_intent(X, candid, Y, 1)).


rule_likelihood(people_seek_companions_with_greater_wisdom_when_they_desire_a_closer_relationship_or_potential_romantic_interest, 0.5).
rule_type(people_seek_companions_with_greater_wisdom_when_they_desire_a_closer_relationship_or_potential_romantic_interest, volition).
% People seek companions with greater wisdom when they desire a closer relationship or potential romantic interest.
rule_active(people_seek_companions_with_greater_wisdom_when_they_desire_a_closer_relationshi).
rule_category(people_seek_companions_with_greater_wisdom_when_they_desire_a_closer_relationshi, romantic_attraction).
rule_source(people_seek_companions_with_greater_wisdom_when_they_desire_a_closer_relationshi, ensemble).
rule_priority(people_seek_companions_with_greater_wisdom_when_they_desire_a_closer_relationshi, 2).
rule_applies(people_seek_companions_with_greater_wisdom_when_they_desire_a_closer_relationshi, X, _) :-
    attribute(X, wisdom, Wisdom_val), Wisdom_val > 12.
rule_effect(people_seek_companions_with_greater_wisdom_when_they_desire_a_closer_relationshi, set_intent(X, candid, Y, 2)).


rule_likelihood(people_are_attracted_to_individuals_with_high_charisma_levels_when_seeking_a_romantic_partner, 0.5).
rule_type(people_are_attracted_to_individuals_with_high_charisma_levels_when_seeking_a_romantic_partner, volition).
% People are attracted to individuals with high charisma levels when seeking a romantic partner.
rule_active(people_are_attracted_to_individuals_with_high_charisma_levels_when_seeking_a_rom).
rule_category(people_are_attracted_to_individuals_with_high_charisma_levels_when_seeking_a_rom, romantic_attraction).
rule_source(people_are_attracted_to_individuals_with_high_charisma_levels_when_seeking_a_rom, ensemble).
rule_priority(people_are_attracted_to_individuals_with_high_charisma_levels_when_seeking_a_rom, 2).
rule_applies(people_are_attracted_to_individuals_with_high_charisma_levels_when_seeking_a_rom, X, _) :-
    attribute(X, charisma, Charisma_val), Charisma_val > 12.
rule_effect(people_are_attracted_to_individuals_with_high_charisma_levels_when_seeking_a_rom, set_intent(X, candid, Y, 2)).


rule_likelihood(people_desire_to_date_their_crushes_after_a_positive_social_interaction_within_the_last_month, 0.5).
rule_type(people_desire_to_date_their_crushes_after_a_positive_social_interaction_within_the_last_month, volition).
% People desire to date their crushes after a positive social interaction within the last month.
rule_active(people_desire_to_date_their_crushes_after_a_positive_social_interaction_within_t).
rule_category(people_desire_to_date_their_crushes_after_a_positive_social_interaction_within_t, romantic_attraction).
rule_source(people_desire_to_date_their_crushes_after_a_positive_social_interaction_within_t, ensemble).
rule_priority(people_desire_to_date_their_crushes_after_a_positive_social_interaction_within_t, 1).
rule_applies(people_desire_to_date_their_crushes_after_a_positive_social_interaction_within_t, X, Y) :-
    event(X, Y, nice, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_desire_to_date_their_crushes_after_a_positive_social_interaction_within_t, set_intent(X, candid, Y, 1)).


rule_likelihood(people_are_interested_in_strong_individuals_and_have_a_significant_desire_to_date_their_crushes_who_also, 0.5).
rule_type(people_are_interested_in_strong_individuals_and_have_a_significant_desire_to_date_their_crushes_who_also, volition).
% People are interested in strong individuals and have a significant desire to date their crushes who also
rule_active(people_are_interested_in_strong_individuals_and_have_a_significant_desire_to_dat).
rule_category(people_are_interested_in_strong_individuals_and_have_a_significant_desire_to_dat, romantic_attraction).
rule_source(people_are_interested_in_strong_individuals_and_have_a_significant_desire_to_dat, ensemble).
rule_priority(people_are_interested_in_strong_individuals_and_have_a_significant_desire_to_dat, 5).
rule_applies(people_are_interested_in_strong_individuals_and_have_a_significant_desire_to_dat, X, Z) :-
    network(X, Z, romance, Romance_val), Romance_val > 6,
    network(Y, Z, romance, Romance_val), Romance_val > 6.
rule_effect(people_are_interested_in_strong_individuals_and_have_a_significant_desire_to_dat, set_intent(X, candid, Y, -5)).


rule_likelihood(people_seeking_romance_with_strong_individuals_and_having_a_high_interest_in_their_crush_within_the_past, 0.5).
rule_type(people_seeking_romance_with_strong_individuals_and_having_a_high_interest_in_their_crush_within_the_past, volition).
% People seeking romance with strong individuals and having a high interest in their crush within the past
rule_active(people_seeking_romance_with_strong_individuals_and_having_a_high_interest_in_the).
rule_category(people_seeking_romance_with_strong_individuals_and_having_a_high_interest_in_the, romantic_attraction).
rule_source(people_seeking_romance_with_strong_individuals_and_having_a_high_interest_in_the, ensemble).
rule_priority(people_seeking_romance_with_strong_individuals_and_having_a_high_interest_in_the, 1).
rule_applies(people_seeking_romance_with_strong_individuals_and_having_a_high_interest_in_the, X, Z) :-
    network(X, Z, romance, Romance_val), Romance_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_seeking_romance_with_strong_individuals_and_having_a_high_interest_in_the, set_intent(X, candid, Y, -1)).


rule_likelihood(people_with_a_strong_desire_to_form_romantic_connections_seek_out_individuals_who_are_highly_sought_after_by, 0.5).
rule_type(people_with_a_strong_desire_to_form_romantic_connections_seek_out_individuals_who_are_highly_sought_after_by, volition).
% People with a strong desire to form romantic connections seek out individuals who are highly sought after by
rule_active(people_with_a_strong_desire_to_form_romantic_connections_seek_out_individuals_wh).
rule_category(people_with_a_strong_desire_to_form_romantic_connections_seek_out_individuals_wh, romantic_attraction).
rule_source(people_with_a_strong_desire_to_form_romantic_connections_seek_out_individuals_wh, ensemble).
rule_priority(people_with_a_strong_desire_to_form_romantic_connections_seek_out_individuals_wh, 1).
rule_applies(people_with_a_strong_desire_to_form_romantic_connections_seek_out_individuals_wh, X, Z) :-
    network(X, Z, romance, Romance_val), Romance_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 31, TurnsAgo =< 9999.
rule_effect(people_with_a_strong_desire_to_form_romantic_connections_seek_out_individuals_wh, set_intent(X, candid, Y, -1)).


rule_likelihood(people_with_a_strong_familial_network_of_at_least_6_connections_are_likely_to_develop_romantic, 0.5).
rule_type(people_with_a_strong_familial_network_of_at_least_6_connections_are_likely_to_develop_romantic, volition).
% People with a strong familial network of at least 6 connections are likely to develop romantic
rule_active(people_with_a_strong_familial_network_of_at_least_6_connections_are_likely_to_de).
rule_category(people_with_a_strong_familial_network_of_at_least_6_connections_are_likely_to_de, romantic_attraction).
rule_source(people_with_a_strong_familial_network_of_at_least_6_connections_are_likely_to_de, ensemble).
rule_priority(people_with_a_strong_familial_network_of_at_least_6_connections_are_likely_to_de, 1).
rule_applies(people_with_a_strong_familial_network_of_at_least_6_connections_are_likely_to_de, X, Z) :-
    network(X, Z, familial, Familial_val), Familial_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_with_a_strong_familial_network_of_at_least_6_connections_are_likely_to_de, set_intent(X, candid, Y, -1)).


rule_likelihood(people_desire_stronger_connections_with_those_they_are_romantically_interested_in, 0.5).
rule_type(people_desire_stronger_connections_with_those_they_are_romantically_interested_in, volition).
% People desire stronger connections with those they are romantically interested in.
rule_active(people_desire_stronger_connections_with_those_they_are_romantically_interested_i).
rule_category(people_desire_stronger_connections_with_those_they_are_romantically_interested_i, romantic_attraction).
rule_source(people_desire_stronger_connections_with_those_they_are_romantically_interested_i, ensemble).
rule_priority(people_desire_stronger_connections_with_those_they_are_romantically_interested_i, 3).
rule_applies(people_desire_stronger_connections_with_those_they_are_romantically_interested_i, X, Z) :-
    network(X, Z, romance, Romance_val), Romance_val > 6,
    network(Y, Z, romance, Romance_val), Romance_val > 6.
rule_effect(people_desire_stronger_connections_with_those_they_are_romantically_interested_i, set_intent(X, kind, Y, -3)).


rule_likelihood(people_desire_to_date_their_crush_after_feeling_a_strong_connection_within_the_last_week, 0.5).
rule_type(people_desire_to_date_their_crush_after_feeling_a_strong_connection_within_the_last_week, volition).
% People desire to date their crush after feeling a strong connection within the last week.
rule_active(people_desire_to_date_their_crush_after_feeling_a_strong_connection_within_the_l).
rule_category(people_desire_to_date_their_crush_after_feeling_a_strong_connection_within_the_l, romantic_attraction).
rule_source(people_desire_to_date_their_crush_after_feeling_a_strong_connection_within_the_l, ensemble).
rule_priority(people_desire_to_date_their_crush_after_feeling_a_strong_connection_within_the_l, 2).
rule_applies(people_desire_to_date_their_crush_after_feeling_a_strong_connection_within_the_l, X, Z) :-
    network(X, Z, romance, Romance_val), Romance_val > 6,
    event(Y, Z, romantic, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_desire_to_date_their_crush_after_feeling_a_strong_connection_within_the_l, set_intent(X, kind, Y, -2)).


rule_likelihood(people_s_desire_to_be_in_a_romantic_relationship_with_their_crush_increases_as_they_get, 0.5).
rule_type(people_s_desire_to_be_in_a_romantic_relationship_with_their_crush_increases_as_they_get, volition).
% People’s desire to be in a romantic relationship with their crush increases as they get
rule_active(people_s_desire_to_be_in_a_romantic_relationship_with_their_crush_increases_as_t).
rule_category(people_s_desire_to_be_in_a_romantic_relationship_with_their_crush_increases_as_t, romantic_attraction).
rule_source(people_s_desire_to_be_in_a_romantic_relationship_with_their_crush_increases_as_t, ensemble).
rule_priority(people_s_desire_to_be_in_a_romantic_relationship_with_their_crush_increases_as_t, 1).
rule_applies(people_s_desire_to_be_in_a_romantic_relationship_with_their_crush_increases_as_t, X, Z) :-
    network(X, Z, romance, Romance_val), Romance_val > 6,
    event(Y, Z, romantic, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_s_desire_to_be_in_a_romantic_relationship_with_their_crush_increases_as_t, set_intent(X, kind, Y, -1)).


rule_likelihood(people_are_influenced_to_form_friendships_with_both_strong_individuals_and_their_crushes_simultaneously, 0.5).
rule_type(people_are_influenced_to_form_friendships_with_both_strong_individuals_and_their_crushes_simultaneously, volition).
% People are influenced to form friendships with both strong individuals and their crushes simultaneously.
rule_active(people_are_influenced_to_form_friendships_with_both_strong_individuals_and_their).
rule_category(people_are_influenced_to_form_friendships_with_both_strong_individuals_and_their, romantic_attraction).
rule_source(people_are_influenced_to_form_friendships_with_both_strong_individuals_and_their, ensemble).
rule_priority(people_are_influenced_to_form_friendships_with_both_strong_individuals_and_their, 3).
rule_applies(people_are_influenced_to_form_friendships_with_both_strong_individuals_and_their, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    network(Y, Z, friendship, Friendship_val), Friendship_val > 6.
rule_effect(people_are_influenced_to_form_friendships_with_both_strong_individuals_and_their, set_intent(X, manipulate, Y, -3)).


rule_likelihood(people_seek_stronger_connections_with_both_their_peers_and_crushes_to_increase_romantic_interest, 0.5).
rule_type(people_seek_stronger_connections_with_both_their_peers_and_crushes_to_increase_romantic_interest, volition).
% People seek stronger connections with both their peers and crushes to increase romantic interest.
rule_active(people_seek_stronger_connections_with_both_their_peers_and_crushes_to_increase_r).
rule_category(people_seek_stronger_connections_with_both_their_peers_and_crushes_to_increase_r, romantic_attraction).
rule_source(people_seek_stronger_connections_with_both_their_peers_and_crushes_to_increase_r, ensemble).
rule_priority(people_seek_stronger_connections_with_both_their_peers_and_crushes_to_increase_r, 3).
rule_applies(people_seek_stronger_connections_with_both_their_peers_and_crushes_to_increase_r, X, Z) :-
    network(X, Z, romance, Romance_val), Romance_val > 6,
    network(Y, Z, romance, Romance_val), Romance_val > 6.
rule_effect(people_seek_stronger_connections_with_both_their_peers_and_crushes_to_increase_r, set_intent(X, manipulate, Y, 3)).


rule_likelihood(people_in_a_publicly_romantic_relationship_with_someone_else_are_likely_to_pursue_dating_their, 0.5).
rule_type(people_in_a_publicly_romantic_relationship_with_someone_else_are_likely_to_pursue_dating_their, volition).
% People in a publicly romantic relationship with someone else are likely to pursue dating their
rule_active(people_in_a_publicly_romantic_relationship_with_someone_else_are_likely_to_pursu).
rule_category(people_in_a_publicly_romantic_relationship_with_someone_else_are_likely_to_pursu, romantic_attraction).
rule_source(people_in_a_publicly_romantic_relationship_with_someone_else_are_likely_to_pursu, ensemble).
rule_priority(people_in_a_publicly_romantic_relationship_with_someone_else_are_likely_to_pursu, 2).
rule_applies(people_in_a_publicly_romantic_relationship_with_someone_else_are_likely_to_pursu, X, Y) :-
    directed_status(X, Y, publicly_romantically_committed_to).
rule_effect(people_in_a_publicly_romantic_relationship_with_someone_else_are_likely_to_pursu, set_intent(X, romance, Y, 2)).


rule_likelihood(people_are_inclined_to_form_romantic_interests_towards_individuals_they_perceive_as_strong, 0.5).
rule_type(people_are_inclined_to_form_romantic_interests_towards_individuals_they_perceive_as_strong, volition).
% People are inclined to form romantic interests towards individuals they perceive as strong.
rule_active(people_are_inclined_to_form_romantic_interests_towards_individuals_they_perceive).
rule_category(people_are_inclined_to_form_romantic_interests_towards_individuals_they_perceive, romantic_attraction).
rule_source(people_are_inclined_to_form_romantic_interests_towards_individuals_they_perceive, ensemble).
rule_priority(people_are_inclined_to_form_romantic_interests_towards_individuals_they_perceive, 1).
rule_applies(people_are_inclined_to_form_romantic_interests_towards_individuals_they_perceive, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val > 6.
rule_effect(people_are_inclined_to_form_romantic_interests_towards_individuals_they_perceive, set_intent(X, romance, Y, -1)).


rule_likelihood(people_desire_to_increase_their_romantic_connections_with_individuals_who_have_a_strong_social_network, 0.5).
rule_type(people_desire_to_increase_their_romantic_connections_with_individuals_who_have_a_strong_social_network, volition).
% People desire to increase their romantic connections with individuals who have a strong social network.
rule_active(people_desire_to_increase_their_romantic_connections_with_individuals_who_have_a).
rule_category(people_desire_to_increase_their_romantic_connections_with_individuals_who_have_a, romantic_attraction).
rule_source(people_desire_to_increase_their_romantic_connections_with_individuals_who_have_a, ensemble).
rule_priority(people_desire_to_increase_their_romantic_connections_with_individuals_who_have_a, 5).
rule_applies(people_desire_to_increase_their_romantic_connections_with_individuals_who_have_a, X, Y) :-
    network(X, Y, romance, Romance_val), Romance_val > 6.
rule_effect(people_desire_to_increase_their_romantic_connections_with_individuals_who_have_a, set_intent(X, romance, Y, 5)).


rule_likelihood(people_develop_romantic_intent_towards_strong_individuals_after_a_significant_event_within_the_past_month, 0.5).
rule_type(people_develop_romantic_intent_towards_strong_individuals_after_a_significant_event_within_the_past_month, volition).
% People develop romantic intent towards strong individuals after a significant event within the past month.
rule_active(people_develop_romantic_intent_towards_strong_individuals_after_a_significant_ev).
rule_category(people_develop_romantic_intent_towards_strong_individuals_after_a_significant_ev, romantic_attraction).
rule_source(people_develop_romantic_intent_towards_strong_individuals_after_a_significant_ev, ensemble).
rule_priority(people_develop_romantic_intent_towards_strong_individuals_after_a_significant_ev, 2).
rule_applies(people_develop_romantic_intent_towards_strong_individuals_after_a_significant_ev, X, Y) :-
    event(X, Y, romantic, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_develop_romantic_intent_towards_strong_individuals_after_a_significant_ev, set_intent(X, romance, Y, 2)).


rule_likelihood(people_seek_romantic_connections_with_individuals_who_have_a_strong_social_network_within_the_last_8_turns, 0.5).
rule_type(people_seek_romantic_connections_with_individuals_who_have_a_strong_social_network_within_the_last_8_turns, volition).
% People seek romantic connections with individuals who have a strong social network within the last 8 turns
rule_active(people_seek_romantic_connections_with_individuals_who_have_a_strong_social_netwo).
rule_category(people_seek_romantic_connections_with_individuals_who_have_a_strong_social_netwo, romantic_attraction).
rule_source(people_seek_romantic_connections_with_individuals_who_have_a_strong_social_netwo, ensemble).
rule_priority(people_seek_romantic_connections_with_individuals_who_have_a_strong_social_netwo, 3).
rule_applies(people_seek_romantic_connections_with_individuals_who_have_a_strong_social_netwo, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_seek_romantic_connections_with_individuals_who_have_a_strong_social_netwo, set_intent(X, romance, Y, -3)).


rule_likelihood(people_with_a_strong_desire_for_friendship_and_who_have_been_in_close_proximity_to_their_crush, 0.5).
rule_type(people_with_a_strong_desire_for_friendship_and_who_have_been_in_close_proximity_to_their_crush, volition).
% People with a strong desire for friendship and who have been in close proximity to their crush
rule_active(people_with_a_strong_desire_for_friendship_and_who_have_been_in_close_proximity).
rule_category(people_with_a_strong_desire_for_friendship_and_who_have_been_in_close_proximity, romantic_attraction).
rule_source(people_with_a_strong_desire_for_friendship_and_who_have_been_in_close_proximity, ensemble).
rule_priority(people_with_a_strong_desire_for_friendship_and_who_have_been_in_close_proximity, 2).
rule_applies(people_with_a_strong_desire_for_friendship_and_who_have_been_in_close_proximity, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_with_a_strong_desire_for_friendship_and_who_have_been_in_close_proximity, set_intent(X, romance, Y, -2)).


rule_likelihood(people_with_a_strong_desire_for_friendship_and_having_had_romantic_intent_towards_their_crush_within_the, 0.5).
rule_type(people_with_a_strong_desire_for_friendship_and_having_had_romantic_intent_towards_their_crush_within_the, volition).
% People with a strong desire for friendship and having had romantic intent towards their crush within the
rule_active(people_with_a_strong_desire_for_friendship_and_having_had_romantic_intent_toward).
rule_category(people_with_a_strong_desire_for_friendship_and_having_had_romantic_intent_toward, romantic_attraction).
rule_source(people_with_a_strong_desire_for_friendship_and_having_had_romantic_intent_toward, ensemble).
rule_priority(people_with_a_strong_desire_for_friendship_and_having_had_romantic_intent_toward, 1).
rule_applies(people_with_a_strong_desire_for_friendship_and_having_had_romantic_intent_toward, X, Z) :-
    network(X, Z, friendship, Friendship_val), Friendship_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 31, TurnsAgo =< 9999.
rule_effect(people_with_a_strong_desire_for_friendship_and_having_had_romantic_intent_toward, set_intent(X, romance, Y, -1)).


rule_likelihood(people_seek_romantic_connections_with_individuals_who_are_well_connected_within_their_social_circles, 0.5).
rule_type(people_seek_romantic_connections_with_individuals_who_are_well_connected_within_their_social_circles, volition).
% People seek romantic connections with individuals who are well-connected within their social circles.
rule_active(people_seek_romantic_connections_with_individuals_who_are_well_connected_within).
rule_category(people_seek_romantic_connections_with_individuals_who_are_well_connected_within, romantic_attraction).
rule_source(people_seek_romantic_connections_with_individuals_who_are_well_connected_within, ensemble).
rule_priority(people_seek_romantic_connections_with_individuals_who_are_well_connected_within, 3).
rule_applies(people_seek_romantic_connections_with_individuals_who_are_well_connected_within, X, Z) :-
    network(X, Z, familial, Familial_val), Familial_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_seek_romantic_connections_with_individuals_who_are_well_connected_within, set_intent(X, romance, Y, -3)).


rule_likelihood(people_desire_romantic_connections_with_individuals_they_perceive_as_strong_within_a_close_network_when_the_average, 0.5).
rule_type(people_desire_romantic_connections_with_individuals_they_perceive_as_strong_within_a_close_network_when_the_average, volition).
% People desire romantic connections with individuals they perceive as strong within a close network when the average
rule_active(people_desire_romantic_connections_with_individuals_they_perceive_as_strong_with).
rule_category(people_desire_romantic_connections_with_individuals_they_perceive_as_strong_with, romantic_attraction).
rule_source(people_desire_romantic_connections_with_individuals_they_perceive_as_strong_with, ensemble).
rule_priority(people_desire_romantic_connections_with_individuals_they_perceive_as_strong_with, 1).
rule_applies(people_desire_romantic_connections_with_individuals_they_perceive_as_strong_with, X, Z) :-
    network(X, Z, familial, Familial_val), Familial_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 31, TurnsAgo =< 9999.
rule_effect(people_desire_romantic_connections_with_individuals_they_perceive_as_strong_with, set_intent(X, romance, Y, -1)).


rule_likelihood(people_seek_to_form_romantic_connections_with_individuals_who_are_highly_regarded_within_their_social_circles, 0.5).
rule_type(people_seek_to_form_romantic_connections_with_individuals_who_are_highly_regarded_within_their_social_circles, volition).
% People seek to form romantic connections with individuals who are highly regarded within their social circles.
rule_active(people_seek_to_form_romantic_connections_with_individuals_who_are_highly_regarde).
rule_category(people_seek_to_form_romantic_connections_with_individuals_who_are_highly_regarde, romantic_attraction).
rule_source(people_seek_to_form_romantic_connections_with_individuals_who_are_highly_regarde, ensemble).
rule_priority(people_seek_to_form_romantic_connections_with_individuals_who_are_highly_regarde, 5).
rule_applies(people_seek_to_form_romantic_connections_with_individuals_who_are_highly_regarde, X, Z) :-
    network(X, Z, romance, Romance_val), Romance_val > 6,
    network(Y, Z, romance, Romance_val), Romance_val > 6.
rule_effect(people_seek_to_form_romantic_connections_with_individuals_who_are_highly_regarde, set_intent(X, romance, Y, -5)).


rule_likelihood(people_s_average_trust_in_strong_individuals_decreases_over_time_if_they_have_not_been_dating, 0.5).
rule_type(people_s_average_trust_in_strong_individuals_decreases_over_time_if_they_have_not_been_dating, volition).
% People’s average trust in strong individuals decreases over time if they have not been dating
rule_active(people_s_average_trust_in_strong_individuals_decreases_over_time_if_they_have_no).
rule_category(people_s_average_trust_in_strong_individuals_decreases_over_time_if_they_have_no, romantic_attraction).
rule_source(people_s_average_trust_in_strong_individuals_decreases_over_time_if_they_have_no, ensemble).
rule_priority(people_s_average_trust_in_strong_individuals_decreases_over_time_if_they_have_no, 5).
rule_applies(people_s_average_trust_in_strong_individuals_decreases_over_time_if_they_have_no, X, Y) :-
    event(X, Y, mean, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_s_average_trust_in_strong_individuals_decreases_over_time_if_they_have_no, set_intent(X, trust, Y, -5)).


rule_likelihood(people_develop_trust_towards_their_crush_after_frequent_positive_encounters_within_the_last_week, 0.5).
rule_type(people_develop_trust_towards_their_crush_after_frequent_positive_encounters_within_the_last_week, volition).
% People develop trust towards their crush after frequent positive encounters within the last week.
rule_active(people_develop_trust_towards_their_crush_after_frequent_positive_encounters_with).
rule_category(people_develop_trust_towards_their_crush_after_frequent_positive_encounters_with, romantic_attraction).
rule_source(people_develop_trust_towards_their_crush_after_frequent_positive_encounters_with, ensemble).
rule_priority(people_develop_trust_towards_their_crush_after_frequent_positive_encounters_with, 1).
rule_applies(people_develop_trust_towards_their_crush_after_frequent_positive_encounters_with, X, Z) :-
    network(X, Z, romance, Romance_val), Romance_val > 6,
    event(Y, Z, nice, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_develop_trust_towards_their_crush_after_frequent_positive_encounters_with, set_intent(X, trust, Y, -1)).


rule_likelihood(people_develop_trust_towards_their_crush_when_they_have_been_in_a_romantic_event_within_the_past, 0.5).
rule_type(people_develop_trust_towards_their_crush_when_they_have_been_in_a_romantic_event_within_the_past, volition).
% People develop trust towards their crush when they have been in a romantic event within the past
rule_active(people_develop_trust_towards_their_crush_when_they_have_been_in_a_romantic_event).
rule_category(people_develop_trust_towards_their_crush_when_they_have_been_in_a_romantic_event, romantic_attraction).
rule_source(people_develop_trust_towards_their_crush_when_they_have_been_in_a_romantic_event, ensemble).
rule_priority(people_develop_trust_towards_their_crush_when_they_have_been_in_a_romantic_event, 2).
rule_applies(people_develop_trust_towards_their_crush_when_they_have_been_in_a_romantic_event, X, Z) :-
    network(X, Z, romance, Romance_val), Romance_val > 6,
    event(Y, Z, romantic, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_develop_trust_towards_their_crush_when_they_have_been_in_a_romantic_event, set_intent(X, trust, Y, -2)).


rule_likelihood(people_seek_stronger_connections_when_they_have_a_high_romantic_interest_in_someone_and_trust_has_been_established, 0.5).
rule_type(people_seek_stronger_connections_when_they_have_a_high_romantic_interest_in_someone_and_trust_has_been_established, volition).
% People seek stronger connections when they have a high romantic interest in someone and trust has been established
rule_active(people_seek_stronger_connections_when_they_have_a_high_romantic_interest_in_some).
rule_category(people_seek_stronger_connections_when_they_have_a_high_romantic_interest_in_some, romantic_attraction).
rule_source(people_seek_stronger_connections_when_they_have_a_high_romantic_interest_in_some, ensemble).
rule_priority(people_seek_stronger_connections_when_they_have_a_high_romantic_interest_in_some, 2).
rule_applies(people_seek_stronger_connections_when_they_have_a_high_romantic_interest_in_some, X, Z) :-
    network(X, Z, romance, Romance_val), Romance_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_seek_stronger_connections_when_they_have_a_high_romantic_interest_in_some, set_intent(X, trust, Y, -2)).


rule_likelihood(people_seek_stronger_connections_with_individuals_they_are_romantically_interested_in_when_their_trust_level_towards_those, 0.5).
rule_type(people_seek_stronger_connections_with_individuals_they_are_romantically_interested_in_when_their_trust_level_towards_those, volition).
% People seek stronger connections with individuals they are romantically interested in when their trust level towards those
rule_active(people_seek_stronger_connections_with_individuals_they_are_romantically_interest).
rule_category(people_seek_stronger_connections_with_individuals_they_are_romantically_interest, romantic_attraction).
rule_source(people_seek_stronger_connections_with_individuals_they_are_romantically_interest, ensemble).
rule_priority(people_seek_stronger_connections_with_individuals_they_are_romantically_interest, 1).
rule_applies(people_seek_stronger_connections_with_individuals_they_are_romantically_interest, X, Z) :-
    network(X, Z, romance, Romance_val), Romance_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 31, TurnsAgo =< 9999.
rule_effect(people_seek_stronger_connections_with_individuals_they_are_romantically_interest, set_intent(X, trust, Y, -1)).


rule_likelihood(people_seek_to_increase_trust_with_their_crush_within_8_turns_based_on_a_strong_network_connection, 0.5).
rule_type(people_seek_to_increase_trust_with_their_crush_within_8_turns_based_on_a_strong_network_connection, volition).
% People seek to increase trust with their crush within 8 turns based on a strong network connection
rule_active(people_seek_to_increase_trust_with_their_crush_within_8_turns_based_on_a_strong).
rule_category(people_seek_to_increase_trust_with_their_crush_within_8_turns_based_on_a_strong, romantic_attraction).
rule_source(people_seek_to_increase_trust_with_their_crush_within_8_turns_based_on_a_strong, ensemble).
rule_priority(people_seek_to_increase_trust_with_their_crush_within_8_turns_based_on_a_strong, 3).
rule_applies(people_seek_to_increase_trust_with_their_crush_within_8_turns_based_on_a_strong, X, Z) :-
    network(X, Z, familial, Familial_val), Familial_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_seek_to_increase_trust_with_their_crush_within_8_turns_based_on_a_strong, set_intent(X, trust, Y, -3)).


rule_likelihood(people_aren_t_nice_to_people_they_are_dating_if_that_person_is_dating_someone_else, 0.5).
rule_type(people_aren_t_nice_to_people_they_are_dating_if_that_person_is_dating_someone_else, volition).
% Cheater!
rule_active(people_aren_t_nice_to_people_they_are_dating_if_that_person_is_dating_someone_el).
rule_category(people_aren_t_nice_to_people_they_are_dating_if_that_person_is_dating_someone_el, romantic_attraction).
rule_source(people_aren_t_nice_to_people_they_are_dating_if_that_person_is_dating_someone_el, ensemble).
rule_priority(people_aren_t_nice_to_people_they_are_dating_if_that_person_is_dating_someone_el, 5).
rule_applies(people_aren_t_nice_to_people_they_are_dating_if_that_person_is_dating_someone_el, X, Y) :-
    relationship(X, Y, dating),
    relationship(Y, Z, dating).
rule_effect(people_aren_t_nice_to_people_they_are_dating_if_that_person_is_dating_someone_el, set_intent(X, rude, Y, 5)).


rule_likelihood(people_are_much_more_rude_to_those_that_they_aren_t_attracted_to_if_they_have_flirted_with_them_recently, 0.5).
rule_type(people_are_much_more_rude_to_those_that_they_aren_t_attracted_to_if_they_have_flirted_with_them_recently, volition).
% Memory: Unsolicited Flirting Begets Rudeness
rule_active(people_are_much_more_rude_to_those_that_they_aren_t_attracted_to_if_they_have_fl).
rule_category(people_are_much_more_rude_to_those_that_they_aren_t_attracted_to_if_they_have_fl, romantic_attraction).
rule_source(people_are_much_more_rude_to_those_that_they_aren_t_attracted_to_if_they_have_fl, ensemble).
rule_priority(people_are_much_more_rude_to_those_that_they_aren_t_attracted_to_if_they_have_fl, 5).
rule_applies(people_are_much_more_rude_to_those_that_they_aren_t_attracted_to_if_they_have_fl, Y, X) :-
    event(Y, X, flirted_with, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8,
    network(X, Y, attraction, Attraction_val), Attraction_val < 4.
rule_effect(people_are_much_more_rude_to_those_that_they_aren_t_attracted_to_if_they_have_fl, set_intent(X, rude, Y, 5)).


rule_likelihood(people_are_more_rude_to_those_they_are_unattracted_to_who_have_ever_flirted_with_them_ever, 0.5).
rule_type(people_are_more_rude_to_those_they_are_unattracted_to_who_have_ever_flirted_with_them_ever, volition).
% Deep Memory: I’ll Never Love You
rule_active(people_are_more_rude_to_those_they_are_unattracted_to_who_have_ever_flirted_with).
rule_category(people_are_more_rude_to_those_they_are_unattracted_to_who_have_ever_flirted_with, romantic_attraction).
rule_source(people_are_more_rude_to_those_they_are_unattracted_to_who_have_ever_flirted_with, ensemble).
rule_priority(people_are_more_rude_to_those_they_are_unattracted_to_who_have_ever_flirted_with, 3).
rule_applies(people_are_more_rude_to_those_they_are_unattracted_to_who_have_ever_flirted_with, Y, X) :-
    event(Y, X, flirted_with, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 0,
    network(X, Y, attraction, Attraction_val), Attraction_val < 4.
rule_effect(people_are_more_rude_to_those_they_are_unattracted_to_who_have_ever_flirted_with, set_intent(X, rude, Y, 3)).


rule_likelihood(people_are_much_less_rude_to_those_who_they_are_attracted_to_if_they_flirted_with_them_recently, 0.5).
rule_type(people_are_much_less_rude_to_those_who_they_are_attracted_to_if_they_flirted_with_them_recently, volition).
% Memory: I Think They Like Me
rule_active(people_are_much_less_rude_to_those_who_they_are_attracted_to_if_they_flirted_wit).
rule_category(people_are_much_less_rude_to_those_who_they_are_attracted_to_if_they_flirted_wit, romantic_attraction).
rule_source(people_are_much_less_rude_to_those_who_they_are_attracted_to_if_they_flirted_wit, ensemble).
rule_priority(people_are_much_less_rude_to_those_who_they_are_attracted_to_if_they_flirted_wit, 5).
rule_applies(people_are_much_less_rude_to_those_who_they_are_attracted_to_if_they_flirted_wit, Y, X) :-
    event(Y, X, flirted_with, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8,
    network(X, Y, attraction, Attraction_val), Attraction_val > 7.
rule_effect(people_are_much_less_rude_to_those_who_they_are_attracted_to_if_they_flirted_wit, set_intent(X, rude, Y, -5)).


rule_likelihood(people_are_more_inclined_in_general_to_flirt_with_their_coworkers_even_if_they_aren_t_attracted_to_them, 0.5).
rule_type(people_are_more_inclined_in_general_to_flirt_with_their_coworkers_even_if_they_aren_t_attracted_to_them, volition).
% Take What You Can Get
rule_active(people_are_more_inclined_in_general_to_flirt_with_their_coworkers_even_if_they_a).
rule_category(people_are_more_inclined_in_general_to_flirt_with_their_coworkers_even_if_they_a, romantic_attraction).
rule_source(people_are_more_inclined_in_general_to_flirt_with_their_coworkers_even_if_they_a, ensemble).
rule_priority(people_are_more_inclined_in_general_to_flirt_with_their_coworkers_even_if_they_a, 1).
rule_applies(people_are_more_inclined_in_general_to_flirt_with_their_coworkers_even_if_they_a, X, Y) :-
    relationship(X, Y, coworker),
    network(X, Y, attraction, Attraction_val), Attraction_val < 4.
rule_effect(people_are_more_inclined_in_general_to_flirt_with_their_coworkers_even_if_they_a, set_intent(X, flirt, Y, 1)).


rule_likelihood(friend_zone_people_flirt_less_with_people_they_have_a_lot_of_friendly_feeling_towards_as_long_as_they_aren_t_dating, 0.5).
rule_type(friend_zone_people_flirt_less_with_people_they_have_a_lot_of_friendly_feeling_towards_as_long_as_they_aren_t_dating, volition).
% The Friend Zone
rule_active(friend_zone_people_flirt_less_with_people_they_have_a_lot_of_friendly_feeling_t).
rule_category(friend_zone_people_flirt_less_with_people_they_have_a_lot_of_friendly_feeling_t, romantic_attraction).
rule_source(friend_zone_people_flirt_less_with_people_they_have_a_lot_of_friendly_feeling_t, ensemble).
rule_priority(friend_zone_people_flirt_less_with_people_they_have_a_lot_of_friendly_feeling_t, 3).
rule_applies(friend_zone_people_flirt_less_with_people_they_have_a_lot_of_friendly_feeling_t, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val > 7,
    \+ relationship(X, Y, dating).
rule_effect(friend_zone_people_flirt_less_with_people_they_have_a_lot_of_friendly_feeling_t, set_intent(X, flirt, Y, -3)).

%% ─── Social (5 rules) ───


rule_type(workplace_romance, action).
rule_category(workplace_romance, social).
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(workplace_romance).
rule_priority(workplace_romance, 4).
rule_likelihood(workplace_romance, 0.1).

rule_applies(workplace_romance, Person1, Person2) :-
    person(Person1), person(Person2),
    Person1 \= Person2,
    \+ married_to(Person1, _),
    \+ married_to(Person2, _),
    alive(Person1), alive(Person2).

rule_effect(workplace_romance, Person1, Person2, trigger_marriage(Person1, Person2)).


rule_type(neighbor_friendship, action).
rule_category(neighbor_friendship, social).
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(neighbor_friendship).
rule_priority(neighbor_friendship, 3).
rule_likelihood(neighbor_friendship, 0.3).

rule_applies(neighbor_friendship, Person1, Person2) :-
    person(Person1), person(Person2),
    Person1 \= Person2,
    personality(Person1, extraversion, E), E > 0.2,
    personality(Person2, agreeableness, A), A > 0.2,
    \+ friend_of(Person1, Person2).

rule_effect(neighbor_friendship, Person1, Person2, add_relationship(Person1, Person2, friend)).


rule_type(extrovert_socializing, action).
rule_category(extrovert_socializing, social).
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(extrovert_socializing).
rule_priority(extrovert_socializing, 3).
rule_likelihood(extrovert_socializing, 0.4).

rule_applies(extrovert_socializing, Person, _) :-
    person(Person),
    personality(Person, extraversion, E), E > 0.6,
    alive(Person).

rule_effect(extrovert_socializing, Person, _, organize_gathering(Person)).


rule_type(reputation_gossip, action).
rule_category(reputation_gossip, social).
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(reputation_gossip).
rule_priority(reputation_gossip, 2).
rule_likelihood(reputation_gossip, 0.4).

rule_applies(reputation_gossip, Gossiper, Listener) :-
    person(Gossiper), person(Listener),
    Gossiper \= Listener,
    friend_of(Gossiper, Listener),
    at_location(Gossiper, Loc),
    at_location(Listener, Loc),
    personality(Gossiper, extraversion, E), E > 0.3,
    alive(Gossiper), alive(Listener).

rule_effect(reputation_gossip, Gossiper, Listener, spread_gossip(Gossiper, Listener)).


rule_type(heroic_deed_reputation, action).
rule_category(heroic_deed_reputation, social).
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(heroic_deed_reputation).
rule_priority(heroic_deed_reputation, 8).
rule_likelihood(heroic_deed_reputation, 1.0).

rule_applies(heroic_deed_reputation, Person, _) :-
    person(Person),
    alive(Person).

rule_effect(heroic_deed_reputation, Person, _, update_reputation(Person, 30)).
rule_effect(heroic_deed_reputation, Person, _, add_title(Person, hero)).

%% ─── Social Connection (6 rules) ───


rule_likelihood(people_with_a_strong_desire_to_connect_and_the_recent_positive_mean_interaction_within_8_turns_are_likely, 1).
rule_type(people_with_a_strong_desire_to_connect_and_the_recent_positive_mean_interaction_within_8_turns_are_likely, volition).
% People with a strong desire to connect and the recent positive mean interaction within 8 turns are likely
rule_active(people_with_a_strong_desire_to_connect_and_the_recent_positive_mean_interaction).
rule_category(people_with_a_strong_desire_to_connect_and_the_recent_positive_mean_interaction, social_connection).
rule_source(people_with_a_strong_desire_to_connect_and_the_recent_positive_mean_interaction, ensemble).
rule_priority(people_with_a_strong_desire_to_connect_and_the_recent_positive_mean_interaction, 1).
rule_applies(people_with_a_strong_desire_to_connect_and_the_recent_positive_mean_interaction, X, Z) :-
    network(X, Z, romance, Romance_val), Romance_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_with_a_strong_desire_to_connect_and_the_recent_positive_mean_interaction, set_intent(X, candid, Y, -1)).


rule_likelihood(people_with_a_strong_familial_network_of_connections_with_at_least_6_members_and_who, 1).
rule_type(people_with_a_strong_familial_network_of_connections_with_at_least_6_members_and_who, volition).
% People with a strong familial network of connections (with at least 6 members) and who
rule_active(people_with_a_strong_familial_network_of_connections_with_at_least_6_members_a).
rule_category(people_with_a_strong_familial_network_of_connections_with_at_least_6_members_a, social_connection).
rule_source(people_with_a_strong_familial_network_of_connections_with_at_least_6_members_a, ensemble).
rule_priority(people_with_a_strong_familial_network_of_connections_with_at_least_6_members_a, 1).
rule_applies(people_with_a_strong_familial_network_of_connections_with_at_least_6_members_a, X, Z) :-
    network(X, Z, familial, Familial_val), Familial_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_with_a_strong_familial_network_of_connections_with_at_least_6_members_a, set_intent(X, candid, Y, -1)).


rule_likelihood(people_with_a_strong_familial_network_of_connections_greater_than_6_and_who_have_had_an_interest, 1).
rule_type(people_with_a_strong_familial_network_of_connections_greater_than_6_and_who_have_had_an_interest, volition).
% People with a strong familial network of connections greater than 6 and who have had an interest
rule_active(people_with_a_strong_familial_network_of_connections_greater_than_6_and_who_have).
rule_category(people_with_a_strong_familial_network_of_connections_greater_than_6_and_who_have, social_connection).
rule_source(people_with_a_strong_familial_network_of_connections_greater_than_6_and_who_have, ensemble).
rule_priority(people_with_a_strong_familial_network_of_connections_greater_than_6_and_who_have, 1).
rule_applies(people_with_a_strong_familial_network_of_connections_greater_than_6_and_who_have, X, Z) :-
    network(X, Z, familial, Familial_val), Familial_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 31, TurnsAgo =< 9999.
rule_effect(people_with_a_strong_familial_network_of_connections_greater_than_6_and_who_have, set_intent(X, candid, Y, -1)).


rule_likelihood(people_feel_gratitude_towards_others_with_a_higher_network_influence_score_than_themselves, 1).
rule_type(people_feel_gratitude_towards_others_with_a_higher_network_influence_score_than_themselves, volition).
% People feel gratitude towards others with a higher network influence score than themselves.
rule_active(people_feel_gratitude_towards_others_with_a_higher_network_influence_score_than).
rule_category(people_feel_gratitude_towards_others_with_a_higher_network_influence_score_than, social_connection).
rule_source(people_feel_gratitude_towards_others_with_a_higher_network_influence_score_than, ensemble).
rule_priority(people_feel_gratitude_towards_others_with_a_higher_network_influence_score_than, 3).
rule_applies(people_feel_gratitude_towards_others_with_a_higher_network_influence_score_than, X, Y) :-
    network(X, Y, gratitude, Gratitude_val), Gratitude_val > 6.
rule_effect(people_feel_gratitude_towards_others_with_a_higher_network_influence_score_than, set_intent(X, favor, Y, 3)).


rule_likelihood(people_seek_stronger_connections_when_they_have_a_moderate_sized_network_of_acquaintances, 1).
rule_type(people_seek_stronger_connections_when_they_have_a_moderate_sized_network_of_acquaintances, volition).
% People seek stronger connections when they have a moderate-sized network of acquaintances.
rule_active(people_seek_stronger_connections_when_they_have_a_moderate_sized_network_of_acqu).
rule_category(people_seek_stronger_connections_when_they_have_a_moderate_sized_network_of_acqu, social_connection).
rule_source(people_seek_stronger_connections_when_they_have_a_moderate_sized_network_of_acqu, ensemble).
rule_priority(people_seek_stronger_connections_when_they_have_a_moderate_sized_network_of_acqu, 1).
rule_applies(people_seek_stronger_connections_when_they_have_a_moderate_sized_network_of_acqu, X, Y) :-
    network(X, Y, familial, Familial_val), Familial_val > 6.
rule_effect(people_seek_stronger_connections_when_they_have_a_moderate_sized_network_of_acqu, set_intent(X, honor, Y, 1)).


rule_likelihood(people_desire_stronger_connections_with_individuals_of_higher_social_influence_in_their_network, 1).
rule_type(people_desire_stronger_connections_with_individuals_of_higher_social_influence_in_their_network, volition).
% People desire stronger connections with individuals of higher social influence in their network.
rule_active(people_desire_stronger_connections_with_individuals_of_higher_social_influence_i).
rule_category(people_desire_stronger_connections_with_individuals_of_higher_social_influence_i, social_connection).
rule_source(people_desire_stronger_connections_with_individuals_of_higher_social_influence_i, ensemble).
rule_priority(people_desire_stronger_connections_with_individuals_of_higher_social_influence_i, 5).
rule_applies(people_desire_stronger_connections_with_individuals_of_higher_social_influence_i, X, Y) :-
    network(X, Y, romance, Romance_val), Romance_val > 6.
rule_effect(people_desire_stronger_connections_with_individuals_of_higher_social_influence_i, set_intent(X, kind, Y, 5)).

%% ─── Social Distance (14 rules) ───


rule_likelihood(people_with_a_high_affinity_for_others_want_to_avoid_the_attention_of_nosy_friends, 1).
rule_type(people_with_a_high_affinity_for_others_want_to_avoid_the_attention_of_nosy_friends, volition).
% People with a high affinity for others want to avoid the attention of nosy friends
rule_active(people_with_a_high_affinity_for_others_want_to_avoid_the_attention_of_nosy_frien).
rule_category(people_with_a_high_affinity_for_others_want_to_avoid_the_attention_of_nosy_frien, social_distance).
rule_source(people_with_a_high_affinity_for_others_want_to_avoid_the_attention_of_nosy_frien, ensemble).
rule_priority(people_with_a_high_affinity_for_others_want_to_avoid_the_attention_of_nosy_frien, 5).
rule_applies(people_with_a_high_affinity_for_others_want_to_avoid_the_attention_of_nosy_frien, X, Z) :-
    attribute(X, nosiness, Nosiness_val), Nosiness_val > 60,
    network(Z, Y, affinity, Affinity_val), Affinity_val > 70,
    relationship(X, Y, friends).
rule_effect(people_with_a_high_affinity_for_others_want_to_avoid_the_attention_of_nosy_frien, modify_network(Z, Y, curiosity, '+', 0)).


rule_likelihood(if_someone_is_interacting_with_an_outsider_then_they_will_be_more_likely_to_be_reluctant, 1).
rule_type(if_someone_is_interacting_with_an_outsider_then_they_will_be_more_likely_to_be_reluctant, volition).
% If someone is interacting with an outsider, then they will be more likely to be reluctant.
rule_active(if_someone_is_interacting_with_an_outsider_then_they_will_be_more_likely_to_be).
rule_category(if_someone_is_interacting_with_an_outsider_then_they_will_be_more_likely_to_be, social_distance).
rule_source(if_someone_is_interacting_with_an_outsider_then_they_will_be_more_likely_to_be, ensemble).
rule_priority(if_someone_is_interacting_with_an_outsider_then_they_will_be_more_likely_to_be, 5).
rule_applies(if_someone_is_interacting_with_an_outsider_then_they_will_be_more_likely_to_be, Y, _) :-
    status(Y, outsider).
rule_effect(if_someone_is_interacting_with_an_outsider_then_they_will_be_more_likely_to_be, set_intent(X, reluctant, Y, 5)).


rule_likelihood(if_someone_has_positively_met_an_outsider_then_they_are_less_likely_to_be_reluctant, 1).
rule_type(if_someone_has_positively_met_an_outsider_then_they_are_less_likely_to_be_reluctant, volition).
% If someone has positively met an outsider, then they are less likely to be reluctant.
rule_active(if_someone_has_positively_met_an_outsider_then_they_are_less_likely_to_be_reluc).
rule_category(if_someone_has_positively_met_an_outsider_then_they_are_less_likely_to_be_reluc, social_distance).
rule_source(if_someone_has_positively_met_an_outsider_then_they_are_less_likely_to_be_reluc, ensemble).
rule_priority(if_someone_has_positively_met_an_outsider_then_they_are_less_likely_to_be_reluc, 3).
rule_applies(if_someone_has_positively_met_an_outsider_then_they_are_less_likely_to_be_reluc, Y, X) :-
    status(Y, outsider),
    event(X, Y, met, _),
    event(Y, X, positive, _).
rule_effect(if_someone_has_positively_met_an_outsider_then_they_are_less_likely_to_be_reluc, set_intent(X, reluctant, Y, -3)).


rule_likelihood(if_someone_has_negatively_met_an_outsider_then_they_are_more_likely_to_be_reluctant, 1).
rule_type(if_someone_has_negatively_met_an_outsider_then_they_are_more_likely_to_be_reluctant, volition).
% If someone has negatively met an outsider, then they are more likely to be reluctant.
rule_active(if_someone_has_negatively_met_an_outsider_then_they_are_more_likely_to_be_reluc).
rule_category(if_someone_has_negatively_met_an_outsider_then_they_are_more_likely_to_be_reluc, social_distance).
rule_source(if_someone_has_negatively_met_an_outsider_then_they_are_more_likely_to_be_reluc, ensemble).
rule_priority(if_someone_has_negatively_met_an_outsider_then_they_are_more_likely_to_be_reluc, 3).
rule_applies(if_someone_has_negatively_met_an_outsider_then_they_are_more_likely_to_be_reluc, Y, X) :-
    status(Y, outsider),
    event(X, Y, met, _),
    event(Y, X, negative, _).
rule_effect(if_someone_has_negatively_met_an_outsider_then_they_are_more_likely_to_be_reluc, set_intent(X, reluctant, Y, 3)).


rule_likelihood(if_you_have_high_familiarity_towars_someone_you_are_less_likely_to_be_reluctant_towards_them, 1).
rule_type(if_you_have_high_familiarity_towars_someone_you_are_less_likely_to_be_reluctant_towards_them, volition).
% If you have high familiarity towars someone you are less likely to be reluctant towards them.
rule_active(if_you_have_high_familiarity_towars_someone_you_are_less_likely_to_be_reluctant).
rule_category(if_you_have_high_familiarity_towars_someone_you_are_less_likely_to_be_reluctant, social_distance).
rule_source(if_you_have_high_familiarity_towars_someone_you_are_less_likely_to_be_reluctant, ensemble).
rule_priority(if_you_have_high_familiarity_towars_someone_you_are_less_likely_to_be_reluctant, 1).
rule_applies(if_you_have_high_familiarity_towars_someone_you_are_less_likely_to_be_reluctant, X, Y) :-
    intent(X, reluctant, Y, _).
rule_effect(if_you_have_high_familiarity_towars_someone_you_are_less_likely_to_be_reluctant, set_intent(X, reluctant, Y, -1)).


rule_likelihood(people_are_more_likely_to_be_reluctant_to_somebody_if_their_family_members_don_t_trust_them, 1).
rule_type(people_are_more_likely_to_be_reluctant_to_somebody_if_their_family_members_don_t_trust_them, volition).
% People are more likely to be reluctant to somebody if their family members don’t trust them.
rule_active(people_are_more_likely_to_be_reluctant_to_somebody_if_their_family_members_don_t).
rule_category(people_are_more_likely_to_be_reluctant_to_somebody_if_their_family_members_don_t, social_distance).
rule_source(people_are_more_likely_to_be_reluctant_to_somebody_if_their_family_members_don_t, ensemble).
rule_priority(people_are_more_likely_to_be_reluctant_to_somebody_if_their_family_members_don_t, 1).
rule_applies(people_are_more_likely_to_be_reluctant_to_somebody_if_their_family_members_don_t, Z, Y) :-
    network(Z, Y, trust, Trust_val), Trust_val < 5,
    status(X, family),
    status(Z, family).
rule_effect(people_are_more_likely_to_be_reluctant_to_somebody_if_their_family_members_don_t, set_intent(X, reluctant, Y, 1)).


rule_likelihood(high_status_person_has_more_likely_to_be_reluctant_if_they_are_treated_informally, 1).
rule_type(high_status_person_has_more_likely_to_be_reluctant_if_they_are_treated_informally, volition).
% High status person has more likely to be reluctant if they are treated informally
rule_active(high_status_person_has_more_likely_to_be_reluctant_if_they_are_treated_informall).
rule_category(high_status_person_has_more_likely_to_be_reluctant_if_they_are_treated_informall, social_distance).
rule_source(high_status_person_has_more_likely_to_be_reluctant_if_they_are_treated_informall, ensemble).
rule_priority(high_status_person_has_more_likely_to_be_reluctant_if_they_are_treated_informall, 5).
rule_applies(high_status_person_has_more_likely_to_be_reluctant_if_they_are_treated_informall, Y, X) :-
    event(Y, X, informal, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 1,
    attribute(X, status_individual, Status_individual_val), Status_individual_val > 50.
rule_effect(high_status_person_has_more_likely_to_be_reluctant_if_they_are_treated_informall, set_intent(X, reluctant, Y, 5)).


rule_likelihood(no_greet_neutral_request_for_a_low_status_person_reluctant_volition_increased, 1).
rule_type(no_greet_neutral_request_for_a_low_status_person_reluctant_volition_increased, volition).
% No Greet + neutral request for a low status person -> reluctant volition increased
rule_active(no_greet_neutral_request_for_a_low_status_person_reluctant_volition_increas).
rule_category(no_greet_neutral_request_for_a_low_status_person_reluctant_volition_increas, social_distance).
rule_source(no_greet_neutral_request_for_a_low_status_person_reluctant_volition_increas, ensemble).
rule_priority(no_greet_neutral_request_for_a_low_status_person_reluctant_volition_increas, 5).
rule_applies(no_greet_neutral_request_for_a_low_status_person_reluctant_volition_increas, X, Y) :-
    event(X, Y, met, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 2,
    event(Y, X, neutral, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 2,
    attribute(X, status_individual, Status_individual_val), Status_individual_val < 51.
rule_effect(no_greet_neutral_request_for_a_low_status_person_reluctant_volition_increas, set_intent(X, reluctant, Y, 5)).


rule_likelihood(positive_and_respectful_request_to_a_low_status_person_increased_reluctant_volition, 1).
rule_type(positive_and_respectful_request_to_a_low_status_person_increased_reluctant_volition, volition).
% Positive and respectful request to a low status person -> increased reluctant volition
rule_active(positive_and_respectful_request_to_a_low_status_person_increased_reluctant_vo).
rule_category(positive_and_respectful_request_to_a_low_status_person_increased_reluctant_vo, social_distance).
rule_source(positive_and_respectful_request_to_a_low_status_person_increased_reluctant_vo, ensemble).
rule_priority(positive_and_respectful_request_to_a_low_status_person_increased_reluctant_vo, 5).
rule_applies(positive_and_respectful_request_to_a_low_status_person_increased_reluctant_vo, X, Y) :-
    event(X, Y, positive, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 2,
    event(Y, X, respectful, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 2,
    attribute(X, status_individual, Status_individual_val), Status_individual_val < 51.
rule_effect(positive_and_respectful_request_to_a_low_status_person_increased_reluctant_vo, set_intent(X, reluctant, Y, 5)).


rule_likelihood(negative_and_neutral_request_to_a_low_status_person_increased_reluctant_volition, 1).
rule_type(negative_and_neutral_request_to_a_low_status_person_increased_reluctant_volition, volition).
% Negative and neutral request to a low status person -> increased reluctant volition
rule_active(negative_and_neutral_request_to_a_low_status_person_increased_reluctant_volit).
rule_category(negative_and_neutral_request_to_a_low_status_person_increased_reluctant_volit, social_distance).
rule_source(negative_and_neutral_request_to_a_low_status_person_increased_reluctant_volit, ensemble).
rule_priority(negative_and_neutral_request_to_a_low_status_person_increased_reluctant_volit, 5).
rule_applies(negative_and_neutral_request_to_a_low_status_person_increased_reluctant_volit, X, Y) :-
    event(X, Y, negative, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 2,
    event(Y, X, neutral, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 2,
    attribute(X, status_individual, Status_individual_val), Status_individual_val < 51.
rule_effect(negative_and_neutral_request_to_a_low_status_person_increased_reluctant_volit, set_intent(X, reluctant, Y, 5)).


rule_likelihood(people_seek_to_distance_themselves_from_average_individuals_when_they_have_a_strong_attraction_towards_someone_and_it, 1).
rule_type(people_seek_to_distance_themselves_from_average_individuals_when_they_have_a_strong_attraction_towards_someone_and_it, volition).
% People seek to distance themselves from average individuals when they have a strong attraction towards someone and it
rule_active(people_seek_to_distance_themselves_from_average_individuals_when_they_have_a_str).
rule_category(people_seek_to_distance_themselves_from_average_individuals_when_they_have_a_str, social_distance).
rule_source(people_seek_to_distance_themselves_from_average_individuals_when_they_have_a_str, ensemble).
rule_priority(people_seek_to_distance_themselves_from_average_individuals_when_they_have_a_str, 3).
rule_applies(people_seek_to_distance_themselves_from_average_individuals_when_they_have_a_str, X, Z) :-
    network(X, Z, romance, Romance_val), Romance_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_seek_to_distance_themselves_from_average_individuals_when_they_have_a_str, set_intent(X, antagonize, Y, 3)).


rule_likelihood(people_desire_to_be_in_the_presence_of_influential_individuals_while_avoiding_their_crush, 1).
rule_type(people_desire_to_be_in_the_presence_of_influential_individuals_while_avoiding_their_crush, volition).
% People desire to be in the presence of influential individuals while avoiding their crush.
rule_active(people_desire_to_be_in_the_presence_of_influential_individuals_while_avoiding_th).
rule_category(people_desire_to_be_in_the_presence_of_influential_individuals_while_avoiding_th, social_distance).
rule_source(people_desire_to_be_in_the_presence_of_influential_individuals_while_avoiding_th, ensemble).
rule_priority(people_desire_to_be_in_the_presence_of_influential_individuals_while_avoiding_th, 1).
rule_applies(people_desire_to_be_in_the_presence_of_influential_individuals_while_avoiding_th, X, Y) :-
    event(X, Y, mean, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_desire_to_be_in_the_presence_of_influential_individuals_while_avoiding_th, set_intent(X, candid, Y, -1)).


rule_likelihood(people_avoid_those_they_are_afraid_of_and_may_favor_getting_closer_to_strong_individuals, 1).
rule_type(people_avoid_those_they_are_afraid_of_and_may_favor_getting_closer_to_strong_individuals, volition).
% People avoid those they are afraid of and may favor getting closer to strong individuals.
rule_active(people_avoid_those_they_are_afraid_of_and_may_favor_getting_closer_to_strong_ind).
rule_category(people_avoid_those_they_are_afraid_of_and_may_favor_getting_closer_to_strong_ind, social_distance).
rule_source(people_avoid_those_they_are_afraid_of_and_may_favor_getting_closer_to_strong_ind, ensemble).
rule_priority(people_avoid_those_they_are_afraid_of_and_may_favor_getting_closer_to_strong_ind, 1).
rule_applies(people_avoid_those_they_are_afraid_of_and_may_favor_getting_closer_to_strong_ind, X, Y) :-
    directed_status(X, Y, afraid_of).
rule_effect(people_avoid_those_they_are_afraid_of_and_may_favor_getting_closer_to_strong_ind, set_intent(X, favor, Y, 1)).


rule_likelihood(people_avoid_dating_their_rivals_partners_when_they_desire_to_improve_social_standing, 1).
rule_type(people_avoid_dating_their_rivals_partners_when_they_desire_to_improve_social_standing, volition).
% People avoid dating their rivals’ partners when they desire to improve social standing.
rule_active(people_avoid_dating_their_rivals_partners_when_they_desire_to_improve_social_st).
rule_category(people_avoid_dating_their_rivals_partners_when_they_desire_to_improve_social_st, social_distance).
rule_source(people_avoid_dating_their_rivals_partners_when_they_desire_to_improve_social_st, ensemble).
rule_priority(people_avoid_dating_their_rivals_partners_when_they_desire_to_improve_social_st, 1).
rule_applies(people_avoid_dating_their_rivals_partners_when_they_desire_to_improve_social_st, X, Y) :-
    directed_status(X, Y, rivals).
rule_effect(people_avoid_dating_their_rivals_partners_when_they_desire_to_improve_social_st, set_intent(X, honor, Y, -1)).

%% ─── Trust Credibility (13 rules) ───


rule_likelihood(attractive_and_trustworthy_people_lead_suspicious_people_to_have_increased_credibility_in_them, 1).
rule_type(attractive_and_trustworthy_people_lead_suspicious_people_to_have_increased_credibility_in_them, volition).
% Attractive and trustworthy people lead suspicious people to have increased credibility in them
rule_active(attractive_and_trustworthy_people_lead_suspicious_people_to_have_increased_credi).
rule_category(attractive_and_trustworthy_people_lead_suspicious_people_to_have_increased_credi, trust_credibility).
rule_source(attractive_and_trustworthy_people_lead_suspicious_people_to_have_increased_credi, ensemble).
rule_priority(attractive_and_trustworthy_people_lead_suspicious_people_to_have_increased_credi, 5).
rule_applies(attractive_and_trustworthy_people_lead_suspicious_people_to_have_increased_credi, X, Y) :-
    directed_status(X, Y, suspicious_of),
    attribute(Y, charisma, Charisma_val), Charisma_val > 60,
    trait(Y, innocent_looking).
rule_effect(attractive_and_trustworthy_people_lead_suspicious_people_to_have_increased_credi, modify_network(Y, X, credibility, '+', 0)).


rule_likelihood(workers_are_not_likely_to_increase_affinity_esteem_and_credibility_for_their_employers, 1).
rule_type(workers_are_not_likely_to_increase_affinity_esteem_and_credibility_for_their_employers, volition).
% Workers are not likely to increase affinity, esteem, and credibility for their employers
rule_active(workers_are_not_likely_to_increase_affinity_esteem_and_credibility_for_their_e).
rule_category(workers_are_not_likely_to_increase_affinity_esteem_and_credibility_for_their_e, trust_credibility).
rule_source(workers_are_not_likely_to_increase_affinity_esteem_and_credibility_for_their_e, ensemble).
rule_priority(workers_are_not_likely_to_increase_affinity_esteem_and_credibility_for_their_e, 1).
rule_applies(workers_are_not_likely_to_increase_affinity_esteem_and_credibility_for_their_e, X, Y) :-
    trait(X, stagehand),
    directed_status(X, Y, financially_dependent_on),
    directed_status(X, Y, resentful_of).
rule_effect(workers_are_not_likely_to_increase_affinity_esteem_and_credibility_for_their_e, modify_network(X, Y, affinity, '+', 0)).
rule_effect(workers_are_not_likely_to_increase_affinity_esteem_and_credibility_for_their_e, add_relationship(X, Y, esteem)).
rule_effect(workers_are_not_likely_to_increase_affinity_esteem_and_credibility_for_their_e, modify_network(X, Y, credibility, '+', 0)).


rule_likelihood(people_are_more_likely_to_consider_strong_individuals_as_potential_partners_based_on_trust_levels, 1).
rule_type(people_are_more_likely_to_consider_strong_individuals_as_potential_partners_based_on_trust_levels, volition).
% People are more likely to consider strong individuals as potential partners based on trust levels.
rule_active(people_are_more_likely_to_consider_strong_individuals_as_potential_partners_base).
rule_category(people_are_more_likely_to_consider_strong_individuals_as_potential_partners_base, trust_credibility).
rule_source(people_are_more_likely_to_consider_strong_individuals_as_potential_partners_base, ensemble).
rule_priority(people_are_more_likely_to_consider_strong_individuals_as_potential_partners_base, 2).
rule_applies(people_are_more_likely_to_consider_strong_individuals_as_potential_partners_base, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val > 7.
rule_effect(people_are_more_likely_to_consider_strong_individuals_as_potential_partners_base, set_intent(X, candid, Y, 2)).


rule_likelihood(people_are_less_likely_to_date_those_they_don_t_trust_significantly_more_than_others, 1).
rule_type(people_are_less_likely_to_date_those_they_don_t_trust_significantly_more_than_others, volition).
% People are less likely to date those they don’t trust significantly more than others.
rule_active(people_are_less_likely_to_date_those_they_don_t_trust_significantly_more_than_ot).
rule_category(people_are_less_likely_to_date_those_they_don_t_trust_significantly_more_than_ot, trust_credibility).
rule_source(people_are_less_likely_to_date_those_they_don_t_trust_significantly_more_than_ot, ensemble).
rule_priority(people_are_less_likely_to_date_those_they_don_t_trust_significantly_more_than_ot, 2).
rule_applies(people_are_less_likely_to_date_those_they_don_t_trust_significantly_more_than_ot, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val < 4.
rule_effect(people_are_less_likely_to_date_those_they_don_t_trust_significantly_more_than_ot, set_intent(X, candid, Y, -2)).


rule_likelihood(people_are_inclined_to_form_connections_with_individuals_they_trust_more_than_others_in_their_social_network, 1).
rule_type(people_are_inclined_to_form_connections_with_individuals_they_trust_more_than_others_in_their_social_network, volition).
% People are inclined to form connections with individuals they trust more than others in their social network.
rule_active(people_are_inclined_to_form_connections_with_individuals_they_trust_more_than_ot).
rule_category(people_are_inclined_to_form_connections_with_individuals_they_trust_more_than_ot, trust_credibility).
rule_source(people_are_inclined_to_form_connections_with_individuals_they_trust_more_than_ot, ensemble).
rule_priority(people_are_inclined_to_form_connections_with_individuals_they_trust_more_than_ot, 1).
rule_applies(people_are_inclined_to_form_connections_with_individuals_they_trust_more_than_ot, X, Z) :-
    network(X, Z, trust, Trust_val), Trust_val < 4,
    network(Y, Z, trust, Trust_val), Trust_val < 4.
rule_effect(people_are_inclined_to_form_connections_with_individuals_they_trust_more_than_ot, set_intent(X, candid, Y, 1)).


rule_likelihood(people_have_a_strong_inclination_to_form_closer_bonds_with_individuals_they_trust_significantly, 1).
rule_type(people_have_a_strong_inclination_to_form_closer_bonds_with_individuals_they_trust_significantly, volition).
% People have a strong inclination to form closer bonds with individuals they trust significantly.
rule_active(people_have_a_strong_inclination_to_form_closer_bonds_with_individuals_they_trus).
rule_category(people_have_a_strong_inclination_to_form_closer_bonds_with_individuals_they_trus, trust_credibility).
rule_source(people_have_a_strong_inclination_to_form_closer_bonds_with_individuals_they_trus, ensemble).
rule_priority(people_have_a_strong_inclination_to_form_closer_bonds_with_individuals_they_trus, 2).
rule_applies(people_have_a_strong_inclination_to_form_closer_bonds_with_individuals_they_trus, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val > 6.
rule_effect(people_have_a_strong_inclination_to_form_closer_bonds_with_individuals_they_trus, set_intent(X, favor, Y, 2)).


rule_likelihood(people_seek_to_increase_trust_with_stronger_individuals_but_may_inadvertently_decrease_their_own_intentional, 1).
rule_type(people_seek_to_increase_trust_with_stronger_individuals_but_may_inadvertently_decrease_their_own_intentional, volition).
% People seek to increase trust with stronger individuals but may inadvertently decrease their own intentional
rule_active(people_seek_to_increase_trust_with_stronger_individuals_but_may_inadvertently_de).
rule_category(people_seek_to_increase_trust_with_stronger_individuals_but_may_inadvertently_de, trust_credibility).
rule_source(people_seek_to_increase_trust_with_stronger_individuals_but_may_inadvertently_de, ensemble).
rule_priority(people_seek_to_increase_trust_with_stronger_individuals_but_may_inadvertently_de, 1).
rule_applies(people_seek_to_increase_trust_with_stronger_individuals_but_may_inadvertently_de, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val > 6.
rule_effect(people_seek_to_increase_trust_with_stronger_individuals_but_may_inadvertently_de, set_intent(X, manipulate, Y, -1)).


rule_likelihood(people_desire_to_trust_stronger_individuals_in_their_network_when_the_number_of_strong_connections_exceeds_six, 1).
rule_type(people_desire_to_trust_stronger_individuals_in_their_network_when_the_number_of_strong_connections_exceeds_six, volition).
% People desire to trust stronger individuals in their network when the number of strong connections exceeds six.
rule_active(people_desire_to_trust_stronger_individuals_in_their_network_when_the_number_of).
rule_category(people_desire_to_trust_stronger_individuals_in_their_network_when_the_number_of, trust_credibility).
rule_source(people_desire_to_trust_stronger_individuals_in_their_network_when_the_number_of, ensemble).
rule_priority(people_desire_to_trust_stronger_individuals_in_their_network_when_the_number_of, 2).
rule_applies(people_desire_to_trust_stronger_individuals_in_their_network_when_the_number_of, X, Y) :-
    network(X, Y, familial, Familial_val), Familial_val > 6.
rule_effect(people_desire_to_trust_stronger_individuals_in_their_network_when_the_number_of, set_intent(X, trust, Y, 2)).


rule_likelihood(people_desire_to_trust_and_form_closer_relationships_with_individuals_they_respect_significantly, 1).
rule_type(people_desire_to_trust_and_form_closer_relationships_with_individuals_they_respect_significantly, volition).
% People desire to trust and form closer relationships with individuals they respect significantly.
rule_active(people_desire_to_trust_and_form_closer_relationships_with_individuals_they_respe).
rule_category(people_desire_to_trust_and_form_closer_relationships_with_individuals_they_respe, trust_credibility).
rule_source(people_desire_to_trust_and_form_closer_relationships_with_individuals_they_respe, ensemble).
rule_priority(people_desire_to_trust_and_form_closer_relationships_with_individuals_they_respe, 2).
rule_applies(people_desire_to_trust_and_form_closer_relationships_with_individuals_they_respe, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val > 6.
rule_effect(people_desire_to_trust_and_form_closer_relationships_with_individuals_they_respe, set_intent(X, trust, Y, 2)).


rule_likelihood(people_seek_to_increase_trust_with_weaker_individuals_but_decrease_it_when_interacting_with_stronger_ones, 1).
rule_type(people_seek_to_increase_trust_with_weaker_individuals_but_decrease_it_when_interacting_with_stronger_ones, volition).
% People seek to increase trust with weaker individuals but decrease it when interacting with stronger ones.
rule_active(people_seek_to_increase_trust_with_weaker_individuals_but_decrease_it_when_inter).
rule_category(people_seek_to_increase_trust_with_weaker_individuals_but_decrease_it_when_inter, trust_credibility).
rule_source(people_seek_to_increase_trust_with_weaker_individuals_but_decrease_it_when_inter, ensemble).
rule_priority(people_seek_to_increase_trust_with_weaker_individuals_but_decrease_it_when_inter, 5).
rule_applies(people_seek_to_increase_trust_with_weaker_individuals_but_decrease_it_when_inter, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val < 4.
rule_effect(people_seek_to_increase_trust_with_weaker_individuals_but_decrease_it_when_inter, set_intent(X, trust, Y, -5)).


rule_likelihood(people_develop_trust_towards_strong_individuals_over_time_when_they_have_had_positive_interactions, 1).
rule_type(people_develop_trust_towards_strong_individuals_over_time_when_they_have_had_positive_interactions, volition).
% People develop trust towards strong individuals over time when they have had positive interactions.
rule_active(people_develop_trust_towards_strong_individuals_over_time_when_they_have_had_pos).
rule_category(people_develop_trust_towards_strong_individuals_over_time_when_they_have_had_pos, trust_credibility).
rule_source(people_develop_trust_towards_strong_individuals_over_time_when_they_have_had_pos, ensemble).
rule_priority(people_develop_trust_towards_strong_individuals_over_time_when_they_have_had_pos, 1).
rule_applies(people_develop_trust_towards_strong_individuals_over_time_when_they_have_had_pos, X, Y) :-
    event(X, Y, nice, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_develop_trust_towards_strong_individuals_over_time_when_they_have_had_pos, set_intent(X, trust, Y, 1)).


rule_likelihood(people_develop_trust_towards_strong_individuals_when_they_have_been_consistently_attracted_to_them_for_at_least, 1).
rule_type(people_develop_trust_towards_strong_individuals_when_they_have_been_consistently_attracted_to_them_for_at_least, volition).
% People develop trust towards strong individuals when they have been consistently attracted to them for at least
rule_active(people_develop_trust_towards_strong_individuals_when_they_have_been_consistently).
rule_category(people_develop_trust_towards_strong_individuals_when_they_have_been_consistently, trust_credibility).
rule_source(people_develop_trust_towards_strong_individuals_when_they_have_been_consistently, ensemble).
rule_priority(people_develop_trust_towards_strong_individuals_when_they_have_been_consistently, 3).
rule_applies(people_develop_trust_towards_strong_individuals_when_they_have_been_consistently, X, Z) :-
    network(X, Z, romance, Romance_val), Romance_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 0, TurnsAgo =< 8.
rule_effect(people_develop_trust_towards_strong_individuals_when_they_have_been_consistently, set_intent(X, trust, Y, -3)).


rule_likelihood(people_seek_to_increase_trust_with_those_they_are_already_somewhat_close_to_within_the_last_9, 1).
rule_type(people_seek_to_increase_trust_with_those_they_are_already_somewhat_close_to_within_the_last_9, volition).
% People seek to increase trust with those they are already somewhat close to within the last 9-
rule_active(people_seek_to_increase_trust_with_those_they_are_already_somewhat_close_to_with).
rule_category(people_seek_to_increase_trust_with_those_they_are_already_somewhat_close_to_with, trust_credibility).
rule_source(people_seek_to_increase_trust_with_those_they_are_already_somewhat_close_to_with, ensemble).
rule_priority(people_seek_to_increase_trust_with_those_they_are_already_somewhat_close_to_with, 2).
rule_applies(people_seek_to_increase_trust_with_those_they_are_already_somewhat_close_to_with, X, Z) :-
    network(X, Z, familial, Familial_val), Familial_val > 6,
    event(Y, Z, mean, TurnsAgo), TurnsAgo >= 9, TurnsAgo =< 30.
rule_effect(people_seek_to_increase_trust_with_those_they_are_already_somewhat_close_to_with, set_intent(X, trust, Y, -2)).

%% ─── Virtue Morality (4 rules) ───


rule_likelihood(people_seek_companions_with_higher_social_standing_when_their_own_honor_is_moderately_low, 1).
rule_type(people_seek_companions_with_higher_social_standing_when_their_own_honor_is_moderately_low, volition).
% People seek companions with higher social standing when their own honor is moderately low.
rule_active(people_seek_companions_with_higher_social_standing_when_their_own_honor_is_moder).
rule_category(people_seek_companions_with_higher_social_standing_when_their_own_honor_is_moder, virtue_morality).
rule_source(people_seek_companions_with_higher_social_standing_when_their_own_honor_is_moder, ensemble).
rule_priority(people_seek_companions_with_higher_social_standing_when_their_own_honor_is_moder, 2).
rule_applies(people_seek_companions_with_higher_social_standing_when_their_own_honor_is_moder, X, _) :-
    attribute(X, honor, Honor_val), Honor_val < 7.
rule_effect(people_seek_companions_with_higher_social_standing_when_their_own_honor_is_moder, set_intent(X, candid, Y, -2)).


rule_likelihood(people_seek_to_increase_their_honor_by_associating_with_individuals_of_higher_honor, 1).
rule_type(people_seek_to_increase_their_honor_by_associating_with_individuals_of_higher_honor, volition).
% People seek to increase their honor by associating with individuals of higher honor.
rule_active(people_seek_to_increase_their_honor_by_associating_with_individuals_of_higher_ho).
rule_category(people_seek_to_increase_their_honor_by_associating_with_individuals_of_higher_ho, virtue_morality).
rule_source(people_seek_to_increase_their_honor_by_associating_with_individuals_of_higher_ho, ensemble).
rule_priority(people_seek_to_increase_their_honor_by_associating_with_individuals_of_higher_ho, 5).
rule_applies(people_seek_to_increase_their_honor_by_associating_with_individuals_of_higher_ho, X, _) :-
    attribute(X, honor, Honor_val), Honor_val < 7.
rule_effect(people_seek_to_increase_their_honor_by_associating_with_individuals_of_higher_ho, set_intent(X, honor, Y, -5)).


rule_likelihood(people_seek_to_increase_their_social_honor_by_associating_with_individuals_of_higher_status, 1).
rule_type(people_seek_to_increase_their_social_honor_by_associating_with_individuals_of_higher_status, volition).
% People seek to increase their social honor by associating with individuals of higher status.
rule_active(people_seek_to_increase_their_social_honor_by_associating_with_individuals_of_hi).
rule_category(people_seek_to_increase_their_social_honor_by_associating_with_individuals_of_hi, virtue_morality).
rule_source(people_seek_to_increase_their_social_honor_by_associating_with_individuals_of_hi, ensemble).
rule_priority(people_seek_to_increase_their_social_honor_by_associating_with_individuals_of_hi, 5).
rule_applies(people_seek_to_increase_their_social_honor_by_associating_with_individuals_of_hi, X, _) :-
    attribute(X, honor, Honor_val), Honor_val > 12.
rule_effect(people_seek_to_increase_their_social_honor_by_associating_with_individuals_of_hi, set_intent(X, honor, Y, 5)).


rule_likelihood(people_seek_to_influence_their_social_circle_by_associating_with_individuals_of_higher_honor, 1).
rule_type(people_seek_to_influence_their_social_circle_by_associating_with_individuals_of_higher_honor, volition).
% People seek to influence their social circle by associating with individuals of higher honor.
rule_active(people_seek_to_influence_their_social_circle_by_associating_with_individuals_of).
rule_category(people_seek_to_influence_their_social_circle_by_associating_with_individuals_of, virtue_morality).
rule_source(people_seek_to_influence_their_social_circle_by_associating_with_individuals_of, ensemble).
rule_priority(people_seek_to_influence_their_social_circle_by_associating_with_individuals_of, 2).
rule_applies(people_seek_to_influence_their_social_circle_by_associating_with_individuals_of, X, _) :-
    attribute(X, honor, Honor_val), Honor_val > 12.
rule_effect(people_seek_to_influence_their_social_circle_by_associating_with_individuals_of, set_intent(X, manipulate, Y, -2)).






