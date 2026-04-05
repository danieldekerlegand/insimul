%% Insimul World: Hindi Town
%% Source: data/worlds/language/hindi/world.pl
%% Created: 2026-04-03

world(hindi_town, 'Hindi Town').
world_description(hindi_town, 'A contemporary North Indian town with bustling bazaars, ornate temples, chai stalls, modern IT offices, Bollywood cinema halls, and auto-rickshaws weaving through vibrant streets').
world_type(hindi_town, modern_realistic).
game_type(hindi_town, language_learning).
target_language(hindi_town, hindi).
camera_perspective(hindi_town, third_person).
timestep_unit(hindi_town, year).
gameplay_timestep_unit(hindi_town, day).
character_creation_mode(hindi_town, fixed).
world_language(hindi_town, hindi).
learning_target_language(hindi_town, hindi).

%% Country
country(republic_of_india, 'Republic of India', hindi_town).
country_description(republic_of_india, 'The Republic of India, the world''s most populous democracy, known for its rich cultural heritage, linguistic diversity, technological innovation, and vibrant traditions spanning thousands of years.').
government_type(republic_of_india, republic).
economic_system(republic_of_india, mixed).
country_founded(republic_of_india, 1947).
country_active(republic_of_india).

%% State
state(uttar_pradesh, 'Uttar Pradesh', republic_of_india).
state_type(uttar_pradesh, state).
