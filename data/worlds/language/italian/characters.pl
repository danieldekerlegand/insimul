%% Insimul Characters: Italian Tuscany
%% Source: data/worlds/language/italian/characters.pl
%% Created: 2026-04-03
%% Total: 24 characters (6 families)
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2

%% ======================================================
%% Rossi Family (Trattoria Owners, Collina Dorata)
%% ======================================================

%% Giuseppe Rossi
person(giuseppe_rossi).
first_name(giuseppe_rossi, 'Giuseppe').
last_name(giuseppe_rossi, 'Rossi').
full_name(giuseppe_rossi, 'Giuseppe Rossi').
gender(giuseppe_rossi, male).
alive(giuseppe_rossi).
generation(giuseppe_rossi, 0).
founder_family(giuseppe_rossi).
child(giuseppe_rossi, marco_rossi).
child(giuseppe_rossi, chiara_rossi).
spouse(giuseppe_rossi, lucia_rossi).
location(giuseppe_rossi, collina_dorata).

%% Lucia Rossi
person(lucia_rossi).
first_name(lucia_rossi, 'Lucia').
last_name(lucia_rossi, 'Rossi').
full_name(lucia_rossi, 'Lucia Rossi').
gender(lucia_rossi, female).
alive(lucia_rossi).
generation(lucia_rossi, 0).
founder_family(lucia_rossi).
child(lucia_rossi, marco_rossi).
child(lucia_rossi, chiara_rossi).
spouse(lucia_rossi, giuseppe_rossi).
location(lucia_rossi, collina_dorata).

%% Marco Rossi
person(marco_rossi).
first_name(marco_rossi, 'Marco').
last_name(marco_rossi, 'Rossi').
full_name(marco_rossi, 'Marco Rossi').
gender(marco_rossi, male).
alive(marco_rossi).
generation(marco_rossi, 1).
parent(giuseppe_rossi, marco_rossi).
parent(lucia_rossi, marco_rossi).
location(marco_rossi, collina_dorata).

%% Chiara Rossi
person(chiara_rossi).
first_name(chiara_rossi, 'Chiara').
last_name(chiara_rossi, 'Rossi').
full_name(chiara_rossi, 'Chiara Rossi').
gender(chiara_rossi, female).
alive(chiara_rossi).
generation(chiara_rossi, 1).
parent(giuseppe_rossi, chiara_rossi).
parent(lucia_rossi, chiara_rossi).
location(chiara_rossi, collina_dorata).

%% ======================================================
%% Bianchi Family (Bakery Owners, Collina Dorata)
%% ======================================================

%% Antonio Bianchi
person(antonio_bianchi).
first_name(antonio_bianchi, 'Antonio').
last_name(antonio_bianchi, 'Bianchi').
full_name(antonio_bianchi, 'Antonio Bianchi').
gender(antonio_bianchi, male).
alive(antonio_bianchi).
generation(antonio_bianchi, 0).
founder_family(antonio_bianchi).
child(antonio_bianchi, elena_bianchi).
child(antonio_bianchi, luca_bianchi).
spouse(antonio_bianchi, maria_bianchi).
location(antonio_bianchi, collina_dorata).

%% Maria Bianchi
person(maria_bianchi).
first_name(maria_bianchi, 'Maria').
last_name(maria_bianchi, 'Bianchi').
full_name(maria_bianchi, 'Maria Bianchi').
gender(maria_bianchi, female).
alive(maria_bianchi).
generation(maria_bianchi, 0).
founder_family(maria_bianchi).
child(maria_bianchi, elena_bianchi).
child(maria_bianchi, luca_bianchi).
spouse(maria_bianchi, antonio_bianchi).
location(maria_bianchi, collina_dorata).

%% Elena Bianchi
person(elena_bianchi).
first_name(elena_bianchi, 'Elena').
last_name(elena_bianchi, 'Bianchi').
full_name(elena_bianchi, 'Elena Bianchi').
gender(elena_bianchi, female).
alive(elena_bianchi).
generation(elena_bianchi, 1).
parent(antonio_bianchi, elena_bianchi).
parent(maria_bianchi, elena_bianchi).
location(elena_bianchi, collina_dorata).

%% Luca Bianchi
person(luca_bianchi).
first_name(luca_bianchi, 'Luca').
last_name(luca_bianchi, 'Bianchi').
full_name(luca_bianchi, 'Luca Bianchi').
gender(luca_bianchi, male).
alive(luca_bianchi).
generation(luca_bianchi, 1).
parent(antonio_bianchi, luca_bianchi).
parent(maria_bianchi, luca_bianchi).
location(luca_bianchi, collina_dorata).

%% ======================================================
%% Romano Family (Pharmacist and Doctor, Collina Dorata)
%% ======================================================

%% Stefano Romano
person(stefano_romano).
first_name(stefano_romano, 'Stefano').
last_name(stefano_romano, 'Romano').
full_name(stefano_romano, 'Stefano Romano').
gender(stefano_romano, male).
alive(stefano_romano).
generation(stefano_romano, 0).
founder_family(stefano_romano).
child(stefano_romano, giulia_romano).
child(stefano_romano, alessandro_romano).
spouse(stefano_romano, paola_romano).
location(stefano_romano, collina_dorata).

%% Paola Romano
person(paola_romano).
first_name(paola_romano, 'Paola').
last_name(paola_romano, 'Romano').
full_name(paola_romano, 'Paola Romano').
gender(paola_romano, female).
alive(paola_romano).
generation(paola_romano, 0).
founder_family(paola_romano).
child(paola_romano, giulia_romano).
child(paola_romano, alessandro_romano).
spouse(paola_romano, stefano_romano).
location(paola_romano, collina_dorata).

%% Giulia Romano
person(giulia_romano).
first_name(giulia_romano, 'Giulia').
last_name(giulia_romano, 'Romano').
full_name(giulia_romano, 'Giulia Romano').
gender(giulia_romano, female).
alive(giulia_romano).
generation(giulia_romano, 1).
parent(stefano_romano, giulia_romano).
parent(paola_romano, giulia_romano).
location(giulia_romano, collina_dorata).

%% Alessandro Romano
person(alessandro_romano).
first_name(alessandro_romano, 'Alessandro').
last_name(alessandro_romano, 'Romano').
full_name(alessandro_romano, 'Alessandro Romano').
gender(alessandro_romano, male).
alive(alessandro_romano).
generation(alessandro_romano, 1).
parent(stefano_romano, alessandro_romano).
parent(paola_romano, alessandro_romano).
location(alessandro_romano, collina_dorata).

%% ======================================================
%% Conti Family (Butcher and Market Vendors, Collina Dorata)
%% ======================================================

%% Roberto Conti
person(roberto_conti).
first_name(roberto_conti, 'Roberto').
last_name(roberto_conti, 'Conti').
full_name(roberto_conti, 'Roberto Conti').
gender(roberto_conti, male).
alive(roberto_conti).
generation(roberto_conti, 0).
founder_family(roberto_conti).
child(roberto_conti, francesca_conti).
child(roberto_conti, matteo_conti).
spouse(roberto_conti, anna_conti).
location(roberto_conti, collina_dorata).

%% Anna Conti
person(anna_conti).
first_name(anna_conti, 'Anna').
last_name(anna_conti, 'Conti').
full_name(anna_conti, 'Anna Conti').
gender(anna_conti, female).
alive(anna_conti).
generation(anna_conti, 0).
founder_family(anna_conti).
child(anna_conti, francesca_conti).
child(anna_conti, matteo_conti).
spouse(anna_conti, roberto_conti).
location(anna_conti, collina_dorata).

%% Francesca Conti
person(francesca_conti).
first_name(francesca_conti, 'Francesca').
last_name(francesca_conti, 'Conti').
full_name(francesca_conti, 'Francesca Conti').
gender(francesca_conti, female).
alive(francesca_conti).
generation(francesca_conti, 1).
parent(roberto_conti, francesca_conti).
parent(anna_conti, francesca_conti).
location(francesca_conti, collina_dorata).

%% Matteo Conti
person(matteo_conti).
first_name(matteo_conti, 'Matteo').
last_name(matteo_conti, 'Conti').
full_name(matteo_conti, 'Matteo Conti').
gender(matteo_conti, male).
alive(matteo_conti).
generation(matteo_conti, 1).
parent(roberto_conti, matteo_conti).
parent(anna_conti, matteo_conti).
location(matteo_conti, collina_dorata).

%% ======================================================
%% Ferrari Family (Winemakers, San Vito)
%% ======================================================

%% Enrico Ferrari
person(enrico_ferrari).
first_name(enrico_ferrari, 'Enrico').
last_name(enrico_ferrari, 'Ferrari').
full_name(enrico_ferrari, 'Enrico Ferrari').
gender(enrico_ferrari, male).
alive(enrico_ferrari).
generation(enrico_ferrari, 0).
founder_family(enrico_ferrari).
child(enrico_ferrari, valentina_ferrari).
child(enrico_ferrari, davide_ferrari).
spouse(enrico_ferrari, rosa_ferrari).
location(enrico_ferrari, san_vito).

%% Rosa Ferrari
person(rosa_ferrari).
first_name(rosa_ferrari, 'Rosa').
last_name(rosa_ferrari, 'Ferrari').
full_name(rosa_ferrari, 'Rosa Ferrari').
gender(rosa_ferrari, female).
alive(rosa_ferrari).
generation(rosa_ferrari, 0).
founder_family(rosa_ferrari).
child(rosa_ferrari, valentina_ferrari).
child(rosa_ferrari, davide_ferrari).
spouse(rosa_ferrari, enrico_ferrari).
location(rosa_ferrari, san_vito).

%% Valentina Ferrari
person(valentina_ferrari).
first_name(valentina_ferrari, 'Valentina').
last_name(valentina_ferrari, 'Ferrari').
full_name(valentina_ferrari, 'Valentina Ferrari').
gender(valentina_ferrari, female).
alive(valentina_ferrari).
generation(valentina_ferrari, 1).
parent(enrico_ferrari, valentina_ferrari).
parent(rosa_ferrari, valentina_ferrari).
location(valentina_ferrari, san_vito).

%% Davide Ferrari
person(davide_ferrari).
first_name(davide_ferrari, 'Davide').
last_name(davide_ferrari, 'Ferrari').
full_name(davide_ferrari, 'Davide Ferrari').
gender(davide_ferrari, male).
alive(davide_ferrari).
generation(davide_ferrari, 1).
parent(enrico_ferrari, davide_ferrari).
parent(rosa_ferrari, davide_ferrari).
location(davide_ferrari, san_vito).

%% ======================================================
%% Moretti Family (Olive Farmers, San Vito)
%% ======================================================

%% Giovanni Moretti
person(giovanni_moretti).
first_name(giovanni_moretti, 'Giovanni').
last_name(giovanni_moretti, 'Moretti').
full_name(giovanni_moretti, 'Giovanni Moretti').
gender(giovanni_moretti, male).
alive(giovanni_moretti).
generation(giovanni_moretti, 0).
founder_family(giovanni_moretti).
child(giovanni_moretti, sofia_moretti).
child(giovanni_moretti, nicola_moretti).
spouse(giovanni_moretti, teresa_moretti).
location(giovanni_moretti, san_vito).

%% Teresa Moretti
person(teresa_moretti).
first_name(teresa_moretti, 'Teresa').
last_name(teresa_moretti, 'Moretti').
full_name(teresa_moretti, 'Teresa Moretti').
gender(teresa_moretti, female).
alive(teresa_moretti).
generation(teresa_moretti, 0).
founder_family(teresa_moretti).
child(teresa_moretti, sofia_moretti).
child(teresa_moretti, nicola_moretti).
spouse(teresa_moretti, giovanni_moretti).
location(teresa_moretti, san_vito).

%% Sofia Moretti
person(sofia_moretti).
first_name(sofia_moretti, 'Sofia').
last_name(sofia_moretti, 'Moretti').
full_name(sofia_moretti, 'Sofia Moretti').
gender(sofia_moretti, female).
alive(sofia_moretti).
generation(sofia_moretti, 1).
parent(giovanni_moretti, sofia_moretti).
parent(teresa_moretti, sofia_moretti).
location(sofia_moretti, san_vito).

%% Nicola Moretti
person(nicola_moretti).
first_name(nicola_moretti, 'Nicola').
last_name(nicola_moretti, 'Moretti').
full_name(nicola_moretti, 'Nicola Moretti').
gender(nicola_moretti, male).
alive(nicola_moretti).
generation(nicola_moretti, 1).
parent(giovanni_moretti, nicola_moretti).
parent(teresa_moretti, nicola_moretti).
location(nicola_moretti, san_vito).
