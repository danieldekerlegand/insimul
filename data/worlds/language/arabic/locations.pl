%% Insimul Locations (Lots): Arabic Coastal Town
%% Source: data/worlds/language/arabic/locations.pl
%% Created: 2026-04-03
%% Total: 35 locations
%%
%% Predicate schema:
%%   lot/3 — lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 — building(LotAtom, Category, Type)
%%   business/3 — business(LotAtom, Name, BusinessType)

%% 5 Sharia al-Bahr — Cafe al-Nakhla
lot(lot_ar_1, '5 Sharia al-Bahr', madinat_al_bahr).
lot_type(lot_ar_1, buildable).
lot_district(lot_ar_1, old_medina).
lot_street(lot_ar_1, sharia_al_bahr).
lot_side(lot_ar_1, left).
lot_house_number(lot_ar_1, 5).
building(lot_ar_1, business, cafe).
business(lot_ar_1, 'Cafe al-Nakhla', cafe).
business_founded(lot_ar_1, 2005).

%% 12 Sharia al-Bahr — Pharmacy
lot(lot_ar_2, '12 Sharia al-Bahr', madinat_al_bahr).
lot_type(lot_ar_2, buildable).
lot_district(lot_ar_2, old_medina).
lot_street(lot_ar_2, sharia_al_bahr).
lot_side(lot_ar_2, right).
lot_house_number(lot_ar_2, 12).
building(lot_ar_2, business, pharmacy).
business(lot_ar_2, 'Saydaliyyat al-Shifa', pharmacy).
business_founded(lot_ar_2, 1998).

%% 20 Sharia al-Bahr — Bakery
lot(lot_ar_3, '20 Sharia al-Bahr', madinat_al_bahr).
lot_type(lot_ar_3, buildable).
lot_district(lot_ar_3, old_medina).
lot_street(lot_ar_3, sharia_al_bahr).
lot_side(lot_ar_3, left).
lot_house_number(lot_ar_3, 20).
building(lot_ar_3, business, bakery).
business(lot_ar_3, 'Makhbaz al-Furn', bakery).
business_founded(lot_ar_3, 1985).

%% 28 Sharia al-Bahr — Residence
lot(lot_ar_4, '28 Sharia al-Bahr', madinat_al_bahr).
lot_type(lot_ar_4, buildable).
lot_district(lot_ar_4, old_medina).
lot_street(lot_ar_4, sharia_al_bahr).
lot_side(lot_ar_4, right).
lot_house_number(lot_ar_4, 28).
building(lot_ar_4, residence, house).

%% 35 Sharia al-Bahr — Residence
lot(lot_ar_5, '35 Sharia al-Bahr', madinat_al_bahr).
lot_type(lot_ar_5, buildable).
lot_district(lot_ar_5, old_medina).
lot_street(lot_ar_5, sharia_al_bahr).
lot_side(lot_ar_5, left).
lot_house_number(lot_ar_5, 35).
building(lot_ar_5, residence, apartment).

%% 3 Sharia al-Souq — Spice Souq
lot(lot_ar_6, '3 Sharia al-Souq', madinat_al_bahr).
lot_type(lot_ar_6, buildable).
lot_district(lot_ar_6, old_medina).
lot_street(lot_ar_6, sharia_al_souq).
lot_side(lot_ar_6, left).
lot_house_number(lot_ar_6, 3).
building(lot_ar_6, business, market).
business(lot_ar_6, 'Souq al-Tawabil', market).
business_founded(lot_ar_6, 1920).

%% 10 Sharia al-Souq — Electronics Shop
lot(lot_ar_7, '10 Sharia al-Souq', madinat_al_bahr).
lot_type(lot_ar_7, buildable).
lot_district(lot_ar_7, old_medina).
lot_street(lot_ar_7, sharia_al_souq).
lot_side(lot_ar_7, right).
lot_house_number(lot_ar_7, 10).
building(lot_ar_7, business, shop).
business(lot_ar_7, 'Mahal al-Iliktroniyyat', shop).
business_founded(lot_ar_7, 2010).

%% 18 Sharia al-Souq — Textile Shop
lot(lot_ar_8, '18 Sharia al-Souq', madinat_al_bahr).
lot_type(lot_ar_8, buildable).
lot_district(lot_ar_8, old_medina).
lot_street(lot_ar_8, sharia_al_souq).
lot_side(lot_ar_8, left).
lot_house_number(lot_ar_8, 18).
building(lot_ar_8, business, shop).
business(lot_ar_8, 'Dukkan al-Aqmisha', shop).
business_founded(lot_ar_8, 1975).

%% 25 Sharia al-Souq — Bookstore
lot(lot_ar_9, '25 Sharia al-Souq', madinat_al_bahr).
lot_type(lot_ar_9, buildable).
lot_district(lot_ar_9, old_medina).
lot_street(lot_ar_9, sharia_al_souq).
lot_side(lot_ar_9, right).
lot_house_number(lot_ar_9, 25).
building(lot_ar_9, business, bookstore).
business(lot_ar_9, 'Maktabat al-Nur', bookstore).
business_founded(lot_ar_9, 1992).

%% 30 Sharia al-Souq — Jewelry Shop
lot(lot_ar_10, '30 Sharia al-Souq', madinat_al_bahr).
lot_type(lot_ar_10, buildable).
lot_district(lot_ar_10, old_medina).
lot_street(lot_ar_10, sharia_al_souq).
lot_side(lot_ar_10, left).
lot_house_number(lot_ar_10, 30).
building(lot_ar_10, business, shop).
business(lot_ar_10, 'Souq al-Dhahab', shop).
business_founded(lot_ar_10, 1960).

%% 5 Sharia al-Masjid — Great Mosque
lot(lot_ar_11, '5 Sharia al-Masjid', madinat_al_bahr).
lot_type(lot_ar_11, buildable).
lot_district(lot_ar_11, old_medina).
lot_street(lot_ar_11, sharia_al_masjid).
lot_side(lot_ar_11, left).
lot_house_number(lot_ar_11, 5).
building(lot_ar_11, civic, mosque).

%% 15 Sharia al-Masjid — Residence
lot(lot_ar_12, '15 Sharia al-Masjid', madinat_al_bahr).
lot_type(lot_ar_12, buildable).
lot_district(lot_ar_12, old_medina).
lot_street(lot_ar_12, sharia_al_masjid).
lot_side(lot_ar_12, right).
lot_house_number(lot_ar_12, 15).
building(lot_ar_12, residence, house).

%% 22 Sharia al-Masjid — Calligraphy Studio
lot(lot_ar_13, '22 Sharia al-Masjid', madinat_al_bahr).
lot_type(lot_ar_13, buildable).
lot_district(lot_ar_13, old_medina).
lot_street(lot_ar_13, sharia_al_masjid).
lot_side(lot_ar_13, left).
lot_house_number(lot_ar_13, 22).
building(lot_ar_13, business, workshop).
business(lot_ar_13, 'Studio al-Khatt', workshop).
business_founded(lot_ar_13, 2000).

%% 30 Sharia al-Masjid — Residence
lot(lot_ar_14, '30 Sharia al-Masjid', madinat_al_bahr).
lot_type(lot_ar_14, buildable).
lot_district(lot_ar_14, old_medina).
lot_street(lot_ar_14, sharia_al_masjid).
lot_side(lot_ar_14, right).
lot_house_number(lot_ar_14, 30).
building(lot_ar_14, residence, apartment).

%% 38 Sharia al-Masjid — Tailor
lot(lot_ar_15, '38 Sharia al-Masjid', madinat_al_bahr).
lot_type(lot_ar_15, buildable).
lot_district(lot_ar_15, old_medina).
lot_street(lot_ar_15, sharia_al_masjid).
lot_side(lot_ar_15, left).
lot_house_number(lot_ar_15, 38).
building(lot_ar_15, business, tailor).
business(lot_ar_15, 'Khayyat al-Madina', tailor).
business_founded(lot_ar_15, 1988).

%% 5 Sharia al-Jami — University Main Building
lot(lot_ar_16, '5 Sharia al-Jami', madinat_al_bahr).
lot_type(lot_ar_16, buildable).
lot_district(lot_ar_16, university_quarter).
lot_street(lot_ar_16, sharia_al_jami).
lot_side(lot_ar_16, left).
lot_house_number(lot_ar_16, 5).
building(lot_ar_16, civic, university).

%% 15 Sharia al-Jami — Student Cafe
lot(lot_ar_17, '15 Sharia al-Jami', madinat_al_bahr).
lot_type(lot_ar_17, buildable).
lot_district(lot_ar_17, university_quarter).
lot_street(lot_ar_17, sharia_al_jami).
lot_side(lot_ar_17, right).
lot_house_number(lot_ar_17, 15).
building(lot_ar_17, business, cafe).
business(lot_ar_17, 'Cafe al-Talaba', cafe).
business_founded(lot_ar_17, 2015).

%% 22 Sharia al-Jami — Library
lot(lot_ar_18, '22 Sharia al-Jami', madinat_al_bahr).
lot_type(lot_ar_18, buildable).
lot_district(lot_ar_18, university_quarter).
lot_street(lot_ar_18, sharia_al_jami).
lot_side(lot_ar_18, left).
lot_house_number(lot_ar_18, 22).
building(lot_ar_18, civic, library).

%% 30 Sharia al-Jami — Student Housing
lot(lot_ar_19, '30 Sharia al-Jami', madinat_al_bahr).
lot_type(lot_ar_19, buildable).
lot_district(lot_ar_19, university_quarter).
lot_street(lot_ar_19, sharia_al_jami).
lot_side(lot_ar_19, right).
lot_house_number(lot_ar_19, 30).
building(lot_ar_19, residence, apartment).

%% 8 Sharia al-Ilm — Language Center
lot(lot_ar_20, '8 Sharia al-Ilm', madinat_al_bahr).
lot_type(lot_ar_20, buildable).
lot_district(lot_ar_20, university_quarter).
lot_street(lot_ar_20, sharia_al_ilm).
lot_side(lot_ar_20, left).
lot_house_number(lot_ar_20, 8).
building(lot_ar_20, business, school).
business(lot_ar_20, 'Markaz al-Lughat', school).
business_founded(lot_ar_20, 2008).

%% 16 Sharia al-Ilm — Copy and Print Shop
lot(lot_ar_21, '16 Sharia al-Ilm', madinat_al_bahr).
lot_type(lot_ar_21, buildable).
lot_district(lot_ar_21, university_quarter).
lot_street(lot_ar_21, sharia_al_ilm).
lot_side(lot_ar_21, right).
lot_house_number(lot_ar_21, 16).
building(lot_ar_21, business, shop).
business(lot_ar_21, 'Matba al-Ilm', shop).
business_founded(lot_ar_21, 2003).

%% 24 Sharia al-Ilm — Falafel Restaurant
lot(lot_ar_22, '24 Sharia al-Ilm', madinat_al_bahr).
lot_type(lot_ar_22, buildable).
lot_district(lot_ar_22, university_quarter).
lot_street(lot_ar_22, sharia_al_ilm).
lot_side(lot_ar_22, left).
lot_house_number(lot_ar_22, 24).
building(lot_ar_22, business, restaurant).
business(lot_ar_22, 'Mataam al-Falafel', restaurant).
business_founded(lot_ar_22, 1995).

%% 32 Sharia al-Ilm — Residence
lot(lot_ar_23, '32 Sharia al-Ilm', madinat_al_bahr).
lot_type(lot_ar_23, buildable).
lot_district(lot_ar_23, university_quarter).
lot_street(lot_ar_23, sharia_al_ilm).
lot_side(lot_ar_23, right).
lot_house_number(lot_ar_23, 32).
building(lot_ar_23, residence, apartment).

%% 40 Sharia al-Ilm — Mobile Phone Shop
lot(lot_ar_24, '40 Sharia al-Ilm', madinat_al_bahr).
lot_type(lot_ar_24, buildable).
lot_district(lot_ar_24, university_quarter).
lot_street(lot_ar_24, sharia_al_ilm).
lot_side(lot_ar_24, left).
lot_house_number(lot_ar_24, 40).
building(lot_ar_24, business, shop).
business(lot_ar_24, 'Mahal al-Jawwalat', shop).
business_founded(lot_ar_24, 2012).

%% 5 Tariq al-Corniche — Seafood Restaurant
lot(lot_ar_25, '5 Tariq al-Corniche', madinat_al_bahr).
lot_type(lot_ar_25, buildable).
lot_district(lot_ar_25, corniche).
lot_street(lot_ar_25, tariq_al_corniche).
lot_side(lot_ar_25, left).
lot_house_number(lot_ar_25, 5).
building(lot_ar_25, business, restaurant).
business(lot_ar_25, 'Mataam al-Bahr', restaurant).
business_founded(lot_ar_25, 2002).

%% 15 Tariq al-Corniche — Ice Cream Shop
lot(lot_ar_26, '15 Tariq al-Corniche', madinat_al_bahr).
lot_type(lot_ar_26, buildable).
lot_district(lot_ar_26, corniche).
lot_street(lot_ar_26, tariq_al_corniche).
lot_side(lot_ar_26, right).
lot_house_number(lot_ar_26, 15).
building(lot_ar_26, business, shop).
business(lot_ar_26, 'Bouza al-Corniche', shop).
business_founded(lot_ar_26, 2018).

%% 25 Tariq al-Corniche — Fitness Club
lot(lot_ar_27, '25 Tariq al-Corniche', madinat_al_bahr).
lot_type(lot_ar_27, buildable).
lot_district(lot_ar_27, corniche).
lot_street(lot_ar_27, tariq_al_corniche).
lot_side(lot_ar_27, left).
lot_house_number(lot_ar_27, 25).
building(lot_ar_27, business, gym).
business(lot_ar_27, 'Nadi al-Riyada', gym).
business_founded(lot_ar_27, 2016).

%% 35 Tariq al-Corniche — Hotel
lot(lot_ar_28, '35 Tariq al-Corniche', madinat_al_bahr).
lot_type(lot_ar_28, buildable).
lot_district(lot_ar_28, corniche).
lot_street(lot_ar_28, tariq_al_corniche).
lot_side(lot_ar_28, right).
lot_house_number(lot_ar_28, 35).
building(lot_ar_28, business, hotel).
business(lot_ar_28, 'Funduq al-Bahr', hotel).
business_founded(lot_ar_28, 2000).

%% 45 Tariq al-Corniche — Residence
lot(lot_ar_29, '45 Tariq al-Corniche', madinat_al_bahr).
lot_type(lot_ar_29, buildable).
lot_district(lot_ar_29, corniche).
lot_street(lot_ar_29, tariq_al_corniche).
lot_side(lot_ar_29, left).
lot_house_number(lot_ar_29, 45).
building(lot_ar_29, residence, apartment).

%% 55 Tariq al-Corniche — Supermarket
lot(lot_ar_30, '55 Tariq al-Corniche', madinat_al_bahr).
lot_type(lot_ar_30, buildable).
lot_district(lot_ar_30, corniche).
lot_street(lot_ar_30, tariq_al_corniche).
lot_side(lot_ar_30, right).
lot_house_number(lot_ar_30, 55).
building(lot_ar_30, business, grocerystore).
business(lot_ar_30, 'Supermarket al-Khair', grocerystore).
business_founded(lot_ar_30, 2010).

%% Al-Zahra Village Lots

%% 3 Sharia al-Nakhil — Village Mosque
lot(lot_ar_31, '3 Sharia al-Nakhil', al_zahra).
lot_type(lot_ar_31, buildable).
lot_district(lot_ar_31, village_center).
lot_street(lot_ar_31, sharia_al_nakhil).
lot_side(lot_ar_31, left).
lot_house_number(lot_ar_31, 3).
building(lot_ar_31, civic, mosque).

%% 10 Sharia al-Nakhil — General Store
lot(lot_ar_32, '10 Sharia al-Nakhil', al_zahra).
lot_type(lot_ar_32, buildable).
lot_district(lot_ar_32, village_center).
lot_street(lot_ar_32, sharia_al_nakhil).
lot_side(lot_ar_32, right).
lot_house_number(lot_ar_32, 10).
building(lot_ar_32, business, shop).
business(lot_ar_32, 'Dukkan Abu Hamza', shop).
business_founded(lot_ar_32, 1970).

%% 5 Sharia al-Bustan — Olive Press
lot(lot_ar_33, '5 Sharia al-Bustan', al_zahra).
lot_type(lot_ar_33, buildable).
lot_district(lot_ar_33, village_center).
lot_street(lot_ar_33, sharia_al_bustan).
lot_side(lot_ar_33, left).
lot_house_number(lot_ar_33, 5).
building(lot_ar_33, business, workshop).
business(lot_ar_33, 'Masarat al-Zaytun', workshop).
business_founded(lot_ar_33, 1940).

%% 12 Sharia al-Bustan — Residence
lot(lot_ar_34, '12 Sharia al-Bustan', al_zahra).
lot_type(lot_ar_34, buildable).
lot_district(lot_ar_34, village_center).
lot_street(lot_ar_34, sharia_al_bustan).
lot_side(lot_ar_34, right).
lot_house_number(lot_ar_34, 12).
building(lot_ar_34, residence, house).

%% 20 Sharia al-Bustan — Residence
lot(lot_ar_35, '20 Sharia al-Bustan', al_zahra).
lot_type(lot_ar_35, buildable).
lot_district(lot_ar_35, village_center).
lot_street(lot_ar_35, sharia_al_bustan).
lot_side(lot_ar_35, left).
lot_house_number(lot_ar_35, 20).
building(lot_ar_35, residence, house).
