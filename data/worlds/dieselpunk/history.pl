%% Ensemble History: Dieselpunk Ironhaven — Initial World State
%% Source: data/worlds/dieselpunk/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status, network

%% ─── Heinrich Krause ───
trait(heinrich_krause, male).
trait(heinrich_krause, ruthless).
trait(heinrich_krause, calculating).
trait(heinrich_krause, ambitious).
trait(heinrich_krause, middle_aged).
attribute(heinrich_krause, charisma, 70).
attribute(heinrich_krause, cunningness, 85).
attribute(heinrich_krause, self_assuredness, 90).
attribute(heinrich_krause, wealth, 95).
status(heinrich_krause, factory_owner).
status(heinrich_krause, war_profiteer).
network(heinrich_krause, viktor_stahl, trust, 7).
network(heinrich_krause, dimitri_volkov, antagonism, 8).
network(heinrich_krause, otto_gruber, dominance, 7).

%% ─── Margot Krause ───
trait(margot_krause, female).
trait(margot_krause, perceptive).
trait(margot_krause, diplomatic).
trait(margot_krause, conflicted).
trait(margot_krause, middle_aged).
attribute(margot_krause, charisma, 80).
attribute(margot_krause, cunningness, 65).
attribute(margot_krause, propriety, 85).
status(margot_krause, society_wife).
relationship(margot_krause, heinrich_krause, married).
network(margot_krause, heinrich_krause, trust, 4).
network(margot_krause, irina_volkov, friendship, 3).

%% ─── Elsa Krause ───
trait(elsa_krause, female).
trait(elsa_krause, young).
trait(elsa_krause, defiant).
trait(elsa_krause, courageous).
trait(elsa_krause, skilled_pilot).
attribute(elsa_krause, charisma, 65).
attribute(elsa_krause, self_assuredness, 75).
attribute(elsa_krause, cunningness, 60).
status(elsa_krause, pilot).
status(elsa_krause, estranged).
network(elsa_krause, heinrich_krause, antagonism, 7).
network(elsa_krause, mara_chen, friendship, 6).
network(elsa_krause, dimitri_volkov, trust, 5).

%% ─── Konrad Krause ───
trait(konrad_krause, male).
trait(konrad_krause, young).
trait(konrad_krause, obedient).
trait(konrad_krause, disciplined).
trait(konrad_krause, conflicted).
attribute(konrad_krause, charisma, 55).
attribute(konrad_krause, self_assuredness, 50).
attribute(konrad_krause, propriety, 70).
status(konrad_krause, junior_officer).
network(konrad_krause, heinrich_krause, trust, 7).
network(konrad_krause, viktor_stahl, respect, 8).
network(konrad_krause, elsa_krause, friendship, 4).

%% ─── Dimitri Volkov ───
trait(dimitri_volkov, male).
trait(dimitri_volkov, resolute).
trait(dimitri_volkov, charismatic).
trait(dimitri_volkov, strategic).
trait(dimitri_volkov, middle_aged).
attribute(dimitri_volkov, charisma, 80).
attribute(dimitri_volkov, cunningness, 75).
attribute(dimitri_volkov, self_assuredness, 70).
status(dimitri_volkov, resistance_leader).
network(dimitri_volkov, heinrich_krause, antagonism, 9).
network(dimitri_volkov, viktor_stahl, antagonism, 9).
network(dimitri_volkov, jack_ashworth, trust, 6).

%% ─── Irina Volkov ───
trait(irina_volkov, female).
trait(irina_volkov, articulate).
trait(irina_volkov, brave).
trait(irina_volkov, resourceful).
trait(irina_volkov, middle_aged).
attribute(irina_volkov, charisma, 75).
attribute(irina_volkov, cunningness, 70).
attribute(irina_volkov, self_assuredness, 65).
status(irina_volkov, propagandist).
relationship(irina_volkov, dimitri_volkov, married).
network(irina_volkov, margot_krause, friendship, 3).
network(irina_volkov, fritz_gruber, trust, 5).

%% ─── Katya Volkov ───
trait(katya_volkov, female).
trait(katya_volkov, young).
trait(katya_volkov, quick_witted).
trait(katya_volkov, fearless).
trait(katya_volkov, idealistic).
attribute(katya_volkov, charisma, 60).
attribute(katya_volkov, cunningness, 65).
attribute(katya_volkov, self_assuredness, 55).
status(katya_volkov, courier).
network(katya_volkov, dimitri_volkov, trust, 9).
network(katya_volkov, irina_volkov, trust, 9).

%% ─── Otto Gruber ───
trait(otto_gruber, male).
trait(otto_gruber, pragmatic).
trait(otto_gruber, skilled).
trait(otto_gruber, weary).
trait(otto_gruber, middle_aged).
attribute(otto_gruber, charisma, 55).
attribute(otto_gruber, cunningness, 45).
attribute(otto_gruber, self_assuredness, 60).
attribute(otto_gruber, technical_skill, 90).
status(otto_gruber, master_mechanic).
network(otto_gruber, heinrich_krause, respect, 3).
network(otto_gruber, anna_gruber, trust, 8).

%% ─── Anna Gruber ───
trait(anna_gruber, female).
trait(anna_gruber, determined).
trait(anna_gruber, organized).
trait(anna_gruber, protective).
trait(anna_gruber, middle_aged).
attribute(anna_gruber, charisma, 65).
attribute(anna_gruber, cunningness, 55).
attribute(anna_gruber, self_assuredness, 70).
status(anna_gruber, factory_supervisor).
relationship(anna_gruber, otto_gruber, married).
network(anna_gruber, fritz_gruber, trust, 8).

%% ─── Fritz Gruber ───
trait(fritz_gruber, male).
trait(fritz_gruber, young).
trait(fritz_gruber, passionate).
trait(fritz_gruber, rebellious).
trait(fritz_gruber, hot_headed).
attribute(fritz_gruber, charisma, 60).
attribute(fritz_gruber, cunningness, 40).
attribute(fritz_gruber, self_assuredness, 55).
status(fritz_gruber, apprentice_mechanic).
status(fritz_gruber, union_sympathizer).
network(fritz_gruber, otto_gruber, respect, 7).
network(fritz_gruber, irina_volkov, trust, 5).
network(fritz_gruber, dimitri_volkov, friendship, 4).

%% ─── Hilde Gruber ───
trait(hilde_gruber, female).
trait(hilde_gruber, young).
trait(hilde_gruber, curious).
trait(hilde_gruber, adventurous).
trait(hilde_gruber, optimistic).
attribute(hilde_gruber, charisma, 65).
attribute(hilde_gruber, cunningness, 50).
attribute(hilde_gruber, self_assuredness, 60).
status(hilde_gruber, aspiring_navigator).
network(hilde_gruber, elsa_krause, friendship, 5).
network(hilde_gruber, mara_chen, respect, 6).

%% ─── Thomas Ashworth ───
trait(thomas_ashworth, male).
trait(thomas_ashworth, stoic).
trait(thomas_ashworth, hardworking).
trait(thomas_ashworth, cautious).
trait(thomas_ashworth, middle_aged).
attribute(thomas_ashworth, charisma, 50).
attribute(thomas_ashworth, cunningness, 40).
attribute(thomas_ashworth, self_assuredness, 55).
status(thomas_ashworth, refinery_foreman).
network(thomas_ashworth, heinrich_krause, respect, 4).
network(thomas_ashworth, jack_ashworth, trust, 7).

%% ─── Dorothy Ashworth ───
trait(dorothy_ashworth, female).
trait(dorothy_ashworth, warm).
trait(dorothy_ashworth, shrewd).
trait(dorothy_ashworth, observant).
trait(dorothy_ashworth, middle_aged).
attribute(dorothy_ashworth, charisma, 75).
attribute(dorothy_ashworth, cunningness, 60).
attribute(dorothy_ashworth, self_assuredness, 65).
status(dorothy_ashworth, tavern_keeper).
relationship(dorothy_ashworth, thomas_ashworth, married).
network(dorothy_ashworth, mara_chen, friendship, 4).

%% ─── Jack Ashworth ───
trait(jack_ashworth, male).
trait(jack_ashworth, young).
trait(jack_ashworth, loyal).
trait(jack_ashworth, resourceful).
trait(jack_ashworth, secretive).
attribute(jack_ashworth, charisma, 55).
attribute(jack_ashworth, cunningness, 65).
attribute(jack_ashworth, self_assuredness, 50).
status(jack_ashworth, railway_worker).
status(jack_ashworth, resistance_contact).
network(jack_ashworth, dimitri_volkov, trust, 6).
network(jack_ashworth, thomas_ashworth, trust, 5).

%% ─── Ruth Ashworth ───
trait(ruth_ashworth, female).
trait(ruth_ashworth, young).
trait(ruth_ashworth, compassionate).
trait(ruth_ashworth, diligent).
trait(ruth_ashworth, principled).
attribute(ruth_ashworth, charisma, 60).
attribute(ruth_ashworth, cunningness, 35).
attribute(ruth_ashworth, self_assuredness, 55).
status(ruth_ashworth, nurse).
network(ruth_ashworth, anna_gruber, friendship, 5).
network(ruth_ashworth, katya_volkov, friendship, 3).

%% ─── Colonel Viktor Stahl ───
trait(viktor_stahl, male).
trait(viktor_stahl, authoritarian).
trait(viktor_stahl, ruthless).
trait(viktor_stahl, strategic).
trait(viktor_stahl, middle_aged).
attribute(viktor_stahl, charisma, 70).
attribute(viktor_stahl, cunningness, 80).
attribute(viktor_stahl, self_assuredness, 90).
attribute(viktor_stahl, military_command, 85).
status(viktor_stahl, military_governor).
network(viktor_stahl, heinrich_krause, trust, 6).
network(viktor_stahl, dimitri_volkov, antagonism, 9).
network(viktor_stahl, konrad_krause, dominance, 7).

%% ─── Mara Chen ───
trait(mara_chen, female).
trait(mara_chen, independent).
trait(mara_chen, daring).
trait(mara_chen, opportunistic).
trait(mara_chen, worldly).
attribute(mara_chen, charisma, 75).
attribute(mara_chen, cunningness, 80).
attribute(mara_chen, self_assuredness, 75).
status(mara_chen, smuggler_captain).
status(mara_chen, freelance_pilot).
network(mara_chen, elsa_krause, friendship, 6).
network(mara_chen, dorothy_ashworth, friendship, 4).
network(mara_chen, viktor_stahl, antagonism, 5).
