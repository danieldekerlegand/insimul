%% Ensemble Actions: general
%% Source: data/ensemble/actions/general.json
%% Converted: 2026-04-01T20:15:17.341Z
%% Total actions: 45

%% lift_weights
% Action: LIFT WEIGHTS
% Source: Ensemble / general

action(lift_weights, 'LIFT WEIGHTS', social, 1).
action_difficulty(lift_weights, 0.5).
action_duration(lift_weights, 1).
action_category(lift_weights, general).
action_source(lift_weights, ensemble).
action_verb(lift_weights, past, 'lift weights').
action_verb(lift_weights, present, 'lift weights').
action_target_type(lift_weights, self).
action_leads_to(lift_weights, weightliftsuccess).
action_leads_to(lift_weights, weightliftfail).
can_perform(Actor, lift_weights) :- true.

%% true_but_partial_explanation_turns_into_open_conflict
% Action: true but partial explanation turns into open conflict
% Source: Ensemble / general

action(true_but_partial_explanation_turns_into_open_conflict, 'true but partial explanation turns into open conflict', social, 1).
action_difficulty(true_but_partial_explanation_turns_into_open_conflict, 0.5).
action_duration(true_but_partial_explanation_turns_into_open_conflict, 1).
action_category(true_but_partial_explanation_turns_into_open_conflict, general).
action_source(true_but_partial_explanation_turns_into_open_conflict, ensemble).
action_verb(true_but_partial_explanation_turns_into_open_conflict, past, 'true but partial explanation turns into open conflict').
action_verb(true_but_partial_explanation_turns_into_open_conflict, present, 'true but partial explanation turns into open conflict').
action_target_type(true_but_partial_explanation_turns_into_open_conflict, other).
action_requires_target(true_but_partial_explanation_turns_into_open_conflict).
action_range(true_but_partial_explanation_turns_into_open_conflict, 5).
action_prerequisite(true_but_partial_explanation_turns_into_open_conflict, (\+ relationship(Actor, Target, ally))).
action_prerequisite(true_but_partial_explanation_turns_into_open_conflict, (network(Target, Actor, affinity, V), V < 50)).
action_prerequisite(true_but_partial_explanation_turns_into_open_conflict, (network(Target, Actor, credibility, V), V < 50)).
action_prerequisite(true_but_partial_explanation_turns_into_open_conflict, (relationship(Target, Someone, ally))).
action_effect(true_but_partial_explanation_turns_into_open_conflict, (modify_network(Target, Actor, affinity, -, 10))).
action_effect(true_but_partial_explanation_turns_into_open_conflict, (modify_network(Actor, Target, affinity, -, 15))).
action_effect(true_but_partial_explanation_turns_into_open_conflict, (modify_network(Someone, Actor, affinity, -, 10))).
action_effect(true_but_partial_explanation_turns_into_open_conflict, (modify_network(Someone, Actor, credibility, -, 10))).
% Can Actor perform this action?
can_perform(Actor, true_but_partial_explanation_turns_into_open_conflict, Target) :-
    \+ relationship(Actor, Target, ally),
    network(Target, Actor, affinity, V), V < 50,
    network(Target, Actor, credibility, V), V < 50,
    relationship(Target, Someone, ally).

%% too_tired_for_gossips
% Action: too tired for gossips
% Source: Ensemble / general

action(too_tired_for_gossips, 'too tired for gossips', social, 1).
action_difficulty(too_tired_for_gossips, 0.5).
action_duration(too_tired_for_gossips, 1).
action_category(too_tired_for_gossips, general).
action_source(too_tired_for_gossips, ensemble).
action_verb(too_tired_for_gossips, past, 'too tired for gossips').
action_verb(too_tired_for_gossips, present, 'too tired for gossips').
action_target_type(too_tired_for_gossips, other).
action_requires_target(too_tired_for_gossips).
action_range(too_tired_for_gossips, 5).
action_prerequisite(too_tired_for_gossips, (attribute(Actor, propriety, V), V < 50)).
action_prerequisite(too_tired_for_gossips, (network(Actor, Target, affinity, V), V > 60)).
action_prerequisite(too_tired_for_gossips, (status(Target, tired))).
action_effect(too_tired_for_gossips, (modify_network(Target, Actor, curiosity, -, 15))).
action_effect(too_tired_for_gossips, (modify_network(Target, Actor, affinity, -, 15))).
action_effect(too_tired_for_gossips, (modify_network(Target, Actor, emulation, -, 5))).
% Can Actor perform this action?
can_perform(Actor, too_tired_for_gossips, Target) :-
    attribute(Actor, propriety, V), V < 50,
    network(Actor, Target, affinity, V), V > 60,
    status(Target, tired).

%% glorieuse_making_eyes_at_someone
% Action: glorieuse making eyes at someone
% Source: Ensemble / general

action(glorieuse_making_eyes_at_someone, 'glorieuse making eyes at someone', social, 1).
action_difficulty(glorieuse_making_eyes_at_someone, 0.5).
action_duration(glorieuse_making_eyes_at_someone, 1).
action_category(glorieuse_making_eyes_at_someone, general).
action_source(glorieuse_making_eyes_at_someone, ensemble).
action_verb(glorieuse_making_eyes_at_someone, past, 'glorieuse making eyes at someone').
action_verb(glorieuse_making_eyes_at_someone, present, 'glorieuse making eyes at someone').
action_target_type(glorieuse_making_eyes_at_someone, other).
action_requires_target(glorieuse_making_eyes_at_someone).
action_range(glorieuse_making_eyes_at_someone, 5).
action_is_accept(glorieuse_making_eyes_at_someone).
action_prerequisite(glorieuse_making_eyes_at_someone, (trait(Actor, intimidating))).
action_prerequisite(glorieuse_making_eyes_at_someone, (attribute(Actor, charisma, V), V > 50)).
action_prerequisite(glorieuse_making_eyes_at_someone, (\+ trait(Actor, virtuous))).
action_prerequisite(glorieuse_making_eyes_at_someone, (trait(Target, male))).
action_prerequisite(glorieuse_making_eyes_at_someone, (trait(Actor, female))).
action_effect(glorieuse_making_eyes_at_someone, (modify_network(Target, Actor, curiosity, +, 7))).
action_effect(glorieuse_making_eyes_at_someone, (ensemble_effect(Actor, intimidates, true))).
action_effect(glorieuse_making_eyes_at_someone, (modify_network(Target, Actor, affinity, +, 5))).
% Can Actor perform this action?
can_perform(Actor, glorieuse_making_eyes_at_someone, Target) :-
    trait(Actor, intimidating),
    attribute(Actor, charisma, V), V > 50,
    \+ trait(Actor, virtuous),
    trait(Target, male),
    trait(Actor, female).

%% eccentric_unattractive_man_prefers_staying_on_his_own_a
% Action: eccentric, unattractive man prefers staying on his own (a)
% Source: Ensemble / general

action(eccentric_unattractive_man_prefers_staying_on_his_own_a, 'eccentric, unattractive man prefers staying on his own (a)', social, 1).
action_difficulty(eccentric_unattractive_man_prefers_staying_on_his_own_a, 0.5).
action_duration(eccentric_unattractive_man_prefers_staying_on_his_own_a, 1).
action_category(eccentric_unattractive_man_prefers_staying_on_his_own_a, general).
action_source(eccentric_unattractive_man_prefers_staying_on_his_own_a, ensemble).
action_verb(eccentric_unattractive_man_prefers_staying_on_his_own_a, past, 'eccentric, unattractive man prefers staying on his own (a)').
action_verb(eccentric_unattractive_man_prefers_staying_on_his_own_a, present, 'eccentric, unattractive man prefers staying on his own (a)').
action_target_type(eccentric_unattractive_man_prefers_staying_on_his_own_a, other).
action_requires_target(eccentric_unattractive_man_prefers_staying_on_his_own_a).
action_range(eccentric_unattractive_man_prefers_staying_on_his_own_a, 5).
action_is_accept(eccentric_unattractive_man_prefers_staying_on_his_own_a).
action_prerequisite(eccentric_unattractive_man_prefers_staying_on_his_own_a, (attribute(Actor, charisma, V), V < 30)).
action_prerequisite(eccentric_unattractive_man_prefers_staying_on_his_own_a, (trait(Actor, eccentric))).
action_effect(eccentric_unattractive_man_prefers_staying_on_his_own_a, (modify_network(Target, Actor, affinity, -, 5))).
action_effect(eccentric_unattractive_man_prefers_staying_on_his_own_a, (modify_network(Target, Actor, curiosity, -, 30))).
% Can Actor perform this action?
can_perform(Actor, eccentric_unattractive_man_prefers_staying_on_his_own_a, Target) :-
    attribute(Actor, charisma, V), V < 30,
    trait(Actor, eccentric).

%% blendin_successfully
% Action: blendin successfully
% Source: Ensemble / general

action(blendin_successfully, 'blendin successfully', social, 1).
action_difficulty(blendin_successfully, 0.5).
action_duration(blendin_successfully, 1).
action_category(blendin_successfully, general).
action_source(blendin_successfully, ensemble).
action_verb(blendin_successfully, past, 'blendin successfully').
action_verb(blendin_successfully, present, 'blendin successfully').
action_target_type(blendin_successfully, self).
action_is_accept(blendin_successfully).
can_perform(Actor, blendin_successfully) :- true.

%% blendin_unsuccessfully
% Action: blendin unsuccessfully
% Source: Ensemble / general

action(blendin_unsuccessfully, 'blendin unsuccessfully', social, 1).
action_difficulty(blendin_unsuccessfully, 0.5).
action_duration(blendin_unsuccessfully, 1).
action_category(blendin_unsuccessfully, general).
action_source(blendin_unsuccessfully, ensemble).
action_verb(blendin_unsuccessfully, past, 'blendin unsuccessfully').
action_verb(blendin_unsuccessfully, present, 'blendin unsuccessfully').
action_target_type(blendin_unsuccessfully, other).
action_requires_target(blendin_unsuccessfully).
action_range(blendin_unsuccessfully, 5).
action_effect(blendin_unsuccessfully, (modify_network(Target, Actor, curiosity, +, 5))).
can_perform(Actor, blendin_unsuccessfully, Target) :- true.

%% virtuous_behavior_is_convincing_to_friend_results_in_esteem
% Action: virtuous behavior is convincing to friend, results in esteem
% Source: Ensemble / general

action(virtuous_behavior_is_convincing_to_friend_results_in_esteem, 'virtuous behavior is convincing to friend, results in esteem', social, 1).
action_difficulty(virtuous_behavior_is_convincing_to_friend_results_in_esteem, 0.5).
action_duration(virtuous_behavior_is_convincing_to_friend_results_in_esteem, 1).
action_category(virtuous_behavior_is_convincing_to_friend_results_in_esteem, general).
action_source(virtuous_behavior_is_convincing_to_friend_results_in_esteem, ensemble).
action_verb(virtuous_behavior_is_convincing_to_friend_results_in_esteem, past, 'virtuous behavior is convincing to friend, results in esteem').
action_verb(virtuous_behavior_is_convincing_to_friend_results_in_esteem, present, 'virtuous behavior is convincing to friend, results in esteem').
action_target_type(virtuous_behavior_is_convincing_to_friend_results_in_esteem, other).
action_requires_target(virtuous_behavior_is_convincing_to_friend_results_in_esteem).
action_range(virtuous_behavior_is_convincing_to_friend_results_in_esteem, 5).
action_is_accept(virtuous_behavior_is_convincing_to_friend_results_in_esteem).
action_prerequisite(virtuous_behavior_is_convincing_to_friend_results_in_esteem, (relationship(Actor, Target, friends))).
action_prerequisite(virtuous_behavior_is_convincing_to_friend_results_in_esteem, (trait(Target, virtuous))).
action_prerequisite(virtuous_behavior_is_convincing_to_friend_results_in_esteem, (trait(Target, devout))).
action_prerequisite(virtuous_behavior_is_convincing_to_friend_results_in_esteem, (trait(Actor, virtuous))).
action_effect(virtuous_behavior_is_convincing_to_friend_results_in_esteem, (assert(relationship(Actor, Target, esteem)))).
% Can Actor perform this action?
can_perform(Actor, virtuous_behavior_is_convincing_to_friend_results_in_esteem, Target) :-
    relationship(Actor, Target, friends),
    trait(Target, virtuous),
    trait(Target, devout),
    trait(Actor, virtuous).

%% have_but_say_they_don_t
% Action: Have but say they don’t
% Source: Ensemble / general

action(have_but_say_they_don_t, 'Have but say they don''t', social, 1).
action_difficulty(have_but_say_they_don_t, 0.5).
action_duration(have_but_say_they_don_t, 1).
action_category(have_but_say_they_don_t, general).
action_source(have_but_say_they_don_t, ensemble).
action_verb(have_but_say_they_don_t, past, 'have but say they don''t').
action_verb(have_but_say_they_don_t, present, 'have but say they don''t').
action_target_type(have_but_say_they_don_t, self).
can_perform(Actor, have_but_say_they_don_t) :- true.

%% has_thing
% Action: Has thing
% Source: Ensemble / general

action(has_thing, 'Has thing', social, 1).
action_difficulty(has_thing, 0.5).
action_duration(has_thing, 1).
action_category(has_thing, general).
action_source(has_thing, ensemble).
action_verb(has_thing, past, 'has thing').
action_verb(has_thing, present, 'has thing').
action_target_type(has_thing, self).
can_perform(Actor, has_thing) :- true.

%% gladly_acquire_thing
% Action: Gladly acquire thing
% Source: Ensemble / general

action(gladly_acquire_thing, 'Gladly acquire thing', social, 1).
action_difficulty(gladly_acquire_thing, 0.5).
action_duration(gladly_acquire_thing, 1).
action_category(gladly_acquire_thing, general).
action_source(gladly_acquire_thing, ensemble).
action_verb(gladly_acquire_thing, past, 'gladly acquire thing').
action_verb(gladly_acquire_thing, present, 'gladly acquire thing').
action_target_type(gladly_acquire_thing, other).
action_requires_target(gladly_acquire_thing).
action_range(gladly_acquire_thing, 5).
action_effect(gladly_acquire_thing, (modify_network(Actor, Target, indebted, +, 1))).
can_perform(Actor, gladly_acquire_thing, Target) :- true.

%% hate
% Action: Hate
% Source: Ensemble / general

action(hate, 'Hate', social, 1).
action_difficulty(hate, 0.5).
action_duration(hate, 1).
action_category(hate, general).
action_source(hate, ensemble).
action_verb(hate, past, 'hate').
action_verb(hate, present, 'hate').
action_target_type(hate, other).
action_requires_target(hate).
action_range(hate, 5).
action_effect(hate, (modify_network(Actor, Target, antagonism, +, 5))).
can_perform(Actor, hate, Target) :- true.

%% very_positive_towards_subject
% Action: Very positive towards Subject
% Source: Ensemble / general

action(very_positive_towards_subject, 'Very positive towards Subject', social, 1).
action_difficulty(very_positive_towards_subject, 0.5).
action_duration(very_positive_towards_subject, 1).
action_category(very_positive_towards_subject, general).
action_source(very_positive_towards_subject, ensemble).
action_verb(very_positive_towards_subject, past, 'very positive towards subject').
action_verb(very_positive_towards_subject, present, 'very positive towards subject').
action_target_type(very_positive_towards_subject, self).
can_perform(Actor, very_positive_towards_subject) :- true.

%% positive_towards_subject
% Action: Positive towards subject
% Source: Ensemble / general

action(positive_towards_subject, 'Positive towards subject', social, 1).
action_difficulty(positive_towards_subject, 0.5).
action_duration(positive_towards_subject, 1).
action_category(positive_towards_subject, general).
action_source(positive_towards_subject, ensemble).
action_verb(positive_towards_subject, past, 'positive towards subject').
action_verb(positive_towards_subject, present, 'positive towards subject').
action_target_type(positive_towards_subject, self).
can_perform(Actor, positive_towards_subject) :- true.

%% indifferent_towards_subject_answer
% Action: Indifferent towards subject answer
% Source: Ensemble / general

action(indifferent_towards_subject_answer, 'Indifferent towards subject answer', social, 1).
action_difficulty(indifferent_towards_subject_answer, 0.5).
action_duration(indifferent_towards_subject_answer, 1).
action_category(indifferent_towards_subject_answer, general).
action_source(indifferent_towards_subject_answer, ensemble).
action_verb(indifferent_towards_subject_answer, past, 'indifferent towards subject answer').
action_verb(indifferent_towards_subject_answer, present, 'indifferent towards subject answer').
action_target_type(indifferent_towards_subject_answer, self).
can_perform(Actor, indifferent_towards_subject_answer) :- true.

%% what_should_we_get
% Action: What should we get?
% Source: Ensemble / general

action(what_should_we_get, 'What should we get?', social, 1).
action_difficulty(what_should_we_get, 0.5).
action_duration(what_should_we_get, 1).
action_category(what_should_we_get, general).
action_source(what_should_we_get, ensemble).
action_verb(what_should_we_get, past, 'what should we get?').
action_verb(what_should_we_get, present, 'what should we get?').
action_target_type(what_should_we_get, self).
can_perform(Actor, what_should_we_get) :- true.

%% x_thinks_they_know_what_y_knows_and_more
% Action: %x% thinks they know what %y% knows and more!
% Source: Ensemble / general

action(x_thinks_they_know_what_y_knows_and_more, '%x% thinks they know what %y% knows and more!', social, 1).
action_difficulty(x_thinks_they_know_what_y_knows_and_more, 0.5).
action_duration(x_thinks_they_know_what_y_knows_and_more, 1).
action_category(x_thinks_they_know_what_y_knows_and_more, general).
action_source(x_thinks_they_know_what_y_knows_and_more, ensemble).
action_verb(x_thinks_they_know_what_y_knows_and_more, past, '%x% thinks they know what %y% knows and more!').
action_verb(x_thinks_they_know_what_y_knows_and_more, present, '%x% thinks they know what %y% knows and more!').
action_target_type(x_thinks_they_know_what_y_knows_and_more, other).
action_requires_target(x_thinks_they_know_what_y_knows_and_more).
action_range(x_thinks_they_know_what_y_knows_and_more, 5).
action_effect(x_thinks_they_know_what_y_knows_and_more, (modify_network(Actor, Target, respect, +, 1))).
can_perform(Actor, x_thinks_they_know_what_y_knows_and_more, Target) :- true.

%% ok_whatever
% Action: Ok, whatever
% Source: Ensemble / general

action(ok_whatever, 'Ok, whatever', social, 1).
action_difficulty(ok_whatever, 0.5).
action_duration(ok_whatever, 1).
action_category(ok_whatever, general).
action_source(ok_whatever, ensemble).
action_verb(ok_whatever, past, 'ok, whatever').
action_verb(ok_whatever, present, 'ok, whatever').
action_target_type(ok_whatever, other).
action_requires_target(ok_whatever).
action_range(ok_whatever, 5).
action_effect(ok_whatever, (modify_network(Actor, Target, friendship, -, 1))).
action_effect(ok_whatever, (modify_network(Actor, Target, respect, -, 1))).
can_perform(Actor, ok_whatever, Target) :- true.

%% shut_them_down
% Action: Shut them down!
% Source: Ensemble / general

action(shut_them_down, 'Shut them down!', social, 1).
action_difficulty(shut_them_down, 0.5).
action_duration(shut_them_down, 1).
action_category(shut_them_down, general).
action_source(shut_them_down, ensemble).
action_verb(shut_them_down, past, 'shut them down!').
action_verb(shut_them_down, present, 'shut them down!').
action_target_type(shut_them_down, other).
action_requires_target(shut_them_down).
action_range(shut_them_down, 5).
action_effect(shut_them_down, (modify_network(Actor, Target, friendship, -, 1))).
action_effect(shut_them_down, (modify_network(Actor, Target, respect, -, 2))).
can_perform(Actor, shut_them_down, Target) :- true.

%% ok_sure
% Action: OK, sure...
% Source: Ensemble / general

action(ok_sure, 'OK, sure...', social, 1).
action_difficulty(ok_sure, 0.5).
action_duration(ok_sure, 1).
action_category(ok_sure, general).
action_source(ok_sure, ensemble).
action_verb(ok_sure, past, 'ok, sure...').
action_verb(ok_sure, present, 'ok, sure...').
action_target_type(ok_sure, self).
can_perform(Actor, ok_sure) :- true.

%% yeah_whatever_i_gotta_go
% Action: Yeah, whatever. I gotta go.
% Source: Ensemble / general

action(yeah_whatever_i_gotta_go, 'Yeah, whatever. I gotta go.', social, 1).
action_difficulty(yeah_whatever_i_gotta_go, 0.5).
action_duration(yeah_whatever_i_gotta_go, 1).
action_category(yeah_whatever_i_gotta_go, general).
action_source(yeah_whatever_i_gotta_go, ensemble).
action_verb(yeah_whatever_i_gotta_go, past, 'yeah, whatever. i gotta go.').
action_verb(yeah_whatever_i_gotta_go, present, 'yeah, whatever. i gotta go.').
action_target_type(yeah_whatever_i_gotta_go, self).
can_perform(Actor, yeah_whatever_i_gotta_go) :- true.

%% let_s_agree_to_disagree
% Action: Let’s agree to disagree
% Source: Ensemble / general

action(let_s_agree_to_disagree, 'Let''s agree to disagree', social, 1).
action_difficulty(let_s_agree_to_disagree, 0.5).
action_duration(let_s_agree_to_disagree, 1).
action_category(let_s_agree_to_disagree, general).
action_source(let_s_agree_to_disagree, ensemble).
action_verb(let_s_agree_to_disagree, past, 'let''s agree to disagree').
action_verb(let_s_agree_to_disagree, present, 'let''s agree to disagree').
action_target_type(let_s_agree_to_disagree, self).
can_perform(Actor, let_s_agree_to_disagree) :- true.

%% back_off
% Action: Back off!
% Source: Ensemble / general

action(back_off, 'Back off!', social, 1).
action_difficulty(back_off, 0.5).
action_duration(back_off, 1).
action_category(back_off, general).
action_source(back_off, ensemble).
action_verb(back_off, past, 'back off!').
action_verb(back_off, present, 'back off!').
action_target_type(back_off, self).
can_perform(Actor, back_off) :- true.

%% perform_a_playful_recitation
% Action: Perform a playful recitation
% Source: Ensemble / general

action(perform_a_playful_recitation, 'Perform a playful recitation', social, 1).
action_difficulty(perform_a_playful_recitation, 0.5).
action_duration(perform_a_playful_recitation, 1).
action_category(perform_a_playful_recitation, general).
action_source(perform_a_playful_recitation, ensemble).
action_verb(perform_a_playful_recitation, past, 'perform a playful recitation').
action_verb(perform_a_playful_recitation, present, 'perform a playful recitation').
action_target_type(perform_a_playful_recitation, self).
can_perform(Actor, perform_a_playful_recitation) :- true.

%% oooooh_la_la
% Action: Oooooh, la la
% Source: Ensemble / general

action(oooooh_la_la, 'Oooooh, la la', social, 1).
action_difficulty(oooooh_la_la, 0.5).
action_duration(oooooh_la_la, 1).
action_category(oooooh_la_la, general).
action_source(oooooh_la_la, ensemble).
action_verb(oooooh_la_la, past, 'oooooh, la la').
action_verb(oooooh_la_la, present, 'oooooh, la la').
action_target_type(oooooh_la_la, other).
action_requires_target(oooooh_la_la).
action_range(oooooh_la_la, 5).
action_effect(oooooh_la_la, (ensemble_effect(Target, flirted with, true))).
action_effect(oooooh_la_la, (ensemble_effect(Actor, flirted with, true))).
can_perform(Actor, oooooh_la_la, Target) :- true.

%% that_was_sort_of_offensive
% Action: That was sort of offensive...
% Source: Ensemble / general

action(that_was_sort_of_offensive, 'That was sort of offensive...', social, 1).
action_difficulty(that_was_sort_of_offensive, 0.5).
action_duration(that_was_sort_of_offensive, 1).
action_category(that_was_sort_of_offensive, general).
action_source(that_was_sort_of_offensive, ensemble).
action_verb(that_was_sort_of_offensive, past, 'that was sort of offensive...').
action_verb(that_was_sort_of_offensive, present, 'that was sort of offensive...').
action_target_type(that_was_sort_of_offensive, other).
action_requires_target(that_was_sort_of_offensive).
action_range(that_was_sort_of_offensive, 5).
action_effect(that_was_sort_of_offensive, (modify_network(Actor, Target, respect, -, 1))).
action_influence(that_was_sort_of_offensive, (influence(unknown, _, _, weight, +, 0))).
can_perform(Actor, that_was_sort_of_offensive, Target) :- true.

%% hey_what_was_that
% Action: Hey! What was that???
% Source: Ensemble / general

action(hey_what_was_that, 'Hey! What was that???', social, 1).
action_difficulty(hey_what_was_that, 0.5).
action_duration(hey_what_was_that, 1).
action_category(hey_what_was_that, general).
action_source(hey_what_was_that, ensemble).
action_verb(hey_what_was_that, past, 'hey! what was that???').
action_verb(hey_what_was_that, present, 'hey! what was that???').
action_target_type(hey_what_was_that, other).
action_requires_target(hey_what_was_that).
action_range(hey_what_was_that, 5).
action_effect(hey_what_was_that, (modify_network(Actor, Target, respect, -, 1))).
action_effect(hey_what_was_that, (modify_network(Actor, Target, friendship, -, 1))).
action_effect(hey_what_was_that, (ensemble_effect(Target, rude, true))).
action_influence(hey_what_was_that, (influence(unknown, _, _, weight, +, 0))).
can_perform(Actor, hey_what_was_that, Target) :- true.

%% be_self_congratulatory
% Action: Be self-congratulatory
% Source: Ensemble / general

action(be_self_congratulatory, 'Be self-congratulatory', social, 1).
action_difficulty(be_self_congratulatory, 0.5).
action_duration(be_self_congratulatory, 1).
action_category(be_self_congratulatory, general).
action_source(be_self_congratulatory, ensemble).
action_verb(be_self_congratulatory, past, 'be self-congratulatory').
action_verb(be_self_congratulatory, present, 'be self-congratulatory').
action_target_type(be_self_congratulatory, self).
can_perform(Actor, be_self_congratulatory) :- true.

%% that_wasn_t_very_funny
% Action: That wasn’t very funny
% Source: Ensemble / general

action(that_wasn_t_very_funny, 'That wasn''t very funny', social, 1).
action_difficulty(that_wasn_t_very_funny, 0.5).
action_duration(that_wasn_t_very_funny, 1).
action_category(that_wasn_t_very_funny, general).
action_source(that_wasn_t_very_funny, ensemble).
action_verb(that_wasn_t_very_funny, past, 'that wasn''t very funny').
action_verb(that_wasn_t_very_funny, present, 'that wasn''t very funny').
action_target_type(that_wasn_t_very_funny, self).
can_perform(Actor, that_wasn_t_very_funny) :- true.

%% pretend_to_understand
% Action: Pretend to understand
% Source: Ensemble / general

action(pretend_to_understand, 'Pretend to understand', social, 1).
action_difficulty(pretend_to_understand, 0.5).
action_duration(pretend_to_understand, 1).
action_category(pretend_to_understand, general).
action_source(pretend_to_understand, ensemble).
action_verb(pretend_to_understand, past, 'pretend to understand').
action_verb(pretend_to_understand, present, 'pretend to understand').
action_target_type(pretend_to_understand, self).
can_perform(Actor, pretend_to_understand) :- true.

%% lighten_up
% Action: Lighten up
% Source: Ensemble / general

action(lighten_up, 'Lighten up', social, 1).
action_difficulty(lighten_up, 0.5).
action_duration(lighten_up, 1).
action_category(lighten_up, general).
action_source(lighten_up, ensemble).
action_verb(lighten_up, past, 'lighten up').
action_verb(lighten_up, present, 'lighten up').
action_target_type(lighten_up, self).
can_perform(Actor, lighten_up) :- true.

%% chuckle
% Action: Chuckle
% Source: Ensemble / general

action(chuckle, 'Chuckle', social, 1).
action_difficulty(chuckle, 0.5).
action_duration(chuckle, 1).
action_category(chuckle, general).
action_source(chuckle, ensemble).
action_verb(chuckle, past, 'chuckle').
action_verb(chuckle, present, 'chuckle').
action_target_type(chuckle, self).
can_perform(Actor, chuckle) :- true.

%% roll_eyes
% Action: Roll eyes
% Source: Ensemble / general

action(roll_eyes, 'Roll eyes', social, 1).
action_difficulty(roll_eyes, 0.5).
action_duration(roll_eyes, 1).
action_category(roll_eyes, general).
action_source(roll_eyes, ensemble).
action_verb(roll_eyes, past, 'roll eyes').
action_verb(roll_eyes, present, 'roll eyes').
action_target_type(roll_eyes, self).
can_perform(Actor, roll_eyes) :- true.

%% make_suggestive_eyes_at
% Action: Make suggestive eyes at
% Source: Ensemble / general

action(make_suggestive_eyes_at, 'Make suggestive eyes at', social, 1).
action_difficulty(make_suggestive_eyes_at, 0.5).
action_duration(make_suggestive_eyes_at, 1).
action_category(make_suggestive_eyes_at, general).
action_source(make_suggestive_eyes_at, ensemble).
action_verb(make_suggestive_eyes_at, past, 'make suggestive eyes at').
action_verb(make_suggestive_eyes_at, present, 'make suggestive eyes at').
action_target_type(make_suggestive_eyes_at, self).
can_perform(Actor, make_suggestive_eyes_at) :- true.

%% annoyed_resonse
% Action: Annoyed Resonse
% Source: Ensemble / general

action(annoyed_resonse, 'Annoyed Resonse', social, 1).
action_difficulty(annoyed_resonse, 0.5).
action_duration(annoyed_resonse, 1).
action_category(annoyed_resonse, general).
action_source(annoyed_resonse, ensemble).
action_verb(annoyed_resonse, past, 'annoyed resonse').
action_verb(annoyed_resonse, present, 'annoyed resonse').
action_target_type(annoyed_resonse, other).
action_requires_target(annoyed_resonse).
action_range(annoyed_resonse, 5).
action_effect(annoyed_resonse, (assert(relationship(Actor, Target, met)))).
action_effect(annoyed_resonse, (modify_network(Actor, Target, respect, -, 3))).
action_influence(annoyed_resonse, (influence(unknown, _, _, weight, +, 0))).
can_perform(Actor, annoyed_resonse, Target) :- true.

%% one_up_them
% Action: One up them
% Source: Ensemble / general

action(one_up_them, 'One up them', social, 1).
action_difficulty(one_up_them, 0.5).
action_duration(one_up_them, 1).
action_category(one_up_them, general).
action_source(one_up_them, ensemble).
action_verb(one_up_them, past, 'one up them').
action_verb(one_up_them, present, 'one up them').
action_target_type(one_up_them, other).
action_requires_target(one_up_them).
action_range(one_up_them, 5).
action_effect(one_up_them, (assert(relationship(Actor, Target, met)))).
action_effect(one_up_them, (modify_network(Target, Actor, respect, +, 1))).
action_influence(one_up_them, (influence(unknown, _, _, weight, +, 0))).
can_perform(Actor, one_up_them, Target) :- true.

%% learn_more_about_them
% Action: Learn more about them
% Source: Ensemble / general

action(learn_more_about_them, 'Learn more about them', social, 1).
action_difficulty(learn_more_about_them, 0.5).
action_duration(learn_more_about_them, 1).
action_category(learn_more_about_them, general).
action_source(learn_more_about_them, ensemble).
action_verb(learn_more_about_them, past, 'learn more about them').
action_verb(learn_more_about_them, present, 'learn more about them').
action_target_type(learn_more_about_them, self).
action_influence(learn_more_about_them, (influence(unknown, _, _, weight, +, 0))).
can_perform(Actor, learn_more_about_them) :- true.

%% share_something_about_yourself
% Action: Share something about yourself
% Source: Ensemble / general

action(share_something_about_yourself, 'Share something about yourself', social, 1).
action_difficulty(share_something_about_yourself, 0.5).
action_duration(share_something_about_yourself, 1).
action_category(share_something_about_yourself, general).
action_source(share_something_about_yourself, ensemble).
action_verb(share_something_about_yourself, past, 'share something about yourself').
action_verb(share_something_about_yourself, present, 'share something about yourself').
action_target_type(share_something_about_yourself, self).
action_influence(share_something_about_yourself, (influence(unknown, _, _, weight, +, 0))).
can_perform(Actor, share_something_about_yourself) :- true.

%% share_something_you_are_excited_about
% Action: Share something you are excited about
% Source: Ensemble / general

action(share_something_you_are_excited_about, 'Share something you are excited about', social, 1).
action_difficulty(share_something_you_are_excited_about, 0.5).
action_duration(share_something_you_are_excited_about, 1).
action_category(share_something_you_are_excited_about, general).
action_source(share_something_you_are_excited_about, ensemble).
action_verb(share_something_you_are_excited_about, past, 'share something you are excited about').
action_verb(share_something_you_are_excited_about, present, 'share something you are excited about').
action_target_type(share_something_you_are_excited_about, self).
action_influence(share_something_you_are_excited_about, (influence(unknown, _, _, weight, +, 0))).
can_perform(Actor, share_something_you_are_excited_about) :- true.

%% lash_out
% Action: Lash Out
% Source: Ensemble / general

action(lash_out, 'Lash Out', social, 1).
action_difficulty(lash_out, 0.5).
action_duration(lash_out, 1).
action_category(lash_out, general).
action_source(lash_out, ensemble).
action_verb(lash_out, past, 'lash out').
action_verb(lash_out, present, 'lash out').
action_target_type(lash_out, other).
action_requires_target(lash_out).
action_range(lash_out, 5).
action_effect(lash_out, (assert(relationship(Actor, Target, met)))).
action_effect(lash_out, (modify_network(Actor, Target, respect, -, 3))).
action_effect(lash_out, (modify_network(Target, Actor, friendship, -, 3))).
can_perform(Actor, lash_out, Target) :- true.

%% misunderstanding
% Action: Misunderstanding
% Source: Ensemble / general

action(misunderstanding, 'Misunderstanding', social, 1).
action_difficulty(misunderstanding, 0.5).
action_duration(misunderstanding, 1).
action_category(misunderstanding, general).
action_source(misunderstanding, ensemble).
action_verb(misunderstanding, past, 'misunderstanding').
action_verb(misunderstanding, present, 'misunderstanding').
action_target_type(misunderstanding, other).
action_requires_target(misunderstanding).
action_range(misunderstanding, 5).
action_effect(misunderstanding, (assert(relationship(Actor, Target, met)))).
action_effect(misunderstanding, (modify_network(Actor, Target, friendship, +, 1))).
can_perform(Actor, misunderstanding, Target) :- true.

%% make_them_see_how_awesome_you_are
% Action: Make them see how awesome you are
% Source: Ensemble / general

action(make_them_see_how_awesome_you_are, 'Make them see how awesome you are', social, 1).
action_difficulty(make_them_see_how_awesome_you_are, 0.5).
action_duration(make_them_see_how_awesome_you_are, 1).
action_category(make_them_see_how_awesome_you_are, general).
action_source(make_them_see_how_awesome_you_are, ensemble).
action_verb(make_them_see_how_awesome_you_are, past, 'make them see how awesome you are').
action_verb(make_them_see_how_awesome_you_are, present, 'make them see how awesome you are').
action_target_type(make_them_see_how_awesome_you_are, self).
can_perform(Actor, make_them_see_how_awesome_you_are) :- true.

%% tear_them_down
% Action: Tear them down
% Source: Ensemble / general

action(tear_them_down, 'Tear them down', social, 1).
action_difficulty(tear_them_down, 0.5).
action_duration(tear_them_down, 1).
action_category(tear_them_down, general).
action_source(tear_them_down, ensemble).
action_verb(tear_them_down, past, 'tear them down').
action_verb(tear_them_down, present, 'tear them down').
action_target_type(tear_them_down, self).
can_perform(Actor, tear_them_down) :- true.

%% oblige_them
% Action: Oblige them
% Source: Ensemble / general

action(oblige_them, 'Oblige them', social, 1).
action_difficulty(oblige_them, 0.5).
action_duration(oblige_them, 1).
action_category(oblige_them, general).
action_source(oblige_them, ensemble).
action_verb(oblige_them, past, 'oblige them').
action_verb(oblige_them, present, 'oblige them').
action_target_type(oblige_them, other).
action_requires_target(oblige_them).
action_range(oblige_them, 5).
action_effect(oblige_them, (assert(relationship(Actor, Target, met)))).
action_effect(oblige_them, (modify_network(Actor, Target, friendship, +, 1))).
can_perform(Actor, oblige_them, Target) :- true.

%% looking_forward_to_getting_to_know_you_better
% Action: Looking forward to getting to know you better
% Source: Ensemble / general

action(looking_forward_to_getting_to_know_you_better, 'Looking forward to getting to know you better', social, 1).
action_difficulty(looking_forward_to_getting_to_know_you_better, 0.5).
action_duration(looking_forward_to_getting_to_know_you_better, 1).
action_category(looking_forward_to_getting_to_know_you_better, general).
action_source(looking_forward_to_getting_to_know_you_better, ensemble).
action_verb(looking_forward_to_getting_to_know_you_better, past, 'looking forward to getting to know you better').
action_verb(looking_forward_to_getting_to_know_you_better, present, 'looking forward to getting to know you better').
action_target_type(looking_forward_to_getting_to_know_you_better, other).
action_requires_target(looking_forward_to_getting_to_know_you_better).
action_range(looking_forward_to_getting_to_know_you_better, 5).
action_effect(looking_forward_to_getting_to_know_you_better, (assert(relationship(Actor, Target, met)))).
action_effect(looking_forward_to_getting_to_know_you_better, (modify_network(Actor, Target, attraction, +, 1))).
action_effect(looking_forward_to_getting_to_know_you_better, (modify_network(Target, Actor, attraction, +, 1))).
action_influence(looking_forward_to_getting_to_know_you_better, (influence(unknown, _, _, weight, +, 0))).
can_perform(Actor, looking_forward_to_getting_to_know_you_better, Target) :- true.




