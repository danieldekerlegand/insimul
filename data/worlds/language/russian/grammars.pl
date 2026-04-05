%% Insimul Grammars (Tracery): Russian Volga Town
%% Source: data/worlds/language/russian/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Russian Character Names (given + patronymic + family)
grammar(russian_character_names, 'russian_character_names').
grammar_description(russian_character_names, 'Authentic Russian name generation with given name, patronymic, and family name. Male patronymics end in -ovich/-evich, female in -ovna/-evna. Female surnames take -a ending.').
grammar_rule(russian_character_names, origin, '#maleFull#').
grammar_rule(russian_character_names, origin, '#femaleFull#').
grammar_rule(russian_character_names, malefull, '#maleName# #malePatronymic# #maleSurname#').
grammar_rule(russian_character_names, femalefull, '#femaleName# #femalePatronymic# #femaleSurname#').
grammar_rule(russian_character_names, malename, 'Ivan').
grammar_rule(russian_character_names, malename, 'Dmitry').
grammar_rule(russian_character_names, malename, 'Nikolai').
grammar_rule(russian_character_names, malename, 'Aleksei').
grammar_rule(russian_character_names, malename, 'Sergei').
grammar_rule(russian_character_names, malename, 'Viktor').
grammar_rule(russian_character_names, malename, 'Andrei').
grammar_rule(russian_character_names, malename, 'Pavel').
grammar_rule(russian_character_names, malename, 'Grigory').
grammar_rule(russian_character_names, malename, 'Mikhail').
grammar_rule(russian_character_names, malename, 'Pyotr').
grammar_rule(russian_character_names, malename, 'Maksim').
grammar_rule(russian_character_names, malename, 'Boris').
grammar_rule(russian_character_names, malename, 'Vasily').
grammar_rule(russian_character_names, malename, 'Fyodor').
grammar_rule(russian_character_names, femalename, 'Natalya').
grammar_rule(russian_character_names, femalename, 'Olga').
grammar_rule(russian_character_names, femalename, 'Yelena').
grammar_rule(russian_character_names, femalename, 'Tatyana').
grammar_rule(russian_character_names, femalename, 'Marina').
grammar_rule(russian_character_names, femalename, 'Vera').
grammar_rule(russian_character_names, femalename, 'Anna').
grammar_rule(russian_character_names, femalename, 'Lyudmila').
grammar_rule(russian_character_names, femalename, 'Irina').
grammar_rule(russian_character_names, femalename, 'Darya').
grammar_rule(russian_character_names, femalename, 'Valentina').
grammar_rule(russian_character_names, femalename, 'Katya').
grammar_rule(russian_character_names, femalename, 'Svetlana').
grammar_rule(russian_character_names, femalename, 'Galina').
grammar_rule(russian_character_names, femalename, 'Yekaterina').
grammar_rule(russian_character_names, malepatronymic, 'Petrovich').
grammar_rule(russian_character_names, malepatronymic, 'Ivanovich').
grammar_rule(russian_character_names, malepatronymic, 'Aleksandrovich').
grammar_rule(russian_character_names, malepatronymic, 'Nikolayevich').
grammar_rule(russian_character_names, malepatronymic, 'Sergeyevich').
grammar_rule(russian_character_names, malepatronymic, 'Vasilyevich').
grammar_rule(russian_character_names, malepatronymic, 'Dmitriyevich').
grammar_rule(russian_character_names, malepatronymic, 'Mikhailovich').
grammar_rule(russian_character_names, malepatronymic, 'Pavlovich').
grammar_rule(russian_character_names, malepatronymic, 'Grigoryevich').
grammar_rule(russian_character_names, malepatronymic, 'Borisovich').
grammar_rule(russian_character_names, malepatronymic, 'Fyodorovich').
grammar_rule(russian_character_names, femalepatronymic, 'Petrovna').
grammar_rule(russian_character_names, femalepatronymic, 'Ivanovna').
grammar_rule(russian_character_names, femalepatronymic, 'Aleksandrovna').
grammar_rule(russian_character_names, femalepatronymic, 'Nikolayevna').
grammar_rule(russian_character_names, femalepatronymic, 'Sergeyevna').
grammar_rule(russian_character_names, femalepatronymic, 'Vasilyevna').
grammar_rule(russian_character_names, femalepatronymic, 'Dmitriyevna').
grammar_rule(russian_character_names, femalepatronymic, 'Mikhailovna').
grammar_rule(russian_character_names, femalepatronymic, 'Pavlovna').
grammar_rule(russian_character_names, femalepatronymic, 'Grigoryevna').
grammar_rule(russian_character_names, femalepatronymic, 'Borisovna').
grammar_rule(russian_character_names, femalepatronymic, 'Fyodorovna').
grammar_rule(russian_character_names, malesurname, 'Volkov').
grammar_rule(russian_character_names, malesurname, 'Ivanov').
grammar_rule(russian_character_names, malesurname, 'Petrov').
grammar_rule(russian_character_names, malesurname, 'Sokolov').
grammar_rule(russian_character_names, malesurname, 'Kuznetsov').
grammar_rule(russian_character_names, malesurname, 'Morozov').
grammar_rule(russian_character_names, malesurname, 'Smirnov').
grammar_rule(russian_character_names, malesurname, 'Popov').
grammar_rule(russian_character_names, malesurname, 'Lebedev').
grammar_rule(russian_character_names, malesurname, 'Kozlov').
grammar_rule(russian_character_names, malesurname, 'Novikov').
grammar_rule(russian_character_names, malesurname, 'Orlov').
grammar_rule(russian_character_names, femalesurname, 'Volkova').
grammar_rule(russian_character_names, femalesurname, 'Ivanova').
grammar_rule(russian_character_names, femalesurname, 'Petrova').
grammar_rule(russian_character_names, femalesurname, 'Sokolova').
grammar_rule(russian_character_names, femalesurname, 'Kuznetsova').
grammar_rule(russian_character_names, femalesurname, 'Morozova').
grammar_rule(russian_character_names, femalesurname, 'Smirnova').
grammar_rule(russian_character_names, femalesurname, 'Popova').
grammar_rule(russian_character_names, femalesurname, 'Lebedeva').
grammar_rule(russian_character_names, femalesurname, 'Kozlova').
grammar_rule(russian_character_names, femalesurname, 'Novikova').
grammar_rule(russian_character_names, femalesurname, 'Orlova').

%% Russian Place Names
grammar(russian_place_names, 'russian_place_names').
grammar_description(russian_place_names, 'Generation of Russian-style place names for streets and landmarks.').
grammar_rule(russian_place_names, origin, '#placeType# #placeQuality#').
grammar_rule(russian_place_names, placetype, 'Ulitsa').
grammar_rule(russian_place_names, placetype, 'Prospekt').
grammar_rule(russian_place_names, placetype, 'Pereulok').
grammar_rule(russian_place_names, placetype, 'Ploshchad').
grammar_rule(russian_place_names, placetype, 'Naberezhnaya').
grammar_rule(russian_place_names, placequality, 'Lenina').
grammar_rule(russian_place_names, placequality, 'Pushkina').
grammar_rule(russian_place_names, placequality, 'Mira').
grammar_rule(russian_place_names, placequality, 'Gagarina').
grammar_rule(russian_place_names, placequality, 'Sovetskaya').
grammar_rule(russian_place_names, placequality, 'Volzhskaya').
grammar_rule(russian_place_names, placequality, 'Rechnaya').
grammar_rule(russian_place_names, placequality, 'Tsentralnaya').

%% Russian Business Names
grammar(russian_business_names, 'russian_business_names').
grammar_description(russian_business_names, 'Generation of Russian-style business names for shops and restaurants.').
grammar_rule(russian_business_names, origin, '#businessType# #businessQuality#').
grammar_rule(russian_business_names, businesstype, 'Kafe').
grammar_rule(russian_business_names, businesstype, 'Restoran').
grammar_rule(russian_business_names, businesstype, 'Magazin').
grammar_rule(russian_business_names, businesstype, 'Apteka').
grammar_rule(russian_business_names, businesstype, 'Bulochnaya').
grammar_rule(russian_business_names, businesstype, 'Stolovaya').
grammar_rule(russian_business_names, businessquality, 'Volga').
grammar_rule(russian_business_names, businessquality, 'Druzhba').
grammar_rule(russian_business_names, businessquality, 'Zdorovye').
grammar_rule(russian_business_names, businessquality, 'Yelka').
grammar_rule(russian_business_names, businessquality, 'Solnyshko').
grammar_rule(russian_business_names, businessquality, 'Kolosok').
