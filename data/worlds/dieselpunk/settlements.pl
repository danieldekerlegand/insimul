%% Insimul Settlements: Dieselpunk
%% Source: data/worlds/dieselpunk/settlements.pl
%% Created: 2026-04-03
%% Total: 3 settlements

%% Ironhaven — Major industrial city and airship hub
settlement(ironhaven, 'Ironhaven', eastern_reaches, diesel_republic).
settlement_type(ironhaven, city).
settlement_founded(ironhaven, 1889).

district(factory_row, 'Factory Row', ironhaven).
district_wealth(factory_row, 35).
district_crime(factory_row, 40).
district_established(factory_row, 1892).
district(sky_quarter, 'Sky Quarter', ironhaven).
district_wealth(sky_quarter, 85).
district_crime(sky_quarter, 10).
district_established(sky_quarter, 1910).
district(the_underbelly, 'The Underbelly', ironhaven).
district_wealth(the_underbelly, 20).
district_crime(the_underbelly, 65).
district_established(the_underbelly, 1905).
district(command_heights, 'Command Heights', ironhaven).
district_wealth(command_heights, 90).
district_crime(command_heights, 5).
district_established(command_heights, 1920).

street(rivet_lane, 'Rivet Lane', ironhaven, factory_row).
street_condition(rivet_lane, poor).
street_traffic(rivet_lane, high).
street(piston_avenue, 'Piston Avenue', ironhaven, factory_row).
street_condition(piston_avenue, fair).
street_traffic(piston_avenue, high).
street(gantry_road, 'Gantry Road', ironhaven, sky_quarter).
street_condition(gantry_road, good).
street_traffic(gantry_road, medium).
street(cloudwalk_promenade, 'Cloudwalk Promenade', ironhaven, sky_quarter).
street_condition(cloudwalk_promenade, good).
street_traffic(cloudwalk_promenade, medium).
street(soot_alley, 'Soot Alley', ironhaven, the_underbelly).
street_condition(soot_alley, poor).
street_traffic(soot_alley, low).
street(gaslight_row, 'Gaslight Row', ironhaven, the_underbelly).
street_condition(gaslight_row, fair).
street_traffic(gaslight_row, medium).
street(brass_boulevard, 'Brass Boulevard', ironhaven, command_heights).
street_condition(brass_boulevard, good).
street_traffic(brass_boulevard, low).
street(marshal_way, 'Marshal Way', ironhaven, command_heights).
street_condition(marshal_way, good).
street_traffic(marshal_way, low).

landmark(iron_tower, 'Iron Tower', ironhaven, factory_row).
landmark_historical(iron_tower).
landmark_established(iron_tower, 1895).
landmark(airship_spire, 'Airship Spire', ironhaven, sky_quarter).
landmark_historical(airship_spire).
landmark_established(airship_spire, 1915).
landmark(war_memorial, 'War Memorial', ironhaven, command_heights).
landmark_established(war_memorial, 1935).

%% Ashford Junction — Railway and refinery town
settlement(ashford_junction, 'Ashford Junction', western_lowlands, diesel_republic).
settlement_type(ashford_junction, town).
settlement_founded(ashford_junction, 1901).

district(rail_yard_district, 'Rail Yard District', ashford_junction).
district_wealth(rail_yard_district, 40).
district_crime(rail_yard_district, 30).
district_established(rail_yard_district, 1901).
district(refinery_flats, 'Refinery Flats', ashford_junction).
district_wealth(refinery_flats, 30).
district_crime(refinery_flats, 35).
district_established(refinery_flats, 1912).

street(junction_road, 'Junction Road', ashford_junction, rail_yard_district).
street_condition(junction_road, fair).
street_traffic(junction_road, high).
street(coal_street, 'Coal Street', ashford_junction, rail_yard_district).
street_condition(coal_street, poor).
street_traffic(coal_street, medium).
street(pipeline_way, 'Pipeline Way', ashford_junction, refinery_flats).
street_condition(pipeline_way, fair).
street_traffic(pipeline_way, medium).
street(furnace_lane, 'Furnace Lane', ashford_junction, refinery_flats).
street_condition(furnace_lane, poor).
street_traffic(furnace_lane, low).

landmark(central_depot, 'Central Depot', ashford_junction, rail_yard_district).
landmark_historical(central_depot).
landmark_established(central_depot, 1903).

%% Grimhollow — Mining outpost at the edge of contested territory
settlement(grimhollow, 'Grimhollow', northern_barrens, diesel_republic).
settlement_type(grimhollow, outpost).
settlement_founded(grimhollow, 1918).

district(miners_camp, 'Miners Camp', grimhollow).
district_wealth(miners_camp, 25).
district_crime(miners_camp, 45).
district_established(miners_camp, 1918).

street(ore_trail, 'Ore Trail', grimhollow, miners_camp).
street_condition(ore_trail, poor).
street_traffic(ore_trail, low).
street(shale_pass, 'Shale Pass', grimhollow, miners_camp).
street_condition(shale_pass, poor).
street_traffic(shale_pass, low).
