%% Insimul Settlements: Arabic Al-Andalus
%% Source: data/worlds/language/arabic/settlements.pl
%% Created: 2026-04-03
%% Total: 2 settlements

%% Qurtuba (Cordoba)
settlement(qurtuba, 'Qurtuba', wilayat_qurtuba, khilafat_qurtuba).
settlement_type(qurtuba, city).
settlement_founded(qurtuba, 929).

district(medina, 'Al-Medina', qurtuba).
district_wealth(medina, 85).
district_crime(medina, 20).
district_established(medina, 929).
district(alcazar, 'Al-Qasr', qurtuba).
district_wealth(alcazar, 95).
district_crime(alcazar, 10).
district_established(alcazar, 935).
district(riverside_quarter, 'Hay al-Wadi', qurtuba).
district_wealth(riverside_quarter, 60).
district_crime(riverside_quarter, 35).
district_established(riverside_quarter, 940).

street(tariq_al_masjid, 'Tariq al-Masjid', qurtuba, medina).
street_condition(tariq_al_masjid, good).
street_traffic(tariq_al_masjid, high).
street(tariq_al_suq, 'Tariq al-Suq', qurtuba, medina).
street_condition(tariq_al_suq, good).
street_traffic(tariq_al_suq, high).
street(zuqaq_al_attar, 'Zuqaq al-Attar', qurtuba, medina).
street_condition(zuqaq_al_attar, good).
street_traffic(zuqaq_al_attar, low).
street(tariq_al_qasr, 'Tariq al-Qasr', qurtuba, alcazar).
street_condition(tariq_al_qasr, good).
street_traffic(tariq_al_qasr, high).
street(shari_al_ulum, 'Shari al-Ulum', qurtuba, alcazar).
street_condition(shari_al_ulum, good).
street_traffic(shari_al_ulum, high).
street(darb_al_nahr, 'Darb al-Nahr', qurtuba, riverside_quarter).
street_condition(darb_al_nahr, poor).
street_traffic(darb_al_nahr, low).
street(tariq_al_jisr, 'Tariq al-Jisr', qurtuba, riverside_quarter).
street_condition(tariq_al_jisr, good).
street_traffic(tariq_al_jisr, high).

landmark(great_mosque, 'Al-Masjid al-Kabir', qurtuba, medina).
landmark_historical(great_mosque).
landmark_established(great_mosque, 784).
landmark(roman_bridge, 'Al-Jisr al-Qadim', qurtuba, riverside_quarter).
landmark_historical(roman_bridge).
landmark_established(roman_bridge, 100).
landmark(alcazar_palace, 'Qasr al-Khulafa', qurtuba, alcazar).
landmark_historical(alcazar_palace).
landmark_established(alcazar_palace, 935).
landmark(al_zahira_gardens, 'Hadiqat al-Zahira', qurtuba, alcazar).
landmark_established(al_zahira_gardens, 960).

%% Ishbiliya (Seville)
settlement(ishbiliya, 'Ishbiliya', wilayat_qurtuba, khilafat_qurtuba).
settlement_type(ishbiliya, town).
settlement_founded(ishbiliya, 712).

district(ishbiliya_medina, 'Medina Ishbiliya', ishbiliya).
district_wealth(ishbiliya_medina, 70).
district_crime(ishbiliya_medina, 30).
district_established(ishbiliya_medina, 712).
district(triana, 'Taryana', ishbiliya).
district_wealth(triana, 50).
district_crime(triana, 40).
district_established(triana, 800).

street(tariq_al_bahr, 'Tariq al-Bahr', ishbiliya, ishbiliya_medina).
street_condition(tariq_al_bahr, good).
street_traffic(tariq_al_bahr, high).
street(zuqaq_al_hara, 'Zuqaq al-Hara', ishbiliya, triana).
street_condition(zuqaq_al_hara, poor).
street_traffic(zuqaq_al_hara, low).

landmark(ishbiliya_alcazar, 'Qasr Ishbiliya', ishbiliya, ishbiliya_medina).
landmark_historical(ishbiliya_alcazar).
landmark_established(ishbiliya_alcazar, 720).
