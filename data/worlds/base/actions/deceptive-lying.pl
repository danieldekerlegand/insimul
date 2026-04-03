%% Ensemble Actions: deceptive-lying
%% Source: data/ensemble/actions/deceptive-lying.json
%% Converted: 2026-04-01T20:15:17.340Z
%% Total actions: 9

%% lie
% Action: LIE
% Source: Ensemble / deceptive-lying

action(lie, 'LIE', deceptive, 1).
action_difficulty(lie, 0.5).
action_duration(lie, 1).
action_category(lie, deceptive_lying).
action_source(lie, ensemble).
action_verb(lie, past, 'lie').
action_verb(lie, present, 'lie').
action_target_type(lie, self).
action_leads_to(lie, attractive_woman_lies_about_relationship_status_a).
action_leads_to(lie, attractive_woman_lies_about_relationship_status_r).
action_leads_to(lie, lie_successfully).
action_leads_to(lie, lie_unsuccessfully).
can_perform(Actor, lie) :- true.

%% attractive_woman_lies_about_relationship_status_a
% Action: attractive woman lies about relationship status (a)
% Source: Ensemble / deceptive-lying

action(attractive_woman_lies_about_relationship_status_a, 'attractive woman lies about relationship status (a)', deceptive, 1).
action_difficulty(attractive_woman_lies_about_relationship_status_a, 0.5).
action_duration(attractive_woman_lies_about_relationship_status_a, 1).
action_category(attractive_woman_lies_about_relationship_status_a, deceptive_lying).
action_source(attractive_woman_lies_about_relationship_status_a, ensemble).
action_parent(attractive_woman_lies_about_relationship_status_a, lie).
action_verb(attractive_woman_lies_about_relationship_status_a, past, 'attractive woman lies about relationship status (a)').
action_verb(attractive_woman_lies_about_relationship_status_a, present, 'attractive woman lies about relationship status (a)').
action_target_type(attractive_woman_lies_about_relationship_status_a, other).
action_requires_target(attractive_woman_lies_about_relationship_status_a).
action_range(attractive_woman_lies_about_relationship_status_a, 5).
action_is_accept(attractive_woman_lies_about_relationship_status_a).
action_prerequisite(attractive_woman_lies_about_relationship_status_a, (trait(Actor, female))).
action_prerequisite(attractive_woman_lies_about_relationship_status_a, (\+ relationship(Actor, Someone, married))).
action_prerequisite(attractive_woman_lies_about_relationship_status_a, (attribute(Actor, charisma, V), V > 70)).
action_prerequisite(attractive_woman_lies_about_relationship_status_a, (relationship(Target, Actor, esteem))).
action_prerequisite(attractive_woman_lies_about_relationship_status_a, (attribute(Actor, cunningness, V), V > 50)).
action_effect(attractive_woman_lies_about_relationship_status_a, (modify_network(Target, Actor, credibility, +, 5))).
% Can Actor perform this action?
can_perform(Actor, attractive_woman_lies_about_relationship_status_a, Target) :-
    trait(Actor, female),
    \+ relationship(Actor, Someone, married),
    attribute(Actor, charisma, V), V > 70,
    relationship(Target, Actor, esteem),
    attribute(Actor, cunningness, V), V > 50.

%% attractive_woman_lies_about_relationship_status_r
% Action: attractive woman lies about relationship status (r)
% Source: Ensemble / deceptive-lying

action(attractive_woman_lies_about_relationship_status_r, 'attractive woman lies about relationship status (r)', deceptive, 1).
action_difficulty(attractive_woman_lies_about_relationship_status_r, 0.5).
action_duration(attractive_woman_lies_about_relationship_status_r, 1).
action_category(attractive_woman_lies_about_relationship_status_r, deceptive_lying).
action_source(attractive_woman_lies_about_relationship_status_r, ensemble).
action_parent(attractive_woman_lies_about_relationship_status_r, lie).
action_verb(attractive_woman_lies_about_relationship_status_r, past, 'attractive woman lies about relationship status (r)').
action_verb(attractive_woman_lies_about_relationship_status_r, present, 'attractive woman lies about relationship status (r)').
action_target_type(attractive_woman_lies_about_relationship_status_r, other).
action_requires_target(attractive_woman_lies_about_relationship_status_r).
action_range(attractive_woman_lies_about_relationship_status_r, 5).
action_prerequisite(attractive_woman_lies_about_relationship_status_r, (trait(Actor, female))).
action_prerequisite(attractive_woman_lies_about_relationship_status_r, (attribute(Actor, charisma, V), V > 70)).
action_prerequisite(attractive_woman_lies_about_relationship_status_r, (network(Target, Actor, credibility, V), V < 60)).
action_effect(attractive_woman_lies_about_relationship_status_r, (ensemble_effect(Actor, caught in a lie by, true))).
action_effect(attractive_woman_lies_about_relationship_status_r, (modify_network(Target, Actor, credibility, -, 30))).
action_effect(attractive_woman_lies_about_relationship_status_r, (modify_network(Target, Actor, affinity, -, 15))).
action_effect(attractive_woman_lies_about_relationship_status_r, (modify_network(Actor, Target, affinity, -, 15))).
% Can Actor perform this action?
can_perform(Actor, attractive_woman_lies_about_relationship_status_r, Target) :-
    trait(Actor, female),
    attribute(Actor, charisma, V), V > 70,
    network(Target, Actor, credibility, V), V < 60.

%% lie_successfully
% Action: lie successfully
% Source: Ensemble / deceptive-lying

action(lie_successfully, 'lie successfully', deceptive, 1).
action_difficulty(lie_successfully, 0.5).
action_duration(lie_successfully, 1).
action_category(lie_successfully, deceptive_lying).
action_source(lie_successfully, ensemble).
action_parent(lie_successfully, lie).
action_verb(lie_successfully, past, 'lie successfully').
action_verb(lie_successfully, present, 'lie successfully').
action_target_type(lie_successfully, self).
action_is_accept(lie_successfully).
can_perform(Actor, lie_successfully) :- true.

%% lie_unsuccessfully
% Action: lie unsuccessfully
% Source: Ensemble / deceptive-lying

action(lie_unsuccessfully, 'lie unsuccessfully', deceptive, 1).
action_difficulty(lie_unsuccessfully, 0.5).
action_duration(lie_unsuccessfully, 1).
action_category(lie_unsuccessfully, deceptive_lying).
action_source(lie_unsuccessfully, ensemble).
action_parent(lie_unsuccessfully, lie).
action_verb(lie_unsuccessfully, past, 'lie unsuccessfully').
action_verb(lie_unsuccessfully, present, 'lie unsuccessfully').
action_target_type(lie_unsuccessfully, other).
action_requires_target(lie_unsuccessfully).
action_range(lie_unsuccessfully, 5).
action_effect(lie_unsuccessfully, (modify_network(Target, Actor, credibility, -, 5))).
can_perform(Actor, lie_unsuccessfully, Target) :- true.

%% virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout
% Action: virtuous tells clergy of being preyed upon, is disbelieved by devout
% Source: Ensemble / deceptive-lying

action(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, 'virtuous tells clergy of being preyed upon, is disbelieved by devout', deceptive, 1).
action_difficulty(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, 0.5).
action_duration(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, 1).
action_category(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, deceptive_lying).
action_source(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, ensemble).
action_verb(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, past, 'virtuous tells clergy of being preyed upon, is disbelieved by devout').
action_verb(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, present, 'virtuous tells clergy of being preyed upon, is disbelieved by devout').
action_target_type(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, other).
action_requires_target(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout).
action_range(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, 5).
action_prerequisite(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, (trait(Actor, virtuous))).
action_prerequisite(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, (trait(Actor, young))).
action_prerequisite(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, (trait(Target, clergy))).
action_prerequisite(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, (trait(Target, devout))).
action_prerequisite(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, (network('third', Target, affinity, V), V > 50)).
action_prerequisite(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, (\+ relationship('third', Target, strangers))).
action_prerequisite(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, (trait('third', rich))).
action_prerequisite(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, (trait('third', hypocritical))).
action_effect(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, (retract(relationship(Target, Actor, esteem)))).
action_effect(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, (modify_network(Target, Actor, affinity, -, 10))).
action_effect(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, (ensemble_effect('third', flirted with, true))).
action_effect(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, (assert(status(Actor, upset)))).
action_effect(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, (modify_attribute(Actor, self-assuredness, -, 15))).
action_effect(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, (ensemble_effect(Target, suspicious of, true))).
% Can Actor perform this action?
can_perform(Actor, virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, Target) :-
    trait(Actor, virtuous),
    trait(Actor, young),
    trait(Target, clergy),
    trait(Target, devout),
    network('third', Target, affinity, V), V > 50,
    \+ relationship('third', Target, strangers),
    trait('third', rich),
    trait('third', hypocritical).

%% lie_about_not_liking_something_to_get_attention
% Action: lie about not liking something to get attention
% Source: Ensemble / deceptive-lying

action(lie_about_not_liking_something_to_get_attention, 'lie about not liking something to get attention', deceptive, 1).
action_difficulty(lie_about_not_liking_something_to_get_attention, 0.5).
action_duration(lie_about_not_liking_something_to_get_attention, 1).
action_category(lie_about_not_liking_something_to_get_attention, deceptive_lying).
action_source(lie_about_not_liking_something_to_get_attention, ensemble).
action_verb(lie_about_not_liking_something_to_get_attention, past, 'lie about not liking something to get attention').
action_verb(lie_about_not_liking_something_to_get_attention, present, 'lie about not liking something to get attention').
action_target_type(lie_about_not_liking_something_to_get_attention, other).
action_requires_target(lie_about_not_liking_something_to_get_attention).
action_range(lie_about_not_liking_something_to_get_attention, 5).
action_is_accept(lie_about_not_liking_something_to_get_attention).
action_prerequisite(lie_about_not_liking_something_to_get_attention, (network(Actor, Target, affinity, V), V > 60)).
action_prerequisite(lie_about_not_liking_something_to_get_attention, (trait(Actor, deceptive))).
action_prerequisite(lie_about_not_liking_something_to_get_attention, (trait(Target, credulous))).
action_prerequisite(lie_about_not_liking_something_to_get_attention, (attribute(Actor, cunningness, V), V > 50)).
action_effect(lie_about_not_liking_something_to_get_attention, (modify_network(Target, Actor, curiosity, +, 10))).
% Can Actor perform this action?
can_perform(Actor, lie_about_not_liking_something_to_get_attention, Target) :-
    network(Actor, Target, affinity, V), V > 60,
    trait(Actor, deceptive),
    trait(Target, credulous),
    attribute(Actor, cunningness, V), V > 50.

%% lover_catches_virtuous_partner_disbelieves_display_of_virtue
% Action: lover catches virtuous partner, disbelieves display of virtue
% Source: Ensemble / deceptive-lying

action(lover_catches_virtuous_partner_disbelieves_display_of_virtue, 'lover catches virtuous partner, disbelieves display of virtue', deceptive, 1).
action_difficulty(lover_catches_virtuous_partner_disbelieves_display_of_virtue, 0.5).
action_duration(lover_catches_virtuous_partner_disbelieves_display_of_virtue, 1).
action_category(lover_catches_virtuous_partner_disbelieves_display_of_virtue, deceptive_lying).
action_source(lover_catches_virtuous_partner_disbelieves_display_of_virtue, ensemble).
action_verb(lover_catches_virtuous_partner_disbelieves_display_of_virtue, past, 'lover catches virtuous partner, disbelieves display of virtue').
action_verb(lover_catches_virtuous_partner_disbelieves_display_of_virtue, present, 'lover catches virtuous partner, disbelieves display of virtue').
action_target_type(lover_catches_virtuous_partner_disbelieves_display_of_virtue, other).
action_requires_target(lover_catches_virtuous_partner_disbelieves_display_of_virtue).
action_range(lover_catches_virtuous_partner_disbelieves_display_of_virtue, 5).
action_prerequisite(lover_catches_virtuous_partner_disbelieves_display_of_virtue, (trait(Target, virtuous))).
action_prerequisite(lover_catches_virtuous_partner_disbelieves_display_of_virtue, (trait(Actor, rich))).
action_prerequisite(lover_catches_virtuous_partner_disbelieves_display_of_virtue, (\+ relationship(Target, 'third', strangers))).
action_prerequisite(lover_catches_virtuous_partner_disbelieves_display_of_virtue, (network('third', Target, affinity, V), V > 60)).
action_effect(lover_catches_virtuous_partner_disbelieves_display_of_virtue, (retract(relationship(Actor, Target, esteem)))).
action_effect(lover_catches_virtuous_partner_disbelieves_display_of_virtue, (ensemble_effect(Target, caught in a lie by, true))).
action_effect(lover_catches_virtuous_partner_disbelieves_display_of_virtue, (ensemble_effect(Actor, resentful of, true))).
action_effect(lover_catches_virtuous_partner_disbelieves_display_of_virtue, (ensemble_effect('third', flirted with, true))).
% Can Actor perform this action?
can_perform(Actor, lover_catches_virtuous_partner_disbelieves_display_of_virtue, Target) :-
    trait(Target, virtuous),
    trait(Actor, rich),
    \+ relationship(Target, 'third', strangers),
    network('third', Target, affinity, V), V > 60.

%% look_with_disdain_after_discovering_a_lie
% Action: look with disdain after discovering a lie
% Source: Ensemble / deceptive-lying

action(look_with_disdain_after_discovering_a_lie, 'look with disdain after discovering a lie', deceptive, 1).
action_difficulty(look_with_disdain_after_discovering_a_lie, 0.5).
action_duration(look_with_disdain_after_discovering_a_lie, 1).
action_category(look_with_disdain_after_discovering_a_lie, deceptive_lying).
action_source(look_with_disdain_after_discovering_a_lie, ensemble).
action_verb(look_with_disdain_after_discovering_a_lie, past, 'look with disdain after discovering a lie').
action_verb(look_with_disdain_after_discovering_a_lie, present, 'look with disdain after discovering a lie').
action_target_type(look_with_disdain_after_discovering_a_lie, other).
action_requires_target(look_with_disdain_after_discovering_a_lie).
action_range(look_with_disdain_after_discovering_a_lie, 5).
action_is_accept(look_with_disdain_after_discovering_a_lie).
action_prerequisite(look_with_disdain_after_discovering_a_lie, (ensemble_condition(Actor, caught in a lie by, true))).
action_effect(look_with_disdain_after_discovering_a_lie, (retract(relationship(Target, Actor, esteem)))).
action_effect(look_with_disdain_after_discovering_a_lie, (modify_network(Target, Actor, affinity, -, 5))).
% Can Actor perform this action?
can_perform(Actor, look_with_disdain_after_discovering_a_lie, Target) :-
    ensemble_condition(Actor, caught in a lie by, true).

