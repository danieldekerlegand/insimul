%% Insimul Settlements: Breton Coast
%% Source: data/worlds/language/breton/settlements.pl
%% Created: 2026-04-03
%% Total: 2 settlements

%% Porzh-Gwenn (White Harbor) -- coastal town
settlement(porzh_gwenn, 'Porzh-Gwenn', bro_leon, republik_breizh).
settlement_type(porzh_gwenn, town).
settlement_founded(porzh_gwenn, 1350).

district(kae_porzh, 'Kae Porzh', porzh_gwenn).
district_wealth(kae_porzh, 65).
district_crime(kae_porzh, 15).
district_established(kae_porzh, 1350).
district(kreiz_ker, 'Kreiz-Ker', porzh_gwenn).
district_wealth(kreiz_ker, 70).
district_crime(kreiz_ker, 10).
district_established(kreiz_ker, 1400).
district(penn_ar_bed, 'Penn ar Bed', porzh_gwenn).
district_wealth(penn_ar_bed, 55).
district_crime(penn_ar_bed, 8).
district_established(penn_ar_bed, 1500).

street(straed_ar_mor, 'Straed ar Mor', porzh_gwenn, kae_porzh).
street_condition(straed_ar_mor, good).
street_traffic(straed_ar_mor, high).
street(straed_ar_pesked, 'Straed ar Pesked', porzh_gwenn, kae_porzh).
street_condition(straed_ar_pesked, fair).
street_traffic(straed_ar_pesked, medium).
street(straed_ar_vro, 'Straed ar Vro', porzh_gwenn, kreiz_ker).
street_condition(straed_ar_vro, good).
street_traffic(straed_ar_vro, high).
street(straed_sant_gwenole, 'Straed Sant Gwenole', porzh_gwenn, kreiz_ker).
street_condition(straed_sant_gwenole, good).
street_traffic(straed_sant_gwenole, medium).
street(straed_an_iliz, 'Straed an Iliz', porzh_gwenn, kreiz_ker).
street_condition(straed_an_iliz, good).
street_traffic(straed_an_iliz, medium).
street(hent_penn_ar_bed, 'Hent Penn ar Bed', porzh_gwenn, penn_ar_bed).
street_condition(hent_penn_ar_bed, good).
street_traffic(hent_penn_ar_bed, low).

landmark(tour_ar_c_hleier, 'Tour ar Chleier', porzh_gwenn, kae_porzh).
landmark_historical(tour_ar_c_hleier).
landmark_established(tour_ar_c_hleier, 1650).
landmark(iliz_sant_gwenole, 'Iliz Sant Gwenole', porzh_gwenn, kreiz_ker).
landmark_historical(iliz_sant_gwenole).
landmark_established(iliz_sant_gwenole, 1420).
landmark(mein_hir_penn_ar_bed, 'Mein-Hir Penn ar Bed', porzh_gwenn, penn_ar_bed).
landmark_historical(mein_hir_penn_ar_bed).
landmark_established(mein_hir_penn_ar_bed, -3000).

%% Lann-Vraz (Great Heath) -- inland village
settlement(lann_vraz, 'Lann-Vraz', bro_leon, republik_breizh).
settlement_type(lann_vraz, village).
settlement_founded(lann_vraz, 1500).

district(kreiz_bourg, 'Kreiz-Bourg', lann_vraz).
district_wealth(kreiz_bourg, 45).
district_crime(kreiz_bourg, 5).
district_established(kreiz_bourg, 1500).

street(straed_ar_lann, 'Straed ar Lann', lann_vraz, kreiz_bourg).
street_condition(straed_ar_lann, fair).
street_traffic(straed_ar_lann, low).
street(straed_ar_c_hoat, 'Straed ar Choat', lann_vraz, kreiz_bourg).
street_condition(straed_ar_c_hoat, fair).
street_traffic(straed_ar_c_hoat, low).
