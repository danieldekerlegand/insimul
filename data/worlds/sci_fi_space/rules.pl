%% Insimul Rules: Sci-Fi Space
%% Source: data/worlds/sci_fi_space/rules.pl
%% Created: 2026-04-03
%% Total: 12 rules
%%
%% Predicate schema (follows base rules format):
%%   rule/4 -- rule(AtomId, Name, RuleType, Priority)
%%   rule_description/2, rule_condition/2, rule_effect/2
%%   rule_category/2, rule_active/1

%% Vacuum Exposure
rule(vacuum_exposure, 'Vacuum Exposure', trigger, 10).
rule_description(vacuum_exposure, 'Characters exposed to vacuum without an EVA suit take rapid fatal damage.').
rule_category(vacuum_exposure, environmental).
rule_active(vacuum_exposure).
rule_condition(vacuum_exposure, (location(Actor, Zone), vacuum(Zone), \+ wearing(Actor, eva_suit))).
rule_effect(vacuum_exposure, (modify_health(Actor, -50), assert(status(Actor, suffocating)))).

%% Oxygen Consumption
rule(oxygen_consumption, 'Oxygen Consumption', trigger, 9).
rule_description(oxygen_consumption, 'Characters in EVA consume oxygen canisters over time.').
rule_category(oxygen_consumption, survival).
rule_active(oxygen_consumption).
rule_condition(oxygen_consumption, (in_eva(Actor), time_passed(Actor, 4))).
rule_effect(oxygen_consumption, (consume_item(Actor, oxygen_canister, 1))).

%% Contraband Detection
rule(contraband_detection, 'Contraband Detection', trigger, 6).
rule_description(contraband_detection, 'Security scans at Federation stations may detect contraband items.').
rule_category(contraband_detection, social).
rule_active(contraband_detection).
rule_condition(contraband_detection, (enters(Actor, Zone), federation_station(Zone), has_item(Actor, contraband_spice, _), random_chance(0.4))).
rule_effect(contraband_detection, (confiscate_item(Actor, contraband_spice), assert(status(Actor, wanted)))).

%% Gravity Sickness
rule(gravity_sickness, 'Gravity Sickness', trigger, 4).
rule_description(gravity_sickness, 'Characters transitioning between gravity zones may experience temporary sickness.').
rule_category(gravity_sickness, environmental).
rule_active(gravity_sickness).
rule_condition(gravity_sickness, (changed_gravity(Actor), random_chance(0.2))).
rule_effect(gravity_sickness, (assert(status(Actor, nauseous)), modify_efficiency(Actor, -10))).

%% Radiation Shielding
rule(radiation_shielding, 'Radiation Shielding', trigger, 7).
rule_description(radiation_shielding, 'Characters outside shielded areas accumulate radiation exposure.').
rule_category(radiation_shielding, environmental).
rule_active(radiation_shielding).
rule_condition(radiation_shielding, (location(Actor, Zone), unshielded(Zone))).
rule_effect(radiation_shielding, (modify_radiation(Actor, 5))).

%% Docking Fees
rule(docking_fees, 'Docking Fees', trigger, 3).
rule_description(docking_fees, 'Ships docking at Federation stations must pay docking fees.').
rule_category(docking_fees, economic).
rule_active(docking_fees).
rule_condition(docking_fees, (docks_ship(Actor, Station), federation_station(Station))).
rule_effect(docking_fees, (modify_credits(Actor, -50))).

%% Reputation System
rule(reputation_system, 'Reputation System', volition, 5).
rule_description(reputation_system, 'Completing tasks for a faction improves reputation and unlocks new opportunities.').
rule_category(reputation_system, social).
rule_active(reputation_system).
rule_condition(reputation_system, (completed_task(Actor, Faction))).
rule_effect(reputation_system, (modify_reputation(Actor, Faction, 10))).

%% Emergency Lockdown
rule(emergency_lockdown, 'Emergency Lockdown', trigger, 9).
rule_description(emergency_lockdown, 'Hull breaches trigger station-wide lockdown, restricting movement between rings.').
rule_category(emergency_lockdown, environmental).
rule_active(emergency_lockdown).
rule_condition(emergency_lockdown, (hull_breach(Zone))).
rule_effect(emergency_lockdown, (lock_bulkheads(Zone), alert_all(red))).

%% Trade Agreement
rule(trade_agreement, 'Trade Agreement', volition, 4).
rule_description(trade_agreement, 'Successful trades with Thassari improve diplomatic relations and unlock exotic goods.').
rule_category(trade_agreement, economic).
rule_active(trade_agreement).
rule_condition(trade_agreement, (completed_trade(Actor, Thassari), faction(Thassari, thassari))).
rule_effect(trade_agreement, (modify_reputation(Actor, thassari, 15), unlock_goods(Actor, thassari_exotic))).

%% Stim Dependency
rule(stim_dependency, 'Stim Dependency', trigger, 5).
rule_description(stim_dependency, 'Repeated use of stim packs causes dependency and withdrawal symptoms.').
rule_category(stim_dependency, survival).
rule_active(stim_dependency).
rule_condition(stim_dependency, (stim_uses(Actor, Count), Count >= 5)).
rule_effect(stim_dependency, (assert(status(Actor, stim_dependent)), modify_health(Actor, -5))).

%% Salvage Registration
rule(salvage_registration, 'Salvage Registration', trigger, 3).
rule_description(salvage_registration, 'Salvaged items must be registered at an Arbitration Obelisk to establish legal ownership.').
rule_category(salvage_registration, economic).
rule_active(salvage_registration).
rule_condition(salvage_registration, (has_salvage(Actor), near(Actor, arbitration_obelisk, 5))).
rule_effect(salvage_registration, (register_salvage(Actor), assert(legal_owner(Actor, Salvage)))).

%% FTL Jump Risk
rule(ftl_jump_risk, 'FTL Jump Risk', trigger, 7).
rule_description(ftl_jump_risk, 'FTL jumps without proper navigation charts risk misjump into unknown space.').
rule_category(ftl_jump_risk, environmental).
rule_active(ftl_jump_risk).
rule_condition(ftl_jump_risk, (initiates_jump(Actor), \+ has_item(Actor, ftl_nav_chart, _))).
rule_effect(ftl_jump_risk, (random_destination(Actor), modify_hull(Ship, -20))).
