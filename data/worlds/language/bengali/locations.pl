%% Insimul Locations (Lots): Bengali Riverside Town
%% Source: data/worlds/language/bengali/locations.pl
%% Created: 2026-04-03
%% Total: 35 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% 3 Goli Rasta -- Cha Stall
lot(lot_bn_1, '3 Goli Rasta', nodi_gram).
lot_type(lot_bn_1, buildable).
lot_district(lot_bn_1, puran_palli).
lot_street(lot_bn_1, goli_rasta).
lot_side(lot_bn_1, left).
lot_house_number(lot_bn_1, 3).
building(lot_bn_1, business, tea_stall).
business(lot_bn_1, 'Karim Bhai Cha Stall', tea_stall).
business_founded(lot_bn_1, 1995).

%% 10 Goli Rasta -- Pharmacy
lot(lot_bn_2, '10 Goli Rasta', nodi_gram).
lot_type(lot_bn_2, buildable).
lot_district(lot_bn_2, puran_palli).
lot_street(lot_bn_2, goli_rasta).
lot_side(lot_bn_2, right).
lot_house_number(lot_bn_2, 10).
building(lot_bn_2, business, pharmacy).
business(lot_bn_2, 'Shifa Oushodh Dokan', pharmacy).
business_founded(lot_bn_2, 2002).

%% 18 Goli Rasta -- Sweet Shop
lot(lot_bn_3, '18 Goli Rasta', nodi_gram).
lot_type(lot_bn_3, buildable).
lot_district(lot_bn_3, puran_palli).
lot_street(lot_bn_3, goli_rasta).
lot_side(lot_bn_3, left).
lot_house_number(lot_bn_3, 18).
building(lot_bn_3, business, sweet_shop).
business(lot_bn_3, 'Roshogolla Mistanno Bhandar', sweet_shop).
business_founded(lot_bn_3, 1980).

%% 25 Goli Rasta -- Residence
lot(lot_bn_4, '25 Goli Rasta', nodi_gram).
lot_type(lot_bn_4, buildable).
lot_district(lot_bn_4, puran_palli).
lot_street(lot_bn_4, goli_rasta).
lot_side(lot_bn_4, right).
lot_house_number(lot_bn_4, 25).
building(lot_bn_4, residence, house).

%% 32 Goli Rasta -- Residence
lot(lot_bn_5, '32 Goli Rasta', nodi_gram).
lot_type(lot_bn_5, buildable).
lot_district(lot_bn_5, puran_palli).
lot_street(lot_bn_5, goli_rasta).
lot_side(lot_bn_5, left).
lot_house_number(lot_bn_5, 32).
building(lot_bn_5, residence, apartment).

%% 5 Mandir Lane -- Kali Temple
lot(lot_bn_6, '5 Mandir Lane', nodi_gram).
lot_type(lot_bn_6, buildable).
lot_district(lot_bn_6, puran_palli).
lot_street(lot_bn_6, mandir_lane).
lot_side(lot_bn_6, left).
lot_house_number(lot_bn_6, 5).
building(lot_bn_6, civic, temple).

%% 12 Mandir Lane -- Tailor
lot(lot_bn_7, '12 Mandir Lane', nodi_gram).
lot_type(lot_bn_7, buildable).
lot_district(lot_bn_7, puran_palli).
lot_street(lot_bn_7, mandir_lane).
lot_side(lot_bn_7, right).
lot_house_number(lot_bn_7, 12).
building(lot_bn_7, business, tailor).
business(lot_bn_7, 'Sujon Dorji Dokan', tailor).
business_founded(lot_bn_7, 1990).

%% 20 Mandir Lane -- Residence
lot(lot_bn_8, '20 Mandir Lane', nodi_gram).
lot_type(lot_bn_8, buildable).
lot_district(lot_bn_8, puran_palli).
lot_street(lot_bn_8, mandir_lane).
lot_side(lot_bn_8, left).
lot_house_number(lot_bn_8, 20).
building(lot_bn_8, residence, house).

%% 3 Masjid Road -- Jami Masjid
lot(lot_bn_9, '3 Masjid Road', nodi_gram).
lot_type(lot_bn_9, buildable).
lot_district(lot_bn_9, puran_palli).
lot_street(lot_bn_9, masjid_road).
lot_side(lot_bn_9, left).
lot_house_number(lot_bn_9, 3).
building(lot_bn_9, civic, mosque).

%% 12 Masjid Road -- Bookstore
lot(lot_bn_10, '12 Masjid Road', nodi_gram).
lot_type(lot_bn_10, buildable).
lot_district(lot_bn_10, puran_palli).
lot_street(lot_bn_10, masjid_road).
lot_side(lot_bn_10, right).
lot_house_number(lot_bn_10, 12).
building(lot_bn_10, business, bookstore).
business(lot_bn_10, 'Gyan Boi Ghor', bookstore).
business_founded(lot_bn_10, 1998).

%% 5 Kapor Goli -- Textile Bazaar
lot(lot_bn_11, '5 Kapor Goli', nodi_gram).
lot_type(lot_bn_11, buildable).
lot_district(lot_bn_11, bazaar_para).
lot_street(lot_bn_11, kapor_goli).
lot_side(lot_bn_11, left).
lot_house_number(lot_bn_11, 5).
building(lot_bn_11, business, shop).
business(lot_bn_11, 'Muslin Kaporer Dokan', shop).
business_founded(lot_bn_11, 1965).

%% 12 Kapor Goli -- Sari Shop
lot(lot_bn_12, '12 Kapor Goli', nodi_gram).
lot_type(lot_bn_12, buildable).
lot_district(lot_bn_12, bazaar_para).
lot_street(lot_bn_12, kapor_goli).
lot_side(lot_bn_12, right).
lot_house_number(lot_bn_12, 12).
building(lot_bn_12, business, shop).
business(lot_bn_12, 'Jamdani Sari House', shop).
business_founded(lot_bn_12, 1978).

%% 20 Kapor Goli -- Electronics Shop
lot(lot_bn_13, '20 Kapor Goli', nodi_gram).
lot_type(lot_bn_13, buildable).
lot_district(lot_bn_13, bazaar_para).
lot_street(lot_bn_13, kapor_goli).
lot_side(lot_bn_13, left).
lot_house_number(lot_bn_13, 20).
building(lot_bn_13, business, shop).
business(lot_bn_13, 'Digital Dokan', shop).
business_founded(lot_bn_13, 2012).

%% 28 Kapor Goli -- Gold Jewelry Shop
lot(lot_bn_14, '28 Kapor Goli', nodi_gram).
lot_type(lot_bn_14, buildable).
lot_district(lot_bn_14, bazaar_para).
lot_street(lot_bn_14, kapor_goli).
lot_side(lot_bn_14, right).
lot_house_number(lot_bn_14, 28).
building(lot_bn_14, business, shop).
business(lot_bn_14, 'Sonali Gohona Dokan', shop).
business_founded(lot_bn_14, 1955).

%% 35 Kapor Goli -- Rickshaw Garage
lot(lot_bn_15, '35 Kapor Goli', nodi_gram).
lot_type(lot_bn_15, buildable).
lot_district(lot_bn_15, bazaar_para).
lot_street(lot_bn_15, kapor_goli).
lot_side(lot_bn_15, left).
lot_house_number(lot_bn_15, 35).
building(lot_bn_15, business, workshop).
business(lot_bn_15, 'Rahim Rickshaw Garage', workshop).
business_founded(lot_bn_15, 2000).

%% 3 Mach Bazaar Road -- Fish Market
lot(lot_bn_16, '3 Mach Bazaar Road', nodi_gram).
lot_type(lot_bn_16, buildable).
lot_district(lot_bn_16, bazaar_para).
lot_street(lot_bn_16, mach_bazaar_road).
lot_side(lot_bn_16, left).
lot_house_number(lot_bn_16, 3).
building(lot_bn_16, business, market).
business(lot_bn_16, 'Nodi Gram Mach Bazaar', market).
business_founded(lot_bn_16, 1920).

%% 10 Mach Bazaar Road -- Grocery Store
lot(lot_bn_17, '10 Mach Bazaar Road', nodi_gram).
lot_type(lot_bn_17, buildable).
lot_district(lot_bn_17, bazaar_para).
lot_street(lot_bn_17, mach_bazaar_road).
lot_side(lot_bn_17, right).
lot_house_number(lot_bn_17, 10).
building(lot_bn_17, business, grocerystore).
business(lot_bn_17, 'Barkat Mudi Dokan', grocerystore).
business_founded(lot_bn_17, 1988).

%% 18 Mach Bazaar Road -- Biryani Restaurant
lot(lot_bn_18, '18 Mach Bazaar Road', nodi_gram).
lot_type(lot_bn_18, buildable).
lot_district(lot_bn_18, bazaar_para).
lot_street(lot_bn_18, mach_bazaar_road).
lot_side(lot_bn_18, left).
lot_house_number(lot_bn_18, 18).
building(lot_bn_18, business, restaurant).
business(lot_bn_18, 'Haji Biryani House', restaurant).
business_founded(lot_bn_18, 1975).

%% 25 Mach Bazaar Road -- Mobile Phone Shop
lot(lot_bn_19, '25 Mach Bazaar Road', nodi_gram).
lot_type(lot_bn_19, buildable).
lot_district(lot_bn_19, bazaar_para).
lot_street(lot_bn_19, mach_bazaar_road).
lot_side(lot_bn_19, right).
lot_house_number(lot_bn_19, 25).
building(lot_bn_19, business, shop).
business(lot_bn_19, 'Flexiload Mobile Point', shop).
business_founded(lot_bn_19, 2010).

%% 5 University Road -- University Main Building
lot(lot_bn_20, '5 University Road', nodi_gram).
lot_type(lot_bn_20, buildable).
lot_district(lot_bn_20, bishwobidyalay_para).
lot_street(lot_bn_20, university_road).
lot_side(lot_bn_20, left).
lot_house_number(lot_bn_20, 5).
building(lot_bn_20, civic, university).

%% 15 University Road -- Student Canteen
lot(lot_bn_21, '15 University Road', nodi_gram).
lot_type(lot_bn_21, buildable).
lot_district(lot_bn_21, bishwobidyalay_para).
lot_street(lot_bn_21, university_road).
lot_side(lot_bn_21, right).
lot_house_number(lot_bn_21, 15).
building(lot_bn_21, business, restaurant).
business(lot_bn_21, 'Chhatro Canteen', restaurant).
business_founded(lot_bn_21, 2005).

%% 22 University Road -- Library
lot(lot_bn_22, '22 University Road', nodi_gram).
lot_type(lot_bn_22, buildable).
lot_district(lot_bn_22, bishwobidyalay_para).
lot_street(lot_bn_22, university_road).
lot_side(lot_bn_22, left).
lot_house_number(lot_bn_22, 22).
building(lot_bn_22, civic, library).

%% 30 University Road -- Student Housing
lot(lot_bn_23, '30 University Road', nodi_gram).
lot_type(lot_bn_23, buildable).
lot_district(lot_bn_23, bishwobidyalay_para).
lot_street(lot_bn_23, university_road).
lot_side(lot_bn_23, right).
lot_house_number(lot_bn_23, 30).
building(lot_bn_23, residence, apartment).

%% 8 Shikkha Lane -- Language Center
lot(lot_bn_24, '8 Shikkha Lane', nodi_gram).
lot_type(lot_bn_24, buildable).
lot_district(lot_bn_24, bishwobidyalay_para).
lot_street(lot_bn_24, shikkha_lane).
lot_side(lot_bn_24, left).
lot_house_number(lot_bn_24, 8).
building(lot_bn_24, business, school).
business(lot_bn_24, 'Bhasha Shikkha Kendra', school).
business_founded(lot_bn_24, 2008).

%% 16 Shikkha Lane -- Copy and Print Shop
lot(lot_bn_25, '16 Shikkha Lane', nodi_gram).
lot_type(lot_bn_25, buildable).
lot_district(lot_bn_25, bishwobidyalay_para).
lot_street(lot_bn_25, shikkha_lane).
lot_side(lot_bn_25, right).
lot_house_number(lot_bn_25, 16).
building(lot_bn_25, business, shop).
business(lot_bn_25, 'Photocopy Corner', shop).
business_founded(lot_bn_25, 2003).

%% 24 Shikkha Lane -- Residence
lot(lot_bn_26, '24 Shikkha Lane', nodi_gram).
lot_type(lot_bn_26, buildable).
lot_district(lot_bn_26, bishwobidyalay_para).
lot_street(lot_bn_26, shikkha_lane).
lot_side(lot_bn_26, left).
lot_house_number(lot_bn_26, 24).
building(lot_bn_26, residence, apartment).

%% 5 Ghat Road -- Boat Landing
lot(lot_bn_27, '5 Ghat Road', nodi_gram).
lot_type(lot_bn_27, buildable).
lot_district(lot_bn_27, nodi_ghat).
lot_street(lot_bn_27, ghat_road).
lot_side(lot_bn_27, left).
lot_house_number(lot_bn_27, 5).
building(lot_bn_27, civic, dock).

%% 12 Ghat Road -- Hilsa Fish Restaurant
lot(lot_bn_28, '12 Ghat Road', nodi_gram).
lot_type(lot_bn_28, buildable).
lot_district(lot_bn_28, nodi_ghat).
lot_street(lot_bn_28, ghat_road).
lot_side(lot_bn_28, right).
lot_house_number(lot_bn_28, 12).
building(lot_bn_28, business, restaurant).
business(lot_bn_28, 'Ilish Bhater Hotel', restaurant).
business_founded(lot_bn_28, 1992).

%% 20 Ghat Road -- Pottery Workshop
lot(lot_bn_29, '20 Ghat Road', nodi_gram).
lot_type(lot_bn_29, buildable).
lot_district(lot_bn_29, nodi_ghat).
lot_street(lot_bn_29, ghat_road).
lot_side(lot_bn_29, left).
lot_house_number(lot_bn_29, 20).
building(lot_bn_29, business, workshop).
business(lot_bn_29, 'Mati Shilpo Studio', workshop).
business_founded(lot_bn_29, 1985).

%% 28 Ghat Road -- Residence
lot(lot_bn_30, '28 Ghat Road', nodi_gram).
lot_type(lot_bn_30, buildable).
lot_district(lot_bn_30, nodi_ghat).
lot_street(lot_bn_30, ghat_road).
lot_side(lot_bn_30, right).
lot_house_number(lot_bn_30, 28).
building(lot_bn_30, residence, house).

%% Shonar Gaon Village Lots

%% 3 Dhan Khet Path -- Village Mosque
lot(lot_bn_31, '3 Dhan Khet Path', shonar_gaon).
lot_type(lot_bn_31, buildable).
lot_district(lot_bn_31, gram_kendra).
lot_street(lot_bn_31, dhan_khet_path).
lot_side(lot_bn_31, left).
lot_house_number(lot_bn_31, 3).
building(lot_bn_31, civic, mosque).

%% 10 Dhan Khet Path -- General Store
lot(lot_bn_32, '10 Dhan Khet Path', shonar_gaon).
lot_type(lot_bn_32, buildable).
lot_district(lot_bn_32, gram_kendra).
lot_street(lot_bn_32, dhan_khet_path).
lot_side(lot_bn_32, right).
lot_house_number(lot_bn_32, 10).
building(lot_bn_32, business, shop).
business(lot_bn_32, 'Aziz Mudi Dokan', shop).
business_founded(lot_bn_32, 1970).

%% 5 Nodi Par Path -- Rice Mill
lot(lot_bn_33, '5 Nodi Par Path', shonar_gaon).
lot_type(lot_bn_33, buildable).
lot_district(lot_bn_33, gram_kendra).
lot_street(lot_bn_33, nodi_par_path).
lot_side(lot_bn_33, left).
lot_house_number(lot_bn_33, 5).
building(lot_bn_33, business, workshop).
business(lot_bn_33, 'Shonar Gaon Dhaner Kol', workshop).
business_founded(lot_bn_33, 1950).

%% 12 Nodi Par Path -- Residence
lot(lot_bn_34, '12 Nodi Par Path', shonar_gaon).
lot_type(lot_bn_34, buildable).
lot_district(lot_bn_34, gram_kendra).
lot_street(lot_bn_34, nodi_par_path).
lot_side(lot_bn_34, right).
lot_house_number(lot_bn_34, 12).
building(lot_bn_34, residence, house).

%% 20 Nodi Par Path -- Residence
lot(lot_bn_35, '20 Nodi Par Path', shonar_gaon).
lot_type(lot_bn_35, buildable).
lot_district(lot_bn_35, gram_kendra).
lot_street(lot_bn_35, nodi_par_path).
lot_side(lot_bn_35, left).
lot_house_number(lot_bn_35, 20).
building(lot_bn_35, residence, house).
