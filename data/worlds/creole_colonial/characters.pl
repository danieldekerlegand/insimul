%% Insimul Characters: Creole Colonial
%% Source: data/worlds/creole_colonial/characters.pl
%% Created: 2026-04-03
%% Total: 18 characters (5 families + 3 unaffiliated)
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2

%% ═══════════════════════════════════════════════════════════
%% Beaumont Family (Plantation Owners, Nouvelle-Orleans)
%% ═══════════════════════════════════════════════════════════

%% Henri Beaumont
person(henri_beaumont).
first_name(henri_beaumont, 'Henri').
last_name(henri_beaumont, 'Beaumont').
full_name(henri_beaumont, 'Henri Beaumont').
gender(henri_beaumont, male).
alive(henri_beaumont).
generation(henri_beaumont, 0).
founder_family(henri_beaumont).
child(henri_beaumont, etienne_beaumont).
child(henri_beaumont, marguerite_beaumont).
spouse(henri_beaumont, claire_beaumont).
location(henri_beaumont, nouvelle_orleans).

%% Claire Beaumont
person(claire_beaumont).
first_name(claire_beaumont, 'Claire').
last_name(claire_beaumont, 'Beaumont').
full_name(claire_beaumont, 'Claire Beaumont').
gender(claire_beaumont, female).
alive(claire_beaumont).
generation(claire_beaumont, 0).
founder_family(claire_beaumont).
child(claire_beaumont, etienne_beaumont).
child(claire_beaumont, marguerite_beaumont).
spouse(claire_beaumont, henri_beaumont).
location(claire_beaumont, nouvelle_orleans).

%% Etienne Beaumont
person(etienne_beaumont).
first_name(etienne_beaumont, 'Etienne').
last_name(etienne_beaumont, 'Beaumont').
full_name(etienne_beaumont, 'Etienne Beaumont').
gender(etienne_beaumont, male).
alive(etienne_beaumont).
generation(etienne_beaumont, 1).
parent(etienne_beaumont, henri_beaumont).
parent(etienne_beaumont, claire_beaumont).
location(etienne_beaumont, nouvelle_orleans).

%% Marguerite Beaumont
person(marguerite_beaumont).
first_name(marguerite_beaumont, 'Marguerite').
last_name(marguerite_beaumont, 'Beaumont').
full_name(marguerite_beaumont, 'Marguerite Beaumont').
gender(marguerite_beaumont, female).
alive(marguerite_beaumont).
generation(marguerite_beaumont, 1).
parent(marguerite_beaumont, henri_beaumont).
parent(marguerite_beaumont, claire_beaumont).
location(marguerite_beaumont, nouvelle_orleans).

%% ═══════════════════════════════════════════════════════════
%% Toussaint Family (Free People of Color, Jewelers)
%% ═══════════════════════════════════════════════════════════

%% Jean-Pierre Toussaint
person(jean_pierre_toussaint).
first_name(jean_pierre_toussaint, 'Jean-Pierre').
last_name(jean_pierre_toussaint, 'Toussaint').
full_name(jean_pierre_toussaint, 'Jean-Pierre Toussaint').
gender(jean_pierre_toussaint, male).
alive(jean_pierre_toussaint).
generation(jean_pierre_toussaint, 0).
founder_family(jean_pierre_toussaint).
child(jean_pierre_toussaint, marie_toussaint).
spouse(jean_pierre_toussaint, adele_toussaint).
location(jean_pierre_toussaint, nouvelle_orleans).

%% Adele Toussaint
person(adele_toussaint).
first_name(adele_toussaint, 'Adele').
last_name(adele_toussaint, 'Toussaint').
full_name(adele_toussaint, 'Adele Toussaint').
gender(adele_toussaint, female).
alive(adele_toussaint).
generation(adele_toussaint, 0).
founder_family(adele_toussaint).
child(adele_toussaint, marie_toussaint).
spouse(adele_toussaint, jean_pierre_toussaint).
location(adele_toussaint, nouvelle_orleans).

%% Marie Toussaint
person(marie_toussaint).
first_name(marie_toussaint, 'Marie').
last_name(marie_toussaint, 'Toussaint').
full_name(marie_toussaint, 'Marie Toussaint').
gender(marie_toussaint, female).
alive(marie_toussaint).
generation(marie_toussaint, 1).
parent(marie_toussaint, jean_pierre_toussaint).
parent(marie_toussaint, adele_toussaint).
location(marie_toussaint, nouvelle_orleans).

%% ═══════════════════════════════════════════════════════════
%% Moreau Family (Merchants / Trading House)
%% ═══════════════════════════════════════════════════════════

%% Jacques Moreau
person(jacques_moreau).
first_name(jacques_moreau, 'Jacques').
last_name(jacques_moreau, 'Moreau').
full_name(jacques_moreau, 'Jacques Moreau').
gender(jacques_moreau, male).
alive(jacques_moreau).
generation(jacques_moreau, 0).
founder_family(jacques_moreau).
child(jacques_moreau, louis_moreau).
spouse(jacques_moreau, isabelle_moreau).
location(jacques_moreau, nouvelle_orleans).

%% Isabelle Moreau
person(isabelle_moreau).
first_name(isabelle_moreau, 'Isabelle').
last_name(isabelle_moreau, 'Moreau').
full_name(isabelle_moreau, 'Isabelle Moreau').
gender(isabelle_moreau, female).
alive(isabelle_moreau).
generation(isabelle_moreau, 0).
founder_family(isabelle_moreau).
child(isabelle_moreau, louis_moreau).
spouse(isabelle_moreau, jacques_moreau).
location(isabelle_moreau, nouvelle_orleans).

%% Louis Moreau
person(louis_moreau).
first_name(louis_moreau, 'Louis').
last_name(louis_moreau, 'Moreau').
full_name(louis_moreau, 'Louis Moreau').
gender(louis_moreau, male).
alive(louis_moreau).
generation(louis_moreau, 1).
parent(louis_moreau, jacques_moreau).
parent(louis_moreau, isabelle_moreau).
location(louis_moreau, nouvelle_orleans).

%% ═══════════════════════════════════════════════════════════
%% Boudreaux Family (Bayou Trappers / Fishers)
%% ═══════════════════════════════════════════════════════════

%% Remy Boudreaux
person(remy_boudreaux).
first_name(remy_boudreaux, 'Remy').
last_name(remy_boudreaux, 'Boudreaux').
full_name(remy_boudreaux, 'Remy Boudreaux').
gender(remy_boudreaux, male).
alive(remy_boudreaux).
generation(remy_boudreaux, 0).
founder_family(remy_boudreaux).
child(remy_boudreaux, pierre_boudreaux).
spouse(remy_boudreaux, josephine_boudreaux).
location(remy_boudreaux, bayou_vermillon).

%% Josephine Boudreaux
person(josephine_boudreaux).
first_name(josephine_boudreaux, 'Josephine').
last_name(josephine_boudreaux, 'Boudreaux').
full_name(josephine_boudreaux, 'Josephine Boudreaux').
gender(josephine_boudreaux, female).
alive(josephine_boudreaux).
generation(josephine_boudreaux, 0).
founder_family(josephine_boudreaux).
child(josephine_boudreaux, pierre_boudreaux).
spouse(josephine_boudreaux, remy_boudreaux).
location(josephine_boudreaux, bayou_vermillon).

%% Pierre Boudreaux
person(pierre_boudreaux).
first_name(pierre_boudreaux, 'Pierre').
last_name(pierre_boudreaux, 'Boudreaux').
full_name(pierre_boudreaux, 'Pierre Boudreaux').
gender(pierre_boudreaux, male).
alive(pierre_boudreaux).
generation(pierre_boudreaux, 1).
parent(pierre_boudreaux, remy_boudreaux).
parent(pierre_boudreaux, josephine_boudreaux).
location(pierre_boudreaux, bayou_vermillon).

%% ═══════════════════════════════════════════════════════════
%% Celeste Family (Voodoo / Healer tradition)
%% ═══════════════════════════════════════════════════════════

%% Mambo Celeste
person(mambo_celeste).
first_name(mambo_celeste, 'Celeste').
last_name(mambo_celeste, 'Celeste').
full_name(mambo_celeste, 'Mambo Celeste').
gender(mambo_celeste, female).
alive(mambo_celeste).
generation(mambo_celeste, 0).
founder_family(mambo_celeste).
location(mambo_celeste, nouvelle_orleans).

%% ═══════════════════════════════════════════════════════════
%% Unaffiliated Characters
%% ═══════════════════════════════════════════════════════════

%% Padre Ignacio Delgado (Spanish Priest)
person(padre_ignacio).
first_name(padre_ignacio, 'Ignacio').
last_name(padre_ignacio, 'Delgado').
full_name(padre_ignacio, 'Padre Ignacio Delgado').
gender(padre_ignacio, male).
alive(padre_ignacio).
generation(padre_ignacio, 0).
location(padre_ignacio, nouvelle_orleans).

%% Capitaine Lafitte (Privateer)
person(capitaine_lafitte).
first_name(capitaine_lafitte, 'Jean').
last_name(capitaine_lafitte, 'Lafitte').
full_name(capitaine_lafitte, 'Capitaine Lafitte').
gender(capitaine_lafitte, male).
alive(capitaine_lafitte).
generation(capitaine_lafitte, 0).
location(capitaine_lafitte, nouvelle_orleans).

%% Tante Rose (Elder Storyteller)
person(tante_rose).
first_name(tante_rose, 'Rose').
last_name(tante_rose, 'Rose').
full_name(tante_rose, 'Tante Rose').
gender(tante_rose, female).
alive(tante_rose).
generation(tante_rose, 0).
location(tante_rose, bayou_vermillon).
