%% Insimul Truths: Mughal Bengal
%% Source: data/worlds/language/bengali/truths.pl
%% Created: 2026-04-03
%% Total: 24 truths
%%
%% Predicate schema:
%%   truth/3 — truth(AtomId, Title, EntryType)
%%   truth_content/2, truth_importance/2, truth_public/1
%%   truth_character/2, truth_timestep/2

%% ─── Character Truths ───

%% The Zamindar's Burden
truth(the_zamindars_burden, 'The Zamindar''s Burden', trait).
truth_content(the_zamindars_burden, 'Raghunath Chowdhury manages the land revenue for the Mughal administration. He is torn between loyalty to the Emperor and protecting his tenants from excessive taxation.').
truth_importance(the_zamindars_burden, 9).
truth_character(the_zamindars_burden, raghunath_chowdhury).
truth_timestep(the_zamindars_burden, 0).

%% The Hidden Ledger
truth(the_hidden_ledger, 'The Hidden Ledger', secret).
truth_content(the_hidden_ledger, 'Raghunath keeps a secret ledger showing he has been under-reporting jute yields to reduce the tax burden on poor farmers, risking severe punishment from the Mughal court.').
truth_importance(the_hidden_ledger, 10).
truth_character(the_hidden_ledger, raghunath_chowdhury).
truth_timestep(the_hidden_ledger, 0).

%% The Healing Matriarch
truth(the_healing_matriarch, 'The Healing Matriarch', trait).
truth_content(the_healing_matriarch, 'Sarojini Chowdhury is renowned for her knowledge of herbal medicine. Women from across the delta seek her counsel for ailments and childbirth.').
truth_importance(the_healing_matriarch, 8).
truth_character(the_healing_matriarch, sarojini_chowdhury).
truth_timestep(the_healing_matriarch, 0).

%% Master Weaver
truth(master_weaver, 'Master Weaver', trait).
truth_content(master_weaver, 'Gobinda Das is among the last weavers who can produce the legendary Dhaka muslin so fine that an entire sari can pass through a finger ring. He fears the art will die with him.').
truth_importance(master_weaver, 9).
truth_character(master_weaver, gobinda_das).
truth_timestep(master_weaver, 0).

%% The Forbidden Pattern
truth(the_forbidden_pattern, 'The Forbidden Pattern', secret).
truth_content(the_forbidden_pattern, 'Gobinda has secretly woven a jamdani with the pattern reserved exclusively for the Mughal emperor. If discovered, he could be arrested, but the pattern is the pinnacle of his craft.').
truth_importance(the_forbidden_pattern, 10).
truth_character(the_forbidden_pattern, gobinda_das).
truth_timestep(the_forbidden_pattern, 0).

%% The Poet of Sonargaon
truth(the_poet_of_sonargaon, 'The Poet of Sonargaon', trait).
truth_content(the_poet_of_sonargaon, 'Farid Sheikh is a wandering poet and Sufi mystic who writes verse in both Bengali and Persian. His monsoon poems are sung by boatmen throughout the delta.').
truth_importance(the_poet_of_sonargaon, 8).
truth_character(the_poet_of_sonargaon, farid_sheikh).
truth_timestep(the_poet_of_sonargaon, 0).

%% The Merchant Prince
truth(the_merchant_prince, 'The Merchant Prince', trait).
truth_content(the_merchant_prince, 'Biswanath Sarkar controls the muslin and spice trade routes connecting Sonargaon to Dhaka and the Mughal heartland. His wealth rivals the local Nawab.').
truth_importance(the_merchant_prince, 8).
truth_character(the_merchant_prince, biswanath_sarkar).
truth_timestep(the_merchant_prince, 0).

%% The Smuggler's Route
truth(the_smugglers_route, 'The Smuggler''s Route', secret).
truth_content(the_smugglers_route, 'Biswanath secretly trades muslin with Portuguese and Dutch merchants at the coast, bypassing Mughal trade regulations and keeping the premium profits for himself.').
truth_importance(the_smugglers_route, 9).
truth_character(the_smugglers_route, biswanath_sarkar).
truth_timestep(the_smugglers_route, 0).

%% The River's Voice
truth(the_rivers_voice, 'The River''s Voice', trait).
truth_content(the_rivers_voice, 'Haripada Mondal can read the Meghna river like a book — predicting floods, locating fish shoals, and navigating channels in pitch darkness. His family has fished these waters for generations.').
truth_importance(the_rivers_voice, 7).
truth_character(the_rivers_voice, haripada_mondal).
truth_timestep(the_rivers_voice, 0).

%% The Potter's Vision
truth(the_potters_vision, 'The Potter''s Vision', trait).
truth_content(the_potters_vision, 'Madhusudan Pal is the finest idol-maker in the delta. His Durga protimas are said to be so lifelike that devotees swear the goddess inhabits them during puja.').
truth_importance(the_potters_vision, 7).
truth_character(the_potters_vision, madhusudan_pal).
truth_timestep(the_potters_vision, 0).

%% Forbidden Love Across Faiths
truth(forbidden_love_across_faiths, 'Forbidden Love Across Faiths', relationship).
truth_content(forbidden_love_across_faiths, 'Nusrat Sheikh and Anirban Chowdhury have fallen deeply in love, but their union would scandalize both the Muslim and Hindu communities of Sonargaon.').
truth_importance(forbidden_love_across_faiths, 9).
truth_character(forbidden_love_across_faiths, nusrat_sheikh).
truth_timestep(forbidden_love_across_faiths, 0).

%% The Apprentice's Ambition
truth(the_apprentices_ambition, 'The Apprentice''s Ambition', relationship).
truth_content(the_apprentices_ambition, 'Nikhil Das secretly resents his father''s insistence on weaving and dreams of becoming a merchant like Biswanath Sarkar, leaving the loom behind forever.').
truth_importance(the_apprentices_ambition, 7).
truth_character(the_apprentices_ambition, nikhil_das).
truth_timestep(the_apprentices_ambition, 0).

%% ─── Cultural and Linguistic Truths ───

%% The Muslin Legacy
truth(the_muslin_legacy, 'The Muslin Legacy', cultural).
truth_content(the_muslin_legacy, 'Dhaka muslin was so fine that Mughal emperors called it "baft hawa" (woven air). The secret lies in the phuti karpas cotton that grows only along the Meghna river.').
truth_importance(the_muslin_legacy, 9).
truth_public(the_muslin_legacy).
truth_timestep(the_muslin_legacy, 0).

%% Bengali Script
truth(bengali_script, 'Bengali Script', cultural).
truth_content(bengali_script, 'Bengali is written in its own script derived from ancient Brahmi. Unlike Urdu or Persian, it reads left to right. The script has 11 vowels and 39 consonants.').
truth_importance(bengali_script, 8).
truth_public(bengali_script).
truth_timestep(bengali_script, 0).

%% The Baul Tradition
truth(the_baul_tradition, 'The Baul Tradition', cultural).
truth_content(the_baul_tradition, 'The Bauls are mystic minstrels who wander Bengal singing devotional songs that blend Hindu and Muslim spiritual traditions. They carry ektaras and reject orthodox religion.').
truth_importance(the_baul_tradition, 8).
truth_public(the_baul_tradition).
truth_timestep(the_baul_tradition, 0).

%% Bengali Hospitality
truth(bengali_hospitality, 'Bengali Hospitality', cultural).
truth_content(bengali_hospitality, 'In Bengal, a guest is treated as a manifestation of God (atithi devata). Visitors must be offered paan supari and at minimum a glass of water. Refusing hospitality is a grave insult.').
truth_importance(bengali_hospitality, 7).
truth_public(bengali_hospitality).
truth_timestep(bengali_hospitality, 0).

%% The Bengali Calendar
truth(the_bengali_calendar, 'The Bengali Calendar', cultural).
truth_content(the_bengali_calendar, 'Bengal follows its own solar calendar (Bangla Shon) with months like Boishakh, Jyoishtho, and Asharh. The new year (Pohela Boishakh) is celebrated with fairs and feasting.').
truth_importance(the_bengali_calendar, 7).
truth_public(the_bengali_calendar).
truth_timestep(the_bengali_calendar, 0).

%% Monsoon Culture
truth(monsoon_culture, 'Monsoon Culture', cultural).
truth_content(monsoon_culture, 'The monsoon (borsha) defines Bengali life. It floods the delta, fills the rice paddies, and brings the ilish fish upstream. Poets celebrate it as a time of romance, longing, and renewal.').
truth_importance(monsoon_culture, 8).
truth_public(monsoon_culture).
truth_timestep(monsoon_culture, 0).

%% Bengali Kinship Terms
truth(bengali_kinship_terms, 'Bengali Kinship Terms', cultural).
truth_content(bengali_kinship_terms, 'Bengali has distinct words for maternal vs paternal relatives: mama (maternal uncle) vs kaka (paternal uncle), mashi (maternal aunt) vs pishi (paternal aunt). Using the wrong term is a social blunder.').
truth_importance(bengali_kinship_terms, 8).
truth_public(bengali_kinship_terms).
truth_timestep(bengali_kinship_terms, 0).

%% The Tumi/Apni Distinction
truth(tumi_apni_distinction, 'The Tumi/Apni Distinction', cultural).
truth_content(tumi_apni_distinction, 'Bengali has three levels of the pronoun "you": tui (intimate/inferior), tumi (familiar), and apni (formal/respectful). Using tui with an elder is deeply offensive.').
truth_importance(tumi_apni_distinction, 9).
truth_public(tumi_apni_distinction).
truth_timestep(tumi_apni_distinction, 0).

%% Fish and Rice Identity
truth(fish_and_rice_identity, 'Fish and Rice Identity', cultural).
truth_content(fish_and_rice_identity, 'Bengalis say "Maache Bhaate Bangali" — a Bengali is made of fish and rice. The hilsa (ilish) is the undisputed king of fish, and no celebration is complete without it.').
truth_importance(fish_and_rice_identity, 7).
truth_public(fish_and_rice_identity).
truth_timestep(fish_and_rice_identity, 0).

%% The Durga Puja
truth(the_durga_puja, 'The Durga Puja', cultural).
truth_content(the_durga_puja, 'Durga Puja is the greatest Bengali festival. Artisans like Madhusudan Pal spend months crafting clay idols of the goddess, which are immersed in the river on the final day.').
truth_importance(the_durga_puja, 9).
truth_public(the_durga_puja).
truth_timestep(the_durga_puja, 0).

%% The Mangalkavya Tradition
truth(the_mangalkavya_tradition, 'The Mangalkavya Tradition', cultural).
truth_content(the_mangalkavya_tradition, 'The Mangalkavya are Bengali narrative poems praising local deities like Manasa (snake goddess) and Chandi. They are performed at village gatherings and preserve folk history.').
truth_importance(the_mangalkavya_tradition, 7).
truth_public(the_mangalkavya_tradition).
truth_timestep(the_mangalkavya_tradition, 0).

%% Riverine Geography
truth(riverine_geography, 'Riverine Geography', cultural).
truth_content(riverine_geography, 'The Bengal Delta is formed by the confluence of the Ganges, Brahmaputra, and Meghna rivers. The land shifts constantly — islands appear and disappear. "Char" lands emerge from silt deposits.').
truth_importance(riverine_geography, 7).
truth_public(riverine_geography).
truth_timestep(riverine_geography, 0).
