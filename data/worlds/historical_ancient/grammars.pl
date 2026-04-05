%% Insimul Grammars (Tracery): Historical Ancient World
%% Source: data/worlds/historical_ancient/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Ancient Character Names
grammar(ancient_character_names, 'ancient_character_names').
grammar_description(ancient_character_names, 'Name generation for citizens of the ancient Greek, Roman, and Egyptian world.').
grammar_rule(ancient_character_names, origin, '#givenName# #familyName#').
grammar_rule(ancient_character_names, givenname, '#maleName#').
grammar_rule(ancient_character_names, givenname, '#femaleName#').
grammar_rule(ancient_character_names, malename, 'Themistokles').
grammar_rule(ancient_character_names, malename, 'Nikias').
grammar_rule(ancient_character_names, malename, 'Kleomenes').
grammar_rule(ancient_character_names, malename, 'Demades').
grammar_rule(ancient_character_names, malename, 'Perikles').
grammar_rule(ancient_character_names, malename, 'Sokrates').
grammar_rule(ancient_character_names, malename, 'Lysandros').
grammar_rule(ancient_character_names, malename, 'Herodotus').
grammar_rule(ancient_character_names, malename, 'Lucius').
grammar_rule(ancient_character_names, malename, 'Marcus').
grammar_rule(ancient_character_names, malename, 'Gaius').
grammar_rule(ancient_character_names, malename, 'Spartacus').
grammar_rule(ancient_character_names, malename, 'Khaemwaset').
grammar_rule(ancient_character_names, malename, 'Paneb').
grammar_rule(ancient_character_names, malename, 'Amenhotep').
grammar_rule(ancient_character_names, femalename, 'Aspasia').
grammar_rule(ancient_character_names, femalename, 'Phaidra').
grammar_rule(ancient_character_names, femalename, 'Archippe').
grammar_rule(ancient_character_names, femalename, 'Cornelia').
grammar_rule(ancient_character_names, femalename, 'Valeria').
grammar_rule(ancient_character_names, femalename, 'Nefertari').
grammar_rule(ancient_character_names, femalename, 'Meritamun').
grammar_rule(ancient_character_names, femalename, 'Hypatia').
grammar_rule(ancient_character_names, femalename, 'Kleopatra').
grammar_rule(ancient_character_names, familyname, 'of #greekDeme#').
grammar_rule(ancient_character_names, familyname, '#romanGens#').
grammar_rule(ancient_character_names, greekdeme, 'Phrearrhioi').
grammar_rule(ancient_character_names, greekdeme, 'Alopeke').
grammar_rule(ancient_character_names, greekdeme, 'Kerameikos').
grammar_rule(ancient_character_names, greekdeme, 'Piraeus').
grammar_rule(ancient_character_names, greekdeme, 'Miletos').
grammar_rule(ancient_character_names, greekdeme, 'Kollytos').
grammar_rule(ancient_character_names, romangens, 'Aurelius').
grammar_rule(ancient_character_names, romangens, 'Vetutius').
grammar_rule(ancient_character_names, romangens, 'Cornelius').
grammar_rule(ancient_character_names, romangens, 'Maximus').
grammar_rule(ancient_character_names, romangens, 'Thrax').

%% Ancient Place Names
grammar(ancient_place_names, 'ancient_place_names').
grammar_description(ancient_place_names, 'Generation of ancient-style place names for public buildings and districts.').
grammar_rule(ancient_place_names, origin, '#placeType# of #placeQuality#').
grammar_rule(ancient_place_names, placetype, 'Agora').
grammar_rule(ancient_place_names, placetype, 'Stoa').
grammar_rule(ancient_place_names, placetype, 'Forum').
grammar_rule(ancient_place_names, placetype, 'Templum').
grammar_rule(ancient_place_names, placetype, 'Thermae').
grammar_rule(ancient_place_names, placetype, 'Basilica').
grammar_rule(ancient_place_names, placequality, 'Athena').
grammar_rule(ancient_place_names, placequality, 'Apollo').
grammar_rule(ancient_place_names, placequality, 'Jupiter').
grammar_rule(ancient_place_names, placequality, 'Amun-Ra').
grammar_rule(ancient_place_names, placequality, 'Dionysos').
grammar_rule(ancient_place_names, placequality, 'Hephaestus').
grammar_rule(ancient_place_names, placequality, 'Isis').

%% Ancient Business Names
grammar(ancient_business_names, 'ancient_business_names').
grammar_description(ancient_business_names, 'Generation of ancient-style workshop and shop names.').
grammar_rule(ancient_business_names, origin, '#shopType# #qualifier#').
grammar_rule(ancient_business_names, shoptype, 'Thermopolium').
grammar_rule(ancient_business_names, shoptype, 'Taberna').
grammar_rule(ancient_business_names, shoptype, 'Ergasterion').
grammar_rule(ancient_business_names, shoptype, 'Emporion').
grammar_rule(ancient_business_names, shoptype, 'Officina').
grammar_rule(ancient_business_names, qualifier, 'of the Lion').
grammar_rule(ancient_business_names, qualifier, 'of the Olive').
grammar_rule(ancient_business_names, qualifier, 'of the Eagle').
grammar_rule(ancient_business_names, qualifier, 'of the Dolphin').
grammar_rule(ancient_business_names, qualifier, 'of the Sphinx').
grammar_rule(ancient_business_names, qualifier, 'of the Laurel').
