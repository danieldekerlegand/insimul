%% Insimul Settlements: Solarpunk Eco-Communities
%% Source: data/worlds/solarpunk/settlements.pl
%% Created: 2026-04-03
%% Total: 3 settlements

%% Heliotrope Commons — main eco-city
settlement(heliotrope_commons, 'Heliotrope Commons', verdant_basin, solarpunk_collective).
settlement_type(heliotrope_commons, city).
settlement_founded(heliotrope_commons, 2045).

district(solar_terrace, 'Solar Terrace', heliotrope_commons).
district_wealth(solar_terrace, 70).
district_crime(solar_terrace, 3).
district_established(solar_terrace, 2045).
district(mycelium_quarter, 'Mycelium Quarter', heliotrope_commons).
district_wealth(mycelium_quarter, 60).
district_crime(mycelium_quarter, 2).
district_established(mycelium_quarter, 2048).
district(canopy_ring, 'Canopy Ring', heliotrope_commons).
district_wealth(canopy_ring, 65).
district_crime(canopy_ring, 2).
district_established(canopy_ring, 2050).
district(watershed_commons, 'Watershed Commons', heliotrope_commons).
district_wealth(watershed_commons, 55).
district_crime(watershed_commons, 1).
district_established(watershed_commons, 2052).

street(garden_way, 'Garden Way', heliotrope_commons, solar_terrace).
street_condition(garden_way, good).
street_traffic(garden_way, medium).
street(photon_lane, 'Photon Lane', heliotrope_commons, solar_terrace).
street_condition(photon_lane, good).
street_traffic(photon_lane, medium).
street(spore_walk, 'Spore Walk', heliotrope_commons, mycelium_quarter).
street_condition(spore_walk, good).
street_traffic(spore_walk, low).
street(ferment_row, 'Ferment Row', heliotrope_commons, mycelium_quarter).
street_condition(ferment_row, good).
street_traffic(ferment_row, low).
street(treetop_path, 'Treetop Path', heliotrope_commons, canopy_ring).
street_condition(treetop_path, good).
street_traffic(treetop_path, medium).
street(vine_bridge, 'Vine Bridge', heliotrope_commons, canopy_ring).
street_condition(vine_bridge, good).
street_traffic(vine_bridge, low).
street(aquifer_road, 'Aquifer Road', heliotrope_commons, watershed_commons).
street_condition(aquifer_road, good).
street_traffic(aquifer_road, low).

landmark(great_solar_array, 'Great Solar Array', heliotrope_commons, solar_terrace).
landmark_historical(great_solar_array).
landmark_established(great_solar_array, 2045).
landmark(seed_vault_tower, 'Seed Vault Tower', heliotrope_commons, mycelium_quarter).
landmark_established(seed_vault_tower, 2049).
landmark(sky_canopy, 'Sky Canopy', heliotrope_commons, canopy_ring).
landmark_established(sky_canopy, 2051).
landmark(living_dam, 'Living Dam', heliotrope_commons, watershed_commons).
landmark_historical(living_dam).
landmark_established(living_dam, 2053).

%% Tidecrest Village — coastal restoration settlement
settlement(tidecrest_village, 'Tidecrest Village', coastal_reach, solarpunk_collective).
settlement_type(tidecrest_village, village).
settlement_founded(tidecrest_village, 2055).

district(reef_harbor, 'Reef Harbor', tidecrest_village).
district_wealth(reef_harbor, 50).
district_crime(reef_harbor, 1).
district_established(reef_harbor, 2055).

street(kelp_lane, 'Kelp Lane', tidecrest_village, reef_harbor).
street_condition(kelp_lane, good).
street_traffic(kelp_lane, low).
street(driftwood_walk, 'Driftwood Walk', tidecrest_village, reef_harbor).
street_condition(driftwood_walk, good).
street_traffic(driftwood_walk, low).

landmark(tidal_turbine, 'Tidal Turbine', tidecrest_village, reef_harbor).
landmark_established(tidal_turbine, 2056).

%% Roothold Hamlet — forest restoration outpost
settlement(roothold_hamlet, 'Roothold Hamlet', deepwood_edge, solarpunk_collective).
settlement_type(roothold_hamlet, hamlet).
settlement_founded(roothold_hamlet, 2060).

district(forest_floor, 'Forest Floor', roothold_hamlet).
district_wealth(forest_floor, 45).
district_crime(forest_floor, 0).
district_established(forest_floor, 2060).

street(fern_trail, 'Fern Trail', roothold_hamlet, forest_floor).
street_condition(fern_trail, fair).
street_traffic(fern_trail, low).
