%% Ensemble History: Post-Apocalyptic Wasteland -- Initial World State
%% Source: data/worlds/post_apocalyptic/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status

%% --- Elias Mercer ---
trait(elias_mercer, male).
trait(elias_mercer, authoritative).
trait(elias_mercer, pragmatic).
trait(elias_mercer, protective).
trait(elias_mercer, middle_aged).
attribute(elias_mercer, charisma, 80).
attribute(elias_mercer, cultural_knowledge, 50).
attribute(elias_mercer, propriety, 70).
attribute(elias_mercer, cunningness, 60).
status(elias_mercer, leader, haven_ridge).

%% --- Jo Mercer ---
trait(jo_mercer, female).
trait(jo_mercer, resourceful).
trait(jo_mercer, calm).
trait(jo_mercer, analytical).
attribute(jo_mercer, charisma, 55).
attribute(jo_mercer, cunningness, 65).
attribute(jo_mercer, self_assuredness, 70).
relationship(jo_mercer, elias_mercer, married).

%% --- Cass Mercer ---
trait(cass_mercer, female).
trait(cass_mercer, young).
trait(cass_mercer, daring).
trait(cass_mercer, quick_witted).
attribute(cass_mercer, charisma, 65).
attribute(cass_mercer, self_assuredness, 75).
attribute(cass_mercer, cunningness, 55).

%% --- Remy Duval ---
trait(remy_duval, male).
trait(remy_duval, shrewd).
trait(remy_duval, opportunistic).
trait(remy_duval, generous).
trait(remy_duval, middle_aged).
attribute(remy_duval, charisma, 75).
attribute(remy_duval, cunningness, 80).
attribute(remy_duval, self_assuredness, 65).
relationship(remy_duval, elias_mercer, allies).

%% --- Mara Duval ---
trait(mara_duval, female).
trait(mara_duval, meticulous).
trait(mara_duval, cautious).
trait(mara_duval, intelligent).
attribute(mara_duval, charisma, 50).
attribute(mara_duval, cunningness, 70).
attribute(mara_duval, self_assuredness, 60).
relationship(mara_duval, remy_duval, married).

%% --- Nix Duval ---
trait(nix_duval, male).
trait(nix_duval, young).
trait(nix_duval, eager).
trait(nix_duval, reckless).
attribute(nix_duval, charisma, 55).
attribute(nix_duval, self_assuredness, 50).
attribute(nix_duval, cunningness, 45).
relationship(nix_duval, cass_mercer, friends).

%% --- Doc Harlan ---
trait(doc_harlan, male).
trait(doc_harlan, compassionate).
trait(doc_harlan, weary).
trait(doc_harlan, skilled).
trait(doc_harlan, middle_aged).
attribute(doc_harlan, charisma, 60).
attribute(doc_harlan, cultural_knowledge, 75).
attribute(doc_harlan, propriety, 65).

%% --- Wren Holloway ---
trait(wren_holloway, female).
trait(wren_holloway, disciplined).
trait(wren_holloway, tough).
trait(wren_holloway, loyal).
attribute(wren_holloway, charisma, 70).
attribute(wren_holloway, self_assuredness, 80).
attribute(wren_holloway, cunningness, 55).
relationship(wren_holloway, elias_mercer, loyal_to).

%% --- Silas Kane ---
trait(silas_kane, male).
trait(silas_kane, introverted).
trait(silas_kane, paranoid).
trait(silas_kane, technically_gifted).
attribute(silas_kane, charisma, 35).
attribute(silas_kane, cunningness, 70).
attribute(silas_kane, self_assuredness, 40).

%% --- Ash Corbin ---
trait(ash_corbin, male).
trait(ash_corbin, cunning).
trait(ash_corbin, territorial).
trait(ash_corbin, survivalist).
attribute(ash_corbin, charisma, 65).
attribute(ash_corbin, cunningness, 75).
attribute(ash_corbin, self_assuredness, 70).
relationship(ash_corbin, remy_duval, rivals).

%% --- Petra Volkov ---
trait(petra_volkov, female).
trait(petra_volkov, gentle).
trait(petra_volkov, knowledgeable).
trait(petra_volkov, reclusive).
attribute(petra_volkov, charisma, 50).
attribute(petra_volkov, cultural_knowledge, 80).
attribute(petra_volkov, sensitiveness, 75).
relationship(petra_volkov, doc_harlan, colleagues).

%% --- Grim ---
trait(grim, male).
trait(grim, mutant).
trait(grim, stoic).
trait(grim, outcast).
attribute(grim, charisma, 30).
attribute(grim, self_assuredness, 60).
attribute(grim, sensitiveness, 40).
relationship(grim, petra_volkov, protected_by).

%% --- Lina Okafor ---
trait(lina_okafor, female).
trait(lina_okafor, optimistic).
trait(lina_okafor, hardworking).
trait(lina_okafor, nurturing).
attribute(lina_okafor, charisma, 65).
attribute(lina_okafor, cultural_knowledge, 60).
attribute(lina_okafor, self_assuredness, 55).
relationship(lina_okafor, petra_volkov, friends).

%% --- Vex Thornton ---
trait(vex_thornton, male).
trait(vex_thornton, cruel).
trait(vex_thornton, charismatic).
trait(vex_thornton, ruthless).
attribute(vex_thornton, charisma, 85).
attribute(vex_thornton, cunningness, 80).
attribute(vex_thornton, self_assuredness, 90).
relationship(vex_thornton, elias_mercer, enemies).

%% --- Sable Reyes ---
trait(sable_reyes, female).
trait(sable_reyes, calculating).
trait(sable_reyes, ambitious).
trait(sable_reyes, dangerous).
attribute(sable_reyes, charisma, 70).
attribute(sable_reyes, cunningness, 85).
attribute(sable_reyes, self_assuredness, 75).
relationship(sable_reyes, vex_thornton, loyal_to).

%% --- Cutter Briggs ---
trait(cutter_briggs, male).
trait(cutter_briggs, violent).
trait(cutter_briggs, simple).
trait(cutter_briggs, strong).
attribute(cutter_briggs, charisma, 40).
attribute(cutter_briggs, cunningness, 25).
attribute(cutter_briggs, self_assuredness, 80).
relationship(cutter_briggs, vex_thornton, loyal_to).

%% --- Moth ---
trait(moth, female).
trait(moth, secretive).
trait(moth, opportunistic).
trait(moth, neutral).
attribute(moth, charisma, 60).
attribute(moth, cunningness, 90).
attribute(moth, self_assuredness, 65).
relationship(moth, remy_duval, business_partner).
