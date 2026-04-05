%% Insimul Locations (Lots): Urdu Punjab
%% Source: data/worlds/language/urdu/locations.pl
%% Created: 2026-04-03
%% Total: 35 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% =====================================================================
%% Purana Shahar District -- Bazaar Road
%% =====================================================================

%% 1 Bazaar Road -- Kapra Bazaar (Cloth Market)
lot(1_bazaar_road_0, '1 Bazaar Road', noor_manzil).
lot_type(1_bazaar_road_0, buildable).
lot_district(1_bazaar_road_0, purana_shahar).
lot_street(1_bazaar_road_0, bazaar_road).
lot_side(1_bazaar_road_0, left).
lot_house_number(1_bazaar_road_0, 1).
building(1_bazaar_road_0, business, market).
business(1_bazaar_road_0, 'Haji Sahab Kapra House', cloth_market).
business_founded(1_bazaar_road_0, 1925).

%% 3 Bazaar Road -- Chai Stall
lot(3_bazaar_road_1, '3 Bazaar Road', noor_manzil).
lot_type(3_bazaar_road_1, buildable).
lot_district(3_bazaar_road_1, purana_shahar).
lot_street(3_bazaar_road_1, bazaar_road).
lot_side(3_bazaar_road_1, left).
lot_house_number(3_bazaar_road_1, 3).
building(3_bazaar_road_1, business, tea_stall).
business(3_bazaar_road_1, 'Bilal Chai Wala', chai_stall).
business_founded(3_bazaar_road_1, 1998).

%% 5 Bazaar Road -- Kabab Stall
lot(5_bazaar_road_2, '5 Bazaar Road', noor_manzil).
lot_type(5_bazaar_road_2, buildable).
lot_district(5_bazaar_road_2, purana_shahar).
lot_street(5_bazaar_road_2, bazaar_road).
lot_side(5_bazaar_road_2, right).
lot_house_number(5_bazaar_road_2, 5).
building(5_bazaar_road_2, business, food_stall).
business(5_bazaar_road_2, 'Tikka Khan Kabab House', kabab_stall).
business_founded(5_bazaar_road_2, 1972).

%% 7 Bazaar Road -- General Store (Kiryana)
lot(7_bazaar_road_3, '7 Bazaar Road', noor_manzil).
lot_type(7_bazaar_road_3, buildable).
lot_district(7_bazaar_road_3, purana_shahar).
lot_street(7_bazaar_road_3, bazaar_road).
lot_side(7_bazaar_road_3, right).
lot_house_number(7_bazaar_road_3, 7).
building(7_bazaar_road_3, business, shop).
business(7_bazaar_road_3, 'Malik Kiryana Store', general_store).
business_founded(7_bazaar_road_3, 1960).

%% 9 Bazaar Road -- Tailor Shop (Darzi)
lot(9_bazaar_road_4, '9 Bazaar Road', noor_manzil).
lot_type(9_bazaar_road_4, buildable).
lot_district(9_bazaar_road_4, purana_shahar).
lot_street(9_bazaar_road_4, bazaar_road).
lot_side(9_bazaar_road_4, left).
lot_house_number(9_bazaar_road_4, 9).
building(9_bazaar_road_4, business, workshop).
business(9_bazaar_road_4, 'Ustad Jameel Darzi', tailor_shop).
business_founded(9_bazaar_road_4, 1985).

%% 11 Bazaar Road -- Jeweler (Sonar)
lot(11_bazaar_road_5, '11 Bazaar Road', noor_manzil).
lot_type(11_bazaar_road_5, buildable).
lot_district(11_bazaar_road_5, purana_shahar).
lot_street(11_bazaar_road_5, bazaar_road).
lot_side(11_bazaar_road_5, right).
lot_house_number(11_bazaar_road_5, 11).
building(11_bazaar_road_5, business, jewelry_shop).
business(11_bazaar_road_5, 'Shah Jewellers', jewelry_shop).
business_founded(11_bazaar_road_5, 1950).

%% 13 Bazaar Road -- Spice Shop (Masala)
lot(13_bazaar_road_6, '13 Bazaar Road', noor_manzil).
lot_type(13_bazaar_road_6, buildable).
lot_district(13_bazaar_road_6, purana_shahar).
lot_street(13_bazaar_road_6, bazaar_road).
lot_side(13_bazaar_road_6, left).
lot_house_number(13_bazaar_road_6, 13).
building(13_bazaar_road_6, business, shop).
business(13_bazaar_road_6, 'Butt Masala Centre', spice_shop).
business_founded(13_bazaar_road_6, 1968).

%% 15 Bazaar Road -- Residence
lot(15_bazaar_road_7, '15 Bazaar Road', noor_manzil).
lot_type(15_bazaar_road_7, buildable).
lot_district(15_bazaar_road_7, purana_shahar).
lot_street(15_bazaar_road_7, bazaar_road).
lot_side(15_bazaar_road_7, right).
lot_house_number(15_bazaar_road_7, 15).
building(15_bazaar_road_7, residence, house).

%% =====================================================================
%% Purana Shahar District -- Masjid Gali
%% =====================================================================

%% 2 Masjid Gali -- Jama Masjid
lot(2_masjid_gali_8, '2 Masjid Gali', noor_manzil).
lot_type(2_masjid_gali_8, civic).
lot_district(2_masjid_gali_8, purana_shahar).
lot_street(2_masjid_gali_8, masjid_gali).
lot_side(2_masjid_gali_8, left).
lot_house_number(2_masjid_gali_8, 2).
building(2_masjid_gali_8, civic, mosque).

%% 4 Masjid Gali -- Madrasa
lot(4_masjid_gali_9, '4 Masjid Gali', noor_manzil).
lot_type(4_masjid_gali_9, buildable).
lot_district(4_masjid_gali_9, purana_shahar).
lot_street(4_masjid_gali_9, masjid_gali).
lot_side(4_masjid_gali_9, left).
lot_house_number(4_masjid_gali_9, 4).
building(4_masjid_gali_9, business, madrasa).
business(4_masjid_gali_9, 'Madrasa Noor ul Huda', madrasa).
business_founded(4_masjid_gali_9, 1920).

%% 6 Masjid Gali -- Hakeem (Traditional Healer)
lot(6_masjid_gali_10, '6 Masjid Gali', noor_manzil).
lot_type(6_masjid_gali_10, buildable).
lot_district(6_masjid_gali_10, purana_shahar).
lot_street(6_masjid_gali_10, masjid_gali).
lot_side(6_masjid_gali_10, right).
lot_house_number(6_masjid_gali_10, 6).
building(6_masjid_gali_10, business, clinic).
business(6_masjid_gali_10, 'Hakeem Sahab Dawakhana', traditional_healer).
business_founded(6_masjid_gali_10, 1935).

%% 8 Masjid Gali -- Residence
lot(8_masjid_gali_11, '8 Masjid Gali', noor_manzil).
lot_type(8_masjid_gali_11, buildable).
lot_district(8_masjid_gali_11, purana_shahar).
lot_street(8_masjid_gali_11, masjid_gali).
lot_side(8_masjid_gali_11, right).
lot_house_number(8_masjid_gali_11, 8).
building(8_masjid_gali_11, residence, house).

%% =====================================================================
%% Purana Shahar District -- Anarkali Gali
%% =====================================================================

%% 1 Anarkali Gali -- Attar (Perfume) Shop
lot(1_anarkali_gali_12, '1 Anarkali Gali', noor_manzil).
lot_type(1_anarkali_gali_12, buildable).
lot_district(1_anarkali_gali_12, purana_shahar).
lot_street(1_anarkali_gali_12, anarkali_gali).
lot_side(1_anarkali_gali_12, left).
lot_house_number(1_anarkali_gali_12, 1).
building(1_anarkali_gali_12, business, shop).
business(1_anarkali_gali_12, 'Hussain Attar', perfume_shop).
business_founded(1_anarkali_gali_12, 1945).

%% 3 Anarkali Gali -- Bookstore (Kitabon ki Dukaan)
lot(3_anarkali_gali_13, '3 Anarkali Gali', noor_manzil).
lot_type(3_anarkali_gali_13, buildable).
lot_district(3_anarkali_gali_13, purana_shahar).
lot_street(3_anarkali_gali_13, anarkali_gali).
lot_side(3_anarkali_gali_13, left).
lot_house_number(3_anarkali_gali_13, 3).
building(3_anarkali_gali_13, business, bookstore).
business(3_anarkali_gali_13, 'Iqbal Kitab Ghar', bookstore).
business_founded(3_anarkali_gali_13, 1955).

%% 5 Anarkali Gali -- Mushaira Hall
lot(5_anarkali_gali_14, '5 Anarkali Gali', noor_manzil).
lot_type(5_anarkali_gali_14, civic).
lot_district(5_anarkali_gali_14, purana_shahar).
lot_street(5_anarkali_gali_14, anarkali_gali).
lot_side(5_anarkali_gali_14, right).
lot_house_number(5_anarkali_gali_14, 5).
building(5_anarkali_gali_14, civic, mushaira_hall).

%% 7 Anarkali Gali -- Samosa Shop
lot(7_anarkali_gali_15, '7 Anarkali Gali', noor_manzil).
lot_type(7_anarkali_gali_15, buildable).
lot_district(7_anarkali_gali_15, purana_shahar).
lot_street(7_anarkali_gali_15, anarkali_gali).
lot_side(7_anarkali_gali_15, right).
lot_house_number(7_anarkali_gali_15, 7).
building(7_anarkali_gali_15, business, food_stall).
business(7_anarkali_gali_15, 'Ahmed Samosa Wala', samosa_shop).
business_founded(7_anarkali_gali_15, 1990).

%% 9 Anarkali Gali -- Residence
lot(9_anarkali_gali_16, '9 Anarkali Gali', noor_manzil).
lot_type(9_anarkali_gali_16, buildable).
lot_district(9_anarkali_gali_16, purana_shahar).
lot_street(9_anarkali_gali_16, anarkali_gali).
lot_side(9_anarkali_gali_16, left).
lot_house_number(9_anarkali_gali_16, 9).
building(9_anarkali_gali_16, residence, house).

%% =====================================================================
%% Naya Shahar District -- Jinnah Road
%% =====================================================================

%% 2 Jinnah Road -- Pharmacy (Dawai Khana)
lot(2_jinnah_road_17, '2 Jinnah Road', noor_manzil).
lot_type(2_jinnah_road_17, buildable).
lot_district(2_jinnah_road_17, naya_shahar).
lot_street(2_jinnah_road_17, jinnah_road).
lot_side(2_jinnah_road_17, left).
lot_house_number(2_jinnah_road_17, 2).
building(2_jinnah_road_17, business, pharmacy).
business(2_jinnah_road_17, 'Al-Shifa Pharmacy', pharmacy).
business_founded(2_jinnah_road_17, 2005).

%% 4 Jinnah Road -- Mobile Phone Shop
lot(4_jinnah_road_18, '4 Jinnah Road', noor_manzil).
lot_type(4_jinnah_road_18, buildable).
lot_district(4_jinnah_road_18, naya_shahar).
lot_street(4_jinnah_road_18, jinnah_road).
lot_side(4_jinnah_road_18, left).
lot_house_number(4_jinnah_road_18, 4).
building(4_jinnah_road_18, business, shop).
business(4_jinnah_road_18, 'Smart Mobile Zone', mobile_shop).
business_founded(4_jinnah_road_18, 2015).

%% 6 Jinnah Road -- Bank
lot(6_jinnah_road_19, '6 Jinnah Road', noor_manzil).
lot_type(6_jinnah_road_19, buildable).
lot_district(6_jinnah_road_19, naya_shahar).
lot_street(6_jinnah_road_19, jinnah_road).
lot_side(6_jinnah_road_19, right).
lot_house_number(6_jinnah_road_19, 6).
building(6_jinnah_road_19, business, bank).
business(6_jinnah_road_19, 'Habib Bank Limited', bank).
business_founded(6_jinnah_road_19, 1995).

%% 8 Jinnah Road -- Modern Office
lot(8_jinnah_road_20, '8 Jinnah Road', noor_manzil).
lot_type(8_jinnah_road_20, buildable).
lot_district(8_jinnah_road_20, naya_shahar).
lot_street(8_jinnah_road_20, jinnah_road).
lot_side(8_jinnah_road_20, right).
lot_house_number(8_jinnah_road_20, 8).
building(8_jinnah_road_20, business, office).
business(8_jinnah_road_20, 'Noor IT Solutions', tech_office).
business_founded(8_jinnah_road_20, 2018).

%% 10 Jinnah Road -- Biryani Restaurant
lot(10_jinnah_road_21, '10 Jinnah Road', noor_manzil).
lot_type(10_jinnah_road_21, buildable).
lot_district(10_jinnah_road_21, naya_shahar).
lot_street(10_jinnah_road_21, jinnah_road).
lot_side(10_jinnah_road_21, left).
lot_house_number(10_jinnah_road_21, 10).
building(10_jinnah_road_21, business, restaurant).
business(10_jinnah_road_21, 'Khan Biryani House', restaurant).
business_founded(10_jinnah_road_21, 2000).

%% =====================================================================
%% Naya Shahar District -- Iqbal Avenue
%% =====================================================================

%% 1 Iqbal Avenue -- Cricket Ground
lot(1_iqbal_avenue_22, '1 Iqbal Avenue', noor_manzil).
lot_type(1_iqbal_avenue_22, civic).
lot_district(1_iqbal_avenue_22, naya_shahar).
lot_street(1_iqbal_avenue_22, iqbal_avenue).
lot_side(1_iqbal_avenue_22, left).
lot_house_number(1_iqbal_avenue_22, 1).
building(1_iqbal_avenue_22, civic, cricket_ground).

%% 3 Iqbal Avenue -- Nastaliq Calligraphy Studio
lot(3_iqbal_avenue_23, '3 Iqbal Avenue', noor_manzil).
lot_type(3_iqbal_avenue_23, buildable).
lot_district(3_iqbal_avenue_23, naya_shahar).
lot_street(3_iqbal_avenue_23, iqbal_avenue).
lot_side(3_iqbal_avenue_23, left).
lot_house_number(3_iqbal_avenue_23, 3).
building(3_iqbal_avenue_23, business, calligraphy_studio).
business(3_iqbal_avenue_23, 'Khattat Nastaliq Academy', calligraphy_studio).
business_founded(3_iqbal_avenue_23, 2010).

%% 5 Iqbal Avenue -- Residence
lot(5_iqbal_avenue_24, '5 Iqbal Avenue', noor_manzil).
lot_type(5_iqbal_avenue_24, buildable).
lot_district(5_iqbal_avenue_24, naya_shahar).
lot_street(5_iqbal_avenue_24, iqbal_avenue).
lot_side(5_iqbal_avenue_24, right).
lot_house_number(5_iqbal_avenue_24, 5).
building(5_iqbal_avenue_24, residence, house).

%% 7 Iqbal Avenue -- Rickshaw Stand
lot(7_iqbal_avenue_25, '7 Iqbal Avenue', noor_manzil).
lot_type(7_iqbal_avenue_25, buildable).
lot_district(7_iqbal_avenue_25, naya_shahar).
lot_street(7_iqbal_avenue_25, iqbal_avenue).
lot_side(7_iqbal_avenue_25, right).
lot_house_number(7_iqbal_avenue_25, 7).
building(7_iqbal_avenue_25, business, transport).
business(7_iqbal_avenue_25, 'Chand Rickshaw Stand', rickshaw_stand).
business_founded(7_iqbal_avenue_25, 1990).

%% =====================================================================
%% University Colony District -- Campus Road
%% =====================================================================

%% 2 Campus Road -- University Library
lot(2_campus_road_26, '2 Campus Road', noor_manzil).
lot_type(2_campus_road_26, civic).
lot_district(2_campus_road_26, university_colony).
lot_street(2_campus_road_26, campus_road).
lot_side(2_campus_road_26, left).
lot_house_number(2_campus_road_26, 2).
building(2_campus_road_26, civic, library).

%% 4 Campus Road -- University Canteen
lot(4_campus_road_27, '4 Campus Road', noor_manzil).
lot_type(4_campus_road_27, buildable).
lot_district(4_campus_road_27, university_colony).
lot_street(4_campus_road_27, campus_road).
lot_side(4_campus_road_27, left).
lot_house_number(4_campus_road_27, 4).
building(4_campus_road_27, business, canteen).
business(4_campus_road_27, 'University Canteen', canteen).
business_founded(4_campus_road_27, 1986).

%% 6 Campus Road -- Urdu Department Building
lot(6_campus_road_28, '6 Campus Road', noor_manzil).
lot_type(6_campus_road_28, civic).
lot_district(6_campus_road_28, university_colony).
lot_street(6_campus_road_28, campus_road).
lot_side(6_campus_road_28, right).
lot_house_number(6_campus_road_28, 6).
building(6_campus_road_28, civic, university_department).

%% =====================================================================
%% University Colony District -- Hostel Lane
%% =====================================================================

%% 1 Hostel Lane -- Student Hostel
lot(1_hostel_lane_29, '1 Hostel Lane', noor_manzil).
lot_type(1_hostel_lane_29, buildable).
lot_district(1_hostel_lane_29, university_colony).
lot_street(1_hostel_lane_29, hostel_lane).
lot_side(1_hostel_lane_29, left).
lot_house_number(1_hostel_lane_29, 1).
building(1_hostel_lane_29, residence, hostel).

%% 3 Hostel Lane -- Photocopy and Stationery
lot(3_hostel_lane_30, '3 Hostel Lane', noor_manzil).
lot_type(3_hostel_lane_30, buildable).
lot_district(3_hostel_lane_30, university_colony).
lot_street(3_hostel_lane_30, hostel_lane).
lot_side(3_hostel_lane_30, left).
lot_house_number(3_hostel_lane_30, 3).
building(3_hostel_lane_30, business, shop).
business(3_hostel_lane_30, 'Qamar Photocopy Centre', stationery_shop).
business_founded(3_hostel_lane_30, 2002).

%% =====================================================================
%% Sabz Pind -- Panchayat Road
%% =====================================================================

%% 1 Panchayat Road -- Village Haveli
lot(1_panchayat_road_31, '1 Panchayat Road', sabz_pind).
lot_type(1_panchayat_road_31, buildable).
lot_district(1_panchayat_road_31, sabz_pind_centre).
lot_street(1_panchayat_road_31, panchayat_road).
lot_side(1_panchayat_road_31, left).
lot_house_number(1_panchayat_road_31, 1).
building(1_panchayat_road_31, residence, haveli).

%% 3 Panchayat Road -- Village Mosque
lot(3_panchayat_road_32, '3 Panchayat Road', sabz_pind).
lot_type(3_panchayat_road_32, civic).
lot_district(3_panchayat_road_32, sabz_pind_centre).
lot_street(3_panchayat_road_32, panchayat_road).
lot_side(3_panchayat_road_32, right).
lot_house_number(3_panchayat_road_32, 3).
building(3_panchayat_road_32, civic, mosque).

%% =====================================================================
%% Sabz Pind -- Khet Wali Gali
%% =====================================================================

%% 2 Khet Wali Gali -- Farm Supply Shop
lot(2_khet_wali_gali_33, '2 Khet Wali Gali', sabz_pind).
lot_type(2_khet_wali_gali_33, buildable).
lot_district(2_khet_wali_gali_33, sabz_pind_centre).
lot_street(2_khet_wali_gali_33, khet_wali_gali).
lot_side(2_khet_wali_gali_33, left).
lot_house_number(2_khet_wali_gali_33, 2).
building(2_khet_wali_gali_33, business, shop).
business(2_khet_wali_gali_33, 'Zameendar Supply Store', farm_supply).
business_founded(2_khet_wali_gali_33, 1975).

%% 4 Khet Wali Gali -- Residence
lot(4_khet_wali_gali_34, '4 Khet Wali Gali', sabz_pind).
lot_type(4_khet_wali_gali_34, buildable).
lot_district(4_khet_wali_gali_34, sabz_pind_centre).
lot_street(4_khet_wali_gali_34, khet_wali_gali).
lot_side(4_khet_wali_gali_34, right).
lot_house_number(4_khet_wali_gali_34, 4).
building(4_khet_wali_gali_34, residence, house).
