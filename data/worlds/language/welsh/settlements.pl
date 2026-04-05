%% Insimul Settlements: Welsh Valley
%% Source: data/worlds/language/welsh/settlements.json
%% Converted: 2026-04-03T12:00:00Z
%% Total: 2 settlements

%% Cwm Derwen (Oak Valley)
settlement(cwm_derwen, 'Cwm Derwen', gwynedd, gweriniaeth_cymru).
settlement_type(cwm_derwen, town).
settlement_founded(cwm_derwen, 1780).

district(canol_y_dref, 'Canol y Dref', cwm_derwen).
district_wealth(canol_y_dref, 62).
district_crime(canol_y_dref, 30).
district_established(canol_y_dref, 1780).
district(yr_hen_chwarel, 'Yr Hen Chwarel', cwm_derwen).
district_wealth(yr_hen_chwarel, 48).
district_crime(yr_hen_chwarel, 22).
district_established(yr_hen_chwarel, 1820).
district(glan_yr_afon, 'Glan yr Afon', cwm_derwen).
district_wealth(glan_yr_afon, 75).
district_crime(glan_yr_afon, 18).
district_established(glan_yr_afon, 1850).

street(heol_y_bont, 'Heol y Bont', cwm_derwen, canol_y_dref).
street_condition(heol_y_bont, good).
street_traffic(heol_y_bont, high).
street(stryd_fawr, 'Stryd Fawr', cwm_derwen, canol_y_dref).
street_condition(stryd_fawr, good).
street_traffic(stryd_fawr, high).
street(lon_y_capel, 'Lon y Capel', cwm_derwen, canol_y_dref).
street_condition(lon_y_capel, good).
street_traffic(lon_y_capel, low).
street(ffordd_y_chwarel, 'Ffordd y Chwarel', cwm_derwen, yr_hen_chwarel).
street_condition(ffordd_y_chwarel, fair).
street_traffic(ffordd_y_chwarel, low).
street(heol_y_mynydd, 'Heol y Mynydd', cwm_derwen, yr_hen_chwarel).
street_condition(heol_y_mynydd, fair).
street_traffic(heol_y_mynydd, low).
street(ffordd_yr_afon, 'Ffordd yr Afon', cwm_derwen, glan_yr_afon).
street_condition(ffordd_yr_afon, good).
street_traffic(ffordd_yr_afon, medium).
street(lon_y_parc, 'Lon y Parc', cwm_derwen, glan_yr_afon).
street_condition(lon_y_parc, good).
street_traffic(lon_y_parc, medium).

landmark(cofeb_annibyniaeth, 'Cofeb Annibyniaeth', cwm_derwen, canol_y_dref).
landmark_historical(cofeb_annibyniaeth).
landmark_established(cofeb_annibyniaeth, 1946).
landmark(yr_hen_dwr_chwarel, 'Yr Hen Dwr Chwarel', cwm_derwen, yr_hen_chwarel).
landmark_historical(yr_hen_dwr_chwarel).
landmark_established(yr_hen_dwr_chwarel, 1825).
landmark(pont_yr_afon, 'Pont yr Afon', cwm_derwen, glan_yr_afon).
landmark_historical(pont_yr_afon).
landmark_established(pont_yr_afon, 1870).
landmark(maes_rygbi, 'Maes Rygbi Cwm Derwen', cwm_derwen, canol_y_dref).
landmark_established(maes_rygbi, 1920).

%% Llanfynydd (Village in the hills)
settlement(llanfynydd, 'Llanfynydd', gwynedd, gweriniaeth_cymru).
settlement_type(llanfynydd, village).
settlement_founded(llanfynydd, 1650).

district(pentref_llanfynydd, 'Pentref Llanfynydd', llanfynydd).
district_wealth(pentref_llanfynydd, 55).
district_crime(pentref_llanfynydd, 10).
district_established(pentref_llanfynydd, 1650).

street(heol_yr_eglwys, 'Heol yr Eglwys', llanfynydd, pentref_llanfynydd).
street_condition(heol_yr_eglwys, good).
street_traffic(heol_yr_eglwys, low).
street(lon_y_fferm, 'Lon y Fferm', llanfynydd, pentref_llanfynydd).
street_condition(lon_y_fferm, fair).
street_traffic(lon_y_fferm, low).

landmark(eglwys_llanfynydd, 'Eglwys Llanfynydd', llanfynydd, pentref_llanfynydd).
landmark_historical(eglwys_llanfynydd).
landmark_established(eglwys_llanfynydd, 1680).
