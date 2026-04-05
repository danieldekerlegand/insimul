%% Ensemble History: Bengali Riverside Town -- Initial World State
%% Source: data/worlds/language/bengali/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status, language

%% --- Karim Rahman ---
trait(karim_rahman, male).
trait(karim_rahman, hospitable).
trait(karim_rahman, generous).
trait(karim_rahman, traditional).
trait(karim_rahman, middle_aged).
attribute(karim_rahman, charisma, 75).
attribute(karim_rahman, cultural_knowledge, 85).
attribute(karim_rahman, propriety, 70).
language_proficiency(karim_rahman, bengali, 95).
language_proficiency(karim_rahman, english, 30).

%% --- Rashida Rahman ---
trait(rashida_rahman, female).
trait(rashida_rahman, nurturing).
trait(rashida_rahman, wise).
trait(rashida_rahman, community_minded).
attribute(rashida_rahman, charisma, 70).
attribute(rashida_rahman, cultural_knowledge, 90).
attribute(rashida_rahman, propriety, 80).
relationship(rashida_rahman, karim_rahman, married).
language_proficiency(rashida_rahman, bengali, 95).
language_proficiency(rashida_rahman, english, 20).

%% --- Nusrat Rahman ---
trait(nusrat_rahman, female).
trait(nusrat_rahman, young).
trait(nusrat_rahman, ambitious).
trait(nusrat_rahman, tech_savvy).
attribute(nusrat_rahman, charisma, 65).
attribute(nusrat_rahman, cunningness, 50).
attribute(nusrat_rahman, self_assuredness, 70).
language_proficiency(nusrat_rahman, bengali, 90).
language_proficiency(nusrat_rahman, english, 65).

%% --- Fahim Rahman ---
trait(fahim_rahman, male).
trait(fahim_rahman, young).
trait(fahim_rahman, artistic).
trait(fahim_rahman, quiet).
attribute(fahim_rahman, charisma, 55).
attribute(fahim_rahman, cultural_knowledge, 60).
attribute(fahim_rahman, sensitiveness, 75).
language_proficiency(fahim_rahman, bengali, 88).
language_proficiency(fahim_rahman, english, 50).

%% --- Anwar Hossain ---
trait(anwar_hossain, male).
trait(anwar_hossain, educated).
trait(anwar_hossain, formal).
trait(anwar_hossain, intellectual).
trait(anwar_hossain, middle_aged).
attribute(anwar_hossain, charisma, 80).
attribute(anwar_hossain, cultural_knowledge, 95).
attribute(anwar_hossain, propriety, 85).
language_proficiency(anwar_hossain, bengali, 98).
language_proficiency(anwar_hossain, english, 80).
language_proficiency(anwar_hossain, hindi, 40).

%% --- Nasreen Hossain ---
trait(nasreen_hossain, female).
trait(nasreen_hossain, articulate).
trait(nasreen_hossain, passionate).
trait(nasreen_hossain, modern).
attribute(nasreen_hossain, charisma, 85).
attribute(nasreen_hossain, cultural_knowledge, 80).
attribute(nasreen_hossain, self_assuredness, 80).
relationship(nasreen_hossain, anwar_hossain, married).
language_proficiency(nasreen_hossain, bengali, 95).
language_proficiency(nasreen_hossain, english, 75).

%% --- Tahmina Hossain ---
trait(tahmina_hossain, female).
trait(tahmina_hossain, young).
trait(tahmina_hossain, studious).
trait(tahmina_hossain, idealistic).
attribute(tahmina_hossain, charisma, 60).
attribute(tahmina_hossain, cultural_knowledge, 70).
attribute(tahmina_hossain, self_assuredness, 55).
language_proficiency(tahmina_hossain, bengali, 92).
language_proficiency(tahmina_hossain, english, 85).

%% --- Sohel Hossain ---
trait(sohel_hossain, male).
trait(sohel_hossain, young).
trait(sohel_hossain, social).
trait(sohel_hossain, athletic).
attribute(sohel_hossain, charisma, 75).
attribute(sohel_hossain, self_assuredness, 70).
attribute(sohel_hossain, cunningness, 45).
language_proficiency(sohel_hossain, bengali, 88).
language_proficiency(sohel_hossain, english, 60).

%% --- Jalal Ahmed ---
trait(jalal_ahmed, male).
trait(jalal_ahmed, shrewd).
trait(jalal_ahmed, experienced).
trait(jalal_ahmed, merchant).
trait(jalal_ahmed, middle_aged).
attribute(jalal_ahmed, charisma, 80).
attribute(jalal_ahmed, cunningness, 75).
attribute(jalal_ahmed, cultural_knowledge, 70).
relationship(jalal_ahmed, karim_rahman, friends).
language_proficiency(jalal_ahmed, bengali, 95).
language_proficiency(jalal_ahmed, english, 40).

%% --- Salma Ahmed ---
trait(salma_ahmed, female).
trait(salma_ahmed, organized).
trait(salma_ahmed, warm).
trait(salma_ahmed, practical).
attribute(salma_ahmed, charisma, 65).
attribute(salma_ahmed, propriety, 75).
attribute(salma_ahmed, cultural_knowledge, 80).
relationship(salma_ahmed, jalal_ahmed, married).
relationship(salma_ahmed, rashida_rahman, friends).
language_proficiency(salma_ahmed, bengali, 93).
language_proficiency(salma_ahmed, english, 25).

%% --- Farzana Ahmed ---
trait(farzana_ahmed, female).
trait(farzana_ahmed, young).
trait(farzana_ahmed, creative).
trait(farzana_ahmed, independent).
attribute(farzana_ahmed, charisma, 70).
attribute(farzana_ahmed, self_assuredness, 65).
attribute(farzana_ahmed, sensitiveness, 60).
relationship(farzana_ahmed, tahmina_hossain, friends).
language_proficiency(farzana_ahmed, bengali, 90).
language_proficiency(farzana_ahmed, english, 55).

%% --- Imran Ahmed ---
trait(imran_ahmed, male).
trait(imran_ahmed, young).
trait(imran_ahmed, entrepreneurial).
trait(imran_ahmed, energetic).
attribute(imran_ahmed, charisma, 70).
attribute(imran_ahmed, cunningness, 60).
attribute(imran_ahmed, self_assuredness, 65).
language_proficiency(imran_ahmed, bengali, 88).
language_proficiency(imran_ahmed, english, 50).

%% --- Tariqul Islam ---
trait(tariqul_islam, male).
trait(tariqul_islam, educated).
trait(tariqul_islam, caring).
trait(tariqul_islam, respected).
trait(tariqul_islam, middle_aged).
attribute(tariqul_islam, charisma, 75).
attribute(tariqul_islam, cultural_knowledge, 70).
attribute(tariqul_islam, propriety, 80).
relationship(tariqul_islam, anwar_hossain, friends).
language_proficiency(tariqul_islam, bengali, 95).
language_proficiency(tariqul_islam, english, 70).

%% --- Hasina Begum ---
trait(hasina_begum, female).
trait(hasina_begum, elegant).
trait(hasina_begum, artistic).
trait(hasina_begum, cultured).
attribute(hasina_begum, charisma, 80).
attribute(hasina_begum, cultural_knowledge, 85).
attribute(hasina_begum, sensitiveness, 70).
relationship(hasina_begum, tariqul_islam, married).
language_proficiency(hasina_begum, bengali, 93).
language_proficiency(hasina_begum, english, 55).

%% --- Rafiq Islam ---
trait(rafiq_islam, male).
trait(rafiq_islam, young).
trait(rafiq_islam, rebellious).
trait(rafiq_islam, musical).
attribute(rafiq_islam, charisma, 65).
attribute(rafiq_islam, self_assuredness, 55).
attribute(rafiq_islam, sensitiveness, 70).
relationship(rafiq_islam, sohel_hossain, friends).
language_proficiency(rafiq_islam, bengali, 85).
language_proficiency(rafiq_islam, english, 55).

%% --- Sharmin Islam ---
trait(sharmin_islam, female).
trait(sharmin_islam, young).
trait(sharmin_islam, diligent).
trait(sharmin_islam, kind).
attribute(sharmin_islam, charisma, 60).
attribute(sharmin_islam, propriety, 75).
attribute(sharmin_islam, cultural_knowledge, 65).
relationship(sharmin_islam, nusrat_rahman, friends).
language_proficiency(sharmin_islam, bengali, 90).
language_proficiency(sharmin_islam, english, 65).

%% --- Habibur Molla ---
trait(habibur_molla, male).
trait(habibur_molla, rugged).
trait(habibur_molla, hardworking).
trait(habibur_molla, storyteller).
trait(habibur_molla, middle_aged).
attribute(habibur_molla, charisma, 65).
attribute(habibur_molla, cultural_knowledge, 75).
attribute(habibur_molla, propriety, 55).
language_proficiency(habibur_molla, bengali, 92).
language_proficiency(habibur_molla, english, 10).

%% --- Jahanara Khatun ---
trait(jahanara_khatun, female).
trait(jahanara_khatun, resilient).
trait(jahanara_khatun, resourceful).
trait(jahanara_khatun, community_minded).
attribute(jahanara_khatun, charisma, 60).
attribute(jahanara_khatun, propriety, 65).
attribute(jahanara_khatun, cultural_knowledge, 70).
relationship(jahanara_khatun, habibur_molla, married).
language_proficiency(jahanara_khatun, bengali, 90).
language_proficiency(jahanara_khatun, english, 5).

%% --- Rubel Molla ---
trait(rubel_molla, male).
trait(rubel_molla, young).
trait(rubel_molla, restless).
trait(rubel_molla, ambitious).
attribute(rubel_molla, charisma, 60).
attribute(rubel_molla, self_assuredness, 50).
attribute(rubel_molla, cunningness, 40).
language_proficiency(rubel_molla, bengali, 85).
language_proficiency(rubel_molla, english, 30).

%% --- Beauty Khatun ---
trait(beauty_khatun, female).
trait(beauty_khatun, young).
trait(beauty_khatun, curious).
trait(beauty_khatun, cheerful).
attribute(beauty_khatun, charisma, 70).
attribute(beauty_khatun, sensitiveness, 60).
attribute(beauty_khatun, self_assuredness, 45).
language_proficiency(beauty_khatun, bengali, 87).
language_proficiency(beauty_khatun, english, 35).

%% --- Monir Sarker ---
trait(monir_sarker, male).
trait(monir_sarker, patient).
trait(monir_sarker, traditional).
trait(monir_sarker, proud).
trait(monir_sarker, elderly).
attribute(monir_sarker, charisma, 60).
attribute(monir_sarker, cultural_knowledge, 90).
attribute(monir_sarker, propriety, 70).
relationship(monir_sarker, habibur_molla, friends).
language_proficiency(monir_sarker, bengali, 95).
language_proficiency(monir_sarker, english, 8).

%% --- Aleya Sarker ---
trait(aleya_sarker, female).
trait(aleya_sarker, gentle).
trait(aleya_sarker, herbalist).
trait(aleya_sarker, observant).
attribute(aleya_sarker, charisma, 55).
attribute(aleya_sarker, cultural_knowledge, 85).
attribute(aleya_sarker, propriety, 70).
relationship(aleya_sarker, monir_sarker, married).
language_proficiency(aleya_sarker, bengali, 93).
language_proficiency(aleya_sarker, english, 5).

%% --- Lipi Sarker ---
trait(lipi_sarker, female).
trait(lipi_sarker, young).
trait(lipi_sarker, determined).
trait(lipi_sarker, nature_loving).
attribute(lipi_sarker, charisma, 55).
attribute(lipi_sarker, self_assuredness, 60).
attribute(lipi_sarker, sensitiveness, 65).
language_proficiency(lipi_sarker, bengali, 88).
language_proficiency(lipi_sarker, english, 40).

%% --- Sumon Sarker ---
trait(sumon_sarker, male).
trait(sumon_sarker, young).
trait(sumon_sarker, quiet).
trait(sumon_sarker, dutiful).
attribute(sumon_sarker, charisma, 45).
attribute(sumon_sarker, propriety, 65).
attribute(sumon_sarker, cultural_knowledge, 60).
language_proficiency(sumon_sarker, bengali, 87).
language_proficiency(sumon_sarker, english, 25).
