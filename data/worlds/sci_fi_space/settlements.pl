%% Insimul Settlements: Sci-Fi Space
%% Source: data/worlds/sci_fi_space/settlements.pl
%% Created: 2026-04-03
%% Total: 3 settlements

%% Nexus Prime Station
settlement(nexus_prime, 'Nexus Prime Station', orion_sector, galactic_federation).
settlement_type(nexus_prime, space_station).
settlement_founded(nexus_prime, 2847).

district(command_ring, 'Command Ring', nexus_prime).
district_wealth(command_ring, 90).
district_crime(command_ring, 5).
district_established(command_ring, 2847).
district(trade_ring, 'Trade Ring', nexus_prime).
district_wealth(trade_ring, 70).
district_crime(trade_ring, 25).
district_established(trade_ring, 2850).
district(habitation_ring, 'Habitation Ring', nexus_prime).
district_wealth(habitation_ring, 55).
district_crime(habitation_ring, 15).
district_established(habitation_ring, 2849).
district(engineering_deck, 'Engineering Deck', nexus_prime).
district_wealth(engineering_deck, 60).
district_crime(engineering_deck, 10).
district_established(engineering_deck, 2847).

street(corridor_alpha, 'Corridor Alpha', nexus_prime, command_ring).
street_condition(corridor_alpha, good).
street_traffic(corridor_alpha, high).
street(corridor_beta, 'Corridor Beta', nexus_prime, trade_ring).
street_condition(corridor_beta, fair).
street_traffic(corridor_beta, high).
street(corridor_gamma, 'Corridor Gamma', nexus_prime, habitation_ring).
street_condition(corridor_gamma, good).
street_traffic(corridor_gamma, medium).
street(corridor_delta, 'Corridor Delta', nexus_prime, engineering_deck).
street_condition(corridor_delta, fair).
street_traffic(corridor_delta, low).

landmark(central_spire, 'Central Spire', nexus_prime, command_ring).
landmark_historical(central_spire).
landmark_established(central_spire, 2847).
landmark(grand_viewport, 'Grand Viewport', nexus_prime, trade_ring).
landmark_established(grand_viewport, 2855).
landmark(memorial_garden, 'Memorial Garden', nexus_prime, habitation_ring).
landmark_established(memorial_garden, 2860).

%% Kepler Colony
settlement(kepler_colony, 'Kepler Colony', kepler_system, galactic_federation).
settlement_type(kepler_colony, colony_dome).
settlement_founded(kepler_colony, 2891).

district(dome_central, 'Dome Central', kepler_colony).
district_wealth(dome_central, 65).
district_crime(dome_central, 10).
district_established(dome_central, 2891).
district(agri_sector, 'Agricultural Sector', kepler_colony).
district_wealth(agri_sector, 45).
district_crime(agri_sector, 5).
district_established(agri_sector, 2893).
district(research_quarter, 'Research Quarter', kepler_colony).
district_wealth(research_quarter, 75).
district_crime(research_quarter, 3).
district_established(research_quarter, 2895).

street(boulevard_one, 'Boulevard One', kepler_colony, dome_central).
street_condition(boulevard_one, good).
street_traffic(boulevard_one, medium).
street(farm_path, 'Farm Path', kepler_colony, agri_sector).
street_condition(farm_path, fair).
street_traffic(farm_path, low).
street(lab_corridor, 'Lab Corridor', kepler_colony, research_quarter).
street_condition(lab_corridor, good).
street_traffic(lab_corridor, medium).

landmark(dome_apex, 'Dome Apex', kepler_colony, dome_central).
landmark_historical(dome_apex).
landmark_established(dome_apex, 2891).
landmark(first_harvest_monument, 'First Harvest Monument', kepler_colony, agri_sector).
landmark_established(first_harvest_monument, 2894).

%% Thassari Drift
settlement(thassari_drift, 'Thassari Drift', neutral_zone, independent).
settlement_type(thassari_drift, trading_post).
settlement_founded(thassari_drift, 2910).

district(bazaar_level, 'Bazaar Level', thassari_drift).
district_wealth(bazaar_level, 50).
district_crime(bazaar_level, 40).
district_established(bazaar_level, 2910).
district(docking_tier, 'Docking Tier', thassari_drift).
district_wealth(docking_tier, 40).
district_crime(docking_tier, 35).
district_established(docking_tier, 2910).

street(main_concourse, 'Main Concourse', thassari_drift, bazaar_level).
street_condition(main_concourse, fair).
street_traffic(main_concourse, high).
street(berth_alley, 'Berth Alley', thassari_drift, docking_tier).
street_condition(berth_alley, poor).
street_traffic(berth_alley, medium).

landmark(arbitration_obelisk, 'Arbitration Obelisk', thassari_drift, bazaar_level).
landmark_established(arbitration_obelisk, 2912).
