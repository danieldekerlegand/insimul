%% Insimul Quests: Solarpunk Eco-Communities
%% Source: data/worlds/solarpunk/quests.pl
%% Created: 2026-04-03
%% Total: 12 quests

%% Quest: Welcome to the Commons
quest(welcome_commons, 'Welcome to the Commons', exploration, beginner, active).
quest_assigned_to(welcome_commons, '{{player}}').
quest_tag(welcome_commons, generated).
quest_objective(welcome_commons, 0, talk_to('elena_vasquez', 1)).
quest_objective(welcome_commons, 1, objective('Tour the four districts of Heliotrope Commons.')).
quest_objective(welcome_commons, 2, objective('Register at the Community Hall and receive your labor tokens.')).
quest_reward(welcome_commons, experience, 100).
quest_reward(welcome_commons, gold, 50).
quest_available(Player, welcome_commons) :-
    quest(welcome_commons, _, _, _, active).

%% Quest: Solar Workshop Basics
quest(solar_basics, 'Solar Workshop Basics', fetch, beginner, active).
quest_assigned_to(solar_basics, '{{player}}').
quest_tag(solar_basics, generated).
quest_objective(solar_basics, 0, talk_to('emeka_okafor', 1)).
quest_objective(solar_basics, 1, objective('Learn the basics of solar panel assembly.')).
quest_objective(solar_basics, 2, objective('Install a small solar panel on a community shed.')).
quest_reward(solar_basics, experience, 120).
quest_reward(solar_basics, gold, 60).
quest_available(Player, solar_basics) :-
    quest(solar_basics, _, _, _, active).

%% Quest: Seed Saving
quest(seed_saving, 'Seed Saving', conversation, beginner, active).
quest_assigned_to(seed_saving, '{{player}}').
quest_tag(seed_saving, generated).
quest_objective(seed_saving, 0, talk_to('priya_tanaka', 1)).
quest_objective(seed_saving, 1, objective('Harvest seeds from mature plants in the vertical farm.')).
quest_objective(seed_saving, 2, objective('Catalog and store them in the Seed Vault Tower.')).
quest_reward(seed_saving, experience, 100).
quest_reward(seed_saving, gold, 50).
quest_available(Player, seed_saving) :-
    quest(seed_saving, _, _, _, active).

%% Quest: Mushroom Mysteries
quest(mushroom_mysteries, 'Mushroom Mysteries', exploration, beginner, active).
quest_assigned_to(mushroom_mysteries, '{{player}}').
quest_tag(mushroom_mysteries, generated).
quest_objective(mushroom_mysteries, 0, talk_to('olu_adeyemi', 1)).
quest_objective(mushroom_mysteries, 1, objective('Explore the Mycelium Quarter and learn about fungal networks.')).
quest_objective(mushroom_mysteries, 2, objective('Collect spore samples from three different mushroom species.')).
quest_reward(mushroom_mysteries, experience, 130).
quest_reward(mushroom_mysteries, gold, 65).
quest_available(Player, mushroom_mysteries) :-
    quest(mushroom_mysteries, _, _, _, active).

%% Quest: Community Kitchen Day
quest(kitchen_day, 'Community Kitchen Day', conversation, intermediate, active).
quest_assigned_to(kitchen_day, '{{player}}').
quest_tag(kitchen_day, generated).
quest_objective(kitchen_day, 0, objective('Visit the Community Kitchen on Garden Way.')).
quest_objective(kitchen_day, 1, objective('Help prepare a meal using only locally grown ingredients.')).
quest_objective(kitchen_day, 2, objective('Serve food to ten community members and learn their stories.')).
quest_reward(kitchen_day, experience, 200).
quest_reward(kitchen_day, gold, 100).
quest_available(Player, kitchen_day) :-
    quest(kitchen_day, _, _, _, active).

%% Quest: Reef Restoration
quest(reef_restoration, 'Reef Restoration', exploration, intermediate, active).
quest_assigned_to(reef_restoration, '{{player}}').
quest_tag(reef_restoration, generated).
quest_objective(reef_restoration, 0, talk_to('astrid_maren', 1)).
quest_objective(reef_restoration, 1, objective('Dive to the coral nursery off Tidecrest Village.')).
quest_objective(reef_restoration, 2, objective('Plant five coral fragments on the restoration reef.')).
quest_objective(reef_restoration, 3, objective('Monitor water quality with a pH sensor.')).
quest_reward(reef_restoration, experience, 250).
quest_reward(reef_restoration, gold, 120).
quest_available(Player, reef_restoration) :-
    quest(reef_restoration, _, _, _, active).

%% Quest: The Forest Census
quest(forest_census, 'The Forest Census', exploration, intermediate, active).
quest_assigned_to(forest_census, '{{player}}').
quest_tag(forest_census, generated).
quest_objective(forest_census, 0, talk_to('wren_calloway', 1)).
quest_objective(forest_census, 1, objective('Survey tree growth in three sectors of the restored forest.')).
quest_objective(forest_census, 2, objective('Identify any invasive species and mark them for removal.')).
quest_objective(forest_census, 3, objective('Record wildlife observations in the field journal.')).
quest_reward(forest_census, experience, 250).
quest_reward(forest_census, gold, 130).
quest_available(Player, forest_census) :-
    quest(forest_census, _, _, _, active).

%% Quest: Wind Turbine Assembly
quest(wind_turbine, 'Wind Turbine Assembly', fetch, intermediate, active).
quest_assigned_to(wind_turbine, '{{player}}').
quest_tag(wind_turbine, generated).
quest_objective(wind_turbine, 0, talk_to('emeka_okafor', 1)).
quest_objective(wind_turbine, 1, objective('Gather three wind turbine components from workshops across Heliotrope.')).
quest_objective(wind_turbine, 2, objective('Transport them to the ridge installation site.')).
quest_objective(wind_turbine, 3, objective('Help the engineering team with final assembly.')).
quest_reward(wind_turbine, experience, 280).
quest_reward(wind_turbine, gold, 140).
quest_available(Player, wind_turbine) :-
    quest(wind_turbine, _, _, _, active).

%% Quest: Mycelium Network Expansion
quest(mycelium_expansion, 'Mycelium Network Expansion', exploration, advanced, active).
quest_assigned_to(mycelium_expansion, '{{player}}').
quest_tag(mycelium_expansion, generated).
quest_objective(mycelium_expansion, 0, talk_to('olu_adeyemi', 1)).
quest_objective(mycelium_expansion, 1, objective('Map the existing underground mycelium communication network.')).
quest_objective(mycelium_expansion, 2, objective('Identify dead zones where the network has not reached.')).
quest_objective(mycelium_expansion, 3, objective('Inoculate three new sites to expand the network to Roothold Hamlet.')).
quest_reward(mycelium_expansion, experience, 400).
quest_reward(mycelium_expansion, gold, 200).
quest_available(Player, mycelium_expansion) :-
    quest(mycelium_expansion, _, _, _, active).

%% Quest: The Water Dispute
quest(water_dispute, 'The Water Dispute', conversation, advanced, active).
quest_assigned_to(water_dispute, '{{player}}').
quest_tag(water_dispute, generated).
quest_objective(water_dispute, 0, talk_to('elena_vasquez', 1)).
quest_objective(water_dispute, 1, objective('Investigate competing water usage claims between Heliotrope and Tidecrest.')).
quest_objective(water_dispute, 2, objective('Gather data on watershed flows and usage patterns.')).
quest_objective(water_dispute, 3, objective('Propose a fair water-sharing agreement at the community council.')).
quest_reward(water_dispute, experience, 450).
quest_reward(water_dispute, gold, 220).
quest_available(Player, water_dispute) :-
    quest(water_dispute, _, _, _, active).

%% Quest: Tidal Energy Innovation
quest(tidal_innovation, 'Tidal Energy Innovation', fetch, advanced, active).
quest_assigned_to(tidal_innovation, '{{player}}').
quest_tag(tidal_innovation, generated).
quest_objective(tidal_innovation, 0, talk_to('soren_maren', 1)).
quest_objective(tidal_innovation, 1, objective('Study the existing tidal turbine design.')).
quest_objective(tidal_innovation, 2, objective('Prototype an improved turbine blade using bio-plastic composites.')).
quest_objective(tidal_innovation, 3, objective('Install and test the prototype during high tide.')).
quest_reward(tidal_innovation, experience, 400).
quest_reward(tidal_innovation, gold, 200).
quest_available(Player, tidal_innovation) :-
    quest(tidal_innovation, _, _, _, active).

%% Quest: The Great Pollinator Project
quest(pollinator_project, 'The Great Pollinator Project', exploration, advanced, active).
quest_assigned_to(pollinator_project, '{{player}}').
quest_tag(pollinator_project, generated).
quest_objective(pollinator_project, 0, talk_to('hiro_tanaka', 1)).
quest_objective(pollinator_project, 1, objective('Build and install bee hotels in five locations across the communities.')).
quest_objective(pollinator_project, 2, objective('Plant pollinator-friendly wildflower corridors between settlements.')).
quest_objective(pollinator_project, 3, objective('Document the first pollinator visitors and their species.')).
quest_reward(pollinator_project, experience, 350).
quest_reward(pollinator_project, gold, 180).
quest_available(Player, pollinator_project) :-
    quest(pollinator_project, _, _, _, active).
