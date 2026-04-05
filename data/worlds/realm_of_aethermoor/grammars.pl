%% Insimul Grammars (Tracery): Realm of Aethermoor
%% Source: data/worlds/realm_of_aethermoor/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Fantasy Character Names
grammar(fantasy_character_names, 'fantasy_character_names').
grammar_description(fantasy_character_names, 'Name generation for the multi-race inhabitants of the Realm of Aethermoor.').
grammar_rule(fantasy_character_names, origin, '#givenName# #familyName#').
grammar_rule(fantasy_character_names, givenname, '#maleName#').
grammar_rule(fantasy_character_names, givenname, '#femaleName#').
grammar_rule(fantasy_character_names, malename, 'Aldric').
grammar_rule(fantasy_character_names, malename, 'Aragorn').
grammar_rule(fantasy_character_names, malename, 'Thorin').
grammar_rule(fantasy_character_names, malename, 'Gimli').
grammar_rule(fantasy_character_names, malename, 'Legolas').
grammar_rule(fantasy_character_names, malename, 'Boromir').
grammar_rule(fantasy_character_names, malename, 'Gandalf').
grammar_rule(fantasy_character_names, malename, 'Grommash').
grammar_rule(fantasy_character_names, malename, 'Cedric').
grammar_rule(fantasy_character_names, malename, 'Rowan').
grammar_rule(fantasy_character_names, malename, 'Theron').
grammar_rule(fantasy_character_names, malename, 'Kael').
grammar_rule(fantasy_character_names, femalename, 'Eleanor').
grammar_rule(fantasy_character_names, femalename, 'Galadriel').
grammar_rule(fantasy_character_names, femalename, 'Arwen').
grammar_rule(fantasy_character_names, femalename, 'Seraphina').
grammar_rule(fantasy_character_names, femalename, 'Isolde').
grammar_rule(fantasy_character_names, femalename, 'Brynn').
grammar_rule(fantasy_character_names, femalename, 'Rowena').
grammar_rule(fantasy_character_names, femalename, 'Elowen').
grammar_rule(fantasy_character_names, femalename, 'Lyra').
grammar_rule(fantasy_character_names, femalename, 'Miriel').
grammar_rule(fantasy_character_names, femalename, 'Talia').
grammar_rule(fantasy_character_names, femalename, 'Vanya').
grammar_rule(fantasy_character_names, familyname, '#surname#').
grammar_rule(fantasy_character_names, surname, 'Stormborne').
grammar_rule(fantasy_character_names, surname, 'Moonwhisper').
grammar_rule(fantasy_character_names, surname, 'Ironbeard').
grammar_rule(fantasy_character_names, surname, 'Greenleaf').
grammar_rule(fantasy_character_names, surname, 'Brightforge').
grammar_rule(fantasy_character_names, surname, 'Shadowmere').
grammar_rule(fantasy_character_names, surname, 'Thornwall').
grammar_rule(fantasy_character_names, surname, 'Dawnseeker').
grammar_rule(fantasy_character_names, surname, 'Frosthelm').
grammar_rule(fantasy_character_names, surname, 'Ashwood').
grammar_rule(fantasy_character_names, surname, 'Starweaver').
grammar_rule(fantasy_character_names, surname, 'Crystalvein').

%% Fantasy Place Names
grammar(fantasy_place_names, 'fantasy_place_names').
grammar_description(fantasy_place_names, 'Generation of fantasy location names for the Realm of Aethermoor.').
grammar_rule(fantasy_place_names, origin, '#prefix# #suffix#').
grammar_rule(fantasy_place_names, prefix, 'Crystal').
grammar_rule(fantasy_place_names, prefix, 'Shadow').
grammar_rule(fantasy_place_names, prefix, 'Moon').
grammar_rule(fantasy_place_names, prefix, 'Star').
grammar_rule(fantasy_place_names, prefix, 'Iron').
grammar_rule(fantasy_place_names, prefix, 'Storm').
grammar_rule(fantasy_place_names, prefix, 'Ember').
grammar_rule(fantasy_place_names, suffix, 'Spire').
grammar_rule(fantasy_place_names, suffix, 'Hold').
grammar_rule(fantasy_place_names, suffix, 'Grove').
grammar_rule(fantasy_place_names, suffix, 'Keep').
grammar_rule(fantasy_place_names, suffix, 'Hollow').
grammar_rule(fantasy_place_names, suffix, 'Haven').
grammar_rule(fantasy_place_names, suffix, 'Gate').
grammar_rule(fantasy_place_names, suffix, 'Well').

%% Fantasy Business Names
grammar(fantasy_business_names, 'fantasy_business_names').
grammar_description(fantasy_business_names, 'Generation of fantasy-themed shop and establishment names.').
grammar_rule(fantasy_business_names, origin, 'The #adjective# #noun#').
grammar_rule(fantasy_business_names, adjective, 'Gilded').
grammar_rule(fantasy_business_names, adjective, 'Enchanted').
grammar_rule(fantasy_business_names, adjective, 'Shimmering').
grammar_rule(fantasy_business_names, adjective, 'Whispering').
grammar_rule(fantasy_business_names, adjective, 'Arcane').
grammar_rule(fantasy_business_names, adjective, 'Golden').
grammar_rule(fantasy_business_names, noun, 'Goblet').
grammar_rule(fantasy_business_names, noun, 'Anvil').
grammar_rule(fantasy_business_names, noun, 'Scroll').
grammar_rule(fantasy_business_names, noun, 'Cauldron').
grammar_rule(fantasy_business_names, noun, 'Tome').
grammar_rule(fantasy_business_names, noun, 'Chalice').
