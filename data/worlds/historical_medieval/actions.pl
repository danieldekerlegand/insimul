%% Insimul Actions: Historical Medieval Europe
%% Source: data/worlds/historical_medieval/actions.pl
%% Created: 2026-04-03
%% Total: 12 actions
%%
%% Predicate schema (base_actions format):
%%   action/4 -- action(AtomId, Name, Type, EnergyCost)
%%   action_difficulty/2, action_duration/2, action_category/2
%%   action_verb/3, action_target_type/2
%%   action_requires_target/1, action_range/2
%%   action_prerequisite/2, action_effect/2, can_perform/3

%% swear_fealty
%% Kneel before a lord and pledge loyalty in exchange for land and protection
action(swear_fealty, 'swear_fealty', social, 1).
action_difficulty(swear_fealty, 0.3).
action_duration(swear_fealty, 2).
action_category(swear_fealty, political).
action_verb(swear_fealty, past, 'swore fealty to').
action_verb(swear_fealty, present, 'swears fealty to').
action_target_type(swear_fealty, other).
action_requires_target(swear_fealty).
action_range(swear_fealty, 5).
action_prerequisite(swear_fealty, (near(Actor, Target, 5))).
action_effect(swear_fealty, (assert(vassal_of(Actor, Target)))).
can_perform(Actor, swear_fealty, Target) :-
    near(Actor, Target, 5).

%% attend_mass
%% Attend the Latin mass at the parish church or abbey
action(attend_mass, 'attend_mass', ritual, 1).
action_difficulty(attend_mass, 0.1).
action_duration(attend_mass, 2).
action_category(attend_mass, religious).
action_verb(attend_mass, past, 'attended mass').
action_verb(attend_mass, present, 'attends mass').
action_target_type(attend_mass, none).
action_range(attend_mass, 0).
action_prerequisite(attend_mass, (at_location(Actor, church))).
action_effect(attend_mass, (assert(piety_increased(Actor)))).
can_perform(Actor, attend_mass, _) :-
    at_location(Actor, church).

%% joust_in_tournament
%% Enter the lists and joust against a fellow knight for honor
action(joust_in_tournament, 'joust_in_tournament', combat, 4).
action_difficulty(joust_in_tournament, 0.7).
action_duration(joust_in_tournament, 3).
action_category(joust_in_tournament, combat).
action_verb(joust_in_tournament, past, 'jousted against').
action_verb(joust_in_tournament, present, 'jousts against').
action_target_type(joust_in_tournament, other).
action_requires_target(joust_in_tournament).
action_range(joust_in_tournament, 10).
action_prerequisite(joust_in_tournament, (near(Actor, Target, 10))).
action_effect(joust_in_tournament, (assert(jousted(Actor, Target)))).
can_perform(Actor, joust_in_tournament, Target) :-
    near(Actor, Target, 10).

%% trade_at_market
%% Buy or sell goods at the weekly market in the town square
action(trade_at_market, 'trade_at_market', economic, 2).
action_difficulty(trade_at_market, 0.3).
action_duration(trade_at_market, 3).
action_category(trade_at_market, commerce).
action_verb(trade_at_market, past, 'traded with').
action_verb(trade_at_market, present, 'trades with').
action_target_type(trade_at_market, other).
action_requires_target(trade_at_market).
action_range(trade_at_market, 5).
action_prerequisite(trade_at_market, (near(Actor, Target, 5))).
action_effect(trade_at_market, (assert(traded(Actor, Target)))).
can_perform(Actor, trade_at_market, Target) :-
    near(Actor, Target, 5).

%% forge_at_smithy
%% Work the bellows and anvil to shape iron at the smithy
action(forge_at_smithy, 'forge_at_smithy', craft, 3).
action_difficulty(forge_at_smithy, 0.5).
action_duration(forge_at_smithy, 4).
action_category(forge_at_smithy, craft).
action_verb(forge_at_smithy, past, 'forged iron').
action_verb(forge_at_smithy, present, 'forges iron').
action_target_type(forge_at_smithy, none).
action_range(forge_at_smithy, 0).
action_prerequisite(forge_at_smithy, (at_location(Actor, smithy))).
action_effect(forge_at_smithy, (assert(crafted(Actor, ironwork)))).
can_perform(Actor, forge_at_smithy, _) :-
    at_location(Actor, smithy).

%% copy_manuscript
%% Copy and illuminate a manuscript in the abbey scriptorium
action(copy_manuscript, 'copy_manuscript', knowledge, 2).
action_difficulty(copy_manuscript, 0.6).
action_duration(copy_manuscript, 5).
action_category(copy_manuscript, scholarship).
action_verb(copy_manuscript, past, 'copied a manuscript').
action_verb(copy_manuscript, present, 'copies a manuscript').
action_target_type(copy_manuscript, none).
action_range(copy_manuscript, 0).
action_prerequisite(copy_manuscript, (at_location(Actor, scriptorium))).
action_effect(copy_manuscript, (assert(copied(Actor, manuscript)))).
can_perform(Actor, copy_manuscript, _) :-
    at_location(Actor, scriptorium).

%% gather_herbs
%% Forage for medicinal herbs in the forest or monastery garden
action(gather_herbs, 'gather_herbs', craft, 2).
action_difficulty(gather_herbs, 0.3).
action_duration(gather_herbs, 3).
action_category(gather_herbs, crafting).
action_verb(gather_herbs, past, 'gathered herbs').
action_verb(gather_herbs, present, 'gathers herbs').
action_target_type(gather_herbs, none).
action_range(gather_herbs, 0).
action_prerequisite(gather_herbs, (at_location(Actor, garden))).
action_effect(gather_herbs, (assert(gathered(Actor, herbs)))).
can_perform(Actor, gather_herbs, _) :-
    at_location(Actor, garden).

%% petition_lord
%% Present a formal petition to the lord for judgment or favor
action(petition_lord, 'petition_lord', social, 1).
action_difficulty(petition_lord, 0.4).
action_duration(petition_lord, 2).
action_category(petition_lord, political).
action_verb(petition_lord, past, 'petitioned').
action_verb(petition_lord, present, 'petitions').
action_target_type(petition_lord, other).
action_requires_target(petition_lord).
action_range(petition_lord, 5).
action_prerequisite(petition_lord, (near(Actor, Target, 5))).
action_effect(petition_lord, (assert(petitioned(Actor, Target)))).
can_perform(Actor, petition_lord, Target) :-
    near(Actor, Target, 5).

%% brew_ale
%% Brew a batch of ale at the brewhouse or tavern
action(brew_ale, 'brew_ale', craft, 2).
action_difficulty(brew_ale, 0.3).
action_duration(brew_ale, 4).
action_category(brew_ale, craft).
action_verb(brew_ale, past, 'brewed ale').
action_verb(brew_ale, present, 'brews ale').
action_target_type(brew_ale, none).
action_range(brew_ale, 0).
action_prerequisite(brew_ale, (at_location(Actor, brewhouse))).
action_effect(brew_ale, (assert(brewed(Actor, ale)))).
can_perform(Actor, brew_ale, _) :-
    at_location(Actor, brewhouse).

%% confess_sins
%% Make a formal confession to a priest for absolution
action(confess_sins, 'confess_sins', ritual, 1).
action_difficulty(confess_sins, 0.2).
action_duration(confess_sins, 2).
action_category(confess_sins, religious).
action_verb(confess_sins, past, 'confessed to').
action_verb(confess_sins, present, 'confesses to').
action_target_type(confess_sins, other).
action_requires_target(confess_sins).
action_range(confess_sins, 3).
action_prerequisite(confess_sins, (near(Actor, Target, 3))).
action_effect(confess_sins, (assert(absolved(Actor)))).
can_perform(Actor, confess_sins, Target) :-
    near(Actor, Target, 3).

%% hunt_in_forest
%% Ride out with hounds to hunt deer or boar in the royal forest
action(hunt_in_forest, 'hunt_in_forest', physical, 3).
action_difficulty(hunt_in_forest, 0.5).
action_duration(hunt_in_forest, 4).
action_category(hunt_in_forest, physical).
action_verb(hunt_in_forest, past, 'hunted in the forest').
action_verb(hunt_in_forest, present, 'hunts in the forest').
action_target_type(hunt_in_forest, none).
action_range(hunt_in_forest, 0).
action_prerequisite(hunt_in_forest, (at_location(Actor, forest))).
action_effect(hunt_in_forest, (assert(hunted(Actor)))).
can_perform(Actor, hunt_in_forest, _) :-
    at_location(Actor, forest).

%% hold_court
%% Preside over the manor court to settle disputes and collect dues
action(hold_court, 'hold_court', social, 2).
action_difficulty(hold_court, 0.4).
action_duration(hold_court, 3).
action_category(hold_court, political).
action_verb(hold_court, past, 'held court').
action_verb(hold_court, present, 'holds court').
action_target_type(hold_court, none).
action_range(hold_court, 0).
action_prerequisite(hold_court, (at_location(Actor, great_hall))).
action_effect(hold_court, (assert(judged(Actor)))).
can_perform(Actor, hold_court, _) :-
    at_location(Actor, great_hall).
