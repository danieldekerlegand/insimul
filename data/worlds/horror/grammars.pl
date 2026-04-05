%% Insimul Grammars (Tracery): Horror World
%% Source: data/worlds/horror/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Horror Character Names
grammar(horror_character_names, 'horror_character_names').
grammar_description(horror_character_names, 'Name generation for a New England cosmic horror setting.').
grammar_rule(horror_character_names, origin, '#givenName# #familyName#').
grammar_rule(horror_character_names, givenname, '#maleName#').
grammar_rule(horror_character_names, givenname, '#femaleName#').
grammar_rule(horror_character_names, malename, 'Edgar').
grammar_rule(horror_character_names, malename, 'Silas').
grammar_rule(horror_character_names, malename, 'Corvus').
grammar_rule(horror_character_names, malename, 'Ezekiel').
grammar_rule(horror_character_names, malename, 'Ambrose').
grammar_rule(horror_character_names, malename, 'Thomas').
grammar_rule(horror_character_names, malename, 'Caleb').
grammar_rule(horror_character_names, malename, 'Abel').
grammar_rule(horror_character_names, malename, 'Jack').
grammar_rule(horror_character_names, malename, 'Josiah').
grammar_rule(horror_character_names, malename, 'Elijah').
grammar_rule(horror_character_names, malename, 'Obadiah').
grammar_rule(horror_character_names, malename, 'Nathaniel').
grammar_rule(horror_character_names, malename, 'Solomon').
grammar_rule(horror_character_names, malename, 'Ichabod').
grammar_rule(horror_character_names, femalename, 'Martha').
grammar_rule(horror_character_names, femalename, 'Eleanor').
grammar_rule(horror_character_names, femalename, 'Virginia').
grammar_rule(horror_character_names, femalename, 'Isolde').
grammar_rule(horror_character_names, femalename, 'Ruth').
grammar_rule(horror_character_names, femalename, 'Miriam').
grammar_rule(horror_character_names, femalename, 'Agnes').
grammar_rule(horror_character_names, femalename, 'Lena').
grammar_rule(horror_character_names, femalename, 'Prudence').
grammar_rule(horror_character_names, femalename, 'Abigail').
grammar_rule(horror_character_names, femalename, 'Mercy').
grammar_rule(horror_character_names, femalename, 'Constance').
grammar_rule(horror_character_names, femalename, 'Delilah').
grammar_rule(horror_character_names, femalename, 'Tabitha').
grammar_rule(horror_character_names, femalename, 'Hester').
grammar_rule(horror_character_names, familyname, '#surname#').
grammar_rule(horror_character_names, surname, 'Holloway').
grammar_rule(horror_character_names, surname, 'Blackwood').
grammar_rule(horror_character_names, surname, 'Crane').
grammar_rule(horror_character_names, surname, 'Hargrove').
grammar_rule(horror_character_names, surname, 'Thorne').
grammar_rule(horror_character_names, surname, 'Bledsoe').
grammar_rule(horror_character_names, surname, 'Wight').
grammar_rule(horror_character_names, surname, 'Marsh').
grammar_rule(horror_character_names, surname, 'Ashford').
grammar_rule(horror_character_names, surname, 'Dunwich').
grammar_rule(horror_character_names, surname, 'Whateley').
grammar_rule(horror_character_names, surname, 'Crowley').

%% Horror Place Names
grammar(horror_place_names, 'horror_place_names').
grammar_description(horror_place_names, 'Generation of foreboding place names for a horror setting.').
grammar_rule(horror_place_names, origin, '#placePrefix# #placeSuffix#').
grammar_rule(horror_place_names, placeprefix, 'Dead').
grammar_rule(horror_place_names, placeprefix, 'Black').
grammar_rule(horror_place_names, placeprefix, 'Gallows').
grammar_rule(horror_place_names, placeprefix, 'Shadow').
grammar_rule(horror_place_names, placeprefix, 'Raven').
grammar_rule(horror_place_names, placeprefix, 'Hollow').
grammar_rule(horror_place_names, placeprefix, 'Grim').
grammar_rule(horror_place_names, placeprefix, 'Ash').
grammar_rule(horror_place_names, placesuffix, 'Road').
grammar_rule(horror_place_names, placesuffix, 'Lane').
grammar_rule(horror_place_names, placesuffix, 'Path').
grammar_rule(horror_place_names, placesuffix, 'Hollow').
grammar_rule(horror_place_names, placesuffix, 'Hill').
grammar_rule(horror_place_names, placesuffix, 'Creek').
grammar_rule(horror_place_names, placesuffix, 'Point').
grammar_rule(horror_place_names, placesuffix, 'Crossing').

%% Horror Business Names
grammar(horror_business_names, 'horror_business_names').
grammar_description(horror_business_names, 'Generation of unsettling business and establishment names.').
grammar_rule(horror_business_names, origin, '#businessFormat#').
grammar_rule(horror_business_names, businessformat, 'The #adj# #noun#').
grammar_rule(horror_business_names, businessformat, '#surname# #shopType#').
grammar_rule(horror_business_names, adj, 'Drowned').
grammar_rule(horror_business_names, adj, 'Old').
grammar_rule(horror_business_names, adj, 'Crooked').
grammar_rule(horror_business_names, adj, 'Silent').
grammar_rule(horror_business_names, adj, 'Withered').
grammar_rule(horror_business_names, noun, 'Sailor').
grammar_rule(horror_business_names, noun, 'Crow').
grammar_rule(horror_business_names, noun, 'Lantern').
grammar_rule(horror_business_names, noun, 'Bell').
grammar_rule(horror_business_names, noun, 'Anchor').
grammar_rule(horror_business_names, shoptype, 'Apothecary').
grammar_rule(horror_business_names, shoptype, 'General Store').
grammar_rule(horror_business_names, shoptype, 'Boarding House').
grammar_rule(horror_business_names, shoptype, 'Chandlery').
grammar_rule(horror_business_names, shoptype, 'Provisions').
grammar_rule(horror_business_names, surname, 'Holloway').
grammar_rule(horror_business_names, surname, 'Bledsoe').
grammar_rule(horror_business_names, surname, 'Marsh').
grammar_rule(horror_business_names, surname, 'Crane').
grammar_rule(horror_business_names, surname, 'Ashford').
