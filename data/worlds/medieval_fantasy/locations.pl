%% Insimul Locations (Lots): Medieval Fantasy
%% Source: data/worlds/medieval_fantasy/locations.pl
%% Created: 2026-04-03
%% Total: 30 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% ═══════════════════════════════════════════════════════════
%% Aldenmere -- Castle Ward
%% ═══════════════════════════════════════════════════════════

%% 1 Kings Road -- Valdris Castle Keep
lot(lot_mf_1, '1 Kings Road', aldenmere).
lot_type(lot_mf_1, buildable).
lot_district(lot_mf_1, castle_ward).
lot_street(lot_mf_1, kings_road).
lot_side(lot_mf_1, left).
lot_house_number(lot_mf_1, 1).
building(lot_mf_1, civic, castle).

%% 5 Kings Road -- Royal Barracks
lot(lot_mf_2, '5 Kings Road', aldenmere).
lot_type(lot_mf_2, buildable).
lot_district(lot_mf_2, castle_ward).
lot_street(lot_mf_2, kings_road).
lot_side(lot_mf_2, right).
lot_house_number(lot_mf_2, 5).
building(lot_mf_2, military, barracks).

%% 10 Kings Road -- Court Residence
lot(lot_mf_3, '10 Kings Road', aldenmere).
lot_type(lot_mf_3, buildable).
lot_district(lot_mf_3, castle_ward).
lot_street(lot_mf_3, kings_road).
lot_side(lot_mf_3, left).
lot_house_number(lot_mf_3, 10).
building(lot_mf_3, residence, manor).

%% 3 Shield Lane -- Armory
lot(lot_mf_4, '3 Shield Lane', aldenmere).
lot_type(lot_mf_4, buildable).
lot_district(lot_mf_4, castle_ward).
lot_street(lot_mf_4, shield_lane).
lot_side(lot_mf_4, left).
lot_house_number(lot_mf_4, 3).
building(lot_mf_4, business, armory).
business(lot_mf_4, 'Royal Armory', armory).
business_founded(lot_mf_4, 415).

%% 8 Shield Lane -- Wizard Tower
lot(lot_mf_5, '8 Shield Lane', aldenmere).
lot_type(lot_mf_5, buildable).
lot_district(lot_mf_5, castle_ward).
lot_street(lot_mf_5, shield_lane).
lot_side(lot_mf_5, right).
lot_house_number(lot_mf_5, 8).
building(lot_mf_5, civic, tower).

%% ═══════════════════════════════════════════════════════════
%% Aldenmere -- Merchants Quarter
%% ═══════════════════════════════════════════════════════════

%% 2 Market Street -- General Goods
lot(lot_mf_6, '2 Market Street', aldenmere).
lot_type(lot_mf_6, buildable).
lot_district(lot_mf_6, merchants_quarter).
lot_street(lot_mf_6, market_street).
lot_side(lot_mf_6, left).
lot_house_number(lot_mf_6, 2).
building(lot_mf_6, business, shop).
business(lot_mf_6, 'Barrin General Goods', shop).
business_founded(lot_mf_6, 510).

%% 7 Market Street -- Tavern
lot(lot_mf_7, '7 Market Street', aldenmere).
lot_type(lot_mf_7, buildable).
lot_district(lot_mf_7, merchants_quarter).
lot_street(lot_mf_7, market_street).
lot_side(lot_mf_7, right).
lot_house_number(lot_mf_7, 7).
building(lot_mf_7, business, tavern).
business(lot_mf_7, 'The Gilded Flagon', tavern).
business_founded(lot_mf_7, 525).

%% 12 Market Street -- Alchemist Shop
lot(lot_mf_8, '12 Market Street', aldenmere).
lot_type(lot_mf_8, buildable).
lot_district(lot_mf_8, merchants_quarter).
lot_street(lot_mf_8, market_street).
lot_side(lot_mf_8, left).
lot_house_number(lot_mf_8, 12).
building(lot_mf_8, business, apothecary).
business(lot_mf_8, 'Mirabel Apothecary', apothecary).
business_founded(lot_mf_8, 590).

%% 18 Market Street -- Blacksmith
lot(lot_mf_9, '18 Market Street', aldenmere).
lot_type(lot_mf_9, buildable).
lot_district(lot_mf_9, merchants_quarter).
lot_street(lot_mf_9, market_street).
lot_side(lot_mf_9, right).
lot_house_number(lot_mf_9, 18).
building(lot_mf_9, business, smithy).
business(lot_mf_9, 'Ironhand Forge', smithy).
business_founded(lot_mf_9, 465).

%% 24 Market Street -- Jeweler
lot(lot_mf_10, '24 Market Street', aldenmere).
lot_type(lot_mf_10, buildable).
lot_district(lot_mf_10, merchants_quarter).
lot_street(lot_mf_10, market_street).
lot_side(lot_mf_10, left).
lot_house_number(lot_mf_10, 24).
building(lot_mf_10, business, shop).
business(lot_mf_10, 'Glimmer and Stone', shop).
business_founded(lot_mf_10, 620).

%% 4 Guild Row -- Mages Guild Hall
lot(lot_mf_11, '4 Guild Row', aldenmere).
lot_type(lot_mf_11, buildable).
lot_district(lot_mf_11, merchants_quarter).
lot_street(lot_mf_11, guild_row).
lot_side(lot_mf_11, left).
lot_house_number(lot_mf_11, 4).
building(lot_mf_11, civic, guild_hall).

%% 10 Guild Row -- Merchant Residence
lot(lot_mf_12, '10 Guild Row', aldenmere).
lot_type(lot_mf_12, buildable).
lot_district(lot_mf_12, merchants_quarter).
lot_street(lot_mf_12, guild_row).
lot_side(lot_mf_12, right).
lot_house_number(lot_mf_12, 10).
building(lot_mf_12, residence, townhouse).

%% 16 Guild Row -- Cartographer
lot(lot_mf_13, '16 Guild Row', aldenmere).
lot_type(lot_mf_13, buildable).
lot_district(lot_mf_13, merchants_quarter).
lot_street(lot_mf_13, guild_row).
lot_side(lot_mf_13, left).
lot_house_number(lot_mf_13, 16).
building(lot_mf_13, business, workshop).
business(lot_mf_13, 'Maps and Charts', workshop).
business_founded(lot_mf_13, 580).

%% ═══════════════════════════════════════════════════════════
%% Aldenmere -- The Commons
%% ═══════════════════════════════════════════════════════════

%% 3 Muddlers Alley -- Thieves Den (hidden)
lot(lot_mf_14, '3 Muddlers Alley', aldenmere).
lot_type(lot_mf_14, buildable).
lot_district(lot_mf_14, commons).
lot_street(lot_mf_14, muddlers_alley).
lot_side(lot_mf_14, left).
lot_house_number(lot_mf_14, 3).
building(lot_mf_14, business, tavern).
business(lot_mf_14, 'The Rusty Nail', tavern).
business_founded(lot_mf_14, 640).

%% 9 Muddlers Alley -- Residence
lot(lot_mf_15, '9 Muddlers Alley', aldenmere).
lot_type(lot_mf_15, buildable).
lot_district(lot_mf_15, commons).
lot_street(lot_mf_15, muddlers_alley).
lot_side(lot_mf_15, right).
lot_house_number(lot_mf_15, 9).
building(lot_mf_15, residence, hovel).

%% 5 Tanner Lane -- Tannery
lot(lot_mf_16, '5 Tanner Lane', aldenmere).
lot_type(lot_mf_16, buildable).
lot_district(lot_mf_16, commons).
lot_street(lot_mf_16, tanner_lane).
lot_side(lot_mf_16, left).
lot_house_number(lot_mf_16, 5).
building(lot_mf_16, business, workshop).
business(lot_mf_16, 'Grubbs Tannery', workshop).
business_founded(lot_mf_16, 500).

%% 12 Tanner Lane -- Residence
lot(lot_mf_17, '12 Tanner Lane', aldenmere).
lot_type(lot_mf_17, buildable).
lot_district(lot_mf_17, commons).
lot_street(lot_mf_17, tanner_lane).
lot_side(lot_mf_17, right).
lot_house_number(lot_mf_17, 12).
building(lot_mf_17, residence, cottage).

%% ═══════════════════════════════════════════════════════════
%% Aldenmere -- Temple Hill
%% ═══════════════════════════════════════════════════════════

%% 1 Pilgrim Way -- Cathedral of Light
lot(lot_mf_18, '1 Pilgrim Way', aldenmere).
lot_type(lot_mf_18, buildable).
lot_district(lot_mf_18, temple_hill).
lot_street(lot_mf_18, pilgrim_way).
lot_side(lot_mf_18, left).
lot_house_number(lot_mf_18, 1).
building(lot_mf_18, civic, cathedral).

%% 8 Pilgrim Way -- Healing House
lot(lot_mf_19, '8 Pilgrim Way', aldenmere).
lot_type(lot_mf_19, buildable).
lot_district(lot_mf_19, temple_hill).
lot_street(lot_mf_19, pilgrim_way).
lot_side(lot_mf_19, right).
lot_house_number(lot_mf_19, 8).
building(lot_mf_19, civic, hospital).

%% 15 Pilgrim Way -- Scribe and Bookbinder
lot(lot_mf_20, '15 Pilgrim Way', aldenmere).
lot_type(lot_mf_20, buildable).
lot_district(lot_mf_20, temple_hill).
lot_street(lot_mf_20, pilgrim_way).
lot_side(lot_mf_20, left).
lot_house_number(lot_mf_20, 15).
building(lot_mf_20, business, bookstore).
business(lot_mf_20, 'Quills and Bindings', bookstore).
business_founded(lot_mf_20, 540).

%% ═══════════════════════════════════════════════════════════
%% Thornhaven -- Village Square
%% ═══════════════════════════════════════════════════════════

%% 1 Old Forest Road -- Village Inn
lot(lot_mf_21, '1 Old Forest Road', thornhaven).
lot_type(lot_mf_21, buildable).
lot_district(lot_mf_21, village_square).
lot_street(lot_mf_21, old_forest_road).
lot_side(lot_mf_21, left).
lot_house_number(lot_mf_21, 1).
building(lot_mf_21, business, inn).
business(lot_mf_21, 'The Thorny Rose', inn).
business_founded(lot_mf_21, 685).

%% 6 Old Forest Road -- Herbalist Cottage
lot(lot_mf_22, '6 Old Forest Road', thornhaven).
lot_type(lot_mf_22, buildable).
lot_district(lot_mf_22, village_square).
lot_street(lot_mf_22, old_forest_road).
lot_side(lot_mf_22, right).
lot_house_number(lot_mf_22, 6).
building(lot_mf_22, business, apothecary).
business(lot_mf_22, 'Elara Herbalist', apothecary).
business_founded(lot_mf_22, 700).

%% 12 Old Forest Road -- Village Chapel
lot(lot_mf_23, '12 Old Forest Road', thornhaven).
lot_type(lot_mf_23, buildable).
lot_district(lot_mf_23, village_square).
lot_street(lot_mf_23, old_forest_road).
lot_side(lot_mf_23, left).
lot_house_number(lot_mf_23, 12).
building(lot_mf_23, civic, chapel).

%% 18 Old Forest Road -- Residence
lot(lot_mf_24, '18 Old Forest Road', thornhaven).
lot_type(lot_mf_24, buildable).
lot_district(lot_mf_24, village_square).
lot_street(lot_mf_24, old_forest_road).
lot_side(lot_mf_24, right).
lot_house_number(lot_mf_24, 18).
building(lot_mf_24, residence, cottage).

%% ═══════════════════════════════════════════════════════════
%% Thornhaven -- Forest Edge
%% ═══════════════════════════════════════════════════════════

%% 2 Bramble Path -- Enchanted Glade (clearing)
lot(lot_mf_25, '2 Bramble Path', thornhaven).
lot_type(lot_mf_25, natural).
lot_district(lot_mf_25, forest_edge).
lot_street(lot_mf_25, bramble_path).
lot_side(lot_mf_25, left).
lot_house_number(lot_mf_25, 2).
building(lot_mf_25, natural, glade).

%% 8 Bramble Path -- Woodcutter Cabin
lot(lot_mf_26, '8 Bramble Path', thornhaven).
lot_type(lot_mf_26, buildable).
lot_district(lot_mf_26, forest_edge).
lot_street(lot_mf_26, bramble_path).
lot_side(lot_mf_26, right).
lot_house_number(lot_mf_26, 8).
building(lot_mf_26, residence, cabin).

%% ═══════════════════════════════════════════════════════════
%% Silverdeep -- Upper Shafts
%% ═══════════════════════════════════════════════════════════

%% 1 Ore Cart Road -- Mine Entrance
lot(lot_mf_27, '1 Ore Cart Road', silverdeep).
lot_type(lot_mf_27, buildable).
lot_district(lot_mf_27, upper_shafts).
lot_street(lot_mf_27, ore_cart_road).
lot_side(lot_mf_27, left).
lot_house_number(lot_mf_27, 1).
building(lot_mf_27, industrial, mine).

%% 7 Ore Cart Road -- Dragon Cave (abandoned shaft)
lot(lot_mf_28, '7 Ore Cart Road', silverdeep).
lot_type(lot_mf_28, natural).
lot_district(lot_mf_28, upper_shafts).
lot_street(lot_mf_28, ore_cart_road).
lot_side(lot_mf_28, right).
lot_house_number(lot_mf_28, 7).
building(lot_mf_28, natural, cave).

%% ═══════════════════════════════════════════════════════════
%% Silverdeep -- Forge District
%% ═══════════════════════════════════════════════════════════

%% 3 Anvil Street -- The Great Forge
lot(lot_mf_29, '3 Anvil Street', silverdeep).
lot_type(lot_mf_29, buildable).
lot_district(lot_mf_29, forge_district).
lot_street(lot_mf_29, anvil_street).
lot_side(lot_mf_29, left).
lot_house_number(lot_mf_29, 3).
building(lot_mf_29, business, smithy).
business(lot_mf_29, 'The Great Forge', smithy).
business_founded(lot_mf_29, 555).

%% 9 Anvil Street -- Gem Cutter
lot(lot_mf_30, '9 Anvil Street', silverdeep).
lot_type(lot_mf_30, buildable).
lot_district(lot_mf_30, forge_district).
lot_street(lot_mf_30, anvil_street).
lot_side(lot_mf_30, right).
lot_house_number(lot_mf_30, 9).
building(lot_mf_30, business, workshop).
business(lot_mf_30, 'Brightcut Gems', workshop).
business_founded(lot_mf_30, 600).
