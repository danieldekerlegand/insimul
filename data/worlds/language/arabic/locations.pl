%% Insimul Locations (Lots): Arabic Al-Andalus
%% Source: data/worlds/language/arabic/locations.pl
%% Created: 2026-04-03
%% Total: 35 locations
%%
%% Predicate schema:
%%   lot/3 — lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 — building(LotAtom, Category, Type)
%%   business/3 — business(LotAtom, Name, BusinessType)

%% ═══════════════════════════════════════════════════════════
%% Medina District — Tariq al-Masjid
%% ═══════════════════════════════════════════════════════════

%% 1 Tariq al-Masjid — Great Mosque
lot(1_tariq_al_masjid_0, '1 Tariq al-Masjid', qurtuba).
lot_type(1_tariq_al_masjid_0, civic).
lot_district(1_tariq_al_masjid_0, medina).
lot_street(1_tariq_al_masjid_0, tariq_al_masjid).
lot_side(1_tariq_al_masjid_0, left).
lot_house_number(1_tariq_al_masjid_0, 1).
building(1_tariq_al_masjid_0, civic, mosque).

%% 3 Tariq al-Masjid — Residence
lot(3_tariq_al_masjid_1, '3 Tariq al-Masjid', qurtuba).
lot_type(3_tariq_al_masjid_1, buildable).
lot_district(3_tariq_al_masjid_1, medina).
lot_street(3_tariq_al_masjid_1, tariq_al_masjid).
lot_side(3_tariq_al_masjid_1, left).
lot_house_number(3_tariq_al_masjid_1, 3).
building(3_tariq_al_masjid_1, residence, house).

%% 5 Tariq al-Masjid — Madrasa
lot(5_tariq_al_masjid_2, '5 Tariq al-Masjid', qurtuba).
lot_type(5_tariq_al_masjid_2, buildable).
lot_district(5_tariq_al_masjid_2, medina).
lot_street(5_tariq_al_masjid_2, tariq_al_masjid).
lot_side(5_tariq_al_masjid_2, right).
lot_house_number(5_tariq_al_masjid_2, 5).
building(5_tariq_al_masjid_2, business, madrasa).
business(5_tariq_al_masjid_2, 'Al-Madrasa al-Kubra', madrasa).
business_founded(5_tariq_al_masjid_2, 945).

%% 7 Tariq al-Masjid — Residence
lot(7_tariq_al_masjid_3, '7 Tariq al-Masjid', qurtuba).
lot_type(7_tariq_al_masjid_3, buildable).
lot_district(7_tariq_al_masjid_3, medina).
lot_street(7_tariq_al_masjid_3, tariq_al_masjid).
lot_side(7_tariq_al_masjid_3, right).
lot_house_number(7_tariq_al_masjid_3, 7).
building(7_tariq_al_masjid_3, residence, house).

%% 9 Tariq al-Masjid — Hammam
lot(9_tariq_al_masjid_4, '9 Tariq al-Masjid', qurtuba).
lot_type(9_tariq_al_masjid_4, buildable).
lot_district(9_tariq_al_masjid_4, medina).
lot_street(9_tariq_al_masjid_4, tariq_al_masjid).
lot_side(9_tariq_al_masjid_4, left).
lot_house_number(9_tariq_al_masjid_4, 9).
building(9_tariq_al_masjid_4, business, hammam).
business(9_tariq_al_masjid_4, 'Hammam al-Nur', hammam).
business_founded(9_tariq_al_masjid_4, 952).

%% ═══════════════════════════════════════════════════════════
%% Medina District — Tariq al-Suq
%% ═══════════════════════════════════════════════════════════

%% 2 Tariq al-Suq — Spice Souk
lot(2_tariq_al_suq_5, '2 Tariq al-Suq', qurtuba).
lot_type(2_tariq_al_suq_5, buildable).
lot_district(2_tariq_al_suq_5, medina).
lot_street(2_tariq_al_suq_5, tariq_al_suq).
lot_side(2_tariq_al_suq_5, left).
lot_house_number(2_tariq_al_suq_5, 2).
building(2_tariq_al_suq_5, business, souk).
business(2_tariq_al_suq_5, 'Suq al-Attar', spice_souk).
business_founded(2_tariq_al_suq_5, 938).

%% 4 Tariq al-Suq — Textile Souk
lot(4_tariq_al_suq_6, '4 Tariq al-Suq', qurtuba).
lot_type(4_tariq_al_suq_6, buildable).
lot_district(4_tariq_al_suq_6, medina).
lot_street(4_tariq_al_suq_6, tariq_al_suq).
lot_side(4_tariq_al_suq_6, left).
lot_house_number(4_tariq_al_suq_6, 4).
building(4_tariq_al_suq_6, business, souk).
business(4_tariq_al_suq_6, 'Suq al-Qazzazin', textile_souk).
business_founded(4_tariq_al_suq_6, 941).

%% 6 Tariq al-Suq — Coppersmith
lot(6_tariq_al_suq_7, '6 Tariq al-Suq', qurtuba).
lot_type(6_tariq_al_suq_7, buildable).
lot_district(6_tariq_al_suq_7, medina).
lot_street(6_tariq_al_suq_7, tariq_al_suq).
lot_side(6_tariq_al_suq_7, right).
lot_house_number(6_tariq_al_suq_7, 6).
building(6_tariq_al_suq_7, business, workshop).
business(6_tariq_al_suq_7, 'Dukkan al-Nahas', coppersmith).
business_founded(6_tariq_al_suq_7, 955).

%% 8 Tariq al-Suq — Bakery
lot(8_tariq_al_suq_8, '8 Tariq al-Suq', qurtuba).
lot_type(8_tariq_al_suq_8, buildable).
lot_district(8_tariq_al_suq_8, medina).
lot_street(8_tariq_al_suq_8, tariq_al_suq).
lot_side(8_tariq_al_suq_8, right).
lot_house_number(8_tariq_al_suq_8, 8).
building(8_tariq_al_suq_8, business, bakery).
business(8_tariq_al_suq_8, 'Furn al-Medina', bakery).
business_founded(8_tariq_al_suq_8, 960).

%% 10 Tariq al-Suq — Residence
lot(10_tariq_al_suq_9, '10 Tariq al-Suq', qurtuba).
lot_type(10_tariq_al_suq_9, buildable).
lot_district(10_tariq_al_suq_9, medina).
lot_street(10_tariq_al_suq_9, tariq_al_suq).
lot_side(10_tariq_al_suq_9, left).
lot_house_number(10_tariq_al_suq_9, 10).
building(10_tariq_al_suq_9, residence, house).

%% 12 Tariq al-Suq — Pottery Workshop
lot(12_tariq_al_suq_10, '12 Tariq al-Suq', qurtuba).
lot_type(12_tariq_al_suq_10, buildable).
lot_district(12_tariq_al_suq_10, medina).
lot_street(12_tariq_al_suq_10, tariq_al_suq).
lot_side(12_tariq_al_suq_10, left).
lot_house_number(12_tariq_al_suq_10, 12).
building(12_tariq_al_suq_10, business, workshop).
business(12_tariq_al_suq_10, 'Dukkan al-Fakhkhar', pottery_workshop).
business_founded(12_tariq_al_suq_10, 948).

%% ═══════════════════════════════════════════════════════════
%% Medina District — Zuqaq al-Attar
%% ═══════════════════════════════════════════════════════════

%% 1 Zuqaq al-Attar — Apothecary
lot(1_zuqaq_al_attar_11, '1 Zuqaq al-Attar', qurtuba).
lot_type(1_zuqaq_al_attar_11, buildable).
lot_district(1_zuqaq_al_attar_11, medina).
lot_street(1_zuqaq_al_attar_11, zuqaq_al_attar).
lot_side(1_zuqaq_al_attar_11, left).
lot_house_number(1_zuqaq_al_attar_11, 1).
building(1_zuqaq_al_attar_11, business, apothecary).
business(1_zuqaq_al_attar_11, 'Dukkan al-Attar', apothecary).
business_founded(1_zuqaq_al_attar_11, 950).

%% 3 Zuqaq al-Attar — Residence
lot(3_zuqaq_al_attar_12, '3 Zuqaq al-Attar', qurtuba).
lot_type(3_zuqaq_al_attar_12, buildable).
lot_district(3_zuqaq_al_attar_12, medina).
lot_street(3_zuqaq_al_attar_12, zuqaq_al_attar).
lot_side(3_zuqaq_al_attar_12, right).
lot_house_number(3_zuqaq_al_attar_12, 3).
building(3_zuqaq_al_attar_12, residence, house).

%% 5 Zuqaq al-Attar — Residence
lot(5_zuqaq_al_attar_13, '5 Zuqaq al-Attar', qurtuba).
lot_type(5_zuqaq_al_attar_13, buildable).
lot_district(5_zuqaq_al_attar_13, medina).
lot_street(5_zuqaq_al_attar_13, zuqaq_al_attar).
lot_side(5_zuqaq_al_attar_13, left).
lot_house_number(5_zuqaq_al_attar_13, 5).
building(5_zuqaq_al_attar_13, residence, cottage).

%% ═══════════════════════════════════════════════════════════
%% Alcazar District — Tariq al-Qasr
%% ═══════════════════════════════════════════════════════════

%% 2 Tariq al-Qasr — Royal Library
lot(2_tariq_al_qasr_14, '2 Tariq al-Qasr', qurtuba).
lot_type(2_tariq_al_qasr_14, civic).
lot_district(2_tariq_al_qasr_14, alcazar).
lot_street(2_tariq_al_qasr_14, tariq_al_qasr).
lot_side(2_tariq_al_qasr_14, left).
lot_house_number(2_tariq_al_qasr_14, 2).
building(2_tariq_al_qasr_14, civic, library).

%% 4 Tariq al-Qasr — Calligraphy Studio
lot(4_tariq_al_qasr_15, '4 Tariq al-Qasr', qurtuba).
lot_type(4_tariq_al_qasr_15, buildable).
lot_district(4_tariq_al_qasr_15, alcazar).
lot_street(4_tariq_al_qasr_15, tariq_al_qasr).
lot_side(4_tariq_al_qasr_15, left).
lot_house_number(4_tariq_al_qasr_15, 4).
building(4_tariq_al_qasr_15, business, calligraphy_studio).
business(4_tariq_al_qasr_15, 'Maktab al-Khatt', calligraphy_studio).
business_founded(4_tariq_al_qasr_15, 958).

%% 6 Tariq al-Qasr — Residence (Noble)
lot(6_tariq_al_qasr_16, '6 Tariq al-Qasr', qurtuba).
lot_type(6_tariq_al_qasr_16, buildable).
lot_district(6_tariq_al_qasr_16, alcazar).
lot_street(6_tariq_al_qasr_16, tariq_al_qasr).
lot_side(6_tariq_al_qasr_16, right).
lot_house_number(6_tariq_al_qasr_16, 6).
building(6_tariq_al_qasr_16, residence, mansion).

%% 8 Tariq al-Qasr — Residence (Noble)
lot(8_tariq_al_qasr_17, '8 Tariq al-Qasr', qurtuba).
lot_type(8_tariq_al_qasr_17, buildable).
lot_district(8_tariq_al_qasr_17, alcazar).
lot_street(8_tariq_al_qasr_17, tariq_al_qasr).
lot_side(8_tariq_al_qasr_17, right).
lot_house_number(8_tariq_al_qasr_17, 8).
building(8_tariq_al_qasr_17, residence, mansion).

%% ═══════════════════════════════════════════════════════════
%% Alcazar District — Shari al-Ulum (Street of Sciences)
%% ═══════════════════════════════════════════════════════════

%% 1 Shari al-Ulum — Observatory
lot(1_shari_al_ulum_18, '1 Shari al-Ulum', qurtuba).
lot_type(1_shari_al_ulum_18, civic).
lot_district(1_shari_al_ulum_18, alcazar).
lot_street(1_shari_al_ulum_18, shari_al_ulum).
lot_side(1_shari_al_ulum_18, left).
lot_house_number(1_shari_al_ulum_18, 1).
building(1_shari_al_ulum_18, civic, observatory).

%% 3 Shari al-Ulum — Translation House
lot(3_shari_al_ulum_19, '3 Shari al-Ulum', qurtuba).
lot_type(3_shari_al_ulum_19, buildable).
lot_district(3_shari_al_ulum_19, alcazar).
lot_street(3_shari_al_ulum_19, shari_al_ulum).
lot_side(3_shari_al_ulum_19, left).
lot_house_number(3_shari_al_ulum_19, 3).
building(3_shari_al_ulum_19, business, translation_house).
business(3_shari_al_ulum_19, 'Bayt al-Tarjama', translation_house).
business_founded(3_shari_al_ulum_19, 965).

%% 5 Shari al-Ulum — Bookbinder
lot(5_shari_al_ulum_20, '5 Shari al-Ulum', qurtuba).
lot_type(5_shari_al_ulum_20, buildable).
lot_district(5_shari_al_ulum_20, alcazar).
lot_street(5_shari_al_ulum_20, shari_al_ulum).
lot_side(5_shari_al_ulum_20, right).
lot_house_number(5_shari_al_ulum_20, 5).
building(5_shari_al_ulum_20, business, bookbinder).
business(5_shari_al_ulum_20, 'Dukkan al-Mujallid', bookbinder).
business_founded(5_shari_al_ulum_20, 970).

%% 7 Shari al-Ulum — Residence
lot(7_shari_al_ulum_21, '7 Shari al-Ulum', qurtuba).
lot_type(7_shari_al_ulum_21, buildable).
lot_district(7_shari_al_ulum_21, alcazar).
lot_street(7_shari_al_ulum_21, shari_al_ulum).
lot_side(7_shari_al_ulum_21, right).
lot_house_number(7_shari_al_ulum_21, 7).
building(7_shari_al_ulum_21, residence, house).

%% ═══════════════════════════════════════════════════════════
%% Riverside Quarter — Darb al-Nahr
%% ═══════════════════════════════════════════════════════════

%% 1 Darb al-Nahr — Caravanserai
lot(1_darb_al_nahr_22, '1 Darb al-Nahr', qurtuba).
lot_type(1_darb_al_nahr_22, buildable).
lot_district(1_darb_al_nahr_22, riverside_quarter).
lot_street(1_darb_al_nahr_22, darb_al_nahr).
lot_side(1_darb_al_nahr_22, left).
lot_house_number(1_darb_al_nahr_22, 1).
building(1_darb_al_nahr_22, business, caravanserai).
business(1_darb_al_nahr_22, 'Khan al-Wadi', caravanserai).
business_founded(1_darb_al_nahr_22, 942).

%% 3 Darb al-Nahr — Residence
lot(3_darb_al_nahr_23, '3 Darb al-Nahr', qurtuba).
lot_type(3_darb_al_nahr_23, buildable).
lot_district(3_darb_al_nahr_23, riverside_quarter).
lot_street(3_darb_al_nahr_23, darb_al_nahr).
lot_side(3_darb_al_nahr_23, left).
lot_house_number(3_darb_al_nahr_23, 3).
building(3_darb_al_nahr_23, residence, cottage).

%% 5 Darb al-Nahr — Tannery
lot(5_darb_al_nahr_24, '5 Darb al-Nahr', qurtuba).
lot_type(5_darb_al_nahr_24, buildable).
lot_district(5_darb_al_nahr_24, riverside_quarter).
lot_street(5_darb_al_nahr_24, darb_al_nahr).
lot_side(5_darb_al_nahr_24, right).
lot_house_number(5_darb_al_nahr_24, 5).
building(5_darb_al_nahr_24, business, tannery).
business(5_darb_al_nahr_24, 'Dabbaghat al-Nahr', tannery).
business_founded(5_darb_al_nahr_24, 935).

%% 7 Darb al-Nahr — Residence
lot(7_darb_al_nahr_25, '7 Darb al-Nahr', qurtuba).
lot_type(7_darb_al_nahr_25, buildable).
lot_district(7_darb_al_nahr_25, riverside_quarter).
lot_street(7_darb_al_nahr_25, darb_al_nahr).
lot_side(7_darb_al_nahr_25, right).
lot_house_number(7_darb_al_nahr_25, 7).
building(7_darb_al_nahr_25, residence, house).

%% ═══════════════════════════════════════════════════════════
%% Riverside Quarter — Tariq al-Jisr
%% ═══════════════════════════════════════════════════════════

%% 2 Tariq al-Jisr — Fish Market
lot(2_tariq_al_jisr_26, '2 Tariq al-Jisr', qurtuba).
lot_type(2_tariq_al_jisr_26, buildable).
lot_district(2_tariq_al_jisr_26, riverside_quarter).
lot_street(2_tariq_al_jisr_26, tariq_al_jisr).
lot_side(2_tariq_al_jisr_26, left).
lot_house_number(2_tariq_al_jisr_26, 2).
building(2_tariq_al_jisr_26, business, market).
business(2_tariq_al_jisr_26, 'Suq al-Samak', fish_market).
business_founded(2_tariq_al_jisr_26, 930).

%% 4 Tariq al-Jisr — Residence
lot(4_tariq_al_jisr_27, '4 Tariq al-Jisr', qurtuba).
lot_type(4_tariq_al_jisr_27, buildable).
lot_district(4_tariq_al_jisr_27, riverside_quarter).
lot_street(4_tariq_al_jisr_27, tariq_al_jisr).
lot_side(4_tariq_al_jisr_27, left).
lot_house_number(4_tariq_al_jisr_27, 4).
building(4_tariq_al_jisr_27, residence, cottage).

%% 6 Tariq al-Jisr — Residence
lot(6_tariq_al_jisr_28, '6 Tariq al-Jisr', qurtuba).
lot_type(6_tariq_al_jisr_28, buildable).
lot_district(6_tariq_al_jisr_28, riverside_quarter).
lot_street(6_tariq_al_jisr_28, tariq_al_jisr).
lot_side(6_tariq_al_jisr_28, right).
lot_house_number(6_tariq_al_jisr_28, 6).
building(6_tariq_al_jisr_28, residence, house).

%% ═══════════════════════════════════════════════════════════
%% Ishbiliya — Tariq al-Bahr
%% ═══════════════════════════════════════════════════════════

%% 1 Tariq al-Bahr — Shipyard
lot(1_tariq_al_bahr_29, '1 Tariq al-Bahr', ishbiliya).
lot_type(1_tariq_al_bahr_29, buildable).
lot_district(1_tariq_al_bahr_29, ishbiliya_medina).
lot_street(1_tariq_al_bahr_29, tariq_al_bahr).
lot_side(1_tariq_al_bahr_29, left).
lot_house_number(1_tariq_al_bahr_29, 1).
building(1_tariq_al_bahr_29, business, shipyard).
business(1_tariq_al_bahr_29, 'Dar al-Sina''a', shipyard).
business_founded(1_tariq_al_bahr_29, 844).

%% 3 Tariq al-Bahr — Residence
lot(3_tariq_al_bahr_30, '3 Tariq al-Bahr', ishbiliya).
lot_type(3_tariq_al_bahr_30, buildable).
lot_district(3_tariq_al_bahr_30, ishbiliya_medina).
lot_street(3_tariq_al_bahr_30, tariq_al_bahr).
lot_side(3_tariq_al_bahr_30, left).
lot_house_number(3_tariq_al_bahr_30, 3).
building(3_tariq_al_bahr_30, residence, house).

%% 5 Tariq al-Bahr — Olive Oil Press
lot(5_tariq_al_bahr_31, '5 Tariq al-Bahr', ishbiliya).
lot_type(5_tariq_al_bahr_31, buildable).
lot_district(5_tariq_al_bahr_31, ishbiliya_medina).
lot_street(5_tariq_al_bahr_31, tariq_al_bahr).
lot_side(5_tariq_al_bahr_31, right).
lot_house_number(5_tariq_al_bahr_31, 5).
building(5_tariq_al_bahr_31, business, workshop).
business(5_tariq_al_bahr_31, 'Ma''sara al-Zaytun', olive_press).
business_founded(5_tariq_al_bahr_31, 890).

%% ═══════════════════════════════════════════════════════════
%% Ishbiliya — Zuqaq al-Hara
%% ═══════════════════════════════════════════════════════════

%% 2 Zuqaq al-Hara — Residence
lot(2_zuqaq_al_hara_32, '2 Zuqaq al-Hara', ishbiliya).
lot_type(2_zuqaq_al_hara_32, buildable).
lot_district(2_zuqaq_al_hara_32, triana).
lot_street(2_zuqaq_al_hara_32, zuqaq_al_hara).
lot_side(2_zuqaq_al_hara_32, left).
lot_house_number(2_zuqaq_al_hara_32, 2).
building(2_zuqaq_al_hara_32, residence, cottage).

%% 4 Zuqaq al-Hara — Residence
lot(4_zuqaq_al_hara_33, '4 Zuqaq al-Hara', ishbiliya).
lot_type(4_zuqaq_al_hara_33, buildable).
lot_district(4_zuqaq_al_hara_33, triana).
lot_street(4_zuqaq_al_hara_33, zuqaq_al_hara).
lot_side(4_zuqaq_al_hara_33, right).
lot_house_number(4_zuqaq_al_hara_33, 4).
building(4_zuqaq_al_hara_33, residence, house).

%% 6 Zuqaq al-Hara — Dyer Workshop
lot(6_zuqaq_al_hara_34, '6 Zuqaq al-Hara', ishbiliya).
lot_type(6_zuqaq_al_hara_34, buildable).
lot_district(6_zuqaq_al_hara_34, triana).
lot_street(6_zuqaq_al_hara_34, zuqaq_al_hara).
lot_side(6_zuqaq_al_hara_34, right).
lot_house_number(6_zuqaq_al_hara_34, 6).
building(6_zuqaq_al_hara_34, business, workshop).
business(6_zuqaq_al_hara_34, 'Dukkan al-Sabbagh', dyer_workshop).
business_founded(6_zuqaq_al_hara_34, 870).
