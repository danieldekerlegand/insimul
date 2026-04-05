%% Insimul Characters: German Rhineland
%% Source: data/worlds/language/german/characters.pl
%% Created: 2026-04-03
%% Total: 24 characters (6 families)
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2

%% ===============================================================
%% Mueller Family (Vintners, Rheinhausen)
%% ===============================================================

%% Hans Mueller
person(hans_mueller).
first_name(hans_mueller, 'Hans').
last_name(hans_mueller, 'Mueller').
full_name(hans_mueller, 'Hans Mueller').
gender(hans_mueller, male).
alive(hans_mueller).
generation(hans_mueller, 0).
founder_family(hans_mueller).
child(hans_mueller, anna_mueller).
child(hans_mueller, tobias_mueller).
spouse(hans_mueller, ingrid_mueller).
location(hans_mueller, rheinhausen).

%% Ingrid Mueller
person(ingrid_mueller).
first_name(ingrid_mueller, 'Ingrid').
last_name(ingrid_mueller, 'Mueller').
full_name(ingrid_mueller, 'Ingrid Mueller').
gender(ingrid_mueller, female).
alive(ingrid_mueller).
generation(ingrid_mueller, 0).
founder_family(ingrid_mueller).
child(ingrid_mueller, anna_mueller).
child(ingrid_mueller, tobias_mueller).
spouse(ingrid_mueller, hans_mueller).
location(ingrid_mueller, rheinhausen).

%% Anna Mueller
person(anna_mueller).
first_name(anna_mueller, 'Anna').
last_name(anna_mueller, 'Mueller').
full_name(anna_mueller, 'Anna Mueller').
gender(anna_mueller, female).
alive(anna_mueller).
generation(anna_mueller, 1).
parent(hans_mueller, anna_mueller).
parent(ingrid_mueller, anna_mueller).
location(anna_mueller, rheinhausen).

%% Tobias Mueller
person(tobias_mueller).
first_name(tobias_mueller, 'Tobias').
last_name(tobias_mueller, 'Mueller').
full_name(tobias_mueller, 'Tobias Mueller').
gender(tobias_mueller, male).
alive(tobias_mueller).
generation(tobias_mueller, 1).
parent(hans_mueller, tobias_mueller).
parent(ingrid_mueller, tobias_mueller).
location(tobias_mueller, rheinhausen).

%% ===============================================================
%% Schmidt Family (University Professors, Rheinhausen)
%% ===============================================================

%% Klaus Schmidt
person(klaus_schmidt).
first_name(klaus_schmidt, 'Klaus').
last_name(klaus_schmidt, 'Schmidt').
full_name(klaus_schmidt, 'Klaus Schmidt').
gender(klaus_schmidt, male).
alive(klaus_schmidt).
generation(klaus_schmidt, 0).
founder_family(klaus_schmidt).
child(klaus_schmidt, lena_schmidt).
child(klaus_schmidt, markus_schmidt).
spouse(klaus_schmidt, petra_schmidt).
location(klaus_schmidt, rheinhausen).

%% Petra Schmidt
person(petra_schmidt).
first_name(petra_schmidt, 'Petra').
last_name(petra_schmidt, 'Schmidt').
full_name(petra_schmidt, 'Petra Schmidt').
gender(petra_schmidt, female).
alive(petra_schmidt).
generation(petra_schmidt, 0).
founder_family(petra_schmidt).
child(petra_schmidt, lena_schmidt).
child(petra_schmidt, markus_schmidt).
spouse(petra_schmidt, klaus_schmidt).
location(petra_schmidt, rheinhausen).

%% Lena Schmidt
person(lena_schmidt).
first_name(lena_schmidt, 'Lena').
last_name(lena_schmidt, 'Schmidt').
full_name(lena_schmidt, 'Lena Schmidt').
gender(lena_schmidt, female).
alive(lena_schmidt).
generation(lena_schmidt, 1).
parent(klaus_schmidt, lena_schmidt).
parent(petra_schmidt, lena_schmidt).
location(lena_schmidt, rheinhausen).

%% Markus Schmidt
person(markus_schmidt).
first_name(markus_schmidt, 'Markus').
last_name(markus_schmidt, 'Schmidt').
full_name(markus_schmidt, 'Markus Schmidt').
gender(markus_schmidt, male).
alive(markus_schmidt).
generation(markus_schmidt, 1).
parent(klaus_schmidt, markus_schmidt).
parent(petra_schmidt, markus_schmidt).
location(markus_schmidt, rheinhausen).

%% ===============================================================
%% Fischer Family (Bakery Owners, Rheinhausen)
%% ===============================================================

%% Dieter Fischer
person(dieter_fischer).
first_name(dieter_fischer, 'Dieter').
last_name(dieter_fischer, 'Fischer').
full_name(dieter_fischer, 'Dieter Fischer').
gender(dieter_fischer, male).
alive(dieter_fischer).
generation(dieter_fischer, 0).
founder_family(dieter_fischer).
child(dieter_fischer, julia_fischer).
child(dieter_fischer, stefan_fischer).
spouse(dieter_fischer, monika_fischer).
location(dieter_fischer, rheinhausen).

%% Monika Fischer
person(monika_fischer).
first_name(monika_fischer, 'Monika').
last_name(monika_fischer, 'Fischer').
full_name(monika_fischer, 'Monika Fischer').
gender(monika_fischer, female).
alive(monika_fischer).
generation(monika_fischer, 0).
founder_family(monika_fischer).
child(monika_fischer, julia_fischer).
child(monika_fischer, stefan_fischer).
spouse(monika_fischer, dieter_fischer).
location(monika_fischer, rheinhausen).

%% Julia Fischer
person(julia_fischer).
first_name(julia_fischer, 'Julia').
last_name(julia_fischer, 'Fischer').
full_name(julia_fischer, 'Julia Fischer').
gender(julia_fischer, female).
alive(julia_fischer).
generation(julia_fischer, 1).
parent(dieter_fischer, julia_fischer).
parent(monika_fischer, julia_fischer).
location(julia_fischer, rheinhausen).

%% Stefan Fischer
person(stefan_fischer).
first_name(stefan_fischer, 'Stefan').
last_name(stefan_fischer, 'Fischer').
full_name(stefan_fischer, 'Stefan Fischer').
gender(stefan_fischer, male).
alive(stefan_fischer).
generation(stefan_fischer, 1).
parent(dieter_fischer, stefan_fischer).
parent(monika_fischer, stefan_fischer).
location(stefan_fischer, rheinhausen).

%% ===============================================================
%% Weber Family (Butcher and Pharmacist, Rheinhausen)
%% ===============================================================

%% Friedrich Weber
person(friedrich_weber).
first_name(friedrich_weber, 'Friedrich').
last_name(friedrich_weber, 'Weber').
full_name(friedrich_weber, 'Friedrich Weber').
gender(friedrich_weber, male).
alive(friedrich_weber).
generation(friedrich_weber, 0).
founder_family(friedrich_weber).
child(friedrich_weber, sophie_weber).
child(friedrich_weber, lukas_weber).
spouse(friedrich_weber, elisabeth_weber).
location(friedrich_weber, rheinhausen).

%% Elisabeth Weber
person(elisabeth_weber).
first_name(elisabeth_weber, 'Elisabeth').
last_name(elisabeth_weber, 'Weber').
full_name(elisabeth_weber, 'Elisabeth Weber').
gender(elisabeth_weber, female).
alive(elisabeth_weber).
generation(elisabeth_weber, 0).
founder_family(elisabeth_weber).
child(elisabeth_weber, sophie_weber).
child(elisabeth_weber, lukas_weber).
spouse(elisabeth_weber, friedrich_weber).
location(elisabeth_weber, rheinhausen).

%% Sophie Weber
person(sophie_weber).
first_name(sophie_weber, 'Sophie').
last_name(sophie_weber, 'Weber').
full_name(sophie_weber, 'Sophie Weber').
gender(sophie_weber, female).
alive(sophie_weber).
generation(sophie_weber, 1).
parent(friedrich_weber, sophie_weber).
parent(elisabeth_weber, sophie_weber).
location(sophie_weber, rheinhausen).

%% Lukas Weber
person(lukas_weber).
first_name(lukas_weber, 'Lukas').
last_name(lukas_weber, 'Weber').
full_name(lukas_weber, 'Lukas Weber').
gender(lukas_weber, male).
alive(lukas_weber).
generation(lukas_weber, 1).
parent(friedrich_weber, lukas_weber).
parent(elisabeth_weber, lukas_weber).
location(lukas_weber, rheinhausen).

%% ===============================================================
%% Wagner Family (Restaurant Owners, Rheinhausen)
%% ===============================================================

%% Wolfgang Wagner
person(wolfgang_wagner).
first_name(wolfgang_wagner, 'Wolfgang').
last_name(wolfgang_wagner, 'Wagner').
full_name(wolfgang_wagner, 'Wolfgang Wagner').
gender(wolfgang_wagner, male).
alive(wolfgang_wagner).
generation(wolfgang_wagner, 0).
founder_family(wolfgang_wagner).
child(wolfgang_wagner, katrin_wagner).
child(wolfgang_wagner, felix_wagner).
spouse(wolfgang_wagner, brigitte_wagner).
location(wolfgang_wagner, rheinhausen).

%% Brigitte Wagner
person(brigitte_wagner).
first_name(brigitte_wagner, 'Brigitte').
last_name(brigitte_wagner, 'Wagner').
full_name(brigitte_wagner, 'Brigitte Wagner').
gender(brigitte_wagner, female).
alive(brigitte_wagner).
generation(brigitte_wagner, 0).
founder_family(brigitte_wagner).
child(brigitte_wagner, katrin_wagner).
child(brigitte_wagner, felix_wagner).
spouse(brigitte_wagner, wolfgang_wagner).
location(brigitte_wagner, rheinhausen).

%% Katrin Wagner
person(katrin_wagner).
first_name(katrin_wagner, 'Katrin').
last_name(katrin_wagner, 'Wagner').
full_name(katrin_wagner, 'Katrin Wagner').
gender(katrin_wagner, female).
alive(katrin_wagner).
generation(katrin_wagner, 1).
parent(wolfgang_wagner, katrin_wagner).
parent(brigitte_wagner, katrin_wagner).
location(katrin_wagner, rheinhausen).

%% Felix Wagner
person(felix_wagner).
first_name(felix_wagner, 'Felix').
last_name(felix_wagner, 'Wagner').
full_name(felix_wagner, 'Felix Wagner').
gender(felix_wagner, male).
alive(felix_wagner).
generation(felix_wagner, 1).
parent(wolfgang_wagner, felix_wagner).
parent(brigitte_wagner, felix_wagner).
location(felix_wagner, rheinhausen).

%% ===============================================================
%% Schaefer Family (Wine Growers, Weinfeld)
%% ===============================================================

%% Heinrich Schaefer
person(heinrich_schaefer).
first_name(heinrich_schaefer, 'Heinrich').
last_name(heinrich_schaefer, 'Schaefer').
full_name(heinrich_schaefer, 'Heinrich Schaefer').
gender(heinrich_schaefer, male).
alive(heinrich_schaefer).
generation(heinrich_schaefer, 0).
founder_family(heinrich_schaefer).
child(heinrich_schaefer, marie_schaefer).
child(heinrich_schaefer, thomas_schaefer).
spouse(heinrich_schaefer, renate_schaefer).
location(heinrich_schaefer, weinfeld).

%% Renate Schaefer
person(renate_schaefer).
first_name(renate_schaefer, 'Renate').
last_name(renate_schaefer, 'Schaefer').
full_name(renate_schaefer, 'Renate Schaefer').
gender(renate_schaefer, female).
alive(renate_schaefer).
generation(renate_schaefer, 0).
founder_family(renate_schaefer).
child(renate_schaefer, marie_schaefer).
child(renate_schaefer, thomas_schaefer).
spouse(renate_schaefer, heinrich_schaefer).
location(renate_schaefer, weinfeld).

%% Marie Schaefer
person(marie_schaefer).
first_name(marie_schaefer, 'Marie').
last_name(marie_schaefer, 'Schaefer').
full_name(marie_schaefer, 'Marie Schaefer').
gender(marie_schaefer, female).
alive(marie_schaefer).
generation(marie_schaefer, 1).
parent(heinrich_schaefer, marie_schaefer).
parent(renate_schaefer, marie_schaefer).
location(marie_schaefer, weinfeld).

%% Thomas Schaefer
person(thomas_schaefer).
first_name(thomas_schaefer, 'Thomas').
last_name(thomas_schaefer, 'Schaefer').
full_name(thomas_schaefer, 'Thomas Schaefer').
gender(thomas_schaefer, male).
alive(thomas_schaefer).
generation(thomas_schaefer, 1).
parent(heinrich_schaefer, thomas_schaefer).
parent(renate_schaefer, thomas_schaefer).
location(thomas_schaefer, weinfeld).
