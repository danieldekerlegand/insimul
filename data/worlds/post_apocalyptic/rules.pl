%% Insimul Rules: Post-Apocalyptic Wasteland
%% Source: data/worlds/post_apocalyptic/rules.pl
%% Created: 2026-04-03
%% Total: 12 rules
%%
%% Predicate schema (follows base rules format):
%%   rule/4 -- rule(AtomId, Name, RuleType, Priority)
%%   rule_description/2, rule_condition/2, rule_effect/2
%%   rule_category/2, rule_active/1

%% Radiation Exposure
rule(radiation_exposure, 'Radiation Exposure', trigger, 8).
rule_description(radiation_exposure, 'Characters in irradiated zones without protection take radiation damage each turn.').
rule_category(radiation_exposure, environmental).
rule_active(radiation_exposure).
rule_condition(radiation_exposure, (location(Actor, Zone), irradiated(Zone), \+ has_item(Actor, gas_mask, _))).
rule_effect(radiation_exposure, (modify_health(Actor, -10), assert(status(Actor, irradiated)))).

%% Water Consumption
rule(water_consumption, 'Water Consumption', trigger, 9).
rule_description(water_consumption, 'Characters must consume water daily or suffer dehydration penalties.').
rule_category(water_consumption, survival).
rule_active(water_consumption).
rule_condition(water_consumption, (time_passed(Actor, 24), \+ has_consumed(Actor, water))).
rule_effect(water_consumption, (modify_health(Actor, -5), assert(status(Actor, dehydrated)))).

%% Scavenging Tithe
rule(scavenging_tithe, 'Scavenging Tithe', trigger, 5).
rule_description(scavenging_tithe, 'All salvage brought into Haven Ridge is subject to a ten percent community tithe.').
rule_category(scavenging_tithe, economic).
rule_active(scavenging_tithe).
rule_condition(scavenging_tithe, (enters(Actor, haven_ridge), carrying_salvage(Actor, Amount))).
rule_effect(scavenging_tithe, (Tithe is Amount * 0.1, modify_inventory(Actor, -Tithe))).

%% Curfew Enforcement
rule(curfew_enforcement, 'Curfew Enforcement', trigger, 6).
rule_description(curfew_enforcement, 'Haven Ridge gates close at sundown. Characters outside after dark face penalties.').
rule_category(curfew_enforcement, social).
rule_active(curfew_enforcement).
rule_condition(curfew_enforcement, (time_of_day(night), location(Actor, outside_walls))).
rule_effect(curfew_enforcement, (assert(status(Actor, exposed)), modify_danger(Actor, 20))).

%% Raider Hostility
rule(raider_hostility, 'Raider Hostility', trigger, 7).
rule_description(raider_hostility, 'Iron Fang raiders attack non-allied characters entering Dead Valley.').
rule_category(raider_hostility, combat).
rule_active(raider_hostility).
rule_condition(raider_hostility, (location(Actor, dead_valley), \+ faction(Actor, iron_fang))).
rule_effect(raider_hostility, (trigger_combat(Actor, iron_fang_patrol))).

%% Mutant Encounter
rule(mutant_encounter, 'Mutant Encounter', trigger, 6).
rule_description(mutant_encounter, 'Traveling through wilderness zones has a chance of triggering a mutant creature encounter.').
rule_category(mutant_encounter, combat).
rule_active(mutant_encounter).
rule_condition(mutant_encounter, (location(Actor, wilderness), random_chance(0.3))).
rule_effect(mutant_encounter, (trigger_combat(Actor, mutant_creature))).

%% Trade Reputation
rule(trade_reputation, 'Trade Reputation', volition, 4).
rule_description(trade_reputation, 'Successful trades improve a characters reputation with merchants, unlocking better prices.').
rule_category(trade_reputation, economic).
rule_active(trade_reputation).
rule_condition(trade_reputation, (completed_trade(Actor, Merchant))).
rule_effect(trade_reputation, (modify_relationship(Actor, Merchant, 5))).

%% Starvation
rule(starvation_rule, 'Starvation', trigger, 9).
rule_description(starvation_rule, 'Characters who go three days without food begin losing health rapidly.').
rule_category(starvation_rule, survival).
rule_active(starvation_rule).
rule_condition(starvation_rule, (days_without_food(Actor, Days), Days >= 3)).
rule_effect(starvation_rule, (modify_health(Actor, -20), assert(status(Actor, starving)))).

%% Shelter Bonus
rule(shelter_bonus, 'Shelter Bonus', trigger, 3).
rule_description(shelter_bonus, 'Characters resting in a building recover health faster than those sleeping outdoors.').
rule_category(shelter_bonus, survival).
rule_active(shelter_bonus).
rule_condition(shelter_bonus, (resting(Actor), in_building(Actor))).
rule_effect(shelter_bonus, (modify_health(Actor, 5))).

%% Militia Duty
rule(militia_duty, 'Militia Duty', trigger, 5).
rule_description(militia_duty, 'Haven Ridge residents who skip militia duty receive reduced rations for one week.').
rule_category(militia_duty, social).
rule_active(militia_duty).
rule_condition(militia_duty, (resident(Actor, haven_ridge), missed_duty(Actor))).
rule_effect(militia_duty, (assert(status(Actor, reduced_rations)), modify_relationship(Actor, haven_ridge, -10))).

%% Radiation Healing
rule(radiation_healing, 'Radiation Healing', trigger, 4).
rule_description(radiation_healing, 'Consuming rad-away tablets removes the irradiated status and restores some health.').
rule_category(radiation_healing, survival).
rule_active(radiation_healing).
rule_condition(radiation_healing, (status(Actor, irradiated), consumes(Actor, rad_away))).
rule_effect(radiation_healing, (retract(status(Actor, irradiated)), modify_health(Actor, 15))).

%% Exile Sentence
rule(exile_sentence, 'Exile Sentence', trigger, 10).
rule_description(exile_sentence, 'Characters who commit serious crimes in Haven Ridge are exiled beyond the walls.').
rule_category(exile_sentence, social).
rule_active(exile_sentence).
rule_condition(exile_sentence, (crime_committed(Actor, serious), resident(Actor, haven_ridge))).
rule_effect(exile_sentence, (retract(resident(Actor, haven_ridge)), assert(status(Actor, exiled)), move_to(Actor, wilderness))).
