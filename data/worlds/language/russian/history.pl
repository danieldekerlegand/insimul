%% Ensemble History: Russian Volga Town -- Initial World State
%% Source: data/worlds/language/russian/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status, language

%% --- Ivan Petrovich Volkov ---
trait(ivan_volkov, male).
trait(ivan_volkov, hospitable).
trait(ivan_volkov, generous).
trait(ivan_volkov, traditional).
trait(ivan_volkov, middle_aged).
attribute(ivan_volkov, charisma, 75).
attribute(ivan_volkov, cultural_knowledge, 85).
attribute(ivan_volkov, propriety, 70).
language_proficiency(ivan_volkov, russian, 95).
language_proficiency(ivan_volkov, english, 20).

%% --- Natalya Sergeyevna Volkova ---
trait(natalya_volkova, female).
trait(natalya_volkova, nurturing).
trait(natalya_volkova, warm).
trait(natalya_volkova, community_minded).
attribute(natalya_volkova, charisma, 70).
attribute(natalya_volkova, cultural_knowledge, 90).
attribute(natalya_volkova, propriety, 80).
relationship(natalya_volkova, ivan_volkov, married).
language_proficiency(natalya_volkova, russian, 95).
language_proficiency(natalya_volkova, english, 15).

%% --- Aleksei Ivanovich Volkov ---
trait(aleksei_volkov, male).
trait(aleksei_volkov, young).
trait(aleksei_volkov, ambitious).
trait(aleksei_volkov, tech_savvy).
attribute(aleksei_volkov, charisma, 65).
attribute(aleksei_volkov, cunningness, 50).
attribute(aleksei_volkov, self_assuredness, 70).
language_proficiency(aleksei_volkov, russian, 90).
language_proficiency(aleksei_volkov, english, 65).

%% --- Marina Ivanovna Volkova ---
trait(marina_volkova, female).
trait(marina_volkova, young).
trait(marina_volkova, artistic).
trait(marina_volkova, thoughtful).
attribute(marina_volkova, charisma, 60).
attribute(marina_volkova, cultural_knowledge, 65).
attribute(marina_volkova, sensitiveness, 75).
language_proficiency(marina_volkova, russian, 90).
language_proficiency(marina_volkova, english, 50).

%% --- Dmitry Aleksandrovich Ivanov ---
trait(dmitry_ivanov, male).
trait(dmitry_ivanov, educated).
trait(dmitry_ivanov, formal).
trait(dmitry_ivanov, intellectual).
trait(dmitry_ivanov, middle_aged).
attribute(dmitry_ivanov, charisma, 80).
attribute(dmitry_ivanov, cultural_knowledge, 95).
attribute(dmitry_ivanov, propriety, 85).
language_proficiency(dmitry_ivanov, russian, 98).
language_proficiency(dmitry_ivanov, english, 75).
language_proficiency(dmitry_ivanov, german, 40).

%% --- Olga Nikolayevna Ivanova ---
trait(olga_ivanova, female).
trait(olga_ivanova, articulate).
trait(olga_ivanova, passionate).
trait(olga_ivanova, modern).
attribute(olga_ivanova, charisma, 85).
attribute(olga_ivanova, cultural_knowledge, 80).
attribute(olga_ivanova, self_assuredness, 80).
relationship(olga_ivanova, dmitry_ivanov, married).
language_proficiency(olga_ivanova, russian, 95).
language_proficiency(olga_ivanova, english, 70).

%% --- Yelena Dmitriyevna Ivanova ---
trait(yelena_ivanova, female).
trait(yelena_ivanova, young).
trait(yelena_ivanova, studious).
trait(yelena_ivanova, idealistic).
attribute(yelena_ivanova, charisma, 60).
attribute(yelena_ivanova, cultural_knowledge, 70).
attribute(yelena_ivanova, self_assuredness, 55).
language_proficiency(yelena_ivanova, russian, 92).
language_proficiency(yelena_ivanova, english, 80).

%% --- Andrei Dmitriyevich Ivanov ---
trait(andrei_ivanov, male).
trait(andrei_ivanov, young).
trait(andrei_ivanov, social).
trait(andrei_ivanov, athletic).
attribute(andrei_ivanov, charisma, 75).
attribute(andrei_ivanov, self_assuredness, 70).
attribute(andrei_ivanov, cunningness, 45).
language_proficiency(andrei_ivanov, russian, 88).
language_proficiency(andrei_ivanov, english, 60).

%% --- Nikolai Vasilyevich Petrov ---
trait(nikolai_petrov, male).
trait(nikolai_petrov, shrewd).
trait(nikolai_petrov, experienced).
trait(nikolai_petrov, merchant).
trait(nikolai_petrov, middle_aged).
attribute(nikolai_petrov, charisma, 80).
attribute(nikolai_petrov, cunningness, 75).
attribute(nikolai_petrov, cultural_knowledge, 70).
relationship(nikolai_petrov, ivan_volkov, friends).
language_proficiency(nikolai_petrov, russian, 95).
language_proficiency(nikolai_petrov, english, 30).

%% --- Vera Ivanovna Petrova ---
trait(vera_petrova, female).
trait(vera_petrova, organized).
trait(vera_petrova, warm).
trait(vera_petrova, practical).
attribute(vera_petrova, charisma, 65).
attribute(vera_petrova, propriety, 75).
attribute(vera_petrova, cultural_knowledge, 80).
relationship(vera_petrova, nikolai_petrov, married).
relationship(vera_petrova, natalya_volkova, friends).
language_proficiency(vera_petrova, russian, 93).
language_proficiency(vera_petrova, english, 20).

%% --- Tatyana Nikolayevna Petrova ---
trait(tatyana_petrova, female).
trait(tatyana_petrova, young).
trait(tatyana_petrova, creative).
trait(tatyana_petrova, independent).
attribute(tatyana_petrova, charisma, 70).
attribute(tatyana_petrova, self_assuredness, 65).
attribute(tatyana_petrova, sensitiveness, 60).
relationship(tatyana_petrova, yelena_ivanova, friends).
language_proficiency(tatyana_petrova, russian, 90).
language_proficiency(tatyana_petrova, english, 55).

%% --- Sergei Nikolayevich Petrov ---
trait(sergei_petrov, male).
trait(sergei_petrov, young).
trait(sergei_petrov, entrepreneurial).
trait(sergei_petrov, energetic).
attribute(sergei_petrov, charisma, 70).
attribute(sergei_petrov, cunningness, 60).
attribute(sergei_petrov, self_assuredness, 65).
language_proficiency(sergei_petrov, russian, 88).
language_proficiency(sergei_petrov, english, 50).

%% --- Viktor Mikhailovich Sokolov ---
trait(viktor_sokolov, male).
trait(viktor_sokolov, educated).
trait(viktor_sokolov, caring).
trait(viktor_sokolov, respected).
trait(viktor_sokolov, middle_aged).
attribute(viktor_sokolov, charisma, 75).
attribute(viktor_sokolov, cultural_knowledge, 70).
attribute(viktor_sokolov, propriety, 80).
relationship(viktor_sokolov, dmitry_ivanov, friends).
language_proficiency(viktor_sokolov, russian, 95).
language_proficiency(viktor_sokolov, english, 65).

%% --- Lyudmila Borisovna Sokolova ---
trait(lyudmila_sokolova, female).
trait(lyudmila_sokolova, elegant).
trait(lyudmila_sokolova, artistic).
trait(lyudmila_sokolova, cultured).
attribute(lyudmila_sokolova, charisma, 80).
attribute(lyudmila_sokolova, cultural_knowledge, 85).
attribute(lyudmila_sokolova, sensitiveness, 70).
relationship(lyudmila_sokolova, viktor_sokolov, married).
language_proficiency(lyudmila_sokolova, russian, 93).
language_proficiency(lyudmila_sokolova, english, 55).

%% --- Pavel Viktorovich Sokolov ---
trait(pavel_sokolov, male).
trait(pavel_sokolov, young).
trait(pavel_sokolov, rebellious).
trait(pavel_sokolov, musical).
attribute(pavel_sokolov, charisma, 65).
attribute(pavel_sokolov, self_assuredness, 55).
attribute(pavel_sokolov, sensitiveness, 70).
relationship(pavel_sokolov, andrei_ivanov, friends).
language_proficiency(pavel_sokolov, russian, 85).
language_proficiency(pavel_sokolov, english, 55).

%% --- Anna Viktorovna Sokolova ---
trait(anna_sokolova, female).
trait(anna_sokolova, young).
trait(anna_sokolova, diligent).
trait(anna_sokolova, kind).
attribute(anna_sokolova, charisma, 60).
attribute(anna_sokolova, propriety, 75).
attribute(anna_sokolova, cultural_knowledge, 65).
relationship(anna_sokolova, marina_volkova, friends).
language_proficiency(anna_sokolova, russian, 90).
language_proficiency(anna_sokolova, english, 65).

%% --- Grigory Pavlovich Kuznetsov ---
trait(grigory_kuznetsov, male).
trait(grigory_kuznetsov, rugged).
trait(grigory_kuznetsov, hardworking).
trait(grigory_kuznetsov, storyteller).
trait(grigory_kuznetsov, middle_aged).
attribute(grigory_kuznetsov, charisma, 65).
attribute(grigory_kuznetsov, cultural_knowledge, 75).
attribute(grigory_kuznetsov, propriety, 55).
language_proficiency(grigory_kuznetsov, russian, 92).
language_proficiency(grigory_kuznetsov, english, 10).

%% --- Irina Vladimirovna Kuznetsova ---
trait(irina_kuznetsova, female).
trait(irina_kuznetsova, resilient).
trait(irina_kuznetsova, resourceful).
trait(irina_kuznetsova, community_minded).
attribute(irina_kuznetsova, charisma, 60).
attribute(irina_kuznetsova, propriety, 65).
attribute(irina_kuznetsova, cultural_knowledge, 70).
relationship(irina_kuznetsova, grigory_kuznetsov, married).
language_proficiency(irina_kuznetsova, russian, 90).
language_proficiency(irina_kuznetsova, english, 5).

%% --- Maksim Grigoryevich Kuznetsov ---
trait(maksim_kuznetsov, male).
trait(maksim_kuznetsov, young).
trait(maksim_kuznetsov, restless).
trait(maksim_kuznetsov, ambitious).
attribute(maksim_kuznetsov, charisma, 60).
attribute(maksim_kuznetsov, self_assuredness, 50).
attribute(maksim_kuznetsov, cunningness, 40).
language_proficiency(maksim_kuznetsov, russian, 85).
language_proficiency(maksim_kuznetsov, english, 30).

%% --- Darya Grigoryevna Kuznetsova ---
trait(darya_kuznetsova, female).
trait(darya_kuznetsova, young).
trait(darya_kuznetsova, curious).
trait(darya_kuznetsova, cheerful).
attribute(darya_kuznetsova, charisma, 70).
attribute(darya_kuznetsova, sensitiveness, 60).
attribute(darya_kuznetsova, self_assuredness, 45).
language_proficiency(darya_kuznetsova, russian, 87).
language_proficiency(darya_kuznetsova, english, 35).

%% --- Pyotr Ilyich Morozov ---
trait(pyotr_morozov, male).
trait(pyotr_morozov, patient).
trait(pyotr_morozov, traditional).
trait(pyotr_morozov, proud).
trait(pyotr_morozov, elderly).
attribute(pyotr_morozov, charisma, 60).
attribute(pyotr_morozov, cultural_knowledge, 90).
attribute(pyotr_morozov, propriety, 70).
relationship(pyotr_morozov, grigory_kuznetsov, friends).
language_proficiency(pyotr_morozov, russian, 95).
language_proficiency(pyotr_morozov, english, 5).

%% --- Valentina Fyodorovna Morozova ---
trait(valentina_morozova, female).
trait(valentina_morozova, gentle).
trait(valentina_morozova, herbalist).
trait(valentina_morozova, observant).
attribute(valentina_morozova, charisma, 55).
attribute(valentina_morozova, cultural_knowledge, 85).
attribute(valentina_morozova, propriety, 70).
relationship(valentina_morozova, pyotr_morozov, married).
language_proficiency(valentina_morozova, russian, 93).
language_proficiency(valentina_morozova, english, 5).

%% --- Katya Petrovna Morozova ---
trait(katya_morozova, female).
trait(katya_morozova, young).
trait(katya_morozova, determined).
trait(katya_morozova, nature_loving).
attribute(katya_morozova, charisma, 55).
attribute(katya_morozova, self_assuredness, 60).
attribute(katya_morozova, sensitiveness, 65).
language_proficiency(katya_morozova, russian, 88).
language_proficiency(katya_morozova, english, 40).

%% --- Mikhail Petrovich Morozov ---
trait(mikhail_morozov, male).
trait(mikhail_morozov, young).
trait(mikhail_morozov, quiet).
trait(mikhail_morozov, dutiful).
attribute(mikhail_morozov, charisma, 45).
attribute(mikhail_morozov, propriety, 65).
attribute(mikhail_morozov, cultural_knowledge, 60).
language_proficiency(mikhail_morozov, russian, 87).
language_proficiency(mikhail_morozov, english, 25).
