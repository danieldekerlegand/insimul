%% Insimul Grammars (Tracery): Portuguese Algarve
%% Source: data/worlds/language/portuguese/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Portuguese Character Names
grammar(portuguese_character_names, 'portuguese_character_names').
grammar_description(portuguese_character_names, 'Authentic Portuguese name generation for a contemporary Algarve coastal town. Names follow modern Portuguese naming conventions.').
grammar_rule(portuguese_character_names, origin, '#givenName# #familyName#').
grammar_rule(portuguese_character_names, givenname, '#maleName#').
grammar_rule(portuguese_character_names, givenname, '#femaleName#').
grammar_rule(portuguese_character_names, malename, 'Manuel').
grammar_rule(portuguese_character_names, malename, 'Antonio').
grammar_rule(portuguese_character_names, malename, 'Jorge').
grammar_rule(portuguese_character_names, malename, 'Ricardo').
grammar_rule(portuguese_character_names, malename, 'Joaquim').
grammar_rule(portuguese_character_names, malename, 'Fernando').
grammar_rule(portuguese_character_names, malename, 'Tiago').
grammar_rule(portuguese_character_names, malename, 'Rafael').
grammar_rule(portuguese_character_names, malename, 'Diogo').
grammar_rule(portuguese_character_names, malename, 'Miguel').
grammar_rule(portuguese_character_names, malename, 'Pedro').
grammar_rule(portuguese_character_names, malename, 'Rui').
grammar_rule(portuguese_character_names, malename, 'Joao').
grammar_rule(portuguese_character_names, malename, 'Nuno').
grammar_rule(portuguese_character_names, malename, 'Bruno').
grammar_rule(portuguese_character_names, femalename, 'Maria').
grammar_rule(portuguese_character_names, femalename, 'Clara').
grammar_rule(portuguese_character_names, femalename, 'Helena').
grammar_rule(portuguese_character_names, femalename, 'Ana').
grammar_rule(portuguese_character_names, femalename, 'Rosa').
grammar_rule(portuguese_character_names, femalename, 'Teresa').
grammar_rule(portuguese_character_names, femalename, 'Beatriz').
grammar_rule(portuguese_character_names, femalename, 'Ines').
grammar_rule(portuguese_character_names, femalename, 'Carolina').
grammar_rule(portuguese_character_names, femalename, 'Sofia').
grammar_rule(portuguese_character_names, femalename, 'Catarina').
grammar_rule(portuguese_character_names, femalename, 'Mariana').
grammar_rule(portuguese_character_names, femalename, 'Leonor').
grammar_rule(portuguese_character_names, femalename, 'Matilde').
grammar_rule(portuguese_character_names, femalename, 'Francisca').
grammar_rule(portuguese_character_names, familyname, '#surname#').
grammar_rule(portuguese_character_names, familyname, '#surname# #surname#').
grammar_rule(portuguese_character_names, surname, 'Silva').
grammar_rule(portuguese_character_names, surname, 'Santos').
grammar_rule(portuguese_character_names, surname, 'Ferreira').
grammar_rule(portuguese_character_names, surname, 'Pereira').
grammar_rule(portuguese_character_names, surname, 'Costa').
grammar_rule(portuguese_character_names, surname, 'Oliveira').
grammar_rule(portuguese_character_names, surname, 'Rodrigues').
grammar_rule(portuguese_character_names, surname, 'Martins').
grammar_rule(portuguese_character_names, surname, 'Sousa').
grammar_rule(portuguese_character_names, surname, 'Fernandes').
grammar_rule(portuguese_character_names, surname, 'Goncalves').
grammar_rule(portuguese_character_names, surname, 'Almeida').

%% Portuguese Place Names
grammar(portuguese_place_names, 'portuguese_place_names').
grammar_description(portuguese_place_names, 'Generation of Portuguese-style place names for streets and landmarks.').
grammar_rule(portuguese_place_names, origin, '#placeType# #placeQuality#').
grammar_rule(portuguese_place_names, placetype, 'Rua').
grammar_rule(portuguese_place_names, placetype, 'Travessa').
grammar_rule(portuguese_place_names, placetype, 'Largo').
grammar_rule(portuguese_place_names, placetype, 'Avenida').
grammar_rule(portuguese_place_names, placetype, 'Praca').
grammar_rule(portuguese_place_names, placetype, 'Beco').
grammar_rule(portuguese_place_names, placequality, 'do Comercio').
grammar_rule(portuguese_place_names, placequality, 'da Igreja').
grammar_rule(portuguese_place_names, placequality, 'dos Pescadores').
grammar_rule(portuguese_place_names, placequality, 'da Marina').
grammar_rule(portuguese_place_names, placequality, 'do Sol').
grammar_rule(portuguese_place_names, placequality, 'da Praia').
grammar_rule(portuguese_place_names, placequality, 'da Fonte').
grammar_rule(portuguese_place_names, placequality, 'do Castelo').

%% Portuguese Business Names
grammar(portuguese_business_names, 'portuguese_business_names').
grammar_description(portuguese_business_names, 'Generation of Portuguese-style business names for shops and restaurants.').
grammar_rule(portuguese_business_names, origin, '#businessType# #businessQuality#').
grammar_rule(portuguese_business_names, businesstype, 'Restaurante').
grammar_rule(portuguese_business_names, businesstype, 'Pastelaria').
grammar_rule(portuguese_business_names, businesstype, 'Tasca').
grammar_rule(portuguese_business_names, businesstype, 'Livraria').
grammar_rule(portuguese_business_names, businesstype, 'Farmacia').
grammar_rule(portuguese_business_names, businesstype, 'Mercearia').
grammar_rule(portuguese_business_names, businesstype, 'Taberna').
grammar_rule(portuguese_business_names, businessquality, 'do Sol').
grammar_rule(portuguese_business_names, businessquality, 'da Praia').
grammar_rule(portuguese_business_names, businessquality, 'do Mar').
grammar_rule(portuguese_business_names, businessquality, 'Central').
grammar_rule(portuguese_business_names, businessquality, 'da Vila').
grammar_rule(portuguese_business_names, businessquality, 'Dourada').
