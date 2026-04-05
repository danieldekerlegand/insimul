%% Insimul Quests: Dieselpunk
%% Source: data/worlds/dieselpunk/quests.pl
%% Created: 2026-04-03
%% Total: 12 quests

%% ═══════════════════════════════════════════════════════════
%% Beginner Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Factory Orientation
quest(factory_orientation, 'Factory Orientation', exploration, beginner, active).
quest_assigned_to(factory_orientation, '{{player}}').
quest_tag(factory_orientation, generated).
quest_objective(factory_orientation, 0, objective('Report to Otto Gruber at Gruber Diesel Works on Piston Avenue.')).
quest_objective(factory_orientation, 1, talk_to('otto_gruber', 1)).
quest_objective(factory_orientation, 2, objective('Learn the names of five diesel engine components.')).
quest_reward(factory_orientation, experience, 100).
quest_reward(factory_orientation, gold, 50).
quest_available(Player, factory_orientation) :-
    quest(factory_orientation, _, _, _, active).

%% Quest: The Ration Line
quest(the_ration_line, 'The Ration Line', exploration, beginner, active).
quest_assigned_to(the_ration_line, '{{player}}').
quest_tag(the_ration_line, generated).
quest_objective(the_ration_line, 0, objective('Collect your ration booklet from the Company Store.')).
quest_objective(the_ration_line, 1, objective('Purchase bread and fuel rations using your coupons.')).
quest_objective(the_ration_line, 2, talk_to('dorothy_ashworth', 1)).
quest_reward(the_ration_line, experience, 100).
quest_reward(the_ration_line, gold, 40).
quest_available(Player, the_ration_line) :-
    quest(the_ration_line, _, _, _, active).

%% Quest: First Shift
quest(first_shift, 'First Shift', conversation, beginner, active).
quest_assigned_to(first_shift, '{{player}}').
quest_tag(first_shift, generated).
quest_objective(first_shift, 0, objective('Report to the Ironhaven Steelworks for your first shift.')).
quest_objective(first_shift, 1, talk_to('anna_gruber', 1)).
quest_objective(first_shift, 2, objective('Complete a basic assembly task on the factory floor.')).
quest_reward(first_shift, experience, 120).
quest_reward(first_shift, gold, 60).
quest_available(Player, first_shift) :-
    quest(first_shift, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Intermediate Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Smoke and Mirrors
quest(smoke_and_mirrors, 'Smoke and Mirrors', exploration, intermediate, active).
quest_assigned_to(smoke_and_mirrors, '{{player}}').
quest_tag(smoke_and_mirrors, generated).
quest_objective(smoke_and_mirrors, 0, objective('Find the entrance to The Black Propeller speakeasy in Soot Alley.')).
quest_objective(smoke_and_mirrors, 1, objective('Give the correct passphrase to gain entry.')).
quest_objective(smoke_and_mirrors, 2, talk_to('mara_chen', 1)).
quest_objective(smoke_and_mirrors, 3, objective('Purchase a drink and listen to the rumors.')).
quest_reward(smoke_and_mirrors, experience, 200).
quest_reward(smoke_and_mirrors, gold, 100).
quest_available(Player, smoke_and_mirrors) :-
    quest(smoke_and_mirrors, _, _, _, active).

%% Quest: Union Dues
quest(union_dues, 'Union Dues', conversation, intermediate, active).
quest_assigned_to(union_dues, '{{player}}').
quest_tag(union_dues, generated).
quest_objective(union_dues, 0, objective('Attend the secret union meeting at the Union Hall after dark.')).
quest_objective(union_dues, 1, talk_to('fritz_gruber', 1)).
quest_objective(union_dues, 2, objective('Decide whether to sign the union charter or report the meeting.')).
quest_reward(union_dues, experience, 250).
quest_reward(union_dues, gold, 80).
quest_available(Player, union_dues) :-
    quest(union_dues, _, _, _, active).

%% Quest: Sky Ferry
quest(sky_ferry, 'Sky Ferry', exploration, intermediate, active).
quest_assigned_to(sky_ferry, '{{player}}').
quest_tag(sky_ferry, generated).
quest_objective(sky_ferry, 0, objective('Book passage on an airship from Dock Alpha to Ashford Junction.')).
quest_objective(sky_ferry, 1, talk_to('hilde_gruber', 1)).
quest_objective(sky_ferry, 2, objective('Help the navigator plot a course avoiding restricted airspace.')).
quest_objective(sky_ferry, 3, objective('Arrive at Ashford Junction and report to the depot.')).
quest_reward(sky_ferry, experience, 250).
quest_reward(sky_ferry, gold, 120).
quest_available(Player, sky_ferry) :-
    quest(sky_ferry, _, _, _, active).

%% Quest: The Midnight Press
quest(the_midnight_press, 'The Midnight Press', conversation, intermediate, active).
quest_assigned_to(the_midnight_press, '{{player}}').
quest_tag(the_midnight_press, generated).
quest_objective(the_midnight_press, 0, objective('Visit Irina Volkov at the Midnight Press on Gaslight Row.')).
quest_objective(the_midnight_press, 1, talk_to('irina_volkov', 1)).
quest_objective(the_midnight_press, 2, objective('Help typeset a resistance leaflet without being caught.')).
quest_objective(the_midnight_press, 3, objective('Distribute three leaflets in Factory Row.')).
quest_reward(the_midnight_press, experience, 280).
quest_reward(the_midnight_press, gold, 100).
quest_available(Player, the_midnight_press) :-
    quest(the_midnight_press, _, _, _, active).

%% ═══════════════════════════════════════════════════════════
%% Advanced Quests
%% ═══════════════════════════════════════════════════════════

%% Quest: Enemy of the State
quest(enemy_of_the_state, 'Enemy of the State', conversation, advanced, active).
quest_assigned_to(enemy_of_the_state, '{{player}}').
quest_tag(enemy_of_the_state, generated).
quest_objective(enemy_of_the_state, 0, talk_to('dimitri_volkov', 1)).
quest_objective(enemy_of_the_state, 1, objective('Infiltrate the War Office on Brass Boulevard and photograph troop orders.')).
quest_objective(enemy_of_the_state, 2, objective('Escape Command Heights without being detained.')).
quest_objective(enemy_of_the_state, 3, objective('Deliver the intelligence to the resistance safe house.')).
quest_reward(enemy_of_the_state, experience, 450).
quest_reward(enemy_of_the_state, gold, 200).
quest_available(Player, enemy_of_the_state) :-
    quest(enemy_of_the_state, _, _, _, active).

%% Quest: The Iron Curtain
quest(the_iron_curtain, 'The Iron Curtain', exploration, advanced, active).
quest_assigned_to(the_iron_curtain, '{{player}}').
quest_tag(the_iron_curtain, generated).
quest_objective(the_iron_curtain, 0, objective('Obtain forged papers from Ratko Salvage and Trade.')).
quest_objective(the_iron_curtain, 1, talk_to('katya_volkov', 1)).
quest_objective(the_iron_curtain, 2, objective('Cross the checkpoint at Grimhollow using your cover identity.')).
quest_objective(the_iron_curtain, 3, objective('Make contact with the mining camp resistance cell.')).
quest_reward(the_iron_curtain, experience, 500).
quest_reward(the_iron_curtain, gold, 250).
quest_available(Player, the_iron_curtain) :-
    quest(the_iron_curtain, _, _, _, active).

%% Quest: Wings of Defiance
quest(wings_of_defiance, 'Wings of Defiance', exploration, advanced, active).
quest_assigned_to(wings_of_defiance, '{{player}}').
quest_tag(wings_of_defiance, generated).
quest_objective(wings_of_defiance, 0, talk_to('elsa_krause', 1)).
quest_objective(wings_of_defiance, 1, objective('Steal an airship from Dock Alpha under cover of night.')).
quest_objective(wings_of_defiance, 2, objective('Fly the airship through anti-aircraft patrols.')).
quest_objective(wings_of_defiance, 3, objective('Deliver medical supplies to Grimhollow miners.')).
quest_reward(wings_of_defiance, experience, 550).
quest_reward(wings_of_defiance, gold, 300).
quest_available(Player, wings_of_defiance) :-
    quest(wings_of_defiance, _, _, _, active).

%% Quest: The Profiteers Ledger
quest(the_profiteers_ledger, 'The Profiteers Ledger', conversation, advanced, active).
quest_assigned_to(the_profiteers_ledger, '{{player}}').
quest_tag(the_profiteers_ledger, generated).
quest_objective(the_profiteers_ledger, 0, objective('Gain access to Heinrich Krause through a social event at The Brass Eagle.')).
quest_objective(the_profiteers_ledger, 1, talk_to('margot_krause', 1)).
quest_objective(the_profiteers_ledger, 2, objective('Find the secret ledger showing illegal arms deals.')).
quest_objective(the_profiteers_ledger, 3, objective('Decide: expose Krause to the public or use the leverage for the resistance.')).
quest_reward(the_profiteers_ledger, experience, 600).
quest_reward(the_profiteers_ledger, gold, 350).
quest_available(Player, the_profiteers_ledger) :-
    quest(the_profiteers_ledger, _, _, _, active).

%% Quest: Armistice
quest(armistice, 'Armistice', conversation, advanced, active).
quest_assigned_to(armistice, '{{player}}').
quest_tag(armistice, generated).
quest_objective(armistice, 0, objective('Convince Colonel Stahl to negotiate a ceasefire.')).
quest_objective(armistice, 1, talk_to('viktor_stahl', 1)).
quest_objective(armistice, 2, objective('Present evidence of war crimes to neutral observers.')).
quest_objective(armistice, 3, objective('Broker a peace agreement between the factions.')).
quest_reward(armistice, experience, 700).
quest_reward(armistice, gold, 500).
quest_available(Player, armistice) :-
    quest(armistice, _, _, _, active).
