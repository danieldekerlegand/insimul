%% Ensemble Volition Rules: rivalry-conflict
%% Source: data/ensemble/volitionRules/rivalry-conflict.json
%% Converted: 2026-04-02T20:09:49.728Z
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




