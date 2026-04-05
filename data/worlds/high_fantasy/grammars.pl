%% Insimul Grammars (Tracery): High Fantasy
%% Source: data/worlds/high_fantasy/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Elvish Character Names
grammar(elvish_character_names, 'elvish_character_names').
grammar_description(elvish_character_names, 'Elvish name generation with flowing syllables and nature-inspired surnames.').
grammar_rule(elvish_character_names, origin, '#givenName# #familyName#').
grammar_rule(elvish_character_names, givenname, '#maleName#').
grammar_rule(elvish_character_names, givenname, '#femaleName#').
grammar_rule(elvish_character_names, malename, 'Thalion').
grammar_rule(elvish_character_names, malename, 'Ithrandil').
grammar_rule(elvish_character_names, malename, 'Caelorn').
grammar_rule(elvish_character_names, malename, 'Arannis').
grammar_rule(elvish_character_names, malename, 'Faelar').
grammar_rule(elvish_character_names, malename, 'Elorin').
grammar_rule(elvish_character_names, malename, 'Sylvarin').
grammar_rule(elvish_character_names, malename, 'Mirethil').
grammar_rule(elvish_character_names, malename, 'Aldaron').
grammar_rule(elvish_character_names, malename, 'Thandril').
grammar_rule(elvish_character_names, femalename, 'Elowen').
grammar_rule(elvish_character_names, femalename, 'Caelindra').
grammar_rule(elvish_character_names, femalename, 'Faelina').
grammar_rule(elvish_character_names, femalename, 'Lyraniel').
grammar_rule(elvish_character_names, femalename, 'Aelith').
grammar_rule(elvish_character_names, femalename, 'Nymeria').
grammar_rule(elvish_character_names, femalename, 'Seraphina').
grammar_rule(elvish_character_names, femalename, 'Isilwen').
grammar_rule(elvish_character_names, femalename, 'Galawen').
grammar_rule(elvish_character_names, femalename, 'Lorelei').
grammar_rule(elvish_character_names, familyname, '#elvishSurname#').
grammar_rule(elvish_character_names, elvishsurname, 'Starweaver').
grammar_rule(elvish_character_names, elvishsurname, 'Moonwhisper').
grammar_rule(elvish_character_names, elvishsurname, 'Dawnpetal').
grammar_rule(elvish_character_names, elvishsurname, 'Silvershade').
grammar_rule(elvish_character_names, elvishsurname, 'Windwalker').
grammar_rule(elvish_character_names, elvishsurname, 'Thornbloom').
grammar_rule(elvish_character_names, elvishsurname, 'Nighthollow').
grammar_rule(elvish_character_names, elvishsurname, 'Sunveil').
grammar_rule(elvish_character_names, elvishsurname, 'Leafsong').
grammar_rule(elvish_character_names, elvishsurname, 'Mistwalker').

%% Dwarven Character Names
grammar(dwarven_character_names, 'dwarven_character_names').
grammar_description(dwarven_character_names, 'Dwarven name generation with hard consonants and craft-inspired surnames.').
grammar_rule(dwarven_character_names, origin, '#givenName# #familyName#').
grammar_rule(dwarven_character_names, givenname, '#maleName#').
grammar_rule(dwarven_character_names, givenname, '#femaleName#').
grammar_rule(dwarven_character_names, malename, 'Thorgar').
grammar_rule(dwarven_character_names, malename, 'Dolgrim').
grammar_rule(dwarven_character_names, malename, 'Rurik').
grammar_rule(dwarven_character_names, malename, 'Balin').
grammar_rule(dwarven_character_names, malename, 'Durgan').
grammar_rule(dwarven_character_names, malename, 'Kragnar').
grammar_rule(dwarven_character_names, malename, 'Grimjaw').
grammar_rule(dwarven_character_names, malename, 'Brokk').
grammar_rule(dwarven_character_names, malename, 'Thrain').
grammar_rule(dwarven_character_names, malename, 'Orndir').
grammar_rule(dwarven_character_names, femalename, 'Hilda').
grammar_rule(dwarven_character_names, femalename, 'Brenna').
grammar_rule(dwarven_character_names, femalename, 'Sigrid').
grammar_rule(dwarven_character_names, femalename, 'Helga').
grammar_rule(dwarven_character_names, femalename, 'Astrid').
grammar_rule(dwarven_character_names, femalename, 'Frida').
grammar_rule(dwarven_character_names, femalename, 'Dagny').
grammar_rule(dwarven_character_names, femalename, 'Inga').
grammar_rule(dwarven_character_names, femalename, 'Runa').
grammar_rule(dwarven_character_names, femalename, 'Thyra').
grammar_rule(dwarven_character_names, familyname, '#dwarvenSurname#').
grammar_rule(dwarven_character_names, dwarvensurname, 'Ironforge').
grammar_rule(dwarven_character_names, dwarvensurname, 'Stonebeard').
grammar_rule(dwarven_character_names, dwarvensurname, 'Brightshard').
grammar_rule(dwarven_character_names, dwarvensurname, 'Deepdelve').
grammar_rule(dwarven_character_names, dwarvensurname, 'Hammerfall').
grammar_rule(dwarven_character_names, dwarvensurname, 'Coalheart').
grammar_rule(dwarven_character_names, dwarvensurname, 'Anvilborn').
grammar_rule(dwarven_character_names, dwarvensurname, 'Goldvein').
grammar_rule(dwarven_character_names, dwarvensurname, 'Steelmantle').
grammar_rule(dwarven_character_names, dwarvensurname, 'Rumblerock').

%% Human Character Names
grammar(human_character_names, 'human_character_names').
grammar_description(human_character_names, 'Human name generation for a frontier medieval setting.').
grammar_rule(human_character_names, origin, '#givenName# #familyName#').
grammar_rule(human_character_names, givenname, '#maleName#').
grammar_rule(human_character_names, givenname, '#femaleName#').
grammar_rule(human_character_names, malename, 'Aldric').
grammar_rule(human_character_names, malename, 'Rowan').
grammar_rule(human_character_names, malename, 'Gareth').
grammar_rule(human_character_names, malename, 'Orin').
grammar_rule(human_character_names, malename, 'Bran').
grammar_rule(human_character_names, malename, 'Edric').
grammar_rule(human_character_names, malename, 'Cedric').
grammar_rule(human_character_names, malename, 'Halden').
grammar_rule(human_character_names, malename, 'Marcus').
grammar_rule(human_character_names, malename, 'Derrick').
grammar_rule(human_character_names, femalename, 'Maren').
grammar_rule(human_character_names, femalename, 'Sera').
grammar_rule(human_character_names, femalename, 'Elise').
grammar_rule(human_character_names, femalename, 'Rowena').
grammar_rule(human_character_names, femalename, 'Brigid').
grammar_rule(human_character_names, femalename, 'Linnea').
grammar_rule(human_character_names, femalename, 'Thalia').
grammar_rule(human_character_names, femalename, 'Corinna').
grammar_rule(human_character_names, femalename, 'Wynn').
grammar_rule(human_character_names, femalename, 'Isolde').
grammar_rule(human_character_names, familyname, '#humanSurname#').
grammar_rule(human_character_names, humansurname, 'Thornwall').
grammar_rule(human_character_names, humansurname, 'Blackthorn').
grammar_rule(human_character_names, humansurname, 'Steelheart').
grammar_rule(human_character_names, humansurname, 'Duskmantle').
grammar_rule(human_character_names, humansurname, 'Ashford').
grammar_rule(human_character_names, humansurname, 'Greymoor').
grammar_rule(human_character_names, humansurname, 'Stormwind').
grammar_rule(human_character_names, humansurname, 'Oakshield').
grammar_rule(human_character_names, humansurname, 'Ravencrest').
grammar_rule(human_character_names, humansurname, 'Whitehall').
