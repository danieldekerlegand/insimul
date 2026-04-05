%% Insimul Locations (Lots): Japanese Town
%% Source: data/worlds/language/japanese/locations.pl
%% Created: 2026-04-03
%% Total: 35 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% 1 Eki-dori -- Sakuragawa Station
lot(lot_jp_1, '1 Eki-dori', sakuragawa).
lot_type(lot_jp_1, buildable).
lot_district(lot_jp_1, ekimae).
lot_street(lot_jp_1, eki_dori).
lot_side(lot_jp_1, left).
lot_house_number(lot_jp_1, 1).
building(lot_jp_1, civic, train_station).

%% 5 Eki-dori -- Konbini FamilyMart
lot(lot_jp_2, '5 Eki-dori', sakuragawa).
lot_type(lot_jp_2, buildable).
lot_district(lot_jp_2, ekimae).
lot_street(lot_jp_2, eki_dori).
lot_side(lot_jp_2, right).
lot_house_number(lot_jp_2, 5).
building(lot_jp_2, business, konbini).
business(lot_jp_2, 'FamilyMart Ekimae', konbini).
business_founded(lot_jp_2, 2005).

%% 10 Eki-dori -- Ramen Shop
lot(lot_jp_3, '10 Eki-dori', sakuragawa).
lot_type(lot_jp_3, buildable).
lot_district(lot_jp_3, ekimae).
lot_street(lot_jp_3, eki_dori).
lot_side(lot_jp_3, left).
lot_house_number(lot_jp_3, 10).
building(lot_jp_3, business, restaurant).
business(lot_jp_3, 'Ramen Ichiban', restaurant).
business_founded(lot_jp_3, 1998).

%% 15 Eki-dori -- Karaoke Box
lot(lot_jp_4, '15 Eki-dori', sakuragawa).
lot_type(lot_jp_4, buildable).
lot_district(lot_jp_4, ekimae).
lot_street(lot_jp_4, eki_dori).
lot_side(lot_jp_4, right).
lot_house_number(lot_jp_4, 15).
building(lot_jp_4, business, entertainment).
business(lot_jp_4, 'Karaoke Paradise', entertainment).
business_founded(lot_jp_4, 2010).

%% 3 Sakura-dori -- Izakaya Tanuki
lot(lot_jp_5, '3 Sakura-dori', sakuragawa).
lot_type(lot_jp_5, buildable).
lot_district(lot_jp_5, ekimae).
lot_street(lot_jp_5, sakura_dori).
lot_side(lot_jp_5, left).
lot_house_number(lot_jp_5, 3).
building(lot_jp_5, business, izakaya).
business(lot_jp_5, 'Izakaya Tanuki', izakaya).
business_founded(lot_jp_5, 1985).

%% 8 Sakura-dori -- Pharmacy
lot(lot_jp_6, '8 Sakura-dori', sakuragawa).
lot_type(lot_jp_6, buildable).
lot_district(lot_jp_6, ekimae).
lot_street(lot_jp_6, sakura_dori).
lot_side(lot_jp_6, right).
lot_house_number(lot_jp_6, 8).
building(lot_jp_6, business, pharmacy).
business(lot_jp_6, 'Kusuri no Sakura', pharmacy).
business_founded(lot_jp_6, 2000).

%% 14 Sakura-dori -- Residence
lot(lot_jp_7, '14 Sakura-dori', sakuragawa).
lot_type(lot_jp_7, buildable).
lot_district(lot_jp_7, ekimae).
lot_street(lot_jp_7, sakura_dori).
lot_side(lot_jp_7, left).
lot_house_number(lot_jp_7, 14).
building(lot_jp_7, residence, apartment).

%% 20 Sakura-dori -- Residence
lot(lot_jp_8, '20 Sakura-dori', sakuragawa).
lot_type(lot_jp_8, buildable).
lot_district(lot_jp_8, ekimae).
lot_street(lot_jp_8, sakura_dori).
lot_side(lot_jp_8, right).
lot_house_number(lot_jp_8, 20).
building(lot_jp_8, residence, apartment).

%% 2 Shotengai-dori -- Yaoya (Greengrocer)
lot(lot_jp_9, '2 Shotengai-dori', sakuragawa).
lot_type(lot_jp_9, buildable).
lot_district(lot_jp_9, shotengai).
lot_street(lot_jp_9, shotengai_dori).
lot_side(lot_jp_9, left).
lot_house_number(lot_jp_9, 2).
building(lot_jp_9, business, greengrocer).
business(lot_jp_9, 'Yaoya Midori', greengrocer).
business_founded(lot_jp_9, 1960).

%% 7 Shotengai-dori -- Tofu Shop
lot(lot_jp_10, '7 Shotengai-dori', sakuragawa).
lot_type(lot_jp_10, buildable).
lot_district(lot_jp_10, shotengai).
lot_street(lot_jp_10, shotengai_dori).
lot_side(lot_jp_10, right).
lot_house_number(lot_jp_10, 7).
building(lot_jp_10, business, shop).
business(lot_jp_10, 'Tofu-ya Yamamoto', shop).
business_founded(lot_jp_10, 1950).

%% 12 Shotengai-dori -- Bookstore
lot(lot_jp_11, '12 Shotengai-dori', sakuragawa).
lot_type(lot_jp_11, buildable).
lot_district(lot_jp_11, shotengai).
lot_street(lot_jp_11, shotengai_dori).
lot_side(lot_jp_11, left).
lot_house_number(lot_jp_11, 12).
building(lot_jp_11, business, bookstore).
business(lot_jp_11, 'Honya Bunko', bookstore).
business_founded(lot_jp_11, 1975).

%% 17 Shotengai-dori -- Taiyaki Stand
lot(lot_jp_12, '17 Shotengai-dori', sakuragawa).
lot_type(lot_jp_12, buildable).
lot_district(lot_jp_12, shotengai).
lot_street(lot_jp_12, shotengai_dori).
lot_side(lot_jp_12, right).
lot_house_number(lot_jp_12, 17).
building(lot_jp_12, business, food_stall).
business(lot_jp_12, 'Taiyaki Kintaro', food_stall).
business_founded(lot_jp_12, 1988).

%% 22 Shotengai-dori -- Sento (Public Bath)
lot(lot_jp_13, '22 Shotengai-dori', sakuragawa).
lot_type(lot_jp_13, buildable).
lot_district(lot_jp_13, shotengai).
lot_street(lot_jp_13, shotengai_dori).
lot_side(lot_jp_13, left).
lot_house_number(lot_jp_13, 22).
building(lot_jp_13, business, bathhouse).
business(lot_jp_13, 'Matsu no Yu', bathhouse).
business_founded(lot_jp_13, 1955).

%% 3 Ichiba-dori -- Fish Market
lot(lot_jp_14, '3 Ichiba-dori', sakuragawa).
lot_type(lot_jp_14, buildable).
lot_district(lot_jp_14, shotengai).
lot_street(lot_jp_14, ichiba_dori).
lot_side(lot_jp_14, left).
lot_house_number(lot_jp_14, 3).
building(lot_jp_14, business, market).
business(lot_jp_14, 'Uogashi Ichiba', market).
business_founded(lot_jp_14, 1935).

%% 10 Ichiba-dori -- Sake Shop
lot(lot_jp_15, '10 Ichiba-dori', sakuragawa).
lot_type(lot_jp_15, buildable).
lot_district(lot_jp_15, shotengai).
lot_street(lot_jp_15, ichiba_dori).
lot_side(lot_jp_15, right).
lot_house_number(lot_jp_15, 10).
building(lot_jp_15, business, shop).
business(lot_jp_15, 'Sakaya Tsuki', shop).
business_founded(lot_jp_15, 1970).

%% 15 Ichiba-dori -- Wagashi (Sweets) Shop
lot(lot_jp_16, '15 Ichiba-dori', sakuragawa).
lot_type(lot_jp_16, buildable).
lot_district(lot_jp_16, shotengai).
lot_street(lot_jp_16, ichiba_dori).
lot_side(lot_jp_16, left).
lot_house_number(lot_jp_16, 15).
building(lot_jp_16, business, shop).
business(lot_jp_16, 'Wagashi Hanami', shop).
business_founded(lot_jp_16, 1965).

%% 2 Tera-dori -- Komyoji Temple
lot(lot_jp_17, '2 Tera-dori', sakuragawa).
lot_type(lot_jp_17, buildable).
lot_district(lot_jp_17, teramachi).
lot_street(lot_jp_17, tera_dori).
lot_side(lot_jp_17, left).
lot_house_number(lot_jp_17, 2).
building(lot_jp_17, civic, temple).

%% 8 Tera-dori -- Shinto Shrine
lot(lot_jp_18, '8 Tera-dori', sakuragawa).
lot_type(lot_jp_18, buildable).
lot_district(lot_jp_18, teramachi).
lot_street(lot_jp_18, tera_dori).
lot_side(lot_jp_18, right).
lot_house_number(lot_jp_18, 8).
building(lot_jp_18, civic, shrine).

%% 14 Tera-dori -- Tea House
lot(lot_jp_19, '14 Tera-dori', sakuragawa).
lot_type(lot_jp_19, buildable).
lot_district(lot_jp_19, teramachi).
lot_street(lot_jp_19, tera_dori).
lot_side(lot_jp_19, left).
lot_house_number(lot_jp_19, 14).
building(lot_jp_19, business, teahouse).
business(lot_jp_19, 'Chashitsu Rikyu', teahouse).
business_founded(lot_jp_19, 1920).

%% 20 Tera-dori -- Residence
lot(lot_jp_20, '20 Tera-dori', sakuragawa).
lot_type(lot_jp_20, buildable).
lot_district(lot_jp_20, teramachi).
lot_street(lot_jp_20, tera_dori).
lot_side(lot_jp_20, right).
lot_house_number(lot_jp_20, 20).
building(lot_jp_20, residence, house).

%% 5 Kawa-dori -- Pottery Studio
lot(lot_jp_21, '5 Kawa-dori', sakuragawa).
lot_type(lot_jp_21, buildable).
lot_district(lot_jp_21, teramachi).
lot_street(lot_jp_21, kawa_dori).
lot_side(lot_jp_21, left).
lot_house_number(lot_jp_21, 5).
building(lot_jp_21, business, workshop).
business(lot_jp_21, 'Togei Kobo Kawa', workshop).
business_founded(lot_jp_21, 2002).

%% 12 Kawa-dori -- Residence
lot(lot_jp_22, '12 Kawa-dori', sakuragawa).
lot_type(lot_jp_22, buildable).
lot_district(lot_jp_22, teramachi).
lot_street(lot_jp_22, kawa_dori).
lot_side(lot_jp_22, right).
lot_house_number(lot_jp_22, 12).
building(lot_jp_22, residence, house).

%% 3 Office-dori -- Office Building
lot(lot_jp_23, '3 Office-dori', sakuragawa).
lot_type(lot_jp_23, buildable).
lot_district(lot_jp_23, shinseikatsu).
lot_street(lot_jp_23, office_dori).
lot_side(lot_jp_23, left).
lot_house_number(lot_jp_23, 3).
building(lot_jp_23, business, office).
business(lot_jp_23, 'Sakuragawa Business Center', office).
business_founded(lot_jp_23, 1995).

%% 10 Office-dori -- Language School
lot(lot_jp_24, '10 Office-dori', sakuragawa).
lot_type(lot_jp_24, buildable).
lot_district(lot_jp_24, shinseikatsu).
lot_street(lot_jp_24, office_dori).
lot_side(lot_jp_24, right).
lot_house_number(lot_jp_24, 10).
building(lot_jp_24, business, school).
business(lot_jp_24, 'Nihongo Gakuen', school).
business_founded(lot_jp_24, 2008).

%% 18 Office-dori -- Cafe
lot(lot_jp_25, '18 Office-dori', sakuragawa).
lot_type(lot_jp_25, buildable).
lot_district(lot_jp_25, shinseikatsu).
lot_street(lot_jp_25, office_dori).
lot_side(lot_jp_25, left).
lot_house_number(lot_jp_25, 18).
building(lot_jp_25, business, cafe).
business(lot_jp_25, 'Kissaten Komorebi', cafe).
business_founded(lot_jp_25, 2015).

%% 25 Office-dori -- Residence
lot(lot_jp_26, '25 Office-dori', sakuragawa).
lot_type(lot_jp_26, buildable).
lot_district(lot_jp_26, shinseikatsu).
lot_street(lot_jp_26, office_dori).
lot_side(lot_jp_26, right).
lot_house_number(lot_jp_26, 25).
building(lot_jp_26, residence, apartment).

%% 5 Midori-dori -- Supermarket
lot(lot_jp_27, '5 Midori-dori', sakuragawa).
lot_type(lot_jp_27, buildable).
lot_district(lot_jp_27, shinseikatsu).
lot_street(lot_jp_27, midori_dori).
lot_side(lot_jp_27, left).
lot_house_number(lot_jp_27, 5).
building(lot_jp_27, business, supermarket).
business(lot_jp_27, 'Supa Midori', supermarket).
business_founded(lot_jp_27, 2010).

%% 12 Midori-dori -- Park
lot(lot_jp_28, '12 Midori-dori', sakuragawa).
lot_type(lot_jp_28, buildable).
lot_district(lot_jp_28, shinseikatsu).
lot_street(lot_jp_28, midori_dori).
lot_side(lot_jp_28, right).
lot_house_number(lot_jp_28, 12).
building(lot_jp_28, civic, park).

%% 20 Midori-dori -- Fitness Gym
lot(lot_jp_29, '20 Midori-dori', sakuragawa).
lot_type(lot_jp_29, buildable).
lot_district(lot_jp_29, shinseikatsu).
lot_street(lot_jp_29, midori_dori).
lot_side(lot_jp_29, left).
lot_house_number(lot_jp_29, 20).
building(lot_jp_29, business, gym).
business(lot_jp_29, 'Sports Club Genki', gym).
business_founded(lot_jp_29, 2012).

%% 28 Midori-dori -- Residence
lot(lot_jp_30, '28 Midori-dori', sakuragawa).
lot_type(lot_jp_30, buildable).
lot_district(lot_jp_30, shinseikatsu).
lot_street(lot_jp_30, midori_dori).
lot_side(lot_jp_30, right).
lot_house_number(lot_jp_30, 28).
building(lot_jp_30, residence, apartment).

%% Yamanoue Village Lots

%% 3 Yama-dori -- Village Shrine
lot(lot_jp_31, '3 Yama-dori', yamanoue).
lot_type(lot_jp_31, buildable).
lot_district(lot_jp_31, mura_center).
lot_street(lot_jp_31, yama_dori).
lot_side(lot_jp_31, left).
lot_house_number(lot_jp_31, 3).
building(lot_jp_31, civic, shrine).

%% 8 Yama-dori -- General Store
lot(lot_jp_32, '8 Yama-dori', yamanoue).
lot_type(lot_jp_32, buildable).
lot_district(lot_jp_32, mura_center).
lot_street(lot_jp_32, yama_dori).
lot_side(lot_jp_32, right).
lot_house_number(lot_jp_32, 8).
building(lot_jp_32, business, shop).
business(lot_jp_32, 'Yorozuya Yamanoue', shop).
business_founded(lot_jp_32, 1960).

%% 5 Tanbo-dori -- Soba Restaurant
lot(lot_jp_33, '5 Tanbo-dori', yamanoue).
lot_type(lot_jp_33, buildable).
lot_district(lot_jp_33, mura_center).
lot_street(lot_jp_33, tanbo_dori).
lot_side(lot_jp_33, left).
lot_house_number(lot_jp_33, 5).
building(lot_jp_33, business, restaurant).
business(lot_jp_33, 'Soba Dokoro Yama', restaurant).
business_founded(lot_jp_33, 1980).

%% 10 Tanbo-dori -- Residence
lot(lot_jp_34, '10 Tanbo-dori', yamanoue).
lot_type(lot_jp_34, buildable).
lot_district(lot_jp_34, mura_center).
lot_street(lot_jp_34, tanbo_dori).
lot_side(lot_jp_34, right).
lot_house_number(lot_jp_34, 10).
building(lot_jp_34, residence, house).

%% 15 Tanbo-dori -- Residence
lot(lot_jp_35, '15 Tanbo-dori', yamanoue).
lot_type(lot_jp_35, buildable).
lot_district(lot_jp_35, mura_center).
lot_street(lot_jp_35, tanbo_dori).
lot_side(lot_jp_35, left).
lot_house_number(lot_jp_35, 15).
building(lot_jp_35, residence, house).
