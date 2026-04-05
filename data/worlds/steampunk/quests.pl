%% Insimul Quests: Steampunk
%% Source: data/worlds/steampunk/quests.pl
%% Created: 2026-04-03
%% Total: 12 quests

%% ═══════════════════════════════════════════════════════════
%% Beginner Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: The Broken Pocket Watch
quest(broken_pocket_watch, 'The Broken Pocket Watch', repair, beginner, active).
quest_assigned_to(broken_pocket_watch, '{{player}}').
quest_tag(broken_pocket_watch, generated).
quest_objective(broken_pocket_watch, 0, talk_to('jasper_cogsworth', 1)).
quest_objective(broken_pocket_watch, 1, objective('Find a replacement mainspring at Brass Market Hall.')).
quest_objective(broken_pocket_watch, 2, objective('Return the mainspring to Jasper and watch him repair the watch.')).
quest_reward(broken_pocket_watch, experience, 100).
quest_reward(broken_pocket_watch, gold, 50).
quest_available(Player, broken_pocket_watch) :-
    quest(broken_pocket_watch, _, _, _, active).

%% Quest: Coal Run
quest(coal_run, 'Coal Run', fetch, beginner, active).
quest_assigned_to(coal_run, '{{player}}').
quest_tag(coal_run, generated).
quest_objective(coal_run, 0, objective('Visit Blackstone Fuel Depot on Cogwheel Lane.')).
quest_objective(coal_run, 1, objective('Purchase ten coal briquettes.')).
quest_objective(coal_run, 2, objective('Deliver them to Garrick Ironvein at Ironvein Forge.')).
quest_reward(coal_run, experience, 80).
quest_reward(coal_run, gold, 40).
quest_available(Player, coal_run) :-
    quest(coal_run, _, _, _, active).

%% Quest: Skyport Orientation
quest(skyport_orientation, 'Skyport Orientation', exploration, beginner, active).
quest_assigned_to(skyport_orientation, '{{player}}').
quest_tag(skyport_orientation, generated).
quest_objective(skyport_orientation, 0, objective('Visit the Ironhaven Central Skyport.')).
quest_objective(skyport_orientation, 1, objective('Speak to the dock master about airship schedules.')).
quest_objective(skyport_orientation, 2, talk_to('edmund_hargrove', 1)).
quest_reward(skyport_orientation, experience, 100).
quest_reward(skyport_orientation, gold, 60).
quest_available(Player, skyport_orientation) :-
    quest(skyport_orientation, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Intermediate Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: The Runaway Automaton
quest(runaway_automaton, 'The Runaway Automaton', combat, intermediate, active).
quest_assigned_to(runaway_automaton, '{{player}}').
quest_tag(runaway_automaton, generated).
quest_objective(runaway_automaton, 0, talk_to('jasper_cogsworth', 1)).
quest_objective(runaway_automaton, 1, objective('Track the malfunctioning automaton through Boiler Ward.')).
quest_objective(runaway_automaton, 2, objective('Disable the automaton without destroying it.')).
quest_objective(runaway_automaton, 3, objective('Return the automaton core to Jasper.')).
quest_reward(runaway_automaton, experience, 250).
quest_reward(runaway_automaton, gold, 120).
quest_available(Player, runaway_automaton) :-
    quest(runaway_automaton, _, _, _, active).

%% Quest: Blueprint Heist
quest(blueprint_heist, 'Blueprint Heist', investigation, intermediate, active).
quest_assigned_to(blueprint_heist, '{{player}}').
quest_tag(blueprint_heist, generated).
quest_objective(blueprint_heist, 0, talk_to('aldric_pendleton', 1)).
quest_objective(blueprint_heist, 1, objective('Investigate the break-in at Pendleton Inventors Academy.')).
quest_objective(blueprint_heist, 2, objective('Follow the trail of stolen blueprints to the Skyport Quarter.')).
quest_objective(blueprint_heist, 3, objective('Recover the blueprints and identify the thief.')).
quest_reward(blueprint_heist, experience, 300).
quest_reward(blueprint_heist, gold, 150).
quest_available(Player, blueprint_heist) :-
    quest(blueprint_heist, _, _, _, active).

%% Quest: Copper Shortage
quest(copper_shortage, 'Copper Shortage', fetch, intermediate, active).
quest_assigned_to(copper_shortage, '{{player}}').
quest_tag(copper_shortage, generated).
quest_objective(copper_shortage, 0, talk_to('minerva_thatch', 1)).
quest_objective(copper_shortage, 1, objective('Travel to Coppermouth and assess the mine collapse.')).
quest_objective(copper_shortage, 2, objective('Help clear the blocked tunnel.')).
quest_objective(copper_shortage, 3, objective('Report the findings to Garrick Ironvein.')).
quest_reward(copper_shortage, experience, 280).
quest_reward(copper_shortage, gold, 140).
quest_available(Player, copper_shortage) :-
    quest(copper_shortage, _, _, _, active).

%% Quest: The Salon Debate
quest(salon_debate, 'The Salon Debate', social, intermediate, active).
quest_assigned_to(salon_debate, '{{player}}').
quest_tag(salon_debate, generated).
quest_objective(salon_debate, 0, objective('Attend the evening debate at Salon Voltaire.')).
quest_objective(salon_debate, 1, talk_to('cecilia_pendleton', 1)).
quest_objective(salon_debate, 2, objective('Argue for or against automaton labor rights.')).
quest_reward(salon_debate, experience, 200).
quest_reward(salon_debate, gold, 100).
quest_available(Player, salon_debate) :-
    quest(salon_debate, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Advanced Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Aether Storm
quest(aether_storm, 'Aether Storm', combat, advanced, active).
quest_assigned_to(aether_storm, '{{player}}').
quest_tag(aether_storm, generated).
quest_objective(aether_storm, 0, talk_to('helena_voss', 1)).
quest_objective(aether_storm, 1, objective('Travel to Windhollow Observatory to study the storm readings.')).
quest_objective(aether_storm, 2, objective('Gather three aether crystals from the storm zone.')).
quest_objective(aether_storm, 3, objective('Calibrate the Aether Spire to disperse the storm.')).
quest_reward(aether_storm, experience, 450).
quest_reward(aether_storm, gold, 250).
quest_available(Player, aether_storm) :-
    quest(aether_storm, _, _, _, active).

%% Quest: The Blackwood Conspiracy
quest(blackwood_conspiracy, 'The Blackwood Conspiracy', investigation, advanced, active).
quest_assigned_to(blackwood_conspiracy, '{{player}}').
quest_tag(blackwood_conspiracy, generated).
quest_objective(blackwood_conspiracy, 0, talk_to('rosalind_pendleton', 1)).
quest_objective(blackwood_conspiracy, 1, objective('Uncover Lord Blackwood efforts to monopolize aether crystals.')).
quest_objective(blackwood_conspiracy, 2, objective('Infiltrate the Blackwood estate and find the contract.')).
quest_objective(blackwood_conspiracy, 3, objective('Present the evidence to the Civic Council.')).
quest_reward(blackwood_conspiracy, experience, 500).
quest_reward(blackwood_conspiracy, gold, 300).
quest_available(Player, blackwood_conspiracy) :-
    quest(blackwood_conspiracy, _, _, _, active).

%% Quest: The Sky Race
quest(sky_race, 'The Sky Race', exploration, advanced, active).
quest_assigned_to(sky_race, '{{player}}').
quest_tag(sky_race, generated).
quest_objective(sky_race, 0, talk_to('tobias_hargrove', 1)).
quest_objective(sky_race, 1, objective('Prepare an airship for the annual Ironhaven Sky Race.')).
quest_objective(sky_race, 2, objective('Navigate the mountain pass waypoints.')).
quest_objective(sky_race, 3, objective('Cross the finish line above Clocktower Heights.')).
quest_reward(sky_race, experience, 400).
quest_reward(sky_race, gold, 200).
quest_available(Player, sky_race) :-
    quest(sky_race, _, _, _, active).

%% Quest: Awakening the Colossus
quest(awakening_colossus, 'Awakening the Colossus', combat, advanced, active).
quest_assigned_to(awakening_colossus, '{{player}}').
quest_tag(awakening_colossus, generated).
quest_objective(awakening_colossus, 0, objective('Discover the ancient automaton buried beneath Foundry Row.')).
quest_objective(awakening_colossus, 1, objective('Gather five aether crystals and ten automaton servos.')).
quest_objective(awakening_colossus, 2, talk_to('aldric_pendleton', 1)).
quest_objective(awakening_colossus, 3, objective('Activate the colossus to defend Ironhaven from the sky pirate fleet.')).
quest_reward(awakening_colossus, experience, 600).
quest_reward(awakening_colossus, gold, 400).
quest_available(Player, awakening_colossus) :-
    quest(awakening_colossus, _, _, _, active).

%% Quest: The Aether Heist
quest(aether_heist, 'The Aether Heist', investigation, advanced, active).
quest_assigned_to(aether_heist, '{{player}}').
quest_tag(aether_heist, generated).
quest_objective(aether_heist, 0, talk_to('felix_voss', 1)).
quest_objective(aether_heist, 1, objective('Investigate the theft at Voss Aether Refinery.')).
quest_objective(aether_heist, 2, objective('Follow the stolen aether trail to the boarding house.')).
quest_objective(aether_heist, 3, objective('Confront the smuggler ring and recover the crystals.')).
quest_reward(aether_heist, experience, 500).
quest_reward(aether_heist, gold, 280).
quest_available(Player, aether_heist) :-
    quest(aether_heist, _, _, _, active).
