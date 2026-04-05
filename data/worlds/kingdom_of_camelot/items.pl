%% Insimul Items: Kingdom of Camelot
%% Source: data/worlds/kingdom_of_camelot/items.pl
%% Created: 2026-04-03
%% Total: 18 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Excalibur
item(excalibur, 'Excalibur', weapon).
item_description(excalibur, 'The legendary sword of King Arthur, drawn from the stone or given by the Lady of the Lake. It gleams with otherworldly light.').
item_value(excalibur, 5000).
item_sell_value(excalibur, 0).
item_weight(excalibur, 4).
item_rarity(excalibur, legendary).
item_category(excalibur, weapon).
item_possessable(excalibur).
item_tag(excalibur, legendary).
item_tag(excalibur, royal).

%% The Holy Grail
item(holy_grail, 'The Holy Grail', artifact).
item_description(holy_grail, 'The sacred chalice sought by the Knights of the Round Table. It is said to grant eternal life and divine visions.').
item_value(holy_grail, 10000).
item_sell_value(holy_grail, 0).
item_weight(holy_grail, 1).
item_rarity(holy_grail, legendary).
item_category(holy_grail, artifact).
item_possessable(holy_grail).
item_tag(holy_grail, legendary).
item_tag(holy_grail, religious).

%% Knight Plate Armor
item(knight_plate_armor, 'Knight Plate Armor', equipment).
item_description(knight_plate_armor, 'A full suit of polished steel plate armor bearing the crest of Camelot. Heavy but offers superior protection.').
item_value(knight_plate_armor, 500).
item_sell_value(knight_plate_armor, 250).
item_weight(knight_plate_armor, 25).
item_rarity(knight_plate_armor, uncommon).
item_category(knight_plate_armor, armor).
item_tradeable(knight_plate_armor).
item_possessable(knight_plate_armor).
item_tag(knight_plate_armor, military).
item_tag(knight_plate_armor, knightly).

%% Enchanted Amulet
item(enchanted_amulet, 'Enchanted Amulet', accessory).
item_description(enchanted_amulet, 'A silver amulet imbued with protective magic by Merlin himself. It grows warm when danger approaches.').
item_value(enchanted_amulet, 300).
item_sell_value(enchanted_amulet, 150).
item_weight(enchanted_amulet, 0.2).
item_rarity(enchanted_amulet, rare).
item_category(enchanted_amulet, accessory).
item_tradeable(enchanted_amulet).
item_possessable(enchanted_amulet).
item_tag(enchanted_amulet, magical).
item_tag(enchanted_amulet, protective).

%% Jousting Lance
item(jousting_lance, 'Jousting Lance', weapon).
item_description(jousting_lance, 'A long wooden lance tipped with a blunted coronel, used in tournament jousting at the fields of Camelot.').
item_value(jousting_lance, 50).
item_sell_value(jousting_lance, 25).
item_weight(jousting_lance, 8).
item_rarity(jousting_lance, common).
item_category(jousting_lance, weapon).
item_tradeable(jousting_lance).
item_possessable(jousting_lance).
item_tag(jousting_lance, tournament).
item_tag(jousting_lance, knightly).

%% Round Table Shield
item(round_table_shield, 'Round Table Shield', equipment).
item_description(round_table_shield, 'A kite shield emblazoned with the Pendragon dragon, carried by sworn knights of the Round Table.').
item_value(round_table_shield, 200).
item_sell_value(round_table_shield, 100).
item_weight(round_table_shield, 6).
item_rarity(round_table_shield, uncommon).
item_category(round_table_shield, armor).
item_tradeable(round_table_shield).
item_possessable(round_table_shield).
item_tag(round_table_shield, military).
item_tag(round_table_shield, royal).

%% Healing Potion
item(healing_potion, 'Healing Potion', consumable).
item_description(healing_potion, 'A small vial of restorative liquid brewed at the Apothecary. It mends wounds and eases pain.').
item_value(healing_potion, 20).
item_sell_value(healing_potion, 10).
item_weight(healing_potion, 0.3).
item_rarity(healing_potion, common).
item_category(healing_potion, consumable).
item_stackable(healing_potion).
item_tradeable(healing_potion).
item_possessable(healing_potion).
item_tag(healing_potion, magical).
item_tag(healing_potion, restorative).

%% Mead Flask
item(mead_flask, 'Mead Flask', consumable).
item_description(mead_flask, 'A leather flask filled with honey mead from the Crossed Swords Tavern. A favorite among knights and commoners alike.').
item_value(mead_flask, 5).
item_sell_value(mead_flask, 2).
item_weight(mead_flask, 0.5).
item_rarity(mead_flask, common).
item_category(mead_flask, food_drink).
item_stackable(mead_flask).
item_tradeable(mead_flask).
item_possessable(mead_flask).
item_tag(mead_flask, beverage).

%% Spell Scroll
item(spell_scroll, 'Spell Scroll', consumable).
item_description(spell_scroll, 'A parchment inscribed with arcane runes by Merlin. When read aloud, it releases a single magical effect.').
item_value(spell_scroll, 75).
item_sell_value(spell_scroll, 40).
item_weight(spell_scroll, 0.1).
item_rarity(spell_scroll, rare).
item_category(spell_scroll, consumable).
item_stackable(spell_scroll).
item_tradeable(spell_scroll).
item_possessable(spell_scroll).
item_tag(spell_scroll, magical).

%% Iron Longsword
item(iron_longsword, 'Iron Longsword', weapon).
item_description(iron_longsword, 'A sturdy longsword forged at the Ironheart Smithy. The standard weapon of a Camelot foot soldier.').
item_value(iron_longsword, 80).
item_sell_value(iron_longsword, 40).
item_weight(iron_longsword, 3).
item_rarity(iron_longsword, common).
item_category(iron_longsword, weapon).
item_tradeable(iron_longsword).
item_possessable(iron_longsword).
item_tag(iron_longsword, military).

%% Chainmail Hauberk
item(chainmail_hauberk, 'Chainmail Hauberk', equipment).
item_description(chainmail_hauberk, 'A knee-length shirt of interlocking iron rings. Lighter than plate armor and favored by scouts.').
item_value(chainmail_hauberk, 150).
item_sell_value(chainmail_hauberk, 75).
item_weight(chainmail_hauberk, 12).
item_rarity(chainmail_hauberk, common).
item_category(chainmail_hauberk, armor).
item_tradeable(chainmail_hauberk).
item_possessable(chainmail_hauberk).
item_tag(chainmail_hauberk, military).

%% Crystal Shard
item(crystal_shard, 'Crystal Shard', material).
item_description(crystal_shard, 'A glowing fragment from the Standing Stones. It hums with latent magical energy useful for enchantments.').
item_value(crystal_shard, 50).
item_sell_value(crystal_shard, 30).
item_weight(crystal_shard, 0.3).
item_rarity(crystal_shard, rare).
item_category(crystal_shard, material).
item_stackable(crystal_shard).
item_tradeable(crystal_shard).
item_possessable(crystal_shard).
item_tag(crystal_shard, magical).
item_tag(crystal_shard, crafting).

%% Fresh Bread Loaf
item(fresh_bread, 'Fresh Bread Loaf', consumable).
item_description(fresh_bread, 'A warm loaf of rye bread from the Bakers Hearth. Simple, filling, and a staple of daily life in Camelot.').
item_value(fresh_bread, 2).
item_sell_value(fresh_bread, 1).
item_weight(fresh_bread, 0.5).
item_rarity(fresh_bread, common).
item_category(fresh_bread, food_drink).
item_stackable(fresh_bread).
item_tradeable(fresh_bread).
item_possessable(fresh_bread).
item_tag(fresh_bread, food).

%% Woven Cloak
item(woven_cloak, 'Woven Cloak', equipment).
item_description(woven_cloak, 'A fine woolen cloak from the Weavers Loom. Dyed in the deep green of the Camelot countryside.').
item_value(woven_cloak, 30).
item_sell_value(woven_cloak, 15).
item_weight(woven_cloak, 1).
item_rarity(woven_cloak, common).
item_category(woven_cloak, clothing).
item_tradeable(woven_cloak).
item_possessable(woven_cloak).
item_tag(woven_cloak, clothing).

%% Tournament Crown
item(tournament_crown, 'Tournament Crown', accessory).
item_description(tournament_crown, 'A gilded laurel crown awarded to the champion of the Grand Tournament by Queen Guinevere herself.').
item_value(tournament_crown, 250).
item_sell_value(tournament_crown, 125).
item_weight(tournament_crown, 0.5).
item_rarity(tournament_crown, rare).
item_category(tournament_crown, accessory).
item_possessable(tournament_crown).
item_tag(tournament_crown, tournament).
item_tag(tournament_crown, prestige).

%% Moonpetal Flower
item(moonpetal_flower, 'Moonpetal Flower', material).
item_description(moonpetal_flower, 'A luminous silver flower that blooms only at the Dark Forest Edge under moonlight. Used in powerful enchantments.').
item_value(moonpetal_flower, 40).
item_sell_value(moonpetal_flower, 20).
item_weight(moonpetal_flower, 0.1).
item_rarity(moonpetal_flower, rare).
item_category(moonpetal_flower, material).
item_stackable(moonpetal_flower).
item_tradeable(moonpetal_flower).
item_possessable(moonpetal_flower).
item_tag(moonpetal_flower, magical).
item_tag(moonpetal_flower, crafting).

%% Ceremonial Blade
item(ceremonial_blade, 'Ceremonial Blade', weapon).
item_description(ceremonial_blade, 'A finely crafted blade forged from enchanted iron. Carried during knighting ceremonies at the Round Table.').
item_value(ceremonial_blade, 400).
item_sell_value(ceremonial_blade, 200).
item_weight(ceremonial_blade, 2).
item_rarity(ceremonial_blade, rare).
item_category(ceremonial_blade, weapon).
item_possessable(ceremonial_blade).
item_tag(ceremonial_blade, royal).
item_tag(ceremonial_blade, ceremony).

%% Lady Blessing Token
item(lady_blessing_token, 'Lady Blessing Token', artifact).
item_description(lady_blessing_token, 'A shimmering token given by the Lady of the Lake. It grants safe passage through enchanted waters.').
item_value(lady_blessing_token, 500).
item_sell_value(lady_blessing_token, 0).
item_weight(lady_blessing_token, 0.1).
item_rarity(lady_blessing_token, legendary).
item_category(lady_blessing_token, artifact).
item_possessable(lady_blessing_token).
item_tag(lady_blessing_token, magical).
item_tag(lady_blessing_token, blessing).
