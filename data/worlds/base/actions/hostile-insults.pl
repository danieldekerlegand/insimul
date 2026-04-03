%% Ensemble Actions: hostile-insults
%% Source: data/ensemble/actions/hostile-insults.json
%% Converted: 2026-04-01T20:15:17.342Z
%% Total actions: 29

%% put_down
% Action: PUT DOWN
% Source: Ensemble / hostile-insults

action(put_down, 'PUT DOWN', hostile, 1).
action_difficulty(put_down, 0.5).
action_duration(put_down, 1).
action_category(put_down, hostile_insults).
action_source(put_down, ensemble).
action_verb(put_down, past, 'put down').
action_verb(put_down, present, 'put down').
action_target_type(put_down, self).
action_leads_to(put_down, respond_backhandedly).
action_leads_to(put_down, respond_negatively_to_romance).
can_perform(Actor, put_down) :- true.

%% yell_at
% Action: YELL AT
% Source: Ensemble / hostile-insults

action(yell_at, 'YELL AT', hostile, 1).
action_difficulty(yell_at, 0.5).
action_duration(yell_at, 1).
action_category(yell_at, hostile_insults).
action_source(yell_at, ensemble).
action_verb(yell_at, past, 'yell at').
action_verb(yell_at, present, 'yell at').
action_target_type(yell_at, self).
action_leads_to(yell_at, bark).
action_leads_to(yell_at, hiss).
can_perform(Actor, yell_at) :- true.

%% embarrass
% Action: EMBARRASS
% Source: Ensemble / hostile-insults

action(embarrass, 'EMBARRASS', hostile, 1).
action_difficulty(embarrass, 0.5).
action_duration(embarrass, 1).
action_category(embarrass, hostile_insults).
action_source(embarrass, ensemble).
action_verb(embarrass, past, 'embarrass').
action_verb(embarrass, present, 'embarrass').
action_target_type(embarrass, self).
action_leads_to(embarrass, takes_money_from_financially_dependent_other_and_puts_in_embarrassing_situation).
action_leads_to(embarrass, squander_husband).
action_leads_to(embarrass, greedy_domestique_steals_all_of_rich_man_s_money).
action_leads_to(embarrass, pee_on_someone_s_stuff).
action_leads_to(embarrass, reproach_someone).
action_leads_to(embarrass, embarrass_successfully).
action_leads_to(embarrass, embarrass_unsuccessfully).
can_perform(Actor, embarrass) :- true.

%% insult
% Action: INSULT
% Source: Ensemble / hostile-insults

action(insult, 'INSULT', hostile, 1).
action_difficulty(insult, 0.5).
action_duration(insult, 1).
action_category(insult, hostile_insults).
action_source(insult, ensemble).
action_verb(insult, past, 'insult').
action_verb(insult, present, 'insult').
action_target_type(insult, self).
action_leads_to(insult, insulted).
action_leads_to(insult, feels_competition_refuses_to_stay).
action_leads_to(insult, mocking_woman_insults_man_leads_to_less_affinity_for_women_in_general).
action_leads_to(insult, police_officer_does_not_respect_broke_rich_person_s_status).
action_leads_to(insult, insult_someone_you_don_t_like).
action_leads_to(insult, insult_successfully).
action_leads_to(insult, insult_unsuccessfully).
can_perform(Actor, insult) :- true.

%% insult_honor
% Action: INSULT HONOR
% Source: Ensemble / hostile-insults

action(insult_honor, 'INSULT HONOR', hostile, 1).
action_difficulty(insult_honor, 0.5).
action_duration(insult_honor, 1).
action_category(insult_honor, hostile_insults).
action_source(insult_honor, ensemble).
action_verb(insult_honor, past, 'insult honor').
action_verb(insult_honor, present, 'insult honor').
action_target_type(insult_honor, self).
action_leads_to(insult_honor, reveal_a_dirty_secret).
action_leads_to(insult_honor, call_by_an_embarrassing_surname).
action_leads_to(insult_honor, refuse_to_accept_insult_to_honor).
action_leads_to(insult_honor, insulthonor_successfully).
action_leads_to(insult_honor, insulthonor_unsuccessfully).
can_perform(Actor, insult_honor) :- true.

%% criticize
% Action: CRITICIZE
% Source: Ensemble / hostile-insults

action(criticize, 'CRITICIZE', hostile, 1).
action_difficulty(criticize, 0.5).
action_duration(criticize, 1).
action_category(criticize, hostile_insults).
action_source(criticize, ensemble).
action_verb(criticize, past, 'criticize').
action_verb(criticize, present, 'criticize').
action_target_type(criticize, self).
action_leads_to(criticize, shout_criticism_at_bad_actor).
action_leads_to(criticize, criticize_successfully).
action_leads_to(criticize, criticize_unsuccessfully).
can_perform(Actor, criticize) :- true.

%% takes_money_from_financially_dependent_other_and_puts_in_embarrassing_situation
% Action: takes money from financially dependent other and puts in embarrassing situation
% Source: Ensemble / hostile-insults

action(takes_money_from_financially_dependent_other_and_puts_in_embarrassing_situation, 'takes money from financially dependent other and puts in embarrassing situation', hostile, 1).
action_difficulty(takes_money_from_financially_dependent_other_and_puts_in_embarrassing_situation, 0.5).
action_duration(takes_money_from_financially_dependent_other_and_puts_in_embarrassing_situation, 1).
action_category(takes_money_from_financially_dependent_other_and_puts_in_embarrassing_situation, hostile_insults).
action_source(takes_money_from_financially_dependent_other_and_puts_in_embarrassing_situation, ensemble).
action_parent(takes_money_from_financially_dependent_other_and_puts_in_embarrassing_situation, embarrass).
action_verb(takes_money_from_financially_dependent_other_and_puts_in_embarrassing_situation, past, 'takes money from financially dependent other and puts in embarrassing situation').
action_verb(takes_money_from_financially_dependent_other_and_puts_in_embarrassing_situation, present, 'takes money from financially dependent other and puts in embarrassing situation').
action_target_type(takes_money_from_financially_dependent_other_and_puts_in_embarrassing_situation, other).
action_requires_target(takes_money_from_financially_dependent_other_and_puts_in_embarrassing_situation).
action_range(takes_money_from_financially_dependent_other_and_puts_in_embarrassing_situation, 5).
action_is_accept(takes_money_from_financially_dependent_other_and_puts_in_embarrassing_situation).
action_prerequisite(takes_money_from_financially_dependent_other_and_puts_in_embarrassing_situation, (attribute(Actor, propriety, V), V < 50)).
action_prerequisite(takes_money_from_financially_dependent_other_and_puts_in_embarrassing_situation, (\+ status(Actor, happy))).
action_prerequisite(takes_money_from_financially_dependent_other_and_puts_in_embarrassing_situation, (ensemble_condition(Target, financially dependent on, true))).
action_effect(takes_money_from_financially_dependent_other_and_puts_in_embarrassing_situation, (modify_network(Target, Actor, affinity, -, 15))).
action_effect(takes_money_from_financially_dependent_other_and_puts_in_embarrassing_situation, (assert(trait(Target, poor)))).
action_effect(takes_money_from_financially_dependent_other_and_puts_in_embarrassing_situation, (assert(status(Target, embarrassed)))).
% Can Actor perform this action?
can_perform(Actor, takes_money_from_financially_dependent_other_and_puts_in_embarrassing_situation, Target) :-
    attribute(Actor, propriety, V), V < 50,
    \+ status(Actor, happy),
    ensemble_condition(Target, financially dependent on, true).

%% pee_on_someone_s_stuff
% Action: pee on someone’s stuff
% Source: Ensemble / hostile-insults

action(pee_on_someone_s_stuff, 'pee on someone''s stuff', hostile, 1).
action_difficulty(pee_on_someone_s_stuff, 0.5).
action_duration(pee_on_someone_s_stuff, 1).
action_category(pee_on_someone_s_stuff, hostile_insults).
action_source(pee_on_someone_s_stuff, ensemble).
action_parent(pee_on_someone_s_stuff, embarrass).
action_verb(pee_on_someone_s_stuff, past, 'pee on someone''s stuff').
action_verb(pee_on_someone_s_stuff, present, 'pee on someone''s stuff').
action_target_type(pee_on_someone_s_stuff, other).
action_requires_target(pee_on_someone_s_stuff).
action_range(pee_on_someone_s_stuff, 5).
action_is_accept(pee_on_someone_s_stuff).
action_prerequisite(pee_on_someone_s_stuff, (trait(Actor, child))).
action_prerequisite(pee_on_someone_s_stuff, (ensemble_condition(Target, intimidates, true))).
action_prerequisite(pee_on_someone_s_stuff, (\+ trait(Target, child))).
action_effect(pee_on_someone_s_stuff, (modify_network(Target, Actor, affinity, -, 15))).
action_effect(pee_on_someone_s_stuff, (modify_network(Target, Actor, credibility, -, 15))).
action_effect(pee_on_someone_s_stuff, (assert(status(Actor, happy)))).
action_effect(pee_on_someone_s_stuff, (ensemble_effect(Actor, made a faux pas around, true))).
% Can Actor perform this action?
can_perform(Actor, pee_on_someone_s_stuff, Target) :-
    trait(Actor, child),
    ensemble_condition(Target, intimidates, true),
    \+ trait(Target, child).

%% reproach_someone
% Action: reproach someone
% Source: Ensemble / hostile-insults

action(reproach_someone, 'reproach someone', hostile, 1).
action_difficulty(reproach_someone, 0.5).
action_duration(reproach_someone, 1).
action_category(reproach_someone, hostile_insults).
action_source(reproach_someone, ensemble).
action_parent(reproach_someone, embarrass).
action_verb(reproach_someone, past, 'reproach someone').
action_verb(reproach_someone, present, 'reproach someone').
action_target_type(reproach_someone, other).
action_requires_target(reproach_someone).
action_range(reproach_someone, 5).
action_is_accept(reproach_someone).
action_prerequisite(reproach_someone, (attribute(Actor, self-assuredness, V), V > 50)).
action_prerequisite(reproach_someone, (ensemble_condition(Actor, offended by, true))).
action_prerequisite(reproach_someone, (attribute(Target, sensitiveness, V), V > 50)).
action_effect(reproach_someone, (modify_network(Target, Actor, affinity, -, 10))).
action_effect(reproach_someone, (assert(status(Target, embarrassed)))).
action_effect(reproach_someone, (modify_network(Actor, Target, affinity, -, 10))).
% Can Actor perform this action?
can_perform(Actor, reproach_someone, Target) :-
    attribute(Actor, self-assuredness, V), V > 50,
    ensemble_condition(Actor, offended by, true),
    attribute(Target, sensitiveness, V), V > 50.

%% embarrass_successfully
% Action: embarrass successfully
% Source: Ensemble / hostile-insults

action(embarrass_successfully, 'embarrass successfully', hostile, 1).
action_difficulty(embarrass_successfully, 0.5).
action_duration(embarrass_successfully, 1).
action_category(embarrass_successfully, hostile_insults).
action_source(embarrass_successfully, ensemble).
action_parent(embarrass_successfully, embarrass).
action_verb(embarrass_successfully, past, 'embarrass successfully').
action_verb(embarrass_successfully, present, 'embarrass successfully').
action_target_type(embarrass_successfully, other).
action_requires_target(embarrass_successfully).
action_range(embarrass_successfully, 5).
action_is_accept(embarrass_successfully).
action_effect(embarrass_successfully, (modify_network(Target, Actor, affinity, -, 5))).
can_perform(Actor, embarrass_successfully, Target) :- true.

%% embarrass_unsuccessfully
% Action: embarrass unsuccessfully
% Source: Ensemble / hostile-insults

action(embarrass_unsuccessfully, 'embarrass unsuccessfully', hostile, 1).
action_difficulty(embarrass_unsuccessfully, 0.5).
action_duration(embarrass_unsuccessfully, 1).
action_category(embarrass_unsuccessfully, hostile_insults).
action_source(embarrass_unsuccessfully, ensemble).
action_parent(embarrass_unsuccessfully, embarrass).
action_verb(embarrass_unsuccessfully, past, 'embarrass unsuccessfully').
action_verb(embarrass_unsuccessfully, present, 'embarrass unsuccessfully').
action_target_type(embarrass_unsuccessfully, other).
action_requires_target(embarrass_unsuccessfully).
action_range(embarrass_unsuccessfully, 5).
action_effect(embarrass_unsuccessfully, (modify_network(Target, Actor, affinity, +, 5))).
can_perform(Actor, embarrass_unsuccessfully, Target) :- true.

%% insulted
% Action: insulted
% Source: Ensemble / hostile-insults

action(insulted, 'insulted', hostile, 1).
action_difficulty(insulted, 0.5).
action_duration(insulted, 1).
action_category(insulted, hostile_insults).
action_source(insulted, ensemble).
action_parent(insulted, insult).
action_verb(insulted, past, 'insulted').
action_verb(insulted, present, 'insulted').
action_target_type(insulted, other).
action_requires_target(insulted).
action_range(insulted, 5).
action_is_accept(insulted).
action_prerequisite(insulted, (trait(Actor, devout))).
action_prerequisite(insulted, (network(Target, Actor, affinity, V), V < 50)).
action_prerequisite(insulted, (\+ relationship(Target, Actor, strangers))).
action_effect(insulted, (modify_network(Target, Actor, affinity, -, 10))).
action_effect(insulted, (ensemble_effect(Actor, caught in a lie by, true))).
action_effect(insulted, (modify_attribute(Actor, self-assuredness, -, 15))).
% Can Actor perform this action?
can_perform(Actor, insulted, Target) :-
    trait(Actor, devout),
    network(Target, Actor, affinity, V), V < 50,
    \+ relationship(Target, Actor, strangers).

%% mocking_woman_insults_man_leads_to_less_affinity_for_women_in_general
% Action: mocking woman insults man, leads to less affinity for women in general
% Source: Ensemble / hostile-insults

action(mocking_woman_insults_man_leads_to_less_affinity_for_women_in_general, 'mocking woman insults man, leads to less affinity for women in general', hostile, 1).
action_difficulty(mocking_woman_insults_man_leads_to_less_affinity_for_women_in_general, 0.5).
action_duration(mocking_woman_insults_man_leads_to_less_affinity_for_women_in_general, 1).
action_category(mocking_woman_insults_man_leads_to_less_affinity_for_women_in_general, hostile_insults).
action_source(mocking_woman_insults_man_leads_to_less_affinity_for_women_in_general, ensemble).
action_parent(mocking_woman_insults_man_leads_to_less_affinity_for_women_in_general, insult).
action_verb(mocking_woman_insults_man_leads_to_less_affinity_for_women_in_general, past, 'mocking woman insults man, leads to less affinity for women in general').
action_verb(mocking_woman_insults_man_leads_to_less_affinity_for_women_in_general, present, 'mocking woman insults man, leads to less affinity for women in general').
action_target_type(mocking_woman_insults_man_leads_to_less_affinity_for_women_in_general, other).
action_requires_target(mocking_woman_insults_man_leads_to_less_affinity_for_women_in_general).
action_range(mocking_woman_insults_man_leads_to_less_affinity_for_women_in_general, 5).
action_is_accept(mocking_woman_insults_man_leads_to_less_affinity_for_women_in_general).
action_prerequisite(mocking_woman_insults_man_leads_to_less_affinity_for_women_in_general, (trait(Actor, female))).
action_prerequisite(mocking_woman_insults_man_leads_to_less_affinity_for_women_in_general, (trait(Target, male))).
action_prerequisite(mocking_woman_insults_man_leads_to_less_affinity_for_women_in_general, (trait(Actor, mocking))).
action_prerequisite(mocking_woman_insults_man_leads_to_less_affinity_for_women_in_general, (ensemble_condition(Target, offended by, true))).
action_prerequisite(mocking_woman_insults_man_leads_to_less_affinity_for_women_in_general, (trait('third', female))).
action_effect(mocking_woman_insults_man_leads_to_less_affinity_for_women_in_general, (modify_network(Target, Actor, affinity, -, 20))).
action_effect(mocking_woman_insults_man_leads_to_less_affinity_for_women_in_general, (modify_network(Target, 'third', affinity, -, 5))).
% Can Actor perform this action?
can_perform(Actor, mocking_woman_insults_man_leads_to_less_affinity_for_women_in_general, Target) :-
    trait(Actor, female),
    trait(Target, male),
    trait(Actor, mocking),
    ensemble_condition(Target, offended by, true),
    trait('third', female).

%% insult_successfully
% Action: insult successfully
% Source: Ensemble / hostile-insults

action(insult_successfully, 'insult successfully', hostile, 1).
action_difficulty(insult_successfully, 0.5).
action_duration(insult_successfully, 1).
action_category(insult_successfully, hostile_insults).
action_source(insult_successfully, ensemble).
action_parent(insult_successfully, insult).
action_verb(insult_successfully, past, 'insult successfully').
action_verb(insult_successfully, present, 'insult successfully').
action_target_type(insult_successfully, other).
action_requires_target(insult_successfully).
action_range(insult_successfully, 5).
action_is_accept(insult_successfully).
action_effect(insult_successfully, (modify_network(Target, Actor, affinity, -, 5))).
can_perform(Actor, insult_successfully, Target) :- true.

%% insult_unsuccessfully
% Action: insult unsuccessfully
% Source: Ensemble / hostile-insults

action(insult_unsuccessfully, 'insult unsuccessfully', hostile, 1).
action_difficulty(insult_unsuccessfully, 0.5).
action_duration(insult_unsuccessfully, 1).
action_category(insult_unsuccessfully, hostile_insults).
action_source(insult_unsuccessfully, ensemble).
action_parent(insult_unsuccessfully, insult).
action_verb(insult_unsuccessfully, past, 'insult unsuccessfully').
action_verb(insult_unsuccessfully, present, 'insult unsuccessfully').
action_target_type(insult_unsuccessfully, other).
action_requires_target(insult_unsuccessfully).
action_range(insult_unsuccessfully, 5).
action_effect(insult_unsuccessfully, (modify_network(Target, Actor, affinity, +, 5))).
can_perform(Actor, insult_unsuccessfully, Target) :- true.

%% call_by_an_embarrassing_surname
% Action: call by an embarrassing surname
% Source: Ensemble / hostile-insults

action(call_by_an_embarrassing_surname, 'call by an embarrassing surname', hostile, 1).
action_difficulty(call_by_an_embarrassing_surname, 0.5).
action_duration(call_by_an_embarrassing_surname, 1).
action_category(call_by_an_embarrassing_surname, hostile_insults).
action_source(call_by_an_embarrassing_surname, ensemble).
action_parent(call_by_an_embarrassing_surname, insult_honor).
action_verb(call_by_an_embarrassing_surname, past, 'call by an embarrassing surname').
action_verb(call_by_an_embarrassing_surname, present, 'call by an embarrassing surname').
action_target_type(call_by_an_embarrassing_surname, other).
action_requires_target(call_by_an_embarrassing_surname).
action_range(call_by_an_embarrassing_surname, 5).
action_is_accept(call_by_an_embarrassing_surname).
action_prerequisite(call_by_an_embarrassing_surname, (\+ trait(Actor, virtuous))).
action_prerequisite(call_by_an_embarrassing_surname, (trait(Target, shy))).
action_prerequisite(call_by_an_embarrassing_surname, (attribute(Target, charisma, V), V < 66)).
action_effect(call_by_an_embarrassing_surname, (ensemble_effect(Actor, ridicules, true))).
action_effect(call_by_an_embarrassing_surname, (ensemble_effect(Target, resentful of, true))).
action_effect(call_by_an_embarrassing_surname, (assert(status(Target, embarrassed)))).
% Can Actor perform this action?
can_perform(Actor, call_by_an_embarrassing_surname, Target) :-
    \+ trait(Actor, virtuous),
    trait(Target, shy),
    attribute(Target, charisma, V), V < 66.

%% refuse_to_accept_insult_to_honor
% Action: refuse to accept insult to honor
% Source: Ensemble / hostile-insults

action(refuse_to_accept_insult_to_honor, 'refuse to accept insult to honor', hostile, 1).
action_difficulty(refuse_to_accept_insult_to_honor, 0.5).
action_duration(refuse_to_accept_insult_to_honor, 1).
action_category(refuse_to_accept_insult_to_honor, hostile_insults).
action_source(refuse_to_accept_insult_to_honor, ensemble).
action_parent(refuse_to_accept_insult_to_honor, insult_honor).
action_verb(refuse_to_accept_insult_to_honor, past, 'refuse to accept insult to honor').
action_verb(refuse_to_accept_insult_to_honor, present, 'refuse to accept insult to honor').
action_target_type(refuse_to_accept_insult_to_honor, other).
action_requires_target(refuse_to_accept_insult_to_honor).
action_range(refuse_to_accept_insult_to_honor, 5).
action_prerequisite(refuse_to_accept_insult_to_honor, (ensemble_condition(Actor, offended by, true))).
action_prerequisite(refuse_to_accept_insult_to_honor, (trait(Target, virtuous))).
action_prerequisite(refuse_to_accept_insult_to_honor, (attribute(Target, self-assuredness, V), V > 50)).
action_effect(refuse_to_accept_insult_to_honor, (ensemble_effect(Target, offended by, false))).
action_effect(refuse_to_accept_insult_to_honor, (retract(relationship(Target, Actor, rivals)))).
% Can Actor perform this action?
can_perform(Actor, refuse_to_accept_insult_to_honor, Target) :-
    ensemble_condition(Actor, offended by, true),
    trait(Target, virtuous),
    attribute(Target, self-assuredness, V), V > 50.

%% insulthonor_successfully
% Action: insulthonor successfully
% Source: Ensemble / hostile-insults

action(insulthonor_successfully, 'insulthonor successfully', hostile, 1).
action_difficulty(insulthonor_successfully, 0.5).
action_duration(insulthonor_successfully, 1).
action_category(insulthonor_successfully, hostile_insults).
action_source(insulthonor_successfully, ensemble).
action_parent(insulthonor_successfully, insult_honor).
action_verb(insulthonor_successfully, past, 'insulthonor successfully').
action_verb(insulthonor_successfully, present, 'insulthonor successfully').
action_target_type(insulthonor_successfully, other).
action_requires_target(insulthonor_successfully).
action_range(insulthonor_successfully, 5).
action_is_accept(insulthonor_successfully).
action_effect(insulthonor_successfully, (assert(relationship(Actor, Target, rivals)))).
can_perform(Actor, insulthonor_successfully, Target) :- true.

%% insulthonor_unsuccessfully
% Action: insulthonor unsuccessfully
% Source: Ensemble / hostile-insults

action(insulthonor_unsuccessfully, 'insulthonor unsuccessfully', hostile, 1).
action_difficulty(insulthonor_unsuccessfully, 0.5).
action_duration(insulthonor_unsuccessfully, 1).
action_category(insulthonor_unsuccessfully, hostile_insults).
action_source(insulthonor_unsuccessfully, ensemble).
action_parent(insulthonor_unsuccessfully, insult_honor).
action_verb(insulthonor_unsuccessfully, past, 'insulthonor unsuccessfully').
action_verb(insulthonor_unsuccessfully, present, 'insulthonor unsuccessfully').
action_target_type(insulthonor_unsuccessfully, other).
action_requires_target(insulthonor_unsuccessfully).
action_range(insulthonor_unsuccessfully, 5).
action_effect(insulthonor_unsuccessfully, (retract(relationship(Actor, Target, rivals)))).
can_perform(Actor, insulthonor_unsuccessfully, Target) :- true.

%% blackmail_default_insults
% Action: blackmail-default-insults
% Source: Ensemble / hostile-insults

action(blackmail_default_insults, 'blackmail-default-insults', hostile, 1).
action_difficulty(blackmail_default_insults, 0.5).
action_duration(blackmail_default_insults, 1).
action_category(blackmail_default_insults, hostile_insults).
action_source(blackmail_default_insults, ensemble).
action_verb(blackmail_default_insults, past, 'blackmail-default-insults').
action_verb(blackmail_default_insults, present, 'blackmail-default-insults').
action_target_type(blackmail_default_insults, other).
action_requires_target(blackmail_default_insults).
action_range(blackmail_default_insults, 5).
action_is_accept(blackmail_default_insults).
action_effect(blackmail_default_insults, (assert(relationship(Actor, Target, rivals)))).
can_perform(Actor, blackmail_default_insults, Target) :- true.

%% criticize_successfully
% Action: criticize successfully
% Source: Ensemble / hostile-insults

action(criticize_successfully, 'criticize successfully', hostile, 1).
action_difficulty(criticize_successfully, 0.5).
action_duration(criticize_successfully, 1).
action_category(criticize_successfully, hostile_insults).
action_source(criticize_successfully, ensemble).
action_parent(criticize_successfully, criticize).
action_verb(criticize_successfully, past, 'criticize successfully').
action_verb(criticize_successfully, present, 'criticize successfully').
action_target_type(criticize_successfully, other).
action_requires_target(criticize_successfully).
action_range(criticize_successfully, 5).
action_is_accept(criticize_successfully).
action_effect(criticize_successfully, (retract(relationship(Actor, Target, esteem)))).
can_perform(Actor, criticize_successfully, Target) :- true.

%% criticize_unsuccessfully
% Action: criticize unsuccessfully
% Source: Ensemble / hostile-insults

action(criticize_unsuccessfully, 'criticize unsuccessfully', hostile, 1).
action_difficulty(criticize_unsuccessfully, 0.5).
action_duration(criticize_unsuccessfully, 1).
action_category(criticize_unsuccessfully, hostile_insults).
action_source(criticize_unsuccessfully, ensemble).
action_parent(criticize_unsuccessfully, criticize).
action_verb(criticize_unsuccessfully, past, 'criticize unsuccessfully').
action_verb(criticize_unsuccessfully, present, 'criticize unsuccessfully').
action_target_type(criticize_unsuccessfully, self).
can_perform(Actor, criticize_unsuccessfully) :- true.

%% insult
% Action: Insult
% Source: Ensemble / hostile-insults

action(insult, 'Insult', hostile, 1).
action_difficulty(insult, 0.5).
action_duration(insult, 1).
action_category(insult, hostile_insults).
action_source(insult, ensemble).
action_verb(insult, past, 'insult').
action_verb(insult, present, 'insult').
action_target_type(insult, self).
can_perform(Actor, insult) :- true.

%% respon_neg_to_insult_action
% Action: Respon NEG to insult action
% Source: Ensemble / hostile-insults

action(respon_neg_to_insult_action, 'Respon NEG to insult action', hostile, 1).
action_difficulty(respon_neg_to_insult_action, 0.5).
action_duration(respon_neg_to_insult_action, 1).
action_category(respon_neg_to_insult_action, hostile_insults).
action_source(respon_neg_to_insult_action, ensemble).
action_verb(respon_neg_to_insult_action, past, 'respon neg to insult action').
action_verb(respon_neg_to_insult_action, present, 'respon neg to insult action').
action_target_type(respon_neg_to_insult_action, other).
action_requires_target(respon_neg_to_insult_action).
action_range(respon_neg_to_insult_action, 5).
action_effect(respon_neg_to_insult_action, (modify_network(Actor, Target, friendship, -, 1))).
action_effect(respon_neg_to_insult_action, (modify_network(Actor, Target, antagonism, +, 1))).
can_perform(Actor, respon_neg_to_insult_action, Target) :- true.

%% misunderstand_insult_trustingly_action
% Action: misunderstand insult trustingly action
% Source: Ensemble / hostile-insults

action(misunderstand_insult_trustingly_action, 'misunderstand insult trustingly action', hostile, 1).
action_difficulty(misunderstand_insult_trustingly_action, 0.5).
action_duration(misunderstand_insult_trustingly_action, 1).
action_category(misunderstand_insult_trustingly_action, hostile_insults).
action_source(misunderstand_insult_trustingly_action, ensemble).
action_verb(misunderstand_insult_trustingly_action, past, 'misunderstand insult trustingly action').
action_verb(misunderstand_insult_trustingly_action, present, 'misunderstand insult trustingly action').
action_target_type(misunderstand_insult_trustingly_action, self).
can_perform(Actor, misunderstand_insult_trustingly_action) :- true.

%% respond_positively_and_caring_to_insult_action
% Action: Respond positively and caring to insult action
% Source: Ensemble / hostile-insults

action(respond_positively_and_caring_to_insult_action, 'Respond positively and caring to insult action', hostile, 1).
action_difficulty(respond_positively_and_caring_to_insult_action, 0.5).
action_duration(respond_positively_and_caring_to_insult_action, 1).
action_category(respond_positively_and_caring_to_insult_action, hostile_insults).
action_source(respond_positively_and_caring_to_insult_action, ensemble).
action_verb(respond_positively_and_caring_to_insult_action, past, 'respond positively and caring to insult action').
action_verb(respond_positively_and_caring_to_insult_action, present, 'respond positively and caring to insult action').
action_target_type(respond_positively_and_caring_to_insult_action, other).
action_requires_target(respond_positively_and_caring_to_insult_action).
action_range(respond_positively_and_caring_to_insult_action, 5).
action_effect(respond_positively_and_caring_to_insult_action, (modify_network(Actor, Target, friendship, +, 1))).
can_perform(Actor, respond_positively_and_caring_to_insult_action, Target) :- true.

%% respond_to_insult_neutrally
% Action: Respond to Insult Neutrally
% Source: Ensemble / hostile-insults

action(respond_to_insult_neutrally, 'Respond to Insult Neutrally', hostile, 1).
action_difficulty(respond_to_insult_neutrally, 0.5).
action_duration(respond_to_insult_neutrally, 1).
action_category(respond_to_insult_neutrally, hostile_insults).
action_source(respond_to_insult_neutrally, ensemble).
action_verb(respond_to_insult_neutrally, past, 'respond to insult neutrally').
action_verb(respond_to_insult_neutrally, present, 'respond to insult neutrally').
action_target_type(respond_to_insult_neutrally, self).
can_perform(Actor, respond_to_insult_neutrally) :- true.

%% apologise_for_insult
% Action: apologise for insult
% Source: Ensemble / hostile-insults

action(apologise_for_insult, 'apologise for insult', hostile, 1).
action_difficulty(apologise_for_insult, 0.5).
action_duration(apologise_for_insult, 1).
action_category(apologise_for_insult, hostile_insults).
action_source(apologise_for_insult, ensemble).
action_verb(apologise_for_insult, past, 'apologise for insult').
action_verb(apologise_for_insult, present, 'apologise for insult').
action_target_type(apologise_for_insult, other).
action_requires_target(apologise_for_insult).
action_range(apologise_for_insult, 5).
action_effect(apologise_for_insult, (modify_network(Actor, Target, friendship, +, 1))).
action_effect(apologise_for_insult, (ensemble_effect(Actor, trust, 1))).
can_perform(Actor, apologise_for_insult, Target) :- true.

%% insult_someone_you_don_t_like
% Action: insult someone you don’t like
% Source: Ensemble / hostile-insults

action(insult_someone_you_don_t_like, 'insult someone you don''t like', hostile, 1).
action_difficulty(insult_someone_you_don_t_like, 0.5).
action_duration(insult_someone_you_don_t_like, 1).
action_category(insult_someone_you_don_t_like, hostile_insults).
action_source(insult_someone_you_don_t_like, ensemble).
action_parent(insult_someone_you_don_t_like, insult).
action_verb(insult_someone_you_don_t_like, past, 'insult someone you don''t like').
action_verb(insult_someone_you_don_t_like, present, 'insult someone you don''t like').
action_target_type(insult_someone_you_don_t_like, other).
action_requires_target(insult_someone_you_don_t_like).
action_range(insult_someone_you_don_t_like, 5).
action_is_accept(insult_someone_you_don_t_like).
action_prerequisite(insult_someone_you_don_t_like, (network(Actor, Target, affinity, V), V < 50)).
action_effect(insult_someone_you_don_t_like, (modify_network(Target, Actor, affinity, -, 50))).
% Can Actor perform this action?
can_perform(Actor, insult_someone_you_don_t_like, Target) :-
    network(Actor, Target, affinity, V), V < 50.




