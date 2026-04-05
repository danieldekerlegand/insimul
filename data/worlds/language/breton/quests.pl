%% Insimul Quests: Breton Coast
%% Source: data/worlds/language/breton/quests.pl
%% Created: 2026-04-03
%% Total: 16 quests (CEFR A1-B2)

%% ======================================================
%% A1 -- Beginner Quests
%% ======================================================

%% Quest: First Greetings in Breton
quest(demat_da_gentanion, 'Demat! Da Gentanion', conversation, beginner, active).
quest_assigned_to(demat_da_gentanion, '{{player}}').
quest_language(demat_da_gentanion, breton).
quest_tag(demat_da_gentanion, generated).
quest_objective(demat_da_gentanion, 0, talk_to('yann_le_goff', 1)).
quest_objective(demat_da_gentanion, 1, objective('Learn basic Breton greetings: demat, kenavo, mont a ra, trugarez.')).
quest_objective(demat_da_gentanion, 2, talk_to('soazig_le_goff', 1)).
quest_reward(demat_da_gentanion, experience, 100).
quest_reward(demat_da_gentanion, gold, 50).
quest_available(Player, demat_da_gentanion) :-
    quest(demat_da_gentanion, _, _, _, active).

%% Quest: At the Creperie
quest(er_grampouezhenn, 'Er Grampouezhenn', vocabulary, beginner, active).
quest_assigned_to(er_grampouezhenn, '{{player}}').
quest_language(er_grampouezhenn, breton).
quest_tag(er_grampouezhenn, generated).
quest_objective(er_grampouezhenn, 0, objective('Visit Krampouezhenn Ar Vag creperie.')).
quest_objective(er_grampouezhenn, 1, objective('Learn the names of crepe fillings in Breton: sukr, amanenn, ov, keuz.')).
quest_objective(er_grampouezhenn, 2, objective('Order a krampouezhenn using Breton.')).
quest_reward(er_grampouezhenn, experience, 100).
quest_reward(er_grampouezhenn, gold, 50).
quest_available(Player, er_grampouezhenn) :-
    quest(er_grampouezhenn, _, _, _, active).

%% Quest: Counting Fish
quest(kontanin_pesked, 'Kontanin Pesked', vocabulary, beginner, active).
quest_assigned_to(kontanin_pesked, '{{player}}').
quest_language(kontanin_pesked, breton).
quest_tag(kontanin_pesked, generated).
quest_objective(kontanin_pesked, 0, objective('Learn Breton numbers 1-20: unan, daou, tri, pevar, pemp...')).
quest_objective(kontanin_pesked, 1, objective('Count fish at the fish market with Goulven Kermarrec.')).
quest_objective(kontanin_pesked, 2, objective('Pay for fish using the correct Breton number.')).
quest_reward(kontanin_pesked, experience, 120).
quest_reward(kontanin_pesked, gold, 60).
quest_available(Player, kontanin_pesked) :-
    quest(kontanin_pesked, _, _, _, active).

%% Quest: My Family
quest(ma_familh, 'Ma Familh', conversation, beginner, active).
quest_assigned_to(ma_familh, '{{player}}').
quest_language(ma_familh, breton).
quest_tag(ma_familh, generated).
quest_objective(ma_familh, 0, talk_to('soazig_le_goff', 1)).
quest_objective(ma_familh, 1, objective('Learn family vocabulary: mamm, tad, breur, c''hoar, mab, merc''h.')).
quest_objective(ma_familh, 2, objective('Describe your own family in Breton to Soazig.')).
quest_reward(ma_familh, experience, 100).
quest_reward(ma_familh, gold, 50).
quest_available(Player, ma_familh) :-
    quest(ma_familh, _, _, _, active).

%% ======================================================
%% A2 -- Elementary Quests
%% ======================================================

%% Quest: Harbor Exploration
quest(klask_ar_porzh, 'Klask ar Porzh', exploration, beginner, active).
quest_assigned_to(klask_ar_porzh, '{{player}}').
quest_language(klask_ar_porzh, breton).
quest_tag(klask_ar_porzh, generated).
quest_objective(klask_ar_porzh, 0, objective('Find the fish market and buy pesked-mor (sea fish).')).
quest_objective(klask_ar_porzh, 1, objective('Find the surf shop and learn equipment names in Breton.')).
quest_objective(klask_ar_porzh, 2, objective('Find the bookstore and ask for a recommendation in Breton.')).
quest_reward(klask_ar_porzh, experience, 150).
quest_reward(klask_ar_porzh, gold, 80).
quest_available(Player, klask_ar_porzh) :-
    quest(klask_ar_porzh, _, _, _, active).

%% Quest: Cider Traditions
quest(gouzout_ar_sistr, 'Gouzout ar Sistr', cultural_knowledge, beginner, active).
quest_assigned_to(gouzout_ar_sistr, '{{player}}').
quest_language(gouzout_ar_sistr, breton).
quest_tag(gouzout_ar_sistr, generated).
quest_objective(gouzout_ar_sistr, 0, talk_to('herve_quere', 1)).
quest_objective(gouzout_ar_sistr, 1, objective('Learn about Breton cider-making traditions at the cider press.')).
quest_objective(gouzout_ar_sistr, 2, objective('Order cider at Tavarn ar Sistr using proper Breton phrases.')).
quest_reward(gouzout_ar_sistr, experience, 150).
quest_reward(gouzout_ar_sistr, gold, 75).
quest_available(Player, gouzout_ar_sistr) :-
    quest(gouzout_ar_sistr, _, _, _, active).

%% Quest: Directions in Porzh-Gwenn
quest(hentoù_porzh_gwenn, 'Hentou Porzh-Gwenn', grammar, beginner, active).
quest_assigned_to(hentoù_porzh_gwenn, '{{player}}').
quest_language(hentoù_porzh_gwenn, breton).
quest_tag(hentoù_porzh_gwenn, generated).
quest_objective(hentoù_porzh_gwenn, 0, objective('Learn direction words: dehou, kleiz, war-raok, war-dro.')).
quest_objective(hentoù_porzh_gwenn, 1, objective('Ask three people for directions in Breton.')).
quest_objective(hentoù_porzh_gwenn, 2, objective('Navigate to the standing stone using only Breton directions.')).
quest_reward(hentoù_porzh_gwenn, experience, 150).
quest_reward(hentoù_porzh_gwenn, gold, 80).
quest_available(Player, hentoù_porzh_gwenn) :-
    quest(hentoù_porzh_gwenn, _, _, _, active).

%% Quest: Breton Food Festival
quest(gouel_boued, 'Gouel Boued', vocabulary, beginner, active).
quest_assigned_to(gouel_boued, '{{player}}').
quest_language(gouel_boued, breton).
quest_tag(gouel_boued, generated).
quest_objective(gouel_boued, 0, objective('Visit the seafood restaurant and order a meal in Breton.')).
quest_objective(gouel_boued, 1, objective('Learn 10 food words at the bakery and market.')).
quest_objective(gouel_boued, 2, objective('Describe your favorite food in Breton to Annaig Riou.')).
quest_reward(gouel_boued, experience, 160).
quest_reward(gouel_boued, gold, 80).
quest_available(Player, gouel_boued) :-
    quest(gouel_boued, _, _, _, active).

%% ======================================================
%% B1 -- Intermediate Quests
%% ======================================================

%% Quest: The Diwan School
quest(skol_diwan, 'Skol Diwan', exploration, intermediate, active).
quest_assigned_to(skol_diwan, '{{player}}').
quest_language(skol_diwan, breton).
quest_tag(skol_diwan, generated).
quest_objective(skol_diwan, 0, talk_to('gwenael_le_bihan', 1)).
quest_objective(skol_diwan, 1, objective('Tour the Diwan school and learn educational vocabulary in Breton.')).
quest_objective(skol_diwan, 2, objective('Introduce yourself to three students in Breton.')).
quest_objective(skol_diwan, 3, talk_to('rozenn_le_bihan', 1)).
quest_reward(skol_diwan, experience, 250).
quest_reward(skol_diwan, gold, 120).
quest_available(Player, skol_diwan) :-
    quest(skol_diwan, _, _, _, active).

%% Quest: Fest-Noz Night
quest(fest_noz, 'Fest-Noz', cultural_knowledge, intermediate, active).
quest_assigned_to(fest_noz, '{{player}}').
quest_language(fest_noz, breton).
quest_tag(fest_noz, generated).
quest_objective(fest_noz, 0, objective('Visit Ti ar Fest-Noz venue.')).
quest_objective(fest_noz, 1, objective('Learn about traditional Breton dances: an dro, hanter dro, gavotte.')).
quest_objective(fest_noz, 2, objective('Have a conversation in Breton about music with Tudual Morvan.')).
quest_reward(fest_noz, experience, 250).
quest_reward(fest_noz, gold, 100).
quest_available(Player, fest_noz) :-
    quest(fest_noz, _, _, _, active).

%% Quest: The Fishing Boat
quest(ar_vag_pesked, 'Ar Vag-Pesked', conversation, intermediate, active).
quest_assigned_to(ar_vag_pesked, '{{player}}').
quest_language(ar_vag_pesked, breton).
quest_tag(ar_vag_pesked, generated).
quest_objective(ar_vag_pesked, 0, objective('Meet Goulven Kermarrec at the harbor.')).
quest_objective(ar_vag_pesked, 1, talk_to('goulven_kermarrec', 1)).
quest_objective(ar_vag_pesked, 2, objective('Help Goulven describe his catch using marine vocabulary in Breton.')).
quest_objective(ar_vag_pesked, 3, objective('Have a conversation about sea life with Maiwenn Kermarrec.')).
quest_reward(ar_vag_pesked, experience, 280).
quest_reward(ar_vag_pesked, gold, 130).
quest_available(Player, ar_vag_pesked) :-
    quest(ar_vag_pesked, _, _, _, active).

%% Quest: Mutations Practice
quest(kemmaduriou, 'Kemmaduriou', grammar, intermediate, active).
quest_assigned_to(kemmaduriou, '{{player}}').
quest_language(kemmaduriou, breton).
quest_tag(kemmaduriou, generated).
quest_objective(kemmaduriou, 0, objective('Learn the three Breton consonant mutations: soft, nasal, and aspirate.')).
quest_objective(kemmaduriou, 1, objective('Practice soft mutation with Rozenn Le Bihan at the Diwan school.')).
quest_objective(kemmaduriou, 2, objective('Successfully use mutations in conversation at the market.')).
quest_reward(kemmaduriou, experience, 250).
quest_reward(kemmaduriou, gold, 150).
quest_available(Player, kemmaduriou) :-
    quest(kemmaduriou, _, _, _, active).

%% ======================================================
%% B2 -- Upper Intermediate Quests
%% ======================================================

%% Quest: The Standing Stones
quest(ar_mein_hir, 'Ar Mein-Hir', conversation, advanced, active).
quest_assigned_to(ar_mein_hir, '{{player}}').
quest_language(ar_mein_hir, breton).
quest_tag(ar_mein_hir, generated).
quest_objective(ar_mein_hir, 0, objective('Visit the standing stone at Penn ar Bed.')).
quest_objective(ar_mein_hir, 1, talk_to('jakez_riou', 1)).
quest_objective(ar_mein_hir, 2, objective('Discuss megalithic history and local legends in Breton.')).
quest_objective(ar_mein_hir, 3, objective('Write a short paragraph about the stones in Breton.')).
quest_reward(ar_mein_hir, experience, 400).
quest_reward(ar_mein_hir, gold, 200).
quest_available(Player, ar_mein_hir) :-
    quest(ar_mein_hir, _, _, _, active).

%% Quest: The Language Debate
quest(tabut_ar_yezh, 'Tabut ar Yezh', grammar, advanced, active).
quest_assigned_to(tabut_ar_yezh, '{{player}}').
quest_language(tabut_ar_yezh, breton).
quest_tag(tabut_ar_yezh, generated).
quest_objective(tabut_ar_yezh, 0, talk_to('gwenael_le_bihan', 1)).
quest_objective(tabut_ar_yezh, 1, objective('Learn to express opinions in Breton: me a soñj din, ne gredan ket, hervez ma soñj.')).
quest_objective(tabut_ar_yezh, 2, objective('Participate in a discussion about language revitalization at the cultural center.')).
quest_objective(tabut_ar_yezh, 3, objective('Use conditional sentences in your arguments.')).
quest_reward(tabut_ar_yezh, experience, 450).
quest_reward(tabut_ar_yezh, gold, 200).
quest_available(Player, tabut_ar_yezh) :-
    quest(tabut_ar_yezh, _, _, _, active).

%% Quest: Celtic Music and Poetry
quest(sonerezh_ha_barzhoneg, 'Sonerezh ha Barzhoneg', cultural_knowledge, advanced, active).
quest_assigned_to(sonerezh_ha_barzhoneg, '{{player}}').
quest_language(sonerezh_ha_barzhoneg, breton).
quest_tag(sonerezh_ha_barzhoneg, generated).
quest_objective(sonerezh_ha_barzhoneg, 0, objective('Interview three residents about Breton music traditions.')).
quest_objective(sonerezh_ha_barzhoneg, 1, objective('Learn traditional song lyrics and their meanings.')).
quest_objective(sonerezh_ha_barzhoneg, 2, objective('Write a short text in Breton about the role of music in Celtic identity.')).
quest_objective(sonerezh_ha_barzhoneg, 3, talk_to('enora_morvan', 1)).
quest_reward(sonerezh_ha_barzhoneg, experience, 500).
quest_reward(sonerezh_ha_barzhoneg, gold, 250).
quest_available(Player, sonerezh_ha_barzhoneg) :-
    quest(sonerezh_ha_barzhoneg, _, _, _, active).

%% Quest: Coastal Walk and Storytelling
quest(bale_war_an_aod, 'Bale war an Aod', exploration, advanced, active).
quest_assigned_to(bale_war_an_aod, '{{player}}').
quest_language(bale_war_an_aod, breton).
quest_tag(bale_war_an_aod, generated).
quest_objective(bale_war_an_aod, 0, objective('Walk from the harbor to Penn ar Bed and describe the scenery in Breton.')).
quest_objective(bale_war_an_aod, 1, objective('Have an extended conversation with a stranger about life in Breizh.')).
quest_objective(bale_war_an_aod, 2, objective('Narrate a short story about the lighthouse in Breton.')).
quest_reward(bale_war_an_aod, experience, 450).
quest_reward(bale_war_an_aod, gold, 200).
quest_available(Player, bale_war_an_aod) :-
    quest(bale_war_an_aod, _, _, _, active).
