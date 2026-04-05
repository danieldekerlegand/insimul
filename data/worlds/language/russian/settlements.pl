%% Insimul Settlements: Russian Volga Town
%% Source: data/worlds/language/russian/settlements.pl
%% Created: 2026-04-03
%% Total: 2 settlements

%% Volzhansk (main town)
settlement(volzhansk, 'Volzhansk', volga_region, russian_federation).
settlement_type(volzhansk, town).
settlement_founded(volzhansk, 1650).

district(stary_gorod, 'Stary Gorod', volzhansk).
district_wealth(stary_gorod, 55).
district_crime(stary_gorod, 15).
district_established(stary_gorod, 1650).
district(sovetsky_rayon, 'Sovetsky Rayon', volzhansk).
district_wealth(sovetsky_rayon, 45).
district_crime(sovetsky_rayon, 20).
district_established(sovetsky_rayon, 1935).
district(naberezhnaya, 'Naberezhnaya', volzhansk).
district_wealth(naberezhnaya, 75).
district_crime(naberezhnaya, 8).
district_established(naberezhnaya, 1990).
district(universitetsky, 'Universitetsky', volzhansk).
district_wealth(universitetsky, 65).
district_crime(universitetsky, 10).
district_established(universitetsky, 1970).

street(ulitsa_lenina, 'Ulitsa Lenina', volzhansk, stary_gorod).
street_condition(ulitsa_lenina, good).
street_traffic(ulitsa_lenina, high).
street(ulitsa_pushkina, 'Ulitsa Pushkina', volzhansk, stary_gorod).
street_condition(ulitsa_pushkina, good).
street_traffic(ulitsa_pushkina, medium).
street(ulitsa_sobornaya, 'Ulitsa Sobornaya', volzhansk, stary_gorod).
street_condition(ulitsa_sobornaya, good).
street_traffic(ulitsa_sobornaya, medium).
street(prospekt_mira, 'Prospekt Mira', volzhansk, sovetsky_rayon).
street_condition(prospekt_mira, fair).
street_traffic(prospekt_mira, high).
street(ulitsa_gagarina, 'Ulitsa Gagarina', volzhansk, sovetsky_rayon).
street_condition(ulitsa_gagarina, fair).
street_traffic(ulitsa_gagarina, medium).
street(naberezhnaya_volgi, 'Naberezhnaya Volgi', volzhansk, naberezhnaya).
street_condition(naberezhnaya_volgi, good).
street_traffic(naberezhnaya_volgi, high).
street(ulitsa_rechnaya, 'Ulitsa Rechnaya', volzhansk, naberezhnaya).
street_condition(ulitsa_rechnaya, good).
street_traffic(ulitsa_rechnaya, medium).
street(ulitsa_universitetskaya, 'Ulitsa Universitetskaya', volzhansk, universitetsky).
street_condition(ulitsa_universitetskaya, good).
street_traffic(ulitsa_universitetskaya, medium).
street(ulitsa_studencheskaya, 'Ulitsa Studencheskaya', volzhansk, universitetsky).
street_condition(ulitsa_studencheskaya, good).
street_traffic(ulitsa_studencheskaya, medium).

landmark(sobor_pokrova, 'Sobor Pokrova', volzhansk, stary_gorod).
landmark_historical(sobor_pokrova).
landmark_established(sobor_pokrova, 1680).
landmark(pamyatnik_leninu, 'Pamyatnik Leninu', volzhansk, sovetsky_rayon).
landmark_historical(pamyatnik_leninu).
landmark_established(pamyatnik_leninu, 1945).
landmark(rechnoj_vokzal, 'Rechnoj Vokzal', volzhansk, naberezhnaya).
landmark_historical(rechnoj_vokzal).
landmark_established(rechnoj_vokzal, 1960).
landmark(berezovaya_roshcha, 'Berezovaya Roshcha', volzhansk, universitetsky).
landmark_established(berezovaya_roshcha, 1975).

%% Rybachye (fishing village)
settlement(rybachye, 'Rybachye', volga_region, russian_federation).
settlement_type(rybachye, village).
settlement_founded(rybachye, 1780).

district(tsentr_sela, 'Tsentr Sela', rybachye).
district_wealth(tsentr_sela, 35).
district_crime(tsentr_sela, 5).
district_established(tsentr_sela, 1780).

street(ulitsa_rybnaya, 'Ulitsa Rybnaya', rybachye, tsentr_sela).
street_condition(ulitsa_rybnaya, fair).
street_traffic(ulitsa_rybnaya, low).
street(ulitsa_beregovaya, 'Ulitsa Beregovaya', rybachye, tsentr_sela).
street_condition(ulitsa_beregovaya, fair).
street_traffic(ulitsa_beregovaya, low).
