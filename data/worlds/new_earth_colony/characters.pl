%% Insimul Characters: New Earth Colony
%% Source: data/insimul/scifi/scifi.insimul
%% Converted: 2026-04-02T22:06:25.800Z

%% Jane Shepard
person(admiral_shepard).
first_name(admiral_shepard, 'Jane').
last_name(admiral_shepard, 'Shepard').
full_name(admiral_shepard, 'Jane Shepard').
gender(admiral_shepard, female).
birth_year(admiral_shepard, 2300).
alive(admiral_shepard).
occupation(admiral_shepard, admiral).
at_location(admiral_shepard, nova_city).

%% Gordon Freeman
person(scientist_freeman).
first_name(scientist_freeman, 'Gordon').
last_name(scientist_freeman, 'Freeman').
full_name(scientist_freeman, 'Gordon Freeman').
gender(scientist_freeman, male).
birth_year(scientist_freeman, 2305).
alive(scientist_freeman).
occupation(scientist_freeman, scientist).
at_location(scientist_freeman, nova_city).

%% Cortana AI-7
person(ai_cortana).
first_name(ai_cortana, 'Cortana').
last_name(ai_cortana, 'AI-7').
full_name(ai_cortana, 'Cortana AI-7').
gender(ai_cortana, female).
birth_year(ai_cortana, 2335).
alive(ai_cortana).
occupation(ai_cortana, ai_researcher).
at_location(ai_cortana, nova_city).

%% Sarah McCall
person(pilot_mccall).
first_name(pilot_mccall, 'Sarah').
last_name(pilot_mccall, 'McCall').
full_name(pilot_mccall, 'Sarah McCall').
gender(pilot_mccall, female).
birth_year(pilot_mccall, 2310).
alive(pilot_mccall).
occupation(pilot_mccall, pilot).
at_location(pilot_mccall, olympus_station).

%% Raj Patel
person(engineer_patel).
first_name(engineer_patel, 'Raj').
last_name(engineer_patel, 'Patel').
full_name(engineer_patel, 'Raj Patel').
gender(engineer_patel, male).
birth_year(engineer_patel, 2308).
alive(engineer_patel).
occupation(engineer_patel, engineer).
at_location(engineer_patel, olympus_station).

%% ═══ Relationships ═══
relationship(admiral_shepard, scientist_freeman, friends).
relationship(scientist_freeman, admiral_shepard, friends).
relationship(admiral_shepard, ai_cortana, friends).
relationship(ai_cortana, admiral_shepard, friends).
relationship(pilot_mccall, engineer_patel, friends).
relationship(engineer_patel, pilot_mccall, friends).

