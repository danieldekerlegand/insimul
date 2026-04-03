%% Ensemble Volition Rules: reputation-esteem
%% Source: data/ensemble/volitionRules/reputation-esteem.json
%% Converted: 2026-04-02T20:09:49.728Z
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




