%% Ensemble Actions: conversational-greetings
%% Source: data/ensemble/actions/conversational-greetings.json
%% Converted: 2026-04-01T20:15:17.337Z
%% Total actions: 10

%% greet_in_subtle_modest_way
% Action: greet in subtle modest way
% Source: Ensemble / conversational-greetings

action(greet_in_subtle_modest_way, 'greet in subtle modest way', social, 1).
action_difficulty(greet_in_subtle_modest_way, 0.5).
action_duration(greet_in_subtle_modest_way, 1).
action_category(greet_in_subtle_modest_way, conversational_greetings).
action_source(greet_in_subtle_modest_way, ensemble).
action_verb(greet_in_subtle_modest_way, past, 'greet in subtle modest way').
action_verb(greet_in_subtle_modest_way, present, 'greet in subtle modest way').
action_target_type(greet_in_subtle_modest_way, other).
action_requires_target(greet_in_subtle_modest_way).
action_range(greet_in_subtle_modest_way, 5).
action_is_accept(greet_in_subtle_modest_way).
action_prerequisite(greet_in_subtle_modest_way, (attribute(Actor, sophistication, V), V < 50)).
action_prerequisite(greet_in_subtle_modest_way, (attribute(Actor, social standing, V), V < 50)).
action_prerequisite(greet_in_subtle_modest_way, (attribute(Target, social standing, V), V > 60)).
action_prerequisite(greet_in_subtle_modest_way, (\+ trait(Target, vain))).
action_prerequisite(greet_in_subtle_modest_way, (trait(Actor, modest))).
action_effect(greet_in_subtle_modest_way, (modify_network(Target, Actor, affinity, +, 5))).
% Can Actor perform this action?
can_perform(Actor, greet_in_subtle_modest_way, Target) :-
    attribute(Actor, sophistication, V), V < 50,
    attribute(Actor, social standing, V), V < 50,
    attribute(Target, social standing, V), V > 60,
    \+ trait(Target, vain),
    trait(Actor, modest).

%% hello_honorable_villager
% Action: Hello honorable villager.
% Source: Ensemble / conversational-greetings

action(hello_honorable_villager, 'Hello honorable villager.', social, 1).
action_difficulty(hello_honorable_villager, 0.5).
action_duration(hello_honorable_villager, 1).
action_category(hello_honorable_villager, conversational_greetings).
action_source(hello_honorable_villager, ensemble).
action_verb(hello_honorable_villager, past, 'hello honorable villager.').
action_verb(hello_honorable_villager, present, 'hello honorable villager.').
action_target_type(hello_honorable_villager, other).
action_requires_target(hello_honorable_villager).
action_range(hello_honorable_villager, 5).
action_effect(hello_honorable_villager, (ensemble_effect(Actor, formal, true))).
can_perform(Actor, hello_honorable_villager, Target) :- true.

%% greet_correction
% Action: Greet Correction
% Source: Ensemble / conversational-greetings

action(greet_correction, 'Greet Correction', social, 1).
action_difficulty(greet_correction, 0.5).
action_duration(greet_correction, 1).
action_category(greet_correction, conversational_greetings).
action_source(greet_correction, ensemble).
action_verb(greet_correction, past, 'greet correction').
action_verb(greet_correction, present, 'greet correction').
action_target_type(greet_correction, other).
action_requires_target(greet_correction).
action_range(greet_correction, 5).
action_effect(greet_correction, (ensemble_effect(Actor, met, true))).
action_effect(greet_correction, (ensemble_effect(Target, met, true))).
action_effect(greet_correction, (ensemble_effect(Actor, negative, true))).
can_perform(Actor, greet_correction, Target) :- true.

%% nice_greet_reply
% Action: Nice Greet Reply
% Source: Ensemble / conversational-greetings

action(nice_greet_reply, 'Nice Greet Reply', social, 1).
action_difficulty(nice_greet_reply, 0.5).
action_duration(nice_greet_reply, 1).
action_category(nice_greet_reply, conversational_greetings).
action_source(nice_greet_reply, ensemble).
action_verb(nice_greet_reply, past, 'nice greet reply').
action_verb(nice_greet_reply, present, 'nice greet reply').
action_target_type(nice_greet_reply, other).
action_requires_target(nice_greet_reply).
action_range(nice_greet_reply, 5).
action_effect(nice_greet_reply, (ensemble_effect(Actor, met, true))).
action_effect(nice_greet_reply, (ensemble_effect(Target, met, true))).
action_effect(nice_greet_reply, (ensemble_effect(Actor, positive, true))).
can_perform(Actor, nice_greet_reply, Target) :- true.

%% greet
% Action: Greet
% Source: Ensemble / conversational-greetings

action(greet, 'Greet', social, 1).
action_difficulty(greet, 0.5).
action_duration(greet, 1).
action_category(greet, conversational_greetings).
action_source(greet, ensemble).
action_verb(greet, past, 'greet').
action_verb(greet, present, 'greet').
action_target_type(greet, self).
can_perform(Actor, greet) :- true.

%% respond_to_greeting
% Action: Respond to greeting
% Source: Ensemble / conversational-greetings

action(respond_to_greeting, 'Respond to greeting', social, 1).
action_difficulty(respond_to_greeting, 0.5).
action_duration(respond_to_greeting, 1).
action_category(respond_to_greeting, conversational_greetings).
action_source(respond_to_greeting, ensemble).
action_verb(respond_to_greeting, past, 'respond to greeting').
action_verb(respond_to_greeting, present, 'respond to greeting').
action_target_type(respond_to_greeting, self).
can_perform(Actor, respond_to_greeting) :- true.

%% polite_hello
% Action: Polite hello
% Source: Ensemble / conversational-greetings

action(polite_hello, 'Polite hello', social, 1).
action_difficulty(polite_hello, 0.5).
action_duration(polite_hello, 1).
action_category(polite_hello, conversational_greetings).
action_source(polite_hello, ensemble).
action_verb(polite_hello, past, 'polite hello').
action_verb(polite_hello, present, 'polite hello').
action_target_type(polite_hello, self).
action_influence(polite_hello, (influence(unknown, _, _, weight, +, 0))).
can_perform(Actor, polite_hello) :- true.

%% rude_hello
% Action: Rude hello
% Source: Ensemble / conversational-greetings

action(rude_hello, 'Rude hello', social, 1).
action_difficulty(rude_hello, 0.5).
action_duration(rude_hello, 1).
action_category(rude_hello, conversational_greetings).
action_source(rude_hello, ensemble).
action_verb(rude_hello, past, 'rude hello').
action_verb(rude_hello, present, 'rude hello').
action_target_type(rude_hello, self).
can_perform(Actor, rude_hello) :- true.

%% friendly_response_to_a_greeting
% Action: Friendly response to a greeting
% Source: Ensemble / conversational-greetings

action(friendly_response_to_a_greeting, 'Friendly response to a greeting', social, 1).
action_difficulty(friendly_response_to_a_greeting, 0.5).
action_duration(friendly_response_to_a_greeting, 1).
action_category(friendly_response_to_a_greeting, conversational_greetings).
action_source(friendly_response_to_a_greeting, ensemble).
action_verb(friendly_response_to_a_greeting, past, 'friendly response to a greeting').
action_verb(friendly_response_to_a_greeting, present, 'friendly response to a greeting').
action_target_type(friendly_response_to_a_greeting, other).
action_requires_target(friendly_response_to_a_greeting).
action_range(friendly_response_to_a_greeting, 5).
action_effect(friendly_response_to_a_greeting, (modify_network(Actor, Target, friendship, +, 3))).
can_perform(Actor, friendly_response_to_a_greeting, Target) :- true.

%% offended_response_to_a_greeting
% Action: Offended response to a greeting
% Source: Ensemble / conversational-greetings

action(offended_response_to_a_greeting, 'Offended response to a greeting', social, 1).
action_difficulty(offended_response_to_a_greeting, 0.5).
action_duration(offended_response_to_a_greeting, 1).
action_category(offended_response_to_a_greeting, conversational_greetings).
action_source(offended_response_to_a_greeting, ensemble).
action_verb(offended_response_to_a_greeting, past, 'offended response to a greeting').
action_verb(offended_response_to_a_greeting, present, 'offended response to a greeting').
action_target_type(offended_response_to_a_greeting, self).
can_perform(Actor, offended_response_to_a_greeting) :- true.

