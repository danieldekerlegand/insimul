%% Insimul Settlements: Bengali Riverside Town
%% Source: data/worlds/language/bengali/settlements.pl
%% Created: 2026-04-03
%% Total: 2 settlements

%% Nodi Gram (River Town)
settlement(nodi_gram, 'Nodi Gram', dhaka_division, peoples_republic_of_bangladesh).
settlement_type(nodi_gram, town).
settlement_founded(nodi_gram, 1850).

district(puran_palli, 'Puran Palli', nodi_gram).
district_wealth(puran_palli, 50).
district_crime(puran_palli, 15).
district_established(puran_palli, 1850).
district(bazaar_para, 'Bazaar Para', nodi_gram).
district_wealth(bazaar_para, 60).
district_crime(bazaar_para, 18).
district_established(bazaar_para, 1900).
district(bishwobidyalay_para, 'Bishwobidyalay Para', nodi_gram).
district_wealth(bishwobidyalay_para, 70).
district_crime(bishwobidyalay_para, 8).
district_established(bishwobidyalay_para, 1970).
district(nodi_ghat, 'Nodi Ghat', nodi_gram).
district_wealth(nodi_ghat, 45).
district_crime(nodi_ghat, 12).
district_established(nodi_ghat, 1860).

street(goli_rasta, 'Goli Rasta', nodi_gram, puran_palli).
street_condition(goli_rasta, fair).
street_traffic(goli_rasta, high).
street(mandir_lane, 'Mandir Lane', nodi_gram, puran_palli).
street_condition(mandir_lane, fair).
street_traffic(mandir_lane, medium).
street(masjid_road, 'Masjid Road', nodi_gram, puran_palli).
street_condition(masjid_road, good).
street_traffic(masjid_road, medium).
street(kapor_goli, 'Kapor Goli', nodi_gram, bazaar_para).
street_condition(kapor_goli, fair).
street_traffic(kapor_goli, high).
street(mach_bazaar_road, 'Mach Bazaar Road', nodi_gram, bazaar_para).
street_condition(mach_bazaar_road, fair).
street_traffic(mach_bazaar_road, high).
street(university_road, 'University Road', nodi_gram, bishwobidyalay_para).
street_condition(university_road, good).
street_traffic(university_road, medium).
street(shikkha_lane, 'Shikkha Lane', nodi_gram, bishwobidyalay_para).
street_condition(shikkha_lane, good).
street_traffic(shikkha_lane, medium).
street(ghat_road, 'Ghat Road', nodi_gram, nodi_ghat).
street_condition(ghat_road, fair).
street_traffic(ghat_road, medium).

landmark(jami_masjid, 'Jami Masjid', nodi_gram, puran_palli).
landmark_historical(jami_masjid).
landmark_established(jami_masjid, 1880).
landmark(shahid_minar, 'Shahid Minar', nodi_gram, bishwobidyalay_para).
landmark_historical(shahid_minar).
landmark_established(shahid_minar, 1972).
landmark(nodi_ghat_steps, 'Nodi Ghat Steps', nodi_gram, nodi_ghat).
landmark_historical(nodi_ghat_steps).
landmark_established(nodi_ghat_steps, 1860).
landmark(banyan_tree, 'Boro Bot Gach', nodi_gram, puran_palli).
landmark_established(banyan_tree, 1900).

%% Shonar Gaon (Golden Village)
settlement(shonar_gaon, 'Shonar Gaon', dhaka_division, peoples_republic_of_bangladesh).
settlement_type(shonar_gaon, village).
settlement_founded(shonar_gaon, 1800).

district(gram_kendra, 'Gram Kendra', shonar_gaon).
district_wealth(gram_kendra, 35).
district_crime(gram_kendra, 3).
district_established(gram_kendra, 1800).

street(dhan_khet_path, 'Dhan Khet Path', shonar_gaon, gram_kendra).
street_condition(dhan_khet_path, fair).
street_traffic(dhan_khet_path, low).
street(nodi_par_path, 'Nodi Par Path', shonar_gaon, gram_kendra).
street_condition(nodi_par_path, fair).
street_traffic(nodi_par_path, low).
