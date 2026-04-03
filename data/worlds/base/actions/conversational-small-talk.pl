%% Ensemble Actions: conversational-small-talk
%% Source: data/ensemble/actions/conversational-small-talk.json
%% Converted: 2026-04-01T20:15:17.338Z
%% Total actions: 28

%% reminisce
% Action: REMINISCE
% Source: Ensemble / conversational-small-talk

action(reminisce, 'REMINISCE', social, 1).
action_difficulty(reminisce, 0.5).
action_duration(reminisce, 1).
action_category(reminisce, conversational_small_talk).
action_source(reminisce, ensemble).
action_verb(reminisce, past, 'reminisce').
action_verb(reminisce, present, 'reminisce').
action_target_type(reminisce, self).
action_leads_to(reminisce, reminisce_1).
action_leads_to(reminisce, reminisce_2).
action_leads_to(reminisce, reminisce_3).
action_influence(reminisce, (influence(unknown, _, _, weight, +, 0))).
can_perform(Actor, reminisce) :- true.

%% reminisce_1
% Action: reminisce 1
% Source: Ensemble / conversational-small-talk

action(reminisce_1, 'reminisce 1', social, 1).
action_difficulty(reminisce_1, 0.5).
action_duration(reminisce_1, 1).
action_category(reminisce_1, conversational_small_talk).
action_source(reminisce_1, ensemble).
action_parent(reminisce_1, reminisce).
action_verb(reminisce_1, past, 'reminisce 1').
action_verb(reminisce_1, present, 'reminisce 1').
action_target_type(reminisce_1, other).
action_requires_target(reminisce_1).
action_range(reminisce_1, 5).
action_is_accept(reminisce_1).
action_effect(reminisce_1, (modify_network(Target, Actor, affinity, +, 10))).
can_perform(Actor, reminisce_1, Target) :- true.

%% reminisce_2
% Action: reminisce 2
% Source: Ensemble / conversational-small-talk

action(reminisce_2, 'reminisce 2', social, 1).
action_difficulty(reminisce_2, 0.5).
action_duration(reminisce_2, 1).
action_category(reminisce_2, conversational_small_talk).
action_source(reminisce_2, ensemble).
action_parent(reminisce_2, reminisce).
action_verb(reminisce_2, past, 'reminisce 2').
action_verb(reminisce_2, present, 'reminisce 2').
action_target_type(reminisce_2, other).
action_requires_target(reminisce_2).
action_range(reminisce_2, 5).
action_effect(reminisce_2, (modify_network(Target, Actor, affinity, -, 40))).
can_perform(Actor, reminisce_2, Target) :- true.

%% reminisce_3
% Action: reminisce 3
% Source: Ensemble / conversational-small-talk

action(reminisce_3, 'reminisce 3', social, 1).
action_difficulty(reminisce_3, 0.5).
action_duration(reminisce_3, 1).
action_category(reminisce_3, conversational_small_talk).
action_source(reminisce_3, ensemble).
action_parent(reminisce_3, reminisce).
action_verb(reminisce_3, past, 'reminisce 3').
action_verb(reminisce_3, present, 'reminisce 3').
action_target_type(reminisce_3, other).
action_requires_target(reminisce_3).
action_range(reminisce_3, 5).
action_is_accept(reminisce_3).
action_prerequisite(reminisce_3, (relationship(Actor, 'mutualFriend', friends))).
action_prerequisite(reminisce_3, (relationship(Target, 'mutualFriend', friends))).
action_effect(reminisce_3, (assert(relationship(Target, Actor, involved with)))).
action_effect(reminisce_3, (modify_network(Target, Actor, affinity, +, 20))).
% Can Actor perform this action?
can_perform(Actor, reminisce_3, Target) :-
    relationship(Actor, 'mutualFriend', friends),
    relationship(Target, 'mutualFriend', friends).

%% talk_about_the_loved_one
% Action: talk about the loved one
% Source: Ensemble / conversational-small-talk

action(talk_about_the_loved_one, 'talk about the loved one', social, 1).
action_difficulty(talk_about_the_loved_one, 0.5).
action_duration(talk_about_the_loved_one, 1).
action_category(talk_about_the_loved_one, conversational_small_talk).
action_source(talk_about_the_loved_one, ensemble).
action_verb(talk_about_the_loved_one, past, 'talk about the loved one').
action_verb(talk_about_the_loved_one, present, 'talk about the loved one').
action_target_type(talk_about_the_loved_one, other).
action_requires_target(talk_about_the_loved_one).
action_range(talk_about_the_loved_one, 5).
action_is_accept(talk_about_the_loved_one).
action_prerequisite(talk_about_the_loved_one, (network(Actor, 'third', affinity, V), V =:= 80)).
action_prerequisite(talk_about_the_loved_one, (ensemble_condition(Target, financially dependent on, true))).
action_prerequisite(talk_about_the_loved_one, (trait(Actor, male))).
action_prerequisite(talk_about_the_loved_one, (trait(Target, male))).
action_effect(talk_about_the_loved_one, (assert(trait(Actor, flirtatious)))).
action_effect(talk_about_the_loved_one, (modify_network(Target, Actor, curiosity, +, 3))).
action_effect(talk_about_the_loved_one, (modify_network('third', Actor, curiosity, +, 5))).
action_effect(talk_about_the_loved_one, (modify_network('third', Actor, affinity, +, 5))).
action_effect(talk_about_the_loved_one, (assert(status(Target, feeling socially connected)))).
% Can Actor perform this action?
can_perform(Actor, talk_about_the_loved_one, Target) :-
    network(Actor, 'third', affinity, V), V =:= 80,
    ensemble_condition(Target, financially dependent on, true),
    trait(Actor, male),
    trait(Target, male).

%% talk_about_science_philosophy
% Action: talk about science / philosophy
% Source: Ensemble / conversational-small-talk

action(talk_about_science_philosophy, 'talk about science / philosophy', social, 1).
action_difficulty(talk_about_science_philosophy, 0.5).
action_duration(talk_about_science_philosophy, 1).
action_category(talk_about_science_philosophy, conversational_small_talk).
action_source(talk_about_science_philosophy, ensemble).
action_verb(talk_about_science_philosophy, past, 'talk about science / philosophy').
action_verb(talk_about_science_philosophy, present, 'talk about science / philosophy').
action_target_type(talk_about_science_philosophy, other).
action_requires_target(talk_about_science_philosophy).
action_range(talk_about_science_philosophy, 5).
action_prerequisite(talk_about_science_philosophy, (attribute(Actor, sophistication, V), V < 70)).
action_prerequisite(talk_about_science_philosophy, (\+ status(Target, feeling socially connected))).
action_prerequisite(talk_about_science_philosophy, (attribute(Target, sophistication, V), V < 70)).
action_effect(talk_about_science_philosophy, (modify_network(Target, Actor, emulation, -, 15))).
% Can Actor perform this action?
can_perform(Actor, talk_about_science_philosophy, Target) :-
    attribute(Actor, sophistication, V), V < 70,
    \+ status(Target, feeling socially connected),
    attribute(Target, sophistication, V), V < 70.

%% respond_in_patois_but_gain_everyone_s_admiration
% Action: respond in patois, but gain everyone’s admiration
% Source: Ensemble / conversational-small-talk

action(respond_in_patois_but_gain_everyone_s_admiration, 'respond in patois, but gain everyone''s admiration', social, 1).
action_difficulty(respond_in_patois_but_gain_everyone_s_admiration, 0.5).
action_duration(respond_in_patois_but_gain_everyone_s_admiration, 1).
action_category(respond_in_patois_but_gain_everyone_s_admiration, conversational_small_talk).
action_source(respond_in_patois_but_gain_everyone_s_admiration, ensemble).
action_verb(respond_in_patois_but_gain_everyone_s_admiration, past, 'respond in patois, but gain everyone''s admiration').
action_verb(respond_in_patois_but_gain_everyone_s_admiration, present, 'respond in patois, but gain everyone''s admiration').
action_target_type(respond_in_patois_but_gain_everyone_s_admiration, other).
action_requires_target(respond_in_patois_but_gain_everyone_s_admiration).
action_range(respond_in_patois_but_gain_everyone_s_admiration, 5).
action_prerequisite(respond_in_patois_but_gain_everyone_s_admiration, (attribute(Actor, propriety, V), V < 50)).
action_prerequisite(respond_in_patois_but_gain_everyone_s_admiration, (trait(Actor, provincial))).
action_prerequisite(respond_in_patois_but_gain_everyone_s_admiration, (attribute(Actor, sophistication, V), V < 50)).
action_prerequisite(respond_in_patois_but_gain_everyone_s_admiration, (attribute(Actor, cultural knowledge, V), V < 50)).
action_prerequisite(respond_in_patois_but_gain_everyone_s_admiration, (\+ trait(Target, provincial))).
action_prerequisite(respond_in_patois_but_gain_everyone_s_admiration, (\+ trait('other', provincial))).
action_effect(respond_in_patois_but_gain_everyone_s_admiration, (modify_network(Target, Actor, affinity, +, 10))).
action_effect(respond_in_patois_but_gain_everyone_s_admiration, (modify_network('other', Actor, affinity, +, 10))).
action_effect(respond_in_patois_but_gain_everyone_s_admiration, (assert(status(Actor, feeling socially connected)))).
action_effect(respond_in_patois_but_gain_everyone_s_admiration, (modify_attribute(Actor, self-assuredness, +, 10))).
action_effect(respond_in_patois_but_gain_everyone_s_admiration, (modify_network(Target, Actor, curiosity, +, 10))).
action_effect(respond_in_patois_but_gain_everyone_s_admiration, (modify_network('other', Actor, curiosity, +, 10))).
% Can Actor perform this action?
can_perform(Actor, respond_in_patois_but_gain_everyone_s_admiration, Target) :-
    attribute(Actor, propriety, V), V < 50,
    trait(Actor, provincial),
    attribute(Actor, sophistication, V), V < 50,
    attribute(Actor, cultural knowledge, V), V < 50,
    \+ trait(Target, provincial),
    \+ trait('other', provincial).

%% look_away
% Action: look away
% Source: Ensemble / conversational-small-talk

action(look_away, 'look away', social, 1).
action_difficulty(look_away, 0.5).
action_duration(look_away, 1).
action_category(look_away, conversational_small_talk).
action_source(look_away, ensemble).
action_verb(look_away, past, 'look away').
action_verb(look_away, present, 'look away').
action_target_type(look_away, other).
action_requires_target(look_away).
action_range(look_away, 5).
action_is_accept(look_away).
action_prerequisite(look_away, (trait(Actor, shy))).
action_prerequisite(look_away, (trait('third', shy))).
action_prerequisite(look_away, (relationship(Actor, 'third', ally))).
action_prerequisite(look_away, (network(Target, Actor, curiosity, V), V > 66)).
action_effect(look_away, (modify_network(Target, Actor, curiosity, -, 5))).
action_effect(look_away, (modify_network(Target, 'third', curiosity, -, 5))).
action_effect(look_away, (assert(trait(Actor, cold)))).
% Can Actor perform this action?
can_perform(Actor, look_away, Target) :-
    trait(Actor, shy),
    trait('third', shy),
    relationship(Actor, 'third', ally),
    network(Target, Actor, curiosity, V), V > 66.

%% remaining_silent
% Action: remaining silent
% Source: Ensemble / conversational-small-talk

action(remaining_silent, 'remaining silent', social, 1).
action_difficulty(remaining_silent, 0.5).
action_duration(remaining_silent, 1).
action_category(remaining_silent, conversational_small_talk).
action_source(remaining_silent, ensemble).
action_verb(remaining_silent, past, 'remaining silent').
action_verb(remaining_silent, present, 'remaining silent').
action_target_type(remaining_silent, other).
action_requires_target(remaining_silent).
action_range(remaining_silent, 5).
action_is_accept(remaining_silent).
action_prerequisite(remaining_silent, (attribute(Actor, propriety, V), V < 50)).
action_prerequisite(remaining_silent, (attribute(Target, propriety, V), V > 50)).
action_prerequisite(remaining_silent, (ensemble_condition(Target, intimidates, true))).
action_prerequisite(remaining_silent, (relationship(Actor, Target, strangers))).
action_effect(remaining_silent, (modify_network(Target, Actor, curiosity, -, 5))).
% Can Actor perform this action?
can_perform(Actor, remaining_silent, Target) :-
    attribute(Actor, propriety, V), V < 50,
    attribute(Target, propriety, V), V > 50,
    ensemble_condition(Target, intimidates, true),
    relationship(Actor, Target, strangers).

%% hi
% Action: Hi.
% Source: Ensemble / conversational-small-talk

action(hi, 'Hi.', social, 1).
action_difficulty(hi, 0.5).
action_duration(hi, 1).
action_category(hi, conversational_small_talk).
action_source(hi, ensemble).
action_verb(hi, past, 'hi.').
action_verb(hi, present, 'hi.').
action_target_type(hi, other).
action_requires_target(hi).
action_range(hi, 5).
action_effect(hi, (ensemble_effect(Actor, informal, true))).
can_perform(Actor, hi, Target) :- true.

%% subtle_frown
% Action: Subtle Frown
% Source: Ensemble / conversational-small-talk

action(subtle_frown, 'Subtle Frown', social, 1).
action_difficulty(subtle_frown, 0.5).
action_duration(subtle_frown, 1).
action_category(subtle_frown, conversational_small_talk).
action_source(subtle_frown, ensemble).
action_verb(subtle_frown, past, 'subtle frown').
action_verb(subtle_frown, present, 'subtle frown').
action_target_type(subtle_frown, other).
action_requires_target(subtle_frown).
action_range(subtle_frown, 5).
action_effect(subtle_frown, (ensemble_effect(Actor, met, true))).
action_effect(subtle_frown, (ensemble_effect(Target, met, true))).
action_effect(subtle_frown, (ensemble_effect(Actor, negative, true))).
can_perform(Actor, subtle_frown, Target) :- true.

%% scowl
% Action: Scowl
% Source: Ensemble / conversational-small-talk

action(scowl, 'Scowl', social, 1).
action_difficulty(scowl, 0.5).
action_duration(scowl, 1).
action_category(scowl, conversational_small_talk).
action_source(scowl, ensemble).
action_verb(scowl, past, 'scowl').
action_verb(scowl, present, 'scowl').
action_target_type(scowl, other).
action_requires_target(scowl).
action_range(scowl, 5).
action_effect(scowl, (ensemble_effect(Actor, offended by, true))).
action_effect(scowl, (modify_network(Actor, Target, trust, -, 2))).
can_perform(Actor, scowl, Target) :- true.

%% respond_to_introduction_nicely
% Action: Respond to introduction nicely
% Source: Ensemble / conversational-small-talk

action(respond_to_introduction_nicely, 'Respond to introduction nicely', social, 1).
action_difficulty(respond_to_introduction_nicely, 0.5).
action_duration(respond_to_introduction_nicely, 1).
action_category(respond_to_introduction_nicely, conversational_small_talk).
action_source(respond_to_introduction_nicely, ensemble).
action_verb(respond_to_introduction_nicely, past, 'respond to introduction nicely').
action_verb(respond_to_introduction_nicely, present, 'respond to introduction nicely').
action_target_type(respond_to_introduction_nicely, other).
action_requires_target(respond_to_introduction_nicely).
action_range(respond_to_introduction_nicely, 5).
action_effect(respond_to_introduction_nicely, (ensemble_effect(Actor, nice, true))).
can_perform(Actor, respond_to_introduction_nicely, Target) :- true.

%% respond_to_introduction_feeling_forgotten
% Action: Respond to introduction feeling forgotten
% Source: Ensemble / conversational-small-talk

action(respond_to_introduction_feeling_forgotten, 'Respond to introduction feeling forgotten', social, 1).
action_difficulty(respond_to_introduction_feeling_forgotten, 0.5).
action_duration(respond_to_introduction_feeling_forgotten, 1).
action_category(respond_to_introduction_feeling_forgotten, conversational_small_talk).
action_source(respond_to_introduction_feeling_forgotten, ensemble).
action_verb(respond_to_introduction_feeling_forgotten, past, 'respond to introduction feeling forgotten').
action_verb(respond_to_introduction_feeling_forgotten, present, 'respond to introduction feeling forgotten').
action_target_type(respond_to_introduction_feeling_forgotten, other).
action_requires_target(respond_to_introduction_feeling_forgotten).
action_range(respond_to_introduction_feeling_forgotten, 5).
action_prerequisite(respond_to_introduction_feeling_forgotten, (relationship(Actor, Target, met))).
action_effect(respond_to_introduction_feeling_forgotten, (modify_network(Actor, Target, friendship, -, 1))).
% Can Actor perform this action?
can_perform(Actor, respond_to_introduction_feeling_forgotten, Target) :-
    relationship(Actor, Target, met).

%% respond_negatively
% Action: Respond Negatively
% Source: Ensemble / conversational-small-talk

action(respond_negatively, 'Respond Negatively', social, 1).
action_difficulty(respond_negatively, 0.5).
action_duration(respond_negatively, 1).
action_category(respond_negatively, conversational_small_talk).
action_source(respond_negatively, ensemble).
action_verb(respond_negatively, past, 'respond negatively').
action_verb(respond_negatively, present, 'respond negatively').
action_target_type(respond_negatively, self).
can_perform(Actor, respond_negatively) :- true.

%% respond_backhandedly
% Action: Respond Backhandedly
% Source: Ensemble / conversational-small-talk

action(respond_backhandedly, 'Respond Backhandedly', social, 1).
action_difficulty(respond_backhandedly, 0.5).
action_duration(respond_backhandedly, 1).
action_category(respond_backhandedly, conversational_small_talk).
action_source(respond_backhandedly, ensemble).
action_verb(respond_backhandedly, past, 'respond backhandedly').
action_verb(respond_backhandedly, present, 'respond backhandedly').
action_target_type(respond_backhandedly, self).
can_perform(Actor, respond_backhandedly) :- true.

%% respond_humbly
% Action: Respond Humbly
% Source: Ensemble / conversational-small-talk

action(respond_humbly, 'Respond Humbly', social, 1).
action_difficulty(respond_humbly, 0.5).
action_duration(respond_humbly, 1).
action_category(respond_humbly, conversational_small_talk).
action_source(respond_humbly, ensemble).
action_verb(respond_humbly, past, 'respond humbly').
action_verb(respond_humbly, present, 'respond humbly').
action_target_type(respond_humbly, self).
can_perform(Actor, respond_humbly) :- true.

%% talk_about_love_of_pizza
% Action: Talk about love of pizza
% Source: Ensemble / conversational-small-talk

action(talk_about_love_of_pizza, 'Talk about love of pizza', social, 1).
action_difficulty(talk_about_love_of_pizza, 0.5).
action_duration(talk_about_love_of_pizza, 1).
action_category(talk_about_love_of_pizza, conversational_small_talk).
action_source(talk_about_love_of_pizza, ensemble).
action_verb(talk_about_love_of_pizza, past, 'talk about love of pizza').
action_verb(talk_about_love_of_pizza, present, 'talk about love of pizza').
action_target_type(talk_about_love_of_pizza, self).
can_perform(Actor, talk_about_love_of_pizza) :- true.

%% guilt_about_pizza
% Action: Guilt about pizza
% Source: Ensemble / conversational-small-talk

action(guilt_about_pizza, 'Guilt about pizza', social, 1).
action_difficulty(guilt_about_pizza, 0.5).
action_duration(guilt_about_pizza, 1).
action_category(guilt_about_pizza, conversational_small_talk).
action_source(guilt_about_pizza, ensemble).
action_verb(guilt_about_pizza, past, 'guilt about pizza').
action_verb(guilt_about_pizza, present, 'guilt about pizza').
action_target_type(guilt_about_pizza, self).
can_perform(Actor, guilt_about_pizza) :- true.

%% respond_kindly_about_pizza
% Action: Respond kindly about pizza
% Source: Ensemble / conversational-small-talk

action(respond_kindly_about_pizza, 'Respond kindly about pizza', social, 1).
action_difficulty(respond_kindly_about_pizza, 0.5).
action_duration(respond_kindly_about_pizza, 1).
action_category(respond_kindly_about_pizza, conversational_small_talk).
action_source(respond_kindly_about_pizza, ensemble).
action_verb(respond_kindly_about_pizza, past, 'respond kindly about pizza').
action_verb(respond_kindly_about_pizza, present, 'respond kindly about pizza').
action_target_type(respond_kindly_about_pizza, other).
action_requires_target(respond_kindly_about_pizza).
action_range(respond_kindly_about_pizza, 5).
action_effect(respond_kindly_about_pizza, (modify_network(Actor, Target, friendship, +, 1))).
can_perform(Actor, respond_kindly_about_pizza, Target) :- true.

%% normal_chit_chat
% Action: Normal chit chat
% Source: Ensemble / conversational-small-talk

action(normal_chit_chat, 'Normal chit chat', social, 1).
action_difficulty(normal_chit_chat, 0.5).
action_duration(normal_chit_chat, 1).
action_category(normal_chit_chat, conversational_small_talk).
action_source(normal_chit_chat, ensemble).
action_verb(normal_chit_chat, past, 'normal chit chat').
action_verb(normal_chit_chat, present, 'normal chit chat').
action_target_type(normal_chit_chat, self).
can_perform(Actor, normal_chit_chat) :- true.

%% just_a_normal_chat_chat_response_to_someone_x_likes
% Action: Just a normal chat chat response to someone %x% likes
% Source: Ensemble / conversational-small-talk

action(just_a_normal_chat_chat_response_to_someone_x_likes, 'Just a normal chat chat response to someone %x% likes', social, 1).
action_difficulty(just_a_normal_chat_chat_response_to_someone_x_likes, 0.5).
action_duration(just_a_normal_chat_chat_response_to_someone_x_likes, 1).
action_category(just_a_normal_chat_chat_response_to_someone_x_likes, conversational_small_talk).
action_source(just_a_normal_chat_chat_response_to_someone_x_likes, ensemble).
action_verb(just_a_normal_chat_chat_response_to_someone_x_likes, past, 'just a normal chat chat response to someone %x% likes').
action_verb(just_a_normal_chat_chat_response_to_someone_x_likes, present, 'just a normal chat chat response to someone %x% likes').
action_target_type(just_a_normal_chat_chat_response_to_someone_x_likes, other).
action_requires_target(just_a_normal_chat_chat_response_to_someone_x_likes).
action_range(just_a_normal_chat_chat_response_to_someone_x_likes, 5).
action_effect(just_a_normal_chat_chat_response_to_someone_x_likes, (modify_network(Actor, Target, friendship, +, 1))).
action_influence(just_a_normal_chat_chat_response_to_someone_x_likes, (influence(unknown, _, _, weight, +, 0))).
can_perform(Actor, just_a_normal_chat_chat_response_to_someone_x_likes, Target) :- true.

%% politely_try_to_end_the_conversation
% Action: Politely try to end the conversation
% Source: Ensemble / conversational-small-talk

action(politely_try_to_end_the_conversation, 'Politely try to end the conversation', social, 1).
action_difficulty(politely_try_to_end_the_conversation, 0.5).
action_duration(politely_try_to_end_the_conversation, 1).
action_category(politely_try_to_end_the_conversation, conversational_small_talk).
action_source(politely_try_to_end_the_conversation, ensemble).
action_verb(politely_try_to_end_the_conversation, past, 'politely try to end the conversation').
action_verb(politely_try_to_end_the_conversation, present, 'politely try to end the conversation').
action_target_type(politely_try_to_end_the_conversation, other).
action_requires_target(politely_try_to_end_the_conversation).
action_range(politely_try_to_end_the_conversation, 5).
action_effect(politely_try_to_end_the_conversation, (modify_network(Actor, Target, respect, -, 1))).
can_perform(Actor, politely_try_to_end_the_conversation, Target) :- true.

%% stop_the_conversation
% Action: Stop the conversation
% Source: Ensemble / conversational-small-talk

action(stop_the_conversation, 'Stop the conversation', social, 1).
action_difficulty(stop_the_conversation, 0.5).
action_duration(stop_the_conversation, 1).
action_category(stop_the_conversation, conversational_small_talk).
action_source(stop_the_conversation, ensemble).
action_verb(stop_the_conversation, past, 'stop the conversation').
action_verb(stop_the_conversation, present, 'stop the conversation').
action_target_type(stop_the_conversation, other).
action_requires_target(stop_the_conversation).
action_range(stop_the_conversation, 5).
action_effect(stop_the_conversation, (modify_network(Actor, Target, friendship, -, 1))).
action_influence(stop_the_conversation, (influence(unknown, _, _, weight, +, 0))).
can_perform(Actor, stop_the_conversation, Target) :- true.

%% cool_nice_chatting
% Action: Cool, nice chatting
% Source: Ensemble / conversational-small-talk

action(cool_nice_chatting, 'Cool, nice chatting', social, 1).
action_difficulty(cool_nice_chatting, 0.5).
action_duration(cool_nice_chatting, 1).
action_category(cool_nice_chatting, conversational_small_talk).
action_source(cool_nice_chatting, ensemble).
action_verb(cool_nice_chatting, past, 'cool, nice chatting').
action_verb(cool_nice_chatting, present, 'cool, nice chatting').
action_target_type(cool_nice_chatting, self).
can_perform(Actor, cool_nice_chatting) :- true.

%% friendly_attempt_to_make_the_conversation_go_well
% Action: Friendly attempt to make the conversation go well
% Source: Ensemble / conversational-small-talk

action(friendly_attempt_to_make_the_conversation_go_well, 'Friendly attempt to make the conversation go well', social, 1).
action_difficulty(friendly_attempt_to_make_the_conversation_go_well, 0.5).
action_duration(friendly_attempt_to_make_the_conversation_go_well, 1).
action_category(friendly_attempt_to_make_the_conversation_go_well, conversational_small_talk).
action_source(friendly_attempt_to_make_the_conversation_go_well, ensemble).
action_verb(friendly_attempt_to_make_the_conversation_go_well, past, 'friendly attempt to make the conversation go well').
action_verb(friendly_attempt_to_make_the_conversation_go_well, present, 'friendly attempt to make the conversation go well').
action_target_type(friendly_attempt_to_make_the_conversation_go_well, self).
can_perform(Actor, friendly_attempt_to_make_the_conversation_go_well) :- true.

%% appreciative_response
% Action: Appreciative Response
% Source: Ensemble / conversational-small-talk

action(appreciative_response, 'Appreciative Response', social, 1).
action_difficulty(appreciative_response, 0.5).
action_duration(appreciative_response, 1).
action_category(appreciative_response, conversational_small_talk).
action_source(appreciative_response, ensemble).
action_verb(appreciative_response, past, 'appreciative response').
action_verb(appreciative_response, present, 'appreciative response').
action_target_type(appreciative_response, other).
action_requires_target(appreciative_response).
action_range(appreciative_response, 5).
action_effect(appreciative_response, (assert(relationship(Actor, Target, met)))).
action_influence(appreciative_response, (influence(unknown, _, _, weight, +, 0))).
can_perform(Actor, appreciative_response, Target) :- true.

%% try_to_repair_conversation
% Action: Try to repair conversation
% Source: Ensemble / conversational-small-talk

action(try_to_repair_conversation, 'Try to repair conversation', social, 1).
action_difficulty(try_to_repair_conversation, 0.5).
action_duration(try_to_repair_conversation, 1).
action_category(try_to_repair_conversation, conversational_small_talk).
action_source(try_to_repair_conversation, ensemble).
action_verb(try_to_repair_conversation, past, 'try to repair conversation').
action_verb(try_to_repair_conversation, present, 'try to repair conversation').
action_target_type(try_to_repair_conversation, self).
can_perform(Actor, try_to_repair_conversation) :- true.




