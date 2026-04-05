%% Ensemble History: Portuguese Algarve -- Initial World State
%% Source: data/worlds/language/portuguese/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status, language

%% --- Manuel Silva ---
trait(manuel_silva, male).
trait(manuel_silva, hospitable).
trait(manuel_silva, traditional).
trait(manuel_silva, hardworking).
trait(manuel_silva, middle_aged).
attribute(manuel_silva, charisma, 75).
attribute(manuel_silva, cultural_knowledge, 85).
attribute(manuel_silva, propriety, 70).
language_proficiency(manuel_silva, portuguese, 95).
language_proficiency(manuel_silva, english, 30).

%% --- Maria Silva ---
trait(maria_silva, female).
trait(maria_silva, nurturing).
trait(maria_silva, warm).
trait(maria_silva, community_minded).
attribute(maria_silva, charisma, 70).
attribute(maria_silva, cultural_knowledge, 90).
attribute(maria_silva, propriety, 80).
relationship(maria_silva, manuel_silva, married).
language_proficiency(maria_silva, portuguese, 95).
language_proficiency(maria_silva, english, 25).

%% --- Beatriz Silva ---
trait(beatriz_silva, female).
trait(beatriz_silva, young).
trait(beatriz_silva, ambitious).
trait(beatriz_silva, tech_savvy).
attribute(beatriz_silva, charisma, 65).
attribute(beatriz_silva, cunningness, 50).
attribute(beatriz_silva, self_assuredness, 70).
language_proficiency(beatriz_silva, portuguese, 90).
language_proficiency(beatriz_silva, english, 75).

%% --- Tiago Silva ---
trait(tiago_silva, male).
trait(tiago_silva, young).
trait(tiago_silva, athletic).
trait(tiago_silva, social).
attribute(tiago_silva, charisma, 70).
attribute(tiago_silva, self_assuredness, 65).
attribute(tiago_silva, sensitiveness, 50).
language_proficiency(tiago_silva, portuguese, 88).
language_proficiency(tiago_silva, english, 60).

%% --- Antonio Santos ---
trait(antonio_santos, male).
trait(antonio_santos, shrewd).
trait(antonio_santos, experienced).
trait(antonio_santos, generous).
trait(antonio_santos, middle_aged).
attribute(antonio_santos, charisma, 80).
attribute(antonio_santos, cultural_knowledge, 80).
attribute(antonio_santos, cunningness, 65).
relationship(antonio_santos, manuel_silva, friends).
language_proficiency(antonio_santos, portuguese, 95).
language_proficiency(antonio_santos, english, 40).
language_proficiency(antonio_santos, spanish, 50).

%% --- Clara Santos ---
trait(clara_santos, female).
trait(clara_santos, organized).
trait(clara_santos, elegant).
trait(clara_santos, practical).
attribute(clara_santos, charisma, 75).
attribute(clara_santos, propriety, 80).
attribute(clara_santos, cultural_knowledge, 75).
relationship(clara_santos, antonio_santos, married).
relationship(clara_santos, maria_silva, friends).
language_proficiency(clara_santos, portuguese, 93).
language_proficiency(clara_santos, english, 35).

%% --- Ines Santos ---
trait(ines_santos, female).
trait(ines_santos, young).
trait(ines_santos, creative).
trait(ines_santos, independent).
attribute(ines_santos, charisma, 70).
attribute(ines_santos, self_assuredness, 65).
attribute(ines_santos, sensitiveness, 60).
relationship(ines_santos, carolina_ferreira, friends).
language_proficiency(ines_santos, portuguese, 90).
language_proficiency(ines_santos, english, 70).

%% --- Rafael Santos ---
trait(rafael_santos, male).
trait(rafael_santos, young).
trait(rafael_santos, entrepreneurial).
trait(rafael_santos, energetic).
attribute(rafael_santos, charisma, 70).
attribute(rafael_santos, cunningness, 55).
attribute(rafael_santos, self_assuredness, 65).
language_proficiency(rafael_santos, portuguese, 88).
language_proficiency(rafael_santos, english, 60).

%% --- Jorge Ferreira ---
trait(jorge_ferreira, male).
trait(jorge_ferreira, artistic).
trait(jorge_ferreira, passionate).
trait(jorge_ferreira, intellectual).
trait(jorge_ferreira, middle_aged).
attribute(jorge_ferreira, charisma, 80).
attribute(jorge_ferreira, cultural_knowledge, 95).
attribute(jorge_ferreira, sensitiveness, 80).
relationship(jorge_ferreira, antonio_santos, friends).
language_proficiency(jorge_ferreira, portuguese, 98).
language_proficiency(jorge_ferreira, english, 55).
language_proficiency(jorge_ferreira, french, 40).

%% --- Helena Ferreira ---
trait(helena_ferreira, female).
trait(helena_ferreira, articulate).
trait(helena_ferreira, cultured).
trait(helena_ferreira, musical).
attribute(helena_ferreira, charisma, 85).
attribute(helena_ferreira, cultural_knowledge, 90).
attribute(helena_ferreira, sensitiveness, 75).
relationship(helena_ferreira, jorge_ferreira, married).
language_proficiency(helena_ferreira, portuguese, 96).
language_proficiency(helena_ferreira, english, 50).

%% --- Carolina Ferreira ---
trait(carolina_ferreira, female).
trait(carolina_ferreira, young).
trait(carolina_ferreira, studious).
trait(carolina_ferreira, idealistic).
attribute(carolina_ferreira, charisma, 60).
attribute(carolina_ferreira, cultural_knowledge, 70).
attribute(carolina_ferreira, self_assuredness, 55).
language_proficiency(carolina_ferreira, portuguese, 92).
language_proficiency(carolina_ferreira, english, 80).

%% --- Diogo Ferreira ---
trait(diogo_ferreira, male).
trait(diogo_ferreira, young).
trait(diogo_ferreira, rebellious).
trait(diogo_ferreira, artistic).
attribute(diogo_ferreira, charisma, 65).
attribute(diogo_ferreira, self_assuredness, 55).
attribute(diogo_ferreira, sensitiveness, 70).
relationship(diogo_ferreira, tiago_silva, friends).
language_proficiency(diogo_ferreira, portuguese, 88).
language_proficiency(diogo_ferreira, english, 65).

%% --- Ricardo Pereira ---
trait(ricardo_pereira, male).
trait(ricardo_pereira, educated).
trait(ricardo_pereira, formal).
trait(ricardo_pereira, business_minded).
trait(ricardo_pereira, middle_aged).
attribute(ricardo_pereira, charisma, 80).
attribute(ricardo_pereira, cunningness, 70).
attribute(ricardo_pereira, propriety, 85).
language_proficiency(ricardo_pereira, portuguese, 95).
language_proficiency(ricardo_pereira, english, 80).
language_proficiency(ricardo_pereira, french, 45).

%% --- Ana Pereira ---
trait(ana_pereira, female).
trait(ana_pereira, warm).
trait(ana_pereira, modern).
trait(ana_pereira, confident).
attribute(ana_pereira, charisma, 80).
attribute(ana_pereira, cultural_knowledge, 75).
attribute(ana_pereira, self_assuredness, 80).
relationship(ana_pereira, ricardo_pereira, married).
language_proficiency(ana_pereira, portuguese, 93).
language_proficiency(ana_pereira, english, 75).

%% --- Sofia Pereira ---
trait(sofia_pereira, female).
trait(sofia_pereira, young).
trait(sofia_pereira, social).
trait(sofia_pereira, fashionable).
attribute(sofia_pereira, charisma, 75).
attribute(sofia_pereira, self_assuredness, 70).
attribute(sofia_pereira, sensitiveness, 55).
relationship(sofia_pereira, beatriz_silva, friends).
language_proficiency(sofia_pereira, portuguese, 90).
language_proficiency(sofia_pereira, english, 80).

%% --- Miguel Pereira ---
trait(miguel_pereira, male).
trait(miguel_pereira, young).
trait(miguel_pereira, quiet).
trait(miguel_pereira, thoughtful).
attribute(miguel_pereira, charisma, 55).
attribute(miguel_pereira, cultural_knowledge, 60).
attribute(miguel_pereira, sensitiveness, 70).
language_proficiency(miguel_pereira, portuguese, 88).
language_proficiency(miguel_pereira, english, 70).

%% --- Joaquim Costa ---
trait(joaquim_costa, male).
trait(joaquim_costa, rugged).
trait(joaquim_costa, hardworking).
trait(joaquim_costa, storyteller).
trait(joaquim_costa, middle_aged).
attribute(joaquim_costa, charisma, 65).
attribute(joaquim_costa, cultural_knowledge, 80).
attribute(joaquim_costa, propriety, 55).
language_proficiency(joaquim_costa, portuguese, 92).
language_proficiency(joaquim_costa, english, 15).

%% --- Rosa Costa ---
trait(rosa_costa, female).
trait(rosa_costa, resilient).
trait(rosa_costa, resourceful).
trait(rosa_costa, community_minded).
attribute(rosa_costa, charisma, 60).
attribute(rosa_costa, propriety, 65).
attribute(rosa_costa, cultural_knowledge, 75).
relationship(rosa_costa, joaquim_costa, married).
language_proficiency(rosa_costa, portuguese, 90).
language_proficiency(rosa_costa, english, 10).

%% --- Catarina Costa ---
trait(catarina_costa, female).
trait(catarina_costa, young).
trait(catarina_costa, curious).
trait(catarina_costa, cheerful).
attribute(catarina_costa, charisma, 70).
attribute(catarina_costa, sensitiveness, 60).
attribute(catarina_costa, self_assuredness, 50).
language_proficiency(catarina_costa, portuguese, 87).
language_proficiency(catarina_costa, english, 45).

%% --- Pedro Costa ---
trait(pedro_costa, male).
trait(pedro_costa, young).
trait(pedro_costa, restless).
trait(pedro_costa, ambitious).
attribute(pedro_costa, charisma, 60).
attribute(pedro_costa, self_assuredness, 55).
attribute(pedro_costa, cunningness, 40).
language_proficiency(pedro_costa, portuguese, 85).
language_proficiency(pedro_costa, english, 35).

%% --- Fernando Oliveira ---
trait(fernando_oliveira, male).
trait(fernando_oliveira, patient).
trait(fernando_oliveira, traditional).
trait(fernando_oliveira, proud).
trait(fernando_oliveira, elderly).
attribute(fernando_oliveira, charisma, 60).
attribute(fernando_oliveira, cultural_knowledge, 90).
attribute(fernando_oliveira, propriety, 70).
relationship(fernando_oliveira, joaquim_costa, friends).
language_proficiency(fernando_oliveira, portuguese, 95).
language_proficiency(fernando_oliveira, english, 10).

%% --- Teresa Oliveira ---
trait(teresa_oliveira, female).
trait(teresa_oliveira, gentle).
trait(teresa_oliveira, herbalist).
trait(teresa_oliveira, observant).
attribute(teresa_oliveira, charisma, 55).
attribute(teresa_oliveira, cultural_knowledge, 85).
attribute(teresa_oliveira, propriety, 70).
relationship(teresa_oliveira, fernando_oliveira, married).
language_proficiency(teresa_oliveira, portuguese, 93).
language_proficiency(teresa_oliveira, english, 5).

%% --- Mariana Oliveira ---
trait(mariana_oliveira, female).
trait(mariana_oliveira, young).
trait(mariana_oliveira, determined).
trait(mariana_oliveira, nature_loving).
attribute(mariana_oliveira, charisma, 55).
attribute(mariana_oliveira, self_assuredness, 60).
attribute(mariana_oliveira, sensitiveness, 65).
language_proficiency(mariana_oliveira, portuguese, 88).
language_proficiency(mariana_oliveira, english, 50).

%% --- Rui Oliveira ---
trait(rui_oliveira, male).
trait(rui_oliveira, young).
trait(rui_oliveira, quiet).
trait(rui_oliveira, dutiful).
attribute(rui_oliveira, charisma, 45).
attribute(rui_oliveira, propriety, 65).
attribute(rui_oliveira, cultural_knowledge, 60).
language_proficiency(rui_oliveira, portuguese, 87).
language_proficiency(rui_oliveira, english, 30).
