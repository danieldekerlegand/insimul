%% Ensemble Volition Rules: marriage-family
%% Source: data/ensemble/volitionRules/marriage-family.json
%% Converted: 2026-04-02T20:09:49.727Z
%% Total rules: 40

rule_likelihood(an_honest_married_woman_has_no_affinity_with_another_man, 1).
rule_type(an_honest_married_woman_has_no_affinity_with_another_man, volition).
% An honest married woman has no affinity with another man
rule_active(an_honest_married_woman_has_no_affinity_with_another_man).
rule_category(an_honest_married_woman_has_no_affinity_with_another_man, marriage_family).
rule_source(an_honest_married_woman_has_no_affinity_with_another_man, ensemble).
rule_priority(an_honest_married_woman_has_no_affinity_with_another_man, 5).
rule_applies(an_honest_married_woman_has_no_affinity_with_another_man, X, Y) :-
    trait(X, female),
    trait(X, honest),
    trait(Y, male),
    relationship(X, 'z', married),
    network(Y, X, affinity, Affinity_val), Affinity_val > 50.
rule_effect(an_honest_married_woman_has_no_affinity_with_another_man, modify_network(X, Y, affinity, '+', 5)).

rule_likelihood(a_sad_rich_person_can_inspire_sympathy, 1).
rule_type(a_sad_rich_person_can_inspire_sympathy, volition).
% A sad, rich person can inspire sympathy
rule_active(a_sad_rich_person_can_inspire_sympathy).
rule_category(a_sad_rich_person_can_inspire_sympathy, marriage_family).
rule_source(a_sad_rich_person_can_inspire_sympathy, ensemble).
rule_priority(a_sad_rich_person_can_inspire_sympathy, 5).
rule_applies(a_sad_rich_person_can_inspire_sympathy, X, Y) :-
    status(X, upset),
    trait(X, rich),
    trait(X, trustworthy),
    directed_status(Y, X, cares_for).
rule_effect(a_sad_rich_person_can_inspire_sympathy, modify_network(Y, X, affinity, '+', 5)).

rule_likelihood(an_unsophisticated_and_rude_police_officer_can_offend_rich_person, 1).
rule_type(an_unsophisticated_and_rude_police_officer_can_offend_rich_person, volition).
% An unsophisticated and rude police officer can offend rich person
rule_active(an_unsophisticated_and_rude_police_officer_can_offend_rich_person).
rule_category(an_unsophisticated_and_rude_police_officer_can_offend_rich_person, marriage_family).
rule_source(an_unsophisticated_and_rude_police_officer_can_offend_rich_person, ensemble).
rule_priority(an_unsophisticated_and_rude_police_officer_can_offend_rich_person, 5).
rule_applies(an_unsophisticated_and_rude_police_officer_can_offend_rich_person, X, Y) :-
    attribute(X, sophistication, Sophistication_val), Sophistication_val < 50,
    trait(X, police_officer),
    trait(Y, rich),
    directed_status(Y, X, offended_by),
    trait(X, boorish).
rule_effect(an_unsophisticated_and_rude_police_officer_can_offend_rich_person, modify_network(Y, X, affinity, '+', 5)).
rule_effect(an_unsophisticated_and_rude_police_officer_can_offend_rich_person, modify_network(Y, X, curiosity, '+', 5)).

rule_likelihood(a_suspicious_husband_with_an_honest_wife_can_become_a_rival_of_other_men, 1).
rule_type(a_suspicious_husband_with_an_honest_wife_can_become_a_rival_of_other_men, volition).
% A suspicious husband with an honest wife can become a rival of other men
rule_active(a_suspicious_husband_with_an_honest_wife_can_become_a_rival_of_other_men).
rule_category(a_suspicious_husband_with_an_honest_wife_can_become_a_rival_of_other_men, marriage_family).
rule_source(a_suspicious_husband_with_an_honest_wife_can_become_a_rival_of_other_men, ensemble).
rule_priority(a_suspicious_husband_with_an_honest_wife_can_become_a_rival_of_other_men, 5).
rule_applies(a_suspicious_husband_with_an_honest_wife_can_become_a_rival_of_other_men, X, Y) :-
    directed_status(X, Y, suspicious_of),
    relationship(X, 'z', married),
    trait(Y, intimidating),
    trait('z', beautiful),
    trait('z', female),
    trait('z', honest),
    network(Y, 'z', affinity, Affinity_val), Affinity_val > 70.
rule_effect(a_suspicious_husband_with_an_honest_wife_can_become_a_rival_of_other_men, set_relationship(X, Y, rivals, 5)).
rule_effect(a_suspicious_husband_with_an_honest_wife_can_become_a_rival_of_other_men, modify_network('z', Y, curiosity, '+', 5)).
rule_effect(a_suspicious_husband_with_an_honest_wife_can_become_a_rival_of_other_men, set_relationship(X, 'z', ally, 5)).

rule_likelihood(a_devout_person_s_severity_can_repel_vain_people, 1).
rule_type(a_devout_person_s_severity_can_repel_vain_people, volition).
% A devout person’s severity can repel vain people
rule_active(a_devout_person_s_severity_can_repel_vain_people).
rule_category(a_devout_person_s_severity_can_repel_vain_people, marriage_family).
rule_source(a_devout_person_s_severity_can_repel_vain_people, ensemble).
rule_priority(a_devout_person_s_severity_can_repel_vain_people, 3).
rule_applies(a_devout_person_s_severity_can_repel_vain_people, X, Y) :-
    \+ trait(X, devout),
    trait(X, vain),
    trait(Y, devout).
rule_effect(a_devout_person_s_severity_can_repel_vain_people, modify_network(X, Y, affinity, '-', 3)).

rule_likelihood(an_unsophisticated_person_wants_to_be_esteemed_by_rich_person, 1).
rule_type(an_unsophisticated_person_wants_to_be_esteemed_by_rich_person, volition).
% An unsophisticated person wants to be esteemed by rich person
rule_active(an_unsophisticated_person_wants_to_be_esteemed_by_rich_person).
rule_category(an_unsophisticated_person_wants_to_be_esteemed_by_rich_person, marriage_family).
rule_source(an_unsophisticated_person_wants_to_be_esteemed_by_rich_person, ensemble).
rule_priority(an_unsophisticated_person_wants_to_be_esteemed_by_rich_person, 5).
rule_applies(an_unsophisticated_person_wants_to_be_esteemed_by_rich_person, X, Y) :-
    attribute(X, sophistication, Sophistication_val), Sophistication_val < 50,
    directed_status(X, Y, esteems),
    trait(Y, rich).
rule_effect(an_unsophisticated_person_wants_to_be_esteemed_by_rich_person, modify_network(Y, X, affinity, '+', 5)).

rule_likelihood(a_financially_dependent_person_will_have_less_affinity_for_someone_resented_by_their_benefactor, 1).
rule_type(a_financially_dependent_person_will_have_less_affinity_for_someone_resented_by_their_benefactor, volition).
% A financially dependent person will have less affinity for someone resented by their benefactor
rule_active(a_financially_dependent_person_will_have_less_affinity_for_someone_resented_by_their_benefactor).
rule_category(a_financially_dependent_person_will_have_less_affinity_for_someone_resented_by_their_benefactor, marriage_family).
rule_source(a_financially_dependent_person_will_have_less_affinity_for_someone_resented_by_their_benefactor, ensemble).
rule_priority(a_financially_dependent_person_will_have_less_affinity_for_someone_resented_by_their_benefactor, 5).
rule_applies(a_financially_dependent_person_will_have_less_affinity_for_someone_resented_by_their_benefactor, X, Y) :-
    directed_status(X, Y, financially_dependent_on),
    directed_status(Y, 'z', resentful_of),
    directed_status(X, 'z', esteems),
    trait('z', disdainful),
    trait('z', hypocritical),
    trait(Y, deceptive).
rule_effect(a_financially_dependent_person_will_have_less_affinity_for_someone_resented_by_their_benefactor, modify_network(X, 'z', affinity, '-', 5)).

rule_likelihood(people_are_more_likely_to_ally_themselves_with_kind_person_of_similar_social_standing, 1).
rule_type(people_are_more_likely_to_ally_themselves_with_kind_person_of_similar_social_standing, volition).
% People are more likely to ally themselves with kind person of similar social standing
rule_active(people_are_more_likely_to_ally_themselves_with_kind_person_of_similar_social_standing).
rule_category(people_are_more_likely_to_ally_themselves_with_kind_person_of_similar_social_standing, marriage_family).
rule_source(people_are_more_likely_to_ally_themselves_with_kind_person_of_similar_social_standing, ensemble).
rule_priority(people_are_more_likely_to_ally_themselves_with_kind_person_of_similar_social_standing, 5).
rule_applies(people_are_more_likely_to_ally_themselves_with_kind_person_of_similar_social_standing, X, Y) :-
    attribute(Y, social_standing, Social_standing_val), Social_standing_val > 50,
    attribute(X, social_standing, Social_standing_val), Social_standing_val > 50,
    trait(Y, kind),
    directed_status(X, Y, trusts).
rule_effect(people_are_more_likely_to_ally_themselves_with_kind_person_of_similar_social_standing, set_relationship(X, Y, ally, 5)).

rule_likelihood(a_rich_charming_and_talkative_man_loves_a_pretty_attendeee_married_to_another_man, 1).
rule_type(a_rich_charming_and_talkative_man_loves_a_pretty_attendeee_married_to_another_man, volition).
% A rich, charming and talkative man loves a pretty attendeee married to another man 
rule_active(a_rich_charming_and_talkative_man_loves_a_pretty_attendeee_married_to_another_man).
rule_category(a_rich_charming_and_talkative_man_loves_a_pretty_attendeee_married_to_another_man, marriage_family).
rule_source(a_rich_charming_and_talkative_man_loves_a_pretty_attendeee_married_to_another_man, ensemble).
rule_priority(a_rich_charming_and_talkative_man_loves_a_pretty_attendeee_married_to_another_man, 5).
rule_applies(a_rich_charming_and_talkative_man_loves_a_pretty_attendeee_married_to_another_man, X, Y) :-
    trait(Y, male),
    trait(Y, rich),
    trait(Y, talkative),
    relationship(Y, X, lovers),
    relationship(X, 'z', married),
    trait(Y, charming),
    trait(X, beautiful),
    trait(X, attendee).
rule_effect(a_rich_charming_and_talkative_man_loves_a_pretty_attendeee_married_to_another_man, set_relationship(X, Y, ally, 5)).

rule_likelihood(rich_person_less_volition_to_increase_affinity_with_attendee_with_low_self_assurance, 1).
rule_type(rich_person_less_volition_to_increase_affinity_with_attendee_with_low_self_assurance, volition).
% rich person less volition to increase affinity with attendee with low self-assurance
rule_active(rich_person_less_volition_to_increase_affinity_with_attendee_with_low_self_assurance).
rule_category(rich_person_less_volition_to_increase_affinity_with_attendee_with_low_self_assurance, marriage_family).
rule_source(rich_person_less_volition_to_increase_affinity_with_attendee_with_low_self_assurance, ensemble).
rule_priority(rich_person_less_volition_to_increase_affinity_with_attendee_with_low_self_assurance, 3).
rule_applies(rich_person_less_volition_to_increase_affinity_with_attendee_with_low_self_assurance, X, Y) :-
    trait(Y, attendee),
    attribute(Y, self_assuredness, Self_assuredness_val), Self_assuredness_val < 50,
    trait(X, rich).
rule_effect(rich_person_less_volition_to_increase_affinity_with_attendee_with_low_self_assurance, modify_network(X, Y, affinity, '-', 3)).

rule_likelihood(rich_person_lady_who_hates_her_provincial_husband_would_try_to_compromise_her_husband, 1).
rule_type(rich_person_lady_who_hates_her_provincial_husband_would_try_to_compromise_her_husband, volition).
% rich person lady who hates her provincial husband would try to compromise her husband
rule_active(rich_person_lady_who_hates_her_provincial_husband_would_try_to_compromise_her_husband).
rule_category(rich_person_lady_who_hates_her_provincial_husband_would_try_to_compromise_her_husband, marriage_family).
rule_source(rich_person_lady_who_hates_her_provincial_husband_would_try_to_compromise_her_husband, ensemble).
rule_priority(rich_person_lady_who_hates_her_provincial_husband_would_try_to_compromise_her_husband, 5).
rule_applies(rich_person_lady_who_hates_her_provincial_husband_would_try_to_compromise_her_husband, X, Y) :-
    trait(X, female),
    relationship(X, Y, married),
    directed_status(X, Y, financially_dependent_on),
    directed_status(X, Y, hates),
    \+ trait(X, provincial),
    trait(Y, provincial),
    attribute(X, social_standing, Social_standing_val), Social_standing_val > 66.
rule_effect(rich_person_lady_who_hates_her_provincial_husband_would_try_to_compromise_her_husband, modify_network(X, Y, affinity, '+', 2)).
rule_effect(rich_person_lady_who_hates_her_provincial_husband_would_try_to_compromise_her_husband, modify_network(X, Y, credibility, '+', 5)).

rule_likelihood(provincial_attendee_males_married_to_rich_person_women_have_less_affinity_with_provincial_attendee, 1).
rule_type(provincial_attendee_males_married_to_rich_person_women_have_less_affinity_with_provincial_attendee, volition).
% Provincial attendee males married to rich person women have less affinity with Provincial attendee
rule_active(provincial_attendee_males_married_to_rich_person_women_have_less_affinity_with_provincial_attendee).
rule_category(provincial_attendee_males_married_to_rich_person_women_have_less_affinity_with_provincial_attendee, marriage_family).
rule_source(provincial_attendee_males_married_to_rich_person_women_have_less_affinity_with_provincial_attendee, ensemble).
rule_priority(provincial_attendee_males_married_to_rich_person_women_have_less_affinity_with_provincial_attendee, 3).
rule_applies(provincial_attendee_males_married_to_rich_person_women_have_less_affinity_with_provincial_attendee, X, Y) :-
    trait(Y, attendee),
    trait(X, rich),
    trait(Y, male),
    trait(X, female),
    trait(Y, disdainful),
    trait(Y, provincial),
    relationship(Y, X, married),
    trait('z', attendee),
    trait('z', provincial),
    network('z', Y, affinity, Affinity_val), Affinity_val > 65.
rule_effect(provincial_attendee_males_married_to_rich_person_women_have_less_affinity_with_provincial_attendee, modify_network(Y, 'z', affinity, '+', 3)).
rule_effect(provincial_attendee_males_married_to_rich_person_women_have_less_affinity_with_provincial_attendee, modify_network(Y, 'z', emulation, '+', 3)).
rule_effect(provincial_attendee_males_married_to_rich_person_women_have_less_affinity_with_provincial_attendee, modify_network('z', Y, emulation, '+', 3)).

rule_likelihood(a_charismatic_and_elegantly_dressed_person_is_more_likely_to_draw_attention, 1).
rule_type(a_charismatic_and_elegantly_dressed_person_is_more_likely_to_draw_attention, volition).
% A charismatic and elegantly dressed person is more likely to draw attention
rule_active(a_charismatic_and_elegantly_dressed_person_is_more_likely_to_draw_attention).
rule_category(a_charismatic_and_elegantly_dressed_person_is_more_likely_to_draw_attention, marriage_family).
rule_source(a_charismatic_and_elegantly_dressed_person_is_more_likely_to_draw_attention, ensemble).
rule_priority(a_charismatic_and_elegantly_dressed_person_is_more_likely_to_draw_attention, 5).
rule_applies(a_charismatic_and_elegantly_dressed_person_is_more_likely_to_draw_attention, X, Y) :-
    attribute(X, charisma, Charisma_val), Charisma_val > 66,
    trait(Y, credulous),
    attribute(Y, social_standing, Social_standing_val), Social_standing_val > 66,
    trait(X, elegantly_dressed).
rule_effect(a_charismatic_and_elegantly_dressed_person_is_more_likely_to_draw_attention, modify_network(X, Y, curiosity, '+', 5)).

rule_likelihood(urbanite_children_have_less_affinity_for_their_provincial_parents, 1).
rule_type(urbanite_children_have_less_affinity_for_their_provincial_parents, volition).
% Urbanite children have less affinity for their provincial parents
rule_active(urbanite_children_have_less_affinity_for_their_provincial_parents).
rule_category(urbanite_children_have_less_affinity_for_their_provincial_parents, marriage_family).
rule_source(urbanite_children_have_less_affinity_for_their_provincial_parents, ensemble).
rule_priority(urbanite_children_have_less_affinity_for_their_provincial_parents, 3).
rule_applies(urbanite_children_have_less_affinity_for_their_provincial_parents, X, Y) :-
    trait(Y, intimidating),
    attribute(Y, self_assuredness, Self_assuredness_val), Self_assuredness_val > 60,
    attribute(Y, social_standing, Social_standing_val), Social_standing_val > 40,
    attribute(X, social_standing, Social_standing_val), Social_standing_val < 30,
    trait(X, merchant),
    trait(Y, disdainful),
    relationship(Y, X, ally),
    trait(Y, young),
    trait(X, old).
rule_effect(urbanite_children_have_less_affinity_for_their_provincial_parents, set_relationship(Y, X, ally, 3)).
rule_effect(urbanite_children_have_less_affinity_for_their_provincial_parents, modify_network(Y, X, emulation, '+', 3)).

rule_likelihood(provincial_attendee_males_married_to_a_rich_woman_have_less_affinity_with_other_provincial_attendees, 1).
rule_type(provincial_attendee_males_married_to_a_rich_woman_have_less_affinity_with_other_provincial_attendees, volition).
% Provincial attendee males married to a rich woman have less affinity with other provincial attendees
rule_active(provincial_attendee_males_married_to_a_rich_woman_have_less_affinity_with_other_provincial_attendees).
rule_category(provincial_attendee_males_married_to_a_rich_woman_have_less_affinity_with_other_provincial_attendees, marriage_family).
rule_source(provincial_attendee_males_married_to_a_rich_woman_have_less_affinity_with_other_provincial_attendees, ensemble).
rule_priority(provincial_attendee_males_married_to_a_rich_woman_have_less_affinity_with_other_provincial_attendees, 3).
rule_applies(provincial_attendee_males_married_to_a_rich_woman_have_less_affinity_with_other_provincial_attendees, X, Y) :-
    trait(Y, attendee),
    trait(X, rich),
    trait(Y, male),
    trait(X, female),
    trait(Y, disdainful),
    trait(Y, provincial),
    relationship(Y, X, married),
    trait('z', attendee),
    trait('z', provincial),
    network('z', Y, affinity, Affinity_val), Affinity_val > 65.
rule_effect(provincial_attendee_males_married_to_a_rich_woman_have_less_affinity_with_other_provincial_attendees, modify_network(Y, 'z', affinity, '+', 3)).
rule_effect(provincial_attendee_males_married_to_a_rich_woman_have_less_affinity_with_other_provincial_attendees, modify_network(Y, 'z', emulation, '+', 3)).

rule_likelihood(spineless_poor_husbands_let_their_ambitious_wives_walk_all_over_them, 1).
rule_type(spineless_poor_husbands_let_their_ambitious_wives_walk_all_over_them, volition).
% Spineless, poor husbands let their ambitious wives walk all over them
rule_active(spineless_poor_husbands_let_their_ambitious_wives_walk_all_over_them).
rule_category(spineless_poor_husbands_let_their_ambitious_wives_walk_all_over_them, marriage_family).
rule_source(spineless_poor_husbands_let_their_ambitious_wives_walk_all_over_them, ensemble).
rule_priority(spineless_poor_husbands_let_their_ambitious_wives_walk_all_over_them, 3).
rule_applies(spineless_poor_husbands_let_their_ambitious_wives_walk_all_over_them, X, Y) :-
    relationship(X, Y, married),
    trait(Y, female),
    trait(X, kind),
    trait(X, male),
    status(X, tired),
    \+ trait(X, rich),
    trait(Y, greedy),
    trait(Y, ambitious),
    \+ trait(Y, rich).
rule_effect(spineless_poor_husbands_let_their_ambitious_wives_walk_all_over_them, set_relationship(Y, X, esteem, -3)).
rule_effect(spineless_poor_husbands_let_their_ambitious_wives_walk_all_over_them, modify_network(Y, X, affinity, '-', 3)).

rule_likelihood(people_who_trust_another_person_are_less_likely_to_trust_those_distrusted_by_that_person, 1).
rule_type(people_who_trust_another_person_are_less_likely_to_trust_those_distrusted_by_that_person, volition).
% People who trust another person are less likely to trust those distrusted by that person
rule_active(people_who_trust_another_person_are_less_likely_to_trust_those_distrusted_by_that_person).
rule_category(people_who_trust_another_person_are_less_likely_to_trust_those_distrusted_by_that_person, marriage_family).
rule_source(people_who_trust_another_person_are_less_likely_to_trust_those_distrusted_by_that_person, ensemble).
rule_priority(people_who_trust_another_person_are_less_likely_to_trust_those_distrusted_by_that_person, 5).
rule_applies(people_who_trust_another_person_are_less_likely_to_trust_those_distrusted_by_that_person, X, Y) :-
    directed_status(X, 'z', hates),
    directed_status(Y, X, trusts),
    trait(X, deceptive),
    network(Y, 'z', affinity, Affinity_val), Affinity_val > 50.
rule_effect(people_who_trust_another_person_are_less_likely_to_trust_those_distrusted_by_that_person, modify_network(Y, 'z', affinity, '-', 5)).
rule_effect(people_who_trust_another_person_are_less_likely_to_trust_those_distrusted_by_that_person, modify_network(X, Y, credibility, '+', 5)).

rule_likelihood(a_foreign_person_may_draw_the_attention_of_others, 1).
rule_type(a_foreign_person_may_draw_the_attention_of_others, volition).
% A foreign person may draw the attention of others
rule_active(a_foreign_person_may_draw_the_attention_of_others).
rule_category(a_foreign_person_may_draw_the_attention_of_others, marriage_family).
rule_source(a_foreign_person_may_draw_the_attention_of_others, ensemble).
rule_priority(a_foreign_person_may_draw_the_attention_of_others, 3).
rule_applies(a_foreign_person_may_draw_the_attention_of_others, X, Y) :-
    trait(X, foreigner),
    \+ trait(Y, foreigner).
rule_effect(a_foreign_person_may_draw_the_attention_of_others, modify_network(Y, X, curiosity, '+', 3)).

rule_likelihood(unhappy_resentful_non_rich_people_married_to_other_non_rich_people_may_be_less_likely_to_esteem_their_spouse, 1).
rule_type(unhappy_resentful_non_rich_people_married_to_other_non_rich_people_may_be_less_likely_to_esteem_their_spouse, volition).
% Unhappy, resentful, non-rich people married to other non-rich people may be less likely to esteem their spouse
rule_active(unhappy_resentful_non_rich_people_married_to_other_non_rich_people_may_be_less_likely_to_esteem_their_spouse).
rule_category(unhappy_resentful_non_rich_people_married_to_other_non_rich_people_may_be_less_likely_to_esteem_their_spouse, marriage_family).
rule_source(unhappy_resentful_non_rich_people_married_to_other_non_rich_people_may_be_less_likely_to_esteem_their_spouse, ensemble).
rule_priority(unhappy_resentful_non_rich_people_married_to_other_non_rich_people_may_be_less_likely_to_esteem_their_spouse, 5).
rule_applies(unhappy_resentful_non_rich_people_married_to_other_non_rich_people_may_be_less_likely_to_esteem_their_spouse, X, Y) :-
    relationship(X, Y, married),
    trait(X, rich),
    \+ trait(Y, rich),
    \+ status(X, happy),
    \+ trait(X, rich),
    directed_status(X, Y, resentful_of).
rule_effect(unhappy_resentful_non_rich_people_married_to_other_non_rich_people_may_be_less_likely_to_esteem_their_spouse, set_relationship(X, Y, esteem, -5)).

rule_likelihood(two_people_with_a_high_affinity_for_a_third_person_may_become_rivals, 1).
rule_type(two_people_with_a_high_affinity_for_a_third_person_may_become_rivals, volition).
% Two people with a high affinity for a third person may become rivals
rule_active(two_people_with_a_high_affinity_for_a_third_person_may_become_rivals).
rule_category(two_people_with_a_high_affinity_for_a_third_person_may_become_rivals, marriage_family).
rule_source(two_people_with_a_high_affinity_for_a_third_person_may_become_rivals, ensemble).
rule_priority(two_people_with_a_high_affinity_for_a_third_person_may_become_rivals, 5).
rule_applies(two_people_with_a_high_affinity_for_a_third_person_may_become_rivals, X, Y) :-
    network(X, 'z', affinity, Affinity_val), Affinity_val > 80,
    network(Y, 'z', affinity, Affinity_val), Affinity_val > 80.
rule_effect(two_people_with_a_high_affinity_for_a_third_person_may_become_rivals, set_relationship(X, Y, rivals, 5)).
rule_effect(two_people_with_a_high_affinity_for_a_third_person_may_become_rivals, set_relationship(Y, X, rivals, 5)).

rule_likelihood(when_flattered_by_someone_they_trust_a_person_may_do_a_lot_to_please, 1).
rule_type(when_flattered_by_someone_they_trust_a_person_may_do_a_lot_to_please, volition).
% When flattered by someone they trust, a person may do a lot to please
rule_active(when_flattered_by_someone_they_trust_a_person_may_do_a_lot_to_please).
rule_category(when_flattered_by_someone_they_trust_a_person_may_do_a_lot_to_please, marriage_family).
rule_source(when_flattered_by_someone_they_trust_a_person_may_do_a_lot_to_please, ensemble).
rule_priority(when_flattered_by_someone_they_trust_a_person_may_do_a_lot_to_please, 5).
rule_applies(when_flattered_by_someone_they_trust_a_person_may_do_a_lot_to_please, X, Y) :-
    status(X, flattered),
    directed_status(X, Y, trusts).
rule_effect(when_flattered_by_someone_they_trust_a_person_may_do_a_lot_to_please, modify_network(X, Y, affinity, '+', 5)).

rule_likelihood(a_naive_woman_may_fail_to_recognize_when_her_husband_is_jealous_of_a_suitor, 1).
rule_type(a_naive_woman_may_fail_to_recognize_when_her_husband_is_jealous_of_a_suitor, volition).
% A naive woman may fail to recognize when her husband is jealous of a suitor
rule_active(a_naive_woman_may_fail_to_recognize_when_her_husband_is_jealous_of_a_suitor).
rule_category(a_naive_woman_may_fail_to_recognize_when_her_husband_is_jealous_of_a_suitor, marriage_family).
rule_source(a_naive_woman_may_fail_to_recognize_when_her_husband_is_jealous_of_a_suitor, ensemble).
rule_priority(a_naive_woman_may_fail_to_recognize_when_her_husband_is_jealous_of_a_suitor, 5).
rule_applies(a_naive_woman_may_fail_to_recognize_when_her_husband_is_jealous_of_a_suitor, X, Y) :-
    trait(X, female),
    trait(X, credulous),
    trait(Y, male),
    relationship(X, Y, married),
    relationship(Y, 'z', friends),
    trait('z', male),
    directed_status(Y, 'z', jealous_of).
rule_effect(a_naive_woman_may_fail_to_recognize_when_her_husband_is_jealous_of_a_suitor, modify_network(Y, X, affinity, '+', 5)).

rule_likelihood(a_rich_person_may_use_a_non_rich_person_to_gain_the_esteem_of_others, 1).
rule_type(a_rich_person_may_use_a_non_rich_person_to_gain_the_esteem_of_others, volition).
% A rich person may use a non-rich person to gain the esteem of others
rule_active(a_rich_person_may_use_a_non_rich_person_to_gain_the_esteem_of_others).
rule_category(a_rich_person_may_use_a_non_rich_person_to_gain_the_esteem_of_others, marriage_family).
rule_source(a_rich_person_may_use_a_non_rich_person_to_gain_the_esteem_of_others, ensemble).
rule_priority(a_rich_person_may_use_a_non_rich_person_to_gain_the_esteem_of_others, 5).
rule_applies(a_rich_person_may_use_a_non_rich_person_to_gain_the_esteem_of_others, X, Y) :-
    directed_status(X, Y, owes_a_favor_to),
    trait(Y, ambitious),
    trait(Y, rich),
    attribute(Y, social_standing, Social_standing_val), Social_standing_val > 70,
    relationship(X, 'z', friends),
    trait('z', rich),
    attribute('z', social_standing, Social_standing_val), Social_standing_val > 85,
    \+ trait(X, rich).
rule_effect(a_rich_person_may_use_a_non_rich_person_to_gain_the_esteem_of_others, set_relationship(Y, X, ally, 5)).
rule_effect(a_rich_person_may_use_a_non_rich_person_to_gain_the_esteem_of_others, modify_network(Y, X, curiosity, '+', 5)).
rule_effect(a_rich_person_may_use_a_non_rich_person_to_gain_the_esteem_of_others, set_relationship(Y, X, esteem, 5)).
rule_effect(a_rich_person_may_use_a_non_rich_person_to_gain_the_esteem_of_others, set_relationship(X, Y, esteem, -3)).

rule_likelihood(an_esteemed_self_assured_person_has_only_little_desire_to_increase_another_s_affinity, 1).
rule_type(an_esteemed_self_assured_person_has_only_little_desire_to_increase_another_s_affinity, volition).
% An esteemed, self-assured person has only little desire to increase another’s affinity
rule_active(an_esteemed_self_assured_person_has_only_little_desire_to_increase_another_s_affinity).
rule_category(an_esteemed_self_assured_person_has_only_little_desire_to_increase_another_s_affinity, marriage_family).
rule_source(an_esteemed_self_assured_person_has_only_little_desire_to_increase_another_s_affinity, ensemble).
rule_priority(an_esteemed_self_assured_person_has_only_little_desire_to_increase_another_s_affinity, 1).
rule_applies(an_esteemed_self_assured_person_has_only_little_desire_to_increase_another_s_affinity, X, Y) :-
    directed_status(X, Y, esteems),
    attribute(Y, self_assuredness, Self_assuredness_val), Self_assuredness_val > 70.
rule_effect(an_esteemed_self_assured_person_has_only_little_desire_to_increase_another_s_affinity, modify_network(Y, X, affinity, '+', 1)).

rule_likelihood(young_women_trust_honest_older_men_when_both_esteem_a_third_person, 1).
rule_type(young_women_trust_honest_older_men_when_both_esteem_a_third_person, volition).
% Young women trust honest, older men when both esteem a third person
rule_active(young_women_trust_honest_older_men_when_both_esteem_a_third_person).
rule_category(young_women_trust_honest_older_men_when_both_esteem_a_third_person, marriage_family).
rule_source(young_women_trust_honest_older_men_when_both_esteem_a_third_person, ensemble).
rule_priority(young_women_trust_honest_older_men_when_both_esteem_a_third_person, 5).
rule_applies(young_women_trust_honest_older_men_when_both_esteem_a_third_person, X, Y) :-
    trait(X, young),
    trait(X, female),
    directed_status(X, Y, trusts),
    trait(Y, honest),
    trait(Y, old),
    trait(Y, male),
    directed_status(X, 'z', esteems),
    directed_status(Y, 'z', esteems).
rule_effect(young_women_trust_honest_older_men_when_both_esteem_a_third_person, set_relationship(X, Y, ally, 5)).
rule_effect(young_women_trust_honest_older_men_when_both_esteem_a_third_person, modify_network(X, Y, curiosity, '+', 5)).

rule_likelihood(an_attendee_with_little_education_is_talkative_and_will_enjoy_the_company_of_a_talkative_person, 1).
rule_type(an_attendee_with_little_education_is_talkative_and_will_enjoy_the_company_of_a_talkative_person, volition).
% An attendee with little education is talkative and will enjoy the company of a talkative person
rule_active(an_attendee_with_little_education_is_talkative_and_will_enjoy_the_company_of_a_talkative_person).
rule_category(an_attendee_with_little_education_is_talkative_and_will_enjoy_the_company_of_a_talkative_person, marriage_family).
rule_source(an_attendee_with_little_education_is_talkative_and_will_enjoy_the_company_of_a_talkative_person, ensemble).
rule_priority(an_attendee_with_little_education_is_talkative_and_will_enjoy_the_company_of_a_talkative_person, 1).
rule_applies(an_attendee_with_little_education_is_talkative_and_will_enjoy_the_company_of_a_talkative_person, X, Y) :-
    trait(X, attendee),
    trait(X, female),
    trait(X, talkative),
    trait(Y, talkative).
rule_effect(an_attendee_with_little_education_is_talkative_and_will_enjoy_the_company_of_a_talkative_person, modify_network(X, Y, affinity, '+', 1)).

rule_likelihood(you_are_more_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them, 1).
rule_type(you_are_more_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them, volition).
% You are more likely to be reluctable to somebody if a family member has low trust toward them.
rule_active(you_are_more_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them).
rule_category(you_are_more_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them, marriage_family).
rule_source(you_are_more_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them, ensemble).
rule_priority(you_are_more_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them, 1).
rule_applies(you_are_more_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them, X, Y) :-
    network('z', Y, trust, Trust_val), Trust_val < 4,
    status(X, family),
    status('z', family).
rule_effect(you_are_more_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them, set_intent(X, reluctant, Y, 1)).

rule_likelihood(you_are_less_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them, 1).
rule_type(you_are_less_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them, volition).
% You are less likely to be reluctable to somebody if a family member has low trust toward them.
rule_active(you_are_less_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them).
rule_category(you_are_less_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them, marriage_family).
rule_source(you_are_less_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them, ensemble).
rule_priority(you_are_less_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them, 1).
rule_applies(you_are_less_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them, X, Y) :-
    network('z', Y, trust, Trust_val), Trust_val > 6,
    status(X, family),
    status('z', family).
rule_effect(you_are_less_likely_to_be_reluctable_to_somebody_if_a_family_member_has_low_trust_toward_them, set_intent(X, reluctant, Y, -1)).

rule_likelihood(people_are_more_likely_to_deny_someone_something_if_that_person_has_been_rude, 1).
rule_type(people_are_more_likely_to_deny_someone_something_if_that_person_has_been_rude, volition).
% People are more likely to deny someone something if that person has been rude
rule_active(people_are_more_likely_to_deny_someone_something_if_that_person_has_been_rude).
rule_category(people_are_more_likely_to_deny_someone_something_if_that_person_has_been_rude, marriage_family).
rule_source(people_are_more_likely_to_deny_someone_something_if_that_person_has_been_rude, ensemble).
rule_priority(people_are_more_likely_to_deny_someone_something_if_that_person_has_been_rude, 8).
rule_applies(people_are_more_likely_to_deny_someone_something_if_that_person_has_been_rude, X, Y) :-
    event(Y, rude).
rule_effect(people_are_more_likely_to_deny_someone_something_if_that_person_has_been_rude, set_intent(X, deny, Y, 10)).

rule_likelihood(if_the_someone_is_negative_and_is_neutral_to_a_high_status_person_one_s_volition_for_dismiss_is_increased, 1).
rule_type(if_the_someone_is_negative_and_is_neutral_to_a_high_status_person_one_s_volition_for_dismiss_is_increased, volition).
% If the someone is negative and is neutral to a high status person, one’s volition for dismiss is increased
rule_active(if_the_someone_is_negative_and_is_neutral_to_a_high_status_person_one_s_volition_for_dismiss_is_increased).
rule_category(if_the_someone_is_negative_and_is_neutral_to_a_high_status_person_one_s_volition_for_dismiss_is_increased, marriage_family).
rule_source(if_the_someone_is_negative_and_is_neutral_to_a_high_status_person_one_s_volition_for_dismiss_is_increased, ensemble).
rule_priority(if_the_someone_is_negative_and_is_neutral_to_a_high_status_person_one_s_volition_for_dismiss_is_increased, 5).
rule_applies(if_the_someone_is_negative_and_is_neutral_to_a_high_status_person_one_s_volition_for_dismiss_is_increased, X, Y) :-
    event(X, negative),
    event(Y, neutral),
    attribute(X, status_individual, Status_individual_val), Status_individual_val > 50.
rule_effect(if_the_someone_is_negative_and_is_neutral_to_a_high_status_person_one_s_volition_for_dismiss_is_increased, set_intent(X, dismiss, Y, 5)).

rule_likelihood(if_you_negatively_greet_and_respectfully_requested_to_a_low_status_person_increase_dismiss_volition, 1).
rule_type(if_you_negatively_greet_and_respectfully_requested_to_a_low_status_person_increase_dismiss_volition, volition).
% If you negatively greet and respectfully requested to a low status person -> increase dismiss volition
rule_active(if_you_negatively_greet_and_respectfully_requested_to_a_low_status_person_increase_dismiss_volition).
rule_category(if_you_negatively_greet_and_respectfully_requested_to_a_low_status_person_increase_dismiss_volition, marriage_family).
rule_source(if_you_negatively_greet_and_respectfully_requested_to_a_low_status_person_increase_dismiss_volition, ensemble).
rule_priority(if_you_negatively_greet_and_respectfully_requested_to_a_low_status_person_increase_dismiss_volition, 5).
rule_applies(if_you_negatively_greet_and_respectfully_requested_to_a_low_status_person_increase_dismiss_volition, X, Y) :-
    event(X, negative),
    event(Y, respectful),
    attribute(X, status_individual, Status_individual_val), Status_individual_val < 51.
rule_effect(if_you_negatively_greet_and_respectfully_requested_to_a_low_status_person_increase_dismiss_volition, set_intent(X, dismiss, Y, 5)).

rule_likelihood(low_status_person_is_more_likely_to_be_hospitable_if_treated_informally, 1).
rule_type(low_status_person_is_more_likely_to_be_hospitable_if_treated_informally, volition).
% Low status person is more likely to be hospitable if treated informally
rule_active(low_status_person_is_more_likely_to_be_hospitable_if_treated_informally).
rule_category(low_status_person_is_more_likely_to_be_hospitable_if_treated_informally, marriage_family).
rule_source(low_status_person_is_more_likely_to_be_hospitable_if_treated_informally, ensemble).
rule_priority(low_status_person_is_more_likely_to_be_hospitable_if_treated_informally, 5).
rule_applies(low_status_person_is_more_likely_to_be_hospitable_if_treated_informally, X, Y) :-
    event(Y, informal),
    attribute(X, status_individual, Status_individual_val), Status_individual_val < 51.
rule_effect(low_status_person_is_more_likely_to_be_hospitable_if_treated_informally, set_intent(X, hospitable, Y, 5)).

rule_likelihood(a_high_status_person_is_more_hospitable_if_the_other_person_is_formal, 1).
rule_type(a_high_status_person_is_more_hospitable_if_the_other_person_is_formal, volition).
% A high status person is more hospitable if the other person is formal
rule_active(a_high_status_person_is_more_hospitable_if_the_other_person_is_formal).
rule_category(a_high_status_person_is_more_hospitable_if_the_other_person_is_formal, marriage_family).
rule_source(a_high_status_person_is_more_hospitable_if_the_other_person_is_formal, ensemble).
rule_priority(a_high_status_person_is_more_hospitable_if_the_other_person_is_formal, 5).
rule_applies(a_high_status_person_is_more_hospitable_if_the_other_person_is_formal, X, Y) :-
    attribute(X, status_individual, Status_individual_val), Status_individual_val > 50,
    event(Y, formal).
rule_effect(a_high_status_person_is_more_hospitable_if_the_other_person_is_formal, set_intent(X, hospitable, Y, 5)).

rule_likelihood(if_someone_is_positive_and_neutral_to_a_high_status_person_then_other_increases_volition_for_reluctance, 1).
rule_type(if_someone_is_positive_and_neutral_to_a_high_status_person_then_other_increases_volition_for_reluctance, volition).
% If someone is positive and neutral to a high status person then other increases volition for reluctance
rule_active(if_someone_is_positive_and_neutral_to_a_high_status_person_then_other_increases_volition_for_reluctance).
rule_category(if_someone_is_positive_and_neutral_to_a_high_status_person_then_other_increases_volition_for_reluctance, marriage_family).
rule_source(if_someone_is_positive_and_neutral_to_a_high_status_person_then_other_increases_volition_for_reluctance, ensemble).
rule_priority(if_someone_is_positive_and_neutral_to_a_high_status_person_then_other_increases_volition_for_reluctance, 5).
rule_applies(if_someone_is_positive_and_neutral_to_a_high_status_person_then_other_increases_volition_for_reluctance, X, Y) :-
    event(X, positive),
    event(Y, neutral),
    attribute(X, status_individual, Status_individual_val), Status_individual_val > 50.
rule_effect(if_someone_is_positive_and_neutral_to_a_high_status_person_then_other_increases_volition_for_reluctance, set_intent(X, reluctant, Y, 5)).

rule_likelihood(people_s_desire_to_get_closer_within_their_extended_family_network_diminishes_when_they_have_recently_experienced, 1).
rule_type(people_s_desire_to_get_closer_within_their_extended_family_network_diminishes_when_they_have_recently_experienced, volition).
% People’s desire to get closer within their extended family network diminishes when they have recently experienced
rule_active(people_s_desire_to_get_closer_within_their_extended_family_network_diminishes_when_they_have_recently_experienced).
rule_category(people_s_desire_to_get_closer_within_their_extended_family_network_diminishes_when_they_have_recently_experienced, marriage_family).
rule_source(people_s_desire_to_get_closer_within_their_extended_family_network_diminishes_when_they_have_recently_experienced, ensemble).
rule_priority(people_s_desire_to_get_closer_within_their_extended_family_network_diminishes_when_they_have_recently_experienced, 1).
rule_applies(people_s_desire_to_get_closer_within_their_extended_family_network_diminishes_when_they_have_recently_experienced, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, nice).
rule_effect(people_s_desire_to_get_closer_within_their_extended_family_network_diminishes_when_they_have_recently_experienced, set_intent(X, antagonize, Y, -1)).

rule_likelihood(people_tend_to_seek_stronger_connections_with_those_who_have_a_larger_social_network_within_the_same_family, 1).
rule_type(people_tend_to_seek_stronger_connections_with_those_who_have_a_larger_social_network_within_the_same_family, volition).
% People tend to seek stronger connections with those who have a larger social network within the same family.
rule_active(people_tend_to_seek_stronger_connections_with_those_who_have_a_larger_social_network_within_the_same_family).
rule_category(people_tend_to_seek_stronger_connections_with_those_who_have_a_larger_social_network_within_the_same_family, marriage_family).
rule_source(people_tend_to_seek_stronger_connections_with_those_who_have_a_larger_social_network_within_the_same_family, ensemble).
rule_priority(people_tend_to_seek_stronger_connections_with_those_who_have_a_larger_social_network_within_the_same_family, 1).
rule_applies(people_tend_to_seek_stronger_connections_with_those_who_have_a_larger_social_network_within_the_same_family, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, mean).
rule_effect(people_tend_to_seek_stronger_connections_with_those_who_have_a_larger_social_network_within_the_same_family, set_intent(X, favor, Y, -1)).

rule_likelihood(people_desire_to_trust_and_connect_with_both_of_their_closest_family_members, 1).
rule_type(people_desire_to_trust_and_connect_with_both_of_their_closest_family_members, volition).
% People desire to trust and connect with both of their closest family members.
rule_active(people_desire_to_trust_and_connect_with_both_of_their_closest_family_members).
rule_category(people_desire_to_trust_and_connect_with_both_of_their_closest_family_members, marriage_family).
rule_source(people_desire_to_trust_and_connect_with_both_of_their_closest_family_members, ensemble).
rule_priority(people_desire_to_trust_and_connect_with_both_of_their_closest_family_members, 1).
rule_applies(people_desire_to_trust_and_connect_with_both_of_their_closest_family_members, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    network(Y, 'z', familial, Familial_val), Familial_val > 6.
rule_effect(people_desire_to_trust_and_connect_with_both_of_their_closest_family_members, set_intent(X, trust, Y, 2)).

rule_likelihood(people_s_desire_to_get_closer_within_their_extended_family_network_and_having_a_long_standing_interest, 1).
rule_type(people_s_desire_to_get_closer_within_their_extended_family_network_and_having_a_long_standing_interest, volition).
% People’s desire to get closer within their extended family network and having a long-standing interest
rule_active(people_s_desire_to_get_closer_within_their_extended_family_network_and_having_a_long_standing_interest).
rule_category(people_s_desire_to_get_closer_within_their_extended_family_network_and_having_a_long_standing_interest, marriage_family).
rule_source(people_s_desire_to_get_closer_within_their_extended_family_network_and_having_a_long_standing_interest, ensemble).
rule_priority(people_s_desire_to_get_closer_within_their_extended_family_network_and_having_a_long_standing_interest, 1).
rule_applies(people_s_desire_to_get_closer_within_their_extended_family_network_and_having_a_long_standing_interest, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, mean).
rule_effect(people_s_desire_to_get_closer_within_their_extended_family_network_and_having_a_long_standing_interest, set_intent(X, trust, Y, -1)).

rule_likelihood(family_members_are_kind_to_one_another, 1).
rule_type(family_members_are_kind_to_one_another, volition).
% Family members are kind to one another
rule_active(family_members_are_kind_to_one_another).
rule_category(family_members_are_kind_to_one_another, marriage_family).
rule_source(family_members_are_kind_to_one_another, ensemble).
rule_priority(family_members_are_kind_to_one_another, 3).
rule_applies(family_members_are_kind_to_one_another, X, Y) :-
    relationship(X, Y, family).
rule_effect(family_members_are_kind_to_one_another, set_intent(X, kind, Y, 3)).

rule_likelihood(people_are_less_rude_to_their_family, 1).
rule_type(people_are_less_rude_to_their_family, volition).
% People are less rude to their family
rule_active(people_are_less_rude_to_their_family).
rule_category(people_are_less_rude_to_their_family, marriage_family).
rule_source(people_are_less_rude_to_their_family, ensemble).
rule_priority(people_are_less_rude_to_their_family, 3).
rule_applies(people_are_less_rude_to_their_family, X, Y) :-
    relationship(X, Y, family).
rule_effect(people_are_less_rude_to_their_family, set_intent(X, rude, Y, -3)).




