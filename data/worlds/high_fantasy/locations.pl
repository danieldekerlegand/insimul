%% Insimul Locations (Lots): High Fantasy
%% Source: data/worlds/high_fantasy/locations.pl
%% Created: 2026-04-03
%% Total: 30 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% ═══════════════════════════════════════════════════════════
%% Aelindor -- Elven Capital
%% ═══════════════════════════════════════════════════════════

%% 1 Moonpath -- Palace of the Elven King
lot(lot_hf_1, '1 Moonpath', aelindor).
lot_type(lot_hf_1, buildable).
lot_district(lot_hf_1, starlight_quarter).
lot_street(lot_hf_1, moonpath).
lot_side(lot_hf_1, left).
lot_house_number(lot_hf_1, 1).
building(lot_hf_1, civic, palace).

%% 5 Moonpath -- Temple of the Moon
lot(lot_hf_2, '5 Moonpath', aelindor).
lot_type(lot_hf_2, buildable).
lot_district(lot_hf_2, starlight_quarter).
lot_street(lot_hf_2, moonpath).
lot_side(lot_hf_2, right).
lot_house_number(lot_hf_2, 5).
building(lot_hf_2, civic, temple).

%% 10 Moonpath -- Starlight Residence
lot(lot_hf_3, '10 Moonpath', aelindor).
lot_type(lot_hf_3, buildable).
lot_district(lot_hf_3, starlight_quarter).
lot_street(lot_hf_3, moonpath).
lot_side(lot_hf_3, left).
lot_house_number(lot_hf_3, 10).
building(lot_hf_3, residence, manor).

%% 3 Silverbough Lane -- Elven Apothecary
lot(lot_hf_4, '3 Silverbough Lane', aelindor).
lot_type(lot_hf_4, buildable).
lot_district(lot_hf_4, starlight_quarter).
lot_street(lot_hf_4, silverbough_lane).
lot_side(lot_hf_4, left).
lot_house_number(lot_hf_4, 3).
building(lot_hf_4, business, apothecary).
business(lot_hf_4, 'Silverbough Remedies', apothecary).
business_founded(lot_hf_4, -2100).

%% 8 Silverbough Lane -- Elven Residence
lot(lot_hf_5, '8 Silverbough Lane', aelindor).
lot_type(lot_hf_5, buildable).
lot_district(lot_hf_5, starlight_quarter).
lot_street(lot_hf_5, silverbough_lane).
lot_side(lot_hf_5, right).
lot_house_number(lot_hf_5, 8).
building(lot_hf_5, residence, treehouse).

%% 1 Spellwright Row -- Arcane Academy
lot(lot_hf_6, '1 Spellwright Row', aelindor).
lot_type(lot_hf_6, buildable).
lot_district(lot_hf_6, arcane_precinct).
lot_street(lot_hf_6, spellwright_row).
lot_side(lot_hf_6, left).
lot_house_number(lot_hf_6, 1).
building(lot_hf_6, civic, academy).
business(lot_hf_6, 'Aelindor Arcane Academy', academy).
business_founded(lot_hf_6, -3800).

%% 7 Spellwright Row -- Enchanter Workshop
lot(lot_hf_7, '7 Spellwright Row', aelindor).
lot_type(lot_hf_7, buildable).
lot_district(lot_hf_7, arcane_precinct).
lot_street(lot_hf_7, spellwright_row).
lot_side(lot_hf_7, right).
lot_house_number(lot_hf_7, 7).
building(lot_hf_7, business, workshop).
business(lot_hf_7, 'Luminara Enchantments', workshop).
business_founded(lot_hf_7, -1500).

%% 12 Spellwright Row -- Wizard Tower
lot(lot_hf_8, '12 Spellwright Row', aelindor).
lot_type(lot_hf_8, buildable).
lot_district(lot_hf_8, arcane_precinct).
lot_street(lot_hf_8, spellwright_row).
lot_side(lot_hf_8, left).
lot_house_number(lot_hf_8, 12).
building(lot_hf_8, residence, tower).

%% 3 Runestone Alley -- Scroll Scriptorium
lot(lot_hf_9, '3 Runestone Alley', aelindor).
lot_type(lot_hf_9, buildable).
lot_district(lot_hf_9, arcane_precinct).
lot_street(lot_hf_9, runestone_alley).
lot_side(lot_hf_9, left).
lot_house_number(lot_hf_9, 3).
building(lot_hf_9, business, scriptorium).
business(lot_hf_9, 'Quill and Rune Scriptorium', scriptorium).
business_founded(lot_hf_9, -2500).

%% 9 Runestone Alley -- Divination Parlor
lot(lot_hf_10, '9 Runestone Alley', aelindor).
lot_type(lot_hf_10, buildable).
lot_district(lot_hf_10, arcane_precinct).
lot_street(lot_hf_10, runestone_alley).
lot_side(lot_hf_10, right).
lot_house_number(lot_hf_10, 9).
building(lot_hf_10, business, shop).
business(lot_hf_10, 'Eye of Foresight', shop).
business_founded(lot_hf_10, -1200).

%% 2 Traders Walk -- Enchanted Goods Emporium
lot(lot_hf_11, '2 Traders Walk', aelindor).
lot_type(lot_hf_11, buildable).
lot_district(lot_hf_11, market_of_whispers).
lot_street(lot_hf_11, traders_walk).
lot_side(lot_hf_11, left).
lot_house_number(lot_hf_11, 2).
building(lot_hf_11, business, shop).
business(lot_hf_11, 'Glimmering Wares', shop).
business_founded(lot_hf_11, -900).

%% 8 Traders Walk -- Tavern of the Silver Harp
lot(lot_hf_12, '8 Traders Walk', aelindor).
lot_type(lot_hf_12, buildable).
lot_district(lot_hf_12, market_of_whispers).
lot_street(lot_hf_12, traders_walk).
lot_side(lot_hf_12, right).
lot_house_number(lot_hf_12, 8).
building(lot_hf_12, business, tavern).
business(lot_hf_12, 'Silver Harp Tavern', tavern).
business_founded(lot_hf_12, -600).

%% 14 Traders Walk -- Gemstone Dealer
lot(lot_hf_13, '14 Traders Walk', aelindor).
lot_type(lot_hf_13, buildable).
lot_district(lot_hf_13, market_of_whispers).
lot_street(lot_hf_13, traders_walk).
lot_side(lot_hf_13, left).
lot_house_number(lot_hf_13, 14).
building(lot_hf_13, business, shop).
business(lot_hf_13, 'Stargem Exchange', shop).
business_founded(lot_hf_13, -1100).

%% 1 Grove Path -- Druid Circle
lot(lot_hf_14, '1 Grove Path', aelindor).
lot_type(lot_hf_14, buildable).
lot_district(lot_hf_14, grove_ward).
lot_street(lot_hf_14, grove_path).
lot_side(lot_hf_14, left).
lot_house_number(lot_hf_14, 1).
building(lot_hf_14, civic, shrine).

%% ═══════════════════════════════════════════════════════════
%% Khazad Dumrak -- Dwarven Hold
%% ═══════════════════════════════════════════════════════════

%% 1 Anvil Road -- The Eternal Forge
lot(lot_hf_15, '1 Anvil Road', khazad_dumrak).
lot_type(lot_hf_15, buildable).
lot_district(lot_hf_15, great_forge_hall).
lot_street(lot_hf_15, anvil_road).
lot_side(lot_hf_15, left).
lot_house_number(lot_hf_15, 1).
building(lot_hf_15, business, forge).
business(lot_hf_15, 'The Eternal Forge', forge).
business_founded(lot_hf_15, -3200).

%% 6 Anvil Road -- Armor Smith
lot(lot_hf_16, '6 Anvil Road', khazad_dumrak).
lot_type(lot_hf_16, buildable).
lot_district(lot_hf_16, great_forge_hall).
lot_street(lot_hf_16, anvil_road).
lot_side(lot_hf_16, right).
lot_house_number(lot_hf_16, 6).
building(lot_hf_16, business, forge).
business(lot_hf_16, 'Ironshield Armory', forge).
business_founded(lot_hf_16, -2800).

%% 12 Anvil Road -- Dwarven Ale Hall
lot(lot_hf_17, '12 Anvil Road', khazad_dumrak).
lot_type(lot_hf_17, buildable).
lot_district(lot_hf_17, great_forge_hall).
lot_street(lot_hf_17, anvil_road).
lot_side(lot_hf_17, left).
lot_house_number(lot_hf_17, 12).
building(lot_hf_17, business, tavern).
business(lot_hf_17, 'Stonebeard Ale Hall', tavern).
business_founded(lot_hf_17, -2600).

%% 3 Runehammer Tunnel -- Rune Library
lot(lot_hf_18, '3 Runehammer Tunnel', khazad_dumrak).
lot_type(lot_hf_18, buildable).
lot_district(lot_hf_18, great_forge_hall).
lot_street(lot_hf_18, runehammer_tunnel).
lot_side(lot_hf_18, left).
lot_house_number(lot_hf_18, 3).
building(lot_hf_18, civic, library).

%% 5 Mithril Passage -- Mithril Mine Entrance
lot(lot_hf_19, '5 Mithril Passage', khazad_dumrak).
lot_type(lot_hf_19, buildable).
lot_district(lot_hf_19, deep_mines).
lot_street(lot_hf_19, mithril_passage).
lot_side(lot_hf_19, left).
lot_house_number(lot_hf_19, 5).
building(lot_hf_19, business, mine).
business(lot_hf_19, 'Deepvein Mithril Mine', mine).
business_founded(lot_hf_19, -3100).

%% 10 Mithril Passage -- Dwarven Residence
lot(lot_hf_20, '10 Mithril Passage', khazad_dumrak).
lot_type(lot_hf_20, buildable).
lot_district(lot_hf_20, deep_mines).
lot_street(lot_hf_20, mithril_passage).
lot_side(lot_hf_20, right).
lot_house_number(lot_hf_20, 10).
building(lot_hf_20, residence, stone_hall).

%% 2 Gemcutter Way -- Gemstone Workshop
lot(lot_hf_21, '2 Gemcutter Way', khazad_dumrak).
lot_type(lot_hf_21, buildable).
lot_district(lot_hf_21, merchants_gallery).
lot_street(lot_hf_21, gemcutter_way).
lot_side(lot_hf_21, left).
lot_house_number(lot_hf_21, 2).
building(lot_hf_21, business, workshop).
business(lot_hf_21, 'Brightshard Gemcutters', workshop).
business_founded(lot_hf_21, -2200).

%% 8 Gemcutter Way -- General Trade Goods
lot(lot_hf_22, '8 Gemcutter Way', khazad_dumrak).
lot_type(lot_hf_22, buildable).
lot_district(lot_hf_22, merchants_gallery).
lot_street(lot_hf_22, gemcutter_way).
lot_side(lot_hf_22, right).
lot_house_number(lot_hf_22, 8).
building(lot_hf_22, business, shop).
business(lot_hf_22, 'Deephold Trade Goods', shop).
business_founded(lot_hf_22, -2000).

%% ═══════════════════════════════════════════════════════════
%% Thornhaven -- Human Frontier Town
%% ═══════════════════════════════════════════════════════════

%% 1 Kings Road -- Castle Thornhaven
lot(lot_hf_23, '1 Kings Road', thornhaven).
lot_type(lot_hf_23, buildable).
lot_district(lot_hf_23, castle_ward).
lot_street(lot_hf_23, kings_road).
lot_side(lot_hf_23, left).
lot_house_number(lot_hf_23, 1).
building(lot_hf_23, civic, castle).

%% 5 Kings Road -- Temple of the Radiant Order
lot(lot_hf_24, '5 Kings Road', thornhaven).
lot_type(lot_hf_24, buildable).
lot_district(lot_hf_24, castle_ward).
lot_street(lot_hf_24, kings_road).
lot_side(lot_hf_24, right).
lot_house_number(lot_hf_24, 5).
building(lot_hf_24, civic, temple).

%% 10 Kings Road -- Blacksmith
lot(lot_hf_25, '10 Kings Road', thornhaven).
lot_type(lot_hf_25, buildable).
lot_district(lot_hf_25, castle_ward).
lot_street(lot_hf_25, kings_road).
lot_side(lot_hf_25, left).
lot_house_number(lot_hf_25, 10).
building(lot_hf_25, business, forge).
business(lot_hf_25, 'Steelheart Smithy', forge).
business_founded(lot_hf_25, -700).

%% 3 South Gate Way -- Adventurers Guild
lot(lot_hf_26, '3 South Gate Way', thornhaven).
lot_type(lot_hf_26, buildable).
lot_district(lot_hf_26, castle_ward).
lot_street(lot_hf_26, south_gate_way).
lot_side(lot_hf_26, left).
lot_house_number(lot_hf_26, 3).
building(lot_hf_26, business, guild_hall).
business(lot_hf_26, 'Thornhaven Adventurers Guild', guild_hall).
business_founded(lot_hf_26, -500).

%% 2 Barley Lane -- Sleeping Dragon Inn
lot(lot_hf_27, '2 Barley Lane', thornhaven).
lot_type(lot_hf_27, buildable).
lot_district(lot_hf_27, commons).
lot_street(lot_hf_27, barley_lane).
lot_side(lot_hf_27, left).
lot_house_number(lot_hf_27, 2).
building(lot_hf_27, business, inn).
business(lot_hf_27, 'The Sleeping Dragon', inn).
business_founded(lot_hf_27, -650).

%% 7 Barley Lane -- General Store
lot(lot_hf_28, '7 Barley Lane', thornhaven).
lot_type(lot_hf_28, buildable).
lot_district(lot_hf_28, commons).
lot_street(lot_hf_28, barley_lane).
lot_side(lot_hf_28, right).
lot_house_number(lot_hf_28, 7).
building(lot_hf_28, business, shop).
business(lot_hf_28, 'Barley Lane Provisions', shop).
business_founded(lot_hf_28, -600).

%% 12 Barley Lane -- Healer Cottage
lot(lot_hf_29, '12 Barley Lane', thornhaven).
lot_type(lot_hf_29, buildable).
lot_district(lot_hf_29, commons).
lot_street(lot_hf_29, barley_lane).
lot_side(lot_hf_29, left).
lot_house_number(lot_hf_29, 12).
building(lot_hf_29, business, apothecary).
business(lot_hf_29, 'Goodwife Maren Healing', apothecary).
business_founded(lot_hf_29, -550).

%% 18 Barley Lane -- Residence
lot(lot_hf_30, '18 Barley Lane', thornhaven).
lot_type(lot_hf_30, buildable).
lot_district(lot_hf_30, commons).
lot_street(lot_hf_30, barley_lane).
lot_side(lot_hf_30, right).
lot_house_number(lot_hf_30, 18).
building(lot_hf_30, residence, house).
