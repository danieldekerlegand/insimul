%% Ensemble Actions: gratitude-reciprocity
%% Source: data/ensemble/actions/gratitude-reciprocity.json
%% Converted: 2026-04-01T20:15:17.342Z
%% Total actions: 3

%% bonne_physionomie_man_grateful_to_benefactor
% Action: bonne physionomie man grateful to benefactor
% Source: Ensemble / gratitude-reciprocity

action(bonne_physionomie_man_grateful_to_benefactor, 'bonne physionomie man grateful to benefactor', social, 1).
action_difficulty(bonne_physionomie_man_grateful_to_benefactor, 0.5).
action_duration(bonne_physionomie_man_grateful_to_benefactor, 1).
action_category(bonne_physionomie_man_grateful_to_benefactor, gratitude_reciprocity).
action_source(bonne_physionomie_man_grateful_to_benefactor, ensemble).
action_verb(bonne_physionomie_man_grateful_to_benefactor, past, 'bonne physionomie man grateful to benefactor').
action_verb(bonne_physionomie_man_grateful_to_benefactor, present, 'bonne physionomie man grateful to benefactor').
action_target_type(bonne_physionomie_man_grateful_to_benefactor, other).
action_requires_target(bonne_physionomie_man_grateful_to_benefactor).
action_range(bonne_physionomie_man_grateful_to_benefactor, 5).
action_is_accept(bonne_physionomie_man_grateful_to_benefactor).
action_prerequisite(bonne_physionomie_man_grateful_to_benefactor, (trait(Target, innocent looking))).
action_prerequisite(bonne_physionomie_man_grateful_to_benefactor, (attribute(Actor, social standing, V), V > 50)).
action_prerequisite(bonne_physionomie_man_grateful_to_benefactor, (trait(Actor, kind))).
action_prerequisite(bonne_physionomie_man_grateful_to_benefactor, (\+ trait(Target, rich))).
action_effect(bonne_physionomie_man_grateful_to_benefactor, (modify_network(Target, Actor, affinity, +, 20))).
action_effect(bonne_physionomie_man_grateful_to_benefactor, (ensemble_effect(Target, owes a favor to, true))).
% Can Actor perform this action?
can_perform(Actor, bonne_physionomie_man_grateful_to_benefactor, Target) :-
    trait(Target, innocent looking),
    attribute(Actor, social standing, V), V > 50,
    trait(Actor, kind),
    \+ trait(Target, rich).

%% express_gratitude_toward_benefactor
% Action: express gratitude toward benefactor
% Source: Ensemble / gratitude-reciprocity

action(express_gratitude_toward_benefactor, 'express gratitude toward benefactor', social, 1).
action_difficulty(express_gratitude_toward_benefactor, 0.5).
action_duration(express_gratitude_toward_benefactor, 1).
action_category(express_gratitude_toward_benefactor, gratitude_reciprocity).
action_source(express_gratitude_toward_benefactor, ensemble).
action_verb(express_gratitude_toward_benefactor, past, 'express gratitude toward benefactor').
action_verb(express_gratitude_toward_benefactor, present, 'express gratitude toward benefactor').
action_target_type(express_gratitude_toward_benefactor, other).
action_requires_target(express_gratitude_toward_benefactor).
action_range(express_gratitude_toward_benefactor, 5).
action_is_accept(express_gratitude_toward_benefactor).
action_prerequisite(express_gratitude_toward_benefactor, (ensemble_condition(Actor, owes a favor to, true))).
action_prerequisite(express_gratitude_toward_benefactor, (status(Actor, grateful))).
action_effect(express_gratitude_toward_benefactor, (modify_network(Target, Actor, affinity, +, 10))).
action_effect(express_gratitude_toward_benefactor, (modify_attribute(Actor, propriety, +, 5))).
action_effect(express_gratitude_toward_benefactor, (modify_network(Actor, Target, affinity, +, 5))).
action_effect(express_gratitude_toward_benefactor, (assert(status(Target, grateful)))).
% Can Actor perform this action?
can_perform(Actor, express_gratitude_toward_benefactor, Target) :-
    ensemble_condition(Actor, owes a favor to, true),
    status(Actor, grateful).

%% express_ingratitude_toward_benefactor
% Action: express ingratitude toward benefactor
% Source: Ensemble / gratitude-reciprocity

action(express_ingratitude_toward_benefactor, 'express ingratitude toward benefactor', social, 1).
action_difficulty(express_ingratitude_toward_benefactor, 0.5).
action_duration(express_ingratitude_toward_benefactor, 1).
action_category(express_ingratitude_toward_benefactor, gratitude_reciprocity).
action_source(express_ingratitude_toward_benefactor, ensemble).
action_verb(express_ingratitude_toward_benefactor, past, 'express ingratitude toward benefactor').
action_verb(express_ingratitude_toward_benefactor, present, 'express ingratitude toward benefactor').
action_target_type(express_ingratitude_toward_benefactor, other).
action_requires_target(express_ingratitude_toward_benefactor).
action_range(express_ingratitude_toward_benefactor, 5).
action_is_accept(express_ingratitude_toward_benefactor).
action_prerequisite(express_ingratitude_toward_benefactor, (ensemble_condition(Actor, owes a favor to, true))).
action_prerequisite(express_ingratitude_toward_benefactor, (\+ status(Actor, grateful))).
action_effect(express_ingratitude_toward_benefactor, (modify_network(Target, Actor, affinity, -, 10))).
action_effect(express_ingratitude_toward_benefactor, (modify_attribute(Actor, propriety, -, 10))).
action_effect(express_ingratitude_toward_benefactor, (ensemble_effect(Target, resentful of, true))).
% Can Actor perform this action?
can_perform(Actor, express_ingratitude_toward_benefactor, Target) :-
    ensemble_condition(Actor, owes a favor to, true),
    \+ status(Actor, grateful).

