%% Insimul Settlements: Portuguese Algarve
%% Source: data/worlds/language/portuguese/settlements.pl
%% Created: 2026-04-03
%% Total: 2 settlements

%% Vila Dourada (main town)
settlement(vila_dourada, 'Vila Dourada', algarve, portuguese_republic).
settlement_type(vila_dourada, town).
settlement_founded(vila_dourada, 1520).

district(cidade_velha, 'Cidade Velha', vila_dourada).
district_wealth(cidade_velha, 60).
district_crime(cidade_velha, 15).
district_established(cidade_velha, 1520).
district(marina_district, 'Marina District', vila_dourada).
district_wealth(marina_district, 85).
district_crime(marina_district, 8).
district_established(marina_district, 1995).
district(praia_district, 'Praia District', vila_dourada).
district_wealth(praia_district, 75).
district_crime(praia_district, 10).
district_established(praia_district, 1970).

street(rua_do_comercio, 'Rua do Comercio', vila_dourada, cidade_velha).
street_condition(rua_do_comercio, good).
street_traffic(rua_do_comercio, high).
street(rua_da_igreja, 'Rua da Igreja', vila_dourada, cidade_velha).
street_condition(rua_da_igreja, good).
street_traffic(rua_da_igreja, medium).
street(travessa_dos_pescadores, 'Travessa dos Pescadores', vila_dourada, cidade_velha).
street_condition(travessa_dos_pescadores, fair).
street_traffic(travessa_dos_pescadores, medium).
street(avenida_da_marina, 'Avenida da Marina', vila_dourada, marina_district).
street_condition(avenida_da_marina, good).
street_traffic(avenida_da_marina, high).
street(rua_do_farol, 'Rua do Farol', vila_dourada, marina_district).
street_condition(rua_do_farol, good).
street_traffic(rua_do_farol, medium).
street(estrada_da_praia, 'Estrada da Praia', vila_dourada, praia_district).
street_condition(estrada_da_praia, good).
street_traffic(estrada_da_praia, high).

landmark(igreja_matriz, 'Igreja Matriz', vila_dourada, cidade_velha).
landmark_historical(igreja_matriz).
landmark_established(igreja_matriz, 1540).
landmark(torre_do_relogio, 'Torre do Relogio', vila_dourada, cidade_velha).
landmark_historical(torre_do_relogio).
landmark_established(torre_do_relogio, 1650).
landmark(farol_da_marina, 'Farol da Marina', vila_dourada, marina_district).
landmark_established(farol_da_marina, 1870).
landmark(miradouro_da_praia, 'Miradouro da Praia', vila_dourada, praia_district).
landmark_established(miradouro_da_praia, 1990).

%% Aldeia do Mar (fishing village)
settlement(aldeia_do_mar, 'Aldeia do Mar', algarve, portuguese_republic).
settlement_type(aldeia_do_mar, village).
settlement_founded(aldeia_do_mar, 1680).

district(centro_da_aldeia, 'Centro da Aldeia', aldeia_do_mar).
district_wealth(centro_da_aldeia, 40).
district_crime(centro_da_aldeia, 5).
district_established(centro_da_aldeia, 1680).

street(rua_dos_barcos, 'Rua dos Barcos', aldeia_do_mar, centro_da_aldeia).
street_condition(rua_dos_barcos, fair).
street_traffic(rua_dos_barcos, low).
street(largo_da_fonte, 'Largo da Fonte', aldeia_do_mar, centro_da_aldeia).
street_condition(largo_da_fonte, fair).
street_traffic(largo_da_fonte, low).
