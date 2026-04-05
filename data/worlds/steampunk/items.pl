%% Insimul Items: Steampunk
%% Source: data/worlds/steampunk/items.pl
%% Created: 2026-04-03
%% Total: 20 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Brass Goggles
item(brass_goggles, 'Brass Goggles', equipment).
item_description(brass_goggles, 'Thick-lensed goggles with brass frames and adjustable leather straps. Essential for workshop work and airship travel.').
item_value(brass_goggles, 15).
item_sell_value(brass_goggles, 8).
item_weight(brass_goggles, 0.5).
item_rarity(brass_goggles, common).
item_category(brass_goggles, accessory).
item_tradeable(brass_goggles).
item_possessable(brass_goggles).
item_tag(brass_goggles, steampunk).
item_tag(brass_goggles, protective).

%% Clockwork Key
item(clockwork_key, 'Clockwork Key', tool).
item_description(clockwork_key, 'A precisely machined winding key used to start and maintain clockwork mechanisms of all sizes.').
item_value(clockwork_key, 10).
item_sell_value(clockwork_key, 5).
item_weight(clockwork_key, 0.2).
item_rarity(clockwork_key, common).
item_category(clockwork_key, tool).
item_stackable(clockwork_key).
item_tradeable(clockwork_key).
item_possessable(clockwork_key).
item_tag(clockwork_key, mechanical).
item_tag(clockwork_key, tool).

%% Steam Pistol
item(steam_pistol, 'Steam Pistol', weapon).
item_description(steam_pistol, 'A compact sidearm powered by a pressurized steam capsule. Fires superheated vapor bolts at short range.').
item_value(steam_pistol, 120).
item_sell_value(steam_pistol, 60).
item_weight(steam_pistol, 1.5).
item_rarity(steam_pistol, uncommon).
item_category(steam_pistol, weapon).
item_tradeable(steam_pistol).
item_possessable(steam_pistol).
item_tag(steam_pistol, weapon).
item_tag(steam_pistol, steam_tech).

%% Brass Gears (Assorted)
item(brass_gears, 'Brass Gears', material).
item_description(brass_gears, 'An assortment of precision-cut brass gears in various sizes. The currency of every inventor and tinkerer.').
item_value(brass_gears, 5).
item_sell_value(brass_gears, 3).
item_weight(brass_gears, 0.8).
item_rarity(brass_gears, common).
item_category(brass_gears, crafting).
item_stackable(brass_gears).
item_tradeable(brass_gears).
item_possessable(brass_gears).
item_tag(brass_gears, crafting).
item_tag(brass_gears, mechanical).

%% Aether Crystal
item(aether_crystal, 'Aether Crystal', material).
item_description(aether_crystal, 'A translucent violet crystal that hums with stored aetheric energy. Used to power advanced devices and airship engines.').
item_value(aether_crystal, 200).
item_sell_value(aether_crystal, 120).
item_weight(aether_crystal, 0.3).
item_rarity(aether_crystal, rare).
item_category(aether_crystal, crafting).
item_tradeable(aether_crystal).
item_possessable(aether_crystal).
item_tag(aether_crystal, aether).
item_tag(aether_crystal, power_source).

%% Copper Piping
item(copper_piping, 'Copper Piping', material).
item_description(copper_piping, 'Lengths of polished copper pipe used in steam conduits, boiler repair, and workshop construction.').
item_value(copper_piping, 8).
item_sell_value(copper_piping, 4).
item_weight(copper_piping, 2).
item_rarity(copper_piping, common).
item_category(copper_piping, crafting).
item_stackable(copper_piping).
item_tradeable(copper_piping).
item_possessable(copper_piping).
item_tag(copper_piping, crafting).
item_tag(copper_piping, plumbing).

%% Pressure Gauge
item(pressure_gauge, 'Pressure Gauge', tool).
item_description(pressure_gauge, 'A delicate dial instrument for measuring steam pressure in boilers and engines. Prevents catastrophic overpressure.').
item_value(pressure_gauge, 25).
item_sell_value(pressure_gauge, 12).
item_weight(pressure_gauge, 0.4).
item_rarity(pressure_gauge, uncommon).
item_category(pressure_gauge, tool).
item_tradeable(pressure_gauge).
item_possessable(pressure_gauge).
item_tag(pressure_gauge, tool).
item_tag(pressure_gauge, safety).

%% Tinker Toolkit
item(tinker_toolkit, 'Tinker Toolkit', tool).
item_description(tinker_toolkit, 'A leather roll containing precision screwdrivers, tweezers, calipers, and miniature wrenches for delicate clockwork.').
item_value(tinker_toolkit, 35).
item_sell_value(tinker_toolkit, 18).
item_weight(tinker_toolkit, 1.5).
item_rarity(tinker_toolkit, uncommon).
item_category(tinker_toolkit, tool).
item_tradeable(tinker_toolkit).
item_possessable(tinker_toolkit).
item_tag(tinker_toolkit, crafting).
item_tag(tinker_toolkit, mechanical).

%% Top Hat
item(top_hat, 'Top Hat', equipment).
item_description(top_hat, 'A fine felt top hat with brass trim and a small gear ornament. The mark of a proper citizen of Ironhaven.').
item_value(top_hat, 20).
item_sell_value(top_hat, 10).
item_weight(top_hat, 0.5).
item_rarity(top_hat, common).
item_category(top_hat, clothing).
item_tradeable(top_hat).
item_possessable(top_hat).
item_tag(top_hat, clothing).
item_tag(top_hat, fashion).

%% Airship Ticket
item(airship_ticket, 'Airship Ticket', consumable).
item_description(airship_ticket, 'A stamped boarding pass for passage on a commercial airship between settlements.').
item_value(airship_ticket, 30).
item_sell_value(airship_ticket, 15).
item_weight(airship_ticket, 0).
item_rarity(airship_ticket, common).
item_category(airship_ticket, transport).
item_stackable(airship_ticket).
item_tradeable(airship_ticket).
item_possessable(airship_ticket).
item_tag(airship_ticket, transport).
item_tag(airship_ticket, travel).

%% Pocket Watch
item(pocket_watch, 'Pocket Watch', accessory).
item_description(pocket_watch, 'A finely crafted silver pocket watch with exposed gears visible through the glass back.').
item_value(pocket_watch, 40).
item_sell_value(pocket_watch, 22).
item_weight(pocket_watch, 0.2).
item_rarity(pocket_watch, uncommon).
item_category(pocket_watch, accessory).
item_tradeable(pocket_watch).
item_possessable(pocket_watch).
item_tag(pocket_watch, accessory).
item_tag(pocket_watch, timekeeping).

%% Coal Briquettes
item(coal_briquettes, 'Coal Briquettes', consumable).
item_description(coal_briquettes, 'Compressed blocks of high-grade coal. The lifeblood of every steam engine and boiler in the republic.').
item_value(coal_briquettes, 3).
item_sell_value(coal_briquettes, 1).
item_weight(coal_briquettes, 5).
item_rarity(coal_briquettes, common).
item_category(coal_briquettes, fuel).
item_stackable(coal_briquettes).
item_tradeable(coal_briquettes).
item_possessable(coal_briquettes).
item_tag(coal_briquettes, fuel).
item_tag(coal_briquettes, industrial).

%% Blueprint Scroll
item(blueprint_scroll, 'Blueprint Scroll', tool).
item_description(blueprint_scroll, 'A rolled parchment with detailed technical schematics for a clockwork device. Each scroll contains a unique design.').
item_value(blueprint_scroll, 50).
item_sell_value(blueprint_scroll, 25).
item_weight(blueprint_scroll, 0.2).
item_rarity(blueprint_scroll, uncommon).
item_category(blueprint_scroll, crafting).
item_tradeable(blueprint_scroll).
item_possessable(blueprint_scroll).
item_tag(blueprint_scroll, crafting).
item_tag(blueprint_scroll, knowledge).

%% Automaton Servo
item(automaton_servo, 'Automaton Servo', material).
item_description(automaton_servo, 'A self-contained mechanical actuator used as a joint in automaton construction. Requires an aether crystal to operate.').
item_value(automaton_servo, 75).
item_sell_value(automaton_servo, 40).
item_weight(automaton_servo, 1).
item_rarity(automaton_servo, rare).
item_category(automaton_servo, crafting).
item_tradeable(automaton_servo).
item_possessable(automaton_servo).
item_tag(automaton_servo, automaton).
item_tag(automaton_servo, mechanical).

%% Leather Flight Jacket
item(flight_jacket, 'Leather Flight Jacket', equipment).
item_description(flight_jacket, 'A heavy leather jacket lined with wool, worn by airship crews against the biting winds at altitude.').
item_value(flight_jacket, 45).
item_sell_value(flight_jacket, 22).
item_weight(flight_jacket, 3).
item_rarity(flight_jacket, common).
item_category(flight_jacket, clothing).
item_tradeable(flight_jacket).
item_possessable(flight_jacket).
item_tag(flight_jacket, clothing).
item_tag(flight_jacket, airship).

%% Smelling Salts
item(smelling_salts, 'Smelling Salts', consumable).
item_description(smelling_salts, 'A small vial of ammonium carbonate crystals used to revive those who faint from steam exposure or shock.').
item_value(smelling_salts, 5).
item_sell_value(smelling_salts, 2).
item_weight(smelling_salts, 0.1).
item_rarity(smelling_salts, common).
item_category(smelling_salts, health).
item_stackable(smelling_salts).
item_tradeable(smelling_salts).
item_possessable(smelling_salts).
item_tag(smelling_salts, health).
item_tag(smelling_salts, medical).

%% Gyroscopic Compass
item(gyro_compass, 'Gyroscopic Compass', tool).
item_description(gyro_compass, 'A brass-cased navigation instrument that maintains true north regardless of magnetic interference from steam engines.').
item_value(gyro_compass, 60).
item_sell_value(gyro_compass, 30).
item_weight(gyro_compass, 0.5).
item_rarity(gyro_compass, uncommon).
item_category(gyro_compass, navigation).
item_tradeable(gyro_compass).
item_possessable(gyro_compass).
item_tag(gyro_compass, navigation).
item_tag(gyro_compass, airship).

%% Aether Lantern
item(aether_lantern, 'Aether Lantern', tool).
item_description(aether_lantern, 'A small lantern powered by a sliver of aether crystal. Emits a steady violet glow without flame or fuel.').
item_value(aether_lantern, 30).
item_sell_value(aether_lantern, 15).
item_weight(aether_lantern, 0.8).
item_rarity(aether_lantern, uncommon).
item_category(aether_lantern, light_source).
item_tradeable(aether_lantern).
item_possessable(aether_lantern).
item_tag(aether_lantern, aether).
item_tag(aether_lantern, utility).

%% Riveted Wrench
item(riveted_wrench, 'Riveted Wrench', tool).
item_description(riveted_wrench, 'A heavy-duty adjustable wrench reinforced with brass rivets. Standard issue for boiler workers and mechanics.').
item_value(riveted_wrench, 12).
item_sell_value(riveted_wrench, 6).
item_weight(riveted_wrench, 1.2).
item_rarity(riveted_wrench, common).
item_category(riveted_wrench, tool).
item_tradeable(riveted_wrench).
item_possessable(riveted_wrench).
item_tag(riveted_wrench, tool).
item_tag(riveted_wrench, mechanical).

%% Pneumatic Tube Message
item(pneumatic_message, 'Pneumatic Tube Message', consumable).
item_description(pneumatic_message, 'A sealed brass canister containing a written message, designed to be sent through the city pneumatic tube network.').
item_value(pneumatic_message, 2).
item_sell_value(pneumatic_message, 1).
item_weight(pneumatic_message, 0.1).
item_rarity(pneumatic_message, common).
item_category(pneumatic_message, communication).
item_stackable(pneumatic_message).
item_tradeable(pneumatic_message).
item_possessable(pneumatic_message).
item_tag(pneumatic_message, communication).
item_tag(pneumatic_message, steampunk).
