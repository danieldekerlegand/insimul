%% Insimul World: Arabic Coastal Town
%% Source: data/worlds/language/arabic/world.pl
%% Created: 2026-04-03

world(arabic_town, 'Arabic Town').
world_description(arabic_town, 'A contemporary Arab coastal town with a sun-warmed medina, modern cafes, a university district, and a bustling corniche promenade').
world_type(arabic_town, modern_realistic).
game_type(arabic_town, language_learning).
target_language(arabic_town, arabic).
camera_perspective(arabic_town, third_person).
timestep_unit(arabic_town, year).
gameplay_timestep_unit(arabic_town, day).
character_creation_mode(arabic_town, fixed).
world_language(arabic_town, arabic).
learning_target_language(arabic_town, arabic).

%% Country
country(arab_coastal_republic, 'Arab Coastal Republic', arabic_town).
country_description(arab_coastal_republic, 'A modern Arab republic on the Mediterranean coast, known for its blend of traditional culture and contemporary life, thriving universities, and vibrant market economy.').
government_type(arab_coastal_republic, republic).
economic_system(arab_coastal_republic, market).
country_founded(arab_coastal_republic, 1950).
country_active(arab_coastal_republic).

%% State
state(coastal_province, 'Coastal Province', arab_coastal_republic).
state_type(coastal_province, province).
