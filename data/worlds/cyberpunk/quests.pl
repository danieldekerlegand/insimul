%% Insimul Quests: Cyberpunk Megacity
%% Source: data/worlds/cyberpunk/quests.pl
%% Created: 2026-04-03
%% Total: 12 quests

%% ═══════════════════════════════════════════════════════════
%% Data Heists
%% ═══════════════════════════════════════════════════════════

%% Quest: Ghost in the Machine
quest(ghost_in_the_machine, 'Ghost in the Machine', infiltration, intermediate, active).
quest_assigned_to(ghost_in_the_machine, '{{player}}').
quest_tag(ghost_in_the_machine, generated).
quest_objective(ghost_in_the_machine, 0, talk_to('kira_tanaka', 1)).
quest_objective(ghost_in_the_machine, 1, objective('Obtain a cyberdeck from Doc Mori or the Black ICE Market.')).
quest_objective(ghost_in_the_machine, 2, objective('Jack into the Cascade Data Vault access terminal.')).
quest_objective(ghost_in_the_machine, 3, objective('Download the encrypted personnel files without triggering ICE.')).
quest_objective(ghost_in_the_machine, 4, objective('Deliver the data shard to Rook at The Afterburner.')).
quest_reward(ghost_in_the_machine, experience, 500).
quest_reward(ghost_in_the_machine, gold, 300).
quest_available(Player, ghost_in_the_machine) :-
    quest(ghost_in_the_machine, _, _, _, active).

%% Quest: The Nexus Leak
quest(the_nexus_leak, 'The Nexus Leak', data_heist, advanced, active).
quest_assigned_to(the_nexus_leak, '{{player}}').
quest_tag(the_nexus_leak, generated).
quest_objective(the_nexus_leak, 0, talk_to('zero', 1)).
quest_objective(the_nexus_leak, 1, objective('Infiltrate Nexus Dynamics Tower via the maintenance network.')).
quest_objective(the_nexus_leak, 2, objective('Plant worm.exe on the R&D subnet.')).
quest_objective(the_nexus_leak, 3, objective('Extract project data without alerting Marcus Cole.')).
quest_objective(the_nexus_leak, 4, objective('Decide: sell the data or release it to the public net.')).
quest_reward(the_nexus_leak, experience, 800).
quest_reward(the_nexus_leak, gold, 500).
quest_available(Player, the_nexus_leak) :-
    quest(the_nexus_leak, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Corporate Espionage
%% ═══════════════════════════════════════════════════════════

%% Quest: Double Agent
quest(double_agent, 'Double Agent', espionage, advanced, active).
quest_assigned_to(double_agent, '{{player}}').
quest_tag(double_agent, generated).
quest_objective(double_agent, 0, talk_to('yuki_arasaka', 1)).
quest_objective(double_agent, 1, objective('Accept the undercover assignment from Director Arasaka-Murata.')).
quest_objective(double_agent, 2, objective('Pose as a freelance tech consultant at Nexus Dynamics.')).
quest_objective(double_agent, 3, objective('Copy the SynthLife merger documents from the secure archive.')).
quest_objective(double_agent, 4, objective('Return to Corpo Plaza without blowing your cover.')).
quest_reward(double_agent, experience, 700).
quest_reward(double_agent, gold, 600).
quest_available(Player, double_agent) :-
    quest(double_agent, _, _, _, active).

%% Quest: Hostile Takeover
quest(hostile_takeover, 'Hostile Takeover', espionage, expert, active).
quest_assigned_to(hostile_takeover, '{{player}}').
quest_tag(hostile_takeover, generated).
quest_objective(hostile_takeover, 0, talk_to('marcus_cole', 1)).
quest_objective(hostile_takeover, 1, objective('Gather evidence of Arasaka-Murata illegal bioweapon research.')).
quest_objective(hostile_takeover, 2, objective('Hack the SynthLife secure laboratory records.')).
quest_objective(hostile_takeover, 3, objective('Present evidence to MetroSec or sell to the highest bidder.')).
quest_reward(hostile_takeover, experience, 1000).
quest_reward(hostile_takeover, gold, 800).
quest_available(Player, hostile_takeover) :-
    quest(hostile_takeover, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Street Justice
%% ═══════════════════════════════════════════════════════════

%% Quest: Cleaning the Stacks
quest(cleaning_the_stacks, 'Cleaning the Stacks', combat, beginner, active).
quest_assigned_to(cleaning_the_stacks, '{{player}}').
quest_tag(cleaning_the_stacks, generated).
quest_objective(cleaning_the_stacks, 0, talk_to('mama_ling', 1)).
quest_objective(cleaning_the_stacks, 1, objective('Investigate the gang shaking down Stacks Bazaar vendors.')).
quest_objective(cleaning_the_stacks, 2, objective('Confront the gang leader at Pipe Row.')).
quest_objective(cleaning_the_stacks, 3, objective('Choose: fight them, pay them off, or negotiate a truce.')).
quest_reward(cleaning_the_stacks, experience, 300).
quest_reward(cleaning_the_stacks, gold, 150).
quest_available(Player, cleaning_the_stacks) :-
    quest(cleaning_the_stacks, _, _, _, active).

%% Quest: The Disappeared
quest(the_disappeared, 'The Disappeared', investigation, intermediate, active).
quest_assigned_to(the_disappeared, '{{player}}').
quest_tag(the_disappeared, generated).
quest_objective(the_disappeared, 0, talk_to('father_aleksei', 1)).
quest_objective(the_disappeared, 1, objective('Investigate reports of Stacks residents vanishing.')).
quest_objective(the_disappeared, 2, objective('Follow the trail to the SynthLife Biotech loading docks.')).
quest_objective(the_disappeared, 3, objective('Discover the illegal organ harvesting operation.')).
quest_objective(the_disappeared, 4, objective('Rescue the captives or report to the underground media.')).
quest_reward(the_disappeared, experience, 600).
quest_reward(the_disappeared, gold, 250).
quest_available(Player, the_disappeared) :-
    quest(the_disappeared, _, _, _, active).

%% Quest: Chrome and Blood
quest(chrome_and_blood, 'Chrome and Blood', combat, intermediate, active).
quest_assigned_to(chrome_and_blood, '{{player}}').
quest_tag(chrome_and_blood, generated).
quest_objective(chrome_and_blood, 0, talk_to('viktor_petrov', 1)).
quest_objective(chrome_and_blood, 1, objective('Track down the cyberpsycho terrorizing Neon Row.')).
quest_objective(chrome_and_blood, 2, objective('Obtain NeuroChill from Doc Mori to subdue without killing.')).
quest_objective(chrome_and_blood, 3, objective('Confront the cyberpsycho at the abandoned warehouse.')).
quest_reward(chrome_and_blood, experience, 450).
quest_reward(chrome_and_blood, gold, 200).
quest_available(Player, chrome_and_blood) :-
    quest(chrome_and_blood, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Underworld and Fixer Jobs
%% ═══════════════════════════════════════════════════════════

%% Quest: The Fixer Upper
quest(the_fixer_upper, 'The Fixer Upper', social, beginner, active).
quest_assigned_to(the_fixer_upper, '{{player}}').
quest_tag(the_fixer_upper, generated).
quest_objective(the_fixer_upper, 0, talk_to('lena_vasquez', 1)).
quest_objective(the_fixer_upper, 1, objective('Prove yourself by completing a simple courier job.')).
quest_objective(the_fixer_upper, 2, objective('Deliver the package from Neon Row to Silicon Docks.')).
quest_objective(the_fixer_upper, 3, objective('Avoid MetroSec patrols along the route.')).
quest_reward(the_fixer_upper, experience, 200).
quest_reward(the_fixer_upper, gold, 100).
quest_available(Player, the_fixer_upper) :-
    quest(the_fixer_upper, _, _, _, active).

%% Quest: Black Market Blues
quest(black_market_blues, 'Black Market Blues', acquisition, intermediate, active).
quest_assigned_to(black_market_blues, '{{player}}').
quest_tag(black_market_blues, generated).
quest_objective(black_market_blues, 0, talk_to('santos', 1)).
quest_objective(black_market_blues, 1, objective('A shipment of military-grade cyberware was intercepted.')).
quest_objective(black_market_blues, 2, objective('Track the shipment to the MetroSec impound yard.')).
quest_objective(black_market_blues, 3, objective('Retrieve or reroute the crate without a firefight.')).
quest_reward(black_market_blues, experience, 400).
quest_reward(black_market_blues, gold, 350).
quest_available(Player, black_market_blues) :-
    quest(black_market_blues, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Existential and Philosophical
%% ═══════════════════════════════════════════════════════════

%% Quest: What Makes You Human
quest(what_makes_you_human, 'What Makes You Human', philosophical, advanced, active).
quest_assigned_to(what_makes_you_human, '{{player}}').
quest_tag(what_makes_you_human, generated).
quest_objective(what_makes_you_human, 0, talk_to('synth', 1)).
quest_objective(what_makes_you_human, 1, objective('Help Synth track down their original memory backups.')).
quest_objective(what_makes_you_human, 2, objective('Infiltrate Neural Link Labs to access the AI archive.')).
quest_objective(what_makes_you_human, 3, objective('Decide: restore original memories or let Synth remain as they are.')).
quest_reward(what_makes_you_human, experience, 600).
quest_reward(what_makes_you_human, gold, 200).
quest_available(Player, what_makes_you_human) :-
    quest(what_makes_you_human, _, _, _, active).

%% Quest: Off the Grid
quest(off_the_grid, 'Off the Grid', survival, intermediate, active).
quest_assigned_to(off_the_grid, '{{player}}').
quest_tag(off_the_grid, generated).
quest_objective(off_the_grid, 0, talk_to('pixel', 1)).
quest_objective(off_the_grid, 1, objective('Help Pixel erase her identity from all corporate databases.')).
quest_objective(off_the_grid, 2, objective('Hack MetroSec, Arasaka-Murata, and Nexus Dynamics citizen registries.')).
quest_objective(off_the_grid, 3, objective('Set up a new identity using a forged credchip.')).
quest_reward(off_the_grid, experience, 500).
quest_reward(off_the_grid, gold, 250).
quest_available(Player, off_the_grid) :-
    quest(off_the_grid, _, _, _, active).

%% Quest: The Last Free Signal
quest(the_last_free_signal, 'The Last Free Signal', activism, expert, active).
quest_assigned_to(the_last_free_signal, '{{player}}').
quest_tag(the_last_free_signal, generated).
quest_objective(the_last_free_signal, 0, talk_to('dex_okonkwo', 1)).
quest_objective(the_last_free_signal, 1, objective('The corps are shutting down the last independent mesh network.')).
quest_objective(the_last_free_signal, 2, objective('Secure three relay nodes across Neo Cascade.')).
quest_objective(the_last_free_signal, 3, objective('Broadcast the truth about corporate population control.')).
quest_objective(the_last_free_signal, 4, objective('Survive the corporate blackops response team.')).
quest_reward(the_last_free_signal, experience, 1200).
quest_reward(the_last_free_signal, gold, 400).
quest_available(Player, the_last_free_signal) :-
    quest(the_last_free_signal, _, _, _, active).
