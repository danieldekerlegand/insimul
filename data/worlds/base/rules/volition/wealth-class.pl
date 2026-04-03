%% Ensemble Volition Rules: wealth-class
%% Source: data/ensemble/volitionRules/wealth-class.json
%% Converted: 2026-04-02T20:09:49.730Z
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




