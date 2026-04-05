%% Insimul Quests: High Fantasy
%% Source: data/worlds/high_fantasy/quests.pl
%% Created: 2026-04-03
%% Total: 12 quests

%% ═══════════════════════════════════════════════════════════
%% Beginner Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: The Wanderers Arrival
quest(wanderers_arrival, 'The Wanderers Arrival', exploration, beginner, active).
quest_assigned_to(wanderers_arrival, '{{player}}').
quest_tag(wanderers_arrival, generated).
quest_objective(wanderers_arrival, 0, objective('Arrive at Thornhaven and speak with Lord Aldric Thornwall.')).
quest_objective(wanderers_arrival, 1, talk_to('aldric_thornwall', 1)).
quest_objective(wanderers_arrival, 2, objective('Visit the Sleeping Dragon Inn and rest for the night.')).
quest_objective(wanderers_arrival, 3, objective('Register at the Adventurers Guild with Sera Blackthorn.')).
quest_reward(wanderers_arrival, experience, 100).
quest_reward(wanderers_arrival, gold, 50).
quest_available(Player, wanderers_arrival) :-
    quest(wanderers_arrival, _, _, _, active).

%% Quest: The Blacksmiths Request
quest(blacksmiths_request, 'The Blacksmiths Request', fetch, beginner, active).
quest_assigned_to(blacksmiths_request, '{{player}}').
quest_tag(blacksmiths_request, generated).
quest_objective(blacksmiths_request, 0, talk_to('gareth_steelheart', 1)).
quest_objective(blacksmiths_request, 1, objective('Gather iron ore from the hills outside Thornhaven.')).
quest_objective(blacksmiths_request, 2, objective('Deliver the ore to Gareth at Steelheart Smithy.')).
quest_reward(blacksmiths_request, experience, 120).
quest_reward(blacksmiths_request, gold, 75).
quest_reward(blacksmiths_request, item, iron_shortsword).
quest_available(Player, blacksmiths_request) :-
    quest(blacksmiths_request, _, _, _, active).

%% Quest: Herb Gathering for Maren
quest(herb_gathering, 'Herb Gathering', fetch, beginner, active).
quest_assigned_to(herb_gathering, '{{player}}').
quest_tag(herb_gathering, generated).
quest_objective(herb_gathering, 0, talk_to('maren_thornwall', 1)).
quest_objective(herb_gathering, 1, objective('Gather moonpetal flowers from the Enchanted Forest edge.')).
quest_objective(herb_gathering, 2, objective('Collect silvervine roots near the river.')).
quest_objective(herb_gathering, 3, objective('Return to Maren at the Healer Cottage.')).
quest_reward(herb_gathering, experience, 100).
quest_reward(herb_gathering, gold, 60).
quest_reward(herb_gathering, item, healing_potion).
quest_available(Player, herb_gathering) :-
    quest(herb_gathering, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Intermediate Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: The Road to Aelindor
quest(road_to_aelindor, 'The Road to Aelindor', exploration, intermediate, active).
quest_assigned_to(road_to_aelindor, '{{player}}').
quest_tag(road_to_aelindor, generated).
quest_objective(road_to_aelindor, 0, objective('Travel through the Enchanted Forest to reach Aelindor.')).
quest_objective(road_to_aelindor, 1, objective('Survive an encounter with forest sprites.')).
quest_objective(road_to_aelindor, 2, objective('Present yourself at the gates of the Elven Capital.')).
quest_objective(road_to_aelindor, 3, talk_to('caelindra_starweaver', 1)).
quest_reward(road_to_aelindor, experience, 250).
quest_reward(road_to_aelindor, gold, 150).
quest_available(Player, road_to_aelindor) :-
    quest(road_to_aelindor, _, _, _, active).

%% Quest: The Arcane Trials
quest(arcane_trials, 'The Arcane Trials', combat, intermediate, active).
quest_assigned_to(arcane_trials, '{{player}}').
quest_tag(arcane_trials, generated).
quest_objective(arcane_trials, 0, talk_to('ithrandil_moonwhisper', 1)).
quest_objective(arcane_trials, 1, objective('Pass the Trial of Elements in the Arcane Academy.')).
quest_objective(arcane_trials, 2, objective('Demonstrate mastery of a basic spell before the Archmage.')).
quest_objective(arcane_trials, 3, objective('Receive your first spell scroll from Ithrandil.')).
quest_reward(arcane_trials, experience, 300).
quest_reward(arcane_trials, gold, 100).
quest_reward(arcane_trials, item, scroll_of_fireball).
quest_available(Player, arcane_trials) :-
    quest(arcane_trials, _, _, _, active).

%% Quest: Descent into Khazad Dumrak
quest(descent_khazad_dumrak, 'Descent into Khazad Dumrak', exploration, intermediate, active).
quest_assigned_to(descent_khazad_dumrak, '{{player}}').
quest_tag(descent_khazad_dumrak, generated).
quest_objective(descent_khazad_dumrak, 0, objective('Find the entrance to Khazad Dumrak in the Ironpeak Mountains.')).
quest_objective(descent_khazad_dumrak, 1, objective('Prove your worth to the dwarven gate guards.')).
quest_objective(descent_khazad_dumrak, 2, talk_to('thorgar_ironforge', 1)).
quest_objective(descent_khazad_dumrak, 3, objective('Witness the Eternal Forge in operation.')).
quest_reward(descent_khazad_dumrak, experience, 280).
quest_reward(descent_khazad_dumrak, gold, 200).
quest_available(Player, descent_khazad_dumrak) :-
    quest(descent_khazad_dumrak, _, _, _, active).

%% Quest: The Mithril Vein
quest(mithril_vein, 'The Mithril Vein', fetch, intermediate, active).
quest_assigned_to(mithril_vein, '{{player}}').
quest_tag(mithril_vein, generated).
quest_objective(mithril_vein, 0, talk_to('dolgrim_stonebeard', 1)).
quest_objective(mithril_vein, 1, objective('Venture into the Deep Mines to find the lost mithril vein.')).
quest_objective(mithril_vein, 2, objective('Defeat the cave trolls guarding the passage.')).
quest_objective(mithril_vein, 3, objective('Return with a mithril ore sample for Dolgrim.')).
quest_reward(mithril_vein, experience, 350).
quest_reward(mithril_vein, gold, 250).
quest_reward(mithril_vein, item, mithril_ore).
quest_available(Player, mithril_vein) :-
    quest(mithril_vein, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Advanced Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: The Dragon of Ashenmaw
quest(dragon_of_ashenmaw, 'The Dragon of Ashenmaw', combat, advanced, active).
quest_assigned_to(dragon_of_ashenmaw, '{{player}}').
quest_tag(dragon_of_ashenmaw, generated).
quest_objective(dragon_of_ashenmaw, 0, objective('Learn about the dragon Vorathrax from ancient texts in the Rune Library.')).
quest_objective(dragon_of_ashenmaw, 1, objective('Seek the Dragonbane sword in the ruins of Ashenmaw Peak.')).
quest_objective(dragon_of_ashenmaw, 2, objective('Navigate the volcanic caverns to reach the dragon lair.')).
quest_objective(dragon_of_ashenmaw, 3, objective('Defeat or parley with Vorathrax the Flame Tyrant.')).
quest_reward(dragon_of_ashenmaw, experience, 500).
quest_reward(dragon_of_ashenmaw, gold, 500).
quest_reward(dragon_of_ashenmaw, item, dragonbane_sword).
quest_available(Player, dragon_of_ashenmaw) :-
    quest(dragon_of_ashenmaw, _, _, _, active).

%% Quest: The Sundering Prophecy
quest(sundering_prophecy, 'The Sundering Prophecy', conversation, advanced, active).
quest_assigned_to(sundering_prophecy, '{{player}}').
quest_tag(sundering_prophecy, generated).
quest_objective(sundering_prophecy, 0, talk_to('faelina_dawnpetal', 1)).
quest_objective(sundering_prophecy, 1, objective('Decipher the ancient elven prophecy carved into the Tree of Ages.')).
quest_objective(sundering_prophecy, 2, objective('Gather the three Shards of Aethon from across the realm.')).
quest_objective(sundering_prophecy, 3, objective('Bring the shards to the Moonwell to reveal the full prophecy.')).
quest_reward(sundering_prophecy, experience, 600).
quest_reward(sundering_prophecy, gold, 400).
quest_reward(sundering_prophecy, item, amulet_of_prophecy).
quest_available(Player, sundering_prophecy) :-
    quest(sundering_prophecy, _, _, _, active).

%% Quest: Forging the Runebound Blade
quest(runebound_blade, 'Forging the Runebound Blade', crafting, advanced, active).
quest_assigned_to(runebound_blade, '{{player}}').
quest_tag(runebound_blade, generated).
quest_objective(runebound_blade, 0, talk_to('thorgar_ironforge', 1)).
quest_objective(runebound_blade, 1, objective('Gather mithril ore from the Deep Mines.')).
quest_objective(runebound_blade, 2, talk_to('hilda_ironforge', 1)).
quest_objective(runebound_blade, 3, objective('Have Hilda inscribe the runes of power upon the blade.')).
quest_objective(runebound_blade, 4, objective('Quench the blade in the Moonwell of Aelindor.')).
quest_reward(runebound_blade, experience, 700).
quest_reward(runebound_blade, gold, 300).
quest_reward(runebound_blade, item, runebound_blade_item).
quest_available(Player, runebound_blade) :-
    quest(runebound_blade, _, _, _, active).

%% Quest: The Shadow in the Deep
quest(shadow_in_the_deep, 'The Shadow in the Deep', combat, advanced, active).
quest_assigned_to(shadow_in_the_deep, '{{player}}').
quest_tag(shadow_in_the_deep, generated).
quest_objective(shadow_in_the_deep, 0, talk_to('dolgrim_stonebeard', 1)).
quest_objective(shadow_in_the_deep, 1, objective('Investigate the dark presence awakened in the lowest mines.')).
quest_objective(shadow_in_the_deep, 2, objective('Seal the rift to the Shadow Realm using the Rune of Binding.')).
quest_objective(shadow_in_the_deep, 3, objective('Report your findings to King Thalion and Thorgar.')).
quest_reward(shadow_in_the_deep, experience, 800).
quest_reward(shadow_in_the_deep, gold, 600).
quest_available(Player, shadow_in_the_deep) :-
    quest(shadow_in_the_deep, _, _, _, active).

%% Quest: Alliance of the Three Peoples
quest(alliance_three_peoples, 'Alliance of the Three Peoples', conversation, advanced, active).
quest_assigned_to(alliance_three_peoples, '{{player}}').
quest_tag(alliance_three_peoples, generated).
quest_objective(alliance_three_peoples, 0, objective('Gain the trust of all three faction leaders.')).
quest_objective(alliance_three_peoples, 1, talk_to('thalion_starweaver', 1)).
quest_objective(alliance_three_peoples, 2, talk_to('thorgar_ironforge', 1)).
quest_objective(alliance_three_peoples, 3, talk_to('aldric_thornwall', 1)).
quest_objective(alliance_three_peoples, 4, objective('Broker a peace treaty at the Council of Three Fires.')).
quest_reward(alliance_three_peoples, experience, 1000).
quest_reward(alliance_three_peoples, gold, 800).
quest_reward(alliance_three_peoples, item, sigil_of_unity).
quest_available(Player, alliance_three_peoples) :-
    quest(alliance_three_peoples, _, _, _, active).
