%% Insimul Grammars (Tracery): Kingdom of Camelot
%% Source: data/worlds/kingdom_of_camelot/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Arthurian Character Names
grammar(arthurian_character_names, 'arthurian_character_names').
grammar_description(arthurian_character_names, 'Medieval Arthurian name generation for knights, nobles, and commoners of Camelot and surrounding lands.').
grammar_rule(arthurian_character_names, origin, '#givenName# #familyName#').
grammar_rule(arthurian_character_names, givenname, '#maleName#').
grammar_rule(arthurian_character_names, givenname, '#femaleName#').
grammar_rule(arthurian_character_names, malename, 'Gawain').
grammar_rule(arthurian_character_names, malename, 'Percival').
grammar_rule(arthurian_character_names, malename, 'Galahad').
grammar_rule(arthurian_character_names, malename, 'Tristan').
grammar_rule(arthurian_character_names, malename, 'Gareth').
grammar_rule(arthurian_character_names, malename, 'Bors').
grammar_rule(arthurian_character_names, malename, 'Kay').
grammar_rule(arthurian_character_names, malename, 'Bedivere').
grammar_rule(arthurian_character_names, malename, 'Ector').
grammar_rule(arthurian_character_names, malename, 'Lionel').
grammar_rule(arthurian_character_names, malename, 'Agravain').
grammar_rule(arthurian_character_names, malename, 'Lamorak').
grammar_rule(arthurian_character_names, malename, 'Pellinore').
grammar_rule(arthurian_character_names, malename, 'Mordred').
grammar_rule(arthurian_character_names, malename, 'Owen').
grammar_rule(arthurian_character_names, femalename, 'Elaine').
grammar_rule(arthurian_character_names, femalename, 'Isolde').
grammar_rule(arthurian_character_names, femalename, 'Morgana').
grammar_rule(arthurian_character_names, femalename, 'Viviane').
grammar_rule(arthurian_character_names, femalename, 'Lynette').
grammar_rule(arthurian_character_names, femalename, 'Enid').
grammar_rule(arthurian_character_names, femalename, 'Nimue').
grammar_rule(arthurian_character_names, femalename, 'Igraine').
grammar_rule(arthurian_character_names, femalename, 'Blanchefleur').
grammar_rule(arthurian_character_names, femalename, 'Laudine').
grammar_rule(arthurian_character_names, femalename, 'Ragnelle').
grammar_rule(arthurian_character_names, femalename, 'Dindrane').
grammar_rule(arthurian_character_names, femalename, 'Brangaine').
grammar_rule(arthurian_character_names, femalename, 'Clarissant').
grammar_rule(arthurian_character_names, femalename, 'Lunete').
grammar_rule(arthurian_character_names, familyname, '#surname#').
grammar_rule(arthurian_character_names, familyname, 'of #placeName#').
grammar_rule(arthurian_character_names, familyname, 'du #placeName#').
grammar_rule(arthurian_character_names, surname, 'Pendragon').
grammar_rule(arthurian_character_names, surname, 'Orkney').
grammar_rule(arthurian_character_names, surname, 'Corbenic').
grammar_rule(arthurian_character_names, surname, 'Benwick').
grammar_rule(arthurian_character_names, surname, 'Lothian').
grammar_rule(arthurian_character_names, surname, 'Cornwall').
grammar_rule(arthurian_character_names, surname, 'Gaul').
grammar_rule(arthurian_character_names, surname, 'Astolat').
grammar_rule(arthurian_character_names, surname, 'Lyonesse').
grammar_rule(arthurian_character_names, surname, 'Caerleon').
grammar_rule(arthurian_character_names, surname, 'Gore').
grammar_rule(arthurian_character_names, surname, 'Tintagel').
grammar_rule(arthurian_character_names, placename, 'Camelot').
grammar_rule(arthurian_character_names, placename, 'Avalon').
grammar_rule(arthurian_character_names, placename, 'Orkney').
grammar_rule(arthurian_character_names, placename, 'Cornwall').
grammar_rule(arthurian_character_names, placename, 'Gaul').
grammar_rule(arthurian_character_names, placename, 'Tintagel').
grammar_rule(arthurian_character_names, placename, 'Lyonesse').
grammar_rule(arthurian_character_names, placename, 'Carbonek').

%% Arthurian Place Names
grammar(arthurian_place_names, 'arthurian_place_names').
grammar_description(arthurian_place_names, 'Generation of medieval Arthurian-style place names for locations and landmarks.').
grammar_rule(arthurian_place_names, origin, '#placePrefix# #placeSuffix#').
grammar_rule(arthurian_place_names, placeprefix, 'Castle').
grammar_rule(arthurian_place_names, placeprefix, 'Fort').
grammar_rule(arthurian_place_names, placeprefix, 'Tower').
grammar_rule(arthurian_place_names, placeprefix, 'Chapel').
grammar_rule(arthurian_place_names, placeprefix, 'Forest').
grammar_rule(arthurian_place_names, placeprefix, 'Bridge').
grammar_rule(arthurian_place_names, placeprefix, 'Lake').
grammar_rule(arthurian_place_names, placeprefix, 'Moor').
grammar_rule(arthurian_place_names, placesuffix, 'Perilous').
grammar_rule(arthurian_place_names, placesuffix, 'of Sorrow').
grammar_rule(arthurian_place_names, placesuffix, 'of Joy').
grammar_rule(arthurian_place_names, placesuffix, 'Enchanted').
grammar_rule(arthurian_place_names, placesuffix, 'of the Grail').
grammar_rule(arthurian_place_names, placesuffix, 'of the Maiden').
grammar_rule(arthurian_place_names, placesuffix, 'Dolorous').
grammar_rule(arthurian_place_names, placesuffix, 'Adventurous').

%% Arthurian Tavern and Shop Names
grammar(arthurian_business_names, 'arthurian_business_names').
grammar_description(arthurian_business_names, 'Generation of medieval-style tavern and shop names for Camelot businesses.').
grammar_rule(arthurian_business_names, origin, 'The #adjective# #noun#').
grammar_rule(arthurian_business_names, adjective, 'Golden').
grammar_rule(arthurian_business_names, adjective, 'Silver').
grammar_rule(arthurian_business_names, adjective, 'Iron').
grammar_rule(arthurian_business_names, adjective, 'Merry').
grammar_rule(arthurian_business_names, adjective, 'Valiant').
grammar_rule(arthurian_business_names, adjective, 'Blessed').
grammar_rule(arthurian_business_names, noun, 'Shield').
grammar_rule(arthurian_business_names, noun, 'Sword').
grammar_rule(arthurian_business_names, noun, 'Dragon').
grammar_rule(arthurian_business_names, noun, 'Stag').
grammar_rule(arthurian_business_names, noun, 'Crown').
grammar_rule(arthurian_business_names, noun, 'Chalice').
