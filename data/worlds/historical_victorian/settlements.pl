%% Insimul Settlements: Historical Victorian
%% Source: data/worlds/historical_victorian/settlements.pl
%% Created: 2026-04-03
%% Total: 3 settlements

%% Ironhaven
settlement(ironhaven, 'Ironhaven', northern_county, united_kingdom).
settlement_type(ironhaven, city).
settlement_founded(ironhaven, 1780).

district(factory_district, 'Factory District', ironhaven).
district_wealth(factory_district, 30).
district_crime(factory_district, 55).
district_established(factory_district, 1810).
district(mayfair_quarter, 'Mayfair Quarter', ironhaven).
district_wealth(mayfair_quarter, 95).
district_crime(mayfair_quarter, 5).
district_established(mayfair_quarter, 1790).
district(docklands, 'Docklands', ironhaven).
district_wealth(docklands, 25).
district_crime(docklands, 65).
district_established(docklands, 1800).
district(civic_centre, 'Civic Centre', ironhaven).
district_wealth(civic_centre, 75).
district_crime(civic_centre, 15).
district_established(civic_centre, 1830).
district(chapel_row, 'Chapel Row', ironhaven).
district_wealth(chapel_row, 50).
district_crime(chapel_row, 25).
district_established(chapel_row, 1815).

street(gaslight_lane, 'Gaslight Lane', ironhaven, mayfair_quarter).
street_condition(gaslight_lane, excellent).
street_traffic(gaslight_lane, moderate).
street(mill_road, 'Mill Road', ironhaven, factory_district).
street_condition(mill_road, poor).
street_traffic(mill_road, high).
street(wharf_street, 'Wharf Street', ironhaven, docklands).
street_condition(wharf_street, poor).
street_traffic(wharf_street, high).
street(parliament_row, 'Parliament Row', ironhaven, civic_centre).
street_condition(parliament_row, excellent).
street_traffic(parliament_row, moderate).
street(chapel_street, 'Chapel Street', ironhaven, chapel_row).
street_condition(chapel_street, fair).
street_traffic(chapel_street, moderate).
street(cinder_alley, 'Cinder Alley', ironhaven, factory_district).
street_condition(cinder_alley, poor).
street_traffic(cinder_alley, low).
street(queens_boulevard, 'Queens Boulevard', ironhaven, mayfair_quarter).
street_condition(queens_boulevard, excellent).
street_traffic(queens_boulevard, moderate).

%% Coalbridge
settlement(coalbridge, 'Coalbridge', northern_county, united_kingdom).
settlement_type(coalbridge, town).
settlement_founded(coalbridge, 1820).

district(pit_village, 'Pit Village', coalbridge).
district_wealth(pit_village, 15).
district_crime(pit_village, 40).
district_established(pit_village, 1820).
district(high_street_district, 'High Street District', coalbridge).
district_wealth(high_street_district, 55).
district_crime(high_street_district, 20).
district_established(high_street_district, 1835).

street(colliery_road, 'Colliery Road', coalbridge, pit_village).
street_condition(colliery_road, poor).
street_traffic(colliery_road, high).
street(high_street, 'High Street', coalbridge, high_street_district).
street_condition(high_street, fair).
street_traffic(high_street, moderate).

%% Ashworth Manor (country estate)
settlement(ashworth_estate, 'Ashworth Estate', northern_county, united_kingdom).
settlement_type(ashworth_estate, hamlet).
settlement_founded(ashworth_estate, 1750).

district(estate_grounds, 'Estate Grounds', ashworth_estate).
district_wealth(estate_grounds, 99).
district_crime(estate_grounds, 2).
district_established(estate_grounds, 1750).

street(manor_drive, 'Manor Drive', ashworth_estate, estate_grounds).
street_condition(manor_drive, excellent).
street_traffic(manor_drive, low).
