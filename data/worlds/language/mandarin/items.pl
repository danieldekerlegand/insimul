%% Insimul Items: Mandarin Watertown
%% Source: data/worlds/language/mandarin/items.pl
%% Created: 2026-04-03
%% Total: 22 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Gongfu Tea Set
item(gongfu_tea_set, 'Gongfu Tea Set', consumable).
item_description(gongfu_tea_set, 'A traditional Yixing clay teapot with small cups for gongfu-style tea brewing, essential for Jiangnan tea culture.').
item_value(gongfu_tea_set, 20).
item_sell_value(gongfu_tea_set, 10).
item_weight(gongfu_tea_set, 2).
item_rarity(gongfu_tea_set, common).
item_category(gongfu_tea_set, food_drink).
item_stackable(gongfu_tea_set).
item_tradeable(gongfu_tea_set).
item_possessable(gongfu_tea_set).
item_tag(gongfu_tea_set, cultural).
item_tag(gongfu_tea_set, beverage).

%% Xiaolongbao (Soup Dumplings)
item(xiaolongbao, 'Xiaolongbao', consumable).
item_description(xiaolongbao, 'Delicate steamed soup dumplings with thin skin and rich pork broth inside, a Jiangnan specialty.').
item_value(xiaolongbao, 5).
item_sell_value(xiaolongbao, 2).
item_weight(xiaolongbao, 0.5).
item_rarity(xiaolongbao, common).
item_category(xiaolongbao, food_drink).
item_stackable(xiaolongbao).
item_tradeable(xiaolongbao).
item_possessable(xiaolongbao).
item_tag(xiaolongbao, food).
item_tag(xiaolongbao, cultural).

%% Smartphone
item(smartphone_zh, 'Smartphone', tool).
item_description(smartphone_zh, 'A modern smartphone with WeChat, Alipay, and Chinese language-learning apps installed. Essential for QR-code payments.').
item_value(smartphone_zh, 200).
item_sell_value(smartphone_zh, 100).
item_weight(smartphone_zh, 0.3).
item_rarity(smartphone_zh, common).
item_category(smartphone_zh, technology).
item_tradeable(smartphone_zh).
item_possessable(smartphone_zh).
item_tag(smartphone_zh, technology).
item_tag(smartphone_zh, communication).

%% Mandarin Textbook
item(mandarin_textbook, 'Mandarin Textbook', tool).
item_description(mandarin_textbook, 'A modern HSK textbook covering pinyin, tones, characters, grammar, and reading exercises.').
item_value(mandarin_textbook, 25).
item_sell_value(mandarin_textbook, 10).
item_weight(mandarin_textbook, 1).
item_rarity(mandarin_textbook, common).
item_category(mandarin_textbook, education).
item_tradeable(mandarin_textbook).
item_possessable(mandarin_textbook).
item_tag(mandarin_textbook, education).
item_tag(mandarin_textbook, language).

%% Calligraphy Brush (Maobi)
item(maobi, 'Maobi', tool).
item_description(maobi, 'A traditional calligraphy brush made from bamboo and goat hair, one of the Four Treasures of the Study.').
item_value(maobi, 10).
item_sell_value(maobi, 5).
item_weight(maobi, 0.1).
item_rarity(maobi, uncommon).
item_category(maobi, craft).
item_tradeable(maobi).
item_possessable(maobi).
item_tag(maobi, cultural).
item_tag(maobi, craft).

%% Silk Scarf
item(silk_scarf, 'Silk Scarf', equipment).
item_description(silk_scarf, 'A hand-embroidered silk scarf from Jiangnan, featuring traditional floral patterns in vibrant colors.').
item_value(silk_scarf, 35).
item_sell_value(silk_scarf, 20).
item_weight(silk_scarf, 0.2).
item_rarity(silk_scarf, uncommon).
item_category(silk_scarf, clothing).
item_tradeable(silk_scarf).
item_possessable(silk_scarf).
item_tag(silk_scarf, clothing).
item_tag(silk_scarf, cultural).

%% Longjing Tea
item(longjing_tea, 'Longjing Tea', consumable).
item_description(longjing_tea, 'Premium Dragon Well green tea from the hills near Hangzhou, with a fresh chestnut aroma.').
item_value(longjing_tea, 15).
item_sell_value(longjing_tea, 8).
item_weight(longjing_tea, 0.3).
item_rarity(longjing_tea, common).
item_category(longjing_tea, food_drink).
item_stackable(longjing_tea).
item_tradeable(longjing_tea).
item_possessable(longjing_tea).
item_tag(longjing_tea, beverage).
item_tag(longjing_tea, cultural).

%% Mooncake
item(mooncake, 'Mooncake', consumable).
item_description(mooncake, 'A round pastry with lotus seed paste and salted egg yolk filling, traditionally eaten during the Mid-Autumn Festival.').
item_value(mooncake, 8).
item_sell_value(mooncake, 4).
item_weight(mooncake, 0.3).
item_rarity(mooncake, common).
item_category(mooncake, food_drink).
item_stackable(mooncake).
item_tradeable(mooncake).
item_possessable(mooncake).
item_tag(mooncake, food).
item_tag(mooncake, cultural).

%% Transit Card
item(transit_card, 'Transit Card', tool).
item_description(transit_card, 'A rechargeable transit card for buses, metro, and high-speed rail in the Jiangnan region.').
item_value(transit_card, 5).
item_sell_value(transit_card, 2).
item_weight(transit_card, 0).
item_rarity(transit_card, common).
item_category(transit_card, transport).
item_tradeable(transit_card).
item_possessable(transit_card).
item_tag(transit_card, transport).

%% Rice Wine (Huangjiu)
item(huangjiu, 'Huangjiu', consumable).
item_description(huangjiu, 'Traditional Shaoxing rice wine, amber-colored and mildly sweet, used in both cooking and drinking.').
item_value(huangjiu, 12).
item_sell_value(huangjiu, 6).
item_weight(huangjiu, 1).
item_rarity(huangjiu, common).
item_category(huangjiu, food_drink).
item_stackable(huangjiu).
item_tradeable(huangjiu).
item_possessable(huangjiu).
item_tag(huangjiu, beverage).
item_tag(huangjiu, cultural).

%% Ink Stick (Mo)
item(ink_stick, 'Ink Stick', tool).
item_description(ink_stick, 'A solid ink stick ground on a stone with water to produce calligraphy ink, one of the Four Treasures.').
item_value(ink_stick, 8).
item_sell_value(ink_stick, 4).
item_weight(ink_stick, 0.2).
item_rarity(ink_stick, common).
item_category(ink_stick, craft).
item_tradeable(ink_stick).
item_possessable(ink_stick).
item_tag(ink_stick, cultural).
item_tag(ink_stick, craft).

%% Red Envelope (Hongbao)
item(hongbao, 'Hongbao', consumable).
item_description(hongbao, 'A red envelope containing money, given during holidays and celebrations for good luck.').
item_value(hongbao, 50).
item_sell_value(hongbao, 25).
item_weight(hongbao, 0).
item_rarity(hongbao, uncommon).
item_category(hongbao, accessory).
item_tradeable(hongbao).
item_possessable(hongbao).
item_tag(hongbao, cultural).
item_tag(hongbao, gift).

%% Embroidered Fan
item(embroidered_fan, 'Embroidered Fan', accessory).
item_description(embroidered_fan, 'A delicate folding fan with Suzhou-style silk embroidery depicting plum blossoms.').
item_value(embroidered_fan, 18).
item_sell_value(embroidered_fan, 10).
item_weight(embroidered_fan, 0.2).
item_rarity(embroidered_fan, uncommon).
item_category(embroidered_fan, accessory).
item_tradeable(embroidered_fan).
item_possessable(embroidered_fan).
item_tag(embroidered_fan, cultural).
item_tag(embroidered_fan, craft).

%% Tofu (Doufu)
item(doufu, 'Doufu', consumable).
item_description(doufu, 'Fresh handmade tofu from Hehua Cun village, silky smooth and subtly sweet.').
item_value(doufu, 3).
item_sell_value(doufu, 1).
item_weight(doufu, 0.5).
item_rarity(doufu, common).
item_category(doufu, food_drink).
item_stackable(doufu).
item_tradeable(doufu).
item_possessable(doufu).
item_tag(doufu, food).
item_tag(doufu, cultural).

%% Chinese-English Dictionary
item(chinese_dictionary, 'Chinese-English Dictionary', tool).
item_description(chinese_dictionary, 'A compact pocket dictionary with pinyin pronunciation guides and stroke-order diagrams.').
item_value(chinese_dictionary, 15).
item_sell_value(chinese_dictionary, 7).
item_weight(chinese_dictionary, 0.6).
item_rarity(chinese_dictionary, common).
item_category(chinese_dictionary, education).
item_tradeable(chinese_dictionary).
item_possessable(chinese_dictionary).
item_tag(chinese_dictionary, education).
item_tag(chinese_dictionary, language).

%% Notebook
item(notebook_zh, 'Character Practice Notebook', tool).
item_description(notebook_zh, 'A grid-lined notebook designed for practicing Chinese character writing with proper proportions.').
item_value(notebook_zh, 3).
item_sell_value(notebook_zh, 1).
item_weight(notebook_zh, 0.3).
item_rarity(notebook_zh, common).
item_category(notebook_zh, education).
item_stackable(notebook_zh).
item_tradeable(notebook_zh).
item_possessable(notebook_zh).
item_tag(notebook_zh, education).
item_tag(notebook_zh, writing).

%% Jade Pendant
item(jade_pendant, 'Jade Pendant', accessory).
item_description(jade_pendant, 'A polished jade pendant carved in the shape of a lotus flower, symbolizing purity and good fortune.').
item_value(jade_pendant, 150).
item_sell_value(jade_pendant, 100).
item_weight(jade_pendant, 0.1).
item_rarity(jade_pendant, rare).
item_category(jade_pendant, accessory).
item_tradeable(jade_pendant).
item_possessable(jade_pendant).
item_tag(jade_pendant, luxury).
item_tag(jade_pendant, cultural).

%% Bubble Tea (Naicha)
item(naicha, 'Naicha', consumable).
item_description(naicha, 'A cold milk tea with chewy tapioca pearls, a hugely popular modern Chinese drink.').
item_value(naicha, 4).
item_sell_value(naicha, 2).
item_weight(naicha, 0.5).
item_rarity(naicha, common).
item_category(naicha, food_drink).
item_stackable(naicha).
item_tradeable(naicha).
item_possessable(naicha).
item_tag(naicha, beverage).
item_tag(naicha, modern).

%% Zongzi (Rice Dumpling)
item(zongzi, 'Zongzi', consumable).
item_description(zongzi, 'Sticky rice wrapped in bamboo leaves with meat or red bean filling, eaten during the Dragon Boat Festival.').
item_value(zongzi, 5).
item_sell_value(zongzi, 2).
item_weight(zongzi, 0.3).
item_rarity(zongzi, common).
item_category(zongzi, food_drink).
item_stackable(zongzi).
item_tradeable(zongzi).
item_possessable(zongzi).
item_tag(zongzi, food).
item_tag(zongzi, cultural).

%% Ceramic Blue-and-White Plate
item(blue_white_plate, 'Blue-and-White Plate', material).
item_description(blue_white_plate, 'A hand-painted porcelain plate with traditional blue-and-white patterns from Jingdezhen.').
item_value(blue_white_plate, 25).
item_sell_value(blue_white_plate, 15).
item_weight(blue_white_plate, 1).
item_rarity(blue_white_plate, uncommon).
item_category(blue_white_plate, decorative).
item_tradeable(blue_white_plate).
item_possessable(blue_white_plate).
item_tag(blue_white_plate, craft).
item_tag(blue_white_plate, cultural).

%% Mahjong Set
item(mahjong_set, 'Mahjong Set', tool).
item_description(mahjong_set, 'A complete set of 144 mahjong tiles in a carrying case, perfect for the favorite Chinese social game.').
item_value(mahjong_set, 30).
item_sell_value(mahjong_set, 15).
item_weight(mahjong_set, 3).
item_rarity(mahjong_set, common).
item_category(mahjong_set, entertainment).
item_tradeable(mahjong_set).
item_possessable(mahjong_set).
item_tag(mahjong_set, social).
item_tag(mahjong_set, cultural).

%% HSR Ticket
item(hsr_ticket, 'High-Speed Rail Ticket', consumable).
item_description(hsr_ticket, 'A ticket for the high-speed rail connecting Shuixiang Zhen to Shanghai and Hangzhou.').
item_value(hsr_ticket, 15).
item_sell_value(hsr_ticket, 0).
item_weight(hsr_ticket, 0).
item_rarity(hsr_ticket, common).
item_category(hsr_ticket, transport).
item_stackable(hsr_ticket).
item_tradeable(hsr_ticket).
item_possessable(hsr_ticket).
item_tag(hsr_ticket, transport).
