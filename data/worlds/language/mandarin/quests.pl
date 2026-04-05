%% Insimul Quests: Mandarin Watertown
%% Source: data/worlds/language/mandarin/quests.pl
%% Created: 2026-04-03
%% Total: 16 quests (CEFR A1-B2)

%% ===============================================================
%% A1 -- Beginner Quests
%% ===============================================================

%% Quest: First Greetings
quest(first_greetings_zh, 'First Greetings', conversation, beginner, active).
quest_assigned_to(first_greetings_zh, '{{player}}').
quest_language(first_greetings_zh, mandarin).
quest_tag(first_greetings_zh, generated).
quest_objective(first_greetings_zh, 0, talk_to('wang_guoqiang', 1)).
quest_objective(first_greetings_zh, 1, objective('Learn basic Mandarin greetings: ni hao, zaoshang hao, wan shang hao, zaijian.')).
quest_objective(first_greetings_zh, 2, talk_to('sun_fanghua', 1)).
quest_reward(first_greetings_zh, experience, 100).
quest_reward(first_greetings_zh, gold, 50).
quest_available(Player, first_greetings_zh) :-
    quest(first_greetings_zh, _, _, _, active).

%% Quest: Ordering Dumplings
quest(ordering_dumplings, 'Ordering Dumplings', vocabulary, beginner, active).
quest_assigned_to(ordering_dumplings, '{{player}}').
quest_language(ordering_dumplings, mandarin).
quest_tag(ordering_dumplings, generated).
quest_objective(ordering_dumplings, 0, objective('Visit Wang Ji Xiaolongbao dumpling shop.')).
quest_objective(ordering_dumplings, 1, objective('Learn dumpling vocabulary: jiaozi, xiaolongbao, huntun, baozi.')).
quest_objective(ordering_dumplings, 2, objective('Order a meal using Mandarin and pay with your phone.')).
quest_reward(ordering_dumplings, experience, 100).
quest_reward(ordering_dumplings, gold, 50).
quest_available(Player, ordering_dumplings) :-
    quest(ordering_dumplings, _, _, _, active).

%% Quest: Counting and Numbers
quest(counting_yuan, 'Counting Yuan', vocabulary, beginner, active).
quest_assigned_to(counting_yuan, '{{player}}').
quest_language(counting_yuan, mandarin).
quest_tag(counting_yuan, generated).
quest_objective(counting_yuan, 0, objective('Learn Mandarin numbers 1-100 with tones.')).
quest_objective(counting_yuan, 1, objective('Count items at the night market with a vendor.')).
quest_objective(counting_yuan, 2, objective('Use the correct measure word (ge, bei, kuai) when buying something.')).
quest_reward(counting_yuan, experience, 120).
quest_reward(counting_yuan, gold, 60).
quest_available(Player, counting_yuan) :-
    quest(counting_yuan, _, _, _, active).

%% Quest: My Family
quest(my_family_zh, 'Introducing Family', conversation, beginner, active).
quest_assigned_to(my_family_zh, '{{player}}').
quest_language(my_family_zh, mandarin).
quest_tag(my_family_zh, generated).
quest_objective(my_family_zh, 0, talk_to('sun_fanghua', 1)).
quest_objective(my_family_zh, 1, objective('Learn family vocabulary: baba, mama, gege, jiejie, didi, meimei, erzi, nver.')).
quest_objective(my_family_zh, 2, objective('Describe your own family in Mandarin to Sun Fanghua.')).
quest_reward(my_family_zh, experience, 100).
quest_reward(my_family_zh, gold, 50).
quest_available(Player, my_family_zh) :-
    quest(my_family_zh, _, _, _, active).

%% ===============================================================
%% A2 -- Elementary Quests
%% ===============================================================

%% Quest: Night Market Adventure
quest(night_market_adventure, 'Night Market Adventure', exploration, beginner, active).
quest_assigned_to(night_market_adventure, '{{player}}').
quest_language(night_market_adventure, mandarin).
quest_tag(night_market_adventure, generated).
quest_objective(night_market_adventure, 0, objective('Visit the Shuixiang Night Market.')).
quest_objective(night_market_adventure, 1, objective('Learn the names of five street foods in Mandarin.')).
quest_objective(night_market_adventure, 2, objective('Bargain for a souvenir using Mandarin phrases.')).
quest_reward(night_market_adventure, experience, 150).
quest_reward(night_market_adventure, gold, 80).
quest_available(Player, night_market_adventure) :-
    quest(night_market_adventure, _, _, _, active).

%% Quest: Tea Ceremony Basics
quest(tea_ceremony_basics, 'Tea Ceremony Basics', cultural_knowledge, beginner, active).
quest_assigned_to(tea_ceremony_basics, '{{player}}').
quest_language(tea_ceremony_basics, mandarin).
quest_tag(tea_ceremony_basics, generated).
quest_objective(tea_ceremony_basics, 0, talk_to('wang_guoqiang', 1)).
quest_objective(tea_ceremony_basics, 1, objective('Learn tea vocabulary: cha, longjing, gongfu cha, chahu, chabei.')).
quest_objective(tea_ceremony_basics, 2, objective('Participate in a gongfu tea session and describe each step in Mandarin.')).
quest_reward(tea_ceremony_basics, experience, 150).
quest_reward(tea_ceremony_basics, gold, 75).
quest_available(Player, tea_ceremony_basics) :-
    quest(tea_ceremony_basics, _, _, _, active).

%% Quest: Navigating by Canal
quest(navigating_canals, 'Navigating by Canal', grammar, beginner, active).
quest_assigned_to(navigating_canals, '{{player}}').
quest_language(navigating_canals, mandarin).
quest_tag(navigating_canals, generated).
quest_objective(navigating_canals, 0, objective('Learn direction words: zuo, you, qian, hou, zhi zou, guai.')).
quest_objective(navigating_canals, 1, objective('Ask three people for directions in Mandarin.')).
quest_objective(navigating_canals, 2, objective('Navigate from the Stone Bridge to the High-Speed Rail Station using only Mandarin directions.')).
quest_reward(navigating_canals, experience, 150).
quest_reward(navigating_canals, gold, 80).
quest_available(Player, navigating_canals) :-
    quest(navigating_canals, _, _, _, active).

%% Quest: QR Code Shopping
quest(qr_code_shopping, 'QR Code Shopping', vocabulary, beginner, active).
quest_assigned_to(qr_code_shopping, '{{player}}').
quest_language(qr_code_shopping, mandarin).
quest_tag(qr_code_shopping, generated).
quest_objective(qr_code_shopping, 0, objective('Visit Lianhua Supermarket and learn shopping phrases.')).
quest_objective(qr_code_shopping, 1, objective('Learn 10 common grocery items in Mandarin.')).
quest_objective(qr_code_shopping, 2, objective('Complete a purchase using WeChat Pay and describe the process in Mandarin.')).
quest_reward(qr_code_shopping, experience, 160).
quest_reward(qr_code_shopping, gold, 80).
quest_available(Player, qr_code_shopping) :-
    quest(qr_code_shopping, _, _, _, active).

%% ===============================================================
%% B1 -- Intermediate Quests
%% ===============================================================

%% Quest: Language School Enrollment
quest(language_school_tour, 'Language School Enrollment', exploration, intermediate, active).
quest_assigned_to(language_school_tour, '{{player}}').
quest_language(language_school_tour, mandarin).
quest_tag(language_school_tour, generated).
quest_objective(language_school_tour, 0, talk_to('li_jianguo', 1)).
quest_objective(language_school_tour, 1, objective('Tour the language school and learn academic vocabulary in Mandarin.')).
quest_objective(language_school_tour, 2, objective('Introduce yourself to three students using formal Mandarin.')).
quest_objective(language_school_tour, 3, talk_to('zhou_yumei', 1)).
quest_reward(language_school_tour, experience, 250).
quest_reward(language_school_tour, gold, 120).
quest_available(Player, language_school_tour) :-
    quest(language_school_tour, _, _, _, active).

%% Quest: The Art of Calligraphy
quest(calligraphy_lesson, 'The Art of Calligraphy', cultural_knowledge, intermediate, active).
quest_assigned_to(calligraphy_lesson, '{{player}}').
quest_language(calligraphy_lesson, mandarin).
quest_tag(calligraphy_lesson, generated).
quest_objective(calligraphy_lesson, 0, objective('Visit Moxiang Shufa Yuan calligraphy studio.')).
quest_objective(calligraphy_lesson, 1, objective('Learn about the Four Treasures of the Study: bi, mo, zhi, yan.')).
quest_objective(calligraphy_lesson, 2, objective('Write basic characters following correct stroke order and describe them in Mandarin.')).
quest_reward(calligraphy_lesson, experience, 250).
quest_reward(calligraphy_lesson, gold, 100).
quest_available(Player, calligraphy_lesson) :-
    quest(calligraphy_lesson, _, _, _, active).

%% Quest: Silk Road Stories
quest(silk_stories, 'Silk Road Stories', conversation, intermediate, active).
quest_assigned_to(silk_stories, '{{player}}').
quest_language(silk_stories, mandarin).
quest_tag(silk_stories, generated).
quest_objective(silk_stories, 0, objective('Visit the Jiangnan Silk Boutique.')).
quest_objective(silk_stories, 1, talk_to('zhang_wenhua', 1)).
quest_objective(silk_stories, 2, objective('Learn vocabulary about silk production: cansi, zhisi, sichou, cixiu.')).
quest_objective(silk_stories, 3, objective('Discuss the history of Jiangnan silk trade with Zhang Wenhua in Mandarin.')).
quest_reward(silk_stories, experience, 280).
quest_reward(silk_stories, gold, 130).
quest_available(Player, silk_stories) :-
    quest(silk_stories, _, _, _, active).

%% Quest: Bargaining at the Antique Shop
quest(antique_bargaining, 'Bargaining at the Antique Shop', grammar, intermediate, active).
quest_assigned_to(antique_bargaining, '{{player}}').
quest_language(antique_bargaining, mandarin).
quest_tag(antique_bargaining, generated).
quest_objective(antique_bargaining, 0, objective('Learn comparative phrases: bi, geng, zui, yidianr.')).
quest_objective(antique_bargaining, 1, objective('Visit Guwan Shangdian and examine the antiques.')).
quest_objective(antique_bargaining, 2, objective('Successfully negotiate a price using Mandarin politely.')).
quest_reward(antique_bargaining, experience, 250).
quest_reward(antique_bargaining, gold, 150).
quest_available(Player, antique_bargaining) :-
    quest(antique_bargaining, _, _, _, active).

%% ===============================================================
%% B2 -- Upper Intermediate Quests
%% ===============================================================

%% Quest: Village Tofu Making
quest(tofu_tradition, 'Village Tofu Making', conversation, advanced, active).
quest_assigned_to(tofu_tradition, '{{player}}').
quest_language(tofu_tradition, mandarin).
quest_tag(tofu_tradition, generated).
quest_objective(tofu_tradition, 0, objective('Travel to Hehua Cun village.')).
quest_objective(tofu_tradition, 1, talk_to('zhao_zhonghe', 1)).
quest_objective(tofu_tradition, 2, objective('Learn the tofu-making process vocabulary and describe each step in Mandarin.')).
quest_objective(tofu_tradition, 3, objective('Write a short paragraph about traditional food crafts in Mandarin.')).
quest_reward(tofu_tradition, experience, 400).
quest_reward(tofu_tradition, gold, 200).
quest_available(Player, tofu_tradition) :-
    quest(tofu_tradition, _, _, _, active).

%% Quest: The Debate
quest(the_debate_zh, 'The Debate', grammar, advanced, active).
quest_assigned_to(the_debate_zh, '{{player}}').
quest_language(the_debate_zh, mandarin).
quest_tag(the_debate_zh, generated).
quest_objective(the_debate_zh, 0, talk_to('li_jianguo', 1)).
quest_objective(the_debate_zh, 1, objective('Learn to express opinions: wo juede, wo renwei, wo bu tongyi.')).
quest_objective(the_debate_zh, 2, objective('Participate in a discussion about modern vs traditional life at the language school.')).
quest_objective(the_debate_zh, 3, objective('Use conditional sentences (ruguo...jiu) in your arguments.')).
quest_reward(the_debate_zh, experience, 450).
quest_reward(the_debate_zh, gold, 200).
quest_available(Player, the_debate_zh) :-
    quest(the_debate_zh, _, _, _, active).

%% Quest: High-Speed Rail Journey
quest(hsr_journey, 'High-Speed Rail Journey', exploration, advanced, active).
quest_assigned_to(hsr_journey, '{{player}}').
quest_language(hsr_journey, mandarin).
quest_tag(hsr_journey, generated).
quest_objective(hsr_journey, 0, objective('Buy a high-speed rail ticket using only Mandarin.')).
quest_objective(hsr_journey, 1, objective('Have a conversation with a fellow passenger about travel in China.')).
quest_objective(hsr_journey, 2, objective('Narrate a short story about the water town to a stranger in Mandarin.')).
quest_reward(hsr_journey, experience, 450).
quest_reward(hsr_journey, gold, 200).
quest_available(Player, hsr_journey) :-
    quest(hsr_journey, _, _, _, active).

%% Quest: Scholar Garden Poetry
quest(garden_poetry, 'Scholar Garden Poetry', cultural_knowledge, advanced, active).
quest_assigned_to(garden_poetry, '{{player}}').
quest_language(garden_poetry, mandarin).
quest_tag(garden_poetry, generated).
quest_objective(garden_poetry, 0, objective('Visit the Harmony Garden and learn about its design philosophy.')).
quest_objective(garden_poetry, 1, objective('Memorize and recite a Tang dynasty poem in Mandarin.')).
quest_objective(garden_poetry, 2, objective('Write a short essay in Mandarin about the relationship between nature and Chinese culture.')).
quest_objective(garden_poetry, 3, talk_to('li_jianguo', 1)).
quest_reward(garden_poetry, experience, 500).
quest_reward(garden_poetry, gold, 250).
quest_available(Player, garden_poetry) :-
    quest(garden_poetry, _, _, _, active).
