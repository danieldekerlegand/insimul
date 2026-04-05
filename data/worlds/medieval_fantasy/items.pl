%% Insimul Items: Medieval Fantasy
%% Source: data/worlds/medieval_fantasy/items.pl
%% Created: 2026-04-03
%% Total: 18 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Iron Dagger
item(iron_dagger, 'Iron Dagger', weapon).
item_description(iron_dagger, 'A simple but sharp iron dagger forged at the Ironhand Forge.').
item_value(iron_dagger, 10).
item_sell_value(iron_dagger, 5).
item_weight(iron_dagger, 1).
item_rarity(iron_dagger, common).
item_category(iron_dagger, weapon).
item_tradeable(iron_dagger).
item_possessable(iron_dagger).
item_tag(iron_dagger, weapon).
item_tag(iron_dagger, martial).

%% Steel Longsword
item(steel_longsword, 'Steel Longsword', weapon).
item_description(steel_longsword, 'A well-balanced longsword of tempered steel, standard issue for the royal knights.').
item_value(steel_longsword, 80).
item_sell_value(steel_longsword, 40).
item_weight(steel_longsword, 4).
item_rarity(steel_longsword, uncommon).
item_category(steel_longsword, weapon).
item_tradeable(steel_longsword).
item_possessable(steel_longsword).
item_tag(steel_longsword, weapon).
item_tag(steel_longsword, martial).

%% Healing Potion
item(healing_potion, 'Healing Potion', consumable).
item_description(healing_potion, 'A small glass vial of luminous green liquid brewed by Mirabel Thornwick.').
item_value(healing_potion, 25).
item_sell_value(healing_potion, 12).
item_weight(healing_potion, 0.3).
item_rarity(healing_potion, uncommon).
item_category(healing_potion, potion).
item_stackable(healing_potion).
item_tradeable(healing_potion).
item_possessable(healing_potion).
item_tag(healing_potion, magical).
item_tag(healing_potion, healing).

%% Mead
item(mead_mf, 'Mead', consumable).
item_description(mead_mf, 'A tankard of sweet honey mead from The Gilded Flagon.').
item_value(mead_mf, 3).
item_sell_value(mead_mf, 1).
item_weight(mead_mf, 0.5).
item_rarity(mead_mf, common).
item_category(mead_mf, food_drink).
item_stackable(mead_mf).
item_tradeable(mead_mf).
item_possessable(mead_mf).
item_tag(mead_mf, beverage).
item_tag(mead_mf, social).

%% Bread Loaf
item(bread_loaf, 'Bread Loaf', consumable).
item_description(bread_loaf, 'A dense loaf of rye bread, the staple food of commoners and soldiers alike.').
item_value(bread_loaf, 2).
item_sell_value(bread_loaf, 1).
item_weight(bread_loaf, 0.5).
item_rarity(bread_loaf, common).
item_category(bread_loaf, food_drink).
item_stackable(bread_loaf).
item_tradeable(bread_loaf).
item_possessable(bread_loaf).
item_tag(bread_loaf, food).

%% Fey Blossom
item(fey_blossom, 'Fey Blossom', material).
item_description(fey_blossom, 'A shimmering flower from the enchanted glade. Its petals glow faintly with fey magic.').
item_value(fey_blossom, 50).
item_sell_value(fey_blossom, 25).
item_weight(fey_blossom, 0.1).
item_rarity(fey_blossom, rare).
item_category(fey_blossom, material).
item_possessable(fey_blossom).
item_tag(fey_blossom, magical).
item_tag(fey_blossom, crafting).

%% Dragon Scale
item(dragon_scale, 'Dragon Scale', material).
item_description(dragon_scale, 'A massive scale shed by the dragon of Silverdeep. It is fireproof and harder than steel.').
item_value(dragon_scale, 200).
item_sell_value(dragon_scale, 100).
item_weight(dragon_scale, 3).
item_rarity(dragon_scale, epic).
item_category(dragon_scale, material).
item_possessable(dragon_scale).
item_tag(dragon_scale, crafting).
item_tag(dragon_scale, quest_item).

%% Holy Amulet
item(holy_amulet, 'Holy Amulet', accessory).
item_description(holy_amulet, 'A silver amulet bearing the sunburst of the Cathedral of Light. It wards off dark magic.').
item_value(holy_amulet, 60).
item_sell_value(holy_amulet, 30).
item_weight(holy_amulet, 0.2).
item_rarity(holy_amulet, rare).
item_category(holy_amulet, accessory).
item_possessable(holy_amulet).
item_tag(holy_amulet, magical).
item_tag(holy_amulet, divine).

%% Spell Tome of Warding
item(spell_tome_warding, 'Spell Tome of Warding', tool).
item_description(spell_tome_warding, 'A leather-bound tome containing protective incantations, found in the Wizard Tower.').
item_value(spell_tome_warding, 100).
item_sell_value(spell_tome_warding, 50).
item_weight(spell_tome_warding, 2).
item_rarity(spell_tome_warding, rare).
item_category(spell_tome_warding, scroll).
item_possessable(spell_tome_warding).
item_tag(spell_tome_warding, magical).
item_tag(spell_tome_warding, knowledge).

%% Herbal Remedy
item(herbal_remedy, 'Herbal Remedy', consumable).
item_description(herbal_remedy, 'A poultice of forest herbs prepared by Elara Willowshade. It cures common ailments.').
item_value(herbal_remedy, 8).
item_sell_value(herbal_remedy, 4).
item_weight(herbal_remedy, 0.2).
item_rarity(herbal_remedy, common).
item_category(herbal_remedy, potion).
item_stackable(herbal_remedy).
item_tradeable(herbal_remedy).
item_possessable(herbal_remedy).
item_tag(herbal_remedy, healing).
item_tag(herbal_remedy, nature).

%% Iron Shield
item(iron_shield, 'Iron Shield', equipment).
item_description(iron_shield, 'A sturdy round shield of hammered iron with the royal crest embossed on its face.').
item_value(iron_shield, 35).
item_sell_value(iron_shield, 18).
item_weight(iron_shield, 6).
item_rarity(iron_shield, common).
item_category(iron_shield, armor).
item_tradeable(iron_shield).
item_possessable(iron_shield).
item_tag(iron_shield, armor).
item_tag(iron_shield, martial).

%% Leather Armor
item(leather_armor, 'Leather Armor', equipment).
item_description(leather_armor, 'A set of hardened leather armor suited for scouts and rangers.').
item_value(leather_armor, 40).
item_sell_value(leather_armor, 20).
item_weight(leather_armor, 5).
item_rarity(leather_armor, common).
item_category(leather_armor, armor).
item_tradeable(leather_armor).
item_possessable(leather_armor).
item_tag(leather_armor, armor).
item_tag(leather_armor, martial).

%% Torch
item(torch_mf, 'Torch', tool).
item_description(torch_mf, 'A pitch-soaked wooden torch that burns for several hours. Essential for dungeon exploration.').
item_value(torch_mf, 1).
item_sell_value(torch_mf, 0).
item_weight(torch_mf, 1).
item_rarity(torch_mf, common).
item_category(torch_mf, tool).
item_stackable(torch_mf).
item_tradeable(torch_mf).
item_possessable(torch_mf).
item_tag(torch_mf, exploration).

%% Silver Ore
item(silver_ore, 'Silver Ore', material).
item_description(silver_ore, 'A chunk of raw silver ore mined from the shafts of Silverdeep.').
item_value(silver_ore, 15).
item_sell_value(silver_ore, 8).
item_weight(silver_ore, 3).
item_rarity(silver_ore, common).
item_category(silver_ore, material).
item_stackable(silver_ore).
item_tradeable(silver_ore).
item_possessable(silver_ore).
item_tag(silver_ore, crafting).
item_tag(silver_ore, mining).

%% Map of the Borderlands
item(borderlands_map, 'Map of the Borderlands', tool).
item_description(borderlands_map, 'A hand-drawn map from Maps and Charts showing the roads between Aldenmere and Thornhaven.').
item_value(borderlands_map, 12).
item_sell_value(borderlands_map, 6).
item_weight(borderlands_map, 0.1).
item_rarity(borderlands_map, uncommon).
item_category(borderlands_map, tool).
item_tradeable(borderlands_map).
item_possessable(borderlands_map).
item_tag(borderlands_map, exploration).
item_tag(borderlands_map, knowledge).

%% Gemstone
item(gemstone_mf, 'Cut Gemstone', material).
item_description(gemstone_mf, 'A faceted ruby cut at Brightcut Gems in Silverdeep. It sparkles with deep red fire.').
item_value(gemstone_mf, 100).
item_sell_value(gemstone_mf, 60).
item_weight(gemstone_mf, 0.1).
item_rarity(gemstone_mf, rare).
item_category(gemstone_mf, material).
item_tradeable(gemstone_mf).
item_possessable(gemstone_mf).
item_tag(gemstone_mf, luxury).
item_tag(gemstone_mf, crafting).

%% Rope
item(rope_mf, 'Rope', tool).
item_description(rope_mf, 'Fifty feet of strong hemp rope useful for climbing, binding, or rigging traps.').
item_value(rope_mf, 5).
item_sell_value(rope_mf, 2).
item_weight(rope_mf, 3).
item_rarity(rope_mf, common).
item_category(rope_mf, tool).
item_stackable(rope_mf).
item_tradeable(rope_mf).
item_possessable(rope_mf).
item_tag(rope_mf, exploration).
item_tag(rope_mf, utility).

%% Enchanted Ring
item(enchanted_ring, 'Enchanted Ring', accessory).
item_description(enchanted_ring, 'A gold ring inscribed with runes of protection. It glows faintly when danger is near.').
item_value(enchanted_ring, 150).
item_sell_value(enchanted_ring, 75).
item_weight(enchanted_ring, 0.1).
item_rarity(enchanted_ring, epic).
item_category(enchanted_ring, accessory).
item_possessable(enchanted_ring).
item_tag(enchanted_ring, magical).
item_tag(enchanted_ring, luxury).
