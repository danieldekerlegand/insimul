%% Insimul Volition Rules: Dieselpunk
%% Source: data/worlds/dieselpunk/rules.pl
%% Created: 2026-04-03
%% Total: 12 volition rules
%%
%% Dieselpunk-themed rules governing NPC motivation and intent
%% in a 1930s-40s industrial wartime setting.

%% ═══════════════════════════════════════════════════════════
%% Authority and Resistance
%% ═══════════════════════════════════════════════════════════

%% Workers with low trust in factory owners develop resistance sympathies
rule_likelihood(factory_oppression_breeds_resistance, 1).
rule_type(factory_oppression_breeds_resistance, volition).
% Workers who distrust factory owners gravitate toward resistance movements
rule_active(factory_oppression_breeds_resistance).
rule_category(factory_oppression_breeds_resistance, authority_resistance).
rule_source(factory_oppression_breeds_resistance, dieselpunk).
rule_priority(factory_oppression_breeds_resistance, 5).
rule_applies(factory_oppression_breeds_resistance, X, Y) :-
    status(X, factory_supervisor),
    network(X, Y, trust, Trust_val), Trust_val < 3.
rule_effect(factory_oppression_breeds_resistance, set_intent(X, defy, Y, 4)).

%% Military officers seek to dominate civilians they suspect of disloyalty
rule_likelihood(officers_intimidate_suspected_dissidents, 1).
rule_type(officers_intimidate_suspected_dissidents, volition).
% Officers who suspect disloyalty attempt to assert dominance through intimidation
rule_active(officers_intimidate_suspected_dissidents).
rule_category(officers_intimidate_suspected_dissidents, authority_resistance).
rule_source(officers_intimidate_suspected_dissidents, dieselpunk).
rule_priority(officers_intimidate_suspected_dissidents, 6).
rule_applies(officers_intimidate_suspected_dissidents, X, Y) :-
    status(X, military_governor),
    network(X, Y, antagonism, Ant_val), Ant_val > 5.
rule_effect(officers_intimidate_suspected_dissidents, set_intent(X, intimidate, Y, 6)).

%% Resistance members build trust with sympathetic workers
rule_likelihood(resistance_recruits_sympathizers, 1).
rule_type(resistance_recruits_sympathizers, volition).
% Resistance leaders seek to strengthen bonds with union sympathizers
rule_active(resistance_recruits_sympathizers).
rule_category(resistance_recruits_sympathizers, authority_resistance).
rule_source(resistance_recruits_sympathizers, dieselpunk).
rule_priority(resistance_recruits_sympathizers, 4).
rule_applies(resistance_recruits_sympathizers, X, Y) :-
    status(X, resistance_leader),
    status(Y, union_sympathizer).
rule_effect(resistance_recruits_sympathizers, set_intent(X, befriend, Y, 5)).

%% ═══════════════════════════════════════════════════════════
%% War Profiteering and Class Tension
%% ═══════════════════════════════════════════════════════════

%% War profiteers antagonize those who threaten their supply chains
rule_likelihood(profiteers_protect_interests, 1).
rule_type(profiteers_protect_interests, volition).
% War profiteers act aggressively toward anyone disrupting their operations
rule_active(profiteers_protect_interests).
rule_category(profiteers_protect_interests, class_tension).
rule_source(profiteers_protect_interests, dieselpunk).
rule_priority(profiteers_protect_interests, 7).
rule_applies(profiteers_protect_interests, X, Y) :-
    status(X, war_profiteer),
    network(X, Y, antagonism, Ant_val), Ant_val > 4.
rule_effect(profiteers_protect_interests, set_intent(X, antagonize, Y, 6)).

%% Workers develop solidarity when sharing low wealth conditions
rule_likelihood(shared_hardship_builds_solidarity, 1).
rule_type(shared_hardship_builds_solidarity, volition).
% Workers in poor districts form bonds through shared suffering
rule_active(shared_hardship_builds_solidarity).
rule_category(shared_hardship_builds_solidarity, class_tension).
rule_source(shared_hardship_builds_solidarity, dieselpunk).
rule_priority(shared_hardship_builds_solidarity, 3).
rule_applies(shared_hardship_builds_solidarity, X, Y) :-
    status(X, apprentice_mechanic),
    status(Y, railway_worker).
rule_effect(shared_hardship_builds_solidarity, set_intent(X, befriend, Y, 3)).

%% Wealthy elites distrust those from lower districts
rule_likelihood(elites_distrust_the_underclass, 1).
rule_type(elites_distrust_the_underclass, volition).
% Those in power view the working class with suspicion
rule_active(elites_distrust_the_underclass).
rule_category(elites_distrust_the_underclass, class_tension).
rule_source(elites_distrust_the_underclass, dieselpunk).
rule_priority(elites_distrust_the_underclass, 4).
rule_applies(elites_distrust_the_underclass, X, Y) :-
    status(X, factory_owner),
    network(X, Y, trust, Trust_val), Trust_val < 4.
rule_effect(elites_distrust_the_underclass, set_intent(X, antagonize, Y, 3)).

%% ═══════════════════════════════════════════════════════════
%% Espionage and Subterfuge
%% ═══════════════════════════════════════════════════════════

%% Smugglers build covert alliances with resistance contacts
rule_likelihood(smugglers_cultivate_underground_contacts, 1).
rule_type(smugglers_cultivate_underground_contacts, volition).
% Smugglers seek trusted partners in the resistance network
rule_active(smugglers_cultivate_underground_contacts).
rule_category(smugglers_cultivate_underground_contacts, espionage).
rule_source(smugglers_cultivate_underground_contacts, dieselpunk).
rule_priority(smugglers_cultivate_underground_contacts, 5).
rule_applies(smugglers_cultivate_underground_contacts, X, Y) :-
    status(X, smuggler_captain),
    status(Y, resistance_contact).
rule_effect(smugglers_cultivate_underground_contacts, set_intent(X, befriend, Y, 4)).

%% Propagandists undermine authority through subversion
rule_likelihood(propagandists_subvert_authority, 1).
rule_type(propagandists_subvert_authority, volition).
% Underground propagandists work to erode trust in the military regime
rule_active(propagandists_subvert_authority).
rule_category(propagandists_subvert_authority, espionage).
rule_source(propagandists_subvert_authority, dieselpunk).
rule_priority(propagandists_subvert_authority, 6).
rule_applies(propagandists_subvert_authority, X, Y) :-
    status(X, propagandist),
    status(Y, military_governor).
rule_effect(propagandists_subvert_authority, set_intent(X, undermine, Y, 5)).

%% Couriers avoid detection by maintaining low profiles around officers
rule_likelihood(couriers_evade_military_patrols, 1).
rule_type(couriers_evade_military_patrols, volition).
% Couriers carrying sensitive materials seek to avoid military personnel
rule_active(couriers_evade_military_patrols).
rule_category(couriers_evade_military_patrols, espionage).
rule_source(couriers_evade_military_patrols, dieselpunk).
rule_priority(couriers_evade_military_patrols, 5).
rule_applies(couriers_evade_military_patrols, X, Y) :-
    status(X, courier),
    status(Y, junior_officer).
rule_effect(couriers_evade_military_patrols, set_intent(X, avoid, Y, 4)).

%% ═══════════════════════════════════════════════════════════
%% Loyalty and Betrayal
%% ═══════════════════════════════════════════════════════════

%% Conflicted family members waver between loyalty and conscience
rule_likelihood(conflicted_loyalty_erodes_family_bonds, 1).
rule_type(conflicted_loyalty_erodes_family_bonds, volition).
% Those torn between family duty and moral conviction drift from authority figures
rule_active(conflicted_loyalty_erodes_family_bonds).
rule_category(conflicted_loyalty_erodes_family_bonds, loyalty_betrayal).
rule_source(conflicted_loyalty_erodes_family_bonds, dieselpunk).
rule_priority(conflicted_loyalty_erodes_family_bonds, 4).
rule_applies(conflicted_loyalty_erodes_family_bonds, X, _) :-
    trait(X, conflicted),
    trait(X, obedient).
rule_effect(conflicted_loyalty_erodes_family_bonds, set_intent(X, distance, Y, 3)).

%% Pilots who witness injustice seek allies among fellow aviators
rule_likelihood(pilots_bond_through_shared_skies, 1).
rule_type(pilots_bond_through_shared_skies, volition).
% Pilots and navigators form tight bonds born of mutual reliance in the air
rule_active(pilots_bond_through_shared_skies).
rule_category(pilots_bond_through_shared_skies, loyalty_betrayal).
rule_source(pilots_bond_through_shared_skies, dieselpunk).
rule_priority(pilots_bond_through_shared_skies, 3).
rule_applies(pilots_bond_through_shared_skies, X, Y) :-
    status(X, pilot),
    status(Y, aspiring_navigator).
rule_effect(pilots_bond_through_shared_skies, set_intent(X, befriend, Y, 4)).

%% Tavern keepers gather intelligence from loose-lipped patrons
rule_likelihood(tavern_keepers_collect_rumors, 1).
rule_type(tavern_keepers_collect_rumors, volition).
% Those who run drinking establishments overhear secrets and trade in information
rule_active(tavern_keepers_collect_rumors).
rule_category(tavern_keepers_collect_rumors, espionage).
rule_source(tavern_keepers_collect_rumors, dieselpunk).
rule_priority(tavern_keepers_collect_rumors, 4).
rule_applies(tavern_keepers_collect_rumors, X, Y) :-
    status(X, tavern_keeper),
    network(X, Y, friendship, Friend_val), Friend_val > 3.
rule_effect(tavern_keepers_collect_rumors, set_intent(X, investigate, Y, 3)).
