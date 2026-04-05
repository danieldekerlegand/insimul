%% Insimul Items: Indonesian Coastal Town
%% Source: data/worlds/language/indonesian/items.pl
%% Created: 2026-04-03
%% Total: 22 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Batik Cloth
item(batik_cloth, 'Kain Batik', material).
item_description(batik_cloth, 'A hand-drawn batik cloth with traditional Javanese motifs, made using the wax-resist dyeing technique.').
item_value(batik_cloth, 50).
item_sell_value(batik_cloth, 30).
item_weight(batik_cloth, 0.5).
item_rarity(batik_cloth, uncommon).
item_category(batik_cloth, clothing).
item_tradeable(batik_cloth).
item_possessable(batik_cloth).
item_tag(batik_cloth, cultural).
item_tag(batik_cloth, craft).

%% Nasi Goreng
item(nasi_goreng, 'Nasi Goreng', consumable).
item_description(nasi_goreng, 'Indonesian fried rice with sweet soy sauce, shallots, garlic, chili, and a fried egg on top.').
item_value(nasi_goreng, 3).
item_sell_value(nasi_goreng, 1).
item_weight(nasi_goreng, 0.5).
item_rarity(nasi_goreng, common).
item_category(nasi_goreng, food_drink).
item_stackable(nasi_goreng).
item_tradeable(nasi_goreng).
item_possessable(nasi_goreng).
item_tag(nasi_goreng, food).
item_tag(nasi_goreng, cultural).

%% Gamelan Instrument (Saron)
item(gamelan_saron, 'Saron Gamelan', tool).
item_description(gamelan_saron, 'A bronze metallophone from a Javanese gamelan ensemble, played with a wooden mallet.').
item_value(gamelan_saron, 80).
item_sell_value(gamelan_saron, 45).
item_weight(gamelan_saron, 8).
item_rarity(gamelan_saron, rare).
item_category(gamelan_saron, entertainment).
item_tradeable(gamelan_saron).
item_possessable(gamelan_saron).
item_tag(gamelan_saron, cultural).
item_tag(gamelan_saron, music).

%% Smartphone
item(smartphone_id, 'Smartphone', tool).
item_description(smartphone_id, 'A modern smartphone with Indonesian keyboard and language-learning apps installed.').
item_value(smartphone_id, 200).
item_sell_value(smartphone_id, 100).
item_weight(smartphone_id, 0.3).
item_rarity(smartphone_id, common).
item_category(smartphone_id, technology).
item_tradeable(smartphone_id).
item_possessable(smartphone_id).
item_tag(smartphone_id, technology).
item_tag(smartphone_id, communication).

%% Motorbike Helmet
item(helm_motor, 'Helm Motor', equipment).
item_description(helm_motor, 'A standard motorbike helmet, essential for riding the ojek motorcycle taxis that fill Indonesian streets.').
item_value(helm_motor, 15).
item_sell_value(helm_motor, 7).
item_weight(helm_motor, 1).
item_rarity(helm_motor, common).
item_category(helm_motor, transport).
item_tradeable(helm_motor).
item_possessable(helm_motor).
item_tag(helm_motor, transport).
item_tag(helm_motor, safety).

%% Wayang Puppet
item(wayang_kulit, 'Wayang Kulit', accessory).
item_description(wayang_kulit, 'A hand-crafted shadow puppet made from buffalo hide, used in traditional Javanese wayang performances.').
item_value(wayang_kulit, 40).
item_sell_value(wayang_kulit, 25).
item_weight(wayang_kulit, 0.3).
item_rarity(wayang_kulit, uncommon).
item_category(wayang_kulit, decorative).
item_tradeable(wayang_kulit).
item_possessable(wayang_kulit).
item_tag(wayang_kulit, cultural).
item_tag(wayang_kulit, craft).

%% Spice Blend (Bumbu)
item(bumbu_rempah, 'Bumbu Rempah', consumable).
item_description(bumbu_rempah, 'A fragrant blend of Indonesian spices: turmeric, galangal, lemongrass, and chili.').
item_value(bumbu_rempah, 8).
item_sell_value(bumbu_rempah, 4).
item_weight(bumbu_rempah, 0.3).
item_rarity(bumbu_rempah, common).
item_category(bumbu_rempah, food_drink).
item_stackable(bumbu_rempah).
item_tradeable(bumbu_rempah).
item_possessable(bumbu_rempah).
item_tag(bumbu_rempah, spice).
item_tag(bumbu_rempah, cooking).

%% Indonesian Textbook
item(buku_bahasa, 'Buku Bahasa Indonesia', tool).
item_description(buku_bahasa, 'A modern Indonesian language textbook covering grammar, vocabulary, and reading exercises.').
item_value(buku_bahasa, 25).
item_sell_value(buku_bahasa, 10).
item_weight(buku_bahasa, 1).
item_rarity(buku_bahasa, common).
item_category(buku_bahasa, education).
item_tradeable(buku_bahasa).
item_possessable(buku_bahasa).
item_tag(buku_bahasa, education).
item_tag(buku_bahasa, language).

%% Kopi Tubruk
item(kopi_tubruk, 'Kopi Tubruk', consumable).
item_description(kopi_tubruk, 'Strong Indonesian coffee brewed by boiling coarse grounds directly in the cup with sugar.').
item_value(kopi_tubruk, 2).
item_sell_value(kopi_tubruk, 1).
item_weight(kopi_tubruk, 0.3).
item_rarity(kopi_tubruk, common).
item_category(kopi_tubruk, food_drink).
item_stackable(kopi_tubruk).
item_tradeable(kopi_tubruk).
item_possessable(kopi_tubruk).
item_tag(kopi_tubruk, beverage).
item_tag(kopi_tubruk, cultural).

%% Sarong
item(sarung, 'Sarung', equipment).
item_description(sarung, 'A traditional wrapped garment worn by men and women for prayer, daily wear, and ceremonies.').
item_value(sarung, 12).
item_sell_value(sarung, 6).
item_weight(sarung, 0.4).
item_rarity(sarung, common).
item_category(sarung, clothing).
item_tradeable(sarung).
item_possessable(sarung).
item_tag(sarung, clothing).
item_tag(sarung, cultural).

%% Kecap Manis (Sweet Soy Sauce)
item(kecap_manis, 'Kecap Manis', consumable).
item_description(kecap_manis, 'Thick sweet soy sauce, the essential condiment of Indonesian cooking.').
item_value(kecap_manis, 3).
item_sell_value(kecap_manis, 1).
item_weight(kecap_manis, 0.5).
item_rarity(kecap_manis, common).
item_category(kecap_manis, food_drink).
item_stackable(kecap_manis).
item_tradeable(kecap_manis).
item_possessable(kecap_manis).
item_tag(kecap_manis, food).
item_tag(kecap_manis, cooking).

%% Keris (Ceremonial Dagger)
item(keris, 'Keris', accessory).
item_description(keris, 'An asymmetric ceremonial dagger with a distinctive wavy blade, a symbol of Javanese heritage and spiritual power.').
item_value(keris, 150).
item_sell_value(keris, 100).
item_weight(keris, 0.5).
item_rarity(keris, rare).
item_category(keris, accessory).
item_tradeable(keris).
item_possessable(keris).
item_tag(keris, cultural).
item_tag(keris, luxury).

%% Jamu (Herbal Medicine)
item(jamu, 'Jamu', consumable).
item_description(jamu, 'Traditional Javanese herbal medicine made from turmeric, ginger, tamarind, and other natural ingredients.').
item_value(jamu, 5).
item_sell_value(jamu, 2).
item_weight(jamu, 0.4).
item_rarity(jamu, common).
item_category(jamu, health).
item_stackable(jamu).
item_tradeable(jamu).
item_possessable(jamu).
item_tag(jamu, health).
item_tag(jamu, cultural).

%% Fishing Net
item(jala_ikan, 'Jala Ikan', tool).
item_description(jala_ikan, 'A sturdy fishing net used by the fishermen of Pantai Mutiara harbor.').
item_value(jala_ikan, 20).
item_sell_value(jala_ikan, 10).
item_weight(jala_ikan, 3).
item_rarity(jala_ikan, common).
item_category(jala_ikan, tool).
item_tradeable(jala_ikan).
item_possessable(jala_ikan).
item_tag(jala_ikan, fishing).
item_tag(jala_ikan, maritime).

%% Notebook
item(buku_tulis, 'Buku Tulis', tool).
item_description(buku_tulis, 'A lined notebook for practicing Indonesian handwriting and vocabulary.').
item_value(buku_tulis, 3).
item_sell_value(buku_tulis, 1).
item_weight(buku_tulis, 0.3).
item_rarity(buku_tulis, common).
item_category(buku_tulis, education).
item_stackable(buku_tulis).
item_tradeable(buku_tulis).
item_possessable(buku_tulis).
item_tag(buku_tulis, education).
item_tag(buku_tulis, writing).

%% Indonesian-English Dictionary
item(kamus_id, 'Kamus Indonesia-Inggris', tool).
item_description(kamus_id, 'A compact pocket dictionary for quick word lookups between Indonesian and English.').
item_value(kamus_id, 15).
item_sell_value(kamus_id, 7).
item_weight(kamus_id, 0.6).
item_rarity(kamus_id, common).
item_category(kamus_id, education).
item_tradeable(kamus_id).
item_possessable(kamus_id).
item_tag(kamus_id, education).
item_tag(kamus_id, language).

%% Sambal
item(sambal, 'Sambal', consumable).
item_description(sambal, 'Fiery Indonesian chili paste, ground fresh with shallots, garlic, and terasi (shrimp paste).').
item_value(sambal, 2).
item_sell_value(sambal, 1).
item_weight(sambal, 0.3).
item_rarity(sambal, common).
item_category(sambal, food_drink).
item_stackable(sambal).
item_tradeable(sambal).
item_possessable(sambal).
item_tag(sambal, food).
item_tag(sambal, cultural).

%% Angklung
item(angklung, 'Angklung', tool).
item_description(angklung, 'A bamboo musical instrument from West Java, each one producing a single note when shaken.').
item_value(angklung, 15).
item_sell_value(angklung, 8).
item_weight(angklung, 0.5).
item_rarity(angklung, uncommon).
item_category(angklung, entertainment).
item_tradeable(angklung).
item_possessable(angklung).
item_tag(angklung, cultural).
item_tag(angklung, music).

%% Ojek Ticket
item(tiket_ojek, 'Tiket Ojek', consumable).
item_description(tiket_ojek, 'A ride voucher for ojek motorcycle taxi between Pantai Mutiara and Desa Sawah.').
item_value(tiket_ojek, 1).
item_sell_value(tiket_ojek, 0).
item_weight(tiket_ojek, 0).
item_rarity(tiket_ojek, common).
item_category(tiket_ojek, transport).
item_stackable(tiket_ojek).
item_tradeable(tiket_ojek).
item_possessable(tiket_ojek).
item_tag(tiket_ojek, transport).

%% Peci (Muslim Cap)
item(peci, 'Peci', equipment).
item_description(peci, 'A black velvet cap worn by Indonesian men for prayer, formal occasions, and as a symbol of national identity.').
item_value(peci, 8).
item_sell_value(peci, 4).
item_weight(peci, 0.1).
item_rarity(peci, common).
item_category(peci, clothing).
item_tradeable(peci).
item_possessable(peci).
item_tag(peci, clothing).
item_tag(peci, cultural).

%% Tempe
item(tempe, 'Tempe', consumable).
item_description(tempe, 'Fermented soybean cake, a staple Indonesian protein source, often sliced and fried crispy.').
item_value(tempe, 2).
item_sell_value(tempe, 1).
item_weight(tempe, 0.3).
item_rarity(tempe, common).
item_category(tempe, food_drink).
item_stackable(tempe).
item_tradeable(tempe).
item_possessable(tempe).
item_tag(tempe, food).
item_tag(tempe, cultural).

%% Songket Cloth
item(kain_songket, 'Kain Songket', material).
item_description(kain_songket, 'A luxurious hand-woven fabric with gold or silver thread, worn during ceremonies and weddings.').
item_value(kain_songket, 120).
item_sell_value(kain_songket, 75).
item_weight(kain_songket, 0.6).
item_rarity(kain_songket, rare).
item_category(kain_songket, clothing).
item_tradeable(kain_songket).
item_possessable(kain_songket).
item_tag(kain_songket, luxury).
item_tag(kain_songket, cultural).
