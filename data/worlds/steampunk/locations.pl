%% Insimul Locations (Lots): Steampunk
%% Source: data/worlds/steampunk/locations.pl
%% Created: 2026-04-03
%% Total: 30 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% ═══════════════════════════════════════════════════════════
%% Boiler Ward -- Ironhaven
%% ═══════════════════════════════════════════════════════════

%% 3 Cogwheel Lane -- Geargrind Clockwork Workshop
lot(lot_sp_1, '3 Cogwheel Lane', ironhaven).
lot_type(lot_sp_1, buildable).
lot_district(lot_sp_1, boiler_ward).
lot_street(lot_sp_1, cogwheel_lane).
lot_side(lot_sp_1, left).
lot_house_number(lot_sp_1, 3).
building(lot_sp_1, business, workshop).
business(lot_sp_1, 'Geargrind Clockwork Workshop', workshop).
business_founded(lot_sp_1, 1810).

%% 10 Cogwheel Lane -- Steam Baths
lot(lot_sp_2, '10 Cogwheel Lane', ironhaven).
lot_type(lot_sp_2, buildable).
lot_district(lot_sp_2, boiler_ward).
lot_street(lot_sp_2, cogwheel_lane).
lot_side(lot_sp_2, right).
lot_house_number(lot_sp_2, 10).
building(lot_sp_2, business, bathhouse).
business(lot_sp_2, 'Boilerside Steam Baths', bathhouse).
business_founded(lot_sp_2, 1815).

%% 18 Cogwheel Lane -- Coal and Fuel Depot
lot(lot_sp_3, '18 Cogwheel Lane', ironhaven).
lot_type(lot_sp_3, buildable).
lot_district(lot_sp_3, boiler_ward).
lot_street(lot_sp_3, cogwheel_lane).
lot_side(lot_sp_3, left).
lot_house_number(lot_sp_3, 18).
building(lot_sp_3, business, shop).
business(lot_sp_3, 'Blackstone Fuel Depot', shop).
business_founded(lot_sp_3, 1800).

%% 25 Cogwheel Lane -- Residence
lot(lot_sp_4, '25 Cogwheel Lane', ironhaven).
lot_type(lot_sp_4, buildable).
lot_district(lot_sp_4, boiler_ward).
lot_street(lot_sp_4, cogwheel_lane).
lot_side(lot_sp_4, right).
lot_house_number(lot_sp_4, 25).
building(lot_sp_4, residence, tenement).

%% 5 Steamvent Alley -- Pipefitters Union Hall
lot(lot_sp_5, '5 Steamvent Alley', ironhaven).
lot_type(lot_sp_5, buildable).
lot_district(lot_sp_5, boiler_ward).
lot_street(lot_sp_5, steamvent_alley).
lot_side(lot_sp_5, left).
lot_house_number(lot_sp_5, 5).
building(lot_sp_5, civic, guild_hall).

%% 14 Steamvent Alley -- Residence
lot(lot_sp_6, '14 Steamvent Alley', ironhaven).
lot_type(lot_sp_6, buildable).
lot_district(lot_sp_6, boiler_ward).
lot_street(lot_sp_6, steamvent_alley).
lot_side(lot_sp_6, right).
lot_house_number(lot_sp_6, 14).
building(lot_sp_6, residence, tenement).

%% ═══════════════════════════════════════════════════════════
%% Clocktower Heights -- Ironhaven
%% ═══════════════════════════════════════════════════════════

%% 5 Brassgate Boulevard -- Pendleton Inventors Academy
lot(lot_sp_7, '5 Brassgate Boulevard', ironhaven).
lot_type(lot_sp_7, buildable).
lot_district(lot_sp_7, clocktower_heights).
lot_street(lot_sp_7, brassgate_boulevard).
lot_side(lot_sp_7, left).
lot_house_number(lot_sp_7, 5).
building(lot_sp_7, civic, academy).

%% 12 Brassgate Boulevard -- Cogsworth Jewellers
lot(lot_sp_8, '12 Brassgate Boulevard', ironhaven).
lot_type(lot_sp_8, buildable).
lot_district(lot_sp_8, clocktower_heights).
lot_street(lot_sp_8, brassgate_boulevard).
lot_side(lot_sp_8, right).
lot_house_number(lot_sp_8, 12).
building(lot_sp_8, business, shop).
business(lot_sp_8, 'Cogsworth Jewellers', shop).
business_founded(lot_sp_8, 1830).

%% 20 Brassgate Boulevard -- Brass Market Hall
lot(lot_sp_9, '20 Brassgate Boulevard', ironhaven).
lot_type(lot_sp_9, buildable).
lot_district(lot_sp_9, clocktower_heights).
lot_street(lot_sp_9, brassgate_boulevard).
lot_side(lot_sp_9, left).
lot_house_number(lot_sp_9, 20).
building(lot_sp_9, business, market).
business(lot_sp_9, 'Brass Market Hall', market).
business_founded(lot_sp_9, 1808).

%% 28 Brassgate Boulevard -- Salon Voltaire
lot(lot_sp_10, '28 Brassgate Boulevard', ironhaven).
lot_type(lot_sp_10, buildable).
lot_district(lot_sp_10, clocktower_heights).
lot_street(lot_sp_10, brassgate_boulevard).
lot_side(lot_sp_10, right).
lot_house_number(lot_sp_10, 28).
building(lot_sp_10, business, salon).
business(lot_sp_10, 'Salon Voltaire', salon).
business_founded(lot_sp_10, 1835).

%% 35 Brassgate Boulevard -- Residence (Manor)
lot(lot_sp_11, '35 Brassgate Boulevard', ironhaven).
lot_type(lot_sp_11, buildable).
lot_district(lot_sp_11, clocktower_heights).
lot_street(lot_sp_11, brassgate_boulevard).
lot_side(lot_sp_11, left).
lot_house_number(lot_sp_11, 35).
building(lot_sp_11, residence, manor).

%% 8 Pendulum Street -- Aetherlight Laboratory
lot(lot_sp_12, '8 Pendulum Street', ironhaven).
lot_type(lot_sp_12, buildable).
lot_district(lot_sp_12, clocktower_heights).
lot_street(lot_sp_12, pendulum_street).
lot_side(lot_sp_12, left).
lot_house_number(lot_sp_12, 8).
building(lot_sp_12, business, laboratory).
business(lot_sp_12, 'Aetherlight Laboratory', laboratory).
business_founded(lot_sp_12, 1842).

%% 16 Pendulum Street -- Ticktock Cafe
lot(lot_sp_13, '16 Pendulum Street', ironhaven).
lot_type(lot_sp_13, buildable).
lot_district(lot_sp_13, clocktower_heights).
lot_street(lot_sp_13, pendulum_street).
lot_side(lot_sp_13, right).
lot_house_number(lot_sp_13, 16).
building(lot_sp_13, business, cafe).
business(lot_sp_13, 'The Ticktock Cafe', cafe).
business_founded(lot_sp_13, 1838).

%% 24 Pendulum Street -- Residence (Townhouse)
lot(lot_sp_14, '24 Pendulum Street', ironhaven).
lot_type(lot_sp_14, buildable).
lot_district(lot_sp_14, clocktower_heights).
lot_street(lot_sp_14, pendulum_street).
lot_side(lot_sp_14, left).
lot_house_number(lot_sp_14, 24).
building(lot_sp_14, residence, townhouse).

%% ═══════════════════════════════════════════════════════════
%% Skyport Quarter -- Ironhaven
%% ═══════════════════════════════════════════════════════════

%% 3 Mooring Road -- Skyport Tavern
lot(lot_sp_15, '3 Mooring Road', ironhaven).
lot_type(lot_sp_15, buildable).
lot_district(lot_sp_15, skyport_quarter).
lot_street(lot_sp_15, mooring_road).
lot_side(lot_sp_15, left).
lot_house_number(lot_sp_15, 3).
building(lot_sp_15, business, tavern).
business(lot_sp_15, 'The Rusty Propeller', tavern).
business_founded(lot_sp_15, 1828).

%% 12 Mooring Road -- Airship Chandlery
lot(lot_sp_16, '12 Mooring Road', ironhaven).
lot_type(lot_sp_16, buildable).
lot_district(lot_sp_16, skyport_quarter).
lot_street(lot_sp_16, mooring_road).
lot_side(lot_sp_16, right).
lot_house_number(lot_sp_16, 12).
building(lot_sp_16, business, shop).
business(lot_sp_16, 'Skywing Chandlery', shop).
business_founded(lot_sp_16, 1832).

%% 20 Mooring Road -- Airship Dock Office
lot(lot_sp_17, '20 Mooring Road', ironhaven).
lot_type(lot_sp_17, buildable).
lot_district(lot_sp_17, skyport_quarter).
lot_street(lot_sp_17, mooring_road).
lot_side(lot_sp_17, left).
lot_house_number(lot_sp_17, 20).
building(lot_sp_17, civic, dock_office).

%% 28 Mooring Road -- Residence
lot(lot_sp_18, '28 Mooring Road', ironhaven).
lot_type(lot_sp_18, buildable).
lot_district(lot_sp_18, skyport_quarter).
lot_street(lot_sp_18, mooring_road).
lot_side(lot_sp_18, right).
lot_house_number(lot_sp_18, 28).
building(lot_sp_18, residence, apartment).

%% 7 Rigging Walk -- Cartography Studio
lot(lot_sp_19, '7 Rigging Walk', ironhaven).
lot_type(lot_sp_19, buildable).
lot_district(lot_sp_19, skyport_quarter).
lot_street(lot_sp_19, rigging_walk).
lot_side(lot_sp_19, left).
lot_house_number(lot_sp_19, 7).
building(lot_sp_19, business, workshop).
business(lot_sp_19, 'Skycharted Cartography', workshop).
business_founded(lot_sp_19, 1840).

%% 15 Rigging Walk -- Smugglers Boarding House
lot(lot_sp_20, '15 Rigging Walk', ironhaven).
lot_type(lot_sp_20, buildable).
lot_district(lot_sp_20, skyport_quarter).
lot_street(lot_sp_20, rigging_walk).
lot_side(lot_sp_20, right).
lot_house_number(lot_sp_20, 15).
building(lot_sp_20, residence, boarding_house).

%% ═══════════════════════════════════════════════════════════
%% Foundry Row -- Ironhaven
%% ═══════════════════════════════════════════════════════════

%% 4 Anvil Street -- Ironworks Forge
lot(lot_sp_21, '4 Anvil Street', ironhaven).
lot_type(lot_sp_21, buildable).
lot_district(lot_sp_21, foundry_row).
lot_street(lot_sp_21, anvil_street).
lot_side(lot_sp_21, left).
lot_house_number(lot_sp_21, 4).
building(lot_sp_21, business, forge).
business(lot_sp_21, 'Ironvein Forge', forge).
business_founded(lot_sp_21, 1795).

%% 12 Anvil Street -- Automaton Assembly Works
lot(lot_sp_22, '12 Anvil Street', ironhaven).
lot_type(lot_sp_22, buildable).
lot_district(lot_sp_22, foundry_row).
lot_street(lot_sp_22, anvil_street).
lot_side(lot_sp_22, right).
lot_house_number(lot_sp_22, 12).
building(lot_sp_22, business, factory).
business(lot_sp_22, 'Hartwell Automaton Works', factory).
business_founded(lot_sp_22, 1840).

%% 20 Anvil Street -- Residence
lot(lot_sp_23, '20 Anvil Street', ironhaven).
lot_type(lot_sp_23, buildable).
lot_district(lot_sp_23, foundry_row).
lot_street(lot_sp_23, anvil_street).
lot_side(lot_sp_23, left).
lot_house_number(lot_sp_23, 20).
building(lot_sp_23, residence, tenement).

%% 6 Smelter Lane -- Aether Refinery
lot(lot_sp_24, '6 Smelter Lane', ironhaven).
lot_type(lot_sp_24, buildable).
lot_district(lot_sp_24, foundry_row).
lot_street(lot_sp_24, smelter_lane).
lot_side(lot_sp_24, left).
lot_house_number(lot_sp_24, 6).
building(lot_sp_24, business, refinery).
business(lot_sp_24, 'Voss Aether Refinery', refinery).
business_founded(lot_sp_24, 1845).

%% 14 Smelter Lane -- Residence
lot(lot_sp_25, '14 Smelter Lane', ironhaven).
lot_type(lot_sp_25, buildable).
lot_district(lot_sp_25, foundry_row).
lot_street(lot_sp_25, smelter_lane).
lot_side(lot_sp_25, right).
lot_house_number(lot_sp_25, 14).
building(lot_sp_25, residence, tenement).

%% ═══════════════════════════════════════════════════════════
%% Coppermouth Locations
%% ═══════════════════════════════════════════════════════════

%% 5 Pickaxe Lane -- Copper Mine Entrance
lot(lot_sp_26, '5 Pickaxe Lane', coppermouth).
lot_type(lot_sp_26, buildable).
lot_district(lot_sp_26, mineshaft_quarter).
lot_street(lot_sp_26, pickaxe_lane).
lot_side(lot_sp_26, left).
lot_house_number(lot_sp_26, 5).
building(lot_sp_26, business, mine).
business(lot_sp_26, 'Coppermouth Main Mine', mine).
business_founded(lot_sp_26, 1810).

%% 8 Crucible Street -- Smelting Works
lot(lot_sp_27, '8 Crucible Street', coppermouth).
lot_type(lot_sp_27, buildable).
lot_district(lot_sp_27, refiners_row).
lot_street(lot_sp_27, crucible_street).
lot_side(lot_sp_27, left).
lot_house_number(lot_sp_27, 8).
building(lot_sp_27, business, smelter).
business(lot_sp_27, 'Redforge Smelting Works', smelter).
business_founded(lot_sp_27, 1828).

%% 15 Crucible Street -- General Store
lot(lot_sp_28, '15 Crucible Street', coppermouth).
lot_type(lot_sp_28, buildable).
lot_district(lot_sp_28, refiners_row).
lot_street(lot_sp_28, crucible_street).
lot_side(lot_sp_28, right).
lot_house_number(lot_sp_28, 15).
building(lot_sp_28, business, shop).
business(lot_sp_28, 'Picketts General Store', shop).
business_founded(lot_sp_28, 1818).

%% ═══════════════════════════════════════════════════════════
%% Windhollow Locations
%% ═══════════════════════════════════════════════════════════

%% 3 Telescope Path -- Aether Observatory
lot(lot_sp_29, '3 Telescope Path', windhollow).
lot_type(lot_sp_29, buildable).
lot_district(lot_sp_29, observatory_hill).
lot_street(lot_sp_29, telescope_path).
lot_side(lot_sp_29, left).
lot_house_number(lot_sp_29, 3).
building(lot_sp_29, civic, observatory).

%% 7 Barometer Lane -- Researchers Cottage
lot(lot_sp_30, '7 Barometer Lane', windhollow).
lot_type(lot_sp_30, buildable).
lot_district(lot_sp_30, observatory_hill).
lot_street(lot_sp_30, barometer_lane).
lot_side(lot_sp_30, left).
lot_house_number(lot_sp_30, 7).
building(lot_sp_30, residence, cottage).
