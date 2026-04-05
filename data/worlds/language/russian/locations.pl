%% Insimul Locations (Lots): Russian Volga Town
%% Source: data/worlds/language/russian/locations.pl
%% Created: 2026-04-03
%% Total: 35 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% 5 Ulitsa Lenina -- Cafe Samovar
lot(lot_ru_1, '5 Ulitsa Lenina', volzhansk).
lot_type(lot_ru_1, buildable).
lot_district(lot_ru_1, stary_gorod).
lot_street(lot_ru_1, ulitsa_lenina).
lot_side(lot_ru_1, left).
lot_house_number(lot_ru_1, 5).
building(lot_ru_1, business, cafe).
business(lot_ru_1, 'Kafe Samovar', cafe).
business_founded(lot_ru_1, 2003).

%% 12 Ulitsa Lenina -- Pharmacy
lot(lot_ru_2, '12 Ulitsa Lenina', volzhansk).
lot_type(lot_ru_2, buildable).
lot_district(lot_ru_2, stary_gorod).
lot_street(lot_ru_2, ulitsa_lenina).
lot_side(lot_ru_2, right).
lot_house_number(lot_ru_2, 12).
building(lot_ru_2, business, pharmacy).
business(lot_ru_2, 'Apteka Zdorovye', pharmacy).
business_founded(lot_ru_2, 1995).

%% 20 Ulitsa Lenina -- Bakery
lot(lot_ru_3, '20 Ulitsa Lenina', volzhansk).
lot_type(lot_ru_3, buildable).
lot_district(lot_ru_3, stary_gorod).
lot_street(lot_ru_3, ulitsa_lenina).
lot_side(lot_ru_3, left).
lot_house_number(lot_ru_3, 20).
building(lot_ru_3, business, bakery).
business(lot_ru_3, 'Bulochnaya Kolosok', bakery).
business_founded(lot_ru_3, 1988).

%% 28 Ulitsa Lenina -- Residence
lot(lot_ru_4, '28 Ulitsa Lenina', volzhansk).
lot_type(lot_ru_4, buildable).
lot_district(lot_ru_4, stary_gorod).
lot_street(lot_ru_4, ulitsa_lenina).
lot_side(lot_ru_4, right).
lot_house_number(lot_ru_4, 28).
building(lot_ru_4, residence, house).

%% 5 Ulitsa Pushkina -- Bookstore
lot(lot_ru_5, '5 Ulitsa Pushkina', volzhansk).
lot_type(lot_ru_5, buildable).
lot_district(lot_ru_5, stary_gorod).
lot_street(lot_ru_5, ulitsa_pushkina).
lot_side(lot_ru_5, left).
lot_house_number(lot_ru_5, 5).
building(lot_ru_5, business, bookstore).
business(lot_ru_5, 'Knizhny Mir', bookstore).
business_founded(lot_ru_5, 1992).

%% 14 Ulitsa Pushkina -- Souvenir Shop
lot(lot_ru_6, '14 Ulitsa Pushkina', volzhansk).
lot_type(lot_ru_6, buildable).
lot_district(lot_ru_6, stary_gorod).
lot_street(lot_ru_6, ulitsa_pushkina).
lot_side(lot_ru_6, right).
lot_house_number(lot_ru_6, 14).
building(lot_ru_6, business, shop).
business(lot_ru_6, 'Suveniry Volgi', shop).
business_founded(lot_ru_6, 2008).

%% 22 Ulitsa Pushkina -- Residence
lot(lot_ru_7, '22 Ulitsa Pushkina', volzhansk).
lot_type(lot_ru_7, buildable).
lot_district(lot_ru_7, stary_gorod).
lot_street(lot_ru_7, ulitsa_pushkina).
lot_side(lot_ru_7, left).
lot_house_number(lot_ru_7, 22).
building(lot_ru_7, residence, apartment).

%% 3 Ulitsa Sobornaya -- Cathedral of the Intercession
lot(lot_ru_8, '3 Ulitsa Sobornaya', volzhansk).
lot_type(lot_ru_8, buildable).
lot_district(lot_ru_8, stary_gorod).
lot_street(lot_ru_8, ulitsa_sobornaya).
lot_side(lot_ru_8, left).
lot_house_number(lot_ru_8, 3).
building(lot_ru_8, civic, church).

%% 12 Ulitsa Sobornaya -- Art Gallery
lot(lot_ru_9, '12 Ulitsa Sobornaya', volzhansk).
lot_type(lot_ru_9, buildable).
lot_district(lot_ru_9, stary_gorod).
lot_street(lot_ru_9, ulitsa_sobornaya).
lot_side(lot_ru_9, right).
lot_house_number(lot_ru_9, 12).
building(lot_ru_9, business, gallery).
business(lot_ru_9, 'Galereya Volzhskiye Kraski', gallery).
business_founded(lot_ru_9, 2010).

%% 20 Ulitsa Sobornaya -- Residence
lot(lot_ru_10, '20 Ulitsa Sobornaya', volzhansk).
lot_type(lot_ru_10, buildable).
lot_district(lot_ru_10, stary_gorod).
lot_street(lot_ru_10, ulitsa_sobornaya).
lot_side(lot_ru_10, left).
lot_house_number(lot_ru_10, 20).
building(lot_ru_10, residence, house).

%% 5 Prospekt Mira -- Central Market
lot(lot_ru_11, '5 Prospekt Mira', volzhansk).
lot_type(lot_ru_11, buildable).
lot_district(lot_ru_11, sovetsky_rayon).
lot_street(lot_ru_11, prospekt_mira).
lot_side(lot_ru_11, left).
lot_house_number(lot_ru_11, 5).
building(lot_ru_11, business, market).
business(lot_ru_11, 'Tsentralny Rynok', market).
business_founded(lot_ru_11, 1950).

%% 15 Prospekt Mira -- Supermarket
lot(lot_ru_12, '15 Prospekt Mira', volzhansk).
lot_type(lot_ru_12, buildable).
lot_district(lot_ru_12, sovetsky_rayon).
lot_street(lot_ru_12, prospekt_mira).
lot_side(lot_ru_12, right).
lot_house_number(lot_ru_12, 15).
building(lot_ru_12, business, grocerystore).
business(lot_ru_12, 'Universam Yelka', grocerystore).
business_founded(lot_ru_12, 2005).

%% 25 Prospekt Mira -- Post Office
lot(lot_ru_13, '25 Prospekt Mira', volzhansk).
lot_type(lot_ru_13, buildable).
lot_district(lot_ru_13, sovetsky_rayon).
lot_street(lot_ru_13, prospekt_mira).
lot_side(lot_ru_13, left).
lot_house_number(lot_ru_13, 25).
building(lot_ru_13, civic, post_office).

%% 35 Prospekt Mira -- Residence (Soviet apartment block)
lot(lot_ru_14, '35 Prospekt Mira', volzhansk).
lot_type(lot_ru_14, buildable).
lot_district(lot_ru_14, sovetsky_rayon).
lot_street(lot_ru_14, prospekt_mira).
lot_side(lot_ru_14, right).
lot_house_number(lot_ru_14, 35).
building(lot_ru_14, residence, apartment).

%% 8 Ulitsa Gagarina -- Banya (Bathhouse)
lot(lot_ru_15, '8 Ulitsa Gagarina', volzhansk).
lot_type(lot_ru_15, buildable).
lot_district(lot_ru_15, sovetsky_rayon).
lot_street(lot_ru_15, ulitsa_gagarina).
lot_side(lot_ru_15, left).
lot_house_number(lot_ru_15, 8).
building(lot_ru_15, business, bathhouse).
business(lot_ru_15, 'Banya na Gagarina', bathhouse).
business_founded(lot_ru_15, 1960).

%% 18 Ulitsa Gagarina -- Electronics Shop
lot(lot_ru_16, '18 Ulitsa Gagarina', volzhansk).
lot_type(lot_ru_16, buildable).
lot_district(lot_ru_16, sovetsky_rayon).
lot_street(lot_ru_16, ulitsa_gagarina).
lot_side(lot_ru_16, right).
lot_house_number(lot_ru_16, 18).
building(lot_ru_16, business, shop).
business(lot_ru_16, 'Tekhnomir', shop).
business_founded(lot_ru_16, 2012).

%% 26 Ulitsa Gagarina -- Residence
lot(lot_ru_17, '26 Ulitsa Gagarina', volzhansk).
lot_type(lot_ru_17, buildable).
lot_district(lot_ru_17, sovetsky_rayon).
lot_street(lot_ru_17, ulitsa_gagarina).
lot_side(lot_ru_17, left).
lot_house_number(lot_ru_17, 26).
building(lot_ru_17, residence, apartment).

%% 5 Naberezhnaya Volgi -- River Restaurant
lot(lot_ru_18, '5 Naberezhnaya Volgi', volzhansk).
lot_type(lot_ru_18, buildable).
lot_district(lot_ru_18, naberezhnaya).
lot_street(lot_ru_18, naberezhnaya_volgi).
lot_side(lot_ru_18, left).
lot_house_number(lot_ru_18, 5).
building(lot_ru_18, business, restaurant).
business(lot_ru_18, 'Restoran Volzhskiye Zori', restaurant).
business_founded(lot_ru_18, 2000).

%% 15 Naberezhnaya Volgi -- Ice Cream Parlor
lot(lot_ru_19, '15 Naberezhnaya Volgi', volzhansk).
lot_type(lot_ru_19, buildable).
lot_district(lot_ru_19, naberezhnaya).
lot_street(lot_ru_19, naberezhnaya_volgi).
lot_side(lot_ru_19, right).
lot_house_number(lot_ru_19, 15).
building(lot_ru_19, business, shop).
business(lot_ru_19, 'Morozhenoe u Volgi', shop).
business_founded(lot_ru_19, 2015).

%% 25 Naberezhnaya Volgi -- Hotel
lot(lot_ru_20, '25 Naberezhnaya Volgi', volzhansk).
lot_type(lot_ru_20, buildable).
lot_district(lot_ru_20, naberezhnaya).
lot_street(lot_ru_20, naberezhnaya_volgi).
lot_side(lot_ru_20, left).
lot_house_number(lot_ru_20, 25).
building(lot_ru_20, business, hotel).
business(lot_ru_20, 'Gostinitsa Volga', hotel).
business_founded(lot_ru_20, 1998).

%% 35 Naberezhnaya Volgi -- Residence
lot(lot_ru_21, '35 Naberezhnaya Volgi', volzhansk).
lot_type(lot_ru_21, buildable).
lot_district(lot_ru_21, naberezhnaya).
lot_street(lot_ru_21, naberezhnaya_volgi).
lot_side(lot_ru_21, right).
lot_house_number(lot_ru_21, 35).
building(lot_ru_21, residence, apartment).

%% 10 Ulitsa Rechnaya -- Train Station
lot(lot_ru_22, '10 Ulitsa Rechnaya', volzhansk).
lot_type(lot_ru_22, buildable).
lot_district(lot_ru_22, naberezhnaya).
lot_street(lot_ru_22, ulitsa_rechnaya).
lot_side(lot_ru_22, left).
lot_house_number(lot_ru_22, 10).
building(lot_ru_22, civic, train_station).

%% 20 Ulitsa Rechnaya -- Fitness Club
lot(lot_ru_23, '20 Ulitsa Rechnaya', volzhansk).
lot_type(lot_ru_23, buildable).
lot_district(lot_ru_23, naberezhnaya).
lot_street(lot_ru_23, ulitsa_rechnaya).
lot_side(lot_ru_23, right).
lot_house_number(lot_ru_23, 20).
building(lot_ru_23, business, gym).
business(lot_ru_23, 'Fitnes Klub Sila', gym).
business_founded(lot_ru_23, 2014).

%% 5 Ulitsa Universitetskaya -- University Main Building
lot(lot_ru_24, '5 Ulitsa Universitetskaya', volzhansk).
lot_type(lot_ru_24, buildable).
lot_district(lot_ru_24, universitetsky).
lot_street(lot_ru_24, ulitsa_universitetskaya).
lot_side(lot_ru_24, left).
lot_house_number(lot_ru_24, 5).
building(lot_ru_24, civic, university).

%% 15 Ulitsa Universitetskaya -- Student Cafe
lot(lot_ru_25, '15 Ulitsa Universitetskaya', volzhansk).
lot_type(lot_ru_25, buildable).
lot_district(lot_ru_25, universitetsky).
lot_street(lot_ru_25, ulitsa_universitetskaya).
lot_side(lot_ru_25, right).
lot_house_number(lot_ru_25, 15).
building(lot_ru_25, business, cafe).
business(lot_ru_25, 'Kafe Studencheskoye', cafe).
business_founded(lot_ru_25, 2010).

%% 25 Ulitsa Universitetskaya -- Library
lot(lot_ru_26, '25 Ulitsa Universitetskaya', volzhansk).
lot_type(lot_ru_26, buildable).
lot_district(lot_ru_26, universitetsky).
lot_street(lot_ru_26, ulitsa_universitetskaya).
lot_side(lot_ru_26, left).
lot_house_number(lot_ru_26, 25).
building(lot_ru_26, civic, library).

%% 8 Ulitsa Studencheskaya -- Language School
lot(lot_ru_27, '8 Ulitsa Studencheskaya', volzhansk).
lot_type(lot_ru_27, buildable).
lot_district(lot_ru_27, universitetsky).
lot_street(lot_ru_27, ulitsa_studencheskaya).
lot_side(lot_ru_27, left).
lot_house_number(lot_ru_27, 8).
building(lot_ru_27, business, school).
business(lot_ru_27, 'Shkola Russkogo Yazyka', school).
business_founded(lot_ru_27, 2006).

%% 16 Ulitsa Studencheskaya -- Stolovaya (Canteen)
lot(lot_ru_28, '16 Ulitsa Studencheskaya', volzhansk).
lot_type(lot_ru_28, buildable).
lot_district(lot_ru_28, universitetsky).
lot_street(lot_ru_28, ulitsa_studencheskaya).
lot_side(lot_ru_28, right).
lot_house_number(lot_ru_28, 16).
building(lot_ru_28, business, restaurant).
business(lot_ru_28, 'Stolovaya Druzhba', restaurant).
business_founded(lot_ru_28, 1975).

%% 24 Ulitsa Studencheskaya -- Student Housing
lot(lot_ru_29, '24 Ulitsa Studencheskaya', volzhansk).
lot_type(lot_ru_29, buildable).
lot_district(lot_ru_29, universitetsky).
lot_street(lot_ru_29, ulitsa_studencheskaya).
lot_side(lot_ru_29, left).
lot_house_number(lot_ru_29, 24).
building(lot_ru_29, residence, apartment).

%% 32 Ulitsa Studencheskaya -- Copy Shop
lot(lot_ru_30, '32 Ulitsa Studencheskaya', volzhansk).
lot_type(lot_ru_30, buildable).
lot_district(lot_ru_30, universitetsky).
lot_street(lot_ru_30, ulitsa_studencheskaya).
lot_side(lot_ru_30, right).
lot_house_number(lot_ru_30, 32).
building(lot_ru_30, business, shop).
business(lot_ru_30, 'Kopitsentr Znanie', shop).
business_founded(lot_ru_30, 2009).

%% Rybachye Village Lots

%% 3 Ulitsa Rybnaya -- Village Church
lot(lot_ru_31, '3 Ulitsa Rybnaya', rybachye).
lot_type(lot_ru_31, buildable).
lot_district(lot_ru_31, tsentr_sela).
lot_street(lot_ru_31, ulitsa_rybnaya).
lot_side(lot_ru_31, left).
lot_house_number(lot_ru_31, 3).
building(lot_ru_31, civic, church).

%% 10 Ulitsa Rybnaya -- General Store
lot(lot_ru_32, '10 Ulitsa Rybnaya', rybachye).
lot_type(lot_ru_32, buildable).
lot_district(lot_ru_32, tsentr_sela).
lot_street(lot_ru_32, ulitsa_rybnaya).
lot_side(lot_ru_32, right).
lot_house_number(lot_ru_32, 10).
building(lot_ru_32, business, shop).
business(lot_ru_32, 'Magazin U Reki', shop).
business_founded(lot_ru_32, 1965).

%% 5 Ulitsa Beregovaya -- Fish Smokehouse
lot(lot_ru_33, '5 Ulitsa Beregovaya', rybachye).
lot_type(lot_ru_33, buildable).
lot_district(lot_ru_33, tsentr_sela).
lot_street(lot_ru_33, ulitsa_beregovaya).
lot_side(lot_ru_33, left).
lot_house_number(lot_ru_33, 5).
building(lot_ru_33, business, workshop).
business(lot_ru_33, 'Koptilnya Rybachye', workshop).
business_founded(lot_ru_33, 1940).

%% 12 Ulitsa Beregovaya -- Residence
lot(lot_ru_34, '12 Ulitsa Beregovaya', rybachye).
lot_type(lot_ru_34, buildable).
lot_district(lot_ru_34, tsentr_sela).
lot_street(lot_ru_34, ulitsa_beregovaya).
lot_side(lot_ru_34, right).
lot_house_number(lot_ru_34, 12).
building(lot_ru_34, residence, house).

%% 20 Ulitsa Beregovaya -- Residence
lot(lot_ru_35, '20 Ulitsa Beregovaya', rybachye).
lot_type(lot_ru_35, buildable).
lot_district(lot_ru_35, tsentr_sela).
lot_street(lot_ru_35, ulitsa_beregovaya).
lot_side(lot_ru_35, left).
lot_house_number(lot_ru_35, 20).
building(lot_ru_35, residence, house).
