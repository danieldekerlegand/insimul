%% Insimul Locations (Lots): Modern Realistic
%% Source: data/worlds/modern_realistic/locations.pl
%% Created: 2026-04-03
%% Total: 30 locations
%%
%% Predicate schema:
%%   lot/3 -- lot(AtomId, Address, Settlement)
%%   lot_type/2, lot_district/2, lot_street/2, lot_side/2
%%   building/3 -- building(LotAtom, Category, Type)
%%   business/3 -- business(LotAtom, Name, BusinessType)

%% 101 Main Street -- Brewed Awakening Coffee Shop
lot(lot_mr_1, '101 Main Street', maplewood).
lot_type(lot_mr_1, buildable).
lot_district(lot_mr_1, downtown_maplewood).
lot_street(lot_mr_1, main_street).
lot_side(lot_mr_1, left).
lot_house_number(lot_mr_1, 101).
building(lot_mr_1, business, cafe).
business(lot_mr_1, 'Brewed Awakening', cafe).
business_founded(lot_mr_1, 2012).

%% 115 Main Street -- Maplewood Public Library
lot(lot_mr_2, '115 Main Street', maplewood).
lot_type(lot_mr_2, buildable).
lot_district(lot_mr_2, downtown_maplewood).
lot_street(lot_mr_2, main_street).
lot_side(lot_mr_2, right).
lot_house_number(lot_mr_2, 115).
building(lot_mr_2, civic, library).

%% 130 Main Street -- Cornerstone Realty Office
lot(lot_mr_3, '130 Main Street', maplewood).
lot_type(lot_mr_3, buildable).
lot_district(lot_mr_3, downtown_maplewood).
lot_street(lot_mr_3, main_street).
lot_side(lot_mr_3, left).
lot_house_number(lot_mr_3, 130).
building(lot_mr_3, business, office).
business(lot_mr_3, 'Cornerstone Realty', office).
business_founded(lot_mr_3, 1998).

%% 145 Main Street -- Maplewood Elementary School
lot(lot_mr_4, '145 Main Street', maplewood).
lot_type(lot_mr_4, buildable).
lot_district(lot_mr_4, downtown_maplewood).
lot_street(lot_mr_4, main_street).
lot_side(lot_mr_4, right).
lot_house_number(lot_mr_4, 145).
building(lot_mr_4, civic, school).

%% 160 Main Street -- Maplewood General Hospital
lot(lot_mr_5, '160 Main Street', maplewood).
lot_type(lot_mr_5, buildable).
lot_district(lot_mr_5, downtown_maplewood).
lot_street(lot_mr_5, main_street).
lot_side(lot_mr_5, left).
lot_house_number(lot_mr_5, 160).
building(lot_mr_5, civic, hospital).

%% 175 Main Street -- Town Hall
lot(lot_mr_6, '175 Main Street', maplewood).
lot_type(lot_mr_6, buildable).
lot_district(lot_mr_6, downtown_maplewood).
lot_street(lot_mr_6, main_street).
lot_side(lot_mr_6, right).
lot_house_number(lot_mr_6, 175).
building(lot_mr_6, civic, town_hall).

%% 10 Elm Avenue -- Fresh Market Grocery
lot(lot_mr_7, '10 Elm Avenue', maplewood).
lot_type(lot_mr_7, buildable).
lot_district(lot_mr_7, downtown_maplewood).
lot_street(lot_mr_7, elm_avenue).
lot_side(lot_mr_7, left).
lot_house_number(lot_mr_7, 10).
building(lot_mr_7, business, grocerystore).
business(lot_mr_7, 'Fresh Market', grocerystore).
business_founded(lot_mr_7, 2008).

%% 25 Elm Avenue -- Pixel and Print Co-Working Space
lot(lot_mr_8, '25 Elm Avenue', maplewood).
lot_type(lot_mr_8, buildable).
lot_district(lot_mr_8, downtown_maplewood).
lot_street(lot_mr_8, elm_avenue).
lot_side(lot_mr_8, right).
lot_house_number(lot_mr_8, 25).
building(lot_mr_8, business, coworking).
business(lot_mr_8, 'Pixel and Print', coworking).
business_founded(lot_mr_8, 2019).

%% 40 Elm Avenue -- Fitness Plus Gym
lot(lot_mr_9, '40 Elm Avenue', maplewood).
lot_type(lot_mr_9, buildable).
lot_district(lot_mr_9, downtown_maplewood).
lot_street(lot_mr_9, elm_avenue).
lot_side(lot_mr_9, left).
lot_house_number(lot_mr_9, 40).
building(lot_mr_9, business, gym).
business(lot_mr_9, 'Fitness Plus', gym).
business_founded(lot_mr_9, 2015).

%% 55 Elm Avenue -- Maplewood Veterinary Clinic
lot(lot_mr_10, '55 Elm Avenue', maplewood).
lot_type(lot_mr_10, buildable).
lot_district(lot_mr_10, downtown_maplewood).
lot_street(lot_mr_10, elm_avenue).
lot_side(lot_mr_10, right).
lot_house_number(lot_mr_10, 55).
building(lot_mr_10, business, clinic).
business(lot_mr_10, 'Maplewood Vet Clinic', clinic).
business_founded(lot_mr_10, 2001).

%% 70 Elm Avenue -- Apartment Complex
lot(lot_mr_11, '70 Elm Avenue', maplewood).
lot_type(lot_mr_11, buildable).
lot_district(lot_mr_11, downtown_maplewood).
lot_street(lot_mr_11, elm_avenue).
lot_side(lot_mr_11, left).
lot_house_number(lot_mr_11, 70).
building(lot_mr_11, residence, apartment).

%% 5 Cedar Lane -- Residence (Chen household)
lot(lot_mr_12, '5 Cedar Lane', maplewood).
lot_type(lot_mr_12, buildable).
lot_district(lot_mr_12, oak_ridge).
lot_street(lot_mr_12, cedar_lane).
lot_side(lot_mr_12, left).
lot_house_number(lot_mr_12, 5).
building(lot_mr_12, residence, house).

%% 18 Cedar Lane -- Residence (Okafor household)
lot(lot_mr_13, '18 Cedar Lane', maplewood).
lot_type(lot_mr_13, buildable).
lot_district(lot_mr_13, oak_ridge).
lot_street(lot_mr_13, cedar_lane).
lot_side(lot_mr_13, right).
lot_house_number(lot_mr_13, 18).
building(lot_mr_13, residence, house).

%% 30 Cedar Lane -- Residence (Russo household)
lot(lot_mr_14, '30 Cedar Lane', maplewood).
lot_type(lot_mr_14, buildable).
lot_district(lot_mr_14, oak_ridge).
lot_street(lot_mr_14, cedar_lane).
lot_side(lot_mr_14, left).
lot_house_number(lot_mr_14, 30).
building(lot_mr_14, residence, house).

%% 12 Birch Drive -- Oak Ridge Community Park
lot(lot_mr_15, '12 Birch Drive', maplewood).
lot_type(lot_mr_15, buildable).
lot_district(lot_mr_15, oak_ridge).
lot_street(lot_mr_15, birch_drive).
lot_side(lot_mr_15, left).
lot_house_number(lot_mr_15, 12).
building(lot_mr_15, civic, park).

%% 25 Birch Drive -- Sunrise Yoga Studio
lot(lot_mr_16, '25 Birch Drive', maplewood).
lot_type(lot_mr_16, buildable).
lot_district(lot_mr_16, oak_ridge).
lot_street(lot_mr_16, birch_drive).
lot_side(lot_mr_16, right).
lot_house_number(lot_mr_16, 25).
building(lot_mr_16, business, studio).
business(lot_mr_16, 'Sunrise Yoga', studio).
business_founded(lot_mr_16, 2020).

%% 38 Birch Drive -- Residence (Park household)
lot(lot_mr_17, '38 Birch Drive', maplewood).
lot_type(lot_mr_17, buildable).
lot_district(lot_mr_17, oak_ridge).
lot_street(lot_mr_17, birch_drive).
lot_side(lot_mr_17, left).
lot_house_number(lot_mr_17, 38).
building(lot_mr_17, residence, house).

%% 8 River Road -- Riverside Diner
lot(lot_mr_18, '8 River Road', maplewood).
lot_type(lot_mr_18, buildable).
lot_district(lot_mr_18, riverside).
lot_street(lot_mr_18, river_road).
lot_side(lot_mr_18, left).
lot_house_number(lot_mr_18, 8).
building(lot_mr_18, business, restaurant).
business(lot_mr_18, 'Riverside Diner', restaurant).
business_founded(lot_mr_18, 1982).

%% 20 River Road -- Auto Repair Shop
lot(lot_mr_19, '20 River Road', maplewood).
lot_type(lot_mr_19, buildable).
lot_district(lot_mr_19, riverside).
lot_street(lot_mr_19, river_road).
lot_side(lot_mr_19, right).
lot_house_number(lot_mr_19, 20).
building(lot_mr_19, business, garage).
business(lot_mr_19, 'Reliable Auto', garage).
business_founded(lot_mr_19, 1995).

%% 35 River Road -- Apartment Complex
lot(lot_mr_20, '35 River Road', maplewood).
lot_type(lot_mr_20, buildable).
lot_district(lot_mr_20, riverside).
lot_street(lot_mr_20, river_road).
lot_side(lot_mr_20, left).
lot_house_number(lot_mr_20, 35).
building(lot_mr_20, residence, apartment).

%% 15 Mill Street -- Community Center
lot(lot_mr_21, '15 Mill Street', maplewood).
lot_type(lot_mr_21, buildable).
lot_district(lot_mr_21, riverside).
lot_street(lot_mr_21, mill_street).
lot_side(lot_mr_21, left).
lot_house_number(lot_mr_21, 15).
building(lot_mr_21, civic, community_center).

%% 28 Mill Street -- Laundromat
lot(lot_mr_22, '28 Mill Street', maplewood).
lot_type(lot_mr_22, buildable).
lot_district(lot_mr_22, riverside).
lot_street(lot_mr_22, mill_street).
lot_side(lot_mr_22, right).
lot_house_number(lot_mr_22, 28).
building(lot_mr_22, business, laundromat).
business(lot_mr_22, 'Spin Cycle', laundromat).
business_founded(lot_mr_22, 2003).

%% Pinehurst Lots

%% 5 Pine Road -- Pinehurst General Store
lot(lot_mr_23, '5 Pine Road', pinehurst).
lot_type(lot_mr_23, buildable).
lot_district(lot_mr_23, pinehurst_center).
lot_street(lot_mr_23, pine_road).
lot_side(lot_mr_23, left).
lot_house_number(lot_mr_23, 5).
building(lot_mr_23, business, shop).
business(lot_mr_23, 'Pinehurst General Store', shop).
business_founded(lot_mr_23, 1920).

%% 15 Pine Road -- Pinehurst Farm Stand
lot(lot_mr_24, '15 Pine Road', pinehurst).
lot_type(lot_mr_24, buildable).
lot_district(lot_mr_24, pinehurst_center).
lot_street(lot_mr_24, pine_road).
lot_side(lot_mr_24, right).
lot_house_number(lot_mr_24, 15).
building(lot_mr_24, business, market).
business(lot_mr_24, 'Pinehurst Farm Stand', market).
business_founded(lot_mr_24, 2010).

%% 8 Old Highway -- Residence (Weaver household)
lot(lot_mr_25, '8 Old Highway', pinehurst).
lot_type(lot_mr_25, buildable).
lot_district(lot_mr_25, pinehurst_center).
lot_street(lot_mr_25, old_highway).
lot_side(lot_mr_25, left).
lot_house_number(lot_mr_25, 8).
building(lot_mr_25, residence, house).

%% Lakeside Heights Lots

%% 100 Lakeview Boulevard -- Lakeside Shopping Plaza
lot(lot_mr_26, '100 Lakeview Boulevard', lakeside_heights).
lot_type(lot_mr_26, buildable).
lot_district(lot_mr_26, lakeside_center).
lot_street(lot_mr_26, lakeview_boulevard).
lot_side(lot_mr_26, left).
lot_house_number(lot_mr_26, 100).
building(lot_mr_26, business, shopping_plaza).
business(lot_mr_26, 'Lakeside Shopping Plaza', shopping_plaza).
business_founded(lot_mr_26, 2007).

%% 120 Lakeview Boulevard -- Tech Hub Office Park
lot(lot_mr_27, '120 Lakeview Boulevard', lakeside_heights).
lot_type(lot_mr_27, buildable).
lot_district(lot_mr_27, lakeside_center).
lot_street(lot_mr_27, lakeview_boulevard).
lot_side(lot_mr_27, right).
lot_house_number(lot_mr_27, 120).
building(lot_mr_27, business, office_park).
business(lot_mr_27, 'Lakeside Tech Hub', office_park).
business_founded(lot_mr_27, 2010).

%% 10 Summit Drive -- Residence (luxury homes)
lot(lot_mr_28, '10 Summit Drive', lakeside_heights).
lot_type(lot_mr_28, buildable).
lot_district(lot_mr_28, lakeside_center).
lot_street(lot_mr_28, summit_drive).
lot_side(lot_mr_28, left).
lot_house_number(lot_mr_28, 10).
building(lot_mr_28, residence, house).

%% 25 Summit Drive -- Lakeside Community Pool
lot(lot_mr_29, '25 Summit Drive', lakeside_heights).
lot_type(lot_mr_29, buildable).
lot_district(lot_mr_29, lakeside_center).
lot_street(lot_mr_29, summit_drive).
lot_side(lot_mr_29, right).
lot_house_number(lot_mr_29, 25).
building(lot_mr_29, civic, pool).

%% 40 Summit Drive -- Residence
lot(lot_mr_30, '40 Summit Drive', lakeside_heights).
lot_type(lot_mr_30, buildable).
lot_district(lot_mr_30, lakeside_center).
lot_street(lot_mr_30, summit_drive).
lot_side(lot_mr_30, left).
lot_house_number(lot_mr_30, 40).
building(lot_mr_30, residence, house).
