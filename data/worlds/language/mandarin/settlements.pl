%% Insimul Settlements: Mandarin Watertown
%% Source: data/worlds/language/mandarin/settlements.pl
%% Created: 2026-04-03
%% Total: 2 settlements

%% Shuixiang Zhen (Water Town)
settlement(shuixiang_zhen, 'Shuixiang Zhen', zhejiang, peoples_republic_of_china).
settlement_type(shuixiang_zhen, town).
settlement_founded(shuixiang_zhen, 872).

district(old_canal, 'Old Canal District', shuixiang_zhen).
district_wealth(old_canal, 60).
district_crime(old_canal, 10).
district_established(old_canal, 872).
district(modern_center, 'Modern Center', shuixiang_zhen).
district_wealth(modern_center, 80).
district_crime(modern_center, 8).
district_established(modern_center, 1995).
district(scholar_garden, 'Scholar Garden District', shuixiang_zhen).
district_wealth(scholar_garden, 75).
district_crime(scholar_garden, 5).
district_established(scholar_garden, 1450).
district(station_quarter, 'Station Quarter', shuixiang_zhen).
district_wealth(station_quarter, 85).
district_crime(station_quarter, 7).
district_established(station_quarter, 2010).

street(heqiao_lu, 'Heqiao Lu', shuixiang_zhen, old_canal).
street_condition(heqiao_lu, good).
street_traffic(heqiao_lu, high).
street(lianhe_jie, 'Lianhe Jie', shuixiang_zhen, old_canal).
street_condition(lianhe_jie, good).
street_traffic(lianhe_jie, high).
street(qingshi_xiang, 'Qingshi Xiang', shuixiang_zhen, old_canal).
street_condition(qingshi_xiang, fair).
street_traffic(qingshi_xiang, medium).
street(zhongshan_lu, 'Zhongshan Lu', shuixiang_zhen, modern_center).
street_condition(zhongshan_lu, good).
street_traffic(zhongshan_lu, high).
street(xinhua_lu, 'Xinhua Lu', shuixiang_zhen, modern_center).
street_condition(xinhua_lu, good).
street_traffic(xinhua_lu, medium).
street(yuanlin_lu, 'Yuanlin Lu', shuixiang_zhen, scholar_garden).
street_condition(yuanlin_lu, good).
street_traffic(yuanlin_lu, medium).
street(gaotie_dadao, 'Gaotie Dadao', shuixiang_zhen, station_quarter).
street_condition(gaotie_dadao, good).
street_traffic(gaotie_dadao, high).

landmark(stone_bridge, 'Stone Arch Bridge', shuixiang_zhen, old_canal).
landmark_historical(stone_bridge).
landmark_established(stone_bridge, 1127).
landmark(canal_pagoda, 'Canal Pagoda', shuixiang_zhen, old_canal).
landmark_historical(canal_pagoda).
landmark_established(canal_pagoda, 1450).
landmark(harmony_garden, 'Harmony Garden', shuixiang_zhen, scholar_garden).
landmark_historical(harmony_garden).
landmark_established(harmony_garden, 1520).
landmark(hsr_station, 'High-Speed Rail Station', shuixiang_zhen, station_quarter).
landmark_established(hsr_station, 2012).

%% Hehua Cun (Lotus Village)
settlement(hehua_cun, 'Hehua Cun', zhejiang, peoples_republic_of_china).
settlement_type(hehua_cun, village).
settlement_founded(hehua_cun, 1200).

district(village_core, 'Village Core', hehua_cun).
district_wealth(village_core, 45).
district_crime(village_core, 3).
district_established(village_core, 1200).

street(hetang_lu, 'Hetang Lu', hehua_cun, village_core).
street_condition(hetang_lu, fair).
street_traffic(hetang_lu, low).
street(sangye_jie, 'Sangye Jie', hehua_cun, village_core).
street_condition(sangye_jie, fair).
street_traffic(sangye_jie, low).
