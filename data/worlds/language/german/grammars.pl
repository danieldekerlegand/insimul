%% Insimul Grammars (Tracery): German Rhineland
%% Source: data/worlds/language/german/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% German Character Names
grammar(german_character_names, 'german_character_names').
grammar_description(german_character_names, 'Authentic German name generation for a contemporary Rhineland town. Names follow modern German naming conventions.').
grammar_rule(german_character_names, origin, '#givenName# #familyName#').
grammar_rule(german_character_names, givenname, '#maleName#').
grammar_rule(german_character_names, givenname, '#femaleName#').
grammar_rule(german_character_names, malename, 'Hans').
grammar_rule(german_character_names, malename, 'Klaus').
grammar_rule(german_character_names, malename, 'Dieter').
grammar_rule(german_character_names, malename, 'Friedrich').
grammar_rule(german_character_names, malename, 'Wolfgang').
grammar_rule(german_character_names, malename, 'Heinrich').
grammar_rule(german_character_names, malename, 'Tobias').
grammar_rule(german_character_names, malename, 'Markus').
grammar_rule(german_character_names, malename, 'Stefan').
grammar_rule(german_character_names, malename, 'Lukas').
grammar_rule(german_character_names, malename, 'Felix').
grammar_rule(german_character_names, malename, 'Thomas').
grammar_rule(german_character_names, malename, 'Maximilian').
grammar_rule(german_character_names, malename, 'Florian').
grammar_rule(german_character_names, malename, 'Sebastian').
grammar_rule(german_character_names, femalename, 'Ingrid').
grammar_rule(german_character_names, femalename, 'Petra').
grammar_rule(german_character_names, femalename, 'Monika').
grammar_rule(german_character_names, femalename, 'Elisabeth').
grammar_rule(german_character_names, femalename, 'Brigitte').
grammar_rule(german_character_names, femalename, 'Renate').
grammar_rule(german_character_names, femalename, 'Anna').
grammar_rule(german_character_names, femalename, 'Lena').
grammar_rule(german_character_names, femalename, 'Julia').
grammar_rule(german_character_names, femalename, 'Sophie').
grammar_rule(german_character_names, femalename, 'Katrin').
grammar_rule(german_character_names, femalename, 'Marie').
grammar_rule(german_character_names, femalename, 'Hannah').
grammar_rule(german_character_names, femalename, 'Lisa').
grammar_rule(german_character_names, femalename, 'Clara').
grammar_rule(german_character_names, familyname, '#surname#').
grammar_rule(german_character_names, surname, 'Mueller').
grammar_rule(german_character_names, surname, 'Schmidt').
grammar_rule(german_character_names, surname, 'Fischer').
grammar_rule(german_character_names, surname, 'Weber').
grammar_rule(german_character_names, surname, 'Wagner').
grammar_rule(german_character_names, surname, 'Schaefer').
grammar_rule(german_character_names, surname, 'Becker').
grammar_rule(german_character_names, surname, 'Hoffmann').
grammar_rule(german_character_names, surname, 'Zimmermann').
grammar_rule(german_character_names, surname, 'Braun').
grammar_rule(german_character_names, surname, 'Krueger').
grammar_rule(german_character_names, surname, 'Richter').

%% German Place Names
grammar(german_place_names, 'german_place_names').
grammar_description(german_place_names, 'Generation of German-style place names for streets and buildings.').
grammar_rule(german_place_names, origin, '#placeType##placeSuffix#').
grammar_rule(german_place_names, placetype, 'Markt').
grammar_rule(german_place_names, placetype, 'Kirch').
grammar_rule(german_place_names, placetype, 'Burg').
grammar_rule(german_place_names, placetype, 'Berg').
grammar_rule(german_place_names, placetype, 'Wein').
grammar_rule(german_place_names, placetype, 'Rhein').
grammar_rule(german_place_names, placetype, 'Linden').
grammar_rule(german_place_names, placetype, 'Rosen').
grammar_rule(german_place_names, placesuffix, 'strasse').
grammar_rule(german_place_names, placesuffix, 'gasse').
grammar_rule(german_place_names, placesuffix, 'weg').
grammar_rule(german_place_names, placesuffix, 'platz').
grammar_rule(german_place_names, placesuffix, 'ring').
grammar_rule(german_place_names, placesuffix, 'allee').

%% German Business Names
grammar(german_business_names, 'german_business_names').
grammar_description(german_business_names, 'Generation of German-style business names for shops and restaurants.').
grammar_rule(german_business_names, origin, '#businessType# #businessQuality#').
grammar_rule(german_business_names, businesstype, 'Baeckerei').
grammar_rule(german_business_names, businesstype, 'Metzgerei').
grammar_rule(german_business_names, businesstype, 'Buchhandlung').
grammar_rule(german_business_names, businesstype, 'Gasthaus').
grammar_rule(german_business_names, businesstype, 'Weinstube').
grammar_rule(german_business_names, businesstype, 'Apotheke').
grammar_rule(german_business_names, businesstype, 'Konditorei').
grammar_rule(german_business_names, businessquality, 'am Markt').
grammar_rule(german_business_names, businessquality, 'am Rhein').
grammar_rule(german_business_names, businessquality, 'zur Linde').
grammar_rule(german_business_names, businessquality, 'zum Goldenen Fass').
grammar_rule(german_business_names, businessquality, 'am Dom').
grammar_rule(german_business_names, businessquality, 'zum Weinberg').
