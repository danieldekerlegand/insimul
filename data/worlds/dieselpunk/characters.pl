%% Insimul Characters: Dieselpunk
%% Source: data/worlds/dieselpunk/characters.pl
%% Created: 2026-04-03
%% Total: 18 characters (4 families + 2 independents)
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2

%% ═══════════════════════════════════════════════════════════
%% Krause Family (Munitions Factory Owners, Ironhaven)
%% ═══════════════════════════════════════════════════════════

%% Heinrich Krause — War profiteer, factory magnate
person(heinrich_krause).
first_name(heinrich_krause, 'Heinrich').
last_name(heinrich_krause, 'Krause').
full_name(heinrich_krause, 'Heinrich Krause').
gender(heinrich_krause, male).
alive(heinrich_krause).
generation(heinrich_krause, 0).
founder_family(heinrich_krause).
child(heinrich_krause, elsa_krause).
child(heinrich_krause, konrad_krause).
spouse(heinrich_krause, margot_krause).
location(heinrich_krause, ironhaven).

%% Margot Krause — Society wife with hidden sympathies
person(margot_krause).
first_name(margot_krause, 'Margot').
last_name(margot_krause, 'Krause').
full_name(margot_krause, 'Margot Krause').
gender(margot_krause, female).
alive(margot_krause).
generation(margot_krause, 0).
founder_family(margot_krause).
child(margot_krause, elsa_krause).
child(margot_krause, konrad_krause).
spouse(margot_krause, heinrich_krause).
location(margot_krause, ironhaven).

%% Elsa Krause — Pilot and rebel, estranged from her father
person(elsa_krause).
first_name(elsa_krause, 'Elsa').
last_name(elsa_krause, 'Krause').
full_name(elsa_krause, 'Elsa Krause').
gender(elsa_krause, female).
alive(elsa_krause).
generation(elsa_krause, 1).
parent(heinrich_krause, elsa_krause).
parent(margot_krause, elsa_krause).
location(elsa_krause, ironhaven).

%% Konrad Krause — Loyal son, junior officer
person(konrad_krause).
first_name(konrad_krause, 'Konrad').
last_name(konrad_krause, 'Konrad').
full_name(konrad_krause, 'Konrad Krause').
gender(konrad_krause, male).
alive(konrad_krause).
generation(konrad_krause, 1).
parent(heinrich_krause, konrad_krause).
parent(margot_krause, konrad_krause).
location(konrad_krause, ironhaven).

%% ═══════════════════════════════════════════════════════════
%% Volkov Family (Resistance Leaders, The Underbelly)
%% ═══════════════════════════════════════════════════════════

%% Dimitri Volkov — Resistance cell leader
person(dimitri_volkov).
first_name(dimitri_volkov, 'Dimitri').
last_name(dimitri_volkov, 'Volkov').
full_name(dimitri_volkov, 'Dimitri Volkov').
gender(dimitri_volkov, male).
alive(dimitri_volkov).
generation(dimitri_volkov, 0).
founder_family(dimitri_volkov).
child(dimitri_volkov, katya_volkov).
spouse(dimitri_volkov, irina_volkov).
location(dimitri_volkov, ironhaven).

%% Irina Volkov — Former journalist, underground propagandist
person(irina_volkov).
first_name(irina_volkov, 'Irina').
last_name(irina_volkov, 'Volkov').
full_name(irina_volkov, 'Irina Volkov').
gender(irina_volkov, female).
alive(irina_volkov).
generation(irina_volkov, 0).
founder_family(irina_volkov).
child(irina_volkov, katya_volkov).
spouse(irina_volkov, dimitri_volkov).
location(irina_volkov, ironhaven).

%% Katya Volkov — Young courier for the resistance
person(katya_volkov).
first_name(katya_volkov, 'Katya').
last_name(katya_volkov, 'Volkov').
full_name(katya_volkov, 'Katya Volkov').
gender(katya_volkov, female).
alive(katya_volkov).
generation(katya_volkov, 1).
parent(dimitri_volkov, katya_volkov).
parent(irina_volkov, katya_volkov).
location(katya_volkov, ironhaven).

%% ═══════════════════════════════════════════════════════════
%% Gruber Family (Diesel Engineers, Factory Row)
%% ═══════════════════════════════════════════════════════════

%% Otto Gruber — Master diesel mechanic
person(otto_gruber).
first_name(otto_gruber, 'Otto').
last_name(otto_gruber, 'Gruber').
full_name(otto_gruber, 'Otto Gruber').
gender(otto_gruber, male).
alive(otto_gruber).
generation(otto_gruber, 0).
founder_family(otto_gruber).
child(otto_gruber, fritz_gruber).
child(otto_gruber, hilde_gruber).
spouse(otto_gruber, anna_gruber).
location(otto_gruber, ironhaven).

%% Anna Gruber — Factory floor supervisor
person(anna_gruber).
first_name(anna_gruber, 'Anna').
last_name(anna_gruber, 'Gruber').
full_name(anna_gruber, 'Anna Gruber').
gender(anna_gruber, female).
alive(anna_gruber).
generation(anna_gruber, 0).
founder_family(anna_gruber).
child(anna_gruber, fritz_gruber).
child(anna_gruber, hilde_gruber).
spouse(anna_gruber, otto_gruber).
location(anna_gruber, ironhaven).

%% Fritz Gruber — Apprentice mechanic and union sympathizer
person(fritz_gruber).
first_name(fritz_gruber, 'Fritz').
last_name(fritz_gruber, 'Gruber').
full_name(fritz_gruber, 'Fritz Gruber').
gender(fritz_gruber, male).
alive(fritz_gruber).
generation(fritz_gruber, 1).
parent(otto_gruber, fritz_gruber).
parent(anna_gruber, fritz_gruber).
location(fritz_gruber, ironhaven).

%% Hilde Gruber — Aspiring airship navigator
person(hilde_gruber).
first_name(hilde_gruber, 'Hilde').
last_name(hilde_gruber, 'Gruber').
full_name(hilde_gruber, 'Hilde Gruber').
gender(hilde_gruber, female).
alive(hilde_gruber).
generation(hilde_gruber, 1).
parent(otto_gruber, hilde_gruber).
parent(anna_gruber, hilde_gruber).
location(hilde_gruber, ironhaven).

%% ═══════════════════════════════════════════════════════════
%% Ashworth Family (Refinery Operators, Ashford Junction)
%% ═══════════════════════════════════════════════════════════

%% Thomas Ashworth — Refinery foreman
person(thomas_ashworth).
first_name(thomas_ashworth, 'Thomas').
last_name(thomas_ashworth, 'Ashworth').
full_name(thomas_ashworth, 'Thomas Ashworth').
gender(thomas_ashworth, male).
alive(thomas_ashworth).
generation(thomas_ashworth, 0).
founder_family(thomas_ashworth).
child(thomas_ashworth, jack_ashworth).
child(thomas_ashworth, ruth_ashworth).
spouse(thomas_ashworth, dorothy_ashworth).
location(thomas_ashworth, ashford_junction).

%% Dorothy Ashworth — Tavern keeper
person(dorothy_ashworth).
first_name(dorothy_ashworth, 'Dorothy').
last_name(dorothy_ashworth, 'Ashworth').
full_name(dorothy_ashworth, 'Dorothy Ashworth').
gender(dorothy_ashworth, female).
alive(dorothy_ashworth).
generation(dorothy_ashworth, 0).
founder_family(dorothy_ashworth).
child(dorothy_ashworth, jack_ashworth).
child(dorothy_ashworth, ruth_ashworth).
spouse(dorothy_ashworth, thomas_ashworth).
location(dorothy_ashworth, ashford_junction).

%% Jack Ashworth — Railway worker, secret resistance contact
person(jack_ashworth).
first_name(jack_ashworth, 'Jack').
last_name(jack_ashworth, 'Ashworth').
full_name(jack_ashworth, 'Jack Ashworth').
gender(jack_ashworth, male).
alive(jack_ashworth).
generation(jack_ashworth, 1).
parent(thomas_ashworth, jack_ashworth).
parent(dorothy_ashworth, jack_ashworth).
location(jack_ashworth, ashford_junction).

%% Ruth Ashworth — Nurse at the refinery clinic
person(ruth_ashworth).
first_name(ruth_ashworth, 'Ruth').
last_name(ruth_ashworth, 'Ashworth').
full_name(ruth_ashworth, 'Ruth Ashworth').
gender(ruth_ashworth, female).
alive(ruth_ashworth).
generation(ruth_ashworth, 1).
parent(thomas_ashworth, ruth_ashworth).
parent(dorothy_ashworth, ruth_ashworth).
location(ruth_ashworth, ashford_junction).

%% ═══════════════════════════════════════════════════════════
%% Independent Characters
%% ═══════════════════════════════════════════════════════════

%% Colonel Viktor Stahl — Military governor, ruthless tactician
person(viktor_stahl).
first_name(viktor_stahl, 'Viktor').
last_name(viktor_stahl, 'Stahl').
full_name(viktor_stahl, 'Colonel Viktor Stahl').
gender(viktor_stahl, male).
alive(viktor_stahl).
generation(viktor_stahl, 0).
location(viktor_stahl, ironhaven).

%% Mara Chen — Smuggler captain, freelance airship pilot
person(mara_chen).
first_name(mara_chen, 'Mara').
last_name(mara_chen, 'Chen').
full_name(mara_chen, 'Mara Chen').
gender(mara_chen, female).
alive(mara_chen).
generation(mara_chen, 0).
location(mara_chen, ironhaven).
