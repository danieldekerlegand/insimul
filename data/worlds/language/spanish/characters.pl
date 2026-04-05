%% Insimul Characters: Spanish Castile
%% Source: data/worlds/language/spanish/characters.pl
%% Created: 2026-04-03
%% Total: 24 characters (6 families)
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2
%%
%% Spanish naming convention: given name + paternal surname + maternal surname

%% =====================================================
%% Garcia Lopez Family (Tapas Bar Owners, Villa de San Martin)
%% =====================================================

%% Carlos Garcia Lopez
person(carlos_garcia_lopez).
first_name(carlos_garcia_lopez, 'Carlos').
last_name(carlos_garcia_lopez, 'Garcia Lopez').
full_name(carlos_garcia_lopez, 'Carlos Garcia Lopez').
gender(carlos_garcia_lopez, male).
alive(carlos_garcia_lopez).
generation(carlos_garcia_lopez, 0).
founder_family(carlos_garcia_lopez).
child(carlos_garcia_lopez, lucia_garcia_martinez).
child(carlos_garcia_lopez, pablo_garcia_martinez).
spouse(carlos_garcia_lopez, elena_martinez_ruiz).
location(carlos_garcia_lopez, villa_san_martin).

%% Elena Martinez Ruiz
person(elena_martinez_ruiz).
first_name(elena_martinez_ruiz, 'Elena').
last_name(elena_martinez_ruiz, 'Martinez Ruiz').
full_name(elena_martinez_ruiz, 'Elena Martinez Ruiz').
gender(elena_martinez_ruiz, female).
alive(elena_martinez_ruiz).
generation(elena_martinez_ruiz, 0).
founder_family(elena_martinez_ruiz).
child(elena_martinez_ruiz, lucia_garcia_martinez).
child(elena_martinez_ruiz, pablo_garcia_martinez).
spouse(elena_martinez_ruiz, carlos_garcia_lopez).
location(elena_martinez_ruiz, villa_san_martin).

%% Lucia Garcia Martinez
person(lucia_garcia_martinez).
first_name(lucia_garcia_martinez, 'Lucia').
last_name(lucia_garcia_martinez, 'Garcia Martinez').
full_name(lucia_garcia_martinez, 'Lucia Garcia Martinez').
gender(lucia_garcia_martinez, female).
alive(lucia_garcia_martinez).
generation(lucia_garcia_martinez, 1).
parent(carlos_garcia_lopez, lucia_garcia_martinez).
parent(elena_martinez_ruiz, lucia_garcia_martinez).
location(lucia_garcia_martinez, villa_san_martin).

%% Pablo Garcia Martinez
person(pablo_garcia_martinez).
first_name(pablo_garcia_martinez, 'Pablo').
last_name(pablo_garcia_martinez, 'Garcia Martinez').
full_name(pablo_garcia_martinez, 'Pablo Garcia Martinez').
gender(pablo_garcia_martinez, male).
alive(pablo_garcia_martinez).
generation(pablo_garcia_martinez, 1).
parent(carlos_garcia_lopez, pablo_garcia_martinez).
parent(elena_martinez_ruiz, pablo_garcia_martinez).
location(pablo_garcia_martinez, villa_san_martin).

%% =====================================================
%% Rodriguez Fernandez Family (University Professors, Villa de San Martin)
%% =====================================================

%% Antonio Rodriguez Fernandez
person(antonio_rodriguez_fernandez).
first_name(antonio_rodriguez_fernandez, 'Antonio').
last_name(antonio_rodriguez_fernandez, 'Rodriguez Fernandez').
full_name(antonio_rodriguez_fernandez, 'Antonio Rodriguez Fernandez').
gender(antonio_rodriguez_fernandez, male).
alive(antonio_rodriguez_fernandez).
generation(antonio_rodriguez_fernandez, 0).
founder_family(antonio_rodriguez_fernandez).
child(antonio_rodriguez_fernandez, sofia_rodriguez_sanchez).
child(antonio_rodriguez_fernandez, diego_rodriguez_sanchez).
spouse(antonio_rodriguez_fernandez, carmen_sanchez_moreno).
location(antonio_rodriguez_fernandez, villa_san_martin).

%% Carmen Sanchez Moreno
person(carmen_sanchez_moreno).
first_name(carmen_sanchez_moreno, 'Carmen').
last_name(carmen_sanchez_moreno, 'Sanchez Moreno').
full_name(carmen_sanchez_moreno, 'Carmen Sanchez Moreno').
gender(carmen_sanchez_moreno, female).
alive(carmen_sanchez_moreno).
generation(carmen_sanchez_moreno, 0).
founder_family(carmen_sanchez_moreno).
child(carmen_sanchez_moreno, sofia_rodriguez_sanchez).
child(carmen_sanchez_moreno, diego_rodriguez_sanchez).
spouse(carmen_sanchez_moreno, antonio_rodriguez_fernandez).
location(carmen_sanchez_moreno, villa_san_martin).

%% Sofia Rodriguez Sanchez
person(sofia_rodriguez_sanchez).
first_name(sofia_rodriguez_sanchez, 'Sofia').
last_name(sofia_rodriguez_sanchez, 'Rodriguez Sanchez').
full_name(sofia_rodriguez_sanchez, 'Sofia Rodriguez Sanchez').
gender(sofia_rodriguez_sanchez, female).
alive(sofia_rodriguez_sanchez).
generation(sofia_rodriguez_sanchez, 1).
parent(antonio_rodriguez_fernandez, sofia_rodriguez_sanchez).
parent(carmen_sanchez_moreno, sofia_rodriguez_sanchez).
location(sofia_rodriguez_sanchez, villa_san_martin).

%% Diego Rodriguez Sanchez
person(diego_rodriguez_sanchez).
first_name(diego_rodriguez_sanchez, 'Diego').
last_name(diego_rodriguez_sanchez, 'Rodriguez Sanchez').
full_name(diego_rodriguez_sanchez, 'Diego Rodriguez Sanchez').
gender(diego_rodriguez_sanchez, male).
alive(diego_rodriguez_sanchez).
generation(diego_rodriguez_sanchez, 1).
parent(antonio_rodriguez_fernandez, diego_rodriguez_sanchez).
parent(carmen_sanchez_moreno, diego_rodriguez_sanchez).
location(diego_rodriguez_sanchez, villa_san_martin).

%% =====================================================
%% Hernandez Gomez Family (Mercado Vendors, Villa de San Martin)
%% =====================================================

%% Manuel Hernandez Gomez
person(manuel_hernandez_gomez).
first_name(manuel_hernandez_gomez, 'Manuel').
last_name(manuel_hernandez_gomez, 'Hernandez Gomez').
full_name(manuel_hernandez_gomez, 'Manuel Hernandez Gomez').
gender(manuel_hernandez_gomez, male).
alive(manuel_hernandez_gomez).
generation(manuel_hernandez_gomez, 0).
founder_family(manuel_hernandez_gomez).
child(manuel_hernandez_gomez, maria_hernandez_diaz).
child(manuel_hernandez_gomez, javier_hernandez_diaz).
spouse(manuel_hernandez_gomez, pilar_diaz_torres).
location(manuel_hernandez_gomez, villa_san_martin).

%% Pilar Diaz Torres
person(pilar_diaz_torres).
first_name(pilar_diaz_torres, 'Pilar').
last_name(pilar_diaz_torres, 'Diaz Torres').
full_name(pilar_diaz_torres, 'Pilar Diaz Torres').
gender(pilar_diaz_torres, female).
alive(pilar_diaz_torres).
generation(pilar_diaz_torres, 0).
founder_family(pilar_diaz_torres).
child(pilar_diaz_torres, maria_hernandez_diaz).
child(pilar_diaz_torres, javier_hernandez_diaz).
spouse(pilar_diaz_torres, manuel_hernandez_gomez).
location(pilar_diaz_torres, villa_san_martin).

%% Maria Hernandez Diaz
person(maria_hernandez_diaz).
first_name(maria_hernandez_diaz, 'Maria').
last_name(maria_hernandez_diaz, 'Hernandez Diaz').
full_name(maria_hernandez_diaz, 'Maria Hernandez Diaz').
gender(maria_hernandez_diaz, female).
alive(maria_hernandez_diaz).
generation(maria_hernandez_diaz, 1).
parent(manuel_hernandez_gomez, maria_hernandez_diaz).
parent(pilar_diaz_torres, maria_hernandez_diaz).
location(maria_hernandez_diaz, villa_san_martin).

%% Javier Hernandez Diaz
person(javier_hernandez_diaz).
first_name(javier_hernandez_diaz, 'Javier').
last_name(javier_hernandez_diaz, 'Hernandez Diaz').
full_name(javier_hernandez_diaz, 'Javier Hernandez Diaz').
gender(javier_hernandez_diaz, male).
alive(javier_hernandez_diaz).
generation(javier_hernandez_diaz, 1).
parent(manuel_hernandez_gomez, javier_hernandez_diaz).
parent(pilar_diaz_torres, javier_hernandez_diaz).
location(javier_hernandez_diaz, villa_san_martin).

%% =====================================================
%% Lopez Perez Family (Doctors, Villa de San Martin)
%% =====================================================

%% Isabel Lopez Perez
person(isabel_lopez_perez).
first_name(isabel_lopez_perez, 'Isabel').
last_name(isabel_lopez_perez, 'Lopez Perez').
full_name(isabel_lopez_perez, 'Isabel Lopez Perez').
gender(isabel_lopez_perez, female).
alive(isabel_lopez_perez).
generation(isabel_lopez_perez, 0).
founder_family(isabel_lopez_perez).
child(isabel_lopez_perez, alba_munoz_lopez).
child(isabel_lopez_perez, alejandro_munoz_lopez).
spouse(isabel_lopez_perez, rafael_munoz_vega).
location(isabel_lopez_perez, villa_san_martin).

%% Rafael Munoz Vega
person(rafael_munoz_vega).
first_name(rafael_munoz_vega, 'Rafael').
last_name(rafael_munoz_vega, 'Munoz Vega').
full_name(rafael_munoz_vega, 'Rafael Munoz Vega').
gender(rafael_munoz_vega, male).
alive(rafael_munoz_vega).
generation(rafael_munoz_vega, 0).
founder_family(rafael_munoz_vega).
child(rafael_munoz_vega, alba_munoz_lopez).
child(rafael_munoz_vega, alejandro_munoz_lopez).
spouse(rafael_munoz_vega, isabel_lopez_perez).
location(rafael_munoz_vega, villa_san_martin).

%% Alba Munoz Lopez
person(alba_munoz_lopez).
first_name(alba_munoz_lopez, 'Alba').
last_name(alba_munoz_lopez, 'Munoz Lopez').
full_name(alba_munoz_lopez, 'Alba Munoz Lopez').
gender(alba_munoz_lopez, female).
alive(alba_munoz_lopez).
generation(alba_munoz_lopez, 1).
parent(rafael_munoz_vega, alba_munoz_lopez).
parent(isabel_lopez_perez, alba_munoz_lopez).
location(alba_munoz_lopez, villa_san_martin).

%% Alejandro Munoz Lopez
person(alejandro_munoz_lopez).
first_name(alejandro_munoz_lopez, 'Alejandro').
last_name(alejandro_munoz_lopez, 'Munoz Lopez').
full_name(alejandro_munoz_lopez, 'Alejandro Munoz Lopez').
gender(alejandro_munoz_lopez, male).
alive(alejandro_munoz_lopez).
generation(alejandro_munoz_lopez, 1).
parent(rafael_munoz_vega, alejandro_munoz_lopez).
parent(isabel_lopez_perez, alejandro_munoz_lopez).
location(alejandro_munoz_lopez, villa_san_martin).

%% =====================================================
%% Navarro Castillo Family (Winemakers, Aldea de los Olivos)
%% =====================================================

%% Francisco Navarro Castillo
person(francisco_navarro_castillo).
first_name(francisco_navarro_castillo, 'Francisco').
last_name(francisco_navarro_castillo, 'Navarro Castillo').
full_name(francisco_navarro_castillo, 'Francisco Navarro Castillo').
gender(francisco_navarro_castillo, male).
alive(francisco_navarro_castillo).
generation(francisco_navarro_castillo, 0).
founder_family(francisco_navarro_castillo).
child(francisco_navarro_castillo, rosa_navarro_ortega).
child(francisco_navarro_castillo, miguel_navarro_ortega).
spouse(francisco_navarro_castillo, dolores_ortega_ruiz).
location(francisco_navarro_castillo, aldea_de_los_olivos).

%% Dolores Ortega Ruiz
person(dolores_ortega_ruiz).
first_name(dolores_ortega_ruiz, 'Dolores').
last_name(dolores_ortega_ruiz, 'Ortega Ruiz').
full_name(dolores_ortega_ruiz, 'Dolores Ortega Ruiz').
gender(dolores_ortega_ruiz, female).
alive(dolores_ortega_ruiz).
generation(dolores_ortega_ruiz, 0).
founder_family(dolores_ortega_ruiz).
child(dolores_ortega_ruiz, rosa_navarro_ortega).
child(dolores_ortega_ruiz, miguel_navarro_ortega).
spouse(dolores_ortega_ruiz, francisco_navarro_castillo).
location(dolores_ortega_ruiz, aldea_de_los_olivos).

%% Rosa Navarro Ortega
person(rosa_navarro_ortega).
first_name(rosa_navarro_ortega, 'Rosa').
last_name(rosa_navarro_ortega, 'Navarro Ortega').
full_name(rosa_navarro_ortega, 'Rosa Navarro Ortega').
gender(rosa_navarro_ortega, female).
alive(rosa_navarro_ortega).
generation(rosa_navarro_ortega, 1).
parent(francisco_navarro_castillo, rosa_navarro_ortega).
parent(dolores_ortega_ruiz, rosa_navarro_ortega).
location(rosa_navarro_ortega, aldea_de_los_olivos).

%% Miguel Navarro Ortega
person(miguel_navarro_ortega).
first_name(miguel_navarro_ortega, 'Miguel').
last_name(miguel_navarro_ortega, 'Navarro Ortega').
full_name(miguel_navarro_ortega, 'Miguel Navarro Ortega').
gender(miguel_navarro_ortega, male).
alive(miguel_navarro_ortega).
generation(miguel_navarro_ortega, 1).
parent(francisco_navarro_castillo, miguel_navarro_ortega).
parent(dolores_ortega_ruiz, miguel_navarro_ortega).
location(miguel_navarro_ortega, aldea_de_los_olivos).

%% =====================================================
%% Serrano Gil Family (Olive Farmers, Aldea de los Olivos)
%% =====================================================

%% Pedro Serrano Gil
person(pedro_serrano_gil).
first_name(pedro_serrano_gil, 'Pedro').
last_name(pedro_serrano_gil, 'Serrano Gil').
full_name(pedro_serrano_gil, 'Pedro Serrano Gil').
gender(pedro_serrano_gil, male).
alive(pedro_serrano_gil).
generation(pedro_serrano_gil, 0).
founder_family(pedro_serrano_gil).
child(pedro_serrano_gil, ines_serrano_blanco).
child(pedro_serrano_gil, andres_serrano_blanco).
spouse(pedro_serrano_gil, teresa_blanco_romero).
location(pedro_serrano_gil, aldea_de_los_olivos).

%% Teresa Blanco Romero
person(teresa_blanco_romero).
first_name(teresa_blanco_romero, 'Teresa').
last_name(teresa_blanco_romero, 'Blanco Romero').
full_name(teresa_blanco_romero, 'Teresa Blanco Romero').
gender(teresa_blanco_romero, female).
alive(teresa_blanco_romero).
generation(teresa_blanco_romero, 0).
founder_family(teresa_blanco_romero).
child(teresa_blanco_romero, ines_serrano_blanco).
child(teresa_blanco_romero, andres_serrano_blanco).
spouse(teresa_blanco_romero, pedro_serrano_gil).
location(teresa_blanco_romero, aldea_de_los_olivos).

%% Ines Serrano Blanco
person(ines_serrano_blanco).
first_name(ines_serrano_blanco, 'Ines').
last_name(ines_serrano_blanco, 'Serrano Blanco').
full_name(ines_serrano_blanco, 'Ines Serrano Blanco').
gender(ines_serrano_blanco, female).
alive(ines_serrano_blanco).
generation(ines_serrano_blanco, 1).
parent(pedro_serrano_gil, ines_serrano_blanco).
parent(teresa_blanco_romero, ines_serrano_blanco).
location(ines_serrano_blanco, aldea_de_los_olivos).

%% Andres Serrano Blanco
person(andres_serrano_blanco).
first_name(andres_serrano_blanco, 'Andres').
last_name(andres_serrano_blanco, 'Serrano Blanco').
full_name(andres_serrano_blanco, 'Andres Serrano Blanco').
gender(andres_serrano_blanco, male).
alive(andres_serrano_blanco).
generation(andres_serrano_blanco, 1).
parent(pedro_serrano_gil, andres_serrano_blanco).
parent(teresa_blanco_romero, andres_serrano_blanco).
location(andres_serrano_blanco, aldea_de_los_olivos).
