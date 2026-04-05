%% Insimul Quests: Russian Volga Town
%% Source: data/worlds/language/russian/quests.pl
%% Created: 2026-04-03
%% Total: 16 quests (CEFR A1-B2)

%% ================================================================
%% A1 -- Beginner Quests
%% ================================================================

%% Quest: First Greetings
quest(pervye_privetstviya, 'First Greetings', conversation, beginner, active).
quest_assigned_to(pervye_privetstviya, '{{player}}').
quest_language(pervye_privetstviya, russian).
quest_tag(pervye_privetstviya, generated).
quest_objective(pervye_privetstviya, 0, talk_to('ivan_volkov', 1)).
quest_objective(pervye_privetstviya, 1, objective('Learn basic Russian greetings: zdravstvuyte, privet, dobroe utro, dobriy den.')).
quest_objective(pervye_privetstviya, 2, talk_to('natalya_volkova', 1)).
quest_reward(pervye_privetstviya, experience, 100).
quest_reward(pervye_privetstviya, gold, 50).
quest_available(Player, pervye_privetstviya) :-
    quest(pervye_privetstviya, _, _, _, active).

%% Quest: At the Bakery
quest(v_bulochnoy, 'At the Bakery', vocabulary, beginner, active).
quest_assigned_to(v_bulochnoy, '{{player}}').
quest_language(v_bulochnoy, russian).
quest_tag(v_bulochnoy, generated).
quest_objective(v_bulochnoy, 0, objective('Visit Bulochnaya Kolosok bakery.')).
quest_objective(v_bulochnoy, 1, objective('Learn the names of five types of bread: khleb, bulka, baton, borodinsky, lavash.')).
quest_objective(v_bulochnoy, 2, objective('Order pirozhki and chai using Russian.')).
quest_reward(v_bulochnoy, experience, 100).
quest_reward(v_bulochnoy, gold, 50).
quest_available(Player, v_bulochnoy) :-
    quest(v_bulochnoy, _, _, _, active).

%% Quest: Counting Rubles
quest(schitaem_rubli, 'Counting Rubles', vocabulary, beginner, active).
quest_assigned_to(schitaem_rubli, '{{player}}').
quest_language(schitaem_rubli, russian).
quest_tag(schitaem_rubli, generated).
quest_objective(schitaem_rubli, 0, objective('Learn Russian numbers 1-20.')).
quest_objective(schitaem_rubli, 1, objective('Count items at the central market with Nikolai Petrov.')).
quest_objective(schitaem_rubli, 2, objective('Pay for an item using the correct Russian number and rubles.')).
quest_reward(schitaem_rubli, experience, 120).
quest_reward(schitaem_rubli, gold, 60).
quest_available(Player, schitaem_rubli) :-
    quest(schitaem_rubli, _, _, _, active).

%% Quest: My Family
quest(moya_semya, 'My Family', conversation, beginner, active).
quest_assigned_to(moya_semya, '{{player}}').
quest_language(moya_semya, russian).
quest_tag(moya_semya, generated).
quest_objective(moya_semya, 0, talk_to('natalya_volkova', 1)).
quest_objective(moya_semya, 1, objective('Learn family vocabulary: mama, papa, brat, sestra, syn, doch, babushka, dedushka.')).
quest_objective(moya_semya, 2, objective('Describe your own family in Russian to Natalya.')).
quest_reward(moya_semya, experience, 100).
quest_reward(moya_semya, gold, 50).
quest_available(Player, moya_semya) :-
    quest(moya_semya, _, _, _, active).

%% ================================================================
%% A2 -- Elementary Quests
%% ================================================================

%% Quest: Market Scavenger Hunt
quest(pokhod_na_rynok, 'Market Scavenger Hunt', exploration, beginner, active).
quest_assigned_to(pokhod_na_rynok, '{{player}}').
quest_language(pokhod_na_rynok, russian).
quest_tag(pokhod_na_rynok, generated).
quest_objective(pokhod_na_rynok, 0, objective('Find the central market and buy pickled vegetables (soleniya).')).
quest_objective(pokhod_na_rynok, 1, objective('Find the souvenir shop and learn the names of Russian crafts.')).
quest_objective(pokhod_na_rynok, 2, objective('Find the bookstore and ask for a recommendation in Russian.')).
quest_reward(pokhod_na_rynok, experience, 150).
quest_reward(pokhod_na_rynok, gold, 80).
quest_available(Player, pokhod_na_rynok) :-
    quest(pokhod_na_rynok, _, _, _, active).

%% Quest: Tea Traditions
quest(chaynyye_traditsii, 'Tea Traditions', cultural_knowledge, beginner, active).
quest_assigned_to(chaynyye_traditsii, '{{player}}').
quest_language(chaynyye_traditsii, russian).
quest_tag(chaynyye_traditsii, generated).
quest_objective(chaynyye_traditsii, 0, talk_to('ivan_volkov', 1)).
quest_objective(chaynyye_traditsii, 1, objective('Learn the etiquette of Russian tea service with a samovar.')).
quest_objective(chaynyye_traditsii, 2, objective('Serve tea to three guests using proper Russian phrases.')).
quest_reward(chaynyye_traditsii, experience, 150).
quest_reward(chaynyye_traditsii, gold, 75).
quest_available(Player, chaynyye_traditsii) :-
    quest(chaynyye_traditsii, _, _, _, active).

%% Quest: Directions in Town
quest(kak_proiti, 'Directions in Town', grammar, beginner, active).
quest_assigned_to(kak_proiti, '{{player}}').
quest_language(kak_proiti, russian).
quest_tag(kak_proiti, generated).
quest_objective(kak_proiti, 0, objective('Learn direction words: napravo, nalevo, pryamo, nazad.')).
quest_objective(kak_proiti, 1, objective('Ask three people for directions in Russian.')).
quest_objective(kak_proiti, 2, objective('Navigate to the cathedral using only Russian directions.')).
quest_reward(kak_proiti, experience, 150).
quest_reward(kak_proiti, gold, 80).
quest_available(Player, kak_proiti) :-
    quest(kak_proiti, _, _, _, active).

%% Quest: Russian Food Festival
quest(prazdnik_edy, 'Russian Food Festival', vocabulary, beginner, active).
quest_assigned_to(prazdnik_edy, '{{player}}').
quest_language(prazdnik_edy, russian).
quest_tag(prazdnik_edy, generated).
quest_objective(prazdnik_edy, 0, objective('Visit Stolovaya Druzhba and order a meal in Russian.')).
quest_objective(prazdnik_edy, 1, objective('Learn 10 food words at the river restaurant.')).
quest_objective(prazdnik_edy, 2, objective('Describe your favorite food in Russian to Vera Petrova.')).
quest_reward(prazdnik_edy, experience, 160).
quest_reward(prazdnik_edy, gold, 80).
quest_available(Player, prazdnik_edy) :-
    quest(prazdnik_edy, _, _, _, active).

%% ================================================================
%% B1 -- Intermediate Quests
%% ================================================================

%% Quest: University Tour
quest(ekskursiya_universitet, 'University Tour', exploration, intermediate, active).
quest_assigned_to(ekskursiya_universitet, '{{player}}').
quest_language(ekskursiya_universitet, russian).
quest_tag(ekskursiya_universitet, generated).
quest_objective(ekskursiya_universitet, 0, talk_to('dmitry_ivanov', 1)).
quest_objective(ekskursiya_universitet, 1, objective('Tour the university campus and learn academic vocabulary.')).
quest_objective(ekskursiya_universitet, 2, objective('Introduce yourself to three students using formal Russian (vy).')).
quest_objective(ekskursiya_universitet, 3, talk_to('yelena_ivanova', 1)).
quest_reward(ekskursiya_universitet, experience, 250).
quest_reward(ekskursiya_universitet, gold, 120).
quest_available(Player, ekskursiya_universitet) :-
    quest(ekskursiya_universitet, _, _, _, active).

%% Quest: A Day at the Banya
quest(den_v_bane, 'A Day at the Banya', cultural_knowledge, intermediate, active).
quest_assigned_to(den_v_bane, '{{player}}').
quest_language(den_v_bane, russian).
quest_tag(den_v_bane, generated).
quest_objective(den_v_bane, 0, objective('Visit Banya na Gagarina.')).
quest_objective(den_v_bane, 1, objective('Learn banya vocabulary: parilka, venik, par, predbannik.')).
quest_objective(den_v_bane, 2, objective('Discuss the tradition of Russian steam baths with other visitors.')).
quest_reward(den_v_bane, experience, 250).
quest_reward(den_v_bane, gold, 100).
quest_available(Player, den_v_bane) :-
    quest(den_v_bane, _, _, _, active).

%% Quest: The Fishing Village
quest(rybatskaya_derevnya, 'The Fishing Village', conversation, intermediate, active).
quest_assigned_to(rybatskaya_derevnya, '{{player}}').
quest_language(rybatskaya_derevnya, russian).
quest_tag(rybatskaya_derevnya, generated).
quest_objective(rybatskaya_derevnya, 0, objective('Travel to Rybachye village.')).
quest_objective(rybatskaya_derevnya, 1, talk_to('grigory_kuznetsov', 1)).
quest_objective(rybatskaya_derevnya, 2, objective('Help Grigory describe his catch using fishing vocabulary.')).
quest_objective(rybatskaya_derevnya, 3, objective('Have a conversation about village life with Irina Kuznetsova.')).
quest_reward(rybatskaya_derevnya, experience, 280).
quest_reward(rybatskaya_derevnya, gold, 130).
quest_available(Player, rybatskaya_derevnya) :-
    quest(rybatskaya_derevnya, _, _, _, active).

%% Quest: Bargaining at the Market
quest(torg_na_rynke, 'Bargaining at the Market', grammar, intermediate, active).
quest_assigned_to(torg_na_rynke, '{{player}}').
quest_language(torg_na_rynke, russian).
quest_tag(torg_na_rynke, generated).
quest_objective(torg_na_rynke, 0, objective('Learn comparative and superlative forms in Russian.')).
quest_objective(torg_na_rynke, 1, objective('Bargain for a matryoshka at Suveniry Volgi.')).
quest_objective(torg_na_rynke, 2, objective('Successfully negotiate a price reduction using Russian.')).
quest_reward(torg_na_rynke, experience, 250).
quest_reward(torg_na_rynke, gold, 150).
quest_available(Player, torg_na_rynke) :-
    quest(torg_na_rynke, _, _, _, active).

%% ================================================================
%% B2 -- Upper Intermediate Quests
%% ================================================================

%% Quest: The Beekeeper of Rybachye
quest(pchelovod, 'The Beekeeper of Rybachye', conversation, advanced, active).
quest_assigned_to(pchelovod, '{{player}}').
quest_language(pchelovod, russian).
quest_tag(pchelovod, generated).
quest_objective(pchelovod, 0, objective('Visit Pyotr Morozov at his home in Rybachye.')).
quest_objective(pchelovod, 1, talk_to('pyotr_morozov', 1)).
quest_objective(pchelovod, 2, objective('Discuss beekeeping traditions and Volga nature in Russian.')).
quest_objective(pchelovod, 3, objective('Write a short paragraph about village life in Russian.')).
quest_reward(pchelovod, experience, 400).
quest_reward(pchelovod, gold, 200).
quest_available(Player, pchelovod) :-
    quest(pchelovod, _, _, _, active).

%% Quest: The Debate
quest(diskussiya, 'The Debate', grammar, advanced, active).
quest_assigned_to(diskussiya, '{{player}}').
quest_language(diskussiya, russian).
quest_tag(diskussiya, generated).
quest_objective(diskussiya, 0, talk_to('dmitry_ivanov', 1)).
quest_objective(diskussiya, 1, objective('Learn to express opinions: ya dumayu, ya schitayu, ya ne soglasen.')).
quest_objective(diskussiya, 2, objective('Participate in a debate at the university on a cultural topic.')).
quest_objective(diskussiya, 3, objective('Use conditional sentences (yesli by) in your arguments.')).
quest_reward(diskussiya, experience, 450).
quest_reward(diskussiya, gold, 200).
quest_available(Player, diskussiya) :-
    quest(diskussiya, _, _, _, active).

%% Quest: Writing for the Local Paper
quest(statya_dlya_gazety, 'Writing for the Local Paper', cultural_knowledge, advanced, active).
quest_assigned_to(statya_dlya_gazety, '{{player}}').
quest_language(statya_dlya_gazety, russian).
quest_tag(statya_dlya_gazety, generated).
quest_objective(statya_dlya_gazety, 0, objective('Interview three residents about a community topic.')).
quest_objective(statya_dlya_gazety, 1, objective('Take notes using Russian.')).
quest_objective(statya_dlya_gazety, 2, objective('Write a short article in Russian about life along the Volga.')).
quest_objective(statya_dlya_gazety, 3, talk_to('olga_ivanova', 1)).
quest_reward(statya_dlya_gazety, experience, 500).
quest_reward(statya_dlya_gazety, gold, 250).
quest_available(Player, statya_dlya_gazety) :-
    quest(statya_dlya_gazety, _, _, _, active).

%% Quest: Volga River Promenade
quest(progulka_po_naberezhnoy, 'Volga River Promenade', exploration, advanced, active).
quest_assigned_to(progulka_po_naberezhnoy, '{{player}}').
quest_language(progulka_po_naberezhnoy, russian).
quest_tag(progulka_po_naberezhnoy, generated).
quest_objective(progulka_po_naberezhnoy, 0, objective('Walk the entire naberezhnaya and describe the scenery in Russian.')).
quest_objective(progulka_po_naberezhnoy, 1, objective('Have an extended conversation with a stranger about life in the town.')).
quest_objective(progulka_po_naberezhnoy, 2, objective('Narrate a short story about the Volga River in Russian.')).
quest_reward(progulka_po_naberezhnoy, experience, 450).
quest_reward(progulka_po_naberezhnoy, gold, 200).
quest_available(Player, progulka_po_naberezhnoy) :-
    quest(progulka_po_naberezhnoy, _, _, _, active).
