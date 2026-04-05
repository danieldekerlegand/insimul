%% Insimul World: Russian Volga Town
%% Source: data/worlds/language/russian/world.pl
%% Created: 2026-04-03

world(russian_volga, 'Russian Volga').
world_description(russian_volga, 'A contemporary Russian town along the Volga River with onion-domed churches, Soviet-era apartment blocks, a river promenade, cozy cafes, a bustling central market, birch parks, and new development alongside historic architecture').
world_type(russian_volga, modern_realistic).
game_type(russian_volga, language_learning).
target_language(russian_volga, russian).
camera_perspective(russian_volga, third_person).
timestep_unit(russian_volga, year).
gameplay_timestep_unit(russian_volga, day).
character_creation_mode(russian_volga, fixed).
world_language(russian_volga, russian).
learning_target_language(russian_volga, russian).

%% Country
country(russian_federation, 'Russian Federation', russian_volga).
country_description(russian_federation, 'The Russian Federation, the largest country in the world, spanning eleven time zones from the Baltic to the Pacific. Known for its rich literary tradition, vast natural resources, and centuries of cultural heritage blending European and Asian influences.').
government_type(russian_federation, federation).
economic_system(russian_federation, market).
country_founded(russian_federation, 1991).
country_active(russian_federation).

%% State
state(volga_region, 'Volga Region', russian_federation).
state_type(volga_region, oblast).
