%% Insimul Grammars (Tracery): Bengali Riverside Town
%% Source: data/worlds/language/bengali/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Bengali Character Names
grammar(bengali_character_names, 'bengali_character_names').
grammar_description(bengali_character_names, 'Authentic Bengali name generation for a contemporary Bangladeshi riverside town. Names follow modern Bengali Muslim and Hindu naming conventions.').
grammar_rule(bengali_character_names, origin, '#givenName# #familyName#').
grammar_rule(bengali_character_names, givenname, '#maleName#').
grammar_rule(bengali_character_names, givenname, '#femaleName#').
grammar_rule(bengali_character_names, malename, 'Karim').
grammar_rule(bengali_character_names, malename, 'Anwar').
grammar_rule(bengali_character_names, malename, 'Jalal').
grammar_rule(bengali_character_names, malename, 'Tariqul').
grammar_rule(bengali_character_names, malename, 'Habibur').
grammar_rule(bengali_character_names, malename, 'Monir').
grammar_rule(bengali_character_names, malename, 'Fahim').
grammar_rule(bengali_character_names, malename, 'Sohel').
grammar_rule(bengali_character_names, malename, 'Imran').
grammar_rule(bengali_character_names, malename, 'Rafiq').
grammar_rule(bengali_character_names, malename, 'Rubel').
grammar_rule(bengali_character_names, malename, 'Sumon').
grammar_rule(bengali_character_names, malename, 'Arif').
grammar_rule(bengali_character_names, malename, 'Tanvir').
grammar_rule(bengali_character_names, malename, 'Shahin').
grammar_rule(bengali_character_names, femalename, 'Rashida').
grammar_rule(bengali_character_names, femalename, 'Nasreen').
grammar_rule(bengali_character_names, femalename, 'Salma').
grammar_rule(bengali_character_names, femalename, 'Hasina').
grammar_rule(bengali_character_names, femalename, 'Jahanara').
grammar_rule(bengali_character_names, femalename, 'Aleya').
grammar_rule(bengali_character_names, femalename, 'Nusrat').
grammar_rule(bengali_character_names, femalename, 'Tahmina').
grammar_rule(bengali_character_names, femalename, 'Farzana').
grammar_rule(bengali_character_names, femalename, 'Sharmin').
grammar_rule(bengali_character_names, femalename, 'Beauty').
grammar_rule(bengali_character_names, femalename, 'Lipi').
grammar_rule(bengali_character_names, femalename, 'Ruma').
grammar_rule(bengali_character_names, femalename, 'Shilpi').
grammar_rule(bengali_character_names, femalename, 'Meghna').
grammar_rule(bengali_character_names, familyname, '#surname#').
grammar_rule(bengali_character_names, surname, 'Rahman').
grammar_rule(bengali_character_names, surname, 'Hossain').
grammar_rule(bengali_character_names, surname, 'Ahmed').
grammar_rule(bengali_character_names, surname, 'Islam').
grammar_rule(bengali_character_names, surname, 'Begum').
grammar_rule(bengali_character_names, surname, 'Khatun').
grammar_rule(bengali_character_names, surname, 'Molla').
grammar_rule(bengali_character_names, surname, 'Sarker').
grammar_rule(bengali_character_names, surname, 'Chowdhury').
grammar_rule(bengali_character_names, surname, 'Talukder').
grammar_rule(bengali_character_names, surname, 'Bhuiyan').
grammar_rule(bengali_character_names, surname, 'Miah').

%% Bengali Place Names
grammar(bengali_place_names, 'bengali_place_names').
grammar_description(bengali_place_names, 'Generation of Bengali-style place names for streets and neighborhoods.').
grammar_rule(bengali_place_names, origin, '#placeType# #placeQuality#').
grammar_rule(bengali_place_names, placetype, 'Goli').
grammar_rule(bengali_place_names, placetype, 'Rasta').
grammar_rule(bengali_place_names, placetype, 'Path').
grammar_rule(bengali_place_names, placetype, 'Lane').
grammar_rule(bengali_place_names, placetype, 'Para').
grammar_rule(bengali_place_names, placequality, 'Nodi').
grammar_rule(bengali_place_names, placequality, 'Bazaar').
grammar_rule(bengali_place_names, placequality, 'Masjid').
grammar_rule(bengali_place_names, placequality, 'Mandir').
grammar_rule(bengali_place_names, placequality, 'Ghat').
grammar_rule(bengali_place_names, placequality, 'Dhan').
grammar_rule(bengali_place_names, placequality, 'Phool').
grammar_rule(bengali_place_names, placequality, 'Shanti').

%% Bengali Business Names
grammar(bengali_business_names, 'bengali_business_names').
grammar_description(bengali_business_names, 'Generation of Bengali-style business names for shops and restaurants.').
grammar_rule(bengali_business_names, origin, '#businessType# #businessQuality#').
grammar_rule(bengali_business_names, businesstype, 'Dokan').
grammar_rule(bengali_business_names, businesstype, 'Hotel').
grammar_rule(bengali_business_names, businesstype, 'Bhandar').
grammar_rule(bengali_business_names, businesstype, 'Ghor').
grammar_rule(bengali_business_names, businesstype, 'Stall').
grammar_rule(bengali_business_names, businesstype, 'Kendra').
grammar_rule(bengali_business_names, businessquality, 'Barkat').
grammar_rule(bengali_business_names, businessquality, 'Shanti').
grammar_rule(bengali_business_names, businessquality, 'Sonali').
grammar_rule(bengali_business_names, businessquality, 'Nodi').
grammar_rule(bengali_business_names, businessquality, 'Gyan').
grammar_rule(bengali_business_names, businessquality, 'Sobuj').
