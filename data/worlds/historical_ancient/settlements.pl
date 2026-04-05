%% Insimul Settlements: Historical Ancient World
%% Source: data/worlds/historical_ancient/settlements.pl
%% Created: 2026-04-03
%% Total: 3 settlements

%% ===============================================================
%% Athenai — City-State of Athens
%% ===============================================================

settlement(athenai, 'Athenai', attica_region, hellenic_league).
settlement_type(athenai, city_state).
settlement_founded(athenai, -508).

district(agora_district, 'Agora District', athenai).
district_wealth(agora_district, 70).
district_crime(agora_district, 15).
district_established(agora_district, -500).
district(akropolis_district, 'Akropolis District', athenai).
district_wealth(akropolis_district, 90).
district_crime(akropolis_district, 5).
district_established(akropolis_district, -500).
district(kerameikos_district, 'Kerameikos District', athenai).
district_wealth(kerameikos_district, 45).
district_crime(kerameikos_district, 25).
district_established(kerameikos_district, -500).
district(piraeus_district, 'Piraeus District', athenai).
district_wealth(piraeus_district, 60).
district_crime(piraeus_district, 30).
district_established(piraeus_district, -493).

street(via_panathenaia, 'Via Panathenaia', athenai, agora_district).
street_condition(via_panathenaia, good).
street_traffic(via_panathenaia, high).
street(via_hermai, 'Via Hermai', athenai, agora_district).
street_condition(via_hermai, good).
street_traffic(via_hermai, high).
street(via_akropolis, 'Via Akropolis', athenai, akropolis_district).
street_condition(via_akropolis, good).
street_traffic(via_akropolis, medium).
street(via_sacra_ath, 'Via Sacra', athenai, akropolis_district).
street_condition(via_sacra_ath, good).
street_traffic(via_sacra_ath, medium).
street(via_kerameon, 'Via Kerameon', athenai, kerameikos_district).
street_condition(via_kerameon, fair).
street_traffic(via_kerameon, medium).
street(via_portus, 'Via Portus', athenai, piraeus_district).
street_condition(via_portus, fair).
street_traffic(via_portus, high).

landmark(parthenon, 'Parthenon', athenai, akropolis_district).
landmark_historical(parthenon).
landmark_established(parthenon, -438).
landmark(stoa_of_attalos, 'Stoa of Attalos', athenai, agora_district).
landmark_historical(stoa_of_attalos).
landmark_established(stoa_of_attalos, -150).
landmark(dipylon_gate, 'Dipylon Gate', athenai, kerameikos_district).
landmark_historical(dipylon_gate).
landmark_established(dipylon_gate, -478).

%% ===============================================================
%% Roma — The Eternal City
%% ===============================================================

settlement(roma, 'Roma', latium_region, roman_republic).
settlement_type(roma, city_state).
settlement_founded(roma, -753).

district(forum_district, 'Forum District', roma).
district_wealth(forum_district, 80).
district_crime(forum_district, 10).
district_established(forum_district, -500).
district(palatine_district, 'Palatine District', roma).
district_wealth(palatine_district, 95).
district_crime(palatine_district, 5).
district_established(palatine_district, -753).
district(subura_district, 'Subura District', roma).
district_wealth(subura_district, 30).
district_crime(subura_district, 40).
district_established(subura_district, -500).
district(aventine_district, 'Aventine District', roma).
district_wealth(aventine_district, 50).
district_crime(aventine_district, 20).
district_established(aventine_district, -500).

street(via_sacra, 'Via Sacra', roma, forum_district).
street_condition(via_sacra, good).
street_traffic(via_sacra, high).
street(via_nova, 'Via Nova', roma, forum_district).
street_condition(via_nova, good).
street_traffic(via_nova, high).
street(via_palatina, 'Via Palatina', roma, palatine_district).
street_condition(via_palatina, good).
street_traffic(via_palatina, medium).
street(via_subura, 'Via Subura', roma, subura_district).
street_condition(via_subura, fair).
street_traffic(via_subura, high).
street(via_aventina, 'Via Aventina', roma, aventine_district).
street_condition(via_aventina, fair).
street_traffic(via_aventina, medium).

landmark(temple_of_jupiter, 'Temple of Jupiter Optimus Maximus', roma, palatine_district).
landmark_historical(temple_of_jupiter).
landmark_established(temple_of_jupiter, -509).
landmark(cloaca_maxima, 'Cloaca Maxima', roma, forum_district).
landmark_historical(cloaca_maxima).
landmark_established(cloaca_maxima, -600).
landmark(circus_maximus, 'Circus Maximus', roma, aventine_district).
landmark_historical(circus_maximus).
landmark_established(circus_maximus, -329).

%% ===============================================================
%% Thebes Aegyptus — Temple Complex
%% ===============================================================

settlement(thebes_aegyptus, 'Thebes Aegyptus', upper_egypt_region, ptolemaic_kingdom).
settlement_type(thebes_aegyptus, temple_complex).
settlement_founded(thebes_aegyptus, -2000).

district(karnak_precinct, 'Karnak Precinct', thebes_aegyptus).
district_wealth(karnak_precinct, 85).
district_crime(karnak_precinct, 5).
district_established(karnak_precinct, -2000).
district(west_bank_district, 'West Bank District', thebes_aegyptus).
district_wealth(west_bank_district, 40).
district_crime(west_bank_district, 10).
district_established(west_bank_district, -1500).

street(avenue_of_sphinxes, 'Avenue of Sphinxes', thebes_aegyptus, karnak_precinct).
street_condition(avenue_of_sphinxes, good).
street_traffic(avenue_of_sphinxes, medium).
street(processional_way, 'Processional Way', thebes_aegyptus, karnak_precinct).
street_condition(processional_way, good).
street_traffic(processional_way, low).
street(artisan_lane, 'Artisan Lane', thebes_aegyptus, west_bank_district).
street_condition(artisan_lane, fair).
street_traffic(artisan_lane, medium).

landmark(great_hypostyle_hall, 'Great Hypostyle Hall', thebes_aegyptus, karnak_precinct).
landmark_historical(great_hypostyle_hall).
landmark_established(great_hypostyle_hall, -1290).
landmark(colossi_of_memnon, 'Colossi of Memnon', thebes_aegyptus, west_bank_district).
landmark_historical(colossi_of_memnon).
landmark_established(colossi_of_memnon, -1350).
