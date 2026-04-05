%% Insimul Items: Urdu Punjab
%% Source: data/worlds/language/urdu/items.pl
%% Created: 2026-04-03
%% Total: 22 items (culturally specific to contemporary Pakistani Punjab)
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Chai Cup
item(chai_cup, 'Chai ka Cup', consumable).
item_description(chai_cup, 'A small glass cup of doodh patti chai, brewed strong with milk, cardamom, and sugar -- the lifeblood of Pakistani daily life.').
item_value(chai_cup, 1).
item_sell_value(chai_cup, 0).
item_weight(chai_cup, 0.3).
item_rarity(chai_cup, common).
item_category(chai_cup, food).
item_stackable(chai_cup).
item_tradeable(chai_cup).
item_possessable(chai_cup).
item_tag(chai_cup, food).
item_tag(chai_cup, drink).
item_tag(chai_cup, staple).
item_max_stack(chai_cup, 10).

%% Samosa
item(samosa, 'Samosa', consumable).
item_description(samosa, 'A crispy deep-fried pastry filled with spiced potatoes and peas, a beloved street food across Pakistan.').
item_value(samosa, 1).
item_sell_value(samosa, 0).
item_weight(samosa, 0.2).
item_rarity(samosa, common).
item_category(samosa, food).
item_stackable(samosa).
item_tradeable(samosa).
item_possessable(samosa).
item_tag(samosa, food).
item_tag(samosa, street_food).
item_max_stack(samosa, 20).

%% Biryani Plate
item(biryani_plate, 'Biryani ki Plate', consumable).
item_description(biryani_plate, 'A heaping plate of fragrant chicken biryani layered with saffron rice, fried onions, and raita on the side.').
item_value(biryani_plate, 5).
item_sell_value(biryani_plate, 3).
item_weight(biryani_plate, 0.8).
item_rarity(biryani_plate, common).
item_category(biryani_plate, food).
item_tradeable(biryani_plate).
item_possessable(biryani_plate).
item_tag(biryani_plate, food).
item_tag(biryani_plate, meal).

%% Seekh Kabab
item(seekh_kabab, 'Seekh Kabab', consumable).
item_description(seekh_kabab, 'Minced meat kababs grilled on skewers over charcoal, served with naan and chutney.').
item_value(seekh_kabab, 3).
item_sell_value(seekh_kabab, 2).
item_weight(seekh_kabab, 0.3).
item_rarity(seekh_kabab, common).
item_category(seekh_kabab, food).
item_stackable(seekh_kabab).
item_tradeable(seekh_kabab).
item_possessable(seekh_kabab).
item_tag(seekh_kabab, food).
item_tag(seekh_kabab, street_food).
item_max_stack(seekh_kabab, 10).

%% Smartphone
item(smartphone, 'Smartphone', tool).
item_description(smartphone, 'A budget Android smartphone with Urdu keyboard enabled, essential for modern communication and navigation.').
item_value(smartphone, 80).
item_sell_value(smartphone, 50).
item_weight(smartphone, 0.2).
item_rarity(smartphone, common).
item_category(smartphone, electronics).
item_tradeable(smartphone).
item_possessable(smartphone).
item_tag(smartphone, electronics).
item_tag(smartphone, communication).

%% Nastaliq Calligraphy Set
item(nastaliq_calligraphy_set, 'Nastaliq Calligraphy Set', tool).
item_description(nastaliq_calligraphy_set, 'A traditional calligraphy set with a bamboo qalam, ink pot, and practice sheets for learning Nastaliq script.').
item_value(nastaliq_calligraphy_set, 25).
item_sell_value(nastaliq_calligraphy_set, 15).
item_weight(nastaliq_calligraphy_set, 0.5).
item_rarity(nastaliq_calligraphy_set, uncommon).
item_category(nastaliq_calligraphy_set, calligraphy).
item_tradeable(nastaliq_calligraphy_set).
item_possessable(nastaliq_calligraphy_set).
item_tag(nastaliq_calligraphy_set, calligraphy).
item_tag(nastaliq_calligraphy_set, tool).
item_tag(nastaliq_calligraphy_set, writing).

%% Cricket Bat
item(cricket_bat, 'Cricket Bat', equipment).
item_description(cricket_bat, 'A Kashmir willow cricket bat, the preferred choice for gali cricket matches across Punjab.').
item_value(cricket_bat, 30).
item_sell_value(cricket_bat, 20).
item_weight(cricket_bat, 1.2).
item_rarity(cricket_bat, common).
item_category(cricket_bat, sports).
item_tradeable(cricket_bat).
item_possessable(cricket_bat).
item_tag(cricket_bat, sports).
item_tag(cricket_bat, cricket).

%% Cricket Ball
item(cricket_ball, 'Cricket Ball', equipment).
item_description(cricket_ball, 'A red leather cricket ball, slightly scuffed from street play.').
item_value(cricket_ball, 5).
item_sell_value(cricket_ball, 3).
item_weight(cricket_ball, 0.2).
item_rarity(cricket_ball, common).
item_category(cricket_ball, sports).
item_stackable(cricket_ball).
item_tradeable(cricket_ball).
item_possessable(cricket_ball).
item_tag(cricket_ball, sports).
item_tag(cricket_ball, cricket).
item_max_stack(cricket_ball, 6).

%% Pashmina Shawl
item(pashmina_shawl, 'Pashmina Shawl', clothing).
item_description(pashmina_shawl, 'A fine Kashmiri pashmina shawl with intricate embroidery, worn for warmth and elegance during winter.').
item_value(pashmina_shawl, 100).
item_sell_value(pashmina_shawl, 70).
item_weight(pashmina_shawl, 0.3).
item_rarity(pashmina_shawl, rare).
item_category(pashmina_shawl, clothing).
item_tradeable(pashmina_shawl).
item_possessable(pashmina_shawl).
item_tag(pashmina_shawl, clothing).
item_tag(pashmina_shawl, luxury).
item_tag(pashmina_shawl, valuable).

%% Dupatta
item(dupatta, 'Dupatta', clothing).
item_description(dupatta, 'A colorful chiffon dupatta (scarf), an essential part of the shalwar kameez outfit.').
item_value(dupatta, 10).
item_sell_value(dupatta, 7).
item_weight(dupatta, 0.2).
item_rarity(dupatta, common).
item_category(dupatta, clothing).
item_stackable(dupatta).
item_tradeable(dupatta).
item_possessable(dupatta).
item_tag(dupatta, clothing).
item_tag(dupatta, textile).
item_max_stack(dupatta, 10).

%% Shalwar Kameez (Mens)
item(shalwar_kameez, 'Shalwar Kameez', clothing).
item_description(shalwar_kameez, 'A freshly pressed white shalwar kameez, the standard daily outfit for men in Punjab.').
item_value(shalwar_kameez, 20).
item_sell_value(shalwar_kameez, 12).
item_weight(shalwar_kameez, 0.5).
item_rarity(shalwar_kameez, common).
item_category(shalwar_kameez, clothing).
item_tradeable(shalwar_kameez).
item_possessable(shalwar_kameez).
item_tag(shalwar_kameez, clothing).

%% Attar (Perfume Oil)
item(attar, 'Attar', cosmetic).
item_description(attar, 'A small vial of traditional alcohol-free perfume oil, rose or jasmine scented, applied behind the ears and on wrists.').
item_value(attar, 15).
item_sell_value(attar, 10).
item_weight(attar, 0.1).
item_rarity(attar, uncommon).
item_category(attar, cosmetic).
item_stackable(attar).
item_tradeable(attar).
item_possessable(attar).
item_tag(attar, cosmetic).
item_tag(attar, perfume).
item_max_stack(attar, 10).

%% Urdu Textbook
item(urdu_textbook, 'Urdu ki Kitab', book).
item_description(urdu_textbook, 'An introductory Urdu textbook with Nastaliq script lessons, vocabulary lists, and grammar exercises.').
item_value(urdu_textbook, 12).
item_sell_value(urdu_textbook, 8).
item_weight(urdu_textbook, 0.8).
item_rarity(urdu_textbook, common).
item_category(urdu_textbook, book).
item_tradeable(urdu_textbook).
item_possessable(urdu_textbook).
item_tag(urdu_textbook, book).
item_tag(urdu_textbook, education).
item_tag(urdu_textbook, language_learning).

%% Diwan-e-Ghalib (Poetry Collection)
item(diwan_e_ghalib, 'Diwan-e-Ghalib', book).
item_description(diwan_e_ghalib, 'A leather-bound collection of ghazals by Mirza Ghalib, the greatest Urdu poet, in beautiful Nastaliq print.').
item_value(diwan_e_ghalib, 40).
item_sell_value(diwan_e_ghalib, 25).
item_weight(diwan_e_ghalib, 0.6).
item_rarity(diwan_e_ghalib, uncommon).
item_category(diwan_e_ghalib, book).
item_tradeable(diwan_e_ghalib).
item_possessable(diwan_e_ghalib).
item_tag(diwan_e_ghalib, book).
item_tag(diwan_e_ghalib, poetry).
item_tag(diwan_e_ghalib, literature).

%% Mehndi (Henna)
item(mehndi, 'Mehndi', cosmetic).
item_description(mehndi, 'Fresh henna paste in a cone, used for intricate hand designs during weddings and Eid celebrations.').
item_value(mehndi, 3).
item_sell_value(mehndi, 2).
item_weight(mehndi, 0.2).
item_rarity(mehndi, common).
item_category(mehndi, cosmetic).
item_stackable(mehndi).
item_tradeable(mehndi).
item_possessable(mehndi).
item_tag(mehndi, cosmetic).
item_tag(mehndi, celebration).
item_max_stack(mehndi, 20).

%% Masala Dabba (Spice Box)
item(masala_dabba, 'Masala Dabba', tool).
item_description(masala_dabba, 'A round stainless steel spice box with seven compartments holding haldi, mirch, zeera, dhaniya, garam masala, namak, and ajwain.').
item_value(masala_dabba, 15).
item_sell_value(masala_dabba, 10).
item_weight(masala_dabba, 1).
item_rarity(masala_dabba, common).
item_category(masala_dabba, kitchen).
item_tradeable(masala_dabba).
item_possessable(masala_dabba).
item_tag(masala_dabba, kitchen).
item_tag(masala_dabba, cooking).
item_tag(masala_dabba, spice).

%% Topi (Prayer Cap)
item(topi, 'Topi', clothing).
item_description(topi, 'A white cotton prayer cap worn during namaz and Friday prayers at the masjid.').
item_value(topi, 3).
item_sell_value(topi, 2).
item_weight(topi, 0.1).
item_rarity(topi, common).
item_category(topi, clothing).
item_stackable(topi).
item_tradeable(topi).
item_possessable(topi).
item_tag(topi, clothing).
item_tag(topi, religious).
item_max_stack(topi, 5).

%% Naan (Tandoori Bread)
item(naan, 'Naan', consumable).
item_description(naan, 'A freshly baked tandoori naan, soft and slightly charred, served hot from the clay oven.').
item_value(naan, 1).
item_sell_value(naan, 0).
item_weight(naan, 0.3).
item_rarity(naan, common).
item_category(naan, food).
item_stackable(naan).
item_tradeable(naan).
item_possessable(naan).
item_tag(naan, food).
item_tag(naan, staple).
item_max_stack(naan, 10).

%% Ajrak (Sindhi Block-Print Cloth)
item(ajrak, 'Ajrak', textile).
item_description(ajrak, 'A traditional block-printed cloth in indigo and crimson, originally from Sindh but popular across Pakistan as a cultural symbol.').
item_value(ajrak, 20).
item_sell_value(ajrak, 14).
item_weight(ajrak, 0.4).
item_rarity(ajrak, uncommon).
item_category(ajrak, textile).
item_tradeable(ajrak).
item_possessable(ajrak).
item_tag(ajrak, textile).
item_tag(ajrak, cultural).
item_tag(ajrak, crafted).

%% Surma (Kohl Eyeliner)
item(surma, 'Surma', cosmetic).
item_description(surma, 'Traditional kohl eyeliner in a small brass container, used by both men and women. Believed to protect and strengthen the eyes.').
item_value(surma, 5).
item_sell_value(surma, 3).
item_weight(surma, 0.1).
item_rarity(surma, common).
item_category(surma, cosmetic).
item_stackable(surma).
item_tradeable(surma).
item_possessable(surma).
item_tag(surma, cosmetic).
item_tag(surma, traditional).
item_max_stack(surma, 10).

%% Tasbeeh (Prayer Beads)
item(tasbeeh, 'Tasbeeh', accessory).
item_description(tasbeeh, 'A string of 33 wooden prayer beads used for dhikr (remembrance of Allah) after prayers.').
item_value(tasbeeh, 8).
item_sell_value(tasbeeh, 5).
item_weight(tasbeeh, 0.1).
item_rarity(tasbeeh, common).
item_category(tasbeeh, religious).
item_tradeable(tasbeeh).
item_possessable(tasbeeh).
item_tag(tasbeeh, religious).
item_tag(tasbeeh, accessory).

%% Paan (Betel Leaf)
item(paan, 'Paan', consumable).
item_description(paan, 'A fresh betel leaf filled with supari, chuna, and gulkand -- a traditional after-meal digestive and social treat.').
item_value(paan, 1).
item_sell_value(paan, 0).
item_weight(paan, 0.1).
item_rarity(paan, common).
item_category(paan, food).
item_stackable(paan).
item_tradeable(paan).
item_possessable(paan).
item_tag(paan, food).
item_tag(paan, traditional).
item_max_stack(paan, 10).
