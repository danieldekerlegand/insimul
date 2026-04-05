%% Insimul Characters: Post-Apocalyptic Wasteland
%% Source: data/worlds/post_apocalyptic/characters.pl
%% Created: 2026-04-03
%% Total: 18 characters
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2

%% ═══════════════════════════════════════════════════════════
%% Mercer Family (Haven Ridge Founders)
%% ═══════════════════════════════════════════════════════════

%% Elias Mercer -- Commander of Haven Ridge
person(elias_mercer).
first_name(elias_mercer, 'Elias').
last_name(elias_mercer, 'Mercer').
full_name(elias_mercer, 'Elias Mercer').
gender(elias_mercer, male).
alive(elias_mercer).
generation(elias_mercer, 0).
founder_family(elias_mercer).
child(elias_mercer, cass_mercer).
spouse(elias_mercer, jo_mercer).
location(elias_mercer, haven_ridge).

%% Jo Mercer -- Water Engineer
person(jo_mercer).
first_name(jo_mercer, 'Jo').
last_name(jo_mercer, 'Mercer').
full_name(jo_mercer, 'Jo Mercer').
gender(jo_mercer, female).
alive(jo_mercer).
generation(jo_mercer, 0).
founder_family(jo_mercer).
child(jo_mercer, cass_mercer).
spouse(jo_mercer, elias_mercer).
location(jo_mercer, haven_ridge).

%% Cass Mercer -- Scout and Runner
person(cass_mercer).
first_name(cass_mercer, 'Cass').
last_name(cass_mercer, 'Mercer').
full_name(cass_mercer, 'Cass Mercer').
gender(cass_mercer, female).
alive(cass_mercer).
generation(cass_mercer, 1).
parent(elias_mercer, cass_mercer).
parent(jo_mercer, cass_mercer).
location(cass_mercer, haven_ridge).

%% ═══════════════════════════════════════════════════════════
%% Duval Family (Traders, Haven Ridge)
%% ═══════════════════════════════════════════════════════════

%% Remy Duval -- Scrap Merchant
person(remy_duval).
first_name(remy_duval, 'Remy').
last_name(remy_duval, 'Duval').
full_name(remy_duval, 'Remy Duval').
gender(remy_duval, male).
alive(remy_duval).
generation(remy_duval, 0).
founder_family(remy_duval).
child(remy_duval, nix_duval).
spouse(remy_duval, mara_duval).
location(remy_duval, haven_ridge).

%% Mara Duval -- Chemist
person(mara_duval).
first_name(mara_duval, 'Mara').
last_name(mara_duval, 'Duval').
full_name(mara_duval, 'Mara Duval').
gender(mara_duval, female).
alive(mara_duval).
generation(mara_duval, 0).
founder_family(mara_duval).
child(mara_duval, nix_duval).
spouse(mara_duval, remy_duval).
location(mara_duval, haven_ridge).

%% Nix Duval -- Apprentice Scrapper
person(nix_duval).
first_name(nix_duval, 'Nix').
last_name(nix_duval, 'Duval').
full_name(nix_duval, 'Nix Duval').
gender(nix_duval, male).
alive(nix_duval).
generation(nix_duval, 1).
parent(remy_duval, nix_duval).
parent(mara_duval, nix_duval).
location(nix_duval, haven_ridge).

%% ═══════════════════════════════════════════════════════════
%% Loners and Specialists (Haven Ridge)
%% ═══════════════════════════════════════════════════════════

%% Doc Harlan -- Field Medic
person(doc_harlan).
first_name(doc_harlan, 'Harlan').
last_name(doc_harlan, 'Cross').
full_name(doc_harlan, 'Harlan Cross').
gender(doc_harlan, male).
alive(doc_harlan).
generation(doc_harlan, 0).
location(doc_harlan, haven_ridge).

%% Wren Holloway -- Militia Captain
person(wren_holloway).
first_name(wren_holloway, 'Wren').
last_name(wren_holloway, 'Holloway').
full_name(wren_holloway, 'Wren Holloway').
gender(wren_holloway, female).
alive(wren_holloway).
generation(wren_holloway, 0).
location(wren_holloway, haven_ridge).

%% Silas Kane -- Radio Operator
person(silas_kane).
first_name(silas_kane, 'Silas').
last_name(silas_kane, 'Kane').
full_name(silas_kane, 'Silas Kane').
gender(silas_kane, male).
alive(silas_kane).
generation(silas_kane, 0).
location(silas_kane, haven_ridge).

%% ═══════════════════════════════════════════════════════════
%% Rusthollow Characters
%% ═══════════════════════════════════════════════════════════

%% Ash Corbin -- Scavenger Boss
person(ash_corbin).
first_name(ash_corbin, 'Ash').
last_name(ash_corbin, 'Corbin').
full_name(ash_corbin, 'Ash Corbin').
gender(ash_corbin, male).
alive(ash_corbin).
generation(ash_corbin, 0).
location(ash_corbin, rusthollow).

%% Petra Volkov -- Healer and Herbalist
person(petra_volkov).
first_name(petra_volkov, 'Petra').
last_name(petra_volkov, 'Volkov').
full_name(petra_volkov, 'Petra Volkov').
gender(petra_volkov, female).
alive(petra_volkov).
generation(petra_volkov, 0).
location(petra_volkov, rusthollow).

%% Grim -- Mutant Exile
person(grim).
first_name(grim, 'Grim').
last_name(grim, '').
full_name(grim, 'Grim').
gender(grim, male).
alive(grim).
generation(grim, 0).
location(grim, rusthollow).

%% Lina Okafor -- Greenhouse Tender
person(lina_okafor).
first_name(lina_okafor, 'Lina').
last_name(lina_okafor, 'Okafor').
full_name(lina_okafor, 'Lina Okafor').
gender(lina_okafor, female).
alive(lina_okafor).
generation(lina_okafor, 0).
location(lina_okafor, rusthollow).

%% ═══════════════════════════════════════════════════════════
%% Iron Fang Stronghold Characters
%% ═══════════════════════════════════════════════════════════

%% Vex Thornton -- Warlord of the Iron Fang
person(vex_thornton).
first_name(vex_thornton, 'Vex').
last_name(vex_thornton, 'Thornton').
full_name(vex_thornton, 'Vex Thornton').
gender(vex_thornton, male).
alive(vex_thornton).
generation(vex_thornton, 0).
location(vex_thornton, iron_fang_stronghold).

%% Sable Reyes -- Raider Lieutenant
person(sable_reyes).
first_name(sable_reyes, 'Sable').
last_name(sable_reyes, 'Reyes').
full_name(sable_reyes, 'Sable Reyes').
gender(sable_reyes, female).
alive(sable_reyes).
generation(sable_reyes, 0).
location(sable_reyes, iron_fang_stronghold).

%% Cutter Briggs -- Pit Fighter Champion
person(cutter_briggs).
first_name(cutter_briggs, 'Cutter').
last_name(cutter_briggs, 'Briggs').
full_name(cutter_briggs, 'Cutter Briggs').
gender(cutter_briggs, male).
alive(cutter_briggs).
generation(cutter_briggs, 0).
location(cutter_briggs, iron_fang_stronghold).

%% Moth -- Black Market Fence
person(moth).
first_name(moth, 'Moth').
last_name(moth, '').
full_name(moth, 'Moth').
gender(moth, female).
alive(moth).
generation(moth, 0).
location(moth, iron_fang_stronghold).
