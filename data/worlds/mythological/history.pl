%% Ensemble History: Greek Mythological World -- Initial World State
%% Source: data/worlds/mythological/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status

%% --- Theseus Aegides ---
trait(theseus_aegides, male).
trait(theseus_aegides, brave).
trait(theseus_aegides, noble).
trait(theseus_aegides, cunning).
attribute(theseus_aegides, charisma, 85).
attribute(theseus_aegides, self_assuredness, 80).
attribute(theseus_aegides, propriety, 60).
attribute(theseus_aegides, status_individual, 90).

%% --- Kallista Heliades ---
trait(kallista_heliades, female).
trait(kallista_heliades, fierce).
trait(kallista_heliades, radiant).
trait(kallista_heliades, proud).
attribute(kallista_heliades, charisma, 90).
attribute(kallista_heliades, self_assuredness, 85).
attribute(kallista_heliades, sensitiveness, 50).

%% --- Orion Artemision ---
trait(orion_artemision, male).
trait(orion_artemision, strong).
trait(orion_artemision, solitary).
trait(orion_artemision, wild).
attribute(orion_artemision, charisma, 65).
attribute(orion_artemision, self_assuredness, 75).
attribute(orion_artemision, sensitiveness, 40).
relationship(orion_artemision, atalante_kalydon, friends).

%% --- Aethon Pyrrhides ---
trait(aethon_pyrrhides, male).
trait(aethon_pyrrhides, ambitious).
trait(aethon_pyrrhides, honorable).
trait(aethon_pyrrhides, young).
attribute(aethon_pyrrhides, charisma, 70).
attribute(aethon_pyrrhides, self_assuredness, 65).
attribute(aethon_pyrrhides, propriety, 70).

%% --- Atalante Kalydon ---
trait(atalante_kalydon, female).
trait(atalante_kalydon, swift).
trait(atalante_kalydon, independent).
trait(atalante_kalydon, competitive).
attribute(atalante_kalydon, charisma, 75).
attribute(atalante_kalydon, self_assuredness, 80).
attribute(atalante_kalydon, sensitiveness, 35).

%% --- Peleus Myrmidon ---
trait(peleus_myrmidon, male).
trait(peleus_myrmidon, experienced).
trait(peleus_myrmidon, disciplined).
trait(peleus_myrmidon, proud).
trait(peleus_myrmidon, middle_aged).
attribute(peleus_myrmidon, charisma, 70).
attribute(peleus_myrmidon, self_assuredness, 75).
attribute(peleus_myrmidon, propriety, 65).
relationship(peleus_myrmidon, thetis_nereid, married).

%% --- Achilleos Myrmidon ---
trait(achilleos_myrmidon, male).
trait(achilleos_myrmidon, young).
trait(achilleos_myrmidon, reckless).
trait(achilleos_myrmidon, glory_seeking).
attribute(achilleos_myrmidon, charisma, 80).
attribute(achilleos_myrmidon, self_assuredness, 90).
attribute(achilleos_myrmidon, sensitiveness, 55).

%% --- Thetis Nereid ---
trait(thetis_nereid, female).
trait(thetis_nereid, maternal).
trait(thetis_nereid, sorrowful).
trait(thetis_nereid, immortal).
attribute(thetis_nereid, charisma, 85).
attribute(thetis_nereid, cultural_knowledge, 95).
attribute(thetis_nereid, sensitiveness, 90).
relationship(thetis_nereid, peleus_myrmidon, married).

%% --- Daphne Naias ---
trait(daphne_naias, female).
trait(daphne_naias, shy).
trait(daphne_naias, gentle).
trait(daphne_naias, ethereal).
attribute(daphne_naias, charisma, 60).
attribute(daphne_naias, sensitiveness, 85).
attribute(daphne_naias, cultural_knowledge, 70).

%% --- Chloris Dryad ---
trait(chloris_dryad, female).
trait(chloris_dryad, protective).
trait(chloris_dryad, ancient).
trait(chloris_dryad, nature_loving).
attribute(chloris_dryad, charisma, 55).
attribute(chloris_dryad, cultural_knowledge, 90).
attribute(chloris_dryad, sensitiveness, 80).

%% --- Hierophantes Apollonides ---
trait(hierophantes_apollonides, male).
trait(hierophantes_apollonides, devout).
trait(hierophantes_apollonides, wise).
trait(hierophantes_apollonides, authoritative).
trait(hierophantes_apollonides, elderly).
attribute(hierophantes_apollonides, charisma, 75).
attribute(hierophantes_apollonides, cultural_knowledge, 95).
attribute(hierophantes_apollonides, propriety, 90).

%% --- Pythia Mantike ---
trait(pythia_mantike, female).
trait(pythia_mantike, mystical).
trait(pythia_mantike, cryptic).
trait(pythia_mantike, isolated).
attribute(pythia_mantike, charisma, 70).
attribute(pythia_mantike, cultural_knowledge, 100).
attribute(pythia_mantike, sensitiveness, 95).

%% --- Korinna Hiereia ---
trait(korinna_hiereia, female).
trait(korinna_hiereia, intelligent).
trait(korinna_hiereia, patient).
trait(korinna_hiereia, diplomatic).
attribute(korinna_hiereia, charisma, 70).
attribute(korinna_hiereia, cultural_knowledge, 85).
attribute(korinna_hiereia, propriety, 80).
relationship(korinna_hiereia, hierophantes_apollonides, ally).

%% --- Tantalos Pelopides ---
trait(tantalos_pelopides, male).
trait(tantalos_pelopides, cursed).
trait(tantalos_pelopides, remorseful).
trait(tantalos_pelopides, tormented).
attribute(tantalos_pelopides, charisma, 50).
attribute(tantalos_pelopides, cultural_knowledge, 80).
attribute(tantalos_pelopides, sensitiveness, 70).
status(tantalos_pelopides, cursed).

%% --- Niobe Pelopides ---
trait(niobe_pelopides, female).
trait(niobe_pelopides, grieving).
trait(niobe_pelopides, proud).
trait(niobe_pelopides, young).
attribute(niobe_pelopides, charisma, 60).
attribute(niobe_pelopides, sensitiveness, 85).
attribute(niobe_pelopides, propriety, 55).
status(niobe_pelopides, cursed).

%% --- Daidalos Technites ---
trait(daidalos_technites, male).
trait(daidalos_technites, genius).
trait(daidalos_technites, meticulous).
trait(daidalos_technites, protective).
trait(daidalos_technites, middle_aged).
attribute(daidalos_technites, charisma, 55).
attribute(daidalos_technites, cultural_knowledge, 95).
attribute(daidalos_technites, cunningness, 80).

%% --- Ikaros Technites ---
trait(ikaros_technites, male).
trait(ikaros_technites, young).
trait(ikaros_technites, reckless).
trait(ikaros_technites, imaginative).
attribute(ikaros_technites, charisma, 65).
attribute(ikaros_technites, self_assuredness, 70).
attribute(ikaros_technites, sensitiveness, 45).
