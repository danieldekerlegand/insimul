%% Insimul Locations (Lots): Post-Apocalyptic Wasteland
%% Source: data/worlds/post_apocalyptic/locations.pl
%% Created: 2026-04-03
%% Total: 28 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% ═══════════════════════════════════════════════════════════
%% Haven Ridge -- Inner Compound
%% ═══════════════════════════════════════════════════════════

%% 1 Ridge Road -- Command Post
lot(lot_pa_1, '1 Ridge Road', haven_ridge).
lot_type(lot_pa_1, buildable).
lot_district(lot_pa_1, inner_compound).
lot_street(lot_pa_1, ridge_road).
lot_side(lot_pa_1, left).
lot_house_number(lot_pa_1, 1).
building(lot_pa_1, civic, command_post).

%% 5 Ridge Road -- Militia Barracks
lot(lot_pa_2, '5 Ridge Road', haven_ridge).
lot_type(lot_pa_2, buildable).
lot_district(lot_pa_2, inner_compound).
lot_street(lot_pa_2, ridge_road).
lot_side(lot_pa_2, right).
lot_house_number(lot_pa_2, 5).
building(lot_pa_2, civic, barracks).

%% 10 Ridge Road -- Field Hospital
lot(lot_pa_3, '10 Ridge Road', haven_ridge).
lot_type(lot_pa_3, buildable).
lot_district(lot_pa_3, inner_compound).
lot_street(lot_pa_3, ridge_road).
lot_side(lot_pa_3, left).
lot_house_number(lot_pa_3, 10).
building(lot_pa_3, civic, hospital).

%% 15 Ridge Road -- Residence (Founders)
lot(lot_pa_4, '15 Ridge Road', haven_ridge).
lot_type(lot_pa_4, buildable).
lot_district(lot_pa_4, inner_compound).
lot_street(lot_pa_4, ridge_road).
lot_side(lot_pa_4, right).
lot_house_number(lot_pa_4, 15).
building(lot_pa_4, residence, bunker_house).

%% 3 Wall Walk -- Armory
lot(lot_pa_5, '3 Wall Walk', haven_ridge).
lot_type(lot_pa_5, buildable).
lot_district(lot_pa_5, inner_compound).
lot_street(lot_pa_5, wall_walk).
lot_side(lot_pa_5, left).
lot_house_number(lot_pa_5, 3).
building(lot_pa_5, civic, armory).

%% 8 Wall Walk -- Radio Tower
lot(lot_pa_6, '8 Wall Walk', haven_ridge).
lot_type(lot_pa_6, buildable).
lot_district(lot_pa_6, inner_compound).
lot_street(lot_pa_6, wall_walk).
lot_side(lot_pa_6, right).
lot_house_number(lot_pa_6, 8).
building(lot_pa_6, civic, radio_tower).

%% ═══════════════════════════════════════════════════════════
%% Haven Ridge -- Scrap Quarter
%% ═══════════════════════════════════════════════════════════

%% 2 Salvage Row -- Scrap Market
lot(lot_pa_7, '2 Salvage Row', haven_ridge).
lot_type(lot_pa_7, buildable).
lot_district(lot_pa_7, scrap_quarter).
lot_street(lot_pa_7, salvage_row).
lot_side(lot_pa_7, left).
lot_house_number(lot_pa_7, 2).
building(lot_pa_7, business, market).
business(lot_pa_7, 'Junkyard Bazaar', market).
business_founded(lot_pa_7, 2033).

%% 8 Salvage Row -- Weapon Smith
lot(lot_pa_8, '8 Salvage Row', haven_ridge).
lot_type(lot_pa_8, buildable).
lot_district(lot_pa_8, scrap_quarter).
lot_street(lot_pa_8, salvage_row).
lot_side(lot_pa_8, right).
lot_house_number(lot_pa_8, 8).
building(lot_pa_8, business, workshop).
business(lot_pa_8, 'Ironhide Forge', workshop).
business_founded(lot_pa_8, 2034).

%% 14 Salvage Row -- Chem Lab
lot(lot_pa_9, '14 Salvage Row', haven_ridge).
lot_type(lot_pa_9, buildable).
lot_district(lot_pa_9, scrap_quarter).
lot_street(lot_pa_9, salvage_row).
lot_side(lot_pa_9, left).
lot_house_number(lot_pa_9, 14).
building(lot_pa_9, business, workshop).
business(lot_pa_9, 'Bitter Root Chem Lab', workshop).
business_founded(lot_pa_9, 2036).

%% 20 Salvage Row -- Tavern
lot(lot_pa_10, '20 Salvage Row', haven_ridge).
lot_type(lot_pa_10, buildable).
lot_district(lot_pa_10, scrap_quarter).
lot_street(lot_pa_10, salvage_row).
lot_side(lot_pa_10, right).
lot_house_number(lot_pa_10, 20).
building(lot_pa_10, business, tavern).
business(lot_pa_10, 'The Rusty Nail', tavern).
business_founded(lot_pa_10, 2034).

%% 4 Barter Lane -- General Store
lot(lot_pa_11, '4 Barter Lane', haven_ridge).
lot_type(lot_pa_11, buildable).
lot_district(lot_pa_11, scrap_quarter).
lot_street(lot_pa_11, barter_lane).
lot_side(lot_pa_11, left).
lot_house_number(lot_pa_11, 4).
building(lot_pa_11, business, shop).
business(lot_pa_11, 'Scraps and Sundries', shop).
business_founded(lot_pa_11, 2033).

%% 10 Barter Lane -- Residence
lot(lot_pa_12, '10 Barter Lane', haven_ridge).
lot_type(lot_pa_12, buildable).
lot_district(lot_pa_12, scrap_quarter).
lot_street(lot_pa_12, barter_lane).
lot_side(lot_pa_12, right).
lot_house_number(lot_pa_12, 10).
building(lot_pa_12, residence, shack).

%% ═══════════════════════════════════════════════════════════
%% Haven Ridge -- Water Works
%% ═══════════════════════════════════════════════════════════

%% 2 Pipe Alley -- Water Purification Plant
lot(lot_pa_13, '2 Pipe Alley', haven_ridge).
lot_type(lot_pa_13, buildable).
lot_district(lot_pa_13, water_works).
lot_street(lot_pa_13, pipe_alley).
lot_side(lot_pa_13, left).
lot_house_number(lot_pa_13, 2).
building(lot_pa_13, civic, water_purifier).

%% 8 Pipe Alley -- Greenhouse
lot(lot_pa_14, '8 Pipe Alley', haven_ridge).
lot_type(lot_pa_14, buildable).
lot_district(lot_pa_14, water_works).
lot_street(lot_pa_14, pipe_alley).
lot_side(lot_pa_14, right).
lot_house_number(lot_pa_14, 8).
building(lot_pa_14, business, farm).
business(lot_pa_14, 'Hydro Greenhouse', farm).
business_founded(lot_pa_14, 2035).

%% 14 Pipe Alley -- Reservoir Guard Post
lot(lot_pa_15, '14 Pipe Alley', haven_ridge).
lot_type(lot_pa_15, buildable).
lot_district(lot_pa_15, water_works).
lot_street(lot_pa_15, pipe_alley).
lot_side(lot_pa_15, left).
lot_house_number(lot_pa_15, 14).
building(lot_pa_15, civic, guard_post).

%% ═══════════════════════════════════════════════════════════
%% Rusthollow -- Foundry Ruins
%% ═══════════════════════════════════════════════════════════

%% 1 Girder Path -- Salvage Workshop
lot(lot_pa_16, '1 Girder Path', rusthollow).
lot_type(lot_pa_16, buildable).
lot_district(lot_pa_16, foundry_ruins).
lot_street(lot_pa_16, girder_path).
lot_side(lot_pa_16, left).
lot_house_number(lot_pa_16, 1).
building(lot_pa_16, business, workshop).
business(lot_pa_16, 'Grinder Workshop', workshop).
business_founded(lot_pa_16, 2035).

%% 7 Girder Path -- Irradiated Zone (Warning)
lot(lot_pa_17, '7 Girder Path', rusthollow).
lot_type(lot_pa_17, hazardous).
lot_district(lot_pa_17, foundry_ruins).
lot_street(lot_pa_17, girder_path).
lot_side(lot_pa_17, right).
lot_house_number(lot_pa_17, 7).
building(lot_pa_17, hazard, irradiated_zone).

%% 13 Girder Path -- Mutant Den
lot(lot_pa_18, '13 Girder Path', rusthollow).
lot_type(lot_pa_18, hazardous).
lot_district(lot_pa_18, foundry_ruins).
lot_street(lot_pa_18, girder_path).
lot_side(lot_pa_18, left).
lot_house_number(lot_pa_18, 13).
building(lot_pa_18, hazard, mutant_den).

%% 3 Soot Lane -- Scrap Dealer
lot(lot_pa_19, '3 Soot Lane', rusthollow).
lot_type(lot_pa_19, buildable).
lot_district(lot_pa_19, foundry_ruins).
lot_street(lot_pa_19, soot_lane).
lot_side(lot_pa_19, left).
lot_house_number(lot_pa_19, 3).
building(lot_pa_19, business, shop).
business(lot_pa_19, 'Grit and Steel', shop).
business_founded(lot_pa_19, 2036).

%% 9 Soot Lane -- Underground Bunker
lot(lot_pa_20, '9 Soot Lane', rusthollow).
lot_type(lot_pa_20, buildable).
lot_district(lot_pa_20, foundry_ruins).
lot_street(lot_pa_20, soot_lane).
lot_side(lot_pa_20, right).
lot_house_number(lot_pa_20, 9).
building(lot_pa_20, residence, bunker).

%% ═══════════════════════════════════════════════════════════
%% Rusthollow -- Tent City
%% ═══════════════════════════════════════════════════════════

%% 2 Rubble Trail -- Tent Shelter
lot(lot_pa_21, '2 Rubble Trail', rusthollow).
lot_type(lot_pa_21, buildable).
lot_district(lot_pa_21, tent_city).
lot_street(lot_pa_21, rubble_trail).
lot_side(lot_pa_21, left).
lot_house_number(lot_pa_21, 2).
building(lot_pa_21, residence, tent).

%% 6 Rubble Trail -- Field Kitchen
lot(lot_pa_22, '6 Rubble Trail', rusthollow).
lot_type(lot_pa_22, buildable).
lot_district(lot_pa_22, tent_city).
lot_street(lot_pa_22, rubble_trail).
lot_side(lot_pa_22, right).
lot_house_number(lot_pa_22, 6).
building(lot_pa_22, business, kitchen).
business(lot_pa_22, 'Bone Broth Kitchen', kitchen).
business_founded(lot_pa_22, 2036).

%% 10 Rubble Trail -- Healer Tent
lot(lot_pa_23, '10 Rubble Trail', rusthollow).
lot_type(lot_pa_23, buildable).
lot_district(lot_pa_23, tent_city).
lot_street(lot_pa_23, rubble_trail).
lot_side(lot_pa_23, left).
lot_house_number(lot_pa_23, 10).
building(lot_pa_23, civic, clinic).

%% ═══════════════════════════════════════════════════════════
%% Iron Fang Stronghold
%% ═══════════════════════════════════════════════════════════

%% 1 Blood Road -- Warlord Throne Room
lot(lot_pa_24, '1 Blood Road', iron_fang_stronghold).
lot_type(lot_pa_24, buildable).
lot_district(lot_pa_24, war_hall).
lot_street(lot_pa_24, blood_road).
lot_side(lot_pa_24, left).
lot_house_number(lot_pa_24, 1).
building(lot_pa_24, civic, throne_room).

%% 5 Blood Road -- Raider Armory
lot(lot_pa_25, '5 Blood Road', iron_fang_stronghold).
lot_type(lot_pa_25, buildable).
lot_district(lot_pa_25, war_hall).
lot_street(lot_pa_25, blood_road).
lot_side(lot_pa_25, right).
lot_house_number(lot_pa_25, 5).
building(lot_pa_25, civic, armory).

%% 9 Blood Road -- Slave Pens
lot(lot_pa_26, '9 Blood Road', iron_fang_stronghold).
lot_type(lot_pa_26, buildable).
lot_district(lot_pa_26, war_hall).
lot_street(lot_pa_26, blood_road).
lot_side(lot_pa_26, left).
lot_house_number(lot_pa_26, 9).
building(lot_pa_26, civic, prison).

%% 13 Blood Road -- Fighting Pit
lot(lot_pa_27, '13 Blood Road', iron_fang_stronghold).
lot_type(lot_pa_27, buildable).
lot_district(lot_pa_27, war_hall).
lot_street(lot_pa_27, blood_road).
lot_side(lot_pa_27, right).
lot_house_number(lot_pa_27, 13).
building(lot_pa_27, business, arena).
business(lot_pa_27, 'The Pit', arena).
business_founded(lot_pa_27, 2034).

%% 17 Blood Road -- Black Market
lot(lot_pa_28, '17 Blood Road', iron_fang_stronghold).
lot_type(lot_pa_28, buildable).
lot_district(lot_pa_28, war_hall).
lot_street(lot_pa_28, blood_road).
lot_side(lot_pa_28, left).
lot_house_number(lot_pa_28, 17).
building(lot_pa_28, business, market).
business(lot_pa_28, 'Iron Fang Black Market', market).
business_founded(lot_pa_28, 2033).
