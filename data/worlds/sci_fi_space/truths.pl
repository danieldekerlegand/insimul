%% Insimul Truths: Sci-Fi Space
%% Source: data/worlds/sci_fi_space/truths.pl
%% Created: 2026-04-03
%% Total: 18 truths
%%
%% Predicate schema:
%%   truth/3 -- truth(AtomId, Title, EntryType)
%%   truth_content/2, truth_importance/2, truth_timestep/2

%% FTL Travel
truth(ftl_travel, 'Faster-Than-Light Travel', technological_fact).
truth_content(ftl_travel, 'FTL jump drives allow interstellar travel by folding space. Jumps require precise navigation charts and massive energy. Miscalculated jumps can strand a ship in deep space.').
truth_importance(ftl_travel, 10).
truth_timestep(ftl_travel, 0).

%% Galactic Federation
truth(galactic_federation, 'The Galactic Federation', political_reality).
truth_content(galactic_federation, 'The Galactic Federation governs human space through elected representatives from each colony and station. It maintains a military fleet and enforces interstellar law.').
truth_importance(galactic_federation, 9).
truth_timestep(galactic_federation, 0).

%% Thassari Species
truth(thassari_species, 'The Thassari', cultural_norm).
truth_content(thassari_species, 'The Thassari are the first confirmed intelligent alien species. They are crystalline beings who communicate through bioluminescent patterns. They value trade and neutrality above all.').
truth_importance(thassari_species, 10).
truth_timestep(thassari_species, 0).

%% Vacuum Danger
truth(vacuum_danger, 'Vacuum Exposure', environmental_hazard).
truth_content(vacuum_danger, 'Exposure to hard vacuum kills within minutes. EVA suits are mandatory outside pressurized areas. Hull breaches are the most feared emergency on any station.').
truth_importance(vacuum_danger, 9).
truth_timestep(vacuum_danger, 0).

%% Station Hierarchy
truth(station_hierarchy, 'Station Hierarchy', social_rule).
truth_content(station_hierarchy, 'Nexus Prime operates on a military-civilian hybrid command structure. The Station Commander holds ultimate authority. Civilian councils handle domestic affairs but defer on security matters.').
truth_importance(station_hierarchy, 8).
truth_timestep(station_hierarchy, 0).

%% Artificial Gravity
truth(artificial_gravity, 'Artificial Gravity', technological_fact).
truth_content(artificial_gravity, 'Stations use centrifugal rotation to simulate gravity. Different rings may have different gravity levels. The Engineering Deck operates at 0.8G while the Command Ring maintains a full 1G.').
truth_importance(artificial_gravity, 7).
truth_timestep(artificial_gravity, 0).

%% Smuggling Problem
truth(smuggling_problem, 'Smuggling Networks', social_rule).
truth_content(smuggling_problem, 'Contraband flows through the Trade Ring despite security efforts. Illegal substances, unlicensed weapons, and stolen data are common black market goods. Smugglers use the Thassari Drift as a waypoint.').
truth_importance(smuggling_problem, 7).
truth_timestep(smuggling_problem, 0).

%% Colony Dependence
truth(colony_dependence, 'Colony Supply Dependence', economic_rule).
truth_content(colony_dependence, 'Frontier colonies like Kepler depend on regular supply runs from hub stations. A disrupted supply line can cause starvation within months. Colony self-sufficiency is the long-term goal.').
truth_importance(colony_dependence, 8).
truth_timestep(colony_dependence, 0).

%% Oxygen Rationing
truth(oxygen_rationing, 'Oxygen Management', environmental_hazard).
truth_content(oxygen_rationing, 'Breathable air is manufactured by station life support systems. Each resident has an oxygen allocation. Wasting air through careless airlock use is a punishable offense.').
truth_importance(oxygen_rationing, 8).
truth_timestep(oxygen_rationing, 0).

%% Neutral Zone
truth(neutral_zone, 'The Neutral Zone', political_reality).
truth_content(neutral_zone, 'The space between Federation and Thassari territory is designated neutral. It is governed by no single authority. Trading posts, smuggler havens, and derelict ships populate this lawless region.').
truth_importance(neutral_zone, 8).
truth_timestep(neutral_zone, 0).

%% Communication Lag
truth(comm_lag, 'Communication Delay', technological_fact).
truth_content(comm_lag, 'Real-time communication is only possible within a star system. Interstellar messages must be carried by courier ships or transmitted through relay beacons with significant delay.').
truth_importance(comm_lag, 7).
truth_timestep(comm_lag, 0).

%% AI Regulations
truth(ai_regulations, 'AI Regulations', social_rule).
truth_content(ai_regulations, 'Fully autonomous AI is heavily regulated by the Federation. Ship AI must have human oversight. Sentient AI development is banned after the Prometheus Incident of 2820.').
truth_importance(ai_regulations, 7).
truth_timestep(ai_regulations, 0).

%% Salvage Law
truth(salvage_law, 'Salvage Law', economic_rule).
truth_content(salvage_law, 'Derelict ships and abandoned stations may be claimed under Federation salvage law. The finder registers the claim at the nearest Arbitration Obelisk. Disputes are resolved by tribunal.').
truth_importance(salvage_law, 6).
truth_timestep(salvage_law, 0).

%% Hydroponics
truth(hydroponics, 'Hydroponic Agriculture', cultural_norm).
truth_content(hydroponics, 'All food on stations and colonies is grown hydroponically. Natural soil farming only exists on colony worlds. Fresh food from Kepler Colony is a luxury item on Nexus Prime.').
truth_importance(hydroponics, 7).
truth_timestep(hydroponics, 0).

%% Radiation in Space
truth(space_radiation, 'Space Radiation', environmental_hazard).
truth_content(space_radiation, 'Cosmic radiation is a constant threat outside shielded areas. Long-term exposure causes cellular damage. Station hulls incorporate radiation shielding, but EVA exposes crew to higher doses.').
truth_importance(space_radiation, 7).
truth_timestep(space_radiation, 0).

%% Credits Economy
truth(credits_economy, 'Federation Credits', economic_rule).
truth_content(credits_economy, 'Federation Credits are the standard digital currency in human space. They are backed by the Federations resource reserves. In the Neutral Zone, barter and Thassari crystals are preferred.').
truth_importance(credits_economy, 6).
truth_timestep(credits_economy, 0).

%% Thassari Trade Customs
truth(thassari_trade, 'Thassari Trade Customs', cultural_norm).
truth_content(thassari_trade, 'The Thassari consider trade a sacred act of mutual benefit. Deception in trade is the gravest insult. They seal agreements by exchanging a crystal shard, which serves as both contract and bond.').
truth_importance(thassari_trade, 8).
truth_timestep(thassari_trade, 0).

%% Emergency Protocols
truth(emergency_protocols, 'Emergency Protocols', social_rule).
truth_content(emergency_protocols, 'Station emergencies follow a color-coded system: Blue for medical, Red for hull breach, Yellow for fire, Black for hostile boarders. All residents must know evacuation routes to the nearest escape pod.').
truth_importance(emergency_protocols, 8).
truth_timestep(emergency_protocols, 0).
