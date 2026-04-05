%% Insimul Locations (Lots): Cyberpunk Megacity
%% Source: data/worlds/cyberpunk/locations.pl
%% Created: 2026-04-03
%% Total: 28 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% ═══════════════════════════════════════════════════════════
%% Neon Row -- Entertainment and Vice District
%% ═══════════════════════════════════════════════════════════

%% 1 Voltage Avenue -- The Afterburner (nightclub)
lot(lot_cp_1, '1 Voltage Avenue', neo_cascade).
lot_type(lot_cp_1, buildable).
lot_district(lot_cp_1, neon_row).
lot_street(lot_cp_1, voltage_avenue).
lot_side(lot_cp_1, left).
lot_house_number(lot_cp_1, 1).
building(lot_cp_1, business, nightclub).
business(lot_cp_1, 'The Afterburner', nightclub).
business_founded(lot_cp_1, 2058).

%% 5 Voltage Avenue -- Neon Noodles (ramen bar)
lot(lot_cp_2, '5 Voltage Avenue', neo_cascade).
lot_type(lot_cp_2, buildable).
lot_district(lot_cp_2, neon_row).
lot_street(lot_cp_2, voltage_avenue).
lot_side(lot_cp_2, right).
lot_house_number(lot_cp_2, 5).
building(lot_cp_2, business, restaurant).
business(lot_cp_2, 'Neon Noodles', ramen_bar).
business_founded(lot_cp_2, 2062).

%% 12 Voltage Avenue -- Jacked Inn (flophouse hotel)
lot(lot_cp_3, '12 Voltage Avenue', neo_cascade).
lot_type(lot_cp_3, buildable).
lot_district(lot_cp_3, neon_row).
lot_street(lot_cp_3, voltage_avenue).
lot_side(lot_cp_3, left).
lot_house_number(lot_cp_3, 12).
building(lot_cp_3, business, hotel).
business(lot_cp_3, 'Jacked Inn', flophouse).
business_founded(lot_cp_3, 2055).

%% 3 Chrome Alley -- Doc Mori Ripperdoc Clinic
lot(lot_cp_4, '3 Chrome Alley', neo_cascade).
lot_type(lot_cp_4, buildable).
lot_district(lot_cp_4, neon_row).
lot_street(lot_cp_4, chrome_alley).
lot_side(lot_cp_4, left).
lot_house_number(lot_cp_4, 3).
building(lot_cp_4, business, clinic).
business(lot_cp_4, 'Doc Mori Ripperdoc Clinic', ripperdoc).
business_founded(lot_cp_4, 2060).

%% 7 Chrome Alley -- Black ICE Market (illegal tech)
lot(lot_cp_5, '7 Chrome Alley', neo_cascade).
lot_type(lot_cp_5, buildable).
lot_district(lot_cp_5, neon_row).
lot_street(lot_cp_5, chrome_alley).
lot_side(lot_cp_5, right).
lot_house_number(lot_cp_5, 7).
building(lot_cp_5, business, market).
business(lot_cp_5, 'Black ICE Market', black_market).
business_founded(lot_cp_5, 2063).

%% 2 Synapse Lane -- The Data Hole (hacker den)
lot(lot_cp_6, '2 Synapse Lane', neo_cascade).
lot_type(lot_cp_6, buildable).
lot_district(lot_cp_6, neon_row).
lot_street(lot_cp_6, synapse_lane).
lot_side(lot_cp_6, left).
lot_house_number(lot_cp_6, 2).
building(lot_cp_6, business, den).
business(lot_cp_6, 'The Data Hole', hacker_den).
business_founded(lot_cp_6, 2061).

%% 8 Synapse Lane -- Razor Lotus Tattoo Parlor
lot(lot_cp_7, '8 Synapse Lane', neo_cascade).
lot_type(lot_cp_7, buildable).
lot_district(lot_cp_7, neon_row).
lot_street(lot_cp_7, synapse_lane).
lot_side(lot_cp_7, right).
lot_house_number(lot_cp_7, 8).
building(lot_cp_7, business, tattoo_parlor).
business(lot_cp_7, 'Razor Lotus Tattoo Parlor', tattoo_parlor).
business_founded(lot_cp_7, 2057).

%% ═══════════════════════════════════════════════════════════
%% Corpo Plaza -- Corporate Towers
%% ═══════════════════════════════════════════════════════════

%% 1 Meridian Boulevard -- Arasaka-Murata Tower (megacorp HQ)
lot(lot_cp_8, '1 Meridian Boulevard', neo_cascade).
lot_type(lot_cp_8, buildable).
lot_district(lot_cp_8, corpo_plaza).
lot_street(lot_cp_8, meridian_boulevard).
lot_side(lot_cp_8, left).
lot_house_number(lot_cp_8, 1).
building(lot_cp_8, business, corporate_tower).
business(lot_cp_8, 'Arasaka-Murata Tower', megacorp_hq).
business_founded(lot_cp_8, 2046).

%% 10 Meridian Boulevard -- Nexus Dynamics Tower
lot(lot_cp_9, '10 Meridian Boulevard', neo_cascade).
lot_type(lot_cp_9, buildable).
lot_district(lot_cp_9, corpo_plaza).
lot_street(lot_cp_9, meridian_boulevard).
lot_side(lot_cp_9, right).
lot_house_number(lot_cp_9, 10).
building(lot_cp_9, business, corporate_tower).
business(lot_cp_9, 'Nexus Dynamics Tower', megacorp_hq).
business_founded(lot_cp_9, 2049).

%% 20 Meridian Boulevard -- SynthLife Biotech
lot(lot_cp_10, '20 Meridian Boulevard', neo_cascade).
lot_type(lot_cp_10, buildable).
lot_district(lot_cp_10, corpo_plaza).
lot_street(lot_cp_10, meridian_boulevard).
lot_side(lot_cp_10, left).
lot_house_number(lot_cp_10, 20).
building(lot_cp_10, business, corporate_tower).
business(lot_cp_10, 'SynthLife Biotech', biotech_corp).
business_founded(lot_cp_10, 2053).

%% 5 Tower Promenade -- The Platinum Lounge (corpo bar)
lot(lot_cp_11, '5 Tower Promenade', neo_cascade).
lot_type(lot_cp_11, buildable).
lot_district(lot_cp_11, corpo_plaza).
lot_street(lot_cp_11, tower_promenade).
lot_side(lot_cp_11, right).
lot_house_number(lot_cp_11, 5).
building(lot_cp_11, business, bar).
business(lot_cp_11, 'The Platinum Lounge', upscale_bar).
business_founded(lot_cp_11, 2055).

%% 15 Tower Promenade -- MetroSec Precinct (corporate police)
lot(lot_cp_12, '15 Tower Promenade', neo_cascade).
lot_type(lot_cp_12, buildable).
lot_district(lot_cp_12, corpo_plaza).
lot_street(lot_cp_12, tower_promenade).
lot_side(lot_cp_12, left).
lot_house_number(lot_cp_12, 15).
building(lot_cp_12, business, precinct).
business(lot_cp_12, 'MetroSec Precinct Alpha', corporate_police).
business_founded(lot_cp_12, 2047).

%% ═══════════════════════════════════════════════════════════
%% The Stacks -- Vertical Slums
%% ═══════════════════════════════════════════════════════════

%% 1 Rust Corridor -- Mama Ling Food Stall
lot(lot_cp_13, '1 Rust Corridor', neo_cascade).
lot_type(lot_cp_13, buildable).
lot_district(lot_cp_13, the_stacks).
lot_street(lot_cp_13, rust_corridor).
lot_side(lot_cp_13, left).
lot_house_number(lot_cp_13, 1).
building(lot_cp_13, business, food_stall).
business(lot_cp_13, 'Mama Ling Food Stall', street_food).
business_founded(lot_cp_13, 2056).

%% 6 Rust Corridor -- Free Clinic (underground medical)
lot(lot_cp_14, '6 Rust Corridor', neo_cascade).
lot_type(lot_cp_14, buildable).
lot_district(lot_cp_14, the_stacks).
lot_street(lot_cp_14, rust_corridor).
lot_side(lot_cp_14, right).
lot_house_number(lot_cp_14, 6).
building(lot_cp_14, business, clinic).
business(lot_cp_14, 'The Free Clinic', underground_clinic).
business_founded(lot_cp_14, 2059).

%% 14 Rust Corridor -- Stacks Bazaar (junk market)
lot(lot_cp_15, '14 Rust Corridor', neo_cascade).
lot_type(lot_cp_15, buildable).
lot_district(lot_cp_15, the_stacks).
lot_street(lot_cp_15, rust_corridor).
lot_side(lot_cp_15, left).
lot_house_number(lot_cp_15, 14).
building(lot_cp_15, business, market).
business(lot_cp_15, 'Stacks Bazaar', junk_market).
business_founded(lot_cp_15, 2054).

%% 3 Pipe Row -- Salvage Den (scrap workshop)
lot(lot_cp_16, '3 Pipe Row', neo_cascade).
lot_type(lot_cp_16, buildable).
lot_district(lot_cp_16, the_stacks).
lot_street(lot_cp_16, pipe_row).
lot_side(lot_cp_16, left).
lot_house_number(lot_cp_16, 3).
building(lot_cp_16, business, workshop).
business(lot_cp_16, 'Salvage Den', scrap_workshop).
business_founded(lot_cp_16, 2058).

%% 9 Pipe Row -- The Rusty Pipe (dive bar)
lot(lot_cp_17, '9 Pipe Row', neo_cascade).
lot_type(lot_cp_17, buildable).
lot_district(lot_cp_17, the_stacks).
lot_street(lot_cp_17, pipe_row).
lot_side(lot_cp_17, right).
lot_house_number(lot_cp_17, 9).
building(lot_cp_17, business, bar).
business(lot_cp_17, 'The Rusty Pipe', dive_bar).
business_founded(lot_cp_17, 2052).

%% 15 Pipe Row -- Stacks Community Hall
lot(lot_cp_18, '15 Pipe Row', neo_cascade).
lot_type(lot_cp_18, buildable).
lot_district(lot_cp_18, the_stacks).
lot_street(lot_cp_18, pipe_row).
lot_side(lot_cp_18, left).
lot_house_number(lot_cp_18, 15).
building(lot_cp_18, community, meeting_hall).
business(lot_cp_18, 'Stacks Community Hall', community_center).
business_founded(lot_cp_18, 2060).

%% ═══════════════════════════════════════════════════════════
%% Silicon Docks -- Tech District
%% ═══════════════════════════════════════════════════════════

%% 1 Fiber Drive -- Cascade Data Vault (server farm)
lot(lot_cp_19, '1 Fiber Drive', neo_cascade).
lot_type(lot_cp_19, buildable).
lot_district(lot_cp_19, silicon_docks).
lot_street(lot_cp_19, fiber_drive).
lot_side(lot_cp_19, left).
lot_house_number(lot_cp_19, 1).
building(lot_cp_19, business, data_center).
business(lot_cp_19, 'Cascade Data Vault', server_farm).
business_founded(lot_cp_19, 2052).

%% 8 Fiber Drive -- Neural Link Labs (cyberware R&D)
lot(lot_cp_20, '8 Fiber Drive', neo_cascade).
lot_type(lot_cp_20, buildable).
lot_district(lot_cp_20, silicon_docks).
lot_street(lot_cp_20, fiber_drive).
lot_side(lot_cp_20, right).
lot_house_number(lot_cp_20, 8).
building(lot_cp_20, business, laboratory).
business(lot_cp_20, 'Neural Link Labs', cyberware_rd).
business_founded(lot_cp_20, 2055).

%% 15 Fiber Drive -- Ghost Signal (freelance netrunner hub)
lot(lot_cp_21, '15 Fiber Drive', neo_cascade).
lot_type(lot_cp_21, buildable).
lot_district(lot_cp_21, silicon_docks).
lot_street(lot_cp_21, fiber_drive).
lot_side(lot_cp_21, left).
lot_house_number(lot_cp_21, 15).
building(lot_cp_21, business, coworking).
business(lot_cp_21, 'Ghost Signal', netrunner_hub).
business_founded(lot_cp_21, 2061).

%% 2 Node Street -- MedTek Cybernetics Showroom
lot(lot_cp_22, '2 Node Street', neo_cascade).
lot_type(lot_cp_22, buildable).
lot_district(lot_cp_22, silicon_docks).
lot_street(lot_cp_22, node_street).
lot_side(lot_cp_22, left).
lot_house_number(lot_cp_22, 2).
building(lot_cp_22, business, showroom).
business(lot_cp_22, 'MedTek Cybernetics Showroom', cyberware_shop).
business_founded(lot_cp_22, 2057).

%% 10 Node Street -- Bit Bucket (tech junk shop)
lot(lot_cp_23, '10 Node Street', neo_cascade).
lot_type(lot_cp_23, buildable).
lot_district(lot_cp_23, silicon_docks).
lot_street(lot_cp_23, node_street).
lot_side(lot_cp_23, right).
lot_house_number(lot_cp_23, 10).
building(lot_cp_23, business, shop).
business(lot_cp_23, 'The Bit Bucket', tech_junk_shop).
business_founded(lot_cp_23, 2059).

%% ═══════════════════════════════════════════════════════════
%% Residential Lots
%% ═══════════════════════════════════════════════════════════

%% 20 Voltage Avenue -- Neon Row Apartments (low-end)
lot(lot_cp_24, '20 Voltage Avenue', neo_cascade).
lot_type(lot_cp_24, residential).
lot_district(lot_cp_24, neon_row).
lot_street(lot_cp_24, voltage_avenue).
lot_side(lot_cp_24, left).
lot_house_number(lot_cp_24, 20).
building(lot_cp_24, residential, apartment).

%% 25 Meridian Boulevard -- Skyline Penthouses (luxury)
lot(lot_cp_25, '25 Meridian Boulevard', neo_cascade).
lot_type(lot_cp_25, residential).
lot_district(lot_cp_25, corpo_plaza).
lot_street(lot_cp_25, meridian_boulevard).
lot_side(lot_cp_25, right).
lot_house_number(lot_cp_25, 25).
building(lot_cp_25, residential, penthouse).

%% 20 Rust Corridor -- Stacks Housing Block
lot(lot_cp_26, '20 Rust Corridor', neo_cascade).
lot_type(lot_cp_26, residential).
lot_district(lot_cp_26, the_stacks).
lot_street(lot_cp_26, rust_corridor).
lot_side(lot_cp_26, left).
lot_house_number(lot_cp_26, 20).
building(lot_cp_26, residential, housing_block).

%% 18 Fiber Drive -- Docks Loft Apartments
lot(lot_cp_27, '18 Fiber Drive', neo_cascade).
lot_type(lot_cp_27, residential).
lot_district(lot_cp_27, silicon_docks).
lot_street(lot_cp_27, fiber_drive).
lot_side(lot_cp_27, right).
lot_house_number(lot_cp_27, 18).
building(lot_cp_27, residential, loft).

%% 12 Chrome Alley -- Chrome Alley Squat
lot(lot_cp_28, '12 Chrome Alley', neo_cascade).
lot_type(lot_cp_28, residential).
lot_district(lot_cp_28, neon_row).
lot_street(lot_cp_28, chrome_alley).
lot_side(lot_cp_28, left).
lot_house_number(lot_cp_28, 12).
building(lot_cp_28, residential, squat).
