%% Insimul Items: French Louisiana
%% Source: data/worlds/language/french_louisiana/items.json
%% Converted: 2026-04-03T06:20:23Z
%% Total: 99 items
%%
%% Predicate schema:
%%   item/3 — item(AtomId, Name, ItemType)
%%   item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Wood
item(wood, 'Wood', material).
item_description(wood, 'A bundle of cut wood, useful for building and crafting.').
item_value(wood, 2).
item_sell_value(wood, 1).
item_weight(wood, 3).
item_rarity(wood, common).
item_category(wood, raw_material).
item_stackable(wood).
item_tradeable(wood).
item_possessable(wood).
item_base(wood).
item_tag(wood, material).
item_tag(wood, crafting).
item_tag(wood, natural).
item_tag(wood, loot_common).
item_material(wood, wood).
item_max_stack(wood, 99).

%% Stone
item(stone, 'Stone', material).
item_description(stone, 'A chunk of rough stone.').
item_value(stone, 1).
item_sell_value(stone, 0).
item_weight(stone, 4).
item_rarity(stone, common).
item_category(stone, raw_material).
item_stackable(stone).
item_tradeable(stone).
item_possessable(stone).
item_base(stone).
item_tag(stone, material).
item_tag(stone, crafting).
item_tag(stone, natural).
item_tag(stone, loot_common).
item_material(stone, stone).
item_max_stack(stone, 99).

%% Fiber
item(fiber, 'Fiber', material).
item_description(fiber, 'Plant fibers that can be woven into cloth or rope.').
item_value(fiber, 1).
item_sell_value(fiber, 0).
item_weight(fiber, 0.5).
item_rarity(fiber, common).
item_category(fiber, raw_material).
item_stackable(fiber).
item_tradeable(fiber).
item_possessable(fiber).
item_base(fiber).
item_tag(fiber, material).
item_tag(fiber, crafting).
item_tag(fiber, natural).
item_tag(fiber, loot_common).
item_material(fiber, fiber).
item_max_stack(fiber, 99).

%% Leather
item(leather, 'Leather', material).
item_description(leather, 'Tanned animal hide, useful for armor and clothing.').
item_value(leather, 5).
item_sell_value(leather, 3).
item_weight(leather, 2).
item_rarity(leather, common).
item_category(leather, raw_material).
item_stackable(leather).
item_tradeable(leather).
item_possessable(leather).
item_base(leather).
item_tag(leather, material).
item_tag(leather, crafting).
item_tag(leather, loot_common).
item_material(leather, leather).
item_max_stack(leather, 50).

%% Cloth
item(cloth, 'Cloth', material).
item_description(cloth, 'A bolt of woven fabric.').
item_value(cloth, 3).
item_sell_value(cloth, 2).
item_weight(cloth, 1).
item_rarity(cloth, common).
item_category(cloth, raw_material).
item_stackable(cloth).
item_tradeable(cloth).
item_possessable(cloth).
item_base(cloth).
item_tag(cloth, material).
item_tag(cloth, crafting).
item_tag(cloth, loot_common).
item_material(cloth, cloth).
item_max_stack(cloth, 50).

%% Clay
item(clay, 'Clay', material).
item_description(clay, 'Wet clay that can be shaped and fired into pottery.').
item_value(clay, 1).
item_sell_value(clay, 0).
item_weight(clay, 3).
item_rarity(clay, common).
item_category(clay, raw_material).
item_stackable(clay).
item_tradeable(clay).
item_possessable(clay).
item_base(clay).
item_tag(clay, material).
item_tag(clay, crafting).
item_tag(clay, natural).
item_tag(clay, loot_common).
item_material(clay, clay).
item_max_stack(clay, 50).

%% Glass
item(glass, 'Glass', material).
item_description(glass, 'A sheet of clear glass.').
item_value(glass, 4).
item_sell_value(glass, 2).
item_weight(glass, 1).
item_rarity(glass, common).
item_category(glass, refined_material).
item_stackable(glass).
item_tradeable(glass).
item_possessable(glass).
item_base(glass).
item_tag(glass, material).
item_tag(glass, crafting).
item_tag(glass, loot_uncommon).
item_material(glass, glass).
item_max_stack(glass, 30).

%% Iron Ingot
item(iron_ingot, 'Iron Ingot', material).
item_description(iron_ingot, 'A bar of smelted iron, ready for smithing.').
item_value(iron_ingot, 8).
item_sell_value(iron_ingot, 5).
item_weight(iron_ingot, 3).
item_rarity(iron_ingot, common).
item_category(iron_ingot, refined_material).
item_stackable(iron_ingot).
item_tradeable(iron_ingot).
item_possessable(iron_ingot).
item_base(iron_ingot).
item_tag(iron_ingot, material).
item_tag(iron_ingot, crafting).
item_tag(iron_ingot, metal).
item_tag(iron_ingot, loot_common).
item_material(iron_ingot, iron).
item_max_stack(iron_ingot, 50).

%% Steel Ingot
item(steel_ingot, 'Steel Ingot', material).
item_description(steel_ingot, 'A refined steel bar, stronger than iron.').
item_value(steel_ingot, 15).
item_sell_value(steel_ingot, 9).
item_weight(steel_ingot, 3).
item_rarity(steel_ingot, uncommon).
item_category(steel_ingot, refined_material).
item_stackable(steel_ingot).
item_tradeable(steel_ingot).
item_possessable(steel_ingot).
item_base(steel_ingot).
item_tag(steel_ingot, material).
item_tag(steel_ingot, crafting).
item_tag(steel_ingot, metal).
item_tag(steel_ingot, loot_uncommon).
item_material(steel_ingot, steel).
item_max_stack(steel_ingot, 50).

%% Silver Ingot
item(silver_ingot, 'Silver Ingot', material).
item_description(silver_ingot, 'A gleaming silver bar.').
item_value(silver_ingot, 25).
item_sell_value(silver_ingot, 15).
item_weight(silver_ingot, 2).
item_rarity(silver_ingot, uncommon).
item_category(silver_ingot, refined_material).
item_stackable(silver_ingot).
item_tradeable(silver_ingot).
item_possessable(silver_ingot).
item_base(silver_ingot).
item_tag(silver_ingot, material).
item_tag(silver_ingot, crafting).
item_tag(silver_ingot, metal).
item_tag(silver_ingot, precious).
item_tag(silver_ingot, loot_uncommon).
item_material(silver_ingot, silver).
item_max_stack(silver_ingot, 30).

%% Gold Ingot
item(gold_ingot, 'Gold Ingot', material).
item_description(gold_ingot, 'A heavy bar of pure gold.').
item_value(gold_ingot, 50).
item_sell_value(gold_ingot, 30).
item_weight(gold_ingot, 4).
item_rarity(gold_ingot, rare).
item_category(gold_ingot, refined_material).
item_stackable(gold_ingot).
item_tradeable(gold_ingot).
item_possessable(gold_ingot).
item_base(gold_ingot).
item_tag(gold_ingot, material).
item_tag(gold_ingot, crafting).
item_tag(gold_ingot, metal).
item_tag(gold_ingot, precious).
item_tag(gold_ingot, loot_rare).
item_material(gold_ingot, gold).
item_max_stack(gold_ingot, 20).

%% Copper Ore
item(copper_ore, 'Copper Ore', material).
item_description(copper_ore, 'Raw copper ore with a green patina.').
item_value(copper_ore, 3).
item_sell_value(copper_ore, 2).
item_weight(copper_ore, 3).
item_rarity(copper_ore, common).
item_category(copper_ore, ore).
item_stackable(copper_ore).
item_tradeable(copper_ore).
item_possessable(copper_ore).
item_base(copper_ore).
item_tag(copper_ore, material).
item_tag(copper_ore, crafting).
item_tag(copper_ore, ore).
item_tag(copper_ore, loot_common).
item_material(copper_ore, copper).
item_max_stack(copper_ore, 50).

%% Coal
item(coal, 'Coal', material).
item_description(coal, 'A lump of coal, essential for smelting.').
item_value(coal, 2).
item_sell_value(coal, 1).
item_weight(coal, 2).
item_rarity(coal, common).
item_category(coal, fuel).
item_stackable(coal).
item_tradeable(coal).
item_possessable(coal).
item_base(coal).
item_tag(coal, material).
item_tag(coal, crafting).
item_tag(coal, fuel).
item_tag(coal, loot_common).
item_max_stack(coal, 99).

%% Knife
item(knife, 'Knife', tool).
item_description(knife, 'A basic utility knife.').
item_value(knife, 5).
item_sell_value(knife, 3).
item_weight(knife, 0.5).
item_rarity(knife, common).
item_category(knife, tool).
item_tradeable(knife).
item_possessable(knife).
item_base(knife).
item_tag(knife, tool).
item_tag(knife, melee).
item_tag(knife, loot_common).
item_material(knife, iron).
item_max_stack(knife, 1).

%% Hammer
item(hammer, 'Hammer', tool).
item_description(hammer, 'A sturdy hammer for building and repair.').
item_value(hammer, 8).
item_sell_value(hammer, 5).
item_weight(hammer, 3).
item_rarity(hammer, common).
item_category(hammer, tool).
item_tradeable(hammer).
item_possessable(hammer).
item_base(hammer).
item_tag(hammer, tool).
item_tag(hammer, crafting).
item_tag(hammer, loot_common).
item_material(hammer, iron).
item_max_stack(hammer, 1).

%% Shovel
item(shovel, 'Shovel', tool).
item_description(shovel, 'A metal-bladed shovel for digging.').
item_value(shovel, 7).
item_sell_value(shovel, 4).
item_weight(shovel, 3).
item_rarity(shovel, common).
item_category(shovel, tool).
item_tradeable(shovel).
item_possessable(shovel).
item_base(shovel).
item_tag(shovel, tool).
item_tag(shovel, loot_common).
item_material(shovel, iron).
item_max_stack(shovel, 1).

%% Fishing Rod
item(fishing_rod, 'Fishing Rod', tool).
item_description(fishing_rod, 'A pole with line and hook for catching fish.').
item_value(fishing_rod, 10).
item_sell_value(fishing_rod, 6).
item_weight(fishing_rod, 2).
item_rarity(fishing_rod, common).
item_category(fishing_rod, tool).
item_tradeable(fishing_rod).
item_possessable(fishing_rod).
item_base(fishing_rod).
item_tag(fishing_rod, tool).
item_tag(fishing_rod, loot_uncommon).
item_material(fishing_rod, wood).
item_max_stack(fishing_rod, 1).

%% Sack
item(sack, 'Sack', tool).
item_description(sack, 'A simple cloth sack for carrying goods.').
item_value(sack, 2).
item_sell_value(sack, 1).
item_weight(sack, 0.5).
item_rarity(sack, common).
item_category(sack, container).
item_stackable(sack).
item_tradeable(sack).
item_possessable(sack).
item_base(sack).
item_tag(sack, container).
item_tag(sack, utility).
item_tag(sack, loot_common).
item_material(sack, cloth).
item_max_stack(sack, 5).

%% Barrel
item(barrel, 'Barrel', collectible).
item_description(barrel, 'A wooden barrel for storing liquids or dry goods.').
item_value(barrel, 5).
item_sell_value(barrel, 3).
item_weight(barrel, 8).
item_rarity(barrel, common).
item_category(barrel, container).
item_tradeable(barrel).
item_possessable(barrel).
item_base(barrel).
item_tag(barrel, container).
item_tag(barrel, furniture).
item_tag(barrel, loot_common).
item_material(barrel, wood).
item_max_stack(barrel, 1).

%% Crate
item(crate, 'Crate', collectible).
item_description(crate, 'A wooden crate, nailed shut.').
item_value(crate, 3).
item_sell_value(crate, 2).
item_weight(crate, 6).
item_rarity(crate, common).
item_category(crate, container).
item_tradeable(crate).
item_possessable(crate).
item_base(crate).
item_tag(crate, container).
item_tag(crate, loot_common).
item_material(crate, wood).
item_max_stack(crate, 1).

%% Candle
item(candle, 'Candle', tool).
item_description(candle, 'A tallow candle providing a dim, warm glow.').
item_value(candle, 1).
item_sell_value(candle, 0).
item_weight(candle, 0.3).
item_rarity(candle, common).
item_category(candle, light_source).
item_stackable(candle).
item_tradeable(candle).
item_possessable(candle).
item_base(candle).
item_tag(candle, light).
item_tag(candle, utility).
item_tag(candle, loot_common).
item_max_stack(candle, 20).

%% Key
item(key, 'Key', key).
item_description(key, 'A plain metal key. What does it unlock?').
item_value(key, 5).
item_sell_value(key, 0).
item_weight(key, 0.1).
item_rarity(key, uncommon).
item_category(key, key).
item_possessable(key).
item_base(key).
item_tag(key, key).
item_tag(key, loot_uncommon).
item_material(key, iron).
item_max_stack(key, 1).

%% Map
item(map, 'Map', key).
item_description(map, 'A hand-drawn map of the local area.').
item_value(map, 10).
item_sell_value(map, 6).
item_weight(map, 0.1).
item_rarity(map, uncommon).
item_category(map, document).
item_tradeable(map).
item_possessable(map).
item_base(map).
item_tag(map, key).
item_tag(map, navigation).
item_tag(map, loot_uncommon).
item_material(map, paper).
item_max_stack(map, 1).

%% Book
item(book, 'Book', collectible).
item_description(book, 'A leather-bound book filled with knowledge.').
item_value(book, 8).
item_sell_value(book, 5).
item_weight(book, 1).
item_rarity(book, common).
item_category(book, document).
item_tradeable(book).
item_possessable(book).
item_base(book).
item_tag(book, collectible).
item_tag(book, knowledge).
item_tag(book, loot_common).
item_material(book, paper).
item_max_stack(book, 1).

%% Letter
item(letter, 'Letter', quest).
item_description(letter, 'A sealed letter addressed to someone.').
item_value(letter, 0).
item_sell_value(letter, 0).
item_weight(letter, 0.1).
item_rarity(letter, common).
item_category(letter, document).
item_possessable(letter).
item_base(letter).
item_tag(letter, quest).
item_tag(letter, document).
item_material(letter, paper).
item_max_stack(letter, 1).

%% Coin Purse
item(coin_purse, 'Coin Purse', collectible).
item_description(coin_purse, 'A small leather purse jingling with coins.').
item_value(coin_purse, 15).
item_sell_value(coin_purse, 15).
item_weight(coin_purse, 0.3).
item_rarity(coin_purse, common).
item_category(coin_purse, currency).
item_stackable(coin_purse).
item_tradeable(coin_purse).
item_possessable(coin_purse).
item_base(coin_purse).
item_tag(coin_purse, currency).
item_tag(coin_purse, loot_common).
item_material(coin_purse, leather).
item_max_stack(coin_purse, 10).

%% Apple
item(apple, 'Apple', food).
item_description(apple, 'A crisp, red apple.').
item_value(apple, 1).
item_sell_value(apple, 0).
item_weight(apple, 0.2).
item_rarity(apple, common).
item_category(apple, food).
item_stackable(apple).
item_tradeable(apple).
item_possessable(apple).
item_base(apple).
item_tag(apple, food).
item_tag(apple, natural).
item_tag(apple, loot_common).
item_max_stack(apple, 30).

%% Raw Meat
item(raw_meat, 'Raw Meat', food).
item_description(raw_meat, 'Uncooked meat. Should be cooked before eating.').
item_value(raw_meat, 3).
item_sell_value(raw_meat, 2).
item_weight(raw_meat, 1).
item_rarity(raw_meat, common).
item_category(raw_meat, ingredient).
item_stackable(raw_meat).
item_tradeable(raw_meat).
item_possessable(raw_meat).
item_base(raw_meat).
item_tag(raw_meat, food).
item_tag(raw_meat, ingredient).
item_tag(raw_meat, raw).
item_tag(raw_meat, loot_common).
item_max_stack(raw_meat, 20).

%% Fish
item(fish, 'Fish', food).
item_description(fish, 'A freshly caught fish.').
item_value(fish, 4).
item_sell_value(fish, 2).
item_weight(fish, 1).
item_rarity(fish, common).
item_category(fish, ingredient).
item_stackable(fish).
item_tradeable(fish).
item_possessable(fish).
item_base(fish).
item_tag(fish, food).
item_tag(fish, ingredient).
item_tag(fish, raw).
item_tag(fish, loot_common).
item_max_stack(fish, 20).

%% Mushroom
item(mushroom, 'Mushroom', food).
item_description(mushroom, 'A wild mushroom — edible, hopefully.').
item_value(mushroom, 2).
item_sell_value(mushroom, 1).
item_weight(mushroom, 0.2).
item_rarity(mushroom, common).
item_category(mushroom, ingredient).
item_stackable(mushroom).
item_tradeable(mushroom).
item_possessable(mushroom).
item_base(mushroom).
item_tag(mushroom, food).
item_tag(mushroom, ingredient).
item_tag(mushroom, natural).
item_tag(mushroom, loot_common).
item_max_stack(mushroom, 30).

%% Salt
item(salt, 'Salt', material).
item_description(salt, 'A pouch of salt, essential for cooking and preserving.').
item_value(salt, 3).
item_sell_value(salt, 2).
item_weight(salt, 0.5).
item_rarity(salt, common).
item_category(salt, ingredient).
item_stackable(salt).
item_tradeable(salt).
item_possessable(salt).
item_base(salt).
item_tag(salt, material).
item_tag(salt, ingredient).
item_tag(salt, loot_common).
item_max_stack(salt, 50).

%% Rock
item(rock, 'Rock', material).
item_description(rock, 'A fist-sized rock. Could be thrown or used as a tool.').
item_value(rock, 0).
item_sell_value(rock, 0).
item_weight(rock, 2).
item_rarity(rock, common).
item_category(rock, raw_material).
item_stackable(rock).
item_tradeable(rock).
item_possessable(rock).
item_base(rock).
item_tag(rock, material).
item_tag(rock, natural).
item_tag(rock, throwable).
item_tag(rock, loot_common).
item_material(rock, stone).
item_max_stack(rock, 50).

%% Stick
item(stick, 'Stick', material).
item_description(stick, 'A sturdy wooden stick. The foundation of many crafted tools.').
item_value(stick, 0).
item_sell_value(stick, 0).
item_weight(stick, 0.5).
item_rarity(stick, common).
item_category(stick, raw_material).
item_stackable(stick).
item_tradeable(stick).
item_possessable(stick).
item_base(stick).
item_tag(stick, material).
item_tag(stick, crafting).
item_tag(stick, natural).
item_tag(stick, loot_common).
item_material(stick, wood).
item_max_stack(stick, 99).

%% Bone
item(bone, 'Bone', material).
item_description(bone, 'An animal bone. Can be carved or ground into tools.').
item_value(bone, 1).
item_sell_value(bone, 0).
item_weight(bone, 0.5).
item_rarity(bone, common).
item_category(bone, raw_material).
item_stackable(bone).
item_tradeable(bone).
item_possessable(bone).
item_base(bone).
item_tag(bone, material).
item_tag(bone, crafting).
item_tag(bone, loot_common).
item_material(bone, bone).
item_max_stack(bone, 30).

%% Feather
item(feather, 'Feather', material).
item_description(feather, 'A large bird feather, used for fletching or quills.').
item_value(feather, 1).
item_sell_value(feather, 0).
item_weight(feather, 0.1).
item_rarity(feather, common).
item_category(feather, raw_material).
item_stackable(feather).
item_tradeable(feather).
item_possessable(feather).
item_base(feather).
item_tag(feather, material).
item_tag(feather, crafting).
item_tag(feather, natural).
item_tag(feather, loot_common).
item_max_stack(feather, 50).

%% Shell
item(shell, 'Shell', collectible).
item_description(shell, 'A smooth sea shell. Valued as currency in some cultures.').
item_value(shell, 2).
item_sell_value(shell, 1).
item_weight(shell, 0.1).
item_rarity(shell, common).
item_category(shell, collectible).
item_stackable(shell).
item_tradeable(shell).
item_possessable(shell).
item_base(shell).
item_tag(shell, collectible).
item_tag(shell, natural).
item_tag(shell, loot_common).
item_max_stack(shell, 30).

%% Steel Sword
item(steel_sword, 'Steel Sword', weapon).
item_description(steel_sword, 'A finely tempered steel blade, sharper and more durable than iron.').
item_value(steel_sword, 45).
item_sell_value(steel_sword, 27).
item_weight(steel_sword, 3).
item_rarity(steel_sword, uncommon).
item_category(steel_sword, melee_weapon).
item_tradeable(steel_sword).
item_possessable(steel_sword).
item_base(steel_sword).
item_tag(steel_sword, weapon).
item_tag(steel_sword, melee).
item_tag(steel_sword, loot_uncommon).
item_material(steel_sword, steel).
item_max_stack(steel_sword, 1).

%% Longbow
item(longbow, 'Longbow', weapon).
item_description(longbow, 'A tall war bow with exceptional range.').
item_value(longbow, 30).
item_sell_value(longbow, 18).
item_weight(longbow, 2.5).
item_rarity(longbow, uncommon).
item_category(longbow, ranged_weapon).
item_tradeable(longbow).
item_possessable(longbow).
item_base(longbow).
item_tag(longbow, weapon).
item_tag(longbow, ranged).
item_tag(longbow, loot_uncommon).
item_material(longbow, wood).
item_max_stack(longbow, 1).

%% Crossbow
item(crossbow, 'Crossbow', weapon).
item_description(crossbow, 'A mechanical crossbow that fires bolts with great force.').
item_value(crossbow, 40).
item_sell_value(crossbow, 24).
item_weight(crossbow, 4).
item_rarity(crossbow, uncommon).
item_category(crossbow, ranged_weapon).
item_tradeable(crossbow).
item_possessable(crossbow).
item_base(crossbow).
item_tag(crossbow, weapon).
item_tag(crossbow, ranged).
item_tag(crossbow, loot_uncommon).
item_material(crossbow, wood).
item_max_stack(crossbow, 1).

%% War Hammer
item(war_hammer, 'War Hammer', weapon).
item_description(war_hammer, 'A heavy hammer designed for crushing armor.').
item_value(war_hammer, 35).
item_sell_value(war_hammer, 21).
item_weight(war_hammer, 5).
item_rarity(war_hammer, uncommon).
item_category(war_hammer, melee_weapon).
item_tradeable(war_hammer).
item_possessable(war_hammer).
item_base(war_hammer).
item_tag(war_hammer, weapon).
item_tag(war_hammer, melee).
item_tag(war_hammer, loot_uncommon).
item_material(war_hammer, iron).
item_max_stack(war_hammer, 1).

%% Spear
item(spear, 'Spear', weapon).
item_description(spear, 'A long-hafted weapon tipped with an iron head.').
item_value(spear, 15).
item_sell_value(spear, 9).
item_weight(spear, 3).
item_rarity(spear, common).
item_category(spear, melee_weapon).
item_tradeable(spear).
item_possessable(spear).
item_base(spear).
item_tag(spear, weapon).
item_tag(spear, melee).
item_tag(spear, loot_common).
item_material(spear, iron).
item_max_stack(spear, 1).

%% Staff
item(staff, 'Staff', weapon).
item_description(staff, 'A hardwood staff, favored by travelers and mages.').
item_value(staff, 12).
item_sell_value(staff, 7).
item_weight(staff, 2).
item_rarity(staff, common).
item_category(staff, melee_weapon).
item_tradeable(staff).
item_possessable(staff).
item_base(staff).
item_tag(staff, weapon).
item_tag(staff, melee).
item_tag(staff, loot_common).
item_material(staff, wood).
item_max_stack(staff, 1).

%% Iron Shield
item(iron_shield, 'Iron Shield', armor).
item_description(iron_shield, 'A heavy iron-banded shield.').
item_value(iron_shield, 35).
item_sell_value(iron_shield, 21).
item_weight(iron_shield, 6).
item_rarity(iron_shield, uncommon).
item_category(iron_shield, shield).
item_tradeable(iron_shield).
item_possessable(iron_shield).
item_base(iron_shield).
item_tag(iron_shield, armor).
item_tag(iron_shield, shield).
item_tag(iron_shield, loot_uncommon).
item_material(iron_shield, iron).
item_max_stack(iron_shield, 1).

%% Leather Armor
item(leather_armor, 'Leather Armor', armor).
item_description(leather_armor, 'Light armor fashioned from cured leather.').
item_value(leather_armor, 25).
item_sell_value(leather_armor, 15).
item_weight(leather_armor, 5).
item_rarity(leather_armor, common).
item_category(leather_armor, light_armor).
item_tradeable(leather_armor).
item_possessable(leather_armor).
item_base(leather_armor).
item_tag(leather_armor, armor).
item_tag(leather_armor, loot_common).
item_material(leather_armor, leather).
item_max_stack(leather_armor, 1).

%% Plate Armor
item(plate_armor, 'Plate Armor', armor).
item_description(plate_armor, 'Full plate armor providing exceptional protection.').
item_value(plate_armor, 80).
item_sell_value(plate_armor, 48).
item_weight(plate_armor, 15).
item_rarity(plate_armor, rare).
item_category(plate_armor, heavy_armor).
item_tradeable(plate_armor).
item_possessable(plate_armor).
item_base(plate_armor).
item_tag(plate_armor, armor).
item_tag(plate_armor, loot_rare).
item_material(plate_armor, steel).
item_max_stack(plate_armor, 1).

%% Helmet
item(helmet, 'Helmet', armor).
item_description(helmet, 'An iron helmet protecting the head.').
item_value(helmet, 20).
item_sell_value(helmet, 12).
item_weight(helmet, 3).
item_rarity(helmet, common).
item_category(helmet, head_armor).
item_tradeable(helmet).
item_possessable(helmet).
item_base(helmet).
item_tag(helmet, armor).
item_tag(helmet, loot_common).
item_material(helmet, iron).
item_max_stack(helmet, 1).

%% Arrow
item(arrow, 'Arrow', material).
item_description(arrow, 'A bundle of wooden arrows tipped with iron.').
item_value(arrow, 1).
item_sell_value(arrow, 0).
item_weight(arrow, 0.1).
item_rarity(arrow, common).
item_category(arrow, ammunition).
item_stackable(arrow).
item_tradeable(arrow).
item_possessable(arrow).
item_base(arrow).
item_tag(arrow, ammunition).
item_tag(arrow, loot_common).
item_material(arrow, wood).
item_max_stack(arrow, 99).

%% Mana Potion
item(mana_potion, 'Mana Potion', consumable).
item_description(mana_potion, 'A shimmering blue potion that restores magical energy.').
item_value(mana_potion, 20).
item_sell_value(mana_potion, 12).
item_weight(mana_potion, 0.5).
item_rarity(mana_potion, uncommon).
item_category(mana_potion, potion).
item_stackable(mana_potion).
item_tradeable(mana_potion).
item_possessable(mana_potion).
item_base(mana_potion).
item_tag(mana_potion, consumable).
item_tag(mana_potion, magic).
item_tag(mana_potion, loot_uncommon).
item_max_stack(mana_potion, 20).

%% Ale
item(ale, 'Ale', drink).
item_description(ale, 'A mug of dark, frothy ale.').
item_value(ale, 3).
item_sell_value(ale, 1).
item_weight(ale, 1).
item_rarity(ale, common).
item_category(ale, drink).
item_stackable(ale).
item_tradeable(ale).
item_possessable(ale).
item_base(ale).
item_tag(ale, drink).
item_tag(ale, loot_common).
item_max_stack(ale, 10).

%% Wine
item(wine, 'Wine', drink).
item_description(wine, 'A bottle of fine red wine.').
item_value(wine, 10).
item_sell_value(wine, 6).
item_weight(wine, 1.5).
item_rarity(wine, uncommon).
item_category(wine, drink).
item_stackable(wine).
item_tradeable(wine).
item_possessable(wine).
item_base(wine).
item_tag(wine, drink).
item_tag(wine, loot_uncommon).
item_max_stack(wine, 10).

%% Scroll
item(scroll, 'Scroll', collectible).
item_description(scroll, 'A rolled parchment containing written knowledge.').
item_value(scroll, 12).
item_sell_value(scroll, 7).
item_weight(scroll, 0.2).
item_rarity(scroll, uncommon).
item_category(scroll, document).
item_stackable(scroll).
item_tradeable(scroll).
item_possessable(scroll).
item_base(scroll).
item_tag(scroll, collectible).
item_tag(scroll, knowledge).
item_tag(scroll, loot_uncommon).
item_material(scroll, paper).
item_max_stack(scroll, 10).

%% Iron Sword
item(iron_sword, 'Iron Sword', weapon).
item_description(iron_sword, 'A well-forged iron sword suitable for combat.').
item_value(iron_sword, 25).
item_sell_value(iron_sword, 15).
item_weight(iron_sword, 3).
item_rarity(iron_sword, common).
item_category(iron_sword, melee_weapon).
item_tradeable(iron_sword).
item_possessable(iron_sword).
item_base(iron_sword).
item_tag(iron_sword, weapon).
item_tag(iron_sword, melee).
item_tag(iron_sword, loot_common).
item_material(iron_sword, iron).
item_max_stack(iron_sword, 1).

%% Dagger
item(dagger, 'Dagger', weapon).
item_description(dagger, 'A sharp steel dagger, quick and deadly.').
item_value(dagger, 10).
item_sell_value(dagger, 6).
item_weight(dagger, 1).
item_rarity(dagger, common).
item_category(dagger, melee_weapon).
item_tradeable(dagger).
item_possessable(dagger).
item_base(dagger).
item_tag(dagger, weapon).
item_tag(dagger, melee).
item_tag(dagger, loot_common).
item_material(dagger, steel).
item_max_stack(dagger, 1).

%% Wooden Bow
item(wooden_bow, 'Wooden Bow', weapon).
item_description(wooden_bow, 'A simple bow crafted from yew wood.').
item_value(wooden_bow, 18).
item_sell_value(wooden_bow, 11).
item_weight(wooden_bow, 2).
item_rarity(wooden_bow, common).
item_category(wooden_bow, ranged_weapon).
item_tradeable(wooden_bow).
item_possessable(wooden_bow).
item_base(wooden_bow).
item_tag(wooden_bow, weapon).
item_tag(wooden_bow, ranged).
item_tag(wooden_bow, loot_common).
item_material(wooden_bow, wood).
item_max_stack(wooden_bow, 1).

%% Wooden Shield
item(wooden_shield, 'Wooden Shield', armor).
item_description(wooden_shield, 'A simple wooden shield offering modest protection.').
item_value(wooden_shield, 20).
item_sell_value(wooden_shield, 12).
item_weight(wooden_shield, 4).
item_rarity(wooden_shield, common).
item_category(wooden_shield, shield).
item_tradeable(wooden_shield).
item_possessable(wooden_shield).
item_base(wooden_shield).
item_tag(wooden_shield, armor).
item_tag(wooden_shield, loot_common).
item_material(wooden_shield, wood).
item_max_stack(wooden_shield, 1).

%% Chainmail Vest
item(chainmail_vest, 'Chainmail Vest', armor).
item_description(chainmail_vest, 'A vest of interlocking iron rings.').
item_value(chainmail_vest, 40).
item_sell_value(chainmail_vest, 24).
item_weight(chainmail_vest, 8).
item_rarity(chainmail_vest, uncommon).
item_category(chainmail_vest, heavy_armor).
item_tradeable(chainmail_vest).
item_possessable(chainmail_vest).
item_base(chainmail_vest).
item_tag(chainmail_vest, armor).
item_tag(chainmail_vest, loot_uncommon).
item_material(chainmail_vest, iron).
item_max_stack(chainmail_vest, 1).

%% Leather Boots
item(leather_boots, 'Leather Boots', armor).
item_description(leather_boots, 'Comfortable leather boots for long journeys.').
item_value(leather_boots, 12).
item_sell_value(leather_boots, 7).
item_weight(leather_boots, 2).
item_rarity(leather_boots, common).
item_category(leather_boots, light_armor).
item_tradeable(leather_boots).
item_possessable(leather_boots).
item_base(leather_boots).
item_tag(leather_boots, armor).
item_tag(leather_boots, loot_common).
item_material(leather_boots, leather).
item_max_stack(leather_boots, 1).

%% Health Potion
item(health_potion, 'Health Potion', consumable).
item_description(health_potion, 'Restores a moderate amount of health.').
item_value(health_potion, 15).
item_sell_value(health_potion, 9).
item_weight(health_potion, 0.5).
item_rarity(health_potion, common).
item_category(health_potion, potion).
item_stackable(health_potion).
item_tradeable(health_potion).
item_possessable(health_potion).
item_base(health_potion).
item_tag(health_potion, consumable).
item_tag(health_potion, healing).
item_tag(health_potion, loot_common).
item_max_stack(health_potion, 20).

%% Antidote
item(antidote, 'Antidote', consumable).
item_description(antidote, 'Cures common poisons.').
item_value(antidote, 12).
item_sell_value(antidote, 7).
item_weight(antidote, 0.3).
item_rarity(antidote, uncommon).
item_category(antidote, potion).
item_stackable(antidote).
item_tradeable(antidote).
item_possessable(antidote).
item_base(antidote).
item_tag(antidote, consumable).
item_tag(antidote, loot_uncommon).
item_max_stack(antidote, 20).

%% Healing Herb
item(healing_herb, 'Healing Herb', consumable).
item_description(healing_herb, 'A herb with mild restorative properties.').
item_value(healing_herb, 8).
item_sell_value(healing_herb, 5).
item_weight(healing_herb, 0.2).
item_rarity(healing_herb, common).
item_category(healing_herb, ingredient).
item_stackable(healing_herb).
item_tradeable(healing_herb).
item_possessable(healing_herb).
item_base(healing_herb).
item_tag(healing_herb, consumable).
item_tag(healing_herb, healing).
item_tag(healing_herb, material).
item_tag(healing_herb, loot_common).
item_max_stack(healing_herb, 50).

%% Bread
item(bread, 'Bread', food).
item_description(bread, 'A fresh loaf of bread.').
item_value(bread, 2).
item_sell_value(bread, 1).
item_weight(bread, 0.5).
item_rarity(bread, common).
item_category(bread, food).
item_stackable(bread).
item_tradeable(bread).
item_possessable(bread).
item_base(bread).
item_tag(bread, food).
item_tag(bread, loot_common).
item_max_stack(bread, 20).

%% Meat Pie
item(meat_pie, 'Meat Pie', food).
item_description(meat_pie, 'A hearty meat pie.').
item_value(meat_pie, 5).
item_sell_value(meat_pie, 3).
item_weight(meat_pie, 0.8).
item_rarity(meat_pie, common).
item_category(meat_pie, food).
item_stackable(meat_pie).
item_tradeable(meat_pie).
item_possessable(meat_pie).
item_base(meat_pie).
item_tag(meat_pie, food).
item_tag(meat_pie, loot_common).
item_max_stack(meat_pie, 10).

%% Water Flask
item(water_flask, 'Water Flask', drink).
item_description(water_flask, 'A flask of clean water.').
item_value(water_flask, 1).
item_sell_value(water_flask, 0).
item_weight(water_flask, 1).
item_rarity(water_flask, common).
item_category(water_flask, drink).
item_stackable(water_flask).
item_tradeable(water_flask).
item_possessable(water_flask).
item_base(water_flask).
item_tag(water_flask, drink).
item_tag(water_flask, loot_common).
item_max_stack(water_flask, 10).

%% Torch
item(torch, 'Torch', tool).
item_description(torch, 'A sturdy torch for dark places.').
item_value(torch, 3).
item_sell_value(torch, 1).
item_weight(torch, 1).
item_rarity(torch, common).
item_category(torch, light_source).
item_stackable(torch).
item_tradeable(torch).
item_possessable(torch).
item_base(torch).
item_tag(torch, tool).
item_tag(torch, light).
item_tag(torch, loot_common).
item_material(torch, wood).
item_max_stack(torch, 10).

%% Iron Pickaxe
item(iron_pickaxe, 'Iron Pickaxe', tool).
item_description(iron_pickaxe, 'A heavy pickaxe for mining.').
item_value(iron_pickaxe, 15).
item_sell_value(iron_pickaxe, 9).
item_weight(iron_pickaxe, 5).
item_rarity(iron_pickaxe, common).
item_category(iron_pickaxe, tool).
item_tradeable(iron_pickaxe).
item_possessable(iron_pickaxe).
item_base(iron_pickaxe).
item_tag(iron_pickaxe, tool).
item_material(iron_pickaxe, iron).
item_max_stack(iron_pickaxe, 1).

%% Rope
item(rope, 'Rope', tool).
item_description(rope, 'Strong hemp rope, 50 feet.').
item_value(rope, 5).
item_sell_value(rope, 3).
item_weight(rope, 3).
item_rarity(rope, common).
item_category(rope, utility).
item_stackable(rope).
item_tradeable(rope).
item_possessable(rope).
item_base(rope).
item_tag(rope, tool).
item_tag(rope, loot_common).
item_material(rope, fiber).
item_max_stack(rope, 5).

%% Oil Lantern
item(oil_lantern, 'Oil Lantern', tool).
item_description(oil_lantern, 'A lantern that casts a warm glow.').
item_value(oil_lantern, 8).
item_sell_value(oil_lantern, 5).
item_weight(oil_lantern, 2).
item_rarity(oil_lantern, uncommon).
item_category(oil_lantern, light_source).
item_tradeable(oil_lantern).
item_possessable(oil_lantern).
item_base(oil_lantern).
item_tag(oil_lantern, tool).
item_tag(oil_lantern, light).
item_tag(oil_lantern, loot_uncommon).
item_material(oil_lantern, iron).
item_max_stack(oil_lantern, 1).

%% Golden Goblet
item(golden_goblet, 'Golden Goblet', collectible).
item_description(golden_goblet, 'An ornate goblet, likely used in royal feasts.').
item_value(golden_goblet, 50).
item_sell_value(golden_goblet, 30).
item_weight(golden_goblet, 1).
item_rarity(golden_goblet, rare).
item_category(golden_goblet, treasure).
item_tradeable(golden_goblet).
item_possessable(golden_goblet).
item_base(golden_goblet).
item_tag(golden_goblet, collectible).
item_tag(golden_goblet, treasure).
item_tag(golden_goblet, loot_rare).
item_material(golden_goblet, gold).
item_max_stack(golden_goblet, 1).

%% Jeweled Crown
item(jeweled_crown, 'Jeweled Crown', key).
item_description(jeweled_crown, 'A crown encrusted with jewels, symbol of authority.').
item_value(jeweled_crown, 100).
item_sell_value(jeweled_crown, 60).
item_weight(jeweled_crown, 1).
item_rarity(jeweled_crown, rare).
item_category(jeweled_crown, treasure).
item_possessable(jeweled_crown).
item_base(jeweled_crown).
item_tag(jeweled_crown, key).
item_tag(jeweled_crown, treasure).
item_tag(jeweled_crown, loot_rare).
item_material(jeweled_crown, gold).
item_max_stack(jeweled_crown, 1).

%% Treasure Chest
item(treasure_chest, 'Treasure Chest', collectible).
item_description(treasure_chest, 'A sturdy chest that once held valuables.').
item_value(treasure_chest, 30).
item_sell_value(treasure_chest, 18).
item_weight(treasure_chest, 5).
item_rarity(treasure_chest, uncommon).
item_category(treasure_chest, container).
item_tradeable(treasure_chest).
item_possessable(treasure_chest).
item_base(treasure_chest).
item_tag(treasure_chest, collectible).
item_tag(treasure_chest, container).
item_tag(treasure_chest, loot_uncommon).
item_material(treasure_chest, wood).
item_max_stack(treasure_chest, 1).

%% Silver Ring
item(silver_ring, 'Silver Ring', collectible).
item_description(silver_ring, 'A finely crafted silver ring.').
item_value(silver_ring, 30).
item_sell_value(silver_ring, 18).
item_weight(silver_ring, 0.1).
item_rarity(silver_ring, uncommon).
item_category(silver_ring, jewelry).
item_tradeable(silver_ring).
item_possessable(silver_ring).
item_base(silver_ring).
item_tag(silver_ring, collectible).
item_tag(silver_ring, jewelry).
item_tag(silver_ring, loot_uncommon).
item_material(silver_ring, silver).
item_max_stack(silver_ring, 1).

%% Gold Amulet
item(gold_amulet, 'Gold Amulet', collectible).
item_description(gold_amulet, 'An ornate gold amulet.').
item_value(gold_amulet, 50).
item_sell_value(gold_amulet, 30).
item_weight(gold_amulet, 0.2).
item_rarity(gold_amulet, rare).
item_category(gold_amulet, jewelry).
item_tradeable(gold_amulet).
item_possessable(gold_amulet).
item_base(gold_amulet).
item_tag(gold_amulet, collectible).
item_tag(gold_amulet, jewelry).
item_tag(gold_amulet, loot_rare).
item_material(gold_amulet, gold).
item_max_stack(gold_amulet, 1).

%% Gemstone
item(gemstone, 'Gemstone', material).
item_description(gemstone, 'A polished precious gemstone.').
item_value(gemstone, 40).
item_sell_value(gemstone, 24).
item_weight(gemstone, 0.1).
item_rarity(gemstone, rare).
item_category(gemstone, gemstone).
item_stackable(gemstone).
item_tradeable(gemstone).
item_possessable(gemstone).
item_base(gemstone).
item_tag(gemstone, material).
item_tag(gemstone, treasure).
item_tag(gemstone, loot_rare).
item_max_stack(gemstone, 10).

%% Iron Ore
item(iron_ore, 'Iron Ore', material).
item_description(iron_ore, 'Raw iron ore ready for smelting.').
item_value(iron_ore, 5).
item_sell_value(iron_ore, 3).
item_weight(iron_ore, 3).
item_rarity(iron_ore, common).
item_category(iron_ore, ore).
item_stackable(iron_ore).
item_tradeable(iron_ore).
item_possessable(iron_ore).
item_base(iron_ore).
item_tag(iron_ore, material).
item_tag(iron_ore, crafting).
item_tag(iron_ore, loot_common).
item_material(iron_ore, iron).
item_max_stack(iron_ore, 50).

%% Cyber-Blade
item(cyber_blade, 'Cyber-Blade', weapon).
item_description(cyber_blade, 'A retractable mono-molecular blade implant.').
item_value(cyber_blade, 35).
item_sell_value(cyber_blade, 21).
item_weight(cyber_blade, 1).
item_rarity(cyber_blade, uncommon).
item_category(cyber_blade, melee_weapon).
item_tradeable(cyber_blade).
item_possessable(cyber_blade).
item_base(cyber_blade).
item_tag(cyber_blade, weapon).
item_tag(cyber_blade, melee).
item_tag(cyber_blade, cyber).
item_tag(cyber_blade, loot_uncommon).
item_material(cyber_blade, composite).
item_max_stack(cyber_blade, 1).

%% Pulse Pistol
item(pulse_pistol, 'Pulse Pistol', weapon).
item_description(pulse_pistol, 'A compact energy sidearm.').
item_value(pulse_pistol, 30).
item_sell_value(pulse_pistol, 18).
item_weight(pulse_pistol, 2).
item_rarity(pulse_pistol, common).
item_category(pulse_pistol, ranged_weapon).
item_tradeable(pulse_pistol).
item_possessable(pulse_pistol).
item_base(pulse_pistol).
item_tag(pulse_pistol, weapon).
item_tag(pulse_pistol, ranged).
item_tag(pulse_pistol, loot_common).
item_material(pulse_pistol, composite).
item_max_stack(pulse_pistol, 1).

%% EMP Grenade
item(emp_grenade, 'EMP Grenade', weapon).
item_description(emp_grenade, 'Disables electronics in a small radius.').
item_value(emp_grenade, 20).
item_sell_value(emp_grenade, 12).
item_weight(emp_grenade, 0.5).
item_rarity(emp_grenade, uncommon).
item_category(emp_grenade, explosive).
item_stackable(emp_grenade).
item_tradeable(emp_grenade).
item_possessable(emp_grenade).
item_base(emp_grenade).
item_tag(emp_grenade, weapon).
item_tag(emp_grenade, explosive).
item_tag(emp_grenade, loot_uncommon).
item_max_stack(emp_grenade, 5).

%% Neural Stim
item(neural_stim, 'Neural Stim', consumable).
item_description(neural_stim, 'Boosts cognitive function temporarily.').
item_value(neural_stim, 18).
item_sell_value(neural_stim, 11).
item_weight(neural_stim, 0.2).
item_rarity(neural_stim, common).
item_category(neural_stim, stimulant).
item_stackable(neural_stim).
item_tradeable(neural_stim).
item_possessable(neural_stim).
item_base(neural_stim).
item_tag(neural_stim, consumable).
item_tag(neural_stim, stim).
item_tag(neural_stim, loot_common).
item_max_stack(neural_stim, 20).

%% Med-Hypo
item(med_hypo, 'Med-Hypo', consumable).
item_description(med_hypo, 'An auto-injecting medical treatment.').
item_value(med_hypo, 15).
item_sell_value(med_hypo, 9).
item_weight(med_hypo, 0.2).
item_rarity(med_hypo, common).
item_category(med_hypo, medical).
item_stackable(med_hypo).
item_tradeable(med_hypo).
item_possessable(med_hypo).
item_base(med_hypo).
item_tag(med_hypo, consumable).
item_tag(med_hypo, healing).
item_tag(med_hypo, loot_common).
item_max_stack(med_hypo, 20).

%% Synth-Food Bar
item(synth_food_bar, 'Synth-Food Bar', food).
item_description(synth_food_bar, 'Compressed synthetic nutrition.').
item_value(synth_food_bar, 3).
item_sell_value(synth_food_bar, 1).
item_weight(synth_food_bar, 0.3).
item_rarity(synth_food_bar, common).
item_category(synth_food_bar, food).
item_stackable(synth_food_bar).
item_tradeable(synth_food_bar).
item_possessable(synth_food_bar).
item_base(synth_food_bar).
item_tag(synth_food_bar, food).
item_tag(synth_food_bar, loot_common).
item_max_stack(synth_food_bar, 30).

%% Encrypted Data Pad
item(encrypted_data_pad, 'Encrypted Data Pad', key).
item_description(encrypted_data_pad, 'A handheld device containing encrypted data.').
item_value(encrypted_data_pad, 40).
item_sell_value(encrypted_data_pad, 24).
item_weight(encrypted_data_pad, 0.5).
item_rarity(encrypted_data_pad, rare).
item_category(encrypted_data_pad, data).
item_possessable(encrypted_data_pad).
item_base(encrypted_data_pad).
item_tag(encrypted_data_pad, key).
item_tag(encrypted_data_pad, tech).
item_tag(encrypted_data_pad, loot_rare).
item_max_stack(encrypted_data_pad, 1).

%% Energy Core
item(energy_core, 'Energy Core', material).
item_description(energy_core, 'A pulsating core of stored energy.').
item_value(energy_core, 35).
item_sell_value(energy_core, 21).
item_weight(energy_core, 2).
item_rarity(energy_core, uncommon).
item_category(energy_core, component).
item_stackable(energy_core).
item_tradeable(energy_core).
item_possessable(energy_core).
item_base(energy_core).
item_tag(energy_core, material).
item_tag(energy_core, tech).
item_tag(energy_core, loot_uncommon).
item_max_stack(energy_core, 5).

%% Cyber-Deck
item(cyber_deck, 'Cyber-Deck', tool).
item_description(cyber_deck, 'A portable hacking interface.').
item_value(cyber_deck, 50).
item_sell_value(cyber_deck, 30).
item_weight(cyber_deck, 1).
item_rarity(cyber_deck, rare).
item_category(cyber_deck, tool).
item_tradeable(cyber_deck).
item_possessable(cyber_deck).
item_base(cyber_deck).
item_tag(cyber_deck, tool).
item_tag(cyber_deck, tech).
item_tag(cyber_deck, loot_rare).
item_material(cyber_deck, composite).
item_max_stack(cyber_deck, 1).

%% Supply Crate
item(supply_crate, 'Supply Crate', collectible).
item_description(supply_crate, 'A crate of supplies from the corporate sector.').
item_value(supply_crate, 20).
item_sell_value(supply_crate, 12).
item_weight(supply_crate, 5).
item_rarity(supply_crate, uncommon).
item_category(supply_crate, container).
item_tradeable(supply_crate).
item_possessable(supply_crate).
item_base(supply_crate).
item_tag(supply_crate, collectible).
item_tag(supply_crate, container).
item_tag(supply_crate, loot_uncommon).
item_max_stack(supply_crate, 1).

%% Credstick
item(credstick, 'Credstick', collectible).
item_description(credstick, 'A digital currency storage device.').
item_value(credstick, 25).
item_sell_value(credstick, 25).
item_weight(credstick, 0.1).
item_rarity(credstick, common).
item_category(credstick, currency).
item_stackable(credstick).
item_tradeable(credstick).
item_possessable(credstick).
item_base(credstick).
item_tag(credstick, collectible).
item_tag(credstick, currency).
item_tag(credstick, loot_common).
item_max_stack(credstick, 10).

%% Plasma Pistol
item(plasma_pistol, 'Plasma Pistol', weapon).
item_description(plasma_pistol, 'A standard-issue plasma sidearm.').
item_value(plasma_pistol, 30).
item_sell_value(plasma_pistol, 18).
item_weight(plasma_pistol, 2).
item_rarity(plasma_pistol, common).
item_category(plasma_pistol, ranged_weapon).
item_tradeable(plasma_pistol).
item_possessable(plasma_pistol).
item_base(plasma_pistol).
item_tag(plasma_pistol, weapon).
item_tag(plasma_pistol, ranged).
item_tag(plasma_pistol, loot_common).
item_material(plasma_pistol, composite).
item_max_stack(plasma_pistol, 1).

%% Energy Cell
item(energy_cell, 'Energy Cell', material).
item_description(energy_cell, 'A rechargeable power source for weapons.').
item_value(energy_cell, 8).
item_sell_value(energy_cell, 5).
item_weight(energy_cell, 0.5).
item_rarity(energy_cell, common).
item_category(energy_cell, ammunition).
item_stackable(energy_cell).
item_tradeable(energy_cell).
item_possessable(energy_cell).
item_base(energy_cell).
item_tag(energy_cell, material).
item_tag(energy_cell, ammo).
item_tag(energy_cell, loot_common).
item_max_stack(energy_cell, 30).

%% Emergency Ration
item(emergency_ration, 'Emergency Ration', food).
item_description(emergency_ration, 'Compact emergency food supply.').
item_value(emergency_ration, 5).
item_sell_value(emergency_ration, 3).
item_weight(emergency_ration, 0.5).
item_rarity(emergency_ration, common).
item_category(emergency_ration, food).
item_stackable(emergency_ration).
item_tradeable(emergency_ration).
item_possessable(emergency_ration).
item_base(emergency_ration).
item_tag(emergency_ration, food).
item_tag(emergency_ration, loot_common).
item_max_stack(emergency_ration, 20).

%% Oxygen Tank
item(oxygen_tank, 'Oxygen Tank', consumable).
item_description(oxygen_tank, 'A portable oxygen supply.').
item_value(oxygen_tank, 12).
item_sell_value(oxygen_tank, 7).
item_weight(oxygen_tank, 3).
item_rarity(oxygen_tank, common).
item_category(oxygen_tank, survival).
item_stackable(oxygen_tank).
item_tradeable(oxygen_tank).
item_possessable(oxygen_tank).
item_base(oxygen_tank).
item_tag(oxygen_tank, consumable).
item_tag(oxygen_tank, survival).
item_tag(oxygen_tank, loot_common).
item_max_stack(oxygen_tank, 5).

%% Repair Kit
item(repair_kit, 'Repair Kit', tool).
item_description(repair_kit, 'Tools and parts for equipment maintenance.').
item_value(repair_kit, 20).
item_sell_value(repair_kit, 12).
item_weight(repair_kit, 2).
item_rarity(repair_kit, uncommon).
item_category(repair_kit, tool).
item_stackable(repair_kit).
item_tradeable(repair_kit).
item_possessable(repair_kit).
item_base(repair_kit).
item_tag(repair_kit, tool).
item_tag(repair_kit, loot_uncommon).
item_max_stack(repair_kit, 5).

%% Medi-Gel
item(medi_gel, 'Medi-Gel', consumable).
item_description(medi_gel, 'An advanced wound-sealing compound.').
item_value(medi_gel, 18).
item_sell_value(medi_gel, 11).
item_weight(medi_gel, 0.3).
item_rarity(medi_gel, common).
item_category(medi_gel, medical).
item_stackable(medi_gel).
item_tradeable(medi_gel).
item_possessable(medi_gel).
item_base(medi_gel).
item_tag(medi_gel, consumable).
item_tag(medi_gel, healing).
item_tag(medi_gel, loot_common).
item_max_stack(medi_gel, 20).

%% Star Map Fragment
item(star_map_fragment, 'Star Map Fragment', key).
item_description(star_map_fragment, 'A piece of an ancient navigation chart.').
item_value(star_map_fragment, 60).
item_sell_value(star_map_fragment, 36).
item_weight(star_map_fragment, 0.1).
item_rarity(star_map_fragment, rare).
item_category(star_map_fragment, data).
item_possessable(star_map_fragment).
item_base(star_map_fragment).
item_tag(star_map_fragment, key).
item_tag(star_map_fragment, loot_rare).
item_max_stack(star_map_fragment, 1).

%% Revolver
item(revolver, 'Revolver', weapon).
item_description(revolver, 'A classic six-shooter from a wilder age.').
item_value(revolver, 25).
item_sell_value(revolver, 15).
item_weight(revolver, 2).
item_rarity(revolver, common).
item_category(revolver, ranged_weapon).
item_tradeable(revolver).
item_possessable(revolver).
item_base(revolver).
item_tag(revolver, weapon).
item_tag(revolver, ranged).
item_tag(revolver, loot_common).
item_material(revolver, iron).
item_max_stack(revolver, 1).

%% Lasso
item(lasso, 'Lasso', tool).
item_description(lasso, 'A sturdy rope for wrangling.').
item_value(lasso, 8).
item_sell_value(lasso, 5).
item_weight(lasso, 2).
item_rarity(lasso, common).
item_category(lasso, tool).
item_tradeable(lasso).
item_possessable(lasso).
item_base(lasso).
item_tag(lasso, tool).
item_tag(lasso, loot_common).
item_material(lasso, fiber).
item_max_stack(lasso, 1).

%% Whiskey
item(whiskey, 'Whiskey', drink).
item_description(whiskey, 'A bottle of strong frontier whiskey.').
item_value(whiskey, 5).
item_sell_value(whiskey, 3).
item_weight(whiskey, 1).
item_rarity(whiskey, common).
item_category(whiskey, drink).
item_stackable(whiskey).
item_tradeable(whiskey).
item_possessable(whiskey).
item_base(whiskey).
item_tag(whiskey, drink).
item_tag(whiskey, loot_common).
item_max_stack(whiskey, 10).

%% Dynamite
item(dynamite, 'Dynamite', weapon).
item_description(dynamite, 'Explosive sticks for demolition.').
item_value(dynamite, 15).
item_sell_value(dynamite, 9).
item_weight(dynamite, 1).
item_rarity(dynamite, uncommon).
item_category(dynamite, explosive).
item_stackable(dynamite).
item_tradeable(dynamite).
item_possessable(dynamite).
item_base(dynamite).
item_tag(dynamite, weapon).
item_tag(dynamite, explosive).
item_tag(dynamite, loot_uncommon).
item_max_stack(dynamite, 5).

%% Wanted Poster
item(wanted_poster, 'Wanted Poster', quest).
item_description(wanted_poster, 'A poster describing a notorious outlaw.').
item_value(wanted_poster, 0).
item_sell_value(wanted_poster, 0).
item_weight(wanted_poster, 0.1).
item_rarity(wanted_poster, common).
item_category(wanted_poster, document).
item_possessable(wanted_poster).
item_base(wanted_poster).
item_tag(wanted_poster, quest).
item_material(wanted_poster, paper).
item_max_stack(wanted_poster, 1).

%% Bandage
item(bandage, 'Bandage', consumable).
item_description(bandage, 'Basic medical wrappings.').
item_value(bandage, 5).
item_sell_value(bandage, 3).
item_weight(bandage, 0.2).
item_rarity(bandage, common).
item_category(bandage, medical).
item_stackable(bandage).
item_tradeable(bandage).
item_possessable(bandage).
item_base(bandage).
item_tag(bandage, consumable).
item_tag(bandage, healing).
item_tag(bandage, loot_common).
item_material(bandage, cloth).
item_max_stack(bandage, 20).

%% Bookshelf
item(bookshelf, 'Bookshelf', collectible).
item_description(bookshelf, 'A shelf filled with dusty tomes and secrets.').
item_value(bookshelf, 10).
item_sell_value(bookshelf, 6).
item_weight(bookshelf, 10).
item_rarity(bookshelf, common).
item_category(bookshelf, furniture).
item_tradeable(bookshelf).
item_possessable(bookshelf).
item_base(bookshelf).
item_tag(bookshelf, collectible).
item_tag(bookshelf, furniture).
item_material(bookshelf, wood).
item_max_stack(bookshelf, 1).


