%% Ensemble Volition Rules: betrayal-revenge
%% Source: data/ensemble/volitionRules/betrayal-revenge.json
%% Converted: 2026-04-02T20:09:49.724Z
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




