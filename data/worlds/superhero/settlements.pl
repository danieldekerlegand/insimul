%% Insimul Settlements: Superhero City
%% Source: data/worlds/superhero/settlements.pl
%% Created: 2026-04-03
%% Total: 2 settlements

%% Titan City — Main Hero Metropolis
settlement(titan_city, 'Titan City', metro_region, united_republic).
settlement_type(titan_city, city).
settlement_founded(titan_city, 1890).

district(downtown_core, 'Downtown Core', titan_city).
district_wealth(downtown_core, 85).
district_crime(downtown_core, 15).
district_established(downtown_core, 1890).
district(the_docks, 'The Docks', titan_city).
district_wealth(the_docks, 30).
district_crime(the_docks, 65).
district_established(the_docks, 1905).
district(midtown, 'Midtown', titan_city).
district_wealth(midtown, 70).
district_crime(midtown, 20).
district_established(midtown, 1920).
district(the_narrows, 'The Narrows', titan_city).
district_wealth(the_narrows, 20).
district_crime(the_narrows, 80).
district_established(the_narrows, 1910).
district(tech_quarter, 'Tech Quarter', titan_city).
district_wealth(tech_quarter, 90).
district_crime(tech_quarter, 10).
district_established(tech_quarter, 1995).

street(sentinel_avenue, 'Sentinel Avenue', titan_city, downtown_core).
street_condition(sentinel_avenue, good).
street_traffic(sentinel_avenue, high).
street(harbor_road, 'Harbor Road', titan_city, the_docks).
street_condition(harbor_road, poor).
street_traffic(harbor_road, medium).
street(liberty_boulevard, 'Liberty Boulevard', titan_city, midtown).
street_condition(liberty_boulevard, good).
street_traffic(liberty_boulevard, high).
street(grimm_street, 'Grimm Street', titan_city, the_narrows).
street_condition(grimm_street, poor).
street_traffic(grimm_street, low).
street(circuit_drive, 'Circuit Drive', titan_city, tech_quarter).
street_condition(circuit_drive, good).
street_traffic(circuit_drive, medium).
street(iron_lane, 'Iron Lane', titan_city, the_docks).
street_condition(iron_lane, fair).
street_traffic(iron_lane, low).
street(vanguard_plaza, 'Vanguard Plaza', titan_city, downtown_core).
street_condition(vanguard_plaza, good).
street_traffic(vanguard_plaza, high).

landmark(titan_tower, 'Titan Tower', titan_city, downtown_core).
landmark_historical(titan_tower).
landmark_established(titan_tower, 1962).
landmark(harbor_bridge, 'Harbor Bridge', titan_city, the_docks).
landmark_historical(harbor_bridge).
landmark_established(harbor_bridge, 1935).
landmark(memorial_statue, 'Memorial Statue', titan_city, midtown).
landmark_historical(memorial_statue).
landmark_established(memorial_statue, 1975).
landmark(old_clock_tower, 'Old Clock Tower', titan_city, the_narrows).
landmark_historical(old_clock_tower).
landmark_established(old_clock_tower, 1912).

%% Ironhaven — Industrial Outskirts and Villain Territory
settlement(ironhaven, 'Ironhaven', metro_region, united_republic).
settlement_type(ironhaven, town).
settlement_founded(ironhaven, 1920).

district(foundry_row, 'Foundry Row', ironhaven).
district_wealth(foundry_row, 25).
district_crime(foundry_row, 75).
district_established(foundry_row, 1920).
district(ash_district, 'Ash District', ironhaven).
district_wealth(ash_district, 15).
district_crime(ash_district, 90).
district_established(ash_district, 1930).

street(smelter_road, 'Smelter Road', ironhaven, foundry_row).
street_condition(smelter_road, poor).
street_traffic(smelter_road, low).
street(cinder_alley, 'Cinder Alley', ironhaven, ash_district).
street_condition(cinder_alley, poor).
street_traffic(cinder_alley, low).
street(furnace_way, 'Furnace Way', ironhaven, foundry_row).
street_condition(furnace_way, fair).
street_traffic(furnace_way, medium).
