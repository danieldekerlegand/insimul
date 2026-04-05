%% Insimul World: Spanish Castile
%% Source: data/worlds/language/spanish/world.pl
%% Created: 2026-04-03

world(spanish_castile, 'Spanish Castile').
world_description(spanish_castile, 'A contemporary Castilian town in central Spain with sun-baked plazas, outdoor terraces, tapas bars, a lively mercado, a Gothic cathedral, modern shops, siesta rhythms, and evening paseos along tree-lined boulevards').
world_type(spanish_castile, modern_realistic).
game_type(spanish_castile, language_learning).
target_language(spanish_castile, spanish).
camera_perspective(spanish_castile, third_person).
timestep_unit(spanish_castile, year).
gameplay_timestep_unit(spanish_castile, day).
character_creation_mode(spanish_castile, fixed).
world_language(spanish_castile, spanish).
learning_target_language(spanish_castile, spanish).

%% Country
country(kingdom_of_spain, 'Kingdom of Spain', spanish_castile).
country_description(kingdom_of_spain, 'The Kingdom of Spain, a constitutional monarchy on the Iberian Peninsula known for its rich cultural heritage, regional diversity, Mediterranean cuisine, flamenco, and centuries of history from Roman Hispania through the Reconquista to the modern European Union.').
government_type(kingdom_of_spain, constitutional_monarchy).
economic_system(kingdom_of_spain, market).
country_founded(kingdom_of_spain, 1479).
country_active(kingdom_of_spain).

%% State
state(castilla_y_leon, 'Castilla y Leon', kingdom_of_spain).
state_type(castilla_y_leon, autonomous_community).
