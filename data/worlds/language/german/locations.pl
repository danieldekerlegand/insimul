%% Insimul Locations (Lots): German Rhineland
%% Source: data/worlds/language/german/locations.pl
%% Created: 2026-04-03
%% Total: 35 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% 3 Marktstrasse -- Baeckerei Hoffmann
lot(lot_de_1, '3 Marktstrasse', rheinhausen).
lot_type(lot_de_1, buildable).
lot_district(lot_de_1, marktplatz_viertel).
lot_street(lot_de_1, marktstrasse).
lot_side(lot_de_1, left).
lot_house_number(lot_de_1, 3).
building(lot_de_1, business, bakery).
business(lot_de_1, 'Baeckerei Hoffmann', bakery).
business_founded(lot_de_1, 1962).

%% 8 Marktstrasse -- Buchhandlung am Markt
lot(lot_de_2, '8 Marktstrasse', rheinhausen).
lot_type(lot_de_2, buildable).
lot_district(lot_de_2, marktplatz_viertel).
lot_street(lot_de_2, marktstrasse).
lot_side(lot_de_2, right).
lot_house_number(lot_de_2, 8).
building(lot_de_2, business, bookstore).
business(lot_de_2, 'Buchhandlung am Markt', bookstore).
business_founded(lot_de_2, 1985).

%% 14 Marktstrasse -- Metzgerei Weber
lot(lot_de_3, '14 Marktstrasse', rheinhausen).
lot_type(lot_de_3, buildable).
lot_district(lot_de_3, marktplatz_viertel).
lot_street(lot_de_3, marktstrasse).
lot_side(lot_de_3, left).
lot_house_number(lot_de_3, 14).
building(lot_de_3, business, butcher).
business(lot_de_3, 'Metzgerei Weber', butcher).
business_founded(lot_de_3, 1948).

%% 20 Marktstrasse -- Apotheke am Markt
lot(lot_de_4, '20 Marktstrasse', rheinhausen).
lot_type(lot_de_4, buildable).
lot_district(lot_de_4, marktplatz_viertel).
lot_street(lot_de_4, marktstrasse).
lot_side(lot_de_4, right).
lot_house_number(lot_de_4, 20).
building(lot_de_4, business, pharmacy).
business(lot_de_4, 'Apotheke am Markt', pharmacy).
business_founded(lot_de_4, 1975).

%% 2 Rathausplatz -- Rathaus (Town Hall)
lot(lot_de_5, '2 Rathausplatz', rheinhausen).
lot_type(lot_de_5, buildable).
lot_district(lot_de_5, marktplatz_viertel).
lot_street(lot_de_5, rathausplatz).
lot_side(lot_de_5, left).
lot_house_number(lot_de_5, 2).
building(lot_de_5, civic, town_hall).

%% 10 Rathausplatz -- Eiscafe am Platz
lot(lot_de_6, '10 Rathausplatz', rheinhausen).
lot_type(lot_de_6, buildable).
lot_district(lot_de_6, marktplatz_viertel).
lot_street(lot_de_6, rathausplatz).
lot_side(lot_de_6, right).
lot_house_number(lot_de_6, 10).
building(lot_de_6, business, cafe).
business(lot_de_6, 'Eiscafe am Platz', cafe).
business_founded(lot_de_6, 2001).

%% 5 Domgasse -- Weinstube zum Goldenen Fass
lot(lot_de_7, '5 Domgasse', rheinhausen).
lot_type(lot_de_7, buildable).
lot_district(lot_de_7, altstadt).
lot_street(lot_de_7, domgasse).
lot_side(lot_de_7, left).
lot_house_number(lot_de_7, 5).
building(lot_de_7, business, wine_tavern).
business(lot_de_7, 'Weinstube zum Goldenen Fass', wine_tavern).
business_founded(lot_de_7, 1890).

%% 12 Domgasse -- Residence
lot(lot_de_8, '12 Domgasse', rheinhausen).
lot_type(lot_de_8, buildable).
lot_district(lot_de_8, altstadt).
lot_street(lot_de_8, domgasse).
lot_side(lot_de_8, right).
lot_house_number(lot_de_8, 12).
building(lot_de_8, residence, house).

%% 18 Domgasse -- Antiquariat Fischer
lot(lot_de_9, '18 Domgasse', rheinhausen).
lot_type(lot_de_9, buildable).
lot_district(lot_de_9, altstadt).
lot_street(lot_de_9, domgasse).
lot_side(lot_de_9, left).
lot_house_number(lot_de_9, 18).
building(lot_de_9, business, antique_shop).
business(lot_de_9, 'Antiquariat Fischer', antique_shop).
business_founded(lot_de_9, 1998).

%% 25 Domgasse -- Residence
lot(lot_de_10, '25 Domgasse', rheinhausen).
lot_type(lot_de_10, buildable).
lot_district(lot_de_10, altstadt).
lot_street(lot_de_10, domgasse).
lot_side(lot_de_10, right).
lot_house_number(lot_de_10, 25).
building(lot_de_10, residence, apartment).

%% 3 Kirchstrasse -- Alte Kirche
lot(lot_de_11, '3 Kirchstrasse', rheinhausen).
lot_type(lot_de_11, buildable).
lot_district(lot_de_11, altstadt).
lot_street(lot_de_11, kirchstrasse).
lot_side(lot_de_11, left).
lot_house_number(lot_de_11, 3).
building(lot_de_11, civic, church).

%% 10 Kirchstrasse -- Gasthaus zur Linde
lot(lot_de_12, '10 Kirchstrasse', rheinhausen).
lot_type(lot_de_12, buildable).
lot_district(lot_de_12, altstadt).
lot_street(lot_de_12, kirchstrasse).
lot_side(lot_de_12, right).
lot_house_number(lot_de_12, 10).
building(lot_de_12, business, restaurant).
business(lot_de_12, 'Gasthaus zur Linde', restaurant).
business_founded(lot_de_12, 1935).

%% 16 Kirchstrasse -- Residence
lot(lot_de_13, '16 Kirchstrasse', rheinhausen).
lot_type(lot_de_13, buildable).
lot_district(lot_de_13, altstadt).
lot_street(lot_de_13, kirchstrasse).
lot_side(lot_de_13, left).
lot_house_number(lot_de_13, 16).
building(lot_de_13, residence, house).

%% 22 Kirchstrasse -- Blumenladen Rosengarten
lot(lot_de_14, '22 Kirchstrasse', rheinhausen).
lot_type(lot_de_14, buildable).
lot_district(lot_de_14, altstadt).
lot_street(lot_de_14, kirchstrasse).
lot_side(lot_de_14, right).
lot_house_number(lot_de_14, 22).
building(lot_de_14, business, shop).
business(lot_de_14, 'Blumenladen Rosengarten', shop).
business_founded(lot_de_14, 2005).

%% 5 Universitaetsstrasse -- Universitaet Rheinhausen (Main Building)
lot(lot_de_15, '5 Universitaetsstrasse', rheinhausen).
lot_type(lot_de_15, buildable).
lot_district(lot_de_15, universitaetsviertel).
lot_street(lot_de_15, universitaetsstrasse).
lot_side(lot_de_15, left).
lot_house_number(lot_de_15, 5).
building(lot_de_15, civic, university).

%% 15 Universitaetsstrasse -- Uni-Bibliothek
lot(lot_de_16, '15 Universitaetsstrasse', rheinhausen).
lot_type(lot_de_16, buildable).
lot_district(lot_de_16, universitaetsviertel).
lot_street(lot_de_16, universitaetsstrasse).
lot_side(lot_de_16, right).
lot_house_number(lot_de_16, 15).
building(lot_de_16, civic, library).

%% 22 Universitaetsstrasse -- Sprachzentrum
lot(lot_de_17, '22 Universitaetsstrasse', rheinhausen).
lot_type(lot_de_17, buildable).
lot_district(lot_de_17, universitaetsviertel).
lot_street(lot_de_17, universitaetsstrasse).
lot_side(lot_de_17, left).
lot_house_number(lot_de_17, 22).
building(lot_de_17, business, school).
business(lot_de_17, 'Sprachzentrum Rheinhausen', school).
business_founded(lot_de_17, 2003).

%% 30 Universitaetsstrasse -- Studentenwohnheim
lot(lot_de_18, '30 Universitaetsstrasse', rheinhausen).
lot_type(lot_de_18, buildable).
lot_district(lot_de_18, universitaetsviertel).
lot_street(lot_de_18, universitaetsstrasse).
lot_side(lot_de_18, right).
lot_house_number(lot_de_18, 30).
building(lot_de_18, residence, apartment).

%% 8 Studentenweg -- Cafe Campus
lot(lot_de_19, '8 Studentenweg', rheinhausen).
lot_type(lot_de_19, buildable).
lot_district(lot_de_19, universitaetsviertel).
lot_street(lot_de_19, studentenweg).
lot_side(lot_de_19, left).
lot_house_number(lot_de_19, 8).
building(lot_de_19, business, cafe).
business(lot_de_19, 'Cafe Campus', cafe).
business_founded(lot_de_19, 2010).

%% 16 Studentenweg -- Doener-Imbiss Antalya
lot(lot_de_20, '16 Studentenweg', rheinhausen).
lot_type(lot_de_20, buildable).
lot_district(lot_de_20, universitaetsviertel).
lot_street(lot_de_20, studentenweg).
lot_side(lot_de_20, right).
lot_house_number(lot_de_20, 16).
building(lot_de_20, business, restaurant).
business(lot_de_20, 'Doener-Imbiss Antalya', restaurant).
business_founded(lot_de_20, 2008).

%% 24 Studentenweg -- Copy-Shop und Schreibwaren
lot(lot_de_21, '24 Studentenweg', rheinhausen).
lot_type(lot_de_21, buildable).
lot_district(lot_de_21, universitaetsviertel).
lot_street(lot_de_21, studentenweg).
lot_side(lot_de_21, left).
lot_house_number(lot_de_21, 24).
building(lot_de_21, business, shop).
business(lot_de_21, 'Copy-Shop und Schreibwaren', shop).
business_founded(lot_de_21, 2006).

%% 5 Rheinuferweg -- Rhein-Hotel
lot(lot_de_22, '5 Rheinuferweg', rheinhausen).
lot_type(lot_de_22, buildable).
lot_district(lot_de_22, rheinpromenade).
lot_street(lot_de_22, rheinuferweg).
lot_side(lot_de_22, left).
lot_house_number(lot_de_22, 5).
building(lot_de_22, business, hotel).
business(lot_de_22, 'Rhein-Hotel', hotel).
business_founded(lot_de_22, 1955).

%% 15 Rheinuferweg -- Fischrestaurant Rheingold
lot(lot_de_23, '15 Rheinuferweg', rheinhausen).
lot_type(lot_de_23, buildable).
lot_district(lot_de_23, rheinpromenade).
lot_street(lot_de_23, rheinuferweg).
lot_side(lot_de_23, right).
lot_house_number(lot_de_23, 15).
building(lot_de_23, business, restaurant).
business(lot_de_23, 'Fischrestaurant Rheingold', restaurant).
business_founded(lot_de_23, 1992).

%% 25 Rheinuferweg -- Biergarten am Rhein
lot(lot_de_24, '25 Rheinuferweg', rheinhausen).
lot_type(lot_de_24, buildable).
lot_district(lot_de_24, rheinpromenade).
lot_street(lot_de_24, rheinuferweg).
lot_side(lot_de_24, left).
lot_house_number(lot_de_24, 25).
building(lot_de_24, business, restaurant).
business(lot_de_24, 'Biergarten am Rhein', restaurant).
business_founded(lot_de_24, 1978).

%% 35 Rheinuferweg -- Residence
lot(lot_de_25, '35 Rheinuferweg', rheinhausen).
lot_type(lot_de_25, buildable).
lot_district(lot_de_25, rheinpromenade).
lot_street(lot_de_25, rheinuferweg).
lot_side(lot_de_25, right).
lot_house_number(lot_de_25, 35).
building(lot_de_25, residence, apartment).

%% 45 Rheinuferweg -- Supermarkt REWE
lot(lot_de_26, '45 Rheinuferweg', rheinhausen).
lot_type(lot_de_26, buildable).
lot_district(lot_de_26, rheinpromenade).
lot_street(lot_de_26, rheinuferweg).
lot_side(lot_de_26, left).
lot_house_number(lot_de_26, 45).
building(lot_de_26, business, grocerystore).
business(lot_de_26, 'Supermarkt REWE', grocerystore).
business_founded(lot_de_26, 2002).

%% 55 Rheinuferweg -- Bahnhof Rheinhausen
lot(lot_de_27, '55 Rheinuferweg', rheinhausen).
lot_type(lot_de_27, buildable).
lot_district(lot_de_27, rheinpromenade).
lot_street(lot_de_27, rheinuferweg).
lot_side(lot_de_27, right).
lot_house_number(lot_de_27, 55).
building(lot_de_27, civic, train_station).

%% 5 Weinbergweg -- Weingut Mueller
lot(lot_de_28, '5 Weinbergweg', rheinhausen).
lot_type(lot_de_28, buildable).
lot_district(lot_de_28, weinbergviertel).
lot_street(lot_de_28, weinbergweg).
lot_side(lot_de_28, left).
lot_house_number(lot_de_28, 5).
building(lot_de_28, business, winery).
business(lot_de_28, 'Weingut Mueller', winery).
business_founded(lot_de_28, 1860).

%% 12 Weinbergweg -- Residence
lot(lot_de_29, '12 Weinbergweg', rheinhausen).
lot_type(lot_de_29, buildable).
lot_district(lot_de_29, weinbergviertel).
lot_street(lot_de_29, weinbergweg).
lot_side(lot_de_29, right).
lot_house_number(lot_de_29, 12).
building(lot_de_29, residence, house).

%% 20 Weinbergweg -- Strauss-Wirtschaft
lot(lot_de_30, '20 Weinbergweg', rheinhausen).
lot_type(lot_de_30, buildable).
lot_district(lot_de_30, weinbergviertel).
lot_street(lot_de_30, weinbergweg).
lot_side(lot_de_30, left).
lot_house_number(lot_de_30, 20).
building(lot_de_30, business, wine_tavern).
business(lot_de_30, 'Strausswirtschaft am Weinberg', wine_tavern).
business_founded(lot_de_30, 1920).

%% Weinfeld Village Lots

%% 3 Hauptstrasse -- Gasthaus zum Winzer
lot(lot_de_31, '3 Hauptstrasse', weinfeld).
lot_type(lot_de_31, buildable).
lot_district(lot_de_31, dorfkern).
lot_street(lot_de_31, hauptstrasse_wf).
lot_side(lot_de_31, left).
lot_house_number(lot_de_31, 3).
building(lot_de_31, business, restaurant).
business(lot_de_31, 'Gasthaus zum Winzer', restaurant).
business_founded(lot_de_31, 1910).

%% 10 Hauptstrasse -- Dorfladen
lot(lot_de_32, '10 Hauptstrasse', weinfeld).
lot_type(lot_de_32, buildable).
lot_district(lot_de_32, dorfkern).
lot_street(lot_de_32, hauptstrasse_wf).
lot_side(lot_de_32, right).
lot_house_number(lot_de_32, 10).
building(lot_de_32, business, shop).
business(lot_de_32, 'Dorfladen Weinfeld', shop).
business_founded(lot_de_32, 1965).

%% 5 Winzerweg -- Weingut Schaefer
lot(lot_de_33, '5 Winzerweg', weinfeld).
lot_type(lot_de_33, buildable).
lot_district(lot_de_33, dorfkern).
lot_street(lot_de_33, winzerweg).
lot_side(lot_de_33, left).
lot_house_number(lot_de_33, 5).
building(lot_de_33, business, winery).
business(lot_de_33, 'Weingut Schaefer', winery).
business_founded(lot_de_33, 1845).

%% 12 Winzerweg -- Residence
lot(lot_de_34, '12 Winzerweg', weinfeld).
lot_type(lot_de_34, buildable).
lot_district(lot_de_34, dorfkern).
lot_street(lot_de_34, winzerweg).
lot_side(lot_de_34, right).
lot_house_number(lot_de_34, 12).
building(lot_de_34, residence, house).

%% 20 Winzerweg -- Residence
lot(lot_de_35, '20 Winzerweg', weinfeld).
lot_type(lot_de_35, buildable).
lot_district(lot_de_35, dorfkern).
lot_street(lot_de_35, winzerweg).
lot_side(lot_de_35, left).
lot_house_number(lot_de_35, 20).
building(lot_de_35, residence, house).
