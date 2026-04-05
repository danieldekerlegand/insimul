%% Insimul Settlements: Historical Medieval Europe
%% Source: data/worlds/historical_medieval/settlements.pl
%% Created: 2026-04-03
%% Total: 3 settlements

%% Ashworth Keep — a fortified town around a hilltop castle
settlement(ashworth_keep, 'Ashworth Keep', duchy_of_ashworth, kingdom_of_aldermere).
settlement_type(ashworth_keep, town).
settlement_founded(ashworth_keep, 1066).

district(castle_ward, 'Castle Ward', ashworth_keep).
district_wealth(castle_ward, 90).
district_crime(castle_ward, 5).
district_established(castle_ward, 1066).
district(market_square, 'Market Square', ashworth_keep).
district_wealth(market_square, 60).
district_crime(market_square, 25).
district_established(market_square, 1120).
district(abbey_quarter, 'Abbey Quarter', ashworth_keep).
district_wealth(abbey_quarter, 70).
district_crime(abbey_quarter, 8).
district_established(abbey_quarter, 1095).

street(kings_road, 'Kings Road', ashworth_keep, castle_ward).
street_condition(kings_road, good).
street_traffic(kings_road, high).
street(pilgrim_way, 'Pilgrim Way', ashworth_keep, abbey_quarter).
street_condition(pilgrim_way, fair).
street_traffic(pilgrim_way, medium).
street(tanners_lane, 'Tanners Lane', ashworth_keep, market_square).
street_condition(tanners_lane, poor).
street_traffic(tanners_lane, high).
street(chapel_street, 'Chapel Street', ashworth_keep, abbey_quarter).
street_condition(chapel_street, good).
street_traffic(chapel_street, low).
street(merchants_row, 'Merchants Row', ashworth_keep, market_square).
street_condition(merchants_row, fair).
street_traffic(merchants_row, high).

landmark(ashworth_castle, 'Ashworth Castle', ashworth_keep, castle_ward).
landmark_historical(ashworth_castle).
landmark_established(ashworth_castle, 1066).
landmark(st_aldhelm_abbey, 'St. Aldhelm Abbey', ashworth_keep, abbey_quarter).
landmark_historical(st_aldhelm_abbey).
landmark_established(st_aldhelm_abbey, 1095).
landmark(market_cross, 'Market Cross', ashworth_keep, market_square).
landmark_established(market_cross, 1150).

%% Dunmere Village — a farming hamlet in the valley below
settlement(dunmere_village, 'Dunmere Village', duchy_of_ashworth, kingdom_of_aldermere).
settlement_type(dunmere_village, village).
settlement_founded(dunmere_village, 1100).

district(village_green, 'Village Green', dunmere_village).
district_wealth(village_green, 25).
district_crime(village_green, 10).
district_established(village_green, 1100).

street(field_path, 'Field Path', dunmere_village, village_green).
street_condition(field_path, poor).
street_traffic(field_path, low).
street(mill_lane, 'Mill Lane', dunmere_village, village_green).
street_condition(mill_lane, fair).
street_traffic(mill_lane, low).

landmark(old_well, 'Old Well', dunmere_village, village_green).
landmark_established(old_well, 1100).

%% Ravenhold Priory — a remote monastery settlement
settlement(ravenhold_priory, 'Ravenhold Priory', duchy_of_ashworth, kingdom_of_aldermere).
settlement_type(ravenhold_priory, hamlet).
settlement_founded(ravenhold_priory, 1080).

district(cloister_grounds, 'Cloister Grounds', ravenhold_priory).
district_wealth(cloister_grounds, 50).
district_crime(cloister_grounds, 2).
district_established(cloister_grounds, 1080).

street(cloister_walk, 'Cloister Walk', ravenhold_priory, cloister_grounds).
street_condition(cloister_walk, good).
street_traffic(cloister_walk, low).

landmark(ravenhold_chapter_house, 'Chapter House', ravenhold_priory, cloister_grounds).
landmark_historical(ravenhold_chapter_house).
landmark_established(ravenhold_chapter_house, 1085).
