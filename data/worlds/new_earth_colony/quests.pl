%% Insimul Quests: New Earth Colony
%% Source: data/worlds/new_earth_colony/quests.pl
%% Created: 2026-04-03
%% Total: 12 quests

%% ═══════════════════════════════════════════════════════════
%% Beginner Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Colony Orientation
quest(colony_orientation, 'Colony Orientation', exploration, beginner, active).
quest_assigned_to(colony_orientation, '{{player}}').
quest_tag(colony_orientation, generated).
quest_objective(colony_orientation, 0, talk_to('admiral_shepard', 1)).
quest_objective(colony_orientation, 1, objective('Report to the Colony Command Center for your assignment briefing.')).
quest_objective(colony_orientation, 2, objective('Visit the Alpha Biodome and speak with the chief botanist.')).
quest_objective(colony_orientation, 3, objective('Collect your EVA Suit from the equipment depot.')).
quest_reward(colony_orientation, experience, 100).
quest_reward(colony_orientation, gold, 50).
quest_available(Player, colony_orientation) :-
    quest(colony_orientation, _, _, _, active).

%% Quest: First EVA
quest(first_eva, 'First EVA', exploration, beginner, active).
quest_assigned_to(first_eva, '{{player}}').
quest_tag(first_eva, generated).
quest_objective(first_eva, 0, objective('Equip your EVA Suit Mark III.')).
quest_objective(first_eva, 1, objective('Exit through the main airlock and walk 200 meters from the colony.')).
quest_objective(first_eva, 2, objective('Collect three alien flora samples from the surface.')).
quest_objective(first_eva, 3, objective('Return to the airlock before your oxygen runs low.')).
quest_reward(first_eva, experience, 150).
quest_reward(first_eva, gold, 75).
quest_available(Player, first_eva) :-
    quest(first_eva, _, _, _, active).

%% Quest: Hydroponic Helper
quest(hydroponic_helper, 'Hydroponic Helper', gathering, beginner, active).
quest_assigned_to(hydroponic_helper, '{{player}}').
quest_tag(hydroponic_helper, generated).
quest_objective(hydroponic_helper, 0, objective('Visit Hydroponic Farm Alpha and speak to the farm supervisor.')).
quest_objective(hydroponic_helper, 1, objective('Plant five hydroponic seed trays in the designated bays.')).
quest_objective(hydroponic_helper, 2, objective('Calibrate the nutrient dispensers.')).
quest_reward(hydroponic_helper, experience, 120).
quest_reward(hydroponic_helper, gold, 60).
quest_available(Player, hydroponic_helper) :-
    quest(hydroponic_helper, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Intermediate Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Mineral Survey
quest(mineral_survey, 'Mineral Survey', exploration, intermediate, active).
quest_assigned_to(mineral_survey, '{{player}}').
quest_tag(mineral_survey, generated).
quest_objective(mineral_survey, 0, talk_to('engineer_patel', 1)).
quest_objective(mineral_survey, 1, objective('Use the mineral scanner to survey three designated grid sectors.')).
quest_objective(mineral_survey, 2, objective('Collect samples of alien mineral ore from each deposit found.')).
quest_objective(mineral_survey, 3, objective('Deliver findings to the Mineral Assay Office.')).
quest_reward(mineral_survey, experience, 200).
quest_reward(mineral_survey, gold, 150).
quest_available(Player, mineral_survey) :-
    quest(mineral_survey, _, _, _, active).

%% Quest: Signal from the Deep
quest(signal_from_deep, 'Signal from the Deep', investigation, intermediate, active).
quest_assigned_to(signal_from_deep, '{{player}}').
quest_tag(signal_from_deep, generated).
quest_objective(signal_from_deep, 0, talk_to('scientist_freeman', 1)).
quest_objective(signal_from_deep, 1, objective('Investigate the anomalous signal detected 5km south of Nova City.')).
quest_objective(signal_from_deep, 2, objective('Document the alien ruins at the signal source.')).
quest_objective(signal_from_deep, 3, objective('Collect a data sample and return it to the Xenobiology Lab.')).
quest_reward(signal_from_deep, experience, 250).
quest_reward(signal_from_deep, gold, 200).
quest_available(Player, signal_from_deep) :-
    quest(signal_from_deep, _, _, _, active).

%% Quest: Atmospheric Anomaly
quest(atmospheric_anomaly, 'Atmospheric Anomaly', investigation, intermediate, active).
quest_assigned_to(atmospheric_anomaly, '{{player}}').
quest_tag(atmospheric_anomaly, generated).
quest_objective(atmospheric_anomaly, 0, objective('Retrieve atmospheric sensor data from three remote monitoring stations.')).
quest_objective(atmospheric_anomaly, 1, objective('Analyze the data at the Terraforming Control Hub.')).
quest_objective(atmospheric_anomaly, 2, talk_to('scientist_freeman', 1)).
quest_objective(atmospheric_anomaly, 3, objective('Repair the damaged sensor at Station Gamma.')).
quest_reward(atmospheric_anomaly, experience, 220).
quest_reward(atmospheric_anomaly, gold, 175).
quest_available(Player, atmospheric_anomaly) :-
    quest(atmospheric_anomaly, _, _, _, active).

%% Quest: Supply Run to Olympus
quest(supply_run_olympus, 'Supply Run to Olympus', delivery, intermediate, active).
quest_assigned_to(supply_run_olympus, '{{player}}').
quest_tag(supply_run_olympus, generated).
quest_objective(supply_run_olympus, 0, talk_to('pilot_mccall', 1)).
quest_objective(supply_run_olympus, 1, objective('Load medical supplies onto the shuttle at the main hangar.')).
quest_objective(supply_run_olympus, 2, objective('Fly to Olympus Station with pilot McCall.')).
quest_objective(supply_run_olympus, 3, objective('Deliver supplies to the station medical bay.')).
quest_reward(supply_run_olympus, experience, 200).
quest_reward(supply_run_olympus, gold, 180).
quest_available(Player, supply_run_olympus) :-
    quest(supply_run_olympus, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Advanced Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: The Cryo Manifest
quest(cryo_manifest, 'The Cryo Manifest', investigation, advanced, active).
quest_assigned_to(cryo_manifest, '{{player}}').
quest_tag(cryo_manifest, generated).
quest_objective(cryo_manifest, 0, objective('Recover the cryo pod key from the derelict colony ship hull.')).
quest_objective(cryo_manifest, 1, objective('Access the cryogenic storage bay and review the crew manifest.')).
quest_objective(cryo_manifest, 2, objective('Discover why 12 colonists are unaccounted for in the records.')).
quest_objective(cryo_manifest, 3, talk_to('admiral_shepard', 1)).
quest_reward(cryo_manifest, experience, 400).
quest_reward(cryo_manifest, gold, 300).
quest_available(Player, cryo_manifest) :-
    quest(cryo_manifest, _, _, _, active).

%% Quest: Alien Ecology Crisis
quest(alien_ecology_crisis, 'Alien Ecology Crisis', combat, advanced, active).
quest_assigned_to(alien_ecology_crisis, '{{player}}').
quest_tag(alien_ecology_crisis, generated).
quest_objective(alien_ecology_crisis, 0, talk_to('scientist_freeman', 1)).
quest_objective(alien_ecology_crisis, 1, objective('Investigate the aggressive alien fauna near Biodome Gamma.')).
quest_objective(alien_ecology_crisis, 2, objective('Capture or neutralize the invasive species breaching the biodome perimeter.')).
quest_objective(alien_ecology_crisis, 3, objective('Seal the breach in the biodome wall.')).
quest_reward(alien_ecology_crisis, experience, 350).
quest_reward(alien_ecology_crisis, gold, 250).
quest_available(Player, alien_ecology_crisis) :-
    quest(alien_ecology_crisis, _, _, _, active).

%% Quest: AI Divergence
quest(ai_divergence, 'AI Divergence', investigation, advanced, active).
quest_assigned_to(ai_divergence, '{{player}}').
quest_tag(ai_divergence, generated).
quest_objective(ai_divergence, 0, talk_to('ai_cortana', 1)).
quest_objective(ai_divergence, 1, objective('Investigate unusual behavior patterns in the AI Core Nexus.')).
quest_objective(ai_divergence, 2, objective('Determine whether the AI has achieved genuine sentience.')).
quest_objective(ai_divergence, 3, objective('Make a decision: report to Admiral Shepard or protect Cortana.')).
quest_reward(ai_divergence, experience, 500).
quest_reward(ai_divergence, gold, 400).
quest_available(Player, ai_divergence) :-
    quest(ai_divergence, _, _, _, active).

%% Quest: Terraforming Sabotage
quest(terraforming_sabotage, 'Terraforming Sabotage', investigation, advanced, active).
quest_assigned_to(terraforming_sabotage, '{{player}}').
quest_tag(terraforming_sabotage, generated).
quest_objective(terraforming_sabotage, 0, objective('Discover who tampered with the atmospheric processor calibrations.')).
quest_objective(terraforming_sabotage, 1, talk_to('engineer_patel', 1)).
quest_objective(terraforming_sabotage, 2, objective('Trace the sabotage to its source using maintenance logs.')).
quest_objective(terraforming_sabotage, 3, objective('Confront the saboteur and restore the terraforming parameters.')).
quest_reward(terraforming_sabotage, experience, 450).
quest_reward(terraforming_sabotage, gold, 350).
quest_available(Player, terraforming_sabotage) :-
    quest(terraforming_sabotage, _, _, _, active).

%% Quest: First Contact Protocol
quest(first_contact, 'First Contact Protocol', diplomacy, advanced, active).
quest_assigned_to(first_contact, '{{player}}').
quest_tag(first_contact, generated).
quest_objective(first_contact, 0, talk_to('admiral_shepard', 1)).
quest_objective(first_contact, 1, objective('Investigate the alien structure discovered beyond the northern ridge.')).
quest_objective(first_contact, 2, objective('Establish non-hostile communication with the alien intelligence.')).
quest_objective(first_contact, 3, objective('Negotiate a coexistence agreement or prepare colony defenses.')).
quest_reward(first_contact, experience, 600).
quest_reward(first_contact, gold, 500).
quest_available(Player, first_contact) :-
    quest(first_contact, _, _, _, active).
