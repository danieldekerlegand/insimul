%% Insimul Narratives: Wild West -- Redemption Gulch
%% Source: data/worlds/wild_west/narratives.pl
%% Created: 2026-04-03
%% Total: 6 narratives
%%
%% Predicate schema:
%%   narrative/3 -- narrative(AtomId, Title, NarrativeType)
%%   narrative_description/2, narrative_trigger/2
%%   narrative_step/3 -- narrative_step(NarrativeAtom, StepIndex, StepContent)
%%   narrative_faction/2, narrative_location/2

%% The Ketchum Gang
narrative(the_ketchum_gang, 'The Ketchum Gang', main_arc).
narrative_description(the_ketchum_gang, 'Black Jack Ketchum and his gang are planning a major heist on the Redemption Savings and Trust. The sheriff needs help.').
narrative_faction(the_ketchum_gang, law).
narrative_faction(the_ketchum_gang, ketchum_gang).
narrative_location(the_ketchum_gang, redemption_gulch).
narrative_trigger(the_ketchum_gang, (timestep(T), T > 3)).
narrative_step(the_ketchum_gang, 0, 'Rumors of outlaw scouts seen near town reach the Silver Spur Saloon.').
narrative_step(the_ketchum_gang, 1, 'Sheriff Holden recruits the player to investigate Copper Ridge.').
narrative_step(the_ketchum_gang, 2, 'The gang robs the bank. The player must choose to fight or pursue.').
narrative_step(the_ketchum_gang, 3, 'A final showdown with Jack Ketchum at the Silver Lode Mine entrance.').
narrative_step(the_ketchum_gang, 4, 'Justice is served -- or the gang escapes into the territory.').

%% Iron Horse
narrative(iron_horse, 'Iron Horse', main_arc).
narrative_description(iron_horse, 'Cornelius Thorne wants to extend the railroad through McCoy land. The conflict between progress and tradition threatens to tear the town apart.').
narrative_faction(iron_horse, railroad).
narrative_faction(iron_horse, ranchers).
narrative_location(iron_horse, redemption_gulch).
narrative_trigger(iron_horse, (relationship(cornelius_thorne, walt_mccoy, R), R == rival)).
narrative_step(iron_horse, 0, 'Thorne arrives in town with surveyors and a government land grant.').
narrative_step(iron_horse, 1, 'Walt McCoy refuses to sell. Thorne begins pressuring other landowners.').
narrative_step(iron_horse, 2, 'Sabotage hits the rail depot -- was it the ranchers or the Ketchum gang?').
narrative_step(iron_horse, 3, 'The player must broker peace or pick a side before violence erupts.').
narrative_step(iron_horse, 4, 'A town meeting decides the fate of the railroad extension.').

%% The Silver Lode
narrative(the_silver_lode, 'The Silver Lode', faction_arc).
narrative_description(the_silver_lode, 'A rich new vein is discovered at Copper Ridge, attracting claim jumpers and drawing the attention of the Ketchum gang.').
narrative_faction(the_silver_lode, miners).
narrative_location(the_silver_lode, copper_ridge).
narrative_trigger(the_silver_lode, (timestep(T), T > 5)).
narrative_step(the_silver_lode, 0, 'Mae Li reports the discovery of a massive silver vein.').
narrative_step(the_silver_lode, 1, 'Prospectors flood into Copper Ridge. Tensions rise with the established miners.').
narrative_step(the_silver_lode, 2, 'A suspicious cave-in traps miners. Sabotage is suspected.').
narrative_step(the_silver_lode, 3, 'The player investigates and discovers who is behind the attacks.').

%% Redemption
narrative(redemption, 'Redemption', character_arc).
narrative_description(redemption, 'Rosa Delgado wants to leave the Ketchum gang but fears retribution. She approaches the player for help starting a new life.').
narrative_faction(redemption, ketchum_gang).
narrative_location(redemption, redemption_gulch).
narrative_trigger(redemption, (attribute(rosa_delgado, cunningness, C), C > 65)).
narrative_step(redemption, 0, 'Rosa secretly passes information about gang movements to the player.').
narrative_step(redemption, 1, 'Jack Ketchum becomes suspicious of a leak in the gang.').
narrative_step(redemption, 2, 'The player must help Rosa escape before Ketchum discovers the truth.').
narrative_step(redemption, 3, 'Choose: deliver Rosa to the sheriff for the bounty, or help her disappear.').

%% The Gazette Expose
narrative(the_gazette_expose, 'The Gazette Expose', side_arc).
narrative_description(the_gazette_expose, 'Eustace Polk is investigating Cornelius Thorne and discovers the railroad baron is bribing federal officials. Publishing could change everything.').
narrative_faction(the_gazette_expose, townsfolk).
narrative_faction(the_gazette_expose, railroad).
narrative_location(the_gazette_expose, redemption_gulch).
narrative_trigger(the_gazette_expose, (attribute(eustace_polk, cunningness, C), C > 70)).
narrative_step(the_gazette_expose, 0, 'Polk asks the player to help gather evidence against Thorne.').
narrative_step(the_gazette_expose, 1, 'Break into the telegraph office at night to find incriminating messages.').
narrative_step(the_gazette_expose, 2, 'Thorne offers a bribe to kill the story. Polk wavers.').
narrative_step(the_gazette_expose, 3, 'The player decides: help publish, accept the bribe, or find a third way.').

%% Sunday Peace
narrative(sunday_peace, 'Sunday Peace', side_arc).
narrative_description(sunday_peace, 'Reverend Crane organizes a charity drive for Copper Ridge miners, but discovers the mine owners are underpaying workers and pocketing relief funds.').
narrative_faction(sunday_peace, townsfolk).
narrative_faction(sunday_peace, miners).
narrative_location(sunday_peace, redemption_gulch).
narrative_trigger(sunday_peace, (attribute(josiah_crane, propriety, P), P > 85)).
narrative_step(sunday_peace, 0, 'Reverend Crane asks the player to help collect donations after Sunday service.').
narrative_step(sunday_peace, 1, 'Delivering supplies to Copper Ridge reveals terrible working conditions.').
narrative_step(sunday_peace, 2, 'Mae Li shares evidence of wage theft by distant mine investors.').
narrative_step(sunday_peace, 3, 'Organize the miners, appeal to the law, or take matters into your own hands.').
