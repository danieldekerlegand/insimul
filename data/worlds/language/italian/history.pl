%% Ensemble History: Italian Tuscany -- Initial World State
%% Source: data/worlds/language/italian/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status, language

%% --- Giuseppe Rossi ---
trait(giuseppe_rossi, male).
trait(giuseppe_rossi, hospitable).
trait(giuseppe_rossi, generous).
trait(giuseppe_rossi, traditional).
trait(giuseppe_rossi, middle_aged).
attribute(giuseppe_rossi, charisma, 80).
attribute(giuseppe_rossi, cultural_knowledge, 85).
attribute(giuseppe_rossi, propriety, 70).
language_proficiency(giuseppe_rossi, italian, 95).
language_proficiency(giuseppe_rossi, english, 30).

%% --- Lucia Rossi ---
trait(lucia_rossi, female).
trait(lucia_rossi, nurturing).
trait(lucia_rossi, wise).
trait(lucia_rossi, community_minded).
attribute(lucia_rossi, charisma, 75).
attribute(lucia_rossi, cultural_knowledge, 90).
attribute(lucia_rossi, propriety, 80).
relationship(lucia_rossi, giuseppe_rossi, married).
language_proficiency(lucia_rossi, italian, 95).
language_proficiency(lucia_rossi, english, 20).

%% --- Marco Rossi ---
trait(marco_rossi, male).
trait(marco_rossi, young).
trait(marco_rossi, ambitious).
trait(marco_rossi, tech_savvy).
attribute(marco_rossi, charisma, 70).
attribute(marco_rossi, cunningness, 55).
attribute(marco_rossi, self_assuredness, 65).
language_proficiency(marco_rossi, italian, 92).
language_proficiency(marco_rossi, english, 70).

%% --- Chiara Rossi ---
trait(chiara_rossi, female).
trait(chiara_rossi, young).
trait(chiara_rossi, artistic).
trait(chiara_rossi, independent).
attribute(chiara_rossi, charisma, 65).
attribute(chiara_rossi, sensitiveness, 75).
attribute(chiara_rossi, cultural_knowledge, 60).
language_proficiency(chiara_rossi, italian, 90).
language_proficiency(chiara_rossi, english, 65).

%% --- Antonio Bianchi ---
trait(antonio_bianchi, male).
trait(antonio_bianchi, hardworking).
trait(antonio_bianchi, jovial).
trait(antonio_bianchi, early_riser).
trait(antonio_bianchi, middle_aged).
attribute(antonio_bianchi, charisma, 75).
attribute(antonio_bianchi, cultural_knowledge, 70).
attribute(antonio_bianchi, propriety, 65).
relationship(antonio_bianchi, giuseppe_rossi, friends).
language_proficiency(antonio_bianchi, italian, 95).
language_proficiency(antonio_bianchi, english, 15).

%% --- Maria Bianchi ---
trait(maria_bianchi, female).
trait(maria_bianchi, organized).
trait(maria_bianchi, warm).
trait(maria_bianchi, devout).
attribute(maria_bianchi, charisma, 70).
attribute(maria_bianchi, propriety, 80).
attribute(maria_bianchi, cultural_knowledge, 75).
relationship(maria_bianchi, antonio_bianchi, married).
relationship(maria_bianchi, lucia_rossi, friends).
language_proficiency(maria_bianchi, italian, 93).
language_proficiency(maria_bianchi, english, 10).

%% --- Elena Bianchi ---
trait(elena_bianchi, female).
trait(elena_bianchi, young).
trait(elena_bianchi, studious).
trait(elena_bianchi, idealistic).
attribute(elena_bianchi, charisma, 60).
attribute(elena_bianchi, cultural_knowledge, 65).
attribute(elena_bianchi, self_assuredness, 55).
relationship(elena_bianchi, giulia_romano, friends).
language_proficiency(elena_bianchi, italian, 92).
language_proficiency(elena_bianchi, english, 75).

%% --- Luca Bianchi ---
trait(luca_bianchi, male).
trait(luca_bianchi, young).
trait(luca_bianchi, social).
trait(luca_bianchi, athletic).
attribute(luca_bianchi, charisma, 75).
attribute(luca_bianchi, self_assuredness, 70).
attribute(luca_bianchi, cunningness, 45).
relationship(luca_bianchi, matteo_conti, friends).
language_proficiency(luca_bianchi, italian, 90).
language_proficiency(luca_bianchi, english, 55).

%% --- Stefano Romano ---
trait(stefano_romano, male).
trait(stefano_romano, educated).
trait(stefano_romano, formal).
trait(stefano_romano, intellectual).
trait(stefano_romano, middle_aged).
attribute(stefano_romano, charisma, 70).
attribute(stefano_romano, cultural_knowledge, 80).
attribute(stefano_romano, propriety, 85).
language_proficiency(stefano_romano, italian, 98).
language_proficiency(stefano_romano, english, 65).
language_proficiency(stefano_romano, french, 40).

%% --- Paola Romano ---
trait(paola_romano, female).
trait(paola_romano, articulate).
trait(paola_romano, passionate).
trait(paola_romano, caring).
attribute(paola_romano, charisma, 80).
attribute(paola_romano, cultural_knowledge, 75).
attribute(paola_romano, self_assuredness, 75).
relationship(paola_romano, stefano_romano, married).
language_proficiency(paola_romano, italian, 96).
language_proficiency(paola_romano, english, 60).

%% --- Giulia Romano ---
trait(giulia_romano, female).
trait(giulia_romano, young).
trait(giulia_romano, creative).
trait(giulia_romano, restless).
attribute(giulia_romano, charisma, 70).
attribute(giulia_romano, self_assuredness, 60).
attribute(giulia_romano, sensitiveness, 70).
language_proficiency(giulia_romano, italian, 92).
language_proficiency(giulia_romano, english, 80).

%% --- Alessandro Romano ---
trait(alessandro_romano, male).
trait(alessandro_romano, young).
trait(alessandro_romano, quiet).
trait(alessandro_romano, bookish).
attribute(alessandro_romano, charisma, 50).
attribute(alessandro_romano, cultural_knowledge, 70).
attribute(alessandro_romano, sensitiveness, 65).
language_proficiency(alessandro_romano, italian, 90).
language_proficiency(alessandro_romano, english, 60).

%% --- Roberto Conti ---
trait(roberto_conti, male).
trait(roberto_conti, shrewd).
trait(roberto_conti, experienced).
trait(roberto_conti, loud).
trait(roberto_conti, middle_aged).
attribute(roberto_conti, charisma, 80).
attribute(roberto_conti, cunningness, 70).
attribute(roberto_conti, cultural_knowledge, 65).
relationship(roberto_conti, antonio_bianchi, friends).
language_proficiency(roberto_conti, italian, 95).
language_proficiency(roberto_conti, english, 20).

%% --- Anna Conti ---
trait(anna_conti, female).
trait(anna_conti, practical).
trait(anna_conti, resourceful).
trait(anna_conti, no_nonsense).
attribute(anna_conti, charisma, 65).
attribute(anna_conti, propriety, 70).
attribute(anna_conti, cultural_knowledge, 75).
relationship(anna_conti, roberto_conti, married).
language_proficiency(anna_conti, italian, 93).
language_proficiency(anna_conti, english, 15).

%% --- Francesca Conti ---
trait(francesca_conti, female).
trait(francesca_conti, young).
trait(francesca_conti, determined).
trait(francesca_conti, modern).
attribute(francesca_conti, charisma, 70).
attribute(francesca_conti, self_assuredness, 65).
attribute(francesca_conti, cunningness, 50).
relationship(francesca_conti, chiara_rossi, friends).
language_proficiency(francesca_conti, italian, 90).
language_proficiency(francesca_conti, english, 70).

%% --- Matteo Conti ---
trait(matteo_conti, male).
trait(matteo_conti, young).
trait(matteo_conti, entrepreneurial).
trait(matteo_conti, energetic).
attribute(matteo_conti, charisma, 70).
attribute(matteo_conti, cunningness, 60).
attribute(matteo_conti, self_assuredness, 65).
language_proficiency(matteo_conti, italian, 88).
language_proficiency(matteo_conti, english, 50).

%% --- Enrico Ferrari ---
trait(enrico_ferrari, male).
trait(enrico_ferrari, patient).
trait(enrico_ferrari, traditional).
trait(enrico_ferrari, proud).
trait(enrico_ferrari, elderly).
attribute(enrico_ferrari, charisma, 65).
attribute(enrico_ferrari, cultural_knowledge, 92).
attribute(enrico_ferrari, propriety, 75).
language_proficiency(enrico_ferrari, italian, 95).
language_proficiency(enrico_ferrari, english, 10).

%% --- Rosa Ferrari ---
trait(rosa_ferrari, female).
trait(rosa_ferrari, gentle).
trait(rosa_ferrari, herbalist).
trait(rosa_ferrari, observant).
attribute(rosa_ferrari, charisma, 60).
attribute(rosa_ferrari, cultural_knowledge, 88).
attribute(rosa_ferrari, propriety, 70).
relationship(rosa_ferrari, enrico_ferrari, married).
language_proficiency(rosa_ferrari, italian, 93).
language_proficiency(rosa_ferrari, english, 5).

%% --- Valentina Ferrari ---
trait(valentina_ferrari, female).
trait(valentina_ferrari, young).
trait(valentina_ferrari, curious).
trait(valentina_ferrari, nature_loving).
attribute(valentina_ferrari, charisma, 65).
attribute(valentina_ferrari, self_assuredness, 55).
attribute(valentina_ferrari, sensitiveness, 70).
relationship(valentina_ferrari, sofia_moretti, friends).
language_proficiency(valentina_ferrari, italian, 90).
language_proficiency(valentina_ferrari, english, 45).

%% --- Davide Ferrari ---
trait(davide_ferrari, male).
trait(davide_ferrari, young).
trait(davide_ferrari, rebellious).
trait(davide_ferrari, musical).
attribute(davide_ferrari, charisma, 65).
attribute(davide_ferrari, self_assuredness, 55).
attribute(davide_ferrari, sensitiveness, 65).
relationship(davide_ferrari, nicola_moretti, friends).
language_proficiency(davide_ferrari, italian, 88).
language_proficiency(davide_ferrari, english, 40).

%% --- Giovanni Moretti ---
trait(giovanni_moretti, male).
trait(giovanni_moretti, rugged).
trait(giovanni_moretti, hardworking).
trait(giovanni_moretti, storyteller).
trait(giovanni_moretti, middle_aged).
attribute(giovanni_moretti, charisma, 70).
attribute(giovanni_moretti, cultural_knowledge, 85).
attribute(giovanni_moretti, propriety, 60).
relationship(giovanni_moretti, enrico_ferrari, friends).
language_proficiency(giovanni_moretti, italian, 95).
language_proficiency(giovanni_moretti, english, 15).

%% --- Teresa Moretti ---
trait(teresa_moretti, female).
trait(teresa_moretti, resilient).
trait(teresa_moretti, resourceful).
trait(teresa_moretti, community_minded).
attribute(teresa_moretti, charisma, 65).
attribute(teresa_moretti, propriety, 70).
attribute(teresa_moretti, cultural_knowledge, 80).
relationship(teresa_moretti, giovanni_moretti, married).
relationship(teresa_moretti, rosa_ferrari, friends).
language_proficiency(teresa_moretti, italian, 93).
language_proficiency(teresa_moretti, english, 10).

%% --- Sofia Moretti ---
trait(sofia_moretti, female).
trait(sofia_moretti, young).
trait(sofia_moretti, diligent).
trait(sofia_moretti, kind).
attribute(sofia_moretti, charisma, 60).
attribute(sofia_moretti, propriety, 70).
attribute(sofia_moretti, cultural_knowledge, 60).
language_proficiency(sofia_moretti, italian, 90).
language_proficiency(sofia_moretti, english, 50).

%% --- Nicola Moretti ---
trait(nicola_moretti, male).
trait(nicola_moretti, young).
trait(nicola_moretti, quiet).
trait(nicola_moretti, dutiful).
attribute(nicola_moretti, charisma, 50).
attribute(nicola_moretti, propriety, 65).
attribute(nicola_moretti, cultural_knowledge, 55).
language_proficiency(nicola_moretti, italian, 88).
language_proficiency(nicola_moretti, english, 35).
