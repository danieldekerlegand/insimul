%% Insimul Grammars (Tracery): Victorian England
%% Source: data/worlds/victorian_england/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Victorian Character Names
grammar(victorian_character_names, 'victorian_character_names').
grammar_description(victorian_character_names, 'Name generation for Victorian-era English society across all social classes.').
grammar_rule(victorian_character_names, origin, '#givenName# #familyName#').
grammar_rule(victorian_character_names, givenname, '#maleName#').
grammar_rule(victorian_character_names, givenname, '#femaleName#').
grammar_rule(victorian_character_names, malename, 'William').
grammar_rule(victorian_character_names, malename, 'Thomas').
grammar_rule(victorian_character_names, malename, 'Charles').
grammar_rule(victorian_character_names, malename, 'Henry').
grammar_rule(victorian_character_names, malename, 'Arthur').
grammar_rule(victorian_character_names, malename, 'George').
grammar_rule(victorian_character_names, malename, 'Edward').
grammar_rule(victorian_character_names, malename, 'Frederick').
grammar_rule(victorian_character_names, malename, 'James').
grammar_rule(victorian_character_names, malename, 'Albert').
grammar_rule(victorian_character_names, malename, 'Robert').
grammar_rule(victorian_character_names, malename, 'Richard').
grammar_rule(victorian_character_names, femalename, 'Victoria').
grammar_rule(victorian_character_names, femalename, 'Charlotte').
grammar_rule(victorian_character_names, femalename, 'Elizabeth').
grammar_rule(victorian_character_names, femalename, 'Mary').
grammar_rule(victorian_character_names, femalename, 'Florence').
grammar_rule(victorian_character_names, femalename, 'Ada').
grammar_rule(victorian_character_names, femalename, 'Beatrice').
grammar_rule(victorian_character_names, femalename, 'Margaret').
grammar_rule(victorian_character_names, femalename, 'Eleanor').
grammar_rule(victorian_character_names, femalename, 'Alice').
grammar_rule(victorian_character_names, femalename, 'Catherine').
grammar_rule(victorian_character_names, femalename, 'Edith').
grammar_rule(victorian_character_names, familyname, '#surname#').
grammar_rule(victorian_character_names, surname, 'Ashford').
grammar_rule(victorian_character_names, surname, 'Edison').
grammar_rule(victorian_character_names, surname, 'Dickens').
grammar_rule(victorian_character_names, surname, 'Bronte').
grammar_rule(victorian_character_names, surname, 'Whitmore').
grammar_rule(victorian_character_names, surname, 'Pemberton').
grammar_rule(victorian_character_names, surname, 'Hawthorne').
grammar_rule(victorian_character_names, surname, 'Grimshaw').
grammar_rule(victorian_character_names, surname, 'Blackwood').
grammar_rule(victorian_character_names, surname, 'Crawford').
grammar_rule(victorian_character_names, surname, 'Worthington').
grammar_rule(victorian_character_names, surname, 'Sinclair').

%% Victorian Place Names
grammar(victorian_place_names, 'victorian_place_names').
grammar_description(victorian_place_names, 'Generation of Victorian-era London street and district names.').
grammar_rule(victorian_place_names, origin, '#prefix# #suffix#').
grammar_rule(victorian_place_names, prefix, 'Fleet').
grammar_rule(victorian_place_names, prefix, 'Mayfair').
grammar_rule(victorian_place_names, prefix, 'Whitehall').
grammar_rule(victorian_place_names, prefix, 'Gaslight').
grammar_rule(victorian_place_names, prefix, 'Cotton').
grammar_rule(victorian_place_names, prefix, 'Market').
grammar_rule(victorian_place_names, prefix, 'Bloomsbury').
grammar_rule(victorian_place_names, suffix, 'Street').
grammar_rule(victorian_place_names, suffix, 'Lane').
grammar_rule(victorian_place_names, suffix, 'Road').
grammar_rule(victorian_place_names, suffix, 'Alley').
grammar_rule(victorian_place_names, suffix, 'Row').
grammar_rule(victorian_place_names, suffix, 'Square').
grammar_rule(victorian_place_names, suffix, 'Court').

%% Victorian Business Names
grammar(victorian_business_names, 'victorian_business_names').
grammar_description(victorian_business_names, 'Generation of Victorian-era business and establishment names.').
grammar_rule(victorian_business_names, origin, '#nameStyle#').
grammar_rule(victorian_business_names, namestyle, '#surname# and Sons #businessType#').
grammar_rule(victorian_business_names, namestyle, 'The #adjective# #noun#').
grammar_rule(victorian_business_names, surname, 'Hawthorne').
grammar_rule(victorian_business_names, surname, 'Pemberton').
grammar_rule(victorian_business_names, surname, 'Whitmore').
grammar_rule(victorian_business_names, surname, 'Grimshaw').
grammar_rule(victorian_business_names, surname, 'Crawford').
grammar_rule(victorian_business_names, businesstype, 'Tailors').
grammar_rule(victorian_business_names, businesstype, 'Provisions').
grammar_rule(victorian_business_names, businesstype, 'Apothecary').
grammar_rule(victorian_business_names, businesstype, 'Ironmongers').
grammar_rule(victorian_business_names, adjective, 'Iron').
grammar_rule(victorian_business_names, adjective, 'Golden').
grammar_rule(victorian_business_names, adjective, 'Royal').
grammar_rule(victorian_business_names, adjective, 'Old').
grammar_rule(victorian_business_names, noun, 'Horse').
grammar_rule(victorian_business_names, noun, 'Lion').
grammar_rule(victorian_business_names, noun, 'Crown').
grammar_rule(victorian_business_names, noun, 'Eagle').
