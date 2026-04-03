%% Ensemble Actions: conversational-questions
%% Source: data/ensemble/actions/conversational-questions.json
%% Converted: 2026-04-01T20:15:17.338Z
%% Total actions: 23

%% tear_off_the_mask
% Action: TEAR OFF THE MASK
% Source: Ensemble / conversational-questions

action(tear_off_the_mask, 'TEAR OFF THE MASK', social, 1).
action_difficulty(tear_off_the_mask, 0.5).
action_duration(tear_off_the_mask, 1).
action_category(tear_off_the_mask, conversational_questions).
action_source(tear_off_the_mask, ensemble).
action_verb(tear_off_the_mask, past, 'tear off the mask').
action_verb(tear_off_the_mask, present, 'tear off the mask').
action_target_type(tear_off_the_mask, self).
action_leads_to(tear_off_the_mask, tear_off_mask_successfully).
action_leads_to(tear_off_the_mask, tear_off_mask_unsuccessfully).
can_perform(Actor, tear_off_the_mask) :- true.

%% askoutterminal
% Action: askoutTerminal
% Source: Ensemble / conversational-questions

action(askoutterminal, 'askoutTerminal', social, 1).
action_difficulty(askoutterminal, 0.5).
action_duration(askoutterminal, 1).
action_category(askoutterminal, conversational_questions).
action_source(askoutterminal, ensemble).
action_verb(askoutterminal, past, 'askoutterminal').
action_verb(askoutterminal, present, 'askoutterminal').
action_target_type(askoutterminal, other).
action_requires_target(askoutterminal).
action_range(askoutterminal, 5).
action_is_accept(askoutterminal).
action_effect(askoutterminal, (assert(relationship(Actor, Target, involved with)))).
can_perform(Actor, askoutterminal, Target) :- true.

%% askoutterminalreject
% Action: askoutTerminalReject
% Source: Ensemble / conversational-questions

action(askoutterminalreject, 'askoutTerminalReject', social, 1).
action_difficulty(askoutterminalreject, 0.5).
action_duration(askoutterminalreject, 1).
action_category(askoutterminalreject, conversational_questions).
action_source(askoutterminalreject, ensemble).
action_verb(askoutterminalreject, past, 'askoutterminalreject').
action_verb(askoutterminalreject, present, 'askoutterminalreject').
action_target_type(askoutterminalreject, other).
action_requires_target(askoutterminalreject).
action_range(askoutterminalreject, 5).
action_effect(askoutterminalreject, (retract(relationship(Actor, Target, involved with)))).
can_perform(Actor, askoutterminalreject, Target) :- true.

%% tear_off_mask_successfully
% Action: tear off mask successfully
% Source: Ensemble / conversational-questions

action(tear_off_mask_successfully, 'tear off mask successfully', social, 1).
action_difficulty(tear_off_mask_successfully, 0.5).
action_duration(tear_off_mask_successfully, 1).
action_category(tear_off_mask_successfully, conversational_questions).
action_source(tear_off_mask_successfully, ensemble).
action_parent(tear_off_mask_successfully, tear_off_the_mask).
action_verb(tear_off_mask_successfully, past, 'tear off mask successfully').
action_verb(tear_off_mask_successfully, present, 'tear off mask successfully').
action_target_type(tear_off_mask_successfully, other).
action_requires_target(tear_off_mask_successfully).
action_range(tear_off_mask_successfully, 5).
action_is_accept(tear_off_mask_successfully).
action_effect(tear_off_mask_successfully, (modify_network(Target, Actor, credibility, -, 5))).
can_perform(Actor, tear_off_mask_successfully, Target) :- true.

%% tear_off_mask_unsuccessfully
% Action: tear off mask unsuccessfully
% Source: Ensemble / conversational-questions

action(tear_off_mask_unsuccessfully, 'tear off mask unsuccessfully', social, 1).
action_difficulty(tear_off_mask_unsuccessfully, 0.5).
action_duration(tear_off_mask_unsuccessfully, 1).
action_category(tear_off_mask_unsuccessfully, conversational_questions).
action_source(tear_off_mask_unsuccessfully, ensemble).
action_parent(tear_off_mask_unsuccessfully, tear_off_the_mask).
action_verb(tear_off_mask_unsuccessfully, past, 'tear off mask unsuccessfully').
action_verb(tear_off_mask_unsuccessfully, present, 'tear off mask unsuccessfully').
action_target_type(tear_off_mask_unsuccessfully, other).
action_requires_target(tear_off_mask_unsuccessfully).
action_range(tear_off_mask_unsuccessfully, 5).
action_effect(tear_off_mask_unsuccessfully, (modify_network(Target, Actor, credibility, +, 5))).
can_perform(Actor, tear_off_mask_unsuccessfully, Target) :- true.

%% would_you_tell_me_where_i_can_find_water
% Action: Would you tell me where I can find water?
% Source: Ensemble / conversational-questions

action(would_you_tell_me_where_i_can_find_water, 'Would you tell me where I can find water?', social, 1).
action_difficulty(would_you_tell_me_where_i_can_find_water, 0.5).
action_duration(would_you_tell_me_where_i_can_find_water, 1).
action_category(would_you_tell_me_where_i_can_find_water, conversational_questions).
action_source(would_you_tell_me_where_i_can_find_water, ensemble).
action_verb(would_you_tell_me_where_i_can_find_water, past, 'would you tell me where i can find water?').
action_verb(would_you_tell_me_where_i_can_find_water, present, 'would you tell me where i can find water?').
action_target_type(would_you_tell_me_where_i_can_find_water, other).
action_requires_target(would_you_tell_me_where_i_can_find_water).
action_range(would_you_tell_me_where_i_can_find_water, 5).
action_effect(would_you_tell_me_where_i_can_find_water, (ensemble_effect(Actor, neutral, true))).
can_perform(Actor, would_you_tell_me_where_i_can_find_water, Target) :- true.

%% where_is_the_water_don_t_hold_out_on_me
% Action: Where is the water? Don’t hold out on me.
% Source: Ensemble / conversational-questions

action(where_is_the_water_don_t_hold_out_on_me, 'Where is the water? Don''t hold out on me.', social, 1).
action_difficulty(where_is_the_water_don_t_hold_out_on_me, 0.5).
action_duration(where_is_the_water_don_t_hold_out_on_me, 1).
action_category(where_is_the_water_don_t_hold_out_on_me, conversational_questions).
action_source(where_is_the_water_don_t_hold_out_on_me, ensemble).
action_verb(where_is_the_water_don_t_hold_out_on_me, past, 'where is the water? don''t hold out on me.').
action_verb(where_is_the_water_don_t_hold_out_on_me, present, 'where is the water? don''t hold out on me.').
action_target_type(where_is_the_water_don_t_hold_out_on_me, other).
action_requires_target(where_is_the_water_don_t_hold_out_on_me).
action_range(where_is_the_water_don_t_hold_out_on_me, 5).
action_effect(where_is_the_water_don_t_hold_out_on_me, (ensemble_effect(Actor, rude, true))).
can_perform(Actor, where_is_the_water_don_t_hold_out_on_me, Target) :- true.

%% polite_ask_if_they_have
% Action: Polite ask if they have
% Source: Ensemble / conversational-questions

action(polite_ask_if_they_have, 'Polite ask if they have', social, 1).
action_difficulty(polite_ask_if_they_have, 0.5).
action_duration(polite_ask_if_they_have, 1).
action_category(polite_ask_if_they_have, conversational_questions).
action_source(polite_ask_if_they_have, ensemble).
action_verb(polite_ask_if_they_have, past, 'polite ask if they have').
action_verb(polite_ask_if_they_have, present, 'polite ask if they have').
action_target_type(polite_ask_if_they_have, self).
can_perform(Actor, polite_ask_if_they_have) :- true.

%% demand_ask_if_they_have
% Action: Demand ask if they have
% Source: Ensemble / conversational-questions

action(demand_ask_if_they_have, 'Demand ask if they have', social, 1).
action_difficulty(demand_ask_if_they_have, 0.5).
action_duration(demand_ask_if_they_have, 1).
action_category(demand_ask_if_they_have, conversational_questions).
action_source(demand_ask_if_they_have, ensemble).
action_verb(demand_ask_if_they_have, past, 'demand ask if they have').
action_verb(demand_ask_if_they_have, present, 'demand ask if they have').
action_target_type(demand_ask_if_they_have, self).
can_perform(Actor, demand_ask_if_they_have) :- true.

%% polite_ask_for
% Action: Polite ask for
% Source: Ensemble / conversational-questions

action(polite_ask_for, 'Polite ask for', social, 1).
action_difficulty(polite_ask_for, 0.5).
action_duration(polite_ask_for, 1).
action_category(polite_ask_for, conversational_questions).
action_source(polite_ask_for, ensemble).
action_verb(polite_ask_for, past, 'polite ask for').
action_verb(polite_ask_for, present, 'polite ask for').
action_target_type(polite_ask_for, self).
can_perform(Actor, polite_ask_for) :- true.

%% demand_thing
% Action: Demand thing
% Source: Ensemble / conversational-questions

action(demand_thing, 'Demand thing', social, 1).
action_difficulty(demand_thing, 0.5).
action_duration(demand_thing, 1).
action_category(demand_thing, conversational_questions).
action_source(demand_thing, ensemble).
action_verb(demand_thing, past, 'demand thing').
action_verb(demand_thing, present, 'demand thing').
action_target_type(demand_thing, self).
can_perform(Actor, demand_thing) :- true.

%% politely_ask_for_something_in_exchange
% Action: Politely ask for something in exchange
% Source: Ensemble / conversational-questions

action(politely_ask_for_something_in_exchange, 'Politely ask for something in exchange', social, 1).
action_difficulty(politely_ask_for_something_in_exchange, 0.5).
action_duration(politely_ask_for_something_in_exchange, 1).
action_category(politely_ask_for_something_in_exchange, conversational_questions).
action_source(politely_ask_for_something_in_exchange, ensemble).
action_verb(politely_ask_for_something_in_exchange, past, 'politely ask for something in exchange').
action_verb(politely_ask_for_something_in_exchange, present, 'politely ask for something in exchange').
action_target_type(politely_ask_for_something_in_exchange, self).
can_perform(Actor, politely_ask_for_something_in_exchange) :- true.

%% irritated_ask_for_something_in_return
% Action: Irritated ask for something in return
% Source: Ensemble / conversational-questions

action(irritated_ask_for_something_in_return, 'Irritated ask for something in return', social, 1).
action_difficulty(irritated_ask_for_something_in_return, 0.5).
action_duration(irritated_ask_for_something_in_return, 1).
action_category(irritated_ask_for_something_in_return, conversational_questions).
action_source(irritated_ask_for_something_in_return, ensemble).
action_verb(irritated_ask_for_something_in_return, past, 'irritated ask for something in return').
action_verb(irritated_ask_for_something_in_return, present, 'irritated ask for something in return').
action_target_type(irritated_ask_for_something_in_return, self).
can_perform(Actor, irritated_ask_for_something_in_return) :- true.

%% ask_opinion_on_subject
% Action: Ask Opinion on Subject
% Source: Ensemble / conversational-questions

action(ask_opinion_on_subject, 'Ask Opinion on Subject', social, 1).
action_difficulty(ask_opinion_on_subject, 0.5).
action_duration(ask_opinion_on_subject, 1).
action_category(ask_opinion_on_subject, conversational_questions).
action_source(ask_opinion_on_subject, ensemble).
action_verb(ask_opinion_on_subject, past, 'ask opinion on subject').
action_verb(ask_opinion_on_subject, present, 'ask opinion on subject').
action_target_type(ask_opinion_on_subject, self).
can_perform(Actor, ask_opinion_on_subject) :- true.

%% ask_reciprocal_question_of_opinion_on_subject
% Action: Ask reciprocal question of opinion on subject
% Source: Ensemble / conversational-questions

action(ask_reciprocal_question_of_opinion_on_subject, 'Ask reciprocal question of opinion on subject', social, 1).
action_difficulty(ask_reciprocal_question_of_opinion_on_subject, 0.5).
action_duration(ask_reciprocal_question_of_opinion_on_subject, 1).
action_category(ask_reciprocal_question_of_opinion_on_subject, conversational_questions).
action_source(ask_reciprocal_question_of_opinion_on_subject, ensemble).
action_verb(ask_reciprocal_question_of_opinion_on_subject, past, 'ask reciprocal question of opinion on subject').
action_verb(ask_reciprocal_question_of_opinion_on_subject, present, 'ask reciprocal question of opinion on subject').
action_target_type(ask_reciprocal_question_of_opinion_on_subject, self).
can_perform(Actor, ask_reciprocal_question_of_opinion_on_subject) :- true.

%% indifferent_refusal_to_answer_opinion_about_subject
% Action: Indifferent refusal to answer opinion about subject
% Source: Ensemble / conversational-questions

action(indifferent_refusal_to_answer_opinion_about_subject, 'Indifferent refusal to answer opinion about subject', social, 1).
action_difficulty(indifferent_refusal_to_answer_opinion_about_subject, 0.5).
action_duration(indifferent_refusal_to_answer_opinion_about_subject, 1).
action_category(indifferent_refusal_to_answer_opinion_about_subject, conversational_questions).
action_source(indifferent_refusal_to_answer_opinion_about_subject, ensemble).
action_verb(indifferent_refusal_to_answer_opinion_about_subject, past, 'indifferent refusal to answer opinion about subject').
action_verb(indifferent_refusal_to_answer_opinion_about_subject, present, 'indifferent refusal to answer opinion about subject').
action_target_type(indifferent_refusal_to_answer_opinion_about_subject, self).
can_perform(Actor, indifferent_refusal_to_answer_opinion_about_subject) :- true.

%% kind_refusal_to_answer_opinion_of_subject
% Action: kind refusal to answer opinion of subject
% Source: Ensemble / conversational-questions

action(kind_refusal_to_answer_opinion_of_subject, 'kind refusal to answer opinion of subject', social, 1).
action_difficulty(kind_refusal_to_answer_opinion_of_subject, 0.5).
action_duration(kind_refusal_to_answer_opinion_of_subject, 1).
action_category(kind_refusal_to_answer_opinion_of_subject, conversational_questions).
action_source(kind_refusal_to_answer_opinion_of_subject, ensemble).
action_verb(kind_refusal_to_answer_opinion_of_subject, past, 'kind refusal to answer opinion of subject').
action_verb(kind_refusal_to_answer_opinion_of_subject, present, 'kind refusal to answer opinion of subject').
action_target_type(kind_refusal_to_answer_opinion_of_subject, self).
can_perform(Actor, kind_refusal_to_answer_opinion_of_subject) :- true.

%% ask_for_facts_about_subject_action
% Action: ask for facts about subject action
% Source: Ensemble / conversational-questions

action(ask_for_facts_about_subject_action, 'ask for facts about subject action', social, 1).
action_difficulty(ask_for_facts_about_subject_action, 0.5).
action_duration(ask_for_facts_about_subject_action, 1).
action_category(ask_for_facts_about_subject_action, conversational_questions).
action_source(ask_for_facts_about_subject_action, ensemble).
action_verb(ask_for_facts_about_subject_action, past, 'ask for facts about subject action').
action_verb(ask_for_facts_about_subject_action, present, 'ask for facts about subject action').
action_target_type(ask_for_facts_about_subject_action, self).
can_perform(Actor, ask_for_facts_about_subject_action) :- true.

%% indifferent_refusal_to_answer_with_facts
% Action: Indifferent refusal to answer with facts
% Source: Ensemble / conversational-questions

action(indifferent_refusal_to_answer_with_facts, 'Indifferent refusal to answer with facts', social, 1).
action_difficulty(indifferent_refusal_to_answer_with_facts, 0.5).
action_duration(indifferent_refusal_to_answer_with_facts, 1).
action_category(indifferent_refusal_to_answer_with_facts, conversational_questions).
action_source(indifferent_refusal_to_answer_with_facts, ensemble).
action_verb(indifferent_refusal_to_answer_with_facts, past, 'indifferent refusal to answer with facts').
action_verb(indifferent_refusal_to_answer_with_facts, present, 'indifferent refusal to answer with facts').
action_target_type(indifferent_refusal_to_answer_with_facts, self).
can_perform(Actor, indifferent_refusal_to_answer_with_facts) :- true.

%% say_that_don_t_know_facts_though_knowing
% Action: Say that don’t know facts though knowing
% Source: Ensemble / conversational-questions

action(say_that_don_t_know_facts_though_knowing, 'Say that don''t know facts though knowing', social, 1).
action_difficulty(say_that_don_t_know_facts_though_knowing, 0.5).
action_duration(say_that_don_t_know_facts_though_knowing, 1).
action_category(say_that_don_t_know_facts_though_knowing, conversational_questions).
action_source(say_that_don_t_know_facts_though_knowing, ensemble).
action_verb(say_that_don_t_know_facts_though_knowing, past, 'say that don''t know facts though knowing').
action_verb(say_that_don_t_know_facts_though_knowing, present, 'say that don''t know facts though knowing').
action_target_type(say_that_don_t_know_facts_though_knowing, self).
can_perform(Actor, say_that_don_t_know_facts_though_knowing) :- true.

%% not_knowing_any_facts_and_answering_with_that_action
% Action: Not knowing any facts and answering with that action
% Source: Ensemble / conversational-questions

action(not_knowing_any_facts_and_answering_with_that_action, 'Not knowing any facts and answering with that action', social, 1).
action_difficulty(not_knowing_any_facts_and_answering_with_that_action, 0.5).
action_duration(not_knowing_any_facts_and_answering_with_that_action, 1).
action_category(not_knowing_any_facts_and_answering_with_that_action, conversational_questions).
action_source(not_knowing_any_facts_and_answering_with_that_action, ensemble).
action_verb(not_knowing_any_facts_and_answering_with_that_action, past, 'not knowing any facts and answering with that action').
action_verb(not_knowing_any_facts_and_answering_with_that_action, present, 'not knowing any facts and answering with that action').
action_target_type(not_knowing_any_facts_and_answering_with_that_action, self).
can_perform(Actor, not_knowing_any_facts_and_answering_with_that_action) :- true.

%% reciprocal_question_about_facts_about_subject_action
% Action: reciprocal question about facts about subject action
% Source: Ensemble / conversational-questions

action(reciprocal_question_about_facts_about_subject_action, 'reciprocal question about facts about subject action', social, 1).
action_difficulty(reciprocal_question_about_facts_about_subject_action, 0.5).
action_duration(reciprocal_question_about_facts_about_subject_action, 1).
action_category(reciprocal_question_about_facts_about_subject_action, conversational_questions).
action_source(reciprocal_question_about_facts_about_subject_action, ensemble).
action_verb(reciprocal_question_about_facts_about_subject_action, past, 'reciprocal question about facts about subject action').
action_verb(reciprocal_question_about_facts_about_subject_action, present, 'reciprocal question about facts about subject action').
action_target_type(reciprocal_question_about_facts_about_subject_action, self).
can_perform(Actor, reciprocal_question_about_facts_about_subject_action) :- true.

%% thank_for_info_about_facts_about_subject
% Action: Thank for info about facts about subject
% Source: Ensemble / conversational-questions

action(thank_for_info_about_facts_about_subject, 'Thank for info about facts about subject', social, 1).
action_difficulty(thank_for_info_about_facts_about_subject, 0.5).
action_duration(thank_for_info_about_facts_about_subject, 1).
action_category(thank_for_info_about_facts_about_subject, conversational_questions).
action_source(thank_for_info_about_facts_about_subject, ensemble).
action_verb(thank_for_info_about_facts_about_subject, past, 'thank for info about facts about subject').
action_verb(thank_for_info_about_facts_about_subject, present, 'thank for info about facts about subject').
action_target_type(thank_for_info_about_facts_about_subject, other).
action_requires_target(thank_for_info_about_facts_about_subject).
action_range(thank_for_info_about_facts_about_subject, 5).
action_effect(thank_for_info_about_facts_about_subject, (modify_network(Actor, Target, gratitude, +, 1))).
can_perform(Actor, thank_for_info_about_facts_about_subject, Target) :- true.




