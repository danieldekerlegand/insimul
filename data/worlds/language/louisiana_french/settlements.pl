%% Insimul Settlements: French Louisiana
%% Source: data/worlds/language/french_louisiana/settlements.json
%% Converted: 2026-04-03T06:20:23Z
%% Total: 1 settlements

%% Belle Rêve
settlement(belle_reve, 'Belle Rêve', region_d_acadiana, royaume_de_louisiane).
settlement_type(belle_reve, village).
settlement_founded(belle_reve, 1200).

district(downtown, 'Downtown', belle_reve).
district_wealth(downtown, 68).
district_crime(downtown, 44).
district_established(downtown, 1233).
district(riverside, 'Riverside', belle_reve).
district_wealth(riverside, 91).
district_crime(riverside, 29).
district_established(riverside, 1225).
street(main_st, 'Main St', belle_reve, downtown).
street_condition(main_st, good).
street_traffic(main_st, high).
street(oak_ave, 'Oak Ave', belle_reve, downtown).
street_condition(oak_ave, poor).
street_traffic(oak_ave, low).
street(maple_dr, 'Maple Dr', belle_reve, downtown).
street_condition(maple_dr, good).
street_traffic(maple_dr, high).
street(cedar_ln, 'Cedar Ln', belle_reve, riverside).
street_condition(cedar_ln, good).
street_traffic(cedar_ln, low).
street(pine_rd, 'Pine Rd', belle_reve, riverside).
street_condition(pine_rd, good).
street_traffic(pine_rd, high).
street(elm_st, 'Elm St', belle_reve, riverside).
street_condition(elm_st, poor).
street_traffic(elm_st, low).
landmark(town_square, 'Town Square', belle_reve, downtown).
landmark_historical(town_square).
landmark_established(town_square, 1539).
landmark(central_park, 'Central Park', belle_reve, riverside).
landmark_historical(central_park).
landmark_established(central_park, 1607).
landmark(old_mill, 'Old Mill', belle_reve, downtown).
landmark_established(old_mill, 1858).
landmark(clock_tower, 'Clock Tower', belle_reve, riverside).
landmark_historical(clock_tower).
landmark_established(clock_tower, 1275).


