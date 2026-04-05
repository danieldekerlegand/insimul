%% Insimul Actions: Dieselpunk
%% Source: data/worlds/dieselpunk/actions.pl
%% Created: 2026-04-03
%% Total: 12 actions
%%
%% Dieselpunk-themed actions for a 1930s-40s wartime industrial setting.
%% Covers factory work, airship operations, resistance activities, and social intrigue.

%% ═══════════════════════════════════════════════════════════
%% Factory and Industrial Actions
%% ═══════════════════════════════════════════════════════════

%% operate_diesel_press
% Action: operate_diesel_press
% Run a heavy diesel-powered stamping press on the factory floor
% Type: work / industrial
action(operate_diesel_press, 'operate_diesel_press', work, 10).
action_difficulty(operate_diesel_press, 0.4).
action_duration(operate_diesel_press, 3).
action_category(operate_diesel_press, industrial).
action_verb(operate_diesel_press, past, 'operated the diesel press').
action_verb(operate_diesel_press, present, 'operates the diesel press').
action_target_type(operate_diesel_press, none).
action_prerequisite(operate_diesel_press, (status(Actor, apprentice_mechanic) ; status(Actor, master_mechanic))).
action_effect(operate_diesel_press, (assert(status(Actor, working)))).
can_perform(Actor, operate_diesel_press, _) :-
    status(Actor, apprentice_mechanic) ; status(Actor, master_mechanic).

%% sabotage_machinery
% Action: sabotage_machinery
% Covertly damage factory equipment to slow war production
% Type: stealth / resistance
action(sabotage_machinery, 'sabotage_machinery', stealth, 15).
action_difficulty(sabotage_machinery, 0.7).
action_duration(sabotage_machinery, 2).
action_category(sabotage_machinery, resistance).
action_verb(sabotage_machinery, past, 'sabotaged machinery').
action_verb(sabotage_machinery, present, 'sabotages machinery').
action_target_type(sabotage_machinery, none).
action_prerequisite(sabotage_machinery, (status(Actor, union_sympathizer) ; status(Actor, resistance_leader))).
action_effect(sabotage_machinery, (assert(status(Actor, suspected_saboteur)))).
can_perform(Actor, sabotage_machinery, _) :-
    status(Actor, union_sympathizer) ; status(Actor, resistance_leader).

%% ═══════════════════════════════════════════════════════════
%% Airship and Aviation Actions
%% ═══════════════════════════════════════════════════════════

%% pilot_airship
% Action: pilot_airship
% Fly a diesel-powered airship through contested skies
% Type: exploration / aviation
action(pilot_airship, 'pilot_airship', exploration, 20).
action_difficulty(pilot_airship, 0.6).
action_duration(pilot_airship, 5).
action_category(pilot_airship, aviation).
action_verb(pilot_airship, past, 'piloted the airship').
action_verb(pilot_airship, present, 'pilots the airship').
action_target_type(pilot_airship, none).
action_prerequisite(pilot_airship, (status(Actor, pilot) ; status(Actor, freelance_pilot))).
action_effect(pilot_airship, (assert(status(Actor, airborne)))).
can_perform(Actor, pilot_airship, _) :-
    status(Actor, pilot) ; status(Actor, freelance_pilot).

%% navigate_airship
% Action: navigate_airship
% Plot a course for an airship, avoiding restricted airspace
% Type: exploration / aviation
action(navigate_airship, 'navigate_airship', exploration, 15).
action_difficulty(navigate_airship, 0.5).
action_duration(navigate_airship, 2).
action_category(navigate_airship, aviation).
action_verb(navigate_airship, past, 'navigated the airship').
action_verb(navigate_airship, present, 'navigates the airship').
action_target_type(navigate_airship, none).
action_prerequisite(navigate_airship, (status(Actor, aspiring_navigator) ; status(Actor, pilot))).
action_effect(navigate_airship, (assert(status(Actor, navigating)))).
can_perform(Actor, navigate_airship, _) :-
    status(Actor, aspiring_navigator) ; status(Actor, pilot).

%% ═══════════════════════════════════════════════════════════
%% Resistance and Underground Actions
%% ═══════════════════════════════════════════════════════════

%% distribute_leaflets
% Action: distribute_leaflets
% Spread resistance propaganda through the factory districts
% Type: stealth / resistance
action(distribute_leaflets, 'distribute_leaflets', stealth, 10).
action_difficulty(distribute_leaflets, 0.5).
action_duration(distribute_leaflets, 2).
action_category(distribute_leaflets, resistance).
action_verb(distribute_leaflets, past, 'distributed leaflets').
action_verb(distribute_leaflets, present, 'distributes leaflets').
action_target_type(distribute_leaflets, none).
action_prerequisite(distribute_leaflets, (status(Actor, propagandist) ; status(Actor, courier))).
action_effect(distribute_leaflets, (assert(status(Actor, distributing_propaganda)))).
can_perform(Actor, distribute_leaflets, _) :-
    status(Actor, propagandist) ; status(Actor, courier).

%% smuggle_contraband
% Action: smuggle_contraband
% Move banned goods past military checkpoints
% Type: stealth / smuggling
action(smuggle_contraband, 'smuggle_contraband', stealth, 20).
action_difficulty(smuggle_contraband, 0.8).
action_duration(smuggle_contraband, 4).
action_category(smuggle_contraband, smuggling).
action_verb(smuggle_contraband, past, 'smuggled contraband').
action_verb(smuggle_contraband, present, 'smuggles contraband').
action_target_type(smuggle_contraband, none).
action_prerequisite(smuggle_contraband, (status(Actor, smuggler_captain) ; status(Actor, resistance_contact))).
action_effect(smuggle_contraband, (assert(status(Actor, smuggling)))).
can_perform(Actor, smuggle_contraband, _) :-
    status(Actor, smuggler_captain) ; status(Actor, resistance_contact).

%% pass_coded_message
% Action: pass_coded_message
% Deliver an encrypted message to a resistance contact
% Type: social / espionage
action(pass_coded_message, 'pass_coded_message', social, 5).
action_difficulty(pass_coded_message, 0.4).
action_duration(pass_coded_message, 1).
action_category(pass_coded_message, espionage).
action_verb(pass_coded_message, past, 'passed a coded message to').
action_verb(pass_coded_message, present, 'passes a coded message to').
action_target_type(pass_coded_message, other).
action_requires_target(pass_coded_message).
action_range(pass_coded_message, 3).
action_prerequisite(pass_coded_message, (near(Actor, Target, 3))).
action_effect(pass_coded_message, (assert(received_intel(Target)))).
can_perform(Actor, pass_coded_message, Target) :-
    near(Actor, Target, 3),
    (status(Actor, courier) ; status(Actor, resistance_contact)).

%% ═══════════════════════════════════════════════════════════
%% Military and Authority Actions
%% ═══════════════════════════════════════════════════════════

%% inspect_papers
% Action: inspect_papers
% Demand identification documents from a civilian
% Type: social / military
action(inspect_papers, 'inspect_papers', social, 0).
action_difficulty(inspect_papers, 0.2).
action_duration(inspect_papers, 1).
action_category(inspect_papers, military).
action_verb(inspect_papers, past, 'inspected papers of').
action_verb(inspect_papers, present, 'inspects papers of').
action_target_type(inspect_papers, other).
action_requires_target(inspect_papers).
action_range(inspect_papers, 5).
action_prerequisite(inspect_papers, (near(Actor, Target, 5))).
action_effect(inspect_papers, (assert(inspected(Target)))).
can_perform(Actor, inspect_papers, Target) :-
    near(Actor, Target, 5),
    (status(Actor, military_governor) ; status(Actor, junior_officer)).

%% issue_curfew_order
% Action: issue_curfew_order
% Declare a district-wide curfew restricting civilian movement
% Type: social / military
action(issue_curfew_order, 'issue_curfew_order', social, 0).
action_difficulty(issue_curfew_order, 0.3).
action_duration(issue_curfew_order, 1).
action_category(issue_curfew_order, military).
action_verb(issue_curfew_order, past, 'issued a curfew order').
action_verb(issue_curfew_order, present, 'issues a curfew order').
action_target_type(issue_curfew_order, none).
action_prerequisite(issue_curfew_order, (status(Actor, military_governor))).
action_effect(issue_curfew_order, (assert(status(Actor, enforcing_curfew)))).
can_perform(Actor, issue_curfew_order, _) :-
    status(Actor, military_governor).

%% ═══════════════════════════════════════════════════════════
%% Social and Civilian Actions
%% ═══════════════════════════════════════════════════════════

%% trade_rations
% Action: trade_rations
% Barter scarce ration coupons with another person
% Type: social / trade
action(trade_rations, 'trade_rations', social, 5).
action_difficulty(trade_rations, 0.3).
action_duration(trade_rations, 1).
action_category(trade_rations, trade).
action_verb(trade_rations, past, 'traded rations with').
action_verb(trade_rations, present, 'trades rations with').
action_target_type(trade_rations, other).
action_requires_target(trade_rations).
action_range(trade_rations, 5).
action_prerequisite(trade_rations, (near(Actor, Target, 5))).
action_effect(trade_rations, (assert(traded_with(Actor, Target)))).
can_perform(Actor, trade_rations, Target) :-
    near(Actor, Target, 5).

%% eavesdrop_at_tavern
% Action: eavesdrop_at_tavern
% Listen in on conversations at a tavern or speakeasy
% Type: stealth / espionage
action(eavesdrop_at_tavern, 'eavesdrop_at_tavern', stealth, 5).
action_difficulty(eavesdrop_at_tavern, 0.3).
action_duration(eavesdrop_at_tavern, 2).
action_category(eavesdrop_at_tavern, espionage).
action_verb(eavesdrop_at_tavern, past, 'eavesdropped at the tavern').
action_verb(eavesdrop_at_tavern, present, 'eavesdrops at the tavern').
action_target_type(eavesdrop_at_tavern, none).
action_prerequisite(eavesdrop_at_tavern, (status(Actor, tavern_keeper) ; true)).
action_effect(eavesdrop_at_tavern, (assert(status(Actor, informed)))).
can_perform(Actor, eavesdrop_at_tavern, _) :-
    true.

%% forge_documents
% Action: forge_documents
% Create false identification papers or travel permits
% Type: stealth / espionage
action(forge_documents, 'forge_documents', stealth, 15).
action_difficulty(forge_documents, 0.7).
action_duration(forge_documents, 3).
action_category(forge_documents, espionage).
action_verb(forge_documents, past, 'forged documents').
action_verb(forge_documents, present, 'forges documents').
action_target_type(forge_documents, none).
action_prerequisite(forge_documents, (attribute(Actor, cunningness, C), C > 60)).
action_effect(forge_documents, (assert(has_forged_papers(Actor)))).
can_perform(Actor, forge_documents, _) :-
    attribute(Actor, cunningness, C), C > 60.
