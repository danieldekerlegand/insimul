%% Ensemble Actions: information-exchange
%% Source: data/ensemble/actions/information-exchange.json
%% Converted: 2026-04-01T20:15:17.344Z
%% Total actions: 4

%% keep_a_secret_for_someone
% Action: keep a secret for someone
% Source: Ensemble / information-exchange

action(keep_a_secret_for_someone, 'keep a secret for someone', social, 1).
action_difficulty(keep_a_secret_for_someone, 0.5).
action_duration(keep_a_secret_for_someone, 1).
action_category(keep_a_secret_for_someone, information_exchange).
action_source(keep_a_secret_for_someone, ensemble).
action_verb(keep_a_secret_for_someone, past, 'keep a secret for someone').
action_verb(keep_a_secret_for_someone, present, 'keep a secret for someone').
action_target_type(keep_a_secret_for_someone, other).
action_requires_target(keep_a_secret_for_someone).
action_range(keep_a_secret_for_someone, 5).
action_is_accept(keep_a_secret_for_someone).
action_prerequisite(keep_a_secret_for_someone, (\+ trait(Actor, indiscreet))).
action_prerequisite(keep_a_secret_for_someone, (trait(Actor, trustworthy))).
action_effect(keep_a_secret_for_someone, (modify_network(Target, Actor, affinity, +, 10))).
% Can Actor perform this action?
can_perform(Actor, keep_a_secret_for_someone, Target) :-
    \+ trait(Actor, indiscreet),
    trait(Actor, trustworthy).

%% confess_true_virtuous_feelings
% Action: confess true virtuous feelings
% Source: Ensemble / information-exchange

action(confess_true_virtuous_feelings, 'confess true virtuous feelings', social, 1).
action_difficulty(confess_true_virtuous_feelings, 0.5).
action_duration(confess_true_virtuous_feelings, 1).
action_category(confess_true_virtuous_feelings, information_exchange).
action_source(confess_true_virtuous_feelings, ensemble).
action_verb(confess_true_virtuous_feelings, past, 'confess true virtuous feelings').
action_verb(confess_true_virtuous_feelings, present, 'confess true virtuous feelings').
action_target_type(confess_true_virtuous_feelings, other).
action_requires_target(confess_true_virtuous_feelings).
action_range(confess_true_virtuous_feelings, 5).
action_is_accept(confess_true_virtuous_feelings).
action_prerequisite(confess_true_virtuous_feelings, (trait(Actor, virtuous))).
action_prerequisite(confess_true_virtuous_feelings, (ensemble_condition(Target, offended by, true))).
action_prerequisite(confess_true_virtuous_feelings, (trait(Actor, honest))).
action_effect(confess_true_virtuous_feelings, (modify_network(Target, Actor, credibility, +, 15))).
action_effect(confess_true_virtuous_feelings, (ensemble_effect(Target, offended by, false))).
% Can Actor perform this action?
can_perform(Actor, confess_true_virtuous_feelings, Target) :-
    trait(Actor, virtuous),
    ensemble_condition(Target, offended by, true),
    trait(Actor, honest).

%% attempt_to_conceal_information_from_friend_fails
% Action: attempt to conceal information from friend fails
% Source: Ensemble / information-exchange

action(attempt_to_conceal_information_from_friend_fails, 'attempt to conceal information from friend fails', social, 1).
action_difficulty(attempt_to_conceal_information_from_friend_fails, 0.5).
action_duration(attempt_to_conceal_information_from_friend_fails, 1).
action_category(attempt_to_conceal_information_from_friend_fails, information_exchange).
action_source(attempt_to_conceal_information_from_friend_fails, ensemble).
action_verb(attempt_to_conceal_information_from_friend_fails, past, 'attempt to conceal information from friend fails').
action_verb(attempt_to_conceal_information_from_friend_fails, present, 'attempt to conceal information from friend fails').
action_target_type(attempt_to_conceal_information_from_friend_fails, other).
action_requires_target(attempt_to_conceal_information_from_friend_fails).
action_range(attempt_to_conceal_information_from_friend_fails, 5).
action_prerequisite(attempt_to_conceal_information_from_friend_fails, (relationship(Actor, Target, friends))).
action_prerequisite(attempt_to_conceal_information_from_friend_fails, (status(Actor, embarrassed))).
action_prerequisite(attempt_to_conceal_information_from_friend_fails, (attribute(Target, nosiness, V), V > 50)).
action_effect(attempt_to_conceal_information_from_friend_fails, (modify_network(Target, Actor, curiosity, +, 15))).
% Can Actor perform this action?
can_perform(Actor, attempt_to_conceal_information_from_friend_fails, Target) :-
    relationship(Actor, Target, friends),
    status(Actor, embarrassed),
    attribute(Target, nosiness, V), V > 50.

%% don_t_know
% Action: Don’t know
% Source: Ensemble / information-exchange

action(don_t_know, 'Don''t know', social, 1).
action_difficulty(don_t_know, 0.5).
action_duration(don_t_know, 1).
action_category(don_t_know, information_exchange).
action_source(don_t_know, ensemble).
action_verb(don_t_know, past, 'don''t know').
action_verb(don_t_know, present, 'don''t know').
action_target_type(don_t_know, other).
action_requires_target(don_t_know).
action_range(don_t_know, 5).
action_effect(don_t_know, (modify_network(Actor, Target, trust, -, 1))).
action_effect(don_t_know, (modify_network(Target, Actor, trust, -, 1))).
action_effect(don_t_know, (ensemble_effect(Actor, negative, true))).
action_effect(don_t_know, (ensemble_effect(Target, negative, true))).
can_perform(Actor, don_t_know, Target) :- true.




