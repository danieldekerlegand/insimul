%% Insimul Settlements: Low Fantasy
%% Source: data/worlds/low_fantasy/settlements.pl
%% Created: 2026-04-03
%% Total: 3 settlements

%% Grimhallow -- a decaying trade town on a silted river
settlement(grimhallow, 'Grimhallow', ashenmarch, iron_duchies).
settlement_type(grimhallow, town).
settlement_founded(grimhallow, 812).

district(the_narrows, 'The Narrows', grimhallow).
district_wealth(the_narrows, 25).
district_crime(the_narrows, 65).
district_established(the_narrows, 812).
district(merchants_row, 'Merchants Row', grimhallow).
district_wealth(merchants_row, 50).
district_crime(merchants_row, 30).
district_established(merchants_row, 870).
district(the_old_keep, 'The Old Keep', grimhallow).
district_wealth(the_old_keep, 60).
district_crime(the_old_keep, 15).
district_established(the_old_keep, 812).

street(mudgate_lane, 'Mudgate Lane', grimhallow, the_narrows).
street_condition(mudgate_lane, poor).
street_traffic(mudgate_lane, high).
street(ratcatcher_alley, 'Ratcatcher Alley', grimhallow, the_narrows).
street_condition(ratcatcher_alley, poor).
street_traffic(ratcatcher_alley, medium).
street(coppersmith_road, 'Coppersmith Road', grimhallow, merchants_row).
street_condition(coppersmith_road, fair).
street_traffic(coppersmith_road, high).
street(tanner_street, 'Tanner Street', grimhallow, merchants_row).
street_condition(tanner_street, fair).
street_traffic(tanner_street, medium).
street(keep_road, 'Keep Road', grimhallow, the_old_keep).
street_condition(keep_road, good).
street_traffic(keep_road, low).

landmark(gallows_square, 'Gallows Square', grimhallow, the_narrows).
landmark_historical(gallows_square).
landmark_established(gallows_square, 815).
landmark(broken_bell_tower, 'Broken Bell Tower', grimhallow, the_old_keep).
landmark_historical(broken_bell_tower).
landmark_established(broken_bell_tower, 830).
landmark(river_gate, 'River Gate', grimhallow, merchants_row).
landmark_established(river_gate, 870).

%% Thornfield -- a fortified village on the frontier
settlement(thornfield, 'Thornfield', ashenmarch, iron_duchies).
settlement_type(thornfield, village).
settlement_founded(thornfield, 940).

district(village_common, 'Village Common', thornfield).
district_wealth(village_common, 30).
district_crime(village_common, 15).
district_established(village_common, 940).
district(palisade_ward, 'Palisade Ward', thornfield).
district_wealth(palisade_ward, 40).
district_crime(palisade_ward, 10).
district_established(palisade_ward, 955).

street(furrow_lane, 'Furrow Lane', thornfield, village_common).
street_condition(furrow_lane, poor).
street_traffic(furrow_lane, low).
street(wall_walk, 'Wall Walk', thornfield, palisade_ward).
street_condition(wall_walk, fair).
street_traffic(wall_walk, low).

landmark(thornfield_palisade, 'Thornfield Palisade', thornfield, palisade_ward).
landmark_historical(thornfield_palisade).
landmark_established(thornfield_palisade, 955).

%% Saltmire -- a smuggler port on the coast
settlement(saltmire, 'Saltmire', bleakshore, iron_duchies).
settlement_type(saltmire, hamlet).
settlement_founded(saltmire, 1015).

district(the_docks, 'The Docks', saltmire).
district_wealth(the_docks, 35).
district_crime(the_docks, 70).
district_established(the_docks, 1015).

street(barnacle_way, 'Barnacle Way', saltmire, the_docks).
street_condition(barnacle_way, poor).
street_traffic(barnacle_way, medium).
street(wrecker_lane, 'Wrecker Lane', saltmire, the_docks).
street_condition(wrecker_lane, poor).
street_traffic(wrecker_lane, low).
