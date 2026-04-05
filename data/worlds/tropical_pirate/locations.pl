%% Insimul Locations (Lots): Tropical Pirate
%% Source: data/worlds/tropical_pirate/locations.pl
%% Created: 2026-04-03
%% Total: 28 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% ═══════════════════════════════════════════════════════════
%% Port Royal — Harbor District
%% ═══════════════════════════════════════════════════════════

%% 1 Wharf Street — Main Docks
lot(lot_pr_1, '1 Wharf Street', port_royal).
lot_type(lot_pr_1, buildable).
lot_district(lot_pr_1, harbor_district).
lot_street(lot_pr_1, wharf_street).
lot_side(lot_pr_1, left).
lot_house_number(lot_pr_1, 1).
building(lot_pr_1, civic, docks).

%% 5 Wharf Street — Shipwright Workshop
lot(lot_pr_2, '5 Wharf Street', port_royal).
lot_type(lot_pr_2, buildable).
lot_district(lot_pr_2, harbor_district).
lot_street(lot_pr_2, wharf_street).
lot_side(lot_pr_2, right).
lot_house_number(lot_pr_2, 5).
building(lot_pr_2, business, shipwright).
business(lot_pr_2, 'Barnacle Bill Shipwright', shipwright).
business_founded(lot_pr_2, 1662).

%% 12 Wharf Street — Chandlery (Ship Supplies)
lot(lot_pr_3, '12 Wharf Street', port_royal).
lot_type(lot_pr_3, buildable).
lot_district(lot_pr_3, harbor_district).
lot_street(lot_pr_3, wharf_street).
lot_side(lot_pr_3, left).
lot_house_number(lot_pr_3, 12).
building(lot_pr_3, business, shop).
business(lot_pr_3, 'Sea Dog Chandlery', shop).
business_founded(lot_pr_3, 1670).

%% 20 Wharf Street — Harbor Master Office
lot(lot_pr_4, '20 Wharf Street', port_royal).
lot_type(lot_pr_4, buildable).
lot_district(lot_pr_4, harbor_district).
lot_street(lot_pr_4, wharf_street).
lot_side(lot_pr_4, right).
lot_house_number(lot_pr_4, 20).
building(lot_pr_4, civic, harbor_office).

%% 3 Anchor Lane — Rope and Sail Maker
lot(lot_pr_5, '3 Anchor Lane', port_royal).
lot_type(lot_pr_5, buildable).
lot_district(lot_pr_5, harbor_district).
lot_street(lot_pr_5, anchor_lane).
lot_side(lot_pr_5, left).
lot_house_number(lot_pr_5, 3).
building(lot_pr_5, business, workshop).
business(lot_pr_5, 'Knotwork Sailmakers', workshop).
business_founded(lot_pr_5, 1665).

%% 10 Anchor Lane — Fish Market
lot(lot_pr_6, '10 Anchor Lane', port_royal).
lot_type(lot_pr_6, buildable).
lot_district(lot_pr_6, harbor_district).
lot_street(lot_pr_6, anchor_lane).
lot_side(lot_pr_6, right).
lot_house_number(lot_pr_6, 10).
building(lot_pr_6, business, market).
business(lot_pr_6, 'Dockside Fish Market', market).
business_founded(lot_pr_6, 1658).

%% ═══════════════════════════════════════════════════════════
%% Port Royal — Tavern Row
%% ═══════════════════════════════════════════════════════════

%% 2 Rum Alley — The Rusty Anchor Tavern
lot(lot_pr_7, '2 Rum Alley', port_royal).
lot_type(lot_pr_7, buildable).
lot_district(lot_pr_7, tavern_row).
lot_street(lot_pr_7, rum_alley).
lot_side(lot_pr_7, left).
lot_house_number(lot_pr_7, 2).
building(lot_pr_7, business, tavern).
business(lot_pr_7, 'The Rusty Anchor', tavern).
business_founded(lot_pr_7, 1660).

%% 8 Rum Alley — The Black Flag Inn
lot(lot_pr_8, '8 Rum Alley', port_royal).
lot_type(lot_pr_8, buildable).
lot_district(lot_pr_8, tavern_row).
lot_street(lot_pr_8, rum_alley).
lot_side(lot_pr_8, right).
lot_house_number(lot_pr_8, 8).
building(lot_pr_8, business, inn).
business(lot_pr_8, 'The Black Flag Inn', inn).
business_founded(lot_pr_8, 1663).

%% 15 Rum Alley — Gambling Den
lot(lot_pr_9, '15 Rum Alley', port_royal).
lot_type(lot_pr_9, buildable).
lot_district(lot_pr_9, tavern_row).
lot_street(lot_pr_9, rum_alley).
lot_side(lot_pr_9, left).
lot_house_number(lot_pr_9, 15).
building(lot_pr_9, business, gambling_den).
business(lot_pr_9, 'Fortune Favors', gambling_den).
business_founded(lot_pr_9, 1668).

%% 5 Cutlass Road — Blacksmith and Armory
lot(lot_pr_10, '5 Cutlass Road', port_royal).
lot_type(lot_pr_10, buildable).
lot_district(lot_pr_10, tavern_row).
lot_street(lot_pr_10, cutlass_road).
lot_side(lot_pr_10, left).
lot_house_number(lot_pr_10, 5).
building(lot_pr_10, business, blacksmith).
business(lot_pr_10, 'Ironjaw Forge', blacksmith).
business_founded(lot_pr_10, 1661).

%% 12 Cutlass Road — Tattoo Parlor
lot(lot_pr_11, '12 Cutlass Road', port_royal).
lot_type(lot_pr_11, buildable).
lot_district(lot_pr_11, tavern_row).
lot_street(lot_pr_11, cutlass_road).
lot_side(lot_pr_11, right).
lot_house_number(lot_pr_11, 12).
building(lot_pr_11, business, shop).
business(lot_pr_11, 'Inkstain Tattoos', shop).
business_founded(lot_pr_11, 1672).

%% 20 Cutlass Road — Residence (Pirate Quarters)
lot(lot_pr_12, '20 Cutlass Road', port_royal).
lot_type(lot_pr_12, buildable).
lot_district(lot_pr_12, tavern_row).
lot_street(lot_pr_12, cutlass_road).
lot_side(lot_pr_12, left).
lot_house_number(lot_pr_12, 20).
building(lot_pr_12, residence, house).

%% ═══════════════════════════════════════════════════════════
%% Port Royal — Merchant Quarter
%% ═══════════════════════════════════════════════════════════

%% 3 Gold Street — Trading Company
lot(lot_pr_13, '3 Gold Street', port_royal).
lot_type(lot_pr_13, buildable).
lot_district(lot_pr_13, merchant_quarter).
lot_street(lot_pr_13, gold_street).
lot_side(lot_pr_13, left).
lot_house_number(lot_pr_13, 3).
building(lot_pr_13, business, trading_company).
business(lot_pr_13, 'Crown and Compass Trading', trading_company).
business_founded(lot_pr_13, 1666).

%% 10 Gold Street — Apothecary
lot(lot_pr_14, '10 Gold Street', port_royal).
lot_type(lot_pr_14, buildable).
lot_district(lot_pr_14, merchant_quarter).
lot_street(lot_pr_14, gold_street).
lot_side(lot_pr_14, right).
lot_house_number(lot_pr_14, 10).
building(lot_pr_14, business, apothecary).
business(lot_pr_14, 'Surgeon Finch Apothecary', apothecary).
business_founded(lot_pr_14, 1669).

%% 18 Gold Street — Cartographer
lot(lot_pr_15, '18 Gold Street', port_royal).
lot_type(lot_pr_15, buildable).
lot_district(lot_pr_15, merchant_quarter).
lot_street(lot_pr_15, gold_street).
lot_side(lot_pr_15, left).
lot_house_number(lot_pr_15, 18).
building(lot_pr_15, business, workshop).
business(lot_pr_15, 'Stargazer Charts', workshop).
business_founded(lot_pr_15, 1671).

%% 25 Gold Street — Merchant Residence
lot(lot_pr_16, '25 Gold Street', port_royal).
lot_type(lot_pr_16, buildable).
lot_district(lot_pr_16, merchant_quarter).
lot_street(lot_pr_16, gold_street).
lot_side(lot_pr_16, right).
lot_house_number(lot_pr_16, 25).
building(lot_pr_16, residence, house).

%% 5 Silk Lane — Tailor and Clothier
lot(lot_pr_17, '5 Silk Lane', port_royal).
lot_type(lot_pr_17, buildable).
lot_district(lot_pr_17, merchant_quarter).
lot_street(lot_pr_17, silk_lane).
lot_side(lot_pr_17, left).
lot_house_number(lot_pr_17, 5).
building(lot_pr_17, business, tailor).
business(lot_pr_17, 'Silken Thread Clothier', tailor).
business_founded(lot_pr_17, 1667).

%% 12 Silk Lane — Jeweler and Fence
lot(lot_pr_18, '12 Silk Lane', port_royal).
lot_type(lot_pr_18, buildable).
lot_district(lot_pr_18, merchant_quarter).
lot_street(lot_pr_18, silk_lane).
lot_side(lot_pr_18, right).
lot_house_number(lot_pr_18, 12).
building(lot_pr_18, business, shop).
business(lot_pr_18, 'Gilded Parrot Jewelers', shop).
business_founded(lot_pr_18, 1674).

%% ═══════════════════════════════════════════════════════════
%% Isla Tortuga
%% ═══════════════════════════════════════════════════════════

%% 1 Driftwood Path — Open-Air Tavern
lot(lot_it_1, '1 Driftwood Path', isla_tortuga).
lot_type(lot_it_1, buildable).
lot_district(lot_it_1, beach_camp).
lot_street(lot_it_1, driftwood_path).
lot_side(lot_it_1, left).
lot_house_number(lot_it_1, 1).
building(lot_it_1, business, tavern).
business(lot_it_1, 'The Beached Whale', tavern).
business_founded(lot_it_1, 1648).

%% 6 Driftwood Path — Smuggler Warehouse
lot(lot_it_2, '6 Driftwood Path', isla_tortuga).
lot_type(lot_it_2, buildable).
lot_district(lot_it_2, beach_camp).
lot_street(lot_it_2, driftwood_path).
lot_side(lot_it_2, right).
lot_house_number(lot_it_2, 6).
building(lot_it_2, business, warehouse).
business(lot_it_2, 'No Questions Warehouse', warehouse).
business_founded(lot_it_2, 1652).

%% 3 Bonfire Trail — Pirate Camp
lot(lot_it_3, '3 Bonfire Trail', isla_tortuga).
lot_type(lot_it_3, buildable).
lot_district(lot_it_3, beach_camp).
lot_street(lot_it_3, bonfire_trail).
lot_side(lot_it_3, left).
lot_house_number(lot_it_3, 3).
building(lot_it_3, residence, camp).

%% 2 Smuggler Pass — Treasure Cave
lot(lot_it_4, '2 Smuggler Pass', isla_tortuga).
lot_type(lot_it_4, buildable).
lot_district(lot_it_4, cliff_caves).
lot_street(lot_it_4, smuggler_pass).
lot_side(lot_it_4, left).
lot_house_number(lot_it_4, 2).
building(lot_it_4, special, treasure_cave).

%% 8 Smuggler Pass — Hidden Cove
lot(lot_it_5, '8 Smuggler Pass', isla_tortuga).
lot_type(lot_it_5, buildable).
lot_district(lot_it_5, cliff_caves).
lot_street(lot_it_5, smuggler_pass).
lot_side(lot_it_5, right).
lot_house_number(lot_it_5, 8).
building(lot_it_5, special, hidden_cove).

%% ═══════════════════════════════════════════════════════════
%% San Castillo
%% ═══════════════════════════════════════════════════════════

%% 1 Governor Road — Governor Mansion
lot(lot_sc_1, '1 Governor Road', san_castillo).
lot_type(lot_sc_1, buildable).
lot_district(lot_sc_1, fort_district).
lot_street(lot_sc_1, governor_road).
lot_side(lot_sc_1, left).
lot_house_number(lot_sc_1, 1).
building(lot_sc_1, civic, mansion).

%% 8 Governor Road — Military Barracks
lot(lot_sc_2, '8 Governor Road', san_castillo).
lot_type(lot_sc_2, buildable).
lot_district(lot_sc_2, fort_district).
lot_street(lot_sc_2, governor_road).
lot_side(lot_sc_2, right).
lot_house_number(lot_sc_2, 8).
building(lot_sc_2, civic, barracks).

%% 3 Cannon Walk — Armory
lot(lot_sc_3, '3 Cannon Walk', san_castillo).
lot_type(lot_sc_3, buildable).
lot_district(lot_sc_3, fort_district).
lot_street(lot_sc_3, cannon_walk).
lot_side(lot_sc_3, left).
lot_house_number(lot_sc_3, 3).
building(lot_sc_3, civic, armory).

%% 5 Fishmarket Lane — Dockside Market
lot(lot_sc_4, '5 Fishmarket Lane', san_castillo).
lot_type(lot_sc_4, buildable).
lot_district(lot_sc_4, dockside).
lot_street(lot_sc_4, fishmarket_lane).
lot_side(lot_sc_4, left).
lot_house_number(lot_sc_4, 5).
building(lot_sc_4, business, market).
business(lot_sc_4, 'San Castillo Fish Market', market).
business_founded(lot_sc_4, 1592).

%% 12 Fishmarket Lane — Colonial Tavern
lot(lot_sc_5, '12 Fishmarket Lane', san_castillo).
lot_type(lot_sc_5, buildable).
lot_district(lot_sc_5, dockside).
lot_street(lot_sc_5, fishmarket_lane).
lot_side(lot_sc_5, right).
lot_house_number(lot_sc_5, 12).
building(lot_sc_5, business, tavern).
business(lot_sc_5, 'La Corona Tavern', tavern).
business_founded(lot_sc_5, 1605).
