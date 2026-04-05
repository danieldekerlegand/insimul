%% Insimul Items: Dieselpunk
%% Source: data/worlds/dieselpunk/items.pl
%% Created: 2026-04-03
%% Total: 20 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Diesel Engine Core
item(diesel_engine_core, 'Diesel Engine Core', material).
item_description(diesel_engine_core, 'A compact high-compression diesel engine block. The beating heart of every machine in the republic.').
item_value(diesel_engine_core, 200).
item_sell_value(diesel_engine_core, 120).
item_weight(diesel_engine_core, 50).
item_rarity(diesel_engine_core, uncommon).
item_category(diesel_engine_core, machinery).
item_tradeable(diesel_engine_core).
item_possessable(diesel_engine_core).
item_tag(diesel_engine_core, industrial).
item_tag(diesel_engine_core, engine).

%% Gas Mask
item(gas_mask, 'Gas Mask', equipment).
item_description(gas_mask, 'A rubberized canvas mask with twin charcoal filters. Standard issue for factory workers and soldiers alike.').
item_value(gas_mask, 25).
item_sell_value(gas_mask, 12).
item_weight(gas_mask, 1.5).
item_rarity(gas_mask, common).
item_category(gas_mask, protection).
item_tradeable(gas_mask).
item_possessable(gas_mask).
item_tag(gas_mask, military).
item_tag(gas_mask, safety).

%% Propaganda Poster
item(propaganda_poster, 'Propaganda Poster', material).
item_description(propaganda_poster, 'A bold red-and-black lithograph urging citizens to increase production for the war effort.').
item_value(propaganda_poster, 2).
item_sell_value(propaganda_poster, 1).
item_weight(propaganda_poster, 0.1).
item_rarity(propaganda_poster, common).
item_category(propaganda_poster, paper).
item_stackable(propaganda_poster).
item_tradeable(propaganda_poster).
item_possessable(propaganda_poster).
item_tag(propaganda_poster, political).
item_tag(propaganda_poster, propaganda).

%% Airship Fuel Cell
item(airship_fuel_cell, 'Airship Fuel Cell', material).
item_description(airship_fuel_cell, 'A pressurized canister of refined diesel fuel calibrated for airship turbines.').
item_value(airship_fuel_cell, 80).
item_sell_value(airship_fuel_cell, 50).
item_weight(airship_fuel_cell, 15).
item_rarity(airship_fuel_cell, uncommon).
item_category(airship_fuel_cell, fuel).
item_stackable(airship_fuel_cell).
item_tradeable(airship_fuel_cell).
item_possessable(airship_fuel_cell).
item_tag(airship_fuel_cell, airship).
item_tag(airship_fuel_cell, fuel).

%% Wrench Set
item(wrench_set, 'Wrench Set', tool).
item_description(wrench_set, 'A heavy canvas roll of chrome-vanadium wrenches. No mechanic walks without one.').
item_value(wrench_set, 15).
item_sell_value(wrench_set, 8).
item_weight(wrench_set, 3).
item_rarity(wrench_set, common).
item_category(wrench_set, tool).
item_tradeable(wrench_set).
item_possessable(wrench_set).
item_tag(wrench_set, mechanical).
item_tag(wrench_set, tool).

%% Resistance Leaflet
item(resistance_leaflet, 'Resistance Leaflet', material).
item_description(resistance_leaflet, 'A secretly printed pamphlet calling for workers to rise against the war machine. Possession is a crime.').
item_value(resistance_leaflet, 5).
item_sell_value(resistance_leaflet, 0).
item_weight(resistance_leaflet, 0.05).
item_rarity(resistance_leaflet, rare).
item_category(resistance_leaflet, paper).
item_stackable(resistance_leaflet).
item_possessable(resistance_leaflet).
item_tag(resistance_leaflet, contraband).
item_tag(resistance_leaflet, political).

%% Aviator Goggles
item(aviator_goggles, 'Aviator Goggles', equipment).
item_description(aviator_goggles, 'Brass-rimmed goggles with tinted lenses, worn by airship pilots against wind and diesel exhaust.').
item_value(aviator_goggles, 20).
item_sell_value(aviator_goggles, 10).
item_weight(aviator_goggles, 0.3).
item_rarity(aviator_goggles, common).
item_category(aviator_goggles, clothing).
item_tradeable(aviator_goggles).
item_possessable(aviator_goggles).
item_tag(aviator_goggles, airship).
item_tag(aviator_goggles, clothing).

%% Ration Booklet
item(ration_booklet, 'Ration Booklet', tool).
item_description(ration_booklet, 'A government-issued booklet of coupons for bread, fuel, and basic goods. Strictly controlled.').
item_value(ration_booklet, 10).
item_sell_value(ration_booklet, 0).
item_weight(ration_booklet, 0.1).
item_rarity(ration_booklet, common).
item_category(ration_booklet, paper).
item_possessable(ration_booklet).
item_tag(ration_booklet, wartime).
item_tag(ration_booklet, essential).

%% Diesel Cigarettes
item(diesel_cigarettes, 'Diesel Brand Cigarettes', consumable).
item_description(diesel_cigarettes, 'A tin of strong unfiltered cigarettes. The currency of favors on the factory floor.').
item_value(diesel_cigarettes, 3).
item_sell_value(diesel_cigarettes, 2).
item_weight(diesel_cigarettes, 0.2).
item_rarity(diesel_cigarettes, common).
item_category(diesel_cigarettes, consumable).
item_stackable(diesel_cigarettes).
item_tradeable(diesel_cigarettes).
item_possessable(diesel_cigarettes).
item_tag(diesel_cigarettes, social).
item_tag(diesel_cigarettes, trade_goods).

%% Forged Papers
item(forged_papers, 'Forged Identity Papers', tool).
item_description(forged_papers, 'A convincing set of counterfeit travel documents. Essential for anyone moving outside their assigned district.').
item_value(forged_papers, 100).
item_sell_value(forged_papers, 60).
item_weight(forged_papers, 0.1).
item_rarity(forged_papers, rare).
item_category(forged_papers, paper).
item_possessable(forged_papers).
item_tag(forged_papers, contraband).
item_tag(forged_papers, espionage).

%% Revolver
item(service_revolver, 'Service Revolver', weapon).
item_description(service_revolver, 'A six-shot military revolver. Officers carry them openly; civilians hide them.').
item_value(service_revolver, 75).
item_sell_value(service_revolver, 40).
item_weight(service_revolver, 1.2).
item_rarity(service_revolver, uncommon).
item_category(service_revolver, weapon).
item_possessable(service_revolver).
item_tag(service_revolver, military).
item_tag(service_revolver, weapon).

%% Trench Coat
item(trench_coat, 'Trench Coat', equipment).
item_description(trench_coat, 'A heavy wool coat with deep pockets. Favored by officers, smugglers, and anyone with something to hide.').
item_value(trench_coat, 30).
item_sell_value(trench_coat, 15).
item_weight(trench_coat, 2).
item_rarity(trench_coat, common).
item_category(trench_coat, clothing).
item_tradeable(trench_coat).
item_possessable(trench_coat).
item_tag(trench_coat, clothing).
item_tag(trench_coat, noir).

%% Bootleg Whiskey
item(bootleg_whiskey, 'Bootleg Whiskey', consumable).
item_description(bootleg_whiskey, 'A brown bottle of illegally distilled rye whiskey. Served under the counter at every speakeasy in the Underbelly.').
item_value(bootleg_whiskey, 8).
item_sell_value(bootleg_whiskey, 5).
item_weight(bootleg_whiskey, 1).
item_rarity(bootleg_whiskey, common).
item_category(bootleg_whiskey, food_drink).
item_stackable(bootleg_whiskey).
item_tradeable(bootleg_whiskey).
item_possessable(bootleg_whiskey).
item_tag(bootleg_whiskey, contraband).
item_tag(bootleg_whiskey, beverage).

%% Compass
item(navigation_compass, 'Navigation Compass', tool).
item_description(navigation_compass, 'A precision brass compass used by airship navigators. Gyro-stabilized for turbulent skies.').
item_value(navigation_compass, 40).
item_sell_value(navigation_compass, 22).
item_weight(navigation_compass, 0.5).
item_rarity(navigation_compass, uncommon).
item_category(navigation_compass, navigation).
item_tradeable(navigation_compass).
item_possessable(navigation_compass).
item_tag(navigation_compass, airship).
item_tag(navigation_compass, navigation).

%% Coal Chunk
item(coal_chunk, 'Coal Chunk', material).
item_description(coal_chunk, 'A lump of high-grade anthracite from the Grimhollow mines. Burns hot and clean.').
item_value(coal_chunk, 1).
item_sell_value(coal_chunk, 0).
item_weight(coal_chunk, 2).
item_rarity(coal_chunk, common).
item_category(coal_chunk, fuel).
item_stackable(coal_chunk).
item_tradeable(coal_chunk).
item_possessable(coal_chunk).
item_tag(coal_chunk, fuel).
item_tag(coal_chunk, mining).

%% Encrypted Radio
item(encrypted_radio, 'Encrypted Field Radio', tool).
item_description(encrypted_radio, 'A portable shortwave radio with a cipher dial. Used by the resistance to coordinate operations.').
item_value(encrypted_radio, 150).
item_sell_value(encrypted_radio, 80).
item_weight(encrypted_radio, 5).
item_rarity(encrypted_radio, rare).
item_category(encrypted_radio, technology).
item_possessable(encrypted_radio).
item_tag(encrypted_radio, espionage).
item_tag(encrypted_radio, communication).

%% Steel Helmet
item(steel_helmet, 'Steel Helmet', equipment).
item_description(steel_helmet, 'A dished steel combat helmet with leather liner. Standard military issue.').
item_value(steel_helmet, 12).
item_sell_value(steel_helmet, 6).
item_weight(steel_helmet, 1.5).
item_rarity(steel_helmet, common).
item_category(steel_helmet, protection).
item_tradeable(steel_helmet).
item_possessable(steel_helmet).
item_tag(steel_helmet, military).
item_tag(steel_helmet, armor).

%% Map of the Frontier
item(frontier_map, 'Frontier Map', tool).
item_description(frontier_map, 'A classified military map showing enemy positions and supply lines along the northern frontier.').
item_value(frontier_map, 200).
item_sell_value(frontier_map, 0).
item_weight(frontier_map, 0.2).
item_rarity(frontier_map, legendary).
item_category(frontier_map, paper).
item_possessable(frontier_map).
item_tag(frontier_map, military).
item_tag(frontier_map, classified).

%% Worker Union Badge
item(union_badge, 'Union Badge', accessory).
item_description(union_badge, 'A stamped tin badge reading Workers United. Wearing one openly invites trouble from the authorities.').
item_value(union_badge, 5).
item_sell_value(union_badge, 2).
item_weight(union_badge, 0.05).
item_rarity(union_badge, uncommon).
item_category(union_badge, accessory).
item_possessable(union_badge).
item_tag(union_badge, political).
item_tag(union_badge, resistance).

%% Mechanical Pocket Watch
item(pocket_watch, 'Mechanical Pocket Watch', accessory).
item_description(pocket_watch, 'A finely crafted brass pocket watch with exposed gears. A symbol of the old world before the war.').
item_value(pocket_watch, 50).
item_sell_value(pocket_watch, 30).
item_weight(pocket_watch, 0.2).
item_rarity(pocket_watch, uncommon).
item_category(pocket_watch, accessory).
item_tradeable(pocket_watch).
item_possessable(pocket_watch).
item_tag(pocket_watch, luxury).
item_tag(pocket_watch, mechanical).
