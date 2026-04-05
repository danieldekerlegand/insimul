%% Insimul Locations (Lots): Historical Victorian
%% Source: data/worlds/historical_victorian/locations.pl
%% Created: 2026-04-03
%% Total: 28 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% ═══════════════════════════════════════════════════════════
%% Factory District, Ironhaven
%% ═══════════════════════════════════════════════════════════

%% 1 Mill Road -- Blackwood Cotton Mill
lot(lot_vic_1, '1 Mill Road', ironhaven).
lot_type(lot_vic_1, buildable).
lot_district(lot_vic_1, factory_district).
lot_street(lot_vic_1, mill_road).
lot_side(lot_vic_1, left).
lot_house_number(lot_vic_1, 1).
building(lot_vic_1, industrial, cotton_mill).
business(lot_vic_1, 'Blackwood Cotton Mill', factory).
business_founded(lot_vic_1, 1812).

%% 5 Mill Road -- Grimsdale Iron Foundry
lot(lot_vic_2, '5 Mill Road', ironhaven).
lot_type(lot_vic_2, buildable).
lot_district(lot_vic_2, factory_district).
lot_street(lot_vic_2, mill_road).
lot_side(lot_vic_2, left).
lot_house_number(lot_vic_2, 5).
building(lot_vic_2, industrial, iron_foundry).
business(lot_vic_2, 'Grimsdale Iron Foundry', factory).
business_founded(lot_vic_2, 1825).

%% 8 Mill Road -- St. Cuthbert Workhouse
lot(lot_vic_3, '8 Mill Road', ironhaven).
lot_type(lot_vic_3, buildable).
lot_district(lot_vic_3, factory_district).
lot_street(lot_vic_3, mill_road).
lot_side(lot_vic_3, right).
lot_house_number(lot_vic_3, 8).
building(lot_vic_3, institutional, workhouse).
business(lot_vic_3, 'St. Cuthbert Workhouse', workhouse).
business_founded(lot_vic_3, 1834).

%% 3 Cinder Alley -- Molly Flint Boarding House
lot(lot_vic_4, '3 Cinder Alley', ironhaven).
lot_type(lot_vic_4, buildable).
lot_district(lot_vic_4, factory_district).
lot_street(lot_vic_4, cinder_alley).
lot_side(lot_vic_4, left).
lot_house_number(lot_vic_4, 3).
building(lot_vic_4, residential, boarding_house).
business(lot_vic_4, 'Flint Boarding House', lodging).
business_founded(lot_vic_4, 1840).

%% ═══════════════════════════════════════════════════════════
%% Mayfair Quarter, Ironhaven
%% ═══════════════════════════════════════════════════════════

%% 10 Gaslight Lane -- The Prometheus Club
lot(lot_vic_5, '10 Gaslight Lane', ironhaven).
lot_type(lot_vic_5, buildable).
lot_district(lot_vic_5, mayfair_quarter).
lot_street(lot_vic_5, gaslight_lane).
lot_side(lot_vic_5, right).
lot_house_number(lot_vic_5, 10).
building(lot_vic_5, social, gentlemens_club).
business(lot_vic_5, 'The Prometheus Club', gentlemens_club).
business_founded(lot_vic_5, 1795).

%% 14 Gaslight Lane -- Ashworth Townhouse
lot(lot_vic_6, '14 Gaslight Lane', ironhaven).
lot_type(lot_vic_6, buildable).
lot_district(lot_vic_6, mayfair_quarter).
lot_street(lot_vic_6, gaslight_lane).
lot_side(lot_vic_6, right).
lot_house_number(lot_vic_6, 14).
building(lot_vic_6, residential, townhouse).

%% 18 Gaslight Lane -- Madame Leclerc Dressmaker
lot(lot_vic_7, '18 Gaslight Lane', ironhaven).
lot_type(lot_vic_7, buildable).
lot_district(lot_vic_7, mayfair_quarter).
lot_street(lot_vic_7, gaslight_lane).
lot_side(lot_vic_7, right).
lot_house_number(lot_vic_7, 18).
building(lot_vic_7, business, dressmaker).
business(lot_vic_7, 'Madame Leclerc Dressmaker', tailor).
business_founded(lot_vic_7, 1852).

%% 3 Queens Boulevard -- The Royal Museum of Natural Philosophy
lot(lot_vic_8, '3 Queens Boulevard', ironhaven).
lot_type(lot_vic_8, buildable).
lot_district(lot_vic_8, mayfair_quarter).
lot_street(lot_vic_8, queens_boulevard).
lot_side(lot_vic_8, left).
lot_house_number(lot_vic_8, 3).
building(lot_vic_8, institutional, museum).
business(lot_vic_8, 'Royal Museum of Natural Philosophy', museum).
business_founded(lot_vic_8, 1845).

%% 7 Queens Boulevard -- Thornton Gallery of Art
lot(lot_vic_9, '7 Queens Boulevard', ironhaven).
lot_type(lot_vic_9, buildable).
lot_district(lot_vic_9, mayfair_quarter).
lot_street(lot_vic_9, queens_boulevard).
lot_side(lot_vic_9, left).
lot_house_number(lot_vic_9, 7).
building(lot_vic_9, cultural, art_gallery).
business(lot_vic_9, 'Thornton Gallery of Art', gallery).
business_founded(lot_vic_9, 1858).

%% 12 Queens Boulevard -- Hargreaves Auction House
lot(lot_vic_10, '12 Queens Boulevard', ironhaven).
lot_type(lot_vic_10, buildable).
lot_district(lot_vic_10, mayfair_quarter).
lot_street(lot_vic_10, queens_boulevard).
lot_side(lot_vic_10, right).
lot_house_number(lot_vic_10, 12).
building(lot_vic_10, business, auction_house).
business(lot_vic_10, 'Hargreaves Auction House', auction_house).
business_founded(lot_vic_10, 1860).

%% ═══════════════════════════════════════════════════════════
%% Docklands, Ironhaven
%% ═══════════════════════════════════════════════════════════

%% 2 Wharf Street -- The Anchor and Crown Pub
lot(lot_vic_11, '2 Wharf Street', ironhaven).
lot_type(lot_vic_11, buildable).
lot_district(lot_vic_11, docklands).
lot_street(lot_vic_11, wharf_street).
lot_side(lot_vic_11, left).
lot_house_number(lot_vic_11, 2).
building(lot_vic_11, business, pub).
business(lot_vic_11, 'The Anchor and Crown', pub).
business_founded(lot_vic_11, 1805).

%% 6 Wharf Street -- Maritime Warehouse
lot(lot_vic_12, '6 Wharf Street', ironhaven).
lot_type(lot_vic_12, buildable).
lot_district(lot_vic_12, docklands).
lot_street(lot_vic_12, wharf_street).
lot_side(lot_vic_12, left).
lot_house_number(lot_vic_12, 6).
building(lot_vic_12, industrial, warehouse).
business(lot_vic_12, 'Empire Trading Warehouse', warehouse).
business_founded(lot_vic_12, 1830).

%% 9 Wharf Street -- Customs House
lot(lot_vic_13, '9 Wharf Street', ironhaven).
lot_type(lot_vic_13, buildable).
lot_district(lot_vic_13, docklands).
lot_street(lot_vic_13, wharf_street).
lot_side(lot_vic_13, right).
lot_house_number(lot_vic_13, 9).
building(lot_vic_13, institutional, customs_house).
business(lot_vic_13, 'Her Majesty Customs House', government).
business_founded(lot_vic_13, 1820).

%% 14 Wharf Street -- Opium Den (hidden)
lot(lot_vic_14, '14 Wharf Street', ironhaven).
lot_type(lot_vic_14, buildable).
lot_district(lot_vic_14, docklands).
lot_street(lot_vic_14, wharf_street).
lot_side(lot_vic_14, right).
lot_house_number(lot_vic_14, 14).
building(lot_vic_14, illicit, opium_den).
business(lot_vic_14, 'The Jade Lantern', opium_den).
business_founded(lot_vic_14, 1855).

%% ═══════════════════════════════════════════════════════════
%% Civic Centre, Ironhaven
%% ═══════════════════════════════════════════════════════════

%% 1 Parliament Row -- Ironhaven Town Hall
lot(lot_vic_15, '1 Parliament Row', ironhaven).
lot_type(lot_vic_15, buildable).
lot_district(lot_vic_15, civic_centre).
lot_street(lot_vic_15, parliament_row).
lot_side(lot_vic_15, left).
lot_house_number(lot_vic_15, 1).
building(lot_vic_15, institutional, town_hall).
business(lot_vic_15, 'Ironhaven Town Hall', government).
business_founded(lot_vic_15, 1832).

%% 5 Parliament Row -- The Daily Sentinel (Newspaper)
lot(lot_vic_16, '5 Parliament Row', ironhaven).
lot_type(lot_vic_16, buildable).
lot_district(lot_vic_16, civic_centre).
lot_street(lot_vic_16, parliament_row).
lot_side(lot_vic_16, left).
lot_house_number(lot_vic_16, 5).
building(lot_vic_16, business, newspaper_office).
business(lot_vic_16, 'The Daily Sentinel', newspaper).
business_founded(lot_vic_16, 1848).

%% 8 Parliament Row -- Magistrate Court
lot(lot_vic_17, '8 Parliament Row', ironhaven).
lot_type(lot_vic_17, buildable).
lot_district(lot_vic_17, civic_centre).
lot_street(lot_vic_17, parliament_row).
lot_side(lot_vic_17, right).
lot_house_number(lot_vic_17, 8).
building(lot_vic_17, institutional, courthouse).
business(lot_vic_17, 'Ironhaven Magistrate Court', government).
business_founded(lot_vic_17, 1835).

%% 12 Parliament Row -- Ironhaven Public Library
lot(lot_vic_18, '12 Parliament Row', ironhaven).
lot_type(lot_vic_18, buildable).
lot_district(lot_vic_18, civic_centre).
lot_street(lot_vic_18, parliament_row).
lot_side(lot_vic_18, right).
lot_house_number(lot_vic_18, 12).
building(lot_vic_18, institutional, library).
business(lot_vic_18, 'Ironhaven Public Library', library).
business_founded(lot_vic_18, 1850).

%% ═══════════════════════════════════════════════════════════
%% Chapel Row, Ironhaven
%% ═══════════════════════════════════════════════════════════

%% 1 Chapel Street -- St. Agnes Church
lot(lot_vic_19, '1 Chapel Street', ironhaven).
lot_type(lot_vic_19, buildable).
lot_district(lot_vic_19, chapel_row).
lot_street(lot_vic_19, chapel_street).
lot_side(lot_vic_19, left).
lot_house_number(lot_vic_19, 1).
building(lot_vic_19, religious, church).
business(lot_vic_19, 'St. Agnes Church', church).
business_founded(lot_vic_19, 1790).

%% 5 Chapel Street -- Dr. Hartley Surgery
lot(lot_vic_20, '5 Chapel Street', ironhaven).
lot_type(lot_vic_20, buildable).
lot_district(lot_vic_20, chapel_row).
lot_street(lot_vic_20, chapel_street).
lot_side(lot_vic_20, left).
lot_house_number(lot_vic_20, 5).
building(lot_vic_20, business, surgery).
business(lot_vic_20, 'Dr. Hartley Surgery', medical).
business_founded(lot_vic_20, 1845).

%% 9 Chapel Street -- Pemberton Apothecary
lot(lot_vic_21, '9 Chapel Street', ironhaven).
lot_type(lot_vic_21, buildable).
lot_district(lot_vic_21, chapel_row).
lot_street(lot_vic_21, chapel_street).
lot_side(lot_vic_21, right).
lot_house_number(lot_vic_21, 9).
building(lot_vic_21, business, apothecary).
business(lot_vic_21, 'Pemberton Apothecary', apothecary).
business_founded(lot_vic_21, 1838).

%% 13 Chapel Street -- Scholfield Photography Studio
lot(lot_vic_22, '13 Chapel Street', ironhaven).
lot_type(lot_vic_22, buildable).
lot_district(lot_vic_22, chapel_row).
lot_street(lot_vic_22, chapel_street).
lot_side(lot_vic_22, right).
lot_house_number(lot_vic_22, 13).
building(lot_vic_22, business, photography_studio).
business(lot_vic_22, 'Scholfield Photography Studio', photography).
business_founded(lot_vic_22, 1862).

%% ═══════════════════════════════════════════════════════════
%% Coalbridge
%% ═══════════════════════════════════════════════════════════

%% 1 Colliery Road -- Coalbridge Mine
lot(lot_vic_23, '1 Colliery Road', coalbridge).
lot_type(lot_vic_23, buildable).
lot_district(lot_vic_23, pit_village).
lot_street(lot_vic_23, colliery_road).
lot_side(lot_vic_23, left).
lot_house_number(lot_vic_23, 1).
building(lot_vic_23, industrial, coal_mine).
business(lot_vic_23, 'Coalbridge Colliery', mine).
business_founded(lot_vic_23, 1820).

%% 6 Colliery Road -- Miners Cottages
lot(lot_vic_24, '6 Colliery Road', coalbridge).
lot_type(lot_vic_24, buildable).
lot_district(lot_vic_24, pit_village).
lot_street(lot_vic_24, colliery_road).
lot_side(lot_vic_24, left).
lot_house_number(lot_vic_24, 6).
building(lot_vic_24, residential, terrace_housing).

%% 3 High Street -- The Pickaxe Tavern
lot(lot_vic_25, '3 High Street', coalbridge).
lot_type(lot_vic_25, buildable).
lot_district(lot_vic_25, high_street_district).
lot_street(lot_vic_25, high_street).
lot_side(lot_vic_25, left).
lot_house_number(lot_vic_25, 3).
building(lot_vic_25, business, tavern).
business(lot_vic_25, 'The Pickaxe Tavern', pub).
business_founded(lot_vic_25, 1835).

%% ═══════════════════════════════════════════════════════════
%% Ashworth Estate
%% ═══════════════════════════════════════════════════════════

%% 1 Manor Drive -- Ashworth Manor
lot(lot_vic_26, '1 Manor Drive', ashworth_estate).
lot_type(lot_vic_26, buildable).
lot_district(lot_vic_26, estate_grounds).
lot_street(lot_vic_26, manor_drive).
lot_side(lot_vic_26, left).
lot_house_number(lot_vic_26, 1).
building(lot_vic_26, residential, manor_house).

%% 3 Manor Drive -- Stables and Carriage House
lot(lot_vic_27, '3 Manor Drive', ashworth_estate).
lot_type(lot_vic_27, buildable).
lot_district(lot_vic_27, estate_grounds).
lot_street(lot_vic_27, manor_drive).
lot_side(lot_vic_27, left).
lot_house_number(lot_vic_27, 3).
building(lot_vic_27, utility, stables).

%% 5 Manor Drive -- Groundskeeper Cottage
lot(lot_vic_28, '5 Manor Drive', ashworth_estate).
lot_type(lot_vic_28, buildable).
lot_district(lot_vic_28, estate_grounds).
lot_street(lot_vic_28, manor_drive).
lot_side(lot_vic_28, left).
lot_house_number(lot_vic_28, 5).
building(lot_vic_28, residential, cottage).
