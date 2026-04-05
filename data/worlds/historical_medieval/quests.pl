%% Insimul Quests: Historical Medieval Europe
%% Source: data/worlds/historical_medieval/quests.pl
%% Created: 2026-04-03
%% Total: 12 quests

%% ═══════════════════════════════════════════════════════════
%% Beginner Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Pledge of Fealty
quest(pledge_of_fealty, 'Pledge of Fealty', conversation, beginner, active).
quest_assigned_to(pledge_of_fealty, '{{player}}').
quest_tag(pledge_of_fealty, generated).
quest_objective(pledge_of_fealty, 0, talk_to('godfrey_de_ashworth', 1)).
quest_objective(pledge_of_fealty, 1, objective('Kneel before Lord Godfrey and swear fealty.')).
quest_objective(pledge_of_fealty, 2, objective('Receive a parcel of land in the duchy.')).
quest_reward(pledge_of_fealty, experience, 100).
quest_reward(pledge_of_fealty, gold, 50).
quest_available(Player, pledge_of_fealty) :-
    quest(pledge_of_fealty, _, _, _, active).

%% Quest: Bread and Tithe
quest(bread_and_tithe, 'Bread and Tithe', exploration, beginner, active).
quest_assigned_to(bread_and_tithe, '{{player}}').
quest_tag(bread_and_tithe, generated).
quest_objective(bread_and_tithe, 0, objective('Visit Wulfric Bakehouse and buy a loaf of bread.')).
quest_objective(bread_and_tithe, 1, objective('Deliver a tithe of grain to St. Aldhelm Abbey.')).
quest_objective(bread_and_tithe, 2, talk_to('brother_anselm', 1)).
quest_reward(bread_and_tithe, experience, 100).
quest_reward(bread_and_tithe, gold, 40).
quest_available(Player, bread_and_tithe) :-
    quest(bread_and_tithe, _, _, _, active).

%% Quest: The Smiths Errand
quest(smiths_errand, 'The Smiths Errand', exploration, beginner, active).
quest_assigned_to(smiths_errand, '{{player}}').
quest_tag(smiths_errand, generated).
quest_objective(smiths_errand, 0, talk_to('wulfstan_godwin', 1)).
quest_objective(smiths_errand, 1, objective('Collect iron ore from the market.')).
quest_objective(smiths_errand, 2, objective('Return the ore to Godwin Forge.')).
quest_reward(smiths_errand, experience, 120).
quest_reward(smiths_errand, gold, 60).
quest_available(Player, smiths_errand) :-
    quest(smiths_errand, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Intermediate Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: The Grand Joust
quest(grand_joust, 'The Grand Joust', combat, intermediate, active).
quest_assigned_to(grand_joust, '{{player}}').
quest_tag(grand_joust, generated).
quest_objective(grand_joust, 0, objective('Obtain a jousting lance and shield from the armory.')).
quest_objective(grand_joust, 1, objective('Register for the tournament at the jousting field.')).
quest_objective(grand_joust, 2, talk_to('roland_de_ashworth', 1)).
quest_objective(grand_joust, 3, objective('Defeat two opponents in the joust.')).
quest_reward(grand_joust, experience, 300).
quest_reward(grand_joust, gold, 200).
quest_available(Player, grand_joust) :-
    quest(grand_joust, _, _, _, active).

%% Quest: Wool for the Crown
quest(wool_for_the_crown, 'Wool for the Crown', exploration, intermediate, active).
quest_assigned_to(wool_for_the_crown, '{{player}}').
quest_tag(wool_for_the_crown, generated).
quest_objective(wool_for_the_crown, 0, talk_to('hugh_aldric', 1)).
quest_objective(wool_for_the_crown, 1, objective('Purchase three bales of wool from Aldric Wool Trade.')).
quest_objective(wool_for_the_crown, 2, objective('Escort the wool shipment past bandits on the Kings Road.')).
quest_objective(wool_for_the_crown, 3, objective('Deliver the wool to the crown agent at Market Cross.')).
quest_reward(wool_for_the_crown, experience, 250).
quest_reward(wool_for_the_crown, gold, 150).
quest_available(Player, wool_for_the_crown) :-
    quest(wool_for_the_crown, _, _, _, active).

%% Quest: The Scribes Apprentice
quest(scribes_apprentice, 'The Scribes Apprentice', cultural_knowledge, intermediate, active).
quest_assigned_to(scribes_apprentice, '{{player}}').
quest_tag(scribes_apprentice, generated).
quest_objective(scribes_apprentice, 0, talk_to('brother_caedmon', 1)).
quest_objective(scribes_apprentice, 1, objective('Learn to prepare vellum and mix iron gall ink.')).
quest_objective(scribes_apprentice, 2, objective('Copy a page of Latin text in the scriptorium.')).
quest_objective(scribes_apprentice, 3, objective('Illuminate the capital letter with gold leaf.')).
quest_reward(scribes_apprentice, experience, 280).
quest_reward(scribes_apprentice, gold, 100).
quest_available(Player, scribes_apprentice) :-
    quest(scribes_apprentice, _, _, _, active).

%% Quest: Herbs of the Cloister
quest(herbs_of_cloister, 'Herbs of the Cloister', exploration, intermediate, active).
quest_assigned_to(herbs_of_cloister, '{{player}}').
quest_tag(herbs_of_cloister, generated).
quest_objective(herbs_of_cloister, 0, objective('Travel to Ravenhold Priory.')).
quest_objective(herbs_of_cloister, 1, talk_to('brother_dunstan', 1)).
quest_objective(herbs_of_cloister, 2, objective('Gather yarrow, comfrey, and chamomile from the herb garden.')).
quest_objective(herbs_of_cloister, 3, objective('Prepare a herbal poultice under Brother Dunstan guidance.')).
quest_reward(herbs_of_cloister, experience, 250).
quest_reward(herbs_of_cloister, gold, 80).
quest_available(Player, herbs_of_cloister) :-
    quest(herbs_of_cloister, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Advanced Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Trial by Combat
quest(trial_by_combat, 'Trial by Combat', combat, advanced, active).
quest_assigned_to(trial_by_combat, '{{player}}').
quest_tag(trial_by_combat, generated).
quest_objective(trial_by_combat, 0, objective('A serf from Dunmere is accused of poaching. Investigate the claim.')).
quest_objective(trial_by_combat, 1, talk_to('edric_miller', 1)).
quest_objective(trial_by_combat, 2, objective('Choose to champion the accused or the accuser.')).
quest_objective(trial_by_combat, 3, objective('Fight the trial by combat in the jousting field.')).
quest_reward(trial_by_combat, experience, 400).
quest_reward(trial_by_combat, gold, 250).
quest_available(Player, trial_by_combat) :-
    quest(trial_by_combat, _, _, _, active).

%% Quest: The Missing Relic
quest(missing_relic, 'The Missing Relic', exploration, advanced, active).
quest_assigned_to(missing_relic, '{{player}}').
quest_tag(missing_relic, generated).
quest_objective(missing_relic, 0, talk_to('prior_benedict', 1)).
quest_objective(missing_relic, 1, objective('Investigate the theft of a holy relic from Ravenhold Priory.')).
quest_objective(missing_relic, 2, objective('Question suspects in Ashworth Keep market.')).
quest_objective(missing_relic, 3, objective('Recover the relic and return it to Prior Benedict.')).
quest_reward(missing_relic, experience, 450).
quest_reward(missing_relic, gold, 300).
quest_available(Player, missing_relic) :-
    quest(missing_relic, _, _, _, active).

%% Quest: The Lords Justice
quest(lords_justice, 'The Lords Justice', conversation, advanced, active).
quest_assigned_to(lords_justice, '{{player}}').
quest_tag(lords_justice, generated).
quest_objective(lords_justice, 0, talk_to('godfrey_de_ashworth', 1)).
quest_objective(lords_justice, 1, objective('Preside over a dispute between Hugh Aldric and the tanner Edric.')).
quest_objective(lords_justice, 2, objective('Gather testimony from both parties.')).
quest_objective(lords_justice, 3, objective('Render a judgment that upholds feudal law.')).
quest_reward(lords_justice, experience, 500).
quest_reward(lords_justice, gold, 200).
quest_available(Player, lords_justice) :-
    quest(lords_justice, _, _, _, active).

%% Quest: Pilgrimage to Canterbury
quest(pilgrimage_canterbury, 'Pilgrimage to Canterbury', exploration, advanced, active).
quest_assigned_to(pilgrimage_canterbury, '{{player}}').
quest_tag(pilgrimage_canterbury, generated).
quest_objective(pilgrimage_canterbury, 0, talk_to('brother_anselm', 1)).
quest_objective(pilgrimage_canterbury, 1, objective('Prepare provisions for a long journey.')).
quest_objective(pilgrimage_canterbury, 2, objective('Travel the pilgrim road, surviving encounters with bandits and weather.')).
quest_objective(pilgrimage_canterbury, 3, objective('Arrive at Canterbury and receive a pilgrim badge.')).
quest_reward(pilgrimage_canterbury, experience, 500).
quest_reward(pilgrimage_canterbury, gold, 150).
quest_available(Player, pilgrimage_canterbury) :-
    quest(pilgrimage_canterbury, _, _, _, active).

%% Quest: Siege of Ravenhold
quest(siege_of_ravenhold, 'Siege of Ravenhold', combat, advanced, active).
quest_assigned_to(siege_of_ravenhold, '{{player}}').
quest_tag(siege_of_ravenhold, generated).
quest_objective(siege_of_ravenhold, 0, objective('A rival baron threatens Ravenhold Priory.')).
quest_objective(siege_of_ravenhold, 1, talk_to('roland_de_ashworth', 1)).
quest_objective(siege_of_ravenhold, 2, objective('Rally the garrison and fortify defenses.')).
quest_objective(siege_of_ravenhold, 3, objective('Lead the defense and repel the attackers.')).
quest_reward(siege_of_ravenhold, experience, 600).
quest_reward(siege_of_ravenhold, gold, 400).
quest_available(Player, siege_of_ravenhold) :-
    quest(siege_of_ravenhold, _, _, _, active).
