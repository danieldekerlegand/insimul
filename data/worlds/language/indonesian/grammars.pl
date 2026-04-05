%% Insimul Grammars (Tracery): Indonesian Coastal Town
%% Source: data/worlds/language/indonesian/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Indonesian Character Names
grammar(indonesian_character_names, 'indonesian_character_names').
grammar_description(indonesian_character_names, 'Authentic Indonesian name generation for a contemporary Javanese coastal town. Names follow modern Indonesian naming conventions with Javanese influence.').
grammar_rule(indonesian_character_names, origin, '#givenName# #familyName#').
grammar_rule(indonesian_character_names, givenname, '#maleName#').
grammar_rule(indonesian_character_names, givenname, '#femaleName#').
grammar_rule(indonesian_character_names, malename, 'Budi').
grammar_rule(indonesian_character_names, malename, 'Agus').
grammar_rule(indonesian_character_names, malename, 'Hendra').
grammar_rule(indonesian_character_names, malename, 'Bambang').
grammar_rule(indonesian_character_names, malename, 'Eko').
grammar_rule(indonesian_character_names, malename, 'Dimas').
grammar_rule(indonesian_character_names, malename, 'Rizki').
grammar_rule(indonesian_character_names, malename, 'Arif').
grammar_rule(indonesian_character_names, malename, 'Harto').
grammar_rule(indonesian_character_names, malename, 'Fajar').
grammar_rule(indonesian_character_names, malename, 'Suryo').
grammar_rule(indonesian_character_names, malename, 'Bayu').
grammar_rule(indonesian_character_names, malename, 'Wahyu').
grammar_rule(indonesian_character_names, malename, 'Adi').
grammar_rule(indonesian_character_names, malename, 'Joko').
grammar_rule(indonesian_character_names, femalename, 'Sari').
grammar_rule(indonesian_character_names, femalename, 'Dewi').
grammar_rule(indonesian_character_names, femalename, 'Putri').
grammar_rule(indonesian_character_names, femalename, 'Wati').
grammar_rule(indonesian_character_names, femalename, 'Rina').
grammar_rule(indonesian_character_names, femalename, 'Yuni').
grammar_rule(indonesian_character_names, femalename, 'Sri').
grammar_rule(indonesian_character_names, femalename, 'Nita').
grammar_rule(indonesian_character_names, femalename, 'Ratna').
grammar_rule(indonesian_character_names, femalename, 'Mega').
grammar_rule(indonesian_character_names, femalename, 'Tuti').
grammar_rule(indonesian_character_names, femalename, 'Lestari').
grammar_rule(indonesian_character_names, femalename, 'Ayu').
grammar_rule(indonesian_character_names, femalename, 'Indah').
grammar_rule(indonesian_character_names, femalename, 'Fitri').
grammar_rule(indonesian_character_names, familyname, '#surname#').
grammar_rule(indonesian_character_names, surname, 'Suryadi').
grammar_rule(indonesian_character_names, surname, 'Wicaksono').
grammar_rule(indonesian_character_names, surname, 'Pratama').
grammar_rule(indonesian_character_names, surname, 'Kusuma').
grammar_rule(indonesian_character_names, surname, 'Santoso').
grammar_rule(indonesian_character_names, surname, 'Widodo').
grammar_rule(indonesian_character_names, surname, 'Suharto').
grammar_rule(indonesian_character_names, surname, 'Setiawan').
grammar_rule(indonesian_character_names, surname, 'Nugroho').
grammar_rule(indonesian_character_names, surname, 'Hidayat').
grammar_rule(indonesian_character_names, surname, 'Purnomo').
grammar_rule(indonesian_character_names, surname, 'Wijaya').

%% Indonesian Place Names
grammar(indonesian_place_names, 'indonesian_place_names').
grammar_description(indonesian_place_names, 'Generation of Indonesian-style place names for streets and buildings.').
grammar_rule(indonesian_place_names, origin, '#placeType# #placeQuality#').
grammar_rule(indonesian_place_names, placetype, 'Jalan').
grammar_rule(indonesian_place_names, placetype, 'Gang').
grammar_rule(indonesian_place_names, placetype, 'Lorong').
grammar_rule(indonesian_place_names, placetype, 'Kampung').
grammar_rule(indonesian_place_names, placequality, 'Merdeka').
grammar_rule(indonesian_place_names, placequality, 'Pahlawan').
grammar_rule(indonesian_place_names, placequality, 'Mawar').
grammar_rule(indonesian_place_names, placequality, 'Melati').
grammar_rule(indonesian_place_names, placequality, 'Kenanga').
grammar_rule(indonesian_place_names, placequality, 'Anggrek').
grammar_rule(indonesian_place_names, placequality, 'Bahari').
grammar_rule(indonesian_place_names, placequality, 'Sejahtera').

%% Indonesian Business Names
grammar(indonesian_business_names, 'indonesian_business_names').
grammar_description(indonesian_business_names, 'Generation of Indonesian-style business names for shops and restaurants.').
grammar_rule(indonesian_business_names, origin, '#businessType# #businessQuality#').
grammar_rule(indonesian_business_names, businesstype, 'Warung').
grammar_rule(indonesian_business_names, businesstype, 'Toko').
grammar_rule(indonesian_business_names, businesstype, 'Rumah Makan').
grammar_rule(indonesian_business_names, businesstype, 'Bengkel').
grammar_rule(indonesian_business_names, businesstype, 'Kedai').
grammar_rule(indonesian_business_names, businesstype, 'Apotek').
grammar_rule(indonesian_business_names, businessquality, 'Jaya').
grammar_rule(indonesian_business_names, businessquality, 'Makmur').
grammar_rule(indonesian_business_names, businessquality, 'Sejahtera').
grammar_rule(indonesian_business_names, businessquality, 'Berkah').
grammar_rule(indonesian_business_names, businessquality, 'Maju').
grammar_rule(indonesian_business_names, businessquality, 'Sentosa').
