%% Insimul Quests: Mughal Bengal
%% Source: data/worlds/language/bengali/quests.pl
%% Created: 2026-04-03
%% Total: 16 quests (CEFR A1-B2)

%% ═══════════════════════════════════════════════════════════
%% A1 — Beginner Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Namaskar Sonargaon (Hello Sonargaon)
%% Greet the townspeople and learn basic Bengali introductions.
%% Type: main / Difficulty: beginner / CEFR: A1

quest(namaskar_sonargaon, 'Namaskar Sonargaon', main, beginner, active).
quest_assigned_to(namaskar_sonargaon, '{{player}}').
quest_language(namaskar_sonargaon, bengali).
quest_tag(namaskar_sonargaon, cefr_a1).
quest_tag(namaskar_sonargaon, greetings).

quest_objective(namaskar_sonargaon, 0, talk_to(raghunath_chowdhury, 1)).
quest_objective(namaskar_sonargaon, 1, talk_to(gobinda_das, 1)).
quest_objective(namaskar_sonargaon, 2, talk_to(farid_sheikh, 1)).

quest_reward(namaskar_sonargaon, experience, 50).
quest_reward(namaskar_sonargaon, gold, 25).

quest_available(Player, namaskar_sonargaon) :-
    quest(namaskar_sonargaon, _, _, _, active).

%% Quest: Haat-e Prothom Din (First Day at the Market)
%% Learn the names of common goods at the spice bazaar.
%% Type: side / Difficulty: beginner / CEFR: A1

quest(haat_e_prothom_din, 'Haat-e Prothom Din', side, beginner, active).
quest_assigned_to(haat_e_prothom_din, '{{player}}').
quest_language(haat_e_prothom_din, bengali).
quest_tag(haat_e_prothom_din, cefr_a1).
quest_tag(haat_e_prothom_din, vocabulary).

quest_objective(haat_e_prothom_din, 0, objective('Visit the Moshla Haat and learn the names of five spices in Bengali.')).
quest_objective(haat_e_prothom_din, 1, collect(holud, 1)).
quest_objective(haat_e_prothom_din, 2, collect(marich, 1)).

quest_reward(haat_e_prothom_din, experience, 75).
quest_reward(haat_e_prothom_din, gold, 30).

quest_available(Player, haat_e_prothom_din) :-
    quest(haat_e_prothom_din, _, _, _, active).

%% Quest: Nodite Snan (Bathing at the River)
%% Learn body parts and daily routine vocabulary at the ghat.
%% Type: side / Difficulty: beginner / CEFR: A1

quest(nodite_snan, 'Nodite Snan', side, beginner, active).
quest_assigned_to(nodite_snan, '{{player}}').
quest_language(nodite_snan, bengali).
quest_tag(nodite_snan, cefr_a1).
quest_tag(nodite_snan, daily_routine).

quest_objective(nodite_snan, 0, objective('Go to the Meghna Ghat and speak with the boatman.')).
quest_objective(nodite_snan, 1, talk_to(haripada_mondal, 1)).
quest_objective(nodite_snan, 2, objective('Learn five body part words in Bengali.')).

quest_reward(nodite_snan, experience, 60).
quest_reward(nodite_snan, gold, 20).

quest_available(Player, nodite_snan) :-
    quest(nodite_snan, _, _, _, active).

%% Quest: Bhat ar Dal (Rice and Lentils)
%% Help Lakshmi prepare a meal and learn food vocabulary.
%% Type: side / Difficulty: beginner / CEFR: A1

quest(bhat_ar_dal, 'Bhat ar Dal', side, beginner, active).
quest_assigned_to(bhat_ar_dal, '{{player}}').
quest_language(bhat_ar_dal, bengali).
quest_tag(bhat_ar_dal, cefr_a1).
quest_tag(bhat_ar_dal, food).

quest_objective(bhat_ar_dal, 0, talk_to(lakshmi_mondal, 1)).
quest_objective(bhat_ar_dal, 1, collect(chal, 1)).
quest_objective(bhat_ar_dal, 2, collect(masoor_dal, 1)).

quest_reward(bhat_ar_dal, experience, 65).
quest_reward(bhat_ar_dal, gold, 25).

quest_available(Player, bhat_ar_dal) :-
    quest(bhat_ar_dal, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% A2 — Elementary Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Tanter Golpo (The Weaver's Tale)
%% Help Gobinda Das gather materials for a jamdani sari order.
%% Type: main / Difficulty: intermediate / CEFR: A2

quest(tanter_golpo, 'Tanter Golpo', main, intermediate, active).
quest_assigned_to(tanter_golpo, '{{player}}').
quest_language(tanter_golpo, bengali).
quest_tag(tanter_golpo, cefr_a2).
quest_tag(tanter_golpo, crafts).

quest_objective(tanter_golpo, 0, talk_to(gobinda_das, 1)).
quest_objective(tanter_golpo, 1, collect(sada_suta, 3)).
quest_objective(tanter_golpo, 2, collect(rang_suta, 2)).
quest_objective(tanter_golpo, 3, objective('Return the thread to the Jamdani Taat Ghar.')).

quest_reward(tanter_golpo, experience, 150).
quest_reward(tanter_golpo, gold, 75).

quest_available(Player, tanter_golpo) :-
    quest(tanter_golpo, _, _, _, active).

%% Quest: Macher Bazaar (The Fish Market)
%% Navigate the fish market, haggle prices, and learn numbers.
%% Type: side / Difficulty: intermediate / CEFR: A2

quest(macher_bazaar, 'Macher Bazaar', side, intermediate, active).
quest_assigned_to(macher_bazaar, '{{player}}').
quest_language(macher_bazaar, bengali).
quest_tag(macher_bazaar, cefr_a2).
quest_tag(macher_bazaar, numbers).

quest_objective(macher_bazaar, 0, objective('Visit the Mach Bazaar and learn to count to twenty in Bengali.')).
quest_objective(macher_bazaar, 1, collect(ilish_mach, 2)).
quest_objective(macher_bazaar, 2, talk_to(jatin_mondal, 1)).

quest_reward(macher_bazaar, experience, 125).
quest_reward(macher_bazaar, gold, 60).

quest_available(Player, macher_bazaar) :-
    quest(macher_bazaar, _, _, _, active).

%% Quest: Nouka Bhromon (Boat Journey)
%% Travel by boat from Sonargaon to Chandpur, learning directions.
%% Type: main / Difficulty: intermediate / CEFR: A2

quest(nouka_bhromon, 'Nouka Bhromon', main, intermediate, active).
quest_assigned_to(nouka_bhromon, '{{player}}').
quest_language(nouka_bhromon, bengali).
quest_tag(nouka_bhromon, cefr_a2).
quest_tag(nouka_bhromon, directions).

quest_objective(nouka_bhromon, 0, objective('Go to the Meghna Nauka Ghat and hire a boat.')).
quest_objective(nouka_bhromon, 1, objective('Navigate using Bengali direction words to reach Chandpur.')).
quest_objective(nouka_bhromon, 2, talk_to(madhusudan_pal, 1)).

quest_reward(nouka_bhromon, experience, 175).
quest_reward(nouka_bhromon, gold, 80).

quest_available(Player, nouka_bhromon) :-
    quest(nouka_bhromon, _, _, _, active).

%% Quest: Puja Anusthan (The Temple Ceremony)
%% Attend a ceremony at the Kali Mandir and learn ritual vocabulary.
%% Type: side / Difficulty: intermediate / CEFR: A2

quest(puja_anusthan, 'Puja Anusthan', side, intermediate, active).
quest_assigned_to(puja_anusthan, '{{player}}').
quest_language(puja_anusthan, bengali).
quest_tag(puja_anusthan, cefr_a2).
quest_tag(puja_anusthan, culture).

quest_objective(puja_anusthan, 0, objective('Visit the Kali Mandir on Mandir Lane.')).
quest_objective(puja_anusthan, 1, collect(pushpa_mala, 1)).
quest_objective(puja_anusthan, 2, talk_to(sarojini_chowdhury, 1)).

quest_reward(puja_anusthan, experience, 140).
quest_reward(puja_anusthan, gold, 65).

quest_available(Player, puja_anusthan) :-
    quest(puja_anusthan, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% B1 — Intermediate Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Nawaber Farman (The Nawab's Decree)
%% The Nawab has issued a decree about textile taxes — negotiate on behalf of the weavers.
%% Type: main / Difficulty: advanced / CEFR: B1

quest(nawaber_farman, 'Nawaber Farman', main, advanced, active).
quest_assigned_to(nawaber_farman, '{{player}}').
quest_language(nawaber_farman, bengali).
quest_tag(nawaber_farman, cefr_b1).
quest_tag(nawaber_farman, politics).

quest_objective(nawaber_farman, 0, objective('Read the Nawab''s decree posted at the Darbar.')).
quest_objective(nawaber_farman, 1, talk_to(raghunath_chowdhury, 1)).
quest_objective(nawaber_farman, 2, talk_to(gobinda_das, 1)).
quest_objective(nawaber_farman, 3, objective('Present the weavers'' petition at the Nawab Darbar.')).

quest_reward(nawaber_farman, experience, 300).
quest_reward(nawaber_farman, gold, 150).

quest_available(Player, nawaber_farman) :-
    quest(nawaber_farman, _, _, _, active).

%% Quest: Borsha Rater Gaan (Song of the Monsoon Night)
%% Help Farid Sheikh compose a poem for the monsoon festival.
%% Type: character / Difficulty: advanced / CEFR: B1

quest(borsha_rater_gaan, 'Borsha Rater Gaan', character, advanced, active).
quest_assigned_to(borsha_rater_gaan, '{{player}}').
quest_language(borsha_rater_gaan, bengali).
quest_tag(borsha_rater_gaan, cefr_b1).
quest_tag(borsha_rater_gaan, poetry).

quest_objective(borsha_rater_gaan, 0, talk_to(farid_sheikh, 1)).
quest_objective(borsha_rater_gaan, 1, objective('Collect poetic imagery from three locations during the monsoon.')).
quest_objective(borsha_rater_gaan, 2, objective('Compose a four-line poem in Bengali with Farid''s guidance.')).

quest_reward(borsha_rater_gaan, experience, 350).
quest_reward(borsha_rater_gaan, gold, 175).

quest_available(Player, borsha_rater_gaan) :-
    quest(borsha_rater_gaan, _, _, _, active).

%% Quest: Banijyer Path (The Trade Route)
%% Negotiate a muslin export deal with a visiting Mughal merchant.
%% Type: main / Difficulty: advanced / CEFR: B1

quest(banijyer_path, 'Banijyer Path', main, advanced, active).
quest_assigned_to(banijyer_path, '{{player}}').
quest_language(banijyer_path, bengali).
quest_tag(banijyer_path, cefr_b1).
quest_tag(banijyer_path, trade).

quest_objective(banijyer_path, 0, talk_to(biswanath_sarkar, 1)).
quest_objective(banijyer_path, 1, collect(muslin_thaan, 5)).
quest_objective(banijyer_path, 2, objective('Negotiate the price in Bengali with the visiting merchant.')).
quest_objective(banijyer_path, 3, objective('Deliver the muslin bales to the Meghna Nauka Ghat.')).

quest_reward(banijyer_path, experience, 400).
quest_reward(banijyer_path, gold, 200).

quest_available(Player, banijyer_path) :-
    quest(banijyer_path, _, _, _, active).

%% Quest: Matir Protima (The Clay Idol)
%% Help Madhusudan Pal craft a Durga idol for the annual puja.
%% Type: character / Difficulty: advanced / CEFR: B1

quest(matir_protima, 'Matir Protima', character, advanced, active).
quest_assigned_to(matir_protima, '{{player}}').
quest_language(matir_protima, bengali).
quest_tag(matir_protima, cefr_b1).
quest_tag(matir_protima, art).

quest_objective(matir_protima, 0, talk_to(madhusudan_pal, 1)).
quest_objective(matir_protima, 1, collect(nodi_mati, 3)).
quest_objective(matir_protima, 2, collect(rang, 2)).
quest_objective(matir_protima, 3, objective('Assist with painting the idol and learn color words.')).

quest_reward(matir_protima, experience, 325).
quest_reward(matir_protima, gold, 160).

quest_available(Player, matir_protima) :-
    quest(matir_protima, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% B2 — Upper Intermediate Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Hariye Jaowa Punthi (The Lost Manuscript)
%% A rare Bengali manuscript has gone missing from the madrasa library.
%% Type: main / Difficulty: expert / CEFR: B2

quest(hariye_jaowa_punthi, 'Hariye Jaowa Punthi', main, expert, active).
quest_assigned_to(hariye_jaowa_punthi, '{{player}}').
quest_language(hariye_jaowa_punthi, bengali).
quest_tag(hariye_jaowa_punthi, cefr_b2).
quest_tag(hariye_jaowa_punthi, mystery).

quest_objective(hariye_jaowa_punthi, 0, talk_to(farid_sheikh, 1)).
quest_objective(hariye_jaowa_punthi, 1, objective('Search Panam Nagar for clues about the missing manuscript.')).
quest_objective(hariye_jaowa_punthi, 2, talk_to(kamal_sheikh, 1)).
quest_objective(hariye_jaowa_punthi, 3, objective('Read the manuscript''s colophon in Old Bengali and identify the thief.')).

quest_reward(hariye_jaowa_punthi, experience, 600).
quest_reward(hariye_jaowa_punthi, gold, 300).

quest_available(Player, hariye_jaowa_punthi) :-
    quest(hariye_jaowa_punthi, _, _, _, active).

%% Quest: Banglar Mukh (The Voice of Bengal)
%% Deliver a speech at the monsoon festival defending Bengali literary tradition.
%% Type: character / Difficulty: expert / CEFR: B2

quest(banglar_mukh, 'Banglar Mukh', character, expert, active).
quest_assigned_to(banglar_mukh, '{{player}}').
quest_language(banglar_mukh, bengali).
quest_tag(banglar_mukh, cefr_b2).
quest_tag(banglar_mukh, oratory).

quest_objective(banglar_mukh, 0, talk_to(farid_sheikh, 1)).
quest_objective(banglar_mukh, 1, talk_to(amina_sheikh, 1)).
quest_objective(banglar_mukh, 2, objective('Research Bengali literary history at the Goaldi Masjid library.')).
quest_objective(banglar_mukh, 3, objective('Compose and deliver a persuasive speech in Bengali.')).

quest_reward(banglar_mukh, experience, 700).
quest_reward(banglar_mukh, gold, 350).

quest_available(Player, banglar_mukh) :-
    quest(banglar_mukh, _, _, _, active).

%% Quest: Bonna ar Bangla (The Flood and Bengal)
%% A devastating monsoon flood threatens Chandpur — organize relief.
%% Type: main / Difficulty: expert / CEFR: B2

quest(bonna_ar_bangla, 'Bonna ar Bangla', main, expert, active).
quest_assigned_to(bonna_ar_bangla, '{{player}}').
quest_language(bonna_ar_bangla, bengali).
quest_tag(bonna_ar_bangla, cefr_b2).
quest_tag(bonna_ar_bangla, crisis).

quest_objective(bonna_ar_bangla, 0, objective('Warn the fishermen at Chandpur Ghat about the rising waters.')).
quest_objective(bonna_ar_bangla, 1, talk_to(haripada_mondal, 1)).
quest_objective(bonna_ar_bangla, 2, objective('Coordinate evacuation using formal Bengali commands.')).
quest_objective(bonna_ar_bangla, 3, objective('Negotiate flood relief supplies from the Nawab Darbar.')).

quest_reward(bonna_ar_bangla, experience, 800).
quest_reward(bonna_ar_bangla, gold, 400).

quest_available(Player, bonna_ar_bangla) :-
    quest(bonna_ar_bangla, _, _, _, active).
