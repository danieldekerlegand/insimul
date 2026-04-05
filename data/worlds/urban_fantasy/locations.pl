%% Insimul Locations (Lots): Urban Fantasy
%% Source: data/worlds/urban_fantasy/locations.pl
%% Created: 2026-04-03
%% Total: 28 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% ═══════════════════════════════════════════════════════════
%% Downtown Core -- Meridian Avenue
%% ═══════════════════════════════════════════════════════════

%% 10 Meridian Avenue -- The Eventide (Nightclub / Seelie Court Front)
lot(lot_uf_1, '10 Meridian Avenue', veilhaven).
lot_type(lot_uf_1, buildable).
lot_district(lot_uf_1, downtown_core).
lot_street(lot_uf_1, meridian_avenue).
lot_side(lot_uf_1, left).
lot_house_number(lot_uf_1, 10).
building(lot_uf_1, business, nightclub).
business(lot_uf_1, 'The Eventide', nightclub).
business_founded(lot_uf_1, 2005).

%% 22 Meridian Avenue -- City Hall
lot(lot_uf_2, '22 Meridian Avenue', veilhaven).
lot_type(lot_uf_2, buildable).
lot_district(lot_uf_2, downtown_core).
lot_street(lot_uf_2, meridian_avenue).
lot_side(lot_uf_2, right).
lot_house_number(lot_uf_2, 22).
building(lot_uf_2, civic, government).

%% 34 Meridian Avenue -- Veilhaven Police Precinct 7
lot(lot_uf_3, '34 Meridian Avenue', veilhaven).
lot_type(lot_uf_3, buildable).
lot_district(lot_uf_3, downtown_core).
lot_street(lot_uf_3, meridian_avenue).
lot_side(lot_uf_3, left).
lot_house_number(lot_uf_3, 34).
building(lot_uf_3, civic, police_station).

%% 46 Meridian Avenue -- Residence (High-rise Apartment)
lot(lot_uf_4, '46 Meridian Avenue', veilhaven).
lot_type(lot_uf_4, buildable).
lot_district(lot_uf_4, downtown_core).
lot_street(lot_uf_4, meridian_avenue).
lot_side(lot_uf_4, right).
lot_house_number(lot_uf_4, 46).
building(lot_uf_4, residence, apartment).

%% ═══════════════════════════════════════════════════════════
%% Downtown Core -- Cobalt Street
%% ═══════════════════════════════════════════════════════════

%% 5 Cobalt Street -- Cobalt Diner (neutral ground)
lot(lot_uf_5, '5 Cobalt Street', veilhaven).
lot_type(lot_uf_5, buildable).
lot_district(lot_uf_5, downtown_core).
lot_street(lot_uf_5, cobalt_street).
lot_side(lot_uf_5, left).
lot_house_number(lot_uf_5, 5).
building(lot_uf_5, business, restaurant).
business(lot_uf_5, 'Cobalt Diner', restaurant).
business_founded(lot_uf_5, 1978).

%% 15 Cobalt Street -- The Black Thorn (Unseelie Court Front Bar)
lot(lot_uf_6, '15 Cobalt Street', veilhaven).
lot_type(lot_uf_6, buildable).
lot_district(lot_uf_6, downtown_core).
lot_street(lot_uf_6, cobalt_street).
lot_side(lot_uf_6, right).
lot_house_number(lot_uf_6, 15).
building(lot_uf_6, business, bar).
business(lot_uf_6, 'The Black Thorn', bar).
business_founded(lot_uf_6, 1999).

%% 25 Cobalt Street -- Pharmacy (warded)
lot(lot_uf_7, '25 Cobalt Street', veilhaven).
lot_type(lot_uf_7, buildable).
lot_district(lot_uf_7, downtown_core).
lot_street(lot_uf_7, cobalt_street).
lot_side(lot_uf_7, left).
lot_house_number(lot_uf_7, 25).
building(lot_uf_7, business, pharmacy).
business(lot_uf_7, 'Nightshade Pharmacy', pharmacy).
business_founded(lot_uf_7, 2010).

%% ═══════════════════════════════════════════════════════════
%% Old Quarter -- Whisper Lane
%% ═══════════════════════════════════════════════════════════

%% 3 Whisper Lane -- Athenaeum Books (Occult Bookshop)
lot(lot_uf_8, '3 Whisper Lane', veilhaven).
lot_type(lot_uf_8, buildable).
lot_district(lot_uf_8, old_quarter).
lot_street(lot_uf_8, whisper_lane).
lot_side(lot_uf_8, left).
lot_house_number(lot_uf_8, 3).
building(lot_uf_8, business, bookstore).
business(lot_uf_8, 'Athenaeum Books', bookstore).
business_founded(lot_uf_8, 1923).

%% 11 Whisper Lane -- Madame Voss Fortune Telling
lot(lot_uf_9, '11 Whisper Lane', veilhaven).
lot_type(lot_uf_9, buildable).
lot_district(lot_uf_9, old_quarter).
lot_street(lot_uf_9, whisper_lane).
lot_side(lot_uf_9, right).
lot_house_number(lot_uf_9, 11).
building(lot_uf_9, business, parlor).
business(lot_uf_9, 'Voss Divinations', parlor).
business_founded(lot_uf_9, 1965).

%% 19 Whisper Lane -- Residence (Victorian row house)
lot(lot_uf_10, '19 Whisper Lane', veilhaven).
lot_type(lot_uf_10, buildable).
lot_district(lot_uf_10, old_quarter).
lot_street(lot_uf_10, whisper_lane).
lot_side(lot_uf_10, left).
lot_house_number(lot_uf_10, 19).
building(lot_uf_10, residence, house).

%% ═══════════════════════════════════════════════════════════
%% Old Quarter -- Thornwall Road
%% ═══════════════════════════════════════════════════════════

%% 7 Thornwall Road -- Ironside Tattoo (Warding tattoos)
lot(lot_uf_11, '7 Thornwall Road', veilhaven).
lot_type(lot_uf_11, buildable).
lot_district(lot_uf_11, old_quarter).
lot_street(lot_uf_11, thornwall_road).
lot_side(lot_uf_11, left).
lot_house_number(lot_uf_11, 7).
building(lot_uf_11, business, tattoo_parlor).
business(lot_uf_11, 'Ironside Tattoo', tattoo_parlor).
business_founded(lot_uf_11, 2002).

%% 17 Thornwall Road -- Mortar and Pestle (Apothecary / Potion Shop)
lot(lot_uf_12, '17 Thornwall Road', veilhaven).
lot_type(lot_uf_12, buildable).
lot_district(lot_uf_12, old_quarter).
lot_street(lot_uf_12, thornwall_road).
lot_side(lot_uf_12, right).
lot_house_number(lot_uf_12, 17).
building(lot_uf_12, business, apothecary).
business(lot_uf_12, 'Mortar and Pestle', apothecary).
business_founded(lot_uf_12, 1948).

%% 27 Thornwall Road -- Residence (Converted warehouse loft)
lot(lot_uf_13, '27 Thornwall Road', veilhaven).
lot_type(lot_uf_13, buildable).
lot_district(lot_uf_13, old_quarter).
lot_street(lot_uf_13, thornwall_road).
lot_side(lot_uf_13, left).
lot_house_number(lot_uf_13, 27).
building(lot_uf_13, residence, apartment).

%% ═══════════════════════════════════════════════════════════
%% University Hill -- Campus Drive
%% ═══════════════════════════════════════════════════════════

%% 100 Campus Drive -- Veilhaven University Main Hall
lot(lot_uf_14, '100 Campus Drive', veilhaven).
lot_type(lot_uf_14, buildable).
lot_district(lot_uf_14, university_hill).
lot_street(lot_uf_14, campus_drive).
lot_side(lot_uf_14, left).
lot_house_number(lot_uf_14, 100).
building(lot_uf_14, civic, university).

%% 120 Campus Drive -- Blackwood Library (restricted occult archives)
lot(lot_uf_15, '120 Campus Drive', veilhaven).
lot_type(lot_uf_15, buildable).
lot_district(lot_uf_15, university_hill).
lot_street(lot_uf_15, campus_drive).
lot_side(lot_uf_15, right).
lot_house_number(lot_uf_15, 120).
building(lot_uf_15, civic, library).

%% 8 Library Walk -- The Grindstone (Campus coffee shop, fae baristas)
lot(lot_uf_16, '8 Library Walk', veilhaven).
lot_type(lot_uf_16, buildable).
lot_district(lot_uf_16, university_hill).
lot_street(lot_uf_16, library_walk).
lot_side(lot_uf_16, left).
lot_house_number(lot_uf_16, 8).
building(lot_uf_16, business, cafe).
business(lot_uf_16, 'The Grindstone', cafe).
business_founded(lot_uf_16, 2015).

%% 18 Library Walk -- Student Housing
lot(lot_uf_17, '18 Library Walk', veilhaven).
lot_type(lot_uf_17, buildable).
lot_district(lot_uf_17, university_hill).
lot_street(lot_uf_17, library_walk).
lot_side(lot_uf_17, right).
lot_house_number(lot_uf_17, 18).
building(lot_uf_17, residence, apartment).

%% ═══════════════════════════════════════════════════════════
%% Docklands -- Harborfront Way
%% ═══════════════════════════════════════════════════════════

%% 4 Harborfront Way -- Harbormaster Office
lot(lot_uf_18, '4 Harborfront Way', veilhaven).
lot_type(lot_uf_18, buildable).
lot_district(lot_uf_18, docklands).
lot_street(lot_uf_18, harborfront_way).
lot_side(lot_uf_18, left).
lot_house_number(lot_uf_18, 4).
building(lot_uf_18, civic, office).

%% 14 Harborfront Way -- Salt and Anchor Pub (Werewolf pack hangout)
lot(lot_uf_19, '14 Harborfront Way', veilhaven).
lot_type(lot_uf_19, buildable).
lot_district(lot_uf_19, docklands).
lot_street(lot_uf_19, harborfront_way).
lot_side(lot_uf_19, right).
lot_house_number(lot_uf_19, 14).
building(lot_uf_19, business, pub).
business(lot_uf_19, 'Salt and Anchor', pub).
business_founded(lot_uf_19, 1952).

%% 24 Harborfront Way -- Warehouse (Black market relics)
lot(lot_uf_20, '24 Harborfront Way', veilhaven).
lot_type(lot_uf_20, buildable).
lot_district(lot_uf_20, docklands).
lot_street(lot_uf_20, harborfront_way).
lot_side(lot_uf_20, left).
lot_house_number(lot_uf_20, 24).
building(lot_uf_20, business, warehouse).
business(lot_uf_20, 'Dock 24 Storage', warehouse).
business_founded(lot_uf_20, 1975).

%% 8 Pier Street -- Residence (Houseboat)
lot(lot_uf_21, '8 Pier Street', veilhaven).
lot_type(lot_uf_21, buildable).
lot_district(lot_uf_21, docklands).
lot_street(lot_uf_21, pier_street).
lot_side(lot_uf_21, left).
lot_house_number(lot_uf_21, 8).
building(lot_uf_21, residence, houseboat).

%% ═══════════════════════════════════════════════════════════
%% Silver Heights -- Crescent Boulevard
%% ═══════════════════════════════════════════════════════════

%% 1 Crescent Boulevard -- Aldermere Mansion (Vampire Elder residence)
lot(lot_uf_22, '1 Crescent Boulevard', veilhaven).
lot_type(lot_uf_22, buildable).
lot_district(lot_uf_22, silver_heights).
lot_street(lot_uf_22, crescent_boulevard).
lot_side(lot_uf_22, left).
lot_house_number(lot_uf_22, 1).
building(lot_uf_22, residence, mansion).

%% 15 Crescent Boulevard -- Residence (Luxury)
lot(lot_uf_23, '15 Crescent Boulevard', veilhaven).
lot_type(lot_uf_23, buildable).
lot_district(lot_uf_23, silver_heights).
lot_street(lot_uf_23, crescent_boulevard).
lot_side(lot_uf_23, right).
lot_house_number(lot_uf_23, 15).
building(lot_uf_23, residence, house).

%% 5 Moonrise Terrace -- Gallery Nyx (Supernatural art gallery)
lot(lot_uf_24, '5 Moonrise Terrace', veilhaven).
lot_type(lot_uf_24, buildable).
lot_district(lot_uf_24, silver_heights).
lot_street(lot_uf_24, moonrise_terrace).
lot_side(lot_uf_24, left).
lot_house_number(lot_uf_24, 5).
building(lot_uf_24, business, gallery).
business(lot_uf_24, 'Gallery Nyx', gallery).
business_founded(lot_uf_24, 2018).

%% ═══════════════════════════════════════════════════════════
%% Hollowmere
%% ═══════════════════════════════════════════════════════════

%% 12 Main Street -- Hollowmere General Store
lot(lot_uf_25, '12 Main Street', hollowmere).
lot_type(lot_uf_25, buildable).
lot_district(lot_uf_25, hollowmere_commons).
lot_street(lot_uf_25, main_street_hm).
lot_side(lot_uf_25, right).
lot_house_number(lot_uf_25, 12).
building(lot_uf_25, business, shop).
business(lot_uf_25, 'Hollowmere General', shop).
business_founded(lot_uf_25, 1935).

%% 3 Briarwood Path -- The Briar Hollow (Fae crossing point)
lot(lot_uf_26, '3 Briarwood Path', hollowmere).
lot_type(lot_uf_26, buildable).
lot_district(lot_uf_26, briarwood).
lot_street(lot_uf_26, briarwood_path).
lot_side(lot_uf_26, left).
lot_house_number(lot_uf_26, 3).
building(lot_uf_26, civic, grove).

%% ═══════════════════════════════════════════════════════════
%% Underreach (Hidden Subway)
%% ═══════════════════════════════════════════════════════════

%% Platform Zero -- The Waystation (Underground Market)
lot(lot_uf_27, 'Platform Zero', underreach).
lot_type(lot_uf_27, buildable).
lot_district(lot_uf_27, transit_nexus).
lot_street(lot_uf_27, platform_zero).
lot_side(lot_uf_27, left).
lot_house_number(lot_uf_27, 0).
building(lot_uf_27, business, market).
business(lot_uf_27, 'The Waystation', market).
business_founded(lot_uf_27, 1920).

%% Gate 13 -- Subway Portal Hub
lot(lot_uf_28, 'Gate 13', underreach).
lot_type(lot_uf_28, buildable).
lot_district(lot_uf_28, transit_nexus).
lot_street(lot_uf_28, platform_zero).
lot_side(lot_uf_28, right).
lot_house_number(lot_uf_28, 13).
building(lot_uf_28, civic, portal_hub).
