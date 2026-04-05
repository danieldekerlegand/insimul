%% Ensemble History: German Rhineland -- Initial World State
%% Source: data/worlds/language/german/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status, language

%% --- Hans Mueller ---
trait(hans_mueller, male).
trait(hans_mueller, hospitable).
trait(hans_mueller, traditional).
trait(hans_mueller, hardworking).
trait(hans_mueller, middle_aged).
attribute(hans_mueller, charisma, 70).
attribute(hans_mueller, cultural_knowledge, 85).
attribute(hans_mueller, propriety, 75).
language_proficiency(hans_mueller, german, 95).
language_proficiency(hans_mueller, english, 30).

%% --- Ingrid Mueller ---
trait(ingrid_mueller, female).
trait(ingrid_mueller, nurturing).
trait(ingrid_mueller, organized).
trait(ingrid_mueller, community_minded).
attribute(ingrid_mueller, charisma, 75).
attribute(ingrid_mueller, cultural_knowledge, 80).
attribute(ingrid_mueller, propriety, 80).
relationship(ingrid_mueller, hans_mueller, married).
language_proficiency(ingrid_mueller, german, 95).
language_proficiency(ingrid_mueller, english, 25).

%% --- Anna Mueller ---
trait(anna_mueller, female).
trait(anna_mueller, young).
trait(anna_mueller, ambitious).
trait(anna_mueller, tech_savvy).
attribute(anna_mueller, charisma, 65).
attribute(anna_mueller, cunningness, 50).
attribute(anna_mueller, self_assuredness, 70).
language_proficiency(anna_mueller, german, 95).
language_proficiency(anna_mueller, english, 75).

%% --- Tobias Mueller ---
trait(tobias_mueller, male).
trait(tobias_mueller, young).
trait(tobias_mueller, artistic).
trait(tobias_mueller, quiet).
attribute(tobias_mueller, charisma, 55).
attribute(tobias_mueller, cultural_knowledge, 60).
attribute(tobias_mueller, sensitiveness, 75).
language_proficiency(tobias_mueller, german, 93).
language_proficiency(tobias_mueller, english, 55).

%% --- Klaus Schmidt ---
trait(klaus_schmidt, male).
trait(klaus_schmidt, educated).
trait(klaus_schmidt, formal).
trait(klaus_schmidt, intellectual).
trait(klaus_schmidt, middle_aged).
attribute(klaus_schmidt, charisma, 80).
attribute(klaus_schmidt, cultural_knowledge, 95).
attribute(klaus_schmidt, propriety, 85).
language_proficiency(klaus_schmidt, german, 98).
language_proficiency(klaus_schmidt, english, 85).
language_proficiency(klaus_schmidt, french, 45).

%% --- Petra Schmidt ---
trait(petra_schmidt, female).
trait(petra_schmidt, articulate).
trait(petra_schmidt, passionate).
trait(petra_schmidt, modern).
attribute(petra_schmidt, charisma, 85).
attribute(petra_schmidt, cultural_knowledge, 80).
attribute(petra_schmidt, self_assuredness, 80).
relationship(petra_schmidt, klaus_schmidt, married).
language_proficiency(petra_schmidt, german, 97).
language_proficiency(petra_schmidt, english, 80).

%% --- Lena Schmidt ---
trait(lena_schmidt, female).
trait(lena_schmidt, young).
trait(lena_schmidt, studious).
trait(lena_schmidt, idealistic).
attribute(lena_schmidt, charisma, 60).
attribute(lena_schmidt, cultural_knowledge, 70).
attribute(lena_schmidt, self_assuredness, 55).
language_proficiency(lena_schmidt, german, 95).
language_proficiency(lena_schmidt, english, 85).

%% --- Markus Schmidt ---
trait(markus_schmidt, male).
trait(markus_schmidt, young).
trait(markus_schmidt, social).
trait(markus_schmidt, athletic).
attribute(markus_schmidt, charisma, 75).
attribute(markus_schmidt, self_assuredness, 70).
attribute(markus_schmidt, cunningness, 45).
language_proficiency(markus_schmidt, german, 93).
language_proficiency(markus_schmidt, english, 70).

%% --- Dieter Fischer ---
trait(dieter_fischer, male).
trait(dieter_fischer, meticulous).
trait(dieter_fischer, early_riser).
trait(dieter_fischer, generous).
trait(dieter_fischer, middle_aged).
attribute(dieter_fischer, charisma, 65).
attribute(dieter_fischer, cultural_knowledge, 70).
attribute(dieter_fischer, propriety, 75).
relationship(dieter_fischer, hans_mueller, friends).
language_proficiency(dieter_fischer, german, 95).
language_proficiency(dieter_fischer, english, 20).

%% --- Monika Fischer ---
trait(monika_fischer, female).
trait(monika_fischer, warm).
trait(monika_fischer, practical).
trait(monika_fischer, patient).
attribute(monika_fischer, charisma, 70).
attribute(monika_fischer, propriety, 75).
attribute(monika_fischer, cultural_knowledge, 80).
relationship(monika_fischer, dieter_fischer, married).
relationship(monika_fischer, ingrid_mueller, friends).
language_proficiency(monika_fischer, german, 95).
language_proficiency(monika_fischer, english, 25).

%% --- Julia Fischer ---
trait(julia_fischer, female).
trait(julia_fischer, young).
trait(julia_fischer, creative).
trait(julia_fischer, independent).
attribute(julia_fischer, charisma, 70).
attribute(julia_fischer, self_assuredness, 65).
attribute(julia_fischer, sensitiveness, 60).
relationship(julia_fischer, lena_schmidt, friends).
language_proficiency(julia_fischer, german, 93).
language_proficiency(julia_fischer, english, 65).

%% --- Stefan Fischer ---
trait(stefan_fischer, male).
trait(stefan_fischer, young).
trait(stefan_fischer, entrepreneurial).
trait(stefan_fischer, energetic).
attribute(stefan_fischer, charisma, 70).
attribute(stefan_fischer, cunningness, 60).
attribute(stefan_fischer, self_assuredness, 65).
language_proficiency(stefan_fischer, german, 93).
language_proficiency(stefan_fischer, english, 60).

%% --- Friedrich Weber ---
trait(friedrich_weber, male).
trait(friedrich_weber, sturdy).
trait(friedrich_weber, experienced).
trait(friedrich_weber, merchant).
trait(friedrich_weber, middle_aged).
attribute(friedrich_weber, charisma, 70).
attribute(friedrich_weber, cunningness, 65).
attribute(friedrich_weber, cultural_knowledge, 70).
relationship(friedrich_weber, dieter_fischer, friends).
language_proficiency(friedrich_weber, german, 95).
language_proficiency(friedrich_weber, english, 30).

%% --- Elisabeth Weber ---
trait(elisabeth_weber, female).
trait(elisabeth_weber, elegant).
trait(elisabeth_weber, precise).
trait(elisabeth_weber, caring).
attribute(elisabeth_weber, charisma, 75).
attribute(elisabeth_weber, cultural_knowledge, 80).
attribute(elisabeth_weber, propriety, 85).
relationship(elisabeth_weber, friedrich_weber, married).
language_proficiency(elisabeth_weber, german, 95).
language_proficiency(elisabeth_weber, english, 45).

%% --- Sophie Weber ---
trait(sophie_weber, female).
trait(sophie_weber, young).
trait(sophie_weber, diligent).
trait(sophie_weber, kind).
attribute(sophie_weber, charisma, 60).
attribute(sophie_weber, propriety, 75).
attribute(sophie_weber, cultural_knowledge, 65).
relationship(sophie_weber, anna_mueller, friends).
language_proficiency(sophie_weber, german, 93).
language_proficiency(sophie_weber, english, 70).

%% --- Lukas Weber ---
trait(lukas_weber, male).
trait(lukas_weber, young).
trait(lukas_weber, rebellious).
trait(lukas_weber, musical).
attribute(lukas_weber, charisma, 65).
attribute(lukas_weber, self_assuredness, 55).
attribute(lukas_weber, sensitiveness, 70).
relationship(lukas_weber, markus_schmidt, friends).
language_proficiency(lukas_weber, german, 90).
language_proficiency(lukas_weber, english, 65).

%% --- Wolfgang Wagner ---
trait(wolfgang_wagner, male).
trait(wolfgang_wagner, jovial).
trait(wolfgang_wagner, experienced).
trait(wolfgang_wagner, culinary_minded).
trait(wolfgang_wagner, middle_aged).
attribute(wolfgang_wagner, charisma, 80).
attribute(wolfgang_wagner, cultural_knowledge, 75).
attribute(wolfgang_wagner, propriety, 65).
relationship(wolfgang_wagner, hans_mueller, friends).
language_proficiency(wolfgang_wagner, german, 95).
language_proficiency(wolfgang_wagner, english, 35).

%% --- Brigitte Wagner ---
trait(brigitte_wagner, female).
trait(brigitte_wagner, organized).
trait(brigitte_wagner, hospitable).
trait(brigitte_wagner, cultured).
attribute(brigitte_wagner, charisma, 80).
attribute(brigitte_wagner, cultural_knowledge, 85).
attribute(brigitte_wagner, sensitiveness, 65).
relationship(brigitte_wagner, wolfgang_wagner, married).
language_proficiency(brigitte_wagner, german, 95).
language_proficiency(brigitte_wagner, english, 40).

%% --- Katrin Wagner ---
trait(katrin_wagner, female).
trait(katrin_wagner, young).
trait(katrin_wagner, curious).
trait(katrin_wagner, cheerful).
attribute(katrin_wagner, charisma, 70).
attribute(katrin_wagner, sensitiveness, 60).
attribute(katrin_wagner, self_assuredness, 50).
language_proficiency(katrin_wagner, german, 93).
language_proficiency(katrin_wagner, english, 70).

%% --- Felix Wagner ---
trait(felix_wagner, male).
trait(felix_wagner, young).
trait(felix_wagner, restless).
trait(felix_wagner, ambitious).
attribute(felix_wagner, charisma, 65).
attribute(felix_wagner, self_assuredness, 55).
attribute(felix_wagner, cunningness, 45).
relationship(felix_wagner, tobias_mueller, friends).
language_proficiency(felix_wagner, german, 90).
language_proficiency(felix_wagner, english, 60).

%% --- Heinrich Schaefer ---
trait(heinrich_schaefer, male).
trait(heinrich_schaefer, patient).
trait(heinrich_schaefer, traditional).
trait(heinrich_schaefer, proud).
trait(heinrich_schaefer, elderly).
attribute(heinrich_schaefer, charisma, 60).
attribute(heinrich_schaefer, cultural_knowledge, 90).
attribute(heinrich_schaefer, propriety, 70).
relationship(heinrich_schaefer, hans_mueller, friends).
language_proficiency(heinrich_schaefer, german, 95).
language_proficiency(heinrich_schaefer, english, 10).

%% --- Renate Schaefer ---
trait(renate_schaefer, female).
trait(renate_schaefer, gentle).
trait(renate_schaefer, resourceful).
trait(renate_schaefer, observant).
attribute(renate_schaefer, charisma, 55).
attribute(renate_schaefer, cultural_knowledge, 85).
attribute(renate_schaefer, propriety, 70).
relationship(renate_schaefer, heinrich_schaefer, married).
language_proficiency(renate_schaefer, german, 95).
language_proficiency(renate_schaefer, english, 5).

%% --- Marie Schaefer ---
trait(marie_schaefer, female).
trait(marie_schaefer, young).
trait(marie_schaefer, determined).
trait(marie_schaefer, nature_loving).
attribute(marie_schaefer, charisma, 55).
attribute(marie_schaefer, self_assuredness, 60).
attribute(marie_schaefer, sensitiveness, 65).
language_proficiency(marie_schaefer, german, 93).
language_proficiency(marie_schaefer, english, 50).

%% --- Thomas Schaefer ---
trait(thomas_schaefer, male).
trait(thomas_schaefer, young).
trait(thomas_schaefer, quiet).
trait(thomas_schaefer, dutiful).
attribute(thomas_schaefer, charisma, 45).
attribute(thomas_schaefer, propriety, 65).
attribute(thomas_schaefer, cultural_knowledge, 60).
language_proficiency(thomas_schaefer, german, 93).
language_proficiency(thomas_schaefer, english, 35).
