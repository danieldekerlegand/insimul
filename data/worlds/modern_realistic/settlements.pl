%% Insimul Settlements: Modern Realistic
%% Source: data/worlds/modern_realistic/settlements.pl
%% Created: 2026-04-03
%% Total: 3 settlements

%% Maplewood — a mid-sized suburban town
settlement(maplewood, 'Maplewood', tri_county_region, united_states).
settlement_type(maplewood, town).
settlement_founded(maplewood, 1952).

district(downtown_maplewood, 'Downtown', maplewood).
district_wealth(downtown_maplewood, 65).
district_crime(downtown_maplewood, 15).
district_established(downtown_maplewood, 1952).
district(oak_ridge, 'Oak Ridge', maplewood).
district_wealth(oak_ridge, 75).
district_crime(oak_ridge, 8).
district_established(oak_ridge, 1968).
district(riverside, 'Riverside', maplewood).
district_wealth(riverside, 55).
district_crime(riverside, 20).
district_established(riverside, 1975).

street(main_street, 'Main Street', maplewood, downtown_maplewood).
street_condition(main_street, good).
street_traffic(main_street, high).
street(elm_avenue, 'Elm Avenue', maplewood, downtown_maplewood).
street_condition(elm_avenue, good).
street_traffic(elm_avenue, medium).
street(cedar_lane, 'Cedar Lane', maplewood, oak_ridge).
street_condition(cedar_lane, good).
street_traffic(cedar_lane, low).
street(birch_drive, 'Birch Drive', maplewood, oak_ridge).
street_condition(birch_drive, good).
street_traffic(birch_drive, low).
street(river_road, 'River Road', maplewood, riverside).
street_condition(river_road, fair).
street_traffic(river_road, medium).
street(mill_street, 'Mill Street', maplewood, riverside).
street_condition(mill_street, fair).
street_traffic(mill_street, low).

landmark(town_clock, 'Town Clock', maplewood, downtown_maplewood).
landmark_historical(town_clock).
landmark_established(town_clock, 1960).
landmark(veterans_memorial, 'Veterans Memorial', maplewood, downtown_maplewood).
landmark_established(veterans_memorial, 1985).
landmark(oak_ridge_water_tower, 'Oak Ridge Water Tower', maplewood, oak_ridge).
landmark_established(oak_ridge_water_tower, 1970).
landmark(riverside_bridge, 'Riverside Bridge', maplewood, riverside).
landmark_historical(riverside_bridge).
landmark_established(riverside_bridge, 1955).

%% Pinehurst — a small rural community outside Maplewood
settlement(pinehurst, 'Pinehurst', tri_county_region, united_states).
settlement_type(pinehurst, village).
settlement_founded(pinehurst, 1890).

district(pinehurst_center, 'Pinehurst Center', pinehurst).
district_wealth(pinehurst_center, 45).
district_crime(pinehurst_center, 5).
district_established(pinehurst_center, 1890).

street(pine_road, 'Pine Road', pinehurst, pinehurst_center).
street_condition(pine_road, fair).
street_traffic(pine_road, low).
street(old_highway, 'Old Highway', pinehurst, pinehurst_center).
street_condition(old_highway, fair).
street_traffic(old_highway, low).

%% Lakeside Heights — a newer suburban development
settlement(lakeside_heights, 'Lakeside Heights', tri_county_region, united_states).
settlement_type(lakeside_heights, suburb).
settlement_founded(lakeside_heights, 2005).

district(lakeside_center, 'Lakeside Center', lakeside_heights).
district_wealth(lakeside_center, 85).
district_crime(lakeside_center, 5).
district_established(lakeside_center, 2005).

street(lakeview_boulevard, 'Lakeview Boulevard', lakeside_heights, lakeside_center).
street_condition(lakeview_boulevard, good).
street_traffic(lakeview_boulevard, medium).
street(summit_drive, 'Summit Drive', lakeside_heights, lakeside_center).
street_condition(summit_drive, good).
street_traffic(summit_drive, low).
