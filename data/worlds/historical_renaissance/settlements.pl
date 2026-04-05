%% Insimul Settlements: Renaissance City-States
%% Source: data/worlds/historical_renaissance/settlements.pl
%% Created: 2026-04-03
%% Total: 3 settlements

%% Fiorenza (Florence-inspired city-state)
settlement(fiorenza, 'Fiorenza', tuscany, italian_city_states).
settlement_type(fiorenza, city).
settlement_founded(fiorenza, 1115).

district(centro_storico, 'Centro Storico', fiorenza).
district_wealth(centro_storico, 85).
district_crime(centro_storico, 15).
district_established(centro_storico, 1115).
district(oltrarno, 'Oltrarno', fiorenza).
district_wealth(oltrarno, 60).
district_crime(oltrarno, 25).
district_established(oltrarno, 1200).
district(quartiere_mercanti, 'Quartiere dei Mercanti', fiorenza).
district_wealth(quartiere_mercanti, 90).
district_crime(quartiere_mercanti, 12).
district_established(quartiere_mercanti, 1250).
district(borgo_artisti, 'Borgo degli Artisti', fiorenza).
district_wealth(borgo_artisti, 55).
district_crime(borgo_artisti, 20).
district_established(borgo_artisti, 1300).

street(via_dei_calzaiuoli, 'Via dei Calzaiuoli', fiorenza, centro_storico).
street_condition(via_dei_calzaiuoli, good).
street_traffic(via_dei_calzaiuoli, high).
street(via_del_duomo, 'Via del Duomo', fiorenza, centro_storico).
street_condition(via_del_duomo, good).
street_traffic(via_del_duomo, high).
street(via_dei_bardi, 'Via dei Bardi', fiorenza, oltrarno).
street_condition(via_dei_bardi, fair).
street_traffic(via_dei_bardi, medium).
street(via_della_seta, 'Via della Seta', fiorenza, quartiere_mercanti).
street_condition(via_della_seta, good).
street_traffic(via_della_seta, high).
street(via_degli_orefici, 'Via degli Orefici', fiorenza, quartiere_mercanti).
street_condition(via_degli_orefici, good).
street_traffic(via_degli_orefici, high).
street(via_dei_pittori, 'Via dei Pittori', fiorenza, borgo_artisti).
street_condition(via_dei_pittori, fair).
street_traffic(via_dei_pittori, medium).
street(vicolo_degli_scultori, 'Vicolo degli Scultori', fiorenza, borgo_artisti).
street_condition(vicolo_degli_scultori, fair).
street_traffic(vicolo_degli_scultori, low).

landmark(cattedrale_san_marco, 'Cattedrale di San Marco', fiorenza, centro_storico).
landmark_historical(cattedrale_san_marco).
landmark_established(cattedrale_san_marco, 1296).
landmark(palazzo_della_signoria, 'Palazzo della Signoria', fiorenza, centro_storico).
landmark_historical(palazzo_della_signoria).
landmark_established(palazzo_della_signoria, 1299).
landmark(ponte_vecchio, 'Ponte Vecchio', fiorenza, quartiere_mercanti).
landmark_historical(ponte_vecchio).
landmark_established(ponte_vecchio, 1345).
landmark(torre_del_bargello, 'Torre del Bargello', fiorenza, centro_storico).
landmark_historical(torre_del_bargello).
landmark_established(torre_del_bargello, 1255).

%% Porto Sereno (Coastal trade hub, Venice-inspired)
settlement(porto_sereno, 'Porto Sereno', veneto, italian_city_states).
settlement_type(porto_sereno, city).
settlement_founded(porto_sereno, 1050).

district(rialto, 'Rialto', porto_sereno).
district_wealth(rialto, 95).
district_crime(rialto, 18).
district_established(rialto, 1050).
district(arsenale, 'Arsenale', porto_sereno).
district_wealth(arsenale, 70).
district_crime(arsenale, 30).
district_established(arsenale, 1104).
district(campo_santo, 'Campo Santo', porto_sereno).
district_wealth(campo_santo, 75).
district_crime(campo_santo, 10).
district_established(campo_santo, 1150).

street(calle_dei_mercanti, 'Calle dei Mercanti', porto_sereno, rialto).
street_condition(calle_dei_mercanti, good).
street_traffic(calle_dei_mercanti, high).
street(fondamenta_nuova, 'Fondamenta Nuova', porto_sereno, rialto).
street_condition(fondamenta_nuova, good).
street_traffic(fondamenta_nuova, medium).
street(calle_dei_naviganti, 'Calle dei Naviganti', porto_sereno, arsenale).
street_condition(calle_dei_naviganti, fair).
street_traffic(calle_dei_naviganti, medium).
street(calle_san_luca, 'Calle San Luca', porto_sereno, campo_santo).
street_condition(calle_san_luca, good).
street_traffic(calle_san_luca, medium).

landmark(basilica_san_teodoro, 'Basilica di San Teodoro', porto_sereno, campo_santo).
landmark_historical(basilica_san_teodoro).
landmark_established(basilica_san_teodoro, 1100).
landmark(dogana_di_mare, 'Dogana di Mare', porto_sereno, rialto).
landmark_historical(dogana_di_mare).
landmark_established(dogana_di_mare, 1200).

%% Rocca Lunare (Hill town, scholarly outpost)
settlement(rocca_lunare, 'Rocca Lunare', umbria, italian_city_states).
settlement_type(rocca_lunare, town).
settlement_founded(rocca_lunare, 1280).

district(piazza_alta, 'Piazza Alta', rocca_lunare).
district_wealth(piazza_alta, 50).
district_crime(piazza_alta, 8).
district_established(piazza_alta, 1280).

street(via_della_sapienza, 'Via della Sapienza', rocca_lunare, piazza_alta).
street_condition(via_della_sapienza, good).
street_traffic(via_della_sapienza, low).
street(via_del_monastero, 'Via del Monastero', rocca_lunare, piazza_alta).
street_condition(via_del_monastero, fair).
street_traffic(via_del_monastero, low).

landmark(torre_della_luna, 'Torre della Luna', rocca_lunare, piazza_alta).
landmark_historical(torre_della_luna).
landmark_established(torre_della_luna, 1310).
