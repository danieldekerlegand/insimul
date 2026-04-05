%% Insimul Quests: Generic Fantasy World
%% Source: data/worlds/generic/quests.pl
%% Created: 2026-04-03
%% Total: 12 quests

%% ═══════════════════════════════════════════════════════════
%% Beginner Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Welcome to Stonehaven
quest(welcome_stonehaven, 'Welcome to Stonehaven', exploration, beginner, active).
quest_assigned_to(welcome_stonehaven, '{{player}}').
quest_tag(welcome_stonehaven, generated).
quest_objective(welcome_stonehaven, 0, objective('Arrive in Stonehaven and find the Golden Flagon tavern.')).
quest_objective(welcome_stonehaven, 1, talk_to('bram_thorne', 1)).
quest_objective(welcome_stonehaven, 2, objective('Learn the layout of the Market District.')).
quest_reward(welcome_stonehaven, experience, 100).
quest_reward(welcome_stonehaven, gold, 50).
quest_available(Player, welcome_stonehaven) :-
    quest(welcome_stonehaven, _, _, _, active).

%% Quest: The Smith Needs Iron
quest(smith_needs_iron, 'The Smith Needs Iron', fetch, beginner, active).
quest_assigned_to(smith_needs_iron, '{{player}}').
quest_tag(smith_needs_iron, generated).
quest_objective(smith_needs_iron, 0, talk_to('gareth_aldric', 1)).
quest_objective(smith_needs_iron, 1, objective('Gather iron ore from the hillside north of town.')).
quest_objective(smith_needs_iron, 2, objective('Deliver the ore to Ironhand Forge.')).
quest_reward(smith_needs_iron, experience, 120).
quest_reward(smith_needs_iron, gold, 75).
quest_reward(smith_needs_iron, item, iron_sword).
quest_available(Player, smith_needs_iron) :-
    quest(smith_needs_iron, _, _, _, active).

%% Quest: Bread and Rumors
quest(bread_and_rumors, 'Bread and Rumors', conversation, beginner, active).
quest_assigned_to(bread_and_rumors, '{{player}}').
quest_tag(bread_and_rumors, generated).
quest_objective(bread_and_rumors, 0, objective('Buy bread from Hearthstone Bakery.')).
quest_objective(bread_and_rumors, 1, talk_to('wren_thorne', 1)).
quest_objective(bread_and_rumors, 2, objective('Ask three townsfolk about recent events.')).
quest_reward(bread_and_rumors, experience, 100).
quest_reward(bread_and_rumors, gold, 40).
quest_available(Player, bread_and_rumors) :-
    quest(bread_and_rumors, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Intermediate Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Missing Livestock
quest(missing_livestock, 'Missing Livestock', investigation, intermediate, active).
quest_assigned_to(missing_livestock, '{{player}}').
quest_tag(missing_livestock, generated).
quest_objective(missing_livestock, 0, talk_to('hale_ashwood', 1)).
quest_objective(missing_livestock, 1, objective('Track the missing sheep into the forest.')).
quest_objective(missing_livestock, 2, objective('Discover what has been taking the livestock.')).
quest_objective(missing_livestock, 3, objective('Report your findings to Hale Ashwood.')).
quest_reward(missing_livestock, experience, 250).
quest_reward(missing_livestock, gold, 120).
quest_available(Player, missing_livestock) :-
    quest(missing_livestock, _, _, _, active).

%% Quest: The Merchant Rivalry
quest(merchant_rivalry, 'The Merchant Rivalry', conversation, intermediate, active).
quest_assigned_to(merchant_rivalry, '{{player}}').
quest_tag(merchant_rivalry, generated).
quest_objective(merchant_rivalry, 0, talk_to('cedric_voss', 1)).
quest_objective(merchant_rivalry, 1, objective('Investigate the rumor about price fixing at the market.')).
quest_objective(merchant_rivalry, 2, talk_to('bram_thorne', 1)).
quest_objective(merchant_rivalry, 3, objective('Decide whose side to support or find a compromise.')).
quest_reward(merchant_rivalry, experience, 280).
quest_reward(merchant_rivalry, gold, 150).
quest_available(Player, merchant_rivalry) :-
    quest(merchant_rivalry, _, _, _, active).

%% Quest: Herbs for Elara
quest(herbs_for_elara, 'Herbs for Elara', fetch, intermediate, active).
quest_assigned_to(herbs_for_elara, '{{player}}').
quest_tag(herbs_for_elara, generated).
quest_objective(herbs_for_elara, 0, talk_to('elara_aldric', 1)).
quest_objective(herbs_for_elara, 1, objective('Collect moonpetal flowers from the forest edge at dusk.')).
quest_objective(herbs_for_elara, 2, objective('Find wild sage growing near the river.')).
quest_objective(herbs_for_elara, 3, objective('Return the herbs to Sage Elara Apothecary.')).
quest_reward(herbs_for_elara, experience, 200).
quest_reward(herbs_for_elara, gold, 80).
quest_reward(herbs_for_elara, item, healing_potion).
quest_available(Player, herbs_for_elara) :-
    quest(herbs_for_elara, _, _, _, active).

%% Quest: Guard Duty
quest(guard_duty, 'Guard Duty', combat, intermediate, active).
quest_assigned_to(guard_duty, '{{player}}').
quest_tag(guard_duty, generated).
quest_objective(guard_duty, 0, talk_to('renna_marsh', 1)).
quest_objective(guard_duty, 1, objective('Patrol the town wall from Old Gate to the Bell Tower.')).
quest_objective(guard_duty, 2, objective('Deal with the suspicious figures spotted near the gate.')).
quest_reward(guard_duty, experience, 300).
quest_reward(guard_duty, gold, 100).
quest_available(Player, guard_duty) :-
    quest(guard_duty, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Advanced Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: The Old Mine
quest(the_old_mine, 'The Old Mine', exploration, advanced, active).
quest_assigned_to(the_old_mine, '{{player}}').
quest_tag(the_old_mine, generated).
quest_objective(the_old_mine, 0, objective('Find the entrance to the abandoned mine in the hills.')).
quest_objective(the_old_mine, 1, objective('Navigate the collapsed tunnels to the lower level.')).
quest_objective(the_old_mine, 2, objective('Discover why the miners abandoned the shaft decades ago.')).
quest_objective(the_old_mine, 3, objective('Return with proof of what lurks below.')).
quest_reward(the_old_mine, experience, 450).
quest_reward(the_old_mine, gold, 200).
quest_reward(the_old_mine, item, enchanted_amulet).
quest_available(Player, the_old_mine) :-
    quest(the_old_mine, _, _, _, active).

%% Quest: The Temple Secret
quest(temple_secret, 'The Temple Secret', investigation, advanced, active).
quest_assigned_to(temple_secret, '{{player}}').
quest_tag(temple_secret, generated).
quest_objective(temple_secret, 0, talk_to('brother_aldwin', 1)).
quest_objective(temple_secret, 1, objective('Research the temple archives for mentions of the sealed crypt.')).
quest_objective(temple_secret, 2, objective('Find the three hidden symbols scattered through the Temple District.')).
quest_objective(temple_secret, 3, objective('Unseal the crypt and confront what waits within.')).
quest_reward(temple_secret, experience, 500).
quest_reward(temple_secret, gold, 250).
quest_available(Player, temple_secret) :-
    quest(temple_secret, _, _, _, active).

%% Quest: A Bards Tale
quest(a_bards_tale, 'A Bards Tale', conversation, advanced, active).
quest_assigned_to(a_bards_tale, '{{player}}').
quest_tag(a_bards_tale, generated).
quest_objective(a_bards_tale, 0, talk_to('sera_thorne', 1)).
quest_objective(a_bards_tale, 1, objective('Help Sera collect three local legends from townsfolk.')).
quest_objective(a_bards_tale, 2, objective('Travel to Willowmere to hear the oldest version of the founding tale.')).
quest_objective(a_bards_tale, 3, talk_to('hale_ashwood', 1)).
quest_objective(a_bards_tale, 4, objective('Perform the completed ballad at the Golden Flagon.')).
quest_reward(a_bards_tale, experience, 400).
quest_reward(a_bards_tale, gold, 180).
quest_available(Player, a_bards_tale) :-
    quest(a_bards_tale, _, _, _, active).

%% Quest: Wolves at the Door
quest(wolves_at_the_door, 'Wolves at the Door', combat, advanced, active).
quest_assigned_to(wolves_at_the_door, '{{player}}').
quest_tag(wolves_at_the_door, generated).
quest_objective(wolves_at_the_door, 0, talk_to('renna_marsh', 1)).
quest_objective(wolves_at_the_door, 1, objective('Track the wolf pack that has been raiding Willowmere livestock.')).
quest_objective(wolves_at_the_door, 2, objective('Discover the dire wolf leading the pack.')).
quest_objective(wolves_at_the_door, 3, objective('Drive the pack away from settled lands or find another solution.')).
quest_reward(wolves_at_the_door, experience, 500).
quest_reward(wolves_at_the_door, gold, 200).
quest_available(Player, wolves_at_the_door) :-
    quest(wolves_at_the_door, _, _, _, active).

%% Quest: The Voss Ledger
quest(the_voss_ledger, 'The Voss Ledger', investigation, advanced, active).
quest_assigned_to(the_voss_ledger, '{{player}}').
quest_tag(the_voss_ledger, generated).
quest_objective(the_voss_ledger, 0, talk_to('finn_thorne', 1)).
quest_objective(the_voss_ledger, 1, objective('Sneak into the Voss warehouse and find the hidden ledger.')).
quest_objective(the_voss_ledger, 2, objective('Decipher the coded entries in the ledger.')).
quest_objective(the_voss_ledger, 3, objective('Decide whether to expose the Voss family or use the leverage.')).
quest_reward(the_voss_ledger, experience, 450).
quest_reward(the_voss_ledger, gold, 300).
quest_available(Player, the_voss_ledger) :-
    quest(the_voss_ledger, _, _, _, active).
