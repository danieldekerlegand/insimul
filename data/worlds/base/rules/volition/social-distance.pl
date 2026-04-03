%% Ensemble Volition Rules: social-distance
%% Source: data/ensemble/volitionRules/social-distance.json
%% Converted: 2026-04-02T20:09:49.729Z
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





