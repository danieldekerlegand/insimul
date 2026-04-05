%% Insimul Quests: Bengali Riverside Town
%% Source: data/worlds/language/bengali/quests.pl
%% Created: 2026-04-03
%% Total: 16 quests (CEFR A1-B2)

%% ======================================================
%% A1 -- Beginner Quests
%% ======================================================

%% Quest: Prothom Salam (First Greetings)
quest(prothom_salam, 'Prothom Salam', conversation, beginner, active).
quest_assigned_to(prothom_salam, '{{player}}').
quest_language(prothom_salam, bengali).
quest_tag(prothom_salam, generated).
quest_objective(prothom_salam, 0, talk_to('karim_rahman', 1)).
quest_objective(prothom_salam, 1, objective('Learn basic Bengali greetings: assalamu alaikum, namaskar, kemon achhen.')).
quest_objective(prothom_salam, 2, talk_to('rashida_rahman', 1)).
quest_reward(prothom_salam, experience, 100).
quest_reward(prothom_salam, gold, 50).
quest_available(Player, prothom_salam) :-
    quest(prothom_salam, _, _, _, active).

%% Quest: Cha Khabar (Tea Time)
quest(cha_khabar, 'Cha Khabar', vocabulary, beginner, active).
quest_assigned_to(cha_khabar, '{{player}}').
quest_language(cha_khabar, bengali).
quest_tag(cha_khabar, generated).
quest_objective(cha_khabar, 0, objective('Visit Karim Bhai Cha Stall.')).
quest_objective(cha_khabar, 1, objective('Learn the names of five types of tea and snacks in Bengali.')).
quest_objective(cha_khabar, 2, objective('Order cha and shinghara using Bengali.')).
quest_reward(cha_khabar, experience, 100).
quest_reward(cha_khabar, gold, 50).
quest_available(Player, cha_khabar) :-
    quest(cha_khabar, _, _, _, active).

%% Quest: Shongkha Shekha (Counting)
quest(shongkha_shekha, 'Shongkha Shekha', vocabulary, beginner, active).
quest_assigned_to(shongkha_shekha, '{{player}}').
quest_language(shongkha_shekha, bengali).
quest_tag(shongkha_shekha, generated).
quest_objective(shongkha_shekha, 0, objective('Learn Bengali numbers 1-20 and the Bengali numeral script.')).
quest_objective(shongkha_shekha, 1, objective('Count fish at the Mach Bazaar with Habibur Molla.')).
quest_objective(shongkha_shekha, 2, objective('Pay for an item at a shop using the correct Bengali number.')).
quest_reward(shongkha_shekha, experience, 120).
quest_reward(shongkha_shekha, gold, 60).
quest_available(Player, shongkha_shekha) :-
    quest(shongkha_shekha, _, _, _, active).

%% Quest: Amar Poribar (My Family)
quest(amar_poribar, 'Amar Poribar', conversation, beginner, active).
quest_assigned_to(amar_poribar, '{{player}}').
quest_language(amar_poribar, bengali).
quest_tag(amar_poribar, generated).
quest_objective(amar_poribar, 0, talk_to('rashida_rahman', 1)).
quest_objective(amar_poribar, 1, objective('Learn family vocabulary: ma, baba, bhai, bon, chele, meye.')).
quest_objective(amar_poribar, 2, objective('Describe your own family in Bengali to Rashida.')).
quest_reward(amar_poribar, experience, 100).
quest_reward(amar_poribar, gold, 50).
quest_available(Player, amar_poribar) :-
    quest(amar_poribar, _, _, _, active).

%% ======================================================
%% A2 -- Elementary Quests
%% ======================================================

%% Quest: Bazaar Shondhan (Bazaar Scavenger Hunt)
quest(bazaar_shondhan, 'Bazaar Shondhan', exploration, beginner, active).
quest_assigned_to(bazaar_shondhan, '{{player}}').
quest_language(bazaar_shondhan, bengali).
quest_tag(bazaar_shondhan, generated).
quest_objective(bazaar_shondhan, 0, objective('Find the fish market and buy ilish mach (hilsa fish).')).
quest_objective(bazaar_shondhan, 1, objective('Find the textile shop and learn fabric names in Bengali.')).
quest_objective(bazaar_shondhan, 2, objective('Find the bookstore and ask for a recommendation in Bengali.')).
quest_reward(bazaar_shondhan, experience, 150).
quest_reward(bazaar_shondhan, gold, 80).
quest_available(Player, bazaar_shondhan) :-
    quest(bazaar_shondhan, _, _, _, active).

%% Quest: Cha er Adab (Tea Customs)
quest(cha_er_adab, 'Cha er Adab', cultural_knowledge, beginner, active).
quest_assigned_to(cha_er_adab, '{{player}}').
quest_language(cha_er_adab, bengali).
quest_tag(cha_er_adab, generated).
quest_objective(cha_er_adab, 0, talk_to('karim_rahman', 1)).
quest_objective(cha_er_adab, 1, objective('Learn the etiquette of Bengali tea culture and adda (conversation).')).
quest_objective(cha_er_adab, 2, objective('Serve cha to three guests using proper Bengali phrases.')).
quest_reward(cha_er_adab, experience, 150).
quest_reward(cha_er_adab, gold, 75).
quest_available(Player, cha_er_adab) :-
    quest(cha_er_adab, _, _, _, active).

%% Quest: Dik Nirdeshona (Directions)
quest(dik_nirdeshona, 'Dik Nirdeshona', grammar, beginner, active).
quest_assigned_to(dik_nirdeshona, '{{player}}').
quest_language(dik_nirdeshona, bengali).
quest_tag(dik_nirdeshona, generated).
quest_objective(dik_nirdeshona, 0, objective('Learn direction words: dane, bame, soja, pechone.')).
quest_objective(dik_nirdeshona, 1, objective('Ask three people for directions in Bengali.')).
quest_objective(dik_nirdeshona, 2, objective('Navigate to the Nodi Ghat using only Bengali directions.')).
quest_reward(dik_nirdeshona, experience, 150).
quest_reward(dik_nirdeshona, gold, 80).
quest_available(Player, dik_nirdeshona) :-
    quest(dik_nirdeshona, _, _, _, active).

%% Quest: Khabar Utshob (Food Festival)
quest(khabar_utshob, 'Khabar Utshob', vocabulary, beginner, active).
quest_assigned_to(khabar_utshob, '{{player}}').
quest_language(khabar_utshob, bengali).
quest_tag(khabar_utshob, generated).
quest_objective(khabar_utshob, 0, objective('Visit Haji Biryani House and order a meal in Bengali.')).
quest_objective(khabar_utshob, 1, objective('Learn 10 food words at the Ilish Bhater Hotel.')).
quest_objective(khabar_utshob, 2, objective('Describe your favorite food in Bengali to Salma Ahmed.')).
quest_reward(khabar_utshob, experience, 160).
quest_reward(khabar_utshob, gold, 80).
quest_available(Player, khabar_utshob) :-
    quest(khabar_utshob, _, _, _, active).

%% ======================================================
%% B1 -- Intermediate Quests
%% ======================================================

%% Quest: Bishwobidyalay Bhromon (University Tour)
quest(bishwobidyalay_bhromon, 'Bishwobidyalay Bhromon', exploration, intermediate, active).
quest_assigned_to(bishwobidyalay_bhromon, '{{player}}').
quest_language(bishwobidyalay_bhromon, bengali).
quest_tag(bishwobidyalay_bhromon, generated).
quest_objective(bishwobidyalay_bhromon, 0, talk_to('anwar_hossain', 1)).
quest_objective(bishwobidyalay_bhromon, 1, objective('Tour the university campus and learn academic vocabulary in Bengali.')).
quest_objective(bishwobidyalay_bhromon, 2, objective('Introduce yourself to three students in formal Bengali using apni.')).
quest_objective(bishwobidyalay_bhromon, 3, talk_to('tahmina_hossain', 1)).
quest_reward(bishwobidyalay_bhromon, experience, 250).
quest_reward(bishwobidyalay_bhromon, gold, 120).
quest_available(Player, bishwobidyalay_bhromon) :-
    quest(bishwobidyalay_bhromon, _, _, _, active).

%% Quest: Nakshi Kantha Kotha (Art of Embroidery)
quest(nakshi_kantha_kotha, 'Nakshi Kantha Kotha', cultural_knowledge, intermediate, active).
quest_assigned_to(nakshi_kantha_kotha, '{{player}}').
quest_language(nakshi_kantha_kotha, bengali).
quest_tag(nakshi_kantha_kotha, generated).
quest_objective(nakshi_kantha_kotha, 0, objective('Visit Muslin Kaporer Dokan textile shop.')).
quest_objective(nakshi_kantha_kotha, 1, objective('Learn about nakshi kantha embroidery, jamdani weaving, and muslin traditions.')).
quest_objective(nakshi_kantha_kotha, 2, objective('Describe a kantha pattern using Bengali color and shape vocabulary.')).
quest_reward(nakshi_kantha_kotha, experience, 250).
quest_reward(nakshi_kantha_kotha, gold, 100).
quest_available(Player, nakshi_kantha_kotha) :-
    quest(nakshi_kantha_kotha, _, _, _, active).

%% Quest: Nodir Dhare (By the River)
quest(nodir_dhare, 'Nodir Dhare', conversation, intermediate, active).
quest_assigned_to(nodir_dhare, '{{player}}').
quest_language(nodir_dhare, bengali).
quest_tag(nodir_dhare, generated).
quest_objective(nodir_dhare, 0, objective('Travel to Shonar Gaon village.')).
quest_objective(nodir_dhare, 1, talk_to('habibur_molla', 1)).
quest_objective(nodir_dhare, 2, objective('Help Habibur describe the day catch using river and fish vocabulary.')).
quest_objective(nodir_dhare, 3, objective('Have a conversation about village life with Jahanara Khatun.')).
quest_reward(nodir_dhare, experience, 280).
quest_reward(nodir_dhare, gold, 130).
quest_available(Player, nodir_dhare) :-
    quest(nodir_dhare, _, _, _, active).

%% Quest: Bazare Daradari (Bargaining at the Bazaar)
quest(bazare_daradari, 'Bazare Daradari', grammar, intermediate, active).
quest_assigned_to(bazare_daradari, '{{player}}').
quest_language(bazare_daradari, bengali).
quest_tag(bazare_daradari, generated).
quest_objective(bazare_daradari, 0, objective('Learn comparative forms in Bengali: beshi, kom, cheye boro.')).
quest_objective(bazare_daradari, 1, objective('Bargain for a sari at Jamdani Sari House.')).
quest_objective(bazare_daradari, 2, objective('Successfully negotiate a price reduction using Bengali.')).
quest_reward(bazare_daradari, experience, 250).
quest_reward(bazare_daradari, gold, 150).
quest_available(Player, bazare_daradari) :-
    quest(bazare_daradari, _, _, _, active).

%% ======================================================
%% B2 -- Upper Intermediate Quests
%% ======================================================

%% Quest: Dhan Kathar Shomoy (Rice Harvest Season)
quest(dhan_kathar_shomoy, 'Dhan Kathar Shomoy', conversation, advanced, active).
quest_assigned_to(dhan_kathar_shomoy, '{{player}}').
quest_language(dhan_kathar_shomoy, bengali).
quest_tag(dhan_kathar_shomoy, generated).
quest_objective(dhan_kathar_shomoy, 0, objective('Visit Monir Sarker at the rice mill in Shonar Gaon.')).
quest_objective(dhan_kathar_shomoy, 1, talk_to('monir_sarker', 1)).
quest_objective(dhan_kathar_shomoy, 2, objective('Discuss rice farming traditions and monsoon cycles in Bengali.')).
quest_objective(dhan_kathar_shomoy, 3, objective('Write a short paragraph about agriculture in Bengali.')).
quest_reward(dhan_kathar_shomoy, experience, 400).
quest_reward(dhan_kathar_shomoy, gold, 200).
quest_available(Player, dhan_kathar_shomoy) :-
    quest(dhan_kathar_shomoy, _, _, _, active).

%% Quest: Torko Shobha (The Debate)
quest(torko_shobha, 'Torko Shobha', grammar, advanced, active).
quest_assigned_to(torko_shobha, '{{player}}').
quest_language(torko_shobha, bengali).
quest_tag(torko_shobha, generated).
quest_objective(torko_shobha, 0, talk_to('anwar_hossain', 1)).
quest_objective(torko_shobha, 1, objective('Learn to express opinions: ami mone kori, ami bishwas kori, ami ekmot noi.')).
quest_objective(torko_shobha, 2, objective('Participate in an adda debate at the university on a cultural topic.')).
quest_objective(torko_shobha, 3, objective('Use conditional sentences (jodi...tahole) in your arguments.')).
quest_reward(torko_shobha, experience, 450).
quest_reward(torko_shobha, gold, 200).
quest_available(Player, torko_shobha) :-
    quest(torko_shobha, _, _, _, active).

%% Quest: Pohela Boishakh Utshob (New Year Festival)
quest(pohela_boishakh_utshob, 'Pohela Boishakh Utshob', cultural_knowledge, advanced, active).
quest_assigned_to(pohela_boishakh_utshob, '{{player}}').
quest_language(pohela_boishakh_utshob, bengali).
quest_tag(pohela_boishakh_utshob, generated).
quest_objective(pohela_boishakh_utshob, 0, objective('Interview three residents about Pohela Boishakh traditions.')).
quest_objective(pohela_boishakh_utshob, 1, objective('Learn vocabulary for festival activities: mangal shobhajatra, panta ilish, alpona.')).
quest_objective(pohela_boishakh_utshob, 2, objective('Write a short essay about Bangla Noboborsho in Bengali.')).
quest_objective(pohela_boishakh_utshob, 3, talk_to('nasreen_hossain', 1)).
quest_reward(pohela_boishakh_utshob, experience, 500).
quest_reward(pohela_boishakh_utshob, gold, 250).
quest_available(Player, pohela_boishakh_utshob) :-
    quest(pohela_boishakh_utshob, _, _, _, active).

%% Quest: Nodir Gaan (Song of the River)
quest(nodir_gaan, 'Nodir Gaan', exploration, advanced, active).
quest_assigned_to(nodir_gaan, '{{player}}').
quest_language(nodir_gaan, bengali).
quest_tag(nodir_gaan, generated).
quest_objective(nodir_gaan, 0, objective('Walk along the Nodi Ghat and describe the river scenery in Bengali.')).
quest_objective(nodir_gaan, 1, objective('Have an extended conversation with a boatman about life on the river.')).
quest_objective(nodir_gaan, 2, objective('Learn and recite a Rabindranath Tagore poem about the river in Bengali.')).
quest_reward(nodir_gaan, experience, 450).
quest_reward(nodir_gaan, gold, 200).
quest_available(Player, nodir_gaan) :-
    quest(nodir_gaan, _, _, _, active).
