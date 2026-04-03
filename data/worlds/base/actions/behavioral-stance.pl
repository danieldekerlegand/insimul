%% Ensemble Actions: behavioral-stance
%% Source: data/ensemble/actions/behavioral-stance.json
%% Converted: 2026-04-01T20:15:17.332Z
%% Total actions: 4

%% be_reluctant
% Action: BE RELUCTANT
% Source: Ensemble / behavioral-stance

action(be_reluctant, 'BE RELUCTANT', social, 1).
action_difficulty(be_reluctant, 0.5).
action_duration(be_reluctant, 1).
action_category(be_reluctant, behavioral_stance).
action_source(be_reluctant, ensemble).
action_verb(be_reluctant, past, 'be reluctant').
action_verb(be_reluctant, present, 'be reluctant').
action_target_type(be_reluctant, self).
action_leads_to(be_reluctant, reluctantly_give_info).
action_leads_to(be_reluctant, subtle_frown).
can_perform(Actor, be_reluctant) :- true.

%% be_hospitable
% Action: BE HOSPITABLE
% Source: Ensemble / behavioral-stance

action(be_hospitable, 'BE HOSPITABLE', social, 1).
action_difficulty(be_hospitable, 0.5).
action_duration(be_hospitable, 1).
action_category(be_hospitable, behavioral_stance).
action_source(be_hospitable, ensemble).
action_verb(be_hospitable, past, 'be hospitable').
action_verb(be_hospitable, present, 'be hospitable').
action_target_type(be_hospitable, self).
action_leads_to(be_hospitable, hello_honorable_villager).
action_leads_to(be_hospitable, nice_greet_reply).
action_leads_to(be_hospitable, honorable_villager_could_you_please_tell_me_where_the_water_is).
can_perform(Actor, be_hospitable) :- true.

%% be_indifferent
% Action: BE INDIFFERENT
% Source: Ensemble / behavioral-stance

action(be_indifferent, 'BE INDIFFERENT', social, 1).
action_difficulty(be_indifferent, 0.5).
action_duration(be_indifferent, 1).
action_category(be_indifferent, behavioral_stance).
action_source(be_indifferent, ensemble).
action_verb(be_indifferent, past, 'be indifferent').
action_verb(be_indifferent, present, 'be indifferent').
action_target_type(be_indifferent, self).
action_leads_to(be_indifferent, say_goodbye).
action_leads_to(be_indifferent, goodbye_response).
action_leads_to(be_indifferent, hi).
action_leads_to(be_indifferent, would_you_tell_me_where_i_can_find_water).
action_leads_to(be_indifferent, greet).
action_leads_to(be_indifferent, respond_to_insult_neutrally).
action_leads_to(be_indifferent, introduce_self_action_going_first).
action_leads_to(be_indifferent, respond_to_introduction_nicely).
action_leads_to(be_indifferent, respond_to_introduction_feeling_forgotten).
action_leads_to(be_indifferent, ask_opinion_on_subject).
action_leads_to(be_indifferent, very_positive_towards_subject).
action_leads_to(be_indifferent, positive_towards_subject).
action_leads_to(be_indifferent, indifferent_towards_subject_answer).
action_leads_to(be_indifferent, ask_reciprocal_question_of_opinion_on_subject).
action_leads_to(be_indifferent, antagonize_refusal_to_answer_on_opinion_of_subject).
action_leads_to(be_indifferent, indifferent_refusal_to_answer_opinion_about_subject).
action_leads_to(be_indifferent, ask_for_facts_about_subject_action).
action_leads_to(be_indifferent, indifferent_refusal_to_answer_with_facts).
action_leads_to(be_indifferent, say_that_don_t_know_facts_though_knowing).
action_leads_to(be_indifferent, not_knowing_any_facts_and_answering_with_that_action).
action_leads_to(be_indifferent, reciprocal_question_about_facts_about_subject_action).
action_leads_to(be_indifferent, thank_for_info_about_facts_about_subject).
can_perform(Actor, be_indifferent) :- true.

%% be_kind
% Action: BE KIND
% Source: Ensemble / behavioral-stance

action(be_kind, 'BE KIND', social, 1).
action_difficulty(be_kind, 0.5).
action_duration(be_kind, 1).
action_category(be_kind, behavioral_stance).
action_source(be_kind, ensemble).
action_verb(be_kind, past, 'be kind').
action_verb(be_kind, present, 'be kind').
action_target_type(be_kind, self).
action_leads_to(be_kind, reintroduce_self).
action_leads_to(be_kind, humorous_correction).
action_leads_to(be_kind, appreciative_response).
action_leads_to(be_kind, excuse_self_politely).
action_leads_to(be_kind, misunderstanding).
action_leads_to(be_kind, try_to_repair_conversation).
action_leads_to(be_kind, oblige_them).
action_leads_to(be_kind, apologize_for_misunderstanding).
action_leads_to(be_kind, polite_ask_if_they_have).
action_leads_to(be_kind, don_t_have).
action_leads_to(be_kind, polite_ask_for).
action_leads_to(be_kind, politely_refuse).
action_leads_to(be_kind, gladly_acquire_thing).
action_leads_to(be_kind, polite_refuse_to_acquire).
action_leads_to(be_kind, respond_to_greeting).
action_leads_to(be_kind, respond_positively_and_caring_to_insult_action).
action_leads_to(be_kind, apologise_for_insult).
action_leads_to(be_kind, say_goodbye_kindly).
action_leads_to(be_kind, goodbye_response).
action_leads_to(be_kind, kind_refusal_to_answer_opinion_of_subject).
action_leads_to(be_kind, polite_hello).
action_leads_to(be_kind, friendly_response_to_a_greeting).
action_leads_to(be_kind, talk_about_love_of_pizza).
action_leads_to(be_kind, what_should_we_get).
action_leads_to(be_kind, respond_kindly_about_pizza).
action_leads_to(be_kind, normal_chit_chat).
action_leads_to(be_kind, just_a_normal_chat_chat_response_to_someone_x_likes).
action_leads_to(be_kind, politely_try_to_end_the_conversation).
action_leads_to(be_kind, stop_the_conversation).
action_leads_to(be_kind, cool_nice_chatting).
action_leads_to(be_kind, friendly_attempt_to_make_the_conversation_go_well).
action_leads_to(be_kind, let_s_agree_to_disagree).
action_leads_to(be_kind, tell_a_joke).
action_leads_to(be_kind, joke_around_with_a_stranger).
action_leads_to(be_kind, laugh_and_make_a_joke).
action_leads_to(be_kind, that_was_sort_of_offensive).
action_leads_to(be_kind, compliment).
action_leads_to(be_kind, politely_excuse_self).
action_leads_to(be_kind, try_to_make_another_joke).
action_leads_to(be_kind, apologize).
action_leads_to(be_kind, chuckle).
action_leads_to(be_kind, introduce_self).
action_leads_to(be_kind, introduce_self_back).
action_leads_to(be_kind, learn_more_about_them).
action_leads_to(be_kind, share_something_about_yourself).
action_leads_to(be_kind, share_something_you_are_excited_about).
can_perform(Actor, be_kind) :- true.

