%% Insimul Grammars (Tracery): Tropical Pirate
%% Source: data/worlds/tropical_pirate/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Pirate Character Names
grammar(pirate_character_names, 'pirate_character_names').
grammar_description(pirate_character_names, 'Golden Age of Piracy name generation mixing English, Spanish, and Caribbean origins.').
grammar_rule(pirate_character_names, origin, '#givenName# #familyName#').
grammar_rule(pirate_character_names, givenname, '#maleName#').
grammar_rule(pirate_character_names, givenname, '#femaleName#').
grammar_rule(pirate_character_names, malename, 'Jack').
grammar_rule(pirate_character_names, malename, 'Silas').
grammar_rule(pirate_character_names, malename, 'Morgan').
grammar_rule(pirate_character_names, malename, 'Rodrigo').
grammar_rule(pirate_character_names, malename, 'Alejandro').
grammar_rule(pirate_character_names, malename, 'Elias').
grammar_rule(pirate_character_names, malename, 'Claude').
grammar_rule(pirate_character_names, malename, 'Miguel').
grammar_rule(pirate_character_names, malename, 'Nkechi').
grammar_rule(pirate_character_names, malename, 'William').
grammar_rule(pirate_character_names, malename, 'Bartholomew').
grammar_rule(pirate_character_names, malename, 'Edward').
grammar_rule(pirate_character_names, malename, 'Henry').
grammar_rule(pirate_character_names, malename, 'Samuel').
grammar_rule(pirate_character_names, malename, 'Calico').
grammar_rule(pirate_character_names, femalename, 'Anne').
grammar_rule(pirate_character_names, femalename, 'Estrella').
grammar_rule(pirate_character_names, femalename, 'Mary').
grammar_rule(pirate_character_names, femalename, 'Isabella').
grammar_rule(pirate_character_names, femalename, 'Sofia').
grammar_rule(pirate_character_names, femalename, 'Celeste').
grammar_rule(pirate_character_names, femalename, 'Hana').
grammar_rule(pirate_character_names, femalename, 'Rosalita').
grammar_rule(pirate_character_names, femalename, 'Grace').
grammar_rule(pirate_character_names, femalename, 'Charlotte').
grammar_rule(pirate_character_names, femalename, 'Bonnie').
grammar_rule(pirate_character_names, femalename, 'Inez').
grammar_rule(pirate_character_names, femalename, 'Lucia').
grammar_rule(pirate_character_names, femalename, 'Pearl').
grammar_rule(pirate_character_names, femalename, 'Marina').
grammar_rule(pirate_character_names, familyname, '#surname#').
grammar_rule(pirate_character_names, surname, 'Hawkins').
grammar_rule(pirate_character_names, surname, 'Blacktide').
grammar_rule(pirate_character_names, surname, 'Crow').
grammar_rule(pirate_character_names, surname, 'Santos').
grammar_rule(pirate_character_names, surname, 'Flint').
grammar_rule(pirate_character_names, surname, 'Thorne').
grammar_rule(pirate_character_names, surname, 'Vega').
grammar_rule(pirate_character_names, surname, 'Moreau').
grammar_rule(pirate_character_names, surname, 'Finch').
grammar_rule(pirate_character_names, surname, 'Dubois').
grammar_rule(pirate_character_names, surname, 'Cortez').
grammar_rule(pirate_character_names, surname, 'Obi').

%% Pirate Ship Names
grammar(pirate_ship_names, 'pirate_ship_names').
grammar_description(pirate_ship_names, 'Generation of pirate and merchant ship names.').
grammar_rule(pirate_ship_names, origin, 'The #adjective# #noun#').
grammar_rule(pirate_ship_names, adjective, 'Crimson').
grammar_rule(pirate_ship_names, adjective, 'Black').
grammar_rule(pirate_ship_names, adjective, 'Golden').
grammar_rule(pirate_ship_names, adjective, 'Storm').
grammar_rule(pirate_ship_names, adjective, 'Iron').
grammar_rule(pirate_ship_names, adjective, 'Dread').
grammar_rule(pirate_ship_names, adjective, 'Silent').
grammar_rule(pirate_ship_names, adjective, 'Scarlet').
grammar_rule(pirate_ship_names, noun, 'Tide').
grammar_rule(pirate_ship_names, noun, 'Pearl').
grammar_rule(pirate_ship_names, noun, 'Serpent').
grammar_rule(pirate_ship_names, noun, 'Raven').
grammar_rule(pirate_ship_names, noun, 'Marauder').
grammar_rule(pirate_ship_names, noun, 'Fortune').
grammar_rule(pirate_ship_names, noun, 'Phantom').
grammar_rule(pirate_ship_names, noun, 'Horizon').

%% Pirate Place Names
grammar(pirate_place_names, 'pirate_place_names').
grammar_description(pirate_place_names, 'Generation of Caribbean port and island names.').
grammar_rule(pirate_place_names, origin, '#prefix# #suffix#').
grammar_rule(pirate_place_names, prefix, 'Port').
grammar_rule(pirate_place_names, prefix, 'Isla').
grammar_rule(pirate_place_names, prefix, 'San').
grammar_rule(pirate_place_names, prefix, 'Bahia').
grammar_rule(pirate_place_names, prefix, 'Cayo').
grammar_rule(pirate_place_names, prefix, 'Punta').
grammar_rule(pirate_place_names, suffix, 'del Sol').
grammar_rule(pirate_place_names, suffix, 'Negra').
grammar_rule(pirate_place_names, suffix, 'Perdida').
grammar_rule(pirate_place_names, suffix, 'de Oro').
grammar_rule(pirate_place_names, suffix, 'Escondida').
grammar_rule(pirate_place_names, suffix, 'Brava').
