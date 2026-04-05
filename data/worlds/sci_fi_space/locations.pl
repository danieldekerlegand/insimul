%% Insimul Locations (Lots): Sci-Fi Space
%% Source: data/worlds/sci_fi_space/locations.pl
%% Created: 2026-04-03
%% Total: 28 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% ═══════════════════════════════════════════════════════════
%% Nexus Prime Station -- Command Ring
%% ═══════════════════════════════════════════════════════════

%% C-A-01 -- Bridge
lot(lot_sp_1, 'C-A-01 Corridor Alpha', nexus_prime).
lot_type(lot_sp_1, buildable).
lot_district(lot_sp_1, command_ring).
lot_street(lot_sp_1, corridor_alpha).
lot_side(lot_sp_1, left).
lot_house_number(lot_sp_1, 1).
building(lot_sp_1, civic, bridge).

%% C-A-02 -- Operations Center
lot(lot_sp_2, 'C-A-02 Corridor Alpha', nexus_prime).
lot_type(lot_sp_2, buildable).
lot_district(lot_sp_2, command_ring).
lot_street(lot_sp_2, corridor_alpha).
lot_side(lot_sp_2, right).
lot_house_number(lot_sp_2, 2).
building(lot_sp_2, civic, operations_center).

%% C-A-03 -- Communications Array
lot(lot_sp_3, 'C-A-03 Corridor Alpha', nexus_prime).
lot_type(lot_sp_3, buildable).
lot_district(lot_sp_3, command_ring).
lot_street(lot_sp_3, corridor_alpha).
lot_side(lot_sp_3, left).
lot_house_number(lot_sp_3, 3).
building(lot_sp_3, civic, comms_array).

%% C-A-04 -- Diplomatic Suite
lot(lot_sp_4, 'C-A-04 Corridor Alpha', nexus_prime).
lot_type(lot_sp_4, buildable).
lot_district(lot_sp_4, command_ring).
lot_street(lot_sp_4, corridor_alpha).
lot_side(lot_sp_4, right).
lot_house_number(lot_sp_4, 4).
building(lot_sp_4, civic, diplomatic_suite).

%% ═══════════════════════════════════════════════════════════
%% Nexus Prime Station -- Trade Ring
%% ═══════════════════════════════════════════════════════════

%% T-B-01 -- Stellar Cantina
lot(lot_sp_5, 'T-B-01 Corridor Beta', nexus_prime).
lot_type(lot_sp_5, buildable).
lot_district(lot_sp_5, trade_ring).
lot_street(lot_sp_5, corridor_beta).
lot_side(lot_sp_5, left).
lot_house_number(lot_sp_5, 1).
building(lot_sp_5, business, cantina).
business(lot_sp_5, 'Stellar Cantina', cantina).
business_founded(lot_sp_5, 2852).

%% T-B-02 -- Arms Dealer
lot(lot_sp_6, 'T-B-02 Corridor Beta', nexus_prime).
lot_type(lot_sp_6, buildable).
lot_district(lot_sp_6, trade_ring).
lot_street(lot_sp_6, corridor_beta).
lot_side(lot_sp_6, right).
lot_house_number(lot_sp_6, 2).
building(lot_sp_6, business, shop).
business(lot_sp_6, 'Voss Armaments', shop).
business_founded(lot_sp_6, 2858).

%% T-B-03 -- Cargo Exchange
lot(lot_sp_7, 'T-B-03 Corridor Beta', nexus_prime).
lot_type(lot_sp_7, buildable).
lot_district(lot_sp_7, trade_ring).
lot_street(lot_sp_7, corridor_beta).
lot_side(lot_sp_7, left).
lot_house_number(lot_sp_7, 3).
building(lot_sp_7, business, warehouse).
business(lot_sp_7, 'Nexus Cargo Exchange', warehouse).
business_founded(lot_sp_7, 2850).

%% T-B-04 -- Data Broker
lot(lot_sp_8, 'T-B-04 Corridor Beta', nexus_prime).
lot_type(lot_sp_8, buildable).
lot_district(lot_sp_8, trade_ring).
lot_street(lot_sp_8, corridor_beta).
lot_side(lot_sp_8, right).
lot_house_number(lot_sp_8, 4).
building(lot_sp_8, business, shop).
business(lot_sp_8, 'Cipher Net Data Brokers', shop).
business_founded(lot_sp_8, 2865).

%% T-B-05 -- Xenobiology Imports
lot(lot_sp_9, 'T-B-05 Corridor Beta', nexus_prime).
lot_type(lot_sp_9, buildable).
lot_district(lot_sp_9, trade_ring).
lot_street(lot_sp_9, corridor_beta).
lot_side(lot_sp_9, left).
lot_house_number(lot_sp_9, 5).
building(lot_sp_9, business, shop).
business(lot_sp_9, 'Xeno Imports', shop).
business_founded(lot_sp_9, 2870).

%% ═══════════════════════════════════════════════════════════
%% Nexus Prime Station -- Habitation Ring
%% ═══════════════════════════════════════════════════════════

%% H-G-01 -- Medbay
lot(lot_sp_10, 'H-G-01 Corridor Gamma', nexus_prime).
lot_type(lot_sp_10, buildable).
lot_district(lot_sp_10, habitation_ring).
lot_street(lot_sp_10, corridor_gamma).
lot_side(lot_sp_10, left).
lot_house_number(lot_sp_10, 1).
building(lot_sp_10, civic, medbay).

%% H-G-02 -- Crew Quarters A
lot(lot_sp_11, 'H-G-02 Corridor Gamma', nexus_prime).
lot_type(lot_sp_11, buildable).
lot_district(lot_sp_11, habitation_ring).
lot_street(lot_sp_11, corridor_gamma).
lot_side(lot_sp_11, right).
lot_house_number(lot_sp_11, 2).
building(lot_sp_11, residence, quarters).

%% H-G-03 -- Crew Quarters B
lot(lot_sp_12, 'H-G-03 Corridor Gamma', nexus_prime).
lot_type(lot_sp_12, buildable).
lot_district(lot_sp_12, habitation_ring).
lot_street(lot_sp_12, corridor_gamma).
lot_side(lot_sp_12, left).
lot_house_number(lot_sp_12, 3).
building(lot_sp_12, residence, quarters).

%% H-G-04 -- Recreation Lounge
lot(lot_sp_13, 'H-G-04 Corridor Gamma', nexus_prime).
lot_type(lot_sp_13, buildable).
lot_district(lot_sp_13, habitation_ring).
lot_street(lot_sp_13, corridor_gamma).
lot_side(lot_sp_13, right).
lot_house_number(lot_sp_13, 4).
building(lot_sp_13, business, lounge).
business(lot_sp_13, 'Zero-G Lounge', lounge).
business_founded(lot_sp_13, 2853).

%% H-G-05 -- Hydroponics Bay
lot(lot_sp_14, 'H-G-05 Corridor Gamma', nexus_prime).
lot_type(lot_sp_14, buildable).
lot_district(lot_sp_14, habitation_ring).
lot_street(lot_sp_14, corridor_gamma).
lot_side(lot_sp_14, left).
lot_house_number(lot_sp_14, 5).
building(lot_sp_14, civic, hydroponics).

%% ═══════════════════════════════════════════════════════════
%% Nexus Prime Station -- Engineering Deck
%% ═══════════════════════════════════════════════════════════

%% E-D-01 -- Main Engineering
lot(lot_sp_15, 'E-D-01 Corridor Delta', nexus_prime).
lot_type(lot_sp_15, buildable).
lot_district(lot_sp_15, engineering_deck).
lot_street(lot_sp_15, corridor_delta).
lot_side(lot_sp_15, left).
lot_house_number(lot_sp_15, 1).
building(lot_sp_15, civic, engineering_bay).

%% E-D-02 -- Reactor Core Access
lot(lot_sp_16, 'E-D-02 Corridor Delta', nexus_prime).
lot_type(lot_sp_16, buildable).
lot_district(lot_sp_16, engineering_deck).
lot_street(lot_sp_16, corridor_delta).
lot_side(lot_sp_16, right).
lot_house_number(lot_sp_16, 2).
building(lot_sp_16, civic, reactor_core).

%% E-D-03 -- Docking Bay Alpha
lot(lot_sp_17, 'E-D-03 Corridor Delta', nexus_prime).
lot_type(lot_sp_17, buildable).
lot_district(lot_sp_17, engineering_deck).
lot_street(lot_sp_17, corridor_delta).
lot_side(lot_sp_17, left).
lot_house_number(lot_sp_17, 3).
building(lot_sp_17, civic, docking_bay).

%% E-D-04 -- Shuttle Maintenance
lot(lot_sp_18, 'E-D-04 Corridor Delta', nexus_prime).
lot_type(lot_sp_18, buildable).
lot_district(lot_sp_18, engineering_deck).
lot_street(lot_sp_18, corridor_delta).
lot_side(lot_sp_18, right).
lot_house_number(lot_sp_18, 4).
building(lot_sp_18, business, workshop).
business(lot_sp_18, 'Renn Shuttle Repairs', workshop).
business_founded(lot_sp_18, 2856).

%% ═══════════════════════════════════════════════════════════
%% Kepler Colony
%% ═══════════════════════════════════════════════════════════

%% K-1 -- Colony Administration
lot(lot_sp_19, 'K-1 Boulevard One', kepler_colony).
lot_type(lot_sp_19, buildable).
lot_district(lot_sp_19, dome_central).
lot_street(lot_sp_19, boulevard_one).
lot_side(lot_sp_19, left).
lot_house_number(lot_sp_19, 1).
building(lot_sp_19, civic, administration).

%% K-2 -- Colony Housing Block A
lot(lot_sp_20, 'K-2 Boulevard One', kepler_colony).
lot_type(lot_sp_20, buildable).
lot_district(lot_sp_20, dome_central).
lot_street(lot_sp_20, boulevard_one).
lot_side(lot_sp_20, right).
lot_house_number(lot_sp_20, 2).
building(lot_sp_20, residence, hab_block).

%% K-3 -- General Store
lot(lot_sp_21, 'K-3 Boulevard One', kepler_colony).
lot_type(lot_sp_21, buildable).
lot_district(lot_sp_21, dome_central).
lot_street(lot_sp_21, boulevard_one).
lot_side(lot_sp_21, left).
lot_house_number(lot_sp_21, 3).
building(lot_sp_21, business, shop).
business(lot_sp_21, 'Kepler General Supply', shop).
business_founded(lot_sp_21, 2892).

%% K-4 -- Greenhouse Alpha
lot(lot_sp_22, 'K-4 Farm Path', kepler_colony).
lot_type(lot_sp_22, buildable).
lot_district(lot_sp_22, agri_sector).
lot_street(lot_sp_22, farm_path).
lot_side(lot_sp_22, left).
lot_house_number(lot_sp_22, 4).
building(lot_sp_22, business, greenhouse).
business(lot_sp_22, 'Greenhouse Alpha', greenhouse).
business_founded(lot_sp_22, 2893).

%% K-5 -- Xenobotany Lab
lot(lot_sp_23, 'K-5 Lab Corridor', kepler_colony).
lot_type(lot_sp_23, buildable).
lot_district(lot_sp_23, research_quarter).
lot_street(lot_sp_23, lab_corridor).
lot_side(lot_sp_23, left).
lot_house_number(lot_sp_23, 5).
building(lot_sp_23, civic, laboratory).

%% K-6 -- Colony Clinic
lot(lot_sp_24, 'K-6 Lab Corridor', kepler_colony).
lot_type(lot_sp_24, buildable).
lot_district(lot_sp_24, research_quarter).
lot_street(lot_sp_24, lab_corridor).
lot_side(lot_sp_24, right).
lot_house_number(lot_sp_24, 6).
building(lot_sp_24, civic, clinic).

%% ═══════════════════════════════════════════════════════════
%% Thassari Drift
%% ═══════════════════════════════════════════════════════════

%% TD-1 -- Black Nebula Cantina
lot(lot_sp_25, 'TD-1 Main Concourse', thassari_drift).
lot_type(lot_sp_25, buildable).
lot_district(lot_sp_25, bazaar_level).
lot_street(lot_sp_25, main_concourse).
lot_side(lot_sp_25, left).
lot_house_number(lot_sp_25, 1).
building(lot_sp_25, business, cantina).
business(lot_sp_25, 'Black Nebula Cantina', cantina).
business_founded(lot_sp_25, 2911).

%% TD-2 -- Contraband Emporium
lot(lot_sp_26, 'TD-2 Main Concourse', thassari_drift).
lot_type(lot_sp_26, buildable).
lot_district(lot_sp_26, bazaar_level).
lot_street(lot_sp_26, main_concourse).
lot_side(lot_sp_26, right).
lot_house_number(lot_sp_26, 2).
building(lot_sp_26, business, shop).
business(lot_sp_26, 'Zikri Curios and Salvage', shop).
business_founded(lot_sp_26, 2913).

%% TD-3 -- Docking Bay Theta
lot(lot_sp_27, 'TD-3 Berth Alley', thassari_drift).
lot_type(lot_sp_27, buildable).
lot_district(lot_sp_27, docking_tier).
lot_street(lot_sp_27, berth_alley).
lot_side(lot_sp_27, left).
lot_house_number(lot_sp_27, 3).
building(lot_sp_27, civic, docking_bay).

%% TD-4 -- Flophouse Bunks
lot(lot_sp_28, 'TD-4 Berth Alley', thassari_drift).
lot_type(lot_sp_28, buildable).
lot_district(lot_sp_28, docking_tier).
lot_street(lot_sp_28, berth_alley).
lot_side(lot_sp_28, right).
lot_house_number(lot_sp_28, 4).
building(lot_sp_28, residence, bunks).
