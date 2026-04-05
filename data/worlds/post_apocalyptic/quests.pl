%% Insimul Quests: Post-Apocalyptic Wasteland
%% Source: data/worlds/post_apocalyptic/quests.pl
%% Created: 2026-04-03
%% Total: 12 quests

%% Quest: First Patrol
quest(first_patrol, 'First Patrol', exploration, beginner, active).
quest_assigned_to(first_patrol, '{{player}}').
quest_tag(first_patrol, generated).
quest_objective(first_patrol, 0, talk_to('wren_holloway', 1)).
quest_objective(first_patrol, 1, objective('Walk the perimeter of Haven Ridge and report any breaches.')).
quest_objective(first_patrol, 2, objective('Return to Wren Holloway with your findings.')).
quest_reward(first_patrol, experience, 100).
quest_reward(first_patrol, gold, 50).
quest_available(Player, first_patrol) :-
    quest(first_patrol, _, _, _, active).

%% Quest: Water Rations
quest(water_rations, 'Water Rations', fetch, beginner, active).
quest_assigned_to(water_rations, '{{player}}').
quest_tag(water_rations, generated).
quest_objective(water_rations, 0, talk_to('jo_mercer', 1)).
quest_objective(water_rations, 1, objective('Collect three water purification filters from Scrap Quarter.')).
quest_objective(water_rations, 2, objective('Deliver filters to the Water Works.')).
quest_reward(water_rations, experience, 120).
quest_reward(water_rations, gold, 60).
quest_available(Player, water_rations) :-
    quest(water_rations, _, _, _, active).

%% Quest: Scrap Run
quest(scrap_run, 'Scrap Run', exploration, beginner, active).
quest_assigned_to(scrap_run, '{{player}}').
quest_tag(scrap_run, generated).
quest_objective(scrap_run, 0, talk_to('remy_duval', 1)).
quest_objective(scrap_run, 1, objective('Scavenge 10 units of scrap metal from the Foundry Ruins.')).
quest_objective(scrap_run, 2, objective('Avoid or defeat any hostile scavengers.')).
quest_objective(scrap_run, 3, objective('Return to Remy Duval with the salvage.')).
quest_reward(scrap_run, experience, 150).
quest_reward(scrap_run, gold, 80).
quest_available(Player, scrap_run) :-
    quest(scrap_run, _, _, _, active).

%% Quest: The Healers Way
quest(healers_way, 'The Healers Way', conversation, beginner, active).
quest_assigned_to(healers_way, '{{player}}').
quest_tag(healers_way, generated).
quest_objective(healers_way, 0, talk_to('doc_harlan', 1)).
quest_objective(healers_way, 1, objective('Gather rad herbs from the irradiated zone south of Rusthollow.')).
quest_objective(healers_way, 2, talk_to('petra_volkov', 1)).
quest_reward(healers_way, experience, 130).
quest_reward(healers_way, gold, 70).
quest_available(Player, healers_way) :-
    quest(healers_way, _, _, _, active).

%% Quest: Signal in the Static
quest(signal_in_static, 'Signal in the Static', exploration, intermediate, active).
quest_assigned_to(signal_in_static, '{{player}}').
quest_tag(signal_in_static, generated).
quest_objective(signal_in_static, 0, talk_to('silas_kane', 1)).
quest_objective(signal_in_static, 1, objective('Climb the Old Smokestack to boost the radio antenna.')).
quest_objective(signal_in_static, 2, objective('Decode the mysterious broadcast from the east.')).
quest_objective(signal_in_static, 3, objective('Report findings to Elias Mercer.')).
quest_reward(signal_in_static, experience, 250).
quest_reward(signal_in_static, gold, 120).
quest_available(Player, signal_in_static) :-
    quest(signal_in_static, _, _, _, active).

%% Quest: Trade Caravan
quest(trade_caravan, 'Trade Caravan', escort, intermediate, active).
quest_assigned_to(trade_caravan, '{{player}}').
quest_tag(trade_caravan, generated).
quest_objective(trade_caravan, 0, talk_to('remy_duval', 1)).
quest_objective(trade_caravan, 1, objective('Escort a trade caravan from Haven Ridge to Rusthollow.')).
quest_objective(trade_caravan, 2, objective('Defend the caravan from raider ambush in Dead Valley.')).
quest_objective(trade_caravan, 3, objective('Complete the delivery and collect payment.')).
quest_reward(trade_caravan, experience, 280).
quest_reward(trade_caravan, gold, 150).
quest_available(Player, trade_caravan) :-
    quest(trade_caravan, _, _, _, active).

%% Quest: Mutant Territory
quest(mutant_territory, 'Mutant Territory', exploration, intermediate, active).
quest_assigned_to(mutant_territory, '{{player}}').
quest_tag(mutant_territory, generated).
quest_objective(mutant_territory, 0, talk_to('cass_mercer', 1)).
quest_objective(mutant_territory, 1, objective('Scout the mutant-infested ruins beyond Rusthollow.')).
quest_objective(mutant_territory, 2, objective('Collect a sample of mutant hide for Mara Duval.')).
quest_objective(mutant_territory, 3, talk_to('mara_duval', 1)).
quest_reward(mutant_territory, experience, 250).
quest_reward(mutant_territory, gold, 130).
quest_available(Player, mutant_territory) :-
    quest(mutant_territory, _, _, _, active).

%% Quest: The Greenhouse Project
quest(greenhouse_project, 'The Greenhouse Project', fetch, intermediate, active).
quest_assigned_to(greenhouse_project, '{{player}}').
quest_tag(greenhouse_project, generated).
quest_objective(greenhouse_project, 0, talk_to('lina_okafor', 1)).
quest_objective(greenhouse_project, 1, objective('Find intact glass panes in the old factory district.')).
quest_objective(greenhouse_project, 2, objective('Locate fertile soil samples from the river delta.')).
quest_objective(greenhouse_project, 3, objective('Help Lina assemble the new greenhouse frame.')).
quest_reward(greenhouse_project, experience, 300).
quest_reward(greenhouse_project, gold, 140).
quest_available(Player, greenhouse_project) :-
    quest(greenhouse_project, _, _, _, active).

%% Quest: Iron Fang Infiltration
quest(iron_fang_infiltration, 'Iron Fang Infiltration', stealth, advanced, active).
quest_assigned_to(iron_fang_infiltration, '{{player}}').
quest_tag(iron_fang_infiltration, generated).
quest_objective(iron_fang_infiltration, 0, talk_to('elias_mercer', 1)).
quest_objective(iron_fang_infiltration, 1, objective('Infiltrate the Iron Fang Stronghold undetected.')).
quest_objective(iron_fang_infiltration, 2, objective('Steal the raider supply manifest from the War Hall.')).
quest_objective(iron_fang_infiltration, 3, objective('Escape without raising the alarm.')).
quest_reward(iron_fang_infiltration, experience, 450).
quest_reward(iron_fang_infiltration, gold, 250).
quest_available(Player, iron_fang_infiltration) :-
    quest(iron_fang_infiltration, _, _, _, active).

%% Quest: The Pit Fighter
quest(pit_fighter, 'The Pit Fighter', combat, advanced, active).
quest_assigned_to(pit_fighter, '{{player}}').
quest_tag(pit_fighter, generated).
quest_objective(pit_fighter, 0, objective('Travel to Iron Fang Stronghold.')).
quest_objective(pit_fighter, 1, talk_to('cutter_briggs', 1)).
quest_objective(pit_fighter, 2, objective('Win three rounds in the fighting pit.')).
quest_objective(pit_fighter, 3, objective('Earn the respect of Vex Thornton.')).
quest_reward(pit_fighter, experience, 400).
quest_reward(pit_fighter, gold, 200).
quest_available(Player, pit_fighter) :-
    quest(pit_fighter, _, _, _, active).

%% Quest: Black Market Deal
quest(black_market_deal, 'Black Market Deal', conversation, advanced, active).
quest_assigned_to(black_market_deal, '{{player}}').
quest_tag(black_market_deal, generated).
quest_objective(black_market_deal, 0, talk_to('moth', 1)).
quest_objective(black_market_deal, 1, objective('Acquire a rare fusion cell through negotiation.')).
quest_objective(black_market_deal, 2, objective('Decide whether to report the deal or keep the goods.')).
quest_reward(black_market_deal, experience, 350).
quest_reward(black_market_deal, gold, 180).
quest_available(Player, black_market_deal) :-
    quest(black_market_deal, _, _, _, active).

%% Quest: The Old World Bunker
quest(old_world_bunker, 'The Old World Bunker', exploration, advanced, active).
quest_assigned_to(old_world_bunker, '{{player}}').
quest_tag(old_world_bunker, generated).
quest_objective(old_world_bunker, 0, talk_to('silas_kane', 1)).
quest_objective(old_world_bunker, 1, objective('Follow the decoded signal to a pre-war military bunker.')).
quest_objective(old_world_bunker, 2, objective('Navigate the bunker traps and automated defenses.')).
quest_objective(old_world_bunker, 3, objective('Recover the pre-war data archive.')).
quest_objective(old_world_bunker, 4, objective('Bring the archive to Elias Mercer.')).
quest_reward(old_world_bunker, experience, 500).
quest_reward(old_world_bunker, gold, 300).
quest_available(Player, old_world_bunker) :-
    quest(old_world_bunker, _, _, _, active).
