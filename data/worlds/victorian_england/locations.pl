%% Insimul Locations (Lots): Victorian England
%% Source: data/worlds/victorian_england/locations.pl
%% Created: 2026-04-03
%% Total: 28 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% ═══════════════════════════════════════════════════════════
%% London Locations
%% ═══════════════════════════════════════════════════════════

%% 1 Mayfair Lane -- Ashford Manor
lot(lot_ve_1, '1 Mayfair Lane', london).
lot_type(lot_ve_1, buildable).
lot_district(lot_ve_1, mayfair).
lot_street(lot_ve_1, mayfair_lane).
lot_side(lot_ve_1, left).
lot_house_number(lot_ve_1, 1).
building(lot_ve_1, residence, manor).

%% 8 Mayfair Lane -- The Reform Club
lot(lot_ve_2, '8 Mayfair Lane', london).
lot_type(lot_ve_2, buildable).
lot_district(lot_ve_2, mayfair).
lot_street(lot_ve_2, mayfair_lane).
lot_side(lot_ve_2, right).
lot_house_number(lot_ve_2, 8).
building(lot_ve_2, business, gentlemens_club).
business(lot_ve_2, 'The Reform Club', gentlemens_club).
business_founded(lot_ve_2, 1836).

%% 15 Mayfair Lane -- Residence (Noble Townhouse)
lot(lot_ve_3, '15 Mayfair Lane', london).
lot_type(lot_ve_3, buildable).
lot_district(lot_ve_3, mayfair).
lot_street(lot_ve_3, mayfair_lane).
lot_side(lot_ve_3, left).
lot_house_number(lot_ve_3, 15).
building(lot_ve_3, residence, townhouse).

%% 22 Mayfair Lane -- Savile Row Tailor
lot(lot_ve_4, '22 Mayfair Lane', london).
lot_type(lot_ve_4, buildable).
lot_district(lot_ve_4, mayfair).
lot_street(lot_ve_4, mayfair_lane).
lot_side(lot_ve_4, right).
lot_house_number(lot_ve_4, 22).
building(lot_ve_4, business, tailor).
business(lot_ve_4, 'Hawthorne and Sons Tailors', tailor).
business_founded(lot_ve_4, 1855).

%% 3 Whitehall Road -- Scotland Yard
lot(lot_ve_5, '3 Whitehall Road', london).
lot_type(lot_ve_5, buildable).
lot_district(lot_ve_5, westminster).
lot_street(lot_ve_5, whitehall_road).
lot_side(lot_ve_5, left).
lot_house_number(lot_ve_5, 3).
building(lot_ve_5, civic, police_station).
business(lot_ve_5, 'Scotland Yard', police_headquarters).
business_founded(lot_ve_5, 1829).

%% 10 Whitehall Road -- Houses of Parliament
lot(lot_ve_6, '10 Whitehall Road', london).
lot_type(lot_ve_6, buildable).
lot_district(lot_ve_6, westminster).
lot_street(lot_ve_6, whitehall_road).
lot_side(lot_ve_6, right).
lot_house_number(lot_ve_6, 10).
building(lot_ve_6, civic, parliament).

%% 18 Whitehall Road -- The War Office
lot(lot_ve_7, '18 Whitehall Road', london).
lot_type(lot_ve_7, buildable).
lot_district(lot_ve_7, westminster).
lot_street(lot_ve_7, whitehall_road).
lot_side(lot_ve_7, left).
lot_house_number(lot_ve_7, 18).
building(lot_ve_7, civic, government_office).
business(lot_ve_7, 'The War Office', government).
business_founded(lot_ve_7, 1857).

%% 25 Whitehall Road -- St. James Park Promenade
lot(lot_ve_8, '25 Whitehall Road', london).
lot_type(lot_ve_8, buildable).
lot_district(lot_ve_8, westminster).
lot_street(lot_ve_8, whitehall_road).
lot_side(lot_ve_8, right).
lot_house_number(lot_ve_8, 25).
building(lot_ve_8, civic, park).

%% 5 Fleet Street -- The Daily Telegraph
lot(lot_ve_9, '5 Fleet Street', london).
lot_type(lot_ve_9, buildable).
lot_district(lot_ve_9, city_of_london).
lot_street(lot_ve_9, fleet_street).
lot_side(lot_ve_9, left).
lot_house_number(lot_ve_9, 5).
building(lot_ve_9, business, newspaper).
business(lot_ve_9, 'The Daily Telegraph', newspaper).
business_founded(lot_ve_9, 1855).

%% 12 Fleet Street -- Ye Olde Cheshire Cheese Pub
lot(lot_ve_10, '12 Fleet Street', london).
lot_type(lot_ve_10, buildable).
lot_district(lot_ve_10, city_of_london).
lot_street(lot_ve_10, fleet_street).
lot_side(lot_ve_10, right).
lot_house_number(lot_ve_10, 12).
building(lot_ve_10, business, pub).
business(lot_ve_10, 'Ye Olde Cheshire Cheese', pub).
business_founded(lot_ve_10, 1667).

%% 20 Fleet Street -- Bank of England Branch
lot(lot_ve_11, '20 Fleet Street', london).
lot_type(lot_ve_11, buildable).
lot_district(lot_ve_11, city_of_london).
lot_street(lot_ve_11, fleet_street).
lot_side(lot_ve_11, left).
lot_house_number(lot_ve_11, 20).
building(lot_ve_11, business, bank).
business(lot_ve_11, 'Bank of England', bank).
business_founded(lot_ve_11, 1694).

%% 28 Fleet Street -- Apothecary
lot(lot_ve_12, '28 Fleet Street', london).
lot_type(lot_ve_12, buildable).
lot_district(lot_ve_12, city_of_london).
lot_street(lot_ve_12, fleet_street).
lot_side(lot_ve_12, right).
lot_house_number(lot_ve_12, 28).
building(lot_ve_12, business, apothecary).
business(lot_ve_12, 'Pemberton Apothecary', apothecary).
business_founded(lot_ve_12, 1820).

%% 3 Gaslight Alley -- The Workhouse
lot(lot_ve_13, '3 Gaslight Alley', london).
lot_type(lot_ve_13, buildable).
lot_district(lot_ve_13, east_end).
lot_street(lot_ve_13, gaslight_alley).
lot_side(lot_ve_13, left).
lot_house_number(lot_ve_13, 3).
building(lot_ve_13, civic, workhouse).
business(lot_ve_13, 'St. Giles Workhouse', workhouse).
business_founded(lot_ve_13, 1835).

%% 10 Gaslight Alley -- The Lamb and Flag Tavern
lot(lot_ve_14, '10 Gaslight Alley', london).
lot_type(lot_ve_14, buildable).
lot_district(lot_ve_14, east_end).
lot_street(lot_ve_14, gaslight_alley).
lot_side(lot_ve_14, right).
lot_house_number(lot_ve_14, 10).
building(lot_ve_14, business, tavern).
business(lot_ve_14, 'The Lamb and Flag', tavern).
business_founded(lot_ve_14, 1772).

%% 18 Gaslight Alley -- Pawnbroker
lot(lot_ve_15, '18 Gaslight Alley', london).
lot_type(lot_ve_15, buildable).
lot_district(lot_ve_15, east_end).
lot_street(lot_ve_15, gaslight_alley).
lot_side(lot_ve_15, left).
lot_house_number(lot_ve_15, 18).
building(lot_ve_15, business, pawnbroker).
business(lot_ve_15, 'Grimshaw Pawnbroker', pawnbroker).
business_founded(lot_ve_15, 1860).

%% 25 Gaslight Alley -- Tenement Block
lot(lot_ve_16, '25 Gaslight Alley', london).
lot_type(lot_ve_16, buildable).
lot_district(lot_ve_16, east_end).
lot_street(lot_ve_16, gaslight_alley).
lot_side(lot_ve_16, right).
lot_house_number(lot_ve_16, 25).
building(lot_ve_16, residence, tenement).

%% 32 Gaslight Alley -- Tenement Block
lot(lot_ve_17, '32 Gaslight Alley', london).
lot_type(lot_ve_17, buildable).
lot_district(lot_ve_17, east_end).
lot_street(lot_ve_17, gaslight_alley).
lot_side(lot_ve_17, left).
lot_house_number(lot_ve_17, 32).
building(lot_ve_17, residence, tenement).

%% 5 Bloomsbury Square -- The British Museum
lot(lot_ve_18, '5 Bloomsbury Square', london).
lot_type(lot_ve_18, buildable).
lot_district(lot_ve_18, bloomsbury).
lot_street(lot_ve_18, bloomsbury_square).
lot_side(lot_ve_18, left).
lot_house_number(lot_ve_18, 5).
building(lot_ve_18, civic, museum).
business(lot_ve_18, 'The British Museum', museum).
business_founded(lot_ve_18, 1753).

%% 12 Bloomsbury Square -- University College London
lot(lot_ve_19, '12 Bloomsbury Square', london).
lot_type(lot_ve_19, buildable).
lot_district(lot_ve_19, bloomsbury).
lot_street(lot_ve_19, bloomsbury_square).
lot_side(lot_ve_19, right).
lot_house_number(lot_ve_19, 12).
building(lot_ve_19, civic, university).
business(lot_ve_19, 'University College London', university).
business_founded(lot_ve_19, 1826).

%% 20 Bloomsbury Square -- Public Library
lot(lot_ve_20, '20 Bloomsbury Square', london).
lot_type(lot_ve_20, buildable).
lot_district(lot_ve_20, bloomsbury).
lot_street(lot_ve_20, bloomsbury_square).
lot_side(lot_ve_20, left).
lot_house_number(lot_ve_20, 20).
building(lot_ve_20, civic, library).
business(lot_ve_20, 'Bloomsbury Public Library', library).
business_founded(lot_ve_20, 1850).

%% ═══════════════════════════════════════════════════════════
%% Manchester Locations
%% ═══════════════════════════════════════════════════════════

%% 1 Cotton Row -- Dickens Textile Mill
lot(lot_ve_21, '1 Cotton Row', manchester).
lot_type(lot_ve_21, buildable).
lot_district(lot_ve_21, industrial_quarter).
lot_street(lot_ve_21, cotton_row).
lot_side(lot_ve_21, left).
lot_house_number(lot_ve_21, 1).
building(lot_ve_21, business, factory).
business(lot_ve_21, 'Dickens Textile Mill', factory).
business_founded(lot_ve_21, 1865).

%% 8 Cotton Row -- Steam Engine Workshop
lot(lot_ve_22, '8 Cotton Row', manchester).
lot_type(lot_ve_22, buildable).
lot_district(lot_ve_22, industrial_quarter).
lot_street(lot_ve_22, cotton_row).
lot_side(lot_ve_22, right).
lot_house_number(lot_ve_22, 8).
building(lot_ve_22, business, workshop).
business(lot_ve_22, 'Edison Steam Workshop', workshop).
business_founded(lot_ve_22, 1870).

%% 15 Cotton Row -- Workers Tenement
lot(lot_ve_23, '15 Cotton Row', manchester).
lot_type(lot_ve_23, buildable).
lot_district(lot_ve_23, industrial_quarter).
lot_street(lot_ve_23, cotton_row).
lot_side(lot_ve_23, left).
lot_house_number(lot_ve_23, 15).
building(lot_ve_23, residence, tenement).

%% 22 Cotton Row -- The Iron Horse Pub
lot(lot_ve_24, '22 Cotton Row', manchester).
lot_type(lot_ve_24, buildable).
lot_district(lot_ve_24, industrial_quarter).
lot_street(lot_ve_24, cotton_row).
lot_side(lot_ve_24, right).
lot_house_number(lot_ve_24, 22).
building(lot_ve_24, business, pub).
business(lot_ve_24, 'The Iron Horse', pub).
business_founded(lot_ve_24, 1840).

%% 3 Market Street -- Manchester Exchange
lot(lot_ve_25, '3 Market Street', manchester).
lot_type(lot_ve_25, buildable).
lot_district(lot_ve_25, town_center).
lot_street(lot_ve_25, market_street).
lot_side(lot_ve_25, left).
lot_house_number(lot_ve_25, 3).
building(lot_ve_25, business, exchange).
business(lot_ve_25, 'Manchester Cotton Exchange', exchange).
business_founded(lot_ve_25, 1837).

%% 10 Market Street -- Town Hall
lot(lot_ve_26, '10 Market Street', manchester).
lot_type(lot_ve_26, buildable).
lot_district(lot_ve_26, town_center).
lot_street(lot_ve_26, market_street).
lot_side(lot_ve_26, right).
lot_house_number(lot_ve_26, 10).
building(lot_ve_26, civic, town_hall).

%% 18 Market Street -- General Provisions Shop
lot(lot_ve_27, '18 Market Street', manchester).
lot_type(lot_ve_27, buildable).
lot_district(lot_ve_27, town_center).
lot_street(lot_ve_27, market_street).
lot_side(lot_ve_27, left).
lot_house_number(lot_ve_27, 18).
building(lot_ve_27, business, shop).
business(lot_ve_27, 'Whitmore General Provisions', shop).
business_founded(lot_ve_27, 1852).

%% 25 Market Street -- Railway Station
lot(lot_ve_28, '25 Market Street', manchester).
lot_type(lot_ve_28, buildable).
lot_district(lot_ve_28, town_center).
lot_street(lot_ve_28, market_street).
lot_side(lot_ve_28, right).
lot_house_number(lot_ve_28, 25).
building(lot_ve_28, civic, railway_station).
business(lot_ve_28, 'Manchester Victoria Station', railway).
business_founded(lot_ve_28, 1844).
