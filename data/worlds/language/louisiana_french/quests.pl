%% Insimul Quests: French Louisiana (Merged)
%% Sources: quests.json, seed-quests.json, guild-quests.json,
%%          quest-chains.json, narrative-template.json, quests_2.pl
%% Converted: 2026-04-03T07:15:03Z

%% ═══════════════════════════════════════════════════════════
%% Original World Quests (quests.json)
%% ═══════════════════════════════════════════════════════════

% Quest: The Bourbon Street Blues
% Your friend, a jazz musician named Leo, has had his prized trumpet stolen just days before the annual Jazz Fest competition. He was last seen arguing with a rival musician from the “”Gatorsnouts“” band. Find the trumpet so Leo can compete and win the prize money he needs to save his family’s club.
% Type: main / Difficulty: beginner

quest(the_bourbon_street_blues, 'The Bourbon Street Blues', main, beginner, active).
quest_assigned_to(the_bourbon_street_blues, '{{player}}').
quest_language(the_bourbon_street_blues, french).
quest_tag(the_bourbon_street_blues, generated).
quest_tag(the_bourbon_street_blues, ai).

quest_objective(the_bourbon_street_blues, 0, talk_to('leo_the_musician', 1)).
quest_objective(the_bourbon_street_blues, 1, objective('Search the alley behind The Blue Note for clues.')).
quest_objective(the_bourbon_street_blues, 2, talk_to('gatorsnout_leader', 1)).



quest_reward(the_bourbon_street_blues, experience, 150).
quest_reward(the_bourbon_street_blues, gold, 100).

% Can Player take this quest?
quest_available(Player, the_bourbon_street_blues) :-
    quest(the_bourbon_street_blues, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Gumbo for a Ghost
%% ═══════════════════════════════════════════════════════════

% Quest: Gumbo for a Ghost
% An old woman in the Garden District, Madame Evangeline, claims the ghost of her late husband won’t rest until he has one last taste of her famous seafood gumbo. The problem is, the key ingredient, a rare “”Moonlight Crawfish“”, only appears in a haunted part of the bayou at night. She needs you to gather the ingredients she can no longer get herself.
% Type: side / Difficulty: intermediate

quest(gumbo_for_a_ghost, 'Gumbo for a Ghost', side, intermediate, active).
quest_assigned_to(gumbo_for_a_ghost, '{{player}}').
quest_language(gumbo_for_a_ghost, french).
quest_tag(gumbo_for_a_ghost, generated).
quest_tag(gumbo_for_a_ghost, ai).

quest_objective(gumbo_for_a_ghost, 0, collect(moonlight_crawfish, 1)).
quest_objective(gumbo_for_a_ghost, 1, collect(sorciers_thyme, 1)).
quest_objective(gumbo_for_a_ghost, 2, talk_to('madame_evangeline', 1)).



quest_reward(gumbo_for_a_ghost, experience, 250).
quest_reward(gumbo_for_a_ghost, gold, 200).

% Can Player take this quest?
quest_available(Player, gumbo_for_a_ghost) :-
    quest(gumbo_for_a_ghost, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Blood on the Bayou
%% ═══════════════════════════════════════════════════════════

% Quest: Blood on the Bayou
% Isabelle, a local environmental activist and a close friend, has gone missing. She was investigating the powerful Boudreaux Petrochemical company’s illegal dumping activities deep in the Atchafalaya Basin. Her last message to you was a set of coordinates and a warning to be careful. Find out what happened to her and expose the truth.
% Type: character / Difficulty: advanced

quest(blood_on_the_bayou, 'Blood on the Bayou', character, advanced, active).
quest_assigned_to(blood_on_the_bayou, '{{player}}').
quest_language(blood_on_the_bayou, french).
quest_tag(blood_on_the_bayou, generated).
quest_tag(blood_on_the_bayou, ai).

quest_objective(blood_on_the_bayou, 0, objective('Find Isabelle''s hidden research camp in the swamp.')).
quest_objective(blood_on_the_bayou, 1, objective('Search the camp for her research notes on Boudreaux Petrochemical.')).
quest_objective(blood_on_the_bayou, 2, defeat('boudreaux_security', 4)).



quest_reward(blood_on_the_bayou, experience, 800).
quest_reward(blood_on_the_bayou, gold, 500).

% Can Player take this quest?
quest_available(Player, blood_on_the_bayou) :-
    quest(blood_on_the_bayou, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% The Creole Connection
%% ═══════════════════════════════════════════════════════════

% Quest: The Creole Connection
% The evidence recovered from Boudreaux Petrochemical points to a powerful figure in the city government, Councilman Thibodeaux. To expose him, you need to obtain the unedited minutes from a secret city council meeting. Your contact, a journalist named Simon, has a plan to get you into the city archives, but it won’t be easy.
% Type: main / Difficulty: intermediate

quest(the_creole_connection, 'The Creole Connection', main, intermediate, active).
quest_assigned_to(the_creole_connection, '{{player}}').
quest_language(the_creole_connection, french).
quest_tag(the_creole_connection, generated).
quest_tag(the_creole_connection, ai).

quest_objective(the_creole_connection, 0, talk_to('simon_the_journalist', 1)).
quest_objective(the_creole_connection, 1, objective('Infiltrate the New Orleans City Archives.')).
quest_objective(the_creole_connection, 2, collect(secret_ledger, 1)).



quest_reward(the_creole_connection, experience, 500).
quest_reward(the_creole_connection, gold, 350).

% Can Player take this quest?
quest_available(Player, the_creole_connection) :-
    quest(the_creole_connection, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% A Traiteur’s Plea
%% ═══════════════════════════════════════════════════════════

% Quest: A Traiteur’s Plea
% A Cajun folk healer, a “”traiteur“” named Remi, needs your help. His mentor is gravely ill from a mysterious swamp fever. The only cure requires the pollen of the “”Fleur de Feu“”, a flower that blooms for only one hour at dawn at the heart of a dangerous, fog-shrouded island. You must escort Remi and protect him from the island’s unnatural predators while he gathers the pollen.
% Type: side / Difficulty: advanced

quest(a_traiteur_s_plea, 'A Traiteur''s Plea', side, advanced, active).
quest_assigned_to(a_traiteur_s_plea, '{{player}}').
quest_language(a_traiteur_s_plea, french).
quest_tag(a_traiteur_s_plea, generated).
quest_tag(a_traiteur_s_plea, ai).

quest_objective(a_traiteur_s_plea, 0, escort('remi_the_traiteur', '{{destination}}')).
quest_objective(a_traiteur_s_plea, 1, defeat('swamp_predators', 6)).
quest_objective(a_traiteur_s_plea, 2, escort('remi_the_traiteur', '{{destination}}')).



quest_reward(a_traiteur_s_plea, experience, 750).
quest_reward(a_traiteur_s_plea, gold, 400).

% Can Player take this quest?
quest_available(Player, a_traiteur_s_plea) :-
    quest(a_traiteur_s_plea, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Legacy of the Rougarou
%% ═══════════════════════════════════════════════════════════

% Quest: Legacy of the Rougarou
% Your companion, Jacques, has been acting strangely. He confesses that his family is cursed, and he fears he is turning into a Rougarou, a local werewolf legend. He believes a Voodoo Priestess in the French Quarter holds the key to controlling his curse. He needs your help to face her and find an answer, for better or worse.
% Type: character / Difficulty: expert

quest(legacy_of_the_rougarou, 'Legacy of the Rougarou', character, expert, active).
quest_assigned_to(legacy_of_the_rougarou, '{{player}}').
quest_language(legacy_of_the_rougarou, french).
quest_tag(legacy_of_the_rougarou, generated).
quest_tag(legacy_of_the_rougarou, ai).

quest_objective(legacy_of_the_rougarou, 0, objective('Find the Voodoo Priestess''s shop in the French Quarter.')).
quest_objective(legacy_of_the_rougarou, 1, talk_to('mambo_marie', 1)).
quest_objective(legacy_of_the_rougarou, 2, defeat('spirit_guardians', 3)).



quest_reward(legacy_of_the_rougarou, experience, 1200).
quest_reward(legacy_of_the_rougarou, gold, 700).

% Can Player take this quest?
quest_available(Player, legacy_of_the_rougarou) :-
    quest(legacy_of_the_rougarou, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Hurricane Warning
%% ═══════════════════════════════════════════════════════════

% Quest: Hurricane Warning
% With Councilman Thibodeaux’s corruption exposed, he’s become desperate. A Category 4 hurricane is bearing down on the city, and he plans to use the chaos of the evacuation to destroy all remaining evidence and eliminate you. You must get to the city data hub and secure the evidence before the storm makes landfall.
% Type: main / Difficulty: expert

quest(hurricane_warning, 'Hurricane Warning', main, expert, active).
quest_assigned_to(hurricane_warning, '{{player}}').
quest_language(hurricane_warning, french).
quest_tag(hurricane_warning, generated).
quest_tag(hurricane_warning, ai).

quest_objective(hurricane_warning, 0, objective('Navigate the evacuating city to reach the data hub.')).
quest_objective(hurricane_warning, 1, defeat('thibodeaux_mercs', 5)).
quest_objective(hurricane_warning, 2, collect(server_mainframe, 1)).



quest_reward(hurricane_warning, experience, 1500).
quest_reward(hurricane_warning, gold, 1000).

% Can Player take this quest?
quest_available(Player, hurricane_warning) :-
    quest(hurricane_warning, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Fais Do-Do Delivery
%% ═══════════════════════════════════════════════════════════

% Quest: Fais Do-Do Delivery
% A small, isolated community in the bayou is preparing for their “”fais do-do“” (a Cajun dance party), but their supply boat has broken down. They need someone to pick up essentials from the city: boudin sausage, a new accordion reed, and fireworks. The journey is long and the swamp paths can be treacherous.
% Type: side / Difficulty: beginner

quest(fais_do_do_delivery, 'Fais Do-Do Delivery', side, beginner, active).
quest_assigned_to(fais_do_do_delivery, '{{player}}').
quest_language(fais_do_do_delivery, french).
quest_tag(fais_do_do_delivery, generated).
quest_tag(fais_do_do_delivery, ai).

quest_objective(fais_do_do_delivery, 0, collect(boudin_sausage, 1)).
quest_objective(fais_do_do_delivery, 1, collect(accordion_reed, 1)).
quest_objective(fais_do_do_delivery, 2, talk_to('tante_helene', 1)).



quest_reward(fais_do_do_delivery, experience, 100).
quest_reward(fais_do_do_delivery, gold, 75).

% Can Player take this quest?
quest_available(Player, fais_do_do_delivery) :-
    quest(fais_do_do_delivery, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Exported Game Quests (quests_2.pl, 116 entries)
%% ═══════════════════════════════════════════════════════════

% Quest: Arrival Assessment
% Complete your language assessment upon arriving in the settlement. This establishes your baseline proficiency and introduces you to the town.
% Type: assessment / Difficulty: beginner

quest(arrival_assessment, 'Arrival Assessment', assessment, beginner, active).
quest_assigned_to(arrival_assessment, '{{player}}').
quest_language(arrival_assessment, french).
quest_chain_order(arrival_assessment, 0).
quest_tag(arrival_assessment, assessment).
quest_tag(arrival_assessment, arrival).
quest_tag(arrival_assessment, main_quest).
quest_tag(arrival_assessment, narrative).

quest_objective(arrival_assessment, 0, objective('Complete the arrival language assessment')).

quest_completion(arrival_assessment, criteria('Complete all arrival assessment phases')).


quest_reward(arrival_assessment, experience, 50).

% Can Player take this quest?
quest_available(Player, arrival_assessment) :-
    quest(arrival_assessment, _, _, _, active).

% Check if quest is complete for Player
quest_complete(Player, arrival_assessment) :-
    quest_progress(Player, arrival_assessment, Progress), Progress >= 100.

% Quest: The Notice Board
% A weathered notice on the town board catches your eye — someone is missing. Read the notice, then visit the town clerk to learn more about the missing writer.
% Type: exploration / Difficulty: beginner

quest(the_notice_board, 'The Notice Board', exploration, beginner, pending).
quest_assigned_to(the_notice_board, '{{player}}').
quest_language(the_notice_board, french).
quest_chain_order(the_notice_board, 1).
quest_tag(the_notice_board, reading).
quest_tag(the_notice_board, conversation).
quest_tag(the_notice_board, main_quest).
quest_tag(the_notice_board, narrative).

quest_objective(the_notice_board, 0, objective('Read the missing person notice on the town board')).
quest_objective(the_notice_board, 1, talk_to('{{role:clerk}}', 1)).
quest_objective(the_notice_board, 2, objective('Learn the writer''s name')).

quest_completion(the_notice_board, criteria('Read the notice and speak with the clerk')).


quest_reward(the_notice_board, experience, 75).

% Can Player take this quest?
quest_available(Player, the_notice_board) :-
    quest(the_notice_board, _, _, _, active).

% Check if quest is complete for Player
quest_complete(Player, the_notice_board) :-
    quest_progress(Player, the_notice_board, Progress), Progress >= 100.

% Quest: The Writer’s Home
% Visit the missing writer’s residence on the edge of town. Search the house for their journal and read the first clue about where they may have gone.
% Type: exploration / Difficulty: beginner

quest(the_writer_s_home, 'The Writer''s Home', exploration, beginner, pending).
quest_assigned_to(the_writer_s_home, '{{player}}').
quest_language(the_writer_s_home, french).
quest_chain_order(the_writer_s_home, 2).
quest_tag(the_writer_s_home, exploration).
quest_tag(the_writer_s_home, item_collection).
quest_tag(the_writer_s_home, reading).
quest_tag(the_writer_s_home, main_quest).
quest_tag(the_writer_s_home, narrative).

quest_objective(the_writer_s_home, 0, visit_location('writer_home')).
quest_objective(the_writer_s_home, 1, collect(writer_journal, 1)).
quest_objective(the_writer_s_home, 2, objective('Read the first journal entry for a clue')).

quest_completion(the_writer_s_home, criteria('Find and read the writer''s journal')).


quest_reward(the_writer_s_home, experience, 100).

% Can Player take this quest?
quest_available(Player, the_writer_s_home) :-
    quest(the_writer_s_home, _, _, _, active).

% Check if quest is complete for Player
quest_complete(Player, the_writer_s_home) :-
    quest_progress(Player, the_writer_s_home, Progress), Progress >= 100.

% Quest: Following the Trail
% The journal mentions three people who knew the writer well. Seek them out and hear their testimonies to piece together what happened.
% Type: conversation / Difficulty: intermediate

quest(following_the_trail, 'Following the Trail', conversation, intermediate, pending).
quest_assigned_to(following_the_trail, '{{player}}').
quest_language(following_the_trail, french).
quest_chain_order(following_the_trail, 3).
quest_tag(following_the_trail, conversation).
quest_tag(following_the_trail, social).
quest_tag(following_the_trail, main_quest).
quest_tag(following_the_trail, narrative).

quest_objective(following_the_trail, 0, talk_to('witness_neighbor', 1)).
quest_objective(following_the_trail, 1, talk_to('witness_colleague', 1)).
quest_objective(following_the_trail, 2, talk_to('witness_friend', 1)).
quest_objective(following_the_trail, 3, objective('Collect 3 witness testimonies')).

quest_completion(following_the_trail, criteria('Gather all three witness testimonies')).


quest_reward(following_the_trail, experience, 150).

% Can Player take this quest?
quest_available(Player, following_the_trail) :-
    quest(following_the_trail, _, _, _, active).

% Check if quest is complete for Player
quest_complete(Player, following_the_trail) :-
    quest_progress(Player, following_the_trail, Progress), Progress >= 100.

% Quest: The Hidden Writings
% The witnesses mention books the writer left around town. Find three of the writer’s books scattered across the settlement and read them for embedded clues.
% Type: collection / Difficulty: intermediate

quest(the_hidden_writings, 'The Hidden Writings', collection, intermediate, pending).
quest_assigned_to(the_hidden_writings, '{{player}}').
quest_language(the_hidden_writings, french).
quest_chain_order(the_hidden_writings, 4).
quest_tag(the_hidden_writings, item_collection).
quest_tag(the_hidden_writings, reading).
quest_tag(the_hidden_writings, exploration).
quest_tag(the_hidden_writings, main_quest).
quest_tag(the_hidden_writings, narrative).

quest_objective(the_hidden_writings, 0, collect(writer_book_1, 1)).
quest_objective(the_hidden_writings, 1, collect(writer_book_2, 1)).
quest_objective(the_hidden_writings, 2, collect(writer_book_3, 1)).
quest_objective(the_hidden_writings, 3, objective('Read all three books for hidden clues')).

quest_completion(the_hidden_writings, criteria('Find and read all three of the writer''s books')).


quest_reward(the_hidden_writings, experience, 150).

% Can Player take this quest?
quest_available(Player, the_hidden_writings) :-
    quest(the_hidden_writings, _, _, _, active).

% Check if quest is complete for Player
quest_complete(Player, the_hidden_writings) :-
    quest_progress(Player, the_hidden_writings, Progress), Progress >= 100.

% Quest: The Secret Location
% The clues from the books point to a hidden spot the writer loved. Follow the trail to discover the writer’s secret retreat and investigate the scene.
% Type: exploration / Difficulty: intermediate

quest(the_secret_location, 'The Secret Location', exploration, intermediate, pending).
quest_assigned_to(the_secret_location, '{{player}}').
quest_language(the_secret_location, french).
quest_chain_order(the_secret_location, 5).
quest_tag(the_secret_location, exploration).
quest_tag(the_secret_location, photography).
quest_tag(the_secret_location, reading).
quest_tag(the_secret_location, main_quest).
quest_tag(the_secret_location, narrative).

quest_objective(the_secret_location, 0, visit_location('secret_location')).
quest_objective(the_secret_location, 1, objective('Photograph the scene at the secret location')).
quest_objective(the_secret_location, 2, collect(final_manuscript, 1)).
quest_objective(the_secret_location, 3, objective('Read the final manuscript')).

quest_completion(the_secret_location, criteria('Investigate the secret location thoroughly')).


quest_reward(the_secret_location, experience, 175).

% Can Player take this quest?
quest_available(Player, the_secret_location) :-
    quest(the_secret_location, _, _, _, active).

% Check if quest is complete for Player
quest_complete(Player, the_secret_location) :-
    quest_progress(Player, the_secret_location, Progress), Progress >= 100.

% Quest: The Final Chapter
% You now know the truth. Confront the reality of the writer’s disappearance through a conversation challenge — explain what you’ve discovered to the town, using everything you’ve learned.
% Type: conversation / Difficulty: advanced

quest(the_final_chapter, 'The Final Chapter', conversation, advanced, pending).
quest_assigned_to(the_final_chapter, '{{player}}').
quest_language(the_final_chapter, french).
quest_chain_order(the_final_chapter, 6).
quest_tag(the_final_chapter, conversation).
quest_tag(the_final_chapter, vocabulary).
quest_tag(the_final_chapter, main_quest).
quest_tag(the_final_chapter, narrative).
quest_tag(the_final_chapter, climax).

quest_objective(the_final_chapter, 0, conversation_turns(5)).
quest_objective(the_final_chapter, 1, learn_words_count(1)).
quest_objective(the_final_chapter, 2, conversation_turns(5)).

quest_completion(the_final_chapter, conversation_turns(8)).


quest_reward(the_final_chapter, experience, 200).

% Can Player take this quest?
quest_available(Player, the_final_chapter) :-
    quest(the_final_chapter, _, _, _, active).

% Check if quest is complete for Player
quest_complete(Player, the_final_chapter) :-
    quest_progress(Player, the_final_chapter, Turns), Turns >= 8.

% Quest: Departure Assessment
% Your time in the settlement draws to a close. Complete your final language assessment to measure how far you’ve come since your arrival.
% Type: assessment / Difficulty: intermediate

quest(departure_assessment, 'Departure Assessment', assessment, intermediate, pending).
quest_assigned_to(departure_assessment, '{{player}}').
quest_language(departure_assessment, french).
quest_chain_order(departure_assessment, 7).
quest_tag(departure_assessment, assessment).
quest_tag(departure_assessment, departure).
quest_tag(departure_assessment, main_quest).
quest_tag(departure_assessment, narrative).

quest_objective(departure_assessment, 0, objective('Complete the departure language assessment')).

quest_completion(departure_assessment, criteria('Complete all departure assessment phases')).


quest_reward(departure_assessment, experience, 500).

% Can Player take this quest?
quest_available(Player, departure_assessment) :-
    quest(departure_assessment, _, _, _, active).

% Check if quest is complete for Player
quest_complete(Player, departure_assessment) :-
    quest_progress(Player, departure_assessment, Progress), Progress >= 100.

% Quest: Chapter 1: Assignment Abroad
% The ferry docks in an unfamiliar harbor. Your editor back home wired ahead — the celebrated writer {WRITER} vanished three weeks ago, and the local press has gone quiet. You clutch the thin dossier in your coat pocket. It is not much to go on, but it is a start.
% Type: main_quest / Difficulty: beginner

quest(chapter_1_assignment_abroad, 'Chapter 1: Assignment Abroad', main_quest, beginner, active).
quest_assigned_to(chapter_1_assignment_abroad, '{{player}}').
quest_language(chapter_1_assignment_abroad, french).
quest_tag(chapter_1_assignment_abroad, main_quest).
quest_tag(chapter_1_assignment_abroad, chapter_1).
quest_tag(chapter_1_assignment_abroad, chapterid_ch1_assignment_abroad).

quest_objective(chapter_1_assignment_abroad, 0, objective('Learn basic greetings to introduce yourself to the locals.')).
quest_objective(chapter_1_assignment_abroad, 1, talk_to('{{npc}}')).
quest_objective(chapter_1_assignment_abroad, 2, objective('Collect signs and notices around town to start building your reading skills.')).



quest_reward(chapter_1_assignment_abroad, experience, 300).
quest_reward(chapter_1_assignment_abroad, gold, 50).
quest_reward(chapter_1_assignment_abroad, xp, 300).

% Can Player take this quest?
quest_available(Player, chapter_1_assignment_abroad) :-
    quest(chapter_1_assignment_abroad, _, _, _, active).

% Quest: Chapter 2: Following the Trail
% The editor hands you a faded photograph of {WRITER} — sharp eyes, ink-stained fingers, a half-smile. “”This was taken at the Café du Pont, two days before the disappearance. Start there.“” You fold the photo carefully and step into the rain-washed streets.
% Type: main_quest / Difficulty: beginner

quest(chapter_2_following_the_trail, 'Chapter 2: Following the Trail', main_quest, beginner, active).
quest_assigned_to(chapter_2_following_the_trail, '{{player}}').
quest_language(chapter_2_following_the_trail, french).
quest_tag(chapter_2_following_the_trail, main_quest).
quest_tag(chapter_2_following_the_trail, chapter_2).
quest_tag(chapter_2_following_the_trail, chapterid_ch2_following_the_trail).

quest_objective(chapter_2_following_the_trail, 0, objective('Explore key locations in town — the café, the bookshop, the park where the writer used to sit.')).
quest_objective(chapter_2_following_the_trail, 1, talk_to('{{npc}}')).
quest_objective(chapter_2_following_the_trail, 2, talk_to('{{npc}}')).
quest_objective(chapter_2_following_the_trail, 3, objective('Read signs and notices around town to build your vocabulary.')).
quest_objective(chapter_2_following_the_trail, 4, objective('Complete grammar exercises to communicate more clearly.')).
quest_objective(chapter_2_following_the_trail, 5, objective('Collect books and letters from around town to practice reading.')).



quest_reward(chapter_2_following_the_trail, experience, 500).
quest_reward(chapter_2_following_the_trail, gold, 100).
quest_reward(chapter_2_following_the_trail, xp, 500).

% Can Player take this quest?
quest_available(Player, chapter_2_following_the_trail) :-
    quest(chapter_2_following_the_trail, _, _, _, active).

% Quest: Chapter 3: The Inner Circle
% Your notebook is filling up. The writer’s editor reluctantly agreed to a meeting. The neighbor peers through curtains whenever you pass. And the patron — rumored to be the writer’s biggest supporter — has declined two invitations. But you are patient. You are a reporter, and the truth is always there for those who ask the right questions in the right language.
% Type: main_quest / Difficulty: intermediate

quest(chapter_3_the_inner_circle, 'Chapter 3: The Inner Circle', main_quest, intermediate, active).
quest_assigned_to(chapter_3_the_inner_circle, '{{player}}').
quest_language(chapter_3_the_inner_circle, french).
quest_tag(chapter_3_the_inner_circle, main_quest).
quest_tag(chapter_3_the_inner_circle, chapter_3).
quest_tag(chapter_3_the_inner_circle, chapterid_ch3_the_inner_circle).

quest_objective(chapter_3_the_inner_circle, 0, talk_to('{{npc}}')).
quest_objective(chapter_3_the_inner_circle, 1, talk_to('{{npc}}')).
quest_objective(chapter_3_the_inner_circle, 2, talk_to('{{npc}}')).
quest_objective(chapter_3_the_inner_circle, 3, objective('Collect letters and journal pages the writer left behind.')).
quest_objective(chapter_3_the_inner_circle, 4, objective('Learn new words to understand the more complex conversations you are having.')).
quest_objective(chapter_3_the_inner_circle, 5, objective('Collect journals and letters that reveal the stories of the people around you.')).



quest_reward(chapter_3_the_inner_circle, experience, 750).
quest_reward(chapter_3_the_inner_circle, gold, 150).
quest_reward(chapter_3_the_inner_circle, xp, 750).

% Can Player take this quest?
quest_available(Player, chapter_3_the_inner_circle) :-
    quest(chapter_3_the_inner_circle, _, _, _, active).

% Quest: Chapter 4: Hidden Messages
% You sit at the writer’s favorite café table, books spread before you. A passage leaps off the page: “”The lighthouse keeper knows what the tide brought in.“” But there is no lighthouse in this town. You check the map — there is one, twenty kilometers east, on a rocky stretch of coast. The trail leads outward.
% Type: main_quest / Difficulty: intermediate

quest(chapter_4_hidden_messages, 'Chapter 4: Hidden Messages', main_quest, intermediate, active).
quest_assigned_to(chapter_4_hidden_messages, '{{player}}').
quest_language(chapter_4_hidden_messages, french).
quest_tag(chapter_4_hidden_messages, main_quest).
quest_tag(chapter_4_hidden_messages, chapter_4).
quest_tag(chapter_4_hidden_messages, chapterid_ch4_hidden_messages).

quest_objective(chapter_4_hidden_messages, 0, objective('Read the writer''s books carefully and identify the hidden references.')).
quest_objective(chapter_4_hidden_messages, 1, talk_to('{{npc}}')).
quest_objective(chapter_4_hidden_messages, 2, talk_to('{{npc}}')).
quest_objective(chapter_4_hidden_messages, 3, objective('Translate difficult passages from the writer''s coded notes.')).
quest_objective(chapter_4_hidden_messages, 4, objective('Collect texts from new settlements to broaden your understanding of the region.')).



quest_reward(chapter_4_hidden_messages, experience, 1000).
quest_reward(chapter_4_hidden_messages, gold, 250).
quest_reward(chapter_4_hidden_messages, xp, 1000).

% Can Player take this quest?
quest_available(Player, chapter_4_hidden_messages) :-
    quest(chapter_4_hidden_messages, _, _, _, active).

% Quest: Chapter 5: The Truth Emerges
% Your desk at the boarding house is covered in notes, photographs, and pages torn from books. Red thread connects the pins on your map. The patron, the scholars, the secret meetings — it all points to one conclusion: {WRITER} was not taken. They chose to disappear. But why? And where did they go? The confidant — the writer’s oldest friend — may be the only one who knows.
% Type: main_quest / Difficulty: advanced

quest(chapter_5_the_truth_emerges, 'Chapter 5: The Truth Emerges', main_quest, advanced, active).
quest_assigned_to(chapter_5_the_truth_emerges, '{{player}}').
quest_language(chapter_5_the_truth_emerges, french).
quest_tag(chapter_5_the_truth_emerges, main_quest).
quest_tag(chapter_5_the_truth_emerges, chapter_5).
quest_tag(chapter_5_the_truth_emerges, chapterid_ch5_the_truth_emerges).

quest_objective(chapter_5_the_truth_emerges, 0, talk_to('{{npc}}')).
quest_objective(chapter_5_the_truth_emerges, 1, talk_to('{{npc}}')).
quest_objective(chapter_5_the_truth_emerges, 2, objective('Demonstrate mastery of advanced grammar to navigate difficult conversations.')).
quest_objective(chapter_5_the_truth_emerges, 3, objective('Review and connect all collected documents and testimony.')).
quest_objective(chapter_5_the_truth_emerges, 4, objective('Collect advanced scholarly texts and research papers to deepen your knowledge.')).



quest_reward(chapter_5_the_truth_emerges, experience, 1500).
quest_reward(chapter_5_the_truth_emerges, gold, 400).
quest_reward(chapter_5_the_truth_emerges, xp, 1500).

% Can Player take this quest?
quest_available(Player, chapter_5_the_truth_emerges) :-
    quest(chapter_5_the_truth_emerges, _, _, _, active).

% Quest: Chapter 6: The Final Chapter
% The road winds uphill past olive groves and crumbling stone walls. A cottage sits at the edge of a cliff overlooking the sea — smoke curling from the chimney. A typewriter clacks inside. You take a breath and knock. The door opens, and there stands {WRITER}, alive and well, with ink on their fingers and a story they have been waiting to tell.
% Type: main_quest / Difficulty: advanced

quest(chapter_6_the_final_chapter, 'Chapter 6: The Final Chapter', main_quest, advanced, active).
quest_assigned_to(chapter_6_the_final_chapter, '{{player}}').
quest_language(chapter_6_the_final_chapter, french).
quest_tag(chapter_6_the_final_chapter, main_quest).
quest_tag(chapter_6_the_final_chapter, chapter_6).
quest_tag(chapter_6_the_final_chapter, chapterid_ch6_the_final_chapter).

quest_objective(chapter_6_the_final_chapter, 0, talk_to('{{npc}}')).
quest_objective(chapter_6_the_final_chapter, 1, talk_to('{{npc}}')).
quest_objective(chapter_6_the_final_chapter, 2, objective('Write your story, summarizing everything you learned, in the target language.')).
quest_objective(chapter_6_the_final_chapter, 3, objective('Show your command of the language across all skill areas.')).
quest_objective(chapter_6_the_final_chapter, 4, objective('Collect the remaining texts to complete your library and leave a lasting record.')).



quest_reward(chapter_6_the_final_chapter, experience, 2000).
quest_reward(chapter_6_the_final_chapter, gold, 500).
quest_reward(chapter_6_the_final_chapter, xp, 2000).

% Can Player take this quest?
quest_available(Player, chapter_6_the_final_chapter) :-
    quest(chapter_6_the_final_chapter, _, _, _, active).

% Quest: Explore the Neighborhood
% Get familiar with the area by visiting a key location.
% Type: navigation / Difficulty: beginner

quest(explore_the_neighborhood, 'Explore the Neighborhood', navigation, beginner, active).
quest_assigned_to(explore_the_neighborhood, '{{player}}').
quest_language(explore_the_neighborhood, french).
quest_tag(explore_the_neighborhood, seed).
quest_tag(explore_the_neighborhood, objective_type_visit_location).

quest_objective(explore_the_neighborhood, 0, visit_location('{{location}}')).



quest_reward(explore_the_neighborhood, experience, 15).

% Can Player take this quest?
quest_available(Player, explore_the_neighborhood) :-
    quest(explore_the_neighborhood, _, _, _, active).

% Quest: Grand Tour
% Visit three different locations to get a feel for the area.
% Type: exploration / Difficulty: intermediate

quest(grand_tour, 'Grand Tour', exploration, intermediate, active).
quest_assigned_to(grand_tour, '{{player}}').
quest_language(grand_tour, french).
quest_tag(grand_tour, seed).
quest_tag(grand_tour, objective_type_visit_location).
quest_tag(grand_tour, multi_step).

quest_objective(grand_tour, 0, visit_location('{{location}}')).
quest_objective(grand_tour, 1, visit_location('{{location_2}}')).
quest_objective(grand_tour, 2, visit_location('{{location_3}}')).



quest_reward(grand_tour, experience, 30).

% Can Player take this quest?
quest_available(Player, grand_tour) :-
    quest(grand_tour, _, _, _, active).

% Quest: Uncharted Territory
% Discover a new location you have not visited before.
% Type: exploration / Difficulty: beginner

quest(uncharted_territory, 'Uncharted Territory', exploration, beginner, active).
quest_assigned_to(uncharted_territory, '{{player}}').
quest_language(uncharted_territory, french).
quest_tag(uncharted_territory, seed).
quest_tag(uncharted_territory, objective_type_discover_location).

quest_objective(uncharted_territory, 0, discover_location('{{location}}')).



quest_reward(uncharted_territory, experience, 20).

% Can Player take this quest?
quest_available(Player, uncharted_territory) :-
    quest(uncharted_territory, _, _, _, active).

% Quest: Introduce Yourself
% Meet a local resident and introduce yourself.
% Type: conversation / Difficulty: beginner

quest(introduce_yourself, 'Introduce Yourself', conversation, beginner, active).
quest_assigned_to(introduce_yourself, '{{player}}').
quest_language(introduce_yourself, french).
quest_tag(introduce_yourself, seed).
quest_tag(introduce_yourself, objective_type_talk_to_npc).

quest_objective(introduce_yourself, 0, talk_to('{{npc}}', 1)).



quest_reward(introduce_yourself, experience, 10).

% Can Player take this quest?
quest_available(Player, introduce_yourself) :-
    quest(introduce_yourself, _, _, _, active).

% Quest: Meet the Locals
% Introduce yourself to three different people in the area.
% Type: social / Difficulty: beginner

quest(meet_the_locals, 'Meet the Locals', social, beginner, active).
quest_assigned_to(meet_the_locals, '{{player}}').
quest_language(meet_the_locals, french).
quest_tag(meet_the_locals, seed).
quest_tag(meet_the_locals, objective_type_talk_to_npc).
quest_tag(meet_the_locals, multi_npc).

quest_objective(meet_the_locals, 0, talk_to('{{npcId_0}}', 1)).
quest_objective(meet_the_locals, 1, talk_to('{{npc}}', 1)).
quest_objective(meet_the_locals, 2, talk_to('{{npc_2}}', 1)).



quest_reward(meet_the_locals, experience, 20).

% Can Player take this quest?
quest_available(Player, meet_the_locals) :-
    quest(meet_the_locals, _, _, _, active).

% Quest: A Good Chat
% Have a meaningful conversation with an NPC — keep talking for several turns.
% Type: conversation / Difficulty: beginner

quest(a_good_chat, 'A Good Chat', conversation, beginner, active).
quest_assigned_to(a_good_chat, '{{player}}').
quest_language(a_good_chat, french).
quest_tag(a_good_chat, seed).
quest_tag(a_good_chat, objective_type_complete_conversation).

quest_objective(a_good_chat, 0, conversation_turns(3)).



quest_reward(a_good_chat, experience, 20).

% Can Player take this quest?
quest_available(Player, a_good_chat) :-
    quest(a_good_chat, _, _, _, active).

% Quest: Deep Conversation
% Have an extended conversation of at least 6 turns with a single NPC.
% Type: conversation / Difficulty: intermediate

quest(deep_conversation, 'Deep Conversation', conversation, intermediate, active).
quest_assigned_to(deep_conversation, '{{player}}').
quest_language(deep_conversation, french).
quest_tag(deep_conversation, seed).
quest_tag(deep_conversation, objective_type_complete_conversation).

quest_objective(deep_conversation, 0, conversation_turns(6)).



quest_reward(deep_conversation, experience, 35).

% Can Player take this quest?
quest_available(Player, deep_conversation) :-
    quest(deep_conversation, _, _, _, active).

% Quest: First Impressions
% Introduce yourself to an NPC using the target language.
% Type: conversation / Difficulty: beginner

quest(first_impressions, 'First Impressions', conversation, beginner, active).
quest_assigned_to(first_impressions, '{{player}}').
quest_language(first_impressions, french).
quest_tag(first_impressions, seed).
quest_tag(first_impressions, objective_type_introduce_self).

quest_objective(first_impressions, 0, objective('Introduce yourself to {{npc}} in {{targetLanguage}}')).



quest_reward(first_impressions, experience, 15).

% Can Player take this quest?
quest_available(Player, first_impressions) :-
    quest(first_impressions, _, _, _, active).

% Quest: Making Friends
% Build a friendship with a local by having several conversations.
% Type: social / Difficulty: beginner

quest(making_friends, 'Making Friends', social, beginner, active).
quest_assigned_to(making_friends, '{{player}}').
quest_language(making_friends, french).
quest_tag(making_friends, seed).
quest_tag(making_friends, objective_type_build_friendship).

quest_objective(making_friends, 0, objective('Have 3 conversations with {{npc}} to build a friendship')).



quest_reward(making_friends, experience, 25).

% Can Player take this quest?
quest_available(Player, making_friends) :-
    quest(making_friends, _, _, _, active).

% Quest: A Thoughtful Gift
% Find a gift and present it to a local to strengthen your bond.
% Type: social / Difficulty: intermediate

quest(a_thoughtful_gift, 'A Thoughtful Gift', social, intermediate, active).
quest_assigned_to(a_thoughtful_gift, '{{player}}').
quest_language(a_thoughtful_gift, french).
quest_tag(a_thoughtful_gift, seed).
quest_tag(a_thoughtful_gift, objective_type_give_gift).

quest_objective(a_thoughtful_gift, 0, collect(, 1)).
quest_objective(a_thoughtful_gift, 1, objective('Present the gift to {{npc}}')).



quest_reward(a_thoughtful_gift, experience, 30).

% Can Player take this quest?
quest_available(Player, a_thoughtful_gift) :-
    quest(a_thoughtful_gift, _, _, _, active).

% Quest: Earn Their Trust
% Build your standing with the community through positive interactions.
% Type: social / Difficulty: intermediate

quest(earn_their_trust, 'Earn Their Trust', social, intermediate, active).
quest_assigned_to(earn_their_trust, '{{player}}').
quest_language(earn_their_trust, french).
quest_tag(earn_their_trust, seed).
quest_tag(earn_their_trust, objective_type_gain_reputation).

quest_objective(earn_their_trust, 0, gain_reputation(, 100)).



quest_reward(earn_their_trust, experience, 30).

% Can Player take this quest?
quest_available(Player, earn_their_trust) :-
    quest(earn_their_trust, _, _, _, active).

% Quest: Words in Action
% Use target-language words during a conversation.
% Type: vocabulary / Difficulty: beginner

quest(words_in_action, 'Words in Action', vocabulary, beginner, active).
quest_assigned_to(words_in_action, '{{player}}').
quest_language(words_in_action, french).
quest_tag(words_in_action, seed).
quest_tag(words_in_action, objective_type_use_vocabulary).

quest_objective(words_in_action, 0, learn_words_count(3)).



quest_reward(words_in_action, experience, 20).

% Can Player take this quest?
quest_available(Player, words_in_action) :-
    quest(words_in_action, _, _, _, active).

% Quest: Vocabulary Immersion
% Use many target-language words across multiple conversations.
% Type: vocabulary / Difficulty: intermediate

quest(vocabulary_immersion, 'Vocabulary Immersion', vocabulary, intermediate, active).
quest_assigned_to(vocabulary_immersion, '{{player}}').
quest_language(vocabulary_immersion, french).
quest_tag(vocabulary_immersion, seed).
quest_tag(vocabulary_immersion, objective_type_use_vocabulary).

quest_objective(vocabulary_immersion, 0, learn_words_count(10)).



quest_reward(vocabulary_immersion, experience, 35).

% Can Player take this quest?
quest_available(Player, vocabulary_immersion) :-
    quest(vocabulary_immersion, _, _, _, active).

% Quest: Word Collector
% Walk around and collect vocabulary words from labeled objects in the world.
% Type: vocabulary / Difficulty: beginner

quest(word_collector, 'Word Collector', vocabulary, beginner, active).
quest_assigned_to(word_collector, '{{player}}').
quest_language(word_collector, french).
quest_tag(word_collector, seed).
quest_tag(word_collector, objective_type_collect_vocabulary).

quest_objective(word_collector, 0, objective('Collect 3 vocabulary words by approaching labeled objects')).



quest_reward(word_collector, experience, 20).

% Can Player take this quest?
quest_available(Player, word_collector) :-
    quest(word_collector, _, _, _, active).

% Quest: Word Hoarder
% Collect a large number of vocabulary words from the world around you.
% Type: vocabulary / Difficulty: intermediate

quest(word_hoarder, 'Word Hoarder', vocabulary, intermediate, active).
quest_assigned_to(word_hoarder, '{{player}}').
quest_language(word_hoarder, french).
quest_tag(word_hoarder, seed).
quest_tag(word_hoarder, objective_type_collect_vocabulary).

quest_objective(word_hoarder, 0, objective('Collect 8 vocabulary words from the world')).



quest_reward(word_hoarder, experience, 35).

% Can Player take this quest?
quest_available(Player, word_hoarder) :-
    quest(word_hoarder, _, _, _, active).

% Quest: Name That Thing
% Click on objects in the world and type their name in the target language.
% Type: visual_vocabulary / Difficulty: beginner

quest(name_that_thing, 'Name That Thing', visual_vocabulary, beginner, active).
quest_assigned_to(name_that_thing, '{{player}}').
quest_language(name_that_thing, french).
quest_tag(name_that_thing, seed).
quest_tag(name_that_thing, objective_type_identify_object).

quest_objective(name_that_thing, 0, objective('Correctly identify 3 objects by their {{targetLanguage}} name')).



quest_reward(name_that_thing, experience, 20).

% Can Player take this quest?
quest_available(Player, name_that_thing) :-
    quest(name_that_thing, _, _, _, active).

% Quest: Curious Observer
% Examine objects in the world to learn their names in the target language.
% Type: vocabulary / Difficulty: beginner

quest(curious_observer, 'Curious Observer', vocabulary, beginner, active).
quest_assigned_to(curious_observer, '{{player}}').
quest_language(curious_observer, french).
quest_tag(curious_observer, seed).
quest_tag(curious_observer, objective_type_examine_object).

quest_objective(curious_observer, 0, objective('Examine 3 objects to learn their {{targetLanguage}} names')).



quest_reward(curious_observer, experience, 15).

% Can Player take this quest?
quest_available(Player, curious_observer) :-
    quest(curious_observer, _, _, _, active).

% Quest: Point and Say
% Click on objects and name them in the target language to practice vocabulary.
% Type: visual_vocabulary / Difficulty: beginner

quest(point_and_say, 'Point and Say', visual_vocabulary, beginner, active).
quest_assigned_to(point_and_say, '{{player}}').
quest_language(point_and_say, french).
quest_tag(point_and_say, seed).
quest_tag(point_and_say, objective_type_point_and_name).

quest_objective(point_and_say, 0, objective('Point at 5 objects and name them in {{targetLanguage}}')).



quest_reward(point_and_say, experience, 20).

% Can Player take this quest?
quest_available(Player, point_and_say) :-
    quest(point_and_say, _, _, _, active).

% Quest: Reading Around Town
% Read signs, menus, and other text written in the target language.
% Type: vocabulary / Difficulty: beginner

quest(reading_around_town, 'Reading Around Town', vocabulary, beginner, active).
quest_assigned_to(reading_around_town, '{{player}}').
quest_language(reading_around_town, french).
quest_tag(reading_around_town, seed).
quest_tag(reading_around_town, objective_type_read_sign).

quest_objective(reading_around_town, 0, objective('Read 3 signs or texts written in {{targetLanguage}}')).



quest_reward(reading_around_town, experience, 15).

% Can Player take this quest?
quest_available(Player, reading_around_town) :-
    quest(reading_around_town, _, _, _, active).

% Quest: Grammar in Practice
% Use correct grammar patterns during conversations with NPCs.
% Type: grammar / Difficulty: intermediate

quest(grammar_in_practice, 'Grammar in Practice', grammar, intermediate, active).
quest_assigned_to(grammar_in_practice, '{{player}}').
quest_language(grammar_in_practice, french).
quest_tag(grammar_in_practice, seed).
quest_tag(grammar_in_practice, objective_type_use_vocabulary).
quest_tag(grammar_in_practice, grammar).

quest_objective(grammar_in_practice, 0, conversation_turns(3)).
quest_objective(grammar_in_practice, 1, learn_words_count(5)).



quest_reward(grammar_in_practice, experience, 30).

% Can Player take this quest?
quest_available(Player, grammar_in_practice) :-
    quest(grammar_in_practice, _, _, _, active).

% Quest: Written Word
% Practice writing in the target language by composing responses to prompts.
% Type: grammar / Difficulty: intermediate

quest(written_word, 'Written Word', grammar, intermediate, active).
quest_assigned_to(written_word, '{{player}}').
quest_language(written_word, french).
quest_tag(written_word, seed).
quest_tag(written_word, objective_type_write_response).

quest_objective(written_word, 0, objective('Write 2 responses in {{targetLanguage}}')).



quest_reward(written_word, experience, 30).

% Can Player take this quest?
quest_available(Player, written_word) :-
    quest(written_word, _, _, _, active).

% Quest: Picture This
% Describe what you see around you using the target language.
% Type: grammar / Difficulty: intermediate

quest(picture_this, 'Picture This', grammar, intermediate, active).
quest_assigned_to(picture_this, '{{player}}').
quest_language(picture_this, french).
quest_tag(picture_this, seed).
quest_tag(picture_this, objective_type_describe_scene).

quest_objective(picture_this, 0, objective('Describe 2 scenes in {{targetLanguage}}')).



quest_reward(picture_this, experience, 25).

% Can Player take this quest?
quest_available(Player, picture_this) :-
    quest(picture_this, _, _, _, active).

% Quest: Story Time
% Listen to an NPC tell a story and answer comprehension questions.
% Type: listening_comprehension / Difficulty: intermediate

quest(story_time, 'Story Time', listening_comprehension, intermediate, active).
quest_assigned_to(story_time, '{{player}}').
quest_language(story_time, french).
quest_tag(story_time, seed).
quest_tag(story_time, objective_type_listening_comprehension).

quest_objective(story_time, 0, objective('Listen to {{npc}}''s story and answer 2 questions correctly')).



quest_reward(story_time, experience, 35).

% Can Player take this quest?
quest_available(Player, story_time) :-
    quest(story_time, _, _, _, active).

% Quest: Parrot Practice
% Listen to an NPC speak and repeat what they say to practice pronunciation.
% Type: listening_comprehension / Difficulty: beginner

quest(parrot_practice, 'Parrot Practice', listening_comprehension, beginner, active).
quest_assigned_to(parrot_practice, '{{player}}').
quest_language(parrot_practice, french).
quest_tag(parrot_practice, seed).
quest_tag(parrot_practice, objective_type_listen_and_repeat).

quest_objective(parrot_practice, 0, objective('Listen to {{npc}} and repeat 3 phrases')).



quest_reward(parrot_practice, experience, 20).

% Can Player take this quest?
quest_available(Player, parrot_practice) :-
    quest(parrot_practice, _, _, _, active).

% Quest: Echo Challenge
% Repeat back longer phrases from NPCs to improve your listening and speaking.
% Type: listening_comprehension / Difficulty: intermediate

quest(echo_challenge, 'Echo Challenge', listening_comprehension, intermediate, active).
quest_assigned_to(echo_challenge, '{{player}}').
quest_language(echo_challenge, french).
quest_tag(echo_challenge, seed).
quest_tag(echo_challenge, objective_type_listen_and_repeat).

quest_objective(echo_challenge, 0, objective('Listen to {{npc}} and repeat 6 phrases')).



quest_reward(echo_challenge, experience, 30).

% Can Player take this quest?
quest_available(Player, echo_challenge) :-
    quest(echo_challenge, _, _, _, active).

% Quest: Lost in Translation
% Translate phrases between English and the target language.
% Type: translation_challenge / Difficulty: intermediate

quest(lost_in_translation, 'Lost in Translation', translation_challenge, intermediate, active).
quest_assigned_to(lost_in_translation, '{{player}}').
quest_language(lost_in_translation, french).
quest_tag(lost_in_translation, seed).
quest_tag(lost_in_translation, objective_type_translation_challenge).

quest_objective(lost_in_translation, 0, objective('Correctly translate 3 {{targetLanguage}} phrases')).



quest_reward(lost_in_translation, experience, 30).

% Can Player take this quest?
quest_available(Player, lost_in_translation) :-
    quest(lost_in_translation, _, _, _, active).

% Quest: Master Translator
% Translate many phrases accurately to prove your language skills.
% Type: translation_challenge / Difficulty: advanced

quest(master_translator, 'Master Translator', translation_challenge, advanced, active).
quest_assigned_to(master_translator, '{{player}}').
quest_language(master_translator, french).
quest_tag(master_translator, seed).
quest_tag(master_translator, objective_type_translation_challenge).

quest_objective(master_translator, 0, objective('Correctly translate 8 {{targetLanguage}} phrases')).



quest_reward(master_translator, experience, 45).

% Can Player take this quest?
quest_available(Player, master_translator) :-
    quest(master_translator, _, _, _, active).

% Quest: Say It Right
% Pronounce phrases in the target language and get accuracy feedback.
% Type: pronunciation / Difficulty: intermediate

quest(say_it_right, 'Say It Right', pronunciation, intermediate, active).
quest_assigned_to(say_it_right, '{{player}}').
quest_language(say_it_right, french).
quest_tag(say_it_right, seed).
quest_tag(say_it_right, objective_type_pronunciation_check).

quest_objective(say_it_right, 0, objective('Pronounce 3 {{targetLanguage}} phrases with good accuracy')).



quest_reward(say_it_right, experience, 30).

% Can Player take this quest?
quest_available(Player, say_it_right) :-
    quest(say_it_right, _, _, _, active).

% Quest: Fluency Drill
% Pronounce many phrases to build confidence and accuracy.
% Type: pronunciation / Difficulty: advanced

quest(fluency_drill, 'Fluency Drill', pronunciation, advanced, active).
quest_assigned_to(fluency_drill, '{{player}}').
quest_language(fluency_drill, french).
quest_tag(fluency_drill, seed).
quest_tag(fluency_drill, objective_type_pronunciation_check).

quest_objective(fluency_drill, 0, objective('Pronounce 8 {{targetLanguage}} phrases accurately')).



quest_reward(fluency_drill, experience, 40).

% Can Player take this quest?
quest_available(Player, fluency_drill) :-
    quest(fluency_drill, _, _, _, active).

% Quest: Follow the Signs
% Follow directions given in the target language to reach your destination.
% Type: navigation / Difficulty: advanced

quest(follow_the_signs, 'Follow the Signs', navigation, advanced, active).
quest_assigned_to(follow_the_signs, '{{player}}').
quest_language(follow_the_signs, french).
quest_tag(follow_the_signs, seed).
quest_tag(follow_the_signs, objective_type_navigate_language).

quest_objective(follow_the_signs, 0, objective('Follow {{targetLanguage}} directions to reach {{destination}}')).



quest_reward(follow_the_signs, experience, 40).

% Can Player take this quest?
quest_available(Player, follow_the_signs) :-
    quest(follow_the_signs, _, _, _, active).

% Quest: Direction Master
% An NPC gives you directions in the target language. Follow them step by step.
% Type: follow_instructions / Difficulty: intermediate

quest(direction_master, 'Direction Master', follow_instructions, intermediate, active).
quest_assigned_to(direction_master, '{{player}}').
quest_language(direction_master, french).
quest_tag(direction_master, seed).
quest_tag(direction_master, objective_type_follow_directions).

quest_objective(direction_master, 0, objective('Follow 3 steps of {{targetLanguage}} directions')).



quest_reward(direction_master, experience, 30).

% Can Player take this quest?
quest_available(Player, direction_master) :-
    quest(direction_master, _, _, _, active).

% Quest: Which Way?
% Ask NPCs for directions using the target language.
% Type: navigation / Difficulty: beginner

quest(which_way, 'Which Way?', navigation, beginner, active).
quest_assigned_to(which_way, '{{player}}').
quest_language(which_way, french).
quest_tag(which_way, seed).
quest_tag(which_way, objective_type_ask_for_directions).

quest_objective(which_way, 0, objective('Ask {{npc}} for directions in {{targetLanguage}}')).



quest_reward(which_way, experience, 20).

% Can Player take this quest?
quest_available(Player, which_way) :-
    quest(which_way, _, _, _, active).

% Quest: Cultural Exchange
% Talk to locals to learn about the customs and culture of the area.
% Type: cultural / Difficulty: beginner

quest(cultural_exchange, 'Cultural Exchange', cultural, beginner, active).
quest_assigned_to(cultural_exchange, '{{player}}').
quest_language(cultural_exchange, french).
quest_tag(cultural_exchange, seed).
quest_tag(cultural_exchange, objective_type_talk_to_npc).
quest_tag(cultural_exchange, cultural).

quest_objective(cultural_exchange, 0, talk_to('{{npcId_0}}', 1)).
quest_objective(cultural_exchange, 1, talk_to('{{npc}}', 1)).



quest_reward(cultural_exchange, experience, 20).

% Can Player take this quest?
quest_available(Player, cultural_exchange) :-
    quest(cultural_exchange, _, _, _, active).

% Quest: Cultural Landmarks
% Visit important cultural locations and examine what you find there.
% Type: cultural / Difficulty: intermediate

quest(cultural_landmarks, 'Cultural Landmarks', cultural, intermediate, active).
quest_assigned_to(cultural_landmarks, '{{player}}').
quest_language(cultural_landmarks, french).
quest_tag(cultural_landmarks, seed).
quest_tag(cultural_landmarks, objective_type_visit_location).
quest_tag(cultural_landmarks, cultural).

quest_objective(cultural_landmarks, 0, visit_location('{{location}}')).
quest_objective(cultural_landmarks, 1, visit_location('{{location_2}}')).
quest_objective(cultural_landmarks, 2, objective('Examine a cultural object at one of the locations')).



quest_reward(cultural_landmarks, experience, 30).

% Can Player take this quest?
quest_available(Player, cultural_landmarks) :-
    quest(cultural_landmarks, _, _, _, active).

% Quest: Scavenger Hunt: Basics
% Find and identify objects around town by their target-language names.
% Type: scavenger_hunt / Difficulty: beginner

quest(scavenger_hunt_basics, 'Scavenger Hunt: Basics', scavenger_hunt, beginner, active).
quest_assigned_to(scavenger_hunt_basics, '{{player}}').
quest_language(scavenger_hunt_basics, french).
quest_tag(scavenger_hunt_basics, seed).
quest_tag(scavenger_hunt_basics, objective_type_identify_object).

quest_objective(scavenger_hunt_basics, 0, objective('Identify 3 objects by their {{targetLanguage}} name')).
quest_objective(scavenger_hunt_basics, 1, objective('Collect 2 new vocabulary words along the way')).



quest_reward(scavenger_hunt_basics, experience, 25).

% Can Player take this quest?
quest_available(Player, scavenger_hunt_basics) :-
    quest(scavenger_hunt_basics, _, _, _, active).

% Quest: Scavenger Hunt: Collector
% Collect specific items from around the world while learning their names.
% Type: scavenger_hunt / Difficulty: intermediate

quest(scavenger_hunt_collector, 'Scavenger Hunt: Collector', scavenger_hunt, intermediate, active).
quest_assigned_to(scavenger_hunt_collector, '{{player}}').
quest_language(scavenger_hunt_collector, french).
quest_tag(scavenger_hunt_collector, seed).
quest_tag(scavenger_hunt_collector, objective_type_collect_item).

quest_objective(scavenger_hunt_collector, 0, collect(, 1)).
quest_objective(scavenger_hunt_collector, 1, objective('Examine 2 objects to learn their {{targetLanguage}} names')).



quest_reward(scavenger_hunt_collector, experience, 35).

% Can Player take this quest?
quest_available(Player, scavenger_hunt_collector) :-
    quest(scavenger_hunt_collector, _, _, _, active).

% Quest: Scavenger Hunt: Expert
% Find, identify, and name many objects in the target language — a comprehensive vocabulary challenge.
% Type: scavenger_hunt / Difficulty: advanced

quest(scavenger_hunt_expert, 'Scavenger Hunt: Expert', scavenger_hunt, advanced, active).
quest_assigned_to(scavenger_hunt_expert, '{{player}}').
quest_language(scavenger_hunt_expert, french).
quest_tag(scavenger_hunt_expert, seed).
quest_tag(scavenger_hunt_expert, objective_type_identify_object).

quest_objective(scavenger_hunt_expert, 0, objective('Identify 6 objects by their {{targetLanguage}} name')).
quest_objective(scavenger_hunt_expert, 1, objective('Point and name 4 additional objects')).
quest_objective(scavenger_hunt_expert, 2, objective('Collect 5 vocabulary words')).



quest_reward(scavenger_hunt_expert, experience, 50).

% Can Player take this quest?
quest_available(Player, scavenger_hunt_expert) :-
    quest(scavenger_hunt_expert, _, _, _, active).

% Quest: Tell Your Story
% Practice narrative skills by having a long conversation where you tell a story about yourself.
% Type: storytelling / Difficulty: intermediate

quest(tell_your_story, 'Tell Your Story', storytelling, intermediate, active).
quest_assigned_to(tell_your_story, '{{player}}').
quest_language(tell_your_story, french).
quest_tag(tell_your_story, seed).
quest_tag(tell_your_story, objective_type_complete_conversation).
quest_tag(tell_your_story, storytelling).
quest_tag(tell_your_story, narrative).

quest_objective(tell_your_story, 0, conversation_turns(5)).



quest_reward(tell_your_story, experience, 35).

% Can Player take this quest?
quest_available(Player, tell_your_story) :-
    quest(tell_your_story, _, _, _, active).

% Quest: Campfire Tales
% Listen to a local tell a story, then retell it in your own words to someone else.
% Type: storytelling / Difficulty: advanced

quest(campfire_tales, 'Campfire Tales', storytelling, advanced, active).
quest_assigned_to(campfire_tales, '{{player}}').
quest_language(campfire_tales, french).
quest_tag(campfire_tales, seed).
quest_tag(campfire_tales, objective_type_complete_conversation).
quest_tag(campfire_tales, storytelling).
quest_tag(campfire_tales, listening).

quest_objective(campfire_tales, 0, objective('Listen to {{npc_0}} tell a story and repeat key phrases')).
quest_objective(campfire_tales, 1, conversation_turns(5)).



quest_reward(campfire_tales, experience, 45).

% Can Player take this quest?
quest_available(Player, campfire_tales) :-
    quest(campfire_tales, _, _, _, active).

% Quest: Lunch Order
% Order food or drinks at a local establishment using the target language.
% Type: conversation / Difficulty: beginner

quest(lunch_order, 'Lunch Order', conversation, beginner, active).
quest_assigned_to(lunch_order, '{{player}}').
quest_language(lunch_order, french).
quest_tag(lunch_order, seed).
quest_tag(lunch_order, objective_type_order_food).
quest_tag(lunch_order, commerce).
quest_tag(lunch_order, daily_life).

quest_objective(lunch_order, 0, objective('Order food from {{npc}} in {{targetLanguage}}')).



quest_reward(lunch_order, experience, 20).

% Can Player take this quest?
quest_available(Player, lunch_order) :-
    quest(lunch_order, _, _, _, active).

% Quest: Bargain Hunter
% Negotiate a price with a merchant using the target language.
% Type: conversation / Difficulty: intermediate

quest(bargain_hunter, 'Bargain Hunter', conversation, intermediate, active).
quest_assigned_to(bargain_hunter, '{{player}}').
quest_language(bargain_hunter, french).
quest_tag(bargain_hunter, seed).
quest_tag(bargain_hunter, objective_type_haggle_price).
quest_tag(bargain_hunter, commerce).

quest_objective(bargain_hunter, 0, objective('Negotiate a price with {{npc}} in {{targetLanguage}}')).



quest_reward(bargain_hunter, experience, 30).

% Can Player take this quest?
quest_available(Player, bargain_hunter) :-
    quest(bargain_hunter, _, _, _, active).

% Quest: Dinner Party
% Order a full meal — appetizer, main course, and drink — using only the target language.
% Type: conversation / Difficulty: intermediate

quest(dinner_party, 'Dinner Party', conversation, intermediate, active).
quest_assigned_to(dinner_party, '{{player}}').
quest_language(dinner_party, french).
quest_tag(dinner_party, seed).
quest_tag(dinner_party, objective_type_order_food).
quest_tag(dinner_party, commerce).
quest_tag(dinner_party, daily_life).

quest_objective(dinner_party, 0, objective('Order food from {{npc}} in {{targetLanguage}}')).
quest_objective(dinner_party, 1, learn_words_count(3)).



quest_reward(dinner_party, experience, 35).

% Can Player take this quest?
quest_available(Player, dinner_party) :-
    quest(dinner_party, _, _, _, active).

% Quest: Gather Supplies
% Collect an item from the world.
% Type: collection / Difficulty: beginner

quest(gather_supplies, 'Gather Supplies', collection, beginner, active).
quest_assigned_to(gather_supplies, '{{player}}').
quest_language(gather_supplies, french).
quest_tag(gather_supplies, seed).
quest_tag(gather_supplies, objective_type_collect_item).

quest_objective(gather_supplies, 0, collect(, 1)).



quest_reward(gather_supplies, experience, 15).

% Can Player take this quest?
quest_available(Player, gather_supplies) :-
    quest(gather_supplies, _, _, _, active).

% Quest: Special Delivery
% Pick up an item and deliver it to an NPC.
% Type: delivery / Difficulty: intermediate

quest(special_delivery, 'Special Delivery', delivery, intermediate, active).
quest_assigned_to(special_delivery, '{{player}}').
quest_language(special_delivery, french).
quest_tag(special_delivery, seed).
quest_tag(special_delivery, objective_type_deliver_item).

quest_objective(special_delivery, 0, collect(, 1)).
quest_objective(special_delivery, 1, deliver(, '{{npc}}')).



quest_reward(special_delivery, experience, 30).

% Can Player take this quest?
quest_available(Player, special_delivery) :-
    quest(special_delivery, _, _, _, active).

% Quest: First Craft
% Craft an item using the crafting system.
% Type: crafting / Difficulty: intermediate

quest(first_craft, 'First Craft', crafting, intermediate, active).
quest_assigned_to(first_craft, '{{player}}').
quest_language(first_craft, french).
quest_tag(first_craft, seed).
quest_tag(first_craft, objective_type_craft_item).

quest_objective(first_craft, 0, craft_item(, 1)).



quest_reward(first_craft, experience, 25).

% Can Player take this quest?
quest_available(Player, first_craft) :-
    quest(first_craft, _, _, _, active).

% Quest: Prove Your Mettle
% Defeat an enemy in combat.
% Type: combat / Difficulty: intermediate

quest(prove_your_mettle, 'Prove Your Mettle', combat, intermediate, active).
quest_assigned_to(prove_your_mettle, '{{player}}').
quest_language(prove_your_mettle, french).
quest_tag(prove_your_mettle, seed).
quest_tag(prove_your_mettle, objective_type_defeat_enemies).

quest_objective(prove_your_mettle, 0, defeat('', 1)).



quest_reward(prove_your_mettle, experience, 30).

% Can Player take this quest?
quest_available(Player, prove_your_mettle) :-
    quest(prove_your_mettle, _, _, _, active).

% Quest: Safe Passage
% Escort an NPC safely to their destination.
% Type: escort / Difficulty: intermediate

quest(safe_passage, 'Safe Passage', escort, intermediate, active).
quest_assigned_to(safe_passage, '{{player}}').
quest_language(safe_passage, french).
quest_tag(safe_passage, seed).
quest_tag(safe_passage, objective_type_escort_npc).

quest_objective(safe_passage, 0, escort('{{npc}}', '{{destination}}')).



quest_reward(safe_passage, experience, 35).

% Can Player take this quest?
quest_available(Player, safe_passage) :-
    quest(safe_passage, _, _, _, active).

% Quest: Newcomer’s Welcome
% Get oriented: visit a location, meet someone, and learn a few words along the way.
% Type: exploration / Difficulty: beginner

quest(newcomer_s_welcome, 'Newcomer''s Welcome', exploration, beginner, active).
quest_assigned_to(newcomer_s_welcome, '{{player}}').
quest_language(newcomer_s_welcome, french).
quest_tag(newcomer_s_welcome, seed).
quest_tag(newcomer_s_welcome, objective_type_talk_to_npc).
quest_tag(newcomer_s_welcome, composite).
quest_tag(newcomer_s_welcome, onboarding).

quest_objective(newcomer_s_welcome, 0, visit_location('{{location}}')).
quest_objective(newcomer_s_welcome, 1, talk_to('{{npc}}', 1)).
quest_objective(newcomer_s_welcome, 2, objective('Collect 2 vocabulary words')).



quest_reward(newcomer_s_welcome, experience, 30).

% Can Player take this quest?
quest_available(Player, newcomer_s_welcome) :-
    quest(newcomer_s_welcome, _, _, _, active).

% Quest: The Full Experience
% Visit a location, have a conversation, use vocabulary, and identify an object — a well-rounded language challenge.
% Type: conversation / Difficulty: intermediate

quest(the_full_experience, 'The Full Experience', conversation, intermediate, active).
quest_assigned_to(the_full_experience, '{{player}}').
quest_language(the_full_experience, french).
quest_tag(the_full_experience, seed).
quest_tag(the_full_experience, objective_type_complete_conversation).
quest_tag(the_full_experience, composite).

quest_objective(the_full_experience, 0, visit_location('{{location}}')).
quest_objective(the_full_experience, 1, conversation_turns(3)).
quest_objective(the_full_experience, 2, learn_words_count(3)).
quest_objective(the_full_experience, 3, objective('Identify 1 object by its {{targetLanguage}} name')).



quest_reward(the_full_experience, experience, 45).

% Can Player take this quest?
quest_available(Player, the_full_experience) :-
    quest(the_full_experience, _, _, _, active).

% Quest: Language Explorer
% Explore a new area, read signs, examine objects, and talk to people — all in the target language.
% Type: exploration / Difficulty: advanced

quest(language_explorer, 'Language Explorer', exploration, advanced, active).
quest_assigned_to(language_explorer, '{{player}}').
quest_language(language_explorer, french).
quest_tag(language_explorer, seed).
quest_tag(language_explorer, objective_type_use_vocabulary).
quest_tag(language_explorer, composite).
quest_tag(language_explorer, immersion).

quest_objective(language_explorer, 0, visit_location('{{location}}')).
quest_objective(language_explorer, 1, visit_location('{{location_2}}')).
quest_objective(language_explorer, 2, objective('Read 2 signs in {{targetLanguage}}')).
quest_objective(language_explorer, 3, objective('Examine 2 objects')).
quest_objective(language_explorer, 4, conversation_turns(4)).
quest_objective(language_explorer, 5, learn_words_count(5)).



quest_reward(language_explorer, experience, 55).

% Can Player take this quest?
quest_available(Player, language_explorer) :-
    quest(language_explorer, _, _, _, active).

% Quest: Welcome to the Market
% Visit the Merchants Guild hall and introduce yourself to the guild master.
% Type: vocabulary / Difficulty: beginner

quest(welcome_to_the_market, 'Welcome to the Market', vocabulary, beginner, active).
quest_assigned_to(welcome_to_the_market, '{{player}}').
quest_language(welcome_to_the_market, french).
quest_tag(welcome_to_the_market, guild_seed).
quest_tag(welcome_to_the_market, guild_marchands).
quest_tag(welcome_to_the_market, tier_0).

quest_objective(welcome_to_the_market, 0, visit_location('{{location}}')).
quest_objective(welcome_to_the_market, 1, talk_to('{{npc}}', 1)).



quest_reward(welcome_to_the_market, experience, 50).

% Can Player take this quest?
quest_available(Player, welcome_to_the_market) :-
    quest(welcome_to_the_market, _, _, _, active).

% Quest: Numbers of Commerce
% Learn to count and use numbers when shopping at the market.
% Type: number-practice / Difficulty: beginner

quest(numbers_of_commerce, 'Numbers of Commerce', number_practice, beginner, active).
quest_assigned_to(numbers_of_commerce, '{{player}}').
quest_language(numbers_of_commerce, french).
quest_tag(numbers_of_commerce, guild_seed).
quest_tag(numbers_of_commerce, guild_marchands).
quest_tag(numbers_of_commerce, tier_1).

quest_objective(numbers_of_commerce, 0, learn_words_count(1)).



quest_reward(numbers_of_commerce, experience, 75).

% Can Player take this quest?
quest_available(Player, numbers_of_commerce) :-
    quest(numbers_of_commerce, _, _, _, active).

% Quest: Order a Meal
% Visit a restaurant and order a meal entirely in the target language.
% Type: shopping / Difficulty: beginner

quest(order_a_meal, 'Order a Meal', shopping, beginner, active).
quest_assigned_to(order_a_meal, '{{player}}').
quest_language(order_a_meal, french).
quest_tag(order_a_meal, guild_seed).
quest_tag(order_a_meal, guild_marchands).
quest_tag(order_a_meal, tier_1).

quest_objective(order_a_meal, 0, objective('Order food at a restaurant')).
quest_objective(order_a_meal, 1, learn_words_count(1)).



quest_reward(order_a_meal, experience, 100).

% Can Player take this quest?
quest_available(Player, order_a_meal) :-
    quest(order_a_meal, _, _, _, active).

% Quest: Go Shopping
% Buy three items from different shops, asking for each by name.
% Type: shopping / Difficulty: beginner

quest(go_shopping, 'Go Shopping', shopping, beginner, active).
quest_assigned_to(go_shopping, '{{player}}').
quest_language(go_shopping, french).
quest_tag(go_shopping, guild_seed).
quest_tag(go_shopping, guild_marchands).
quest_tag(go_shopping, tier_1).

quest_objective(go_shopping, 0, objective('Purchase items from shops')).



quest_reward(go_shopping, experience, 100).

% Can Player take this quest?
quest_available(Player, go_shopping) :-
    quest(go_shopping, _, _, _, active).

% Quest: Haggling
% Negotiate prices with merchants using polite bargaining phrases.
% Type: business-roleplay / Difficulty: intermediate

quest(haggling, 'Haggling', business_roleplay, intermediate, active).
quest_assigned_to(haggling, '{{player}}').
quest_language(haggling, french).
quest_tag(haggling, guild_seed).
quest_tag(haggling, guild_marchands).
quest_tag(haggling, tier_2).

quest_objective(haggling, 0, objective('Successfully haggle with a merchant')).
quest_objective(haggling, 1, learn_words_count(1)).



quest_reward(haggling, experience, 150).

% Can Player take this quest?
quest_available(Player, haggling) :-
    quest(haggling, _, _, _, active).

% Quest: Shop Inventory
% Help a shopkeeper count and name all items in their store.
% Type: number-practice / Difficulty: intermediate

quest(shop_inventory, 'Shop Inventory', number_practice, intermediate, active).
quest_assigned_to(shop_inventory, '{{player}}').
quest_language(shop_inventory, french).
quest_tag(shop_inventory, guild_seed).
quest_tag(shop_inventory, guild_marchands).
quest_tag(shop_inventory, tier_2).

quest_objective(shop_inventory, 0, learn_words_count(1)).
quest_objective(shop_inventory, 1, talk_to('{{npc}}', 1)).



quest_reward(shop_inventory, experience, 150).

% Can Player take this quest?
quest_available(Player, shop_inventory) :-
    quest(shop_inventory, _, _, _, active).

% Quest: Secret Recipe
% Gather ingredients from different vendors, asking for each in the target language.
% Type: shopping / Difficulty: intermediate

quest(secret_recipe, 'Secret Recipe', shopping, intermediate, active).
quest_assigned_to(secret_recipe, '{{player}}').
quest_language(secret_recipe, french).
quest_tag(secret_recipe, guild_seed).
quest_tag(secret_recipe, guild_marchands).
quest_tag(secret_recipe, tier_2).

quest_objective(secret_recipe, 0, collect(, 1)).
quest_objective(secret_recipe, 1, learn_words_count(1)).



quest_reward(secret_recipe, experience, 175).

% Can Player take this quest?
quest_available(Player, secret_recipe) :-
    quest(secret_recipe, _, _, _, active).

% Quest: The Grand Market
% Organize a market day: negotiate with vendors, set prices, and serve customers.
% Type: business-roleplay / Difficulty: advanced

quest(the_grand_market, 'The Grand Market', business_roleplay, advanced, active).
quest_assigned_to(the_grand_market, '{{player}}').
quest_language(the_grand_market, french).
quest_tag(the_grand_market, guild_seed).
quest_tag(the_grand_market, guild_marchands).
quest_tag(the_grand_market, tier_3).

quest_objective(the_grand_market, 0, talk_to('{{npc}}', 1)).
quest_objective(the_grand_market, 1, objective('Set fair prices for goods')).



quest_reward(the_grand_market, experience, 250).

% Can Player take this quest?
quest_available(Player, the_grand_market) :-
    quest(the_grand_market, _, _, _, active).

% Quest: Master Trader
% Complete a complex multi-step trade route, buying low and selling high across the settlement.
% Type: business-roleplay / Difficulty: advanced

quest(master_trader, 'Master Trader', business_roleplay, advanced, active).
quest_assigned_to(master_trader, '{{player}}').
quest_language(master_trader, french).
quest_tag(master_trader, guild_seed).
quest_tag(master_trader, guild_marchands).
quest_tag(master_trader, tier_3).

quest_objective(master_trader, 0, objective('Buy trade goods')).
quest_objective(master_trader, 1, objective('Sell for profit')).



quest_reward(master_trader, experience, 300).

% Can Player take this quest?
quest_available(Player, master_trader) :-
    quest(master_trader, _, _, _, active).

% Quest: The Apprentice Artisan
% Visit the Artisans Guild hall and meet the master craftsman.
% Type: crafting / Difficulty: beginner

quest(the_apprentice_artisan, 'The Apprentice Artisan', crafting, beginner, active).
quest_assigned_to(the_apprentice_artisan, '{{player}}').
quest_language(the_apprentice_artisan, french).
quest_tag(the_apprentice_artisan, guild_seed).
quest_tag(the_apprentice_artisan, guild_artisans).
quest_tag(the_apprentice_artisan, tier_0).

quest_objective(the_apprentice_artisan, 0, visit_location('{{location}}')).
quest_objective(the_apprentice_artisan, 1, talk_to('{{npc}}', 1)).



quest_reward(the_apprentice_artisan, experience, 50).

% Can Player take this quest?
quest_available(Player, the_apprentice_artisan) :-
    quest(the_apprentice_artisan, _, _, _, active).

% Quest: Know Your Tools
% Learn the names of common tools by examining them at the workshop.
% Type: crafting / Difficulty: beginner

quest(know_your_tools, 'Know Your Tools', crafting, beginner, active).
quest_assigned_to(know_your_tools, '{{player}}').
quest_language(know_your_tools, french).
quest_tag(know_your_tools, guild_seed).
quest_tag(know_your_tools, guild_artisans).
quest_tag(know_your_tools, tier_1).

quest_objective(know_your_tools, 0, objective('Examine workshop tools')).
quest_objective(know_your_tools, 1, objective('Name each tool in target language')).



quest_reward(know_your_tools, experience, 75).

% Can Player take this quest?
quest_available(Player, know_your_tools) :-
    quest(know_your_tools, _, _, _, active).

% Quest: Gathering Materials
% Collect crafting materials from around the settlement.
% Type: collection / Difficulty: beginner

quest(gathering_materials, 'Gathering Materials', collection, beginner, active).
quest_assigned_to(gathering_materials, '{{player}}').
quest_language(gathering_materials, french).
quest_tag(gathering_materials, guild_seed).
quest_tag(gathering_materials, guild_artisans).
quest_tag(gathering_materials, tier_1).

quest_objective(gathering_materials, 0, collect(, 1)).



quest_reward(gathering_materials, experience, 100).

% Can Player take this quest?
quest_available(Player, gathering_materials) :-
    quest(gathering_materials, _, _, _, active).

% Quest: First Creation
% Craft your first item using the workshop tools.
% Type: crafting / Difficulty: beginner

quest(first_creation, 'First Creation', crafting, beginner, active).
quest_assigned_to(first_creation, '{{player}}').
quest_language(first_creation, french).
quest_tag(first_creation, guild_seed).
quest_tag(first_creation, guild_artisans).
quest_tag(first_creation, tier_1).

quest_objective(first_creation, 0, craft_item(, 1)).



quest_reward(first_creation, experience, 100).

% Can Player take this quest?
quest_available(Player, first_creation) :-
    quest(first_creation, _, _, _, active).

% Quest: Follow the Instructions
% A master craftsman gives you verbal instructions to follow. Listen carefully and complete each step.
% Type: crafting / Difficulty: intermediate

quest(follow_the_instructions, 'Follow the Instructions', crafting, intermediate, active).
quest_assigned_to(follow_the_instructions, '{{player}}').
quest_language(follow_the_instructions, french).
quest_tag(follow_the_instructions, guild_seed).
quest_tag(follow_the_instructions, guild_artisans).
quest_tag(follow_the_instructions, tier_2).

quest_objective(follow_the_instructions, 0, talk_to('{{npc}}', 1)).
quest_objective(follow_the_instructions, 1, craft_item(, 1)).



quest_reward(follow_the_instructions, experience, 150).

% Can Player take this quest?
quest_available(Player, follow_the_instructions) :-
    quest(follow_the_instructions, _, _, _, active).

% Quest: Urgent Delivery
% Deliver crafted goods to customers around the settlement, describing each item.
% Type: delivery / Difficulty: intermediate

quest(urgent_delivery, 'Urgent Delivery', delivery, intermediate, active).
quest_assigned_to(urgent_delivery, '{{player}}').
quest_language(urgent_delivery, french).
quest_tag(urgent_delivery, guild_seed).
quest_tag(urgent_delivery, guild_artisans).
quest_tag(urgent_delivery, tier_2).

quest_objective(urgent_delivery, 0, deliver(, '')).



quest_reward(urgent_delivery, experience, 150).

% Can Player take this quest?
quest_available(Player, urgent_delivery) :-
    quest(urgent_delivery, _, _, _, active).

% Quest: The Herbalist
% Gather herbs and learn their names in the target language.
% Type: herbalism / Difficulty: intermediate

quest(the_herbalist, 'The Herbalist', herbalism, intermediate, active).
quest_assigned_to(the_herbalist, '{{player}}').
quest_language(the_herbalist, french).
quest_tag(the_herbalist, guild_seed).
quest_tag(the_herbalist, guild_artisans).
quest_tag(the_herbalist, tier_2).

quest_objective(the_herbalist, 0, objective('Gather herbs')).
quest_objective(the_herbalist, 1, learn_words_count(1)).



quest_reward(the_herbalist, experience, 175).

% Can Player take this quest?
quest_available(Player, the_herbalist) :-
    quest(the_herbalist, _, _, _, active).

% Quest: Masterwork
% Create a masterwork item by gathering rare materials and following complex instructions from the guild master.
% Type: crafting / Difficulty: advanced

quest(masterwork, 'Masterwork', crafting, advanced, active).
quest_assigned_to(masterwork, '{{player}}').
quest_language(masterwork, french).
quest_tag(masterwork, guild_seed).
quest_tag(masterwork, guild_artisans).
quest_tag(masterwork, tier_3).

quest_objective(masterwork, 0, collect(, 1)).
quest_objective(masterwork, 1, craft_item(, 1)).
quest_objective(masterwork, 2, talk_to('{{npc}}', 1)).



quest_reward(masterwork, experience, 250).

% Can Player take this quest?
quest_available(Player, masterwork) :-
    quest(masterwork, _, _, _, active).

% Quest: The Teacher
% Teach a new apprentice how to craft, explaining each step in the target language.
% Type: crafting / Difficulty: advanced

quest(the_teacher, 'The Teacher', crafting, advanced, active).
quest_assigned_to(the_teacher, '{{player}}').
quest_language(the_teacher, french).
quest_tag(the_teacher, guild_seed).
quest_tag(the_teacher, guild_artisans).
quest_tag(the_teacher, tier_3).

quest_objective(the_teacher, 0, talk_to('{{npc}}', 1)).
quest_objective(the_teacher, 1, learn_words_count(1)).



quest_reward(the_teacher, experience, 300).

% Can Player take this quest?
quest_available(Player, the_teacher) :-
    quest(the_teacher, _, _, _, active).

% Quest: The Library Door
% Visit the Storytellers Guild hall and speak with the head librarian.
% Type: reading / Difficulty: beginner

quest(the_library_door, 'The Library Door', reading, beginner, active).
quest_assigned_to(the_library_door, '{{player}}').
quest_language(the_library_door, french).
quest_tag(the_library_door, guild_seed).
quest_tag(the_library_door, guild_conteurs).
quest_tag(the_library_door, tier_0).

quest_objective(the_library_door, 0, visit_location('{{location}}')).
quest_objective(the_library_door, 1, talk_to('{{npc}}', 1)).



quest_reward(the_library_door, experience, 50).

% Can Player take this quest?
quest_available(Player, the_library_door) :-
    quest(the_library_door, _, _, _, active).

% Quest: First Words
% Read simple signs around the settlement and learn basic vocabulary.
% Type: reading / Difficulty: beginner

quest(first_words, 'First Words', reading, beginner, active).
quest_assigned_to(first_words, '{{player}}').
quest_language(first_words, french).
quest_tag(first_words, guild_seed).
quest_tag(first_words, guild_conteurs).
quest_tag(first_words, tier_1).

quest_objective(first_words, 0, objective('Read signs around town')).



quest_reward(first_words, experience, 75).

% Can Player take this quest?
quest_available(Player, first_words) :-
    quest(first_words, _, _, _, active).

% Quest: The Little Book
% Find and read a beginner-level book, then answer comprehension questions.
% Type: reading / Difficulty: beginner

quest(the_little_book, 'The Little Book', reading, beginner, active).
quest_assigned_to(the_little_book, '{{player}}').
quest_language(the_little_book, french).
quest_tag(the_little_book, guild_seed).
quest_tag(the_little_book, guild_conteurs).
quest_tag(the_little_book, tier_1).

quest_objective(the_little_book, 0, objective('Read a short story')).
quest_objective(the_little_book, 1, objective('Answer questions about the story')).



quest_reward(the_little_book, experience, 100).

% Can Player take this quest?
quest_available(Player, the_little_book) :-
    quest(the_little_book, _, _, _, active).

% Quest: Word Puzzles
% Complete vocabulary exercises with the guild scholar.
% Type: grammar / Difficulty: beginner

quest(word_puzzles, 'Word Puzzles', grammar, beginner, active).
quest_assigned_to(word_puzzles, '{{player}}').
quest_language(word_puzzles, french).
quest_tag(word_puzzles, guild_seed).
quest_tag(word_puzzles, guild_conteurs).
quest_tag(word_puzzles, tier_1).

quest_objective(word_puzzles, 0, learn_words_count(1)).



quest_reward(word_puzzles, experience, 100).

% Can Player take this quest?
quest_available(Player, word_puzzles) :-
    quest(word_puzzles, _, _, _, active).

% Quest: The Village Tale
% Listen to a storyteller’s tale and retell it in your own words.
% Type: reading / Difficulty: intermediate

quest(the_village_tale, 'The Village Tale', reading, intermediate, active).
quest_assigned_to(the_village_tale, '{{player}}').
quest_language(the_village_tale, french).
quest_tag(the_village_tale, guild_seed).
quest_tag(the_village_tale, guild_conteurs).
quest_tag(the_village_tale, tier_2).

quest_objective(the_village_tale, 0, talk_to('{{npc}}', 1)).
quest_objective(the_village_tale, 1, objective('Retell the story in writing')).



quest_reward(the_village_tale, experience, 150).

% Can Player take this quest?
quest_available(Player, the_village_tale) :-
    quest(the_village_tale, _, _, _, active).

% Quest: Proofreading
% Find and correct grammatical errors in a document.
% Type: error_correction / Difficulty: intermediate

quest(proofreading, 'Proofreading', error_correction, intermediate, active).
quest_assigned_to(proofreading, '{{player}}').
quest_language(proofreading, french).
quest_tag(proofreading, guild_seed).
quest_tag(proofreading, guild_conteurs).
quest_tag(proofreading, tier_2).

quest_objective(proofreading, 0, objective('Identify and fix errors')).



quest_reward(proofreading, experience, 150).

% Can Player take this quest?
quest_available(Player, proofreading) :-
    quest(proofreading, _, _, _, active).

% Quest: Manuscript Translation
% Translate a short manuscript passage between languages.
% Type: translation / Difficulty: intermediate

quest(manuscript_translation, 'Manuscript Translation', translation, intermediate, active).
quest_assigned_to(manuscript_translation, '{{player}}').
quest_language(manuscript_translation, french).
quest_tag(manuscript_translation, guild_seed).
quest_tag(manuscript_translation, guild_conteurs).
quest_tag(manuscript_translation, tier_2).

quest_objective(manuscript_translation, 0, objective('Translate the passage')).
quest_objective(manuscript_translation, 1, talk_to('{{npc}}', 1)).



quest_reward(manuscript_translation, experience, 175).

% Can Player take this quest?
quest_available(Player, manuscript_translation) :-
    quest(manuscript_translation, _, _, _, active).

% Quest: The Author
% Write an original short story in the target language and present it to the guild.
% Type: grammar / Difficulty: advanced

quest(the_author, 'The Author', grammar, advanced, active).
quest_assigned_to(the_author, '{{player}}').
quest_language(the_author, french).
quest_tag(the_author, guild_seed).
quest_tag(the_author, guild_conteurs).
quest_tag(the_author, tier_3).

quest_objective(the_author, 0, objective('Write an original story')).
quest_objective(the_author, 1, talk_to('{{npc}}', 1)).



quest_reward(the_author, experience, 250).

% Can Player take this quest?
quest_available(Player, the_author) :-
    quest(the_author, _, _, _, active).

% Quest: The Great Debate
% Participate in a formal debate, arguing a position using advanced grammar and vocabulary.
% Type: grammar / Difficulty: advanced

quest(the_great_debate, 'The Great Debate', grammar, advanced, active).
quest_assigned_to(the_great_debate, '{{player}}').
quest_language(the_great_debate, french).
quest_tag(the_great_debate, guild_seed).
quest_tag(the_great_debate, guild_conteurs).
quest_tag(the_great_debate, tier_3).

quest_objective(the_great_debate, 0, conversation_turns(5)).
quest_objective(the_great_debate, 1, learn_words_count(1)).



quest_reward(the_great_debate, experience, 300).

% Can Player take this quest?
quest_available(Player, the_great_debate) :-
    quest(the_great_debate, _, _, _, active).

% Quest: The First Step
% Visit the Explorers Guild hall and receive your first map.
% Type: exploration / Difficulty: beginner

quest(the_first_step, 'The First Step', exploration, beginner, active).
quest_assigned_to(the_first_step, '{{player}}').
quest_language(the_first_step, french).
quest_tag(the_first_step, guild_seed).
quest_tag(the_first_step, guild_explorateurs).
quest_tag(the_first_step, tier_0).

quest_objective(the_first_step, 0, visit_location('{{location}}')).
quest_objective(the_first_step, 1, talk_to('{{npc}}', 1)).



quest_reward(the_first_step, experience, 50).

% Can Player take this quest?
quest_available(Player, the_first_step) :-
    quest(the_first_step, _, _, _, active).

% Quest: Village Tour
% Visit key locations around the settlement and learn their names.
% Type: exploration / Difficulty: beginner

quest(village_tour, 'Village Tour', exploration, beginner, active).
quest_assigned_to(village_tour, '{{player}}').
quest_language(village_tour, french).
quest_tag(village_tour, guild_seed).
quest_tag(village_tour, guild_explorateurs).
quest_tag(village_tour, tier_1).

quest_objective(village_tour, 0, visit_location('{{location}}')).



quest_reward(village_tour, experience, 75).

% Can Player take this quest?
quest_available(Player, village_tour) :-
    quest(village_tour, _, _, _, active).

% Quest: Ask for Directions
% Ask NPCs for directions to different locations using the target language.
% Type: navigation / Difficulty: beginner

quest(ask_for_directions, 'Ask for Directions', navigation, beginner, active).
quest_assigned_to(ask_for_directions, '{{player}}').
quest_language(ask_for_directions, french).
quest_tag(ask_for_directions, guild_seed).
quest_tag(ask_for_directions, guild_explorateurs).
quest_tag(ask_for_directions, tier_1).

quest_objective(ask_for_directions, 0, objective('Ask NPCs for directions')).



quest_reward(ask_for_directions, experience, 100).

% Can Player take this quest?
quest_available(Player, ask_for_directions) :-
    quest(ask_for_directions, _, _, _, active).

% Quest: Capture the Beauty
% Take photos of interesting locations and describe them.
% Type: photography / Difficulty: beginner

quest(capture_the_beauty, 'Capture the Beauty', photography, beginner, active).
quest_assigned_to(capture_the_beauty, '{{player}}').
quest_language(capture_the_beauty, french).
quest_tag(capture_the_beauty, guild_seed).
quest_tag(capture_the_beauty, guild_explorateurs).
quest_tag(capture_the_beauty, tier_1).

quest_objective(capture_the_beauty, 0, objective('Photograph locations')).



quest_reward(capture_the_beauty, experience, 100).

% Can Player take this quest?
quest_available(Player, capture_the_beauty) :-
    quest(capture_the_beauty, _, _, _, active).

% Quest: Treasure Hunt
% Follow a series of clues written in the target language to find a hidden treasure.
% Type: scavenger_hunt / Difficulty: intermediate

quest(treasure_hunt, 'Treasure Hunt', scavenger_hunt, intermediate, active).
quest_assigned_to(treasure_hunt, '{{player}}').
quest_language(treasure_hunt, french).
quest_tag(treasure_hunt, guild_seed).
quest_tag(treasure_hunt, guild_explorateurs).
quest_tag(treasure_hunt, tier_2).

quest_objective(treasure_hunt, 0, objective('Follow written clues')).
quest_objective(treasure_hunt, 1, collect(, 1)).



quest_reward(treasure_hunt, experience, 150).

% Can Player take this quest?
quest_available(Player, treasure_hunt) :-
    quest(treasure_hunt, _, _, _, active).

% Quest: The Cartographer
% Map unexplored areas by describing what you see to the guild cartographer.
% Type: exploration / Difficulty: intermediate

quest(the_cartographer, 'The Cartographer', exploration, intermediate, active).
quest_assigned_to(the_cartographer, '{{player}}').
quest_language(the_cartographer, french).
quest_tag(the_cartographer, guild_seed).
quest_tag(the_cartographer, guild_explorateurs).
quest_tag(the_cartographer, tier_2).

quest_objective(the_cartographer, 0, discover_location('')).
quest_objective(the_cartographer, 1, objective('Describe what you find')).



quest_reward(the_cartographer, experience, 175).

% Can Player take this quest?
quest_available(Player, the_cartographer) :-
    quest(the_cartographer, _, _, _, active).

% Quest: The Expedition
% Lead an expedition, giving directions to your team and documenting discoveries.
% Type: exploration / Difficulty: advanced

quest(the_expedition, 'The Expedition', exploration, advanced, active).
quest_assigned_to(the_expedition, '{{player}}').
quest_language(the_expedition, french).
quest_tag(the_expedition, guild_seed).
quest_tag(the_expedition, guild_explorateurs).
quest_tag(the_expedition, tier_3).

quest_objective(the_expedition, 0, objective('Navigate a complex route')).
quest_objective(the_expedition, 1, objective('Document your discoveries')).



quest_reward(the_expedition, experience, 250).

% Can Player take this quest?
quest_available(Player, the_expedition) :-
    quest(the_expedition, _, _, _, active).

% Quest: The Tour Guide
% Lead a tour for visitors, describing the history and culture of each location in the target language.
% Type: exploration / Difficulty: advanced

quest(the_tour_guide, 'The Tour Guide', exploration, advanced, active).
quest_assigned_to(the_tour_guide, '{{player}}').
quest_language(the_tour_guide, french).
quest_tag(the_tour_guide, guild_seed).
quest_tag(the_tour_guide, guild_explorateurs).
quest_tag(the_tour_guide, tier_3).

quest_objective(the_tour_guide, 0, talk_to('{{npc}}', 1)).
quest_objective(the_tour_guide, 1, objective('Describe locations in detail')).



quest_reward(the_tour_guide, experience, 300).

% Can Player take this quest?
quest_available(Player, the_tour_guide) :-
    quest(the_tour_guide, _, _, _, active).

% Quest: The Art of Meeting
% Visit the Diplomats Guild hall and learn proper introductions.
% Type: conversation / Difficulty: beginner

quest(the_art_of_meeting, 'The Art of Meeting', conversation, beginner, active).
quest_assigned_to(the_art_of_meeting, '{{player}}').
quest_language(the_art_of_meeting, french).
quest_tag(the_art_of_meeting, guild_seed).
quest_tag(the_art_of_meeting, guild_diplomates).
quest_tag(the_art_of_meeting, tier_0).

quest_objective(the_art_of_meeting, 0, visit_location('{{location}}')).
quest_objective(the_art_of_meeting, 1, objective('Introduce yourself formally')).



quest_reward(the_art_of_meeting, experience, 50).

% Can Player take this quest?
quest_available(Player, the_art_of_meeting) :-
    quest(the_art_of_meeting, _, _, _, active).

% Quest: Greetings
% Greet 5 different NPCs using appropriate formal and informal greetings.
% Type: conversation / Difficulty: beginner

quest(greetings, 'Greetings', conversation, beginner, active).
quest_assigned_to(greetings, '{{player}}').
quest_language(greetings, french).
quest_tag(greetings, guild_seed).
quest_tag(greetings, guild_diplomates).
quest_tag(greetings, tier_1).

quest_objective(greetings, 0, talk_to('{{npc}}', 1)).



quest_reward(greetings, experience, 75).

% Can Player take this quest?
quest_available(Player, greetings) :-
    quest(greetings, _, _, _, active).

% Quest: The Mediator
% Help resolve a disagreement between two NPCs using diplomatic language.
% Type: social / Difficulty: intermediate

quest(the_mediator, 'The Mediator', social, intermediate, active).
quest_assigned_to(the_mediator, '{{player}}').
quest_language(the_mediator, french).
quest_tag(the_mediator, guild_seed).
quest_tag(the_mediator, guild_diplomates).
quest_tag(the_mediator, tier_2).

quest_objective(the_mediator, 0, talk_to('{{npc}}', 1)).
quest_objective(the_mediator, 1, conversation_turns(5)).



quest_reward(the_mediator, experience, 150).

% Can Player take this quest?
quest_available(Player, the_mediator) :-
    quest(the_mediator, _, _, _, active).

% Quest: Local Customs
% Learn about local cultural traditions by speaking with elders.
% Type: cultural / Difficulty: intermediate

quest(local_customs, 'Local Customs', cultural, intermediate, active).
quest_assigned_to(local_customs, '{{player}}').
quest_language(local_customs, french).
quest_tag(local_customs, guild_seed).
quest_tag(local_customs, guild_diplomates).
quest_tag(local_customs, tier_2).

quest_objective(local_customs, 0, talk_to('{{npc}}', 1)).
quest_objective(local_customs, 1, learn_words_count(1)).



quest_reward(local_customs, experience, 175).

% Can Player take this quest?
quest_available(Player, local_customs) :-
    quest(local_customs, _, _, _, active).

% Quest: The Ambassador
% Represent your guild at a formal gathering, using advanced diplomatic language and cultural knowledge.
% Type: social / Difficulty: advanced

quest(the_ambassador, 'The Ambassador', social, advanced, active).
quest_assigned_to(the_ambassador, '{{player}}').
quest_language(the_ambassador, french).
quest_tag(the_ambassador, guild_seed).
quest_tag(the_ambassador, guild_diplomates).
quest_tag(the_ambassador, tier_3).

quest_objective(the_ambassador, 0, conversation_turns(5)).
quest_objective(the_ambassador, 1, learn_words_count(1)).



quest_reward(the_ambassador, experience, 250).

% Can Player take this quest?
quest_available(Player, the_ambassador) :-
    quest(the_ambassador, _, _, _, active).

% Quest: The Summit
% Organize and host a cultural summit, mediating between different perspectives entirely in the target language.
% Type: social / Difficulty: advanced

quest(the_summit, 'The Summit', social, advanced, active).
quest_assigned_to(the_summit, '{{player}}').
quest_language(the_summit, french).
quest_tag(the_summit, guild_seed).
quest_tag(the_summit, guild_diplomates).
quest_tag(the_summit, tier_3).

quest_objective(the_summit, 0, talk_to('{{npc}}', 1)).
quest_objective(the_summit, 1, conversation_turns(5)).



quest_reward(the_summit, experience, 300).

% Can Player take this quest?
quest_available(Player, the_summit) :-
    quest(the_summit, _, _, _, active).

% Quest: Hello, World!
% Learn basic greetings and how to say hello to the people of the town.
% Type: vocabulary / Difficulty: beginner

quest(hello_world, 'Hello, World!', vocabulary, beginner, active).
quest_assigned_to(hello_world, '{{player}}').
quest_language(hello_world, french).
quest_chain_order(hello_world, 0).
quest_tag(hello_world, chain).
quest_tag(hello_world, chain_first_words).
quest_tag(hello_world, greetings).
quest_tag(hello_world, beginner).
quest_tag(hello_world, social).

quest_objective(hello_world, 0, learn_words_count(1)).
quest_objective(hello_world, 1, talk_to('{{npc}}', 1)).



quest_reward(hello_world, experience, 50).

% Can Player take this quest?
quest_available(Player, hello_world) :-
    quest(hello_world, _, _, _, active).

% Quest: Who Am I?
% Learn to introduce yourself — share your name and where you come from.
% Type: conversation / Difficulty: beginner

quest(who_am_i, 'Who Am I?', conversation, beginner, pending).
quest_assigned_to(who_am_i, '{{player}}').
quest_language(who_am_i, french).
quest_chain_order(who_am_i, 1).
quest_tag(who_am_i, chain).
quest_tag(who_am_i, chain_first_words).
quest_tag(who_am_i, introduction).
quest_tag(who_am_i, beginner).
quest_tag(who_am_i, social).

quest_objective(who_am_i, 0, conversation_turns(5)).
quest_objective(who_am_i, 1, learn_words_count(1)).



quest_reward(who_am_i, experience, 75).

% Can Player take this quest?
quest_available(Player, who_am_i) :-
    quest(who_am_i, _, _, _, active).

% Quest: Curious Minds
% Practice asking questions — learn how to ask about people, places, and things.
% Type: grammar / Difficulty: beginner

quest(curious_minds, 'Curious Minds', grammar, beginner, pending).
quest_assigned_to(curious_minds, '{{player}}').
quest_language(curious_minds, french).
quest_chain_order(curious_minds, 2).
quest_tag(curious_minds, chain).
quest_tag(curious_minds, chain_first_words).
quest_tag(curious_minds, questions).
quest_tag(curious_minds, beginner).
quest_tag(curious_minds, grammar).

quest_objective(curious_minds, 0, learn_words_count(1)).
quest_objective(curious_minds, 1, talk_to('{{npc}}', 1)).



quest_reward(curious_minds, experience, 100).

% Can Player take this quest?
quest_available(Player, curious_minds) :-
    quest(curious_minds, _, _, _, active).

% Quest: Painting with Words
% Learn to describe the world around you — colors, sizes, and qualities.
% Type: vocabulary / Difficulty: beginner

quest(painting_with_words, 'Painting with Words', vocabulary, beginner, pending).
quest_assigned_to(painting_with_words, '{{player}}').
quest_language(painting_with_words, french).
quest_chain_order(painting_with_words, 3).
quest_tag(painting_with_words, chain).
quest_tag(painting_with_words, chain_first_words).
quest_tag(painting_with_words, description).
quest_tag(painting_with_words, beginner).
quest_tag(painting_with_words, vocabulary).

quest_objective(painting_with_words, 0, objective('Describe 5 objects using adjectives')).
quest_objective(painting_with_words, 1, learn_words_count(1)).



quest_reward(painting_with_words, experience, 100).

% Can Player take this quest?
quest_available(Player, painting_with_words) :-
    quest(painting_with_words, _, _, _, active).

% Quest: My Story
% Put it all together — tell a short story about yourself and your journey.
% Type: conversation / Difficulty: beginner

quest(my_story, 'My Story', conversation, beginner, pending).
quest_assigned_to(my_story, '{{player}}').
quest_language(my_story, french).
quest_chain_order(my_story, 4).
quest_tag(my_story, chain).
quest_tag(my_story, chain_first_words).
quest_tag(my_story, storytelling).
quest_tag(my_story, beginner).
quest_tag(my_story, conversation).

quest_objective(my_story, 0, conversation_turns(5)).
quest_objective(my_story, 1, learn_words_count(1)).



quest_reward(my_story, experience, 150).

% Can Player take this quest?
quest_available(Player, my_story) :-
    quest(my_story, _, _, _, active).

% Quest: Food for Thought
% Learn the names of common foods and drinks at the market stalls.
% Type: vocabulary / Difficulty: beginner

quest(food_for_thought, 'Food for Thought', vocabulary, beginner, active).
quest_assigned_to(food_for_thought, '{{player}}').
quest_language(food_for_thought, french).
quest_chain_order(food_for_thought, 0).
quest_tag(food_for_thought, chain).
quest_tag(food_for_thought, chain_market_day).
quest_tag(food_for_thought, food).
quest_tag(food_for_thought, beginner).
quest_tag(food_for_thought, vocabulary).

quest_objective(food_for_thought, 0, objective('Learn 8 food-related words')).
quest_objective(food_for_thought, 1, objective('Identify 3 food items by name')).



quest_reward(food_for_thought, experience, 75).

% Can Player take this quest?
quest_available(Player, food_for_thought) :-
    quest(food_for_thought, _, _, _, active).

% Quest: Window Shopping
% Visit the market and talk to vendors about their wares.
% Type: conversation / Difficulty: beginner

quest(window_shopping, 'Window Shopping', conversation, beginner, pending).
quest_assigned_to(window_shopping, '{{player}}').
quest_language(window_shopping, french).
quest_chain_order(window_shopping, 1).
quest_tag(window_shopping, chain).
quest_tag(window_shopping, chain_market_day).
quest_tag(window_shopping, market).
quest_tag(window_shopping, beginner).
quest_tag(window_shopping, social).

quest_objective(window_shopping, 0, visit_location('{{location}}')).
quest_objective(window_shopping, 1, talk_to('{{npc}}', 1)).
quest_objective(window_shopping, 2, learn_words_count(1)).



quest_reward(window_shopping, experience, 100).

% Can Player take this quest?
quest_available(Player, window_shopping) :-
    quest(window_shopping, _, _, _, active).

% Quest: The Big Purchase
% Use your new vocabulary to negotiate and complete a purchase at the market.
% Type: conversation / Difficulty: intermediate

quest(the_big_purchase, 'The Big Purchase', conversation, intermediate, pending).
quest_assigned_to(the_big_purchase, '{{player}}').
quest_language(the_big_purchase, french).
quest_chain_order(the_big_purchase, 2).
quest_tag(the_big_purchase, chain).
quest_tag(the_big_purchase, chain_market_day).
quest_tag(the_big_purchase, commerce).
quest_tag(the_big_purchase, intermediate).
quest_tag(the_big_purchase, conversation).

quest_objective(the_big_purchase, 0, conversation_turns(5)).
quest_objective(the_big_purchase, 1, learn_words_count(1)).
quest_objective(the_big_purchase, 2, collect(, 1)).



quest_reward(the_big_purchase, experience, 150).

% Can Player take this quest?
quest_available(Player, the_big_purchase) :-
    quest(the_big_purchase, _, _, _, active).

% Quest: Follow the Leader
% A townsperson gives you directions — follow them to reach the destination.
% Type: conversation / Difficulty: beginner

quest(follow_the_leader, 'Follow the Leader', conversation, beginner, pending).
quest_assigned_to(follow_the_leader, '{{player}}').
quest_language(follow_the_leader, french).
quest_chain_order(follow_the_leader, 1).
quest_tag(follow_the_leader, chain).
quest_tag(follow_the_leader, chain_town_explorer).
quest_tag(follow_the_leader, directions).
quest_tag(follow_the_leader, beginner).
quest_tag(follow_the_leader, navigation).

quest_objective(follow_the_leader, 0, objective('Follow spoken directions to a destination')).
quest_objective(follow_the_leader, 1, visit_location('{{location}}')).



quest_reward(follow_the_leader, experience, 100).

% Can Player take this quest?
quest_available(Player, follow_the_leader) :-
    quest(follow_the_leader, _, _, _, active).

% Quest: Tour Guide
% A lost visitor asks for help — give them directions to a landmark.
% Type: conversation / Difficulty: intermediate

quest(tour_guide, 'Tour Guide', conversation, intermediate, pending).
quest_assigned_to(tour_guide, '{{player}}').
quest_language(tour_guide, french).
quest_chain_order(tour_guide, 2).
quest_tag(tour_guide, chain).
quest_tag(tour_guide, chain_town_explorer).
quest_tag(tour_guide, directions).
quest_tag(tour_guide, intermediate).
quest_tag(tour_guide, social).

quest_objective(tour_guide, 0, talk_to('{{npc}}', 1)).
quest_objective(tour_guide, 1, objective('Give directions using direction vocabulary')).
quest_objective(tour_guide, 2, learn_words_count(1)).



quest_reward(tour_guide, experience, 125).

% Can Player take this quest?
quest_available(Player, tour_guide) :-
    quest(tour_guide, _, _, _, active).

% Quest: Free Roam
% Navigate to 3 landmarks on your own, asking for help only in the target language.
% Type: conversation / Difficulty: intermediate

quest(free_roam, 'Free Roam', conversation, intermediate, pending).
quest_assigned_to(free_roam, '{{player}}').
quest_language(free_roam, french).
quest_chain_order(free_roam, 3).
quest_tag(free_roam, chain).
quest_tag(free_roam, chain_town_explorer).
quest_tag(free_roam, navigation).
quest_tag(free_roam, intermediate).
quest_tag(free_roam, exploration).

quest_objective(free_roam, 0, discover_location('')).
quest_objective(free_roam, 1, learn_words_count(1)).



quest_reward(free_roam, experience, 150).

% Can Player take this quest?
quest_available(Player, free_roam) :-
    quest(free_roam, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Seed Quests (50 entries)
%% ═══════════════════════════════════════════════════════════

% Quest: Explore the Neighborhood
% Get familiar with the area by visiting a key location.
% Type: navigation / Difficulty: beginner

quest(explore_the_neighborhood, 'Explore the Neighborhood', navigation, beginner, active).
quest_tag(explore_the_neighborhood, seed).
quest_tag(explore_the_neighborhood, objective_type_visit_location).

quest_objective(explore_the_neighborhood, 0, visit_location('{{location}}')).

quest_reward(explore_the_neighborhood, experience, 15).

% Can Player take this quest?
quest_available(Player, explore_the_neighborhood) :-
    quest(explore_the_neighborhood, _, _, _, active).

% Quest: Grand Tour
% Visit three different locations to get a feel for the area.
% Type: exploration / Difficulty: intermediate

quest(grand_tour, 'Grand Tour', exploration, intermediate, active).
quest_tag(grand_tour, seed).
quest_tag(grand_tour, objective_type_visit_location).
quest_tag(grand_tour, multi_step).

quest_objective(grand_tour, 0, visit_location('{{location}}')).
quest_objective(grand_tour, 1, visit_location('{{location_2}}')).
quest_objective(grand_tour, 2, visit_location('{{location_3}}')).

quest_reward(grand_tour, experience, 30).

% Can Player take this quest?
quest_available(Player, grand_tour) :-
    quest(grand_tour, _, _, _, active).

% Quest: Uncharted Territory
% Discover a new location you have not visited before.
% Type: exploration / Difficulty: beginner

quest(uncharted_territory, 'Uncharted Territory', exploration, beginner, active).
quest_tag(uncharted_territory, seed).
quest_tag(uncharted_territory, objective_type_discover_location).

quest_objective(uncharted_territory, 0, discover_location('{{location}}')).

quest_reward(uncharted_territory, experience, 20).

% Can Player take this quest?
quest_available(Player, uncharted_territory) :-
    quest(uncharted_territory, _, _, _, active).

% Quest: Introduce Yourself
% Meet a local resident and introduce yourself.
% Type: conversation / Difficulty: beginner

quest(introduce_yourself, 'Introduce Yourself', conversation, beginner, active).
quest_tag(introduce_yourself, seed).
quest_tag(introduce_yourself, objective_type_talk_to_npc).

quest_objective(introduce_yourself, 0, talk_to('{{npc}}', 1)).

quest_reward(introduce_yourself, experience, 10).

% Can Player take this quest?
quest_available(Player, introduce_yourself) :-
    quest(introduce_yourself, _, _, _, active).

% Quest: Meet the Locals
% Introduce yourself to three different people in the area.
% Type: social / Difficulty: beginner

quest(meet_the_locals, 'Meet the Locals', social, beginner, active).
quest_tag(meet_the_locals, seed).
quest_tag(meet_the_locals, objective_type_talk_to_npc).
quest_tag(meet_the_locals, multi_npc).

quest_objective(meet_the_locals, 0, talk_to('{{npc_0}}', 1)).
quest_objective(meet_the_locals, 1, talk_to('{{npc}}', 1)).
quest_objective(meet_the_locals, 2, talk_to('{{npc_2}}', 1)).

quest_reward(meet_the_locals, experience, 20).

% Can Player take this quest?
quest_available(Player, meet_the_locals) :-
    quest(meet_the_locals, _, _, _, active).

% Quest: A Good Chat
% Have a meaningful conversation with an NPC — keep talking for several turns.
% Type: conversation / Difficulty: beginner

quest(a_good_chat, 'A Good Chat', conversation, beginner, active).
quest_tag(a_good_chat, seed).
quest_tag(a_good_chat, objective_type_complete_conversation).

quest_objective(a_good_chat, 0, talk_to('{{npc}}', 3)).

quest_reward(a_good_chat, experience, 20).

% Can Player take this quest?
quest_available(Player, a_good_chat) :-
    quest(a_good_chat, _, _, _, active).

% Quest: Deep Conversation
% Have an extended conversation of at least 6 turns with a single NPC.
% Type: conversation / Difficulty: intermediate

quest(deep_conversation, 'Deep Conversation', conversation, intermediate, active).
quest_tag(deep_conversation, seed).
quest_tag(deep_conversation, objective_type_complete_conversation).

quest_objective(deep_conversation, 0, talk_to('{{npc}}', 6)).

quest_reward(deep_conversation, experience, 35).

% Can Player take this quest?
quest_available(Player, deep_conversation) :-
    quest(deep_conversation, _, _, _, active).

% Quest: First Impressions
% Introduce yourself to an NPC using the target language.
% Type: conversation / Difficulty: beginner

quest(first_impressions, 'First Impressions', conversation, beginner, active).
quest_tag(first_impressions, seed).
quest_tag(first_impressions, objective_type_introduce_self).

quest_objective(first_impressions, 0, objective('Introduce yourself to {{npc}} in {{targetLanguage}}')).

quest_reward(first_impressions, experience, 15).

% Can Player take this quest?
quest_available(Player, first_impressions) :-
    quest(first_impressions, _, _, _, active).

% Quest: Making Friends
% Build a friendship with a local by having several conversations.
% Type: social / Difficulty: beginner

quest(making_friends, 'Making Friends', social, beginner, active).
quest_tag(making_friends, seed).
quest_tag(making_friends, objective_type_build_friendship).

quest_objective(making_friends, 0, objective('Have 3 conversations with {{npc}} to build a friendship')).

quest_reward(making_friends, experience, 25).

% Can Player take this quest?
quest_available(Player, making_friends) :-
    quest(making_friends, _, _, _, active).

% Quest: A Thoughtful Gift
% Find a gift and present it to a local to strengthen your bond.
% Type: social / Difficulty: intermediate

quest(a_thoughtful_gift, 'A Thoughtful Gift', social, intermediate, active).
quest_tag(a_thoughtful_gift, seed).
quest_tag(a_thoughtful_gift, objective_type_give_gift).

quest_objective(a_thoughtful_gift, 0, objective('Find a gift item')).
quest_objective(a_thoughtful_gift, 1, objective('Present the gift to {{npc}}')).

quest_reward(a_thoughtful_gift, experience, 30).

% Can Player take this quest?
quest_available(Player, a_thoughtful_gift) :-
    quest(a_thoughtful_gift, _, _, _, active).

% Quest: Earn Their Trust
% Build your standing with the community through positive interactions.
% Type: social / Difficulty: intermediate

quest(earn_their_trust, 'Earn Their Trust', social, intermediate, active).
quest_tag(earn_their_trust, seed).
quest_tag(earn_their_trust, objective_type_gain_reputation).

quest_objective(earn_their_trust, 0, objective('Gain reputation with {{settlement}}')).

quest_reward(earn_their_trust, experience, 30).

% Can Player take this quest?
quest_available(Player, earn_their_trust) :-
    quest(earn_their_trust, _, _, _, active).

% Quest: Words in Action
% Use target-language words during a conversation.
% Type: vocabulary / Difficulty: beginner

quest(words_in_action, 'Words in Action', vocabulary, beginner, active).
quest_tag(words_in_action, seed).
quest_tag(words_in_action, objective_type_use_vocabulary).

quest_objective(words_in_action, 0, use_vocabulary('any', 3)).

quest_reward(words_in_action, experience, 20).

% Can Player take this quest?
quest_available(Player, words_in_action) :-
    quest(words_in_action, _, _, _, active).

% Quest: Vocabulary Immersion
% Use many target-language words across multiple conversations.
% Type: vocabulary / Difficulty: intermediate

quest(vocabulary_immersion, 'Vocabulary Immersion', vocabulary, intermediate, active).
quest_tag(vocabulary_immersion, seed).
quest_tag(vocabulary_immersion, objective_type_use_vocabulary).

quest_objective(vocabulary_immersion, 0, use_vocabulary('any', 10)).

quest_reward(vocabulary_immersion, experience, 35).

% Can Player take this quest?
quest_available(Player, vocabulary_immersion) :-
    quest(vocabulary_immersion, _, _, _, active).

% Quest: Word Collector
% Walk around and collect vocabulary words from labeled objects in the world.
% Type: vocabulary / Difficulty: beginner

quest(word_collector, 'Word Collector', vocabulary, beginner, active).
quest_tag(word_collector, seed).
quest_tag(word_collector, objective_type_collect_vocabulary).

quest_objective(word_collector, 0, objective('Collect 3 vocabulary words by approaching labeled objects')).

quest_reward(word_collector, experience, 20).

% Can Player take this quest?
quest_available(Player, word_collector) :-
    quest(word_collector, _, _, _, active).

% Quest: Word Hoarder
% Collect a large number of vocabulary words from the world around you.
% Type: vocabulary / Difficulty: intermediate

quest(word_hoarder, 'Word Hoarder', vocabulary, intermediate, active).
quest_tag(word_hoarder, seed).
quest_tag(word_hoarder, objective_type_collect_vocabulary).

quest_objective(word_hoarder, 0, objective('Collect 8 vocabulary words from the world')).

quest_reward(word_hoarder, experience, 35).

% Can Player take this quest?
quest_available(Player, word_hoarder) :-
    quest(word_hoarder, _, _, _, active).

% Quest: Name That Thing
% Click on objects in the world and type their name in the target language.
% Type: visual_vocabulary / Difficulty: beginner

quest(name_that_thing, 'Name That Thing', visual_vocabulary, beginner, active).
quest_tag(name_that_thing, seed).
quest_tag(name_that_thing, objective_type_identify_object).

quest_objective(name_that_thing, 0, identify_object('any', 3)).

quest_reward(name_that_thing, experience, 20).

% Can Player take this quest?
quest_available(Player, name_that_thing) :-
    quest(name_that_thing, _, _, _, active).

% Quest: Curious Observer
% Examine objects in the world to learn their names in the target language.
% Type: vocabulary / Difficulty: beginner

quest(curious_observer, 'Curious Observer', vocabulary, beginner, active).
quest_tag(curious_observer, seed).
quest_tag(curious_observer, objective_type_examine_object).

quest_objective(curious_observer, 0, objective('Examine 3 objects to learn their {{targetLanguage}} names')).

quest_reward(curious_observer, experience, 15).

% Can Player take this quest?
quest_available(Player, curious_observer) :-
    quest(curious_observer, _, _, _, active).

% Quest: Point and Say
% Click on objects and name them in the target language to practice vocabulary.
% Type: visual_vocabulary / Difficulty: beginner

quest(point_and_say, 'Point and Say', visual_vocabulary, beginner, active).
quest_tag(point_and_say, seed).
quest_tag(point_and_say, objective_type_point_and_name).

quest_objective(point_and_say, 0, objective('Point at 5 objects and name them in {{targetLanguage}}')).

quest_reward(point_and_say, experience, 20).

% Can Player take this quest?
quest_available(Player, point_and_say) :-
    quest(point_and_say, _, _, _, active).

% Quest: Reading Around Town
% Read signs, menus, and other text written in the target language.
% Type: vocabulary / Difficulty: beginner

quest(reading_around_town, 'Reading Around Town', vocabulary, beginner, active).
quest_tag(reading_around_town, seed).
quest_tag(reading_around_town, objective_type_read_sign).

quest_objective(reading_around_town, 0, objective('Read 3 signs or texts written in {{targetLanguage}}')).

quest_reward(reading_around_town, experience, 15).

% Can Player take this quest?
quest_available(Player, reading_around_town) :-
    quest(reading_around_town, _, _, _, active).

% Quest: Grammar in Practice
% Use correct grammar patterns during conversations with NPCs.
% Type: grammar / Difficulty: intermediate

quest(grammar_in_practice, 'Grammar in Practice', grammar, intermediate, active).
quest_tag(grammar_in_practice, seed).
quest_tag(grammar_in_practice, objective_type_use_vocabulary).
quest_tag(grammar_in_practice, grammar).

quest_objective(grammar_in_practice, 0, talk_to('{{npc}}', 3)).
quest_objective(grammar_in_practice, 1, use_vocabulary('any', 5)).

quest_reward(grammar_in_practice, experience, 30).

% Can Player take this quest?
quest_available(Player, grammar_in_practice) :-
    quest(grammar_in_practice, _, _, _, active).

% Quest: Written Word
% Practice writing in the target language by composing responses to prompts.
% Type: grammar / Difficulty: intermediate

quest(written_word, 'Written Word', grammar, intermediate, active).
quest_tag(written_word, seed).
quest_tag(written_word, objective_type_write_response).

quest_objective(written_word, 0, objective('Write 2 responses in {{targetLanguage}}')).

quest_reward(written_word, experience, 30).

% Can Player take this quest?
quest_available(Player, written_word) :-
    quest(written_word, _, _, _, active).

% Quest: Picture This
% Describe what you see around you using the target language.
% Type: grammar / Difficulty: intermediate

quest(picture_this, 'Picture This', grammar, intermediate, active).
quest_tag(picture_this, seed).
quest_tag(picture_this, objective_type_describe_scene).

quest_objective(picture_this, 0, objective('Describe 2 scenes in {{targetLanguage}}')).

quest_reward(picture_this, experience, 25).

% Can Player take this quest?
quest_available(Player, picture_this) :-
    quest(picture_this, _, _, _, active).

% Quest: Story Time
% Listen to an NPC tell a story and answer comprehension questions.
% Type: listening_comprehension / Difficulty: intermediate

quest(story_time, 'Story Time', listening_comprehension, intermediate, active).
quest_tag(story_time, seed).
quest_tag(story_time, objective_type_listening_comprehension).

quest_objective(story_time, 0, objective('Listen to {{npc}}''s story and answer 2 questions correctly')).

quest_reward(story_time, experience, 35).

% Can Player take this quest?
quest_available(Player, story_time) :-
    quest(story_time, _, _, _, active).

% Quest: Parrot Practice
% Listen to an NPC speak and repeat what they say to practice pronunciation.
% Type: listening_comprehension / Difficulty: beginner

quest(parrot_practice, 'Parrot Practice', listening_comprehension, beginner, active).
quest_tag(parrot_practice, seed).
quest_tag(parrot_practice, objective_type_listen_and_repeat).

quest_objective(parrot_practice, 0, objective('Listen to {{npc}} and repeat 3 phrases')).

quest_reward(parrot_practice, experience, 20).

% Can Player take this quest?
quest_available(Player, parrot_practice) :-
    quest(parrot_practice, _, _, _, active).

% Quest: Echo Challenge
% Repeat back longer phrases from NPCs to improve your listening and speaking.
% Type: listening_comprehension / Difficulty: intermediate

quest(echo_challenge, 'Echo Challenge', listening_comprehension, intermediate, active).
quest_tag(echo_challenge, seed).
quest_tag(echo_challenge, objective_type_listen_and_repeat).

quest_objective(echo_challenge, 0, objective('Listen to {{npc}} and repeat 6 phrases')).

quest_reward(echo_challenge, experience, 30).

% Can Player take this quest?
quest_available(Player, echo_challenge) :-
    quest(echo_challenge, _, _, _, active).

% Quest: Lost in Translation
% Translate phrases between English and the target language.
% Type: translation_challenge / Difficulty: intermediate

quest(lost_in_translation, 'Lost in Translation', translation_challenge, intermediate, active).
quest_tag(lost_in_translation, seed).
quest_tag(lost_in_translation, objective_type_translation_challenge).

quest_objective(lost_in_translation, 0, objective('Correctly translate 3 {{targetLanguage}} phrases')).

quest_reward(lost_in_translation, experience, 30).

% Can Player take this quest?
quest_available(Player, lost_in_translation) :-
    quest(lost_in_translation, _, _, _, active).

% Quest: Master Translator
% Translate many phrases accurately to prove your language skills.
% Type: translation_challenge / Difficulty: advanced

quest(master_translator, 'Master Translator', translation_challenge, advanced, active).
quest_tag(master_translator, seed).
quest_tag(master_translator, objective_type_translation_challenge).

quest_objective(master_translator, 0, objective('Correctly translate 8 {{targetLanguage}} phrases')).

quest_reward(master_translator, experience, 45).

% Can Player take this quest?
quest_available(Player, master_translator) :-
    quest(master_translator, _, _, _, active).

% Quest: Say It Right
% Pronounce phrases in the target language and get accuracy feedback.
% Type: pronunciation / Difficulty: intermediate

quest(say_it_right, 'Say It Right', pronunciation, intermediate, active).
quest_tag(say_it_right, seed).
quest_tag(say_it_right, objective_type_pronunciation_check).

quest_objective(say_it_right, 0, objective('Pronounce 3 {{targetLanguage}} phrases with good accuracy')).

quest_reward(say_it_right, experience, 30).

% Can Player take this quest?
quest_available(Player, say_it_right) :-
    quest(say_it_right, _, _, _, active).

% Quest: Fluency Drill
% Pronounce many phrases to build confidence and accuracy.
% Type: pronunciation / Difficulty: advanced

quest(fluency_drill, 'Fluency Drill', pronunciation, advanced, active).
quest_tag(fluency_drill, seed).
quest_tag(fluency_drill, objective_type_pronunciation_check).

quest_objective(fluency_drill, 0, objective('Pronounce 8 {{targetLanguage}} phrases accurately')).

quest_reward(fluency_drill, experience, 40).

% Can Player take this quest?
quest_available(Player, fluency_drill) :-
    quest(fluency_drill, _, _, _, active).

% Quest: Follow the Signs
% Follow directions given in the target language to reach your destination.
% Type: navigation / Difficulty: advanced

quest(follow_the_signs, 'Follow the Signs', navigation, advanced, active).
quest_tag(follow_the_signs, seed).
quest_tag(follow_the_signs, objective_type_navigate_language).

quest_objective(follow_the_signs, 0, objective('Follow {{targetLanguage}} directions to reach {{destination}}')).

quest_reward(follow_the_signs, experience, 40).

% Can Player take this quest?
quest_available(Player, follow_the_signs) :-
    quest(follow_the_signs, _, _, _, active).

% Quest: Direction Master
% An NPC gives you directions in the target language. Follow them step by step.
% Type: follow_instructions / Difficulty: intermediate

quest(direction_master, 'Direction Master', follow_instructions, intermediate, active).
quest_tag(direction_master, seed).
quest_tag(direction_master, objective_type_follow_directions).

quest_objective(direction_master, 0, objective('Follow 3 steps of {{targetLanguage}} directions')).

quest_reward(direction_master, experience, 30).

% Can Player take this quest?
quest_available(Player, direction_master) :-
    quest(direction_master, _, _, _, active).

% Quest: Which Way?
% Ask NPCs for directions using the target language.
% Type: navigation / Difficulty: beginner

quest(which_way, 'Which Way?', navigation, beginner, active).
quest_tag(which_way, seed).
quest_tag(which_way, objective_type_ask_for_directions).

quest_objective(which_way, 0, objective('Ask {{npc}} for directions in {{targetLanguage}}')).

quest_reward(which_way, experience, 20).

% Can Player take this quest?
quest_available(Player, which_way) :-
    quest(which_way, _, _, _, active).

% Quest: Cultural Exchange
% Talk to locals to learn about the customs and culture of the area.
% Type: cultural / Difficulty: beginner

quest(cultural_exchange, 'Cultural Exchange', cultural, beginner, active).
quest_tag(cultural_exchange, seed).
quest_tag(cultural_exchange, objective_type_talk_to_npc).
quest_tag(cultural_exchange, cultural).

quest_objective(cultural_exchange, 0, talk_to('{{npc_0}}', 1)).
quest_objective(cultural_exchange, 1, talk_to('{{npc}}', 1)).

quest_reward(cultural_exchange, experience, 20).

% Can Player take this quest?
quest_available(Player, cultural_exchange) :-
    quest(cultural_exchange, _, _, _, active).

% Quest: Cultural Landmarks
% Visit important cultural locations and examine what you find there.
% Type: cultural / Difficulty: intermediate

quest(cultural_landmarks, 'Cultural Landmarks', cultural, intermediate, active).
quest_tag(cultural_landmarks, seed).
quest_tag(cultural_landmarks, objective_type_visit_location).
quest_tag(cultural_landmarks, cultural).

quest_objective(cultural_landmarks, 0, visit_location('{{location}}')).
quest_objective(cultural_landmarks, 1, visit_location('{{location_2}}')).
quest_objective(cultural_landmarks, 2, objective('Examine a cultural object at one of the locations')).

quest_reward(cultural_landmarks, experience, 30).

% Can Player take this quest?
quest_available(Player, cultural_landmarks) :-
    quest(cultural_landmarks, _, _, _, active).

% Quest: Scavenger Hunt: Basics
% Find and identify objects around town by their target-language names.
% Type: scavenger_hunt / Difficulty: beginner

quest(scavenger_hunt_basics, 'Scavenger Hunt: Basics', scavenger_hunt, beginner, active).
quest_tag(scavenger_hunt_basics, seed).
quest_tag(scavenger_hunt_basics, objective_type_identify_object).

quest_objective(scavenger_hunt_basics, 0, identify_object('any', 3)).
quest_objective(scavenger_hunt_basics, 1, objective('Collect 2 new vocabulary words along the way')).

quest_reward(scavenger_hunt_basics, experience, 25).

% Can Player take this quest?
quest_available(Player, scavenger_hunt_basics) :-
    quest(scavenger_hunt_basics, _, _, _, active).

% Quest: Scavenger Hunt: Collector
% Collect specific items from around the world while learning their names.
% Type: scavenger_hunt / Difficulty: intermediate

quest(scavenger_hunt_collector, 'Scavenger Hunt: Collector', scavenger_hunt, intermediate, active).
quest_tag(scavenger_hunt_collector, seed).
quest_tag(scavenger_hunt_collector, objective_type_collect_item).

quest_objective(scavenger_hunt_collector, 0, objective('Collect 3 items from the world')).
quest_objective(scavenger_hunt_collector, 1, objective('Examine 2 objects to learn their {{targetLanguage}} names')).

quest_reward(scavenger_hunt_collector, experience, 35).

% Can Player take this quest?
quest_available(Player, scavenger_hunt_collector) :-
    quest(scavenger_hunt_collector, _, _, _, active).

% Quest: Scavenger Hunt: Expert
% Find, identify, and name many objects in the target language — a comprehensive vocabulary challenge.
% Type: scavenger_hunt / Difficulty: advanced

quest(scavenger_hunt_expert, 'Scavenger Hunt: Expert', scavenger_hunt, advanced, active).
quest_tag(scavenger_hunt_expert, seed).
quest_tag(scavenger_hunt_expert, objective_type_identify_object).

quest_objective(scavenger_hunt_expert, 0, identify_object('any', 6)).
quest_objective(scavenger_hunt_expert, 1, objective('Point and name 4 additional objects')).
quest_objective(scavenger_hunt_expert, 2, objective('Collect 5 vocabulary words')).

quest_reward(scavenger_hunt_expert, experience, 50).

% Can Player take this quest?
quest_available(Player, scavenger_hunt_expert) :-
    quest(scavenger_hunt_expert, _, _, _, active).

% Quest: Tell Your Story
% Practice narrative skills by having a long conversation where you tell a story about yourself.
% Type: storytelling / Difficulty: intermediate

quest(tell_your_story, 'Tell Your Story', storytelling, intermediate, active).
quest_tag(tell_your_story, seed).
quest_tag(tell_your_story, objective_type_complete_conversation).
quest_tag(tell_your_story, storytelling).
quest_tag(tell_your_story, narrative).

quest_objective(tell_your_story, 0, talk_to('{{npc}}', 5)).

quest_reward(tell_your_story, experience, 35).

% Can Player take this quest?
quest_available(Player, tell_your_story) :-
    quest(tell_your_story, _, _, _, active).

% Quest: Campfire Tales
% Listen to a local tell a story, then retell it in your own words to someone else.
% Type: storytelling / Difficulty: advanced

quest(campfire_tales, 'Campfire Tales', storytelling, advanced, active).
quest_tag(campfire_tales, seed).
quest_tag(campfire_tales, objective_type_complete_conversation).
quest_tag(campfire_tales, storytelling).
quest_tag(campfire_tales, listening).

quest_objective(campfire_tales, 0, objective('Listen to {{npc_0}} tell a story and repeat key phrases')).
quest_objective(campfire_tales, 1, talk_to('{{npc}}', 5)).

quest_reward(campfire_tales, experience, 45).

% Can Player take this quest?
quest_available(Player, campfire_tales) :-
    quest(campfire_tales, _, _, _, active).

% Quest: Lunch Order
% Order food or drinks at a local establishment using the target language.
% Type: conversation / Difficulty: beginner

quest(lunch_order, 'Lunch Order', conversation, beginner, active).
quest_tag(lunch_order, seed).
quest_tag(lunch_order, objective_type_order_food).
quest_tag(lunch_order, commerce).
quest_tag(lunch_order, daily_life).

quest_objective(lunch_order, 0, objective('Order food from {{npc}} in {{targetLanguage}}')).

quest_reward(lunch_order, experience, 20).

% Can Player take this quest?
quest_available(Player, lunch_order) :-
    quest(lunch_order, _, _, _, active).

% Quest: Bargain Hunter
% Negotiate a price with a merchant using the target language.
% Type: conversation / Difficulty: intermediate

quest(bargain_hunter, 'Bargain Hunter', conversation, intermediate, active).
quest_tag(bargain_hunter, seed).
quest_tag(bargain_hunter, objective_type_haggle_price).
quest_tag(bargain_hunter, commerce).

quest_objective(bargain_hunter, 0, objective('Negotiate a price with {{npc}} in {{targetLanguage}}')).

quest_reward(bargain_hunter, experience, 30).

% Can Player take this quest?
quest_available(Player, bargain_hunter) :-
    quest(bargain_hunter, _, _, _, active).

% Quest: Dinner Party
% Order a full meal — appetizer, main course, and drink — using only the target language.
% Type: conversation / Difficulty: intermediate

quest(dinner_party, 'Dinner Party', conversation, intermediate, active).
quest_tag(dinner_party, seed).
quest_tag(dinner_party, objective_type_order_food).
quest_tag(dinner_party, commerce).
quest_tag(dinner_party, daily_life).

quest_objective(dinner_party, 0, objective('Order food from {{npc}} in {{targetLanguage}}')).
quest_objective(dinner_party, 1, use_vocabulary('any', 3)).

quest_reward(dinner_party, experience, 35).

% Can Player take this quest?
quest_available(Player, dinner_party) :-
    quest(dinner_party, _, _, _, active).

% Quest: Gather Supplies
% Collect an item from the world.
% Type: collection / Difficulty: beginner

quest(gather_supplies, 'Gather Supplies', collection, beginner, active).
quest_tag(gather_supplies, seed).
quest_tag(gather_supplies, objective_type_collect_item).

quest_objective(gather_supplies, 0, objective('Pick up an item from the world')).

quest_reward(gather_supplies, experience, 15).

% Can Player take this quest?
quest_available(Player, gather_supplies) :-
    quest(gather_supplies, _, _, _, active).

% Quest: Special Delivery
% Pick up an item and deliver it to an NPC.
% Type: delivery / Difficulty: intermediate

quest(special_delivery, 'Special Delivery', delivery, intermediate, active).
quest_tag(special_delivery, seed).
quest_tag(special_delivery, objective_type_deliver_item).

quest_objective(special_delivery, 0, objective('Pick up the delivery package')).
quest_objective(special_delivery, 1, objective('Deliver the package to {{npc}}')).

quest_reward(special_delivery, experience, 30).

% Can Player take this quest?
quest_available(Player, special_delivery) :-
    quest(special_delivery, _, _, _, active).

% Quest: First Craft
% Craft an item using the crafting system.
% Type: crafting / Difficulty: intermediate

quest(first_craft, 'First Craft', crafting, intermediate, active).
quest_tag(first_craft, seed).
quest_tag(first_craft, objective_type_craft_item).

quest_objective(first_craft, 0, craft_item(craft_any_item_at_a_crafting_station, 1)).

quest_reward(first_craft, experience, 25).

% Can Player take this quest?
quest_available(Player, first_craft) :-
    quest(first_craft, _, _, _, active).

% Quest: Prove Your Mettle
% Defeat an enemy in combat.
% Type: combat / Difficulty: intermediate

quest(prove_your_mettle, 'Prove Your Mettle', combat, intermediate, active).
quest_tag(prove_your_mettle, seed).
quest_tag(prove_your_mettle, objective_type_defeat_enemies).

quest_objective(prove_your_mettle, 0, objective('Defeat 1 enemy')).

quest_reward(prove_your_mettle, experience, 30).

% Can Player take this quest?
quest_available(Player, prove_your_mettle) :-
    quest(prove_your_mettle, _, _, _, active).

% Quest: Safe Passage
% Escort an NPC safely to their destination.
% Type: escort / Difficulty: intermediate

quest(safe_passage, 'Safe Passage', escort, intermediate, active).
quest_tag(safe_passage, seed).
quest_tag(safe_passage, objective_type_escort_npc).

quest_objective(safe_passage, 0, escort('{{npc}}', '{{destination}}')).

quest_reward(safe_passage, experience, 35).

% Can Player take this quest?
quest_available(Player, safe_passage) :-
    quest(safe_passage, _, _, _, active).

% Quest: Newcomer’s Welcome
% Get oriented: visit a location, meet someone, and learn a few words along the way.
% Type: exploration / Difficulty: beginner

quest(newcomer_s_welcome, 'Newcomer''s Welcome', exploration, beginner, active).
quest_tag(newcomer_s_welcome, seed).
quest_tag(newcomer_s_welcome, objective_type_talk_to_npc).
quest_tag(newcomer_s_welcome, composite).
quest_tag(newcomer_s_welcome, onboarding).

quest_objective(newcomer_s_welcome, 0, visit_location('{{location}}')).
quest_objective(newcomer_s_welcome, 1, talk_to('{{npc}}', 1)).
quest_objective(newcomer_s_welcome, 2, objective('Collect 2 vocabulary words')).

quest_reward(newcomer_s_welcome, experience, 30).

% Can Player take this quest?
quest_available(Player, newcomer_s_welcome) :-
    quest(newcomer_s_welcome, _, _, _, active).

% Quest: The Full Experience
% Visit a location, have a conversation, use vocabulary, and identify an object — a well-rounded language challenge.
% Type: conversation / Difficulty: intermediate

quest(the_full_experience, 'The Full Experience', conversation, intermediate, active).
quest_tag(the_full_experience, seed).
quest_tag(the_full_experience, objective_type_complete_conversation).
quest_tag(the_full_experience, composite).

quest_objective(the_full_experience, 0, visit_location('{{location}}')).
quest_objective(the_full_experience, 1, talk_to('{{npc}}', 3)).
quest_objective(the_full_experience, 2, use_vocabulary('any', 3)).
quest_objective(the_full_experience, 3, identify_object('any', 1)).

quest_reward(the_full_experience, experience, 45).

% Can Player take this quest?
quest_available(Player, the_full_experience) :-
    quest(the_full_experience, _, _, _, active).

% Quest: Language Explorer
% Explore a new area, read signs, examine objects, and talk to people — all in the target language.
% Type: exploration / Difficulty: advanced

quest(language_explorer, 'Language Explorer', exploration, advanced, active).
quest_tag(language_explorer, seed).
quest_tag(language_explorer, objective_type_use_vocabulary).
quest_tag(language_explorer, composite).
quest_tag(language_explorer, immersion).

quest_objective(language_explorer, 0, visit_location('{{location}}')).
quest_objective(language_explorer, 1, visit_location('{{location_2}}')).
quest_objective(language_explorer, 2, objective('Read 2 signs in {{targetLanguage}}')).
quest_objective(language_explorer, 3, objective('Examine 2 objects')).
quest_objective(language_explorer, 4, talk_to('{{npc}}', 4)).
quest_objective(language_explorer, 5, use_vocabulary('any', 5)).

quest_reward(language_explorer, experience, 55).

% Can Player take this quest?
quest_available(Player, language_explorer) :-
    quest(language_explorer, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Guild Quests
%% ═══════════════════════════════════════════════════════════

%% ─── Merchants Guild (9 quests) ───

% Quest: Welcome to the Market
% Visit the Merchants Guild hall and introduce yourself to the guild master.
% Type: vocabulary / Difficulty: beginner

quest(welcome_to_the_market, 'Welcome to the Market', vocabulary, beginner, active).
quest_title_fr(welcome_to_the_market, 'Bienvenue au Marché').
quest_cefr_level(welcome_to_the_market, a1).
quest_guild(welcome_to_the_market, marchands).
quest_guild_tier(welcome_to_the_market, 0).

quest_objective(welcome_to_the_market, 0, visit_location('{{guild:marchands}}')).
quest_objective(welcome_to_the_market, 1, talk_to('{{npc}}', 1)).

quest_reward(welcome_to_the_market, experience, 50).

% Can Player take this quest?
quest_available(Player, welcome_to_the_market) :-
    quest(welcome_to_the_market, _, _, _, active).

% Quest: Numbers of Commerce
% Learn to count and use numbers when shopping at the market.
% Type: number_practice / Difficulty: beginner

quest(numbers_of_commerce, 'Numbers of Commerce', number_practice, beginner, active).
quest_title_fr(numbers_of_commerce, 'Les Chiffres du Commerce').
quest_cefr_level(numbers_of_commerce, a1).
quest_guild(numbers_of_commerce, marchands).
quest_guild_tier(numbers_of_commerce, 1).

quest_objective(numbers_of_commerce, 0, use_vocabulary('any', 5)).

quest_reward(numbers_of_commerce, experience, 75).

% Can Player take this quest?
quest_available(Player, numbers_of_commerce) :-
    quest(numbers_of_commerce, _, _, _, active).

% Quest: Order a Meal
% Visit a restaurant and order a meal entirely in the target language.
% Type: shopping / Difficulty: beginner

quest(order_a_meal, 'Order a Meal', shopping, beginner, active).
quest_title_fr(order_a_meal, 'Commander un Repas').
quest_cefr_level(order_a_meal, a1).
quest_guild(order_a_meal, marchands).
quest_guild_tier(order_a_meal, 1).

quest_objective(order_a_meal, 0, objective('Order food at a restaurant')).
quest_objective(order_a_meal, 1, use_vocabulary('any', 3)).

quest_reward(order_a_meal, experience, 100).

% Can Player take this quest?
quest_available(Player, order_a_meal) :-
    quest(order_a_meal, _, _, _, active).

% Quest: Go Shopping
% Buy three items from different shops, asking for each by name.
% Type: shopping / Difficulty: beginner

quest(go_shopping, 'Go Shopping', shopping, beginner, active).
quest_title_fr(go_shopping, 'Faire les Courses').
quest_cefr_level(go_shopping, a1).
quest_guild(go_shopping, marchands).
quest_guild_tier(go_shopping, 1).

quest_objective(go_shopping, 0, buy_item('Purchase items from shops', 3)).

quest_reward(go_shopping, experience, 100).

% Can Player take this quest?
quest_available(Player, go_shopping) :-
    quest(go_shopping, _, _, _, active).

% Quest: Haggling
% Negotiate prices with merchants using polite bargaining phrases.
% Type: business_roleplay / Difficulty: intermediate

quest(haggling, 'Haggling', business_roleplay, intermediate, active).
quest_title_fr(haggling, 'Le Marchandage').
quest_cefr_level(haggling, a2).
quest_guild(haggling, marchands).
quest_guild_tier(haggling, 2).

quest_objective(haggling, 0, objective('Successfully haggle with a merchant')).
quest_objective(haggling, 1, use_vocabulary('any', 4)).

quest_reward(haggling, experience, 150).

% Can Player take this quest?
quest_available(Player, haggling) :-
    quest(haggling, _, _, _, active).

% Quest: Shop Inventory
% Help a shopkeeper count and name all items in their store.
% Type: number_practice / Difficulty: intermediate

quest(shop_inventory, 'Shop Inventory', number_practice, intermediate, active).
quest_title_fr(shop_inventory, 'Inventaire de la Boutique').
quest_cefr_level(shop_inventory, a2).
quest_guild(shop_inventory, marchands).
quest_guild_tier(shop_inventory, 2).

quest_objective(shop_inventory, 0, use_vocabulary('any', 10)).
quest_objective(shop_inventory, 1, talk_to('{{npc}}', 1)).

quest_reward(shop_inventory, experience, 150).

% Can Player take this quest?
quest_available(Player, shop_inventory) :-
    quest(shop_inventory, _, _, _, active).

% Quest: Secret Recipe
% Gather ingredients from different vendors, asking for each in the target language.
% Type: shopping / Difficulty: intermediate

quest(secret_recipe, 'Secret Recipe', shopping, intermediate, active).
quest_title_fr(secret_recipe, 'Recette Secrète').
quest_cefr_level(secret_recipe, a2).
quest_guild(secret_recipe, marchands).
quest_guild_tier(secret_recipe, 2).

quest_objective(secret_recipe, 0, objective('Collect recipe ingredients')).
quest_objective(secret_recipe, 1, use_vocabulary('any', 4)).

quest_reward(secret_recipe, experience, 175).

% Can Player take this quest?
quest_available(Player, secret_recipe) :-
    quest(secret_recipe, _, _, _, active).

% Quest: The Grand Market
% Organize a market day: negotiate with vendors, set prices, and serve customers.
% Type: business_roleplay / Difficulty: advanced

quest(the_grand_market, 'The Grand Market', business_roleplay, advanced, active).
quest_title_fr(the_grand_market, 'Le Grand Marché').
quest_cefr_level(the_grand_market, b1).
quest_guild(the_grand_market, marchands).
quest_guild_tier(the_grand_market, 3).

quest_objective(the_grand_market, 0, talk_to('{{npc}}', 3)).
quest_objective(the_grand_market, 1, objective('Set fair prices for goods')).

quest_reward(the_grand_market, experience, 250).

% Can Player take this quest?
quest_available(Player, the_grand_market) :-
    quest(the_grand_market, _, _, _, active).

% Quest: Master Trader
% Complete a complex multi-step trade route, buying low and selling high across the settlement.
% Type: business_roleplay / Difficulty: advanced

quest(master_trader, 'Master Trader', business_roleplay, advanced, active).
quest_title_fr(master_trader, 'Maître des Échanges').
quest_cefr_level(master_trader, b2).
quest_guild(master_trader, marchands).
quest_guild_tier(master_trader, 3).

quest_objective(master_trader, 0, buy_item('Buy trade goods', 3)).
quest_objective(master_trader, 1, objective('Sell for profit')).

quest_reward(master_trader, experience, 300).

% Can Player take this quest?
quest_available(Player, master_trader) :-
    quest(master_trader, _, _, _, active).

%% ─── Artisans Guild (9 quests) ───

% Quest: The Apprentice Artisan
% Visit the Artisans Guild hall and meet the master craftsman.
% Type: crafting / Difficulty: beginner

quest(the_apprentice_artisan, 'The Apprentice Artisan', crafting, beginner, active).
quest_title_fr(the_apprentice_artisan, 'L''Apprenti Artisan').
quest_cefr_level(the_apprentice_artisan, a1).
quest_guild(the_apprentice_artisan, artisans).
quest_guild_tier(the_apprentice_artisan, 0).

quest_objective(the_apprentice_artisan, 0, visit_location('{{guild:artisans}}')).
quest_objective(the_apprentice_artisan, 1, talk_to('{{npc}}', 1)).

quest_reward(the_apprentice_artisan, experience, 50).

% Can Player take this quest?
quest_available(Player, the_apprentice_artisan) :-
    quest(the_apprentice_artisan, _, _, _, active).

% Quest: Know Your Tools
% Learn the names of common tools by examining them at the workshop.
% Type: crafting / Difficulty: beginner

quest(know_your_tools, 'Know Your Tools', crafting, beginner, active).
quest_title_fr(know_your_tools, 'Connaître ses Outils').
quest_cefr_level(know_your_tools, a1).
quest_guild(know_your_tools, artisans).
quest_guild_tier(know_your_tools, 1).

quest_objective(know_your_tools, 0, objective('Examine workshop tools')).
quest_objective(know_your_tools, 1, objective('Name each tool in target language')).

quest_reward(know_your_tools, experience, 75).

% Can Player take this quest?
quest_available(Player, know_your_tools) :-
    quest(know_your_tools, _, _, _, active).

% Quest: Gathering Materials
% Collect crafting materials from around the settlement.
% Type: collection / Difficulty: beginner

quest(gathering_materials, 'Gathering Materials', collection, beginner, active).
quest_title_fr(gathering_materials, 'Collecte de Matériaux').
quest_cefr_level(gathering_materials, a1).
quest_guild(gathering_materials, artisans).
quest_guild_tier(gathering_materials, 1).

quest_objective(gathering_materials, 0, objective('Gather crafting materials')).

quest_reward(gathering_materials, experience, 100).

% Can Player take this quest?
quest_available(Player, gathering_materials) :-
    quest(gathering_materials, _, _, _, active).

% Quest: First Creation
% Craft your first item using the workshop tools.
% Type: crafting / Difficulty: beginner

quest(first_creation, 'First Creation', crafting, beginner, active).
quest_title_fr(first_creation, 'Première Création').
quest_cefr_level(first_creation, a1).
quest_guild(first_creation, artisans).
quest_guild_tier(first_creation, 1).

quest_objective(first_creation, 0, craft_item(craft_an_item_at_the_workshop, 1)).

quest_reward(first_creation, experience, 100).

% Can Player take this quest?
quest_available(Player, first_creation) :-
    quest(first_creation, _, _, _, active).

% Quest: Follow the Instructions
% A master craftsman gives you verbal instructions to follow. Listen carefully and complete each step.
% Type: crafting / Difficulty: intermediate

quest(follow_the_instructions, 'Follow the Instructions', crafting, intermediate, active).
quest_title_fr(follow_the_instructions, 'Suivre les Instructions').
quest_cefr_level(follow_the_instructions, a2).
quest_guild(follow_the_instructions, artisans).
quest_guild_tier(follow_the_instructions, 2).

quest_objective(follow_the_instructions, 0, talk_to('{{npc}}', 1)).
quest_objective(follow_the_instructions, 1, craft_item(follow_instructions_to_craft, 2)).

quest_reward(follow_the_instructions, experience, 150).

% Can Player take this quest?
quest_available(Player, follow_the_instructions) :-
    quest(follow_the_instructions, _, _, _, active).

% Quest: Urgent Delivery
% Deliver crafted goods to customers around the settlement, describing each item.
% Type: delivery / Difficulty: intermediate

quest(urgent_delivery, 'Urgent Delivery', delivery, intermediate, active).
quest_title_fr(urgent_delivery, 'Livraison Urgente').
quest_cefr_level(urgent_delivery, a2).
quest_guild(urgent_delivery, artisans).
quest_guild_tier(urgent_delivery, 2).

quest_objective(urgent_delivery, 0, objective('Deliver items to customers')).

quest_reward(urgent_delivery, experience, 150).

% Can Player take this quest?
quest_available(Player, urgent_delivery) :-
    quest(urgent_delivery, _, _, _, active).

% Quest: The Herbalist
% Gather herbs and learn their names in the target language.
% Type: herbalism / Difficulty: intermediate

quest(the_herbalist, 'The Herbalist', herbalism, intermediate, active).
quest_title_fr(the_herbalist, 'L''Herboriste').
quest_cefr_level(the_herbalist, a2).
quest_guild(the_herbalist, artisans).
quest_guild_tier(the_herbalist, 2).

quest_objective(the_herbalist, 0, objective('Gather herbs')).
quest_objective(the_herbalist, 1, use_vocabulary('any', 4)).

quest_reward(the_herbalist, experience, 175).

% Can Player take this quest?
quest_available(Player, the_herbalist) :-
    quest(the_herbalist, _, _, _, active).

% Quest: Masterwork
% Create a masterwork item by gathering rare materials and following complex instructions from the guild master.
% Type: crafting / Difficulty: advanced

quest(masterwork, 'Masterwork', crafting, advanced, active).
quest_title_fr(masterwork, 'Chef-d''Œuvre').
quest_cefr_level(masterwork, b1).
quest_guild(masterwork, artisans).
quest_guild_tier(masterwork, 3).

quest_objective(masterwork, 0, objective('Gather rare materials')).
quest_objective(masterwork, 1, craft_item(craft_the_masterwork, 1)).
quest_objective(masterwork, 2, talk_to('{{npc}}', 1)).

quest_reward(masterwork, experience, 250).

% Can Player take this quest?
quest_available(Player, masterwork) :-
    quest(masterwork, _, _, _, active).

% Quest: The Teacher
% Teach a new apprentice how to craft, explaining each step in the target language.
% Type: crafting / Difficulty: advanced

quest(the_teacher, 'The Teacher', crafting, advanced, active).
quest_title_fr(the_teacher, 'L''Enseignant').
quest_cefr_level(the_teacher, b2).
quest_guild(the_teacher, artisans).
quest_guild_tier(the_teacher, 3).

quest_objective(the_teacher, 0, talk_to('{{npc}}', 1)).
quest_objective(the_teacher, 1, use_vocabulary('any', 8)).

quest_reward(the_teacher, experience, 300).

% Can Player take this quest?
quest_available(Player, the_teacher) :-
    quest(the_teacher, _, _, _, active).

%% ─── Storytellers Guild (9 quests) ───

% Quest: The Library Door
% Visit the Storytellers Guild hall and speak with the head librarian.
% Type: reading / Difficulty: beginner

quest(the_library_door, 'The Library Door', reading, beginner, active).
quest_title_fr(the_library_door, 'La Porte de la Bibliothèque').
quest_cefr_level(the_library_door, a1).
quest_guild(the_library_door, conteurs).
quest_guild_tier(the_library_door, 0).

quest_objective(the_library_door, 0, visit_location('{{guild:conteurs}}')).
quest_objective(the_library_door, 1, talk_to('{{npc}}', 1)).

quest_reward(the_library_door, experience, 50).

% Can Player take this quest?
quest_available(Player, the_library_door) :-
    quest(the_library_door, _, _, _, active).

% Quest: First Words
% Read simple signs around the settlement and learn basic vocabulary.
% Type: reading / Difficulty: beginner

quest(first_words, 'First Words', reading, beginner, active).
quest_title_fr(first_words, 'Premiers Mots').
quest_cefr_level(first_words, a1).
quest_guild(first_words, conteurs).
quest_guild_tier(first_words, 1).

quest_objective(first_words, 0, objective('Read signs around town')).

quest_reward(first_words, experience, 75).

% Can Player take this quest?
quest_available(Player, first_words) :-
    quest(first_words, _, _, _, active).

% Quest: The Little Book
% Find and read a beginner-level book, then answer comprehension questions.
% Type: reading / Difficulty: beginner

quest(the_little_book, 'The Little Book', reading, beginner, active).
quest_title_fr(the_little_book, 'Le Petit Livre').
quest_cefr_level(the_little_book, a1).
quest_guild(the_little_book, conteurs).
quest_guild_tier(the_little_book, 1).

quest_objective(the_little_book, 0, read_text('Read a short story')).
quest_objective(the_little_book, 1, objective('Answer questions about the story')).

quest_reward(the_little_book, experience, 100).

% Can Player take this quest?
quest_available(Player, the_little_book) :-
    quest(the_little_book, _, _, _, active).

% Quest: Word Puzzles
% Complete vocabulary exercises with the guild scholar.
% Type: grammar / Difficulty: beginner

quest(word_puzzles, 'Word Puzzles', grammar, beginner, active).
quest_title_fr(word_puzzles, 'Les Mots Croisés').
quest_cefr_level(word_puzzles, a1).
quest_guild(word_puzzles, conteurs).
quest_guild_tier(word_puzzles, 1).

quest_objective(word_puzzles, 0, use_vocabulary('any', 8)).

quest_reward(word_puzzles, experience, 100).

% Can Player take this quest?
quest_available(Player, word_puzzles) :-
    quest(word_puzzles, _, _, _, active).

% Quest: The Village Tale
% Listen to a storyteller’s tale and retell it in your own words.
% Type: reading / Difficulty: intermediate

quest(the_village_tale, 'The Village Tale', reading, intermediate, active).
quest_title_fr(the_village_tale, 'Le Conte du Village').
quest_cefr_level(the_village_tale, a2).
quest_guild(the_village_tale, conteurs).
quest_guild_tier(the_village_tale, 2).

quest_objective(the_village_tale, 0, talk_to('{{npc}}', 1)).
quest_objective(the_village_tale, 1, objective('Retell the story in writing')).

quest_reward(the_village_tale, experience, 150).

% Can Player take this quest?
quest_available(Player, the_village_tale) :-
    quest(the_village_tale, _, _, _, active).

% Quest: Proofreading
% Find and correct grammatical errors in a document.
% Type: error_correction / Difficulty: intermediate

quest(proofreading, 'Proofreading', error_correction, intermediate, active).
quest_title_fr(proofreading, 'Correction d''Épreuves').
quest_cefr_level(proofreading, a2).
quest_guild(proofreading, conteurs).
quest_guild_tier(proofreading, 2).

quest_objective(proofreading, 0, objective('Identify and fix errors')).

quest_reward(proofreading, experience, 150).

% Can Player take this quest?
quest_available(Player, proofreading) :-
    quest(proofreading, _, _, _, active).

% Quest: Manuscript Translation
% Translate a short manuscript passage between languages.
% Type: translation / Difficulty: intermediate

quest(manuscript_translation, 'Manuscript Translation', translation, intermediate, active).
quest_title_fr(manuscript_translation, 'Traduction du Manuscrit').
quest_cefr_level(manuscript_translation, a2).
quest_guild(manuscript_translation, conteurs).
quest_guild_tier(manuscript_translation, 2).

quest_objective(manuscript_translation, 0, objective('Translate the passage')).
quest_objective(manuscript_translation, 1, talk_to('{{npc}}', 1)).

quest_reward(manuscript_translation, experience, 175).

% Can Player take this quest?
quest_available(Player, manuscript_translation) :-
    quest(manuscript_translation, _, _, _, active).

% Quest: The Author
% Write an original short story in the target language and present it to the guild.
% Type: grammar / Difficulty: advanced

quest(the_author, 'The Author', grammar, advanced, active).
quest_title_fr(the_author, 'L''Auteur').
quest_cefr_level(the_author, b1).
quest_guild(the_author, conteurs).
quest_guild_tier(the_author, 3).

quest_objective(the_author, 0, objective('Write an original story')).
quest_objective(the_author, 1, talk_to('{{npc}}', 2)).

quest_reward(the_author, experience, 250).

% Can Player take this quest?
quest_available(Player, the_author) :-
    quest(the_author, _, _, _, active).

% Quest: The Great Debate
% Participate in a formal debate, arguing a position using advanced grammar and vocabulary.
% Type: grammar / Difficulty: advanced

quest(the_great_debate, 'The Great Debate', grammar, advanced, active).
quest_title_fr(the_great_debate, 'Le Grand Débat').
quest_cefr_level(the_great_debate, b2).
quest_guild(the_great_debate, conteurs).
quest_guild_tier(the_great_debate, 3).

quest_objective(the_great_debate, 0, talk_to('{{npc}}', 1)).
quest_objective(the_great_debate, 1, use_vocabulary('any', 10)).

quest_reward(the_great_debate, experience, 300).

% Can Player take this quest?
quest_available(Player, the_great_debate) :-
    quest(the_great_debate, _, _, _, active).

%% ─── Explorers Guild (8 quests) ───

% Quest: The First Step
% Visit the Explorers Guild hall and receive your first map.
% Type: exploration / Difficulty: beginner

quest(the_first_step, 'The First Step', exploration, beginner, active).
quest_title_fr(the_first_step, 'Le Premier Pas').
quest_cefr_level(the_first_step, a1).
quest_guild(the_first_step, explorateurs).
quest_guild_tier(the_first_step, 0).

quest_objective(the_first_step, 0, visit_location('{{guild:explorateurs}}')).
quest_objective(the_first_step, 1, talk_to('{{npc}}', 1)).

quest_reward(the_first_step, experience, 50).

% Can Player take this quest?
quest_available(Player, the_first_step) :-
    quest(the_first_step, _, _, _, active).

% Quest: Village Tour
% Visit key locations around the settlement and learn their names.
% Type: exploration / Difficulty: beginner

quest(village_tour, 'Village Tour', exploration, beginner, active).
quest_title_fr(village_tour, 'Tour du Village').
quest_cefr_level(village_tour, a1).
quest_guild(village_tour, explorateurs).
quest_guild_tier(village_tour, 1).

quest_objective(village_tour, 0, visit_location('Visit settlement landmarks')).

quest_reward(village_tour, experience, 75).

% Can Player take this quest?
quest_available(Player, village_tour) :-
    quest(village_tour, _, _, _, active).

% Quest: Ask for Directions
% Ask NPCs for directions to different locations using the target language.
% Type: navigation / Difficulty: beginner

quest(ask_for_directions, 'Ask for Directions', navigation, beginner, active).
quest_title_fr(ask_for_directions, 'Demander son Chemin').
quest_cefr_level(ask_for_directions, a1).
quest_guild(ask_for_directions, explorateurs).
quest_guild_tier(ask_for_directions, 1).

quest_objective(ask_for_directions, 0, objective('Ask NPCs for directions')).

quest_reward(ask_for_directions, experience, 100).

% Can Player take this quest?
quest_available(Player, ask_for_directions) :-
    quest(ask_for_directions, _, _, _, active).

% Quest: Capture the Beauty
% Take photos of interesting locations and describe them.
% Type: photography / Difficulty: beginner

quest(capture_the_beauty, 'Capture the Beauty', photography, beginner, active).
quest_title_fr(capture_the_beauty, 'Capturer la Beauté').
quest_cefr_level(capture_the_beauty, a1).
quest_guild(capture_the_beauty, explorateurs).
quest_guild_tier(capture_the_beauty, 1).

quest_objective(capture_the_beauty, 0, objective('Photograph locations')).

quest_reward(capture_the_beauty, experience, 100).

% Can Player take this quest?
quest_available(Player, capture_the_beauty) :-
    quest(capture_the_beauty, _, _, _, active).

% Quest: Treasure Hunt
% Follow a series of clues written in the target language to find a hidden treasure.
% Type: scavenger_hunt / Difficulty: intermediate

quest(treasure_hunt, 'Treasure Hunt', scavenger_hunt, intermediate, active).
quest_title_fr(treasure_hunt, 'Chasse au Trésor').
quest_cefr_level(treasure_hunt, a2).
quest_guild(treasure_hunt, explorateurs).
quest_guild_tier(treasure_hunt, 2).

quest_objective(treasure_hunt, 0, objective('Follow written clues')).
quest_objective(treasure_hunt, 1, objective('Find the treasure')).

quest_reward(treasure_hunt, experience, 150).

% Can Player take this quest?
quest_available(Player, treasure_hunt) :-
    quest(treasure_hunt, _, _, _, active).

% Quest: The Cartographer
% Map unexplored areas by describing what you see to the guild cartographer.
% Type: exploration / Difficulty: intermediate

quest(the_cartographer, 'The Cartographer', exploration, intermediate, active).
quest_title_fr(the_cartographer, 'Le Cartographe').
quest_cefr_level(the_cartographer, a2).
quest_guild(the_cartographer, explorateurs).
quest_guild_tier(the_cartographer, 2).

quest_objective(the_cartographer, 0, discover_location('Discover new locations')).
quest_objective(the_cartographer, 1, objective('Describe what you find')).

quest_reward(the_cartographer, experience, 175).

% Can Player take this quest?
quest_available(Player, the_cartographer) :-
    quest(the_cartographer, _, _, _, active).

% Quest: The Expedition
% Lead an expedition, giving directions to your team and documenting discoveries.
% Type: exploration / Difficulty: advanced

quest(the_expedition, 'The Expedition', exploration, advanced, active).
quest_title_fr(the_expedition, 'L''Expédition').
quest_cefr_level(the_expedition, b1).
quest_guild(the_expedition, explorateurs).
quest_guild_tier(the_expedition, 3).

quest_objective(the_expedition, 0, objective('Navigate a complex route')).
quest_objective(the_expedition, 1, objective('Document your discoveries')).

quest_reward(the_expedition, experience, 250).

% Can Player take this quest?
quest_available(Player, the_expedition) :-
    quest(the_expedition, _, _, _, active).

% Quest: The Tour Guide
% Lead a tour for visitors, describing the history and culture of each location in the target language.
% Type: exploration / Difficulty: advanced

quest(the_tour_guide, 'The Tour Guide', exploration, advanced, active).
quest_title_fr(the_tour_guide, 'Le Guide Touristique').
quest_cefr_level(the_tour_guide, b2).
quest_guild(the_tour_guide, explorateurs).
quest_guild_tier(the_tour_guide, 3).

quest_objective(the_tour_guide, 0, talk_to('{{npc}}', 4)).
quest_objective(the_tour_guide, 1, objective('Describe locations in detail')).

quest_reward(the_tour_guide, experience, 300).

% Can Player take this quest?
quest_available(Player, the_tour_guide) :-
    quest(the_tour_guide, _, _, _, active).

%% ─── Diplomats Guild (7 quests) ───

% Quest: The Art of Meeting
% Visit the Diplomats Guild hall and learn proper introductions.
% Type: conversation / Difficulty: beginner

quest(the_art_of_meeting, 'The Art of Meeting', conversation, beginner, active).
quest_title_fr(the_art_of_meeting, 'L''Art de la Rencontre').
quest_cefr_level(the_art_of_meeting, a1).
quest_guild(the_art_of_meeting, diplomates).
quest_guild_tier(the_art_of_meeting, 0).

quest_objective(the_art_of_meeting, 0, visit_location('{{guild:diplomates}}')).
quest_objective(the_art_of_meeting, 1, objective('Introduce yourself formally')).

quest_reward(the_art_of_meeting, experience, 50).

% Can Player take this quest?
quest_available(Player, the_art_of_meeting) :-
    quest(the_art_of_meeting, _, _, _, active).

% Quest: Greetings
% Greet 5 different NPCs using appropriate formal and informal greetings.
% Type: conversation / Difficulty: beginner

quest(greetings, 'Greetings', conversation, beginner, active).
quest_title_fr(greetings, 'Salutations').
quest_cefr_level(greetings, a1).
quest_guild(greetings, diplomates).
quest_guild_tier(greetings, 1).

quest_objective(greetings, 0, talk_to('{{npc}}', 5)).

quest_reward(greetings, experience, 75).

% Can Player take this quest?
quest_available(Player, greetings) :-
    quest(greetings, _, _, _, active).

% Quest: Introduce Yourself
% Have conversations where you introduce yourself, stating your name, origin, and interests.
% Type: conversation / Difficulty: beginner

quest(introduce_yourself, 'Introduce Yourself', conversation, beginner, active).
quest_title_fr(introduce_yourself, 'Se Présenter').
quest_cefr_level(introduce_yourself, a1).
quest_guild(introduce_yourself, diplomates).
quest_guild_tier(introduce_yourself, 1).

quest_objective(introduce_yourself, 0, objective('Make introductions')).

quest_reward(introduce_yourself, experience, 100).

% Can Player take this quest?
quest_available(Player, introduce_yourself) :-
    quest(introduce_yourself, _, _, _, active).

% Quest: The Mediator
% Help resolve a disagreement between two NPCs using diplomatic language.
% Type: social / Difficulty: intermediate

quest(the_mediator, 'The Mediator', social, intermediate, active).
quest_title_fr(the_mediator, 'Le Médiateur').
quest_cefr_level(the_mediator, a2).
quest_guild(the_mediator, diplomates).
quest_guild_tier(the_mediator, 2).

quest_objective(the_mediator, 0, talk_to('{{npc}}', 2)).
quest_objective(the_mediator, 1, talk_to('{{npc}}', 1)).

quest_reward(the_mediator, experience, 150).

% Can Player take this quest?
quest_available(Player, the_mediator) :-
    quest(the_mediator, _, _, _, active).

% Quest: Local Customs
% Learn about local cultural traditions by speaking with elders.
% Type: cultural / Difficulty: intermediate

quest(local_customs, 'Local Customs', cultural, intermediate, active).
quest_title_fr(local_customs, 'Coutumes Locales').
quest_cefr_level(local_customs, a2).
quest_guild(local_customs, diplomates).
quest_guild_tier(local_customs, 2).

quest_objective(local_customs, 0, talk_to('{{npc}}', 3)).
quest_objective(local_customs, 1, use_vocabulary('any', 5)).

quest_reward(local_customs, experience, 175).

% Can Player take this quest?
quest_available(Player, local_customs) :-
    quest(local_customs, _, _, _, active).

% Quest: The Ambassador
% Represent your guild at a formal gathering, using advanced diplomatic language and cultural knowledge.
% Type: social / Difficulty: advanced

quest(the_ambassador, 'The Ambassador', social, advanced, active).
quest_title_fr(the_ambassador, 'L''Ambassadeur').
quest_cefr_level(the_ambassador, b1).
quest_guild(the_ambassador, diplomates).
quest_guild_tier(the_ambassador, 3).

quest_objective(the_ambassador, 0, talk_to('{{npc}}', 3)).
quest_objective(the_ambassador, 1, use_vocabulary('any', 8)).

quest_reward(the_ambassador, experience, 250).

% Can Player take this quest?
quest_available(Player, the_ambassador) :-
    quest(the_ambassador, _, _, _, active).

% Quest: The Summit
% Organize and host a cultural summit, mediating between different perspectives entirely in the target language.
% Type: social / Difficulty: advanced

quest(the_summit, 'The Summit', social, advanced, active).
quest_title_fr(the_summit, 'Le Sommet').
quest_cefr_level(the_summit, b2).
quest_guild(the_summit, diplomates).
quest_guild_tier(the_summit, 3).

quest_objective(the_summit, 0, talk_to('{{npc}}', 5)).
quest_objective(the_summit, 1, talk_to('{{npc}}', 1)).

quest_reward(the_summit, experience, 300).

% Can Player take this quest?
quest_available(Player, the_summit) :-
    quest(the_summit, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Quest Chains
%% ═══════════════════════════════════════════════════════════

%% ─── Chain: First Words (5 quests) ───
quest_chain_def(first_words, 'First Words').
quest_chain_category(first_words, vocabulary).
quest_chain_bonus_xp(first_words, 200).
quest_chain_achievement(first_words, 'First Words Master').

% Quest: Hello, World!
% Learn basic greetings and how to say hello to the people of the town.
% Type: vocabulary / Difficulty: beginner

quest(hello_world, 'Hello, World!', vocabulary, beginner, active).
quest_chain(hello_world, first_words).
quest_chain_order(hello_world, 0).
quest_tag(hello_world, greetings).
quest_tag(hello_world, beginner).
quest_tag(hello_world, social).

quest_objective(hello_world, 0, use_vocabulary('greeting', 3)).
quest_objective(hello_world, 1, talk_to('{{npc}}', 2)).
quest_completion(hello_world, criteria('Use 3 greeting words in conversation')).

quest_reward(hello_world, experience, 50).

% Can Player take this quest?
quest_available(Player, hello_world) :-
    quest(hello_world, _, _, _, active).

% Quest: Who Am I?
% Learn to introduce yourself — share your name and where you come from.
% Type: conversation / Difficulty: beginner

quest(who_am_i, 'Who Am I?', conversation, beginner, active).
quest_chain(who_am_i, first_words).
quest_chain_order(who_am_i, 1).
quest_tag(who_am_i, introduction).
quest_tag(who_am_i, beginner).
quest_tag(who_am_i, social).

quest_objective(who_am_i, 0, talk_to('{{npc}}', 1)).
quest_objective(who_am_i, 1, use_vocabulary('introduction', 3)).
quest_completion(who_am_i, criteria('Have a 4-turn introduction conversation')).

quest_reward(who_am_i, experience, 75).

% Can Player take this quest?
quest_available(Player, who_am_i) :-
    quest(who_am_i, _, _, _, active).

% Quest: Curious Minds
% Practice asking questions — learn how to ask about people, places, and things.
% Type: grammar / Difficulty: beginner

quest(curious_minds, 'Curious Minds', grammar, beginner, active).
quest_chain(curious_minds, first_words).
quest_chain_order(curious_minds, 2).
quest_tag(curious_minds, questions).
quest_tag(curious_minds, beginner).
quest_tag(curious_minds, grammar).

quest_objective(curious_minds, 0, use_vocabulary('question', 5)).
quest_objective(curious_minds, 1, talk_to('{{npc}}', 3)).
quest_completion(curious_minds, criteria('Use 5 question words in conversation')).

quest_reward(curious_minds, experience, 100).

% Can Player take this quest?
quest_available(Player, curious_minds) :-
    quest(curious_minds, _, _, _, active).

% Quest: Painting with Words
% Learn to describe the world around you — colors, sizes, and qualities.
% Type: vocabulary / Difficulty: beginner

quest(painting_with_words, 'Painting with Words', vocabulary, beginner, active).
quest_chain(painting_with_words, first_words).
quest_chain_order(painting_with_words, 3).
quest_tag(painting_with_words, description).
quest_tag(painting_with_words, beginner).
quest_tag(painting_with_words, vocabulary).

quest_objective(painting_with_words, 0, identify_object('any', 5)).
quest_objective(painting_with_words, 1, use_vocabulary('adjective', 5)).
quest_completion(painting_with_words, criteria('Use 5 descriptive words')).

quest_reward(painting_with_words, experience, 100).

% Can Player take this quest?
quest_available(Player, painting_with_words) :-
    quest(painting_with_words, _, _, _, active).

% Quest: My Story
% Put it all together — tell a short story about yourself and your journey.
% Type: conversation / Difficulty: beginner

quest(my_story, 'My Story', conversation, beginner, active).
quest_chain(my_story, first_words).
quest_chain_order(my_story, 4).
quest_tag(my_story, storytelling).
quest_tag(my_story, beginner).
quest_tag(my_story, conversation).

quest_objective(my_story, 0, talk_to('{{npc}}', 1)).
quest_objective(my_story, 1, use_vocabulary('mixed', 8)).
quest_completion(my_story, criteria('Have a 6-turn storytelling conversation')).

quest_reward(my_story, experience, 150).

% Can Player take this quest?
quest_available(Player, my_story) :-
    quest(my_story, _, _, _, active).

%% ─── Chain: Market Day (3 quests) ───
quest_chain_def(market_day, 'Market Day').
quest_chain_category(market_day, vocabulary).
quest_chain_bonus_xp(market_day, 150).
quest_chain_achievement(market_day, 'Market Regular').

% Quest: Food for Thought
% Learn the names of common foods and drinks at the market stalls.
% Type: vocabulary / Difficulty: beginner

quest(food_for_thought, 'Food for Thought', vocabulary, beginner, active).
quest_chain(food_for_thought, market_day).
quest_chain_order(food_for_thought, 0).
quest_tag(food_for_thought, food).
quest_tag(food_for_thought, beginner).
quest_tag(food_for_thought, vocabulary).

quest_objective(food_for_thought, 0, objective('Learn 8 food-related words')).
quest_objective(food_for_thought, 1, identify_object('food', 3)).
quest_completion(food_for_thought, criteria('Learn 8 food vocabulary words')).

quest_reward(food_for_thought, experience, 75).

% Can Player take this quest?
quest_available(Player, food_for_thought) :-
    quest(food_for_thought, _, _, _, active).

% Quest: Window Shopping
% Visit the market and talk to vendors about their wares.
% Type: conversation / Difficulty: beginner

quest(window_shopping, 'Window Shopping', conversation, beginner, active).
quest_chain(window_shopping, market_day).
quest_chain_order(window_shopping, 1).
quest_tag(window_shopping, market).
quest_tag(window_shopping, beginner).
quest_tag(window_shopping, social).

quest_objective(window_shopping, 0, visit_location('market')).
quest_objective(window_shopping, 1, talk_to('{{role:vendor}}', 2)).
quest_objective(window_shopping, 2, use_vocabulary('food', 4)).
quest_completion(window_shopping, criteria('Have conversations with market vendors')).

quest_reward(window_shopping, experience, 100).

% Can Player take this quest?
quest_available(Player, window_shopping) :-
    quest(window_shopping, _, _, _, active).

% Quest: The Big Purchase
% Use your new vocabulary to negotiate and complete a purchase at the market.
% Type: conversation / Difficulty: intermediate

quest(the_big_purchase, 'The Big Purchase', conversation, intermediate, active).
quest_chain(the_big_purchase, market_day).
quest_chain_order(the_big_purchase, 2).
quest_tag(the_big_purchase, commerce).
quest_tag(the_big_purchase, intermediate).
quest_tag(the_big_purchase, conversation).

quest_objective(the_big_purchase, 0, talk_to('{{role:vendor}}', 1)).
quest_objective(the_big_purchase, 1, use_vocabulary('commerce', 5)).
quest_objective(the_big_purchase, 2, objective('Receive a purchased item')).
quest_completion(the_big_purchase, criteria('Complete a full purchase transaction')).

quest_reward(the_big_purchase, experience, 150).

% Can Player take this quest?
quest_available(Player, the_big_purchase) :-
    quest(the_big_purchase, _, _, _, active).

%% ─── Chain: Town Explorer (4 quests) ───
quest_chain_def(town_explorer, 'Town Explorer').
quest_chain_category(town_explorer, vocabulary).
quest_chain_bonus_xp(town_explorer, 175).
quest_chain_achievement(town_explorer, 'Town Navigator').

% Quest: Which Way?
% Learn the basic direction words — left, right, forward, back, near, far.
% Type: vocabulary / Difficulty: beginner

quest(which_way, 'Which Way?', vocabulary, beginner, active).
quest_chain(which_way, town_explorer).
quest_chain_order(which_way, 0).
quest_tag(which_way, directions).
quest_tag(which_way, beginner).
quest_tag(which_way, vocabulary).

quest_objective(which_way, 0, objective('Learn 6 direction words')).
quest_objective(which_way, 1, use_vocabulary('direction', 4)).
quest_completion(which_way, criteria('Learn 6 direction words')).

quest_reward(which_way, experience, 75).

% Can Player take this quest?
quest_available(Player, which_way) :-
    quest(which_way, _, _, _, active).

% Quest: Follow the Leader
% A townsperson gives you directions — follow them to reach the destination.
% Type: conversation / Difficulty: beginner

quest(follow_the_leader, 'Follow the Leader', conversation, beginner, active).
quest_chain(follow_the_leader, town_explorer).
quest_chain_order(follow_the_leader, 1).
quest_tag(follow_the_leader, directions).
quest_tag(follow_the_leader, beginner).
quest_tag(follow_the_leader, navigation).

quest_objective(follow_the_leader, 0, objective('Follow spoken directions to a destination')).
quest_objective(follow_the_leader, 1, visit_location('destination')).
quest_completion(follow_the_leader, criteria('Follow directions to reach the destination')).

quest_reward(follow_the_leader, experience, 100).

% Can Player take this quest?
quest_available(Player, follow_the_leader) :-
    quest(follow_the_leader, _, _, _, active).

% Quest: Tour Guide
% A lost visitor asks for help — give them directions to a landmark.
% Type: conversation / Difficulty: intermediate

quest(tour_guide, 'Tour Guide', conversation, intermediate, active).
quest_chain(tour_guide, town_explorer).
quest_chain_order(tour_guide, 2).
quest_tag(tour_guide, directions).
quest_tag(tour_guide, intermediate).
quest_tag(tour_guide, social).

quest_objective(tour_guide, 0, talk_to('visitor', 1)).
quest_objective(tour_guide, 1, objective('Give directions using direction vocabulary')).
quest_objective(tour_guide, 2, use_vocabulary('direction', 5)).
quest_completion(tour_guide, criteria('Give complete directions to the visitor')).

quest_reward(tour_guide, experience, 125).

% Can Player take this quest?
quest_available(Player, tour_guide) :-
    quest(tour_guide, _, _, _, active).

% Quest: Free Roam
% Navigate to 3 landmarks on your own, asking for help only in the target language.
% Type: conversation / Difficulty: intermediate

quest(free_roam, 'Free Roam', conversation, intermediate, active).
quest_chain(free_roam, town_explorer).
quest_chain_order(free_roam, 3).
quest_tag(free_roam, navigation).
quest_tag(free_roam, intermediate).
quest_tag(free_roam, exploration).

quest_objective(free_roam, 0, discover_location('landmark')).
quest_objective(free_roam, 1, use_vocabulary('direction', 6)).
quest_completion(free_roam, criteria('Navigate to 3 landmarks independently')).

quest_reward(free_roam, experience, 150).

% Can Player take this quest?
quest_available(Player, free_roam) :-
    quest(free_roam, _, _, _, active).

%% ─── Chain: The Missing Writer (8 quests) ───
quest_chain_def(missing_writer_mystery, 'The Missing Writer').
quest_chain_category(missing_writer_mystery, narrative).
quest_chain_bonus_xp(missing_writer_mystery, 500).
quest_chain_achievement(missing_writer_mystery, 'Mystery Solved').

% Quest: Arrival Assessment
% Complete your language assessment upon arriving in the settlement. This establishes your baseline proficiency and introduces you to the town.
% Type: assessment / Difficulty: beginner

quest(arrival_assessment, 'Arrival Assessment', assessment, beginner, active).
quest_chain(arrival_assessment, missing_writer_mystery).
quest_chain_order(arrival_assessment, 0).
quest_tag(arrival_assessment, assessment).
quest_tag(arrival_assessment, arrival).
quest_tag(arrival_assessment, main_quest).
quest_tag(arrival_assessment, narrative).

quest_objective(arrival_assessment, 0, objective('Complete the arrival language assessment')).
quest_completion(arrival_assessment, criteria('Complete all arrival assessment phases')).

quest_reward(arrival_assessment, experience, 50).

% Can Player take this quest?
quest_available(Player, arrival_assessment) :-
    quest(arrival_assessment, _, _, _, active).

% Quest: The Notice Board
% A weathered notice on the town board catches your eye — someone is missing. Read the notice, then visit the town clerk to learn more about the missing writer.
% Type: exploration / Difficulty: beginner

quest(the_notice_board, 'The Notice Board', exploration, beginner, active).
quest_chain(the_notice_board, missing_writer_mystery).
quest_chain_order(the_notice_board, 1).
quest_tag(the_notice_board, reading).
quest_tag(the_notice_board, conversation).
quest_tag(the_notice_board, main_quest).
quest_tag(the_notice_board, narrative).

quest_objective(the_notice_board, 0, objective('Read the missing person notice on the town board')).
quest_objective(the_notice_board, 1, talk_to('{{role:clerk}}', 1)).
quest_objective(the_notice_board, 2, objective('Learn the writer''s name')).
quest_completion(the_notice_board, criteria('Read the notice and speak with the clerk')).

quest_reward(the_notice_board, experience, 75).

% Can Player take this quest?
quest_available(Player, the_notice_board) :-
    quest(the_notice_board, _, _, _, active).

% Quest: The Writer’s Home
% Visit the missing writer’s residence on the edge of town. Search the house for their journal and read the first clue about where they may have gone.
% Type: exploration / Difficulty: beginner

quest(the_writer_s_home, 'The Writer''s Home', exploration, beginner, active).
quest_chain(the_writer_s_home, missing_writer_mystery).
quest_chain_order(the_writer_s_home, 2).
quest_tag(the_writer_s_home, exploration).
quest_tag(the_writer_s_home, item_collection).
quest_tag(the_writer_s_home, reading).
quest_tag(the_writer_s_home, main_quest).
quest_tag(the_writer_s_home, narrative).

quest_objective(the_writer_s_home, 0, visit_location('writer_home')).
quest_objective(the_writer_s_home, 1, objective('Collect the writer''s journal')).
quest_objective(the_writer_s_home, 2, objective('Read the first journal entry for a clue')).
quest_completion(the_writer_s_home, criteria('Find and read the writer''s journal')).

quest_reward(the_writer_s_home, experience, 100).

% Can Player take this quest?
quest_available(Player, the_writer_s_home) :-
    quest(the_writer_s_home, _, _, _, active).

% Quest: Following the Trail
% The journal mentions three people who knew the writer well. Seek them out and hear their testimonies to piece together what happened.
% Type: conversation / Difficulty: intermediate

quest(following_the_trail, 'Following the Trail', conversation, intermediate, active).
quest_chain(following_the_trail, missing_writer_mystery).
quest_chain_order(following_the_trail, 3).
quest_tag(following_the_trail, conversation).
quest_tag(following_the_trail, social).
quest_tag(following_the_trail, main_quest).
quest_tag(following_the_trail, narrative).

quest_objective(following_the_trail, 0, talk_to('witness_neighbor', 1)).
quest_objective(following_the_trail, 1, talk_to('witness_colleague', 1)).
quest_objective(following_the_trail, 2, talk_to('witness_friend', 1)).
quest_objective(following_the_trail, 3, objective('Collect 3 witness testimonies')).
quest_completion(following_the_trail, criteria('Gather all three witness testimonies')).

quest_reward(following_the_trail, experience, 150).

% Can Player take this quest?
quest_available(Player, following_the_trail) :-
    quest(following_the_trail, _, _, _, active).

% Quest: The Hidden Writings
% The witnesses mention books the writer left around town. Find three of the writer’s books scattered across the settlement and read them for embedded clues.
% Type: collection / Difficulty: intermediate

quest(the_hidden_writings, 'The Hidden Writings', collection, intermediate, active).
quest_chain(the_hidden_writings, missing_writer_mystery).
quest_chain_order(the_hidden_writings, 4).
quest_tag(the_hidden_writings, item_collection).
quest_tag(the_hidden_writings, reading).
quest_tag(the_hidden_writings, exploration).
quest_tag(the_hidden_writings, main_quest).
quest_tag(the_hidden_writings, narrative).

quest_objective(the_hidden_writings, 0, objective('Find the writer''s book at the library')).
quest_objective(the_hidden_writings, 1, objective('Find the writer''s book at the school')).
quest_objective(the_hidden_writings, 2, objective('Find the writer''s book at the park bench')).
quest_objective(the_hidden_writings, 3, objective('Read all three books for hidden clues')).
quest_completion(the_hidden_writings, criteria('Find and read all three of the writer''s books')).

quest_reward(the_hidden_writings, experience, 150).

% Can Player take this quest?
quest_available(Player, the_hidden_writings) :-
    quest(the_hidden_writings, _, _, _, active).

% Quest: The Secret Location
% The clues from the books point to a hidden spot the writer loved. Follow the trail to discover the writer’s secret retreat and investigate the scene.
% Type: exploration / Difficulty: intermediate

quest(the_secret_location, 'The Secret Location', exploration, intermediate, active).
quest_chain(the_secret_location, missing_writer_mystery).
quest_chain_order(the_secret_location, 5).
quest_tag(the_secret_location, exploration).
quest_tag(the_secret_location, photography).
quest_tag(the_secret_location, reading).
quest_tag(the_secret_location, main_quest).
quest_tag(the_secret_location, narrative).

quest_objective(the_secret_location, 0, visit_location('secret_location')).
quest_objective(the_secret_location, 1, objective('Photograph the scene at the secret location')).
quest_objective(the_secret_location, 2, objective('Collect the writer''s final manuscript')).
quest_objective(the_secret_location, 3, objective('Read the final manuscript')).
quest_completion(the_secret_location, criteria('Investigate the secret location thoroughly')).

quest_reward(the_secret_location, experience, 175).

% Can Player take this quest?
quest_available(Player, the_secret_location) :-
    quest(the_secret_location, _, _, _, active).

% Quest: The Final Chapter
% You now know the truth. Confront the reality of the writer’s disappearance through a conversation challenge — explain what you’ve discovered to the town, using everything you’ve learned.
% Type: conversation / Difficulty: advanced

quest(the_final_chapter, 'The Final Chapter', conversation, advanced, active).
quest_chain(the_final_chapter, missing_writer_mystery).
quest_chain_order(the_final_chapter, 6).
quest_tag(the_final_chapter, conversation).
quest_tag(the_final_chapter, vocabulary).
quest_tag(the_final_chapter, main_quest).
quest_tag(the_final_chapter, narrative).
quest_tag(the_final_chapter, climax).

quest_objective(the_final_chapter, 0, talk_to('town_gathering', 1)).
quest_objective(the_final_chapter, 1, use_vocabulary('investigation', 8)).
quest_objective(the_final_chapter, 2, talk_to('final_message', 1)).
quest_completion(the_final_chapter, criteria('Complete the town gathering conversation challenge')).

quest_reward(the_final_chapter, experience, 200).

% Can Player take this quest?
quest_available(Player, the_final_chapter) :-
    quest(the_final_chapter, _, _, _, active).

% Quest: Departure Assessment
% Your time in the settlement draws to a close. Complete your final language assessment to measure how far you’ve come since your arrival.
% Type: assessment / Difficulty: intermediate

quest(departure_assessment, 'Departure Assessment', assessment, intermediate, active).
quest_chain(departure_assessment, missing_writer_mystery).
quest_chain_order(departure_assessment, 7).
quest_tag(departure_assessment, assessment).
quest_tag(departure_assessment, departure).
quest_tag(departure_assessment, main_quest).
quest_tag(departure_assessment, narrative).

quest_objective(departure_assessment, 0, objective('Complete the departure language assessment')).
quest_completion(departure_assessment, criteria('Complete all departure assessment phases')).

quest_reward(departure_assessment, experience, 500).

% Can Player take this quest?
quest_available(Player, departure_assessment) :-
    quest(departure_assessment, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Narrative: The Stranger’s Journey
%% ═══════════════════════════════════════════════════════════

narrative(the_stranger_s_journey, 'The Stranger''s Journey').
narrative_description(the_stranger_s_journey, 'A complete narrative arc in which a newcomer arrives in a settlement, learns the local language through daily life, uncovers a fading cultural tradition, and ultimately leads the community to revive it.').
narrative_estimated_hours(the_stranger_s_journey, 8).

%% ─── Act: A Stranger Arrives (introduction) ───
narrative_act(the_stranger_s_journey, a_stranger_arrives, 'A Stranger Arrives', introduction).

narrative_chapter(the_stranger_s_journey, a_stranger_arrives, first_steps, 'First Steps').
chapter_cefr(first_steps, a1).

% Quest: Hello, Stranger
% Your guide greets you in the local language. Learn basic greetings and introduce yourself to three townspeople.
% Type: vocabulary / Difficulty: beginner

quest(hello_stranger, 'Hello, Stranger', vocabulary, beginner, active).
quest_cefr_level(hello_stranger, a1).
quest_chain(hello_stranger, first_steps).
quest_chain_order(hello_stranger, 0).
quest_tag(hello_stranger, greetings).
quest_tag(hello_stranger, beginner).
quest_tag(hello_stranger, social).
quest_tag(hello_stranger, main_quest).

quest_objective(hello_stranger, 0, talk_to('{{role:guide}}', 1)).
quest_objective(hello_stranger, 1, use_vocabulary('any', 3)).
quest_objective(hello_stranger, 2, talk_to('{{npc}}', 3)).


% Can Player take this quest?
quest_available(Player, hello_stranger) :-
    quest(hello_stranger, _, _, _, active).

% Quest: Names and Faces
% The guide introduces you to key figures in town. Remember their names and roles.
% Type: vocabulary / Difficulty: beginner

quest(names_and_faces, 'Names and Faces', vocabulary, beginner, active).
quest_cefr_level(names_and_faces, a1).
quest_chain(names_and_faces, first_steps).
quest_chain_order(names_and_faces, 1).
quest_tag(names_and_faces, vocabulary).
quest_tag(names_and_faces, beginner).
quest_tag(names_and_faces, social).
quest_tag(names_and_faces, main_quest).

quest_objective(names_and_faces, 0, talk_to('{{role:merchant}}', 1)).
quest_objective(names_and_faces, 1, talk_to('{{role:elder}}', 1)).
quest_objective(names_and_faces, 2, objective('Learn 5 words for occupations')).


% Can Player take this quest?
quest_available(Player, names_and_faces) :-
    quest(names_and_faces, _, _, _, active).

% Quest: Counting Coins
% Before you can buy anything, you need to learn the local numbers. Practice counting with your guide.
% Type: vocabulary / Difficulty: beginner

quest(counting_coins, 'Counting Coins', vocabulary, beginner, active).
quest_cefr_level(counting_coins, a1).
quest_chain(counting_coins, first_steps).
quest_chain_order(counting_coins, 2).
quest_tag(counting_coins, vocabulary).
quest_tag(counting_coins, numbers).
quest_tag(counting_coins, beginner).
quest_tag(counting_coins, main_quest).

quest_objective(counting_coins, 0, talk_to('{{role:guide}}', 1)).
quest_objective(counting_coins, 1, use_vocabulary('any', 5)).


% Can Player take this quest?
quest_available(Player, counting_coins) :-
    quest(counting_coins, _, _, _, active).

narrative_chapter(the_stranger_s_journey, a_stranger_arrives, daily_life, 'Daily Life').
chapter_cefr(daily_life, a1).

% Quest: Market Day
% Visit the market and learn the words for common goods. Buy something from the merchant using the local language.
% Type: vocabulary / Difficulty: beginner

quest(market_day, 'Market Day', vocabulary, beginner, active).
quest_cefr_level(market_day, a1).
quest_chain(market_day, daily_life).
quest_chain_order(market_day, 0).
quest_tag(market_day, market).
quest_tag(market_day, vocabulary).
quest_tag(market_day, shopping).
quest_tag(market_day, main_quest).

quest_objective(market_day, 0, visit_location('{{location}}')).
quest_objective(market_day, 1, talk_to('{{role:merchant}}', 1)).
quest_objective(market_day, 2, objective('Learn 6 food and goods words')).
quest_objective(market_day, 3, objective('Buy an item using the target language')).


% Can Player take this quest?
quest_available(Player, market_day) :-
    quest(market_day, _, _, _, active).

% Quest: Finding Your Way
% The town is a maze to newcomers. Learn direction words and navigate to three landmarks.
% Type: vocabulary / Difficulty: beginner

quest(finding_your_way, 'Finding Your Way', vocabulary, beginner, active).
quest_cefr_level(finding_your_way, a1).
quest_chain(finding_your_way, daily_life).
quest_chain_order(finding_your_way, 1).
quest_tag(finding_your_way, navigation).
quest_tag(finding_your_way, vocabulary).
quest_tag(finding_your_way, exploration).
quest_tag(finding_your_way, main_quest).

quest_objective(finding_your_way, 0, talk_to('{{role:guide}}', 1)).
quest_objective(finding_your_way, 1, objective('Learn 6 direction words')).
quest_objective(finding_your_way, 2, discover_location('location')).


% Can Player take this quest?
quest_available(Player, finding_your_way) :-
    quest(finding_your_way, _, _, _, active).

% Quest: A Place to Rest
% You need somewhere to stay. Talk to the locals about lodging and learn words for daily routine.
% Type: conversation / Difficulty: beginner

quest(a_place_to_rest, 'A Place to Rest', conversation, beginner, active).
quest_cefr_level(a_place_to_rest, a1).
quest_chain(a_place_to_rest, daily_life).
quest_chain_order(a_place_to_rest, 2).
quest_tag(a_place_to_rest, conversation).
quest_tag(a_place_to_rest, daily_life).
quest_tag(a_place_to_rest, main_quest).

quest_objective(a_place_to_rest, 0, talk_to('{{npc}}', 2)).
quest_objective(a_place_to_rest, 1, talk_to('{{npc}}', 1)).
quest_objective(a_place_to_rest, 2, use_vocabulary('any', 4)).


% Can Player take this quest?
quest_available(Player, a_place_to_rest) :-
    quest(a_place_to_rest, _, _, _, active).

%% ─── Act: Deeper Roots (rising_action) ───
narrative_act(the_stranger_s_journey, deeper_roots, 'Deeper Roots', rising_action).

narrative_chapter(the_stranger_s_journey, deeper_roots, earning_trust, 'Earning Trust').
chapter_cefr(earning_trust, a2).

% Quest: The Merchant’s Favor
% The merchant needs help with a delivery. Accept the task and navigate to the destination using directions given in the target language.
% Type: conversation / Difficulty: intermediate

quest(the_merchant_s_favor, 'The Merchant''s Favor', conversation, intermediate, active).
quest_cefr_level(the_merchant_s_favor, a2).
quest_chain(the_merchant_s_favor, earning_trust).
quest_chain_order(the_merchant_s_favor, 0).
quest_tag(the_merchant_s_favor, fetch).
quest_tag(the_merchant_s_favor, conversation).
quest_tag(the_merchant_s_favor, trust).
quest_tag(the_merchant_s_favor, main_quest).

quest_objective(the_merchant_s_favor, 0, talk_to('{{role:merchant}}', 1)).
quest_objective(the_merchant_s_favor, 1, objective('Pick up the delivery package')).
quest_objective(the_merchant_s_favor, 2, objective('Deliver the package to its destination')).
quest_objective(the_merchant_s_favor, 3, use_vocabulary('any', 5)).


% Can Player take this quest?
quest_available(Player, the_merchant_s_favor) :-
    quest(the_merchant_s_favor, _, _, _, active).

% Quest: Stories by the Fire
% The elder invites you to an evening gathering. Listen to stories, ask questions, and share something about yourself.
% Type: conversation / Difficulty: intermediate

quest(stories_by_the_fire, 'Stories by the Fire', conversation, intermediate, active).
quest_cefr_level(stories_by_the_fire, a2).
quest_chain(stories_by_the_fire, earning_trust).
quest_chain_order(stories_by_the_fire, 1).
quest_tag(stories_by_the_fire, conversation).
quest_tag(stories_by_the_fire, social).
quest_tag(stories_by_the_fire, storytelling).
quest_tag(stories_by_the_fire, main_quest).

quest_objective(stories_by_the_fire, 0, talk_to('{{role:elder}}', 1)).
quest_objective(stories_by_the_fire, 1, talk_to('{{npc}}', 1)).
quest_objective(stories_by_the_fire, 2, use_vocabulary('any', 6)).


% Can Player take this quest?
quest_available(Player, stories_by_the_fire) :-
    quest(stories_by_the_fire, _, _, _, active).

% Quest: Reading the Sky
% A farmer asks you about the weather. Learn to discuss weather and seasons — practical knowledge everyone shares.
% Type: vocabulary / Difficulty: intermediate

quest(reading_the_sky, 'Reading the Sky', vocabulary, intermediate, active).
quest_cefr_level(reading_the_sky, a2).
quest_chain(reading_the_sky, earning_trust).
quest_chain_order(reading_the_sky, 2).
quest_tag(reading_the_sky, vocabulary).
quest_tag(reading_the_sky, weather).
quest_tag(reading_the_sky, main_quest).

quest_objective(reading_the_sky, 0, talk_to('{{npc}}', 1)).
quest_objective(reading_the_sky, 1, objective('Learn 8 weather and season words')).
quest_objective(reading_the_sky, 2, use_vocabulary('any', 4)).


% Can Player take this quest?
quest_available(Player, reading_the_sky) :-
    quest(reading_the_sky, _, _, _, active).

narrative_chapter(the_stranger_s_journey, deeper_roots, hidden_depths, 'Hidden Depths').
chapter_cefr(hidden_depths, a2).

% Quest: The Elder’s Request
% The elder reveals that an important tradition is being forgotten. Listen carefully to understand what is at stake.
% Type: conversation / Difficulty: intermediate

quest(the_elder_s_request, 'The Elder''s Request', conversation, intermediate, active).
quest_cefr_level(the_elder_s_request, a2).
quest_chain(the_elder_s_request, hidden_depths).
quest_chain_order(the_elder_s_request, 0).
quest_tag(the_elder_s_request, conversation).
quest_tag(the_elder_s_request, cultural).
quest_tag(the_elder_s_request, mystery).
quest_tag(the_elder_s_request, main_quest).

quest_objective(the_elder_s_request, 0, talk_to('{{role:elder}}', 1)).
quest_objective(the_elder_s_request, 1, talk_to('{{npc}}', 1)).
quest_objective(the_elder_s_request, 2, objective('Learn 6 cultural and historical words')).


% Can Player take this quest?
quest_available(Player, the_elder_s_request) :-
    quest(the_elder_s_request, _, _, _, active).

% Quest: The Craftsman’s Workshop
% A local craftsman still practices parts of the old tradition. Visit their workshop and learn the specialized vocabulary.
% Type: vocabulary / Difficulty: intermediate

quest(the_craftsman_s_workshop, 'The Craftsman''s Workshop', vocabulary, intermediate, active).
quest_cefr_level(the_craftsman_s_workshop, a2).
quest_chain(the_craftsman_s_workshop, hidden_depths).
quest_chain_order(the_craftsman_s_workshop, 1).
quest_tag(the_craftsman_s_workshop, vocabulary).
quest_tag(the_craftsman_s_workshop, cultural).
quest_tag(the_craftsman_s_workshop, exploration).
quest_tag(the_craftsman_s_workshop, main_quest).

quest_objective(the_craftsman_s_workshop, 0, visit_location('{{location}}')).
quest_objective(the_craftsman_s_workshop, 1, talk_to('{{role:craftsman}}', 1)).
quest_objective(the_craftsman_s_workshop, 2, objective('Learn 8 craft and tool words')).
quest_objective(the_craftsman_s_workshop, 3, use_vocabulary('any', 3)).


% Can Player take this quest?
quest_available(Player, the_craftsman_s_workshop) :-
    quest(the_craftsman_s_workshop, _, _, _, active).

% Quest: Gathering Fragments
% Travel through the settlement to find remnants of the old tradition. Read signs, talk to residents, and piece together the story.
% Type: conversation / Difficulty: intermediate

quest(gathering_fragments, 'Gathering Fragments', conversation, intermediate, active).
quest_cefr_level(gathering_fragments, a2).
quest_chain(gathering_fragments, hidden_depths).
quest_chain_order(gathering_fragments, 2).
quest_tag(gathering_fragments, exploration).
quest_tag(gathering_fragments, cultural).
quest_tag(gathering_fragments, main_quest).

quest_objective(gathering_fragments, 0, talk_to('{{npc}}', 3)).
quest_objective(gathering_fragments, 1, discover_location('location')).
quest_objective(gathering_fragments, 2, use_vocabulary('any', 8)).


% Can Player take this quest?
quest_available(Player, gathering_fragments) :-
    quest(gathering_fragments, _, _, _, active).

%% ─── Act: The Tradition Reborn (climax_resolution) ───
narrative_act(the_stranger_s_journey, the_tradition_reborn, 'The Tradition Reborn', climax_resolution).

narrative_chapter(the_stranger_s_journey, the_tradition_reborn, the_reckoning, 'The Reckoning').
chapter_cefr(the_reckoning, b1).

% Quest: Making the Case
% Present what you have learned to the elder and key townspeople. Persuade them that the tradition is worth saving.
% Type: conversation / Difficulty: advanced

quest(making_the_case, 'Making the Case', conversation, advanced, active).
quest_cefr_level(making_the_case, b1).
quest_chain(making_the_case, the_reckoning).
quest_chain_order(making_the_case, 0).
quest_tag(making_the_case, conversation).
quest_tag(making_the_case, persuasion).
quest_tag(making_the_case, advanced).
quest_tag(making_the_case, main_quest).

quest_objective(making_the_case, 0, talk_to('{{role:elder}}', 1)).
quest_objective(making_the_case, 1, talk_to('{{npc}}', 2)).
quest_objective(making_the_case, 2, use_vocabulary('any', 8)).


% Can Player take this quest?
quest_available(Player, making_the_case) :-
    quest(making_the_case, _, _, _, active).

% Quest: The Great Debate
% Not everyone agrees the tradition matters. Face skeptics in a public discussion. Defend your position using complex arguments.
% Type: conversation / Difficulty: advanced

quest(the_great_debate, 'The Great Debate', conversation, advanced, active).
quest_cefr_level(the_great_debate, b1).
quest_chain(the_great_debate, the_reckoning).
quest_chain_order(the_great_debate, 1).
quest_tag(the_great_debate, conversation).
quest_tag(the_great_debate, debate).
quest_tag(the_great_debate, advanced).
quest_tag(the_great_debate, main_quest).

quest_objective(the_great_debate, 0, talk_to('{{npc}}', 1)).
quest_objective(the_great_debate, 1, use_vocabulary('any', 10)).
quest_objective(the_great_debate, 2, talk_to('{{npc}}', 3)).


% Can Player take this quest?
quest_available(Player, the_great_debate) :-
    quest(the_great_debate, _, _, _, active).

narrative_chapter(the_stranger_s_journey, the_tradition_reborn, new_beginnings, 'New Beginnings').
chapter_cefr(new_beginnings, b2).

% Quest: Revival Preparations
% Coordinate with the craftsman, merchant, and elder to prepare a ceremony that revives the tradition. Lead the planning in the target language.
% Type: conversation / Difficulty: advanced

quest(revival_preparations, 'Revival Preparations', conversation, advanced, active).
quest_cefr_level(revival_preparations, b2).
quest_chain(revival_preparations, new_beginnings).
quest_chain_order(revival_preparations, 0).
quest_tag(revival_preparations, conversation).
quest_tag(revival_preparations, leadership).
quest_tag(revival_preparations, advanced).
quest_tag(revival_preparations, main_quest).

quest_objective(revival_preparations, 0, talk_to('{{role:craftsman}}', 1)).
quest_objective(revival_preparations, 1, talk_to('{{role:merchant}}', 1)).
quest_objective(revival_preparations, 2, talk_to('{{role:elder}}', 1)).
quest_objective(revival_preparations, 3, use_vocabulary('any', 10)).


% Can Player take this quest?
quest_available(Player, revival_preparations) :-
    quest(revival_preparations, _, _, _, active).

% Quest: The Ceremony
% The day has come. Lead the ceremony, speak to the gathered crowd, and celebrate the tradition reborn.
% Type: conversation / Difficulty: advanced

quest(the_ceremony, 'The Ceremony', conversation, advanced, active).
quest_cefr_level(the_ceremony, b2).
quest_chain(the_ceremony, new_beginnings).
quest_chain_order(the_ceremony, 1).
quest_tag(the_ceremony, conversation).
quest_tag(the_ceremony, ceremony).
quest_tag(the_ceremony, climax).
quest_tag(the_ceremony, main_quest).

quest_objective(the_ceremony, 0, talk_to('{{npc}}', 1)).
quest_objective(the_ceremony, 1, use_vocabulary('any', 12)).
quest_objective(the_ceremony, 2, objective('Celebrate with 3 townspeople')).


% Can Player take this quest?
quest_available(Player, the_ceremony) :-
    quest(the_ceremony, _, _, _, active).

% Quest: One of Us
% The elder formally welcomes you as a member of the community. Reflect on your journey and how far your language skills have come.
% Type: conversation / Difficulty: advanced

quest(one_of_us, 'One of Us', conversation, advanced, active).
quest_cefr_level(one_of_us, b2).
quest_chain(one_of_us, new_beginnings).
quest_chain_order(one_of_us, 2).
quest_tag(one_of_us, conversation).
quest_tag(one_of_us, resolution).
quest_tag(one_of_us, finale).
quest_tag(one_of_us, main_quest).

quest_objective(one_of_us, 0, talk_to('{{role:elder}}', 1)).
quest_objective(one_of_us, 1, talk_to('{{npc}}', 1)).
quest_objective(one_of_us, 2, use_vocabulary('any', 10)).


% Can Player take this quest?
quest_available(Player, one_of_us) :-
    quest(one_of_us, _, _, _, active).






