%% Insimul Locations (Lots): Portuguese Algarve
%% Source: data/worlds/language/portuguese/locations.pl
%% Created: 2026-04-03
%% Total: 35 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% 3 Rua do Comercio -- Pastelaria Sol
lot(lot_pt_1, '3 Rua do Comercio', vila_dourada).
lot_type(lot_pt_1, buildable).
lot_district(lot_pt_1, cidade_velha).
lot_street(lot_pt_1, rua_do_comercio).
lot_side(lot_pt_1, left).
lot_house_number(lot_pt_1, 3).
building(lot_pt_1, business, bakery).
business(lot_pt_1, 'Pastelaria Sol', bakery).
business_founded(lot_pt_1, 1978).

%% 10 Rua do Comercio -- Pharmacy
lot(lot_pt_2, '10 Rua do Comercio', vila_dourada).
lot_type(lot_pt_2, buildable).
lot_district(lot_pt_2, cidade_velha).
lot_street(lot_pt_2, rua_do_comercio).
lot_side(lot_pt_2, right).
lot_house_number(lot_pt_2, 10).
building(lot_pt_2, business, pharmacy).
business(lot_pt_2, 'Farmacia Central', pharmacy).
business_founded(lot_pt_2, 1965).

%% 18 Rua do Comercio -- Cork Shop
lot(lot_pt_3, '18 Rua do Comercio', vila_dourada).
lot_type(lot_pt_3, buildable).
lot_district(lot_pt_3, cidade_velha).
lot_street(lot_pt_3, rua_do_comercio).
lot_side(lot_pt_3, left).
lot_house_number(lot_pt_3, 18).
building(lot_pt_3, business, shop).
business(lot_pt_3, 'Casa da Cortica', shop).
business_founded(lot_pt_3, 2005).

%% 25 Rua do Comercio -- Bookstore
lot(lot_pt_4, '25 Rua do Comercio', vila_dourada).
lot_type(lot_pt_4, buildable).
lot_district(lot_pt_4, cidade_velha).
lot_street(lot_pt_4, rua_do_comercio).
lot_side(lot_pt_4, right).
lot_house_number(lot_pt_4, 25).
building(lot_pt_4, business, bookstore).
business(lot_pt_4, 'Livraria Pessoa', bookstore).
business_founded(lot_pt_4, 1992).

%% 32 Rua do Comercio -- Residence
lot(lot_pt_5, '32 Rua do Comercio', vila_dourada).
lot_type(lot_pt_5, buildable).
lot_district(lot_pt_5, cidade_velha).
lot_street(lot_pt_5, rua_do_comercio).
lot_side(lot_pt_5, left).
lot_house_number(lot_pt_5, 32).
building(lot_pt_5, residence, house).

%% 5 Rua da Igreja -- Igreja Matriz
lot(lot_pt_6, '5 Rua da Igreja', vila_dourada).
lot_type(lot_pt_6, buildable).
lot_district(lot_pt_6, cidade_velha).
lot_street(lot_pt_6, rua_da_igreja).
lot_side(lot_pt_6, left).
lot_house_number(lot_pt_6, 5).
building(lot_pt_6, civic, church).

%% 12 Rua da Igreja -- Azulejo Workshop
lot(lot_pt_7, '12 Rua da Igreja', vila_dourada).
lot_type(lot_pt_7, buildable).
lot_district(lot_pt_7, cidade_velha).
lot_street(lot_pt_7, rua_da_igreja).
lot_side(lot_pt_7, right).
lot_house_number(lot_pt_7, 12).
building(lot_pt_7, business, workshop).
business(lot_pt_7, 'Atelier de Azulejos', workshop).
business_founded(lot_pt_7, 1988).

%% 20 Rua da Igreja -- Fado House
lot(lot_pt_8, '20 Rua da Igreja', vila_dourada).
lot_type(lot_pt_8, buildable).
lot_district(lot_pt_8, cidade_velha).
lot_street(lot_pt_8, rua_da_igreja).
lot_side(lot_pt_8, left).
lot_house_number(lot_pt_8, 20).
building(lot_pt_8, business, bar).
business(lot_pt_8, 'Casa de Fado Saudade', bar).
business_founded(lot_pt_8, 2001).

%% 28 Rua da Igreja -- Residence
lot(lot_pt_9, '28 Rua da Igreja', vila_dourada).
lot_type(lot_pt_9, buildable).
lot_district(lot_pt_9, cidade_velha).
lot_street(lot_pt_9, rua_da_igreja).
lot_side(lot_pt_9, right).
lot_house_number(lot_pt_9, 28).
building(lot_pt_9, residence, apartment).

%% 35 Rua da Igreja -- Language School
lot(lot_pt_10, '35 Rua da Igreja', vila_dourada).
lot_type(lot_pt_10, buildable).
lot_district(lot_pt_10, cidade_velha).
lot_street(lot_pt_10, rua_da_igreja).
lot_side(lot_pt_10, left).
lot_house_number(lot_pt_10, 35).
building(lot_pt_10, business, school).
business(lot_pt_10, 'Escola de Lingua Portuguesa', school).
business_founded(lot_pt_10, 2010).

%% 3 Travessa dos Pescadores -- Seafood Restaurant
lot(lot_pt_11, '3 Travessa dos Pescadores', vila_dourada).
lot_type(lot_pt_11, buildable).
lot_district(lot_pt_11, cidade_velha).
lot_street(lot_pt_11, travessa_dos_pescadores).
lot_side(lot_pt_11, left).
lot_house_number(lot_pt_11, 3).
building(lot_pt_11, business, restaurant).
business(lot_pt_11, 'Restaurante O Pescador', restaurant).
business_founded(lot_pt_11, 1985).

%% 10 Travessa dos Pescadores -- Fish Market
lot(lot_pt_12, '10 Travessa dos Pescadores', vila_dourada).
lot_type(lot_pt_12, buildable).
lot_district(lot_pt_12, cidade_velha).
lot_street(lot_pt_12, travessa_dos_pescadores).
lot_side(lot_pt_12, right).
lot_house_number(lot_pt_12, 10).
building(lot_pt_12, business, market).
business(lot_pt_12, 'Mercado do Peixe', market).
business_founded(lot_pt_12, 1920).

%% 18 Travessa dos Pescadores -- Tasca (Tavern)
lot(lot_pt_13, '18 Travessa dos Pescadores', vila_dourada).
lot_type(lot_pt_13, buildable).
lot_district(lot_pt_13, cidade_velha).
lot_street(lot_pt_13, travessa_dos_pescadores).
lot_side(lot_pt_13, left).
lot_house_number(lot_pt_13, 18).
building(lot_pt_13, business, bar).
business(lot_pt_13, 'Tasca do Ti Zeca', bar).
business_founded(lot_pt_13, 1972).

%% 25 Travessa dos Pescadores -- Residence
lot(lot_pt_14, '25 Travessa dos Pescadores', vila_dourada).
lot_type(lot_pt_14, buildable).
lot_district(lot_pt_14, cidade_velha).
lot_street(lot_pt_14, travessa_dos_pescadores).
lot_side(lot_pt_14, right).
lot_house_number(lot_pt_14, 25).
building(lot_pt_14, residence, house).

%% 30 Travessa dos Pescadores -- Ceramics Shop
lot(lot_pt_15, '30 Travessa dos Pescadores', vila_dourada).
lot_type(lot_pt_15, buildable).
lot_district(lot_pt_15, cidade_velha).
lot_street(lot_pt_15, travessa_dos_pescadores).
lot_side(lot_pt_15, left).
lot_house_number(lot_pt_15, 30).
building(lot_pt_15, business, shop).
business(lot_pt_15, 'Ceramica Algarvia', shop).
business_founded(lot_pt_15, 1998).

%% 5 Avenida da Marina -- Marina Office
lot(lot_pt_16, '5 Avenida da Marina', vila_dourada).
lot_type(lot_pt_16, buildable).
lot_district(lot_pt_16, marina_district).
lot_street(lot_pt_16, avenida_da_marina).
lot_side(lot_pt_16, left).
lot_house_number(lot_pt_16, 5).
building(lot_pt_16, civic, office).

%% 12 Avenida da Marina -- Gelado (Ice Cream) Shop
lot(lot_pt_17, '12 Avenida da Marina', vila_dourada).
lot_type(lot_pt_17, buildable).
lot_district(lot_pt_17, marina_district).
lot_street(lot_pt_17, avenida_da_marina).
lot_side(lot_pt_17, right).
lot_house_number(lot_pt_17, 12).
building(lot_pt_17, business, shop).
business(lot_pt_17, 'Gelataria Onda', shop).
business_founded(lot_pt_17, 2015).

%% 20 Avenida da Marina -- Seafood Grill
lot(lot_pt_18, '20 Avenida da Marina', vila_dourada).
lot_type(lot_pt_18, buildable).
lot_district(lot_pt_18, marina_district).
lot_street(lot_pt_18, avenida_da_marina).
lot_side(lot_pt_18, left).
lot_house_number(lot_pt_18, 20).
building(lot_pt_18, business, restaurant).
business(lot_pt_18, 'Grelha da Marina', restaurant).
business_founded(lot_pt_18, 2008).

%% 28 Avenida da Marina -- Hotel
lot(lot_pt_19, '28 Avenida da Marina', vila_dourada).
lot_type(lot_pt_19, buildable).
lot_district(lot_pt_19, marina_district).
lot_street(lot_pt_19, avenida_da_marina).
lot_side(lot_pt_19, right).
lot_house_number(lot_pt_19, 28).
building(lot_pt_19, business, hotel).
business(lot_pt_19, 'Hotel Sol e Mar', hotel).
business_founded(lot_pt_19, 2000).

%% 36 Avenida da Marina -- Residence
lot(lot_pt_20, '36 Avenida da Marina', vila_dourada).
lot_type(lot_pt_20, buildable).
lot_district(lot_pt_20, marina_district).
lot_street(lot_pt_20, avenida_da_marina).
lot_side(lot_pt_20, left).
lot_house_number(lot_pt_20, 36).
building(lot_pt_20, residence, apartment).

%% 8 Rua do Farol -- Dive Shop
lot(lot_pt_21, '8 Rua do Farol', vila_dourada).
lot_type(lot_pt_21, buildable).
lot_district(lot_pt_21, marina_district).
lot_street(lot_pt_21, rua_do_farol).
lot_side(lot_pt_21, left).
lot_house_number(lot_pt_21, 8).
building(lot_pt_21, business, shop).
business(lot_pt_21, 'Mergulho Algarve', shop).
business_founded(lot_pt_21, 2012).

%% 16 Rua do Farol -- Supermarket
lot(lot_pt_22, '16 Rua do Farol', vila_dourada).
lot_type(lot_pt_22, buildable).
lot_district(lot_pt_22, marina_district).
lot_street(lot_pt_22, rua_do_farol).
lot_side(lot_pt_22, right).
lot_house_number(lot_pt_22, 16).
building(lot_pt_22, business, grocerystore).
business(lot_pt_22, 'Supermercado Algarve', grocerystore).
business_founded(lot_pt_22, 2003).

%% 24 Rua do Farol -- Gym
lot(lot_pt_23, '24 Rua do Farol', vila_dourada).
lot_type(lot_pt_23, buildable).
lot_district(lot_pt_23, marina_district).
lot_street(lot_pt_23, rua_do_farol).
lot_side(lot_pt_23, left).
lot_house_number(lot_pt_23, 24).
building(lot_pt_23, business, gym).
business(lot_pt_23, 'Ginasio Forca', gym).
business_founded(lot_pt_23, 2016).

%% 32 Rua do Farol -- Residence
lot(lot_pt_24, '32 Rua do Farol', vila_dourada).
lot_type(lot_pt_24, buildable).
lot_district(lot_pt_24, marina_district).
lot_street(lot_pt_24, rua_do_farol).
lot_side(lot_pt_24, right).
lot_house_number(lot_pt_24, 32).
building(lot_pt_24, residence, apartment).

%% 5 Estrada da Praia -- Beach Bar
lot(lot_pt_25, '5 Estrada da Praia', vila_dourada).
lot_type(lot_pt_25, buildable).
lot_district(lot_pt_25, praia_district).
lot_street(lot_pt_25, estrada_da_praia).
lot_side(lot_pt_25, left).
lot_house_number(lot_pt_25, 5).
building(lot_pt_25, business, bar).
business(lot_pt_25, 'Chiringuito Praia Dourada', bar).
business_founded(lot_pt_25, 2010).

%% 15 Estrada da Praia -- Surf School
lot(lot_pt_26, '15 Estrada da Praia', vila_dourada).
lot_type(lot_pt_26, buildable).
lot_district(lot_pt_26, praia_district).
lot_street(lot_pt_26, estrada_da_praia).
lot_side(lot_pt_26, right).
lot_house_number(lot_pt_26, 15).
building(lot_pt_26, business, school).
business(lot_pt_26, 'Escola de Surf Onda', school).
business_founded(lot_pt_26, 2014).

%% 22 Estrada da Praia -- Souvenir Shop
lot(lot_pt_27, '22 Estrada da Praia', vila_dourada).
lot_type(lot_pt_27, buildable).
lot_district(lot_pt_27, praia_district).
lot_street(lot_pt_27, estrada_da_praia).
lot_side(lot_pt_27, left).
lot_house_number(lot_pt_27, 22).
building(lot_pt_27, business, shop).
business(lot_pt_27, 'Lembrancias do Algarve', shop).
business_founded(lot_pt_27, 2006).

%% 30 Estrada da Praia -- Tourist Office
lot(lot_pt_28, '30 Estrada da Praia', vila_dourada).
lot_type(lot_pt_28, buildable).
lot_district(lot_pt_28, praia_district).
lot_street(lot_pt_28, estrada_da_praia).
lot_side(lot_pt_28, right).
lot_house_number(lot_pt_28, 30).
building(lot_pt_28, civic, office).

%% 38 Estrada da Praia -- Residence
lot(lot_pt_29, '38 Estrada da Praia', vila_dourada).
lot_type(lot_pt_29, buildable).
lot_district(lot_pt_29, praia_district).
lot_street(lot_pt_29, estrada_da_praia).
lot_side(lot_pt_29, left).
lot_house_number(lot_pt_29, 38).
building(lot_pt_29, residence, house).

%% 45 Estrada da Praia -- Bike Rental
lot(lot_pt_30, '45 Estrada da Praia', vila_dourada).
lot_type(lot_pt_30, buildable).
lot_district(lot_pt_30, praia_district).
lot_street(lot_pt_30, estrada_da_praia).
lot_side(lot_pt_30, right).
lot_house_number(lot_pt_30, 45).
building(lot_pt_30, business, shop).
business(lot_pt_30, 'Bicicletas do Sol', shop).
business_founded(lot_pt_30, 2018).

%% Aldeia do Mar Lots

%% 3 Rua dos Barcos -- Village Chapel
lot(lot_pt_31, '3 Rua dos Barcos', aldeia_do_mar).
lot_type(lot_pt_31, buildable).
lot_district(lot_pt_31, centro_da_aldeia).
lot_street(lot_pt_31, rua_dos_barcos).
lot_side(lot_pt_31, left).
lot_house_number(lot_pt_31, 3).
building(lot_pt_31, civic, church).

%% 10 Rua dos Barcos -- Village Tavern
lot(lot_pt_32, '10 Rua dos Barcos', aldeia_do_mar).
lot_type(lot_pt_32, buildable).
lot_district(lot_pt_32, centro_da_aldeia).
lot_street(lot_pt_32, rua_dos_barcos).
lot_side(lot_pt_32, right).
lot_house_number(lot_pt_32, 10).
building(lot_pt_32, business, bar).
business(lot_pt_32, 'Taberna do Cais', bar).
business_founded(lot_pt_32, 1955).

%% 5 Largo da Fonte -- General Store
lot(lot_pt_33, '5 Largo da Fonte', aldeia_do_mar).
lot_type(lot_pt_33, buildable).
lot_district(lot_pt_33, centro_da_aldeia).
lot_street(lot_pt_33, largo_da_fonte).
lot_side(lot_pt_33, left).
lot_house_number(lot_pt_33, 5).
building(lot_pt_33, business, shop).
business(lot_pt_33, 'Mercearia da Dona Rosa', shop).
business_founded(lot_pt_33, 1960).

%% 12 Largo da Fonte -- Residence
lot(lot_pt_34, '12 Largo da Fonte', aldeia_do_mar).
lot_type(lot_pt_34, buildable).
lot_district(lot_pt_34, centro_da_aldeia).
lot_street(lot_pt_34, largo_da_fonte).
lot_side(lot_pt_34, right).
lot_house_number(lot_pt_34, 12).
building(lot_pt_34, residence, house).

%% 20 Largo da Fonte -- Residence
lot(lot_pt_35, '20 Largo da Fonte', aldeia_do_mar).
lot_type(lot_pt_35, buildable).
lot_district(lot_pt_35, centro_da_aldeia).
lot_street(lot_pt_35, largo_da_fonte).
lot_side(lot_pt_35, left).
lot_house_number(lot_pt_35, 20).
building(lot_pt_35, residence, house).
