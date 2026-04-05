%% Insimul Rules: Renaissance City-States
%% Source: data/worlds/historical_renaissance/rules.pl
%% Created: 2026-04-03
%% Total: 12 rules
%%
%% Predicate schema (ensemble volition format):
%%   rule_likelihood/2, rule_type/2, rule_active/1
%%   rule_category/2, rule_source/2, rule_priority/2
%%   rule_applies/3, rule_effect/2

%% Patrons favor artists who bring them prestige
rule_likelihood(patrons_favor_artists_who_bring_prestige, 2).
rule_type(patrons_favor_artists_who_bring_prestige, volition).
%% Patrons favor artists who bring them prestige and public honor.
rule_active(patrons_favor_artists_who_bring_prestige).
rule_category(patrons_favor_artists_who_bring_prestige, patronage).
rule_source(patrons_favor_artists_who_bring_prestige, ensemble).
rule_priority(patrons_favor_artists_who_bring_prestige, 5).
rule_applies(patrons_favor_artists_who_bring_prestige, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val > 6.
rule_effect(patrons_favor_artists_who_bring_prestige, set_intent(X, befriend, Y, 5)).

%% Rival merchant houses undercut each others trade routes
rule_likelihood(rival_merchant_houses_undercut_trade_routes, 1).
rule_type(rival_merchant_houses_undercut_trade_routes, volition).
%% Rival merchant houses undercut each others trade routes for dominance.
rule_active(rival_merchant_houses_undercut_trade_routes).
rule_category(rival_merchant_houses_undercut_trade_routes, trade_rivalry).
rule_source(rival_merchant_houses_undercut_trade_routes, ensemble).
rule_priority(rival_merchant_houses_undercut_trade_routes, 4).
rule_applies(rival_merchant_houses_undercut_trade_routes, X, Y) :-
    network(X, Y, antagonism, Antagonism_val), Antagonism_val > 5.
rule_effect(rival_merchant_houses_undercut_trade_routes, set_intent(X, antagonize, Y, 4)).

%% Scholars bond over shared study of ancient texts
rule_likelihood(scholars_bond_over_shared_study_of_classics, 2).
rule_type(scholars_bond_over_shared_study_of_classics, volition).
%% Scholars bond over shared study of ancient texts and philosophy.
rule_active(scholars_bond_over_shared_study_of_classics).
rule_category(scholars_bond_over_shared_study_of_classics, intellectual_fellowship).
rule_source(scholars_bond_over_shared_study_of_classics, ensemble).
rule_priority(scholars_bond_over_shared_study_of_classics, 4).
rule_applies(scholars_bond_over_shared_study_of_classics, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val > 5.
rule_effect(scholars_bond_over_shared_study_of_classics, set_intent(X, befriend, Y, 4)).

%% Reformist preachers condemn those who display vanity
rule_likelihood(reformist_preachers_condemn_vanity, 1).
rule_type(reformist_preachers_condemn_vanity, volition).
%% Reformist preachers condemn those who display vanity and excess wealth.
rule_active(reformist_preachers_condemn_vanity).
rule_category(reformist_preachers_condemn_vanity, religious_reform).
rule_source(reformist_preachers_condemn_vanity, ensemble).
rule_priority(reformist_preachers_condemn_vanity, 4).
rule_applies(reformist_preachers_condemn_vanity, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val < 4.
rule_effect(reformist_preachers_condemn_vanity, set_intent(X, antagonize, Y, 4)).

%% Artists compete fiercely for prestigious commissions
rule_likelihood(artists_compete_fiercely_for_commissions, 1).
rule_type(artists_compete_fiercely_for_commissions, volition).
%% Artists compete fiercely for prestigious commissions from wealthy patrons.
rule_active(artists_compete_fiercely_for_commissions).
rule_category(artists_compete_fiercely_for_commissions, artistic_rivalry).
rule_source(artists_compete_fiercely_for_commissions, ensemble).
rule_priority(artists_compete_fiercely_for_commissions, 3).
rule_applies(artists_compete_fiercely_for_commissions, X, Y) :-
    network(X, Y, antagonism, Antagonism_val), Antagonism_val > 4.
rule_effect(artists_compete_fiercely_for_commissions, set_intent(X, antagonize, Y, 3)).

%% Bankers cultivate political allies through loans and favors
rule_likelihood(bankers_cultivate_political_allies_through_loans, 2).
rule_type(bankers_cultivate_political_allies_through_loans, volition).
%% Bankers cultivate political allies through loans and strategic favors.
rule_active(bankers_cultivate_political_allies_through_loans).
rule_category(bankers_cultivate_political_allies_through_loans, financial_politics).
rule_source(bankers_cultivate_political_allies_through_loans, ensemble).
rule_priority(bankers_cultivate_political_allies_through_loans, 5).
rule_applies(bankers_cultivate_political_allies_through_loans, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val > 6.
rule_effect(bankers_cultivate_political_allies_through_loans, set_intent(X, befriend, Y, 5)).

%% Diplomats distrust envoys who serve rival city-states
rule_likelihood(diplomats_distrust_envoys_from_rival_states, 1).
rule_type(diplomats_distrust_envoys_from_rival_states, volition).
%% Diplomats distrust envoys who serve rival city-states and their interests.
rule_active(diplomats_distrust_envoys_from_rival_states).
rule_category(diplomats_distrust_envoys_from_rival_states, diplomatic_suspicion).
rule_source(diplomats_distrust_envoys_from_rival_states, ensemble).
rule_priority(diplomats_distrust_envoys_from_rival_states, 3).
rule_applies(diplomats_distrust_envoys_from_rival_states, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val < 4.
rule_effect(diplomats_distrust_envoys_from_rival_states, set_intent(X, antagonize, Y, 3)).

%% Apprentices admire masters who teach generously
rule_likelihood(apprentices_admire_masters_who_teach_generously, 2).
rule_type(apprentices_admire_masters_who_teach_generously, volition).
%% Apprentices admire masters who teach generously and share techniques.
rule_active(apprentices_admire_masters_who_teach_generously).
rule_category(apprentices_admire_masters_who_teach_generously, craft_mentorship).
rule_source(apprentices_admire_masters_who_teach_generously, ensemble).
rule_priority(apprentices_admire_masters_who_teach_generously, 4).
rule_applies(apprentices_admire_masters_who_teach_generously, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val > 7.
rule_effect(apprentices_admire_masters_who_teach_generously, set_intent(X, befriend, Y, 4)).

%% Ship captains bond with merchants who pay fairly
rule_likelihood(captains_bond_with_merchants_who_pay_fairly, 2).
rule_type(captains_bond_with_merchants_who_pay_fairly, volition).
%% Ship captains bond with merchants who pay fairly and share risk.
rule_active(captains_bond_with_merchants_who_pay_fairly).
rule_category(captains_bond_with_merchants_who_pay_fairly, maritime_trust).
rule_source(captains_bond_with_merchants_who_pay_fairly, ensemble).
rule_priority(captains_bond_with_merchants_who_pay_fairly, 3).
rule_applies(captains_bond_with_merchants_who_pay_fairly, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val > 5.
rule_effect(captains_bond_with_merchants_who_pay_fairly, set_intent(X, befriend, Y, 3)).

%% Noble families plot against those who threaten their influence
rule_likelihood(noble_families_plot_against_threats, 1).
rule_type(noble_families_plot_against_threats, volition).
%% Noble families plot against those who threaten their influence and standing.
rule_active(noble_families_plot_against_threats).
rule_category(noble_families_plot_against_threats, political_conspiracy).
rule_source(noble_families_plot_against_threats, ensemble).
rule_priority(noble_families_plot_against_threats, 5).
rule_applies(noble_families_plot_against_threats, X, Y) :-
    network(X, Y, antagonism, Antagonism_val), Antagonism_val > 6.
rule_effect(noble_families_plot_against_threats, set_intent(X, antagonize, Y, 5)).

%% Nuns protect women who seek refuge from forced marriage
rule_likelihood(nuns_protect_women_seeking_refuge, 2).
rule_type(nuns_protect_women_seeking_refuge, volition).
%% Nuns protect women who seek refuge from forced marriage and violence.
rule_active(nuns_protect_women_seeking_refuge).
rule_category(nuns_protect_women_seeking_refuge, religious_sanctuary).
rule_source(nuns_protect_women_seeking_refuge, ensemble).
rule_priority(nuns_protect_women_seeking_refuge, 4).
rule_applies(nuns_protect_women_seeking_refuge, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val > 5.
rule_effect(nuns_protect_women_seeking_refuge, set_intent(X, befriend, Y, 4)).

%% Physicians resent those who practice quackery and superstition
rule_likelihood(physicians_resent_quackery_and_superstition, 1).
rule_type(physicians_resent_quackery_and_superstition, volition).
%% Physicians resent those who practice quackery and superstition.
rule_active(physicians_resent_quackery_and_superstition).
rule_category(physicians_resent_quackery_and_superstition, scientific_integrity).
rule_source(physicians_resent_quackery_and_superstition, ensemble).
rule_priority(physicians_resent_quackery_and_superstition, 3).
rule_applies(physicians_resent_quackery_and_superstition, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val < 3.
rule_effect(physicians_resent_quackery_and_superstition, set_intent(X, antagonize, Y, 3)).
