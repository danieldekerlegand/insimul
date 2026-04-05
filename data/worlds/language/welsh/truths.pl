%% Insimul Truths: Welsh Valley
%% Source: data/worlds/language/welsh/truths.json
%% Converted: 2026-04-03T12:00:00Z
%% Total: 24 truths
%%
%% Predicate schema:
%%   truth/3 -- truth(AtomId, Title, EntryType)
%%   truth_content/2, truth_importance/2, truth_public/1
%%   truth_character/2, truth_timestep/2

%% ============================================================
%% Cultural and Linguistic Truths
%% ============================================================

%% Soft Mutation Rules
truth(soft_mutation_rules, 'Treiglad Meddal', world_fact).
truth_content(soft_mutation_rules, 'Welsh soft mutation (treiglad meddal) changes initial consonants in specific grammatical contexts: C->G, P->B, T->D, G->drops, B->F, D->Dd, Ll->L, M->F, Rh->R. It occurs after feminine singular nouns, after "yn" (predicative), after prepositions like "i", "o", "am", and after "dy" (your). This is the most common of the three Welsh mutations.').
truth_importance(soft_mutation_rules, 10).
truth_timestep(soft_mutation_rules, 0).

%% Nasal Mutation Rules
truth(nasal_mutation_rules, 'Treiglad Trwynol', world_fact).
truth_content(nasal_mutation_rules, 'Welsh nasal mutation (treiglad trwynol) occurs after "fy" (my) and "yn" (in): C->Ngh, P->Mh, T->Nh, G->Ng, B->M, D->N. For example "fy nghath" (my cat), "yng Nghymru" (in Wales). It is less frequent than soft mutation but essential for correct Welsh.').
truth_importance(nasal_mutation_rules, 9).
truth_timestep(nasal_mutation_rules, 0).

%% Aspirate Mutation Rules
truth(aspirate_mutation_rules, 'Treiglad Llaes', world_fact).
truth_content(aspirate_mutation_rules, 'Welsh aspirate mutation (treiglad llaes) only affects three consonants: C->Ch, P->Ph, T->Th. It occurs after "a" (and), "a" (with), "ei" (her), and "tri" (three) / "chwe" (six). For example "ei chath" (her cat), "tri pheth" (three things).').
truth_importance(aspirate_mutation_rules, 8).
truth_timestep(aspirate_mutation_rules, 0).

%% VSO Word Order
truth(vso_word_order, 'Trefn VSO', world_fact).
truth_content(vso_word_order, 'Welsh uses Verb-Subject-Object (VSO) word order, which differs from the Subject-Verb-Object pattern of English. For example, "Mae Rhys yn bwyta bara" (Is Rhys eating bread) literally translates as "Is Rhys in eating bread." Questions are formed by placing the verb first, and negation uses "Dyw... ddim" or "Does... ddim."').
truth_importance(vso_word_order, 10).
truth_timestep(vso_word_order, 0).

%% Welsh Language Revival
truth(welsh_language_revival, 'Adfywiad yr Iaith', world_fact).
truth_content(welsh_language_revival, 'In this alternate history, the establishment of Gweriniaeth Cymru in 1946 led to aggressive Welsh-language revival policies. Welsh became the sole language of government, and Welsh-medium education became universal by 1960. By the present day, approximately 95 percent of the population speaks Welsh fluently, with English as a widely known second language.').
truth_importance(welsh_language_revival, 10).
truth_timestep(welsh_language_revival, 0).

%% The Eisteddfod
truth(eisteddfod_tradition, 'Traddodiad yr Eisteddfod', world_fact).
truth_content(eisteddfod_tradition, 'The Eisteddfod is a Welsh festival of literature, music, and performance dating back to at least the 12th century. In the Republic of Wales, the National Eisteddfod is a major annual event and public holiday. Cwm Derwen holds its own local eisteddfod each September at Canolfan Eisteddfod, featuring poetry competitions, choral singing, harp recitals, and the Chairing of the Bard ceremony.').
truth_importance(eisteddfod_tradition, 9).
truth_timestep(eisteddfod_tradition, 0).

%% Rugby Culture
truth(rugby_culture, 'Diwylliant Rygbi', world_fact).
truth_content(rugby_culture, 'Rugby union is the national sport of Wales and a cornerstone of valley community life. Clwb Rygbi Cwm Derwen fields teams from under-7s to seniors, and international match days bring the entire town to the pubs. The pre-match singing of "Hen Wlad fy Nhadau" (Land of My Fathers) is a quasi-religious experience.').
truth_importance(rugby_culture, 8).
truth_timestep(rugby_culture, 0).

%% Slate Heritage
truth(slate_heritage, 'Treftadaeth Llechi', world_fact).
truth_content(slate_heritage, 'The Welsh slate industry shaped the landscape and culture of Gwynedd for two centuries. Cwm Derwen grew around its quarry, which operated from 1820 to 1969. The distinctive slate-roofed terraces, the Quarry Museum, and common surnames like Thomas and Roberts all trace back to the quarrying families. Slate craft remains a living tradition.').
truth_importance(slate_heritage, 8).
truth_timestep(slate_heritage, 0).

%% Bilingual Signage
truth(bilingual_signage, 'Arwyddion Dwyieithog', world_fact).
truth_content(bilingual_signage, 'All public signage in Gweriniaeth Cymru is bilingual, with Welsh appearing first and in larger type. Road signs, shop fronts, government buildings, and even ATM screens default to Welsh. This policy, mandated since the Language Act of 1952, has normalised Welsh in everyday visual life.').
truth_importance(bilingual_signage, 7).
truth_timestep(bilingual_signage, 0).

%% Hill Farming
truth(hill_farming, 'Ffermio Mynydd', world_fact).
truth_content(hill_farming, 'Hill farming of Welsh Mountain sheep is the economic backbone of rural Gwynedd. Farms like Fferm Cwm Uchaf and Fferm Bryn Glas have been run by the same families for generations. The annual shearing (cneifio), lambing season (tymor wyna), and sheepdog trials (treialon cwn defaid) structure the calendar of Llanfynydd.').
truth_importance(hill_farming, 7).
truth_timestep(hill_farming, 0).

%% ============================================================
%% Character Truths
%% ============================================================

%% Dafydd Jones -- Master Baker
truth(master_baker, 'Y Pobydd Meistr', trait).
truth_content(master_baker, 'Dafydd Jones is the third-generation owner of Becws y Cwm. He rises at 4am every morning to bake bara brith, Welsh cakes, and crusty loaves using recipes passed down from his grandmother. He insists on speaking only Welsh in the bakery.').
truth_importance(master_baker, 8).
truth_character(master_baker, dafydd_jones).
truth_timestep(master_baker, 0).

%% Megan Jones -- Rugby Matriarch
truth(rugby_matriarch, 'Matriarches y Rygbi', trait).
truth_content(rugby_matriarch, 'Megan Jones is the formidable chairwoman of Clwb Rygbi Cwm Derwen. She organises match teas, manages the youth teams, and once famously confronted a referee in rapid-fire Welsh about a disputed try.').
truth_importance(rugby_matriarch, 7).
truth_character(rugby_matriarch, megan_jones).
truth_timestep(rugby_matriarch, 0).

%% Gwenllian Williams -- Language Champion
truth(language_champion, 'Pencampwraig yr Iaith', trait).
truth_content(language_champion, 'Gwenllian Williams is the headmistress of Ysgol Gymraeg Cwm Derwen and a fierce advocate for Welsh-medium education. She developed the immersion programme that became the national model and has trained hundreds of Welsh-language teachers.').
truth_importance(language_champion, 9).
truth_character(language_champion, gwenllian_williams).
truth_timestep(language_champion, 0).

%% Owain Davies -- The Last Hill Farmer
truth(last_hill_farmer, 'Y Ffermwr Olaf', trait).
truth_content(last_hill_farmer, 'Owain Davies runs Fferm Cwm Uchaf with a flock of 400 Welsh Mountain sheep and a team of Border Collies. He represents a dying way of life and fears that the younger generation will not take on the farm.').
truth_importance(last_hill_farmer, 8).
truth_character(last_hill_farmer, owain_davies).
truth_timestep(last_hill_farmer, 0).

%% Emyr Evans -- Pub Musician
truth(pub_musician, 'Cerddor y Dafarn', trait).
truth_content(pub_musician, 'Emyr Evans runs Tafarn y Ddraig Goch and organises live Welsh-language music nights every Friday. He plays the triple harp (telyn deires) and is a respected figure on the Welsh folk music circuit.').
truth_importance(pub_musician, 7).
truth_character(pub_musician, emyr_evans).
truth_timestep(pub_musician, 0).

%% Eleri Thomas -- Slate Historian
truth(slate_historian, 'Hanesydd y Llechi', trait).
truth_content(slate_historian, 'Eleri Thomas is the curator of Amgueddfa Llechi Cwm Derwen. She has spent 20 years documenting the oral histories of quarrying families and is writing a definitive Welsh-language book on the slate industry of Gwynedd.').
truth_importance(slate_historian, 8).
truth_character(slate_historian, eleri_thomas).
truth_timestep(slate_historian, 0).

%% Siwan Roberts -- Eisteddfod Organiser
truth(eisteddfod_organiser, 'Trefnwraig yr Eisteddfod', trait).
truth_content(eisteddfod_organiser, 'Siwan Roberts is the chair of the Cwm Derwen Eisteddfod committee and a champion of traditional Welsh crafts. She sells hand-carved lovespoons and woven blankets at her craft shop and is training her daughter Mali in the art of traditional Welsh weaving.').
truth_importance(eisteddfod_organiser, 8).
truth_character(eisteddfod_organiser, siwan_roberts).
truth_timestep(eisteddfod_organiser, 0).

%% Rhys Jones -- Rugby Captain Secret
truth(rugby_captain_secret, 'Cyfrinach y Capten', secret).
truth_content(rugby_captain_secret, 'Rhys Jones, captain of Clwb Rygbi Cwm Derwen, has been secretly offered a professional contract with a club in England. Accepting would mean leaving the valley -- and playing in English, which he finds deeply conflicting given his family pride in Welsh-medium life.').
truth_importance(rugby_captain_secret, 9).
truth_character(rugby_captain_secret, rhys_jones).
truth_timestep(rugby_captain_secret, 0).

%% Ffion Evans -- Hidden Talent
truth(hidden_talent, 'Y Ddawn Gudd', secret).
truth_content(hidden_talent, 'Ffion Evans has been secretly writing a Welsh-language novel set in the quarrying era. She has not told her family because she based several characters on recognisable local figures, including unflattering portraits.').
truth_importance(hidden_talent, 7).
truth_character(hidden_talent, ffion_evans).
truth_timestep(hidden_talent, 0).

%% Gethin Davies -- Torn Between Two Worlds
truth(torn_between_worlds, 'Rhwng Dau Fyd', relationship).
truth_content(torn_between_worlds, 'Gethin Davies, eldest child of hill farmer Owain, has been offered a place to study veterinary science in the capital, Caerdydd. Taking it would mean leaving the farm without a successor. He is torn between duty and ambition.').
truth_importance(torn_between_worlds, 8).
truth_character(torn_between_worlds, gethin_davies).
truth_timestep(torn_between_worlds, 0).

%% Elen Davies and Iolo Williams -- Secret Romance
truth(valley_romance, 'Rhamant y Cwm', relationship).
truth_content(valley_romance, 'Elen Davies (farmer family) and Iolo Williams (teacher family) have been secretly dating. Their families have a long-standing disagreement over a boundary fence on the hillside above Llanfynydd. Neither has told their parents.').
truth_importance(valley_romance, 7).
truth_character(valley_romance, elen_davies).
truth_timestep(valley_romance, 0).

%% Gareth Thomas -- The Old Ledger
truth(the_old_ledger, 'Yr Hen Lyfr Cownt', secret).
truth_content(the_old_ledger, 'Gareth Thomas discovered an 1890s quarry ledger that suggests the quarry owner at the time cheated workers out of wages. The descendants of that owner are a prominent family in the capital, and revealing this could cause a political scandal.').
truth_importance(the_old_ledger, 9).
truth_character(the_old_ledger, gareth_thomas).
truth_timestep(the_old_ledger, 0).

%% Bryn Roberts -- Bardic Ambition
truth(bardic_ambition, 'Uchelgais y Bardd', trait).
truth_content(bardic_ambition, 'Bryn Roberts has spent decades trying to win the Chair at the National Eisteddfod for his Welsh-language poetry. He has been runner-up three times. The competition consumes him, and he spends most evenings composing in strict cynghanedd metre.').
truth_importance(bardic_ambition, 7).
truth_character(bardic_ambition, bryn_roberts).
truth_timestep(bardic_ambition, 0).

%% Cadi Thomas -- Digital Welsh
truth(digital_welsh, 'Cymraeg Digidol', trait).
truth_content(digital_welsh, 'Cadi Thomas runs a popular Welsh-language social media account and YouTube channel about valley life. She is part of a new generation proving that Welsh can thrive in digital spaces. She secretly worries that her online Welsh is not formal enough for her mother, the museum curator.').
truth_importance(digital_welsh, 6).
truth_character(digital_welsh, cadi_thomas).
truth_timestep(digital_welsh, 0).
