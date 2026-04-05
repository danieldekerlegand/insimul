%% Insimul Items: Renaissance City-States
%% Source: data/worlds/historical_renaissance/items.pl
%% Created: 2026-04-03
%% Total: 20 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Oil Painting
item(oil_painting, 'Oil Painting', material).
item_description(oil_painting, 'A panel painting rendered in rich oil pigments, depicting a Madonna or patron portrait.').
item_value(oil_painting, 200).
item_sell_value(oil_painting, 120).
item_weight(oil_painting, 5).
item_rarity(oil_painting, rare).
item_category(oil_painting, art).
item_tradeable(oil_painting).
item_possessable(oil_painting).
item_tag(oil_painting, art).
item_tag(oil_painting, luxury).

%% Astrolabe
item(astrolabe, 'Astrolabe', tool).
item_description(astrolabe, 'A brass instrument for measuring the altitude of celestial bodies, essential for navigation and astronomy.').
item_value(astrolabe, 150).
item_sell_value(astrolabe, 90).
item_weight(astrolabe, 2).
item_rarity(astrolabe, rare).
item_category(astrolabe, science).
item_tradeable(astrolabe).
item_possessable(astrolabe).
item_tag(astrolabe, science).
item_tag(astrolabe, navigation).

%% Printed Book
item(printed_book, 'Printed Book', tool).
item_description(printed_book, 'A volume from the new movable-type press, spreading knowledge beyond monastery walls.').
item_value(printed_book, 30).
item_sell_value(printed_book, 15).
item_weight(printed_book, 1).
item_rarity(printed_book, uncommon).
item_category(printed_book, education).
item_tradeable(printed_book).
item_possessable(printed_book).
item_tag(printed_book, education).
item_tag(printed_book, innovation).

%% Compass
item(mariners_compass, 'Compass', tool).
item_description(mariners_compass, 'A magnetic compass housed in a brass casing, indispensable for sea voyages.').
item_value(mariners_compass, 80).
item_sell_value(mariners_compass, 45).
item_weight(mariners_compass, 0.5).
item_rarity(mariners_compass, uncommon).
item_category(mariners_compass, navigation).
item_tradeable(mariners_compass).
item_possessable(mariners_compass).
item_tag(mariners_compass, navigation).
item_tag(mariners_compass, exploration).

%% Lapis Lazuli Pigment
item(lapis_lazuli_pigment, 'Lapis Lazuli Pigment', material).
item_description(lapis_lazuli_pigment, 'Ultramarine blue ground from Afghan lapis lazuli, the most precious pigment in a painter''s palette.').
item_value(lapis_lazuli_pigment, 100).
item_sell_value(lapis_lazuli_pigment, 60).
item_weight(lapis_lazuli_pigment, 0.3).
item_rarity(lapis_lazuli_pigment, rare).
item_category(lapis_lazuli_pigment, art).
item_stackable(lapis_lazuli_pigment).
item_tradeable(lapis_lazuli_pigment).
item_possessable(lapis_lazuli_pigment).
item_tag(lapis_lazuli_pigment, art).
item_tag(lapis_lazuli_pigment, luxury).

%% Silk Bolt
item(silk_bolt, 'Silk Bolt', material).
item_description(silk_bolt, 'A bolt of fine silk imported from the East, prized for garments and embroidery.').
item_value(silk_bolt, 60).
item_sell_value(silk_bolt, 35).
item_weight(silk_bolt, 3).
item_rarity(silk_bolt, uncommon).
item_category(silk_bolt, textile).
item_stackable(silk_bolt).
item_tradeable(silk_bolt).
item_possessable(silk_bolt).
item_tag(silk_bolt, textile).
item_tag(silk_bolt, trade).

%% Gold Florin
item(gold_florin, 'Gold Florin', currency).
item_description(gold_florin, 'The standard gold coin of Fiorenza, accepted across all Italian city-states and beyond.').
item_value(gold_florin, 1).
item_sell_value(gold_florin, 1).
item_weight(gold_florin, 0.01).
item_rarity(gold_florin, common).
item_category(gold_florin, currency).
item_stackable(gold_florin).
item_tradeable(gold_florin).
item_possessable(gold_florin).
item_tag(gold_florin, currency).
item_tag(gold_florin, trade).

%% Marble Block
item(marble_block, 'Marble Block', material).
item_description(marble_block, 'A block of white Carrara marble, the sculptor''s finest medium.').
item_value(marble_block, 40).
item_sell_value(marble_block, 20).
item_weight(marble_block, 50).
item_rarity(marble_block, uncommon).
item_category(marble_block, art).
item_tradeable(marble_block).
item_possessable(marble_block).
item_tag(marble_block, art).
item_tag(marble_block, craft).

%% Quill Pen and Ink
item(quill_and_ink, 'Quill Pen and Ink', tool).
item_description(quill_and_ink, 'A goose-feather quill with a pot of iron-gall ink, used for writing and correspondence.').
item_value(quill_and_ink, 5).
item_sell_value(quill_and_ink, 2).
item_weight(quill_and_ink, 0.2).
item_rarity(quill_and_ink, common).
item_category(quill_and_ink, writing).
item_tradeable(quill_and_ink).
item_possessable(quill_and_ink).
item_tag(quill_and_ink, writing).
item_tag(quill_and_ink, education).

%% Venetian Glass Goblet
item(venetian_glass_goblet, 'Venetian Glass Goblet', material).
item_description(venetian_glass_goblet, 'A delicate crystal goblet blown by the master glassmakers, prized at noble tables.').
item_value(venetian_glass_goblet, 50).
item_sell_value(venetian_glass_goblet, 30).
item_weight(venetian_glass_goblet, 0.3).
item_rarity(venetian_glass_goblet, rare).
item_category(venetian_glass_goblet, decorative).
item_tradeable(venetian_glass_goblet).
item_possessable(venetian_glass_goblet).
item_tag(venetian_glass_goblet, luxury).
item_tag(venetian_glass_goblet, craft).

%% Spice Pouch (Pepper and Cinnamon)
item(spice_pouch, 'Spice Pouch', consumable).
item_description(spice_pouch, 'A leather pouch of pepper, cinnamon, and cloves imported along the Levantine trade routes.').
item_value(spice_pouch, 25).
item_sell_value(spice_pouch, 15).
item_weight(spice_pouch, 0.3).
item_rarity(spice_pouch, uncommon).
item_category(spice_pouch, food_drink).
item_stackable(spice_pouch).
item_tradeable(spice_pouch).
item_possessable(spice_pouch).
item_tag(spice_pouch, trade).
item_tag(spice_pouch, luxury).

%% Codex of Cicero
item(codex_cicero, 'Codex of Cicero', tool).
item_description(codex_cicero, 'A manuscript copy of Cicero''s orations, recovered from a monastic library and treasured by humanists.').
item_value(codex_cicero, 120).
item_sell_value(codex_cicero, 70).
item_weight(codex_cicero, 2).
item_rarity(codex_cicero, rare).
item_category(codex_cicero, education).
item_tradeable(codex_cicero).
item_possessable(codex_cicero).
item_tag(codex_cicero, education).
item_tag(codex_cicero, humanism).

%% Herbal Medicine
item(herbal_remedy, 'Herbal Remedy', consumable).
item_description(herbal_remedy, 'A tincture prepared by an apothecary from local herbs, used to treat common ailments.').
item_value(herbal_remedy, 8).
item_sell_value(herbal_remedy, 4).
item_weight(herbal_remedy, 0.3).
item_rarity(herbal_remedy, common).
item_category(herbal_remedy, health).
item_stackable(herbal_remedy).
item_tradeable(herbal_remedy).
item_possessable(herbal_remedy).
item_tag(herbal_remedy, health).
item_tag(herbal_remedy, craft).

%% Map of Trade Routes
item(trade_route_map, 'Map of Trade Routes', tool).
item_description(trade_route_map, 'A hand-drawn map on vellum showing overland and maritime trade routes to the Levant and beyond.').
item_value(trade_route_map, 60).
item_sell_value(trade_route_map, 35).
item_weight(trade_route_map, 0.5).
item_rarity(trade_route_map, uncommon).
item_category(trade_route_map, navigation).
item_tradeable(trade_route_map).
item_possessable(trade_route_map).
item_tag(trade_route_map, navigation).
item_tag(trade_route_map, trade).

%% Fresco Plaster (Intonaco)
item(intonaco, 'Intonaco (Fresco Plaster)', material).
item_description(intonaco, 'Freshly mixed lime plaster applied wet to walls as the base for fresco painting.').
item_value(intonaco, 5).
item_sell_value(intonaco, 2).
item_weight(intonaco, 10).
item_rarity(intonaco, common).
item_category(intonaco, art).
item_stackable(intonaco).
item_tradeable(intonaco).
item_possessable(intonaco).
item_tag(intonaco, art).
item_tag(intonaco, craft).

%% Letter of Credit
item(letter_of_credit, 'Letter of Credit', tool).
item_description(letter_of_credit, 'A sealed document from the banking house, allowing the bearer to draw funds at a distant branch.').
item_value(letter_of_credit, 500).
item_sell_value(letter_of_credit, 0).
item_weight(letter_of_credit, 0.05).
item_rarity(letter_of_credit, rare).
item_category(letter_of_credit, commerce).
item_tradeable(letter_of_credit).
item_possessable(letter_of_credit).
item_tag(letter_of_credit, commerce).
item_tag(letter_of_credit, banking).

%% Jeweled Dagger
item(jeweled_dagger, 'Jeweled Dagger', equipment).
item_description(jeweled_dagger, 'A short blade with a gem-encrusted hilt, carried by nobles as both weapon and status symbol.').
item_value(jeweled_dagger, 90).
item_sell_value(jeweled_dagger, 55).
item_weight(jeweled_dagger, 0.8).
item_rarity(jeweled_dagger, rare).
item_category(jeweled_dagger, weapon).
item_tradeable(jeweled_dagger).
item_possessable(jeweled_dagger).
item_tag(jeweled_dagger, weapon).
item_tag(jeweled_dagger, luxury).

%% Wine Flask (Chianti)
item(chianti_flask, 'Chianti Wine Flask', consumable).
item_description(chianti_flask, 'A straw-wrapped flask of red wine from the Tuscan hills, shared at every tavern table.').
item_value(chianti_flask, 3).
item_sell_value(chianti_flask, 1).
item_weight(chianti_flask, 1.5).
item_rarity(chianti_flask, common).
item_category(chianti_flask, food_drink).
item_stackable(chianti_flask).
item_tradeable(chianti_flask).
item_possessable(chianti_flask).
item_tag(chianti_flask, food).
item_tag(chianti_flask, social).

%% Perspective Drawing Manual
item(perspective_manual, 'Perspective Drawing Manual', tool).
item_description(perspective_manual, 'A treatise on linear perspective with geometric diagrams, explaining the new science of realistic depth in painting.').
item_value(perspective_manual, 45).
item_sell_value(perspective_manual, 25).
item_weight(perspective_manual, 1).
item_rarity(perspective_manual, uncommon).
item_category(perspective_manual, education).
item_tradeable(perspective_manual).
item_possessable(perspective_manual).
item_tag(perspective_manual, education).
item_tag(perspective_manual, art).

%% Bronze Medallion
item(bronze_medallion, 'Bronze Medallion', accessory).
item_description(bronze_medallion, 'A portrait medallion cast in bronze, commemorating a patron or condottiere.').
item_value(bronze_medallion, 35).
item_sell_value(bronze_medallion, 20).
item_weight(bronze_medallion, 0.4).
item_rarity(bronze_medallion, uncommon).
item_category(bronze_medallion, art).
item_tradeable(bronze_medallion).
item_possessable(bronze_medallion).
item_tag(bronze_medallion, art).
item_tag(bronze_medallion, cultural).
