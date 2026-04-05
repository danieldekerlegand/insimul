%% Insimul Truths: Generic Fantasy World
%% Source: data/worlds/generic/truths.pl
%% Created: 2026-04-03
%% Total: 18 truths
%%
%% Predicate schema:
%%   truth/3 -- truth(AtomId, Title, EntryType)
%%   truth_content/2, truth_importance/2, truth_timestep/2

%% Guild Law
truth(guild_law, 'Guild Law', social_rule).
truth_content(guild_law, 'Every craft and trade in the realm is governed by its respective guild. Operating without guild membership invites fines, confiscation, and social ostracism.').
truth_importance(guild_law, 8).
truth_timestep(guild_law, 0).

%% Barter Economy
truth(barter_economy, 'Barter and Coin', social_rule).
truth_content(barter_economy, 'While copper, silver, and gold coins circulate in towns, rural villages still rely heavily on barter. A bushel of grain or a day of labor are common units of exchange.').
truth_importance(barter_economy, 7).
truth_timestep(barter_economy, 0).

%% Tavern as Social Hub
truth(tavern_social_hub, 'The Tavern as Social Hub', cultural_norm).
truth_content(tavern_social_hub, 'Taverns serve as the center of community life. News, rumors, job postings, and political debates all flow through the common room. Travelers are expected to share stories in exchange for hospitality.').
truth_importance(tavern_social_hub, 8).
truth_timestep(tavern_social_hub, 0).

%% Feudal Loyalty
truth(feudal_loyalty, 'Feudal Loyalty', social_rule).
truth_content(feudal_loyalty, 'Commoners owe service and taxes to their local lord, who in turn owes fealty to the regional baron. Breaking this chain of loyalty is considered treasonous.').
truth_importance(feudal_loyalty, 9).
truth_timestep(feudal_loyalty, 0).

%% Healing Herbs
truth(healing_herbs, 'Herbal Medicine', cultural_norm).
truth_content(healing_herbs, 'Trained healers use poultices, tinctures, and herb-lore passed down through generations. Common folk trust herbalists more than alchemists, whose potions are seen as unpredictable.').
truth_importance(healing_herbs, 6).
truth_timestep(healing_herbs, 0).

%% Harvest Festival
truth(harvest_festival, 'The Harvest Festival', cultural_norm).
truth_content(harvest_festival, 'Each autumn the settlements hold a week-long harvest festival with feasting, games, and a bonfire. It marks the end of the growing season and the beginning of winter preparations.').
truth_importance(harvest_festival, 7).
truth_timestep(harvest_festival, 0).

%% Road Wardens
truth(road_wardens, 'Road Wardens', social_rule).
truth_content(road_wardens, 'Armed wardens patrol the main trade roads between settlements. Travel off the main roads is dangerous and undertaken only by the brave or the desperate.').
truth_importance(road_wardens, 7).
truth_timestep(road_wardens, 0).

%% Smithing Respect
truth(smithing_respect, 'The Smiths Respect', cultural_norm).
truth_content(smithing_respect, 'Blacksmiths hold a special place in society. They forge the tools that feed the town and the weapons that defend it. Insulting a smith is considered deeply unwise.').
truth_importance(smithing_respect, 6).
truth_timestep(smithing_respect, 0).

%% Temple Sanctuary
truth(temple_sanctuary, 'Temple Sanctuary', social_rule).
truth_content(temple_sanctuary, 'Any person who enters a temple and claims sanctuary cannot be forcibly removed. This ancient law is respected even by kings, though the duration of protection varies by local custom.').
truth_importance(temple_sanctuary, 8).
truth_timestep(temple_sanctuary, 0).

%% Market Day
truth(market_day, 'Market Day', social_rule).
truth_content(market_day, 'Once a week, merchants and farmers converge on the town square for market day. Prices fluctuate based on season and supply. Haggling is expected and even enjoyed.').
truth_importance(market_day, 7).
truth_timestep(market_day, 0).

%% Apprenticeship System
truth(apprenticeship_system, 'Apprenticeship System', social_rule).
truth_content(apprenticeship_system, 'Young people are placed with a master craftsperson at age twelve for a seven-year apprenticeship. The master provides food and shelter in exchange for labor and eventual guild entry.').
truth_importance(apprenticeship_system, 8).
truth_timestep(apprenticeship_system, 0).

%% Monster Threat
truth(monster_threat, 'Monsters Beyond the Walls', world_lore).
truth_content(monster_threat, 'Wolves, goblins, and worse lurk in the deep forest and mountain passes. Settlements maintain walls and watchtowers as a first line of defense against these threats.').
truth_importance(monster_threat, 9).
truth_timestep(monster_threat, 0).

%% Magic Suspicion
truth(magic_suspicion, 'Suspicion of Magic', cultural_norm).
truth_content(magic_suspicion, 'Common folk regard magic with a mixture of awe and fear. Hedge witches are tolerated for their healing, but open displays of arcane power invite suspicion and sometimes hostility.').
truth_importance(magic_suspicion, 8).
truth_timestep(magic_suspicion, 0).

%% Hospitality Code
truth(hospitality_code, 'Hospitality to Travelers', cultural_norm).
truth_content(hospitality_code, 'Offering a warm meal and a dry bed to a weary traveler is considered a sacred duty. Those who turn away strangers risk ill fortune and the scorn of their neighbors.').
truth_importance(hospitality_code, 7).
truth_timestep(hospitality_code, 0).

%% Elder Council
truth(elder_council, 'The Elder Council', social_rule).
truth_content(elder_council, 'Villages without a lord are governed by a council of elders chosen for their wisdom and experience. Disputes are settled by majority vote after open deliberation.').
truth_importance(elder_council, 7).
truth_timestep(elder_council, 0).

%% Death Rites
truth(death_rites, 'Death Rites', cultural_norm).
truth_content(death_rites, 'The dead are buried facing east before sundown. A vigil is kept through the night with candles and song. Failure to observe these rites is believed to invite restless spirits.').
truth_importance(death_rites, 6).
truth_timestep(death_rites, 0).

%% Oath Binding
truth(oath_binding, 'The Weight of Oaths', social_rule).
truth_content(oath_binding, 'A sworn oath is considered magically and socially binding. Oathbreakers are branded and shunned from all guilds and markets. Even lords think twice before breaking a public vow.').
truth_importance(oath_binding, 9).
truth_timestep(oath_binding, 0).

%% Seasonal Migrations
truth(seasonal_migrations, 'Seasonal Herding', world_lore).
truth_content(seasonal_migrations, 'Shepherds move their flocks to highland pastures in summer and return to lowland shelters before the first frost. This migration shapes trade routes and seasonal labor needs.').
truth_importance(seasonal_migrations, 5).
truth_timestep(seasonal_migrations, 0).
