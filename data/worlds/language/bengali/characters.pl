%% Insimul Characters: Bengali Riverside Town
%% Source: data/worlds/language/bengali/characters.pl
%% Created: 2026-04-03
%% Total: 24 characters (6 families)
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2

%% ======================================================
%% Rahman Family (Tea Stall Owners, Nodi Gram)
%% ======================================================

%% Karim Rahman
person(karim_rahman).
first_name(karim_rahman, 'Karim').
last_name(karim_rahman, 'Rahman').
full_name(karim_rahman, 'Karim Rahman').
gender(karim_rahman, male).
alive(karim_rahman).
generation(karim_rahman, 0).
founder_family(karim_rahman).
child(karim_rahman, nusrat_rahman).
child(karim_rahman, fahim_rahman).
spouse(karim_rahman, rashida_rahman).
location(karim_rahman, nodi_gram).

%% Rashida Rahman
person(rashida_rahman).
first_name(rashida_rahman, 'Rashida').
last_name(rashida_rahman, 'Rahman').
full_name(rashida_rahman, 'Rashida Rahman').
gender(rashida_rahman, female).
alive(rashida_rahman).
generation(rashida_rahman, 0).
founder_family(rashida_rahman).
child(rashida_rahman, nusrat_rahman).
child(rashida_rahman, fahim_rahman).
spouse(rashida_rahman, karim_rahman).
location(rashida_rahman, nodi_gram).

%% Nusrat Rahman
person(nusrat_rahman).
first_name(nusrat_rahman, 'Nusrat').
last_name(nusrat_rahman, 'Rahman').
full_name(nusrat_rahman, 'Nusrat Rahman').
gender(nusrat_rahman, female).
alive(nusrat_rahman).
generation(nusrat_rahman, 1).
parent(karim_rahman, nusrat_rahman).
parent(rashida_rahman, nusrat_rahman).
location(nusrat_rahman, nodi_gram).

%% Fahim Rahman
person(fahim_rahman).
first_name(fahim_rahman, 'Fahim').
last_name(fahim_rahman, 'Rahman').
full_name(fahim_rahman, 'Fahim Rahman').
gender(fahim_rahman, male).
alive(fahim_rahman).
generation(fahim_rahman, 1).
parent(karim_rahman, fahim_rahman).
parent(rashida_rahman, fahim_rahman).
location(fahim_rahman, nodi_gram).

%% ======================================================
%% Hossain Family (University Professors, Nodi Gram)
%% ======================================================

%% Anwar Hossain
person(anwar_hossain).
first_name(anwar_hossain, 'Anwar').
last_name(anwar_hossain, 'Hossain').
full_name(anwar_hossain, 'Anwar Hossain').
gender(anwar_hossain, male).
alive(anwar_hossain).
generation(anwar_hossain, 0).
founder_family(anwar_hossain).
child(anwar_hossain, tahmina_hossain).
child(anwar_hossain, sohel_hossain).
spouse(anwar_hossain, nasreen_hossain).
location(anwar_hossain, nodi_gram).

%% Nasreen Hossain
person(nasreen_hossain).
first_name(nasreen_hossain, 'Nasreen').
last_name(nasreen_hossain, 'Hossain').
full_name(nasreen_hossain, 'Nasreen Hossain').
gender(nasreen_hossain, female).
alive(nasreen_hossain).
generation(nasreen_hossain, 0).
founder_family(nasreen_hossain).
child(nasreen_hossain, tahmina_hossain).
child(nasreen_hossain, sohel_hossain).
spouse(nasreen_hossain, anwar_hossain).
location(nasreen_hossain, nodi_gram).

%% Tahmina Hossain
person(tahmina_hossain).
first_name(tahmina_hossain, 'Tahmina').
last_name(tahmina_hossain, 'Hossain').
full_name(tahmina_hossain, 'Tahmina Hossain').
gender(tahmina_hossain, female).
alive(tahmina_hossain).
generation(tahmina_hossain, 1).
parent(anwar_hossain, tahmina_hossain).
parent(nasreen_hossain, tahmina_hossain).
location(tahmina_hossain, nodi_gram).

%% Sohel Hossain
person(sohel_hossain).
first_name(sohel_hossain, 'Sohel').
last_name(sohel_hossain, 'Hossain').
full_name(sohel_hossain, 'Sohel Hossain').
gender(sohel_hossain, male).
alive(sohel_hossain).
generation(sohel_hossain, 1).
parent(anwar_hossain, sohel_hossain).
parent(nasreen_hossain, sohel_hossain).
location(sohel_hossain, nodi_gram).

%% ======================================================
%% Ahmed Family (Textile Merchants, Nodi Gram)
%% ======================================================

%% Jalal Ahmed
person(jalal_ahmed).
first_name(jalal_ahmed, 'Jalal').
last_name(jalal_ahmed, 'Ahmed').
full_name(jalal_ahmed, 'Jalal Ahmed').
gender(jalal_ahmed, male).
alive(jalal_ahmed).
generation(jalal_ahmed, 0).
founder_family(jalal_ahmed).
child(jalal_ahmed, farzana_ahmed).
child(jalal_ahmed, imran_ahmed).
spouse(jalal_ahmed, salma_ahmed).
location(jalal_ahmed, nodi_gram).

%% Salma Ahmed (nee Begum)
person(salma_ahmed).
first_name(salma_ahmed, 'Salma').
last_name(salma_ahmed, 'Ahmed').
full_name(salma_ahmed, 'Salma Ahmed').
gender(salma_ahmed, female).
alive(salma_ahmed).
generation(salma_ahmed, 0).
founder_family(salma_ahmed).
child(salma_ahmed, farzana_ahmed).
child(salma_ahmed, imran_ahmed).
spouse(salma_ahmed, jalal_ahmed).
location(salma_ahmed, nodi_gram).

%% Farzana Ahmed
person(farzana_ahmed).
first_name(farzana_ahmed, 'Farzana').
last_name(farzana_ahmed, 'Ahmed').
full_name(farzana_ahmed, 'Farzana Ahmed').
gender(farzana_ahmed, female).
alive(farzana_ahmed).
generation(farzana_ahmed, 1).
parent(jalal_ahmed, farzana_ahmed).
parent(salma_ahmed, farzana_ahmed).
location(farzana_ahmed, nodi_gram).

%% Imran Ahmed
person(imran_ahmed).
first_name(imran_ahmed, 'Imran').
last_name(imran_ahmed, 'Ahmed').
full_name(imran_ahmed, 'Imran Ahmed').
gender(imran_ahmed, male).
alive(imran_ahmed).
generation(imran_ahmed, 1).
parent(jalal_ahmed, imran_ahmed).
parent(salma_ahmed, imran_ahmed).
location(imran_ahmed, nodi_gram).

%% ======================================================
%% Begum Family (Doctors, Nodi Gram)
%% ======================================================

%% Tariqul Islam
person(tariqul_islam).
first_name(tariqul_islam, 'Tariqul').
last_name(tariqul_islam, 'Islam').
full_name(tariqul_islam, 'Tariqul Islam').
gender(tariqul_islam, male).
alive(tariqul_islam).
generation(tariqul_islam, 0).
founder_family(tariqul_islam).
child(tariqul_islam, rafiq_islam).
child(tariqul_islam, sharmin_islam).
spouse(tariqul_islam, hasina_begum).
location(tariqul_islam, nodi_gram).

%% Hasina Begum
person(hasina_begum).
first_name(hasina_begum, 'Hasina').
last_name(hasina_begum, 'Begum').
full_name(hasina_begum, 'Hasina Begum').
gender(hasina_begum, female).
alive(hasina_begum).
generation(hasina_begum, 0).
founder_family(hasina_begum).
child(hasina_begum, rafiq_islam).
child(hasina_begum, sharmin_islam).
spouse(hasina_begum, tariqul_islam).
location(hasina_begum, nodi_gram).

%% Rafiq Islam
person(rafiq_islam).
first_name(rafiq_islam, 'Rafiq').
last_name(rafiq_islam, 'Islam').
full_name(rafiq_islam, 'Rafiq Islam').
gender(rafiq_islam, male).
alive(rafiq_islam).
generation(rafiq_islam, 1).
parent(tariqul_islam, rafiq_islam).
parent(hasina_begum, rafiq_islam).
location(rafiq_islam, nodi_gram).

%% Sharmin Islam
person(sharmin_islam).
first_name(sharmin_islam, 'Sharmin').
last_name(sharmin_islam, 'Islam').
full_name(sharmin_islam, 'Sharmin Islam').
gender(sharmin_islam, female).
alive(sharmin_islam).
generation(sharmin_islam, 1).
parent(tariqul_islam, sharmin_islam).
parent(hasina_begum, sharmin_islam).
location(sharmin_islam, nodi_gram).

%% ======================================================
%% Khatun Family (Fishermen, Shonar Gaon)
%% ======================================================

%% Habibur Molla
person(habibur_molla).
first_name(habibur_molla, 'Habibur').
last_name(habibur_molla, 'Molla').
full_name(habibur_molla, 'Habibur Molla').
gender(habibur_molla, male).
alive(habibur_molla).
generation(habibur_molla, 0).
founder_family(habibur_molla).
child(habibur_molla, rubel_molla).
child(habibur_molla, beauty_khatun).
spouse(habibur_molla, jahanara_khatun).
location(habibur_molla, shonar_gaon).

%% Jahanara Khatun
person(jahanara_khatun).
first_name(jahanara_khatun, 'Jahanara').
last_name(jahanara_khatun, 'Khatun').
full_name(jahanara_khatun, 'Jahanara Khatun').
gender(jahanara_khatun, female).
alive(jahanara_khatun).
generation(jahanara_khatun, 0).
founder_family(jahanara_khatun).
child(jahanara_khatun, rubel_molla).
child(jahanara_khatun, beauty_khatun).
spouse(jahanara_khatun, habibur_molla).
location(jahanara_khatun, shonar_gaon).

%% Rubel Molla
person(rubel_molla).
first_name(rubel_molla, 'Rubel').
last_name(rubel_molla, 'Molla').
full_name(rubel_molla, 'Rubel Molla').
gender(rubel_molla, male).
alive(rubel_molla).
generation(rubel_molla, 1).
parent(habibur_molla, rubel_molla).
parent(jahanara_khatun, rubel_molla).
location(rubel_molla, shonar_gaon).

%% Beauty Khatun
person(beauty_khatun).
first_name(beauty_khatun, 'Beauty').
last_name(beauty_khatun, 'Khatun').
full_name(beauty_khatun, 'Beauty Khatun').
gender(beauty_khatun, female).
alive(beauty_khatun).
generation(beauty_khatun, 1).
parent(habibur_molla, beauty_khatun).
parent(jahanara_khatun, beauty_khatun).
location(beauty_khatun, shonar_gaon).

%% ======================================================
%% Sarker Family (Rice Farmers, Shonar Gaon)
%% ======================================================

%% Monir Sarker
person(monir_sarker).
first_name(monir_sarker, 'Monir').
last_name(monir_sarker, 'Sarker').
full_name(monir_sarker, 'Monir Sarker').
gender(monir_sarker, male).
alive(monir_sarker).
generation(monir_sarker, 0).
founder_family(monir_sarker).
child(monir_sarker, lipi_sarker).
child(monir_sarker, sumon_sarker).
spouse(monir_sarker, aleya_sarker).
location(monir_sarker, shonar_gaon).

%% Aleya Sarker
person(aleya_sarker).
first_name(aleya_sarker, 'Aleya').
last_name(aleya_sarker, 'Sarker').
full_name(aleya_sarker, 'Aleya Sarker').
gender(aleya_sarker, female).
alive(aleya_sarker).
generation(aleya_sarker, 0).
founder_family(aleya_sarker).
child(aleya_sarker, lipi_sarker).
child(aleya_sarker, sumon_sarker).
spouse(aleya_sarker, monir_sarker).
location(aleya_sarker, shonar_gaon).

%% Lipi Sarker
person(lipi_sarker).
first_name(lipi_sarker, 'Lipi').
last_name(lipi_sarker, 'Sarker').
full_name(lipi_sarker, 'Lipi Sarker').
gender(lipi_sarker, female).
alive(lipi_sarker).
generation(lipi_sarker, 1).
parent(monir_sarker, lipi_sarker).
parent(aleya_sarker, lipi_sarker).
location(lipi_sarker, shonar_gaon).

%% Sumon Sarker
person(sumon_sarker).
first_name(sumon_sarker, 'Sumon').
last_name(sumon_sarker, 'Sarker').
full_name(sumon_sarker, 'Sumon Sarker').
gender(sumon_sarker, male).
alive(sumon_sarker).
generation(sumon_sarker, 1).
parent(monir_sarker, sumon_sarker).
parent(aleya_sarker, sumon_sarker).
location(sumon_sarker, shonar_gaon).
