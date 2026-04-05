%% Insimul Characters: Tropical Pirate
%% Source: data/worlds/tropical_pirate/characters.pl
%% Created: 2026-04-03
%% Total: 18 characters (pirates, colonials, civilians)
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2

%% ═══════════════════════════════════════════════════════════
%% Pirates
%% ═══════════════════════════════════════════════════════════

%% Captain Redbeard Jack Hawkins
person(jack_hawkins).
first_name(jack_hawkins, 'Jack').
last_name(jack_hawkins, 'Hawkins').
full_name(jack_hawkins, 'Jack Hawkins').
gender(jack_hawkins, male).
alive(jack_hawkins).
generation(jack_hawkins, 0).
founder_family(jack_hawkins).
location(jack_hawkins, port_royal).

%% First Mate Anne Blacktide
person(anne_blacktide).
first_name(anne_blacktide, 'Anne').
last_name(anne_blacktide, 'Blacktide').
full_name(anne_blacktide, 'Anne Blacktide').
gender(anne_blacktide, female).
alive(anne_blacktide).
generation(anne_blacktide, 0).
founder_family(anne_blacktide).
location(anne_blacktide, port_royal).

%% Quartermaster Silas Crow
person(silas_crow).
first_name(silas_crow, 'Silas').
last_name(silas_crow, 'Crow').
full_name(silas_crow, 'Silas Crow').
gender(silas_crow, male).
alive(silas_crow).
generation(silas_crow, 0).
location(silas_crow, port_royal).

%% Navigator Estrella Santos
person(estrella_santos).
first_name(estrella_santos, 'Estrella').
last_name(estrella_santos, 'Santos').
full_name(estrella_santos, 'Estrella Santos').
gender(estrella_santos, female).
alive(estrella_santos).
generation(estrella_santos, 0).
location(estrella_santos, port_royal).

%% Gunner One-Eye Morgan
person(morgan_flint).
first_name(morgan_flint, 'Morgan').
last_name(morgan_flint, 'Flint').
full_name(morgan_flint, 'Morgan Flint').
gender(morgan_flint, male).
alive(morgan_flint).
generation(morgan_flint, 0).
location(morgan_flint, isla_tortuga).

%% Captain Bloody Mary Thorne
person(mary_thorne).
first_name(mary_thorne, 'Mary').
last_name(mary_thorne, 'Thorne').
full_name(mary_thorne, 'Mary Thorne').
gender(mary_thorne, female).
alive(mary_thorne).
generation(mary_thorne, 0).
founder_family(mary_thorne).
location(mary_thorne, isla_tortuga).

%% ═══════════════════════════════════════════════════════════
%% Colonial Officials and Military
%% ═══════════════════════════════════════════════════════════

%% Governor Don Alejandro de la Cruz
person(alejandro_de_la_cruz).
first_name(alejandro_de_la_cruz, 'Alejandro').
last_name(alejandro_de_la_cruz, 'de la Cruz').
full_name(alejandro_de_la_cruz, 'Alejandro de la Cruz').
gender(alejandro_de_la_cruz, male).
alive(alejandro_de_la_cruz).
generation(alejandro_de_la_cruz, 0).
founder_family(alejandro_de_la_cruz).
spouse(alejandro_de_la_cruz, isabella_de_la_cruz).
child(alejandro_de_la_cruz, sofia_de_la_cruz).
location(alejandro_de_la_cruz, san_castillo).

%% Dona Isabella de la Cruz
person(isabella_de_la_cruz).
first_name(isabella_de_la_cruz, 'Isabella').
last_name(isabella_de_la_cruz, 'de la Cruz').
full_name(isabella_de_la_cruz, 'Isabella de la Cruz').
gender(isabella_de_la_cruz, female).
alive(isabella_de_la_cruz).
generation(isabella_de_la_cruz, 0).
founder_family(isabella_de_la_cruz).
spouse(isabella_de_la_cruz, alejandro_de_la_cruz).
child(isabella_de_la_cruz, sofia_de_la_cruz).
location(isabella_de_la_cruz, san_castillo).

%% Sofia de la Cruz
person(sofia_de_la_cruz).
first_name(sofia_de_la_cruz, 'Sofia').
last_name(sofia_de_la_cruz, 'de la Cruz').
full_name(sofia_de_la_cruz, 'Sofia de la Cruz').
gender(sofia_de_la_cruz, female).
alive(sofia_de_la_cruz).
generation(sofia_de_la_cruz, 1).
parent(alejandro_de_la_cruz, sofia_de_la_cruz).
parent(isabella_de_la_cruz, sofia_de_la_cruz).
location(sofia_de_la_cruz, san_castillo).

%% Captain Rodrigo Vega -- Navy Commander
person(rodrigo_vega).
first_name(rodrigo_vega, 'Rodrigo').
last_name(rodrigo_vega, 'Vega').
full_name(rodrigo_vega, 'Rodrigo Vega').
gender(rodrigo_vega, male).
alive(rodrigo_vega).
generation(rodrigo_vega, 0).
location(rodrigo_vega, san_castillo).

%% ═══════════════════════════════════════════════════════════
%% Merchants and Civilians
%% ═══════════════════════════════════════════════════════════

%% Barnacle Bill -- Shipwright
person(barnacle_bill).
first_name(barnacle_bill, 'Bill').
last_name(barnacle_bill, 'Barnacle').
full_name(barnacle_bill, 'Barnacle Bill').
gender(barnacle_bill, male).
alive(barnacle_bill).
generation(barnacle_bill, 0).
location(barnacle_bill, port_royal).

%% Mama Celeste -- Tavern Owner
person(mama_celeste).
first_name(mama_celeste, 'Celeste').
last_name(mama_celeste, 'Moreau').
full_name(mama_celeste, 'Celeste Moreau').
gender(mama_celeste, female).
alive(mama_celeste).
generation(mama_celeste, 0).
location(mama_celeste, port_royal).

%% Old Finch -- Apothecary
person(old_finch).
first_name(old_finch, 'Elias').
last_name(old_finch, 'Finch').
full_name(old_finch, 'Elias Finch').
gender(old_finch, male).
alive(old_finch).
generation(old_finch, 0).
location(old_finch, port_royal).

%% Mapmaker Hana Sato
person(hana_sato).
first_name(hana_sato, 'Hana').
last_name(hana_sato, 'Sato').
full_name(hana_sato, 'Hana Sato').
gender(hana_sato, female).
alive(hana_sato).
generation(hana_sato, 0).
location(hana_sato, port_royal).

%% Fence -- Gilded Parrot Jewelers
person(claude_dubois).
first_name(claude_dubois, 'Claude').
last_name(claude_dubois, 'Dubois').
full_name(claude_dubois, 'Claude Dubois').
gender(claude_dubois, male).
alive(claude_dubois).
generation(claude_dubois, 0).
location(claude_dubois, port_royal).

%% Padre Miguel -- Priest
person(padre_miguel).
first_name(padre_miguel, 'Miguel').
last_name(padre_miguel, 'Cortez').
full_name(padre_miguel, 'Miguel Cortez').
gender(padre_miguel, male).
alive(padre_miguel).
generation(padre_miguel, 0).
location(padre_miguel, san_castillo).

%% Nkechi -- Freed Sailor
person(nkechi_obi).
first_name(nkechi_obi, 'Nkechi').
last_name(nkechi_obi, 'Obi').
full_name(nkechi_obi, 'Nkechi Obi').
gender(nkechi_obi, male).
alive(nkechi_obi).
generation(nkechi_obi, 0).
location(nkechi_obi, isla_tortuga).

%% Rosalita -- Tattoo Artist
person(rosalita_vega).
first_name(rosalita_vega, 'Rosalita').
last_name(rosalita_vega, 'Vega').
full_name(rosalita_vega, 'Rosalita Vega').
gender(rosalita_vega, female).
alive(rosalita_vega).
generation(rosalita_vega, 0).
location(rosalita_vega, port_royal).
