%% Insimul Quests: Dark Fantasy Cursed Lands
%% Source: data/worlds/dark_fantasy/quests.pl
%% Created: 2026-04-03
%% Total: 12 quests

%% ═══════════════════════════════════════════════════════════
%% Beginner Quests -- Survival and Orientation
%% ═══════════════════════════════════════════════════════════

%% Quest: The Ashen Welcome
quest(the_ashen_welcome, 'The Ashen Welcome', exploration, beginner, active).
quest_assigned_to(the_ashen_welcome, '{{player}}').
quest_tag(the_ashen_welcome, generated).
quest_objective(the_ashen_welcome, 0, talk_to('ronan_blackwood', 1)).
quest_objective(the_ashen_welcome, 1, objective('Learn the layout of Ashenvale and its four districts.')).
quest_objective(the_ashen_welcome, 2, objective('Acquire a plague mask from the apothecary.')).
quest_reward(the_ashen_welcome, experience, 100).
quest_reward(the_ashen_welcome, gold, 50).
quest_available(Player, the_ashen_welcome) :-
    quest(the_ashen_welcome, _, _, _, active).

%% Quest: Plague Ward Duty
quest(plague_ward_duty, 'Plague Ward Duty', combat, beginner, active).
quest_assigned_to(plague_ward_duty, '{{player}}').
quest_tag(plague_ward_duty, generated).
quest_objective(plague_ward_duty, 0, talk_to('corvus_thane', 1)).
quest_objective(plague_ward_duty, 1, objective('Deliver plague remedy herbs to the infirmary.')).
quest_objective(plague_ward_duty, 2, objective('Burn three infected corpses at the Bonfire Pit.')).
quest_reward(plague_ward_duty, experience, 120).
quest_reward(plague_ward_duty, gold, 60).
quest_available(Player, plague_ward_duty) :-
    quest(plague_ward_duty, _, _, _, active).

%% Quest: Iron and Ash
quest(iron_and_ash, 'Iron and Ash', crafting, beginner, active).
quest_assigned_to(iron_and_ash, '{{player}}').
quest_tag(iron_and_ash, generated).
quest_objective(iron_and_ash, 0, talk_to('garrett_holt', 1)).
quest_objective(iron_and_ash, 1, objective('Gather iron ore from the collapsed mine near Hollowmere.')).
quest_objective(iron_and_ash, 2, objective('Forge a silver-edged blade at the Ironveil Forge.')).
quest_reward(iron_and_ash, experience, 150).
quest_reward(iron_and_ash, gold, 80).
quest_reward(iron_and_ash, item, silver_blade).
quest_available(Player, iron_and_ash) :-
    quest(iron_and_ash, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Intermediate Quests -- Hunting and Investigation
%% ═══════════════════════════════════════════════════════════

%% Quest: Hunt the Blighted Stag
quest(hunt_blighted_stag, 'Hunt the Blighted Stag', combat, intermediate, active).
quest_assigned_to(hunt_blighted_stag, '{{player}}').
quest_tag(hunt_blighted_stag, generated).
quest_objective(hunt_blighted_stag, 0, talk_to('aldric_voss', 1)).
quest_objective(hunt_blighted_stag, 1, objective('Track the blighted stag through the cursed forest.')).
quest_objective(hunt_blighted_stag, 2, objective('Slay the abomination before it reaches the town walls.')).
quest_objective(hunt_blighted_stag, 3, objective('Return the corrupted antlers to Aldric as proof.')).
quest_reward(hunt_blighted_stag, experience, 250).
quest_reward(hunt_blighted_stag, gold, 120).
quest_available(Player, hunt_blighted_stag) :-
    quest(hunt_blighted_stag, _, _, _, active).

%% Quest: The Drowned Bell Speaks
quest(drowned_bell_speaks, 'The Drowned Bell Speaks', exploration, intermediate, active).
quest_assigned_to(drowned_bell_speaks, '{{player}}').
quest_tag(drowned_bell_speaks, generated).
quest_objective(drowned_bell_speaks, 0, objective('Travel to Hollowmere and investigate the ringing bell.')).
quest_objective(drowned_bell_speaks, 1, talk_to('morwen_greymist', 1)).
quest_objective(drowned_bell_speaks, 2, objective('Dive into the flooded chapel beneath the bell tower.')).
quest_objective(drowned_bell_speaks, 3, objective('Retrieve the waterlogged journal of the last priest.')).
quest_reward(drowned_bell_speaks, experience, 280).
quest_reward(drowned_bell_speaks, gold, 130).
quest_available(Player, drowned_bell_speaks) :-
    quest(drowned_bell_speaks, _, _, _, active).

%% Quest: Exorcism at Censer Walk
quest(exorcism_censer_walk, 'Exorcism at Censer Walk', combat, intermediate, active).
quest_assigned_to(exorcism_censer_walk, '{{player}}').
quest_tag(exorcism_censer_walk, generated).
quest_objective(exorcism_censer_walk, 0, talk_to('isolde_wren', 1)).
quest_objective(exorcism_censer_walk, 1, objective('Gather sanctified salt from the Reliquary.')).
quest_objective(exorcism_censer_walk, 2, objective('Perform the exorcism ritual on the possessed warden.')).
quest_objective(exorcism_censer_walk, 3, objective('Seal the breach in the ward barrier.')).
quest_reward(exorcism_censer_walk, experience, 300).
quest_reward(exorcism_censer_walk, gold, 150).
quest_available(Player, exorcism_censer_walk) :-
    quest(exorcism_censer_walk, _, _, _, active).

%% Quest: Curse of the Blackwood Line
quest(curse_blackwood_line, 'Curse of the Blackwood Line', conversation, intermediate, active).
quest_assigned_to(curse_blackwood_line, '{{player}}').
quest_tag(curse_blackwood_line, generated).
quest_objective(curse_blackwood_line, 0, talk_to('ronan_blackwood', 1)).
quest_objective(curse_blackwood_line, 1, objective('Investigate the Blackwood family tomb in the outer ruins.')).
quest_objective(curse_blackwood_line, 2, objective('Find the cursed heirloom that binds the bloodline.')).
quest_objective(curse_blackwood_line, 3, objective('Choose: destroy the heirloom or use its power.')).
quest_reward(curse_blackwood_line, experience, 280).
quest_reward(curse_blackwood_line, gold, 140).
quest_available(Player, curse_blackwood_line) :-
    quest(curse_blackwood_line, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Advanced Quests -- Dark Confrontations
%% ═══════════════════════════════════════════════════════════

%% Quest: The Witch Bargain
quest(the_witch_bargain, 'The Witch Bargain', conversation, advanced, active).
quest_assigned_to(the_witch_bargain, '{{player}}').
quest_tag(the_witch_bargain, generated).
quest_objective(the_witch_bargain, 0, talk_to('morwen_greymist', 1)).
quest_objective(the_witch_bargain, 1, objective('Gather three forbidden reagents from the cursed swamp.')).
quest_objective(the_witch_bargain, 2, objective('Negotiate with Morwen for a counter-curse.')).
quest_objective(the_witch_bargain, 3, objective('Pay the price she demands -- a memory, a year of life, or a name.')).
quest_reward(the_witch_bargain, experience, 400).
quest_reward(the_witch_bargain, gold, 200).
quest_available(Player, the_witch_bargain) :-
    quest(the_witch_bargain, _, _, _, active).

%% Quest: Breach of Gravenhold
quest(breach_of_gravenhold, 'Breach of Gravenhold', combat, advanced, active).
quest_assigned_to(breach_of_gravenhold, '{{player}}').
quest_tag(breach_of_gravenhold, generated).
quest_objective(breach_of_gravenhold, 0, talk_to('aldric_voss', 1)).
quest_objective(breach_of_gravenhold, 1, objective('Lead a war party through the Outer Ruins of Gravenhold.')).
quest_objective(breach_of_gravenhold, 2, objective('Destroy the bone constructs guarding the gate.')).
quest_objective(breach_of_gravenhold, 3, objective('Plant the sanctified banner at the citadel entrance.')).
quest_reward(breach_of_gravenhold, experience, 500).
quest_reward(breach_of_gravenhold, gold, 250).
quest_available(Player, breach_of_gravenhold) :-
    quest(breach_of_gravenhold, _, _, _, active).

%% Quest: The Revenant Brother
quest(the_revenant_brother, 'The Revenant Brother', conversation, advanced, active).
quest_assigned_to(the_revenant_brother, '{{player}}').
quest_tag(the_revenant_brother, generated).
quest_objective(the_revenant_brother, 0, talk_to('sera_voss', 1)).
quest_objective(the_revenant_brother, 1, objective('Infiltrate Gravenhold and find Edric Holloway.')).
quest_objective(the_revenant_brother, 2, objective('Attempt to restore Edric to his senses.')).
quest_objective(the_revenant_brother, 3, objective('Choose: free Edric through destruction or bind him to your service.')).
quest_reward(the_revenant_brother, experience, 450).
quest_reward(the_revenant_brother, gold, 200).
quest_available(Player, the_revenant_brother) :-
    quest(the_revenant_brother, _, _, _, active).

%% Quest: Soul Harvest
quest(soul_harvest, 'Soul Harvest', combat, advanced, active).
quest_assigned_to(soul_harvest, '{{player}}').
quest_tag(soul_harvest, generated).
quest_objective(soul_harvest, 0, talk_to('ambrose_kael', 1)).
quest_objective(soul_harvest, 1, objective('Discover Nyx Sable harvesting souls in the cursed forest.')).
quest_objective(soul_harvest, 2, objective('Free the trapped souls from the phylactery stones.')).
quest_objective(soul_harvest, 3, objective('Confront and defeat Nyx Sable.')).
quest_reward(soul_harvest, experience, 500).
quest_reward(soul_harvest, gold, 250).
quest_reward(soul_harvest, item, soul_gem_purified).
quest_available(Player, soul_harvest) :-
    quest(soul_harvest, _, _, _, active).

%% Quest: Dethrone the Undead Lord
quest(dethrone_undead_lord, 'Dethrone the Undead Lord', combat, advanced, active).
quest_assigned_to(dethrone_undead_lord, '{{player}}').
quest_tag(dethrone_undead_lord, generated).
quest_objective(dethrone_undead_lord, 0, objective('Unite the factions of Ashenvale against Varek Draven.')).
quest_objective(dethrone_undead_lord, 1, objective('Forge the Dawnbreaker sword from purified soul gems and sanctified steel.')).
quest_objective(dethrone_undead_lord, 2, objective('Breach the Inner Sanctum of Gravenhold.')).
quest_objective(dethrone_undead_lord, 3, objective('Destroy Varek Draven and shatter the Black Throne.')).
quest_reward(dethrone_undead_lord, experience, 1000).
quest_reward(dethrone_undead_lord, gold, 500).
quest_available(Player, dethrone_undead_lord) :-
    quest(dethrone_undead_lord, _, _, _, active).
