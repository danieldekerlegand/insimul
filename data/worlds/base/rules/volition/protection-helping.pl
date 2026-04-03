%% Ensemble Volition Rules: protection-helping
%% Source: data/ensemble/volitionRules/protection-helping.json
%% Converted: 2026-04-02T20:09:49.728Z
%% Total rules: 12

rule_likelihood(seductive_men_help_or_flirt_with_clumsy_beautiful_women, 1).
rule_type(seductive_men_help_or_flirt_with_clumsy_beautiful_women, volition).
% Seductive men help or flirt with clumsy, beautiful women
rule_active(seductive_men_help_or_flirt_with_clumsy_beautiful_women).
rule_category(seductive_men_help_or_flirt_with_clumsy_beautiful_women, protection_helping).
rule_source(seductive_men_help_or_flirt_with_clumsy_beautiful_women, ensemble).
rule_priority(seductive_men_help_or_flirt_with_clumsy_beautiful_women, 1).
rule_applies(seductive_men_help_or_flirt_with_clumsy_beautiful_women, X, Y) :-
    trait(X, beautiful),
    trait(X, awkward),
    trait(X, female),
    trait(Y, male),
    trait(Y, flirtatious),
    attribute(Y, propriety, Propriety_val), Propriety_val > 50.
rule_effect(seductive_men_help_or_flirt_with_clumsy_beautiful_women, modify_network(Y, X, curiosity, '+', 2)).

rule_likelihood(a_sensitive_generous_person_is_more_likely_to_help_upset_not_virtuous_other_person, 1).
rule_type(a_sensitive_generous_person_is_more_likely_to_help_upset_not_virtuous_other_person, volition).
% A sensitive generous person is more likely to help upset not virtuous other person
rule_active(a_sensitive_generous_person_is_more_likely_to_help_upset_not_virtuous_other_person).
rule_category(a_sensitive_generous_person_is_more_likely_to_help_upset_not_virtuous_other_person, protection_helping).
rule_source(a_sensitive_generous_person_is_more_likely_to_help_upset_not_virtuous_other_person, ensemble).
rule_priority(a_sensitive_generous_person_is_more_likely_to_help_upset_not_virtuous_other_person, 5).
rule_applies(a_sensitive_generous_person_is_more_likely_to_help_upset_not_virtuous_other_person, X, Y) :-
    attribute(Y, sensitiveness, Sensitiveness_val), Sensitiveness_val > 60,
    status(X, upset),
    trait(X, young),
    trait(Y, generous),
    \+ trait(Y, young).
rule_effect(a_sensitive_generous_person_is_more_likely_to_help_upset_not_virtuous_other_person, modify_network(Y, X, affinity, '+', 3)).
rule_effect(a_sensitive_generous_person_is_more_likely_to_help_upset_not_virtuous_other_person, modify_network(X, Y, emulation, '+', 5)).

rule_likelihood(a_young_rich_personman_tends_to_help_a_wounded_and_inebriated_man, 1).
rule_type(a_young_rich_personman_tends_to_help_a_wounded_and_inebriated_man, volition).
% A young rich personman tends to help a wounded and inebriated man
rule_active(a_young_rich_personman_tends_to_help_a_wounded_and_inebriated_man).
rule_category(a_young_rich_personman_tends_to_help_a_wounded_and_inebriated_man, protection_helping).
rule_source(a_young_rich_personman_tends_to_help_a_wounded_and_inebriated_man, ensemble).
rule_priority(a_young_rich_personman_tends_to_help_a_wounded_and_inebriated_man, 1).
rule_applies(a_young_rich_personman_tends_to_help_a_wounded_and_inebriated_man, X, Y) :-
    trait(X, rich),
    status(Y, inebriated),
    attribute(X, sensitiveness, Sensitiveness_val), Sensitiveness_val > 60.
rule_effect(a_young_rich_personman_tends_to_help_a_wounded_and_inebriated_man, modify_network(Y, X, curiosity, '+', 2)).

rule_likelihood(young_nosy_cunning_first_responders_are_likely_to_help_young_rich_people_in_distress, 1).
rule_type(young_nosy_cunning_first_responders_are_likely_to_help_young_rich_people_in_distress, volition).
% Young, nosy, cunning, first responders are likely to help young, rich people in distress
rule_active(young_nosy_cunning_first_responders_are_likely_to_help_young_rich_people_in_distress).
rule_category(young_nosy_cunning_first_responders_are_likely_to_help_young_rich_people_in_distress, protection_helping).
rule_source(young_nosy_cunning_first_responders_are_likely_to_help_young_rich_people_in_distress, ensemble).
rule_priority(young_nosy_cunning_first_responders_are_likely_to_help_young_rich_people_in_distress, 5).
rule_applies(young_nosy_cunning_first_responders_are_likely_to_help_young_rich_people_in_distress, X, Y) :-
    trait(Y, male),
    attribute(Y, cunningness, Cunningness_val), Cunningness_val > 70,
    trait(Y, wearing_a_first_responder_uniform),
    attribute(Y, nosiness, Nosiness_val), Nosiness_val > 60,
    trait(X, male),
    trait(X, rich),
    directed_status(X, 'z', threatened_by),
    attribute(X, sophistication, Sophistication_val), Sophistication_val > 60,
    trait(Y, young),
    trait(X, young).
rule_effect(young_nosy_cunning_first_responders_are_likely_to_help_young_rich_people_in_distress, set_relationship(Y, X, ally, 5)).
rule_effect(young_nosy_cunning_first_responders_are_likely_to_help_young_rich_people_in_distress, set_relationship(Y, X, esteem, 5)).
rule_effect(young_nosy_cunning_first_responders_are_likely_to_help_young_rich_people_in_distress, set_relationship('z', Y, rivals, 5)).

rule_likelihood(people_who_care_for_each_other_may_protect_one_another, 1).
rule_type(people_who_care_for_each_other_may_protect_one_another, volition).
% People who care for each other may protect one another
rule_active(people_who_care_for_each_other_may_protect_one_another).
rule_category(people_who_care_for_each_other_may_protect_one_another, protection_helping).
rule_source(people_who_care_for_each_other_may_protect_one_another, ensemble).
rule_priority(people_who_care_for_each_other_may_protect_one_another, 5).
rule_applies(people_who_care_for_each_other_may_protect_one_another, X, Y) :-
    directed_status(X, Y, cares_for),
    directed_status(Y, 'z', threatened_by).
rule_effect(people_who_care_for_each_other_may_protect_one_another, set_relationship(X, Y, ally, 5)).

rule_likelihood(an_honest_person_may_help_a_sexually_harassed_girl, 1).
rule_type(an_honest_person_may_help_a_sexually_harassed_girl, volition).
% An honest person may help a sexually harassed girl
rule_active(an_honest_person_may_help_a_sexually_harassed_girl).
rule_category(an_honest_person_may_help_a_sexually_harassed_girl, protection_helping).
rule_source(an_honest_person_may_help_a_sexually_harassed_girl, ensemble).
rule_priority(an_honest_person_may_help_a_sexually_harassed_girl, 5).
rule_applies(an_honest_person_may_help_a_sexually_harassed_girl, X, Y) :-
    trait(X, honest),
    trait(X, attendee),
    directed_status(X, Y, cares_for),
    trait(Y, young),
    event(Y, harassed),
    trait(Y, female).
rule_effect(an_honest_person_may_help_a_sexually_harassed_girl, modify_network(X, Y, curiosity, '+', 5)).
rule_effect(an_honest_person_may_help_a_sexually_harassed_girl, modify_network(Y, X, affinity, '+', 5)).

rule_likelihood(people_may_fight_to_protect_their_friends_who_are_threatened_by_another, 1).
rule_type(people_may_fight_to_protect_their_friends_who_are_threatened_by_another, volition).
% People may fight to protect their friends who are threatened by another
rule_active(people_may_fight_to_protect_their_friends_who_are_threatened_by_another).
rule_category(people_may_fight_to_protect_their_friends_who_are_threatened_by_another, protection_helping).
rule_source(people_may_fight_to_protect_their_friends_who_are_threatened_by_another, ensemble).
rule_priority(people_may_fight_to_protect_their_friends_who_are_threatened_by_another, 5).
rule_applies(people_may_fight_to_protect_their_friends_who_are_threatened_by_another, X, Y) :-
    relationship(X, Y, friends),
    directed_status(Y, X, threatened_by).
rule_effect(people_may_fight_to_protect_their_friends_who_are_threatened_by_another, set_relationship(X, X, rivals, 5)).

rule_likelihood(a_woman_might_help_her_friend_s_lover, 1).
rule_type(a_woman_might_help_her_friend_s_lover, volition).
% A woman might help her friend’s lover
rule_active(a_woman_might_help_her_friend_s_lover).
rule_category(a_woman_might_help_her_friend_s_lover, protection_helping).
rule_source(a_woman_might_help_her_friend_s_lover, ensemble).
rule_priority(a_woman_might_help_her_friend_s_lover, 5).
rule_applies(a_woman_might_help_her_friend_s_lover, X, Y) :-
    relationship(X, Y, lovers),
    relationship(X, 'z', friends),
    trait(X, female),
    trait('z', female),
    trait(Y, male),
    network('z', Y, affinity, Affinity_val), Affinity_val > 50.
rule_effect(a_woman_might_help_her_friend_s_lover, modify_network('z', Y, affinity, '+', 3)).
rule_effect(a_woman_might_help_her_friend_s_lover, modify_network(Y, 'z', affinity, '+', 3)).
rule_effect(a_woman_might_help_her_friend_s_lover, set_relationship(Y, 'z', ally, 5)).
rule_effect(a_woman_might_help_her_friend_s_lover, set_relationship('z', Y, ally, 5)).

rule_likelihood(high_status_people_are_more_likely_to_be_helpful_if_you_recently_were_respectful_and_positive, 1).
rule_type(high_status_people_are_more_likely_to_be_helpful_if_you_recently_were_respectful_and_positive, volition).
% High status people are more likely to be helpful if you recently were respectful and positive
rule_active(high_status_people_are_more_likely_to_be_helpful_if_you_recently_were_respectful_and_positive).
rule_category(high_status_people_are_more_likely_to_be_helpful_if_you_recently_were_respectful_and_positive, protection_helping).
rule_source(high_status_people_are_more_likely_to_be_helpful_if_you_recently_were_respectful_and_positive, ensemble).
rule_priority(high_status_people_are_more_likely_to_be_helpful_if_you_recently_were_respectful_and_positive, 5).
rule_applies(high_status_people_are_more_likely_to_be_helpful_if_you_recently_were_respectful_and_positive, X, Y) :-
    event(Y, respectful),
    event(X, positive),
    attribute(X, status_individual, Status_individual_val), Status_individual_val > 50.
rule_effect(high_status_people_are_more_likely_to_be_helpful_if_you_recently_were_respectful_and_positive, set_intent(X, help, Y, 5)).

rule_likelihood(people_are_inclined_to_form_closer_bonds_with_individuals_they_have_helped_recently, 1).
rule_type(people_are_inclined_to_form_closer_bonds_with_individuals_they_have_helped_recently, volition).
% People are inclined to form closer bonds with individuals they have helped recently.
rule_active(people_are_inclined_to_form_closer_bonds_with_individuals_they_have_helped_recently).
rule_category(people_are_inclined_to_form_closer_bonds_with_individuals_they_have_helped_recently, protection_helping).
rule_source(people_are_inclined_to_form_closer_bonds_with_individuals_they_have_helped_recently, ensemble).
rule_priority(people_are_inclined_to_form_closer_bonds_with_individuals_they_have_helped_recently, 3).
rule_applies(people_are_inclined_to_form_closer_bonds_with_individuals_they_have_helped_recently, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(X, did_a_favor_for).
rule_effect(people_are_inclined_to_form_closer_bonds_with_individuals_they_have_helped_recently, set_intent(X, favor, Y, 3)).

rule_likelihood(people_want_to_honor_strong_individuals_they_ve_helped, 1).
rule_type(people_want_to_honor_strong_individuals_they_ve_helped, volition).
% People want to honor strong individuals they’ve helped.
rule_active(people_want_to_honor_strong_individuals_they_ve_helped).
rule_category(people_want_to_honor_strong_individuals_they_ve_helped, protection_helping).
rule_source(people_want_to_honor_strong_individuals_they_ve_helped, ensemble).
rule_priority(people_want_to_honor_strong_individuals_they_ve_helped, 1).
rule_applies(people_want_to_honor_strong_individuals_they_ve_helped, X, Y) :-
    event(X, did_a_favor_for).
rule_effect(people_want_to_honor_strong_individuals_they_ve_helped, set_intent(X, honor, Y, 1)).

rule_likelihood(people_with_a_strong_desire_for_connections_are_likely_to_form_friendships_when_they_have_helped_their_cr, 1).
rule_type(people_with_a_strong_desire_for_connections_are_likely_to_form_friendships_when_they_have_helped_their_cr, volition).
% People with a strong desire for connections are likely to form friendships when they have helped their cr
rule_active(people_with_a_strong_desire_for_connections_are_likely_to_form_friendships_when_they_have_helped_their_cr).
rule_category(people_with_a_strong_desire_for_connections_are_likely_to_form_friendships_when_they_have_helped_their_cr, protection_helping).
rule_source(people_with_a_strong_desire_for_connections_are_likely_to_form_friendships_when_they_have_helped_their_cr, ensemble).
rule_priority(people_with_a_strong_desire_for_connections_are_likely_to_form_friendships_when_they_have_helped_their_cr, 1).
rule_applies(people_with_a_strong_desire_for_connections_are_likely_to_form_friendships_when_they_have_helped_their_cr, X, Y) :-
    network(X, 'z', friendship, Friendship_val), Friendship_val > 6,
    event(Y, did_a_favor_for).
rule_effect(people_with_a_strong_desire_for_connections_are_likely_to_form_friendships_when_they_have_helped_their_cr, set_intent(X, kind, Y, 1)).




