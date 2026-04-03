%% Ensemble Actions: conversational-introductions
%% Source: data/ensemble/actions/conversational-introductions.json
%% Converted: 2026-04-01T20:15:17.338Z
%% Total actions: 6

%% a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a
% Action: a rich person ask a non-rich person to introduce him to a higher rich person (a)
% Source: Ensemble / conversational-introductions

action(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, 'a rich person ask a non-rich person to introduce him to a higher rich person (a)', social, 1).
action_difficulty(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, 0.5).
action_duration(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, 1).
action_category(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, conversational_introductions).
action_source(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, ensemble).
action_verb(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, past, 'a rich person ask a non-rich person to introduce him to a higher rich person (a)').
action_verb(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, present, 'a rich person ask a non-rich person to introduce him to a higher rich person (a)').
action_target_type(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, other).
action_requires_target(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a).
action_range(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, 5).
action_is_accept(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a).
action_prerequisite(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, (trait(Actor, rich))).
action_prerequisite(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, (\+ trait(Target, rich))).
action_prerequisite(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, (trait('third', rich))).
action_prerequisite(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, (attribute(Actor, social standing, V), V > 60)).
action_prerequisite(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, (attribute('third', social standing, V), V > 85)).
action_prerequisite(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, (relationship(Target, 'third', friends))).
action_prerequisite(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, (\+ relationship(Actor, Target, strangers))).
action_effect(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, (modify_network(Target, Actor, credibility, -, 10))).
action_effect(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, (modify_attribute(Target, self-assuredness, +, 10))).
action_effect(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, (modify_network(Target, Actor, credibility, +, 15))).
% Can Actor perform this action?
can_perform(Actor, a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, Target) :-
    trait(Actor, rich),
    \+ trait(Target, rich),
    trait('third', rich),
    attribute(Actor, social standing, V), V > 60,
    attribute('third', social standing, V), V > 85,
    relationship(Target, 'third', friends),
    \+ relationship(Actor, Target, strangers).

%% introduce_self_action_going_first
% Action: Introduce self action, going first
% Source: Ensemble / conversational-introductions

action(introduce_self_action_going_first, 'Introduce self action, going first', social, 1).
action_difficulty(introduce_self_action_going_first, 0.5).
action_duration(introduce_self_action_going_first, 1).
action_category(introduce_self_action_going_first, conversational_introductions).
action_source(introduce_self_action_going_first, ensemble).
action_verb(introduce_self_action_going_first, past, 'introduce self action, going first').
action_verb(introduce_self_action_going_first, present, 'introduce self action, going first').
action_target_type(introduce_self_action_going_first, self).
can_perform(Actor, introduce_self_action_going_first) :- true.

%% introduce_self
% Action: Introduce Self
% Source: Ensemble / conversational-introductions

action(introduce_self, 'Introduce Self', social, 1).
action_difficulty(introduce_self, 0.5).
action_duration(introduce_self, 1).
action_category(introduce_self, conversational_introductions).
action_source(introduce_self, ensemble).
action_verb(introduce_self, past, 'introduce self').
action_verb(introduce_self, present, 'introduce self').
action_target_type(introduce_self, other).
action_requires_target(introduce_self).
action_range(introduce_self, 5).
action_prerequisite(introduce_self, (\+ relationship(Actor, Target, met))).
action_effect(introduce_self, (modify_network(Actor, Target, friendship, +, 1))).
% Can Actor perform this action?
can_perform(Actor, introduce_self, Target) :-
    \+ relationship(Actor, Target, met).

%% introduce_self_flirty
% Action: Introduce Self Flirty
% Source: Ensemble / conversational-introductions

action(introduce_self_flirty, 'Introduce Self Flirty', social, 1).
action_difficulty(introduce_self_flirty, 0.5).
action_duration(introduce_self_flirty, 1).
action_category(introduce_self_flirty, conversational_introductions).
action_source(introduce_self_flirty, ensemble).
action_verb(introduce_self_flirty, past, 'introduce self flirty').
action_verb(introduce_self_flirty, present, 'introduce self flirty').
action_target_type(introduce_self_flirty, other).
action_requires_target(introduce_self_flirty).
action_range(introduce_self_flirty, 5).
action_prerequisite(introduce_self_flirty, (\+ relationship(Actor, Target, met))).
action_effect(introduce_self_flirty, (modify_network(Actor, Target, attraction, +, 3))).
% Can Actor perform this action?
can_perform(Actor, introduce_self_flirty, Target) :-
    \+ relationship(Actor, Target, met).

%% reintroduce_self
% Action: Reintroduce Self
% Source: Ensemble / conversational-introductions

action(reintroduce_self, 'Reintroduce Self', social, 1).
action_difficulty(reintroduce_self, 0.5).
action_duration(reintroduce_self, 1).
action_category(reintroduce_self, conversational_introductions).
action_source(reintroduce_self, ensemble).
action_verb(reintroduce_self, past, 'reintroduce self').
action_verb(reintroduce_self, present, 'reintroduce self').
action_target_type(reintroduce_self, other).
action_requires_target(reintroduce_self).
action_range(reintroduce_self, 5).
action_prerequisite(reintroduce_self, (relationship(Actor, Target, met))).
action_effect(reintroduce_self, (modify_network(Actor, Target, friendship, +, 1))).
% Can Actor perform this action?
can_perform(Actor, reintroduce_self, Target) :-
    relationship(Actor, Target, met).

%% introduce_self_back
% Action: Introduce Self Back
% Source: Ensemble / conversational-introductions

action(introduce_self_back, 'Introduce Self Back', social, 1).
action_difficulty(introduce_self_back, 0.5).
action_duration(introduce_self_back, 1).
action_category(introduce_self_back, conversational_introductions).
action_source(introduce_self_back, ensemble).
action_verb(introduce_self_back, past, 'introduce self back').
action_verb(introduce_self_back, present, 'introduce self back').
action_target_type(introduce_self_back, other).
action_requires_target(introduce_self_back).
action_range(introduce_self_back, 5).
action_effect(introduce_self_back, (assert(relationship(Actor, Target, met)))).
action_effect(introduce_self_back, (modify_network(Actor, Target, friendship, +, 1))).
can_perform(Actor, introduce_self_back, Target) :- true.

