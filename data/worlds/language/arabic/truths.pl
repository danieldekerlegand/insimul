%% Insimul Truths: Arabic Al-Andalus
%% Source: data/worlds/language/arabic/truths.pl
%% Created: 2026-04-03
%% Total: 24 truths
%%
%% Predicate schema:
%%   truth/3 — truth(AtomId, Title, EntryType)
%%   truth_content/2, truth_importance/2, truth_public/1
%%   truth_character/2, truth_timestep/2

%% ═══════════════════════════════════════════════════════════
%% Cultural Norms
%% ═══════════════════════════════════════════════════════════

%% Greeting Protocol
truth(greeting_protocol, 'Greeting Protocol', cultural_norm).
truth_content(greeting_protocol, 'The standard greeting is as-salamu alaykum (peace be upon you), responded to with wa alaykum as-salam. This greeting crosses religious boundaries in Al-Andalus and is used by Muslims, Christians, and Jews alike in daily commerce.').
truth_importance(greeting_protocol, 10).
truth_public(greeting_protocol).
truth_timestep(greeting_protocol, 0).

%% Hospitality Obligation
truth(hospitality_obligation, 'Hospitality Obligation', cultural_norm).
truth_content(hospitality_obligation, 'Offering tea or food to a guest is a sacred obligation. Refusing hospitality is considered deeply insulting. A host will offer at least three times before accepting a guest''s refusal.').
truth_importance(hospitality_obligation, 9).
truth_public(hospitality_obligation).
truth_timestep(hospitality_obligation, 0).

%% Right Hand Convention
truth(right_hand_convention, 'Right Hand Convention', cultural_norm).
truth_content(right_hand_convention, 'The right hand is used for eating, greeting, and giving. The left hand is considered unclean. Always offer and receive items with the right hand.').
truth_importance(right_hand_convention, 8).
truth_public(right_hand_convention).
truth_timestep(right_hand_convention, 0).

%% Souk Haggling Custom
truth(souk_haggling_custom, 'Souk Haggling Custom', cultural_norm).
truth_content(souk_haggling_custom, 'Haggling is expected and enjoyed in the souk. The initial price offered is typically two to three times the expected sale price. Walking away is a legitimate negotiation tactic. Agreeing to the first price is seen as naive.').
truth_importance(souk_haggling_custom, 8).
truth_public(souk_haggling_custom).
truth_timestep(souk_haggling_custom, 0).

%% Hammam Etiquette
truth(hammam_etiquette, 'Hammam Etiquette', cultural_norm).
truth_content(hammam_etiquette, 'The hammam (public bath) is a central social institution. Men and women attend at separate times. It is a place for business discussions, gossip, and social bonding. Modesty is maintained with a waist cloth (izaar).').
truth_importance(hammam_etiquette, 7).
truth_public(hammam_etiquette).
truth_timestep(hammam_etiquette, 0).

%% Elder Respect
truth(elder_respect, 'Elder Respect', cultural_norm).
truth_content(elder_respect, 'Elders are addressed with honorific titles such as sheikh, hajj, or ustadh. Younger people stand when an elder enters, speak only when addressed in formal settings, and use the formal second person pronoun.').
truth_importance(elder_respect, 8).
truth_public(elder_respect).
truth_timestep(elder_respect, 0).

%% ═══════════════════════════════════════════════════════════
%% Social Rules
%% ═══════════════════════════════════════════════════════════

%% Convivencia
truth(convivencia, 'Convivencia', social_rule).
truth_content(convivencia, 'Muslims, Christians (Mozarabs), and Jews live side by side in Qurtuba under a system of relative tolerance called convivencia. Each community has its own quarter, courts, and places of worship, but they mingle freely in the souks, libraries, and hammams.').
truth_importance(convivencia, 10).
truth_public(convivencia).
truth_timestep(convivencia, 0).

%% Dhimmi Status
truth(dhimmi_status, 'Dhimmi Status', social_rule).
truth_content(dhimmi_status, 'Christians and Jews are classified as dhimmi (protected peoples). They pay the jizya tax in exchange for protection, freedom of worship, and exemption from military service. They may hold positions in administration, medicine, and commerce.').
truth_importance(dhimmi_status, 9).
truth_public(dhimmi_status).
truth_timestep(dhimmi_status, 0).

%% Guild System
truth(guild_system, 'Guild System', social_rule).
truth_content(guild_system, 'Artisans and merchants are organized into guilds (asnaf) by trade. Each guild has a leader (amin) who settles disputes, ensures quality standards, and represents the guild before the muhtasib (market inspector). Membership crosses religious lines.').
truth_importance(guild_system, 8).
truth_public(guild_system).
truth_timestep(guild_system, 0).

%% Muhtasib Authority
truth(muhtasib_authority, 'Muhtasib Authority', social_rule).
truth_content(muhtasib_authority, 'The muhtasib is the market inspector who enforces fair trade, checks weights and measures, and ensures moral conduct in public spaces. His word is law in the souk.').
truth_importance(muhtasib_authority, 7).
truth_public(muhtasib_authority).
truth_timestep(muhtasib_authority, 0).

%% Scholarly Patronage
truth(scholarly_patronage, 'Scholarly Patronage', social_rule).
truth_content(scholarly_patronage, 'The Caliph and wealthy families sponsor scholars, translators, and scientists. A scholar''s reputation depends on the strength of their patron. Knowledge is considered the highest virtue, and Qurtuba''s royal library holds over 400,000 volumes.').
truth_importance(scholarly_patronage, 9).
truth_public(scholarly_patronage).
truth_timestep(scholarly_patronage, 0).

%% ═══════════════════════════════════════════════════════════
%% Linguistic Notes — Arabic
%% ═══════════════════════════════════════════════════════════

%% Arabic Diglossia
truth(arabic_diglossia, 'Arabic Diglossia', linguistic_note).
truth_content(arabic_diglossia, 'Arabic has two registers: fusha (Classical/formal Arabic used in writing, sermons, and scholarship) and ammiyya (colloquial dialect used in daily life). In Al-Andalus, the local dialect blends Arabic with Romance words. Learners must understand both registers.').
truth_importance(arabic_diglossia, 10).
truth_public(arabic_diglossia).
truth_timestep(arabic_diglossia, 0).

%% Right-to-Left Script
truth(right_to_left_script, 'Right-to-Left Script', linguistic_note).
truth_content(right_to_left_script, 'Arabic is written and read from right to left. Letters change form depending on their position in a word (initial, medial, final, isolated). Numbers, however, are read left to right.').
truth_importance(right_to_left_script, 10).
truth_public(right_to_left_script).
truth_timestep(right_to_left_script, 0).

%% Root System
truth(arabic_root_system, 'Arabic Root System', linguistic_note).
truth_content(arabic_root_system, 'Arabic words are built from three-letter roots (trilateral roots). For example, k-t-b relates to writing: kitab (book), katib (writer), maktaba (library), maktub (written). Understanding roots is key to expanding vocabulary rapidly.').
truth_importance(arabic_root_system, 10).
truth_public(arabic_root_system).
truth_timestep(arabic_root_system, 0).

%% Formality Levels
truth(arabic_formality, 'Arabic Formality Levels', linguistic_note).
truth_content(arabic_formality, 'Arabic has elaborate formality distinctions. Addressing the Caliph or a qadi requires highly formal fusha. Merchants in the souk use colloquial forms. Religious contexts demand Quranic register. Using the wrong register is a serious social error.').
truth_importance(arabic_formality, 9).
truth_public(arabic_formality).
truth_timestep(arabic_formality, 0).

%% Dual Number
truth(arabic_dual_number, 'Arabic Dual Number', linguistic_note).
truth_content(arabic_dual_number, 'Unlike most languages, Arabic has a dual grammatical number in addition to singular and plural. When referring to exactly two items, the dual form (muthanna) is used: kitab (one book), kitaban (two books), kutub (three or more books).').
truth_importance(arabic_dual_number, 8).
truth_public(arabic_dual_number).
truth_timestep(arabic_dual_number, 0).

%% Gendered Language
truth(arabic_gendered_language, 'Arabic Gendered Language', linguistic_note).
truth_content(arabic_gendered_language, 'All Arabic nouns are either masculine or feminine. Adjectives, verbs, and pronouns must agree in gender. Most feminine nouns end in ta marbuta. Even the word you changes: anta (male) vs anti (female).').
truth_importance(arabic_gendered_language, 9).
truth_public(arabic_gendered_language).
truth_timestep(arabic_gendered_language, 0).

%% ═══════════════════════════════════════════════════════════
%% Character Truths
%% ═══════════════════════════════════════════════════════════

%% The Merchant Prince
truth(the_merchant_prince, 'The Merchant Prince', trait).
truth_content(the_merchant_prince, 'Abu Bakr al-Rashid controls the silk and spice trade routes between Qurtuba and the eastern Mediterranean. His wealth rivals that of minor nobles, and his caravans are known from Baghdad to Fez.').
truth_importance(the_merchant_prince, 9).
truth_character(the_merchant_prince, abu_bakr_al_rashid).
truth_timestep(the_merchant_prince, 0).

%% The Stargazer's Secret
truth(the_stargazers_secret, 'The Stargazer''s Secret', secret).
truth_content(the_stargazers_secret, 'Yusuf al-Rashid has discovered discrepancies in the Ptolemaic model of the heavens but fears publishing findings that contradict established authority. He keeps his observations hidden in a cipher only he can read.').
truth_importance(the_stargazers_secret, 9).
truth_character(the_stargazers_secret, yusuf_al_rashid).
truth_timestep(the_stargazers_secret, 0).

%% The Just Qadi
truth(the_just_qadi, 'The Just Qadi', trait).
truth_content(the_just_qadi, 'Khalid ibn Hayyan is known for ruling impartially regardless of the faith of the parties before him. His reputation for fairness has made his court the most respected in all of Al-Andalus.').
truth_importance(the_just_qadi, 8).
truth_character(the_just_qadi, khalid_ibn_hayyan).
truth_timestep(the_just_qadi, 0).

%% The Bridge Builder
truth(the_bridge_builder, 'The Bridge Builder', relationship).
truth_content(the_bridge_builder, 'Moshe ben Shlomo works closely with Muslim scholars to translate Greek philosophical texts into Arabic and Hebrew. He serves as an informal bridge between the Jewish and Muslim intellectual communities.').
truth_importance(the_bridge_builder, 8).
truth_character(the_bridge_builder, moshe_ben_shlomo).
truth_timestep(the_bridge_builder, 0).

%% The Forbidden Friendship
truth(the_forbidden_friendship, 'The Forbidden Friendship', relationship).
truth_content(the_forbidden_friendship, 'Tariq ibn Hayyan and Rodrigo de Leon are close friends who practice calligraphy together in secret. Their friendship crosses social boundaries that some in both communities would disapprove of.').
truth_importance(the_forbidden_friendship, 7).
truth_character(the_forbidden_friendship, tariq_ibn_hayyan).
truth_timestep(the_forbidden_friendship, 0).

%% The Healing Woman
truth(the_healing_woman, 'The Healing Woman', trait).
truth_content(the_healing_woman, 'Maryam ibn Hayyan has studied medicine with both Muslim and Jewish physicians. She treats patients of all faiths from her home, though women practicing medicine openly is frowned upon by some conservative scholars.').
truth_importance(the_healing_woman, 8).
truth_character(the_healing_woman, maryam_ibn_hayyan).
truth_timestep(the_healing_woman, 0).

%% The Vintner's Dilemma
truth(the_vintners_dilemma, 'The Vintner''s Dilemma', secret).
truth_content(the_vintners_dilemma, 'Alfonso de Leon produces wine that is officially sold only to the Christian community, but several prominent Muslim families are among his most loyal customers. He keeps this trade strictly confidential.').
truth_importance(the_vintners_dilemma, 7).
truth_character(the_vintners_dilemma, alfonso_de_leon).
truth_timestep(the_vintners_dilemma, 0).
