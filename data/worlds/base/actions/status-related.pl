%% Ensemble Actions: status-related
%% Source: data/ensemble/actions/status-related.json
%% Converted: 2026-04-01T20:15:17.347Z
%% Total actions: 3

%% dressing_up_compared_to_one_s_social_rank
% Action: dressing up compared to one’s social rank
% Source: Ensemble / status-related

action(dressing_up_compared_to_one_s_social_rank, 'dressing up compared to one''s social rank', social, 1).
action_difficulty(dressing_up_compared_to_one_s_social_rank, 0.5).
action_duration(dressing_up_compared_to_one_s_social_rank, 1).
action_category(dressing_up_compared_to_one_s_social_rank, status_related).
action_source(dressing_up_compared_to_one_s_social_rank, ensemble).
action_verb(dressing_up_compared_to_one_s_social_rank, past, 'dressing up compared to one''s social rank').
action_verb(dressing_up_compared_to_one_s_social_rank, present, 'dressing up compared to one''s social rank').
action_target_type(dressing_up_compared_to_one_s_social_rank, other).
action_requires_target(dressing_up_compared_to_one_s_social_rank).
action_range(dressing_up_compared_to_one_s_social_rank, 5).
action_is_accept(dressing_up_compared_to_one_s_social_rank).
action_prerequisite(dressing_up_compared_to_one_s_social_rank, (trait(Actor, provincial))).
action_prerequisite(dressing_up_compared_to_one_s_social_rank, (ensemble_condition(Actor, financially dependent on, true))).
action_prerequisite(dressing_up_compared_to_one_s_social_rank, (relationship(Actor, Target, married))).
action_prerequisite(dressing_up_compared_to_one_s_social_rank, (trait(Actor, elegantly dressed))).
action_prerequisite(dressing_up_compared_to_one_s_social_rank, (trait(Actor, wearing a first responder uniform))).
action_prerequisite(dressing_up_compared_to_one_s_social_rank, (trait(Target, attendee))).
action_prerequisite(dressing_up_compared_to_one_s_social_rank, (\+ trait(Target, poor))).
action_prerequisite(dressing_up_compared_to_one_s_social_rank, (\+ trait(Target, provincial))).
action_effect(dressing_up_compared_to_one_s_social_rank, (modify_network(Actor, 'other', credibility, +, 10))).
action_effect(dressing_up_compared_to_one_s_social_rank, (modify_attribute(Actor, self-assuredness, +, 10))).
action_effect(dressing_up_compared_to_one_s_social_rank, (modify_network(Target, Actor, affinity, +, 3))).
action_effect(dressing_up_compared_to_one_s_social_rank, (modify_attribute(Actor, social standing, +, 5))).
action_effect(dressing_up_compared_to_one_s_social_rank, (modify_attribute(Actor, charisma, +, 10))).
action_effect(dressing_up_compared_to_one_s_social_rank, (modify_network('other', Actor, affinity, +, 3))).
% Can Actor perform this action?
can_perform(Actor, dressing_up_compared_to_one_s_social_rank, Target) :-
    trait(Actor, provincial),
    ensemble_condition(Actor, financially dependent on, true),
    relationship(Actor, Target, married),
    trait(Actor, elegantly dressed),
    trait(Actor, wearing a first responder uniform),
    trait(Target, attendee),
    \+ trait(Target, poor),
    \+ trait(Target, provincial).

%% insist_on_low_status_to_drive_off_high_status_lover
% Action: insist on low status to drive off high status lover
% Source: Ensemble / status-related

action(insist_on_low_status_to_drive_off_high_status_lover, 'insist on low status to drive off high status lover', social, 1).
action_difficulty(insist_on_low_status_to_drive_off_high_status_lover, 0.5).
action_duration(insist_on_low_status_to_drive_off_high_status_lover, 1).
action_category(insist_on_low_status_to_drive_off_high_status_lover, status_related).
action_source(insist_on_low_status_to_drive_off_high_status_lover, ensemble).
action_verb(insist_on_low_status_to_drive_off_high_status_lover, past, 'insist on low status to drive off high status lover').
action_verb(insist_on_low_status_to_drive_off_high_status_lover, present, 'insist on low status to drive off high status lover').
action_target_type(insist_on_low_status_to_drive_off_high_status_lover, other).
action_requires_target(insist_on_low_status_to_drive_off_high_status_lover).
action_range(insist_on_low_status_to_drive_off_high_status_lover, 5).
action_prerequisite(insist_on_low_status_to_drive_off_high_status_lover, (\+ trait(Actor, rich))).
action_prerequisite(insist_on_low_status_to_drive_off_high_status_lover, (trait(Target, rich))).
action_prerequisite(insist_on_low_status_to_drive_off_high_status_lover, (trait(Actor, virtuous))).
action_prerequisite(insist_on_low_status_to_drive_off_high_status_lover, (attribute(Actor, sensitiveness, V), V > 50)).
action_effect(insist_on_low_status_to_drive_off_high_status_lover, (modify_network(Target, Actor, affinity, +, 10))).
action_effect(insist_on_low_status_to_drive_off_high_status_lover, (modify_network(Target, Actor, curiosity, +, 10))).
action_effect(insist_on_low_status_to_drive_off_high_status_lover, (modify_attribute(Actor, charisma, +, 5))).
action_effect(insist_on_low_status_to_drive_off_high_status_lover, (assert(status(Actor, flattered)))).
% Can Actor perform this action?
can_perform(Actor, insist_on_low_status_to_drive_off_high_status_lover, Target) :-
    \+ trait(Actor, rich),
    trait(Target, rich),
    trait(Actor, virtuous),
    attribute(Actor, sensitiveness, V), V > 50.

%% dress_up_as_stranger
% Action: dress up as stranger
% Source: Ensemble / status-related

action(dress_up_as_stranger, 'dress up as stranger', social, 1).
action_difficulty(dress_up_as_stranger, 0.5).
action_duration(dress_up_as_stranger, 1).
action_category(dress_up_as_stranger, status_related).
action_source(dress_up_as_stranger, ensemble).
action_verb(dress_up_as_stranger, past, 'dress up as stranger').
action_verb(dress_up_as_stranger, present, 'dress up as stranger').
action_target_type(dress_up_as_stranger, other).
action_requires_target(dress_up_as_stranger).
action_range(dress_up_as_stranger, 5).
action_prerequisite(dress_up_as_stranger, (trait(Actor, eccentric))).
action_prerequisite(dress_up_as_stranger, (trait(Actor, male))).
action_prerequisite(dress_up_as_stranger, (trait(Target, female))).
action_prerequisite(dress_up_as_stranger, (\+ trait(Target, eccentric))).
action_prerequisite(dress_up_as_stranger, (relationship(Target, Actor, strangers))).
action_effect(dress_up_as_stranger, (modify_network(Target, Actor, affinity, -, 5))).
action_effect(dress_up_as_stranger, (ensemble_effect(Actor, made a faux pas around, true))).
% Can Actor perform this action?
can_perform(Actor, dress_up_as_stranger, Target) :-
    trait(Actor, eccentric),
    trait(Actor, male),
    trait(Target, female),
    \+ trait(Target, eccentric),
    relationship(Target, Actor, strangers).




