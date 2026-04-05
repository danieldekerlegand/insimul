%% Insimul Grammars (Tracery): Low Fantasy
%% Source: data/worlds/low_fantasy/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Low Fantasy Character Names
grammar(low_fantasy_character_names, 'low_fantasy_character_names').
grammar_description(low_fantasy_character_names, 'Gritty, grounded name generation for a low-magic medieval setting.').
grammar_rule(low_fantasy_character_names, origin, '#givenName# #familyName#').
grammar_rule(low_fantasy_character_names, givenname, '#maleName#').
grammar_rule(low_fantasy_character_names, givenname, '#femaleName#').
grammar_rule(low_fantasy_character_names, malename, 'Roderick').
grammar_rule(low_fantasy_character_names, malename, 'Aldric').
grammar_rule(low_fantasy_character_names, malename, 'Evard').
grammar_rule(low_fantasy_character_names, malename, 'Gregor').
grammar_rule(low_fantasy_character_names, malename, 'Jorik').
grammar_rule(low_fantasy_character_names, malename, 'Colm').
grammar_rule(low_fantasy_character_names, malename, 'Silas').
grammar_rule(low_fantasy_character_names, malename, 'Nils').
grammar_rule(low_fantasy_character_names, malename, 'Edric').
grammar_rule(low_fantasy_character_names, malename, 'Osmund').
grammar_rule(low_fantasy_character_names, malename, 'Godric').
grammar_rule(low_fantasy_character_names, malename, 'Hagen').
grammar_rule(low_fantasy_character_names, malename, 'Tormund').
grammar_rule(low_fantasy_character_names, malename, 'Wulfric').
grammar_rule(low_fantasy_character_names, malename, 'Cedric').
grammar_rule(low_fantasy_character_names, femalename, 'Marta').
grammar_rule(low_fantasy_character_names, femalename, 'Dagna').
grammar_rule(low_fantasy_character_names, femalename, 'Hilda').
grammar_rule(low_fantasy_character_names, femalename, 'Brenna').
grammar_rule(low_fantasy_character_names, femalename, 'Tilda').
grammar_rule(low_fantasy_character_names, femalename, 'Veska').
grammar_rule(low_fantasy_character_names, femalename, 'Ashara').
grammar_rule(low_fantasy_character_names, femalename, 'Elara').
grammar_rule(low_fantasy_character_names, femalename, 'Sigrid').
grammar_rule(low_fantasy_character_names, femalename, 'Maren').
grammar_rule(low_fantasy_character_names, femalename, 'Greta').
grammar_rule(low_fantasy_character_names, femalename, 'Iona').
grammar_rule(low_fantasy_character_names, femalename, 'Keva').
grammar_rule(low_fantasy_character_names, femalename, 'Brita').
grammar_rule(low_fantasy_character_names, femalename, 'Wren').
grammar_rule(low_fantasy_character_names, familyname, '#surname#').
grammar_rule(low_fantasy_character_names, surname, 'Grieve').
grammar_rule(low_fantasy_character_names, surname, 'Voss').
grammar_rule(low_fantasy_character_names, surname, 'Blackthorn').
grammar_rule(low_fantasy_character_names, surname, 'Copperton').
grammar_rule(low_fantasy_character_names, surname, 'Roth').
grammar_rule(low_fantasy_character_names, surname, 'Ashwood').
grammar_rule(low_fantasy_character_names, surname, 'Hale').
grammar_rule(low_fantasy_character_names, surname, 'Harrow').
grammar_rule(low_fantasy_character_names, surname, 'Marsh').
grammar_rule(low_fantasy_character_names, surname, 'Inkblot').
grammar_rule(low_fantasy_character_names, surname, 'Vane').
grammar_rule(low_fantasy_character_names, surname, 'Ironhand').

%% Low Fantasy Place Names
grammar(low_fantasy_place_names, 'low_fantasy_place_names').
grammar_description(low_fantasy_place_names, 'Generation of gritty medieval place names.').
grammar_rule(low_fantasy_place_names, origin, '#placePrefix# #placeSuffix#').
grammar_rule(low_fantasy_place_names, placeprefix, 'Mud').
grammar_rule(low_fantasy_place_names, placeprefix, 'Rat').
grammar_rule(low_fantasy_place_names, placeprefix, 'Copper').
grammar_rule(low_fantasy_place_names, placeprefix, 'Gallow').
grammar_rule(low_fantasy_place_names, placeprefix, 'Salt').
grammar_rule(low_fantasy_place_names, placeprefix, 'Thorn').
grammar_rule(low_fantasy_place_names, placeprefix, 'Iron').
grammar_rule(low_fantasy_place_names, placeprefix, 'Ash').
grammar_rule(low_fantasy_place_names, placesuffix, 'Gate').
grammar_rule(low_fantasy_place_names, placesuffix, 'Lane').
grammar_rule(low_fantasy_place_names, placesuffix, 'Road').
grammar_rule(low_fantasy_place_names, placesuffix, 'Way').
grammar_rule(low_fantasy_place_names, placesuffix, 'Alley').
grammar_rule(low_fantasy_place_names, placesuffix, 'Walk').
grammar_rule(low_fantasy_place_names, placesuffix, 'Crossing').
grammar_rule(low_fantasy_place_names, placesuffix, 'Hollow').

%% Low Fantasy Business Names
grammar(low_fantasy_business_names, 'low_fantasy_business_names').
grammar_description(low_fantasy_business_names, 'Generation of grimy tavern and shop names for a low fantasy setting.').
grammar_rule(low_fantasy_business_names, origin, '#businessFormat#').
grammar_rule(low_fantasy_business_names, businessformat, 'The #adj# #noun#').
grammar_rule(low_fantasy_business_names, businessformat, '#surname# #shopType#').
grammar_rule(low_fantasy_business_names, adj, 'Hanged').
grammar_rule(low_fantasy_business_names, adj, 'Drowned').
grammar_rule(low_fantasy_business_names, adj, 'Blind').
grammar_rule(low_fantasy_business_names, adj, 'Rusted').
grammar_rule(low_fantasy_business_names, adj, 'Broken').
grammar_rule(low_fantasy_business_names, noun, 'Crow').
grammar_rule(low_fantasy_business_names, noun, 'Rat').
grammar_rule(low_fantasy_business_names, noun, 'Boar').
grammar_rule(low_fantasy_business_names, noun, 'Hammer').
grammar_rule(low_fantasy_business_names, noun, 'Dog').
grammar_rule(low_fantasy_business_names, shoptype, 'Smithy').
grammar_rule(low_fantasy_business_names, shoptype, 'Provisions').
grammar_rule(low_fantasy_business_names, shoptype, 'Tannery').
grammar_rule(low_fantasy_business_names, shoptype, 'Chandler').
grammar_rule(low_fantasy_business_names, shoptype, 'Butchery').
grammar_rule(low_fantasy_business_names, surname, 'Grieve').
grammar_rule(low_fantasy_business_names, surname, 'Roth').
grammar_rule(low_fantasy_business_names, surname, 'Copperton').
grammar_rule(low_fantasy_business_names, surname, 'Harrow').
grammar_rule(low_fantasy_business_names, surname, 'Marsh').
