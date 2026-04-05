%% Insimul Quests: Creole Colonial
%% Source: data/worlds/creole_colonial/quests.pl
%% Created: 2026-04-03
%% Total: 12 quests (CEFR A1-B2)

%% ═══════════════════════════════════════════════════════════
%% A1 -- Beginner Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Bonjou, Mo Zanmi
quest(bonjou_mo_zanmi, 'Bonjou, Mo Zanmi', conversation, beginner, active).
quest_assigned_to(bonjou_mo_zanmi, '{{player}}').
quest_language(bonjou_mo_zanmi, louisiana_creole).
quest_tag(bonjou_mo_zanmi, generated).
quest_objective(bonjou_mo_zanmi, 0, talk_to('mambo_celeste', 1)).
quest_objective(bonjou_mo_zanmi, 1, objective('Learn basic Creole greetings: bonjou, komon to ye, sa va.')).
quest_objective(bonjou_mo_zanmi, 2, talk_to('tante_rose', 1)).
quest_reward(bonjou_mo_zanmi, experience, 100).
quest_reward(bonjou_mo_zanmi, gold, 50).
quest_available(Player, bonjou_mo_zanmi) :-
    quest(bonjou_mo_zanmi, _, _, _, active).

%% Quest: At the Market
quest(at_the_market, 'At the Market', vocabulary, beginner, active).
quest_assigned_to(at_the_market, '{{player}}').
quest_language(at_the_market, louisiana_creole).
quest_tag(at_the_market, generated).
quest_objective(at_the_market, 0, objective('Visit the Marche du Port.')).
quest_objective(at_the_market, 1, objective('Learn the Creole names of five common goods: diri, pwason, viann, legim, fri.')).
quest_objective(at_the_market, 2, objective('Purchase items using Creole phrases.')).
quest_reward(at_the_market, experience, 100).
quest_reward(at_the_market, gold, 50).
quest_available(Player, at_the_market) :-
    quest(at_the_market, _, _, _, active).

%% Quest: Counting Piasters
quest(counting_piasters, 'Counting Piasters', vocabulary, beginner, active).
quest_assigned_to(counting_piasters, '{{player}}').
quest_language(counting_piasters, louisiana_creole).
quest_tag(counting_piasters, generated).
quest_objective(counting_piasters, 0, objective('Learn Creole numbers 1-20.')).
quest_objective(counting_piasters, 1, objective('Count coins at the Maison de Commerce Moreau.')).
quest_objective(counting_piasters, 2, talk_to('jacques_moreau', 1)).
quest_reward(counting_piasters, experience, 100).
quest_reward(counting_piasters, gold, 75).
quest_available(Player, counting_piasters) :-
    quest(counting_piasters, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% A2 -- Elementary Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Bayou Navigation
quest(bayou_navigation, 'Bayou Navigation', exploration, elementary, active).
quest_assigned_to(bayou_navigation, '{{player}}').
quest_language(bayou_navigation, louisiana_creole).
quest_tag(bayou_navigation, generated).
quest_objective(bayou_navigation, 0, objective('Ask Remy Boudreaux for directions in Creole.')).
quest_objective(bayou_navigation, 1, talk_to('remy_boudreaux', 1)).
quest_objective(bayou_navigation, 2, objective('Navigate from Bayou Vermillon to Nouvelle-Orleans using Creole direction words.')).
quest_objective(bayou_navigation, 3, objective('Learn spatial vocabulary: agoch, adrwat, divan, derye.')).
quest_reward(bayou_navigation, experience, 200).
quest_reward(bayou_navigation, gold, 100).
quest_available(Player, bayou_navigation) :-
    quest(bayou_navigation, _, _, _, active).

%% Quest: Recipe of the Bayou
quest(recipe_of_the_bayou, 'Recipe of the Bayou', vocabulary, elementary, active).
quest_assigned_to(recipe_of_the_bayou, '{{player}}').
quest_language(recipe_of_the_bayou, louisiana_creole).
quest_tag(recipe_of_the_bayou, generated).
quest_objective(recipe_of_the_bayou, 0, talk_to('josephine_boudreaux', 1)).
quest_objective(recipe_of_the_bayou, 1, objective('Learn ingredient names in Creole for a gumbo recipe.')).
quest_objective(recipe_of_the_bayou, 2, objective('Gather okra, rice, and crawfish from the market and bayou.')).
quest_objective(recipe_of_the_bayou, 3, objective('Describe the cooking steps using Creole verbs.')).
quest_reward(recipe_of_the_bayou, experience, 200).
quest_reward(recipe_of_the_bayou, gold, 100).
quest_available(Player, recipe_of_the_bayou) :-
    quest(recipe_of_the_bayou, _, _, _, active).

%% Quest: Sunday at the Cathedral
quest(sunday_at_the_cathedral, 'Sunday at the Cathedral', conversation, elementary, active).
quest_assigned_to(sunday_at_the_cathedral, '{{player}}').
quest_language(sunday_at_the_cathedral, louisiana_creole).
quest_tag(sunday_at_the_cathedral, generated).
quest_objective(sunday_at_the_cathedral, 0, talk_to('padre_ignacio', 1)).
quest_objective(sunday_at_the_cathedral, 1, objective('Learn days of the week and religious vocabulary in Creole.')).
quest_objective(sunday_at_the_cathedral, 2, objective('Introduce yourself to three parishioners using Creole.')).
quest_reward(sunday_at_the_cathedral, experience, 200).
quest_reward(sunday_at_the_cathedral, gold, 75).
quest_available(Player, sunday_at_the_cathedral) :-
    quest(sunday_at_the_cathedral, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% B1 -- Intermediate Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: The Trading Deal
quest(the_trading_deal, 'The Trading Deal', negotiation, intermediate, active).
quest_assigned_to(the_trading_deal, '{{player}}').
quest_language(the_trading_deal, louisiana_creole).
quest_tag(the_trading_deal, generated).
quest_objective(the_trading_deal, 0, talk_to('jacques_moreau', 1)).
quest_objective(the_trading_deal, 1, objective('Negotiate the price of indigo in Creole with a visiting merchant.')).
quest_objective(the_trading_deal, 2, objective('Use comparative forms: pli bon, pli cher, mwen cher.')).
quest_objective(the_trading_deal, 3, objective('Close the deal using formal Creole business phrases.')).
quest_reward(the_trading_deal, experience, 350).
quest_reward(the_trading_deal, gold, 200).
quest_available(Player, the_trading_deal) :-
    quest(the_trading_deal, _, _, _, active).

%% Quest: Congo Square Celebration
quest(congo_square_celebration, 'Congo Square Celebration', cultural, intermediate, active).
quest_assigned_to(congo_square_celebration, '{{player}}').
quest_language(congo_square_celebration, louisiana_creole).
quest_tag(congo_square_celebration, generated).
quest_objective(congo_square_celebration, 0, objective('Attend the Sunday gathering at Congo Square.')).
quest_objective(congo_square_celebration, 1, talk_to('mambo_celeste', 1)).
quest_objective(congo_square_celebration, 2, objective('Learn the names of musical instruments: tanbou, banjo, shakshak.')).
quest_objective(congo_square_celebration, 3, objective('Describe the music and dance in Creole using present tense.')).
quest_reward(congo_square_celebration, experience, 350).
quest_reward(congo_square_celebration, gold, 150).
quest_available(Player, congo_square_celebration) :-
    quest(congo_square_celebration, _, _, _, active).

%% Quest: Healing Herbs
quest(healing_herbs, 'Healing Herbs', exploration, intermediate, active).
quest_assigned_to(healing_herbs, '{{player}}').
quest_language(healing_herbs, louisiana_creole).
quest_tag(healing_herbs, generated).
quest_objective(healing_herbs, 0, talk_to('mambo_celeste', 1)).
quest_objective(healing_herbs, 1, objective('Learn the Creole names of ten medicinal plants.')).
quest_objective(healing_herbs, 2, objective('Gather herbs from the bayou following Creole instructions.')).
quest_objective(healing_herbs, 3, objective('Describe each herb and its uses in complete Creole sentences.')).
quest_reward(healing_herbs, experience, 350).
quest_reward(healing_herbs, gold, 175).
quest_available(Player, healing_herbs) :-
    quest(healing_herbs, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% B2 -- Upper Intermediate Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Freedom Papers
quest(freedom_papers, 'Freedom Papers', narrative, upper_intermediate, active).
quest_assigned_to(freedom_papers, '{{player}}').
quest_language(freedom_papers, louisiana_creole).
quest_tag(freedom_papers, generated).
quest_objective(freedom_papers, 0, talk_to('jean_pierre_toussaint', 1)).
quest_objective(freedom_papers, 1, objective('Understand the legal language of manumission documents in Creole and French.')).
quest_objective(freedom_papers, 2, objective('Help draft a petition using formal Creole constructions.')).
quest_objective(freedom_papers, 3, objective('Present the case to the colonial administrator using persuasive Creole.')).
quest_reward(freedom_papers, experience, 500).
quest_reward(freedom_papers, gold, 300).
quest_available(Player, freedom_papers) :-
    quest(freedom_papers, _, _, _, active).

%% Quest: Privateer Alliance
quest(privateer_alliance, 'Privateer Alliance', narrative, upper_intermediate, active).
quest_assigned_to(privateer_alliance, '{{player}}').
quest_language(privateer_alliance, louisiana_creole).
quest_tag(privateer_alliance, generated).
quest_objective(privateer_alliance, 0, talk_to('capitaine_lafitte', 1)).
quest_objective(privateer_alliance, 1, objective('Decode a letter written in mixed Creole and French naval terminology.')).
quest_objective(privateer_alliance, 2, objective('Negotiate terms of alliance using conditional Creole verb forms.')).
quest_objective(privateer_alliance, 3, objective('Report the outcome to Jacques Moreau using past-tense narration.')).
quest_reward(privateer_alliance, experience, 500).
quest_reward(privateer_alliance, gold, 350).
quest_available(Player, privateer_alliance) :-
    quest(privateer_alliance, _, _, _, active).

%% Quest: Tale of Compair Lapin
quest(tale_of_compair_lapin, 'Tale of Compair Lapin', cultural, upper_intermediate, active).
quest_assigned_to(tale_of_compair_lapin, '{{player}}').
quest_language(tale_of_compair_lapin, louisiana_creole).
quest_tag(tale_of_compair_lapin, generated).
quest_objective(tale_of_compair_lapin, 0, talk_to('tante_rose', 1)).
quest_objective(tale_of_compair_lapin, 1, objective('Listen to a full Compair Lapin folktale in Creole.')).
quest_objective(tale_of_compair_lapin, 2, objective('Retell the story in your own Creole words.')).
quest_objective(tale_of_compair_lapin, 3, objective('Explain the moral lesson using abstract Creole vocabulary.')).
quest_reward(tale_of_compair_lapin, experience, 500).
quest_reward(tale_of_compair_lapin, gold, 250).
quest_available(Player, tale_of_compair_lapin) :-
    quest(tale_of_compair_lapin, _, _, _, active).
