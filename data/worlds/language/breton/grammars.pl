%% Insimul Grammars (Tracery): Breton Coast
%% Source: data/worlds/language/breton/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Breton Character Names
grammar(breton_character_names, 'breton_character_names').
grammar_description(breton_character_names, 'Authentic Breton name generation for a modern independent Brittany. Names follow traditional Breton naming conventions.').
grammar_rule(breton_character_names, origin, '#givenName# #familyName#').
grammar_rule(breton_character_names, givenname, '#maleName#').
grammar_rule(breton_character_names, givenname, '#femaleName#').
grammar_rule(breton_character_names, malename, 'Yann').
grammar_rule(breton_character_names, malename, 'Erwan').
grammar_rule(breton_character_names, malename, 'Goulven').
grammar_rule(breton_character_names, malename, 'Gwenael').
grammar_rule(breton_character_names, malename, 'Per').
grammar_rule(breton_character_names, malename, 'Tudual').
grammar_rule(breton_character_names, malename, 'Denez').
grammar_rule(breton_character_names, malename, 'Jakez').
grammar_rule(breton_character_names, malename, 'Herve').
grammar_rule(breton_character_names, malename, 'Loig').
grammar_rule(breton_character_names, malename, 'Mael').
grammar_rule(breton_character_names, malename, 'Ewen').
grammar_rule(breton_character_names, malename, 'Alan').
grammar_rule(breton_character_names, malename, 'Ronan').
grammar_rule(breton_character_names, malename, 'Tanguy').
grammar_rule(breton_character_names, femalename, 'Soazig').
grammar_rule(breton_character_names, femalename, 'Maiwenn').
grammar_rule(breton_character_names, femalename, 'Nolwenn').
grammar_rule(breton_character_names, femalename, 'Rozenn').
grammar_rule(breton_character_names, femalename, 'Anna').
grammar_rule(breton_character_names, femalename, 'Enora').
grammar_rule(breton_character_names, femalename, 'Sterenn').
grammar_rule(breton_character_names, femalename, 'Katell').
grammar_rule(breton_character_names, femalename, 'Annaig').
grammar_rule(breton_character_names, femalename, 'Gwenola').
grammar_rule(breton_character_names, femalename, 'Margod').
grammar_rule(breton_character_names, femalename, 'Aziliz').
grammar_rule(breton_character_names, femalename, 'Youna').
grammar_rule(breton_character_names, femalename, 'Bleuenn').
grammar_rule(breton_character_names, familyname, '#surname#').
grammar_rule(breton_character_names, surname, 'Le Goff').
grammar_rule(breton_character_names, surname, 'Kermarrec').
grammar_rule(breton_character_names, surname, 'Le Bihan').
grammar_rule(breton_character_names, surname, 'Morvan').
grammar_rule(breton_character_names, surname, 'Riou').
grammar_rule(breton_character_names, surname, 'Quere').
grammar_rule(breton_character_names, surname, 'Le Roux').
grammar_rule(breton_character_names, surname, 'Le Corre').
grammar_rule(breton_character_names, surname, 'Hamon').
grammar_rule(breton_character_names, surname, 'Tanguy').
grammar_rule(breton_character_names, surname, 'Le Floch').

%% Breton Place Names
grammar(breton_place_names, 'breton_place_names').
grammar_description(breton_place_names, 'Generation of Breton-style place names for streets and landmarks.').
grammar_rule(breton_place_names, origin, '#placeType# #placeElement#').
grammar_rule(breton_place_names, placetype, 'Straed').
grammar_rule(breton_place_names, placetype, 'Hent').
grammar_rule(breton_place_names, placetype, 'Plas').
grammar_rule(breton_place_names, placetype, 'Liorzhenn').
grammar_rule(breton_place_names, placeelement, 'ar Mor').
grammar_rule(breton_place_names, placeelement, 'ar Pesked').
grammar_rule(breton_place_names, placeelement, 'an Iliz').
grammar_rule(breton_place_names, placeelement, 'ar Vro').
grammar_rule(breton_place_names, placeelement, 'ar Gwez').
grammar_rule(breton_place_names, placeelement, 'ar Lann').
grammar_rule(breton_place_names, placeelement, 'ar Mein').
grammar_rule(breton_place_names, placeelement, 'ar Feunteun').

%% Breton Business Names
grammar(breton_business_names, 'breton_business_names').
grammar_description(breton_business_names, 'Generation of Breton-style business names for shops and restaurants.').
grammar_rule(breton_business_names, origin, '#businessType# #businessQuality#').
grammar_rule(breton_business_names, businesstype, 'Krampouezhenn').
grammar_rule(breton_business_names, businesstype, 'Ti-Debri').
grammar_rule(breton_business_names, businesstype, 'Stal').
grammar_rule(breton_business_names, businesstype, 'Levrdi').
grammar_rule(breton_business_names, businesstype, 'Tavarn').
grammar_rule(breton_business_names, businesstype, 'Baraerezh').
grammar_rule(breton_business_names, businessquality, 'Ar Mor').
grammar_rule(breton_business_names, businessquality, 'Ar Vro').
grammar_rule(breton_business_names, businessquality, 'Breizh').
grammar_rule(breton_business_names, businessquality, 'An Tiegezh').
grammar_rule(breton_business_names, businessquality, 'Ar Pesked').
grammar_rule(breton_business_names, businessquality, 'Ar Sistr').
