%% Ensemble Volition Rules: friendship-alliance
%% Source: data/ensemble/volitionRules/friendship-alliance.json
%% Converted: 2026-04-02T20:09:49.726Z
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




