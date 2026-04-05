%% Insimul World: Bengali Riverside Town
%% Source: data/worlds/language/bengali/world.pl
%% Created: 2026-04-03

world(bengali_riverside, 'Bengali Riverside').
world_description(bengali_riverside, 'A contemporary Bangladeshi riverside town with rickshaw-filled streets, vibrant textile bazaars, tea stalls, a university campus, and monsoon-fed rice paddies on the outskirts').
world_type(bengali_riverside, modern_realistic).
game_type(bengali_riverside, language_learning).
target_language(bengali_riverside, bengali).
camera_perspective(bengali_riverside, third_person).
timestep_unit(bengali_riverside, year).
gameplay_timestep_unit(bengali_riverside, day).
character_creation_mode(bengali_riverside, fixed).
world_language(bengali_riverside, bengali).
learning_target_language(bengali_riverside, bengali).

%% Country
country(peoples_republic_of_bangladesh, 'People''s Republic of Bangladesh', bengali_riverside).
country_description(peoples_republic_of_bangladesh, 'A South Asian nation born from the 1971 Liberation War, known for its lush river deltas, vibrant textile industry, rich literary traditions, and resilient monsoon-adapted communities.').
government_type(peoples_republic_of_bangladesh, parliamentary_republic).
economic_system(peoples_republic_of_bangladesh, market).
country_founded(peoples_republic_of_bangladesh, 1971).
country_active(peoples_republic_of_bangladesh).

%% State
state(dhaka_division, 'Dhaka Division', peoples_republic_of_bangladesh).
state_type(dhaka_division, division).
