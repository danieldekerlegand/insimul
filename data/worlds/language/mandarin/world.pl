%% Insimul World: Mandarin Watertown
%% Source: data/worlds/language/mandarin/world.pl
%% Created: 2026-04-03

world(mandarin_watertown, 'Mandarin Watertown').
world_description(mandarin_watertown, 'A contemporary Jiangnan water town in southern China where ancient canals wind past modern shops, canal-side teahouses face QR-code payment terminals, scholar gardens serve as public parks, and high-speed rail connects the town to Shanghai and Hangzhou').
world_type(mandarin_watertown, modern_realistic).
game_type(mandarin_watertown, language_learning).
target_language(mandarin_watertown, mandarin).
camera_perspective(mandarin_watertown, third_person).
timestep_unit(mandarin_watertown, year).
gameplay_timestep_unit(mandarin_watertown, day).
character_creation_mode(mandarin_watertown, fixed).
world_language(mandarin_watertown, mandarin).
learning_target_language(mandarin_watertown, mandarin).

%% Country
country(peoples_republic_of_china, 'People''s Republic of China', mandarin_watertown).
country_description(peoples_republic_of_china, 'The most populous country in the world, blending millennia of continuous civilization with rapid modernization. Known for its diverse landscapes, rich cultural heritage, and dynamic economy.').
government_type(peoples_republic_of_china, republic).
economic_system(peoples_republic_of_china, mixed).
country_founded(peoples_republic_of_china, 1949).
country_active(peoples_republic_of_china).

%% State
state(zhejiang, 'Zhejiang', peoples_republic_of_china).
state_type(zhejiang, province).
