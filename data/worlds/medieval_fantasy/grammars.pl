%% Insimul Grammars (Tracery): Medieval Fantasy
%% Source: data/worlds/medieval_fantasy/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Medieval Character Names
grammar(medieval_character_names, 'medieval_character_names').
grammar_description(medieval_character_names, 'Name generation for a medieval fantasy setting with knights, sorcerers, and commoners.').
grammar_rule(medieval_character_names, origin, '#givenName# #familyName#').
grammar_rule(medieval_character_names, givenname, '#maleName#').
grammar_rule(medieval_character_names, givenname, '#femaleName#').
grammar_rule(medieval_character_names, malename, 'Aldric').
grammar_rule(medieval_character_names, malename, 'Gareth').
grammar_rule(medieval_character_names, malename, 'Cedric').
grammar_rule(medieval_character_names, malename, 'Bran').
grammar_rule(medieval_character_names, malename, 'Rowan').
grammar_rule(medieval_character_names, malename, 'Fenwick').
grammar_rule(medieval_character_names, malename, 'Kael').
grammar_rule(medieval_character_names, malename, 'Durek').
grammar_rule(medieval_character_names, malename, 'Osric').
grammar_rule(medieval_character_names, malename, 'Theron').
grammar_rule(medieval_character_names, malename, 'Hadrian').
grammar_rule(medieval_character_names, malename, 'Lucian').
grammar_rule(medieval_character_names, malename, 'Wulfric').
grammar_rule(medieval_character_names, malename, 'Edmund').
grammar_rule(medieval_character_names, malename, 'Roland').
grammar_rule(medieval_character_names, femalename, 'Maren').
grammar_rule(medieval_character_names, femalename, 'Elspeth').
grammar_rule(medieval_character_names, femalename, 'Isolde').
grammar_rule(medieval_character_names, femalename, 'Mirabel').
grammar_rule(medieval_character_names, femalename, 'Elara').
grammar_rule(medieval_character_names, femalename, 'Liriel').
grammar_rule(medieval_character_names, femalename, 'Marta').
grammar_rule(medieval_character_names, femalename, 'Rowena').
grammar_rule(medieval_character_names, femalename, 'Gwynevere').
grammar_rule(medieval_character_names, femalename, 'Brigid').
grammar_rule(medieval_character_names, femalename, 'Sera').
grammar_rule(medieval_character_names, femalename, 'Alys').
grammar_rule(medieval_character_names, femalename, 'Talia').
grammar_rule(medieval_character_names, femalename, 'Helene').
grammar_rule(medieval_character_names, femalename, 'Yvaine').
grammar_rule(medieval_character_names, familyname, '#surname#').
grammar_rule(medieval_character_names, surname, 'Valdris').
grammar_rule(medieval_character_names, surname, 'Ironhand').
grammar_rule(medieval_character_names, surname, 'Ashford').
grammar_rule(medieval_character_names, surname, 'Ravencrest').
grammar_rule(medieval_character_names, surname, 'Thornwick').
grammar_rule(medieval_character_names, surname, 'Shadowmere').
grammar_rule(medieval_character_names, surname, 'Willowshade').
grammar_rule(medieval_character_names, surname, 'Bramble').
grammar_rule(medieval_character_names, surname, 'Stonehammer').
grammar_rule(medieval_character_names, surname, 'Blackthorn').
grammar_rule(medieval_character_names, surname, 'Greymane').
grammar_rule(medieval_character_names, surname, 'Duskwood').

%% Medieval Place Names
grammar(medieval_place_names, 'medieval_place_names').
grammar_description(medieval_place_names, 'Generation of medieval-style place names for roads and districts.').
grammar_rule(medieval_place_names, origin, '#placePrefix# #placeSuffix#').
grammar_rule(medieval_place_names, placeprefix, 'Raven').
grammar_rule(medieval_place_names, placeprefix, 'Iron').
grammar_rule(medieval_place_names, placeprefix, 'Stone').
grammar_rule(medieval_place_names, placeprefix, 'Silver').
grammar_rule(medieval_place_names, placeprefix, 'Thorn').
grammar_rule(medieval_place_names, placeprefix, 'Elm').
grammar_rule(medieval_place_names, placeprefix, 'Oak').
grammar_rule(medieval_place_names, placeprefix, 'Shadow').
grammar_rule(medieval_place_names, placesuffix, 'gate').
grammar_rule(medieval_place_names, placesuffix, 'ford').
grammar_rule(medieval_place_names, placesuffix, 'watch').
grammar_rule(medieval_place_names, placesuffix, 'hollow').
grammar_rule(medieval_place_names, placesuffix, 'moor').
grammar_rule(medieval_place_names, placesuffix, 'bridge').
grammar_rule(medieval_place_names, placesuffix, 'keep').
grammar_rule(medieval_place_names, placesuffix, 'vale').

%% Medieval Business Names
grammar(medieval_business_names, 'medieval_business_names').
grammar_description(medieval_business_names, 'Generation of medieval-style shop and tavern names.').
grammar_rule(medieval_business_names, origin, 'The #adjective# #noun#').
grammar_rule(medieval_business_names, adjective, 'Gilded').
grammar_rule(medieval_business_names, adjective, 'Iron').
grammar_rule(medieval_business_names, adjective, 'Silver').
grammar_rule(medieval_business_names, adjective, 'Rusty').
grammar_rule(medieval_business_names, adjective, 'Golden').
grammar_rule(medieval_business_names, adjective, 'Crimson').
grammar_rule(medieval_business_names, adjective, 'Broken').
grammar_rule(medieval_business_names, adjective, 'Merry').
grammar_rule(medieval_business_names, noun, 'Flagon').
grammar_rule(medieval_business_names, noun, 'Crown').
grammar_rule(medieval_business_names, noun, 'Anvil').
grammar_rule(medieval_business_names, noun, 'Stag').
grammar_rule(medieval_business_names, noun, 'Dragon').
grammar_rule(medieval_business_names, noun, 'Blade').
grammar_rule(medieval_business_names, noun, 'Rose').
grammar_rule(medieval_business_names, noun, 'Shield').
