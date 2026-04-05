%% Insimul Grammars (Tracery): Modern Metropolitan
%% Source: data/worlds/modern_metropolitan/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Multicultural Urban Character Names
grammar(urban_character_names, 'urban_character_names').
grammar_description(urban_character_names, 'Diverse multicultural name generation reflecting the demographics of a modern cosmopolitan city.').
grammar_rule(urban_character_names, origin, '#givenName# #familyName#').
grammar_rule(urban_character_names, givenname, '#maleName#').
grammar_rule(urban_character_names, givenname, '#femaleName#').
grammar_rule(urban_character_names, malename, 'James').
grammar_rule(urban_character_names, malename, 'Marcus').
grammar_rule(urban_character_names, malename, 'Wei').
grammar_rule(urban_character_names, malename, 'Jamal').
grammar_rule(urban_character_names, malename, 'Andrei').
grammar_rule(urban_character_names, malename, 'Rafael').
grammar_rule(urban_character_names, malename, 'Kenji').
grammar_rule(urban_character_names, malename, 'Omar').
grammar_rule(urban_character_names, malename, 'Liam').
grammar_rule(urban_character_names, malename, 'Dmitri').
grammar_rule(urban_character_names, malename, 'Kwame').
grammar_rule(urban_character_names, malename, 'Hiroshi').
grammar_rule(urban_character_names, malename, 'Mateo').
grammar_rule(urban_character_names, malename, 'Aiden').
grammar_rule(urban_character_names, malename, 'Sanjay').
grammar_rule(urban_character_names, femalename, 'Aisha').
grammar_rule(urban_character_names, femalename, 'Sofia').
grammar_rule(urban_character_names, femalename, 'Mei').
grammar_rule(urban_character_names, femalename, 'Tatiana').
grammar_rule(urban_character_names, femalename, 'Fatou').
grammar_rule(urban_character_names, femalename, 'Elena').
grammar_rule(urban_character_names, femalename, 'Yuki').
grammar_rule(urban_character_names, femalename, 'Gabriela').
grammar_rule(urban_character_names, femalename, 'Sienna').
grammar_rule(urban_character_names, femalename, 'Anya').
grammar_rule(urban_character_names, femalename, 'Zara').
grammar_rule(urban_character_names, femalename, 'Ingrid').
grammar_rule(urban_character_names, femalename, 'Chloe').
grammar_rule(urban_character_names, femalename, 'Priya').
grammar_rule(urban_character_names, femalename, 'Lucia').
grammar_rule(urban_character_names, familyname, '#surname#').
grammar_rule(urban_character_names, surname, 'Chen').
grammar_rule(urban_character_names, surname, 'Williams').
grammar_rule(urban_character_names, surname, 'Nakamura').
grammar_rule(urban_character_names, surname, 'Okafor').
grammar_rule(urban_character_names, surname, 'Petrov').
grammar_rule(urban_character_names, surname, 'Garcia').
grammar_rule(urban_character_names, surname, 'Kim').
grammar_rule(urban_character_names, surname, 'Ibrahim').
grammar_rule(urban_character_names, surname, 'Johansson').
grammar_rule(urban_character_names, surname, 'Nguyen').
grammar_rule(urban_character_names, surname, 'Kowalski').
grammar_rule(urban_character_names, surname, 'Sharma').

%% Urban Place Names
grammar(urban_place_names, 'urban_place_names').
grammar_description(urban_place_names, 'Generation of modern city-style street and district names.').
grammar_rule(urban_place_names, origin, '#placePrefix# #placeSuffix#').
grammar_rule(urban_place_names, placeprefix, 'Park').
grammar_rule(urban_place_names, placeprefix, 'Grand').
grammar_rule(urban_place_names, placeprefix, 'Market').
grammar_rule(urban_place_names, placeprefix, 'Central').
grammar_rule(urban_place_names, placeprefix, 'Harbor').
grammar_rule(urban_place_names, placeprefix, 'Union').
grammar_rule(urban_place_names, placeprefix, 'Liberty').
grammar_rule(urban_place_names, placeprefix, 'Metro').
grammar_rule(urban_place_names, placesuffix, 'Avenue').
grammar_rule(urban_place_names, placesuffix, 'Boulevard').
grammar_rule(urban_place_names, placesuffix, 'Plaza').
grammar_rule(urban_place_names, placesuffix, 'Square').
grammar_rule(urban_place_names, placesuffix, 'Row').
grammar_rule(urban_place_names, placesuffix, 'Terrace').
grammar_rule(urban_place_names, placesuffix, 'Walk').
grammar_rule(urban_place_names, placesuffix, 'Lane').

%% Urban Business Names
grammar(urban_business_names, 'urban_business_names').
grammar_description(urban_business_names, 'Generation of contemporary business names for a modern city setting.').
grammar_rule(urban_business_names, origin, '#businessStyle#').
grammar_rule(urban_business_names, businessstyle, '#adjective# #noun#').
grammar_rule(urban_business_names, businessstyle, 'The #noun# #suffix#').
grammar_rule(urban_business_names, adjective, 'Urban').
grammar_rule(urban_business_names, adjective, 'Metro').
grammar_rule(urban_business_names, adjective, 'Artisan').
grammar_rule(urban_business_names, adjective, 'Golden').
grammar_rule(urban_business_names, adjective, 'Blue').
grammar_rule(urban_business_names, adjective, 'Neon').
grammar_rule(urban_business_names, noun, 'Bean').
grammar_rule(urban_business_names, noun, 'Vine').
grammar_rule(urban_business_names, noun, 'Press').
grammar_rule(urban_business_names, noun, 'Forge').
grammar_rule(urban_business_names, noun, 'Loft').
grammar_rule(urban_business_names, noun, 'Grid').
grammar_rule(urban_business_names, suffix, 'Co').
grammar_rule(urban_business_names, suffix, 'Lab').
grammar_rule(urban_business_names, suffix, 'Hub').
grammar_rule(urban_business_names, suffix, 'Works').
grammar_rule(urban_business_names, suffix, 'Collective').
grammar_rule(urban_business_names, suffix, 'Studio').
