%% Insimul Grammars (Tracery): Solarpunk Eco-Communities
%% Source: data/worlds/solarpunk/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Solarpunk Character Names
grammar(solarpunk_character_names, 'solarpunk_character_names').
grammar_description(solarpunk_character_names, 'Diverse multicultural name generation reflecting a globally connected eco-community.').
grammar_rule(solarpunk_character_names, origin, '#givenName# #familyName#').
grammar_rule(solarpunk_character_names, givenname, '#maleName#').
grammar_rule(solarpunk_character_names, givenname, '#femaleName#').
grammar_rule(solarpunk_character_names, malename, 'Emeka').
grammar_rule(solarpunk_character_names, malename, 'Mateo').
grammar_rule(solarpunk_character_names, malename, 'Hiro').
grammar_rule(solarpunk_character_names, malename, 'Soren').
grammar_rule(solarpunk_character_names, malename, 'Kofi').
grammar_rule(solarpunk_character_names, malename, 'Kai').
grammar_rule(solarpunk_character_names, malename, 'Finn').
grammar_rule(solarpunk_character_names, malename, 'Olu').
grammar_rule(solarpunk_character_names, malename, 'Rio').
grammar_rule(solarpunk_character_names, malename, 'Alder').
grammar_rule(solarpunk_character_names, malename, 'Cedar').
grammar_rule(solarpunk_character_names, malename, 'Rowan').
grammar_rule(solarpunk_character_names, femalename, 'Nia').
grammar_rule(solarpunk_character_names, femalename, 'Elena').
grammar_rule(solarpunk_character_names, femalename, 'Priya').
grammar_rule(solarpunk_character_names, femalename, 'Astrid').
grammar_rule(solarpunk_character_names, femalename, 'Zuri').
grammar_rule(solarpunk_character_names, femalename, 'Yuki').
grammar_rule(solarpunk_character_names, femalename, 'Sol').
grammar_rule(solarpunk_character_names, femalename, 'Lena').
grammar_rule(solarpunk_character_names, femalename, 'Wren').
grammar_rule(solarpunk_character_names, femalename, 'Ivy').
grammar_rule(solarpunk_character_names, femalename, 'Sage').
grammar_rule(solarpunk_character_names, femalename, 'Fern').
grammar_rule(solarpunk_character_names, familyname, '#surname#').
grammar_rule(solarpunk_character_names, surname, 'Okafor').
grammar_rule(solarpunk_character_names, surname, 'Vasquez').
grammar_rule(solarpunk_character_names, surname, 'Tanaka').
grammar_rule(solarpunk_character_names, surname, 'Maren').
grammar_rule(solarpunk_character_names, surname, 'Adeyemi').
grammar_rule(solarpunk_character_names, surname, 'Calloway').
grammar_rule(solarpunk_character_names, surname, 'Greenwood').
grammar_rule(solarpunk_character_names, surname, 'Solberg').
grammar_rule(solarpunk_character_names, surname, 'Reyes').
grammar_rule(solarpunk_character_names, surname, 'Chen').

%% Eco-Community Place Names
grammar(eco_place_names, 'eco_place_names').
grammar_description(eco_place_names, 'Generation of nature-inspired place names for solarpunk settlements.').
grammar_rule(eco_place_names, origin, '#prefix# #suffix#').
grammar_rule(eco_place_names, prefix, 'Sun').
grammar_rule(eco_place_names, prefix, 'Green').
grammar_rule(eco_place_names, prefix, 'Moss').
grammar_rule(eco_place_names, prefix, 'Fern').
grammar_rule(eco_place_names, prefix, 'Tide').
grammar_rule(eco_place_names, prefix, 'Root').
grammar_rule(eco_place_names, prefix, 'Bloom').
grammar_rule(eco_place_names, prefix, 'Sky').
grammar_rule(eco_place_names, suffix, 'haven').
grammar_rule(eco_place_names, suffix, 'reach').
grammar_rule(eco_place_names, suffix, 'grove').
grammar_rule(eco_place_names, suffix, 'crest').
grammar_rule(eco_place_names, suffix, 'hold').
grammar_rule(eco_place_names, suffix, 'commons').
grammar_rule(eco_place_names, suffix, 'garden').
grammar_rule(eco_place_names, suffix, 'vale').

%% Eco-Business Names
grammar(eco_business_names, 'eco_business_names').
grammar_description(eco_business_names, 'Generation of solarpunk workshop and cooperative names.').
grammar_rule(eco_business_names, origin, '#businessType# #businessQuality#').
grammar_rule(eco_business_names, businesstype, 'The').
grammar_rule(eco_business_names, businessquality, 'Green Forge').
grammar_rule(eco_business_names, businessquality, 'Spore Lab').
grammar_rule(eco_business_names, businessquality, 'Sun Kitchen').
grammar_rule(eco_business_names, businessquality, 'Seed Library').
grammar_rule(eco_business_names, businessquality, 'Honey Collective').
grammar_rule(eco_business_names, businessquality, 'Tide Pool').
grammar_rule(eco_business_names, businessquality, 'Root Cellar').
grammar_rule(eco_business_names, businessquality, 'Wind Works').
