%% Insimul Truths: Realm of Aethermoor
%% Source: data/worlds/realm_of_aethermoor/truths.pl
%% Created: 2026-04-03
%% Total: 18 truths
%%
%% Predicate schema:
%%   truth/3 -- truth(AtomId, Title, EntryType)
%%   truth_content/2, truth_importance/2, truth_timestep/2

%% Aether Wells
truth(aether_wells, 'Aether Wells', magical_law).
truth_content(aether_wells, 'Aether Wells are natural font of magical energy scattered across the realm. Each settlement is built around one. They power enchantments, wards, and the basic infrastructure of civilization.').
truth_importance(aether_wells, 10).
truth_timestep(aether_wells, 0).

%% Crystal Spires
truth(crystal_spires, 'Crystal Spires', magical_law).
truth_content(crystal_spires, 'Crystal Spires channel aether energy upward into the sky, creating protective wards over settlements. Without them, wild magic storms would make habitation impossible.').
truth_importance(crystal_spires, 9).
truth_timestep(crystal_spires, 0).

%% The Warding System
truth(warding_system, 'The Warding System', magical_law).
truth_content(warding_system, 'The Warding Circles are interlocking magical barriers that prevent dark creatures from entering settled areas. They require constant maintenance by trained mages.').
truth_importance(warding_system, 9).
truth_timestep(warding_system, 0).

%% Racial Coexistence
truth(racial_coexistence, 'Racial Coexistence', social_rule).
truth_content(racial_coexistence, 'Humans, elves, dwarves, and orcs coexist but rarely mix. Crossroads Haven is the one settlement where all races trade and interact freely. Elsewhere, racial territories are respected.').
truth_importance(racial_coexistence, 8).
truth_timestep(racial_coexistence, 0).

%% Elven Longevity
truth(elven_longevity, 'Elven Longevity', racial_trait).
truth_content(elven_longevity, 'Elves live for centuries. Queen Galadriel has ruled Silverwood for over 500 years. This longevity gives elves a long perspective but makes them slow to act in times of crisis.').
truth_importance(elven_longevity, 7).
truth_timestep(elven_longevity, 0).

%% Dwarven Craftsmanship
truth(dwarven_craftsmanship, 'Dwarven Craftsmanship', racial_trait).
truth_content(dwarven_craftsmanship, 'Dwarven forges produce the finest weapons, armor, and gemwork in the realm. Their secret techniques for infusing metal with aether energy are closely guarded clan secrets.').
truth_importance(dwarven_craftsmanship, 7).
truth_timestep(dwarven_craftsmanship, 0).

%% Magic is Not Free
truth(magic_cost, 'Magic is Not Free', magical_law).
truth_content(magic_cost, 'All spellcasting draws from the casters life force and from ambient aether. Overuse causes mage-burn, a debilitating condition that can permanently damage the ability to channel magic.').
truth_importance(magic_cost, 9).
truth_timestep(magic_cost, 0).

%% The Ancient Prophecy
truth(ancient_prophecy, 'The Ancient Prophecy', lore).
truth_content(ancient_prophecy, 'An inscription on the Spire of Divination foretells a time when the Aether Wells will fail and only a weapon forged from all four wells can restore balance to the realm.').
truth_importance(ancient_prophecy, 8).
truth_timestep(ancient_prophecy, 0).

%% The Adventurer Guild
truth(adventurer_guild, 'The Adventurer Guild', social_rule).
truth_content(adventurer_guild, 'The Adventurer Guild at Crossroads Haven is the only organization that accepts members of all races. It serves as a neutral broker for quests, bounties, and inter-settlement diplomacy.').
truth_importance(adventurer_guild, 7).
truth_timestep(adventurer_guild, 0).

%% Feudal Hierarchy
truth(feudal_hierarchy, 'Feudal Hierarchy', social_structure).
truth_content(feudal_hierarchy, 'The Kingdom of Aethoria operates on a strict feudal system. King Aldric rules with the counsel of noble houses. Peasants work the land and owe fealty to their lord.').
truth_importance(feudal_hierarchy, 8).
truth_timestep(feudal_hierarchy, 0).

%% Orc Clans
truth(orc_clans, 'Orc Clans', racial_trait).
truth_content(orc_clans, 'Orcs do not have a unified nation. They organize into nomadic clans that roam the Ashlands. Grommash leads the largest clan and is a reluctant diplomat seeking recognition.').
truth_importance(orc_clans, 6).
truth_timestep(orc_clans, 0).

%% Dark Magic Corruption
truth(dark_magic_corruption, 'Dark Magic Corruption', magical_law).
truth_content(dark_magic_corruption, 'Dark magic feeds on corrupted aether. It spreads like a disease through ley lines, poisoning wells and warping creatures. The Warding Circles are the primary defense against it.').
truth_importance(dark_magic_corruption, 9).
truth_timestep(dark_magic_corruption, 0).

%% Trade Routes
truth(trade_routes, 'Trade Routes', economic_fact).
truth_content(trade_routes, 'Three major trade routes connect the four settlements. Bandits and wild creatures make travel dangerous. Merchant caravans hire armed escorts from the Adventurer Guild.').
truth_importance(trade_routes, 6).
truth_timestep(trade_routes, 0).

%% Moon Phases and Magic
truth(moon_phases_magic, 'Moon Phases and Magic', magical_law).
truth_content(moon_phases_magic, 'Magic is stronger during the full moon and weaker during the new moon. Elven rituals and dwarven forging both follow the lunar calendar for optimal results.').
truth_importance(moon_phases_magic, 7).
truth_timestep(moon_phases_magic, 0).

%% The Shadow Rift
truth(shadow_rift, 'The Shadow Rift', environmental_hazard).
truth_content(shadow_rift, 'A growing rift beneath the Silverwood leaks corrupted aether into the forest. If it spreads to the Moonwell, the entire elvish settlement could be consumed by dark magic.').
truth_importance(shadow_rift, 8).
truth_timestep(shadow_rift, 0).

%% Enchantment Economy
truth(enchantment_economy, 'Enchantment Economy', economic_fact).
truth_content(enchantment_economy, 'Enchanted goods are the primary currency of inter-settlement trade. Runic weapons from Aethoria, elven remedies from Silverwood, and dwarven gemwork from Ironpeak are all highly valued.').
truth_importance(enchantment_economy, 7).
truth_timestep(enchantment_economy, 0).

%% The Stormborne Dynasty
truth(stormborne_dynasty, 'The Stormborne Dynasty', lore).
truth_content(stormborne_dynasty, 'The Stormborne family has ruled Aethoria for twelve generations. They claim descent from the first human mage who tamed an Aether Well. Prince Aragorn is the heir apparent.').
truth_importance(stormborne_dynasty, 7).
truth_timestep(stormborne_dynasty, 0).

%% Crossroads Neutrality
truth(crossroads_neutrality, 'Crossroads Neutrality', social_rule).
truth_content(crossroads_neutrality, 'Crossroads Haven is recognized neutral ground by all four races. No army may march through it. Disputes must be settled through the Guild arbitration process, not by force.').
truth_importance(crossroads_neutrality, 8).
truth_timestep(crossroads_neutrality, 0).
