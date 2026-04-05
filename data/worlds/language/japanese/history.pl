%% Ensemble History: Japanese Town -- Initial World State
%% Source: data/worlds/language/japanese/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status, language

%% --- Tanaka Kenji ---
trait(tanaka_kenji, male).
trait(tanaka_kenji, hospitable).
trait(tanaka_kenji, hardworking).
trait(tanaka_kenji, traditional).
trait(tanaka_kenji, middle_aged).
attribute(tanaka_kenji, charisma, 75).
attribute(tanaka_kenji, cultural_knowledge, 80).
attribute(tanaka_kenji, propriety, 70).
language_proficiency(tanaka_kenji, japanese, 95).
language_proficiency(tanaka_kenji, english, 25).

%% --- Tanaka Haruko ---
trait(tanaka_haruko, female).
trait(tanaka_haruko, nurturing).
trait(tanaka_haruko, warm).
trait(tanaka_haruko, community_minded).
attribute(tanaka_haruko, charisma, 70).
attribute(tanaka_haruko, cultural_knowledge, 85).
attribute(tanaka_haruko, propriety, 80).
relationship(tanaka_haruko, tanaka_kenji, married).
language_proficiency(tanaka_haruko, japanese, 95).
language_proficiency(tanaka_haruko, english, 20).

%% --- Tanaka Yuki ---
trait(tanaka_yuki, female).
trait(tanaka_yuki, young).
trait(tanaka_yuki, ambitious).
trait(tanaka_yuki, tech_savvy).
attribute(tanaka_yuki, charisma, 65).
attribute(tanaka_yuki, cunningness, 50).
attribute(tanaka_yuki, self_assuredness, 70).
language_proficiency(tanaka_yuki, japanese, 90).
language_proficiency(tanaka_yuki, english, 65).

%% --- Tanaka Ren ---
trait(tanaka_ren, male).
trait(tanaka_ren, young).
trait(tanaka_ren, artistic).
trait(tanaka_ren, quiet).
attribute(tanaka_ren, charisma, 55).
attribute(tanaka_ren, cultural_knowledge, 60).
attribute(tanaka_ren, sensitiveness, 75).
language_proficiency(tanaka_ren, japanese, 88).
language_proficiency(tanaka_ren, english, 50).

%% --- Suzuki Takeshi ---
trait(suzuki_takeshi, male).
trait(suzuki_takeshi, spiritual).
trait(suzuki_takeshi, formal).
trait(suzuki_takeshi, wise).
trait(suzuki_takeshi, middle_aged).
attribute(suzuki_takeshi, charisma, 80).
attribute(suzuki_takeshi, cultural_knowledge, 95).
attribute(suzuki_takeshi, propriety, 90).
language_proficiency(suzuki_takeshi, japanese, 98).
language_proficiency(suzuki_takeshi, english, 30).

%% --- Suzuki Megumi ---
trait(suzuki_megumi, female).
trait(suzuki_megumi, gentle).
trait(suzuki_megumi, organized).
trait(suzuki_megumi, patient).
attribute(suzuki_megumi, charisma, 65).
attribute(suzuki_megumi, cultural_knowledge, 85).
attribute(suzuki_megumi, propriety, 85).
relationship(suzuki_megumi, suzuki_takeshi, married).
language_proficiency(suzuki_megumi, japanese, 95).
language_proficiency(suzuki_megumi, english, 25).

%% --- Suzuki Aoi ---
trait(suzuki_aoi, female).
trait(suzuki_aoi, young).
trait(suzuki_aoi, studious).
trait(suzuki_aoi, idealistic).
attribute(suzuki_aoi, charisma, 60).
attribute(suzuki_aoi, cultural_knowledge, 70).
attribute(suzuki_aoi, self_assuredness, 55).
language_proficiency(suzuki_aoi, japanese, 92).
language_proficiency(suzuki_aoi, english, 75).

%% --- Suzuki Daiki ---
trait(suzuki_daiki, male).
trait(suzuki_daiki, young).
trait(suzuki_daiki, social).
trait(suzuki_daiki, athletic).
attribute(suzuki_daiki, charisma, 75).
attribute(suzuki_daiki, self_assuredness, 70).
attribute(suzuki_daiki, cunningness, 40).
relationship(suzuki_daiki, sato_kaito, friends).
language_proficiency(suzuki_daiki, japanese, 88).
language_proficiency(suzuki_daiki, english, 55).

%% --- Sato Hiroshi ---
trait(sato_hiroshi, male).
trait(sato_hiroshi, diligent).
trait(sato_hiroshi, formal).
trait(sato_hiroshi, loyal).
trait(sato_hiroshi, middle_aged).
attribute(sato_hiroshi, charisma, 65).
attribute(sato_hiroshi, propriety, 85).
attribute(sato_hiroshi, cultural_knowledge, 70).
relationship(sato_hiroshi, tanaka_kenji, friends).
language_proficiency(sato_hiroshi, japanese, 95).
language_proficiency(sato_hiroshi, english, 60).

%% --- Sato Naomi ---
trait(sato_naomi, female).
trait(sato_naomi, articulate).
trait(sato_naomi, modern).
trait(sato_naomi, practical).
attribute(sato_naomi, charisma, 80).
attribute(sato_naomi, self_assuredness, 75).
attribute(sato_naomi, cultural_knowledge, 70).
relationship(sato_naomi, sato_hiroshi, married).
relationship(sato_naomi, tanaka_haruko, friends).
language_proficiency(sato_naomi, japanese, 95).
language_proficiency(sato_naomi, english, 70).

%% --- Sato Sakura ---
trait(sato_sakura, female).
trait(sato_sakura, young).
trait(sato_sakura, creative).
trait(sato_sakura, independent).
attribute(sato_sakura, charisma, 70).
attribute(sato_sakura, self_assuredness, 65).
attribute(sato_sakura, sensitiveness, 60).
relationship(sato_sakura, suzuki_aoi, friends).
language_proficiency(sato_sakura, japanese, 90).
language_proficiency(sato_sakura, english, 65).

%% --- Sato Kaito ---
trait(sato_kaito, male).
trait(sato_kaito, young).
trait(sato_kaito, energetic).
trait(sato_kaito, tech_savvy).
attribute(sato_kaito, charisma, 70).
attribute(sato_kaito, cunningness, 55).
attribute(sato_kaito, self_assuredness, 60).
language_proficiency(sato_kaito, japanese, 88).
language_proficiency(sato_kaito, english, 60).

%% --- Yamamoto Shigeru ---
trait(yamamoto_shigeru, male).
trait(yamamoto_shigeru, shrewd).
trait(yamamoto_shigeru, experienced).
trait(yamamoto_shigeru, merchant).
trait(yamamoto_shigeru, middle_aged).
attribute(yamamoto_shigeru, charisma, 80).
attribute(yamamoto_shigeru, cunningness, 70).
attribute(yamamoto_shigeru, cultural_knowledge, 75).
relationship(yamamoto_shigeru, tanaka_kenji, friends).
language_proficiency(yamamoto_shigeru, japanese, 95).
language_proficiency(yamamoto_shigeru, english, 20).

%% --- Yamamoto Misaki ---
trait(yamamoto_misaki, female).
trait(yamamoto_misaki, organized).
trait(yamamoto_misaki, resourceful).
trait(yamamoto_misaki, cheerful).
attribute(yamamoto_misaki, charisma, 70).
attribute(yamamoto_misaki, propriety, 75).
attribute(yamamoto_misaki, cultural_knowledge, 80).
relationship(yamamoto_misaki, yamamoto_shigeru, married).
relationship(yamamoto_misaki, suzuki_megumi, friends).
language_proficiency(yamamoto_misaki, japanese, 93).
language_proficiency(yamamoto_misaki, english, 15).

%% --- Yamamoto Hana ---
trait(yamamoto_hana, female).
trait(yamamoto_hana, young).
trait(yamamoto_hana, creative).
trait(yamamoto_hana, kind).
attribute(yamamoto_hana, charisma, 65).
attribute(yamamoto_hana, sensitiveness, 70).
attribute(yamamoto_hana, self_assuredness, 55).
relationship(yamamoto_hana, tanaka_yuki, friends).
language_proficiency(yamamoto_hana, japanese, 90).
language_proficiency(yamamoto_hana, english, 45).

%% --- Yamamoto Sota ---
trait(yamamoto_sota, male).
trait(yamamoto_sota, young).
trait(yamamoto_sota, rebellious).
trait(yamamoto_sota, musical).
attribute(yamamoto_sota, charisma, 65).
attribute(yamamoto_sota, self_assuredness, 55).
attribute(yamamoto_sota, sensitiveness, 65).
relationship(yamamoto_sota, tanaka_ren, friends).
language_proficiency(yamamoto_sota, japanese, 85).
language_proficiency(yamamoto_sota, english, 50).

%% --- Watanabe Isamu ---
trait(watanabe_isamu, male).
trait(watanabe_isamu, patient).
trait(watanabe_isamu, traditional).
trait(watanabe_isamu, proud).
trait(watanabe_isamu, elderly).
attribute(watanabe_isamu, charisma, 60).
attribute(watanabe_isamu, cultural_knowledge, 90).
attribute(watanabe_isamu, propriety, 75).
relationship(watanabe_isamu, nakamura_tadao, friends).
language_proficiency(watanabe_isamu, japanese, 95).
language_proficiency(watanabe_isamu, english, 5).

%% --- Watanabe Fumiko ---
trait(watanabe_fumiko, female).
trait(watanabe_fumiko, resilient).
trait(watanabe_fumiko, herbalist).
trait(watanabe_fumiko, observant).
attribute(watanabe_fumiko, charisma, 55).
attribute(watanabe_fumiko, cultural_knowledge, 85).
attribute(watanabe_fumiko, propriety, 70).
relationship(watanabe_fumiko, watanabe_isamu, married).
language_proficiency(watanabe_fumiko, japanese, 93).
language_proficiency(watanabe_fumiko, english, 5).

%% --- Watanabe Mai ---
trait(watanabe_mai, female).
trait(watanabe_mai, young).
trait(watanabe_mai, determined).
trait(watanabe_mai, nature_loving).
attribute(watanabe_mai, charisma, 55).
attribute(watanabe_mai, self_assuredness, 60).
attribute(watanabe_mai, sensitiveness, 65).
language_proficiency(watanabe_mai, japanese, 88).
language_proficiency(watanabe_mai, english, 40).

%% --- Watanabe Ryota ---
trait(watanabe_ryota, male).
trait(watanabe_ryota, young).
trait(watanabe_ryota, restless).
trait(watanabe_ryota, ambitious).
attribute(watanabe_ryota, charisma, 60).
attribute(watanabe_ryota, self_assuredness, 50).
attribute(watanabe_ryota, cunningness, 40).
language_proficiency(watanabe_ryota, japanese, 85).
language_proficiency(watanabe_ryota, english, 35).

%% --- Nakamura Tadao ---
trait(nakamura_tadao, male).
trait(nakamura_tadao, meticulous).
trait(nakamura_tadao, traditional).
trait(nakamura_tadao, stoic).
trait(nakamura_tadao, elderly).
attribute(nakamura_tadao, charisma, 55).
attribute(nakamura_tadao, cultural_knowledge, 92).
attribute(nakamura_tadao, propriety, 80).
language_proficiency(nakamura_tadao, japanese, 96).
language_proficiency(nakamura_tadao, english, 5).

%% --- Nakamura Chiyo ---
trait(nakamura_chiyo, female).
trait(nakamura_chiyo, gentle).
trait(nakamura_chiyo, community_minded).
trait(nakamura_chiyo, wise).
attribute(nakamura_chiyo, charisma, 60).
attribute(nakamura_chiyo, cultural_knowledge, 88).
attribute(nakamura_chiyo, propriety, 75).
relationship(nakamura_chiyo, nakamura_tadao, married).
language_proficiency(nakamura_chiyo, japanese, 94).
language_proficiency(nakamura_chiyo, english, 5).

%% --- Nakamura Emi ---
trait(nakamura_emi, female).
trait(nakamura_emi, young).
trait(nakamura_emi, curious).
trait(nakamura_emi, cheerful).
attribute(nakamura_emi, charisma, 70).
attribute(nakamura_emi, sensitiveness, 60).
attribute(nakamura_emi, self_assuredness, 50).
relationship(nakamura_emi, watanabe_mai, friends).
language_proficiency(nakamura_emi, japanese, 87).
language_proficiency(nakamura_emi, english, 45).

%% --- Nakamura Yuto ---
trait(nakamura_yuto, male).
trait(nakamura_yuto, young).
trait(nakamura_yuto, quiet).
trait(nakamura_yuto, dutiful).
attribute(nakamura_yuto, charisma, 45).
attribute(nakamura_yuto, propriety, 70).
attribute(nakamura_yuto, cultural_knowledge, 65).
language_proficiency(nakamura_yuto, japanese, 87).
language_proficiency(nakamura_yuto, english, 30).
