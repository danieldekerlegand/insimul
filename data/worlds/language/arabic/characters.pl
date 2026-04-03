%% Insimul Characters: Arabic Al-Andalus
%% Source: data/worlds/language/arabic/characters.pl
%% Created: 2026-04-03
%% Total: 24 characters (genealogy across 3 generations, multi-faith)
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2

%% ═══════════════════════════════════════════════════════════
%% Al-Rashid Family (Muslim scholars/merchants)
%% ═══════════════════════════════════════════════════════════

%% Abu Bakr al-Rashid — patriarch, merchant
person(abu_bakr_al_rashid).
first_name(abu_bakr_al_rashid, 'Abu Bakr').
last_name(abu_bakr_al_rashid, 'al-Rashid').
full_name(abu_bakr_al_rashid, 'Abu Bakr al-Rashid').
gender(abu_bakr_al_rashid, male).
alive(abu_bakr_al_rashid).
generation(abu_bakr_al_rashid, 0).
founder_family(abu_bakr_al_rashid).
child(abu_bakr_al_rashid, yusuf_al_rashid).
child(abu_bakr_al_rashid, fatima_al_rashid).
spouse(abu_bakr_al_rashid, khadija_al_rashid).
location(abu_bakr_al_rashid, qurtuba).

%% Khadija al-Rashid — matriarch
person(khadija_al_rashid).
first_name(khadija_al_rashid, 'Khadija').
last_name(khadija_al_rashid, 'al-Rashid').
full_name(khadija_al_rashid, 'Khadija al-Rashid').
gender(khadija_al_rashid, female).
alive(khadija_al_rashid).
generation(khadija_al_rashid, 0).
founder_family(khadija_al_rashid).
child(khadija_al_rashid, yusuf_al_rashid).
child(khadija_al_rashid, fatima_al_rashid).
spouse(khadija_al_rashid, abu_bakr_al_rashid).
location(khadija_al_rashid, qurtuba).

%% Yusuf al-Rashid — son, astronomer
person(yusuf_al_rashid).
first_name(yusuf_al_rashid, 'Yusuf').
last_name(yusuf_al_rashid, 'al-Rashid').
full_name(yusuf_al_rashid, 'Yusuf al-Rashid').
gender(yusuf_al_rashid, male).
alive(yusuf_al_rashid).
generation(yusuf_al_rashid, 1).
parent(abu_bakr_al_rashid, yusuf_al_rashid).
parent(khadija_al_rashid, yusuf_al_rashid).
child(yusuf_al_rashid, layla_al_rashid).
spouse(yusuf_al_rashid, zahra_al_rashid).
location(yusuf_al_rashid, qurtuba).

%% Zahra al-Rashid — Yusuf's wife, poetess
person(zahra_al_rashid).
first_name(zahra_al_rashid, 'Zahra').
last_name(zahra_al_rashid, 'al-Rashid').
full_name(zahra_al_rashid, 'Zahra al-Rashid').
gender(zahra_al_rashid, female).
alive(zahra_al_rashid).
generation(zahra_al_rashid, 1).
child(zahra_al_rashid, layla_al_rashid).
spouse(zahra_al_rashid, yusuf_al_rashid).
location(zahra_al_rashid, qurtuba).

%% Layla al-Rashid — granddaughter, student
person(layla_al_rashid).
first_name(layla_al_rashid, 'Layla').
last_name(layla_al_rashid, 'al-Rashid').
full_name(layla_al_rashid, 'Layla al-Rashid').
gender(layla_al_rashid, female).
alive(layla_al_rashid).
generation(layla_al_rashid, 2).
parent(yusuf_al_rashid, layla_al_rashid).
parent(zahra_al_rashid, layla_al_rashid).
location(layla_al_rashid, qurtuba).

%% Fatima al-Rashid — daughter, physician
person(fatima_al_rashid).
first_name(fatima_al_rashid, 'Fatima').
last_name(fatima_al_rashid, 'al-Rashid').
full_name(fatima_al_rashid, 'Fatima al-Rashid').
gender(fatima_al_rashid, female).
alive(fatima_al_rashid).
generation(fatima_al_rashid, 1).
parent(abu_bakr_al_rashid, fatima_al_rashid).
parent(khadija_al_rashid, fatima_al_rashid).
location(fatima_al_rashid, qurtuba).

%% ═══════════════════════════════════════════════════════════
%% Ibn Hayyan Family (Muslim scholars)
%% ═══════════════════════════════════════════════════════════

%% Khalid ibn Hayyan — patriarch, qadi (judge)
person(khalid_ibn_hayyan).
first_name(khalid_ibn_hayyan, 'Khalid').
last_name(khalid_ibn_hayyan, 'ibn Hayyan').
full_name(khalid_ibn_hayyan, 'Khalid ibn Hayyan').
gender(khalid_ibn_hayyan, male).
alive(khalid_ibn_hayyan).
generation(khalid_ibn_hayyan, 0).
founder_family(khalid_ibn_hayyan).
child(khalid_ibn_hayyan, tariq_ibn_hayyan).
child(khalid_ibn_hayyan, maryam_ibn_hayyan).
spouse(khalid_ibn_hayyan, salma_ibn_hayyan).
location(khalid_ibn_hayyan, qurtuba).

%% Salma ibn Hayyan — matriarch
person(salma_ibn_hayyan).
first_name(salma_ibn_hayyan, 'Salma').
last_name(salma_ibn_hayyan, 'ibn Hayyan').
full_name(salma_ibn_hayyan, 'Salma ibn Hayyan').
gender(salma_ibn_hayyan, female).
alive(salma_ibn_hayyan).
generation(salma_ibn_hayyan, 0).
founder_family(salma_ibn_hayyan).
child(salma_ibn_hayyan, tariq_ibn_hayyan).
child(salma_ibn_hayyan, maryam_ibn_hayyan).
spouse(salma_ibn_hayyan, khalid_ibn_hayyan).
location(salma_ibn_hayyan, qurtuba).

%% Tariq ibn Hayyan — son, calligrapher
person(tariq_ibn_hayyan).
first_name(tariq_ibn_hayyan, 'Tariq').
last_name(tariq_ibn_hayyan, 'ibn Hayyan').
full_name(tariq_ibn_hayyan, 'Tariq ibn Hayyan').
gender(tariq_ibn_hayyan, male).
alive(tariq_ibn_hayyan).
generation(tariq_ibn_hayyan, 1).
parent(khalid_ibn_hayyan, tariq_ibn_hayyan).
parent(salma_ibn_hayyan, tariq_ibn_hayyan).
location(tariq_ibn_hayyan, qurtuba).

%% Maryam ibn Hayyan — daughter, herbalist
person(maryam_ibn_hayyan).
first_name(maryam_ibn_hayyan, 'Maryam').
last_name(maryam_ibn_hayyan, 'ibn Hayyan').
full_name(maryam_ibn_hayyan, 'Maryam ibn Hayyan').
gender(maryam_ibn_hayyan, female).
alive(maryam_ibn_hayyan).
generation(maryam_ibn_hayyan, 1).
parent(khalid_ibn_hayyan, maryam_ibn_hayyan).
parent(salma_ibn_hayyan, maryam_ibn_hayyan).
location(maryam_ibn_hayyan, qurtuba).

%% ═══════════════════════════════════════════════════════════
%% Al-Qurtubi Family (Muslim artisans)
%% ═══════════════════════════════════════════════════════════

%% Hassan al-Qurtubi — patriarch, coppersmith
person(hassan_al_qurtubi).
first_name(hassan_al_qurtubi, 'Hassan').
last_name(hassan_al_qurtubi, 'al-Qurtubi').
full_name(hassan_al_qurtubi, 'Hassan al-Qurtubi').
gender(hassan_al_qurtubi, male).
alive(hassan_al_qurtubi).
generation(hassan_al_qurtubi, 0).
founder_family(hassan_al_qurtubi).
child(hassan_al_qurtubi, omar_al_qurtubi).
child(hassan_al_qurtubi, amina_al_qurtubi).
spouse(hassan_al_qurtubi, noura_al_qurtubi).
location(hassan_al_qurtubi, qurtuba).

%% Noura al-Qurtubi — matriarch, weaver
person(noura_al_qurtubi).
first_name(noura_al_qurtubi, 'Noura').
last_name(noura_al_qurtubi, 'al-Qurtubi').
full_name(noura_al_qurtubi, 'Noura al-Qurtubi').
gender(noura_al_qurtubi, female).
alive(noura_al_qurtubi).
generation(noura_al_qurtubi, 0).
founder_family(noura_al_qurtubi).
child(noura_al_qurtubi, omar_al_qurtubi).
child(noura_al_qurtubi, amina_al_qurtubi).
spouse(noura_al_qurtubi, hassan_al_qurtubi).
location(noura_al_qurtubi, qurtuba).

%% Omar al-Qurtubi — son, potter
person(omar_al_qurtubi).
first_name(omar_al_qurtubi, 'Omar').
last_name(omar_al_qurtubi, 'al-Qurtubi').
full_name(omar_al_qurtubi, 'Omar al-Qurtubi').
gender(omar_al_qurtubi, male).
alive(omar_al_qurtubi).
generation(omar_al_qurtubi, 1).
parent(hassan_al_qurtubi, omar_al_qurtubi).
parent(noura_al_qurtubi, omar_al_qurtubi).
location(omar_al_qurtubi, qurtuba).

%% Amina al-Qurtubi — daughter, midwife
person(amina_al_qurtubi).
first_name(amina_al_qurtubi, 'Amina').
last_name(amina_al_qurtubi, 'al-Qurtubi').
full_name(amina_al_qurtubi, 'Amina al-Qurtubi').
gender(amina_al_qurtubi, female).
alive(amina_al_qurtubi).
generation(amina_al_qurtubi, 1).
parent(hassan_al_qurtubi, amina_al_qurtubi).
parent(noura_al_qurtubi, amina_al_qurtubi).
location(amina_al_qurtubi, qurtuba).

%% ═══════════════════════════════════════════════════════════
%% Ben Shlomo Family (Jewish scholars/translators)
%% ═══════════════════════════════════════════════════════════

%% Moshe ben Shlomo — patriarch, translator
person(moshe_ben_shlomo).
first_name(moshe_ben_shlomo, 'Moshe').
last_name(moshe_ben_shlomo, 'ben Shlomo').
full_name(moshe_ben_shlomo, 'Moshe ben Shlomo').
gender(moshe_ben_shlomo, male).
alive(moshe_ben_shlomo).
generation(moshe_ben_shlomo, 0).
founder_family(moshe_ben_shlomo).
child(moshe_ben_shlomo, david_ben_shlomo).
child(moshe_ben_shlomo, miriam_ben_shlomo).
spouse(moshe_ben_shlomo, hannah_ben_shlomo).
location(moshe_ben_shlomo, qurtuba).

%% Hannah ben Shlomo — matriarch
person(hannah_ben_shlomo).
first_name(hannah_ben_shlomo, 'Hannah').
last_name(hannah_ben_shlomo, 'ben Shlomo').
full_name(hannah_ben_shlomo, 'Hannah ben Shlomo').
gender(hannah_ben_shlomo, female).
alive(hannah_ben_shlomo).
generation(hannah_ben_shlomo, 0).
founder_family(hannah_ben_shlomo).
child(hannah_ben_shlomo, david_ben_shlomo).
child(hannah_ben_shlomo, miriam_ben_shlomo).
spouse(hannah_ben_shlomo, moshe_ben_shlomo).
location(hannah_ben_shlomo, qurtuba).

%% David ben Shlomo — son, physician
person(david_ben_shlomo).
first_name(david_ben_shlomo, 'David').
last_name(david_ben_shlomo, 'ben Shlomo').
full_name(david_ben_shlomo, 'David ben Shlomo').
gender(david_ben_shlomo, male).
alive(david_ben_shlomo).
generation(david_ben_shlomo, 1).
parent(moshe_ben_shlomo, david_ben_shlomo).
parent(hannah_ben_shlomo, david_ben_shlomo).
location(david_ben_shlomo, qurtuba).

%% Miriam ben Shlomo — daughter, scribe
person(miriam_ben_shlomo).
first_name(miriam_ben_shlomo, 'Miriam').
last_name(miriam_ben_shlomo, 'ben Shlomo').
full_name(miriam_ben_shlomo, 'Miriam ben Shlomo').
gender(miriam_ben_shlomo, female).
alive(miriam_ben_shlomo).
generation(miriam_ben_shlomo, 1).
parent(moshe_ben_shlomo, miriam_ben_shlomo).
parent(hannah_ben_shlomo, miriam_ben_shlomo).
location(miriam_ben_shlomo, qurtuba).

%% ═══════════════════════════════════════════════════════════
%% De Leon Family (Christian/Mozarab)
%% ═══════════════════════════════════════════════════════════

%% Alfonso de Leon — patriarch, winemaker
person(alfonso_de_leon).
first_name(alfonso_de_leon, 'Alfonso').
last_name(alfonso_de_leon, 'de Leon').
full_name(alfonso_de_leon, 'Alfonso de Leon').
gender(alfonso_de_leon, male).
alive(alfonso_de_leon).
generation(alfonso_de_leon, 0).
founder_family(alfonso_de_leon).
child(alfonso_de_leon, rodrigo_de_leon).
child(alfonso_de_leon, isabella_de_leon).
spouse(alfonso_de_leon, elena_de_leon).
location(alfonso_de_leon, qurtuba).

%% Elena de Leon — matriarch
person(elena_de_leon).
first_name(elena_de_leon, 'Elena').
last_name(elena_de_leon, 'de Leon').
full_name(elena_de_leon, 'Elena de Leon').
gender(elena_de_leon, female).
alive(elena_de_leon).
generation(elena_de_leon, 0).
founder_family(elena_de_leon).
child(elena_de_leon, rodrigo_de_leon).
child(elena_de_leon, isabella_de_leon).
spouse(elena_de_leon, alfonso_de_leon).
location(elena_de_leon, qurtuba).

%% Rodrigo de Leon — son, stonemason
person(rodrigo_de_leon).
first_name(rodrigo_de_leon, 'Rodrigo').
last_name(rodrigo_de_leon, 'de Leon').
full_name(rodrigo_de_leon, 'Rodrigo de Leon').
gender(rodrigo_de_leon, male).
alive(rodrigo_de_leon).
generation(rodrigo_de_leon, 1).
parent(alfonso_de_leon, rodrigo_de_leon).
parent(elena_de_leon, rodrigo_de_leon).
location(rodrigo_de_leon, qurtuba).

%% Isabella de Leon — daughter, embroiderer
person(isabella_de_leon).
first_name(isabella_de_leon, 'Isabella').
last_name(isabella_de_leon, 'de Leon').
full_name(isabella_de_leon, 'Isabella de Leon').
gender(isabella_de_leon, female).
alive(isabella_de_leon).
generation(isabella_de_leon, 1).
parent(alfonso_de_leon, isabella_de_leon).
parent(elena_de_leon, isabella_de_leon).
location(isabella_de_leon, qurtuba).
