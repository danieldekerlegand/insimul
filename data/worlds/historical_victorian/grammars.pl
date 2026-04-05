%% Insimul Grammars (Tracery): Historical Victorian
%% Source: data/worlds/historical_victorian/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Victorian Character Names
grammar(victorian_character_names, 'victorian_character_names').
grammar_description(victorian_character_names, 'Authentic Victorian-era English name generation for an industrial northern city.').
grammar_rule(victorian_character_names, origin, '#givenName# #familyName#').
grammar_rule(victorian_character_names, givenname, '#maleName#').
grammar_rule(victorian_character_names, givenname, '#femaleName#').
grammar_rule(victorian_character_names, malename, 'Edmund').
grammar_rule(victorian_character_names, malename, 'Silas').
grammar_rule(victorian_character_names, malename, 'Thomas').
grammar_rule(victorian_character_names, malename, 'Henry').
grammar_rule(victorian_character_names, malename, 'Rupert').
grammar_rule(victorian_character_names, malename, 'Alistair').
grammar_rule(victorian_character_names, malename, 'William').
grammar_rule(victorian_character_names, malename, 'Arthur').
grammar_rule(victorian_character_names, malename, 'Barnaby').
grammar_rule(victorian_character_names, malename, 'Jack').
grammar_rule(victorian_character_names, malename, 'Frederick').
grammar_rule(victorian_character_names, malename, 'Albert').
grammar_rule(victorian_character_names, malename, 'Reginald').
grammar_rule(victorian_character_names, malename, 'Charles').
grammar_rule(victorian_character_names, malename, 'Horace').
grammar_rule(victorian_character_names, femalename, 'Margaret').
grammar_rule(victorian_character_names, femalename, 'Charlotte').
grammar_rule(victorian_character_names, femalename, 'Eliza').
grammar_rule(victorian_character_names, femalename, 'Agnes').
grammar_rule(victorian_character_names, femalename, 'Molly').
grammar_rule(victorian_character_names, femalename, 'Nell').
grammar_rule(victorian_character_names, femalename, 'Florence').
grammar_rule(victorian_character_names, femalename, 'Beatrice').
grammar_rule(victorian_character_names, femalename, 'Ada').
grammar_rule(victorian_character_names, femalename, 'Constance').
grammar_rule(victorian_character_names, femalename, 'Violet').
grammar_rule(victorian_character_names, femalename, 'Mabel').
grammar_rule(victorian_character_names, femalename, 'Edith').
grammar_rule(victorian_character_names, femalename, 'Dorothy').
grammar_rule(victorian_character_names, femalename, 'Ivy').
grammar_rule(victorian_character_names, familyname, '#surname#').
grammar_rule(victorian_character_names, surname, 'Ashworth').
grammar_rule(victorian_character_names, surname, 'Blackwood').
grammar_rule(victorian_character_names, surname, 'Flint').
grammar_rule(victorian_character_names, surname, 'Whittle').
grammar_rule(victorian_character_names, surname, 'Hale').
grammar_rule(victorian_character_names, surname, 'Hartley').
grammar_rule(victorian_character_names, surname, 'Pemberton').
grammar_rule(victorian_character_names, surname, 'Oakes').
grammar_rule(victorian_character_names, surname, 'Briggs').
grammar_rule(victorian_character_names, surname, 'Graves').
grammar_rule(victorian_character_names, surname, 'Thornton').
grammar_rule(victorian_character_names, surname, 'Grimshaw').

%% Victorian Place Names
grammar(victorian_place_names, 'victorian_place_names').
grammar_description(victorian_place_names, 'Generation of Victorian-era street and building names.').
grammar_rule(victorian_place_names, origin, '#placePrefix# #placeSuffix#').
grammar_rule(victorian_place_names, placeprefix, 'Gaslight').
grammar_rule(victorian_place_names, placeprefix, 'Cinder').
grammar_rule(victorian_place_names, placeprefix, 'Queens').
grammar_rule(victorian_place_names, placeprefix, 'Chapel').
grammar_rule(victorian_place_names, placeprefix, 'Parliament').
grammar_rule(victorian_place_names, placeprefix, 'Wharf').
grammar_rule(victorian_place_names, placeprefix, 'Mill').
grammar_rule(victorian_place_names, placeprefix, 'Victoria').
grammar_rule(victorian_place_names, placeprefix, 'Regent').
grammar_rule(victorian_place_names, placesuffix, 'Lane').
grammar_rule(victorian_place_names, placesuffix, 'Road').
grammar_rule(victorian_place_names, placesuffix, 'Street').
grammar_rule(victorian_place_names, placesuffix, 'Row').
grammar_rule(victorian_place_names, placesuffix, 'Alley').
grammar_rule(victorian_place_names, placesuffix, 'Boulevard').
grammar_rule(victorian_place_names, placesuffix, 'Square').
grammar_rule(victorian_place_names, placesuffix, 'Terrace').

%% Victorian Business Names
grammar(victorian_business_names, 'victorian_business_names').
grammar_description(victorian_business_names, 'Generation of Victorian-era business and establishment names.').
grammar_rule(victorian_business_names, origin, '#businessFormat#').
grammar_rule(victorian_business_names, businessformat, 'The #pubAdj# #pubNoun#').
grammar_rule(victorian_business_names, businessformat, '#surname# and Sons').
grammar_rule(victorian_business_names, businessformat, '#surname# #shopType#').
grammar_rule(victorian_business_names, pubadj, 'Golden').
grammar_rule(victorian_business_names, pubadj, 'Old').
grammar_rule(victorian_business_names, pubadj, 'Royal').
grammar_rule(victorian_business_names, pubadj, 'Iron').
grammar_rule(victorian_business_names, pubadj, 'Red').
grammar_rule(victorian_business_names, pubnoun, 'Lion').
grammar_rule(victorian_business_names, pubnoun, 'Crown').
grammar_rule(victorian_business_names, pubnoun, 'Anchor').
grammar_rule(victorian_business_names, pubnoun, 'Bell').
grammar_rule(victorian_business_names, pubnoun, 'Eagle').
grammar_rule(victorian_business_names, shoptype, 'Apothecary').
grammar_rule(victorian_business_names, shoptype, 'Haberdashery').
grammar_rule(victorian_business_names, shoptype, 'Ironmonger').
grammar_rule(victorian_business_names, shoptype, 'Drapery').
grammar_rule(victorian_business_names, shoptype, 'Chandlery').
grammar_rule(victorian_business_names, surname, 'Ashworth').
grammar_rule(victorian_business_names, surname, 'Blackwood').
grammar_rule(victorian_business_names, surname, 'Pemberton').
grammar_rule(victorian_business_names, surname, 'Thornton').
grammar_rule(victorian_business_names, surname, 'Grimshaw').
