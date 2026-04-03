%% Ensemble Volition Rules: trust-credibility
%% Source: data/ensemble/volitionRules/trust-credibility.json
%% Converted: 2026-04-02T20:09:49.730Z
%% Total rules: 34

rule_likelihood(an_elegantly_dressed_man_inspires_credibility_and_attention, 1).
rule_type(an_elegantly_dressed_man_inspires_credibility_and_attention, volition).
% An elegantly dressed man inspires credibility and attention
rule_active(an_elegantly_dressed_man_inspires_credibility_and_attention).
rule_category(an_elegantly_dressed_man_inspires_credibility_and_attention, trust_credibility).
rule_source(an_elegantly_dressed_man_inspires_credibility_and_attention, ensemble).
rule_priority(an_elegantly_dressed_man_inspires_credibility_and_attention, 5).
rule_applies(an_elegantly_dressed_man_inspires_credibility_and_attention, X, Y) :-
    trait(X, elegantly_dressed),
    trait(X, male).
rule_effect(an_elegantly_dressed_man_inspires_credibility_and_attention, modify_network(Y, X, credibility, '+', 5)).
rule_effect(an_elegantly_dressed_man_inspires_credibility_and_attention, modify_network(Y, X, curiosity, '+', 5)).

rule_likelihood(innocent_looking_women_inspire_trust, 1).
rule_type(innocent_looking_women_inspire_trust, volition).
% Innocent looking women inspire trust
rule_active(innocent_looking_women_inspire_trust).
rule_category(innocent_looking_women_inspire_trust, trust_credibility).
rule_source(innocent_looking_women_inspire_trust, ensemble).
rule_priority(innocent_looking_women_inspire_trust, 1).
rule_applies(innocent_looking_women_inspire_trust, X, Y) :-
    trait(X, female),
    trait(X, innocent_looking).
rule_effect(innocent_looking_women_inspire_trust, modify_network(Y, X, credibility, '+', 2)).

rule_likelihood(for_a_member_of_the_clergy_an_elegantly_dressed_academic_has_no_credibility, 1).
rule_type(for_a_member_of_the_clergy_an_elegantly_dressed_academic_has_no_credibility, volition).
% For a member of the clergy, an elegantly dressed academic has no credibility
rule_active(for_a_member_of_the_clergy_an_elegantly_dressed_academic_has_no_credibility).
rule_category(for_a_member_of_the_clergy_an_elegantly_dressed_academic_has_no_credibility, trust_credibility).
rule_source(for_a_member_of_the_clergy_an_elegantly_dressed_academic_has_no_credibility, ensemble).
rule_priority(for_a_member_of_the_clergy_an_elegantly_dressed_academic_has_no_credibility, 5).
rule_applies(for_a_member_of_the_clergy_an_elegantly_dressed_academic_has_no_credibility, X, Y) :-
    trait(X, clergy),
    trait(Y, elegantly_dressed),
    trait(Y, academic).
rule_effect(for_a_member_of_the_clergy_an_elegantly_dressed_academic_has_no_credibility, modify_network(X, Y, credibility, '+', 5)).

rule_likelihood(people_are_often_suspicious_of_flatterery, 1).
rule_type(people_are_often_suspicious_of_flatterery, volition).
% People are often suspicious of flatterery
rule_active(people_are_often_suspicious_of_flatterery).
rule_category(people_are_often_suspicious_of_flatterery, trust_credibility).
rule_source(people_are_often_suspicious_of_flatterery, ensemble).
rule_priority(people_are_often_suspicious_of_flatterery, 5).
rule_applies(people_are_often_suspicious_of_flatterery, X, Y) :-
    trait(X, kind),
    trait(Y, unctuous).
rule_effect(people_are_often_suspicious_of_flatterery, modify_network(X, Y, affinity, '+', 5)).

rule_likelihood(an_unattractive_honest_man_does_not_want_to_mingle, 1).
rule_type(an_unattractive_honest_man_does_not_want_to_mingle, volition).
% An unattractive, honest man does not want to mingle
rule_active(an_unattractive_honest_man_does_not_want_to_mingle).
rule_category(an_unattractive_honest_man_does_not_want_to_mingle, trust_credibility).
rule_source(an_unattractive_honest_man_does_not_want_to_mingle, ensemble).
rule_priority(an_unattractive_honest_man_does_not_want_to_mingle, 5).
rule_applies(an_unattractive_honest_man_does_not_want_to_mingle, X, Y) :-
    trait(X, male),
    trait(X, honest),
    attribute(X, charisma, Charisma_val), Charisma_val < 30,
    \+ trait(X, rich),
    trait(X, eccentric).
rule_effect(an_unattractive_honest_man_does_not_want_to_mingle, modify_network(X, Y, affinity, '-', 5)).
rule_effect(an_unattractive_honest_man_does_not_want_to_mingle, modify_network(X, Y, curiosity, '+', 5)).

rule_likelihood(attractive_and_trustworthy_people_lead_suspicious_people_to_have_increased_credibility_in_them, 1).
rule_type(attractive_and_trustworthy_people_lead_suspicious_people_to_have_increased_credibility_in_them, volition).
% Attractive and trustworthy people lead suspicious people to have increased credibility in them
rule_active(attractive_and_trustworthy_people_lead_suspicious_people_to_have_increased_credibility_in_them).
rule_category(attractive_and_trustworthy_people_lead_suspicious_people_to_have_increased_credibility_in_them, trust_credibility).
rule_source(attractive_and_trustworthy_people_lead_suspicious_people_to_have_increased_credibility_in_them, ensemble).
rule_priority(attractive_and_trustworthy_people_lead_suspicious_people_to_have_increased_credibility_in_them, 5).
rule_applies(attractive_and_trustworthy_people_lead_suspicious_people_to_have_increased_credibility_in_them, X, Y) :-
    directed_status(X, Y, suspicious_of),
    attribute(Y, charisma, Charisma_val), Charisma_val > 60,
    trait(Y, innocent_looking).
rule_effect(attractive_and_trustworthy_people_lead_suspicious_people_to_have_increased_credibility_in_them, modify_network(Y, X, credibility, '+', 5)).

rule_likelihood(generous_honest_rich_people_arise_less_suspicion_from_others, 1).
rule_type(generous_honest_rich_people_arise_less_suspicion_from_others, volition).
% Generous, honest, rich people arise less suspicion from others
rule_active(generous_honest_rich_people_arise_less_suspicion_from_others).
rule_category(generous_honest_rich_people_arise_less_suspicion_from_others, trust_credibility).
rule_source(generous_honest_rich_people_arise_less_suspicion_from_others, ensemble).
rule_priority(generous_honest_rich_people_arise_less_suspicion_from_others, 5).
rule_applies(generous_honest_rich_people_arise_less_suspicion_from_others, X, Y) :-
    trait(X, generous),
    trait(X, honest),
    trait(X, rich),
    trait(X, rich),
    directed_status(Y, X, suspicious_of),
    directed_status(X, 'z', cares_for),
    relationship(Y, 'z', friends).
rule_effect(generous_honest_rich_people_arise_less_suspicion_from_others, modify_network(Y, X, affinity, '+', 5)).
rule_effect(generous_honest_rich_people_arise_less_suspicion_from_others, set_relationship(X, Y, esteem, 5)).

rule_likelihood(happy_trusting_people_see_others_as_credible, 1).
rule_type(happy_trusting_people_see_others_as_credible, volition).
% Happy, trusting people see others as credible
rule_active(happy_trusting_people_see_others_as_credible).
rule_category(happy_trusting_people_see_others_as_credible, trust_credibility).
rule_source(happy_trusting_people_see_others_as_credible, ensemble).
rule_priority(happy_trusting_people_see_others_as_credible, 5).
rule_applies(happy_trusting_people_see_others_as_credible, X, Y) :-
    status(X, happy),
    directed_status(X, Y, trusts),
    trait(X, credulous),
    trait(Y, generous).
rule_effect(happy_trusting_people_see_others_as_credible, modify_network(X, Y, credibility, '+', 5)).
rule_effect(happy_trusting_people_see_others_as_credible, set_relationship(X, Y, ally, 5)).

rule_likelihood(honest_trustworthy_self_assured_rich_people_may_inspire_admiration, 1).
rule_type(honest_trustworthy_self_assured_rich_people_may_inspire_admiration, volition).
% Honest, trustworthy, self-assured rich people may inspire admiration
rule_active(honest_trustworthy_self_assured_rich_people_may_inspire_admiration).
rule_category(honest_trustworthy_self_assured_rich_people_may_inspire_admiration, trust_credibility).
rule_source(honest_trustworthy_self_assured_rich_people_may_inspire_admiration, ensemble).
rule_priority(honest_trustworthy_self_assured_rich_people_may_inspire_admiration, 3).
rule_applies(honest_trustworthy_self_assured_rich_people_may_inspire_admiration, X, Y) :-
    attribute(X, self_assuredness, Self_assuredness_val), Self_assuredness_val > 60,
    trait(X, rich),
    trait(X, honest),
    trait(X, trustworthy).
rule_effect(honest_trustworthy_self_assured_rich_people_may_inspire_admiration, modify_network(Y, X, affinity, '+', 3)).

rule_likelihood(those_who_are_resented_and_distrusted_may_want_to_improve_their_credibility, 1).
rule_type(those_who_are_resented_and_distrusted_may_want_to_improve_their_credibility, volition).
% Those who are resented and distrusted may want to improve their credibility
rule_active(those_who_are_resented_and_distrusted_may_want_to_improve_their_credibility).
rule_category(those_who_are_resented_and_distrusted_may_want_to_improve_their_credibility, trust_credibility).
rule_source(those_who_are_resented_and_distrusted_may_want_to_improve_their_credibility, ensemble).
rule_priority(those_who_are_resented_and_distrusted_may_want_to_improve_their_credibility, 5).
rule_applies(those_who_are_resented_and_distrusted_may_want_to_improve_their_credibility, X, Y) :-
    directed_status(Y, X, resentful_of),
    \+ directed_status(Y, X, trusts).
rule_effect(those_who_are_resented_and_distrusted_may_want_to_improve_their_credibility, modify_network(X, Y, credibility, '+', 5)).

rule_likelihood(rich_credulous_men_increase_affinity_for_devout_provincials, 1).
rule_type(rich_credulous_men_increase_affinity_for_devout_provincials, volition).
% Rich, credulous men increase affinity for devout provincials
rule_active(rich_credulous_men_increase_affinity_for_devout_provincials).
rule_category(rich_credulous_men_increase_affinity_for_devout_provincials, trust_credibility).
rule_source(rich_credulous_men_increase_affinity_for_devout_provincials, ensemble).
rule_priority(rich_credulous_men_increase_affinity_for_devout_provincials, 5).
rule_applies(rich_credulous_men_increase_affinity_for_devout_provincials, X, Y) :-
    trait(Y, credulous),
    trait(X, provincial),
    trait(Y, rich),
    trait(X, devout),
    trait(X, trustworthy).
rule_effect(rich_credulous_men_increase_affinity_for_devout_provincials, modify_network(Y, X, affinity, '+', 5)).

rule_likelihood(poor_people_may_desire_to_gain_the_trust_of_rich_people, 1).
rule_type(poor_people_may_desire_to_gain_the_trust_of_rich_people, volition).
% Poor people may desire to gain the trust of rich people
rule_active(poor_people_may_desire_to_gain_the_trust_of_rich_people).
rule_category(poor_people_may_desire_to_gain_the_trust_of_rich_people, trust_credibility).
rule_source(poor_people_may_desire_to_gain_the_trust_of_rich_people, ensemble).
rule_priority(poor_people_may_desire_to_gain_the_trust_of_rich_people, 5).
rule_applies(poor_people_may_desire_to_gain_the_trust_of_rich_people, X, Y) :-
    trait(X, poor),
    directed_status(X, Y, jealous_of),
    trait(Y, rich).
rule_effect(poor_people_may_desire_to_gain_the_trust_of_rich_people, modify_network(X, Y, credibility, '+', 5)).

rule_likelihood(devout_and_trustworthy_clergy_members_inspire_respect, 1).
rule_type(devout_and_trustworthy_clergy_members_inspire_respect, volition).
% Devout and trustworthy clergy members inspire respect
rule_active(devout_and_trustworthy_clergy_members_inspire_respect).
rule_category(devout_and_trustworthy_clergy_members_inspire_respect, trust_credibility).
rule_source(devout_and_trustworthy_clergy_members_inspire_respect, ensemble).
rule_priority(devout_and_trustworthy_clergy_members_inspire_respect, 5).
rule_applies(devout_and_trustworthy_clergy_members_inspire_respect, X, Y) :-
    trait(Y, devout),
    trait(Y, clergy),
    trait(Y, trustworthy).
rule_effect(devout_and_trustworthy_clergy_members_inspire_respect, modify_network(X, Y, affinity, '+', 5)).

rule_likelihood(someone_in_love_will_trust_their_loved_one_if_he_she_rejects_other_suitors, 1).
rule_type(someone_in_love_will_trust_their_loved_one_if_he_she_rejects_other_suitors, volition).
% Someone in love will trust their loved one if he/she rejects other suitors
rule_active(someone_in_love_will_trust_their_loved_one_if_he_she_rejects_other_suitors).
rule_category(someone_in_love_will_trust_their_loved_one_if_he_she_rejects_other_suitors, trust_credibility).
rule_source(someone_in_love_will_trust_their_loved_one_if_he_she_rejects_other_suitors, ensemble).
rule_priority(someone_in_love_will_trust_their_loved_one_if_he_she_rejects_other_suitors, 5).
rule_applies(someone_in_love_will_trust_their_loved_one_if_he_she_rejects_other_suitors, X, Y) :-
    network(X, Y, affinity, Affinity_val), Affinity_val > 80,
    directed_status(X, X, jealous_of),
    network(Y, X, curiosity, Curiosity_val), Curiosity_val < 33.
rule_effect(someone_in_love_will_trust_their_loved_one_if_he_she_rejects_other_suitors, set_relationship(X, Y, esteem, 5)).

rule_likelihood(workers_are_not_likely_to_increase_affinity_esteem_and_credibility_for_their_employers, 1).
rule_type(workers_are_not_likely_to_increase_affinity_esteem_and_credibility_for_their_employers, volition).
% Workers are not likely to increase affinity, esteem, and credibility for their employers
rule_active(workers_are_not_likely_to_increase_affinity_esteem_and_credibility_for_their_employers).
rule_category(workers_are_not_likely_to_increase_affinity_esteem_and_credibility_for_their_employers, trust_credibility).
rule_source(workers_are_not_likely_to_increase_affinity_esteem_and_credibility_for_their_employers, ensemble).
rule_priority(workers_are_not_likely_to_increase_affinity_esteem_and_credibility_for_their_employers, 1).
rule_applies(workers_are_not_likely_to_increase_affinity_esteem_and_credibility_for_their_employers, X, Y) :-
    trait(X, stagehand),
    directed_status(X, Y, financially_dependent_on),
    directed_status(X, Y, resentful_of).
rule_effect(workers_are_not_likely_to_increase_affinity_esteem_and_credibility_for_their_employers, modify_network(X, Y, affinity, '-', 1)).
rule_effect(workers_are_not_likely_to_increase_affinity_esteem_and_credibility_for_their_employers, set_relationship(X, Y, esteem, -2)).
rule_effect(workers_are_not_likely_to_increase_affinity_esteem_and_credibility_for_their_employers, modify_network(X, Y, credibility, '-', 1)).

rule_likelihood(people_are_more_likely_to_consider_strong_individuals_as_potential_partners_based_on_trust_levels, 1).
rule_type(people_are_more_likely_to_consider_strong_individuals_as_potential_partners_based_on_trust_levels, volition).
% People are more likely to consider strong individuals as potential partners based on trust levels.
rule_active(people_are_more_likely_to_consider_strong_individuals_as_potential_partners_based_on_trust_levels).
rule_category(people_are_more_likely_to_consider_strong_individuals_as_potential_partners_based_on_trust_levels, trust_credibility).
rule_source(people_are_more_likely_to_consider_strong_individuals_as_potential_partners_based_on_trust_levels, ensemble).
rule_priority(people_are_more_likely_to_consider_strong_individuals_as_potential_partners_based_on_trust_levels, 1).
rule_applies(people_are_more_likely_to_consider_strong_individuals_as_potential_partners_based_on_trust_levels, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val > 7.
rule_effect(people_are_more_likely_to_consider_strong_individuals_as_potential_partners_based_on_trust_levels, set_intent(X, candid, Y, 2)).

rule_likelihood(people_are_less_likely_to_date_those_they_don_t_trust_significantly_more_than_others, 1).
rule_type(people_are_less_likely_to_date_those_they_don_t_trust_significantly_more_than_others, volition).
% People are less likely to date those they don’t trust significantly more than others.
rule_active(people_are_less_likely_to_date_those_they_don_t_trust_significantly_more_than_others).
rule_category(people_are_less_likely_to_date_those_they_don_t_trust_significantly_more_than_others, trust_credibility).
rule_source(people_are_less_likely_to_date_those_they_don_t_trust_significantly_more_than_others, ensemble).
rule_priority(people_are_less_likely_to_date_those_they_don_t_trust_significantly_more_than_others, 1).
rule_applies(people_are_less_likely_to_date_those_they_don_t_trust_significantly_more_than_others, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val < 4.
rule_effect(people_are_less_likely_to_date_those_they_don_t_trust_significantly_more_than_others, set_intent(X, candid, Y, -2)).

rule_likelihood(people_are_inclined_to_form_connections_with_individuals_they_trust_more_than_others_in_their_social_network, 1).
rule_type(people_are_inclined_to_form_connections_with_individuals_they_trust_more_than_others_in_their_social_network, volition).
% People are inclined to form connections with individuals they trust more than others in their social network.
rule_active(people_are_inclined_to_form_connections_with_individuals_they_trust_more_than_others_in_their_social_network).
rule_category(people_are_inclined_to_form_connections_with_individuals_they_trust_more_than_others_in_their_social_network, trust_credibility).
rule_source(people_are_inclined_to_form_connections_with_individuals_they_trust_more_than_others_in_their_social_network, ensemble).
rule_priority(people_are_inclined_to_form_connections_with_individuals_they_trust_more_than_others_in_their_social_network, 1).
rule_applies(people_are_inclined_to_form_connections_with_individuals_they_trust_more_than_others_in_their_social_network, X, Y) :-
    network(X, 'z', trust, Trust_val), Trust_val < 4,
    network(Y, 'z', trust, Trust_val), Trust_val < 4.
rule_effect(people_are_inclined_to_form_connections_with_individuals_they_trust_more_than_others_in_their_social_network, set_intent(X, candid, Y, 1)).

rule_likelihood(people_have_a_strong_inclination_to_form_closer_bonds_with_individuals_they_trust_significantly, 1).
rule_type(people_have_a_strong_inclination_to_form_closer_bonds_with_individuals_they_trust_significantly, volition).
% People have a strong inclination to form closer bonds with individuals they trust significantly.
rule_active(people_have_a_strong_inclination_to_form_closer_bonds_with_individuals_they_trust_significantly).
rule_category(people_have_a_strong_inclination_to_form_closer_bonds_with_individuals_they_trust_significantly, trust_credibility).
rule_source(people_have_a_strong_inclination_to_form_closer_bonds_with_individuals_they_trust_significantly, ensemble).
rule_priority(people_have_a_strong_inclination_to_form_closer_bonds_with_individuals_they_trust_significantly, 1).
rule_applies(people_have_a_strong_inclination_to_form_closer_bonds_with_individuals_they_trust_significantly, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val > 6.
rule_effect(people_have_a_strong_inclination_to_form_closer_bonds_with_individuals_they_trust_significantly, set_intent(X, favor, Y, 2)).

rule_likelihood(people_desire_to_connect_with_individuals_they_trust_more_than_others, 1).
rule_type(people_desire_to_connect_with_individuals_they_trust_more_than_others, volition).
% People desire to connect with individuals they trust more than others.
rule_active(people_desire_to_connect_with_individuals_they_trust_more_than_others).
rule_category(people_desire_to_connect_with_individuals_they_trust_more_than_others, trust_credibility).
rule_source(people_desire_to_connect_with_individuals_they_trust_more_than_others, ensemble).
rule_priority(people_desire_to_connect_with_individuals_they_trust_more_than_others, 3).
rule_applies(people_desire_to_connect_with_individuals_they_trust_more_than_others, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val > 6.
rule_effect(people_desire_to_connect_with_individuals_they_trust_more_than_others, set_intent(X, kind, Y, 3)).

rule_likelihood(people_desire_to_associate_with_individuals_they_trust_more_than_others, 1).
rule_type(people_desire_to_associate_with_individuals_they_trust_more_than_others, volition).
% People desire to associate with individuals they trust more than others.
rule_active(people_desire_to_associate_with_individuals_they_trust_more_than_others).
rule_category(people_desire_to_associate_with_individuals_they_trust_more_than_others, trust_credibility).
rule_source(people_desire_to_associate_with_individuals_they_trust_more_than_others, ensemble).
rule_priority(people_desire_to_associate_with_individuals_they_trust_more_than_others, 3).
rule_applies(people_desire_to_associate_with_individuals_they_trust_more_than_others, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val < 4.
rule_effect(people_desire_to_associate_with_individuals_they_trust_more_than_others, set_intent(X, kind, Y, -3)).

rule_likelihood(people_seek_to_increase_trust_with_stronger_individuals_but_may_inadvertently_decrease_their_own_intentional, 1).
rule_type(people_seek_to_increase_trust_with_stronger_individuals_but_may_inadvertently_decrease_their_own_intentional, volition).
% People seek to increase trust with stronger individuals but may inadvertently decrease their own intentional
rule_active(people_seek_to_increase_trust_with_stronger_individuals_but_may_inadvertently_decrease_their_own_intentional).
rule_category(people_seek_to_increase_trust_with_stronger_individuals_but_may_inadvertently_decrease_their_own_intentional, trust_credibility).
rule_source(people_seek_to_increase_trust_with_stronger_individuals_but_may_inadvertently_decrease_their_own_intentional, ensemble).
rule_priority(people_seek_to_increase_trust_with_stronger_individuals_but_may_inadvertently_decrease_their_own_intentional, 1).
rule_applies(people_seek_to_increase_trust_with_stronger_individuals_but_may_inadvertently_decrease_their_own_intentional, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val > 6.
rule_effect(people_seek_to_increase_trust_with_stronger_individuals_but_may_inadvertently_decrease_their_own_intentional, set_intent(X, manipulate, Y, -1)).

rule_likelihood(people_desire_to_trust_stronger_individuals_in_their_network_when_the_number_of_strong_connections_exceeds_six, 1).
rule_type(people_desire_to_trust_stronger_individuals_in_their_network_when_the_number_of_strong_connections_exceeds_six, volition).
% People desire to trust stronger individuals in their network when the number of strong connections exceeds six.
rule_active(people_desire_to_trust_stronger_individuals_in_their_network_when_the_number_of_strong_connections_exceeds_six).
rule_category(people_desire_to_trust_stronger_individuals_in_their_network_when_the_number_of_strong_connections_exceeds_six, trust_credibility).
rule_source(people_desire_to_trust_stronger_individuals_in_their_network_when_the_number_of_strong_connections_exceeds_six, ensemble).
rule_priority(people_desire_to_trust_stronger_individuals_in_their_network_when_the_number_of_strong_connections_exceeds_six, 1).
rule_applies(people_desire_to_trust_stronger_individuals_in_their_network_when_the_number_of_strong_connections_exceeds_six, X, Y) :-
    network(X, Y, familial, Familial_val), Familial_val > 6.
rule_effect(people_desire_to_trust_stronger_individuals_in_their_network_when_the_number_of_strong_connections_exceeds_six, set_intent(X, trust, Y, 2)).

rule_likelihood(people_seek_to_increase_trust_with_individuals_they_perceive_as_strong, 1).
rule_type(people_seek_to_increase_trust_with_individuals_they_perceive_as_strong, volition).
% People seek to increase trust with individuals they perceive as strong.
rule_active(people_seek_to_increase_trust_with_individuals_they_perceive_as_strong).
rule_category(people_seek_to_increase_trust_with_individuals_they_perceive_as_strong, trust_credibility).
rule_source(people_seek_to_increase_trust_with_individuals_they_perceive_as_strong, ensemble).
rule_priority(people_seek_to_increase_trust_with_individuals_they_perceive_as_strong, 5).
rule_applies(people_seek_to_increase_trust_with_individuals_they_perceive_as_strong, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val > 6.
rule_effect(people_seek_to_increase_trust_with_individuals_they_perceive_as_strong, set_intent(X, trust, Y, 5)).

rule_likelihood(people_desire_to_trust_and_form_closer_relationships_with_individuals_they_respect_significantly, 1).
rule_type(people_desire_to_trust_and_form_closer_relationships_with_individuals_they_respect_significantly, volition).
% People desire to trust and form closer relationships with individuals they respect significantly.
rule_active(people_desire_to_trust_and_form_closer_relationships_with_individuals_they_respect_significantly).
rule_category(people_desire_to_trust_and_form_closer_relationships_with_individuals_they_respect_significantly, trust_credibility).
rule_source(people_desire_to_trust_and_form_closer_relationships_with_individuals_they_respect_significantly, ensemble).
rule_priority(people_desire_to_trust_and_form_closer_relationships_with_individuals_they_respect_significantly, 1).
rule_applies(people_desire_to_trust_and_form_closer_relationships_with_individuals_they_respect_significantly, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val > 6.
rule_effect(people_desire_to_trust_and_form_closer_relationships_with_individuals_they_respect_significantly, set_intent(X, trust, Y, 2)).

rule_likelihood(people_seek_to_increase_trust_with_weaker_individuals_but_decrease_it_when_interacting_with_stronger_ones, 1).
rule_type(people_seek_to_increase_trust_with_weaker_individuals_but_decrease_it_when_interacting_with_stronger_ones, volition).
% People seek to increase trust with weaker individuals but decrease it when interacting with stronger ones.
rule_active(people_seek_to_increase_trust_with_weaker_individuals_but_decrease_it_when_interacting_with_stronger_ones).
rule_category(people_seek_to_increase_trust_with_weaker_individuals_but_decrease_it_when_interacting_with_stronger_ones, trust_credibility).
rule_source(people_seek_to_increase_trust_with_weaker_individuals_but_decrease_it_when_interacting_with_stronger_ones, ensemble).
rule_priority(people_seek_to_increase_trust_with_weaker_individuals_but_decrease_it_when_interacting_with_stronger_ones, 5).
rule_applies(people_seek_to_increase_trust_with_weaker_individuals_but_decrease_it_when_interacting_with_stronger_ones, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val < 4.
rule_effect(people_seek_to_increase_trust_with_weaker_individuals_but_decrease_it_when_interacting_with_stronger_ones, set_intent(X, trust, Y, -5)).

rule_likelihood(people_seek_trust_with_those_who_are_highly_respected_in_their_network, 1).
rule_type(people_seek_trust_with_those_who_are_highly_respected_in_their_network, volition).
% People seek trust with those who are highly respected in their network.
rule_active(people_seek_trust_with_those_who_are_highly_respected_in_their_network).
rule_category(people_seek_trust_with_those_who_are_highly_respected_in_their_network, trust_credibility).
rule_source(people_seek_trust_with_those_who_are_highly_respected_in_their_network, ensemble).
rule_priority(people_seek_trust_with_those_who_are_highly_respected_in_their_network, 1).
rule_applies(people_seek_trust_with_those_who_are_highly_respected_in_their_network, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val < 4.
rule_effect(people_seek_trust_with_those_who_are_highly_respected_in_their_network, set_intent(X, trust, Y, -2)).

rule_likelihood(people_with_xenophobic_traits_may_struggle_to_build_trust_in_others, 1).
rule_type(people_with_xenophobic_traits_may_struggle_to_build_trust_in_others, volition).
% People with xenophobic traits may struggle to build trust in others.
rule_active(people_with_xenophobic_traits_may_struggle_to_build_trust_in_others).
rule_category(people_with_xenophobic_traits_may_struggle_to_build_trust_in_others, trust_credibility).
rule_source(people_with_xenophobic_traits_may_struggle_to_build_trust_in_others, ensemble).
rule_priority(people_with_xenophobic_traits_may_struggle_to_build_trust_in_others, 3).
rule_applies(people_with_xenophobic_traits_may_struggle_to_build_trust_in_others, X, Y) :-
    trait(X, xenophobic).
rule_effect(people_with_xenophobic_traits_may_struggle_to_build_trust_in_others, set_intent(X, trust, Y, -3)).

rule_likelihood(people_develop_trust_towards_strong_individuals_over_time, 1).
rule_type(people_develop_trust_towards_strong_individuals_over_time, volition).
% People develop trust towards strong individuals over time.
rule_active(people_develop_trust_towards_strong_individuals_over_time).
rule_category(people_develop_trust_towards_strong_individuals_over_time, trust_credibility).
rule_source(people_develop_trust_towards_strong_individuals_over_time, ensemble).
rule_priority(people_develop_trust_towards_strong_individuals_over_time, 1).
rule_applies(people_develop_trust_towards_strong_individuals_over_time, X, Y) :-
    event(X, nice).
rule_effect(people_develop_trust_towards_strong_individuals_over_time, set_intent(X, trust, Y, 2)).

rule_likelihood(people_develop_trust_towards_strong_individuals_over_time_when_they_have_had_positive_interactions, 1).
rule_type(people_develop_trust_towards_strong_individuals_over_time_when_they_have_had_positive_interactions, volition).
% People develop trust towards strong individuals over time when they have had positive interactions.
rule_active(people_develop_trust_towards_strong_individuals_over_time_when_they_have_had_positive_interactions).
rule_category(people_develop_trust_towards_strong_individuals_over_time_when_they_have_had_positive_interactions, trust_credibility).
rule_source(people_develop_trust_towards_strong_individuals_over_time_when_they_have_had_positive_interactions, ensemble).
rule_priority(people_develop_trust_towards_strong_individuals_over_time_when_they_have_had_positive_interactions, 1).
rule_applies(people_develop_trust_towards_strong_individuals_over_time_when_they_have_had_positive_interactions, X, Y) :-
    event(X, nice).
rule_effect(people_develop_trust_towards_strong_individuals_over_time_when_they_have_had_positive_interactions, set_intent(X, trust, Y, 1)).

rule_likelihood(people_seek_to_increase_trust_with_strong_individuals_within_a_recent_timeframe, 1).
rule_type(people_seek_to_increase_trust_with_strong_individuals_within_a_recent_timeframe, volition).
% People seek to increase trust with strong individuals within a recent timeframe.
rule_active(people_seek_to_increase_trust_with_strong_individuals_within_a_recent_timeframe).
rule_category(people_seek_to_increase_trust_with_strong_individuals_within_a_recent_timeframe, trust_credibility).
rule_source(people_seek_to_increase_trust_with_strong_individuals_within_a_recent_timeframe, ensemble).
rule_priority(people_seek_to_increase_trust_with_strong_individuals_within_a_recent_timeframe, 1).
rule_applies(people_seek_to_increase_trust_with_strong_individuals_within_a_recent_timeframe, X, Y) :-
    event(X, mean).
rule_effect(people_seek_to_increase_trust_with_strong_individuals_within_a_recent_timeframe, set_intent(X, trust, Y, -2)).

rule_likelihood(people_develop_trust_towards_strong_individuals_when_they_have_been_consistently_attracted_to_them_for_at_least, 1).
rule_type(people_develop_trust_towards_strong_individuals_when_they_have_been_consistently_attracted_to_them_for_at_least, volition).
% People develop trust towards strong individuals when they have been consistently attracted to them for at least
rule_active(people_develop_trust_towards_strong_individuals_when_they_have_been_consistently_attracted_to_them_for_at_least).
rule_category(people_develop_trust_towards_strong_individuals_when_they_have_been_consistently_attracted_to_them_for_at_least, trust_credibility).
rule_source(people_develop_trust_towards_strong_individuals_when_they_have_been_consistently_attracted_to_them_for_at_least, ensemble).
rule_priority(people_develop_trust_towards_strong_individuals_when_they_have_been_consistently_attracted_to_them_for_at_least, 3).
rule_applies(people_develop_trust_towards_strong_individuals_when_they_have_been_consistently_attracted_to_them_for_at_least, X, Y) :-
    network(X, 'z', romance, Romance_val), Romance_val > 6,
    event(Y, mean).
rule_effect(people_develop_trust_towards_strong_individuals_when_they_have_been_consistently_attracted_to_them_for_at_least, set_intent(X, trust, Y, -3)).

rule_likelihood(people_seek_to_increase_trust_with_those_they_are_already_somewhat_close_to_within_the_last_9, 1).
rule_type(people_seek_to_increase_trust_with_those_they_are_already_somewhat_close_to_within_the_last_9, volition).
% People seek to increase trust with those they are already somewhat close to within the last 9-
rule_active(people_seek_to_increase_trust_with_those_they_are_already_somewhat_close_to_within_the_last_9).
rule_category(people_seek_to_increase_trust_with_those_they_are_already_somewhat_close_to_within_the_last_9, trust_credibility).
rule_source(people_seek_to_increase_trust_with_those_they_are_already_somewhat_close_to_within_the_last_9, ensemble).
rule_priority(people_seek_to_increase_trust_with_those_they_are_already_somewhat_close_to_within_the_last_9, 1).
rule_applies(people_seek_to_increase_trust_with_those_they_are_already_somewhat_close_to_within_the_last_9, X, Y) :-
    network(X, 'z', familial, Familial_val), Familial_val > 6,
    event(Y, mean).
rule_effect(people_seek_to_increase_trust_with_those_they_are_already_somewhat_close_to_within_the_last_9, set_intent(X, trust, Y, -2)).

rule_likelihood(you_are_more_likely_to_shut_down_someone_you_don_t_trust, 1).
rule_type(you_are_more_likely_to_shut_down_someone_you_don_t_trust, volition).
% You are more likely to shut down someone you don’t trust
rule_active(you_are_more_likely_to_shut_down_someone_you_don_t_trust).
rule_category(you_are_more_likely_to_shut_down_someone_you_don_t_trust, trust_credibility).
rule_source(you_are_more_likely_to_shut_down_someone_you_don_t_trust, ensemble).
rule_priority(you_are_more_likely_to_shut_down_someone_you_don_t_trust, 1).
rule_applies(you_are_more_likely_to_shut_down_someone_you_don_t_trust, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val < 3.
rule_effect(you_are_more_likely_to_shut_down_someone_you_don_t_trust, set_intent(X, shutdown, Y, 2)).




