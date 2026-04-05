%% Insimul Grammars (Tracery): Arabic Coastal Town
%% Source: data/worlds/language/arabic/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 — grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 — grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Arabic Character Names
grammar(arabic_character_names, 'arabic_character_names').
grammar_description(arabic_character_names, 'Authentic Arabic name generation for a contemporary Arab coastal town. Names follow modern Arabic naming conventions.').
grammar_rule(arabic_character_names, origin, '#givenName# #familyName#').
grammar_rule(arabic_character_names, givenname, '#maleName#').
grammar_rule(arabic_character_names, givenname, '#femaleName#').
grammar_rule(arabic_character_names, malename, 'Omar').
grammar_rule(arabic_character_names, malename, 'Khalid').
grammar_rule(arabic_character_names, malename, 'Ibrahim').
grammar_rule(arabic_character_names, malename, 'Ahmed').
grammar_rule(arabic_character_names, malename, 'Yusuf').
grammar_rule(arabic_character_names, malename, 'Samir').
grammar_rule(arabic_character_names, malename, 'Tariq').
grammar_rule(arabic_character_names, malename, 'Mahmoud').
grammar_rule(arabic_character_names, malename, 'Adel').
grammar_rule(arabic_character_names, malename, 'Rami').
grammar_rule(arabic_character_names, malename, 'Kareem').
grammar_rule(arabic_character_names, malename, 'Walid').
grammar_rule(arabic_character_names, malename, 'Nabil').
grammar_rule(arabic_character_names, malename, 'Faisal').
grammar_rule(arabic_character_names, malename, 'Hassan').
grammar_rule(arabic_character_names, femalename, 'Fatima').
grammar_rule(arabic_character_names, femalename, 'Layla').
grammar_rule(arabic_character_names, femalename, 'Amira').
grammar_rule(arabic_character_names, femalename, 'Nadia').
grammar_rule(arabic_character_names, femalename, 'Sara').
grammar_rule(arabic_character_names, femalename, 'Huda').
grammar_rule(arabic_character_names, femalename, 'Leila').
grammar_rule(arabic_character_names, femalename, 'Dina').
grammar_rule(arabic_character_names, femalename, 'Samia').
grammar_rule(arabic_character_names, femalename, 'Noura').
grammar_rule(arabic_character_names, femalename, 'Rana').
grammar_rule(arabic_character_names, femalename, 'Mona').
grammar_rule(arabic_character_names, femalename, 'Yasmin').
grammar_rule(arabic_character_names, femalename, 'Dalal').
grammar_rule(arabic_character_names, femalename, 'Mariam').
grammar_rule(arabic_character_names, familyname, '#surname#').
grammar_rule(arabic_character_names, familyname, 'al-#surname#').
grammar_rule(arabic_character_names, surname, 'Hassan').
grammar_rule(arabic_character_names, surname, 'Rashid').
grammar_rule(arabic_character_names, surname, 'Mansour').
grammar_rule(arabic_character_names, surname, 'Khoury').
grammar_rule(arabic_character_names, surname, 'Jabari').
grammar_rule(arabic_character_names, surname, 'Nasser').
grammar_rule(arabic_character_names, surname, 'Saleh').
grammar_rule(arabic_character_names, surname, 'Qasim').
grammar_rule(arabic_character_names, surname, 'Darwish').
grammar_rule(arabic_character_names, surname, 'Haddad').
grammar_rule(arabic_character_names, surname, 'Sabbagh').
grammar_rule(arabic_character_names, surname, 'Najjar').

%% Arabic Place Names
grammar(arabic_place_names, 'arabic_place_names').
grammar_description(arabic_place_names, 'Generation of Arabic-style place names for streets and buildings.').
grammar_rule(arabic_place_names, origin, '#placeType# al-#placeQuality#').
grammar_rule(arabic_place_names, placetype, 'Sharia').
grammar_rule(arabic_place_names, placetype, 'Zuqaq').
grammar_rule(arabic_place_names, placetype, 'Tariq').
grammar_rule(arabic_place_names, placetype, 'Midan').
grammar_rule(arabic_place_names, placequality, 'Nakhil').
grammar_rule(arabic_place_names, placequality, 'Bahr').
grammar_rule(arabic_place_names, placequality, 'Souq').
grammar_rule(arabic_place_names, placequality, 'Masjid').
grammar_rule(arabic_place_names, placequality, 'Jami').
grammar_rule(arabic_place_names, placequality, 'Zaytun').
grammar_rule(arabic_place_names, placequality, 'Nur').
grammar_rule(arabic_place_names, placequality, 'Salam').

%% Arabic Business Names
grammar(arabic_business_names, 'arabic_business_names').
grammar_description(arabic_business_names, 'Generation of Arabic-style business names for shops and restaurants.').
grammar_rule(arabic_business_names, origin, '#businessType# #businessQuality#').
grammar_rule(arabic_business_names, businesstype, 'Mataam').
grammar_rule(arabic_business_names, businesstype, 'Makhbaz').
grammar_rule(arabic_business_names, businesstype, 'Dukkan').
grammar_rule(arabic_business_names, businesstype, 'Maktaba').
grammar_rule(arabic_business_names, businesstype, 'Cafe').
grammar_rule(arabic_business_names, businesstype, 'Saydaliyya').
grammar_rule(arabic_business_names, businessquality, 'al-Khair').
grammar_rule(arabic_business_names, businessquality, 'al-Nur').
grammar_rule(arabic_business_names, businessquality, 'al-Salam').
grammar_rule(arabic_business_names, businessquality, 'al-Bahr').
grammar_rule(arabic_business_names, businessquality, 'al-Shifa').
grammar_rule(arabic_business_names, businessquality, 'al-Baraka').
