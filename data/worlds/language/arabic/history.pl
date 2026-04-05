%% Ensemble History: Arabic Coastal Town — Initial World State
%% Source: data/worlds/language/arabic/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status, language

%% ─── Omar Hassan ───
trait(omar_hassan, male).
trait(omar_hassan, hospitable).
trait(omar_hassan, generous).
trait(omar_hassan, traditional).
trait(omar_hassan, middle_aged).
attribute(omar_hassan, charisma, 75).
attribute(omar_hassan, cultural_knowledge, 85).
attribute(omar_hassan, propriety, 70).
language_proficiency(omar_hassan, arabic, 95).
language_proficiency(omar_hassan, english, 35).

%% ─── Fatima Hassan ───
trait(fatima_hassan, female).
trait(fatima_hassan, nurturing).
trait(fatima_hassan, wise).
trait(fatima_hassan, community_minded).
attribute(fatima_hassan, charisma, 70).
attribute(fatima_hassan, cultural_knowledge, 90).
attribute(fatima_hassan, propriety, 80).
relationship(fatima_hassan, omar_hassan, married).
language_proficiency(fatima_hassan, arabic, 95).
language_proficiency(fatima_hassan, english, 25).

%% ─── Layla Hassan ───
trait(layla_hassan, female).
trait(layla_hassan, young).
trait(layla_hassan, ambitious).
trait(layla_hassan, tech_savvy).
attribute(layla_hassan, charisma, 65).
attribute(layla_hassan, cunningness, 50).
attribute(layla_hassan, self_assuredness, 70).
language_proficiency(layla_hassan, arabic, 90).
language_proficiency(layla_hassan, english, 70).

%% ─── Yusuf Hassan ───
trait(yusuf_hassan, male).
trait(yusuf_hassan, young).
trait(yusuf_hassan, artistic).
trait(yusuf_hassan, quiet).
attribute(yusuf_hassan, charisma, 55).
attribute(yusuf_hassan, cultural_knowledge, 60).
attribute(yusuf_hassan, sensitiveness, 75).
language_proficiency(yusuf_hassan, arabic, 88).
language_proficiency(yusuf_hassan, english, 55).

%% ─── Khalid al-Rashid ───
trait(khalid_al_rashid, male).
trait(khalid_al_rashid, educated).
trait(khalid_al_rashid, formal).
trait(khalid_al_rashid, intellectual).
trait(khalid_al_rashid, middle_aged).
attribute(khalid_al_rashid, charisma, 80).
attribute(khalid_al_rashid, cultural_knowledge, 95).
attribute(khalid_al_rashid, propriety, 85).
language_proficiency(khalid_al_rashid, arabic, 98).
language_proficiency(khalid_al_rashid, english, 80).
language_proficiency(khalid_al_rashid, french, 40).

%% ─── Amira al-Rashid ───
trait(amira_al_rashid, female).
trait(amira_al_rashid, articulate).
trait(amira_al_rashid, passionate).
trait(amira_al_rashid, modern).
attribute(amira_al_rashid, charisma, 85).
attribute(amira_al_rashid, cultural_knowledge, 80).
attribute(amira_al_rashid, self_assuredness, 80).
relationship(amira_al_rashid, khalid_al_rashid, married).
language_proficiency(amira_al_rashid, arabic, 95).
language_proficiency(amira_al_rashid, english, 75).

%% ─── Nadia al-Rashid ───
trait(nadia_al_rashid, female).
trait(nadia_al_rashid, young).
trait(nadia_al_rashid, studious).
trait(nadia_al_rashid, idealistic).
attribute(nadia_al_rashid, charisma, 60).
attribute(nadia_al_rashid, cultural_knowledge, 70).
attribute(nadia_al_rashid, self_assuredness, 55).
language_proficiency(nadia_al_rashid, arabic, 92).
language_proficiency(nadia_al_rashid, english, 85).

%% ─── Tariq al-Rashid ───
trait(tariq_al_rashid, male).
trait(tariq_al_rashid, young).
trait(tariq_al_rashid, social).
trait(tariq_al_rashid, athletic).
attribute(tariq_al_rashid, charisma, 75).
attribute(tariq_al_rashid, self_assuredness, 70).
attribute(tariq_al_rashid, cunningness, 45).
language_proficiency(tariq_al_rashid, arabic, 88).
language_proficiency(tariq_al_rashid, english, 65).

%% ─── Ibrahim Mansour ───
trait(ibrahim_mansour, male).
trait(ibrahim_mansour, shrewd).
trait(ibrahim_mansour, experienced).
trait(ibrahim_mansour, merchant).
trait(ibrahim_mansour, middle_aged).
attribute(ibrahim_mansour, charisma, 80).
attribute(ibrahim_mansour, cunningness, 75).
attribute(ibrahim_mansour, cultural_knowledge, 70).
relationship(ibrahim_mansour, omar_hassan, friends).
language_proficiency(ibrahim_mansour, arabic, 95).
language_proficiency(ibrahim_mansour, english, 40).

%% ─── Huda Mansour ───
trait(huda_mansour, female).
trait(huda_mansour, organized).
trait(huda_mansour, warm).
trait(huda_mansour, practical).
attribute(huda_mansour, charisma, 65).
attribute(huda_mansour, propriety, 75).
attribute(huda_mansour, cultural_knowledge, 80).
relationship(huda_mansour, ibrahim_mansour, married).
relationship(huda_mansour, fatima_hassan, friends).
language_proficiency(huda_mansour, arabic, 93).
language_proficiency(huda_mansour, english, 30).

%% ─── Sara Mansour ───
trait(sara_mansour, female).
trait(sara_mansour, young).
trait(sara_mansour, creative).
trait(sara_mansour, independent).
attribute(sara_mansour, charisma, 70).
attribute(sara_mansour, self_assuredness, 65).
attribute(sara_mansour, sensitiveness, 60).
relationship(sara_mansour, nadia_al_rashid, friends).
language_proficiency(sara_mansour, arabic, 90).
language_proficiency(sara_mansour, english, 60).

%% ─── Ahmed Mansour ───
trait(ahmed_mansour, male).
trait(ahmed_mansour, young).
trait(ahmed_mansour, entrepreneurial).
trait(ahmed_mansour, energetic).
attribute(ahmed_mansour, charisma, 70).
attribute(ahmed_mansour, cunningness, 60).
attribute(ahmed_mansour, self_assuredness, 65).
language_proficiency(ahmed_mansour, arabic, 88).
language_proficiency(ahmed_mansour, english, 55).

%% ─── Samir Khoury ───
trait(samir_khoury, male).
trait(samir_khoury, educated).
trait(samir_khoury, caring).
trait(samir_khoury, respected).
trait(samir_khoury, middle_aged).
attribute(samir_khoury, charisma, 75).
attribute(samir_khoury, cultural_knowledge, 70).
attribute(samir_khoury, propriety, 80).
relationship(samir_khoury, khalid_al_rashid, friends).
language_proficiency(samir_khoury, arabic, 95).
language_proficiency(samir_khoury, english, 70).

%% ─── Leila Khoury ───
trait(leila_khoury, female).
trait(leila_khoury, elegant).
trait(leila_khoury, artistic).
trait(leila_khoury, cultured).
attribute(leila_khoury, charisma, 80).
attribute(leila_khoury, cultural_knowledge, 85).
attribute(leila_khoury, sensitiveness, 70).
relationship(leila_khoury, samir_khoury, married).
language_proficiency(leila_khoury, arabic, 93).
language_proficiency(leila_khoury, english, 60).

%% ─── Rami Khoury ───
trait(rami_khoury, male).
trait(rami_khoury, young).
trait(rami_khoury, rebellious).
trait(rami_khoury, musical).
attribute(rami_khoury, charisma, 65).
attribute(rami_khoury, self_assuredness, 55).
attribute(rami_khoury, sensitiveness, 70).
relationship(rami_khoury, tariq_al_rashid, friends).
language_proficiency(rami_khoury, arabic, 85).
language_proficiency(rami_khoury, english, 60).

%% ─── Dina Khoury ───
trait(dina_khoury, female).
trait(dina_khoury, young).
trait(dina_khoury, diligent).
trait(dina_khoury, kind).
attribute(dina_khoury, charisma, 60).
attribute(dina_khoury, propriety, 75).
attribute(dina_khoury, cultural_knowledge, 65).
relationship(dina_khoury, layla_hassan, friends).
language_proficiency(dina_khoury, arabic, 90).
language_proficiency(dina_khoury, english, 70).

%% ─── Mahmoud Jabari ───
trait(mahmoud_jabari, male).
trait(mahmoud_jabari, rugged).
trait(mahmoud_jabari, hardworking).
trait(mahmoud_jabari, storyteller).
trait(mahmoud_jabari, middle_aged).
attribute(mahmoud_jabari, charisma, 65).
attribute(mahmoud_jabari, cultural_knowledge, 75).
attribute(mahmoud_jabari, propriety, 55).
language_proficiency(mahmoud_jabari, arabic, 92).
language_proficiency(mahmoud_jabari, english, 15).

%% ─── Samia Jabari ───
trait(samia_jabari, female).
trait(samia_jabari, resilient).
trait(samia_jabari, resourceful).
trait(samia_jabari, community_minded).
attribute(samia_jabari, charisma, 60).
attribute(samia_jabari, propriety, 65).
attribute(samia_jabari, cultural_knowledge, 70).
relationship(samia_jabari, mahmoud_jabari, married).
language_proficiency(samia_jabari, arabic, 90).
language_proficiency(samia_jabari, english, 10).

%% ─── Kareem Jabari ───
trait(kareem_jabari, male).
trait(kareem_jabari, young).
trait(kareem_jabari, restless).
trait(kareem_jabari, ambitious).
attribute(kareem_jabari, charisma, 60).
attribute(kareem_jabari, self_assuredness, 50).
attribute(kareem_jabari, cunningness, 40).
language_proficiency(kareem_jabari, arabic, 85).
language_proficiency(kareem_jabari, english, 35).

%% ─── Mona Jabari ───
trait(mona_jabari, female).
trait(mona_jabari, young).
trait(mona_jabari, curious).
trait(mona_jabari, cheerful).
attribute(mona_jabari, charisma, 70).
attribute(mona_jabari, sensitiveness, 60).
attribute(mona_jabari, self_assuredness, 45).
language_proficiency(mona_jabari, arabic, 87).
language_proficiency(mona_jabari, english, 40).

%% ─── Adel Nasser ───
trait(adel_nasser, male).
trait(adel_nasser, patient).
trait(adel_nasser, traditional).
trait(adel_nasser, proud).
trait(adel_nasser, elderly).
attribute(adel_nasser, charisma, 60).
attribute(adel_nasser, cultural_knowledge, 90).
attribute(adel_nasser, propriety, 70).
relationship(adel_nasser, mahmoud_jabari, friends).
language_proficiency(adel_nasser, arabic, 95).
language_proficiency(adel_nasser, english, 10).

%% ─── Noura Nasser ───
trait(noura_nasser, female).
trait(noura_nasser, gentle).
trait(noura_nasser, herbalist).
trait(noura_nasser, observant).
attribute(noura_nasser, charisma, 55).
attribute(noura_nasser, cultural_knowledge, 85).
attribute(noura_nasser, propriety, 70).
relationship(noura_nasser, adel_nasser, married).
language_proficiency(noura_nasser, arabic, 93).
language_proficiency(noura_nasser, english, 5).

%% ─── Rana Nasser ───
trait(rana_nasser, female).
trait(rana_nasser, young).
trait(rana_nasser, determined).
trait(rana_nasser, nature_loving).
attribute(rana_nasser, charisma, 55).
attribute(rana_nasser, self_assuredness, 60).
attribute(rana_nasser, sensitiveness, 65).
language_proficiency(rana_nasser, arabic, 88).
language_proficiency(rana_nasser, english, 45).

%% ─── Walid Nasser ───
trait(walid_nasser, male).
trait(walid_nasser, young).
trait(walid_nasser, quiet).
trait(walid_nasser, dutiful).
attribute(walid_nasser, charisma, 45).
attribute(walid_nasser, propriety, 65).
attribute(walid_nasser, cultural_knowledge, 60).
language_proficiency(walid_nasser, arabic, 87).
language_proficiency(walid_nasser, english, 30).
