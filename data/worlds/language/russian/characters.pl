%% Insimul Characters: Russian Volga Town
%% Source: data/worlds/language/russian/characters.pl
%% Created: 2026-04-03
%% Total: 24 characters (6 families)
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2

%% ================================================================
%% Volkov Family (Cafe Owners, Volzhansk)
%% ================================================================

%% Ivan Petrovich Volkov
person(ivan_volkov).
first_name(ivan_volkov, 'Ivan').
last_name(ivan_volkov, 'Volkov').
full_name(ivan_volkov, 'Ivan Petrovich Volkov').
gender(ivan_volkov, male).
alive(ivan_volkov).
generation(ivan_volkov, 0).
founder_family(ivan_volkov).
child(ivan_volkov, aleksei_volkov).
child(ivan_volkov, marina_volkova).
spouse(ivan_volkov, natalya_volkova).
location(ivan_volkov, volzhansk).

%% Natalya Sergeyevna Volkova
person(natalya_volkova).
first_name(natalya_volkova, 'Natalya').
last_name(natalya_volkova, 'Volkova').
full_name(natalya_volkova, 'Natalya Sergeyevna Volkova').
gender(natalya_volkova, female).
alive(natalya_volkova).
generation(natalya_volkova, 0).
founder_family(natalya_volkova).
child(natalya_volkova, aleksei_volkov).
child(natalya_volkova, marina_volkova).
spouse(natalya_volkova, ivan_volkov).
location(natalya_volkova, volzhansk).

%% Aleksei Ivanovich Volkov
person(aleksei_volkov).
first_name(aleksei_volkov, 'Aleksei').
last_name(aleksei_volkov, 'Volkov').
full_name(aleksei_volkov, 'Aleksei Ivanovich Volkov').
gender(aleksei_volkov, male).
alive(aleksei_volkov).
generation(aleksei_volkov, 1).
parent(ivan_volkov, aleksei_volkov).
parent(natalya_volkova, aleksei_volkov).
location(aleksei_volkov, volzhansk).

%% Marina Ivanovna Volkova
person(marina_volkova).
first_name(marina_volkova, 'Marina').
last_name(marina_volkova, 'Volkova').
full_name(marina_volkova, 'Marina Ivanovna Volkova').
gender(marina_volkova, female).
alive(marina_volkova).
generation(marina_volkova, 1).
parent(ivan_volkov, marina_volkova).
parent(natalya_volkova, marina_volkova).
location(marina_volkova, volzhansk).

%% ================================================================
%% Ivanov Family (University Professors, Volzhansk)
%% ================================================================

%% Dmitry Aleksandrovich Ivanov
person(dmitry_ivanov).
first_name(dmitry_ivanov, 'Dmitry').
last_name(dmitry_ivanov, 'Ivanov').
full_name(dmitry_ivanov, 'Dmitry Aleksandrovich Ivanov').
gender(dmitry_ivanov, male).
alive(dmitry_ivanov).
generation(dmitry_ivanov, 0).
founder_family(dmitry_ivanov).
child(dmitry_ivanov, yelena_ivanova).
child(dmitry_ivanov, andrei_ivanov).
spouse(dmitry_ivanov, olga_ivanova).
location(dmitry_ivanov, volzhansk).

%% Olga Nikolayevna Ivanova
person(olga_ivanova).
first_name(olga_ivanova, 'Olga').
last_name(olga_ivanova, 'Ivanova').
full_name(olga_ivanova, 'Olga Nikolayevna Ivanova').
gender(olga_ivanova, female).
alive(olga_ivanova).
generation(olga_ivanova, 0).
founder_family(olga_ivanova).
child(olga_ivanova, yelena_ivanova).
child(olga_ivanova, andrei_ivanov).
spouse(olga_ivanova, dmitry_ivanov).
location(olga_ivanova, volzhansk).

%% Yelena Dmitriyevna Ivanova
person(yelena_ivanova).
first_name(yelena_ivanova, 'Yelena').
last_name(yelena_ivanova, 'Ivanova').
full_name(yelena_ivanova, 'Yelena Dmitriyevna Ivanova').
gender(yelena_ivanova, female).
alive(yelena_ivanova).
generation(yelena_ivanova, 1).
parent(dmitry_ivanov, yelena_ivanova).
parent(olga_ivanova, yelena_ivanova).
location(yelena_ivanova, volzhansk).

%% Andrei Dmitriyevich Ivanov
person(andrei_ivanov).
first_name(andrei_ivanov, 'Andrei').
last_name(andrei_ivanov, 'Ivanov').
full_name(andrei_ivanov, 'Andrei Dmitriyevich Ivanov').
gender(andrei_ivanov, male).
alive(andrei_ivanov).
generation(andrei_ivanov, 1).
parent(dmitry_ivanov, andrei_ivanov).
parent(olga_ivanova, andrei_ivanov).
location(andrei_ivanov, volzhansk).

%% ================================================================
%% Petrov Family (Market Merchants, Volzhansk)
%% ================================================================

%% Nikolai Vasilyevich Petrov
person(nikolai_petrov).
first_name(nikolai_petrov, 'Nikolai').
last_name(nikolai_petrov, 'Petrov').
full_name(nikolai_petrov, 'Nikolai Vasilyevich Petrov').
gender(nikolai_petrov, male).
alive(nikolai_petrov).
generation(nikolai_petrov, 0).
founder_family(nikolai_petrov).
child(nikolai_petrov, tatyana_petrova).
child(nikolai_petrov, sergei_petrov).
spouse(nikolai_petrov, vera_petrova).
location(nikolai_petrov, volzhansk).

%% Vera Ivanovna Petrova
person(vera_petrova).
first_name(vera_petrova, 'Vera').
last_name(vera_petrova, 'Petrova').
full_name(vera_petrova, 'Vera Ivanovna Petrova').
gender(vera_petrova, female).
alive(vera_petrova).
generation(vera_petrova, 0).
founder_family(vera_petrova).
child(vera_petrova, tatyana_petrova).
child(vera_petrova, sergei_petrov).
spouse(vera_petrova, nikolai_petrov).
location(vera_petrova, volzhansk).

%% Tatyana Nikolayevna Petrova
person(tatyana_petrova).
first_name(tatyana_petrova, 'Tatyana').
last_name(tatyana_petrova, 'Petrova').
full_name(tatyana_petrova, 'Tatyana Nikolayevna Petrova').
gender(tatyana_petrova, female).
alive(tatyana_petrova).
generation(tatyana_petrova, 1).
parent(nikolai_petrov, tatyana_petrova).
parent(vera_petrova, tatyana_petrova).
location(tatyana_petrova, volzhansk).

%% Sergei Nikolayevich Petrov
person(sergei_petrov).
first_name(sergei_petrov, 'Sergei').
last_name(sergei_petrov, 'Petrov').
full_name(sergei_petrov, 'Sergei Nikolayevich Petrov').
gender(sergei_petrov, male).
alive(sergei_petrov).
generation(sergei_petrov, 1).
parent(nikolai_petrov, sergei_petrov).
parent(vera_petrova, sergei_petrov).
location(sergei_petrov, volzhansk).

%% ================================================================
%% Sokolova Family (Doctors, Volzhansk)
%% ================================================================

%% Viktor Mikhailovich Sokolov
person(viktor_sokolov).
first_name(viktor_sokolov, 'Viktor').
last_name(viktor_sokolov, 'Sokolov').
full_name(viktor_sokolov, 'Viktor Mikhailovich Sokolov').
gender(viktor_sokolov, male).
alive(viktor_sokolov).
generation(viktor_sokolov, 0).
founder_family(viktor_sokolov).
child(viktor_sokolov, pavel_sokolov).
child(viktor_sokolov, anna_sokolova).
spouse(viktor_sokolov, lyudmila_sokolova).
location(viktor_sokolov, volzhansk).

%% Lyudmila Borisovna Sokolova
person(lyudmila_sokolova).
first_name(lyudmila_sokolova, 'Lyudmila').
last_name(lyudmila_sokolova, 'Sokolova').
full_name(lyudmila_sokolova, 'Lyudmila Borisovna Sokolova').
gender(lyudmila_sokolova, female).
alive(lyudmila_sokolova).
generation(lyudmila_sokolova, 0).
founder_family(lyudmila_sokolova).
child(lyudmila_sokolova, pavel_sokolov).
child(lyudmila_sokolova, anna_sokolova).
spouse(lyudmila_sokolova, viktor_sokolov).
location(lyudmila_sokolova, volzhansk).

%% Pavel Viktorovich Sokolov
person(pavel_sokolov).
first_name(pavel_sokolov, 'Pavel').
last_name(pavel_sokolov, 'Sokolov').
full_name(pavel_sokolov, 'Pavel Viktorovich Sokolov').
gender(pavel_sokolov, male).
alive(pavel_sokolov).
generation(pavel_sokolov, 1).
parent(viktor_sokolov, pavel_sokolov).
parent(lyudmila_sokolova, pavel_sokolov).
location(pavel_sokolov, volzhansk).

%% Anna Viktorovna Sokolova
person(anna_sokolova).
first_name(anna_sokolova, 'Anna').
last_name(anna_sokolova, 'Sokolova').
full_name(anna_sokolova, 'Anna Viktorovna Sokolova').
gender(anna_sokolova, female).
alive(anna_sokolova).
generation(anna_sokolova, 1).
parent(viktor_sokolov, anna_sokolova).
parent(lyudmila_sokolova, anna_sokolova).
location(anna_sokolova, volzhansk).

%% ================================================================
%% Kuznetsov Family (Fishermen, Rybachye)
%% ================================================================

%% Grigory Pavlovich Kuznetsov
person(grigory_kuznetsov).
first_name(grigory_kuznetsov, 'Grigory').
last_name(grigory_kuznetsov, 'Kuznetsov').
full_name(grigory_kuznetsov, 'Grigory Pavlovich Kuznetsov').
gender(grigory_kuznetsov, male).
alive(grigory_kuznetsov).
generation(grigory_kuznetsov, 0).
founder_family(grigory_kuznetsov).
child(grigory_kuznetsov, maksim_kuznetsov).
child(grigory_kuznetsov, darya_kuznetsova).
spouse(grigory_kuznetsov, irina_kuznetsova).
location(grigory_kuznetsov, rybachye).

%% Irina Vladimirovna Kuznetsova
person(irina_kuznetsova).
first_name(irina_kuznetsova, 'Irina').
last_name(irina_kuznetsova, 'Kuznetsova').
full_name(irina_kuznetsova, 'Irina Vladimirovna Kuznetsova').
gender(irina_kuznetsova, female).
alive(irina_kuznetsova).
generation(irina_kuznetsova, 0).
founder_family(irina_kuznetsova).
child(irina_kuznetsova, maksim_kuznetsov).
child(irina_kuznetsova, darya_kuznetsova).
spouse(irina_kuznetsova, grigory_kuznetsov).
location(irina_kuznetsova, rybachye).

%% Maksim Grigoryevich Kuznetsov
person(maksim_kuznetsov).
first_name(maksim_kuznetsov, 'Maksim').
last_name(maksim_kuznetsov, 'Kuznetsov').
full_name(maksim_kuznetsov, 'Maksim Grigoryevich Kuznetsov').
gender(maksim_kuznetsov, male).
alive(maksim_kuznetsov).
generation(maksim_kuznetsov, 1).
parent(grigory_kuznetsov, maksim_kuznetsov).
parent(irina_kuznetsova, maksim_kuznetsov).
location(maksim_kuznetsov, rybachye).

%% Darya Grigoryevna Kuznetsova
person(darya_kuznetsova).
first_name(darya_kuznetsova, 'Darya').
last_name(darya_kuznetsova, 'Kuznetsova').
full_name(darya_kuznetsova, 'Darya Grigoryevna Kuznetsova').
gender(darya_kuznetsova, female).
alive(darya_kuznetsova).
generation(darya_kuznetsova, 1).
parent(grigory_kuznetsov, darya_kuznetsova).
parent(irina_kuznetsova, darya_kuznetsova).
location(darya_kuznetsova, rybachye).

%% ================================================================
%% Morozov Family (Retired Teacher and Beekeeper, Rybachye)
%% ================================================================

%% Pyotr Ilyich Morozov
person(pyotr_morozov).
first_name(pyotr_morozov, 'Pyotr').
last_name(pyotr_morozov, 'Morozov').
full_name(pyotr_morozov, 'Pyotr Ilyich Morozov').
gender(pyotr_morozov, male).
alive(pyotr_morozov).
generation(pyotr_morozov, 0).
founder_family(pyotr_morozov).
child(pyotr_morozov, katya_morozova).
child(pyotr_morozov, mikhail_morozov).
spouse(pyotr_morozov, valentina_morozova).
location(pyotr_morozov, rybachye).

%% Valentina Fyodorovna Morozova
person(valentina_morozova).
first_name(valentina_morozova, 'Valentina').
last_name(valentina_morozova, 'Morozova').
full_name(valentina_morozova, 'Valentina Fyodorovna Morozova').
gender(valentina_morozova, female).
alive(valentina_morozova).
generation(valentina_morozova, 0).
founder_family(valentina_morozova).
child(valentina_morozova, katya_morozova).
child(valentina_morozova, mikhail_morozov).
spouse(valentina_morozova, pyotr_morozov).
location(valentina_morozova, rybachye).

%% Katya Petrovna Morozova
person(katya_morozova).
first_name(katya_morozova, 'Katya').
last_name(katya_morozova, 'Morozova').
full_name(katya_morozova, 'Katya Petrovna Morozova').
gender(katya_morozova, female).
alive(katya_morozova).
generation(katya_morozova, 1).
parent(pyotr_morozov, katya_morozova).
parent(valentina_morozova, katya_morozova).
location(katya_morozova, rybachye).

%% Mikhail Petrovich Morozov
person(mikhail_morozov).
first_name(mikhail_morozov, 'Mikhail').
last_name(mikhail_morozov, 'Morozov').
full_name(mikhail_morozov, 'Mikhail Petrovich Morozov').
gender(mikhail_morozov, male).
alive(mikhail_morozov).
generation(mikhail_morozov, 1).
parent(pyotr_morozov, mikhail_morozov).
parent(valentina_morozova, mikhail_morozov).
location(mikhail_morozov, rybachye).
