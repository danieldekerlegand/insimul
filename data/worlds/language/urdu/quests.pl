%% Insimul Quests: Urdu Punjab
%% Source: data/worlds/language/urdu/quests.pl
%% Created: 2026-04-03
%% Total: 16 quests (CEFR A1-B2, language learning focus)
%%
%% Quest types: conversation, exploration, vocabulary, grammar, cultural_knowledge

%% =====================================================================
%% A1 -- Beginner Quests
%% =====================================================================

%% Quest: Assalam o Alaikum
quest(assalam_o_alaikum, 'Assalam o Alaikum', conversation, beginner, active).
quest_assigned_to(assalam_o_alaikum, '{{player}}').
quest_language(assalam_o_alaikum, urdu).
quest_cefr(assalam_o_alaikum, a1).
quest_tag(assalam_o_alaikum, language_learning).
quest_tag(assalam_o_alaikum, conversation).

quest_objective(assalam_o_alaikum, 0, talk_to(hussain_shah, 1)).
quest_objective(assalam_o_alaikum, 1, objective('Greet the imam using Assalam o Alaikum.')).
quest_objective(assalam_o_alaikum, 2, objective('Introduce yourself using Mera naam ... hai.')).

quest_reward(assalam_o_alaikum, experience, 50).
quest_reward(assalam_o_alaikum, gold, 25).

quest_available(Player, assalam_o_alaikum) :-
    quest(assalam_o_alaikum, _, _, _, active).

%% Quest: Ek Cup Chai
quest(ek_cup_chai, 'Ek Cup Chai', vocabulary, beginner, active).
quest_assigned_to(ek_cup_chai, '{{player}}').
quest_language(ek_cup_chai, urdu).
quest_cefr(ek_cup_chai, a1).
quest_tag(ek_cup_chai, language_learning).
quest_tag(ek_cup_chai, vocabulary).

quest_objective(ek_cup_chai, 0, objective('Visit Bilal Chai Wala on Bazaar Road.')).
quest_objective(ek_cup_chai, 1, talk_to(bilal_ahmed, 1)).
quest_objective(ek_cup_chai, 2, objective('Order chai using Ek cup chai dijiye.')).
quest_objective(ek_cup_chai, 3, collect(chai_cup, 1)).

quest_reward(ek_cup_chai, experience, 60).
quest_reward(ek_cup_chai, gold, 20).

quest_available(Player, ek_cup_chai) :-
    quest(ek_cup_chai, _, _, _, active).

%% Quest: Bazaar Mein Ginti
quest(bazaar_mein_ginti, 'Bazaar Mein Ginti', vocabulary, beginner, active).
quest_assigned_to(bazaar_mein_ginti, '{{player}}').
quest_language(bazaar_mein_ginti, urdu).
quest_cefr(bazaar_mein_ginti, a1).
quest_tag(bazaar_mein_ginti, language_learning).
quest_tag(bazaar_mein_ginti, vocabulary).

quest_objective(bazaar_mein_ginti, 0, objective('Learn Urdu numbers 1 to 10 at the spice shop.')).
quest_objective(bazaar_mein_ginti, 1, talk_to(yousuf_butt, 1)).
quest_objective(bazaar_mein_ginti, 2, objective('Count spice packets aloud: ek, do, teen, chaar, paanch.')).

quest_reward(bazaar_mein_ginti, experience, 65).
quest_reward(bazaar_mein_ginti, gold, 25).

quest_available(Player, bazaar_mein_ginti) :-
    quest(bazaar_mein_ginti, _, _, _, active).

%% Quest: Rang Birangi Dukaan
quest(rang_birangi_dukaan, 'Rang Birangi Dukaan', vocabulary, beginner, active).
quest_assigned_to(rang_birangi_dukaan, '{{player}}').
quest_language(rang_birangi_dukaan, urdu).
quest_cefr(rang_birangi_dukaan, a1).
quest_tag(rang_birangi_dukaan, language_learning).
quest_tag(rang_birangi_dukaan, vocabulary).

quest_objective(rang_birangi_dukaan, 0, objective('Visit the cloth shop and name 5 fabric colors in Urdu.')).
quest_objective(rang_birangi_dukaan, 1, talk_to(imran_khan_jr, 1)).
quest_objective(rang_birangi_dukaan, 2, collect(dupatta, 1)).

quest_reward(rang_birangi_dukaan, experience, 70).
quest_reward(rang_birangi_dukaan, gold, 30).

quest_available(Player, rang_birangi_dukaan) :-
    quest(rang_birangi_dukaan, _, _, _, active).

%% =====================================================================
%% A2 -- Elementary Quests
%% =====================================================================

%% Quest: Mol Bhao
quest(mol_bhao, 'Mol Bhao', conversation, beginner, active).
quest_assigned_to(mol_bhao, '{{player}}').
quest_language(mol_bhao, urdu).
quest_cefr(mol_bhao, a2).
quest_tag(mol_bhao, language_learning).
quest_tag(mol_bhao, conversation).
quest_prerequisite(mol_bhao, bazaar_mein_ginti).

quest_objective(mol_bhao, 0, objective('Haggle for a shawl using Yeh kitne ka hai?')).
quest_objective(mol_bhao, 1, objective('Use comparisons: sasta (cheaper), mehenga (expensive), acha (good).')).
quest_objective(mol_bhao, 2, collect(pashmina_shawl, 1)).

quest_reward(mol_bhao, experience, 150).
quest_reward(mol_bhao, gold, 75).

quest_available(Player, mol_bhao) :-
    quest(mol_bhao, _, _, _, active),
    quest(bazaar_mein_ginti, _, _, _, _),
    quest_completed(Player, bazaar_mein_ginti).

%% Quest: Rickshaw Mein Safar
quest(rickshaw_mein_safar, 'Rickshaw Mein Safar', grammar, beginner, active).
quest_assigned_to(rickshaw_mein_safar, '{{player}}').
quest_language(rickshaw_mein_safar, urdu).
quest_cefr(rickshaw_mein_safar, a2).
quest_tag(rickshaw_mein_safar, language_learning).
quest_tag(rickshaw_mein_safar, grammar).
quest_prerequisite(rickshaw_mein_safar, assalam_o_alaikum).

quest_objective(rickshaw_mein_safar, 0, objective('Hail a rickshaw and give directions using seedha, dayen, bayen.')).
quest_objective(rickshaw_mein_safar, 1, objective('Navigate from Bazaar Road to Iqbal Avenue using Urdu directions.')).
quest_objective(rickshaw_mein_safar, 2, objective('Pay the rickshaw driver and say Shukriya, bhai sahab.')).

quest_reward(rickshaw_mein_safar, experience, 130).
quest_reward(rickshaw_mein_safar, gold, 60).

quest_available(Player, rickshaw_mein_safar) :-
    quest(rickshaw_mein_safar, _, _, _, active),
    quest(assalam_o_alaikum, _, _, _, _),
    quest_completed(Player, assalam_o_alaikum).

%% Quest: Gharana
quest(gharana, 'Gharana', vocabulary, beginner, active).
quest_assigned_to(gharana, '{{player}}').
quest_language(gharana, urdu).
quest_cefr(gharana, a2).
quest_tag(gharana, language_learning).
quest_tag(gharana, vocabulary).

quest_objective(gharana, 0, talk_to(nasreen_khan, 1)).
quest_objective(gharana, 1, objective('Learn family vocabulary: abba (father), ammi (mother), bhai (brother), behen (sister).')).
quest_objective(gharana, 2, objective('Describe the Khan family tree using Urdu kinship terms.')).

quest_reward(gharana, experience, 120).
quest_reward(gharana, gold, 55).

quest_available(Player, gharana) :-
    quest(gharana, _, _, _, active).

%% Quest: Dawai Khana
quest(dawai_khana, 'Dawai Khana', cultural_knowledge, beginner, active).
quest_assigned_to(dawai_khana, '{{player}}').
quest_language(dawai_khana, urdu).
quest_cefr(dawai_khana, a2).
quest_tag(dawai_khana, language_learning).
quest_tag(dawai_khana, cultural_knowledge).

quest_objective(dawai_khana, 0, objective('Visit the pharmacy and learn body part vocabulary.')).
quest_objective(dawai_khana, 1, talk_to(sana_khan, 1)).
quest_objective(dawai_khana, 2, objective('Explain symptoms using Mujhe bukhar hai and Mera sar dukh raha hai.')).

quest_reward(dawai_khana, experience, 125).
quest_reward(dawai_khana, gold, 50).

quest_available(Player, dawai_khana) :-
    quest(dawai_khana, _, _, _, active).

%% =====================================================================
%% B1 -- Intermediate Quests
%% =====================================================================

%% Quest: Mushaira ki Shaam
quest(mushaira_ki_shaam, 'Mushaira ki Shaam', conversation, intermediate, active).
quest_assigned_to(mushaira_ki_shaam, '{{player}}').
quest_language(mushaira_ki_shaam, urdu).
quest_cefr(mushaira_ki_shaam, b1).
quest_tag(mushaira_ki_shaam, language_learning).
quest_tag(mushaira_ki_shaam, conversation).
quest_prerequisite(mushaira_ki_shaam, mol_bhao).

quest_objective(mushaira_ki_shaam, 0, talk_to(tariq_ahmed, 1)).
quest_objective(mushaira_ki_shaam, 1, objective('Attend the mushaira at the poetry hall and listen to three ghazals.')).
quest_objective(mushaira_ki_shaam, 2, objective('Respond with Wah wah and Irshad at appropriate moments.')).

quest_reward(mushaira_ki_shaam, experience, 300).
quest_reward(mushaira_ki_shaam, gold, 150).

quest_available(Player, mushaira_ki_shaam) :-
    quest(mushaira_ki_shaam, _, _, _, active),
    quest(mol_bhao, _, _, _, _),
    quest_completed(Player, mol_bhao).

%% Quest: Nastaliq Seekhein
quest(nastaliq_seekhein, 'Nastaliq Seekhein', cultural_knowledge, intermediate, active).
quest_assigned_to(nastaliq_seekhein, '{{player}}').
quest_language(nastaliq_seekhein, urdu).
quest_cefr(nastaliq_seekhein, b1).
quest_tag(nastaliq_seekhein, language_learning).
quest_tag(nastaliq_seekhein, cultural_knowledge).

quest_objective(nastaliq_seekhein, 0, talk_to(fatima_ahmed, 1)).
quest_objective(nastaliq_seekhein, 1, objective('Practice writing your name in Nastaliq script at the calligraphy studio.')).
quest_objective(nastaliq_seekhein, 2, collect(nastaliq_calligraphy_set, 1)).

quest_reward(nastaliq_seekhein, experience, 325).
quest_reward(nastaliq_seekhein, gold, 175).

quest_available(Player, nastaliq_seekhein) :-
    quest(nastaliq_seekhein, _, _, _, active).

%% Quest: Cricket Match Mein
quest(cricket_match_mein, 'Cricket Match Mein', exploration, intermediate, active).
quest_assigned_to(cricket_match_mein, '{{player}}').
quest_language(cricket_match_mein, urdu).
quest_cefr(cricket_match_mein, b1).
quest_tag(cricket_match_mein, language_learning).
quest_tag(cricket_match_mein, exploration).

quest_objective(cricket_match_mein, 0, objective('Go to the cricket ground and join a gali cricket match.')).
quest_objective(cricket_match_mein, 1, objective('Learn cricket vocabulary: chowka (four), chhakka (six), wicket, bowling.')).
quest_objective(cricket_match_mein, 2, objective('Narrate three overs of play in Urdu.')).

quest_reward(cricket_match_mein, experience, 350).
quest_reward(cricket_match_mein, gold, 200).

quest_available(Player, cricket_match_mein) :-
    quest(cricket_match_mein, _, _, _, active).

%% Quest: Biryani ka Raaz
quest(biryani_ka_raaz, 'Biryani ka Raaz', grammar, intermediate, active).
quest_assigned_to(biryani_ka_raaz, '{{player}}').
quest_language(biryani_ka_raaz, urdu).
quest_cefr(biryani_ka_raaz, b1).
quest_tag(biryani_ka_raaz, language_learning).
quest_tag(biryani_ka_raaz, grammar).
quest_prerequisite(biryani_ka_raaz, rickshaw_mein_safar).

quest_objective(biryani_ka_raaz, 0, talk_to(sabiha_butt, 1)).
quest_objective(biryani_ka_raaz, 1, objective('Learn a biryani recipe and follow instructions using imperative verbs: daalein, pakaaein, milaaein.')).
quest_objective(biryani_ka_raaz, 2, objective('Write the recipe steps in Urdu using sequential connectors: pehle, phir, akhir mein.')).

quest_reward(biryani_ka_raaz, experience, 325).
quest_reward(biryani_ka_raaz, gold, 175).

quest_available(Player, biryani_ka_raaz) :-
    quest(biryani_ka_raaz, _, _, _, active),
    quest(rickshaw_mein_safar, _, _, _, _),
    quest_completed(Player, rickshaw_mein_safar).

%% =====================================================================
%% B2 -- Upper Intermediate Quests
%% =====================================================================

%% Quest: Iqbal ki Shairi
quest(iqbal_ki_shairi, 'Iqbal ki Shairi', grammar, advanced, active).
quest_assigned_to(iqbal_ki_shairi, '{{player}}').
quest_language(iqbal_ki_shairi, urdu).
quest_cefr(iqbal_ki_shairi, b2).
quest_tag(iqbal_ki_shairi, language_learning).
quest_tag(iqbal_ki_shairi, grammar).
quest_prerequisite(iqbal_ki_shairi, mushaira_ki_shaam).

quest_objective(iqbal_ki_shairi, 0, talk_to(rukhsana_ahmed, 1)).
quest_objective(iqbal_ki_shairi, 1, objective('Analyze a ghazal by Allama Iqbal, identifying the matla, maqta, and radif.')).
quest_objective(iqbal_ki_shairi, 2, objective('Compose a two-line sher using correct Urdu meter and rhyme.')).

quest_reward(iqbal_ki_shairi, experience, 600).
quest_reward(iqbal_ki_shairi, gold, 350).

quest_available(Player, iqbal_ki_shairi) :-
    quest(iqbal_ki_shairi, _, _, _, active),
    quest(mushaira_ki_shaam, _, _, _, _),
    quest_completed(Player, mushaira_ki_shaam).

%% Quest: Aap, Tum, ya Tu
quest(aap_tum_ya_tu, 'Aap, Tum, ya Tu', conversation, advanced, active).
quest_assigned_to(aap_tum_ya_tu, '{{player}}').
quest_language(aap_tum_ya_tu, urdu).
quest_cefr(aap_tum_ya_tu, b2).
quest_tag(aap_tum_ya_tu, language_learning).
quest_tag(aap_tum_ya_tu, conversation).
quest_prerequisite(aap_tum_ya_tu, mushaira_ki_shaam).

quest_objective(aap_tum_ya_tu, 0, objective('Speak with Maulana Hussain Shah using aap (formal you).')).
quest_objective(aap_tum_ya_tu, 1, objective('Speak with Bilal Ahmed using tum (friendly you).')).
quest_objective(aap_tum_ya_tu, 2, objective('Recognize when tu (intimate you) is appropriate versus rude.')).

quest_reward(aap_tum_ya_tu, experience, 650).
quest_reward(aap_tum_ya_tu, gold, 400).

quest_available(Player, aap_tum_ya_tu) :-
    quest(aap_tum_ya_tu, _, _, _, active),
    quest(mushaira_ki_shaam, _, _, _, _),
    quest_completed(Player, mushaira_ki_shaam).

%% Quest: Gaon se Shahar Tak
quest(gaon_se_shahar_tak, 'Gaon se Shahar Tak', exploration, advanced, active).
quest_assigned_to(gaon_se_shahar_tak, '{{player}}').
quest_language(gaon_se_shahar_tak, urdu).
quest_cefr(gaon_se_shahar_tak, b2).
quest_tag(gaon_se_shahar_tak, language_learning).
quest_tag(gaon_se_shahar_tak, exploration).
quest_prerequisite(gaon_se_shahar_tak, biryani_ka_raaz).

quest_objective(gaon_se_shahar_tak, 0, talk_to(aslam_malik, 1)).
quest_objective(gaon_se_shahar_tak, 1, objective('Travel to Sabz Pind and discuss village life vs city life in Urdu.')).
quest_objective(gaon_se_shahar_tak, 2, objective('Write a short essay comparing gaon (village) and shahar (city) using complex sentence structures.')).

quest_reward(gaon_se_shahar_tak, experience, 700).
quest_reward(gaon_se_shahar_tak, gold, 450).

quest_available(Player, gaon_se_shahar_tak) :-
    quest(gaon_se_shahar_tak, _, _, _, active),
    quest(biryani_ka_raaz, _, _, _, _),
    quest_completed(Player, biryani_ka_raaz).
