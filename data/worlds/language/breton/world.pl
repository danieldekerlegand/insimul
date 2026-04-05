%% Insimul World: Breton Coast
%% Source: data/worlds/language/breton/world.pl
%% Created: 2026-04-03

world(breton_coast, 'Breton Coast').
world_description(breton_coast, 'A modern independent Republic of Brittany coastal town with fishing harbor, creperies, cider bars, Diwan schools, fest-noz music venues, Celtic cultural centers, standing stones, and bilingual street life').
world_type(breton_coast, alternate_modern).
game_type(breton_coast, language_learning).
target_language(breton_coast, breton).
camera_perspective(breton_coast, third_person).
timestep_unit(breton_coast, year).
gameplay_timestep_unit(breton_coast, day).
character_creation_mode(breton_coast, fixed).
world_language(breton_coast, breton).
learning_target_language(breton_coast, breton).

%% Country
country(republik_breizh, 'Republik Breizh', breton_coast).
country_description(republik_breizh, 'An alternate-history sovereign Breton republic founded in 1946 after World War II. A Celtic nation on the Atlantic coast of western Europe, known for its maritime heritage, megalithic monuments, vibrant music scene, and the revitalization of the Breton language.').
government_type(republik_breizh, republic).
economic_system(republik_breizh, market).
country_founded(republik_breizh, 1946).
country_active(republik_breizh).

%% State
state(bro_leon, 'Bro Leon', republik_breizh).
state_type(bro_leon, province).
