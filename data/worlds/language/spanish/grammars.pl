%% Insimul Grammars (Tracery): Spanish Castile
%% Source: data/worlds/language/spanish/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Spanish Character Names (given + paternal surname + maternal surname)
grammar(spanish_character_names, 'spanish_character_names').
grammar_description(spanish_character_names, 'Authentic Spanish name generation following the convention of given name plus two family names (paternal and maternal surnames).').
grammar_rule(spanish_character_names, origin, '#givenName# #paternalSurname# #maternalSurname#').
grammar_rule(spanish_character_names, givenname, '#maleName#').
grammar_rule(spanish_character_names, givenname, '#femaleName#').
grammar_rule(spanish_character_names, malename, 'Carlos').
grammar_rule(spanish_character_names, malename, 'Antonio').
grammar_rule(spanish_character_names, malename, 'Manuel').
grammar_rule(spanish_character_names, malename, 'Pablo').
grammar_rule(spanish_character_names, malename, 'Diego').
grammar_rule(spanish_character_names, malename, 'Javier').
grammar_rule(spanish_character_names, malename, 'Rafael').
grammar_rule(spanish_character_names, malename, 'Alejandro').
grammar_rule(spanish_character_names, malename, 'Francisco').
grammar_rule(spanish_character_names, malename, 'Miguel').
grammar_rule(spanish_character_names, malename, 'Pedro').
grammar_rule(spanish_character_names, malename, 'Andres').
grammar_rule(spanish_character_names, malename, 'Fernando').
grammar_rule(spanish_character_names, malename, 'Sergio').
grammar_rule(spanish_character_names, malename, 'Daniel').
grammar_rule(spanish_character_names, femalename, 'Elena').
grammar_rule(spanish_character_names, femalename, 'Carmen').
grammar_rule(spanish_character_names, femalename, 'Pilar').
grammar_rule(spanish_character_names, femalename, 'Isabel').
grammar_rule(spanish_character_names, femalename, 'Lucia').
grammar_rule(spanish_character_names, femalename, 'Sofia').
grammar_rule(spanish_character_names, femalename, 'Maria').
grammar_rule(spanish_character_names, femalename, 'Alba').
grammar_rule(spanish_character_names, femalename, 'Rosa').
grammar_rule(spanish_character_names, femalename, 'Ines').
grammar_rule(spanish_character_names, femalename, 'Teresa').
grammar_rule(spanish_character_names, femalename, 'Dolores').
grammar_rule(spanish_character_names, femalename, 'Marta').
grammar_rule(spanish_character_names, femalename, 'Beatriz').
grammar_rule(spanish_character_names, femalename, 'Ana').
grammar_rule(spanish_character_names, paternalsurname, '#surname#').
grammar_rule(spanish_character_names, maternalsurname, '#surname#').
grammar_rule(spanish_character_names, surname, 'Garcia').
grammar_rule(spanish_character_names, surname, 'Martinez').
grammar_rule(spanish_character_names, surname, 'Lopez').
grammar_rule(spanish_character_names, surname, 'Rodriguez').
grammar_rule(spanish_character_names, surname, 'Fernandez').
grammar_rule(spanish_character_names, surname, 'Hernandez').
grammar_rule(spanish_character_names, surname, 'Sanchez').
grammar_rule(spanish_character_names, surname, 'Diaz').
grammar_rule(spanish_character_names, surname, 'Moreno').
grammar_rule(spanish_character_names, surname, 'Munoz').
grammar_rule(spanish_character_names, surname, 'Navarro').
grammar_rule(spanish_character_names, surname, 'Serrano').
grammar_rule(spanish_character_names, surname, 'Ortega').
grammar_rule(spanish_character_names, surname, 'Blanco').
grammar_rule(spanish_character_names, surname, 'Castillo').
grammar_rule(spanish_character_names, surname, 'Gil').
grammar_rule(spanish_character_names, surname, 'Ruiz').
grammar_rule(spanish_character_names, surname, 'Torres').
grammar_rule(spanish_character_names, surname, 'Vega').
grammar_rule(spanish_character_names, surname, 'Perez').
grammar_rule(spanish_character_names, surname, 'Romero').

%% Spanish Place Names
grammar(spanish_place_names, 'spanish_place_names').
grammar_description(spanish_place_names, 'Generation of Spanish-style place names for streets, plazas, and districts.').
grammar_rule(spanish_place_names, origin, '#placeType# de #placeQuality#').
grammar_rule(spanish_place_names, placetype, 'Calle').
grammar_rule(spanish_place_names, placetype, 'Plaza').
grammar_rule(spanish_place_names, placetype, 'Avenida').
grammar_rule(spanish_place_names, placetype, 'Paseo').
grammar_rule(spanish_place_names, placetype, 'Camino').
grammar_rule(spanish_place_names, placequality, 'la Catedral').
grammar_rule(spanish_place_names, placequality, 'los Olivos').
grammar_rule(spanish_place_names, placequality, 'la Fuente').
grammar_rule(spanish_place_names, placequality, 'San Martin').
grammar_rule(spanish_place_names, placequality, 'la Paz').
grammar_rule(spanish_place_names, placequality, 'la Libertad').
grammar_rule(spanish_place_names, placequality, 'el Rio').
grammar_rule(spanish_place_names, placequality, 'la Ermita').

%% Spanish Business Names
grammar(spanish_business_names, 'spanish_business_names').
grammar_description(spanish_business_names, 'Generation of Spanish-style business names for shops, bars, and restaurants.').
grammar_rule(spanish_business_names, origin, '#businessType# #businessQuality#').
grammar_rule(spanish_business_names, businesstype, 'Bar').
grammar_rule(spanish_business_names, businesstype, 'Restaurante').
grammar_rule(spanish_business_names, businesstype, 'Cafeteria').
grammar_rule(spanish_business_names, businesstype, 'Panaderia').
grammar_rule(spanish_business_names, businesstype, 'Carniceria').
grammar_rule(spanish_business_names, businesstype, 'Libreria').
grammar_rule(spanish_business_names, businesstype, 'Farmacia').
grammar_rule(spanish_business_names, businesstype, 'Tienda').
grammar_rule(spanish_business_names, businessquality, 'El Rinconcillo').
grammar_rule(spanish_business_names, businessquality, 'La Espiga').
grammar_rule(spanish_business_names, businessquality, 'El Puente').
grammar_rule(spanish_business_names, businessquality, 'San Jose').
grammar_rule(spanish_business_names, businessquality, 'Castilla').
grammar_rule(spanish_business_names, businessquality, 'El Huerto').
grammar_rule(spanish_business_names, businessquality, 'La Mancha').
grammar_rule(spanish_business_names, businessquality, 'del Mar').
