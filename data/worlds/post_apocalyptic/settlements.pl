%% Insimul Settlements: Post-Apocalyptic Wasteland
%% Source: data/worlds/post_apocalyptic/settlements.pl
%% Created: 2026-04-03
%% Total: 3 settlements

%% Haven Ridge -- fortified survivor settlement on a rocky plateau
settlement(haven_ridge, 'Haven Ridge', wasteland_plateau, collapsed_federation).
settlement_type(haven_ridge, town).
settlement_founded(haven_ridge, 2031).

district(inner_compound, 'Inner Compound', haven_ridge).
district_wealth(inner_compound, 45).
district_crime(inner_compound, 15).
district_established(inner_compound, 2031).
district(scrap_quarter, 'Scrap Quarter', haven_ridge).
district_wealth(scrap_quarter, 25).
district_crime(scrap_quarter, 35).
district_established(scrap_quarter, 2033).
district(water_works, 'Water Works', haven_ridge).
district_wealth(water_works, 55).
district_crime(water_works, 10).
district_established(water_works, 2034).

street(ridge_road, 'Ridge Road', haven_ridge, inner_compound).
street_condition(ridge_road, fair).
street_traffic(ridge_road, medium).
street(salvage_row, 'Salvage Row', haven_ridge, scrap_quarter).
street_condition(salvage_row, poor).
street_traffic(salvage_row, high).
street(pipe_alley, 'Pipe Alley', haven_ridge, water_works).
street_condition(pipe_alley, fair).
street_traffic(pipe_alley, low).
street(wall_walk, 'Wall Walk', haven_ridge, inner_compound).
street_condition(wall_walk, fair).
street_traffic(wall_walk, medium).
street(barter_lane, 'Barter Lane', haven_ridge, scrap_quarter).
street_condition(barter_lane, poor).
street_traffic(barter_lane, high).

landmark(the_watchtower, 'The Watchtower', haven_ridge, inner_compound).
landmark_historical(the_watchtower).
landmark_established(the_watchtower, 2031).
landmark(cistern_prime, 'Cistern Prime', haven_ridge, water_works).
landmark_established(cistern_prime, 2034).
landmark(the_great_wall, 'The Great Wall', haven_ridge, inner_compound).
landmark_historical(the_great_wall).
landmark_established(the_great_wall, 2032).

%% Rusthollow -- scavenger camp in the ruins of an old industrial district
settlement(rusthollow, 'Rusthollow', lowland_ruins, collapsed_federation).
settlement_type(rusthollow, camp).
settlement_founded(rusthollow, 2035).

district(foundry_ruins, 'Foundry Ruins', rusthollow).
district_wealth(foundry_ruins, 15).
district_crime(foundry_ruins, 45).
district_established(foundry_ruins, 2035).
district(tent_city, 'Tent City', rusthollow).
district_wealth(tent_city, 10).
district_crime(tent_city, 30).
district_established(tent_city, 2036).

street(girder_path, 'Girder Path', rusthollow, foundry_ruins).
street_condition(girder_path, poor).
street_traffic(girder_path, medium).
street(rubble_trail, 'Rubble Trail', rusthollow, tent_city).
street_condition(rubble_trail, poor).
street_traffic(rubble_trail, low).
street(soot_lane, 'Soot Lane', rusthollow, foundry_ruins).
street_condition(soot_lane, poor).
street_traffic(soot_lane, medium).

landmark(the_old_smokestack, 'The Old Smokestack', rusthollow, foundry_ruins).
landmark_historical(the_old_smokestack).
landmark_established(the_old_smokestack, 2005).

%% Iron Fang Stronghold -- raider-controlled fortress
settlement(iron_fang_stronghold, 'Iron Fang Stronghold', dead_valley, collapsed_federation).
settlement_type(iron_fang_stronghold, fortress).
settlement_founded(iron_fang_stronghold, 2033).

district(war_hall, 'War Hall', iron_fang_stronghold).
district_wealth(war_hall, 35).
district_crime(war_hall, 60).
district_established(war_hall, 2033).

street(blood_road, 'Blood Road', iron_fang_stronghold, war_hall).
street_condition(blood_road, fair).
street_traffic(blood_road, medium).

landmark(the_cage, 'The Cage', iron_fang_stronghold, war_hall).
landmark_established(the_cage, 2034).
