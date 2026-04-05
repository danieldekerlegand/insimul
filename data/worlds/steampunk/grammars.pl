%% Insimul Grammars (Tracery): Steampunk
%% Source: data/worlds/steampunk/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Steampunk Character Names
grammar(steampunk_character_names, 'steampunk_character_names').
grammar_description(steampunk_character_names, 'Victorian-era inspired name generation for a steampunk industrial republic.').
grammar_rule(steampunk_character_names, origin, '#givenName# #familyName#').
grammar_rule(steampunk_character_names, givenname, '#maleName#').
grammar_rule(steampunk_character_names, givenname, '#femaleName#').
grammar_rule(steampunk_character_names, malename, 'Edmund').
grammar_rule(steampunk_character_names, malename, 'Aldric').
grammar_rule(steampunk_character_names, malename, 'Garrick').
grammar_rule(steampunk_character_names, malename, 'Tobias').
grammar_rule(steampunk_character_names, malename, 'Silas').
grammar_rule(steampunk_character_names, malename, 'Felix').
grammar_rule(steampunk_character_names, malename, 'Reginald').
grammar_rule(steampunk_character_names, malename, 'Jasper').
grammar_rule(steampunk_character_names, malename, 'Barnaby').
grammar_rule(steampunk_character_names, malename, 'Cornelius').
grammar_rule(steampunk_character_names, malename, 'Percival').
grammar_rule(steampunk_character_names, malename, 'Thaddeus').
grammar_rule(steampunk_character_names, malename, 'Nigel').
grammar_rule(steampunk_character_names, malename, 'Archibald').
grammar_rule(steampunk_character_names, malename, 'Rupert').
grammar_rule(steampunk_character_names, femalename, 'Eleanor').
grammar_rule(steampunk_character_names, femalename, 'Margaret').
grammar_rule(steampunk_character_names, femalename, 'Rosalind').
grammar_rule(steampunk_character_names, femalename, 'Helena').
grammar_rule(steampunk_character_names, femalename, 'Cecilia').
grammar_rule(steampunk_character_names, femalename, 'Vivienne').
grammar_rule(steampunk_character_names, femalename, 'Charlotte').
grammar_rule(steampunk_character_names, femalename, 'Dorothea').
grammar_rule(steampunk_character_names, femalename, 'Wren').
grammar_rule(steampunk_character_names, femalename, 'Minerva').
grammar_rule(steampunk_character_names, femalename, 'Beatrix').
grammar_rule(steampunk_character_names, femalename, 'Cordelia').
grammar_rule(steampunk_character_names, femalename, 'Prudence').
grammar_rule(steampunk_character_names, femalename, 'Isadora').
grammar_rule(steampunk_character_names, femalename, 'Millicent').
grammar_rule(steampunk_character_names, familyname, '#surname#').
grammar_rule(steampunk_character_names, surname, 'Hargrove').
grammar_rule(steampunk_character_names, surname, 'Pendleton').
grammar_rule(steampunk_character_names, surname, 'Ironvein').
grammar_rule(steampunk_character_names, surname, 'Voss').
grammar_rule(steampunk_character_names, surname, 'Blackwood').
grammar_rule(steampunk_character_names, surname, 'Cogsworth').
grammar_rule(steampunk_character_names, surname, 'Thatch').
grammar_rule(steampunk_character_names, surname, 'Brassworth').
grammar_rule(steampunk_character_names, surname, 'Gearhart').
grammar_rule(steampunk_character_names, surname, 'Copperfield').
grammar_rule(steampunk_character_names, surname, 'Ashford').
grammar_rule(steampunk_character_names, surname, 'Tinsworth').

%% Steampunk Place Names
grammar(steampunk_place_names, 'steampunk_place_names').
grammar_description(steampunk_place_names, 'Generation of industrial Victorian-style street and building names.').
grammar_rule(steampunk_place_names, origin, '#prefix# #suffix#').
grammar_rule(steampunk_place_names, prefix, 'Iron').
grammar_rule(steampunk_place_names, prefix, 'Brass').
grammar_rule(steampunk_place_names, prefix, 'Copper').
grammar_rule(steampunk_place_names, prefix, 'Steam').
grammar_rule(steampunk_place_names, prefix, 'Gear').
grammar_rule(steampunk_place_names, prefix, 'Cog').
grammar_rule(steampunk_place_names, prefix, 'Clock').
grammar_rule(steampunk_place_names, prefix, 'Boiler').
grammar_rule(steampunk_place_names, suffix, 'haven').
grammar_rule(steampunk_place_names, suffix, 'mouth').
grammar_rule(steampunk_place_names, suffix, 'ward').
grammar_rule(steampunk_place_names, suffix, 'gate').
grammar_rule(steampunk_place_names, suffix, 'forge').
grammar_rule(steampunk_place_names, suffix, 'works').
grammar_rule(steampunk_place_names, suffix, 'vale').
grammar_rule(steampunk_place_names, suffix, 'hollow').

%% Steampunk Business Names
grammar(steampunk_business_names, 'steampunk_business_names').
grammar_description(steampunk_business_names, 'Generation of Victorian industrial business names.').
grammar_rule(steampunk_business_names, origin, '#prefix# #businessType#').
grammar_rule(steampunk_business_names, prefix, 'The Brass').
grammar_rule(steampunk_business_names, prefix, 'Ironside').
grammar_rule(steampunk_business_names, prefix, 'Geargrind').
grammar_rule(steampunk_business_names, prefix, 'Steamwheel').
grammar_rule(steampunk_business_names, prefix, 'Coppertop').
grammar_rule(steampunk_business_names, prefix, 'Clockwork').
grammar_rule(steampunk_business_names, businesstype, 'Workshop').
grammar_rule(steampunk_business_names, businesstype, 'Emporium').
grammar_rule(steampunk_business_names, businesstype, 'Foundry').
grammar_rule(steampunk_business_names, businesstype, 'Exchange').
grammar_rule(steampunk_business_names, businesstype, 'Salon').
grammar_rule(steampunk_business_names, businesstype, 'Refinery').
