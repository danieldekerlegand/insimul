%% Insimul Characters: Low Fantasy
%% Source: data/worlds/low_fantasy/characters.pl
%% Created: 2026-04-03
%% Total: 18 characters
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2

%% ═══════════════════════════════════════════════════════════
%% Grimhallow -- The Narrows
%% ═══════════════════════════════════════════════════════════

%% Marta Grieve -- tavern keeper, information broker
person(marta_grieve).
first_name(marta_grieve, 'Marta').
last_name(marta_grieve, 'Grieve').
full_name(marta_grieve, 'Marta Grieve').
gender(marta_grieve, female).
alive(marta_grieve).
generation(marta_grieve, 0).
founder_family(marta_grieve).
location(marta_grieve, grimhallow).

%% Dagna Grieve -- daughter of Marta, pickpocket and lookout
person(dagna_grieve).
first_name(dagna_grieve, 'Dagna').
last_name(dagna_grieve, 'Grieve').
full_name(dagna_grieve, 'Dagna Grieve').
gender(dagna_grieve, female).
alive(dagna_grieve).
generation(dagna_grieve, 1).
parent(dagna_grieve, marta_grieve).
child(marta_grieve, dagna_grieve).
location(dagna_grieve, grimhallow).

%% Gregor Voss -- pawnbroker, fence for stolen goods
person(gregor_voss).
first_name(gregor_voss, 'Gregor').
last_name(gregor_voss, 'Voss').
full_name(gregor_voss, 'Gregor Voss').
gender(gregor_voss, male).
alive(gregor_voss).
generation(gregor_voss, 0).
location(gregor_voss, grimhallow).

%% Old Mag -- hedge witch, herbalist, rumor-monger
person(old_mag).
first_name(old_mag, 'Mag').
last_name(old_mag, 'Unknown').
full_name(old_mag, 'Old Mag').
gender(old_mag, female).
alive(old_mag).
generation(old_mag, 0).
location(old_mag, grimhallow).

%% Roderick Blackthorn -- deserter turned thief boss
person(roderick_blackthorn).
first_name(roderick_blackthorn, 'Roderick').
last_name(roderick_blackthorn, 'Blackthorn').
full_name(roderick_blackthorn, 'Roderick Blackthorn').
gender(roderick_blackthorn, male).
alive(roderick_blackthorn).
generation(roderick_blackthorn, 0).
location(roderick_blackthorn, grimhallow).

%% ═══════════════════════════════════════════════════════════
%% Grimhallow -- Merchants Row
%% ═══════════════════════════════════════════════════════════

%% Aldric Copperton -- general store owner, deeply in debt
person(aldric_copperton).
first_name(aldric_copperton, 'Aldric').
last_name(aldric_copperton, 'Copperton').
full_name(aldric_copperton, 'Aldric Copperton').
gender(aldric_copperton, male).
alive(aldric_copperton).
generation(aldric_copperton, 0).
founder_family(aldric_copperton).
location(aldric_copperton, grimhallow).

%% Hilda Roth -- blacksmith, widowed, tough as nails
person(hilda_roth).
first_name(hilda_roth, 'Hilda').
last_name(hilda_roth, 'Roth').
full_name(hilda_roth, 'Hilda Roth').
gender(hilda_roth, female).
alive(hilda_roth).
generation(hilda_roth, 0).
founder_family(hilda_roth).
location(hilda_roth, grimhallow).

%% Evard Roth -- son of Hilda, apprentice smith
person(evard_roth).
first_name(evard_roth, 'Evard').
last_name(evard_roth, 'Roth').
full_name(evard_roth, 'Evard Roth').
gender(evard_roth, male).
alive(evard_roth).
generation(evard_roth, 1).
parent(evard_roth, hilda_roth).
child(hilda_roth, evard_roth).
location(evard_roth, grimhallow).

%% ═══════════════════════════════════════════════════════════
%% Grimhallow -- The Old Keep
%% ═══════════════════════════════════════════════════════════

%% Bailiff Wren -- corrupt local authority
person(bailiff_wren).
first_name(bailiff_wren, 'Osmund').
last_name(bailiff_wren, 'Wren').
full_name(bailiff_wren, 'Bailiff Wren').
gender(bailiff_wren, male).
alive(bailiff_wren).
generation(bailiff_wren, 0).
location(bailiff_wren, grimhallow).

%% Sister Ashara -- defrocked priestess, bitter and knowledgeable
person(sister_ashara).
first_name(sister_ashara, 'Ashara').
last_name(sister_ashara, 'None').
full_name(sister_ashara, 'Sister Ashara').
gender(sister_ashara, female).
alive(sister_ashara).
generation(sister_ashara, 0).
location(sister_ashara, grimhallow).

%% ═══════════════════════════════════════════════════════════
%% Thornfield
%% ═══════════════════════════════════════════════════════════

%% Brenna Ashwood -- village healer, knows forbidden lore
person(brenna_ashwood).
first_name(brenna_ashwood, 'Brenna').
last_name(brenna_ashwood, 'Ashwood').
full_name(brenna_ashwood, 'Brenna Ashwood').
gender(brenna_ashwood, female).
alive(brenna_ashwood).
generation(brenna_ashwood, 0).
founder_family(brenna_ashwood).
location(brenna_ashwood, thornfield).

%% Captain Jorik Hale -- mercenary captain, pragmatic veteran
person(jorik_hale).
first_name(jorik_hale, 'Jorik').
last_name(jorik_hale, 'Hale').
full_name(jorik_hale, 'Jorik Hale').
gender(jorik_hale, male).
alive(jorik_hale).
generation(jorik_hale, 0).
location(jorik_hale, thornfield).

%% Tilda Harrow -- farmer, former soldier
person(tilda_harrow).
first_name(tilda_harrow, 'Tilda').
last_name(tilda_harrow, 'Harrow').
full_name(tilda_harrow, 'Tilda Harrow').
gender(tilda_harrow, female).
alive(tilda_harrow).
generation(tilda_harrow, 0).
founder_family(tilda_harrow).
location(tilda_harrow, thornfield).

%% Colm Harrow -- son of Tilda, eager and naive
person(colm_harrow).
first_name(colm_harrow, 'Colm').
last_name(colm_harrow, 'Harrow').
full_name(colm_harrow, 'Colm Harrow').
gender(colm_harrow, male).
alive(colm_harrow).
generation(colm_harrow, 1).
parent(colm_harrow, tilda_harrow).
child(tilda_harrow, colm_harrow).
location(colm_harrow, thornfield).

%% ═══════════════════════════════════════════════════════════
%% Saltmire
%% ═══════════════════════════════════════════════════════════

%% Silas Marsh -- smuggler kingpin, ruthless businessman
person(silas_marsh).
first_name(silas_marsh, 'Silas').
last_name(silas_marsh, 'Marsh').
full_name(silas_marsh, 'Silas Marsh').
gender(silas_marsh, male).
alive(silas_marsh).
generation(silas_marsh, 0).
founder_family(silas_marsh).
location(silas_marsh, saltmire).

%% Veska -- foreign sellsword, no family name given
person(veska).
first_name(veska, 'Veska').
last_name(veska, 'Unknown').
full_name(veska, 'Veska').
gender(veska, female).
alive(veska).
generation(veska, 0).
location(veska, saltmire).

%% Nils Inkblot -- forger of documents and seals
person(nils_inkblot).
first_name(nils_inkblot, 'Nils').
last_name(nils_inkblot, 'Inkblot').
full_name(nils_inkblot, 'Nils Inkblot').
gender(nils_inkblot, male).
alive(nils_inkblot).
generation(nils_inkblot, 0).
location(nils_inkblot, saltmire).

%% Lord Edric Vane -- dispossessed noble hiding among smugglers
person(edric_vane).
first_name(edric_vane, 'Edric').
last_name(edric_vane, 'Vane').
full_name(edric_vane, 'Lord Edric Vane').
gender(edric_vane, male).
alive(edric_vane).
generation(edric_vane, 0).
location(edric_vane, saltmire).
