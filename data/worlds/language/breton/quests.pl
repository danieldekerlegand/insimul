%% Insimul Quests: Medieval Brittany
%% Source: data/worlds/language/breton/quests.pl
%% Created: 2026-04-03
%% Total: 16 quests (CEFR A1-B2)

%% ═══════════════════════════════════════════════════════════
%% A1 — Beginner Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Demat Porzh-Gwenn (Hello Porzh-Gwenn)
%% Greet the villagers and learn basic Breton introductions.
%% Type: main / Difficulty: beginner / CEFR: A1

quest(demat_porzh_gwenn, 'Demat Porzh-Gwenn', main, beginner, active).
quest_assigned_to(demat_porzh_gwenn, '{{player}}').
quest_language(demat_porzh_gwenn, breton).
quest_tag(demat_porzh_gwenn, cefr_a1).
quest_tag(demat_porzh_gwenn, greetings).

quest_objective(demat_porzh_gwenn, 0, talk_to(yann_le_bihan, 1)).
quest_objective(demat_porzh_gwenn, 1, talk_to(goulven_kernev, 1)).
quest_objective(demat_porzh_gwenn, 2, talk_to(riwal_karadeg, 1)).

quest_reward(demat_porzh_gwenn, experience, 50).
quest_reward(demat_porzh_gwenn, gold, 25).

quest_available(Player, demat_porzh_gwenn) :-
    quest(demat_porzh_gwenn, _, _, _, active).

%% Quest: War ar Marc'had (At the Market)
%% Learn the names of common goods at the village market.
%% Type: side / Difficulty: beginner / CEFR: A1

quest(war_ar_marc_had, 'War ar Marc''had', side, beginner, active).
quest_assigned_to(war_ar_marc_had, '{{player}}').
quest_language(war_ar_marc_had, breton).
quest_tag(war_ar_marc_had, cefr_a1).
quest_tag(war_ar_marc_had, vocabulary).

quest_objective(war_ar_marc_had, 0, objective('Visit the market square and learn the names of five goods in Breton.')).
quest_objective(war_ar_marc_had, 1, collect(bara, 1)).
quest_objective(war_ar_marc_had, 2, collect(sistr, 1)).

quest_reward(war_ar_marc_had, experience, 75).
quest_reward(war_ar_marc_had, gold, 30).

quest_available(Player, war_ar_marc_had) :-
    quest(war_ar_marc_had, _, _, _, active).

%% Quest: Pesked an Deiz (Fish of the Day)
%% Help the fishermen and learn fish/sea vocabulary.
%% Type: side / Difficulty: beginner / CEFR: A1

quest(pesked_an_deiz, 'Pesked an Deiz', side, beginner, active).
quest_assigned_to(pesked_an_deiz, '{{player}}').
quest_language(pesked_an_deiz, breton).
quest_tag(pesked_an_deiz, cefr_a1).
quest_tag(pesked_an_deiz, food).

quest_objective(pesked_an_deiz, 0, talk_to(yann_le_bihan, 1)).
quest_objective(pesked_an_deiz, 1, objective('Learn the Breton names for five types of fish.')).
quest_objective(pesked_an_deiz, 2, collect(pesked_moged, 1)).

quest_reward(pesked_an_deiz, experience, 60).
quest_reward(pesked_an_deiz, gold, 20).

quest_available(Player, pesked_an_deiz) :-
    quest(pesked_an_deiz, _, _, _, active).

%% Quest: Ti ha Tiegezh (House and Family)
%% Visit homes and learn family/dwelling vocabulary.
%% Type: side / Difficulty: beginner / CEFR: A1

quest(ti_ha_tiegezh, 'Ti ha Tiegezh', side, beginner, active).
quest_assigned_to(ti_ha_tiegezh, '{{player}}').
quest_language(ti_ha_tiegezh, breton).
quest_tag(ti_ha_tiegezh, cefr_a1).
quest_tag(ti_ha_tiegezh, daily_routine).

quest_objective(ti_ha_tiegezh, 0, objective('Visit three homes and learn Breton family terms.')).
quest_objective(ti_ha_tiegezh, 1, talk_to(soazig_le_bihan, 1)).
quest_objective(ti_ha_tiegezh, 2, talk_to(nolwenn_kernev, 1)).

quest_reward(ti_ha_tiegezh, experience, 60).
quest_reward(ti_ha_tiegezh, gold, 20).

quest_available(Player, ti_ha_tiegezh) :-
    quest(ti_ha_tiegezh, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% A2 — Elementary Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Ar Sistr Nevez (The New Cider)
%% Help at the cider press and learn about apple harvest vocabulary.
%% Type: side / Difficulty: beginner / CEFR: A2

quest(ar_sistr_nevez, 'Ar Sistr Nevez', side, beginner, active).
quest_assigned_to(ar_sistr_nevez, '{{player}}').
quest_language(ar_sistr_nevez, breton).
quest_tag(ar_sistr_nevez, cefr_a2).
quest_tag(ar_sistr_nevez, vocabulary).

quest_objective(ar_sistr_nevez, 0, visit_location(2_hent_ar_park_17)).
quest_objective(ar_sistr_nevez, 1, collect(aval, 3)).
quest_objective(ar_sistr_nevez, 2, objective('Describe the cider-making process using five new Breton words.')).

quest_reward(ar_sistr_nevez, experience, 100).
quest_reward(ar_sistr_nevez, gold, 40).

quest_available(Player, ar_sistr_nevez) :-
    quest(ar_sistr_nevez, _, _, _, active).

%% Quest: Hent ar Mein Hir (Path of the Standing Stones)
%% Explore the standing stones and learn directions and landscape vocabulary.
%% Type: exploration / Difficulty: beginner / CEFR: A2

quest(hent_ar_mein_hir_quest, 'Hent ar Mein Hir', exploration, beginner, active).
quest_assigned_to(hent_ar_mein_hir_quest, '{{player}}').
quest_language(hent_ar_mein_hir_quest, breton).
quest_tag(hent_ar_mein_hir_quest, cefr_a2).
quest_tag(hent_ar_mein_hir_quest, exploration).

quest_objective(hent_ar_mein_hir_quest, 0, discover_location(3_hent_ar_mein_hir_10)).
quest_objective(hent_ar_mein_hir_quest, 1, discover_location(2_hent_ar_c_hoat_28)).
quest_objective(hent_ar_mein_hir_quest, 2, objective('Describe the stones using Breton directional words.')).

quest_reward(hent_ar_mein_hir_quest, experience, 100).
quest_reward(hent_ar_mein_hir_quest, gold, 35).

quest_available(Player, hent_ar_mein_hir_quest) :-
    quest(hent_ar_mein_hir_quest, _, _, _, active).

%% Quest: Gwiadenn ar Vro (Weaving of the Land)
%% Learn about Breton weaving and textile vocabulary.
%% Type: character / Difficulty: beginner / CEFR: A2

quest(gwiadenn_ar_vro, 'Gwiadenn ar Vro', character, beginner, active).
quest_assigned_to(gwiadenn_ar_vro, '{{player}}').
quest_language(gwiadenn_ar_vro, breton).
quest_tag(gwiadenn_ar_vro, cefr_a2).
quest_tag(gwiadenn_ar_vro, crafting).

quest_objective(gwiadenn_ar_vro, 0, talk_to(goulven_kernev, 1)).
quest_objective(gwiadenn_ar_vro, 1, collect(neud_gloan, 2)).
quest_objective(gwiadenn_ar_vro, 2, objective('Describe three Breton textile patterns using colour vocabulary.')).

quest_reward(gwiadenn_ar_vro, experience, 100).
quest_reward(gwiadenn_ar_vro, gold, 45).

quest_available(Player, gwiadenn_ar_vro) :-
    quest(gwiadenn_ar_vro, _, _, _, active).

%% Quest: Louzou ha Plantennoù (Herbs and Plants)
%% Help the herbalist gather medicinal plants.
%% Type: collection / Difficulty: beginner / CEFR: A2

quest(louzou_ha_plantennou, 'Louzou ha Plantennoù', collection, beginner, active).
quest_assigned_to(louzou_ha_plantennou, '{{player}}').
quest_language(louzou_ha_plantennou, breton).
quest_tag(louzou_ha_plantennou, cefr_a2).
quest_tag(louzou_ha_plantennou, herbalism).

quest_objective(louzou_ha_plantennou, 0, talk_to(enora_morvan, 1)).
quest_objective(louzou_ha_plantennou, 1, collect(louzaouenn, 3)).
quest_objective(louzou_ha_plantennou, 2, deliver(louzaouenn, enora_morvan)).

quest_reward(louzou_ha_plantennou, experience, 90).
quest_reward(louzou_ha_plantennou, gold, 35).

quest_available(Player, louzou_ha_plantennou) :-
    quest(louzou_ha_plantennou, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% B1 — Intermediate Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Ar Pardon Bras (The Great Pardon)
%% Participate in the religious festival and learn ceremonial vocabulary.
%% Type: cultural / Difficulty: intermediate / CEFR: B1

quest(ar_pardon_bras, 'Ar Pardon Bras', cultural, intermediate, active).
quest_assigned_to(ar_pardon_bras, '{{player}}').
quest_language(ar_pardon_bras, breton).
quest_tag(ar_pardon_bras, cefr_b1).
quest_tag(ar_pardon_bras, cultural).

quest_objective(ar_pardon_bras, 0, visit_location(2_hent_ar_chapel_6)).
quest_objective(ar_pardon_bras, 1, talk_to(gwenael_karadeg, 1)).
quest_objective(ar_pardon_bras, 2, objective('Describe the Pardon procession using at least ten Breton sentences.')).

quest_reward(ar_pardon_bras, experience, 150).
quest_reward(ar_pardon_bras, gold, 60).

quest_available(Player, ar_pardon_bras) :-
    quest(ar_pardon_bras, _, _, _, active).

%% Quest: Kemener ar Mor (Tailor of the Sea)
%% Negotiate the purchase of a sail using maritime and trade vocabulary.
%% Type: shopping / Difficulty: intermediate / CEFR: B1

quest(kemener_ar_mor, 'Kemener ar Mor', shopping, intermediate, active).
quest_assigned_to(kemener_ar_mor, '{{player}}').
quest_language(kemener_ar_mor, breton).
quest_tag(kemener_ar_mor, cefr_b1).
quest_tag(kemener_ar_mor, number_practice).

quest_objective(kemener_ar_mor, 0, visit_location(5_hent_ar_porzh_1)).
quest_objective(kemener_ar_mor, 1, objective('Negotiate a price for a new sail in Breton, using numbers and bargaining phrases.')).
quest_objective(kemener_ar_mor, 2, collect(gwel_bag, 1)).

quest_reward(kemener_ar_mor, experience, 150).
quest_reward(kemener_ar_mor, gold, 55).

quest_available(Player, kemener_ar_mor) :-
    quest(kemener_ar_mor, _, _, _, active).

%% Quest: Treuzkas Kentelioù (Mutation Lessons)
%% Learn about Breton consonant mutations through conversation.
%% Type: grammar / Difficulty: intermediate / CEFR: B1

quest(treuzkas_kenteliou, 'Treuzkas Kentelioù', grammar, intermediate, active).
quest_assigned_to(treuzkas_kenteliou, '{{player}}').
quest_language(treuzkas_kenteliou, breton).
quest_tag(treuzkas_kenteliou, cefr_b1).
quest_tag(treuzkas_kenteliou, grammar).

quest_objective(treuzkas_kenteliou, 0, talk_to(konan_morvan, 1)).
quest_objective(treuzkas_kenteliou, 1, objective('Correctly apply soft mutation (kemmadur dre vlotaat) in five sentences.')).
quest_objective(treuzkas_kenteliou, 2, objective('Correctly apply spirant mutation (kemmadur dre c''hwezhadenniñ) in three sentences.')).

quest_reward(treuzkas_kenteliou, experience, 175).
quest_reward(treuzkas_kenteliou, gold, 50).

quest_available(Player, treuzkas_kenteliou) :-
    quest(treuzkas_kenteliou, _, _, _, active).

%% Quest: Istor ar Govadeg (Story of the Smithy)
%% Listen to the smith tell a folk tale and retell it.
%% Type: storytelling / Difficulty: intermediate / CEFR: B1

quest(istor_ar_govadeg, 'Istor ar Govadeg', storytelling, intermediate, active).
quest_assigned_to(istor_ar_govadeg, '{{player}}').
quest_language(istor_ar_govadeg, breton).
quest_tag(istor_ar_govadeg, cefr_b1).
quest_tag(istor_ar_govadeg, storytelling).

quest_objective(istor_ar_govadeg, 0, talk_to(jakez_guivarch, 1)).
quest_objective(istor_ar_govadeg, 1, objective('Listen to the folk tale of the Ankou and retell it in your own Breton words.')).
quest_objective(istor_ar_govadeg, 2, conversation_turns(8)).

quest_reward(istor_ar_govadeg, experience, 175).
quest_reward(istor_ar_govadeg, gold, 55).

quest_available(Player, istor_ar_govadeg) :-
    quest(istor_ar_govadeg, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% B2 — Upper-Intermediate Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Kanañ ar Gwerz (Singing the Ballad)
%% Learn and perform a traditional Breton gwerz (ballad).
%% Type: cultural / Difficulty: advanced / CEFR: B2

quest(kanañ_ar_gwerz, 'Kanañ ar Gwerz', cultural, advanced, active).
quest_assigned_to(kanañ_ar_gwerz, '{{player}}').
quest_language(kanañ_ar_gwerz, breton).
quest_tag(kanañ_ar_gwerz, cefr_b2).
quest_tag(kanañ_ar_gwerz, cultural).

quest_objective(kanañ_ar_gwerz, 0, talk_to(maiwenn_kernev, 1)).
quest_objective(kanañ_ar_gwerz, 1, objective('Learn the lyrics of a traditional gwerz and explain its meaning in Breton.')).
quest_objective(kanañ_ar_gwerz, 2, objective('Perform the gwerz at the tavern and answer questions about its historical context.')).

quest_reward(kanañ_ar_gwerz, experience, 250).
quest_reward(kanañ_ar_gwerz, gold, 80).

quest_available(Player, kanañ_ar_gwerz) :-
    quest(kanañ_ar_gwerz, _, _, _, active).

%% Quest: Disputañ gant ar Rouaned (Debating with the Nobles)
%% Argue for maritime independence using formal Breton.
%% Type: social / Difficulty: advanced / CEFR: B2

quest(disputañ_gant_ar_rouaned, 'Disputañ gant ar Rouaned', social, advanced, active).
quest_assigned_to(disputañ_gant_ar_rouaned, '{{player}}').
quest_language(disputañ_gant_ar_rouaned, breton).
quest_tag(disputañ_gant_ar_rouaned, cefr_b2).
quest_tag(disputañ_gant_ar_rouaned, social).

quest_objective(disputañ_gant_ar_rouaned, 0, talk_to(riwal_karadeg, 1)).
quest_objective(disputañ_gant_ar_rouaned, 1, objective('Present three arguments for Breton maritime rights using formal register.')).
quest_objective(disputañ_gant_ar_rouaned, 2, conversation_turns(10)).

quest_reward(disputañ_gant_ar_rouaned, experience, 275).
quest_reward(disputañ_gant_ar_rouaned, gold, 90).

quest_available(Player, disputañ_gant_ar_rouaned) :-
    quest(disputañ_gant_ar_rouaned, _, _, _, active).

%% Quest: Levr ar Vein Hir (Book of the Standing Stones)
%% Translate ancient inscriptions and discuss their meaning.
%% Type: translation / Difficulty: advanced / CEFR: B2

quest(levr_ar_vein_hir, 'Levr ar Vein Hir', translation, advanced, active).
quest_assigned_to(levr_ar_vein_hir, '{{player}}').
quest_language(levr_ar_vein_hir, breton).
quest_tag(levr_ar_vein_hir, cefr_b2).
quest_tag(levr_ar_vein_hir, translation).

quest_objective(levr_ar_vein_hir, 0, discover_location(3_hent_ar_mein_hir_10)).
quest_objective(levr_ar_vein_hir, 1, objective('Translate three ogham-like inscriptions into modern Breton.')).
quest_objective(levr_ar_vein_hir, 2, talk_to(konan_morvan, 1)).

quest_reward(levr_ar_vein_hir, experience, 300).
quest_reward(levr_ar_vein_hir, gold, 100).

quest_available(Player, levr_ar_vein_hir) :-
    quest(levr_ar_vein_hir, _, _, _, active).

%% Quest: Brezel ar Mor (War of the Sea)
%% Navigate a storm and coordinate with the crew using nautical Breton.
%% Type: main / Difficulty: advanced / CEFR: B2

quest(brezel_ar_mor, 'Brezel ar Mor', main, advanced, active).
quest_assigned_to(brezel_ar_mor, '{{player}}').
quest_language(brezel_ar_mor, breton).
quest_tag(brezel_ar_mor, cefr_b2).
quest_tag(brezel_ar_mor, navigation).

quest_objective(brezel_ar_mor, 0, talk_to(ewen_le_bihan, 1)).
quest_objective(brezel_ar_mor, 1, objective('Give nautical commands in Breton to navigate a fishing boat through a storm.')).
quest_objective(brezel_ar_mor, 2, objective('Describe the experience of the storm in a written Breton account of at least ten sentences.')).

quest_reward(brezel_ar_mor, experience, 300).
quest_reward(brezel_ar_mor, gold, 100).

quest_available(Player, brezel_ar_mor) :-
    quest(brezel_ar_mor, _, _, _, active).
