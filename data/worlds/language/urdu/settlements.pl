%% Insimul Settlements: Urdu Punjab
%% Source: data/worlds/language/urdu/settlements.pl
%% Created: 2026-04-03
%% Total: 2 settlements

%% Noor Manzil (main town)
settlement(noor_manzil, 'Noor Manzil', punjab, pakistan).
settlement_type(noor_manzil, town).
settlement_founded(noor_manzil, 1880).

district(purana_shahar, 'Purana Shahar', noor_manzil).
district_wealth(purana_shahar, 55).
district_crime(purana_shahar, 30).
district_established(purana_shahar, 1880).
district(naya_shahar, 'Naya Shahar', noor_manzil).
district_wealth(naya_shahar, 75).
district_crime(naya_shahar, 15).
district_established(naya_shahar, 1970).
district(university_colony, 'University Colony', noor_manzil).
district_wealth(university_colony, 70).
district_crime(university_colony, 10).
district_established(university_colony, 1985).

street(bazaar_road, 'Bazaar Road', noor_manzil, purana_shahar).
street_condition(bazaar_road, fair).
street_traffic(bazaar_road, high).
street(masjid_gali, 'Masjid Gali', noor_manzil, purana_shahar).
street_condition(masjid_gali, fair).
street_traffic(masjid_gali, medium).
street(anarkali_gali, 'Anarkali Gali', noor_manzil, purana_shahar).
street_condition(anarkali_gali, poor).
street_traffic(anarkali_gali, high).
street(jinnah_road, 'Jinnah Road', noor_manzil, naya_shahar).
street_condition(jinnah_road, good).
street_traffic(jinnah_road, high).
street(iqbal_avenue, 'Iqbal Avenue', noor_manzil, naya_shahar).
street_condition(iqbal_avenue, good).
street_traffic(iqbal_avenue, medium).
street(campus_road, 'Campus Road', noor_manzil, university_colony).
street_condition(campus_road, good).
street_traffic(campus_road, medium).
street(hostel_lane, 'Hostel Lane', noor_manzil, university_colony).
street_condition(hostel_lane, good).
street_traffic(hostel_lane, low).

landmark(jama_masjid, 'Jama Masjid Noor Manzil', noor_manzil, purana_shahar).
landmark_historical(jama_masjid).
landmark_established(jama_masjid, 1895).
landmark(clock_tower, 'Ghanta Ghar', noor_manzil, purana_shahar).
landmark_historical(clock_tower).
landmark_established(clock_tower, 1910).
landmark(cricket_stadium, 'Noor Manzil Cricket Ground', noor_manzil, naya_shahar).
landmark_established(cricket_stadium, 1975).
landmark(university_gate, 'Allama Iqbal University Gate', noor_manzil, university_colony).
landmark_established(university_gate, 1985).

%% Sabz Pind (nearby village)
settlement(sabz_pind, 'Sabz Pind', punjab, pakistan).
settlement_type(sabz_pind, village).
settlement_founded(sabz_pind, 1820).

district(sabz_pind_centre, 'Sabz Pind Centre', sabz_pind).
district_wealth(sabz_pind_centre, 40).
district_crime(sabz_pind_centre, 20).
district_established(sabz_pind_centre, 1820).

street(panchayat_road, 'Panchayat Road', sabz_pind, sabz_pind_centre).
street_condition(panchayat_road, fair).
street_traffic(panchayat_road, low).
street(khet_wali_gali, 'Khet Wali Gali', sabz_pind, sabz_pind_centre).
street_condition(khet_wali_gali, poor).
street_traffic(khet_wali_gali, low).

landmark(sabz_pind_haveli, 'Purani Haveli', sabz_pind, sabz_pind_centre).
landmark_historical(sabz_pind_haveli).
landmark_established(sabz_pind_haveli, 1850).
