%% Insimul Grammars (Tracery): Dark Fantasy Cursed Lands
%% Source: data/worlds/dark_fantasy/grammars.pl
%% Created: 2026-04-03
%% Total: 4 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Dark Fantasy Character Names
grammar(dark_fantasy_character_names, 'dark_fantasy_character_names').
grammar_description(dark_fantasy_character_names, 'Name generation for grim dark-fantasy characters. Two-part names with harsh consonants and foreboding overtones.').
grammar_rule(dark_fantasy_character_names, origin, '#givenName# #familyName#').
grammar_rule(dark_fantasy_character_names, givenname, '#maleName#').
grammar_rule(dark_fantasy_character_names, givenname, '#femaleName#').
grammar_rule(dark_fantasy_character_names, malename, 'Aldric').
grammar_rule(dark_fantasy_character_names, malename, 'Corvus').
grammar_rule(dark_fantasy_character_names, malename, 'Ronan').
grammar_rule(dark_fantasy_character_names, malename, 'Garrett').
grammar_rule(dark_fantasy_character_names, malename, 'Silas').
grammar_rule(dark_fantasy_character_names, malename, 'Varek').
grammar_rule(dark_fantasy_character_names, malename, 'Edric').
grammar_rule(dark_fantasy_character_names, malename, 'Ambrose').
grammar_rule(dark_fantasy_character_names, malename, 'Theron').
grammar_rule(dark_fantasy_character_names, malename, 'Dredge').
grammar_rule(dark_fantasy_character_names, malename, 'Osric').
grammar_rule(dark_fantasy_character_names, malename, 'Callum').
grammar_rule(dark_fantasy_character_names, malename, 'Tormund').
grammar_rule(dark_fantasy_character_names, malename, 'Fenris').
grammar_rule(dark_fantasy_character_names, femalename, 'Sera').
grammar_rule(dark_fantasy_character_names, femalename, 'Elara').
grammar_rule(dark_fantasy_character_names, femalename, 'Morwen').
grammar_rule(dark_fantasy_character_names, femalename, 'Isolde').
grammar_rule(dark_fantasy_character_names, femalename, 'Vesper').
grammar_rule(dark_fantasy_character_names, femalename, 'Nyx').
grammar_rule(dark_fantasy_character_names, femalename, 'Maren').
grammar_rule(dark_fantasy_character_names, femalename, 'Brenna').
grammar_rule(dark_fantasy_character_names, femalename, 'Ravenna').
grammar_rule(dark_fantasy_character_names, femalename, 'Ylva').
grammar_rule(dark_fantasy_character_names, femalename, 'Sable').
grammar_rule(dark_fantasy_character_names, femalename, 'Lucretia').
grammar_rule(dark_fantasy_character_names, familyname, '#surname#').
grammar_rule(dark_fantasy_character_names, surname, 'Voss').
grammar_rule(dark_fantasy_character_names, surname, 'Thane').
grammar_rule(dark_fantasy_character_names, surname, 'Blackwood').
grammar_rule(dark_fantasy_character_names, surname, 'Ashmore').
grammar_rule(dark_fantasy_character_names, surname, 'Greymist').
grammar_rule(dark_fantasy_character_names, surname, 'Draven').
grammar_rule(dark_fantasy_character_names, surname, 'Holloway').
grammar_rule(dark_fantasy_character_names, surname, 'Fenwick').
grammar_rule(dark_fantasy_character_names, surname, 'Kael').
grammar_rule(dark_fantasy_character_names, surname, 'Wren').
grammar_rule(dark_fantasy_character_names, surname, 'Holt').
grammar_rule(dark_fantasy_character_names, surname, 'Sable').
grammar_rule(dark_fantasy_character_names, surname, 'Graves').
grammar_rule(dark_fantasy_character_names, surname, 'Mordain').

%% Dark Fantasy Place Names
grammar(dark_fantasy_place_names, 'dark_fantasy_place_names').
grammar_description(dark_fantasy_place_names, 'Generation of grim and foreboding place names for dark fantasy settlements and locations.').
grammar_rule(dark_fantasy_place_names, origin, '#prefix##suffix#').
grammar_rule(dark_fantasy_place_names, prefix, 'Ashen').
grammar_rule(dark_fantasy_place_names, prefix, 'Hollow').
grammar_rule(dark_fantasy_place_names, prefix, 'Graven').
grammar_rule(dark_fantasy_place_names, prefix, 'Black').
grammar_rule(dark_fantasy_place_names, prefix, 'Dread').
grammar_rule(dark_fantasy_place_names, prefix, 'Bone').
grammar_rule(dark_fantasy_place_names, prefix, 'Wither').
grammar_rule(dark_fantasy_place_names, prefix, 'Shadow').
grammar_rule(dark_fantasy_place_names, prefix, 'Blight').
grammar_rule(dark_fantasy_place_names, prefix, 'Corpse').
grammar_rule(dark_fantasy_place_names, suffix, 'vale').
grammar_rule(dark_fantasy_place_names, suffix, 'mere').
grammar_rule(dark_fantasy_place_names, suffix, 'hold').
grammar_rule(dark_fantasy_place_names, suffix, 'moor').
grammar_rule(dark_fantasy_place_names, suffix, 'fall').
grammar_rule(dark_fantasy_place_names, suffix, 'gate').
grammar_rule(dark_fantasy_place_names, suffix, 'wood').
grammar_rule(dark_fantasy_place_names, suffix, 'marsh').
grammar_rule(dark_fantasy_place_names, suffix, 'crest').
grammar_rule(dark_fantasy_place_names, suffix, 'barrow').

%% Dark Fantasy Rumor Generation
grammar(dark_fantasy_rumors, 'dark_fantasy_rumors').
grammar_description(dark_fantasy_rumors, 'Procedural rumor generation for tavern talk and NPC chatter in the cursed lands.').
grammar_rule(dark_fantasy_rumors, origin, '#opener# #subject# #event#.').
grammar_rule(dark_fantasy_rumors, opener, 'They say').
grammar_rule(dark_fantasy_rumors, opener, 'I heard').
grammar_rule(dark_fantasy_rumors, opener, 'Word is').
grammar_rule(dark_fantasy_rumors, opener, 'The dead whisper that').
grammar_rule(dark_fantasy_rumors, opener, 'A traveler claimed').
grammar_rule(dark_fantasy_rumors, subject, 'the undead lord').
grammar_rule(dark_fantasy_rumors, subject, 'the witch of the mire').
grammar_rule(dark_fantasy_rumors, subject, 'the cursed knight').
grammar_rule(dark_fantasy_rumors, subject, 'a plague doctor').
grammar_rule(dark_fantasy_rumors, subject, 'the gravedigger').
grammar_rule(dark_fantasy_rumors, subject, 'something in the forest').
grammar_rule(dark_fantasy_rumors, event, 'was seen near the old crypt last night').
grammar_rule(dark_fantasy_rumors, event, 'has been gathering corpses from the battlefield').
grammar_rule(dark_fantasy_rumors, event, 'made a pact with forces beyond the veil').
grammar_rule(dark_fantasy_rumors, event, 'possesses a soul gem of immense power').
grammar_rule(dark_fantasy_rumors, event, 'can cure the blight but demands a terrible price').
grammar_rule(dark_fantasy_rumors, event, 'is searching for the lost reliquary').

%% Dark Fantasy Epitaph Generation
grammar(dark_fantasy_epitaphs, 'dark_fantasy_epitaphs').
grammar_description(dark_fantasy_epitaphs, 'Tombstone and memorial inscriptions found throughout the cursed lands.').
grammar_rule(dark_fantasy_epitaphs, origin, 'Here lies #descriptor#, #epitaph#').
grammar_rule(dark_fantasy_epitaphs, descriptor, 'a fallen knight').
grammar_rule(dark_fantasy_epitaphs, descriptor, 'a faithful servant').
grammar_rule(dark_fantasy_epitaphs, descriptor, 'one who defied the dark').
grammar_rule(dark_fantasy_epitaphs, descriptor, 'a soul unclaimed').
grammar_rule(dark_fantasy_epitaphs, descriptor, 'the last of a bloodline').
grammar_rule(dark_fantasy_epitaphs, epitaph, 'who found peace where none was promised').
grammar_rule(dark_fantasy_epitaphs, epitaph, 'taken by the blight in the Year of Ash').
grammar_rule(dark_fantasy_epitaphs, epitaph, 'whose blade broke before their will did').
grammar_rule(dark_fantasy_epitaphs, epitaph, 'may the worms grant what the gods would not').
grammar_rule(dark_fantasy_epitaphs, epitaph, 'do not weep -- they are not truly gone').
