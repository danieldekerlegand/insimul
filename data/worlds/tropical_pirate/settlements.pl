%% Insimul Settlements: Tropical Pirate
%% Source: data/worlds/tropical_pirate/settlements.pl
%% Created: 2026-04-03
%% Total: 3 settlements

%% Port Royal — Pirate Haven
settlement(port_royal, 'Port Royal', caribbean_sea, pirate_republic).
settlement_type(port_royal, town).
settlement_founded(port_royal, 1655).

district(harbor_district, 'Harbor District', port_royal).
district_wealth(harbor_district, 60).
district_crime(harbor_district, 45).
district_established(harbor_district, 1655).
district(tavern_row, 'Tavern Row', port_royal).
district_wealth(tavern_row, 40).
district_crime(tavern_row, 70).
district_established(tavern_row, 1660).
district(merchant_quarter, 'Merchant Quarter', port_royal).
district_wealth(merchant_quarter, 75).
district_crime(merchant_quarter, 25).
district_established(merchant_quarter, 1665).

street(wharf_street, 'Wharf Street', port_royal, harbor_district).
street_condition(wharf_street, fair).
street_traffic(wharf_street, high).
street(anchor_lane, 'Anchor Lane', port_royal, harbor_district).
street_condition(anchor_lane, poor).
street_traffic(anchor_lane, medium).
street(rum_alley, 'Rum Alley', port_royal, tavern_row).
street_condition(rum_alley, poor).
street_traffic(rum_alley, high).
street(cutlass_road, 'Cutlass Road', port_royal, tavern_row).
street_condition(cutlass_road, fair).
street_traffic(cutlass_road, medium).
street(gold_street, 'Gold Street', port_royal, merchant_quarter).
street_condition(gold_street, good).
street_traffic(gold_street, high).
street(silk_lane, 'Silk Lane', port_royal, merchant_quarter).
street_condition(silk_lane, good).
street_traffic(silk_lane, medium).

landmark(gallows_point, 'Gallows Point', port_royal, harbor_district).
landmark_historical(gallows_point).
landmark_established(gallows_point, 1660).
landmark(pirate_fountain, 'Pirate Fountain', port_royal, tavern_row).
landmark_established(pirate_fountain, 1670).
landmark(trade_house, 'Trade House', port_royal, merchant_quarter).
landmark_historical(trade_house).
landmark_established(trade_house, 1668).

%% Isla Tortuga — Lawless Haven
settlement(isla_tortuga, 'Isla Tortuga', caribbean_sea, pirate_republic).
settlement_type(isla_tortuga, village).
settlement_founded(isla_tortuga, 1640).

district(beach_camp, 'Beach Camp', isla_tortuga).
district_wealth(beach_camp, 25).
district_crime(beach_camp, 80).
district_established(beach_camp, 1640).
district(cliff_caves, 'Cliff Caves', isla_tortuga).
district_wealth(cliff_caves, 15).
district_crime(cliff_caves, 90).
district_established(cliff_caves, 1645).

street(driftwood_path, 'Driftwood Path', isla_tortuga, beach_camp).
street_condition(driftwood_path, poor).
street_traffic(driftwood_path, medium).
street(bonfire_trail, 'Bonfire Trail', isla_tortuga, beach_camp).
street_condition(bonfire_trail, poor).
street_traffic(bonfire_trail, low).
street(smuggler_pass, 'Smuggler Pass', isla_tortuga, cliff_caves).
street_condition(smuggler_pass, poor).
street_traffic(smuggler_pass, low).

landmark(skull_rock, 'Skull Rock', isla_tortuga, cliff_caves).
landmark_historical(skull_rock).
landmark_established(skull_rock, 1640).

%% San Castillo — Colonial Port Town
settlement(san_castillo, 'San Castillo', caribbean_sea, spanish_crown).
settlement_type(san_castillo, town).
settlement_founded(san_castillo, 1580).

district(fort_district, 'Fort District', san_castillo).
district_wealth(fort_district, 80).
district_crime(fort_district, 10).
district_established(fort_district, 1580).
district(dockside, 'Dockside', san_castillo).
district_wealth(dockside, 50).
district_crime(dockside, 35).
district_established(dockside, 1590).

street(governor_road, 'Governor Road', san_castillo, fort_district).
street_condition(governor_road, good).
street_traffic(governor_road, medium).
street(cannon_walk, 'Cannon Walk', san_castillo, fort_district).
street_condition(cannon_walk, good).
street_traffic(cannon_walk, low).
street(fishmarket_lane, 'Fishmarket Lane', san_castillo, dockside).
street_condition(fishmarket_lane, fair).
street_traffic(fishmarket_lane, high).

landmark(fort_san_felipe, 'Fort San Felipe', san_castillo, fort_district).
landmark_historical(fort_san_felipe).
landmark_established(fort_san_felipe, 1582).
landmark(cathedral_bell_tower, 'Cathedral Bell Tower', san_castillo, fort_district).
landmark_historical(cathedral_bell_tower).
landmark_established(cathedral_bell_tower, 1595).
