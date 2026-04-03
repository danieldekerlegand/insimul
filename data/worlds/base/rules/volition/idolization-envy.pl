%% Ensemble Volition Rules: idolization-envy
%% Source: data/ensemble/volitionRules/idolization-envy.json
%% Converted: 2026-04-02T20:09:49.727Z
%% Total rules: 18

rule_likelihood(people_idolize_strong_individuals_but_may_not_necessarily_date_them_directly, 1).
rule_type(people_idolize_strong_individuals_but_may_not_necessarily_date_them_directly, volition).
% People idolize strong individuals but may not necessarily date them directly.
rule_active(people_idolize_strong_individuals_but_may_not_necessarily_date_them_directly).
rule_category(people_idolize_strong_individuals_but_may_not_necessarily_date_them_directly, idolization_envy).
rule_source(people_idolize_strong_individuals_but_may_not_necessarily_date_them_directly, ensemble).
rule_priority(people_idolize_strong_individuals_but_may_not_necessarily_date_them_directly, 1).
rule_applies(people_idolize_strong_individuals_but_may_not_necessarily_date_them_directly, X, Y) :-
    directed_status(X, Y, idolize).
rule_effect(people_idolize_strong_individuals_but_may_not_necessarily_date_them_directly, set_intent(X, candid, Y, -1)).

rule_likelihood(people_envy_stronger_individuals_and_seek_to_date_them, 1).
rule_type(people_envy_stronger_individuals_and_seek_to_date_them, volition).
% People envy stronger individuals and seek to date them.
rule_active(people_envy_stronger_individuals_and_seek_to_date_them).
rule_category(people_envy_stronger_individuals_and_seek_to_date_them, idolization_envy).
rule_source(people_envy_stronger_individuals_and_seek_to_date_them, ensemble).
rule_priority(people_envy_stronger_individuals_and_seek_to_date_them, 3).
rule_applies(people_envy_stronger_individuals_and_seek_to_date_them, X, Y) :-
    directed_status(X, Y, envy).
rule_effect(people_envy_stronger_individuals_and_seek_to_date_them, set_intent(X, candid, Y, -3)).

rule_likelihood(people_idolize_strong_individuals_and_are_interested_in_dating_their_crushes_who_also_hold, 1).
rule_type(people_idolize_strong_individuals_and_are_interested_in_dating_their_crushes_who_also_hold, volition).
% People idolize strong individuals and are interested in dating their crushes who also hold
rule_active(people_idolize_strong_individuals_and_are_interested_in_dating_their_crushes_who_also_hold).
rule_category(people_idolize_strong_individuals_and_are_interested_in_dating_their_crushes_who_also_hold, idolization_envy).
rule_source(people_idolize_strong_individuals_and_are_interested_in_dating_their_crushes_who_also_hold, ensemble).
rule_priority(people_idolize_strong_individuals_and_are_interested_in_dating_their_crushes_who_also_hold, 1).
rule_applies(people_idolize_strong_individuals_and_are_interested_in_dating_their_crushes_who_also_hold, X, Y) :-
    directed_status(X, 'z', idolize),
    directed_status(Y, 'z', idolize).
rule_effect(people_idolize_strong_individuals_and_are_interested_in_dating_their_crushes_who_also_hold, set_intent(X, candid, Y, 1)).

rule_likelihood(people_idolize_strong_individuals_and_develop_a_desire_to_honor_them, 1).
rule_type(people_idolize_strong_individuals_and_develop_a_desire_to_honor_them, volition).
% People idolize strong individuals and develop a desire to honor them.
rule_active(people_idolize_strong_individuals_and_develop_a_desire_to_honor_them).
rule_category(people_idolize_strong_individuals_and_develop_a_desire_to_honor_them, idolization_envy).
rule_source(people_idolize_strong_individuals_and_develop_a_desire_to_honor_them, ensemble).
rule_priority(people_idolize_strong_individuals_and_develop_a_desire_to_honor_them, 3).
rule_applies(people_idolize_strong_individuals_and_develop_a_desire_to_honor_them, X, Y) :-
    directed_status(X, Y, idolize).
rule_effect(people_idolize_strong_individuals_and_develop_a_desire_to_honor_them, set_intent(X, honor, Y, 3)).

rule_likelihood(people_envy_others_connections_with_strong_individuals_and_seek_to_form_similar_relationships, 1).
rule_type(people_envy_others_connections_with_strong_individuals_and_seek_to_form_similar_relationships, volition).
% People envy others’ connections with strong individuals and seek to form similar relationships.
rule_active(people_envy_others_connections_with_strong_individuals_and_seek_to_form_similar_relationships).
rule_category(people_envy_others_connections_with_strong_individuals_and_seek_to_form_similar_relationships, idolization_envy).
rule_source(people_envy_others_connections_with_strong_individuals_and_seek_to_form_similar_relationships, ensemble).
rule_priority(people_envy_others_connections_with_strong_individuals_and_seek_to_form_similar_relationships, 1).
rule_applies(people_envy_others_connections_with_strong_individuals_and_seek_to_form_similar_relationships, X, Y) :-
    directed_status(X, Y, envy).
rule_effect(people_envy_others_connections_with_strong_individuals_and_seek_to_form_similar_relationships, set_intent(X, honor, Y, -1)).

rule_likelihood(people_tend_to_idealize_those_they_are_attracted_to_or_wish_to_be_closer_to, 1).
rule_type(people_tend_to_idealize_those_they_are_attracted_to_or_wish_to_be_closer_to, volition).
% People tend to idealize those they are attracted to or wish to be closer to.
rule_active(people_tend_to_idealize_those_they_are_attracted_to_or_wish_to_be_closer_to).
rule_category(people_tend_to_idealize_those_they_are_attracted_to_or_wish_to_be_closer_to, idolization_envy).
rule_source(people_tend_to_idealize_those_they_are_attracted_to_or_wish_to_be_closer_to, ensemble).
rule_priority(people_tend_to_idealize_those_they_are_attracted_to_or_wish_to_be_closer_to, 1).
rule_applies(people_tend_to_idealize_those_they_are_attracted_to_or_wish_to_be_closer_to, X, Y) :-
    directed_status(X, Y, feuding).
rule_effect(people_tend_to_idealize_those_they_are_attracted_to_or_wish_to_be_closer_to, set_intent(X, idealize, Y, -1)).

rule_likelihood(people_idolizing_someone_increases_their_idealization_of_that_person, 1).
rule_type(people_idolizing_someone_increases_their_idealization_of_that_person, volition).
% People idolizing someone increases their idealization of that person.
rule_active(people_idolizing_someone_increases_their_idealization_of_that_person).
rule_category(people_idolizing_someone_increases_their_idealization_of_that_person, idolization_envy).
rule_source(people_idolizing_someone_increases_their_idealization_of_that_person, ensemble).
rule_priority(people_idolizing_someone_increases_their_idealization_of_that_person, 3).
rule_applies(people_idolizing_someone_increases_their_idealization_of_that_person, X, Y) :-
    directed_status(X, Y, idolize).
rule_effect(people_idolizing_someone_increases_their_idealization_of_that_person, set_intent(X, idealize, Y, 3)).

rule_likelihood(people_tend_to_idealize_those_they_fear, 1).
rule_type(people_tend_to_idealize_those_they_fear, volition).
% People tend to idealize those they fear.
rule_active(people_tend_to_idealize_those_they_fear).
rule_category(people_tend_to_idealize_those_they_fear, idolization_envy).
rule_source(people_tend_to_idealize_those_they_fear, ensemble).
rule_priority(people_tend_to_idealize_those_they_fear, 1).
rule_applies(people_tend_to_idealize_those_they_fear, X, Y) :-
    status(X, fearful).
rule_effect(people_tend_to_idealize_those_they_fear, set_intent(X, idealize, Y, -1)).

rule_likelihood(people_envy_and_idealize_strong_individuals, 1).
rule_type(people_envy_and_idealize_strong_individuals, volition).
% People envy and idealize strong individuals.
rule_active(people_envy_and_idealize_strong_individuals).
rule_category(people_envy_and_idealize_strong_individuals, idolization_envy).
rule_source(people_envy_and_idealize_strong_individuals, ensemble).
rule_priority(people_envy_and_idealize_strong_individuals, 1).
rule_applies(people_envy_and_idealize_strong_individuals, X, Y) :-
    directed_status(X, Y, envy).
rule_effect(people_envy_and_idealize_strong_individuals, set_intent(X, idealize, Y, -1)).

rule_likelihood(people_are_afraid_of_weak_individuals_and_idealize_strong_people, 1).
rule_type(people_are_afraid_of_weak_individuals_and_idealize_strong_people, volition).
% People are afraid of weak individuals and idealize strong people.
rule_active(people_are_afraid_of_weak_individuals_and_idealize_strong_people).
rule_category(people_are_afraid_of_weak_individuals_and_idealize_strong_people, idolization_envy).
rule_source(people_are_afraid_of_weak_individuals_and_idealize_strong_people, ensemble).
rule_priority(people_are_afraid_of_weak_individuals_and_idealize_strong_people, 1).
rule_applies(people_are_afraid_of_weak_individuals_and_idealize_strong_people, X, Y) :-
    directed_status(X, Y, afraid_of).
rule_effect(people_are_afraid_of_weak_individuals_and_idealize_strong_people, set_intent(X, idealize, Y, -1)).

rule_likelihood(people_tend_to_idealize_individuals_with_high_altruism_levels, 1).
rule_type(people_tend_to_idealize_individuals_with_high_altruism_levels, volition).
% People tend to idealize individuals with high altruism levels.
rule_active(people_tend_to_idealize_individuals_with_high_altruism_levels).
rule_category(people_tend_to_idealize_individuals_with_high_altruism_levels, idolization_envy).
rule_source(people_tend_to_idealize_individuals_with_high_altruism_levels, ensemble).
rule_priority(people_tend_to_idealize_individuals_with_high_altruism_levels, 1).
rule_applies(people_tend_to_idealize_individuals_with_high_altruism_levels, X, Y) :-
    attribute(X, altruism, Altruism_val), Altruism_val < 7.
rule_effect(people_tend_to_idealize_individuals_with_high_altruism_levels, set_intent(X, idealize, Y, -2)).

rule_likelihood(people_idealize_strong_individuals_when_their_altruism_level_exceeds_a_threshold, 1).
rule_type(people_idealize_strong_individuals_when_their_altruism_level_exceeds_a_threshold, volition).
% People idealize strong individuals when their altruism level exceeds a threshold.
rule_active(people_idealize_strong_individuals_when_their_altruism_level_exceeds_a_threshold).
rule_category(people_idealize_strong_individuals_when_their_altruism_level_exceeds_a_threshold, idolization_envy).
rule_source(people_idealize_strong_individuals_when_their_altruism_level_exceeds_a_threshold, ensemble).
rule_priority(people_idealize_strong_individuals_when_their_altruism_level_exceeds_a_threshold, 1).
rule_applies(people_idealize_strong_individuals_when_their_altruism_level_exceeds_a_threshold, X, Y) :-
    attribute(X, altruism, Altruism_val), Altruism_val > 12.
rule_effect(people_idealize_strong_individuals_when_their_altruism_level_exceeds_a_threshold, set_intent(X, idealize, Y, 2)).

rule_likelihood(people_idealizing_others_to_enhance_their_self_image, 1).
rule_type(people_idealizing_others_to_enhance_their_self_image, volition).
% People idealizing others to enhance their self-image.
rule_active(people_idealizing_others_to_enhance_their_self_image).
rule_category(people_idealizing_others_to_enhance_their_self_image, idolization_envy).
rule_source(people_idealizing_others_to_enhance_their_self_image, ensemble).
rule_priority(people_idealizing_others_to_enhance_their_self_image, 3).
rule_applies(people_idealizing_others_to_enhance_their_self_image, X, Y) :-
    trait(X, selfish).
rule_effect(people_idealizing_others_to_enhance_their_self_image, set_intent(X, idealize, Y, -3)).

rule_likelihood(people_idolizing_both_person_x_and_y_leads_to_an_increased_desire_for_dating_their_cr, 1).
rule_type(people_idolizing_both_person_x_and_y_leads_to_an_increased_desire_for_dating_their_cr, volition).
% People idolizing both person X and Y leads to an increased desire for dating their cr
rule_active(people_idolizing_both_person_x_and_y_leads_to_an_increased_desire_for_dating_their_cr).
rule_category(people_idolizing_both_person_x_and_y_leads_to_an_increased_desire_for_dating_their_cr, idolization_envy).
rule_source(people_idolizing_both_person_x_and_y_leads_to_an_increased_desire_for_dating_their_cr, ensemble).
rule_priority(people_idolizing_both_person_x_and_y_leads_to_an_increased_desire_for_dating_their_cr, 3).
rule_applies(people_idolizing_both_person_x_and_y_leads_to_an_increased_desire_for_dating_their_cr, X, Y) :-
    directed_status(X, 'z', idolize),
    directed_status(Y, 'z', idolize).
rule_effect(people_idolizing_both_person_x_and_y_leads_to_an_increased_desire_for_dating_their_cr, set_intent(X, idealize, Y, 3)).

rule_likelihood(people_idolize_strong_individuals_and_seek_to_ingratiate_themselves_with_them, 1).
rule_type(people_idolize_strong_individuals_and_seek_to_ingratiate_themselves_with_them, volition).
% People idolize strong individuals and seek to ingratiate themselves with them.
rule_active(people_idolize_strong_individuals_and_seek_to_ingratiate_themselves_with_them).
rule_category(people_idolize_strong_individuals_and_seek_to_ingratiate_themselves_with_them, idolization_envy).
rule_source(people_idolize_strong_individuals_and_seek_to_ingratiate_themselves_with_them, ensemble).
rule_priority(people_idolize_strong_individuals_and_seek_to_ingratiate_themselves_with_them, 3).
rule_applies(people_idolize_strong_individuals_and_seek_to_ingratiate_themselves_with_them, X, Y) :-
    directed_status(X, Y, idolize).
rule_effect(people_idolize_strong_individuals_and_seek_to_ingratiate_themselves_with_them, set_intent(X, ingratiate, Y, 3)).

rule_likelihood(people_idolize_and_seek_companionship_with_strong_individuals, 1).
rule_type(people_idolize_and_seek_companionship_with_strong_individuals, volition).
% People idolize and seek companionship with strong individuals.
rule_active(people_idolize_and_seek_companionship_with_strong_individuals).
rule_category(people_idolize_and_seek_companionship_with_strong_individuals, idolization_envy).
rule_source(people_idolize_and_seek_companionship_with_strong_individuals, ensemble).
rule_priority(people_idolize_and_seek_companionship_with_strong_individuals, 1).
rule_applies(people_idolize_and_seek_companionship_with_strong_individuals, X, Y) :-
    directed_status(X, Y, idolize).
rule_effect(people_idolize_and_seek_companionship_with_strong_individuals, set_intent(X, kind, Y, 2)).

rule_likelihood(people_envy_others_strong_connections_and_attempt_to_manipulate_their_social_standing, 1).
rule_type(people_envy_others_strong_connections_and_attempt_to_manipulate_their_social_standing, volition).
% People envy others’ strong connections and attempt to manipulate their social standing.
rule_active(people_envy_others_strong_connections_and_attempt_to_manipulate_their_social_standing).
rule_category(people_envy_others_strong_connections_and_attempt_to_manipulate_their_social_standing, idolization_envy).
rule_source(people_envy_others_strong_connections_and_attempt_to_manipulate_their_social_standing, ensemble).
rule_priority(people_envy_others_strong_connections_and_attempt_to_manipulate_their_social_standing, 1).
rule_applies(people_envy_others_strong_connections_and_attempt_to_manipulate_their_social_standing, X, Y) :-
    directed_status(X, Y, envy).
rule_effect(people_envy_others_strong_connections_and_attempt_to_manipulate_their_social_standing, set_intent(X, manipulate, Y, 1)).

rule_likelihood(people_idolize_strong_individuals_and_develop_trust_towards_them, 1).
rule_type(people_idolize_strong_individuals_and_develop_trust_towards_them, volition).
% People idolize strong individuals and develop trust towards them.
rule_active(people_idolize_strong_individuals_and_develop_trust_towards_them).
rule_category(people_idolize_strong_individuals_and_develop_trust_towards_them, idolization_envy).
rule_source(people_idolize_strong_individuals_and_develop_trust_towards_them, ensemble).
rule_priority(people_idolize_strong_individuals_and_develop_trust_towards_them, 1).
rule_applies(people_idolize_strong_individuals_and_develop_trust_towards_them, X, Y) :-
    directed_status(X, Y, idolize).
rule_effect(people_idolize_strong_individuals_and_develop_trust_towards_them, set_intent(X, trust, Y, 1)).




