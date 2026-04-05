%% Insimul Items: Tropical Pirate
%% Source: data/worlds/tropical_pirate/items.pl
%% Created: 2026-04-03
%% Total: 18 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Cutlass
item(cutlass, 'Cutlass', weapon).
item_description(cutlass, 'A short, broad slashing sword favored by sailors and pirates for close-quarters combat on ship decks.').
item_value(cutlass, 30).
item_sell_value(cutlass, 15).
item_weight(cutlass, 2).
item_rarity(cutlass, common).
item_category(cutlass, weapon).
item_tradeable(cutlass).
item_possessable(cutlass).
item_tag(cutlass, weapon).
item_tag(cutlass, pirate).

%% Flintlock Pistol
item(flintlock_pistol, 'Flintlock Pistol', weapon).
item_description(flintlock_pistol, 'A single-shot black powder pistol. Unreliable in rain but devastating at close range.').
item_value(flintlock_pistol, 60).
item_sell_value(flintlock_pistol, 30).
item_weight(flintlock_pistol, 1.5).
item_rarity(flintlock_pistol, uncommon).
item_category(flintlock_pistol, weapon).
item_tradeable(flintlock_pistol).
item_possessable(flintlock_pistol).
item_tag(flintlock_pistol, weapon).
item_tag(flintlock_pistol, firearm).

%% Treasure Map
item(treasure_map, 'Treasure Map', tool).
item_description(treasure_map, 'A weathered parchment with cryptic markings leading to buried treasure. Authenticity not guaranteed.').
item_value(treasure_map, 100).
item_sell_value(treasure_map, 50).
item_weight(treasure_map, 0.1).
item_rarity(treasure_map, rare).
item_category(treasure_map, navigation).
item_tradeable(treasure_map).
item_possessable(treasure_map).
item_tag(treasure_map, navigation).
item_tag(treasure_map, treasure).

%% Compass
item(compass, 'Compass', tool).
item_description(compass, 'A brass navigation compass essential for open-water sailing. Points true north in all weather.').
item_value(compass, 25).
item_sell_value(compass, 12).
item_weight(compass, 0.3).
item_rarity(compass, common).
item_category(compass, navigation).
item_tradeable(compass).
item_possessable(compass).
item_tag(compass, navigation).
item_tag(compass, essential).

%% Bottle of Rum
item(bottle_of_rum, 'Bottle of Rum', consumable).
item_description(bottle_of_rum, 'A dark glass bottle of Caribbean rum. The universal currency of pirate morale.').
item_value(bottle_of_rum, 5).
item_sell_value(bottle_of_rum, 2).
item_weight(bottle_of_rum, 1).
item_rarity(bottle_of_rum, common).
item_category(bottle_of_rum, food_drink).
item_stackable(bottle_of_rum).
item_tradeable(bottle_of_rum).
item_possessable(bottle_of_rum).
item_tag(bottle_of_rum, drink).
item_tag(bottle_of_rum, pirate).

%% Spyglass
item(spyglass, 'Spyglass', tool).
item_description(spyglass, 'A collapsible brass telescope for spotting ships, land, and danger at a distance.').
item_value(spyglass, 40).
item_sell_value(spyglass, 20).
item_weight(spyglass, 0.5).
item_rarity(spyglass, uncommon).
item_category(spyglass, navigation).
item_tradeable(spyglass).
item_possessable(spyglass).
item_tag(spyglass, navigation).
item_tag(spyglass, scouting).

%% Rope (50 ft)
item(rope_coil, 'Rope Coil', tool).
item_description(rope_coil, 'Fifty feet of strong hemp rope. Used for rigging, climbing, and binding prisoners.').
item_value(rope_coil, 5).
item_sell_value(rope_coil, 2).
item_weight(rope_coil, 3).
item_rarity(rope_coil, common).
item_category(rope_coil, utility).
item_stackable(rope_coil).
item_tradeable(rope_coil).
item_possessable(rope_coil).
item_tag(rope_coil, utility).
item_tag(rope_coil, sailing).

%% Gold Doubloon
item(gold_doubloon, 'Gold Doubloon', material).
item_description(gold_doubloon, 'A Spanish gold coin worth a small fortune. The most sought-after plunder in the Caribbean.').
item_value(gold_doubloon, 50).
item_sell_value(gold_doubloon, 50).
item_weight(gold_doubloon, 0.05).
item_rarity(gold_doubloon, uncommon).
item_category(gold_doubloon, currency).
item_stackable(gold_doubloon).
item_tradeable(gold_doubloon).
item_possessable(gold_doubloon).
item_tag(gold_doubloon, treasure).
item_tag(gold_doubloon, currency).

%% Hardtack
item(hardtack, 'Hardtack', consumable).
item_description(hardtack, 'Dense, dry biscuit that keeps for months at sea. Not tasty, but it keeps a sailor alive.').
item_value(hardtack, 1).
item_sell_value(hardtack, 0).
item_weight(hardtack, 0.5).
item_rarity(hardtack, common).
item_category(hardtack, food_drink).
item_stackable(hardtack).
item_tradeable(hardtack).
item_possessable(hardtack).
item_tag(hardtack, food).
item_tag(hardtack, ship_supply).

%% Black Powder Keg
item(powder_keg, 'Black Powder Keg', material).
item_description(powder_keg, 'A sealed wooden keg of black gunpowder. Extremely volatile. Essential for cannon and pistol operations.').
item_value(powder_keg, 35).
item_sell_value(powder_keg, 18).
item_weight(powder_keg, 10).
item_rarity(powder_keg, uncommon).
item_category(powder_keg, munitions).
item_tradeable(powder_keg).
item_possessable(powder_keg).
item_tag(powder_keg, munitions).
item_tag(powder_keg, dangerous).

%% Jolly Roger Flag
item(jolly_roger, 'Jolly Roger', equipment).
item_description(jolly_roger, 'The skull-and-crossbones flag flown to strike terror into merchant vessels. A symbol of pirate authority.').
item_value(jolly_roger, 15).
item_sell_value(jolly_roger, 8).
item_weight(jolly_roger, 1).
item_rarity(jolly_roger, common).
item_category(jolly_roger, ship_equipment).
item_tradeable(jolly_roger).
item_possessable(jolly_roger).
item_tag(jolly_roger, pirate).
item_tag(jolly_roger, symbol).

%% Medicine Pouch
item(medicine_pouch, 'Medicine Pouch', consumable).
item_description(medicine_pouch, 'A leather pouch containing herbal remedies and bandages for treating wounds and tropical fevers.').
item_value(medicine_pouch, 10).
item_sell_value(medicine_pouch, 5).
item_weight(medicine_pouch, 0.5).
item_rarity(medicine_pouch, common).
item_category(medicine_pouch, medical).
item_stackable(medicine_pouch).
item_tradeable(medicine_pouch).
item_possessable(medicine_pouch).
item_tag(medicine_pouch, medical).
item_tag(medicine_pouch, consumable).

%% Silk Bolt
item(silk_bolt, 'Silk Bolt', material).
item_description(silk_bolt, 'A roll of fine Asian silk. Highly valuable trade goods plundered from merchant ships.').
item_value(silk_bolt, 80).
item_sell_value(silk_bolt, 40).
item_weight(silk_bolt, 2).
item_rarity(silk_bolt, uncommon).
item_category(silk_bolt, trade_goods).
item_tradeable(silk_bolt).
item_possessable(silk_bolt).
item_tag(silk_bolt, trade_goods).
item_tag(silk_bolt, luxury).

%% Grappling Hook
item(pirate_grappling_hook, 'Grappling Hook', tool).
item_description(pirate_grappling_hook, 'An iron hook attached to a length of rope. Used for boarding enemy ships or scaling cliff faces.').
item_value(pirate_grappling_hook, 12).
item_sell_value(pirate_grappling_hook, 6).
item_weight(pirate_grappling_hook, 2).
item_rarity(pirate_grappling_hook, common).
item_category(pirate_grappling_hook, utility).
item_tradeable(pirate_grappling_hook).
item_possessable(pirate_grappling_hook).
item_tag(pirate_grappling_hook, boarding).
item_tag(pirate_grappling_hook, utility).

%% Letter of Marque
item(letter_of_marque, 'Letter of Marque', tool).
item_description(letter_of_marque, 'An official document from a colonial power authorizing privateering against enemy nations. Blurs the line between pirate and patriot.').
item_value(letter_of_marque, 500).
item_sell_value(letter_of_marque, 250).
item_weight(letter_of_marque, 0).
item_rarity(letter_of_marque, rare).
item_category(letter_of_marque, document).
item_possessable(letter_of_marque).
item_tag(letter_of_marque, legal).
item_tag(letter_of_marque, authority).

%% Emerald Ring
item(emerald_ring, 'Emerald Ring', accessory).
item_description(emerald_ring, 'A gold ring set with a large Colombian emerald. Plunder from a Spanish galleon.').
item_value(emerald_ring, 200).
item_sell_value(emerald_ring, 100).
item_weight(emerald_ring, 0.05).
item_rarity(emerald_ring, rare).
item_category(emerald_ring, jewelry).
item_tradeable(emerald_ring).
item_possessable(emerald_ring).
item_tag(emerald_ring, treasure).
item_tag(emerald_ring, jewelry).

%% Ship in a Bottle
item(ship_in_bottle, 'Ship in a Bottle', accessory).
item_description(ship_in_bottle, 'A tiny handcrafted model ship inside a glass bottle. A popular souvenir and sailors good luck charm.').
item_value(ship_in_bottle, 8).
item_sell_value(ship_in_bottle, 4).
item_weight(ship_in_bottle, 0.3).
item_rarity(ship_in_bottle, common).
item_category(ship_in_bottle, curio).
item_tradeable(ship_in_bottle).
item_possessable(ship_in_bottle).
item_tag(ship_in_bottle, curio).
item_tag(ship_in_bottle, decorative).

%% Cannonball
item(cannonball, 'Cannonball', material).
item_description(cannonball, 'A solid iron sphere fired from ship cannons. Heavy, simple, and devastatingly effective.').
item_value(cannonball, 3).
item_sell_value(cannonball, 1).
item_weight(cannonball, 5).
item_rarity(cannonball, common).
item_category(cannonball, munitions).
item_stackable(cannonball).
item_tradeable(cannonball).
item_possessable(cannonball).
item_tag(cannonball, munitions).
item_tag(cannonball, ship_combat).
