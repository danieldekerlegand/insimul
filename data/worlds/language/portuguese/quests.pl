%% Insimul Quests: Portuguese Algarve
%% Source: data/worlds/language/portuguese/quests.pl
%% Created: 2026-04-03
%% Total: 16 quests (CEFR A1-B2)

%% =====================================================
%% A1 -- Beginner Quests
%% =====================================================

%% Quest: Primeiros Cumprimentos (First Greetings)
quest(primeiros_cumprimentos, 'Primeiros Cumprimentos', conversation, beginner, active).
quest_assigned_to(primeiros_cumprimentos, '{{player}}').
quest_language(primeiros_cumprimentos, portuguese).
quest_tag(primeiros_cumprimentos, generated).
quest_objective(primeiros_cumprimentos, 0, talk_to('manuel_silva', 1)).
quest_objective(primeiros_cumprimentos, 1, objective('Learn basic Portuguese greetings: bom dia, boa tarde, boa noite, ola, como esta.')).
quest_objective(primeiros_cumprimentos, 2, talk_to('maria_silva', 1)).
quest_reward(primeiros_cumprimentos, experience, 100).
quest_reward(primeiros_cumprimentos, gold, 50).
quest_available(Player, primeiros_cumprimentos) :-
    quest(primeiros_cumprimentos, _, _, _, active).

%% Quest: Na Pastelaria (At the Bakery)
quest(na_pastelaria, 'Na Pastelaria', vocabulary, beginner, active).
quest_assigned_to(na_pastelaria, '{{player}}').
quest_language(na_pastelaria, portuguese).
quest_tag(na_pastelaria, generated).
quest_objective(na_pastelaria, 0, objective('Visit Pastelaria Sol.')).
quest_objective(na_pastelaria, 1, objective('Learn the names of five pastries: pastel de nata, bola de berlim, travesseiro, queijada, pastel de feijao.')).
quest_objective(na_pastelaria, 2, objective('Order a pastel de nata and a coffee using Portuguese.')).
quest_reward(na_pastelaria, experience, 100).
quest_reward(na_pastelaria, gold, 50).
quest_available(Player, na_pastelaria) :-
    quest(na_pastelaria, _, _, _, active).

%% Quest: Contar Moedas (Counting Coins)
quest(contar_moedas, 'Contar Moedas', vocabulary, beginner, active).
quest_assigned_to(contar_moedas, '{{player}}').
quest_language(contar_moedas, portuguese).
quest_tag(contar_moedas, generated).
quest_objective(contar_moedas, 0, objective('Learn Portuguese numbers 1-20.')).
quest_objective(contar_moedas, 1, objective('Count items at the Mercado do Peixe with Clara Santos.')).
quest_objective(contar_moedas, 2, objective('Pay for fish using the correct Portuguese number and euros.')).
quest_reward(contar_moedas, experience, 120).
quest_reward(contar_moedas, gold, 60).
quest_available(Player, contar_moedas) :-
    quest(contar_moedas, _, _, _, active).

%% Quest: A Minha Familia (My Family)
quest(a_minha_familia, 'A Minha Familia', conversation, beginner, active).
quest_assigned_to(a_minha_familia, '{{player}}').
quest_language(a_minha_familia, portuguese).
quest_tag(a_minha_familia, generated).
quest_objective(a_minha_familia, 0, talk_to('maria_silva', 1)).
quest_objective(a_minha_familia, 1, objective('Learn family vocabulary: mae, pai, irmao, irma, filho, filha, avo, avo.')).
quest_objective(a_minha_familia, 2, objective('Describe your own family in Portuguese to Maria.')).
quest_reward(a_minha_familia, experience, 100).
quest_reward(a_minha_familia, gold, 50).
quest_available(Player, a_minha_familia) :-
    quest(a_minha_familia, _, _, _, active).

%% =====================================================
%% A2 -- Elementary Quests
%% =====================================================

%% Quest: Caca ao Tesouro no Mercado (Market Scavenger Hunt)
quest(caca_ao_tesouro, 'Caca ao Tesouro no Mercado', exploration, beginner, active).
quest_assigned_to(caca_ao_tesouro, '{{player}}').
quest_language(caca_ao_tesouro, portuguese).
quest_tag(caca_ao_tesouro, generated).
quest_objective(caca_ao_tesouro, 0, objective('Find the fish market and buy sardinhas (sardines).')).
quest_objective(caca_ao_tesouro, 1, objective('Find the cork shop and learn cork product names.')).
quest_objective(caca_ao_tesouro, 2, objective('Find the bookstore and ask for a book recommendation in Portuguese.')).
quest_reward(caca_ao_tesouro, experience, 150).
quest_reward(caca_ao_tesouro, gold, 80).
quest_available(Player, caca_ao_tesouro) :-
    quest(caca_ao_tesouro, _, _, _, active).

%% Quest: Cafe e Conversa (Coffee and Conversation)
quest(cafe_e_conversa, 'Cafe e Conversa', cultural_knowledge, beginner, active).
quest_assigned_to(cafe_e_conversa, '{{player}}').
quest_language(cafe_e_conversa, portuguese).
quest_tag(cafe_e_conversa, generated).
quest_objective(cafe_e_conversa, 0, talk_to('manuel_silva', 1)).
quest_objective(cafe_e_conversa, 1, objective('Learn Portuguese coffee culture: um cafe, uma bica, um galao, um cimbalino.')).
quest_objective(cafe_e_conversa, 2, objective('Order three different types of coffee in Portuguese at Pastelaria Sol.')).
quest_reward(cafe_e_conversa, experience, 150).
quest_reward(cafe_e_conversa, gold, 75).
quest_available(Player, cafe_e_conversa) :-
    quest(cafe_e_conversa, _, _, _, active).

%% Quest: Direcoes na Cidade Velha (Directions in Old Town)
quest(direcoes_cidade_velha, 'Direcoes na Cidade Velha', grammar, beginner, active).
quest_assigned_to(direcoes_cidade_velha, '{{player}}').
quest_language(direcoes_cidade_velha, portuguese).
quest_tag(direcoes_cidade_velha, generated).
quest_objective(direcoes_cidade_velha, 0, objective('Learn direction words: direita, esquerda, em frente, atras, ao lado de.')).
quest_objective(direcoes_cidade_velha, 1, objective('Ask three people for directions in Portuguese.')).
quest_objective(direcoes_cidade_velha, 2, objective('Navigate to the Torre do Relogio using only Portuguese directions.')).
quest_reward(direcoes_cidade_velha, experience, 150).
quest_reward(direcoes_cidade_velha, gold, 80).
quest_available(Player, direcoes_cidade_velha) :-
    quest(direcoes_cidade_velha, _, _, _, active).

%% Quest: Marisco e Mais (Seafood and More)
quest(marisco_e_mais, 'Marisco e Mais', vocabulary, beginner, active).
quest_assigned_to(marisco_e_mais, '{{player}}').
quest_language(marisco_e_mais, portuguese).
quest_tag(marisco_e_mais, generated).
quest_objective(marisco_e_mais, 0, objective('Visit Restaurante O Pescador and order a meal in Portuguese.')).
quest_objective(marisco_e_mais, 1, objective('Learn 10 seafood words: sardinhas, polvo, lulas, camarao, robalo, dourada, bacalhau, amejoas, berbigao, lagosta.')).
quest_objective(marisco_e_mais, 2, objective('Describe your favorite food in Portuguese to Clara Santos.')).
quest_reward(marisco_e_mais, experience, 160).
quest_reward(marisco_e_mais, gold, 80).
quest_available(Player, marisco_e_mais) :-
    quest(marisco_e_mais, _, _, _, active).

%% =====================================================
%% B1 -- Intermediate Quests
%% =====================================================

%% Quest: Passeio pela Marina (Marina Walk)
quest(passeio_pela_marina, 'Passeio pela Marina', exploration, intermediate, active).
quest_assigned_to(passeio_pela_marina, '{{player}}').
quest_language(passeio_pela_marina, portuguese).
quest_tag(passeio_pela_marina, generated).
quest_objective(passeio_pela_marina, 0, talk_to('ricardo_pereira', 1)).
quest_objective(passeio_pela_marina, 1, objective('Tour the marina and learn nautical vocabulary.')).
quest_objective(passeio_pela_marina, 2, objective('Introduce yourself to three people in formal Portuguese using voce and o senhor / a senhora.')).
quest_objective(passeio_pela_marina, 3, talk_to('ana_pereira', 1)).
quest_reward(passeio_pela_marina, experience, 250).
quest_reward(passeio_pela_marina, gold, 120).
quest_available(Player, passeio_pela_marina) :-
    quest(passeio_pela_marina, _, _, _, active).

%% Quest: A Arte dos Azulejos (The Art of Azulejos)
quest(arte_dos_azulejos, 'A Arte dos Azulejos', cultural_knowledge, intermediate, active).
quest_assigned_to(arte_dos_azulejos, '{{player}}').
quest_language(arte_dos_azulejos, portuguese).
quest_tag(arte_dos_azulejos, generated).
quest_objective(arte_dos_azulejos, 0, objective('Visit the Atelier de Azulejos.')).
quest_objective(arte_dos_azulejos, 1, objective('Learn about azulejo history and styles: majolica, padrao, painel.')).
quest_objective(arte_dos_azulejos, 2, objective('Describe a tile pattern using colors and shapes in Portuguese.')).
quest_reward(arte_dos_azulejos, experience, 250).
quest_reward(arte_dos_azulejos, gold, 100).
quest_available(Player, arte_dos_azulejos) :-
    quest(arte_dos_azulejos, _, _, _, active).

%% Quest: A Aldeia de Pescadores (The Fishing Village)
quest(aldeia_de_pescadores, 'A Aldeia de Pescadores', conversation, intermediate, active).
quest_assigned_to(aldeia_de_pescadores, '{{player}}').
quest_language(aldeia_de_pescadores, portuguese).
quest_tag(aldeia_de_pescadores, generated).
quest_objective(aldeia_de_pescadores, 0, objective('Travel to Aldeia do Mar.')).
quest_objective(aldeia_de_pescadores, 1, talk_to('joaquim_costa', 1)).
quest_objective(aldeia_de_pescadores, 2, objective('Help Joaquim describe his catch using marine vocabulary.')).
quest_objective(aldeia_de_pescadores, 3, objective('Have a conversation about village life with Rosa Costa.')).
quest_reward(aldeia_de_pescadores, experience, 280).
quest_reward(aldeia_de_pescadores, gold, 130).
quest_available(Player, aldeia_de_pescadores) :-
    quest(aldeia_de_pescadores, _, _, _, active).

%% Quest: Regatear no Mercado (Bargaining at the Market)
quest(regatear_no_mercado, 'Regatear no Mercado', grammar, intermediate, active).
quest_assigned_to(regatear_no_mercado, '{{player}}').
quest_language(regatear_no_mercado, portuguese).
quest_tag(regatear_no_mercado, generated).
quest_objective(regatear_no_mercado, 0, objective('Learn comparative and superlative forms: mais... que, menos... que, o mais, o menos.')).
quest_objective(regatear_no_mercado, 1, objective('Bargain for cork products at Casa da Cortica.')).
quest_objective(regatear_no_mercado, 2, objective('Successfully negotiate a price using Portuguese number expressions.')).
quest_reward(regatear_no_mercado, experience, 250).
quest_reward(regatear_no_mercado, gold, 150).
quest_available(Player, regatear_no_mercado) :-
    quest(regatear_no_mercado, _, _, _, active).

%% =====================================================
%% B2 -- Upper Intermediate Quests
%% =====================================================

%% Quest: A Colheita da Cortica (The Cork Harvest)
quest(colheita_da_cortica, 'A Colheita da Cortica', conversation, advanced, active).
quest_assigned_to(colheita_da_cortica, '{{player}}').
quest_language(colheita_da_cortica, portuguese).
quest_tag(colheita_da_cortica, generated).
quest_objective(colheita_da_cortica, 0, objective('Visit Fernando Oliveira at Aldeia do Mar.')).
quest_objective(colheita_da_cortica, 1, talk_to('fernando_oliveira', 1)).
quest_objective(colheita_da_cortica, 2, objective('Discuss cork harvesting traditions using the subjunctive mood.')).
quest_objective(colheita_da_cortica, 3, objective('Write a short paragraph about Portuguese cork industry in Portuguese.')).
quest_reward(colheita_da_cortica, experience, 400).
quest_reward(colheita_da_cortica, gold, 200).
quest_available(Player, colheita_da_cortica) :-
    quest(colheita_da_cortica, _, _, _, active).

%% Quest: Noite de Fado (Fado Night)
quest(noite_de_fado, 'Noite de Fado', grammar, advanced, active).
quest_assigned_to(noite_de_fado, '{{player}}').
quest_language(noite_de_fado, portuguese).
quest_tag(noite_de_fado, generated).
quest_objective(noite_de_fado, 0, objective('Visit Casa de Fado Saudade.')).
quest_objective(noite_de_fado, 1, talk_to('helena_ferreira', 1)).
quest_objective(noite_de_fado, 2, objective('Learn to express emotions using the subjunctive: sinto que, espero que, duvido que.')).
quest_objective(noite_de_fado, 3, objective('Discuss the meaning of saudade and fado poetry with Helena.')).
quest_reward(noite_de_fado, experience, 450).
quest_reward(noite_de_fado, gold, 200).
quest_available(Player, noite_de_fado) :-
    quest(noite_de_fado, _, _, _, active).

%% Quest: Cronicas do Algarve (Algarve Chronicles)
quest(cronicas_do_algarve, 'Cronicas do Algarve', cultural_knowledge, advanced, active).
quest_assigned_to(cronicas_do_algarve, '{{player}}').
quest_language(cronicas_do_algarve, portuguese).
quest_tag(cronicas_do_algarve, generated).
quest_objective(cronicas_do_algarve, 0, objective('Interview three residents about local history and traditions.')).
quest_objective(cronicas_do_algarve, 1, objective('Take notes using Portuguese and past tenses: preterito perfeito, imperfeito.')).
quest_objective(cronicas_do_algarve, 2, objective('Write a short article about the Algarve in Portuguese.')).
quest_objective(cronicas_do_algarve, 3, talk_to('jorge_ferreira', 1)).
quest_reward(cronicas_do_algarve, experience, 500).
quest_reward(cronicas_do_algarve, gold, 250).
quest_available(Player, cronicas_do_algarve) :-
    quest(cronicas_do_algarve, _, _, _, active).

%% Quest: Por do Sol na Praia (Beach Sunset)
quest(por_do_sol_na_praia, 'Por do Sol na Praia', exploration, advanced, active).
quest_assigned_to(por_do_sol_na_praia, '{{player}}').
quest_language(por_do_sol_na_praia, portuguese).
quest_tag(por_do_sol_na_praia, generated).
quest_objective(por_do_sol_na_praia, 0, objective('Walk the entire Estrada da Praia and describe the scenery in Portuguese.')).
quest_objective(por_do_sol_na_praia, 1, objective('Have an extended conversation with a stranger about life in the Algarve.')).
quest_objective(por_do_sol_na_praia, 2, objective('Narrate a short story about the lighthouse in Portuguese using past and conditional tenses.')).
quest_reward(por_do_sol_na_praia, experience, 450).
quest_reward(por_do_sol_na_praia, gold, 200).
quest_available(Player, por_do_sol_na_praia) :-
    quest(por_do_sol_na_praia, _, _, _, active).
