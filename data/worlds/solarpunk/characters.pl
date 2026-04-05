%% Insimul Characters: Solarpunk Eco-Communities
%% Source: data/worlds/solarpunk/characters.pl
%% Created: 2026-04-03
%% Total: 18 characters (4 families + 2 independents)
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2

%% =====================================================
%% Okafor Family (Solar Engineers, Heliotrope Commons)
%% =====================================================

%% Emeka Okafor
person(emeka_okafor).
first_name(emeka_okafor, 'Emeka').
last_name(emeka_okafor, 'Okafor').
full_name(emeka_okafor, 'Emeka Okafor').
gender(emeka_okafor, male).
alive(emeka_okafor).
generation(emeka_okafor, 0).
founder_family(emeka_okafor).
child(emeka_okafor, zuri_okafor).
child(emeka_okafor, kofi_okafor).
spouse(emeka_okafor, nia_okafor).
location(emeka_okafor, heliotrope_commons).

%% Nia Okafor
person(nia_okafor).
first_name(nia_okafor, 'Nia').
last_name(nia_okafor, 'Okafor').
full_name(nia_okafor, 'Nia Okafor').
gender(nia_okafor, female).
alive(nia_okafor).
generation(nia_okafor, 0).
founder_family(nia_okafor).
child(nia_okafor, zuri_okafor).
child(nia_okafor, kofi_okafor).
spouse(nia_okafor, emeka_okafor).
location(nia_okafor, heliotrope_commons).

%% Zuri Okafor
person(zuri_okafor).
first_name(zuri_okafor, 'Zuri').
last_name(zuri_okafor, 'Okafor').
full_name(zuri_okafor, 'Zuri Okafor').
gender(zuri_okafor, female).
alive(zuri_okafor).
generation(zuri_okafor, 1).
parent(emeka_okafor, zuri_okafor).
parent(nia_okafor, zuri_okafor).
location(zuri_okafor, heliotrope_commons).

%% Kofi Okafor
person(kofi_okafor).
first_name(kofi_okafor, 'Kofi').
last_name(kofi_okafor, 'Okafor').
full_name(kofi_okafor, 'Kofi Okafor').
gender(kofi_okafor, male).
alive(kofi_okafor).
generation(kofi_okafor, 1).
parent(emeka_okafor, kofi_okafor).
parent(nia_okafor, kofi_okafor).
location(kofi_okafor, heliotrope_commons).

%% =====================================================
%% Vasquez Family (Community Organizers, Heliotrope Commons)
%% =====================================================

%% Elena Vasquez
person(elena_vasquez).
first_name(elena_vasquez, 'Elena').
last_name(elena_vasquez, 'Vasquez').
full_name(elena_vasquez, 'Elena Vasquez').
gender(elena_vasquez, female).
alive(elena_vasquez).
generation(elena_vasquez, 0).
founder_family(elena_vasquez).
child(elena_vasquez, rio_vasquez).
child(elena_vasquez, sol_vasquez).
spouse(elena_vasquez, mateo_vasquez).
location(elena_vasquez, heliotrope_commons).

%% Mateo Vasquez
person(mateo_vasquez).
first_name(mateo_vasquez, 'Mateo').
last_name(mateo_vasquez, 'Mateo').
full_name(mateo_vasquez, 'Mateo Vasquez').
gender(mateo_vasquez, male).
alive(mateo_vasquez).
generation(mateo_vasquez, 0).
founder_family(mateo_vasquez).
child(mateo_vasquez, rio_vasquez).
child(mateo_vasquez, sol_vasquez).
spouse(mateo_vasquez, elena_vasquez).
location(mateo_vasquez, heliotrope_commons).

%% Rio Vasquez
person(rio_vasquez).
first_name(rio_vasquez, 'Rio').
last_name(rio_vasquez, 'Vasquez').
full_name(rio_vasquez, 'Rio Vasquez').
gender(rio_vasquez, nonbinary).
alive(rio_vasquez).
generation(rio_vasquez, 1).
parent(elena_vasquez, rio_vasquez).
parent(mateo_vasquez, rio_vasquez).
location(rio_vasquez, heliotrope_commons).

%% Sol Vasquez
person(sol_vasquez).
first_name(sol_vasquez, 'Sol').
last_name(sol_vasquez, 'Vasquez').
full_name(sol_vasquez, 'Sol Vasquez').
gender(sol_vasquez, female).
alive(sol_vasquez).
generation(sol_vasquez, 1).
parent(elena_vasquez, sol_vasquez).
parent(mateo_vasquez, sol_vasquez).
location(sol_vasquez, heliotrope_commons).

%% =====================================================
%% Tanaka Family (Bioengineers, Heliotrope Commons)
%% =====================================================

%% Hiro Tanaka
person(hiro_tanaka).
first_name(hiro_tanaka, 'Hiro').
last_name(hiro_tanaka, 'Tanaka').
full_name(hiro_tanaka, 'Hiro Tanaka').
gender(hiro_tanaka, male).
alive(hiro_tanaka).
generation(hiro_tanaka, 0).
founder_family(hiro_tanaka).
child(hiro_tanaka, yuki_tanaka).
child(hiro_tanaka, kai_tanaka).
spouse(hiro_tanaka, priya_tanaka).
location(hiro_tanaka, heliotrope_commons).

%% Priya Tanaka
person(priya_tanaka).
first_name(priya_tanaka, 'Priya').
last_name(priya_tanaka, 'Tanaka').
full_name(priya_tanaka, 'Priya Tanaka').
gender(priya_tanaka, female).
alive(priya_tanaka).
generation(priya_tanaka, 0).
founder_family(priya_tanaka).
child(priya_tanaka, yuki_tanaka).
child(priya_tanaka, kai_tanaka).
spouse(priya_tanaka, hiro_tanaka).
location(priya_tanaka, heliotrope_commons).

%% Yuki Tanaka
person(yuki_tanaka).
first_name(yuki_tanaka, 'Yuki').
last_name(yuki_tanaka, 'Tanaka').
full_name(yuki_tanaka, 'Yuki Tanaka').
gender(yuki_tanaka, female).
alive(yuki_tanaka).
generation(yuki_tanaka, 1).
parent(hiro_tanaka, yuki_tanaka).
parent(priya_tanaka, yuki_tanaka).
location(yuki_tanaka, heliotrope_commons).

%% Kai Tanaka
person(kai_tanaka).
first_name(kai_tanaka, 'Kai').
last_name(kai_tanaka, 'Tanaka').
full_name(kai_tanaka, 'Kai Tanaka').
gender(kai_tanaka, male).
alive(kai_tanaka).
generation(kai_tanaka, 1).
parent(hiro_tanaka, kai_tanaka).
parent(priya_tanaka, kai_tanaka).
location(kai_tanaka, heliotrope_commons).

%% =====================================================
%% Maren Family (Marine Ecologists, Tidecrest Village)
%% =====================================================

%% Astrid Maren
person(astrid_maren).
first_name(astrid_maren, 'Astrid').
last_name(astrid_maren, 'Maren').
full_name(astrid_maren, 'Astrid Maren').
gender(astrid_maren, female).
alive(astrid_maren).
generation(astrid_maren, 0).
founder_family(astrid_maren).
child(astrid_maren, finn_maren).
child(astrid_maren, lena_maren).
spouse(astrid_maren, soren_maren).
location(astrid_maren, tidecrest_village).

%% Soren Maren
person(soren_maren).
first_name(soren_maren, 'Soren').
last_name(soren_maren, 'Maren').
full_name(soren_maren, 'Soren Maren').
gender(soren_maren, male).
alive(soren_maren).
generation(soren_maren, 0).
founder_family(soren_maren).
child(soren_maren, finn_maren).
child(soren_maren, lena_maren).
spouse(soren_maren, astrid_maren).
location(soren_maren, tidecrest_village).

%% Finn Maren
person(finn_maren).
first_name(finn_maren, 'Finn').
last_name(finn_maren, 'Maren').
full_name(finn_maren, 'Finn Maren').
gender(finn_maren, male).
alive(finn_maren).
generation(finn_maren, 1).
parent(astrid_maren, finn_maren).
parent(soren_maren, finn_maren).
location(finn_maren, tidecrest_village).

%% Lena Maren
person(lena_maren).
first_name(lena_maren, 'Lena').
last_name(lena_maren, 'Maren').
full_name(lena_maren, 'Lena Maren').
gender(lena_maren, female).
alive(lena_maren).
generation(lena_maren, 1).
parent(astrid_maren, lena_maren).
parent(soren_maren, lena_maren).
location(lena_maren, tidecrest_village).

%% =====================================================
%% Independent Characters
%% =====================================================

%% Olu Adeyemi -- Mycelium Researcher (independent, Heliotrope Commons)
person(olu_adeyemi).
first_name(olu_adeyemi, 'Olu').
last_name(olu_adeyemi, 'Adeyemi').
full_name(olu_adeyemi, 'Olu Adeyemi').
gender(olu_adeyemi, male).
alive(olu_adeyemi).
generation(olu_adeyemi, 0).
location(olu_adeyemi, heliotrope_commons).

%% Wren Calloway -- Forest Ranger (independent, Roothold Hamlet)
person(wren_calloway).
first_name(wren_calloway, 'Wren').
last_name(wren_calloway, 'Calloway').
full_name(wren_calloway, 'Wren Calloway').
gender(wren_calloway, nonbinary).
alive(wren_calloway).
generation(wren_calloway, 0).
location(wren_calloway, roothold_hamlet).
