%% Insimul Quests: Japanese Town
%% Source: data/worlds/language/japanese/quests.pl
%% Created: 2026-04-03
%% Total: 16 quests (CEFR A1-B2)

%% ============================================================
%% A1 -- Beginner Quests
%% ============================================================

%% Quest: First Greetings at the Station
quest(first_greetings_jp, 'First Greetings', conversation, beginner, active).
quest_assigned_to(first_greetings_jp, '{{player}}').
quest_language(first_greetings_jp, japanese).
quest_tag(first_greetings_jp, generated).
quest_objective(first_greetings_jp, 0, talk_to('tanaka_kenji', 1)).
quest_objective(first_greetings_jp, 1, objective('Learn basic Japanese greetings: konnichiwa, ohayou gozaimasu, konbanwa.')).
quest_objective(first_greetings_jp, 2, talk_to('tanaka_haruko', 1)).
quest_reward(first_greetings_jp, experience, 100).
quest_reward(first_greetings_jp, gold, 50).
quest_available(Player, first_greetings_jp) :-
    quest(first_greetings_jp, _, _, _, active).

%% Quest: Konbini Shopping
quest(konbini_shopping, 'Konbini Shopping', vocabulary, beginner, active).
quest_assigned_to(konbini_shopping, '{{player}}').
quest_language(konbini_shopping, japanese).
quest_tag(konbini_shopping, generated).
quest_objective(konbini_shopping, 0, objective('Visit the FamilyMart near the station.')).
quest_objective(konbini_shopping, 1, objective('Learn the names of five items: onigiri, bentou, ocha, pan, okashi.')).
quest_objective(konbini_shopping, 2, objective('Buy an onigiri and say arigatou gozaimasu to the clerk.')).
quest_reward(konbini_shopping, experience, 100).
quest_reward(konbini_shopping, gold, 50).
quest_available(Player, konbini_shopping) :-
    quest(konbini_shopping, _, _, _, active).

%% Quest: Counting in Japanese
quest(counting_jp, 'Counting in Japanese', vocabulary, beginner, active).
quest_assigned_to(counting_jp, '{{player}}').
quest_language(counting_jp, japanese).
quest_tag(counting_jp, generated).
quest_objective(counting_jp, 0, objective('Learn Japanese numbers 1-10: ichi, ni, san, shi, go, roku, nana, hachi, kyuu, juu.')).
quest_objective(counting_jp, 1, objective('Count items at Yaoya Midori greengrocer with Yamamoto Misaki.')).
quest_objective(counting_jp, 2, objective('Use the correct counter word when buying three apples: ringo mittsu.')).
quest_reward(counting_jp, experience, 120).
quest_reward(counting_jp, gold, 60).
quest_available(Player, counting_jp) :-
    quest(counting_jp, _, _, _, active).

%% Quest: My Family
quest(my_family_jp, 'Watashi no Kazoku', conversation, beginner, active).
quest_assigned_to(my_family_jp, '{{player}}').
quest_language(my_family_jp, japanese).
quest_tag(my_family_jp, generated).
quest_objective(my_family_jp, 0, talk_to('tanaka_haruko', 1)).
quest_objective(my_family_jp, 1, objective('Learn family vocabulary: okaasan, otousan, ane, ani, imouto, otouto.')).
quest_objective(my_family_jp, 2, objective('Describe your own family in Japanese to Tanaka Haruko.')).
quest_reward(my_family_jp, experience, 100).
quest_reward(my_family_jp, gold, 50).
quest_available(Player, my_family_jp) :-
    quest(my_family_jp, _, _, _, active).

%% ============================================================
%% A2 -- Elementary Quests
%% ============================================================

%% Quest: Shotengai Scavenger Hunt
quest(shotengai_hunt, 'Shotengai Scavenger Hunt', exploration, beginner, active).
quest_assigned_to(shotengai_hunt, '{{player}}').
quest_language(shotengai_hunt, japanese).
quest_tag(shotengai_hunt, generated).
quest_objective(shotengai_hunt, 0, objective('Find the greengrocer and buy daikon (radish).')).
quest_objective(shotengai_hunt, 1, objective('Find the bookstore and ask for a manga recommendation in Japanese.')).
quest_objective(shotengai_hunt, 2, objective('Find the taiyaki stand and order one taiyaki.')).
quest_reward(shotengai_hunt, experience, 150).
quest_reward(shotengai_hunt, gold, 80).
quest_available(Player, shotengai_hunt) :-
    quest(shotengai_hunt, _, _, _, active).

%% Quest: Taking the Train
quest(taking_the_train, 'Taking the Train', grammar, beginner, active).
quest_assigned_to(taking_the_train, '{{player}}').
quest_language(taking_the_train, japanese).
quest_tag(taking_the_train, generated).
quest_objective(taking_the_train, 0, objective('Learn direction words: migi, hidari, massugu, eki.')).
quest_objective(taking_the_train, 1, objective('Ask three people for directions in Japanese using sumimasen.')).
quest_objective(taking_the_train, 2, objective('Buy a train ticket using Japanese at Sakuragawa Station.')).
quest_reward(taking_the_train, experience, 150).
quest_reward(taking_the_train, gold, 80).
quest_available(Player, taking_the_train) :-
    quest(taking_the_train, _, _, _, active).

%% Quest: Ordering Ramen
quest(ordering_ramen, 'Ordering Ramen', vocabulary, beginner, active).
quest_assigned_to(ordering_ramen, '{{player}}').
quest_language(ordering_ramen, japanese).
quest_tag(ordering_ramen, generated).
quest_objective(ordering_ramen, 0, objective('Visit Ramen Ichiban and read the menu in Japanese.')).
quest_objective(ordering_ramen, 1, objective('Learn 10 food words: ramen, gyouza, karaage, edamame, gohan, miso, shoyu, niku, tamago, nori.')).
quest_objective(ordering_ramen, 2, objective('Order a full meal in Japanese: ramen to gyouza o kudasai.')).
quest_reward(ordering_ramen, experience, 160).
quest_reward(ordering_ramen, gold, 80).
quest_available(Player, ordering_ramen) :-
    quest(ordering_ramen, _, _, _, active).

%% Quest: Sento Etiquette
quest(sento_etiquette, 'Sento Etiquette', cultural_knowledge, beginner, active).
quest_assigned_to(sento_etiquette, '{{player}}').
quest_language(sento_etiquette, japanese).
quest_tag(sento_etiquette, generated).
quest_objective(sento_etiquette, 0, talk_to('yamamoto_shigeru', 1)).
quest_objective(sento_etiquette, 1, objective('Learn the rules and vocabulary of the public bath: ofuro, tenugui, kakeyu.')).
quest_objective(sento_etiquette, 2, objective('Visit Matsu no Yu and follow proper bathing etiquette.')).
quest_reward(sento_etiquette, experience, 150).
quest_reward(sento_etiquette, gold, 75).
quest_available(Player, sento_etiquette) :-
    quest(sento_etiquette, _, _, _, active).

%% ============================================================
%% B1 -- Intermediate Quests
%% ============================================================

%% Quest: Izakaya Evening
quest(izakaya_evening, 'Izakaya Evening', conversation, intermediate, active).
quest_assigned_to(izakaya_evening, '{{player}}').
quest_language(izakaya_evening, japanese).
quest_tag(izakaya_evening, generated).
quest_objective(izakaya_evening, 0, talk_to('sato_hiroshi', 1)).
quest_objective(izakaya_evening, 1, objective('Learn izakaya ordering phrases: toriaezu biiru, kanpai, okaikei onegaishimasu.')).
quest_objective(izakaya_evening, 2, objective('Have a conversation about work and hobbies in Japanese at Izakaya Tanuki.')).
quest_objective(izakaya_evening, 3, talk_to('tanaka_kenji', 1)).
quest_reward(izakaya_evening, experience, 250).
quest_reward(izakaya_evening, gold, 120).
quest_available(Player, izakaya_evening) :-
    quest(izakaya_evening, _, _, _, active).

%% Quest: Temple Visit
quest(temple_visit, 'Temple Visit', cultural_knowledge, intermediate, active).
quest_assigned_to(temple_visit, '{{player}}').
quest_language(temple_visit, japanese).
quest_tag(temple_visit, generated).
quest_objective(temple_visit, 0, objective('Visit Komyoji Temple.')).
quest_objective(temple_visit, 1, objective('Learn about the difference between otera (temple) and jinja (shrine).')).
quest_objective(temple_visit, 2, talk_to('suzuki_takeshi', 1)).
quest_objective(temple_visit, 3, objective('Write your wish on an ema wooden tablet in Japanese.')).
quest_reward(temple_visit, experience, 250).
quest_reward(temple_visit, gold, 100).
quest_available(Player, temple_visit) :-
    quest(temple_visit, _, _, _, active).

%% Quest: Mountain Village Trip
quest(mountain_village, 'Mountain Village Trip', conversation, intermediate, active).
quest_assigned_to(mountain_village, '{{player}}').
quest_language(mountain_village, japanese).
quest_tag(mountain_village, generated).
quest_objective(mountain_village, 0, objective('Travel to Yamanoue village by train.')).
quest_objective(mountain_village, 1, talk_to('watanabe_isamu', 1)).
quest_objective(mountain_village, 2, objective('Help Watanabe Isamu describe rice farming using agricultural vocabulary.')).
quest_objective(mountain_village, 3, objective('Have a conversation about inaka (countryside) life with Watanabe Fumiko.')).
quest_reward(mountain_village, experience, 280).
quest_reward(mountain_village, gold, 130).
quest_available(Player, mountain_village) :-
    quest(mountain_village, _, _, _, active).

%% Quest: Keigo Challenge
quest(keigo_challenge, 'The Keigo Challenge', grammar, intermediate, active).
quest_assigned_to(keigo_challenge, '{{player}}').
quest_language(keigo_challenge, japanese).
quest_tag(keigo_challenge, generated).
quest_objective(keigo_challenge, 0, objective('Learn the difference between teineigo, sonkeigo, and kenjougo.')).
quest_objective(keigo_challenge, 1, objective('Practice polite speech at Sakuragawa Business Center with Sato Hiroshi.')).
quest_objective(keigo_challenge, 2, objective('Successfully use keigo in three different social situations.')).
quest_reward(keigo_challenge, experience, 250).
quest_reward(keigo_challenge, gold, 150).
quest_available(Player, keigo_challenge) :-
    quest(keigo_challenge, _, _, _, active).

%% ============================================================
%% B2 -- Upper Intermediate Quests
%% ============================================================

%% Quest: Soba Master
quest(soba_master, 'Soba Master', conversation, advanced, active).
quest_assigned_to(soba_master, '{{player}}').
quest_language(soba_master, japanese).
quest_tag(soba_master, generated).
quest_objective(soba_master, 0, objective('Visit Nakamura Tadao at Soba Dokoro Yama in Yamanoue.')).
quest_objective(soba_master, 1, talk_to('nakamura_tadao', 1)).
quest_objective(soba_master, 2, objective('Discuss the tradition of soba-making and shokunin (artisan) culture in Japanese.')).
quest_objective(soba_master, 3, objective('Write a short paragraph about a traditional craft in Japanese.')).
quest_reward(soba_master, experience, 400).
quest_reward(soba_master, gold, 200).
quest_available(Player, soba_master) :-
    quest(soba_master, _, _, _, active).

%% Quest: The Festival Committee
quest(festival_committee, 'The Festival Committee', grammar, advanced, active).
quest_assigned_to(festival_committee, '{{player}}').
quest_language(festival_committee, japanese).
quest_tag(festival_committee, generated).
quest_objective(festival_committee, 0, talk_to('suzuki_takeshi', 1)).
quest_objective(festival_committee, 1, objective('Learn to express opinions: watashi wa ... to omoimasu, sansei desu, chotto chigau to omoimasu.')).
quest_objective(festival_committee, 2, objective('Participate in a planning meeting for the summer matsuri festival.')).
quest_objective(festival_committee, 3, objective('Use conditional sentences (tara, ba, nara) in your proposals.')).
quest_reward(festival_committee, experience, 450).
quest_reward(festival_committee, gold, 200).
quest_available(Player, festival_committee) :-
    quest(festival_committee, _, _, _, active).

%% Quest: Writing for the Town Newsletter
quest(town_newsletter, 'Town Newsletter', cultural_knowledge, advanced, active).
quest_assigned_to(town_newsletter, '{{player}}').
quest_language(town_newsletter, japanese).
quest_tag(town_newsletter, generated).
quest_objective(town_newsletter, 0, objective('Interview three residents about a community topic.')).
quest_objective(town_newsletter, 1, objective('Take notes using a mix of hiragana, katakana, and basic kanji.')).
quest_objective(town_newsletter, 2, objective('Write a short article for the town newsletter in Japanese.')).
quest_objective(town_newsletter, 3, talk_to('sato_naomi', 1)).
quest_reward(town_newsletter, experience, 500).
quest_reward(town_newsletter, gold, 250).
quest_available(Player, town_newsletter) :-
    quest(town_newsletter, _, _, _, active).

%% Quest: Seasonal Poetry Walk
quest(seasonal_poetry, 'Seasonal Poetry Walk', exploration, advanced, active).
quest_assigned_to(seasonal_poetry, '{{player}}').
quest_language(seasonal_poetry, japanese).
quest_tag(seasonal_poetry, generated).
quest_objective(seasonal_poetry, 0, objective('Walk from the temple district to the river and observe the seasonal landscape.')).
quest_objective(seasonal_poetry, 1, objective('Have an extended conversation about the four seasons (shiki) and nature vocabulary.')).
quest_objective(seasonal_poetry, 2, objective('Compose a haiku in Japanese following the 5-7-5 syllable pattern.')).
quest_reward(seasonal_poetry, experience, 450).
quest_reward(seasonal_poetry, gold, 200).
quest_available(Player, seasonal_poetry) :-
    quest(seasonal_poetry, _, _, _, active).
