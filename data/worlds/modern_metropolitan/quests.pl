%% Insimul Quests: Modern Metropolitan
%% Source: data/worlds/modern_metropolitan/quests.pl
%% Created: 2026-04-03
%% Total: 12 quests

%% ═══════════════════════════════════════════════════════════
%% Career and Professional Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Corner Office
quest(corner_office, 'Corner Office', career, intermediate, active).
quest_assigned_to(corner_office, '{{player}}').
quest_tag(corner_office, generated).
quest_objective(corner_office, 0, talk_to('tech_ceo', 1)).
quest_objective(corner_office, 1, objective('Secure a meeting with David Chen at Chen Technologies HQ.')).
quest_objective(corner_office, 2, objective('Complete three networking events in the Financial District.')).
quest_objective(corner_office, 3, objective('Receive a promotion or job offer from a major firm.')).
quest_reward(corner_office, experience, 300).
quest_reward(corner_office, gold, 200).
quest_available(Player, corner_office) :-
    quest(corner_office, _, _, _, active).

%% Quest: Startup Launch
quest(startup_launch, 'Startup Launch', career, advanced, active).
quest_assigned_to(startup_launch, '{{player}}').
quest_tag(startup_launch, generated).
quest_objective(startup_launch, 0, objective('Draft a business plan at HiveSpace Co-Working.')).
quest_objective(startup_launch, 1, objective('Pitch your idea to three potential investors.')).
quest_objective(startup_launch, 2, talk_to('tech_ceo', 1)).
quest_objective(startup_launch, 3, objective('Secure seed funding and register your company.')).
quest_reward(startup_launch, experience, 500).
quest_reward(startup_launch, gold, 400).
quest_available(Player, startup_launch) :-
    quest(startup_launch, _, _, _, active).

%% Quest: The Big Presentation
quest(big_presentation, 'The Big Presentation', career, beginner, active).
quest_assigned_to(big_presentation, '{{player}}').
quest_tag(big_presentation, generated).
quest_objective(big_presentation, 0, objective('Prepare presentation materials at the co-working space.')).
quest_objective(big_presentation, 1, objective('Practice your pitch with a colleague.')).
quest_objective(big_presentation, 2, objective('Deliver the presentation at Zenith Tower.')).
quest_reward(big_presentation, experience, 150).
quest_reward(big_presentation, gold, 100).
quest_available(Player, big_presentation) :-
    quest(big_presentation, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Community and Social Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Neighborhood Organizer
quest(neighborhood_organizer, 'Neighborhood Organizer', social, intermediate, active).
quest_assigned_to(neighborhood_organizer, '{{player}}').
quest_tag(neighborhood_organizer, generated).
quest_objective(neighborhood_organizer, 0, talk_to('mayor_johnson', 1)).
quest_objective(neighborhood_organizer, 1, objective('Attend a city council meeting at Metro City Hall.')).
quest_objective(neighborhood_organizer, 2, objective('Collect signatures from 20 residents for a community petition.')).
quest_objective(neighborhood_organizer, 3, objective('Organize a block party in Riverside Park.')).
quest_reward(neighborhood_organizer, experience, 250).
quest_reward(neighborhood_organizer, gold, 150).
quest_available(Player, neighborhood_organizer) :-
    quest(neighborhood_organizer, _, _, _, active).

%% Quest: Volunteer Corps
quest(volunteer_corps, 'Volunteer Corps', social, beginner, active).
quest_assigned_to(volunteer_corps, '{{player}}').
quest_tag(volunteer_corps, generated).
quest_objective(volunteer_corps, 0, objective('Sign up at the community center.')).
quest_objective(volunteer_corps, 1, objective('Volunteer at the Riverside Farmers Market.')).
quest_objective(volunteer_corps, 2, objective('Help organize a food drive for underserved neighborhoods.')).
quest_reward(volunteer_corps, experience, 150).
quest_reward(volunteer_corps, gold, 75).
quest_available(Player, volunteer_corps) :-
    quest(volunteer_corps, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Arts and Culture Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Gallery Opening Night
quest(gallery_opening, 'Gallery Opening Night', creative, intermediate, active).
quest_assigned_to(gallery_opening, '{{player}}').
quest_tag(gallery_opening, generated).
quest_objective(gallery_opening, 0, talk_to('artist_rodriguez', 1)).
quest_objective(gallery_opening, 1, objective('Help Maria set up her exhibition at Spectrum Gallery.')).
quest_objective(gallery_opening, 2, objective('Invite five guests to the opening.')).
quest_objective(gallery_opening, 3, objective('Attend the opening and network with art critics.')).
quest_reward(gallery_opening, experience, 250).
quest_reward(gallery_opening, gold, 175).
quest_available(Player, gallery_opening) :-
    quest(gallery_opening, _, _, _, active).

%% Quest: Street Art Project
quest(street_art_project, 'Street Art Project', creative, beginner, active).
quest_assigned_to(street_art_project, '{{player}}').
quest_tag(street_art_project, generated).
quest_objective(street_art_project, 0, objective('Find a legal wall in the Warehouse District.')).
quest_objective(street_art_project, 1, objective('Purchase spray paint and stencils.')).
quest_objective(street_art_project, 2, objective('Create a mural celebrating the neighborhood.')).
quest_reward(street_art_project, experience, 200).
quest_reward(street_art_project, gold, 100).
quest_available(Player, street_art_project) :-
    quest(street_art_project, _, _, _, active).

%% Quest: Open Mic Night
quest(open_mic_night, 'Open Mic Night', creative, beginner, active).
quest_assigned_to(open_mic_night, '{{player}}').
quest_tag(open_mic_night, generated).
quest_objective(open_mic_night, 0, objective('Sign up for the open mic at Vinyl Underground.')).
quest_objective(open_mic_night, 1, objective('Prepare a five-minute performance.')).
quest_objective(open_mic_night, 2, objective('Perform on stage and earn audience approval.')).
quest_reward(open_mic_night, experience, 175).
quest_reward(open_mic_night, gold, 100).
quest_available(Player, open_mic_night) :-
    quest(open_mic_night, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Exploration and Discovery Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Metro Explorer
quest(metro_explorer, 'Metro Explorer', exploration, beginner, active).
quest_assigned_to(metro_explorer, '{{player}}').
quest_tag(metro_explorer, generated).
quest_objective(metro_explorer, 0, objective('Ride the subway to all five major stations.')).
quest_objective(metro_explorer, 1, objective('Visit at least one landmark in each district.')).
quest_objective(metro_explorer, 2, objective('Take a photo at the Riverside waterfront.')).
quest_reward(metro_explorer, experience, 150).
quest_reward(metro_explorer, gold, 75).
quest_available(Player, metro_explorer) :-
    quest(metro_explorer, _, _, _, active).

%% Quest: Foodie Trail
quest(foodie_trail, 'Foodie Trail', exploration, intermediate, active).
quest_assigned_to(foodie_trail, '{{player}}').
quest_tag(foodie_trail, generated).
quest_objective(foodie_trail, 0, objective('Try street food at the Pop-Up Hall.')).
quest_objective(foodie_trail, 1, objective('Have coffee at both Daily Grind and The Study Bean.')).
quest_objective(foodie_trail, 2, objective('Dine at Skyline Bistro in the Financial District.')).
quest_objective(foodie_trail, 3, objective('Rate and review all four establishments.')).
quest_reward(foodie_trail, experience, 200).
quest_reward(foodie_trail, gold, 125).
quest_available(Player, foodie_trail) :-
    quest(foodie_trail, _, _, _, active).

%% Quest: Night Owl
quest(night_owl, 'Night Owl', exploration, intermediate, active).
quest_assigned_to(night_owl, '{{player}}').
quest_tag(night_owl, generated).
quest_objective(night_owl, 0, objective('Visit Neon Lounge after 10 PM.')).
quest_objective(night_owl, 1, objective('Attend a live show at Vinyl Underground.')).
quest_objective(night_owl, 2, objective('Find the hidden speakeasy in the Warehouse District.')).
quest_reward(night_owl, experience, 200).
quest_reward(night_owl, gold, 125).
quest_available(Player, night_owl) :-
    quest(night_owl, _, _, _, active).

%% Quest: Wellness Journey
quest(wellness_journey, 'Wellness Journey', lifestyle, beginner, active).
quest_assigned_to(wellness_journey, '{{player}}').
quest_tag(wellness_journey, generated).
quest_objective(wellness_journey, 0, talk_to('doctor_patel', 1)).
quest_objective(wellness_journey, 1, objective('Complete a yoga session at Yoga Flow Studio.')).
quest_objective(wellness_journey, 2, objective('Jog along the Riverside path three times.')).
quest_objective(wellness_journey, 3, objective('Buy fresh produce at the Farmers Market.')).
quest_reward(wellness_journey, experience, 175).
quest_reward(wellness_journey, gold, 100).
quest_available(Player, wellness_journey) :-
    quest(wellness_journey, _, _, _, active).
