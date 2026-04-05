%% Insimul Volition Rules: Victorian England
%% Source: data/worlds/victorian_england/rules.pl
%% Created: 2026-04-03
%% Total: 12 volition rules
%%
%% Predicate schema (Ensemble format):
%%   rule_likelihood/2, rule_type/2, rule_active/1
%%   rule_category/2, rule_source/2, rule_priority/2
%%   rule_applies/3, rule_effect/2

%% ─── Class Relations ───

%% Upper class members look down on those of lower social standing
rule_likelihood(upper_class_condescension, 2).
rule_type(upper_class_condescension, volition).
rule_active(upper_class_condescension).
rule_category(upper_class_condescension, social_hierarchy).
rule_source(upper_class_condescension, victorian_england).
rule_priority(upper_class_condescension, 4).
rule_applies(upper_class_condescension, X, Y) :-
    trait(X, aristocratic, true),
    attribute(Y, wealth, Wealth_val), Wealth_val < 30.
rule_effect(upper_class_condescension, set_intent(X, condescend, Y, 4)).

%% Working class people resent factory owners who exploit their labor
rule_likelihood(workers_resent_exploiters, 1).
rule_type(workers_resent_exploiters, volition).
rule_active(workers_resent_exploiters).
rule_category(workers_resent_exploiters, antagonism_hostility).
rule_source(workers_resent_exploiters, victorian_england).
rule_priority(workers_resent_exploiters, 5).
rule_applies(workers_resent_exploiters, X, Y) :-
    trait(X, working_class, true),
    status(Y, mill_owner),
    network(X, Y, trust, Trust_val), Trust_val < 4.
rule_effect(workers_resent_exploiters, set_intent(X, antagonize, Y, 5)).

%% Servants are loyal to masters who treat them with basic dignity
rule_likelihood(servant_loyalty_to_fair_master, 2).
rule_type(servant_loyalty_to_fair_master, volition).
rule_active(servant_loyalty_to_fair_master).
rule_category(servant_loyalty_to_fair_master, respect_authority).
rule_source(servant_loyalty_to_fair_master, victorian_england).
rule_priority(servant_loyalty_to_fair_master, 5).
rule_applies(servant_loyalty_to_fair_master, X, Y) :-
    trait(X, servant, true),
    relationship(X, Y, employer_employee),
    network(X, Y, trust, Trust_val), Trust_val > 5.
rule_effect(servant_loyalty_to_fair_master, set_intent(X, respect, Y, 5)).

%% ─── Social Climbing ───

%% Ambitious individuals seek to befriend those of higher social status
rule_likelihood(social_climbing_ambition, 2).
rule_type(social_climbing_ambition, volition).
rule_active(social_climbing_ambition).
rule_category(social_climbing_ambition, friendship_affinity).
rule_source(social_climbing_ambition, victorian_england).
rule_priority(social_climbing_ambition, 4).
rule_applies(social_climbing_ambition, X, Y) :-
    trait(X, ambitious, true),
    attribute(Y, social_influence, Influence_val), Influence_val > 70.
rule_effect(social_climbing_ambition, set_intent(X, befriend, Y, 4)).

%% Society matrons gatekeep access to the social elite
rule_likelihood(society_gatekeeping, 2).
rule_type(society_gatekeeping, volition).
rule_active(society_gatekeeping).
rule_category(society_gatekeeping, manipulation_influence).
rule_source(society_gatekeeping, victorian_england).
rule_priority(society_gatekeeping, 5).
rule_applies(society_gatekeeping, X, Y) :-
    status(X, society_hostess),
    trait(Y, unconventional, true),
    network(X, Y, trust, Trust_val), Trust_val < 5.
rule_effect(society_gatekeeping, set_intent(X, exclude, Y, 5)).

%% ─── Reform and Compassion ───

%% Compassionate individuals advocate for the welfare of the poor
rule_likelihood(compassion_for_poor, 1).
rule_type(compassion_for_poor, volition).
rule_active(compassion_for_poor).
rule_category(compassion_for_poor, protection_loyalty).
rule_source(compassion_for_poor, victorian_england).
rule_priority(compassion_for_poor, 4).
rule_applies(compassion_for_poor, X, _Y) :-
    trait(X, compassionate, true),
    attribute(X, empathy, Emp_val), Emp_val > 60.
rule_effect(compassion_for_poor, set_intent(X, protect, Y, 4)).

%% Reformers build alliances with like-minded individuals
rule_likelihood(reformer_solidarity, 2).
rule_type(reformer_solidarity, volition).
rule_active(reformer_solidarity).
rule_category(reformer_solidarity, friendship_affinity).
rule_source(reformer_solidarity, victorian_england).
rule_priority(reformer_solidarity, 5).
rule_applies(reformer_solidarity, X, Y) :-
    trait(X, reform_minded, true),
    trait(Y, reform_minded, true),
    X \= Y.
rule_effect(reformer_solidarity, set_intent(X, befriend, Y, 5)).

%% ─── Business and Commerce ───

%% Business partners build trust through profitable dealings
rule_likelihood(business_trust_through_profit, 2).
rule_type(business_trust_through_profit, volition).
rule_active(business_trust_through_profit).
rule_category(business_trust_through_profit, trust_gratitude).
rule_source(business_trust_through_profit, victorian_england).
rule_priority(business_trust_through_profit, 5).
rule_applies(business_trust_through_profit, X, Y) :-
    relationship(X, Y, business_partner),
    network(X, Y, profit, Profit_val), Profit_val > 5.
rule_effect(business_trust_through_profit, set_intent(X, trust, Y, 5)).

%% Competitors in the same industry undermine each other
rule_likelihood(industrial_rivalry, 1).
rule_type(industrial_rivalry, volition).
rule_active(industrial_rivalry).
rule_category(industrial_rivalry, antagonism_hostility).
rule_source(industrial_rivalry, victorian_england).
rule_priority(industrial_rivalry, 4).
rule_applies(industrial_rivalry, X, Y) :-
    status(X, mill_owner),
    status(Y, mill_owner),
    X \= Y,
    network(X, Y, rivalry, Rival_val), Rival_val > 4.
rule_effect(industrial_rivalry, set_intent(X, antagonize, Y, 4)).

%% ─── Scandal and Reputation ───

%% People gossip about those involved in scandalous behavior
rule_likelihood(scandal_gossip, 3).
rule_type(scandal_gossip, volition).
rule_active(scandal_gossip).
rule_category(scandal_gossip, social_pressure).
rule_source(scandal_gossip, victorian_england).
rule_priority(scandal_gossip, 3).
rule_applies(scandal_gossip, X, Y) :-
    status(Y, scandalized),
    attribute(X, propriety, Prop_val), Prop_val > 60.
rule_effect(scandal_gossip, set_intent(X, ostracize, Y, 3)).

%% Those publicly shamed seek to restore their reputation
rule_likelihood(reputation_restoration, 1).
rule_type(reputation_restoration, volition).
rule_active(reputation_restoration).
rule_category(reputation_restoration, self_preservation).
rule_source(reputation_restoration, victorian_england).
rule_priority(reputation_restoration, 6).
rule_applies(reputation_restoration, X, Y) :-
    status(X, scandalized),
    attribute(Y, social_influence, Infl_val), Infl_val > 60.
rule_effect(reputation_restoration, set_intent(X, ingratiate, Y, 6)).

%% Pub patrons build camaraderie over shared drinks
rule_likelihood(pub_camaraderie, 3).
rule_type(pub_camaraderie, volition).
rule_active(pub_camaraderie).
rule_category(pub_camaraderie, friendship_affinity).
rule_source(pub_camaraderie, victorian_england).
rule_priority(pub_camaraderie, 3).
rule_applies(pub_camaraderie, X, Y) :-
    at_location(X, Loc),
    at_location(Y, Loc),
    building(Loc, business, pub),
    X \= Y.
rule_effect(pub_camaraderie, set_intent(X, befriend, Y, 3)).
