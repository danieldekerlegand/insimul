%% Insimul Grammars (Tracery): Urban Fantasy -- Veilhaven
%% Source: data/worlds/urban_fantasy/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Urban Fantasy Character Names
grammar(uf_character_names, 'uf_character_names').
grammar_description(uf_character_names, 'Name generation for an urban fantasy setting with supernatural factions hidden in a modern city.').
grammar_rule(uf_character_names, origin, '#givenName# #familyName#').
grammar_rule(uf_character_names, givenname, '#maleName#').
grammar_rule(uf_character_names, givenname, '#femaleName#').
grammar_rule(uf_character_names, malename, 'Marcus').
grammar_rule(uf_character_names, malename, 'Rowan').
grammar_rule(uf_character_names, malename, 'Victor').
grammar_rule(uf_character_names, malename, 'Damien').
grammar_rule(uf_character_names, malename, 'Ezra').
grammar_rule(uf_character_names, malename, 'Kai').
grammar_rule(uf_character_names, malename, 'Cade').
grammar_rule(uf_character_names, malename, 'Silas').
grammar_rule(uf_character_names, malename, 'Jasper').
grammar_rule(uf_character_names, malename, 'Felix').
grammar_rule(uf_character_names, malename, 'Morgan').
grammar_rule(uf_character_names, malename, 'Dorian').
grammar_rule(uf_character_names, malename, 'Alaric').
grammar_rule(uf_character_names, malename, 'Raven').
grammar_rule(uf_character_names, malename, 'Drake').
grammar_rule(uf_character_names, femalename, 'Ivy').
grammar_rule(uf_character_names, femalename, 'Morrigan').
grammar_rule(uf_character_names, femalename, 'Elena').
grammar_rule(uf_character_names, femalename, 'Seraphina').
grammar_rule(uf_character_names, femalename, 'Helena').
grammar_rule(uf_character_names, femalename, 'Sable').
grammar_rule(uf_character_names, femalename, 'Lila').
grammar_rule(uf_character_names, femalename, 'Nadia').
grammar_rule(uf_character_names, femalename, 'Thistle').
grammar_rule(uf_character_names, femalename, 'Luna').
grammar_rule(uf_character_names, femalename, 'Willow').
grammar_rule(uf_character_names, femalename, 'Celeste').
grammar_rule(uf_character_names, femalename, 'Rune').
grammar_rule(uf_character_names, femalename, 'Dahlia').
grammar_rule(uf_character_names, femalename, 'Vesper').
grammar_rule(uf_character_names, familyname, '#surname#').
grammar_rule(uf_character_names, surname, 'Ashwood').
grammar_rule(uf_character_names, surname, 'Blackthorn').
grammar_rule(uf_character_names, surname, 'Reyes').
grammar_rule(uf_character_names, surname, 'Aldermere').
grammar_rule(uf_character_names, surname, 'Voss').
grammar_rule(uf_character_names, surname, 'Cole').
grammar_rule(uf_character_names, surname, 'Nightfall').
grammar_rule(uf_character_names, surname, 'Volkov').
grammar_rule(uf_character_names, surname, 'Cross').
grammar_rule(uf_character_names, surname, 'Moonshadow').
grammar_rule(uf_character_names, surname, 'Graves').
grammar_rule(uf_character_names, surname, 'Sterling').

%% Urban Fantasy Place Names
grammar(uf_place_names, 'uf_place_names').
grammar_description(uf_place_names, 'Generation of atmospheric location names for a city with hidden supernatural elements.').
grammar_rule(uf_place_names, origin, '#prefix# #suffix#').
grammar_rule(uf_place_names, prefix, 'Shadow').
grammar_rule(uf_place_names, prefix, 'Silver').
grammar_rule(uf_place_names, prefix, 'Iron').
grammar_rule(uf_place_names, prefix, 'Thorn').
grammar_rule(uf_place_names, prefix, 'Moon').
grammar_rule(uf_place_names, prefix, 'Raven').
grammar_rule(uf_place_names, prefix, 'Hollow').
grammar_rule(uf_place_names, prefix, 'Cobalt').
grammar_rule(uf_place_names, suffix, 'Lane').
grammar_rule(uf_place_names, suffix, 'Walk').
grammar_rule(uf_place_names, suffix, 'Court').
grammar_rule(uf_place_names, suffix, 'Gate').
grammar_rule(uf_place_names, suffix, 'Bridge').
grammar_rule(uf_place_names, suffix, 'Row').
grammar_rule(uf_place_names, suffix, 'Crossing').
grammar_rule(uf_place_names, suffix, 'Terrace').

%% Urban Fantasy Business Names
grammar(uf_business_names, 'uf_business_names').
grammar_description(uf_business_names, 'Names for businesses that serve both mundane and supernatural clientele.').
grammar_rule(uf_business_names, origin, '#style#').
grammar_rule(uf_business_names, style, 'The #adjective# #noun#').
grammar_rule(uf_business_names, style, '#noun# and #noun#').
grammar_rule(uf_business_names, style, '#possessive# #noun#').
grammar_rule(uf_business_names, adjective, 'Black').
grammar_rule(uf_business_names, adjective, 'Silver').
grammar_rule(uf_business_names, adjective, 'Crimson').
grammar_rule(uf_business_names, adjective, 'Midnight').
grammar_rule(uf_business_names, adjective, 'Iron').
grammar_rule(uf_business_names, adjective, 'Hollow').
grammar_rule(uf_business_names, adjective, 'Gilded').
grammar_rule(uf_business_names, adjective, 'Waning').
grammar_rule(uf_business_names, noun, 'Thorn').
grammar_rule(uf_business_names, noun, 'Moon').
grammar_rule(uf_business_names, noun, 'Raven').
grammar_rule(uf_business_names, noun, 'Anchor').
grammar_rule(uf_business_names, noun, 'Lantern').
grammar_rule(uf_business_names, noun, 'Key').
grammar_rule(uf_business_names, noun, 'Chalice').
grammar_rule(uf_business_names, noun, 'Veil').
grammar_rule(uf_business_names, possessive, 'Mortar').
grammar_rule(uf_business_names, possessive, 'Nightshade').
grammar_rule(uf_business_names, possessive, 'Athenaeum').
grammar_rule(uf_business_names, possessive, 'Ironside').
