%% Insimul Locations (Lots): Historical Medieval Europe
%% Source: data/worlds/historical_medieval/locations.pl
%% Created: 2026-04-03
%% Total: 30 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% ═══════════════════════════════════════════════════════════
%% Ashworth Keep — Castle Ward
%% ═══════════════════════════════════════════════════════════

%% 1 Kings Road — Ashworth Castle (Great Hall)
lot(lot_med_1, '1 Kings Road', ashworth_keep).
lot_type(lot_med_1, buildable).
lot_district(lot_med_1, castle_ward).
lot_street(lot_med_1, kings_road).
lot_side(lot_med_1, left).
lot_house_number(lot_med_1, 1).
building(lot_med_1, civic, castle).

%% 5 Kings Road — Barracks
lot(lot_med_2, '5 Kings Road', ashworth_keep).
lot_type(lot_med_2, buildable).
lot_district(lot_med_2, castle_ward).
lot_street(lot_med_2, kings_road).
lot_side(lot_med_2, right).
lot_house_number(lot_med_2, 5).
building(lot_med_2, military, barracks).

%% 10 Kings Road — Armory
lot(lot_med_3, '10 Kings Road', ashworth_keep).
lot_type(lot_med_3, buildable).
lot_district(lot_med_3, castle_ward).
lot_street(lot_med_3, kings_road).
lot_side(lot_med_3, left).
lot_house_number(lot_med_3, 10).
building(lot_med_3, military, armory).
business(lot_med_3, 'Castle Armory', armory).
business_founded(lot_med_3, 1070).

%% 15 Kings Road — Jousting Field
lot(lot_med_4, '15 Kings Road', ashworth_keep).
lot_type(lot_med_4, buildable).
lot_district(lot_med_4, castle_ward).
lot_street(lot_med_4, kings_road).
lot_side(lot_med_4, right).
lot_house_number(lot_med_4, 15).
building(lot_med_4, civic, jousting_field).

%% 20 Kings Road — Stables
lot(lot_med_5, '20 Kings Road', ashworth_keep).
lot_type(lot_med_5, buildable).
lot_district(lot_med_5, castle_ward).
lot_street(lot_med_5, kings_road).
lot_side(lot_med_5, left).
lot_house_number(lot_med_5, 20).
building(lot_med_5, business, stables).
business(lot_med_5, 'Castle Stables', stables).
business_founded(lot_med_5, 1075).

%% 25 Kings Road — Noble Residence
lot(lot_med_6, '25 Kings Road', ashworth_keep).
lot_type(lot_med_6, buildable).
lot_district(lot_med_6, castle_ward).
lot_street(lot_med_6, kings_road).
lot_side(lot_med_6, right).
lot_house_number(lot_med_6, 25).
building(lot_med_6, residence, manor).

%% ═══════════════════════════════════════════════════════════
%% Ashworth Keep — Market Square
%% ═══════════════════════════════════════════════════════════

%% 2 Tanners Lane — Tannery
lot(lot_med_7, '2 Tanners Lane', ashworth_keep).
lot_type(lot_med_7, buildable).
lot_district(lot_med_7, market_square).
lot_street(lot_med_7, tanners_lane).
lot_side(lot_med_7, left).
lot_house_number(lot_med_7, 2).
building(lot_med_7, business, tannery).
business(lot_med_7, 'Edric Tannery', tannery).
business_founded(lot_med_7, 1130).

%% 8 Tanners Lane — Blacksmith
lot(lot_med_8, '8 Tanners Lane', ashworth_keep).
lot_type(lot_med_8, buildable).
lot_district(lot_med_8, market_square).
lot_street(lot_med_8, tanners_lane).
lot_side(lot_med_8, right).
lot_house_number(lot_med_8, 8).
building(lot_med_8, business, smithy).
business(lot_med_8, 'Godwin Forge', smithy).
business_founded(lot_med_8, 1110).

%% 14 Tanners Lane — Peasant Cottage
lot(lot_med_9, '14 Tanners Lane', ashworth_keep).
lot_type(lot_med_9, buildable).
lot_district(lot_med_9, market_square).
lot_street(lot_med_9, tanners_lane).
lot_side(lot_med_9, left).
lot_house_number(lot_med_9, 14).
building(lot_med_9, residence, cottage).

%% 20 Tanners Lane — Tavern
lot(lot_med_10, '20 Tanners Lane', ashworth_keep).
lot_type(lot_med_10, buildable).
lot_district(lot_med_10, market_square).
lot_street(lot_med_10, tanners_lane).
lot_side(lot_med_10, right).
lot_house_number(lot_med_10, 20).
building(lot_med_10, business, tavern).
business(lot_med_10, 'The Crossed Swords', tavern).
business_founded(lot_med_10, 1140).

%% 3 Merchants Row — Guild Hall
lot(lot_med_11, '3 Merchants Row', ashworth_keep).
lot_type(lot_med_11, buildable).
lot_district(lot_med_11, market_square).
lot_street(lot_med_11, merchants_row).
lot_side(lot_med_11, left).
lot_house_number(lot_med_11, 3).
building(lot_med_11, civic, guild_hall).

%% 9 Merchants Row — Wool Merchant
lot(lot_med_12, '9 Merchants Row', ashworth_keep).
lot_type(lot_med_12, buildable).
lot_district(lot_med_12, market_square).
lot_street(lot_med_12, merchants_row).
lot_side(lot_med_12, right).
lot_house_number(lot_med_12, 9).
building(lot_med_12, business, shop).
business(lot_med_12, 'Aldric Wool Trade', shop).
business_founded(lot_med_12, 1160).

%% 15 Merchants Row — Baker
lot(lot_med_13, '15 Merchants Row', ashworth_keep).
lot_type(lot_med_13, buildable).
lot_district(lot_med_13, market_square).
lot_street(lot_med_13, merchants_row).
lot_side(lot_med_13, left).
lot_house_number(lot_med_13, 15).
building(lot_med_13, business, bakery).
business(lot_med_13, 'Wulfric Bakehouse', bakery).
business_founded(lot_med_13, 1145).

%% 21 Merchants Row — Apothecary
lot(lot_med_14, '21 Merchants Row', ashworth_keep).
lot_type(lot_med_14, buildable).
lot_district(lot_med_14, market_square).
lot_street(lot_med_14, merchants_row).
lot_side(lot_med_14, right).
lot_house_number(lot_med_14, 21).
building(lot_med_14, business, apothecary).
business(lot_med_14, 'Sister Heloise Apothecary', apothecary).
business_founded(lot_med_14, 1180).

%% 27 Merchants Row — Peasant Cottage
lot(lot_med_15, '27 Merchants Row', ashworth_keep).
lot_type(lot_med_15, buildable).
lot_district(lot_med_15, market_square).
lot_street(lot_med_15, merchants_row).
lot_side(lot_med_15, left).
lot_house_number(lot_med_15, 27).
building(lot_med_15, residence, cottage).

%% ═══════════════════════════════════════════════════════════
%% Ashworth Keep — Abbey Quarter
%% ═══════════════════════════════════════════════════════════

%% 2 Pilgrim Way — St. Aldhelm Abbey
lot(lot_med_16, '2 Pilgrim Way', ashworth_keep).
lot_type(lot_med_16, buildable).
lot_district(lot_med_16, abbey_quarter).
lot_street(lot_med_16, pilgrim_way).
lot_side(lot_med_16, left).
lot_house_number(lot_med_16, 2).
building(lot_med_16, civic, abbey).

%% 8 Pilgrim Way — Scriptorium
lot(lot_med_17, '8 Pilgrim Way', ashworth_keep).
lot_type(lot_med_17, buildable).
lot_district(lot_med_17, abbey_quarter).
lot_street(lot_med_17, pilgrim_way).
lot_side(lot_med_17, right).
lot_house_number(lot_med_17, 8).
building(lot_med_17, business, scriptorium).
business(lot_med_17, 'Abbey Scriptorium', scriptorium).
business_founded(lot_med_17, 1100).

%% 14 Pilgrim Way — Infirmary
lot(lot_med_18, '14 Pilgrim Way', ashworth_keep).
lot_type(lot_med_18, buildable).
lot_district(lot_med_18, abbey_quarter).
lot_street(lot_med_18, pilgrim_way).
lot_side(lot_med_18, left).
lot_house_number(lot_med_18, 14).
building(lot_med_18, civic, infirmary).

%% 5 Chapel Street — Chapel of St. Cuthbert
lot(lot_med_19, '5 Chapel Street', ashworth_keep).
lot_type(lot_med_19, buildable).
lot_district(lot_med_19, abbey_quarter).
lot_street(lot_med_19, chapel_street).
lot_side(lot_med_19, left).
lot_house_number(lot_med_19, 5).
building(lot_med_19, civic, chapel).

%% 11 Chapel Street — Herbalist Garden
lot(lot_med_20, '11 Chapel Street', ashworth_keep).
lot_type(lot_med_20, buildable).
lot_district(lot_med_20, abbey_quarter).
lot_street(lot_med_20, chapel_street).
lot_side(lot_med_20, right).
lot_house_number(lot_med_20, 11).
building(lot_med_20, business, garden).
business(lot_med_20, 'Monastery Herb Garden', garden).
business_founded(lot_med_20, 1105).

%% 17 Chapel Street — Pilgrim Hostel
lot(lot_med_21, '17 Chapel Street', ashworth_keep).
lot_type(lot_med_21, buildable).
lot_district(lot_med_21, abbey_quarter).
lot_street(lot_med_21, chapel_street).
lot_side(lot_med_21, left).
lot_house_number(lot_med_21, 17).
building(lot_med_21, business, hostel).
business(lot_med_21, 'Pilgrim Rest', hostel).
business_founded(lot_med_21, 1120).

%% ═══════════════════════════════════════════════════════════
%% Dunmere Village
%% ═══════════════════════════════════════════════════════════

%% 1 Field Path — Village Church
lot(lot_med_22, '1 Field Path', dunmere_village).
lot_type(lot_med_22, buildable).
lot_district(lot_med_22, village_green).
lot_street(lot_med_22, field_path).
lot_side(lot_med_22, left).
lot_house_number(lot_med_22, 1).
building(lot_med_22, civic, church).

%% 5 Field Path — Peasant Cottage
lot(lot_med_23, '5 Field Path', dunmere_village).
lot_type(lot_med_23, buildable).
lot_district(lot_med_23, village_green).
lot_street(lot_med_23, field_path).
lot_side(lot_med_23, right).
lot_house_number(lot_med_23, 5).
building(lot_med_23, residence, cottage).

%% 10 Field Path — Peasant Cottage
lot(lot_med_24, '10 Field Path', dunmere_village).
lot_type(lot_med_24, buildable).
lot_district(lot_med_24, village_green).
lot_street(lot_med_24, field_path).
lot_side(lot_med_24, left).
lot_house_number(lot_med_24, 10).
building(lot_med_24, residence, cottage).

%% 2 Mill Lane — Water Mill
lot(lot_med_25, '2 Mill Lane', dunmere_village).
lot_type(lot_med_25, buildable).
lot_district(lot_med_25, village_green).
lot_street(lot_med_25, mill_lane).
lot_side(lot_med_25, left).
lot_house_number(lot_med_25, 2).
building(lot_med_25, business, mill).
business(lot_med_25, 'Dunmere Water Mill', mill).
business_founded(lot_med_25, 1110).

%% 8 Mill Lane — Peasant Cottage
lot(lot_med_26, '8 Mill Lane', dunmere_village).
lot_type(lot_med_26, buildable).
lot_district(lot_med_26, village_green).
lot_street(lot_med_26, mill_lane).
lot_side(lot_med_26, right).
lot_house_number(lot_med_26, 8).
building(lot_med_26, residence, cottage).

%% ═══════════════════════════════════════════════════════════
%% Ravenhold Priory
%% ═══════════════════════════════════════════════════════════

%% 1 Cloister Walk — Priory Church
lot(lot_med_27, '1 Cloister Walk', ravenhold_priory).
lot_type(lot_med_27, buildable).
lot_district(lot_med_27, cloister_grounds).
lot_street(lot_med_27, cloister_walk).
lot_side(lot_med_27, left).
lot_house_number(lot_med_27, 1).
building(lot_med_27, civic, priory_church).

%% 5 Cloister Walk — Library
lot(lot_med_28, '5 Cloister Walk', ravenhold_priory).
lot_type(lot_med_28, buildable).
lot_district(lot_med_28, cloister_grounds).
lot_street(lot_med_28, cloister_walk).
lot_side(lot_med_28, right).
lot_house_number(lot_med_28, 5).
building(lot_med_28, civic, library).

%% 10 Cloister Walk — Refectory
lot(lot_med_29, '10 Cloister Walk', ravenhold_priory).
lot_type(lot_med_29, buildable).
lot_district(lot_med_29, cloister_grounds).
lot_street(lot_med_29, cloister_walk).
lot_side(lot_med_29, left).
lot_house_number(lot_med_29, 10).
building(lot_med_29, civic, refectory).

%% 15 Cloister Walk — Dormitory
lot(lot_med_30, '15 Cloister Walk', ravenhold_priory).
lot_type(lot_med_30, buildable).
lot_district(lot_med_30, cloister_grounds).
lot_street(lot_med_30, cloister_walk).
lot_side(lot_med_30, right).
lot_house_number(lot_med_30, 15).
building(lot_med_30, residence, dormitory).
