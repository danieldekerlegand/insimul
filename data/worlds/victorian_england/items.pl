%% Insimul Items: Victorian England
%% Source: data/worlds/victorian_england/items.pl
%% Created: 2026-04-03
%% Total: 18 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Top Hat
item(top_hat, 'Top Hat', equipment).
item_description(top_hat, 'A tall silk top hat, the mark of a gentleman. Essential for social calls and public appearances in polite society.').
item_value(top_hat, 30).
item_sell_value(top_hat, 15).
item_weight(top_hat, 0.5).
item_rarity(top_hat, common).
item_category(top_hat, clothing).
item_tradeable(top_hat).
item_possessable(top_hat).
item_tag(top_hat, clothing).
item_tag(top_hat, social_status).

%% Pocket Watch
item(pocket_watch, 'Pocket Watch', equipment).
item_description(pocket_watch, 'A fine brass pocket watch on a chain. Keeps precise time and signals respectability to those who notice.').
item_value(pocket_watch, 50).
item_sell_value(pocket_watch, 25).
item_weight(pocket_watch, 0.2).
item_rarity(pocket_watch, common).
item_category(pocket_watch, accessory).
item_tradeable(pocket_watch).
item_possessable(pocket_watch).
item_tag(pocket_watch, accessory).
item_tag(pocket_watch, social_status).

%% Walking Cane
item(walking_cane, 'Walking Cane', equipment).
item_description(walking_cane, 'A polished mahogany walking cane with a silver handle. Both a fashion statement and a practical defense tool on dark streets.').
item_value(walking_cane, 40).
item_sell_value(walking_cane, 20).
item_weight(walking_cane, 1.5).
item_rarity(walking_cane, common).
item_category(walking_cane, accessory).
item_tradeable(walking_cane).
item_possessable(walking_cane).
item_tag(walking_cane, accessory).
item_tag(walking_cane, weapon).

%% Oil Lantern
item(oil_lantern, 'Oil Lantern', tool).
item_description(oil_lantern, 'A portable brass lantern fueled by whale oil. Cuts through the thick London fog and illuminates dark alleys.').
item_value(oil_lantern, 10).
item_sell_value(oil_lantern, 5).
item_weight(oil_lantern, 1).
item_rarity(oil_lantern, common).
item_category(oil_lantern, tool).
item_tradeable(oil_lantern).
item_possessable(oil_lantern).
item_tag(oil_lantern, tool).
item_tag(oil_lantern, exploration).

%% Newspaper (Daily Telegraph)
item(daily_telegraph, 'Daily Telegraph', consumable).
item_description(daily_telegraph, 'The morning edition of the Daily Telegraph. Contains news of Parliament, empire, crime, and society gossip.').
item_value(daily_telegraph, 1).
item_sell_value(daily_telegraph, 0).
item_weight(daily_telegraph, 0.2).
item_rarity(daily_telegraph, common).
item_category(daily_telegraph, reading_material).
item_stackable(daily_telegraph).
item_tradeable(daily_telegraph).
item_possessable(daily_telegraph).
item_tag(daily_telegraph, information).
item_tag(daily_telegraph, news).

%% Calling Card
item(calling_card, 'Calling Card', consumable).
item_description(calling_card, 'An engraved card bearing name and address. Leaving one at a residence is the proper way to request a social visit.').
item_value(calling_card, 2).
item_sell_value(calling_card, 0).
item_weight(calling_card, 0.01).
item_rarity(calling_card, common).
item_category(calling_card, social).
item_stackable(calling_card).
item_tradeable(calling_card).
item_possessable(calling_card).
item_tag(calling_card, social).
item_tag(calling_card, etiquette).

%% Laudanum Tincture
item(laudanum, 'Laudanum Tincture', consumable).
item_description(laudanum, 'A small brown bottle of opium dissolved in alcohol. Widely used as medicine for pain, cough, and sleeplessness. Highly addictive.').
item_value(laudanum, 5).
item_sell_value(laudanum, 2).
item_weight(laudanum, 0.2).
item_rarity(laudanum, common).
item_category(laudanum, medicine).
item_stackable(laudanum).
item_tradeable(laudanum).
item_possessable(laudanum).
item_tag(laudanum, medicine).
item_tag(laudanum, dangerous).

%% Steam Engine Schematic
item(steam_schematic, 'Steam Engine Schematic', quest_item).
item_description(steam_schematic, 'Detailed engineering drawings for an improved steam engine design. Could revolutionize textile production or railway transport.').
item_value(steam_schematic, 500).
item_sell_value(steam_schematic, 0).
item_weight(steam_schematic, 0.5).
item_rarity(steam_schematic, rare).
item_category(steam_schematic, blueprint).
item_possessable(steam_schematic).
item_tag(steam_schematic, quest).
item_tag(steam_schematic, invention).

%% Pound Sterling (Coin Purse)
item(coin_purse, 'Coin Purse', tool).
item_description(coin_purse, 'A leather purse containing assorted coins: sovereigns, half-crowns, shillings, and pennies. The currency of the British Empire.').
item_value(coin_purse, 20).
item_sell_value(coin_purse, 20).
item_weight(coin_purse, 0.3).
item_rarity(coin_purse, common).
item_category(coin_purse, currency).
item_tradeable(coin_purse).
item_possessable(coin_purse).
item_tag(coin_purse, currency).
item_tag(coin_purse, trade).

%% Parasol
item(parasol, 'Parasol', equipment).
item_description(parasol, 'A lace-trimmed parasol for shading a lady from the sun. Also serves as a social signaling device in the parks of London.').
item_value(parasol, 15).
item_sell_value(parasol, 7).
item_weight(parasol, 0.8).
item_rarity(parasol, common).
item_category(parasol, accessory).
item_tradeable(parasol).
item_possessable(parasol).
item_tag(parasol, accessory).
item_tag(parasol, social_status).

%% Magnifying Glass
item(magnifying_glass, 'Magnifying Glass', tool).
item_description(magnifying_glass, 'A high-quality optical lens in a brass frame. Invaluable for examining clues, reading fine print, and scientific inspection.').
item_value(magnifying_glass, 25).
item_sell_value(magnifying_glass, 12).
item_weight(magnifying_glass, 0.3).
item_rarity(magnifying_glass, uncommon).
item_category(magnifying_glass, tool).
item_tradeable(magnifying_glass).
item_possessable(magnifying_glass).
item_tag(magnifying_glass, investigation).
item_tag(magnifying_glass, tool).

%% Revolver (Webley)
item(webley_revolver, 'Webley Revolver', weapon).
item_description(webley_revolver, 'A .455 caliber Webley service revolver. Standard issue for military officers and occasionally carried by civilians in dangerous areas.').
item_value(webley_revolver, 200).
item_sell_value(webley_revolver, 100).
item_weight(webley_revolver, 1.5).
item_rarity(webley_revolver, uncommon).
item_category(webley_revolver, weapon).
item_tradeable(webley_revolver).
item_possessable(webley_revolver).
item_tag(webley_revolver, weapon).
item_tag(webley_revolver, military).

%% Railway Ticket
item(railway_ticket, 'Railway Ticket', consumable).
item_description(railway_ticket, 'A printed cardboard ticket for passage on the railway between London and Manchester. First, second, or third class.').
item_value(railway_ticket, 5).
item_sell_value(railway_ticket, 2).
item_weight(railway_ticket, 0.01).
item_rarity(railway_ticket, common).
item_category(railway_ticket, transport).
item_stackable(railway_ticket).
item_tradeable(railway_ticket).
item_possessable(railway_ticket).
item_tag(railway_ticket, transport).
item_tag(railway_ticket, travel).

%% Letter of Introduction
item(letter_of_introduction, 'Letter of Introduction', quest_item).
item_description(letter_of_introduction, 'A sealed letter from a person of standing, introducing the bearer to another party. Opens doors in high society.').
item_value(letter_of_introduction, 0).
item_sell_value(letter_of_introduction, 0).
item_weight(letter_of_introduction, 0.05).
item_rarity(letter_of_introduction, uncommon).
item_category(letter_of_introduction, social).
item_possessable(letter_of_introduction).
item_tag(letter_of_introduction, social).
item_tag(letter_of_introduction, quest).

%% Tea Set (Bone China)
item(bone_china_tea_set, 'Bone China Tea Set', tool).
item_description(bone_china_tea_set, 'A delicate bone china tea service for afternoon tea. The centerpiece of civilized social gatherings.').
item_value(bone_china_tea_set, 60).
item_sell_value(bone_china_tea_set, 30).
item_weight(bone_china_tea_set, 3).
item_rarity(bone_china_tea_set, uncommon).
item_category(bone_china_tea_set, household).
item_tradeable(bone_china_tea_set).
item_possessable(bone_china_tea_set).
item_tag(bone_china_tea_set, social).
item_tag(bone_china_tea_set, cultural).

%% Smelling Salts
item(smelling_salts, 'Smelling Salts', consumable).
item_description(smelling_salts, 'A small vial of ammonium carbonate. Used to revive those who have fainted, a common occurrence in tightly corseted society.').
item_value(smelling_salts, 3).
item_sell_value(smelling_salts, 1).
item_weight(smelling_salts, 0.1).
item_rarity(smelling_salts, common).
item_category(smelling_salts, medicine).
item_stackable(smelling_salts).
item_tradeable(smelling_salts).
item_possessable(smelling_salts).
item_tag(smelling_salts, medicine).
item_tag(smelling_salts, social).

%% Factory Ledger
item(factory_ledger, 'Factory Ledger', quest_item).
item_description(factory_ledger, 'A bound accounting ledger from the Dickens Textile Mill. Contains records of wages, hours, and worker conditions.').
item_value(factory_ledger, 0).
item_sell_value(factory_ledger, 0).
item_weight(factory_ledger, 2).
item_rarity(factory_ledger, rare).
item_category(factory_ledger, document).
item_possessable(factory_ledger).
item_tag(factory_ledger, quest).
item_tag(factory_ledger, evidence).

%% Penny Dreadful
item(penny_dreadful, 'Penny Dreadful', consumable).
item_description(penny_dreadful, 'A cheaply printed serial story full of lurid tales of crime, horror, and adventure. Popular entertainment among the working class.').
item_value(penny_dreadful, 1).
item_sell_value(penny_dreadful, 0).
item_weight(penny_dreadful, 0.1).
item_rarity(penny_dreadful, common).
item_category(penny_dreadful, reading_material).
item_stackable(penny_dreadful).
item_tradeable(penny_dreadful).
item_possessable(penny_dreadful).
item_tag(penny_dreadful, entertainment).
item_tag(penny_dreadful, literature).
