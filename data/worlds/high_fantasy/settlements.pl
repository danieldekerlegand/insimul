%% Insimul Settlements: High Fantasy
%% Source: data/worlds/high_fantasy/settlements.pl
%% Created: 2026-04-03
%% Total: 3 settlements

%% Aelindor -- Elven Capital City
settlement(aelindor, 'Aelindor', silverwood_province, high_fantasy).
settlement_type(aelindor, city).
settlement_founded(aelindor, -4500).

district(starlight_quarter, 'Starlight Quarter', aelindor).
district_wealth(starlight_quarter, 95).
district_crime(starlight_quarter, 2).
district_established(starlight_quarter, -4500).
district(arcane_precinct, 'Arcane Precinct', aelindor).
district_wealth(arcane_precinct, 90).
district_crime(arcane_precinct, 5).
district_established(arcane_precinct, -3800).
district(market_of_whispers, 'Market of Whispers', aelindor).
district_wealth(market_of_whispers, 70).
district_crime(market_of_whispers, 15).
district_established(market_of_whispers, -3200).
district(grove_ward, 'Grove Ward', aelindor).
district_wealth(grove_ward, 80).
district_crime(grove_ward, 3).
district_established(grove_ward, -4200).

street(moonpath, 'Moonpath', aelindor, starlight_quarter).
street_condition(moonpath, excellent).
street_traffic(moonpath, medium).
street(silverbough_lane, 'Silverbough Lane', aelindor, starlight_quarter).
street_condition(silverbough_lane, excellent).
street_traffic(silverbough_lane, low).
street(spellwright_row, 'Spellwright Row', aelindor, arcane_precinct).
street_condition(spellwright_row, good).
street_traffic(spellwright_row, medium).
street(runestone_alley, 'Runestone Alley', aelindor, arcane_precinct).
street_condition(runestone_alley, good).
street_traffic(runestone_alley, medium).
street(traders_walk, 'Traders Walk', aelindor, market_of_whispers).
street_condition(traders_walk, fair).
street_traffic(traders_walk, high).
street(grove_path, 'Grove Path', aelindor, grove_ward).
street_condition(grove_path, good).
street_traffic(grove_path, low).

landmark(tree_of_ages, 'Tree of Ages', aelindor, starlight_quarter).
landmark_historical(tree_of_ages).
landmark_established(tree_of_ages, -4500).
landmark(crystal_spire, 'Crystal Spire', aelindor, arcane_precinct).
landmark_historical(crystal_spire).
landmark_established(crystal_spire, -3800).
landmark(moonwell, 'Moonwell', aelindor, grove_ward).
landmark_historical(moonwell).
landmark_established(moonwell, -4300).

%% Khazad Dumrak -- Dwarven Hold
settlement(khazad_dumrak, 'Khazad Dumrak', ironpeak_mountains, high_fantasy).
settlement_type(khazad_dumrak, fortress_city).
settlement_founded(khazad_dumrak, -3200).

district(great_forge_hall, 'Great Forge Hall', khazad_dumrak).
district_wealth(great_forge_hall, 85).
district_crime(great_forge_hall, 5).
district_established(great_forge_hall, -3200).
district(deep_mines, 'Deep Mines', khazad_dumrak).
district_wealth(deep_mines, 75).
district_crime(deep_mines, 10).
district_established(deep_mines, -3100).
district(merchants_gallery, 'Merchants Gallery', khazad_dumrak).
district_wealth(merchants_gallery, 80).
district_crime(merchants_gallery, 8).
district_established(merchants_gallery, -2800).

street(anvil_road, 'Anvil Road', khazad_dumrak, great_forge_hall).
street_condition(anvil_road, good).
street_traffic(anvil_road, high).
street(mithril_passage, 'Mithril Passage', khazad_dumrak, deep_mines).
street_condition(mithril_passage, fair).
street_traffic(mithril_passage, medium).
street(gemcutter_way, 'Gemcutter Way', khazad_dumrak, merchants_gallery).
street_condition(gemcutter_way, good).
street_traffic(gemcutter_way, high).
street(runehammer_tunnel, 'Runehammer Tunnel', khazad_dumrak, great_forge_hall).
street_condition(runehammer_tunnel, good).
street_traffic(runehammer_tunnel, medium).

landmark(eternal_forge, 'Eternal Forge', khazad_dumrak, great_forge_hall).
landmark_historical(eternal_forge).
landmark_established(eternal_forge, -3200).
landmark(kings_throne, 'Kings Throne', khazad_dumrak, great_forge_hall).
landmark_historical(kings_throne).
landmark_established(kings_throne, -3100).

%% Thornhaven -- Human Frontier Town
settlement(thornhaven, 'Thornhaven', borderlands, high_fantasy).
settlement_type(thornhaven, town).
settlement_founded(thornhaven, -800).

district(castle_ward, 'Castle Ward', thornhaven).
district_wealth(castle_ward, 65).
district_crime(castle_ward, 10).
district_established(castle_ward, -800).
district(commons, 'The Commons', thornhaven).
district_wealth(commons, 40).
district_crime(commons, 20).
district_established(commons, -700).

street(kings_road, 'Kings Road', thornhaven, castle_ward).
street_condition(kings_road, good).
street_traffic(kings_road, high).
street(barley_lane, 'Barley Lane', thornhaven, commons).
street_condition(barley_lane, fair).
street_traffic(barley_lane, medium).
street(south_gate_way, 'South Gate Way', thornhaven, castle_ward).
street_condition(south_gate_way, fair).
street_traffic(south_gate_way, medium).
