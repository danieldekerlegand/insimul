%% Insimul Actions: Low Fantasy
%% Source: data/worlds/low_fantasy/actions.pl
%% Created: 2026-04-03
%% Total: 12 actions
%%
%% Predicate schema (matches base_actions.pl format):
%%   action/4 -- action(AtomId, Name, ActionType, EnergyCost)
%%   action_difficulty/2, action_duration/2, action_category/2
%%   action_verb/3, action_target_type/2
%%   action_requires_target/1, action_range/2
%%   action_prerequisite/2, action_effect/2, can_perform/3

%% pickpocket_lf
%% Lift coins or small items from an unsuspecting target
action(pickpocket_lf, 'pickpocket_lf', criminal, 2).
action_difficulty(pickpocket_lf, 0.5).
action_duration(pickpocket_lf, 1).
action_category(pickpocket_lf, crime).
action_verb(pickpocket_lf, past, 'pickpocketed').
action_verb(pickpocket_lf, present, 'pickpockets').
action_target_type(pickpocket_lf, other).
action_requires_target(pickpocket_lf).
action_range(pickpocket_lf, 3).
action_prerequisite(pickpocket_lf, (attribute(Actor, cunningness, C), C > 50)).
action_effect(pickpocket_lf, (modify_gold(Actor, 5))).
action_effect(pickpocket_lf, (modify_gold(Target, -5))).
can_perform(Actor, pickpocket_lf, Target) :-
    attribute(Actor, cunningness, C), C > 50,
    near(Actor, Target, 3).

%% lockpick
%% Use thieves tools to open a locked door or chest
action(lockpick, 'lockpick', criminal, 2).
action_difficulty(lockpick, 0.5).
action_duration(lockpick, 2).
action_category(lockpick, crime).
action_verb(lockpick, past, 'picked the lock on').
action_verb(lockpick, present, 'picks the lock on').
action_target_type(lockpick, location).
action_range(lockpick, 2).
action_prerequisite(lockpick, (has_item(Actor, thieves_tools, _))).
action_effect(lockpick, (assert(unlocked(Location)))).
can_perform(Actor, lockpick, _Location) :-
    has_item(Actor, thieves_tools, _).

%% bribe_bailiff
%% Pay off the local authority to look the other way
action(bribe_bailiff, 'bribe_bailiff', social, 3).
action_difficulty(bribe_bailiff, 0.4).
action_duration(bribe_bailiff, 1).
action_category(bribe_bailiff, corruption).
action_verb(bribe_bailiff, past, 'bribed').
action_verb(bribe_bailiff, present, 'bribes').
action_target_type(bribe_bailiff, other).
action_requires_target(bribe_bailiff).
action_range(bribe_bailiff, 5).
action_prerequisite(bribe_bailiff, (gold(Actor, G), G >= 15)).
action_prerequisite(bribe_bailiff, (status(Target, bailiff))).
action_effect(bribe_bailiff, (modify_gold(Actor, -15))).
action_effect(bribe_bailiff, (assert(bribed(Target, Actor)))).
can_perform(Actor, bribe_bailiff, Target) :-
    gold(Actor, G), G >= 15,
    status(Target, bailiff),
    near(Actor, Target, 5).

%% forge_document
%% Create a counterfeit official document
action(forge_document, 'forge_document', criminal, 4).
action_difficulty(forge_document, 0.7).
action_duration(forge_document, 3).
action_category(forge_document, forgery).
action_verb(forge_document, past, 'forged a document').
action_verb(forge_document, present, 'forges a document').
action_target_type(forge_document, none).
action_range(forge_document, 0).
action_prerequisite(forge_document, (status(Actor, forger))).
action_effect(forge_document, (assert(has_item(Actor, forged_trade_permit, 1)))).
can_perform(Actor, forge_document, _) :-
    status(Actor, forger).

%% brew_remedy
%% Prepare a herbal potion or poultice
action(brew_remedy, 'brew_remedy', crafting, 3).
action_difficulty(brew_remedy, 0.5).
action_duration(brew_remedy, 3).
action_category(brew_remedy, alchemy).
action_verb(brew_remedy, past, 'brewed a remedy').
action_verb(brew_remedy, present, 'brews a remedy').
action_target_type(brew_remedy, none).
action_range(brew_remedy, 0).
action_prerequisite(brew_remedy, (status(Actor, Status), member(Status, [hedge_witch, healer]))).
action_effect(brew_remedy, (assert(has_item(Actor, dubious_healing_potion, 1)))).
can_perform(Actor, brew_remedy, _) :-
    status(Actor, Status), member(Status, [hedge_witch, healer]).

%% smuggle_goods
%% Transport contraband between settlements
action(smuggle_goods, 'smuggle_goods', criminal, 5).
action_difficulty(smuggle_goods, 0.6).
action_duration(smuggle_goods, 5).
action_category(smuggle_goods, smuggling).
action_verb(smuggle_goods, past, 'smuggled goods to').
action_verb(smuggle_goods, present, 'smuggles goods to').
action_target_type(smuggle_goods, location).
action_range(smuggle_goods, 0).
action_prerequisite(smuggle_goods, (has_item(Actor, smuggled_salt, _))).
action_effect(smuggle_goods, (modify_gold(Actor, 30))).
action_effect(smuggle_goods, (retract(has_item(Actor, smuggled_salt, _)))).
can_perform(Actor, smuggle_goods, _Location) :-
    has_item(Actor, smuggled_salt, _).

%% gather_information
%% Buy drinks and listen for rumours at a tavern
action(gather_information, 'gather_information', social, 2).
action_difficulty(gather_information, 0.3).
action_duration(gather_information, 2).
action_category(gather_information, intelligence).
action_verb(gather_information, past, 'gathered information at').
action_verb(gather_information, present, 'gathers information at').
action_target_type(gather_information, location).
action_range(gather_information, 5).
action_prerequisite(gather_information, (gold(Actor, G), G >= 3)).
action_effect(gather_information, (modify_gold(Actor, -3))).
action_effect(gather_information, (assert(rumour_heard(Actor, Location)))).
can_perform(Actor, gather_information, _Location) :-
    gold(Actor, G), G >= 3.

%% intimidate
%% Use threats to coerce a target into compliance
action(intimidate, 'intimidate', social, 3).
action_difficulty(intimidate, 0.5).
action_duration(intimidate, 1).
action_category(intimidate, coercion).
action_verb(intimidate, past, 'intimidated').
action_verb(intimidate, present, 'intimidates').
action_target_type(intimidate, other).
action_requires_target(intimidate).
action_range(intimidate, 5).
action_prerequisite(intimidate, (attribute(Actor, self_assuredness, SA), SA > 60)).
action_effect(intimidate, (assert(intimidated(Target, Actor)))).
can_perform(Actor, intimidate, Target) :-
    attribute(Actor, self_assuredness, SA), SA > 60,
    near(Actor, Target, 5).

%% hire_sellsword
%% Pay a mercenary for protection or violence
action(hire_sellsword, 'hire_sellsword', social, 2).
action_difficulty(hire_sellsword, 0.3).
action_duration(hire_sellsword, 1).
action_category(hire_sellsword, military).
action_verb(hire_sellsword, past, 'hired').
action_verb(hire_sellsword, present, 'hires').
action_target_type(hire_sellsword, other).
action_requires_target(hire_sellsword).
action_range(hire_sellsword, 5).
action_prerequisite(hire_sellsword, (gold(Actor, G), G >= 20)).
action_prerequisite(hire_sellsword, (status(Target, sellsword))).
action_effect(hire_sellsword, (modify_gold(Actor, -20))).
action_effect(hire_sellsword, (assert(employed(Target, Actor)))).
can_perform(Actor, hire_sellsword, Target) :-
    gold(Actor, G), G >= 20,
    status(Target, sellsword),
    near(Actor, Target, 5).

%% forage_herbs
%% Search the wilderness for useful plants
action(forage_herbs, 'forage_herbs', survival, 3).
action_difficulty(forage_herbs, 0.4).
action_duration(forage_herbs, 3).
action_category(forage_herbs, gathering).
action_verb(forage_herbs, past, 'foraged herbs').
action_verb(forage_herbs, present, 'forages herbs').
action_target_type(forage_herbs, location).
action_range(forage_herbs, 0).
action_effect(forage_herbs, (assert(has_item(Actor, bundle_of_hemlock, 1)))).
can_perform(Actor, forage_herbs, _Location) :-
    alive(Actor).

%% fence_stolen_goods
%% Sell stolen property through a pawnbroker
action(fence_stolen_goods, 'fence_stolen_goods', criminal, 2).
action_difficulty(fence_stolen_goods, 0.3).
action_duration(fence_stolen_goods, 1).
action_category(fence_stolen_goods, crime).
action_verb(fence_stolen_goods, past, 'fenced goods with').
action_verb(fence_stolen_goods, present, 'fences goods with').
action_target_type(fence_stolen_goods, other).
action_requires_target(fence_stolen_goods).
action_range(fence_stolen_goods, 5).
action_prerequisite(fence_stolen_goods, (status(Target, fence))).
action_effect(fence_stolen_goods, (modify_gold(Actor, 10))).
can_perform(Actor, fence_stolen_goods, Target) :-
    status(Target, fence),
    near(Actor, Target, 5).

%% set_ambush
%% Prepare a hidden trap or ambush along a road
action(set_ambush, 'set_ambush', combat, 4).
action_difficulty(set_ambush, 0.6).
action_duration(set_ambush, 3).
action_category(set_ambush, military).
action_verb(set_ambush, past, 'set an ambush at').
action_verb(set_ambush, present, 'sets an ambush at').
action_target_type(set_ambush, location).
action_range(set_ambush, 0).
action_prerequisite(set_ambush, (attribute(Actor, cunningness, C), C > 50)).
action_effect(set_ambush, (assert(ambush_set(Actor, Location)))).
can_perform(Actor, set_ambush, _Location) :-
    attribute(Actor, cunningness, C), C > 50.
