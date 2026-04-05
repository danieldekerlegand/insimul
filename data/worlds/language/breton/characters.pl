%% Insimul Characters: Breton Coast
%% Source: data/worlds/language/breton/characters.pl
%% Created: 2026-04-03
%% Total: 24 characters (6 families)
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2

%% ======================================================
%% Le Goff Family (Creperie Owners, Porzh-Gwenn)
%% ======================================================

%% Yann Le Goff
person(yann_le_goff).
first_name(yann_le_goff, 'Yann').
last_name(yann_le_goff, 'Le Goff').
full_name(yann_le_goff, 'Yann Le Goff').
gender(yann_le_goff, male).
alive(yann_le_goff).
generation(yann_le_goff, 0).
founder_family(yann_le_goff).
child(yann_le_goff, erwan_le_goff).
child(yann_le_goff, nolwenn_le_goff).
spouse(yann_le_goff, soazig_le_goff).
location(yann_le_goff, porzh_gwenn).

%% Soazig Le Goff
person(soazig_le_goff).
first_name(soazig_le_goff, 'Soazig').
last_name(soazig_le_goff, 'Le Goff').
full_name(soazig_le_goff, 'Soazig Le Goff').
gender(soazig_le_goff, female).
alive(soazig_le_goff).
generation(soazig_le_goff, 0).
founder_family(soazig_le_goff).
child(soazig_le_goff, erwan_le_goff).
child(soazig_le_goff, nolwenn_le_goff).
spouse(soazig_le_goff, yann_le_goff).
location(soazig_le_goff, porzh_gwenn).

%% Erwan Le Goff
person(erwan_le_goff).
first_name(erwan_le_goff, 'Erwan').
last_name(erwan_le_goff, 'Le Goff').
full_name(erwan_le_goff, 'Erwan Le Goff').
gender(erwan_le_goff, male).
alive(erwan_le_goff).
generation(erwan_le_goff, 1).
parent(yann_le_goff, erwan_le_goff).
parent(soazig_le_goff, erwan_le_goff).
location(erwan_le_goff, porzh_gwenn).

%% Nolwenn Le Goff
person(nolwenn_le_goff).
first_name(nolwenn_le_goff, 'Nolwenn').
last_name(nolwenn_le_goff, 'Le Goff').
full_name(nolwenn_le_goff, 'Nolwenn Le Goff').
gender(nolwenn_le_goff, female).
alive(nolwenn_le_goff).
generation(nolwenn_le_goff, 1).
parent(yann_le_goff, nolwenn_le_goff).
parent(soazig_le_goff, nolwenn_le_goff).
location(nolwenn_le_goff, porzh_gwenn).

%% ======================================================
%% Kermarrec Family (Fishermen, Porzh-Gwenn)
%% ======================================================

%% Goulven Kermarrec
person(goulven_kermarrec).
first_name(goulven_kermarrec, 'Goulven').
last_name(goulven_kermarrec, 'Kermarrec').
full_name(goulven_kermarrec, 'Goulven Kermarrec').
gender(goulven_kermarrec, male).
alive(goulven_kermarrec).
generation(goulven_kermarrec, 0).
founder_family(goulven_kermarrec).
child(goulven_kermarrec, alan_kermarrec).
child(goulven_kermarrec, katell_kermarrec).
spouse(goulven_kermarrec, maiwenn_kermarrec).
location(goulven_kermarrec, porzh_gwenn).

%% Maiwenn Kermarrec
person(maiwenn_kermarrec).
first_name(maiwenn_kermarrec, 'Maiwenn').
last_name(maiwenn_kermarrec, 'Kermarrec').
full_name(maiwenn_kermarrec, 'Maiwenn Kermarrec').
gender(maiwenn_kermarrec, female).
alive(maiwenn_kermarrec).
generation(maiwenn_kermarrec, 0).
founder_family(maiwenn_kermarrec).
child(maiwenn_kermarrec, alan_kermarrec).
child(maiwenn_kermarrec, katell_kermarrec).
spouse(maiwenn_kermarrec, goulven_kermarrec).
location(maiwenn_kermarrec, porzh_gwenn).

%% Alan Kermarrec
person(alan_kermarrec).
first_name(alan_kermarrec, 'Alan').
last_name(alan_kermarrec, 'Kermarrec').
full_name(alan_kermarrec, 'Alan Kermarrec').
gender(alan_kermarrec, male).
alive(alan_kermarrec).
generation(alan_kermarrec, 1).
parent(goulven_kermarrec, alan_kermarrec).
parent(maiwenn_kermarrec, alan_kermarrec).
location(alan_kermarrec, porzh_gwenn).

%% Katell Kermarrec
person(katell_kermarrec).
first_name(katell_kermarrec, 'Katell').
last_name(katell_kermarrec, 'Kermarrec').
full_name(katell_kermarrec, 'Katell Kermarrec').
gender(katell_kermarrec, female).
alive(katell_kermarrec).
generation(katell_kermarrec, 1).
parent(goulven_kermarrec, katell_kermarrec).
parent(maiwenn_kermarrec, katell_kermarrec).
location(katell_kermarrec, porzh_gwenn).

%% ======================================================
%% Le Bihan Family (Diwan Teachers, Porzh-Gwenn)
%% ======================================================

%% Gwenael Le Bihan
person(gwenael_le_bihan).
first_name(gwenael_le_bihan, 'Gwenael').
last_name(gwenael_le_bihan, 'Le Bihan').
full_name(gwenael_le_bihan, 'Gwenael Le Bihan').
gender(gwenael_le_bihan, male).
alive(gwenael_le_bihan).
generation(gwenael_le_bihan, 0).
founder_family(gwenael_le_bihan).
child(gwenael_le_bihan, anna_le_bihan).
child(gwenael_le_bihan, per_le_bihan).
spouse(gwenael_le_bihan, rozenn_le_bihan).
location(gwenael_le_bihan, porzh_gwenn).

%% Rozenn Le Bihan
person(rozenn_le_bihan).
first_name(rozenn_le_bihan, 'Rozenn').
last_name(rozenn_le_bihan, 'Le Bihan').
full_name(rozenn_le_bihan, 'Rozenn Le Bihan').
gender(rozenn_le_bihan, female).
alive(rozenn_le_bihan).
generation(rozenn_le_bihan, 0).
founder_family(rozenn_le_bihan).
child(rozenn_le_bihan, anna_le_bihan).
child(rozenn_le_bihan, per_le_bihan).
spouse(rozenn_le_bihan, gwenael_le_bihan).
location(rozenn_le_bihan, porzh_gwenn).

%% Anna Le Bihan
person(anna_le_bihan).
first_name(anna_le_bihan, 'Anna').
last_name(anna_le_bihan, 'Le Bihan').
full_name(anna_le_bihan, 'Anna Le Bihan').
gender(anna_le_bihan, female).
alive(anna_le_bihan).
generation(anna_le_bihan, 1).
parent(gwenael_le_bihan, anna_le_bihan).
parent(rozenn_le_bihan, anna_le_bihan).
location(anna_le_bihan, porzh_gwenn).

%% Per Le Bihan
person(per_le_bihan).
first_name(per_le_bihan, 'Per').
last_name(per_le_bihan, 'Le Bihan').
full_name(per_le_bihan, 'Per Le Bihan').
gender(per_le_bihan, male).
alive(per_le_bihan).
generation(per_le_bihan, 1).
parent(gwenael_le_bihan, per_le_bihan).
parent(rozenn_le_bihan, per_le_bihan).
location(per_le_bihan, porzh_gwenn).

%% ======================================================
%% Morvan Family (Musicians, Porzh-Gwenn)
%% ======================================================

%% Tudual Morvan
person(tudual_morvan).
first_name(tudual_morvan, 'Tudual').
last_name(tudual_morvan, 'Morvan').
full_name(tudual_morvan, 'Tudual Morvan').
gender(tudual_morvan, male).
alive(tudual_morvan).
generation(tudual_morvan, 0).
founder_family(tudual_morvan).
child(tudual_morvan, sterenn_morvan).
child(tudual_morvan, denez_morvan).
spouse(tudual_morvan, enora_morvan).
location(tudual_morvan, porzh_gwenn).

%% Enora Morvan
person(enora_morvan).
first_name(enora_morvan, 'Enora').
last_name(enora_morvan, 'Morvan').
full_name(enora_morvan, 'Enora Morvan').
gender(enora_morvan, female).
alive(enora_morvan).
generation(enora_morvan, 0).
founder_family(enora_morvan).
child(enora_morvan, sterenn_morvan).
child(enora_morvan, denez_morvan).
spouse(enora_morvan, tudual_morvan).
location(enora_morvan, porzh_gwenn).

%% Sterenn Morvan
person(sterenn_morvan).
first_name(sterenn_morvan, 'Sterenn').
last_name(sterenn_morvan, 'Morvan').
full_name(sterenn_morvan, 'Sterenn Morvan').
gender(sterenn_morvan, female).
alive(sterenn_morvan).
generation(sterenn_morvan, 1).
parent(tudual_morvan, sterenn_morvan).
parent(enora_morvan, sterenn_morvan).
location(sterenn_morvan, porzh_gwenn).

%% Denez Morvan
person(denez_morvan).
first_name(denez_morvan, 'Denez').
last_name(denez_morvan, 'Morvan').
full_name(denez_morvan, 'Denez Morvan').
gender(denez_morvan, male).
alive(denez_morvan).
generation(denez_morvan, 1).
parent(tudual_morvan, denez_morvan).
parent(enora_morvan, denez_morvan).
location(denez_morvan, porzh_gwenn).

%% ======================================================
%% Riou Family (Farmers, Lann-Vraz)
%% ======================================================

%% Jakez Riou
person(jakez_riou).
first_name(jakez_riou, 'Jakez').
last_name(jakez_riou, 'Riou').
full_name(jakez_riou, 'Jakez Riou').
gender(jakez_riou, male).
alive(jakez_riou).
generation(jakez_riou, 0).
founder_family(jakez_riou).
child(jakez_riou, ewen_riou).
child(jakez_riou, gwenola_riou).
spouse(jakez_riou, annaig_riou).
location(jakez_riou, lann_vraz).

%% Annaig Riou
person(annaig_riou).
first_name(annaig_riou, 'Annaig').
last_name(annaig_riou, 'Riou').
full_name(annaig_riou, 'Annaig Riou').
gender(annaig_riou, female).
alive(annaig_riou).
generation(annaig_riou, 0).
founder_family(annaig_riou).
child(annaig_riou, ewen_riou).
child(annaig_riou, gwenola_riou).
spouse(annaig_riou, jakez_riou).
location(annaig_riou, lann_vraz).

%% Ewen Riou
person(ewen_riou).
first_name(ewen_riou, 'Ewen').
last_name(ewen_riou, 'Riou').
full_name(ewen_riou, 'Ewen Riou').
gender(ewen_riou, male).
alive(ewen_riou).
generation(ewen_riou, 1).
parent(jakez_riou, ewen_riou).
parent(annaig_riou, ewen_riou).
location(ewen_riou, lann_vraz).

%% Gwenola Riou
person(gwenola_riou).
first_name(gwenola_riou, 'Gwenola').
last_name(gwenola_riou, 'Riou').
full_name(gwenola_riou, 'Gwenola Riou').
gender(gwenola_riou, female).
alive(gwenola_riou).
generation(gwenola_riou, 1).
parent(jakez_riou, gwenola_riou).
parent(annaig_riou, gwenola_riou).
location(gwenola_riou, lann_vraz).

%% ======================================================
%% Quere Family (Cider Makers, Lann-Vraz)
%% ======================================================

%% Herve Quere
person(herve_quere).
first_name(herve_quere, 'Herve').
last_name(herve_quere, 'Quere').
full_name(herve_quere, 'Herve Quere').
gender(herve_quere, male).
alive(herve_quere).
generation(herve_quere, 0).
founder_family(herve_quere).
child(herve_quere, loig_quere).
child(herve_quere, mael_quere).
spouse(herve_quere, margod_quere).
location(herve_quere, lann_vraz).

%% Margod Quere
person(margod_quere).
first_name(margod_quere, 'Margod').
last_name(margod_quere, 'Quere').
full_name(margod_quere, 'Margod Quere').
gender(margod_quere, female).
alive(margod_quere).
generation(margod_quere, 0).
founder_family(margod_quere).
child(margod_quere, loig_quere).
child(margod_quere, mael_quere).
spouse(margod_quere, herve_quere).
location(margod_quere, lann_vraz).

%% Loig Quere
person(loig_quere).
first_name(loig_quere, 'Loig').
last_name(loig_quere, 'Quere').
full_name(loig_quere, 'Loig Quere').
gender(loig_quere, male).
alive(loig_quere).
generation(loig_quere, 1).
parent(herve_quere, loig_quere).
parent(margod_quere, loig_quere).
location(loig_quere, lann_vraz).

%% Mael Quere
person(mael_quere).
first_name(mael_quere, 'Mael').
last_name(mael_quere, 'Quere').
full_name(mael_quere, 'Mael Quere').
gender(mael_quere, male).
alive(mael_quere).
generation(mael_quere, 1).
parent(herve_quere, mael_quere).
parent(margod_quere, mael_quere).
location(mael_quere, lann_vraz).
