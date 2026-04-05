%% Insimul Quests: Greek Mythological World
%% Source: data/worlds/mythological/quests.pl
%% Created: 2026-04-03
%% Total: 12 quests

%% ===============================================================
%% Beginner Quests
%% ===============================================================

%% Quest: Offering to the Gods
quest(offering_to_gods, 'Offering to the Gods', spiritual, beginner, active).
quest_assigned_to(offering_to_gods, '{{player}}').
quest_tag(offering_to_gods, generated).
quest_objective(offering_to_gods, 0, objective('Visit the Temple of Apollo in the Temple Quarter.')).
quest_objective(offering_to_gods, 1, talk_to('hierophantes_apollonides', 1)).
quest_objective(offering_to_gods, 2, objective('Obtain a sacrificial lamb and a clay amphora of wine.')).
quest_objective(offering_to_gods, 3, objective('Make a proper offering at the Great Altar of Zeus.')).
quest_reward(offering_to_gods, experience, 100).
quest_reward(offering_to_gods, gold, 50).
quest_available(Player, offering_to_gods) :-
    quest(offering_to_gods, _, _, _, active).

%% Quest: The Agora Market
quest(agora_market, 'The Agora Market', exploration, beginner, active).
quest_assigned_to(agora_market, '{{player}}').
quest_tag(agora_market, generated).
quest_objective(agora_market, 0, objective('Explore the Agora District of Theopolis.')).
quest_objective(agora_market, 1, objective('Buy a bronze xiphos from a weapons merchant.')).
quest_objective(agora_market, 2, objective('Listen to a philosopher speak at the Bronze Lion Fountain.')).
quest_reward(agora_market, experience, 100).
quest_reward(agora_market, gold, 40).
quest_reward(agora_market, item, bronze_xiphos).
quest_available(Player, agora_market) :-
    quest(agora_market, _, _, _, active).

%% Quest: Warrior Training
quest(warrior_training, 'Warrior Training', combat, beginner, active).
quest_assigned_to(warrior_training, '{{player}}').
quest_tag(warrior_training, generated).
quest_objective(warrior_training, 0, objective('Travel to Heraclea and find the training grounds.')).
quest_objective(warrior_training, 1, talk_to('peleus_myrmidon', 1)).
quest_objective(warrior_training, 2, objective('Complete three combat drills under Peleus instruction.')).
quest_objective(warrior_training, 3, objective('Spar with Achilleos Myrmidon.')).
quest_reward(warrior_training, experience, 120).
quest_reward(warrior_training, gold, 60).
quest_available(Player, warrior_training) :-
    quest(warrior_training, _, _, _, active).

%% ===============================================================
%% Intermediate Quests
%% ===============================================================

%% Quest: The Oracle Speaks
quest(oracle_speaks, 'The Oracle Speaks', spiritual, intermediate, active).
quest_assigned_to(oracle_speaks, '{{player}}').
quest_tag(oracle_speaks, generated).
quest_objective(oracle_speaks, 0, objective('Journey to Delphinion through the sacred valley.')).
quest_objective(oracle_speaks, 1, objective('Bring an offering of wine and a laurel crown to the Oracle Cave.')).
quest_objective(oracle_speaks, 2, talk_to('pythia_mantike', 1)).
quest_objective(oracle_speaks, 3, objective('Interpret the cryptic prophecy given by the Pythia.')).
quest_reward(oracle_speaks, experience, 250).
quest_reward(oracle_speaks, gold, 100).
quest_reward(oracle_speaks, item, prophecy_tablet).
quest_available(Player, oracle_speaks) :-
    quest(oracle_speaks, _, _, _, active).

%% Quest: The Labyrinth Trial
quest(labyrinth_trial, 'The Labyrinth Trial', exploration, intermediate, active).
quest_assigned_to(labyrinth_trial, '{{player}}').
quest_tag(labyrinth_trial, generated).
quest_objective(labyrinth_trial, 0, talk_to('daidalos_technites', 1)).
quest_objective(labyrinth_trial, 1, objective('Obtain the Thread of Ariadne from the craftsman.')).
quest_objective(labyrinth_trial, 2, objective('Enter the labyrinth beneath Theopolis.')).
quest_objective(labyrinth_trial, 3, objective('Navigate to the center and retrieve the hidden relic.')).
quest_reward(labyrinth_trial, experience, 280).
quest_reward(labyrinth_trial, gold, 150).
quest_reward(labyrinth_trial, item, thread_of_ariadne).
quest_available(Player, labyrinth_trial) :-
    quest(labyrinth_trial, _, _, _, active).

%% Quest: The Sacred Grove
quest(sacred_grove, 'The Sacred Grove', gathering, intermediate, active).
quest_assigned_to(sacred_grove, '{{player}}').
quest_tag(sacred_grove, generated).
quest_objective(sacred_grove, 0, objective('Find the sacred grove on the outskirts of Heraclea.')).
quest_objective(sacred_grove, 1, talk_to('chloris_dryad', 1)).
quest_objective(sacred_grove, 2, objective('Prove your respect for nature by clearing the grove of corruption.')).
quest_objective(sacred_grove, 3, objective('Receive Chloris blessing and a rare Moly herb.')).
quest_reward(sacred_grove, experience, 250).
quest_reward(sacred_grove, gold, 80).
quest_reward(sacred_grove, item, moly_herb).
quest_available(Player, sacred_grove) :-
    quest(sacred_grove, _, _, _, active).

%% Quest: The Hunt with Orion
quest(hunt_with_orion, 'The Hunt with Orion', combat, intermediate, active).
quest_assigned_to(hunt_with_orion, '{{player}}').
quest_tag(hunt_with_orion, generated).
quest_objective(hunt_with_orion, 0, talk_to('orion_artemision', 1)).
quest_objective(hunt_with_orion, 1, objective('Track the great boar through the wilderness frontier.')).
quest_objective(hunt_with_orion, 2, objective('Set traps and corner the beast near the river.')).
quest_objective(hunt_with_orion, 3, objective('Bring down the boar and present it to the people of Heraclea.')).
quest_reward(hunt_with_orion, experience, 300).
quest_reward(hunt_with_orion, gold, 120).
quest_available(Player, hunt_with_orion) :-
    quest(hunt_with_orion, _, _, _, active).

%% Quest: Athena Favor
quest(athena_favor, 'Athena Favor', spiritual, intermediate, active).
quest_assigned_to(athena_favor, '{{player}}').
quest_tag(athena_favor, generated).
quest_objective(athena_favor, 0, talk_to('korinna_hiereia', 1)).
quest_objective(athena_favor, 1, objective('Solve three riddles posed by the priestess of Athena.')).
quest_objective(athena_favor, 2, objective('Retrieve a scroll of ancient wisdom from the harbor merchants.')).
quest_objective(athena_favor, 3, objective('Present the scroll at the temple and receive Athena blessing.')).
quest_reward(athena_favor, experience, 250).
quest_reward(athena_favor, gold, 100).
quest_reward(athena_favor, item, olive_wreath).
quest_available(Player, athena_favor) :-
    quest(athena_favor, _, _, _, active).

%% ===============================================================
%% Advanced Quests
%% ===============================================================

%% Quest: The Golden Fleece
quest(golden_fleece_quest, 'The Golden Fleece', exploration, advanced, active).
quest_assigned_to(golden_fleece_quest, '{{player}}').
quest_tag(golden_fleece_quest, generated).
quest_objective(golden_fleece_quest, 0, talk_to('theseus_aegides', 1)).
quest_objective(golden_fleece_quest, 1, objective('Assemble a crew of heroes at the Harbor Ward.')).
quest_objective(golden_fleece_quest, 2, objective('Sail beyond the Aegean to the isle where the fleece is guarded.')).
quest_objective(golden_fleece_quest, 3, objective('Overcome the sleepless guardian serpent.')).
quest_objective(golden_fleece_quest, 4, objective('Return the Golden Fleece to Theopolis.')).
quest_reward(golden_fleece_quest, experience, 500).
quest_reward(golden_fleece_quest, gold, 300).
quest_reward(golden_fleece_quest, item, golden_fleece).
quest_available(Player, golden_fleece_quest) :-
    quest(golden_fleece_quest, _, _, _, active).

%% Quest: Descent to the Underworld
quest(descent_underworld, 'Descent to the Underworld', spiritual, advanced, active).
quest_assigned_to(descent_underworld, '{{player}}').
quest_tag(descent_underworld, generated).
quest_objective(descent_underworld, 0, talk_to('pythia_mantike', 1)).
quest_objective(descent_underworld, 1, objective('Find the entrance to the Underworld near Delphinion.')).
quest_objective(descent_underworld, 2, objective('Cross the River Styx by paying Charon the ferryman.')).
quest_objective(descent_underworld, 3, objective('Petition Hades for the release of a trapped soul.')).
quest_objective(descent_underworld, 4, objective('Return to the surface without looking back.')).
quest_reward(descent_underworld, experience, 500).
quest_reward(descent_underworld, gold, 250).
quest_reward(descent_underworld, item, styx_water).
quest_available(Player, descent_underworld) :-
    quest(descent_underworld, _, _, _, active).

%% Quest: The Curse of Tantalos
quest(curse_of_tantalos, 'The Curse of Tantalos', mystery, advanced, active).
quest_assigned_to(curse_of_tantalos, '{{player}}').
quest_tag(curse_of_tantalos, generated).
quest_objective(curse_of_tantalos, 0, talk_to('tantalos_pelopides', 1)).
quest_objective(curse_of_tantalos, 1, objective('Investigate the nature of the curse afflicting the Pelopides family.')).
quest_objective(curse_of_tantalos, 2, talk_to('niobe_pelopides', 1)).
quest_objective(curse_of_tantalos, 3, objective('Seek divine guidance from Hierophantes on how to lift the curse.')).
quest_objective(curse_of_tantalos, 4, objective('Complete the atonement ritual at the Great Altar of Zeus.')).
quest_reward(curse_of_tantalos, experience, 450).
quest_reward(curse_of_tantalos, gold, 200).
quest_available(Player, curse_of_tantalos) :-
    quest(curse_of_tantalos, _, _, _, active).

%% Quest: Wings of Ikaros
quest(wings_of_ikaros, 'Wings of Ikaros', crafting, advanced, active).
quest_assigned_to(wings_of_ikaros, '{{player}}').
quest_tag(wings_of_ikaros, generated).
quest_objective(wings_of_ikaros, 0, talk_to('daidalos_technites', 1)).
quest_objective(wings_of_ikaros, 1, objective('Gather feathers, wax, and celestial bronze for the wings.')).
quest_objective(wings_of_ikaros, 2, objective('Help Daidalos construct a pair of wings in his workshop.')).
quest_objective(wings_of_ikaros, 3, objective('Convince Ikaros to fly cautiously during the test flight.')).
quest_objective(wings_of_ikaros, 4, objective('Save Ikaros when he flies too close to the sun.')).
quest_reward(wings_of_ikaros, experience, 500).
quest_reward(wings_of_ikaros, gold, 250).
quest_reward(wings_of_ikaros, item, winged_sandals).
quest_available(Player, wings_of_ikaros) :-
    quest(wings_of_ikaros, _, _, _, active).
