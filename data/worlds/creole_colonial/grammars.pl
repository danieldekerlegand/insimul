%% Insimul Grammars (Tracery): Creole Colonial
%% Source: data/worlds/creole_colonial/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Creole Character Names
grammar(creole_character_names, 'creole_character_names').
grammar_description(creole_character_names, 'Authentic Creole name generation for colonial Louisiana. Names blend French, African, and Caribbean naming traditions.').
grammar_rule(creole_character_names, origin, '#givenName# #familyName#').
grammar_rule(creole_character_names, givenname, '#maleName#').
grammar_rule(creole_character_names, givenname, '#femaleName#').
grammar_rule(creole_character_names, malename, 'Henri').
grammar_rule(creole_character_names, malename, 'Etienne').
grammar_rule(creole_character_names, malename, 'Jean-Pierre').
grammar_rule(creole_character_names, malename, 'Jacques').
grammar_rule(creole_character_names, malename, 'Louis').
grammar_rule(creole_character_names, malename, 'Remy').
grammar_rule(creole_character_names, malename, 'Pierre').
grammar_rule(creole_character_names, malename, 'Augustin').
grammar_rule(creole_character_names, malename, 'Celestin').
grammar_rule(creole_character_names, malename, 'Francois').
grammar_rule(creole_character_names, malename, 'Honore').
grammar_rule(creole_character_names, malename, 'Baptiste').
grammar_rule(creole_character_names, malename, 'Toussaint').
grammar_rule(creole_character_names, malename, 'Cyprien').
grammar_rule(creole_character_names, femalename, 'Claire').
grammar_rule(creole_character_names, femalename, 'Marguerite').
grammar_rule(creole_character_names, femalename, 'Adele').
grammar_rule(creole_character_names, femalename, 'Marie').
grammar_rule(creole_character_names, femalename, 'Josephine').
grammar_rule(creole_character_names, femalename, 'Celeste').
grammar_rule(creole_character_names, femalename, 'Rose').
grammar_rule(creole_character_names, femalename, 'Isabelle').
grammar_rule(creole_character_names, femalename, 'Eulalie').
grammar_rule(creole_character_names, femalename, 'Delphine').
grammar_rule(creole_character_names, femalename, 'Suzette').
grammar_rule(creole_character_names, femalename, 'Madeleine').
grammar_rule(creole_character_names, femalename, 'Aimee').
grammar_rule(creole_character_names, femalename, 'Colette').
grammar_rule(creole_character_names, familyname, '#surname#').
grammar_rule(creole_character_names, surname, 'Beaumont').
grammar_rule(creole_character_names, surname, 'Toussaint').
grammar_rule(creole_character_names, surname, 'Moreau').
grammar_rule(creole_character_names, surname, 'Boudreaux').
grammar_rule(creole_character_names, surname, 'Thibodaux').
grammar_rule(creole_character_names, surname, 'Landry').
grammar_rule(creole_character_names, surname, 'Fontenot').
grammar_rule(creole_character_names, surname, 'Arceneaux').
grammar_rule(creole_character_names, surname, 'Broussard').
grammar_rule(creole_character_names, surname, 'Doucet').
grammar_rule(creole_character_names, surname, 'Guidry').
grammar_rule(creole_character_names, surname, 'Hebert').

%% Creole Place Names
grammar(creole_place_names, 'creole_place_names').
grammar_description(creole_place_names, 'Generation of Creole colonial place names for bayou settlements, plantations, and streets.').
grammar_rule(creole_place_names, origin, '#placeType# #placeQuality#').
grammar_rule(creole_place_names, placetype, 'Rue').
grammar_rule(creole_place_names, placetype, 'Chemin').
grammar_rule(creole_place_names, placetype, 'Place').
grammar_rule(creole_place_names, placetype, 'Bayou').
grammar_rule(creole_place_names, placetype, 'Plantation').
grammar_rule(creole_place_names, placetype, 'Marais').
grammar_rule(creole_place_names, placequality, 'des Saules').
grammar_rule(creole_place_names, placequality, 'des Cypres').
grammar_rule(creole_place_names, placequality, 'Royale').
grammar_rule(creole_place_names, placequality, 'du Gouverneur').
grammar_rule(creole_place_names, placequality, 'de la Paix').
grammar_rule(creole_place_names, placequality, 'Perdue').
grammar_rule(creole_place_names, placequality, 'des Fleurs').
grammar_rule(creole_place_names, placequality, 'Noir').

%% Creole Dialogue Phrases
grammar(creole_dialogue_phrases, 'creole_dialogue_phrases').
grammar_description(creole_dialogue_phrases, 'Common Louisiana Creole French phrases and expressions used in everyday colonial life.').
grammar_rule(creole_dialogue_phrases, origin, '#greeting#').
grammar_rule(creole_dialogue_phrases, origin, '#farewell#').
grammar_rule(creole_dialogue_phrases, origin, '#exclamation#').
grammar_rule(creole_dialogue_phrases, greeting, 'Bonjou, #title#!').
grammar_rule(creole_dialogue_phrases, greeting, 'Comment to ye, cher?').
grammar_rule(creole_dialogue_phrases, greeting, 'Ki manye to ye?').
grammar_rule(creole_dialogue_phrases, greeting, 'Mo kontan we twa.').
grammar_rule(creole_dialogue_phrases, farewell, 'A pli tar, cher.').
grammar_rule(creole_dialogue_phrases, farewell, 'Pran swen twa.').
grammar_rule(creole_dialogue_phrases, farewell, 'Bon swa, #title#.').
grammar_rule(creole_dialogue_phrases, exclamation, 'Ayiyi!').
grammar_rule(creole_dialogue_phrases, exclamation, 'Laissez les bon temps rouler!').
grammar_rule(creole_dialogue_phrases, exclamation, 'Mo di twa, sa se vre!').
grammar_rule(creole_dialogue_phrases, title, 'Michie').
grammar_rule(creole_dialogue_phrases, title, 'Madame').
grammar_rule(creole_dialogue_phrases, title, 'Mamselle').
grammar_rule(creole_dialogue_phrases, title, 'cher').
