%% Insimul Characters: Historical Ancient World
%% Source: data/worlds/historical_ancient/characters.pl
%% Created: 2026-04-03
%% Total: 18 characters
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2

%% ===============================================================
%% Athenian Characters
%% ===============================================================

%% Themistokles — Strategos and Orator
person(themistokles).
first_name(themistokles, 'Themistokles').
last_name(themistokles, 'of Phrearrhioi').
full_name(themistokles, 'Themistokles of Phrearrhioi').
gender(themistokles, male).
alive(themistokles).
generation(themistokles, 0).
founder_family(themistokles).
child(themistokles, nikias).
spouse(themistokles, archippe).
location(themistokles, athenai).

%% Archippe — Wife of Themistokles
person(archippe).
first_name(archippe, 'Archippe').
last_name(archippe, 'of Alopeke').
full_name(archippe, 'Archippe of Alopeke').
gender(archippe, female).
alive(archippe).
generation(archippe, 0).
founder_family(archippe).
child(archippe, nikias).
spouse(archippe, themistokles).
location(archippe, athenai).

%% Nikias — Son of Themistokles, Young Philosopher
person(nikias).
first_name(nikias, 'Nikias').
last_name(nikias, 'of Phrearrhioi').
full_name(nikias, 'Nikias of Phrearrhioi').
gender(nikias, male).
alive(nikias).
generation(nikias, 1).
parent(themistokles, nikias).
parent(archippe, nikias).
location(nikias, athenai).

%% Aspasia — Philosopher and Teacher
person(aspasia).
first_name(aspasia, 'Aspasia').
last_name(aspasia, 'of Miletos').
full_name(aspasia, 'Aspasia of Miletos').
gender(aspasia, female).
alive(aspasia).
generation(aspasia, 0).
founder_family(aspasia).
location(aspasia, athenai).

%% Kleomenes — Potter and Artisan
person(kleomenes).
first_name(kleomenes, 'Kleomenes').
last_name(kleomenes, 'of Kerameikos').
full_name(kleomenes, 'Kleomenes of Kerameikos').
gender(kleomenes, male).
alive(kleomenes).
generation(kleomenes, 0).
founder_family(kleomenes).
child(kleomenes, phaidra).
location(kleomenes, athenai).

%% Phaidra — Daughter of Kleomenes, Apprentice Potter
person(phaidra).
first_name(phaidra, 'Phaidra').
last_name(phaidra, 'of Kerameikos').
full_name(phaidra, 'Phaidra of Kerameikos').
gender(phaidra, female).
alive(phaidra).
generation(phaidra, 1).
parent(kleomenes, phaidra).
location(phaidra, athenai).

%% Demades — Merchant and Ship Owner
person(demades).
first_name(demades, 'Demades').
last_name(demades, 'of Piraeus').
full_name(demades, 'Demades of Piraeus').
gender(demades, male).
alive(demades).
generation(demades, 0).
founder_family(demades).
location(demades, athenai).

%% ===============================================================
%% Roman Characters
%% ===============================================================

%% Lucius Aurelius — Senator
person(lucius_aurelius).
first_name(lucius_aurelius, 'Lucius').
last_name(lucius_aurelius, 'Aurelius').
full_name(lucius_aurelius, 'Lucius Aurelius').
gender(lucius_aurelius, male).
alive(lucius_aurelius).
generation(lucius_aurelius, 0).
founder_family(lucius_aurelius).
child(lucius_aurelius, marcus_aurelius_jr).
child(lucius_aurelius, cornelia_aurelia).
spouse(lucius_aurelius, valeria_maxima).
location(lucius_aurelius, roma).

%% Valeria Maxima — Matron
person(valeria_maxima).
first_name(valeria_maxima, 'Valeria').
last_name(valeria_maxima, 'Maxima').
full_name(valeria_maxima, 'Valeria Maxima').
gender(valeria_maxima, female).
alive(valeria_maxima).
generation(valeria_maxima, 0).
founder_family(valeria_maxima).
child(valeria_maxima, marcus_aurelius_jr).
child(valeria_maxima, cornelia_aurelia).
spouse(valeria_maxima, lucius_aurelius).
location(valeria_maxima, roma).

%% Marcus Aurelius Jr — Young Legionary
person(marcus_aurelius_jr).
first_name(marcus_aurelius_jr, 'Marcus').
last_name(marcus_aurelius_jr, 'Aurelius').
full_name(marcus_aurelius_jr, 'Marcus Aurelius').
gender(marcus_aurelius_jr, male).
alive(marcus_aurelius_jr).
generation(marcus_aurelius_jr, 1).
parent(lucius_aurelius, marcus_aurelius_jr).
parent(valeria_maxima, marcus_aurelius_jr).
location(marcus_aurelius_jr, roma).

%% Cornelia Aurelia — Priestess of Vesta
person(cornelia_aurelia).
first_name(cornelia_aurelia, 'Cornelia').
last_name(cornelia_aurelia, 'Aurelia').
full_name(cornelia_aurelia, 'Cornelia Aurelia').
gender(cornelia_aurelia, female).
alive(cornelia_aurelia).
generation(cornelia_aurelia, 1).
parent(lucius_aurelius, cornelia_aurelia).
parent(valeria_maxima, cornelia_aurelia).
location(cornelia_aurelia, roma).

%% Spartacus Thrax — Gladiator
person(spartacus_thrax).
first_name(spartacus_thrax, 'Spartacus').
last_name(spartacus_thrax, 'Thrax').
full_name(spartacus_thrax, 'Spartacus Thrax').
gender(spartacus_thrax, male).
alive(spartacus_thrax).
generation(spartacus_thrax, 0).
founder_family(spartacus_thrax).
location(spartacus_thrax, roma).

%% Gaius Vetutius — Thermopolium Owner
person(gaius_vetutius).
first_name(gaius_vetutius, 'Gaius').
last_name(gaius_vetutius, 'Vetutius').
full_name(gaius_vetutius, 'Gaius Vetutius').
gender(gaius_vetutius, male).
alive(gaius_vetutius).
generation(gaius_vetutius, 0).
founder_family(gaius_vetutius).
location(gaius_vetutius, roma).

%% ===============================================================
%% Egyptian Characters
%% ===============================================================

%% Khaemwaset — High Priest of Amun
person(khaemwaset).
first_name(khaemwaset, 'Khaemwaset').
last_name(khaemwaset, 'son of Ramesses').
full_name(khaemwaset, 'Khaemwaset').
gender(khaemwaset, male).
alive(khaemwaset).
generation(khaemwaset, 0).
founder_family(khaemwaset).
child(khaemwaset, meritamun).
spouse(khaemwaset, nefertari_minor).
location(khaemwaset, thebes_aegyptus).

%% Nefertari Minor — Temple Singer
person(nefertari_minor).
first_name(nefertari_minor, 'Nefertari').
last_name(nefertari_minor, 'daughter of Amenhotep').
full_name(nefertari_minor, 'Nefertari').
gender(nefertari_minor, female).
alive(nefertari_minor).
generation(nefertari_minor, 0).
founder_family(nefertari_minor).
child(nefertari_minor, meritamun).
spouse(nefertari_minor, khaemwaset).
location(nefertari_minor, thebes_aegyptus).

%% Meritamun — Young Scribe Apprentice
person(meritamun).
first_name(meritamun, 'Meritamun').
last_name(meritamun, 'daughter of Khaemwaset').
full_name(meritamun, 'Meritamun').
gender(meritamun, female).
alive(meritamun).
generation(meritamun, 1).
parent(khaemwaset, meritamun).
parent(nefertari_minor, meritamun).
location(meritamun, thebes_aegyptus).

%% Paneb — Master Artisan
person(paneb).
first_name(paneb, 'Paneb').
last_name(paneb, 'son of Nefersenut').
full_name(paneb, 'Paneb').
gender(paneb, male).
alive(paneb).
generation(paneb, 0).
founder_family(paneb).
location(paneb, thebes_aegyptus).
