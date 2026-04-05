%% Insimul Rules: Horror World
%% Source: data/worlds/horror/rules.pl
%% Created: 2026-04-03
%% Total: 12 rules
%%
%% Predicate schema (ensemble volition style):
%%   rule_likelihood/2, rule_type/2, rule_active/1
%%   rule_category/2, rule_source/2, rule_priority/2
%%   rule_applies/3, rule_effect/2

%% --- Sanity Drain ---
rule_likelihood(witnessing_supernatural_events_erodes_mental_stability, 3).
rule_type(witnessing_supernatural_events_erodes_mental_stability, volition).
%% Witnessing supernatural events erodes mental stability.
rule_active(witnessing_supernatural_events_erodes_mental_stability).
rule_category(witnessing_supernatural_events_erodes_mental_stability, sanity).
rule_source(witnessing_supernatural_events_erodes_mental_stability, horror).
rule_priority(witnessing_supernatural_events_erodes_mental_stability, 9).
rule_applies(witnessing_supernatural_events_erodes_mental_stability, X, _Y) :-
    attribute(X, sanity, S), S > 20,
    attribute(X, sensitiveness, Sens), Sens > 60.
rule_effect(witnessing_supernatural_events_erodes_mental_stability, modify_attribute(X, sanity, -5)).

%% --- Fear of the Dark ---
rule_likelihood(people_avoid_unlit_areas_after_nightfall, 3).
rule_type(people_avoid_unlit_areas_after_nightfall, volition).
%% People avoid unlit areas after nightfall.
rule_active(people_avoid_unlit_areas_after_nightfall).
rule_category(people_avoid_unlit_areas_after_nightfall, survival).
rule_source(people_avoid_unlit_areas_after_nightfall, horror).
rule_priority(people_avoid_unlit_areas_after_nightfall, 8).
rule_applies(people_avoid_unlit_areas_after_nightfall, X, _Y) :-
    attribute(X, sanity, S), S > 30.
rule_effect(people_avoid_unlit_areas_after_nightfall, set_intent(X, seek_light, any, 3)).

%% --- Cult Recruitment ---
rule_likelihood(the_cult_targets_vulnerable_and_isolated_individuals_for_recruitment, 2).
rule_type(the_cult_targets_vulnerable_and_isolated_individuals_for_recruitment, volition).
%% The cult targets vulnerable and isolated individuals for recruitment.
rule_active(the_cult_targets_vulnerable_and_isolated_individuals_for_recruitment).
rule_category(the_cult_targets_vulnerable_and_isolated_individuals_for_recruitment, cult).
rule_source(the_cult_targets_vulnerable_and_isolated_individuals_for_recruitment, horror).
rule_priority(the_cult_targets_vulnerable_and_isolated_individuals_for_recruitment, 7).
rule_applies(the_cult_targets_vulnerable_and_isolated_individuals_for_recruitment, X, Y) :-
    status(X, cult_leader),
    attribute(Y, sanity, S), S < 50.
rule_effect(the_cult_targets_vulnerable_and_isolated_individuals_for_recruitment, set_intent(X, recruit, Y, 2)).

%% --- Protective Instinct ---
rule_likelihood(parents_protect_children_from_supernatural_threats_at_all_costs, 3).
rule_type(parents_protect_children_from_supernatural_threats_at_all_costs, volition).
%% Parents protect children from supernatural threats at all costs.
rule_active(parents_protect_children_from_supernatural_threats_at_all_costs).
rule_category(parents_protect_children_from_supernatural_threats_at_all_costs, family).
rule_source(parents_protect_children_from_supernatural_threats_at_all_costs, horror).
rule_priority(parents_protect_children_from_supernatural_threats_at_all_costs, 9).
rule_applies(parents_protect_children_from_supernatural_threats_at_all_costs, X, Y) :-
    trait(X, protective),
    generation(Y, 1).
rule_effect(parents_protect_children_from_supernatural_threats_at_all_costs, set_intent(X, protect, Y, 3)).

%% --- Silence Pact ---
rule_likelihood(townsfolk_refuse_to_discuss_disappearances_with_outsiders, 3).
rule_type(townsfolk_refuse_to_discuss_disappearances_with_outsiders, volition).
%% Townsfolk refuse to discuss disappearances with outsiders.
rule_active(townsfolk_refuse_to_discuss_disappearances_with_outsiders).
rule_category(townsfolk_refuse_to_discuss_disappearances_with_outsiders, secrecy).
rule_source(townsfolk_refuse_to_discuss_disappearances_with_outsiders, horror).
rule_priority(townsfolk_refuse_to_discuss_disappearances_with_outsiders, 7).
rule_applies(townsfolk_refuse_to_discuss_disappearances_with_outsiders, X, Y) :-
    location(X, ravenhollow),
    status(Y, Status), member(Status, [journalist, researcher]).
rule_effect(townsfolk_refuse_to_discuss_disappearances_with_outsiders, set_intent(X, stonewall, Y, 3)).

%% --- Investigative Compulsion ---
rule_likelihood(investigators_feel_compelled_to_uncover_the_truth_despite_danger, 2).
rule_type(investigators_feel_compelled_to_uncover_the_truth_despite_danger, volition).
%% Investigators feel compelled to uncover the truth despite danger.
rule_active(investigators_feel_compelled_to_uncover_the_truth_despite_danger).
rule_category(investigators_feel_compelled_to_uncover_the_truth_despite_danger, investigation).
rule_source(investigators_feel_compelled_to_uncover_the_truth_despite_danger, horror).
rule_priority(investigators_feel_compelled_to_uncover_the_truth_despite_danger, 6).
rule_applies(investigators_feel_compelled_to_uncover_the_truth_despite_danger, X, _Y) :-
    status(X, Status), member(Status, [journalist, researcher, sheriff]),
    trait(X, determined).
rule_effect(investigators_feel_compelled_to_uncover_the_truth_despite_danger, set_intent(X, investigate, unknown, 2)).

%% --- Occult Obsession ---
rule_likelihood(those_who_study_the_occult_become_increasingly_obsessed, 2).
rule_type(those_who_study_the_occult_become_increasingly_obsessed, volition).
%% Those who study the occult become increasingly obsessed.
rule_active(those_who_study_the_occult_become_increasingly_obsessed).
rule_category(those_who_study_the_occult_become_increasingly_obsessed, sanity).
rule_source(those_who_study_the_occult_become_increasingly_obsessed, horror).
rule_priority(those_who_study_the_occult_become_increasingly_obsessed, 7).
rule_applies(those_who_study_the_occult_become_increasingly_obsessed, X, _Y) :-
    trait(X, occultist),
    attribute(X, sanity, S), S < 50.
rule_effect(those_who_study_the_occult_become_increasingly_obsessed, set_intent(X, study_forbidden, any, 2)).

%% --- Defiance Against Family ---
rule_likelihood(children_of_cult_families_sometimes_rebel_against_the_dark_legacy, 1).
rule_type(children_of_cult_families_sometimes_rebel_against_the_dark_legacy, volition).
%% Children of cult families sometimes rebel against the dark legacy.
rule_active(children_of_cult_families_sometimes_rebel_against_the_dark_legacy).
rule_category(children_of_cult_families_sometimes_rebel_against_the_dark_legacy, family).
rule_source(children_of_cult_families_sometimes_rebel_against_the_dark_legacy, horror).
rule_priority(children_of_cult_families_sometimes_rebel_against_the_dark_legacy, 5).
rule_applies(children_of_cult_families_sometimes_rebel_against_the_dark_legacy, X, Y) :-
    trait(X, defiant),
    relationship(X, Y, fears),
    status(Y, cult_leader).
rule_effect(children_of_cult_families_sometimes_rebel_against_the_dark_legacy, set_intent(X, betray, Y, 1)).

%% --- Holy Protection ---
rule_likelihood(the_faithful_gain_resistance_to_supernatural_influence, 2).
rule_type(the_faithful_gain_resistance_to_supernatural_influence, volition).
%% The faithful gain resistance to supernatural influence.
rule_active(the_faithful_gain_resistance_to_supernatural_influence).
rule_category(the_faithful_gain_resistance_to_supernatural_influence, faith).
rule_source(the_faithful_gain_resistance_to_supernatural_influence, horror).
rule_priority(the_faithful_gain_resistance_to_supernatural_influence, 6).
rule_applies(the_faithful_gain_resistance_to_supernatural_influence, X, _Y) :-
    trait(X, devout),
    status(X, priest).
rule_effect(the_faithful_gain_resistance_to_supernatural_influence, modify_attribute(X, sanity, 3)).

%% --- Desperate Alliance ---
rule_likelihood(survivors_form_bonds_when_facing_shared_supernatural_threats, 2).
rule_type(survivors_form_bonds_when_facing_shared_supernatural_threats, volition).
%% Survivors form bonds when facing shared supernatural threats.
rule_active(survivors_form_bonds_when_facing_shared_supernatural_threats).
rule_category(survivors_form_bonds_when_facing_shared_supernatural_threats, survival).
rule_source(survivors_form_bonds_when_facing_shared_supernatural_threats, horror).
rule_priority(survivors_form_bonds_when_facing_shared_supernatural_threats, 6).
rule_applies(survivors_form_bonds_when_facing_shared_supernatural_threats, X, Y) :-
    attribute(X, sanity, SX), SX < 60,
    attribute(Y, sanity, SY), SY < 60.
rule_effect(survivors_form_bonds_when_facing_shared_supernatural_threats, set_intent(X, ally_with, Y, 2)).

%% --- Paranoid Isolation ---
rule_likelihood(low_sanity_individuals_become_paranoid_and_withdraw_from_others, 2).
rule_type(low_sanity_individuals_become_paranoid_and_withdraw_from_others, volition).
%% Low sanity individuals become paranoid and withdraw from others.
rule_active(low_sanity_individuals_become_paranoid_and_withdraw_from_others).
rule_category(low_sanity_individuals_become_paranoid_and_withdraw_from_others, sanity).
rule_source(low_sanity_individuals_become_paranoid_and_withdraw_from_others, horror).
rule_priority(low_sanity_individuals_become_paranoid_and_withdraw_from_others, 7).
rule_applies(low_sanity_individuals_become_paranoid_and_withdraw_from_others, X, Y) :-
    attribute(X, sanity, S), S < 35,
    X \= Y.
rule_effect(low_sanity_individuals_become_paranoid_and_withdraw_from_others, set_intent(X, avoid, Y, 2)).

%% --- Knowledge Keeper ---
rule_likelihood(those_with_forbidden_knowledge_guard_it_from_the_unworthy, 2).
rule_type(those_with_forbidden_knowledge_guard_it_from_the_unworthy, volition).
%% Those with forbidden knowledge guard it from the unworthy.
rule_active(those_with_forbidden_knowledge_guard_it_from_the_unworthy).
rule_category(those_with_forbidden_knowledge_guard_it_from_the_unworthy, secrecy).
rule_source(those_with_forbidden_knowledge_guard_it_from_the_unworthy, horror).
rule_priority(those_with_forbidden_knowledge_guard_it_from_the_unworthy, 5).
rule_applies(those_with_forbidden_knowledge_guard_it_from_the_unworthy, X, Y) :-
    trait(X, knowledgeable),
    status(Y, Status), member(Status, [journalist, researcher]).
rule_effect(those_with_forbidden_knowledge_guard_it_from_the_unworthy, set_intent(X, withhold_info, Y, 2)).
