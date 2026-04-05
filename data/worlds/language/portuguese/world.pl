%% Insimul World: Portuguese Algarve
%% Source: data/worlds/language/portuguese/world.pl
%% Created: 2026-04-03

world(portuguese_algarve, 'Portuguese Algarve').
world_description(portuguese_algarve, 'A contemporary Algarve coastal town in southern Portugal with azulejo-tiled buildings, seafood restaurants, a modern marina, sunny beaches, cobblestone old town with pastelerias, and a weekly fish market').
world_type(portuguese_algarve, modern_realistic).
game_type(portuguese_algarve, language_learning).
target_language(portuguese_algarve, portuguese).
camera_perspective(portuguese_algarve, third_person).
timestep_unit(portuguese_algarve, year).
gameplay_timestep_unit(portuguese_algarve, day).
character_creation_mode(portuguese_algarve, fixed).
world_language(portuguese_algarve, portuguese).
learning_target_language(portuguese_algarve, portuguese).

%% Country
country(portuguese_republic, 'Portuguese Republic', portuguese_algarve).
country_description(portuguese_republic, 'The Portuguese Republic, a sovereign state on the western coast of the Iberian Peninsula. One of the oldest nations in Europe, founded in 1143, known for maritime exploration, fado music, and a rich culinary tradition.').
government_type(portuguese_republic, republic).
economic_system(portuguese_republic, market).
country_founded(portuguese_republic, 1143).
country_active(portuguese_republic).

%% State
state(algarve, 'Algarve', portuguese_republic).
state_type(algarve, region).
