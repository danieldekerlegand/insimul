%% Insimul World: Indonesian Coastal Town
%% Source: data/worlds/language/indonesian/world.pl
%% Created: 2026-04-03

world(indonesian_coast, 'Indonesian Coast').
world_description(indonesian_coast, 'A contemporary Javanese coastal town with bustling warungs, batik workshops, modern markets, mosques, gamelan halls, terraced rice paddies, and a busy fishing harbor').
world_type(indonesian_coast, modern_realistic).
game_type(indonesian_coast, language_learning).
target_language(indonesian_coast, indonesian).
camera_perspective(indonesian_coast, third_person).
timestep_unit(indonesian_coast, year).
gameplay_timestep_unit(indonesian_coast, day).
character_creation_mode(indonesian_coast, fixed).
world_language(indonesian_coast, indonesian).
learning_target_language(indonesian_coast, indonesian).

%% Country
country(republic_of_indonesia, 'Republic of Indonesia', indonesian_coast).
country_description(republic_of_indonesia, 'The world''s largest archipelago nation, spanning over 17,000 islands with extraordinary linguistic and cultural diversity. United by Bahasa Indonesia as its lingua franca, it blends Javanese, Sundanese, Malay, and hundreds of other traditions into a modern republic.').
government_type(republic_of_indonesia, republic).
economic_system(republic_of_indonesia, market).
country_founded(republic_of_indonesia, 1945).
country_active(republic_of_indonesia).

%% State
state(java, 'Java', republic_of_indonesia).
state_type(java, province).
