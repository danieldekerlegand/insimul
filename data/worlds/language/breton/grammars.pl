%% Insimul Grammars (Tracery): Medieval Brittany
%% Source: data/worlds/language/breton/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 — grammar(AtomId, Name)
%%   grammar_rule/3 — grammar_rule(GrammarAtom, RuleKey, Expansion)

%% medieval_breton_character_names
grammar(medieval_breton_character_names, 'medieval_breton_character_names').
grammar_description(medieval_breton_character_names, 'Character names for a medieval Breton world. All names MUST be culturally authentic Breton names — use real Breton first names, surnames, and naming conventions.').
grammar_rule(medieval_breton_character_names, origin, '#givenName# #familyName#').
grammar_rule(medieval_breton_character_names, givenname, '#simpleMale#').
grammar_rule(medieval_breton_character_names, givenname, '#simpleFemale#').
grammar_rule(medieval_breton_character_names, simplemale, 'Yann').
grammar_rule(medieval_breton_character_names, simplemale, 'Ewen').
grammar_rule(medieval_breton_character_names, simplemale, 'Goulven').
grammar_rule(medieval_breton_character_names, simplemale, 'Riwal').
grammar_rule(medieval_breton_character_names, simplemale, 'Jakes').
grammar_rule(medieval_breton_character_names, simplemale, 'Per').
grammar_rule(medieval_breton_character_names, simplemale, 'Konan').
grammar_rule(medieval_breton_character_names, simplemale, 'Erwan').
grammar_rule(medieval_breton_character_names, simplemale, 'Alan').
grammar_rule(medieval_breton_character_names, simplemale, 'Tugdual').
grammar_rule(medieval_breton_character_names, simplemale, 'Jakez').
grammar_rule(medieval_breton_character_names, simplemale, 'Tangi').
grammar_rule(medieval_breton_character_names, simplemale, 'Gwenaël').
grammar_rule(medieval_breton_character_names, simplemale, 'Divi').
grammar_rule(medieval_breton_character_names, simplemale, 'Paol').
grammar_rule(medieval_breton_character_names, simplefemale, 'Soazig').
grammar_rule(medieval_breton_character_names, simplefemale, 'Nolwenn').
grammar_rule(medieval_breton_character_names, simplefemale, 'Anna').
grammar_rule(medieval_breton_character_names, simplefemale, 'Maiwenn').
grammar_rule(medieval_breton_character_names, simplefemale, 'Katell').
grammar_rule(medieval_breton_character_names, simplefemale, 'Enora').
grammar_rule(medieval_breton_character_names, simplefemale, 'Bleunvenn').
grammar_rule(medieval_breton_character_names, simplefemale, 'Rozenn').
grammar_rule(medieval_breton_character_names, simplefemale, 'Gwenael').
grammar_rule(medieval_breton_character_names, simplefemale, 'Loiza').
grammar_rule(medieval_breton_character_names, simplefemale, 'Mabilen').
grammar_rule(medieval_breton_character_names, simplefemale, 'Adela').
grammar_rule(medieval_breton_character_names, simplefemale, 'Annaig').
grammar_rule(medieval_breton_character_names, simplefemale, 'Youna').
grammar_rule(medieval_breton_character_names, familyname, '#surname#').
grammar_rule(medieval_breton_character_names, familyname, '#surname#').
grammar_rule(medieval_breton_character_names, familyname, '#surname#').
grammar_rule(medieval_breton_character_names, familyname, '#prefixedSurname#').
grammar_rule(medieval_breton_character_names, prefixedsurname, '#surnamePrefix# #surname#').
grammar_rule(medieval_breton_character_names, surnameprefix, 'Le').
grammar_rule(medieval_breton_character_names, surnameprefix, 'Ker').
grammar_rule(medieval_breton_character_names, surnameprefix, 'Pen').
grammar_rule(medieval_breton_character_names, surnameprefix, 'Lan').
grammar_rule(medieval_breton_character_names, surname, 'Le Bihan').
grammar_rule(medieval_breton_character_names, surname, 'Kernev').
grammar_rule(medieval_breton_character_names, surname, 'Karadeg').
grammar_rule(medieval_breton_character_names, surname, 'Morvan').
grammar_rule(medieval_breton_character_names, surname, 'Guivarch').
grammar_rule(medieval_breton_character_names, surname, 'Le Goff').
grammar_rule(medieval_breton_character_names, surname, 'Le Roux').
grammar_rule(medieval_breton_character_names, surname, 'Even').
grammar_rule(medieval_breton_character_names, surname, 'Corre').
grammar_rule(medieval_breton_character_names, surname, 'Le Floch').
grammar_rule(medieval_breton_character_names, surname, 'Le Bars').
grammar_rule(medieval_breton_character_names, surname, 'Quéré').
grammar_rule(medieval_breton_character_names, surname, 'Le Menn').
grammar_rule(medieval_breton_character_names, surname, 'Tanguy').
grammar_rule(medieval_breton_character_names, surname, 'Kerloc''h').
grammar_tag(medieval_breton_character_names, generated).
grammar_tag(medieval_breton_character_names, historical_medieval).
grammar_tag(medieval_breton_character_names, name).
grammar_tag(medieval_breton_character_names, breton).
grammar_tag(medieval_breton_character_names, character).
grammar_tag(medieval_breton_character_names, names).

%% medieval_breton_settlement_names
grammar(medieval_breton_settlement_names, 'medieval_breton_settlement_names').
grammar_description(medieval_breton_settlement_names, 'Settlement names for a medieval Breton world. Use authentic Breton place-naming conventions with Celtic prefixes.').
grammar_rule(medieval_breton_settlement_names, origin, '#prefix##baseName#').
grammar_rule(medieval_breton_settlement_names, origin, '#baseName##locationSuffix#').
grammar_rule(medieval_breton_settlement_names, origin, '#saintName#').
grammar_rule(medieval_breton_settlement_names, origin, '#prefix##baseName##locationSuffix#').
grammar_rule(medieval_breton_settlement_names, prefix, 'Porzh-').
grammar_rule(medieval_breton_settlement_names, prefix, 'Ker-').
grammar_rule(medieval_breton_settlement_names, prefix, 'Plou-').
grammar_rule(medieval_breton_settlement_names, prefix, 'Lan-').
grammar_rule(medieval_breton_settlement_names, prefix, 'Tre-').
grammar_rule(medieval_breton_settlement_names, prefix, 'Pen-').
grammar_rule(medieval_breton_settlement_names, basename, 'Gwenn').
grammar_rule(medieval_breton_settlement_names, basename, 'Du').
grammar_rule(medieval_breton_settlement_names, basename, 'Mor').
grammar_rule(medieval_breton_settlement_names, basename, 'Vraz').
grammar_rule(medieval_breton_settlement_names, basename, 'Bihan').
grammar_rule(medieval_breton_settlement_names, basename, 'Nevez').
grammar_rule(medieval_breton_settlement_names, locationsuffix, '-ar-Mor').
grammar_rule(medieval_breton_settlement_names, locationsuffix, '-ar-C''hoat').
grammar_rule(medieval_breton_settlement_names, locationsuffix, '-an-Traon').
grammar_rule(medieval_breton_settlement_names, locationsuffix, '-ar-Mein').
grammar_rule(medieval_breton_settlement_names, locationsuffix, '-ar-Lann').
grammar_rule(medieval_breton_settlement_names, saintname, 'Lok-Marzhin').
grammar_rule(medieval_breton_settlement_names, saintname, 'Lok-Ronan').
grammar_rule(medieval_breton_settlement_names, saintname, 'Lok-Ildut').
grammar_rule(medieval_breton_settlement_names, saintname, 'Lan-Derrien').
grammar_rule(medieval_breton_settlement_names, saintname, 'Plou-Gernev').
grammar_tag(medieval_breton_settlement_names, generated).
grammar_tag(medieval_breton_settlement_names, historical_medieval).
grammar_tag(medieval_breton_settlement_names, name).
grammar_tag(medieval_breton_settlement_names, breton).
grammar_tag(medieval_breton_settlement_names, settlement).
grammar_tag(medieval_breton_settlement_names, location).
grammar_tag(medieval_breton_settlement_names, names).

%% medieval_breton_business_names
grammar(medieval_breton_business_names, 'medieval_breton_business_names').
grammar_description(medieval_breton_business_names, 'Business and establishment names for a medieval Breton world. Use authentic Breton naming conventions for workshops, taverns, and trades.').
grammar_rule(medieval_breton_business_names, origin, 'Ti #surname#').
grammar_rule(medieval_breton_business_names, origin, '#prefix# #establishment_noun# #qualifier#').
grammar_rule(medieval_breton_business_names, origin, '#business_type# #surname#').
grammar_rule(medieval_breton_business_names, origin, '#establishment_noun# ar #place_word#').
grammar_rule(medieval_breton_business_names, origin, '#business_type# ar #place_word#').
grammar_rule(medieval_breton_business_names, prefix, 'An').
grammar_rule(medieval_breton_business_names, prefix, 'Ar').
grammar_rule(medieval_breton_business_names, prefix, 'Al').
grammar_rule(medieval_breton_business_names, establishment_noun, 'Tavarn').
grammar_rule(medieval_breton_business_names, establishment_noun, 'Stal').
grammar_rule(medieval_breton_business_names, establishment_noun, 'Gwiadenn').
grammar_rule(medieval_breton_business_names, establishment_noun, 'Govadeg').
grammar_rule(medieval_breton_business_names, establishment_noun, 'Forn').
grammar_rule(medieval_breton_business_names, establishment_noun, 'Waskel').
grammar_rule(medieval_breton_business_names, qualifier, 'Kozh').
grammar_rule(medieval_breton_business_names, qualifier, 'Nevez').
grammar_rule(medieval_breton_business_names, qualifier, 'Bras').
grammar_rule(medieval_breton_business_names, qualifier, 'Bihan').
grammar_rule(medieval_breton_business_names, qualifier, 'Du').
grammar_rule(medieval_breton_business_names, business_type, 'Pesketaerezh').
grammar_rule(medieval_breton_business_names, business_type, 'Govadeg').
grammar_rule(medieval_breton_business_names, business_type, 'Gwiadenn').
grammar_rule(medieval_breton_business_names, business_type, 'Forn').
grammar_rule(medieval_breton_business_names, business_type, 'Waskel Sistr').
grammar_rule(medieval_breton_business_names, surname, 'Le Bihan').
grammar_rule(medieval_breton_business_names, surname, 'Kernev').
grammar_rule(medieval_breton_business_names, surname, 'Morvan').
grammar_rule(medieval_breton_business_names, surname, 'Guivarch').
grammar_rule(medieval_breton_business_names, surname, 'Le Goff').
grammar_rule(medieval_breton_business_names, surname, 'Tanguy').
grammar_rule(medieval_breton_business_names, place_word, 'Mor').
grammar_rule(medieval_breton_business_names, place_word, 'Porzh').
grammar_rule(medieval_breton_business_names, place_word, 'Lann').
grammar_rule(medieval_breton_business_names, place_word, 'Mein Hir').
grammar_rule(medieval_breton_business_names, place_word, 'C''hoat').
grammar_tag(medieval_breton_business_names, generated).
grammar_tag(medieval_breton_business_names, historical_medieval).
grammar_tag(medieval_breton_business_names, name).
grammar_tag(medieval_breton_business_names, breton).
grammar_tag(medieval_breton_business_names, business).
grammar_tag(medieval_breton_business_names, establishment).
grammar_tag(medieval_breton_business_names, names).
