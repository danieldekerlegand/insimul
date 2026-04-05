%% Insimul Grammars (Tracery): Italian Tuscany
%% Source: data/worlds/language/italian/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Italian Character Names
grammar(italian_character_names, 'italian_character_names').
grammar_description(italian_character_names, 'Authentic Italian name generation for a contemporary Tuscan hill town. Names follow modern Italian naming conventions.').
grammar_rule(italian_character_names, origin, '#givenName# #familyName#').
grammar_rule(italian_character_names, givenname, '#maleName#').
grammar_rule(italian_character_names, givenname, '#femaleName#').
grammar_rule(italian_character_names, malename, 'Giuseppe').
grammar_rule(italian_character_names, malename, 'Antonio').
grammar_rule(italian_character_names, malename, 'Marco').
grammar_rule(italian_character_names, malename, 'Luca').
grammar_rule(italian_character_names, malename, 'Stefano').
grammar_rule(italian_character_names, malename, 'Roberto').
grammar_rule(italian_character_names, malename, 'Matteo').
grammar_rule(italian_character_names, malename, 'Enrico').
grammar_rule(italian_character_names, malename, 'Giovanni').
grammar_rule(italian_character_names, malename, 'Davide').
grammar_rule(italian_character_names, malename, 'Alessandro').
grammar_rule(italian_character_names, malename, 'Nicola').
grammar_rule(italian_character_names, malename, 'Francesco').
grammar_rule(italian_character_names, malename, 'Lorenzo').
grammar_rule(italian_character_names, malename, 'Andrea').
grammar_rule(italian_character_names, femalename, 'Lucia').
grammar_rule(italian_character_names, femalename, 'Maria').
grammar_rule(italian_character_names, femalename, 'Elena').
grammar_rule(italian_character_names, femalename, 'Chiara').
grammar_rule(italian_character_names, femalename, 'Paola').
grammar_rule(italian_character_names, femalename, 'Anna').
grammar_rule(italian_character_names, femalename, 'Giulia').
grammar_rule(italian_character_names, femalename, 'Francesca').
grammar_rule(italian_character_names, femalename, 'Rosa').
grammar_rule(italian_character_names, femalename, 'Teresa').
grammar_rule(italian_character_names, femalename, 'Sofia').
grammar_rule(italian_character_names, femalename, 'Valentina').
grammar_rule(italian_character_names, femalename, 'Silvia').
grammar_rule(italian_character_names, femalename, 'Beatrice').
grammar_rule(italian_character_names, femalename, 'Caterina').
grammar_rule(italian_character_names, familyname, '#surname#').
grammar_rule(italian_character_names, surname, 'Rossi').
grammar_rule(italian_character_names, surname, 'Bianchi').
grammar_rule(italian_character_names, surname, 'Romano').
grammar_rule(italian_character_names, surname, 'Conti').
grammar_rule(italian_character_names, surname, 'Ferrari').
grammar_rule(italian_character_names, surname, 'Moretti').
grammar_rule(italian_character_names, surname, 'Colombo').
grammar_rule(italian_character_names, surname, 'Ricci').
grammar_rule(italian_character_names, surname, 'Greco').
grammar_rule(italian_character_names, surname, 'Brunetti').
grammar_rule(italian_character_names, surname, 'Marchetti').
grammar_rule(italian_character_names, surname, 'Galli').

%% Italian Place Names
grammar(italian_place_names, 'italian_place_names').
grammar_description(italian_place_names, 'Generation of Italian-style place names for streets and piazzas.').
grammar_rule(italian_place_names, origin, '#placeType# #placeQuality#').
grammar_rule(italian_place_names, placetype, 'Via').
grammar_rule(italian_place_names, placetype, 'Piazza').
grammar_rule(italian_place_names, placetype, 'Vicolo').
grammar_rule(italian_place_names, placetype, 'Corso').
grammar_rule(italian_place_names, placetype, 'Viale').
grammar_rule(italian_place_names, placequality, 'del Sole').
grammar_rule(italian_place_names, placequality, 'della Chiesa').
grammar_rule(italian_place_names, placequality, 'Roma').
grammar_rule(italian_place_names, placequality, 'degli Ulivi').
grammar_rule(italian_place_names, placequality, 'delle Vigne').
grammar_rule(italian_place_names, placequality, 'dei Cipressi').
grammar_rule(italian_place_names, placequality, 'del Belvedere').
grammar_rule(italian_place_names, placequality, 'Garibaldi').

%% Italian Business Names
grammar(italian_business_names, 'italian_business_names').
grammar_description(italian_business_names, 'Generation of Italian-style business names for shops and restaurants.').
grammar_rule(italian_business_names, origin, '#businessType# #businessQuality#').
grammar_rule(italian_business_names, businesstype, 'Trattoria').
grammar_rule(italian_business_names, businesstype, 'Panificio').
grammar_rule(italian_business_names, businesstype, 'Macelleria').
grammar_rule(italian_business_names, businesstype, 'Alimentari').
grammar_rule(italian_business_names, businesstype, 'Enoteca').
grammar_rule(italian_business_names, businesstype, 'Farmacia').
grammar_rule(italian_business_names, businesstype, 'Bar').
grammar_rule(italian_business_names, businesstype, 'Gelateria').
grammar_rule(italian_business_names, businessquality, 'del Centro').
grammar_rule(italian_business_names, businessquality, 'da Nonna').
grammar_rule(italian_business_names, businessquality, 'Toscana').
grammar_rule(italian_business_names, businessquality, 'del Sole').
grammar_rule(italian_business_names, businessquality, 'Bella Vista').
grammar_rule(italian_business_names, businessquality, 'San Marco').
