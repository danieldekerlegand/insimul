%% Insimul Volition Rules: Realm of Aethermoor
%% Source: data/worlds/realm_of_aethermoor/rules.pl
%% Created: 2026-04-03
%% Total: 12 volition rules
%%
%% Predicate schema (Ensemble format):
%%   rule_likelihood/2, rule_type/2, rule_active/1
%%   rule_category/2, rule_source/2, rule_priority/2
%%   rule_applies/3, rule_effect/2

%% ─── Racial Tensions ───

%% Dwarves distrust elves due to centuries of territorial disputes
rule_likelihood(dwarves_distrust_elves, 1).
rule_type(dwarves_distrust_elves, volition).
rule_active(dwarves_distrust_elves).
rule_category(dwarves_distrust_elves, faction_rivalry).
rule_source(dwarves_distrust_elves, realm_of_aethermoor).
rule_priority(dwarves_distrust_elves, 4).
rule_applies(dwarves_distrust_elves, X, Y) :-
    race(X, dwarf),
    race(Y, elf),
    network(X, Y, trust, Trust_val), Trust_val < 5.
rule_effect(dwarves_distrust_elves, set_intent(X, distrust, Y, 4)).

%% Orcs are antagonistic toward those who control settled territories
rule_likelihood(orcs_resent_settlers, 1).
rule_type(orcs_resent_settlers, volition).
rule_active(orcs_resent_settlers).
rule_category(orcs_resent_settlers, antagonism_hostility).
rule_source(orcs_resent_settlers, realm_of_aethermoor).
rule_priority(orcs_resent_settlers, 3).
rule_applies(orcs_resent_settlers, X, Y) :-
    race(X, orc),
    status(Y, ruler),
    network(X, Y, antagonism, Ant_val), Ant_val > 3.
rule_effect(orcs_resent_settlers, set_intent(X, antagonize, Y, 3)).

%% Elves form bonds with those who show reverence for nature
rule_likelihood(elves_befriend_nature_lovers, 2).
rule_type(elves_befriend_nature_lovers, volition).
rule_active(elves_befriend_nature_lovers).
rule_category(elves_befriend_nature_lovers, friendship_affinity).
rule_source(elves_befriend_nature_lovers, realm_of_aethermoor).
rule_priority(elves_befriend_nature_lovers, 5).
rule_applies(elves_befriend_nature_lovers, X, Y) :-
    race(X, elf),
    trait(Y, nature_reverent, true),
    network(X, Y, respect, Resp_val), Resp_val > 5.
rule_effect(elves_befriend_nature_lovers, set_intent(X, befriend, Y, 5)).

%% ─── Feudal Loyalty ───

%% Subjects are loyal to rulers who demonstrate justice
rule_likelihood(subjects_loyal_to_just_rulers, 2).
rule_type(subjects_loyal_to_just_rulers, volition).
rule_active(subjects_loyal_to_just_rulers).
rule_category(subjects_loyal_to_just_rulers, respect_authority).
rule_source(subjects_loyal_to_just_rulers, realm_of_aethermoor).
rule_priority(subjects_loyal_to_just_rulers, 6).
rule_applies(subjects_loyal_to_just_rulers, X, Y) :-
    trait(Y, just, true),
    status(Y, ruler),
    network(X, Y, trust, Trust_val), Trust_val > 6.
rule_effect(subjects_loyal_to_just_rulers, set_intent(X, respect, Y, 6)).

%% Nobles scheme against rivals who threaten their power
rule_likelihood(nobles_scheme_against_rivals, 1).
rule_type(nobles_scheme_against_rivals, volition).
rule_active(nobles_scheme_against_rivals).
rule_category(nobles_scheme_against_rivals, manipulation_influence).
rule_source(nobles_scheme_against_rivals, realm_of_aethermoor).
rule_priority(nobles_scheme_against_rivals, 5).
rule_applies(nobles_scheme_against_rivals, X, Y) :-
    trait(X, noble, true),
    trait(Y, noble, true),
    network(X, Y, rivalry, Rival_val), Rival_val > 5.
rule_effect(nobles_scheme_against_rivals, set_intent(X, manipulate, Y, 5)).

%% ─── Magical Bonds ───

%% Mages who study together develop strong intellectual bonds
rule_likelihood(mages_bond_through_study, 2).
rule_type(mages_bond_through_study, volition).
rule_active(mages_bond_through_study).
rule_category(mages_bond_through_study, friendship_affinity).
rule_source(mages_bond_through_study, realm_of_aethermoor).
rule_priority(mages_bond_through_study, 5).
rule_applies(mages_bond_through_study, X, Y) :-
    attribute(X, magical_affinity, MagX), MagX > 60,
    attribute(Y, magical_affinity, MagY), MagY > 60,
    network(X, Y, collaboration, Collab_val), Collab_val > 4.
rule_effect(mages_bond_through_study, set_intent(X, befriend, Y, 5)).

%% People fear those who use dark magic
rule_likelihood(fear_of_dark_magic_users, 1).
rule_type(fear_of_dark_magic_users, volition).
rule_active(fear_of_dark_magic_users).
rule_category(fear_of_dark_magic_users, fear_suspicion).
rule_source(fear_of_dark_magic_users, realm_of_aethermoor).
rule_priority(fear_of_dark_magic_users, 6).
rule_applies(fear_of_dark_magic_users, X, Y) :-
    status(Y, dark_magic_user),
    network(X, Y, trust, Trust_val), Trust_val < 3.
rule_effect(fear_of_dark_magic_users, set_intent(X, distrust, Y, 6)).

%% ─── Guild Brotherhood ───

%% Adventurer guild members protect each other in the field
rule_likelihood(guild_members_protect_each_other, 2).
rule_type(guild_members_protect_each_other, volition).
rule_active(guild_members_protect_each_other).
rule_category(guild_members_protect_each_other, protection_loyalty).
rule_source(guild_members_protect_each_other, realm_of_aethermoor).
rule_priority(guild_members_protect_each_other, 7).
rule_applies(guild_members_protect_each_other, X, Y) :-
    status(X, guild_member),
    status(Y, guild_member),
    network(X, Y, camaraderie, Cam_val), Cam_val > 5.
rule_effect(guild_members_protect_each_other, set_intent(X, protect, Y, 7)).

%% Tavern patrons share stories and build camaraderie
rule_likelihood(tavern_camaraderie, 3).
rule_type(tavern_camaraderie, volition).
rule_active(tavern_camaraderie).
rule_category(tavern_camaraderie, friendship_affinity).
rule_source(tavern_camaraderie, realm_of_aethermoor).
rule_priority(tavern_camaraderie, 3).
rule_applies(tavern_camaraderie, X, Y) :-
    at_location(X, Loc),
    at_location(Y, Loc),
    building(Loc, business, tavern),
    X \= Y.
rule_effect(tavern_camaraderie, set_intent(X, befriend, Y, 3)).

%% ─── Romance and Diplomacy ───

%% Cross-racial romances face social pressure and disapproval
rule_likelihood(cross_racial_romance_pressure, 1).
rule_type(cross_racial_romance_pressure, volition).
rule_active(cross_racial_romance_pressure).
rule_category(cross_racial_romance_pressure, social_pressure).
rule_source(cross_racial_romance_pressure, realm_of_aethermoor).
rule_priority(cross_racial_romance_pressure, 4).
rule_applies(cross_racial_romance_pressure, X, Y) :-
    race(X, RaceX),
    race(Y, RaceY),
    RaceX \= RaceY,
    network(X, Y, romance, Rom_val), Rom_val > 5.
rule_effect(cross_racial_romance_pressure, set_intent(X, conflicted, Y, 4)).

%% Warriors respect those who prove themselves in combat
rule_likelihood(warriors_respect_combat_prowess, 2).
rule_type(warriors_respect_combat_prowess, volition).
rule_active(warriors_respect_combat_prowess).
rule_category(warriors_respect_combat_prowess, respect_authority).
rule_source(warriors_respect_combat_prowess, realm_of_aethermoor).
rule_priority(warriors_respect_combat_prowess, 5).
rule_applies(warriors_respect_combat_prowess, X, Y) :-
    attribute(X, combat_skill, CombatX), CombatX > 60,
    attribute(Y, combat_skill, CombatY), CombatY > 70.
rule_effect(warriors_respect_combat_prowess, set_intent(X, respect, Y, 5)).

%% Merchants leverage trade debts for influence
rule_likelihood(merchants_leverage_debts, 2).
rule_type(merchants_leverage_debts, volition).
rule_active(merchants_leverage_debts).
rule_category(merchants_leverage_debts, manipulation_influence).
rule_source(merchants_leverage_debts, realm_of_aethermoor).
rule_priority(merchants_leverage_debts, 4).
rule_applies(merchants_leverage_debts, X, Y) :-
    trait(X, merchant, true),
    network(X, Y, debt, Debt_val), Debt_val > 3.
rule_effect(merchants_leverage_debts, set_intent(X, manipulate, Y, 4)).
