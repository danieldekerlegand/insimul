%% Insimul Items: Post-Apocalyptic Wasteland
%% Source: data/worlds/post_apocalyptic/items.pl
%% Created: 2026-04-03
%% Total: 18 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Gas Mask
item(gas_mask, 'Gas Mask', equipment).
item_description(gas_mask, 'A scavenged military-grade gas mask with replaceable filters. Essential for traversing irradiated zones and chemical clouds.').
item_value(gas_mask, 50).
item_sell_value(gas_mask, 25).
item_weight(gas_mask, 1.5).
item_rarity(gas_mask, uncommon).
item_category(gas_mask, survival).
item_tradeable(gas_mask).
item_possessable(gas_mask).
item_tag(gas_mask, survival).
item_tag(gas_mask, radiation).

%% Rad-Away Tablets
item(rad_away, 'Rad-Away Tablets', consumable).
item_description(rad_away, 'Potassium iodide pills that reduce radiation sickness. A precious commodity in the wasteland.').
item_value(rad_away, 30).
item_sell_value(rad_away, 18).
item_weight(rad_away, 0.1).
item_rarity(rad_away, rare).
item_category(rad_away, medicine).
item_stackable(rad_away).
item_tradeable(rad_away).
item_possessable(rad_away).
item_tag(rad_away, medicine).
item_tag(rad_away, radiation).

%% Geiger Counter
item(geiger_counter, 'Geiger Counter', tool).
item_description(geiger_counter, 'A battered but functional radiation detector. Clicks faster as radiation levels increase. Invaluable for scouts.').
item_value(geiger_counter, 75).
item_sell_value(geiger_counter, 40).
item_weight(geiger_counter, 1).
item_rarity(geiger_counter, rare).
item_category(geiger_counter, technology).
item_tradeable(geiger_counter).
item_possessable(geiger_counter).
item_tag(geiger_counter, technology).
item_tag(geiger_counter, radiation).

%% Scrap Machete
item(scrap_machete, 'Scrap Machete', weapon).
item_description(scrap_machete, 'A crude blade forged from a car leaf spring, sharpened to a wicked edge. Standard wasteland melee weapon.').
item_value(scrap_machete, 20).
item_sell_value(scrap_machete, 10).
item_weight(scrap_machete, 2).
item_rarity(scrap_machete, common).
item_category(scrap_machete, weapon).
item_tradeable(scrap_machete).
item_possessable(scrap_machete).
item_tag(scrap_machete, weapon).
item_tag(scrap_machete, melee).

%% Canned Food
item(canned_food, 'Canned Food', consumable).
item_description(canned_food, 'Pre-war canned goods with faded labels. Contents range from beans to mystery meat. Still edible after all these years.').
item_value(canned_food, 8).
item_sell_value(canned_food, 4).
item_weight(canned_food, 0.5).
item_rarity(canned_food, common).
item_category(canned_food, food_drink).
item_stackable(canned_food).
item_tradeable(canned_food).
item_possessable(canned_food).
item_tag(canned_food, food).
item_tag(canned_food, pre_war).

%% Purified Water
item(purified_water, 'Purified Water', consumable).
item_description(purified_water, 'Clean, filtered water in a sealed container. The most valuable currency in the wasteland.').
item_value(purified_water, 15).
item_sell_value(purified_water, 10).
item_weight(purified_water, 1).
item_rarity(purified_water, uncommon).
item_category(purified_water, food_drink).
item_stackable(purified_water).
item_tradeable(purified_water).
item_possessable(purified_water).
item_tag(purified_water, water).
item_tag(purified_water, survival).

%% Scrap Metal
item(scrap_metal, 'Scrap Metal', material).
item_description(scrap_metal, 'Salvaged metal pieces useful for repairs, construction, and trade. The building blocks of wasteland engineering.').
item_value(scrap_metal, 3).
item_sell_value(scrap_metal, 1).
item_weight(scrap_metal, 2).
item_rarity(scrap_metal, common).
item_category(scrap_metal, material).
item_stackable(scrap_metal).
item_tradeable(scrap_metal).
item_possessable(scrap_metal).
item_tag(scrap_metal, crafting).
item_tag(scrap_metal, salvage).

%% Water Purification Filter
item(water_filter, 'Water Purification Filter', tool).
item_description(water_filter, 'A ceramic and charcoal filter cartridge for water purifiers. Lasts about a month before needing replacement.').
item_value(water_filter, 40).
item_sell_value(water_filter, 22).
item_weight(water_filter, 0.5).
item_rarity(water_filter, uncommon).
item_category(water_filter, technology).
item_tradeable(water_filter).
item_possessable(water_filter).
item_tag(water_filter, water).
item_tag(water_filter, technology).

%% Pipe Rifle
item(pipe_rifle, 'Pipe Rifle', weapon).
item_description(pipe_rifle, 'A single-shot rifle cobbled together from plumbing pipes and a door hinge. Unreliable but lethal.').
item_value(pipe_rifle, 35).
item_sell_value(pipe_rifle, 18).
item_weight(pipe_rifle, 3).
item_rarity(pipe_rifle, uncommon).
item_category(pipe_rifle, weapon).
item_tradeable(pipe_rifle).
item_possessable(pipe_rifle).
item_tag(pipe_rifle, weapon).
item_tag(pipe_rifle, ranged).

%% Medkit
item(medkit_pa, 'Medkit', consumable).
item_description(medkit_pa, 'A scavenged first-aid kit with bandages, antiseptic, and a suture needle. Not sterile, but better than nothing.').
item_value(medkit_pa, 25).
item_sell_value(medkit_pa, 12).
item_weight(medkit_pa, 1).
item_rarity(medkit_pa, uncommon).
item_category(medkit_pa, medicine).
item_stackable(medkit_pa).
item_tradeable(medkit_pa).
item_possessable(medkit_pa).
item_tag(medkit_pa, medicine).
item_tag(medkit_pa, healing).

%% Binoculars
item(binoculars_pa, 'Binoculars', tool).
item_description(binoculars_pa, 'Pre-war military binoculars. One lens is cracked but they still work. Essential for spotting raiders at a distance.').
item_value(binoculars_pa, 20).
item_sell_value(binoculars_pa, 10).
item_weight(binoculars_pa, 0.8).
item_rarity(binoculars_pa, uncommon).
item_category(binoculars_pa, tool).
item_tradeable(binoculars_pa).
item_possessable(binoculars_pa).
item_tag(binoculars_pa, scouting).
item_tag(binoculars_pa, pre_war).

%% Leather Armor
item(leather_armor, 'Leather Armor', equipment).
item_description(leather_armor, 'Hardened leather reinforced with metal plates salvaged from road signs. Stops a knife, not a bullet.').
item_value(leather_armor, 30).
item_sell_value(leather_armor, 15).
item_weight(leather_armor, 4).
item_rarity(leather_armor, common).
item_category(leather_armor, armor).
item_tradeable(leather_armor).
item_possessable(leather_armor).
item_tag(leather_armor, armor).
item_tag(leather_armor, defense).

%% Fusion Cell
item(fusion_cell, 'Fusion Cell', material).
item_description(fusion_cell, 'A pre-war micro fusion battery. Still holds a charge. Powers radios, flashlights, and other salvaged electronics.').
item_value(fusion_cell, 45).
item_sell_value(fusion_cell, 25).
item_weight(fusion_cell, 0.5).
item_rarity(fusion_cell, rare).
item_category(fusion_cell, technology).
item_stackable(fusion_cell).
item_tradeable(fusion_cell).
item_possessable(fusion_cell).
item_tag(fusion_cell, technology).
item_tag(fusion_cell, pre_war).

%% Rope
item(rope_pa, 'Rope', tool).
item_description(rope_pa, 'Fifty feet of braided nylon rope scavenged from a hardware store. Useful for climbing, binding, and rigging traps.').
item_value(rope_pa, 5).
item_sell_value(rope_pa, 2).
item_weight(rope_pa, 2).
item_rarity(rope_pa, common).
item_category(rope_pa, tool).
item_tradeable(rope_pa).
item_possessable(rope_pa).
item_tag(rope_pa, utility).
item_tag(rope_pa, crafting).

%% Rad Herbs
item(rad_herbs, 'Rad Herbs', consumable).
item_description(rad_herbs, 'A poultice of mutated herbs that Petra Volkov swears reduces radiation sickness. Tastes terrible but seems to work.').
item_value(rad_herbs, 12).
item_sell_value(rad_herbs, 6).
item_weight(rad_herbs, 0.2).
item_rarity(rad_herbs, uncommon).
item_category(rad_herbs, medicine).
item_stackable(rad_herbs).
item_tradeable(rad_herbs).
item_possessable(rad_herbs).
item_tag(rad_herbs, medicine).
item_tag(rad_herbs, herbal).

%% Signal Flare
item(signal_flare, 'Signal Flare', consumable).
item_description(signal_flare, 'A bright red emergency flare. Visible for miles. Can signal allies or attract unwanted attention.').
item_value(signal_flare, 10).
item_sell_value(signal_flare, 5).
item_weight(signal_flare, 0.3).
item_rarity(signal_flare, common).
item_category(signal_flare, tool).
item_stackable(signal_flare).
item_tradeable(signal_flare).
item_possessable(signal_flare).
item_tag(signal_flare, signaling).
item_tag(signal_flare, survival).

%% Trade Tokens
item(trade_tokens, 'Trade Tokens', material).
item_description(trade_tokens, 'Stamped metal discs used as currency in Haven Ridge. Each token represents one unit of clean water.').
item_value(trade_tokens, 1).
item_sell_value(trade_tokens, 1).
item_weight(trade_tokens, 0.05).
item_rarity(trade_tokens, common).
item_category(trade_tokens, currency).
item_stackable(trade_tokens).
item_tradeable(trade_tokens).
item_possessable(trade_tokens).
item_tag(trade_tokens, currency).
item_tag(trade_tokens, economy).

%% Mutant Hide
item(mutant_hide, 'Mutant Hide', material).
item_description(mutant_hide, 'Thick, leathery skin harvested from a mutant creature. Tougher than regular leather, slightly radioactive.').
item_value(mutant_hide, 18).
item_sell_value(mutant_hide, 9).
item_weight(mutant_hide, 3).
item_rarity(mutant_hide, uncommon).
item_category(mutant_hide, material).
item_stackable(mutant_hide).
item_tradeable(mutant_hide).
item_possessable(mutant_hide).
item_tag(mutant_hide, crafting).
item_tag(mutant_hide, mutant).
