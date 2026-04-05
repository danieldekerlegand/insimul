%% Insimul Locations (Lots): Modern Metropolitan
%% Source: data/worlds/modern_metropolitan/locations.pl
%% Created: 2026-04-03
%% Total: 28 locations
%%
%% Predicate schema:
%%   lot/3 — lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 — building(LotAtom, Category, Type)
%%   business/3 — business(LotAtom, Name, BusinessType)

%% ═══════════════════════════════════════════════════════════
%% Financial District
%% ═══════════════════════════════════════════════════════════

%% 1 Meridian Avenue — Zenith Tower (Skyscraper)
lot(lot_mm_1, '1 Meridian Avenue', metro_city).
lot_type(lot_mm_1, buildable).
lot_district(lot_mm_1, financial_district).
lot_street(lot_mm_1, meridian_avenue).
lot_side(lot_mm_1, left).
lot_house_number(lot_mm_1, 1).
building(lot_mm_1, business, skyscraper).
business(lot_mm_1, 'Zenith Tower', corporate_office).
business_founded(lot_mm_1, 2018).

%% 15 Meridian Avenue — Chen Technologies HQ
lot(lot_mm_2, '15 Meridian Avenue', metro_city).
lot_type(lot_mm_2, buildable).
lot_district(lot_mm_2, financial_district).
lot_street(lot_mm_2, meridian_avenue).
lot_side(lot_mm_2, right).
lot_house_number(lot_mm_2, 15).
building(lot_mm_2, business, skyscraper).
business(lot_mm_2, 'Chen Technologies HQ', tech_company).
business_founded(lot_mm_2, 2012).

%% 30 Meridian Avenue — Metro Stock Exchange
lot(lot_mm_3, '30 Meridian Avenue', metro_city).
lot_type(lot_mm_3, buildable).
lot_district(lot_mm_3, financial_district).
lot_street(lot_mm_3, meridian_avenue).
lot_side(lot_mm_3, left).
lot_house_number(lot_mm_3, 30).
building(lot_mm_3, business, skyscraper).
business(lot_mm_3, 'Metro Stock Exchange', financial_exchange).
business_founded(lot_mm_3, 1985).

%% 42 Meridian Avenue — Rooftop Bistro
lot(lot_mm_4, '42 Meridian Avenue', metro_city).
lot_type(lot_mm_4, buildable).
lot_district(lot_mm_4, financial_district).
lot_street(lot_mm_4, meridian_avenue).
lot_side(lot_mm_4, right).
lot_house_number(lot_mm_4, 42).
building(lot_mm_4, business, restaurant).
business(lot_mm_4, 'Skyline Bistro', fine_dining).
business_founded(lot_mm_4, 2020).

%% ═══════════════════════════════════════════════════════════
%% Midtown
%% ═══════════════════════════════════════════════════════════

%% 5 Broad Street — Daily Grind Coffee
lot(lot_mm_5, '5 Broad Street', metro_city).
lot_type(lot_mm_5, buildable).
lot_district(lot_mm_5, midtown).
lot_street(lot_mm_5, broad_street).
lot_side(lot_mm_5, left).
lot_house_number(lot_mm_5, 5).
building(lot_mm_5, business, cafe).
business(lot_mm_5, 'Daily Grind Coffee', coffee_shop).
business_founded(lot_mm_5, 2016).

%% 12 Broad Street — HiveSpace Co-Working
lot(lot_mm_6, '12 Broad Street', metro_city).
lot_type(lot_mm_6, buildable).
lot_district(lot_mm_6, midtown).
lot_street(lot_mm_6, broad_street).
lot_side(lot_mm_6, right).
lot_house_number(lot_mm_6, 12).
building(lot_mm_6, business, office).
business(lot_mm_6, 'HiveSpace Co-Working', coworking_space).
business_founded(lot_mm_6, 2019).

%% 20 Broad Street — Metro Central Library
lot(lot_mm_7, '20 Broad Street', metro_city).
lot_type(lot_mm_7, buildable).
lot_district(lot_mm_7, midtown).
lot_street(lot_mm_7, broad_street).
lot_side(lot_mm_7, left).
lot_house_number(lot_mm_7, 20).
building(lot_mm_7, public, library).
business(lot_mm_7, 'Metro Central Library', library).
business_founded(lot_mm_7, 1952).

%% 28 Broad Street — City Hall
lot(lot_mm_8, '28 Broad Street', metro_city).
lot_type(lot_mm_8, buildable).
lot_district(lot_mm_8, midtown).
lot_street(lot_mm_8, broad_street).
lot_side(lot_mm_8, right).
lot_house_number(lot_mm_8, 28).
building(lot_mm_8, public, government).
business(lot_mm_8, 'Metro City Hall', government_office).
business_founded(lot_mm_8, 1920).

%% 35 Broad Street — Metro General Hospital
lot(lot_mm_9, '35 Broad Street', metro_city).
lot_type(lot_mm_9, buildable).
lot_district(lot_mm_9, midtown).
lot_street(lot_mm_9, broad_street).
lot_side(lot_mm_9, left).
lot_house_number(lot_mm_9, 35).
building(lot_mm_9, public, hospital).
business(lot_mm_9, 'Metro General Hospital', hospital).
business_founded(lot_mm_9, 1968).

%% ═══════════════════════════════════════════════════════════
%% Arts Quarter
%% ═══════════════════════════════════════════════════════════

%% 3 Galleria Lane — Spectrum Gallery
lot(lot_mm_10, '3 Galleria Lane', metro_city).
lot_type(lot_mm_10, buildable).
lot_district(lot_mm_10, arts_quarter).
lot_street(lot_mm_10, galleria_lane).
lot_side(lot_mm_10, left).
lot_house_number(lot_mm_10, 3).
building(lot_mm_10, business, gallery).
business(lot_mm_10, 'Spectrum Gallery', art_gallery).
business_founded(lot_mm_10, 2010).

%% 10 Galleria Lane — Neon Lounge
lot(lot_mm_11, '10 Galleria Lane', metro_city).
lot_type(lot_mm_11, buildable).
lot_district(lot_mm_11, arts_quarter).
lot_street(lot_mm_11, galleria_lane).
lot_side(lot_mm_11, right).
lot_house_number(lot_mm_11, 10).
building(lot_mm_11, business, nightclub).
business(lot_mm_11, 'Neon Lounge', nightclub).
business_founded(lot_mm_11, 2021).

%% 18 Galleria Lane — Canvas Studio
lot(lot_mm_12, '18 Galleria Lane', metro_city).
lot_type(lot_mm_12, buildable).
lot_district(lot_mm_12, arts_quarter).
lot_street(lot_mm_12, galleria_lane).
lot_side(lot_mm_12, left).
lot_house_number(lot_mm_12, 18).
building(lot_mm_12, business, studio).
business(lot_mm_12, 'Canvas Studio', art_studio).
business_founded(lot_mm_12, 2015).

%% 25 Galleria Lane — Vinyl Underground
lot(lot_mm_13, '25 Galleria Lane', metro_city).
lot_type(lot_mm_13, buildable).
lot_district(lot_mm_13, arts_quarter).
lot_street(lot_mm_13, galleria_lane).
lot_side(lot_mm_13, right).
lot_house_number(lot_mm_13, 25).
building(lot_mm_13, business, nightclub).
business(lot_mm_13, 'Vinyl Underground', music_venue).
business_founded(lot_mm_13, 2008).

%% 32 Galleria Lane — The Improv Loft
lot(lot_mm_14, '32 Galleria Lane', metro_city).
lot_type(lot_mm_14, buildable).
lot_district(lot_mm_14, arts_quarter).
lot_street(lot_mm_14, galleria_lane).
lot_side(lot_mm_14, left).
lot_house_number(lot_mm_14, 32).
building(lot_mm_14, business, theater).
business(lot_mm_14, 'The Improv Loft', comedy_club).
business_founded(lot_mm_14, 2017).

%% ═══════════════════════════════════════════════════════════
%% Riverside Park District
%% ═══════════════════════════════════════════════════════════

%% 1 Riverside Drive — Metro Riverside Park
lot(lot_mm_15, '1 Riverside Drive', metro_city).
lot_type(lot_mm_15, park).
lot_district(lot_mm_15, riverside).
lot_street(lot_mm_15, riverside_drive).
lot_side(lot_mm_15, left).
lot_house_number(lot_mm_15, 1).
building(lot_mm_15, public, park).

%% 10 Riverside Drive — Dog Park and Playground
lot(lot_mm_16, '10 Riverside Drive', metro_city).
lot_type(lot_mm_16, park).
lot_district(lot_mm_16, riverside).
lot_street(lot_mm_16, riverside_drive).
lot_side(lot_mm_16, right).
lot_house_number(lot_mm_16, 10).
building(lot_mm_16, public, recreation).

%% 20 Riverside Drive — Riverside Farmers Market
lot(lot_mm_17, '20 Riverside Drive', metro_city).
lot_type(lot_mm_17, buildable).
lot_district(lot_mm_17, riverside).
lot_street(lot_mm_17, riverside_drive).
lot_side(lot_mm_17, left).
lot_house_number(lot_mm_17, 20).
building(lot_mm_17, business, market).
business(lot_mm_17, 'Riverside Farmers Market', open_air_market).
business_founded(lot_mm_17, 2005).

%% ═══════════════════════════════════════════════════════════
%% Transit Hub
%% ═══════════════════════════════════════════════════════════

%% 1 Transit Plaza — Metro Central Station
lot(lot_mm_18, '1 Transit Plaza', metro_city).
lot_type(lot_mm_18, buildable).
lot_district(lot_mm_18, transit_hub).
lot_street(lot_mm_18, transit_plaza).
lot_side(lot_mm_18, left).
lot_house_number(lot_mm_18, 1).
building(lot_mm_18, public, subway_station).
business(lot_mm_18, 'Metro Central Station', transit).
business_founded(lot_mm_18, 1965).

%% 8 Transit Plaza — Quick Bites Food Court
lot(lot_mm_19, '8 Transit Plaza', metro_city).
lot_type(lot_mm_19, buildable).
lot_district(lot_mm_19, transit_hub).
lot_street(lot_mm_19, transit_plaza).
lot_side(lot_mm_19, right).
lot_house_number(lot_mm_19, 8).
building(lot_mm_19, business, food_court).
business(lot_mm_19, 'Quick Bites Food Court', fast_food).
business_founded(lot_mm_19, 2010).

%% ═══════════════════════════════════════════════════════════
%% University District
%% ═══════════════════════════════════════════════════════════

%% 1 Academy Road — Metro State University
lot(lot_mm_20, '1 Academy Road', metro_city).
lot_type(lot_mm_20, buildable).
lot_district(lot_mm_20, university_district).
lot_street(lot_mm_20, academy_road).
lot_side(lot_mm_20, left).
lot_house_number(lot_mm_20, 1).
building(lot_mm_20, public, university).
business(lot_mm_20, 'Metro State University', education).
business_founded(lot_mm_20, 1948).

%% 12 Academy Road — The Study Bean
lot(lot_mm_21, '12 Academy Road', metro_city).
lot_type(lot_mm_21, buildable).
lot_district(lot_mm_21, university_district).
lot_street(lot_mm_21, academy_road).
lot_side(lot_mm_21, right).
lot_house_number(lot_mm_21, 12).
building(lot_mm_21, business, cafe).
business(lot_mm_21, 'The Study Bean', coffee_shop).
business_founded(lot_mm_21, 2018).

%% 20 Academy Road — Campus Bookstore
lot(lot_mm_22, '20 Academy Road', metro_city).
lot_type(lot_mm_22, buildable).
lot_district(lot_mm_22, university_district).
lot_street(lot_mm_22, academy_road).
lot_side(lot_mm_22, left).
lot_house_number(lot_mm_22, 20).
building(lot_mm_22, business, retail).
business(lot_mm_22, 'Campus Bookstore', bookstore).
business_founded(lot_mm_22, 1960).

%% ═══════════════════════════════════════════════════════════
%% Residential — Uptown
%% ═══════════════════════════════════════════════════════════

%% 5 Elm Street — Luxury Condos
lot(lot_mm_23, '5 Elm Street', metro_city).
lot_type(lot_mm_23, residential).
lot_district(lot_mm_23, uptown).
lot_street(lot_mm_23, elm_street).
lot_side(lot_mm_23, left).
lot_house_number(lot_mm_23, 5).
building(lot_mm_23, residential, luxury_condo).

%% 18 Elm Street — Corner Bodega
lot(lot_mm_24, '18 Elm Street', metro_city).
lot_type(lot_mm_24, buildable).
lot_district(lot_mm_24, uptown).
lot_street(lot_mm_24, elm_street).
lot_side(lot_mm_24, right).
lot_house_number(lot_mm_24, 18).
building(lot_mm_24, business, convenience_store).
business(lot_mm_24, 'Corner Bodega', convenience_store).
business_founded(lot_mm_24, 1995).

%% 25 Elm Street — Yoga Flow Studio
lot(lot_mm_25, '25 Elm Street', metro_city).
lot_type(lot_mm_25, buildable).
lot_district(lot_mm_25, uptown).
lot_street(lot_mm_25, elm_street).
lot_side(lot_mm_25, left).
lot_house_number(lot_mm_25, 25).
building(lot_mm_25, business, fitness).
business(lot_mm_25, 'Yoga Flow Studio', gym).
business_founded(lot_mm_25, 2019).

%% ═══════════════════════════════════════════════════════════
%% Warehouse District
%% ═══════════════════════════════════════════════════════════

%% 2 Dock Street — Converted Loft Spaces
lot(lot_mm_26, '2 Dock Street', metro_city).
lot_type(lot_mm_26, residential).
lot_district(lot_mm_26, warehouse_district).
lot_street(lot_mm_26, dock_street).
lot_side(lot_mm_26, left).
lot_house_number(lot_mm_26, 2).
building(lot_mm_26, residential, loft).

%% 14 Dock Street — Craft Brewery and Taproom
lot(lot_mm_27, '14 Dock Street', metro_city).
lot_type(lot_mm_27, buildable).
lot_district(lot_mm_27, warehouse_district).
lot_street(lot_mm_27, dock_street).
lot_side(lot_mm_27, right).
lot_house_number(lot_mm_27, 14).
building(lot_mm_27, business, brewery).
business(lot_mm_27, 'Dockside Brewing Co', craft_brewery).
business_founded(lot_mm_27, 2017).

%% 22 Dock Street — Pop-Up Market Hall
lot(lot_mm_28, '22 Dock Street', metro_city).
lot_type(lot_mm_28, buildable).
lot_district(lot_mm_28, warehouse_district).
lot_street(lot_mm_28, dock_street).
lot_side(lot_mm_28, left).
lot_house_number(lot_mm_28, 22).
building(lot_mm_28, business, market).
business(lot_mm_28, 'The Pop-Up Hall', pop_up_market).
business_founded(lot_mm_28, 2022).
