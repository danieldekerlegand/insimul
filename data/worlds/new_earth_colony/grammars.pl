%% Insimul Grammars (Tracery): New Earth Colony
%% Source: data/worlds/new_earth_colony/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Colony Character Names
grammar(colony_character_names, 'colony_character_names').
grammar_description(colony_character_names, 'Name generation for a multi-ethnic space colony population in the year 2340.').
grammar_rule(colony_character_names, origin, '#givenName# #familyName#').
grammar_rule(colony_character_names, givenname, '#maleName#').
grammar_rule(colony_character_names, givenname, '#femaleName#').
grammar_rule(colony_character_names, malename, 'Gordon').
grammar_rule(colony_character_names, malename, 'Raj').
grammar_rule(colony_character_names, malename, 'Marcus').
grammar_rule(colony_character_names, malename, 'Yuto').
grammar_rule(colony_character_names, malename, 'Dmitri').
grammar_rule(colony_character_names, malename, 'Kwame').
grammar_rule(colony_character_names, malename, 'Anders').
grammar_rule(colony_character_names, malename, 'Chen').
grammar_rule(colony_character_names, malename, 'Liam').
grammar_rule(colony_character_names, malename, 'Mateo').
grammar_rule(colony_character_names, malename, 'Idris').
grammar_rule(colony_character_names, malename, 'Viktor').
grammar_rule(colony_character_names, femalename, 'Jane').
grammar_rule(colony_character_names, femalename, 'Sarah').
grammar_rule(colony_character_names, femalename, 'Cortana').
grammar_rule(colony_character_names, femalename, 'Amara').
grammar_rule(colony_character_names, femalename, 'Yuki').
grammar_rule(colony_character_names, femalename, 'Elena').
grammar_rule(colony_character_names, femalename, 'Zara').
grammar_rule(colony_character_names, femalename, 'Mei').
grammar_rule(colony_character_names, femalename, 'Anya').
grammar_rule(colony_character_names, femalename, 'Priya').
grammar_rule(colony_character_names, femalename, 'Ingrid').
grammar_rule(colony_character_names, femalename, 'Fatou').
grammar_rule(colony_character_names, familyname, '#surname#').
grammar_rule(colony_character_names, surname, 'Shepard').
grammar_rule(colony_character_names, surname, 'Freeman').
grammar_rule(colony_character_names, surname, 'McCall').
grammar_rule(colony_character_names, surname, 'Patel').
grammar_rule(colony_character_names, surname, 'Tanaka').
grammar_rule(colony_character_names, surname, 'Volkov').
grammar_rule(colony_character_names, surname, 'Okafor').
grammar_rule(colony_character_names, surname, 'Lindgren').
grammar_rule(colony_character_names, surname, 'Zhang').
grammar_rule(colony_character_names, surname, 'Reyes').
grammar_rule(colony_character_names, surname, 'Kofi').
grammar_rule(colony_character_names, surname, 'Novak').

%% Colony Place Names
grammar(colony_place_names, 'colony_place_names').
grammar_description(colony_place_names, 'Generation of sci-fi colony location names for sectors, decks, and facilities.').
grammar_rule(colony_place_names, origin, '#prefix# #suffix#').
grammar_rule(colony_place_names, prefix, 'Sector').
grammar_rule(colony_place_names, prefix, 'Bay').
grammar_rule(colony_place_names, prefix, 'Deck').
grammar_rule(colony_place_names, prefix, 'Module').
grammar_rule(colony_place_names, prefix, 'Ring').
grammar_rule(colony_place_names, prefix, 'Hub').
grammar_rule(colony_place_names, suffix, 'Alpha').
grammar_rule(colony_place_names, suffix, 'Beta').
grammar_rule(colony_place_names, suffix, 'Gamma').
grammar_rule(colony_place_names, suffix, 'Delta').
grammar_rule(colony_place_names, suffix, 'Epsilon').
grammar_rule(colony_place_names, suffix, 'Omega').
grammar_rule(colony_place_names, suffix, 'Prime').
grammar_rule(colony_place_names, suffix, 'Zero').

%% Colony Business Names
grammar(colony_business_names, 'colony_business_names').
grammar_description(colony_business_names, 'Generation of sci-fi business and facility names.').
grammar_rule(colony_business_names, origin, '#businessType# #businessName#').
grammar_rule(colony_business_names, businesstype, 'Lab').
grammar_rule(colony_business_names, businesstype, 'Bay').
grammar_rule(colony_business_names, businesstype, 'Depot').
grammar_rule(colony_business_names, businesstype, 'Hub').
grammar_rule(colony_business_names, businesstype, 'Station').
grammar_rule(colony_business_names, businesstype, 'Forge').
grammar_rule(colony_business_names, businessname, 'Nova').
grammar_rule(colony_business_names, businessname, 'Olympus').
grammar_rule(colony_business_names, businessname, 'Frontier').
grammar_rule(colony_business_names, businessname, 'Helios').
grammar_rule(colony_business_names, businessname, 'Titan').
grammar_rule(colony_business_names, businessname, 'Vanguard').
