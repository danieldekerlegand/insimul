%% Insimul World: Medieval Brittany (Breizh)
%% Source: data/worlds/language/breton/world.pl
%% Created: 2026-04-03
%%
%% A Celtic fishing village on the rugged Armorican coast with standing
%% stones, thatched longhouses, cider orchards, and maritime independence.

world(medieval_breizh, 'Medieval Brittany').
world_description(medieval_breizh, 'A medieval Celtic duchy on the rugged Armorican coast, where Breton fishermen, weavers, and druids preserve their ancient language amid standing stones and thatched longhouses.').
world_type(medieval_breizh, historical_medieval).
game_type(medieval_breizh, language_learning).
target_language(medieval_breizh, breton).
camera_perspective(medieval_breizh, third_person).
timestep_unit(medieval_breizh, year).
gameplay_timestep_unit(medieval_breizh, day).
character_creation_mode(medieval_breizh, fixed).
world_language(medieval_breizh, breton).
learning_target_language(medieval_breizh, breton).

%% Insimul Countries: Medieval Brittany
%% Total: 1 country

%% Dugelezh Breizh (Duchy of Brittany)
country(dugelezh_breizh, 'Dugelezh Breizh', medieval_breizh).
country_description(dugelezh_breizh, 'The independent Duchy of Brittany, a Celtic maritime realm on the Armorican peninsula. Its people speak Breton, fish the treacherous Atlantic, press cider from ancient orchards, and gather at standing stones for festivals and pardons.').
government_type(dugelezh_breizh, duchy).
economic_system(dugelezh_breizh, feudal).
country_founded(dugelezh_breizh, 939).
country_active(dugelezh_breizh).

%% Insimul States/Provinces: Medieval Brittany
%% Total: 1 state

%% Bro Leon (Pays de Léon)
state(bro_leon, 'Bro Leon', dugelezh_breizh).
state_type(bro_leon, province).
