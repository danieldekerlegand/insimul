%% Ensemble History: Indonesian Coastal Town -- Initial World State
%% Source: data/worlds/language/indonesian/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status, language

%% --- Budi Suryadi ---
trait(budi_suryadi, male).
trait(budi_suryadi, hospitable).
trait(budi_suryadi, hardworking).
trait(budi_suryadi, traditional).
trait(budi_suryadi, middle_aged).
attribute(budi_suryadi, charisma, 75).
attribute(budi_suryadi, cultural_knowledge, 80).
attribute(budi_suryadi, propriety, 70).
language_proficiency(budi_suryadi, indonesian, 95).
language_proficiency(budi_suryadi, javanese, 90).
language_proficiency(budi_suryadi, english, 25).

%% --- Sari Suryadi ---
trait(sari_suryadi, female).
trait(sari_suryadi, nurturing).
trait(sari_suryadi, warm).
trait(sari_suryadi, community_minded).
attribute(sari_suryadi, charisma, 70).
attribute(sari_suryadi, cultural_knowledge, 85).
attribute(sari_suryadi, propriety, 75).
relationship(sari_suryadi, budi_suryadi, married).
language_proficiency(sari_suryadi, indonesian, 93).
language_proficiency(sari_suryadi, javanese, 92).
language_proficiency(sari_suryadi, english, 20).

%% --- Rina Suryadi ---
trait(rina_suryadi, female).
trait(rina_suryadi, young).
trait(rina_suryadi, ambitious).
trait(rina_suryadi, tech_savvy).
attribute(rina_suryadi, charisma, 65).
attribute(rina_suryadi, cunningness, 50).
attribute(rina_suryadi, self_assuredness, 70).
language_proficiency(rina_suryadi, indonesian, 92).
language_proficiency(rina_suryadi, javanese, 60).
language_proficiency(rina_suryadi, english, 65).

%% --- Eko Suryadi ---
trait(eko_suryadi, male).
trait(eko_suryadi, young).
trait(eko_suryadi, easygoing).
trait(eko_suryadi, social).
attribute(eko_suryadi, charisma, 70).
attribute(eko_suryadi, self_assuredness, 60).
attribute(eko_suryadi, sensitiveness, 55).
language_proficiency(eko_suryadi, indonesian, 90).
language_proficiency(eko_suryadi, javanese, 55).
language_proficiency(eko_suryadi, english, 50).

%% --- Agus Wicaksono ---
trait(agus_wicaksono, male).
trait(agus_wicaksono, artistic).
trait(agus_wicaksono, patient).
trait(agus_wicaksono, meticulous).
trait(agus_wicaksono, middle_aged).
attribute(agus_wicaksono, charisma, 65).
attribute(agus_wicaksono, cultural_knowledge, 90).
attribute(agus_wicaksono, propriety, 80).
language_proficiency(agus_wicaksono, indonesian, 95).
language_proficiency(agus_wicaksono, javanese, 95).
language_proficiency(agus_wicaksono, english, 30).

%% --- Dewi Wicaksono ---
trait(dewi_wicaksono, female).
trait(dewi_wicaksono, creative).
trait(dewi_wicaksono, elegant).
trait(dewi_wicaksono, business_minded).
attribute(dewi_wicaksono, charisma, 80).
attribute(dewi_wicaksono, cultural_knowledge, 85).
attribute(dewi_wicaksono, self_assuredness, 75).
relationship(dewi_wicaksono, agus_wicaksono, married).
language_proficiency(dewi_wicaksono, indonesian, 94).
language_proficiency(dewi_wicaksono, javanese, 88).
language_proficiency(dewi_wicaksono, english, 45).

%% --- Putri Wicaksono ---
trait(putri_wicaksono, female).
trait(putri_wicaksono, young).
trait(putri_wicaksono, creative).
trait(putri_wicaksono, independent).
attribute(putri_wicaksono, charisma, 70).
attribute(putri_wicaksono, self_assuredness, 65).
attribute(putri_wicaksono, sensitiveness, 60).
relationship(putri_wicaksono, wati_pratama, friends).
language_proficiency(putri_wicaksono, indonesian, 92).
language_proficiency(putri_wicaksono, javanese, 50).
language_proficiency(putri_wicaksono, english, 60).

%% --- Dimas Wicaksono ---
trait(dimas_wicaksono, male).
trait(dimas_wicaksono, young).
trait(dimas_wicaksono, musical).
trait(dimas_wicaksono, quiet).
attribute(dimas_wicaksono, charisma, 55).
attribute(dimas_wicaksono, cultural_knowledge, 70).
attribute(dimas_wicaksono, sensitiveness, 75).
relationship(dimas_wicaksono, arif_kusuma, friends).
language_proficiency(dimas_wicaksono, indonesian, 90).
language_proficiency(dimas_wicaksono, javanese, 65).
language_proficiency(dimas_wicaksono, english, 45).

%% --- Hendra Pratama ---
trait(hendra_pratama, male).
trait(hendra_pratama, shrewd).
trait(hendra_pratama, experienced).
trait(hendra_pratama, merchant).
trait(hendra_pratama, middle_aged).
attribute(hendra_pratama, charisma, 80).
attribute(hendra_pratama, cunningness, 75).
attribute(hendra_pratama, cultural_knowledge, 65).
relationship(hendra_pratama, budi_suryadi, friends).
language_proficiency(hendra_pratama, indonesian, 95).
language_proficiency(hendra_pratama, javanese, 80).
language_proficiency(hendra_pratama, english, 35).

%% --- Yuni Pratama ---
trait(yuni_pratama, female).
trait(yuni_pratama, organized).
trait(yuni_pratama, practical).
trait(yuni_pratama, generous).
attribute(yuni_pratama, charisma, 65).
attribute(yuni_pratama, propriety, 75).
attribute(yuni_pratama, cultural_knowledge, 70).
relationship(yuni_pratama, hendra_pratama, married).
relationship(yuni_pratama, sari_suryadi, friends).
language_proficiency(yuni_pratama, indonesian, 93).
language_proficiency(yuni_pratama, javanese, 85).
language_proficiency(yuni_pratama, english, 25).

%% --- Wati Pratama ---
trait(wati_pratama, female).
trait(wati_pratama, young).
trait(wati_pratama, studious).
trait(wati_pratama, kind).
attribute(wati_pratama, charisma, 60).
attribute(wati_pratama, propriety, 70).
attribute(wati_pratama, self_assuredness, 55).
relationship(wati_pratama, rina_suryadi, friends).
language_proficiency(wati_pratama, indonesian, 92).
language_proficiency(wati_pratama, javanese, 45).
language_proficiency(wati_pratama, english, 70).

%% --- Rizki Pratama ---
trait(rizki_pratama, male).
trait(rizki_pratama, young).
trait(rizki_pratama, entrepreneurial).
trait(rizki_pratama, energetic).
attribute(rizki_pratama, charisma, 70).
attribute(rizki_pratama, cunningness, 60).
attribute(rizki_pratama, self_assuredness, 65).
language_proficiency(rizki_pratama, indonesian, 90).
language_proficiency(rizki_pratama, javanese, 40).
language_proficiency(rizki_pratama, english, 55).

%% --- Bambang Kusuma ---
trait(bambang_kusuma, male).
trait(bambang_kusuma, educated).
trait(bambang_kusuma, formal).
trait(bambang_kusuma, intellectual).
trait(bambang_kusuma, middle_aged).
attribute(bambang_kusuma, charisma, 75).
attribute(bambang_kusuma, cultural_knowledge, 85).
attribute(bambang_kusuma, propriety, 85).
relationship(bambang_kusuma, agus_wicaksono, friends).
language_proficiency(bambang_kusuma, indonesian, 98).
language_proficiency(bambang_kusuma, javanese, 90).
language_proficiency(bambang_kusuma, english, 70).

%% --- Sri Kusuma ---
trait(sri_kusuma, female).
trait(sri_kusuma, articulate).
trait(sri_kusuma, passionate).
trait(sri_kusuma, modern).
attribute(sri_kusuma, charisma, 80).
attribute(sri_kusuma, cultural_knowledge, 75).
attribute(sri_kusuma, self_assuredness, 80).
relationship(sri_kusuma, bambang_kusuma, married).
language_proficiency(sri_kusuma, indonesian, 96).
language_proficiency(sri_kusuma, javanese, 85).
language_proficiency(sri_kusuma, english, 65).

%% --- Nita Kusuma ---
trait(nita_kusuma, female).
trait(nita_kusuma, young).
trait(nita_kusuma, diligent).
trait(nita_kusuma, idealistic).
attribute(nita_kusuma, charisma, 60).
attribute(nita_kusuma, cultural_knowledge, 65).
attribute(nita_kusuma, self_assuredness, 55).
relationship(nita_kusuma, mega_santoso, friends).
language_proficiency(nita_kusuma, indonesian, 93).
language_proficiency(nita_kusuma, javanese, 55).
language_proficiency(nita_kusuma, english, 75).

%% --- Arif Kusuma ---
trait(arif_kusuma, male).
trait(arif_kusuma, young).
trait(arif_kusuma, athletic).
trait(arif_kusuma, restless).
attribute(arif_kusuma, charisma, 65).
attribute(arif_kusuma, self_assuredness, 70).
attribute(arif_kusuma, cunningness, 45).
language_proficiency(arif_kusuma, indonesian, 88).
language_proficiency(arif_kusuma, javanese, 50).
language_proficiency(arif_kusuma, english, 55).

%% --- Harto Santoso ---
trait(harto_santoso, male).
trait(harto_santoso, rugged).
trait(harto_santoso, hardworking).
trait(harto_santoso, storyteller).
trait(harto_santoso, middle_aged).
attribute(harto_santoso, charisma, 65).
attribute(harto_santoso, cultural_knowledge, 75).
attribute(harto_santoso, propriety, 55).
language_proficiency(harto_santoso, indonesian, 90).
language_proficiency(harto_santoso, javanese, 95).
language_proficiency(harto_santoso, english, 10).

%% --- Ratna Santoso ---
trait(ratna_santoso, female).
trait(ratna_santoso, resilient).
trait(ratna_santoso, resourceful).
trait(ratna_santoso, community_minded).
attribute(ratna_santoso, charisma, 60).
attribute(ratna_santoso, propriety, 65).
attribute(ratna_santoso, cultural_knowledge, 70).
relationship(ratna_santoso, harto_santoso, married).
language_proficiency(ratna_santoso, indonesian, 88).
language_proficiency(ratna_santoso, javanese, 92).
language_proficiency(ratna_santoso, english, 10).

%% --- Mega Santoso ---
trait(mega_santoso, female).
trait(mega_santoso, young).
trait(mega_santoso, curious).
trait(mega_santoso, cheerful).
attribute(mega_santoso, charisma, 70).
attribute(mega_santoso, sensitiveness, 60).
attribute(mega_santoso, self_assuredness, 50).
language_proficiency(mega_santoso, indonesian, 90).
language_proficiency(mega_santoso, javanese, 60).
language_proficiency(mega_santoso, english, 45).

%% --- Fajar Santoso ---
trait(fajar_santoso, male).
trait(fajar_santoso, young).
trait(fajar_santoso, rebellious).
trait(fajar_santoso, ambitious).
attribute(fajar_santoso, charisma, 60).
attribute(fajar_santoso, self_assuredness, 55).
attribute(fajar_santoso, cunningness, 40).
relationship(fajar_santoso, eko_suryadi, friends).
language_proficiency(fajar_santoso, indonesian, 87).
language_proficiency(fajar_santoso, javanese, 70).
language_proficiency(fajar_santoso, english, 35).

%% --- Suryo Widodo ---
trait(suryo_widodo, male).
trait(suryo_widodo, patient).
trait(suryo_widodo, traditional).
trait(suryo_widodo, proud).
trait(suryo_widodo, elderly).
attribute(suryo_widodo, charisma, 60).
attribute(suryo_widodo, cultural_knowledge, 90).
attribute(suryo_widodo, propriety, 75).
relationship(suryo_widodo, harto_santoso, friends).
language_proficiency(suryo_widodo, indonesian, 88).
language_proficiency(suryo_widodo, javanese, 98).
language_proficiency(suryo_widodo, english, 5).

%% --- Tuti Widodo ---
trait(tuti_widodo, female).
trait(tuti_widodo, gentle).
trait(tuti_widodo, herbalist).
trait(tuti_widodo, observant).
attribute(tuti_widodo, charisma, 55).
attribute(tuti_widodo, cultural_knowledge, 88).
attribute(tuti_widodo, propriety, 70).
relationship(tuti_widodo, suryo_widodo, married).
language_proficiency(tuti_widodo, indonesian, 85).
language_proficiency(tuti_widodo, javanese, 97).
language_proficiency(tuti_widodo, english, 5).

%% --- Lestari Widodo ---
trait(lestari_widodo, female).
trait(lestari_widodo, young).
trait(lestari_widodo, determined).
trait(lestari_widodo, nature_loving).
attribute(lestari_widodo, charisma, 55).
attribute(lestari_widodo, self_assuredness, 60).
attribute(lestari_widodo, sensitiveness, 65).
language_proficiency(lestari_widodo, indonesian, 88).
language_proficiency(lestari_widodo, javanese, 75).
language_proficiency(lestari_widodo, english, 40).

%% --- Bayu Widodo ---
trait(bayu_widodo, male).
trait(bayu_widodo, young).
trait(bayu_widodo, dutiful).
trait(bayu_widodo, quiet).
attribute(bayu_widodo, charisma, 45).
attribute(bayu_widodo, propriety, 65).
attribute(bayu_widodo, cultural_knowledge, 60).
language_proficiency(bayu_widodo, indonesian, 87).
language_proficiency(bayu_widodo, javanese, 80).
language_proficiency(bayu_widodo, english, 25).
