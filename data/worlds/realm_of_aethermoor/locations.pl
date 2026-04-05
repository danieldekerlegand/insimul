%% Insimul Locations (Lots): Realm of Aethermoor
%% Source: data/worlds/realm_of_aethermoor/locations.pl
%% Created: 2026-04-03
%% Total: 28 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% ═══════════════════════════════════════════════════════════
%% Aethoria City Locations
%% ═══════════════════════════════════════════════════════════

%% 1 Aether Way -- The Grand Aether Well
lot(lot_ae_1, '1 Aether Way', human_capital).
lot_type(lot_ae_1, buildable).
lot_district(lot_ae_1, royal_quarter).
lot_street(lot_ae_1, aether_way).
lot_side(lot_ae_1, left).
lot_house_number(lot_ae_1, 1).
building(lot_ae_1, civic, aether_well).
business(lot_ae_1, 'The Grand Aether Well', aether_well).
business_founded(lot_ae_1, 800).

%% 5 Aether Way -- Royal Palace
lot(lot_ae_2, '5 Aether Way', human_capital).
lot_type(lot_ae_2, buildable).
lot_district(lot_ae_2, royal_quarter).
lot_street(lot_ae_2, aether_way).
lot_side(lot_ae_2, right).
lot_house_number(lot_ae_2, 5).
building(lot_ae_2, civic, palace).

%% 12 Aether Way -- Crystal Spire of Divination
lot(lot_ae_3, '12 Aether Way', human_capital).
lot_type(lot_ae_3, buildable).
lot_district(lot_ae_3, royal_quarter).
lot_street(lot_ae_3, aether_way).
lot_side(lot_ae_3, left).
lot_house_number(lot_ae_3, 12).
building(lot_ae_3, civic, crystal_spire).
business(lot_ae_3, 'Spire of Divination', crystal_spire).
business_founded(lot_ae_3, 820).

%% 20 Aether Way -- Residence (Noble House)
lot(lot_ae_4, '20 Aether Way', human_capital).
lot_type(lot_ae_4, buildable).
lot_district(lot_ae_4, royal_quarter).
lot_street(lot_ae_4, aether_way).
lot_side(lot_ae_4, right).
lot_house_number(lot_ae_4, 20).
building(lot_ae_4, residence, manor).

%% 3 Warding Lane -- Warding Stone Circle
lot(lot_ae_5, '3 Warding Lane', human_capital).
lot_type(lot_ae_5, buildable).
lot_district(lot_ae_5, arcane_district).
lot_street(lot_ae_5, warding_lane).
lot_side(lot_ae_5, left).
lot_house_number(lot_ae_5, 3).
building(lot_ae_5, civic, warding_circle).
business(lot_ae_5, 'The Warding Circle', warding_circle).
business_founded(lot_ae_5, 850).

%% 10 Warding Lane -- Arcane Library of Aethoria
lot(lot_ae_6, '10 Warding Lane', human_capital).
lot_type(lot_ae_6, buildable).
lot_district(lot_ae_6, arcane_district).
lot_street(lot_ae_6, warding_lane).
lot_side(lot_ae_6, right).
lot_house_number(lot_ae_6, 10).
building(lot_ae_6, civic, library).
business(lot_ae_6, 'Arcane Library of Aethoria', library).
business_founded(lot_ae_6, 830).

%% 18 Warding Lane -- Enchantment Workshop
lot(lot_ae_7, '18 Warding Lane', human_capital).
lot_type(lot_ae_7, buildable).
lot_district(lot_ae_7, arcane_district).
lot_street(lot_ae_7, warding_lane).
lot_side(lot_ae_7, left).
lot_house_number(lot_ae_7, 18).
building(lot_ae_7, business, workshop).
business(lot_ae_7, 'Runewright Enchantments', workshop).
business_founded(lot_ae_7, 960).

%% 25 Warding Lane -- Potion Apothecary
lot(lot_ae_8, '25 Warding Lane', human_capital).
lot_type(lot_ae_8, buildable).
lot_district(lot_ae_8, arcane_district).
lot_street(lot_ae_8, warding_lane).
lot_side(lot_ae_8, right).
lot_house_number(lot_ae_8, 25).
building(lot_ae_8, business, apothecary).
business(lot_ae_8, 'The Shimmering Vial', apothecary).
business_founded(lot_ae_8, 975).

%% 5 Market Row -- The Enchanted Market
lot(lot_ae_9, '5 Market Row', human_capital).
lot_type(lot_ae_9, buildable).
lot_district(lot_ae_9, market_quarter).
lot_street(lot_ae_9, market_row).
lot_side(lot_ae_9, left).
lot_house_number(lot_ae_9, 5).
building(lot_ae_9, business, market).
business(lot_ae_9, 'The Enchanted Market', market).
business_founded(lot_ae_9, 900).

%% 12 Market Row -- Grimoire Bookseller
lot(lot_ae_10, '12 Market Row', human_capital).
lot_type(lot_ae_10, buildable).
lot_district(lot_ae_10, market_quarter).
lot_street(lot_ae_10, market_row).
lot_side(lot_ae_10, right).
lot_house_number(lot_ae_10, 12).
building(lot_ae_10, business, bookstore).
business(lot_ae_10, 'Tomes and Scrolls', bookstore).
business_founded(lot_ae_10, 945).

%% 20 Market Row -- Runic Weaponsmith
lot(lot_ae_11, '20 Market Row', human_capital).
lot_type(lot_ae_11, buildable).
lot_district(lot_ae_11, market_quarter).
lot_street(lot_ae_11, market_row).
lot_side(lot_ae_11, left).
lot_house_number(lot_ae_11, 20).
building(lot_ae_11, business, smithy).
business(lot_ae_11, 'Stormforge Arms', smithy).
business_founded(lot_ae_11, 955).

%% 28 Market Row -- Tavern
lot(lot_ae_12, '28 Market Row', human_capital).
lot_type(lot_ae_12, buildable).
lot_district(lot_ae_12, market_quarter).
lot_street(lot_ae_12, market_row).
lot_side(lot_ae_12, right).
lot_house_number(lot_ae_12, 28).
building(lot_ae_12, business, tavern).
business(lot_ae_12, 'The Gilded Goblet', tavern).
business_founded(lot_ae_12, 920).

%% 35 Market Row -- Residence
lot(lot_ae_13, '35 Market Row', human_capital).
lot_type(lot_ae_13, buildable).
lot_district(lot_ae_13, market_quarter).
lot_street(lot_ae_13, market_row).
lot_side(lot_ae_13, left).
lot_house_number(lot_ae_13, 35).
building(lot_ae_13, residence, house).

%% ═══════════════════════════════════════════════════════════
%% Silverwood Grove Locations
%% ═══════════════════════════════════════════════════════════

%% 1 Moonrise Path -- The Moonwell
lot(lot_ae_14, '1 Moonrise Path', elvish_forest).
lot_type(lot_ae_14, buildable).
lot_district(lot_ae_14, heartwood).
lot_street(lot_ae_14, moonrise_path).
lot_side(lot_ae_14, left).
lot_house_number(lot_ae_14, 1).
building(lot_ae_14, civic, aether_well).
business(lot_ae_14, 'The Moonwell', aether_well).
business_founded(lot_ae_14, 500).

%% 8 Moonrise Path -- Elven Council Hall
lot(lot_ae_15, '8 Moonrise Path', elvish_forest).
lot_type(lot_ae_15, buildable).
lot_district(lot_ae_15, heartwood).
lot_street(lot_ae_15, moonrise_path).
lot_side(lot_ae_15, right).
lot_house_number(lot_ae_15, 8).
building(lot_ae_15, civic, council_hall).

%% 15 Moonrise Path -- Shadow Grove
lot(lot_ae_16, '15 Moonrise Path', elvish_forest).
lot_type(lot_ae_16, buildable).
lot_district(lot_ae_16, heartwood).
lot_street(lot_ae_16, moonrise_path).
lot_side(lot_ae_16, left).
lot_house_number(lot_ae_16, 15).
building(lot_ae_16, civic, shadow_grove).
business(lot_ae_16, 'The Whispering Grove', shadow_grove).
business_founded(lot_ae_16, 520).

%% 22 Moonrise Path -- Herbalist Den
lot(lot_ae_17, '22 Moonrise Path', elvish_forest).
lot_type(lot_ae_17, buildable).
lot_district(lot_ae_17, heartwood).
lot_street(lot_ae_17, moonrise_path).
lot_side(lot_ae_17, right).
lot_house_number(lot_ae_17, 22).
building(lot_ae_17, business, apothecary).
business(lot_ae_17, 'Starbloom Remedies', apothecary).
business_founded(lot_ae_17, 600).

%% 30 Moonrise Path -- Crystal Spire of Foresight
lot(lot_ae_18, '30 Moonrise Path', elvish_forest).
lot_type(lot_ae_18, buildable).
lot_district(lot_ae_18, heartwood).
lot_street(lot_ae_18, moonrise_path).
lot_side(lot_ae_18, left).
lot_house_number(lot_ae_18, 30).
building(lot_ae_18, civic, crystal_spire).
business(lot_ae_18, 'Spire of Foresight', crystal_spire).
business_founded(lot_ae_18, 510).

%% 5 Starleaf Trail -- Elven Residence
lot(lot_ae_19, '5 Starleaf Trail', elvish_forest).
lot_type(lot_ae_19, buildable).
lot_district(lot_ae_19, canopy_homes).
lot_street(lot_ae_19, starleaf_trail).
lot_side(lot_ae_19, left).
lot_house_number(lot_ae_19, 5).
building(lot_ae_19, residence, treehouse).

%% 12 Starleaf Trail -- Elven Archery Range
lot(lot_ae_20, '12 Starleaf Trail', elvish_forest).
lot_type(lot_ae_20, buildable).
lot_district(lot_ae_20, canopy_homes).
lot_street(lot_ae_20, starleaf_trail).
lot_side(lot_ae_20, right).
lot_house_number(lot_ae_20, 12).
building(lot_ae_20, business, training_ground).
business(lot_ae_20, 'Greenleaf Archery Range', training_ground).
business_founded(lot_ae_20, 710).

%% ═══════════════════════════════════════════════════════════
%% Ironpeak Hold Locations
%% ═══════════════════════════════════════════════════════════

%% 1 Deepforge Road -- The Magma Well
lot(lot_ae_21, '1 Deepforge Road', dwarven_hold).
lot_type(lot_ae_21, buildable).
lot_district(lot_ae_21, deep_halls).
lot_street(lot_ae_21, deepforge_road).
lot_side(lot_ae_21, left).
lot_house_number(lot_ae_21, 1).
building(lot_ae_21, civic, aether_well).
business(lot_ae_21, 'The Magma Well', aether_well).
business_founded(lot_ae_21, 880).

%% 8 Deepforge Road -- The Great Forge
lot(lot_ae_22, '8 Deepforge Road', dwarven_hold).
lot_type(lot_ae_22, buildable).
lot_district(lot_ae_22, deep_halls).
lot_street(lot_ae_22, deepforge_road).
lot_side(lot_ae_22, right).
lot_house_number(lot_ae_22, 8).
building(lot_ae_22, business, smithy).
business(lot_ae_22, 'The Great Forge', smithy).
business_founded(lot_ae_22, 890).

%% 15 Deepforge Road -- Gem Cutter
lot(lot_ae_23, '15 Deepforge Road', dwarven_hold).
lot_type(lot_ae_23, buildable).
lot_district(lot_ae_23, deep_halls).
lot_street(lot_ae_23, deepforge_road).
lot_side(lot_ae_23, left).
lot_house_number(lot_ae_23, 15).
building(lot_ae_23, business, workshop).
business(lot_ae_23, 'Ironbeard Gem Works', workshop).
business_founded(lot_ae_23, 940).

%% 22 Deepforge Road -- Dwarven Tavern
lot(lot_ae_24, '22 Deepforge Road', dwarven_hold).
lot_type(lot_ae_24, buildable).
lot_district(lot_ae_24, deep_halls).
lot_street(lot_ae_24, deepforge_road).
lot_side(lot_ae_24, right).
lot_house_number(lot_ae_24, 22).
building(lot_ae_24, business, tavern).
business(lot_ae_24, 'The Stone Tankard', tavern).
business_founded(lot_ae_24, 910).

%% 30 Deepforge Road -- Residence
lot(lot_ae_25, '30 Deepforge Road', dwarven_hold).
lot_type(lot_ae_25, buildable).
lot_district(lot_ae_25, deep_halls).
lot_street(lot_ae_25, deepforge_road).
lot_side(lot_ae_25, left).
lot_house_number(lot_ae_25, 30).
building(lot_ae_25, residence, cavern_home).

%% ═══════════════════════════════════════════════════════════
%% Crossroads Haven Locations
%% ═══════════════════════════════════════════════════════════

%% 1 Traders Way -- The Crossroads Aether Well
lot(lot_ae_26, '1 Traders Way', mixed_town).
lot_type(lot_ae_26, buildable).
lot_district(lot_ae_26, town_center).
lot_street(lot_ae_26, traders_way).
lot_side(lot_ae_26, left).
lot_house_number(lot_ae_26, 1).
building(lot_ae_26, civic, aether_well).
business(lot_ae_26, 'The Crossroads Well', aether_well).
business_founded(lot_ae_26, 970).

%% 8 Traders Way -- Mixed Market
lot(lot_ae_27, '8 Traders Way', mixed_town).
lot_type(lot_ae_27, buildable).
lot_district(lot_ae_27, town_center).
lot_street(lot_ae_27, traders_way).
lot_side(lot_ae_27, right).
lot_house_number(lot_ae_27, 8).
building(lot_ae_27, business, market).
business(lot_ae_27, 'Haven Market', market).
business_founded(lot_ae_27, 975).

%% 15 Traders Way -- Adventurer Guild Hall
lot(lot_ae_28, '15 Traders Way', mixed_town).
lot_type(lot_ae_28, buildable).
lot_district(lot_ae_28, town_center).
lot_street(lot_ae_28, traders_way).
lot_side(lot_ae_28, left).
lot_house_number(lot_ae_28, 15).
building(lot_ae_28, civic, guild_hall).
business(lot_ae_28, 'Adventurer Guild Hall', guild_hall).
business_founded(lot_ae_28, 980).
