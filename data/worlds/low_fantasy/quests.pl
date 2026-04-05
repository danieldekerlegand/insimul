%% Insimul Quests: Low Fantasy
%% Source: data/worlds/low_fantasy/quests.pl
%% Created: 2026-04-03
%% Total: 12 quests

%% =============================================
%% Survival Quests
%% =============================================

%% Quest: A Hot Meal and a Dry Bed
quest(hot_meal_dry_bed, 'A Hot Meal and a Dry Bed', survival, beginner, active).
quest_assigned_to(hot_meal_dry_bed, '{{player}}').
quest_tag(hot_meal_dry_bed, generated).
quest_objective(hot_meal_dry_bed, 0, objective('Arrive in Grimhallow with nothing but the clothes on your back.')).
quest_objective(hot_meal_dry_bed, 1, talk_to('marta_grieve', 1)).
quest_objective(hot_meal_dry_bed, 2, objective('Earn enough coin for a bed at the Hanged Crow.')).
quest_objective(hot_meal_dry_bed, 3, objective('Survive your first night without being robbed.')).
quest_reward(hot_meal_dry_bed, experience, 100).
quest_reward(hot_meal_dry_bed, gold, 30).
quest_available(Player, hot_meal_dry_bed) :-
    quest(hot_meal_dry_bed, _, _, _, active).

%% Quest: Winter Preparations
quest(winter_preparations, 'Winter Preparations', survival, intermediate, active).
quest_assigned_to(winter_preparations, '{{player}}').
quest_tag(winter_preparations, generated).
quest_objective(winter_preparations, 0, talk_to('tilda_harrow', 1)).
quest_objective(winter_preparations, 1, objective('Gather firewood from the frontier beyond Thornfield.')).
quest_objective(winter_preparations, 2, objective('Secure preserved food for the community.')).
quest_objective(winter_preparations, 3, objective('Defend the supply cart from bandits on the road.')).
quest_reward(winter_preparations, experience, 250).
quest_reward(winter_preparations, gold, 100).
quest_available(Player, winter_preparations) :-
    quest(winter_preparations, _, _, _, active).

%% =============================================
%% Crime and Intrigue Quests
%% =============================================

%% Quest: The Fence Job
quest(the_fence_job, 'The Fence Job', crime, beginner, active).
quest_assigned_to(the_fence_job, '{{player}}').
quest_tag(the_fence_job, generated).
quest_objective(the_fence_job, 0, talk_to('gregor_voss', 1)).
quest_objective(the_fence_job, 1, objective('Pick up a package from the docks at Saltmire.')).
quest_objective(the_fence_job, 2, objective('Deliver the goods to Gregor without being caught by the bailiff.')).
quest_objective(the_fence_job, 3, objective('Collect your payment and keep your mouth shut.')).
quest_reward(the_fence_job, experience, 150).
quest_reward(the_fence_job, gold, 80).
quest_available(Player, the_fence_job) :-
    quest(the_fence_job, _, _, _, active).

%% Quest: Blackthorns Offer
quest(blackthorns_offer, 'Blackthorns Offer', crime, intermediate, active).
quest_assigned_to(blackthorns_offer, '{{player}}').
quest_tag(blackthorns_offer, generated).
quest_objective(blackthorns_offer, 0, talk_to('roderick_blackthorn', 1)).
quest_objective(blackthorns_offer, 1, objective('Break into the Bailiff Court and steal tax records.')).
quest_objective(blackthorns_offer, 2, objective('Avoid the night watch patrolling Keep Road.')).
quest_objective(blackthorns_offer, 3, objective('Deliver the records to Blackthorn at the Rat Nest.')).
quest_reward(blackthorns_offer, experience, 300).
quest_reward(blackthorns_offer, gold, 150).
quest_available(Player, blackthorns_offer) :-
    quest(blackthorns_offer, _, _, _, active).

%% Quest: The Smuggler Run
quest(smuggler_run, 'The Smuggler Run', crime, intermediate, active).
quest_assigned_to(smuggler_run, '{{player}}').
quest_tag(smuggler_run, generated).
quest_objective(smuggler_run, 0, talk_to('silas_marsh', 1)).
quest_objective(smuggler_run, 1, objective('Load contraband salt at Wrecker Cove under cover of darkness.')).
quest_objective(smuggler_run, 2, objective('Navigate the coast road to Grimhallow without detection.')).
quest_objective(smuggler_run, 3, objective('Sell the salt through Aldric Copperton at a marked-up price.')).
quest_reward(smuggler_run, experience, 300).
quest_reward(smuggler_run, gold, 200).
quest_available(Player, smuggler_run) :-
    quest(smuggler_run, _, _, _, active).

%% Quest: Forged Papers
quest(forged_papers, 'Forged Papers', crime, beginner, active).
quest_assigned_to(forged_papers, '{{player}}').
quest_tag(forged_papers, generated).
quest_objective(forged_papers, 0, talk_to('nils_inkblot', 1)).
quest_objective(forged_papers, 1, objective('Acquire the correct ducal wax seal from Bailiff Wren office.')).
quest_objective(forged_papers, 2, objective('Deliver the seal to Nils at his workshop on Wrecker Lane.')).
quest_objective(forged_papers, 3, objective('Collect your forged trade permit.')).
quest_reward(forged_papers, experience, 150).
quest_reward(forged_papers, gold, 60).
quest_available(Player, forged_papers) :-
    quest(forged_papers, _, _, _, active).

%% =============================================
%% Combat and Mercenary Quests
%% =============================================

%% Quest: The Iron Thorn Tryout
quest(iron_thorn_tryout, 'The Iron Thorn Tryout', combat, beginner, active).
quest_assigned_to(iron_thorn_tryout, '{{player}}').
quest_tag(iron_thorn_tryout, generated).
quest_objective(iron_thorn_tryout, 0, talk_to('jorik_hale', 1)).
quest_objective(iron_thorn_tryout, 1, objective('Spar with three members of the Iron Thorn Company.')).
quest_objective(iron_thorn_tryout, 2, objective('Demonstrate competence with a melee weapon.')).
quest_objective(iron_thorn_tryout, 3, objective('Earn a place in the company or be sent away.')).
quest_reward(iron_thorn_tryout, experience, 200).
quest_reward(iron_thorn_tryout, gold, 50).
quest_available(Player, iron_thorn_tryout) :-
    quest(iron_thorn_tryout, _, _, _, active).

%% Quest: Bandit Hunt
quest(bandit_hunt, 'Bandit Hunt', combat, intermediate, active).
quest_assigned_to(bandit_hunt, '{{player}}').
quest_tag(bandit_hunt, generated).
quest_objective(bandit_hunt, 0, talk_to('jorik_hale', 1)).
quest_objective(bandit_hunt, 1, objective('Track the bandit camp in the frontier beyond Thornfield.')).
quest_objective(bandit_hunt, 2, objective('Assault the camp or negotiate with the bandit leader.')).
quest_objective(bandit_hunt, 3, objective('Recover the stolen goods and return them to the merchants.')).
quest_reward(bandit_hunt, experience, 350).
quest_reward(bandit_hunt, gold, 150).
quest_available(Player, bandit_hunt) :-
    quest(bandit_hunt, _, _, _, active).

%% =============================================
%% Mystery and Lore Quests
%% =============================================

%% Quest: The Hedge Witch Remedy
quest(hedge_witch_remedy, 'The Hedge Witch Remedy', mystery, beginner, active).
quest_assigned_to(hedge_witch_remedy, '{{player}}').
quest_tag(hedge_witch_remedy, generated).
quest_objective(hedge_witch_remedy, 0, talk_to('old_mag', 1)).
quest_objective(hedge_witch_remedy, 1, objective('Gather three rare herbs from the marshlands.')).
quest_objective(hedge_witch_remedy, 2, objective('Bring the herbs to Old Mag without the bailiff noticing.')).
quest_objective(hedge_witch_remedy, 3, objective('Receive a dubious healing potion as payment.')).
quest_reward(hedge_witch_remedy, experience, 100).
quest_reward(hedge_witch_remedy, gold, 20).
quest_available(Player, hedge_witch_remedy) :-
    quest(hedge_witch_remedy, _, _, _, active).

%% Quest: The Ashen Saint Mystery
quest(ashen_saint_mystery, 'The Ashen Saint Mystery', mystery, intermediate, active).
quest_assigned_to(ashen_saint_mystery, '{{player}}').
quest_tag(ashen_saint_mystery, generated).
quest_objective(ashen_saint_mystery, 0, talk_to('sister_ashara', 1)).
quest_objective(ashen_saint_mystery, 1, objective('Explore the sealed crypt beneath the Chapel of the Ashen Saint.')).
quest_objective(ashen_saint_mystery, 2, objective('Decipher the inscriptions on the saints tomb.')).
quest_objective(ashen_saint_mystery, 3, objective('Decide whether the saint was holy or a fraud.')).
quest_reward(ashen_saint_mystery, experience, 300).
quest_reward(ashen_saint_mystery, gold, 100).
quest_available(Player, ashen_saint_mystery) :-
    quest(ashen_saint_mystery, _, _, _, active).

%% Quest: The Nobles Secret
quest(nobles_secret, 'The Nobles Secret', mystery, advanced, active).
quest_assigned_to(nobles_secret, '{{player}}').
quest_tag(nobles_secret, generated).
quest_objective(nobles_secret, 0, talk_to('edric_vane', 1)).
quest_objective(nobles_secret, 1, objective('Discover that Lord Vane is a dispossessed noble in hiding.')).
quest_objective(nobles_secret, 2, objective('Help Vane forge documents to reclaim his title, or sell him out to the bailiff.')).
quest_objective(nobles_secret, 3, objective('Deal with the consequences of your choice.')).
quest_reward(nobles_secret, experience, 450).
quest_reward(nobles_secret, gold, 250).
quest_available(Player, nobles_secret) :-
    quest(nobles_secret, _, _, _, active).

%% Quest: Debt Collection
quest(debt_collection, 'Debt Collection', crime, advanced, active).
quest_assigned_to(debt_collection, '{{player}}').
quest_tag(debt_collection, generated).
quest_objective(debt_collection, 0, talk_to('roderick_blackthorn', 1)).
quest_objective(debt_collection, 1, objective('Collect Aldric Copperton outstanding debt by any means.')).
quest_objective(debt_collection, 2, talk_to('aldric_copperton', 1)).
quest_objective(debt_collection, 3, objective('Choose: help Aldric escape his debt or deliver him to Blackthorn.')).
quest_reward(debt_collection, experience, 400).
quest_reward(debt_collection, gold, 200).
quest_available(Player, debt_collection) :-
    quest(debt_collection, _, _, _, active).
