%% Insimul World: German Rhineland
%% Source: data/worlds/language/german/world.pl
%% Created: 2026-04-03

world(german_rhineland, 'German Rhineland').
world_description(german_rhineland, 'A contemporary Rhineland town in Germany with half-timbered Altstadt, modern shops, vineyard hillsides, a lively Marktplatz, cozy Weinstuben, a university campus, and Rhine promenades').
world_type(german_rhineland, modern_realistic).
game_type(german_rhineland, language_learning).
target_language(german_rhineland, german).
camera_perspective(german_rhineland, third_person).
timestep_unit(german_rhineland, year).
gameplay_timestep_unit(german_rhineland, day).
character_creation_mode(german_rhineland, fixed).
world_language(german_rhineland, german).
learning_target_language(german_rhineland, german).

%% Country
country(federal_republic_germany, 'Federal Republic of Germany', german_rhineland).
country_description(federal_republic_germany, 'The Federal Republic of Germany, a leading European democracy known for its engineering, cultural heritage, wine regions, and robust economy. Founded in 1949 after World War II.').
government_type(federal_republic_germany, federal_republic).
economic_system(federal_republic_germany, social_market).
country_founded(federal_republic_germany, 1949).
country_active(federal_republic_germany).

%% State
state(rhineland_palatinate, 'Rhineland-Palatinate', federal_republic_germany).
state_type(rhineland_palatinate, bundesland).
