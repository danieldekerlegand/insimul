%% Insimul Truths: Steampunk
%% Source: data/worlds/steampunk/truths.pl
%% Created: 2026-04-03
%% Total: 16 truths
%%
%% Predicate schema:
%%   truth/3 -- truth(AtomId, Title, EntryType)
%%   truth_content/2, truth_importance/2, truth_timestep/2

%% Steam Power Dominance
truth(steam_power_dominance, 'Steam Power Dominance', world_fact).
truth_content(steam_power_dominance, 'Steam is the primary energy source for all industry and transportation. Every building in Ironhaven connects to the municipal steam grid through a network of brass pipes and pressure valves.').
truth_importance(steam_power_dominance, 10).
truth_timestep(steam_power_dominance, 0).

%% Aether Energy
truth(aether_energy, 'Aether Energy', world_fact).
truth_content(aether_energy, 'Aether crystals are a rare energy source mined deep underground. They power advanced devices that steam alone cannot drive. The Voss family controls most aether research.').
truth_importance(aether_energy, 9).
truth_timestep(aether_energy, 0).

%% Airship Travel
truth(airship_travel, 'Airship Travel', world_fact).
truth_content(airship_travel, 'Airships are the primary means of long-distance transport. They run on a combination of heated gas and steam-driven propellers. The Hargrove family operates the largest commercial fleet.').
truth_importance(airship_travel, 9).
truth_timestep(airship_travel, 0).

%% Automaton Labor
truth(automaton_labor, 'Automaton Labor', social_rule).
truth_content(automaton_labor, 'Clockwork automatons perform dangerous and repetitive tasks in mines and factories. A growing political movement questions whether they deserve legal protections.').
truth_importance(automaton_labor, 8).
truth_timestep(automaton_labor, 0).

%% Class Divide
truth(class_divide, 'Class Divide', social_rule).
truth_content(class_divide, 'Ironhaven society divides sharply between the wealthy industrialists of Clocktower Heights and the laborers of Boiler Ward. Crossing this boundary requires money, invention, or cunning.').
truth_importance(class_divide, 8).
truth_timestep(class_divide, 0).

%% Guild System
truth(guild_system, 'Guild System', social_rule).
truth_content(guild_system, 'Trade guilds govern most professions. The Pipefitters Union, the Airship Pilots Guild, and the Inventors Society each hold considerable political influence in the Steam Republic.').
truth_importance(guild_system, 7).
truth_timestep(guild_system, 0).

%% The Great Boiler
truth(great_boiler, 'The Great Boiler', world_fact).
truth_content(great_boiler, 'The Great Boiler is a massive steam generator at the heart of Boiler Ward. Built in 1788, it powers the entire district. Its rhythmic thumping is audible throughout Ironhaven.').
truth_importance(great_boiler, 7).
truth_timestep(great_boiler, 0).

%% Pneumatic Messaging
truth(pneumatic_messaging, 'Pneumatic Messaging', world_fact).
truth_content(pneumatic_messaging, 'A network of brass pneumatic tubes connects every major building in Ironhaven. Messages travel in sealed canisters at high speed. It is the primary communication system.').
truth_importance(pneumatic_messaging, 6).
truth_timestep(pneumatic_messaging, 0).

%% Clockwork Etiquette
truth(clockwork_etiquette, 'Clockwork Etiquette', cultural_norm).
truth_content(clockwork_etiquette, 'Punctuality is the highest social virtue in the Steam Republic. Arriving late is considered deeply offensive. Every citizen carries a pocket watch, and the Grand Clocktower sets the official time.').
truth_importance(clockwork_etiquette, 7).
truth_timestep(clockwork_etiquette, 0).

%% Copper Currency
truth(copper_currency, 'Copper Currency', world_fact).
truth_content(copper_currency, 'The Steam Republic uses copper cogs as currency. One hundred cogs make one brass crown. Aether crystals serve as high-value trade goods between wealthy merchants.').
truth_importance(copper_currency, 6).
truth_timestep(copper_currency, 0).

%% Sky Pirates
truth(sky_pirates, 'Sky Pirates', world_fact).
truth_content(sky_pirates, 'Rogue airship crews prey on commercial shipping routes between settlements. Sky piracy is punishable by exile, but many smugglers operate from the boarding houses near the Skyport.').
truth_importance(sky_pirates, 7).
truth_timestep(sky_pirates, 0).

%% Smog and Health
truth(smog_health, 'Smog and Health', world_fact).
truth_content(smog_health, 'Coal smoke and industrial runoff create a persistent smog over Boiler Ward and Foundry Row. Brass goggles and filter scarves are worn daily by workers. Respiratory illness is common.').
truth_importance(smog_health, 6).
truth_timestep(smog_health, 0).

%% Invention Patents
truth(invention_patents, 'Invention Patents', social_rule).
truth_content(invention_patents, 'Inventors register patents at the Academy. A successful patent grants exclusive manufacturing rights for twenty years. Patent theft is treated as seriously as physical theft.').
truth_importance(invention_patents, 6).
truth_timestep(invention_patents, 0).

%% Dress Code
truth(dress_code, 'Dress Code', cultural_norm).
truth_content(dress_code, 'Formal attire is expected in Clocktower Heights: top hats, waistcoats, and brass-buckled boots. Workers in Boiler Ward wear heavy leather aprons and goggles as both protection and identity.').
truth_importance(dress_code, 5).
truth_timestep(dress_code, 0).

%% The Aether Spire
truth(aether_spire_truth, 'The Aether Spire', world_fact).
truth_content(aether_spire_truth, 'The Aether Spire rises above Clocktower Heights as both a lightning rod and an experimental aether collector. Dr. Helena Voss designed it. Some claim it can predict storms.').
truth_importance(aether_spire_truth, 7).
truth_timestep(aether_spire_truth, 0).

%% Tea Culture
truth(tea_culture, 'Tea Culture', cultural_norm).
truth_content(tea_culture, 'Afternoon tea is a daily ritual across all social classes. The Ticktock Cafe on Pendulum Street is the most fashionable tea room. Business deals are often sealed over a shared pot.').
truth_importance(tea_culture, 5).
truth_timestep(tea_culture, 0).
