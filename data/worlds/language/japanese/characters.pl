%% Insimul Characters: Japanese Town
%% Source: data/worlds/language/japanese/characters.pl
%% Created: 2026-04-03
%% Total: 24 characters (6 families)
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2
%%
%% Note: Japanese naming convention -- family name FIRST, given name second.
%% first_name = given name, last_name = family name, full_name = "Family Given"

%% ============================================================
%% Tanaka Family (Ramen Shop Owners, Sakuragawa)
%% ============================================================

%% Tanaka Kenji
person(tanaka_kenji).
first_name(tanaka_kenji, 'Kenji').
last_name(tanaka_kenji, 'Tanaka').
full_name(tanaka_kenji, 'Tanaka Kenji').
gender(tanaka_kenji, male).
alive(tanaka_kenji).
generation(tanaka_kenji, 0).
founder_family(tanaka_kenji).
child(tanaka_kenji, tanaka_yuki).
child(tanaka_kenji, tanaka_ren).
spouse(tanaka_kenji, tanaka_haruko).
location(tanaka_kenji, sakuragawa).

%% Tanaka Haruko
person(tanaka_haruko).
first_name(tanaka_haruko, 'Haruko').
last_name(tanaka_haruko, 'Tanaka').
full_name(tanaka_haruko, 'Tanaka Haruko').
gender(tanaka_haruko, female).
alive(tanaka_haruko).
generation(tanaka_haruko, 0).
founder_family(tanaka_haruko).
child(tanaka_haruko, tanaka_yuki).
child(tanaka_haruko, tanaka_ren).
spouse(tanaka_haruko, tanaka_kenji).
location(tanaka_haruko, sakuragawa).

%% Tanaka Yuki
person(tanaka_yuki).
first_name(tanaka_yuki, 'Yuki').
last_name(tanaka_yuki, 'Tanaka').
full_name(tanaka_yuki, 'Tanaka Yuki').
gender(tanaka_yuki, female).
alive(tanaka_yuki).
generation(tanaka_yuki, 1).
parent(tanaka_kenji, tanaka_yuki).
parent(tanaka_haruko, tanaka_yuki).
location(tanaka_yuki, sakuragawa).

%% Tanaka Ren
person(tanaka_ren).
first_name(tanaka_ren, 'Ren').
last_name(tanaka_ren, 'Tanaka').
full_name(tanaka_ren, 'Tanaka Ren').
gender(tanaka_ren, male).
alive(tanaka_ren).
generation(tanaka_ren, 1).
parent(tanaka_kenji, tanaka_ren).
parent(tanaka_haruko, tanaka_ren).
location(tanaka_ren, sakuragawa).

%% ============================================================
%% Suzuki Family (Temple Caretakers, Sakuragawa)
%% ============================================================

%% Suzuki Takeshi
person(suzuki_takeshi).
first_name(suzuki_takeshi, 'Takeshi').
last_name(suzuki_takeshi, 'Suzuki').
full_name(suzuki_takeshi, 'Suzuki Takeshi').
gender(suzuki_takeshi, male).
alive(suzuki_takeshi).
generation(suzuki_takeshi, 0).
founder_family(suzuki_takeshi).
child(suzuki_takeshi, suzuki_aoi).
child(suzuki_takeshi, suzuki_daiki).
spouse(suzuki_takeshi, suzuki_megumi).
location(suzuki_takeshi, sakuragawa).

%% Suzuki Megumi
person(suzuki_megumi).
first_name(suzuki_megumi, 'Megumi').
last_name(suzuki_megumi, 'Suzuki').
full_name(suzuki_megumi, 'Suzuki Megumi').
gender(suzuki_megumi, female).
alive(suzuki_megumi).
generation(suzuki_megumi, 0).
founder_family(suzuki_megumi).
child(suzuki_megumi, suzuki_aoi).
child(suzuki_megumi, suzuki_daiki).
spouse(suzuki_megumi, suzuki_takeshi).
location(suzuki_megumi, sakuragawa).

%% Suzuki Aoi
person(suzuki_aoi).
first_name(suzuki_aoi, 'Aoi').
last_name(suzuki_aoi, 'Suzuki').
full_name(suzuki_aoi, 'Suzuki Aoi').
gender(suzuki_aoi, female).
alive(suzuki_aoi).
generation(suzuki_aoi, 1).
parent(suzuki_takeshi, suzuki_aoi).
parent(suzuki_megumi, suzuki_aoi).
location(suzuki_aoi, sakuragawa).

%% Suzuki Daiki
person(suzuki_daiki).
first_name(suzuki_daiki, 'Daiki').
last_name(suzuki_daiki, 'Suzuki').
full_name(suzuki_daiki, 'Suzuki Daiki').
gender(suzuki_daiki, male).
alive(suzuki_daiki).
generation(suzuki_daiki, 1).
parent(suzuki_takeshi, suzuki_daiki).
parent(suzuki_megumi, suzuki_daiki).
location(suzuki_daiki, sakuragawa).

%% ============================================================
%% Sato Family (Office Workers, Sakuragawa)
%% ============================================================

%% Sato Hiroshi
person(sato_hiroshi).
first_name(sato_hiroshi, 'Hiroshi').
last_name(sato_hiroshi, 'Sato').
full_name(sato_hiroshi, 'Sato Hiroshi').
gender(sato_hiroshi, male).
alive(sato_hiroshi).
generation(sato_hiroshi, 0).
founder_family(sato_hiroshi).
child(sato_hiroshi, sato_sakura).
child(sato_hiroshi, sato_kaito).
spouse(sato_hiroshi, sato_naomi).
location(sato_hiroshi, sakuragawa).

%% Sato Naomi
person(sato_naomi).
first_name(sato_naomi, 'Naomi').
last_name(sato_naomi, 'Sato').
full_name(sato_naomi, 'Sato Naomi').
gender(sato_naomi, female).
alive(sato_naomi).
generation(sato_naomi, 0).
founder_family(sato_naomi).
child(sato_naomi, sato_sakura).
child(sato_naomi, sato_kaito).
spouse(sato_naomi, sato_hiroshi).
location(sato_naomi, sakuragawa).

%% Sato Sakura
person(sato_sakura).
first_name(sato_sakura, 'Sakura').
last_name(sato_sakura, 'Sato').
full_name(sato_sakura, 'Sato Sakura').
gender(sato_sakura, female).
alive(sato_sakura).
generation(sato_sakura, 1).
parent(sato_hiroshi, sato_sakura).
parent(sato_naomi, sato_sakura).
location(sato_sakura, sakuragawa).

%% Sato Kaito
person(sato_kaito).
first_name(sato_kaito, 'Kaito').
last_name(sato_kaito, 'Sato').
full_name(sato_kaito, 'Sato Kaito').
gender(sato_kaito, male).
alive(sato_kaito).
generation(sato_kaito, 1).
parent(sato_hiroshi, sato_kaito).
parent(sato_naomi, sato_kaito).
location(sato_kaito, sakuragawa).

%% ============================================================
%% Yamamoto Family (Shotengai Merchants, Sakuragawa)
%% ============================================================

%% Yamamoto Shigeru
person(yamamoto_shigeru).
first_name(yamamoto_shigeru, 'Shigeru').
last_name(yamamoto_shigeru, 'Yamamoto').
full_name(yamamoto_shigeru, 'Yamamoto Shigeru').
gender(yamamoto_shigeru, male).
alive(yamamoto_shigeru).
generation(yamamoto_shigeru, 0).
founder_family(yamamoto_shigeru).
child(yamamoto_shigeru, yamamoto_hana).
child(yamamoto_shigeru, yamamoto_sota).
spouse(yamamoto_shigeru, yamamoto_misaki).
location(yamamoto_shigeru, sakuragawa).

%% Yamamoto Misaki
person(yamamoto_misaki).
first_name(yamamoto_misaki, 'Misaki').
last_name(yamamoto_misaki, 'Yamamoto').
full_name(yamamoto_misaki, 'Yamamoto Misaki').
gender(yamamoto_misaki, female).
alive(yamamoto_misaki).
generation(yamamoto_misaki, 0).
founder_family(yamamoto_misaki).
child(yamamoto_misaki, yamamoto_hana).
child(yamamoto_misaki, yamamoto_sota).
spouse(yamamoto_misaki, yamamoto_shigeru).
location(yamamoto_misaki, sakuragawa).

%% Yamamoto Hana
person(yamamoto_hana).
first_name(yamamoto_hana, 'Hana').
last_name(yamamoto_hana, 'Yamamoto').
full_name(yamamoto_hana, 'Yamamoto Hana').
gender(yamamoto_hana, female).
alive(yamamoto_hana).
generation(yamamoto_hana, 1).
parent(yamamoto_shigeru, yamamoto_hana).
parent(yamamoto_misaki, yamamoto_hana).
location(yamamoto_hana, sakuragawa).

%% Yamamoto Sota
person(yamamoto_sota).
first_name(yamamoto_sota, 'Sota').
last_name(yamamoto_sota, 'Yamamoto').
full_name(yamamoto_sota, 'Yamamoto Sota').
gender(yamamoto_sota, male).
alive(yamamoto_sota).
generation(yamamoto_sota, 1).
parent(yamamoto_shigeru, yamamoto_sota).
parent(yamamoto_misaki, yamamoto_sota).
location(yamamoto_sota, sakuragawa).

%% ============================================================
%% Watanabe Family (Rice Farmers, Yamanoue)
%% ============================================================

%% Watanabe Isamu
person(watanabe_isamu).
first_name(watanabe_isamu, 'Isamu').
last_name(watanabe_isamu, 'Watanabe').
full_name(watanabe_isamu, 'Watanabe Isamu').
gender(watanabe_isamu, male).
alive(watanabe_isamu).
generation(watanabe_isamu, 0).
founder_family(watanabe_isamu).
child(watanabe_isamu, watanabe_mai).
child(watanabe_isamu, watanabe_ryota).
spouse(watanabe_isamu, watanabe_fumiko).
location(watanabe_isamu, yamanoue).

%% Watanabe Fumiko
person(watanabe_fumiko).
first_name(watanabe_fumiko, 'Fumiko').
last_name(watanabe_fumiko, 'Watanabe').
full_name(watanabe_fumiko, 'Watanabe Fumiko').
gender(watanabe_fumiko, female).
alive(watanabe_fumiko).
generation(watanabe_fumiko, 0).
founder_family(watanabe_fumiko).
child(watanabe_fumiko, watanabe_mai).
child(watanabe_fumiko, watanabe_ryota).
spouse(watanabe_fumiko, watanabe_isamu).
location(watanabe_fumiko, yamanoue).

%% Watanabe Mai
person(watanabe_mai).
first_name(watanabe_mai, 'Mai').
last_name(watanabe_mai, 'Watanabe').
full_name(watanabe_mai, 'Watanabe Mai').
gender(watanabe_mai, female).
alive(watanabe_mai).
generation(watanabe_mai, 1).
parent(watanabe_isamu, watanabe_mai).
parent(watanabe_fumiko, watanabe_mai).
location(watanabe_mai, yamanoue).

%% Watanabe Ryota
person(watanabe_ryota).
first_name(watanabe_ryota, 'Ryota').
last_name(watanabe_ryota, 'Watanabe').
full_name(watanabe_ryota, 'Watanabe Ryota').
gender(watanabe_ryota, male).
alive(watanabe_ryota).
generation(watanabe_ryota, 1).
parent(watanabe_isamu, watanabe_ryota).
parent(watanabe_fumiko, watanabe_ryota).
location(watanabe_ryota, yamanoue).

%% ============================================================
%% Nakamura Family (Soba Artisans, Yamanoue)
%% ============================================================

%% Nakamura Tadao
person(nakamura_tadao).
first_name(nakamura_tadao, 'Tadao').
last_name(nakamura_tadao, 'Nakamura').
full_name(nakamura_tadao, 'Nakamura Tadao').
gender(nakamura_tadao, male).
alive(nakamura_tadao).
generation(nakamura_tadao, 0).
founder_family(nakamura_tadao).
child(nakamura_tadao, nakamura_emi).
child(nakamura_tadao, nakamura_yuto).
spouse(nakamura_tadao, nakamura_chiyo).
location(nakamura_tadao, yamanoue).

%% Nakamura Chiyo
person(nakamura_chiyo).
first_name(nakamura_chiyo, 'Chiyo').
last_name(nakamura_chiyo, 'Nakamura').
full_name(nakamura_chiyo, 'Nakamura Chiyo').
gender(nakamura_chiyo, female).
alive(nakamura_chiyo).
generation(nakamura_chiyo, 0).
founder_family(nakamura_chiyo).
child(nakamura_chiyo, nakamura_emi).
child(nakamura_chiyo, nakamura_yuto).
spouse(nakamura_chiyo, nakamura_tadao).
location(nakamura_chiyo, yamanoue).

%% Nakamura Emi
person(nakamura_emi).
first_name(nakamura_emi, 'Emi').
last_name(nakamura_emi, 'Nakamura').
full_name(nakamura_emi, 'Nakamura Emi').
gender(nakamura_emi, female).
alive(nakamura_emi).
generation(nakamura_emi, 1).
parent(nakamura_tadao, nakamura_emi).
parent(nakamura_chiyo, nakamura_emi).
location(nakamura_emi, yamanoue).

%% Nakamura Yuto
person(nakamura_yuto).
first_name(nakamura_yuto, 'Yuto').
last_name(nakamura_yuto, 'Nakamura').
full_name(nakamura_yuto, 'Nakamura Yuto').
gender(nakamura_yuto, male).
alive(nakamura_yuto).
generation(nakamura_yuto, 1).
parent(nakamura_tadao, nakamura_yuto).
parent(nakamura_chiyo, nakamura_yuto).
location(nakamura_yuto, yamanoue).
