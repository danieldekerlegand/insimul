%% Ensemble Actions: physical-activities
%% Source: data/ensemble/actions/physical-activities.json
%% Converted: 2026-04-01T20:15:17.344Z
%% Total actions: 5

%% bitten
% Action: bitten
% Source: Ensemble / physical-activities

action(bitten, 'bitten', physical, 1).
action_difficulty(bitten, 0.5).
action_duration(bitten, 1).
action_category(bitten, physical_activities).
action_source(bitten, ensemble).
action_verb(bitten, past, 'bitten').
action_verb(bitten, present, 'bitten').
action_target_type(bitten, other).
action_requires_target(bitten).
action_range(bitten, 5).
action_is_accept(bitten).
action_effect(bitten, (modify_network(Target, Actor, fear, +, 4))).
can_perform(Actor, bitten, Target) :- true.

%% get_drunk_together
% Action: get drunk together
% Source: Ensemble / physical-activities

action(get_drunk_together, 'get drunk together', physical, 1).
action_difficulty(get_drunk_together, 0.5).
action_duration(get_drunk_together, 1).
action_category(get_drunk_together, physical_activities).
action_source(get_drunk_together, ensemble).
action_verb(get_drunk_together, past, 'get drunk together').
action_verb(get_drunk_together, present, 'get drunk together').
action_target_type(get_drunk_together, other).
action_requires_target(get_drunk_together).
action_range(get_drunk_together, 5).
action_is_accept(get_drunk_together).
action_prerequisite(get_drunk_together, (network(Actor, Target, affinity, V), V > 70)).
action_prerequisite(get_drunk_together, (attribute(Actor, propriety, V), V < 60)).
action_prerequisite(get_drunk_together, (attribute(Target, propriety, V), V < 60)).
action_effect(get_drunk_together, (assert(status(Actor, inebriated)))).
action_effect(get_drunk_together, (assert(status(Target, inebriated)))).
action_effect(get_drunk_together, (assert(status(Actor, happy)))).
action_effect(get_drunk_together, (assert(status(Target, happy)))).
action_effect(get_drunk_together, (assert(status(Actor, feeling socially connected)))).
action_effect(get_drunk_together, (assert(status(Target, feeling socially connected)))).
action_effect(get_drunk_together, (modify_network(Actor, Target, affinity, +, 15))).
action_effect(get_drunk_together, (modify_network(Target, Actor, affinity, +, 15))).
% Can Actor perform this action?
can_perform(Actor, get_drunk_together, Target) :-
    network(Actor, Target, affinity, V), V > 70,
    attribute(Actor, propriety, V), V < 60,
    attribute(Target, propriety, V), V < 60.

%% engage_in_a_rich_person_dance_while_not_rich_person
% Action: engage in a rich person dance while not rich person
% Source: Ensemble / physical-activities

action(engage_in_a_rich_person_dance_while_not_rich_person, 'engage in a rich person dance while not rich person', physical, 1).
action_difficulty(engage_in_a_rich_person_dance_while_not_rich_person, 0.5).
action_duration(engage_in_a_rich_person_dance_while_not_rich_person, 1).
action_category(engage_in_a_rich_person_dance_while_not_rich_person, physical_activities).
action_source(engage_in_a_rich_person_dance_while_not_rich_person, ensemble).
action_verb(engage_in_a_rich_person_dance_while_not_rich_person, past, 'engage in a rich person dance while not rich person').
action_verb(engage_in_a_rich_person_dance_while_not_rich_person, present, 'engage in a rich person dance while not rich person').
action_target_type(engage_in_a_rich_person_dance_while_not_rich_person, other).
action_requires_target(engage_in_a_rich_person_dance_while_not_rich_person).
action_range(engage_in_a_rich_person_dance_while_not_rich_person, 5).
action_prerequisite(engage_in_a_rich_person_dance_while_not_rich_person, (\+ trait(Actor, rich))).
action_prerequisite(engage_in_a_rich_person_dance_while_not_rich_person, (trait(Target, rich))).
action_prerequisite(engage_in_a_rich_person_dance_while_not_rich_person, (network(Target, Actor, credibility, V), V < 50)).
action_prerequisite(engage_in_a_rich_person_dance_while_not_rich_person, (relationship(Actor, Target, strangers))).
action_effect(engage_in_a_rich_person_dance_while_not_rich_person, (assert(status(Actor, embarrassed)))).
action_effect(engage_in_a_rich_person_dance_while_not_rich_person, (ensemble_effect(Actor, made a faux pas around, true))).
action_effect(engage_in_a_rich_person_dance_while_not_rich_person, (modify_network(Target, Actor, credibility, -, 5))).
action_effect(engage_in_a_rich_person_dance_while_not_rich_person, (ensemble_effect(Actor, impressed, true))).
% Can Actor perform this action?
can_perform(Actor, engage_in_a_rich_person_dance_while_not_rich_person, Target) :-
    \+ trait(Actor, rich),
    trait(Target, rich),
    network(Target, Actor, credibility, V), V < 50,
    relationship(Actor, Target, strangers).

%% begrudgingly_accept_thing
% Action: Begrudgingly accept thing
% Source: Ensemble / physical-activities

action(begrudgingly_accept_thing, 'Begrudgingly accept thing', physical, 1).
action_difficulty(begrudgingly_accept_thing, 0.5).
action_duration(begrudgingly_accept_thing, 1).
action_category(begrudgingly_accept_thing, physical_activities).
action_source(begrudgingly_accept_thing, ensemble).
action_verb(begrudgingly_accept_thing, past, 'begrudgingly accept thing').
action_verb(begrudgingly_accept_thing, present, 'begrudgingly accept thing').
action_target_type(begrudgingly_accept_thing, self).
can_perform(Actor, begrudgingly_accept_thing) :- true.

%% begrudgingly_refuse_to_acquire_thing
% Action: Begrudgingly refuse to acquire thing
% Source: Ensemble / physical-activities

action(begrudgingly_refuse_to_acquire_thing, 'Begrudgingly refuse to acquire thing', physical, 1).
action_difficulty(begrudgingly_refuse_to_acquire_thing, 0.5).
action_duration(begrudgingly_refuse_to_acquire_thing, 1).
action_category(begrudgingly_refuse_to_acquire_thing, physical_activities).
action_source(begrudgingly_refuse_to_acquire_thing, ensemble).
action_verb(begrudgingly_refuse_to_acquire_thing, past, 'begrudgingly refuse to acquire thing').
action_verb(begrudgingly_refuse_to_acquire_thing, present, 'begrudgingly refuse to acquire thing').
action_target_type(begrudgingly_refuse_to_acquire_thing, self).
can_perform(Actor, begrudgingly_refuse_to_acquire_thing) :- true.

