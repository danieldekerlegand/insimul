%% Insimul Quests: Welsh Valley
%% Source: data/worlds/language/welsh/quests.json
%% Converted: 2026-04-03T12:00:00Z
%% Total: 16 quests (CEFR A1-B2)

%% ============================================================
%% A1 -- Beginner Quests
%% ============================================================

%% Quest: Bore Da, Cwm Derwen (Good Morning, Cwm Derwen)
%% Greet five residents in Welsh and learn basic introductions.
%% CEFR A1 / Type: main / Difficulty: beginner
quest(bore_da_cwm_derwen, 'Bore Da, Cwm Derwen', main, beginner, active).
quest_assigned_to(bore_da_cwm_derwen, '{{player}}').
quest_language(bore_da_cwm_derwen, welsh).
quest_tag(bore_da_cwm_derwen, cefr_a1).
quest_tag(bore_da_cwm_derwen, greetings).
quest_objective(bore_da_cwm_derwen, 0, talk_to(dafydd_jones, 1)).
quest_objective(bore_da_cwm_derwen, 1, talk_to(gwenllian_williams, 1)).
quest_objective(bore_da_cwm_derwen, 2, talk_to(angharad_evans, 1)).
quest_objective(bore_da_cwm_derwen, 3, talk_to(eleri_thomas, 1)).
quest_objective(bore_da_cwm_derwen, 4, talk_to(siwan_roberts, 1)).
quest_reward(bore_da_cwm_derwen, experience, 50).
quest_reward(bore_da_cwm_derwen, gold, 25).
quest_available(Player, bore_da_cwm_derwen) :-
    quest(bore_da_cwm_derwen, _, _, _, active).

%% Quest: Siopa yn y Stryd Fawr (Shopping on the High Street)
%% Buy bread from the bakery, milk from the grocery, and stamps from the post office using Welsh.
%% CEFR A1 / Type: side / Difficulty: beginner
quest(siopa_yn_y_stryd_fawr, 'Siopa yn y Stryd Fawr', side, beginner, active).
quest_assigned_to(siopa_yn_y_stryd_fawr, '{{player}}').
quest_language(siopa_yn_y_stryd_fawr, welsh).
quest_tag(siopa_yn_y_stryd_fawr, cefr_a1).
quest_tag(siopa_yn_y_stryd_fawr, shopping).
quest_objective(siopa_yn_y_stryd_fawr, 0, collect(bara_brith, 1)).
quest_objective(siopa_yn_y_stryd_fawr, 1, collect(llefrith, 1)).
quest_objective(siopa_yn_y_stryd_fawr, 2, collect(stampiau, 1)).
quest_reward(siopa_yn_y_stryd_fawr, experience, 75).
quest_reward(siopa_yn_y_stryd_fawr, gold, 30).
quest_available(Player, siopa_yn_y_stryd_fawr) :-
    quest(siopa_yn_y_stryd_fawr, _, _, _, active).

%% Quest: Dyddiau y Wythnos (Days of the Week)
%% Learn the days of the week by asking villagers about their schedules.
%% CEFR A1 / Type: side / Difficulty: beginner
quest(dyddiau_r_wythnos, 'Dyddiau''r Wythnos', side, beginner, active).
quest_assigned_to(dyddiau_r_wythnos, '{{player}}').
quest_language(dyddiau_r_wythnos, welsh).
quest_tag(dyddiau_r_wythnos, cefr_a1).
quest_tag(dyddiau_r_wythnos, vocabulary).
quest_objective(dyddiau_r_wythnos, 0, objective('Ask three people what day the market is held.')).
quest_objective(dyddiau_r_wythnos, 1, objective('Ask Megan Jones when the bakery is closed.')).
quest_objective(dyddiau_r_wythnos, 2, objective('Tell Hywel Williams what day it is today.')).
quest_reward(dyddiau_r_wythnos, experience, 60).
quest_reward(dyddiau_r_wythnos, gold, 20).
quest_available(Player, dyddiau_r_wythnos) :-
    quest(dyddiau_r_wythnos, _, _, _, active).

%% Quest: Fy Nheulu I (My Family)
%% Describe family members using Welsh kinship vocabulary.
%% CEFR A1 / Type: side / Difficulty: beginner
quest(fy_nheulu_i, 'Fy Nheulu I', side, beginner, active).
quest_assigned_to(fy_nheulu_i, '{{player}}').
quest_language(fy_nheulu_i, welsh).
quest_tag(fy_nheulu_i, cefr_a1).
quest_tag(fy_nheulu_i, family).
quest_objective(fy_nheulu_i, 0, talk_to(non_davies, 1)).
quest_objective(fy_nheulu_i, 1, objective('Describe the Davies family tree in Welsh to Non.')).
quest_objective(fy_nheulu_i, 2, objective('Learn the words for mam, tad, brawd, chwaer, mab, merch.')).
quest_reward(fy_nheulu_i, experience, 65).
quest_reward(fy_nheulu_i, gold, 25).
quest_available(Player, fy_nheulu_i) :-
    quest(fy_nheulu_i, _, _, _, active).

%% ============================================================
%% A2 -- Elementary Quests
%% ============================================================

%% Quest: Nos Wener yn y Dafarn (Friday Night at the Pub)
%% Order drinks and food at Tafarn y Ddraig Goch and make conversation with regulars.
%% CEFR A2 / Type: side / Difficulty: beginner
quest(nos_wener_yn_y_dafarn, 'Nos Wener yn y Dafarn', side, beginner, active).
quest_assigned_to(nos_wener_yn_y_dafarn, '{{player}}').
quest_language(nos_wener_yn_y_dafarn, welsh).
quest_tag(nos_wener_yn_y_dafarn, cefr_a2).
quest_tag(nos_wener_yn_y_dafarn, social).
quest_objective(nos_wener_yn_y_dafarn, 0, objective('Order a pint and cawl at the bar in Welsh.')).
quest_objective(nos_wener_yn_y_dafarn, 1, talk_to(emyr_evans, 1)).
quest_objective(nos_wener_yn_y_dafarn, 2, objective('Join a conversation about the weekend rugby match.')).
quest_reward(nos_wener_yn_y_dafarn, experience, 100).
quest_reward(nos_wener_yn_y_dafarn, gold, 50).
quest_available(Player, nos_wener_yn_y_dafarn) :-
    quest(nos_wener_yn_y_dafarn, _, _, _, active).

%% Quest: Y Farchnad (The Market)
%% Help Owain Davies sell sheep cheese and lamb at the weekly market.
%% CEFR A2 / Type: side / Difficulty: intermediate
quest(y_farchnad, 'Y Farchnad', side, intermediate, active).
quest_assigned_to(y_farchnad, '{{player}}').
quest_language(y_farchnad, welsh).
quest_tag(y_farchnad, cefr_a2).
quest_tag(y_farchnad, commerce).
quest_objective(y_farchnad, 0, talk_to(owain_davies, 1)).
quest_objective(y_farchnad, 1, objective('Sell five items to customers using Welsh numbers and prices.')).
quest_objective(y_farchnad, 2, objective('Negotiate a bulk purchase with a restaurant owner.')).
quest_reward(y_farchnad, experience, 120).
quest_reward(y_farchnad, gold, 80).
quest_available(Player, y_farchnad) :-
    quest(y_farchnad, _, _, _, active).

%% Quest: Tywydd Cymru (Welsh Weather)
%% Discuss the weather with locals and learn weather vocabulary.
%% CEFR A2 / Type: side / Difficulty: beginner
quest(tywydd_cymru, 'Tywydd Cymru', side, beginner, active).
quest_assigned_to(tywydd_cymru, '{{player}}').
quest_language(tywydd_cymru, welsh).
quest_tag(tywydd_cymru, cefr_a2).
quest_tag(tywydd_cymru, weather).
quest_objective(tywydd_cymru, 0, objective('Ask five different people about the weather today.')).
quest_objective(tywydd_cymru, 1, objective('Learn glaw, haul, gwynt, niwl, eira, cymylog.')).
quest_objective(tywydd_cymru, 2, objective('Give a weather report to Hywel Williams for the school noticeboard.')).
quest_reward(tywydd_cymru, experience, 90).
quest_reward(tywydd_cymru, gold, 40).
quest_available(Player, tywydd_cymru) :-
    quest(tywydd_cymru, _, _, _, active).

%% ============================================================
%% B1 -- Intermediate Quests
%% ============================================================

%% Quest: Treftadaeth y Llechi (Slate Heritage)
%% Help Eleri Thomas curate a new exhibition at the Slate Museum.
%% CEFR B1 / Type: main / Difficulty: intermediate
quest(treftadaeth_y_llechi, 'Treftadaeth y Llechi', main, intermediate, active).
quest_assigned_to(treftadaeth_y_llechi, '{{player}}').
quest_language(treftadaeth_y_llechi, welsh).
quest_tag(treftadaeth_y_llechi, cefr_b1).
quest_tag(treftadaeth_y_llechi, culture).
quest_objective(treftadaeth_y_llechi, 0, talk_to(eleri_thomas, 1)).
quest_objective(treftadaeth_y_llechi, 1, objective('Interview three former quarrymen about their memories in Welsh.')).
quest_objective(treftadaeth_y_llechi, 2, objective('Write exhibition labels in Welsh for five artefacts.')).
quest_objective(treftadaeth_y_llechi, 3, objective('Present the exhibition plan to the town council.')).
quest_reward(treftadaeth_y_llechi, experience, 250).
quest_reward(treftadaeth_y_llechi, gold, 150).
quest_available(Player, treftadaeth_y_llechi) :-
    quest(treftadaeth_y_llechi, _, _, _, active).

%% Quest: Y Gig Mawr (The Big Gig)
%% Organise a live Welsh-language music night at Tafarn y Ddraig Goch.
%% CEFR B1 / Type: character / Difficulty: intermediate
quest(y_gig_mawr, 'Y Gig Mawr', character, intermediate, active).
quest_assigned_to(y_gig_mawr, '{{player}}').
quest_language(y_gig_mawr, welsh).
quest_tag(y_gig_mawr, cefr_b1).
quest_tag(y_gig_mawr, music).
quest_objective(y_gig_mawr, 0, talk_to(ffion_evans, 1)).
quest_objective(y_gig_mawr, 1, objective('Convince three musicians to perform by speaking Welsh.')).
quest_objective(y_gig_mawr, 2, objective('Design a bilingual poster for the event.')).
quest_objective(y_gig_mawr, 3, objective('Introduce each act on stage in Welsh.')).
quest_reward(y_gig_mawr, experience, 200).
quest_reward(y_gig_mawr, gold, 120).
quest_available(Player, y_gig_mawr) :-
    quest(y_gig_mawr, _, _, _, active).

%% Quest: Diwrnod Shearing (Shearing Day)
%% Participate in the annual sheep shearing at Fferm Cwm Uchaf.
%% CEFR B1 / Type: side / Difficulty: intermediate
quest(diwrnod_cneifio, 'Diwrnod Cneifio', side, intermediate, active).
quest_assigned_to(diwrnod_cneifio, '{{player}}').
quest_language(diwrnod_cneifio, welsh).
quest_tag(diwrnod_cneifio, cefr_b1).
quest_tag(diwrnod_cneifio, farming).
quest_objective(diwrnod_cneifio, 0, talk_to(gethin_davies, 1)).
quest_objective(diwrnod_cneifio, 1, objective('Learn farming vocabulary: cneifio, dafad, oen, ci defaid, ffens.')).
quest_objective(diwrnod_cneifio, 2, objective('Help coordinate the shearing team using Welsh instructions.')).
quest_objective(diwrnod_cneifio, 3, objective('Share a meal with the farmers and discuss the season.')).
quest_reward(diwrnod_cneifio, experience, 220).
quest_reward(diwrnod_cneifio, gold, 100).
quest_available(Player, diwrnod_cneifio) :-
    quest(diwrnod_cneifio, _, _, _, active).

%% Quest: Treigladau! (Mutations!)
%% Master soft mutation through guided conversations with Gwenllian.
%% CEFR B1 / Type: side / Difficulty: intermediate
quest(treigladau, 'Treigladau!', side, intermediate, active).
quest_assigned_to(treigladau, '{{player}}').
quest_language(treigladau, welsh).
quest_tag(treigladau, cefr_b1).
quest_tag(treigladau, grammar).
quest_objective(treigladau, 0, talk_to(gwenllian_williams, 1)).
quest_objective(treigladau, 1, objective('Complete five soft mutation exercises at the school.')).
quest_objective(treigladau, 2, objective('Use soft mutation correctly in conversation with three locals.')).
quest_objective(treigladau, 3, objective('Pass the mutation quiz at the library.')).
quest_reward(treigladau, experience, 300).
quest_reward(treigladau, gold, 100).
quest_available(Player, treigladau) :-
    quest(treigladau, _, _, _, active).

%% ============================================================
%% B2 -- Upper Intermediate Quests
%% ============================================================

%% Quest: Eisteddfod y Cwm (The Valley Eisteddfod)
%% Compete in the local eisteddfod -- poetry, singing, or prose recitation in Welsh.
%% CEFR B2 / Type: main / Difficulty: advanced
quest(eisteddfod_y_cwm, 'Eisteddfod y Cwm', main, advanced, active).
quest_assigned_to(eisteddfod_y_cwm, '{{player}}').
quest_language(eisteddfod_y_cwm, welsh).
quest_tag(eisteddfod_y_cwm, cefr_b2).
quest_tag(eisteddfod_y_cwm, culture).
quest_objective(eisteddfod_y_cwm, 0, talk_to(siwan_roberts, 1)).
quest_objective(eisteddfod_y_cwm, 1, objective('Choose a competition category and prepare an entry in Welsh.')).
quest_objective(eisteddfod_y_cwm, 2, objective('Recite or perform the entry before the adjudicators.')).
quest_objective(eisteddfod_y_cwm, 3, objective('Discuss the performances with other competitors in Welsh.')).
quest_reward(eisteddfod_y_cwm, experience, 500).
quest_reward(eisteddfod_y_cwm, gold, 300).
quest_available(Player, eisteddfod_y_cwm) :-
    quest(eisteddfod_y_cwm, _, _, _, active).

%% Quest: Dadl y Cyngor (The Council Debate)
%% Debate a controversial planning proposal at the town council meeting in Welsh.
%% CEFR B2 / Type: character / Difficulty: advanced
quest(dadl_y_cyngor, 'Dadl y Cyngor', character, advanced, active).
quest_assigned_to(dadl_y_cyngor, '{{player}}').
quest_language(dadl_y_cyngor, welsh).
quest_tag(dadl_y_cyngor, cefr_b2).
quest_tag(dadl_y_cyngor, politics).
quest_objective(dadl_y_cyngor, 0, objective('Read the planning proposal document in Welsh.')).
quest_objective(dadl_y_cyngor, 1, objective('Interview residents to gather opinions in Welsh.')).
quest_objective(dadl_y_cyngor, 2, objective('Prepare and deliver a formal speech at the council meeting.')).
quest_objective(dadl_y_cyngor, 3, objective('Respond to questions and counter-arguments in Welsh.')).
quest_reward(dadl_y_cyngor, experience, 600).
quest_reward(dadl_y_cyngor, gold, 250).
quest_available(Player, dadl_y_cyngor) :-
    quest(dadl_y_cyngor, _, _, _, active).

%% Quest: Stori y Cwm (The Valley Story)
%% Write a short story in Welsh for the local literary magazine.
%% CEFR B2 / Type: side / Difficulty: advanced
quest(stori_r_cwm, 'Stori''r Cwm', side, advanced, active).
quest_assigned_to(stori_r_cwm, '{{player}}').
quest_language(stori_r_cwm, welsh).
quest_tag(stori_r_cwm, cefr_b2).
quest_tag(stori_r_cwm, literature).
quest_objective(stori_r_cwm, 0, objective('Visit the library and read three Welsh short stories for inspiration.')).
quest_objective(stori_r_cwm, 1, objective('Interview two residents for character inspiration.')).
quest_objective(stori_r_cwm, 2, objective('Write a 500-word short story in Welsh.')).
quest_objective(stori_r_cwm, 3, talk_to(sioned_williams, 1)).
quest_reward(stori_r_cwm, experience, 450).
quest_reward(stori_r_cwm, gold, 200).
quest_available(Player, stori_r_cwm) :-
    quest(stori_r_cwm, _, _, _, active).

%% Quest: Cyfweliad Radio Cymru (Radio Cymru Interview)
%% Be interviewed live on the local Welsh-language radio station about life in Cwm Derwen.
%% CEFR B2 / Type: character / Difficulty: advanced
quest(cyfweliad_radio_cymru, 'Cyfweliad Radio Cymru', character, advanced, active).
quest_assigned_to(cyfweliad_radio_cymru, '{{player}}').
quest_language(cyfweliad_radio_cymru, welsh).
quest_tag(cyfweliad_radio_cymru, cefr_b2).
quest_tag(cyfweliad_radio_cymru, media).
quest_objective(cyfweliad_radio_cymru, 0, objective('Prepare talking points about the town in Welsh.')).
quest_objective(cyfweliad_radio_cymru, 1, objective('Answer five live interview questions in fluent Welsh.')).
quest_objective(cyfweliad_radio_cymru, 2, objective('Handle an unexpected caller question about Welsh independence.')).
quest_reward(cyfweliad_radio_cymru, experience, 550).
quest_reward(cyfweliad_radio_cymru, gold, 280).
quest_available(Player, cyfweliad_radio_cymru) :-
    quest(cyfweliad_radio_cymru, _, _, _, active).

%% Quest: Dirgelwch y Chwarel (Mystery of the Quarry)
%% Investigate strange occurrences at the abandoned upper quarry -- reading old Welsh documents and interviewing elders.
%% CEFR B2 / Type: main / Difficulty: advanced
quest(dirgelwch_y_chwarel, 'Dirgelwch y Chwarel', main, advanced, active).
quest_assigned_to(dirgelwch_y_chwarel, '{{player}}').
quest_language(dirgelwch_y_chwarel, welsh).
quest_tag(dirgelwch_y_chwarel, cefr_b2).
quest_tag(dirgelwch_y_chwarel, mystery).
quest_objective(dirgelwch_y_chwarel, 0, talk_to(gareth_thomas, 1)).
quest_objective(dirgelwch_y_chwarel, 1, objective('Read the old quarry ledgers written in 19th-century Welsh.')).
quest_objective(dirgelwch_y_chwarel, 2, objective('Interview Bryn Roberts about the legends of the upper quarry.')).
quest_objective(dirgelwch_y_chwarel, 3, objective('Piece together the historical evidence and present findings.')).
quest_reward(dirgelwch_y_chwarel, experience, 800).
quest_reward(dirgelwch_y_chwarel, gold, 400).
quest_available(Player, dirgelwch_y_chwarel) :-
    quest(dirgelwch_y_chwarel, _, _, _, active).
