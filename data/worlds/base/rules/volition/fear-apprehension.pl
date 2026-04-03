%% Ensemble Volition Rules: fear-apprehension
%% Source: data/ensemble/volitionRules/fear-apprehension.json
%% Converted: 2026-04-02T20:09:49.726Z
%% Total rules: 9

rule_likelihood(generous_mentor_has_no_fear_of_mentoree, 1).
rule_type(generous_mentor_has_no_fear_of_mentoree, volition).
% Generous mentor has no fear of mentoree
rule_active(generous_mentor_has_no_fear_of_mentoree).
rule_category(generous_mentor_has_no_fear_of_mentoree, fear_apprehension).
rule_source(generous_mentor_has_no_fear_of_mentoree, ensemble).
rule_priority(generous_mentor_has_no_fear_of_mentoree, 5).
rule_applies(generous_mentor_has_no_fear_of_mentoree, X, Y) :-
    directed_status(X, Y, cares_for),
    directed_status(Y, X, esteems),
    trait(X, generous).
rule_effect(generous_mentor_has_no_fear_of_mentoree, modify_network(X, Y, emulation, '+', 5)).
rule_effect(generous_mentor_has_no_fear_of_mentoree, modify_network(Y, X, credibility, '+', 5)).
rule_effect(generous_mentor_has_no_fear_of_mentoree, set_relationship(X, Y, rivals, -3)).

rule_likelihood(man_with_low_self_confidence_fears_rival_in_love, 1).
rule_type(man_with_low_self_confidence_fears_rival_in_love, volition).
% Man with low self-confidence fears rival in love
rule_active(man_with_low_self_confidence_fears_rival_in_love).
rule_category(man_with_low_self_confidence_fears_rival_in_love, fear_apprehension).
rule_source(man_with_low_self_confidence_fears_rival_in_love, ensemble).
rule_priority(man_with_low_self_confidence_fears_rival_in_love, 5).
rule_applies(man_with_low_self_confidence_fears_rival_in_love, X, Y) :-
    attribute(X, self_assuredness, Self_assuredness_val), Self_assuredness_val < 40,
    relationship(X, Y, lovers),
    relationship(Y, 'z', ally),
    trait(X, male),
    trait(Y, female),
    trait('z', male).
rule_effect(man_with_low_self_confidence_fears_rival_in_love, set_relationship(X, 'z', rivals, 5)).
rule_effect(man_with_low_self_confidence_fears_rival_in_love, modify_network(X, Y, affinity, '-', 2)).

rule_likelihood(hypocrites_are_afraid_of_being_exposed_by_others, 1).
rule_type(hypocrites_are_afraid_of_being_exposed_by_others, volition).
% Hypocrites are afraid of being exposed by others
rule_active(hypocrites_are_afraid_of_being_exposed_by_others).
rule_category(hypocrites_are_afraid_of_being_exposed_by_others, fear_apprehension).
rule_source(hypocrites_are_afraid_of_being_exposed_by_others, ensemble).
rule_priority(hypocrites_are_afraid_of_being_exposed_by_others, 5).
rule_applies(hypocrites_are_afraid_of_being_exposed_by_others, X, Y) :-
    trait(X, hypocritical),
    directed_status(X, Y, threatened_by).
rule_effect(hypocrites_are_afraid_of_being_exposed_by_others, modify_network(Y, X, affinity, '-', 5)).
rule_effect(hypocrites_are_afraid_of_being_exposed_by_others, set_relationship(X, Y, esteem, 5)).

rule_likelihood(people_with_a_fearful_status_seek_candid_relationships_to_overcome_their_apprehension, 1).
rule_type(people_with_a_fearful_status_seek_candid_relationships_to_overcome_their_apprehension, volition).
% People with a fearful status seek candid relationships to overcome their apprehension.
rule_active(people_with_a_fearful_status_seek_candid_relationships_to_overcome_their_apprehension).
rule_category(people_with_a_fearful_status_seek_candid_relationships_to_overcome_their_apprehension, fear_apprehension).
rule_source(people_with_a_fearful_status_seek_candid_relationships_to_overcome_their_apprehension, ensemble).
rule_priority(people_with_a_fearful_status_seek_candid_relationships_to_overcome_their_apprehension, 1).
rule_applies(people_with_a_fearful_status_seek_candid_relationships_to_overcome_their_apprehension, X, Y) :-
    status(X, fearful).
rule_effect(people_with_a_fearful_status_seek_candid_relationships_to_overcome_their_apprehension, set_intent(X, candid, Y, -2)).

rule_likelihood(people_are_afraid_of_being_disliked_by_others, 1).
rule_type(people_are_afraid_of_being_disliked_by_others, volition).
% People are afraid of being disliked by others.
rule_active(people_are_afraid_of_being_disliked_by_others).
rule_category(people_are_afraid_of_being_disliked_by_others, fear_apprehension).
rule_source(people_are_afraid_of_being_disliked_by_others, ensemble).
rule_priority(people_are_afraid_of_being_disliked_by_others, 5).
rule_applies(people_are_afraid_of_being_disliked_by_others, X, Y) :-
    directed_status(X, Y, afraid_of).
rule_effect(people_are_afraid_of_being_disliked_by_others, set_intent(X, candid, Y, -5)).

rule_likelihood(people_are_afraid_of_both_their_crush_and_strong_individuals_they_have_a_candid_intent_to_get, 1).
rule_type(people_are_afraid_of_both_their_crush_and_strong_individuals_they_have_a_candid_intent_to_get, volition).
% People are afraid of both their crush and strong individuals. They have a candid intent to get
rule_active(people_are_afraid_of_both_their_crush_and_strong_individuals_they_have_a_candid_intent_to_get).
rule_category(people_are_afraid_of_both_their_crush_and_strong_individuals_they_have_a_candid_intent_to_get, fear_apprehension).
rule_source(people_are_afraid_of_both_their_crush_and_strong_individuals_they_have_a_candid_intent_to_get, ensemble).
rule_priority(people_are_afraid_of_both_their_crush_and_strong_individuals_they_have_a_candid_intent_to_get, 1).
rule_applies(people_are_afraid_of_both_their_crush_and_strong_individuals_they_have_a_candid_intent_to_get, X, Y) :-
    directed_status(X, 'z', afraid_of),
    directed_status(Y, 'z', afraid_of).
rule_effect(people_are_afraid_of_both_their_crush_and_strong_individuals_they_have_a_candid_intent_to_get, set_intent(X, candid, Y, 2)).

rule_likelihood(people_manipulate_their_fear_to_get_closer_to_strong_individuals, 1).
rule_type(people_manipulate_their_fear_to_get_closer_to_strong_individuals, volition).
% People manipulate their fear to get closer to strong individuals.
rule_active(people_manipulate_their_fear_to_get_closer_to_strong_individuals).
rule_category(people_manipulate_their_fear_to_get_closer_to_strong_individuals, fear_apprehension).
rule_source(people_manipulate_their_fear_to_get_closer_to_strong_individuals, ensemble).
rule_priority(people_manipulate_their_fear_to_get_closer_to_strong_individuals, 1).
rule_applies(people_manipulate_their_fear_to_get_closer_to_strong_individuals, X, Y) :-
    directed_status(X, Y, afraid_of).
rule_effect(people_manipulate_their_fear_to_get_closer_to_strong_individuals, set_intent(X, manipulate, Y, 1)).

rule_likelihood(people_with_a_fearful_status_seek_trust_from_others, 1).
rule_type(people_with_a_fearful_status_seek_trust_from_others, volition).
% People with a fearful status seek trust from others.
rule_active(people_with_a_fearful_status_seek_trust_from_others).
rule_category(people_with_a_fearful_status_seek_trust_from_others, fear_apprehension).
rule_source(people_with_a_fearful_status_seek_trust_from_others, ensemble).
rule_priority(people_with_a_fearful_status_seek_trust_from_others, 1).
rule_applies(people_with_a_fearful_status_seek_trust_from_others, X, Y) :-
    status(X, fearful).
rule_effect(people_with_a_fearful_status_seek_trust_from_others, set_intent(X, trust, Y, -2)).

rule_likelihood(people_are_afraid_of_being_judged_by_others_when_they_trust_their_crush, 1).
rule_type(people_are_afraid_of_being_judged_by_others_when_they_trust_their_crush, volition).
% People are afraid of being judged by others when they trust their crush.
rule_active(people_are_afraid_of_being_judged_by_others_when_they_trust_their_crush).
rule_category(people_are_afraid_of_being_judged_by_others_when_they_trust_their_crush, fear_apprehension).
rule_source(people_are_afraid_of_being_judged_by_others_when_they_trust_their_crush, ensemble).
rule_priority(people_are_afraid_of_being_judged_by_others_when_they_trust_their_crush, 3).
rule_applies(people_are_afraid_of_being_judged_by_others_when_they_trust_their_crush, X, Y) :-
    directed_status(X, Y, afraid_of).
rule_effect(people_are_afraid_of_being_judged_by_others_when_they_trust_their_crush, set_intent(X, trust, Y, -3)).

