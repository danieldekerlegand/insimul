%% Insimul Settlements: Cyberpunk Megacity
%% Source: data/worlds/cyberpunk/settlements.pl
%% Created: 2026-04-03
%% Total: 3 settlements (megacity districts)

%% Neo Cascade -- the sprawling megacity
settlement(neo_cascade, 'Neo Cascade', pacific_sprawl, united_corpo_states).
settlement_type(neo_cascade, megacity).
settlement_founded(neo_cascade, 2045).

%% District: Neon Row -- the entertainment and vice district
district(neon_row, 'Neon Row', neo_cascade).
district_wealth(neon_row, 30).
district_crime(neon_row, 85).
district_established(neon_row, 2048).

%% District: Corpo Plaza -- gleaming corporate towers
district(corpo_plaza, 'Corpo Plaza', neo_cascade).
district_wealth(corpo_plaza, 95).
district_crime(corpo_plaza, 15).
district_established(corpo_plaza, 2046).

%% District: The Stacks -- vertical slum housing
district(the_stacks, 'The Stacks', neo_cascade).
district_wealth(the_stacks, 10).
district_crime(the_stacks, 90).
district_established(the_stacks, 2050).

%% District: Silicon Docks -- tech district and data centers
district(silicon_docks, 'Silicon Docks', neo_cascade).
district_wealth(silicon_docks, 70).
district_crime(silicon_docks, 40).
district_established(silicon_docks, 2052).

%% Streets -- Neon Row
street(voltage_avenue, 'Voltage Avenue', neo_cascade, neon_row).
street_condition(voltage_avenue, fair).
street_traffic(voltage_avenue, high).
street(chrome_alley, 'Chrome Alley', neo_cascade, neon_row).
street_condition(chrome_alley, poor).
street_traffic(chrome_alley, medium).
street(synapse_lane, 'Synapse Lane', neo_cascade, neon_row).
street_condition(synapse_lane, poor).
street_traffic(synapse_lane, low).

%% Streets -- Corpo Plaza
street(meridian_boulevard, 'Meridian Boulevard', neo_cascade, corpo_plaza).
street_condition(meridian_boulevard, excellent).
street_traffic(meridian_boulevard, high).
street(tower_promenade, 'Tower Promenade', neo_cascade, corpo_plaza).
street_condition(tower_promenade, excellent).
street_traffic(tower_promenade, medium).

%% Streets -- The Stacks
street(rust_corridor, 'Rust Corridor', neo_cascade, the_stacks).
street_condition(rust_corridor, poor).
street_traffic(rust_corridor, high).
street(pipe_row, 'Pipe Row', neo_cascade, the_stacks).
street_condition(pipe_row, poor).
street_traffic(pipe_row, medium).

%% Streets -- Silicon Docks
street(fiber_drive, 'Fiber Drive', neo_cascade, silicon_docks).
street_condition(fiber_drive, good).
street_traffic(fiber_drive, medium).
street(node_street, 'Node Street', neo_cascade, silicon_docks).
street_condition(node_street, good).
street_traffic(node_street, low).
