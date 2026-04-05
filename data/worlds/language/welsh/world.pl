%% Insimul World: Welsh Valley
%% Source: data/worlds/language/welsh/worlds.json
%% Converted: 2026-04-03T12:00:00Z

world(welsh_valley, 'Welsh Valley').
world_description(welsh_valley, 'An alternate-history modern world where Wales is an independent sovereign republic with a thriving Welsh-language culture').
world_type(welsh_valley, alternate_modern).
game_type(welsh_valley, language_learning).
target_language(welsh_valley, welsh).
camera_perspective(welsh_valley, third_person).
timestep_unit(welsh_valley, year).
gameplay_timestep_unit(welsh_valley, day).
character_creation_mode(welsh_valley, fixed).
world_language(welsh_valley, welsh).
learning_target_language(welsh_valley, welsh).

%% Insimul Countries: Welsh Valley
%% Source: data/worlds/language/welsh/countries.json
%% Converted: 2026-04-03T12:00:00Z
%% Total: 1 countries

%% Gweriniaeth Cymru (Republic of Wales)
country(gweriniaeth_cymru, 'Gweriniaeth Cymru', welsh_valley).
country_description(gweriniaeth_cymru, 'An independent Celtic republic in western Britain, established in 1946 after a post-war wave of self-determination. Gweriniaeth Cymru maintains a bilingual Welsh-English society with Welsh as the primary official language. The nation is known for its slate mining heritage, rugby culture, eisteddfod arts festivals, hill farming, and a robust language revival movement that has made Welsh the everyday language of government, education, and daily life.').
government_type(gweriniaeth_cymru, republic).
economic_system(gweriniaeth_cymru, market).
country_founded(gweriniaeth_cymru, 1946).
country_active(gweriniaeth_cymru).

%% Insimul States/Provinces: Welsh Valley
%% Source: data/worlds/language/welsh/states.json
%% Converted: 2026-04-03T12:00:00Z
%% Total: 1 states

%% Gwynedd
state(gwynedd, 'Gwynedd', gweriniaeth_cymru).
state_type(gwynedd, province).
