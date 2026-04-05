%% Insimul Locations (Lots): Wild West
%% Source: data/worlds/wild_west/locations.pl
%% Created: 2026-04-03
%% Total: 28 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% ═══════════════════════════════════════════════════════════
%% Redemption Gulch -- Main Street District
%% ═══════════════════════════════════════════════════════════

%% 1 Main Street -- Silver Spur Saloon
lot(lot_ww_1, '1 Main Street', redemption_gulch).
lot_type(lot_ww_1, buildable).
lot_district(lot_ww_1, main_street_district).
lot_street(lot_ww_1, main_street).
lot_side(lot_ww_1, left).
lot_house_number(lot_ww_1, 1).
building(lot_ww_1, business, saloon).
business(lot_ww_1, 'Silver Spur Saloon', saloon).
business_founded(lot_ww_1, 1863).

%% 5 Main Street -- Sheriff Office
lot(lot_ww_2, '5 Main Street', redemption_gulch).
lot_type(lot_ww_2, buildable).
lot_district(lot_ww_2, main_street_district).
lot_street(lot_ww_2, main_street).
lot_side(lot_ww_2, right).
lot_house_number(lot_ww_2, 5).
building(lot_ww_2, civic, sheriff_office).

%% 10 Main Street -- General Store
lot(lot_ww_3, '10 Main Street', redemption_gulch).
lot_type(lot_ww_3, buildable).
lot_district(lot_ww_3, main_street_district).
lot_street(lot_ww_3, main_street).
lot_side(lot_ww_3, left).
lot_house_number(lot_ww_3, 10).
building(lot_ww_3, business, general_store).
business(lot_ww_3, 'Hendricks General Store', general_store).
business_founded(lot_ww_3, 1862).

%% 15 Main Street -- Bank
lot(lot_ww_4, '15 Main Street', redemption_gulch).
lot_type(lot_ww_4, buildable).
lot_district(lot_ww_4, main_street_district).
lot_street(lot_ww_4, main_street).
lot_side(lot_ww_4, right).
lot_house_number(lot_ww_4, 15).
building(lot_ww_4, business, bank).
business(lot_ww_4, 'Redemption Savings and Trust', bank).
business_founded(lot_ww_4, 1868).

%% 20 Main Street -- Hotel
lot(lot_ww_5, '20 Main Street', redemption_gulch).
lot_type(lot_ww_5, buildable).
lot_district(lot_ww_5, main_street_district).
lot_street(lot_ww_5, main_street).
lot_side(lot_ww_5, left).
lot_house_number(lot_ww_5, 20).
building(lot_ww_5, business, hotel).
business(lot_ww_5, 'Grand Western Hotel', hotel).
business_founded(lot_ww_5, 1866).

%% 25 Main Street -- Barbershop
lot(lot_ww_6, '25 Main Street', redemption_gulch).
lot_type(lot_ww_6, buildable).
lot_district(lot_ww_6, main_street_district).
lot_street(lot_ww_6, main_street).
lot_side(lot_ww_6, right).
lot_house_number(lot_ww_6, 25).
building(lot_ww_6, business, barbershop).
business(lot_ww_6, 'Sweeney Barber Shop', barbershop).
business_founded(lot_ww_6, 1864).

%% 3 Dusty Trail -- Church
lot(lot_ww_7, '3 Dusty Trail', redemption_gulch).
lot_type(lot_ww_7, buildable).
lot_district(lot_ww_7, main_street_district).
lot_street(lot_ww_7, dusty_trail).
lot_side(lot_ww_7, left).
lot_house_number(lot_ww_7, 3).
building(lot_ww_7, civic, church).

%% 8 Dusty Trail -- Doctor Office
lot(lot_ww_8, '8 Dusty Trail', redemption_gulch).
lot_type(lot_ww_8, buildable).
lot_district(lot_ww_8, main_street_district).
lot_street(lot_ww_8, dusty_trail).
lot_side(lot_ww_8, right).
lot_house_number(lot_ww_8, 8).
building(lot_ww_8, business, doctor_office).
business(lot_ww_8, 'Doc Whitfield Office', doctor_office).
business_founded(lot_ww_8, 1865).

%% 14 Dusty Trail -- Undertaker
lot(lot_ww_9, '14 Dusty Trail', redemption_gulch).
lot_type(lot_ww_9, buildable).
lot_district(lot_ww_9, main_street_district).
lot_street(lot_ww_9, dusty_trail).
lot_side(lot_ww_9, left).
lot_house_number(lot_ww_9, 14).
building(lot_ww_9, business, undertaker).
business(lot_ww_9, 'Pine Box Parlor', undertaker).
business_founded(lot_ww_9, 1864).

%% 20 Dusty Trail -- Residence (Sheriff quarters)
lot(lot_ww_10, '20 Dusty Trail', redemption_gulch).
lot_type(lot_ww_10, buildable).
lot_district(lot_ww_10, main_street_district).
lot_street(lot_ww_10, dusty_trail).
lot_side(lot_ww_10, right).
lot_house_number(lot_ww_10, 20).
building(lot_ww_10, residence, house).

%% ═══════════════════════════════════════════════════════════
%% Redemption Gulch -- Cattle Quarter
%% ═══════════════════════════════════════════════════════════

%% 2 Cattle Road -- Livery Stable
lot(lot_ww_11, '2 Cattle Road', redemption_gulch).
lot_type(lot_ww_11, buildable).
lot_district(lot_ww_11, cattle_quarter).
lot_street(lot_ww_11, cattle_road).
lot_side(lot_ww_11, left).
lot_house_number(lot_ww_11, 2).
building(lot_ww_11, business, livery_stable).
business(lot_ww_11, 'McCoy Livery Stable', livery_stable).
business_founded(lot_ww_11, 1863).

%% 8 Cattle Road -- Blacksmith
lot(lot_ww_12, '8 Cattle Road', redemption_gulch).
lot_type(lot_ww_12, buildable).
lot_district(lot_ww_12, cattle_quarter).
lot_street(lot_ww_12, cattle_road).
lot_side(lot_ww_12, right).
lot_house_number(lot_ww_12, 8).
building(lot_ww_12, business, blacksmith).
business(lot_ww_12, 'Iron Will Forge', blacksmith).
business_founded(lot_ww_12, 1864).

%% 14 Cattle Road -- Stockyard
lot(lot_ww_13, '14 Cattle Road', redemption_gulch).
lot_type(lot_ww_13, buildable).
lot_district(lot_ww_13, cattle_quarter).
lot_street(lot_ww_13, cattle_road).
lot_side(lot_ww_13, left).
lot_house_number(lot_ww_13, 14).
building(lot_ww_13, business, stockyard).
business(lot_ww_13, 'Redemption Stockyard', stockyard).
business_founded(lot_ww_13, 1866).

%% 3 Stockyard Lane -- Feed Store
lot(lot_ww_14, '3 Stockyard Lane', redemption_gulch).
lot_type(lot_ww_14, buildable).
lot_district(lot_ww_14, cattle_quarter).
lot_street(lot_ww_14, stockyard_lane).
lot_side(lot_ww_14, left).
lot_house_number(lot_ww_14, 3).
building(lot_ww_14, business, feed_store).
business(lot_ww_14, 'Prairie Feed and Seed', feed_store).
business_founded(lot_ww_14, 1867).

%% 10 Stockyard Lane -- Residence
lot(lot_ww_15, '10 Stockyard Lane', redemption_gulch).
lot_type(lot_ww_15, buildable).
lot_district(lot_ww_15, cattle_quarter).
lot_street(lot_ww_15, stockyard_lane).
lot_side(lot_ww_15, right).
lot_house_number(lot_ww_15, 10).
building(lot_ww_15, residence, house).

%% ═══════════════════════════════════════════════════════════
%% Redemption Gulch -- Rail District
%% ═══════════════════════════════════════════════════════════

%% 1 Depot Road -- Train Station
lot(lot_ww_16, '1 Depot Road', redemption_gulch).
lot_type(lot_ww_16, buildable).
lot_district(lot_ww_16, rail_district).
lot_street(lot_ww_16, depot_road).
lot_side(lot_ww_16, left).
lot_house_number(lot_ww_16, 1).
building(lot_ww_16, civic, train_station).

%% 7 Depot Road -- Telegraph Office
lot(lot_ww_17, '7 Depot Road', redemption_gulch).
lot_type(lot_ww_17, buildable).
lot_district(lot_ww_17, rail_district).
lot_street(lot_ww_17, depot_road).
lot_side(lot_ww_17, right).
lot_house_number(lot_ww_17, 7).
building(lot_ww_17, business, telegraph_office).
business(lot_ww_17, 'Western Union Telegraph', telegraph_office).
business_founded(lot_ww_17, 1871).

%% 14 Depot Road -- Newspaper Office
lot(lot_ww_18, '14 Depot Road', redemption_gulch).
lot_type(lot_ww_18, buildable).
lot_district(lot_ww_18, rail_district).
lot_street(lot_ww_18, depot_road).
lot_side(lot_ww_18, left).
lot_house_number(lot_ww_18, 14).
building(lot_ww_18, business, newspaper).
business(lot_ww_18, 'Redemption Gazette', newspaper).
business_founded(lot_ww_18, 1870).

%% 5 Freight Alley -- Freight Depot
lot(lot_ww_19, '5 Freight Alley', redemption_gulch).
lot_type(lot_ww_19, buildable).
lot_district(lot_ww_19, rail_district).
lot_street(lot_ww_19, freight_alley).
lot_side(lot_ww_19, left).
lot_house_number(lot_ww_19, 5).
building(lot_ww_19, business, freight_depot).
business(lot_ww_19, 'Overland Freight Co.', freight_depot).
business_founded(lot_ww_19, 1871).

%% 12 Freight Alley -- Residence
lot(lot_ww_20, '12 Freight Alley', redemption_gulch).
lot_type(lot_ww_20, buildable).
lot_district(lot_ww_20, rail_district).
lot_street(lot_ww_20, freight_alley).
lot_side(lot_ww_20, right).
lot_house_number(lot_ww_20, 12).
building(lot_ww_20, residence, house).

%% ═══════════════════════════════════════════════════════════
%% Copper Ridge -- Mine District
%% ═══════════════════════════════════════════════════════════

%% 1 Mine Road -- Silver Lode Mine Entrance
lot(lot_ww_21, '1 Mine Road', copper_ridge).
lot_type(lot_ww_21, buildable).
lot_district(lot_ww_21, mine_district).
lot_street(lot_ww_21, mine_road).
lot_side(lot_ww_21, left).
lot_house_number(lot_ww_21, 1).
building(lot_ww_21, business, mine).
business(lot_ww_21, 'Silver Lode Mine', mine).
business_founded(lot_ww_21, 1869).

%% 8 Mine Road -- Assay Office
lot(lot_ww_22, '8 Mine Road', copper_ridge).
lot_type(lot_ww_22, buildable).
lot_district(lot_ww_22, mine_district).
lot_street(lot_ww_22, mine_road).
lot_side(lot_ww_22, right).
lot_house_number(lot_ww_22, 8).
building(lot_ww_22, business, assay_office).
business(lot_ww_22, 'Ridge Assay Office', assay_office).
business_founded(lot_ww_22, 1870).

%% 3 Prospector Path -- Dynamite Shack
lot(lot_ww_23, '3 Prospector Path', copper_ridge).
lot_type(lot_ww_23, buildable).
lot_district(lot_ww_23, mine_district).
lot_street(lot_ww_23, prospector_path).
lot_side(lot_ww_23, left).
lot_house_number(lot_ww_23, 3).
building(lot_ww_23, business, explosives_store).
business(lot_ww_23, 'Nobel Powder Supply', explosives_store).
business_founded(lot_ww_23, 1870).

%% ═══════════════════════════════════════════════════════════
%% Copper Ridge -- Camp Center
%% ═══════════════════════════════════════════════════════════

%% 1 Camp Trail -- Miners Saloon
lot(lot_ww_24, '1 Camp Trail', copper_ridge).
lot_type(lot_ww_24, buildable).
lot_district(lot_ww_24, camp_center).
lot_street(lot_ww_24, camp_trail).
lot_side(lot_ww_24, left).
lot_house_number(lot_ww_24, 1).
building(lot_ww_24, business, saloon).
business(lot_ww_24, 'Nugget Saloon', saloon).
business_founded(lot_ww_24, 1870).

%% 6 Camp Trail -- Camp Store
lot(lot_ww_25, '6 Camp Trail', copper_ridge).
lot_type(lot_ww_25, buildable).
lot_district(lot_ww_25, camp_center).
lot_street(lot_ww_25, camp_trail).
lot_side(lot_ww_25, right).
lot_house_number(lot_ww_25, 6).
building(lot_ww_25, business, general_store).
business(lot_ww_25, 'Camp Supply Co.', general_store).
business_founded(lot_ww_25, 1870).

%% 12 Camp Trail -- Bunkhouse
lot(lot_ww_26, '12 Camp Trail', copper_ridge).
lot_type(lot_ww_26, buildable).
lot_district(lot_ww_26, camp_center).
lot_street(lot_ww_26, camp_trail).
lot_side(lot_ww_26, left).
lot_house_number(lot_ww_26, 12).
building(lot_ww_26, residence, bunkhouse).

%% ═══════════════════════════════════════════════════════════
%% Broken Bow Ranch
%% ═══════════════════════════════════════════════════════════

%% 1 Ranch Road -- Ranch House
lot(lot_ww_27, '1 Ranch Road', broken_bow).
lot_type(lot_ww_27, buildable).
lot_district(lot_ww_27, ranch_grounds).
lot_street(lot_ww_27, ranch_road).
lot_side(lot_ww_27, left).
lot_house_number(lot_ww_27, 1).
building(lot_ww_27, residence, ranch_house).

%% 5 Ranch Road -- Barn and Corral
lot(lot_ww_28, '5 Ranch Road', broken_bow).
lot_type(lot_ww_28, buildable).
lot_district(lot_ww_28, ranch_grounds).
lot_street(lot_ww_28, ranch_road).
lot_side(lot_ww_28, right).
lot_house_number(lot_ww_28, 5).
building(lot_ww_28, business, barn).
business(lot_ww_28, 'Broken Bow Barn', barn).
business_founded(lot_ww_28, 1858).
