%% Ensemble Volition Rules: attention-seeking
%% Source: data/ensemble/volitionRules/attention-seeking.json
%% Converted: 2026-04-02T20:09:49.723Z
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

