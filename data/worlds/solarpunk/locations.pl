%% Insimul Locations (Lots): Solarpunk Eco-Communities
%% Source: data/worlds/solarpunk/locations.pl
%% Created: 2026-04-03
%% Total: 30 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% === Solar Terrace District (Heliotrope Commons) ===

%% 2 Garden Way -- Community Solar Workshop
lot(lot_sp_1, '2 Garden Way', heliotrope_commons).
lot_type(lot_sp_1, buildable).
lot_district(lot_sp_1, solar_terrace).
lot_street(lot_sp_1, garden_way).
lot_side(lot_sp_1, left).
lot_house_number(lot_sp_1, 2).
building(lot_sp_1, business, workshop).
business(lot_sp_1, 'Helios Solar Workshop', workshop).
business_founded(lot_sp_1, 2046).

%% 10 Garden Way -- Vertical Farm Tower
lot(lot_sp_2, '10 Garden Way', heliotrope_commons).
lot_type(lot_sp_2, buildable).
lot_district(lot_sp_2, solar_terrace).
lot_street(lot_sp_2, garden_way).
lot_side(lot_sp_2, right).
lot_house_number(lot_sp_2, 10).
building(lot_sp_2, business, farm).
business(lot_sp_2, 'Skygreen Vertical Farm', farm).
business_founded(lot_sp_2, 2047).

%% 18 Garden Way -- Community Kitchen
lot(lot_sp_3, '18 Garden Way', heliotrope_commons).
lot_type(lot_sp_3, buildable).
lot_district(lot_sp_3, solar_terrace).
lot_street(lot_sp_3, garden_way).
lot_side(lot_sp_3, left).
lot_house_number(lot_sp_3, 18).
building(lot_sp_3, business, restaurant).
business(lot_sp_3, 'Commons Kitchen', restaurant).
business_founded(lot_sp_3, 2046).

%% 26 Garden Way -- Residence (Living Wall Apartments)
lot(lot_sp_4, '26 Garden Way', heliotrope_commons).
lot_type(lot_sp_4, buildable).
lot_district(lot_sp_4, solar_terrace).
lot_street(lot_sp_4, garden_way).
lot_side(lot_sp_4, right).
lot_house_number(lot_sp_4, 26).
building(lot_sp_4, residence, apartment).

%% 5 Photon Lane -- Solar Panel Fabrication Lab
lot(lot_sp_5, '5 Photon Lane', heliotrope_commons).
lot_type(lot_sp_5, buildable).
lot_district(lot_sp_5, solar_terrace).
lot_street(lot_sp_5, photon_lane).
lot_side(lot_sp_5, left).
lot_house_number(lot_sp_5, 5).
building(lot_sp_5, business, laboratory).
business(lot_sp_5, 'Photon Fabrication Lab', laboratory).
business_founded(lot_sp_5, 2048).

%% 15 Photon Lane -- Energy Cooperative Office
lot(lot_sp_6, '15 Photon Lane', heliotrope_commons).
lot_type(lot_sp_6, buildable).
lot_district(lot_sp_6, solar_terrace).
lot_street(lot_sp_6, photon_lane).
lot_side(lot_sp_6, right).
lot_house_number(lot_sp_6, 15).
building(lot_sp_6, civic, office).

%% 22 Photon Lane -- Repair Cafe
lot(lot_sp_7, '22 Photon Lane', heliotrope_commons).
lot_type(lot_sp_7, buildable).
lot_district(lot_sp_7, solar_terrace).
lot_street(lot_sp_7, photon_lane).
lot_side(lot_sp_7, left).
lot_house_number(lot_sp_7, 22).
building(lot_sp_7, business, cafe).
business(lot_sp_7, 'Fix-It Repair Cafe', cafe).
business_founded(lot_sp_7, 2050).

%% === Mycelium Quarter (Heliotrope Commons) ===

%% 3 Spore Walk -- Algae Bioreactor Lab
lot(lot_sp_8, '3 Spore Walk', heliotrope_commons).
lot_type(lot_sp_8, buildable).
lot_district(lot_sp_8, mycelium_quarter).
lot_street(lot_sp_8, spore_walk).
lot_side(lot_sp_8, left).
lot_house_number(lot_sp_8, 3).
building(lot_sp_8, business, laboratory).
business(lot_sp_8, 'Verdance Algae Lab', laboratory).
business_founded(lot_sp_8, 2049).

%% 12 Spore Walk -- Mycotech Composting Facility
lot(lot_sp_9, '12 Spore Walk', heliotrope_commons).
lot_type(lot_sp_9, buildable).
lot_district(lot_sp_9, mycelium_quarter).
lot_street(lot_sp_9, spore_walk).
lot_side(lot_sp_9, right).
lot_house_number(lot_sp_9, 12).
building(lot_sp_9, business, workshop).
business(lot_sp_9, 'Mycotech Composting', workshop).
business_founded(lot_sp_9, 2050).

%% 20 Spore Walk -- Seed Library
lot(lot_sp_10, '20 Spore Walk', heliotrope_commons).
lot_type(lot_sp_10, buildable).
lot_district(lot_sp_10, mycelium_quarter).
lot_street(lot_sp_10, spore_walk).
lot_side(lot_sp_10, left).
lot_house_number(lot_sp_10, 20).
building(lot_sp_10, civic, library).

%% 28 Spore Walk -- Residence
lot(lot_sp_11, '28 Spore Walk', heliotrope_commons).
lot_type(lot_sp_11, buildable).
lot_district(lot_sp_11, mycelium_quarter).
lot_street(lot_sp_11, spore_walk).
lot_side(lot_sp_11, right).
lot_house_number(lot_sp_11, 28).
building(lot_sp_11, residence, house).

%% 5 Ferment Row -- Bioprinting Studio
lot(lot_sp_12, '5 Ferment Row', heliotrope_commons).
lot_type(lot_sp_12, buildable).
lot_district(lot_sp_12, mycelium_quarter).
lot_street(lot_sp_12, ferment_row).
lot_side(lot_sp_12, left).
lot_house_number(lot_sp_12, 5).
building(lot_sp_12, business, workshop).
business(lot_sp_12, 'BioForm Printing Studio', workshop).
business_founded(lot_sp_12, 2052).

%% 14 Ferment Row -- Fermentation Brewery
lot(lot_sp_13, '14 Ferment Row', heliotrope_commons).
lot_type(lot_sp_13, buildable).
lot_district(lot_sp_13, mycelium_quarter).
lot_street(lot_sp_13, ferment_row).
lot_side(lot_sp_13, right).
lot_house_number(lot_sp_13, 14).
building(lot_sp_13, business, brewery).
business(lot_sp_13, 'Spore and Grain Brewery', brewery).
business_founded(lot_sp_13, 2051).

%% === Canopy Ring (Heliotrope Commons) ===

%% 4 Treetop Path -- Maker Space
lot(lot_sp_14, '4 Treetop Path', heliotrope_commons).
lot_type(lot_sp_14, buildable).
lot_district(lot_sp_14, canopy_ring).
lot_street(lot_sp_14, treetop_path).
lot_side(lot_sp_14, left).
lot_house_number(lot_sp_14, 4).
building(lot_sp_14, business, workshop).
business(lot_sp_14, 'Canopy Maker Space', workshop).
business_founded(lot_sp_14, 2051).

%% 12 Treetop Path -- Open-Air Classroom
lot(lot_sp_15, '12 Treetop Path', heliotrope_commons).
lot_type(lot_sp_15, buildable).
lot_district(lot_sp_15, canopy_ring).
lot_street(lot_sp_15, treetop_path).
lot_side(lot_sp_15, right).
lot_house_number(lot_sp_15, 12).
building(lot_sp_15, civic, school).

%% 20 Treetop Path -- Art Collective Gallery
lot(lot_sp_16, '20 Treetop Path', heliotrope_commons).
lot_type(lot_sp_16, buildable).
lot_district(lot_sp_16, canopy_ring).
lot_street(lot_sp_16, treetop_path).
lot_side(lot_sp_16, left).
lot_house_number(lot_sp_16, 20).
building(lot_sp_16, business, gallery).
business(lot_sp_16, 'Solstice Art Collective', gallery).
business_founded(lot_sp_16, 2053).

%% 28 Treetop Path -- Residence (Treehouse Cluster)
lot(lot_sp_17, '28 Treetop Path', heliotrope_commons).
lot_type(lot_sp_17, buildable).
lot_district(lot_sp_17, canopy_ring).
lot_street(lot_sp_17, treetop_path).
lot_side(lot_sp_17, right).
lot_house_number(lot_sp_17, 28).
building(lot_sp_17, residence, house).

%% 6 Vine Bridge -- Music and Sound Garden
lot(lot_sp_18, '6 Vine Bridge', heliotrope_commons).
lot_type(lot_sp_18, buildable).
lot_district(lot_sp_18, canopy_ring).
lot_street(lot_sp_18, vine_bridge).
lot_side(lot_sp_18, left).
lot_house_number(lot_sp_18, 6).
building(lot_sp_18, civic, park).

%% 14 Vine Bridge -- Community Library
lot(lot_sp_19, '14 Vine Bridge', heliotrope_commons).
lot_type(lot_sp_19, buildable).
lot_district(lot_sp_19, canopy_ring).
lot_street(lot_sp_19, vine_bridge).
lot_side(lot_sp_19, right).
lot_house_number(lot_sp_19, 14).
building(lot_sp_19, civic, library).

%% === Watershed Commons (Heliotrope Commons) ===

%% 3 Aquifer Road -- Water Purification Center
lot(lot_sp_20, '3 Aquifer Road', heliotrope_commons).
lot_type(lot_sp_20, buildable).
lot_district(lot_sp_20, watershed_commons).
lot_street(lot_sp_20, aquifer_road).
lot_side(lot_sp_20, left).
lot_house_number(lot_sp_20, 3).
building(lot_sp_20, civic, utility).

%% 10 Aquifer Road -- Aquaponics Greenhouse
lot(lot_sp_21, '10 Aquifer Road', heliotrope_commons).
lot_type(lot_sp_21, buildable).
lot_district(lot_sp_21, watershed_commons).
lot_street(lot_sp_21, aquifer_road).
lot_side(lot_sp_21, right).
lot_house_number(lot_sp_21, 10).
building(lot_sp_21, business, farm).
business(lot_sp_21, 'Watershed Aquaponics', farm).
business_founded(lot_sp_21, 2054).

%% 18 Aquifer Road -- Community Council Hall
lot(lot_sp_22, '18 Aquifer Road', heliotrope_commons).
lot_type(lot_sp_22, buildable).
lot_district(lot_sp_22, watershed_commons).
lot_street(lot_sp_22, aquifer_road).
lot_side(lot_sp_22, left).
lot_house_number(lot_sp_22, 18).
building(lot_sp_22, civic, council_hall).

%% 25 Aquifer Road -- Residence
lot(lot_sp_23, '25 Aquifer Road', heliotrope_commons).
lot_type(lot_sp_23, buildable).
lot_district(lot_sp_23, watershed_commons).
lot_street(lot_sp_23, aquifer_road).
lot_side(lot_sp_23, right).
lot_house_number(lot_sp_23, 25).
building(lot_sp_23, residence, apartment).

%% === Tidecrest Village Lots ===

%% 3 Kelp Lane -- Marine Research Station
lot(lot_sp_24, '3 Kelp Lane', tidecrest_village).
lot_type(lot_sp_24, buildable).
lot_district(lot_sp_24, reef_harbor).
lot_street(lot_sp_24, kelp_lane).
lot_side(lot_sp_24, left).
lot_house_number(lot_sp_24, 3).
building(lot_sp_24, business, laboratory).
business(lot_sp_24, 'Tidecrest Marine Station', laboratory).
business_founded(lot_sp_24, 2056).

%% 10 Kelp Lane -- Seaweed Farm
lot(lot_sp_25, '10 Kelp Lane', tidecrest_village).
lot_type(lot_sp_25, buildable).
lot_district(lot_sp_25, reef_harbor).
lot_street(lot_sp_25, kelp_lane).
lot_side(lot_sp_25, right).
lot_house_number(lot_sp_25, 10).
building(lot_sp_25, business, farm).
business(lot_sp_25, 'Kelp Forest Farms', farm).
business_founded(lot_sp_25, 2057).

%% 5 Driftwood Walk -- Boat Repair Cooperative
lot(lot_sp_26, '5 Driftwood Walk', tidecrest_village).
lot_type(lot_sp_26, buildable).
lot_district(lot_sp_26, reef_harbor).
lot_street(lot_sp_26, driftwood_walk).
lot_side(lot_sp_26, left).
lot_house_number(lot_sp_26, 5).
building(lot_sp_26, business, workshop).
business(lot_sp_26, 'Driftwood Boat Co-op', workshop).
business_founded(lot_sp_26, 2056).

%% 12 Driftwood Walk -- Residence
lot(lot_sp_27, '12 Driftwood Walk', tidecrest_village).
lot_type(lot_sp_27, buildable).
lot_district(lot_sp_27, reef_harbor).
lot_street(lot_sp_27, driftwood_walk).
lot_side(lot_sp_27, right).
lot_house_number(lot_sp_27, 12).
building(lot_sp_27, residence, house).

%% === Roothold Hamlet Lots ===

%% 2 Fern Trail -- Reforestation Nursery
lot(lot_sp_28, '2 Fern Trail', roothold_hamlet).
lot_type(lot_sp_28, buildable).
lot_district(lot_sp_28, forest_floor).
lot_street(lot_sp_28, fern_trail).
lot_side(lot_sp_28, left).
lot_house_number(lot_sp_28, 2).
building(lot_sp_28, business, nursery).
business(lot_sp_28, 'Roothold Reforestation Nursery', nursery).
business_founded(lot_sp_28, 2060).

%% 8 Fern Trail -- Mushroom Cultivation Cave
lot(lot_sp_29, '8 Fern Trail', roothold_hamlet).
lot_type(lot_sp_29, buildable).
lot_district(lot_sp_29, forest_floor).
lot_street(lot_sp_29, fern_trail).
lot_side(lot_sp_29, right).
lot_house_number(lot_sp_29, 8).
building(lot_sp_29, business, farm).
business(lot_sp_29, 'Deeproot Mushroom Cave', farm).
business_founded(lot_sp_29, 2061).

%% 14 Fern Trail -- Residence
lot(lot_sp_30, '14 Fern Trail', roothold_hamlet).
lot_type(lot_sp_30, buildable).
lot_district(lot_sp_30, forest_floor).
lot_street(lot_sp_30, fern_trail).
lot_side(lot_sp_30, left).
lot_house_number(lot_sp_30, 14).
building(lot_sp_30, residence, house).
