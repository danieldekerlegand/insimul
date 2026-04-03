%% Insimul Characters: Mughal Bengal
%% Source: data/worlds/language/bengali/characters.pl
%% Created: 2026-04-03
%% Total: 24 characters (6 genealogy families)
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2
%%   ensemble_cast/1 — marks character as Ensemble cast member

%% ═══════════════════════════════════════════════════════════
%% Genealogy Characters (24 entries, 6 families)
%% ═══════════════════════════════════════════════════════════

%% ─── Chowdhury Family (Landowners) ───

%% Raghunath Chowdhury
person(raghunath_chowdhury).
first_name(raghunath_chowdhury, 'Raghunath').
last_name(raghunath_chowdhury, 'Chowdhury').
full_name(raghunath_chowdhury, 'Raghunath Chowdhury').
gender(raghunath_chowdhury, male).
alive(raghunath_chowdhury).
generation(raghunath_chowdhury, 0).
founder_family(raghunath_chowdhury).
child(raghunath_chowdhury, anirban_chowdhury).
child(raghunath_chowdhury, kamala_chowdhury).
spouse(raghunath_chowdhury, sarojini_chowdhury).
location(raghunath_chowdhury, sonargaon).

%% Sarojini Chowdhury
person(sarojini_chowdhury).
first_name(sarojini_chowdhury, 'Sarojini').
last_name(sarojini_chowdhury, 'Chowdhury').
full_name(sarojini_chowdhury, 'Sarojini Chowdhury').
gender(sarojini_chowdhury, female).
alive(sarojini_chowdhury).
generation(sarojini_chowdhury, 0).
founder_family(sarojini_chowdhury).
child(sarojini_chowdhury, anirban_chowdhury).
child(sarojini_chowdhury, kamala_chowdhury).
spouse(sarojini_chowdhury, raghunath_chowdhury).
location(sarojini_chowdhury, sonargaon).

%% Anirban Chowdhury
person(anirban_chowdhury).
first_name(anirban_chowdhury, 'Anirban').
last_name(anirban_chowdhury, 'Chowdhury').
full_name(anirban_chowdhury, 'Anirban Chowdhury').
gender(anirban_chowdhury, male).
alive(anirban_chowdhury).
generation(anirban_chowdhury, 1).
parent(raghunath_chowdhury, anirban_chowdhury).
parent(sarojini_chowdhury, anirban_chowdhury).
location(anirban_chowdhury, sonargaon).

%% Kamala Chowdhury
person(kamala_chowdhury).
first_name(kamala_chowdhury, 'Kamala').
last_name(kamala_chowdhury, 'Chowdhury').
full_name(kamala_chowdhury, 'Kamala Chowdhury').
gender(kamala_chowdhury, female).
alive(kamala_chowdhury).
generation(kamala_chowdhury, 1).
parent(raghunath_chowdhury, kamala_chowdhury).
parent(sarojini_chowdhury, kamala_chowdhury).
location(kamala_chowdhury, sonargaon).

%% ─── Das Family (Weavers) ───

%% Gobinda Das
person(gobinda_das).
first_name(gobinda_das, 'Gobinda').
last_name(gobinda_das, 'Das').
full_name(gobinda_das, 'Gobinda Das').
gender(gobinda_das, male).
alive(gobinda_das).
generation(gobinda_das, 0).
founder_family(gobinda_das).
child(gobinda_das, nikhil_das).
child(gobinda_das, shefali_das).
spouse(gobinda_das, malati_das).
location(gobinda_das, sonargaon).

%% Malati Das
person(malati_das).
first_name(malati_das, 'Malati').
last_name(malati_das, 'Das').
full_name(malati_das, 'Malati Das').
gender(malati_das, female).
alive(malati_das).
generation(malati_das, 0).
founder_family(malati_das).
child(malati_das, nikhil_das).
child(malati_das, shefali_das).
spouse(malati_das, gobinda_das).
location(malati_das, sonargaon).

%% Nikhil Das
person(nikhil_das).
first_name(nikhil_das, 'Nikhil').
last_name(nikhil_das, 'Das').
full_name(nikhil_das, 'Nikhil Das').
gender(nikhil_das, male).
alive(nikhil_das).
generation(nikhil_das, 1).
parent(gobinda_das, nikhil_das).
parent(malati_das, nikhil_das).
location(nikhil_das, sonargaon).

%% Shefali Das
person(shefali_das).
first_name(shefali_das, 'Shefali').
last_name(shefali_das, 'Das').
full_name(shefali_das, 'Shefali Das').
gender(shefali_das, female).
alive(shefali_das).
generation(shefali_das, 1).
parent(gobinda_das, shefali_das).
parent(malati_das, shefali_das).
location(shefali_das, sonargaon).

%% ─── Sarkar Family (Merchants) ───

%% Biswanath Sarkar
person(biswanath_sarkar).
first_name(biswanath_sarkar, 'Biswanath').
last_name(biswanath_sarkar, 'Sarkar').
full_name(biswanath_sarkar, 'Biswanath Sarkar').
gender(biswanath_sarkar, male).
alive(biswanath_sarkar).
generation(biswanath_sarkar, 0).
founder_family(biswanath_sarkar).
child(biswanath_sarkar, debashish_sarkar).
child(biswanath_sarkar, rani_sarkar).
spouse(biswanath_sarkar, parvati_sarkar).
location(biswanath_sarkar, sonargaon).

%% Parvati Sarkar
person(parvati_sarkar).
first_name(parvati_sarkar, 'Parvati').
last_name(parvati_sarkar, 'Sarkar').
full_name(parvati_sarkar, 'Parvati Sarkar').
gender(parvati_sarkar, female).
alive(parvati_sarkar).
generation(parvati_sarkar, 0).
founder_family(parvati_sarkar).
child(parvati_sarkar, debashish_sarkar).
child(parvati_sarkar, rani_sarkar).
spouse(parvati_sarkar, biswanath_sarkar).
location(parvati_sarkar, sonargaon).

%% Debashish Sarkar
person(debashish_sarkar).
first_name(debashish_sarkar, 'Debashish').
last_name(debashish_sarkar, 'Sarkar').
full_name(debashish_sarkar, 'Debashish Sarkar').
gender(debashish_sarkar, male).
alive(debashish_sarkar).
generation(debashish_sarkar, 1).
parent(biswanath_sarkar, debashish_sarkar).
parent(parvati_sarkar, debashish_sarkar).
location(debashish_sarkar, sonargaon).

%% Rani Sarkar
person(rani_sarkar).
first_name(rani_sarkar, 'Rani').
last_name(rani_sarkar, 'Sarkar').
full_name(rani_sarkar, 'Rani Sarkar').
gender(rani_sarkar, female).
alive(rani_sarkar).
generation(rani_sarkar, 1).
parent(biswanath_sarkar, rani_sarkar).
parent(parvati_sarkar, rani_sarkar).
location(rani_sarkar, sonargaon).

%% ─── Mondal Family (Fishermen) ───

%% Haripada Mondal
person(haripada_mondal).
first_name(haripada_mondal, 'Haripada').
last_name(haripada_mondal, 'Mondal').
full_name(haripada_mondal, 'Haripada Mondal').
gender(haripada_mondal, male).
alive(haripada_mondal).
generation(haripada_mondal, 0).
founder_family(haripada_mondal).
child(haripada_mondal, jatin_mondal).
child(haripada_mondal, basanti_mondal).
spouse(haripada_mondal, lakshmi_mondal).
location(haripada_mondal, chandpur).

%% Lakshmi Mondal
person(lakshmi_mondal).
first_name(lakshmi_mondal, 'Lakshmi').
last_name(lakshmi_mondal, 'Mondal').
full_name(lakshmi_mondal, 'Lakshmi Mondal').
gender(lakshmi_mondal, female).
alive(lakshmi_mondal).
generation(lakshmi_mondal, 0).
founder_family(lakshmi_mondal).
child(lakshmi_mondal, jatin_mondal).
child(lakshmi_mondal, basanti_mondal).
spouse(lakshmi_mondal, haripada_mondal).
location(lakshmi_mondal, chandpur).

%% Jatin Mondal
person(jatin_mondal).
first_name(jatin_mondal, 'Jatin').
last_name(jatin_mondal, 'Mondal').
full_name(jatin_mondal, 'Jatin Mondal').
gender(jatin_mondal, male).
alive(jatin_mondal).
generation(jatin_mondal, 1).
parent(haripada_mondal, jatin_mondal).
parent(lakshmi_mondal, jatin_mondal).
location(jatin_mondal, chandpur).

%% Basanti Mondal
person(basanti_mondal).
first_name(basanti_mondal, 'Basanti').
last_name(basanti_mondal, 'Mondal').
full_name(basanti_mondal, 'Basanti Mondal').
gender(basanti_mondal, female).
alive(basanti_mondal).
generation(basanti_mondal, 1).
parent(haripada_mondal, basanti_mondal).
parent(lakshmi_mondal, basanti_mondal).
location(basanti_mondal, chandpur).

%% ─── Sheikh Family (Poets/Scholars) ───

%% Farid Sheikh
person(farid_sheikh).
first_name(farid_sheikh, 'Farid').
last_name(farid_sheikh, 'Sheikh').
full_name(farid_sheikh, 'Farid Sheikh').
gender(farid_sheikh, male).
alive(farid_sheikh).
generation(farid_sheikh, 0).
founder_family(farid_sheikh).
child(farid_sheikh, kamal_sheikh).
child(farid_sheikh, nusrat_sheikh).
spouse(farid_sheikh, amina_sheikh).
location(farid_sheikh, sonargaon).

%% Amina Sheikh
person(amina_sheikh).
first_name(amina_sheikh, 'Amina').
last_name(amina_sheikh, 'Sheikh').
full_name(amina_sheikh, 'Amina Sheikh').
gender(amina_sheikh, female).
alive(amina_sheikh).
generation(amina_sheikh, 0).
founder_family(amina_sheikh).
child(amina_sheikh, kamal_sheikh).
child(amina_sheikh, nusrat_sheikh).
spouse(amina_sheikh, farid_sheikh).
location(amina_sheikh, sonargaon).

%% Kamal Sheikh
person(kamal_sheikh).
first_name(kamal_sheikh, 'Kamal').
last_name(kamal_sheikh, 'Sheikh').
full_name(kamal_sheikh, 'Kamal Sheikh').
gender(kamal_sheikh, male).
alive(kamal_sheikh).
generation(kamal_sheikh, 1).
parent(farid_sheikh, kamal_sheikh).
parent(amina_sheikh, kamal_sheikh).
location(kamal_sheikh, sonargaon).

%% Nusrat Sheikh
person(nusrat_sheikh).
first_name(nusrat_sheikh, 'Nusrat').
last_name(nusrat_sheikh, 'Sheikh').
full_name(nusrat_sheikh, 'Nusrat Sheikh').
gender(nusrat_sheikh, female).
alive(nusrat_sheikh).
generation(nusrat_sheikh, 1).
parent(farid_sheikh, nusrat_sheikh).
parent(amina_sheikh, nusrat_sheikh).
location(nusrat_sheikh, sonargaon).

%% ─── Pal Family (Potters/Artisans) ───

%% Madhusudan Pal
person(madhusudan_pal).
first_name(madhusudan_pal, 'Madhusudan').
last_name(madhusudan_pal, 'Pal').
full_name(madhusudan_pal, 'Madhusudan Pal').
gender(madhusudan_pal, male).
alive(madhusudan_pal).
generation(madhusudan_pal, 0).
founder_family(madhusudan_pal).
child(madhusudan_pal, tarun_pal).
child(madhusudan_pal, supriya_pal).
spouse(madhusudan_pal, chandana_pal).
location(madhusudan_pal, chandpur).

%% Chandana Pal
person(chandana_pal).
first_name(chandana_pal, 'Chandana').
last_name(chandana_pal, 'Pal').
full_name(chandana_pal, 'Chandana Pal').
gender(chandana_pal, female).
alive(chandana_pal).
generation(chandana_pal, 0).
founder_family(chandana_pal).
child(chandana_pal, tarun_pal).
child(chandana_pal, supriya_pal).
spouse(chandana_pal, madhusudan_pal).
location(chandana_pal, chandpur).

%% Tarun Pal
person(tarun_pal).
first_name(tarun_pal, 'Tarun').
last_name(tarun_pal, 'Pal').
full_name(tarun_pal, 'Tarun Pal').
gender(tarun_pal, male).
alive(tarun_pal).
generation(tarun_pal, 1).
parent(madhusudan_pal, tarun_pal).
parent(chandana_pal, tarun_pal).
location(tarun_pal, chandpur).

%% Supriya Pal
person(supriya_pal).
first_name(supriya_pal, 'Supriya').
last_name(supriya_pal, 'Pal').
full_name(supriya_pal, 'Supriya Pal').
gender(supriya_pal, female).
alive(supriya_pal).
generation(supriya_pal, 1).
parent(madhusudan_pal, supriya_pal).
parent(chandana_pal, supriya_pal).
location(supriya_pal, chandpur).
