%% Insimul Grammars (Tracery): Japanese Town
%% Source: data/worlds/language/japanese/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Japanese Character Names (Family name FIRST)
grammar(japanese_character_names, 'japanese_character_names').
grammar_description(japanese_character_names, 'Authentic Japanese name generation for a contemporary Kansai town. Names follow Japanese convention: family name first, given name second.').
grammar_rule(japanese_character_names, origin, '#familyName# #givenName#').
grammar_rule(japanese_character_names, givenname, '#maleName#').
grammar_rule(japanese_character_names, givenname, '#femaleName#').
grammar_rule(japanese_character_names, malename, 'Kenji').
grammar_rule(japanese_character_names, malename, 'Takeshi').
grammar_rule(japanese_character_names, malename, 'Hiroshi').
grammar_rule(japanese_character_names, malename, 'Shigeru').
grammar_rule(japanese_character_names, malename, 'Isamu').
grammar_rule(japanese_character_names, malename, 'Tadao').
grammar_rule(japanese_character_names, malename, 'Ren').
grammar_rule(japanese_character_names, malename, 'Daiki').
grammar_rule(japanese_character_names, malename, 'Kaito').
grammar_rule(japanese_character_names, malename, 'Sota').
grammar_rule(japanese_character_names, malename, 'Ryota').
grammar_rule(japanese_character_names, malename, 'Yuto').
grammar_rule(japanese_character_names, malename, 'Haruki').
grammar_rule(japanese_character_names, malename, 'Akira').
grammar_rule(japanese_character_names, malename, 'Taro').
grammar_rule(japanese_character_names, femalename, 'Haruko').
grammar_rule(japanese_character_names, femalename, 'Megumi').
grammar_rule(japanese_character_names, femalename, 'Naomi').
grammar_rule(japanese_character_names, femalename, 'Misaki').
grammar_rule(japanese_character_names, femalename, 'Fumiko').
grammar_rule(japanese_character_names, femalename, 'Chiyo').
grammar_rule(japanese_character_names, femalename, 'Yuki').
grammar_rule(japanese_character_names, femalename, 'Aoi').
grammar_rule(japanese_character_names, femalename, 'Sakura').
grammar_rule(japanese_character_names, femalename, 'Hana').
grammar_rule(japanese_character_names, femalename, 'Mai').
grammar_rule(japanese_character_names, femalename, 'Emi').
grammar_rule(japanese_character_names, femalename, 'Yumi').
grammar_rule(japanese_character_names, femalename, 'Ayumi').
grammar_rule(japanese_character_names, femalename, 'Rina').
grammar_rule(japanese_character_names, familyname, '#surname#').
grammar_rule(japanese_character_names, surname, 'Tanaka').
grammar_rule(japanese_character_names, surname, 'Suzuki').
grammar_rule(japanese_character_names, surname, 'Sato').
grammar_rule(japanese_character_names, surname, 'Yamamoto').
grammar_rule(japanese_character_names, surname, 'Watanabe').
grammar_rule(japanese_character_names, surname, 'Nakamura').
grammar_rule(japanese_character_names, surname, 'Ito').
grammar_rule(japanese_character_names, surname, 'Kobayashi').
grammar_rule(japanese_character_names, surname, 'Yamada').
grammar_rule(japanese_character_names, surname, 'Takahashi').
grammar_rule(japanese_character_names, surname, 'Hayashi').
grammar_rule(japanese_character_names, surname, 'Mori').

%% Japanese Place Names
grammar(japanese_place_names, 'japanese_place_names').
grammar_description(japanese_place_names, 'Generation of Japanese-style place names for streets and districts.').
grammar_rule(japanese_place_names, origin, '#placeElement#-#placeSuffix#').
grammar_rule(japanese_place_names, placeelement, 'Sakura').
grammar_rule(japanese_place_names, placeelement, 'Matsu').
grammar_rule(japanese_place_names, placeelement, 'Ume').
grammar_rule(japanese_place_names, placeelement, 'Kawa').
grammar_rule(japanese_place_names, placeelement, 'Yama').
grammar_rule(japanese_place_names, placeelement, 'Midori').
grammar_rule(japanese_place_names, placeelement, 'Hikari').
grammar_rule(japanese_place_names, placeelement, 'Nishi').
grammar_rule(japanese_place_names, placesuffix, 'dori').
grammar_rule(japanese_place_names, placesuffix, 'machi').
grammar_rule(japanese_place_names, placesuffix, 'cho').
grammar_rule(japanese_place_names, placesuffix, 'oka').
grammar_rule(japanese_place_names, placesuffix, 'gawa').

%% Japanese Business Names
grammar(japanese_business_names, 'japanese_business_names').
grammar_description(japanese_business_names, 'Generation of Japanese-style business names for shops and restaurants.').
grammar_rule(japanese_business_names, origin, '#businessType# #businessQuality#').
grammar_rule(japanese_business_names, businesstype, 'Ramen').
grammar_rule(japanese_business_names, businesstype, 'Soba').
grammar_rule(japanese_business_names, businesstype, 'Sushi').
grammar_rule(japanese_business_names, businesstype, 'Izakaya').
grammar_rule(japanese_business_names, businesstype, 'Kissaten').
grammar_rule(japanese_business_names, businesstype, 'Yaoya').
grammar_rule(japanese_business_names, businessquality, 'Ichiban').
grammar_rule(japanese_business_names, businessquality, 'Kintaro').
grammar_rule(japanese_business_names, businessquality, 'Sakura').
grammar_rule(japanese_business_names, businessquality, 'Tanuki').
grammar_rule(japanese_business_names, businessquality, 'Komorebi').
grammar_rule(japanese_business_names, businessquality, 'Tsuki').
