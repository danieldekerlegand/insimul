%% Insimul Locations (Lots): Medieval Brittany
%% Source: data/worlds/language/breton/locations.pl
%% Created: 2026-04-03
%% Total: 35 locations (12 businesses)
%%
%% Predicate schema:
%%   lot/3 — lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 — building(LotAtom, Category, Type)
%%   business/3 — business(LotAtom, Name, BusinessType)

%% ═══════════════════════════════════════════════════════════
%% Porzh-Gwenn — Kêr ar Mor (Harbour District)
%% ═══════════════════════════════════════════════════════════

%% 1 Hent ar Porzh — Fishing Port
lot(1_hent_ar_porzh_0, '1 Hent ar Porzh', porzh_gwenn).
lot_type(1_hent_ar_porzh_0, buildable).
lot_district(1_hent_ar_porzh_0, kêr_ar_mor).
lot_street(1_hent_ar_porzh_0, hent_ar_porzh).
lot_side(1_hent_ar_porzh_0, left).
lot_house_number(1_hent_ar_porzh_0, 1).
building(1_hent_ar_porzh_0, business, port).
business(1_hent_ar_porzh_0, 'Porzh-Pesked', fishing_port).
business_founded(1_hent_ar_porzh_0, 1087).

%% 5 Hent ar Porzh — Sail Loft
lot(5_hent_ar_porzh_1, '5 Hent ar Porzh', porzh_gwenn).
lot_type(5_hent_ar_porzh_1, buildable).
lot_district(5_hent_ar_porzh_1, kêr_ar_mor).
lot_street(5_hent_ar_porzh_1, hent_ar_porzh).
lot_side(5_hent_ar_porzh_1, left).
lot_house_number(5_hent_ar_porzh_1, 5).
building(5_hent_ar_porzh_1, business, workshop).
business(5_hent_ar_porzh_1, 'Gwiadenn ar Mor', sail_loft).
business_founded(5_hent_ar_porzh_1, 1145).

%% 9 Hent ar Porzh — Smokehouse
lot(9_hent_ar_porzh_2, '9 Hent ar Porzh', porzh_gwenn).
lot_type(9_hent_ar_porzh_2, buildable).
lot_district(9_hent_ar_porzh_2, kêr_ar_mor).
lot_street(9_hent_ar_porzh_2, hent_ar_porzh).
lot_side(9_hent_ar_porzh_2, right).
lot_house_number(9_hent_ar_porzh_2, 9).
building(9_hent_ar_porzh_2, business, smokehouse).
business(9_hent_ar_porzh_2, 'Mogediñ Pesked', smokehouse).
business_founded(9_hent_ar_porzh_2, 1112).

%% 13 Hent ar Porzh — Residence
lot(13_hent_ar_porzh_3, '13 Hent ar Porzh', porzh_gwenn).
lot_type(13_hent_ar_porzh_3, buildable).
lot_district(13_hent_ar_porzh_3, kêr_ar_mor).
lot_street(13_hent_ar_porzh_3, hent_ar_porzh).
lot_side(13_hent_ar_porzh_3, right).
lot_house_number(13_hent_ar_porzh_3, 13).
building(13_hent_ar_porzh_3, residence, cottage).

%% 17 Hent ar Porzh — Residence
lot(17_hent_ar_porzh_4, '17 Hent ar Porzh', porzh_gwenn).
lot_type(17_hent_ar_porzh_4, buildable).
lot_district(17_hent_ar_porzh_4, kêr_ar_mor).
lot_street(17_hent_ar_porzh_4, hent_ar_porzh).
lot_side(17_hent_ar_porzh_4, left).
lot_house_number(17_hent_ar_porzh_4, 17).
building(17_hent_ar_porzh_4, residence, cottage).

%% 21 Hent ar Porzh — Tavern
lot(21_hent_ar_porzh_5, '21 Hent ar Porzh', porzh_gwenn).
lot_type(21_hent_ar_porzh_5, buildable).
lot_district(21_hent_ar_porzh_5, kêr_ar_mor).
lot_street(21_hent_ar_porzh_5, hent_ar_porzh).
lot_side(21_hent_ar_porzh_5, right).
lot_house_number(21_hent_ar_porzh_5, 21).
building(21_hent_ar_porzh_5, business, tavern).
business(21_hent_ar_porzh_5, 'Tavarn an Ankou', tavern).
business_founded(21_hent_ar_porzh_5, 1130).

%% 2 Hent ar Chapel — Chapel
lot(2_hent_ar_chapel_6, '2 Hent ar Chapel', porzh_gwenn).
lot_type(2_hent_ar_chapel_6, buildable).
lot_district(2_hent_ar_chapel_6, kêr_ar_mor).
lot_street(2_hent_ar_chapel_6, hent_ar_chapel).
lot_side(2_hent_ar_chapel_6, left).
lot_house_number(2_hent_ar_chapel_6, 2).
building(2_hent_ar_chapel_6, civic, chapel).
business(2_hent_ar_chapel_6, 'Chapel Santez Anna', chapel).
business_founded(2_hent_ar_chapel_6, 1148).

%% 6 Hent ar Chapel — Residence
lot(6_hent_ar_chapel_7, '6 Hent ar Chapel', porzh_gwenn).
lot_type(6_hent_ar_chapel_7, buildable).
lot_district(6_hent_ar_chapel_7, kêr_ar_mor).
lot_street(6_hent_ar_chapel_7, hent_ar_chapel).
lot_side(6_hent_ar_chapel_7, right).
lot_house_number(6_hent_ar_chapel_7, 6).
building(6_hent_ar_chapel_7, residence, house).

%% 10 Hent ar Chapel — Residence
lot(10_hent_ar_chapel_8, '10 Hent ar Chapel', porzh_gwenn).
lot_type(10_hent_ar_chapel_8, buildable).
lot_district(10_hent_ar_chapel_8, kêr_ar_mor).
lot_street(10_hent_ar_chapel_8, hent_ar_chapel).
lot_side(10_hent_ar_chapel_8, left).
lot_house_number(10_hent_ar_chapel_8, 10).
building(10_hent_ar_chapel_8, residence, cottage).

%% 14 Hent ar Chapel — Herbalist
lot(14_hent_ar_chapel_9, '14 Hent ar Chapel', porzh_gwenn).
lot_type(14_hent_ar_chapel_9, buildable).
lot_district(14_hent_ar_chapel_9, kêr_ar_mor).
lot_street(14_hent_ar_chapel_9, hent_ar_chapel).
lot_side(14_hent_ar_chapel_9, right).
lot_house_number(14_hent_ar_chapel_9, 14).
building(14_hent_ar_chapel_9, business, apothecary).
business(14_hent_ar_chapel_9, 'Ti al Louzaouer', herbalist).
business_founded(14_hent_ar_chapel_9, 1175).

%% 3 Hent ar Mein Hir — Standing Stone Site
lot(3_hent_ar_mein_hir_10, '3 Hent ar Mein Hir', porzh_gwenn).
lot_type(3_hent_ar_mein_hir_10, buildable).
lot_district(3_hent_ar_mein_hir_10, kêr_ar_mor).
lot_street(3_hent_ar_mein_hir_10, hent_ar_mein_hir).
lot_side(3_hent_ar_mein_hir_10, left).
lot_house_number(3_hent_ar_mein_hir_10, 3).
building(3_hent_ar_mein_hir_10, civic, standing_stone).

%% 7 Hent ar Mein Hir — Residence
lot(7_hent_ar_mein_hir_11, '7 Hent ar Mein Hir', porzh_gwenn).
lot_type(7_hent_ar_mein_hir_11, buildable).
lot_district(7_hent_ar_mein_hir_11, kêr_ar_mor).
lot_street(7_hent_ar_mein_hir_11, hent_ar_mein_hir).
lot_side(7_hent_ar_mein_hir_11, right).
lot_house_number(7_hent_ar_mein_hir_11, 7).
building(7_hent_ar_mein_hir_11, residence, longhouse).

%% 11 Hent ar Mein Hir — Residence
lot(11_hent_ar_mein_hir_12, '11 Hent ar Mein Hir', porzh_gwenn).
lot_type(11_hent_ar_mein_hir_12, buildable).
lot_district(11_hent_ar_mein_hir_12, kêr_ar_mor).
lot_street(11_hent_ar_mein_hir_12, hent_ar_mein_hir).
lot_side(11_hent_ar_mein_hir_12, left).
lot_house_number(11_hent_ar_mein_hir_12, 11).
building(11_hent_ar_mein_hir_12, residence, cottage).

%% ═══════════════════════════════════════════════════════════
%% Porzh-Gwenn — Kêr Uhel (Upper Village)
%% ═══════════════════════════════════════════════════════════

%% 1 Hent ar C'hastell — Ducal Manor
lot(1_hent_ar_c_hastell_13, '1 Hent ar C''hastell', porzh_gwenn).
lot_type(1_hent_ar_c_hastell_13, buildable).
lot_district(1_hent_ar_c_hastell_13, kêr_uhel).
lot_street(1_hent_ar_c_hastell_13, hent_ar_c_hastell).
lot_side(1_hent_ar_c_hastell_13, left).
lot_house_number(1_hent_ar_c_hastell_13, 1).
building(1_hent_ar_c_hastell_13, civic, manor).
business(1_hent_ar_c_hastell_13, 'Maner an Duk', manor).
business_founded(1_hent_ar_c_hastell_13, 1203).

%% 5 Hent ar C'hastell — Weaver's Workshop
lot(5_hent_ar_c_hastell_14, '5 Hent ar C''hastell', porzh_gwenn).
lot_type(5_hent_ar_c_hastell_14, buildable).
lot_district(5_hent_ar_c_hastell_14, kêr_uhel).
lot_street(5_hent_ar_c_hastell_14, hent_ar_c_hastell).
lot_side(5_hent_ar_c_hastell_14, left).
lot_house_number(5_hent_ar_c_hastell_14, 5).
building(5_hent_ar_c_hastell_14, business, workshop).
business(5_hent_ar_c_hastell_14, 'Gwiadenn Nedeleg', weaving_workshop).
business_founded(5_hent_ar_c_hastell_14, 1160).

%% 9 Hent ar C'hastell — Residence
lot(9_hent_ar_c_hastell_15, '9 Hent ar C''hastell', porzh_gwenn).
lot_type(9_hent_ar_c_hastell_15, buildable).
lot_district(9_hent_ar_c_hastell_15, kêr_uhel).
lot_street(9_hent_ar_c_hastell_15, hent_ar_c_hastell).
lot_side(9_hent_ar_c_hastell_15, right).
lot_house_number(9_hent_ar_c_hastell_15, 9).
building(9_hent_ar_c_hastell_15, residence, house).

%% 13 Hent ar C'hastell — Bakery
lot(13_hent_ar_c_hastell_16, '13 Hent ar C''hastell', porzh_gwenn).
lot_type(13_hent_ar_c_hastell_16, buildable).
lot_district(13_hent_ar_c_hastell_16, kêr_uhel).
lot_street(13_hent_ar_c_hastell_16, hent_ar_c_hastell).
lot_side(13_hent_ar_c_hastell_16, right).
lot_house_number(13_hent_ar_c_hastell_16, 13).
building(13_hent_ar_c_hastell_16, business, bakery).
business(13_hent_ar_c_hastell_16, 'Ti ar Bara', bakery).
business_founded(13_hent_ar_c_hastell_16, 1185).

%% 2 Hent ar Park — Cider Press
lot(2_hent_ar_park_17, '2 Hent ar Park', porzh_gwenn).
lot_type(2_hent_ar_park_17, buildable).
lot_district(2_hent_ar_park_17, kêr_uhel).
lot_street(2_hent_ar_park_17, hent_ar_park).
lot_side(2_hent_ar_park_17, left).
lot_house_number(2_hent_ar_park_17, 2).
building(2_hent_ar_park_17, business, cider_press).
business(2_hent_ar_park_17, 'Waskel Sistr', cider_press).
business_founded(2_hent_ar_park_17, 1098).

%% 6 Hent ar Park — Residence
lot(6_hent_ar_park_18, '6 Hent ar Park', porzh_gwenn).
lot_type(6_hent_ar_park_18, buildable).
lot_district(6_hent_ar_park_18, kêr_uhel).
lot_street(6_hent_ar_park_18, hent_ar_park).
lot_side(6_hent_ar_park_18, right).
lot_house_number(6_hent_ar_park_18, 6).
building(6_hent_ar_park_18, residence, house).

%% 10 Hent ar Park — Residence
lot(10_hent_ar_park_19, '10 Hent ar Park', porzh_gwenn).
lot_type(10_hent_ar_park_19, buildable).
lot_district(10_hent_ar_park_19, kêr_uhel).
lot_street(10_hent_ar_park_19, hent_ar_park).
lot_side(10_hent_ar_park_19, left).
lot_house_number(10_hent_ar_park_19, 10).
building(10_hent_ar_park_19, residence, cottage).

%% 14 Hent ar Park — Carpenter
lot(14_hent_ar_park_20, '14 Hent ar Park', porzh_gwenn).
lot_type(14_hent_ar_park_20, buildable).
lot_district(14_hent_ar_park_20, kêr_uhel).
lot_street(14_hent_ar_park_20, hent_ar_park).
lot_side(14_hent_ar_park_20, right).
lot_house_number(14_hent_ar_park_20, 14).
building(14_hent_ar_park_20, business, workshop).
business(14_hent_ar_park_20, 'Koad ha Houarn', carpentry).
business_founded(14_hent_ar_park_20, 1155).

%% 4 Hent ar Gouelioù — Market Square
lot(4_hent_ar_gouelioù_21, '4 Hent ar Gouelioù', porzh_gwenn).
lot_type(4_hent_ar_gouelioù_21, buildable).
lot_district(4_hent_ar_gouelioù_21, kêr_uhel).
lot_street(4_hent_ar_gouelioù_21, hent_ar_gouelioù).
lot_side(4_hent_ar_gouelioù_21, left).
lot_house_number(4_hent_ar_gouelioù_21, 4).
building(4_hent_ar_gouelioù_21, civic, market).

%% 8 Hent ar Gouelioù — Residence
lot(8_hent_ar_gouelioù_22, '8 Hent ar Gouelioù', porzh_gwenn).
lot_type(8_hent_ar_gouelioù_22, buildable).
lot_district(8_hent_ar_gouelioù_22, kêr_uhel).
lot_street(8_hent_ar_gouelioù_22, hent_ar_gouelioù).
lot_side(8_hent_ar_gouelioù_22, right).
lot_house_number(8_hent_ar_gouelioù_22, 8).
building(8_hent_ar_gouelioù_22, residence, longhouse).

%% 12 Hent ar Gouelioù — Residence
lot(12_hent_ar_gouelioù_23, '12 Hent ar Gouelioù', porzh_gwenn).
lot_type(12_hent_ar_gouelioù_23, buildable).
lot_district(12_hent_ar_gouelioù_23, kêr_uhel).
lot_street(12_hent_ar_gouelioù_23, hent_ar_gouelioù).
lot_side(12_hent_ar_gouelioù_23, left).
lot_house_number(12_hent_ar_gouelioù_23, 12).
building(12_hent_ar_gouelioù_23, residence, cottage).

%% ═══════════════════════════════════════════════════════════
%% Lann-Vraz — Lann Kreiz (Village Center)
%% ═══════════════════════════════════════════════════════════

%% 1 Hent ar Lann — Farm
lot(1_hent_ar_lann_24, '1 Hent ar Lann', lann_vraz).
lot_type(1_hent_ar_lann_24, buildable).
lot_district(1_hent_ar_lann_24, lann_kreiz).
lot_street(1_hent_ar_lann_24, hent_ar_lann).
lot_side(1_hent_ar_lann_24, left).
lot_house_number(1_hent_ar_lann_24, 1).
building(1_hent_ar_lann_24, business, farm).
business(1_hent_ar_lann_24, 'Ferm ar Brug', farm).
business_founded(1_hent_ar_lann_24, 1142).

%% 5 Hent ar Lann — Residence
lot(5_hent_ar_lann_25, '5 Hent ar Lann', lann_vraz).
lot_type(5_hent_ar_lann_25, buildable).
lot_district(5_hent_ar_lann_25, lann_kreiz).
lot_street(5_hent_ar_lann_25, hent_ar_lann).
lot_side(5_hent_ar_lann_25, left).
lot_house_number(5_hent_ar_lann_25, 5).
building(5_hent_ar_lann_25, residence, longhouse).

%% 9 Hent ar Lann — Residence
lot(9_hent_ar_lann_26, '9 Hent ar Lann', lann_vraz).
lot_type(9_hent_ar_lann_26, buildable).
lot_district(9_hent_ar_lann_26, lann_kreiz).
lot_street(9_hent_ar_lann_26, hent_ar_lann).
lot_side(9_hent_ar_lann_26, right).
lot_house_number(9_hent_ar_lann_26, 9).
building(9_hent_ar_lann_26, residence, cottage).

%% 13 Hent ar Lann — Smithy
lot(13_hent_ar_lann_27, '13 Hent ar Lann', lann_vraz).
lot_type(13_hent_ar_lann_27, buildable).
lot_district(13_hent_ar_lann_27, lann_kreiz).
lot_street(13_hent_ar_lann_27, hent_ar_lann).
lot_side(13_hent_ar_lann_27, right).
lot_house_number(13_hent_ar_lann_27, 13).
building(13_hent_ar_lann_27, business, smithy).
business(13_hent_ar_lann_27, 'Govadeg ar Vro', smithy).
business_founded(13_hent_ar_lann_27, 1168).

%% 2 Hent ar C'hoat — Dolmen Site
lot(2_hent_ar_c_hoat_28, '2 Hent ar C''hoat', lann_vraz).
lot_type(2_hent_ar_c_hoat_28, buildable).
lot_district(2_hent_ar_c_hoat_28, lann_kreiz).
lot_street(2_hent_ar_c_hoat_28, hent_ar_c_hoat).
lot_side(2_hent_ar_c_hoat_28, left).
lot_house_number(2_hent_ar_c_hoat_28, 2).
building(2_hent_ar_c_hoat_28, civic, dolmen).

%% 6 Hent ar C'hoat — Residence
lot(6_hent_ar_c_hoat_29, '6 Hent ar C''hoat', lann_vraz).
lot_type(6_hent_ar_c_hoat_29, buildable).
lot_district(6_hent_ar_c_hoat_29, lann_kreiz).
lot_street(6_hent_ar_c_hoat_29, hent_ar_c_hoat).
lot_side(6_hent_ar_c_hoat_29, right).
lot_house_number(6_hent_ar_c_hoat_29, 6).
building(6_hent_ar_c_hoat_29, residence, longhouse).

%% 10 Hent ar C'hoat — Residence
lot(10_hent_ar_c_hoat_30, '10 Hent ar C''hoat', lann_vraz).
lot_type(10_hent_ar_c_hoat_30, buildable).
lot_district(10_hent_ar_c_hoat_30, lann_kreiz).
lot_street(10_hent_ar_c_hoat_30, hent_ar_c_hoat).
lot_side(10_hent_ar_c_hoat_30, left).
lot_house_number(10_hent_ar_c_hoat_30, 10).
building(10_hent_ar_c_hoat_30, residence, cottage).

%% 14 Hent ar C'hoat — Residence
lot(14_hent_ar_c_hoat_31, '14 Hent ar C''hoat', lann_vraz).
lot_type(14_hent_ar_c_hoat_31, buildable).
lot_district(14_hent_ar_c_hoat_31, lann_kreiz).
lot_street(14_hent_ar_c_hoat_31, hent_ar_c_hoat).
lot_side(14_hent_ar_c_hoat_31, right).
lot_house_number(14_hent_ar_c_hoat_31, 14).
building(14_hent_ar_c_hoat_31, residence, house).

%% 18 Hent ar C'hoat — Residence
lot(18_hent_ar_c_hoat_32, '18 Hent ar C''hoat', lann_vraz).
lot_type(18_hent_ar_c_hoat_32, buildable).
lot_district(18_hent_ar_c_hoat_32, lann_kreiz).
lot_street(18_hent_ar_c_hoat_32, hent_ar_c_hoat).
lot_side(18_hent_ar_c_hoat_32, left).
lot_house_number(18_hent_ar_c_hoat_32, 18).
building(18_hent_ar_c_hoat_32, residence, longhouse).

%% 22 Hent ar C'hoat — Orchard
lot(22_hent_ar_c_hoat_33, '22 Hent ar C''hoat', lann_vraz).
lot_type(22_hent_ar_c_hoat_33, buildable).
lot_district(22_hent_ar_c_hoat_33, lann_kreiz).
lot_street(22_hent_ar_c_hoat_33, hent_ar_c_hoat).
lot_side(22_hent_ar_c_hoat_33, right).
lot_house_number(22_hent_ar_c_hoat_33, 22).
building(22_hent_ar_c_hoat_33, business, orchard).
business(22_hent_ar_c_hoat_33, 'Gwez-Aval Lann-Vraz', orchard).
business_founded(22_hent_ar_c_hoat_33, 1150).

%% 26 Hent ar C'hoat — Residence
lot(26_hent_ar_c_hoat_34, '26 Hent ar C''hoat', lann_vraz).
lot_type(26_hent_ar_c_hoat_34, buildable).
lot_district(26_hent_ar_c_hoat_34, lann_kreiz).
lot_street(26_hent_ar_c_hoat_34, hent_ar_c_hoat).
lot_side(26_hent_ar_c_hoat_34, left).
lot_house_number(26_hent_ar_c_hoat_34, 26).
building(26_hent_ar_c_hoat_34, residence, cottage).
