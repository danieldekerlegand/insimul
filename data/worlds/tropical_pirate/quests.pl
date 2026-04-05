%% Insimul Quests: Tropical Pirate
%% Source: data/worlds/tropical_pirate/quests.pl
%% Created: 2026-04-03
%% Total: 12 quests

%% ═══════════════════════════════════════════════════════════
%% Beginner Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Tavern Tales
quest(tavern_tales, 'Tavern Tales', social, beginner, active).
quest_assigned_to(tavern_tales, '{{player}}').
quest_tag(tavern_tales, generated).
quest_objective(tavern_tales, 0, talk_to('mama_celeste', 1)).
quest_objective(tavern_tales, 1, objective('Buy a round of rum at The Rusty Anchor.')).
quest_objective(tavern_tales, 2, objective('Hear three pirate stories from the tavern regulars.')).
quest_reward(tavern_tales, experience, 80).
quest_reward(tavern_tales, gold, 40).
quest_available(Player, tavern_tales) :-
    quest(tavern_tales, _, _, _, active).

%% Quest: Deck Swab
quest(deck_swab, 'Deck Swab', fetch, beginner, active).
quest_assigned_to(deck_swab, '{{player}}').
quest_tag(deck_swab, generated).
quest_objective(deck_swab, 0, talk_to('jack_hawkins', 1)).
quest_objective(deck_swab, 1, objective('Fetch rope and tar from Sea Dog Chandlery.')).
quest_objective(deck_swab, 2, objective('Deliver supplies to the ship at the Main Docks.')).
quest_reward(deck_swab, experience, 80).
quest_reward(deck_swab, gold, 30).
quest_available(Player, deck_swab) :-
    quest(deck_swab, _, _, _, active).

%% Quest: The Cartographer Apprentice
quest(cartographer_apprentice, 'The Cartographer Apprentice', exploration, beginner, active).
quest_assigned_to(cartographer_apprentice, '{{player}}').
quest_tag(cartographer_apprentice, generated).
quest_objective(cartographer_apprentice, 0, talk_to('hana_sato', 1)).
quest_objective(cartographer_apprentice, 1, objective('Help Hana chart the coastline around Port Royal.')).
quest_objective(cartographer_apprentice, 2, objective('Record the depth soundings at three harbor points.')).
quest_reward(cartographer_apprentice, experience, 100).
quest_reward(cartographer_apprentice, gold, 50).
quest_available(Player, cartographer_apprentice) :-
    quest(cartographer_apprentice, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Intermediate Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Smuggler Run
quest(smuggler_run, 'Smuggler Run', stealth, intermediate, active).
quest_assigned_to(smuggler_run, '{{player}}').
quest_tag(smuggler_run, generated).
quest_objective(smuggler_run, 0, talk_to('silas_crow', 1)).
quest_objective(smuggler_run, 1, objective('Sneak cargo past the Spanish patrol into San Castillo.')).
quest_objective(smuggler_run, 2, objective('Deliver the goods to the contact at La Corona Tavern.')).
quest_objective(smuggler_run, 3, objective('Return without being detected.')).
quest_reward(smuggler_run, experience, 250).
quest_reward(smuggler_run, gold, 150).
quest_available(Player, smuggler_run) :-
    quest(smuggler_run, _, _, _, active).

%% Quest: Buried Treasure
quest(buried_treasure, 'Buried Treasure', exploration, intermediate, active).
quest_assigned_to(buried_treasure, '{{player}}').
quest_tag(buried_treasure, generated).
quest_objective(buried_treasure, 0, objective('Acquire a treasure map from Claude Dubois at Gilded Parrot Jewelers.')).
quest_objective(buried_treasure, 1, objective('Decode the map markings with help from Hana Sato.')).
quest_objective(buried_treasure, 2, objective('Sail to the marked island and dig at the palm tree.')).
quest_objective(buried_treasure, 3, objective('Defeat the rival pirates guarding the dig site.')).
quest_reward(buried_treasure, experience, 300).
quest_reward(buried_treasure, gold, 200).
quest_available(Player, buried_treasure) :-
    quest(buried_treasure, _, _, _, active).

%% Quest: Ship Repair
quest(ship_repair, 'Ship Repair', fetch, intermediate, active).
quest_assigned_to(ship_repair, '{{player}}').
quest_tag(ship_repair, generated).
quest_objective(ship_repair, 0, talk_to('barnacle_bill', 1)).
quest_objective(ship_repair, 1, objective('Gather timber from the jungle interior.')).
quest_objective(ship_repair, 2, objective('Find pitch for waterproofing at the chandlery.')).
quest_objective(ship_repair, 3, objective('Assist Bill in patching the hull breach.')).
quest_reward(ship_repair, experience, 200).
quest_reward(ship_repair, gold, 100).
quest_available(Player, ship_repair) :-
    quest(ship_repair, _, _, _, active).

%% Quest: The Gambling Debt
quest(gambling_debt, 'The Gambling Debt', social, intermediate, active).
quest_assigned_to(gambling_debt, '{{player}}').
quest_tag(gambling_debt, generated).
quest_objective(gambling_debt, 0, objective('Visit Fortune Favors gambling den.')).
quest_objective(gambling_debt, 1, objective('Win enough at dice to pay off Silas Crow debt.')).
quest_objective(gambling_debt, 2, objective('Alternatively, find the cheater rigging the games.')).
quest_reward(gambling_debt, experience, 250).
quest_reward(gambling_debt, gold, 120).
quest_available(Player, gambling_debt) :-
    quest(gambling_debt, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Advanced Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Raid on San Castillo
quest(raid_san_castillo, 'Raid on San Castillo', combat, advanced, active).
quest_assigned_to(raid_san_castillo, '{{player}}').
quest_tag(raid_san_castillo, generated).
quest_objective(raid_san_castillo, 0, talk_to('jack_hawkins', 1)).
quest_objective(raid_san_castillo, 1, objective('Plan the assault with Captain Hawkins and Anne Blacktide.')).
quest_objective(raid_san_castillo, 2, objective('Disable the cannons at Fort San Felipe.')).
quest_objective(raid_san_castillo, 3, objective('Raid the governor treasury and escape by ship.')).
quest_reward(raid_san_castillo, experience, 500).
quest_reward(raid_san_castillo, gold, 400).
quest_available(Player, raid_san_castillo) :-
    quest(raid_san_castillo, _, _, _, active).

%% Quest: The Kraken Myth
quest(kraken_myth, 'The Kraken Myth', exploration, advanced, active).
quest_assigned_to(kraken_myth, '{{player}}').
quest_tag(kraken_myth, generated).
quest_objective(kraken_myth, 0, talk_to('morgan_flint', 1)).
quest_objective(kraken_myth, 1, objective('Investigate reports of a giant sea creature near Skull Rock.')).
quest_objective(kraken_myth, 2, objective('Dive beneath the cliffs to find the creature lair.')).
quest_objective(kraken_myth, 3, objective('Survive the encounter and bring back proof.')).
quest_reward(kraken_myth, experience, 450).
quest_reward(kraken_myth, gold, 250).
quest_available(Player, kraken_myth) :-
    quest(kraken_myth, _, _, _, active).

%% Quest: Mutiny on the Crimson Tide
quest(mutiny_crimson_tide, 'Mutiny on the Crimson Tide', social, advanced, active).
quest_assigned_to(mutiny_crimson_tide, '{{player}}').
quest_tag(mutiny_crimson_tide, generated).
quest_objective(mutiny_crimson_tide, 0, talk_to('anne_blacktide', 1)).
quest_objective(mutiny_crimson_tide, 1, objective('Discover a mutiny plot brewing among the crew.')).
quest_objective(mutiny_crimson_tide, 2, objective('Choose to support the captain or join the mutineers.')).
quest_objective(mutiny_crimson_tide, 3, objective('Resolve the conflict before it tears the crew apart.')).
quest_reward(mutiny_crimson_tide, experience, 500).
quest_reward(mutiny_crimson_tide, gold, 300).
quest_available(Player, mutiny_crimson_tide) :-
    quest(mutiny_crimson_tide, _, _, _, active).

%% Quest: The Governor Daughter
quest(governor_daughter, 'The Governor Daughter', social, advanced, active).
quest_assigned_to(governor_daughter, '{{player}}').
quest_tag(governor_daughter, generated).
quest_objective(governor_daughter, 0, talk_to('estrella_santos', 1)).
quest_objective(governor_daughter, 1, objective('Discover that Sofia de la Cruz has been secretly aiding pirates.')).
quest_objective(governor_daughter, 2, objective('Decide whether to expose her or keep her secret.')).
quest_objective(governor_daughter, 3, objective('Navigate the political fallout of your decision.')).
quest_reward(governor_daughter, experience, 450).
quest_reward(governor_daughter, gold, 200).
quest_available(Player, governor_daughter) :-
    quest(governor_daughter, _, _, _, active).

%% Quest: The Lost Fleet
quest(lost_fleet, 'The Lost Fleet', exploration, advanced, active).
quest_assigned_to(lost_fleet, '{{player}}').
quest_tag(lost_fleet, generated).
quest_objective(lost_fleet, 0, objective('Discover an old logbook mentioning a sunken treasure fleet.')).
quest_objective(lost_fleet, 1, talk_to('hana_sato', 1)).
quest_objective(lost_fleet, 2, objective('Navigate through treacherous reefs to the wreck site.')).
quest_objective(lost_fleet, 3, objective('Salvage treasure while fending off rival ships.')).
quest_reward(lost_fleet, experience, 600).
quest_reward(lost_fleet, gold, 500).
quest_available(Player, lost_fleet) :-
    quest(lost_fleet, _, _, _, active).
