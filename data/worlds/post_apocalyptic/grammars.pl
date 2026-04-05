%% Insimul Grammars (Tracery): Post-Apocalyptic Wasteland
%% Source: data/worlds/post_apocalyptic/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Wasteland Character Names
grammar(wasteland_character_names, 'wasteland_character_names').
grammar_description(wasteland_character_names, 'Gritty post-apocalyptic name generation mixing short tough names with practical surnames.').
grammar_rule(wasteland_character_names, origin, '#givenName# #familyName#').
grammar_rule(wasteland_character_names, givenname, '#maleName#').
grammar_rule(wasteland_character_names, givenname, '#femaleName#').
grammar_rule(wasteland_character_names, malename, 'Ash').
grammar_rule(wasteland_character_names, malename, 'Cutter').
grammar_rule(wasteland_character_names, malename, 'Silas').
grammar_rule(wasteland_character_names, malename, 'Grim').
grammar_rule(wasteland_character_names, malename, 'Remy').
grammar_rule(wasteland_character_names, malename, 'Nix').
grammar_rule(wasteland_character_names, malename, 'Elias').
grammar_rule(wasteland_character_names, malename, 'Harlan').
grammar_rule(wasteland_character_names, malename, 'Vex').
grammar_rule(wasteland_character_names, malename, 'Flint').
grammar_rule(wasteland_character_names, malename, 'Rusty').
grammar_rule(wasteland_character_names, malename, 'Cole').
grammar_rule(wasteland_character_names, femalename, 'Wren').
grammar_rule(wasteland_character_names, femalename, 'Cass').
grammar_rule(wasteland_character_names, femalename, 'Jo').
grammar_rule(wasteland_character_names, femalename, 'Mara').
grammar_rule(wasteland_character_names, femalename, 'Petra').
grammar_rule(wasteland_character_names, femalename, 'Sable').
grammar_rule(wasteland_character_names, femalename, 'Moth').
grammar_rule(wasteland_character_names, femalename, 'Lina').
grammar_rule(wasteland_character_names, femalename, 'Ember').
grammar_rule(wasteland_character_names, femalename, 'Sage').
grammar_rule(wasteland_character_names, femalename, 'Raven').
grammar_rule(wasteland_character_names, femalename, 'Dusk').
grammar_rule(wasteland_character_names, familyname, '#surname#').
grammar_rule(wasteland_character_names, surname, 'Mercer').
grammar_rule(wasteland_character_names, surname, 'Duval').
grammar_rule(wasteland_character_names, surname, 'Corbin').
grammar_rule(wasteland_character_names, surname, 'Volkov').
grammar_rule(wasteland_character_names, surname, 'Holloway').
grammar_rule(wasteland_character_names, surname, 'Kane').
grammar_rule(wasteland_character_names, surname, 'Thornton').
grammar_rule(wasteland_character_names, surname, 'Reyes').
grammar_rule(wasteland_character_names, surname, 'Briggs').
grammar_rule(wasteland_character_names, surname, 'Okafor').
grammar_rule(wasteland_character_names, surname, 'Cross').
grammar_rule(wasteland_character_names, surname, 'Graves').

%% Wasteland Place Names
grammar(wasteland_place_names, 'wasteland_place_names').
grammar_description(wasteland_place_names, 'Generation of post-apocalyptic settlement and landmark names.').
grammar_rule(wasteland_place_names, origin, '#prefix# #suffix#').
grammar_rule(wasteland_place_names, prefix, 'Rust').
grammar_rule(wasteland_place_names, prefix, 'Ash').
grammar_rule(wasteland_place_names, prefix, 'Iron').
grammar_rule(wasteland_place_names, prefix, 'Dead').
grammar_rule(wasteland_place_names, prefix, 'Bone').
grammar_rule(wasteland_place_names, prefix, 'Scrap').
grammar_rule(wasteland_place_names, prefix, 'Dust').
grammar_rule(wasteland_place_names, prefix, 'Black').
grammar_rule(wasteland_place_names, suffix, 'hollow').
grammar_rule(wasteland_place_names, suffix, 'ridge').
grammar_rule(wasteland_place_names, suffix, 'fall').
grammar_rule(wasteland_place_names, suffix, 'field').
grammar_rule(wasteland_place_names, suffix, 'yard').
grammar_rule(wasteland_place_names, suffix, 'pit').
grammar_rule(wasteland_place_names, suffix, 'gate').
grammar_rule(wasteland_place_names, suffix, 'rock').

%% Wasteland Business Names
grammar(wasteland_business_names, 'wasteland_business_names').
grammar_description(wasteland_business_names, 'Generation of post-apocalyptic shop and service names.').
grammar_rule(wasteland_business_names, origin, '#businessType# #businessQuality#').
grammar_rule(wasteland_business_names, businesstype, 'The').
grammar_rule(wasteland_business_names, businessquality, 'Scrap Heap').
grammar_rule(wasteland_business_names, businessquality, 'Rusty Barrel').
grammar_rule(wasteland_business_names, businessquality, 'Last Drop').
grammar_rule(wasteland_business_names, businessquality, 'Iron Tooth').
grammar_rule(wasteland_business_names, businessquality, 'Rad Shack').
grammar_rule(wasteland_business_names, businessquality, 'Bone Yard').
grammar_rule(wasteland_business_names, businessquality, 'Dust Bowl').
grammar_rule(wasteland_business_names, businessquality, 'Dead End').
