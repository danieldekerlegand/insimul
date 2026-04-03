%% Insimul Items: Mughal Bengal
%% Source: data/worlds/language/bengali/items.pl
%% Created: 2026-04-03
%% Total: 25 culturally specific items
%%
%% Predicate schema:
%%   item/3 — item(AtomId, Name, ItemType)
%%   item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Muslin Cloth (Malmal)
item(muslin_cloth, 'Muslin Cloth', material).
item_description(muslin_cloth, 'A length of Dhaka muslin, so fine it is called "woven air" — the finest textile in the Mughal world.').
item_value(muslin_cloth, 50).
item_sell_value(muslin_cloth, 35).
item_weight(muslin_cloth, 0.5).
item_rarity(muslin_cloth, rare).
item_category(muslin_cloth, textile).
item_stackable(muslin_cloth).
item_tradeable(muslin_cloth).
item_possessable(muslin_cloth).
item_tag(muslin_cloth, textile).
item_tag(muslin_cloth, luxury).
item_tag(muslin_cloth, bengali).
item_max_stack(muslin_cloth, 20).

%% Jamdani Sari
item(jamdani_sari, 'Jamdani Sari', equipment).
item_description(jamdani_sari, 'A handwoven jamdani sari with intricate geometric patterns, a masterwork of Bengal weaving tradition.').
item_value(jamdani_sari, 100).
item_sell_value(jamdani_sari, 70).
item_weight(jamdani_sari, 1).
item_rarity(jamdani_sari, epic).
item_category(jamdani_sari, clothing).
item_tradeable(jamdani_sari).
item_possessable(jamdani_sari).
item_tag(jamdani_sari, textile).
item_tag(jamdani_sari, luxury).
item_tag(jamdani_sari, wearable).

%% Terracotta Pot (Matir Hari)
item(matir_hari, 'Matir Hari', tool).
item_description(matir_hari, 'A hand-thrown terracotta pot used for cooking and storing water, decorated with folk motifs.').
item_value(matir_hari, 5).
item_sell_value(matir_hari, 3).
item_weight(matir_hari, 3).
item_rarity(matir_hari, common).
item_category(matir_hari, household).
item_stackable(matir_hari).
item_tradeable(matir_hari).
item_possessable(matir_hari).
item_tag(matir_hari, pottery).
item_tag(matir_hari, crafting).
item_max_stack(matir_hari, 10).

%% Bamboo Basket (Bansh Dala)
item(bansh_dala, 'Bansh Dala', tool).
item_description(bansh_dala, 'A woven bamboo basket used for carrying rice, fish, and goods to market.').
item_value(bansh_dala, 3).
item_sell_value(bansh_dala, 2).
item_weight(bansh_dala, 1).
item_rarity(bansh_dala, common).
item_category(bansh_dala, household).
item_stackable(bansh_dala).
item_tradeable(bansh_dala).
item_possessable(bansh_dala).
item_tag(bansh_dala, bamboo).
item_tag(bansh_dala, crafting).
item_max_stack(bansh_dala, 20).

%% Jute Bundle (Pat-er Aanti)
item(pat_er_aanti, 'Pat-er Aanti', material).
item_description(pat_er_aanti, 'A bundle of raw jute fiber, the golden fiber of Bengal used for rope, sacking, and textiles.').
item_value(pat_er_aanti, 4).
item_sell_value(pat_er_aanti, 2).
item_weight(pat_er_aanti, 4).
item_rarity(pat_er_aanti, common).
item_category(pat_er_aanti, raw_material).
item_stackable(pat_er_aanti).
item_tradeable(pat_er_aanti).
item_possessable(pat_er_aanti).
item_tag(pat_er_aanti, material).
item_tag(pat_er_aanti, jute).
item_tag(pat_er_aanti, trade).
item_max_stack(pat_er_aanti, 50).

%% Turmeric (Holud)
item(holud, 'Holud', consumable).
item_description(holud, 'Fresh turmeric root, essential for Bengali cooking and wedding ceremonies.').
item_value(holud, 3).
item_sell_value(holud, 2).
item_weight(holud, 0.5).
item_rarity(holud, common).
item_category(holud, spice).
item_stackable(holud).
item_tradeable(holud).
item_possessable(holud).
item_tag(holud, spice).
item_tag(holud, food).
item_tag(holud, ceremonial).
item_max_stack(holud, 99).

%% Black Pepper (Gol Morich)
item(marich, 'Gol Morich', consumable).
item_description(marich, 'Black peppercorns, a prized spice in Bengal''s trade with the wider Mughal empire.').
item_value(marich, 8).
item_sell_value(marich, 5).
item_weight(marich, 0.3).
item_rarity(marich, uncommon).
item_category(marich, spice).
item_stackable(marich).
item_tradeable(marich).
item_possessable(marich).
item_tag(marich, spice).
item_tag(marich, food).
item_tag(marich, trade).
item_max_stack(marich, 99).

%% Hilsa Fish (Ilish Mach)
item(ilish_mach, 'Ilish Mach', consumable).
item_description(ilish_mach, 'A fresh hilsa fish, the king of fish in Bengal, prized for its rich, oily flesh.').
item_value(ilish_mach, 10).
item_sell_value(ilish_mach, 7).
item_weight(ilish_mach, 2).
item_rarity(ilish_mach, uncommon).
item_category(ilish_mach, food).
item_tradeable(ilish_mach).
item_possessable(ilish_mach).
item_tag(ilish_mach, food).
item_tag(ilish_mach, fish).
item_tag(ilish_mach, bengali).

%% Rice (Chal)
item(chal, 'Chal', consumable).
item_description(chal, 'Uncooked rice, the staple grain of Bengal, harvested from the monsoon-fed paddies.').
item_value(chal, 2).
item_sell_value(chal, 1).
item_weight(chal, 2).
item_rarity(chal, common).
item_category(chal, food).
item_stackable(chal).
item_tradeable(chal).
item_possessable(chal).
item_tag(chal, food).
item_tag(chal, staple).
item_tag(chal, loot_common).
item_max_stack(chal, 99).

%% Red Lentils (Masoor Dal)
item(masoor_dal, 'Masoor Dal', consumable).
item_description(masoor_dal, 'Dried red lentils, cooked daily in every Bengali household.').
item_value(masoor_dal, 2).
item_sell_value(masoor_dal, 1).
item_weight(masoor_dal, 1).
item_rarity(masoor_dal, common).
item_category(masoor_dal, food).
item_stackable(masoor_dal).
item_tradeable(masoor_dal).
item_possessable(masoor_dal).
item_tag(masoor_dal, food).
item_tag(masoor_dal, staple).
item_max_stack(masoor_dal, 99).

%% White Cotton Thread (Sada Suta)
item(sada_suta, 'Sada Suta', material).
item_description(sada_suta, 'Fine white cotton thread spun for muslin and jamdani weaving.').
item_value(sada_suta, 6).
item_sell_value(sada_suta, 4).
item_weight(sada_suta, 0.3).
item_rarity(sada_suta, uncommon).
item_category(sada_suta, raw_material).
item_stackable(sada_suta).
item_tradeable(sada_suta).
item_possessable(sada_suta).
item_tag(sada_suta, material).
item_tag(sada_suta, weaving).
item_max_stack(sada_suta, 99).

%% Dyed Thread (Rang Suta)
item(rang_suta, 'Rang Suta', material).
item_description(rang_suta, 'Thread dyed with natural plant pigments, used for jamdani pattern work.').
item_value(rang_suta, 8).
item_sell_value(rang_suta, 5).
item_weight(rang_suta, 0.3).
item_rarity(rang_suta, uncommon).
item_category(rang_suta, raw_material).
item_stackable(rang_suta).
item_tradeable(rang_suta).
item_possessable(rang_suta).
item_tag(rang_suta, material).
item_tag(rang_suta, weaving).
item_tag(rang_suta, dye).
item_max_stack(rang_suta, 99).

%% Muslin Bale (Muslin Thaan)
item(muslin_thaan, 'Muslin Thaan', material).
item_description(muslin_thaan, 'A full bale of finished Dhaka muslin, ready for export to the Mughal court.').
item_value(muslin_thaan, 200).
item_sell_value(muslin_thaan, 150).
item_weight(muslin_thaan, 5).
item_rarity(muslin_thaan, epic).
item_category(muslin_thaan, textile).
item_tradeable(muslin_thaan).
item_possessable(muslin_thaan).
item_tag(muslin_thaan, textile).
item_tag(muslin_thaan, luxury).
item_tag(muslin_thaan, trade).

%% Flower Garland (Pushpa Mala)
item(pushpa_mala, 'Pushpa Mala', consumable).
item_description(pushpa_mala, 'A garland of jasmine and marigold flowers, offered at temples and worn during celebrations.').
item_value(pushpa_mala, 2).
item_sell_value(pushpa_mala, 1).
item_weight(pushpa_mala, 0.2).
item_rarity(pushpa_mala, common).
item_category(pushpa_mala, ceremonial).
item_tradeable(pushpa_mala).
item_possessable(pushpa_mala).
item_tag(pushpa_mala, ceremonial).
item_tag(pushpa_mala, religious).
item_tag(pushpa_mala, flower).

%% River Clay (Nodi Mati)
item(nodi_mati, 'Nodi Mati', material).
item_description(nodi_mati, 'Fine alluvial clay from the riverbank, prized by potters for idol-making.').
item_value(nodi_mati, 1).
item_sell_value(nodi_mati, 0).
item_weight(nodi_mati, 5).
item_rarity(nodi_mati, common).
item_category(nodi_mati, raw_material).
item_stackable(nodi_mati).
item_tradeable(nodi_mati).
item_possessable(nodi_mati).
item_tag(nodi_mati, material).
item_tag(nodi_mati, pottery).
item_tag(nodi_mati, natural).
item_max_stack(nodi_mati, 50).

%% Natural Dye (Rang)
item(rang, 'Rang', material).
item_description(rang, 'Pigment powder made from indigo, turmeric, and other plants for dyeing textiles and painting idols.').
item_value(rang, 4).
item_sell_value(rang, 2).
item_weight(rang, 0.5).
item_rarity(rang, common).
item_category(rang, raw_material).
item_stackable(rang).
item_tradeable(rang).
item_possessable(rang).
item_tag(rang, material).
item_tag(rang, dye).
item_tag(rang, crafting).
item_max_stack(rang, 99).

%% Brass Oil Lamp (Pital Prodip)
item(pital_prodip, 'Pital Prodip', tool).
item_description(pital_prodip, 'A hand-crafted brass oil lamp lit during evening prayers and festivals.').
item_value(pital_prodip, 15).
item_sell_value(pital_prodip, 10).
item_weight(pital_prodip, 1).
item_rarity(pital_prodip, uncommon).
item_category(pital_prodip, household).
item_tradeable(pital_prodip).
item_possessable(pital_prodip).
item_tag(pital_prodip, brass).
item_tag(pital_prodip, ceremonial).
item_tag(pital_prodip, religious).

%% Betel Leaf and Nut (Paan Supari)
item(paan_supari, 'Paan Supari', consumable).
item_description(paan_supari, 'Betel leaf wrapped around areca nut, lime, and spices — a customary offering to guests.').
item_value(paan_supari, 1).
item_sell_value(paan_supari, 0).
item_weight(paan_supari, 0.1).
item_rarity(paan_supari, common).
item_category(paan_supari, food).
item_stackable(paan_supari).
item_tradeable(paan_supari).
item_possessable(paan_supari).
item_tag(paan_supari, food).
item_tag(paan_supari, social).
item_tag(paan_supari, hospitality).
item_max_stack(paan_supari, 99).

%% Conch Shell (Shankha)
item(shankha, 'Shankha', tool).
item_description(shankha, 'A polished white conch shell, blown during Hindu ceremonies and to mark auspicious moments.').
item_value(shankha, 12).
item_sell_value(shankha, 8).
item_weight(shankha, 1.5).
item_rarity(shankha, uncommon).
item_category(shankha, ceremonial).
item_tradeable(shankha).
item_possessable(shankha).
item_tag(shankha, ceremonial).
item_tag(shankha, religious).
item_tag(shankha, instrument).

%% Manuscript (Punthi)
item(punthi, 'Punthi', quest_item).
item_description(punthi, 'A handwritten manuscript on palm leaf or handmade paper, containing poetry, scripture, or medicinal knowledge.').
item_value(punthi, 75).
item_sell_value(punthi, 50).
item_weight(punthi, 1).
item_rarity(punthi, rare).
item_category(punthi, literary).
item_tradeable(punthi).
item_possessable(punthi).
item_tag(punthi, literary).
item_tag(punthi, knowledge).
item_tag(punthi, bengali).

%% Bamboo Flute (Banshi)
item(banshi, 'Banshi', equipment).
item_description(banshi, 'A bamboo flute associated with Krishna and pastoral Bengal, played by boatmen and shepherds.').
item_value(banshi, 8).
item_sell_value(banshi, 5).
item_weight(banshi, 0.3).
item_rarity(banshi, common).
item_category(banshi, instrument).
item_tradeable(banshi).
item_possessable(banshi).
item_tag(banshi, instrument).
item_tag(banshi, music).
item_tag(banshi, bamboo).

%% Ektara (One-string instrument)
item(ektara, 'Ektara', equipment).
item_description(ektara, 'A one-stringed drone instrument played by Baul mystic singers of Bengal.').
item_value(ektara, 20).
item_sell_value(ektara, 14).
item_weight(ektara, 1).
item_rarity(ektara, uncommon).
item_category(ektara, instrument).
item_tradeable(ektara).
item_possessable(ektara).
item_tag(ektara, instrument).
item_tag(ektara, music).
item_tag(ektara, baul).

%% Mustard Oil (Sorsher Tel)
item(sorsher_tel, 'Sorsher Tel', consumable).
item_description(sorsher_tel, 'Cold-pressed mustard oil, the essential cooking fat of Bengali cuisine.').
item_value(sorsher_tel, 3).
item_sell_value(sorsher_tel, 2).
item_weight(sorsher_tel, 1).
item_rarity(sorsher_tel, common).
item_category(sorsher_tel, food).
item_stackable(sorsher_tel).
item_tradeable(sorsher_tel).
item_possessable(sorsher_tel).
item_tag(sorsher_tel, food).
item_tag(sorsher_tel, cooking).
item_max_stack(sorsher_tel, 50).

%% Nakshi Kantha (Embroidered Quilt)
item(nakshi_kantha, 'Nakshi Kantha', equipment).
item_description(nakshi_kantha, 'A traditional embroidered quilt made from layers of old saris, stitched with folk narratives and floral patterns.').
item_value(nakshi_kantha, 30).
item_sell_value(nakshi_kantha, 20).
item_weight(nakshi_kantha, 2).
item_rarity(nakshi_kantha, rare).
item_category(nakshi_kantha, textile).
item_tradeable(nakshi_kantha).
item_possessable(nakshi_kantha).
item_tag(nakshi_kantha, textile).
item_tag(nakshi_kantha, folk_art).
item_tag(nakshi_kantha, bengali).
