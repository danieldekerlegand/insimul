%% Ensemble Actions: rejection-refusal
%% Source: data/ensemble/actions/rejection-refusal.json
%% Converted: 2026-04-01T20:15:17.345Z
%% Total actions: 7

%% deny
% Action: DENY
% Source: Ensemble / rejection-refusal

action(deny, 'DENY', social, 1).
action_difficulty(deny, 0.5).
action_duration(deny, 1).
action_category(deny, rejection_refusal).
action_source(deny, ensemble).
action_verb(deny, past, 'deny').
action_verb(deny, present, 'deny').
action_target_type(deny, self).
action_leads_to(deny, scowl).
can_perform(Actor, deny) :- true.

%% feels_competition_refuses_to_stay
% Action: feels competition, refuses to stay
% Source: Ensemble / rejection-refusal

action(feels_competition_refuses_to_stay, 'feels competition, refuses to stay', social, 1).
action_difficulty(feels_competition_refuses_to_stay, 0.5).
action_duration(feels_competition_refuses_to_stay, 1).
action_category(feels_competition_refuses_to_stay, rejection_refusal).
action_source(feels_competition_refuses_to_stay, ensemble).
action_verb(feels_competition_refuses_to_stay, past, 'feels competition, refuses to stay').
action_verb(feels_competition_refuses_to_stay, present, 'feels competition, refuses to stay').
action_target_type(feels_competition_refuses_to_stay, other).
action_requires_target(feels_competition_refuses_to_stay).
action_range(feels_competition_refuses_to_stay, 5).
action_is_accept(feels_competition_refuses_to_stay).
action_prerequisite(feels_competition_refuses_to_stay, (attribute(Actor, charisma, V), V < 81)).
action_prerequisite(feels_competition_refuses_to_stay, (trait(Actor, female))).
action_prerequisite(feels_competition_refuses_to_stay, (trait(Actor, beautiful))).
action_prerequisite(feels_competition_refuses_to_stay, (attribute(Target, charisma, V), V > 80)).
action_prerequisite(feels_competition_refuses_to_stay, (trait(Target, female))).
action_prerequisite(feels_competition_refuses_to_stay, (trait(Target, beautiful))).
action_effect(feels_competition_refuses_to_stay, (modify_network(Actor, Target, affinity, -, 30))).
action_effect(feels_competition_refuses_to_stay, (ensemble_effect(Actor, jealous of, true))).
% Can Actor perform this action?
can_perform(Actor, feels_competition_refuses_to_stay, Target) :-
    attribute(Actor, charisma, V), V < 81,
    trait(Actor, female),
    trait(Actor, beautiful),
    attribute(Target, charisma, V), V > 80,
    trait(Target, female),
    trait(Target, beautiful).

%% reject_concurrent_lover
% Action: reject concurrent lover
% Source: Ensemble / rejection-refusal

action(reject_concurrent_lover, 'reject concurrent lover', social, 1).
action_difficulty(reject_concurrent_lover, 0.5).
action_duration(reject_concurrent_lover, 1).
action_category(reject_concurrent_lover, rejection_refusal).
action_source(reject_concurrent_lover, ensemble).
action_verb(reject_concurrent_lover, past, 'reject concurrent lover').
action_verb(reject_concurrent_lover, present, 'reject concurrent lover').
action_target_type(reject_concurrent_lover, other).
action_requires_target(reject_concurrent_lover).
action_range(reject_concurrent_lover, 5).
action_is_accept(reject_concurrent_lover).
action_prerequisite(reject_concurrent_lover, (trait(Actor, female))).
action_prerequisite(reject_concurrent_lover, (trait(Target, male))).
action_prerequisite(reject_concurrent_lover, (trait('third', flirtatious))).
action_prerequisite(reject_concurrent_lover, (network('third', Actor, curiosity, V), V > 80)).
action_prerequisite(reject_concurrent_lover, (relationship(Actor, Target, lovers))).
action_effect(reject_concurrent_lover, (modify_network('third', Actor, curiosity, -, 10))).
action_effect(reject_concurrent_lover, (assert(relationship(Target, Actor, esteem)))).
action_effect(reject_concurrent_lover, (modify_network(Target, Actor, credibility, +, 5))).
action_effect(reject_concurrent_lover, (assert(trait(Actor, virtuous)))).
% Can Actor perform this action?
can_perform(Actor, reject_concurrent_lover, Target) :-
    trait(Actor, female),
    trait(Target, male),
    trait('third', flirtatious),
    network('third', Actor, curiosity, V), V > 80,
    relationship(Actor, Target, lovers).

%% don_t_have
% Action: Don’t have
% Source: Ensemble / rejection-refusal

action(don_t_have, 'Don''t have', social, 1).
action_difficulty(don_t_have, 0.5).
action_duration(don_t_have, 1).
action_category(don_t_have, rejection_refusal).
action_source(don_t_have, ensemble).
action_verb(don_t_have, past, 'don''t have').
action_verb(don_t_have, present, 'don''t have').
action_target_type(don_t_have, self).
can_perform(Actor, don_t_have) :- true.

%% politely_refuse
% Action: Politely refuse
% Source: Ensemble / rejection-refusal

action(politely_refuse, 'Politely refuse', social, 1).
action_difficulty(politely_refuse, 0.5).
action_duration(politely_refuse, 1).
action_category(politely_refuse, rejection_refusal).
action_source(politely_refuse, ensemble).
action_verb(politely_refuse, past, 'politely refuse').
action_verb(politely_refuse, present, 'politely refuse').
action_target_type(politely_refuse, self).
can_perform(Actor, politely_refuse) :- true.

%% angrily_refuse_request
% Action: Angrily refuse request
% Source: Ensemble / rejection-refusal

action(angrily_refuse_request, 'Angrily refuse request', social, 1).
action_difficulty(angrily_refuse_request, 0.5).
action_duration(angrily_refuse_request, 1).
action_category(angrily_refuse_request, rejection_refusal).
action_source(angrily_refuse_request, ensemble).
action_verb(angrily_refuse_request, past, 'angrily refuse request').
action_verb(angrily_refuse_request, present, 'angrily refuse request').
action_target_type(angrily_refuse_request, self).
can_perform(Actor, angrily_refuse_request) :- true.

%% polite_refuse_to_acquire
% Action: Polite refuse to acquire
% Source: Ensemble / rejection-refusal

action(polite_refuse_to_acquire, 'Polite refuse to acquire', social, 1).
action_difficulty(polite_refuse_to_acquire, 0.5).
action_duration(polite_refuse_to_acquire, 1).
action_category(polite_refuse_to_acquire, rejection_refusal).
action_source(polite_refuse_to_acquire, ensemble).
action_verb(polite_refuse_to_acquire, past, 'polite refuse to acquire').
action_verb(polite_refuse_to_acquire, present, 'polite refuse to acquire').
action_target_type(polite_refuse_to_acquire, self).
can_perform(Actor, polite_refuse_to_acquire) :- true.




