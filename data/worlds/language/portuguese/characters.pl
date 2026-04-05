%% Insimul Characters: Portuguese Algarve
%% Source: data/worlds/language/portuguese/characters.pl
%% Created: 2026-04-03
%% Total: 24 characters (6 families)
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2

%% =====================================================
%% Silva Family (Pastelaria Owners, Vila Dourada)
%% =====================================================

%% Manuel Silva
person(manuel_silva).
first_name(manuel_silva, 'Manuel').
last_name(manuel_silva, 'Silva').
full_name(manuel_silva, 'Manuel Silva').
gender(manuel_silva, male).
alive(manuel_silva).
generation(manuel_silva, 0).
founder_family(manuel_silva).
child(manuel_silva, beatriz_silva).
child(manuel_silva, tiago_silva).
spouse(manuel_silva, maria_silva).
location(manuel_silva, vila_dourada).

%% Maria Silva
person(maria_silva).
first_name(maria_silva, 'Maria').
last_name(maria_silva, 'Silva').
full_name(maria_silva, 'Maria Silva').
gender(maria_silva, female).
alive(maria_silva).
generation(maria_silva, 0).
founder_family(maria_silva).
child(maria_silva, beatriz_silva).
child(maria_silva, tiago_silva).
spouse(maria_silva, manuel_silva).
location(maria_silva, vila_dourada).

%% Beatriz Silva
person(beatriz_silva).
first_name(beatriz_silva, 'Beatriz').
last_name(beatriz_silva, 'Silva').
full_name(beatriz_silva, 'Beatriz Silva').
gender(beatriz_silva, female).
alive(beatriz_silva).
generation(beatriz_silva, 1).
parent(manuel_silva, beatriz_silva).
parent(maria_silva, beatriz_silva).
location(beatriz_silva, vila_dourada).

%% Tiago Silva
person(tiago_silva).
first_name(tiago_silva, 'Tiago').
last_name(tiago_silva, 'Silva').
full_name(tiago_silva, 'Tiago Silva').
gender(tiago_silva, male).
alive(tiago_silva).
generation(tiago_silva, 1).
parent(manuel_silva, tiago_silva).
parent(maria_silva, tiago_silva).
location(tiago_silva, vila_dourada).

%% =====================================================
%% Santos Family (Seafood Restaurant, Vila Dourada)
%% =====================================================

%% Antonio Santos
person(antonio_santos).
first_name(antonio_santos, 'Antonio').
last_name(antonio_santos, 'Santos').
full_name(antonio_santos, 'Antonio Santos').
gender(antonio_santos, male).
alive(antonio_santos).
generation(antonio_santos, 0).
founder_family(antonio_santos).
child(antonio_santos, ines_santos).
child(antonio_santos, rafael_santos).
spouse(antonio_santos, clara_santos).
location(antonio_santos, vila_dourada).

%% Clara Santos
person(clara_santos).
first_name(clara_santos, 'Clara').
last_name(clara_santos, 'Santos').
full_name(clara_santos, 'Clara Santos').
gender(clara_santos, female).
alive(clara_santos).
generation(clara_santos, 0).
founder_family(clara_santos).
child(clara_santos, ines_santos).
child(clara_santos, rafael_santos).
spouse(clara_santos, antonio_santos).
location(clara_santos, vila_dourada).

%% Ines Santos
person(ines_santos).
first_name(ines_santos, 'Ines').
last_name(ines_santos, 'Santos').
full_name(ines_santos, 'Ines Santos').
gender(ines_santos, female).
alive(ines_santos).
generation(ines_santos, 1).
parent(antonio_santos, ines_santos).
parent(clara_santos, ines_santos).
location(ines_santos, vila_dourada).

%% Rafael Santos
person(rafael_santos).
first_name(rafael_santos, 'Rafael').
last_name(rafael_santos, 'Santos').
full_name(rafael_santos, 'Rafael Santos').
gender(rafael_santos, male).
alive(rafael_santos).
generation(rafael_santos, 1).
parent(antonio_santos, rafael_santos).
parent(clara_santos, rafael_santos).
location(rafael_santos, vila_dourada).

%% =====================================================
%% Ferreira Family (Azulejo Artists, Vila Dourada)
%% =====================================================

%% Jorge Ferreira
person(jorge_ferreira).
first_name(jorge_ferreira, 'Jorge').
last_name(jorge_ferreira, 'Ferreira').
full_name(jorge_ferreira, 'Jorge Ferreira').
gender(jorge_ferreira, male).
alive(jorge_ferreira).
generation(jorge_ferreira, 0).
founder_family(jorge_ferreira).
child(jorge_ferreira, carolina_ferreira).
child(jorge_ferreira, diogo_ferreira).
spouse(jorge_ferreira, helena_ferreira).
location(jorge_ferreira, vila_dourada).

%% Helena Ferreira
person(helena_ferreira).
first_name(helena_ferreira, 'Helena').
last_name(helena_ferreira, 'Ferreira').
full_name(helena_ferreira, 'Helena Ferreira').
gender(helena_ferreira, female).
alive(helena_ferreira).
generation(helena_ferreira, 0).
founder_family(helena_ferreira).
child(helena_ferreira, carolina_ferreira).
child(helena_ferreira, diogo_ferreira).
spouse(helena_ferreira, jorge_ferreira).
location(helena_ferreira, vila_dourada).

%% Carolina Ferreira
person(carolina_ferreira).
first_name(carolina_ferreira, 'Carolina').
last_name(carolina_ferreira, 'Ferreira').
full_name(carolina_ferreira, 'Carolina Ferreira').
gender(carolina_ferreira, female).
alive(carolina_ferreira).
generation(carolina_ferreira, 1).
parent(jorge_ferreira, carolina_ferreira).
parent(helena_ferreira, carolina_ferreira).
location(carolina_ferreira, vila_dourada).

%% Diogo Ferreira
person(diogo_ferreira).
first_name(diogo_ferreira, 'Diogo').
last_name(diogo_ferreira, 'Ferreira').
full_name(diogo_ferreira, 'Diogo Ferreira').
gender(diogo_ferreira, male).
alive(diogo_ferreira).
generation(diogo_ferreira, 1).
parent(jorge_ferreira, diogo_ferreira).
parent(helena_ferreira, diogo_ferreira).
location(diogo_ferreira, vila_dourada).

%% =====================================================
%% Pereira Family (Marina / Hotel, Vila Dourada)
%% =====================================================

%% Ricardo Pereira
person(ricardo_pereira).
first_name(ricardo_pereira, 'Ricardo').
last_name(ricardo_pereira, 'Pereira').
full_name(ricardo_pereira, 'Ricardo Pereira').
gender(ricardo_pereira, male).
alive(ricardo_pereira).
generation(ricardo_pereira, 0).
founder_family(ricardo_pereira).
child(ricardo_pereira, sofia_pereira).
child(ricardo_pereira, miguel_pereira).
spouse(ricardo_pereira, ana_pereira).
location(ricardo_pereira, vila_dourada).

%% Ana Pereira
person(ana_pereira).
first_name(ana_pereira, 'Ana').
last_name(ana_pereira, 'Pereira').
full_name(ana_pereira, 'Ana Pereira').
gender(ana_pereira, female).
alive(ana_pereira).
generation(ana_pereira, 0).
founder_family(ana_pereira).
child(ana_pereira, sofia_pereira).
child(ana_pereira, miguel_pereira).
spouse(ana_pereira, ricardo_pereira).
location(ana_pereira, vila_dourada).

%% Sofia Pereira
person(sofia_pereira).
first_name(sofia_pereira, 'Sofia').
last_name(sofia_pereira, 'Pereira').
full_name(sofia_pereira, 'Sofia Pereira').
gender(sofia_pereira, female).
alive(sofia_pereira).
generation(sofia_pereira, 1).
parent(ricardo_pereira, sofia_pereira).
parent(ana_pereira, sofia_pereira).
location(sofia_pereira, vila_dourada).

%% Miguel Pereira
person(miguel_pereira).
first_name(miguel_pereira, 'Miguel').
last_name(miguel_pereira, 'Pereira').
full_name(miguel_pereira, 'Miguel Pereira').
gender(miguel_pereira, male).
alive(miguel_pereira).
generation(miguel_pereira, 1).
parent(ricardo_pereira, miguel_pereira).
parent(ana_pereira, miguel_pereira).
location(miguel_pereira, vila_dourada).

%% =====================================================
%% Costa Family (Fishermen, Aldeia do Mar)
%% =====================================================

%% Joaquim Costa
person(joaquim_costa).
first_name(joaquim_costa, 'Joaquim').
last_name(joaquim_costa, 'Costa').
full_name(joaquim_costa, 'Joaquim Costa').
gender(joaquim_costa, male).
alive(joaquim_costa).
generation(joaquim_costa, 0).
founder_family(joaquim_costa).
child(joaquim_costa, catarina_costa).
child(joaquim_costa, pedro_costa).
spouse(joaquim_costa, rosa_costa).
location(joaquim_costa, aldeia_do_mar).

%% Rosa Costa
person(rosa_costa).
first_name(rosa_costa, 'Rosa').
last_name(rosa_costa, 'Costa').
full_name(rosa_costa, 'Rosa Costa').
gender(rosa_costa, female).
alive(rosa_costa).
generation(rosa_costa, 0).
founder_family(rosa_costa).
child(rosa_costa, catarina_costa).
child(rosa_costa, pedro_costa).
spouse(rosa_costa, joaquim_costa).
location(rosa_costa, aldeia_do_mar).

%% Catarina Costa
person(catarina_costa).
first_name(catarina_costa, 'Catarina').
last_name(catarina_costa, 'Costa').
full_name(catarina_costa, 'Catarina Costa').
gender(catarina_costa, female).
alive(catarina_costa).
generation(catarina_costa, 1).
parent(joaquim_costa, catarina_costa).
parent(rosa_costa, catarina_costa).
location(catarina_costa, aldeia_do_mar).

%% Pedro Costa
person(pedro_costa).
first_name(pedro_costa, 'Pedro').
last_name(pedro_costa, 'Costa').
full_name(pedro_costa, 'Pedro Costa').
gender(pedro_costa, male).
alive(pedro_costa).
generation(pedro_costa, 1).
parent(joaquim_costa, pedro_costa).
parent(rosa_costa, pedro_costa).
location(pedro_costa, aldeia_do_mar).

%% =====================================================
%% Oliveira Family (Cork Farmers, Aldeia do Mar)
%% =====================================================

%% Fernando Oliveira
person(fernando_oliveira).
first_name(fernando_oliveira, 'Fernando').
last_name(fernando_oliveira, 'Oliveira').
full_name(fernando_oliveira, 'Fernando Oliveira').
gender(fernando_oliveira, male).
alive(fernando_oliveira).
generation(fernando_oliveira, 0).
founder_family(fernando_oliveira).
child(fernando_oliveira, mariana_oliveira).
child(fernando_oliveira, rui_oliveira).
spouse(fernando_oliveira, teresa_oliveira).
location(fernando_oliveira, aldeia_do_mar).

%% Teresa Oliveira
person(teresa_oliveira).
first_name(teresa_oliveira, 'Teresa').
last_name(teresa_oliveira, 'Oliveira').
full_name(teresa_oliveira, 'Teresa Oliveira').
gender(teresa_oliveira, female).
alive(teresa_oliveira).
generation(teresa_oliveira, 0).
founder_family(teresa_oliveira).
child(teresa_oliveira, mariana_oliveira).
child(teresa_oliveira, rui_oliveira).
spouse(teresa_oliveira, fernando_oliveira).
location(teresa_oliveira, aldeia_do_mar).

%% Mariana Oliveira
person(mariana_oliveira).
first_name(mariana_oliveira, 'Mariana').
last_name(mariana_oliveira, 'Oliveira').
full_name(mariana_oliveira, 'Mariana Oliveira').
gender(mariana_oliveira, female).
alive(mariana_oliveira).
generation(mariana_oliveira, 1).
parent(fernando_oliveira, mariana_oliveira).
parent(teresa_oliveira, mariana_oliveira).
location(mariana_oliveira, aldeia_do_mar).

%% Rui Oliveira
person(rui_oliveira).
first_name(rui_oliveira, 'Rui').
last_name(rui_oliveira, 'Oliveira').
full_name(rui_oliveira, 'Rui Oliveira').
gender(rui_oliveira, male).
alive(rui_oliveira).
generation(rui_oliveira, 1).
parent(fernando_oliveira, rui_oliveira).
parent(teresa_oliveira, rui_oliveira).
location(rui_oliveira, aldeia_do_mar).
