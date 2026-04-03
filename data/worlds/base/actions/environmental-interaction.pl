%% Ensemble Actions: environmental-interaction
%% Source: data/ensemble/actions/environmental-interaction.json
%% Converted: 2026-04-01T20:15:17.341Z
%% Total actions: 1

%% read_sign
% Action: Read a nearby sign or notice
% Source: Ensemble / environmental-interaction

action(read_sign, 'Read a nearby sign or notice', physical, 1).
action_difficulty(read_sign, 0.5).
action_duration(read_sign, 1).
action_category(read_sign, environmental_interaction).
action_source(read_sign, ensemble).
action_verb(read_sign, past, 'read sign').
action_verb(read_sign, present, 'read sign').
action_target_type(read_sign, self).
action_effect(read_sign, (ensemble_effect(Actor, read_sign, true))).
can_perform(Actor, read_sign) :- true.

