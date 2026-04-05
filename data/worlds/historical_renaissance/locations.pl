%% Insimul Locations (Lots): Renaissance City-States
%% Source: data/worlds/historical_renaissance/locations.pl
%% Created: 2026-04-03
%% Total: 30 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% ═══════════════════════════════════════════════════════════
%% Fiorenza - Centro Storico
%% ═══════════════════════════════════════════════════════════

%% 3 Via dei Calzaiuoli -- Palazzo Medici (Patron Residence)
lot(lot_ren_1, '3 Via dei Calzaiuoli', fiorenza).
lot_type(lot_ren_1, buildable).
lot_district(lot_ren_1, centro_storico).
lot_street(lot_ren_1, via_dei_calzaiuoli).
lot_side(lot_ren_1, left).
lot_house_number(lot_ren_1, 3).
building(lot_ren_1, residence, palazzo).

%% 10 Via dei Calzaiuoli -- Cattedrale di San Marco
lot(lot_ren_2, '10 Via dei Calzaiuoli', fiorenza).
lot_type(lot_ren_2, buildable).
lot_district(lot_ren_2, centro_storico).
lot_street(lot_ren_2, via_dei_calzaiuoli).
lot_side(lot_ren_2, right).
lot_house_number(lot_ren_2, 10).
building(lot_ren_2, civic, cathedral).

%% 18 Via dei Calzaiuoli -- Palazzo della Signoria (Government)
lot(lot_ren_3, '18 Via dei Calzaiuoli', fiorenza).
lot_type(lot_ren_3, buildable).
lot_district(lot_ren_3, centro_storico).
lot_street(lot_ren_3, via_dei_calzaiuoli).
lot_side(lot_ren_3, left).
lot_house_number(lot_ren_3, 18).
building(lot_ren_3, civic, government_hall).

%% 5 Via del Duomo -- Apothecary
lot(lot_ren_4, '5 Via del Duomo', fiorenza).
lot_type(lot_ren_4, buildable).
lot_district(lot_ren_4, centro_storico).
lot_street(lot_ren_4, via_del_duomo).
lot_side(lot_ren_4, left).
lot_house_number(lot_ren_4, 5).
building(lot_ren_4, business, apothecary).
business(lot_ren_4, 'Spezieria del Giglio', apothecary).
business_founded(lot_ren_4, 1380).

%% 12 Via del Duomo -- Taverna
lot(lot_ren_5, '12 Via del Duomo', fiorenza).
lot_type(lot_ren_5, buildable).
lot_district(lot_ren_5, centro_storico).
lot_street(lot_ren_5, via_del_duomo).
lot_side(lot_ren_5, right).
lot_house_number(lot_ren_5, 12).
building(lot_ren_5, business, tavern).
business(lot_ren_5, 'Taverna del Sole', tavern).
business_founded(lot_ren_5, 1410).

%% ═══════════════════════════════════════════════════════════
%% Fiorenza - Oltrarno
%% ═══════════════════════════════════════════════════════════

%% 4 Via dei Bardi -- Printing Press
lot(lot_ren_6, '4 Via dei Bardi', fiorenza).
lot_type(lot_ren_6, buildable).
lot_district(lot_ren_6, oltrarno).
lot_street(lot_ren_6, via_dei_bardi).
lot_side(lot_ren_6, left).
lot_house_number(lot_ren_6, 4).
building(lot_ren_6, business, printing_press).
business(lot_ren_6, 'Stamperia dei Bardi', printing_press).
business_founded(lot_ren_6, 1470).

%% 12 Via dei Bardi -- Leather Workshop
lot(lot_ren_7, '12 Via dei Bardi', fiorenza).
lot_type(lot_ren_7, buildable).
lot_district(lot_ren_7, oltrarno).
lot_street(lot_ren_7, via_dei_bardi).
lot_side(lot_ren_7, right).
lot_house_number(lot_ren_7, 12).
building(lot_ren_7, business, workshop).
business(lot_ren_7, 'Bottega del Cuoio', workshop).
business_founded(lot_ren_7, 1350).

%% 20 Via dei Bardi -- Residence
lot(lot_ren_8, '20 Via dei Bardi', fiorenza).
lot_type(lot_ren_8, buildable).
lot_district(lot_ren_8, oltrarno).
lot_street(lot_ren_8, via_dei_bardi).
lot_side(lot_ren_8, left).
lot_house_number(lot_ren_8, 20).
building(lot_ren_8, residence, house).

%% ═══════════════════════════════════════════════════════════
%% Fiorenza - Quartiere dei Mercanti
%% ═══════════════════════════════════════════════════════════

%% 2 Via della Seta -- Silk Merchant
lot(lot_ren_9, '2 Via della Seta', fiorenza).
lot_type(lot_ren_9, buildable).
lot_district(lot_ren_9, quartiere_mercanti).
lot_street(lot_ren_9, via_della_seta).
lot_side(lot_ren_9, left).
lot_house_number(lot_ren_9, 2).
building(lot_ren_9, business, shop).
business(lot_ren_9, 'Seta di Fiorenza', shop).
business_founded(lot_ren_9, 1320).

%% 10 Via della Seta -- Banking House
lot(lot_ren_10, '10 Via della Seta', fiorenza).
lot_type(lot_ren_10, buildable).
lot_district(lot_ren_10, quartiere_mercanti).
lot_street(lot_ren_10, via_della_seta).
lot_side(lot_ren_10, right).
lot_house_number(lot_ren_10, 10).
building(lot_ren_10, business, bank).
business(lot_ren_10, 'Banco dei Valori', bank).
business_founded(lot_ren_10, 1397).

%% 18 Via della Seta -- Spice Merchant
lot(lot_ren_11, '18 Via della Seta', fiorenza).
lot_type(lot_ren_11, buildable).
lot_district(lot_ren_11, quartiere_mercanti).
lot_street(lot_ren_11, via_della_seta).
lot_side(lot_ren_11, left).
lot_house_number(lot_ren_11, 18).
building(lot_ren_11, business, shop).
business(lot_ren_11, 'Spezieria Orientale', shop).
business_founded(lot_ren_11, 1410).

%% 5 Via degli Orefici -- Goldsmith
lot(lot_ren_12, '5 Via degli Orefici', fiorenza).
lot_type(lot_ren_12, buildable).
lot_district(lot_ren_12, quartiere_mercanti).
lot_street(lot_ren_12, via_degli_orefici).
lot_side(lot_ren_12, left).
lot_house_number(lot_ren_12, 5).
building(lot_ren_12, business, workshop).
business(lot_ren_12, 'Oreficeria Cellini', workshop).
business_founded(lot_ren_12, 1440).

%% 14 Via degli Orefici -- Wool Guild Hall
lot(lot_ren_13, '14 Via degli Orefici', fiorenza).
lot_type(lot_ren_13, buildable).
lot_district(lot_ren_13, quartiere_mercanti).
lot_street(lot_ren_13, via_degli_orefici).
lot_side(lot_ren_13, right).
lot_house_number(lot_ren_13, 14).
building(lot_ren_13, civic, guild_hall).

%% ═══════════════════════════════════════════════════════════
%% Fiorenza - Borgo degli Artisti
%% ═══════════════════════════════════════════════════════════

%% 3 Via dei Pittori -- Artist Studio (Painting)
lot(lot_ren_14, '3 Via dei Pittori', fiorenza).
lot_type(lot_ren_14, buildable).
lot_district(lot_ren_14, borgo_artisti).
lot_street(lot_ren_14, via_dei_pittori).
lot_side(lot_ren_14, left).
lot_house_number(lot_ren_14, 3).
building(lot_ren_14, business, artist_studio).
business(lot_ren_14, 'Bottega di Maestro Rinaldi', artist_studio).
business_founded(lot_ren_14, 1460).

%% 10 Via dei Pittori -- Artist Studio (Fresco)
lot(lot_ren_15, '10 Via dei Pittori', fiorenza).
lot_type(lot_ren_15, buildable).
lot_district(lot_ren_15, borgo_artisti).
lot_street(lot_ren_15, via_dei_pittori).
lot_side(lot_ren_15, right).
lot_house_number(lot_ren_15, 10).
building(lot_ren_15, business, artist_studio).
business(lot_ren_15, 'Studio degli Affreschi', artist_studio).
business_founded(lot_ren_15, 1475).

%% 18 Via dei Pittori -- Pigment and Materials Shop
lot(lot_ren_16, '18 Via dei Pittori', fiorenza).
lot_type(lot_ren_16, buildable).
lot_district(lot_ren_16, borgo_artisti).
lot_street(lot_ren_16, via_dei_pittori).
lot_side(lot_ren_16, left).
lot_house_number(lot_ren_16, 18).
building(lot_ren_16, business, shop).
business(lot_ren_16, 'Colori e Pigmenti', shop).
business_founded(lot_ren_16, 1430).

%% 5 Vicolo degli Scultori -- Sculptor Workshop
lot(lot_ren_17, '5 Vicolo degli Scultori', fiorenza).
lot_type(lot_ren_17, buildable).
lot_district(lot_ren_17, borgo_artisti).
lot_street(lot_ren_17, vicolo_degli_scultori).
lot_side(lot_ren_17, left).
lot_house_number(lot_ren_17, 5).
building(lot_ren_17, business, workshop).
business(lot_ren_17, 'Bottega dello Scalpello', workshop).
business_founded(lot_ren_17, 1450).

%% 12 Vicolo degli Scultori -- Residence (Artisan Housing)
lot(lot_ren_18, '12 Vicolo degli Scultori', fiorenza).
lot_type(lot_ren_18, buildable).
lot_district(lot_ren_18, borgo_artisti).
lot_street(lot_ren_18, vicolo_degli_scultori).
lot_side(lot_ren_18, right).
lot_house_number(lot_ren_18, 12).
building(lot_ren_18, residence, house).

%% ═══════════════════════════════════════════════════════════
%% Porto Sereno - Rialto
%% ═══════════════════════════════════════════════════════════

%% 3 Calle dei Mercanti -- Merchant Warehouse
lot(lot_ren_19, '3 Calle dei Mercanti', porto_sereno).
lot_type(lot_ren_19, buildable).
lot_district(lot_ren_19, rialto).
lot_street(lot_ren_19, calle_dei_mercanti).
lot_side(lot_ren_19, left).
lot_house_number(lot_ren_19, 3).
building(lot_ren_19, business, warehouse).
business(lot_ren_19, 'Fondaco dei Levantini', warehouse).
business_founded(lot_ren_19, 1350).

%% 12 Calle dei Mercanti -- Glass Workshop
lot(lot_ren_20, '12 Calle dei Mercanti', porto_sereno).
lot_type(lot_ren_20, buildable).
lot_district(lot_ren_20, rialto).
lot_street(lot_ren_20, calle_dei_mercanti).
lot_side(lot_ren_20, right).
lot_house_number(lot_ren_20, 12).
building(lot_ren_20, business, workshop).
business(lot_ren_20, 'Vetreria Murano', workshop).
business_founded(lot_ren_20, 1400).

%% 5 Fondamenta Nuova -- Cartography Shop
lot(lot_ren_21, '5 Fondamenta Nuova', porto_sereno).
lot_type(lot_ren_21, buildable).
lot_district(lot_ren_21, rialto).
lot_street(lot_ren_21, fondamenta_nuova).
lot_side(lot_ren_21, left).
lot_house_number(lot_ren_21, 5).
building(lot_ren_21, business, shop).
business(lot_ren_21, 'Mappe del Mondo', shop).
business_founded(lot_ren_21, 1460).

%% 14 Fondamenta Nuova -- Residence (Merchant House)
lot(lot_ren_22, '14 Fondamenta Nuova', porto_sereno).
lot_type(lot_ren_22, buildable).
lot_district(lot_ren_22, rialto).
lot_street(lot_ren_22, fondamenta_nuova).
lot_side(lot_ren_22, right).
lot_house_number(lot_ren_22, 14).
building(lot_ren_22, residence, palazzo).

%% ═══════════════════════════════════════════════════════════
%% Porto Sereno - Arsenale
%% ═══════════════════════════════════════════════════════════

%% 4 Calle dei Naviganti -- Shipyard
lot(lot_ren_23, '4 Calle dei Naviganti', porto_sereno).
lot_type(lot_ren_23, buildable).
lot_district(lot_ren_23, arsenale).
lot_street(lot_ren_23, calle_dei_naviganti).
lot_side(lot_ren_23, left).
lot_house_number(lot_ren_23, 4).
building(lot_ren_23, business, shipyard).
business(lot_ren_23, 'Cantiere Navale', shipyard).
business_founded(lot_ren_23, 1200).

%% 12 Calle dei Naviganti -- Rope and Sail Workshop
lot(lot_ren_24, '12 Calle dei Naviganti', porto_sereno).
lot_type(lot_ren_24, buildable).
lot_district(lot_ren_24, arsenale).
lot_street(lot_ren_24, calle_dei_naviganti).
lot_side(lot_ren_24, right).
lot_house_number(lot_ren_24, 12).
building(lot_ren_24, business, workshop).
business(lot_ren_24, 'Corderia Grande', workshop).
business_founded(lot_ren_24, 1250).

%% ═══════════════════════════════════════════════════════════
%% Porto Sereno - Campo Santo
%% ═══════════════════════════════════════════════════════════

%% 3 Calle San Luca -- Basilica di San Teodoro
lot(lot_ren_25, '3 Calle San Luca', porto_sereno).
lot_type(lot_ren_25, buildable).
lot_district(lot_ren_25, campo_santo).
lot_street(lot_ren_25, calle_san_luca).
lot_side(lot_ren_25, left).
lot_house_number(lot_ren_25, 3).
building(lot_ren_25, civic, cathedral).

%% 10 Calle San Luca -- Monastery Library
lot(lot_ren_26, '10 Calle San Luca', porto_sereno).
lot_type(lot_ren_26, buildable).
lot_district(lot_ren_26, campo_santo).
lot_street(lot_ren_26, calle_san_luca).
lot_side(lot_ren_26, right).
lot_house_number(lot_ren_26, 10).
building(lot_ren_26, civic, library).

%% ═══════════════════════════════════════════════════════════
%% Rocca Lunare - Piazza Alta
%% ═══════════════════════════════════════════════════════════

%% 3 Via della Sapienza -- Studium (University)
lot(lot_ren_27, '3 Via della Sapienza', rocca_lunare).
lot_type(lot_ren_27, buildable).
lot_district(lot_ren_27, piazza_alta).
lot_street(lot_ren_27, via_della_sapienza).
lot_side(lot_ren_27, left).
lot_house_number(lot_ren_27, 3).
building(lot_ren_27, civic, university).

%% 10 Via della Sapienza -- Observatory
lot(lot_ren_28, '10 Via della Sapienza', rocca_lunare).
lot_type(lot_ren_28, buildable).
lot_district(lot_ren_28, piazza_alta).
lot_street(lot_ren_28, via_della_sapienza).
lot_side(lot_ren_28, right).
lot_house_number(lot_ren_28, 10).
building(lot_ren_28, business, observatory).
business(lot_ren_28, 'Osservatorio della Luna', observatory).
business_founded(lot_ren_28, 1480).

%% 5 Via del Monastero -- Monastery
lot(lot_ren_29, '5 Via del Monastero', rocca_lunare).
lot_type(lot_ren_29, buildable).
lot_district(lot_ren_29, piazza_alta).
lot_street(lot_ren_29, via_del_monastero).
lot_side(lot_ren_29, left).
lot_house_number(lot_ren_29, 5).
building(lot_ren_29, civic, monastery).

%% 12 Via del Monastero -- Herbalist
lot(lot_ren_30, '12 Via del Monastero', rocca_lunare).
lot_type(lot_ren_30, buildable).
lot_district(lot_ren_30, piazza_alta).
lot_street(lot_ren_30, via_del_monastero).
lot_side(lot_ren_30, right).
lot_house_number(lot_ren_30, 12).
building(lot_ren_30, business, apothecary).
business(lot_ren_30, 'Erboristeria della Rocca', apothecary).
business_founded(lot_ren_30, 1380).
