%% Insimul Grammars (Tracery): Hindi Town
%% Source: data/worlds/language/hindi/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Hindi Character Names
grammar(hindi_character_names, 'hindi_character_names').
grammar_description(hindi_character_names, 'Authentic Hindi name generation for a contemporary North Indian town. Names follow modern Hindi naming conventions with common surnames.').
grammar_rule(hindi_character_names, origin, '#givenName# #familyName#').
grammar_rule(hindi_character_names, givenname, '#maleName#').
grammar_rule(hindi_character_names, givenname, '#femaleName#').
grammar_rule(hindi_character_names, malename, 'Rajesh').
grammar_rule(hindi_character_names, malename, 'Vinod').
grammar_rule(hindi_character_names, malename, 'Devendra').
grammar_rule(hindi_character_names, malename, 'Prakash').
grammar_rule(hindi_character_names, malename, 'Ramesh').
grammar_rule(hindi_character_names, malename, 'Suresh').
grammar_rule(hindi_character_names, malename, 'Arjun').
grammar_rule(hindi_character_names, malename, 'Rohit').
grammar_rule(hindi_character_names, malename, 'Amit').
grammar_rule(hindi_character_names, malename, 'Sanjay').
grammar_rule(hindi_character_names, malename, 'Vikram').
grammar_rule(hindi_character_names, malename, 'Manish').
grammar_rule(hindi_character_names, malename, 'Anil').
grammar_rule(hindi_character_names, malename, 'Deepak').
grammar_rule(hindi_character_names, malename, 'Rahul').
grammar_rule(hindi_character_names, femalename, 'Sunita').
grammar_rule(hindi_character_names, femalename, 'Priya').
grammar_rule(hindi_character_names, femalename, 'Anita').
grammar_rule(hindi_character_names, femalename, 'Meena').
grammar_rule(hindi_character_names, femalename, 'Kavita').
grammar_rule(hindi_character_names, femalename, 'Neha').
grammar_rule(hindi_character_names, femalename, 'Deepa').
grammar_rule(hindi_character_names, femalename, 'Savitri').
grammar_rule(hindi_character_names, femalename, 'Kamla').
grammar_rule(hindi_character_names, femalename, 'Geeta').
grammar_rule(hindi_character_names, femalename, 'Pooja').
grammar_rule(hindi_character_names, femalename, 'Ritu').
grammar_rule(hindi_character_names, femalename, 'Asha').
grammar_rule(hindi_character_names, femalename, 'Nisha').
grammar_rule(hindi_character_names, femalename, 'Seema').
grammar_rule(hindi_character_names, familyname, '#surname#').
grammar_rule(hindi_character_names, surname, 'Sharma').
grammar_rule(hindi_character_names, surname, 'Gupta').
grammar_rule(hindi_character_names, surname, 'Singh').
grammar_rule(hindi_character_names, surname, 'Verma').
grammar_rule(hindi_character_names, surname, 'Patel').
grammar_rule(hindi_character_names, surname, 'Mishra').
grammar_rule(hindi_character_names, surname, 'Yadav').
grammar_rule(hindi_character_names, surname, 'Pandey').
grammar_rule(hindi_character_names, surname, 'Tiwari').
grammar_rule(hindi_character_names, surname, 'Joshi').
grammar_rule(hindi_character_names, surname, 'Chauhan').
grammar_rule(hindi_character_names, surname, 'Dubey').

%% Hindi Place Names
grammar(hindi_place_names, 'hindi_place_names').
grammar_description(hindi_place_names, 'Generation of Hindi-style place names for streets and districts.').
grammar_rule(hindi_place_names, origin, '#placeType# #placeQuality#').
grammar_rule(hindi_place_names, placetype, 'Bazaar').
grammar_rule(hindi_place_names, placetype, 'Gali').
grammar_rule(hindi_place_names, placetype, 'Marg').
grammar_rule(hindi_place_names, placetype, 'Chowk').
grammar_rule(hindi_place_names, placetype, 'Mohalla').
grammar_rule(hindi_place_names, placequality, 'Road').
grammar_rule(hindi_place_names, placequality, 'Nagar').
grammar_rule(hindi_place_names, placequality, 'Pura').
grammar_rule(hindi_place_names, placequality, 'Ganj').
grammar_rule(hindi_place_names, placequality, 'Sarai').
grammar_rule(hindi_place_names, placequality, 'Tola').
grammar_rule(hindi_place_names, placequality, 'Kund').
grammar_rule(hindi_place_names, placequality, 'Vihar').

%% Hindi Business Names
grammar(hindi_business_names, 'hindi_business_names').
grammar_description(hindi_business_names, 'Generation of Hindi-style business names for shops and restaurants.').
grammar_rule(hindi_business_names, origin, '#businessType# #businessQuality#').
grammar_rule(hindi_business_names, businesstype, 'Dukaan').
grammar_rule(hindi_business_names, businesstype, 'Bhandar').
grammar_rule(hindi_business_names, businesstype, 'Kendra').
grammar_rule(hindi_business_names, businesstype, 'Dhaba').
grammar_rule(hindi_business_names, businesstype, 'Emporium').
grammar_rule(hindi_business_names, businesstype, 'Vidyalaya').
grammar_rule(hindi_business_names, businessquality, 'Shree').
grammar_rule(hindi_business_names, businessquality, 'Jai').
grammar_rule(hindi_business_names, businessquality, 'Naya').
grammar_rule(hindi_business_names, businessquality, 'Sasta').
grammar_rule(hindi_business_names, businessquality, 'Anand').
grammar_rule(hindi_business_names, businessquality, 'Jeevan').
