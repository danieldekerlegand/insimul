%% Insimul Settlements: Hindi Town
%% Source: data/worlds/language/hindi/settlements.pl
%% Created: 2026-04-03
%% Total: 2 settlements

%% Surajpur
settlement(surajpur, 'Surajpur', uttar_pradesh, republic_of_india).
settlement_type(surajpur, town).
settlement_founded(surajpur, 1650).

district(purana_shahar, 'Purana Shahar', surajpur).
district_wealth(purana_shahar, 50).
district_crime(purana_shahar, 18).
district_established(purana_shahar, 1650).
district(mandir_mohalla, 'Mandir Mohalla', surajpur).
district_wealth(mandir_mohalla, 55).
district_crime(mandir_mohalla, 10).
district_established(mandir_mohalla, 1700).
district(naya_nagar, 'Naya Nagar', surajpur).
district_wealth(naya_nagar, 75).
district_crime(naya_nagar, 8).
district_established(naya_nagar, 1995).

street(bazaar_road, 'Bazaar Road', surajpur, purana_shahar).
street_condition(bazaar_road, fair).
street_traffic(bazaar_road, high).
street(station_road, 'Station Road', surajpur, purana_shahar).
street_condition(station_road, good).
street_traffic(station_road, high).
street(chai_gali, 'Chai Gali', surajpur, purana_shahar).
street_condition(chai_gali, fair).
street_traffic(chai_gali, medium).
street(mandir_marg, 'Mandir Marg', surajpur, mandir_mohalla).
street_condition(mandir_marg, good).
street_traffic(mandir_marg, medium).
street(ghat_road, 'Ghat Road', surajpur, mandir_mohalla).
street_condition(ghat_road, good).
street_traffic(ghat_road, medium).
street(it_park_road, 'IT Park Road', surajpur, naya_nagar).
street_condition(it_park_road, good).
street_traffic(it_park_road, high).
street(mall_road, 'Mall Road', surajpur, naya_nagar).
street_condition(mall_road, good).
street_traffic(mall_road, high).

landmark(shiv_mandir, 'Shiv Mandir', surajpur, mandir_mohalla).
landmark_historical(shiv_mandir).
landmark_established(shiv_mandir, 1700).
landmark(clock_tower, 'Ghanta Ghar', surajpur, purana_shahar).
landmark_historical(clock_tower).
landmark_established(clock_tower, 1890).
landmark(river_ghat, 'Nadi Ghat', surajpur, mandir_mohalla).
landmark_historical(river_ghat).
landmark_established(river_ghat, 1750).
landmark(it_gateway, 'IT Gateway Arch', surajpur, naya_nagar).
landmark_established(it_gateway, 2005).

%% Kishanpura Village
settlement(kishanpura, 'Kishanpura', uttar_pradesh, republic_of_india).
settlement_type(kishanpura, village).
settlement_founded(kishanpura, 1800).

district(gaon_chowk, 'Gaon Chowk', kishanpura).
district_wealth(gaon_chowk, 35).
district_crime(gaon_chowk, 5).
district_established(gaon_chowk, 1800).

street(khet_road, 'Khet Road', kishanpura, gaon_chowk).
street_condition(khet_road, fair).
street_traffic(khet_road, low).
street(panchayat_road, 'Panchayat Road', kishanpura, gaon_chowk).
street_condition(panchayat_road, fair).
street_traffic(panchayat_road, low).
