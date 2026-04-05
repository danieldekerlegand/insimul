%% Insimul Truths: New Earth Colony
%% Source: data/worlds/new_earth_colony/truths.pl
%% Created: 2026-04-03
%% Total: 18 truths
%%
%% Predicate schema:
%%   truth/3 -- truth(AtomId, Title, EntryType)
%%   truth_content/2, truth_importance/2, truth_timestep/2

%% Biodome Dependency
truth(biodome_dependency, 'Biodome Dependency', environmental_fact).
truth_content(biodome_dependency, 'All agriculture on New Earth occurs within sealed biodomes. The alien atmosphere is toxic to Earth crops without filtration. Biodome failure means famine within weeks.').
truth_importance(biodome_dependency, 10).
truth_timestep(biodome_dependency, 0).

%% Terraforming Timeline
truth(terraforming_timeline, 'Terraforming Timeline', environmental_fact).
truth_content(terraforming_timeline, 'Full atmospheric terraforming is estimated to take 200 years. Current progress is at 8 percent. The atmospheric processors run continuously converting alien gases to breathable air.').
truth_importance(terraforming_timeline, 9).
truth_timestep(terraforming_timeline, 0).

%% Alien Ecology
truth(alien_ecology, 'Alien Ecology', environmental_fact).
truth_content(alien_ecology, 'The planet hosts a thriving alien ecosystem with bioluminescent flora and silicon-based fauna. Most species are docile but some apex predators pose serious threats to EVA teams.').
truth_importance(alien_ecology, 8).
truth_timestep(alien_ecology, 0).

%% EVA Protocol
truth(eva_protocol, 'EVA Protocol', colony_regulation).
truth_content(eva_protocol, 'No colonist may exit the biodome perimeter without an EVA suit and a registered buddy. All surface excursions must be logged with Colony Command. Violation carries severe penalties.').
truth_importance(eva_protocol, 9).
truth_timestep(eva_protocol, 0).

%% Colony Hierarchy
truth(colony_hierarchy, 'Colony Hierarchy', social_structure).
truth_content(colony_hierarchy, 'The colony operates under a military-civilian dual command structure. Admiral Shepard leads defense and external affairs. A civilian council manages internal governance and resource allocation.').
truth_importance(colony_hierarchy, 8).
truth_timestep(colony_hierarchy, 0).

%% AI Rights Debate
truth(ai_rights_debate, 'AI Rights Debate', social_issue).
truth_content(ai_rights_debate, 'Sentient AI systems like Cortana AI-7 exist in a legal gray area. The Earth Alliance has not recognized AI personhood. Some colonists advocate for AI rights while others fear machine autonomy.').
truth_importance(ai_rights_debate, 7).
truth_timestep(ai_rights_debate, 0).

%% Protein Synthesis
truth(protein_synthesis, 'Protein Synthesis', technology_fact).
truth_content(protein_synthesis, 'Meat and dairy are not available. All protein comes from algae farms and insect cultivation within the biodomes. Synth-protein rations are nutritionally complete but bland.').
truth_importance(protein_synthesis, 7).
truth_timestep(protein_synthesis, 0).

%% Radiation Exposure
truth(radiation_exposure, 'Radiation Exposure', environmental_hazard).
truth_content(radiation_exposure, 'The planet lacks a strong magnetic field. Solar radiation on the surface is 3x Earth normal. Extended EVA operations require lead-lined suits and regular dosimeter checks.').
truth_importance(radiation_exposure, 9).
truth_timestep(radiation_exposure, 0).

%% FTL Communication Delay
truth(ftl_comm_delay, 'FTL Communication Delay', technology_fact).
truth_content(ftl_comm_delay, 'Messages to Earth take approximately 6 weeks via FTL relay buoys. The colony must make most decisions autonomously. Supply ships arrive once every 18 months.').
truth_importance(ftl_comm_delay, 8).
truth_timestep(ftl_comm_delay, 0).

%% Water Scarcity
truth(water_scarcity, 'Water Scarcity', environmental_fact).
truth_content(water_scarcity, 'All water is recycled through reclamation plants. The planet has subsurface ice deposits but extracting them requires energy-intensive drilling. Water waste is a punishable offense.').
truth_importance(water_scarcity, 8).
truth_timestep(water_scarcity, 0).

%% Colony Ship Remnants
truth(colony_ship_remnants, 'Colony Ship Remnants', historical_fact).
truth_content(colony_ship_remnants, 'The original colony ship, the ESS Endeavour, was partially dismantled to build the first structures. Its hull still sits on the plains east of Nova City, a monument to the founding generation.').
truth_importance(colony_ship_remnants, 6).
truth_timestep(colony_ship_remnants, 0).

%% Mars Collective Tensions
truth(mars_tensions, 'Mars Collective Tensions', political_fact).
truth_content(mars_tensions, 'Olympus Station was established by the Mars Collective, a rival faction to the Earth Alliance. Tensions between the two settlements simmer over mining rights and territorial claims.').
truth_importance(mars_tensions, 7).
truth_timestep(mars_tensions, 0).

%% Generation Gap
truth(generation_gap, 'Generation Gap', social_issue).
truth_content(generation_gap, 'Children born on New Earth have never seen the home planet. They consider the colony their true home. Tensions exist between Earth-born colonists who dream of return and planet-born who want to build here.').
truth_importance(generation_gap, 6).
truth_timestep(generation_gap, 0).

%% Mineral Wealth
truth(mineral_wealth, 'Mineral Wealth', economic_fact).
truth_content(mineral_wealth, 'The planet is rich in rare minerals not found on Earth, including crystalline formations with potential energy applications. Mining these resources is the primary economic justification for the colony.').
truth_importance(mineral_wealth, 7).
truth_timestep(mineral_wealth, 0).

%% Cryosleep Side Effects
truth(cryosleep_effects, 'Cryosleep Side Effects', medical_fact).
truth_content(cryosleep_effects, 'Original colonists who spent decades in cryosleep report memory gaps, vivid nightmares, and occasional dissociative episodes. The medical bay monitors all first-generation colonists for cryo syndrome.').
truth_importance(cryosleep_effects, 6).
truth_timestep(cryosleep_effects, 0).

%% Fusion Power
truth(fusion_power, 'Fusion Power', technology_fact).
truth_content(fusion_power, 'The colony runs on compact fusion reactors. Fuel is derived from deuterium extracted from subsurface ice. Power rationing occurs during solar storm events when reactors must be throttled.').
truth_importance(fusion_power, 8).
truth_timestep(fusion_power, 0).

%% Alien Ruins
truth(alien_ruins, 'Alien Ruins', discovery_fact).
truth_content(alien_ruins, 'Ancient alien structures have been discovered 5km south of Nova City. Their builders are long gone but the technology within appears to still function. Study of these ruins is classified at the highest level.').
truth_importance(alien_ruins, 9).
truth_timestep(alien_ruins, 0).

%% Gravity Differential
truth(gravity_differential, 'Gravity Differential', environmental_fact).
truth_content(gravity_differential, 'Surface gravity is 0.85g, slightly less than Earth. Long-term residents develop reduced bone density. All colonists must complete daily exercise in the gravity-enhanced training ring.').
truth_importance(gravity_differential, 7).
truth_timestep(gravity_differential, 0).
