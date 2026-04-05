%% Insimul Locations (Lots): Dark Fantasy Cursed Lands
%% Source: data/worlds/dark_fantasy/locations.pl
%% Created: 2026-04-03
%% Total: 28 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% ═══════════════════════════════════════════════════════════
%% Ashenvale -- Plague Quarter
%% ═══════════════════════════════════════════════════════════

%% 2 Corpse Road -- Plague Ward
lot(lot_df_1, '2 Corpse Road', ashenvale).
lot_type(lot_df_1, buildable).
lot_district(lot_df_1, plague_quarter).
lot_street(lot_df_1, corpse_road).
lot_side(lot_df_1, left).
lot_house_number(lot_df_1, 2).
building(lot_df_1, civic, infirmary).
business(lot_df_1, 'Plague Ward', infirmary).
business_founded(lot_df_1, 815).

%% 8 Corpse Road -- Quarantine House
lot(lot_df_2, '8 Corpse Road', ashenvale).
lot_type(lot_df_2, buildable).
lot_district(lot_df_2, plague_quarter).
lot_street(lot_df_2, corpse_road).
lot_side(lot_df_2, right).
lot_house_number(lot_df_2, 8).
building(lot_df_2, civic, quarantine).

%% 14 Corpse Road -- Bonfire Pit (mass cremation site)
lot(lot_df_3, '14 Corpse Road', ashenvale).
lot_type(lot_df_3, buildable).
lot_district(lot_df_3, plague_quarter).
lot_street(lot_df_3, corpse_road).
lot_side(lot_df_3, left).
lot_house_number(lot_df_3, 14).
building(lot_df_3, civic, crematorium).

%% 4 Pyre Lane -- Gravedigger Hovel
lot(lot_df_4, '4 Pyre Lane', ashenvale).
lot_type(lot_df_4, buildable).
lot_district(lot_df_4, plague_quarter).
lot_street(lot_df_4, pyre_lane).
lot_side(lot_df_4, left).
lot_house_number(lot_df_4, 4).
building(lot_df_4, residence, hovel).

%% 10 Pyre Lane -- Corpse Cart Depot
lot(lot_df_5, '10 Pyre Lane', ashenvale).
lot_type(lot_df_5, buildable).
lot_district(lot_df_5, plague_quarter).
lot_street(lot_df_5, pyre_lane).
lot_side(lot_df_5, right).
lot_house_number(lot_df_5, 10).
building(lot_df_5, business, stable).
business(lot_df_5, 'Corpse Cart Depot', stable).
business_founded(lot_df_5, 818).

%% ═══════════════════════════════════════════════════════════
%% Ashenvale -- Sanctum Ward
%% ═══════════════════════════════════════════════════════════

%% 3 Vigil Street -- Cathedral of Ashes
lot(lot_df_6, '3 Vigil Street', ashenvale).
lot_type(lot_df_6, buildable).
lot_district(lot_df_6, sanctum_ward).
lot_street(lot_df_6, vigil_street).
lot_side(lot_df_6, left).
lot_house_number(lot_df_6, 3).
building(lot_df_6, civic, cathedral).

%% 9 Vigil Street -- Exorcist Lodge
lot(lot_df_7, '9 Vigil Street', ashenvale).
lot_type(lot_df_7, buildable).
lot_district(lot_df_7, sanctum_ward).
lot_street(lot_df_7, vigil_street).
lot_side(lot_df_7, right).
lot_house_number(lot_df_7, 9).
building(lot_df_7, business, guild_hall).
business(lot_df_7, 'Exorcist Lodge', guild_hall).
business_founded(lot_df_7, 840).

%% 15 Vigil Street -- Apothecary
lot(lot_df_8, '15 Vigil Street', ashenvale).
lot_type(lot_df_8, buildable).
lot_district(lot_df_8, sanctum_ward).
lot_street(lot_df_8, vigil_street).
lot_side(lot_df_8, left).
lot_house_number(lot_df_8, 15).
building(lot_df_8, business, apothecary).
business(lot_df_8, 'Mortar and Pestle', apothecary).
business_founded(lot_df_8, 850).

%% 5 Censer Walk -- Reliquary
lot(lot_df_9, '5 Censer Walk', ashenvale).
lot_type(lot_df_9, buildable).
lot_district(lot_df_9, sanctum_ward).
lot_street(lot_df_9, censer_walk).
lot_side(lot_df_9, left).
lot_house_number(lot_df_9, 5).
building(lot_df_9, business, shop).
business(lot_df_9, 'Reliquary of Saint Aldric', shop).
business_founded(lot_df_9, 838).

%% 11 Censer Walk -- Warden Barracks
lot(lot_df_10, '11 Censer Walk', ashenvale).
lot_type(lot_df_10, buildable).
lot_district(lot_df_10, sanctum_ward).
lot_street(lot_df_10, censer_walk).
lot_side(lot_df_10, right).
lot_house_number(lot_df_10, 11).
building(lot_df_10, civic, barracks).

%% 17 Censer Walk -- Residence (clergy quarters)
lot(lot_df_11, '17 Censer Walk', ashenvale).
lot_type(lot_df_11, buildable).
lot_district(lot_df_11, sanctum_ward).
lot_street(lot_df_11, censer_walk).
lot_side(lot_df_11, left).
lot_house_number(lot_df_11, 17).
building(lot_df_11, residence, house).

%% ═══════════════════════════════════════════════════════════
%% Ashenvale -- Ashen Market
%% ═══════════════════════════════════════════════════════════

%% 2 Barter Row -- Cursed Curios (black market dealer)
lot(lot_df_12, '2 Barter Row', ashenvale).
lot_type(lot_df_12, buildable).
lot_district(lot_df_12, ashen_market).
lot_street(lot_df_12, barter_row).
lot_side(lot_df_12, left).
lot_house_number(lot_df_12, 2).
building(lot_df_12, business, shop).
business(lot_df_12, 'Cursed Curios', shop).
business_founded(lot_df_12, 860).

%% 8 Barter Row -- Tavern of the Hanged Man
lot(lot_df_13, '8 Barter Row', ashenvale).
lot_type(lot_df_13, buildable).
lot_district(lot_df_13, ashen_market).
lot_street(lot_df_13, barter_row).
lot_side(lot_df_13, right).
lot_house_number(lot_df_13, 8).
building(lot_df_13, business, tavern).
business(lot_df_13, 'The Hanged Man', tavern).
business_founded(lot_df_13, 825).

%% 14 Barter Row -- Blacksmith
lot(lot_df_14, '14 Barter Row', ashenvale).
lot_type(lot_df_14, buildable).
lot_district(lot_df_14, ashen_market).
lot_street(lot_df_14, barter_row).
lot_side(lot_df_14, left).
lot_house_number(lot_df_14, 14).
building(lot_df_14, business, smithy).
business(lot_df_14, 'Ironveil Forge', smithy).
business_founded(lot_df_14, 822).

%% 6 Tinker Alley -- Alchemist Workshop
lot(lot_df_15, '6 Tinker Alley', ashenvale).
lot_type(lot_df_15, buildable).
lot_district(lot_df_15, ashen_market).
lot_street(lot_df_15, tinker_alley).
lot_side(lot_df_15, left).
lot_house_number(lot_df_15, 6).
building(lot_df_15, business, workshop).
business(lot_df_15, 'Distillation Chamber', workshop).
business_founded(lot_df_15, 855).

%% 12 Tinker Alley -- Residence
lot(lot_df_16, '12 Tinker Alley', ashenvale).
lot_type(lot_df_16, buildable).
lot_district(lot_df_16, ashen_market).
lot_street(lot_df_16, tinker_alley).
lot_side(lot_df_16, right).
lot_house_number(lot_df_16, 12).
building(lot_df_16, residence, house).

%% ═══════════════════════════════════════════════════════════
%% Ashenvale -- Ironbound Quarter
%% ═══════════════════════════════════════════════════════════

%% 3 Bulwark Road -- Knight Commander Quarters
lot(lot_df_17, '3 Bulwark Road', ashenvale).
lot_type(lot_df_17, buildable).
lot_district(lot_df_17, ironbound_quarter).
lot_street(lot_df_17, bulwark_road).
lot_side(lot_df_17, left).
lot_house_number(lot_df_17, 3).
building(lot_df_17, residence, manor).

%% 9 Bulwark Road -- Armory
lot(lot_df_18, '9 Bulwark Road', ashenvale).
lot_type(lot_df_18, buildable).
lot_district(lot_df_18, ironbound_quarter).
lot_street(lot_df_18, bulwark_road).
lot_side(lot_df_18, right).
lot_house_number(lot_df_18, 9).
building(lot_df_18, business, armory).
business(lot_df_18, 'Bulwark Armory', armory).
business_founded(lot_df_18, 821).

%% 15 Bulwark Road -- Residence
lot(lot_df_19, '15 Bulwark Road', ashenvale).
lot_type(lot_df_19, buildable).
lot_district(lot_df_19, ironbound_quarter).
lot_street(lot_df_19, bulwark_road).
lot_side(lot_df_19, left).
lot_house_number(lot_df_19, 15).
building(lot_df_19, residence, house).

%% ═══════════════════════════════════════════════════════════
%% Hollowmere -- Mire Edge
%% ═══════════════════════════════════════════════════════════

%% 2 Bog Path -- Witch Hut
lot(lot_df_20, '2 Bog Path', hollowmere).
lot_type(lot_df_20, buildable).
lot_district(lot_df_20, mire_edge).
lot_street(lot_df_20, bog_path).
lot_side(lot_df_20, left).
lot_house_number(lot_df_20, 2).
building(lot_df_20, residence, hut).

%% 8 Bog Path -- Cursed Well
lot(lot_df_21, '8 Bog Path', hollowmere).
lot_type(lot_df_21, buildable).
lot_district(lot_df_21, mire_edge).
lot_street(lot_df_21, bog_path).
lot_side(lot_df_21, right).
lot_house_number(lot_df_21, 8).
building(lot_df_21, civic, well).

%% 14 Bog Path -- Herbalist Shack
lot(lot_df_22, '14 Bog Path', hollowmere).
lot_type(lot_df_22, buildable).
lot_district(lot_df_22, mire_edge).
lot_street(lot_df_22, bog_path).
lot_side(lot_df_22, left).
lot_house_number(lot_df_22, 14).
building(lot_df_22, business, workshop).
business(lot_df_22, 'Mirebloom Remedies', workshop).
business_founded(lot_df_22, 800).

%% 4 Wailing Lane -- Drowned Bell Chapel
lot(lot_df_23, '4 Wailing Lane', hollowmere).
lot_type(lot_df_23, buildable).
lot_district(lot_df_23, mire_edge).
lot_street(lot_df_23, wailing_lane).
lot_side(lot_df_23, left).
lot_house_number(lot_df_23, 4).
building(lot_df_23, civic, chapel).

%% 10 Wailing Lane -- Residence
lot(lot_df_24, '10 Wailing Lane', hollowmere).
lot_type(lot_df_24, buildable).
lot_district(lot_df_24, mire_edge).
lot_street(lot_df_24, wailing_lane).
lot_side(lot_df_24, right).
lot_house_number(lot_df_24, 10).
building(lot_df_24, residence, hovel).

%% ═══════════════════════════════════════════════════════════
%% Gravenhold -- Outer Ruins / Inner Sanctum
%% ═══════════════════════════════════════════════════════════

%% 2 Shattered Avenue -- Collapsed Crypt
lot(lot_df_25, '2 Shattered Avenue', gravenhold).
lot_type(lot_df_25, buildable).
lot_district(lot_df_25, outer_ruins).
lot_street(lot_df_25, shattered_avenue).
lot_side(lot_df_25, left).
lot_house_number(lot_df_25, 2).
building(lot_df_25, civic, crypt).

%% 8 Shattered Avenue -- Bone Workshop
lot(lot_df_26, '8 Shattered Avenue', gravenhold).
lot_type(lot_df_26, buildable).
lot_district(lot_df_26, outer_ruins).
lot_street(lot_df_26, shattered_avenue).
lot_side(lot_df_26, right).
lot_house_number(lot_df_26, 8).
building(lot_df_26, business, workshop).
business(lot_df_26, 'Ossuary Workshop', workshop).
business_founded(lot_df_26, 870).

%% 3 Throne Passage -- Dark Temple
lot(lot_df_27, '3 Throne Passage', gravenhold).
lot_type(lot_df_27, buildable).
lot_district(lot_df_27, inner_sanctum).
lot_street(lot_df_27, throne_passage).
lot_side(lot_df_27, left).
lot_house_number(lot_df_27, 3).
building(lot_df_27, civic, temple).

%% 9 Throne Passage -- Throne Chamber
lot(lot_df_28, '9 Throne Passage', gravenhold).
lot_type(lot_df_28, buildable).
lot_district(lot_df_28, inner_sanctum).
lot_street(lot_df_28, throne_passage).
lot_side(lot_df_28, right).
lot_house_number(lot_df_28, 9).
building(lot_df_28, civic, throne_room).
