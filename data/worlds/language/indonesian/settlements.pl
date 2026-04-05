%% Insimul Settlements: Indonesian Coastal Town
%% Source: data/worlds/language/indonesian/settlements.pl
%% Created: 2026-04-03
%% Total: 2 settlements

%% Pantai Mutiara (Pearl Coast) — main town
settlement(pantai_mutiara, 'Pantai Mutiara', java, republic_of_indonesia).
settlement_type(pantai_mutiara, town).
settlement_founded(pantai_mutiara, 1750).

district(pasar_district, 'Pasar District', pantai_mutiara).
district_wealth(pasar_district, 55).
district_crime(pasar_district, 18).
district_established(pasar_district, 1750).
district(pelabuhan_district, 'Pelabuhan District', pantai_mutiara).
district_wealth(pelabuhan_district, 50).
district_crime(pelabuhan_district, 22).
district_established(pelabuhan_district, 1780).
district(kota_baru, 'Kota Baru', pantai_mutiara).
district_wealth(kota_baru, 70).
district_crime(kota_baru, 10).
district_established(kota_baru, 1990).

street(jalan_raya, 'Jalan Raya', pantai_mutiara, pasar_district).
street_condition(jalan_raya, good).
street_traffic(jalan_raya, high).
street(jalan_pasar, 'Jalan Pasar', pantai_mutiara, pasar_district).
street_condition(jalan_pasar, fair).
street_traffic(jalan_pasar, high).
street(jalan_masjid, 'Jalan Masjid', pantai_mutiara, pasar_district).
street_condition(jalan_masjid, good).
street_traffic(jalan_masjid, medium).
street(jalan_pelabuhan, 'Jalan Pelabuhan', pantai_mutiara, pelabuhan_district).
street_condition(jalan_pelabuhan, fair).
street_traffic(jalan_pelabuhan, high).
street(jalan_nelayan, 'Jalan Nelayan', pantai_mutiara, pelabuhan_district).
street_condition(jalan_nelayan, fair).
street_traffic(jalan_nelayan, medium).
street(jalan_merdeka, 'Jalan Merdeka', pantai_mutiara, kota_baru).
street_condition(jalan_merdeka, good).
street_traffic(jalan_merdeka, high).
street(jalan_pendidikan, 'Jalan Pendidikan', pantai_mutiara, kota_baru).
street_condition(jalan_pendidikan, good).
street_traffic(jalan_pendidikan, medium).

landmark(masjid_agung, 'Masjid Agung', pantai_mutiara, pasar_district).
landmark_historical(masjid_agung).
landmark_established(masjid_agung, 1780).
landmark(mercusuar, 'Mercusuar Pantai', pantai_mutiara, pelabuhan_district).
landmark_historical(mercusuar).
landmark_established(mercusuar, 1870).
landmark(alun_alun, 'Alun-Alun', pantai_mutiara, pasar_district).
landmark_established(alun_alun, 1750).
landmark(tugu_merdeka, 'Tugu Merdeka', pantai_mutiara, kota_baru).
landmark_established(tugu_merdeka, 1950).

%% Desa Sawah (Rice Village)
settlement(desa_sawah, 'Desa Sawah', java, republic_of_indonesia).
settlement_type(desa_sawah, village).
settlement_founded(desa_sawah, 1820).

district(kampung_tengah, 'Kampung Tengah', desa_sawah).
district_wealth(kampung_tengah, 35).
district_crime(kampung_tengah, 3).
district_established(kampung_tengah, 1820).

street(jalan_sawah, 'Jalan Sawah', desa_sawah, kampung_tengah).
street_condition(jalan_sawah, fair).
street_traffic(jalan_sawah, low).
street(jalan_desa, 'Jalan Desa', desa_sawah, kampung_tengah).
street_condition(jalan_desa, fair).
street_traffic(jalan_desa, low).
