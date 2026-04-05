%% Insimul Locations (Lots): Historical Ancient World
%% Source: data/worlds/historical_ancient/locations.pl
%% Created: 2026-04-03
%% Total: 30 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% ===============================================================
%% Athenai — Agora District
%% ===============================================================

%% 1 Via Panathenaia — Stoa Poikile (Painted Stoa)
lot(lot_anc_1, '1 Via Panathenaia', athenai).
lot_type(lot_anc_1, buildable).
lot_district(lot_anc_1, agora_district).
lot_street(lot_anc_1, via_panathenaia).
lot_side(lot_anc_1, left).
lot_house_number(lot_anc_1, 1).
building(lot_anc_1, civic, stoa).
business(lot_anc_1, 'Stoa Poikile', stoa).
business_founded(lot_anc_1, -460).

%% 5 Via Panathenaia — Agora Marketplace
lot(lot_anc_2, '5 Via Panathenaia', athenai).
lot_type(lot_anc_2, buildable).
lot_district(lot_anc_2, agora_district).
lot_street(lot_anc_2, via_panathenaia).
lot_side(lot_anc_2, right).
lot_house_number(lot_anc_2, 5).
building(lot_anc_2, business, market).
business(lot_anc_2, 'Agora Marketplace', market).
business_founded(lot_anc_2, -500).

%% 10 Via Panathenaia — Bouleuterion (Council Chamber)
lot(lot_anc_3, '10 Via Panathenaia', athenai).
lot_type(lot_anc_3, buildable).
lot_district(lot_anc_3, agora_district).
lot_street(lot_anc_3, via_panathenaia).
lot_side(lot_anc_3, left).
lot_house_number(lot_anc_3, 10).
building(lot_anc_3, civic, council_chamber).

%% 3 Via Hermai — Symposium Hall
lot(lot_anc_4, '3 Via Hermai', athenai).
lot_type(lot_anc_4, buildable).
lot_district(lot_anc_4, agora_district).
lot_street(lot_anc_4, via_hermai).
lot_side(lot_anc_4, left).
lot_house_number(lot_anc_4, 3).
building(lot_anc_4, business, tavern).
business(lot_anc_4, 'Symposium of Dionysos', tavern).
business_founded(lot_anc_4, -450).

%% 8 Via Hermai — Potter Workshop
lot(lot_anc_5, '8 Via Hermai', athenai).
lot_type(lot_anc_5, buildable).
lot_district(lot_anc_5, agora_district).
lot_street(lot_anc_5, via_hermai).
lot_side(lot_anc_5, right).
lot_house_number(lot_anc_5, 8).
building(lot_anc_5, business, workshop).
business(lot_anc_5, 'Kerameus Workshop', workshop).
business_founded(lot_anc_5, -480).

%% 15 Via Hermai — Residence
lot(lot_anc_6, '15 Via Hermai', athenai).
lot_type(lot_anc_6, buildable).
lot_district(lot_anc_6, agora_district).
lot_street(lot_anc_6, via_hermai).
lot_side(lot_anc_6, left).
lot_house_number(lot_anc_6, 15).
building(lot_anc_6, residence, house).

%% ===============================================================
%% Athenai — Akropolis District
%% ===============================================================

%% 1 Via Akropolis — Temple of Athena (Parthenon)
lot(lot_anc_7, '1 Via Akropolis', athenai).
lot_type(lot_anc_7, buildable).
lot_district(lot_anc_7, akropolis_district).
lot_street(lot_anc_7, via_akropolis).
lot_side(lot_anc_7, left).
lot_house_number(lot_anc_7, 1).
building(lot_anc_7, civic, temple).

%% 5 Via Akropolis — Odeon of Herodes
lot(lot_anc_8, '5 Via Akropolis', athenai).
lot_type(lot_anc_8, buildable).
lot_district(lot_anc_8, akropolis_district).
lot_street(lot_anc_8, via_akropolis).
lot_side(lot_anc_8, right).
lot_house_number(lot_anc_8, 5).
building(lot_anc_8, civic, theater).

%% 3 Via Sacra — Gymnasium of Akademos
lot(lot_anc_9, '3 Via Sacra', athenai).
lot_type(lot_anc_9, buildable).
lot_district(lot_anc_9, akropolis_district).
lot_street(lot_anc_9, via_sacra_ath).
lot_side(lot_anc_9, left).
lot_house_number(lot_anc_9, 3).
building(lot_anc_9, civic, gymnasium).
business(lot_anc_9, 'Gymnasium of Akademos', gymnasium).
business_founded(lot_anc_9, -387).

%% 8 Via Sacra — Physician House
lot(lot_anc_10, '8 Via Sacra', athenai).
lot_type(lot_anc_10, buildable).
lot_district(lot_anc_10, akropolis_district).
lot_street(lot_anc_10, via_sacra_ath).
lot_side(lot_anc_10, right).
lot_house_number(lot_anc_10, 8).
building(lot_anc_10, business, physician).
business(lot_anc_10, 'Iatreion of Hippokrates', physician).
business_founded(lot_anc_10, -420).

%% ===============================================================
%% Athenai — Kerameikos District
%% ===============================================================

%% 2 Via Kerameon — Pottery Market
lot(lot_anc_11, '2 Via Kerameon', athenai).
lot_type(lot_anc_11, buildable).
lot_district(lot_anc_11, kerameikos_district).
lot_street(lot_anc_11, via_kerameon).
lot_side(lot_anc_11, left).
lot_house_number(lot_anc_11, 2).
building(lot_anc_11, business, market).
business(lot_anc_11, 'Kerameikos Pottery Market', market).
business_founded(lot_anc_11, -500).

%% 7 Via Kerameon — Residence
lot(lot_anc_12, '7 Via Kerameon', athenai).
lot_type(lot_anc_12, buildable).
lot_district(lot_anc_12, kerameikos_district).
lot_street(lot_anc_12, via_kerameon).
lot_side(lot_anc_12, right).
lot_house_number(lot_anc_12, 7).
building(lot_anc_12, residence, house).

%% ===============================================================
%% Athenai — Piraeus District
%% ===============================================================

%% 3 Via Portus — Harbor Warehouse
lot(lot_anc_13, '3 Via Portus', athenai).
lot_type(lot_anc_13, buildable).
lot_district(lot_anc_13, piraeus_district).
lot_street(lot_anc_13, via_portus).
lot_side(lot_anc_13, left).
lot_house_number(lot_anc_13, 3).
building(lot_anc_13, business, warehouse).
business(lot_anc_13, 'Emporion Warehouse', warehouse).
business_founded(lot_anc_13, -490).

%% 10 Via Portus — Fish Market
lot(lot_anc_14, '10 Via Portus', athenai).
lot_type(lot_anc_14, buildable).
lot_district(lot_anc_14, piraeus_district).
lot_street(lot_anc_14, via_portus).
lot_side(lot_anc_14, right).
lot_house_number(lot_anc_14, 10).
building(lot_anc_14, business, market).
business(lot_anc_14, 'Piraeus Fish Market', market).
business_founded(lot_anc_14, -480).

%% ===============================================================
%% Roma — Forum District
%% ===============================================================

%% 1 Via Sacra — Temple of Saturn
lot(lot_anc_15, '1 Via Sacra', roma).
lot_type(lot_anc_15, buildable).
lot_district(lot_anc_15, forum_district).
lot_street(lot_anc_15, via_sacra).
lot_side(lot_anc_15, left).
lot_house_number(lot_anc_15, 1).
building(lot_anc_15, civic, temple).

%% 5 Via Sacra — Basilica Aemilia
lot(lot_anc_16, '5 Via Sacra', roma).
lot_type(lot_anc_16, buildable).
lot_district(lot_anc_16, forum_district).
lot_street(lot_anc_16, via_sacra).
lot_side(lot_anc_16, right).
lot_house_number(lot_anc_16, 5).
building(lot_anc_16, civic, basilica).

%% 10 Via Sacra — Rostra (Speakers Platform)
lot(lot_anc_17, '10 Via Sacra', roma).
lot_type(lot_anc_17, buildable).
lot_district(lot_anc_17, forum_district).
lot_street(lot_anc_17, via_sacra).
lot_side(lot_anc_17, left).
lot_house_number(lot_anc_17, 10).
building(lot_anc_17, civic, rostra).

%% 3 Via Nova — Thermopolium (Fast Food Counter)
lot(lot_anc_18, '3 Via Nova', roma).
lot_type(lot_anc_18, buildable).
lot_district(lot_anc_18, forum_district).
lot_street(lot_anc_18, via_nova).
lot_side(lot_anc_18, left).
lot_house_number(lot_anc_18, 3).
building(lot_anc_18, business, thermopolium).
business(lot_anc_18, 'Thermopolium of Vetutius', thermopolium).
business_founded(lot_anc_18, -200).

%% 8 Via Nova — Taberna (Shop)
lot(lot_anc_19, '8 Via Nova', roma).
lot_type(lot_anc_19, buildable).
lot_district(lot_anc_19, forum_district).
lot_street(lot_anc_19, via_nova).
lot_side(lot_anc_19, right).
lot_house_number(lot_anc_19, 8).
building(lot_anc_19, business, shop).
business(lot_anc_19, 'Taberna Aurelia', shop).
business_founded(lot_anc_19, -250).

%% ===============================================================
%% Roma — Palatine District
%% ===============================================================

%% 1 Via Palatina — Domus of Lucius
lot(lot_anc_20, '1 Via Palatina', roma).
lot_type(lot_anc_20, buildable).
lot_district(lot_anc_20, palatine_district).
lot_street(lot_anc_20, via_palatina).
lot_side(lot_anc_20, left).
lot_house_number(lot_anc_20, 1).
building(lot_anc_20, residence, domus).

%% 5 Via Palatina — Thermae (Public Baths)
lot(lot_anc_21, '5 Via Palatina', roma).
lot_type(lot_anc_21, buildable).
lot_district(lot_anc_21, palatine_district).
lot_street(lot_anc_21, via_palatina).
lot_side(lot_anc_21, right).
lot_house_number(lot_anc_21, 5).
building(lot_anc_21, civic, bathhouse).
business(lot_anc_21, 'Thermae Palatinae', bathhouse).
business_founded(lot_anc_21, -300).

%% ===============================================================
%% Roma — Subura District
%% ===============================================================

%% 2 Via Subura — Popina (Tavern)
lot(lot_anc_22, '2 Via Subura', roma).
lot_type(lot_anc_22, buildable).
lot_district(lot_anc_22, subura_district).
lot_street(lot_anc_22, via_subura).
lot_side(lot_anc_22, left).
lot_house_number(lot_anc_22, 2).
building(lot_anc_22, business, tavern).
business(lot_anc_22, 'Popina Lupus', tavern).
business_founded(lot_anc_22, -300).

%% 7 Via Subura — Insula (Apartment Block)
lot(lot_anc_23, '7 Via Subura', roma).
lot_type(lot_anc_23, buildable).
lot_district(lot_anc_23, subura_district).
lot_street(lot_anc_23, via_subura).
lot_side(lot_anc_23, right).
lot_house_number(lot_anc_23, 7).
building(lot_anc_23, residence, insula).

%% 12 Via Subura — Ludus (Gladiator School)
lot(lot_anc_24, '12 Via Subura', roma).
lot_type(lot_anc_24, buildable).
lot_district(lot_anc_24, subura_district).
lot_street(lot_anc_24, via_subura).
lot_side(lot_anc_24, left).
lot_house_number(lot_anc_24, 12).
building(lot_anc_24, business, ludus).
business(lot_anc_24, 'Ludus Magnus', ludus).
business_founded(lot_anc_24, -264).

%% ===============================================================
%% Roma — Aventine District
%% ===============================================================

%% 3 Via Aventina — Amphitheater
lot(lot_anc_25, '3 Via Aventina', roma).
lot_type(lot_anc_25, buildable).
lot_district(lot_anc_25, aventine_district).
lot_street(lot_anc_25, via_aventina).
lot_side(lot_anc_25, left).
lot_house_number(lot_anc_25, 3).
building(lot_anc_25, civic, amphitheater).

%% 8 Via Aventina — Temple of Ceres
lot(lot_anc_26, '8 Via Aventina', roma).
lot_type(lot_anc_26, buildable).
lot_district(lot_anc_26, aventine_district).
lot_street(lot_anc_26, via_aventina).
lot_side(lot_anc_26, right).
lot_house_number(lot_anc_26, 8).
building(lot_anc_26, civic, temple).

%% ===============================================================
%% Thebes Aegyptus — Karnak Precinct
%% ===============================================================

%% 1 Avenue of Sphinxes — Great Temple of Amun
lot(lot_anc_27, '1 Avenue of Sphinxes', thebes_aegyptus).
lot_type(lot_anc_27, buildable).
lot_district(lot_anc_27, karnak_precinct).
lot_street(lot_anc_27, avenue_of_sphinxes).
lot_side(lot_anc_27, left).
lot_house_number(lot_anc_27, 1).
building(lot_anc_27, civic, temple).

%% 5 Avenue of Sphinxes — Sacred Lake Shrine
lot(lot_anc_28, '5 Avenue of Sphinxes', thebes_aegyptus).
lot_type(lot_anc_28, buildable).
lot_district(lot_anc_28, karnak_precinct).
lot_street(lot_anc_28, avenue_of_sphinxes).
lot_side(lot_anc_28, right).
lot_house_number(lot_anc_28, 5).
building(lot_anc_28, civic, shrine).

%% ===============================================================
%% Thebes Aegyptus — West Bank District
%% ===============================================================

%% 2 Artisan Lane — Embalmer Workshop
lot(lot_anc_29, '2 Artisan Lane', thebes_aegyptus).
lot_type(lot_anc_29, buildable).
lot_district(lot_anc_29, west_bank_district).
lot_street(lot_anc_29, artisan_lane).
lot_side(lot_anc_29, left).
lot_house_number(lot_anc_29, 2).
building(lot_anc_29, business, workshop).
business(lot_anc_29, 'House of Purification', workshop).
business_founded(lot_anc_29, -1500).

%% 7 Artisan Lane — Scribe School
lot(lot_anc_30, '7 Artisan Lane', thebes_aegyptus).
lot_type(lot_anc_30, buildable).
lot_district(lot_anc_30, west_bank_district).
lot_street(lot_anc_30, artisan_lane).
lot_side(lot_anc_30, right).
lot_house_number(lot_anc_30, 7).
building(lot_anc_30, civic, school).
business(lot_anc_30, 'House of Life', school).
business_founded(lot_anc_30, -1400).
