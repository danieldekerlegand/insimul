%% Insimul Settlements: Spanish Castile
%% Source: data/worlds/language/spanish/settlements.pl
%% Created: 2026-04-03
%% Total: 2 settlements

%% Villa de San Martin
settlement(villa_san_martin, 'Villa de San Martin', castilla_y_leon, kingdom_of_spain).
settlement_type(villa_san_martin, town).
settlement_founded(villa_san_martin, 1150).

district(casco_antiguo, 'Casco Antiguo', villa_san_martin).
district_wealth(casco_antiguo, 60).
district_crime(casco_antiguo, 15).
district_established(casco_antiguo, 1150).
district(barrio_moderno, 'Barrio Moderno', villa_san_martin).
district_wealth(barrio_moderno, 75).
district_crime(barrio_moderno, 10).
district_established(barrio_moderno, 1970).
district(zona_universitaria, 'Zona Universitaria', villa_san_martin).
district_wealth(zona_universitaria, 70).
district_crime(zona_universitaria, 8).
district_established(zona_universitaria, 1985).

street(calle_mayor, 'Calle Mayor', villa_san_martin, casco_antiguo).
street_condition(calle_mayor, good).
street_traffic(calle_mayor, high).
street(calle_de_la_catedral, 'Calle de la Catedral', villa_san_martin, casco_antiguo).
street_condition(calle_de_la_catedral, good).
street_traffic(calle_de_la_catedral, medium).
street(calle_del_mercado, 'Calle del Mercado', villa_san_martin, casco_antiguo).
street_condition(calle_del_mercado, fair).
street_traffic(calle_del_mercado, high).
street(avenida_de_la_constitucion, 'Avenida de la Constitucion', villa_san_martin, barrio_moderno).
street_condition(avenida_de_la_constitucion, good).
street_traffic(avenida_de_la_constitucion, high).
street(calle_del_rio, 'Calle del Rio', villa_san_martin, barrio_moderno).
street_condition(calle_del_rio, good).
street_traffic(calle_del_rio, medium).
street(calle_de_la_universidad, 'Calle de la Universidad', villa_san_martin, zona_universitaria).
street_condition(calle_de_la_universidad, good).
street_traffic(calle_de_la_universidad, medium).

landmark(catedral_gotica, 'Catedral Gotica', villa_san_martin, casco_antiguo).
landmark_historical(catedral_gotica).
landmark_established(catedral_gotica, 1230).
landmark(plaza_mayor, 'Plaza Mayor', villa_san_martin, casco_antiguo).
landmark_historical(plaza_mayor).
landmark_established(plaza_mayor, 1580).
landmark(fuente_de_los_leones, 'Fuente de los Leones', villa_san_martin, casco_antiguo).
landmark_established(fuente_de_los_leones, 1750).
landmark(puente_romano, 'Puente Romano', villa_san_martin, barrio_moderno).
landmark_historical(puente_romano).
landmark_established(puente_romano, 100).

%% Aldea de los Olivos
settlement(aldea_de_los_olivos, 'Aldea de los Olivos', castilla_y_leon, kingdom_of_spain).
settlement_type(aldea_de_los_olivos, village).
settlement_founded(aldea_de_los_olivos, 1400).

district(centro_del_pueblo, 'Centro del Pueblo', aldea_de_los_olivos).
district_wealth(centro_del_pueblo, 40).
district_crime(centro_del_pueblo, 5).
district_established(centro_del_pueblo, 1400).

street(calle_de_los_olivos, 'Calle de los Olivos', aldea_de_los_olivos, centro_del_pueblo).
street_condition(calle_de_los_olivos, fair).
street_traffic(calle_de_los_olivos, low).
street(camino_de_la_ermita, 'Camino de la Ermita', aldea_de_los_olivos, centro_del_pueblo).
street_condition(camino_de_la_ermita, fair).
street_traffic(camino_de_la_ermita, low).
