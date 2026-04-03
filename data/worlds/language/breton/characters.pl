%% Insimul Characters: Medieval Brittany
%% Source: data/worlds/language/breton/characters.pl
%% Created: 2026-04-03
%% Total: 24 characters (6 families)
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2
%%   ensemble_cast/1 — marks character as Ensemble cast member

%% ═══════════════════════════════════════════════════════════
%% Genealogy Characters (24 entries, 6 families)
%% ═══════════════════════════════════════════════════════════

%% ─── Le Bihan Family (Fishing Captains) ───

%% Yann Le Bihan
person(yann_le_bihan).
first_name(yann_le_bihan, 'Yann').
last_name(yann_le_bihan, 'Le Bihan').
full_name(yann_le_bihan, 'Yann Le Bihan').
gender(yann_le_bihan, male).
alive(yann_le_bihan).
generation(yann_le_bihan, 0).
founder_family(yann_le_bihan).
child(yann_le_bihan, ewen_le_bihan).
child(yann_le_bihan, anna_le_bihan).
spouse(yann_le_bihan, soazig_le_bihan).
location(yann_le_bihan, porzh_gwenn).

%% Soazig Le Bihan
person(soazig_le_bihan).
first_name(soazig_le_bihan, 'Soazig').
last_name(soazig_le_bihan, 'Le Bihan').
full_name(soazig_le_bihan, 'Soazig Le Bihan').
gender(soazig_le_bihan, female).
alive(soazig_le_bihan).
generation(soazig_le_bihan, 0).
founder_family(soazig_le_bihan).
child(soazig_le_bihan, ewen_le_bihan).
child(soazig_le_bihan, anna_le_bihan).
spouse(soazig_le_bihan, yann_le_bihan).
location(soazig_le_bihan, porzh_gwenn).

%% Ewen Le Bihan
person(ewen_le_bihan).
first_name(ewen_le_bihan, 'Ewen').
last_name(ewen_le_bihan, 'Le Bihan').
full_name(ewen_le_bihan, 'Ewen Le Bihan').
gender(ewen_le_bihan, male).
alive(ewen_le_bihan).
generation(ewen_le_bihan, 1).
parent(yann_le_bihan, ewen_le_bihan).
parent(soazig_le_bihan, ewen_le_bihan).
location(ewen_le_bihan, porzh_gwenn).

%% Anna Le Bihan
person(anna_le_bihan).
first_name(anna_le_bihan, 'Anna').
last_name(anna_le_bihan, 'Le Bihan').
full_name(anna_le_bihan, 'Anna Le Bihan').
gender(anna_le_bihan, female).
alive(anna_le_bihan).
generation(anna_le_bihan, 1).
parent(yann_le_bihan, anna_le_bihan).
parent(soazig_le_bihan, anna_le_bihan).
location(anna_le_bihan, porzh_gwenn).

%% ─── Kernev Family (Weavers) ───

%% Goulven Kernev
person(goulven_kernev).
first_name(goulven_kernev, 'Goulven').
last_name(goulven_kernev, 'Kernev').
full_name(goulven_kernev, 'Goulven Kernev').
gender(goulven_kernev, male).
alive(goulven_kernev).
generation(goulven_kernev, 0).
founder_family(goulven_kernev).
child(goulven_kernev, maiwenn_kernev).
child(goulven_kernev, jakes_kernev).
spouse(goulven_kernev, nolwenn_kernev).
location(goulven_kernev, porzh_gwenn).

%% Nolwenn Kernev
person(nolwenn_kernev).
first_name(nolwenn_kernev, 'Nolwenn').
last_name(nolwenn_kernev, 'Kernev').
full_name(nolwenn_kernev, 'Nolwenn Kernev').
gender(nolwenn_kernev, female).
alive(nolwenn_kernev).
generation(nolwenn_kernev, 0).
founder_family(nolwenn_kernev).
child(nolwenn_kernev, maiwenn_kernev).
child(nolwenn_kernev, jakes_kernev).
spouse(nolwenn_kernev, goulven_kernev).
location(nolwenn_kernev, porzh_gwenn).

%% Maiwenn Kernev
person(maiwenn_kernev).
first_name(maiwenn_kernev, 'Maiwenn').
last_name(maiwenn_kernev, 'Kernev').
full_name(maiwenn_kernev, 'Maiwenn Kernev').
gender(maiwenn_kernev, female).
alive(maiwenn_kernev).
generation(maiwenn_kernev, 1).
parent(goulven_kernev, maiwenn_kernev).
parent(nolwenn_kernev, maiwenn_kernev).
location(maiwenn_kernev, porzh_gwenn).

%% Jakes Kernev
person(jakes_kernev).
first_name(jakes_kernev, 'Jakes').
last_name(jakes_kernev, 'Kernev').
full_name(jakes_kernev, 'Jakes Kernev').
gender(jakes_kernev, male).
alive(jakes_kernev).
generation(jakes_kernev, 1).
parent(goulven_kernev, jakes_kernev).
parent(nolwenn_kernev, jakes_kernev).
location(jakes_kernev, porzh_gwenn).

%% ─── Karadeg Family (Ducal Stewards) ───

%% Riwal Karadeg
person(riwal_karadeg).
first_name(riwal_karadeg, 'Riwal').
last_name(riwal_karadeg, 'Karadeg').
full_name(riwal_karadeg, 'Riwal Karadeg').
gender(riwal_karadeg, male).
alive(riwal_karadeg).
generation(riwal_karadeg, 0).
founder_family(riwal_karadeg).
child(riwal_karadeg, bleunvenn_karadeg).
child(riwal_karadeg, alan_karadeg).
spouse(riwal_karadeg, gwenael_karadeg).
location(riwal_karadeg, porzh_gwenn).

%% Gwenael Karadeg
person(gwenael_karadeg).
first_name(gwenael_karadeg, 'Gwenael').
last_name(gwenael_karadeg, 'Karadeg').
full_name(gwenael_karadeg, 'Gwenael Karadeg').
gender(gwenael_karadeg, female).
alive(gwenael_karadeg).
generation(gwenael_karadeg, 0).
founder_family(gwenael_karadeg).
child(gwenael_karadeg, bleunvenn_karadeg).
child(gwenael_karadeg, alan_karadeg).
spouse(gwenael_karadeg, riwal_karadeg).
location(gwenael_karadeg, porzh_gwenn).

%% Bleunvenn Karadeg
person(bleunvenn_karadeg).
first_name(bleunvenn_karadeg, 'Bleunvenn').
last_name(bleunvenn_karadeg, 'Karadeg').
full_name(bleunvenn_karadeg, 'Bleunvenn Karadeg').
gender(bleunvenn_karadeg, female).
alive(bleunvenn_karadeg).
generation(bleunvenn_karadeg, 1).
parent(riwal_karadeg, bleunvenn_karadeg).
parent(gwenael_karadeg, bleunvenn_karadeg).
location(bleunvenn_karadeg, porzh_gwenn).

%% Alan Karadeg
person(alan_karadeg).
first_name(alan_karadeg, 'Alan').
last_name(alan_karadeg, 'Karadeg').
full_name(alan_karadeg, 'Alan Karadeg').
gender(alan_karadeg, male).
alive(alan_karadeg).
generation(alan_karadeg, 1).
parent(riwal_karadeg, alan_karadeg).
parent(gwenael_karadeg, alan_karadeg).
location(alan_karadeg, porzh_gwenn).

%% ─── Morvan Family (Herbalists) ───

%% Konan Morvan
person(konan_morvan).
first_name(konan_morvan, 'Konan').
last_name(konan_morvan, 'Morvan').
full_name(konan_morvan, 'Konan Morvan').
gender(konan_morvan, male).
alive(konan_morvan).
generation(konan_morvan, 0).
founder_family(konan_morvan).
child(konan_morvan, katell_morvan).
child(konan_morvan, erwan_morvan).
spouse(konan_morvan, enora_morvan).
location(konan_morvan, porzh_gwenn).

%% Enora Morvan
person(enora_morvan).
first_name(enora_morvan, 'Enora').
last_name(enora_morvan, 'Morvan').
full_name(enora_morvan, 'Enora Morvan').
gender(enora_morvan, female).
alive(enora_morvan).
generation(enora_morvan, 0).
founder_family(enora_morvan).
child(enora_morvan, katell_morvan).
child(enora_morvan, erwan_morvan).
spouse(enora_morvan, konan_morvan).
location(enora_morvan, porzh_gwenn).

%% Katell Morvan
person(katell_morvan).
first_name(katell_morvan, 'Katell').
last_name(katell_morvan, 'Morvan').
full_name(katell_morvan, 'Katell Morvan').
gender(katell_morvan, female).
alive(katell_morvan).
generation(katell_morvan, 1).
parent(konan_morvan, katell_morvan).
parent(enora_morvan, katell_morvan).
location(katell_morvan, porzh_gwenn).

%% Erwan Morvan
person(erwan_morvan).
first_name(erwan_morvan, 'Erwan').
last_name(erwan_morvan, 'Morvan').
full_name(erwan_morvan, 'Erwan Morvan').
gender(erwan_morvan, male).
alive(erwan_morvan).
generation(erwan_morvan, 1).
parent(konan_morvan, erwan_morvan).
parent(enora_morvan, erwan_morvan).
location(erwan_morvan, porzh_gwenn).

%% ─── Kerloc'h Family (Farmers, Lann-Vraz) ───

%% Tugdual Kerloc_h
person(tugdual_kerloc_h).
first_name(tugdual_kerloc_h, 'Tugdual').
last_name(tugdual_kerloc_h, 'Kerloc''h').
full_name(tugdual_kerloc_h, 'Tugdual Kerloc''h').
gender(tugdual_kerloc_h, male).
alive(tugdual_kerloc_h).
generation(tugdual_kerloc_h, 0).
founder_family(tugdual_kerloc_h).
child(tugdual_kerloc_h, tangi_kerloc_h).
child(tugdual_kerloc_h, rozenn_kerloc_h).
spouse(tugdual_kerloc_h, adela_kerloc_h).
location(tugdual_kerloc_h, lann_vraz).

%% Adela Kerloc'h
person(adela_kerloc_h).
first_name(adela_kerloc_h, 'Adela').
last_name(adela_kerloc_h, 'Kerloc''h').
full_name(adela_kerloc_h, 'Adela Kerloc''h').
gender(adela_kerloc_h, female).
alive(adela_kerloc_h).
generation(adela_kerloc_h, 0).
founder_family(adela_kerloc_h).
child(adela_kerloc_h, tangi_kerloc_h).
child(adela_kerloc_h, rozenn_kerloc_h).
spouse(adela_kerloc_h, tugdual_kerloc_h).
location(adela_kerloc_h, lann_vraz).

%% Tangi Kerloc'h
person(tangi_kerloc_h).
first_name(tangi_kerloc_h, 'Tangi').
last_name(tangi_kerloc_h, 'Kerloc''h').
full_name(tangi_kerloc_h, 'Tangi Kerloc''h').
gender(tangi_kerloc_h, male).
alive(tangi_kerloc_h).
generation(tangi_kerloc_h, 1).
parent(tugdual_kerloc_h, tangi_kerloc_h).
parent(adela_kerloc_h, tangi_kerloc_h).
location(tangi_kerloc_h, lann_vraz).

%% Rozenn Kerloc'h
person(rozenn_kerloc_h).
first_name(rozenn_kerloc_h, 'Rozenn').
last_name(rozenn_kerloc_h, 'Kerloc''h').
full_name(rozenn_kerloc_h, 'Rozenn Kerloc''h').
gender(rozenn_kerloc_h, female).
alive(rozenn_kerloc_h).
generation(rozenn_kerloc_h, 1).
parent(tugdual_kerloc_h, rozenn_kerloc_h).
parent(adela_kerloc_h, rozenn_kerloc_h).
location(rozenn_kerloc_h, lann_vraz).

%% ─── Guivarch Family (Smiths, Lann-Vraz) ───

%% Jakez Guivarch
person(jakez_guivarch).
first_name(jakez_guivarch, 'Jakez').
last_name(jakez_guivarch, 'Guivarch').
full_name(jakez_guivarch, 'Jakez Guivarch').
gender(jakez_guivarch, male).
alive(jakez_guivarch).
generation(jakez_guivarch, 0).
founder_family(jakez_guivarch).
child(jakez_guivarch, loiza_guivarch).
child(jakez_guivarch, per_guivarch).
spouse(jakez_guivarch, mabilen_guivarch).
location(jakez_guivarch, lann_vraz).

%% Mabilen Guivarch
person(mabilen_guivarch).
first_name(mabilen_guivarch, 'Mabilen').
last_name(mabilen_guivarch, 'Guivarch').
full_name(mabilen_guivarch, 'Mabilen Guivarch').
gender(mabilen_guivarch, female).
alive(mabilen_guivarch).
generation(mabilen_guivarch, 0).
founder_family(mabilen_guivarch).
child(mabilen_guivarch, loiza_guivarch).
child(mabilen_guivarch, per_guivarch).
spouse(mabilen_guivarch, jakez_guivarch).
location(mabilen_guivarch, lann_vraz).

%% Loiza Guivarch
person(loiza_guivarch).
first_name(loiza_guivarch, 'Loiza').
last_name(loiza_guivarch, 'Guivarch').
full_name(loiza_guivarch, 'Loiza Guivarch').
gender(loiza_guivarch, female).
alive(loiza_guivarch).
generation(loiza_guivarch, 1).
parent(jakez_guivarch, loiza_guivarch).
parent(mabilen_guivarch, loiza_guivarch).
location(loiza_guivarch, lann_vraz).

%% Per Guivarch
person(per_guivarch).
first_name(per_guivarch, 'Per').
last_name(per_guivarch, 'Guivarch').
full_name(per_guivarch, 'Per Guivarch').
gender(per_guivarch, male).
alive(per_guivarch).
generation(per_guivarch, 1).
parent(jakez_guivarch, per_guivarch).
parent(mabilen_guivarch, per_guivarch).
location(per_guivarch, lann_vraz).
