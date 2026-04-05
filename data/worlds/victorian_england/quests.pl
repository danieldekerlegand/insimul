%% Insimul Quests: Victorian England
%% Source: data/worlds/victorian_england/quests.pl
%% Created: 2026-04-03
%% Total: 12 quests

%% ═══════════════════════════════════════════════════════════
%% Beginner Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: A Proper Introduction
quest(proper_introduction, 'A Proper Introduction', social, beginner, active).
quest_assigned_to(proper_introduction, '{{player}}').
quest_tag(proper_introduction, generated).
quest_objective(proper_introduction, 0, talk_to('lord_ashford', 1)).
quest_objective(proper_introduction, 1, objective('Obtain a letter of introduction from Lord Ashford.')).
quest_objective(proper_introduction, 2, objective('Present the letter at The Reform Club.')).
quest_objective(proper_introduction, 3, objective('Make acquaintance with three members of the club.')).
quest_reward(proper_introduction, experience, 100).
quest_reward(proper_introduction, gold, 50).
quest_available(Player, proper_introduction) :-
    quest(proper_introduction, _, _, _, active).

%% Quest: The Morning Post
quest(morning_post, 'The Morning Post', gathering, beginner, active).
quest_assigned_to(morning_post, '{{player}}').
quest_tag(morning_post, generated).
quest_objective(morning_post, 0, objective('Purchase a copy of the Daily Telegraph from Fleet Street.')).
quest_objective(morning_post, 1, objective('Read the advertisement section for employment opportunities.')).
quest_objective(morning_post, 2, objective('Visit three businesses mentioned in the classifieds.')).
quest_reward(morning_post, experience, 80).
quest_reward(morning_post, gold, 40).
quest_available(Player, morning_post) :-
    quest(morning_post, _, _, _, active).

%% Quest: Tea with Lady Ashford
quest(tea_with_lady, 'Tea with Lady Ashford', social, beginner, active).
quest_assigned_to(tea_with_lady, '{{player}}').
quest_tag(tea_with_lady, generated).
quest_objective(tea_with_lady, 0, objective('Leave a calling card at Ashford Manor in Mayfair.')).
quest_objective(tea_with_lady, 1, talk_to('lady_ashford', 1)).
quest_objective(tea_with_lady, 2, objective('Observe proper tea etiquette during your visit.')).
quest_reward(tea_with_lady, experience, 100).
quest_reward(tea_with_lady, gold, 50).
quest_available(Player, tea_with_lady) :-
    quest(tea_with_lady, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Intermediate Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: The Steam Revolution
quest(steam_revolution, 'The Steam Revolution', investigation, intermediate, active).
quest_assigned_to(steam_revolution, '{{player}}').
quest_tag(steam_revolution, generated).
quest_objective(steam_revolution, 0, talk_to('inventor_edison', 1)).
quest_objective(steam_revolution, 1, objective('Visit the Edison Steam Workshop in Manchester.')).
quest_objective(steam_revolution, 2, objective('Help Edison test his new steam engine prototype.')).
quest_objective(steam_revolution, 3, objective('Deliver the steam schematic to a potential investor in London.')).
quest_reward(steam_revolution, experience, 200).
quest_reward(steam_revolution, gold, 150).
quest_available(Player, steam_revolution) :-
    quest(steam_revolution, _, _, _, active).

%% Quest: The Workhouse Children
quest(workhouse_children, 'The Workhouse Children', investigation, intermediate, active).
quest_assigned_to(workhouse_children, '{{player}}').
quest_tag(workhouse_children, generated).
quest_objective(workhouse_children, 0, talk_to('governess_bronte', 1)).
quest_objective(workhouse_children, 1, objective('Investigate conditions at St. Giles Workhouse.')).
quest_objective(workhouse_children, 2, objective('Document the treatment of orphan children there.')).
quest_objective(workhouse_children, 3, objective('Present your findings to a sympathetic member of Parliament.')).
quest_reward(workhouse_children, experience, 250).
quest_reward(workhouse_children, gold, 200).
quest_available(Player, workhouse_children) :-
    quest(workhouse_children, _, _, _, active).

%% Quest: The Railway Connection
quest(railway_connection, 'The Railway Connection', delivery, intermediate, active).
quest_assigned_to(railway_connection, '{{player}}').
quest_tag(railway_connection, generated).
quest_objective(railway_connection, 0, objective('Purchase a railway ticket at Manchester Victoria Station.')).
quest_objective(railway_connection, 1, objective('Travel by train from Manchester to London.')).
quest_objective(railway_connection, 2, objective('Deliver a sealed package from Edison to Lord Ashford.')).
quest_objective(railway_connection, 3, talk_to('lord_ashford', 1)).
quest_reward(railway_connection, experience, 180).
quest_reward(railway_connection, gold, 120).
quest_available(Player, railway_connection) :-
    quest(railway_connection, _, _, _, active).

%% Quest: The Cotton Exchange
quest(cotton_exchange, 'The Cotton Exchange', commerce, intermediate, active).
quest_assigned_to(cotton_exchange, '{{player}}').
quest_tag(cotton_exchange, generated).
quest_objective(cotton_exchange, 0, talk_to('factory_owner', 1)).
quest_objective(cotton_exchange, 1, objective('Visit the Manchester Cotton Exchange and observe a trading session.')).
quest_objective(cotton_exchange, 2, objective('Negotiate a cotton purchase on behalf of the Dickens mill.')).
quest_objective(cotton_exchange, 3, objective('Arrange for the shipment to arrive at the factory.')).
quest_reward(cotton_exchange, experience, 200).
quest_reward(cotton_exchange, gold, 175).
quest_available(Player, cotton_exchange) :-
    quest(cotton_exchange, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Advanced Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Murder on Fleet Street
quest(murder_fleet_street, 'Murder on Fleet Street', investigation, advanced, active).
quest_assigned_to(murder_fleet_street, '{{player}}').
quest_tag(murder_fleet_street, generated).
quest_objective(murder_fleet_street, 0, objective('Discover the body of a newspaper editor in the alley behind Fleet Street.')).
quest_objective(murder_fleet_street, 1, objective('Report to Scotland Yard and assist the inspector.')).
quest_objective(murder_fleet_street, 2, objective('Interview witnesses at Ye Olde Cheshire Cheese pub.')).
quest_objective(murder_fleet_street, 3, objective('Identify the killer and present evidence to the magistrate.')).
quest_reward(murder_fleet_street, experience, 400).
quest_reward(murder_fleet_street, gold, 300).
quest_available(Player, murder_fleet_street) :-
    quest(murder_fleet_street, _, _, _, active).

%% Quest: The Factory Scandal
quest(factory_scandal, 'The Factory Scandal', investigation, advanced, active).
quest_assigned_to(factory_scandal, '{{player}}').
quest_tag(factory_scandal, generated).
quest_objective(factory_scandal, 0, objective('Obtain the factory ledger from the Dickens Textile Mill.')).
quest_objective(factory_scandal, 1, objective('Discover evidence of child labor violations and unsafe conditions.')).
quest_objective(factory_scandal, 2, talk_to('factory_owner', 1)).
quest_objective(factory_scandal, 3, objective('Choose: expose the scandal publicly or negotiate reforms privately.')).
quest_reward(factory_scandal, experience, 450).
quest_reward(factory_scandal, gold, 350).
quest_available(Player, factory_scandal) :-
    quest(factory_scandal, _, _, _, active).

%% Quest: The Opium Den
quest(opium_den, 'The Opium Den', investigation, advanced, active).
quest_assigned_to(opium_den, '{{player}}').
quest_tag(opium_den, generated).
quest_objective(opium_den, 0, objective('Investigate rumors of an opium smuggling ring operating in the East End.')).
quest_objective(opium_den, 1, objective('Navigate the dangerous streets of Gaslight Alley at night.')).
quest_objective(opium_den, 2, objective('Infiltrate the den and identify the ringleader.')).
quest_objective(opium_den, 3, objective('Report to Scotland Yard or confront the criminals directly.')).
quest_reward(opium_den, experience, 500).
quest_reward(opium_den, gold, 400).
quest_available(Player, opium_den) :-
    quest(opium_den, _, _, _, active).

%% Quest: The Museum Heist
quest(museum_heist, 'The Museum Heist', investigation, advanced, active).
quest_assigned_to(museum_heist, '{{player}}').
quest_tag(museum_heist, generated).
quest_objective(museum_heist, 0, objective('Respond to reports of a theft at The British Museum.')).
quest_objective(museum_heist, 1, objective('Examine the crime scene using your magnifying glass.')).
quest_objective(museum_heist, 2, objective('Follow the trail of clues across London.')).
quest_objective(museum_heist, 3, objective('Recover the stolen artifact and apprehend the thief.')).
quest_reward(museum_heist, experience, 500).
quest_reward(museum_heist, gold, 400).
quest_available(Player, museum_heist) :-
    quest(museum_heist, _, _, _, active).

%% Quest: A Seat in Parliament
quest(seat_in_parliament, 'A Seat in Parliament', diplomacy, advanced, active).
quest_assigned_to(seat_in_parliament, '{{player}}').
quest_tag(seat_in_parliament, generated).
quest_objective(seat_in_parliament, 0, talk_to('lord_ashford', 1)).
quest_objective(seat_in_parliament, 1, objective('Secure endorsements from three influential figures in London society.')).
quest_objective(seat_in_parliament, 2, objective('Deliver a campaign speech at the Reform Club.')).
quest_objective(seat_in_parliament, 3, objective('Navigate a political scandal planted by your rival.')).
quest_reward(seat_in_parliament, experience, 600).
quest_reward(seat_in_parliament, gold, 500).
quest_available(Player, seat_in_parliament) :-
    quest(seat_in_parliament, _, _, _, active).
