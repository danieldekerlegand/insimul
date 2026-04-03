%% Insimul Locations (Lots): Mughal Bengal
%% Source: data/worlds/language/bengali/locations.pl
%% Created: 2026-04-03
%% Total: 35 locations (12 businesses)
%%
%% Predicate schema:
%%   lot/3 — lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 — building(LotAtom, Category, Type)
%%   business/3 — business(LotAtom, Name, BusinessType)

%% ═══════════════════════════════════════════════════════════
%% Sonargaon — Nagar Kendra (Town Center)
%% ═══════════════════════════════════════════════════════════

%% 1 Rani Path — Muslin Weaving Workshop
lot(1_rani_path_0, '1 Rani Path', sonargaon).
lot_type(1_rani_path_0, buildable).
lot_district(1_rani_path_0, nagar_kendra).
lot_street(1_rani_path_0, rani_path).
lot_side(1_rani_path_0, left).
lot_house_number(1_rani_path_0, 1).
building(1_rani_path_0, business, workshop).
business(1_rani_path_0, 'Muslin Karkhana', textile_workshop).
business_founded(1_rani_path_0, 1580).

%% 5 Rani Path — Residence
lot(5_rani_path_1, '5 Rani Path', sonargaon).
lot_type(5_rani_path_1, buildable).
lot_district(5_rani_path_1, nagar_kendra).
lot_street(5_rani_path_1, rani_path).
lot_side(5_rani_path_1, left).
lot_house_number(5_rani_path_1, 5).
building(5_rani_path_1, residence, mansion).

%% 12 Rani Path — Nawab's Court
lot(12_rani_path_2, '12 Rani Path', sonargaon).
lot_type(12_rani_path_2, buildable).
lot_district(12_rani_path_2, nagar_kendra).
lot_street(12_rani_path_2, rani_path).
lot_side(12_rani_path_2, right).
lot_house_number(12_rani_path_2, 12).
building(12_rani_path_2, civic, court).
business(12_rani_path_2, 'Nawab Darbar', government).
business_founded(12_rani_path_2, 1576).

%% 18 Rani Path — Residence
lot(18_rani_path_3, '18 Rani Path', sonargaon).
lot_type(18_rani_path_3, buildable).
lot_district(18_rani_path_3, nagar_kendra).
lot_street(18_rani_path_3, rani_path).
lot_side(18_rani_path_3, right).
lot_house_number(18_rani_path_3, 18).
building(18_rani_path_3, residence, house).

%% 3 Haat Gali — Spice Bazaar
lot(3_haat_gali_4, '3 Haat Gali', sonargaon).
lot_type(3_haat_gali_4, buildable).
lot_district(3_haat_gali_4, nagar_kendra).
lot_street(3_haat_gali_4, haat_gali).
lot_side(3_haat_gali_4, left).
lot_house_number(3_haat_gali_4, 3).
building(3_haat_gali_4, business, market).
business(3_haat_gali_4, 'Moshla Haat', spice_market).
business_founded(3_haat_gali_4, 1550).

%% 9 Haat Gali — Jute Market
lot(9_haat_gali_5, '9 Haat Gali', sonargaon).
lot_type(9_haat_gali_5, buildable).
lot_district(9_haat_gali_5, nagar_kendra).
lot_street(9_haat_gali_5, haat_gali).
lot_side(9_haat_gali_5, left).
lot_house_number(9_haat_gali_5, 9).
building(9_haat_gali_5, business, market).
business(9_haat_gali_5, 'Pat Haat', jute_market).
business_founded(9_haat_gali_5, 1590).

%% 15 Haat Gali — Residence
lot(15_haat_gali_6, '15 Haat Gali', sonargaon).
lot_type(15_haat_gali_6, buildable).
lot_district(15_haat_gali_6, nagar_kendra).
lot_street(15_haat_gali_6, haat_gali).
lot_side(15_haat_gali_6, right).
lot_house_number(15_haat_gali_6, 15).
building(15_haat_gali_6, residence, house).

%% 20 Haat Gali — Residence
lot(20_haat_gali_7, '20 Haat Gali', sonargaon).
lot_type(20_haat_gali_7, buildable).
lot_district(20_haat_gali_7, nagar_kendra).
lot_street(20_haat_gali_7, haat_gali).
lot_side(20_haat_gali_7, right).
lot_house_number(20_haat_gali_7, 20).
building(20_haat_gali_7, residence, cottage).

%% 2 Mandir Lane — Kali Temple
lot(2_mandir_lane_8, '2 Mandir Lane', sonargaon).
lot_type(2_mandir_lane_8, buildable).
lot_district(2_mandir_lane_8, nagar_kendra).
lot_street(2_mandir_lane_8, mandir_lane).
lot_side(2_mandir_lane_8, left).
lot_house_number(2_mandir_lane_8, 2).
building(2_mandir_lane_8, religious, temple).
business(2_mandir_lane_8, 'Kali Mandir', temple).
business_founded(2_mandir_lane_8, 1400).

%% 8 Mandir Lane — Residence
lot(8_mandir_lane_9, '8 Mandir Lane', sonargaon).
lot_type(8_mandir_lane_9, buildable).
lot_district(8_mandir_lane_9, nagar_kendra).
lot_street(8_mandir_lane_9, mandir_lane).
lot_side(8_mandir_lane_9, right).
lot_house_number(8_mandir_lane_9, 8).
building(8_mandir_lane_9, residence, house).

%% ═══════════════════════════════════════════════════════════
%% Sonargaon — Nadi Par (Riverside)
%% ═══════════════════════════════════════════════════════════

%% 1 Ghat Road — Riverside Ghat
lot(1_ghat_road_10, '1 Ghat Road', sonargaon).
lot_type(1_ghat_road_10, buildable).
lot_district(1_ghat_road_10, nadi_par).
lot_street(1_ghat_road_10, ghat_road).
lot_side(1_ghat_road_10, left).
lot_house_number(1_ghat_road_10, 1).
building(1_ghat_road_10, civic, ghat).
business(1_ghat_road_10, 'Meghna Nauka Ghat', boat_landing).
business_founded(1_ghat_road_10, 1310).

%% 7 Ghat Road — Fish Market
lot(7_ghat_road_11, '7 Ghat Road', sonargaon).
lot_type(7_ghat_road_11, buildable).
lot_district(7_ghat_road_11, nadi_par).
lot_street(7_ghat_road_11, ghat_road).
lot_side(7_ghat_road_11, left).
lot_house_number(7_ghat_road_11, 7).
building(7_ghat_road_11, business, market).
business(7_ghat_road_11, 'Mach Bazaar', fish_market).
business_founded(7_ghat_road_11, 1500).

%% 14 Ghat Road — Residence
lot(14_ghat_road_12, '14 Ghat Road', sonargaon).
lot_type(14_ghat_road_12, buildable).
lot_district(14_ghat_road_12, nadi_par).
lot_street(14_ghat_road_12, ghat_road).
lot_side(14_ghat_road_12, right).
lot_house_number(14_ghat_road_12, 14).
building(14_ghat_road_12, residence, house).

%% 20 Ghat Road — Residence
lot(20_ghat_road_13, '20 Ghat Road', sonargaon).
lot_type(20_ghat_road_13, buildable).
lot_district(20_ghat_road_13, nadi_par).
lot_street(20_ghat_road_13, ghat_road).
lot_side(20_ghat_road_13, right).
lot_house_number(20_ghat_road_13, 20).
building(20_ghat_road_13, residence, cottage).

%% 4 Nauka Gali — Boat Builder
lot(4_nauka_gali_14, '4 Nauka Gali', sonargaon).
lot_type(4_nauka_gali_14, buildable).
lot_district(4_nauka_gali_14, nadi_par).
lot_street(4_nauka_gali_14, nauka_gali).
lot_side(4_nauka_gali_14, left).
lot_house_number(4_nauka_gali_14, 4).
building(4_nauka_gali_14, business, workshop).
business(4_nauka_gali_14, 'Nauka Karkhana', boat_workshop).
business_founded(4_nauka_gali_14, 1520).

%% 10 Nauka Gali — Residence
lot(10_nauka_gali_15, '10 Nauka Gali', sonargaon).
lot_type(10_nauka_gali_15, buildable).
lot_district(10_nauka_gali_15, nadi_par).
lot_street(10_nauka_gali_15, nauka_gali).
lot_side(10_nauka_gali_15, right).
lot_house_number(10_nauka_gali_15, 10).
building(10_nauka_gali_15, residence, house).

%% 3 Nouka Path — Residence
lot(3_nouka_path_16, '3 Nouka Path', sonargaon).
lot_type(3_nouka_path_16, buildable).
lot_district(3_nouka_path_16, nadi_par).
lot_street(3_nouka_path_16, nouka_path).
lot_side(3_nouka_path_16, left).
lot_house_number(3_nouka_path_16, 3).
building(3_nouka_path_16, residence, house).

%% 9 Nouka Path — Residence
lot(9_nouka_path_17, '9 Nouka Path', sonargaon).
lot_type(9_nouka_path_17, buildable).
lot_district(9_nouka_path_17, nadi_par).
lot_street(9_nouka_path_17, nouka_path).
lot_side(9_nouka_path_17, right).
lot_house_number(9_nouka_path_17, 9).
building(9_nouka_path_17, residence, cottage).

%% ═══════════════════════════════════════════════════════════
%% Sonargaon — Tanti Para (Weavers' Quarter)
%% ═══════════════════════════════════════════════════════════

%% 2 Tant Gali — Jamdani Loom House
lot(2_tant_gali_18, '2 Tant Gali', sonargaon).
lot_type(2_tant_gali_18, buildable).
lot_district(2_tant_gali_18, tanti_para).
lot_street(2_tant_gali_18, tant_gali).
lot_side(2_tant_gali_18, left).
lot_house_number(2_tant_gali_18, 2).
building(2_tant_gali_18, business, workshop).
business(2_tant_gali_18, 'Jamdani Taat Ghar', weaving_house).
business_founded(2_tant_gali_18, 1560).

%% 8 Tant Gali — Residence
lot(8_tant_gali_19, '8 Tant Gali', sonargaon).
lot_type(8_tant_gali_19, buildable).
lot_district(8_tant_gali_19, tanti_para).
lot_street(8_tant_gali_19, tant_gali).
lot_side(8_tant_gali_19, right).
lot_house_number(8_tant_gali_19, 8).
building(8_tant_gali_19, residence, house).

%% 14 Tant Gali — Residence
lot(14_tant_gali_20, '14 Tant Gali', sonargaon).
lot_type(14_tant_gali_20, buildable).
lot_district(14_tant_gali_20, tanti_para).
lot_street(14_tant_gali_20, tant_gali).
lot_side(14_tant_gali_20, right).
lot_house_number(14_tant_gali_20, 14).
building(14_tant_gali_20, residence, cottage).

%% 3 Resham Lane — Silk Dyer
lot(3_resham_lane_21, '3 Resham Lane', sonargaon).
lot_type(3_resham_lane_21, buildable).
lot_district(3_resham_lane_21, tanti_para).
lot_street(3_resham_lane_21, resham_lane).
lot_side(3_resham_lane_21, left).
lot_house_number(3_resham_lane_21, 3).
building(3_resham_lane_21, business, workshop).
business(3_resham_lane_21, 'Rang Karkhana', dye_workshop).
business_founded(3_resham_lane_21, 1600).

%% 9 Resham Lane — Residence
lot(9_resham_lane_22, '9 Resham Lane', sonargaon).
lot_type(9_resham_lane_22, buildable).
lot_district(9_resham_lane_22, tanti_para).
lot_street(9_resham_lane_22, resham_lane).
lot_side(9_resham_lane_22, right).
lot_house_number(9_resham_lane_22, 9).
building(9_resham_lane_22, residence, house).

%% ═══════════════════════════════════════════════════════════
%% Chandpur — Bazaar Para
%% ═══════════════════════════════════════════════════════════

%% 1 Bazaar Path — Rice Trader
lot(1_bazaar_path_23, '1 Bazaar Path', chandpur).
lot_type(1_bazaar_path_23, buildable).
lot_district(1_bazaar_path_23, bazaar_para).
lot_street(1_bazaar_path_23, bazaar_path).
lot_side(1_bazaar_path_23, left).
lot_house_number(1_bazaar_path_23, 1).
building(1_bazaar_path_23, business, market).
business(1_bazaar_path_23, 'Chal Haat', rice_market).
business_founded(1_bazaar_path_23, 1480).

%% 7 Bazaar Path — Pottery Workshop
lot(7_bazaar_path_24, '7 Bazaar Path', chandpur).
lot_type(7_bazaar_path_24, buildable).
lot_district(7_bazaar_path_24, bazaar_para).
lot_street(7_bazaar_path_24, bazaar_path).
lot_side(7_bazaar_path_24, left).
lot_house_number(7_bazaar_path_24, 7).
building(7_bazaar_path_24, business, workshop).
business(7_bazaar_path_24, 'Mati Shilpa', pottery_workshop).
business_founded(7_bazaar_path_24, 1510).

%% 12 Bazaar Path — Residence
lot(12_bazaar_path_25, '12 Bazaar Path', chandpur).
lot_type(12_bazaar_path_25, buildable).
lot_district(12_bazaar_path_25, bazaar_para).
lot_street(12_bazaar_path_25, bazaar_path).
lot_side(12_bazaar_path_25, right).
lot_house_number(12_bazaar_path_25, 12).
building(12_bazaar_path_25, residence, house).

%% 5 Khal Lane — Residence
lot(5_khal_lane_26, '5 Khal Lane', chandpur).
lot_type(5_khal_lane_26, buildable).
lot_district(5_khal_lane_26, bazaar_para).
lot_street(5_khal_lane_26, khal_lane).
lot_side(5_khal_lane_26, left).
lot_house_number(5_khal_lane_26, 5).
building(5_khal_lane_26, residence, cottage).

%% 11 Khal Lane — Residence
lot(11_khal_lane_27, '11 Khal Lane', chandpur).
lot_type(11_khal_lane_27, buildable).
lot_district(11_khal_lane_27, bazaar_para).
lot_street(11_khal_lane_27, khal_lane).
lot_side(11_khal_lane_27, right).
lot_house_number(11_khal_lane_27, 11).
building(11_khal_lane_27, residence, house).

%% ═══════════════════════════════════════════════════════════
%% Chandpur — Machhiwara (Fishermen's Quarter)
%% ═══════════════════════════════════════════════════════════

%% 2 Mach Gali — Fish Drying Yard
lot(2_mach_gali_28, '2 Mach Gali', chandpur).
lot_type(2_mach_gali_28, buildable).
lot_district(2_mach_gali_28, machhiwara).
lot_street(2_mach_gali_28, mach_gali).
lot_side(2_mach_gali_28, left).
lot_house_number(2_mach_gali_28, 2).
building(2_mach_gali_28, business, workshop).
business(2_mach_gali_28, 'Shutki Mahal', fish_drying_yard).
business_founded(2_mach_gali_28, 1460).

%% 8 Mach Gali — Residence
lot(8_mach_gali_29, '8 Mach Gali', chandpur).
lot_type(8_mach_gali_29, buildable).
lot_district(8_mach_gali_29, machhiwara).
lot_street(8_mach_gali_29, mach_gali).
lot_side(8_mach_gali_29, right).
lot_house_number(8_mach_gali_29, 8).
building(8_mach_gali_29, residence, cottage).

%% 14 Mach Gali — Residence
lot(14_mach_gali_30, '14 Mach Gali', chandpur).
lot_type(14_mach_gali_30, buildable).
lot_district(14_mach_gali_30, machhiwara).
lot_street(14_mach_gali_30, mach_gali).
lot_side(14_mach_gali_30, right).
lot_house_number(14_mach_gali_30, 14).
building(14_mach_gali_30, residence, house).

%% 3 Nadi Ghat Path — Bamboo Craft Shop
lot(3_nadi_ghat_path_31, '3 Nadi Ghat Path', chandpur).
lot_type(3_nadi_ghat_path_31, buildable).
lot_district(3_nadi_ghat_path_31, machhiwara).
lot_street(3_nadi_ghat_path_31, nadi_ghat_path).
lot_side(3_nadi_ghat_path_31, left).
lot_house_number(3_nadi_ghat_path_31, 3).
building(3_nadi_ghat_path_31, business, workshop).
business(3_nadi_ghat_path_31, 'Bansh Shilpa', bamboo_workshop).
business_founded(3_nadi_ghat_path_31, 1530).

%% 9 Nadi Ghat Path — Residence
lot(9_nadi_ghat_path_32, '9 Nadi Ghat Path', chandpur).
lot_type(9_nadi_ghat_path_32, buildable).
lot_district(9_nadi_ghat_path_32, machhiwara).
lot_street(9_nadi_ghat_path_32, nadi_ghat_path).
lot_side(9_nadi_ghat_path_32, right).
lot_house_number(9_nadi_ghat_path_32, 9).
building(9_nadi_ghat_path_32, residence, house).

%% 15 Nadi Ghat Path — Residence
lot(15_nadi_ghat_path_33, '15 Nadi Ghat Path', chandpur).
lot_type(15_nadi_ghat_path_33, buildable).
lot_district(15_nadi_ghat_path_33, machhiwara).
lot_street(15_nadi_ghat_path_33, nadi_ghat_path).
lot_side(15_nadi_ghat_path_33, right).
lot_house_number(15_nadi_ghat_path_33, 15).
building(15_nadi_ghat_path_33, residence, cottage).

%% 20 Nadi Ghat Path — Residence
lot(20_nadi_ghat_path_34, '20 Nadi Ghat Path', chandpur).
lot_type(20_nadi_ghat_path_34, buildable).
lot_district(20_nadi_ghat_path_34, machhiwara).
lot_street(20_nadi_ghat_path_34, nadi_ghat_path).
lot_side(20_nadi_ghat_path_34, right).
lot_house_number(20_nadi_ghat_path_34, 20).
building(20_nadi_ghat_path_34, residence, house).
