%% Insimul Settlements: Japanese Town
%% Source: data/worlds/language/japanese/settlements.pl
%% Created: 2026-04-03
%% Total: 2 settlements

%% Sakuragawa (main town)
settlement(sakuragawa, 'Sakuragawa', kansai, japan).
settlement_type(sakuragawa, town).
settlement_founded(sakuragawa, 1580).

district(ekimae, 'Ekimae', sakuragawa).
district_wealth(ekimae, 70).
district_crime(ekimae, 8).
district_established(ekimae, 1920).
district(shotengai, 'Shotengai', sakuragawa).
district_wealth(shotengai, 55).
district_crime(shotengai, 10).
district_established(shotengai, 1600).
district(teramachi, 'Teramachi', sakuragawa).
district_wealth(teramachi, 60).
district_crime(teramachi, 5).
district_established(teramachi, 1580).
district(shinseikatsu, 'Shinseikatsu', sakuragawa).
district_wealth(shinseikatsu, 80).
district_crime(shinseikatsu, 6).
district_established(shinseikatsu, 1990).

street(eki_dori, 'Eki-dori', sakuragawa, ekimae).
street_condition(eki_dori, good).
street_traffic(eki_dori, high).
street(sakura_dori, 'Sakura-dori', sakuragawa, ekimae).
street_condition(sakura_dori, good).
street_traffic(sakura_dori, medium).
street(shotengai_dori, 'Shotengai-dori', sakuragawa, shotengai).
street_condition(shotengai_dori, good).
street_traffic(shotengai_dori, high).
street(ichiba_dori, 'Ichiba-dori', sakuragawa, shotengai).
street_condition(ichiba_dori, fair).
street_traffic(ichiba_dori, medium).
street(tera_dori, 'Tera-dori', sakuragawa, teramachi).
street_condition(tera_dori, good).
street_traffic(tera_dori, low).
street(kawa_dori, 'Kawa-dori', sakuragawa, teramachi).
street_condition(kawa_dori, good).
street_traffic(kawa_dori, low).
street(office_dori, 'Office-dori', sakuragawa, shinseikatsu).
street_condition(office_dori, good).
street_traffic(office_dori, medium).
street(midori_dori, 'Midori-dori', sakuragawa, shinseikatsu).
street_condition(midori_dori, good).
street_traffic(midori_dori, medium).

landmark(sakuragawa_station, 'Sakuragawa Station', sakuragawa, ekimae).
landmark_established(sakuragawa_station, 1920).
landmark(shotengai_gate, 'Shotengai Arcade Gate', sakuragawa, shotengai).
landmark_historical(shotengai_gate).
landmark_established(shotengai_gate, 1955).
landmark(komyoji_temple, 'Komyoji Temple', sakuragawa, teramachi).
landmark_historical(komyoji_temple).
landmark_established(komyoji_temple, 1580).
landmark(sakuragawa_clock_tower, 'Clock Tower', sakuragawa, shinseikatsu).
landmark_established(sakuragawa_clock_tower, 1995).

%% Yamanoue (mountain village)
settlement(yamanoue, 'Yamanoue', kansai, japan).
settlement_type(yamanoue, village).
settlement_founded(yamanoue, 1400).

district(mura_center, 'Mura Center', yamanoue).
district_wealth(mura_center, 40).
district_crime(mura_center, 2).
district_established(mura_center, 1400).

street(yama_dori, 'Yama-dori', yamanoue, mura_center).
street_condition(yama_dori, fair).
street_traffic(yama_dori, low).
street(tanbo_dori, 'Tanbo-dori', yamanoue, mura_center).
street_condition(tanbo_dori, fair).
street_traffic(tanbo_dori, low).
