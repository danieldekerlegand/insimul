%% Insimul Items: Generic Fantasy World
%% Source: data/worlds/generic/items.pl
%% Created: 2026-04-03
%% Total: 20 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Iron Sword
item(iron_sword, 'Iron Sword', equipment).
item_description(iron_sword, 'A sturdy hand-forged iron blade, reliable if unremarkable.').
item_value(iron_sword, 30).
item_sell_value(iron_sword, 15).
item_weight(iron_sword, 3).
item_rarity(iron_sword, common).
item_category(iron_sword, weapon).
item_tradeable(iron_sword).
item_possessable(iron_sword).
item_tag(iron_sword, melee).
item_tag(iron_sword, combat).

%% Wooden Shield
item(wooden_shield, 'Wooden Shield', equipment).
item_description(wooden_shield, 'A round oak shield banded with iron. Solid protection for any adventurer.').
item_value(wooden_shield, 20).
item_sell_value(wooden_shield, 10).
item_weight(wooden_shield, 5).
item_rarity(wooden_shield, common).
item_category(wooden_shield, armor).
item_tradeable(wooden_shield).
item_possessable(wooden_shield).
item_tag(wooden_shield, defense).

%% Healing Potion
item(healing_potion, 'Healing Potion', consumable).
item_description(healing_potion, 'A small glass vial filled with a warm red liquid that mends wounds.').
item_value(healing_potion, 25).
item_sell_value(healing_potion, 12).
item_weight(healing_potion, 0.5).
item_rarity(healing_potion, uncommon).
item_category(healing_potion, potion).
item_stackable(healing_potion).
item_tradeable(healing_potion).
item_possessable(healing_potion).
item_tag(healing_potion, healing).
item_tag(healing_potion, magic).

%% Torch
item(torch, 'Torch', tool).
item_description(torch, 'A wooden shaft wrapped in oiled cloth. Burns for several hours.').
item_value(torch, 1).
item_sell_value(torch, 0).
item_weight(torch, 1).
item_rarity(torch, common).
item_category(torch, utility).
item_stackable(torch).
item_tradeable(torch).
item_possessable(torch).
item_tag(torch, light).
item_tag(torch, exploration).

%% Bread Loaf
item(bread_loaf, 'Bread Loaf', consumable).
item_description(bread_loaf, 'A dense wheat loaf fresh from the bakery oven.').
item_value(bread_loaf, 2).
item_sell_value(bread_loaf, 1).
item_weight(bread_loaf, 0.5).
item_rarity(bread_loaf, common).
item_category(bread_loaf, food_drink).
item_stackable(bread_loaf).
item_tradeable(bread_loaf).
item_possessable(bread_loaf).
item_tag(bread_loaf, food).

%% Ale Tankard
item(ale_tankard, 'Ale Tankard', consumable).
item_description(ale_tankard, 'A frothy tankard of the Golden Flagon house ale.').
item_value(ale_tankard, 3).
item_sell_value(ale_tankard, 1).
item_weight(ale_tankard, 1).
item_rarity(ale_tankard, common).
item_category(ale_tankard, food_drink).
item_stackable(ale_tankard).
item_tradeable(ale_tankard).
item_possessable(ale_tankard).
item_tag(ale_tankard, beverage).
item_tag(ale_tankard, social).

%% Leather Armor
item(leather_armor, 'Leather Armor', equipment).
item_description(leather_armor, 'Cured and stitched hide armor offering moderate protection and good mobility.').
item_value(leather_armor, 40).
item_sell_value(leather_armor, 20).
item_weight(leather_armor, 8).
item_rarity(leather_armor, common).
item_category(leather_armor, armor).
item_tradeable(leather_armor).
item_possessable(leather_armor).
item_tag(leather_armor, defense).

%% Rope (50 ft)
item(rope_50ft, 'Rope (50 ft)', tool).
item_description(rope_50ft, 'A coil of sturdy hemp rope. Useful for climbing, binding, and hauling.').
item_value(rope_50ft, 5).
item_sell_value(rope_50ft, 2).
item_weight(rope_50ft, 4).
item_rarity(rope_50ft, common).
item_category(rope_50ft, utility).
item_tradeable(rope_50ft).
item_possessable(rope_50ft).
item_tag(rope_50ft, exploration).

%% Herbal Remedy
item(herbal_remedy, 'Herbal Remedy', consumable).
item_description(herbal_remedy, 'A poultice of dried herbs mixed by the village healer. Eases pain and fever.').
item_value(herbal_remedy, 8).
item_sell_value(herbal_remedy, 4).
item_weight(herbal_remedy, 0.3).
item_rarity(herbal_remedy, common).
item_category(herbal_remedy, potion).
item_stackable(herbal_remedy).
item_tradeable(herbal_remedy).
item_possessable(herbal_remedy).
item_tag(herbal_remedy, healing).

%% Gemstone
item(gemstone, 'Rough Gemstone', material).
item_description(gemstone, 'An uncut gemstone pulled from the nearby hills. Valuable once polished.').
item_value(gemstone, 50).
item_sell_value(gemstone, 30).
item_weight(gemstone, 0.2).
item_rarity(gemstone, uncommon).
item_category(gemstone, treasure).
item_tradeable(gemstone).
item_possessable(gemstone).
item_tag(gemstone, valuable).
item_tag(gemstone, craft).

%% Lockpick Set
item(lockpick_set, 'Lockpick Set', tool).
item_description(lockpick_set, 'A leather roll containing slender metal picks. Frowned upon by the guard.').
item_value(lockpick_set, 15).
item_sell_value(lockpick_set, 7).
item_weight(lockpick_set, 0.2).
item_rarity(lockpick_set, uncommon).
item_category(lockpick_set, utility).
item_tradeable(lockpick_set).
item_possessable(lockpick_set).
item_tag(lockpick_set, stealth).
item_tag(lockpick_set, rogue).

%% Spell Scroll
item(spell_scroll, 'Spell Scroll', consumable).
item_description(spell_scroll, 'A single-use parchment inscribed with a minor cantrip. Crumbles after casting.').
item_value(spell_scroll, 35).
item_sell_value(spell_scroll, 18).
item_weight(spell_scroll, 0.1).
item_rarity(spell_scroll, rare).
item_category(spell_scroll, magic).
item_tradeable(spell_scroll).
item_possessable(spell_scroll).
item_tag(spell_scroll, magic).
item_tag(spell_scroll, consumable).

%% Map of the Region
item(region_map, 'Map of the Region', tool).
item_description(region_map, 'A hand-drawn map showing Stonehaven, Willowmere, and the surrounding lands.').
item_value(region_map, 10).
item_sell_value(region_map, 5).
item_weight(region_map, 0.2).
item_rarity(region_map, common).
item_category(region_map, utility).
item_tradeable(region_map).
item_possessable(region_map).
item_tag(region_map, exploration).
item_tag(region_map, navigation).

%% Iron Pickaxe
item(iron_pickaxe, 'Iron Pickaxe', tool).
item_description(iron_pickaxe, 'A heavy pickaxe for breaking stone and ore. Essential for mining.').
item_value(iron_pickaxe, 18).
item_sell_value(iron_pickaxe, 9).
item_weight(iron_pickaxe, 6).
item_rarity(iron_pickaxe, common).
item_category(iron_pickaxe, tool).
item_tradeable(iron_pickaxe).
item_possessable(iron_pickaxe).
item_tag(iron_pickaxe, mining).
item_tag(iron_pickaxe, labor).

%% Silver Ring
item(silver_ring, 'Silver Ring', accessory).
item_description(silver_ring, 'A plain silver band. Might be enchanted, might just be jewelry.').
item_value(silver_ring, 25).
item_sell_value(silver_ring, 15).
item_weight(silver_ring, 0.1).
item_rarity(silver_ring, uncommon).
item_category(silver_ring, accessory).
item_tradeable(silver_ring).
item_possessable(silver_ring).
item_tag(silver_ring, jewelry).

%% Quiver of Arrows
item(quiver_arrows, 'Quiver of Arrows', equipment).
item_description(quiver_arrows, 'A leather quiver holding twenty iron-tipped arrows.').
item_value(quiver_arrows, 12).
item_sell_value(quiver_arrows, 6).
item_weight(quiver_arrows, 2).
item_rarity(quiver_arrows, common).
item_category(quiver_arrows, ammunition).
item_stackable(quiver_arrows).
item_tradeable(quiver_arrows).
item_possessable(quiver_arrows).
item_tag(quiver_arrows, ranged).
item_tag(quiver_arrows, combat).

%% Wool Cloak
item(wool_cloak, 'Wool Cloak', equipment).
item_description(wool_cloak, 'A thick traveling cloak dyed forest green. Keeps out the cold and rain.').
item_value(wool_cloak, 10).
item_sell_value(wool_cloak, 5).
item_weight(wool_cloak, 2).
item_rarity(wool_cloak, common).
item_category(wool_cloak, clothing).
item_tradeable(wool_cloak).
item_possessable(wool_cloak).
item_tag(wool_cloak, clothing).
item_tag(wool_cloak, travel).

%% Cheese Wheel
item(cheese_wheel, 'Cheese Wheel', consumable).
item_description(cheese_wheel, 'A half-wheel of sharp aged cheese from Willowmere.').
item_value(cheese_wheel, 4).
item_sell_value(cheese_wheel, 2).
item_weight(cheese_wheel, 2).
item_rarity(cheese_wheel, common).
item_category(cheese_wheel, food_drink).
item_stackable(cheese_wheel).
item_tradeable(cheese_wheel).
item_possessable(cheese_wheel).
item_tag(cheese_wheel, food).

%% Lantern
item(lantern, 'Lantern', tool).
item_description(lantern, 'A hooded brass lantern that burns oil. Safer than a torch in tight spaces.').
item_value(lantern, 8).
item_sell_value(lantern, 4).
item_weight(lantern, 2).
item_rarity(lantern, common).
item_category(lantern, utility).
item_tradeable(lantern).
item_possessable(lantern).
item_tag(lantern, light).
item_tag(lantern, exploration).

%% Enchanted Amulet
item(enchanted_amulet, 'Enchanted Amulet', accessory).
item_description(enchanted_amulet, 'A jade pendant that hums faintly with protective magic.').
item_value(enchanted_amulet, 100).
item_sell_value(enchanted_amulet, 60).
item_weight(enchanted_amulet, 0.2).
item_rarity(enchanted_amulet, rare).
item_category(enchanted_amulet, accessory).
item_tradeable(enchanted_amulet).
item_possessable(enchanted_amulet).
item_tag(enchanted_amulet, magic).
item_tag(enchanted_amulet, protection).
