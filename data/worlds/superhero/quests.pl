%% Insimul Quests: Superhero
%% Source: data/worlds/superhero/quests.pl
%% Created: 2026-04-03
%% Total: 12 quests

%% ═══════════════════════════════════════════════════════════
%% Beginner Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: First Patrol
quest(first_patrol, 'First Patrol', exploration, beginner, active).
quest_assigned_to(first_patrol, '{{player}}').
quest_tag(first_patrol, generated).
quest_objective(first_patrol, 0, talk_to('marcus_cole', 1)).
quest_objective(first_patrol, 1, objective('Patrol Midtown and report any suspicious activity.')).
quest_objective(first_patrol, 2, objective('Stop a petty theft in progress.')).
quest_reward(first_patrol, experience, 100).
quest_reward(first_patrol, gold, 50).
quest_available(Player, first_patrol) :-
    quest(first_patrol, _, _, _, active).

%% Quest: Press Pass
quest(press_pass, 'Press Pass', social, beginner, active).
quest_assigned_to(press_pass, '{{player}}').
quest_tag(press_pass, generated).
quest_objective(press_pass, 0, talk_to('nora_vance', 1)).
quest_objective(press_pass, 1, objective('Gather eyewitness accounts of the last metahuman incident.')).
quest_objective(press_pass, 2, objective('Return the notes to Nora at the Daily Sentinel.')).
quest_reward(press_pass, experience, 80).
quest_reward(press_pass, gold, 40).
quest_available(Player, press_pass) :-
    quest(press_pass, _, _, _, active).

%% Quest: Diner Dilemma
quest(diner_dilemma, 'Diner Dilemma', social, beginner, active).
quest_assigned_to(diner_dilemma, '{{player}}').
quest_tag(diner_dilemma, generated).
quest_objective(diner_dilemma, 0, talk_to('rosa_delgado', 1)).
quest_objective(diner_dilemma, 1, objective('Help Rosa deal with thugs shaking down local businesses.')).
quest_objective(diner_dilemma, 2, objective('Report the extortion to Detective Morrow.')).
quest_reward(diner_dilemma, experience, 100).
quest_reward(diner_dilemma, gold, 60).
quest_available(Player, diner_dilemma) :-
    quest(diner_dilemma, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Intermediate Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Dock Smugglers
quest(dock_smugglers, 'Dock Smugglers', investigation, intermediate, active).
quest_assigned_to(dock_smugglers, '{{player}}').
quest_tag(dock_smugglers, generated).
quest_objective(dock_smugglers, 0, talk_to('frank_morrow', 1)).
quest_objective(dock_smugglers, 1, objective('Investigate unusual shipments at Harbor Freight Warehouse.')).
quest_objective(dock_smugglers, 2, objective('Gather evidence of the smuggling operation.')).
quest_objective(dock_smugglers, 3, objective('Confront or report the smugglers.')).
quest_reward(dock_smugglers, experience, 250).
quest_reward(dock_smugglers, gold, 120).
quest_available(Player, dock_smugglers) :-
    quest(dock_smugglers, _, _, _, active).

%% Quest: The Narrows Vigilante
quest(narrows_vigilante, 'The Narrows Vigilante', investigation, intermediate, active).
quest_assigned_to(narrows_vigilante, '{{player}}').
quest_tag(narrows_vigilante, generated).
quest_objective(narrows_vigilante, 0, objective('Investigate reports of a masked vigilante in The Narrows.')).
quest_objective(narrows_vigilante, 1, talk_to('hector_ruiz', 1)).
quest_objective(narrows_vigilante, 2, objective('Track down the vigilante and determine if they are friend or foe.')).
quest_reward(narrows_vigilante, experience, 250).
quest_reward(narrows_vigilante, gold, 100).
quest_available(Player, narrows_vigilante) :-
    quest(narrows_vigilante, _, _, _, active).

%% Quest: Lab Break-In
quest(lab_break_in, 'Lab Break-In', combat, intermediate, active).
quest_assigned_to(lab_break_in, '{{player}}').
quest_tag(lab_break_in, generated).
quest_objective(lab_break_in, 0, talk_to('james_kepler', 1)).
quest_objective(lab_break_in, 1, objective('Respond to the break-in alarm at Kepler Dynamics.')).
quest_objective(lab_break_in, 2, objective('Prevent the theft of prototype technology.')).
quest_objective(lab_break_in, 3, objective('Identify the mastermind behind the heist.')).
quest_reward(lab_break_in, experience, 300).
quest_reward(lab_break_in, gold, 150).
quest_available(Player, lab_break_in) :-
    quest(lab_break_in, _, _, _, active).

%% Quest: Underground Fight Ring
quest(fight_ring, 'Underground Fight Ring', combat, intermediate, active).
quest_assigned_to(fight_ring, '{{player}}').
quest_tag(fight_ring, generated).
quest_objective(fight_ring, 0, objective('Infiltrate The Pit on Grimm Street.')).
quest_objective(fight_ring, 1, objective('Win three fights to gain the organizer trust.')).
quest_objective(fight_ring, 2, objective('Discover the illegal metahuman experimentation link.')).
quest_reward(fight_ring, experience, 280).
quest_reward(fight_ring, gold, 140).
quest_available(Player, fight_ring) :-
    quest(fight_ring, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Advanced Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Overlord Rising
quest(overlord_rising, 'Overlord Rising', combat, advanced, active).
quest_assigned_to(overlord_rising, '{{player}}').
quest_tag(overlord_rising, generated).
quest_objective(overlord_rising, 0, talk_to('marcus_cole', 1)).
quest_objective(overlord_rising, 1, objective('Track Victor Graves to his Ironhaven hideout.')).
quest_objective(overlord_rising, 2, objective('Disable the power dampener field around Sub-Level Nine.')).
quest_objective(overlord_rising, 3, objective('Defeat Overlord and prevent his doomsday device activation.')).
quest_reward(overlord_rising, experience, 500).
quest_reward(overlord_rising, gold, 300).
quest_available(Player, overlord_rising) :-
    quest(overlord_rising, _, _, _, active).

%% Quest: Toxic Outbreak
quest(toxic_outbreak, 'Toxic Outbreak', combat, advanced, active).
quest_assigned_to(toxic_outbreak, '{{player}}').
quest_tag(toxic_outbreak, generated).
quest_objective(toxic_outbreak, 0, talk_to('raymond_cho', 1)).
quest_objective(toxic_outbreak, 1, objective('Trace the mutagenic toxin released in The Docks.')).
quest_objective(toxic_outbreak, 2, objective('Find and neutralize Dr. Mara Vex chemical lab.')).
quest_objective(toxic_outbreak, 3, objective('Distribute the antidote to affected civilians.')).
quest_reward(toxic_outbreak, experience, 450).
quest_reward(toxic_outbreak, gold, 250).
quest_available(Player, toxic_outbreak) :-
    quest(toxic_outbreak, _, _, _, active).

%% Quest: Quantum Rift
quest(quantum_rift, 'Quantum Rift', exploration, advanced, active).
quest_assigned_to(quantum_rift, '{{player}}').
quest_tag(quantum_rift, generated).
quest_objective(quantum_rift, 0, talk_to('sasha_orlov', 1)).
quest_objective(quantum_rift, 1, objective('Investigate the spatial anomaly above the Tech Quarter.')).
quest_objective(quantum_rift, 2, objective('Collect three quantum shards from the rift perimeter.')).
quest_objective(quantum_rift, 3, objective('Seal the rift before it destabilizes the entire district.')).
quest_reward(quantum_rift, experience, 600).
quest_reward(quantum_rift, gold, 400).
quest_available(Player, quantum_rift) :-
    quest(quantum_rift, _, _, _, active).

%% Quest: Asylum Breakout
quest(asylum_breakout, 'Asylum Breakout', combat, advanced, active).
quest_assigned_to(asylum_breakout, '{{player}}').
quest_tag(asylum_breakout, generated).
quest_objective(asylum_breakout, 0, objective('Respond to the mass breakout at Ironhaven Asylum.')).
quest_objective(asylum_breakout, 1, objective('Recapture three escaped metahuman criminals.')).
quest_objective(asylum_breakout, 2, objective('Discover who orchestrated the breakout from inside.')).
quest_objective(asylum_breakout, 3, talk_to('frank_morrow', 1)).
quest_reward(asylum_breakout, experience, 500).
quest_reward(asylum_breakout, gold, 280).
quest_available(Player, asylum_breakout) :-
    quest(asylum_breakout, _, _, _, active).

%% Quest: Secret Identity Exposed
quest(identity_exposed, 'Secret Identity Exposed', social, advanced, active).
quest_assigned_to(identity_exposed, '{{player}}').
quest_tag(identity_exposed, generated).
quest_objective(identity_exposed, 0, talk_to('nora_vance', 1)).
quest_objective(identity_exposed, 1, objective('Discover who leaked your secret identity to the press.')).
quest_objective(identity_exposed, 2, objective('Decide whether to suppress the story or go public.')).
quest_objective(identity_exposed, 3, objective('Deal with the consequences of your decision.')).
quest_reward(identity_exposed, experience, 450).
quest_reward(identity_exposed, gold, 200).
quest_available(Player, identity_exposed) :-
    quest(identity_exposed, _, _, _, active).
