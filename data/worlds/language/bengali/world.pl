%% Insimul World: Bengali (Mughal-era Bengal Delta)
%% Source: data/worlds/language/bengali/world.pl
%% Created: 2026-04-03
%% Setting: A vibrant riverine settlement in the Bengal Delta during
%%          the Mughal period (~1600s), with jute markets, monsoon-fed
%%          rice paddies, poetry, music, and textile arts.

world(mughal_bengal, 'Mughal Bengal').
world_description(mughal_bengal, 'A vibrant riverine settlement in the Mughal-era Bengal Delta with jute markets, monsoon-fed rice paddies, and rich traditions of poetry, music, and textile arts').
world_type(mughal_bengal, historical_renaissance).
game_type(mughal_bengal, language_learning).
target_language(mughal_bengal, bengali).
camera_perspective(mughal_bengal, third_person).
timestep_unit(mughal_bengal, year).
gameplay_timestep_unit(mughal_bengal, day).
character_creation_mode(mughal_bengal, fixed).
world_language(mughal_bengal, bengali).
learning_target_language(mughal_bengal, bengali).

%% Insimul Countries: Mughal Bengal
%% Total: 1 country

%% Subah Bangalah (Mughal Province of Bengal)
country(subah_bangalah, 'Subah Bangalah', mughal_bengal).
country_description(subah_bangalah, 'The Mughal province of Bengal, one of the wealthiest regions of the empire, renowned for its muslin textiles, rice surplus, and riverine trade networks stretching from the Ganges Delta to the Bay of Bengal.').
government_type(subah_bangalah, monarchy).
economic_system(subah_bangalah, feudal).
country_founded(subah_bangalah, 1576).
country_active(subah_bangalah).

%% Insimul States/Provinces: Mughal Bengal
%% Total: 1 state

%% Sarkar Sonargaon (District of Sonargaon)
state(sarkar_sonargaon, 'Sarkar Sonargaon', subah_bangalah).
state_type(sarkar_sonargaon, province).
