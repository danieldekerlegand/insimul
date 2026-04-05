%% Insimul Characters: Greek Mythological World
%% Source: data/worlds/mythological/characters.pl
%% Created: 2026-04-03
%% Total: 17 characters (demigods, heroes, nymphs, priests, cursed kings)
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2
%%   character_role/2 -- mythological role

%% ═══════════════════════════════════════════════════════════
%% Demigods
%% ═══════════════════════════════════════════════════════════

%% Theseus Aegides -- son of Poseidon, slayer of monsters
person(theseus_aegides).
first_name(theseus_aegides, 'Theseus').
last_name(theseus_aegides, 'Aegides').
full_name(theseus_aegides, 'Theseus Aegides').
gender(theseus_aegides, male).
alive(theseus_aegides).
generation(theseus_aegides, 1).
character_role(theseus_aegides, demigod).
location(theseus_aegides, theopolis).

%% Kallista Heliades -- daughter of Helios, wielder of solar fire
person(kallista_heliades).
first_name(kallista_heliades, 'Kallista').
last_name(kallista_heliades, 'Heliades').
full_name(kallista_heliades, 'Kallista Heliades').
gender(kallista_heliades, female).
alive(kallista_heliades).
generation(kallista_heliades, 1).
character_role(kallista_heliades, demigod).
location(kallista_heliades, theopolis).

%% Orion Artemision -- son of Poseidon, legendary hunter
person(orion_artemision).
first_name(orion_artemision, 'Orion').
last_name(orion_artemision, 'Artemision').
full_name(orion_artemision, 'Orion Artemision').
gender(orion_artemision, male).
alive(orion_artemision).
generation(orion_artemision, 1).
character_role(orion_artemision, demigod).
location(orion_artemision, heraclea).

%% ═══════════════════════════════════════════════════════════
%% Heroes
%% ═══════════════════════════════════════════════════════════

%% Aethon Pyrrhides -- a mortal hero seeking glory through labors
person(aethon_pyrrhides).
first_name(aethon_pyrrhides, 'Aethon').
last_name(aethon_pyrrhides, 'Pyrrhides').
full_name(aethon_pyrrhides, 'Aethon Pyrrhides').
gender(aethon_pyrrhides, male).
alive(aethon_pyrrhides).
generation(aethon_pyrrhides, 0).
founder_family(aethon_pyrrhides).
character_role(aethon_pyrrhides, hero).
location(aethon_pyrrhides, heraclea).

%% Atalante Kalydon -- swift-footed huntress
person(atalante_kalydon).
first_name(atalante_kalydon, 'Atalante').
last_name(atalante_kalydon, 'Kalydon').
full_name(atalante_kalydon, 'Atalante Kalydon').
gender(atalante_kalydon, female).
alive(atalante_kalydon).
generation(atalante_kalydon, 0).
founder_family(atalante_kalydon).
character_role(atalante_kalydon, hero).
location(atalante_kalydon, heraclea).

%% Peleus Myrmidon -- warrior and former companion of heroes
person(peleus_myrmidon).
first_name(peleus_myrmidon, 'Peleus').
last_name(peleus_myrmidon, 'Myrmidon').
full_name(peleus_myrmidon, 'Peleus Myrmidon').
gender(peleus_myrmidon, male).
alive(peleus_myrmidon).
generation(peleus_myrmidon, 0).
founder_family(peleus_myrmidon).
character_role(peleus_myrmidon, hero).
spouse(peleus_myrmidon, thetis_nereid).
child(peleus_myrmidon, achilleos_myrmidon).
location(peleus_myrmidon, theopolis).

%% Achilleos Myrmidon -- young warrior, son of Peleus and Thetis
person(achilleos_myrmidon).
first_name(achilleos_myrmidon, 'Achilleos').
last_name(achilleos_myrmidon, 'Myrmidon').
full_name(achilleos_myrmidon, 'Achilleos Myrmidon').
gender(achilleos_myrmidon, male).
alive(achilleos_myrmidon).
generation(achilleos_myrmidon, 1).
parent(peleus_myrmidon, achilleos_myrmidon).
parent(thetis_nereid, achilleos_myrmidon).
character_role(achilleos_myrmidon, hero).
location(achilleos_myrmidon, theopolis).

%% ═══════════════════════════════════════════════════════════
%% Nymphs
%% ═══════════════════════════════════════════════════════════

%% Thetis Nereid -- sea nymph, mother of Achilleos
person(thetis_nereid).
first_name(thetis_nereid, 'Thetis').
last_name(thetis_nereid, 'Nereid').
full_name(thetis_nereid, 'Thetis Nereid').
gender(thetis_nereid, female).
alive(thetis_nereid).
generation(thetis_nereid, 0).
character_role(thetis_nereid, nymph).
spouse(thetis_nereid, peleus_myrmidon).
child(thetis_nereid, achilleos_myrmidon).
location(thetis_nereid, theopolis).

%% Daphne Naias -- river nymph who tends the sacred spring
person(daphne_naias).
first_name(daphne_naias, 'Daphne').
last_name(daphne_naias, 'Naias').
full_name(daphne_naias, 'Daphne Naias').
gender(daphne_naias, female).
alive(daphne_naias).
generation(daphne_naias, 0).
character_role(daphne_naias, nymph).
location(daphne_naias, delphinion).

%% Chloris Dryad -- forest spirit guarding the sacred groves
person(chloris_dryad).
first_name(chloris_dryad, 'Chloris').
last_name(chloris_dryad, 'Dryad').
full_name(chloris_dryad, 'Chloris Dryad').
gender(chloris_dryad, female).
alive(chloris_dryad).
generation(chloris_dryad, 0).
character_role(chloris_dryad, nymph).
location(chloris_dryad, heraclea).

%% ═══════════════════════════════════════════════════════════
%% Priests and Oracles
%% ═══════════════════════════════════════════════════════════

%% Hierophantes Apollonides -- high priest of Apollo
person(hierophantes_apollonides).
first_name(hierophantes_apollonides, 'Hierophantes').
last_name(hierophantes_apollonides, 'Apollonides').
full_name(hierophantes_apollonides, 'Hierophantes Apollonides').
gender(hierophantes_apollonides, male).
alive(hierophantes_apollonides).
generation(hierophantes_apollonides, 0).
founder_family(hierophantes_apollonides).
character_role(hierophantes_apollonides, priest).
location(hierophantes_apollonides, theopolis).

%% Pythia Mantike -- the oracle, speaker of prophecy
person(pythia_mantike).
first_name(pythia_mantike, 'Pythia').
last_name(pythia_mantike, 'Mantike').
full_name(pythia_mantike, 'Pythia Mantike').
gender(pythia_mantike, female).
alive(pythia_mantike).
generation(pythia_mantike, 0).
founder_family(pythia_mantike).
character_role(pythia_mantike, oracle).
location(pythia_mantike, delphinion).

%% Korinna Hiereia -- priestess of Athena
person(korinna_hiereia).
first_name(korinna_hiereia, 'Korinna').
last_name(korinna_hiereia, 'Hiereia').
full_name(korinna_hiereia, 'Korinna Hiereia').
gender(korinna_hiereia, female).
alive(korinna_hiereia).
generation(korinna_hiereia, 0).
founder_family(korinna_hiereia).
character_role(korinna_hiereia, priestess).
location(korinna_hiereia, theopolis).

%% ═══════════════════════════════════════════════════════════
%% Cursed Kings and Rulers
%% ═══════════════════════════════════════════════════════════

%% Tantalos Pelopides -- cursed king, punished for hubris against the gods
person(tantalos_pelopides).
first_name(tantalos_pelopides, 'Tantalos').
last_name(tantalos_pelopides, 'Pelopides').
full_name(tantalos_pelopides, 'Tantalos Pelopides').
gender(tantalos_pelopides, male).
alive(tantalos_pelopides).
generation(tantalos_pelopides, 0).
founder_family(tantalos_pelopides).
character_role(tantalos_pelopides, cursed_king).
child(tantalos_pelopides, niobe_pelopides).
location(tantalos_pelopides, theopolis).

%% Niobe Pelopides -- daughter of Tantalos, punished for pride
person(niobe_pelopides).
first_name(niobe_pelopides, 'Niobe').
last_name(niobe_pelopides, 'Pelopides').
full_name(niobe_pelopides, 'Niobe Pelopides').
gender(niobe_pelopides, female).
alive(niobe_pelopides).
generation(niobe_pelopides, 1).
parent(tantalos_pelopides, niobe_pelopides).
character_role(niobe_pelopides, cursed_noble).
location(niobe_pelopides, theopolis).

%% ═══════════════════════════════════════════════════════════
%% Artisans and Mortals
%% ═══════════════════════════════════════════════════════════

%% Daidalos Technites -- master craftsman and inventor
person(daidalos_technites).
first_name(daidalos_technites, 'Daidalos').
last_name(daidalos_technites, 'Technites').
full_name(daidalos_technites, 'Daidalos Technites').
gender(daidalos_technites, male).
alive(daidalos_technites).
generation(daidalos_technites, 0).
founder_family(daidalos_technites).
character_role(daidalos_technites, artisan).
child(daidalos_technites, ikaros_technites).
location(daidalos_technites, theopolis).

%% Ikaros Technites -- young son of Daidalos, reckless dreamer
person(ikaros_technites).
first_name(ikaros_technites, 'Ikaros').
last_name(ikaros_technites, 'Technites').
full_name(ikaros_technites, 'Ikaros Technites').
gender(ikaros_technites, male).
alive(ikaros_technites).
generation(ikaros_technites, 1).
parent(daidalos_technites, ikaros_technites).
character_role(ikaros_technites, artisan).
location(ikaros_technites, theopolis).
