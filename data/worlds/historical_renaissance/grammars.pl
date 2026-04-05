%% Insimul Grammars (Tracery): Renaissance City-States
%% Source: data/worlds/historical_renaissance/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Renaissance Character Names
grammar(renaissance_character_names, 'renaissance_character_names').
grammar_description(renaissance_character_names, 'Name generation for Italian Renaissance city-state citizens, artists, and merchants.').
grammar_rule(renaissance_character_names, origin, '#givenName# #familyName#').
grammar_rule(renaissance_character_names, givenname, '#maleName#').
grammar_rule(renaissance_character_names, givenname, '#femaleName#').
grammar_rule(renaissance_character_names, malename, 'Lorenzo').
grammar_rule(renaissance_character_names, malename, 'Cosimo').
grammar_rule(renaissance_character_names, malename, 'Alessandro').
grammar_rule(renaissance_character_names, malename, 'Marco').
grammar_rule(renaissance_character_names, malename, 'Andrea').
grammar_rule(renaissance_character_names, malename, 'Nicolao').
grammar_rule(renaissance_character_names, malename, 'Tommaso').
grammar_rule(renaissance_character_names, malename, 'Giacomo').
grammar_rule(renaissance_character_names, malename, 'Girolamo').
grammar_rule(renaissance_character_names, malename, 'Giovanni').
grammar_rule(renaissance_character_names, malename, 'Francesco').
grammar_rule(renaissance_character_names, malename, 'Bartolomeo').
grammar_rule(renaissance_character_names, malename, 'Raffaello').
grammar_rule(renaissance_character_names, malename, 'Filippo').
grammar_rule(renaissance_character_names, femalename, 'Isabella').
grammar_rule(renaissance_character_names, femalename, 'Giulia').
grammar_rule(renaissance_character_names, femalename, 'Caterina').
grammar_rule(renaissance_character_names, femalename, 'Elena').
grammar_rule(renaissance_character_names, femalename, 'Bianca').
grammar_rule(renaissance_character_names, femalename, 'Lucia').
grammar_rule(renaissance_character_names, femalename, 'Chiara').
grammar_rule(renaissance_character_names, femalename, 'Sofia').
grammar_rule(renaissance_character_names, femalename, 'Alessandra').
grammar_rule(renaissance_character_names, femalename, 'Simonetta').
grammar_rule(renaissance_character_names, femalename, 'Fiammetta').
grammar_rule(renaissance_character_names, familyname, '#surname#').
grammar_rule(renaissance_character_names, surname, 'Valori').
grammar_rule(renaissance_character_names, surname, 'Rinaldi').
grammar_rule(renaissance_character_names, surname, 'Contarini').
grammar_rule(renaissance_character_names, surname, 'Bellini').
grammar_rule(renaissance_character_names, surname, 'Orsini').
grammar_rule(renaissance_character_names, surname, 'Moretti').
grammar_rule(renaissance_character_names, surname, 'Galli').
grammar_rule(renaissance_character_names, surname, 'Strozzi').
grammar_rule(renaissance_character_names, surname, 'Pazzi').
grammar_rule(renaissance_character_names, surname, 'Albizzi').
grammar_rule(renaissance_character_names, surname, 'Soderini').
grammar_rule(renaissance_character_names, surname, 'Bardi').

%% Renaissance Place Names
grammar(renaissance_place_names, 'renaissance_place_names').
grammar_description(renaissance_place_names, 'Generation of Italian Renaissance-style place and street names.').
grammar_rule(renaissance_place_names, origin, '#placeType# #placeQuality#').
grammar_rule(renaissance_place_names, placetype, 'Piazza').
grammar_rule(renaissance_place_names, placetype, 'Via').
grammar_rule(renaissance_place_names, placetype, 'Palazzo').
grammar_rule(renaissance_place_names, placetype, 'Loggia').
grammar_rule(renaissance_place_names, placetype, 'Ponte').
grammar_rule(renaissance_place_names, placetype, 'Fondaco').
grammar_rule(renaissance_place_names, placequality, 'della Signoria').
grammar_rule(renaissance_place_names, placequality, 'dei Mercanti').
grammar_rule(renaissance_place_names, placequality, 'degli Artisti').
grammar_rule(renaissance_place_names, placequality, 'del Duomo').
grammar_rule(renaissance_place_names, placequality, 'della Croce').
grammar_rule(renaissance_place_names, placequality, 'del Leone').
grammar_rule(renaissance_place_names, placequality, 'di San Marco').
grammar_rule(renaissance_place_names, placequality, 'della Lana').

%% Renaissance Business Names
grammar(renaissance_business_names, 'renaissance_business_names').
grammar_description(renaissance_business_names, 'Generation of Italian Renaissance-style workshop and shop names.').
grammar_rule(renaissance_business_names, origin, '#shopType# #qualifier#').
grammar_rule(renaissance_business_names, shoptype, 'Bottega').
grammar_rule(renaissance_business_names, shoptype, 'Fondaco').
grammar_rule(renaissance_business_names, shoptype, 'Spezieria').
grammar_rule(renaissance_business_names, shoptype, 'Taverna').
grammar_rule(renaissance_business_names, shoptype, 'Stamperia').
grammar_rule(renaissance_business_names, shoptype, 'Banco').
grammar_rule(renaissance_business_names, qualifier, 'del Giglio').
grammar_rule(renaissance_business_names, qualifier, 'della Stella').
grammar_rule(renaissance_business_names, qualifier, 'del Sole').
grammar_rule(renaissance_business_names, qualifier, 'della Rosa').
grammar_rule(renaissance_business_names, qualifier, 'del Pellegrino').
grammar_rule(renaissance_business_names, qualifier, 'della Fortuna').
