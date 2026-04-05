%% Ensemble History: Breton Coast -- Initial World State
%% Source: data/worlds/language/breton/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status, language

%% --- Yann Le Goff ---
trait(yann_le_goff, male).
trait(yann_le_goff, hospitable).
trait(yann_le_goff, jovial).
trait(yann_le_goff, traditional).
trait(yann_le_goff, middle_aged).
attribute(yann_le_goff, charisma, 75).
attribute(yann_le_goff, cultural_knowledge, 80).
attribute(yann_le_goff, propriety, 65).
language_proficiency(yann_le_goff, breton, 95).
language_proficiency(yann_le_goff, french, 85).

%% --- Soazig Le Goff ---
trait(soazig_le_goff, female).
trait(soazig_le_goff, warm).
trait(soazig_le_goff, organized).
trait(soazig_le_goff, community_minded).
attribute(soazig_le_goff, charisma, 70).
attribute(soazig_le_goff, cultural_knowledge, 85).
attribute(soazig_le_goff, propriety, 75).
relationship(soazig_le_goff, yann_le_goff, married).
language_proficiency(soazig_le_goff, breton, 95).
language_proficiency(soazig_le_goff, french, 80).

%% --- Erwan Le Goff ---
trait(erwan_le_goff, male).
trait(erwan_le_goff, young).
trait(erwan_le_goff, ambitious).
trait(erwan_le_goff, tech_savvy).
attribute(erwan_le_goff, charisma, 65).
attribute(erwan_le_goff, cunningness, 50).
attribute(erwan_le_goff, self_assuredness, 70).
language_proficiency(erwan_le_goff, breton, 88).
language_proficiency(erwan_le_goff, french, 90).

%% --- Nolwenn Le Goff ---
trait(nolwenn_le_goff, female).
trait(nolwenn_le_goff, young).
trait(nolwenn_le_goff, creative).
trait(nolwenn_le_goff, outgoing).
attribute(nolwenn_le_goff, charisma, 75).
attribute(nolwenn_le_goff, cultural_knowledge, 60).
attribute(nolwenn_le_goff, sensitiveness, 70).
language_proficiency(nolwenn_le_goff, breton, 85).
language_proficiency(nolwenn_le_goff, french, 92).

%% --- Goulven Kermarrec ---
trait(goulven_kermarrec, male).
trait(goulven_kermarrec, rugged).
trait(goulven_kermarrec, hardworking).
trait(goulven_kermarrec, storyteller).
trait(goulven_kermarrec, middle_aged).
attribute(goulven_kermarrec, charisma, 65).
attribute(goulven_kermarrec, cultural_knowledge, 80).
attribute(goulven_kermarrec, propriety, 55).
relationship(goulven_kermarrec, yann_le_goff, friends).
language_proficiency(goulven_kermarrec, breton, 98).
language_proficiency(goulven_kermarrec, french, 60).

%% --- Maiwenn Kermarrec ---
trait(maiwenn_kermarrec, female).
trait(maiwenn_kermarrec, resilient).
trait(maiwenn_kermarrec, practical).
trait(maiwenn_kermarrec, nurturing).
attribute(maiwenn_kermarrec, charisma, 60).
attribute(maiwenn_kermarrec, propriety, 70).
attribute(maiwenn_kermarrec, cultural_knowledge, 75).
relationship(maiwenn_kermarrec, goulven_kermarrec, married).
relationship(maiwenn_kermarrec, soazig_le_goff, friends).
language_proficiency(maiwenn_kermarrec, breton, 95).
language_proficiency(maiwenn_kermarrec, french, 55).

%% --- Alan Kermarrec ---
trait(alan_kermarrec, male).
trait(alan_kermarrec, young).
trait(alan_kermarrec, restless).
trait(alan_kermarrec, athletic).
attribute(alan_kermarrec, charisma, 60).
attribute(alan_kermarrec, self_assuredness, 55).
attribute(alan_kermarrec, cunningness, 40).
relationship(alan_kermarrec, erwan_le_goff, friends).
language_proficiency(alan_kermarrec, breton, 90).
language_proficiency(alan_kermarrec, french, 75).

%% --- Katell Kermarrec ---
trait(katell_kermarrec, female).
trait(katell_kermarrec, young).
trait(katell_kermarrec, curious).
trait(katell_kermarrec, cheerful).
attribute(katell_kermarrec, charisma, 70).
attribute(katell_kermarrec, sensitiveness, 65).
attribute(katell_kermarrec, self_assuredness, 50).
language_proficiency(katell_kermarrec, breton, 88).
language_proficiency(katell_kermarrec, french, 80).

%% --- Gwenael Le Bihan ---
trait(gwenael_le_bihan, male).
trait(gwenael_le_bihan, educated).
trait(gwenael_le_bihan, passionate).
trait(gwenael_le_bihan, intellectual).
trait(gwenael_le_bihan, middle_aged).
attribute(gwenael_le_bihan, charisma, 80).
attribute(gwenael_le_bihan, cultural_knowledge, 95).
attribute(gwenael_le_bihan, propriety, 80).
language_proficiency(gwenael_le_bihan, breton, 98).
language_proficiency(gwenael_le_bihan, french, 90).

%% --- Rozenn Le Bihan ---
trait(rozenn_le_bihan, female).
trait(rozenn_le_bihan, articulate).
trait(rozenn_le_bihan, patient).
trait(rozenn_le_bihan, dedicated).
attribute(rozenn_le_bihan, charisma, 75).
attribute(rozenn_le_bihan, cultural_knowledge, 90).
attribute(rozenn_le_bihan, self_assuredness, 75).
relationship(rozenn_le_bihan, gwenael_le_bihan, married).
language_proficiency(rozenn_le_bihan, breton, 97).
language_proficiency(rozenn_le_bihan, french, 88).

%% --- Anna Le Bihan ---
trait(anna_le_bihan, female).
trait(anna_le_bihan, young).
trait(anna_le_bihan, studious).
trait(anna_le_bihan, idealistic).
attribute(anna_le_bihan, charisma, 60).
attribute(anna_le_bihan, cultural_knowledge, 70).
attribute(anna_le_bihan, self_assuredness, 55).
relationship(anna_le_bihan, nolwenn_le_goff, friends).
language_proficiency(anna_le_bihan, breton, 92).
language_proficiency(anna_le_bihan, french, 85).

%% --- Per Le Bihan ---
trait(per_le_bihan, male).
trait(per_le_bihan, young).
trait(per_le_bihan, social).
trait(per_le_bihan, athletic).
attribute(per_le_bihan, charisma, 70).
attribute(per_le_bihan, self_assuredness, 65).
attribute(per_le_bihan, cunningness, 45).
relationship(per_le_bihan, alan_kermarrec, friends).
language_proficiency(per_le_bihan, breton, 90).
language_proficiency(per_le_bihan, french, 82).

%% --- Tudual Morvan ---
trait(tudual_morvan, male).
trait(tudual_morvan, artistic).
trait(tudual_morvan, charismatic).
trait(tudual_morvan, bohemian).
trait(tudual_morvan, middle_aged).
attribute(tudual_morvan, charisma, 85).
attribute(tudual_morvan, cultural_knowledge, 90).
attribute(tudual_morvan, sensitiveness, 75).
relationship(tudual_morvan, gwenael_le_bihan, friends).
language_proficiency(tudual_morvan, breton, 95).
language_proficiency(tudual_morvan, french, 75).

%% --- Enora Morvan ---
trait(enora_morvan, female).
trait(enora_morvan, elegant).
trait(enora_morvan, musical).
trait(enora_morvan, cultured).
attribute(enora_morvan, charisma, 80).
attribute(enora_morvan, cultural_knowledge, 88).
attribute(enora_morvan, sensitiveness, 70).
relationship(enora_morvan, tudual_morvan, married).
language_proficiency(enora_morvan, breton, 93).
language_proficiency(enora_morvan, french, 80).

%% --- Sterenn Morvan ---
trait(sterenn_morvan, female).
trait(sterenn_morvan, young).
trait(sterenn_morvan, rebellious).
trait(sterenn_morvan, musical).
attribute(sterenn_morvan, charisma, 70).
attribute(sterenn_morvan, self_assuredness, 60).
attribute(sterenn_morvan, sensitiveness, 75).
relationship(sterenn_morvan, katell_kermarrec, friends).
language_proficiency(sterenn_morvan, breton, 85).
language_proficiency(sterenn_morvan, french, 88).

%% --- Denez Morvan ---
trait(denez_morvan, male).
trait(denez_morvan, young).
trait(denez_morvan, quiet).
trait(denez_morvan, artistic).
attribute(denez_morvan, charisma, 55).
attribute(denez_morvan, cultural_knowledge, 65).
attribute(denez_morvan, sensitiveness, 80).
language_proficiency(denez_morvan, breton, 87).
language_proficiency(denez_morvan, french, 85).

%% --- Jakez Riou ---
trait(jakez_riou, male).
trait(jakez_riou, patient).
trait(jakez_riou, traditional).
trait(jakez_riou, proud).
trait(jakez_riou, elderly).
attribute(jakez_riou, charisma, 60).
attribute(jakez_riou, cultural_knowledge, 92).
attribute(jakez_riou, propriety, 70).
relationship(jakez_riou, goulven_kermarrec, friends).
language_proficiency(jakez_riou, breton, 98).
language_proficiency(jakez_riou, french, 50).

%% --- Annaig Riou ---
trait(annaig_riou, female).
trait(annaig_riou, gentle).
trait(annaig_riou, herbalist).
trait(annaig_riou, observant).
attribute(annaig_riou, charisma, 55).
attribute(annaig_riou, cultural_knowledge, 88).
attribute(annaig_riou, propriety, 70).
relationship(annaig_riou, jakez_riou, married).
language_proficiency(annaig_riou, breton, 96).
language_proficiency(annaig_riou, french, 45).

%% --- Ewen Riou ---
trait(ewen_riou, male).
trait(ewen_riou, young).
trait(ewen_riou, determined).
trait(ewen_riou, nature_loving).
attribute(ewen_riou, charisma, 55).
attribute(ewen_riou, self_assuredness, 60).
attribute(ewen_riou, sensitiveness, 65).
language_proficiency(ewen_riou, breton, 90).
language_proficiency(ewen_riou, french, 70).

%% --- Gwenola Riou ---
trait(gwenola_riou, female).
trait(gwenola_riou, young).
trait(gwenola_riou, independent).
trait(gwenola_riou, creative).
attribute(gwenola_riou, charisma, 65).
attribute(gwenola_riou, self_assuredness, 60).
attribute(gwenola_riou, sensitiveness, 55).
relationship(gwenola_riou, anna_le_bihan, friends).
language_proficiency(gwenola_riou, breton, 88).
language_proficiency(gwenola_riou, french, 72).

%% --- Herve Quere ---
trait(herve_quere, male).
trait(herve_quere, shrewd).
trait(herve_quere, experienced).
trait(herve_quere, convivial).
trait(herve_quere, middle_aged).
attribute(herve_quere, charisma, 70).
attribute(herve_quere, cunningness, 65).
attribute(herve_quere, cultural_knowledge, 75).
relationship(herve_quere, jakez_riou, friends).
language_proficiency(herve_quere, breton, 93).
language_proficiency(herve_quere, french, 70).

%% --- Margod Quere ---
trait(margod_quere, female).
trait(margod_quere, resourceful).
trait(margod_quere, warm).
trait(margod_quere, practical).
attribute(margod_quere, charisma, 65).
attribute(margod_quere, propriety, 70).
attribute(margod_quere, cultural_knowledge, 80).
relationship(margod_quere, herve_quere, married).
relationship(margod_quere, annaig_riou, friends).
language_proficiency(margod_quere, breton, 92).
language_proficiency(margod_quere, french, 65).

%% --- Loig Quere ---
trait(loig_quere, male).
trait(loig_quere, young).
trait(loig_quere, entrepreneurial).
trait(loig_quere, energetic).
attribute(loig_quere, charisma, 70).
attribute(loig_quere, cunningness, 55).
attribute(loig_quere, self_assuredness, 65).
language_proficiency(loig_quere, breton, 85).
language_proficiency(loig_quere, french, 82).

%% --- Mael Quere ---
trait(mael_quere, male).
trait(mael_quere, young).
trait(mael_quere, dutiful).
trait(mael_quere, quiet).
attribute(mael_quere, charisma, 50).
attribute(mael_quere, propriety, 65).
attribute(mael_quere, cultural_knowledge, 60).
language_proficiency(mael_quere, breton, 87).
language_proficiency(mael_quere, french, 78).
