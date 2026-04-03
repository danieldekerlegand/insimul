%% Insimul Characters: Modern Metropolitan
%% Source: data/insimul/modern/modern.insimul
%% Converted: 2026-04-02T22:06:25.800Z

%% Sarah Johnson
person(mayor_johnson).
first_name(mayor_johnson, 'Sarah').
last_name(mayor_johnson, 'Johnson').
full_name(mayor_johnson, 'Sarah Johnson').
gender(mayor_johnson, female).
birth_year(mayor_johnson, 1975).
alive(mayor_johnson).
occupation(mayor_johnson, mayor).
at_location(mayor_johnson, metro_city).

%% David Chen
person(tech_ceo).
first_name(tech_ceo, 'David').
last_name(tech_ceo, 'Chen').
full_name(tech_ceo, 'David Chen').
gender(tech_ceo, male).
birth_year(tech_ceo, 1985).
alive(tech_ceo).
occupation(tech_ceo, ceo).
at_location(tech_ceo, metro_city).

%% Priya Patel
person(doctor_patel).
first_name(doctor_patel, 'Priya').
last_name(doctor_patel, 'Patel').
full_name(doctor_patel, 'Priya Patel').
gender(doctor_patel, female).
birth_year(doctor_patel, 1988).
alive(doctor_patel).
occupation(doctor_patel, doctor).
at_location(doctor_patel, metro_city).

%% Michael Smith
person(teacher_smith).
first_name(teacher_smith, 'Michael').
last_name(teacher_smith, 'Smith').
full_name(teacher_smith, 'Michael Smith').
gender(teacher_smith, male).
birth_year(teacher_smith, 1990).
alive(teacher_smith).
occupation(teacher_smith, teacher).
at_location(teacher_smith, metro_city).

%% Maria Rodriguez
person(artist_rodriguez).
first_name(artist_rodriguez, 'Maria').
last_name(artist_rodriguez, 'Rodriguez').
full_name(artist_rodriguez, 'Maria Rodriguez').
gender(artist_rodriguez, female).
birth_year(artist_rodriguez, 1995).
alive(artist_rodriguez).
occupation(artist_rodriguez, artist).
at_location(artist_rodriguez, metro_city).

%% ═══ Relationships ═══
relationship(doctor_patel, teacher_smith, friends).
relationship(teacher_smith, doctor_patel, friends).

