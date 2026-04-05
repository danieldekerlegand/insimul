%% Insimul Quests: Wild West -- Redemption Gulch
%% Source: data/worlds/wild_west/quests.pl
%% Created: 2026-04-03
%% Total: 12 quests

%% ═══════════════════════════════════════════════════════════
%% Introductory Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Welcome to Redemption
quest(welcome_to_redemption, 'Welcome to Redemption', main_story, beginner, active).
quest_assigned_to(welcome_to_redemption, '{{player}}').
quest_tag(welcome_to_redemption, generated).
quest_objective(welcome_to_redemption, 0, objective('Arrive at Redemption Gulch on the stagecoach.')).
quest_objective(welcome_to_redemption, 1, talk_to('ruby_callahan', 1)).
quest_objective(welcome_to_redemption, 2, objective('Get a room at the Grand Western Hotel.')).
quest_objective(welcome_to_redemption, 3, talk_to('eli_holden', 1)).
quest_reward(welcome_to_redemption, experience, 100).
quest_reward(welcome_to_redemption, gold, 50).
quest_available(Player, welcome_to_redemption) :-
    quest(welcome_to_redemption, _, _, _, active).

%% Quest: A Helping Hand
quest(a_helping_hand, 'A Helping Hand', side_quest, beginner, active).
quest_assigned_to(a_helping_hand, '{{player}}').
quest_tag(a_helping_hand, generated).
quest_objective(a_helping_hand, 0, talk_to('silas_hendricks', 1)).
quest_objective(a_helping_hand, 1, objective('Deliver supplies from the general store to Doc Whitfield.')).
quest_objective(a_helping_hand, 2, objective('Bring feed sacks to the McCoy Livery Stable.')).
quest_reward(a_helping_hand, experience, 75).
quest_reward(a_helping_hand, gold, 30).
quest_available(Player, a_helping_hand) :-
    quest(a_helping_hand, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Law and Order Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: The Ketchum Problem
quest(the_ketchum_problem, 'The Ketchum Problem', main_story, intermediate, active).
quest_assigned_to(the_ketchum_problem, '{{player}}').
quest_tag(the_ketchum_problem, generated).
quest_objective(the_ketchum_problem, 0, talk_to('eli_holden', 1)).
quest_objective(the_ketchum_problem, 1, objective('Investigate reports of outlaws seen near Copper Ridge.')).
quest_objective(the_ketchum_problem, 2, objective('Find evidence of the Ketchum gang hideout.')).
quest_objective(the_ketchum_problem, 3, objective('Report back to the sheriff with your findings.')).
quest_reward(the_ketchum_problem, experience, 250).
quest_reward(the_ketchum_problem, gold, 150).
quest_reward(the_ketchum_problem, item, deputy_badge).
quest_available(Player, the_ketchum_problem) :-
    quest(the_ketchum_problem, _, _, _, active).

%% Quest: Wanted Dead or Alive
quest(wanted_dead_or_alive, 'Wanted Dead or Alive', bounty, advanced, active).
quest_assigned_to(wanted_dead_or_alive, '{{player}}').
quest_tag(wanted_dead_or_alive, generated).
quest_objective(wanted_dead_or_alive, 0, objective('Collect the wanted poster from the sheriff office.')).
quest_objective(wanted_dead_or_alive, 1, objective('Track Jack Ketchum to his hideout in Copper Ridge.')).
quest_objective(wanted_dead_or_alive, 2, objective('Bring Ketchum to justice -- dead or alive.')).
quest_reward(wanted_dead_or_alive, experience, 500).
quest_reward(wanted_dead_or_alive, gold, 500).
quest_available(Player, wanted_dead_or_alive) :-
    quest(wanted_dead_or_alive, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Ranch Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Cattle Drive
quest(cattle_drive, 'Cattle Drive', faction, intermediate, active).
quest_assigned_to(cattle_drive, '{{player}}').
quest_tag(cattle_drive, generated).
quest_objective(cattle_drive, 0, talk_to('walt_mccoy', 1)).
quest_objective(cattle_drive, 1, objective('Help round up stray cattle from the open range.')).
quest_objective(cattle_drive, 2, objective('Drive the herd to the Redemption Stockyard.')).
quest_objective(cattle_drive, 3, objective('Defend the herd from a rustler ambush on the trail.')).
quest_reward(cattle_drive, experience, 200).
quest_reward(cattle_drive, gold, 100).
quest_available(Player, cattle_drive) :-
    quest(cattle_drive, _, _, _, active).

%% Quest: Horse Thief
quest(horse_thief, 'Horse Thief', investigation, beginner, active).
quest_assigned_to(horse_thief, '{{player}}').
quest_tag(horse_thief, generated).
quest_objective(horse_thief, 0, talk_to('jesse_mccoy', 1)).
quest_objective(horse_thief, 1, objective('Track the stolen horse from the livery stable.')).
quest_objective(horse_thief, 2, objective('Follow the trail to the thiefs camp.')).
quest_objective(horse_thief, 3, objective('Recover the horse and return it to the stable.')).
quest_reward(horse_thief, experience, 150).
quest_reward(horse_thief, gold, 75).
quest_available(Player, horse_thief) :-
    quest(horse_thief, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Mining Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Silver Strike
quest(silver_strike, 'Silver Strike', exploration, intermediate, active).
quest_assigned_to(silver_strike, '{{player}}').
quest_tag(silver_strike, generated).
quest_objective(silver_strike, 0, talk_to('mae_li', 1)).
quest_objective(silver_strike, 1, objective('Explore the new tunnel in the Silver Lode Mine.')).
quest_objective(silver_strike, 2, objective('Collect ore samples from three different veins.')).
quest_objective(silver_strike, 3, objective('Bring samples to the Ridge Assay Office for evaluation.')).
quest_reward(silver_strike, experience, 200).
quest_reward(silver_strike, gold, 200).
quest_available(Player, silver_strike) :-
    quest(silver_strike, _, _, _, active).

%% Quest: Cave In
quest(cave_in, 'Cave In', rescue, advanced, active).
quest_assigned_to(cave_in, '{{player}}').
quest_tag(cave_in, generated).
quest_objective(cave_in, 0, objective('Hear the explosion at the Silver Lode Mine.')).
quest_objective(cave_in, 1, talk_to('mae_li', 1)).
quest_objective(cave_in, 2, objective('Help clear the rubble and rescue trapped miners.')).
quest_objective(cave_in, 3, objective('Investigate whether the cave-in was sabotage.')).
quest_reward(cave_in, experience, 350).
quest_reward(cave_in, gold, 175).
quest_available(Player, cave_in) :-
    quest(cave_in, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Railroad and Town Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Iron Horse Coming
quest(iron_horse_coming, 'Iron Horse Coming', main_story, intermediate, active).
quest_assigned_to(iron_horse_coming, '{{player}}').
quest_tag(iron_horse_coming, generated).
quest_objective(iron_horse_coming, 0, talk_to('cornelius_thorne', 1)).
quest_objective(iron_horse_coming, 1, objective('Survey the proposed rail extension route.')).
quest_objective(iron_horse_coming, 2, objective('Negotiate land rights with Walt McCoy.')).
quest_objective(iron_horse_coming, 3, objective('Decide whose side you take: railroad or ranchers.')).
quest_reward(iron_horse_coming, experience, 300).
quest_reward(iron_horse_coming, gold, 200).
quest_available(Player, iron_horse_coming) :-
    quest(iron_horse_coming, _, _, _, active).

%% Quest: The Redemption Gazette
quest(the_redemption_gazette, 'The Redemption Gazette', investigation, beginner, active).
quest_assigned_to(the_redemption_gazette, '{{player}}').
quest_tag(the_redemption_gazette, generated).
quest_objective(the_redemption_gazette, 0, talk_to('eustace_polk', 1)).
quest_objective(the_redemption_gazette, 1, objective('Gather stories from three townsfolk for the newspaper.')).
quest_objective(the_redemption_gazette, 2, objective('Investigate a rumor about the bank being cased.')).
quest_objective(the_redemption_gazette, 3, objective('Deliver the finished article to the printing press.')).
quest_reward(the_redemption_gazette, experience, 125).
quest_reward(the_redemption_gazette, gold, 60).
quest_available(Player, the_redemption_gazette) :-
    quest(the_redemption_gazette, _, _, _, active).

%% Quest: Bank Robbery
quest(bank_robbery, 'Bank Robbery', main_story, advanced, active).
quest_assigned_to(bank_robbery, '{{player}}').
quest_tag(bank_robbery, generated).
quest_objective(bank_robbery, 0, objective('Witness the Ketchum gang rob Redemption Savings and Trust.')).
quest_objective(bank_robbery, 1, objective('Choose: help the sheriff or stay out of it.')).
quest_objective(bank_robbery, 2, objective('Track the gang to their escape route.')).
quest_objective(bank_robbery, 3, objective('Recover the stolen gold or let the outlaws ride.')).
quest_reward(bank_robbery, experience, 400).
quest_reward(bank_robbery, gold, 300).
quest_available(Player, bank_robbery) :-
    quest(bank_robbery, _, _, _, active).

%% Quest: Sunday Sermon
quest(sunday_sermon, 'Sunday Sermon', side_quest, beginner, active).
quest_assigned_to(sunday_sermon, '{{player}}').
quest_tag(sunday_sermon, generated).
quest_objective(sunday_sermon, 0, talk_to('josiah_crane', 1)).
quest_objective(sunday_sermon, 1, objective('Attend the Sunday service at the church.')).
quest_objective(sunday_sermon, 2, objective('Help Reverend Crane deliver charity supplies to Copper Ridge miners.')).
quest_reward(sunday_sermon, experience, 75).
quest_reward(sunday_sermon, gold, 25).
quest_available(Player, sunday_sermon) :-
    quest(sunday_sermon, _, _, _, active).
