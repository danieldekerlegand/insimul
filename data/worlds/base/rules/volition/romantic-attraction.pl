%% Ensemble Volition Rules: romantic-attraction
%% Source: data/ensemble/volitionRules/romantic-attraction.json
%% Converted: 2026-04-02T20:09:49.729Z
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





