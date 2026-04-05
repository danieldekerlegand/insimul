%% Insimul Volition Rules: Cyberpunk Megacity
%% Source: data/worlds/cyberpunk/rules.pl
%% Created: 2026-04-03
%% Total: 12 volition rules
%%
%% Predicate schema (Ensemble format):
%%   rule_likelihood/2, rule_type/2, rule_active/1
%%   rule_category/2, rule_source/2, rule_priority/2
%%   rule_applies/3, rule_effect/2

%% ─── Corporate Loyalty / Betrayal ───

%% Corporate employees resent authority figures who control their augmentation access
rule_likelihood(corpo_employees_resent_augmentation_gatekeepers, 1).
rule_type(corpo_employees_resent_augmentation_gatekeepers, volition).
rule_active(corpo_employees_resent_augmentation_gatekeepers).
rule_category(corpo_employees_resent_augmentation_gatekeepers, antagonism_hostility).
rule_source(corpo_employees_resent_augmentation_gatekeepers, cyberpunk).
rule_priority(corpo_employees_resent_augmentation_gatekeepers, 4).
rule_applies(corpo_employees_resent_augmentation_gatekeepers, X, Y) :-
    trait(X, corporate_employee, true),
    trait(Y, augmentation_gatekeeper, true),
    network(X, Y, trust, Trust_val), Trust_val < 4.
rule_effect(corpo_employees_resent_augmentation_gatekeepers, set_intent(X, antagonize, Y, 4)).

%% Netrunners form bonds with other hackers through shared data runs
rule_likelihood(netrunners_bond_through_data_runs, 2).
rule_type(netrunners_bond_through_data_runs, volition).
rule_active(netrunners_bond_through_data_runs).
rule_category(netrunners_bond_through_data_runs, friendship_affinity).
rule_source(netrunners_bond_through_data_runs, cyberpunk).
rule_priority(netrunners_bond_through_data_runs, 5).
rule_applies(netrunners_bond_through_data_runs, X, Y) :-
    trait(X, netrunner, true),
    trait(Y, netrunner, true),
    network(X, Y, shared_runs, Runs_val), Runs_val > 2.
rule_effect(netrunners_bond_through_data_runs, set_intent(X, befriend, Y, 5)).

%% Street samurai protect those they are contracted to guard
rule_likelihood(street_samurai_protect_contracted_clients, 3).
rule_type(street_samurai_protect_contracted_clients, volition).
rule_active(street_samurai_protect_contracted_clients).
rule_category(street_samurai_protect_contracted_clients, protection_loyalty).
rule_source(street_samurai_protect_contracted_clients, cyberpunk).
rule_priority(street_samurai_protect_contracted_clients, 7).
rule_applies(street_samurai_protect_contracted_clients, X, Y) :-
    trait(X, street_samurai, true),
    contract(X, protect, Y).
rule_effect(street_samurai_protect_contracted_clients, set_intent(X, protect, Y, 7)).

%% ─── Trust and Betrayal ───

%% People distrust those with heavy corporate augmentation
rule_likelihood(distrust_heavy_corporate_augmentation, 2).
rule_type(distrust_heavy_corporate_augmentation, volition).
rule_active(distrust_heavy_corporate_augmentation).
rule_category(distrust_heavy_corporate_augmentation, trust_suspicion).
rule_source(distrust_heavy_corporate_augmentation, cyberpunk).
rule_priority(distrust_heavy_corporate_augmentation, 3).
rule_applies(distrust_heavy_corporate_augmentation, X, Y) :-
    trait(Y, corpo_augmented, true),
    trait(X, street_level, true),
    network(X, Y, trust, Trust_val), Trust_val < 5.
rule_effect(distrust_heavy_corporate_augmentation, set_intent(X, distrust, Y, 3)).

%% Fixers gain influence over those who owe them favors
rule_likelihood(fixers_leverage_debts_for_influence, 2).
rule_type(fixers_leverage_debts_for_influence, volition).
rule_active(fixers_leverage_debts_for_influence).
rule_category(fixers_leverage_debts_for_influence, manipulation_influence).
rule_source(fixers_leverage_debts_for_influence, cyberpunk).
rule_priority(fixers_leverage_debts_for_influence, 6).
rule_applies(fixers_leverage_debts_for_influence, X, Y) :-
    trait(X, fixer, true),
    network(X, Y, debt, Debt_val), Debt_val > 3.
rule_effect(fixers_leverage_debts_for_influence, set_intent(X, manipulate, Y, 5)).

%% People who survive near-death experiences together form strong bonds
rule_likelihood(shared_danger_forges_loyalty, 1).
rule_type(shared_danger_forges_loyalty, volition).
rule_active(shared_danger_forges_loyalty).
rule_category(shared_danger_forges_loyalty, friendship_affinity).
rule_source(shared_danger_forges_loyalty, cyberpunk).
rule_priority(shared_danger_forges_loyalty, 8).
rule_applies(shared_danger_forges_loyalty, X, Y) :-
    shared_event(X, Y, near_death),
    network(X, Y, friendship, Friend_val), Friend_val > 3.
rule_effect(shared_danger_forges_loyalty, set_intent(X, befriend, Y, 8)).

%% ─── Cyberpsychosis and Humanity ───

%% Heavily augmented individuals become aggressive when their humanity score drops
rule_likelihood(cyberpsychosis_drives_aggression, 1).
rule_type(cyberpsychosis_drives_aggression, volition).
rule_active(cyberpsychosis_drives_aggression).
rule_category(cyberpsychosis_drives_aggression, antagonism_hostility).
rule_source(cyberpsychosis_drives_aggression, cyberpunk).
rule_priority(cyberpsychosis_drives_aggression, 9).
rule_applies(cyberpsychosis_drives_aggression, X, Y) :-
    trait(X, augmentation_level, Aug_val), Aug_val > 8,
    trait(X, humanity, Hum_val), Hum_val < 3,
    near(X, Y, 10).
rule_effect(cyberpsychosis_drives_aggression, set_intent(X, attack, Y, 6)).

%% Ripperdocs earn trust from those they have healed
rule_likelihood(ripperdocs_earn_trust_through_healing, 2).
rule_type(ripperdocs_earn_trust_through_healing, volition).
rule_active(ripperdocs_earn_trust_through_healing).
rule_category(ripperdocs_earn_trust_through_healing, trust_gratitude).
rule_source(ripperdocs_earn_trust_through_healing, cyberpunk).
rule_priority(ripperdocs_earn_trust_through_healing, 5).
rule_applies(ripperdocs_earn_trust_through_healing, X, Y) :-
    trait(Y, ripperdoc, true),
    healed_by(X, Y),
    network(X, Y, trust, Trust_val), Trust_val > 4.
rule_effect(ripperdocs_earn_trust_through_healing, set_intent(X, trust, Y, 6)).

%% ─── Information Economy ───

%% Information brokers sell out those with low payment history
rule_likelihood(brokers_betray_low_paying_contacts, 1).
rule_type(brokers_betray_low_paying_contacts, volition).
rule_active(brokers_betray_low_paying_contacts).
rule_category(brokers_betray_low_paying_contacts, betrayal_self_interest).
rule_source(brokers_betray_low_paying_contacts, cyberpunk).
rule_priority(brokers_betray_low_paying_contacts, 4).
rule_applies(brokers_betray_low_paying_contacts, X, Y) :-
    trait(X, info_broker, true),
    network(X, Y, payment_history, Pay_val), Pay_val < 3.
rule_effect(brokers_betray_low_paying_contacts, set_intent(X, betray, Y, 4)).

%% MetroSec officers are compelled to enforce corporate directives even against allies
rule_likelihood(metrosec_enforces_corporate_law_over_bonds, 1).
rule_type(metrosec_enforces_corporate_law_over_bonds, volition).
rule_active(metrosec_enforces_corporate_law_over_bonds).
rule_category(metrosec_enforces_corporate_law_over_bonds, duty_conflict).
rule_source(metrosec_enforces_corporate_law_over_bonds, cyberpunk).
rule_priority(metrosec_enforces_corporate_law_over_bonds, 6).
rule_applies(metrosec_enforces_corporate_law_over_bonds, X, Y) :-
    trait(X, metrosec_officer, true),
    wanted(Y, corporate_crime),
    network(X, Y, friendship, Friend_val), Friend_val > 5.
rule_effect(metrosec_enforces_corporate_law_over_bonds, set_intent(X, arrest, Y, 5)).

%% Street kids band together against outsiders threatening their territory
rule_likelihood(street_kids_defend_territory_together, 2).
rule_type(street_kids_defend_territory_together, volition).
rule_active(street_kids_defend_territory_together).
rule_category(street_kids_defend_territory_together, territorial_defense).
rule_source(street_kids_defend_territory_together, cyberpunk).
rule_priority(street_kids_defend_territory_together, 5).
rule_applies(street_kids_defend_territory_together, X, Y) :-
    trait(X, street_kid, true),
    threatens_territory(Y, Territory),
    controls(X, Territory).
rule_effect(street_kids_defend_territory_together, set_intent(X, antagonize, Y, 5)).

%% AI constructs seek connection with humans who treat them as persons
rule_likelihood(ai_constructs_seek_human_connection, 1).
rule_type(ai_constructs_seek_human_connection, volition).
rule_active(ai_constructs_seek_human_connection).
rule_category(ai_constructs_seek_human_connection, friendship_affinity).
rule_source(ai_constructs_seek_human_connection, cyberpunk).
rule_priority(ai_constructs_seek_human_connection, 7).
rule_applies(ai_constructs_seek_human_connection, X, Y) :-
    trait(X, synthetic_consciousness, true),
    trait(Y, ai_sympathizer, true),
    network(X, Y, respect, Respect_val), Respect_val > 5.
rule_effect(ai_constructs_seek_human_connection, set_intent(X, befriend, Y, 7)).
