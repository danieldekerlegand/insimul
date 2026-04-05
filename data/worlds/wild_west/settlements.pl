%% Insimul Settlements: Wild West
%% Source: data/worlds/wild_west/settlements.pl
%% Created: 2026-04-03
%% Total: 3 settlements

%% Redemption Gulch -- frontier town
settlement(redemption_gulch, 'Redemption Gulch', western_territory, united_states).
settlement_type(redemption_gulch, town).
settlement_founded(redemption_gulch, 1862).

district(main_street_district, 'Main Street', redemption_gulch).
district_wealth(main_street_district, 50).
district_crime(main_street_district, 30).
district_established(main_street_district, 1862).
district(cattle_quarter, 'Cattle Quarter', redemption_gulch).
district_wealth(cattle_quarter, 40).
district_crime(cattle_quarter, 15).
district_established(cattle_quarter, 1865).
district(rail_district, 'Rail District', redemption_gulch).
district_wealth(rail_district, 60).
district_crime(rail_district, 25).
district_established(rail_district, 1870).

street(main_street, 'Main Street', redemption_gulch, main_street_district).
street_condition(main_street, fair).
street_traffic(main_street, high).
street(dusty_trail, 'Dusty Trail', redemption_gulch, main_street_district).
street_condition(dusty_trail, poor).
street_traffic(dusty_trail, medium).
street(cattle_road, 'Cattle Road', redemption_gulch, cattle_quarter).
street_condition(cattle_road, poor).
street_traffic(cattle_road, medium).
street(stockyard_lane, 'Stockyard Lane', redemption_gulch, cattle_quarter).
street_condition(stockyard_lane, poor).
street_traffic(stockyard_lane, low).
street(depot_road, 'Depot Road', redemption_gulch, rail_district).
street_condition(depot_road, good).
street_traffic(depot_road, high).
street(freight_alley, 'Freight Alley', redemption_gulch, rail_district).
street_condition(freight_alley, fair).
street_traffic(freight_alley, medium).

landmark(gallows_hill, 'Gallows Hill', redemption_gulch, main_street_district).
landmark_historical(gallows_hill).
landmark_established(gallows_hill, 1863).
landmark(water_tower, 'Water Tower', redemption_gulch, rail_district).
landmark_established(water_tower, 1871).
landmark(cattle_gate, 'Cattle Gate', redemption_gulch, cattle_quarter).
landmark_established(cattle_gate, 1865).

%% Copper Ridge -- mining camp
settlement(copper_ridge, 'Copper Ridge', western_territory, united_states).
settlement_type(copper_ridge, camp).
settlement_founded(copper_ridge, 1869).

district(mine_district, 'Mine District', copper_ridge).
district_wealth(mine_district, 35).
district_crime(mine_district, 40).
district_established(mine_district, 1869).
district(camp_center, 'Camp Center', copper_ridge).
district_wealth(camp_center, 30).
district_crime(camp_center, 45).
district_established(camp_center, 1870).

street(mine_road, 'Mine Road', copper_ridge, mine_district).
street_condition(mine_road, poor).
street_traffic(mine_road, medium).
street(prospector_path, 'Prospector Path', copper_ridge, mine_district).
street_condition(prospector_path, poor).
street_traffic(prospector_path, low).
street(camp_trail, 'Camp Trail', copper_ridge, camp_center).
street_condition(camp_trail, poor).
street_traffic(camp_trail, medium).

landmark(silver_lode, 'Silver Lode Entrance', copper_ridge, mine_district).
landmark_historical(silver_lode).
landmark_established(silver_lode, 1869).

%% Broken Bow Ranch -- outlying ranch settlement
settlement(broken_bow, 'Broken Bow Ranch', western_territory, united_states).
settlement_type(broken_bow, outpost).
settlement_founded(broken_bow, 1858).

district(ranch_grounds, 'Ranch Grounds', broken_bow).
district_wealth(ranch_grounds, 55).
district_crime(ranch_grounds, 10).
district_established(ranch_grounds, 1858).

street(ranch_road, 'Ranch Road', broken_bow, ranch_grounds).
street_condition(ranch_road, fair).
street_traffic(ranch_road, low).
