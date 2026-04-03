%% Ensemble Volition Rules: deception-manipulation
%% Source: data/ensemble/volitionRules/deception-manipulation.json
%% Converted: 2026-04-02T20:09:49.724Z
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




