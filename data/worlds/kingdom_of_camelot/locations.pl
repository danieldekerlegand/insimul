%% Insimul Locations (Lots): Kingdom of Camelot
%% Source: data/worlds/kingdom_of_camelot/locations.pl
%% Created: 2026-04-03
%% Total: 28 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% ═══════════════════════════════════════════════════════════
%% Camelot Castle District
%% ═══════════════════════════════════════════════════════════

%% 1 Kings Way -- The Great Hall
lot(lot_cam_1, '1 Kings Way', camelot_castle).
lot_type(lot_cam_1, buildable).
lot_district(lot_cam_1, castle_district).
lot_street(lot_cam_1, kings_way).
lot_side(lot_cam_1, left).
lot_house_number(lot_cam_1, 1).
building(lot_cam_1, government, great_hall).
business(lot_cam_1, 'The Great Hall', throne_room).
business_founded(lot_cam_1, 1170).

%% 2 Kings Way -- The Round Table Hall
lot(lot_cam_2, '2 Kings Way', camelot_castle).
lot_type(lot_cam_2, buildable).
lot_district(lot_cam_2, castle_district).
lot_street(lot_cam_2, kings_way).
lot_side(lot_cam_2, right).
lot_house_number(lot_cam_2, 2).
building(lot_cam_2, government, council_hall).
business(lot_cam_2, 'The Round Table Hall', council_chamber).
business_founded(lot_cam_2, 1185).

%% 3 Kings Way -- Royal Quarters
lot(lot_cam_3, '3 Kings Way', camelot_castle).
lot_type(lot_cam_3, buildable).
lot_district(lot_cam_3, castle_district).
lot_street(lot_cam_3, kings_way).
lot_side(lot_cam_3, left).
lot_house_number(lot_cam_3, 3).
building(lot_cam_3, residential, royal_quarters).

%% 4 Kings Way -- Castle Chapel
lot(lot_cam_4, '4 Kings Way', camelot_castle).
lot_type(lot_cam_4, buildable).
lot_district(lot_cam_4, castle_district).
lot_street(lot_cam_4, kings_way).
lot_side(lot_cam_4, right).
lot_house_number(lot_cam_4, 4).
building(lot_cam_4, religious, chapel).
business(lot_cam_4, 'Chapel of the Holy Light', chapel).
business_founded(lot_cam_4, 1172).

%% 5 Kings Way -- The Castle Armory
lot(lot_cam_5, '5 Kings Way', camelot_castle).
lot_type(lot_cam_5, buildable).
lot_district(lot_cam_5, castle_district).
lot_street(lot_cam_5, kings_way).
lot_side(lot_cam_5, left).
lot_house_number(lot_cam_5, 5).
building(lot_cam_5, military, armory).
business(lot_cam_5, 'The Castle Armory', armory).
business_founded(lot_cam_5, 1175).

%% ═══════════════════════════════════════════════════════════
%% Knights Quarter
%% ═══════════════════════════════════════════════════════════

%% 1 Lance Road -- Knights Barracks
lot(lot_cam_6, '1 Lance Road', camelot_castle).
lot_type(lot_cam_6, buildable).
lot_district(lot_cam_6, knights_quarter).
lot_street(lot_cam_6, lance_road).
lot_side(lot_cam_6, left).
lot_house_number(lot_cam_6, 1).
building(lot_cam_6, military, barracks).
business(lot_cam_6, 'Knights Barracks', barracks).
business_founded(lot_cam_6, 1180).

%% 2 Lance Road -- Jousting Fields
lot(lot_cam_7, '2 Lance Road', camelot_castle).
lot_type(lot_cam_7, buildable).
lot_district(lot_cam_7, knights_quarter).
lot_street(lot_cam_7, lance_road).
lot_side(lot_cam_7, right).
lot_house_number(lot_cam_7, 2).
building(lot_cam_7, recreation, jousting_field).
business(lot_cam_7, 'The Jousting Fields', tournament_grounds).
business_founded(lot_cam_7, 1182).

%% 3 Lance Road -- Training Grounds
lot(lot_cam_8, '3 Lance Road', camelot_castle).
lot_type(lot_cam_8, buildable).
lot_district(lot_cam_8, knights_quarter).
lot_street(lot_cam_8, lance_road).
lot_side(lot_cam_8, left).
lot_house_number(lot_cam_8, 3).
building(lot_cam_8, military, training_yard).
business(lot_cam_8, 'The Training Grounds', training_yard).
business_founded(lot_cam_8, 1178).

%% 4 Lance Road -- Stable of the Crown
lot(lot_cam_9, '4 Lance Road', camelot_castle).
lot_type(lot_cam_9, buildable).
lot_district(lot_cam_9, knights_quarter).
lot_street(lot_cam_9, lance_road).
lot_side(lot_cam_9, right).
lot_house_number(lot_cam_9, 4).
building(lot_cam_9, business, stable).
business(lot_cam_9, 'Stable of the Crown', stable).
business_founded(lot_cam_9, 1176).

%% ═══════════════════════════════════════════════════════════
%% Town Market District
%% ═══════════════════════════════════════════════════════════

%% 1 Market Street -- The Crossed Swords Tavern
lot(lot_cam_10, '1 Market Street', camelot_castle).
lot_type(lot_cam_10, buildable).
lot_district(lot_cam_10, market_district).
lot_street(lot_cam_10, market_street).
lot_side(lot_cam_10, left).
lot_house_number(lot_cam_10, 1).
building(lot_cam_10, business, tavern).
business(lot_cam_10, 'The Crossed Swords Tavern', tavern).
business_founded(lot_cam_10, 1188).

%% 2 Market Street -- Ironheart Smithy
lot(lot_cam_11, '2 Market Street', camelot_castle).
lot_type(lot_cam_11, buildable).
lot_district(lot_cam_11, market_district).
lot_street(lot_cam_11, market_street).
lot_side(lot_cam_11, right).
lot_house_number(lot_cam_11, 2).
building(lot_cam_11, business, blacksmith).
business(lot_cam_11, 'Ironheart Smithy', blacksmith).
business_founded(lot_cam_11, 1180).

%% 3 Market Street -- The Apothecary
lot(lot_cam_12, '3 Market Street', camelot_castle).
lot_type(lot_cam_12, buildable).
lot_district(lot_cam_12, market_district).
lot_street(lot_cam_12, market_street).
lot_side(lot_cam_12, left).
lot_house_number(lot_cam_12, 3).
building(lot_cam_12, business, apothecary).
business(lot_cam_12, 'The Apothecary', apothecary).
business_founded(lot_cam_12, 1185).

%% 4 Market Street -- The Bakers Hearth
lot(lot_cam_13, '4 Market Street', camelot_castle).
lot_type(lot_cam_13, buildable).
lot_district(lot_cam_13, market_district).
lot_street(lot_cam_13, market_street).
lot_side(lot_cam_13, right).
lot_house_number(lot_cam_13, 4).
building(lot_cam_13, business, bakery).
business(lot_cam_13, 'The Bakers Hearth', bakery).
business_founded(lot_cam_13, 1190).

%% 5 Market Street -- The Weavers Loom
lot(lot_cam_14, '5 Market Street', camelot_castle).
lot_type(lot_cam_14, buildable).
lot_district(lot_cam_14, market_district).
lot_street(lot_cam_14, market_street).
lot_side(lot_cam_14, left).
lot_house_number(lot_cam_14, 5).
building(lot_cam_14, business, weaver).
business(lot_cam_14, 'The Weavers Loom', weaver).
business_founded(lot_cam_14, 1186).

%% 6 Market Street -- Town Well and Square
lot(lot_cam_15, '6 Market Street', camelot_castle).
lot_type(lot_cam_15, buildable).
lot_district(lot_cam_15, market_district).
lot_street(lot_cam_15, market_street).
lot_side(lot_cam_15, right).
lot_house_number(lot_cam_15, 6).
building(lot_cam_15, public, town_square).

%% 7 Market Street -- The Merchants Guild
lot(lot_cam_16, '7 Market Street', camelot_castle).
lot_type(lot_cam_16, buildable).
lot_district(lot_cam_16, market_district).
lot_street(lot_cam_16, market_street).
lot_side(lot_cam_16, left).
lot_house_number(lot_cam_16, 7).
building(lot_cam_16, business, guild_hall).
business(lot_cam_16, 'The Merchants Guild', guild_hall).
business_founded(lot_cam_16, 1192).

%% ═══════════════════════════════════════════════════════════
%% Mystic Quarter
%% ═══════════════════════════════════════════════════════════

%% 1 Enchanter Lane -- Merlins Tower
lot(lot_cam_17, '1 Enchanter Lane', camelot_castle).
lot_type(lot_cam_17, buildable).
lot_district(lot_cam_17, mystic_quarter).
lot_street(lot_cam_17, enchanter_lane).
lot_side(lot_cam_17, left).
lot_house_number(lot_cam_17, 1).
building(lot_cam_17, residential, wizard_tower).
business(lot_cam_17, 'Merlins Tower', wizard_tower).
business_founded(lot_cam_17, 1155).

%% 2 Enchanter Lane -- The Scrying Pool
lot(lot_cam_18, '2 Enchanter Lane', camelot_castle).
lot_type(lot_cam_18, buildable).
lot_district(lot_cam_18, mystic_quarter).
lot_street(lot_cam_18, enchanter_lane).
lot_side(lot_cam_18, right).
lot_house_number(lot_cam_18, 2).
building(lot_cam_18, mystic, scrying_pool).

%% 3 Enchanter Lane -- The Alchemists Workshop
lot(lot_cam_19, '3 Enchanter Lane', camelot_castle).
lot_type(lot_cam_19, buildable).
lot_district(lot_cam_19, mystic_quarter).
lot_street(lot_cam_19, enchanter_lane).
lot_side(lot_cam_19, left).
lot_house_number(lot_cam_19, 3).
building(lot_cam_19, business, alchemy_workshop).
business(lot_cam_19, 'The Alchemists Workshop', alchemy).
business_founded(lot_cam_19, 1190).

%% 4 Enchanter Lane -- Library of Ancient Lore
lot(lot_cam_20, '4 Enchanter Lane', camelot_castle).
lot_type(lot_cam_20, buildable).
lot_district(lot_cam_20, mystic_quarter).
lot_street(lot_cam_20, enchanter_lane).
lot_side(lot_cam_20, right).
lot_house_number(lot_cam_20, 4).
building(lot_cam_20, education, library).
business(lot_cam_20, 'Library of Ancient Lore', library).
business_founded(lot_cam_20, 1160).

%% ═══════════════════════════════════════════════════════════
%% Outer Lands and Wilderness
%% ═══════════════════════════════════════════════════════════

%% 1 Lake Path -- Lake of the Lady
lot(lot_cam_21, '1 Lake Path', camelot_castle).
lot_type(lot_cam_21, wilderness).
lot_district(lot_cam_21, outer_lands).
lot_street(lot_cam_21, lake_path).
lot_side(lot_cam_21, left).
lot_house_number(lot_cam_21, 1).
building(lot_cam_21, mystic, enchanted_lake).

%% 2 Lake Path -- The Perilous Bridge
lot(lot_cam_22, '2 Lake Path', camelot_castle).
lot_type(lot_cam_22, wilderness).
lot_district(lot_cam_22, outer_lands).
lot_street(lot_cam_22, lake_path).
lot_side(lot_cam_22, right).
lot_house_number(lot_cam_22, 2).
building(lot_cam_22, landmark, bridge).

%% 3 Lake Path -- The Dark Forest Edge
lot(lot_cam_23, '3 Lake Path', camelot_castle).
lot_type(lot_cam_23, wilderness).
lot_district(lot_cam_23, outer_lands).
lot_street(lot_cam_23, lake_path).
lot_side(lot_cam_23, left).
lot_house_number(lot_cam_23, 3).
building(lot_cam_23, wilderness, dark_forest).

%% 4 Lake Path -- The Standing Stones
lot(lot_cam_24, '4 Lake Path', camelot_castle).
lot_type(lot_cam_24, wilderness).
lot_district(lot_cam_24, outer_lands).
lot_street(lot_cam_24, lake_path).
lot_side(lot_cam_24, right).
lot_house_number(lot_cam_24, 4).
building(lot_cam_24, mystic, standing_stones).

%% ═══════════════════════════════════════════════════════════
%% Sherwood Village
%% ═══════════════════════════════════════════════════════════

%% 1 Forest Road -- The Green Man Inn
lot(lot_cam_25, '1 Forest Road', village_sherwood).
lot_type(lot_cam_25, buildable).
lot_district(lot_cam_25, sherwood_center).
lot_street(lot_cam_25, forest_road).
lot_side(lot_cam_25, left).
lot_house_number(lot_cam_25, 1).
building(lot_cam_25, business, inn).
business(lot_cam_25, 'The Green Man Inn', inn).
business_founded(lot_cam_25, 1195).

%% 2 Forest Road -- Sherwood Chapel
lot(lot_cam_26, '2 Forest Road', village_sherwood).
lot_type(lot_cam_26, buildable).
lot_district(lot_cam_26, sherwood_center).
lot_street(lot_cam_26, forest_road).
lot_side(lot_cam_26, right).
lot_house_number(lot_cam_26, 2).
building(lot_cam_26, religious, chapel).
business(lot_cam_26, 'Sherwood Chapel', chapel).
business_founded(lot_cam_26, 1188).

%% 3 Forest Road -- The Outlaws Camp
lot(lot_cam_27, '3 Forest Road', village_sherwood).
lot_type(lot_cam_27, wilderness).
lot_district(lot_cam_27, sherwood_forest).
lot_street(lot_cam_27, forest_road).
lot_side(lot_cam_27, left).
lot_house_number(lot_cam_27, 3).
building(lot_cam_27, camp, outlaw_camp).

%% 4 Forest Road -- The Hidden Glade
lot(lot_cam_28, '4 Forest Road', village_sherwood).
lot_type(lot_cam_28, wilderness).
lot_district(lot_cam_28, sherwood_forest).
lot_street(lot_cam_28, forest_road).
lot_side(lot_cam_28, right).
lot_house_number(lot_cam_28, 4).
building(lot_cam_28, wilderness, hidden_glade).
