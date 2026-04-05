%% Insimul Grammars (Tracery): Historical Medieval Europe
%% Source: data/worlds/historical_medieval/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Medieval Character Names
grammar(medieval_character_names, 'medieval_character_names').
grammar_description(medieval_character_names, 'Name generation for medieval English and Norman characters in a feudal setting.').
grammar_rule(medieval_character_names, origin, '#givenName# #familyName#').
grammar_rule(medieval_character_names, givenname, '#maleName#').
grammar_rule(medieval_character_names, givenname, '#femaleName#').
grammar_rule(medieval_character_names, malename, 'Godfrey').
grammar_rule(medieval_character_names, malename, 'Roland').
grammar_rule(medieval_character_names, malename, 'Wulfstan').
grammar_rule(medieval_character_names, malename, 'Osric').
grammar_rule(medieval_character_names, malename, 'Hugh').
grammar_rule(medieval_character_names, malename, 'Edric').
grammar_rule(medieval_character_names, malename, 'Anselm').
grammar_rule(medieval_character_names, malename, 'Caedmon').
grammar_rule(medieval_character_names, malename, 'Benedict').
grammar_rule(medieval_character_names, malename, 'Dunstan').
grammar_rule(medieval_character_names, malename, 'Aldric').
grammar_rule(medieval_character_names, malename, 'Gilbert').
grammar_rule(medieval_character_names, malename, 'Ranulf').
grammar_rule(medieval_character_names, malename, 'Hereward').
grammar_rule(medieval_character_names, femalename, 'Matilda').
grammar_rule(medieval_character_names, femalename, 'Eleanor').
grammar_rule(medieval_character_names, femalename, 'Aelswith').
grammar_rule(medieval_character_names, femalename, 'Agnes').
grammar_rule(medieval_character_names, femalename, 'Margery').
grammar_rule(medieval_character_names, femalename, 'Gytha').
grammar_rule(medieval_character_names, femalename, 'Hild').
grammar_rule(medieval_character_names, femalename, 'Isolde').
grammar_rule(medieval_character_names, femalename, 'Cecily').
grammar_rule(medieval_character_names, femalename, 'Rohese').
grammar_rule(medieval_character_names, familyname, 'de #normanPlace#').
grammar_rule(medieval_character_names, familyname, '#englishSurname#').
grammar_rule(medieval_character_names, normanplace, 'Ashworth').
grammar_rule(medieval_character_names, normanplace, 'Beaumont').
grammar_rule(medieval_character_names, normanplace, 'Montfort').
grammar_rule(medieval_character_names, normanplace, 'Mandeville').
grammar_rule(medieval_character_names, normanplace, 'Lacy').
grammar_rule(medieval_character_names, normanplace, 'Ferrers').
grammar_rule(medieval_character_names, englishsurname, 'Godwin').
grammar_rule(medieval_character_names, englishsurname, 'Aldric').
grammar_rule(medieval_character_names, englishsurname, 'Miller').
grammar_rule(medieval_character_names, englishsurname, 'Smith').
grammar_rule(medieval_character_names, englishsurname, 'Cooper').
grammar_rule(medieval_character_names, englishsurname, 'Thatcher').

%% Medieval Place Names
grammar(medieval_place_names, 'medieval_place_names').
grammar_description(medieval_place_names, 'Generation of medieval English place and street names.').
grammar_rule(medieval_place_names, origin, '#placeType# #placeQuality#').
grammar_rule(medieval_place_names, placetype, 'Castle').
grammar_rule(medieval_place_names, placetype, 'Abbey').
grammar_rule(medieval_place_names, placetype, 'Priory').
grammar_rule(medieval_place_names, placetype, 'Manor').
grammar_rule(medieval_place_names, placetype, 'Mill').
grammar_rule(medieval_place_names, placetype, 'Market').
grammar_rule(medieval_place_names, placequality, 'of the Crown').
grammar_rule(medieval_place_names, placequality, 'of St. Aldhelm').
grammar_rule(medieval_place_names, placequality, 'on the Green').
grammar_rule(medieval_place_names, placequality, 'by the Brook').
grammar_rule(medieval_place_names, placequality, 'of the Cross').
grammar_rule(medieval_place_names, placequality, 'on the Moor').

%% Medieval Business Names
grammar(medieval_business_names, 'medieval_business_names').
grammar_description(medieval_business_names, 'Generation of medieval shop and trade names.').
grammar_rule(medieval_business_names, origin, 'The #tradeType# #qualifier#').
grammar_rule(medieval_business_names, tradetype, 'Smithy').
grammar_rule(medieval_business_names, tradetype, 'Bakehouse').
grammar_rule(medieval_business_names, tradetype, 'Tannery').
grammar_rule(medieval_business_names, tradetype, 'Brewhouse').
grammar_rule(medieval_business_names, tradetype, 'Chandlery').
grammar_rule(medieval_business_names, tradetype, 'Weaving Hall').
grammar_rule(medieval_business_names, qualifier, 'of the Red Boar').
grammar_rule(medieval_business_names, qualifier, 'of the Golden Fleece').
grammar_rule(medieval_business_names, qualifier, 'of the White Hart').
grammar_rule(medieval_business_names, qualifier, 'of the Iron Hand').
grammar_rule(medieval_business_names, qualifier, 'by the Gate').
grammar_rule(medieval_business_names, qualifier, 'at the Crossroads').
