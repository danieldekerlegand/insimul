%% Insimul Quests: Kingdom of Camelot
%% Source: data/worlds/kingdom_of_camelot/quests.pl
%% Created: 2026-04-03
%% Total: 12 quests

%% ═══════════════════════════════════════════════════════════
%% Main Story Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: The Search for the Holy Grail
quest(search_holy_grail, 'The Search for the Holy Grail', exploration, advanced, active).
quest_assigned_to(search_holy_grail, '{{player}}').
quest_tag(search_holy_grail, main_story).
quest_objective(search_holy_grail, 0, talk_to(knight_lancelot, 1)).
quest_objective(search_holy_grail, 1, objective('Seek counsel from Merlin at his tower.')).
quest_objective(search_holy_grail, 2, talk_to(wizard_merlin, 1)).
quest_objective(search_holy_grail, 3, objective('Travel to the Lake of the Lady and petition for guidance.')).
quest_objective(search_holy_grail, 4, objective('Retrieve the Holy Grail from the Perilous Chapel.')).
quest_reward(search_holy_grail, experience, 1000).
quest_reward(search_holy_grail, item, holy_grail).
quest_available(Player, search_holy_grail) :-
    quest(search_holy_grail, _, _, _, active).

%% Quest: Prove Knightly Valor
quest(prove_knightly_valor, 'Prove Knightly Valor', combat, beginner, active).
quest_assigned_to(prove_knightly_valor, '{{player}}').
quest_tag(prove_knightly_valor, main_story).
quest_objective(prove_knightly_valor, 0, objective('Report to the Training Grounds.')).
quest_objective(prove_knightly_valor, 1, objective('Defeat three opponents in practice combat.')).
quest_objective(prove_knightly_valor, 2, objective('Win a joust at the tournament fields.')).
quest_objective(prove_knightly_valor, 3, talk_to(king_arthur, 1)).
quest_reward(prove_knightly_valor, experience, 300).
quest_reward(prove_knightly_valor, gold, 200).
quest_available(Player, prove_knightly_valor) :-
    quest(prove_knightly_valor, _, _, _, active).

%% Quest: The Round Table Oath
quest(round_table_oath, 'The Round Table Oath', conversation, intermediate, active).
quest_assigned_to(round_table_oath, '{{player}}').
quest_tag(round_table_oath, main_story).
quest_objective(round_table_oath, 0, talk_to(king_arthur, 1)).
quest_objective(round_table_oath, 1, objective('Attend the council at the Round Table Hall.')).
quest_objective(round_table_oath, 2, objective('Swear the oath of chivalry before Arthur and the knights.')).
quest_objective(round_table_oath, 3, objective('Receive a seat at the Round Table.')).
quest_reward(round_table_oath, experience, 500).
quest_reward(round_table_oath, reputation, 50).
quest_available(Player, round_table_oath) :-
    quest(round_table_oath, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Side Quests -- Magic and Mystery
%% ═══════════════════════════════════════════════════════════

%% Quest: Break the Enchantment
quest(break_the_enchantment, 'Break the Enchantment', exploration, intermediate, active).
quest_assigned_to(break_the_enchantment, '{{player}}').
quest_tag(break_the_enchantment, side_quest).
quest_objective(break_the_enchantment, 0, talk_to(wizard_merlin, 1)).
quest_objective(break_the_enchantment, 1, objective('Gather moonpetal flowers from the Dark Forest Edge.')).
quest_objective(break_the_enchantment, 2, objective('Bring them to the Scrying Pool for purification.')).
quest_objective(break_the_enchantment, 3, objective('Dispel the curse on the Standing Stones.')).
quest_reward(break_the_enchantment, experience, 400).
quest_reward(break_the_enchantment, item, enchanted_amulet).
quest_available(Player, break_the_enchantment) :-
    quest(break_the_enchantment, _, _, _, active).

%% Quest: Secrets of the Scrying Pool
quest(secrets_scrying_pool, 'Secrets of the Scrying Pool', exploration, advanced, active).
quest_assigned_to(secrets_scrying_pool, '{{player}}').
quest_tag(secrets_scrying_pool, side_quest).
quest_objective(secrets_scrying_pool, 0, talk_to(wizard_merlin, 1)).
quest_objective(secrets_scrying_pool, 1, objective('Find three crystal shards hidden in Camelot.')).
quest_objective(secrets_scrying_pool, 2, objective('Place the shards around the Scrying Pool at midnight.')).
quest_objective(secrets_scrying_pool, 3, objective('Witness the vision of the future.')).
quest_reward(secrets_scrying_pool, experience, 600).
quest_reward(secrets_scrying_pool, gold, 300).
quest_available(Player, secrets_scrying_pool) :-
    quest(secrets_scrying_pool, _, _, _, active).

%% Quest: The Lady of the Lake
quest(lady_of_the_lake, 'The Lady of the Lake', exploration, advanced, active).
quest_assigned_to(lady_of_the_lake, '{{player}}').
quest_tag(lady_of_the_lake, side_quest).
quest_objective(lady_of_the_lake, 0, objective('Travel to the Lake of the Lady alone at dawn.')).
quest_objective(lady_of_the_lake, 1, objective('Offer a tribute of silver at the water edge.')).
quest_objective(lady_of_the_lake, 2, objective('Receive the blessing of the Lady.')).
quest_reward(lady_of_the_lake, experience, 500).
quest_reward(lady_of_the_lake, item, lady_blessing_token).
quest_available(Player, lady_of_the_lake) :-
    quest(lady_of_the_lake, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Side Quests -- Tournament and Combat
%% ═══════════════════════════════════════════════════════════

%% Quest: The Grand Tournament
quest(grand_tournament, 'The Grand Tournament', combat, intermediate, active).
quest_assigned_to(grand_tournament, '{{player}}').
quest_tag(grand_tournament, side_quest).
quest_objective(grand_tournament, 0, objective('Register at the Jousting Fields.')).
quest_objective(grand_tournament, 1, objective('Win three jousting rounds.')).
quest_objective(grand_tournament, 2, objective('Defeat the champion knight in the final bout.')).
quest_objective(grand_tournament, 3, objective('Receive the tournament crown from Queen Guinevere.')).
quest_reward(grand_tournament, experience, 500).
quest_reward(grand_tournament, gold, 500).
quest_reward(grand_tournament, item, tournament_crown).
quest_available(Player, grand_tournament) :-
    quest(grand_tournament, _, _, _, active).

%% Quest: Challenge of the Perilous Bridge
quest(perilous_bridge_challenge, 'Challenge of the Perilous Bridge', combat, intermediate, active).
quest_assigned_to(perilous_bridge_challenge, '{{player}}').
quest_tag(perilous_bridge_challenge, side_quest).
quest_objective(perilous_bridge_challenge, 0, objective('Travel to the Perilous Bridge.')).
quest_objective(perilous_bridge_challenge, 1, objective('Defeat the guardian knight who blocks the crossing.')).
quest_objective(perilous_bridge_challenge, 2, objective('Cross the bridge to claim the hidden treasure.')).
quest_reward(perilous_bridge_challenge, experience, 350).
quest_reward(perilous_bridge_challenge, gold, 250).
quest_available(Player, perilous_bridge_challenge) :-
    quest(perilous_bridge_challenge, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Side Quests -- Court and Intrigue
%% ═══════════════════════════════════════════════════════════

%% Quest: The Queens Favor
quest(queens_favor, 'The Queens Favor', conversation, beginner, active).
quest_assigned_to(queens_favor, '{{player}}').
quest_tag(queens_favor, side_quest).
quest_objective(queens_favor, 0, talk_to(queen_guinevere, 1)).
quest_objective(queens_favor, 1, objective('Deliver a message to the Merchants Guild.')).
quest_objective(queens_favor, 2, objective('Return with silks for the royal court.')).
quest_objective(queens_favor, 3, talk_to(queen_guinevere, 1)).
quest_reward(queens_favor, experience, 200).
quest_reward(queens_favor, gold, 150).
quest_available(Player, queens_favor) :-
    quest(queens_favor, _, _, _, active).

%% Quest: Robins Dilemma
quest(robins_dilemma, 'Robins Dilemma', conversation, intermediate, active).
quest_assigned_to(robins_dilemma, '{{player}}').
quest_tag(robins_dilemma, side_quest).
quest_objective(robins_dilemma, 0, talk_to(outlaw_robin, 1)).
quest_objective(robins_dilemma, 1, objective('Smuggle supplies from the market to Sherwood.')).
quest_objective(robins_dilemma, 2, objective('Decide whether to report Robin to the king or keep his secret.')).
quest_reward(robins_dilemma, experience, 350).
quest_reward(robins_dilemma, gold, 100).
quest_available(Player, robins_dilemma) :-
    quest(robins_dilemma, _, _, _, active).

%% Quest: The Court Intrigue
quest(court_intrigue, 'The Court Intrigue', conversation, advanced, active).
quest_assigned_to(court_intrigue, '{{player}}').
quest_tag(court_intrigue, side_quest).
quest_objective(court_intrigue, 0, objective('Overhear a suspicious conversation in the tavern.')).
quest_objective(court_intrigue, 1, talk_to(knight_lancelot, 1)).
quest_objective(court_intrigue, 2, objective('Investigate the plot against the crown.')).
quest_objective(court_intrigue, 3, talk_to(king_arthur, 1)).
quest_reward(court_intrigue, experience, 600).
quest_reward(court_intrigue, reputation, 30).
quest_available(Player, court_intrigue) :-
    quest(court_intrigue, _, _, _, active).

%% Quest: Forge the Kings Blade
quest(forge_kings_blade, 'Forge the Kings Blade', crafting, intermediate, active).
quest_assigned_to(forge_kings_blade, '{{player}}').
quest_tag(forge_kings_blade, side_quest).
quest_objective(forge_kings_blade, 0, objective('Visit the Ironheart Smithy.')).
quest_objective(forge_kings_blade, 1, objective('Gather enchanted iron from the Standing Stones.')).
quest_objective(forge_kings_blade, 2, objective('Help the blacksmith forge a ceremonial blade.')).
quest_objective(forge_kings_blade, 3, talk_to(king_arthur, 1)).
quest_reward(forge_kings_blade, experience, 400).
quest_reward(forge_kings_blade, item, ceremonial_blade).
quest_available(Player, forge_kings_blade) :-
    quest(forge_kings_blade, _, _, _, active).
