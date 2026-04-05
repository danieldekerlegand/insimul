%% Insimul Characters: Arabic Coastal Town
%% Source: data/worlds/language/arabic/characters.pl
%% Created: 2026-04-03
%% Total: 24 characters (6 families)
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2

%% ═══════════════════════════════════════════════════════════
%% Hassan Family (Cafe Owners, Madinat al-Bahr)
%% ═══════════════════════════════════════════════════════════

%% Omar Hassan
person(omar_hassan).
first_name(omar_hassan, 'Omar').
last_name(omar_hassan, 'Hassan').
full_name(omar_hassan, 'Omar Hassan').
gender(omar_hassan, male).
alive(omar_hassan).
generation(omar_hassan, 0).
founder_family(omar_hassan).
child(omar_hassan, layla_hassan).
child(omar_hassan, yusuf_hassan).
spouse(omar_hassan, fatima_hassan).
location(omar_hassan, madinat_al_bahr).

%% Fatima Hassan
person(fatima_hassan).
first_name(fatima_hassan, 'Fatima').
last_name(fatima_hassan, 'Hassan').
full_name(fatima_hassan, 'Fatima Hassan').
gender(fatima_hassan, female).
alive(fatima_hassan).
generation(fatima_hassan, 0).
founder_family(fatima_hassan).
child(fatima_hassan, layla_hassan).
child(fatima_hassan, yusuf_hassan).
spouse(fatima_hassan, omar_hassan).
location(fatima_hassan, madinat_al_bahr).

%% Layla Hassan
person(layla_hassan).
first_name(layla_hassan, 'Layla').
last_name(layla_hassan, 'Hassan').
full_name(layla_hassan, 'Layla Hassan').
gender(layla_hassan, female).
alive(layla_hassan).
generation(layla_hassan, 1).
parent(omar_hassan, layla_hassan).
parent(fatima_hassan, layla_hassan).
location(layla_hassan, madinat_al_bahr).

%% Yusuf Hassan
person(yusuf_hassan).
first_name(yusuf_hassan, 'Yusuf').
last_name(yusuf_hassan, 'Hassan').
full_name(yusuf_hassan, 'Yusuf Hassan').
gender(yusuf_hassan, male).
alive(yusuf_hassan).
generation(yusuf_hassan, 1).
parent(omar_hassan, yusuf_hassan).
parent(fatima_hassan, yusuf_hassan).
location(yusuf_hassan, madinat_al_bahr).

%% ═══════════════════════════════════════════════════════════
%% Al-Rashid Family (University Professors, Madinat al-Bahr)
%% ═══════════════════════════════════════════════════════════

%% Khalid al-Rashid
person(khalid_al_rashid).
first_name(khalid_al_rashid, 'Khalid').
last_name(khalid_al_rashid, 'al-Rashid').
full_name(khalid_al_rashid, 'Khalid al-Rashid').
gender(khalid_al_rashid, male).
alive(khalid_al_rashid).
generation(khalid_al_rashid, 0).
founder_family(khalid_al_rashid).
child(khalid_al_rashid, nadia_al_rashid).
child(khalid_al_rashid, tariq_al_rashid).
spouse(khalid_al_rashid, amira_al_rashid).
location(khalid_al_rashid, madinat_al_bahr).

%% Amira al-Rashid
person(amira_al_rashid).
first_name(amira_al_rashid, 'Amira').
last_name(amira_al_rashid, 'al-Rashid').
full_name(amira_al_rashid, 'Amira al-Rashid').
gender(amira_al_rashid, female).
alive(amira_al_rashid).
generation(amira_al_rashid, 0).
founder_family(amira_al_rashid).
child(amira_al_rashid, nadia_al_rashid).
child(amira_al_rashid, tariq_al_rashid).
spouse(amira_al_rashid, khalid_al_rashid).
location(amira_al_rashid, madinat_al_bahr).

%% Nadia al-Rashid
person(nadia_al_rashid).
first_name(nadia_al_rashid, 'Nadia').
last_name(nadia_al_rashid, 'al-Rashid').
full_name(nadia_al_rashid, 'Nadia al-Rashid').
gender(nadia_al_rashid, female).
alive(nadia_al_rashid).
generation(nadia_al_rashid, 1).
parent(khalid_al_rashid, nadia_al_rashid).
parent(amira_al_rashid, nadia_al_rashid).
location(nadia_al_rashid, madinat_al_bahr).

%% Tariq al-Rashid
person(tariq_al_rashid).
first_name(tariq_al_rashid, 'Tariq').
last_name(tariq_al_rashid, 'al-Rashid').
full_name(tariq_al_rashid, 'Tariq al-Rashid').
gender(tariq_al_rashid, male).
alive(tariq_al_rashid).
generation(tariq_al_rashid, 1).
parent(khalid_al_rashid, tariq_al_rashid).
parent(amira_al_rashid, tariq_al_rashid).
location(tariq_al_rashid, madinat_al_bahr).

%% ═══════════════════════════════════════════════════════════
%% Mansour Family (Spice Merchants, Madinat al-Bahr)
%% ═══════════════════════════════════════════════════════════

%% Ibrahim Mansour
person(ibrahim_mansour).
first_name(ibrahim_mansour, 'Ibrahim').
last_name(ibrahim_mansour, 'Mansour').
full_name(ibrahim_mansour, 'Ibrahim Mansour').
gender(ibrahim_mansour, male).
alive(ibrahim_mansour).
generation(ibrahim_mansour, 0).
founder_family(ibrahim_mansour).
child(ibrahim_mansour, sara_mansour).
child(ibrahim_mansour, ahmed_mansour).
spouse(ibrahim_mansour, huda_mansour).
location(ibrahim_mansour, madinat_al_bahr).

%% Huda Mansour
person(huda_mansour).
first_name(huda_mansour, 'Huda').
last_name(huda_mansour, 'Mansour').
full_name(huda_mansour, 'Huda Mansour').
gender(huda_mansour, female).
alive(huda_mansour).
generation(huda_mansour, 0).
founder_family(huda_mansour).
child(huda_mansour, sara_mansour).
child(huda_mansour, ahmed_mansour).
spouse(huda_mansour, ibrahim_mansour).
location(huda_mansour, madinat_al_bahr).

%% Sara Mansour
person(sara_mansour).
first_name(sara_mansour, 'Sara').
last_name(sara_mansour, 'Mansour').
full_name(sara_mansour, 'Sara Mansour').
gender(sara_mansour, female).
alive(sara_mansour).
generation(sara_mansour, 1).
parent(ibrahim_mansour, sara_mansour).
parent(huda_mansour, sara_mansour).
location(sara_mansour, madinat_al_bahr).

%% Ahmed Mansour
person(ahmed_mansour).
first_name(ahmed_mansour, 'Ahmed').
last_name(ahmed_mansour, 'Mansour').
full_name(ahmed_mansour, 'Ahmed Mansour').
gender(ahmed_mansour, male).
alive(ahmed_mansour).
generation(ahmed_mansour, 1).
parent(ibrahim_mansour, ahmed_mansour).
parent(huda_mansour, ahmed_mansour).
location(ahmed_mansour, madinat_al_bahr).

%% ═══════════════════════════════════════════════════════════
%% Khoury Family (Doctors, Madinat al-Bahr)
%% ═══════════════════════════════════════════════════════════

%% Samir Khoury
person(samir_khoury).
first_name(samir_khoury, 'Samir').
last_name(samir_khoury, 'Khoury').
full_name(samir_khoury, 'Samir Khoury').
gender(samir_khoury, male).
alive(samir_khoury).
generation(samir_khoury, 0).
founder_family(samir_khoury).
child(samir_khoury, rami_khoury).
child(samir_khoury, dina_khoury).
spouse(samir_khoury, leila_khoury).
location(samir_khoury, madinat_al_bahr).

%% Leila Khoury
person(leila_khoury).
first_name(leila_khoury, 'Leila').
last_name(leila_khoury, 'Khoury').
full_name(leila_khoury, 'Leila Khoury').
gender(leila_khoury, female).
alive(leila_khoury).
generation(leila_khoury, 0).
founder_family(leila_khoury).
child(leila_khoury, rami_khoury).
child(leila_khoury, dina_khoury).
spouse(leila_khoury, samir_khoury).
location(leila_khoury, madinat_al_bahr).

%% Rami Khoury
person(rami_khoury).
first_name(rami_khoury, 'Rami').
last_name(rami_khoury, 'Khoury').
full_name(rami_khoury, 'Rami Khoury').
gender(rami_khoury, male).
alive(rami_khoury).
generation(rami_khoury, 1).
parent(samir_khoury, rami_khoury).
parent(leila_khoury, rami_khoury).
location(rami_khoury, madinat_al_bahr).

%% Dina Khoury
person(dina_khoury).
first_name(dina_khoury, 'Dina').
last_name(dina_khoury, 'Khoury').
full_name(dina_khoury, 'Dina Khoury').
gender(dina_khoury, female).
alive(dina_khoury).
generation(dina_khoury, 1).
parent(samir_khoury, dina_khoury).
parent(leila_khoury, dina_khoury).
location(dina_khoury, madinat_al_bahr).

%% ═══════════════════════════════════════════════════════════
%% Jabari Family (Fishermen, Al-Zahra)
%% ═══════════════════════════════════════════════════════════

%% Mahmoud Jabari
person(mahmoud_jabari).
first_name(mahmoud_jabari, 'Mahmoud').
last_name(mahmoud_jabari, 'Jabari').
full_name(mahmoud_jabari, 'Mahmoud Jabari').
gender(mahmoud_jabari, male).
alive(mahmoud_jabari).
generation(mahmoud_jabari, 0).
founder_family(mahmoud_jabari).
child(mahmoud_jabari, kareem_jabari).
child(mahmoud_jabari, mona_jabari).
spouse(mahmoud_jabari, samia_jabari).
location(mahmoud_jabari, al_zahra).

%% Samia Jabari
person(samia_jabari).
first_name(samia_jabari, 'Samia').
last_name(samia_jabari, 'Jabari').
full_name(samia_jabari, 'Samia Jabari').
gender(samia_jabari, female).
alive(samia_jabari).
generation(samia_jabari, 0).
founder_family(samia_jabari).
child(samia_jabari, kareem_jabari).
child(samia_jabari, mona_jabari).
spouse(samia_jabari, mahmoud_jabari).
location(samia_jabari, al_zahra).

%% Kareem Jabari
person(kareem_jabari).
first_name(kareem_jabari, 'Kareem').
last_name(kareem_jabari, 'Jabari').
full_name(kareem_jabari, 'Kareem Jabari').
gender(kareem_jabari, male).
alive(kareem_jabari).
generation(kareem_jabari, 1).
parent(mahmoud_jabari, kareem_jabari).
parent(samia_jabari, kareem_jabari).
location(kareem_jabari, al_zahra).

%% Mona Jabari
person(mona_jabari).
first_name(mona_jabari, 'Mona').
last_name(mona_jabari, 'Jabari').
full_name(mona_jabari, 'Mona Jabari').
gender(mona_jabari, female).
alive(mona_jabari).
generation(mona_jabari, 1).
parent(mahmoud_jabari, mona_jabari).
parent(samia_jabari, mona_jabari).
location(mona_jabari, al_zahra).

%% ═══════════════════════════════════════════════════════════
%% Nasser Family (Olive Farmers, Al-Zahra)
%% ═══════════════════════════════════════════════════════════

%% Adel Nasser
person(adel_nasser).
first_name(adel_nasser, 'Adel').
last_name(adel_nasser, 'Nasser').
full_name(adel_nasser, 'Adel Nasser').
gender(adel_nasser, male).
alive(adel_nasser).
generation(adel_nasser, 0).
founder_family(adel_nasser).
child(adel_nasser, rana_nasser).
child(adel_nasser, walid_nasser).
spouse(adel_nasser, noura_nasser).
location(adel_nasser, al_zahra).

%% Noura Nasser
person(noura_nasser).
first_name(noura_nasser, 'Noura').
last_name(noura_nasser, 'Nasser').
full_name(noura_nasser, 'Noura Nasser').
gender(noura_nasser, female).
alive(noura_nasser).
generation(noura_nasser, 0).
founder_family(noura_nasser).
child(noura_nasser, rana_nasser).
child(noura_nasser, walid_nasser).
spouse(noura_nasser, adel_nasser).
location(noura_nasser, al_zahra).

%% Rana Nasser
person(rana_nasser).
first_name(rana_nasser, 'Rana').
last_name(rana_nasser, 'Nasser').
full_name(rana_nasser, 'Rana Nasser').
gender(rana_nasser, female).
alive(rana_nasser).
generation(rana_nasser, 1).
parent(adel_nasser, rana_nasser).
parent(noura_nasser, rana_nasser).
location(rana_nasser, al_zahra).

%% Walid Nasser
person(walid_nasser).
first_name(walid_nasser, 'Walid').
last_name(walid_nasser, 'Nasser').
full_name(walid_nasser, 'Walid Nasser').
gender(walid_nasser, male).
alive(walid_nasser).
generation(walid_nasser, 1).
parent(adel_nasser, walid_nasser).
parent(noura_nasser, walid_nasser).
location(walid_nasser, al_zahra).
