%% Insimul Grammars (Tracery): Dieselpunk
%% Source: data/worlds/dieselpunk/grammars.pl
%% Created: 2026-04-03
%% Total: 4 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Dieselpunk Character Names
grammar(dieselpunk_character_names, 'dieselpunk_character_names').
grammar_description(dieselpunk_character_names, 'Interwar-era name generation blending Germanic, Slavic, and Anglo names for a dieselpunk industrial setting.').
grammar_rule(dieselpunk_character_names, origin, '#givenName# #familyName#').
grammar_rule(dieselpunk_character_names, givenname, '#maleName#').
grammar_rule(dieselpunk_character_names, givenname, '#femaleName#').
grammar_rule(dieselpunk_character_names, malename, 'Heinrich').
grammar_rule(dieselpunk_character_names, malename, 'Otto').
grammar_rule(dieselpunk_character_names, malename, 'Fritz').
grammar_rule(dieselpunk_character_names, malename, 'Konrad').
grammar_rule(dieselpunk_character_names, malename, 'Dimitri').
grammar_rule(dieselpunk_character_names, malename, 'Viktor').
grammar_rule(dieselpunk_character_names, malename, 'Thomas').
grammar_rule(dieselpunk_character_names, malename, 'Jack').
grammar_rule(dieselpunk_character_names, malename, 'Werner').
grammar_rule(dieselpunk_character_names, malename, 'Klaus').
grammar_rule(dieselpunk_character_names, malename, 'Bruno').
grammar_rule(dieselpunk_character_names, malename, 'Gregor').
grammar_rule(dieselpunk_character_names, malename, 'Sergei').
grammar_rule(dieselpunk_character_names, malename, 'Nikolai').
grammar_rule(dieselpunk_character_names, malename, 'Aldous').
grammar_rule(dieselpunk_character_names, femalename, 'Elsa').
grammar_rule(dieselpunk_character_names, femalename, 'Margot').
grammar_rule(dieselpunk_character_names, femalename, 'Irina').
grammar_rule(dieselpunk_character_names, femalename, 'Katya').
grammar_rule(dieselpunk_character_names, femalename, 'Anna').
grammar_rule(dieselpunk_character_names, femalename, 'Hilde').
grammar_rule(dieselpunk_character_names, femalename, 'Dorothy').
grammar_rule(dieselpunk_character_names, femalename, 'Ruth').
grammar_rule(dieselpunk_character_names, femalename, 'Mara').
grammar_rule(dieselpunk_character_names, femalename, 'Vera').
grammar_rule(dieselpunk_character_names, femalename, 'Greta').
grammar_rule(dieselpunk_character_names, femalename, 'Lena').
grammar_rule(dieselpunk_character_names, femalename, 'Natasha').
grammar_rule(dieselpunk_character_names, femalename, 'Ingrid').
grammar_rule(dieselpunk_character_names, familyname, '#surname#').
grammar_rule(dieselpunk_character_names, surname, 'Krause').
grammar_rule(dieselpunk_character_names, surname, 'Volkov').
grammar_rule(dieselpunk_character_names, surname, 'Gruber').
grammar_rule(dieselpunk_character_names, surname, 'Ashworth').
grammar_rule(dieselpunk_character_names, surname, 'Stahl').
grammar_rule(dieselpunk_character_names, surname, 'Chen').
grammar_rule(dieselpunk_character_names, surname, 'Brandt').
grammar_rule(dieselpunk_character_names, surname, 'Richter').
grammar_rule(dieselpunk_character_names, surname, 'Novak').
grammar_rule(dieselpunk_character_names, surname, 'Fischer').
grammar_rule(dieselpunk_character_names, surname, 'Muller').
grammar_rule(dieselpunk_character_names, surname, 'Petrov').

%% Dieselpunk Place Names
grammar(dieselpunk_place_names, 'dieselpunk_place_names').
grammar_description(dieselpunk_place_names, 'Generation of gritty industrial place names for streets and districts.').
grammar_rule(dieselpunk_place_names, origin, '#prefix# #suffix#').
grammar_rule(dieselpunk_place_names, prefix, 'Iron').
grammar_rule(dieselpunk_place_names, prefix, 'Rust').
grammar_rule(dieselpunk_place_names, prefix, 'Ash').
grammar_rule(dieselpunk_place_names, prefix, 'Smoke').
grammar_rule(dieselpunk_place_names, prefix, 'Coal').
grammar_rule(dieselpunk_place_names, prefix, 'Slag').
grammar_rule(dieselpunk_place_names, prefix, 'Rivet').
grammar_rule(dieselpunk_place_names, prefix, 'Grime').
grammar_rule(dieselpunk_place_names, suffix, 'haven').
grammar_rule(dieselpunk_place_names, suffix, 'ford').
grammar_rule(dieselpunk_place_names, suffix, 'hollow').
grammar_rule(dieselpunk_place_names, suffix, 'wick').
grammar_rule(dieselpunk_place_names, suffix, 'gate').
grammar_rule(dieselpunk_place_names, suffix, 'yard').
grammar_rule(dieselpunk_place_names, suffix, 'well').
grammar_rule(dieselpunk_place_names, suffix, 'ton').

%% Dieselpunk Business Names
grammar(dieselpunk_business_names, 'dieselpunk_business_names').
grammar_description(dieselpunk_business_names, 'Generation of gritty industrial-era business and establishment names.').
grammar_rule(dieselpunk_business_names, origin, 'The #adjective# #noun#').
grammar_rule(dieselpunk_business_names, adjective, 'Iron').
grammar_rule(dieselpunk_business_names, adjective, 'Brass').
grammar_rule(dieselpunk_business_names, adjective, 'Black').
grammar_rule(dieselpunk_business_names, adjective, 'Rusty').
grammar_rule(dieselpunk_business_names, adjective, 'Smoky').
grammar_rule(dieselpunk_business_names, adjective, 'Greasy').
grammar_rule(dieselpunk_business_names, adjective, 'Broken').
grammar_rule(dieselpunk_business_names, noun, 'Propeller').
grammar_rule(dieselpunk_business_names, noun, 'Piston').
grammar_rule(dieselpunk_business_names, noun, 'Anvil').
grammar_rule(dieselpunk_business_names, noun, 'Furnace').
grammar_rule(dieselpunk_business_names, noun, 'Lantern').
grammar_rule(dieselpunk_business_names, noun, 'Gauge').
grammar_rule(dieselpunk_business_names, noun, 'Wrench').

%% Dieselpunk Rumor Generator
grammar(dieselpunk_rumors, 'dieselpunk_rumors').
grammar_description(dieselpunk_rumors, 'Procedural rumor and gossip generation for taverns and speakeasies.').
grammar_rule(dieselpunk_rumors, origin, 'I heard that #subject# #action# #location#.').
grammar_rule(dieselpunk_rumors, subject, 'the Colonel').
grammar_rule(dieselpunk_rumors, subject, 'a factory foreman').
grammar_rule(dieselpunk_rumors, subject, 'an airship captain').
grammar_rule(dieselpunk_rumors, subject, 'someone from the resistance').
grammar_rule(dieselpunk_rumors, subject, 'a war profiteer').
grammar_rule(dieselpunk_rumors, subject, 'a government spy').
grammar_rule(dieselpunk_rumors, action, 'was seen smuggling weapons near').
grammar_rule(dieselpunk_rumors, action, 'is planning something big at').
grammar_rule(dieselpunk_rumors, action, 'disappeared after visiting').
grammar_rule(dieselpunk_rumors, action, 'got arrested outside').
grammar_rule(dieselpunk_rumors, action, 'has been secretly meeting people at').
grammar_rule(dieselpunk_rumors, location, 'the airship docks').
grammar_rule(dieselpunk_rumors, location, 'the old factory').
grammar_rule(dieselpunk_rumors, location, 'the speakeasy').
grammar_rule(dieselpunk_rumors, location, 'the war office').
grammar_rule(dieselpunk_rumors, location, 'the rail yard').
grammar_rule(dieselpunk_rumors, location, 'the mines').
