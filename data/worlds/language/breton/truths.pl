%% Insimul Truths: Breton Coast
%% Source: data/worlds/language/breton/truths.pl
%% Created: 2026-04-03
%% Total: 22 truths
%%
%% Predicate schema:
%%   truth/3 -- truth(AtomId, Title, EntryType)
%%   truth_content/2, truth_importance/2, truth_timestep/2

%% Soft Mutation (Kemmadur Dre Vlotaat)
truth(soft_mutation, 'Soft Mutation', linguistic_note).
truth_content(soft_mutation, 'Breton has a soft mutation (kemmadur dre vlotaat) triggered by articles, possessives, and certain prepositions. For example, tad (father) becomes da dad (your father), bag (boat) becomes ar vag (the boat). This is the most common mutation and essential for correct speech.').
truth_importance(soft_mutation, 10).
truth_timestep(soft_mutation, 0).

%% Nasal Mutation
truth(nasal_mutation, 'Nasal Mutation', linguistic_note).
truth_content(nasal_mutation, 'The nasal mutation (kemmadur dre froenolaat) occurs after possessives like ma (my) and the particle en/ez. For example, tad becomes ma zad (my father), gwenn becomes e wenn. It nasalizes consonants: t to d, k to g, p to b, g to ch, gw to w.').
truth_importance(nasal_mutation, 9).
truth_timestep(nasal_mutation, 0).

%% Aspirate Mutation (Spirant)
truth(aspirate_mutation, 'Aspirate Mutation', linguistic_note).
truth_content(aspirate_mutation, 'The aspirate (spirant) mutation occurs after possessives like he (her), the conjunction ha (and), and certain other particles. For example, tad becomes he zad (her father), penn becomes he fenn. It only affects three consonants: k, t, p.').
truth_importance(aspirate_mutation, 8).
truth_timestep(aspirate_mutation, 0).

%% Fest-Noz Tradition
truth(fest_noz, 'Fest-Noz Tradition', cultural_norm).
truth_content(fest_noz, 'The fest-noz (night festival) is a communal evening of traditional Breton music and dance. Recognized by UNESCO as intangible cultural heritage, it features bombard and biniou duos, circle dances like an dro and hanter dro, and is the heartbeat of Breton community life.').
truth_importance(fest_noz, 9).
truth_timestep(fest_noz, 0).

%% VSO Word Order
truth(vso_word_order, 'Verb-Subject-Object Order', linguistic_note).
truth_content(vso_word_order, 'Breton uses verb-subject-object (VSO) word order, unlike French or English. Lenn a ra Yann al levr means Yann reads the book, literally: reads does Yann the book. The particle a ra marks the verbal action.').
truth_importance(vso_word_order, 9).
truth_timestep(vso_word_order, 0).

%% Diwan Schools
truth(diwan_schools, 'Diwan Schools', social_rule).
truth_content(diwan_schools, 'Diwan schools are Breton-medium immersion schools where all subjects are taught in Breton. Founded in 1977, they are the primary engine of language transmission to new generations. In the Republik Breizh, they are state-funded and widely attended.').
truth_importance(diwan_schools, 8).
truth_timestep(diwan_schools, 0).

%% Breton Cider Culture
truth(cider_culture, 'Cider Culture', cultural_norm).
truth_content(cider_culture, 'Cider (sistr) is the traditional drink of Brittany, made from over 600 local apple varieties. It is served in a bolenn (bowl), not a glass. Sharing a pitcher of cider at a creperie is a social ritual as important as the meal itself.').
truth_importance(cider_culture, 7).
truth_timestep(cider_culture, 0).

%% Crepe vs Galette
truth(crepe_galette, 'Krampouezhenn vs Galettenn', cultural_norm).
truth_content(crepe_galette, 'In Brittany, a krampouezhenn (crepe) is made from wheat flour and is sweet. A galettenn is made from buckwheat (ed-du) and is savory, typically filled with ham, cheese, and egg (komplez). Confusing the two marks you as a tourist.').
truth_importance(crepe_galette, 7).
truth_timestep(crepe_galette, 0).

%% Celtic Identity
truth(celtic_identity, 'Celtic Identity', cultural_norm).
truth_content(celtic_identity, 'Bretons identify strongly as Celtic people with cultural ties to Wales, Cornwall, Ireland, Scotland, and the Isle of Man. The inter-Celtic festivals, shared musical traditions, and linguistic kinship reinforce a pan-Celtic identity that is central to Breton pride.').
truth_importance(celtic_identity, 8).
truth_timestep(celtic_identity, 0).

%% Maritime Heritage
truth(maritime_heritage, 'Maritime Heritage', cultural_norm).
truth_content(maritime_heritage, 'Brittany has one of the longest coastlines in Europe. Fishing, seaweed harvesting, and maritime trade have shaped Breton culture for millennia. Coastal towns like Porzh-Gwenn organize their social life around the tides and the fishing fleet.').
truth_importance(maritime_heritage, 7).
truth_timestep(maritime_heritage, 0).

%% Greeting Customs
truth(breton_greetings, 'Breton Greeting Customs', social_rule).
truth_content(breton_greetings, 'The standard Breton greeting is Demat (good day). Kenavo means goodbye. Mont a ra? means How is it going? Close friends and family greet with a kiss on each cheek (biz). Using Breton for greetings is a mark of cultural solidarity.').
truth_importance(breton_greetings, 8).
truth_timestep(breton_greetings, 0).

%% Standing Stones
truth(standing_stones, 'Megalithic Heritage', cultural_norm).
truth_content(standing_stones, 'Brittany has the densest concentration of megalithic monuments in the world, including the famous alignments at Carnac. Mein-hir (standing stones) and dolmen (stone tables) are woven into local legends. They are protected as national heritage in Republik Breizh.').
truth_importance(standing_stones, 7).
truth_timestep(standing_stones, 0).

%% Bagad Pipe Bands
truth(bagad_tradition, 'Bagad Pipe Bands', cultural_norm).
truth_content(bagad_tradition, 'A bagad is a Breton pipe band combining biniou-braz (Scottish-style bagpipe), bombard (double-reed oboe), and percussion. Every town has its bagad, and inter-bagad competitions are major cultural events. The bombard-biniou couple is the soul of Breton music.').
truth_importance(bagad_tradition, 7).
truth_timestep(bagad_tradition, 0).

%% Breton Article System
truth(breton_articles, 'The Breton Article System', linguistic_note).
truth_content(breton_articles, 'Breton has one definite article: an (before vowels and n, d, t, h), al (before l), ar (elsewhere). Unlike French, Breton has no indefinite article -- un/ul/ur exist but are used differently. The article triggers soft mutation: bag becomes ar vag.').
truth_importance(breton_articles, 8).
truth_timestep(breton_articles, 0).

%% Salted Butter Pride
truth(salted_butter, 'Salted Butter Pride', cultural_norm).
truth_content(salted_butter, 'Bretons are fiercely proud of their salted butter (amanenn sall). It appears in everything from kouign-amann pastry to seafood sauces. The salted-vs-unsalted divide roughly marks the cultural boundary between Brittany and the rest of France.').
truth_importance(salted_butter, 6).
truth_timestep(salted_butter, 0).

%% Language Revitalization
truth(language_revival, 'Language Revitalization', social_rule).
truth_content(language_revival, 'In this alternate timeline, Breton independence in 1946 led to strong state support for the language. Breton is used in government, media, education, and signage. The Office of the Breton Language (Ofis Publik ar Brezhoneg) coordinates standardization and promotion.').
truth_importance(language_revival, 9).
truth_timestep(language_revival, 0).

%% Breton Verb System
truth(breton_verbs, 'Breton Verb System', linguistic_note).
truth_content(breton_verbs, 'Breton verbs conjugate with auxiliary particles. The present tense uses a ra (does): lenn a ra (reads). The past uses en deus/he deus. Breton also has a distinction between short and long forms. The verb bezanin (to be) is highly irregular.').
truth_importance(breton_verbs, 8).
truth_timestep(breton_verbs, 0).

%% Pardons (Religious Processions)
truth(pardons_tradition, 'Pardons Tradition', cultural_norm).
truth_content(pardons_tradition, 'Pardons are traditional Breton religious processions and festivals honoring patron saints. Participants wear traditional costumes including lace coiffes and embroidered waistcoats. Even in modern secular Brittany, pardons remain important community gatherings.').
truth_importance(pardons_tradition, 6).
truth_timestep(pardons_tradition, 0).

%% Fishing Community
truth(fishing_community_br, 'Fishing Community', social_rule).
truth_content(fishing_community_br, 'Coastal fishing cooperatives are the backbone of harbor towns. Fishermen share catches, maintain boats collectively, and pass maritime knowledge through generations. The morning fish auction is both an economic event and a social gathering.').
truth_importance(fishing_community_br, 6).
truth_timestep(fishing_community_br, 0).

%% Breton Spelling: Ch digraph
truth(ch_digraph, 'The Ch Digraph in Breton', linguistic_note).
truth_content(ch_digraph, 'Breton uses the digraph ch to represent a voiceless velar fricative (like Scottish loch or German Bach). This sound does not exist in French or English and is essential for correct Breton pronunciation. For example: c''houez (sweat), c''hwec''h (six).').
truth_importance(ch_digraph, 7).
truth_timestep(ch_digraph, 0).

%% Weather and Social Life
truth(breton_weather, 'Weather and Social Life', social_rule).
truth_content(breton_weather, 'Brittany has a maritime climate with frequent rain and wind. Bretons joke that they get four seasons in one day. Weather vocabulary is rich and practical. A rain jacket is essential gear, and cafes and bars serve as warm refuges from Atlantic storms.').
truth_importance(breton_weather, 5).
truth_timestep(breton_weather, 0).

%% Bilingual Signage
truth(bilingual_signs, 'Bilingual Signage', social_rule).
truth_content(bilingual_signs, 'All public signage in Republik Breizh is bilingual Breton-French, with Breton listed first. Street names, government buildings, shops, and transport use both languages. This bilingual landscape is a daily reminder of the language and a learning resource for newcomers.').
truth_importance(bilingual_signs, 6).
truth_timestep(bilingual_signs, 0).
