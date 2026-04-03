%% Ensemble Actions: hostile-antagonism
%% Source: data/ensemble/actions/hostile-antagonism.json
%% Converted: 2026-04-01T20:15:17.342Z
%% Total actions: 11

%% be_rude
% Action: BE RUDE
% Source: Ensemble / hostile-antagonism

action(be_rude, 'BE RUDE', hostile, 1).
action_difficulty(be_rude, 0.5).
action_duration(be_rude, 1).
action_category(be_rude, hostile_antagonism).
action_source(be_rude, ensemble).
action_verb(be_rude, past, 'be rude').
action_verb(be_rude, present, 'be rude').
action_target_type(be_rude, self).
action_leads_to(be_rude, annoyed_resonse).
action_leads_to(be_rude, dismiss_them).
action_leads_to(be_rude, lash_out).
action_leads_to(be_rude, tear_them_down).
action_leads_to(be_rude, leave_while_insulting_them).
action_leads_to(be_rude, rude_hello).
action_leads_to(be_rude, offended_response_to_a_greeting).
action_leads_to(be_rude, guilt_about_pizza).
action_leads_to(be_rude, ok_whatever).
action_leads_to(be_rude, shut_them_down).
action_leads_to(be_rude, ok_sure).
action_leads_to(be_rude, yeah_whatever_i_gotta_go).
action_leads_to(be_rude, i_m_offended_by_your_response).
action_leads_to(be_rude, back_off).
action_leads_to(be_rude, tease).
action_leads_to(be_rude, razz).
action_leads_to(be_rude, hey_what_was_that).
action_leads_to(be_rude, that_wasn_t_very_funny).
action_leads_to(be_rude, lighten_up).
action_leads_to(be_rude, roll_eyes).
can_perform(Actor, be_rude) :- true.

%% dismiss
% Action: DISMISS
% Source: Ensemble / hostile-antagonism

action(dismiss, 'DISMISS', hostile, 1).
action_difficulty(dismiss, 0.5).
action_duration(dismiss, 1).
action_category(dismiss, hostile_antagonism).
action_source(dismiss, ensemble).
action_verb(dismiss, past, 'dismiss').
action_verb(dismiss, present, 'dismiss').
action_target_type(dismiss, self).
action_leads_to(dismiss, don_t_know).
can_perform(Actor, dismiss) :- true.

%% dominate
% Action: DOMINATE
% Source: Ensemble / hostile-antagonism

action(dominate, 'DOMINATE', hostile, 1).
action_difficulty(dominate, 0.5).
action_duration(dominate, 1).
action_category(dominate, hostile_antagonism).
action_source(dominate, ensemble).
action_verb(dominate, past, 'dominate').
action_verb(dominate, present, 'dominate').
action_target_type(dominate, self).
action_leads_to(dominate, where_is_the_water_don_t_hold_out_on_me).
can_perform(Actor, dominate) :- true.

%% antagonize
% Action: ANTAGONIZE
% Source: Ensemble / hostile-antagonism

action(antagonize, 'ANTAGONIZE', hostile, 1).
action_difficulty(antagonize, 0.5).
action_duration(antagonize, 1).
action_category(antagonize, hostile_antagonism).
action_source(antagonize, ensemble).
action_verb(antagonize, past, 'antagonize').
action_verb(antagonize, present, 'antagonize').
action_target_type(antagonize, self).
action_leads_to(antagonize, antagonize_refusal_to_give_facts).
action_leads_to(antagonize, demand_ask_if_they_have).
action_leads_to(antagonize, demand_thing).
action_leads_to(antagonize, irritated_ask_for_something_in_return).
action_leads_to(antagonize, angrily_refuse_request).
action_leads_to(antagonize, begrudgingly_accept_thing).
action_leads_to(antagonize, insult).
action_leads_to(antagonize, respon_neg_to_insult_action).
action_leads_to(antagonize, say_goodbye_insultingly).
action_leads_to(antagonize, hate).
action_leads_to(antagonize, antagonize_refusal_to_answer_on_opinion_of_subject).
can_perform(Actor, antagonize) :- true.

%% behave_rudely
% Action: BEHAVE RUDELY
% Source: Ensemble / hostile-antagonism

action(behave_rudely, 'BEHAVE RUDELY', hostile, 1).
action_difficulty(behave_rudely, 0.5).
action_duration(behave_rudely, 1).
action_category(behave_rudely, hostile_antagonism).
action_source(behave_rudely, ensemble).
action_verb(behave_rudely, past, 'behave rudely').
action_verb(behave_rudely, present, 'behave rudely').
action_target_type(behave_rudely, self).
action_leads_to(behave_rudely, express_ingratitude_toward_benefactor).
action_leads_to(behave_rudely, look_with_disdain_after_discovering_a_lie).
action_leads_to(behave_rudely, behaverudely_successfully).
action_leads_to(behave_rudely, behaverudely_unsuccessfully).
can_perform(Actor, behave_rudely) :- true.

%% behaverudely_successfully
% Action: behaverudely successfully
% Source: Ensemble / hostile-antagonism

action(behaverudely_successfully, 'behaverudely successfully', hostile, 1).
action_difficulty(behaverudely_successfully, 0.5).
action_duration(behaverudely_successfully, 1).
action_category(behaverudely_successfully, hostile_antagonism).
action_source(behaverudely_successfully, ensemble).
action_parent(behaverudely_successfully, behave_rudely).
action_verb(behaverudely_successfully, past, 'behaverudely successfully').
action_verb(behaverudely_successfully, present, 'behaverudely successfully').
action_target_type(behaverudely_successfully, other).
action_requires_target(behaverudely_successfully).
action_range(behaverudely_successfully, 5).
action_is_accept(behaverudely_successfully).
action_effect(behaverudely_successfully, (retract(relationship(Actor, Target, esteem)))).
can_perform(Actor, behaverudely_successfully, Target) :- true.

%% behaverudely_unsuccessfully
% Action: behaverudely unsuccessfully
% Source: Ensemble / hostile-antagonism

action(behaverudely_unsuccessfully, 'behaverudely unsuccessfully', hostile, 1).
action_difficulty(behaverudely_unsuccessfully, 0.5).
action_duration(behaverudely_unsuccessfully, 1).
action_category(behaverudely_unsuccessfully, hostile_antagonism).
action_source(behaverudely_unsuccessfully, ensemble).
action_parent(behaverudely_unsuccessfully, behave_rudely).
action_verb(behaverudely_unsuccessfully, past, 'behaverudely unsuccessfully').
action_verb(behaverudely_unsuccessfully, present, 'behaverudely unsuccessfully').
action_target_type(behaverudely_unsuccessfully, other).
action_requires_target(behaverudely_unsuccessfully).
action_range(behaverudely_unsuccessfully, 5).
action_effect(behaverudely_unsuccessfully, (assert(relationship(Actor, Target, esteem)))).
can_perform(Actor, behaverudely_unsuccessfully, Target) :- true.

%% antagonize_refusal_to_answer_on_opinion_of_subject
% Action: antagonize refusal to answer on opinion of subject
% Source: Ensemble / hostile-antagonism

action(antagonize_refusal_to_answer_on_opinion_of_subject, 'antagonize refusal to answer on opinion of subject', hostile, 1).
action_difficulty(antagonize_refusal_to_answer_on_opinion_of_subject, 0.5).
action_duration(antagonize_refusal_to_answer_on_opinion_of_subject, 1).
action_category(antagonize_refusal_to_answer_on_opinion_of_subject, hostile_antagonism).
action_source(antagonize_refusal_to_answer_on_opinion_of_subject, ensemble).
action_parent(antagonize_refusal_to_answer_on_opinion_of_subject, antagonize).
action_verb(antagonize_refusal_to_answer_on_opinion_of_subject, past, 'antagonize refusal to answer on opinion of subject').
action_verb(antagonize_refusal_to_answer_on_opinion_of_subject, present, 'antagonize refusal to answer on opinion of subject').
action_target_type(antagonize_refusal_to_answer_on_opinion_of_subject, self).
can_perform(Actor, antagonize_refusal_to_answer_on_opinion_of_subject) :- true.

%% antagonize_refusal_to_give_facts
% Action: antagonize refusal to give facts
% Source: Ensemble / hostile-antagonism

action(antagonize_refusal_to_give_facts, 'antagonize refusal to give facts', hostile, 1).
action_difficulty(antagonize_refusal_to_give_facts, 0.5).
action_duration(antagonize_refusal_to_give_facts, 1).
action_category(antagonize_refusal_to_give_facts, hostile_antagonism).
action_source(antagonize_refusal_to_give_facts, ensemble).
action_parent(antagonize_refusal_to_give_facts, antagonize).
action_verb(antagonize_refusal_to_give_facts, past, 'antagonize refusal to give facts').
action_verb(antagonize_refusal_to_give_facts, present, 'antagonize refusal to give facts').
action_target_type(antagonize_refusal_to_give_facts, self).
can_perform(Actor, antagonize_refusal_to_give_facts) :- true.

%% i_m_offended_by_your_response
% Action: I’m offended by your response!
% Source: Ensemble / hostile-antagonism

action(i_m_offended_by_your_response, 'I''m offended by your response!', hostile, 1).
action_difficulty(i_m_offended_by_your_response, 0.5).
action_duration(i_m_offended_by_your_response, 1).
action_category(i_m_offended_by_your_response, hostile_antagonism).
action_source(i_m_offended_by_your_response, ensemble).
action_parent(i_m_offended_by_your_response, be_rude).
action_verb(i_m_offended_by_your_response, past, 'i''m offended by your response!').
action_verb(i_m_offended_by_your_response, present, 'i''m offended by your response!').
action_target_type(i_m_offended_by_your_response, self).
can_perform(Actor, i_m_offended_by_your_response) :- true.

%% dismiss_them
% Action: Dismiss Them
% Source: Ensemble / hostile-antagonism

action(dismiss_them, 'Dismiss Them', hostile, 1).
action_difficulty(dismiss_them, 0.5).
action_duration(dismiss_them, 1).
action_category(dismiss_them, hostile_antagonism).
action_source(dismiss_them, ensemble).
action_parent(dismiss_them, be_rude).
action_verb(dismiss_them, past, 'dismiss them').
action_verb(dismiss_them, present, 'dismiss them').
action_target_type(dismiss_them, self).
action_influence(dismiss_them, (influence(unknown, _, _, weight, +, 0))).
can_perform(Actor, dismiss_them) :- true.




