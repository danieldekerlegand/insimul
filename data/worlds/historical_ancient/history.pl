%% Ensemble History: Historical Ancient World -- Initial World State
%% Source: data/worlds/historical_ancient/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status

%% --- Themistokles ---
trait(themistokles, male).
trait(themistokles, commanding).
trait(themistokles, eloquent).
trait(themistokles, middle_aged).
attribute(themistokles, charisma, 85).
attribute(themistokles, cultural_knowledge, 80).
attribute(themistokles, cunningness, 70).

%% --- Archippe ---
trait(archippe, female).
trait(archippe, dignified).
trait(archippe, practical).
attribute(archippe, charisma, 60).
attribute(archippe, propriety, 80).
attribute(archippe, cultural_knowledge, 65).
relationship(archippe, themistokles, married).

%% --- Nikias ---
trait(nikias, male).
trait(nikias, young).
trait(nikias, studious).
trait(nikias, idealistic).
attribute(nikias, charisma, 55).
attribute(nikias, cultural_knowledge, 50).
attribute(nikias, self_assuredness, 40).

%% --- Aspasia ---
trait(aspasia, female).
trait(aspasia, brilliant).
trait(aspasia, articulate).
trait(aspasia, bold).
attribute(aspasia, charisma, 90).
attribute(aspasia, cultural_knowledge, 95).
attribute(aspasia, self_assuredness, 85).
relationship(aspasia, themistokles, acquaintance).

%% --- Kleomenes ---
trait(kleomenes, male).
trait(kleomenes, skilled).
trait(kleomenes, patient).
trait(kleomenes, middle_aged).
attribute(kleomenes, charisma, 50).
attribute(kleomenes, cultural_knowledge, 60).
attribute(kleomenes, propriety, 55).

%% --- Phaidra ---
trait(phaidra, female).
trait(phaidra, young).
trait(phaidra, creative).
trait(phaidra, curious).
attribute(phaidra, charisma, 55).
attribute(phaidra, sensitiveness, 65).
attribute(phaidra, self_assuredness, 45).

%% --- Demades ---
trait(demades, male).
trait(demades, shrewd).
trait(demades, worldly).
trait(demades, ambitious).
attribute(demades, charisma, 75).
attribute(demades, cunningness, 80).
attribute(demades, cultural_knowledge, 60).
relationship(demades, themistokles, acquaintance).

%% --- Lucius Aurelius ---
trait(lucius_aurelius, male).
trait(lucius_aurelius, authoritative).
trait(lucius_aurelius, traditional).
trait(lucius_aurelius, middle_aged).
attribute(lucius_aurelius, charisma, 80).
attribute(lucius_aurelius, cultural_knowledge, 75).
attribute(lucius_aurelius, propriety, 85).

%% --- Valeria Maxima ---
trait(valeria_maxima, female).
trait(valeria_maxima, dignified).
trait(valeria_maxima, shrewd).
trait(valeria_maxima, influential).
attribute(valeria_maxima, charisma, 75).
attribute(valeria_maxima, propriety, 90).
attribute(valeria_maxima, cunningness, 65).
relationship(valeria_maxima, lucius_aurelius, married).

%% --- Marcus Aurelius Jr ---
trait(marcus_aurelius_jr, male).
trait(marcus_aurelius_jr, young).
trait(marcus_aurelius_jr, disciplined).
trait(marcus_aurelius_jr, brave).
attribute(marcus_aurelius_jr, charisma, 60).
attribute(marcus_aurelius_jr, self_assuredness, 65).
attribute(marcus_aurelius_jr, cultural_knowledge, 45).

%% --- Cornelia Aurelia ---
trait(cornelia_aurelia, female).
trait(cornelia_aurelia, young).
trait(cornelia_aurelia, devout).
trait(cornelia_aurelia, composed).
attribute(cornelia_aurelia, charisma, 55).
attribute(cornelia_aurelia, propriety, 85).
attribute(cornelia_aurelia, sensitiveness, 60).

%% --- Spartacus Thrax ---
trait(spartacus_thrax, male).
trait(spartacus_thrax, fierce).
trait(spartacus_thrax, resilient).
trait(spartacus_thrax, proud).
attribute(spartacus_thrax, charisma, 65).
attribute(spartacus_thrax, self_assuredness, 75).
attribute(spartacus_thrax, cunningness, 50).
relationship(spartacus_thrax, lucius_aurelius, subordinate).

%% --- Gaius Vetutius ---
trait(gaius_vetutius, male).
trait(gaius_vetutius, jovial).
trait(gaius_vetutius, enterprising).
trait(gaius_vetutius, generous).
attribute(gaius_vetutius, charisma, 70).
attribute(gaius_vetutius, cunningness, 55).
attribute(gaius_vetutius, cultural_knowledge, 50).
relationship(gaius_vetutius, lucius_aurelius, client).

%% --- Khaemwaset ---
trait(khaemwaset, male).
trait(khaemwaset, devout).
trait(khaemwaset, scholarly).
trait(khaemwaset, middle_aged).
attribute(khaemwaset, charisma, 70).
attribute(khaemwaset, cultural_knowledge, 95).
attribute(khaemwaset, propriety, 90).

%% --- Nefertari Minor ---
trait(nefertari_minor, female).
trait(nefertari_minor, graceful).
trait(nefertari_minor, musical).
trait(nefertari_minor, devout).
attribute(nefertari_minor, charisma, 65).
attribute(nefertari_minor, cultural_knowledge, 80).
attribute(nefertari_minor, sensitiveness, 75).
relationship(nefertari_minor, khaemwaset, married).

%% --- Meritamun ---
trait(meritamun, female).
trait(meritamun, young).
trait(meritamun, diligent).
trait(meritamun, inquisitive).
attribute(meritamun, charisma, 50).
attribute(meritamun, cultural_knowledge, 55).
attribute(meritamun, self_assuredness, 40).

%% --- Paneb ---
trait(paneb, male).
trait(paneb, skilled).
trait(paneb, blunt).
trait(paneb, middle_aged).
attribute(paneb, charisma, 55).
attribute(paneb, cultural_knowledge, 70).
attribute(paneb, cunningness, 45).
relationship(paneb, khaemwaset, acquaintance).
