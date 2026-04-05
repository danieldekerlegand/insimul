%% Insimul Rules: Solarpunk Eco-Communities
%% Source: data/worlds/solarpunk/rules.pl
%% Created: 2026-04-03
%% Total: 12 rules
%%
%% Predicate schema (follows base rules format):
%%   rule/4 -- rule(AtomId, Name, RuleType, Priority)
%%   rule_description/2, rule_condition/2, rule_effect/2
%%   rule_category/2, rule_active/1

%% Community Labor Contribution
rule(labor_contribution, 'Community Labor Contribution', trigger, 7).
rule_description(labor_contribution, 'Residents earn community tokens by contributing labor hours to shared projects.').
rule_category(labor_contribution, economic).
rule_active(labor_contribution).
rule_condition(labor_contribution, (completed_work(Actor, Project, Hours))).
rule_effect(labor_contribution, (add_tokens(Actor, Hours), modify_reputation(Actor, community, 5))).

%% Consensus Required
rule(consensus_required, 'Consensus Required', trigger, 9).
rule_description(consensus_required, 'Major community decisions require consensus at the assembly. Proposals that lack broad support are tabled.').
rule_category(consensus_required, social).
rule_active(consensus_required).
rule_condition(consensus_required, (proposal(Actor, Action), community_vote(Action, Support), Support < 0.7)).
rule_effect(consensus_required, (table_proposal(Action), assert(status(Action, tabled)))).

%% Composting Mandate
rule(composting_mandate, 'Composting Mandate', trigger, 4).
rule_description(composting_mandate, 'All organic waste must be composted. Improper disposal results in community service hours.').
rule_category(composting_mandate, environmental).
rule_active(composting_mandate).
rule_condition(composting_mandate, (disposes(Actor, organic_waste), \+ composted(Actor, organic_waste))).
rule_effect(composting_mandate, (assign_service(Actor, 2), modify_reputation(Actor, community, -5))).

%% Solar Energy Generation
rule(solar_generation, 'Solar Energy Generation', trigger, 5).
rule_description(solar_generation, 'Solar panels generate energy during daylight hours, stored in community batteries.').
rule_category(solar_generation, environmental).
rule_active(solar_generation).
rule_condition(solar_generation, (time_of_day(day), has_solar_panel(Zone))).
rule_effect(solar_generation, (add_energy(Zone, 10))).

%% Water Conservation
rule(water_conservation, 'Water Conservation', trigger, 8).
rule_description(water_conservation, 'Excessive water usage triggers community review and possible rationing.').
rule_category(water_conservation, environmental).
rule_active(water_conservation).
rule_condition(water_conservation, (water_usage(Actor, Usage), Usage > daily_allocation(Actor))).
rule_effect(water_conservation, (assert(status(Actor, water_review)), notify_council(Actor))).

%% Mentorship Bonus
rule(mentorship_bonus, 'Mentorship Bonus', volition, 4).
rule_description(mentorship_bonus, 'Teaching a skill to another community member earns bonus reputation and tokens.').
rule_category(mentorship_bonus, social).
rule_active(mentorship_bonus).
rule_condition(mentorship_bonus, (teaches(Actor, Student, Skill))).
rule_effect(mentorship_bonus, (add_tokens(Actor, 2), modify_reputation(Actor, community, 10), improve_skill(Student, Skill))).

%% Harvest Sharing
rule(harvest_sharing, 'Harvest Sharing', trigger, 6).
rule_description(harvest_sharing, 'Crop harvests are distributed communally. The community kitchen receives the majority, with growers keeping a personal share.').
rule_category(harvest_sharing, economic).
rule_active(harvest_sharing).
rule_condition(harvest_sharing, (harvests(Actor, Crop, Amount))).
rule_effect(harvest_sharing, (Share is Amount * 0.3, Communal is Amount * 0.7, add_to_kitchen(Communal), add_to_inventory(Actor, Crop, Share))).

%% Restoration Progress
rule(restoration_progress, 'Restoration Progress', trigger, 5).
rule_description(restoration_progress, 'Ecosystem restoration efforts accumulate over time, improving biodiversity and community well-being.').
rule_category(restoration_progress, environmental).
rule_active(restoration_progress).
rule_condition(restoration_progress, (completed_restoration(Actor, Zone))).
rule_effect(restoration_progress, (modify_biodiversity(Zone, 5), modify_wellbeing(community, 2))).

%% Craft Market
rule(craft_market, 'Craft Market', trigger, 3).
rule_description(craft_market, 'Handcrafted goods can be exchanged at the weekly market. Quality work earns more tokens.').
rule_category(craft_market, economic).
rule_active(craft_market).
rule_condition(craft_market, (sells_craft(Actor, Item), craft_quality(Item, Quality))).
rule_effect(craft_market, (Tokens is Quality * 2, add_tokens(Actor, Tokens))).

%% Conflict Mediation
rule(conflict_mediation, 'Conflict Mediation', trigger, 7).
rule_description(conflict_mediation, 'Interpersonal conflicts must be addressed through mediation before they escalate.').
rule_category(conflict_mediation, social).
rule_active(conflict_mediation).
rule_condition(conflict_mediation, (conflict(Actor, Other), severity(Actor, Other, S), S > 3)).
rule_effect(conflict_mediation, (assign_mediator(Actor, Other), assert(status(Actor, in_mediation)))).

%% Energy Rationing
rule(energy_rationing, 'Energy Rationing', trigger, 6).
rule_description(energy_rationing, 'During low-sun periods, energy is rationed. Non-essential usage is curtailed.').
rule_category(energy_rationing, environmental).
rule_active(energy_rationing).
rule_condition(energy_rationing, (community_energy(Level), Level < 20)).
rule_effect(energy_rationing, (assert(status(community, energy_rationing)), reduce_non_essential(community))).

%% Pollinator Bonus
rule(pollinator_bonus, 'Pollinator Bonus', trigger, 3).
rule_description(pollinator_bonus, 'Areas with pollinator habitats see improved crop yields.').
rule_category(pollinator_bonus, environmental).
rule_active(pollinator_bonus).
rule_condition(pollinator_bonus, (has_pollinator_habitat(Zone), growing(Zone, Crop))).
rule_effect(pollinator_bonus, (modify_yield(Zone, Crop, 1.2))).
