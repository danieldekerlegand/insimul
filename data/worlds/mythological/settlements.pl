%% Insimul Settlements: Greek Mythological World
%% Source: data/worlds/mythological/settlements.pl
%% Created: 2026-04-03
%% Total: 3 settlements

%% Theopolis — City of the Gods
settlement(theopolis, 'Theopolis', aegean_coast, hellenic_realm).
settlement_type(theopolis, city).
settlement_founded(theopolis, -1200).

district(agora_district, 'Agora District', theopolis).
district_wealth(agora_district, 65).
district_crime(agora_district, 15).
district_established(agora_district, -1200).
district(temple_quarter, 'Temple Quarter', theopolis).
district_wealth(temple_quarter, 90).
district_crime(temple_quarter, 5).
district_established(temple_quarter, -1180).
district(harbor_ward, 'Harbor Ward', theopolis).
district_wealth(harbor_ward, 55).
district_crime(harbor_ward, 25).
district_established(harbor_ward, -1150).
district(olympian_heights, 'Olympian Heights', theopolis).
district_wealth(olympian_heights, 100).
district_crime(olympian_heights, 0).
district_established(olympian_heights, -1200).

street(hodos_apollonos, 'Hodos Apollonos', theopolis, temple_quarter).
street_condition(hodos_apollonos, good).
street_traffic(hodos_apollonos, high).
street(hodos_athenas, 'Hodos Athenas', theopolis, temple_quarter).
street_condition(hodos_athenas, good).
street_traffic(hodos_athenas, medium).
street(hodos_agoraios, 'Hodos Agoraios', theopolis, agora_district).
street_condition(hodos_agoraios, good).
street_traffic(hodos_agoraios, high).
street(hodos_emporiou, 'Hodos Emporiou', theopolis, agora_district).
street_condition(hodos_emporiou, fair).
street_traffic(hodos_emporiou, high).
street(hodos_limenos, 'Hodos Limenos', theopolis, harbor_ward).
street_condition(hodos_limenos, fair).
street_traffic(hodos_limenos, medium).
street(hodos_olympou, 'Hodos Olympou', theopolis, olympian_heights).
street_condition(hodos_olympou, good).
street_traffic(hodos_olympou, low).

landmark(great_altar_of_zeus, 'Great Altar of Zeus', theopolis, temple_quarter).
landmark_historical(great_altar_of_zeus).
landmark_established(great_altar_of_zeus, -1180).
landmark(bronze_lion_fountain, 'Bronze Lion Fountain', theopolis, agora_district).
landmark_established(bronze_lion_fountain, -1100).
landmark(triton_lighthouse, 'Triton Lighthouse', theopolis, harbor_ward).
landmark_historical(triton_lighthouse).
landmark_established(triton_lighthouse, -1050).
landmark(golden_gates, 'Golden Gates of Olympus', theopolis, olympian_heights).
landmark_historical(golden_gates).
landmark_established(golden_gates, -1200).

%% Delphinion — Oracle Village
settlement(delphinion, 'Delphinion', sacred_valley, hellenic_realm).
settlement_type(delphinion, village).
settlement_founded(delphinion, -1400).

district(oracle_precinct, 'Oracle Precinct', delphinion).
district_wealth(oracle_precinct, 80).
district_crime(oracle_precinct, 3).
district_established(oracle_precinct, -1400).
district(pilgrims_rest, 'Pilgrims Rest', delphinion).
district_wealth(pilgrims_rest, 45).
district_crime(pilgrims_rest, 10).
district_established(pilgrims_rest, -1300).

street(hodos_pythias, 'Hodos Pythias', delphinion, oracle_precinct).
street_condition(hodos_pythias, good).
street_traffic(hodos_pythias, medium).
street(hodos_manteon, 'Hodos Manteon', delphinion, oracle_precinct).
street_condition(hodos_manteon, good).
street_traffic(hodos_manteon, low).
street(hodos_xenion, 'Hodos Xenion', delphinion, pilgrims_rest).
street_condition(hodos_xenion, fair).
street_traffic(hodos_xenion, medium).

landmark(oracle_cave_entrance, 'Oracle Cave Entrance', delphinion, oracle_precinct).
landmark_historical(oracle_cave_entrance).
landmark_established(oracle_cave_entrance, -1400).

%% Heraclea — Frontier Outpost
settlement(heraclea, 'Heraclea', wilderness_frontier, hellenic_realm).
settlement_type(heraclea, town).
settlement_founded(heraclea, -1050).

district(warriors_quarter, 'Warriors Quarter', heraclea).
district_wealth(warriors_quarter, 50).
district_crime(warriors_quarter, 20).
district_established(warriors_quarter, -1050).
district(grove_edge, 'Grove Edge', heraclea).
district_wealth(grove_edge, 35).
district_crime(grove_edge, 8).
district_established(grove_edge, -1000).

street(hodos_herakleous, 'Hodos Herakleous', heraclea, warriors_quarter).
street_condition(hodos_herakleous, fair).
street_traffic(hodos_herakleous, medium).
street(hodos_dryados, 'Hodos Dryados', heraclea, grove_edge).
street_condition(hodos_dryados, fair).
street_traffic(hodos_dryados, low).

landmark(heracles_statue, 'Statue of Heracles', heraclea, warriors_quarter).
landmark_historical(heracles_statue).
landmark_established(heracles_statue, -1050).
