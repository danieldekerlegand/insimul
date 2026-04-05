%% Insimul Quests: Sci-Fi Space
%% Source: data/worlds/sci_fi_space/quests.pl
%% Created: 2026-04-03
%% Total: 12 quests

%% Quest: Station Orientation
quest(station_orientation, 'Station Orientation', exploration, beginner, active).
quest_assigned_to(station_orientation, '{{player}}').
quest_tag(station_orientation, generated).
quest_objective(station_orientation, 0, talk_to('elena_voss', 1)).
quest_objective(station_orientation, 1, objective('Tour the four rings of Nexus Prime Station.')).
quest_objective(station_orientation, 2, objective('Register at the Operations Center.')).
quest_reward(station_orientation, experience, 100).
quest_reward(station_orientation, gold, 50).
quest_available(Player, station_orientation) :-
    quest(station_orientation, _, _, _, active).

%% Quest: Engineering Apprentice
quest(engineering_apprentice, 'Engineering Apprentice', fetch, beginner, active).
quest_assigned_to(engineering_apprentice, '{{player}}').
quest_tag(engineering_apprentice, generated).
quest_objective(engineering_apprentice, 0, talk_to('jax_renn', 1)).
quest_objective(engineering_apprentice, 1, objective('Retrieve a replacement coupling from the supply depot.')).
quest_objective(engineering_apprentice, 2, objective('Help Jax install it in the reactor coolant system.')).
quest_reward(engineering_apprentice, experience, 120).
quest_reward(engineering_apprentice, gold, 60).
quest_available(Player, engineering_apprentice) :-
    quest(engineering_apprentice, _, _, _, active).

%% Quest: Cargo Inspection
quest(cargo_inspection, 'Cargo Inspection', exploration, beginner, active).
quest_assigned_to(cargo_inspection, '{{player}}').
quest_tag(cargo_inspection, generated).
quest_objective(cargo_inspection, 0, objective('Report to the docking bay for cargo duty.')).
quest_objective(cargo_inspection, 1, objective('Scan five incoming cargo containers for contraband.')).
quest_objective(cargo_inspection, 2, objective('Flag any suspicious shipments to security.')).
quest_reward(cargo_inspection, experience, 100).
quest_reward(cargo_inspection, gold, 50).
quest_available(Player, cargo_inspection) :-
    quest(cargo_inspection, _, _, _, active).

%% Quest: Medical Rounds
quest(medical_rounds, 'Medical Rounds', conversation, beginner, active).
quest_assigned_to(medical_rounds, '{{player}}').
quest_tag(medical_rounds, generated).
quest_objective(medical_rounds, 0, talk_to('marcus_voss', 1)).
quest_objective(medical_rounds, 1, objective('Deliver medi-gel supplies to three patients in the Habitation Ring.')).
quest_objective(medical_rounds, 2, objective('Report patient conditions back to Dr. Voss.')).
quest_reward(medical_rounds, experience, 110).
quest_reward(medical_rounds, gold, 55).
quest_available(Player, medical_rounds) :-
    quest(medical_rounds, _, _, _, active).

%% Quest: Alien Diplomacy
quest(alien_diplomacy, 'Alien Diplomacy', conversation, intermediate, active).
quest_assigned_to(alien_diplomacy, '{{player}}').
quest_tag(alien_diplomacy, generated).
quest_objective(alien_diplomacy, 0, talk_to('threx_ik_vaan', 1)).
quest_objective(alien_diplomacy, 1, objective('Learn Thassari greeting protocols.')).
quest_objective(alien_diplomacy, 2, objective('Mediate a trade dispute between a human merchant and Quorra Zenn.')).
quest_objective(alien_diplomacy, 3, talk_to('elena_voss', 1)).
quest_reward(alien_diplomacy, experience, 250).
quest_reward(alien_diplomacy, gold, 120).
quest_available(Player, alien_diplomacy) :-
    quest(alien_diplomacy, _, _, _, active).

%% Quest: Smugglers Trail
quest(smugglers_trail, 'Smugglers Trail', stealth, intermediate, active).
quest_assigned_to(smugglers_trail, '{{player}}').
quest_tag(smugglers_trail, generated).
quest_objective(smugglers_trail, 0, talk_to('lian_chen', 1)).
quest_objective(smugglers_trail, 1, objective('Investigate reports of contraband flowing through the Trade Ring.')).
quest_objective(smugglers_trail, 2, objective('Follow the trail to Dmitri Sorokins docking bay.')).
quest_objective(smugglers_trail, 3, objective('Decide whether to report or negotiate.')).
quest_reward(smugglers_trail, experience, 280).
quest_reward(smugglers_trail, gold, 150).
quest_available(Player, smugglers_trail) :-
    quest(smugglers_trail, _, _, _, active).

%% Quest: Colony Supply Run
quest(colony_supply_run, 'Colony Supply Run', escort, intermediate, active).
quest_assigned_to(colony_supply_run, '{{player}}').
quest_tag(colony_supply_run, generated).
quest_objective(colony_supply_run, 0, talk_to('amara_osei', 1)).
quest_objective(colony_supply_run, 1, objective('Load essential supplies for Kepler Colony.')).
quest_objective(colony_supply_run, 2, objective('Navigate the FTL jump to Kepler system.')).
quest_objective(colony_supply_run, 3, objective('Deliver supplies and assist with colony operations.')).
quest_reward(colony_supply_run, experience, 300).
quest_reward(colony_supply_run, gold, 160).
quest_available(Player, colony_supply_run) :-
    quest(colony_supply_run, _, _, _, active).

%% Quest: Xenobiology Field Study
quest(xeno_field_study, 'Xenobiology Field Study', exploration, intermediate, active).
quest_assigned_to(xeno_field_study, '{{player}}').
quest_tag(xeno_field_study, generated).
quest_objective(xeno_field_study, 0, talk_to('zara_okonkwo', 1)).
quest_objective(xeno_field_study, 1, objective('Collect biological samples from the Thassari Drift ecosystem.')).
quest_objective(xeno_field_study, 2, objective('Catalog three new species of micro-organisms.')).
quest_objective(xeno_field_study, 3, objective('Return samples to the research lab on Nexus Prime.')).
quest_reward(xeno_field_study, experience, 250).
quest_reward(xeno_field_study, gold, 130).
quest_available(Player, xeno_field_study) :-
    quest(xeno_field_study, _, _, _, active).

%% Quest: The Derelict Ship
quest(derelict_ship, 'The Derelict Ship', exploration, advanced, active).
quest_assigned_to(derelict_ship, '{{player}}').
quest_tag(derelict_ship, generated).
quest_objective(derelict_ship, 0, talk_to('sola_renn', 1)).
quest_objective(derelict_ship, 1, objective('Board an abandoned freighter drifting in the neutral zone.')).
quest_objective(derelict_ship, 2, objective('Restore emergency power to access the ship logs.')).
quest_objective(derelict_ship, 3, objective('Discover what happened to the crew.')).
quest_objective(derelict_ship, 4, objective('Escape before the reactor goes critical.')).
quest_reward(derelict_ship, experience, 450).
quest_reward(derelict_ship, gold, 250).
quest_available(Player, derelict_ship) :-
    quest(derelict_ship, _, _, _, active).

%% Quest: Salvage Rights
quest(salvage_rights, 'Salvage Rights', conversation, advanced, active).
quest_assigned_to(salvage_rights, '{{player}}').
quest_tag(salvage_rights, generated).
quest_objective(salvage_rights, 0, talk_to('zikri_maal', 1)).
quest_objective(salvage_rights, 1, objective('Negotiate salvage claims for a derelict warship.')).
quest_objective(salvage_rights, 2, objective('Compete against Dmitri Sorokin for the best components.')).
quest_objective(salvage_rights, 3, objective('Settle the dispute at the Arbitration Obelisk.')).
quest_reward(salvage_rights, experience, 400).
quest_reward(salvage_rights, gold, 200).
quest_available(Player, salvage_rights) :-
    quest(salvage_rights, _, _, _, active).

%% Quest: First Contact Protocol
quest(first_contact, 'First Contact Protocol', conversation, advanced, active).
quest_assigned_to(first_contact, '{{player}}').
quest_tag(first_contact, generated).
quest_objective(first_contact, 0, talk_to('elena_voss', 1)).
quest_objective(first_contact, 1, objective('Respond to a transmission from an unknown alien species.')).
quest_objective(first_contact, 2, objective('Establish basic communication protocols.')).
quest_objective(first_contact, 3, objective('Determine the intentions of the new species.')).
quest_objective(first_contact, 4, objective('Report findings to the Federation Council.')).
quest_reward(first_contact, experience, 500).
quest_reward(first_contact, gold, 300).
quest_available(Player, first_contact) :-
    quest(first_contact, _, _, _, active).

%% Quest: Kepler Harvest Crisis
quest(kepler_harvest, 'Kepler Harvest Crisis', fetch, advanced, active).
quest_assigned_to(kepler_harvest, '{{player}}').
quest_tag(kepler_harvest, generated).
quest_objective(kepler_harvest, 0, talk_to('silas_hargrove', 1)).
quest_objective(kepler_harvest, 1, objective('Diagnose the blight affecting Kepler Colony crops.')).
quest_objective(kepler_harvest, 2, talk_to('yuki_tanaka', 1)).
quest_objective(kepler_harvest, 3, objective('Synthesize a treatment using Thassari biological samples.')).
quest_objective(kepler_harvest, 4, objective('Apply the treatment before the colony starves.')).
quest_reward(kepler_harvest, experience, 450).
quest_reward(kepler_harvest, gold, 220).
quest_available(Player, kepler_harvest) :-
    quest(kepler_harvest, _, _, _, active).
