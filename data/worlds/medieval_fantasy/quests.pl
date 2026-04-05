%% Insimul Quests: Medieval Fantasy
%% Source: data/worlds/medieval_fantasy/quests.pl
%% Created: 2026-04-03
%% Total: 12 quests

%% ═══════════════════════════════════════════════════════════
%% Beginner Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: The Kings Summons
quest(kings_summons, 'The Kings Summons', conversation, beginner, active).
quest_assigned_to(kings_summons, '{{player}}').
quest_tag(kings_summons, generated).
quest_objective(kings_summons, 0, objective('Present yourself at Valdris Castle and speak with King Aldric.')).
quest_objective(kings_summons, 1, talk_to('aldric_valdris', 1)).
quest_objective(kings_summons, 2, objective('Learn the customs of the royal court from Queen Maren.')).
quest_reward(kings_summons, experience, 100).
quest_reward(kings_summons, gold, 50).
quest_available(Player, kings_summons) :-
    quest(kings_summons, _, _, _, active).

%% Quest: Blade and Bellows
quest(blade_and_bellows, 'Blade and Bellows', crafting, beginner, active).
quest_assigned_to(blade_and_bellows, '{{player}}').
quest_tag(blade_and_bellows, generated).
quest_objective(blade_and_bellows, 0, objective('Visit Gareth Ironhand at the Ironhand Forge.')).
quest_objective(blade_and_bellows, 1, talk_to('gareth_ironhand', 1)).
quest_objective(blade_and_bellows, 2, objective('Help forge a simple iron dagger at the anvil.')).
quest_objective(blade_and_bellows, 3, objective('Deliver the finished dagger to Sir Cedric at the barracks.')).
quest_reward(blade_and_bellows, experience, 120).
quest_reward(blade_and_bellows, gold, 60).
quest_reward(blade_and_bellows, item, iron_dagger).
quest_available(Player, blade_and_bellows) :-
    quest(blade_and_bellows, _, _, _, active).

%% Quest: A Round at the Flagon
quest(round_at_the_flagon, 'A Round at the Flagon', exploration, beginner, active).
quest_assigned_to(round_at_the_flagon, '{{player}}').
quest_tag(round_at_the_flagon, generated).
quest_objective(round_at_the_flagon, 0, objective('Find The Gilded Flagon tavern in the Merchants Quarter.')).
quest_objective(round_at_the_flagon, 1, objective('Buy a mead and listen to rumors from the patrons.')).
quest_objective(round_at_the_flagon, 2, objective('Report the rumors to Sir Cedric Ashford.')).
quest_reward(round_at_the_flagon, experience, 100).
quest_reward(round_at_the_flagon, gold, 40).
quest_available(Player, round_at_the_flagon) :-
    quest(round_at_the_flagon, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Intermediate Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: The Enchanted Glade
quest(enchanted_glade, 'The Enchanted Glade', exploration, intermediate, active).
quest_assigned_to(enchanted_glade, '{{player}}').
quest_tag(enchanted_glade, generated).
quest_objective(enchanted_glade, 0, objective('Travel to Thornhaven and find the path into the enchanted forest.')).
quest_objective(enchanted_glade, 1, objective('Locate the standing stones at the forest edge.')).
quest_objective(enchanted_glade, 2, talk_to('liriel', 1)).
quest_objective(enchanted_glade, 3, objective('Earn the trust of the fey guardian Liriel.')).
quest_reward(enchanted_glade, experience, 250).
quest_reward(enchanted_glade, gold, 100).
quest_reward(enchanted_glade, item, fey_blossom).
quest_available(Player, enchanted_glade) :-
    quest(enchanted_glade, _, _, _, active).

%% Quest: Shadows in the Alley
quest(shadows_in_the_alley, 'Shadows in the Alley', stealth, intermediate, active).
quest_assigned_to(shadows_in_the_alley, '{{player}}').
quest_tag(shadows_in_the_alley, generated).
quest_objective(shadows_in_the_alley, 0, objective('Meet Kael Shadowmere at The Rusty Nail after dark.')).
quest_objective(shadows_in_the_alley, 1, talk_to('kael_shadowmere', 1)).
quest_objective(shadows_in_the_alley, 2, objective('Infiltrate the smugglers warehouse without being seen.')).
quest_objective(shadows_in_the_alley, 3, objective('Recover the stolen merchant ledger and return it to Guild Row.')).
quest_reward(shadows_in_the_alley, experience, 280).
quest_reward(shadows_in_the_alley, gold, 150).
quest_available(Player, shadows_in_the_alley) :-
    quest(shadows_in_the_alley, _, _, _, active).

%% Quest: The Alchemists Request
quest(alchemists_request, 'The Alchemists Request', gathering, intermediate, active).
quest_assigned_to(alchemists_request, '{{player}}').
quest_tag(alchemists_request, generated).
quest_objective(alchemists_request, 0, talk_to('mirabel_thornwick', 1)).
quest_objective(alchemists_request, 1, objective('Gather three moonpetal flowers from the enchanted glade at night.')).
quest_objective(alchemists_request, 2, objective('Collect venom from a cave spider in Silverdeep.')).
quest_objective(alchemists_request, 3, objective('Return the ingredients to Mirabel for a healing potion.')).
quest_reward(alchemists_request, experience, 250).
quest_reward(alchemists_request, gold, 80).
quest_reward(alchemists_request, item, healing_potion).
quest_available(Player, alchemists_request) :-
    quest(alchemists_request, _, _, _, active).

%% Quest: Blessings of Light
quest(blessings_of_light, 'Blessings of Light', spiritual, intermediate, active).
quest_assigned_to(blessings_of_light, '{{player}}').
quest_tag(blessings_of_light, generated).
quest_objective(blessings_of_light, 0, talk_to('father_aldwin', 1)).
quest_objective(blessings_of_light, 1, objective('Cleanse the cursed shrine at the forest edge near Thornhaven.')).
quest_objective(blessings_of_light, 2, objective('Recover the lost holy relic from the abandoned crypt.')).
quest_objective(blessings_of_light, 3, objective('Return the relic to the Cathedral of Light.')).
quest_reward(blessings_of_light, experience, 300).
quest_reward(blessings_of_light, gold, 120).
quest_reward(blessings_of_light, item, holy_amulet).
quest_available(Player, blessings_of_light) :-
    quest(blessings_of_light, _, _, _, active).

%% Quest: The Herb Witchs Wisdom
quest(herb_witch_wisdom, 'The Herb Witch Wisdom', gathering, intermediate, active).
quest_assigned_to(herb_witch_wisdom, '{{player}}').
quest_tag(herb_witch_wisdom, generated).
quest_objective(herb_witch_wisdom, 0, objective('Travel to Thornhaven and visit Elara Willowshade.')).
quest_objective(herb_witch_wisdom, 1, talk_to('elara_willowshade', 1)).
quest_objective(herb_witch_wisdom, 2, objective('Gather five different herbs from the forest edge.')).
quest_objective(herb_witch_wisdom, 3, objective('Learn to brew a basic remedy from Elara.')).
quest_reward(herb_witch_wisdom, experience, 200).
quest_reward(herb_witch_wisdom, gold, 70).
quest_reward(herb_witch_wisdom, item, herbal_remedy).
quest_available(Player, herb_witch_wisdom) :-
    quest(herb_witch_wisdom, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Advanced Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Dragon of Silverdeep
quest(dragon_of_silverdeep, 'Dragon of Silverdeep', combat, advanced, active).
quest_assigned_to(dragon_of_silverdeep, '{{player}}').
quest_tag(dragon_of_silverdeep, generated).
quest_objective(dragon_of_silverdeep, 0, objective('Speak with Durek Stonehammer about the dragon in the abandoned shaft.')).
quest_objective(dragon_of_silverdeep, 1, talk_to('durek_stonehammer', 1)).
quest_objective(dragon_of_silverdeep, 2, objective('Acquire a fireproof shield from The Great Forge.')).
quest_objective(dragon_of_silverdeep, 3, objective('Enter the dragon cave and either slay or negotiate with the beast.')).
quest_reward(dragon_of_silverdeep, experience, 500).
quest_reward(dragon_of_silverdeep, gold, 300).
quest_reward(dragon_of_silverdeep, item, dragon_scale).
quest_available(Player, dragon_of_silverdeep) :-
    quest(dragon_of_silverdeep, _, _, _, active).

%% Quest: The Wizard Tower Mystery
quest(wizard_tower_mystery, 'The Wizard Tower Mystery', mystery, advanced, active).
quest_assigned_to(wizard_tower_mystery, '{{player}}').
quest_tag(wizard_tower_mystery, generated).
quest_objective(wizard_tower_mystery, 0, talk_to('thalendros', 1)).
quest_objective(wizard_tower_mystery, 1, objective('Investigate the strange magical disturbances emanating from the tower.')).
quest_objective(wizard_tower_mystery, 2, objective('Decode the ancient spell tome found in the hidden chamber.')).
quest_objective(wizard_tower_mystery, 3, objective('Seal the rift between realms before the shadow creatures pour through.')).
quest_reward(wizard_tower_mystery, experience, 450).
quest_reward(wizard_tower_mystery, gold, 250).
quest_reward(wizard_tower_mystery, item, spell_tome_warding).
quest_available(Player, wizard_tower_mystery) :-
    quest(wizard_tower_mystery, _, _, _, active).

%% Quest: The Traitor in Court
quest(traitor_in_court, 'The Traitor in Court', intrigue, advanced, active).
quest_assigned_to(traitor_in_court, '{{player}}').
quest_tag(traitor_in_court, generated).
quest_objective(traitor_in_court, 0, talk_to('maren_valdris', 1)).
quest_objective(traitor_in_court, 1, objective('Investigate suspicious activities among the court advisors.')).
quest_objective(traitor_in_court, 2, objective('Gather evidence by searching three noble residences.')).
quest_objective(traitor_in_court, 3, objective('Present the evidence to King Aldric and unmask the traitor.')).
quest_reward(traitor_in_court, experience, 500).
quest_reward(traitor_in_court, gold, 350).
quest_available(Player, traitor_in_court) :-
    quest(traitor_in_court, _, _, _, active).

%% Quest: The Siege of Thornhaven
quest(siege_of_thornhaven, 'The Siege of Thornhaven', combat, advanced, active).
quest_assigned_to(siege_of_thornhaven, '{{player}}').
quest_tag(siege_of_thornhaven, generated).
quest_objective(siege_of_thornhaven, 0, objective('Rally the defenders of Thornhaven when the orc warband approaches.')).
quest_objective(siege_of_thornhaven, 1, talk_to('fenwick_bramble', 1)).
quest_objective(siege_of_thornhaven, 2, objective('Set traps along the forest road using supplies from the village.')).
quest_objective(siege_of_thornhaven, 3, objective('Lead the villagers to repel the orc siege.')).
quest_objective(siege_of_thornhaven, 4, objective('Secure the village and tend to the wounded.')).
quest_reward(siege_of_thornhaven, experience, 600).
quest_reward(siege_of_thornhaven, gold, 400).
quest_available(Player, siege_of_thornhaven) :-
    quest(siege_of_thornhaven, _, _, _, active).
