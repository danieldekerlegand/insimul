%% Insimul Quests: Indonesian Coastal Town
%% Source: data/worlds/language/indonesian/quests.pl
%% Created: 2026-04-03
%% Total: 16 quests (CEFR A1-B2)

%% ===============================================================
%% A1 -- Beginner Quests
%% ===============================================================

%% Quest: Salam Pertama (First Greetings)
quest(salam_pertama, 'Salam Pertama', conversation, beginner, active).
quest_assigned_to(salam_pertama, '{{player}}').
quest_language(salam_pertama, indonesian).
quest_tag(salam_pertama, generated).
quest_objective(salam_pertama, 0, talk_to('budi_suryadi', 1)).
quest_objective(salam_pertama, 1, objective('Learn basic Indonesian greetings: selamat pagi, selamat siang, selamat sore, selamat malam.')).
quest_objective(salam_pertama, 2, talk_to('sari_suryadi', 1)).
quest_reward(salam_pertama, experience, 100).
quest_reward(salam_pertama, gold, 50).
quest_available(Player, salam_pertama) :-
    quest(salam_pertama, _, _, _, active).

%% Quest: Di Warung (At the Warung)
quest(di_warung, 'Di Warung', vocabulary, beginner, active).
quest_assigned_to(di_warung, '{{player}}').
quest_language(di_warung, indonesian).
quest_tag(di_warung, generated).
quest_objective(di_warung, 0, objective('Visit Warung Sari Laut.')).
quest_objective(di_warung, 1, objective('Learn the names of five Indonesian dishes: nasi goreng, mie goreng, sate, gado-gado, soto.')).
quest_objective(di_warung, 2, objective('Order nasi goreng and es teh using Indonesian.')).
quest_reward(di_warung, experience, 100).
quest_reward(di_warung, gold, 50).
quest_available(Player, di_warung) :-
    quest(di_warung, _, _, _, active).

%% Quest: Menghitung (Counting)
quest(menghitung, 'Menghitung', vocabulary, beginner, active).
quest_assigned_to(menghitung, '{{player}}').
quest_language(menghitung, indonesian).
quest_tag(menghitung, generated).
quest_objective(menghitung, 0, objective('Learn Indonesian numbers satu through dua puluh.')).
quest_objective(menghitung, 1, objective('Count items at the traditional market with Hendra Pratama.')).
quest_objective(menghitung, 2, objective('Pay for an item using the correct Indonesian number.')).
quest_reward(menghitung, experience, 120).
quest_reward(menghitung, gold, 60).
quest_available(Player, menghitung) :-
    quest(menghitung, _, _, _, active).

%% Quest: Keluarga Saya (My Family)
quest(keluarga_saya, 'Keluarga Saya', conversation, beginner, active).
quest_assigned_to(keluarga_saya, '{{player}}').
quest_language(keluarga_saya, indonesian).
quest_tag(keluarga_saya, generated).
quest_objective(keluarga_saya, 0, talk_to('sari_suryadi', 1)).
quest_objective(keluarga_saya, 1, objective('Learn family vocabulary: ibu, bapak, kakak, adik, anak, nenek, kakek.')).
quest_objective(keluarga_saya, 2, objective('Describe your own family in Indonesian to Sari.')).
quest_reward(keluarga_saya, experience, 100).
quest_reward(keluarga_saya, gold, 50).
quest_available(Player, keluarga_saya) :-
    quest(keluarga_saya, _, _, _, active).

%% ===============================================================
%% A2 -- Elementary Quests
%% ===============================================================

%% Quest: Jalan-Jalan di Pasar (Market Stroll)
quest(jalan_jalan_pasar, 'Jalan-Jalan di Pasar', exploration, beginner, active).
quest_assigned_to(jalan_jalan_pasar, '{{player}}').
quest_language(jalan_jalan_pasar, indonesian).
quest_tag(jalan_jalan_pasar, generated).
quest_objective(jalan_jalan_pasar, 0, objective('Find the spice shop and buy kunyit (turmeric).')).
quest_objective(jalan_jalan_pasar, 1, objective('Find the textile shop and learn names of fabrics.')).
quest_objective(jalan_jalan_pasar, 2, objective('Find the bookstore and ask for a recommendation in Indonesian.')).
quest_reward(jalan_jalan_pasar, experience, 150).
quest_reward(jalan_jalan_pasar, gold, 80).
quest_available(Player, jalan_jalan_pasar) :-
    quest(jalan_jalan_pasar, _, _, _, active).

%% Quest: Minum Kopi (Drinking Coffee)
quest(minum_kopi, 'Minum Kopi', cultural_knowledge, beginner, active).
quest_assigned_to(minum_kopi, '{{player}}').
quest_language(minum_kopi, indonesian).
quest_tag(minum_kopi, generated).
quest_objective(minum_kopi, 0, talk_to('budi_suryadi', 1)).
quest_objective(minum_kopi, 1, objective('Learn about Indonesian coffee culture and kopi tubruk brewing.')).
quest_objective(minum_kopi, 2, objective('Order three different drinks in Indonesian at Warung Kopi Mantap.')).
quest_reward(minum_kopi, experience, 150).
quest_reward(minum_kopi, gold, 75).
quest_available(Player, minum_kopi) :-
    quest(minum_kopi, _, _, _, active).

%% Quest: Tanya Jalan (Asking Directions)
quest(tanya_jalan, 'Tanya Jalan', grammar, beginner, active).
quest_assigned_to(tanya_jalan, '{{player}}').
quest_language(tanya_jalan, indonesian).
quest_tag(tanya_jalan, generated).
quest_objective(tanya_jalan, 0, objective('Learn direction words: kiri, kanan, lurus, belok, dekat, jauh.')).
quest_objective(tanya_jalan, 1, objective('Ask three people for directions in Indonesian.')).
quest_objective(tanya_jalan, 2, objective('Navigate to the lighthouse using only Indonesian directions.')).
quest_reward(tanya_jalan, experience, 150).
quest_reward(tanya_jalan, gold, 80).
quest_available(Player, tanya_jalan) :-
    quest(tanya_jalan, _, _, _, active).

%% Quest: Pesta Makanan (Food Festival)
quest(pesta_makanan, 'Pesta Makanan', vocabulary, beginner, active).
quest_assigned_to(pesta_makanan, '{{player}}').
quest_language(pesta_makanan, indonesian).
quest_tag(pesta_makanan, generated).
quest_objective(pesta_makanan, 0, objective('Visit Rumah Makan Padang Sederhana and order a meal in Indonesian.')).
quest_objective(pesta_makanan, 1, objective('Learn 10 food words at Warung Ikan Bakar.')).
quest_objective(pesta_makanan, 2, objective('Describe your favorite food in Indonesian to Yuni Pratama.')).
quest_reward(pesta_makanan, experience, 160).
quest_reward(pesta_makanan, gold, 80).
quest_available(Player, pesta_makanan) :-
    quest(pesta_makanan, _, _, _, active).

%% ===============================================================
%% B1 -- Intermediate Quests
%% ===============================================================

%% Quest: Belajar Batik (Learning Batik)
quest(belajar_batik, 'Belajar Batik', cultural_knowledge, intermediate, active).
quest_assigned_to(belajar_batik, '{{player}}').
quest_language(belajar_batik, indonesian).
quest_tag(belajar_batik, generated).
quest_objective(belajar_batik, 0, talk_to('dewi_wicaksono', 1)).
quest_objective(belajar_batik, 1, objective('Learn about batik techniques: tulis, cap, and printing.')).
quest_objective(belajar_batik, 2, objective('Describe batik patterns using Indonesian color and shape vocabulary.')).
quest_objective(belajar_batik, 3, talk_to('putri_wicaksono', 1)).
quest_reward(belajar_batik, experience, 250).
quest_reward(belajar_batik, gold, 120).
quest_available(Player, belajar_batik) :-
    quest(belajar_batik, _, _, _, active).

%% Quest: Ke Pelabuhan (To the Harbor)
quest(ke_pelabuhan, 'Ke Pelabuhan', conversation, intermediate, active).
quest_assigned_to(ke_pelabuhan, '{{player}}').
quest_language(ke_pelabuhan, indonesian).
quest_tag(ke_pelabuhan, generated).
quest_objective(ke_pelabuhan, 0, objective('Travel to the harbor district.')).
quest_objective(ke_pelabuhan, 1, talk_to('harto_santoso', 1)).
quest_objective(ke_pelabuhan, 2, objective('Help Harto describe his catch using marine vocabulary.')).
quest_objective(ke_pelabuhan, 3, objective('Have a conversation about fishing life with Ratna Santoso.')).
quest_reward(ke_pelabuhan, experience, 280).
quest_reward(ke_pelabuhan, gold, 130).
quest_available(Player, ke_pelabuhan) :-
    quest(ke_pelabuhan, _, _, _, active).

%% Quest: Tawar-Menawar (Bargaining)
quest(tawar_menawar, 'Tawar-Menawar', grammar, intermediate, active).
quest_assigned_to(tawar_menawar, '{{player}}').
quest_language(tawar_menawar, indonesian).
quest_tag(tawar_menawar, generated).
quest_objective(tawar_menawar, 0, objective('Learn comparison words: lebih, paling, kurang, sama.')).
quest_objective(tawar_menawar, 1, objective('Bargain for batik cloth at Toko Kain Indah.')).
quest_objective(tawar_menawar, 2, objective('Successfully negotiate a price reduction using Indonesian.')).
quest_reward(tawar_menawar, experience, 250).
quest_reward(tawar_menawar, gold, 150).
quest_available(Player, tawar_menawar) :-
    quest(tawar_menawar, _, _, _, active).

%% Quest: Suara Gamelan (Sound of Gamelan)
quest(suara_gamelan, 'Suara Gamelan', cultural_knowledge, intermediate, active).
quest_assigned_to(suara_gamelan, '{{player}}').
quest_language(suara_gamelan, indonesian).
quest_tag(suara_gamelan, generated).
quest_objective(suara_gamelan, 0, objective('Visit Sanggar Gamelan Sari.')).
quest_objective(suara_gamelan, 1, objective('Learn the names of gamelan instruments: bonang, saron, kendang, gong.')).
quest_objective(suara_gamelan, 2, objective('Describe the music using Indonesian adjectives and adverbs.')).
quest_reward(suara_gamelan, experience, 250).
quest_reward(suara_gamelan, gold, 100).
quest_available(Player, suara_gamelan) :-
    quest(suara_gamelan, _, _, _, active).

%% ===============================================================
%% B2 -- Upper Intermediate Quests
%% ===============================================================

%% Quest: Panen Padi (Rice Harvest)
quest(panen_padi, 'Panen Padi', conversation, advanced, active).
quest_assigned_to(panen_padi, '{{player}}').
quest_language(panen_padi, indonesian).
quest_tag(panen_padi, generated).
quest_objective(panen_padi, 0, objective('Visit Suryo Widodo at the rice mill in Desa Sawah.')).
quest_objective(panen_padi, 1, talk_to('suryo_widodo', 1)).
quest_objective(panen_padi, 2, objective('Discuss rice farming traditions and gotong royong in Indonesian.')).
quest_objective(panen_padi, 3, objective('Write a short paragraph about agriculture in Indonesian.')).
quest_reward(panen_padi, experience, 400).
quest_reward(panen_padi, gold, 200).
quest_available(Player, panen_padi) :-
    quest(panen_padi, _, _, _, active).

%% Quest: Diskusi (The Discussion)
quest(diskusi, 'Diskusi', grammar, advanced, active).
quest_assigned_to(diskusi, '{{player}}').
quest_language(diskusi, indonesian).
quest_tag(diskusi, generated).
quest_objective(diskusi, 0, talk_to('bambang_kusuma', 1)).
quest_objective(diskusi, 1, objective('Learn to express opinions: saya pikir, menurut saya, saya tidak setuju.')).
quest_objective(diskusi, 2, objective('Participate in a discussion at the school on a cultural topic.')).
quest_objective(diskusi, 3, objective('Use conditional sentences with kalau and jika in your arguments.')).
quest_reward(diskusi, experience, 450).
quest_reward(diskusi, gold, 200).
quest_available(Player, diskusi) :-
    quest(diskusi, _, _, _, active).

%% Quest: Menulis Cerita (Writing a Story)
quest(menulis_cerita, 'Menulis Cerita', cultural_knowledge, advanced, active).
quest_assigned_to(menulis_cerita, '{{player}}').
quest_language(menulis_cerita, indonesian).
quest_tag(menulis_cerita, generated).
quest_objective(menulis_cerita, 0, objective('Interview three residents about life in Pantai Mutiara.')).
quest_objective(menulis_cerita, 1, objective('Take notes using Indonesian.')).
quest_objective(menulis_cerita, 2, objective('Write a short article in formal Indonesian about the town.')).
quest_objective(menulis_cerita, 3, talk_to('sri_kusuma', 1)).
quest_reward(menulis_cerita, experience, 500).
quest_reward(menulis_cerita, gold, 250).
quest_available(Player, menulis_cerita) :-
    quest(menulis_cerita, _, _, _, active).

%% Quest: Jelajah Pantai (Coastal Exploration)
quest(jelajah_pantai, 'Jelajah Pantai', exploration, advanced, active).
quest_assigned_to(jelajah_pantai, '{{player}}').
quest_language(jelajah_pantai, indonesian).
quest_tag(jelajah_pantai, generated).
quest_objective(jelajah_pantai, 0, objective('Walk the entire harbor district and describe the scenery in Indonesian.')).
quest_objective(jelajah_pantai, 1, objective('Have an extended conversation with a stranger about life in the town.')).
quest_objective(jelajah_pantai, 2, objective('Narrate a short story about the lighthouse in Indonesian.')).
quest_reward(jelajah_pantai, experience, 450).
quest_reward(jelajah_pantai, gold, 200).
quest_available(Player, jelajah_pantai) :-
    quest(jelajah_pantai, _, _, _, active).
