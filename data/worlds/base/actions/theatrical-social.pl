%% Ensemble Actions: theatrical-social
%% Source: data/ensemble/actions/theatrical-social.json
%% Converted: 2026-04-01T20:15:17.348Z
%% Total actions: 6

%% yell_something_witty_at_actor_during_play
% Action: yell something witty at actor during play
% Source: Ensemble / theatrical-social

action(yell_something_witty_at_actor_during_play, 'yell something witty at actor during play', social, 1).
action_difficulty(yell_something_witty_at_actor_during_play, 0.5).
action_duration(yell_something_witty_at_actor_during_play, 1).
action_category(yell_something_witty_at_actor_during_play, theatrical_social).
action_source(yell_something_witty_at_actor_during_play, ensemble).
action_verb(yell_something_witty_at_actor_during_play, past, 'yell something witty at actor during play').
action_verb(yell_something_witty_at_actor_during_play, present, 'yell something witty at actor during play').
action_target_type(yell_something_witty_at_actor_during_play, other).
action_requires_target(yell_something_witty_at_actor_during_play).
action_range(yell_something_witty_at_actor_during_play, 5).
action_is_accept(yell_something_witty_at_actor_during_play).
action_prerequisite(yell_something_witty_at_actor_during_play, (attribute(Actor, cultural knowledge, V), V > 50)).
action_prerequisite(yell_something_witty_at_actor_during_play, (attribute(Actor, self-assuredness, V), V > 50)).
action_prerequisite(yell_something_witty_at_actor_during_play, (trait('other', security guard))).
action_effect(yell_something_witty_at_actor_during_play, (modify_network(Target, Actor, emulation, +, 10))).
action_effect(yell_something_witty_at_actor_during_play, (modify_network('other', Actor, affinity, -, 20))).
action_effect(yell_something_witty_at_actor_during_play, (ensemble_effect(Target, ridicules, true))).
% Can Actor perform this action?
can_perform(Actor, yell_something_witty_at_actor_during_play, Target) :-
    attribute(Actor, cultural knowledge, V), V > 50,
    attribute(Actor, self-assuredness, V), V > 50,
    trait('other', security guard).

%% refrain_from_yelling_something_witty_at_actor_during_play
% Action: refrain from yelling something witty at actor during play
% Source: Ensemble / theatrical-social

action(refrain_from_yelling_something_witty_at_actor_during_play, 'refrain from yelling something witty at actor during play', social, 1).
action_difficulty(refrain_from_yelling_something_witty_at_actor_during_play, 0.5).
action_duration(refrain_from_yelling_something_witty_at_actor_during_play, 1).
action_category(refrain_from_yelling_something_witty_at_actor_during_play, theatrical_social).
action_source(refrain_from_yelling_something_witty_at_actor_during_play, ensemble).
action_verb(refrain_from_yelling_something_witty_at_actor_during_play, past, 'refrain from yelling something witty at actor during play').
action_verb(refrain_from_yelling_something_witty_at_actor_during_play, present, 'refrain from yelling something witty at actor during play').
action_target_type(refrain_from_yelling_something_witty_at_actor_during_play, other).
action_requires_target(refrain_from_yelling_something_witty_at_actor_during_play).
action_range(refrain_from_yelling_something_witty_at_actor_during_play, 5).
action_prerequisite(refrain_from_yelling_something_witty_at_actor_during_play, (attribute(Actor, cultural knowledge, V), V > 50)).
action_prerequisite(refrain_from_yelling_something_witty_at_actor_during_play, (attribute(Actor, propriety, V), V > 50)).
action_prerequisite(refrain_from_yelling_something_witty_at_actor_during_play, (trait(Target, security guard))).
action_prerequisite(refrain_from_yelling_something_witty_at_actor_during_play, (trait(Target, awkward))).
action_prerequisite(refrain_from_yelling_something_witty_at_actor_during_play, (attribute('other', propriety, V), V > 50)).
action_effect(refrain_from_yelling_something_witty_at_actor_during_play, (modify_network(Target, Actor, affinity, +, 10))).
action_effect(refrain_from_yelling_something_witty_at_actor_during_play, (modify_network('other', Actor, emulation, +, 5))).
action_effect(refrain_from_yelling_something_witty_at_actor_during_play, (ensemble_effect(Actor, ridicules, true))).
action_effect(refrain_from_yelling_something_witty_at_actor_during_play, (ensemble_effect('other', ridicules, true))).
action_effect(refrain_from_yelling_something_witty_at_actor_during_play, (retract(status(Actor, amused)))).
% Can Actor perform this action?
can_perform(Actor, refrain_from_yelling_something_witty_at_actor_during_play, Target) :-
    attribute(Actor, cultural knowledge, V), V > 50,
    attribute(Actor, propriety, V), V > 50,
    trait(Target, security guard),
    trait(Target, awkward),
    attribute('other', propriety, V), V > 50.

%% pay_for_someone_applauding_during_the_play
% Action: pay for someone applauding during the play
% Source: Ensemble / theatrical-social

action(pay_for_someone_applauding_during_the_play, 'pay for someone applauding during the play', social, 1).
action_difficulty(pay_for_someone_applauding_during_the_play, 0.5).
action_duration(pay_for_someone_applauding_during_the_play, 1).
action_category(pay_for_someone_applauding_during_the_play, theatrical_social).
action_source(pay_for_someone_applauding_during_the_play, ensemble).
action_verb(pay_for_someone_applauding_during_the_play, past, 'pay for someone applauding during the play').
action_verb(pay_for_someone_applauding_during_the_play, present, 'pay for someone applauding during the play').
action_target_type(pay_for_someone_applauding_during_the_play, other).
action_requires_target(pay_for_someone_applauding_during_the_play).
action_range(pay_for_someone_applauding_during_the_play, 5).
action_is_accept(pay_for_someone_applauding_during_the_play).
action_prerequisite(pay_for_someone_applauding_during_the_play, (\+ trait(Actor, poor))).
action_prerequisite(pay_for_someone_applauding_during_the_play, (\+ trait(Target, virtuous))).
action_prerequisite(pay_for_someone_applauding_during_the_play, (network(Someone, Target, emulation, V), V > 50)).
action_effect(pay_for_someone_applauding_during_the_play, (assert(trait(Target, mocking)))).
action_effect(pay_for_someone_applauding_during_the_play, (modify_network(Someone, Target, emulation, +, 3))).
action_effect(pay_for_someone_applauding_during_the_play, (ensemble_effect(Target, financially dependent on, true))).
action_effect(pay_for_someone_applauding_during_the_play, (modify_network(Target, Actor, affinity, +, 3))).
% Can Actor perform this action?
can_perform(Actor, pay_for_someone_applauding_during_the_play, Target) :-
    \+ trait(Actor, poor),
    \+ trait(Target, virtuous),
    network(Someone, Target, emulation, V), V > 50.

%% servant_starts_whistling
% Action: servant starts whistling
% Source: Ensemble / theatrical-social

action(servant_starts_whistling, 'servant starts whistling', social, 1).
action_difficulty(servant_starts_whistling, 0.5).
action_duration(servant_starts_whistling, 1).
action_category(servant_starts_whistling, theatrical_social).
action_source(servant_starts_whistling, ensemble).
action_verb(servant_starts_whistling, past, 'servant starts whistling').
action_verb(servant_starts_whistling, present, 'servant starts whistling').
action_target_type(servant_starts_whistling, other).
action_requires_target(servant_starts_whistling).
action_range(servant_starts_whistling, 5).
action_is_accept(servant_starts_whistling).
action_prerequisite(servant_starts_whistling, (trait(Actor, stagehand))).
action_prerequisite(servant_starts_whistling, (trait(Target, stagehand))).
action_prerequisite(servant_starts_whistling, (network(Actor, Target, affinity, V), V > 50)).
action_effect(servant_starts_whistling, (modify_network(Target, Actor, emulation, +, 10))).
action_effect(servant_starts_whistling, (modify_network(Actor, Target, affinity, +, 50))).
action_effect(servant_starts_whistling, (assert(status(Actor, feeling socially connected)))).
action_effect(servant_starts_whistling, (assert(status(Target, feeling socially connected)))).
action_effect(servant_starts_whistling, (assert(status(Actor, happy)))).
% Can Actor perform this action?
can_perform(Actor, servant_starts_whistling, Target) :-
    trait(Actor, stagehand),
    trait(Target, stagehand),
    network(Actor, Target, affinity, V), V > 50.

%% behave_like_the_others_at_the_theater
% Action: behave like the others at the theater
% Source: Ensemble / theatrical-social

action(behave_like_the_others_at_the_theater, 'behave like the others at the theater', social, 1).
action_difficulty(behave_like_the_others_at_the_theater, 0.5).
action_duration(behave_like_the_others_at_the_theater, 1).
action_category(behave_like_the_others_at_the_theater, theatrical_social).
action_source(behave_like_the_others_at_the_theater, ensemble).
action_verb(behave_like_the_others_at_the_theater, past, 'behave like the others at the theater').
action_verb(behave_like_the_others_at_the_theater, present, 'behave like the others at the theater').
action_target_type(behave_like_the_others_at_the_theater, other).
action_requires_target(behave_like_the_others_at_the_theater).
action_range(behave_like_the_others_at_the_theater, 5).
action_is_accept(behave_like_the_others_at_the_theater).
action_prerequisite(behave_like_the_others_at_the_theater, (attribute(Actor, cultural knowledge, V), V > 70)).
action_prerequisite(behave_like_the_others_at_the_theater, (attribute(Target, cultural knowledge, V), V < 50)).
action_effect(behave_like_the_others_at_the_theater, (modify_network(Target, Actor, emulation, +, 15))).
% Can Actor perform this action?
can_perform(Actor, behave_like_the_others_at_the_theater, Target) :-
    attribute(Actor, cultural knowledge, V), V > 70,
    attribute(Target, cultural knowledge, V), V < 50.

%% shout_criticism_at_bad_actor
% Action: shout criticism at bad actor
% Source: Ensemble / theatrical-social

action(shout_criticism_at_bad_actor, 'shout criticism at bad actor', social, 1).
action_difficulty(shout_criticism_at_bad_actor, 0.5).
action_duration(shout_criticism_at_bad_actor, 1).
action_category(shout_criticism_at_bad_actor, theatrical_social).
action_source(shout_criticism_at_bad_actor, ensemble).
action_verb(shout_criticism_at_bad_actor, past, 'shout criticism at bad actor').
action_verb(shout_criticism_at_bad_actor, present, 'shout criticism at bad actor').
action_target_type(shout_criticism_at_bad_actor, other).
action_requires_target(shout_criticism_at_bad_actor).
action_range(shout_criticism_at_bad_actor, 5).
action_is_accept(shout_criticism_at_bad_actor).
action_prerequisite(shout_criticism_at_bad_actor, (attribute(Actor, cultural knowledge, V), V > 50)).
action_prerequisite(shout_criticism_at_bad_actor, (trait(Target, security guard))).
action_prerequisite(shout_criticism_at_bad_actor, (trait(Target, awkward))).
action_effect(shout_criticism_at_bad_actor, (modify_network(Target, Actor, affinity, -, 20))).
action_effect(shout_criticism_at_bad_actor, (retract(relationship(Target, Actor, esteem)))).
% Can Actor perform this action?
can_perform(Actor, shout_criticism_at_bad_actor, Target) :-
    attribute(Actor, cultural knowledge, V), V > 50,
    trait(Target, security guard),
    trait(Target, awkward).

