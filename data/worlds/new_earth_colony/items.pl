%% Insimul Items: New Earth Colony
%% Source: data/worlds/new_earth_colony/items.pl
%% Created: 2026-04-03
%% Total: 18 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% EVA Suit Mark III
item(eva_suit_mk3, 'EVA Suit Mark III', equipment).
item_description(eva_suit_mk3, 'Standard extravehicular activity suit with radiation shielding and 8-hour oxygen supply. Required for all surface excursions.').
item_value(eva_suit_mk3, 500).
item_sell_value(eva_suit_mk3, 250).
item_weight(eva_suit_mk3, 15).
item_rarity(eva_suit_mk3, common).
item_category(eva_suit_mk3, protective_gear).
item_tradeable(eva_suit_mk3).
item_possessable(eva_suit_mk3).
item_tag(eva_suit_mk3, survival).
item_tag(eva_suit_mk3, equipment).

%% Terraform Core Module
item(terraform_core, 'Terraform Core Module', tool).
item_description(terraform_core, 'Portable atmospheric processing unit that converts alien gases into breathable air. Essential for expanding habitable zones.').
item_value(terraform_core, 2000).
item_sell_value(terraform_core, 1000).
item_weight(terraform_core, 50).
item_rarity(terraform_core, rare).
item_category(terraform_core, technology).
item_tradeable(terraform_core).
item_possessable(terraform_core).
item_tag(terraform_core, terraforming).
item_tag(terraform_core, technology).

%% Protein Ration Pack
item(protein_ration, 'Protein Ration Pack', consumable).
item_description(protein_ration, 'Nutrient-dense meal bar synthesized from algae and hydroponic crops. Provides a full days nutrition.').
item_value(protein_ration, 5).
item_sell_value(protein_ration, 2).
item_weight(protein_ration, 0.3).
item_rarity(protein_ration, common).
item_category(protein_ration, food_drink).
item_stackable(protein_ration).
item_tradeable(protein_ration).
item_possessable(protein_ration).
item_tag(protein_ration, food).
item_tag(protein_ration, survival).

%% Plasma Cutter
item(plasma_cutter, 'Plasma Cutter', tool).
item_description(plasma_cutter, 'Industrial-grade cutting tool used for mining operations and hull repair. Doubles as an emergency weapon.').
item_value(plasma_cutter, 300).
item_sell_value(plasma_cutter, 150).
item_weight(plasma_cutter, 4).
item_rarity(plasma_cutter, uncommon).
item_category(plasma_cutter, tool).
item_tradeable(plasma_cutter).
item_possessable(plasma_cutter).
item_tag(plasma_cutter, mining).
item_tag(plasma_cutter, tool).

%% Hydroponic Seed Kit
item(hydroponic_seed_kit, 'Hydroponic Seed Kit', tool).
item_description(hydroponic_seed_kit, 'Sealed container of genetically optimized seeds for zero-gravity and low-gravity cultivation.').
item_value(hydroponic_seed_kit, 150).
item_sell_value(hydroponic_seed_kit, 75).
item_weight(hydroponic_seed_kit, 2).
item_rarity(hydroponic_seed_kit, uncommon).
item_category(hydroponic_seed_kit, agriculture).
item_tradeable(hydroponic_seed_kit).
item_possessable(hydroponic_seed_kit).
item_tag(hydroponic_seed_kit, farming).
item_tag(hydroponic_seed_kit, survival).

%% Oxygen Canister
item(oxygen_canister, 'Oxygen Canister', consumable).
item_description(oxygen_canister, 'Pressurized canister of breathable air. Each provides two hours of supplemental oxygen for EVA operations.').
item_value(oxygen_canister, 20).
item_sell_value(oxygen_canister, 10).
item_weight(oxygen_canister, 3).
item_rarity(oxygen_canister, common).
item_category(oxygen_canister, survival).
item_stackable(oxygen_canister).
item_tradeable(oxygen_canister).
item_possessable(oxygen_canister).
item_tag(oxygen_canister, survival).
item_tag(oxygen_canister, consumable).

%% Datapad
item(datapad, 'Datapad', tool).
item_description(datapad, 'Handheld computing device with holographic display. Used for mission logs, colony databases, and communication.').
item_value(datapad, 100).
item_sell_value(datapad, 50).
item_weight(datapad, 0.5).
item_rarity(datapad, common).
item_category(datapad, technology).
item_tradeable(datapad).
item_possessable(datapad).
item_tag(datapad, technology).
item_tag(datapad, communication).

%% Alien Flora Sample
item(alien_flora_sample, 'Alien Flora Sample', quest_item).
item_description(alien_flora_sample, 'Carefully preserved specimen of native plant life sealed in a containment jar. Bioluminescent and potentially medicinal.').
item_value(alien_flora_sample, 250).
item_sell_value(alien_flora_sample, 125).
item_weight(alien_flora_sample, 1).
item_rarity(alien_flora_sample, rare).
item_category(alien_flora_sample, research).
item_tradeable(alien_flora_sample).
item_possessable(alien_flora_sample).
item_tag(alien_flora_sample, xenobiology).
item_tag(alien_flora_sample, research).

%% Radiation Badge
item(radiation_badge, 'Radiation Badge', equipment).
item_description(radiation_badge, 'Wearable dosimeter that monitors cumulative radiation exposure. Alerts when safe limits are approached.').
item_value(radiation_badge, 30).
item_sell_value(radiation_badge, 15).
item_weight(radiation_badge, 0.1).
item_rarity(radiation_badge, common).
item_category(radiation_badge, protective_gear).
item_tradeable(radiation_badge).
item_possessable(radiation_badge).
item_tag(radiation_badge, safety).
item_tag(radiation_badge, equipment).

%% Fusion Cell
item(fusion_cell, 'Fusion Cell', consumable).
item_description(fusion_cell, 'Compact power cell that runs on controlled fusion reactions. Powers equipment, vehicles, and station systems.').
item_value(fusion_cell, 80).
item_sell_value(fusion_cell, 40).
item_weight(fusion_cell, 2).
item_rarity(fusion_cell, uncommon).
item_category(fusion_cell, power).
item_stackable(fusion_cell).
item_tradeable(fusion_cell).
item_possessable(fusion_cell).
item_tag(fusion_cell, power).
item_tag(fusion_cell, technology).

%% Water Purification Tablet
item(water_purification_tablet, 'Water Purification Tablet', consumable).
item_description(water_purification_tablet, 'Chemical tablet that neutralizes alien microbial contaminants in water sources. Essential for surface exploration.').
item_value(water_purification_tablet, 10).
item_sell_value(water_purification_tablet, 5).
item_weight(water_purification_tablet, 0.05).
item_rarity(water_purification_tablet, common).
item_category(water_purification_tablet, survival).
item_stackable(water_purification_tablet).
item_tradeable(water_purification_tablet).
item_possessable(water_purification_tablet).
item_tag(water_purification_tablet, survival).
item_tag(water_purification_tablet, consumable).

%% Mineral Scanner
item(mineral_scanner, 'Mineral Scanner', tool).
item_description(mineral_scanner, 'Handheld device that detects mineral deposits and ore veins beneath the surface. Critical for mining operations.').
item_value(mineral_scanner, 200).
item_sell_value(mineral_scanner, 100).
item_weight(mineral_scanner, 1.5).
item_rarity(mineral_scanner, uncommon).
item_category(mineral_scanner, tool).
item_tradeable(mineral_scanner).
item_possessable(mineral_scanner).
item_tag(mineral_scanner, mining).
item_tag(mineral_scanner, technology).

%% Emergency Beacon
item(emergency_beacon, 'Emergency Beacon', tool).
item_description(emergency_beacon, 'Distress signal transmitter with a range of 500 kilometers. Activates a rescue protocol when triggered.').
item_value(emergency_beacon, 150).
item_sell_value(emergency_beacon, 75).
item_weight(emergency_beacon, 1).
item_rarity(emergency_beacon, uncommon).
item_category(emergency_beacon, safety).
item_tradeable(emergency_beacon).
item_possessable(emergency_beacon).
item_tag(emergency_beacon, safety).
item_tag(emergency_beacon, communication).

%% Nano-Repair Gel
item(nano_repair_gel, 'Nano-Repair Gel', consumable).
item_description(nano_repair_gel, 'Tube of nanomachine-infused gel that bonds to damaged materials and restores structural integrity. Works on suits, hulls, and tools.').
item_value(nano_repair_gel, 60).
item_sell_value(nano_repair_gel, 30).
item_weight(nano_repair_gel, 0.5).
item_rarity(nano_repair_gel, uncommon).
item_category(nano_repair_gel, repair).
item_stackable(nano_repair_gel).
item_tradeable(nano_repair_gel).
item_possessable(nano_repair_gel).
item_tag(nano_repair_gel, repair).
item_tag(nano_repair_gel, technology).

%% Alien Mineral Ore
item(alien_mineral_ore, 'Alien Mineral Ore', material).
item_description(alien_mineral_ore, 'Raw ore extracted from the planets crust. Contains unique crystalline structures not found on Earth.').
item_value(alien_mineral_ore, 120).
item_sell_value(alien_mineral_ore, 60).
item_weight(alien_mineral_ore, 5).
item_rarity(alien_mineral_ore, uncommon).
item_category(alien_mineral_ore, material).
item_stackable(alien_mineral_ore).
item_tradeable(alien_mineral_ore).
item_possessable(alien_mineral_ore).
item_tag(alien_mineral_ore, mining).
item_tag(alien_mineral_ore, material).

%% Synth-Coffee
item(synth_coffee, 'Synth-Coffee', consumable).
item_description(synth_coffee, 'Lab-grown coffee substitute brewed from hydroponic beans. The colonists daily ritual and morale booster.').
item_value(synth_coffee, 3).
item_sell_value(synth_coffee, 1).
item_weight(synth_coffee, 0.3).
item_rarity(synth_coffee, common).
item_category(synth_coffee, food_drink).
item_stackable(synth_coffee).
item_tradeable(synth_coffee).
item_possessable(synth_coffee).
item_tag(synth_coffee, food).
item_tag(synth_coffee, morale).

%% Holographic Map Projector
item(holo_map_projector, 'Holographic Map Projector', tool).
item_description(holo_map_projector, 'Portable device that projects a 3D holographic map of the colony and surrounding terrain with real-time updates.').
item_value(holo_map_projector, 180).
item_sell_value(holo_map_projector, 90).
item_weight(holo_map_projector, 1).
item_rarity(holo_map_projector, uncommon).
item_category(holo_map_projector, technology).
item_tradeable(holo_map_projector).
item_possessable(holo_map_projector).
item_tag(holo_map_projector, navigation).
item_tag(holo_map_projector, technology).

%% Cryogenic Sleep Pod Key
item(cryo_pod_key, 'Cryogenic Sleep Pod Key', quest_item).
item_description(cryo_pod_key, 'Authorization key for accessing the colony ship cryogenic storage. Contains encrypted crew manifest data.').
item_value(cryo_pod_key, 500).
item_sell_value(cryo_pod_key, 0).
item_weight(cryo_pod_key, 0.1).
item_rarity(cryo_pod_key, rare).
item_category(cryo_pod_key, quest).
item_possessable(cryo_pod_key).
item_tag(cryo_pod_key, quest).
item_tag(cryo_pod_key, technology).
