%% Insimul Rules: Historical Ancient World
%% Source: data/worlds/historical_ancient/rules.pl
%% Created: 2026-04-03
%% Total: 12 rules
%%
%% Predicate schema (ensemble volition format):
%%   rule_likelihood/2, rule_type/2, rule_active/1
%%   rule_category/2, rule_source/2, rule_priority/2
%%   rule_applies/3, rule_effect/2

%% Citizens seek the favor of powerful patrons
rule_likelihood(citizens_seek_favor_of_powerful_patrons, 2).
rule_type(citizens_seek_favor_of_powerful_patrons, volition).
%% Citizens seek the favor of powerful patrons for legal and political protection.
rule_active(citizens_seek_favor_of_powerful_patrons).
rule_category(citizens_seek_favor_of_powerful_patrons, social_hierarchy).
rule_source(citizens_seek_favor_of_powerful_patrons, ensemble).
rule_priority(citizens_seek_favor_of_powerful_patrons, 5).
rule_applies(citizens_seek_favor_of_powerful_patrons, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val > 6.
rule_effect(citizens_seek_favor_of_powerful_patrons, set_intent(X, befriend, Y, 5)).

%% Philosophers challenge those they consider intellectually lazy
rule_likelihood(philosophers_challenge_the_intellectually_lazy, 1).
rule_type(philosophers_challenge_the_intellectually_lazy, volition).
%% Philosophers challenge those they consider intellectually lazy.
rule_active(philosophers_challenge_the_intellectually_lazy).
rule_category(philosophers_challenge_the_intellectually_lazy, intellectual_rivalry).
rule_source(philosophers_challenge_the_intellectually_lazy, ensemble).
rule_priority(philosophers_challenge_the_intellectually_lazy, 3).
rule_applies(philosophers_challenge_the_intellectually_lazy, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val < 4.
rule_effect(philosophers_challenge_the_intellectually_lazy, set_intent(X, antagonize, Y, 2)).

%% Warriors bond through shared danger in battle
rule_likelihood(warriors_bond_through_shared_danger, 2).
rule_type(warriors_bond_through_shared_danger, volition).
%% Warriors bond through shared danger in battle and the arena.
rule_active(warriors_bond_through_shared_danger).
rule_category(warriors_bond_through_shared_danger, martial_camaraderie).
rule_source(warriors_bond_through_shared_danger, ensemble).
rule_priority(warriors_bond_through_shared_danger, 4).
rule_applies(warriors_bond_through_shared_danger, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val > 5.
rule_effect(warriors_bond_through_shared_danger, set_intent(X, befriend, Y, 4)).

%% Merchants undercut rivals to dominate trade
rule_likelihood(merchants_undercut_rivals_to_dominate_trade, 1).
rule_type(merchants_undercut_rivals_to_dominate_trade, volition).
%% Merchants undercut rivals to dominate trade routes.
rule_active(merchants_undercut_rivals_to_dominate_trade).
rule_category(merchants_undercut_rivals_to_dominate_trade, economic_competition).
rule_source(merchants_undercut_rivals_to_dominate_trade, ensemble).
rule_priority(merchants_undercut_rivals_to_dominate_trade, 3).
rule_applies(merchants_undercut_rivals_to_dominate_trade, X, Y) :-
    network(X, Y, antagonism, Antagonism_val), Antagonism_val > 5.
rule_effect(merchants_undercut_rivals_to_dominate_trade, set_intent(X, antagonize, Y, 3)).

%% Priests condemn those who neglect the gods
rule_likelihood(priests_condemn_those_who_neglect_the_gods, 1).
rule_type(priests_condemn_those_who_neglect_the_gods, volition).
%% Priests condemn those who neglect the gods and sacred rites.
rule_active(priests_condemn_those_who_neglect_the_gods).
rule_category(priests_condemn_those_who_neglect_the_gods, religious_authority).
rule_source(priests_condemn_those_who_neglect_the_gods, ensemble).
rule_priority(priests_condemn_those_who_neglect_the_gods, 4).
rule_applies(priests_condemn_those_who_neglect_the_gods, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val < 3.
rule_effect(priests_condemn_those_who_neglect_the_gods, set_intent(X, antagonize, Y, 4)).

%% Nobles cultivate alliances through marriage proposals
rule_likelihood(nobles_cultivate_alliances_through_marriage, 2).
rule_type(nobles_cultivate_alliances_through_marriage, volition).
%% Nobles cultivate alliances through marriage proposals and family ties.
rule_active(nobles_cultivate_alliances_through_marriage).
rule_category(nobles_cultivate_alliances_through_marriage, political_alliance).
rule_source(nobles_cultivate_alliances_through_marriage, ensemble).
rule_priority(nobles_cultivate_alliances_through_marriage, 5).
rule_applies(nobles_cultivate_alliances_through_marriage, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val > 6.
rule_effect(nobles_cultivate_alliances_through_marriage, set_intent(X, befriend, Y, 5)).

%% Slaves resent those who treat them cruelly
rule_likelihood(slaves_resent_those_who_treat_them_cruelly, 1).
rule_type(slaves_resent_those_who_treat_them_cruelly, volition).
%% Slaves resent those who treat them cruelly.
rule_active(slaves_resent_those_who_treat_them_cruelly).
rule_category(slaves_resent_those_who_treat_them_cruelly, social_oppression).
rule_source(slaves_resent_those_who_treat_them_cruelly, ensemble).
rule_priority(slaves_resent_those_who_treat_them_cruelly, 2).
rule_applies(slaves_resent_those_who_treat_them_cruelly, X, Y) :-
    network(X, Y, antagonism, Antagonism_val), Antagonism_val > 7.
rule_effect(slaves_resent_those_who_treat_them_cruelly, set_intent(X, antagonize, Y, 3)).

%% Artisans admire those with superior craft skill
rule_likelihood(artisans_admire_those_with_superior_craft, 1).
rule_type(artisans_admire_those_with_superior_craft, volition).
%% Artisans admire those with superior craft skill.
rule_active(artisans_admire_those_with_superior_craft).
rule_category(artisans_admire_those_with_superior_craft, craft_respect).
rule_source(artisans_admire_those_with_superior_craft, ensemble).
rule_priority(artisans_admire_those_with_superior_craft, 3).
rule_applies(artisans_admire_those_with_superior_craft, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val > 7.
rule_effect(artisans_admire_those_with_superior_craft, set_intent(X, befriend, Y, 3)).

%% Orators sway crowds against political opponents
rule_likelihood(orators_sway_crowds_against_opponents, 1).
rule_type(orators_sway_crowds_against_opponents, volition).
%% Orators sway crowds against political opponents in the assembly.
rule_active(orators_sway_crowds_against_opponents).
rule_category(orators_sway_crowds_against_opponents, political_rivalry).
rule_source(orators_sway_crowds_against_opponents, ensemble).
rule_priority(orators_sway_crowds_against_opponents, 4).
rule_applies(orators_sway_crowds_against_opponents, X, Y) :-
    network(X, Y, antagonism, Antagonism_val), Antagonism_val > 5.
rule_effect(orators_sway_crowds_against_opponents, set_intent(X, antagonize, Y, 4)).

%% Scribes gain respect through mastery of sacred texts
rule_likelihood(scribes_gain_respect_through_sacred_texts, 2).
rule_type(scribes_gain_respect_through_sacred_texts, volition).
%% Scribes gain respect through mastery of sacred texts and knowledge.
rule_active(scribes_gain_respect_through_sacred_texts).
rule_category(scribes_gain_respect_through_sacred_texts, scholarly_prestige).
rule_source(scribes_gain_respect_through_sacred_texts, ensemble).
rule_priority(scribes_gain_respect_through_sacred_texts, 3).
rule_applies(scribes_gain_respect_through_sacred_texts, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val > 5.
rule_effect(scribes_gain_respect_through_sacred_texts, set_intent(X, befriend, Y, 3)).

%% Guests honored by hosts form lasting bonds of xenia
rule_likelihood(guests_honored_by_hosts_form_bonds_of_xenia, 2).
rule_type(guests_honored_by_hosts_form_bonds_of_xenia, volition).
%% Guests honored by hosts form lasting bonds of xenia.
rule_active(guests_honored_by_hosts_form_bonds_of_xenia).
rule_category(guests_honored_by_hosts_form_bonds_of_xenia, hospitality).
rule_source(guests_honored_by_hosts_form_bonds_of_xenia, ensemble).
rule_priority(guests_honored_by_hosts_form_bonds_of_xenia, 5).
rule_applies(guests_honored_by_hosts_form_bonds_of_xenia, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val > 5.
rule_effect(guests_honored_by_hosts_form_bonds_of_xenia, set_intent(X, befriend, Y, 5)).

%% Senators distrust those who gain popularity too quickly
rule_likelihood(senators_distrust_those_who_gain_popularity, 1).
rule_type(senators_distrust_those_who_gain_popularity, volition).
%% Senators distrust those who gain popularity too quickly among the plebs.
rule_active(senators_distrust_those_who_gain_popularity).
rule_category(senators_distrust_those_who_gain_popularity, political_suspicion).
rule_source(senators_distrust_those_who_gain_popularity, ensemble).
rule_priority(senators_distrust_those_who_gain_popularity, 4).
rule_applies(senators_distrust_those_who_gain_popularity, X, Y) :-
    network(X, Y, trust, Trust_val), Trust_val < 4.
rule_effect(senators_distrust_those_who_gain_popularity, set_intent(X, antagonize, Y, 3)).
