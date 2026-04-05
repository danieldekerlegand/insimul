%% Insimul World Type: Creole Colonial
%% World Type Slug: creole-colonial
%% Created: 2026-04-03T07:20:11Z

world_type_def(creole_colonial, 'Creole Colonial', 'creole-colonial').
world_type_description(creole_colonial, 'A colonial-era world of cultural fusion, trade, and Creole heritage').

world(creole_colonial, 'Creole Colonial').
world_description(creole_colonial, 'An 18th-century colonial port town where French, Spanish, African, and Indigenous cultures merge into a vibrant Creole society. Players navigate plantation politics, waterfront trade, voodoo traditions, and the struggle for freedom.').
world_type(creole_colonial, historical_cultural).
game_type(creole_colonial, language_learning).
target_language(creole_colonial, louisiana_creole).
camera_perspective(creole_colonial, third_person).
timestep_unit(creole_colonial, year).
gameplay_timestep_unit(creole_colonial, day).
character_creation_mode(creole_colonial, fixed).
world_language(creole_colonial, louisiana_creole).
learning_target_language(creole_colonial, louisiana_creole).

%% Country
country(colonie_de_louisiane, 'Colonie de Louisiane', creole_colonial).
country_description(colonie_de_louisiane, 'The French colonial territory of Louisiana in the late 18th century, a vast territory stretching from the Gulf of Mexico to the Great Lakes. Governed from Nouvelle-Orleans, this colony is a crossroads of French administrative law, African labor and culture, Spanish influence, and Indigenous knowledge systems.').
government_type(colonie_de_louisiane, colonial_administration).
economic_system(colonie_de_louisiane, plantation_mercantile).
country_founded(colonie_de_louisiane, 1699).
country_active(colonie_de_louisiane).

%% State / Province
state(basse_louisiane, 'Basse-Louisiane', colonie_de_louisiane).
state_description(basse_louisiane, 'The lower portion of colonial Louisiana centered on the Mississippi Delta, encompassing Nouvelle-Orleans and surrounding bayou country. Sugar, indigo, and the slave trade drive its economy.').
state_capital(basse_louisiane, nouvelle_orleans).
state_founded(basse_louisiane, 1718).
state_active(basse_louisiane).
