%% Insimul Actions: Solarpunk Eco-Communities
%% Source: data/worlds/solarpunk/actions.pl
%% Created: 2026-04-03
%% Total: 12 actions
%%
%% Predicate schema (follows base actions format):
%%   action/4 -- action(AtomId, Name, ActionType, EnergyCost)
%%   action_difficulty/2, action_duration/2, action_category/2
%%   action_verb/3, action_target_type/2
%%   action_prerequisite/2, action_effect/2
%%   can_perform/3

%% Plant Seeds
action(plant_seeds, 'plant_seeds', crafting, 10).
action_difficulty(plant_seeds, 0.2).
action_duration(plant_seeds, 2).
action_category(plant_seeds, agriculture).
action_verb(plant_seeds, past, 'planted seeds').
action_verb(plant_seeds, present, 'plants seeds').
action_target_type(plant_seeds, location).
action_prerequisite(plant_seeds, (has_item(Actor, seed_packet, _), location(Actor, Zone), garden_plot(Zone))).
action_effect(plant_seeds, (consume_item(Actor, seed_packet, 1), assert(growing(Zone, crop)))).
can_perform(Actor, plant_seeds, Zone) :-
    has_item(Actor, seed_packet, _), location(Actor, Zone), garden_plot(Zone).

%% Harvest Crop
action(harvest_crop, 'harvest_crop', gathering, 10).
action_difficulty(harvest_crop, 0.2).
action_duration(harvest_crop, 2).
action_category(harvest_crop, agriculture).
action_verb(harvest_crop, past, 'harvested crops').
action_verb(harvest_crop, present, 'harvests crops').
action_target_type(harvest_crop, location).
action_prerequisite(harvest_crop, (location(Actor, Zone), mature_crop(Zone, Crop))).
action_effect(harvest_crop, (retract(growing(Zone, Crop)), assert(has_item(Actor, Crop, 1)))).
can_perform(Actor, harvest_crop, Zone) :-
    location(Actor, Zone), mature_crop(Zone, _).

%% Repair Equipment
action(repair_equipment, 'repair_equipment', crafting, 10).
action_difficulty(repair_equipment, 0.3).
action_duration(repair_equipment, 2).
action_category(repair_equipment, maintenance).
action_verb(repair_equipment, past, 'repaired equipment').
action_verb(repair_equipment, present, 'repairs equipment').
action_target_type(repair_equipment, other).
action_prerequisite(repair_equipment, (near(Actor, Item, 3), damaged(Item))).
action_effect(repair_equipment, (repair(Item), modify_durability(Item, 50))).
can_perform(Actor, repair_equipment, Item) :-
    near(Actor, Item, 3), damaged(Item).

%% Compost Waste
action(compost_waste, 'compost_waste', crafting, 5).
action_difficulty(compost_waste, 0.1).
action_duration(compost_waste, 1).
action_category(compost_waste, agriculture).
action_verb(compost_waste, past, 'composted waste').
action_verb(compost_waste, present, 'composts waste').
action_target_type(compost_waste, self).
action_prerequisite(compost_waste, (has_item(Actor, organic_waste, _), near(Actor, compost_bin, 3))).
action_effect(compost_waste, (consume_item(Actor, organic_waste, 1), assert(has_item(Actor, biochar_compost, 1)))).
can_perform(Actor, compost_waste, _) :-
    has_item(Actor, organic_waste, _), near(Actor, compost_bin, 3).

%% Install Solar Panel
action(install_solar, 'install_solar', crafting, 20).
action_difficulty(install_solar, 0.4).
action_duration(install_solar, 4).
action_category(install_solar, engineering).
action_verb(install_solar, past, 'installed a solar panel').
action_verb(install_solar, present, 'installs a solar panel').
action_target_type(install_solar, location).
action_prerequisite(install_solar, (has_item(Actor, solar_panel_kit, _), location(Actor, Zone), suitable_roof(Zone))).
action_effect(install_solar, (consume_item(Actor, solar_panel_kit, 1), assert(has_solar_panel(Zone)))).
can_perform(Actor, install_solar, Zone) :-
    has_item(Actor, solar_panel_kit, _), location(Actor, Zone), suitable_roof(Zone).

%% Inoculate Mycelium
action(inoculate_mycelium, 'inoculate_mycelium', crafting, 15).
action_difficulty(inoculate_mycelium, 0.4).
action_duration(inoculate_mycelium, 3).
action_category(inoculate_mycelium, agriculture).
action_verb(inoculate_mycelium, past, 'inoculated the soil with mycelium').
action_verb(inoculate_mycelium, present, 'inoculates soil with mycelium').
action_target_type(inoculate_mycelium, location).
action_prerequisite(inoculate_mycelium, (has_item(Actor, mycelium_spore_kit, _), location(Actor, Zone), suitable_soil(Zone))).
action_effect(inoculate_mycelium, (consume_item(Actor, mycelium_spore_kit, 1), assert(mycelium_site(Zone)))).
can_perform(Actor, inoculate_mycelium, Zone) :-
    has_item(Actor, mycelium_spore_kit, _), location(Actor, Zone), suitable_soil(Zone).

%% Weave Textile
action(weave_textile, 'weave_textile', crafting, 15).
action_difficulty(weave_textile, 0.3).
action_duration(weave_textile, 3).
action_category(weave_textile, craft).
action_verb(weave_textile, past, 'wove a textile').
action_verb(weave_textile, present, 'weaves a textile').
action_target_type(weave_textile, self).
action_prerequisite(weave_textile, (location(Actor, Zone), has_loom(Zone))).
action_effect(weave_textile, (assert(has_item(Actor, handwoven_textile, 1)))).
can_perform(Actor, weave_textile, _) :-
    location(Actor, Zone), has_loom(Zone).

%% Plant Coral
action(plant_coral, 'plant_coral', crafting, 15).
action_difficulty(plant_coral, 0.4).
action_duration(plant_coral, 3).
action_category(plant_coral, restoration).
action_verb(plant_coral, past, 'planted coral').
action_verb(plant_coral, present, 'plants coral').
action_target_type(plant_coral, location).
action_prerequisite(plant_coral, (has_item(Actor, coral_fragment, _), location(Actor, Zone), reef_site(Zone))).
action_effect(plant_coral, (consume_item(Actor, coral_fragment, 1), modify_biodiversity(Zone, 3))).
can_perform(Actor, plant_coral, Zone) :-
    has_item(Actor, coral_fragment, _), location(Actor, Zone), reef_site(Zone).

%% Brew Tincture
action(brew_tincture, 'brew_tincture', crafting, 10).
action_difficulty(brew_tincture, 0.3).
action_duration(brew_tincture, 2).
action_category(brew_tincture, medicine).
action_verb(brew_tincture, past, 'brewed a tincture').
action_verb(brew_tincture, present, 'brews a tincture').
action_target_type(brew_tincture, self).
action_prerequisite(brew_tincture, (location(Actor, Zone), herbalist_station(Zone))).
action_effect(brew_tincture, (assert(has_item(Actor, herbal_tincture, 1)))).
can_perform(Actor, brew_tincture, _) :-
    location(Actor, Zone), herbalist_station(Zone).

%% Survey Ecosystem
action(survey_ecosystem, 'survey_ecosystem', exploration, 10).
action_difficulty(survey_ecosystem, 0.2).
action_duration(survey_ecosystem, 3).
action_category(survey_ecosystem, research).
action_verb(survey_ecosystem, past, 'surveyed the ecosystem').
action_verb(survey_ecosystem, present, 'surveys the ecosystem').
action_target_type(survey_ecosystem, location).
action_prerequisite(survey_ecosystem, (has_item(Actor, botanical_guide, _), location(Actor, Zone))).
action_effect(survey_ecosystem, (assert(surveyed(Actor, Zone)), reveal_species(Actor, Zone))).
can_perform(Actor, survey_ecosystem, Zone) :-
    has_item(Actor, botanical_guide, _), location(Actor, Zone).

%% Cook Community Meal
action(cook_meal, 'cook_meal', social, 10).
action_difficulty(cook_meal, 0.2).
action_duration(cook_meal, 2).
action_category(cook_meal, social).
action_verb(cook_meal, past, 'cooked a community meal').
action_verb(cook_meal, present, 'cooks a community meal').
action_target_type(cook_meal, location).
action_prerequisite(cook_meal, (location(Actor, Zone), community_kitchen(Zone))).
action_effect(cook_meal, (feed_community(Zone, 10), modify_reputation(Actor, community, 5))).
can_perform(Actor, cook_meal, Zone) :-
    location(Actor, Zone), community_kitchen(Zone).

%% Build Bee Hotel
action(build_bee_hotel, 'build_bee_hotel', crafting, 12).
action_difficulty(build_bee_hotel, 0.3).
action_duration(build_bee_hotel, 2).
action_category(build_bee_hotel, restoration).
action_verb(build_bee_hotel, past, 'built a bee hotel').
action_verb(build_bee_hotel, present, 'builds a bee hotel').
action_target_type(build_bee_hotel, location).
action_prerequisite(build_bee_hotel, (location(Actor, Zone), outdoor(Zone))).
action_effect(build_bee_hotel, (assert(has_pollinator_habitat(Zone)), modify_biodiversity(Zone, 2))).
can_perform(Actor, build_bee_hotel, Zone) :-
    location(Actor, Zone), outdoor(Zone).
