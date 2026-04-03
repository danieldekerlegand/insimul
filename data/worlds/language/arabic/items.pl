%% Insimul Items: Arabic Al-Andalus
%% Source: data/worlds/language/arabic/items.pl
%% Created: 2026-04-03
%% Total: 22 items (culturally specific to Al-Andalus)
%%
%% Predicate schema:
%%   item/3 — item(AtomId, Name, ItemType)
%%   item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Qalam (Reed Pen)
item(qalam, 'Qalam', tool).
item_description(qalam, 'A finely cut reed pen used for Arabic calligraphy, the most essential tool of the katib (scribe).').
item_value(qalam, 5).
item_sell_value(qalam, 3).
item_weight(qalam, 0.1).
item_rarity(qalam, common).
item_category(qalam, calligraphy).
item_stackable(qalam).
item_tradeable(qalam).
item_possessable(qalam).
item_tag(qalam, calligraphy).
item_tag(qalam, tool).
item_tag(qalam, writing).

%% Dawat (Inkwell)
item(dawat, 'Dawat', tool).
item_description(dawat, 'A brass inkwell filled with black walnut ink, used alongside the qalam for writing.').
item_value(dawat, 8).
item_sell_value(dawat, 5).
item_weight(dawat, 0.5).
item_rarity(dawat, common).
item_category(dawat, calligraphy).
item_tradeable(dawat).
item_possessable(dawat).
item_tag(dawat, calligraphy).
item_tag(dawat, tool).

%% Astrolabe
item(astrolabe, 'Astrolabe', instrument).
item_description(astrolabe, 'A finely crafted brass astrolabe used for determining the positions of celestial bodies, essential for navigation and prayer times.').
item_value(astrolabe, 200).
item_sell_value(astrolabe, 150).
item_weight(astrolabe, 2).
item_rarity(astrolabe, rare).
item_category(astrolabe, scientific_instrument).
item_tradeable(astrolabe).
item_possessable(astrolabe).
item_tag(astrolabe, science).
item_tag(astrolabe, astronomy).
item_tag(astrolabe, valuable).

%% Saffron
item(saffron, 'Za''faran', spice).
item_description(saffron, 'Precious saffron threads from the crocus flowers of La Mancha, worth more than their weight in gold.').
item_value(saffron, 50).
item_sell_value(saffron, 35).
item_weight(saffron, 0.1).
item_rarity(saffron, rare).
item_category(saffron, spice).
item_stackable(saffron).
item_tradeable(saffron).
item_possessable(saffron).
item_tag(saffron, spice).
item_tag(saffron, cooking).
item_tag(saffron, valuable).
item_max_stack(saffron, 20).

%% Cumin
item(kammun, 'Kammun', spice).
item_description(kammun, 'Earthy cumin seeds, a staple spice in Andalusian cuisine.').
item_value(kammun, 3).
item_sell_value(kammun, 2).
item_weight(kammun, 0.2).
item_rarity(kammun, common).
item_category(kammun, spice).
item_stackable(kammun).
item_tradeable(kammun).
item_possessable(kammun).
item_tag(kammun, spice).
item_tag(kammun, cooking).
item_max_stack(kammun, 50).

%% Cinnamon
item(qirfa, 'Qirfa', spice).
item_description(qirfa, 'Fragrant cinnamon bark brought by merchants from the East along the Silk Road.').
item_value(qirfa, 15).
item_sell_value(qirfa, 10).
item_weight(qirfa, 0.3).
item_rarity(qirfa, uncommon).
item_category(qirfa, spice).
item_stackable(qirfa).
item_tradeable(qirfa).
item_possessable(qirfa).
item_tag(qirfa, spice).
item_tag(qirfa, cooking).
item_tag(qirfa, trade_good).
item_max_stack(qirfa, 30).

%% Silk Fabric
item(silk_fabric, 'Harir', textile).
item_description(silk_fabric, 'A bolt of fine silk fabric, dyed with vibrant colors using techniques perfected by Andalusian weavers.').
item_value(silk_fabric, 80).
item_sell_value(silk_fabric, 60).
item_weight(silk_fabric, 1).
item_rarity(silk_fabric, uncommon).
item_category(silk_fabric, textile).
item_stackable(silk_fabric).
item_tradeable(silk_fabric).
item_possessable(silk_fabric).
item_tag(silk_fabric, textile).
item_tag(silk_fabric, crafting).
item_tag(silk_fabric, valuable).
item_max_stack(silk_fabric, 10).

%% Wool
item(suf, 'Suf', textile).
item_description(suf, 'Soft merino wool from Andalusian sheep, prized throughout the Mediterranean.').
item_value(suf, 10).
item_sell_value(suf, 7).
item_weight(suf, 2).
item_rarity(suf, common).
item_category(suf, textile).
item_stackable(suf).
item_tradeable(suf).
item_possessable(suf).
item_tag(suf, textile).
item_tag(suf, crafting).
item_max_stack(suf, 20).

%% Ancient Manuscript
item(ancient_manuscript, 'Makhtutat Qadima', document).
item_description(ancient_manuscript, 'A priceless manuscript containing Greek philosophical texts translated into Arabic, preserved in the royal library.').
item_value(ancient_manuscript, 500).
item_sell_value(ancient_manuscript, 300).
item_weight(ancient_manuscript, 1).
item_rarity(ancient_manuscript, legendary).
item_category(ancient_manuscript, manuscript).
item_tradeable(ancient_manuscript).
item_possessable(ancient_manuscript).
item_tag(ancient_manuscript, manuscript).
item_tag(ancient_manuscript, knowledge).
item_tag(ancient_manuscript, quest_item).

%% Copper Tray
item(siniyya, 'Siniyya', crafted_good).
item_description(siniyya, 'A hand-hammered copper tray with intricate geometric patterns, made by Qurtuba''s renowned coppersmiths.').
item_value(siniyya, 25).
item_sell_value(siniyya, 18).
item_weight(siniyya, 3).
item_rarity(siniyya, common).
item_category(siniyya, crafted_good).
item_tradeable(siniyya).
item_possessable(siniyya).
item_tag(siniyya, metalwork).
item_tag(siniyya, crafted).

%% Ceramic Tile (Zellige)
item(zellige, 'Zellige', crafted_good).
item_description(zellige, 'A hand-cut mosaic tile in vivid blues and greens, used to decorate the walls and floors of palaces and mosques.').
item_value(zellige, 12).
item_sell_value(zellige, 8).
item_weight(zellige, 1).
item_rarity(zellige, common).
item_category(zellige, crafted_good).
item_stackable(zellige).
item_tradeable(zellige).
item_possessable(zellige).
item_tag(zellige, pottery).
item_tag(zellige, crafted).
item_tag(zellige, decorative).
item_max_stack(zellige, 50).

%% Oud (Agarwood)
item(oud, 'Oud', perfume).
item_description(oud, 'A chip of precious agarwood, burned as incense in the homes of the wealthy. Its rich, complex fragrance is highly prized.').
item_value(oud, 100).
item_sell_value(oud, 75).
item_weight(oud, 0.1).
item_rarity(oud, rare).
item_category(oud, perfume).
item_stackable(oud).
item_tradeable(oud).
item_possessable(oud).
item_tag(oud, perfume).
item_tag(oud, luxury).
item_tag(oud, trade_good).
item_max_stack(oud, 10).

%% Rosewater
item(maa_ward, 'Ma'' al-Ward', perfume).
item_description(maa_ward, 'Distilled rosewater from the gardens of Qurtuba, used in cooking, perfumery, and medicine.').
item_value(maa_ward, 20).
item_sell_value(maa_ward, 14).
item_weight(maa_ward, 0.5).
item_rarity(maa_ward, uncommon).
item_category(maa_ward, perfume).
item_stackable(maa_ward).
item_tradeable(maa_ward).
item_possessable(maa_ward).
item_tag(maa_ward, perfume).
item_tag(maa_ward, cooking).
item_tag(maa_ward, medicine).
item_max_stack(maa_ward, 20).

%% Olive Oil
item(zayt_zaytun, 'Zayt al-Zaytun', food).
item_description(zayt_zaytun, 'Premium olive oil pressed from the famed Andalusian olive groves, used in cooking, lamps, and soap-making.').
item_value(zayt_zaytun, 8).
item_sell_value(zayt_zaytun, 5).
item_weight(zayt_zaytun, 1).
item_rarity(zayt_zaytun, common).
item_category(zayt_zaytun, food).
item_stackable(zayt_zaytun).
item_tradeable(zayt_zaytun).
item_possessable(zayt_zaytun).
item_tag(zayt_zaytun, food).
item_tag(zayt_zaytun, cooking).
item_max_stack(zayt_zaytun, 30).

%% Bread
item(khubz, 'Khubz', food).
item_description(khubz, 'A round flatbread baked fresh in the communal oven, a daily staple of Andalusian life.').
item_value(khubz, 1).
item_sell_value(khubz, 0).
item_weight(khubz, 0.5).
item_rarity(khubz, common).
item_category(khubz, food).
item_stackable(khubz).
item_tradeable(khubz).
item_possessable(khubz).
item_tag(khubz, food).
item_tag(khubz, staple).
item_max_stack(khubz, 10).

%% Leather-bound Quran
item(mushaf, 'Mushaf', book).
item_description(mushaf, 'A beautifully illuminated copy of the Quran with gold-leaf calligraphy and leather binding.').
item_value(mushaf, 300).
item_sell_value(mushaf, 200).
item_weight(mushaf, 2).
item_rarity(mushaf, rare).
item_category(mushaf, book).
item_tradeable(mushaf).
item_possessable(mushaf).
item_tag(mushaf, book).
item_tag(mushaf, religious).
item_tag(mushaf, calligraphy).

%% Medical Treatise
item(kitab_al_tibb, 'Kitab al-Tibb', book).
item_description(kitab_al_tibb, 'A medical treatise compiling knowledge from Galen, Hippocrates, and contemporary Andalusian physicians.').
item_value(kitab_al_tibb, 150).
item_sell_value(kitab_al_tibb, 100).
item_weight(kitab_al_tibb, 1.5).
item_rarity(kitab_al_tibb, uncommon).
item_category(kitab_al_tibb, book).
item_tradeable(kitab_al_tibb).
item_possessable(kitab_al_tibb).
item_tag(kitab_al_tibb, book).
item_tag(kitab_al_tibb, medicine).
item_tag(kitab_al_tibb, knowledge).

%% Damascene Steel Dagger
item(khanjar, 'Khanjar', weapon).
item_description(khanjar, 'A curved dagger of Damascus steel with an ivory handle, both a weapon and a status symbol.').
item_value(khanjar, 120).
item_sell_value(khanjar, 85).
item_weight(khanjar, 0.8).
item_rarity(khanjar, uncommon).
item_category(khanjar, weapon).
item_tradeable(khanjar).
item_possessable(khanjar).
item_tag(khanjar, weapon).
item_tag(khanjar, metalwork).
item_tag(khanjar, status).

%% Lute (Oud instrument)
item(oud_instrument, 'Al-Oud', instrument).
item_description(oud_instrument, 'A pear-shaped stringed instrument, ancestor of the European lute, essential for Andalusian music.').
item_value(oud_instrument, 75).
item_sell_value(oud_instrument, 50).
item_weight(oud_instrument, 2).
item_rarity(oud_instrument, uncommon).
item_category(oud_instrument, instrument).
item_tradeable(oud_instrument).
item_possessable(oud_instrument).
item_tag(oud_instrument, music).
item_tag(oud_instrument, instrument).
item_tag(oud_instrument, crafted).

%% Compass
item(bawsala, 'Bawsala', instrument).
item_description(bawsala, 'A magnetic compass used by navigators and merchants for orientation during long trade journeys.').
item_value(bawsala, 60).
item_sell_value(bawsala, 40).
item_weight(bawsala, 0.3).
item_rarity(bawsala, uncommon).
item_category(bawsala, scientific_instrument).
item_tradeable(bawsala).
item_possessable(bawsala).
item_tag(bawsala, science).
item_tag(bawsala, navigation).

%% Henna
item(hinna, 'Hinna', cosmetic).
item_description(hinna, 'A paste made from dried henna leaves, used for decorative body art and hair coloring during celebrations.').
item_value(hinna, 6).
item_sell_value(hinna, 4).
item_weight(hinna, 0.3).
item_rarity(hinna, common).
item_category(hinna, cosmetic).
item_stackable(hinna).
item_tradeable(hinna).
item_possessable(hinna).
item_tag(hinna, cosmetic).
item_tag(hinna, celebration).
item_max_stack(hinna, 20).

%% Leather (Cordovan)
item(jild_qurtubi, 'Jild Qurtubi', material).
item_description(jild_qurtubi, 'Fine Cordovan leather, famous throughout Europe for its quality. Tanned using techniques perfected in Qurtuba.').
item_value(jild_qurtubi, 30).
item_sell_value(jild_qurtubi, 22).
item_weight(jild_qurtubi, 2).
item_rarity(jild_qurtubi, common).
item_category(jild_qurtubi, raw_material).
item_stackable(jild_qurtubi).
item_tradeable(jild_qurtubi).
item_possessable(jild_qurtubi).
item_tag(jild_qurtubi, material).
item_tag(jild_qurtubi, crafting).
item_tag(jild_qurtubi, trade_good).
item_max_stack(jild_qurtubi, 20).
