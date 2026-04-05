%% Insimul Locations (Lots): New Earth Colony
%% Source: data/worlds/new_earth_colony/locations.pl
%% Created: 2026-04-03
%% Total: 28 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% ═══════════════════════════════════════════════════════════
%% Nova City Locations
%% ═══════════════════════════════════════════════════════════

%% 1 Command Avenue -- Colony Command Center
lot(lot_nc_1, '1 Command Avenue', nova_city).
lot_type(lot_nc_1, buildable).
lot_district(lot_nc_1, central_hub).
lot_street(lot_nc_1, command_avenue).
lot_side(lot_nc_1, left).
lot_house_number(lot_nc_1, 1).
building(lot_nc_1, civic, command_center).
business(lot_nc_1, 'Colony Command Center', command_center).
business_founded(lot_nc_1, 2320).

%% 5 Command Avenue -- Communications Array
lot(lot_nc_2, '5 Command Avenue', nova_city).
lot_type(lot_nc_2, buildable).
lot_district(lot_nc_2, central_hub).
lot_street(lot_nc_2, command_avenue).
lot_side(lot_nc_2, right).
lot_house_number(lot_nc_2, 5).
building(lot_nc_2, civic, communications_array).
business(lot_nc_2, 'Deep Space Communications Array', comms_hub).
business_founded(lot_nc_2, 2322).

%% 12 Command Avenue -- Council Chamber
lot(lot_nc_3, '12 Command Avenue', nova_city).
lot_type(lot_nc_3, buildable).
lot_district(lot_nc_3, central_hub).
lot_street(lot_nc_3, command_avenue).
lot_side(lot_nc_3, left).
lot_house_number(lot_nc_3, 12).
building(lot_nc_3, civic, council_chamber).

%% 20 Command Avenue -- AI Core Nexus
lot(lot_nc_4, '20 Command Avenue', nova_city).
lot_type(lot_nc_4, buildable).
lot_district(lot_nc_4, central_hub).
lot_street(lot_nc_4, command_avenue).
lot_side(lot_nc_4, right).
lot_house_number(lot_nc_4, 20).
building(lot_nc_4, civic, ai_core).
business(lot_nc_4, 'AI Core Nexus', ai_core).
business_founded(lot_nc_4, 2335).

%% 3 Biodome Ring -- Alpha Biodome
lot(lot_nc_5, '3 Biodome Ring', nova_city).
lot_type(lot_nc_5, buildable).
lot_district(lot_nc_5, biodome_sector).
lot_street(lot_nc_5, biodome_ring).
lot_side(lot_nc_5, left).
lot_house_number(lot_nc_5, 3).
building(lot_nc_5, civic, biodome).
business(lot_nc_5, 'Alpha Biodome', biodome).
business_founded(lot_nc_5, 2318).

%% 10 Biodome Ring -- Beta Biodome (Tropical)
lot(lot_nc_6, '10 Biodome Ring', nova_city).
lot_type(lot_nc_6, buildable).
lot_district(lot_nc_6, biodome_sector).
lot_street(lot_nc_6, biodome_ring).
lot_side(lot_nc_6, right).
lot_house_number(lot_nc_6, 10).
building(lot_nc_6, civic, biodome).
business(lot_nc_6, 'Beta Biodome - Tropical', biodome).
business_founded(lot_nc_6, 2319).

%% 18 Biodome Ring -- Gamma Biodome (Arid Research)
lot(lot_nc_7, '18 Biodome Ring', nova_city).
lot_type(lot_nc_7, buildable).
lot_district(lot_nc_7, biodome_sector).
lot_street(lot_nc_7, biodome_ring).
lot_side(lot_nc_7, left).
lot_house_number(lot_nc_7, 18).
building(lot_nc_7, civic, biodome).
business(lot_nc_7, 'Gamma Biodome - Arid Research', biodome).
business_founded(lot_nc_7, 2325).

%% 25 Biodome Ring -- Hydroponic Farm Alpha
lot(lot_nc_8, '25 Biodome Ring', nova_city).
lot_type(lot_nc_8, buildable).
lot_district(lot_nc_8, biodome_sector).
lot_street(lot_nc_8, biodome_ring).
lot_side(lot_nc_8, right).
lot_house_number(lot_nc_8, 25).
building(lot_nc_8, business, hydroponic_farm).
business(lot_nc_8, 'Hydroponic Farm Alpha', farm).
business_founded(lot_nc_8, 2320).

%% 32 Biodome Ring -- Hydroponic Farm Beta
lot(lot_nc_9, '32 Biodome Ring', nova_city).
lot_type(lot_nc_9, buildable).
lot_district(lot_nc_9, biodome_sector).
lot_street(lot_nc_9, biodome_ring).
lot_side(lot_nc_9, left).
lot_house_number(lot_nc_9, 32).
building(lot_nc_9, business, hydroponic_farm).
business(lot_nc_9, 'Hydroponic Farm Beta', farm).
business_founded(lot_nc_9, 2321).

%% 5 Hab Corridor A -- Hab Pod Block A1
lot(lot_nc_10, '5 Hab Corridor A', nova_city).
lot_type(lot_nc_10, buildable).
lot_district(lot_nc_10, residential_ring).
lot_street(lot_nc_10, hab_corridor_a).
lot_side(lot_nc_10, left).
lot_house_number(lot_nc_10, 5).
building(lot_nc_10, residence, hab_pod).

%% 12 Hab Corridor A -- Hab Pod Block A2
lot(lot_nc_11, '12 Hab Corridor A', nova_city).
lot_type(lot_nc_11, buildable).
lot_district(lot_nc_11, residential_ring).
lot_street(lot_nc_11, hab_corridor_a).
lot_side(lot_nc_11, right).
lot_house_number(lot_nc_11, 12).
building(lot_nc_11, residence, hab_pod).

%% 20 Hab Corridor A -- Hab Pod Block A3
lot(lot_nc_12, '20 Hab Corridor A', nova_city).
lot_type(lot_nc_12, buildable).
lot_district(lot_nc_12, residential_ring).
lot_street(lot_nc_12, hab_corridor_a).
lot_side(lot_nc_12, left).
lot_house_number(lot_nc_12, 20).
building(lot_nc_12, residence, hab_pod).

%% 28 Hab Corridor A -- Recreation Lounge
lot(lot_nc_13, '28 Hab Corridor A', nova_city).
lot_type(lot_nc_13, buildable).
lot_district(lot_nc_13, residential_ring).
lot_street(lot_nc_13, hab_corridor_a).
lot_side(lot_nc_13, right).
lot_house_number(lot_nc_13, 28).
building(lot_nc_13, business, recreation_lounge).
business(lot_nc_13, 'Zero-G Recreation Lounge', recreation).
business_founded(lot_nc_13, 2328).

%% 3 Science Way -- Xenobiology Lab
lot(lot_nc_14, '3 Science Way', nova_city).
lot_type(lot_nc_14, buildable).
lot_district(lot_nc_14, science_quarter).
lot_street(lot_nc_14, science_way).
lot_side(lot_nc_14, left).
lot_house_number(lot_nc_14, 3).
building(lot_nc_14, business, laboratory).
business(lot_nc_14, 'Xenobiology Research Lab', laboratory).
business_founded(lot_nc_14, 2326).

%% 10 Science Way -- Terraforming Control Hub
lot(lot_nc_15, '10 Science Way', nova_city).
lot_type(lot_nc_15, buildable).
lot_district(lot_nc_15, science_quarter).
lot_street(lot_nc_15, science_way).
lot_side(lot_nc_15, right).
lot_house_number(lot_nc_15, 10).
building(lot_nc_15, civic, terraform_hub).
business(lot_nc_15, 'Terraforming Control Hub', terraform_center).
business_founded(lot_nc_15, 2324).

%% 18 Science Way -- Medical Bay
lot(lot_nc_16, '18 Science Way', nova_city).
lot_type(lot_nc_16, buildable).
lot_district(lot_nc_16, science_quarter).
lot_street(lot_nc_16, science_way).
lot_side(lot_nc_16, left).
lot_house_number(lot_nc_16, 18).
building(lot_nc_16, business, medical_bay).
business(lot_nc_16, 'Colony Medical Bay', hospital).
business_founded(lot_nc_16, 2318).

%% 25 Science Way -- Atmospheric Processing Plant
lot(lot_nc_17, '25 Science Way', nova_city).
lot_type(lot_nc_17, buildable).
lot_district(lot_nc_17, science_quarter).
lot_street(lot_nc_17, science_way).
lot_side(lot_nc_17, right).
lot_house_number(lot_nc_17, 25).
building(lot_nc_17, civic, atmospheric_processor).
business(lot_nc_17, 'Atmospheric Processing Plant', utility).
business_founded(lot_nc_17, 2319).

%% ═══════════════════════════════════════════════════════════
%% Olympus Station Locations
%% ═══════════════════════════════════════════════════════════

%% 1 Docking Lane -- Shuttle Hangar
lot(lot_nc_18, '1 Docking Lane', olympus_station).
lot_type(lot_nc_18, buildable).
lot_district(lot_nc_18, docking_bay).
lot_street(lot_nc_18, docking_lane).
lot_side(lot_nc_18, left).
lot_house_number(lot_nc_18, 1).
building(lot_nc_18, civic, hangar).
business(lot_nc_18, 'Main Shuttle Hangar', hangar).
business_founded(lot_nc_18, 2318).

%% 8 Docking Lane -- Cargo Processing
lot(lot_nc_19, '8 Docking Lane', olympus_station).
lot_type(lot_nc_19, buildable).
lot_district(lot_nc_19, docking_bay).
lot_street(lot_nc_19, docking_lane).
lot_side(lot_nc_19, right).
lot_house_number(lot_nc_19, 8).
building(lot_nc_19, business, cargo_depot).
business(lot_nc_19, 'Cargo Processing Center', warehouse).
business_founded(lot_nc_19, 2319).

%% 15 Docking Lane -- EVA Suit Locker
lot(lot_nc_20, '15 Docking Lane', olympus_station).
lot_type(lot_nc_20, buildable).
lot_district(lot_nc_20, docking_bay).
lot_street(lot_nc_20, docking_lane).
lot_side(lot_nc_20, left).
lot_house_number(lot_nc_20, 15).
building(lot_nc_20, business, equipment_depot).
business(lot_nc_20, 'EVA Equipment Depot', outfitter).
business_founded(lot_nc_20, 2320).

%% 3 Engineering Deck -- Reactor Core
lot(lot_nc_21, '3 Engineering Deck', olympus_station).
lot_type(lot_nc_21, buildable).
lot_district(lot_nc_21, engineering).
lot_street(lot_nc_21, engineering_deck).
lot_side(lot_nc_21, left).
lot_house_number(lot_nc_21, 3).
building(lot_nc_21, civic, reactor).
business(lot_nc_21, 'Fusion Reactor Core', power_plant).
business_founded(lot_nc_21, 2318).

%% 10 Engineering Deck -- Machine Shop
lot(lot_nc_22, '10 Engineering Deck', olympus_station).
lot_type(lot_nc_22, buildable).
lot_district(lot_nc_22, engineering).
lot_street(lot_nc_22, engineering_deck).
lot_side(lot_nc_22, right).
lot_house_number(lot_nc_22, 10).
building(lot_nc_22, business, machine_shop).
business(lot_nc_22, 'Station Machine Shop', workshop).
business_founded(lot_nc_22, 2319).

%% 18 Engineering Deck -- Water Reclamation
lot(lot_nc_23, '18 Engineering Deck', olympus_station).
lot_type(lot_nc_23, buildable).
lot_district(lot_nc_23, engineering).
lot_street(lot_nc_23, engineering_deck).
lot_side(lot_nc_23, left).
lot_house_number(lot_nc_23, 18).
building(lot_nc_23, civic, water_reclamation).
business(lot_nc_23, 'Water Reclamation Plant', utility).
business_founded(lot_nc_23, 2318).

%% 5 Station Ring -- Hab Pod Block S1
lot(lot_nc_24, '5 Station Ring', olympus_station).
lot_type(lot_nc_24, buildable).
lot_district(lot_nc_24, station_residential).
lot_street(lot_nc_24, station_ring).
lot_side(lot_nc_24, left).
lot_house_number(lot_nc_24, 5).
building(lot_nc_24, residence, hab_pod).

%% 12 Station Ring -- Hab Pod Block S2
lot(lot_nc_25, '12 Station Ring', olympus_station).
lot_type(lot_nc_25, buildable).
lot_district(lot_nc_25, station_residential).
lot_street(lot_nc_25, station_ring).
lot_side(lot_nc_25, right).
lot_house_number(lot_nc_25, 12).
building(lot_nc_25, residence, hab_pod).

%% 20 Station Ring -- Station Mess Hall
lot(lot_nc_26, '20 Station Ring', olympus_station).
lot_type(lot_nc_26, buildable).
lot_district(lot_nc_26, station_residential).
lot_street(lot_nc_26, station_ring).
lot_side(lot_nc_26, left).
lot_house_number(lot_nc_26, 20).
building(lot_nc_26, business, mess_hall).
business(lot_nc_26, 'Station Mess Hall', canteen).
business_founded(lot_nc_26, 2318).

%% 28 Station Ring -- Mineral Assay Office
lot(lot_nc_27, '28 Station Ring', olympus_station).
lot_type(lot_nc_27, buildable).
lot_district(lot_nc_27, station_residential).
lot_street(lot_nc_27, station_ring).
lot_side(lot_nc_27, right).
lot_house_number(lot_nc_27, 28).
building(lot_nc_27, business, assay_office).
business(lot_nc_27, 'Mineral Assay Office', office).
business_founded(lot_nc_27, 2322).

%% 35 Station Ring -- Observation Deck
lot(lot_nc_28, '35 Station Ring', olympus_station).
lot_type(lot_nc_28, buildable).
lot_district(lot_nc_28, station_residential).
lot_street(lot_nc_28, station_ring).
lot_side(lot_nc_28, left).
lot_house_number(lot_nc_28, 35).
building(lot_nc_28, civic, observation_deck).
business(lot_nc_28, 'Olympus Observation Deck', recreation).
business_founded(lot_nc_28, 2320).
