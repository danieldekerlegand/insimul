%% Insimul Locations (Lots): Low Fantasy
%% Source: data/worlds/low_fantasy/locations.pl
%% Created: 2026-04-03
%% Total: 28 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% ═══════════════════════════════════════════════════════════
%% Grimhallow -- The Narrows
%% ═══════════════════════════════════════════════════════════

%% 2 Mudgate Lane -- The Hanged Crow Tavern
lot(lot_lf_1, '2 Mudgate Lane', grimhallow).
lot_type(lot_lf_1, buildable).
lot_district(lot_lf_1, the_narrows).
lot_street(lot_lf_1, mudgate_lane).
lot_side(lot_lf_1, left).
lot_house_number(lot_lf_1, 2).
building(lot_lf_1, business, tavern).
business(lot_lf_1, 'The Hanged Crow', tavern).
business_founded(lot_lf_1, 890).

%% 7 Mudgate Lane -- Flophouse
lot(lot_lf_2, '7 Mudgate Lane', grimhallow).
lot_type(lot_lf_2, buildable).
lot_district(lot_lf_2, the_narrows).
lot_street(lot_lf_2, mudgate_lane).
lot_side(lot_lf_2, right).
lot_house_number(lot_lf_2, 7).
building(lot_lf_2, business, flophouse).
business(lot_lf_2, 'Sluicegate Flophouse', flophouse).
business_founded(lot_lf_2, 920).

%% 12 Mudgate Lane -- Pawnbroker
lot(lot_lf_3, '12 Mudgate Lane', grimhallow).
lot_type(lot_lf_3, buildable).
lot_district(lot_lf_3, the_narrows).
lot_street(lot_lf_3, mudgate_lane).
lot_side(lot_lf_3, left).
lot_house_number(lot_lf_3, 12).
building(lot_lf_3, business, pawnbroker).
business(lot_lf_3, 'Gregor the Fence', pawnbroker).
business_founded(lot_lf_3, 1040).

%% 3 Ratcatcher Alley -- Thieves Den (hidden)
lot(lot_lf_4, '3 Ratcatcher Alley', grimhallow).
lot_type(lot_lf_4, buildable).
lot_district(lot_lf_4, the_narrows).
lot_street(lot_lf_4, ratcatcher_alley).
lot_side(lot_lf_4, left).
lot_house_number(lot_lf_4, 3).
building(lot_lf_4, business, den).
business(lot_lf_4, 'The Rat Nest', thieves_den).
business_founded(lot_lf_4, 1020).

%% 9 Ratcatcher Alley -- Herbalist Shack
lot(lot_lf_5, '9 Ratcatcher Alley', grimhallow).
lot_type(lot_lf_5, buildable).
lot_district(lot_lf_5, the_narrows).
lot_street(lot_lf_5, ratcatcher_alley).
lot_side(lot_lf_5, right).
lot_house_number(lot_lf_5, 9).
building(lot_lf_5, business, herbalist).
business(lot_lf_5, 'Old Mags Remedies', herbalist).
business_founded(lot_lf_5, 1035).

%% 15 Ratcatcher Alley -- Residence (condemned)
lot(lot_lf_6, '15 Ratcatcher Alley', grimhallow).
lot_type(lot_lf_6, buildable).
lot_district(lot_lf_6, the_narrows).
lot_street(lot_lf_6, ratcatcher_alley).
lot_side(lot_lf_6, left).
lot_house_number(lot_lf_6, 15).
building(lot_lf_6, residence, hovel).

%% ═══════════════════════════════════════════════════════════
%% Grimhallow -- Merchants Row
%% ═══════════════════════════════════════════════════════════

%% 4 Coppersmith Road -- Blacksmith
lot(lot_lf_7, '4 Coppersmith Road', grimhallow).
lot_type(lot_lf_7, buildable).
lot_district(lot_lf_7, merchants_row).
lot_street(lot_lf_7, coppersmith_road).
lot_side(lot_lf_7, left).
lot_house_number(lot_lf_7, 4).
building(lot_lf_7, business, smithy).
business(lot_lf_7, 'Roth Ironworks', blacksmith).
business_founded(lot_lf_7, 880).

%% 10 Coppersmith Road -- General Store
lot(lot_lf_8, '10 Coppersmith Road', grimhallow).
lot_type(lot_lf_8, buildable).
lot_district(lot_lf_8, merchants_row).
lot_street(lot_lf_8, coppersmith_road).
lot_side(lot_lf_8, right).
lot_house_number(lot_lf_8, 10).
building(lot_lf_8, business, general_store).
business(lot_lf_8, 'Aldric Sundries', general_store).
business_founded(lot_lf_8, 910).

%% 16 Coppersmith Road -- Butcher
lot(lot_lf_9, '16 Coppersmith Road', grimhallow).
lot_type(lot_lf_9, buildable).
lot_district(lot_lf_9, merchants_row).
lot_street(lot_lf_9, coppersmith_road).
lot_side(lot_lf_9, left).
lot_house_number(lot_lf_9, 16).
building(lot_lf_9, business, butcher).
business(lot_lf_9, 'Fleshmonger', butcher).
business_founded(lot_lf_9, 895).

%% 5 Tanner Street -- Leatherworker
lot(lot_lf_10, '5 Tanner Street', grimhallow).
lot_type(lot_lf_10, buildable).
lot_district(lot_lf_10, merchants_row).
lot_street(lot_lf_10, tanner_street).
lot_side(lot_lf_10, left).
lot_house_number(lot_lf_10, 5).
building(lot_lf_10, business, leatherworker).
business(lot_lf_10, 'Tanned and Cured', leatherworker).
business_founded(lot_lf_10, 900).

%% 11 Tanner Street -- Apothecary
lot(lot_lf_11, '11 Tanner Street', grimhallow).
lot_type(lot_lf_11, buildable).
lot_district(lot_lf_11, merchants_row).
lot_street(lot_lf_11, tanner_street).
lot_side(lot_lf_11, right).
lot_house_number(lot_lf_11, 11).
building(lot_lf_11, business, apothecary).
business(lot_lf_11, 'Bitter Draught Apothecary', apothecary).
business_founded(lot_lf_11, 960).

%% 20 Coppersmith Road -- Residence (merchant house)
lot(lot_lf_12, '20 Coppersmith Road', grimhallow).
lot_type(lot_lf_12, buildable).
lot_district(lot_lf_12, merchants_row).
lot_street(lot_lf_12, coppersmith_road).
lot_side(lot_lf_12, right).
lot_house_number(lot_lf_12, 20).
building(lot_lf_12, residence, townhouse).

%% ═══════════════════════════════════════════════════════════
%% Grimhallow -- The Old Keep
%% ═══════════════════════════════════════════════════════════

%% 1 Keep Road -- Garrison Hall
lot(lot_lf_13, '1 Keep Road', grimhallow).
lot_type(lot_lf_13, buildable).
lot_district(lot_lf_13, the_old_keep).
lot_street(lot_lf_13, keep_road).
lot_side(lot_lf_13, left).
lot_house_number(lot_lf_13, 1).
building(lot_lf_13, military, garrison).
business(lot_lf_13, 'Grimhallow Garrison', garrison).
business_founded(lot_lf_13, 812).

%% 5 Keep Road -- Ruined Chapel
lot(lot_lf_14, '5 Keep Road', grimhallow).
lot_type(lot_lf_14, buildable).
lot_district(lot_lf_14, the_old_keep).
lot_street(lot_lf_14, keep_road).
lot_side(lot_lf_14, right).
lot_house_number(lot_lf_14, 5).
building(lot_lf_14, religious, chapel).
business(lot_lf_14, 'Chapel of the Ashen Saint', chapel).
business_founded(lot_lf_14, 835).

%% 9 Keep Road -- Bailiff Office
lot(lot_lf_15, '9 Keep Road', grimhallow).
lot_type(lot_lf_15, buildable).
lot_district(lot_lf_15, the_old_keep).
lot_street(lot_lf_15, keep_road).
lot_side(lot_lf_15, left).
lot_house_number(lot_lf_15, 9).
building(lot_lf_15, civic, office).
business(lot_lf_15, 'Bailiff Court', bailiff).
business_founded(lot_lf_15, 850).

%% ═══════════════════════════════════════════════════════════
%% Thornfield
%% ═══════════════════════════════════════════════════════════

%% 1 Furrow Lane -- Farmstead
lot(lot_lf_16, '1 Furrow Lane', thornfield).
lot_type(lot_lf_16, buildable).
lot_district(lot_lf_16, village_common).
lot_street(lot_lf_16, furrow_lane).
lot_side(lot_lf_16, left).
lot_house_number(lot_lf_16, 1).
building(lot_lf_16, business, farm).
business(lot_lf_16, 'Harrow Farmstead', farm).
business_founded(lot_lf_16, 940).

%% 5 Furrow Lane -- Village Inn
lot(lot_lf_17, '5 Furrow Lane', thornfield).
lot_type(lot_lf_17, buildable).
lot_district(lot_lf_17, village_common).
lot_street(lot_lf_17, furrow_lane).
lot_side(lot_lf_17, right).
lot_house_number(lot_lf_17, 5).
building(lot_lf_17, business, inn).
business(lot_lf_17, 'The Thorned Rose', inn).
business_founded(lot_lf_17, 950).

%% 9 Furrow Lane -- Healer Cottage
lot(lot_lf_18, '9 Furrow Lane', thornfield).
lot_type(lot_lf_18, buildable).
lot_district(lot_lf_18, village_common).
lot_street(lot_lf_18, furrow_lane).
lot_side(lot_lf_18, left).
lot_house_number(lot_lf_18, 9).
building(lot_lf_18, business, healer).
business(lot_lf_18, 'Brenna the Healer', healer).
business_founded(lot_lf_18, 965).

%% 2 Wall Walk -- Watchtower
lot(lot_lf_19, '2 Wall Walk', thornfield).
lot_type(lot_lf_19, buildable).
lot_district(lot_lf_19, palisade_ward).
lot_street(lot_lf_19, wall_walk).
lot_side(lot_lf_19, left).
lot_house_number(lot_lf_19, 2).
building(lot_lf_19, military, watchtower).
business(lot_lf_19, 'North Watchtower', watchtower).
business_founded(lot_lf_19, 955).

%% 6 Wall Walk -- Mercenary Camp
lot(lot_lf_20, '6 Wall Walk', thornfield).
lot_type(lot_lf_20, buildable).
lot_district(lot_lf_20, palisade_ward).
lot_street(lot_lf_20, wall_walk).
lot_side(lot_lf_20, right).
lot_house_number(lot_lf_20, 6).
building(lot_lf_20, military, camp).
business(lot_lf_20, 'Iron Thorn Company', mercenary_camp).
business_founded(lot_lf_20, 1042).

%% 10 Furrow Lane -- Residence (farm laborer)
lot(lot_lf_21, '10 Furrow Lane', thornfield).
lot_type(lot_lf_21, buildable).
lot_district(lot_lf_21, village_common).
lot_street(lot_lf_21, furrow_lane).
lot_side(lot_lf_21, right).
lot_house_number(lot_lf_21, 10).
building(lot_lf_21, residence, cottage).

%% ═══════════════════════════════════════════════════════════
%% Saltmire
%% ═══════════════════════════════════════════════════════════

%% 1 Barnacle Way -- Smuggler Warehouse
lot(lot_lf_22, '1 Barnacle Way', saltmire).
lot_type(lot_lf_22, buildable).
lot_district(lot_lf_22, the_docks).
lot_street(lot_lf_22, barnacle_way).
lot_side(lot_lf_22, left).
lot_house_number(lot_lf_22, 1).
building(lot_lf_22, business, warehouse).
business(lot_lf_22, 'Saltmire Warehouse', smuggler_warehouse).
business_founded(lot_lf_22, 1020).

%% 5 Barnacle Way -- Dockside Tavern
lot(lot_lf_23, '5 Barnacle Way', saltmire).
lot_type(lot_lf_23, buildable).
lot_district(lot_lf_23, the_docks).
lot_street(lot_lf_23, barnacle_way).
lot_side(lot_lf_23, right).
lot_house_number(lot_lf_23, 5).
building(lot_lf_23, business, tavern).
business(lot_lf_23, 'The Bilge Rat', tavern).
business_founded(lot_lf_23, 1025).

%% 9 Barnacle Way -- Chandler and Rope
lot(lot_lf_24, '9 Barnacle Way', saltmire).
lot_type(lot_lf_24, buildable).
lot_district(lot_lf_24, the_docks).
lot_street(lot_lf_24, barnacle_way).
lot_side(lot_lf_24, left).
lot_house_number(lot_lf_24, 9).
building(lot_lf_24, business, chandler).
business(lot_lf_24, 'Rope and Tar', chandler).
business_founded(lot_lf_24, 1030).

%% 2 Wrecker Lane -- Smuggler Cove (hidden landing)
lot(lot_lf_25, '2 Wrecker Lane', saltmire).
lot_type(lot_lf_25, buildable).
lot_district(lot_lf_25, the_docks).
lot_street(lot_lf_25, wrecker_lane).
lot_side(lot_lf_25, left).
lot_house_number(lot_lf_25, 2).
building(lot_lf_25, business, cove).
business(lot_lf_25, 'Wrecker Cove', smuggler_cove).
business_founded(lot_lf_25, 1015).

%% 6 Wrecker Lane -- Forger Workshop
lot(lot_lf_26, '6 Wrecker Lane', saltmire).
lot_type(lot_lf_26, buildable).
lot_district(lot_lf_26, the_docks).
lot_street(lot_lf_26, wrecker_lane).
lot_side(lot_lf_26, right).
lot_house_number(lot_lf_26, 6).
building(lot_lf_26, business, workshop).
business(lot_lf_26, 'Inkblot Forgeries', forger).
business_founded(lot_lf_26, 1038).

%% 10 Wrecker Lane -- Fishmonger
lot(lot_lf_27, '10 Wrecker Lane', saltmire).
lot_type(lot_lf_27, buildable).
lot_district(lot_lf_27, the_docks).
lot_street(lot_lf_27, wrecker_lane).
lot_side(lot_lf_27, left).
lot_house_number(lot_lf_27, 10).
building(lot_lf_27, business, fishmonger).
business(lot_lf_27, 'Salt and Scale', fishmonger).
business_founded(lot_lf_27, 1020).

%% 14 Barnacle Way -- Residence (dockworker)
lot(lot_lf_28, '14 Barnacle Way', saltmire).
lot_type(lot_lf_28, buildable).
lot_district(lot_lf_28, the_docks).
lot_street(lot_lf_28, barnacle_way).
lot_side(lot_lf_28, right).
lot_house_number(lot_lf_28, 14).
building(lot_lf_28, residence, shack).
