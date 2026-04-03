%% Ensemble Actions: deceptive-manipulation
%% Source: data/ensemble/actions/deceptive-manipulation.json
%% Converted: 2026-04-01T20:15:17.340Z
%% Total actions: 11

%% manipulate
% Action: MANIPULATE
% Source: Ensemble / deceptive-manipulation

action(manipulate, 'MANIPULATE', deceptive, 1).
action_difficulty(manipulate, 0.5).
action_duration(manipulate, 1).
action_category(manipulate, deceptive_manipulation).
action_source(manipulate, ensemble).
action_verb(manipulate, past, 'manipulate').
action_verb(manipulate, present, 'manipulate').
action_target_type(manipulate, self).
action_leads_to(manipulate, have_but_say_they_don_t).
can_perform(Actor, manipulate) :- true.

%% blackmail
% Action: BLACKMAIL
% Source: Ensemble / deceptive-manipulation

action(blackmail, 'BLACKMAIL', deceptive, 1).
action_difficulty(blackmail, 0.5).
action_duration(blackmail, 1).
action_category(blackmail, deceptive_manipulation).
action_source(blackmail, ensemble).
action_verb(blackmail, past, 'blackmail').
action_verb(blackmail, present, 'blackmail').
action_target_type(blackmail, self).
action_leads_to(blackmail, blackmail_default_insults).
action_leads_to(blackmail, blackmail_unsuccessfully).
can_perform(Actor, blackmail) :- true.

%% play_a_trick
% Action: PLAY A TRICK
% Source: Ensemble / deceptive-manipulation

action(play_a_trick, 'PLAY A TRICK', deceptive, 1).
action_difficulty(play_a_trick, 0.5).
action_duration(play_a_trick, 1).
action_category(play_a_trick, deceptive_manipulation).
action_source(play_a_trick, ensemble).
action_verb(play_a_trick, past, 'play a trick').
action_verb(play_a_trick, present, 'play a trick').
action_target_type(play_a_trick, self).
action_leads_to(play_a_trick, play_trick_successfully).
action_leads_to(play_a_trick, play_trick_unsuccessfully).
can_perform(Actor, play_a_trick) :- true.

%% steal_something_for_a_friend_a
% Action: steal something for a friend _a
% Source: Ensemble / deceptive-manipulation

action(steal_something_for_a_friend_a, 'steal something for a friend _a', deceptive, 1).
action_difficulty(steal_something_for_a_friend_a, 0.5).
action_duration(steal_something_for_a_friend_a, 1).
action_category(steal_something_for_a_friend_a, deceptive_manipulation).
action_source(steal_something_for_a_friend_a, ensemble).
action_verb(steal_something_for_a_friend_a, past, 'steal something for a friend _a').
action_verb(steal_something_for_a_friend_a, present, 'steal something for a friend _a').
action_target_type(steal_something_for_a_friend_a, other).
action_requires_target(steal_something_for_a_friend_a).
action_range(steal_something_for_a_friend_a, 5).
action_is_accept(steal_something_for_a_friend_a).
action_prerequisite(steal_something_for_a_friend_a, (relationship(Actor, Target, ally))).
action_prerequisite(steal_something_for_a_friend_a, (\+ trait(Actor, honest))).
action_prerequisite(steal_something_for_a_friend_a, (\+ trait(Actor, devout))).
action_effect(steal_something_for_a_friend_a, (modify_network(Target, Actor, affinity, +, 15))).
action_effect(steal_something_for_a_friend_a, (assert(status(Target, grateful)))).
% Can Actor perform this action?
can_perform(Actor, steal_something_for_a_friend_a, Target) :-
    relationship(Actor, Target, ally),
    \+ trait(Actor, honest),
    \+ trait(Actor, devout).

%% steal_something_for_a_friend_r
% Action: steal something for a friend _r
% Source: Ensemble / deceptive-manipulation

action(steal_something_for_a_friend_r, 'steal something for a friend _r', deceptive, 1).
action_difficulty(steal_something_for_a_friend_r, 0.5).
action_duration(steal_something_for_a_friend_r, 1).
action_category(steal_something_for_a_friend_r, deceptive_manipulation).
action_source(steal_something_for_a_friend_r, ensemble).
action_verb(steal_something_for_a_friend_r, past, 'steal something for a friend _r').
action_verb(steal_something_for_a_friend_r, present, 'steal something for a friend _r').
action_target_type(steal_something_for_a_friend_r, other).
action_requires_target(steal_something_for_a_friend_r).
action_range(steal_something_for_a_friend_r, 5).
action_prerequisite(steal_something_for_a_friend_r, (relationship(Actor, Target, ally))).
action_prerequisite(steal_something_for_a_friend_r, (\+ trait(Actor, honest))).
action_prerequisite(steal_something_for_a_friend_r, (\+ trait(Actor, devout))).
action_effect(steal_something_for_a_friend_r, (modify_network(Actor, Target, credibility, -, 5))).
action_effect(steal_something_for_a_friend_r, (ensemble_effect(Actor, made a faux pas around, true))).
% Can Actor perform this action?
can_perform(Actor, steal_something_for_a_friend_r, Target) :-
    relationship(Actor, Target, ally),
    \+ trait(Actor, honest),
    \+ trait(Actor, devout).

%% squander_husband
% Action: squander husband
% Source: Ensemble / deceptive-manipulation

action(squander_husband, 'squander husband', deceptive, 1).
action_difficulty(squander_husband, 0.5).
action_duration(squander_husband, 1).
action_category(squander_husband, deceptive_manipulation).
action_source(squander_husband, ensemble).
action_verb(squander_husband, past, 'squander husband').
action_verb(squander_husband, present, 'squander husband').
action_target_type(squander_husband, other).
action_requires_target(squander_husband).
action_range(squander_husband, 5).
action_is_accept(squander_husband).
action_prerequisite(squander_husband, (trait(Actor, female))).
action_prerequisite(squander_husband, (relationship(Actor, Target, married))).
action_prerequisite(squander_husband, (network('third', Target, credibility, V), V > 66)).
action_effect(squander_husband, (modify_network('third', Target, credibility, -, 3))).
action_effect(squander_husband, (modify_network(Target, Actor, curiosity, -, 10))).
action_effect(squander_husband, (assert(status(Target, embarrassed)))).
action_effect(squander_husband, (ensemble_effect(Actor, made a faux pas around, true))).
action_effect(squander_husband, (modify_network('third', Actor, affinity, -, 10))).
action_effect(squander_husband, (retract(relationship(Actor, Target, ally)))).
action_effect(squander_husband, (modify_network(Target, Actor, affinity, -, 15))).
action_effect(squander_husband, (assert(trait(Actor, inconsistent)))).
% Can Actor perform this action?
can_perform(Actor, squander_husband, Target) :-
    trait(Actor, female),
    relationship(Actor, Target, married),
    network('third', Target, credibility, V), V > 66.

%% greedy_domestique_steals_all_of_rich_man_s_money
% Action: greedy domestique steals all of rich man’s money
% Source: Ensemble / deceptive-manipulation

action(greedy_domestique_steals_all_of_rich_man_s_money, 'greedy domestique steals all of rich man''s money', deceptive, 1).
action_difficulty(greedy_domestique_steals_all_of_rich_man_s_money, 0.5).
action_duration(greedy_domestique_steals_all_of_rich_man_s_money, 1).
action_category(greedy_domestique_steals_all_of_rich_man_s_money, deceptive_manipulation).
action_source(greedy_domestique_steals_all_of_rich_man_s_money, ensemble).
action_verb(greedy_domestique_steals_all_of_rich_man_s_money, past, 'greedy domestique steals all of rich man''s money').
action_verb(greedy_domestique_steals_all_of_rich_man_s_money, present, 'greedy domestique steals all of rich man''s money').
action_target_type(greedy_domestique_steals_all_of_rich_man_s_money, other).
action_requires_target(greedy_domestique_steals_all_of_rich_man_s_money).
action_range(greedy_domestique_steals_all_of_rich_man_s_money, 5).
action_is_accept(greedy_domestique_steals_all_of_rich_man_s_money).
action_prerequisite(greedy_domestique_steals_all_of_rich_man_s_money, (trait(Actor, stagehand))).
action_prerequisite(greedy_domestique_steals_all_of_rich_man_s_money, (trait(Target, rich))).
action_prerequisite(greedy_domestique_steals_all_of_rich_man_s_money, (trait(Target, credulous))).
action_prerequisite(greedy_domestique_steals_all_of_rich_man_s_money, (attribute(Actor, cunningness, V), V > 50)).
action_prerequisite(greedy_domestique_steals_all_of_rich_man_s_money, (trait(Actor, greedy))).
action_effect(greedy_domestique_steals_all_of_rich_man_s_money, (modify_network(Target, Actor, affinity, -, 25))).
action_effect(greedy_domestique_steals_all_of_rich_man_s_money, (retract(trait(Target, rich)))).
% Can Actor perform this action?
can_perform(Actor, greedy_domestique_steals_all_of_rich_man_s_money, Target) :-
    trait(Actor, stagehand),
    trait(Target, rich),
    trait(Target, credulous),
    attribute(Actor, cunningness, V), V > 50,
    trait(Actor, greedy).

%% play_a_bad_trick
% Action: play a bad trick
% Source: Ensemble / deceptive-manipulation

action(play_a_bad_trick, 'play a bad trick', deceptive, 1).
action_difficulty(play_a_bad_trick, 0.5).
action_duration(play_a_bad_trick, 1).
action_category(play_a_bad_trick, deceptive_manipulation).
action_source(play_a_bad_trick, ensemble).
action_verb(play_a_bad_trick, past, 'play a bad trick').
action_verb(play_a_bad_trick, present, 'play a bad trick').
action_target_type(play_a_bad_trick, other).
action_requires_target(play_a_bad_trick).
action_range(play_a_bad_trick, 5).
action_prerequisite(play_a_bad_trick, (trait(Actor, female))).
action_prerequisite(play_a_bad_trick, (trait(Actor, joker))).
action_prerequisite(play_a_bad_trick, (trait(Target, male))).
action_prerequisite(play_a_bad_trick, (trait(Target, security guard))).
action_prerequisite(play_a_bad_trick, (trait(Actor, eccentric))).
action_effect(play_a_bad_trick, (modify_network(Target, Actor, affinity, -, 15))).
action_effect(play_a_bad_trick, (retract(relationship(Target, Someone, esteem)))).
action_effect(play_a_bad_trick, (ensemble_effect(Target, offended by, true))).
% Can Actor perform this action?
can_perform(Actor, play_a_bad_trick, Target) :-
    trait(Actor, female),
    trait(Actor, joker),
    trait(Target, male),
    trait(Target, security guard),
    trait(Actor, eccentric).

%% blackmail_unsuccessfully
% Action: blackmail unsuccessfully
% Source: Ensemble / deceptive-manipulation

action(blackmail_unsuccessfully, 'blackmail unsuccessfully', deceptive, 1).
action_difficulty(blackmail_unsuccessfully, 0.5).
action_duration(blackmail_unsuccessfully, 1).
action_category(blackmail_unsuccessfully, deceptive_manipulation).
action_source(blackmail_unsuccessfully, ensemble).
action_parent(blackmail_unsuccessfully, blackmail).
action_verb(blackmail_unsuccessfully, past, 'blackmail unsuccessfully').
action_verb(blackmail_unsuccessfully, present, 'blackmail unsuccessfully').
action_target_type(blackmail_unsuccessfully, other).
action_requires_target(blackmail_unsuccessfully).
action_range(blackmail_unsuccessfully, 5).
action_effect(blackmail_unsuccessfully, (retract(relationship(Actor, Target, rivals)))).
can_perform(Actor, blackmail_unsuccessfully, Target) :- true.

%% play_trick_successfully
% Action: play trick successfully
% Source: Ensemble / deceptive-manipulation

action(play_trick_successfully, 'play trick successfully', deceptive, 1).
action_difficulty(play_trick_successfully, 0.5).
action_duration(play_trick_successfully, 1).
action_category(play_trick_successfully, deceptive_manipulation).
action_source(play_trick_successfully, ensemble).
action_parent(play_trick_successfully, play_a_trick).
action_verb(play_trick_successfully, past, 'play trick successfully').
action_verb(play_trick_successfully, present, 'play trick successfully').
action_target_type(play_trick_successfully, other).
action_requires_target(play_trick_successfully).
action_range(play_trick_successfully, 5).
action_is_accept(play_trick_successfully).
action_effect(play_trick_successfully, (retract(relationship(Actor, Target, esteem)))).
can_perform(Actor, play_trick_successfully, Target) :- true.

%% play_trick_unsuccessfully
% Action: play trick unsuccessfully
% Source: Ensemble / deceptive-manipulation

action(play_trick_unsuccessfully, 'play trick unsuccessfully', deceptive, 1).
action_difficulty(play_trick_unsuccessfully, 0.5).
action_duration(play_trick_unsuccessfully, 1).
action_category(play_trick_unsuccessfully, deceptive_manipulation).
action_source(play_trick_unsuccessfully, ensemble).
action_parent(play_trick_unsuccessfully, play_a_trick).
action_verb(play_trick_unsuccessfully, past, 'play trick unsuccessfully').
action_verb(play_trick_unsuccessfully, present, 'play trick unsuccessfully').
action_target_type(play_trick_unsuccessfully, other).
action_requires_target(play_trick_unsuccessfully).
action_range(play_trick_unsuccessfully, 5).
action_effect(play_trick_unsuccessfully, (assert(relationship(Actor, Target, esteem)))).
can_perform(Actor, play_trick_unsuccessfully, Target) :- true.




