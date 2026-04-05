%% Insimul Settlements: German Rhineland
%% Source: data/worlds/language/german/settlements.pl
%% Created: 2026-04-03
%% Total: 2 settlements

%% Rheinhausen (main town)
settlement(rheinhausen, 'Rheinhausen', rhineland_palatinate, federal_republic_germany).
settlement_type(rheinhausen, town).
settlement_founded(rheinhausen, 1250).

district(altstadt, 'Altstadt', rheinhausen).
district_wealth(altstadt, 65).
district_crime(altstadt, 10).
district_established(altstadt, 1250).
district(marktplatz_viertel, 'Marktplatz-Viertel', rheinhausen).
district_wealth(marktplatz_viertel, 70).
district_crime(marktplatz_viertel, 8).
district_established(marktplatz_viertel, 1300).
district(universitaetsviertel, 'Universitaetsviertel', rheinhausen).
district_wealth(universitaetsviertel, 75).
district_crime(universitaetsviertel, 5).
district_established(universitaetsviertel, 1970).
district(rheinpromenade, 'Rheinpromenade', rheinhausen).
district_wealth(rheinpromenade, 80).
district_crime(rheinpromenade, 6).
district_established(rheinpromenade, 1890).
district(weinbergviertel, 'Weinbergviertel', rheinhausen).
district_wealth(weinbergviertel, 60).
district_crime(weinbergviertel, 3).
district_established(weinbergviertel, 1400).

street(marktstrasse, 'Marktstrasse', rheinhausen, marktplatz_viertel).
street_condition(marktstrasse, good).
street_traffic(marktstrasse, high).
street(domgasse, 'Domgasse', rheinhausen, altstadt).
street_condition(domgasse, good).
street_traffic(domgasse, medium).
street(kirchstrasse, 'Kirchstrasse', rheinhausen, altstadt).
street_condition(kirchstrasse, good).
street_traffic(kirchstrasse, medium).
street(rathausplatz, 'Rathausplatz', rheinhausen, marktplatz_viertel).
street_condition(rathausplatz, good).
street_traffic(rathausplatz, high).
street(universitaetsstrasse, 'Universitaetsstrasse', rheinhausen, universitaetsviertel).
street_condition(universitaetsstrasse, good).
street_traffic(universitaetsstrasse, medium).
street(studentenweg, 'Studentenweg', rheinhausen, universitaetsviertel).
street_condition(studentenweg, good).
street_traffic(studentenweg, medium).
street(rheinuferweg, 'Rheinuferweg', rheinhausen, rheinpromenade).
street_condition(rheinuferweg, good).
street_traffic(rheinuferweg, high).
street(weinbergweg, 'Weinbergweg', rheinhausen, weinbergviertel).
street_condition(weinbergweg, fair).
street_traffic(weinbergweg, low).

landmark(rathaus, 'Rathaus', rheinhausen, marktplatz_viertel).
landmark_historical(rathaus).
landmark_established(rathaus, 1450).
landmark(marktbrunnen, 'Marktbrunnen', rheinhausen, marktplatz_viertel).
landmark_historical(marktbrunnen).
landmark_established(marktbrunnen, 1520).
landmark(alte_kirche, 'Alte Kirche', rheinhausen, altstadt).
landmark_historical(alte_kirche).
landmark_established(alte_kirche, 1280).
landmark(rheintor, 'Rheintor', rheinhausen, rheinpromenade).
landmark_historical(rheintor).
landmark_established(rheintor, 1350).
landmark(weinbergkapelle, 'Weinbergkapelle', rheinhausen, weinbergviertel).
landmark_historical(weinbergkapelle).
landmark_established(weinbergkapelle, 1500).

%% Weinfeld (wine village)
settlement(weinfeld, 'Weinfeld', rhineland_palatinate, federal_republic_germany).
settlement_type(weinfeld, village).
settlement_founded(weinfeld, 1380).

district(dorfkern, 'Dorfkern', weinfeld).
district_wealth(dorfkern, 50).
district_crime(dorfkern, 2).
district_established(dorfkern, 1380).

street(hauptstrasse_wf, 'Hauptstrasse', weinfeld, dorfkern).
street_condition(hauptstrasse_wf, fair).
street_traffic(hauptstrasse_wf, low).
street(winzerweg, 'Winzerweg', weinfeld, dorfkern).
street_condition(winzerweg, fair).
street_traffic(winzerweg, low).
