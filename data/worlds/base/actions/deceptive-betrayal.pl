%% Ensemble Actions: deceptive-betrayal
%% Source: data/ensemble/actions/deceptive-betrayal.json
%% Converted: 2026-04-01T20:15:17.339Z
%% Total actions: 4

%% betray
% Action: BETRAY
% Source: Ensemble / deceptive-betrayal

action(betray, 'BETRAY', deceptive, 1).
action_difficulty(betray, 0.5).
action_duration(betray, 1).
action_category(betray, deceptive_betrayal).
action_source(betray, ensemble).
action_verb(betray, past, 'betray').
action_verb(betray, present, 'betray').
action_target_type(betray, self).
action_leads_to(betray, greedy_ally_betrays_rich_man).
action_leads_to(betray, follow_advice_and_break_up).
action_leads_to(betray, betray_successfully).
action_leads_to(betray, betray_unsuccessfully).
can_perform(Actor, betray) :- true.

%% greedy_ally_betrays_rich_man
% Action: greedy ally betrays rich man
% Source: Ensemble / deceptive-betrayal

action(greedy_ally_betrays_rich_man, 'greedy ally betrays rich man', deceptive, 1).
action_difficulty(greedy_ally_betrays_rich_man, 0.5).
action_duration(greedy_ally_betrays_rich_man, 1).
action_category(greedy_ally_betrays_rich_man, deceptive_betrayal).
action_source(greedy_ally_betrays_rich_man, ensemble).
action_parent(greedy_ally_betrays_rich_man, betray).
action_verb(greedy_ally_betrays_rich_man, past, 'greedy ally betrays rich man').
action_verb(greedy_ally_betrays_rich_man, present, 'greedy ally betrays rich man').
action_target_type(greedy_ally_betrays_rich_man, other).
action_requires_target(greedy_ally_betrays_rich_man).
action_range(greedy_ally_betrays_rich_man, 5).
action_is_accept(greedy_ally_betrays_rich_man).
action_prerequisite(greedy_ally_betrays_rich_man, (\+ trait(Actor, rich))).
action_prerequisite(greedy_ally_betrays_rich_man, (trait(Target, rich))).
action_prerequisite(greedy_ally_betrays_rich_man, (relationship(Actor, Target, ally))).
action_prerequisite(greedy_ally_betrays_rich_man, (trait(Actor, greedy))).
action_prerequisite(greedy_ally_betrays_rich_man, (trait(Target, credulous))).
action_prerequisite(greedy_ally_betrays_rich_man, (trait(Actor, deceptive))).
action_effect(greedy_ally_betrays_rich_man, (retract(relationship(Target, Actor, ally)))).
% Can Actor perform this action?
can_perform(Actor, greedy_ally_betrays_rich_man, Target) :-
    \+ trait(Actor, rich),
    trait(Target, rich),
    relationship(Actor, Target, ally),
    trait(Actor, greedy),
    trait(Target, credulous),
    trait(Actor, deceptive).

%% betray_successfully
% Action: betray successfully
% Source: Ensemble / deceptive-betrayal

action(betray_successfully, 'betray successfully', deceptive, 1).
action_difficulty(betray_successfully, 0.5).
action_duration(betray_successfully, 1).
action_category(betray_successfully, deceptive_betrayal).
action_source(betray_successfully, ensemble).
action_parent(betray_successfully, betray).
action_verb(betray_successfully, past, 'betray successfully').
action_verb(betray_successfully, present, 'betray successfully').
action_target_type(betray_successfully, other).
action_requires_target(betray_successfully).
action_range(betray_successfully, 5).
action_is_accept(betray_successfully).
action_effect(betray_successfully, (retract(relationship(Actor, Target, ally)))).
can_perform(Actor, betray_successfully, Target) :- true.

%% betray_unsuccessfully
% Action: betray unsuccessfully
% Source: Ensemble / deceptive-betrayal

action(betray_unsuccessfully, 'betray unsuccessfully', deceptive, 1).
action_difficulty(betray_unsuccessfully, 0.5).
action_duration(betray_unsuccessfully, 1).
action_category(betray_unsuccessfully, deceptive_betrayal).
action_source(betray_unsuccessfully, ensemble).
action_parent(betray_unsuccessfully, betray).
action_verb(betray_unsuccessfully, past, 'betray unsuccessfully').
action_verb(betray_unsuccessfully, present, 'betray unsuccessfully').
action_target_type(betray_unsuccessfully, other).
action_requires_target(betray_unsuccessfully).
action_range(betray_unsuccessfully, 5).
action_effect(betray_unsuccessfully, (assert(relationship(Actor, Target, ally)))).
can_perform(Actor, betray_unsuccessfully, Target) :- true.

