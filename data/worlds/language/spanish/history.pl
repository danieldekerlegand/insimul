%% Ensemble History: Spanish Castile -- Initial World State
%% Source: data/worlds/language/spanish/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status, language

%% --- Carlos Garcia Lopez ---
trait(carlos_garcia_lopez, male).
trait(carlos_garcia_lopez, hospitable).
trait(carlos_garcia_lopez, gregarious).
trait(carlos_garcia_lopez, traditional).
trait(carlos_garcia_lopez, middle_aged).
attribute(carlos_garcia_lopez, charisma, 80).
attribute(carlos_garcia_lopez, cultural_knowledge, 85).
attribute(carlos_garcia_lopez, propriety, 65).
language_proficiency(carlos_garcia_lopez, spanish, 95).
language_proficiency(carlos_garcia_lopez, english, 30).

%% --- Elena Martinez Ruiz ---
trait(elena_martinez_ruiz, female).
trait(elena_martinez_ruiz, nurturing).
trait(elena_martinez_ruiz, organized).
trait(elena_martinez_ruiz, community_minded).
attribute(elena_martinez_ruiz, charisma, 75).
attribute(elena_martinez_ruiz, cultural_knowledge, 80).
attribute(elena_martinez_ruiz, propriety, 75).
relationship(elena_martinez_ruiz, carlos_garcia_lopez, married).
language_proficiency(elena_martinez_ruiz, spanish, 95).
language_proficiency(elena_martinez_ruiz, english, 25).

%% --- Lucia Garcia Martinez ---
trait(lucia_garcia_martinez, female).
trait(lucia_garcia_martinez, young).
trait(lucia_garcia_martinez, ambitious).
trait(lucia_garcia_martinez, tech_savvy).
attribute(lucia_garcia_martinez, charisma, 70).
attribute(lucia_garcia_martinez, cunningness, 55).
attribute(lucia_garcia_martinez, self_assuredness, 70).
language_proficiency(lucia_garcia_martinez, spanish, 92).
language_proficiency(lucia_garcia_martinez, english, 75).

%% --- Pablo Garcia Martinez ---
trait(pablo_garcia_martinez, male).
trait(pablo_garcia_martinez, young).
trait(pablo_garcia_martinez, artistic).
trait(pablo_garcia_martinez, laid_back).
attribute(pablo_garcia_martinez, charisma, 60).
attribute(pablo_garcia_martinez, cultural_knowledge, 65).
attribute(pablo_garcia_martinez, sensitiveness, 70).
language_proficiency(pablo_garcia_martinez, spanish, 90).
language_proficiency(pablo_garcia_martinez, english, 50).

%% --- Antonio Rodriguez Fernandez ---
trait(antonio_rodriguez_fernandez, male).
trait(antonio_rodriguez_fernandez, educated).
trait(antonio_rodriguez_fernandez, formal).
trait(antonio_rodriguez_fernandez, intellectual).
trait(antonio_rodriguez_fernandez, middle_aged).
attribute(antonio_rodriguez_fernandez, charisma, 80).
attribute(antonio_rodriguez_fernandez, cultural_knowledge, 95).
attribute(antonio_rodriguez_fernandez, propriety, 85).
language_proficiency(antonio_rodriguez_fernandez, spanish, 98).
language_proficiency(antonio_rodriguez_fernandez, english, 80).
language_proficiency(antonio_rodriguez_fernandez, french, 50).

%% --- Carmen Sanchez Moreno ---
trait(carmen_sanchez_moreno, female).
trait(carmen_sanchez_moreno, articulate).
trait(carmen_sanchez_moreno, passionate).
trait(carmen_sanchez_moreno, modern).
attribute(carmen_sanchez_moreno, charisma, 85).
attribute(carmen_sanchez_moreno, cultural_knowledge, 80).
attribute(carmen_sanchez_moreno, self_assuredness, 80).
relationship(carmen_sanchez_moreno, antonio_rodriguez_fernandez, married).
language_proficiency(carmen_sanchez_moreno, spanish, 96).
language_proficiency(carmen_sanchez_moreno, english, 70).

%% --- Sofia Rodriguez Sanchez ---
trait(sofia_rodriguez_sanchez, female).
trait(sofia_rodriguez_sanchez, young).
trait(sofia_rodriguez_sanchez, studious).
trait(sofia_rodriguez_sanchez, idealistic).
attribute(sofia_rodriguez_sanchez, charisma, 65).
attribute(sofia_rodriguez_sanchez, cultural_knowledge, 70).
attribute(sofia_rodriguez_sanchez, self_assuredness, 55).
language_proficiency(sofia_rodriguez_sanchez, spanish, 93).
language_proficiency(sofia_rodriguez_sanchez, english, 85).

%% --- Diego Rodriguez Sanchez ---
trait(diego_rodriguez_sanchez, male).
trait(diego_rodriguez_sanchez, young).
trait(diego_rodriguez_sanchez, social).
trait(diego_rodriguez_sanchez, athletic).
attribute(diego_rodriguez_sanchez, charisma, 75).
attribute(diego_rodriguez_sanchez, self_assuredness, 70).
attribute(diego_rodriguez_sanchez, cunningness, 45).
language_proficiency(diego_rodriguez_sanchez, spanish, 90).
language_proficiency(diego_rodriguez_sanchez, english, 60).

%% --- Manuel Hernandez Gomez ---
trait(manuel_hernandez_gomez, male).
trait(manuel_hernandez_gomez, shrewd).
trait(manuel_hernandez_gomez, experienced).
trait(manuel_hernandez_gomez, merchant).
trait(manuel_hernandez_gomez, middle_aged).
attribute(manuel_hernandez_gomez, charisma, 80).
attribute(manuel_hernandez_gomez, cunningness, 70).
attribute(manuel_hernandez_gomez, cultural_knowledge, 75).
relationship(manuel_hernandez_gomez, carlos_garcia_lopez, friends).
language_proficiency(manuel_hernandez_gomez, spanish, 95).
language_proficiency(manuel_hernandez_gomez, english, 35).

%% --- Pilar Diaz Torres ---
trait(pilar_diaz_torres, female).
trait(pilar_diaz_torres, warm).
trait(pilar_diaz_torres, practical).
trait(pilar_diaz_torres, resourceful).
attribute(pilar_diaz_torres, charisma, 70).
attribute(pilar_diaz_torres, propriety, 75).
attribute(pilar_diaz_torres, cultural_knowledge, 80).
relationship(pilar_diaz_torres, manuel_hernandez_gomez, married).
relationship(pilar_diaz_torres, elena_martinez_ruiz, friends).
language_proficiency(pilar_diaz_torres, spanish, 94).
language_proficiency(pilar_diaz_torres, english, 20).

%% --- Maria Hernandez Diaz ---
trait(maria_hernandez_diaz, female).
trait(maria_hernandez_diaz, young).
trait(maria_hernandez_diaz, creative).
trait(maria_hernandez_diaz, independent).
attribute(maria_hernandez_diaz, charisma, 70).
attribute(maria_hernandez_diaz, self_assuredness, 65).
attribute(maria_hernandez_diaz, sensitiveness, 60).
relationship(maria_hernandez_diaz, sofia_rodriguez_sanchez, friends).
language_proficiency(maria_hernandez_diaz, spanish, 91).
language_proficiency(maria_hernandez_diaz, english, 55).

%% --- Javier Hernandez Diaz ---
trait(javier_hernandez_diaz, male).
trait(javier_hernandez_diaz, young).
trait(javier_hernandez_diaz, entrepreneurial).
trait(javier_hernandez_diaz, energetic).
attribute(javier_hernandez_diaz, charisma, 70).
attribute(javier_hernandez_diaz, cunningness, 60).
attribute(javier_hernandez_diaz, self_assuredness, 65).
language_proficiency(javier_hernandez_diaz, spanish, 90).
language_proficiency(javier_hernandez_diaz, english, 50).

%% --- Isabel Lopez Perez ---
trait(isabel_lopez_perez, female).
trait(isabel_lopez_perez, educated).
trait(isabel_lopez_perez, caring).
trait(isabel_lopez_perez, respected).
trait(isabel_lopez_perez, middle_aged).
attribute(isabel_lopez_perez, charisma, 75).
attribute(isabel_lopez_perez, cultural_knowledge, 70).
attribute(isabel_lopez_perez, propriety, 80).
relationship(isabel_lopez_perez, carmen_sanchez_moreno, friends).
language_proficiency(isabel_lopez_perez, spanish, 96).
language_proficiency(isabel_lopez_perez, english, 70).

%% --- Rafael Munoz Vega ---
trait(rafael_munoz_vega, male).
trait(rafael_munoz_vega, calm).
trait(rafael_munoz_vega, methodical).
trait(rafael_munoz_vega, cultured).
attribute(rafael_munoz_vega, charisma, 65).
attribute(rafael_munoz_vega, cultural_knowledge, 75).
attribute(rafael_munoz_vega, propriety, 80).
relationship(rafael_munoz_vega, isabel_lopez_perez, married).
relationship(rafael_munoz_vega, antonio_rodriguez_fernandez, friends).
language_proficiency(rafael_munoz_vega, spanish, 95).
language_proficiency(rafael_munoz_vega, english, 60).

%% --- Alba Munoz Lopez ---
trait(alba_munoz_lopez, female).
trait(alba_munoz_lopez, young).
trait(alba_munoz_lopez, rebellious).
trait(alba_munoz_lopez, musical).
attribute(alba_munoz_lopez, charisma, 65).
attribute(alba_munoz_lopez, self_assuredness, 55).
attribute(alba_munoz_lopez, sensitiveness, 75).
relationship(alba_munoz_lopez, lucia_garcia_martinez, friends).
language_proficiency(alba_munoz_lopez, spanish, 90).
language_proficiency(alba_munoz_lopez, english, 65).

%% --- Alejandro Munoz Lopez ---
trait(alejandro_munoz_lopez, male).
trait(alejandro_munoz_lopez, young).
trait(alejandro_munoz_lopez, diligent).
trait(alejandro_munoz_lopez, kind).
attribute(alejandro_munoz_lopez, charisma, 60).
attribute(alejandro_munoz_lopez, propriety, 70).
attribute(alejandro_munoz_lopez, cultural_knowledge, 60).
relationship(alejandro_munoz_lopez, diego_rodriguez_sanchez, friends).
language_proficiency(alejandro_munoz_lopez, spanish, 91).
language_proficiency(alejandro_munoz_lopez, english, 70).

%% --- Francisco Navarro Castillo ---
trait(francisco_navarro_castillo, male).
trait(francisco_navarro_castillo, patient).
trait(francisco_navarro_castillo, traditional).
trait(francisco_navarro_castillo, proud).
trait(francisco_navarro_castillo, elderly).
attribute(francisco_navarro_castillo, charisma, 60).
attribute(francisco_navarro_castillo, cultural_knowledge, 90).
attribute(francisco_navarro_castillo, propriety, 70).
relationship(francisco_navarro_castillo, pedro_serrano_gil, friends).
language_proficiency(francisco_navarro_castillo, spanish, 95).
language_proficiency(francisco_navarro_castillo, english, 10).

%% --- Dolores Ortega Ruiz ---
trait(dolores_ortega_ruiz, female).
trait(dolores_ortega_ruiz, gentle).
trait(dolores_ortega_ruiz, herbalist).
trait(dolores_ortega_ruiz, observant).
attribute(dolores_ortega_ruiz, charisma, 55).
attribute(dolores_ortega_ruiz, cultural_knowledge, 85).
attribute(dolores_ortega_ruiz, propriety, 70).
relationship(dolores_ortega_ruiz, francisco_navarro_castillo, married).
language_proficiency(dolores_ortega_ruiz, spanish, 94).
language_proficiency(dolores_ortega_ruiz, english, 5).

%% --- Rosa Navarro Ortega ---
trait(rosa_navarro_ortega, female).
trait(rosa_navarro_ortega, young).
trait(rosa_navarro_ortega, determined).
trait(rosa_navarro_ortega, nature_loving).
attribute(rosa_navarro_ortega, charisma, 55).
attribute(rosa_navarro_ortega, self_assuredness, 60).
attribute(rosa_navarro_ortega, sensitiveness, 65).
language_proficiency(rosa_navarro_ortega, spanish, 90).
language_proficiency(rosa_navarro_ortega, english, 40).

%% --- Miguel Navarro Ortega ---
trait(miguel_navarro_ortega, male).
trait(miguel_navarro_ortega, young).
trait(miguel_navarro_ortega, restless).
trait(miguel_navarro_ortega, ambitious).
attribute(miguel_navarro_ortega, charisma, 60).
attribute(miguel_navarro_ortega, self_assuredness, 55).
attribute(miguel_navarro_ortega, cunningness, 45).
language_proficiency(miguel_navarro_ortega, spanish, 88).
language_proficiency(miguel_navarro_ortega, english, 35).

%% --- Pedro Serrano Gil ---
trait(pedro_serrano_gil, male).
trait(pedro_serrano_gil, rugged).
trait(pedro_serrano_gil, hardworking).
trait(pedro_serrano_gil, storyteller).
trait(pedro_serrano_gil, middle_aged).
attribute(pedro_serrano_gil, charisma, 65).
attribute(pedro_serrano_gil, cultural_knowledge, 80).
attribute(pedro_serrano_gil, propriety, 55).
language_proficiency(pedro_serrano_gil, spanish, 93).
language_proficiency(pedro_serrano_gil, english, 15).

%% --- Teresa Blanco Romero ---
trait(teresa_blanco_romero, female).
trait(teresa_blanco_romero, resilient).
trait(teresa_blanco_romero, resourceful).
trait(teresa_blanco_romero, community_minded).
attribute(teresa_blanco_romero, charisma, 60).
attribute(teresa_blanco_romero, propriety, 65).
attribute(teresa_blanco_romero, cultural_knowledge, 75).
relationship(teresa_blanco_romero, pedro_serrano_gil, married).
language_proficiency(teresa_blanco_romero, spanish, 92).
language_proficiency(teresa_blanco_romero, english, 10).

%% --- Ines Serrano Blanco ---
trait(ines_serrano_blanco, female).
trait(ines_serrano_blanco, young).
trait(ines_serrano_blanco, curious).
trait(ines_serrano_blanco, cheerful).
attribute(ines_serrano_blanco, charisma, 70).
attribute(ines_serrano_blanco, sensitiveness, 60).
attribute(ines_serrano_blanco, self_assuredness, 50).
language_proficiency(ines_serrano_blanco, spanish, 88).
language_proficiency(ines_serrano_blanco, english, 45).

%% --- Andres Serrano Blanco ---
trait(andres_serrano_blanco, male).
trait(andres_serrano_blanco, young).
trait(andres_serrano_blanco, quiet).
trait(andres_serrano_blanco, dutiful).
attribute(andres_serrano_blanco, charisma, 45).
attribute(andres_serrano_blanco, propriety, 65).
attribute(andres_serrano_blanco, cultural_knowledge, 60).
language_proficiency(andres_serrano_blanco, spanish, 87).
language_proficiency(andres_serrano_blanco, english, 30).
