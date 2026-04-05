%% Insimul World: Italian Tuscany
%% Source: data/worlds/language/italian/world.pl
%% Created: 2026-04-03

world(italian_tuscany, 'Italian Tuscany').
world_description(italian_tuscany, 'A contemporary Tuscan hill town with sun-drenched piazzas, family trattorias, olive groves, gelaterias, a weekly outdoor market, vineyards, artisan workshops, and cobblestone streets winding through medieval stone buildings').
world_type(italian_tuscany, modern_realistic).
game_type(italian_tuscany, language_learning).
target_language(italian_tuscany, italian).
camera_perspective(italian_tuscany, third_person).
timestep_unit(italian_tuscany, year).
gameplay_timestep_unit(italian_tuscany, day).
character_creation_mode(italian_tuscany, fixed).
world_language(italian_tuscany, italian).
learning_target_language(italian_tuscany, italian).

%% Country
country(italian_republic, 'Italian Republic', italian_tuscany).
country_description(italian_republic, 'The Italian Republic, founded in 1946 after the fall of the monarchy. A parliamentary republic renowned for its art, cuisine, fashion, and cultural heritage spanning millennia.').
government_type(italian_republic, republic).
economic_system(italian_republic, market).
country_founded(italian_republic, 1946).
country_active(italian_republic).

%% State
state(tuscany, 'Tuscany', italian_republic).
state_type(tuscany, region).
