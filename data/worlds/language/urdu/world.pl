%% Insimul World: Urdu Punjab
%% Source: data/worlds/language/urdu/world.pl
%% Created: 2026-04-03
%%
%% A contemporary Pakistani Punjabi town with bustling bazaars, chai stalls,
%% mosques, modern offices, rickshaw-filled roads, mushaira poetry gatherings,
%% cricket fields, and Nastaliq signage.

world(urdu_punjab, 'Urdu Punjab').
world_description(urdu_punjab, 'A contemporary Pakistani Punjabi town where bustling bazaars, chai stalls, mosques, modern offices, rickshaw-filled roads, mushaira poetry gatherings, and cricket fields create a vibrant setting for learning Urdu').
world_type(urdu_punjab, modern_realistic).
game_type(urdu_punjab, language_learning).
target_language(urdu_punjab, urdu).
camera_perspective(urdu_punjab, third_person).
timestep_unit(urdu_punjab, year).
gameplay_timestep_unit(urdu_punjab, day).
character_creation_mode(urdu_punjab, fixed).
world_language(urdu_punjab, urdu).
learning_target_language(urdu_punjab, urdu).

%% Insimul Countries: Urdu Punjab
%% Total: 1 country

%% Islamic Republic of Pakistan
country(pakistan, 'Islamic Republic of Pakistan', urdu_punjab).
country_description(pakistan, 'The Islamic Republic of Pakistan, a South Asian nation with a rich cultural heritage blending Mughal, Persian, and South Asian traditions. Urdu serves as the national language and lingua franca, uniting the diverse ethnic and linguistic communities of the country.').
government_type(pakistan, federal_parliamentary_republic).
economic_system(pakistan, mixed_market).
country_founded(pakistan, 1947).
country_active(pakistan).

%% Insimul States/Provinces: Urdu Punjab
%% Total: 1 state

%% Punjab Province
state(punjab, 'Punjab', pakistan).
state_type(punjab, province).
