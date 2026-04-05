%% Insimul Settlements: Arabic Coastal Town
%% Source: data/worlds/language/arabic/settlements.pl
%% Created: 2026-04-03
%% Total: 2 settlements

%% Madinat al-Bahr
settlement(madinat_al_bahr, 'Madinat al-Bahr', coastal_province, arab_coastal_republic).
settlement_type(madinat_al_bahr, town).
settlement_founded(madinat_al_bahr, 1600).

district(old_medina, 'Old Medina', madinat_al_bahr).
district_wealth(old_medina, 55).
district_crime(old_medina, 20).
district_established(old_medina, 1600).
district(university_quarter, 'University Quarter', madinat_al_bahr).
district_wealth(university_quarter, 70).
district_crime(university_quarter, 10).
district_established(university_quarter, 1965).
district(corniche, 'Corniche', madinat_al_bahr).
district_wealth(corniche, 80).
district_crime(corniche, 8).
district_established(corniche, 1980).

street(sharia_al_bahr, 'Sharia al-Bahr', madinat_al_bahr, old_medina).
street_condition(sharia_al_bahr, good).
street_traffic(sharia_al_bahr, high).
street(sharia_al_souq, 'Sharia al-Souq', madinat_al_bahr, old_medina).
street_condition(sharia_al_souq, fair).
street_traffic(sharia_al_souq, high).
street(sharia_al_masjid, 'Sharia al-Masjid', madinat_al_bahr, old_medina).
street_condition(sharia_al_masjid, good).
street_traffic(sharia_al_masjid, medium).
street(sharia_al_jami, 'Sharia al-Jami', madinat_al_bahr, university_quarter).
street_condition(sharia_al_jami, good).
street_traffic(sharia_al_jami, medium).
street(sharia_al_ilm, 'Sharia al-Ilm', madinat_al_bahr, university_quarter).
street_condition(sharia_al_ilm, good).
street_traffic(sharia_al_ilm, medium).
street(tariq_al_corniche, 'Tariq al-Corniche', madinat_al_bahr, corniche).
street_condition(tariq_al_corniche, good).
street_traffic(tariq_al_corniche, high).

landmark(great_mosque, 'Great Mosque', madinat_al_bahr, old_medina).
landmark_historical(great_mosque).
landmark_established(great_mosque, 1620).
landmark(city_fountain, 'City Fountain', madinat_al_bahr, old_medina).
landmark_established(city_fountain, 1890).
landmark(university_gate, 'University Gate', madinat_al_bahr, university_quarter).
landmark_established(university_gate, 1965).
landmark(lighthouse, 'Lighthouse', madinat_al_bahr, corniche).
landmark_historical(lighthouse).
landmark_established(lighthouse, 1850).

%% Al-Zahra Village
settlement(al_zahra, 'Al-Zahra', coastal_province, arab_coastal_republic).
settlement_type(al_zahra, village).
settlement_founded(al_zahra, 1750).

district(village_center, 'Village Center', al_zahra).
district_wealth(village_center, 40).
district_crime(village_center, 5).
district_established(village_center, 1750).

street(sharia_al_nakhil, 'Sharia al-Nakhil', al_zahra, village_center).
street_condition(sharia_al_nakhil, fair).
street_traffic(sharia_al_nakhil, low).
street(sharia_al_bustan, 'Sharia al-Bustan', al_zahra, village_center).
street_condition(sharia_al_bustan, fair).
street_traffic(sharia_al_bustan, low).
