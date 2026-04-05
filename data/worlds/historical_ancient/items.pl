%% Insimul Items: Historical Ancient World
%% Source: data/worlds/historical_ancient/items.pl
%% Created: 2026-04-03
%% Total: 18 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Amphora of Wine
item(amphora_wine, 'Amphora of Wine', consumable).
item_description(amphora_wine, 'A two-handled clay vessel filled with Falernian wine, the finest vintage in the Mediterranean.').
item_value(amphora_wine, 20).
item_sell_value(amphora_wine, 12).
item_weight(amphora_wine, 5).
item_rarity(amphora_wine, common).
item_category(amphora_wine, food_drink).
item_stackable(amphora_wine).
item_tradeable(amphora_wine).
item_possessable(amphora_wine).
item_tag(amphora_wine, cultural).
item_tag(amphora_wine, beverage).

%% Toga Virilis
item(toga_virilis, 'Toga Virilis', equipment).
item_description(toga_virilis, 'A plain white wool toga worn by adult Roman citizens as a mark of full citizenship.').
item_value(toga_virilis, 30).
item_sell_value(toga_virilis, 15).
item_weight(toga_virilis, 3).
item_rarity(toga_virilis, common).
item_category(toga_virilis, clothing).
item_tradeable(toga_virilis).
item_possessable(toga_virilis).
item_tag(toga_virilis, clothing).
item_tag(toga_virilis, cultural).

%% Laurel Wreath
item(laurel_wreath, 'Laurel Wreath', accessory).
item_description(laurel_wreath, 'A crown of bay laurel leaves awarded to victors in athletic and poetic competitions.').
item_value(laurel_wreath, 50).
item_sell_value(laurel_wreath, 30).
item_weight(laurel_wreath, 0.2).
item_rarity(laurel_wreath, rare).
item_category(laurel_wreath, accessory).
item_tradeable(laurel_wreath).
item_possessable(laurel_wreath).
item_tag(laurel_wreath, honor).
item_tag(laurel_wreath, cultural).

%% Bronze Gladius
item(bronze_gladius, 'Bronze Gladius', equipment).
item_description(bronze_gladius, 'A short stabbing sword used by Roman legionaries and gladiators in close combat.').
item_value(bronze_gladius, 40).
item_sell_value(bronze_gladius, 25).
item_weight(bronze_gladius, 2).
item_rarity(bronze_gladius, uncommon).
item_category(bronze_gladius, weapon).
item_tradeable(bronze_gladius).
item_possessable(bronze_gladius).
item_tag(bronze_gladius, weapon).
item_tag(bronze_gladius, military).

%% Papyrus Scroll
item(papyrus_scroll, 'Papyrus Scroll', tool).
item_description(papyrus_scroll, 'A blank scroll of Egyptian papyrus, ready for writing with reed pen and ink.').
item_value(papyrus_scroll, 10).
item_sell_value(papyrus_scroll, 5).
item_weight(papyrus_scroll, 0.3).
item_rarity(papyrus_scroll, common).
item_category(papyrus_scroll, education).
item_stackable(papyrus_scroll).
item_tradeable(papyrus_scroll).
item_possessable(papyrus_scroll).
item_tag(papyrus_scroll, education).
item_tag(papyrus_scroll, writing).

%% Ostrakon (Potsherd for Voting)
item(ostrakon, 'Ostrakon', tool).
item_description(ostrakon, 'A broken pottery shard used for writing votes during ostracism proceedings in Athens.').
item_value(ostrakon, 1).
item_sell_value(ostrakon, 0).
item_weight(ostrakon, 0.2).
item_rarity(ostrakon, common).
item_category(ostrakon, civic).
item_stackable(ostrakon).
item_tradeable(ostrakon).
item_possessable(ostrakon).
item_tag(ostrakon, civic).
item_tag(ostrakon, democracy).

%% Olive Oil Lamp
item(olive_oil_lamp, 'Olive Oil Lamp', tool).
item_description(olive_oil_lamp, 'A small terracotta lamp fueled by olive oil, providing light after sundown.').
item_value(olive_oil_lamp, 5).
item_sell_value(olive_oil_lamp, 2).
item_weight(olive_oil_lamp, 0.5).
item_rarity(olive_oil_lamp, common).
item_category(olive_oil_lamp, household).
item_tradeable(olive_oil_lamp).
item_possessable(olive_oil_lamp).
item_tag(olive_oil_lamp, household).
item_tag(olive_oil_lamp, cultural).

%% Strigil
item(strigil, 'Strigil', tool).
item_description(strigil, 'A curved bronze scraper used to clean oil and dirt from the skin at the public baths.').
item_value(strigil, 8).
item_sell_value(strigil, 4).
item_weight(strigil, 0.3).
item_rarity(strigil, common).
item_category(strigil, hygiene).
item_tradeable(strigil).
item_possessable(strigil).
item_tag(strigil, hygiene).
item_tag(strigil, cultural).

%% Red-Figure Kylix
item(red_figure_kylix, 'Red-Figure Kylix', material).
item_description(red_figure_kylix, 'A shallow two-handled drinking cup decorated with scenes from mythology in the Attic red-figure style.').
item_value(red_figure_kylix, 25).
item_sell_value(red_figure_kylix, 15).
item_weight(red_figure_kylix, 1).
item_rarity(red_figure_kylix, uncommon).
item_category(red_figure_kylix, decorative).
item_tradeable(red_figure_kylix).
item_possessable(red_figure_kylix).
item_tag(red_figure_kylix, craft).
item_tag(red_figure_kylix, cultural).

%% Linen Chiton
item(linen_chiton, 'Linen Chiton', equipment).
item_description(linen_chiton, 'A simple tunic of Egyptian linen, the everyday garment of the Greek world.').
item_value(linen_chiton, 12).
item_sell_value(linen_chiton, 6).
item_weight(linen_chiton, 1).
item_rarity(linen_chiton, common).
item_category(linen_chiton, clothing).
item_tradeable(linen_chiton).
item_possessable(linen_chiton).
item_tag(linen_chiton, clothing).
item_tag(linen_chiton, cultural).

%% Drachma Coins
item(drachma_coins, 'Drachma Coins', material).
item_description(drachma_coins, 'Silver Athenian drachmai stamped with the owl of Athena, accepted across the Mediterranean.').
item_value(drachma_coins, 15).
item_sell_value(drachma_coins, 15).
item_weight(drachma_coins, 0.3).
item_rarity(drachma_coins, common).
item_category(drachma_coins, currency).
item_stackable(drachma_coins).
item_tradeable(drachma_coins).
item_possessable(drachma_coins).
item_tag(drachma_coins, currency).
item_tag(drachma_coins, trade).

%% Wax Tablet
item(wax_tablet, 'Wax Tablet', tool).
item_description(wax_tablet, 'A wooden frame filled with wax for writing with a stylus, erasable and reusable.').
item_value(wax_tablet, 6).
item_sell_value(wax_tablet, 3).
item_weight(wax_tablet, 0.5).
item_rarity(wax_tablet, common).
item_category(wax_tablet, education).
item_stackable(wax_tablet).
item_tradeable(wax_tablet).
item_possessable(wax_tablet).
item_tag(wax_tablet, education).
item_tag(wax_tablet, writing).

%% Bronze Shield (Aspis)
item(bronze_aspis, 'Bronze Aspis', equipment).
item_description(bronze_aspis, 'A large round shield faced with bronze, the core of the hoplite phalanx formation.').
item_value(bronze_aspis, 60).
item_sell_value(bronze_aspis, 35).
item_weight(bronze_aspis, 8).
item_rarity(bronze_aspis, uncommon).
item_category(bronze_aspis, weapon).
item_tradeable(bronze_aspis).
item_possessable(bronze_aspis).
item_tag(bronze_aspis, weapon).
item_tag(bronze_aspis, military).

%% Scarab Amulet
item(scarab_amulet, 'Scarab Amulet', accessory).
item_description(scarab_amulet, 'A carved stone scarab beetle amulet symbolizing rebirth and protection from the god Khepri.').
item_value(scarab_amulet, 35).
item_sell_value(scarab_amulet, 20).
item_weight(scarab_amulet, 0.1).
item_rarity(scarab_amulet, rare).
item_category(scarab_amulet, accessory).
item_tradeable(scarab_amulet).
item_possessable(scarab_amulet).
item_tag(scarab_amulet, religious).
item_tag(scarab_amulet, cultural).

%% Garum (Fish Sauce)
item(garum, 'Garum', consumable).
item_description(garum, 'A pungent fermented fish sauce essential to Roman cooking, shipped in sealed amphorae.').
item_value(garum, 8).
item_sell_value(garum, 4).
item_weight(garum, 1).
item_rarity(garum, common).
item_category(garum, food_drink).
item_stackable(garum).
item_tradeable(garum).
item_possessable(garum).
item_tag(garum, food).
item_tag(garum, cooking).

%% Incense Cone
item(incense_cone, 'Incense Cone', consumable).
item_description(incense_cone, 'A cone of kyphi incense made from myrrh, frankincense, and honey, burned in temple rituals.').
item_value(incense_cone, 12).
item_sell_value(incense_cone, 7).
item_weight(incense_cone, 0.2).
item_rarity(incense_cone, uncommon).
item_category(incense_cone, religious).
item_stackable(incense_cone).
item_tradeable(incense_cone).
item_possessable(incense_cone).
item_tag(incense_cone, religious).
item_tag(incense_cone, cultural).

%% Theatrical Mask
item(theatrical_mask, 'Theatrical Mask', tool).
item_description(theatrical_mask, 'A painted linen-and-cork mask worn by actors in Greek dramatic festivals.').
item_value(theatrical_mask, 18).
item_sell_value(theatrical_mask, 10).
item_weight(theatrical_mask, 0.5).
item_rarity(theatrical_mask, uncommon).
item_category(theatrical_mask, entertainment).
item_tradeable(theatrical_mask).
item_possessable(theatrical_mask).
item_tag(theatrical_mask, cultural).
item_tag(theatrical_mask, entertainment).

%% Olive Branch
item(olive_branch, 'Olive Branch', material).
item_description(olive_branch, 'A branch of sacred olive, symbol of peace and victory given to Olympic champions.').
item_value(olive_branch, 3).
item_sell_value(olive_branch, 1).
item_weight(olive_branch, 0.2).
item_rarity(olive_branch, common).
item_category(olive_branch, religious).
item_tradeable(olive_branch).
item_possessable(olive_branch).
item_tag(olive_branch, religious).
item_tag(olive_branch, honor).
