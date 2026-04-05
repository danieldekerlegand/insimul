%% Insimul Locations (Lots): Italian Tuscany
%% Source: data/worlds/language/italian/locations.pl
%% Created: 2026-04-03
%% Total: 35 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% 2 Via Roma -- Trattoria da Nonna Lucia
lot(lot_it_1, '2 Via Roma', collina_dorata).
lot_type(lot_it_1, buildable).
lot_district(lot_it_1, centro_storico).
lot_street(lot_it_1, via_roma).
lot_side(lot_it_1, left).
lot_house_number(lot_it_1, 2).
building(lot_it_1, business, restaurant).
business(lot_it_1, 'Trattoria da Nonna Lucia', restaurant).
business_founded(lot_it_1, 1965).

%% 8 Via Roma -- Farmacia del Centro
lot(lot_it_2, '8 Via Roma', collina_dorata).
lot_type(lot_it_2, buildable).
lot_district(lot_it_2, centro_storico).
lot_street(lot_it_2, via_roma).
lot_side(lot_it_2, right).
lot_house_number(lot_it_2, 8).
building(lot_it_2, business, pharmacy).
business(lot_it_2, 'Farmacia del Centro', pharmacy).
business_founded(lot_it_2, 1990).

%% 14 Via Roma -- Bar Centrale (cafe)
lot(lot_it_3, '14 Via Roma', collina_dorata).
lot_type(lot_it_3, buildable).
lot_district(lot_it_3, centro_storico).
lot_street(lot_it_3, via_roma).
lot_side(lot_it_3, left).
lot_house_number(lot_it_3, 14).
building(lot_it_3, business, cafe).
business(lot_it_3, 'Bar Centrale', cafe).
business_founded(lot_it_3, 1978).

%% 20 Via Roma -- Residence
lot(lot_it_4, '20 Via Roma', collina_dorata).
lot_type(lot_it_4, buildable).
lot_district(lot_it_4, centro_storico).
lot_street(lot_it_4, via_roma).
lot_side(lot_it_4, right).
lot_house_number(lot_it_4, 20).
building(lot_it_4, residence, apartment).

%% 26 Via Roma -- Gelateria Dolce Vita
lot(lot_it_5, '26 Via Roma', collina_dorata).
lot_type(lot_it_5, buildable).
lot_district(lot_it_5, centro_storico).
lot_street(lot_it_5, via_roma).
lot_side(lot_it_5, left).
lot_house_number(lot_it_5, 26).
building(lot_it_5, business, gelateria).
business(lot_it_5, 'Gelateria Dolce Vita', gelateria).
business_founded(lot_it_5, 2005).

%% 3 Via del Corso -- Panificio Bianchi (bakery)
lot(lot_it_6, '3 Via del Corso', collina_dorata).
lot_type(lot_it_6, buildable).
lot_district(lot_it_6, centro_storico).
lot_street(lot_it_6, via_del_corso).
lot_side(lot_it_6, left).
lot_house_number(lot_it_6, 3).
building(lot_it_6, business, bakery).
business(lot_it_6, 'Panificio Bianchi', bakery).
business_founded(lot_it_6, 1952).

%% 11 Via del Corso -- Libreria Dante (bookstore)
lot(lot_it_7, '11 Via del Corso', collina_dorata).
lot_type(lot_it_7, buildable).
lot_district(lot_it_7, centro_storico).
lot_street(lot_it_7, via_del_corso).
lot_side(lot_it_7, right).
lot_house_number(lot_it_7, 11).
building(lot_it_7, business, bookstore).
business(lot_it_7, 'Libreria Dante', bookstore).
business_founded(lot_it_7, 1988).

%% 18 Via del Corso -- Residence
lot(lot_it_8, '18 Via del Corso', collina_dorata).
lot_type(lot_it_8, buildable).
lot_district(lot_it_8, centro_storico).
lot_street(lot_it_8, via_del_corso).
lot_side(lot_it_8, left).
lot_house_number(lot_it_8, 18).
building(lot_it_8, residence, house).

%% 25 Via del Corso -- Tabaccheria e Edicola (newsstand)
lot(lot_it_9, '25 Via del Corso', collina_dorata).
lot_type(lot_it_9, buildable).
lot_district(lot_it_9, centro_storico).
lot_street(lot_it_9, via_del_corso).
lot_side(lot_it_9, right).
lot_house_number(lot_it_9, 25).
building(lot_it_9, business, shop).
business(lot_it_9, 'Tabaccheria Rossi', shop).
business_founded(lot_it_9, 1970).

%% 5 Via della Chiesa -- Chiesa di San Marco
lot(lot_it_10, '5 Via della Chiesa', collina_dorata).
lot_type(lot_it_10, buildable).
lot_district(lot_it_10, centro_storico).
lot_street(lot_it_10, via_della_chiesa).
lot_side(lot_it_10, left).
lot_house_number(lot_it_10, 5).
building(lot_it_10, civic, church).

%% 15 Via della Chiesa -- Residence
lot(lot_it_11, '15 Via della Chiesa', collina_dorata).
lot_type(lot_it_11, buildable).
lot_district(lot_it_11, centro_storico).
lot_street(lot_it_11, via_della_chiesa).
lot_side(lot_it_11, right).
lot_house_number(lot_it_11, 15).
building(lot_it_11, residence, apartment).

%% 22 Via della Chiesa -- Residence
lot(lot_it_12, '22 Via della Chiesa', collina_dorata).
lot_type(lot_it_12, buildable).
lot_district(lot_it_12, centro_storico).
lot_street(lot_it_12, via_della_chiesa).
lot_side(lot_it_12, left).
lot_house_number(lot_it_12, 22).
building(lot_it_12, residence, house).

%% 3 Via del Mercato -- Macelleria Conti (butcher)
lot(lot_it_13, '3 Via del Mercato', collina_dorata).
lot_type(lot_it_13, buildable).
lot_district(lot_it_13, quartiere_mercato).
lot_street(lot_it_13, via_del_mercato).
lot_side(lot_it_13, left).
lot_house_number(lot_it_13, 3).
building(lot_it_13, business, butcher).
business(lot_it_13, 'Macelleria Conti', butcher).
business_founded(lot_it_13, 1960).

%% 10 Via del Mercato -- Alimentari Ferrari (grocery)
lot(lot_it_14, '10 Via del Mercato', collina_dorata).
lot_type(lot_it_14, buildable).
lot_district(lot_it_14, quartiere_mercato).
lot_street(lot_it_14, via_del_mercato).
lot_side(lot_it_14, right).
lot_house_number(lot_it_14, 10).
building(lot_it_14, business, grocerystore).
business(lot_it_14, 'Alimentari Ferrari', grocerystore).
business_founded(lot_it_14, 1975).

%% 18 Via del Mercato -- Piazza del Mercato (weekly market)
lot(lot_it_15, '18 Via del Mercato', collina_dorata).
lot_type(lot_it_15, buildable).
lot_district(lot_it_15, quartiere_mercato).
lot_street(lot_it_15, via_del_mercato).
lot_side(lot_it_15, left).
lot_house_number(lot_it_15, 18).
building(lot_it_15, business, market).
business(lot_it_15, 'Mercato Settimanale', market).
business_founded(lot_it_15, 1400).

%% 25 Via del Mercato -- Enoteca Il Grappolo (wine shop)
lot(lot_it_16, '25 Via del Mercato', collina_dorata).
lot_type(lot_it_16, buildable).
lot_district(lot_it_16, quartiere_mercato).
lot_street(lot_it_16, via_del_mercato).
lot_side(lot_it_16, right).
lot_house_number(lot_it_16, 25).
building(lot_it_16, business, shop).
business(lot_it_16, 'Enoteca Il Grappolo', shop).
business_founded(lot_it_16, 1998).

%% 32 Via del Mercato -- Residence
lot(lot_it_17, '32 Via del Mercato', collina_dorata).
lot_type(lot_it_17, buildable).
lot_district(lot_it_17, quartiere_mercato).
lot_street(lot_it_17, via_del_mercato).
lot_side(lot_it_17, left).
lot_house_number(lot_it_17, 32).
building(lot_it_17, residence, apartment).

%% 5 Via degli Artigiani -- Ceramica Moretti (pottery workshop)
lot(lot_it_18, '5 Via degli Artigiani', collina_dorata).
lot_type(lot_it_18, buildable).
lot_district(lot_it_18, quartiere_mercato).
lot_street(lot_it_18, via_degli_artigiani).
lot_side(lot_it_18, left).
lot_house_number(lot_it_18, 5).
building(lot_it_18, business, workshop).
business(lot_it_18, 'Ceramica Moretti', workshop).
business_founded(lot_it_18, 1985).

%% 12 Via degli Artigiani -- Pelletteria Toscana (leather workshop)
lot(lot_it_19, '12 Via degli Artigiani', collina_dorata).
lot_type(lot_it_19, buildable).
lot_district(lot_it_19, quartiere_mercato).
lot_street(lot_it_19, via_degli_artigiani).
lot_side(lot_it_19, right).
lot_house_number(lot_it_19, 12).
building(lot_it_19, business, workshop).
business(lot_it_19, 'Pelletteria Toscana', workshop).
business_founded(lot_it_19, 1992).

%% 20 Via degli Artigiani -- Residence
lot(lot_it_20, '20 Via degli Artigiani', collina_dorata).
lot_type(lot_it_20, buildable).
lot_district(lot_it_20, quartiere_mercato).
lot_street(lot_it_20, via_degli_artigiani).
lot_side(lot_it_20, left).
lot_house_number(lot_it_20, 20).
building(lot_it_20, residence, house).

%% 28 Via degli Artigiani -- Scuola di Lingua (language school)
lot(lot_it_21, '28 Via degli Artigiani', collina_dorata).
lot_type(lot_it_21, buildable).
lot_district(lot_it_21, quartiere_mercato).
lot_street(lot_it_21, via_degli_artigiani).
lot_side(lot_it_21, right).
lot_house_number(lot_it_21, 28).
building(lot_it_21, business, school).
business(lot_it_21, 'Scuola di Lingua Toscana', school).
business_founded(lot_it_21, 2010).

%% 3 Via del Belvedere -- Ristorante Belvedere
lot(lot_it_22, '3 Via del Belvedere', collina_dorata).
lot_type(lot_it_22, buildable).
lot_district(lot_it_22, collina_alta).
lot_street(lot_it_22, via_del_belvedere).
lot_side(lot_it_22, left).
lot_house_number(lot_it_22, 3).
building(lot_it_22, business, restaurant).
business(lot_it_22, 'Ristorante Belvedere', restaurant).
business_founded(lot_it_22, 2000).

%% 10 Via del Belvedere -- Residence
lot(lot_it_23, '10 Via del Belvedere', collina_dorata).
lot_type(lot_it_23, buildable).
lot_district(lot_it_23, collina_alta).
lot_street(lot_it_23, via_del_belvedere).
lot_side(lot_it_23, right).
lot_house_number(lot_it_23, 10).
building(lot_it_23, residence, house).

%% 18 Via del Belvedere -- Hotel Villa Toscana
lot(lot_it_24, '18 Via del Belvedere', collina_dorata).
lot_type(lot_it_24, buildable).
lot_district(lot_it_24, collina_alta).
lot_street(lot_it_24, via_del_belvedere).
lot_side(lot_it_24, left).
lot_house_number(lot_it_24, 18).
building(lot_it_24, business, hotel).
business(lot_it_24, 'Hotel Villa Toscana', hotel).
business_founded(lot_it_24, 1995).

%% 5 Via dei Cipressi -- Residence
lot(lot_it_25, '5 Via dei Cipressi', collina_dorata).
lot_type(lot_it_25, buildable).
lot_district(lot_it_25, collina_alta).
lot_street(lot_it_25, via_dei_cipressi).
lot_side(lot_it_25, left).
lot_house_number(lot_it_25, 5).
building(lot_it_25, residence, house).

%% 12 Via dei Cipressi -- Residence
lot(lot_it_26, '12 Via dei Cipressi', collina_dorata).
lot_type(lot_it_26, buildable).
lot_district(lot_it_26, collina_alta).
lot_street(lot_it_26, via_dei_cipressi).
lot_side(lot_it_26, right).
lot_house_number(lot_it_26, 12).
building(lot_it_26, residence, apartment).

%% 20 Via dei Cipressi -- Stazione Ferroviaria (train station)
lot(lot_it_27, '20 Via dei Cipressi', collina_dorata).
lot_type(lot_it_27, buildable).
lot_district(lot_it_27, collina_alta).
lot_street(lot_it_27, via_dei_cipressi).
lot_side(lot_it_27, left).
lot_house_number(lot_it_27, 20).
building(lot_it_27, civic, train_station).

%% 1 Piazza Centrale -- Municipio (town hall)
lot(lot_it_28, '1 Piazza Centrale', collina_dorata).
lot_type(lot_it_28, buildable).
lot_district(lot_it_28, centro_storico).
lot_street(lot_it_28, via_roma).
lot_side(lot_it_28, left).
lot_house_number(lot_it_28, 1).
building(lot_it_28, civic, town_hall).

%% 30 Via Roma -- Pizzeria Il Forno
lot(lot_it_29, '30 Via Roma', collina_dorata).
lot_type(lot_it_29, buildable).
lot_district(lot_it_29, centro_storico).
lot_street(lot_it_29, via_roma).
lot_side(lot_it_29, right).
lot_house_number(lot_it_29, 30).
building(lot_it_29, business, restaurant).
business(lot_it_29, 'Pizzeria Il Forno', restaurant).
business_founded(lot_it_29, 2008).

%% 35 Via degli Artigiani -- Negozio di Cellulari (phone shop)
lot(lot_it_30, '35 Via degli Artigiani', collina_dorata).
lot_type(lot_it_30, buildable).
lot_district(lot_it_30, quartiere_mercato).
lot_street(lot_it_30, via_degli_artigiani).
lot_side(lot_it_30, left).
lot_house_number(lot_it_30, 35).
building(lot_it_30, business, shop).
business(lot_it_30, 'Telefonia Moderna', shop).
business_founded(lot_it_30, 2012).

%% San Vito Village Lots

%% 3 Via degli Ulivi -- Frantoio San Vito (olive press)
lot(lot_it_31, '3 Via degli Ulivi', san_vito).
lot_type(lot_it_31, buildable).
lot_district(lot_it_31, borgo_antico).
lot_street(lot_it_31, via_degli_ulivi).
lot_side(lot_it_31, left).
lot_house_number(lot_it_31, 3).
building(lot_it_31, business, workshop).
business(lot_it_31, 'Frantoio San Vito', workshop).
business_founded(lot_it_31, 1920).

%% 10 Via degli Ulivi -- Bottega del Paese (general store)
lot(lot_it_32, '10 Via degli Ulivi', san_vito).
lot_type(lot_it_32, buildable).
lot_district(lot_it_32, borgo_antico).
lot_street(lot_it_32, via_degli_ulivi).
lot_side(lot_it_32, right).
lot_house_number(lot_it_32, 10).
building(lot_it_32, business, shop).
business(lot_it_32, 'Bottega del Paese', shop).
business_founded(lot_it_32, 1955).

%% 5 Via delle Vigne -- Cantina Brunelli (winery)
lot(lot_it_33, '5 Via delle Vigne', san_vito).
lot_type(lot_it_33, buildable).
lot_district(lot_it_33, borgo_antico).
lot_street(lot_it_33, via_delle_vigne).
lot_side(lot_it_33, left).
lot_house_number(lot_it_33, 5).
building(lot_it_33, business, workshop).
business(lot_it_33, 'Cantina Brunelli', workshop).
business_founded(lot_it_33, 1938).

%% 12 Via delle Vigne -- Residence
lot(lot_it_34, '12 Via delle Vigne', san_vito).
lot_type(lot_it_34, buildable).
lot_district(lot_it_34, borgo_antico).
lot_street(lot_it_34, via_delle_vigne).
lot_side(lot_it_34, right).
lot_house_number(lot_it_34, 12).
building(lot_it_34, residence, house).

%% 20 Via delle Vigne -- Residence
lot(lot_it_35, '20 Via delle Vigne', san_vito).
lot_type(lot_it_35, buildable).
lot_district(lot_it_35, borgo_antico).
lot_street(lot_it_35, via_delle_vigne).
lot_side(lot_it_35, left).
lot_house_number(lot_it_35, 20).
building(lot_it_35, residence, house).
