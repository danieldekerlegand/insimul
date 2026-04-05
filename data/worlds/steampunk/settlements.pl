%% Insimul Settlements: Steampunk
%% Source: data/worlds/steampunk/settlements.pl
%% Created: 2026-04-03
%% Total: 3 settlements

%% Ironhaven -- the great industrial capital
settlement(ironhaven, 'Ironhaven', gearfall_province, steam_republic).
settlement_type(ironhaven, city).
settlement_founded(ironhaven, 1780).

district(boiler_ward, 'Boiler Ward', ironhaven).
district_wealth(boiler_ward, 40).
district_crime(boiler_ward, 30).
district_established(boiler_ward, 1785).
district(clocktower_heights, 'Clocktower Heights', ironhaven).
district_wealth(clocktower_heights, 85).
district_crime(clocktower_heights, 8).
district_established(clocktower_heights, 1800).
district(skyport_quarter, 'Skyport Quarter', ironhaven).
district_wealth(skyport_quarter, 65).
district_crime(skyport_quarter, 22).
district_established(skyport_quarter, 1820).
district(foundry_row, 'Foundry Row', ironhaven).
district_wealth(foundry_row, 50).
district_crime(foundry_row, 25).
district_established(foundry_row, 1790).

street(cogwheel_lane, 'Cogwheel Lane', ironhaven, boiler_ward).
street_condition(cogwheel_lane, fair).
street_traffic(cogwheel_lane, high).
street(steamvent_alley, 'Steamvent Alley', ironhaven, boiler_ward).
street_condition(steamvent_alley, poor).
street_traffic(steamvent_alley, medium).
street(brassgate_boulevard, 'Brassgate Boulevard', ironhaven, clocktower_heights).
street_condition(brassgate_boulevard, good).
street_traffic(brassgate_boulevard, high).
street(pendulum_street, 'Pendulum Street', ironhaven, clocktower_heights).
street_condition(pendulum_street, good).
street_traffic(pendulum_street, medium).
street(mooring_road, 'Mooring Road', ironhaven, skyport_quarter).
street_condition(mooring_road, good).
street_traffic(mooring_road, high).
street(rigging_walk, 'Rigging Walk', ironhaven, skyport_quarter).
street_condition(rigging_walk, fair).
street_traffic(rigging_walk, medium).
street(anvil_street, 'Anvil Street', ironhaven, foundry_row).
street_condition(anvil_street, fair).
street_traffic(anvil_street, high).
street(smelter_lane, 'Smelter Lane', ironhaven, foundry_row).
street_condition(smelter_lane, poor).
street_traffic(smelter_lane, medium).

landmark(grand_clocktower, 'Grand Clocktower', ironhaven, clocktower_heights).
landmark_historical(grand_clocktower).
landmark_established(grand_clocktower, 1802).
landmark(ironhaven_skyport, 'Ironhaven Central Skyport', ironhaven, skyport_quarter).
landmark_established(ironhaven_skyport, 1825).
landmark(the_great_boiler, 'The Great Boiler', ironhaven, boiler_ward).
landmark_historical(the_great_boiler).
landmark_established(the_great_boiler, 1788).
landmark(aether_spire, 'The Aether Spire', ironhaven, clocktower_heights).
landmark_established(aether_spire, 1845).

%% Coppermouth -- a smaller mining and refining town
settlement(coppermouth, 'Coppermouth', gearfall_province, steam_republic).
settlement_type(coppermouth, town).
settlement_founded(coppermouth, 1810).

district(mineshaft_quarter, 'Mineshaft Quarter', coppermouth).
district_wealth(mineshaft_quarter, 35).
district_crime(mineshaft_quarter, 20).
district_established(mineshaft_quarter, 1810).
district(refiners_row, 'Refiners Row', coppermouth).
district_wealth(refiners_row, 50).
district_crime(refiners_row, 15).
district_established(refiners_row, 1825).

street(pickaxe_lane, 'Pickaxe Lane', coppermouth, mineshaft_quarter).
street_condition(pickaxe_lane, poor).
street_traffic(pickaxe_lane, medium).
street(ore_cart_road, 'Ore Cart Road', coppermouth, mineshaft_quarter).
street_condition(ore_cart_road, fair).
street_traffic(ore_cart_road, high).
street(crucible_street, 'Crucible Street', coppermouth, refiners_row).
street_condition(crucible_street, fair).
street_traffic(crucible_street, medium).

landmark(copper_king_statue, 'Copper King Statue', coppermouth, refiners_row).
landmark_historical(copper_king_statue).
landmark_established(copper_king_statue, 1840).

%% Windhollow -- a remote aether research outpost
settlement(windhollow, 'Windhollow', skyreach_province, steam_republic).
settlement_type(windhollow, village).
settlement_founded(windhollow, 1835).

district(observatory_hill, 'Observatory Hill', windhollow).
district_wealth(observatory_hill, 60).
district_crime(observatory_hill, 5).
district_established(observatory_hill, 1835).

street(telescope_path, 'Telescope Path', windhollow, observatory_hill).
street_condition(telescope_path, good).
street_traffic(telescope_path, low).
street(barometer_lane, 'Barometer Lane', windhollow, observatory_hill).
street_condition(barometer_lane, good).
street_traffic(barometer_lane, low).

landmark(aether_observatory, 'Aether Observatory', windhollow, observatory_hill).
landmark_historical(aether_observatory).
landmark_established(aether_observatory, 1838).
