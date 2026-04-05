%% Insimul Locations (Lots): Superhero City
%% Source: data/worlds/superhero/locations.pl
%% Created: 2026-04-03
%% Total: 30 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% 1 Sentinel Avenue -- Titan Tower (Hero HQ)
lot(lot_sh_1, '1 Sentinel Avenue', titan_city).
lot_type(lot_sh_1, buildable).
lot_district(lot_sh_1, downtown_core).
lot_street(lot_sh_1, sentinel_avenue).
lot_side(lot_sh_1, left).
lot_house_number(lot_sh_1, 1).
building(lot_sh_1, civic, headquarters).
business(lot_sh_1, 'Titan Tower', headquarters).
business_founded(lot_sh_1, 1962).

%% 10 Sentinel Avenue -- City Hall
lot(lot_sh_2, '10 Sentinel Avenue', titan_city).
lot_type(lot_sh_2, buildable).
lot_district(lot_sh_2, downtown_core).
lot_street(lot_sh_2, sentinel_avenue).
lot_side(lot_sh_2, right).
lot_house_number(lot_sh_2, 10).
building(lot_sh_2, civic, government).
business(lot_sh_2, 'Titan City Hall', government).
business_founded(lot_sh_2, 1905).

%% 20 Sentinel Avenue -- Sentinel National Bank
lot(lot_sh_3, '20 Sentinel Avenue', titan_city).
lot_type(lot_sh_3, buildable).
lot_district(lot_sh_3, downtown_core).
lot_street(lot_sh_3, sentinel_avenue).
lot_side(lot_sh_3, left).
lot_house_number(lot_sh_3, 20).
building(lot_sh_3, business, bank).
business(lot_sh_3, 'Sentinel National Bank', bank).
business_founded(lot_sh_3, 1925).

%% 30 Sentinel Avenue -- Vanguard Insurance
lot(lot_sh_4, '30 Sentinel Avenue', titan_city).
lot_type(lot_sh_4, buildable).
lot_district(lot_sh_4, downtown_core).
lot_street(lot_sh_4, sentinel_avenue).
lot_side(lot_sh_4, right).
lot_house_number(lot_sh_4, 30).
building(lot_sh_4, business, office).
business(lot_sh_4, 'Vanguard Insurance', office).
business_founded(lot_sh_4, 1980).

%% 5 Vanguard Plaza -- Daily Sentinel Newspaper
lot(lot_sh_5, '5 Vanguard Plaza', titan_city).
lot_type(lot_sh_5, buildable).
lot_district(lot_sh_5, downtown_core).
lot_street(lot_sh_5, vanguard_plaza).
lot_side(lot_sh_5, left).
lot_house_number(lot_sh_5, 5).
building(lot_sh_5, business, newspaper).
business(lot_sh_5, 'The Daily Sentinel', newspaper).
business_founded(lot_sh_5, 1932).

%% 15 Vanguard Plaza -- Police Precinct One
lot(lot_sh_6, '15 Vanguard Plaza', titan_city).
lot_type(lot_sh_6, buildable).
lot_district(lot_sh_6, downtown_core).
lot_street(lot_sh_6, vanguard_plaza).
lot_side(lot_sh_6, right).
lot_house_number(lot_sh_6, 15).
building(lot_sh_6, civic, police_station).
business(lot_sh_6, 'Precinct One', police_station).
business_founded(lot_sh_6, 1910).

%% 25 Vanguard Plaza -- Courthouse
lot(lot_sh_7, '25 Vanguard Plaza', titan_city).
lot_type(lot_sh_7, buildable).
lot_district(lot_sh_7, downtown_core).
lot_street(lot_sh_7, vanguard_plaza).
lot_side(lot_sh_7, left).
lot_house_number(lot_sh_7, 25).
building(lot_sh_7, civic, courthouse).
business(lot_sh_7, 'Titan City Courthouse', courthouse).
business_founded(lot_sh_7, 1915).

%% 5 Liberty Boulevard -- Titan General Hospital
lot(lot_sh_8, '5 Liberty Boulevard', titan_city).
lot_type(lot_sh_8, buildable).
lot_district(lot_sh_8, midtown).
lot_street(lot_sh_8, liberty_boulevard).
lot_side(lot_sh_8, left).
lot_house_number(lot_sh_8, 5).
building(lot_sh_8, civic, hospital).
business(lot_sh_8, 'Titan General Hospital', hospital).
business_founded(lot_sh_8, 1940).

%% 15 Liberty Boulevard -- Museum of Metahuman History
lot(lot_sh_9, '15 Liberty Boulevard', titan_city).
lot_type(lot_sh_9, buildable).
lot_district(lot_sh_9, midtown).
lot_street(lot_sh_9, liberty_boulevard).
lot_side(lot_sh_9, right).
lot_house_number(lot_sh_9, 15).
building(lot_sh_9, civic, museum).
business(lot_sh_9, 'Museum of Metahuman History', museum).
business_founded(lot_sh_9, 1985).

%% 25 Liberty Boulevard -- Residence (Midtown Apartments)
lot(lot_sh_10, '25 Liberty Boulevard', titan_city).
lot_type(lot_sh_10, buildable).
lot_district(lot_sh_10, midtown).
lot_street(lot_sh_10, liberty_boulevard).
lot_side(lot_sh_10, left).
lot_house_number(lot_sh_10, 25).
building(lot_sh_10, residence, apartment).

%% 35 Liberty Boulevard -- Diner
lot(lot_sh_11, '35 Liberty Boulevard', titan_city).
lot_type(lot_sh_11, buildable).
lot_district(lot_sh_11, midtown).
lot_street(lot_sh_11, liberty_boulevard).
lot_side(lot_sh_11, right).
lot_house_number(lot_sh_11, 35).
building(lot_sh_11, business, restaurant).
business(lot_sh_11, 'All-Night Diner', restaurant).
business_founded(lot_sh_11, 1965).

%% 45 Liberty Boulevard -- Gym
lot(lot_sh_12, '45 Liberty Boulevard', titan_city).
lot_type(lot_sh_12, buildable).
lot_district(lot_sh_12, midtown).
lot_street(lot_sh_12, liberty_boulevard).
lot_side(lot_sh_12, left).
lot_house_number(lot_sh_12, 45).
building(lot_sh_12, business, gym).
business(lot_sh_12, 'Iron Will Gym', gym).
business_founded(lot_sh_12, 2005).

%% 5 Harbor Road -- Warehouse District (Smuggler Den)
lot(lot_sh_13, '5 Harbor Road', titan_city).
lot_type(lot_sh_13, buildable).
lot_district(lot_sh_13, the_docks).
lot_street(lot_sh_13, harbor_road).
lot_side(lot_sh_13, left).
lot_house_number(lot_sh_13, 5).
building(lot_sh_13, business, warehouse).
business(lot_sh_13, 'Harbor Freight Warehouse', warehouse).
business_founded(lot_sh_13, 1940).

%% 15 Harbor Road -- Fish Market (Information Broker front)
lot(lot_sh_14, '15 Harbor Road', titan_city).
lot_type(lot_sh_14, buildable).
lot_district(lot_sh_14, the_docks).
lot_street(lot_sh_14, harbor_road).
lot_side(lot_sh_14, right).
lot_house_number(lot_sh_14, 15).
building(lot_sh_14, business, market).
business(lot_sh_14, 'Dockside Fish Market', market).
business_founded(lot_sh_14, 1955).

%% 25 Harbor Road -- Dive Bar
lot(lot_sh_15, '25 Harbor Road', titan_city).
lot_type(lot_sh_15, buildable).
lot_district(lot_sh_15, the_docks).
lot_street(lot_sh_15, harbor_road).
lot_side(lot_sh_15, left).
lot_house_number(lot_sh_15, 25).
building(lot_sh_15, business, bar).
business(lot_sh_15, 'The Rusty Anchor', bar).
business_founded(lot_sh_15, 1960).

%% 10 Iron Lane -- Abandoned Factory (Villain Hideout)
lot(lot_sh_16, '10 Iron Lane', titan_city).
lot_type(lot_sh_16, buildable).
lot_district(lot_sh_16, the_docks).
lot_street(lot_sh_16, iron_lane).
lot_side(lot_sh_16, left).
lot_house_number(lot_sh_16, 10).
building(lot_sh_16, business, factory).
business(lot_sh_16, 'Abandoned Ironworks', factory).
business_founded(lot_sh_16, 1935).

%% 5 Grimm Street -- Pawn Shop (Fence for stolen goods)
lot(lot_sh_17, '5 Grimm Street', titan_city).
lot_type(lot_sh_17, buildable).
lot_district(lot_sh_17, the_narrows).
lot_street(lot_sh_17, grimm_street).
lot_side(lot_sh_17, left).
lot_house_number(lot_sh_17, 5).
building(lot_sh_17, business, shop).
business(lot_sh_17, 'Lucky Star Pawn', shop).
business_founded(lot_sh_17, 1978).

%% 15 Grimm Street -- Underground Fight Club
lot(lot_sh_18, '15 Grimm Street', titan_city).
lot_type(lot_sh_18, buildable).
lot_district(lot_sh_18, the_narrows).
lot_street(lot_sh_18, grimm_street).
lot_side(lot_sh_18, right).
lot_house_number(lot_sh_18, 15).
building(lot_sh_18, business, arena).
business(lot_sh_18, 'The Pit', arena).
business_founded(lot_sh_18, 2002).

%% 25 Grimm Street -- Clinic (Back-alley Doctor)
lot(lot_sh_19, '25 Grimm Street', titan_city).
lot_type(lot_sh_19, buildable).
lot_district(lot_sh_19, the_narrows).
lot_street(lot_sh_19, grimm_street).
lot_side(lot_sh_19, left).
lot_house_number(lot_sh_19, 25).
building(lot_sh_19, business, clinic).
business(lot_sh_19, 'Night Owl Clinic', clinic).
business_founded(lot_sh_19, 1998).

%% 35 Grimm Street -- Residence (Tenement Block)
lot(lot_sh_20, '35 Grimm Street', titan_city).
lot_type(lot_sh_20, buildable).
lot_district(lot_sh_20, the_narrows).
lot_street(lot_sh_20, grimm_street).
lot_side(lot_sh_20, right).
lot_house_number(lot_sh_20, 35).
building(lot_sh_20, residence, apartment).

%% 5 Circuit Drive -- Kepler Dynamics (Tech Lab)
lot(lot_sh_21, '5 Circuit Drive', titan_city).
lot_type(lot_sh_21, buildable).
lot_district(lot_sh_21, tech_quarter).
lot_street(lot_sh_21, circuit_drive).
lot_side(lot_sh_21, left).
lot_house_number(lot_sh_21, 5).
building(lot_sh_21, business, laboratory).
business(lot_sh_21, 'Kepler Dynamics', laboratory).
business_founded(lot_sh_21, 2000).

%% 15 Circuit Drive -- Quantum Research Institute
lot(lot_sh_22, '15 Circuit Drive', titan_city).
lot_type(lot_sh_22, buildable).
lot_district(lot_sh_22, tech_quarter).
lot_street(lot_sh_22, circuit_drive).
lot_side(lot_sh_22, right).
lot_house_number(lot_sh_22, 15).
building(lot_sh_22, civic, university).
business(lot_sh_22, 'Quantum Research Institute', university).
business_founded(lot_sh_22, 2010).

%% 25 Circuit Drive -- Data Center
lot(lot_sh_23, '25 Circuit Drive', titan_city).
lot_type(lot_sh_23, buildable).
lot_district(lot_sh_23, tech_quarter).
lot_street(lot_sh_23, circuit_drive).
lot_side(lot_sh_23, left).
lot_house_number(lot_sh_23, 25).
building(lot_sh_23, business, office).
business(lot_sh_23, 'Nexus Data Center', office).
business_founded(lot_sh_23, 2015).

%% 35 Circuit Drive -- Residence (Tech Worker Lofts)
lot(lot_sh_24, '35 Circuit Drive', titan_city).
lot_type(lot_sh_24, buildable).
lot_district(lot_sh_24, tech_quarter).
lot_street(lot_sh_24, circuit_drive).
lot_side(lot_sh_24, right).
lot_house_number(lot_sh_24, 35).
building(lot_sh_24, residence, apartment).

%% 5 Smelter Road -- Scrapyard (Villain Workshop)
lot(lot_sh_25, '5 Smelter Road', ironhaven).
lot_type(lot_sh_25, buildable).
lot_district(lot_sh_25, foundry_row).
lot_street(lot_sh_25, smelter_road).
lot_side(lot_sh_25, left).
lot_house_number(lot_sh_25, 5).
building(lot_sh_25, business, workshop).
business(lot_sh_25, 'Slag Heap Scrapyard', workshop).
business_founded(lot_sh_25, 1955).

%% 15 Smelter Road -- Chemical Plant
lot(lot_sh_26, '15 Smelter Road', ironhaven).
lot_type(lot_sh_26, buildable).
lot_district(lot_sh_26, foundry_row).
lot_street(lot_sh_26, smelter_road).
lot_side(lot_sh_26, right).
lot_house_number(lot_sh_26, 15).
building(lot_sh_26, business, factory).
business(lot_sh_26, 'Ironhaven Chemical Works', factory).
business_founded(lot_sh_26, 1940).

%% 10 Furnace Way -- Residence
lot(lot_sh_27, '10 Furnace Way', ironhaven).
lot_type(lot_sh_27, buildable).
lot_district(lot_sh_27, foundry_row).
lot_street(lot_sh_27, furnace_way).
lot_side(lot_sh_27, left).
lot_house_number(lot_sh_27, 10).
building(lot_sh_27, residence, house).

%% 5 Cinder Alley -- Underground Bunker (Secret Lair)
lot(lot_sh_28, '5 Cinder Alley', ironhaven).
lot_type(lot_sh_28, buildable).
lot_district(lot_sh_28, ash_district).
lot_street(lot_sh_28, cinder_alley).
lot_side(lot_sh_28, left).
lot_house_number(lot_sh_28, 5).
building(lot_sh_28, business, bunker).
business(lot_sh_28, 'Sub-Level Nine', bunker).
business_founded(lot_sh_28, 1998).

%% 15 Cinder Alley -- Condemned Asylum
lot(lot_sh_29, '15 Cinder Alley', ironhaven).
lot_type(lot_sh_29, buildable).
lot_district(lot_sh_29, ash_district).
lot_street(lot_sh_29, cinder_alley).
lot_side(lot_sh_29, right).
lot_house_number(lot_sh_29, 15).
building(lot_sh_29, civic, asylum).
business(lot_sh_29, 'Ironhaven Asylum', asylum).
business_founded(lot_sh_29, 1930).

%% 25 Cinder Alley -- Residence (Squatters Block)
lot(lot_sh_30, '25 Cinder Alley', ironhaven).
lot_type(lot_sh_30, buildable).
lot_district(lot_sh_30, ash_district).
lot_street(lot_sh_30, cinder_alley).
lot_side(lot_sh_30, left).
lot_house_number(lot_sh_30, 25).
building(lot_sh_30, residence, apartment).
