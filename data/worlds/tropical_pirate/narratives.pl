%% Insimul Narratives: Tropical Pirate
%% Source: data/worlds/tropical_pirate/narratives.pl
%% Created: 2026-04-03
%% Total: 6 narrative templates
%%
%% Predicate schema:
%%   narrative/3 -- narrative(AtomId, Title, NarrativeType)
%%   narrative_description/2, narrative_trigger/2
%%   narrative_step/3, narrative_outcome/3

%% The Treasure of Isla Perdida
narrative(treasure_isla_perdida, 'The Treasure of Isla Perdida', exploration).
narrative_description(treasure_isla_perdida, 'A legendary treasure map surfaces, sending multiple crews racing to find a buried fortune.').
narrative_trigger(treasure_isla_perdida, (trait(X, cunning), has_item(X, treasure_map))).
narrative_step(treasure_isla_perdida, 0, 'A dying sailor reveals a map to a treasure hoard on an uncharted island.').
narrative_step(treasure_isla_perdida, 1, 'Multiple pirate crews learn of the map and set sail.').
narrative_step(treasure_isla_perdida, 2, 'The island is protected by treacherous reefs and booby traps.').
narrative_step(treasure_isla_perdida, 3, 'A final confrontation on the beach determines who claims the gold.').
narrative_outcome(treasure_isla_perdida, success, 'The treasure is found and secured, making the crew legendary.').
narrative_outcome(treasure_isla_perdida, failure, 'The treasure was moved long ago; only a cryptic clue remains.').

%% Mutiny on the High Seas
narrative(mutiny_high_seas, 'Mutiny on the High Seas', conflict).
narrative_description(mutiny_high_seas, 'Discontent brews among the crew, threatening to overthrow the captain.').
narrative_trigger(mutiny_high_seas, (trait(X, greedy), attribute(X, cunningness, C), C > 70)).
narrative_step(mutiny_high_seas, 0, 'Crew members begin whispering about unfair division of plunder.').
narrative_step(mutiny_high_seas, 1, 'A faction forms around a charismatic dissenter.').
narrative_step(mutiny_high_seas, 2, 'The captain must address grievances or face open revolt.').
narrative_step(mutiny_high_seas, 3, 'A vote is called under the pirate code to decide the captain fate.').
narrative_outcome(mutiny_high_seas, success, 'The captain retains command through negotiation or force.').
narrative_outcome(mutiny_high_seas, failure, 'The captain is deposed and marooned on a deserted island.').

%% The Spanish Blockade
narrative(spanish_blockade, 'The Spanish Blockade', conflict).
narrative_description(spanish_blockade, 'The Spanish navy blockades Port Royal, cutting off supplies and trade.').
narrative_trigger(spanish_blockade, (trait(X, disciplined), location(X, san_castillo))).
narrative_step(spanish_blockade, 0, 'Spanish warships take position outside Port Royal harbor.').
narrative_step(spanish_blockade, 1, 'Food and rum supplies dwindle as weeks pass.').
narrative_step(spanish_blockade, 2, 'Pirates must unite to break the blockade or starve.').
narrative_step(spanish_blockade, 3, 'A daring nighttime assault on the flagship determines the outcome.').
narrative_outcome(spanish_blockade, success, 'The blockade is broken and the Spanish fleet withdraws.').
narrative_outcome(spanish_blockade, failure, 'Port Royal falls under Spanish control.').

%% The Governor Secret
narrative(governor_secret, 'The Governor Secret', political).
narrative_description(governor_secret, 'Evidence surfaces that Governor de la Cruz has been secretly funding pirates to attack rival colonies.').
narrative_trigger(governor_secret, (trait(X, calculating), trait(X, aristocratic))).
narrative_step(governor_secret, 0, 'A captured letter reveals payments from the governor to pirate captains.').
narrative_step(governor_secret, 1, 'Captain Hawkins considers how to use this leverage.').
narrative_step(governor_secret, 2, 'The governor sends assassins to silence anyone who knows.').
narrative_step(governor_secret, 3, 'A public confrontation forces the truth into the open.').
narrative_outcome(governor_secret, success, 'The governor is exposed and replaced; pirates gain a valuable ally.').
narrative_outcome(governor_secret, failure, 'The evidence is destroyed and the informants disappear.').

%% Hurricane Season
narrative(hurricane_season, 'Hurricane Season', natural_disaster).
narrative_description(hurricane_season, 'A massive hurricane threatens all three settlements, forcing enemies to cooperate for survival.').
narrative_trigger(hurricane_season, (location(X, port_royal), trait(X, resourceful))).
narrative_step(hurricane_season, 0, 'Dark clouds gather on the horizon and the barometer drops sharply.').
narrative_step(hurricane_season, 1, 'Ships must be secured and civilians moved to shelter.').
narrative_step(hurricane_season, 2, 'The storm strikes with devastating force.').
narrative_step(hurricane_season, 3, 'In the aftermath, survivors must rebuild and reckon with their losses.').
narrative_outcome(hurricane_season, success, 'The settlements survive with minimal loss due to good preparation.').
narrative_outcome(hurricane_season, failure, 'Major destruction; the balance of power in the Caribbean shifts.').

%% The Cursed Treasure
narrative(cursed_treasure, 'The Cursed Treasure', mystery).
narrative_description(cursed_treasure, 'A crew recovers treasure from a wreck, only to find misfortune following them everywhere.').
narrative_trigger(cursed_treasure, (trait(X, superstitious), trait(X, tough))).
narrative_step(cursed_treasure, 0, 'A haul of gold and gems is recovered from a sunken galleon.').
narrative_step(cursed_treasure, 1, 'Crew members begin suffering accidents and strange illnesses.').
narrative_step(cursed_treasure, 2, 'Superstitious sailors demand the treasure be returned to the sea.').
narrative_step(cursed_treasure, 3, 'The truth behind the misfortunes must be uncovered.').
narrative_outcome(cursed_treasure, success, 'The cause is revealed as sabotage, not a curse; the traitor is exposed.').
narrative_outcome(cursed_treasure, failure, 'The crew abandons the treasure in fear, and a rival claims it.').
