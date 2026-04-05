%% Insimul Items: Spanish Castile
%% Source: data/worlds/language/spanish/items.pl
%% Created: 2026-04-03
%% Total: 22 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Aceite de Oliva (Olive Oil)
item(aceite_de_oliva, 'Aceite de Oliva', consumable).
item_description(aceite_de_oliva, 'Extra-virgin olive oil from the groves of Aldea de los Olivos, a staple of Spanish cuisine.').
item_value(aceite_de_oliva, 12).
item_sell_value(aceite_de_oliva, 7).
item_weight(aceite_de_oliva, 1).
item_rarity(aceite_de_oliva, common).
item_category(aceite_de_oliva, food_drink).
item_stackable(aceite_de_oliva).
item_tradeable(aceite_de_oliva).
item_possessable(aceite_de_oliva).
item_tag(aceite_de_oliva, food).
item_tag(aceite_de_oliva, cultural).

%% Sangria
item(sangria, 'Sangria', consumable).
item_description(sangria, 'A refreshing pitcher of sangria made with red wine, fruit, and a splash of brandy.').
item_value(sangria, 8).
item_sell_value(sangria, 4).
item_weight(sangria, 1.5).
item_rarity(sangria, common).
item_category(sangria, food_drink).
item_stackable(sangria).
item_tradeable(sangria).
item_possessable(sangria).
item_tag(sangria, beverage).
item_tag(sangria, cultural).

%% Churros con Chocolate
item(churros_con_chocolate, 'Churros con Chocolate', consumable).
item_description(churros_con_chocolate, 'Golden fried churros served with a cup of thick, rich hot chocolate for dipping.').
item_value(churros_con_chocolate, 4).
item_sell_value(churros_con_chocolate, 2).
item_weight(churros_con_chocolate, 0.4).
item_rarity(churros_con_chocolate, common).
item_category(churros_con_chocolate, food_drink).
item_stackable(churros_con_chocolate).
item_tradeable(churros_con_chocolate).
item_possessable(churros_con_chocolate).
item_tag(churros_con_chocolate, food).
item_tag(churros_con_chocolate, cultural).

%% Smartphone
item(smartphone_es, 'Smartphone', tool).
item_description(smartphone_es, 'A modern smartphone with a Spanish keyboard and language-learning apps installed.').
item_value(smartphone_es, 200).
item_sell_value(smartphone_es, 100).
item_weight(smartphone_es, 0.3).
item_rarity(smartphone_es, common).
item_category(smartphone_es, technology).
item_tradeable(smartphone_es).
item_possessable(smartphone_es).
item_tag(smartphone_es, technology).
item_tag(smartphone_es, communication).

%% Spanish Textbook
item(spanish_textbook, 'Spanish Textbook', tool).
item_description(spanish_textbook, 'A comprehensive Castilian Spanish textbook covering grammar, vocabulary, and exercises from A1 to B2.').
item_value(spanish_textbook, 25).
item_sell_value(spanish_textbook, 10).
item_weight(spanish_textbook, 1).
item_rarity(spanish_textbook, common).
item_category(spanish_textbook, education).
item_tradeable(spanish_textbook).
item_possessable(spanish_textbook).
item_tag(spanish_textbook, education).
item_tag(spanish_textbook, language).

%% Abanico (Hand Fan)
item(abanico, 'Abanico', accessory).
item_description(abanico, 'A traditional hand-painted Spanish folding fan, essential for surviving the Castilian summer heat.').
item_value(abanico, 10).
item_sell_value(abanico, 5).
item_weight(abanico, 0.1).
item_rarity(abanico, common).
item_category(abanico, accessory).
item_tradeable(abanico).
item_possessable(abanico).
item_tag(abanico, cultural).
item_tag(abanico, clothing).

%% Castanuelas (Castanets)
item(castanuelas, 'Castanuelas', tool).
item_description(castanuelas, 'A pair of wooden castanets used in flamenco and traditional Spanish folk dances.').
item_value(castanuelas, 15).
item_sell_value(castanuelas, 8).
item_weight(castanuelas, 0.2).
item_rarity(castanuelas, uncommon).
item_category(castanuelas, entertainment).
item_tradeable(castanuelas).
item_possessable(castanuelas).
item_tag(castanuelas, cultural).
item_tag(castanuelas, music).

%% Billete de Tren (Train Ticket)
item(billete_de_tren, 'Billete de Tren', consumable).
item_description(billete_de_tren, 'A Renfe train ticket for regional travel between Villa de San Martin and nearby cities.').
item_value(billete_de_tren, 5).
item_sell_value(billete_de_tren, 0).
item_weight(billete_de_tren, 0).
item_rarity(billete_de_tren, common).
item_category(billete_de_tren, transport).
item_stackable(billete_de_tren).
item_tradeable(billete_de_tren).
item_possessable(billete_de_tren).
item_tag(billete_de_tren, transport).

%% Jamon Iberico
item(jamon_iberico, 'Jamon Iberico', consumable).
item_description(jamon_iberico, 'A portion of dry-cured Iberian ham, considered the finest in Spain and a tapas essential.').
item_value(jamon_iberico, 20).
item_sell_value(jamon_iberico, 12).
item_weight(jamon_iberico, 0.5).
item_rarity(jamon_iberico, uncommon).
item_category(jamon_iberico, food_drink).
item_stackable(jamon_iberico).
item_tradeable(jamon_iberico).
item_possessable(jamon_iberico).
item_tag(jamon_iberico, food).
item_tag(jamon_iberico, luxury).

%% Tortilla Espanola
item(tortilla_espanola, 'Tortilla Espanola', consumable).
item_description(tortilla_espanola, 'A thick Spanish omelette made with eggs, potatoes, and onion -- the classic pincho de tortilla.').
item_value(tortilla_espanola, 4).
item_sell_value(tortilla_espanola, 2).
item_weight(tortilla_espanola, 0.5).
item_rarity(tortilla_espanola, common).
item_category(tortilla_espanola, food_drink).
item_stackable(tortilla_espanola).
item_tradeable(tortilla_espanola).
item_possessable(tortilla_espanola).
item_tag(tortilla_espanola, food).
item_tag(tortilla_espanola, cultural).

%% Botijo (Clay Water Jug)
item(botijo, 'Botijo', tool).
item_description(botijo, 'A traditional unglazed clay water jug that keeps water cool through evaporation, a Castilian classic.').
item_value(botijo, 8).
item_sell_value(botijo, 4).
item_weight(botijo, 1.5).
item_rarity(botijo, common).
item_category(botijo, decorative).
item_tradeable(botijo).
item_possessable(botijo).
item_tag(botijo, cultural).
item_tag(botijo, craft).

%% Spanish-English Dictionary
item(spanish_dictionary, 'Spanish-English Dictionary', tool).
item_description(spanish_dictionary, 'A compact pocket dictionary for quick word lookups between Spanish and English.').
item_value(spanish_dictionary, 15).
item_sell_value(spanish_dictionary, 7).
item_weight(spanish_dictionary, 0.6).
item_rarity(spanish_dictionary, common).
item_category(spanish_dictionary, education).
item_tradeable(spanish_dictionary).
item_possessable(spanish_dictionary).
item_tag(spanish_dictionary, education).
item_tag(spanish_dictionary, language).

%% Vino Tinto (Red Wine)
item(vino_tinto, 'Vino Tinto', consumable).
item_description(vino_tinto, 'A bottle of local Ribera del Duero red wine from Bodega Familiar Navarro.').
item_value(vino_tinto, 10).
item_sell_value(vino_tinto, 6).
item_weight(vino_tinto, 1.5).
item_rarity(vino_tinto, common).
item_category(vino_tinto, food_drink).
item_stackable(vino_tinto).
item_tradeable(vino_tinto).
item_possessable(vino_tinto).
item_tag(vino_tinto, beverage).
item_tag(vino_tinto, cultural).

%% Azulejo (Ceramic Tile)
item(azulejo, 'Azulejo', material).
item_description(azulejo, 'A hand-painted ceramic tile with traditional Spanish geometric and floral patterns.').
item_value(azulejo, 18).
item_sell_value(azulejo, 10).
item_weight(azulejo, 1).
item_rarity(azulejo, uncommon).
item_category(azulejo, decorative).
item_tradeable(azulejo).
item_possessable(azulejo).
item_tag(azulejo, craft).
item_tag(azulejo, cultural).

%% Notebook
item(notebook_es, 'Notebook', tool).
item_description(notebook_es, 'A lined notebook for practicing Spanish handwriting, conjugation tables, and vocabulary lists.').
item_value(notebook_es, 3).
item_sell_value(notebook_es, 1).
item_weight(notebook_es, 0.3).
item_rarity(notebook_es, common).
item_category(notebook_es, education).
item_stackable(notebook_es).
item_tradeable(notebook_es).
item_possessable(notebook_es).
item_tag(notebook_es, education).
item_tag(notebook_es, writing).

%% Abono de Metro (Metro Pass)
item(abono_metro, 'Abono de Metro', consumable).
item_description(abono_metro, 'A monthly metro pass for public transport, useful when visiting larger cities nearby.').
item_value(abono_metro, 20).
item_sell_value(abono_metro, 0).
item_weight(abono_metro, 0).
item_rarity(abono_metro, common).
item_category(abono_metro, transport).
item_stackable(abono_metro).
item_tradeable(abono_metro).
item_possessable(abono_metro).
item_tag(abono_metro, transport).

%% Patatas Bravas
item(patatas_bravas, 'Patatas Bravas', consumable).
item_description(patatas_bravas, 'Crispy fried potato cubes topped with spicy brava sauce and alioli, the quintessential tapa.').
item_value(patatas_bravas, 3).
item_sell_value(patatas_bravas, 1).
item_weight(patatas_bravas, 0.4).
item_rarity(patatas_bravas, common).
item_category(patatas_bravas, food_drink).
item_stackable(patatas_bravas).
item_tradeable(patatas_bravas).
item_possessable(patatas_bravas).
item_tag(patatas_bravas, food).
item_tag(patatas_bravas, cultural).

%% Mantilla (Lace Shawl)
item(mantilla, 'Mantilla', equipment).
item_description(mantilla, 'A delicate lace mantilla traditionally worn during festivals and religious ceremonies.').
item_value(mantilla, 30).
item_sell_value(mantilla, 18).
item_weight(mantilla, 0.2).
item_rarity(mantilla, uncommon).
item_category(mantilla, clothing).
item_tradeable(mantilla).
item_possessable(mantilla).
item_tag(mantilla, clothing).
item_tag(mantilla, cultural).

%% Sunscreen
item(sunscreen_es, 'Sunscreen', consumable).
item_description(sunscreen_es, 'Essential sun protection for the intense Castilian sun and dry meseta climate.').
item_value(sunscreen_es, 8).
item_sell_value(sunscreen_es, 4).
item_weight(sunscreen_es, 0.3).
item_rarity(sunscreen_es, common).
item_category(sunscreen_es, health).
item_stackable(sunscreen_es).
item_tradeable(sunscreen_es).
item_possessable(sunscreen_es).
item_tag(sunscreen_es, health).

%% Aceitunas (Olives)
item(aceitunas, 'Aceitunas', consumable).
item_description(aceitunas, 'A bowl of marinated Spanish olives, a ubiquitous free tapa served at every bar.').
item_value(aceitunas, 2).
item_sell_value(aceitunas, 1).
item_weight(aceitunas, 0.3).
item_rarity(aceitunas, common).
item_category(aceitunas, food_drink).
item_stackable(aceitunas).
item_tradeable(aceitunas).
item_possessable(aceitunas).
item_tag(aceitunas, food).
item_tag(aceitunas, cultural).

%% Baraja Espanola (Spanish Playing Cards)
item(baraja_espanola, 'Baraja Espanola', tool).
item_description(baraja_espanola, 'A deck of traditional Spanish playing cards with oros, copas, espadas, and bastos suits, used for mus and other games.').
item_value(baraja_espanola, 5).
item_sell_value(baraja_espanola, 2).
item_weight(baraja_espanola, 0.2).
item_rarity(baraja_espanola, common).
item_category(baraja_espanola, entertainment).
item_tradeable(baraja_espanola).
item_possessable(baraja_espanola).
item_tag(baraja_espanola, social).
item_tag(baraja_espanola, cultural).

%% Queso Manchego
item(queso_manchego, 'Queso Manchego', consumable).
item_description(queso_manchego, 'A wedge of aged Manchego cheese made from sheep milk, one of the most famous Spanish cheeses.').
item_value(queso_manchego, 10).
item_sell_value(queso_manchego, 6).
item_weight(queso_manchego, 0.5).
item_rarity(queso_manchego, common).
item_category(queso_manchego, food_drink).
item_stackable(queso_manchego).
item_tradeable(queso_manchego).
item_possessable(queso_manchego).
item_tag(queso_manchego, food).
item_tag(queso_manchego, cultural).
