%% Insimul Locations (Lots): Generic Fantasy World
%% Source: data/worlds/generic/locations.pl
%% Created: 2026-04-03
%% Total: 30 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% ═══════════════════════════════════════════════════════════
%% Stonehaven -- Market District
%% ═══════════════════════════════════════════════════════════

%% 1 High Street -- The Golden Flagon (Tavern)
lot(lot_gn_1, '1 High Street', stonehaven).
lot_type(lot_gn_1, buildable).
lot_district(lot_gn_1, market_district).
lot_street(lot_gn_1, high_street).
lot_side(lot_gn_1, left).
lot_house_number(lot_gn_1, 1).
building(lot_gn_1, business, tavern).
business(lot_gn_1, 'The Golden Flagon', tavern).
business_founded(lot_gn_1, 860).

%% 5 High Street -- Market Square
lot(lot_gn_2, '5 High Street', stonehaven).
lot_type(lot_gn_2, buildable).
lot_district(lot_gn_2, market_district).
lot_street(lot_gn_2, high_street).
lot_side(lot_gn_2, right).
lot_house_number(lot_gn_2, 5).
building(lot_gn_2, business, market).
business(lot_gn_2, 'Stonehaven Market', market).
business_founded(lot_gn_2, 855).

%% 9 High Street -- General Goods
lot(lot_gn_3, '9 High Street', stonehaven).
lot_type(lot_gn_3, buildable).
lot_district(lot_gn_3, market_district).
lot_street(lot_gn_3, high_street).
lot_side(lot_gn_3, left).
lot_house_number(lot_gn_3, 9).
building(lot_gn_3, business, shop).
business(lot_gn_3, 'Brambles General Goods', shop).
business_founded(lot_gn_3, 890).

%% 13 High Street -- Bakery
lot(lot_gn_4, '13 High Street', stonehaven).
lot_type(lot_gn_4, buildable).
lot_district(lot_gn_4, market_district).
lot_street(lot_gn_4, high_street).
lot_side(lot_gn_4, right).
lot_house_number(lot_gn_4, 13).
building(lot_gn_4, business, bakery).
business(lot_gn_4, 'Hearthstone Bakery', bakery).
business_founded(lot_gn_4, 905).

%% 17 High Street -- Town Hall
lot(lot_gn_5, '17 High Street', stonehaven).
lot_type(lot_gn_5, buildable).
lot_district(lot_gn_5, market_district).
lot_street(lot_gn_5, high_street).
lot_side(lot_gn_5, left).
lot_house_number(lot_gn_5, 17).
building(lot_gn_5, civic, town_hall).

%% 21 High Street -- Residence
lot(lot_gn_6, '21 High Street', stonehaven).
lot_type(lot_gn_6, buildable).
lot_district(lot_gn_6, market_district).
lot_street(lot_gn_6, high_street).
lot_side(lot_gn_6, right).
lot_house_number(lot_gn_6, 21).
building(lot_gn_6, residence, house).

%% 3 Mill Street -- Granary and Mill
lot(lot_gn_7, '3 Mill Street', stonehaven).
lot_type(lot_gn_7, buildable).
lot_district(lot_gn_7, market_district).
lot_street(lot_gn_7, mill_street).
lot_side(lot_gn_7, left).
lot_house_number(lot_gn_7, 3).
building(lot_gn_7, business, mill).
business(lot_gn_7, 'Stonehaven Mill', mill).
business_founded(lot_gn_7, 860).

%% 7 Mill Street -- Herbalist
lot(lot_gn_8, '7 Mill Street', stonehaven).
lot_type(lot_gn_8, buildable).
lot_district(lot_gn_8, market_district).
lot_street(lot_gn_8, mill_street).
lot_side(lot_gn_8, right).
lot_house_number(lot_gn_8, 7).
building(lot_gn_8, business, apothecary).
business(lot_gn_8, 'Sage Elara Apothecary', apothecary).
business_founded(lot_gn_8, 920).

%% 11 Mill Street -- Residence
lot(lot_gn_9, '11 Mill Street', stonehaven).
lot_type(lot_gn_9, buildable).
lot_district(lot_gn_9, market_district).
lot_street(lot_gn_9, mill_street).
lot_side(lot_gn_9, left).
lot_house_number(lot_gn_9, 11).
building(lot_gn_9, residence, house).

%% 15 Mill Street -- Residence
lot(lot_gn_10, '15 Mill Street', stonehaven).
lot_type(lot_gn_10, buildable).
lot_district(lot_gn_10, market_district).
lot_street(lot_gn_10, mill_street).
lot_side(lot_gn_10, right).
lot_house_number(lot_gn_10, 15).
building(lot_gn_10, residence, house).

%% ═══════════════════════════════════════════════════════════
%% Stonehaven -- Temple District
%% ═══════════════════════════════════════════════════════════

%% 2 Temple Road -- Temple of the Dawn
lot(lot_gn_11, '2 Temple Road', stonehaven).
lot_type(lot_gn_11, buildable).
lot_district(lot_gn_11, temple_district).
lot_street(lot_gn_11, temple_road).
lot_side(lot_gn_11, left).
lot_house_number(lot_gn_11, 2).
building(lot_gn_11, civic, temple).

%% 6 Temple Road -- Library
lot(lot_gn_12, '6 Temple Road', stonehaven).
lot_type(lot_gn_12, buildable).
lot_district(lot_gn_12, temple_district).
lot_street(lot_gn_12, temple_road).
lot_side(lot_gn_12, right).
lot_house_number(lot_gn_12, 6).
building(lot_gn_12, civic, library).

%% 10 Temple Road -- Scribe Shop
lot(lot_gn_13, '10 Temple Road', stonehaven).
lot_type(lot_gn_13, buildable).
lot_district(lot_gn_13, temple_district).
lot_street(lot_gn_13, temple_road).
lot_side(lot_gn_13, left).
lot_house_number(lot_gn_13, 10).
building(lot_gn_13, business, shop).
business(lot_gn_13, 'Inkwell and Quill', shop).
business_founded(lot_gn_13, 910).

%% 14 Temple Road -- Healer
lot(lot_gn_14, '14 Temple Road', stonehaven).
lot_type(lot_gn_14, buildable).
lot_district(lot_gn_14, temple_district).
lot_street(lot_gn_14, temple_road).
lot_side(lot_gn_14, right).
lot_house_number(lot_gn_14, 14).
building(lot_gn_14, business, clinic).
business(lot_gn_14, 'Brother Aldric Healing', clinic).
business_founded(lot_gn_14, 875).

%% 18 Temple Road -- Residence
lot(lot_gn_15, '18 Temple Road', stonehaven).
lot_type(lot_gn_15, buildable).
lot_district(lot_gn_15, temple_district).
lot_street(lot_gn_15, temple_road).
lot_side(lot_gn_15, left).
lot_house_number(lot_gn_15, 18).
building(lot_gn_15, residence, house).

%% ═══════════════════════════════════════════════════════════
%% Stonehaven -- Crafters Quarter
%% ═══════════════════════════════════════════════════════════

%% 2 Forge Lane -- Blacksmith
lot(lot_gn_16, '2 Forge Lane', stonehaven).
lot_type(lot_gn_16, buildable).
lot_district(lot_gn_16, crafters_quarter).
lot_street(lot_gn_16, forge_lane).
lot_side(lot_gn_16, left).
lot_house_number(lot_gn_16, 2).
building(lot_gn_16, business, blacksmith).
business(lot_gn_16, 'Ironhand Forge', blacksmith).
business_founded(lot_gn_16, 855).

%% 6 Forge Lane -- Leatherworker
lot(lot_gn_17, '6 Forge Lane', stonehaven).
lot_type(lot_gn_17, buildable).
lot_district(lot_gn_17, crafters_quarter).
lot_street(lot_gn_17, forge_lane).
lot_side(lot_gn_17, right).
lot_house_number(lot_gn_17, 6).
building(lot_gn_17, business, workshop).
business(lot_gn_17, 'Tanner and Hide', workshop).
business_founded(lot_gn_17, 870).

%% 10 Forge Lane -- Carpenter
lot(lot_gn_18, '10 Forge Lane', stonehaven).
lot_type(lot_gn_18, buildable).
lot_district(lot_gn_18, crafters_quarter).
lot_street(lot_gn_18, forge_lane).
lot_side(lot_gn_18, left).
lot_house_number(lot_gn_18, 10).
building(lot_gn_18, business, workshop).
business(lot_gn_18, 'Oakheart Carpentry', workshop).
business_founded(lot_gn_18, 885).

%% 14 Forge Lane -- Residence
lot(lot_gn_19, '14 Forge Lane', stonehaven).
lot_type(lot_gn_19, buildable).
lot_district(lot_gn_19, crafters_quarter).
lot_street(lot_gn_19, forge_lane).
lot_side(lot_gn_19, right).
lot_house_number(lot_gn_19, 14).
building(lot_gn_19, residence, house).

%% 4 Wall Walk -- Guard Barracks
lot(lot_gn_20, '4 Wall Walk', stonehaven).
lot_type(lot_gn_20, buildable).
lot_district(lot_gn_20, crafters_quarter).
lot_street(lot_gn_20, wall_walk).
lot_side(lot_gn_20, left).
lot_house_number(lot_gn_20, 4).
building(lot_gn_20, civic, barracks).

%% 8 Wall Walk -- Jeweler
lot(lot_gn_21, '8 Wall Walk', stonehaven).
lot_type(lot_gn_21, buildable).
lot_district(lot_gn_21, crafters_quarter).
lot_street(lot_gn_21, wall_walk).
lot_side(lot_gn_21, right).
lot_house_number(lot_gn_21, 8).
building(lot_gn_21, business, shop).
business(lot_gn_21, 'Gemwright Jewelers', shop).
business_founded(lot_gn_21, 930).

%% 12 Wall Walk -- Stable
lot(lot_gn_22, '12 Wall Walk', stonehaven).
lot_type(lot_gn_22, buildable).
lot_district(lot_gn_22, crafters_quarter).
lot_street(lot_gn_22, wall_walk).
lot_side(lot_gn_22, left).
lot_house_number(lot_gn_22, 12).
building(lot_gn_22, business, stable).
business(lot_gn_22, 'Swiftfoot Stables', stable).
business_founded(lot_gn_22, 860).

%% ═══════════════════════════════════════════════════════════
%% Willowmere -- Village Green
%% ═══════════════════════════════════════════════════════════

%% 1 Meadow Path -- Village Inn
lot(lot_gn_23, '1 Meadow Path', willowmere).
lot_type(lot_gn_23, buildable).
lot_district(lot_gn_23, village_green).
lot_street(lot_gn_23, meadow_path).
lot_side(lot_gn_23, left).
lot_house_number(lot_gn_23, 1).
building(lot_gn_23, business, inn).
business(lot_gn_23, 'The Wandering Willow', inn).
business_founded(lot_gn_23, 925).

%% 5 Meadow Path -- Shrine
lot(lot_gn_24, '5 Meadow Path', willowmere).
lot_type(lot_gn_24, buildable).
lot_district(lot_gn_24, village_green).
lot_street(lot_gn_24, meadow_path).
lot_side(lot_gn_24, right).
lot_house_number(lot_gn_24, 5).
building(lot_gn_24, civic, shrine).

%% 9 Meadow Path -- Farm
lot(lot_gn_25, '9 Meadow Path', willowmere).
lot_type(lot_gn_25, buildable).
lot_district(lot_gn_25, village_green).
lot_street(lot_gn_25, meadow_path).
lot_side(lot_gn_25, left).
lot_house_number(lot_gn_25, 9).
building(lot_gn_25, business, farm).
business(lot_gn_25, 'Greenfield Farm', farm).
business_founded(lot_gn_25, 920).

%% 13 Meadow Path -- Residence
lot(lot_gn_26, '13 Meadow Path', willowmere).
lot_type(lot_gn_26, buildable).
lot_district(lot_gn_26, village_green).
lot_street(lot_gn_26, meadow_path).
lot_side(lot_gn_26, right).
lot_house_number(lot_gn_26, 13).
building(lot_gn_26, residence, house).

%% 2 Orchard Lane -- Woodcutter
lot(lot_gn_27, '2 Orchard Lane', willowmere).
lot_type(lot_gn_27, buildable).
lot_district(lot_gn_27, village_green).
lot_street(lot_gn_27, orchard_lane).
lot_side(lot_gn_27, left).
lot_house_number(lot_gn_27, 2).
building(lot_gn_27, business, workshop).
business(lot_gn_27, 'Ashwood Lumber', workshop).
business_founded(lot_gn_27, 935).

%% 6 Orchard Lane -- Farm (Livestock)
lot(lot_gn_28, '6 Orchard Lane', willowmere).
lot_type(lot_gn_28, buildable).
lot_district(lot_gn_28, village_green).
lot_street(lot_gn_28, orchard_lane).
lot_side(lot_gn_28, right).
lot_house_number(lot_gn_28, 6).
building(lot_gn_28, business, farm).
business(lot_gn_28, 'Mossbank Pastures', farm).
business_founded(lot_gn_28, 930).

%% 10 Orchard Lane -- Residence
lot(lot_gn_29, '10 Orchard Lane', willowmere).
lot_type(lot_gn_29, buildable).
lot_district(lot_gn_29, village_green).
lot_street(lot_gn_29, orchard_lane).
lot_side(lot_gn_29, left).
lot_house_number(lot_gn_29, 10).
building(lot_gn_29, residence, house).

%% 14 Orchard Lane -- Residence
lot(lot_gn_30, '14 Orchard Lane', willowmere).
lot_type(lot_gn_30, buildable).
lot_district(lot_gn_30, village_green).
lot_street(lot_gn_30, orchard_lane).
lot_side(lot_gn_30, right).
lot_house_number(lot_gn_30, 14).
building(lot_gn_30, residence, house).
