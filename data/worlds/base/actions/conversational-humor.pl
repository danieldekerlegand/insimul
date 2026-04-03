%% Ensemble Actions: conversational-humor
%% Source: data/ensemble/actions/conversational-humor.json
%% Converted: 2026-04-01T20:15:17.337Z
%% Total actions: 19

%% joke_around
% Action: JOKE AROUND
% Source: Ensemble / conversational-humor

action(joke_around, 'JOKE AROUND', social, 1).
action_difficulty(joke_around, 0.5).
action_duration(joke_around, 1).
action_category(joke_around, conversational_humor).
action_source(joke_around, ensemble).
action_verb(joke_around, past, 'joke around').
action_verb(joke_around, present, 'joke around').
action_target_type(joke_around, self).
action_leads_to(joke_around, joke).
can_perform(Actor, joke_around) :- true.

%% tell_joke
% Action: TELL JOKE
% Source: Ensemble / conversational-humor

action(tell_joke, 'TELL JOKE', social, 1).
action_difficulty(tell_joke, 0.5).
action_duration(tell_joke, 1).
action_category(tell_joke, conversational_humor).
action_source(tell_joke, ensemble).
action_verb(tell_joke, past, 'tell joke').
action_verb(tell_joke, present, 'tell joke').
action_target_type(tell_joke, self).
action_leads_to(tell_joke, tell_joke_1).
action_leads_to(tell_joke, tell_joke_2).
action_leads_to(tell_joke, tell_joke_3).
can_perform(Actor, tell_joke) :- true.

%% laugh
% Action: LAUGH
% Source: Ensemble / conversational-humor

action(laugh, 'LAUGH', social, 1).
action_difficulty(laugh, 0.5).
action_duration(laugh, 1).
action_category(laugh, conversational_humor).
action_source(laugh, ensemble).
action_verb(laugh, past, 'laugh').
action_verb(laugh, present, 'laugh').
action_target_type(laugh, self).
action_leads_to(laugh, laughterminal1).
action_leads_to(laugh, laughterminal2).
can_perform(Actor, laugh) :- true.

%% tell_joke_1
% Action: tell joke 1
% Source: Ensemble / conversational-humor

action(tell_joke_1, 'tell joke 1', social, 1).
action_difficulty(tell_joke_1, 0.5).
action_duration(tell_joke_1, 1).
action_category(tell_joke_1, conversational_humor).
action_source(tell_joke_1, ensemble).
action_parent(tell_joke_1, tell_joke).
action_verb(tell_joke_1, past, 'tell joke 1').
action_verb(tell_joke_1, present, 'tell joke 1').
action_target_type(tell_joke_1, other).
action_requires_target(tell_joke_1).
action_range(tell_joke_1, 5).
action_is_accept(tell_joke_1).
action_effect(tell_joke_1, (modify_network(Target, Actor, affinity, +, 10))).
can_perform(Actor, tell_joke_1, Target) :- true.

%% tell_joke_2
% Action: tell joke 2
% Source: Ensemble / conversational-humor

action(tell_joke_2, 'tell joke 2', social, 1).
action_difficulty(tell_joke_2, 0.5).
action_duration(tell_joke_2, 1).
action_category(tell_joke_2, conversational_humor).
action_source(tell_joke_2, ensemble).
action_parent(tell_joke_2, tell_joke).
action_verb(tell_joke_2, past, 'tell joke 2').
action_verb(tell_joke_2, present, 'tell joke 2').
action_target_type(tell_joke_2, other).
action_requires_target(tell_joke_2).
action_range(tell_joke_2, 5).
action_effect(tell_joke_2, (modify_network(Target, Actor, affinity, -, 10))).
can_perform(Actor, tell_joke_2, Target) :- true.

%% tell_joke_3
% Action: tell joke 3
% Source: Ensemble / conversational-humor

action(tell_joke_3, 'tell joke 3', social, 1).
action_difficulty(tell_joke_3, 0.5).
action_duration(tell_joke_3, 1).
action_category(tell_joke_3, conversational_humor).
action_source(tell_joke_3, ensemble).
action_parent(tell_joke_3, tell_joke).
action_verb(tell_joke_3, past, 'tell joke 3').
action_verb(tell_joke_3, present, 'tell joke 3').
action_target_type(tell_joke_3, other).
action_requires_target(tell_joke_3).
action_range(tell_joke_3, 5).
action_prerequisite(tell_joke_3, (relationship(Actor, Target, enemies with))).
action_effect(tell_joke_3, (modify_network(Target, Actor, affinity, -, 30))).
% Can Actor perform this action?
can_perform(Actor, tell_joke_3, Target) :-
    relationship(Actor, Target, enemies with).

%% laughterminal1
% Action: laughTerminal1
% Source: Ensemble / conversational-humor

action(laughterminal1, 'laughTerminal1', social, 1).
action_difficulty(laughterminal1, 0.5).
action_duration(laughterminal1, 1).
action_category(laughterminal1, conversational_humor).
action_source(laughterminal1, ensemble).
action_parent(laughterminal1, laugh).
action_verb(laughterminal1, past, 'laughterminal1').
action_verb(laughterminal1, present, 'laughterminal1').
action_target_type(laughterminal1, other).
action_requires_target(laughterminal1).
action_range(laughterminal1, 5).
action_is_accept(laughterminal1).
action_effect(laughterminal1, (assert(relationship(Actor, Target, friends)))).
can_perform(Actor, laughterminal1, Target) :- true.

%% laughterminal2
% Action: laughTerminal2
% Source: Ensemble / conversational-humor

action(laughterminal2, 'laughTerminal2', social, 1).
action_difficulty(laughterminal2, 0.5).
action_duration(laughterminal2, 1).
action_category(laughterminal2, conversational_humor).
action_source(laughterminal2, ensemble).
action_parent(laughterminal2, laugh).
action_verb(laughterminal2, past, 'laughterminal2').
action_verb(laughterminal2, present, 'laughterminal2').
action_target_type(laughterminal2, other).
action_requires_target(laughterminal2).
action_range(laughterminal2, 5).
action_is_accept(laughterminal2).
action_effect(laughterminal2, (assert(relationship(Actor, Target, friends)))).
action_influence(laughterminal2, (influence(unknown, _, _, weight, +, 0))).
can_perform(Actor, laughterminal2, Target) :- true.

%% joke
% Action: Joke
% Source: Ensemble / conversational-humor

action(joke, 'Joke', social, 1).
action_difficulty(joke, 0.5).
action_duration(joke, 1).
action_category(joke, conversational_humor).
action_source(joke, ensemble).
action_parent(joke, joke_around).
action_verb(joke, past, 'joke').
action_verb(joke, present, 'joke').
action_target_type(joke, self).
can_perform(Actor, joke) :- true.

%% tell_a_joke
% Action: Tell a joke
% Source: Ensemble / conversational-humor

action(tell_a_joke, 'Tell a joke', social, 1).
action_difficulty(tell_a_joke, 0.5).
action_duration(tell_a_joke, 1).
action_category(tell_a_joke, conversational_humor).
action_source(tell_a_joke, ensemble).
action_verb(tell_a_joke, past, 'tell a joke').
action_verb(tell_a_joke, present, 'tell a joke').
action_target_type(tell_a_joke, self).
can_perform(Actor, tell_a_joke) :- true.

%% tease
% Action: Tease
% Source: Ensemble / conversational-humor

action(tease, 'Tease', social, 1).
action_difficulty(tease, 0.5).
action_duration(tease, 1).
action_category(tease, conversational_humor).
action_source(tease, ensemble).
action_verb(tease, past, 'tease').
action_verb(tease, present, 'tease').
action_target_type(tease, self).
can_perform(Actor, tease) :- true.

%% humorous_recitation
% Action: Humorous recitation
% Source: Ensemble / conversational-humor

action(humorous_recitation, 'Humorous recitation', social, 1).
action_difficulty(humorous_recitation, 0.5).
action_duration(humorous_recitation, 1).
action_category(humorous_recitation, conversational_humor).
action_source(humorous_recitation, ensemble).
action_verb(humorous_recitation, past, 'humorous recitation').
action_verb(humorous_recitation, present, 'humorous recitation').
action_target_type(humorous_recitation, self).
can_perform(Actor, humorous_recitation) :- true.

%% joke_around_with_a_stranger
% Action: Joke around with a stranger
% Source: Ensemble / conversational-humor

action(joke_around_with_a_stranger, 'Joke around with a stranger', social, 1).
action_difficulty(joke_around_with_a_stranger, 0.5).
action_duration(joke_around_with_a_stranger, 1).
action_category(joke_around_with_a_stranger, conversational_humor).
action_source(joke_around_with_a_stranger, ensemble).
action_verb(joke_around_with_a_stranger, past, 'joke around with a stranger').
action_verb(joke_around_with_a_stranger, present, 'joke around with a stranger').
action_target_type(joke_around_with_a_stranger, other).
action_requires_target(joke_around_with_a_stranger).
action_range(joke_around_with_a_stranger, 5).
action_prerequisite(joke_around_with_a_stranger, (\+ relationship(Actor, Target, met))).
% Can Actor perform this action?
can_perform(Actor, joke_around_with_a_stranger, Target) :-
    \+ relationship(Actor, Target, met).

%% laugh_and_make_a_joke
% Action: Laugh, and make a joke
% Source: Ensemble / conversational-humor

action(laugh_and_make_a_joke, 'Laugh, and make a joke', social, 1).
action_difficulty(laugh_and_make_a_joke, 0.5).
action_duration(laugh_and_make_a_joke, 1).
action_category(laugh_and_make_a_joke, conversational_humor).
action_source(laugh_and_make_a_joke, ensemble).
action_verb(laugh_and_make_a_joke, past, 'laugh, and make a joke').
action_verb(laugh_and_make_a_joke, present, 'laugh, and make a joke').
action_target_type(laugh_and_make_a_joke, other).
action_requires_target(laugh_and_make_a_joke).
action_range(laugh_and_make_a_joke, 5).
action_effect(laugh_and_make_a_joke, (modify_network(Actor, Target, friendship, +, 1))).
action_effect(laugh_and_make_a_joke, (modify_network(Actor, Target, respect, +, 1))).
can_perform(Actor, laugh_and_make_a_joke, Target) :- true.

%% razz
% Action: Razz
% Source: Ensemble / conversational-humor

action(razz, 'Razz', social, 1).
action_difficulty(razz, 0.5).
action_duration(razz, 1).
action_category(razz, conversational_humor).
action_source(razz, ensemble).
action_verb(razz, past, 'razz').
action_verb(razz, present, 'razz').
action_target_type(razz, other).
action_requires_target(razz).
action_range(razz, 5).
action_effect(razz, (ensemble_effect(Actor, rude, true))).
can_perform(Actor, razz, Target) :- true.

%% don_t_understand_but_pretend_to_laugh_because_you_have_the_hots_for_them
% Action: Don’t understand, but pretend to laugh because you have the hots for them
% Source: Ensemble / conversational-humor

action(don_t_understand_but_pretend_to_laugh_because_you_have_the_hots_for_them, 'Don''t understand, but pretend to laugh because you have the hots for them', social, 1).
action_difficulty(don_t_understand_but_pretend_to_laugh_because_you_have_the_hots_for_them, 0.5).
action_duration(don_t_understand_but_pretend_to_laugh_because_you_have_the_hots_for_them, 1).
action_category(don_t_understand_but_pretend_to_laugh_because_you_have_the_hots_for_them, conversational_humor).
action_source(don_t_understand_but_pretend_to_laugh_because_you_have_the_hots_for_them, ensemble).
action_verb(don_t_understand_but_pretend_to_laugh_because_you_have_the_hots_for_them, past, 'don''t understand, but pretend to laugh because you have the hots for them').
action_verb(don_t_understand_but_pretend_to_laugh_because_you_have_the_hots_for_them, present, 'don''t understand, but pretend to laugh because you have the hots for them').
action_target_type(don_t_understand_but_pretend_to_laugh_because_you_have_the_hots_for_them, other).
action_requires_target(don_t_understand_but_pretend_to_laugh_because_you_have_the_hots_for_them).
action_range(don_t_understand_but_pretend_to_laugh_because_you_have_the_hots_for_them, 5).
action_effect(don_t_understand_but_pretend_to_laugh_because_you_have_the_hots_for_them, (modify_network(Actor, Target, respect, -, 1))).
can_perform(Actor, don_t_understand_but_pretend_to_laugh_because_you_have_the_hots_for_them, Target) :- true.

%% don_t_really_engage_with_joke_but_show_off
% Action: Don’t really engage with joke, but show off
% Source: Ensemble / conversational-humor

action(don_t_really_engage_with_joke_but_show_off, 'Don''t really engage with joke, but show off', social, 1).
action_difficulty(don_t_really_engage_with_joke_but_show_off, 0.5).
action_duration(don_t_really_engage_with_joke_but_show_off, 1).
action_category(don_t_really_engage_with_joke_but_show_off, conversational_humor).
action_source(don_t_really_engage_with_joke_but_show_off, ensemble).
action_verb(don_t_really_engage_with_joke_but_show_off, past, 'don''t really engage with joke, but show off').
action_verb(don_t_really_engage_with_joke_but_show_off, present, 'don''t really engage with joke, but show off').
action_target_type(don_t_really_engage_with_joke_but_show_off, other).
action_requires_target(don_t_really_engage_with_joke_but_show_off).
action_range(don_t_really_engage_with_joke_but_show_off, 5).
action_effect(don_t_really_engage_with_joke_but_show_off, (modify_network(Actor, Target, respect, +, 1))).
can_perform(Actor, don_t_really_engage_with_joke_but_show_off, Target) :- true.

%% try_to_make_another_joke
% Action: Try to make another joke
% Source: Ensemble / conversational-humor

action(try_to_make_another_joke, 'Try to make another joke', social, 1).
action_difficulty(try_to_make_another_joke, 0.5).
action_duration(try_to_make_another_joke, 1).
action_category(try_to_make_another_joke, conversational_humor).
action_source(try_to_make_another_joke, ensemble).
action_verb(try_to_make_another_joke, past, 'try to make another joke').
action_verb(try_to_make_another_joke, present, 'try to make another joke').
action_target_type(try_to_make_another_joke, self).
can_perform(Actor, try_to_make_another_joke) :- true.

%% humorous_correction
% Action: Humorous Correction
% Source: Ensemble / conversational-humor

action(humorous_correction, 'Humorous Correction', social, 1).
action_difficulty(humorous_correction, 0.5).
action_duration(humorous_correction, 1).
action_category(humorous_correction, conversational_humor).
action_source(humorous_correction, ensemble).
action_verb(humorous_correction, past, 'humorous correction').
action_verb(humorous_correction, present, 'humorous correction').
action_target_type(humorous_correction, other).
action_requires_target(humorous_correction).
action_range(humorous_correction, 5).
action_effect(humorous_correction, (assert(relationship(Actor, Target, met)))).
action_effect(humorous_correction, (modify_network(Actor, Target, friendship, +, 1))).
action_influence(humorous_correction, (influence(unknown, _, _, weight, +, 0))).
can_perform(Actor, humorous_correction, Target) :- true.




