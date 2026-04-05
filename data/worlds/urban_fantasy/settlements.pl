%% Insimul Settlements: Urban Fantasy
%% Source: data/worlds/urban_fantasy/settlements.pl
%% Created: 2026-04-03
%% Total: 3 settlements

%% Veilhaven (Main City)
settlement(veilhaven, 'Veilhaven', metro_region, united_states).
settlement_type(veilhaven, city).
settlement_founded(veilhaven, 1847).

district(downtown_core, 'Downtown Core', veilhaven).
district_wealth(downtown_core, 75).
district_crime(downtown_core, 25).
district_established(downtown_core, 1847).
district(old_quarter, 'Old Quarter', veilhaven).
district_wealth(old_quarter, 50).
district_crime(old_quarter, 35).
district_established(old_quarter, 1860).
district(university_hill, 'University Hill', veilhaven).
district_wealth(university_hill, 65).
district_crime(university_hill, 12).
district_established(university_hill, 1920).
district(docklands, 'Docklands', veilhaven).
district_wealth(docklands, 40).
district_crime(docklands, 45).
district_established(docklands, 1870).
district(silver_heights, 'Silver Heights', veilhaven).
district_wealth(silver_heights, 90).
district_crime(silver_heights, 5).
district_established(silver_heights, 1955).

street(meridian_avenue, 'Meridian Avenue', veilhaven, downtown_core).
street_condition(meridian_avenue, good).
street_traffic(meridian_avenue, high).
street(cobalt_street, 'Cobalt Street', veilhaven, downtown_core).
street_condition(cobalt_street, good).
street_traffic(cobalt_street, high).
street(whisper_lane, 'Whisper Lane', veilhaven, old_quarter).
street_condition(whisper_lane, fair).
street_traffic(whisper_lane, low).
street(thornwall_road, 'Thornwall Road', veilhaven, old_quarter).
street_condition(thornwall_road, fair).
street_traffic(thornwall_road, medium).
street(campus_drive, 'Campus Drive', veilhaven, university_hill).
street_condition(campus_drive, good).
street_traffic(campus_drive, medium).
street(library_walk, 'Library Walk', veilhaven, university_hill).
street_condition(library_walk, good).
street_traffic(library_walk, medium).
street(harborfront_way, 'Harborfront Way', veilhaven, docklands).
street_condition(harborfront_way, fair).
street_traffic(harborfront_way, medium).
street(pier_street, 'Pier Street', veilhaven, docklands).
street_condition(pier_street, poor).
street_traffic(pier_street, low).
street(crescent_boulevard, 'Crescent Boulevard', veilhaven, silver_heights).
street_condition(crescent_boulevard, good).
street_traffic(crescent_boulevard, low).
street(moonrise_terrace, 'Moonrise Terrace', veilhaven, silver_heights).
street_condition(moonrise_terrace, good).
street_traffic(moonrise_terrace, low).

landmark(central_station, 'Central Station', veilhaven, downtown_core).
landmark_historical(central_station).
landmark_established(central_station, 1903).
landmark(thornwall_gate, 'Thornwall Gate', veilhaven, old_quarter).
landmark_historical(thornwall_gate).
landmark_established(thornwall_gate, 1865).
landmark(bell_tower, 'Bell Tower', veilhaven, university_hill).
landmark_established(bell_tower, 1925).
landmark(iron_harbor_bridge, 'Iron Harbor Bridge', veilhaven, docklands).
landmark_historical(iron_harbor_bridge).
landmark_established(iron_harbor_bridge, 1890).

%% Hollowmere (Suburb / Fae Borderlands)
settlement(hollowmere, 'Hollowmere', metro_region, united_states).
settlement_type(hollowmere, town).
settlement_founded(hollowmere, 1902).

district(hollowmere_commons, 'Hollowmere Commons', hollowmere).
district_wealth(hollowmere_commons, 55).
district_crime(hollowmere_commons, 15).
district_established(hollowmere_commons, 1902).
district(briarwood, 'Briarwood', hollowmere).
district_wealth(briarwood, 35).
district_crime(briarwood, 10).
district_established(briarwood, 1910).

street(main_street_hm, 'Main Street', hollowmere, hollowmere_commons).
street_condition(main_street_hm, good).
street_traffic(main_street_hm, medium).
street(briarwood_path, 'Briarwood Path', hollowmere, briarwood).
street_condition(briarwood_path, fair).
street_traffic(briarwood_path, low).

%% Underreach (Hidden Subway Network)
settlement(underreach, 'The Underreach', metro_region, united_states).
settlement_type(underreach, enclave).
settlement_founded(underreach, 1903).

district(transit_nexus, 'Transit Nexus', underreach).
district_wealth(transit_nexus, 60).
district_crime(transit_nexus, 30).
district_established(transit_nexus, 1903).

street(platform_zero, 'Platform Zero', underreach, transit_nexus).
street_condition(platform_zero, fair).
street_traffic(platform_zero, low).
