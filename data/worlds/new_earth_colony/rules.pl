%% Insimul Volition Rules: New Earth Colony
%% Source: data/worlds/new_earth_colony/rules.pl
%% Created: 2026-04-03
%% Total: 12 volition rules
%%
%% Predicate schema (Ensemble format):
%%   rule_likelihood/2, rule_type/2, rule_active/1
%%   rule_category/2, rule_source/2, rule_priority/2
%%   rule_applies/3, rule_effect/2

%% ─── Command and Authority ───

%% Officers instinctively defer to those with higher military rank
rule_likelihood(officers_defer_to_higher_rank, 2).
rule_type(officers_defer_to_higher_rank, volition).
rule_active(officers_defer_to_higher_rank).
rule_category(officers_defer_to_higher_rank, respect_authority).
rule_source(officers_defer_to_higher_rank, new_earth_colony).
rule_priority(officers_defer_to_higher_rank, 6).
rule_applies(officers_defer_to_higher_rank, X, Y) :-
    trait(X, military_officer, true),
    attribute(Y, military_rank, Rank_val), Rank_val > 7.
rule_effect(officers_defer_to_higher_rank, set_intent(X, respect, Y, 6)).

%% Colonists resent authority figures who restrict resource access
rule_likelihood(colonists_resent_resource_gatekeepers, 1).
rule_type(colonists_resent_resource_gatekeepers, volition).
rule_active(colonists_resent_resource_gatekeepers).
rule_category(colonists_resent_resource_gatekeepers, antagonism_hostility).
rule_source(colonists_resent_resource_gatekeepers, new_earth_colony).
rule_priority(colonists_resent_resource_gatekeepers, 4).
rule_applies(colonists_resent_resource_gatekeepers, X, Y) :-
    trait(X, colonist, true),
    trait(Y, resource_manager, true),
    network(X, Y, trust, Trust_val), Trust_val < 4.
rule_effect(colonists_resent_resource_gatekeepers, set_intent(X, antagonize, Y, 4)).

%% ─── Survival Bonds ───

%% People who survive EVA emergencies together form deep loyalty
rule_likelihood(eva_survival_bonds, 1).
rule_type(eva_survival_bonds, volition).
rule_active(eva_survival_bonds).
rule_category(eva_survival_bonds, friendship_affinity).
rule_source(eva_survival_bonds, new_earth_colony).
rule_priority(eva_survival_bonds, 7).
rule_applies(eva_survival_bonds, X, Y) :-
    status(X, survived_eva_emergency),
    status(Y, survived_eva_emergency),
    network(X, Y, shared_danger, Danger_val), Danger_val > 3.
rule_effect(eva_survival_bonds, set_intent(X, befriend, Y, 7)).

%% Colonists trust engineers who keep life support running
rule_likelihood(trust_in_engineers, 2).
rule_type(trust_in_engineers, volition).
rule_active(trust_in_engineers).
rule_category(trust_in_engineers, trust_gratitude).
rule_source(trust_in_engineers, new_earth_colony).
rule_priority(trust_in_engineers, 5).
rule_applies(trust_in_engineers, X, Y) :-
    trait(Y, engineer, true),
    attribute(Y, technical_skill, Skill_val), Skill_val > 70.
rule_effect(trust_in_engineers, set_intent(X, trust, Y, 5)).

%% ─── Faction Tensions ───

%% Earth Alliance members distrust Mars Collective representatives
rule_likelihood(earth_distrusts_mars, 1).
rule_type(earth_distrusts_mars, volition).
rule_active(earth_distrusts_mars).
rule_category(earth_distrusts_mars, faction_rivalry).
rule_source(earth_distrusts_mars, new_earth_colony).
rule_priority(earth_distrusts_mars, 4).
rule_applies(earth_distrusts_mars, X, Y) :-
    trait(X, earth_alliance, true),
    trait(Y, mars_collective, true),
    network(X, Y, trust, Trust_val), Trust_val < 5.
rule_effect(earth_distrusts_mars, set_intent(X, distrust, Y, 4)).

%% Mars Collective members resent Earth Alliance resource monopoly
rule_likelihood(mars_resents_earth_monopoly, 1).
rule_type(mars_resents_earth_monopoly, volition).
rule_active(mars_resents_earth_monopoly).
rule_category(mars_resents_earth_monopoly, faction_rivalry).
rule_source(mars_resents_earth_monopoly, new_earth_colony).
rule_priority(mars_resents_earth_monopoly, 3).
rule_applies(mars_resents_earth_monopoly, X, Y) :-
    trait(X, mars_collective, true),
    trait(Y, earth_alliance, true),
    network(X, Y, antagonism, Ant_val), Ant_val > 4.
rule_effect(mars_resents_earth_monopoly, set_intent(X, antagonize, Y, 3)).

%% ─── AI Relations ───

%% Colonists who interact with sentient AI develop empathy toward it
rule_likelihood(empathy_toward_sentient_ai, 2).
rule_type(empathy_toward_sentient_ai, volition).
rule_active(empathy_toward_sentient_ai).
rule_category(empathy_toward_sentient_ai, friendship_affinity).
rule_source(empathy_toward_sentient_ai, new_earth_colony).
rule_priority(empathy_toward_sentient_ai, 4).
rule_applies(empathy_toward_sentient_ai, X, Y) :-
    trait(Y, sentient_ai, true),
    network(X, Y, friendship, Friend_val), Friend_val > 5.
rule_effect(empathy_toward_sentient_ai, set_intent(X, befriend, Y, 4)).

%% People fear AI systems they do not understand
rule_likelihood(fear_of_unknown_ai, 1).
rule_type(fear_of_unknown_ai, volition).
rule_active(fear_of_unknown_ai).
rule_category(fear_of_unknown_ai, fear_suspicion).
rule_source(fear_of_unknown_ai, new_earth_colony).
rule_priority(fear_of_unknown_ai, 3).
rule_applies(fear_of_unknown_ai, X, Y) :-
    trait(Y, sentient_ai, true),
    network(X, Y, trust, Trust_val), Trust_val < 3.
rule_effect(fear_of_unknown_ai, set_intent(X, distrust, Y, 3)).

%% ─── Science and Discovery ───

%% Scientists bond over shared research breakthroughs
rule_likelihood(scientists_bond_over_breakthroughs, 2).
rule_type(scientists_bond_over_breakthroughs, volition).
rule_active(scientists_bond_over_breakthroughs).
rule_category(scientists_bond_over_breakthroughs, friendship_affinity).
rule_source(scientists_bond_over_breakthroughs, new_earth_colony).
rule_priority(scientists_bond_over_breakthroughs, 5).
rule_applies(scientists_bond_over_breakthroughs, X, Y) :-
    trait(X, scientist, true),
    trait(Y, scientist, true),
    network(X, Y, collaboration, Collab_val), Collab_val > 5.
rule_effect(scientists_bond_over_breakthroughs, set_intent(X, befriend, Y, 5)).

%% Pilots build camaraderie through shared flight missions
rule_likelihood(pilot_camaraderie, 2).
rule_type(pilot_camaraderie, volition).
rule_active(pilot_camaraderie).
rule_category(pilot_camaraderie, friendship_affinity).
rule_source(pilot_camaraderie, new_earth_colony).
rule_priority(pilot_camaraderie, 5).
rule_applies(pilot_camaraderie, X, Y) :-
    trait(X, pilot, true),
    trait(Y, pilot, true),
    network(X, Y, shared_missions, Mission_val), Mission_val > 3.
rule_effect(pilot_camaraderie, set_intent(X, befriend, Y, 5)).

%% ─── Resource Pressure ───

%% Colonists become hostile during rationing periods
rule_likelihood(rationing_breeds_hostility, 1).
rule_type(rationing_breeds_hostility, volition).
rule_active(rationing_breeds_hostility).
rule_category(rationing_breeds_hostility, antagonism_hostility).
rule_source(rationing_breeds_hostility, new_earth_colony).
rule_priority(rationing_breeds_hostility, 3).
rule_applies(rationing_breeds_hostility, X, Y) :-
    status(X, hungry),
    trait(Y, resource_manager, true).
rule_effect(rationing_breeds_hostility, set_intent(X, antagonize, Y, 3)).

%% Shared meals in the mess hall build community bonds
rule_likelihood(shared_meals_build_bonds, 3).
rule_type(shared_meals_build_bonds, volition).
rule_active(shared_meals_build_bonds).
rule_category(shared_meals_build_bonds, friendship_affinity).
rule_source(shared_meals_build_bonds, new_earth_colony).
rule_priority(shared_meals_build_bonds, 3).
rule_applies(shared_meals_build_bonds, X, Y) :-
    at_location(X, mess_hall),
    at_location(Y, mess_hall),
    X \= Y.
rule_effect(shared_meals_build_bonds, set_intent(X, befriend, Y, 3)).
