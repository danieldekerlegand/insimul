%% Insimul Grammars (Tracery): Modern Realistic
%% Source: data/worlds/modern_realistic/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Modern Character Names
grammar(modern_character_names, 'modern_character_names').
grammar_description(modern_character_names, 'Contemporary American name generation for a suburban setting.').
grammar_rule(modern_character_names, origin, '#givenName# #familyName#').
grammar_rule(modern_character_names, givenname, '#maleName#').
grammar_rule(modern_character_names, givenname, '#femaleName#').
grammar_rule(modern_character_names, malename, 'David').
grammar_rule(modern_character_names, malename, 'James').
grammar_rule(modern_character_names, malename, 'Kevin').
grammar_rule(modern_character_names, malename, 'Daniel').
grammar_rule(modern_character_names, malename, 'Frank').
grammar_rule(modern_character_names, malename, 'Tony').
grammar_rule(modern_character_names, malename, 'Sam').
grammar_rule(modern_character_names, malename, 'Jordan').
grammar_rule(modern_character_names, malename, 'Marcus').
grammar_rule(modern_character_names, malename, 'Tyler').
grammar_rule(modern_character_names, malename, 'Brandon').
grammar_rule(modern_character_names, malename, 'Nathan').
grammar_rule(modern_character_names, malename, 'Alex').
grammar_rule(modern_character_names, malename, 'Ryan').
grammar_rule(modern_character_names, malename, 'Chris').
grammar_rule(modern_character_names, femalename, 'Maria').
grammar_rule(modern_character_names, femalename, 'Emma').
grammar_rule(modern_character_names, femalename, 'Grace').
grammar_rule(modern_character_names, femalename, 'Sarah').
grammar_rule(modern_character_names, femalename, 'Helen').
grammar_rule(modern_character_names, femalename, 'Ruth').
grammar_rule(modern_character_names, femalename, 'Maya').
grammar_rule(modern_character_names, femalename, 'Zara').
grammar_rule(modern_character_names, femalename, 'Lily').
grammar_rule(modern_character_names, femalename, 'Jessica').
grammar_rule(modern_character_names, femalename, 'Ashley').
grammar_rule(modern_character_names, femalename, 'Nicole').
grammar_rule(modern_character_names, femalename, 'Megan').
grammar_rule(modern_character_names, femalename, 'Hannah').
grammar_rule(modern_character_names, femalename, 'Olivia').
grammar_rule(modern_character_names, familyname, '#surname#').
grammar_rule(modern_character_names, surname, 'Chen').
grammar_rule(modern_character_names, surname, 'Okafor').
grammar_rule(modern_character_names, surname, 'Russo').
grammar_rule(modern_character_names, surname, 'Park').
grammar_rule(modern_character_names, surname, 'Weaver').
grammar_rule(modern_character_names, surname, 'Torres').
grammar_rule(modern_character_names, surname, 'Bell').
grammar_rule(modern_character_names, surname, 'Johnson').
grammar_rule(modern_character_names, surname, 'Williams').
grammar_rule(modern_character_names, surname, 'Garcia').
grammar_rule(modern_character_names, surname, 'Miller').
grammar_rule(modern_character_names, surname, 'Davis').

%% Modern Street Names
grammar(modern_street_names, 'modern_street_names').
grammar_description(modern_street_names, 'Generation of American-style street names for a suburban town.').
grammar_rule(modern_street_names, origin, '#treeName# #streetType#').
grammar_rule(modern_street_names, treename, 'Oak').
grammar_rule(modern_street_names, treename, 'Elm').
grammar_rule(modern_street_names, treename, 'Cedar').
grammar_rule(modern_street_names, treename, 'Birch').
grammar_rule(modern_street_names, treename, 'Maple').
grammar_rule(modern_street_names, treename, 'Pine').
grammar_rule(modern_street_names, treename, 'Willow').
grammar_rule(modern_street_names, treename, 'Hickory').
grammar_rule(modern_street_names, streettype, 'Street').
grammar_rule(modern_street_names, streettype, 'Avenue').
grammar_rule(modern_street_names, streettype, 'Lane').
grammar_rule(modern_street_names, streettype, 'Drive').
grammar_rule(modern_street_names, streettype, 'Road').
grammar_rule(modern_street_names, streettype, 'Court').
grammar_rule(modern_street_names, streettype, 'Boulevard').
grammar_rule(modern_street_names, streettype, 'Way').

%% Modern Business Names
grammar(modern_business_names, 'modern_business_names').
grammar_description(modern_business_names, 'Generation of contemporary business names for shops and restaurants.').
grammar_rule(modern_business_names, origin, '#businessStyle#').
grammar_rule(modern_business_names, businessstyle, '#adjective# #noun#').
grammar_rule(modern_business_names, businessstyle, 'The #noun# #place#').
grammar_rule(modern_business_names, adjective, 'Fresh').
grammar_rule(modern_business_names, adjective, 'Golden').
grammar_rule(modern_business_names, adjective, 'Quick').
grammar_rule(modern_business_names, adjective, 'Daily').
grammar_rule(modern_business_names, adjective, 'Green').
grammar_rule(modern_business_names, adjective, 'Bright').
grammar_rule(modern_business_names, noun, 'Bean').
grammar_rule(modern_business_names, noun, 'Leaf').
grammar_rule(modern_business_names, noun, 'Market').
grammar_rule(modern_business_names, noun, 'Grill').
grammar_rule(modern_business_names, noun, 'Corner').
grammar_rule(modern_business_names, noun, 'Table').
grammar_rule(modern_business_names, place, 'Cafe').
grammar_rule(modern_business_names, place, 'Bistro').
grammar_rule(modern_business_names, place, 'Kitchen').
grammar_rule(modern_business_names, place, 'Shop').
grammar_rule(modern_business_names, place, 'Hub').
grammar_rule(modern_business_names, place, 'Studio').
