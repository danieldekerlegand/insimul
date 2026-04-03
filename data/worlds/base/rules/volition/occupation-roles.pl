%% Ensemble Volition Rules: occupation-roles
%% Source: data/ensemble/volitionRules/occupation-roles.json
%% Converted: 2026-04-02T20:09:49.727Z
%% Total rules: 10

rule_likelihood(a_worker_does_not_appreciate_being_underpaid, 1).
rule_type(a_worker_does_not_appreciate_being_underpaid, volition).
% A worker does not appreciate being underpaid
rule_active(a_worker_does_not_appreciate_being_underpaid).
rule_category(a_worker_does_not_appreciate_being_underpaid, occupation_roles).
rule_source(a_worker_does_not_appreciate_being_underpaid, ensemble).
rule_priority(a_worker_does_not_appreciate_being_underpaid, 5).
rule_applies(a_worker_does_not_appreciate_being_underpaid, X, Y) :-
    \+ trait(X, generous),
    trait(X, rich),
    trait(Y, stagehand),
    directed_status(Y, X, offended_by).
rule_effect(a_worker_does_not_appreciate_being_underpaid, modify_network(Y, X, affinity, '+', 5)).

rule_likelihood(young_male_police_officers_tend_to_engage_with_criminals, 1).
rule_type(young_male_police_officers_tend_to_engage_with_criminals, volition).
% Young male police officers tend to engage with criminals
rule_active(young_male_police_officers_tend_to_engage_with_criminals).
rule_category(young_male_police_officers_tend_to_engage_with_criminals, occupation_roles).
rule_source(young_male_police_officers_tend_to_engage_with_criminals, ensemble).
rule_priority(young_male_police_officers_tend_to_engage_with_criminals, 5).
rule_applies(young_male_police_officers_tend_to_engage_with_criminals, X, Y) :-
    trait(X, male),
    trait(X, police_officer),
    trait(Y, female),
    trait(Y, criminal).
rule_effect(young_male_police_officers_tend_to_engage_with_criminals, modify_network(X, Y, affinity, '+', 5)).

rule_likelihood(a_chatty_merchant_can_disgust_sophisticated_people, 1).
rule_type(a_chatty_merchant_can_disgust_sophisticated_people, volition).
% A chatty merchant can disgust sophisticated people
rule_active(a_chatty_merchant_can_disgust_sophisticated_people).
rule_category(a_chatty_merchant_can_disgust_sophisticated_people, occupation_roles).
rule_source(a_chatty_merchant_can_disgust_sophisticated_people, ensemble).
rule_priority(a_chatty_merchant_can_disgust_sophisticated_people, 8).
rule_applies(a_chatty_merchant_can_disgust_sophisticated_people, X, Y) :-
    trait(X, merchant),
    trait(X, honest),
    attribute(X, propriety, Propriety_val), Propriety_val < 40,
    attribute(Y, sophistication, Sophistication_val), Sophistication_val > 60,
    trait(X, talkative).
rule_effect(a_chatty_merchant_can_disgust_sophisticated_people, set_relationship(Y, X, esteem, 10)).

rule_likelihood(a_servant_is_cooperative_when_he_is_well_paid_by_a_generous_benefactor, 1).
rule_type(a_servant_is_cooperative_when_he_is_well_paid_by_a_generous_benefactor, volition).
% A servant is cooperative when he is well paid by a generous benefactor
rule_active(a_servant_is_cooperative_when_he_is_well_paid_by_a_generous_benefactor).
rule_category(a_servant_is_cooperative_when_he_is_well_paid_by_a_generous_benefactor, occupation_roles).
rule_source(a_servant_is_cooperative_when_he_is_well_paid_by_a_generous_benefactor, ensemble).
rule_priority(a_servant_is_cooperative_when_he_is_well_paid_by_a_generous_benefactor, 5).
rule_applies(a_servant_is_cooperative_when_he_is_well_paid_by_a_generous_benefactor, X, Y) :-
    directed_status(X, Y, financially_dependent_on),
    trait(X, stagehand),
    trait(Y, rich),
    trait(Y, generous).
rule_effect(a_servant_is_cooperative_when_he_is_well_paid_by_a_generous_benefactor, modify_network(X, Y, affinity, '+', 5)).

rule_likelihood(a_worker_does_not_want_to_engage_with_upset_and_inappropriate_employers, 1).
rule_type(a_worker_does_not_want_to_engage_with_upset_and_inappropriate_employers, volition).
% A worker does not want to engage with upset and inappropriate employers
rule_active(a_worker_does_not_want_to_engage_with_upset_and_inappropriate_employers).
rule_category(a_worker_does_not_want_to_engage_with_upset_and_inappropriate_employers, occupation_roles).
rule_source(a_worker_does_not_want_to_engage_with_upset_and_inappropriate_employers, ensemble).
rule_priority(a_worker_does_not_want_to_engage_with_upset_and_inappropriate_employers, 5).
rule_applies(a_worker_does_not_want_to_engage_with_upset_and_inappropriate_employers, X, Y) :-
    attribute(X, propriety, Propriety_val), Propriety_val < 50,
    trait(X, rich),
    status(X, upset),
    directed_status(Y, X, financially_dependent_on),
    trait(Y, stagehand).
rule_effect(a_worker_does_not_want_to_engage_with_upset_and_inappropriate_employers, modify_network(Y, X, curiosity, '+', 5)).

rule_likelihood(coworkers_are_a_little_kind_to_one_another, 1).
rule_type(coworkers_are_a_little_kind_to_one_another, volition).
% Coworkers are a little kind to one another
rule_active(coworkers_are_a_little_kind_to_one_another).
rule_category(coworkers_are_a_little_kind_to_one_another, occupation_roles).
rule_source(coworkers_are_a_little_kind_to_one_another, ensemble).
rule_priority(coworkers_are_a_little_kind_to_one_another, 1).
rule_applies(coworkers_are_a_little_kind_to_one_another, X, Y) :-
    relationship(X, Y, coworker).
rule_effect(coworkers_are_a_little_kind_to_one_another, set_intent(X, kind, Y, 1)).

rule_likelihood(employees_on_break_want_to_be_left_alone, 1).
rule_type(employees_on_break_want_to_be_left_alone, volition).
% Employees on break want to be left alone
rule_active(employees_on_break_want_to_be_left_alone).
rule_category(employees_on_break_want_to_be_left_alone, occupation_roles).
rule_source(employees_on_break_want_to_be_left_alone, ensemble).
rule_priority(employees_on_break_want_to_be_left_alone, 5).
rule_applies(employees_on_break_want_to_be_left_alone, X, Y) :-
    status(X, on_break),
    trait(X, employee),
    \+ trait(Y, employee).
rule_effect(employees_on_break_want_to_be_left_alone, set_intent(X, kind, Y, -6)).

rule_likelihood(bosses_are_kind_to_their_punctual_employees, 1).
rule_type(bosses_are_kind_to_their_punctual_employees, volition).
% Bosses are kind to their punctual employees
rule_active(bosses_are_kind_to_their_punctual_employees).
rule_category(bosses_are_kind_to_their_punctual_employees, occupation_roles).
rule_source(bosses_are_kind_to_their_punctual_employees, ensemble).
rule_priority(bosses_are_kind_to_their_punctual_employees, 8).
rule_applies(bosses_are_kind_to_their_punctual_employees, X, Y) :-
    directed_status(X, Y, is_boss_of),
    trait(X, punctual).
rule_effect(bosses_are_kind_to_their_punctual_employees, set_intent(X, kind, Y, 10)).

rule_likelihood(people_are_a_little_less_rude_to_their_coworkers, 1).
rule_type(people_are_a_little_less_rude_to_their_coworkers, volition).
% People are a little less rude to their coworkers
rule_active(people_are_a_little_less_rude_to_their_coworkers).
rule_category(people_are_a_little_less_rude_to_their_coworkers, occupation_roles).
rule_source(people_are_a_little_less_rude_to_their_coworkers, ensemble).
rule_priority(people_are_a_little_less_rude_to_their_coworkers, 1).
rule_applies(people_are_a_little_less_rude_to_their_coworkers, X, Y) :-
    relationship(X, Y, coworker).
rule_effect(people_are_a_little_less_rude_to_their_coworkers, set_intent(X, rude, Y, -1)).

rule_likelihood(employees_are_more_rude_to_non_employees_when_they_are_on_break, 1).
rule_type(employees_are_more_rude_to_non_employees_when_they_are_on_break, volition).
% Employees are more rude to non-employees when they are on break
rule_active(employees_are_more_rude_to_non_employees_when_they_are_on_break).
rule_category(employees_are_more_rude_to_non_employees_when_they_are_on_break, occupation_roles).
rule_source(employees_are_more_rude_to_non_employees_when_they_are_on_break, ensemble).
rule_priority(employees_are_more_rude_to_non_employees_when_they_are_on_break, 1).
rule_applies(employees_are_more_rude_to_non_employees_when_they_are_on_break, X, Y) :-
    status(X, on_break),
    trait(X, employee),
    \+ trait(Y, employee).
rule_effect(employees_are_more_rude_to_non_employees_when_they_are_on_break, set_intent(X, rude, Y, 2)).

