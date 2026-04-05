%% Insimul Truths: Japanese Town
%% Source: data/worlds/language/japanese/truths.pl
%% Created: 2026-04-03
%% Total: 22 truths
%%
%% Predicate schema:
%%   truth/3 -- truth(AtomId, Title, EntryType)
%%   truth_content/2, truth_importance/2, truth_timestep/2

%% Keigo Politeness System
truth(keigo_system, 'Keigo Politeness System', linguistic_note).
truth_content(keigo_system, 'Japanese has an elaborate politeness system called keigo with three levels: teineigo (polite, -masu/-desu forms), sonkeigo (respectful, elevates the listener), and kenjougo (humble, lowers the speaker). Choosing the correct level is essential in social interactions.').
truth_importance(keigo_system, 10).
truth_timestep(keigo_system, 0).

%% Three Writing Systems
truth(three_scripts, 'Three Writing Systems', linguistic_note).
truth_content(three_scripts, 'Japanese uses three scripts simultaneously: hiragana (46 characters for native words and grammar), katakana (46 characters for loanwords and emphasis), and kanji (thousands of Chinese characters for meaning). All three appear together in normal text.').
truth_importance(three_scripts, 10).
truth_timestep(three_scripts, 0).

%% Particles
truth(particles, 'Japanese Particles', linguistic_note).
truth_content(particles, 'Japanese grammar relies on particles -- small words placed after nouns and phrases to mark their function. The key particles are wa (topic), ga (subject), o (object), ni (location/time/direction), de (means/location of action), no (possession), and ka (question).').
truth_importance(particles, 9).
truth_timestep(particles, 0).

%% Bowing Culture
truth(bowing_culture, 'Bowing Culture', cultural_norm).
truth_content(bowing_culture, 'Bowing (ojigi) is the primary form of greeting and showing respect in Japan. The depth and duration vary: a slight nod for casual greetings, a 30-degree bow for business, and a deep 45-degree bow for apologies or great respect.').
truth_importance(bowing_culture, 9).
truth_timestep(bowing_culture, 0).

%% Shoe Removal
truth(shoe_removal, 'Shoe Removal Etiquette', social_rule).
truth_content(shoe_removal, 'Shoes are removed when entering homes, temples, traditional restaurants, and some businesses. A genkan (entryway) separates the outside from the inside. Indoor slippers are provided, and separate toilet slippers are used in restrooms.').
truth_importance(shoe_removal, 8).
truth_timestep(shoe_removal, 0).

%% Seasonal Awareness (Kisetsukan)
truth(seasonal_awareness, 'Seasonal Awareness', cultural_norm).
truth_content(seasonal_awareness, 'Japanese culture is deeply attuned to the four seasons (shiki). Cherry blossoms (sakura) mark spring, fireworks festivals mark summer, autumn leaves (kouyou) mark fall, and osechi-ryouri marks the new year. Seasonal references appear in food, greetings, and daily conversation.').
truth_importance(seasonal_awareness, 8).
truth_timestep(seasonal_awareness, 0).

%% SOV Word Order
truth(sov_order, 'SOV Word Order', linguistic_note).
truth_content(sov_order, 'Japanese follows Subject-Object-Verb word order, the opposite of English. The verb always comes at the end of the sentence. For example: watashi wa ringo o tabemasu (I apple eat). The subject is often omitted when clear from context.').
truth_importance(sov_order, 9).
truth_timestep(sov_order, 0).

%% Konbini Culture
truth(konbini_culture, 'Konbini Culture', social_rule).
truth_content(konbini_culture, 'Convenience stores (konbini) like FamilyMart, Lawson, and 7-Eleven are central to daily life. They sell meals, pay bills, offer ATMs, printing, and package delivery. Open 24 hours, they are often the first stop for food and essentials.').
truth_importance(konbini_culture, 7).
truth_timestep(konbini_culture, 0).

%% Counter Words
truth(counter_words, 'Counter Words', linguistic_note).
truth_content(counter_words, 'Japanese uses different counter words depending on the shape and type of object being counted. Flat things use -mai, long thin things use -hon, small animals use -hiki, people use -nin, and general items use -tsu. There are dozens of counters in common use.').
truth_importance(counter_words, 8).
truth_timestep(counter_words, 0).

%% Uchi-Soto (Inside-Outside)
truth(uchi_soto, 'Uchi-Soto Distinction', cultural_norm).
truth_content(uchi_soto, 'Japanese social behavior distinguishes between uchi (in-group: family, company, close friends) and soto (out-group: strangers, other companies). Language, behavior, and level of openness change depending on whether someone is uchi or soto.').
truth_importance(uchi_soto, 8).
truth_timestep(uchi_soto, 0).

%% Omiyage (Gift-Giving)
truth(omiyage, 'Omiyage Gift-Giving', social_rule).
truth_content(omiyage, 'Bringing back local specialty gifts (omiyage) from trips is a strong social obligation. Coworkers and neighbors expect small food souvenirs. The wrapping and presentation matter as much as the gift itself.').
truth_importance(omiyage, 7).
truth_timestep(omiyage, 0).

%% Verb Conjugation
truth(verb_conjugation_jp, 'Verb Conjugation', linguistic_note).
truth_content(verb_conjugation_jp, 'Japanese verbs conjugate for tense, politeness, negation, and mood but not for person or number. The -masu form is polite present, -mashita is polite past, and -masen is polite negative. Plain forms (taberu, tabeta, tabenai) are used among close friends.').
truth_importance(verb_conjugation_jp, 8).
truth_timestep(verb_conjugation_jp, 0).

%% Meishi (Business Cards)
truth(meishi, 'Meishi Business Card Exchange', social_rule).
truth_content(meishi, 'Exchanging business cards (meishi) is a formal ritual. Cards are presented with both hands, received with both hands, read carefully, and placed respectfully on the table -- never written on or stuffed in a pocket.').
truth_importance(meishi, 6).
truth_timestep(meishi, 0).

%% Onomatopoeia
truth(onomatopoeia, 'Onomatopoeia Richness', linguistic_note).
truth_content(onomatopoeia, 'Japanese has an extremely rich system of sound-symbolic words. Giongo mimic actual sounds (wan-wan for a dog), gitaigo describe states or feelings (pika-pika for sparkling), and gijougo describe emotions (waku-waku for excitement). Hundreds are used daily.').
truth_importance(onomatopoeia, 7).
truth_timestep(onomatopoeia, 0).

%% Shotengai Culture
truth(shotengai_culture, 'Shotengai Shopping Arcades', social_rule).
truth_content(shotengai_culture, 'Covered shopping arcades (shotengai) are the social heart of many Japanese towns. Small family-owned shops selling tofu, fish, vegetables, and sweets line the arcade. They face competition from convenience stores and supermarkets but remain beloved community spaces.').
truth_importance(shotengai_culture, 7).
truth_timestep(shotengai_culture, 0).

%% Sento and Onsen
truth(bathing_culture, 'Bathing Culture', cultural_norm).
truth_content(bathing_culture, 'Public baths (sento) and hot springs (onsen) are important social and relaxation spaces. Bathers must wash thoroughly before entering the shared bath. Tattoos are often prohibited. The ritual of bathing is about cleansing the mind as much as the body.').
truth_importance(bathing_culture, 7).
truth_timestep(bathing_culture, 0).

%% Wa (Harmony)
truth(wa_harmony, 'Wa -- Social Harmony', cultural_norm).
truth_content(wa_harmony, 'Maintaining wa (harmony) is a core value. Direct confrontation is avoided. Disagreements are expressed indirectly. The phrase kuuki wo yomu (reading the air) describes the skill of understanding unspoken social cues and expectations.').
truth_importance(wa_harmony, 9).
truth_timestep(wa_harmony, 0).

%% Katakana for Loanwords
truth(katakana_loanwords, 'Katakana and Loanwords', linguistic_note).
truth_content(katakana_loanwords, 'Thousands of English and other foreign loanwords have been adapted into Japanese using katakana. Computer becomes konpyuutaa, coffee becomes koohii, and restaurant becomes resutoran. Recognizing katakana loanwords can rapidly expand vocabulary.').
truth_importance(katakana_loanwords, 7).
truth_timestep(katakana_loanwords, 0).

%% Rice Culture
truth(rice_culture, 'Rice in Japanese Life', cultural_norm).
truth_content(rice_culture, 'Rice (kome/gohan) is the foundation of Japanese cuisine and culture. Gohan means both cooked rice and meal itself. Rice paddies (tanbo) define the rural landscape. Sake is brewed from rice. Wasting rice is considered deeply disrespectful.').
truth_importance(rice_culture, 7).
truth_timestep(rice_culture, 0).

%% Matsuri (Festivals)
truth(matsuri_festivals, 'Matsuri Festivals', cultural_norm).
truth_content(matsuri_festivals, 'Seasonal festivals (matsuri) are community celebrations tied to shrines and temples. Participants wear yukata, carry portable shrines (mikoshi), dance in bon odori, and eat festival foods like yakisoba, takoyaki, and kakigori from yatai stalls.').
truth_importance(matsuri_festivals, 7).
truth_timestep(matsuri_festivals, 0).

%% Kopula Desu
truth(desu_copula, 'The Copula Desu', linguistic_note).
truth_content(desu_copula, 'Desu is the polite copula (equivalent to is/am/are). It appears at the end of sentences: kore wa hon desu (this is a book). Its casual form is da. Adding desu to adjectives makes them polite. It is one of the first grammar points learners master.').
truth_importance(desu_copula, 8).
truth_timestep(desu_copula, 0).

%% Tipping Taboo
truth(tipping_taboo, 'No Tipping Culture', social_rule).
truth_content(tipping_taboo, 'Tipping is not practiced in Japan and can even be considered rude. Good service is expected as a matter of professional pride. Attempting to leave a tip may cause confusion or embarrassment for the recipient.').
truth_importance(tipping_taboo, 6).
truth_timestep(tipping_taboo, 0).
