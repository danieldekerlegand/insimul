%% Insimul Quests: Italian Tuscany
%% Source: data/worlds/language/italian/quests.pl
%% Created: 2026-04-03
%% Total: 16 quests (CEFR A1-B2)

%% ======================================================
%% A1 -- Beginner Quests
%% ======================================================

%% Quest: Primi Saluti (First Greetings)
quest(primi_saluti, 'Primi Saluti', conversation, beginner, active).
quest_assigned_to(primi_saluti, '{{player}}').
quest_language(primi_saluti, italian).
quest_tag(primi_saluti, generated).
quest_objective(primi_saluti, 0, talk_to('giuseppe_rossi', 1)).
quest_objective(primi_saluti, 1, objective('Learn basic Italian greetings: buongiorno, buonasera, ciao, arrivederci.')).
quest_objective(primi_saluti, 2, talk_to('lucia_rossi', 1)).
quest_reward(primi_saluti, experience, 100).
quest_reward(primi_saluti, gold, 50).
quest_available(Player, primi_saluti) :-
    quest(primi_saluti, _, _, _, active).

%% Quest: Al Bar (At the Cafe)
quest(al_bar, 'Al Bar', vocabulary, beginner, active).
quest_assigned_to(al_bar, '{{player}}').
quest_language(al_bar, italian).
quest_tag(al_bar, generated).
quest_objective(al_bar, 0, objective('Visit Bar Centrale on Via Roma.')).
quest_objective(al_bar, 1, objective('Learn to order: un caffe, un cappuccino, un cornetto.')).
quest_objective(al_bar, 2, objective('Pay using Italian numbers and say grazie.')).
quest_reward(al_bar, experience, 100).
quest_reward(al_bar, gold, 50).
quest_available(Player, al_bar) :-
    quest(al_bar, _, _, _, active).

%% Quest: Contare in Italiano (Counting in Italian)
quest(contare_italiano, 'Contare in Italiano', vocabulary, beginner, active).
quest_assigned_to(contare_italiano, '{{player}}').
quest_language(contare_italiano, italian).
quest_tag(contare_italiano, generated).
quest_objective(contare_italiano, 0, objective('Learn Italian numbers 1-20.')).
quest_objective(contare_italiano, 1, objective('Count items at Alimentari Ferrari with Anna Conti.')).
quest_objective(contare_italiano, 2, objective('Pay for groceries using the correct Italian amounts.')).
quest_reward(contare_italiano, experience, 120).
quest_reward(contare_italiano, gold, 60).
quest_available(Player, contare_italiano) :-
    quest(contare_italiano, _, _, _, active).

%% Quest: La Mia Famiglia (My Family)
quest(la_mia_famiglia, 'La Mia Famiglia', conversation, beginner, active).
quest_assigned_to(la_mia_famiglia, '{{player}}').
quest_language(la_mia_famiglia, italian).
quest_tag(la_mia_famiglia, generated).
quest_objective(la_mia_famiglia, 0, talk_to('lucia_rossi', 1)).
quest_objective(la_mia_famiglia, 1, objective('Learn family vocabulary: madre, padre, fratello, sorella, figlio, figlia.')).
quest_objective(la_mia_famiglia, 2, objective('Describe your own family in Italian to Lucia.')).
quest_reward(la_mia_famiglia, experience, 100).
quest_reward(la_mia_famiglia, gold, 50).
quest_available(Player, la_mia_famiglia) :-
    quest(la_mia_famiglia, _, _, _, active).

%% ======================================================
%% A2 -- Elementary Quests
%% ======================================================

%% Quest: Al Mercato (At the Market)
quest(al_mercato, 'Al Mercato', exploration, beginner, active).
quest_assigned_to(al_mercato, '{{player}}').
quest_language(al_mercato, italian).
quest_tag(al_mercato, generated).
quest_objective(al_mercato, 0, objective('Visit the Mercato Settimanale on market day.')).
quest_objective(al_mercato, 1, objective('Learn names of fruits and vegetables: pomodori, melanzane, peperoni, zucchine.')).
quest_objective(al_mercato, 2, objective('Buy ingredients for a Tuscan meal using Italian.')).
quest_reward(al_mercato, experience, 150).
quest_reward(al_mercato, gold, 80).
quest_available(Player, al_mercato) :-
    quest(al_mercato, _, _, _, active).

%% Quest: Un Gelato Per Favore (A Gelato Please)
quest(un_gelato, 'Un Gelato Per Favore', vocabulary, beginner, active).
quest_assigned_to(un_gelato, '{{player}}').
quest_language(un_gelato, italian).
quest_tag(un_gelato, generated).
quest_objective(un_gelato, 0, objective('Visit Gelateria Dolce Vita.')).
quest_objective(un_gelato, 1, objective('Learn gelato flavors: cioccolato, fragola, pistacchio, limone, nocciola.')).
quest_objective(un_gelato, 2, objective('Order a cone or cup using vorrei un cono/una coppa.')).
quest_reward(un_gelato, experience, 150).
quest_reward(un_gelato, gold, 75).
quest_available(Player, un_gelato) :-
    quest(un_gelato, _, _, _, active).

%% Quest: Chiedere la Strada (Asking for Directions)
quest(chiedere_strada, 'Chiedere la Strada', grammar, beginner, active).
quest_assigned_to(chiedere_strada, '{{player}}').
quest_language(chiedere_strada, italian).
quest_tag(chiedere_strada, generated).
quest_objective(chiedere_strada, 0, objective('Learn direction words: destra, sinistra, dritto, dietro, davanti.')).
quest_objective(chiedere_strada, 1, objective('Ask three people for directions using scusi, dove si trova...?')).
quest_objective(chiedere_strada, 2, objective('Navigate to the Torre Medievale using only Italian directions.')).
quest_reward(chiedere_strada, experience, 150).
quest_reward(chiedere_strada, gold, 80).
quest_available(Player, chiedere_strada) :-
    quest(chiedere_strada, _, _, _, active).

%% Quest: A Tavola (At the Table)
quest(a_tavola, 'A Tavola', vocabulary, beginner, active).
quest_assigned_to(a_tavola, '{{player}}').
quest_language(a_tavola, italian).
quest_tag(a_tavola, generated).
quest_objective(a_tavola, 0, objective('Visit Trattoria da Nonna Lucia.')).
quest_objective(a_tavola, 1, objective('Learn menu vocabulary: primo, secondo, contorno, dolce, antipasto.')).
quest_objective(a_tavola, 2, objective('Order a full meal in Italian from Giuseppe Rossi.')).
quest_reward(a_tavola, experience, 160).
quest_reward(a_tavola, gold, 80).
quest_available(Player, a_tavola) :-
    quest(a_tavola, _, _, _, active).

%% ======================================================
%% B1 -- Intermediate Quests
%% ======================================================

%% Quest: La Vendemmia (The Grape Harvest)
quest(la_vendemmia, 'La Vendemmia', exploration, intermediate, active).
quest_assigned_to(la_vendemmia, '{{player}}').
quest_language(la_vendemmia, italian).
quest_tag(la_vendemmia, generated).
quest_objective(la_vendemmia, 0, objective('Travel to San Vito and visit Cantina Brunelli.')).
quest_objective(la_vendemmia, 1, talk_to('enrico_ferrari', 1)).
quest_objective(la_vendemmia, 2, objective('Learn winemaking vocabulary: uva, vendemmia, fermentazione, botte, annata.')).
quest_objective(la_vendemmia, 3, objective('Describe the wine tasting using Italian adjectives.')).
quest_reward(la_vendemmia, experience, 250).
quest_reward(la_vendemmia, gold, 120).
quest_available(Player, la_vendemmia) :-
    quest(la_vendemmia, _, _, _, active).

%% Quest: Bottega Artigiana (Artisan Workshop)
quest(bottega_artigiana, 'Bottega Artigiana', cultural_knowledge, intermediate, active).
quest_assigned_to(bottega_artigiana, '{{player}}').
quest_language(bottega_artigiana, italian).
quest_tag(bottega_artigiana, generated).
quest_objective(bottega_artigiana, 0, objective('Visit Ceramica Moretti on Via degli Artigiani.')).
quest_objective(bottega_artigiana, 1, objective('Learn craft vocabulary: argilla, tornio, smalto, cottura.')).
quest_objective(bottega_artigiana, 2, objective('Describe a ceramic piece using colors and shapes in Italian.')).
quest_reward(bottega_artigiana, experience, 250).
quest_reward(bottega_artigiana, gold, 100).
quest_available(Player, bottega_artigiana) :-
    quest(bottega_artigiana, _, _, _, active).

%% Quest: Il Frantoio (The Olive Press)
quest(il_frantoio, 'Il Frantoio', conversation, intermediate, active).
quest_assigned_to(il_frantoio, '{{player}}').
quest_language(il_frantoio, italian).
quest_tag(il_frantoio, generated).
quest_objective(il_frantoio, 0, objective('Visit Frantoio San Vito in the village.')).
quest_objective(il_frantoio, 1, talk_to('giovanni_moretti', 1)).
quest_objective(il_frantoio, 2, objective('Discuss olive oil production: raccolta, spremitura, extravergine.')).
quest_objective(il_frantoio, 3, objective('Compare different olive oils using Italian taste vocabulary.')).
quest_reward(il_frantoio, experience, 280).
quest_reward(il_frantoio, gold, 130).
quest_available(Player, il_frantoio) :-
    quest(il_frantoio, _, _, _, active).

%% Quest: Contrattare al Mercato (Bargaining at the Market)
quest(contrattare_mercato, 'Contrattare al Mercato', grammar, intermediate, active).
quest_assigned_to(contrattare_mercato, '{{player}}').
quest_language(contrattare_mercato, italian).
quest_tag(contrattare_mercato, generated).
quest_objective(contrattare_mercato, 0, objective('Learn comparative and superlative forms: piu, meno, il migliore, il peggiore.')).
quest_objective(contrattare_mercato, 1, objective('Negotiate prices at the weekly market using polite Italian.')).
quest_objective(contrattare_mercato, 2, objective('Use the conditional tense: vorrei, potrebbe, sarebbe possibile.')).
quest_reward(contrattare_mercato, experience, 250).
quest_reward(contrattare_mercato, gold, 150).
quest_available(Player, contrattare_mercato) :-
    quest(contrattare_mercato, _, _, _, active).

%% ======================================================
%% B2 -- Upper Intermediate Quests
%% ======================================================

%% Quest: La Raccolta delle Olive (The Olive Harvest)
quest(raccolta_olive, 'La Raccolta delle Olive', conversation, advanced, active).
quest_assigned_to(raccolta_olive, '{{player}}').
quest_language(raccolta_olive, italian).
quest_tag(raccolta_olive, generated).
quest_objective(raccolta_olive, 0, objective('Visit Giovanni Moretti during the olive harvest season.')).
quest_objective(raccolta_olive, 1, talk_to('giovanni_moretti', 1)).
quest_objective(raccolta_olive, 2, objective('Discuss agricultural traditions and seasonal cycles in Italian.')).
quest_objective(raccolta_olive, 3, objective('Write a short paragraph about Tuscan farming traditions.')).
quest_reward(raccolta_olive, experience, 400).
quest_reward(raccolta_olive, gold, 200).
quest_available(Player, raccolta_olive) :-
    quest(raccolta_olive, _, _, _, active).

%% Quest: Il Dibattito (The Debate)
quest(il_dibattito, 'Il Dibattito', grammar, advanced, active).
quest_assigned_to(il_dibattito, '{{player}}').
quest_language(il_dibattito, italian).
quest_tag(il_dibattito, generated).
quest_objective(il_dibattito, 0, talk_to('stefano_romano', 1)).
quest_objective(il_dibattito, 1, objective('Learn to express opinions: penso che, credo che, non sono d''accordo.')).
quest_objective(il_dibattito, 2, objective('Debate the value of tradition versus modernity in Tuscan life.')).
quest_objective(il_dibattito, 3, objective('Use the subjunctive mood correctly in your arguments.')).
quest_reward(il_dibattito, experience, 450).
quest_reward(il_dibattito, gold, 200).
quest_available(Player, il_dibattito) :-
    quest(il_dibattito, _, _, _, active).

%% Quest: Scrivere per il Giornale (Writing for the Local Paper)
quest(giornale_locale, 'Scrivere per il Giornale', cultural_knowledge, advanced, active).
quest_assigned_to(giornale_locale, '{{player}}').
quest_language(giornale_locale, italian).
quest_tag(giornale_locale, generated).
quest_objective(giornale_locale, 0, objective('Interview three residents about the upcoming sagra (festival).')).
quest_objective(giornale_locale, 1, objective('Take notes using Italian journalistic vocabulary.')).
quest_objective(giornale_locale, 2, objective('Write a short article about town life in formal Italian.')).
quest_objective(giornale_locale, 3, talk_to('paola_romano', 1)).
quest_reward(giornale_locale, experience, 500).
quest_reward(giornale_locale, gold, 250).
quest_available(Player, giornale_locale) :-
    quest(giornale_locale, _, _, _, active).

%% Quest: Passeggiata al Tramonto (Sunset Stroll)
quest(passeggiata_tramonto, 'Passeggiata al Tramonto', exploration, advanced, active).
quest_assigned_to(passeggiata_tramonto, '{{player}}').
quest_language(passeggiata_tramonto, italian).
quest_tag(passeggiata_tramonto, generated).
quest_objective(passeggiata_tramonto, 0, objective('Walk the passeggiata route and describe the scenery in Italian.')).
quest_objective(passeggiata_tramonto, 1, objective('Have an extended conversation with a local about life in Tuscany.')).
quest_objective(passeggiata_tramonto, 2, objective('Narrate a short story about the Torre Medievale in Italian.')).
quest_reward(passeggiata_tramonto, experience, 450).
quest_reward(passeggiata_tramonto, gold, 200).
quest_available(Player, passeggiata_tramonto) :-
    quest(passeggiata_tramonto, _, _, _, active).
