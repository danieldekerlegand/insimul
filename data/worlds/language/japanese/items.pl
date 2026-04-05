%% Insimul Items: Japanese Town
%% Source: data/worlds/language/japanese/items.pl
%% Created: 2026-04-03
%% Total: 22 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% IC Card (Suica/ICOCA)
item(ic_card, 'IC Card', tool).
item_description(ic_card, 'A rechargeable transit IC card used for trains, buses, and konbini payments throughout Japan.').
item_value(ic_card, 20).
item_sell_value(ic_card, 10).
item_weight(ic_card, 0.05).
item_rarity(ic_card, common).
item_category(ic_card, transport).
item_tradeable(ic_card).
item_possessable(ic_card).
item_tag(ic_card, transport).
item_tag(ic_card, technology).

%% Bento Box
item(bento_box, 'Bento Box', consumable).
item_description(bento_box, 'A compartmentalized lunch box filled with rice, grilled fish, pickled vegetables, and tamagoyaki.').
item_value(bento_box, 8).
item_sell_value(bento_box, 4).
item_weight(bento_box, 0.6).
item_rarity(bento_box, common).
item_category(bento_box, food_drink).
item_stackable(bento_box).
item_tradeable(bento_box).
item_possessable(bento_box).
item_tag(bento_box, food).
item_tag(bento_box, cultural).

%% Smartphone
item(smartphone_jp, 'Smartphone', tool).
item_description(smartphone_jp, 'A modern smartphone with Japanese keyboard input and language-learning apps installed.').
item_value(smartphone_jp, 200).
item_sell_value(smartphone_jp, 100).
item_weight(smartphone_jp, 0.3).
item_rarity(smartphone_jp, common).
item_category(smartphone_jp, technology).
item_tradeable(smartphone_jp).
item_possessable(smartphone_jp).
item_tag(smartphone_jp, technology).
item_tag(smartphone_jp, communication).

%% Chopsticks (Hashi)
item(hashi, 'Hashi (Chopsticks)', tool).
item_description(hashi, 'A pair of reusable wooden chopsticks in a carrying case -- essential for everyday meals.').
item_value(hashi, 5).
item_sell_value(hashi, 2).
item_weight(hashi, 0.1).
item_rarity(hashi, common).
item_category(hashi, utensil).
item_tradeable(hashi).
item_possessable(hashi).
item_tag(hashi, cultural).
item_tag(hashi, daily_life).

%% Manga Volume
item(manga_volume, 'Manga Volume', tool).
item_description(manga_volume, 'A Japanese manga volume with furigana readings above kanji -- perfect for language practice.').
item_value(manga_volume, 5).
item_sell_value(manga_volume, 2).
item_weight(manga_volume, 0.3).
item_rarity(manga_volume, common).
item_category(manga_volume, entertainment).
item_tradeable(manga_volume).
item_possessable(manga_volume).
item_tag(manga_volume, entertainment).
item_tag(manga_volume, language).

%% Folding Umbrella (Kasa)
item(kasa, 'Kasa (Folding Umbrella)', equipment).
item_description(kasa, 'A compact folding umbrella essential for the rainy tsuyu season.').
item_value(kasa, 10).
item_sell_value(kasa, 5).
item_weight(kasa, 0.4).
item_rarity(kasa, common).
item_category(kasa, accessory).
item_tradeable(kasa).
item_possessable(kasa).
item_tag(kasa, daily_life).
item_tag(kasa, weather).

%% Matcha
item(matcha, 'Matcha', consumable).
item_description(matcha, 'Finely ground green tea powder used in traditional tea ceremony and modern drinks.').
item_value(matcha, 15).
item_sell_value(matcha, 8).
item_weight(matcha, 0.2).
item_rarity(matcha, uncommon).
item_category(matcha, food_drink).
item_stackable(matcha).
item_tradeable(matcha).
item_possessable(matcha).
item_tag(matcha, beverage).
item_tag(matcha, cultural).

%% Omamori (Charm)
item(omamori, 'Omamori', accessory).
item_description(omamori, 'A fabric-wrapped protective charm from the shrine, believed to bring good fortune in studies.').
item_value(omamori, 8).
item_sell_value(omamori, 4).
item_weight(omamori, 0.05).
item_rarity(omamori, common).
item_category(omamori, accessory).
item_tradeable(omamori).
item_possessable(omamori).
item_tag(omamori, cultural).
item_tag(omamori, spiritual).

%% Onigiri
item(onigiri, 'Onigiri', consumable).
item_description(onigiri, 'A triangular rice ball wrapped in nori seaweed with a savory filling inside.').
item_value(onigiri, 2).
item_sell_value(onigiri, 1).
item_weight(onigiri, 0.2).
item_rarity(onigiri, common).
item_category(onigiri, food_drink).
item_stackable(onigiri).
item_tradeable(onigiri).
item_possessable(onigiri).
item_tag(onigiri, food).
item_tag(onigiri, cultural).

%% Japanese Textbook
item(japanese_textbook, 'Japanese Textbook', tool).
item_description(japanese_textbook, 'A Genki-style textbook covering grammar, vocabulary, and all three writing systems.').
item_value(japanese_textbook, 30).
item_sell_value(japanese_textbook, 12).
item_weight(japanese_textbook, 1).
item_rarity(japanese_textbook, common).
item_category(japanese_textbook, education).
item_tradeable(japanese_textbook).
item_possessable(japanese_textbook).
item_tag(japanese_textbook, education).
item_tag(japanese_textbook, language).

%% Tenugui (Hand Towel)
item(tenugui, 'Tenugui', equipment).
item_description(tenugui, 'A thin cotton hand towel with traditional patterns, used at the sento and in daily life.').
item_value(tenugui, 6).
item_sell_value(tenugui, 3).
item_weight(tenugui, 0.1).
item_rarity(tenugui, common).
item_category(tenugui, accessory).
item_tradeable(tenugui).
item_possessable(tenugui).
item_tag(tenugui, cultural).
item_tag(tenugui, daily_life).

%% Taiyaki
item(taiyaki, 'Taiyaki', consumable).
item_description(taiyaki, 'A fish-shaped cake filled with sweet red bean paste, a classic shotengai street snack.').
item_value(taiyaki, 3).
item_sell_value(taiyaki, 1).
item_weight(taiyaki, 0.2).
item_rarity(taiyaki, common).
item_category(taiyaki, food_drink).
item_stackable(taiyaki).
item_tradeable(taiyaki).
item_possessable(taiyaki).
item_tag(taiyaki, food).
item_tag(taiyaki, cultural).

%% Japanese-English Dictionary
item(japanese_dictionary, 'Japanese-English Dictionary', tool).
item_description(japanese_dictionary, 'A compact pocket dictionary for quick kanji and vocabulary lookups.').
item_value(japanese_dictionary, 15).
item_sell_value(japanese_dictionary, 7).
item_weight(japanese_dictionary, 0.6).
item_rarity(japanese_dictionary, common).
item_category(japanese_dictionary, education).
item_tradeable(japanese_dictionary).
item_possessable(japanese_dictionary).
item_tag(japanese_dictionary, education).
item_tag(japanese_dictionary, language).

%% Sake Bottle
item(sake_bottle, 'Sake Bottle', consumable).
item_description(sake_bottle, 'A bottle of locally brewed junmai sake from the Kansai region.').
item_value(sake_bottle, 18).
item_sell_value(sake_bottle, 10).
item_weight(sake_bottle, 1).
item_rarity(sake_bottle, common).
item_category(sake_bottle, food_drink).
item_tradeable(sake_bottle).
item_possessable(sake_bottle).
item_tag(sake_bottle, beverage).
item_tag(sake_bottle, cultural).

%% Furoshiki (Wrapping Cloth)
item(furoshiki, 'Furoshiki', equipment).
item_description(furoshiki, 'A square wrapping cloth used to carry items, wrap gifts, or as a bag -- a reusable Japanese tradition.').
item_value(furoshiki, 8).
item_sell_value(furoshiki, 4).
item_weight(furoshiki, 0.2).
item_rarity(furoshiki, common).
item_category(furoshiki, accessory).
item_tradeable(furoshiki).
item_possessable(furoshiki).
item_tag(furoshiki, cultural).
item_tag(furoshiki, daily_life).

%% Notebook (Nooto)
item(notebook_jp, 'Notebook', tool).
item_description(notebook_jp, 'A grid-lined notebook for practicing hiragana, katakana, and kanji strokes.').
item_value(notebook_jp, 3).
item_sell_value(notebook_jp, 1).
item_weight(notebook_jp, 0.3).
item_rarity(notebook_jp, common).
item_category(notebook_jp, education).
item_stackable(notebook_jp).
item_tradeable(notebook_jp).
item_possessable(notebook_jp).
item_tag(notebook_jp, education).
item_tag(notebook_jp, writing).

%% Ceramic Tea Cup (Yunomi)
item(yunomi, 'Yunomi', material).
item_description(yunomi, 'A handmade ceramic tea cup from the local pottery studio, used for everyday green tea.').
item_value(yunomi, 12).
item_sell_value(yunomi, 6).
item_weight(yunomi, 0.3).
item_rarity(yunomi, uncommon).
item_category(yunomi, decorative).
item_tradeable(yunomi).
item_possessable(yunomi).
item_tag(yunomi, craft).
item_tag(yunomi, cultural).

%% Train Ticket
item(train_ticket_jp, 'Train Ticket', consumable).
item_description(train_ticket_jp, 'A local train ticket for traveling between Sakuragawa and Yamanoue.').
item_value(train_ticket_jp, 2).
item_sell_value(train_ticket_jp, 0).
item_weight(train_ticket_jp, 0).
item_rarity(train_ticket_jp, common).
item_category(train_ticket_jp, transport).
item_stackable(train_ticket_jp).
item_tradeable(train_ticket_jp).
item_possessable(train_ticket_jp).
item_tag(train_ticket_jp, transport).

%% Senbei (Rice Crackers)
item(senbei, 'Senbei', consumable).
item_description(senbei, 'Crispy rice crackers flavored with soy sauce -- a classic Japanese snack.').
item_value(senbei, 3).
item_sell_value(senbei, 1).
item_weight(senbei, 0.2).
item_rarity(senbei, common).
item_category(senbei, food_drink).
item_stackable(senbei).
item_tradeable(senbei).
item_possessable(senbei).
item_tag(senbei, food).
item_tag(senbei, cultural).

%% Wagashi (Traditional Sweets)
item(wagashi, 'Wagashi', consumable).
item_description(wagashi, 'Delicate traditional sweets made with mochi, red bean paste, and seasonal designs.').
item_value(wagashi, 10).
item_sell_value(wagashi, 5).
item_weight(wagashi, 0.2).
item_rarity(wagashi, uncommon).
item_category(wagashi, food_drink).
item_stackable(wagashi).
item_tradeable(wagashi).
item_possessable(wagashi).
item_tag(wagashi, food).
item_tag(wagashi, cultural).

%% Ema (Votive Tablet)
item(ema, 'Ema', accessory).
item_description(ema, 'A small wooden tablet from the shrine where visitors write wishes and prayers.').
item_value(ema, 5).
item_sell_value(ema, 2).
item_weight(ema, 0.1).
item_rarity(ema, common).
item_category(ema, accessory).
item_tradeable(ema).
item_possessable(ema).
item_tag(ema, cultural).
item_tag(ema, spiritual).

%% Goshuin-cho (Temple Stamp Book)
item(goshuincho, 'Goshuin-cho', tool).
item_description(goshuincho, 'A beautiful accordion-fold book for collecting calligraphic stamps from temples and shrines.').
item_value(goshuincho, 15).
item_sell_value(goshuincho, 8).
item_weight(goshuincho, 0.3).
item_rarity(goshuincho, uncommon).
item_category(goshuincho, accessory).
item_tradeable(goshuincho).
item_possessable(goshuincho).
item_tag(goshuincho, cultural).
item_tag(goshuincho, spiritual).
