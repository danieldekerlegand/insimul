%% Insimul Quests: Arabic Al-Andalus
%% Source: data/worlds/language/arabic/quests.pl
%% Created: 2026-04-03
%% Total: 16 quests (CEFR A1-B2, language learning focus)
%%
%% Quest types: conversation, exploration, vocabulary, grammar, cultural_knowledge

%% ═══════════════════════════════════════════════════════════
%% A1 — Beginner Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Greetings at the Gate
quest(greetings_at_the_gate, 'Greetings at the Gate', conversation, beginner, active).
quest_assigned_to(greetings_at_the_gate, '{{player}}').
quest_language(greetings_at_the_gate, arabic).
quest_cefr(greetings_at_the_gate, a1).
quest_tag(greetings_at_the_gate, language_learning).
quest_tag(greetings_at_the_gate, conversation).

quest_objective(greetings_at_the_gate, 0, talk_to(gate_guard, 1)).
quest_objective(greetings_at_the_gate, 1, objective('Greet the guard using as-salamu alaykum.')).
quest_objective(greetings_at_the_gate, 2, objective('Introduce yourself using ana ismi...')).

quest_reward(greetings_at_the_gate, experience, 50).
quest_reward(greetings_at_the_gate, gold, 25).

quest_available(Player, greetings_at_the_gate) :-
    quest(greetings_at_the_gate, _, _, _, active).

%% Quest: First Words at the Souk
quest(first_words_at_the_souk, 'First Words at the Souk', vocabulary, beginner, active).
quest_assigned_to(first_words_at_the_souk, '{{player}}').
quest_language(first_words_at_the_souk, arabic).
quest_cefr(first_words_at_the_souk, a1).
quest_tag(first_words_at_the_souk, language_learning).
quest_tag(first_words_at_the_souk, vocabulary).

quest_objective(first_words_at_the_souk, 0, objective('Learn the Arabic names for 5 spices at Suq al-Attar.')).
quest_objective(first_words_at_the_souk, 1, talk_to(hassan_al_qurtubi, 1)).
quest_objective(first_words_at_the_souk, 2, objective('Practice counting from 1 to 10 in Arabic with a merchant.')).

quest_reward(first_words_at_the_souk, experience, 75).
quest_reward(first_words_at_the_souk, gold, 30).

quest_available(Player, first_words_at_the_souk) :-
    quest(first_words_at_the_souk, _, _, _, active).

%% Quest: The Bread of the Medina
quest(the_bread_of_the_medina, 'The Bread of the Medina', exploration, beginner, active).
quest_assigned_to(the_bread_of_the_medina, '{{player}}').
quest_language(the_bread_of_the_medina, arabic).
quest_cefr(the_bread_of_the_medina, a1).
quest_tag(the_bread_of_the_medina, language_learning).
quest_tag(the_bread_of_the_medina, exploration).

quest_objective(the_bread_of_the_medina, 0, objective('Find Furn al-Medina bakery on Tariq al-Suq.')).
quest_objective(the_bread_of_the_medina, 1, collect(khubz, 1)).
quest_objective(the_bread_of_the_medina, 2, objective('Ask for bread using arid khubz, min fadlik.')).

quest_reward(the_bread_of_the_medina, experience, 60).
quest_reward(the_bread_of_the_medina, gold, 20).

quest_available(Player, the_bread_of_the_medina) :-
    quest(the_bread_of_the_medina, _, _, _, active).

%% Quest: Colors of the Bazaar
quest(colors_of_the_bazaar, 'Colors of the Bazaar', vocabulary, beginner, active).
quest_assigned_to(colors_of_the_bazaar, '{{player}}').
quest_language(colors_of_the_bazaar, arabic).
quest_cefr(colors_of_the_bazaar, a1).
quest_tag(colors_of_the_bazaar, language_learning).
quest_tag(colors_of_the_bazaar, vocabulary).

quest_objective(colors_of_the_bazaar, 0, objective('Visit Suq al-Qazzazin and name 5 fabric colors in Arabic.')).
quest_objective(colors_of_the_bazaar, 1, talk_to(noura_al_qurtubi, 1)).
quest_objective(colors_of_the_bazaar, 2, collect(silk_fabric, 1)).

quest_reward(colors_of_the_bazaar, experience, 65).
quest_reward(colors_of_the_bazaar, gold, 25).

quest_available(Player, colors_of_the_bazaar) :-
    quest(colors_of_the_bazaar, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% A2 — Elementary Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Haggling in the Souk
quest(haggling_in_the_souk, 'Haggling in the Souk', conversation, beginner, active).
quest_assigned_to(haggling_in_the_souk, '{{player}}').
quest_language(haggling_in_the_souk, arabic).
quest_cefr(haggling_in_the_souk, a2).
quest_tag(haggling_in_the_souk, language_learning).
quest_tag(haggling_in_the_souk, conversation).
quest_prerequisite(haggling_in_the_souk, first_words_at_the_souk).

quest_objective(haggling_in_the_souk, 0, objective('Negotiate a price for saffron using bikam hatha?')).
quest_objective(haggling_in_the_souk, 1, objective('Use comparative adjectives: arkhas (cheaper), afdal (better).')).
quest_objective(haggling_in_the_souk, 2, collect(saffron, 1)).

quest_reward(haggling_in_the_souk, experience, 150).
quest_reward(haggling_in_the_souk, gold, 75).

quest_available(Player, haggling_in_the_souk) :-
    quest(haggling_in_the_souk, _, _, _, active),
    quest(first_words_at_the_souk, _, _, _, _),
    quest_completed(Player, first_words_at_the_souk).

%% Quest: The Hammam Ritual
quest(the_hammam_ritual, 'The Hammam Ritual', cultural_knowledge, beginner, active).
quest_assigned_to(the_hammam_ritual, '{{player}}').
quest_language(the_hammam_ritual, arabic).
quest_cefr(the_hammam_ritual, a2).
quest_tag(the_hammam_ritual, language_learning).
quest_tag(the_hammam_ritual, cultural_knowledge).

quest_objective(the_hammam_ritual, 0, objective('Visit Hammam al-Nur and learn bathing vocabulary.')).
quest_objective(the_hammam_ritual, 1, objective('Learn the etiquette of greeting in the hammam.')).
quest_objective(the_hammam_ritual, 2, objective('Describe the hammam experience using 5 new adjectives.')).

quest_reward(the_hammam_ritual, experience, 125).
quest_reward(the_hammam_ritual, gold, 50).

quest_available(Player, the_hammam_ritual) :-
    quest(the_hammam_ritual, _, _, _, active).

%% Quest: Directions to the Mosque
quest(directions_to_the_mosque, 'Directions to the Mosque', grammar, beginner, active).
quest_assigned_to(directions_to_the_mosque, '{{player}}').
quest_language(directions_to_the_mosque, arabic).
quest_cefr(directions_to_the_mosque, a2).
quest_tag(directions_to_the_mosque, language_learning).
quest_tag(directions_to_the_mosque, grammar).
quest_prerequisite(directions_to_the_mosque, greetings_at_the_gate).

quest_objective(directions_to_the_mosque, 0, objective('Ask for directions using ayna al-masjid?')).
quest_objective(directions_to_the_mosque, 1, objective('Practice prepositions: amam (in front of), waraa (behind), bayn (between).')).
quest_objective(directions_to_the_mosque, 2, objective('Navigate from the souk to the Great Mosque using Arabic directions.')).

quest_reward(directions_to_the_mosque, experience, 130).
quest_reward(directions_to_the_mosque, gold, 60).

quest_available(Player, directions_to_the_mosque) :-
    quest(directions_to_the_mosque, _, _, _, active),
    quest(greetings_at_the_gate, _, _, _, _),
    quest_completed(Player, greetings_at_the_gate).

%% Quest: The Family Tree
quest(the_family_tree, 'The Family Tree', vocabulary, beginner, active).
quest_assigned_to(the_family_tree, '{{player}}').
quest_language(the_family_tree, arabic).
quest_cefr(the_family_tree, a2).
quest_tag(the_family_tree, language_learning).
quest_tag(the_family_tree, vocabulary).

quest_objective(the_family_tree, 0, talk_to(khadija_al_rashid, 1)).
quest_objective(the_family_tree, 1, objective('Learn family vocabulary: ab (father), umm (mother), ibn (son), bint (daughter).')).
quest_objective(the_family_tree, 2, objective('Describe the al-Rashid family tree using Arabic kinship terms.')).

quest_reward(the_family_tree, experience, 120).
quest_reward(the_family_tree, gold, 55).

quest_available(Player, the_family_tree) :-
    quest(the_family_tree, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% B1 — Intermediate Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: The Scholar's Debate
quest(the_scholars_debate, 'The Scholar''s Debate', conversation, intermediate, active).
quest_assigned_to(the_scholars_debate, '{{player}}').
quest_language(the_scholars_debate, arabic).
quest_cefr(the_scholars_debate, b1).
quest_tag(the_scholars_debate, language_learning).
quest_tag(the_scholars_debate, conversation).
quest_prerequisite(the_scholars_debate, haggling_in_the_souk).

quest_objective(the_scholars_debate, 0, talk_to(yusuf_al_rashid, 1)).
quest_objective(the_scholars_debate, 1, objective('Participate in a debate about astronomy at the observatory.')).
quest_objective(the_scholars_debate, 2, objective('Express agreement and disagreement using ana attafiq and la attafiq.')).

quest_reward(the_scholars_debate, experience, 300).
quest_reward(the_scholars_debate, gold, 150).

quest_available(Player, the_scholars_debate) :-
    quest(the_scholars_debate, _, _, _, active),
    quest(haggling_in_the_souk, _, _, _, _),
    quest_completed(Player, haggling_in_the_souk).

%% Quest: The Lost Manuscript
quest(the_lost_manuscript, 'The Lost Manuscript', exploration, intermediate, active).
quest_assigned_to(the_lost_manuscript, '{{player}}').
quest_language(the_lost_manuscript, arabic).
quest_cefr(the_lost_manuscript, b1).
quest_tag(the_lost_manuscript, language_learning).
quest_tag(the_lost_manuscript, exploration).

quest_objective(the_lost_manuscript, 0, talk_to(moshe_ben_shlomo, 1)).
quest_objective(the_lost_manuscript, 1, objective('Search Bayt al-Tarjama for a missing Greek-to-Arabic manuscript.')).
quest_objective(the_lost_manuscript, 2, collect(ancient_manuscript, 1)).

quest_reward(the_lost_manuscript, experience, 350).
quest_reward(the_lost_manuscript, gold, 200).

quest_available(Player, the_lost_manuscript) :-
    quest(the_lost_manuscript, _, _, _, active).

%% Quest: Poetry of the Garden
quest(poetry_of_the_garden, 'Poetry of the Garden', grammar, intermediate, active).
quest_assigned_to(poetry_of_the_garden, '{{player}}').
quest_language(poetry_of_the_garden, arabic).
quest_cefr(poetry_of_the_garden, b1).
quest_tag(poetry_of_the_garden, language_learning).
quest_tag(poetry_of_the_garden, grammar).
quest_prerequisite(poetry_of_the_garden, directions_to_the_mosque).

quest_objective(poetry_of_the_garden, 0, talk_to(zahra_al_rashid, 1)).
quest_objective(poetry_of_the_garden, 1, objective('Learn the basics of Arabic meter and rhyme in the palace gardens.')).
quest_objective(poetry_of_the_garden, 2, objective('Compose a simple two-line poem using the past tense.')).

quest_reward(poetry_of_the_garden, experience, 325).
quest_reward(poetry_of_the_garden, gold, 175).

quest_available(Player, poetry_of_the_garden) :-
    quest(poetry_of_the_garden, _, _, _, active),
    quest(directions_to_the_mosque, _, _, _, _),
    quest_completed(Player, directions_to_the_mosque).

%% Quest: The Three Faiths
quest(the_three_faiths, 'The Three Faiths', cultural_knowledge, intermediate, active).
quest_assigned_to(the_three_faiths, '{{player}}').
quest_language(the_three_faiths, arabic).
quest_cefr(the_three_faiths, b1).
quest_tag(the_three_faiths, language_learning).
quest_tag(the_three_faiths, cultural_knowledge).
quest_prerequisite(the_three_faiths, the_hammam_ritual).

quest_objective(the_three_faiths, 0, talk_to(khalid_ibn_hayyan, 1)).
quest_objective(the_three_faiths, 1, talk_to(moshe_ben_shlomo, 1)).
quest_objective(the_three_faiths, 2, talk_to(alfonso_de_leon, 1)).

quest_reward(the_three_faiths, experience, 400).
quest_reward(the_three_faiths, gold, 200).

quest_available(Player, the_three_faiths) :-
    quest(the_three_faiths, _, _, _, active),
    quest(the_hammam_ritual, _, _, _, _),
    quest_completed(Player, the_hammam_ritual).

%% ═══════════════════════════════════════════════════════════
%% B2 — Upper Intermediate Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: The Caliph's Letter
quest(the_caliphs_letter, 'The Caliph''s Letter', grammar, advanced, active).
quest_assigned_to(the_caliphs_letter, '{{player}}').
quest_language(the_caliphs_letter, arabic).
quest_cefr(the_caliphs_letter, b2).
quest_tag(the_caliphs_letter, language_learning).
quest_tag(the_caliphs_letter, grammar).
quest_prerequisite(the_caliphs_letter, poetry_of_the_garden).

quest_objective(the_caliphs_letter, 0, talk_to(tariq_ibn_hayyan, 1)).
quest_objective(the_caliphs_letter, 1, objective('Draft a formal petition letter using classical Arabic register.')).
quest_objective(the_caliphs_letter, 2, objective('Apply correct i''rab (case endings) in 10 sentences.')).

quest_reward(the_caliphs_letter, experience, 600).
quest_reward(the_caliphs_letter, gold, 350).

quest_available(Player, the_caliphs_letter) :-
    quest(the_caliphs_letter, _, _, _, active),
    quest(poetry_of_the_garden, _, _, _, _),
    quest_completed(Player, poetry_of_the_garden).

%% Quest: The Translator's Challenge
quest(the_translators_challenge, 'The Translator''s Challenge', vocabulary, advanced, active).
quest_assigned_to(the_translators_challenge, '{{player}}').
quest_language(the_translators_challenge, arabic).
quest_cefr(the_translators_challenge, b2).
quest_tag(the_translators_challenge, language_learning).
quest_tag(the_translators_challenge, vocabulary).
quest_prerequisite(the_translators_challenge, the_lost_manuscript).

quest_objective(the_translators_challenge, 0, talk_to(david_ben_shlomo, 1)).
quest_objective(the_translators_challenge, 1, objective('Translate a medical text passage from Greek into Arabic.')).
quest_objective(the_translators_challenge, 2, objective('Identify 15 Arabic scientific terms derived from Greek roots.')).

quest_reward(the_translators_challenge, experience, 650).
quest_reward(the_translators_challenge, gold, 400).

quest_available(Player, the_translators_challenge) :-
    quest(the_translators_challenge, _, _, _, active),
    quest(the_lost_manuscript, _, _, _, _),
    quest_completed(Player, the_lost_manuscript).

%% Quest: The Merchant's Journey
quest(the_merchants_journey, 'The Merchant''s Journey', conversation, advanced, active).
quest_assigned_to(the_merchants_journey, '{{player}}').
quest_language(the_merchants_journey, arabic).
quest_cefr(the_merchants_journey, b2).
quest_tag(the_merchants_journey, language_learning).
quest_tag(the_merchants_journey, conversation).
quest_prerequisite(the_merchants_journey, the_scholars_debate).

quest_objective(the_merchants_journey, 0, talk_to(abu_bakr_al_rashid, 1)).
quest_objective(the_merchants_journey, 1, objective('Negotiate a complex trade agreement with a Silk Road merchant.')).
quest_objective(the_merchants_journey, 2, objective('Narrate a travel story using past, present, and future tenses.')).

quest_reward(the_merchants_journey, experience, 700).
quest_reward(the_merchants_journey, gold, 450).

quest_available(Player, the_merchants_journey) :-
    quest(the_merchants_journey, _, _, _, active),
    quest(the_scholars_debate, _, _, _, _),
    quest_completed(Player, the_scholars_debate).
