%% Insimul Truths: Tropical Pirate
%% Source: data/worlds/tropical_pirate/truths.pl
%% Created: 2026-04-03
%% Total: 16 truths
%%
%% Predicate schema:
%%   truth/3 -- truth(AtomId, Title, EntryType)
%%   truth_content/2, truth_importance/2, truth_timestep/2

%% The Pirate Code
truth(pirate_code, 'The Pirate Code', social_rule).
truth_content(pirate_code, 'Every pirate crew operates under articles of agreement. These cover the division of plunder, compensation for injury, duties aboard ship, and voting rights. Breaking the code means exile or worse.').
truth_importance(pirate_code, 10).
truth_timestep(pirate_code, 0).

%% Democratic Captaincy
truth(democratic_captaincy, 'Democratic Captaincy', social_rule).
truth_content(democratic_captaincy, 'Pirate captains are elected by crew vote and can be removed the same way. The quartermaster handles daily discipline and divides the loot. This is more democratic than any navy.').
truth_importance(democratic_captaincy, 9).
truth_timestep(democratic_captaincy, 0).

%% Letters of Marque
truth(letters_of_marque, 'Letters of Marque', world_fact).
truth_content(letters_of_marque, 'Colonial powers issue letters of marque that authorize private ships to attack enemy vessels. Privateers are legal pirates; the difference is a piece of paper and which flag you serve.').
truth_importance(letters_of_marque, 8).
truth_timestep(letters_of_marque, 0).

%% Port Royal Free Port
truth(port_royal_free, 'Port Royal as Free Port', world_fact).
truth_content(port_royal_free, 'Port Royal tolerates pirates because they spend lavishly and defend the port against foreign navies. The governor looks the other way as long as ships fly the right colors when entering harbor.').
truth_importance(port_royal_free, 9).
truth_timestep(port_royal_free, 0).

%% Spanish Treasure Fleets
truth(treasure_fleets, 'Spanish Treasure Fleets', world_fact).
truth_content(treasure_fleets, 'Twice a year, heavily armed Spanish galleons carry gold, silver, and gems from the New World back to Spain. Intercepting even one ship can make a crew wealthy for life.').
truth_importance(treasure_fleets, 8).
truth_timestep(treasure_fleets, 0).

%% Scurvy Prevention
truth(scurvy_prevention, 'Scurvy at Sea', world_fact).
truth_content(scurvy_prevention, 'Long voyages without fresh fruit cause scurvy -- bleeding gums, loose teeth, and death. Experienced captains stock limes and sauerkraut. Many crews are not so lucky.').
truth_importance(scurvy_prevention, 7).
truth_timestep(scurvy_prevention, 0).

%% Rum Rations
truth(rum_rations, 'Rum Rations', cultural_norm).
truth_content(rum_rations, 'Every sailor receives a daily ration of rum, often mixed with water as grog. Rum serves as currency, medicine, morale booster, and social lubricant. Running out means trouble.').
truth_importance(rum_rations, 7).
truth_timestep(rum_rations, 0).

%% Navigation by Stars
truth(star_navigation, 'Navigation by Stars', world_fact).
truth_content(star_navigation, 'Without GPS or reliable charts, sailors navigate by the stars, compass, and dead reckoning. A skilled navigator is worth their weight in gold to any captain.').
truth_importance(star_navigation, 7).
truth_timestep(star_navigation, 0).

%% Boarding Tactics
truth(boarding_tactics, 'Boarding Tactics', world_fact).
truth_content(boarding_tactics, 'Pirates prefer to capture ships intact rather than sink them. They fire chain shot to disable rigging, then board with grappling hooks. Intimidation through the Jolly Roger often prompts surrender.').
truth_importance(boarding_tactics, 8).
truth_timestep(boarding_tactics, 0).

%% The Black Spot
truth(black_spot, 'The Black Spot', cultural_norm).
truth_content(black_spot, 'Receiving a black spot -- a piece of paper marked with a charcoal circle -- is a pirate death sentence. It means the crew has voted to remove you, permanently.').
truth_importance(black_spot, 6).
truth_timestep(black_spot, 0).

%% Tortuga Lawlessness
truth(tortuga_lawless, 'Tortuga Lawlessness', world_fact).
truth_content(tortuga_lawless, 'Isla Tortuga recognizes no law or authority. It is a haven for the most desperate and dangerous pirates. Disputes are settled with blades. Only the strong survive the night.').
truth_importance(tortuga_lawless, 8).
truth_timestep(tortuga_lawless, 0).

%% Marooning
truth(marooning, 'Marooning', social_rule).
truth_content(marooning, 'The worst punishment in the pirate code is marooning: being left on a deserted island with a single pistol and one shot. It is reserved for traitors, thieves, and mutineers.').
truth_importance(marooning, 7).
truth_timestep(marooning, 0).

%% Trade Winds
truth(trade_winds, 'Trade Winds', world_fact).
truth_content(trade_winds, 'The Caribbean trade winds blow reliably from east to west. Captains who understand wind patterns can outrun pursuers and arrive at destinations faster. Ignoring the winds means becalming.').
truth_importance(trade_winds, 6).
truth_timestep(trade_winds, 0).

%% Fort San Felipe
truth(fort_san_felipe_truth, 'Fort San Felipe', world_fact).
truth_content(fort_san_felipe_truth, 'The Spanish fortress at San Castillo bristles with heavy cannons and a garrison of trained soldiers. Attacking it directly is suicide. Pirates must use cunning, not force.').
truth_importance(fort_san_felipe_truth, 7).
truth_timestep(fort_san_felipe_truth, 0).

%% Pirate Tattoos
truth(pirate_tattoos, 'Pirate Tattoos', cultural_norm).
truth_content(pirate_tattoos, 'Tattoos mark a pirate history: a turtle for crossing the equator, an anchor for the Atlantic, a swallow for every five thousand miles sailed. They are a map of experience.').
truth_importance(pirate_tattoos, 5).
truth_timestep(pirate_tattoos, 0).

%% Pirate Women
truth(pirate_women, 'Women on Pirate Ships', social_rule).
truth_content(pirate_women, 'While many crews ban women aboard, some of the most feared pirates are women. They fight, command, and navigate as well as any man. Ability matters more than custom on the open sea.').
truth_importance(pirate_women, 7).
truth_timestep(pirate_women, 0).
