%% Insimul Settlements: Medieval Brittany
%% Source: data/worlds/language/breton/settlements.pl
%% Created: 2026-04-03
%% Total: 2 settlements

%% Porzh-Gwenn (White Harbour)
settlement(porzh_gwenn, 'Porzh-Gwenn', bro_leon, dugelezh_breizh).
settlement_type(porzh_gwenn, village).
settlement_founded(porzh_gwenn, 1087).

district(kêr_ar_mor, 'Kêr ar Mor', porzh_gwenn).
district_wealth(kêr_ar_mor, 52).
district_crime(kêr_ar_mor, 18).
district_established(kêr_ar_mor, 1087).
district(kêr_uhel, 'Kêr Uhel', porzh_gwenn).
district_wealth(kêr_uhel, 74).
district_crime(kêr_uhel, 12).
district_established(kêr_uhel, 1120).
street(hent_ar_porzh, 'Hent ar Porzh', porzh_gwenn, kêr_ar_mor).
street_condition(hent_ar_porzh, good).
street_traffic(hent_ar_porzh, high).
street(hent_ar_chapel, 'Hent ar Chapel', porzh_gwenn, kêr_ar_mor).
street_condition(hent_ar_chapel, good).
street_traffic(hent_ar_chapel, low).
street(hent_ar_mein_hir, 'Hent ar Mein Hir', porzh_gwenn, kêr_ar_mor).
street_condition(hent_ar_mein_hir, poor).
street_traffic(hent_ar_mein_hir, low).
street(hent_ar_c_hastell, 'Hent ar C''hastell', porzh_gwenn, kêr_uhel).
street_condition(hent_ar_c_hastell, good).
street_traffic(hent_ar_c_hastell, high).
street(hent_ar_park, 'Hent ar Park', porzh_gwenn, kêr_uhel).
street_condition(hent_ar_park, good).
street_traffic(hent_ar_park, low).
street(hent_ar_gouelioù, 'Hent ar Gouelioù', porzh_gwenn, kêr_uhel).
street_condition(hent_ar_gouelioù, poor).
street_traffic(hent_ar_gouelioù, low).
landmark(ar_mein_hir, 'Ar Mein Hir', porzh_gwenn, kêr_ar_mor).
landmark_historical(ar_mein_hir).
landmark_established(ar_mein_hir, 500).
landmark(chapel_santez_anna, 'Chapel Santez Anna', porzh_gwenn, kêr_ar_mor).
landmark_historical(chapel_santez_anna).
landmark_established(chapel_santez_anna, 1148).
landmark(tour_ar_duk, 'Tour ar Duk', porzh_gwenn, kêr_uhel).
landmark_historical(tour_ar_duk).
landmark_established(tour_ar_duk, 1203).
landmark(kroas_hent, 'Kroas-Hent', porzh_gwenn, kêr_uhel).
landmark_established(kroas_hent, 1165).

%% Lann-Vraz (Great Heath)
settlement(lann_vraz, 'Lann-Vraz', bro_leon, dugelezh_breizh).
settlement_type(lann_vraz, hamlet).
settlement_founded(lann_vraz, 1142).

district(lann_kreiz, 'Lann Kreiz', lann_vraz).
district_wealth(lann_kreiz, 38).
district_crime(lann_kreiz, 8).
district_established(lann_kreiz, 1142).
street(hent_ar_lann, 'Hent ar Lann', lann_vraz, lann_kreiz).
street_condition(hent_ar_lann, poor).
street_traffic(hent_ar_lann, low).
street(hent_ar_c_hoat, 'Hent ar C''hoat', lann_vraz, lann_kreiz).
street_condition(hent_ar_c_hoat, poor).
street_traffic(hent_ar_c_hoat, low).
landmark(dolmen_kozh, 'Dolmen Kozh', lann_vraz, lann_kreiz).
landmark_historical(dolmen_kozh).
landmark_established(dolmen_kozh, 300).
