%% Insimul Quests: Realm of Aethermoor
%% Source: data/worlds/realm_of_aethermoor/quests.pl
%% Created: 2026-04-03
%% Total: 12 quests

%% ═══════════════════════════════════════════════════════════
%% Beginner Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: The Aether Apprentice
quest(aether_apprentice, 'The Aether Apprentice', exploration, beginner, active).
quest_assigned_to(aether_apprentice, '{{player}}').
quest_tag(aether_apprentice, generated).
quest_objective(aether_apprentice, 0, talk_to('wizard_gandalf', 1)).
quest_objective(aether_apprentice, 1, objective('Visit the Grand Aether Well in Aethoria City.')).
quest_objective(aether_apprentice, 2, objective('Draw aether energy from the well using the focus crystal.')).
quest_objective(aether_apprentice, 3, objective('Return to Gandalf and demonstrate your attunement.')).
quest_reward(aether_apprentice, experience, 100).
quest_reward(aether_apprentice, gold, 50).
quest_available(Player, aether_apprentice) :-
    quest(aether_apprentice, _, _, _, active).

%% Quest: Market Day
quest(market_day, 'Market Day', gathering, beginner, active).
quest_assigned_to(market_day, '{{player}}').
quest_tag(market_day, generated).
quest_objective(market_day, 0, objective('Visit The Enchanted Market in Aethoria City.')).
quest_objective(market_day, 1, objective('Purchase a healing potion from The Shimmering Vial.')).
quest_objective(market_day, 2, objective('Buy a minor rune scroll from Tomes and Scrolls.')).
quest_reward(market_day, experience, 80).
quest_reward(market_day, gold, 40).
quest_available(Player, market_day) :-
    quest(market_day, _, _, _, active).

%% Quest: The Gilded Goblet
quest(gilded_goblet_tales, 'The Gilded Goblet', conversation, beginner, active).
quest_assigned_to(gilded_goblet_tales, '{{player}}').
quest_tag(gilded_goblet_tales, generated).
quest_objective(gilded_goblet_tales, 0, objective('Enter The Gilded Goblet tavern in Market Row.')).
quest_objective(gilded_goblet_tales, 1, talk_to('warrior_boromir', 1)).
quest_objective(gilded_goblet_tales, 2, objective('Listen to tales of adventure from the tavern patrons.')).
quest_reward(gilded_goblet_tales, experience, 100).
quest_reward(gilded_goblet_tales, gold, 50).
quest_available(Player, gilded_goblet_tales) :-
    quest(gilded_goblet_tales, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Intermediate Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Moonwell Pilgrimage
quest(moonwell_pilgrimage, 'Moonwell Pilgrimage', exploration, intermediate, active).
quest_assigned_to(moonwell_pilgrimage, '{{player}}').
quest_tag(moonwell_pilgrimage, generated).
quest_objective(moonwell_pilgrimage, 0, talk_to('elf_queen', 1)).
quest_objective(moonwell_pilgrimage, 1, objective('Travel from Aethoria City to Silverwood Grove.')).
quest_objective(moonwell_pilgrimage, 2, objective('Meditate at the Moonwell and receive a vision.')).
quest_objective(moonwell_pilgrimage, 3, objective('Report your vision to Queen Galadriel.')).
quest_reward(moonwell_pilgrimage, experience, 200).
quest_reward(moonwell_pilgrimage, gold, 150).
quest_available(Player, moonwell_pilgrimage) :-
    quest(moonwell_pilgrimage, _, _, _, active).

%% Quest: Ironpeak Forging
quest(ironpeak_forging, 'Ironpeak Forging', crafting, intermediate, active).
quest_assigned_to(ironpeak_forging, '{{player}}').
quest_tag(ironpeak_forging, generated).
quest_objective(ironpeak_forging, 0, talk_to('dwarf_king', 1)).
quest_objective(ironpeak_forging, 1, objective('Descend to The Great Forge in Ironpeak Hold.')).
quest_objective(ironpeak_forging, 2, objective('Assist Gimli Ironbeard in forging a runic blade.')).
quest_objective(ironpeak_forging, 3, objective('Temper the blade using aether-infused water from The Magma Well.')).
quest_reward(ironpeak_forging, experience, 250).
quest_reward(ironpeak_forging, gold, 200).
quest_available(Player, ironpeak_forging) :-
    quest(ironpeak_forging, _, _, _, active).

%% Quest: The Whispering Grove
quest(whispering_grove, 'The Whispering Grove', investigation, intermediate, active).
quest_assigned_to(whispering_grove, '{{player}}').
quest_tag(whispering_grove, generated).
quest_objective(whispering_grove, 0, talk_to('elf_ranger', 1)).
quest_objective(whispering_grove, 1, objective('Investigate disturbances in the Shadow Grove of Silverwood.')).
quest_objective(whispering_grove, 2, objective('Discover the source of the corrupted aether seeping from below.')).
quest_objective(whispering_grove, 3, objective('Seal the dark rift using a purification rune.')).
quest_reward(whispering_grove, experience, 220).
quest_reward(whispering_grove, gold, 175).
quest_available(Player, whispering_grove) :-
    quest(whispering_grove, _, _, _, active).

%% Quest: Crossroads Caravan
quest(crossroads_caravan, 'Crossroads Caravan', escort, intermediate, active).
quest_assigned_to(crossroads_caravan, '{{player}}').
quest_tag(crossroads_caravan, generated).
quest_objective(crossroads_caravan, 0, objective('Meet the merchant caravan at Haven Market in Crossroads Haven.')).
quest_objective(crossroads_caravan, 1, objective('Escort the caravan through bandit territory to Aethoria City.')).
quest_objective(crossroads_caravan, 2, objective('Defend against two ambush encounters along the road.')).
quest_objective(crossroads_caravan, 3, objective('Deliver the goods safely to The Enchanted Market.')).
quest_reward(crossroads_caravan, experience, 200).
quest_reward(crossroads_caravan, gold, 180).
quest_available(Player, crossroads_caravan) :-
    quest(crossroads_caravan, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Advanced Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: The Crystal Prophecy
quest(crystal_prophecy, 'The Crystal Prophecy', investigation, advanced, active).
quest_assigned_to(crystal_prophecy, '{{player}}').
quest_tag(crystal_prophecy, generated).
quest_objective(crystal_prophecy, 0, talk_to('wizard_gandalf', 1)).
quest_objective(crystal_prophecy, 1, objective('Consult the Spire of Divination in the Royal Quarter.')).
quest_objective(crystal_prophecy, 2, objective('Decipher the ancient prophecy inscribed on the crystal core.')).
quest_objective(crystal_prophecy, 3, objective('Travel to all four Aether Wells to verify the prophecy fragments.')).
quest_reward(crystal_prophecy, experience, 400).
quest_reward(crystal_prophecy, gold, 300).
quest_available(Player, crystal_prophecy) :-
    quest(crystal_prophecy, _, _, _, active).

%% Quest: War of the Holds
quest(war_of_holds, 'War of the Holds', combat, advanced, active).
quest_assigned_to(war_of_holds, '{{player}}').
quest_tag(war_of_holds, generated).
quest_objective(war_of_holds, 0, talk_to('human_king', 1)).
quest_objective(war_of_holds, 1, objective('Investigate orc raiding parties threatening the northern border.')).
quest_objective(war_of_holds, 2, objective('Negotiate with Grommash to discover the true cause of the raids.')).
quest_objective(war_of_holds, 3, objective('Broker peace or lead a defensive campaign at the border fort.')).
quest_reward(war_of_holds, experience, 500).
quest_reward(war_of_holds, gold, 400).
quest_available(Player, war_of_holds) :-
    quest(war_of_holds, _, _, _, active).

%% Quest: The Arcane Corruption
quest(arcane_corruption, 'The Arcane Corruption', investigation, advanced, active).
quest_assigned_to(arcane_corruption, '{{player}}').
quest_tag(arcane_corruption, generated).
quest_objective(arcane_corruption, 0, objective('Investigate the failing Warding Circle in the Arcane District.')).
quest_objective(arcane_corruption, 1, talk_to('cleric_galadriel', 1)).
quest_objective(arcane_corruption, 2, objective('Trace the corruption to a forbidden grimoire stolen from the Arcane Library.')).
quest_objective(arcane_corruption, 3, objective('Recover the grimoire and restore the protective wards.')).
quest_reward(arcane_corruption, experience, 450).
quest_reward(arcane_corruption, gold, 350).
quest_available(Player, arcane_corruption) :-
    quest(arcane_corruption, _, _, _, active).

%% Quest: Crown of Thorns
quest(crown_of_thorns, 'Crown of Thorns', diplomacy, advanced, active).
quest_assigned_to(crown_of_thorns, '{{player}}').
quest_tag(crown_of_thorns, generated).
quest_objective(crown_of_thorns, 0, talk_to('human_queen', 1)).
quest_objective(crown_of_thorns, 1, objective('Uncover the assassination plot against King Aldric Stormborne.')).
quest_objective(crown_of_thorns, 2, objective('Gather evidence from informants in all four settlements.')).
quest_objective(crown_of_thorns, 3, objective('Confront the conspirators at the Royal Palace.')).
quest_reward(crown_of_thorns, experience, 600).
quest_reward(crown_of_thorns, gold, 500).
quest_available(Player, crown_of_thorns) :-
    quest(crown_of_thorns, _, _, _, active).

%% Quest: The Forge Eternal
quest(forge_eternal, 'The Forge Eternal', crafting, advanced, active).
quest_assigned_to(forge_eternal, '{{player}}').
quest_tag(forge_eternal, generated).
quest_objective(forge_eternal, 0, talk_to('dwarf_warrior', 1)).
quest_objective(forge_eternal, 1, objective('Gather aether crystals from all four realm wells.')).
quest_objective(forge_eternal, 2, objective('Combine them at The Great Forge with dwarven star-metal.')).
quest_objective(forge_eternal, 3, objective('Create the legendary Aetherblade, a weapon of immense power.')).
quest_reward(forge_eternal, experience, 600).
quest_reward(forge_eternal, gold, 500).
quest_available(Player, forge_eternal) :-
    quest(forge_eternal, _, _, _, active).
