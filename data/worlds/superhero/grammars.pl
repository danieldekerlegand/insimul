%% Insimul Grammars (Tracery): Superhero
%% Source: data/worlds/superhero/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Superhero Character Names
grammar(superhero_character_names, 'superhero_character_names').
grammar_description(superhero_character_names, 'Modern American name generation for a superhero metropolis setting.').
grammar_rule(superhero_character_names, origin, '#givenName# #familyName#').
grammar_rule(superhero_character_names, givenname, '#maleName#').
grammar_rule(superhero_character_names, givenname, '#femaleName#').
grammar_rule(superhero_character_names, malename, 'Marcus').
grammar_rule(superhero_character_names, malename, 'James').
grammar_rule(superhero_character_names, malename, 'Derek').
grammar_rule(superhero_character_names, malename, 'Victor').
grammar_rule(superhero_character_names, malename, 'Frank').
grammar_rule(superhero_character_names, malename, 'Raymond').
grammar_rule(superhero_character_names, malename, 'Kai').
grammar_rule(superhero_character_names, malename, 'Bruno').
grammar_rule(superhero_character_names, malename, 'Tommy').
grammar_rule(superhero_character_names, malename, 'Hector').
grammar_rule(superhero_character_names, malename, 'Nathan').
grammar_rule(superhero_character_names, malename, 'Grant').
grammar_rule(superhero_character_names, malename, 'Leo').
grammar_rule(superhero_character_names, malename, 'Malik').
grammar_rule(superhero_character_names, malename, 'Dante').
grammar_rule(superhero_character_names, femalename, 'Sasha').
grammar_rule(superhero_character_names, femalename, 'Lin').
grammar_rule(superhero_character_names, femalename, 'Patricia').
grammar_rule(superhero_character_names, femalename, 'Nora').
grammar_rule(superhero_character_names, femalename, 'Mara').
grammar_rule(superhero_character_names, femalename, 'Elaine').
grammar_rule(superhero_character_names, femalename, 'Rosa').
grammar_rule(superhero_character_names, femalename, 'Lily').
grammar_rule(superhero_character_names, femalename, 'Carmen').
grammar_rule(superhero_character_names, femalename, 'Zara').
grammar_rule(superhero_character_names, femalename, 'Priya').
grammar_rule(superhero_character_names, femalename, 'Dana').
grammar_rule(superhero_character_names, femalename, 'Eve').
grammar_rule(superhero_character_names, femalename, 'Iris').
grammar_rule(superhero_character_names, femalename, 'Jade').
grammar_rule(superhero_character_names, familyname, '#surname#').
grammar_rule(superhero_character_names, surname, 'Cole').
grammar_rule(superhero_character_names, surname, 'Orlov').
grammar_rule(superhero_character_names, surname, 'Kepler').
grammar_rule(superhero_character_names, surname, 'Zhao').
grammar_rule(superhero_character_names, surname, 'Stone').
grammar_rule(superhero_character_names, surname, 'Graves').
grammar_rule(superhero_character_names, surname, 'Vex').
grammar_rule(superhero_character_names, surname, 'Nox').
grammar_rule(superhero_character_names, surname, 'Ward').
grammar_rule(superhero_character_names, surname, 'Morrow').
grammar_rule(superhero_character_names, surname, 'Vance').
grammar_rule(superhero_character_names, surname, 'Delgado').

%% Hero Alias Names
grammar(hero_alias_names, 'hero_alias_names').
grammar_description(hero_alias_names, 'Codename generation for superheroes and villains.').
grammar_rule(hero_alias_names, origin, '#prefix##suffix#').
grammar_rule(hero_alias_names, prefix, 'Shadow').
grammar_rule(hero_alias_names, prefix, 'Iron').
grammar_rule(hero_alias_names, prefix, 'Storm').
grammar_rule(hero_alias_names, prefix, 'Quantum').
grammar_rule(hero_alias_names, prefix, 'Night').
grammar_rule(hero_alias_names, prefix, 'Blaze').
grammar_rule(hero_alias_names, prefix, 'Frost').
grammar_rule(hero_alias_names, prefix, 'Crimson').
grammar_rule(hero_alias_names, suffix, 'blade').
grammar_rule(hero_alias_names, suffix, 'hawk').
grammar_rule(hero_alias_names, suffix, 'strike').
grammar_rule(hero_alias_names, suffix, 'clad').
grammar_rule(hero_alias_names, suffix, 'spark').
grammar_rule(hero_alias_names, suffix, 'shade').
grammar_rule(hero_alias_names, suffix, 'fist').
grammar_rule(hero_alias_names, suffix, 'wing').

%% Superhero Place Names
grammar(superhero_place_names, 'superhero_place_names').
grammar_description(superhero_place_names, 'Generation of urban location names for a superhero city.').
grammar_rule(superhero_place_names, origin, '#prefix# #suffix#').
grammar_rule(superhero_place_names, prefix, 'Sentinel').
grammar_rule(superhero_place_names, prefix, 'Liberty').
grammar_rule(superhero_place_names, prefix, 'Vanguard').
grammar_rule(superhero_place_names, prefix, 'Harbor').
grammar_rule(superhero_place_names, prefix, 'Circuit').
grammar_rule(superhero_place_names, prefix, 'Grimm').
grammar_rule(superhero_place_names, suffix, 'Avenue').
grammar_rule(superhero_place_names, suffix, 'Boulevard').
grammar_rule(superhero_place_names, suffix, 'Plaza').
grammar_rule(superhero_place_names, suffix, 'Road').
grammar_rule(superhero_place_names, suffix, 'Drive').
grammar_rule(superhero_place_names, suffix, 'Alley').
