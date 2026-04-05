%% Insimul Settlements: Dark Fantasy Cursed Lands
%% Source: data/worlds/dark_fantasy/settlements.pl
%% Created: 2026-04-03
%% Total: 3 settlements

%% Ashenvale -- a fortified town clinging to life amid the blight
settlement(ashenvale, 'Ashenvale', cursed_highlands, dark_fantasy).
settlement_type(ashenvale, town).
settlement_founded(ashenvale, 812).

district(plague_quarter, 'Plague Quarter', ashenvale).
district_wealth(plague_quarter, 15).
district_crime(plague_quarter, 60).
district_established(plague_quarter, 812).
district(sanctum_ward, 'Sanctum Ward', ashenvale).
district_wealth(sanctum_ward, 45).
district_crime(sanctum_ward, 20).
district_established(sanctum_ward, 830).
district(ashen_market, 'Ashen Market', ashenvale).
district_wealth(ashen_market, 35).
district_crime(ashen_market, 40).
district_established(ashen_market, 845).
district(ironbound_quarter, 'Ironbound Quarter', ashenvale).
district_wealth(ironbound_quarter, 50).
district_crime(ironbound_quarter, 15).
district_established(ironbound_quarter, 820).

street(corpse_road, 'Corpse Road', ashenvale, plague_quarter).
street_condition(corpse_road, poor).
street_traffic(corpse_road, low).
street(pyre_lane, 'Pyre Lane', ashenvale, plague_quarter).
street_condition(pyre_lane, poor).
street_traffic(pyre_lane, low).
street(vigil_street, 'Vigil Street', ashenvale, sanctum_ward).
street_condition(vigil_street, fair).
street_traffic(vigil_street, medium).
street(censer_walk, 'Censer Walk', ashenvale, sanctum_ward).
street_condition(censer_walk, good).
street_traffic(censer_walk, medium).
street(barter_row, 'Barter Row', ashenvale, ashen_market).
street_condition(barter_row, fair).
street_traffic(barter_row, high).
street(tinker_alley, 'Tinker Alley', ashenvale, ashen_market).
street_condition(tinker_alley, fair).
street_traffic(tinker_alley, medium).
street(bulwark_road, 'Bulwark Road', ashenvale, ironbound_quarter).
street_condition(bulwark_road, good).
street_traffic(bulwark_road, medium).

landmark(the_bonfire_pit, 'The Bonfire Pit', ashenvale, plague_quarter).
landmark_historical(the_bonfire_pit).
landmark_established(the_bonfire_pit, 815).
landmark(cathedral_of_ashes, 'Cathedral of Ashes', ashenvale, sanctum_ward).
landmark_historical(cathedral_of_ashes).
landmark_established(cathedral_of_ashes, 835).
landmark(the_iron_gate, 'The Iron Gate', ashenvale, ironbound_quarter).
landmark_historical(the_iron_gate).
landmark_established(the_iron_gate, 820).

%% Hollowmere -- a forsaken village at the edge of a cursed swamp
settlement(hollowmere, 'Hollowmere', cursed_highlands, dark_fantasy).
settlement_type(hollowmere, village).
settlement_founded(hollowmere, 780).

district(mire_edge, 'Mire Edge', hollowmere).
district_wealth(mire_edge, 10).
district_crime(mire_edge, 50).
district_established(mire_edge, 780).

street(bog_path, 'Bog Path', hollowmere, mire_edge).
street_condition(bog_path, poor).
street_traffic(bog_path, low).
street(wailing_lane, 'Wailing Lane', hollowmere, mire_edge).
street_condition(wailing_lane, poor).
street_traffic(wailing_lane, low).

landmark(the_drowned_bell, 'The Drowned Bell', hollowmere, mire_edge).
landmark_historical(the_drowned_bell).
landmark_established(the_drowned_bell, 790).

%% Gravenhold -- a ruined citadel now occupied by the undead lord and his servants
settlement(gravenhold, 'Gravenhold', cursed_highlands, dark_fantasy).
settlement_type(gravenhold, fortress).
settlement_founded(gravenhold, 600).

district(outer_ruins, 'Outer Ruins', gravenhold).
district_wealth(outer_ruins, 5).
district_crime(outer_ruins, 90).
district_established(outer_ruins, 600).
district(inner_sanctum, 'Inner Sanctum', gravenhold).
district_wealth(inner_sanctum, 60).
district_crime(inner_sanctum, 95).
district_established(inner_sanctum, 620).

street(shattered_avenue, 'Shattered Avenue', gravenhold, outer_ruins).
street_condition(shattered_avenue, poor).
street_traffic(shattered_avenue, low).
street(throne_passage, 'Throne Passage', gravenhold, inner_sanctum).
street_condition(throne_passage, fair).
street_traffic(throne_passage, low).

landmark(the_black_throne, 'The Black Throne', gravenhold, inner_sanctum).
landmark_historical(the_black_throne).
landmark_established(the_black_throne, 625).
