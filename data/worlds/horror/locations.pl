%% Insimul Locations (Lots): Horror World
%% Source: data/worlds/horror/locations.pl
%% Created: 2026-04-03
%% Total: 30 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% ═══════════════════════════════════════════════════════════
%% Ravenhollow -- Old Town
%% ═══════════════════════════════════════════════════════════

%% 1 Main Street -- General Store
lot(lot_hr_1, '1 Main Street', ravenhollow).
lot_type(lot_hr_1, buildable).
lot_district(lot_hr_1, old_town).
lot_street(lot_hr_1, main_street).
lot_side(lot_hr_1, left).
lot_house_number(lot_hr_1, 1).
building(lot_hr_1, business, shop).
business(lot_hr_1, 'Blackwood General Store', shop).
business_founded(lot_hr_1, 1870).

%% 5 Main Street -- Sheriff Office
lot(lot_hr_2, '5 Main Street', ravenhollow).
lot_type(lot_hr_2, buildable).
lot_district(lot_hr_2, old_town).
lot_street(lot_hr_2, main_street).
lot_side(lot_hr_2, right).
lot_house_number(lot_hr_2, 5).
building(lot_hr_2, civic, sheriff_office).

%% 9 Main Street -- Tavern
lot(lot_hr_3, '9 Main Street', ravenhollow).
lot_type(lot_hr_3, buildable).
lot_district(lot_hr_3, old_town).
lot_street(lot_hr_3, main_street).
lot_side(lot_hr_3, left).
lot_house_number(lot_hr_3, 9).
building(lot_hr_3, business, tavern).
business(lot_hr_3, 'The Drowned Sailor', tavern).
business_founded(lot_hr_3, 1865).

%% 13 Main Street -- Boarding House
lot(lot_hr_4, '13 Main Street', ravenhollow).
lot_type(lot_hr_4, buildable).
lot_district(lot_hr_4, old_town).
lot_street(lot_hr_4, main_street).
lot_side(lot_hr_4, right).
lot_house_number(lot_hr_4, 13).
building(lot_hr_4, business, inn).
business(lot_hr_4, 'Holloway Boarding House', inn).
business_founded(lot_hr_4, 1880).

%% 17 Main Street -- Abandoned Pharmacy
lot(lot_hr_5, '17 Main Street', ravenhollow).
lot_type(lot_hr_5, buildable).
lot_district(lot_hr_5, old_town).
lot_street(lot_hr_5, main_street).
lot_side(lot_hr_5, left).
lot_house_number(lot_hr_5, 17).
building(lot_hr_5, business, pharmacy).
business(lot_hr_5, 'Bledsoe Apothecary', pharmacy).
business_founded(lot_hr_5, 1895).

%% 3 Church Lane -- Ravenhollow Church
lot(lot_hr_6, '3 Church Lane', ravenhollow).
lot_type(lot_hr_6, buildable).
lot_district(lot_hr_6, old_town).
lot_street(lot_hr_6, church_lane).
lot_side(lot_hr_6, left).
lot_house_number(lot_hr_6, 3).
building(lot_hr_6, civic, church).

%% 7 Church Lane -- Rectory
lot(lot_hr_7, '7 Church Lane', ravenhollow).
lot_type(lot_hr_7, buildable).
lot_district(lot_hr_7, old_town).
lot_street(lot_hr_7, church_lane).
lot_side(lot_hr_7, right).
lot_house_number(lot_hr_7, 7).
building(lot_hr_7, residence, house).

%% 11 Church Lane -- Town Library
lot(lot_hr_8, '11 Church Lane', ravenhollow).
lot_type(lot_hr_8, buildable).
lot_district(lot_hr_8, old_town).
lot_street(lot_hr_8, church_lane).
lot_side(lot_hr_8, left).
lot_house_number(lot_hr_8, 11).
building(lot_hr_8, civic, library).

%% 15 Church Lane -- Residence
lot(lot_hr_9, '15 Church Lane', ravenhollow).
lot_type(lot_hr_9, buildable).
lot_district(lot_hr_9, old_town).
lot_street(lot_hr_9, church_lane).
lot_side(lot_hr_9, right).
lot_house_number(lot_hr_9, 15).
building(lot_hr_9, residence, house).

%% ═══════════════════════════════════════════════════════════
%% Ravenhollow -- Harbor Ward
%% ═══════════════════════════════════════════════════════════

%% 2 Wharf Road -- Fish Market (Abandoned)
lot(lot_hr_10, '2 Wharf Road', ravenhollow).
lot_type(lot_hr_10, buildable).
lot_district(lot_hr_10, harbor_ward).
lot_street(lot_hr_10, wharf_road).
lot_side(lot_hr_10, left).
lot_house_number(lot_hr_10, 2).
building(lot_hr_10, business, market).
business(lot_hr_10, 'Harbor Fish Market', market).
business_founded(lot_hr_10, 1862).

%% 6 Wharf Road -- Warehouse
lot(lot_hr_11, '6 Wharf Road', ravenhollow).
lot_type(lot_hr_11, buildable).
lot_district(lot_hr_11, harbor_ward).
lot_street(lot_hr_11, wharf_road).
lot_side(lot_hr_11, right).
lot_house_number(lot_hr_11, 6).
building(lot_hr_11, business, warehouse).
business(lot_hr_11, 'Dockside Warehouse', warehouse).
business_founded(lot_hr_11, 1870).

%% 10 Wharf Road -- Boathouse
lot(lot_hr_12, '10 Wharf Road', ravenhollow).
lot_type(lot_hr_12, buildable).
lot_district(lot_hr_12, harbor_ward).
lot_street(lot_hr_12, wharf_road).
lot_side(lot_hr_12, left).
lot_house_number(lot_hr_12, 10).
building(lot_hr_12, business, boathouse).
business(lot_hr_12, 'Old Boathouse', boathouse).
business_founded(lot_hr_12, 1858).

%% 3 Dock Street -- Fisherman Shanty
lot(lot_hr_13, '3 Dock Street', ravenhollow).
lot_type(lot_hr_13, buildable).
lot_district(lot_hr_13, harbor_ward).
lot_street(lot_hr_13, dock_street).
lot_side(lot_hr_13, left).
lot_house_number(lot_hr_13, 3).
building(lot_hr_13, residence, shanty).

%% 7 Dock Street -- Residence
lot(lot_hr_14, '7 Dock Street', ravenhollow).
lot_type(lot_hr_14, buildable).
lot_district(lot_hr_14, harbor_ward).
lot_street(lot_hr_14, dock_street).
lot_side(lot_hr_14, right).
lot_house_number(lot_hr_14, 7).
building(lot_hr_14, residence, house).

%% ═══════════════════════════════════════════════════════════
%% Ravenhollow -- Hillcrest
%% ═══════════════════════════════════════════════════════════

%% 1 Ridge Road -- Blackwood Manor (Decrepit Mansion)
lot(lot_hr_15, '1 Ridge Road', ravenhollow).
lot_type(lot_hr_15, buildable).
lot_district(lot_hr_15, hillcrest).
lot_street(lot_hr_15, ridge_road).
lot_side(lot_hr_15, left).
lot_house_number(lot_hr_15, 1).
building(lot_hr_15, residence, mansion).

%% 5 Ridge Road -- Abandoned Asylum
lot(lot_hr_16, '5 Ridge Road', ravenhollow).
lot_type(lot_hr_16, buildable).
lot_district(lot_hr_16, hillcrest).
lot_street(lot_hr_16, ridge_road).
lot_side(lot_hr_16, right).
lot_house_number(lot_hr_16, 5).
building(lot_hr_16, civic, asylum).

%% 9 Ridge Road -- Residence
lot(lot_hr_17, '9 Ridge Road', ravenhollow).
lot_type(lot_hr_17, buildable).
lot_district(lot_hr_17, hillcrest).
lot_street(lot_hr_17, ridge_road).
lot_side(lot_hr_17, left).
lot_house_number(lot_hr_17, 9).
building(lot_hr_17, residence, house).

%% 1 Cemetery Path -- Graveyard
lot(lot_hr_18, '1 Cemetery Path', ravenhollow).
lot_type(lot_hr_18, buildable).
lot_district(lot_hr_18, hillcrest).
lot_street(lot_hr_18, cemetery_path).
lot_side(lot_hr_18, left).
lot_house_number(lot_hr_18, 1).
building(lot_hr_18, civic, cemetery).

%% 5 Cemetery Path -- Groundskeeper Cottage
lot(lot_hr_19, '5 Cemetery Path', ravenhollow).
lot_type(lot_hr_19, buildable).
lot_district(lot_hr_19, hillcrest).
lot_street(lot_hr_19, cemetery_path).
lot_side(lot_hr_19, right).
lot_house_number(lot_hr_19, 5).
building(lot_hr_19, residence, cottage).

%% 9 Cemetery Path -- Mausoleum
lot(lot_hr_20, '9 Cemetery Path', ravenhollow).
lot_type(lot_hr_20, buildable).
lot_district(lot_hr_20, hillcrest).
lot_street(lot_hr_20, cemetery_path).
lot_side(lot_hr_20, left).
lot_house_number(lot_hr_20, 9).
building(lot_hr_20, civic, mausoleum).

%% ═══════════════════════════════════════════════════════════
%% Grimhaven Hamlet
%% ═══════════════════════════════════════════════════════════

%% 1 Hollow Road -- Grimhaven Chapel (Desecrated)
lot(lot_hr_21, '1 Hollow Road', grimhaven).
lot_type(lot_hr_21, buildable).
lot_district(lot_hr_21, hamlet_center).
lot_street(lot_hr_21, hollow_road).
lot_side(lot_hr_21, left).
lot_house_number(lot_hr_21, 1).
building(lot_hr_21, civic, chapel).

%% 5 Hollow Road -- Witch Cottage
lot(lot_hr_22, '5 Hollow Road', grimhaven).
lot_type(lot_hr_22, buildable).
lot_district(lot_hr_22, hamlet_center).
lot_street(lot_hr_22, hollow_road).
lot_side(lot_hr_22, right).
lot_house_number(lot_hr_22, 5).
building(lot_hr_22, residence, cottage).

%% 9 Hollow Road -- Abandoned Schoolhouse
lot(lot_hr_23, '9 Hollow Road', grimhaven).
lot_type(lot_hr_23, buildable).
lot_district(lot_hr_23, hamlet_center).
lot_street(lot_hr_23, hollow_road).
lot_side(lot_hr_23, left).
lot_house_number(lot_hr_23, 9).
building(lot_hr_23, civic, schoolhouse).

%% 2 Crooked Lane -- Ritual Clearing
lot(lot_hr_24, '2 Crooked Lane', grimhaven).
lot_type(lot_hr_24, buildable).
lot_district(lot_hr_24, the_hollow).
lot_street(lot_hr_24, crooked_lane).
lot_side(lot_hr_24, left).
lot_house_number(lot_hr_24, 2).
building(lot_hr_24, civic, clearing).

%% 6 Crooked Lane -- Root Cellar
lot(lot_hr_25, '6 Crooked Lane', grimhaven).
lot_type(lot_hr_25, buildable).
lot_district(lot_hr_25, the_hollow).
lot_street(lot_hr_25, crooked_lane).
lot_side(lot_hr_25, right).
lot_house_number(lot_hr_25, 6).
building(lot_hr_25, residence, cellar).

%% 1 Gallows Path -- Gallows Hill
lot(lot_hr_26, '1 Gallows Path', grimhaven).
lot_type(lot_hr_26, buildable).
lot_district(lot_hr_26, the_hollow).
lot_street(lot_hr_26, gallows_path).
lot_side(lot_hr_26, left).
lot_house_number(lot_hr_26, 1).
building(lot_hr_26, civic, gallows).

%% ═══════════════════════════════════════════════════════════
%% Ashford Mill
%% ═══════════════════════════════════════════════════════════

%% 1 Mill Road -- Ruined Mill
lot(lot_hr_27, '1 Mill Road', ashford_mill).
lot_type(lot_hr_27, buildable).
lot_district(lot_hr_27, mill_district).
lot_street(lot_hr_27, mill_road).
lot_side(lot_hr_27, left).
lot_house_number(lot_hr_27, 1).
building(lot_hr_27, business, mill).
business(lot_hr_27, 'Ashford Iron Mill', mill).
business_founded(lot_hr_27, 1882).

%% 5 Mill Road -- Worker Barracks
lot(lot_hr_28, '5 Mill Road', ashford_mill).
lot_type(lot_hr_28, buildable).
lot_district(lot_hr_28, mill_district).
lot_street(lot_hr_28, mill_road).
lot_side(lot_hr_28, right).
lot_house_number(lot_hr_28, 5).
building(lot_hr_28, residence, barracks).

%% 2 Furnace Lane -- Furnace Room
lot(lot_hr_29, '2 Furnace Lane', ashford_mill).
lot_type(lot_hr_29, buildable).
lot_district(lot_hr_29, mill_district).
lot_street(lot_hr_29, furnace_lane).
lot_side(lot_hr_29, left).
lot_house_number(lot_hr_29, 2).
building(lot_hr_29, business, furnace).

%% 6 Furnace Lane -- Dark Forest Edge
lot(lot_hr_30, '6 Furnace Lane', ashford_mill).
lot_type(lot_hr_30, buildable).
lot_district(lot_hr_30, mill_district).
lot_street(lot_hr_30, furnace_lane).
lot_side(lot_hr_30, right).
lot_house_number(lot_hr_30, 6).
building(lot_hr_30, civic, forest_edge).
