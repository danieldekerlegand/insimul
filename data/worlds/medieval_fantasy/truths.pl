%% Insimul Truths: Medieval Fantasy
%% Source: data/worlds/medieval_fantasy/truths.pl
%% Created: 2026-04-03
%% Total: 18 truths
%%
%% Predicate schema:
%%   truth/3 -- truth(AtomId, Title, EntryType)
%%   truth_content/2, truth_importance/2, truth_timestep/2

%% Feudal Hierarchy
truth(feudal_hierarchy, 'Feudal Hierarchy', social_rule).
truth_content(feudal_hierarchy, 'The Kingdom of Valdris follows a strict feudal hierarchy. The king rules from Aldenmere, with lords governing provinces. Knights serve lords, commoners serve knights. Challenging the order is punishable by law.').
truth_importance(feudal_hierarchy, 10).
truth_timestep(feudal_hierarchy, 0).

%% Magic is Rare and Feared
truth(magic_rare_feared, 'Magic is Rare and Feared', cultural_norm).
truth_content(magic_rare_feared, 'True magical ability is uncommon and often mistrusted by commoners. Only the court wizard Thalendros and a handful of hedge witches practice openly. Unlicensed magic use can lead to arrest.').
truth_importance(magic_rare_feared, 9).
truth_timestep(magic_rare_feared, 0).

%% The Code of Chivalry
truth(code_of_chivalry, 'The Code of Chivalry', social_rule).
truth_content(code_of_chivalry, 'Knights of Valdris swear oaths to protect the weak, speak truthfully, show mercy to the defeated, and serve the crown faithfully. Breaking this code brings dishonor to the entire family name.').
truth_importance(code_of_chivalry, 9).
truth_timestep(code_of_chivalry, 0).

%% Dragon Threat
truth(dragon_threat, 'The Dragon of Silverdeep', world_lore).
truth_content(dragon_threat, 'A great dragon has claimed the abandoned shafts of Silverdeep as its lair. The dwarves have sealed off the lower tunnels. Occasional tremors and smoke plumes remind everyone the beast is still there.').
truth_importance(dragon_threat, 8).
truth_timestep(dragon_threat, 0).

%% Fey Presence
truth(fey_presence, 'The Fey of Thornhaven', world_lore).
truth_content(fey_presence, 'The enchanted forest near Thornhaven is home to fey creatures. Liriel the guardian keeps an uneasy peace between the fey realm and the mortal village. Iron repels fey, and bargains with them are binding.').
truth_importance(fey_presence, 8).
truth_timestep(fey_presence, 0).

%% Guild System
truth(guild_system, 'The Guild System', social_rule).
truth_content(guild_system, 'All crafts and trades in Aldenmere are organized into guilds. Working without guild membership is illegal. The guilds regulate prices, quality, and apprenticeships. Guild Row is their administrative center.').
truth_importance(guild_system, 7).
truth_timestep(guild_system, 0).

%% Cathedral of Light
truth(cathedral_of_light, 'The Cathedral of Light', cultural_norm).
truth_content(cathedral_of_light, 'The dominant faith worships the Light, embodied in the sun. Father Aldwin leads services at the Cathedral. Holy days mark the solstices. Clerics can bless weapons and heal through prayer.').
truth_importance(cathedral_of_light, 8).
truth_timestep(cathedral_of_light, 0).

%% Tavern Culture
truth(tavern_culture, 'Tavern Culture', cultural_norm).
truth_content(tavern_culture, 'Taverns are the center of social life for commoners. The Gilded Flagon is where news, rumors, and deals circulate. Buying someone a drink is the fastest way to earn trust. Brawls are common but tolerated.').
truth_importance(tavern_culture, 6).
truth_timestep(tavern_culture, 0).

%% Dwarven Mining
truth(dwarven_mining, 'Dwarven Mining Traditions', cultural_norm).
truth_content(dwarven_mining, 'The dwarves of Silverdeep are master miners and smiths. They trade silver and gems for surface goods. Durek Stonehammer leads the forge masters. Dwarven-made weapons are the finest in the realm.').
truth_importance(dwarven_mining, 7).
truth_timestep(dwarven_mining, 0).

%% Borderland Dangers
truth(borderland_dangers, 'Borderland Dangers', world_lore).
truth_content(borderland_dangers, 'The roads between Aldenmere and Thornhaven pass through untamed borderlands. Bandits, wolves, and worse lurk in the forests. Travelers move in armed groups or hire mercenary escorts.').
truth_importance(borderland_dangers, 7).
truth_timestep(borderland_dangers, 0).

%% Royal Succession
truth(royal_succession, 'Royal Succession', social_rule).
truth_content(royal_succession, 'Prince Rowan Valdris is heir to the throne. Princess Elspeth has renounced claim to study magic. Rumors of a contested succession grow louder as the king ages. Noble houses position themselves for advantage.').
truth_importance(royal_succession, 8).
truth_timestep(royal_succession, 0).

%% Herbalism and Healing
truth(herbalism_healing, 'Herbalism and Healing', cultural_norm).
truth_content(herbalism_healing, 'Hedge witches and herbalists provide medicine to common folk who cannot afford clerical healing. Elara Willowshade in Thornhaven is renowned. The boundary between herbalism and forbidden magic is blurry.').
truth_importance(herbalism_healing, 6).
truth_timestep(herbalism_healing, 0).

%% Smuggling Network
truth(smuggling_network, 'The Smuggling Network', world_lore).
truth_content(smuggling_network, 'A smuggling ring operates from The Rusty Nail in the Commons. Kael Shadowmere is rumored to be involved. Stolen goods, banned potions, and forbidden spell components change hands in the back rooms.').
truth_importance(smuggling_network, 7).
truth_timestep(smuggling_network, 0).

%% Standing Stones
truth(standing_stones, 'The Ancient Standing Stones', world_lore).
truth_content(standing_stones, 'The standing stones at the forest edge of Thornhaven predate the kingdom by centuries. Nobody knows who built them. On certain nights they glow with arcane energy. Some say they are a gateway to the fey realm.').
truth_importance(standing_stones, 6).
truth_timestep(standing_stones, 0).

%% Trial by Combat
truth(trial_by_combat, 'Trial by Combat', social_rule).
truth_content(trial_by_combat, 'Disputes among nobles and knights may be settled by trial by combat. Both parties choose champions who fight until yield or death. The victor is deemed righteous by the Light. Commoners may not invoke this right.').
truth_importance(trial_by_combat, 6).
truth_timestep(trial_by_combat, 0).

%% Market Day
truth(market_day, 'Market Day', cultural_norm).
truth_content(market_day, 'Every seventh day is market day in Aldenmere. Farmers from surrounding villages bring produce. Traveling merchants arrive with exotic wares. Prices are best in the morning. Pickpockets thrive in the crowds.').
truth_importance(market_day, 5).
truth_timestep(market_day, 0).

%% Orc Warbands
truth(orc_warbands, 'Orc Warbands', world_lore).
truth_content(orc_warbands, 'Orc warbands occasionally raid frontier settlements from the Grey Mountains. Thornhaven has been attacked twice in recent memory. The crown stations a small garrison but response is often slow.').
truth_importance(orc_warbands, 7).
truth_timestep(orc_warbands, 0).

%% Apprenticeship Tradition
truth(apprenticeship_tradition, 'Apprenticeship Tradition', social_rule).
truth_content(apprenticeship_tradition, 'Young people enter apprenticeship around age twelve. A master teaches their craft for seven years. Bran Ironhand apprentices under his father Gareth. Completing apprenticeship earns guild membership and adult status.').
truth_importance(apprenticeship_tradition, 6).
truth_timestep(apprenticeship_tradition, 0).
