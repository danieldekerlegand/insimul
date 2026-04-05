%% Insimul Locations (Lots): Dieselpunk
%% Source: data/worlds/dieselpunk/locations.pl
%% Created: 2026-04-03
%% Total: 28 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% ═══════════════════════════════════════════════════════════
%% Ironhaven — Factory Row
%% ═══════════════════════════════════════════════════════════

%% 4 Rivet Lane — Krause Munitions Factory
lot(lot_dp_1, '4 Rivet Lane', ironhaven).
lot_type(lot_dp_1, buildable).
lot_district(lot_dp_1, factory_row).
lot_street(lot_dp_1, rivet_lane).
lot_side(lot_dp_1, left).
lot_house_number(lot_dp_1, 4).
building(lot_dp_1, business, factory).
business(lot_dp_1, 'Krause Munitions', factory).
business_founded(lot_dp_1, 1916).

%% 12 Rivet Lane — Ironworks
lot(lot_dp_2, '12 Rivet Lane', ironhaven).
lot_type(lot_dp_2, buildable).
lot_district(lot_dp_2, factory_row).
lot_street(lot_dp_2, rivet_lane).
lot_side(lot_dp_2, right).
lot_house_number(lot_dp_2, 12).
building(lot_dp_2, business, factory).
business(lot_dp_2, 'Ironhaven Steelworks', factory).
business_founded(lot_dp_2, 1893).

%% 20 Rivet Lane — Worker Tenement
lot(lot_dp_3, '20 Rivet Lane', ironhaven).
lot_type(lot_dp_3, buildable).
lot_district(lot_dp_3, factory_row).
lot_street(lot_dp_3, rivet_lane).
lot_side(lot_dp_3, left).
lot_house_number(lot_dp_3, 20).
building(lot_dp_3, residence, tenement).

%% 5 Piston Avenue — Diesel Engine Workshop
lot(lot_dp_4, '5 Piston Avenue', ironhaven).
lot_type(lot_dp_4, buildable).
lot_district(lot_dp_4, factory_row).
lot_street(lot_dp_4, piston_avenue).
lot_side(lot_dp_4, left).
lot_house_number(lot_dp_4, 5).
building(lot_dp_4, business, workshop).
business(lot_dp_4, 'Gruber Diesel Works', workshop).
business_founded(lot_dp_4, 1924).

%% 15 Piston Avenue — Union Hall
lot(lot_dp_5, '15 Piston Avenue', ironhaven).
lot_type(lot_dp_5, buildable).
lot_district(lot_dp_5, factory_row).
lot_street(lot_dp_5, piston_avenue).
lot_side(lot_dp_5, right).
lot_house_number(lot_dp_5, 15).
building(lot_dp_5, civic, union_hall).

%% 25 Piston Avenue — Workers Canteen
lot(lot_dp_6, '25 Piston Avenue', ironhaven).
lot_type(lot_dp_6, buildable).
lot_district(lot_dp_6, factory_row).
lot_street(lot_dp_6, piston_avenue).
lot_side(lot_dp_6, left).
lot_house_number(lot_dp_6, 25).
building(lot_dp_6, business, canteen).
business(lot_dp_6, 'The Grease Pot', canteen).
business_founded(lot_dp_6, 1930).

%% ═══════════════════════════════════════════════════════════
%% Ironhaven — Sky Quarter
%% ═══════════════════════════════════════════════════════════

%% 3 Gantry Road — Airship Dock Alpha
lot(lot_dp_7, '3 Gantry Road', ironhaven).
lot_type(lot_dp_7, buildable).
lot_district(lot_dp_7, sky_quarter).
lot_street(lot_dp_7, gantry_road).
lot_side(lot_dp_7, left).
lot_house_number(lot_dp_7, 3).
building(lot_dp_7, business, airship_dock).
business(lot_dp_7, 'Dock Alpha', airship_dock).
business_founded(lot_dp_7, 1915).

%% 11 Gantry Road — Navigator Guild
lot(lot_dp_8, '11 Gantry Road', ironhaven).
lot_type(lot_dp_8, buildable).
lot_district(lot_dp_8, sky_quarter).
lot_street(lot_dp_8, gantry_road).
lot_side(lot_dp_8, right).
lot_house_number(lot_dp_8, 11).
building(lot_dp_8, civic, guild_hall).

%% 20 Gantry Road — Airship Repair Hangar
lot(lot_dp_9, '20 Gantry Road', ironhaven).
lot_type(lot_dp_9, buildable).
lot_district(lot_dp_9, sky_quarter).
lot_street(lot_dp_9, gantry_road).
lot_side(lot_dp_9, left).
lot_house_number(lot_dp_9, 20).
building(lot_dp_9, business, hangar).
business(lot_dp_9, 'Skywright Repairs', hangar).
business_founded(lot_dp_9, 1928).

%% 7 Cloudwalk Promenade — The Altimeter Lounge
lot(lot_dp_10, '7 Cloudwalk Promenade', ironhaven).
lot_type(lot_dp_10, buildable).
lot_district(lot_dp_10, sky_quarter).
lot_street(lot_dp_10, cloudwalk_promenade).
lot_side(lot_dp_10, left).
lot_house_number(lot_dp_10, 7).
building(lot_dp_10, business, lounge).
business(lot_dp_10, 'The Altimeter Lounge', lounge).
business_founded(lot_dp_10, 1932).

%% 15 Cloudwalk Promenade — Sky Quarter Hotel
lot(lot_dp_11, '15 Cloudwalk Promenade', ironhaven).
lot_type(lot_dp_11, buildable).
lot_district(lot_dp_11, sky_quarter).
lot_street(lot_dp_11, cloudwalk_promenade).
lot_side(lot_dp_11, right).
lot_house_number(lot_dp_11, 15).
building(lot_dp_11, business, hotel).
business(lot_dp_11, 'Hotel Nimbus', hotel).
business_founded(lot_dp_11, 1920).

%% ═══════════════════════════════════════════════════════════
%% Ironhaven — The Underbelly
%% ═══════════════════════════════════════════════════════════

%% 6 Soot Alley — The Black Propeller (Speakeasy)
lot(lot_dp_12, '6 Soot Alley', ironhaven).
lot_type(lot_dp_12, buildable).
lot_district(lot_dp_12, the_underbelly).
lot_street(lot_dp_12, soot_alley).
lot_side(lot_dp_12, left).
lot_house_number(lot_dp_12, 6).
building(lot_dp_12, business, speakeasy).
business(lot_dp_12, 'The Black Propeller', speakeasy).
business_founded(lot_dp_12, 1929).

%% 14 Soot Alley — Fences Den
lot(lot_dp_13, '14 Soot Alley', ironhaven).
lot_type(lot_dp_13, buildable).
lot_district(lot_dp_13, the_underbelly).
lot_street(lot_dp_13, soot_alley).
lot_side(lot_dp_13, right).
lot_house_number(lot_dp_13, 14).
building(lot_dp_13, business, pawnshop).
business(lot_dp_13, 'Ratko Salvage and Trade', pawnshop).
business_founded(lot_dp_13, 1933).

%% 22 Soot Alley — Resistance Safe House
lot(lot_dp_14, '22 Soot Alley', ironhaven).
lot_type(lot_dp_14, buildable).
lot_district(lot_dp_14, the_underbelly).
lot_street(lot_dp_14, soot_alley).
lot_side(lot_dp_14, left).
lot_house_number(lot_dp_14, 22).
building(lot_dp_14, residence, safehouse).

%% 9 Gaslight Row — The Smog Lamp (Tavern)
lot(lot_dp_15, '9 Gaslight Row', ironhaven).
lot_type(lot_dp_15, buildable).
lot_district(lot_dp_15, the_underbelly).
lot_street(lot_dp_15, gaslight_row).
lot_side(lot_dp_15, left).
lot_house_number(lot_dp_15, 9).
building(lot_dp_15, business, tavern).
business(lot_dp_15, 'The Smog Lamp', tavern).
business_founded(lot_dp_15, 1922).

%% 17 Gaslight Row — Underground Printing Press
lot(lot_dp_16, '17 Gaslight Row', ironhaven).
lot_type(lot_dp_16, buildable).
lot_district(lot_dp_16, the_underbelly).
lot_street(lot_dp_16, gaslight_row).
lot_side(lot_dp_16, right).
lot_house_number(lot_dp_16, 17).
building(lot_dp_16, business, print_shop).
business(lot_dp_16, 'Midnight Press', print_shop).
business_founded(lot_dp_16, 1936).

%% 25 Gaslight Row — Tenement
lot(lot_dp_17, '25 Gaslight Row', ironhaven).
lot_type(lot_dp_17, buildable).
lot_district(lot_dp_17, the_underbelly).
lot_street(lot_dp_17, gaslight_row).
lot_side(lot_dp_17, left).
lot_house_number(lot_dp_17, 25).
building(lot_dp_17, residence, tenement).

%% ═══════════════════════════════════════════════════════════
%% Ironhaven — Command Heights
%% ═══════════════════════════════════════════════════════════

%% 2 Brass Boulevard — War Office
lot(lot_dp_18, '2 Brass Boulevard', ironhaven).
lot_type(lot_dp_18, buildable).
lot_district(lot_dp_18, command_heights).
lot_street(lot_dp_18, brass_boulevard).
lot_side(lot_dp_18, left).
lot_house_number(lot_dp_18, 2).
building(lot_dp_18, civic, war_office).

%% 10 Brass Boulevard — Ministry of Fuel
lot(lot_dp_19, '10 Brass Boulevard', ironhaven).
lot_type(lot_dp_19, buildable).
lot_district(lot_dp_19, command_heights).
lot_street(lot_dp_19, brass_boulevard).
lot_side(lot_dp_19, right).
lot_house_number(lot_dp_19, 10).
building(lot_dp_19, civic, ministry).

%% 5 Marshal Way — Officers Club
lot(lot_dp_20, '5 Marshal Way', ironhaven).
lot_type(lot_dp_20, buildable).
lot_district(lot_dp_20, command_heights).
lot_street(lot_dp_20, marshal_way).
lot_side(lot_dp_20, left).
lot_house_number(lot_dp_20, 5).
building(lot_dp_20, business, club).
business(lot_dp_20, 'The Brass Eagle', club).
business_founded(lot_dp_20, 1925).

%% 13 Marshal Way — Propaganda Bureau
lot(lot_dp_21, '13 Marshal Way', ironhaven).
lot_type(lot_dp_21, buildable).
lot_district(lot_dp_21, command_heights).
lot_street(lot_dp_21, marshal_way).
lot_side(lot_dp_21, right).
lot_house_number(lot_dp_21, 13).
building(lot_dp_21, civic, propaganda_bureau).

%% ═══════════════════════════════════════════════════════════
%% Ashford Junction
%% ═══════════════════════════════════════════════════════════

%% 8 Junction Road — Rail Station
lot(lot_dp_22, '8 Junction Road', ashford_junction).
lot_type(lot_dp_22, buildable).
lot_district(lot_dp_22, rail_yard_district).
lot_street(lot_dp_22, junction_road).
lot_side(lot_dp_22, left).
lot_house_number(lot_dp_22, 8).
building(lot_dp_22, civic, rail_station).

%% 16 Junction Road — Fuel Depot
lot(lot_dp_23, '16 Junction Road', ashford_junction).
lot_type(lot_dp_23, buildable).
lot_district(lot_dp_23, rail_yard_district).
lot_street(lot_dp_23, junction_road).
lot_side(lot_dp_23, right).
lot_house_number(lot_dp_23, 16).
building(lot_dp_23, business, fuel_depot).
business(lot_dp_23, 'Continental Fuel Supply', fuel_depot).
business_founded(lot_dp_23, 1914).

%% 5 Pipeline Way — Refinery
lot(lot_dp_24, '5 Pipeline Way', ashford_junction).
lot_type(lot_dp_24, buildable).
lot_district(lot_dp_24, refinery_flats).
lot_street(lot_dp_24, pipeline_way).
lot_side(lot_dp_24, left).
lot_house_number(lot_dp_24, 5).
building(lot_dp_24, business, refinery).
business(lot_dp_24, 'Ashford Diesel Refinery', refinery).
business_founded(lot_dp_24, 1912).

%% 12 Furnace Lane — The Clinker (Tavern)
lot(lot_dp_25, '12 Furnace Lane', ashford_junction).
lot_type(lot_dp_25, buildable).
lot_district(lot_dp_25, refinery_flats).
lot_street(lot_dp_25, furnace_lane).
lot_side(lot_dp_25, left).
lot_house_number(lot_dp_25, 12).
building(lot_dp_25, business, tavern).
business(lot_dp_25, 'The Clinker', tavern).
business_founded(lot_dp_25, 1920).

%% ═══════════════════════════════════════════════════════════
%% Grimhollow
%% ═══════════════════════════════════════════════════════════

%% 3 Ore Trail — Mine Entrance
lot(lot_dp_26, '3 Ore Trail', grimhollow).
lot_type(lot_dp_26, buildable).
lot_district(lot_dp_26, miners_camp).
lot_street(lot_dp_26, ore_trail).
lot_side(lot_dp_26, left).
lot_house_number(lot_dp_26, 3).
building(lot_dp_26, business, mine).
business(lot_dp_26, 'Grimhollow Anthracite Mine', mine).
business_founded(lot_dp_26, 1918).

%% 10 Ore Trail — Company Store
lot(lot_dp_27, '10 Ore Trail', grimhollow).
lot_type(lot_dp_27, buildable).
lot_district(lot_dp_27, miners_camp).
lot_street(lot_dp_27, ore_trail).
lot_side(lot_dp_27, right).
lot_house_number(lot_dp_27, 10).
building(lot_dp_27, business, shop).
business(lot_dp_27, 'Company Store', shop).
business_founded(lot_dp_27, 1919).

%% 5 Shale Pass — Miners Barracks
lot(lot_dp_28, '5 Shale Pass', grimhollow).
lot_type(lot_dp_28, buildable).
lot_district(lot_dp_28, miners_camp).
lot_street(lot_dp_28, shale_pass).
lot_side(lot_dp_28, left).
lot_house_number(lot_dp_28, 5).
building(lot_dp_28, residence, barracks).
