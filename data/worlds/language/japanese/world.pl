%% Insimul World: Japanese Town
%% Source: data/worlds/language/japanese/world.pl
%% Created: 2026-04-03

world(japanese_town, 'Japanese Town').
world_description(japanese_town, 'A contemporary Japanese town in the Kansai region with train stations, konbini convenience stores, izakayas, temple gardens, modern offices, shotengai arcades, and seasonal festivals').
world_type(japanese_town, modern_realistic).
game_type(japanese_town, language_learning).
target_language(japanese_town, japanese).
camera_perspective(japanese_town, third_person).
timestep_unit(japanese_town, year).
gameplay_timestep_unit(japanese_town, day).
character_creation_mode(japanese_town, fixed).
world_language(japanese_town, japanese).
learning_target_language(japanese_town, japanese).

%% Country
country(japan, 'Japan', japanese_town).
country_description(japan, 'An island nation in East Asia known for its blend of ancient tradition and cutting-edge modernity. Home to 125 million people, Japan is renowned for its cuisine, art, technology, and deep cultural heritage spanning millennia.').
government_type(japan, constitutional_monarchy).
economic_system(japan, market).
country_founded(japan, -660).
country_active(japan).

%% State
state(kansai, 'Kansai', japan).
state_type(kansai, region).
