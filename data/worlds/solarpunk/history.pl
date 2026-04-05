%% Ensemble History: Solarpunk Eco-Communities -- Initial World State
%% Source: data/worlds/solarpunk/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status

%% --- Emeka Okafor ---
trait(emeka_okafor, male).
trait(emeka_okafor, inventive).
trait(emeka_okafor, generous).
trait(emeka_okafor, patient).
trait(emeka_okafor, middle_aged).
attribute(emeka_okafor, charisma, 70).
attribute(emeka_okafor, cultural_knowledge, 65).
attribute(emeka_okafor, self_assuredness, 70).
status(emeka_okafor, chief_engineer, heliotrope_commons).

%% --- Nia Okafor ---
trait(nia_okafor, female).
trait(nia_okafor, nurturing).
trait(nia_okafor, organized).
trait(nia_okafor, warm).
attribute(nia_okafor, charisma, 75).
attribute(nia_okafor, propriety, 70).
attribute(nia_okafor, cultural_knowledge, 60).
relationship(nia_okafor, emeka_okafor, married).

%% --- Zuri Okafor ---
trait(zuri_okafor, female).
trait(zuri_okafor, young).
trait(zuri_okafor, artistic).
trait(zuri_okafor, idealistic).
attribute(zuri_okafor, charisma, 65).
attribute(zuri_okafor, sensitiveness, 75).
attribute(zuri_okafor, self_assuredness, 55).

%% --- Kofi Okafor ---
trait(kofi_okafor, male).
trait(kofi_okafor, young).
trait(kofi_okafor, athletic).
trait(kofi_okafor, curious).
attribute(kofi_okafor, charisma, 60).
attribute(kofi_okafor, self_assuredness, 65).
attribute(kofi_okafor, cunningness, 40).
relationship(kofi_okafor, finn_maren, friends).

%% --- Elena Vasquez ---
trait(elena_vasquez, female).
trait(elena_vasquez, charismatic).
trait(elena_vasquez, diplomatic).
trait(elena_vasquez, passionate).
trait(elena_vasquez, middle_aged).
attribute(elena_vasquez, charisma, 85).
attribute(elena_vasquez, cultural_knowledge, 75).
attribute(elena_vasquez, self_assuredness, 80).
status(elena_vasquez, council_chair, heliotrope_commons).

%% --- Mateo Vasquez ---
trait(mateo_vasquez, male).
trait(mateo_vasquez, quiet).
trait(mateo_vasquez, thoughtful).
trait(mateo_vasquez, practical).
attribute(mateo_vasquez, charisma, 55).
attribute(mateo_vasquez, propriety, 70).
attribute(mateo_vasquez, cultural_knowledge, 65).
relationship(mateo_vasquez, elena_vasquez, married).

%% --- Rio Vasquez ---
trait(rio_vasquez, nonbinary).
trait(rio_vasquez, young).
trait(rio_vasquez, creative).
trait(rio_vasquez, outspoken).
attribute(rio_vasquez, charisma, 70).
attribute(rio_vasquez, self_assuredness, 60).
attribute(rio_vasquez, sensitiveness, 65).
relationship(rio_vasquez, zuri_okafor, friends).

%% --- Sol Vasquez ---
trait(sol_vasquez, female).
trait(sol_vasquez, young).
trait(sol_vasquez, studious).
trait(sol_vasquez, reserved).
attribute(sol_vasquez, charisma, 50).
attribute(sol_vasquez, cultural_knowledge, 70).
attribute(sol_vasquez, self_assuredness, 45).

%% --- Hiro Tanaka ---
trait(hiro_tanaka, male).
trait(hiro_tanaka, meticulous).
trait(hiro_tanaka, innovative).
trait(hiro_tanaka, dedicated).
trait(hiro_tanaka, middle_aged).
attribute(hiro_tanaka, charisma, 55).
attribute(hiro_tanaka, cultural_knowledge, 80).
attribute(hiro_tanaka, self_assuredness, 65).
relationship(hiro_tanaka, emeka_okafor, colleagues).

%% --- Priya Tanaka ---
trait(priya_tanaka, female).
trait(priya_tanaka, warm).
trait(priya_tanaka, knowledgeable).
trait(priya_tanaka, community_minded).
attribute(priya_tanaka, charisma, 70).
attribute(priya_tanaka, cultural_knowledge, 85).
attribute(priya_tanaka, propriety, 75).
relationship(priya_tanaka, hiro_tanaka, married).

%% --- Yuki Tanaka ---
trait(yuki_tanaka, female).
trait(yuki_tanaka, young).
trait(yuki_tanaka, determined).
trait(yuki_tanaka, scientific).
attribute(yuki_tanaka, charisma, 50).
attribute(yuki_tanaka, cultural_knowledge, 60).
attribute(yuki_tanaka, self_assuredness, 55).

%% --- Kai Tanaka ---
trait(kai_tanaka, male).
trait(kai_tanaka, young).
trait(kai_tanaka, adventurous).
trait(kai_tanaka, restless).
attribute(kai_tanaka, charisma, 65).
attribute(kai_tanaka, self_assuredness, 60).
attribute(kai_tanaka, cunningness, 45).
relationship(kai_tanaka, kofi_okafor, friends).

%% --- Astrid Maren ---
trait(astrid_maren, female).
trait(astrid_maren, strong_willed).
trait(astrid_maren, compassionate).
trait(astrid_maren, experienced).
trait(astrid_maren, middle_aged).
attribute(astrid_maren, charisma, 75).
attribute(astrid_maren, cultural_knowledge, 80).
attribute(astrid_maren, self_assuredness, 75).
status(astrid_maren, marine_lead, tidecrest_village).

%% --- Soren Maren ---
trait(soren_maren, male).
trait(soren_maren, inventive).
trait(soren_maren, steady).
trait(soren_maren, humble).
attribute(soren_maren, charisma, 60).
attribute(soren_maren, cunningness, 55).
attribute(soren_maren, propriety, 65).
relationship(soren_maren, astrid_maren, married).

%% --- Finn Maren ---
trait(finn_maren, male).
trait(finn_maren, young).
trait(finn_maren, energetic).
trait(finn_maren, helpful).
attribute(finn_maren, charisma, 65).
attribute(finn_maren, self_assuredness, 55).
attribute(finn_maren, sensitiveness, 50).

%% --- Lena Maren ---
trait(lena_maren, female).
trait(lena_maren, young).
trait(lena_maren, thoughtful).
trait(lena_maren, artistic).
attribute(lena_maren, charisma, 55).
attribute(lena_maren, sensitiveness, 70).
attribute(lena_maren, cultural_knowledge, 50).
relationship(lena_maren, sol_vasquez, friends).

%% --- Olu Adeyemi ---
trait(olu_adeyemi, male).
trait(olu_adeyemi, brilliant).
trait(olu_adeyemi, eccentric).
trait(olu_adeyemi, passionate).
attribute(olu_adeyemi, charisma, 60).
attribute(olu_adeyemi, cultural_knowledge, 90).
attribute(olu_adeyemi, self_assuredness, 50).
relationship(olu_adeyemi, hiro_tanaka, colleagues).

%% --- Wren Calloway ---
trait(wren_calloway, nonbinary).
trait(wren_calloway, observant).
trait(wren_calloway, independent).
trait(wren_calloway, gentle).
attribute(wren_calloway, charisma, 50).
attribute(wren_calloway, cultural_knowledge, 75).
attribute(wren_calloway, self_assuredness, 60).
status(wren_calloway, forest_ranger, roothold_hamlet).
