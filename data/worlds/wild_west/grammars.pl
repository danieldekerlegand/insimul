%% Insimul Grammars (Tracery): Wild West -- Redemption Gulch
%% Source: data/worlds/wild_west/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Wild West Character Names
grammar(ww_character_names, 'ww_character_names').
grammar_description(ww_character_names, 'Name generation for an American frontier Wild West setting circa 1870s.').
grammar_rule(ww_character_names, origin, '#givenName# #familyName#').
grammar_rule(ww_character_names, givenname, '#maleName#').
grammar_rule(ww_character_names, givenname, '#femaleName#').
grammar_rule(ww_character_names, malename, 'Eli').
grammar_rule(ww_character_names, malename, 'Walt').
grammar_rule(ww_character_names, malename, 'Jesse').
grammar_rule(ww_character_names, malename, 'Hank').
grammar_rule(ww_character_names, malename, 'Cornelius').
grammar_rule(ww_character_names, malename, 'Josiah').
grammar_rule(ww_character_names, malename, 'Silas').
grammar_rule(ww_character_names, malename, 'Billy').
grammar_rule(ww_character_names, malename, 'Eustace').
grammar_rule(ww_character_names, malename, 'Virgil').
grammar_rule(ww_character_names, malename, 'Amos').
grammar_rule(ww_character_names, malename, 'Clyde').
grammar_rule(ww_character_names, malename, 'Jedediah').
grammar_rule(ww_character_names, malename, 'Wyatt').
grammar_rule(ww_character_names, malename, 'Clem').
grammar_rule(ww_character_names, femalename, 'Ruby').
grammar_rule(ww_character_names, femalename, 'Clara').
grammar_rule(ww_character_names, femalename, 'Martha').
grammar_rule(ww_character_names, femalename, 'Rosa').
grammar_rule(ww_character_names, femalename, 'Mae').
grammar_rule(ww_character_names, femalename, 'Lottie').
grammar_rule(ww_character_names, femalename, 'Abigail').
grammar_rule(ww_character_names, femalename, 'Sadie').
grammar_rule(ww_character_names, femalename, 'Pearl').
grammar_rule(ww_character_names, femalename, 'Nellie').
grammar_rule(ww_character_names, femalename, 'Constance').
grammar_rule(ww_character_names, femalename, 'Ida').
grammar_rule(ww_character_names, femalename, 'Daisy').
grammar_rule(ww_character_names, femalename, 'Bonnie').
grammar_rule(ww_character_names, femalename, 'Della').
grammar_rule(ww_character_names, familyname, '#surname#').
grammar_rule(ww_character_names, surname, 'Holden').
grammar_rule(ww_character_names, surname, 'McCoy').
grammar_rule(ww_character_names, surname, 'Callahan').
grammar_rule(ww_character_names, surname, 'Hendricks').
grammar_rule(ww_character_names, surname, 'Whitfield').
grammar_rule(ww_character_names, surname, 'Thorne').
grammar_rule(ww_character_names, surname, 'Ketchum').
grammar_rule(ww_character_names, surname, 'Dalton').
grammar_rule(ww_character_names, surname, 'Briggs').
grammar_rule(ww_character_names, surname, 'Polk').
grammar_rule(ww_character_names, surname, 'Tate').
grammar_rule(ww_character_names, surname, 'Prescott').

%% Wild West Place Names
grammar(ww_place_names, 'ww_place_names').
grammar_description(ww_place_names, 'Generation of frontier-style settlement and landmark names.').
grammar_rule(ww_place_names, origin, '#prefix# #suffix#').
grammar_rule(ww_place_names, prefix, 'Copper').
grammar_rule(ww_place_names, prefix, 'Silver').
grammar_rule(ww_place_names, prefix, 'Broken').
grammar_rule(ww_place_names, prefix, 'Red').
grammar_rule(ww_place_names, prefix, 'Dry').
grammar_rule(ww_place_names, prefix, 'Dead').
grammar_rule(ww_place_names, prefix, 'Iron').
grammar_rule(ww_place_names, prefix, 'Lone').
grammar_rule(ww_place_names, suffix, 'Gulch').
grammar_rule(ww_place_names, suffix, 'Ridge').
grammar_rule(ww_place_names, suffix, 'Creek').
grammar_rule(ww_place_names, suffix, 'Flats').
grammar_rule(ww_place_names, suffix, 'Springs').
grammar_rule(ww_place_names, suffix, 'Hollow').
grammar_rule(ww_place_names, suffix, 'Crossing').
grammar_rule(ww_place_names, suffix, 'Pass').

%% Wild West Business Names
grammar(ww_business_names, 'ww_business_names').
grammar_description(ww_business_names, 'Names for frontier businesses: saloons, general stores, and frontier enterprises.').
grammar_rule(ww_business_names, origin, '#style#').
grammar_rule(ww_business_names, style, 'The #adjective# #noun#').
grammar_rule(ww_business_names, style, '#noun# and #noun#').
grammar_rule(ww_business_names, style, '#possessive# #establishment#').
grammar_rule(ww_business_names, adjective, 'Silver').
grammar_rule(ww_business_names, adjective, 'Golden').
grammar_rule(ww_business_names, adjective, 'Lucky').
grammar_rule(ww_business_names, adjective, 'Rusty').
grammar_rule(ww_business_names, adjective, 'Iron').
grammar_rule(ww_business_names, adjective, 'Grand').
grammar_rule(ww_business_names, adjective, 'Dusty').
grammar_rule(ww_business_names, adjective, 'Prairie').
grammar_rule(ww_business_names, noun, 'Spur').
grammar_rule(ww_business_names, noun, 'Star').
grammar_rule(ww_business_names, noun, 'Horseshoe').
grammar_rule(ww_business_names, noun, 'Eagle').
grammar_rule(ww_business_names, noun, 'Nugget').
grammar_rule(ww_business_names, noun, 'Cactus').
grammar_rule(ww_business_names, noun, 'Mustang').
grammar_rule(ww_business_names, noun, 'Barrel').
grammar_rule(ww_business_names, possessive, 'McCoy').
grammar_rule(ww_business_names, possessive, 'Hendricks').
grammar_rule(ww_business_names, possessive, 'Overland').
grammar_rule(ww_business_names, possessive, 'Pioneer').
grammar_rule(ww_business_names, establishment, 'Saloon').
grammar_rule(ww_business_names, establishment, 'Trading Post').
grammar_rule(ww_business_names, establishment, 'Livery').
grammar_rule(ww_business_names, establishment, 'Supply Co.').
