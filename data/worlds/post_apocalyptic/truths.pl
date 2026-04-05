%% Insimul Truths: Post-Apocalyptic Wasteland
%% Source: data/worlds/post_apocalyptic/truths.pl
%% Created: 2026-04-03
%% Total: 18 truths
%%
%% Predicate schema:
%%   truth/3 -- truth(AtomId, Title, EntryType)
%%   truth_content/2, truth_importance/2, truth_timestep/2

%% Water is Currency
truth(water_is_currency, 'Water is Currency', economic_rule).
truth_content(water_is_currency, 'Clean water is the most valuable commodity in the wasteland. Trade tokens in Haven Ridge are pegged to water units. Whoever controls water controls survival.').
truth_importance(water_is_currency, 10).
truth_timestep(water_is_currency, 0).

%% Radiation Zones
truth(radiation_zones, 'Radiation Zones', environmental_hazard).
truth_content(radiation_zones, 'Large swathes of the landscape remain irradiated from the nuclear exchange. Exposure without a gas mask or rad-away tablets causes sickness within hours and death within days.').
truth_importance(radiation_zones, 10).
truth_timestep(radiation_zones, 0).

%% Scavenging Law
truth(scavenging_law, 'Scavenging Law', social_rule).
truth_content(scavenging_law, 'In Haven Ridge, all salvage must be declared at the Scrap Quarter. Elias Mercer takes a ten percent tithe for community use. Hoarding is punishable by exile.').
truth_importance(scavenging_law, 8).
truth_timestep(scavenging_law, 0).

%% Raider Threat
truth(raider_threat, 'Raider Threat', political_reality).
truth_content(raider_threat, 'The Iron Fang raiders under Vex Thornton control Dead Valley and extort travelers. They raid poorly defended settlements for supplies, weapons, and captives.').
truth_importance(raider_threat, 9).
truth_timestep(raider_threat, 0).

%% Mutant Wildlife
truth(mutant_wildlife, 'Mutant Wildlife', environmental_hazard).
truth_content(mutant_wildlife, 'Radiation has spawned aggressive mutant creatures in the wasteland. They are territorial, unpredictable, and often venomous. Their hides are prized for armor crafting.').
truth_importance(mutant_wildlife, 8).
truth_timestep(mutant_wildlife, 0).

%% Pre-War Technology
truth(pre_war_tech, 'Pre-War Technology', cultural_norm).
truth_content(pre_war_tech, 'Functional pre-war technology is revered and hoarded. A working radio, a charged fusion cell, or an intact computer terminal can make a person wealthy overnight.').
truth_importance(pre_war_tech, 8).
truth_timestep(pre_war_tech, 0).

%% Medicine Scarcity
truth(medicine_scarcity, 'Medicine Scarcity', social_rule).
truth_content(medicine_scarcity, 'Antibiotics and surgical tools are nearly extinct. Healers rely on herbal remedies and salvaged veterinary supplies. Doc Harlan and Petra Volkov are among the few trained medics.').
truth_importance(medicine_scarcity, 9).
truth_timestep(medicine_scarcity, 0).

%% Community Defense
truth(community_defense, 'Community Defense', social_rule).
truth_content(community_defense, 'Every able-bodied adult in Haven Ridge serves rotating militia shifts. The Great Wall is manned day and night. Failing to serve your shift means reduced rations.').
truth_importance(community_defense, 8).
truth_timestep(community_defense, 0).

%% The Collapse
truth(the_collapse, 'The Collapse', historical_fact).
truth_content(the_collapse, 'The nuclear exchange of 2029 destroyed most major cities and governments. The survivors call it the Collapse. Nobody agrees on who fired first, and it no longer matters.').
truth_importance(the_collapse, 10).
truth_timestep(the_collapse, 0).

%% Trust is Earned
truth(trust_is_earned, 'Trust is Earned', social_rule).
truth_content(trust_is_earned, 'Strangers are met with suspicion. Trust must be earned through actions, not words. Betraying a settlements trust means permanent exile or worse.').
truth_importance(trust_is_earned, 7).
truth_timestep(trust_is_earned, 0).

%% Barter Economy
truth(barter_economy, 'Barter Economy', economic_rule).
truth_content(barter_economy, 'Money has no value. Everything runs on barter -- food for labor, scrap for medicine, bullets for protection. Skilled negotiators thrive in this economy.').
truth_importance(barter_economy, 8).
truth_timestep(barter_economy, 0).

%% Night Travel Forbidden
truth(night_travel, 'Night Travel Forbidden', social_rule).
truth_content(night_travel, 'Traveling after dark is extremely dangerous. Mutant predators hunt at night, raiders set ambushes, and radiation fog rolls in unpredictably. Settlements lock their gates at sundown.').
truth_importance(night_travel, 7).
truth_timestep(night_travel, 0).

%% Food Growing
truth(food_growing, 'Food Growing', cultural_norm).
truth_content(food_growing, 'Greenhouses are the key to long-term survival. Growing food in controlled environments shields crops from radiation. Greenhouse keepers like Lina Okafor are vital to any settlement.').
truth_importance(food_growing, 8).
truth_timestep(food_growing, 0).

%% Radio Communication
truth(radio_communication, 'Radio Communication', cultural_norm).
truth_content(radio_communication, 'Radio is the only long-distance communication. Silas Kane monitors frequencies for trade offers, distress calls, and raider movements. Jamming a frequency is an act of war.').
truth_importance(radio_communication, 7).
truth_timestep(radio_communication, 0).

%% Exile Punishment
truth(exile_punishment, 'Exile Punishment', social_rule).
truth_content(exile_punishment, 'The harshest punishment in Haven Ridge is exile -- being cast out beyond the walls with nothing. In the wasteland, exile is often a death sentence.').
truth_importance(exile_punishment, 7).
truth_timestep(exile_punishment, 0).

%% Salvage Rights
truth(salvage_rights, 'Salvage Rights', economic_rule).
truth_content(salvage_rights, 'Whoever finds a salvage site first has exclusive rights for 30 days. Claim markers are placed at discovered ruins. Violating a claim invites violent retaliation.').
truth_importance(salvage_rights, 6).
truth_timestep(salvage_rights, 0).

%% Children are Protected
truth(children_protected, 'Children are Protected', social_rule).
truth_content(children_protected, 'Children are the future of every settlement and are fiercely protected. Harming a child is the one crime that all factions agree deserves death. Education is mandatory in Haven Ridge.').
truth_importance(children_protected, 9).
truth_timestep(children_protected, 0).

%% The Pit
truth(the_pit, 'The Pit', cultural_norm).
truth_content(the_pit, 'The Iron Fang Stronghold settles disputes through pit fighting. Combatants fight until submission or death. Winning earns respect and better rations. Outsiders can challenge for safe passage.').
truth_importance(the_pit, 6).
truth_timestep(the_pit, 0).
