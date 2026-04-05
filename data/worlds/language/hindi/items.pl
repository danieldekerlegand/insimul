%% Insimul Items: Hindi Town
%% Source: data/worlds/language/hindi/items.pl
%% Created: 2026-04-03
%% Total: 22 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Chai Cup
item(chai_cup, 'Chai Cup', consumable).
item_description(chai_cup, 'A steaming kulhar (clay cup) of masala chai with cardamom, ginger, and milk.').
item_value(chai_cup, 2).
item_sell_value(chai_cup, 1).
item_weight(chai_cup, 0.3).
item_rarity(chai_cup, common).
item_category(chai_cup, food_drink).
item_stackable(chai_cup).
item_tradeable(chai_cup).
item_possessable(chai_cup).
item_tag(chai_cup, cultural).
item_tag(chai_cup, beverage).

%% Samosa
item(samosa_hi, 'Samosa', consumable).
item_description(samosa_hi, 'A crispy fried pastry stuffed with spiced potatoes and peas, served with mint chutney.').
item_value(samosa_hi, 3).
item_sell_value(samosa_hi, 1).
item_weight(samosa_hi, 0.3).
item_rarity(samosa_hi, common).
item_category(samosa_hi, food_drink).
item_stackable(samosa_hi).
item_tradeable(samosa_hi).
item_possessable(samosa_hi).
item_tag(samosa_hi, food).
item_tag(samosa_hi, cultural).

%% Smartphone
item(smartphone_hi, 'Smartphone', tool).
item_description(smartphone_hi, 'A modern smartphone with Hindi Devanagari keyboard and language-learning apps installed.').
item_value(smartphone_hi, 200).
item_sell_value(smartphone_hi, 100).
item_weight(smartphone_hi, 0.3).
item_rarity(smartphone_hi, common).
item_category(smartphone_hi, technology).
item_tradeable(smartphone_hi).
item_possessable(smartphone_hi).
item_tag(smartphone_hi, technology).
item_tag(smartphone_hi, communication).

%% Devanagari Textbook
item(devanagari_textbook, 'Devanagari Textbook', tool).
item_description(devanagari_textbook, 'A modern Hindi textbook covering Devanagari script, grammar, vocabulary, and reading exercises.').
item_value(devanagari_textbook, 25).
item_sell_value(devanagari_textbook, 10).
item_weight(devanagari_textbook, 1).
item_rarity(devanagari_textbook, common).
item_category(devanagari_textbook, education).
item_tradeable(devanagari_textbook).
item_possessable(devanagari_textbook).
item_tag(devanagari_textbook, education).
item_tag(devanagari_textbook, language).

%% Auto-Rickshaw Token
item(auto_rickshaw_token, 'Auto-Rickshaw Token', consumable).
item_description(auto_rickshaw_token, 'A prepaid token for auto-rickshaw rides around Surajpur.').
item_value(auto_rickshaw_token, 2).
item_sell_value(auto_rickshaw_token, 0).
item_weight(auto_rickshaw_token, 0).
item_rarity(auto_rickshaw_token, common).
item_category(auto_rickshaw_token, transport).
item_stackable(auto_rickshaw_token).
item_tradeable(auto_rickshaw_token).
item_possessable(auto_rickshaw_token).
item_tag(auto_rickshaw_token, transport).

%% Cricket Bat
item(cricket_bat, 'Cricket Bat', tool).
item_description(cricket_bat, 'A wooden cricket bat from Cricket King Sports, a beloved pastime across India.').
item_value(cricket_bat, 30).
item_sell_value(cricket_bat, 15).
item_weight(cricket_bat, 2).
item_rarity(cricket_bat, common).
item_category(cricket_bat, entertainment).
item_tradeable(cricket_bat).
item_possessable(cricket_bat).
item_tag(cricket_bat, sports).
item_tag(cricket_bat, cultural).

%% Laddu Box
item(laddu_box, 'Laddu Box', consumable).
item_description(laddu_box, 'A box of golden besan laddus from Mishra Mithai Bhandar, a festive sweet offering.').
item_value(laddu_box, 10).
item_sell_value(laddu_box, 5).
item_weight(laddu_box, 0.5).
item_rarity(laddu_box, common).
item_category(laddu_box, food_drink).
item_stackable(laddu_box).
item_tradeable(laddu_box).
item_possessable(laddu_box).
item_tag(laddu_box, food).
item_tag(laddu_box, cultural).

%% Dupatta (Scarf)
item(dupatta, 'Dupatta', equipment).
item_description(dupatta, 'A colorful embroidered scarf, an essential accessory in North Indian attire.').
item_value(dupatta, 15).
item_sell_value(dupatta, 8).
item_weight(dupatta, 0.3).
item_rarity(dupatta, common).
item_category(dupatta, clothing).
item_tradeable(dupatta).
item_possessable(dupatta).
item_tag(dupatta, clothing).
item_tag(dupatta, cultural).

%% Masala Dabba (Spice Box)
item(masala_dabba, 'Masala Dabba', tool).
item_description(masala_dabba, 'A round stainless steel spice box with seven compartments for haldi, jeera, dhania, mirch, hing, garam masala, and rai.').
item_value(masala_dabba, 12).
item_sell_value(masala_dabba, 6).
item_weight(masala_dabba, 1).
item_rarity(masala_dabba, common).
item_category(masala_dabba, food_drink).
item_tradeable(masala_dabba).
item_possessable(masala_dabba).
item_tag(masala_dabba, cooking).
item_tag(masala_dabba, cultural).

%% Paan
item(paan, 'Paan', consumable).
item_description(paan, 'A betel leaf preparation stuffed with areca nut, lime paste, and sweet fillings from Yadav Paan Bhandar.').
item_value(paan, 3).
item_sell_value(paan, 1).
item_weight(paan, 0.1).
item_rarity(paan, common).
item_category(paan, food_drink).
item_stackable(paan).
item_tradeable(paan).
item_possessable(paan).
item_tag(paan, food).
item_tag(paan, cultural).

%% Hindi-English Dictionary
item(hindi_dictionary, 'Hindi-English Dictionary', tool).
item_description(hindi_dictionary, 'A compact pocket dictionary for quick Hindi word lookups in Devanagari and Roman script.').
item_value(hindi_dictionary, 15).
item_sell_value(hindi_dictionary, 7).
item_weight(hindi_dictionary, 0.6).
item_rarity(hindi_dictionary, common).
item_category(hindi_dictionary, education).
item_tradeable(hindi_dictionary).
item_possessable(hindi_dictionary).
item_tag(hindi_dictionary, education).
item_tag(hindi_dictionary, language).

%% Marigold Garland (Genda Phool Mala)
item(marigold_garland, 'Genda Phool Mala', consumable).
item_description(marigold_garland, 'A bright orange marigold garland used for puja offerings and festive decorations.').
item_value(marigold_garland, 5).
item_sell_value(marigold_garland, 2).
item_weight(marigold_garland, 0.2).
item_rarity(marigold_garland, common).
item_category(marigold_garland, accessory).
item_stackable(marigold_garland).
item_tradeable(marigold_garland).
item_possessable(marigold_garland).
item_tag(marigold_garland, cultural).
item_tag(marigold_garland, religious).

%% Bollywood Film Ticket
item(bollywood_ticket, 'Bollywood Film Ticket', consumable).
item_description(bollywood_ticket, 'A ticket to the latest Bollywood blockbuster at Raj Cinema Hall.').
item_value(bollywood_ticket, 5).
item_sell_value(bollywood_ticket, 0).
item_weight(bollywood_ticket, 0).
item_rarity(bollywood_ticket, common).
item_category(bollywood_ticket, entertainment).
item_stackable(bollywood_ticket).
item_tradeable(bollywood_ticket).
item_possessable(bollywood_ticket).
item_tag(bollywood_ticket, entertainment).
item_tag(bollywood_ticket, cultural).

%% Tabla Drums
item(tabla, 'Tabla', tool).
item_description(tabla, 'A pair of traditional Indian hand drums used in classical and Bollywood music.').
item_value(tabla, 50).
item_sell_value(tabla, 25).
item_weight(tabla, 4).
item_rarity(tabla, uncommon).
item_category(tabla, entertainment).
item_tradeable(tabla).
item_possessable(tabla).
item_tag(tabla, cultural).
item_tag(tabla, music).

%% Notebook
item(notebook_hi, 'Notebook', tool).
item_description(notebook_hi, 'A lined notebook with Devanagari practice grids for handwriting from left to right.').
item_value(notebook_hi, 3).
item_sell_value(notebook_hi, 1).
item_weight(notebook_hi, 0.3).
item_rarity(notebook_hi, common).
item_category(notebook_hi, education).
item_stackable(notebook_hi).
item_tradeable(notebook_hi).
item_possessable(notebook_hi).
item_tag(notebook_hi, education).
item_tag(notebook_hi, writing).

%% Kurta Pajama
item(kurta_pajama, 'Kurta Pajama', equipment).
item_description(kurta_pajama, 'A comfortable cotton kurta pajama set, traditional daily wear for men in North India.').
item_value(kurta_pajama, 20).
item_sell_value(kurta_pajama, 10).
item_weight(kurta_pajama, 0.5).
item_rarity(kurta_pajama, common).
item_category(kurta_pajama, clothing).
item_tradeable(kurta_pajama).
item_possessable(kurta_pajama).
item_tag(kurta_pajama, clothing).
item_tag(kurta_pajama, cultural).

%% Brass Diya (Oil Lamp)
item(brass_diya, 'Brass Diya', accessory).
item_description(brass_diya, 'A traditional brass oil lamp lit during puja and Diwali celebrations.').
item_value(brass_diya, 8).
item_sell_value(brass_diya, 4).
item_weight(brass_diya, 0.3).
item_rarity(brass_diya, common).
item_category(brass_diya, accessory).
item_tradeable(brass_diya).
item_possessable(brass_diya).
item_tag(brass_diya, cultural).
item_tag(brass_diya, religious).

%% Paratha
item(paratha, 'Paratha', consumable).
item_description(paratha, 'A flaky, pan-fried whole wheat flatbread served with butter and pickle from Pandey Ji Ka Dhaba.').
item_value(paratha, 4).
item_sell_value(paratha, 2).
item_weight(paratha, 0.4).
item_rarity(paratha, common).
item_category(paratha, food_drink).
item_stackable(paratha).
item_tradeable(paratha).
item_possessable(paratha).
item_tag(paratha, food).

%% Bangle Set
item(bangle_set, 'Bangle Set', accessory).
item_description(bangle_set, 'A set of colorful glass bangles (choodiyan), a traditional adornment for women.').
item_value(bangle_set, 10).
item_sell_value(bangle_set, 5).
item_weight(bangle_set, 0.2).
item_rarity(bangle_set, common).
item_category(bangle_set, accessory).
item_tradeable(bangle_set).
item_possessable(bangle_set).
item_tag(bangle_set, cultural).
item_tag(bangle_set, jewelry).

%% Incense (Agarbatti)
item(agarbatti, 'Agarbatti', consumable).
item_description(agarbatti, 'Fragrant incense sticks used in daily puja and to freshen the home.').
item_value(agarbatti, 2).
item_sell_value(agarbatti, 1).
item_weight(agarbatti, 0.1).
item_rarity(agarbatti, common).
item_category(agarbatti, accessory).
item_stackable(agarbatti).
item_tradeable(agarbatti).
item_possessable(agarbatti).
item_tag(agarbatti, cultural).
item_tag(agarbatti, religious).

%% Lassi
item(lassi, 'Lassi', consumable).
item_description(lassi, 'A thick, creamy yogurt drink served sweet or salted, a refreshing North Indian staple.').
item_value(lassi, 3).
item_sell_value(lassi, 1).
item_weight(lassi, 0.4).
item_rarity(lassi, common).
item_category(lassi, food_drink).
item_stackable(lassi).
item_tradeable(lassi).
item_possessable(lassi).
item_tag(lassi, beverage).
item_tag(lassi, cultural).

%% Carrom Board
item(carrom_board, 'Carrom Board', tool).
item_description(carrom_board, 'A wooden carrom board with striker and coins, a favorite indoor game across India.').
item_value(carrom_board, 25).
item_sell_value(carrom_board, 12).
item_weight(carrom_board, 3).
item_rarity(carrom_board, common).
item_category(carrom_board, entertainment).
item_tradeable(carrom_board).
item_possessable(carrom_board).
item_tag(carrom_board, social).
item_tag(carrom_board, cultural).
