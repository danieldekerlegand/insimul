%% Insimul Characters: Indonesian Coastal Town
%% Source: data/worlds/language/indonesian/characters.pl
%% Created: 2026-04-03
%% Total: 24 characters (6 families)
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2

%% ===============================================================
%% Suryadi Family (Warung Owners, Pantai Mutiara)
%% ===============================================================

%% Budi Suryadi
person(budi_suryadi).
first_name(budi_suryadi, 'Budi').
last_name(budi_suryadi, 'Suryadi').
full_name(budi_suryadi, 'Budi Suryadi').
gender(budi_suryadi, male).
alive(budi_suryadi).
generation(budi_suryadi, 0).
founder_family(budi_suryadi).
child(budi_suryadi, rina_suryadi).
child(budi_suryadi, eko_suryadi).
spouse(budi_suryadi, sari_suryadi).
location(budi_suryadi, pantai_mutiara).

%% Sari Suryadi
person(sari_suryadi).
first_name(sari_suryadi, 'Sari').
last_name(sari_suryadi, 'Suryadi').
full_name(sari_suryadi, 'Sari Suryadi').
gender(sari_suryadi, female).
alive(sari_suryadi).
generation(sari_suryadi, 0).
founder_family(sari_suryadi).
child(sari_suryadi, rina_suryadi).
child(sari_suryadi, eko_suryadi).
spouse(sari_suryadi, budi_suryadi).
location(sari_suryadi, pantai_mutiara).

%% Rina Suryadi
person(rina_suryadi).
first_name(rina_suryadi, 'Rina').
last_name(rina_suryadi, 'Suryadi').
full_name(rina_suryadi, 'Rina Suryadi').
gender(rina_suryadi, female).
alive(rina_suryadi).
generation(rina_suryadi, 1).
parent(budi_suryadi, rina_suryadi).
parent(sari_suryadi, rina_suryadi).
location(rina_suryadi, pantai_mutiara).

%% Eko Suryadi
person(eko_suryadi).
first_name(eko_suryadi, 'Eko').
last_name(eko_suryadi, 'Suryadi').
full_name(eko_suryadi, 'Eko Suryadi').
gender(eko_suryadi, male).
alive(eko_suryadi).
generation(eko_suryadi, 1).
parent(budi_suryadi, eko_suryadi).
parent(sari_suryadi, eko_suryadi).
location(eko_suryadi, pantai_mutiara).

%% ===============================================================
%% Wicaksono Family (Batik Artisans, Pantai Mutiara)
%% ===============================================================

%% Agus Wicaksono
person(agus_wicaksono).
first_name(agus_wicaksono, 'Agus').
last_name(agus_wicaksono, 'Wicaksono').
full_name(agus_wicaksono, 'Agus Wicaksono').
gender(agus_wicaksono, male).
alive(agus_wicaksono).
generation(agus_wicaksono, 0).
founder_family(agus_wicaksono).
child(agus_wicaksono, putri_wicaksono).
child(agus_wicaksono, dimas_wicaksono).
spouse(agus_wicaksono, dewi_wicaksono).
location(agus_wicaksono, pantai_mutiara).

%% Dewi Wicaksono
person(dewi_wicaksono).
first_name(dewi_wicaksono, 'Dewi').
last_name(dewi_wicaksono, 'Wicaksono').
full_name(dewi_wicaksono, 'Dewi Wicaksono').
gender(dewi_wicaksono, female).
alive(dewi_wicaksono).
generation(dewi_wicaksono, 0).
founder_family(dewi_wicaksono).
child(dewi_wicaksono, putri_wicaksono).
child(dewi_wicaksono, dimas_wicaksono).
spouse(dewi_wicaksono, agus_wicaksono).
location(dewi_wicaksono, pantai_mutiara).

%% Putri Wicaksono
person(putri_wicaksono).
first_name(putri_wicaksono, 'Putri').
last_name(putri_wicaksono, 'Wicaksono').
full_name(putri_wicaksono, 'Putri Wicaksono').
gender(putri_wicaksono, female).
alive(putri_wicaksono).
generation(putri_wicaksono, 1).
parent(agus_wicaksono, putri_wicaksono).
parent(dewi_wicaksono, putri_wicaksono).
location(putri_wicaksono, pantai_mutiara).

%% Dimas Wicaksono
person(dimas_wicaksono).
first_name(dimas_wicaksono, 'Dimas').
last_name(dimas_wicaksono, 'Wicaksono').
full_name(dimas_wicaksono, 'Dimas Wicaksono').
gender(dimas_wicaksono, male).
alive(dimas_wicaksono).
generation(dimas_wicaksono, 1).
parent(agus_wicaksono, dimas_wicaksono).
parent(dewi_wicaksono, dimas_wicaksono).
location(dimas_wicaksono, pantai_mutiara).

%% ===============================================================
%% Pratama Family (Market Traders, Pantai Mutiara)
%% ===============================================================

%% Hendra Pratama
person(hendra_pratama).
first_name(hendra_pratama, 'Hendra').
last_name(hendra_pratama, 'Pratama').
full_name(hendra_pratama, 'Hendra Pratama').
gender(hendra_pratama, male).
alive(hendra_pratama).
generation(hendra_pratama, 0).
founder_family(hendra_pratama).
child(hendra_pratama, wati_pratama).
child(hendra_pratama, rizki_pratama).
spouse(hendra_pratama, yuni_pratama).
location(hendra_pratama, pantai_mutiara).

%% Yuni Pratama
person(yuni_pratama).
first_name(yuni_pratama, 'Yuni').
last_name(yuni_pratama, 'Pratama').
full_name(yuni_pratama, 'Yuni Pratama').
gender(yuni_pratama, female).
alive(yuni_pratama).
generation(yuni_pratama, 0).
founder_family(yuni_pratama).
child(yuni_pratama, wati_pratama).
child(yuni_pratama, rizki_pratama).
spouse(yuni_pratama, hendra_pratama).
location(yuni_pratama, pantai_mutiara).

%% Wati Pratama
person(wati_pratama).
first_name(wati_pratama, 'Wati').
last_name(wati_pratama, 'Pratama').
full_name(wati_pratama, 'Wati Pratama').
gender(wati_pratama, female).
alive(wati_pratama).
generation(wati_pratama, 1).
parent(hendra_pratama, wati_pratama).
parent(yuni_pratama, wati_pratama).
location(wati_pratama, pantai_mutiara).

%% Rizki Pratama
person(rizki_pratama).
first_name(rizki_pratama, 'Rizki').
last_name(rizki_pratama, 'Pratama').
full_name(rizki_pratama, 'Rizki Pratama').
gender(rizki_pratama, male).
alive(rizki_pratama).
generation(rizki_pratama, 1).
parent(hendra_pratama, rizki_pratama).
parent(yuni_pratama, rizki_pratama).
location(rizki_pratama, pantai_mutiara).

%% ===============================================================
%% Kusuma Family (Teachers, Pantai Mutiara)
%% ===============================================================

%% Bambang Kusuma
person(bambang_kusuma).
first_name(bambang_kusuma, 'Bambang').
last_name(bambang_kusuma, 'Kusuma').
full_name(bambang_kusuma, 'Bambang Kusuma').
gender(bambang_kusuma, male).
alive(bambang_kusuma).
generation(bambang_kusuma, 0).
founder_family(bambang_kusuma).
child(bambang_kusuma, nita_kusuma).
child(bambang_kusuma, arif_kusuma).
spouse(bambang_kusuma, sri_kusuma).
location(bambang_kusuma, pantai_mutiara).

%% Sri Kusuma
person(sri_kusuma).
first_name(sri_kusuma, 'Sri').
last_name(sri_kusuma, 'Kusuma').
full_name(sri_kusuma, 'Sri Kusuma').
gender(sri_kusuma, female).
alive(sri_kusuma).
generation(sri_kusuma, 0).
founder_family(sri_kusuma).
child(sri_kusuma, nita_kusuma).
child(sri_kusuma, arif_kusuma).
spouse(sri_kusuma, bambang_kusuma).
location(sri_kusuma, pantai_mutiara).

%% Nita Kusuma
person(nita_kusuma).
first_name(nita_kusuma, 'Nita').
last_name(nita_kusuma, 'Kusuma').
full_name(nita_kusuma, 'Nita Kusuma').
gender(nita_kusuma, female).
alive(nita_kusuma).
generation(nita_kusuma, 1).
parent(bambang_kusuma, nita_kusuma).
parent(sri_kusuma, nita_kusuma).
location(nita_kusuma, pantai_mutiara).

%% Arif Kusuma
person(arif_kusuma).
first_name(arif_kusuma, 'Arif').
last_name(arif_kusuma, 'Kusuma').
full_name(arif_kusuma, 'Arif Kusuma').
gender(arif_kusuma, male).
alive(arif_kusuma).
generation(arif_kusuma, 1).
parent(bambang_kusuma, arif_kusuma).
parent(sri_kusuma, arif_kusuma).
location(arif_kusuma, pantai_mutiara).

%% ===============================================================
%% Santoso Family (Fishermen, Pantai Mutiara - Pelabuhan)
%% ===============================================================

%% Harto Santoso
person(harto_santoso).
first_name(harto_santoso, 'Harto').
last_name(harto_santoso, 'Santoso').
full_name(harto_santoso, 'Harto Santoso').
gender(harto_santoso, male).
alive(harto_santoso).
generation(harto_santoso, 0).
founder_family(harto_santoso).
child(harto_santoso, mega_santoso).
child(harto_santoso, fajar_santoso).
spouse(harto_santoso, ratna_santoso).
location(harto_santoso, pantai_mutiara).

%% Ratna Santoso
person(ratna_santoso).
first_name(ratna_santoso, 'Ratna').
last_name(ratna_santoso, 'Santoso').
full_name(ratna_santoso, 'Ratna Santoso').
gender(ratna_santoso, female).
alive(ratna_santoso).
generation(ratna_santoso, 0).
founder_family(ratna_santoso).
child(ratna_santoso, mega_santoso).
child(ratna_santoso, fajar_santoso).
spouse(ratna_santoso, harto_santoso).
location(ratna_santoso, pantai_mutiara).

%% Mega Santoso
person(mega_santoso).
first_name(mega_santoso, 'Mega').
last_name(mega_santoso, 'Santoso').
full_name(mega_santoso, 'Mega Santoso').
gender(mega_santoso, female).
alive(mega_santoso).
generation(mega_santoso, 1).
parent(harto_santoso, mega_santoso).
parent(ratna_santoso, mega_santoso).
location(mega_santoso, pantai_mutiara).

%% Fajar Santoso
person(fajar_santoso).
first_name(fajar_santoso, 'Fajar').
last_name(fajar_santoso, 'Santoso').
full_name(fajar_santoso, 'Fajar Santoso').
gender(fajar_santoso, male).
alive(fajar_santoso).
generation(fajar_santoso, 1).
parent(harto_santoso, fajar_santoso).
parent(ratna_santoso, fajar_santoso).
location(fajar_santoso, pantai_mutiara).

%% ===============================================================
%% Widodo Family (Rice Farmers, Desa Sawah)
%% ===============================================================

%% Suryo Widodo
person(suryo_widodo).
first_name(suryo_widodo, 'Suryo').
last_name(suryo_widodo, 'Widodo').
full_name(suryo_widodo, 'Suryo Widodo').
gender(suryo_widodo, male).
alive(suryo_widodo).
generation(suryo_widodo, 0).
founder_family(suryo_widodo).
child(suryo_widodo, lestari_widodo).
child(suryo_widodo, bayu_widodo).
spouse(suryo_widodo, tuti_widodo).
location(suryo_widodo, desa_sawah).

%% Tuti Widodo
person(tuti_widodo).
first_name(tuti_widodo, 'Tuti').
last_name(tuti_widodo, 'Widodo').
full_name(tuti_widodo, 'Tuti Widodo').
gender(tuti_widodo, female).
alive(tuti_widodo).
generation(tuti_widodo, 0).
founder_family(tuti_widodo).
child(tuti_widodo, lestari_widodo).
child(tuti_widodo, bayu_widodo).
spouse(tuti_widodo, suryo_widodo).
location(tuti_widodo, desa_sawah).

%% Lestari Widodo
person(lestari_widodo).
first_name(lestari_widodo, 'Lestari').
last_name(lestari_widodo, 'Widodo').
full_name(lestari_widodo, 'Lestari Widodo').
gender(lestari_widodo, female).
alive(lestari_widodo).
generation(lestari_widodo, 1).
parent(suryo_widodo, lestari_widodo).
parent(tuti_widodo, lestari_widodo).
location(lestari_widodo, desa_sawah).

%% Bayu Widodo
person(bayu_widodo).
first_name(bayu_widodo, 'Bayu').
last_name(bayu_widodo, 'Widodo').
full_name(bayu_widodo, 'Bayu Widodo').
gender(bayu_widodo, male).
alive(bayu_widodo).
generation(bayu_widodo, 1).
parent(suryo_widodo, bayu_widodo).
parent(tuti_widodo, bayu_widodo).
location(bayu_widodo, desa_sawah).
