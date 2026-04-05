%% Insimul Locations (Lots): Breton Coast
%% Source: data/worlds/language/breton/locations.pl
%% Created: 2026-04-03
%% Total: 35 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% === Kae Porzh (Harbor District) ===

%% 3 Straed ar Mor -- Creperie Ar Vag
lot(lot_br_1, '3 Straed ar Mor', porzh_gwenn).
lot_type(lot_br_1, buildable).
lot_district(lot_br_1, kae_porzh).
lot_street(lot_br_1, straed_ar_mor).
lot_side(lot_br_1, left).
lot_house_number(lot_br_1, 3).
building(lot_br_1, business, restaurant).
business(lot_br_1, 'Krampouezhenn Ar Vag', restaurant).
business_founded(lot_br_1, 1992).

%% 10 Straed ar Mor -- Fishing Cooperative
lot(lot_br_2, '10 Straed ar Mor', porzh_gwenn).
lot_type(lot_br_2, buildable).
lot_district(lot_br_2, kae_porzh).
lot_street(lot_br_2, straed_ar_mor).
lot_side(lot_br_2, right).
lot_house_number(lot_br_2, 10).
building(lot_br_2, business, cooperative).
business(lot_br_2, 'Kevredigezh ar Besketaerien', cooperative).
business_founded(lot_br_2, 1960).

%% 18 Straed ar Mor -- Surf Shop
lot(lot_br_3, '18 Straed ar Mor', porzh_gwenn).
lot_type(lot_br_3, buildable).
lot_district(lot_br_3, kae_porzh).
lot_street(lot_br_3, straed_ar_mor).
lot_side(lot_br_3, left).
lot_house_number(lot_br_3, 18).
building(lot_br_3, business, shop).
business(lot_br_3, 'Surf Breizh', shop).
business_founded(lot_br_3, 2008).

%% 25 Straed ar Mor -- Seafood Restaurant
lot(lot_br_4, '25 Straed ar Mor', porzh_gwenn).
lot_type(lot_br_4, buildable).
lot_district(lot_br_4, kae_porzh).
lot_street(lot_br_4, straed_ar_mor).
lot_side(lot_br_4, right).
lot_house_number(lot_br_4, 25).
building(lot_br_4, business, restaurant).
business(lot_br_4, 'Ti-Debri Ar Mor', restaurant).
business_founded(lot_br_4, 1985).

%% 32 Straed ar Mor -- Residence
lot(lot_br_5, '32 Straed ar Mor', porzh_gwenn).
lot_type(lot_br_5, buildable).
lot_district(lot_br_5, kae_porzh).
lot_street(lot_br_5, straed_ar_mor).
lot_side(lot_br_5, left).
lot_house_number(lot_br_5, 32).
building(lot_br_5, residence, house).

%% 5 Straed ar Pesked -- Fish Market
lot(lot_br_6, '5 Straed ar Pesked', porzh_gwenn).
lot_type(lot_br_6, buildable).
lot_district(lot_br_6, kae_porzh).
lot_street(lot_br_6, straed_ar_pesked).
lot_side(lot_br_6, left).
lot_house_number(lot_br_6, 5).
building(lot_br_6, business, market).
business(lot_br_6, 'Marc''had ar Pesked', market).
business_founded(lot_br_6, 1948).

%% 12 Straed ar Pesked -- Cider Bar
lot(lot_br_7, '12 Straed ar Pesked', porzh_gwenn).
lot_type(lot_br_7, buildable).
lot_district(lot_br_7, kae_porzh).
lot_street(lot_br_7, straed_ar_pesked).
lot_side(lot_br_7, right).
lot_house_number(lot_br_7, 12).
building(lot_br_7, business, bar).
business(lot_br_7, 'Tavarn ar Sistr', bar).
business_founded(lot_br_7, 1975).

%% 20 Straed ar Pesked -- Residence
lot(lot_br_8, '20 Straed ar Pesked', porzh_gwenn).
lot_type(lot_br_8, buildable).
lot_district(lot_br_8, kae_porzh).
lot_street(lot_br_8, straed_ar_pesked).
lot_side(lot_br_8, left).
lot_house_number(lot_br_8, 20).
building(lot_br_8, residence, house).

%% === Kreiz-Ker (Town Center) ===

%% 3 Straed ar Vro -- Bakery
lot(lot_br_9, '3 Straed ar Vro', porzh_gwenn).
lot_type(lot_br_9, buildable).
lot_district(lot_br_9, kreiz_ker).
lot_street(lot_br_9, straed_ar_vro).
lot_side(lot_br_9, left).
lot_house_number(lot_br_9, 3).
building(lot_br_9, business, bakery).
business(lot_br_9, 'Baraerezh An Tiegezh', bakery).
business_founded(lot_br_9, 1955).

%% 10 Straed ar Vro -- Celtic Music Shop
lot(lot_br_10, '10 Straed ar Vro', porzh_gwenn).
lot_type(lot_br_10, buildable).
lot_district(lot_br_10, kreiz_ker).
lot_street(lot_br_10, straed_ar_vro).
lot_side(lot_br_10, right).
lot_house_number(lot_br_10, 10).
building(lot_br_10, business, shop).
business(lot_br_10, 'Sonerezh Keltiek', shop).
business_founded(lot_br_10, 2001).

%% 18 Straed ar Vro -- Breton Bookstore
lot(lot_br_11, '18 Straed ar Vro', porzh_gwenn).
lot_type(lot_br_11, buildable).
lot_district(lot_br_11, kreiz_ker).
lot_street(lot_br_11, straed_ar_vro).
lot_side(lot_br_11, left).
lot_house_number(lot_br_11, 18).
building(lot_br_11, business, bookstore).
business(lot_br_11, 'Levrdi Breizh', bookstore).
business_founded(lot_br_11, 1988).

%% 25 Straed ar Vro -- Pharmacy
lot(lot_br_12, '25 Straed ar Vro', porzh_gwenn).
lot_type(lot_br_12, buildable).
lot_district(lot_br_12, kreiz_ker).
lot_street(lot_br_12, straed_ar_vro).
lot_side(lot_br_12, right).
lot_house_number(lot_br_12, 25).
building(lot_br_12, business, pharmacy).
business(lot_br_12, 'Apotikerezh Porzh-Gwenn', pharmacy).
business_founded(lot_br_12, 1970).

%% 32 Straed ar Vro -- Celtic Jewelry Workshop
lot(lot_br_13, '32 Straed ar Vro', porzh_gwenn).
lot_type(lot_br_13, buildable).
lot_district(lot_br_13, kreiz_ker).
lot_street(lot_br_13, straed_ar_vro).
lot_side(lot_br_13, left).
lot_house_number(lot_br_13, 32).
building(lot_br_13, business, workshop).
business(lot_br_13, 'Bizouier Keltiek', workshop).
business_founded(lot_br_13, 1998).

%% 5 Straed Sant Gwenole -- Diwan School
lot(lot_br_14, '5 Straed Sant Gwenole', porzh_gwenn).
lot_type(lot_br_14, buildable).
lot_district(lot_br_14, kreiz_ker).
lot_street(lot_br_14, straed_sant_gwenole).
lot_side(lot_br_14, left).
lot_house_number(lot_br_14, 5).
building(lot_br_14, civic, school).
business(lot_br_14, 'Skol Diwan Porzh-Gwenn', school).
business_founded(lot_br_14, 1978).

%% 14 Straed Sant Gwenole -- Town Hall (Ti-Ker)
lot(lot_br_15, '14 Straed Sant Gwenole', porzh_gwenn).
lot_type(lot_br_15, buildable).
lot_district(lot_br_15, kreiz_ker).
lot_street(lot_br_15, straed_sant_gwenole).
lot_side(lot_br_15, right).
lot_house_number(lot_br_15, 14).
building(lot_br_15, civic, town_hall).

%% 22 Straed Sant Gwenole -- Fest-Noz Venue
lot(lot_br_16, '22 Straed Sant Gwenole', porzh_gwenn).
lot_type(lot_br_16, buildable).
lot_district(lot_br_16, kreiz_ker).
lot_street(lot_br_16, straed_sant_gwenole).
lot_side(lot_br_16, left).
lot_house_number(lot_br_16, 22).
building(lot_br_16, business, venue).
business(lot_br_16, 'Ti ar Fest-Noz', venue).
business_founded(lot_br_16, 1982).

%% 30 Straed Sant Gwenole -- Residence
lot(lot_br_17, '30 Straed Sant Gwenole', porzh_gwenn).
lot_type(lot_br_17, buildable).
lot_district(lot_br_17, kreiz_ker).
lot_street(lot_br_17, straed_sant_gwenole).
lot_side(lot_br_17, right).
lot_house_number(lot_br_17, 30).
building(lot_br_17, residence, house).

%% 5 Straed an Iliz -- Chapel
lot(lot_br_18, '5 Straed an Iliz', porzh_gwenn).
lot_type(lot_br_18, buildable).
lot_district(lot_br_18, kreiz_ker).
lot_street(lot_br_18, straed_an_iliz).
lot_side(lot_br_18, left).
lot_house_number(lot_br_18, 5).
building(lot_br_18, civic, chapel).

%% 12 Straed an Iliz -- Celtic Cultural Center
lot(lot_br_19, '12 Straed an Iliz', porzh_gwenn).
lot_type(lot_br_19, buildable).
lot_district(lot_br_19, kreiz_ker).
lot_street(lot_br_19, straed_an_iliz).
lot_side(lot_br_19, right).
lot_house_number(lot_br_19, 12).
building(lot_br_19, civic, cultural_center).
business(lot_br_19, 'Kreizenn Sevenadurel Keltiek', cultural_center).
business_founded(lot_br_19, 1990).

%% 20 Straed an Iliz -- Cider Press
lot(lot_br_20, '20 Straed an Iliz', porzh_gwenn).
lot_type(lot_br_20, buildable).
lot_district(lot_br_20, kreiz_ker).
lot_street(lot_br_20, straed_an_iliz).
lot_side(lot_br_20, left).
lot_house_number(lot_br_20, 20).
building(lot_br_20, business, workshop).
business(lot_br_20, 'Sistrdi An Avalou', workshop).
business_founded(lot_br_20, 1965).

%% 28 Straed an Iliz -- Residence
lot(lot_br_21, '28 Straed an Iliz', porzh_gwenn).
lot_type(lot_br_21, buildable).
lot_district(lot_br_21, kreiz_ker).
lot_street(lot_br_21, straed_an_iliz).
lot_side(lot_br_21, right).
lot_house_number(lot_br_21, 28).
building(lot_br_21, residence, apartment).

%% 35 Straed an Iliz -- Grocery Store
lot(lot_br_22, '35 Straed an Iliz', porzh_gwenn).
lot_type(lot_br_22, buildable).
lot_district(lot_br_22, kreiz_ker).
lot_street(lot_br_22, straed_an_iliz).
lot_side(lot_br_22, left).
lot_house_number(lot_br_22, 35).
building(lot_br_22, business, grocerystore).
business(lot_br_22, 'Stal-Bouedenn Porzh-Gwenn', grocerystore).
business_founded(lot_br_22, 2005).

%% === Penn ar Bed (Headland District) ===

%% 5 Hent Penn ar Bed -- Bed and Breakfast
lot(lot_br_23, '5 Hent Penn ar Bed', porzh_gwenn).
lot_type(lot_br_23, buildable).
lot_district(lot_br_23, penn_ar_bed).
lot_street(lot_br_23, hent_penn_ar_bed).
lot_side(lot_br_23, left).
lot_house_number(lot_br_23, 5).
building(lot_br_23, business, hotel).
business(lot_br_23, 'Chambr-da-welein Ar Mein-Hir', hotel).
business_founded(lot_br_23, 2010).

%% 12 Hent Penn ar Bed -- Pottery Workshop
lot(lot_br_24, '12 Hent Penn ar Bed', porzh_gwenn).
lot_type(lot_br_24, buildable).
lot_district(lot_br_24, penn_ar_bed).
lot_street(lot_br_24, hent_penn_ar_bed).
lot_side(lot_br_24, right).
lot_house_number(lot_br_24, 12).
building(lot_br_24, business, workshop).
business(lot_br_24, 'Podiri Breizh', workshop).
business_founded(lot_br_24, 1995).

%% 20 Hent Penn ar Bed -- Residence
lot(lot_br_25, '20 Hent Penn ar Bed', porzh_gwenn).
lot_type(lot_br_25, buildable).
lot_district(lot_br_25, penn_ar_bed).
lot_street(lot_br_25, hent_penn_ar_bed).
lot_side(lot_br_25, left).
lot_house_number(lot_br_25, 20).
building(lot_br_25, residence, house).

%% 28 Hent Penn ar Bed -- Galette Restaurant
lot(lot_br_26, '28 Hent Penn ar Bed', porzh_gwenn).
lot_type(lot_br_26, buildable).
lot_district(lot_br_26, penn_ar_bed).
lot_street(lot_br_26, hent_penn_ar_bed).
lot_side(lot_br_26, right).
lot_house_number(lot_br_26, 28).
building(lot_br_26, business, restaurant).
business(lot_br_26, 'Galettenn Penn ar Bed', restaurant).
business_founded(lot_br_26, 2015).

%% 35 Hent Penn ar Bed -- Residence
lot(lot_br_27, '35 Hent Penn ar Bed', porzh_gwenn).
lot_type(lot_br_27, buildable).
lot_district(lot_br_27, penn_ar_bed).
lot_street(lot_br_27, hent_penn_ar_bed).
lot_side(lot_br_27, left).
lot_house_number(lot_br_27, 35).
building(lot_br_27, residence, house).

%% === Lann-Vraz (Village Lots) ===

%% 3 Straed ar Lann -- Village Cafe
lot(lot_br_28, '3 Straed ar Lann', lann_vraz).
lot_type(lot_br_28, buildable).
lot_district(lot_br_28, kreiz_bourg).
lot_street(lot_br_28, straed_ar_lann).
lot_side(lot_br_28, left).
lot_house_number(lot_br_28, 3).
building(lot_br_28, business, cafe).
business(lot_br_28, 'Kafedi Ar Lann', cafe).
business_founded(lot_br_28, 1980).

%% 10 Straed ar Lann -- General Store
lot(lot_br_29, '10 Straed ar Lann', lann_vraz).
lot_type(lot_br_29, buildable).
lot_district(lot_br_29, kreiz_bourg).
lot_street(lot_br_29, straed_ar_lann).
lot_side(lot_br_29, right).
lot_house_number(lot_br_29, 10).
building(lot_br_29, business, shop).
business(lot_br_29, 'Stal An Holl Draoù', shop).
business_founded(lot_br_29, 1962).

%% 18 Straed ar Lann -- Creperie
lot(lot_br_30, '18 Straed ar Lann', lann_vraz).
lot_type(lot_br_30, buildable).
lot_district(lot_br_30, kreiz_bourg).
lot_street(lot_br_30, straed_ar_lann).
lot_side(lot_br_30, left).
lot_house_number(lot_br_30, 18).
building(lot_br_30, business, restaurant).
business(lot_br_30, 'Krampouezhenn Lann-Vraz', restaurant).
business_founded(lot_br_30, 1990).

%% 5 Straed ar Choat -- Farm
lot(lot_br_31, '5 Straed ar Choat', lann_vraz).
lot_type(lot_br_31, buildable).
lot_district(lot_br_31, kreiz_bourg).
lot_street(lot_br_31, straed_ar_c_hoat).
lot_side(lot_br_31, left).
lot_house_number(lot_br_31, 5).
building(lot_br_31, business, farm).
business(lot_br_31, 'Ferm Ar Choat', farm).
business_founded(lot_br_31, 1920).

%% 12 Straed ar Choat -- Residence
lot(lot_br_32, '12 Straed ar Choat', lann_vraz).
lot_type(lot_br_32, buildable).
lot_district(lot_br_32, kreiz_bourg).
lot_street(lot_br_32, straed_ar_c_hoat).
lot_side(lot_br_32, right).
lot_house_number(lot_br_32, 12).
building(lot_br_32, residence, house).

%% 20 Straed ar Choat -- Residence
lot(lot_br_33, '20 Straed ar Choat', lann_vraz).
lot_type(lot_br_33, buildable).
lot_district(lot_br_33, kreiz_bourg).
lot_street(lot_br_33, straed_ar_c_hoat).
lot_side(lot_br_33, left).
lot_house_number(lot_br_33, 20).
building(lot_br_33, residence, house).

%% 25 Straed ar Lann -- Breton Language Office
lot(lot_br_34, '25 Straed ar Lann', lann_vraz).
lot_type(lot_br_34, buildable).
lot_district(lot_br_34, kreiz_bourg).
lot_street(lot_br_34, straed_ar_lann).
lot_side(lot_br_34, right).
lot_house_number(lot_br_34, 25).
building(lot_br_34, civic, office).
business(lot_br_34, 'Ofis Publik ar Brezhoneg', office).
business_founded(lot_br_34, 1999).

%% 30 Straed ar Lann -- Village Chapel
lot(lot_br_35, '30 Straed ar Lann', lann_vraz).
lot_type(lot_br_35, buildable).
lot_district(lot_br_35, kreiz_bourg).
lot_street(lot_br_35, straed_ar_lann).
lot_side(lot_br_35, left).
lot_house_number(lot_br_35, 30).
building(lot_br_35, civic, chapel).
