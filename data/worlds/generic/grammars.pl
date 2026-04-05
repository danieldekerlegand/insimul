%% Insimul Grammars (Tracery): Generic Fantasy World
%% Source: data/worlds/generic/grammars.pl
%% Created: 2026-04-03
%% Total: 4 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Fantasy Character Names
grammar(fantasy_character_names, 'fantasy_character_names').
grammar_description(fantasy_character_names, 'Standard medieval fantasy name generation for a template world. Produces balanced male and female names with common fantasy surnames.').
grammar_rule(fantasy_character_names, origin, '#givenName# #familyName#').
grammar_rule(fantasy_character_names, givenname, '#maleName#').
grammar_rule(fantasy_character_names, givenname, '#femaleName#').
grammar_rule(fantasy_character_names, malename, 'Gareth').
grammar_rule(fantasy_character_names, malename, 'Bram').
grammar_rule(fantasy_character_names, malename, 'Cedric').
grammar_rule(fantasy_character_names, malename, 'Rowan').
grammar_rule(fantasy_character_names, malename, 'Finn').
grammar_rule(fantasy_character_names, malename, 'Hale').
grammar_rule(fantasy_character_names, malename, 'Cole').
grammar_rule(fantasy_character_names, malename, 'Aldwin').
grammar_rule(fantasy_character_names, malename, 'Theron').
grammar_rule(fantasy_character_names, malename, 'Duncan').
grammar_rule(fantasy_character_names, malename, 'Edric').
grammar_rule(fantasy_character_names, malename, 'Osric').
grammar_rule(fantasy_character_names, malename, 'Wendel').
grammar_rule(fantasy_character_names, malename, 'Corwin').
grammar_rule(fantasy_character_names, malename, 'Sigmund').
grammar_rule(fantasy_character_names, femalename, 'Elara').
grammar_rule(fantasy_character_names, femalename, 'Wren').
grammar_rule(fantasy_character_names, femalename, 'Mira').
grammar_rule(fantasy_character_names, femalename, 'Sera').
grammar_rule(fantasy_character_names, femalename, 'Liora').
grammar_rule(fantasy_character_names, femalename, 'Brynn').
grammar_rule(fantasy_character_names, femalename, 'Ivy').
grammar_rule(fantasy_character_names, femalename, 'Mathilde').
grammar_rule(fantasy_character_names, femalename, 'Renna').
grammar_rule(fantasy_character_names, femalename, 'Isolde').
grammar_rule(fantasy_character_names, femalename, 'Gwendolyn').
grammar_rule(fantasy_character_names, femalename, 'Helga').
grammar_rule(fantasy_character_names, femalename, 'Rowena').
grammar_rule(fantasy_character_names, femalename, 'Sybil').
grammar_rule(fantasy_character_names, femalename, 'Maren').
grammar_rule(fantasy_character_names, familyname, '#surname#').
grammar_rule(fantasy_character_names, surname, 'Aldric').
grammar_rule(fantasy_character_names, surname, 'Thorne').
grammar_rule(fantasy_character_names, surname, 'Voss').
grammar_rule(fantasy_character_names, surname, 'Ashwood').
grammar_rule(fantasy_character_names, surname, 'Marsh').
grammar_rule(fantasy_character_names, surname, 'Ironhand').
grammar_rule(fantasy_character_names, surname, 'Stonebridge').
grammar_rule(fantasy_character_names, surname, 'Blackthorn').
grammar_rule(fantasy_character_names, surname, 'Whitfield').
grammar_rule(fantasy_character_names, surname, 'Greenhollow').
grammar_rule(fantasy_character_names, surname, 'Dunmore').
grammar_rule(fantasy_character_names, surname, 'Ravencrest').

%% Fantasy Place Names
grammar(fantasy_place_names, 'fantasy_place_names').
grammar_description(fantasy_place_names, 'Generation of medieval fantasy place names for streets, landmarks, and districts.').
grammar_rule(fantasy_place_names, origin, '#prefix##suffix#').
grammar_rule(fantasy_place_names, prefix, 'Stone').
grammar_rule(fantasy_place_names, prefix, 'Iron').
grammar_rule(fantasy_place_names, prefix, 'Oak').
grammar_rule(fantasy_place_names, prefix, 'Willow').
grammar_rule(fantasy_place_names, prefix, 'Raven').
grammar_rule(fantasy_place_names, prefix, 'Moss').
grammar_rule(fantasy_place_names, prefix, 'Ash').
grammar_rule(fantasy_place_names, prefix, 'Thorn').
grammar_rule(fantasy_place_names, prefix, 'Ember').
grammar_rule(fantasy_place_names, prefix, 'Silver').
grammar_rule(fantasy_place_names, suffix, 'haven').
grammar_rule(fantasy_place_names, suffix, 'mere').
grammar_rule(fantasy_place_names, suffix, 'ford').
grammar_rule(fantasy_place_names, suffix, 'dale').
grammar_rule(fantasy_place_names, suffix, 'brook').
grammar_rule(fantasy_place_names, suffix, 'fell').
grammar_rule(fantasy_place_names, suffix, 'ridge').
grammar_rule(fantasy_place_names, suffix, 'hollow').
grammar_rule(fantasy_place_names, suffix, 'gate').
grammar_rule(fantasy_place_names, suffix, 'wick').

%% Fantasy Business Names
grammar(fantasy_business_names, 'fantasy_business_names').
grammar_description(fantasy_business_names, 'Generation of medieval fantasy shop and tavern names.').
grammar_rule(fantasy_business_names, origin, 'The #adjective# #noun#').
grammar_rule(fantasy_business_names, adjective, 'Golden').
grammar_rule(fantasy_business_names, adjective, 'Silver').
grammar_rule(fantasy_business_names, adjective, 'Iron').
grammar_rule(fantasy_business_names, adjective, 'Old').
grammar_rule(fantasy_business_names, adjective, 'Rusty').
grammar_rule(fantasy_business_names, adjective, 'Bright').
grammar_rule(fantasy_business_names, adjective, 'Broken').
grammar_rule(fantasy_business_names, adjective, 'Merry').
grammar_rule(fantasy_business_names, noun, 'Flagon').
grammar_rule(fantasy_business_names, noun, 'Anvil').
grammar_rule(fantasy_business_names, noun, 'Shield').
grammar_rule(fantasy_business_names, noun, 'Hearth').
grammar_rule(fantasy_business_names, noun, 'Crown').
grammar_rule(fantasy_business_names, noun, 'Barrel').
grammar_rule(fantasy_business_names, noun, 'Lantern').
grammar_rule(fantasy_business_names, noun, 'Oak').

%% Fantasy Rumor Generator
grammar(fantasy_rumors, 'fantasy_rumors').
grammar_description(fantasy_rumors, 'Procedural rumor generation for tavern gossip and NPC chatter.').
grammar_rule(fantasy_rumors, origin, 'They say #subject# #action# #location#.').
grammar_rule(fantasy_rumors, subject, 'a stranger').
grammar_rule(fantasy_rumors, subject, 'the old hermit').
grammar_rule(fantasy_rumors, subject, 'wolves').
grammar_rule(fantasy_rumors, subject, 'bandits').
grammar_rule(fantasy_rumors, subject, 'a merchant caravan').
grammar_rule(fantasy_rumors, subject, 'the temple priests').
grammar_rule(fantasy_rumors, action, 'was seen lurking near').
grammar_rule(fantasy_rumors, action, 'has been spotted around').
grammar_rule(fantasy_rumors, action, 'went missing near').
grammar_rule(fantasy_rumors, action, 'found something strange at').
grammar_rule(fantasy_rumors, action, 'heard odd sounds coming from').
grammar_rule(fantasy_rumors, location, 'the old mine').
grammar_rule(fantasy_rumors, location, 'the forest edge').
grammar_rule(fantasy_rumors, location, 'the river crossing').
grammar_rule(fantasy_rumors, location, 'the ruins on the hill').
grammar_rule(fantasy_rumors, location, 'the temple crypt').
