%% Insimul Items: Italian Tuscany
%% Source: data/worlds/language/italian/items.pl
%% Created: 2026-04-03
%% Total: 22 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Espresso
item(espresso_it, 'Espresso', consumable).
item_description(espresso_it, 'A perfectly pulled espresso in a small ceramic cup, the backbone of Italian daily life.').
item_value(espresso_it, 2).
item_sell_value(espresso_it, 1).
item_weight(espresso_it, 0.1).
item_rarity(espresso_it, common).
item_category(espresso_it, food_drink).
item_stackable(espresso_it).
item_tradeable(espresso_it).
item_possessable(espresso_it).
item_tag(espresso_it, beverage).
item_tag(espresso_it, cultural).

%% Olive Oil (Olio Extravergine)
item(olive_oil_it, 'Olio Extravergine', consumable).
item_description(olive_oil_it, 'Cold-pressed extra virgin olive oil from San Vito groves, golden-green with a peppery finish.').
item_value(olive_oil_it, 15).
item_sell_value(olive_oil_it, 8).
item_weight(olive_oil_it, 1).
item_rarity(olive_oil_it, common).
item_category(olive_oil_it, food_drink).
item_stackable(olive_oil_it).
item_tradeable(olive_oil_it).
item_possessable(olive_oil_it).
item_tag(olive_oil_it, food).
item_tag(olive_oil_it, cooking).

%% Gelato
item(gelato_it, 'Gelato', consumable).
item_description(gelato_it, 'Artisanal Italian gelato in a waffle cone, creamier and denser than ordinary ice cream.').
item_value(gelato_it, 4).
item_sell_value(gelato_it, 2).
item_weight(gelato_it, 0.3).
item_rarity(gelato_it, common).
item_category(gelato_it, food_drink).
item_stackable(gelato_it).
item_tradeable(gelato_it).
item_possessable(gelato_it).
item_tag(gelato_it, food).
item_tag(gelato_it, cultural).

%% Smartphone
item(smartphone_it, 'Smartphone', tool).
item_description(smartphone_it, 'A modern smartphone with Italian keyboard and language-learning apps installed.').
item_value(smartphone_it, 200).
item_sell_value(smartphone_it, 100).
item_weight(smartphone_it, 0.3).
item_rarity(smartphone_it, common).
item_category(smartphone_it, technology).
item_tradeable(smartphone_it).
item_possessable(smartphone_it).
item_tag(smartphone_it, technology).
item_tag(smartphone_it, communication).

%% Italian Textbook
item(italian_textbook, 'Italian Textbook', tool).
item_description(italian_textbook, 'A modern Italian language textbook covering grammar, vocabulary, and reading exercises for all CEFR levels.').
item_value(italian_textbook, 25).
item_sell_value(italian_textbook, 10).
item_weight(italian_textbook, 1).
item_rarity(italian_textbook, common).
item_category(italian_textbook, education).
item_tradeable(italian_textbook).
item_possessable(italian_textbook).
item_tag(italian_textbook, education).
item_tag(italian_textbook, language).

%% Focaccia
item(focaccia_it, 'Focaccia', consumable).
item_description(focaccia_it, 'Warm focaccia bread drizzled with olive oil, rosemary, and coarse salt from the panificio.').
item_value(focaccia_it, 3).
item_sell_value(focaccia_it, 1).
item_weight(focaccia_it, 0.4).
item_rarity(focaccia_it, common).
item_category(focaccia_it, food_drink).
item_stackable(focaccia_it).
item_tradeable(focaccia_it).
item_possessable(focaccia_it).
item_tag(focaccia_it, food).
item_tag(focaccia_it, cultural).

%% Train Ticket (Biglietto del Treno)
item(train_ticket_it, 'Biglietto del Treno', consumable).
item_description(train_ticket_it, 'A regional train ticket for traveling between Collina Dorata and nearby cities.').
item_value(train_ticket_it, 5).
item_sell_value(train_ticket_it, 0).
item_weight(train_ticket_it, 0).
item_rarity(train_ticket_it, common).
item_category(train_ticket_it, transport).
item_stackable(train_ticket_it).
item_tradeable(train_ticket_it).
item_possessable(train_ticket_it).
item_tag(train_ticket_it, transport).

%% Chianti Wine
item(chianti_wine, 'Chianti Classico', consumable).
item_description(chianti_wine, 'A bottle of Chianti Classico DOCG from Cantina Brunelli, ruby red with notes of cherry and violet.').
item_value(chianti_wine, 18).
item_sell_value(chianti_wine, 10).
item_weight(chianti_wine, 1.5).
item_rarity(chianti_wine, uncommon).
item_category(chianti_wine, food_drink).
item_tradeable(chianti_wine).
item_possessable(chianti_wine).
item_tag(chianti_wine, beverage).
item_tag(chianti_wine, cultural).

%% Pecorino Cheese
item(pecorino_it, 'Pecorino Toscano', consumable).
item_description(pecorino_it, 'Aged pecorino cheese made from Tuscan sheep milk, firm with a nutty flavor.').
item_value(pecorino_it, 12).
item_sell_value(pecorino_it, 6).
item_weight(pecorino_it, 0.5).
item_rarity(pecorino_it, common).
item_category(pecorino_it, food_drink).
item_stackable(pecorino_it).
item_tradeable(pecorino_it).
item_possessable(pecorino_it).
item_tag(pecorino_it, food).
item_tag(pecorino_it, cultural).

%% Tuscan Ceramic Plate
item(ceramic_plate_it, 'Piatto di Ceramica', material).
item_description(ceramic_plate_it, 'A hand-painted Tuscan ceramic plate with sunflower and grape motifs.').
item_value(ceramic_plate_it, 20).
item_sell_value(ceramic_plate_it, 12).
item_weight(ceramic_plate_it, 1).
item_rarity(ceramic_plate_it, uncommon).
item_category(ceramic_plate_it, decorative).
item_tradeable(ceramic_plate_it).
item_possessable(ceramic_plate_it).
item_tag(ceramic_plate_it, craft).
item_tag(ceramic_plate_it, cultural).

%% Leather Journal
item(leather_journal_it, 'Diario di Pelle', tool).
item_description(leather_journal_it, 'A hand-stitched Tuscan leather journal, perfect for writing practice and travel notes.').
item_value(leather_journal_it, 15).
item_sell_value(leather_journal_it, 8).
item_weight(leather_journal_it, 0.4).
item_rarity(leather_journal_it, uncommon).
item_category(leather_journal_it, education).
item_tradeable(leather_journal_it).
item_possessable(leather_journal_it).
item_tag(leather_journal_it, craft).
item_tag(leather_journal_it, writing).

%% Italian-English Dictionary
item(italian_dictionary, 'Dizionario Italiano-Inglese', tool).
item_description(italian_dictionary, 'A compact pocket dictionary for quick word lookups between Italian and English.').
item_value(italian_dictionary, 15).
item_sell_value(italian_dictionary, 7).
item_weight(italian_dictionary, 0.6).
item_rarity(italian_dictionary, common).
item_category(italian_dictionary, education).
item_tradeable(italian_dictionary).
item_possessable(italian_dictionary).
item_tag(italian_dictionary, education).
item_tag(italian_dictionary, language).

%% Prosciutto
item(prosciutto_it, 'Prosciutto Toscano', consumable).
item_description(prosciutto_it, 'Dry-cured Tuscan ham, thinly sliced, with a delicate salty flavor.').
item_value(prosciutto_it, 10).
item_sell_value(prosciutto_it, 5).
item_weight(prosciutto_it, 0.3).
item_rarity(prosciutto_it, common).
item_category(prosciutto_it, food_drink).
item_stackable(prosciutto_it).
item_tradeable(prosciutto_it).
item_possessable(prosciutto_it).
item_tag(prosciutto_it, food).
item_tag(prosciutto_it, cultural).

%% Sunscreen
item(sunscreen_it, 'Crema Solare', consumable).
item_description(sunscreen_it, 'Essential sun protection for the Tuscan summer.').
item_value(sunscreen_it, 8).
item_sell_value(sunscreen_it, 4).
item_weight(sunscreen_it, 0.3).
item_rarity(sunscreen_it, common).
item_category(sunscreen_it, health).
item_stackable(sunscreen_it).
item_tradeable(sunscreen_it).
item_possessable(sunscreen_it).
item_tag(sunscreen_it, health).

%% Notebook
item(notebook_it, 'Quaderno', tool).
item_description(notebook_it, 'A lined notebook for practicing Italian handwriting and grammar exercises.').
item_value(notebook_it, 3).
item_sell_value(notebook_it, 1).
item_weight(notebook_it, 0.3).
item_rarity(notebook_it, common).
item_category(notebook_it, education).
item_stackable(notebook_it).
item_tradeable(notebook_it).
item_possessable(notebook_it).
item_tag(notebook_it, education).
item_tag(notebook_it, writing).

%% Biscotti
item(biscotti_it, 'Biscotti di Prato', consumable).
item_description(biscotti_it, 'Traditional almond biscotti from Prato, twice-baked and perfect for dipping in Vin Santo.').
item_value(biscotti_it, 5).
item_sell_value(biscotti_it, 3).
item_weight(biscotti_it, 0.3).
item_rarity(biscotti_it, common).
item_category(biscotti_it, food_drink).
item_stackable(biscotti_it).
item_tradeable(biscotti_it).
item_possessable(biscotti_it).
item_tag(biscotti_it, food).
item_tag(biscotti_it, cultural).

%% Briscola Cards
item(briscola_cards, 'Carte da Briscola', tool).
item_description(briscola_cards, 'A traditional Italian playing card deck for briscola and scopa, popular bar pastimes.').
item_value(briscola_cards, 8).
item_sell_value(briscola_cards, 4).
item_weight(briscola_cards, 0.2).
item_rarity(briscola_cards, common).
item_category(briscola_cards, entertainment).
item_tradeable(briscola_cards).
item_possessable(briscola_cards).
item_tag(briscola_cards, social).
item_tag(briscola_cards, cultural).

%% Gold Necklace
item(gold_necklace_it, 'Collana d''Oro', accessory).
item_description(gold_necklace_it, 'A delicate gold necklace crafted by a local Tuscan jeweler.').
item_value(gold_necklace_it, 150).
item_sell_value(gold_necklace_it, 100).
item_weight(gold_necklace_it, 0.1).
item_rarity(gold_necklace_it, rare).
item_category(gold_necklace_it, accessory).
item_tradeable(gold_necklace_it).
item_possessable(gold_necklace_it).
item_tag(gold_necklace_it, luxury).
item_tag(gold_necklace_it, cultural).

%% Pane Toscano (Unsalted Tuscan Bread)
item(pane_toscano, 'Pane Toscano', consumable).
item_description(pane_toscano, 'Traditional unsalted Tuscan bread, a regional staple that pairs perfectly with salty cured meats and cheese.').
item_value(pane_toscano, 2).
item_sell_value(pane_toscano, 1).
item_weight(pane_toscano, 0.5).
item_rarity(pane_toscano, common).
item_category(pane_toscano, food_drink).
item_stackable(pane_toscano).
item_tradeable(pane_toscano).
item_possessable(pane_toscano).
item_tag(pane_toscano, food).
item_tag(pane_toscano, cultural).

%% Moka Pot
item(moka_pot, 'Moka Bialetti', tool).
item_description(moka_pot, 'An iconic Bialetti moka pot for making stovetop espresso, found in every Italian household.').
item_value(moka_pot, 20).
item_sell_value(moka_pot, 10).
item_weight(moka_pot, 0.5).
item_rarity(moka_pot, common).
item_category(moka_pot, household).
item_tradeable(moka_pot).
item_possessable(moka_pot).
item_tag(moka_pot, cultural).
item_tag(moka_pot, cooking).

%% Straw Hat (Cappello di Paglia)
item(straw_hat_it, 'Cappello di Paglia', equipment).
item_description(straw_hat_it, 'A classic Florentine straw hat for shade during the Tuscan summer.').
item_value(straw_hat_it, 12).
item_sell_value(straw_hat_it, 6).
item_weight(straw_hat_it, 0.2).
item_rarity(straw_hat_it, common).
item_category(straw_hat_it, clothing).
item_tradeable(straw_hat_it).
item_possessable(straw_hat_it).
item_tag(straw_hat_it, clothing).
item_tag(straw_hat_it, cultural).

%% Ribollita Soup
item(ribollita_it, 'Ribollita', consumable).
item_description(ribollita_it, 'A hearty Tuscan bread soup with cannellini beans, cavolo nero, and vegetables, reboiled and thickened.').
item_value(ribollita_it, 6).
item_sell_value(ribollita_it, 3).
item_weight(ribollita_it, 0.5).
item_rarity(ribollita_it, common).
item_category(ribollita_it, food_drink).
item_stackable(ribollita_it).
item_tradeable(ribollita_it).
item_possessable(ribollita_it).
item_tag(ribollita_it, food).
item_tag(ribollita_it, cultural).
