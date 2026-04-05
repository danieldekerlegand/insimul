%% Insimul Quests: Modern Realistic
%% Source: data/worlds/modern_realistic/quests.pl
%% Created: 2026-04-03
%% Total: 12 quests

%% ===============================================================
%% Beginner Quests
%% ===============================================================

%% Quest: New in Town
quest(new_in_town, 'New in Town', exploration, beginner, active).
quest_assigned_to(new_in_town, '{{player}}').
quest_tag(new_in_town, generated).
quest_objective(new_in_town, 0, objective('Walk down Main Street and find three local shops.')).
quest_objective(new_in_town, 1, objective('Get a coffee at Brewed Awakening and talk to the barista.')).
quest_objective(new_in_town, 2, talk_to('jordan_bell', 1)).
quest_reward(new_in_town, experience, 100).
quest_reward(new_in_town, gold, 50).
quest_available(Player, new_in_town) :-
    quest(new_in_town, _, _, _, active).

%% Quest: Grocery Run
quest(grocery_run, 'Grocery Run', errand, beginner, active).
quest_assigned_to(grocery_run, '{{player}}').
quest_tag(grocery_run, generated).
quest_objective(grocery_run, 0, objective('Visit Fresh Market on Elm Avenue.')).
quest_objective(grocery_run, 1, objective('Buy five items from the shopping list.')).
quest_objective(grocery_run, 2, objective('Deliver the groceries to Helen Russo.')).
quest_objective(grocery_run, 3, talk_to('helen_russo', 1)).
quest_reward(grocery_run, experience, 100).
quest_reward(grocery_run, gold, 40).
quest_available(Player, grocery_run) :-
    quest(grocery_run, _, _, _, active).

%% Quest: Morning Jog
quest(morning_jog, 'Morning Jog', fitness, beginner, active).
quest_assigned_to(morning_jog, '{{player}}').
quest_tag(morning_jog, generated).
quest_objective(morning_jog, 0, objective('Find the jogging trail along River Road.')).
quest_objective(morning_jog, 1, objective('Complete the full 2-mile loop.')).
quest_objective(morning_jog, 2, objective('Cool down at the park bench near the Riverside Bridge.')).
quest_reward(morning_jog, experience, 80).
quest_reward(morning_jog, gold, 30).
quest_available(Player, morning_jog) :-
    quest(morning_jog, _, _, _, active).

%% ===============================================================
%% Intermediate Quests
%% ===============================================================

%% Quest: Job Interview Prep
quest(job_interview_prep, 'Job Interview Prep', career, intermediate, active).
quest_assigned_to(job_interview_prep, '{{player}}').
quest_tag(job_interview_prep, generated).
quest_objective(job_interview_prep, 0, objective('Print your resume at the Maplewood Library.')).
quest_objective(job_interview_prep, 1, objective('Practice interview questions with David Chen.')).
quest_objective(job_interview_prep, 2, talk_to('david_chen', 1)).
quest_objective(job_interview_prep, 3, objective('Arrive at the Lakeside Tech Hub for your interview on time.')).
quest_reward(job_interview_prep, experience, 200).
quest_reward(job_interview_prep, gold, 100).
quest_available(Player, job_interview_prep) :-
    quest(job_interview_prep, _, _, _, active).

%% Quest: Community Potluck
quest(community_potluck, 'Community Potluck', social, intermediate, active).
quest_assigned_to(community_potluck, '{{player}}').
quest_tag(community_potluck, generated).
quest_objective(community_potluck, 0, objective('Get a recipe from the Community Recipe Book at the library.')).
quest_objective(community_potluck, 1, objective('Buy ingredients at Fresh Market.')).
quest_objective(community_potluck, 2, objective('Cook the dish and bring it to the Community Center.')).
quest_objective(community_potluck, 3, talk_to('grace_okafor', 1)).
quest_reward(community_potluck, experience, 180).
quest_reward(community_potluck, gold, 80).
quest_available(Player, community_potluck) :-
    quest(community_potluck, _, _, _, active).

%% Quest: Car Trouble
quest(car_trouble, 'Car Trouble', errand, intermediate, active).
quest_assigned_to(car_trouble, '{{player}}').
quest_tag(car_trouble, generated).
quest_objective(car_trouble, 0, objective('Take your car to Reliable Auto on River Road.')).
quest_objective(car_trouble, 1, talk_to('tony_russo', 1)).
quest_objective(car_trouble, 2, objective('Wait at Brewed Awakening while Tony diagnoses the problem.')).
quest_objective(car_trouble, 3, objective('Decide whether to approve the repair estimate.')).
quest_reward(car_trouble, experience, 150).
quest_reward(car_trouble, gold, 60).
quest_available(Player, car_trouble) :-
    quest(car_trouble, _, _, _, active).

%% Quest: Art Class
quest(art_class, 'Art Class', creative, intermediate, active).
quest_assigned_to(art_class, '{{player}}').
quest_tag(art_class, generated).
quest_objective(art_class, 0, objective('Sign up for a painting class at the Community Center.')).
quest_objective(art_class, 1, talk_to('maya_torres', 1)).
quest_objective(art_class, 2, objective('Complete a painting using the provided art supplies.')).
quest_objective(art_class, 3, objective('Display your work at the end-of-class gallery walk.')).
quest_reward(art_class, experience, 200).
quest_reward(art_class, gold, 70).
quest_reward(art_class, item, art_supplies).
quest_available(Player, art_class) :-
    quest(art_class, _, _, _, active).

%% Quest: Farm Visit
quest(farm_visit, 'Farm Visit', exploration, intermediate, active).
quest_assigned_to(farm_visit, '{{player}}').
quest_tag(farm_visit, generated).
quest_objective(farm_visit, 0, objective('Drive out to Pinehurst along Pine Road.')).
quest_objective(farm_visit, 1, talk_to('sam_weaver', 1)).
quest_objective(farm_visit, 2, objective('Help Sam with the morning harvest.')).
quest_objective(farm_visit, 3, objective('Buy fresh produce from the farm stand run by Ruth Weaver.')).
quest_reward(farm_visit, experience, 180).
quest_reward(farm_visit, gold, 90).
quest_available(Player, farm_visit) :-
    quest(farm_visit, _, _, _, active).

%% ===============================================================
%% Advanced Quests
%% ===============================================================

%% Quest: Neighborhood Watch
quest(neighborhood_watch, 'Neighborhood Watch', social, advanced, active).
quest_assigned_to(neighborhood_watch, '{{player}}').
quest_tag(neighborhood_watch, generated).
quest_objective(neighborhood_watch, 0, talk_to('frank_russo', 1)).
quest_objective(neighborhood_watch, 1, objective('Attend the neighborhood watch meeting at the Community Center.')).
quest_objective(neighborhood_watch, 2, objective('Investigate reports of suspicious activity near Riverside.')).
quest_objective(neighborhood_watch, 3, objective('Report your findings to the group and propose a safety plan.')).
quest_reward(neighborhood_watch, experience, 300).
quest_reward(neighborhood_watch, gold, 150).
quest_available(Player, neighborhood_watch) :-
    quest(neighborhood_watch, _, _, _, active).

%% Quest: The Documentary
quest(the_documentary, 'The Documentary', creative, advanced, active).
quest_assigned_to(the_documentary, '{{player}}').
quest_tag(the_documentary, generated).
quest_objective(the_documentary, 0, talk_to('kevin_chen', 1)).
quest_objective(the_documentary, 1, objective('Help Kevin film interviews with five Maplewood residents.')).
quest_objective(the_documentary, 2, objective('Visit the Town Clock, Veterans Memorial, and Riverside Bridge for B-roll footage.')).
quest_objective(the_documentary, 3, objective('Help edit the final cut and screen it at the Community Center.')).
quest_reward(the_documentary, experience, 350).
quest_reward(the_documentary, gold, 200).
quest_available(Player, the_documentary) :-
    quest(the_documentary, _, _, _, active).

%% Quest: Startup Pitch
quest(startup_pitch, 'Startup Pitch', career, advanced, active).
quest_assigned_to(startup_pitch, '{{player}}').
quest_tag(startup_pitch, generated).
quest_objective(startup_pitch, 0, talk_to('daniel_okafor', 1)).
quest_objective(startup_pitch, 1, objective('Research the local catering market using the library computers.')).
quest_objective(startup_pitch, 2, objective('Draft a business plan with financial projections.')).
quest_objective(startup_pitch, 3, talk_to('james_park', 1)).
quest_objective(startup_pitch, 4, objective('Present the pitch to potential investors at Lakeside Tech Hub.')).
quest_reward(startup_pitch, experience, 400).
quest_reward(startup_pitch, gold, 250).
quest_available(Player, startup_pitch) :-
    quest(startup_pitch, _, _, _, active).

%% Quest: Environmental Campaign
quest(environmental_campaign, 'Environmental Campaign', social, advanced, active).
quest_assigned_to(environmental_campaign, '{{player}}').
quest_tag(environmental_campaign, generated).
quest_objective(environmental_campaign, 0, talk_to('emma_chen', 1)).
quest_objective(environmental_campaign, 1, objective('Conduct a water quality survey at the river near Riverside Bridge.')).
quest_objective(environmental_campaign, 2, objective('Collect signatures from 20 residents for the clean water petition.')).
quest_objective(environmental_campaign, 3, objective('Present findings at the town council meeting.')).
quest_reward(environmental_campaign, experience, 450).
quest_reward(environmental_campaign, gold, 200).
quest_available(Player, environmental_campaign) :-
    quest(environmental_campaign, _, _, _, active).
