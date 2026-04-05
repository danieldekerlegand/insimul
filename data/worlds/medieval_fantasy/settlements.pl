%% Insimul Settlements: Medieval Fantasy
%% Source: data/worlds/medieval_fantasy/settlements.pl
%% Created: 2026-04-03
%% Total: 3 settlements

%% Aldenmere -- Royal Capital
settlement(aldenmere, 'Aldenmere', crownlands, kingdom_of_valdris).
settlement_type(aldenmere, city).
settlement_founded(aldenmere, 412).

district(castle_ward, 'Castle Ward', aldenmere).
district_wealth(castle_ward, 90).
district_crime(castle_ward, 5).
district_established(castle_ward, 412).
district(merchants_quarter, 'Merchants Quarter', aldenmere).
district_wealth(merchants_quarter, 70).
district_crime(merchants_quarter, 15).
district_established(merchants_quarter, 450).
district(commons, 'The Commons', aldenmere).
district_wealth(commons, 35).
district_crime(commons, 30).
district_established(commons, 480).
district(temple_hill, 'Temple Hill', aldenmere).
district_wealth(temple_hill, 60).
district_crime(temple_hill, 5).
district_established(temple_hill, 430).

street(kings_road, 'Kings Road', aldenmere, castle_ward).
street_condition(kings_road, good).
street_traffic(kings_road, high).
street(shield_lane, 'Shield Lane', aldenmere, castle_ward).
street_condition(shield_lane, good).
street_traffic(shield_lane, medium).
street(market_street, 'Market Street', aldenmere, merchants_quarter).
street_condition(market_street, fair).
street_traffic(market_street, high).
street(guild_row, 'Guild Row', aldenmere, merchants_quarter).
street_condition(guild_row, good).
street_traffic(guild_row, medium).
street(muddlers_alley, 'Muddlers Alley', aldenmere, commons).
street_condition(muddlers_alley, poor).
street_traffic(muddlers_alley, medium).
street(tanner_lane, 'Tanner Lane', aldenmere, commons).
street_condition(tanner_lane, poor).
street_traffic(tanner_lane, low).
street(pilgrim_way, 'Pilgrim Way', aldenmere, temple_hill).
street_condition(pilgrim_way, good).
street_traffic(pilgrim_way, medium).

landmark(valdris_castle, 'Valdris Castle', aldenmere, castle_ward).
landmark_historical(valdris_castle).
landmark_established(valdris_castle, 412).
landmark(great_fountain, 'Great Fountain', aldenmere, merchants_quarter).
landmark_established(great_fountain, 520).
landmark(cathedral_of_light, 'Cathedral of Light', aldenmere, temple_hill).
landmark_historical(cathedral_of_light).
landmark_established(cathedral_of_light, 435).

%% Thornhaven -- Frontier Village
settlement(thornhaven, 'Thornhaven', borderlands, kingdom_of_valdris).
settlement_type(thornhaven, village).
settlement_founded(thornhaven, 680).

district(village_square, 'Village Square', thornhaven).
district_wealth(village_square, 30).
district_crime(village_square, 10).
district_established(village_square, 680).
district(forest_edge, 'Forest Edge', thornhaven).
district_wealth(forest_edge, 20).
district_crime(forest_edge, 25).
district_established(forest_edge, 710).

street(old_forest_road, 'Old Forest Road', thornhaven, village_square).
street_condition(old_forest_road, fair).
street_traffic(old_forest_road, low).
street(bramble_path, 'Bramble Path', thornhaven, forest_edge).
street_condition(bramble_path, poor).
street_traffic(bramble_path, low).

landmark(ancient_standing_stones, 'Ancient Standing Stones', thornhaven, forest_edge).
landmark_historical(ancient_standing_stones).
landmark_established(ancient_standing_stones, 0).

%% Silverdeep -- Dwarven Mining Outpost
settlement(silverdeep, 'Silverdeep', grey_mountains, kingdom_of_valdris).
settlement_type(silverdeep, town).
settlement_founded(silverdeep, 550).

district(upper_shafts, 'Upper Shafts', silverdeep).
district_wealth(upper_shafts, 55).
district_crime(upper_shafts, 8).
district_established(upper_shafts, 550).
district(forge_district, 'Forge District', silverdeep).
district_wealth(forge_district, 65).
district_crime(forge_district, 5).
district_established(forge_district, 570).

street(ore_cart_road, 'Ore Cart Road', silverdeep, upper_shafts).
street_condition(ore_cart_road, good).
street_traffic(ore_cart_road, medium).
street(anvil_street, 'Anvil Street', silverdeep, forge_district).
street_condition(anvil_street, good).
street_traffic(anvil_street, medium).

landmark(great_forge, 'The Great Forge', silverdeep, forge_district).
landmark_historical(great_forge).
landmark_established(great_forge, 555).
