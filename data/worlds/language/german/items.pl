%% Insimul Items: German Rhineland
%% Source: data/worlds/language/german/items.pl
%% Created: 2026-04-03
%% Total: 22 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Broetchen (Bread Roll)
item(broetchen, 'Broetchen', consumable).
item_description(broetchen, 'A fresh, crusty bread roll -- a staple of every German breakfast.').
item_value(broetchen, 1).
item_sell_value(broetchen, 0).
item_weight(broetchen, 0.1).
item_rarity(broetchen, common).
item_category(broetchen, food_drink).
item_stackable(broetchen).
item_tradeable(broetchen).
item_possessable(broetchen).
item_tag(broetchen, food).
item_tag(broetchen, cultural).

%% Brezel (Pretzel)
item(brezel, 'Brezel', consumable).
item_description(brezel, 'A traditional salted pretzel, golden-brown and warm from the bakery.').
item_value(brezel, 2).
item_sell_value(brezel, 1).
item_weight(brezel, 0.2).
item_rarity(brezel, common).
item_category(brezel, food_drink).
item_stackable(brezel).
item_tradeable(brezel).
item_possessable(brezel).
item_tag(brezel, food).
item_tag(brezel, cultural).

%% Riesling Wine
item(riesling, 'Riesling', consumable).
item_description(riesling, 'A bottle of local Rhineland Riesling, crisp and fruity with mineral notes.').
item_value(riesling, 12).
item_sell_value(riesling, 7).
item_weight(riesling, 1.5).
item_rarity(riesling, common).
item_category(riesling, food_drink).
item_tradeable(riesling).
item_possessable(riesling).
item_tag(riesling, beverage).
item_tag(riesling, cultural).

%% Smartphone
item(smartphone_de, 'Smartphone', tool).
item_description(smartphone_de, 'A modern smartphone with German keyboard and language-learning apps installed.').
item_value(smartphone_de, 200).
item_sell_value(smartphone_de, 100).
item_weight(smartphone_de, 0.3).
item_rarity(smartphone_de, common).
item_category(smartphone_de, technology).
item_tradeable(smartphone_de).
item_possessable(smartphone_de).
item_tag(smartphone_de, technology).
item_tag(smartphone_de, communication).

%% German Textbook
item(german_textbook, 'Deutschbuch', tool).
item_description(german_textbook, 'A modern German-as-a-foreign-language textbook covering grammar, vocabulary, and reading exercises.').
item_value(german_textbook, 25).
item_sell_value(german_textbook, 10).
item_weight(german_textbook, 1).
item_rarity(german_textbook, common).
item_category(german_textbook, education).
item_tradeable(german_textbook).
item_possessable(german_textbook).
item_tag(german_textbook, education).
item_tag(german_textbook, language).

%% Train Ticket (Fahrkarte)
item(fahrkarte, 'Fahrkarte', consumable).
item_description(fahrkarte, 'A Deutsche Bahn regional train ticket for traveling between Rheinhausen and Weinfeld.').
item_value(fahrkarte, 5).
item_sell_value(fahrkarte, 0).
item_weight(fahrkarte, 0).
item_rarity(fahrkarte, common).
item_category(fahrkarte, transport).
item_stackable(fahrkarte).
item_tradeable(fahrkarte).
item_possessable(fahrkarte).
item_tag(fahrkarte, transport).

%% Bratwurst
item(bratwurst, 'Bratwurst', consumable).
item_description(bratwurst, 'A grilled pork sausage served with mustard and a Broetchen.').
item_value(bratwurst, 4).
item_sell_value(bratwurst, 2).
item_weight(bratwurst, 0.3).
item_rarity(bratwurst, common).
item_category(bratwurst, food_drink).
item_stackable(bratwurst).
item_tradeable(bratwurst).
item_possessable(bratwurst).
item_tag(bratwurst, food).
item_tag(bratwurst, cultural).

%% Doener Kebab
item(doener_kebab, 'Doener Kebab', consumable).
item_description(doener_kebab, 'A Doener Kebab in flatbread with salad, onions, and garlic sauce -- a German street food staple.').
item_value(doener_kebab, 5).
item_sell_value(doener_kebab, 2).
item_weight(doener_kebab, 0.4).
item_rarity(doener_kebab, common).
item_category(doener_kebab, food_drink).
item_stackable(doener_kebab).
item_tradeable(doener_kebab).
item_possessable(doener_kebab).
item_tag(doener_kebab, food).

%% Apfelstrudel
item(apfelstrudel, 'Apfelstrudel', consumable).
item_description(apfelstrudel, 'Warm apple strudel with cinnamon, raisins, and a dusting of powdered sugar.').
item_value(apfelstrudel, 4).
item_sell_value(apfelstrudel, 2).
item_weight(apfelstrudel, 0.3).
item_rarity(apfelstrudel, common).
item_category(apfelstrudel, food_drink).
item_stackable(apfelstrudel).
item_tradeable(apfelstrudel).
item_possessable(apfelstrudel).
item_tag(apfelstrudel, food).
item_tag(apfelstrudel, cultural).

%% German-English Dictionary
item(german_dictionary, 'Deutsch-Englisch Woerterbuch', tool).
item_description(german_dictionary, 'A compact pocket dictionary for quick word lookups between German and English.').
item_value(german_dictionary, 15).
item_sell_value(german_dictionary, 7).
item_weight(german_dictionary, 0.6).
item_rarity(german_dictionary, common).
item_category(german_dictionary, education).
item_tradeable(german_dictionary).
item_possessable(german_dictionary).
item_tag(german_dictionary, education).
item_tag(german_dictionary, language).

%% Notebook
item(notebook_de, 'Notizbuch', tool).
item_description(notebook_de, 'A lined notebook for practicing German handwriting and taking notes.').
item_value(notebook_de, 3).
item_sell_value(notebook_de, 1).
item_weight(notebook_de, 0.3).
item_rarity(notebook_de, common).
item_category(notebook_de, education).
item_stackable(notebook_de).
item_tradeable(notebook_de).
item_possessable(notebook_de).
item_tag(notebook_de, education).
item_tag(notebook_de, writing).

%% Bierkrug (Beer Stein)
item(bierkrug, 'Bierkrug', accessory).
item_description(bierkrug, 'A traditional ceramic beer stein with a pewter lid, decorated with Rhineland motifs.').
item_value(bierkrug, 18).
item_sell_value(bierkrug, 10).
item_weight(bierkrug, 1).
item_rarity(bierkrug, uncommon).
item_category(bierkrug, decorative).
item_tradeable(bierkrug).
item_possessable(bierkrug).
item_tag(bierkrug, cultural).
item_tag(bierkrug, craft).

%% Wanderkarte (Hiking Map)
item(wanderkarte, 'Wanderkarte', tool).
item_description(wanderkarte, 'A detailed hiking map of the Rhineland vineyards and river paths.').
item_value(wanderkarte, 8).
item_sell_value(wanderkarte, 4).
item_weight(wanderkarte, 0.1).
item_rarity(wanderkarte, common).
item_category(wanderkarte, tool).
item_tradeable(wanderkarte).
item_possessable(wanderkarte).
item_tag(wanderkarte, outdoors).
item_tag(wanderkarte, navigation).

%% Regenschirm (Umbrella)
item(regenschirm, 'Regenschirm', equipment).
item_description(regenschirm, 'A sturdy umbrella -- essential for the unpredictable Rhineland weather.').
item_value(regenschirm, 10).
item_sell_value(regenschirm, 5).
item_weight(regenschirm, 0.5).
item_rarity(regenschirm, common).
item_category(regenschirm, accessory).
item_tradeable(regenschirm).
item_possessable(regenschirm).
item_tag(regenschirm, weather).
item_tag(regenschirm, practical).

%% Kuckucksuhr (Cuckoo Clock)
item(kuckucksuhr, 'Kuckucksuhr', accessory).
item_description(kuckucksuhr, 'A hand-carved wooden cuckoo clock, a classic German souvenir.').
item_value(kuckucksuhr, 80).
item_sell_value(kuckucksuhr, 50).
item_weight(kuckucksuhr, 3).
item_rarity(kuckucksuhr, rare).
item_category(kuckucksuhr, decorative).
item_tradeable(kuckucksuhr).
item_possessable(kuckucksuhr).
item_tag(kuckucksuhr, craft).
item_tag(kuckucksuhr, cultural).

%% Lebkuchen (Gingerbread)
item(lebkuchen, 'Lebkuchen', consumable).
item_description(lebkuchen, 'Traditional German gingerbread spiced with cinnamon, cloves, and nutmeg.').
item_value(lebkuchen, 3).
item_sell_value(lebkuchen, 1).
item_weight(lebkuchen, 0.2).
item_rarity(lebkuchen, common).
item_category(lebkuchen, food_drink).
item_stackable(lebkuchen).
item_tradeable(lebkuchen).
item_possessable(lebkuchen).
item_tag(lebkuchen, food).
item_tag(lebkuchen, cultural).

%% Spaetburgunder (Pinot Noir)
item(spaetburgunder, 'Spaetburgunder', consumable).
item_description(spaetburgunder, 'A bottle of local Rhineland Spaetburgunder red wine, smooth and earthy.').
item_value(spaetburgunder, 15).
item_sell_value(spaetburgunder, 9).
item_weight(spaetburgunder, 1.5).
item_rarity(spaetburgunder, uncommon).
item_category(spaetburgunder, food_drink).
item_tradeable(spaetburgunder).
item_possessable(spaetburgunder).
item_tag(spaetburgunder, beverage).
item_tag(spaetburgunder, cultural).

%% Schnitzel
item(schnitzel, 'Schnitzel', consumable).
item_description(schnitzel, 'A breaded and pan-fried cutlet served with lemon, Kartoffelsalat, and Preiselbeeren.').
item_value(schnitzel, 8).
item_sell_value(schnitzel, 4).
item_weight(schnitzel, 0.4).
item_rarity(schnitzel, common).
item_category(schnitzel, food_drink).
item_stackable(schnitzel).
item_tradeable(schnitzel).
item_possessable(schnitzel).
item_tag(schnitzel, food).
item_tag(schnitzel, cultural).

%% Brettspiel (Board Game)
item(brettspiel, 'Brettspiel', tool).
item_description(brettspiel, 'A classic German board game -- Germany is the world capital of modern board games.').
item_value(brettspiel, 25).
item_sell_value(brettspiel, 12).
item_weight(brettspiel, 1.5).
item_rarity(brettspiel, common).
item_category(brettspiel, entertainment).
item_tradeable(brettspiel).
item_possessable(brettspiel).
item_tag(brettspiel, social).
item_tag(brettspiel, cultural).

%% Sonnencreme (Sunscreen)
item(sonnencreme, 'Sonnencreme', consumable).
item_description(sonnencreme, 'Sun protection for summer days along the Rhine promenade.').
item_value(sonnencreme, 8).
item_sell_value(sonnencreme, 4).
item_weight(sonnencreme, 0.3).
item_rarity(sonnencreme, common).
item_category(sonnencreme, health).
item_stackable(sonnencreme).
item_tradeable(sonnencreme).
item_possessable(sonnencreme).
item_tag(sonnencreme, health).

%% Schwarzwaelder Kirschtorte (Black Forest Cake slice)
item(kirschtorte, 'Schwarzwaelder Kirschtorte', consumable).
item_description(kirschtorte, 'A slice of Black Forest cake with layers of chocolate sponge, cherries, and whipped cream.').
item_value(kirschtorte, 5).
item_sell_value(kirschtorte, 2).
item_weight(kirschtorte, 0.3).
item_rarity(kirschtorte, common).
item_category(kirschtorte, food_drink).
item_stackable(kirschtorte).
item_tradeable(kirschtorte).
item_possessable(kirschtorte).
item_tag(kirschtorte, food).
item_tag(kirschtorte, cultural).

%% Tageszeitung (Daily Newspaper)
item(tageszeitung, 'Tageszeitung', tool).
item_description(tageszeitung, 'A local daily newspaper -- excellent reading practice for intermediate German learners.').
item_value(tageszeitung, 2).
item_sell_value(tageszeitung, 0).
item_weight(tageszeitung, 0.2).
item_rarity(tageszeitung, common).
item_category(tageszeitung, education).
item_stackable(tageszeitung).
item_tradeable(tageszeitung).
item_possessable(tageszeitung).
item_tag(tageszeitung, reading).
item_tag(tageszeitung, language).
