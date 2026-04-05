%% Insimul Locations (Lots): Hindi Town
%% Source: data/worlds/language/hindi/locations.pl
%% Created: 2026-04-03
%% Total: 35 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% 3 Bazaar Road -- Sharma Chai Stall
lot(lot_hi_1, '3 Bazaar Road', surajpur).
lot_type(lot_hi_1, buildable).
lot_district(lot_hi_1, purana_shahar).
lot_street(lot_hi_1, bazaar_road).
lot_side(lot_hi_1, left).
lot_house_number(lot_hi_1, 3).
building(lot_hi_1, business, cafe).
business(lot_hi_1, 'Sharma Chai Stall', cafe).
business_founded(lot_hi_1, 1980).

%% 10 Bazaar Road -- Gupta Kirana Store
lot(lot_hi_2, '10 Bazaar Road', surajpur).
lot_type(lot_hi_2, buildable).
lot_district(lot_hi_2, purana_shahar).
lot_street(lot_hi_2, bazaar_road).
lot_side(lot_hi_2, right).
lot_house_number(lot_hi_2, 10).
building(lot_hi_2, business, grocerystore).
business(lot_hi_2, 'Gupta Kirana Store', grocerystore).
business_founded(lot_hi_2, 1965).

%% 18 Bazaar Road -- Kapoor Cloth Emporium
lot(lot_hi_3, '18 Bazaar Road', surajpur).
lot_type(lot_hi_3, buildable).
lot_district(lot_hi_3, purana_shahar).
lot_street(lot_hi_3, bazaar_road).
lot_side(lot_hi_3, left).
lot_house_number(lot_hi_3, 18).
building(lot_hi_3, business, shop).
business(lot_hi_3, 'Kapoor Cloth Emporium', shop).
business_founded(lot_hi_3, 1972).

%% 25 Bazaar Road -- Mishra Sweet Shop
lot(lot_hi_4, '25 Bazaar Road', surajpur).
lot_type(lot_hi_4, buildable).
lot_district(lot_hi_4, purana_shahar).
lot_street(lot_hi_4, bazaar_road).
lot_side(lot_hi_4, right).
lot_house_number(lot_hi_4, 25).
building(lot_hi_4, business, shop).
business(lot_hi_4, 'Mishra Mithai Bhandar', shop).
business_founded(lot_hi_4, 1955).

%% 32 Bazaar Road -- Residence
lot(lot_hi_5, '32 Bazaar Road', surajpur).
lot_type(lot_hi_5, buildable).
lot_district(lot_hi_5, purana_shahar).
lot_street(lot_hi_5, bazaar_road).
lot_side(lot_hi_5, left).
lot_house_number(lot_hi_5, 32).
building(lot_hi_5, residence, house).

%% 5 Station Road -- Pharmacy
lot(lot_hi_6, '5 Station Road', surajpur).
lot_type(lot_hi_6, buildable).
lot_district(lot_hi_6, purana_shahar).
lot_street(lot_hi_6, station_road).
lot_side(lot_hi_6, left).
lot_house_number(lot_hi_6, 5).
building(lot_hi_6, business, pharmacy).
business(lot_hi_6, 'Jeevan Aushadhi Dukaan', pharmacy).
business_founded(lot_hi_6, 1990).

%% 12 Station Road -- Auto-Rickshaw Stand
lot(lot_hi_7, '12 Station Road', surajpur).
lot_type(lot_hi_7, buildable).
lot_district(lot_hi_7, purana_shahar).
lot_street(lot_hi_7, station_road).
lot_side(lot_hi_7, right).
lot_house_number(lot_hi_7, 12).
building(lot_hi_7, business, transport).
business(lot_hi_7, 'Surajpur Auto Stand', transport).
business_founded(lot_hi_7, 2000).

%% 20 Station Road -- Mobile Phone Shop
lot(lot_hi_8, '20 Station Road', surajpur).
lot_type(lot_hi_8, buildable).
lot_district(lot_hi_8, purana_shahar).
lot_street(lot_hi_8, station_road).
lot_side(lot_hi_8, left).
lot_house_number(lot_hi_8, 20).
building(lot_hi_8, business, shop).
business(lot_hi_8, 'Singh Mobile Centre', shop).
business_founded(lot_hi_8, 2008).

%% 28 Station Road -- Residence
lot(lot_hi_9, '28 Station Road', surajpur).
lot_type(lot_hi_9, buildable).
lot_district(lot_hi_9, purana_shahar).
lot_street(lot_hi_9, station_road).
lot_side(lot_hi_9, right).
lot_house_number(lot_hi_9, 28).
building(lot_hi_9, residence, apartment).

%% 35 Station Road -- Samosa Stall
lot(lot_hi_10, '35 Station Road', surajpur).
lot_type(lot_hi_10, buildable).
lot_district(lot_hi_10, purana_shahar).
lot_street(lot_hi_10, station_road).
lot_side(lot_hi_10, left).
lot_house_number(lot_hi_10, 35).
building(lot_hi_10, business, restaurant).
business(lot_hi_10, 'Verma Samosa Corner', restaurant).
business_founded(lot_hi_10, 1998).

%% 2 Chai Gali -- Paan Shop
lot(lot_hi_11, '2 Chai Gali', surajpur).
lot_type(lot_hi_11, buildable).
lot_district(lot_hi_11, purana_shahar).
lot_street(lot_hi_11, chai_gali).
lot_side(lot_hi_11, left).
lot_house_number(lot_hi_11, 2).
building(lot_hi_11, business, shop).
business(lot_hi_11, 'Yadav Paan Bhandar', shop).
business_founded(lot_hi_11, 1975).

%% 8 Chai Gali -- Bookstore
lot(lot_hi_12, '8 Chai Gali', surajpur).
lot_type(lot_hi_12, buildable).
lot_district(lot_hi_12, purana_shahar).
lot_street(lot_hi_12, chai_gali).
lot_side(lot_hi_12, right).
lot_house_number(lot_hi_12, 8).
building(lot_hi_12, business, bookstore).
business(lot_hi_12, 'Saraswati Pustak Bhandar', bookstore).
business_founded(lot_hi_12, 1985).

%% 15 Chai Gali -- Residence
lot(lot_hi_13, '15 Chai Gali', surajpur).
lot_type(lot_hi_13, buildable).
lot_district(lot_hi_13, purana_shahar).
lot_street(lot_hi_13, chai_gali).
lot_side(lot_hi_13, left).
lot_house_number(lot_hi_13, 15).
building(lot_hi_13, residence, house).

%% 5 Mandir Marg -- Shiv Mandir Temple
lot(lot_hi_14, '5 Mandir Marg', surajpur).
lot_type(lot_hi_14, buildable).
lot_district(lot_hi_14, mandir_mohalla).
lot_street(lot_hi_14, mandir_marg).
lot_side(lot_hi_14, left).
lot_house_number(lot_hi_14, 5).
building(lot_hi_14, civic, temple).

%% 12 Mandir Marg -- Flower and Puja Shop
lot(lot_hi_15, '12 Mandir Marg', surajpur).
lot_type(lot_hi_15, buildable).
lot_district(lot_hi_15, mandir_mohalla).
lot_street(lot_hi_15, mandir_marg).
lot_side(lot_hi_15, right).
lot_house_number(lot_hi_15, 12).
building(lot_hi_15, business, shop).
business(lot_hi_15, 'Tiwari Phool Mala Dukaan', shop).
business_founded(lot_hi_15, 1960).

%% 20 Mandir Marg -- Music School
lot(lot_hi_16, '20 Mandir Marg', surajpur).
lot_type(lot_hi_16, buildable).
lot_district(lot_hi_16, mandir_mohalla).
lot_street(lot_hi_16, mandir_marg).
lot_side(lot_hi_16, left).
lot_house_number(lot_hi_16, 20).
building(lot_hi_16, business, school).
business(lot_hi_16, 'Saaz Sangeet Vidyalaya', school).
business_founded(lot_hi_16, 1992).

%% 28 Mandir Marg -- Residence
lot(lot_hi_17, '28 Mandir Marg', surajpur).
lot_type(lot_hi_17, buildable).
lot_district(lot_hi_17, mandir_mohalla).
lot_street(lot_hi_17, mandir_marg).
lot_side(lot_hi_17, right).
lot_house_number(lot_hi_17, 28).
building(lot_hi_17, residence, house).

%% 5 Ghat Road -- Dhaba Restaurant
lot(lot_hi_18, '5 Ghat Road', surajpur).
lot_type(lot_hi_18, buildable).
lot_district(lot_hi_18, mandir_mohalla).
lot_street(lot_hi_18, ghat_road).
lot_side(lot_hi_18, left).
lot_house_number(lot_hi_18, 5).
building(lot_hi_18, business, restaurant).
business(lot_hi_18, 'Pandey Ji Ka Dhaba', restaurant).
business_founded(lot_hi_18, 1970).

%% 12 Ghat Road -- Yoga Ashram
lot(lot_hi_19, '12 Ghat Road', surajpur).
lot_type(lot_hi_19, buildable).
lot_district(lot_hi_19, mandir_mohalla).
lot_street(lot_hi_19, ghat_road).
lot_side(lot_hi_19, right).
lot_house_number(lot_hi_19, 12).
building(lot_hi_19, business, gym).
business(lot_hi_19, 'Anand Yoga Ashram', gym).
business_founded(lot_hi_19, 2003).

%% 20 Ghat Road -- Tailor
lot(lot_hi_20, '20 Ghat Road', surajpur).
lot_type(lot_hi_20, buildable).
lot_district(lot_hi_20, mandir_mohalla).
lot_street(lot_hi_20, ghat_road).
lot_side(lot_hi_20, left).
lot_house_number(lot_hi_20, 20).
building(lot_hi_20, business, tailor).
business(lot_hi_20, 'Hussain Darzi', tailor).
business_founded(lot_hi_20, 1988).

%% 28 Ghat Road -- Residence
lot(lot_hi_21, '28 Ghat Road', surajpur).
lot_type(lot_hi_21, buildable).
lot_district(lot_hi_21, mandir_mohalla).
lot_street(lot_hi_21, ghat_road).
lot_side(lot_hi_21, right).
lot_house_number(lot_hi_21, 28).
building(lot_hi_21, residence, apartment).

%% 5 IT Park Road -- TechVista Software
lot(lot_hi_22, '5 IT Park Road', surajpur).
lot_type(lot_hi_22, buildable).
lot_district(lot_hi_22, naya_nagar).
lot_street(lot_hi_22, it_park_road).
lot_side(lot_hi_22, left).
lot_house_number(lot_hi_22, 5).
building(lot_hi_22, business, office).
business(lot_hi_22, 'TechVista Software', office).
business_founded(lot_hi_22, 2010).

%% 15 IT Park Road -- Cafe Coffee Day
lot(lot_hi_23, '15 IT Park Road', surajpur).
lot_type(lot_hi_23, buildable).
lot_district(lot_hi_23, naya_nagar).
lot_street(lot_hi_23, it_park_road).
lot_side(lot_hi_23, right).
lot_house_number(lot_hi_23, 15).
building(lot_hi_23, business, cafe).
business(lot_hi_23, 'Cafe Coffee Stop', cafe).
business_founded(lot_hi_23, 2012).

%% 22 IT Park Road -- Language Center
lot(lot_hi_24, '22 IT Park Road', surajpur).
lot_type(lot_hi_24, buildable).
lot_district(lot_hi_24, naya_nagar).
lot_street(lot_hi_24, it_park_road).
lot_side(lot_hi_24, left).
lot_house_number(lot_hi_24, 22).
building(lot_hi_24, business, school).
business(lot_hi_24, 'Hindi Bhasha Kendra', school).
business_founded(lot_hi_24, 2008).

%% 30 IT Park Road -- Residence
lot(lot_hi_25, '30 IT Park Road', surajpur).
lot_type(lot_hi_25, buildable).
lot_district(lot_hi_25, naya_nagar).
lot_street(lot_hi_25, it_park_road).
lot_side(lot_hi_25, right).
lot_house_number(lot_hi_25, 30).
building(lot_hi_25, residence, apartment).

%% 5 Mall Road -- Raj Cinema Hall
lot(lot_hi_26, '5 Mall Road', surajpur).
lot_type(lot_hi_26, buildable).
lot_district(lot_hi_26, naya_nagar).
lot_street(lot_hi_26, mall_road).
lot_side(lot_hi_26, left).
lot_house_number(lot_hi_26, 5).
building(lot_hi_26, business, cinema).
business(lot_hi_26, 'Raj Cinema Hall', cinema).
business_founded(lot_hi_26, 1998).

%% 15 Mall Road -- Sports Goods Shop
lot(lot_hi_27, '15 Mall Road', surajpur).
lot_type(lot_hi_27, buildable).
lot_district(lot_hi_27, naya_nagar).
lot_street(lot_hi_27, mall_road).
lot_side(lot_hi_27, right).
lot_house_number(lot_hi_27, 15).
building(lot_hi_27, business, shop).
business(lot_hi_27, 'Cricket King Sports', shop).
business_founded(lot_hi_27, 2005).

%% 22 Mall Road -- Supermarket
lot(lot_hi_28, '22 Mall Road', surajpur).
lot_type(lot_hi_28, buildable).
lot_district(lot_hi_28, naya_nagar).
lot_street(lot_hi_28, mall_road).
lot_side(lot_hi_28, left).
lot_house_number(lot_hi_28, 22).
building(lot_hi_28, business, grocerystore).
business(lot_hi_28, 'Sasta Bazaar Supermarket', grocerystore).
business_founded(lot_hi_28, 2015).

%% 30 Mall Road -- Hotel
lot(lot_hi_29, '30 Mall Road', surajpur).
lot_type(lot_hi_29, buildable).
lot_district(lot_hi_29, naya_nagar).
lot_street(lot_hi_29, mall_road).
lot_side(lot_hi_29, right).
lot_house_number(lot_hi_29, 30).
building(lot_hi_29, business, hotel).
business(lot_hi_29, 'Hotel Surajpur Palace', hotel).
business_founded(lot_hi_29, 2002).

%% 38 Mall Road -- Residence
lot(lot_hi_30, '38 Mall Road', surajpur).
lot_type(lot_hi_30, buildable).
lot_district(lot_hi_30, naya_nagar).
lot_street(lot_hi_30, mall_road).
lot_side(lot_hi_30, left).
lot_house_number(lot_hi_30, 38).
building(lot_hi_30, residence, apartment).

%% Kishanpura Village Lots

%% 3 Khet Road -- Village Temple
lot(lot_hi_31, '3 Khet Road', kishanpura).
lot_type(lot_hi_31, buildable).
lot_district(lot_hi_31, gaon_chowk).
lot_street(lot_hi_31, khet_road).
lot_side(lot_hi_31, left).
lot_house_number(lot_hi_31, 3).
building(lot_hi_31, civic, temple).

%% 10 Khet Road -- General Store
lot(lot_hi_32, '10 Khet Road', kishanpura).
lot_type(lot_hi_32, buildable).
lot_district(lot_hi_32, gaon_chowk).
lot_street(lot_hi_32, khet_road).
lot_side(lot_hi_32, right).
lot_house_number(lot_hi_32, 10).
building(lot_hi_32, business, shop).
business(lot_hi_32, 'Yadav General Store', shop).
business_founded(lot_hi_32, 1960).

%% 5 Panchayat Road -- Dairy
lot(lot_hi_33, '5 Panchayat Road', kishanpura).
lot_type(lot_hi_33, buildable).
lot_district(lot_hi_33, gaon_chowk).
lot_street(lot_hi_33, panchayat_road).
lot_side(lot_hi_33, left).
lot_house_number(lot_hi_33, 5).
building(lot_hi_33, business, workshop).
business(lot_hi_33, 'Kishanpura Dairy', workshop).
business_founded(lot_hi_33, 1975).

%% 12 Panchayat Road -- Residence
lot(lot_hi_34, '12 Panchayat Road', kishanpura).
lot_type(lot_hi_34, buildable).
lot_district(lot_hi_34, gaon_chowk).
lot_street(lot_hi_34, panchayat_road).
lot_side(lot_hi_34, right).
lot_house_number(lot_hi_34, 12).
building(lot_hi_34, residence, house).

%% 20 Panchayat Road -- Residence
lot(lot_hi_35, '20 Panchayat Road', kishanpura).
lot_type(lot_hi_35, buildable).
lot_district(lot_hi_35, gaon_chowk).
lot_street(lot_hi_35, panchayat_road).
lot_side(lot_hi_35, left).
lot_house_number(lot_hi_35, 20).
building(lot_hi_35, residence, house).
