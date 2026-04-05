%% Insimul Characters: Generic Fantasy World
%% Source: data/worlds/generic/characters.pl
%% Created: 2026-04-03
%% Total: 18 characters (4 families + 2 unattached)
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2

%% ═══════════════════════════════════════════════════════════
%% Aldric Family (Blacksmith, Stonehaven)
%% ═══════════════════════════════════════════════════════════

%% Gareth Aldric -- Town blacksmith
person(gareth_aldric).
first_name(gareth_aldric, 'Gareth').
last_name(gareth_aldric, 'Aldric').
full_name(gareth_aldric, 'Gareth Aldric').
gender(gareth_aldric, male).
alive(gareth_aldric).
generation(gareth_aldric, 0).
founder_family(gareth_aldric).
child(gareth_aldric, rowan_aldric).
child(gareth_aldric, mira_aldric).
spouse(gareth_aldric, elara_aldric).
location(gareth_aldric, stonehaven).

%% Elara Aldric -- Herbalist and healer
person(elara_aldric).
first_name(elara_aldric, 'Elara').
last_name(elara_aldric, 'Aldric').
full_name(elara_aldric, 'Elara Aldric').
gender(elara_aldric, female).
alive(elara_aldric).
generation(elara_aldric, 0).
founder_family(elara_aldric).
child(elara_aldric, rowan_aldric).
child(elara_aldric, mira_aldric).
spouse(elara_aldric, gareth_aldric).
location(elara_aldric, stonehaven).

%% Rowan Aldric -- Apprentice smith
person(rowan_aldric).
first_name(rowan_aldric, 'Rowan').
last_name(rowan_aldric, 'Aldric').
full_name(rowan_aldric, 'Rowan Aldric').
gender(rowan_aldric, male).
alive(rowan_aldric).
generation(rowan_aldric, 1).
parent(gareth_aldric, rowan_aldric).
parent(elara_aldric, rowan_aldric).
location(rowan_aldric, stonehaven).

%% Mira Aldric -- Aspiring adventurer
person(mira_aldric).
first_name(mira_aldric, 'Mira').
last_name(mira_aldric, 'Aldric').
full_name(mira_aldric, 'Mira Aldric').
gender(mira_aldric, female).
alive(mira_aldric).
generation(mira_aldric, 1).
parent(gareth_aldric, mira_aldric).
parent(elara_aldric, mira_aldric).
location(mira_aldric, stonehaven).

%% ═══════════════════════════════════════════════════════════
%% Thorne Family (Tavern Keepers, Stonehaven)
%% ═══════════════════════════════════════════════════════════

%% Bram Thorne -- Tavern owner
person(bram_thorne).
first_name(bram_thorne, 'Bram').
last_name(bram_thorne, 'Thorne').
full_name(bram_thorne, 'Bram Thorne').
gender(bram_thorne, male).
alive(bram_thorne).
generation(bram_thorne, 0).
founder_family(bram_thorne).
child(bram_thorne, sera_thorne).
child(bram_thorne, finn_thorne).
spouse(bram_thorne, wren_thorne).
location(bram_thorne, stonehaven).

%% Wren Thorne -- Cook and tavern manager
person(wren_thorne).
first_name(wren_thorne, 'Wren').
last_name(wren_thorne, 'Thorne').
full_name(wren_thorne, 'Wren Thorne').
gender(wren_thorne, female).
alive(wren_thorne).
generation(wren_thorne, 0).
founder_family(wren_thorne).
child(wren_thorne, sera_thorne).
child(wren_thorne, finn_thorne).
spouse(wren_thorne, bram_thorne).
location(wren_thorne, stonehaven).

%% Sera Thorne -- Bard in training
person(sera_thorne).
first_name(sera_thorne, 'Sera').
last_name(sera_thorne, 'Thorne').
full_name(sera_thorne, 'Sera Thorne').
gender(sera_thorne, female).
alive(sera_thorne).
generation(sera_thorne, 1).
parent(bram_thorne, sera_thorne).
parent(wren_thorne, sera_thorne).
location(sera_thorne, stonehaven).

%% Finn Thorne -- Errand runner and rogue-in-the-making
person(finn_thorne).
first_name(finn_thorne, 'Finn').
last_name(finn_thorne, 'Thorne').
full_name(finn_thorne, 'Finn Thorne').
gender(finn_thorne, male).
alive(finn_thorne).
generation(finn_thorne, 1).
parent(bram_thorne, finn_thorne).
parent(wren_thorne, finn_thorne).
location(finn_thorne, stonehaven).

%% ═══════════════════════════════════════════════════════════
%% Voss Family (Merchants, Stonehaven)
%% ═══════════════════════════════════════════════════════════

%% Cedric Voss -- Wealthy merchant
person(cedric_voss).
first_name(cedric_voss, 'Cedric').
last_name(cedric_voss, 'Voss').
full_name(cedric_voss, 'Cedric Voss').
gender(cedric_voss, male).
alive(cedric_voss).
generation(cedric_voss, 0).
founder_family(cedric_voss).
child(cedric_voss, liora_voss).
spouse(cedric_voss, mathilde_voss).
location(cedric_voss, stonehaven).

%% Mathilde Voss -- Bookkeeper and schemer
person(mathilde_voss).
first_name(mathilde_voss, 'Mathilde').
last_name(mathilde_voss, 'Voss').
full_name(mathilde_voss, 'Mathilde Voss').
gender(mathilde_voss, female).
alive(mathilde_voss).
generation(mathilde_voss, 0).
founder_family(mathilde_voss).
child(mathilde_voss, liora_voss).
spouse(mathilde_voss, cedric_voss).
location(mathilde_voss, stonehaven).

%% Liora Voss -- Studious daughter
person(liora_voss).
first_name(liora_voss, 'Liora').
last_name(liora_voss, 'Voss').
full_name(liora_voss, 'Liora Voss').
gender(liora_voss, female).
alive(liora_voss).
generation(liora_voss, 1).
parent(cedric_voss, liora_voss).
parent(mathilde_voss, liora_voss).
location(liora_voss, stonehaven).

%% ═══════════════════════════════════════════════════════════
%% Ashwood Family (Farmers, Willowmere)
%% ═══════════════════════════════════════════════════════════

%% Hale Ashwood -- Farmer and village elder
person(hale_ashwood).
first_name(hale_ashwood, 'Hale').
last_name(hale_ashwood, 'Ashwood').
full_name(hale_ashwood, 'Hale Ashwood').
gender(hale_ashwood, male).
alive(hale_ashwood).
generation(hale_ashwood, 0).
founder_family(hale_ashwood).
child(hale_ashwood, ivy_ashwood).
child(hale_ashwood, cole_ashwood).
spouse(hale_ashwood, brynn_ashwood).
location(hale_ashwood, willowmere).

%% Brynn Ashwood -- Midwife and farmer
person(brynn_ashwood).
first_name(brynn_ashwood, 'Brynn').
last_name(brynn_ashwood, 'Ashwood').
full_name(brynn_ashwood, 'Brynn Ashwood').
gender(brynn_ashwood, female).
alive(brynn_ashwood).
generation(brynn_ashwood, 0).
founder_family(brynn_ashwood).
child(brynn_ashwood, ivy_ashwood).
child(brynn_ashwood, cole_ashwood).
spouse(brynn_ashwood, hale_ashwood).
location(brynn_ashwood, willowmere).

%% Ivy Ashwood -- Young ranger
person(ivy_ashwood).
first_name(ivy_ashwood, 'Ivy').
last_name(ivy_ashwood, 'Ashwood').
full_name(ivy_ashwood, 'Ivy Ashwood').
gender(ivy_ashwood, female).
alive(ivy_ashwood).
generation(ivy_ashwood, 1).
parent(hale_ashwood, ivy_ashwood).
parent(brynn_ashwood, ivy_ashwood).
location(ivy_ashwood, willowmere).

%% Cole Ashwood -- Shepherd boy
person(cole_ashwood).
first_name(cole_ashwood, 'Cole').
last_name(cole_ashwood, 'Ashwood').
full_name(cole_ashwood, 'Cole Ashwood').
gender(cole_ashwood, male).
alive(cole_ashwood).
generation(cole_ashwood, 1).
parent(hale_ashwood, cole_ashwood).
parent(brynn_ashwood, cole_ashwood).
location(cole_ashwood, willowmere).

%% ═══════════════════════════════════════════════════════════
%% Unattached Characters
%% ═══════════════════════════════════════════════════════════

%% Brother Aldwin -- Temple priest
person(brother_aldwin).
first_name(brother_aldwin, 'Aldwin').
last_name(brother_aldwin, 'Brother').
full_name(brother_aldwin, 'Brother Aldwin').
gender(brother_aldwin, male).
alive(brother_aldwin).
generation(brother_aldwin, 0).
location(brother_aldwin, stonehaven).

%% Captain Renna Marsh -- Guard captain
person(renna_marsh).
first_name(renna_marsh, 'Renna').
last_name(renna_marsh, 'Marsh').
full_name(renna_marsh, 'Renna Marsh').
gender(renna_marsh, female).
alive(renna_marsh).
generation(renna_marsh, 0).
location(renna_marsh, stonehaven).
