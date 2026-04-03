%% Ensemble Actions: romantic-affection
%% Source: data/ensemble/actions/romantic-affection.json
%% Converted: 2026-04-01T20:15:17.345Z
%% Total actions: 11

%% write_love_note
% Action: WRITE LOVE NOTE
% Source: Ensemble / romantic-affection

action(write_love_note, 'WRITE LOVE NOTE', romantic, 1).
action_difficulty(write_love_note, 0.5).
action_duration(write_love_note, 1).
action_category(write_love_note, romantic_affection).
action_source(write_love_note, ensemble).
action_verb(write_love_note, past, 'write love note').
action_verb(write_love_note, present, 'write love note').
action_target_type(write_love_note, self).
action_leads_to(write_love_note, writelovenoteaccept).
action_leads_to(write_love_note, writelovenotereject).
can_perform(Actor, write_love_note) :- true.

%% kiss
% Action: KISS
% Source: Ensemble / romantic-affection

action(kiss, 'KISS', romantic, 1).
action_difficulty(kiss, 0.5).
action_duration(kiss, 1).
action_category(kiss, romantic_affection).
action_source(kiss, ensemble).
action_verb(kiss, past, 'kiss').
action_verb(kiss, present, 'kiss').
action_target_type(kiss, self).
action_leads_to(kiss, kisssuccess).
action_leads_to(kiss, kissfail).
can_perform(Actor, kiss) :- true.

%% hug
% Action: hug
% Source: Ensemble / romantic-affection

action(hug, 'hug', romantic, 1).
action_difficulty(hug, 0.5).
action_duration(hug, 1).
action_category(hug, romantic_affection).
action_source(hug, ensemble).
action_verb(hug, past, 'hug').
action_verb(hug, present, 'hug').
action_target_type(hug, other).
action_requires_target(hug).
action_range(hug, 5).
action_effect(hug, (modify_bond(Actor, Target, kinship, +, 1))).
can_perform(Actor, hug, Target) :- true.

%% kisssuccess
% Action: Kiss <SUCCESS>
% Source: Ensemble / romantic-affection

action(kisssuccess, 'Kiss <SUCCESS>', romantic, 1).
action_difficulty(kisssuccess, 0.5).
action_duration(kisssuccess, 1).
action_category(kisssuccess, romantic_affection).
action_source(kisssuccess, ensemble).
action_parent(kisssuccess, kiss).
action_verb(kisssuccess, past, 'kisssuccess').
action_verb(kisssuccess, present, 'kisssuccess').
action_target_type(kisssuccess, other).
action_requires_target(kisssuccess).
action_range(kisssuccess, 5).
action_prerequisite(kisssuccess, (network(Actor, Target, closeness, V), V > 40)).
action_prerequisite(kisssuccess, (network(Target, Actor, closeness, V), V =:= 10)).
action_prerequisite(kisssuccess, (trait('evilPerson', rival))).
action_effect(kisssuccess, (modify_network(Actor, Target, closeness, +, 100))).
action_effect(kisssuccess, (modify_network(Target, Actor, closeness, +, 100))).
action_effect(kisssuccess, (modify_network(Target, 'evilPerson', closeness, -, 10))).
action_effect(kisssuccess, (modify_network(Actor, 'evilPerson', closeness, -, 10))).
% Can Actor perform this action?
can_perform(Actor, kisssuccess, Target) :-
    network(Actor, Target, closeness, V), V > 40,
    network(Target, Actor, closeness, V), V =:= 10,
    trait('evilPerson', rival).

%% kissfail
% Action: Kiss <FAIL>
% Source: Ensemble / romantic-affection

action(kissfail, 'Kiss <FAIL>', romantic, 1).
action_difficulty(kissfail, 0.5).
action_duration(kissfail, 1).
action_category(kissfail, romantic_affection).
action_source(kissfail, ensemble).
action_parent(kissfail, kiss).
action_verb(kissfail, past, 'kissfail').
action_verb(kissfail, present, 'kissfail').
action_target_type(kissfail, other).
action_requires_target(kissfail).
action_range(kissfail, 5).
action_prerequisite(kissfail, (network(Actor, Target, closeness, V), V > -10)).
action_effect(kissfail, (modify_network(Actor, Target, closeness, -, 100))).
action_effect(kissfail, (modify_network(Target, Actor, closeness, -, 100))).
% Can Actor perform this action?
can_perform(Actor, kissfail, Target) :-
    network(Actor, Target, closeness, V), V > -10.

%% writelovenoteaccept
% Action: Write Love Note <ACCEPT>
% Source: Ensemble / romantic-affection

action(writelovenoteaccept, 'Write Love Note <ACCEPT>', romantic, 1).
action_difficulty(writelovenoteaccept, 0.5).
action_duration(writelovenoteaccept, 1).
action_category(writelovenoteaccept, romantic_affection).
action_source(writelovenoteaccept, ensemble).
action_parent(writelovenoteaccept, write_love_note).
action_verb(writelovenoteaccept, past, 'writelovenoteaccept').
action_verb(writelovenoteaccept, present, 'writelovenoteaccept').
action_target_type(writelovenoteaccept, other).
action_requires_target(writelovenoteaccept).
action_range(writelovenoteaccept, 5).
action_is_accept(writelovenoteaccept).
action_effect(writelovenoteaccept, (modify_network(Actor, Target, closeness, +, 10))).
action_effect(writelovenoteaccept, (modify_network(Target, Actor, closeness, +, 10))).
can_perform(Actor, writelovenoteaccept, Target) :- true.

%% writelovenotereject
% Action: Write Love Note <REJECT>
% Source: Ensemble / romantic-affection

action(writelovenotereject, 'Write Love Note <REJECT>', romantic, 1).
action_difficulty(writelovenotereject, 0.5).
action_duration(writelovenotereject, 1).
action_category(writelovenotereject, romantic_affection).
action_source(writelovenotereject, ensemble).
action_parent(writelovenotereject, write_love_note).
action_verb(writelovenotereject, past, 'writelovenotereject').
action_verb(writelovenotereject, present, 'writelovenotereject').
action_target_type(writelovenotereject, other).
action_requires_target(writelovenotereject).
action_range(writelovenotereject, 5).
action_effect(writelovenotereject, (modify_network(Actor, Target, closeness, +, 10))).
action_effect(writelovenotereject, (ensemble_effect(Actor, romantic failure, true))).
can_perform(Actor, writelovenotereject, Target) :- true.

%% man_professes_passion_for_virtuous_woman_get_rejected_and_loves_her_even_more
% Action: man professes passion for virtuous woman, get rejected and loves her even more
% Source: Ensemble / romantic-affection

action(man_professes_passion_for_virtuous_woman_get_rejected_and_loves_her_even_more, 'man professes passion for virtuous woman, get rejected and loves her even more', romantic, 1).
action_difficulty(man_professes_passion_for_virtuous_woman_get_rejected_and_loves_her_even_more, 0.5).
action_duration(man_professes_passion_for_virtuous_woman_get_rejected_and_loves_her_even_more, 1).
action_category(man_professes_passion_for_virtuous_woman_get_rejected_and_loves_her_even_more, romantic_affection).
action_source(man_professes_passion_for_virtuous_woman_get_rejected_and_loves_her_even_more, ensemble).
action_verb(man_professes_passion_for_virtuous_woman_get_rejected_and_loves_her_even_more, past, 'man professes passion for virtuous woman, get rejected and loves her even more').
action_verb(man_professes_passion_for_virtuous_woman_get_rejected_and_loves_her_even_more, present, 'man professes passion for virtuous woman, get rejected and loves her even more').
action_target_type(man_professes_passion_for_virtuous_woman_get_rejected_and_loves_her_even_more, other).
action_requires_target(man_professes_passion_for_virtuous_woman_get_rejected_and_loves_her_even_more).
action_range(man_professes_passion_for_virtuous_woman_get_rejected_and_loves_her_even_more, 5).
action_prerequisite(man_professes_passion_for_virtuous_woman_get_rejected_and_loves_her_even_more, (attribute(Actor, self-assuredness, V), V > 70)).
action_prerequisite(man_professes_passion_for_virtuous_woman_get_rejected_and_loves_her_even_more, (trait(Actor, male))).
action_prerequisite(man_professes_passion_for_virtuous_woman_get_rejected_and_loves_her_even_more, (attribute(Target, propriety, V), V > 50)).
action_prerequisite(man_professes_passion_for_virtuous_woman_get_rejected_and_loves_her_even_more, (trait(Target, female))).
action_prerequisite(man_professes_passion_for_virtuous_woman_get_rejected_and_loves_her_even_more, (\+ trait(Target, inconsistent))).
action_prerequisite(man_professes_passion_for_virtuous_woman_get_rejected_and_loves_her_even_more, (network(Target, Actor, affinity, V), V < 80)).
action_prerequisite(man_professes_passion_for_virtuous_woman_get_rejected_and_loves_her_even_more, (trait(Actor, flirtatious))).
action_effect(man_professes_passion_for_virtuous_woman_get_rejected_and_loves_her_even_more, (modify_network(Target, Actor, affinity, -, 10))).
action_effect(man_professes_passion_for_virtuous_woman_get_rejected_and_loves_her_even_more, (modify_network(Actor, Target, affinity, +, 20))).
action_effect(man_professes_passion_for_virtuous_woman_get_rejected_and_loves_her_even_more, (assert(status(Target, embarrassed)))).
action_effect(man_professes_passion_for_virtuous_woman_get_rejected_and_loves_her_even_more, (assert(status(Target, gobsmacked)))).
% Can Actor perform this action?
can_perform(Actor, man_professes_passion_for_virtuous_woman_get_rejected_and_loves_her_even_more, Target) :-
    attribute(Actor, self-assuredness, V), V > 70,
    trait(Actor, male),
    attribute(Target, propriety, V), V > 50,
    trait(Target, female),
    \+ trait(Target, inconsistent),
    network(Target, Actor, affinity, V), V < 80,
    trait(Actor, flirtatious).

%% discovered_cheater_refused_a_kiss
% Action: discovered cheater refused a kiss
% Source: Ensemble / romantic-affection

action(discovered_cheater_refused_a_kiss, 'discovered cheater refused a kiss', romantic, 1).
action_difficulty(discovered_cheater_refused_a_kiss, 0.5).
action_duration(discovered_cheater_refused_a_kiss, 1).
action_category(discovered_cheater_refused_a_kiss, romantic_affection).
action_source(discovered_cheater_refused_a_kiss, ensemble).
action_verb(discovered_cheater_refused_a_kiss, past, 'discovered cheater refused a kiss').
action_verb(discovered_cheater_refused_a_kiss, present, 'discovered cheater refused a kiss').
action_target_type(discovered_cheater_refused_a_kiss, other).
action_requires_target(discovered_cheater_refused_a_kiss).
action_range(discovered_cheater_refused_a_kiss, 5).
action_prerequisite(discovered_cheater_refused_a_kiss, (relationship(Actor, Target, lovers))).
action_prerequisite(discovered_cheater_refused_a_kiss, (relationship(Actor, Someone, lovers))).
action_effect(discovered_cheater_refused_a_kiss, (modify_network(Target, Actor, credibility, -, 15))).
action_effect(discovered_cheater_refused_a_kiss, (modify_network(Actor, Target, affinity, -, 10))).
% Can Actor perform this action?
can_perform(Actor, discovered_cheater_refused_a_kiss, Target) :-
    relationship(Actor, Target, lovers),
    relationship(Actor, Someone, lovers).

%% embrace_someone_in_public_a
% Action: embrace someone in public (a)
% Source: Ensemble / romantic-affection

action(embrace_someone_in_public_a, 'embrace someone in public (a)', romantic, 1).
action_difficulty(embrace_someone_in_public_a, 0.5).
action_duration(embrace_someone_in_public_a, 1).
action_category(embrace_someone_in_public_a, romantic_affection).
action_source(embrace_someone_in_public_a, ensemble).
action_verb(embrace_someone_in_public_a, past, 'embrace someone in public (a)').
action_verb(embrace_someone_in_public_a, present, 'embrace someone in public (a)').
action_target_type(embrace_someone_in_public_a, other).
action_requires_target(embrace_someone_in_public_a).
action_range(embrace_someone_in_public_a, 5).
action_is_accept(embrace_someone_in_public_a).
action_prerequisite(embrace_someone_in_public_a, (attribute(Actor, propriety, V), V < 50)).
action_prerequisite(embrace_someone_in_public_a, (network(Actor, Target, affinity, V), V > 70)).
action_prerequisite(embrace_someone_in_public_a, (network(Target, Actor, affinity, V), V > 60)).
action_effect(embrace_someone_in_public_a, (modify_network(Target, Actor, curiosity, +, 15))).
% Can Actor perform this action?
can_perform(Actor, embrace_someone_in_public_a, Target) :-
    attribute(Actor, propriety, V), V < 50,
    network(Actor, Target, affinity, V), V > 70,
    network(Target, Actor, affinity, V), V > 60.

%% embrace_someone_in_public_r
% Action: embrace someone in public (r)
% Source: Ensemble / romantic-affection

action(embrace_someone_in_public_r, 'embrace someone in public (r)', romantic, 1).
action_difficulty(embrace_someone_in_public_r, 0.5).
action_duration(embrace_someone_in_public_r, 1).
action_category(embrace_someone_in_public_r, romantic_affection).
action_source(embrace_someone_in_public_r, ensemble).
action_verb(embrace_someone_in_public_r, past, 'embrace someone in public (r)').
action_verb(embrace_someone_in_public_r, present, 'embrace someone in public (r)').
action_target_type(embrace_someone_in_public_r, other).
action_requires_target(embrace_someone_in_public_r).
action_range(embrace_someone_in_public_r, 5).
action_prerequisite(embrace_someone_in_public_r, (attribute(Actor, propriety, V), V < 50)).
action_prerequisite(embrace_someone_in_public_r, (attribute(Target, propriety, V), V > 50)).
action_prerequisite(embrace_someone_in_public_r, (network(Actor, Target, affinity, V), V > 70)).
action_prerequisite(embrace_someone_in_public_r, (network(Target, Actor, affinity, V), V < 50)).
action_effect(embrace_someone_in_public_r, (assert(status(Target, embarrassed)))).
action_effect(embrace_someone_in_public_r, (modify_network(Target, Actor, curiosity, +, 15))).
% Can Actor perform this action?
can_perform(Actor, embrace_someone_in_public_r, Target) :-
    attribute(Actor, propriety, V), V < 50,
    attribute(Target, propriety, V), V > 50,
    network(Actor, Target, affinity, V), V > 70,
    network(Target, Actor, affinity, V), V < 50.

