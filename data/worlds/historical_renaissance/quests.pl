%% Insimul Quests: Renaissance City-States
%% Source: data/worlds/historical_renaissance/quests.pl
%% Created: 2026-04-03
%% Total: 12 quests

%% ===============================================================
%% Beginner Quests
%% ===============================================================

%% Quest: The Patrons Commission
quest(patrons_commission, 'The Patrons Commission', exploration, beginner, active).
quest_assigned_to(patrons_commission, '{{player}}').
quest_tag(patrons_commission, generated).
quest_objective(patrons_commission, 0, objective('Visit the Valori palazzo in Centro Storico.')).
quest_objective(patrons_commission, 1, talk_to('lorenzo_valori', 1)).
quest_objective(patrons_commission, 2, objective('Learn the vocabulary of patronage: commessa, bottega, maestro, garzone.')).
quest_reward(patrons_commission, experience, 100).
quest_reward(patrons_commission, gold, 50).
quest_available(Player, patrons_commission) :-
    quest(patrons_commission, _, _, _, active).

%% Quest: Colors of the Bottega
quest(colors_of_the_bottega, 'Colors of the Bottega', vocabulary, beginner, active).
quest_assigned_to(colors_of_the_bottega, '{{player}}').
quest_tag(colors_of_the_bottega, generated).
quest_objective(colors_of_the_bottega, 0, objective('Visit Rinaldi workshop in Borgo degli Artisti.')).
quest_objective(colors_of_the_bottega, 1, talk_to('maestro_rinaldi', 1)).
quest_objective(colors_of_the_bottega, 2, objective('Learn the names of five pigments: azzurrite, verdigris, cinabro, ocra, biacca.')).
quest_reward(colors_of_the_bottega, experience, 100).
quest_reward(colors_of_the_bottega, gold, 50).
quest_available(Player, colors_of_the_bottega) :-
    quest(colors_of_the_bottega, _, _, _, active).

%% Quest: Market Day in Porto Sereno
quest(market_day_porto_sereno, 'Market Day in Porto Sereno', exploration, beginner, active).
quest_assigned_to(market_day_porto_sereno, '{{player}}').
quest_tag(market_day_porto_sereno, generated).
quest_objective(market_day_porto_sereno, 0, objective('Walk through the Fondaco district and examine trade goods.')).
quest_objective(market_day_porto_sereno, 1, talk_to('andrea_contarini', 1)).
quest_objective(market_day_porto_sereno, 2, objective('Identify goods from three trading nations: silk from Cathay, spice from India, wool from Flanders.')).
quest_reward(market_day_porto_sereno, experience, 100).
quest_reward(market_day_porto_sereno, gold, 60).
quest_available(Player, market_day_porto_sereno) :-
    quest(market_day_porto_sereno, _, _, _, active).

%% Quest: The Herbalists Garden
quest(herbalists_garden, 'The Herbalists Garden', vocabulary, beginner, active).
quest_assigned_to(herbalists_garden, '{{player}}').
quest_tag(herbalists_garden, generated).
quest_objective(herbalists_garden, 0, objective('Find Sofia Moretti in the hills above Rocca Lunare.')).
quest_objective(herbalists_garden, 1, talk_to('sofia_moretti', 1)).
quest_objective(herbalists_garden, 2, objective('Learn the names of five medicinal plants: salvia, rosmarino, lavanda, menta, camomilla.')).
quest_reward(herbalists_garden, experience, 100).
quest_reward(herbalists_garden, gold, 40).
quest_available(Player, herbalists_garden) :-
    quest(herbalists_garden, _, _, _, active).

%% ===============================================================
%% Intermediate Quests
%% ===============================================================

%% Quest: The Bankers Ledger
quest(bankers_ledger, 'The Bankers Ledger', conversation, intermediate, active).
quest_assigned_to(bankers_ledger, '{{player}}').
quest_tag(bankers_ledger, generated).
quest_objective(bankers_ledger, 0, talk_to('cosimo_valori', 1)).
quest_objective(bankers_ledger, 1, objective('Learn the principles of double-entry bookkeeping.')).
quest_objective(bankers_ledger, 2, objective('Balance a sample ledger with entries for wool, silk, and alum.')).
quest_objective(bankers_ledger, 3, talk_to('lorenzo_valori', 1)).
quest_reward(bankers_ledger, experience, 250).
quest_reward(bankers_ledger, gold, 130).
quest_available(Player, bankers_ledger) :-
    quest(bankers_ledger, _, _, _, active).

%% Quest: The Preachers Sermon
quest(preachers_sermon, 'The Preachers Sermon', conversation, intermediate, active).
quest_assigned_to(preachers_sermon, '{{player}}').
quest_tag(preachers_sermon, generated).
quest_objective(preachers_sermon, 0, objective('Attend Fra Girolamos sermon at the Duomo in Fiorenza.')).
quest_objective(preachers_sermon, 1, talk_to('fra_girolamo', 1)).
quest_objective(preachers_sermon, 2, objective('Debate the merits of luxury and vanity with a fellow citizen.')).
quest_objective(preachers_sermon, 3, objective('Deliver a written response to Fra Girolamo defending or opposing his position.')).
quest_reward(preachers_sermon, experience, 250).
quest_reward(preachers_sermon, gold, 100).
quest_available(Player, preachers_sermon) :-
    quest(preachers_sermon, _, _, _, active).

%% Quest: Charting the Stars
quest(charting_the_stars, 'Charting the Stars', cultural_knowledge, intermediate, active).
quest_assigned_to(charting_the_stars, '{{player}}').
quest_tag(charting_the_stars, generated).
quest_objective(charting_the_stars, 0, talk_to('dottore_orsini', 1)).
quest_objective(charting_the_stars, 1, objective('Learn to use an astrolabe to measure the altitude of Polaris.')).
quest_objective(charting_the_stars, 2, objective('Plot the positions of three constellations on a star chart.')).
quest_objective(charting_the_stars, 3, objective('Debate with Fra Girolamo whether celestial observation contradicts scripture.')).
quest_reward(charting_the_stars, experience, 280).
quest_reward(charting_the_stars, gold, 120).
quest_available(Player, charting_the_stars) :-
    quest(charting_the_stars, _, _, _, active).

%% Quest: The Sculptors Contest
quest(sculptors_contest, 'The Sculptors Contest', exploration, intermediate, active).
quest_assigned_to(sculptors_contest, '{{player}}').
quest_tag(sculptors_contest, generated).
quest_objective(sculptors_contest, 0, talk_to('marco_bellini', 1)).
quest_objective(sculptors_contest, 1, objective('Visit the quarry and select a block of Carrara marble.')).
quest_objective(sculptors_contest, 2, objective('Assist Marco in preparing a clay maquette for the competition.')).
quest_objective(sculptors_contest, 3, objective('Present the finished maquette to the guild judges.')).
quest_reward(sculptors_contest, experience, 250).
quest_reward(sculptors_contest, gold, 150).
quest_available(Player, sculptors_contest) :-
    quest(sculptors_contest, _, _, _, active).

%% ===============================================================
%% Advanced Quests
%% ===============================================================

%% Quest: Voyage to the Levant
quest(voyage_to_the_levant, 'Voyage to the Levant', exploration, advanced, active).
quest_assigned_to(voyage_to_the_levant, '{{player}}').
quest_tag(voyage_to_the_levant, generated).
quest_objective(voyage_to_the_levant, 0, talk_to('tommaso_galli', 1)).
quest_objective(voyage_to_the_levant, 1, objective('Provision a galley with supplies for a thirty-day voyage.')).
quest_objective(voyage_to_the_levant, 2, objective('Navigate using portolan charts and compass through the Adriatic.')).
quest_objective(voyage_to_the_levant, 3, objective('Negotiate a spice purchase at a Levantine port.')).
quest_reward(voyage_to_the_levant, experience, 450).
quest_reward(voyage_to_the_levant, gold, 250).
quest_available(Player, voyage_to_the_levant) :-
    quest(voyage_to_the_levant, _, _, _, active).

%% Quest: The Masterpiece
quest(the_masterpiece, 'The Masterpiece', grammar, advanced, active).
quest_assigned_to(the_masterpiece, '{{player}}').
quest_tag(the_masterpiece, generated).
quest_objective(the_masterpiece, 0, talk_to('maestro_rinaldi', 1)).
quest_objective(the_masterpiece, 1, objective('Study the techniques of sfumato, chiaroscuro, and linear perspective.')).
quest_objective(the_masterpiece, 2, objective('Compose a painting that incorporates all three techniques.')).
quest_objective(the_masterpiece, 3, talk_to('isabella_valori', 1)).
quest_reward(the_masterpiece, experience, 500).
quest_reward(the_masterpiece, gold, 250).
quest_available(Player, the_masterpiece) :-
    quest(the_masterpiece, _, _, _, active).

%% Quest: The Abbess and the Manuscript
quest(abbess_and_the_manuscript, 'The Abbess and the Manuscript', cultural_knowledge, advanced, active).
quest_assigned_to(abbess_and_the_manuscript, '{{player}}').
quest_tag(abbess_and_the_manuscript, generated).
quest_objective(abbess_and_the_manuscript, 0, talk_to('suor_chiara', 1)).
quest_objective(abbess_and_the_manuscript, 1, objective('Study a newly recovered Greek philosophical text in the monastery library.')).
quest_objective(abbess_and_the_manuscript, 2, objective('Translate a key passage from Greek into the vernacular.')).
quest_objective(abbess_and_the_manuscript, 3, objective('Present the translation to Dottore Orsini and defend your interpretation.')).
quest_reward(abbess_and_the_manuscript, experience, 500).
quest_reward(abbess_and_the_manuscript, gold, 200).
quest_available(Player, abbess_and_the_manuscript) :-
    quest(abbess_and_the_manuscript, _, _, _, active).

%% Quest: The Doges Diplomacy
quest(doges_diplomacy, 'The Doges Diplomacy', conversation, advanced, active).
quest_assigned_to(doges_diplomacy, '{{player}}').
quest_tag(doges_diplomacy, generated).
quest_objective(doges_diplomacy, 0, talk_to('bianca_contarini', 1)).
quest_objective(doges_diplomacy, 1, objective('Navigate a diplomatic reception at the Palazzo Ducale in Porto Sereno.')).
quest_objective(doges_diplomacy, 2, objective('Persuade rival merchant houses to support a joint naval venture.')).
quest_objective(doges_diplomacy, 3, talk_to('andrea_contarini', 1)).
quest_reward(doges_diplomacy, experience, 450).
quest_reward(doges_diplomacy, gold, 250).
quest_available(Player, doges_diplomacy) :-
    quest(doges_diplomacy, _, _, _, active).
