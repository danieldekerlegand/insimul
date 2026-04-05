%% Insimul Settlements: Horror World
%% Source: data/worlds/horror/settlements.pl
%% Created: 2026-04-03
%% Total: 3 settlements

%% Ravenhollow -- isolated town
settlement(ravenhollow, 'Ravenhollow', blackwood_county, united_states).
settlement_type(ravenhollow, town).
settlement_founded(ravenhollow, 1847).

district(old_town, 'Old Town', ravenhollow).
district_wealth(old_town, 30).
district_crime(old_town, 45).
district_established(old_town, 1847).
district(harbor_ward, 'Harbor Ward', ravenhollow).
district_wealth(harbor_ward, 20).
district_crime(harbor_ward, 55).
district_established(harbor_ward, 1860).
district(hillcrest, 'Hillcrest', ravenhollow).
district_wealth(hillcrest, 50).
district_crime(hillcrest, 25).
district_established(hillcrest, 1890).

street(main_street, 'Main Street', ravenhollow, old_town).
street_condition(main_street, poor).
street_traffic(main_street, low).
street(church_lane, 'Church Lane', ravenhollow, old_town).
street_condition(church_lane, fair).
street_traffic(church_lane, low).
street(wharf_road, 'Wharf Road', ravenhollow, harbor_ward).
street_condition(wharf_road, poor).
street_traffic(wharf_road, low).
street(dock_street, 'Dock Street', ravenhollow, harbor_ward).
street_condition(dock_street, poor).
street_traffic(dock_street, low).
street(ridge_road, 'Ridge Road', ravenhollow, hillcrest).
street_condition(ridge_road, fair).
street_traffic(ridge_road, low).
street(cemetery_path, 'Cemetery Path', ravenhollow, hillcrest).
street_condition(cemetery_path, poor).
street_traffic(cemetery_path, low).

landmark(ravenhollow_church, 'Ravenhollow Church', ravenhollow, old_town).
landmark_historical(ravenhollow_church).
landmark_established(ravenhollow_church, 1849).
landmark(old_lighthouse, 'Old Lighthouse', ravenhollow, harbor_ward).
landmark_historical(old_lighthouse).
landmark_established(old_lighthouse, 1855).
landmark(founders_monument, 'Founders Monument', ravenhollow, old_town).
landmark_established(founders_monument, 1897).
landmark(blackwood_cemetery, 'Blackwood Cemetery', ravenhollow, hillcrest).
landmark_historical(blackwood_cemetery).
landmark_established(blackwood_cemetery, 1850).

%% Grimhaven Hamlet -- cursed hamlet
settlement(grimhaven, 'Grimhaven', blackwood_county, united_states).
settlement_type(grimhaven, hamlet).
settlement_founded(grimhaven, 1793).

district(hamlet_center, 'Hamlet Center', grimhaven).
district_wealth(hamlet_center, 15).
district_crime(hamlet_center, 60).
district_established(hamlet_center, 1793).
district(the_hollow, 'The Hollow', grimhaven).
district_wealth(the_hollow, 10).
district_crime(the_hollow, 75).
district_established(the_hollow, 1793).

street(hollow_road, 'Hollow Road', grimhaven, hamlet_center).
street_condition(hollow_road, poor).
street_traffic(hollow_road, low).
street(crooked_lane, 'Crooked Lane', grimhaven, the_hollow).
street_condition(crooked_lane, poor).
street_traffic(crooked_lane, low).
street(gallows_path, 'Gallows Path', grimhaven, the_hollow).
street_condition(gallows_path, poor).
street_traffic(gallows_path, low).

landmark(hanging_tree, 'The Hanging Tree', grimhaven, the_hollow).
landmark_historical(hanging_tree).
landmark_established(hanging_tree, 1793).
landmark(old_well, 'The Old Well', grimhaven, hamlet_center).
landmark_historical(old_well).
landmark_established(old_well, 1795).

%% Ashford Mill -- abandoned industrial settlement
settlement(ashford_mill, 'Ashford Mill', blackwood_county, united_states).
settlement_type(ashford_mill, village).
settlement_founded(ashford_mill, 1882).

district(mill_district, 'Mill District', ashford_mill).
district_wealth(mill_district, 5).
district_crime(mill_district, 80).
district_established(mill_district, 1882).

street(mill_road, 'Mill Road', ashford_mill, mill_district).
street_condition(mill_road, poor).
street_traffic(mill_road, low).
street(furnace_lane, 'Furnace Lane', ashford_mill, mill_district).
street_condition(furnace_lane, poor).
street_traffic(furnace_lane, low).

landmark(ruined_smokestacks, 'Ruined Smokestacks', ashford_mill, mill_district).
landmark_historical(ruined_smokestacks).
landmark_established(ruined_smokestacks, 1882).
