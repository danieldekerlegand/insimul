%% Insimul World: Arabic Al-Andalus
%% Source: data/worlds/language/arabic/world.pl
%% Created: 2026-04-03
%%
%% A medieval Al-Andalus world set during the Islamic Golden Age (~1000 CE),
%% blending Islamic, Christian, and Jewish cultures in a thriving Iberian city.

world(arabic_al_andalus, 'Arabic Al-Andalus').
world_description(arabic_al_andalus, 'A historical medieval world set in Al-Andalus during the Islamic Golden Age, where Islamic, Christian, and Jewish cultures thrive together in a center of learning, trade, and art').
world_type(arabic_al_andalus, historical_medieval).
game_type(arabic_al_andalus, language_learning).
target_language(arabic_al_andalus, arabic).
camera_perspective(arabic_al_andalus, third_person).
timestep_unit(arabic_al_andalus, year).
gameplay_timestep_unit(arabic_al_andalus, day).
character_creation_mode(arabic_al_andalus, fixed).
world_language(arabic_al_andalus, arabic).
learning_target_language(arabic_al_andalus, arabic).

%% Insimul Countries: Arabic Al-Andalus
%% Total: 1 country

%% Khilafat Qurtuba (Caliphate of Cordoba)
country(khilafat_qurtuba, 'Khilafat Qurtuba', arabic_al_andalus).
country_description(khilafat_qurtuba, 'The Caliphate of Cordoba at its zenith, a beacon of learning, science, and culture in medieval Europe. Renowned for its libraries, universities, and the harmonious coexistence of Muslims, Christians, and Jews under a sophisticated system of governance.').
government_type(khilafat_qurtuba, caliphate).
economic_system(khilafat_qurtuba, feudal).
country_founded(khilafat_qurtuba, 929).
country_active(khilafat_qurtuba).

%% Insimul States/Provinces: Arabic Al-Andalus
%% Total: 1 state

%% Wilayat Qurtuba (Province of Cordoba)
state(wilayat_qurtuba, 'Wilayat Qurtuba', khilafat_qurtuba).
state_type(wilayat_qurtuba, province).
