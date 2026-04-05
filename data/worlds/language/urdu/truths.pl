%% Insimul Truths: Urdu Punjab
%% Source: data/worlds/language/urdu/truths.pl
%% Created: 2026-04-03
%% Total: 24 truths
%%
%% Predicate schema:
%%   truth/3 -- truth(AtomId, Title, EntryType)
%%   truth_content/2, truth_importance/2, truth_public/1
%%   truth_character/2, truth_timestep/2

%% =====================================================================
%% Cultural Norms
%% =====================================================================

%% Greeting Protocol
truth(greeting_protocol, 'Greeting Protocol', cultural_norm).
truth_content(greeting_protocol, 'The standard greeting is Assalam o Alaikum (peace be upon you), responded to with Wa Alaikum Assalam. This is used in virtually all social interactions. Secular greetings like Adaab or Salam are also common, especially in informal settings.').
truth_importance(greeting_protocol, 10).
truth_public(greeting_protocol).
truth_timestep(greeting_protocol, 0).

%% Chai Hospitality
truth(chai_hospitality, 'Chai Hospitality', cultural_norm).
truth_content(chai_hospitality, 'Offering chai to a guest is a non-negotiable social obligation. A host will insist repeatedly, and refusing outright is considered impolite. The phrase Chai piyenge? is both an offer and a command. Business, gossip, and friendships all revolve around chai.').
truth_importance(chai_hospitality, 10).
truth_public(chai_hospitality).
truth_timestep(chai_hospitality, 0).

%% Right Hand Convention
truth(right_hand_convention, 'Right Hand Convention', cultural_norm).
truth_content(right_hand_convention, 'The right hand is used for eating, greeting, and giving or receiving items. The left hand is considered unclean. Always accept chai, food, or gifts with the right hand.').
truth_importance(right_hand_convention, 8).
truth_public(right_hand_convention).
truth_timestep(right_hand_convention, 0).

%% Bazaar Haggling Custom
truth(bazaar_haggling, 'Bazaar Haggling Custom', cultural_norm).
truth_content(bazaar_haggling, 'Haggling (mol bhao) is expected and enjoyed in bazaars. The shopkeeper names a high starting price, and the buyer must negotiate down. Paying the asking price without haggling is seen as naive. The phrase Bhai, kuch kam karo (Brother, reduce it a little) is essential.').
truth_importance(bazaar_haggling, 9).
truth_public(bazaar_haggling).
truth_timestep(bazaar_haggling, 0).

%% Elder Respect (Adab)
truth(elder_respect, 'Elder Respect', cultural_norm).
truth_content(elder_respect, 'Elders are always addressed with aap (the formal you), never tum or tu. Touching the feet or placing a hand on the heart when greeting elders is common. Standing when an elder enters, not interrupting, and using titles like Uncle, Aunty, Sahab, or Begum is expected.').
truth_importance(elder_respect, 9).
truth_public(elder_respect).
truth_timestep(elder_respect, 0).

%% Shoe Removal
truth(shoe_removal, 'Shoe Removal', cultural_norm).
truth_content(shoe_removal, 'Shoes must be removed before entering a mosque, a home, and often before entering shops with carpeted floors. Pointing the soles of your feet toward someone is considered extremely rude.').
truth_importance(shoe_removal, 8).
truth_public(shoe_removal).
truth_timestep(shoe_removal, 0).

%% =====================================================================
%% Social Rules
%% =====================================================================

%% Joint Family System
truth(joint_family_system, 'Joint Family System', social_rule).
truth_content(joint_family_system, 'The extended family (khandan) often lives together or very close. The patriarch (buzurg) commands respect. Decisions about marriage, business, and education are often made collectively. Sons typically live with parents even after marriage.').
truth_importance(joint_family_system, 9).
truth_public(joint_family_system).
truth_timestep(joint_family_system, 0).

%% Biradari System
truth(biradari_system, 'Biradari System', social_rule).
truth_content(biradari_system, 'The biradari (clan or caste group) remains an important social structure in Punjab. Families identify with their biradari -- Khan, Butt, Malik, Chaudhry, Qureshi, Shah -- which influences marriage choices, business partnerships, and social standing.').
truth_importance(biradari_system, 8).
truth_public(biradari_system).
truth_timestep(biradari_system, 0).

%% Friday Prayers
truth(friday_prayers, 'Friday Prayers', social_rule).
truth_content(friday_prayers, 'Juma (Friday prayers) at the masjid is the most important weekly gathering. Shops close for the prayer hour. The khutba (sermon) covers religious and community matters. Attending is a social as well as religious obligation for men.').
truth_importance(friday_prayers, 8).
truth_public(friday_prayers).
truth_timestep(friday_prayers, 0).

%% Gender Spaces
truth(gender_spaces, 'Gender Spaces', social_rule).
truth_content(gender_spaces, 'Public spaces in a Punjabi town are implicitly gendered. The bazaar, chai stalls, and cricket grounds are dominated by men. Women gather in homes, at school functions, and in designated sections of the masjid. Mixed socializing happens within families and at weddings.').
truth_importance(gender_spaces, 8).
truth_public(gender_spaces).
truth_timestep(gender_spaces, 0).

%% Eid Celebrations
truth(eid_celebrations, 'Eid Celebrations', social_rule).
truth_content(eid_celebrations, 'Eid ul-Fitr and Eid ul-Adha are the two major festivals. New clothes are worn, special foods prepared, and families visit each other. Children receive Eidi (money gifts). The greeting is Eid Mubarak. Forgiveness is asked from elders and peers.').
truth_importance(eid_celebrations, 8).
truth_public(eid_celebrations).
truth_timestep(eid_celebrations, 0).

%% =====================================================================
%% Linguistic Notes -- Urdu
%% =====================================================================

%% Hindi-Urdu Continuum
truth(hindi_urdu_continuum, 'Hindi-Urdu Continuum', linguistic_note).
truth_content(hindi_urdu_continuum, 'Urdu and Hindi share nearly identical grammar and everyday spoken vocabulary, forming a single linguistic continuum called Hindustani. They diverge in script (Nastaliq vs Devanagari) and formal/literary vocabulary (Urdu borrows from Persian and Arabic, Hindi from Sanskrit). A speaker of everyday Urdu and everyday Hindi can understand each other without difficulty.').
truth_importance(hindi_urdu_continuum, 10).
truth_public(hindi_urdu_continuum).
truth_timestep(hindi_urdu_continuum, 0).

%% Nastaliq Script
truth(nastaliq_script, 'Nastaliq Script', linguistic_note).
truth_content(nastaliq_script, 'Urdu is written in the Nastaliq script, a calligraphic variant of the Perso-Arabic script that flows diagonally from upper right to lower left. Unlike Arabic Naskh, Nastaliq has a distinctive hanging baseline. It is written right to left. Learning to read Nastaliq signage is essential for navigating a Pakistani town.').
truth_importance(nastaliq_script, 10).
truth_public(nastaliq_script).
truth_timestep(nastaliq_script, 0).

%% Aap Tum Tu Formality
truth(aap_tum_tu_formality, 'Aap, Tum, Tu Formality', linguistic_note).
truth_content(aap_tum_tu_formality, 'Urdu has three levels of the second-person pronoun: aap (formal/respectful, used with elders, strangers, and in professional settings), tum (informal/friendly, used with peers and younger relatives), and tu (intimate/very informal, used with very close friends or children, but can be rude if used incorrectly). Verb conjugations change with each pronoun level. Using the wrong level is a serious social error.').
truth_importance(aap_tum_tu_formality, 10).
truth_public(aap_tum_tu_formality).
truth_timestep(aap_tum_tu_formality, 0).

%% SOV Word Order
truth(sov_word_order, 'SOV Word Order', linguistic_note).
truth_content(sov_word_order, 'Urdu follows Subject-Object-Verb word order, unlike English SVO. Main ye kitab padhta hoon means I this book read (I read this book). The verb always comes at the end of the sentence. Postpositions (mein, par, ko, se) replace English prepositions.').
truth_importance(sov_word_order, 9).
truth_public(sov_word_order).
truth_timestep(sov_word_order, 0).

%% Gendered Verbs
truth(gendered_verbs, 'Gendered Verbs', linguistic_note).
truth_content(gendered_verbs, 'In Urdu, verbs agree with the gender of the subject. A man says Main gaya (I went, masculine) while a woman says Main gayi (I went, feminine). Adjectives also change: acha larka (good boy) vs achi larki (good girl). This gender agreement pervades the entire language.').
truth_importance(gendered_verbs, 9).
truth_public(gendered_verbs).
truth_timestep(gendered_verbs, 0).

%% Persian/Arabic Loanwords
truth(persian_arabic_loanwords, 'Persian and Arabic Loanwords', linguistic_note).
truth_content(persian_arabic_loanwords, 'Urdu literary and formal vocabulary draws heavily from Persian and Arabic. Words like kitab (book), waqt (time), insaan (human), and khandan (family) come from Arabic. Persian gives words like dil (heart), rang (color), and zindagi (life). Everyday speech mixes these freely with native Hindustani words.').
truth_importance(persian_arabic_loanwords, 8).
truth_public(persian_arabic_loanwords).
truth_timestep(persian_arabic_loanwords, 0).

%% Mushaira Tradition
truth(mushaira_tradition, 'Mushaira Tradition', linguistic_note).
truth_content(mushaira_tradition, 'The mushaira is a traditional Urdu poetry gathering where poets recite their ghazals and nazms before an audience. The audience responds with Wah wah! (bravo) and Irshad! (please, recite). Mushairas are central to Urdu literary culture and are still held regularly across Pakistan. Understanding ghazal conventions -- matla (opening couplet), maqta (closing couplet), radif (refrain), qafiya (rhyme) -- is key to participation.').
truth_importance(mushaira_tradition, 9).
truth_public(mushaira_tradition).
truth_timestep(mushaira_tradition, 0).

%% =====================================================================
%% Character Truths
%% =====================================================================

%% The Cloth King
truth(the_cloth_king, 'The Cloth King', trait).
truth_content(the_cloth_king, 'Rashid Khan has been selling cloth in the bazaar for forty years. He can judge the quality of any fabric by touch alone. His shop is the unofficial gathering place for town elders to discuss community matters over chai.').
truth_importance(the_cloth_king, 8).
truth_character(the_cloth_king, rashid_khan).
truth_timestep(the_cloth_king, 0).

%% The Poets Wife
truth(the_poets_wife, 'The Poet Wife', trait).
truth_content(the_poets_wife, 'Rukhsana Ahmed is a published ghazal poet whose work has appeared in Urdu literary magazines. She organizes the monthly mushaira at the poetry hall and secretly hopes her husband will retire so they can move to Lahore for its literary scene.').
truth_importance(the_poets_wife, 8).
truth_character(the_poets_wife, rukhsana_ahmed).
truth_timestep(the_poets_wife, 0).

%% The Modern Pharmacist
truth(the_modern_pharmacist, 'The Modern Pharmacist', trait).
truth_content(the_modern_pharmacist, 'Sana Khan studied pharmacy in Lahore and returned to open the town''s first modern pharmacy. She clashes quietly with Hakeem Sahab across the street, whose traditional medicine practice she respects but cannot fully endorse.').
truth_importance(the_modern_pharmacist, 7).
truth_character(the_modern_pharmacist, sana_khan).
truth_timestep(the_modern_pharmacist, 0).

%% The Student Activist
truth(the_student_activist, 'The Student Activist', secret).
truth_content(the_student_activist, 'Qamar Hussain runs a photocopy shop by day but organizes student discussion circles at the university hostel by night. He distributes translations of progressive Urdu poetry and dreams of starting an independent literary journal.').
truth_importance(the_student_activist, 7).
truth_character(the_student_activist, qamar_hussain).
truth_timestep(the_student_activist, 0).

%% The Landowners Dilemma
truth(the_landowners_dilemma, 'The Landowner Dilemma', secret).
truth_content(the_landowners_dilemma, 'Chaudhry Aslam Malik owns the largest farm in Sabz Pind but his children want nothing to do with agriculture. His son Hamza reluctantly runs the supply shop while his daughter Nadia teaches in the city. He fears the family land will be sold after his death.').
truth_importance(the_landowners_dilemma, 8).
truth_character(the_landowners_dilemma, aslam_malik).
truth_timestep(the_landowners_dilemma, 0).

%% The Master Tailors Pride
truth(the_master_tailors_pride, 'The Master Tailor Pride', trait).
truth_content(the_master_tailors_pride, 'Ustad Jameel Ali has stitched shalwar kameez for three generations of Noor Manzil families. He insists on hand-stitching collars even though machine stitching is faster. His apprentices say he can cut fabric by eye without measuring tape.').
truth_importance(the_master_tailors_pride, 7).
truth_character(the_master_tailors_pride, jameel_ali).
truth_timestep(the_master_tailors_pride, 0).
