%% Insimul Settlements: Italian Tuscany
%% Source: data/worlds/language/italian/settlements.pl
%% Created: 2026-04-03
%% Total: 2 settlements

%% Collina Dorata (main hill town)
settlement(collina_dorata, 'Collina Dorata', tuscany, italian_republic).
settlement_type(collina_dorata, town).
settlement_founded(collina_dorata, 1150).

district(centro_storico, 'Centro Storico', collina_dorata).
district_wealth(centro_storico, 65).
district_crime(centro_storico, 10).
district_established(centro_storico, 1150).
district(quartiere_mercato, 'Quartiere del Mercato', collina_dorata).
district_wealth(quartiere_mercato, 55).
district_crime(quartiere_mercato, 15).
district_established(quartiere_mercato, 1300).
district(collina_alta, 'Collina Alta', collina_dorata).
district_wealth(collina_alta, 80).
district_crime(collina_alta, 5).
district_established(collina_alta, 1200).

street(via_roma, 'Via Roma', collina_dorata, centro_storico).
street_condition(via_roma, good).
street_traffic(via_roma, high).
street(via_del_corso, 'Via del Corso', collina_dorata, centro_storico).
street_condition(via_del_corso, good).
street_traffic(via_del_corso, high).
street(via_della_chiesa, 'Via della Chiesa', collina_dorata, centro_storico).
street_condition(via_della_chiesa, good).
street_traffic(via_della_chiesa, medium).
street(via_del_mercato, 'Via del Mercato', collina_dorata, quartiere_mercato).
street_condition(via_del_mercato, good).
street_traffic(via_del_mercato, high).
street(via_degli_artigiani, 'Via degli Artigiani', collina_dorata, quartiere_mercato).
street_condition(via_degli_artigiani, fair).
street_traffic(via_degli_artigiani, medium).
street(via_del_belvedere, 'Via del Belvedere', collina_dorata, collina_alta).
street_condition(via_del_belvedere, good).
street_traffic(via_del_belvedere, low).
street(via_dei_cipressi, 'Via dei Cipressi', collina_dorata, collina_alta).
street_condition(via_dei_cipressi, good).
street_traffic(via_dei_cipressi, low).

landmark(piazza_centrale, 'Piazza Centrale', collina_dorata, centro_storico).
landmark_historical(piazza_centrale).
landmark_established(piazza_centrale, 1180).
landmark(torre_medievale, 'Torre Medievale', collina_dorata, centro_storico).
landmark_historical(torre_medievale).
landmark_established(torre_medievale, 1220).
landmark(fontana_dei_leoni, 'Fontana dei Leoni', collina_dorata, centro_storico).
landmark_established(fontana_dei_leoni, 1650).
landmark(belvedere_panoramico, 'Belvedere Panoramico', collina_dorata, collina_alta).
landmark_established(belvedere_panoramico, 1800).

%% San Vito (nearby village in the valley)
settlement(san_vito, 'San Vito', tuscany, italian_republic).
settlement_type(san_vito, village).
settlement_founded(san_vito, 1350).

district(borgo_antico, 'Borgo Antico', san_vito).
district_wealth(borgo_antico, 45).
district_crime(borgo_antico, 5).
district_established(borgo_antico, 1350).

street(via_degli_ulivi, 'Via degli Ulivi', san_vito, borgo_antico).
street_condition(via_degli_ulivi, fair).
street_traffic(via_degli_ulivi, low).
street(via_delle_vigne, 'Via delle Vigne', san_vito, borgo_antico).
street_condition(via_delle_vigne, fair).
street_traffic(via_delle_vigne, low).
