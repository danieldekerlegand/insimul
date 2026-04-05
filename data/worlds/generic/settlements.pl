%% Insimul Settlements: Generic Fantasy World
%% Source: data/worlds/generic/settlements.pl
%% Created: 2026-04-03
%% Total: 2 settlements

%% Stonehaven (Town)
settlement(stonehaven, 'Stonehaven', central_province, generic_kingdom).
settlement_type(stonehaven, town).
settlement_founded(stonehaven, 850).

district(market_district, 'Market District', stonehaven).
district_wealth(market_district, 60).
district_crime(market_district, 15).
district_established(market_district, 850).
district(temple_district, 'Temple District', stonehaven).
district_wealth(temple_district, 70).
district_crime(temple_district, 5).
district_established(temple_district, 870).
district(crafters_quarter, 'Crafters Quarter', stonehaven).
district_wealth(crafters_quarter, 50).
district_crime(crafters_quarter, 10).
district_established(crafters_quarter, 880).

street(high_street, 'High Street', stonehaven, market_district).
street_condition(high_street, good).
street_traffic(high_street, high).
street(temple_road, 'Temple Road', stonehaven, temple_district).
street_condition(temple_road, good).
street_traffic(temple_road, medium).
street(forge_lane, 'Forge Lane', stonehaven, crafters_quarter).
street_condition(forge_lane, fair).
street_traffic(forge_lane, medium).
street(mill_street, 'Mill Street', stonehaven, market_district).
street_condition(mill_street, fair).
street_traffic(mill_street, medium).
street(wall_walk, 'Wall Walk', stonehaven, crafters_quarter).
street_condition(wall_walk, good).
street_traffic(wall_walk, low).

landmark(town_fountain, 'Town Fountain', stonehaven, market_district).
landmark_established(town_fountain, 900).
landmark(bell_tower, 'Bell Tower', stonehaven, temple_district).
landmark_historical(bell_tower).
landmark_established(bell_tower, 870).
landmark(old_gate, 'Old Gate', stonehaven, crafters_quarter).
landmark_historical(old_gate).
landmark_established(old_gate, 850).

%% Willowmere (Village)
settlement(willowmere, 'Willowmere', central_province, generic_kingdom).
settlement_type(willowmere, village).
settlement_founded(willowmere, 920).

district(village_green, 'Village Green', willowmere).
district_wealth(village_green, 35).
district_crime(village_green, 3).
district_established(village_green, 920).

street(meadow_path, 'Meadow Path', willowmere, village_green).
street_condition(meadow_path, fair).
street_traffic(meadow_path, low).
street(orchard_lane, 'Orchard Lane', willowmere, village_green).
street_condition(orchard_lane, fair).
street_traffic(orchard_lane, low).
