%% Insimul Quests: Horror World
%% Source: data/worlds/horror/quests.pl
%% Created: 2026-04-03
%% Total: 12 quests

%% ═══════════════════════════════════════════════════════════
%% Investigation Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: The Missing Townsfolk
quest(missing_townsfolk, 'The Missing Townsfolk', investigation, beginner, active).
quest_assigned_to(missing_townsfolk, '{{player}}').
quest_tag(missing_townsfolk, generated).
quest_objective(missing_townsfolk, 0, talk_to('ruth_hargrove', 1)).
quest_objective(missing_townsfolk, 1, objective('Learn about the three residents who vanished last month.')).
quest_objective(missing_townsfolk, 2, objective('Search the harbor ward for clues.')).
quest_objective(missing_townsfolk, 3, objective('Find the torn journal page in the dockside warehouse.')).
quest_reward(missing_townsfolk, experience, 200).
quest_reward(missing_townsfolk, gold, 100).
quest_available(Player, missing_townsfolk) :-
    quest(missing_townsfolk, _, _, _, active).

%% Quest: Whispers in the Walls
quest(whispers_in_walls, 'Whispers in the Walls', investigation, beginner, active).
quest_assigned_to(whispers_in_walls, '{{player}}').
quest_tag(whispers_in_walls, generated).
quest_objective(whispers_in_walls, 0, objective('Stay the night at Holloway Boarding House.')).
quest_objective(whispers_in_walls, 1, talk_to('edgar_holloway', 1)).
quest_objective(whispers_in_walls, 2, objective('Investigate the scratching sounds coming from the cellar.')).
quest_objective(whispers_in_walls, 3, objective('Discover the hidden room behind the basement wall.')).
quest_reward(whispers_in_walls, experience, 200).
quest_reward(whispers_in_walls, gold, 80).
quest_available(Player, whispers_in_walls) :-
    quest(whispers_in_walls, _, _, _, active).

%% Quest: The Asylum Records
quest(asylum_records, 'The Asylum Records', investigation, intermediate, active).
quest_assigned_to(asylum_records, '{{player}}').
quest_tag(asylum_records, generated).
quest_objective(asylum_records, 0, talk_to('miriam_voss', 1)).
quest_objective(asylum_records, 1, objective('Gain access to the abandoned asylum on Ridge Road.')).
quest_objective(asylum_records, 2, objective('Find the patient files from 1923.')).
quest_objective(asylum_records, 3, objective('Decode the cryptic notes left by Dr. Harlan Ashford.')).
quest_reward(asylum_records, experience, 350).
quest_reward(asylum_records, gold, 150).
quest_available(Player, asylum_records) :-
    quest(asylum_records, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Survival Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Night of the Fog
quest(night_of_fog, 'Night of the Fog', survival, beginner, active).
quest_assigned_to(night_of_fog, '{{player}}').
quest_tag(night_of_fog, generated).
quest_objective(night_of_fog, 0, objective('Survive until dawn when the fog rolls in.')).
quest_objective(night_of_fog, 1, objective('Find shelter before the fog reaches Main Street.')).
quest_objective(night_of_fog, 2, objective('Barricade the doors and windows of the boarding house.')).
quest_objective(night_of_fog, 3, objective('Do not open the door, no matter who knocks.')).
quest_reward(night_of_fog, experience, 250).
quest_reward(night_of_fog, gold, 100).
quest_available(Player, night_of_fog) :-
    quest(night_of_fog, _, _, _, active).

%% Quest: The Dark Forest
quest(dark_forest, 'The Dark Forest', survival, intermediate, active).
quest_assigned_to(dark_forest, '{{player}}').
quest_tag(dark_forest, generated).
quest_objective(dark_forest, 0, objective('Enter the forest beyond Ashford Mill.')).
quest_objective(dark_forest, 1, objective('Follow the trail markers without losing your way.')).
quest_objective(dark_forest, 2, objective('Avoid the things that move between the trees.')).
quest_objective(dark_forest, 3, objective('Reach the stone circle at the forest center.')).
quest_reward(dark_forest, experience, 400).
quest_reward(dark_forest, gold, 200).
quest_available(Player, dark_forest) :-
    quest(dark_forest, _, _, _, active).

%% Quest: Siege of the Church
quest(siege_of_church, 'Siege of the Church', survival, advanced, active).
quest_assigned_to(siege_of_church, '{{player}}').
quest_tag(siege_of_church, generated).
quest_objective(siege_of_church, 0, talk_to('ambrose_thorne', 1)).
quest_objective(siege_of_church, 1, objective('Gather survivors inside Ravenhollow Church.')).
quest_objective(siege_of_church, 2, objective('Defend the church through three waves of darkness.')).
quest_objective(siege_of_church, 3, objective('Keep the sacred flame burning until sunrise.')).
quest_reward(siege_of_church, experience, 500).
quest_reward(siege_of_church, gold, 250).
quest_available(Player, siege_of_church) :-
    quest(siege_of_church, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Cult Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: The Order of the Black Star
quest(order_black_star, 'The Order of the Black Star', cult, intermediate, active).
quest_assigned_to(order_black_star, '{{player}}').
quest_tag(order_black_star, generated).
quest_objective(order_black_star, 0, objective('Discover the cult symbol carved into the old well in Grimhaven.')).
quest_objective(order_black_star, 1, talk_to('agnes_wight', 1)).
quest_objective(order_black_star, 2, objective('Find three cult meeting locations across both settlements.')).
quest_objective(order_black_star, 3, objective('Identify the cult leader without being discovered.')).
quest_reward(order_black_star, experience, 400).
quest_reward(order_black_star, gold, 200).
quest_available(Player, order_black_star) :-
    quest(order_black_star, _, _, _, active).

%% Quest: The Blackwood Legacy
quest(blackwood_legacy, 'The Blackwood Legacy', cult, advanced, active).
quest_assigned_to(blackwood_legacy, '{{player}}').
quest_tag(blackwood_legacy, generated).
quest_objective(blackwood_legacy, 0, objective('Investigate Blackwood Manor on Ridge Road.')).
quest_objective(blackwood_legacy, 1, talk_to('isolde_blackwood', 1)).
quest_objective(blackwood_legacy, 2, objective('Find the family grimoire hidden in the manor library.')).
quest_objective(blackwood_legacy, 3, objective('Confront Silas Blackwood about the cult rituals.')).
quest_objective(blackwood_legacy, 4, objective('Decide whether to destroy or preserve the grimoire.')).
quest_reward(blackwood_legacy, experience, 600).
quest_reward(blackwood_legacy, gold, 300).
quest_available(Player, blackwood_legacy) :-
    quest(blackwood_legacy, _, _, _, active).

%% Quest: The Summoning
quest(the_summoning, 'The Summoning', cult, advanced, active).
quest_assigned_to(the_summoning, '{{player}}').
quest_tag(the_summoning, generated).
quest_objective(the_summoning, 0, objective('Discover the date of the next ritual at the stone circle.')).
quest_objective(the_summoning, 1, objective('Gather the three counter-ritual components.')).
quest_objective(the_summoning, 2, objective('Reach the ritual clearing before midnight.')).
quest_objective(the_summoning, 3, objective('Disrupt the summoning or face the entity.')).
quest_reward(the_summoning, experience, 800).
quest_reward(the_summoning, gold, 400).
quest_available(Player, the_summoning) :-
    quest(the_summoning, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Supernatural Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Voices from Below
quest(voices_from_below, 'Voices from Below', supernatural, intermediate, active).
quest_assigned_to(voices_from_below, '{{player}}').
quest_tag(voices_from_below, generated).
quest_objective(voices_from_below, 0, talk_to('ezekiel_crane', 1)).
quest_objective(voices_from_below, 1, objective('Visit the cemetery after dark.')).
quest_objective(voices_from_below, 2, objective('Follow the voices to the Blackwood Mausoleum.')).
quest_objective(voices_from_below, 3, objective('Discover what lies buried beneath the oldest tombstone.')).
quest_reward(voices_from_below, experience, 350).
quest_reward(voices_from_below, gold, 175).
quest_available(Player, voices_from_below) :-
    quest(voices_from_below, _, _, _, active).

%% Quest: The Lighthouse Keeper
quest(lighthouse_keeper, 'The Lighthouse Keeper', supernatural, intermediate, active).
quest_assigned_to(lighthouse_keeper, '{{player}}').
quest_tag(lighthouse_keeper, generated).
quest_objective(lighthouse_keeper, 0, objective('Investigate why the old lighthouse activates on its own at night.')).
quest_objective(lighthouse_keeper, 1, talk_to('caleb_marsh', 1)).
quest_objective(lighthouse_keeper, 2, objective('Climb to the top of the lighthouse.')).
quest_objective(lighthouse_keeper, 3, objective('Witness the spectral keeper and learn the truth of the 1923 shipwreck.')).
quest_reward(lighthouse_keeper, experience, 350).
quest_reward(lighthouse_keeper, gold, 175).
quest_available(Player, lighthouse_keeper) :-
    quest(lighthouse_keeper, _, _, _, active).

%% Quest: The Final Revelation
quest(final_revelation, 'The Final Revelation', supernatural, advanced, active).
quest_assigned_to(final_revelation, '{{player}}').
quest_tag(final_revelation, generated).
quest_objective(final_revelation, 0, objective('Piece together all the clues from previous investigations.')).
quest_objective(final_revelation, 1, objective('Enter the caverns beneath Grimhaven.')).
quest_objective(final_revelation, 2, objective('Confront the cosmic entity that sleeps beneath Blackwood County.')).
quest_objective(final_revelation, 3, objective('Choose: seal the entity forever or accept its dark gift.')).
quest_reward(final_revelation, experience, 1000).
quest_reward(final_revelation, gold, 500).
quest_available(Player, final_revelation) :-
    quest(final_revelation, _, _, _, active).
