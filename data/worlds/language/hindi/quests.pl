%% Insimul Quests: Hindi Town
%% Source: data/worlds/language/hindi/quests.pl
%% Created: 2026-04-03
%% Total: 16 quests (CEFR A1-B2)

%% ===============================================================
%% A1 -- Beginner Quests
%% ===============================================================

%% Quest: Pehli Namaste (First Hello)
quest(pehli_namaste, 'Pehli Namaste', conversation, beginner, active).
quest_assigned_to(pehli_namaste, '{{player}}').
quest_language(pehli_namaste, hindi).
quest_tag(pehli_namaste, generated).
quest_objective(pehli_namaste, 0, talk_to('rajesh_sharma', 1)).
quest_objective(pehli_namaste, 1, objective('Learn basic Hindi greetings: namaste, namaskar, aap kaise hain.')).
quest_objective(pehli_namaste, 2, talk_to('sunita_sharma', 1)).
quest_reward(pehli_namaste, experience, 100).
quest_reward(pehli_namaste, gold, 50).
quest_available(Player, pehli_namaste) :-
    quest(pehli_namaste, _, _, _, active).

%% Quest: Chai Ki Dukaan (At the Chai Stall)
quest(chai_ki_dukaan, 'Chai Ki Dukaan', vocabulary, beginner, active).
quest_assigned_to(chai_ki_dukaan, '{{player}}').
quest_language(chai_ki_dukaan, hindi).
quest_tag(chai_ki_dukaan, generated).
quest_objective(chai_ki_dukaan, 0, objective('Visit Sharma Chai Stall on Bazaar Road.')).
quest_objective(chai_ki_dukaan, 1, objective('Learn the names of five beverages in Hindi: chai, doodh, paani, lassi, nimbu paani.')).
quest_objective(chai_ki_dukaan, 2, objective('Order a cup of chai using Hindi.')).
quest_reward(chai_ki_dukaan, experience, 100).
quest_reward(chai_ki_dukaan, gold, 50).
quest_available(Player, chai_ki_dukaan) :-
    quest(chai_ki_dukaan, _, _, _, active).

%% Quest: Ginati Seekho (Learn Counting)
quest(ginati_seekho, 'Ginati Seekho', vocabulary, beginner, active).
quest_assigned_to(ginati_seekho, '{{player}}').
quest_language(ginati_seekho, hindi).
quest_tag(ginati_seekho, generated).
quest_objective(ginati_seekho, 0, objective('Learn Hindi numbers 1-20: ek, do, teen, chaar, paanch...')).
quest_objective(ginati_seekho, 1, objective('Count items at Gupta Kirana Store with Vinod Gupta.')).
quest_objective(ginati_seekho, 2, objective('Pay for an item using the correct Hindi number.')).
quest_reward(ginati_seekho, experience, 120).
quest_reward(ginati_seekho, gold, 60).
quest_available(Player, ginati_seekho) :-
    quest(ginati_seekho, _, _, _, active).

%% Quest: Mera Parivaar (My Family)
quest(mera_parivaar, 'Mera Parivaar', conversation, beginner, active).
quest_assigned_to(mera_parivaar, '{{player}}').
quest_language(mera_parivaar, hindi).
quest_tag(mera_parivaar, generated).
quest_objective(mera_parivaar, 0, talk_to('sunita_sharma', 1)).
quest_objective(mera_parivaar, 1, objective('Learn family vocabulary: maa, pitaji, bhai, behen, beta, beti, dada, dadi.')).
quest_objective(mera_parivaar, 2, objective('Describe your own family in Hindi to Sunita.')).
quest_reward(mera_parivaar, experience, 100).
quest_reward(mera_parivaar, gold, 50).
quest_available(Player, mera_parivaar) :-
    quest(mera_parivaar, _, _, _, active).

%% ===============================================================
%% A2 -- Elementary Quests
%% ===============================================================

%% Quest: Bazaar Mein Khareedi (Shopping in the Bazaar)
quest(bazaar_khareedi, 'Bazaar Mein Khareedi', exploration, beginner, active).
quest_assigned_to(bazaar_khareedi, '{{player}}').
quest_language(bazaar_khareedi, hindi).
quest_tag(bazaar_khareedi, generated).
quest_objective(bazaar_khareedi, 0, objective('Find Gupta Kirana Store and buy rice (chaaval).')).
quest_objective(bazaar_khareedi, 1, objective('Find the cloth shop and learn fabric names in Hindi.')).
quest_objective(bazaar_khareedi, 2, objective('Find Saraswati Pustak Bhandar and ask for a book recommendation in Hindi.')).
quest_reward(bazaar_khareedi, experience, 150).
quest_reward(bazaar_khareedi, gold, 80).
quest_available(Player, bazaar_khareedi) :-
    quest(bazaar_khareedi, _, _, _, active).

%% Quest: Samosa Aur Chai (Samosa and Tea)
quest(samosa_aur_chai, 'Samosa Aur Chai', vocabulary, beginner, active).
quest_assigned_to(samosa_aur_chai, '{{player}}').
quest_language(samosa_aur_chai, hindi).
quest_tag(samosa_aur_chai, generated).
quest_objective(samosa_aur_chai, 0, objective('Visit Verma Samosa Corner and order a meal in Hindi.')).
quest_objective(samosa_aur_chai, 1, objective('Learn 10 food words: samosa, roti, daal, sabzi, chaaval, raita, chutney, pakora, paratha, halwa.')).
quest_objective(samosa_aur_chai, 2, objective('Describe your favorite food in Hindi to Savitri Verma.')).
quest_reward(samosa_aur_chai, experience, 160).
quest_reward(samosa_aur_chai, gold, 80).
quest_available(Player, samosa_aur_chai) :-
    quest(samosa_aur_chai, _, _, _, active).

%% Quest: Auto-Rickshaw Mein Safar (Rickshaw Ride)
quest(auto_rickshaw_safar, 'Auto-Rickshaw Mein Safar', grammar, beginner, active).
quest_assigned_to(auto_rickshaw_safar, '{{player}}').
quest_language(auto_rickshaw_safar, hindi).
quest_tag(auto_rickshaw_safar, generated).
quest_objective(auto_rickshaw_safar, 0, objective('Learn direction words: daayein, baayein, seedha, peeche, yahan, wahan.')).
quest_objective(auto_rickshaw_safar, 1, objective('Ask three people for directions in Hindi.')).
quest_objective(auto_rickshaw_safar, 2, objective('Navigate to Shiv Mandir using only Hindi directions from the auto stand.')).
quest_reward(auto_rickshaw_safar, experience, 150).
quest_reward(auto_rickshaw_safar, gold, 80).
quest_available(Player, auto_rickshaw_safar) :-
    quest(auto_rickshaw_safar, _, _, _, active).

%% Quest: Mithai Ki Dukaan (The Sweet Shop)
quest(mithai_ki_dukaan, 'Mithai Ki Dukaan', cultural_knowledge, beginner, active).
quest_assigned_to(mithai_ki_dukaan, '{{player}}').
quest_language(mithai_ki_dukaan, hindi).
quest_tag(mithai_ki_dukaan, generated).
quest_objective(mithai_ki_dukaan, 0, talk_to('suresh_mishra', 1)).
quest_objective(mithai_ki_dukaan, 1, objective('Learn about Indian sweets: laddu, barfi, jalebi, gulab jamun, rasgulla.')).
quest_objective(mithai_ki_dukaan, 2, objective('Buy sweets for a festival celebration using proper Hindi phrases.')).
quest_reward(mithai_ki_dukaan, experience, 150).
quest_reward(mithai_ki_dukaan, gold, 75).
quest_available(Player, mithai_ki_dukaan) :-
    quest(mithai_ki_dukaan, _, _, _, active).

%% ===============================================================
%% B1 -- Intermediate Quests
%% ===============================================================

%% Quest: IT Park Mein Naukri (Job at the IT Park)
quest(it_park_naukri, 'IT Park Mein Naukri', exploration, intermediate, active).
quest_assigned_to(it_park_naukri, '{{player}}').
quest_language(it_park_naukri, hindi).
quest_tag(it_park_naukri, generated).
quest_objective(it_park_naukri, 0, talk_to('devendra_singh', 1)).
quest_objective(it_park_naukri, 1, objective('Tour the IT park and learn professional Hindi vocabulary.')).
quest_objective(it_park_naukri, 2, objective('Introduce yourself to three colleagues in formal Hindi using aap.')).
quest_objective(it_park_naukri, 3, talk_to('kavita_singh', 1)).
quest_reward(it_park_naukri, experience, 250).
quest_reward(it_park_naukri, gold, 120).
quest_available(Player, it_park_naukri) :-
    quest(it_park_naukri, _, _, _, active).

%% Quest: Bollywood Ka Jaadu (Bollywood Magic)
quest(bollywood_jaadu, 'Bollywood Ka Jaadu', cultural_knowledge, intermediate, active).
quest_assigned_to(bollywood_jaadu, '{{player}}').
quest_language(bollywood_jaadu, hindi).
quest_tag(bollywood_jaadu, generated).
quest_objective(bollywood_jaadu, 0, objective('Visit Raj Cinema Hall.')).
quest_objective(bollywood_jaadu, 1, objective('Learn about Bollywood film genres and famous dialogues in Hindi.')).
quest_objective(bollywood_jaadu, 2, objective('Discuss your favorite film in Hindi with Sanjay Verma.')).
quest_reward(bollywood_jaadu, experience, 250).
quest_reward(bollywood_jaadu, gold, 100).
quest_available(Player, bollywood_jaadu) :-
    quest(bollywood_jaadu, _, _, _, active).

%% Quest: Gaon Ki Zindagi (Village Life)
quest(gaon_ki_zindagi, 'Gaon Ki Zindagi', conversation, intermediate, active).
quest_assigned_to(gaon_ki_zindagi, '{{player}}').
quest_language(gaon_ki_zindagi, hindi).
quest_tag(gaon_ki_zindagi, generated).
quest_objective(gaon_ki_zindagi, 0, objective('Travel to Kishanpura village.')).
quest_objective(gaon_ki_zindagi, 1, talk_to('ramesh_patel', 1)).
quest_objective(gaon_ki_zindagi, 2, objective('Help Ramesh describe his dairy work using agricultural vocabulary.')).
quest_objective(gaon_ki_zindagi, 3, objective('Have a conversation about village life with Kamla Patel.')).
quest_reward(gaon_ki_zindagi, experience, 280).
quest_reward(gaon_ki_zindagi, gold, 130).
quest_available(Player, gaon_ki_zindagi) :-
    quest(gaon_ki_zindagi, _, _, _, active).

%% Quest: Mol-Tol Ka Hunar (Art of Bargaining)
quest(mol_tol_hunar, 'Mol-Tol Ka Hunar', grammar, intermediate, active).
quest_assigned_to(mol_tol_hunar, '{{player}}').
quest_language(mol_tol_hunar, hindi).
quest_tag(mol_tol_hunar, generated).
quest_objective(mol_tol_hunar, 0, objective('Learn comparative forms in Hindi: zyaada, kam, sabse achha, sabse sasta.')).
quest_objective(mol_tol_hunar, 1, objective('Bargain for cloth at Kapoor Cloth Emporium.')).
quest_objective(mol_tol_hunar, 2, objective('Successfully negotiate a price reduction using Hindi.')).
quest_reward(mol_tol_hunar, experience, 250).
quest_reward(mol_tol_hunar, gold, 150).
quest_available(Player, mol_tol_hunar) :-
    quest(mol_tol_hunar, _, _, _, active).

%% ===============================================================
%% B2 -- Upper Intermediate Quests
%% ===============================================================

%% Quest: Mandir Mein Darshan (Temple Visit)
quest(mandir_darshan, 'Mandir Mein Darshan', cultural_knowledge, advanced, active).
quest_assigned_to(mandir_darshan, '{{player}}').
quest_language(mandir_darshan, hindi).
quest_tag(mandir_darshan, generated).
quest_objective(mandir_darshan, 0, objective('Visit Shiv Mandir on Mandir Marg.')).
quest_objective(mandir_darshan, 1, talk_to('geeta_mishra', 1)).
quest_objective(mandir_darshan, 2, objective('Discuss temple customs, puja rituals, and festivals in Hindi.')).
quest_objective(mandir_darshan, 3, objective('Write a short paragraph about Diwali celebrations in Hindi.')).
quest_reward(mandir_darshan, experience, 400).
quest_reward(mandir_darshan, gold, 200).
quest_available(Player, mandir_darshan) :-
    quest(mandir_darshan, _, _, _, active).

%% Quest: Bahas (The Debate)
quest(bahas, 'Bahas', grammar, advanced, active).
quest_assigned_to(bahas, '{{player}}').
quest_language(bahas, hindi).
quest_tag(bahas, generated).
quest_objective(bahas, 0, talk_to('devendra_singh', 1)).
quest_objective(bahas, 1, objective('Learn to express opinions: mujhe lagta hai, mera maanna hai, main asahmati hoon.')).
quest_objective(bahas, 2, objective('Participate in a debate about technology and tradition at the IT park.')).
quest_objective(bahas, 3, objective('Use conditional sentences (agar...to) in your arguments.')).
quest_reward(bahas, experience, 450).
quest_reward(bahas, gold, 200).
quest_available(Player, bahas) :-
    quest(bahas, _, _, _, active).

%% Quest: Akhbaar Ke Liye Lekh (Writing for the Newspaper)
quest(akhbaar_lekh, 'Akhbaar Ke Liye Lekh', cultural_knowledge, advanced, active).
quest_assigned_to(akhbaar_lekh, '{{player}}').
quest_language(akhbaar_lekh, hindi).
quest_tag(akhbaar_lekh, generated).
quest_objective(akhbaar_lekh, 0, objective('Interview three residents about a community topic in Hindi.')).
quest_objective(akhbaar_lekh, 1, objective('Take notes using Hindi shorthand in Devanagari script.')).
quest_objective(akhbaar_lekh, 2, objective('Write a short article in formal Hindi (shuddh Hindi).')).
quest_objective(akhbaar_lekh, 3, talk_to('anita_singh', 1)).
quest_reward(akhbaar_lekh, experience, 500).
quest_reward(akhbaar_lekh, gold, 250).
quest_available(Player, akhbaar_lekh) :-
    quest(akhbaar_lekh, _, _, _, active).

%% Quest: Sangeet Sandhya (Musical Evening)
quest(sangeet_sandhya, 'Sangeet Sandhya', exploration, advanced, active).
quest_assigned_to(sangeet_sandhya, '{{player}}').
quest_language(sangeet_sandhya, hindi).
quest_tag(sangeet_sandhya, generated).
quest_objective(sangeet_sandhya, 0, objective('Visit Saaz Sangeet Vidyalaya and learn about raaga and taal in Hindi.')).
quest_objective(sangeet_sandhya, 1, objective('Have an extended conversation about Bollywood music and classical traditions.')).
quest_objective(sangeet_sandhya, 2, objective('Narrate a short story about the Ghanta Ghar clock tower in Hindi.')).
quest_reward(sangeet_sandhya, experience, 450).
quest_reward(sangeet_sandhya, gold, 200).
quest_available(Player, sangeet_sandhya) :-
    quest(sangeet_sandhya, _, _, _, active).
