%% Insimul Locations (Lots): Spanish Castile
%% Source: data/worlds/language/spanish/locations.pl
%% Created: 2026-04-03
%% Total: 35 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% 2 Calle Mayor -- Bar de Tapas El Rinconcillo
lot(lot_es_1, '2 Calle Mayor', villa_san_martin).
lot_type(lot_es_1, buildable).
lot_district(lot_es_1, casco_antiguo).
lot_street(lot_es_1, calle_mayor).
lot_side(lot_es_1, left).
lot_house_number(lot_es_1, 2).
building(lot_es_1, business, bar).
business(lot_es_1, 'Bar de Tapas El Rinconcillo', bar).
business_founded(lot_es_1, 1965).

%% 8 Calle Mayor -- Farmacia Santa Ana
lot(lot_es_2, '8 Calle Mayor', villa_san_martin).
lot_type(lot_es_2, buildable).
lot_district(lot_es_2, casco_antiguo).
lot_street(lot_es_2, calle_mayor).
lot_side(lot_es_2, right).
lot_house_number(lot_es_2, 8).
building(lot_es_2, business, pharmacy).
business(lot_es_2, 'Farmacia Santa Ana', pharmacy).
business_founded(lot_es_2, 1990).

%% 14 Calle Mayor -- Panaderia La Espiga
lot(lot_es_3, '14 Calle Mayor', villa_san_martin).
lot_type(lot_es_3, buildable).
lot_district(lot_es_3, casco_antiguo).
lot_street(lot_es_3, calle_mayor).
lot_side(lot_es_3, left).
lot_house_number(lot_es_3, 14).
building(lot_es_3, business, bakery).
business(lot_es_3, 'Panaderia La Espiga', bakery).
business_founded(lot_es_3, 1948).

%% 20 Calle Mayor -- Residence
lot(lot_es_4, '20 Calle Mayor', villa_san_martin).
lot_type(lot_es_4, buildable).
lot_district(lot_es_4, casco_antiguo).
lot_street(lot_es_4, calle_mayor).
lot_side(lot_es_4, right).
lot_house_number(lot_es_4, 20).
building(lot_es_4, residence, apartment).

%% 26 Calle Mayor -- Residence
lot(lot_es_5, '26 Calle Mayor', villa_san_martin).
lot_type(lot_es_5, buildable).
lot_district(lot_es_5, casco_antiguo).
lot_street(lot_es_5, calle_mayor).
lot_side(lot_es_5, left).
lot_house_number(lot_es_5, 26).
building(lot_es_5, residence, house).

%% 3 Calle de la Catedral -- Catedral Gotica
lot(lot_es_6, '3 Calle de la Catedral', villa_san_martin).
lot_type(lot_es_6, buildable).
lot_district(lot_es_6, casco_antiguo).
lot_street(lot_es_6, calle_de_la_catedral).
lot_side(lot_es_6, left).
lot_house_number(lot_es_6, 3).
building(lot_es_6, civic, cathedral).

%% 10 Calle de la Catedral -- Libreria Cervantes
lot(lot_es_7, '10 Calle de la Catedral', villa_san_martin).
lot_type(lot_es_7, buildable).
lot_district(lot_es_7, casco_antiguo).
lot_street(lot_es_7, calle_de_la_catedral).
lot_side(lot_es_7, right).
lot_house_number(lot_es_7, 10).
building(lot_es_7, business, bookstore).
business(lot_es_7, 'Libreria Cervantes', bookstore).
business_founded(lot_es_7, 1982).

%% 18 Calle de la Catedral -- Churreria San Jose
lot(lot_es_8, '18 Calle de la Catedral', villa_san_martin).
lot_type(lot_es_8, buildable).
lot_district(lot_es_8, casco_antiguo).
lot_street(lot_es_8, calle_de_la_catedral).
lot_side(lot_es_8, left).
lot_house_number(lot_es_8, 18).
building(lot_es_8, business, cafe).
business(lot_es_8, 'Churreria San Jose', cafe).
business_founded(lot_es_8, 1955).

%% 25 Calle de la Catedral -- Residence
lot(lot_es_9, '25 Calle de la Catedral', villa_san_martin).
lot_type(lot_es_9, buildable).
lot_district(lot_es_9, casco_antiguo).
lot_street(lot_es_9, calle_de_la_catedral).
lot_side(lot_es_9, right).
lot_house_number(lot_es_9, 25).
building(lot_es_9, residence, house).

%% 32 Calle de la Catedral -- Tienda de Regalos
lot(lot_es_10, '32 Calle de la Catedral', villa_san_martin).
lot_type(lot_es_10, buildable).
lot_district(lot_es_10, casco_antiguo).
lot_street(lot_es_10, calle_de_la_catedral).
lot_side(lot_es_10, left).
lot_house_number(lot_es_10, 32).
building(lot_es_10, business, shop).
business(lot_es_10, 'Tienda de Regalos La Mancha', shop).
business_founded(lot_es_10, 2005).

%% 5 Calle del Mercado -- Mercado Central
lot(lot_es_11, '5 Calle del Mercado', villa_san_martin).
lot_type(lot_es_11, buildable).
lot_district(lot_es_11, casco_antiguo).
lot_street(lot_es_11, calle_del_mercado).
lot_side(lot_es_11, left).
lot_house_number(lot_es_11, 5).
building(lot_es_11, business, market).
business(lot_es_11, 'Mercado Central', market).
business_founded(lot_es_11, 1890).

%% 12 Calle del Mercado -- Carniceria Ruiz
lot(lot_es_12, '12 Calle del Mercado', villa_san_martin).
lot_type(lot_es_12, buildable).
lot_district(lot_es_12, casco_antiguo).
lot_street(lot_es_12, calle_del_mercado).
lot_side(lot_es_12, right).
lot_house_number(lot_es_12, 12).
building(lot_es_12, business, butcher).
business(lot_es_12, 'Carniceria Ruiz', butcher).
business_founded(lot_es_12, 1972).

%% 20 Calle del Mercado -- Fruteria El Huerto
lot(lot_es_13, '20 Calle del Mercado', villa_san_martin).
lot_type(lot_es_13, buildable).
lot_district(lot_es_13, casco_antiguo).
lot_street(lot_es_13, calle_del_mercado).
lot_side(lot_es_13, left).
lot_house_number(lot_es_13, 20).
building(lot_es_13, business, shop).
business(lot_es_13, 'Fruteria El Huerto', shop).
business_founded(lot_es_13, 1998).

%% 28 Calle del Mercado -- Pescaderia del Mar
lot(lot_es_14, '28 Calle del Mercado', villa_san_martin).
lot_type(lot_es_14, buildable).
lot_district(lot_es_14, casco_antiguo).
lot_street(lot_es_14, calle_del_mercado).
lot_side(lot_es_14, right).
lot_house_number(lot_es_14, 28).
building(lot_es_14, business, shop).
business(lot_es_14, 'Pescaderia del Mar', shop).
business_founded(lot_es_14, 1985).

%% 35 Calle del Mercado -- Residence
lot(lot_es_15, '35 Calle del Mercado', villa_san_martin).
lot_type(lot_es_15, buildable).
lot_district(lot_es_15, casco_antiguo).
lot_street(lot_es_15, calle_del_mercado).
lot_side(lot_es_15, left).
lot_house_number(lot_es_15, 35).
building(lot_es_15, residence, apartment).

%% 5 Avenida de la Constitucion -- Estacion de Tren
lot(lot_es_16, '5 Avenida de la Constitucion', villa_san_martin).
lot_type(lot_es_16, buildable).
lot_district(lot_es_16, barrio_moderno).
lot_street(lot_es_16, avenida_de_la_constitucion).
lot_side(lot_es_16, left).
lot_house_number(lot_es_16, 5).
building(lot_es_16, civic, train_station).

%% 15 Avenida de la Constitucion -- Hotel Castilla
lot(lot_es_17, '15 Avenida de la Constitucion', villa_san_martin).
lot_type(lot_es_17, buildable).
lot_district(lot_es_17, barrio_moderno).
lot_street(lot_es_17, avenida_de_la_constitucion).
lot_side(lot_es_17, right).
lot_house_number(lot_es_17, 15).
building(lot_es_17, business, hotel).
business(lot_es_17, 'Hotel Castilla', hotel).
business_founded(lot_es_17, 2000).

%% 22 Avenida de la Constitucion -- Supermercado Dia
lot(lot_es_18, '22 Avenida de la Constitucion', villa_san_martin).
lot_type(lot_es_18, buildable).
lot_district(lot_es_18, barrio_moderno).
lot_street(lot_es_18, avenida_de_la_constitucion).
lot_side(lot_es_18, left).
lot_house_number(lot_es_18, 22).
building(lot_es_18, business, grocerystore).
business(lot_es_18, 'Supermercado Dia', grocerystore).
business_founded(lot_es_18, 2008).

%% 30 Avenida de la Constitucion -- Tienda de Electronica
lot(lot_es_19, '30 Avenida de la Constitucion', villa_san_martin).
lot_type(lot_es_19, buildable).
lot_district(lot_es_19, barrio_moderno).
lot_street(lot_es_19, avenida_de_la_constitucion).
lot_side(lot_es_19, right).
lot_house_number(lot_es_19, 30).
building(lot_es_19, business, shop).
business(lot_es_19, 'Tienda de Electronica MegaByte', shop).
business_founded(lot_es_19, 2012).

%% 38 Avenida de la Constitucion -- Gimnasio Fitness
lot(lot_es_20, '38 Avenida de la Constitucion', villa_san_martin).
lot_type(lot_es_20, buildable).
lot_district(lot_es_20, barrio_moderno).
lot_street(lot_es_20, avenida_de_la_constitucion).
lot_side(lot_es_20, left).
lot_house_number(lot_es_20, 38).
building(lot_es_20, business, gym).
business(lot_es_20, 'Gimnasio Fitness Castilla', gym).
business_founded(lot_es_20, 2015).

%% 8 Calle del Rio -- Restaurante El Puente
lot(lot_es_21, '8 Calle del Rio', villa_san_martin).
lot_type(lot_es_21, buildable).
lot_district(lot_es_21, barrio_moderno).
lot_street(lot_es_21, calle_del_rio).
lot_side(lot_es_21, left).
lot_house_number(lot_es_21, 8).
building(lot_es_21, business, restaurant).
business(lot_es_21, 'Restaurante El Puente', restaurant).
business_founded(lot_es_21, 1995).

%% 16 Calle del Rio -- Heladeria Italiana
lot(lot_es_22, '16 Calle del Rio', villa_san_martin).
lot_type(lot_es_22, buildable).
lot_district(lot_es_22, barrio_moderno).
lot_street(lot_es_22, calle_del_rio).
lot_side(lot_es_22, right).
lot_house_number(lot_es_22, 16).
building(lot_es_22, business, shop).
business(lot_es_22, 'Heladeria Italiana', shop).
business_founded(lot_es_22, 2010).

%% 24 Calle del Rio -- Residence
lot(lot_es_23, '24 Calle del Rio', villa_san_martin).
lot_type(lot_es_23, buildable).
lot_district(lot_es_23, barrio_moderno).
lot_street(lot_es_23, calle_del_rio).
lot_side(lot_es_23, left).
lot_house_number(lot_es_23, 24).
building(lot_es_23, residence, apartment).

%% 32 Calle del Rio -- Residence
lot(lot_es_24, '32 Calle del Rio', villa_san_martin).
lot_type(lot_es_24, buildable).
lot_district(lot_es_24, barrio_moderno).
lot_street(lot_es_24, calle_del_rio).
lot_side(lot_es_24, right).
lot_house_number(lot_es_24, 32).
building(lot_es_24, residence, apartment).

%% 5 Calle de la Universidad -- Centro de Idiomas
lot(lot_es_25, '5 Calle de la Universidad', villa_san_martin).
lot_type(lot_es_25, buildable).
lot_district(lot_es_25, zona_universitaria).
lot_street(lot_es_25, calle_de_la_universidad).
lot_side(lot_es_25, left).
lot_house_number(lot_es_25, 5).
building(lot_es_25, business, school).
business(lot_es_25, 'Centro de Idiomas Cervantes', school).
business_founded(lot_es_25, 2002).

%% 12 Calle de la Universidad -- Universidad de San Martin
lot(lot_es_26, '12 Calle de la Universidad', villa_san_martin).
lot_type(lot_es_26, buildable).
lot_district(lot_es_26, zona_universitaria).
lot_street(lot_es_26, calle_de_la_universidad).
lot_side(lot_es_26, right).
lot_house_number(lot_es_26, 12).
building(lot_es_26, civic, university).

%% 20 Calle de la Universidad -- Cafeteria Estudiante
lot(lot_es_27, '20 Calle de la Universidad', villa_san_martin).
lot_type(lot_es_27, buildable).
lot_district(lot_es_27, zona_universitaria).
lot_street(lot_es_27, calle_de_la_universidad).
lot_side(lot_es_27, left).
lot_house_number(lot_es_27, 20).
building(lot_es_27, business, cafe).
business(lot_es_27, 'Cafeteria El Estudiante', cafe).
business_founded(lot_es_27, 2006).

%% 28 Calle de la Universidad -- Biblioteca Publica
lot(lot_es_28, '28 Calle de la Universidad', villa_san_martin).
lot_type(lot_es_28, buildable).
lot_district(lot_es_28, zona_universitaria).
lot_street(lot_es_28, calle_de_la_universidad).
lot_side(lot_es_28, right).
lot_house_number(lot_es_28, 28).
building(lot_es_28, civic, library).

%% 35 Calle de la Universidad -- Residencia Estudiantil
lot(lot_es_29, '35 Calle de la Universidad', villa_san_martin).
lot_type(lot_es_29, buildable).
lot_district(lot_es_29, zona_universitaria).
lot_street(lot_es_29, calle_de_la_universidad).
lot_side(lot_es_29, left).
lot_house_number(lot_es_29, 35).
building(lot_es_29, residence, apartment).

%% 42 Calle de la Universidad -- Copisteria Rapida
lot(lot_es_30, '42 Calle de la Universidad', villa_san_martin).
lot_type(lot_es_30, buildable).
lot_district(lot_es_30, zona_universitaria).
lot_street(lot_es_30, calle_de_la_universidad).
lot_side(lot_es_30, right).
lot_house_number(lot_es_30, 42).
building(lot_es_30, business, shop).
business(lot_es_30, 'Copisteria Rapida', shop).
business_founded(lot_es_30, 2004).

%% Aldea de los Olivos Lots

%% 3 Calle de los Olivos -- Iglesia del Pueblo
lot(lot_es_31, '3 Calle de los Olivos', aldea_de_los_olivos).
lot_type(lot_es_31, buildable).
lot_district(lot_es_31, centro_del_pueblo).
lot_street(lot_es_31, calle_de_los_olivos).
lot_side(lot_es_31, left).
lot_house_number(lot_es_31, 3).
building(lot_es_31, civic, church).

%% 10 Calle de los Olivos -- Tienda del Pueblo
lot(lot_es_32, '10 Calle de los Olivos', aldea_de_los_olivos).
lot_type(lot_es_32, buildable).
lot_district(lot_es_32, centro_del_pueblo).
lot_street(lot_es_32, calle_de_los_olivos).
lot_side(lot_es_32, right).
lot_house_number(lot_es_32, 10).
building(lot_es_32, business, shop).
business(lot_es_32, 'Tienda del Pueblo', shop).
business_founded(lot_es_32, 1960).

%% 5 Camino de la Ermita -- Bodega Familiar
lot(lot_es_33, '5 Camino de la Ermita', aldea_de_los_olivos).
lot_type(lot_es_33, buildable).
lot_district(lot_es_33, centro_del_pueblo).
lot_street(lot_es_33, camino_de_la_ermita).
lot_side(lot_es_33, left).
lot_house_number(lot_es_33, 5).
building(lot_es_33, business, workshop).
business(lot_es_33, 'Bodega Familiar Navarro', workshop).
business_founded(lot_es_33, 1920).

%% 12 Camino de la Ermita -- Residence
lot(lot_es_34, '12 Camino de la Ermita', aldea_de_los_olivos).
lot_type(lot_es_34, buildable).
lot_district(lot_es_34, centro_del_pueblo).
lot_street(lot_es_34, camino_de_la_ermita).
lot_side(lot_es_34, right).
lot_house_number(lot_es_34, 12).
building(lot_es_34, residence, house).

%% 20 Camino de la Ermita -- Residence
lot(lot_es_35, '20 Camino de la Ermita', aldea_de_los_olivos).
lot_type(lot_es_35, buildable).
lot_district(lot_es_35, centro_del_pueblo).
lot_street(lot_es_35, camino_de_la_ermita).
lot_side(lot_es_35, left).
lot_house_number(lot_es_35, 20).
building(lot_es_35, residence, house).
