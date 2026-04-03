%% Insimul Truths: Medieval Brittany
%% Source: data/worlds/language/breton/truths.pl
%% Created: 2026-04-03
%% Total: 24 truths
%%
%% Predicate schema:
%%   truth/3 — truth(AtomId, Title, EntryType)
%%   truth_content/2, truth_importance/2, truth_public/1
%%   truth_character/2, truth_timestep/2

%% ─── Character Truths ───

%% The Old Captain
truth(the_old_captain, 'The Old Captain', trait).
truth_content(the_old_captain, 'Yann Le Bihan has sailed every current of the Iroise Sea. He knows every reef, sandbar, and hidden cove from Ouessant to the Pointe du Raz.').
truth_importance(the_old_captain, 9).
truth_character(the_old_captain, yann_le_bihan).
truth_timestep(the_old_captain, 0).

%% The Drowned Son
truth(the_drowned_son, 'The Drowned Son', secret).
truth_content(the_drowned_son, 'Yann lost his eldest son to the sea ten years ago. He has never spoken of it, but the empty chair at his table tells its story.').
truth_importance(the_drowned_son, 10).
truth_character(the_drowned_son, yann_le_bihan).
truth_timestep(the_drowned_son, 0).

%% The Mending Wife
truth(the_mending_wife, 'The Mending Wife', trait).
truth_content(the_mending_wife, 'Soazig Le Bihan mends every net in the village. Her knots are so strong that fishermen from neighbouring parishes seek her work.').
truth_importance(the_mending_wife, 7).
truth_character(the_mending_wife, soazig_le_bihan).
truth_timestep(the_mending_wife, 0).

%% The Master Weaver
truth(the_master_weaver, 'The Master Weaver', trait).
truth_content(the_master_weaver, 'Goulven Kernev weaves the finest linen in Bro Leon. His patterns preserve ancient Celtic knotwork that dates back to the migration from Britain.').
truth_importance(the_master_weaver, 9).
truth_character(the_master_weaver, goulven_kernev).
truth_timestep(the_master_weaver, 0).

%% The Hidden Pattern
truth(the_hidden_pattern, 'The Hidden Pattern', secret).
truth_content(the_hidden_pattern, 'Goulven has secretly woven pagan symbols into the altar cloth of the chapel. He believes the old gods still protect the village alongside the Christian saints.').
truth_importance(the_hidden_pattern, 10).
truth_character(the_hidden_pattern, goulven_kernev).
truth_timestep(the_hidden_pattern, 0).

%% The Duke's Steward
truth(the_dukes_steward, 'The Duke''s Steward', trait).
truth_content(the_dukes_steward, 'Riwal Karadeg collects taxes and administers justice on behalf of the Duke of Brittany. He is torn between loyalty to the Duke and protecting his villagers from heavy levies.').
truth_importance(the_dukes_steward, 9).
truth_character(the_dukes_steward, riwal_karadeg).
truth_timestep(the_dukes_steward, 0).

%% The Forged Charter
truth(the_forged_charter, 'The Forged Charter', secret).
truth_content(the_forged_charter, 'Riwal forged a ducal charter granting Porzh-Gwenn reduced harbour taxes. If the Duke discovers the deception, Riwal faces imprisonment or worse.').
truth_importance(the_forged_charter, 10).
truth_character(the_forged_charter, riwal_karadeg).
truth_timestep(the_forged_charter, 0).

%% The Herb Woman
truth(the_herb_woman, 'The Herb Woman', trait).
truth_content(the_herb_woman, 'Enora Morvan knows every healing plant on the moor. Villagers come to her before they visit the priest, and her remedies rarely fail.').
truth_importance(the_herb_woman, 8).
truth_character(the_herb_woman, enora_morvan).
truth_timestep(the_herb_woman, 0).

%% The Pagan Rites
truth(the_pagan_rites, 'The Pagan Rites', secret).
truth_content(the_pagan_rites, 'Enora performs rituals at the standing stones on solstice nights, blending druidic chants with Christian prayers. The parish priest suspects but cannot prove it.').
truth_importance(the_pagan_rites, 9).
truth_character(the_pagan_rites, enora_morvan).
truth_timestep(the_pagan_rites, 0).

%% The Strong Smith
truth(the_strong_smith, 'The Strong Smith', trait).
truth_content(the_strong_smith, 'Jakez Guivarch is the strongest man in Lann-Vraz. He can forge an anchor in a single day and bend horseshoes with his bare hands.').
truth_importance(the_strong_smith, 7).
truth_character(the_strong_smith, jakez_guivarch).
truth_timestep(the_strong_smith, 0).

%% The Stolen Ore
truth(the_stolen_ore, 'The Stolen Ore', secret).
truth_content(the_stolen_ore, 'Jakez has been buying bog iron from smugglers to avoid the Duke''s iron tax. If discovered, his smithy would be confiscated.').
truth_importance(the_stolen_ore, 8).
truth_character(the_stolen_ore, jakez_guivarch).
truth_timestep(the_stolen_ore, 0).

%% The Ballad Singer
truth(the_ballad_singer, 'The Ballad Singer', trait).
truth_content(the_ballad_singer, 'Maiwenn Kernev has the finest voice in Porzh-Gwenn. She knows every gwerz ballad from the Barzaz Breiz tradition.').
truth_importance(the_ballad_singer, 8).
truth_character(the_ballad_singer, maiwenn_kernev).
truth_timestep(the_ballad_singer, 0).

%% ─── Cultural Truths ───

%% Breton Consonant Mutations
truth(breton_consonant_mutations, 'Breton Consonant Mutations', cultural).
truth_content(breton_consonant_mutations, 'Breton has four types of consonant mutation: soft (kemmadur dre vlotaat), spirant (kemmadur dre c''hwezhadenniñ), hard (kemmadur dre galedaat), and mixed. These change the initial consonant of a word depending on grammatical context — e.g., "tad" (father) becomes "da dad" (your father).').
truth_importance(breton_consonant_mutations, 10).
truth_timestep(breton_consonant_mutations, 0).

%% The Pardons
truth(the_pardons, 'The Pardons', cultural).
truth_content(the_pardons, 'Pardons are uniquely Breton religious festivals combining Catholic processions with Celtic customs. Villagers walk in procession carrying relics and banners, followed by feasting, wrestling, and music.').
truth_importance(the_pardons, 9).
truth_timestep(the_pardons, 0).

%% The Ankou
truth(the_ankou, 'The Ankou', cultural).
truth_content(the_ankou, 'The Ankou is the Breton personification of death — a skeletal figure with a scythe who drives a creaking cart. Every parish has its own Ankou: the last person to die in a year becomes the next Ankou.').
truth_importance(the_ankou, 9).
truth_timestep(the_ankou, 0).

%% Standing Stones and Menhirs
truth(standing_stones_menhirs, 'Standing Stones and Menhirs', cultural).
truth_content(standing_stones_menhirs, 'Brittany has the highest concentration of megalithic monuments in the world. The menhirs (standing stones) and dolmens (passage graves) predate Celtic settlement and are woven into Breton folklore as petrified giants or fairy dwellings.').
truth_importance(standing_stones_menhirs, 8).
truth_timestep(standing_stones_menhirs, 0).

%% Maritime Independence
truth(maritime_independence, 'Maritime Independence', cultural).
truth_content(maritime_independence, 'Breton fishermen fiercely guard their right to fish the Atlantic freely. The Duchy grants fishing communities special charters exempting them from many feudal obligations in exchange for naval service in wartime.').
truth_importance(maritime_independence, 8).
truth_timestep(maritime_independence, 0).

%% The Fest-Noz
truth(the_fest_noz, 'The Fest-Noz', cultural).
truth_content(the_fest_noz, 'The fest-noz (night festival) is a communal dance gathering where couples form chains and circles to the music of the biniou and bombard. It binds communities together through shared rhythm and song.').
truth_importance(the_fest_noz, 8).
truth_timestep(the_fest_noz, 0).

%% Celtic Church Traditions
truth(celtic_church_traditions, 'Celtic Church Traditions', cultural).
truth_content(celtic_church_traditions, 'Brittany preserves Celtic Christian traditions distinct from Roman practice. Local saints like Santez Anna (Saint Anne), patron of Brittany, are venerated alongside uniquely Breton saints not recognized by Rome.').
truth_importance(celtic_church_traditions, 7).
truth_timestep(celtic_church_traditions, 0).

%% Breton Cider Culture
truth(breton_cider_culture, 'Breton Cider Culture', cultural).
truth_content(breton_cider_culture, 'Cider (sistr) rather than wine is the drink of Brittany. Every farmstead maintains an orchard, and pressing day is a communal event. Cider accompanies every meal and seals every bargain.').
truth_importance(breton_cider_culture, 7).
truth_timestep(breton_cider_culture, 0).

%% The Ermine Symbol
truth(the_ermine_symbol, 'The Ermine Symbol', cultural).
truth_content(the_ermine_symbol, 'The ermine (erminig) is the symbol of Brittany, appearing on the ducal coat of arms. According to legend, Duchess Anne''s ermine chose death over soiling its white fur — the motto "Kentoc''h mervel eget bezañ saotret" (rather death than dishonour).').
truth_importance(the_ermine_symbol, 8).
truth_timestep(the_ermine_symbol, 0).

%% Breton and Welsh Connection
truth(breton_welsh_connection, 'Breton and Welsh Connection', cultural).
truth_content(breton_welsh_connection, 'Breton speakers can partially understand Welsh, as both languages descend from Brythonic Celtic. Medieval Breton bards and Welsh poets exchanged verses, and the legend of Tristan and Iseult originates in this shared literary tradition.').
truth_importance(breton_welsh_connection, 8).
truth_timestep(breton_welsh_connection, 0).

%% The Seaweed Harvesters
truth(the_seaweed_harvesters, 'The Seaweed Harvesters', cultural).
truth_content(the_seaweed_harvesters, 'Coastal Bretons harvest seaweed (bezhin) for fertilizer, food, and soda ash production. Seaweed rights are communally managed and disputes over gathering grounds can last generations.').
truth_importance(the_seaweed_harvesters, 7).
truth_timestep(the_seaweed_harvesters, 0).

%% Breton Ship Blessing
truth(breton_ship_blessing, 'Breton Ship Blessing', cultural).
truth_content(breton_ship_blessing, 'Before any new boat''s maiden voyage, the priest blesses it and the crew scatters holy water on the hull. The boat is given a woman''s name and a carved figurehead of Santez Anna to protect the sailors.').
truth_importance(breton_ship_blessing, 7).
truth_timestep(breton_ship_blessing, 0).
