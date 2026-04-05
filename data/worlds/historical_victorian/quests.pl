%% Insimul Quests: Historical Victorian
%% Source: data/worlds/historical_victorian/quests.pl
%% Created: 2026-04-03
%% Total: 12 quests

%% =============================================
%% Social Intrigue Quests
%% =============================================

%% Quest: A Letter of Introduction
quest(letter_introduction, 'A Letter of Introduction', social, beginner, active).
quest_assigned_to(letter_introduction, '{{player}}').
quest_tag(letter_introduction, generated).
quest_objective(letter_introduction, 0, talk_to('arthur_graves', 1)).
quest_objective(letter_introduction, 1, objective('Obtain a letter of introduction from Lord Ashworth.')).
quest_objective(letter_introduction, 2, objective('Present yourself at the Prometheus Club.')).
quest_objective(letter_introduction, 3, objective('Gain admission to polite society.')).
quest_reward(letter_introduction, experience, 150).
quest_reward(letter_introduction, gold, 80).
quest_available(Player, letter_introduction) :-
    quest(letter_introduction, _, _, _, active).

%% Quest: The Season Begins
quest(season_begins, 'The Season Begins', social, intermediate, active).
quest_assigned_to(season_begins, '{{player}}').
quest_tag(season_begins, generated).
quest_objective(season_begins, 0, talk_to('margaret_ashworth', 1)).
quest_objective(season_begins, 1, objective('Attend Lady Ashworth evening reception without committing a faux pas.')).
quest_objective(season_begins, 2, objective('Dance with three partners of appropriate standing.')).
quest_objective(season_begins, 3, objective('Overhear a piece of valuable gossip.')).
quest_reward(season_begins, experience, 300).
quest_reward(season_begins, gold, 150).
quest_available(Player, season_begins) :-
    quest(season_begins, _, _, _, active).

%% Quest: Scandal at the Club
quest(scandal_at_club, 'Scandal at the Club', social, advanced, active).
quest_assigned_to(scandal_at_club, '{{player}}').
quest_tag(scandal_at_club, generated).
quest_objective(scandal_at_club, 0, objective('Discover that Henry Ashworth owes gambling debts to Silas Blackwood.')).
quest_objective(scandal_at_club, 1, talk_to('henry_ashworth', 1)).
quest_objective(scandal_at_club, 2, objective('Choose: help Henry conceal the debts or expose the scandal.')).
quest_objective(scandal_at_club, 3, objective('Manage the fallout of your decision.')).
quest_reward(scandal_at_club, experience, 500).
quest_reward(scandal_at_club, gold, 250).
quest_available(Player, scandal_at_club) :-
    quest(scandal_at_club, _, _, _, active).

%% =============================================
%% Labour and Reform Quests
%% =============================================

%% Quest: The Mill Workers Plight
quest(mill_workers_plight, 'The Mill Workers Plight', labour, beginner, active).
quest_assigned_to(mill_workers_plight, '{{player}}').
quest_tag(mill_workers_plight, generated).
quest_objective(mill_workers_plight, 0, objective('Visit the Blackwood Cotton Mill on Mill Road.')).
quest_objective(mill_workers_plight, 1, talk_to('agnes_whittle', 1)).
quest_objective(mill_workers_plight, 2, objective('Witness the working conditions firsthand.')).
quest_objective(mill_workers_plight, 3, objective('Decide whether to report conditions to Inspector Hale.')).
quest_reward(mill_workers_plight, experience, 200).
quest_reward(mill_workers_plight, gold, 100).
quest_available(Player, mill_workers_plight) :-
    quest(mill_workers_plight, _, _, _, active).

%% Quest: The Strike
quest(the_strike, 'The Strike', labour, intermediate, active).
quest_assigned_to(the_strike, '{{player}}').
quest_tag(the_strike, generated).
quest_objective(the_strike, 0, talk_to('agnes_whittle', 1)).
quest_objective(the_strike, 1, objective('Help organize a workers strike at the cotton mill.')).
quest_objective(the_strike, 2, objective('Convince Thomas Blackwood to support reform.')).
quest_objective(the_strike, 3, objective('Face down Silas Blackwood and the hired toughs.')).
quest_reward(the_strike, experience, 400).
quest_reward(the_strike, gold, 200).
quest_available(Player, the_strike) :-
    quest(the_strike, _, _, _, active).

%% Quest: Charlottes Crusade
quest(charlottes_crusade, 'Charlottes Crusade', labour, advanced, active).
quest_assigned_to(charlottes_crusade, '{{player}}').
quest_tag(charlottes_crusade, generated).
quest_objective(charlottes_crusade, 0, talk_to('charlotte_ashworth', 1)).
quest_objective(charlottes_crusade, 1, objective('Help Charlotte publish an expose on child labour in the Daily Sentinel.')).
quest_objective(charlottes_crusade, 2, objective('Protect Charlotte from her father who opposes the article.')).
quest_objective(charlottes_crusade, 3, objective('Testify before the magistrate about factory conditions.')).
quest_reward(charlottes_crusade, experience, 500).
quest_reward(charlottes_crusade, gold, 250).
quest_available(Player, charlottes_crusade) :-
    quest(charlottes_crusade, _, _, _, active).

%% =============================================
%% Investigation Quests
%% =============================================

%% Quest: Murder on Wharf Street
quest(murder_wharf, 'Murder on Wharf Street', investigation, beginner, active).
quest_assigned_to(murder_wharf, '{{player}}').
quest_tag(murder_wharf, generated).
quest_objective(murder_wharf, 0, talk_to('rupert_hale', 1)).
quest_objective(murder_wharf, 1, objective('Examine the crime scene at the docklands.')).
quest_objective(murder_wharf, 2, objective('Interview witnesses at the Anchor and Crown pub.')).
quest_objective(murder_wharf, 3, objective('Identify the suspect from three conflicting testimonies.')).
quest_reward(murder_wharf, experience, 200).
quest_reward(murder_wharf, gold, 100).
quest_available(Player, murder_wharf) :-
    quest(murder_wharf, _, _, _, active).

%% Quest: The Opium Connection
quest(opium_connection, 'The Opium Connection', investigation, intermediate, active).
quest_assigned_to(opium_connection, '{{player}}').
quest_tag(opium_connection, generated).
quest_objective(opium_connection, 0, objective('Discover the Jade Lantern opium den on Wharf Street.')).
quest_objective(opium_connection, 1, talk_to('shen_li', 1)).
quest_objective(opium_connection, 2, objective('Trace the opium supply chain to its wealthy backers.')).
quest_objective(opium_connection, 3, objective('Decide whether to expose the operation or leverage the knowledge.')).
quest_reward(opium_connection, experience, 350).
quest_reward(opium_connection, gold, 175).
quest_available(Player, opium_connection) :-
    quest(opium_connection, _, _, _, active).

%% =============================================
%% Science and Invention Quests
%% =============================================

%% Quest: The Pemberton Experiment
quest(pemberton_experiment, 'The Pemberton Experiment', science, intermediate, active).
quest_assigned_to(pemberton_experiment, '{{player}}').
quest_tag(pemberton_experiment, generated).
quest_objective(pemberton_experiment, 0, talk_to('alistair_pemberton', 1)).
quest_objective(pemberton_experiment, 1, objective('Gather three chemical reagents from the apothecary.')).
quest_objective(pemberton_experiment, 2, objective('Assist the Professor in his laboratory experiment.')).
quest_objective(pemberton_experiment, 3, objective('Present the discovery at the Royal Museum of Natural Philosophy.')).
quest_reward(pemberton_experiment, experience, 300).
quest_reward(pemberton_experiment, gold, 150).
quest_available(Player, pemberton_experiment) :-
    quest(pemberton_experiment, _, _, _, active).

%% Quest: The Stolen Schematic
quest(stolen_schematic, 'The Stolen Schematic', investigation, intermediate, active).
quest_assigned_to(stolen_schematic, '{{player}}').
quest_tag(stolen_schematic, generated).
quest_objective(stolen_schematic, 0, talk_to('alistair_pemberton', 1)).
quest_objective(stolen_schematic, 1, objective('Discover that the steam engine schematic has been stolen.')).
quest_objective(stolen_schematic, 2, objective('Track the thief through the factory district.')).
quest_objective(stolen_schematic, 3, objective('Recover the schematic before it reaches a rival industrialist.')).
quest_reward(stolen_schematic, experience, 350).
quest_reward(stolen_schematic, gold, 200).
quest_available(Player, stolen_schematic) :-
    quest(stolen_schematic, _, _, _, active).

%% =============================================
%% Survival Quests
%% =============================================

%% Quest: Life on the Streets
quest(life_on_streets, 'Life on the Streets', survival, beginner, active).
quest_assigned_to(life_on_streets, '{{player}}').
quest_tag(life_on_streets, generated).
quest_objective(life_on_streets, 0, talk_to('jack_cinders', 1)).
quest_objective(life_on_streets, 1, objective('Survive a night in the factory district without money.')).
quest_objective(life_on_streets, 2, objective('Find shelter at the Flint Boarding House.')).
quest_objective(life_on_streets, 3, talk_to('molly_flint', 1)).
quest_reward(life_on_streets, experience, 150).
quest_reward(life_on_streets, gold, 50).
quest_available(Player, life_on_streets) :-
    quest(life_on_streets, _, _, _, active).

%% Quest: The Chimney Sweeps Escape
quest(chimney_escape, 'The Chimney Sweeps Escape', survival, intermediate, active).
quest_assigned_to(chimney_escape, '{{player}}').
quest_tag(chimney_escape, generated).
quest_objective(chimney_escape, 0, objective('Discover that Barnaby Soot is abusing his young apprentices.')).
quest_objective(chimney_escape, 1, talk_to('barnaby_soot', 1)).
quest_objective(chimney_escape, 2, objective('Help a child escape from Soot and reach safety.')).
quest_objective(chimney_escape, 3, objective('Find the child shelter with Molly Flint or Dr. Hartley.')).
quest_reward(chimney_escape, experience, 300).
quest_reward(chimney_escape, gold, 100).
quest_available(Player, chimney_escape) :-
    quest(chimney_escape, _, _, _, active).
