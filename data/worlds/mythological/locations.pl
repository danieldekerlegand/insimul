%% Insimul Locations (Lots): Greek Mythological World
%% Source: data/worlds/mythological/locations.pl
%% Created: 2026-04-03
%% Total: 28 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% ═══════════════════════════════════════════════════════════
%% Theopolis — Temple Quarter
%% ═══════════════════════════════════════════════════════════

%% 1 Hodos Apollonos — Temple of Apollo
lot(lot_myth_1, '1 Hodos Apollonos', theopolis).
lot_type(lot_myth_1, buildable).
lot_district(lot_myth_1, temple_quarter).
lot_street(lot_myth_1, hodos_apollonos).
lot_side(lot_myth_1, left).
lot_house_number(lot_myth_1, 1).
building(lot_myth_1, sacred, temple).
business(lot_myth_1, 'Temple of Apollo', temple).
business_founded(lot_myth_1, -1180).

%% 5 Hodos Apollonos — Temple of Athena
lot(lot_myth_2, '5 Hodos Apollonos', theopolis).
lot_type(lot_myth_2, buildable).
lot_district(lot_myth_2, temple_quarter).
lot_street(lot_myth_2, hodos_apollonos).
lot_side(lot_myth_2, right).
lot_house_number(lot_myth_2, 5).
building(lot_myth_2, sacred, temple).
business(lot_myth_2, 'Temple of Athena', temple).
business_founded(lot_myth_2, -1175).

%% 10 Hodos Apollonos — Temple of Hephaestus
lot(lot_myth_3, '10 Hodos Apollonos', theopolis).
lot_type(lot_myth_3, buildable).
lot_district(lot_myth_3, temple_quarter).
lot_street(lot_myth_3, hodos_apollonos).
lot_side(lot_myth_3, left).
lot_house_number(lot_myth_3, 10).
building(lot_myth_3, sacred, temple).
business(lot_myth_3, 'Temple of Hephaestus', temple).
business_founded(lot_myth_3, -1160).

%% 3 Hodos Athenas — Sacred Grove of Artemis
lot(lot_myth_4, '3 Hodos Athenas', theopolis).
lot_type(lot_myth_4, buildable).
lot_district(lot_myth_4, temple_quarter).
lot_street(lot_myth_4, hodos_athenas).
lot_side(lot_myth_4, left).
lot_house_number(lot_myth_4, 3).
building(lot_myth_4, sacred, grove).
business(lot_myth_4, 'Sacred Grove of Artemis', grove).
business_founded(lot_myth_4, -1190).

%% 8 Hodos Athenas — Priestess Quarters
lot(lot_myth_5, '8 Hodos Athenas', theopolis).
lot_type(lot_myth_5, buildable).
lot_district(lot_myth_5, temple_quarter).
lot_street(lot_myth_5, hodos_athenas).
lot_side(lot_myth_5, right).
lot_house_number(lot_myth_5, 8).
building(lot_myth_5, residence, house).

%% 15 Hodos Athenas — Altar of Dionysus
lot(lot_myth_6, '15 Hodos Athenas', theopolis).
lot_type(lot_myth_6, buildable).
lot_district(lot_myth_6, temple_quarter).
lot_street(lot_myth_6, hodos_athenas).
lot_side(lot_myth_6, left).
lot_house_number(lot_myth_6, 15).
building(lot_myth_6, sacred, altar).
business(lot_myth_6, 'Altar of Dionysus', altar).
business_founded(lot_myth_6, -1140).

%% ═══════════════════════════════════════════════════════════
%% Theopolis — Agora District
%% ═══════════════════════════════════════════════════════════

%% 2 Hodos Agoraios — Bronze Smithy
lot(lot_myth_7, '2 Hodos Agoraios', theopolis).
lot_type(lot_myth_7, buildable).
lot_district(lot_myth_7, agora_district).
lot_street(lot_myth_7, hodos_agoraios).
lot_side(lot_myth_7, left).
lot_house_number(lot_myth_7, 2).
building(lot_myth_7, business, smithy).
business(lot_myth_7, 'Forge of Korydos', smithy).
business_founded(lot_myth_7, -1100).

%% 7 Hodos Agoraios — Amphora Market
lot(lot_myth_8, '7 Hodos Agoraios', theopolis).
lot_type(lot_myth_8, buildable).
lot_district(lot_myth_8, agora_district).
lot_street(lot_myth_8, hodos_agoraios).
lot_side(lot_myth_8, right).
lot_house_number(lot_myth_8, 7).
building(lot_myth_8, business, market).
business(lot_myth_8, 'Amphora Market', market).
business_founded(lot_myth_8, -1080).

%% 12 Hodos Agoraios — Tavern
lot(lot_myth_9, '12 Hodos Agoraios', theopolis).
lot_type(lot_myth_9, buildable).
lot_district(lot_myth_9, agora_district).
lot_street(lot_myth_9, hodos_agoraios).
lot_side(lot_myth_9, left).
lot_house_number(lot_myth_9, 12).
building(lot_myth_9, business, tavern).
business(lot_myth_9, 'Tavern of the Centaur', tavern).
business_founded(lot_myth_9, -1050).

%% 18 Hodos Agoraios — Residence
lot(lot_myth_10, '18 Hodos Agoraios', theopolis).
lot_type(lot_myth_10, buildable).
lot_district(lot_myth_10, agora_district).
lot_street(lot_myth_10, hodos_agoraios).
lot_side(lot_myth_10, right).
lot_house_number(lot_myth_10, 18).
building(lot_myth_10, residence, house).

%% 4 Hodos Emporiou — Pottery Workshop
lot(lot_myth_11, '4 Hodos Emporiou', theopolis).
lot_type(lot_myth_11, buildable).
lot_district(lot_myth_11, agora_district).
lot_street(lot_myth_11, hodos_emporiou).
lot_side(lot_myth_11, left).
lot_house_number(lot_myth_11, 4).
building(lot_myth_11, business, workshop).
business(lot_myth_11, 'Keramikos Workshop', workshop).
business_founded(lot_myth_11, -1090).

%% 10 Hodos Emporiou — Herbalist
lot(lot_myth_12, '10 Hodos Emporiou', theopolis).
lot_type(lot_myth_12, buildable).
lot_district(lot_myth_12, agora_district).
lot_street(lot_myth_12, hodos_emporiou).
lot_side(lot_myth_12, right).
lot_house_number(lot_myth_12, 10).
building(lot_myth_12, business, apothecary).
business(lot_myth_12, 'Pharmakon of Hygieia', apothecary).
business_founded(lot_myth_12, -1060).

%% 16 Hodos Emporiou — Residence
lot(lot_myth_13, '16 Hodos Emporiou', theopolis).
lot_type(lot_myth_13, buildable).
lot_district(lot_myth_13, agora_district).
lot_street(lot_myth_13, hodos_emporiou).
lot_side(lot_myth_13, left).
lot_house_number(lot_myth_13, 16).
building(lot_myth_13, residence, house).

%% ═══════════════════════════════════════════════════════════
%% Theopolis — Harbor Ward
%% ═══════════════════════════════════════════════════════════

%% 3 Hodos Limenos — Shipwright
lot(lot_myth_14, '3 Hodos Limenos', theopolis).
lot_type(lot_myth_14, buildable).
lot_district(lot_myth_14, harbor_ward).
lot_street(lot_myth_14, hodos_limenos).
lot_side(lot_myth_14, left).
lot_house_number(lot_myth_14, 3).
building(lot_myth_14, business, shipyard).
business(lot_myth_14, 'Argonaut Shipwright', shipyard).
business_founded(lot_myth_14, -1070).

%% 8 Hodos Limenos — Fish Market
lot(lot_myth_15, '8 Hodos Limenos', theopolis).
lot_type(lot_myth_15, buildable).
lot_district(lot_myth_15, harbor_ward).
lot_street(lot_myth_15, hodos_limenos).
lot_side(lot_myth_15, right).
lot_house_number(lot_myth_15, 8).
building(lot_myth_15, business, market).
business(lot_myth_15, 'Poseidon Fish Market', market).
business_founded(lot_myth_15, -1040).

%% 14 Hodos Limenos — Residence
lot(lot_myth_16, '14 Hodos Limenos', theopolis).
lot_type(lot_myth_16, buildable).
lot_district(lot_myth_16, harbor_ward).
lot_street(lot_myth_16, hodos_limenos).
lot_side(lot_myth_16, left).
lot_house_number(lot_myth_16, 14).
building(lot_myth_16, residence, house).

%% ═══════════════════════════════════════════════════════════
%% Theopolis — Olympian Heights
%% ═══════════════════════════════════════════════════════════

%% 1 Hodos Olympou — Shrine of Zeus
lot(lot_myth_17, '1 Hodos Olympou', theopolis).
lot_type(lot_myth_17, buildable).
lot_district(lot_myth_17, olympian_heights).
lot_street(lot_myth_17, hodos_olympou).
lot_side(lot_myth_17, left).
lot_house_number(lot_myth_17, 1).
building(lot_myth_17, sacred, shrine).
business(lot_myth_17, 'Shrine of Zeus', shrine).
business_founded(lot_myth_17, -1200).

%% 5 Hodos Olympou — Olympian Observatory
lot(lot_myth_18, '5 Hodos Olympou', theopolis).
lot_type(lot_myth_18, buildable).
lot_district(lot_myth_18, olympian_heights).
lot_street(lot_myth_18, hodos_olympou).
lot_side(lot_myth_18, right).
lot_house_number(lot_myth_18, 5).
building(lot_myth_18, civic, observatory).
business(lot_myth_18, 'Olympian Observatory', observatory).
business_founded(lot_myth_18, -1150).

%% ═══════════════════════════════════════════════════════════
%% Delphinion — Oracle Precinct
%% ═══════════════════════════════════════════════════════════

%% 1 Hodos Pythias — Oracle Cave
lot(lot_myth_19, '1 Hodos Pythias', delphinion).
lot_type(lot_myth_19, buildable).
lot_district(lot_myth_19, oracle_precinct).
lot_street(lot_myth_19, hodos_pythias).
lot_side(lot_myth_19, left).
lot_house_number(lot_myth_19, 1).
building(lot_myth_19, sacred, oracle_cave).
business(lot_myth_19, 'Oracle Cave of Pythia', oracle_cave).
business_founded(lot_myth_19, -1400).

%% 5 Hodos Pythias — Temple of Gaia
lot(lot_myth_20, '5 Hodos Pythias', delphinion).
lot_type(lot_myth_20, buildable).
lot_district(lot_myth_20, oracle_precinct).
lot_street(lot_myth_20, hodos_pythias).
lot_side(lot_myth_20, right).
lot_house_number(lot_myth_20, 5).
building(lot_myth_20, sacred, temple).
business(lot_myth_20, 'Temple of Gaia', temple).
business_founded(lot_myth_20, -1380).

%% 3 Hodos Manteon — Prophecy Archives
lot(lot_myth_21, '3 Hodos Manteon', delphinion).
lot_type(lot_myth_21, buildable).
lot_district(lot_myth_21, oracle_precinct).
lot_street(lot_myth_21, hodos_manteon).
lot_side(lot_myth_21, left).
lot_house_number(lot_myth_21, 3).
building(lot_myth_21, civic, library).
business(lot_myth_21, 'Prophecy Archives', library).
business_founded(lot_myth_21, -1350).

%% 7 Hodos Manteon — Sacred Spring
lot(lot_myth_22, '7 Hodos Manteon', delphinion).
lot_type(lot_myth_22, buildable).
lot_district(lot_myth_22, oracle_precinct).
lot_street(lot_myth_22, hodos_manteon).
lot_side(lot_myth_22, right).
lot_house_number(lot_myth_22, 7).
building(lot_myth_22, sacred, spring).
business(lot_myth_22, 'Castalian Spring', spring).
business_founded(lot_myth_22, -1400).

%% 2 Hodos Xenion — Pilgrim Lodge
lot(lot_myth_23, '2 Hodos Xenion', delphinion).
lot_type(lot_myth_23, buildable).
lot_district(lot_myth_23, pilgrims_rest).
lot_street(lot_myth_23, hodos_xenion).
lot_side(lot_myth_23, left).
lot_house_number(lot_myth_23, 2).
building(lot_myth_23, business, inn).
business(lot_myth_23, 'Pilgrim Lodge of Hermes', inn).
business_founded(lot_myth_23, -1300).

%% 8 Hodos Xenion — Offering Market
lot(lot_myth_24, '8 Hodos Xenion', delphinion).
lot_type(lot_myth_24, buildable).
lot_district(lot_myth_24, pilgrims_rest).
lot_street(lot_myth_24, hodos_xenion).
lot_side(lot_myth_24, right).
lot_house_number(lot_myth_24, 8).
building(lot_myth_24, business, market).
business(lot_myth_24, 'Offering Market', market).
business_founded(lot_myth_24, -1280).

%% ═══════════════════════════════════════════════════════════
%% Heraclea — Warriors Quarter
%% ═══════════════════════════════════════════════════════════

%% 1 Hodos Herakleous — Arena of Trials
lot(lot_myth_25, '1 Hodos Herakleous', heraclea).
lot_type(lot_myth_25, buildable).
lot_district(lot_myth_25, warriors_quarter).
lot_street(lot_myth_25, hodos_herakleous).
lot_side(lot_myth_25, left).
lot_house_number(lot_myth_25, 1).
building(lot_myth_25, civic, arena).
business(lot_myth_25, 'Arena of Trials', arena).
business_founded(lot_myth_25, -1050).

%% 6 Hodos Herakleous — Weapon Smith
lot(lot_myth_26, '6 Hodos Herakleous', heraclea).
lot_type(lot_myth_26, buildable).
lot_district(lot_myth_26, warriors_quarter).
lot_street(lot_myth_26, hodos_herakleous).
lot_side(lot_myth_26, right).
lot_house_number(lot_myth_26, 6).
building(lot_myth_26, business, smithy).
business(lot_myth_26, 'Forge of Ares', smithy).
business_founded(lot_myth_26, -1040).

%% 3 Hodos Dryados — Sacred Grove of Pan
lot(lot_myth_27, '3 Hodos Dryados', heraclea).
lot_type(lot_myth_27, buildable).
lot_district(lot_myth_27, grove_edge).
lot_street(lot_myth_27, hodos_dryados).
lot_side(lot_myth_27, left).
lot_house_number(lot_myth_27, 3).
building(lot_myth_27, sacred, grove).
business(lot_myth_27, 'Sacred Grove of Pan', grove).
business_founded(lot_myth_27, -1000).

%% 8 Hodos Dryados — Labyrinth Entrance
lot(lot_myth_28, '8 Hodos Dryados', heraclea).
lot_type(lot_myth_28, buildable).
lot_district(lot_myth_28, grove_edge).
lot_street(lot_myth_28, hodos_dryados).
lot_side(lot_myth_28, right).
lot_house_number(lot_myth_28, 8).
building(lot_myth_28, sacred, labyrinth).
business(lot_myth_28, 'Labyrinth of the Minotaur', labyrinth).
business_founded(lot_myth_28, -1100).
