%% Insimul Grammars (Tracery): Welsh Valley
%% Source: data/worlds/language/welsh/grammars.json
%% Converted: 2026-04-03T12:00:00Z
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% alternate_modern_character_names
grammar(alternate_modern_character_names, 'alternate_modern_character_names').
grammar_description(alternate_modern_character_names, 'Character names for an alternate-modern Welsh world. All names MUST be culturally authentic Welsh names -- use real Welsh given names and common Welsh surnames.').
grammar_rule(alternate_modern_character_names, origin, '#givenName# #familyName#').
grammar_rule(alternate_modern_character_names, givenname, '#simpleMale#').
grammar_rule(alternate_modern_character_names, givenname, '#simpleFemale#').
grammar_rule(alternate_modern_character_names, simplemale, 'Rhys').
grammar_rule(alternate_modern_character_names, simplemale, 'Dafydd').
grammar_rule(alternate_modern_character_names, simplemale, 'Owain').
grammar_rule(alternate_modern_character_names, simplemale, 'Hywel').
grammar_rule(alternate_modern_character_names, simplemale, 'Iolo').
grammar_rule(alternate_modern_character_names, simplemale, 'Gethin').
grammar_rule(alternate_modern_character_names, simplemale, 'Emyr').
grammar_rule(alternate_modern_character_names, simplemale, 'Gareth').
grammar_rule(alternate_modern_character_names, simplemale, 'Bryn').
grammar_rule(alternate_modern_character_names, simplemale, 'Tomos').
grammar_rule(alternate_modern_character_names, simplemale, 'Gruffydd').
grammar_rule(alternate_modern_character_names, simplemale, 'Llyr').
grammar_rule(alternate_modern_character_names, simplemale, 'Aneirin').
grammar_rule(alternate_modern_character_names, simplemale, 'Idris').
grammar_rule(alternate_modern_character_names, simplemale, 'Guto').
grammar_rule(alternate_modern_character_names, simplemale, 'Taliesin').
grammar_rule(alternate_modern_character_names, simplemale, 'Rhodri').
grammar_rule(alternate_modern_character_names, simplemale, 'Caradog').
grammar_rule(alternate_modern_character_names, simplemale, 'Dewi').
grammar_rule(alternate_modern_character_names, simplemale, 'Ifan').
grammar_rule(alternate_modern_character_names, simplefemale, 'Gwenllian').
grammar_rule(alternate_modern_character_names, simplefemale, 'Carys').
grammar_rule(alternate_modern_character_names, simplefemale, 'Sioned').
grammar_rule(alternate_modern_character_names, simplefemale, 'Elen').
grammar_rule(alternate_modern_character_names, simplefemale, 'Ffion').
grammar_rule(alternate_modern_character_names, simplefemale, 'Angharad').
grammar_rule(alternate_modern_character_names, simplefemale, 'Eleri').
grammar_rule(alternate_modern_character_names, simplefemale, 'Megan').
grammar_rule(alternate_modern_character_names, simplefemale, 'Non').
grammar_rule(alternate_modern_character_names, simplefemale, 'Siwan').
grammar_rule(alternate_modern_character_names, simplefemale, 'Mali').
grammar_rule(alternate_modern_character_names, simplefemale, 'Cadi').
grammar_rule(alternate_modern_character_names, simplefemale, 'Lowri').
grammar_rule(alternate_modern_character_names, simplefemale, 'Heledd').
grammar_rule(alternate_modern_character_names, simplefemale, 'Cerys').
grammar_rule(alternate_modern_character_names, simplefemale, 'Bethan').
grammar_rule(alternate_modern_character_names, simplefemale, 'Rhiannon').
grammar_rule(alternate_modern_character_names, simplefemale, 'Gwawr').
grammar_rule(alternate_modern_character_names, simplefemale, 'Manon').
grammar_rule(alternate_modern_character_names, simplefemale, 'Catrin').
grammar_rule(alternate_modern_character_names, familyname, '#surname#').
grammar_rule(alternate_modern_character_names, familyname, '#surname#').
grammar_rule(alternate_modern_character_names, familyname, '#surname#').
grammar_rule(alternate_modern_character_names, familyname, '#patronymic#').
grammar_rule(alternate_modern_character_names, surname, 'Jones').
grammar_rule(alternate_modern_character_names, surname, 'Williams').
grammar_rule(alternate_modern_character_names, surname, 'Davies').
grammar_rule(alternate_modern_character_names, surname, 'Evans').
grammar_rule(alternate_modern_character_names, surname, 'Thomas').
grammar_rule(alternate_modern_character_names, surname, 'Roberts').
grammar_rule(alternate_modern_character_names, surname, 'Hughes').
grammar_rule(alternate_modern_character_names, surname, 'Lewis').
grammar_rule(alternate_modern_character_names, surname, 'Morgan').
grammar_rule(alternate_modern_character_names, surname, 'Griffiths').
grammar_rule(alternate_modern_character_names, surname, 'Richards').
grammar_rule(alternate_modern_character_names, surname, 'Owen').
grammar_rule(alternate_modern_character_names, surname, 'Price').
grammar_rule(alternate_modern_character_names, surname, 'Lloyd').
grammar_rule(alternate_modern_character_names, surname, 'Rees').
grammar_rule(alternate_modern_character_names, patronymic, 'ap Rhys').
grammar_rule(alternate_modern_character_names, patronymic, 'ap Hywel').
grammar_rule(alternate_modern_character_names, patronymic, 'ap Gruffydd').
grammar_rule(alternate_modern_character_names, patronymic, 'ferch Owain').
grammar_rule(alternate_modern_character_names, patronymic, 'ferch Dafydd').
grammar_tag(alternate_modern_character_names, generated).
grammar_tag(alternate_modern_character_names, alternate_modern).
grammar_tag(alternate_modern_character_names, name).
grammar_tag(alternate_modern_character_names, character).
grammar_tag(alternate_modern_character_names, names).
grammar_tag(alternate_modern_character_names, welsh).

%% alternate_modern_settlement_names
grammar(alternate_modern_settlement_names, 'alternate_modern_settlement_names').
grammar_description(alternate_modern_settlement_names, 'Settlement names for an alternate-modern Welsh world. Use authentic Welsh place-naming conventions with prefixes like Llan-, Aber-, Cwm-, Pen-, Tre-, and natural features.').
grammar_rule(alternate_modern_settlement_names, origin, '#prefix##baseName#').
grammar_rule(alternate_modern_settlement_names, origin, '#baseName#').
grammar_rule(alternate_modern_settlement_names, origin, '#prefix##baseName##suffix#').
grammar_rule(alternate_modern_settlement_names, prefix, 'Llan').
grammar_rule(alternate_modern_settlement_names, prefix, 'Aber').
grammar_rule(alternate_modern_settlement_names, prefix, 'Cwm').
grammar_rule(alternate_modern_settlement_names, prefix, 'Pen').
grammar_rule(alternate_modern_settlement_names, prefix, 'Tre').
grammar_rule(alternate_modern_settlement_names, prefix, 'Caer').
grammar_rule(alternate_modern_settlement_names, prefix, 'Pont').
grammar_rule(alternate_modern_settlement_names, prefix, 'Nant').
grammar_rule(alternate_modern_settlement_names, basename, 'derwen').
grammar_rule(alternate_modern_settlement_names, basename, 'gwyn').
grammar_rule(alternate_modern_settlement_names, basename, 'ddu').
grammar_rule(alternate_modern_settlement_names, basename, 'fach').
grammar_rule(alternate_modern_settlement_names, basename, 'fawr').
grammar_rule(alternate_modern_settlement_names, basename, 'mynydd').
grammar_rule(alternate_modern_settlement_names, basename, 'afon').
grammar_rule(alternate_modern_settlement_names, basename, 'coed').
grammar_rule(alternate_modern_settlement_names, basename, 'dewi').
grammar_rule(alternate_modern_settlement_names, basename, 'garth').
grammar_rule(alternate_modern_settlement_names, suffix, '-y-bont').
grammar_rule(alternate_modern_settlement_names, suffix, '-uchaf').
grammar_rule(alternate_modern_settlement_names, suffix, '-isaf').
grammar_rule(alternate_modern_settlement_names, suffix, '-newydd').
grammar_rule(alternate_modern_settlement_names, suffix, '-bach').
grammar_tag(alternate_modern_settlement_names, generated).
grammar_tag(alternate_modern_settlement_names, alternate_modern).
grammar_tag(alternate_modern_settlement_names, name).
grammar_tag(alternate_modern_settlement_names, settlement).
grammar_tag(alternate_modern_settlement_names, location).
grammar_tag(alternate_modern_settlement_names, names).
grammar_tag(alternate_modern_settlement_names, welsh).

%% alternate_modern_business_names
grammar(alternate_modern_business_names, 'alternate_modern_business_names').
grammar_description(alternate_modern_business_names, 'Business and establishment names for an alternate-modern Welsh world. Use authentic Welsh business naming conventions with Welsh-language prefixes and descriptors.').
grammar_rule(alternate_modern_business_names, origin, '#prefix# #establishment#').
grammar_rule(alternate_modern_business_names, origin, '#establishment# #surname#').
grammar_rule(alternate_modern_business_names, origin, '#establishment# y #qualifier#').
grammar_rule(alternate_modern_business_names, origin, '#establishment# #givenname#').
grammar_rule(alternate_modern_business_names, origin, 'Tafarn #pubname#').
grammar_rule(alternate_modern_business_names, prefix, 'Siop').
grammar_rule(alternate_modern_business_names, prefix, 'Becws').
grammar_rule(alternate_modern_business_names, prefix, 'Caffi').
grammar_rule(alternate_modern_business_names, prefix, 'Gweithdy').
grammar_rule(alternate_modern_business_names, prefix, 'Canolfan').
grammar_rule(alternate_modern_business_names, prefix, 'Bwyty').
grammar_rule(alternate_modern_business_names, establishment, 'Siop Lyfrau').
grammar_rule(alternate_modern_business_names, establishment, 'Cigydd').
grammar_rule(alternate_modern_business_names, establishment, 'Fferyllfa').
grammar_rule(alternate_modern_business_names, establishment, 'Becws').
grammar_rule(alternate_modern_business_names, establishment, 'Garej').
grammar_rule(alternate_modern_business_names, establishment, 'Caffi').
grammar_rule(alternate_modern_business_names, qualifier, 'Cwm').
grammar_rule(alternate_modern_business_names, qualifier, 'Dref').
grammar_rule(alternate_modern_business_names, qualifier, 'Bont').
grammar_rule(alternate_modern_business_names, qualifier, 'Mynydd').
grammar_rule(alternate_modern_business_names, qualifier, 'Pentref').
grammar_rule(alternate_modern_business_names, qualifier, 'Capel').
grammar_rule(alternate_modern_business_names, surname, 'Jones').
grammar_rule(alternate_modern_business_names, surname, 'Williams').
grammar_rule(alternate_modern_business_names, surname, 'Davies').
grammar_rule(alternate_modern_business_names, surname, 'Evans').
grammar_rule(alternate_modern_business_names, surname, 'Thomas').
grammar_rule(alternate_modern_business_names, surname, 'Roberts').
grammar_rule(alternate_modern_business_names, givenname, 'Dafydd').
grammar_rule(alternate_modern_business_names, givenname, 'Megan').
grammar_rule(alternate_modern_business_names, givenname, 'Rhys').
grammar_rule(alternate_modern_business_names, givenname, 'Gwenllian').
grammar_rule(alternate_modern_business_names, givenname, 'Owain').
grammar_rule(alternate_modern_business_names, givenname, 'Siwan').
grammar_rule(alternate_modern_business_names, pubname, 'y Ddraig Goch').
grammar_rule(alternate_modern_business_names, pubname, 'y Chwarelwr').
grammar_rule(alternate_modern_business_names, pubname, 'y Ffermwr').
grammar_rule(alternate_modern_business_names, pubname, 'yr Eryrod').
grammar_rule(alternate_modern_business_names, pubname, 'y Bont').
grammar_rule(alternate_modern_business_names, pubname, 'yr Hen Gapel').
grammar_tag(alternate_modern_business_names, generated).
grammar_tag(alternate_modern_business_names, alternate_modern).
grammar_tag(alternate_modern_business_names, name).
grammar_tag(alternate_modern_business_names, business).
grammar_tag(alternate_modern_business_names, establishment).
grammar_tag(alternate_modern_business_names, names).
grammar_tag(alternate_modern_business_names, welsh).
