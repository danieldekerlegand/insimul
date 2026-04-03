%% Insimul Settlements: Mughal Bengal
%% Source: data/worlds/language/bengali/settlements.pl
%% Created: 2026-04-03
%% Total: 2 settlements

%% Sonargaon — historic trading capital of Bengal
settlement(sonargaon, 'Sonargaon', sarkar_sonargaon, subah_bangalah).
settlement_type(sonargaon, town).
settlement_founded(sonargaon, 1281).

district(nagar_kendra, 'Nagar Kendra', sonargaon).
district_wealth(nagar_kendra, 78).
district_crime(nagar_kendra, 30).
district_established(nagar_kendra, 1300).
district(nadi_par, 'Nadi Par', sonargaon).
district_wealth(nadi_par, 65).
district_crime(nadi_par, 25).
district_established(nadi_par, 1320).
district(tanti_para, 'Tanti Para', sonargaon).
district_wealth(tanti_para, 85).
district_crime(tanti_para, 20).
district_established(tanti_para, 1350).

street(rani_path, 'Rani Path', sonargaon, nagar_kendra).
street_condition(rani_path, good).
street_traffic(rani_path, high).
street(haat_gali, 'Haat Gali', sonargaon, nagar_kendra).
street_condition(haat_gali, good).
street_traffic(haat_gali, high).
street(mandir_lane, 'Mandir Lane', sonargaon, nagar_kendra).
street_condition(mandir_lane, good).
street_traffic(mandir_lane, low).
street(ghat_road, 'Ghat Road', sonargaon, nadi_par).
street_condition(ghat_road, good).
street_traffic(ghat_road, high).
street(nauka_gali, 'Nauka Gali', sonargaon, nadi_par).
street_condition(nauka_gali, poor).
street_traffic(nauka_gali, low).
street(nouka_path, 'Nouka Path', sonargaon, nadi_par).
street_condition(nouka_path, good).
street_traffic(nouka_path, high).
street(tant_gali, 'Tant Gali', sonargaon, tanti_para).
street_condition(tant_gali, good).
street_traffic(tant_gali, high).
street(resham_lane, 'Resham Lane', sonargaon, tanti_para).
street_condition(resham_lane, good).
street_traffic(resham_lane, low).

landmark(panam_nagar, 'Panam Nagar', sonargaon, nagar_kendra).
landmark_historical(panam_nagar).
landmark_established(panam_nagar, 1465).
landmark(goaldi_masjid, 'Goaldi Masjid', sonargaon, nagar_kendra).
landmark_historical(goaldi_masjid).
landmark_established(goaldi_masjid, 1519).
landmark(meghna_ghat, 'Meghna Ghat', sonargaon, nadi_par).
landmark_historical(meghna_ghat).
landmark_established(meghna_ghat, 1300).
landmark(isa_khan_tomb, 'Isa Khan Tomb', sonargaon, tanti_para).
landmark_historical(isa_khan_tomb).
landmark_established(isa_khan_tomb, 1548).

%% Chandpur — a smaller riverine trading village
settlement(chandpur, 'Chandpur', sarkar_sonargaon, subah_bangalah).
settlement_type(chandpur, village).
settlement_founded(chandpur, 1420).

district(bazaar_para, 'Bazaar Para', chandpur).
district_wealth(bazaar_para, 55).
district_crime(bazaar_para, 35).
district_established(bazaar_para, 1440).
district(machhiwara, 'Machhiwara', chandpur).
district_wealth(machhiwara, 45).
district_crime(machhiwara, 20).
district_established(machhiwara, 1450).

street(mach_gali, 'Mach Gali', chandpur, machhiwara).
street_condition(mach_gali, poor).
street_traffic(mach_gali, high).
street(nadi_ghat_path, 'Nadi Ghat Path', chandpur, machhiwara).
street_condition(nadi_ghat_path, good).
street_traffic(nadi_ghat_path, low).
street(bazaar_path, 'Bazaar Path', chandpur, bazaar_para).
street_condition(bazaar_path, good).
street_traffic(bazaar_path, high).
street(khal_lane, 'Khal Lane', chandpur, bazaar_para).
street_condition(khal_lane, poor).
street_traffic(khal_lane, low).

landmark(chandpur_ghat, 'Chandpur Ghat', chandpur, machhiwara).
landmark_historical(chandpur_ghat).
landmark_established(chandpur_ghat, 1430).
landmark(bazaar_chowk, 'Bazaar Chowk', chandpur, bazaar_para).
landmark_established(bazaar_chowk, 1500).
