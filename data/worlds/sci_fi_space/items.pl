%% Insimul Items: Sci-Fi Space
%% Source: data/worlds/sci_fi_space/items.pl
%% Created: 2026-04-03
%% Total: 18 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Plasma Pistol
item(plasma_pistol, 'Plasma Pistol', weapon).
item_description(plasma_pistol, 'A standard-issue sidearm that fires superheated plasma bolts. Effective against both organic and synthetic targets.').
item_value(plasma_pistol, 120).
item_sell_value(plasma_pistol, 60).
item_weight(plasma_pistol, 1.5).
item_rarity(plasma_pistol, uncommon).
item_category(plasma_pistol, weapon).
item_tradeable(plasma_pistol).
item_possessable(plasma_pistol).
item_tag(plasma_pistol, weapon).
item_tag(plasma_pistol, ranged).

%% Energy Shield Generator
item(energy_shield, 'Energy Shield Generator', equipment).
item_description(energy_shield, 'A wrist-mounted device that projects a personal energy barrier. Absorbs moderate damage before requiring a recharge cycle.').
item_value(energy_shield, 200).
item_sell_value(energy_shield, 100).
item_weight(energy_shield, 0.5).
item_rarity(energy_shield, rare).
item_category(energy_shield, defense).
item_tradeable(energy_shield).
item_possessable(energy_shield).
item_tag(energy_shield, defense).
item_tag(energy_shield, technology).

%% Medi-Gel Injector
item(medi_gel, 'Medi-Gel Injector', consumable).
item_description(medi_gel, 'A self-administering medical nanogel that seals wounds and accelerates tissue regeneration. Standard military field medicine.').
item_value(medi_gel, 50).
item_sell_value(medi_gel, 25).
item_weight(medi_gel, 0.2).
item_rarity(medi_gel, uncommon).
item_category(medi_gel, medicine).
item_stackable(medi_gel).
item_tradeable(medi_gel).
item_possessable(medi_gel).
item_tag(medi_gel, medicine).
item_tag(medi_gel, healing).

%% FTL Navigation Chart
item(ftl_nav_chart, 'FTL Navigation Chart', document).
item_description(ftl_nav_chart, 'A holographic data crystal containing faster-than-light jump coordinates. Each chart covers a specific sector of mapped space.').
item_value(ftl_nav_chart, 300).
item_sell_value(ftl_nav_chart, 150).
item_weight(ftl_nav_chart, 0.1).
item_rarity(ftl_nav_chart, rare).
item_category(ftl_nav_chart, navigation).
item_tradeable(ftl_nav_chart).
item_possessable(ftl_nav_chart).
item_tag(ftl_nav_chart, navigation).
item_tag(ftl_nav_chart, data).

%% Ration Pack
item(ration_pack, 'Ration Pack', consumable).
item_description(ration_pack, 'A sealed military ration containing nutrient paste, protein bars, and electrolyte powder. Bland but sustaining.').
item_value(ration_pack, 10).
item_sell_value(ration_pack, 5).
item_weight(ration_pack, 0.5).
item_rarity(ration_pack, common).
item_category(ration_pack, food_drink).
item_stackable(ration_pack).
item_tradeable(ration_pack).
item_possessable(ration_pack).
item_tag(ration_pack, food).
item_tag(ration_pack, military).

%% Quantum Processor
item(quantum_processor, 'Quantum Processor', material).
item_description(quantum_processor, 'A cutting-edge computing component used in AI cores and advanced sensor arrays. Extremely valuable to engineers.').
item_value(quantum_processor, 500).
item_sell_value(quantum_processor, 250).
item_weight(quantum_processor, 0.3).
item_rarity(quantum_processor, legendary).
item_category(quantum_processor, technology).
item_tradeable(quantum_processor).
item_possessable(quantum_processor).
item_tag(quantum_processor, technology).
item_tag(quantum_processor, crafting).

%% Oxygen Canister
item(oxygen_canister, 'Oxygen Canister', consumable).
item_description(oxygen_canister, 'A pressurized tank of breathable air for EVA operations. Provides four hours of oxygen in vacuum conditions.').
item_value(oxygen_canister, 25).
item_sell_value(oxygen_canister, 12).
item_weight(oxygen_canister, 2).
item_rarity(oxygen_canister, common).
item_category(oxygen_canister, survival).
item_stackable(oxygen_canister).
item_tradeable(oxygen_canister).
item_possessable(oxygen_canister).
item_tag(oxygen_canister, survival).
item_tag(oxygen_canister, eva).

%% EVA Suit
item(eva_suit, 'EVA Suit', equipment).
item_description(eva_suit, 'A pressurized suit for extravehicular activity. Protects against vacuum, radiation, and micro-meteorites. Bulky but essential.').
item_value(eva_suit, 150).
item_sell_value(eva_suit, 75).
item_weight(eva_suit, 8).
item_rarity(eva_suit, uncommon).
item_category(eva_suit, armor).
item_tradeable(eva_suit).
item_possessable(eva_suit).
item_tag(eva_suit, armor).
item_tag(eva_suit, eva).

%% Data Pad
item(data_pad, 'Data Pad', tool).
item_description(data_pad, 'A portable holographic display and computing device. Used for communication, data access, and personal records.').
item_value(data_pad, 30).
item_sell_value(data_pad, 15).
item_weight(data_pad, 0.3).
item_rarity(data_pad, common).
item_category(data_pad, technology).
item_tradeable(data_pad).
item_possessable(data_pad).
item_tag(data_pad, technology).
item_tag(data_pad, communication).

%% Thassari Crystal
item(thassari_crystal, 'Thassari Crystal', material).
item_description(thassari_crystal, 'A luminescent organic crystal grown by the Thassari. Used in their technology and prized by collectors for its shifting colors.').
item_value(thassari_crystal, 400).
item_sell_value(thassari_crystal, 200).
item_weight(thassari_crystal, 0.5).
item_rarity(thassari_crystal, rare).
item_category(thassari_crystal, alien_artifact).
item_tradeable(thassari_crystal).
item_possessable(thassari_crystal).
item_tag(thassari_crystal, alien).
item_tag(thassari_crystal, collectible).

%% Repair Kit
item(repair_kit, 'Repair Kit', tool).
item_description(repair_kit, 'A toolkit containing micro-welders, circuit testers, and universal adapters for maintaining ship systems and equipment.').
item_value(repair_kit, 40).
item_sell_value(repair_kit, 20).
item_weight(repair_kit, 1.5).
item_rarity(repair_kit, common).
item_category(repair_kit, tool).
item_tradeable(repair_kit).
item_possessable(repair_kit).
item_tag(repair_kit, engineering).
item_tag(repair_kit, maintenance).

%% Stim Pack
item(stim_pack, 'Stim Pack', consumable).
item_description(stim_pack, 'A chemical stimulant that temporarily boosts reflexes and mental acuity. Prolonged use causes dependency and neural damage.').
item_value(stim_pack, 35).
item_sell_value(stim_pack, 18).
item_weight(stim_pack, 0.1).
item_rarity(stim_pack, uncommon).
item_category(stim_pack, medicine).
item_stackable(stim_pack).
item_tradeable(stim_pack).
item_possessable(stim_pack).
item_tag(stim_pack, medicine).
item_tag(stim_pack, combat).

%% Cargo Container
item(cargo_container, 'Cargo Container', material).
item_description(cargo_container, 'A standard interstellar shipping container with magnetic clamps and environmental sealing. Universal cargo standard.').
item_value(cargo_container, 15).
item_sell_value(cargo_container, 8).
item_weight(cargo_container, 10).
item_rarity(cargo_container, common).
item_category(cargo_container, trade).
item_stackable(cargo_container).
item_tradeable(cargo_container).
item_possessable(cargo_container).
item_tag(cargo_container, trade).
item_tag(cargo_container, storage).

%% Encryption Key
item(encryption_key, 'Encryption Key', document).
item_description(encryption_key, 'A data chip containing military-grade encryption codes. Used to access restricted systems and decode classified transmissions.').
item_value(encryption_key, 250).
item_sell_value(encryption_key, 125).
item_weight(encryption_key, 0.05).
item_rarity(encryption_key, rare).
item_category(encryption_key, data).
item_tradeable(encryption_key).
item_possessable(encryption_key).
item_tag(encryption_key, data).
item_tag(encryption_key, security).

%% Hydroponic Seeds
item(hydroponic_seeds, 'Hydroponic Seeds', material).
item_description(hydroponic_seeds, 'Genetically optimized seed stock for zero-gravity hydroponic farming. Essential for long-duration space habitation.').
item_value(hydroponic_seeds, 20).
item_sell_value(hydroponic_seeds, 10).
item_weight(hydroponic_seeds, 0.2).
item_rarity(hydroponic_seeds, uncommon).
item_category(hydroponic_seeds, agriculture).
item_stackable(hydroponic_seeds).
item_tradeable(hydroponic_seeds).
item_possessable(hydroponic_seeds).
item_tag(hydroponic_seeds, food).
item_tag(hydroponic_seeds, agriculture).

%% Gravity Boots
item(gravity_boots, 'Gravity Boots', equipment).
item_description(gravity_boots, 'Magnetic boots that allow walking on metallic surfaces in zero-gravity environments. Toggle switch between magnetic and normal modes.').
item_value(gravity_boots, 80).
item_sell_value(gravity_boots, 40).
item_weight(gravity_boots, 3).
item_rarity(gravity_boots, uncommon).
item_category(gravity_boots, equipment).
item_tradeable(gravity_boots).
item_possessable(gravity_boots).
item_tag(gravity_boots, eva).
item_tag(gravity_boots, equipment).

%% Contraband Spice
item(contraband_spice, 'Contraband Spice', consumable).
item_description(contraband_spice, 'An illegal psychoactive substance popular in the outer colonies. Produces euphoria and enhanced perception. Strictly banned on Federation stations.').
item_value(contraband_spice, 180).
item_sell_value(contraband_spice, 90).
item_weight(contraband_spice, 0.1).
item_rarity(contraband_spice, rare).
item_category(contraband_spice, contraband).
item_stackable(contraband_spice).
item_tradeable(contraband_spice).
item_possessable(contraband_spice).
item_tag(contraband_spice, illegal).
item_tag(contraband_spice, smuggling).

%% Federation Credits
item(fed_credits, 'Federation Credits', material).
item_description(fed_credits, 'Digital currency backed by the Galactic Federation. Accepted at all Federation stations and most colony worlds. Useless in lawless zones.').
item_value(fed_credits, 1).
item_sell_value(fed_credits, 1).
item_weight(fed_credits, 0).
item_rarity(fed_credits, common).
item_category(fed_credits, currency).
item_stackable(fed_credits).
item_tradeable(fed_credits).
item_possessable(fed_credits).
item_tag(fed_credits, currency).
item_tag(fed_credits, economy).
