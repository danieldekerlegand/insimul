%% Insimul Items: Russian Volga Town
%% Source: data/worlds/language/russian/items.pl
%% Created: 2026-04-03
%% Total: 22 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Samovar Tea Set
item(samovar_set, 'Samovar Tea Set', consumable).
item_description(samovar_set, 'A traditional Russian samovar for brewing strong tea, served with sugar cubes and lemon.').
item_value(samovar_set, 25).
item_sell_value(samovar_set, 12).
item_weight(samovar_set, 4).
item_rarity(samovar_set, common).
item_category(samovar_set, food_drink).
item_stackable(samovar_set).
item_tradeable(samovar_set).
item_possessable(samovar_set).
item_tag(samovar_set, cultural).
item_tag(samovar_set, beverage).

%% Pirozhki
item(pirozhki, 'Pirozhki', consumable).
item_description(pirozhki, 'Freshly baked stuffed buns with meat, cabbage, or potato filling -- a staple Russian street food.').
item_value(pirozhki, 3).
item_sell_value(pirozhki, 1).
item_weight(pirozhki, 0.3).
item_rarity(pirozhki, common).
item_category(pirozhki, food_drink).
item_stackable(pirozhki).
item_tradeable(pirozhki).
item_possessable(pirozhki).
item_tag(pirozhki, food).
item_tag(pirozhki, cultural).

%% Smartphone
item(smartphone_ru, 'Smartphone', tool).
item_description(smartphone_ru, 'A modern smartphone with a Russian keyboard and language-learning apps installed.').
item_value(smartphone_ru, 200).
item_sell_value(smartphone_ru, 100).
item_weight(smartphone_ru, 0.3).
item_rarity(smartphone_ru, common).
item_category(smartphone_ru, technology).
item_tradeable(smartphone_ru).
item_possessable(smartphone_ru).
item_tag(smartphone_ru, technology).
item_tag(smartphone_ru, communication).

%% Russian Textbook
item(russian_textbook, 'Russian Textbook', tool).
item_description(russian_textbook, 'A modern Russian-language textbook covering grammar, vocabulary, and reading exercises.').
item_value(russian_textbook, 25).
item_sell_value(russian_textbook, 10).
item_weight(russian_textbook, 1).
item_rarity(russian_textbook, common).
item_category(russian_textbook, education).
item_tradeable(russian_textbook).
item_possessable(russian_textbook).
item_tag(russian_textbook, education).
item_tag(russian_textbook, language).

%% Matryoshka Doll
item(matryoshka, 'Matryoshka Doll', accessory).
item_description(matryoshka, 'A set of brightly painted wooden nesting dolls, a beloved symbol of Russian folk art.').
item_value(matryoshka, 30).
item_sell_value(matryoshka, 18).
item_weight(matryoshka, 0.8).
item_rarity(matryoshka, uncommon).
item_category(matryoshka, decorative).
item_tradeable(matryoshka).
item_possessable(matryoshka).
item_tag(matryoshka, cultural).
item_tag(matryoshka, craft).

%% Pickled Vegetables (Soleniya)
item(soleniya, 'Soleniya (Pickled Vegetables)', consumable).
item_description(soleniya, 'A jar of home-pickled cucumbers, tomatoes, and garlic -- essential for any Russian table.').
item_value(soleniya, 5).
item_sell_value(soleniya, 3).
item_weight(soleniya, 1).
item_rarity(soleniya, common).
item_category(soleniya, food_drink).
item_stackable(soleniya).
item_tradeable(soleniya).
item_possessable(soleniya).
item_tag(soleniya, food).
item_tag(soleniya, cultural).

%% Ushanka (Fur Hat)
item(ushanka, 'Ushanka', equipment).
item_description(ushanka, 'A warm fur hat with ear flaps, essential for Russian winters along the Volga.').
item_value(ushanka, 20).
item_sell_value(ushanka, 10).
item_weight(ushanka, 0.5).
item_rarity(ushanka, common).
item_category(ushanka, clothing).
item_tradeable(ushanka).
item_possessable(ushanka).
item_tag(ushanka, clothing).
item_tag(ushanka, cultural).

%% Metro Token
item(metro_token, 'Metro Token', consumable).
item_description(metro_token, 'A transit token for local bus and marshrutka travel between Volzhansk and Rybachye.').
item_value(metro_token, 1).
item_sell_value(metro_token, 0).
item_weight(metro_token, 0).
item_rarity(metro_token, common).
item_category(metro_token, transport).
item_stackable(metro_token).
item_tradeable(metro_token).
item_possessable(metro_token).
item_tag(metro_token, transport).

%% Honey (from Rybachye)
item(myod, 'Myod (Honey)', consumable).
item_description(myod, 'Golden wildflower honey from the beekeepers of Rybachye village.').
item_value(myod, 12).
item_sell_value(myod, 7).
item_weight(myod, 0.8).
item_rarity(myod, common).
item_category(myod, food_drink).
item_stackable(myod).
item_tradeable(myod).
item_possessable(myod).
item_tag(myod, food).
item_tag(myod, cultural).

%% Valenki (Felt Boots)
item(valenki, 'Valenki', equipment).
item_description(valenki, 'Traditional Russian felt boots, handmade from sheep wool, worn in winter.').
item_value(valenki, 35).
item_sell_value(valenki, 18).
item_weight(valenki, 1.5).
item_rarity(valenki, uncommon).
item_category(valenki, clothing).
item_tradeable(valenki).
item_possessable(valenki).
item_tag(valenki, clothing).
item_tag(valenki, cultural).

%% Borscht (Beetroot Soup)
item(borshch, 'Borshch', consumable).
item_description(borshch, 'A bowl of hearty beetroot soup served with sour cream and dill -- the quintessential Russian dish.').
item_value(borshch, 4).
item_sell_value(borshch, 2).
item_weight(borshch, 0.5).
item_rarity(borshch, common).
item_category(borshch, food_drink).
item_stackable(borshch).
item_tradeable(borshch).
item_possessable(borshch).
item_tag(borshch, food).
item_tag(borshch, cultural).

%% Russian-English Dictionary
item(russian_dictionary, 'Russian-English Dictionary', tool).
item_description(russian_dictionary, 'A compact pocket dictionary for quick word lookups between Russian and English.').
item_value(russian_dictionary, 15).
item_sell_value(russian_dictionary, 7).
item_weight(russian_dictionary, 0.6).
item_rarity(russian_dictionary, common).
item_category(russian_dictionary, education).
item_tradeable(russian_dictionary).
item_possessable(russian_dictionary).
item_tag(russian_dictionary, education).
item_tag(russian_dictionary, language).

%% Birch Bark Craft
item(beresta, 'Beresta (Birch Bark Craft)', material).
item_description(beresta, 'A decorative box woven from birch bark, a traditional Russian folk craft from the Volga region.').
item_value(beresta, 18).
item_sell_value(beresta, 10).
item_weight(beresta, 0.4).
item_rarity(beresta, uncommon).
item_category(beresta, decorative).
item_tradeable(beresta).
item_possessable(beresta).
item_tag(beresta, craft).
item_tag(beresta, cultural).

%% Notebook
item(notebook_ru, 'Notebook', tool).
item_description(notebook_ru, 'A lined notebook for practicing Russian Cyrillic handwriting.').
item_value(notebook_ru, 3).
item_sell_value(notebook_ru, 1).
item_weight(notebook_ru, 0.3).
item_rarity(notebook_ru, common).
item_category(notebook_ru, education).
item_stackable(notebook_ru).
item_tradeable(notebook_ru).
item_possessable(notebook_ru).
item_tag(notebook_ru, education).
item_tag(notebook_ru, writing).

%% Smoked Fish
item(kopchenaya_ryba, 'Kopchenaya Ryba (Smoked Fish)', consumable).
item_description(kopchenaya_ryba, 'Freshly smoked Volga river fish from the Rybachye smokehouse.').
item_value(kopchenaya_ryba, 8).
item_sell_value(kopchenaya_ryba, 4).
item_weight(kopchenaya_ryba, 0.6).
item_rarity(kopchenaya_ryba, common).
item_category(kopchenaya_ryba, food_drink).
item_stackable(kopchenaya_ryba).
item_tradeable(kopchenaya_ryba).
item_possessable(kopchenaya_ryba).
item_tag(kopchenaya_ryba, food).
item_tag(kopchenaya_ryba, fishing).

%% Chess Set
item(shakhmaty, 'Shakhmaty (Chess Set)', tool).
item_description(shakhmaty, 'A wooden chess set -- chess is a beloved pastime in Russian parks and cafes.').
item_value(shakhmaty, 20).
item_sell_value(shakhmaty, 10).
item_weight(shakhmaty, 1.5).
item_rarity(shakhmaty, common).
item_category(shakhmaty, entertainment).
item_tradeable(shakhmaty).
item_possessable(shakhmaty).
item_tag(shakhmaty, social).
item_tag(shakhmaty, cultural).

%% Amber Pendant
item(yantarny_kulon, 'Yantarny Kulon (Amber Pendant)', accessory).
item_description(yantarny_kulon, 'A polished Baltic amber pendant on a silver chain, a popular Russian jewelry style.').
item_value(yantarny_kulon, 80).
item_sell_value(yantarny_kulon, 50).
item_weight(yantarny_kulon, 0.1).
item_rarity(yantarny_kulon, rare).
item_category(yantarny_kulon, accessory).
item_tradeable(yantarny_kulon).
item_possessable(yantarny_kulon).
item_tag(yantarny_kulon, luxury).
item_tag(yantarny_kulon, cultural).

%% Banya Venik (Birch Branches)
item(venik, 'Venik (Birch Bundle)', tool).
item_description(venik, 'A bundle of dried birch branches used for steaming in the banya -- promotes circulation and relaxation.').
item_value(venik, 5).
item_sell_value(venik, 2).
item_weight(venik, 0.4).
item_rarity(venik, common).
item_category(venik, health).
item_tradeable(venik).
item_possessable(venik).
item_tag(venik, cultural).
item_tag(venik, health).

%% Varenye (Fruit Preserves)
item(varenye, 'Varenye (Fruit Preserves)', consumable).
item_description(varenye, 'Homemade berry preserves served with tea -- a Volga village specialty.').
item_value(varenye, 6).
item_sell_value(varenye, 3).
item_weight(varenye, 0.7).
item_rarity(varenye, common).
item_category(varenye, food_drink).
item_stackable(varenye).
item_tradeable(varenye).
item_possessable(varenye).
item_tag(varenye, food).
item_tag(varenye, cultural).

%% Fishing Rod
item(udochka, 'Udochka (Fishing Rod)', tool).
item_description(udochka, 'A sturdy fishing rod used by Volga River anglers in Rybachye.').
item_value(udochka, 20).
item_sell_value(udochka, 10).
item_weight(udochka, 2).
item_rarity(udochka, common).
item_category(udochka, tool).
item_tradeable(udochka).
item_possessable(udochka).
item_tag(udochka, fishing).
item_tag(udochka, outdoors).

%% Platok (Shawl)
item(platok, 'Platok (Shawl)', equipment).
item_description(platok, 'A colorful Pavlovo Posad wool shawl with floral patterns, a classic Russian accessory.').
item_value(platok, 40).
item_sell_value(platok, 22).
item_weight(platok, 0.3).
item_rarity(platok, uncommon).
item_category(platok, clothing).
item_tradeable(platok).
item_possessable(platok).
item_tag(platok, clothing).
item_tag(platok, cultural).

%% Bliny (Pancakes)
item(bliny, 'Bliny (Pancakes)', consumable).
item_description(bliny, 'Thin Russian pancakes served with sour cream, honey, or caviar -- eaten especially during Maslenitsa.').
item_value(bliny, 4).
item_sell_value(bliny, 2).
item_weight(bliny, 0.3).
item_rarity(bliny, common).
item_category(bliny, food_drink).
item_stackable(bliny).
item_tradeable(bliny).
item_possessable(bliny).
item_tag(bliny, food).
item_tag(bliny, cultural).
