%% Ensemble Actions — Combined
%% Generated: 2026-04-01T20:15:17.348Z
%% Total: 475 actions from 38 categories

%% ═══════════════════════════════════════════════════════════
%% Category: behavioral-stance
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: behavioral-stance
%% Source: data/ensemble/actions/behavioral-stance.json
%% Converted: 2026-04-01T20:15:17.348Z
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

%% ═══════════════════════════════════════════════════════════
%% Category: conversational-farewell
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: conversational-farewell
%% Source: data/ensemble/actions/conversational-farewell.json
%% Converted: 2026-04-01T20:15:17.348Z
%% Total actions: 12

%% discretely_leave_the_theatre_and_ask_for_ticket_refurbishment_but_being_noticed
% Action: discretely leave the theatre and ask for ticket refurbishment, but being noticed
% Source: Ensemble / conversational-farewell

action(discretely_leave_the_theatre_and_ask_for_ticket_refurbishment_but_being_noticed, 'discretely leave the theatre and ask for ticket refurbishment, but being noticed', social, 1).
action_difficulty(discretely_leave_the_theatre_and_ask_for_ticket_refurbishment_but_being_noticed, 0.5).
action_duration(discretely_leave_the_theatre_and_ask_for_ticket_refurbishment_but_being_noticed, 1).
action_category(discretely_leave_the_theatre_and_ask_for_ticket_refurbishment_but_being_noticed, conversational_farewell).
action_source(discretely_leave_the_theatre_and_ask_for_ticket_refurbishment_but_being_noticed, ensemble).
action_verb(discretely_leave_the_theatre_and_ask_for_ticket_refurbishment_but_being_noticed, past, 'discretely leave the theatre and ask for ticket refurbishment, but being noticed').
action_verb(discretely_leave_the_theatre_and_ask_for_ticket_refurbishment_but_being_noticed, present, 'discretely leave the theatre and ask for ticket refurbishment, but being noticed').
action_target_type(discretely_leave_the_theatre_and_ask_for_ticket_refurbishment_but_being_noticed, other).
action_requires_target(discretely_leave_the_theatre_and_ask_for_ticket_refurbishment_but_being_noticed).
action_range(discretely_leave_the_theatre_and_ask_for_ticket_refurbishment_but_being_noticed, 5).
action_prerequisite(discretely_leave_the_theatre_and_ask_for_ticket_refurbishment_but_being_noticed, (trait(Actor, shy))).
action_prerequisite(discretely_leave_the_theatre_and_ask_for_ticket_refurbishment_but_being_noticed, (ensemble_condition(Actor, financially dependent on, true))).
action_effect(discretely_leave_the_theatre_and_ask_for_ticket_refurbishment_but_being_noticed, (ensemble_effect(Actor, caught in a lie by, true))).
action_effect(discretely_leave_the_theatre_and_ask_for_ticket_refurbishment_but_being_noticed, (modify_network(Target, Actor, curiosity, +, 5))).
% Can Actor perform this action?
can_perform(Actor, discretely_leave_the_theatre_and_ask_for_ticket_refurbishment_but_being_noticed, Target) :-
    trait(Actor, shy),
    ensemble_condition(Actor, financially dependent on, true).

%% say_goodbye
% Action: Say Goodbye
% Source: Ensemble / conversational-farewell

action(say_goodbye, 'Say Goodbye', social, 1).
action_difficulty(say_goodbye, 0.5).
action_duration(say_goodbye, 1).
action_category(say_goodbye, conversational_farewell).
action_source(say_goodbye, ensemble).
action_verb(say_goodbye, past, 'say goodbye').
action_verb(say_goodbye, present, 'say goodbye').
action_target_type(say_goodbye, self).
can_perform(Actor, say_goodbye) :- true.

%% goodbye_response
% Action: Goodbye Response
% Source: Ensemble / conversational-farewell

action(goodbye_response, 'Goodbye Response', social, 1).
action_difficulty(goodbye_response, 0.5).
action_duration(goodbye_response, 1).
action_category(goodbye_response, conversational_farewell).
action_source(goodbye_response, ensemble).
action_verb(goodbye_response, past, 'goodbye response').
action_verb(goodbye_response, present, 'goodbye response').
action_target_type(goodbye_response, self).
can_perform(Actor, goodbye_response) :- true.

%% say_goodbye_kindly
% Action: Say Goodbye kindly
% Source: Ensemble / conversational-farewell

action(say_goodbye_kindly, 'Say Goodbye kindly', social, 1).
action_difficulty(say_goodbye_kindly, 0.5).
action_duration(say_goodbye_kindly, 1).
action_category(say_goodbye_kindly, conversational_farewell).
action_source(say_goodbye_kindly, ensemble).
action_verb(say_goodbye_kindly, past, 'say goodbye kindly').
action_verb(say_goodbye_kindly, present, 'say goodbye kindly').
action_target_type(say_goodbye_kindly, self).
can_perform(Actor, say_goodbye_kindly) :- true.

%% say_goodbye_insultingly
% Action: Say Goodbye insultingly
% Source: Ensemble / conversational-farewell

action(say_goodbye_insultingly, 'Say Goodbye insultingly', social, 1).
action_difficulty(say_goodbye_insultingly, 0.5).
action_duration(say_goodbye_insultingly, 1).
action_category(say_goodbye_insultingly, conversational_farewell).
action_source(say_goodbye_insultingly, ensemble).
action_verb(say_goodbye_insultingly, past, 'say goodbye insultingly').
action_verb(say_goodbye_insultingly, present, 'say goodbye insultingly').
action_target_type(say_goodbye_insultingly, self).
can_perform(Actor, say_goodbye_insultingly) :- true.

%% goodbye_response
% Action: Goodbye Response
% Source: Ensemble / conversational-farewell

action(goodbye_response, 'Goodbye Response', social, 1).
action_difficulty(goodbye_response, 0.5).
action_duration(goodbye_response, 1).
action_category(goodbye_response, conversational_farewell).
action_source(goodbye_response, ensemble).
action_verb(goodbye_response, past, 'goodbye response').
action_verb(goodbye_response, present, 'goodbye response').
action_target_type(goodbye_response, self).
can_perform(Actor, goodbye_response) :- true.

%% say_goodbye
% Action: Say Goodbye
% Source: Ensemble / conversational-farewell

action(say_goodbye, 'Say Goodbye', social, 1).
action_difficulty(say_goodbye, 0.5).
action_duration(say_goodbye, 1).
action_category(say_goodbye, conversational_farewell).
action_source(say_goodbye, ensemble).
action_verb(say_goodbye, past, 'say goodbye').
action_verb(say_goodbye, present, 'say goodbye').
action_target_type(say_goodbye, self).
can_perform(Actor, say_goodbye) :- true.

%% goodbye_response
% Action: Goodbye Response
% Source: Ensemble / conversational-farewell

action(goodbye_response, 'Goodbye Response', social, 1).
action_difficulty(goodbye_response, 0.5).
action_duration(goodbye_response, 1).
action_category(goodbye_response, conversational_farewell).
action_source(goodbye_response, ensemble).
action_verb(goodbye_response, past, 'goodbye response').
action_verb(goodbye_response, present, 'goodbye response').
action_target_type(goodbye_response, self).
can_perform(Actor, goodbye_response) :- true.

%% politely_excuse_self
% Action: Politely excuse self
% Source: Ensemble / conversational-farewell

action(politely_excuse_self, 'Politely excuse self', social, 1).
action_difficulty(politely_excuse_self, 0.5).
action_duration(politely_excuse_self, 1).
action_category(politely_excuse_self, conversational_farewell).
action_source(politely_excuse_self, ensemble).
action_verb(politely_excuse_self, past, 'politely excuse self').
action_verb(politely_excuse_self, present, 'politely excuse self').
action_target_type(politely_excuse_self, self).
can_perform(Actor, politely_excuse_self) :- true.

%% excuse_self_politely
% Action: Excuse Self Politely
% Source: Ensemble / conversational-farewell

action(excuse_self_politely, 'Excuse Self Politely', social, 1).
action_difficulty(excuse_self_politely, 0.5).
action_duration(excuse_self_politely, 1).
action_category(excuse_self_politely, conversational_farewell).
action_source(excuse_self_politely, ensemble).
action_verb(excuse_self_politely, past, 'excuse self politely').
action_verb(excuse_self_politely, present, 'excuse self politely').
action_target_type(excuse_self_politely, other).
action_requires_target(excuse_self_politely).
action_range(excuse_self_politely, 5).
action_effect(excuse_self_politely, (assert(relationship(Actor, Target, met)))).
action_effect(excuse_self_politely, (modify_network(Actor, Target, respect, -, 1))).
action_effect(excuse_self_politely, (modify_network(Target, Actor, friendship, -, 1))).
can_perform(Actor, excuse_self_politely, Target) :- true.

%% leave_while_bragging_about_self
% Action: Leave while bragging about self
% Source: Ensemble / conversational-farewell

action(leave_while_bragging_about_self, 'Leave while bragging about self', social, 1).
action_difficulty(leave_while_bragging_about_self, 0.5).
action_duration(leave_while_bragging_about_self, 1).
action_category(leave_while_bragging_about_self, conversational_farewell).
action_source(leave_while_bragging_about_self, ensemble).
action_verb(leave_while_bragging_about_self, past, 'leave while bragging about self').
action_verb(leave_while_bragging_about_self, present, 'leave while bragging about self').
action_target_type(leave_while_bragging_about_self, other).
action_requires_target(leave_while_bragging_about_self).
action_range(leave_while_bragging_about_self, 5).
action_effect(leave_while_bragging_about_self, (assert(relationship(Actor, Target, met)))).
action_effect(leave_while_bragging_about_self, (modify_network(Target, Actor, respect, +, 1))).
can_perform(Actor, leave_while_bragging_about_self, Target) :- true.

%% leave_while_insulting_them
% Action: Leave while insulting them
% Source: Ensemble / conversational-farewell

action(leave_while_insulting_them, 'Leave while insulting them', social, 1).
action_difficulty(leave_while_insulting_them, 0.5).
action_duration(leave_while_insulting_them, 1).
action_category(leave_while_insulting_them, conversational_farewell).
action_source(leave_while_insulting_them, ensemble).
action_verb(leave_while_insulting_them, past, 'leave while insulting them').
action_verb(leave_while_insulting_them, present, 'leave while insulting them').
action_target_type(leave_while_insulting_them, other).
action_requires_target(leave_while_insulting_them).
action_range(leave_while_insulting_them, 5).
action_effect(leave_while_insulting_them, (assert(relationship(Actor, Target, met)))).
action_effect(leave_while_insulting_them, (modify_network(Actor, Target, friendship, -, 1))).
action_effect(leave_while_insulting_them, (modify_network(Target, Actor, friendship, -, 1))).
can_perform(Actor, leave_while_insulting_them, Target) :- true.

%% ═══════════════════════════════════════════════════════════
%% Category: conversational-greetings
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: conversational-greetings
%% Source: data/ensemble/actions/conversational-greetings.json
%% Converted: 2026-04-01T20:15:17.349Z
%% Total actions: 10

%% greet_in_subtle_modest_way
% Action: greet in subtle modest way
% Source: Ensemble / conversational-greetings

action(greet_in_subtle_modest_way, 'greet in subtle modest way', social, 1).
action_difficulty(greet_in_subtle_modest_way, 0.5).
action_duration(greet_in_subtle_modest_way, 1).
action_category(greet_in_subtle_modest_way, conversational_greetings).
action_source(greet_in_subtle_modest_way, ensemble).
action_verb(greet_in_subtle_modest_way, past, 'greet in subtle modest way').
action_verb(greet_in_subtle_modest_way, present, 'greet in subtle modest way').
action_target_type(greet_in_subtle_modest_way, other).
action_requires_target(greet_in_subtle_modest_way).
action_range(greet_in_subtle_modest_way, 5).
action_is_accept(greet_in_subtle_modest_way).
action_prerequisite(greet_in_subtle_modest_way, (attribute(Actor, sophistication, V), V < 50)).
action_prerequisite(greet_in_subtle_modest_way, (attribute(Actor, social standing, V), V < 50)).
action_prerequisite(greet_in_subtle_modest_way, (attribute(Target, social standing, V), V > 60)).
action_prerequisite(greet_in_subtle_modest_way, (\+ trait(Target, vain))).
action_prerequisite(greet_in_subtle_modest_way, (trait(Actor, modest))).
action_effect(greet_in_subtle_modest_way, (modify_network(Target, Actor, affinity, +, 5))).
% Can Actor perform this action?
can_perform(Actor, greet_in_subtle_modest_way, Target) :-
    attribute(Actor, sophistication, V), V < 50,
    attribute(Actor, social standing, V), V < 50,
    attribute(Target, social standing, V), V > 60,
    \+ trait(Target, vain),
    trait(Actor, modest).

%% hello_honorable_villager
% Action: Hello honorable villager.
% Source: Ensemble / conversational-greetings

action(hello_honorable_villager, 'Hello honorable villager.', social, 1).
action_difficulty(hello_honorable_villager, 0.5).
action_duration(hello_honorable_villager, 1).
action_category(hello_honorable_villager, conversational_greetings).
action_source(hello_honorable_villager, ensemble).
action_verb(hello_honorable_villager, past, 'hello honorable villager.').
action_verb(hello_honorable_villager, present, 'hello honorable villager.').
action_target_type(hello_honorable_villager, other).
action_requires_target(hello_honorable_villager).
action_range(hello_honorable_villager, 5).
action_effect(hello_honorable_villager, (ensemble_effect(Actor, formal, true))).
can_perform(Actor, hello_honorable_villager, Target) :- true.

%% greet_correction
% Action: Greet Correction
% Source: Ensemble / conversational-greetings

action(greet_correction, 'Greet Correction', social, 1).
action_difficulty(greet_correction, 0.5).
action_duration(greet_correction, 1).
action_category(greet_correction, conversational_greetings).
action_source(greet_correction, ensemble).
action_verb(greet_correction, past, 'greet correction').
action_verb(greet_correction, present, 'greet correction').
action_target_type(greet_correction, other).
action_requires_target(greet_correction).
action_range(greet_correction, 5).
action_effect(greet_correction, (ensemble_effect(Actor, met, true))).
action_effect(greet_correction, (ensemble_effect(Target, met, true))).
action_effect(greet_correction, (ensemble_effect(Actor, negative, true))).
can_perform(Actor, greet_correction, Target) :- true.

%% nice_greet_reply
% Action: Nice Greet Reply
% Source: Ensemble / conversational-greetings

action(nice_greet_reply, 'Nice Greet Reply', social, 1).
action_difficulty(nice_greet_reply, 0.5).
action_duration(nice_greet_reply, 1).
action_category(nice_greet_reply, conversational_greetings).
action_source(nice_greet_reply, ensemble).
action_verb(nice_greet_reply, past, 'nice greet reply').
action_verb(nice_greet_reply, present, 'nice greet reply').
action_target_type(nice_greet_reply, other).
action_requires_target(nice_greet_reply).
action_range(nice_greet_reply, 5).
action_effect(nice_greet_reply, (ensemble_effect(Actor, met, true))).
action_effect(nice_greet_reply, (ensemble_effect(Target, met, true))).
action_effect(nice_greet_reply, (ensemble_effect(Actor, positive, true))).
can_perform(Actor, nice_greet_reply, Target) :- true.

%% greet
% Action: Greet
% Source: Ensemble / conversational-greetings

action(greet, 'Greet', social, 1).
action_difficulty(greet, 0.5).
action_duration(greet, 1).
action_category(greet, conversational_greetings).
action_source(greet, ensemble).
action_verb(greet, past, 'greet').
action_verb(greet, present, 'greet').
action_target_type(greet, self).
can_perform(Actor, greet) :- true.

%% respond_to_greeting
% Action: Respond to greeting
% Source: Ensemble / conversational-greetings

action(respond_to_greeting, 'Respond to greeting', social, 1).
action_difficulty(respond_to_greeting, 0.5).
action_duration(respond_to_greeting, 1).
action_category(respond_to_greeting, conversational_greetings).
action_source(respond_to_greeting, ensemble).
action_verb(respond_to_greeting, past, 'respond to greeting').
action_verb(respond_to_greeting, present, 'respond to greeting').
action_target_type(respond_to_greeting, self).
can_perform(Actor, respond_to_greeting) :- true.

%% polite_hello
% Action: Polite hello
% Source: Ensemble / conversational-greetings

action(polite_hello, 'Polite hello', social, 1).
action_difficulty(polite_hello, 0.5).
action_duration(polite_hello, 1).
action_category(polite_hello, conversational_greetings).
action_source(polite_hello, ensemble).
action_verb(polite_hello, past, 'polite hello').
action_verb(polite_hello, present, 'polite hello').
action_target_type(polite_hello, self).
action_influence(polite_hello, (influence(unknown, _, _, weight, +, 0))).
can_perform(Actor, polite_hello) :- true.

%% rude_hello
% Action: Rude hello
% Source: Ensemble / conversational-greetings

action(rude_hello, 'Rude hello', social, 1).
action_difficulty(rude_hello, 0.5).
action_duration(rude_hello, 1).
action_category(rude_hello, conversational_greetings).
action_source(rude_hello, ensemble).
action_verb(rude_hello, past, 'rude hello').
action_verb(rude_hello, present, 'rude hello').
action_target_type(rude_hello, self).
can_perform(Actor, rude_hello) :- true.

%% friendly_response_to_a_greeting
% Action: Friendly response to a greeting
% Source: Ensemble / conversational-greetings

action(friendly_response_to_a_greeting, 'Friendly response to a greeting', social, 1).
action_difficulty(friendly_response_to_a_greeting, 0.5).
action_duration(friendly_response_to_a_greeting, 1).
action_category(friendly_response_to_a_greeting, conversational_greetings).
action_source(friendly_response_to_a_greeting, ensemble).
action_verb(friendly_response_to_a_greeting, past, 'friendly response to a greeting').
action_verb(friendly_response_to_a_greeting, present, 'friendly response to a greeting').
action_target_type(friendly_response_to_a_greeting, other).
action_requires_target(friendly_response_to_a_greeting).
action_range(friendly_response_to_a_greeting, 5).
action_effect(friendly_response_to_a_greeting, (modify_network(Actor, Target, friendship, +, 3))).
can_perform(Actor, friendly_response_to_a_greeting, Target) :- true.

%% offended_response_to_a_greeting
% Action: Offended response to a greeting
% Source: Ensemble / conversational-greetings

action(offended_response_to_a_greeting, 'Offended response to a greeting', social, 1).
action_difficulty(offended_response_to_a_greeting, 0.5).
action_duration(offended_response_to_a_greeting, 1).
action_category(offended_response_to_a_greeting, conversational_greetings).
action_source(offended_response_to_a_greeting, ensemble).
action_verb(offended_response_to_a_greeting, past, 'offended response to a greeting').
action_verb(offended_response_to_a_greeting, present, 'offended response to a greeting').
action_target_type(offended_response_to_a_greeting, self).
can_perform(Actor, offended_response_to_a_greeting) :- true.

%% ═══════════════════════════════════════════════════════════
%% Category: conversational-humor
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: conversational-humor
%% Source: data/ensemble/actions/conversational-humor.json
%% Converted: 2026-04-01T20:15:17.349Z
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

%% ═══════════════════════════════════════════════════════════
%% Category: conversational-introductions
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: conversational-introductions
%% Source: data/ensemble/actions/conversational-introductions.json
%% Converted: 2026-04-01T20:15:17.349Z
%% Total actions: 6

%% a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a
% Action: a rich person ask a non-rich person to introduce him to a higher rich person (a)
% Source: Ensemble / conversational-introductions

action(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, 'a rich person ask a non-rich person to introduce him to a higher rich person (a)', social, 1).
action_difficulty(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, 0.5).
action_duration(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, 1).
action_category(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, conversational_introductions).
action_source(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, ensemble).
action_verb(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, past, 'a rich person ask a non-rich person to introduce him to a higher rich person (a)').
action_verb(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, present, 'a rich person ask a non-rich person to introduce him to a higher rich person (a)').
action_target_type(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, other).
action_requires_target(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a).
action_range(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, 5).
action_is_accept(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a).
action_prerequisite(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, (trait(Actor, rich))).
action_prerequisite(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, (\+ trait(Target, rich))).
action_prerequisite(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, (trait('third', rich))).
action_prerequisite(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, (attribute(Actor, social standing, V), V > 60)).
action_prerequisite(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, (attribute('third', social standing, V), V > 85)).
action_prerequisite(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, (relationship(Target, 'third', friends))).
action_prerequisite(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, (\+ relationship(Actor, Target, strangers))).
action_effect(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, (modify_network(Target, Actor, credibility, -, 10))).
action_effect(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, (modify_attribute(Target, self-assuredness, +, 10))).
action_effect(a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, (modify_network(Target, Actor, credibility, +, 15))).
% Can Actor perform this action?
can_perform(Actor, a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a, Target) :-
    trait(Actor, rich),
    \+ trait(Target, rich),
    trait('third', rich),
    attribute(Actor, social standing, V), V > 60,
    attribute('third', social standing, V), V > 85,
    relationship(Target, 'third', friends),
    \+ relationship(Actor, Target, strangers).

%% introduce_self_action_going_first
% Action: Introduce self action, going first
% Source: Ensemble / conversational-introductions

action(introduce_self_action_going_first, 'Introduce self action, going first', social, 1).
action_difficulty(introduce_self_action_going_first, 0.5).
action_duration(introduce_self_action_going_first, 1).
action_category(introduce_self_action_going_first, conversational_introductions).
action_source(introduce_self_action_going_first, ensemble).
action_verb(introduce_self_action_going_first, past, 'introduce self action, going first').
action_verb(introduce_self_action_going_first, present, 'introduce self action, going first').
action_target_type(introduce_self_action_going_first, self).
can_perform(Actor, introduce_self_action_going_first) :- true.

%% introduce_self
% Action: Introduce Self
% Source: Ensemble / conversational-introductions

action(introduce_self, 'Introduce Self', social, 1).
action_difficulty(introduce_self, 0.5).
action_duration(introduce_self, 1).
action_category(introduce_self, conversational_introductions).
action_source(introduce_self, ensemble).
action_verb(introduce_self, past, 'introduce self').
action_verb(introduce_self, present, 'introduce self').
action_target_type(introduce_self, other).
action_requires_target(introduce_self).
action_range(introduce_self, 5).
action_prerequisite(introduce_self, (\+ relationship(Actor, Target, met))).
action_effect(introduce_self, (modify_network(Actor, Target, friendship, +, 1))).
% Can Actor perform this action?
can_perform(Actor, introduce_self, Target) :-
    \+ relationship(Actor, Target, met).

%% introduce_self_flirty
% Action: Introduce Self Flirty
% Source: Ensemble / conversational-introductions

action(introduce_self_flirty, 'Introduce Self Flirty', social, 1).
action_difficulty(introduce_self_flirty, 0.5).
action_duration(introduce_self_flirty, 1).
action_category(introduce_self_flirty, conversational_introductions).
action_source(introduce_self_flirty, ensemble).
action_verb(introduce_self_flirty, past, 'introduce self flirty').
action_verb(introduce_self_flirty, present, 'introduce self flirty').
action_target_type(introduce_self_flirty, other).
action_requires_target(introduce_self_flirty).
action_range(introduce_self_flirty, 5).
action_prerequisite(introduce_self_flirty, (\+ relationship(Actor, Target, met))).
action_effect(introduce_self_flirty, (modify_network(Actor, Target, attraction, +, 3))).
% Can Actor perform this action?
can_perform(Actor, introduce_self_flirty, Target) :-
    \+ relationship(Actor, Target, met).

%% reintroduce_self
% Action: Reintroduce Self
% Source: Ensemble / conversational-introductions

action(reintroduce_self, 'Reintroduce Self', social, 1).
action_difficulty(reintroduce_self, 0.5).
action_duration(reintroduce_self, 1).
action_category(reintroduce_self, conversational_introductions).
action_source(reintroduce_self, ensemble).
action_verb(reintroduce_self, past, 'reintroduce self').
action_verb(reintroduce_self, present, 'reintroduce self').
action_target_type(reintroduce_self, other).
action_requires_target(reintroduce_self).
action_range(reintroduce_self, 5).
action_prerequisite(reintroduce_self, (relationship(Actor, Target, met))).
action_effect(reintroduce_self, (modify_network(Actor, Target, friendship, +, 1))).
% Can Actor perform this action?
can_perform(Actor, reintroduce_self, Target) :-
    relationship(Actor, Target, met).

%% introduce_self_back
% Action: Introduce Self Back
% Source: Ensemble / conversational-introductions

action(introduce_self_back, 'Introduce Self Back', social, 1).
action_difficulty(introduce_self_back, 0.5).
action_duration(introduce_self_back, 1).
action_category(introduce_self_back, conversational_introductions).
action_source(introduce_self_back, ensemble).
action_verb(introduce_self_back, past, 'introduce self back').
action_verb(introduce_self_back, present, 'introduce self back').
action_target_type(introduce_self_back, other).
action_requires_target(introduce_self_back).
action_range(introduce_self_back, 5).
action_effect(introduce_self_back, (assert(relationship(Actor, Target, met)))).
action_effect(introduce_self_back, (modify_network(Actor, Target, friendship, +, 1))).
can_perform(Actor, introduce_self_back, Target) :- true.

%% ═══════════════════════════════════════════════════════════
%% Category: conversational-questions
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: conversational-questions
%% Source: data/ensemble/actions/conversational-questions.json
%% Converted: 2026-04-01T20:15:17.349Z
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

%% ═══════════════════════════════════════════════════════════
%% Category: conversational-small-talk
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: conversational-small-talk
%% Source: data/ensemble/actions/conversational-small-talk.json
%% Converted: 2026-04-01T20:15:17.349Z
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

%% ═══════════════════════════════════════════════════════════
%% Category: deceptive-betrayal
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: deceptive-betrayal
%% Source: data/ensemble/actions/deceptive-betrayal.json
%% Converted: 2026-04-01T20:15:17.349Z
%% Total actions: 4

%% betray
% Action: BETRAY
% Source: Ensemble / deceptive-betrayal

action(betray, 'BETRAY', deceptive, 1).
action_difficulty(betray, 0.5).
action_duration(betray, 1).
action_category(betray, deceptive_betrayal).
action_source(betray, ensemble).
action_verb(betray, past, 'betray').
action_verb(betray, present, 'betray').
action_target_type(betray, self).
action_leads_to(betray, greedy_ally_betrays_rich_man).
action_leads_to(betray, follow_advice_and_break_up).
action_leads_to(betray, betray_successfully).
action_leads_to(betray, betray_unsuccessfully).
can_perform(Actor, betray) :- true.

%% greedy_ally_betrays_rich_man
% Action: greedy ally betrays rich man
% Source: Ensemble / deceptive-betrayal

action(greedy_ally_betrays_rich_man, 'greedy ally betrays rich man', deceptive, 1).
action_difficulty(greedy_ally_betrays_rich_man, 0.5).
action_duration(greedy_ally_betrays_rich_man, 1).
action_category(greedy_ally_betrays_rich_man, deceptive_betrayal).
action_source(greedy_ally_betrays_rich_man, ensemble).
action_parent(greedy_ally_betrays_rich_man, betray).
action_verb(greedy_ally_betrays_rich_man, past, 'greedy ally betrays rich man').
action_verb(greedy_ally_betrays_rich_man, present, 'greedy ally betrays rich man').
action_target_type(greedy_ally_betrays_rich_man, other).
action_requires_target(greedy_ally_betrays_rich_man).
action_range(greedy_ally_betrays_rich_man, 5).
action_is_accept(greedy_ally_betrays_rich_man).
action_prerequisite(greedy_ally_betrays_rich_man, (\+ trait(Actor, rich))).
action_prerequisite(greedy_ally_betrays_rich_man, (trait(Target, rich))).
action_prerequisite(greedy_ally_betrays_rich_man, (relationship(Actor, Target, ally))).
action_prerequisite(greedy_ally_betrays_rich_man, (trait(Actor, greedy))).
action_prerequisite(greedy_ally_betrays_rich_man, (trait(Target, credulous))).
action_prerequisite(greedy_ally_betrays_rich_man, (trait(Actor, deceptive))).
action_effect(greedy_ally_betrays_rich_man, (retract(relationship(Target, Actor, ally)))).
% Can Actor perform this action?
can_perform(Actor, greedy_ally_betrays_rich_man, Target) :-
    \+ trait(Actor, rich),
    trait(Target, rich),
    relationship(Actor, Target, ally),
    trait(Actor, greedy),
    trait(Target, credulous),
    trait(Actor, deceptive).

%% betray_successfully
% Action: betray successfully
% Source: Ensemble / deceptive-betrayal

action(betray_successfully, 'betray successfully', deceptive, 1).
action_difficulty(betray_successfully, 0.5).
action_duration(betray_successfully, 1).
action_category(betray_successfully, deceptive_betrayal).
action_source(betray_successfully, ensemble).
action_parent(betray_successfully, betray).
action_verb(betray_successfully, past, 'betray successfully').
action_verb(betray_successfully, present, 'betray successfully').
action_target_type(betray_successfully, other).
action_requires_target(betray_successfully).
action_range(betray_successfully, 5).
action_is_accept(betray_successfully).
action_effect(betray_successfully, (retract(relationship(Actor, Target, ally)))).
can_perform(Actor, betray_successfully, Target) :- true.

%% betray_unsuccessfully
% Action: betray unsuccessfully
% Source: Ensemble / deceptive-betrayal

action(betray_unsuccessfully, 'betray unsuccessfully', deceptive, 1).
action_difficulty(betray_unsuccessfully, 0.5).
action_duration(betray_unsuccessfully, 1).
action_category(betray_unsuccessfully, deceptive_betrayal).
action_source(betray_unsuccessfully, ensemble).
action_parent(betray_unsuccessfully, betray).
action_verb(betray_unsuccessfully, past, 'betray unsuccessfully').
action_verb(betray_unsuccessfully, present, 'betray unsuccessfully').
action_target_type(betray_unsuccessfully, other).
action_requires_target(betray_unsuccessfully).
action_range(betray_unsuccessfully, 5).
action_effect(betray_unsuccessfully, (assert(relationship(Actor, Target, ally)))).
can_perform(Actor, betray_unsuccessfully, Target) :- true.

%% ═══════════════════════════════════════════════════════════
%% Category: deceptive-lying
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: deceptive-lying
%% Source: data/ensemble/actions/deceptive-lying.json
%% Converted: 2026-04-01T20:15:17.349Z
%% Total actions: 9

%% lie
% Action: LIE
% Source: Ensemble / deceptive-lying

action(lie, 'LIE', deceptive, 1).
action_difficulty(lie, 0.5).
action_duration(lie, 1).
action_category(lie, deceptive_lying).
action_source(lie, ensemble).
action_verb(lie, past, 'lie').
action_verb(lie, present, 'lie').
action_target_type(lie, self).
action_leads_to(lie, attractive_woman_lies_about_relationship_status_a).
action_leads_to(lie, attractive_woman_lies_about_relationship_status_r).
action_leads_to(lie, lie_successfully).
action_leads_to(lie, lie_unsuccessfully).
can_perform(Actor, lie) :- true.

%% attractive_woman_lies_about_relationship_status_a
% Action: attractive woman lies about relationship status (a)
% Source: Ensemble / deceptive-lying

action(attractive_woman_lies_about_relationship_status_a, 'attractive woman lies about relationship status (a)', deceptive, 1).
action_difficulty(attractive_woman_lies_about_relationship_status_a, 0.5).
action_duration(attractive_woman_lies_about_relationship_status_a, 1).
action_category(attractive_woman_lies_about_relationship_status_a, deceptive_lying).
action_source(attractive_woman_lies_about_relationship_status_a, ensemble).
action_parent(attractive_woman_lies_about_relationship_status_a, lie).
action_verb(attractive_woman_lies_about_relationship_status_a, past, 'attractive woman lies about relationship status (a)').
action_verb(attractive_woman_lies_about_relationship_status_a, present, 'attractive woman lies about relationship status (a)').
action_target_type(attractive_woman_lies_about_relationship_status_a, other).
action_requires_target(attractive_woman_lies_about_relationship_status_a).
action_range(attractive_woman_lies_about_relationship_status_a, 5).
action_is_accept(attractive_woman_lies_about_relationship_status_a).
action_prerequisite(attractive_woman_lies_about_relationship_status_a, (trait(Actor, female))).
action_prerequisite(attractive_woman_lies_about_relationship_status_a, (\+ relationship(Actor, Someone, married))).
action_prerequisite(attractive_woman_lies_about_relationship_status_a, (attribute(Actor, charisma, V), V > 70)).
action_prerequisite(attractive_woman_lies_about_relationship_status_a, (relationship(Target, Actor, esteem))).
action_prerequisite(attractive_woman_lies_about_relationship_status_a, (attribute(Actor, cunningness, V), V > 50)).
action_effect(attractive_woman_lies_about_relationship_status_a, (modify_network(Target, Actor, credibility, +, 5))).
% Can Actor perform this action?
can_perform(Actor, attractive_woman_lies_about_relationship_status_a, Target) :-
    trait(Actor, female),
    \+ relationship(Actor, Someone, married),
    attribute(Actor, charisma, V), V > 70,
    relationship(Target, Actor, esteem),
    attribute(Actor, cunningness, V), V > 50.

%% attractive_woman_lies_about_relationship_status_r
% Action: attractive woman lies about relationship status (r)
% Source: Ensemble / deceptive-lying

action(attractive_woman_lies_about_relationship_status_r, 'attractive woman lies about relationship status (r)', deceptive, 1).
action_difficulty(attractive_woman_lies_about_relationship_status_r, 0.5).
action_duration(attractive_woman_lies_about_relationship_status_r, 1).
action_category(attractive_woman_lies_about_relationship_status_r, deceptive_lying).
action_source(attractive_woman_lies_about_relationship_status_r, ensemble).
action_parent(attractive_woman_lies_about_relationship_status_r, lie).
action_verb(attractive_woman_lies_about_relationship_status_r, past, 'attractive woman lies about relationship status (r)').
action_verb(attractive_woman_lies_about_relationship_status_r, present, 'attractive woman lies about relationship status (r)').
action_target_type(attractive_woman_lies_about_relationship_status_r, other).
action_requires_target(attractive_woman_lies_about_relationship_status_r).
action_range(attractive_woman_lies_about_relationship_status_r, 5).
action_prerequisite(attractive_woman_lies_about_relationship_status_r, (trait(Actor, female))).
action_prerequisite(attractive_woman_lies_about_relationship_status_r, (attribute(Actor, charisma, V), V > 70)).
action_prerequisite(attractive_woman_lies_about_relationship_status_r, (network(Target, Actor, credibility, V), V < 60)).
action_effect(attractive_woman_lies_about_relationship_status_r, (ensemble_effect(Actor, caught in a lie by, true))).
action_effect(attractive_woman_lies_about_relationship_status_r, (modify_network(Target, Actor, credibility, -, 30))).
action_effect(attractive_woman_lies_about_relationship_status_r, (modify_network(Target, Actor, affinity, -, 15))).
action_effect(attractive_woman_lies_about_relationship_status_r, (modify_network(Actor, Target, affinity, -, 15))).
% Can Actor perform this action?
can_perform(Actor, attractive_woman_lies_about_relationship_status_r, Target) :-
    trait(Actor, female),
    attribute(Actor, charisma, V), V > 70,
    network(Target, Actor, credibility, V), V < 60.

%% lie_successfully
% Action: lie successfully
% Source: Ensemble / deceptive-lying

action(lie_successfully, 'lie successfully', deceptive, 1).
action_difficulty(lie_successfully, 0.5).
action_duration(lie_successfully, 1).
action_category(lie_successfully, deceptive_lying).
action_source(lie_successfully, ensemble).
action_parent(lie_successfully, lie).
action_verb(lie_successfully, past, 'lie successfully').
action_verb(lie_successfully, present, 'lie successfully').
action_target_type(lie_successfully, self).
action_is_accept(lie_successfully).
can_perform(Actor, lie_successfully) :- true.

%% lie_unsuccessfully
% Action: lie unsuccessfully
% Source: Ensemble / deceptive-lying

action(lie_unsuccessfully, 'lie unsuccessfully', deceptive, 1).
action_difficulty(lie_unsuccessfully, 0.5).
action_duration(lie_unsuccessfully, 1).
action_category(lie_unsuccessfully, deceptive_lying).
action_source(lie_unsuccessfully, ensemble).
action_parent(lie_unsuccessfully, lie).
action_verb(lie_unsuccessfully, past, 'lie unsuccessfully').
action_verb(lie_unsuccessfully, present, 'lie unsuccessfully').
action_target_type(lie_unsuccessfully, other).
action_requires_target(lie_unsuccessfully).
action_range(lie_unsuccessfully, 5).
action_effect(lie_unsuccessfully, (modify_network(Target, Actor, credibility, -, 5))).
can_perform(Actor, lie_unsuccessfully, Target) :- true.

%% virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout
% Action: virtuous tells clergy of being preyed upon, is disbelieved by devout
% Source: Ensemble / deceptive-lying

action(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, 'virtuous tells clergy of being preyed upon, is disbelieved by devout', deceptive, 1).
action_difficulty(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, 0.5).
action_duration(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, 1).
action_category(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, deceptive_lying).
action_source(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, ensemble).
action_verb(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, past, 'virtuous tells clergy of being preyed upon, is disbelieved by devout').
action_verb(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, present, 'virtuous tells clergy of being preyed upon, is disbelieved by devout').
action_target_type(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, other).
action_requires_target(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout).
action_range(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, 5).
action_prerequisite(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, (trait(Actor, virtuous))).
action_prerequisite(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, (trait(Actor, young))).
action_prerequisite(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, (trait(Target, clergy))).
action_prerequisite(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, (trait(Target, devout))).
action_prerequisite(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, (network('third', Target, affinity, V), V > 50)).
action_prerequisite(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, (\+ relationship('third', Target, strangers))).
action_prerequisite(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, (trait('third', rich))).
action_prerequisite(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, (trait('third', hypocritical))).
action_effect(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, (retract(relationship(Target, Actor, esteem)))).
action_effect(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, (modify_network(Target, Actor, affinity, -, 10))).
action_effect(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, (ensemble_effect('third', flirted with, true))).
action_effect(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, (assert(status(Actor, upset)))).
action_effect(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, (modify_attribute(Actor, self-assuredness, -, 15))).
action_effect(virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, (ensemble_effect(Target, suspicious of, true))).
% Can Actor perform this action?
can_perform(Actor, virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout, Target) :-
    trait(Actor, virtuous),
    trait(Actor, young),
    trait(Target, clergy),
    trait(Target, devout),
    network('third', Target, affinity, V), V > 50,
    \+ relationship('third', Target, strangers),
    trait('third', rich),
    trait('third', hypocritical).

%% lie_about_not_liking_something_to_get_attention
% Action: lie about not liking something to get attention
% Source: Ensemble / deceptive-lying

action(lie_about_not_liking_something_to_get_attention, 'lie about not liking something to get attention', deceptive, 1).
action_difficulty(lie_about_not_liking_something_to_get_attention, 0.5).
action_duration(lie_about_not_liking_something_to_get_attention, 1).
action_category(lie_about_not_liking_something_to_get_attention, deceptive_lying).
action_source(lie_about_not_liking_something_to_get_attention, ensemble).
action_verb(lie_about_not_liking_something_to_get_attention, past, 'lie about not liking something to get attention').
action_verb(lie_about_not_liking_something_to_get_attention, present, 'lie about not liking something to get attention').
action_target_type(lie_about_not_liking_something_to_get_attention, other).
action_requires_target(lie_about_not_liking_something_to_get_attention).
action_range(lie_about_not_liking_something_to_get_attention, 5).
action_is_accept(lie_about_not_liking_something_to_get_attention).
action_prerequisite(lie_about_not_liking_something_to_get_attention, (network(Actor, Target, affinity, V), V > 60)).
action_prerequisite(lie_about_not_liking_something_to_get_attention, (trait(Actor, deceptive))).
action_prerequisite(lie_about_not_liking_something_to_get_attention, (trait(Target, credulous))).
action_prerequisite(lie_about_not_liking_something_to_get_attention, (attribute(Actor, cunningness, V), V > 50)).
action_effect(lie_about_not_liking_something_to_get_attention, (modify_network(Target, Actor, curiosity, +, 10))).
% Can Actor perform this action?
can_perform(Actor, lie_about_not_liking_something_to_get_attention, Target) :-
    network(Actor, Target, affinity, V), V > 60,
    trait(Actor, deceptive),
    trait(Target, credulous),
    attribute(Actor, cunningness, V), V > 50.

%% lover_catches_virtuous_partner_disbelieves_display_of_virtue
% Action: lover catches virtuous partner, disbelieves display of virtue
% Source: Ensemble / deceptive-lying

action(lover_catches_virtuous_partner_disbelieves_display_of_virtue, 'lover catches virtuous partner, disbelieves display of virtue', deceptive, 1).
action_difficulty(lover_catches_virtuous_partner_disbelieves_display_of_virtue, 0.5).
action_duration(lover_catches_virtuous_partner_disbelieves_display_of_virtue, 1).
action_category(lover_catches_virtuous_partner_disbelieves_display_of_virtue, deceptive_lying).
action_source(lover_catches_virtuous_partner_disbelieves_display_of_virtue, ensemble).
action_verb(lover_catches_virtuous_partner_disbelieves_display_of_virtue, past, 'lover catches virtuous partner, disbelieves display of virtue').
action_verb(lover_catches_virtuous_partner_disbelieves_display_of_virtue, present, 'lover catches virtuous partner, disbelieves display of virtue').
action_target_type(lover_catches_virtuous_partner_disbelieves_display_of_virtue, other).
action_requires_target(lover_catches_virtuous_partner_disbelieves_display_of_virtue).
action_range(lover_catches_virtuous_partner_disbelieves_display_of_virtue, 5).
action_prerequisite(lover_catches_virtuous_partner_disbelieves_display_of_virtue, (trait(Target, virtuous))).
action_prerequisite(lover_catches_virtuous_partner_disbelieves_display_of_virtue, (trait(Actor, rich))).
action_prerequisite(lover_catches_virtuous_partner_disbelieves_display_of_virtue, (\+ relationship(Target, 'third', strangers))).
action_prerequisite(lover_catches_virtuous_partner_disbelieves_display_of_virtue, (network('third', Target, affinity, V), V > 60)).
action_effect(lover_catches_virtuous_partner_disbelieves_display_of_virtue, (retract(relationship(Actor, Target, esteem)))).
action_effect(lover_catches_virtuous_partner_disbelieves_display_of_virtue, (ensemble_effect(Target, caught in a lie by, true))).
action_effect(lover_catches_virtuous_partner_disbelieves_display_of_virtue, (ensemble_effect(Actor, resentful of, true))).
action_effect(lover_catches_virtuous_partner_disbelieves_display_of_virtue, (ensemble_effect('third', flirted with, true))).
% Can Actor perform this action?
can_perform(Actor, lover_catches_virtuous_partner_disbelieves_display_of_virtue, Target) :-
    trait(Target, virtuous),
    trait(Actor, rich),
    \+ relationship(Target, 'third', strangers),
    network('third', Target, affinity, V), V > 60.

%% look_with_disdain_after_discovering_a_lie
% Action: look with disdain after discovering a lie
% Source: Ensemble / deceptive-lying

action(look_with_disdain_after_discovering_a_lie, 'look with disdain after discovering a lie', deceptive, 1).
action_difficulty(look_with_disdain_after_discovering_a_lie, 0.5).
action_duration(look_with_disdain_after_discovering_a_lie, 1).
action_category(look_with_disdain_after_discovering_a_lie, deceptive_lying).
action_source(look_with_disdain_after_discovering_a_lie, ensemble).
action_verb(look_with_disdain_after_discovering_a_lie, past, 'look with disdain after discovering a lie').
action_verb(look_with_disdain_after_discovering_a_lie, present, 'look with disdain after discovering a lie').
action_target_type(look_with_disdain_after_discovering_a_lie, other).
action_requires_target(look_with_disdain_after_discovering_a_lie).
action_range(look_with_disdain_after_discovering_a_lie, 5).
action_is_accept(look_with_disdain_after_discovering_a_lie).
action_prerequisite(look_with_disdain_after_discovering_a_lie, (ensemble_condition(Actor, caught in a lie by, true))).
action_effect(look_with_disdain_after_discovering_a_lie, (retract(relationship(Target, Actor, esteem)))).
action_effect(look_with_disdain_after_discovering_a_lie, (modify_network(Target, Actor, affinity, -, 5))).
% Can Actor perform this action?
can_perform(Actor, look_with_disdain_after_discovering_a_lie, Target) :-
    ensemble_condition(Actor, caught in a lie by, true).

%% ═══════════════════════════════════════════════════════════
%% Category: deceptive-manipulation
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: deceptive-manipulation
%% Source: data/ensemble/actions/deceptive-manipulation.json
%% Converted: 2026-04-01T20:15:17.349Z
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

%% ═══════════════════════════════════════════════════════════
%% Category: dominance-power
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: dominance-power
%% Source: data/ensemble/actions/dominance-power.json
%% Converted: 2026-04-01T20:15:17.349Z
%% Total actions: 3

%% be_humble
% Action: BE HUMBLE
% Source: Ensemble / dominance-power

action(be_humble, 'BE HUMBLE', hostile, 1).
action_difficulty(be_humble, 0.5).
action_duration(be_humble, 1).
action_category(be_humble, dominance_power).
action_source(be_humble, ensemble).
action_verb(be_humble, past, 'be humble').
action_verb(be_humble, present, 'be humble').
action_target_type(be_humble, self).
action_leads_to(be_humble, respond_humbly).
can_perform(Actor, be_humble) :- true.

%% respect
% Action: RESPECT
% Source: Ensemble / dominance-power

action(respect, 'RESPECT', hostile, 1).
action_difficulty(respect, 0.5).
action_duration(respect, 1).
action_category(respect, dominance_power).
action_source(respect, ensemble).
action_verb(respect, past, 'respect').
action_verb(respect, present, 'respect').
action_target_type(respect, self).
action_leads_to(respect, compliment_successfully).
action_leads_to(respect, compliment_unsuccessfully).
can_perform(Actor, respect) :- true.

%% police_officer_does_not_respect_broke_rich_person_s_status
% Action: police officer does not respect broke rich person’s status
% Source: Ensemble / dominance-power

action(police_officer_does_not_respect_broke_rich_person_s_status, 'police officer does not respect broke rich person''s status', hostile, 1).
action_difficulty(police_officer_does_not_respect_broke_rich_person_s_status, 0.5).
action_duration(police_officer_does_not_respect_broke_rich_person_s_status, 1).
action_category(police_officer_does_not_respect_broke_rich_person_s_status, dominance_power).
action_source(police_officer_does_not_respect_broke_rich_person_s_status, ensemble).
action_verb(police_officer_does_not_respect_broke_rich_person_s_status, past, 'police officer does not respect broke rich person''s status').
action_verb(police_officer_does_not_respect_broke_rich_person_s_status, present, 'police officer does not respect broke rich person''s status').
action_target_type(police_officer_does_not_respect_broke_rich_person_s_status, other).
action_requires_target(police_officer_does_not_respect_broke_rich_person_s_status).
action_range(police_officer_does_not_respect_broke_rich_person_s_status, 5).
action_is_accept(police_officer_does_not_respect_broke_rich_person_s_status).
action_prerequisite(police_officer_does_not_respect_broke_rich_person_s_status, (trait(Actor, government official))).
action_prerequisite(police_officer_does_not_respect_broke_rich_person_s_status, (trait(Target, rich))).
action_prerequisite(police_officer_does_not_respect_broke_rich_person_s_status, (\+ trait(Actor, kind))).
action_prerequisite(police_officer_does_not_respect_broke_rich_person_s_status, (\+ trait(Target, rich))).
action_prerequisite(police_officer_does_not_respect_broke_rich_person_s_status, (attribute(Actor, propriety, V), V < 50)).
action_effect(police_officer_does_not_respect_broke_rich_person_s_status, (ensemble_effect(Target, offended by, true))).
% Can Actor perform this action?
can_perform(Actor, police_officer_does_not_respect_broke_rich_person_s_status, Target) :-
    trait(Actor, government official),
    trait(Target, rich),
    \+ trait(Actor, kind),
    \+ trait(Target, rich),
    attribute(Actor, propriety, V), V < 50.

%% ═══════════════════════════════════════════════════════════
%% Category: emotional-expression
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: emotional-expression
%% Source: data/ensemble/actions/emotional-expression.json
%% Converted: 2026-04-01T20:15:17.349Z
%% Total actions: 1

%% be_depressed
% Action: BE DEPRESSED
% Source: Ensemble / emotional-expression

action(be_depressed, 'BE DEPRESSED', social, 1).
action_difficulty(be_depressed, 0.5).
action_duration(be_depressed, 1).
action_category(be_depressed, emotional_expression).
action_source(be_depressed, ensemble).
action_verb(be_depressed, past, 'be depressed').
action_verb(be_depressed, present, 'be depressed').
action_target_type(be_depressed, self).
action_leads_to(be_depressed, respond_negatively).
can_perform(Actor, be_depressed) :- true.

%% ═══════════════════════════════════════════════════════════
%% Category: environmental-interaction
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: environmental-interaction
%% Source: data/ensemble/actions/environmental-interaction.json
%% Converted: 2026-04-01T20:15:17.349Z
%% Total actions: 1

%% read_sign
% Action: Read a nearby sign or notice
% Source: Ensemble / environmental-interaction

action(read_sign, 'Read a nearby sign or notice', physical, 1).
action_difficulty(read_sign, 0.5).
action_duration(read_sign, 1).
action_category(read_sign, environmental_interaction).
action_source(read_sign, ensemble).
action_verb(read_sign, past, 'read sign').
action_verb(read_sign, present, 'read sign').
action_target_type(read_sign, self).
action_effect(read_sign, (ensemble_effect(Actor, read_sign, true))).
can_perform(Actor, read_sign) :- true.

%% ═══════════════════════════════════════════════════════════
%% Category: general
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: general
%% Source: data/ensemble/actions/general.json
%% Converted: 2026-04-01T20:15:17.349Z
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

%% ═══════════════════════════════════════════════════════════
%% Category: gratitude-reciprocity
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: gratitude-reciprocity
%% Source: data/ensemble/actions/gratitude-reciprocity.json
%% Converted: 2026-04-01T20:15:17.350Z
%% Total actions: 3

%% bonne_physionomie_man_grateful_to_benefactor
% Action: bonne physionomie man grateful to benefactor
% Source: Ensemble / gratitude-reciprocity

action(bonne_physionomie_man_grateful_to_benefactor, 'bonne physionomie man grateful to benefactor', social, 1).
action_difficulty(bonne_physionomie_man_grateful_to_benefactor, 0.5).
action_duration(bonne_physionomie_man_grateful_to_benefactor, 1).
action_category(bonne_physionomie_man_grateful_to_benefactor, gratitude_reciprocity).
action_source(bonne_physionomie_man_grateful_to_benefactor, ensemble).
action_verb(bonne_physionomie_man_grateful_to_benefactor, past, 'bonne physionomie man grateful to benefactor').
action_verb(bonne_physionomie_man_grateful_to_benefactor, present, 'bonne physionomie man grateful to benefactor').
action_target_type(bonne_physionomie_man_grateful_to_benefactor, other).
action_requires_target(bonne_physionomie_man_grateful_to_benefactor).
action_range(bonne_physionomie_man_grateful_to_benefactor, 5).
action_is_accept(bonne_physionomie_man_grateful_to_benefactor).
action_prerequisite(bonne_physionomie_man_grateful_to_benefactor, (trait(Target, innocent looking))).
action_prerequisite(bonne_physionomie_man_grateful_to_benefactor, (attribute(Actor, social standing, V), V > 50)).
action_prerequisite(bonne_physionomie_man_grateful_to_benefactor, (trait(Actor, kind))).
action_prerequisite(bonne_physionomie_man_grateful_to_benefactor, (\+ trait(Target, rich))).
action_effect(bonne_physionomie_man_grateful_to_benefactor, (modify_network(Target, Actor, affinity, +, 20))).
action_effect(bonne_physionomie_man_grateful_to_benefactor, (ensemble_effect(Target, owes a favor to, true))).
% Can Actor perform this action?
can_perform(Actor, bonne_physionomie_man_grateful_to_benefactor, Target) :-
    trait(Target, innocent looking),
    attribute(Actor, social standing, V), V > 50,
    trait(Actor, kind),
    \+ trait(Target, rich).

%% express_gratitude_toward_benefactor
% Action: express gratitude toward benefactor
% Source: Ensemble / gratitude-reciprocity

action(express_gratitude_toward_benefactor, 'express gratitude toward benefactor', social, 1).
action_difficulty(express_gratitude_toward_benefactor, 0.5).
action_duration(express_gratitude_toward_benefactor, 1).
action_category(express_gratitude_toward_benefactor, gratitude_reciprocity).
action_source(express_gratitude_toward_benefactor, ensemble).
action_verb(express_gratitude_toward_benefactor, past, 'express gratitude toward benefactor').
action_verb(express_gratitude_toward_benefactor, present, 'express gratitude toward benefactor').
action_target_type(express_gratitude_toward_benefactor, other).
action_requires_target(express_gratitude_toward_benefactor).
action_range(express_gratitude_toward_benefactor, 5).
action_is_accept(express_gratitude_toward_benefactor).
action_prerequisite(express_gratitude_toward_benefactor, (ensemble_condition(Actor, owes a favor to, true))).
action_prerequisite(express_gratitude_toward_benefactor, (status(Actor, grateful))).
action_effect(express_gratitude_toward_benefactor, (modify_network(Target, Actor, affinity, +, 10))).
action_effect(express_gratitude_toward_benefactor, (modify_attribute(Actor, propriety, +, 5))).
action_effect(express_gratitude_toward_benefactor, (modify_network(Actor, Target, affinity, +, 5))).
action_effect(express_gratitude_toward_benefactor, (assert(status(Target, grateful)))).
% Can Actor perform this action?
can_perform(Actor, express_gratitude_toward_benefactor, Target) :-
    ensemble_condition(Actor, owes a favor to, true),
    status(Actor, grateful).

%% express_ingratitude_toward_benefactor
% Action: express ingratitude toward benefactor
% Source: Ensemble / gratitude-reciprocity

action(express_ingratitude_toward_benefactor, 'express ingratitude toward benefactor', social, 1).
action_difficulty(express_ingratitude_toward_benefactor, 0.5).
action_duration(express_ingratitude_toward_benefactor, 1).
action_category(express_ingratitude_toward_benefactor, gratitude_reciprocity).
action_source(express_ingratitude_toward_benefactor, ensemble).
action_verb(express_ingratitude_toward_benefactor, past, 'express ingratitude toward benefactor').
action_verb(express_ingratitude_toward_benefactor, present, 'express ingratitude toward benefactor').
action_target_type(express_ingratitude_toward_benefactor, other).
action_requires_target(express_ingratitude_toward_benefactor).
action_range(express_ingratitude_toward_benefactor, 5).
action_is_accept(express_ingratitude_toward_benefactor).
action_prerequisite(express_ingratitude_toward_benefactor, (ensemble_condition(Actor, owes a favor to, true))).
action_prerequisite(express_ingratitude_toward_benefactor, (\+ status(Actor, grateful))).
action_effect(express_ingratitude_toward_benefactor, (modify_network(Target, Actor, affinity, -, 10))).
action_effect(express_ingratitude_toward_benefactor, (modify_attribute(Actor, propriety, -, 10))).
action_effect(express_ingratitude_toward_benefactor, (ensemble_effect(Target, resentful of, true))).
% Can Actor perform this action?
can_perform(Actor, express_ingratitude_toward_benefactor, Target) :-
    ensemble_condition(Actor, owes a favor to, true),
    \+ status(Actor, grateful).

%% ═══════════════════════════════════════════════════════════
%% Category: hostile-antagonism
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: hostile-antagonism
%% Source: data/ensemble/actions/hostile-antagonism.json
%% Converted: 2026-04-01T20:15:17.350Z
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

%% ═══════════════════════════════════════════════════════════
%% Category: hostile-attacks
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: hostile-attacks
%% Source: data/ensemble/actions/hostile-attacks.json
%% Converted: 2026-04-01T20:15:17.350Z
%% Total actions: 12

%% bite
% Action: BITE
% Source: Ensemble / hostile-attacks

action(bite, 'BITE', hostile, 1).
action_difficulty(bite, 0.5).
action_duration(bite, 1).
action_category(bite, hostile_attacks).
action_source(bite, ensemble).
action_verb(bite, past, 'bite').
action_verb(bite, present, 'bite').
action_target_type(bite, self).
action_leads_to(bite, bitten).
action_leads_to(bite, bite_back).
can_perform(Actor, bite) :- true.

%% attack
% Action: ATTACK
% Source: Ensemble / hostile-attacks

action(attack, 'ATTACK', hostile, 1).
action_difficulty(attack, 0.5).
action_duration(attack, 1).
action_category(attack, hostile_attacks).
action_source(attack, ensemble).
action_verb(attack, past, 'attack').
action_verb(attack, present, 'attack').
action_target_type(attack, self).
action_leads_to(attack, fight_against_someone_for_friend).
action_leads_to(attack, assault_of_a_man_against_a_young_woman_defends_herself).
action_leads_to(attack, fight_against_someone_for_a_young_woman).
action_leads_to(attack, attack_successfully).
action_leads_to(attack, attacksomeone_unsuccessfully).
can_perform(Actor, attack) :- true.

%% bite_back
% Action: bite back
% Source: Ensemble / hostile-attacks

action(bite_back, 'bite back', hostile, 1).
action_difficulty(bite_back, 0.5).
action_duration(bite_back, 1).
action_category(bite_back, hostile_attacks).
action_source(bite_back, ensemble).
action_parent(bite_back, bite).
action_verb(bite_back, past, 'bite back').
action_verb(bite_back, present, 'bite back').
action_target_type(bite_back, other).
action_requires_target(bite_back).
action_range(bite_back, 5).
action_prerequisite(bite_back, (network(Target, Actor, fear, V), V < 3)).
action_effect(bite_back, (modify_network(Target, Actor, fear, -, 1))).
% Can Actor perform this action?
can_perform(Actor, bite_back, Target) :-
    network(Target, Actor, fear, V), V < 3.

%% bark
% Action: bark
% Source: Ensemble / hostile-attacks

action(bark, 'bark', hostile, 1).
action_difficulty(bark, 0.5).
action_duration(bark, 1).
action_category(bark, hostile_attacks).
action_source(bark, ensemble).
action_verb(bark, past, 'bark').
action_verb(bark, present, 'bark').
action_target_type(bark, other).
action_requires_target(bark).
action_range(bark, 5).
action_is_accept(bark).
action_prerequisite(bark, (trait(Actor, dog))).
action_effect(bark, (modify_network(Target, Actor, fear, +, 1))).
% Can Actor perform this action?
can_perform(Actor, bark, Target) :-
    trait(Actor, dog).

%% hiss
% Action: hiss
% Source: Ensemble / hostile-attacks

action(hiss, 'hiss', hostile, 1).
action_difficulty(hiss, 0.5).
action_duration(hiss, 1).
action_category(hiss, hostile_attacks).
action_source(hiss, ensemble).
action_verb(hiss, past, 'hiss').
action_verb(hiss, present, 'hiss').
action_target_type(hiss, other).
action_requires_target(hiss).
action_range(hiss, 5).
action_is_accept(hiss).
action_prerequisite(hiss, (trait(Actor, cat))).
action_effect(hiss, (modify_network(Target, Actor, fear, +, 1))).
% Can Actor perform this action?
can_perform(Actor, hiss, Target) :-
    trait(Actor, cat).

%% homosexual_sexual_assault
% Action: homosexual sexual assault
% Source: Ensemble / hostile-attacks

action(homosexual_sexual_assault, 'homosexual sexual assault', hostile, 1).
action_difficulty(homosexual_sexual_assault, 0.5).
action_duration(homosexual_sexual_assault, 1).
action_category(homosexual_sexual_assault, hostile_attacks).
action_source(homosexual_sexual_assault, ensemble).
action_verb(homosexual_sexual_assault, past, 'homosexual sexual assault').
action_verb(homosexual_sexual_assault, present, 'homosexual sexual assault').
action_target_type(homosexual_sexual_assault, other).
action_requires_target(homosexual_sexual_assault).
action_range(homosexual_sexual_assault, 5).
action_prerequisite(homosexual_sexual_assault, (trait(Actor, male))).
action_prerequisite(homosexual_sexual_assault, (trait(Target, male))).
action_prerequisite(homosexual_sexual_assault, (trait(Actor, flirtatious))).
action_effect(homosexual_sexual_assault, (ensemble_effect(Actor, harassed, true))).
action_effect(homosexual_sexual_assault, (modify_network(Target, Target, affinity, -, 10))).
action_effect(homosexual_sexual_assault, (assert(status(Target, gobsmacked)))).
action_effect(homosexual_sexual_assault, (assert(status(Target, embarrassed)))).
% Can Actor perform this action?
can_perform(Actor, homosexual_sexual_assault, Target) :-
    trait(Actor, male),
    trait(Target, male),
    trait(Actor, flirtatious).

%% fight_against_someone_for_friend
% Action: fight against someone for friend
% Source: Ensemble / hostile-attacks

action(fight_against_someone_for_friend, 'fight against someone for friend', hostile, 1).
action_difficulty(fight_against_someone_for_friend, 0.5).
action_duration(fight_against_someone_for_friend, 1).
action_category(fight_against_someone_for_friend, hostile_attacks).
action_source(fight_against_someone_for_friend, ensemble).
action_parent(fight_against_someone_for_friend, attack).
action_verb(fight_against_someone_for_friend, past, 'fight against someone for friend').
action_verb(fight_against_someone_for_friend, present, 'fight against someone for friend').
action_target_type(fight_against_someone_for_friend, other).
action_requires_target(fight_against_someone_for_friend).
action_range(fight_against_someone_for_friend, 5).
action_is_accept(fight_against_someone_for_friend).
action_prerequisite(fight_against_someone_for_friend, (relationship(Actor, 'third', friends))).
action_prerequisite(fight_against_someone_for_friend, (ensemble_condition('third', threatened by, true))).
action_effect(fight_against_someone_for_friend, (assert(relationship(Target, Actor, rivals)))).
% Can Actor perform this action?
can_perform(Actor, fight_against_someone_for_friend, Target) :-
    relationship(Actor, 'third', friends),
    ensemble_condition('third', threatened by, true).

%% assault_of_a_man_against_a_young_woman_defends_herself
% Action: assault of a man against a young woman defends herself
% Source: Ensemble / hostile-attacks

action(assault_of_a_man_against_a_young_woman_defends_herself, 'assault of a man against a young woman defends herself', hostile, 1).
action_difficulty(assault_of_a_man_against_a_young_woman_defends_herself, 0.5).
action_duration(assault_of_a_man_against_a_young_woman_defends_herself, 1).
action_category(assault_of_a_man_against_a_young_woman_defends_herself, hostile_attacks).
action_source(assault_of_a_man_against_a_young_woman_defends_herself, ensemble).
action_parent(assault_of_a_man_against_a_young_woman_defends_herself, attack).
action_verb(assault_of_a_man_against_a_young_woman_defends_herself, past, 'assault of a man against a young woman defends herself').
action_verb(assault_of_a_man_against_a_young_woman_defends_herself, present, 'assault of a man against a young woman defends herself').
action_target_type(assault_of_a_man_against_a_young_woman_defends_herself, other).
action_requires_target(assault_of_a_man_against_a_young_woman_defends_herself).
action_range(assault_of_a_man_against_a_young_woman_defends_herself, 5).
action_is_accept(assault_of_a_man_against_a_young_woman_defends_herself).
action_prerequisite(assault_of_a_man_against_a_young_woman_defends_herself, (trait(Actor, male))).
action_prerequisite(assault_of_a_man_against_a_young_woman_defends_herself, (status(Actor, upset))).
action_prerequisite(assault_of_a_man_against_a_young_woman_defends_herself, (trait(Target, female))).
action_prerequisite(assault_of_a_man_against_a_young_woman_defends_herself, (trait(Target, young))).
action_prerequisite(assault_of_a_man_against_a_young_woman_defends_herself, (attribute(Someone, propriety, V), V =:= 50)).
action_prerequisite(assault_of_a_man_against_a_young_woman_defends_herself, (ensemble_condition(Actor, harassed, true))).
action_prerequisite(assault_of_a_man_against_a_young_woman_defends_herself, (network(Target, Someone, affinity, V), V < 30)).
action_effect(assault_of_a_man_against_a_young_woman_defends_herself, (modify_network(Target, Actor, affinity, -, 15))).
action_effect(assault_of_a_man_against_a_young_woman_defends_herself, (assert(relationship(Target, Someone, rivals)))).
% Can Actor perform this action?
can_perform(Actor, assault_of_a_man_against_a_young_woman_defends_herself, Target) :-
    trait(Actor, male),
    status(Actor, upset),
    trait(Target, female),
    trait(Target, young),
    attribute(Someone, propriety, V), V =:= 50,
    ensemble_condition(Actor, harassed, true),
    network(Target, Someone, affinity, V), V < 30.

%% fight_against_someone_for_a_young_woman
% Action: fight against someone for a young woman
% Source: Ensemble / hostile-attacks

action(fight_against_someone_for_a_young_woman, 'fight against someone for a young woman', hostile, 1).
action_difficulty(fight_against_someone_for_a_young_woman, 0.5).
action_duration(fight_against_someone_for_a_young_woman, 1).
action_category(fight_against_someone_for_a_young_woman, hostile_attacks).
action_source(fight_against_someone_for_a_young_woman, ensemble).
action_parent(fight_against_someone_for_a_young_woman, attack).
action_verb(fight_against_someone_for_a_young_woman, past, 'fight against someone for a young woman').
action_verb(fight_against_someone_for_a_young_woman, present, 'fight against someone for a young woman').
action_target_type(fight_against_someone_for_a_young_woman, self).
action_is_accept(fight_against_someone_for_a_young_woman).
can_perform(Actor, fight_against_someone_for_a_young_woman) :- true.

%% attack_successfully
% Action: attack successfully
% Source: Ensemble / hostile-attacks

action(attack_successfully, 'attack successfully', hostile, 1).
action_difficulty(attack_successfully, 0.5).
action_duration(attack_successfully, 1).
action_category(attack_successfully, hostile_attacks).
action_source(attack_successfully, ensemble).
action_parent(attack_successfully, attack).
action_verb(attack_successfully, past, 'attack successfully').
action_verb(attack_successfully, present, 'attack successfully').
action_target_type(attack_successfully, other).
action_requires_target(attack_successfully).
action_range(attack_successfully, 5).
action_is_accept(attack_successfully).
action_effect(attack_successfully, (assert(relationship(Actor, Target, rivals)))).
can_perform(Actor, attack_successfully, Target) :- true.

%% attacksomeone_unsuccessfully
% Action: attacksomeone unsuccessfully
% Source: Ensemble / hostile-attacks

action(attacksomeone_unsuccessfully, 'attacksomeone unsuccessfully', hostile, 1).
action_difficulty(attacksomeone_unsuccessfully, 0.5).
action_duration(attacksomeone_unsuccessfully, 1).
action_category(attacksomeone_unsuccessfully, hostile_attacks).
action_source(attacksomeone_unsuccessfully, ensemble).
action_parent(attacksomeone_unsuccessfully, attack).
action_verb(attacksomeone_unsuccessfully, past, 'attacksomeone unsuccessfully').
action_verb(attacksomeone_unsuccessfully, present, 'attacksomeone unsuccessfully').
action_target_type(attacksomeone_unsuccessfully, other).
action_requires_target(attacksomeone_unsuccessfully).
action_range(attacksomeone_unsuccessfully, 5).
action_effect(attacksomeone_unsuccessfully, (retract(relationship(Actor, Target, rivals)))).
can_perform(Actor, attacksomeone_unsuccessfully, Target) :- true.

%% fight_to_help_an_unknown_man
% Action: fight to help an unknown man
% Source: Ensemble / hostile-attacks

action(fight_to_help_an_unknown_man, 'fight to help an unknown man', hostile, 1).
action_difficulty(fight_to_help_an_unknown_man, 0.5).
action_duration(fight_to_help_an_unknown_man, 1).
action_category(fight_to_help_an_unknown_man, hostile_attacks).
action_source(fight_to_help_an_unknown_man, ensemble).
action_verb(fight_to_help_an_unknown_man, past, 'fight to help an unknown man').
action_verb(fight_to_help_an_unknown_man, present, 'fight to help an unknown man').
action_target_type(fight_to_help_an_unknown_man, other).
action_requires_target(fight_to_help_an_unknown_man).
action_range(fight_to_help_an_unknown_man, 5).
action_is_accept(fight_to_help_an_unknown_man).
action_prerequisite(fight_to_help_an_unknown_man, (attribute(Actor, self-assuredness, V), V > 60)).
action_prerequisite(fight_to_help_an_unknown_man, (trait(Actor, wearing a first responder uniform))).
action_prerequisite(fight_to_help_an_unknown_man, (attribute(Actor, nosiness, V), V > 60)).
action_prerequisite(fight_to_help_an_unknown_man, (ensemble_condition(Target, threatened by, true))).
action_prerequisite(fight_to_help_an_unknown_man, (relationship(Actor, Target, strangers))).
action_effect(fight_to_help_an_unknown_man, (assert(relationship(Target, Actor, ally)))).
action_effect(fight_to_help_an_unknown_man, (assert(relationship(Actor, 'third', rivals)))).
action_effect(fight_to_help_an_unknown_man, (assert(relationship(Target, Actor, friends)))).
% Can Actor perform this action?
can_perform(Actor, fight_to_help_an_unknown_man, Target) :-
    attribute(Actor, self-assuredness, V), V > 60,
    trait(Actor, wearing a first responder uniform),
    attribute(Actor, nosiness, V), V > 60,
    ensemble_condition(Target, threatened by, true),
    relationship(Actor, Target, strangers).

%% ═══════════════════════════════════════════════════════════
%% Category: hostile-insults
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: hostile-insults
%% Source: data/ensemble/actions/hostile-insults.json
%% Converted: 2026-04-01T20:15:17.350Z
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

%% ═══════════════════════════════════════════════════════════
%% Category: impression-attention
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: impression-attention
%% Source: data/ensemble/actions/impression-attention.json
%% Converted: 2026-04-01T20:15:17.350Z
%% Total actions: 13

%% make_a_scene_not_subtle
% Action: MAKE A SCENE (NOT SUBTLE)
% Source: Ensemble / impression-attention

action(make_a_scene_not_subtle, 'MAKE A SCENE (NOT SUBTLE)', social, 1).
action_difficulty(make_a_scene_not_subtle, 0.5).
action_duration(make_a_scene_not_subtle, 1).
action_category(make_a_scene_not_subtle, impression_attention).
action_source(make_a_scene_not_subtle, ensemble).
action_verb(make_a_scene_not_subtle, past, 'make a scene (not subtle)').
action_verb(make_a_scene_not_subtle, present, 'make a scene (not subtle)').
action_target_type(make_a_scene_not_subtle, self).
action_leads_to(make_a_scene_not_subtle, embrace_someone_in_public_a).
action_leads_to(make_a_scene_not_subtle, embrace_someone_in_public_r).
action_leads_to(make_a_scene_not_subtle, play_a_bad_trick).
action_leads_to(make_a_scene_not_subtle, make_a_scene_successfully).
action_leads_to(make_a_scene_not_subtle, make_a_scene_unsuccessfully).
can_perform(Actor, make_a_scene_not_subtle) :- true.

%% draw_attention_subtle
% Action: DRAW ATTENTION (SUBTLE)
% Source: Ensemble / impression-attention

action(draw_attention_subtle, 'DRAW ATTENTION (SUBTLE)', social, 1).
action_difficulty(draw_attention_subtle, 0.5).
action_duration(draw_attention_subtle, 1).
action_category(draw_attention_subtle, impression_attention).
action_source(draw_attention_subtle, ensemble).
action_verb(draw_attention_subtle, past, 'draw attention (subtle)').
action_verb(draw_attention_subtle, present, 'draw attention (subtle)').
action_target_type(draw_attention_subtle, self).
action_leads_to(draw_attention_subtle, lie_about_not_liking_something_to_get_attention).
action_leads_to(draw_attention_subtle, someone_not_knowing_how_to_behave_draws_attention_to_oneself).
action_leads_to(draw_attention_subtle, glorieuse_making_eyes_at_someone).
action_leads_to(draw_attention_subtle, draw_attention_successfully).
action_leads_to(draw_attention_subtle, draw_attention_unsuccessfully).
can_perform(Actor, draw_attention_subtle) :- true.

%% deflect
% Action: DEFLECT
% Source: Ensemble / impression-attention

action(deflect, 'DEFLECT', social, 1).
action_difficulty(deflect, 0.5).
action_duration(deflect, 1).
action_category(deflect, impression_attention).
action_source(deflect, ensemble).
action_verb(deflect, past, 'deflect').
action_verb(deflect, present, 'deflect').
action_target_type(deflect, self).
action_leads_to(deflect, draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift).
action_leads_to(deflect, look_away).
action_leads_to(deflect, remaining_silent).
action_leads_to(deflect, insist_on_low_status_to_drive_off_high_status_lover).
action_leads_to(deflect, discretely_leave_the_theatre_and_ask_for_ticket_refurbishment_but_being_noticed).
action_leads_to(deflect, attempt_to_conceal_information_from_friend_fails).
action_leads_to(deflect, deflect_successfully).
action_leads_to(deflect, deflect_unsuccessfully).
can_perform(Actor, deflect) :- true.

%% blend_in
% Action: BLEND IN
% Source: Ensemble / impression-attention

action(blend_in, 'BLEND IN', social, 1).
action_difficulty(blend_in, 0.5).
action_duration(blend_in, 1).
action_category(blend_in, impression_attention).
action_source(blend_in, ensemble).
action_verb(blend_in, past, 'blend in').
action_verb(blend_in, present, 'blend in').
action_target_type(blend_in, self).
action_leads_to(blend_in, eccentric_unattractive_man_prefers_staying_on_his_own_a).
action_leads_to(blend_in, eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r).
action_leads_to(blend_in, dress_up_as_stranger).
action_leads_to(blend_in, try_to_blend_in_while_being_new_to_the_game).
action_leads_to(blend_in, blendin_successfully).
action_leads_to(blend_in, blendin_unsuccessfully).
can_perform(Actor, blend_in) :- true.

%% make_a_scene_successfully
% Action: make a scene successfully
% Source: Ensemble / impression-attention

action(make_a_scene_successfully, 'make a scene successfully', social, 1).
action_difficulty(make_a_scene_successfully, 0.5).
action_duration(make_a_scene_successfully, 1).
action_category(make_a_scene_successfully, impression_attention).
action_source(make_a_scene_successfully, ensemble).
action_parent(make_a_scene_successfully, make_a_scene_not_subtle).
action_verb(make_a_scene_successfully, past, 'make a scene successfully').
action_verb(make_a_scene_successfully, present, 'make a scene successfully').
action_target_type(make_a_scene_successfully, other).
action_requires_target(make_a_scene_successfully).
action_range(make_a_scene_successfully, 5).
action_is_accept(make_a_scene_successfully).
action_effect(make_a_scene_successfully, (modify_network(Target, Actor, curiosity, +, 5))).
can_perform(Actor, make_a_scene_successfully, Target) :- true.

%% make_a_scene_unsuccessfully
% Action: make a scene unsuccessfully
% Source: Ensemble / impression-attention

action(make_a_scene_unsuccessfully, 'make a scene unsuccessfully', social, 1).
action_difficulty(make_a_scene_unsuccessfully, 0.5).
action_duration(make_a_scene_unsuccessfully, 1).
action_category(make_a_scene_unsuccessfully, impression_attention).
action_source(make_a_scene_unsuccessfully, ensemble).
action_parent(make_a_scene_unsuccessfully, make_a_scene_not_subtle).
action_verb(make_a_scene_unsuccessfully, past, 'make a scene unsuccessfully').
action_verb(make_a_scene_unsuccessfully, present, 'make a scene unsuccessfully').
action_target_type(make_a_scene_unsuccessfully, other).
action_requires_target(make_a_scene_unsuccessfully).
action_range(make_a_scene_unsuccessfully, 5).
action_effect(make_a_scene_unsuccessfully, (modify_network(Target, Actor, curiosity, -, 5))).
can_perform(Actor, make_a_scene_unsuccessfully, Target) :- true.

%% someone_not_knowing_how_to_behave_draws_attention_to_oneself
% Action: someone not knowing how to behave draws attention to oneself
% Source: Ensemble / impression-attention

action(someone_not_knowing_how_to_behave_draws_attention_to_oneself, 'someone not knowing how to behave draws attention to oneself', social, 1).
action_difficulty(someone_not_knowing_how_to_behave_draws_attention_to_oneself, 0.5).
action_duration(someone_not_knowing_how_to_behave_draws_attention_to_oneself, 1).
action_category(someone_not_knowing_how_to_behave_draws_attention_to_oneself, impression_attention).
action_source(someone_not_knowing_how_to_behave_draws_attention_to_oneself, ensemble).
action_parent(someone_not_knowing_how_to_behave_draws_attention_to_oneself, draw_attention_subtle).
action_verb(someone_not_knowing_how_to_behave_draws_attention_to_oneself, past, 'someone not knowing how to behave draws attention to oneself').
action_verb(someone_not_knowing_how_to_behave_draws_attention_to_oneself, present, 'someone not knowing how to behave draws attention to oneself').
action_target_type(someone_not_knowing_how_to_behave_draws_attention_to_oneself, other).
action_requires_target(someone_not_knowing_how_to_behave_draws_attention_to_oneself).
action_range(someone_not_knowing_how_to_behave_draws_attention_to_oneself, 5).
action_prerequisite(someone_not_knowing_how_to_behave_draws_attention_to_oneself, (attribute(Actor, propriety, V), V < 50)).
action_prerequisite(someone_not_knowing_how_to_behave_draws_attention_to_oneself, (attribute(Target, propriety, V), V > 50)).
action_prerequisite(someone_not_knowing_how_to_behave_draws_attention_to_oneself, (attribute(Actor, self-assuredness, V), V < 60)).
action_prerequisite(someone_not_knowing_how_to_behave_draws_attention_to_oneself, (relationship(Actor, 'third', friends))).
action_prerequisite(someone_not_knowing_how_to_behave_draws_attention_to_oneself, (relationship(Target, 'third', friends))).
action_prerequisite(someone_not_knowing_how_to_behave_draws_attention_to_oneself, (relationship(Actor, Target, strangers))).
action_effect(someone_not_knowing_how_to_behave_draws_attention_to_oneself, (modify_network(Target, Actor, curiosity, +, 10))).
% Can Actor perform this action?
can_perform(Actor, someone_not_knowing_how_to_behave_draws_attention_to_oneself, Target) :-
    attribute(Actor, propriety, V), V < 50,
    attribute(Target, propriety, V), V > 50,
    attribute(Actor, self-assuredness, V), V < 60,
    relationship(Actor, 'third', friends),
    relationship(Target, 'third', friends),
    relationship(Actor, Target, strangers).

%% draw_attention_successfully
% Action: draw attention successfully
% Source: Ensemble / impression-attention

action(draw_attention_successfully, 'draw attention successfully', social, 1).
action_difficulty(draw_attention_successfully, 0.5).
action_duration(draw_attention_successfully, 1).
action_category(draw_attention_successfully, impression_attention).
action_source(draw_attention_successfully, ensemble).
action_parent(draw_attention_successfully, draw_attention_subtle).
action_verb(draw_attention_successfully, past, 'draw attention successfully').
action_verb(draw_attention_successfully, present, 'draw attention successfully').
action_target_type(draw_attention_successfully, other).
action_requires_target(draw_attention_successfully).
action_range(draw_attention_successfully, 5).
action_is_accept(draw_attention_successfully).
action_effect(draw_attention_successfully, (modify_network(Target, Actor, curiosity, +, 5))).
can_perform(Actor, draw_attention_successfully, Target) :- true.

%% draw_attention_unsuccessfully
% Action: draw attention unsuccessfully
% Source: Ensemble / impression-attention

action(draw_attention_unsuccessfully, 'draw attention unsuccessfully', social, 1).
action_difficulty(draw_attention_unsuccessfully, 0.5).
action_duration(draw_attention_unsuccessfully, 1).
action_category(draw_attention_unsuccessfully, impression_attention).
action_source(draw_attention_unsuccessfully, ensemble).
action_parent(draw_attention_unsuccessfully, draw_attention_subtle).
action_verb(draw_attention_unsuccessfully, past, 'draw attention unsuccessfully').
action_verb(draw_attention_unsuccessfully, present, 'draw attention unsuccessfully').
action_target_type(draw_attention_unsuccessfully, other).
action_requires_target(draw_attention_unsuccessfully).
action_range(draw_attention_unsuccessfully, 5).
action_effect(draw_attention_unsuccessfully, (modify_network(Target, Actor, curiosity, +, 5))).
can_perform(Actor, draw_attention_unsuccessfully, Target) :- true.

%% deflect_successfully
% Action: deflect successfully
% Source: Ensemble / impression-attention

action(deflect_successfully, 'deflect successfully', social, 1).
action_difficulty(deflect_successfully, 0.5).
action_duration(deflect_successfully, 1).
action_category(deflect_successfully, impression_attention).
action_source(deflect_successfully, ensemble).
action_parent(deflect_successfully, deflect).
action_verb(deflect_successfully, past, 'deflect successfully').
action_verb(deflect_successfully, present, 'deflect successfully').
action_target_type(deflect_successfully, other).
action_requires_target(deflect_successfully).
action_range(deflect_successfully, 5).
action_is_accept(deflect_successfully).
action_effect(deflect_successfully, (modify_network(Target, Actor, curiosity, -, 5))).
can_perform(Actor, deflect_successfully, Target) :- true.

%% deflect_unsuccessfully
% Action: deflect unsuccessfully
% Source: Ensemble / impression-attention

action(deflect_unsuccessfully, 'deflect unsuccessfully', social, 1).
action_difficulty(deflect_unsuccessfully, 0.5).
action_duration(deflect_unsuccessfully, 1).
action_category(deflect_unsuccessfully, impression_attention).
action_source(deflect_unsuccessfully, ensemble).
action_parent(deflect_unsuccessfully, deflect).
action_verb(deflect_unsuccessfully, past, 'deflect unsuccessfully').
action_verb(deflect_unsuccessfully, present, 'deflect unsuccessfully').
action_target_type(deflect_unsuccessfully, other).
action_requires_target(deflect_unsuccessfully).
action_range(deflect_unsuccessfully, 5).
action_effect(deflect_unsuccessfully, (modify_network(Target, Actor, curiosity, +, 5))).
can_perform(Actor, deflect_unsuccessfully, Target) :- true.

%% eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r
% Action: eccentric, unattractive person prefers staying on his own but nonetheless gets attention (r)
% Source: Ensemble / impression-attention

action(eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r, 'eccentric, unattractive person prefers staying on his own but nonetheless gets attention (r)', social, 1).
action_difficulty(eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r, 0.5).
action_duration(eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r, 1).
action_category(eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r, impression_attention).
action_source(eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r, ensemble).
action_parent(eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r, blend_in).
action_verb(eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r, past, 'eccentric, unattractive person prefers staying on his own but nonetheless gets attention (r)').
action_verb(eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r, present, 'eccentric, unattractive person prefers staying on his own but nonetheless gets attention (r)').
action_target_type(eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r, other).
action_requires_target(eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r).
action_range(eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r, 5).
action_prerequisite(eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r, (attribute(Actor, charisma, V), V < 30)).
action_prerequisite(eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r, (trait(Actor, eccentric))).
action_effect(eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r, (modify_network(Target, Actor, curiosity, +, 10))).
action_effect(eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r, (modify_network(Actor, Target, affinity, -, 5))).
% Can Actor perform this action?
can_perform(Actor, eccentric_unattractive_person_prefers_staying_on_his_own_but_nonetheless_gets_attention_r, Target) :-
    attribute(Actor, charisma, V), V < 30,
    trait(Actor, eccentric).

%% try_to_blend_in_while_being_new_to_the_game
% Action: try to blend in while being new to the game
% Source: Ensemble / impression-attention

action(try_to_blend_in_while_being_new_to_the_game, 'try to blend in while being new to the game', social, 1).
action_difficulty(try_to_blend_in_while_being_new_to_the_game, 0.5).
action_duration(try_to_blend_in_while_being_new_to_the_game, 1).
action_category(try_to_blend_in_while_being_new_to_the_game, impression_attention).
action_source(try_to_blend_in_while_being_new_to_the_game, ensemble).
action_parent(try_to_blend_in_while_being_new_to_the_game, blend_in).
action_verb(try_to_blend_in_while_being_new_to_the_game, past, 'try to blend in while being new to the game').
action_verb(try_to_blend_in_while_being_new_to_the_game, present, 'try to blend in while being new to the game').
action_target_type(try_to_blend_in_while_being_new_to_the_game, other).
action_requires_target(try_to_blend_in_while_being_new_to_the_game).
action_range(try_to_blend_in_while_being_new_to_the_game, 5).
action_prerequisite(try_to_blend_in_while_being_new_to_the_game, (relationship(Actor, Target, strangers))).
action_prerequisite(try_to_blend_in_while_being_new_to_the_game, (trait(Target, rich))).
action_effect(try_to_blend_in_while_being_new_to_the_game, (modify_network(Target, Actor, curiosity, +, 5))).
action_effect(try_to_blend_in_while_being_new_to_the_game, (assert(status(Actor, flattered)))).
action_effect(try_to_blend_in_while_being_new_to_the_game, (retract(relationship(Actor, Target, strangers)))).
% Can Actor perform this action?
can_perform(Actor, try_to_blend_in_while_being_new_to_the_game, Target) :-
    relationship(Actor, Target, strangers),
    trait(Target, rich).

%% ═══════════════════════════════════════════════════════════
%% Category: impression-bragging
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: impression-bragging
%% Source: data/ensemble/actions/impression-bragging.json
%% Converted: 2026-04-01T20:15:17.350Z
%% Total actions: 8

%% suck_up
% Action: SUCK UP
% Source: Ensemble / impression-bragging

action(suck_up, 'SUCK UP', social, 1).
action_difficulty(suck_up, 0.5).
action_duration(suck_up, 1).
action_category(suck_up, impression_bragging).
action_source(suck_up, ensemble).
action_verb(suck_up, past, 'suck up').
action_verb(suck_up, present, 'suck up').
action_target_type(suck_up, self).
action_leads_to(suck_up, flatter).
can_perform(Actor, suck_up) :- true.

%% brag
% Action: BRAG
% Source: Ensemble / impression-bragging

action(brag, 'BRAG', social, 1).
action_difficulty(brag, 0.5).
action_duration(brag, 1).
action_category(brag, impression_bragging).
action_source(brag, ensemble).
action_verb(brag, past, 'brag').
action_verb(brag, present, 'brag').
action_target_type(brag, self).
action_leads_to(brag, engage_in_a_rich_person_dance_while_not_rich_person).
action_leads_to(brag, dressing_up_compared_to_one_s_social_rank).
action_leads_to(brag, brag_successfully).
action_leads_to(brag, brag_unsuccessfully).
can_perform(Actor, brag) :- true.

%% impress
% Action: IMPRESS
% Source: Ensemble / impression-bragging

action(impress, 'IMPRESS', social, 1).
action_difficulty(impress, 0.5).
action_duration(impress, 1).
action_category(impress, impression_bragging).
action_source(impress, ensemble).
action_verb(impress, past, 'impress').
action_verb(impress, present, 'impress').
action_target_type(impress, self).
action_leads_to(impress, too_tired_for_gossips).
action_leads_to(impress, gift_given_meant_to_impress_but_does_not_impress_receiver).
action_leads_to(impress, flatter_with_kindness_and_attention).
action_leads_to(impress, impress_successfully).
action_leads_to(impress, impress_unsuccessfully).
can_perform(Actor, impress) :- true.

%% brag_successfully
% Action: brag successfully
% Source: Ensemble / impression-bragging

action(brag_successfully, 'brag successfully', social, 1).
action_difficulty(brag_successfully, 0.5).
action_duration(brag_successfully, 1).
action_category(brag_successfully, impression_bragging).
action_source(brag_successfully, ensemble).
action_parent(brag_successfully, brag).
action_verb(brag_successfully, past, 'brag successfully').
action_verb(brag_successfully, present, 'brag successfully').
action_target_type(brag_successfully, other).
action_requires_target(brag_successfully).
action_range(brag_successfully, 5).
action_is_accept(brag_successfully).
action_effect(brag_successfully, (modify_network(Target, Actor, credibility, +, 5))).
can_perform(Actor, brag_successfully, Target) :- true.

%% brag_unsuccessfully
% Action: brag unsuccessfully
% Source: Ensemble / impression-bragging

action(brag_unsuccessfully, 'brag unsuccessfully', social, 1).
action_difficulty(brag_unsuccessfully, 0.5).
action_duration(brag_unsuccessfully, 1).
action_category(brag_unsuccessfully, impression_bragging).
action_source(brag_unsuccessfully, ensemble).
action_parent(brag_unsuccessfully, brag).
action_verb(brag_unsuccessfully, past, 'brag unsuccessfully').
action_verb(brag_unsuccessfully, present, 'brag unsuccessfully').
action_target_type(brag_unsuccessfully, other).
action_requires_target(brag_unsuccessfully).
action_range(brag_unsuccessfully, 5).
action_effect(brag_unsuccessfully, (modify_network(Target, Actor, credibility, -, 5))).
can_perform(Actor, brag_unsuccessfully, Target) :- true.

%% impress_successfully
% Action: impress successfully
% Source: Ensemble / impression-bragging

action(impress_successfully, 'impress successfully', social, 1).
action_difficulty(impress_successfully, 0.5).
action_duration(impress_successfully, 1).
action_category(impress_successfully, impression_bragging).
action_source(impress_successfully, ensemble).
action_parent(impress_successfully, impress).
action_verb(impress_successfully, past, 'impress successfully').
action_verb(impress_successfully, present, 'impress successfully').
action_target_type(impress_successfully, other).
action_requires_target(impress_successfully).
action_range(impress_successfully, 5).
action_is_accept(impress_successfully).
action_effect(impress_successfully, (modify_network(Target, Actor, curiosity, +, 5))).
can_perform(Actor, impress_successfully, Target) :- true.

%% impress_unsuccessfully
% Action: impress unsuccessfully
% Source: Ensemble / impression-bragging

action(impress_unsuccessfully, 'impress unsuccessfully', social, 1).
action_difficulty(impress_unsuccessfully, 0.5).
action_duration(impress_unsuccessfully, 1).
action_category(impress_unsuccessfully, impression_bragging).
action_source(impress_unsuccessfully, ensemble).
action_parent(impress_unsuccessfully, impress).
action_verb(impress_unsuccessfully, past, 'impress unsuccessfully').
action_verb(impress_unsuccessfully, present, 'impress unsuccessfully').
action_target_type(impress_unsuccessfully, other).
action_requires_target(impress_unsuccessfully).
action_range(impress_unsuccessfully, 5).
action_effect(impress_unsuccessfully, (modify_network(Target, Actor, affinity, -, 5))).
can_perform(Actor, impress_unsuccessfully, Target) :- true.

%% brag_about_something_you_ve_done
% Action: Brag about something you’ve done
% Source: Ensemble / impression-bragging

action(brag_about_something_you_ve_done, 'Brag about something you''ve done', social, 1).
action_difficulty(brag_about_something_you_ve_done, 0.5).
action_duration(brag_about_something_you_ve_done, 1).
action_category(brag_about_something_you_ve_done, impression_bragging).
action_source(brag_about_something_you_ve_done, ensemble).
action_verb(brag_about_something_you_ve_done, past, 'brag about something you''ve done').
action_verb(brag_about_something_you_ve_done, present, 'brag about something you''ve done').
action_target_type(brag_about_something_you_ve_done, self).
action_influence(brag_about_something_you_ve_done, (influence(unknown, _, _, weight, +, 0))).
can_perform(Actor, brag_about_something_you_ve_done) :- true.

%% ═══════════════════════════════════════════════════════════
%% Category: impression-display
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: impression-display
%% Source: data/ensemble/actions/impression-display.json
%% Converted: 2026-04-01T20:15:17.350Z
%% Total actions: 20

%% display_wit
% Action: DISPLAY WIT
% Source: Ensemble / impression-display

action(display_wit, 'DISPLAY WIT', social, 1).
action_difficulty(display_wit, 0.5).
action_duration(display_wit, 1).
action_category(display_wit, impression_display).
action_source(display_wit, ensemble).
action_verb(display_wit, past, 'display wit').
action_verb(display_wit, present, 'display wit').
action_target_type(display_wit, self).
action_leads_to(display_wit, yell_something_witty_at_actor_during_play).
action_leads_to(display_wit, refrain_from_yelling_something_witty_at_actor_during_play).
action_leads_to(display_wit, display_wit_successfully).
action_leads_to(display_wit, display_wit_unsuccessfully).
can_perform(Actor, display_wit) :- true.

%% display_initiative
% Action: DISPLAY INITIATIVE
% Source: Ensemble / impression-display

action(display_initiative, 'DISPLAY INITIATIVE', social, 1).
action_difficulty(display_initiative, 0.5).
action_duration(display_initiative, 1).
action_category(display_initiative, impression_display).
action_source(display_initiative, ensemble).
action_verb(display_initiative, past, 'display initiative').
action_verb(display_initiative, present, 'display initiative').
action_target_type(display_initiative, self).
action_leads_to(display_initiative, pay_for_someone_applauding_during_the_play).
action_leads_to(display_initiative, servant_starts_whistling).
action_leads_to(display_initiative, display_initiative_successfully).
action_leads_to(display_initiative, display_initiative_unsuccessfully).
can_perform(Actor, display_initiative) :- true.

%% display_worldliness
% Action: DISPLAY WORLDLINESS
% Source: Ensemble / impression-display

action(display_worldliness, 'DISPLAY WORLDLINESS', social, 1).
action_difficulty(display_worldliness, 0.5).
action_duration(display_worldliness, 1).
action_category(display_worldliness, impression_display).
action_source(display_worldliness, ensemble).
action_verb(display_worldliness, past, 'display worldliness').
action_verb(display_worldliness, present, 'display worldliness').
action_target_type(display_worldliness, self).
action_leads_to(display_worldliness, behave_like_the_others_at_the_theater).
action_leads_to(display_worldliness, talk_about_science_philosophy).
action_leads_to(display_worldliness, display_worldliness_successfully).
action_leads_to(display_worldliness, display_worldliness_unsuccessfully).
can_perform(Actor, display_worldliness) :- true.

%% display_eccentricity
% Action: DISPLAY ECCENTRICITY
% Source: Ensemble / impression-display

action(display_eccentricity, 'DISPLAY ECCENTRICITY', social, 1).
action_difficulty(display_eccentricity, 0.5).
action_duration(display_eccentricity, 1).
action_category(display_eccentricity, impression_display).
action_source(display_eccentricity, ensemble).
action_verb(display_eccentricity, past, 'display eccentricity').
action_verb(display_eccentricity, present, 'display eccentricity').
action_target_type(display_eccentricity, self).
action_leads_to(display_eccentricity, respond_in_patois_but_gain_everyone_s_admiration).
action_leads_to(display_eccentricity, display_eccentricity_successfully).
action_leads_to(display_eccentricity, display_eccentricity_unsuccessfully).
can_perform(Actor, display_eccentricity) :- true.

%% reveal_ignorance
% Action: REVEAL IGNORANCE
% Source: Ensemble / impression-display

action(reveal_ignorance, 'REVEAL IGNORANCE', social, 1).
action_difficulty(reveal_ignorance, 0.5).
action_duration(reveal_ignorance, 1).
action_category(reveal_ignorance, impression_display).
action_source(reveal_ignorance, ensemble).
action_verb(reveal_ignorance, past, 'reveal ignorance').
action_verb(reveal_ignorance, present, 'reveal ignorance').
action_target_type(reveal_ignorance, self).
action_leads_to(reveal_ignorance, reveal_ignorance_successfully).
action_leads_to(reveal_ignorance, reveal_ignorance_unsuccessfully).
can_perform(Actor, reveal_ignorance) :- true.

%% demonstrate_virtue
% Action: DEMONSTRATE VIRTUE
% Source: Ensemble / impression-display

action(demonstrate_virtue, 'DEMONSTRATE VIRTUE', social, 1).
action_difficulty(demonstrate_virtue, 0.5).
action_duration(demonstrate_virtue, 1).
action_category(demonstrate_virtue, impression_display).
action_source(demonstrate_virtue, ensemble).
action_verb(demonstrate_virtue, past, 'demonstrate virtue').
action_verb(demonstrate_virtue, present, 'demonstrate virtue').
action_target_type(demonstrate_virtue, self).
action_leads_to(demonstrate_virtue, lover_catches_virtuous_partner_disbelieves_display_of_virtue).
action_leads_to(demonstrate_virtue, virtuous_behavior_is_convincing_to_friend_results_in_esteem).
action_leads_to(demonstrate_virtue, reject_concurrent_lover).
action_leads_to(demonstrate_virtue, move_listeners_to_tears_through_honesty_virtue).
action_leads_to(demonstrate_virtue, express_gratitude_toward_benefactor).
action_leads_to(demonstrate_virtue, demonstratevirtue_successfully).
action_leads_to(demonstrate_virtue, demonstratevirtue_unsuccessfully).
can_perform(Actor, demonstrate_virtue) :- true.

%% display_wit_successfully
% Action: display wit successfully
% Source: Ensemble / impression-display

action(display_wit_successfully, 'display wit successfully', social, 1).
action_difficulty(display_wit_successfully, 0.5).
action_duration(display_wit_successfully, 1).
action_category(display_wit_successfully, impression_display).
action_source(display_wit_successfully, ensemble).
action_parent(display_wit_successfully, display_wit).
action_verb(display_wit_successfully, past, 'display wit successfully').
action_verb(display_wit_successfully, present, 'display wit successfully').
action_target_type(display_wit_successfully, other).
action_requires_target(display_wit_successfully).
action_range(display_wit_successfully, 5).
action_is_accept(display_wit_successfully).
action_effect(display_wit_successfully, (modify_network(Target, Actor, emulation, +, 5))).
can_perform(Actor, display_wit_successfully, Target) :- true.

%% display_wit_unsuccessfully
% Action: display wit unsuccessfully
% Source: Ensemble / impression-display

action(display_wit_unsuccessfully, 'display wit unsuccessfully', social, 1).
action_difficulty(display_wit_unsuccessfully, 0.5).
action_duration(display_wit_unsuccessfully, 1).
action_category(display_wit_unsuccessfully, impression_display).
action_source(display_wit_unsuccessfully, ensemble).
action_parent(display_wit_unsuccessfully, display_wit).
action_verb(display_wit_unsuccessfully, past, 'display wit unsuccessfully').
action_verb(display_wit_unsuccessfully, present, 'display wit unsuccessfully').
action_target_type(display_wit_unsuccessfully, other).
action_requires_target(display_wit_unsuccessfully).
action_range(display_wit_unsuccessfully, 5).
action_effect(display_wit_unsuccessfully, (modify_network(Target, Actor, emulation, -, 5))).
can_perform(Actor, display_wit_unsuccessfully, Target) :- true.

%% display_initiative_successfully
% Action: display initiative successfully
% Source: Ensemble / impression-display

action(display_initiative_successfully, 'display initiative successfully', social, 1).
action_difficulty(display_initiative_successfully, 0.5).
action_duration(display_initiative_successfully, 1).
action_category(display_initiative_successfully, impression_display).
action_source(display_initiative_successfully, ensemble).
action_parent(display_initiative_successfully, display_initiative).
action_verb(display_initiative_successfully, past, 'display initiative successfully').
action_verb(display_initiative_successfully, present, 'display initiative successfully').
action_target_type(display_initiative_successfully, self).
action_is_accept(display_initiative_successfully).
can_perform(Actor, display_initiative_successfully) :- true.

%% display_initiative_unsuccessfully
% Action: display initiative unsuccessfully
% Source: Ensemble / impression-display

action(display_initiative_unsuccessfully, 'display initiative unsuccessfully', social, 1).
action_difficulty(display_initiative_unsuccessfully, 0.5).
action_duration(display_initiative_unsuccessfully, 1).
action_category(display_initiative_unsuccessfully, impression_display).
action_source(display_initiative_unsuccessfully, ensemble).
action_parent(display_initiative_unsuccessfully, display_initiative).
action_verb(display_initiative_unsuccessfully, past, 'display initiative unsuccessfully').
action_verb(display_initiative_unsuccessfully, present, 'display initiative unsuccessfully').
action_target_type(display_initiative_unsuccessfully, self).
can_perform(Actor, display_initiative_unsuccessfully) :- true.

%% display_worldliness_successfully
% Action: display worldliness successfully
% Source: Ensemble / impression-display

action(display_worldliness_successfully, 'display worldliness successfully', social, 1).
action_difficulty(display_worldliness_successfully, 0.5).
action_duration(display_worldliness_successfully, 1).
action_category(display_worldliness_successfully, impression_display).
action_source(display_worldliness_successfully, ensemble).
action_parent(display_worldliness_successfully, display_worldliness).
action_verb(display_worldliness_successfully, past, 'display worldliness successfully').
action_verb(display_worldliness_successfully, present, 'display worldliness successfully').
action_target_type(display_worldliness_successfully, other).
action_requires_target(display_worldliness_successfully).
action_range(display_worldliness_successfully, 5).
action_is_accept(display_worldliness_successfully).
action_effect(display_worldliness_successfully, (modify_network(Target, Actor, emulation, +, 5))).
can_perform(Actor, display_worldliness_successfully, Target) :- true.

%% display_worldliness_unsuccessfully
% Action: display worldliness unsuccessfully
% Source: Ensemble / impression-display

action(display_worldliness_unsuccessfully, 'display worldliness unsuccessfully', social, 1).
action_difficulty(display_worldliness_unsuccessfully, 0.5).
action_duration(display_worldliness_unsuccessfully, 1).
action_category(display_worldliness_unsuccessfully, impression_display).
action_source(display_worldliness_unsuccessfully, ensemble).
action_parent(display_worldliness_unsuccessfully, display_worldliness).
action_verb(display_worldliness_unsuccessfully, past, 'display worldliness unsuccessfully').
action_verb(display_worldliness_unsuccessfully, present, 'display worldliness unsuccessfully').
action_target_type(display_worldliness_unsuccessfully, other).
action_requires_target(display_worldliness_unsuccessfully).
action_range(display_worldliness_unsuccessfully, 5).
action_effect(display_worldliness_unsuccessfully, (modify_network(Target, Actor, emulation, -, 5))).
can_perform(Actor, display_worldliness_unsuccessfully, Target) :- true.

%% display_eccentricity_successfully
% Action: display eccentricity successfully
% Source: Ensemble / impression-display

action(display_eccentricity_successfully, 'display eccentricity successfully', social, 1).
action_difficulty(display_eccentricity_successfully, 0.5).
action_duration(display_eccentricity_successfully, 1).
action_category(display_eccentricity_successfully, impression_display).
action_source(display_eccentricity_successfully, ensemble).
action_parent(display_eccentricity_successfully, display_eccentricity).
action_verb(display_eccentricity_successfully, past, 'display eccentricity successfully').
action_verb(display_eccentricity_successfully, present, 'display eccentricity successfully').
action_target_type(display_eccentricity_successfully, other).
action_requires_target(display_eccentricity_successfully).
action_range(display_eccentricity_successfully, 5).
action_is_accept(display_eccentricity_successfully).
action_effect(display_eccentricity_successfully, (modify_network(Target, Actor, emulation, -, 5))).
can_perform(Actor, display_eccentricity_successfully, Target) :- true.

%% display_eccentricity_unsuccessfully
% Action: display eccentricity unsuccessfully
% Source: Ensemble / impression-display

action(display_eccentricity_unsuccessfully, 'display eccentricity unsuccessfully', social, 1).
action_difficulty(display_eccentricity_unsuccessfully, 0.5).
action_duration(display_eccentricity_unsuccessfully, 1).
action_category(display_eccentricity_unsuccessfully, impression_display).
action_source(display_eccentricity_unsuccessfully, ensemble).
action_parent(display_eccentricity_unsuccessfully, display_eccentricity).
action_verb(display_eccentricity_unsuccessfully, past, 'display eccentricity unsuccessfully').
action_verb(display_eccentricity_unsuccessfully, present, 'display eccentricity unsuccessfully').
action_target_type(display_eccentricity_unsuccessfully, other).
action_requires_target(display_eccentricity_unsuccessfully).
action_range(display_eccentricity_unsuccessfully, 5).
action_effect(display_eccentricity_unsuccessfully, (modify_network(Target, Actor, emulation, +, 5))).
can_perform(Actor, display_eccentricity_unsuccessfully, Target) :- true.

%% reveal_ignorance_successfully
% Action: reveal ignorance successfully
% Source: Ensemble / impression-display

action(reveal_ignorance_successfully, 'reveal ignorance successfully', social, 1).
action_difficulty(reveal_ignorance_successfully, 0.5).
action_duration(reveal_ignorance_successfully, 1).
action_category(reveal_ignorance_successfully, impression_display).
action_source(reveal_ignorance_successfully, ensemble).
action_parent(reveal_ignorance_successfully, reveal_ignorance).
action_verb(reveal_ignorance_successfully, past, 'reveal ignorance successfully').
action_verb(reveal_ignorance_successfully, present, 'reveal ignorance successfully').
action_target_type(reveal_ignorance_successfully, self).
action_is_accept(reveal_ignorance_successfully).
can_perform(Actor, reveal_ignorance_successfully) :- true.

%% reveal_ignorance_unsuccessfully
% Action: reveal ignorance unsuccessfully
% Source: Ensemble / impression-display

action(reveal_ignorance_unsuccessfully, 'reveal ignorance unsuccessfully', social, 1).
action_difficulty(reveal_ignorance_unsuccessfully, 0.5).
action_duration(reveal_ignorance_unsuccessfully, 1).
action_category(reveal_ignorance_unsuccessfully, impression_display).
action_source(reveal_ignorance_unsuccessfully, ensemble).
action_parent(reveal_ignorance_unsuccessfully, reveal_ignorance).
action_verb(reveal_ignorance_unsuccessfully, past, 'reveal ignorance unsuccessfully').
action_verb(reveal_ignorance_unsuccessfully, present, 'reveal ignorance unsuccessfully').
action_target_type(reveal_ignorance_unsuccessfully, other).
action_requires_target(reveal_ignorance_unsuccessfully).
action_range(reveal_ignorance_unsuccessfully, 5).
action_effect(reveal_ignorance_unsuccessfully, (modify_network(Target, Actor, credibility, +, 5))).
can_perform(Actor, reveal_ignorance_unsuccessfully, Target) :- true.

%% reveal_a_dirty_secret
% Action: reveal a dirty secret
% Source: Ensemble / impression-display

action(reveal_a_dirty_secret, 'reveal a dirty secret', social, 1).
action_difficulty(reveal_a_dirty_secret, 0.5).
action_duration(reveal_a_dirty_secret, 1).
action_category(reveal_a_dirty_secret, impression_display).
action_source(reveal_a_dirty_secret, ensemble).
action_verb(reveal_a_dirty_secret, past, 'reveal a dirty secret').
action_verb(reveal_a_dirty_secret, present, 'reveal a dirty secret').
action_target_type(reveal_a_dirty_secret, other).
action_requires_target(reveal_a_dirty_secret).
action_range(reveal_a_dirty_secret, 5).
action_is_accept(reveal_a_dirty_secret).
action_prerequisite(reveal_a_dirty_secret, (ensemble_condition(Target, caught in a lie by, true))).
action_prerequisite(reveal_a_dirty_secret, (ensemble_condition(Target, made a faux pas around, true))).
action_prerequisite(reveal_a_dirty_secret, (attribute(Someone, propriety, V), V =:= 50)).
action_effect(reveal_a_dirty_secret, (assert(relationship(Actor, Target, rivals)))).
action_effect(reveal_a_dirty_secret, (modify_network(Target, Actor, affinity, -, 10))).
% Can Actor perform this action?
can_perform(Actor, reveal_a_dirty_secret, Target) :-
    ensemble_condition(Target, caught in a lie by, true),
    ensemble_condition(Target, made a faux pas around, true),
    attribute(Someone, propriety, V), V =:= 50.

%% demonstratevirtue_successfully
% Action: demonstratevirtue successfully
% Source: Ensemble / impression-display

action(demonstratevirtue_successfully, 'demonstratevirtue successfully', social, 1).
action_difficulty(demonstratevirtue_successfully, 0.5).
action_duration(demonstratevirtue_successfully, 1).
action_category(demonstratevirtue_successfully, impression_display).
action_source(demonstratevirtue_successfully, ensemble).
action_parent(demonstratevirtue_successfully, demonstrate_virtue).
action_verb(demonstratevirtue_successfully, past, 'demonstratevirtue successfully').
action_verb(demonstratevirtue_successfully, present, 'demonstratevirtue successfully').
action_target_type(demonstratevirtue_successfully, other).
action_requires_target(demonstratevirtue_successfully).
action_range(demonstratevirtue_successfully, 5).
action_is_accept(demonstratevirtue_successfully).
action_effect(demonstratevirtue_successfully, (assert(relationship(Actor, Target, esteem)))).
can_perform(Actor, demonstratevirtue_successfully, Target) :- true.

%% demonstratevirtue_unsuccessfully
% Action: demonstratevirtue unsuccessfully
% Source: Ensemble / impression-display

action(demonstratevirtue_unsuccessfully, 'demonstratevirtue unsuccessfully', social, 1).
action_difficulty(demonstratevirtue_unsuccessfully, 0.5).
action_duration(demonstratevirtue_unsuccessfully, 1).
action_category(demonstratevirtue_unsuccessfully, impression_display).
action_source(demonstratevirtue_unsuccessfully, ensemble).
action_parent(demonstratevirtue_unsuccessfully, demonstrate_virtue).
action_verb(demonstratevirtue_unsuccessfully, past, 'demonstratevirtue unsuccessfully').
action_verb(demonstratevirtue_unsuccessfully, present, 'demonstratevirtue unsuccessfully').
action_target_type(demonstratevirtue_unsuccessfully, other).
action_requires_target(demonstratevirtue_unsuccessfully).
action_range(demonstratevirtue_unsuccessfully, 5).
action_effect(demonstratevirtue_unsuccessfully, (retract(relationship(Actor, Target, esteem)))).
can_perform(Actor, demonstratevirtue_unsuccessfully, Target) :- true.

%% show_off_knowledge_through_small_talk
% Action: Show off knowledge through small talk
% Source: Ensemble / impression-display

action(show_off_knowledge_through_small_talk, 'Show off knowledge through small talk', social, 1).
action_difficulty(show_off_knowledge_through_small_talk, 0.5).
action_duration(show_off_knowledge_through_small_talk, 1).
action_category(show_off_knowledge_through_small_talk, impression_display).
action_source(show_off_knowledge_through_small_talk, ensemble).
action_verb(show_off_knowledge_through_small_talk, past, 'show off knowledge through small talk').
action_verb(show_off_knowledge_through_small_talk, present, 'show off knowledge through small talk').
action_target_type(show_off_knowledge_through_small_talk, self).
can_perform(Actor, show_off_knowledge_through_small_talk) :- true.

%% ═══════════════════════════════════════════════════════════
%% Category: information-exchange
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: information-exchange
%% Source: data/ensemble/actions/information-exchange.json
%% Converted: 2026-04-01T20:15:17.350Z
%% Total actions: 4

%% keep_a_secret_for_someone
% Action: keep a secret for someone
% Source: Ensemble / information-exchange

action(keep_a_secret_for_someone, 'keep a secret for someone', social, 1).
action_difficulty(keep_a_secret_for_someone, 0.5).
action_duration(keep_a_secret_for_someone, 1).
action_category(keep_a_secret_for_someone, information_exchange).
action_source(keep_a_secret_for_someone, ensemble).
action_verb(keep_a_secret_for_someone, past, 'keep a secret for someone').
action_verb(keep_a_secret_for_someone, present, 'keep a secret for someone').
action_target_type(keep_a_secret_for_someone, other).
action_requires_target(keep_a_secret_for_someone).
action_range(keep_a_secret_for_someone, 5).
action_is_accept(keep_a_secret_for_someone).
action_prerequisite(keep_a_secret_for_someone, (\+ trait(Actor, indiscreet))).
action_prerequisite(keep_a_secret_for_someone, (trait(Actor, trustworthy))).
action_effect(keep_a_secret_for_someone, (modify_network(Target, Actor, affinity, +, 10))).
% Can Actor perform this action?
can_perform(Actor, keep_a_secret_for_someone, Target) :-
    \+ trait(Actor, indiscreet),
    trait(Actor, trustworthy).

%% confess_true_virtuous_feelings
% Action: confess true virtuous feelings
% Source: Ensemble / information-exchange

action(confess_true_virtuous_feelings, 'confess true virtuous feelings', social, 1).
action_difficulty(confess_true_virtuous_feelings, 0.5).
action_duration(confess_true_virtuous_feelings, 1).
action_category(confess_true_virtuous_feelings, information_exchange).
action_source(confess_true_virtuous_feelings, ensemble).
action_verb(confess_true_virtuous_feelings, past, 'confess true virtuous feelings').
action_verb(confess_true_virtuous_feelings, present, 'confess true virtuous feelings').
action_target_type(confess_true_virtuous_feelings, other).
action_requires_target(confess_true_virtuous_feelings).
action_range(confess_true_virtuous_feelings, 5).
action_is_accept(confess_true_virtuous_feelings).
action_prerequisite(confess_true_virtuous_feelings, (trait(Actor, virtuous))).
action_prerequisite(confess_true_virtuous_feelings, (ensemble_condition(Target, offended by, true))).
action_prerequisite(confess_true_virtuous_feelings, (trait(Actor, honest))).
action_effect(confess_true_virtuous_feelings, (modify_network(Target, Actor, credibility, +, 15))).
action_effect(confess_true_virtuous_feelings, (ensemble_effect(Target, offended by, false))).
% Can Actor perform this action?
can_perform(Actor, confess_true_virtuous_feelings, Target) :-
    trait(Actor, virtuous),
    ensemble_condition(Target, offended by, true),
    trait(Actor, honest).

%% attempt_to_conceal_information_from_friend_fails
% Action: attempt to conceal information from friend fails
% Source: Ensemble / information-exchange

action(attempt_to_conceal_information_from_friend_fails, 'attempt to conceal information from friend fails', social, 1).
action_difficulty(attempt_to_conceal_information_from_friend_fails, 0.5).
action_duration(attempt_to_conceal_information_from_friend_fails, 1).
action_category(attempt_to_conceal_information_from_friend_fails, information_exchange).
action_source(attempt_to_conceal_information_from_friend_fails, ensemble).
action_verb(attempt_to_conceal_information_from_friend_fails, past, 'attempt to conceal information from friend fails').
action_verb(attempt_to_conceal_information_from_friend_fails, present, 'attempt to conceal information from friend fails').
action_target_type(attempt_to_conceal_information_from_friend_fails, other).
action_requires_target(attempt_to_conceal_information_from_friend_fails).
action_range(attempt_to_conceal_information_from_friend_fails, 5).
action_prerequisite(attempt_to_conceal_information_from_friend_fails, (relationship(Actor, Target, friends))).
action_prerequisite(attempt_to_conceal_information_from_friend_fails, (status(Actor, embarrassed))).
action_prerequisite(attempt_to_conceal_information_from_friend_fails, (attribute(Target, nosiness, V), V > 50)).
action_effect(attempt_to_conceal_information_from_friend_fails, (modify_network(Target, Actor, curiosity, +, 15))).
% Can Actor perform this action?
can_perform(Actor, attempt_to_conceal_information_from_friend_fails, Target) :-
    relationship(Actor, Target, friends),
    status(Actor, embarrassed),
    attribute(Target, nosiness, V), V > 50.

%% don_t_know
% Action: Don’t know
% Source: Ensemble / information-exchange

action(don_t_know, 'Don''t know', social, 1).
action_difficulty(don_t_know, 0.5).
action_duration(don_t_know, 1).
action_category(don_t_know, information_exchange).
action_source(don_t_know, ensemble).
action_verb(don_t_know, past, 'don''t know').
action_verb(don_t_know, present, 'don''t know').
action_target_type(don_t_know, other).
action_requires_target(don_t_know).
action_range(don_t_know, 5).
action_effect(don_t_know, (modify_network(Actor, Target, trust, -, 1))).
action_effect(don_t_know, (modify_network(Target, Actor, trust, -, 1))).
action_effect(don_t_know, (ensemble_effect(Actor, negative, true))).
action_effect(don_t_know, (ensemble_effect(Target, negative, true))).
can_perform(Actor, don_t_know, Target) :- true.

%% ═══════════════════════════════════════════════════════════
%% Category: intent-volition
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: intent-volition
%% Source: data/ensemble/actions/intent-volition.json
%% Converted: 2026-04-01T20:15:17.350Z
%% Total actions: 51

%% deny_up
% Action: deny-up
% Source: Ensemble / intent-volition

action(deny_up, 'deny-up', social, 1).
action_difficulty(deny_up, 0.5).
action_duration(deny_up, 1).
action_category(deny_up, intent_volition).
action_source(deny_up, ensemble).
action_verb(deny_up, past, 'deny-up').
action_verb(deny_up, present, 'deny-up').
action_target_type(deny_up, self).
action_leads_to(deny_up, deny).
can_perform(Actor, deny_up) :- true.

%% candid_up
% Action: candid-up
% Source: Ensemble / intent-volition

action(candid_up, 'candid-up', social, 1).
action_difficulty(candid_up, 0.5).
action_duration(candid_up, 1).
action_category(candid_up, intent_volition).
action_source(candid_up, ensemble).
action_verb(candid_up, past, 'candid-up').
action_verb(candid_up, present, 'candid-up').
action_target_type(candid_up, self).
action_leads_to(candid_up, be_candid).
can_perform(Actor, candid_up) :- true.

%% favor_up
% Action: favor-up
% Source: Ensemble / intent-volition

action(favor_up, 'favor-up', social, 1).
action_difficulty(favor_up, 0.5).
action_duration(favor_up, 1).
action_category(favor_up, intent_volition).
action_source(favor_up, ensemble).
action_verb(favor_up, past, 'favor-up').
action_verb(favor_up, present, 'favor-up').
action_target_type(favor_up, self).
action_leads_to(favor_up, favor).
can_perform(Actor, favor_up) :- true.

%% manipulate_up
% Action: manipulate-up
% Source: Ensemble / intent-volition

action(manipulate_up, 'manipulate-up', social, 1).
action_difficulty(manipulate_up, 0.5).
action_duration(manipulate_up, 1).
action_category(manipulate_up, intent_volition).
action_source(manipulate_up, ensemble).
action_verb(manipulate_up, past, 'manipulate-up').
action_verb(manipulate_up, present, 'manipulate-up').
action_target_type(manipulate_up, self).
action_leads_to(manipulate_up, manipulate).
can_perform(Actor, manipulate_up) :- true.

%% antagonize_up
% Action: antagonize-up
% Source: Ensemble / intent-volition

action(antagonize_up, 'antagonize-up', social, 1).
action_difficulty(antagonize_up, 0.5).
action_duration(antagonize_up, 1).
action_category(antagonize_up, intent_volition).
action_source(antagonize_up, ensemble).
action_verb(antagonize_up, past, 'antagonize-up').
action_verb(antagonize_up, present, 'antagonize-up').
action_target_type(antagonize_up, self).
action_leads_to(antagonize_up, antagonize).
can_perform(Actor, antagonize_up) :- true.

%% humble_up
% Action: humble-up
% Source: Ensemble / intent-volition

action(humble_up, 'humble-up', social, 1).
action_difficulty(humble_up, 0.5).
action_duration(humble_up, 1).
action_category(humble_up, intent_volition).
action_source(humble_up, ensemble).
action_verb(humble_up, past, 'humble-up').
action_verb(humble_up, present, 'humble-up').
action_target_type(humble_up, self).
action_leads_to(humble_up, be_humble).
can_perform(Actor, humble_up) :- true.

%% depressed_up
% Action: depressed-up
% Source: Ensemble / intent-volition

action(depressed_up, 'depressed-up', social, 1).
action_difficulty(depressed_up, 0.5).
action_duration(depressed_up, 1).
action_category(depressed_up, intent_volition).
action_source(depressed_up, ensemble).
action_verb(depressed_up, past, 'depressed-up').
action_verb(depressed_up, present, 'depressed-up').
action_target_type(depressed_up, self).
action_leads_to(depressed_up, be_depressed).
can_perform(Actor, depressed_up) :- true.

%% jokearound_up
% Action: jokearound-up
% Source: Ensemble / intent-volition

action(jokearound_up, 'jokearound-up', social, 1).
action_difficulty(jokearound_up, 0.5).
action_duration(jokearound_up, 1).
action_category(jokearound_up, intent_volition).
action_source(jokearound_up, ensemble).
action_verb(jokearound_up, past, 'jokearound-up').
action_verb(jokearound_up, present, 'jokearound-up').
action_target_type(jokearound_up, self).
action_leads_to(jokearound_up, joke_around).
can_perform(Actor, jokearound_up) :- true.

%% suckup_up
% Action: suckup-up
% Source: Ensemble / intent-volition

action(suckup_up, 'suckup-up', social, 1).
action_difficulty(suckup_up, 0.5).
action_duration(suckup_up, 1).
action_category(suckup_up, intent_volition).
action_source(suckup_up, ensemble).
action_verb(suckup_up, past, 'suckup-up').
action_verb(suckup_up, present, 'suckup-up').
action_target_type(suckup_up, self).
action_leads_to(suckup_up, suck_up).
can_perform(Actor, suckup_up) :- true.

%% trust_up
% Action: trust-up
% Source: Ensemble / intent-volition

action(trust_up, 'trust-up', social, 1).
action_difficulty(trust_up, 0.5).
action_duration(trust_up, 1).
action_category(trust_up, intent_volition).
action_source(trust_up, ensemble).
action_verb(trust_up, past, 'trust-up').
action_verb(trust_up, present, 'trust-up').
action_target_type(trust_up, self).
action_leads_to(trust_up, act_trustingly).
can_perform(Actor, trust_up) :- true.

%% putdown_up
% Action: putdown-up
% Source: Ensemble / intent-volition

action(putdown_up, 'putdown-up', social, 1).
action_difficulty(putdown_up, 0.5).
action_duration(putdown_up, 1).
action_category(putdown_up, intent_volition).
action_source(putdown_up, ensemble).
action_verb(putdown_up, past, 'putdown-up').
action_verb(putdown_up, present, 'putdown-up').
action_target_type(putdown_up, self).
action_leads_to(putdown_up, put_down).
can_perform(Actor, putdown_up) :- true.

%% dismiss_up
% Action: dismiss-up
% Source: Ensemble / intent-volition

action(dismiss_up, 'dismiss-up', social, 1).
action_difficulty(dismiss_up, 0.5).
action_duration(dismiss_up, 1).
action_category(dismiss_up, intent_volition).
action_source(dismiss_up, ensemble).
action_verb(dismiss_up, past, 'dismiss-up').
action_verb(dismiss_up, present, 'dismiss-up').
action_target_type(dismiss_up, self).
action_leads_to(dismiss_up, dismiss).
can_perform(Actor, dismiss_up) :- true.

%% romance_up
% Action: romance-up
% Source: Ensemble / intent-volition

action(romance_up, 'romance-up', social, 1).
action_difficulty(romance_up, 0.5).
action_duration(romance_up, 1).
action_category(romance_up, intent_volition).
action_source(romance_up, ensemble).
action_verb(romance_up, past, 'romance-up').
action_verb(romance_up, present, 'romance-up').
action_target_type(romance_up, self).
action_leads_to(romance_up, romance).
can_perform(Actor, romance_up) :- true.

%% befriend_up
% Action: befriend-up
% Source: Ensemble / intent-volition

action(befriend_up, 'befriend-up', social, 1).
action_difficulty(befriend_up, 0.5).
action_duration(befriend_up, 1).
action_category(befriend_up, intent_volition).
action_source(befriend_up, ensemble).
action_verb(befriend_up, past, 'befriend-up').
action_verb(befriend_up, present, 'befriend-up').
action_target_type(befriend_up, self).
action_leads_to(befriend_up, befriend).
can_perform(Actor, befriend_up) :- true.

%% kind_up
% Action: kind-up
% Source: Ensemble / intent-volition

action(kind_up, 'kind-up', social, 1).
action_difficulty(kind_up, 0.5).
action_duration(kind_up, 1).
action_category(kind_up, intent_volition).
action_source(kind_up, ensemble).
action_verb(kind_up, past, 'kind-up').
action_verb(kind_up, present, 'kind-up').
action_target_type(kind_up, self).
action_leads_to(kind_up, be_kind).
can_perform(Actor, kind_up) :- true.

%% dominate_up
% Action: dominate-up
% Source: Ensemble / intent-volition

action(dominate_up, 'dominate-up', social, 1).
action_difficulty(dominate_up, 0.5).
action_duration(dominate_up, 1).
action_category(dominate_up, intent_volition).
action_source(dominate_up, ensemble).
action_verb(dominate_up, past, 'dominate-up').
action_verb(dominate_up, present, 'dominate-up').
action_target_type(dominate_up, self).
action_leads_to(dominate_up, dominate).
can_perform(Actor, dominate_up) :- true.

%% flirt_up
% Action: flirt-up
% Source: Ensemble / intent-volition

action(flirt_up, 'flirt-up', social, 1).
action_difficulty(flirt_up, 0.5).
action_duration(flirt_up, 1).
action_category(flirt_up, intent_volition).
action_source(flirt_up, ensemble).
action_verb(flirt_up, past, 'flirt-up').
action_verb(flirt_up, present, 'flirt-up').
action_target_type(flirt_up, self).
action_leads_to(flirt_up, flirt).
can_perform(Actor, flirt_up) :- true.

%% help_up
% Action: help-up
% Source: Ensemble / intent-volition

action(help_up, 'help-up', social, 1).
action_difficulty(help_up, 0.5).
action_duration(help_up, 1).
action_category(help_up, intent_volition).
action_source(help_up, ensemble).
action_verb(help_up, past, 'help-up').
action_verb(help_up, present, 'help-up').
action_target_type(help_up, self).
action_leads_to(help_up, help).
can_perform(Actor, help_up) :- true.

%% impress_up
% Action: impress-up
% Source: Ensemble / intent-volition

action(impress_up, 'impress-up', social, 1).
action_difficulty(impress_up, 0.5).
action_duration(impress_up, 1).
action_category(impress_up, intent_volition).
action_source(impress_up, ensemble).
action_verb(impress_up, past, 'impress-up').
action_verb(impress_up, present, 'impress-up').
action_target_type(impress_up, self).
action_leads_to(impress_up, impress).
can_perform(Actor, impress_up) :- true.

%% reluctant_up
% Action: reluctant-up
% Source: Ensemble / intent-volition

action(reluctant_up, 'reluctant-up', social, 1).
action_difficulty(reluctant_up, 0.5).
action_duration(reluctant_up, 1).
action_category(reluctant_up, intent_volition).
action_source(reluctant_up, ensemble).
action_verb(reluctant_up, past, 'reluctant-up').
action_verb(reluctant_up, present, 'reluctant-up').
action_target_type(reluctant_up, self).
action_leads_to(reluctant_up, be_reluctant).
can_perform(Actor, reluctant_up) :- true.

%% hospitable_up
% Action: hospitable-up
% Source: Ensemble / intent-volition

action(hospitable_up, 'hospitable-up', social, 1).
action_difficulty(hospitable_up, 0.5).
action_duration(hospitable_up, 1).
action_category(hospitable_up, intent_volition).
action_source(hospitable_up, ensemble).
action_verb(hospitable_up, past, 'hospitable-up').
action_verb(hospitable_up, present, 'hospitable-up').
action_target_type(hospitable_up, self).
action_leads_to(hospitable_up, be_hospitable).
can_perform(Actor, hospitable_up) :- true.

%% indifferent_up
% Action: indifferent-up
% Source: Ensemble / intent-volition

action(indifferent_up, 'indifferent-up', social, 1).
action_difficulty(indifferent_up, 0.5).
action_duration(indifferent_up, 1).
action_category(indifferent_up, intent_volition).
action_source(indifferent_up, ensemble).
action_verb(indifferent_up, past, 'indifferent-up').
action_verb(indifferent_up, present, 'indifferent-up').
action_target_type(indifferent_up, self).
action_leads_to(indifferent_up, be_indifferent).
can_perform(Actor, indifferent_up) :- true.

%% rude_up
% Action: rude-up
% Source: Ensemble / intent-volition

action(rude_up, 'rude-up', social, 1).
action_difficulty(rude_up, 0.5).
action_duration(rude_up, 1).
action_category(rude_up, intent_volition).
action_source(rude_up, ensemble).
action_verb(rude_up, past, 'rude-up').
action_verb(rude_up, present, 'rude-up').
action_target_type(rude_up, self).
action_leads_to(rude_up, be_rude).
can_perform(Actor, rude_up) :- true.

%% respect_up
% Action: respect-up
% Source: Ensemble / intent-volition

action(respect_up, 'respect-up', social, 1).
action_difficulty(respect_up, 0.5).
action_duration(respect_up, 1).
action_category(respect_up, intent_volition).
action_source(respect_up, ensemble).
action_verb(respect_up, past, 'respect-up').
action_verb(respect_up, present, 'respect-up').
action_target_type(respect_up, self).
action_leads_to(respect_up, respect).
can_perform(Actor, respect_up) :- true.

%% trust_up
% Action: trust-up
% Source: Ensemble / intent-volition

action(trust_up, 'trust-up', social, 1).
action_difficulty(trust_up, 0.5).
action_duration(trust_up, 1).
action_category(trust_up, intent_volition).
action_source(trust_up, ensemble).
action_verb(trust_up, past, 'trust-up').
action_verb(trust_up, present, 'trust-up').
action_target_type(trust_up, self).
action_leads_to(trust_up, act_trustworthy).
can_perform(Actor, trust_up) :- true.

%% closeness_up
% Action: closeness-up
% Source: Ensemble / intent-volition

action(closeness_up, 'closeness-up', social, 1).
action_difficulty(closeness_up, 0.5).
action_duration(closeness_up, 1).
action_category(closeness_up, intent_volition).
action_source(closeness_up, ensemble).
action_verb(closeness_up, past, 'closeness-up').
action_verb(closeness_up, present, 'closeness-up').
action_target_type(closeness_up, self).
action_leads_to(closeness_up, write_love_note).
action_leads_to(closeness_up, kiss).
can_perform(Actor, closeness_up) :- true.

%% play_with_up
% Action: play with-up
% Source: Ensemble / intent-volition

action(play_with_up, 'play with-up', social, 1).
action_difficulty(play_with_up, 0.5).
action_duration(play_with_up, 1).
action_category(play_with_up, intent_volition).
action_source(play_with_up, ensemble).
action_verb(play_with_up, past, 'play with-up').
action_verb(play_with_up, present, 'play with-up').
action_target_type(play_with_up, self).
can_perform(Actor, play_with_up) :- true.

%% play_with_down
% Action: play with-down
% Source: Ensemble / intent-volition

action(play_with_down, 'play with-down', social, 1).
action_difficulty(play_with_down, 0.5).
action_duration(play_with_down, 1).
action_category(play_with_down, intent_volition).
action_source(play_with_down, ensemble).
action_verb(play_with_down, past, 'play with-down').
action_verb(play_with_down, present, 'play with-down').
action_target_type(play_with_down, self).
can_perform(Actor, play_with_down) :- true.

%% beg_up
% Action: beg-up
% Source: Ensemble / intent-volition

action(beg_up, 'beg-up', social, 1).
action_difficulty(beg_up, 0.5).
action_duration(beg_up, 1).
action_category(beg_up, intent_volition).
action_source(beg_up, ensemble).
action_verb(beg_up, past, 'beg-up').
action_verb(beg_up, present, 'beg-up').
action_target_type(beg_up, self).
can_perform(Actor, beg_up) :- true.

%% beg_down
% Action: beg-down
% Source: Ensemble / intent-volition

action(beg_down, 'beg-down', social, 1).
action_difficulty(beg_down, 0.5).
action_duration(beg_down, 1).
action_category(beg_down, intent_volition).
action_source(beg_down, ensemble).
action_verb(beg_down, past, 'beg-down').
action_verb(beg_down, present, 'beg-down').
action_target_type(beg_down, self).
can_perform(Actor, beg_down) :- true.

%% express_affection_up
% Action: express affection-up
% Source: Ensemble / intent-volition

action(express_affection_up, 'express affection-up', social, 1).
action_difficulty(express_affection_up, 0.5).
action_duration(express_affection_up, 1).
action_category(express_affection_up, intent_volition).
action_source(express_affection_up, ensemble).
action_verb(express_affection_up, past, 'express affection-up').
action_verb(express_affection_up, present, 'express affection-up').
action_target_type(express_affection_up, self).
can_perform(Actor, express_affection_up) :- true.

%% express_affection_down
% Action: express affection-down
% Source: Ensemble / intent-volition

action(express_affection_down, 'express affection-down', social, 1).
action_difficulty(express_affection_down, 0.5).
action_duration(express_affection_down, 1).
action_category(express_affection_down, intent_volition).
action_source(express_affection_down, ensemble).
action_verb(express_affection_down, past, 'express affection-down').
action_verb(express_affection_down, present, 'express affection-down').
action_target_type(express_affection_down, self).
can_perform(Actor, express_affection_down) :- true.

%% rest_up
% Action: rest-up
% Source: Ensemble / intent-volition

action(rest_up, 'rest-up', social, 1).
action_difficulty(rest_up, 0.5).
action_duration(rest_up, 1).
action_category(rest_up, intent_volition).
action_source(rest_up, ensemble).
action_verb(rest_up, past, 'rest-up').
action_verb(rest_up, present, 'rest-up').
action_target_type(rest_up, self).
can_perform(Actor, rest_up) :- true.

%% rest_down
% Action: rest-down
% Source: Ensemble / intent-volition

action(rest_down, 'rest-down', social, 1).
action_difficulty(rest_down, 0.5).
action_duration(rest_down, 1).
action_category(rest_down, intent_volition).
action_source(rest_down, ensemble).
action_verb(rest_down, past, 'rest-down').
action_verb(rest_down, present, 'rest-down').
action_target_type(rest_down, self).
can_perform(Actor, rest_down) :- true.

%% get_exercise_up
% Action: get exercise-up
% Source: Ensemble / intent-volition

action(get_exercise_up, 'get exercise-up', social, 1).
action_difficulty(get_exercise_up, 0.5).
action_duration(get_exercise_up, 1).
action_category(get_exercise_up, intent_volition).
action_source(get_exercise_up, ensemble).
action_verb(get_exercise_up, past, 'get exercise-up').
action_verb(get_exercise_up, present, 'get exercise-up').
action_target_type(get_exercise_up, self).
can_perform(Actor, get_exercise_up) :- true.

%% get_exercise_down
% Action: get exercise-down
% Source: Ensemble / intent-volition

action(get_exercise_down, 'get exercise-down', social, 1).
action_difficulty(get_exercise_down, 0.5).
action_duration(get_exercise_down, 1).
action_category(get_exercise_down, intent_volition).
action_source(get_exercise_down, ensemble).
action_verb(get_exercise_down, past, 'get exercise-down').
action_verb(get_exercise_down, present, 'get exercise-down').
action_target_type(get_exercise_down, self).
can_perform(Actor, get_exercise_down) :- true.

%% express_anxiety_up
% Action: express anxiety-up
% Source: Ensemble / intent-volition

action(express_anxiety_up, 'express anxiety-up', social, 1).
action_difficulty(express_anxiety_up, 0.5).
action_duration(express_anxiety_up, 1).
action_category(express_anxiety_up, intent_volition).
action_source(express_anxiety_up, ensemble).
action_verb(express_anxiety_up, past, 'express anxiety-up').
action_verb(express_anxiety_up, present, 'express anxiety-up').
action_target_type(express_anxiety_up, self).
can_perform(Actor, express_anxiety_up) :- true.

%% express_anxiety_down
% Action: express anxiety-down
% Source: Ensemble / intent-volition

action(express_anxiety_down, 'express anxiety-down', social, 1).
action_difficulty(express_anxiety_down, 0.5).
action_duration(express_anxiety_down, 1).
action_category(express_anxiety_down, intent_volition).
action_source(express_anxiety_down, ensemble).
action_verb(express_anxiety_down, past, 'express anxiety-down').
action_verb(express_anxiety_down, present, 'express anxiety-down').
action_target_type(express_anxiety_down, self).
can_perform(Actor, express_anxiety_down) :- true.

%% fight_up
% Action: fight-up
% Source: Ensemble / intent-volition

action(fight_up, 'fight-up', social, 1).
action_difficulty(fight_up, 0.5).
action_duration(fight_up, 1).
action_category(fight_up, intent_volition).
action_source(fight_up, ensemble).
action_verb(fight_up, past, 'fight-up').
action_verb(fight_up, present, 'fight-up').
action_target_type(fight_up, self).
action_leads_to(fight_up, bite).
action_leads_to(fight_up, yell_at).
can_perform(Actor, fight_up) :- true.

%% fight_down
% Action: fight-down
% Source: Ensemble / intent-volition

action(fight_down, 'fight-down', social, 1).
action_difficulty(fight_down, 0.5).
action_duration(fight_down, 1).
action_category(fight_down, intent_volition).
action_source(fight_down, ensemble).
action_verb(fight_down, past, 'fight-down').
action_verb(fight_down, present, 'fight-down').
action_target_type(fight_down, self).
can_perform(Actor, fight_down) :- true.

%% be_romantic_up
% Action: be romantic-up
% Source: Ensemble / intent-volition

action(be_romantic_up, 'be romantic-up', social, 1).
action_difficulty(be_romantic_up, 0.5).
action_duration(be_romantic_up, 1).
action_category(be_romantic_up, intent_volition).
action_source(be_romantic_up, ensemble).
action_verb(be_romantic_up, past, 'be romantic-up').
action_verb(be_romantic_up, present, 'be romantic-up').
action_target_type(be_romantic_up, self).
can_perform(Actor, be_romantic_up) :- true.

%% be_romantic_down
% Action: be romantic-down
% Source: Ensemble / intent-volition

action(be_romantic_down, 'be romantic-down', social, 1).
action_difficulty(be_romantic_down, 0.5).
action_duration(be_romantic_down, 1).
action_category(be_romantic_down, intent_volition).
action_source(be_romantic_down, ensemble).
action_verb(be_romantic_down, past, 'be romantic-down').
action_verb(be_romantic_down, present, 'be romantic-down').
action_target_type(be_romantic_down, self).
can_perform(Actor, be_romantic_down) :- true.

%% affinity_up
% Action: affinity-up
% Source: Ensemble / intent-volition

action(affinity_up, 'affinity-up', social, 1).
action_difficulty(affinity_up, 0.5).
action_duration(affinity_up, 1).
action_category(affinity_up, intent_volition).
action_source(affinity_up, ensemble).
action_verb(affinity_up, past, 'affinity-up').
action_verb(affinity_up, present, 'affinity-up').
action_target_type(affinity_up, self).
action_leads_to(affinity_up, compliment).
action_leads_to(affinity_up, help).
action_leads_to(affinity_up, give_a_gift).
action_leads_to(affinity_up, seduce).
action_leads_to(affinity_up, reminisce).
action_leads_to(affinity_up, tell_joke).
can_perform(Actor, affinity_up) :- true.

%% affinity_down
% Action: affinity-down
% Source: Ensemble / intent-volition

action(affinity_down, 'affinity-down', social, 1).
action_difficulty(affinity_down, 0.5).
action_duration(affinity_down, 1).
action_category(affinity_down, intent_volition).
action_source(affinity_down, ensemble).
action_verb(affinity_down, past, 'affinity-down').
action_verb(affinity_down, present, 'affinity-down').
action_target_type(affinity_down, self).
action_leads_to(affinity_down, embarrass).
action_leads_to(affinity_down, insult).
can_perform(Actor, affinity_down) :- true.

%% emulation_up
% Action: emulation-up
% Source: Ensemble / intent-volition

action(emulation_up, 'emulation-up', social, 1).
action_difficulty(emulation_up, 0.5).
action_duration(emulation_up, 1).
action_category(emulation_up, intent_volition).
action_source(emulation_up, ensemble).
action_verb(emulation_up, past, 'emulation-up').
action_verb(emulation_up, present, 'emulation-up').
action_target_type(emulation_up, self).
action_leads_to(emulation_up, display_wit).
action_leads_to(emulation_up, display_initiative).
action_leads_to(emulation_up, display_worldliness).
can_perform(Actor, emulation_up) :- true.

%% emulation_down
% Action: emulation-down
% Source: Ensemble / intent-volition

action(emulation_down, 'emulation-down', social, 1).
action_difficulty(emulation_down, 0.5).
action_duration(emulation_down, 1).
action_category(emulation_down, intent_volition).
action_source(emulation_down, ensemble).
action_verb(emulation_down, past, 'emulation-down').
action_verb(emulation_down, present, 'emulation-down').
action_target_type(emulation_down, self).
action_leads_to(emulation_down, display_eccentricity).
can_perform(Actor, emulation_down) :- true.

%% credibility_up
% Action: credibility-up
% Source: Ensemble / intent-volition

action(credibility_up, 'credibility-up', social, 1).
action_difficulty(credibility_up, 0.5).
action_duration(credibility_up, 1).
action_category(credibility_up, intent_volition).
action_source(credibility_up, ensemble).
action_verb(credibility_up, past, 'credibility-up').
action_verb(credibility_up, present, 'credibility-up').
action_target_type(credibility_up, self).
action_leads_to(credibility_up, brag).
action_leads_to(credibility_up, lie).
action_leads_to(credibility_up, tell_the_truth).
can_perform(Actor, credibility_up) :- true.

%% credibility_down
% Action: credibility-down
% Source: Ensemble / intent-volition

action(credibility_down, 'credibility-down', social, 1).
action_difficulty(credibility_down, 0.5).
action_duration(credibility_down, 1).
action_category(credibility_down, intent_volition).
action_source(credibility_down, ensemble).
action_verb(credibility_down, past, 'credibility-down').
action_verb(credibility_down, present, 'credibility-down').
action_target_type(credibility_down, self).
action_leads_to(credibility_down, reveal_ignorance).
action_leads_to(credibility_down, tear_off_the_mask).
can_perform(Actor, credibility_down) :- true.

%% curiosity_up
% Action: curiosity-up
% Source: Ensemble / intent-volition

action(curiosity_up, 'curiosity-up', social, 1).
action_difficulty(curiosity_up, 0.5).
action_duration(curiosity_up, 1).
action_category(curiosity_up, intent_volition).
action_source(curiosity_up, ensemble).
action_verb(curiosity_up, past, 'curiosity-up').
action_verb(curiosity_up, present, 'curiosity-up').
action_target_type(curiosity_up, self).
action_leads_to(curiosity_up, impress).
action_leads_to(curiosity_up, make_a_scene_not_subtle).
action_leads_to(curiosity_up, draw_attention_subtle).
can_perform(Actor, curiosity_up) :- true.

%% curiosity_down
% Action: curiosity-down
% Source: Ensemble / intent-volition

action(curiosity_down, 'curiosity-down', social, 1).
action_difficulty(curiosity_down, 0.5).
action_duration(curiosity_down, 1).
action_category(curiosity_down, intent_volition).
action_source(curiosity_down, ensemble).
action_verb(curiosity_down, past, 'curiosity-down').
action_verb(curiosity_down, present, 'curiosity-down').
action_target_type(curiosity_down, self).
action_leads_to(curiosity_down, deflect).
action_leads_to(curiosity_down, blend_in).
can_perform(Actor, curiosity_down) :- true.

%% encourages_friend_s_friend_with_a_pick_me_up_a
% Action: encourages friend’s friend with a pick-me-up (a)
% Source: Ensemble / intent-volition

action(encourages_friend_s_friend_with_a_pick_me_up_a, 'encourages friend''s friend with a pick-me-up (a)', social, 1).
action_difficulty(encourages_friend_s_friend_with_a_pick_me_up_a, 0.5).
action_duration(encourages_friend_s_friend_with_a_pick_me_up_a, 1).
action_category(encourages_friend_s_friend_with_a_pick_me_up_a, intent_volition).
action_source(encourages_friend_s_friend_with_a_pick_me_up_a, ensemble).
action_verb(encourages_friend_s_friend_with_a_pick_me_up_a, past, 'encourages friend''s friend with a pick-me-up (a)').
action_verb(encourages_friend_s_friend_with_a_pick_me_up_a, present, 'encourages friend''s friend with a pick-me-up (a)').
action_target_type(encourages_friend_s_friend_with_a_pick_me_up_a, other).
action_requires_target(encourages_friend_s_friend_with_a_pick_me_up_a).
action_range(encourages_friend_s_friend_with_a_pick_me_up_a, 5).
action_is_accept(encourages_friend_s_friend_with_a_pick_me_up_a).
action_prerequisite(encourages_friend_s_friend_with_a_pick_me_up_a, (network(Actor, Target, affinity, V), V > 50)).
action_prerequisite(encourages_friend_s_friend_with_a_pick_me_up_a, (relationship(Actor, Someone, ally))).
action_prerequisite(encourages_friend_s_friend_with_a_pick_me_up_a, (relationship(Target, Someone, ally))).
action_effect(encourages_friend_s_friend_with_a_pick_me_up_a, (modify_network(Target, Actor, affinity, +, 20))).
action_effect(encourages_friend_s_friend_with_a_pick_me_up_a, (assert(status(Target, grateful)))).
action_effect(encourages_friend_s_friend_with_a_pick_me_up_a, (modify_network(Actor, Target, affinity, +, 5))).
% Can Actor perform this action?
can_perform(Actor, encourages_friend_s_friend_with_a_pick_me_up_a, Target) :-
    network(Actor, Target, affinity, V), V > 50,
    relationship(Actor, Someone, ally),
    relationship(Target, Someone, ally).

%% ═══════════════════════════════════════════════════════════
%% Category: physical-activities
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: physical-activities
%% Source: data/ensemble/actions/physical-activities.json
%% Converted: 2026-04-01T20:15:17.350Z
%% Total actions: 5

%% bitten
% Action: bitten
% Source: Ensemble / physical-activities

action(bitten, 'bitten', physical, 1).
action_difficulty(bitten, 0.5).
action_duration(bitten, 1).
action_category(bitten, physical_activities).
action_source(bitten, ensemble).
action_verb(bitten, past, 'bitten').
action_verb(bitten, present, 'bitten').
action_target_type(bitten, other).
action_requires_target(bitten).
action_range(bitten, 5).
action_is_accept(bitten).
action_effect(bitten, (modify_network(Target, Actor, fear, +, 4))).
can_perform(Actor, bitten, Target) :- true.

%% get_drunk_together
% Action: get drunk together
% Source: Ensemble / physical-activities

action(get_drunk_together, 'get drunk together', physical, 1).
action_difficulty(get_drunk_together, 0.5).
action_duration(get_drunk_together, 1).
action_category(get_drunk_together, physical_activities).
action_source(get_drunk_together, ensemble).
action_verb(get_drunk_together, past, 'get drunk together').
action_verb(get_drunk_together, present, 'get drunk together').
action_target_type(get_drunk_together, other).
action_requires_target(get_drunk_together).
action_range(get_drunk_together, 5).
action_is_accept(get_drunk_together).
action_prerequisite(get_drunk_together, (network(Actor, Target, affinity, V), V > 70)).
action_prerequisite(get_drunk_together, (attribute(Actor, propriety, V), V < 60)).
action_prerequisite(get_drunk_together, (attribute(Target, propriety, V), V < 60)).
action_effect(get_drunk_together, (assert(status(Actor, inebriated)))).
action_effect(get_drunk_together, (assert(status(Target, inebriated)))).
action_effect(get_drunk_together, (assert(status(Actor, happy)))).
action_effect(get_drunk_together, (assert(status(Target, happy)))).
action_effect(get_drunk_together, (assert(status(Actor, feeling socially connected)))).
action_effect(get_drunk_together, (assert(status(Target, feeling socially connected)))).
action_effect(get_drunk_together, (modify_network(Actor, Target, affinity, +, 15))).
action_effect(get_drunk_together, (modify_network(Target, Actor, affinity, +, 15))).
% Can Actor perform this action?
can_perform(Actor, get_drunk_together, Target) :-
    network(Actor, Target, affinity, V), V > 70,
    attribute(Actor, propriety, V), V < 60,
    attribute(Target, propriety, V), V < 60.

%% engage_in_a_rich_person_dance_while_not_rich_person
% Action: engage in a rich person dance while not rich person
% Source: Ensemble / physical-activities

action(engage_in_a_rich_person_dance_while_not_rich_person, 'engage in a rich person dance while not rich person', physical, 1).
action_difficulty(engage_in_a_rich_person_dance_while_not_rich_person, 0.5).
action_duration(engage_in_a_rich_person_dance_while_not_rich_person, 1).
action_category(engage_in_a_rich_person_dance_while_not_rich_person, physical_activities).
action_source(engage_in_a_rich_person_dance_while_not_rich_person, ensemble).
action_verb(engage_in_a_rich_person_dance_while_not_rich_person, past, 'engage in a rich person dance while not rich person').
action_verb(engage_in_a_rich_person_dance_while_not_rich_person, present, 'engage in a rich person dance while not rich person').
action_target_type(engage_in_a_rich_person_dance_while_not_rich_person, other).
action_requires_target(engage_in_a_rich_person_dance_while_not_rich_person).
action_range(engage_in_a_rich_person_dance_while_not_rich_person, 5).
action_prerequisite(engage_in_a_rich_person_dance_while_not_rich_person, (\+ trait(Actor, rich))).
action_prerequisite(engage_in_a_rich_person_dance_while_not_rich_person, (trait(Target, rich))).
action_prerequisite(engage_in_a_rich_person_dance_while_not_rich_person, (network(Target, Actor, credibility, V), V < 50)).
action_prerequisite(engage_in_a_rich_person_dance_while_not_rich_person, (relationship(Actor, Target, strangers))).
action_effect(engage_in_a_rich_person_dance_while_not_rich_person, (assert(status(Actor, embarrassed)))).
action_effect(engage_in_a_rich_person_dance_while_not_rich_person, (ensemble_effect(Actor, made a faux pas around, true))).
action_effect(engage_in_a_rich_person_dance_while_not_rich_person, (modify_network(Target, Actor, credibility, -, 5))).
action_effect(engage_in_a_rich_person_dance_while_not_rich_person, (ensemble_effect(Actor, impressed, true))).
% Can Actor perform this action?
can_perform(Actor, engage_in_a_rich_person_dance_while_not_rich_person, Target) :-
    \+ trait(Actor, rich),
    trait(Target, rich),
    network(Target, Actor, credibility, V), V < 50,
    relationship(Actor, Target, strangers).

%% begrudgingly_accept_thing
% Action: Begrudgingly accept thing
% Source: Ensemble / physical-activities

action(begrudgingly_accept_thing, 'Begrudgingly accept thing', physical, 1).
action_difficulty(begrudgingly_accept_thing, 0.5).
action_duration(begrudgingly_accept_thing, 1).
action_category(begrudgingly_accept_thing, physical_activities).
action_source(begrudgingly_accept_thing, ensemble).
action_verb(begrudgingly_accept_thing, past, 'begrudgingly accept thing').
action_verb(begrudgingly_accept_thing, present, 'begrudgingly accept thing').
action_target_type(begrudgingly_accept_thing, self).
can_perform(Actor, begrudgingly_accept_thing) :- true.

%% begrudgingly_refuse_to_acquire_thing
% Action: Begrudgingly refuse to acquire thing
% Source: Ensemble / physical-activities

action(begrudgingly_refuse_to_acquire_thing, 'Begrudgingly refuse to acquire thing', physical, 1).
action_difficulty(begrudgingly_refuse_to_acquire_thing, 0.5).
action_duration(begrudgingly_refuse_to_acquire_thing, 1).
action_category(begrudgingly_refuse_to_acquire_thing, physical_activities).
action_source(begrudgingly_refuse_to_acquire_thing, ensemble).
action_verb(begrudgingly_refuse_to_acquire_thing, past, 'begrudgingly refuse to acquire thing').
action_verb(begrudgingly_refuse_to_acquire_thing, present, 'begrudgingly refuse to acquire thing').
action_target_type(begrudgingly_refuse_to_acquire_thing, self).
can_perform(Actor, begrudgingly_refuse_to_acquire_thing) :- true.

%% ═══════════════════════════════════════════════════════════
%% Category: rejection-refusal
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: rejection-refusal
%% Source: data/ensemble/actions/rejection-refusal.json
%% Converted: 2026-04-01T20:15:17.350Z
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

%% ═══════════════════════════════════════════════════════════
%% Category: relationship-changes
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: relationship-changes
%% Source: data/ensemble/actions/relationship-changes.json
%% Converted: 2026-04-01T20:15:17.350Z
%% Total actions: 8

%% dating_start
% Action: dating-start
% Source: Ensemble / relationship-changes

action(dating_start, 'dating-start', social, 1).
action_difficulty(dating_start, 0.5).
action_duration(dating_start, 1).
action_category(dating_start, relationship_changes).
action_source(dating_start, ensemble).
action_verb(dating_start, past, 'dating-start').
action_verb(dating_start, present, 'dating-start').
action_target_type(dating_start, self).
action_leads_to(dating_start, ask_out).
action_leads_to(dating_start, pickup_line).
can_perform(Actor, dating_start) :- true.

%% friends_start
% Action: friends-start
% Source: Ensemble / relationship-changes

action(friends_start, 'friends-start', social, 1).
action_difficulty(friends_start, 0.5).
action_duration(friends_start, 1).
action_category(friends_start, relationship_changes).
action_source(friends_start, ensemble).
action_verb(friends_start, past, 'friends-start').
action_verb(friends_start, present, 'friends-start').
action_target_type(friends_start, self).
action_leads_to(friends_start, bond).
action_leads_to(friends_start, laugh).
can_perform(Actor, friends_start) :- true.

%% rivals_start
% Action: rivals-start
% Source: Ensemble / relationship-changes

action(rivals_start, 'rivals-start', social, 1).
action_difficulty(rivals_start, 0.5).
action_duration(rivals_start, 1).
action_category(rivals_start, relationship_changes).
action_source(rivals_start, ensemble).
action_verb(rivals_start, past, 'rivals-start').
action_verb(rivals_start, present, 'rivals-start').
action_target_type(rivals_start, self).
action_leads_to(rivals_start, attack).
action_leads_to(rivals_start, insult_honor).
action_leads_to(rivals_start, blackmail).
can_perform(Actor, rivals_start) :- true.

%% rivals_stop
% Action: rivals-stop
% Source: Ensemble / relationship-changes

action(rivals_stop, 'rivals-stop', social, 1).
action_difficulty(rivals_stop, 0.5).
action_duration(rivals_stop, 1).
action_category(rivals_stop, relationship_changes).
action_source(rivals_stop, ensemble).
action_verb(rivals_stop, past, 'rivals-stop').
action_verb(rivals_stop, present, 'rivals-stop').
action_target_type(rivals_stop, self).
action_leads_to(rivals_stop, forgive).
action_leads_to(rivals_stop, apologize).
can_perform(Actor, rivals_stop) :- true.

%% esteem_stop
% Action: esteem-stop
% Source: Ensemble / relationship-changes

action(esteem_stop, 'esteem-stop', social, 1).
action_difficulty(esteem_stop, 0.5).
action_duration(esteem_stop, 1).
action_category(esteem_stop, relationship_changes).
action_source(esteem_stop, ensemble).
action_verb(esteem_stop, past, 'esteem-stop').
action_verb(esteem_stop, present, 'esteem-stop').
action_target_type(esteem_stop, self).
action_leads_to(esteem_stop, criticize).
action_leads_to(esteem_stop, play_a_trick).
action_leads_to(esteem_stop, behave_rudely).
can_perform(Actor, esteem_stop) :- true.

%% ally_start
% Action: ally-start
% Source: Ensemble / relationship-changes

action(ally_start, 'ally-start', social, 1).
action_difficulty(ally_start, 0.5).
action_duration(ally_start, 1).
action_category(ally_start, relationship_changes).
action_source(ally_start, ensemble).
action_verb(ally_start, past, 'ally-start').
action_verb(ally_start, present, 'ally-start').
action_target_type(ally_start, self).
action_leads_to(ally_start, ask_for_a_favor).
action_leads_to(ally_start, form_alliance).
can_perform(Actor, ally_start) :- true.

%% esteem_start
% Action: esteem-start
% Source: Ensemble / relationship-changes

action(esteem_start, 'esteem-start', social, 1).
action_difficulty(esteem_start, 0.5).
action_duration(esteem_start, 1).
action_category(esteem_start, relationship_changes).
action_source(esteem_start, ensemble).
action_verb(esteem_start, past, 'esteem-start').
action_verb(esteem_start, present, 'esteem-start').
action_target_type(esteem_start, self).
action_leads_to(esteem_start, demonstrate_virtue).
can_perform(Actor, esteem_start) :- true.

%% ally_stop
% Action: ally-stop
% Source: Ensemble / relationship-changes

action(ally_stop, 'ally-stop', social, 1).
action_difficulty(ally_stop, 0.5).
action_duration(ally_stop, 1).
action_category(ally_stop, relationship_changes).
action_source(ally_stop, ensemble).
action_verb(ally_stop, past, 'ally-stop').
action_verb(ally_stop, present, 'ally-stop').
action_target_type(ally_stop, self).
action_leads_to(ally_stop, betray).
can_perform(Actor, ally_stop) :- true.

%% ═══════════════════════════════════════════════════════════
%% Category: romantic-affection
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: romantic-affection
%% Source: data/ensemble/actions/romantic-affection.json
%% Converted: 2026-04-01T20:15:17.351Z
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

%% ═══════════════════════════════════════════════════════════
%% Category: romantic-dating
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: romantic-dating
%% Source: data/ensemble/actions/romantic-dating.json
%% Converted: 2026-04-01T20:15:17.351Z
%% Total actions: 5

%% romance
% Action: ROMANCE
% Source: Ensemble / romantic-dating

action(romance, 'ROMANCE', romantic, 1).
action_difficulty(romance, 0.5).
action_duration(romance, 1).
action_category(romance, romantic_dating).
action_source(romance, ensemble).
action_verb(romance, past, 'romance').
action_verb(romance, present, 'romance').
action_target_type(romance, self).
action_leads_to(romance, romantic_compliment).
action_leads_to(romance, respond_romantically).
action_leads_to(romance, respond_positively_to_romance).
can_perform(Actor, romance) :- true.

%% ask_out
% Action: ASK OUT
% Source: Ensemble / romantic-dating

action(ask_out, 'ASK OUT', romantic, 1).
action_difficulty(ask_out, 0.5).
action_duration(ask_out, 1).
action_category(ask_out, romantic_dating).
action_source(ask_out, ensemble).
action_verb(ask_out, past, 'ask out').
action_verb(ask_out, present, 'ask out').
action_target_type(ask_out, self).
action_leads_to(ask_out, askoutterminal).
action_leads_to(ask_out, askoutterminalreject).
can_perform(Actor, ask_out) :- true.

%% respond_positively_to_romance
% Action: Respond Positively to Romance
% Source: Ensemble / romantic-dating

action(respond_positively_to_romance, 'Respond Positively to Romance', romantic, 1).
action_difficulty(respond_positively_to_romance, 0.5).
action_duration(respond_positively_to_romance, 1).
action_category(respond_positively_to_romance, romantic_dating).
action_source(respond_positively_to_romance, ensemble).
action_parent(respond_positively_to_romance, romance).
action_verb(respond_positively_to_romance, past, 'respond positively to romance').
action_verb(respond_positively_to_romance, present, 'respond positively to romance').
action_target_type(respond_positively_to_romance, self).
can_perform(Actor, respond_positively_to_romance) :- true.

%% respond_negatively_to_romance
% Action: Respond Negatively to Romance
% Source: Ensemble / romantic-dating

action(respond_negatively_to_romance, 'Respond Negatively to Romance', romantic, 1).
action_difficulty(respond_negatively_to_romance, 0.5).
action_duration(respond_negatively_to_romance, 1).
action_category(respond_negatively_to_romance, romantic_dating).
action_source(respond_negatively_to_romance, ensemble).
action_verb(respond_negatively_to_romance, past, 'respond negatively to romance').
action_verb(respond_negatively_to_romance, present, 'respond negatively to romance').
action_target_type(respond_negatively_to_romance, self).
can_perform(Actor, respond_negatively_to_romance) :- true.

%% what_should_we_order_with_romance
% Action: What should we order (with romance)
% Source: Ensemble / romantic-dating

action(what_should_we_order_with_romance, 'What should we order (with romance)', romantic, 1).
action_difficulty(what_should_we_order_with_romance, 0.5).
action_duration(what_should_we_order_with_romance, 1).
action_category(what_should_we_order_with_romance, romantic_dating).
action_source(what_should_we_order_with_romance, ensemble).
action_verb(what_should_we_order_with_romance, past, 'what should we order (with romance)').
action_verb(what_should_we_order_with_romance, present, 'what should we order (with romance)').
action_target_type(what_should_we_order_with_romance, self).
action_prerequisite(what_should_we_order_with_romance, (status(Actor, fan_of_restaurant))).
% Can Actor perform this action?
can_perform(Actor, what_should_we_order_with_romance) :-
    status(Actor, fan_of_restaurant).

%% ═══════════════════════════════════════════════════════════
%% Category: romantic-flirting
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: romantic-flirting
%% Source: data/ensemble/actions/romantic-flirting.json
%% Converted: 2026-04-01T20:15:17.351Z
%% Total actions: 13

%% flirt
% Action: FLIRT
% Source: Ensemble / romantic-flirting

action(flirt, 'FLIRT', romantic, 1).
action_difficulty(flirt, 0.5).
action_duration(flirt, 1).
action_category(flirt, romantic_flirting).
action_source(flirt, ensemble).
action_verb(flirt, past, 'flirt').
action_verb(flirt, present, 'flirt').
action_target_type(flirt, self).
action_leads_to(flirt, looking_forward_to_getting_to_know_you_better).
action_leads_to(flirt, what_should_we_order_with_romance).
action_leads_to(flirt, flirty_response_about_pizza).
action_leads_to(flirt, flirty_chit_chat).
action_leads_to(flirt, flirty_chit_chat_right_back_at_y).
action_leads_to(flirt, make_innuendo).
action_leads_to(flirt, oooooh_la_la).
action_leads_to(flirt, don_t_understand_but_pretend_to_laugh_because_you_have_the_hots_for_them).
action_leads_to(flirt, compliment_appearance).
action_leads_to(flirt, make_suggestive_eyes_at).
action_leads_to(flirt, introduce_self_flirty).
action_leads_to(flirt, flirt_with_the_person_that_approached_you).
can_perform(Actor, flirt) :- true.

%% pickup_line
% Action: PICKUP LINE
% Source: Ensemble / romantic-flirting

action(pickup_line, 'PICKUP LINE', romantic, 1).
action_difficulty(pickup_line, 0.5).
action_duration(pickup_line, 1).
action_category(pickup_line, romantic_flirting).
action_source(pickup_line, ensemble).
action_verb(pickup_line, past, 'pickup line').
action_verb(pickup_line, present, 'pickup line').
action_target_type(pickup_line, self).
action_leads_to(pickup_line, pickuplineterminal).
action_influence(pickup_line, (influence(unknown, _, _, weight, +, 0))).
can_perform(Actor, pickup_line) :- true.

%% seduce
% Action: SEDUCE
% Source: Ensemble / romantic-flirting

action(seduce, 'SEDUCE', romantic, 1).
action_difficulty(seduce, 0.5).
action_duration(seduce, 1).
action_category(seduce, romantic_flirting).
action_source(seduce, ensemble).
action_verb(seduce, past, 'seduce').
action_verb(seduce, present, 'seduce').
action_target_type(seduce, self).
action_leads_to(seduce, homosexual_sexual_assault).
action_leads_to(seduce, man_professes_passion_for_virtuous_woman_get_rejected_and_loves_her_even_more).
action_leads_to(seduce, looking_at_someone_faire_les_yeux_doux).
action_leads_to(seduce, discovered_cheater_refused_a_kiss).
action_leads_to(seduce, virtuous_wife_rejects_man_s_attempt_to_seduce_her).
action_leads_to(seduce, get_drunk_together).
action_leads_to(seduce, talk_about_the_loved_one).
action_leads_to(seduce, seduce_flirt_successfully_default).
action_leads_to(seduce, seduce_flirt_unsuccessfully_default).
can_perform(Actor, seduce) :- true.

%% pickuplineterminal
% Action: pickupLineTerminal
% Source: Ensemble / romantic-flirting

action(pickuplineterminal, 'pickupLineTerminal', romantic, 1).
action_difficulty(pickuplineterminal, 0.5).
action_duration(pickuplineterminal, 1).
action_category(pickuplineterminal, romantic_flirting).
action_source(pickuplineterminal, ensemble).
action_parent(pickuplineterminal, pickup_line).
action_verb(pickuplineterminal, past, 'pickuplineterminal').
action_verb(pickuplineterminal, present, 'pickuplineterminal').
action_target_type(pickuplineterminal, other).
action_requires_target(pickuplineterminal).
action_range(pickuplineterminal, 5).
action_is_accept(pickuplineterminal).
action_effect(pickuplineterminal, (assert(relationship(Actor, Target, involved with)))).
can_perform(Actor, pickuplineterminal, Target) :- true.

%% looking_at_someone_faire_les_yeux_doux
% Action: looking at someone/ faire les yeux doux
% Source: Ensemble / romantic-flirting

action(looking_at_someone_faire_les_yeux_doux, 'looking at someone/ faire les yeux doux', romantic, 1).
action_difficulty(looking_at_someone_faire_les_yeux_doux, 0.5).
action_duration(looking_at_someone_faire_les_yeux_doux, 1).
action_category(looking_at_someone_faire_les_yeux_doux, romantic_flirting).
action_source(looking_at_someone_faire_les_yeux_doux, ensemble).
action_parent(looking_at_someone_faire_les_yeux_doux, seduce).
action_verb(looking_at_someone_faire_les_yeux_doux, past, 'looking at someone/ faire les yeux doux').
action_verb(looking_at_someone_faire_les_yeux_doux, present, 'looking at someone/ faire les yeux doux').
action_target_type(looking_at_someone_faire_les_yeux_doux, other).
action_requires_target(looking_at_someone_faire_les_yeux_doux).
action_range(looking_at_someone_faire_les_yeux_doux, 5).
action_is_accept(looking_at_someone_faire_les_yeux_doux).
action_prerequisite(looking_at_someone_faire_les_yeux_doux, (trait(Actor, male))).
action_prerequisite(looking_at_someone_faire_les_yeux_doux, (trait(Actor, innocent looking))).
action_prerequisite(looking_at_someone_faire_les_yeux_doux, (attribute(Actor, propriety, V), V > 50)).
action_effect(looking_at_someone_faire_les_yeux_doux, (modify_network(Target, Actor, affinity, +, 10))).
% Can Actor perform this action?
can_perform(Actor, looking_at_someone_faire_les_yeux_doux, Target) :-
    trait(Actor, male),
    trait(Actor, innocent looking),
    attribute(Actor, propriety, V), V > 50.

%% virtuous_wife_rejects_man_s_attempt_to_seduce_her
% Action: virtuous wife rejects man’s attempt to seduce her
% Source: Ensemble / romantic-flirting

action(virtuous_wife_rejects_man_s_attempt_to_seduce_her, 'virtuous wife rejects man''s attempt to seduce her', romantic, 1).
action_difficulty(virtuous_wife_rejects_man_s_attempt_to_seduce_her, 0.5).
action_duration(virtuous_wife_rejects_man_s_attempt_to_seduce_her, 1).
action_category(virtuous_wife_rejects_man_s_attempt_to_seduce_her, romantic_flirting).
action_source(virtuous_wife_rejects_man_s_attempt_to_seduce_her, ensemble).
action_parent(virtuous_wife_rejects_man_s_attempt_to_seduce_her, seduce).
action_verb(virtuous_wife_rejects_man_s_attempt_to_seduce_her, past, 'virtuous wife rejects man''s attempt to seduce her').
action_verb(virtuous_wife_rejects_man_s_attempt_to_seduce_her, present, 'virtuous wife rejects man''s attempt to seduce her').
action_target_type(virtuous_wife_rejects_man_s_attempt_to_seduce_her, other).
action_requires_target(virtuous_wife_rejects_man_s_attempt_to_seduce_her).
action_range(virtuous_wife_rejects_man_s_attempt_to_seduce_her, 5).
action_prerequisite(virtuous_wife_rejects_man_s_attempt_to_seduce_her, (trait(Actor, female))).
action_prerequisite(virtuous_wife_rejects_man_s_attempt_to_seduce_her, (trait(Actor, virtuous))).
action_prerequisite(virtuous_wife_rejects_man_s_attempt_to_seduce_her, (relationship(Actor, 'third', married))).
action_prerequisite(virtuous_wife_rejects_man_s_attempt_to_seduce_her, (network(Target, Actor, affinity, V), V > 60)).
action_prerequisite(virtuous_wife_rejects_man_s_attempt_to_seduce_her, (network(Actor, Target, affinity, V), V < 40)).
action_prerequisite(virtuous_wife_rejects_man_s_attempt_to_seduce_her, (trait(Target, flirtatious))).
action_prerequisite(virtuous_wife_rejects_man_s_attempt_to_seduce_her, (ensemble_condition('third', suspicious of, true))).
action_effect(virtuous_wife_rejects_man_s_attempt_to_seduce_her, (modify_network('third', Actor, affinity, +, 20))).
action_effect(virtuous_wife_rejects_man_s_attempt_to_seduce_her, (assert(status(Target, embarrassed)))).
action_effect(virtuous_wife_rejects_man_s_attempt_to_seduce_her, (modify_network(Target, Actor, affinity, -, 20))).
action_effect(virtuous_wife_rejects_man_s_attempt_to_seduce_her, (assert(relationship('third', Target, rivals)))).
% Can Actor perform this action?
can_perform(Actor, virtuous_wife_rejects_man_s_attempt_to_seduce_her, Target) :-
    trait(Actor, female),
    trait(Actor, virtuous),
    relationship(Actor, 'third', married),
    network(Target, Actor, affinity, V), V > 60,
    network(Actor, Target, affinity, V), V < 40,
    trait(Target, flirtatious),
    ensemble_condition('third', suspicious of, true).

%% seduce_flirt_successfully_default
% Action: seduce/flirt successfully-default
% Source: Ensemble / romantic-flirting

action(seduce_flirt_successfully_default, 'seduce/flirt successfully-default', romantic, 1).
action_difficulty(seduce_flirt_successfully_default, 0.5).
action_duration(seduce_flirt_successfully_default, 1).
action_category(seduce_flirt_successfully_default, romantic_flirting).
action_source(seduce_flirt_successfully_default, ensemble).
action_parent(seduce_flirt_successfully_default, seduce).
action_verb(seduce_flirt_successfully_default, past, 'seduce/flirt successfully-default').
action_verb(seduce_flirt_successfully_default, present, 'seduce/flirt successfully-default').
action_target_type(seduce_flirt_successfully_default, other).
action_requires_target(seduce_flirt_successfully_default).
action_range(seduce_flirt_successfully_default, 5).
action_is_accept(seduce_flirt_successfully_default).
action_effect(seduce_flirt_successfully_default, (modify_network(Target, Actor, affinity, +, 5))).
can_perform(Actor, seduce_flirt_successfully_default, Target) :- true.

%% seduce_flirt_unsuccessfully_default
% Action: seduce/flirt unsuccessfully-default
% Source: Ensemble / romantic-flirting

action(seduce_flirt_unsuccessfully_default, 'seduce/flirt unsuccessfully-default', romantic, 1).
action_difficulty(seduce_flirt_unsuccessfully_default, 0.5).
action_duration(seduce_flirt_unsuccessfully_default, 1).
action_category(seduce_flirt_unsuccessfully_default, romantic_flirting).
action_source(seduce_flirt_unsuccessfully_default, ensemble).
action_parent(seduce_flirt_unsuccessfully_default, seduce).
action_verb(seduce_flirt_unsuccessfully_default, past, 'seduce/flirt unsuccessfully-default').
action_verb(seduce_flirt_unsuccessfully_default, present, 'seduce/flirt unsuccessfully-default').
action_target_type(seduce_flirt_unsuccessfully_default, other).
action_requires_target(seduce_flirt_unsuccessfully_default).
action_range(seduce_flirt_unsuccessfully_default, 5).
action_effect(seduce_flirt_unsuccessfully_default, (modify_network(Target, Actor, affinity, -, 5))).
can_perform(Actor, seduce_flirt_unsuccessfully_default, Target) :- true.

%% flirty_response_about_pizza
% Action: Flirty response about pizza
% Source: Ensemble / romantic-flirting

action(flirty_response_about_pizza, 'Flirty response about pizza', romantic, 1).
action_difficulty(flirty_response_about_pizza, 0.5).
action_duration(flirty_response_about_pizza, 1).
action_category(flirty_response_about_pizza, romantic_flirting).
action_source(flirty_response_about_pizza, ensemble).
action_parent(flirty_response_about_pizza, flirt).
action_verb(flirty_response_about_pizza, past, 'flirty response about pizza').
action_verb(flirty_response_about_pizza, present, 'flirty response about pizza').
action_target_type(flirty_response_about_pizza, other).
action_requires_target(flirty_response_about_pizza).
action_range(flirty_response_about_pizza, 5).
action_effect(flirty_response_about_pizza, (modify_network(Actor, Target, attraction, +, 1))).
can_perform(Actor, flirty_response_about_pizza, Target) :- true.

%% flirty_chit_chat
% Action: Flirty chit chat
% Source: Ensemble / romantic-flirting

action(flirty_chit_chat, 'Flirty chit chat', romantic, 1).
action_difficulty(flirty_chit_chat, 0.5).
action_duration(flirty_chit_chat, 1).
action_category(flirty_chit_chat, romantic_flirting).
action_source(flirty_chit_chat, ensemble).
action_parent(flirty_chit_chat, flirt).
action_verb(flirty_chit_chat, past, 'flirty chit chat').
action_verb(flirty_chit_chat, present, 'flirty chit chat').
action_target_type(flirty_chit_chat, self).
can_perform(Actor, flirty_chit_chat) :- true.

%% flirty_chit_chat_right_back_at_y
% Action: Flirty chit chat right back at %y%!
% Source: Ensemble / romantic-flirting

action(flirty_chit_chat_right_back_at_y, 'Flirty chit chat right back at %y%!', romantic, 1).
action_difficulty(flirty_chit_chat_right_back_at_y, 0.5).
action_duration(flirty_chit_chat_right_back_at_y, 1).
action_category(flirty_chit_chat_right_back_at_y, romantic_flirting).
action_source(flirty_chit_chat_right_back_at_y, ensemble).
action_parent(flirty_chit_chat_right_back_at_y, flirt).
action_verb(flirty_chit_chat_right_back_at_y, past, 'flirty chit chat right back at %y%!').
action_verb(flirty_chit_chat_right_back_at_y, present, 'flirty chit chat right back at %y%!').
action_target_type(flirty_chit_chat_right_back_at_y, other).
action_requires_target(flirty_chit_chat_right_back_at_y).
action_range(flirty_chit_chat_right_back_at_y, 5).
action_effect(flirty_chit_chat_right_back_at_y, (modify_network(Actor, Target, attraction, +, 1))).
can_perform(Actor, flirty_chit_chat_right_back_at_y, Target) :- true.

%% make_innuendo
% Action: Make innuendo
% Source: Ensemble / romantic-flirting

action(make_innuendo, 'Make innuendo', romantic, 1).
action_difficulty(make_innuendo, 0.5).
action_duration(make_innuendo, 1).
action_category(make_innuendo, romantic_flirting).
action_source(make_innuendo, ensemble).
action_parent(make_innuendo, flirt).
action_verb(make_innuendo, past, 'make innuendo').
action_verb(make_innuendo, present, 'make innuendo').
action_target_type(make_innuendo, self).
can_perform(Actor, make_innuendo) :- true.

%% flirt_with_the_person_that_approached_you
% Action: Flirt with the person that approached you
% Source: Ensemble / romantic-flirting

action(flirt_with_the_person_that_approached_you, 'Flirt with the person that approached you', romantic, 1).
action_difficulty(flirt_with_the_person_that_approached_you, 0.5).
action_duration(flirt_with_the_person_that_approached_you, 1).
action_category(flirt_with_the_person_that_approached_you, romantic_flirting).
action_source(flirt_with_the_person_that_approached_you, ensemble).
action_parent(flirt_with_the_person_that_approached_you, flirt).
action_verb(flirt_with_the_person_that_approached_you, past, 'flirt with the person that approached you').
action_verb(flirt_with_the_person_that_approached_you, present, 'flirt with the person that approached you').
action_target_type(flirt_with_the_person_that_approached_you, self).
action_influence(flirt_with_the_person_that_approached_you, (influence(unknown, _, _, weight, +, 0))).
can_perform(Actor, flirt_with_the_person_that_approached_you) :- true.

%% ═══════════════════════════════════════════════════════════
%% Category: self-improvement
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: self-improvement
%% Source: data/ensemble/actions/self-improvement.json
%% Converted: 2026-04-01T20:15:17.351Z
%% Total actions: 15

%% strength_up
% Action: strength-up
% Source: Ensemble / self-improvement

action(strength_up, 'strength-up', self_improvement, 1).
action_difficulty(strength_up, 0.5).
action_duration(strength_up, 1).
action_category(strength_up, self_improvement).
action_source(strength_up, ensemble).
action_verb(strength_up, past, 'strength-up').
action_verb(strength_up, present, 'strength-up').
action_target_type(strength_up, self).
action_leads_to(strength_up, lift_weights).
action_leads_to(strength_up, do_pushups).
can_perform(Actor, strength_up) :- true.

%% intelligence_up
% Action: intelligence-up
% Source: Ensemble / self-improvement

action(intelligence_up, 'intelligence-up', self_improvement, 1).
action_difficulty(intelligence_up, 0.5).
action_duration(intelligence_up, 1).
action_category(intelligence_up, self_improvement).
action_source(intelligence_up, ensemble).
action_verb(intelligence_up, past, 'intelligence-up').
action_verb(intelligence_up, present, 'intelligence-up').
action_target_type(intelligence_up, self).
action_leads_to(intelligence_up, study).
action_leads_to(intelligence_up, train).
action_leads_to(intelligence_up, read).
can_perform(Actor, intelligence_up) :- true.

%% kinship_up
% Action: kinship-up
% Source: Ensemble / self-improvement

action(kinship_up, 'kinship-up', self_improvement, 1).
action_difficulty(kinship_up, 0.5).
action_duration(kinship_up, 1).
action_category(kinship_up, self_improvement).
action_source(kinship_up, ensemble).
action_verb(kinship_up, past, 'kinship-up').
action_verb(kinship_up, present, 'kinship-up').
action_target_type(kinship_up, self).
action_leads_to(kinship_up, swear_oath).
action_leads_to(kinship_up, increase_physical_kinship).
can_perform(Actor, kinship_up) :- true.

%% increase_physical_kinship
% Action: INCREASE PHYSICAL KINSHIP
% Source: Ensemble / self-improvement

action(increase_physical_kinship, 'INCREASE PHYSICAL KINSHIP', self_improvement, 1).
action_difficulty(increase_physical_kinship, 0.5).
action_duration(increase_physical_kinship, 1).
action_category(increase_physical_kinship, self_improvement).
action_source(increase_physical_kinship, ensemble).
action_parent(increase_physical_kinship, kinship_up).
action_verb(increase_physical_kinship, past, 'increase physical kinship').
action_verb(increase_physical_kinship, present, 'increase physical kinship').
action_target_type(increase_physical_kinship, self).
action_leads_to(increase_physical_kinship, hug).
can_perform(Actor, increase_physical_kinship) :- true.

%% study
% Action: STUDY
% Source: Ensemble / self-improvement

action(study, 'STUDY', self_improvement, 1).
action_difficulty(study, 0.5).
action_duration(study, 1).
action_category(study, self_improvement).
action_source(study, ensemble).
action_parent(study, intelligence_up).
action_verb(study, past, 'study').
action_verb(study, present, 'study').
action_target_type(study, self).
action_leads_to(study, studymath).
action_leads_to(study, studyanatomy).
can_perform(Actor, study) :- true.

%% train
% Action: TRAIN
% Source: Ensemble / self-improvement

action(train, 'TRAIN', self_improvement, 1).
action_difficulty(train, 0.5).
action_duration(train, 1).
action_category(train, self_improvement).
action_source(train, ensemble).
action_parent(train, intelligence_up).
action_verb(train, past, 'train').
action_verb(train, present, 'train').
action_target_type(train, self).
action_leads_to(train, train_vocabulary).
can_perform(Actor, train) :- true.

%% read
% Action: READ
% Source: Ensemble / self-improvement

action(read, 'READ', self_improvement, 1).
action_difficulty(read, 0.5).
action_duration(read, 1).
action_category(read, self_improvement).
action_source(read, ensemble).
action_parent(read, intelligence_up).
action_verb(read, past, 'read').
action_verb(read, present, 'read').
action_target_type(read, self).
action_leads_to(read, read_a_book).
can_perform(Actor, read) :- true.

%% do_pushups
% Action: DO PUSHUPS
% Source: Ensemble / self-improvement

action(do_pushups, 'DO PUSHUPS', self_improvement, 1).
action_difficulty(do_pushups, 0.5).
action_duration(do_pushups, 1).
action_category(do_pushups, self_improvement).
action_source(do_pushups, ensemble).
action_parent(do_pushups, strength_up).
action_verb(do_pushups, past, 'do pushups').
action_verb(do_pushups, present, 'do pushups').
action_target_type(do_pushups, self).
action_leads_to(do_pushups, pushup1).
can_perform(Actor, do_pushups) :- true.

%% studymath
% Action: Study Math
% Source: Ensemble / self-improvement

action(studymath, 'Study Math', self_improvement, 1).
action_difficulty(studymath, 0.5).
action_duration(studymath, 1).
action_category(studymath, self_improvement).
action_source(studymath, ensemble).
action_parent(studymath, study).
action_verb(studymath, past, 'studymath').
action_verb(studymath, present, 'studymath').
action_target_type(studymath, self).
action_effect(studymath, (modify_attribute(Actor, intelligence, +, 10))).
action_effect(studymath, (ensemble_effect(Actor, self-involved, true))).
action_influence(studymath, (influence(unknown, _, _, weight, +, 0))).
can_perform(Actor, studymath) :- true.

%% studyanatomy
% Action: Study Anatomy
% Source: Ensemble / self-improvement

action(studyanatomy, 'Study Anatomy', self_improvement, 1).
action_difficulty(studyanatomy, 0.5).
action_duration(studyanatomy, 1).
action_category(studyanatomy, self_improvement).
action_source(studyanatomy, ensemble).
action_parent(studyanatomy, study).
action_verb(studyanatomy, past, 'studyanatomy').
action_verb(studyanatomy, present, 'studyanatomy').
action_target_type(studyanatomy, self).
action_effect(studyanatomy, (modify_attribute(Actor, strength, +, 10))).
action_effect(studyanatomy, (modify_attribute(Actor, intelligence, +, 10))).
action_effect(studyanatomy, (ensemble_effect(Actor, self-involved, true))).
action_influence(studyanatomy, (influence(unknown, _, _, weight, +, 0))).
can_perform(Actor, studyanatomy) :- true.

%% train_vocabulary
% Action: train vocabulary
% Source: Ensemble / self-improvement

action(train_vocabulary, 'train vocabulary', self_improvement, 1).
action_difficulty(train_vocabulary, 0.5).
action_duration(train_vocabulary, 1).
action_category(train_vocabulary, self_improvement).
action_source(train_vocabulary, ensemble).
action_parent(train_vocabulary, train).
action_verb(train_vocabulary, past, 'train vocabulary').
action_verb(train_vocabulary, present, 'train vocabulary').
action_target_type(train_vocabulary, self).
action_effect(train_vocabulary, (modify_attribute(Actor, intelligence, +, 10))).
can_perform(Actor, train_vocabulary) :- true.

%% read_a_book
% Action: read a book
% Source: Ensemble / self-improvement

action(read_a_book, 'read a book', self_improvement, 1).
action_difficulty(read_a_book, 0.5).
action_duration(read_a_book, 1).
action_category(read_a_book, self_improvement).
action_source(read_a_book, ensemble).
action_parent(read_a_book, read).
action_verb(read_a_book, past, 'read a book').
action_verb(read_a_book, present, 'read a book').
action_target_type(read_a_book, self).
action_effect(read_a_book, (modify_attribute(Actor, intelligence, +, 10))).
can_perform(Actor, read_a_book) :- true.

%% weightliftsuccess
% Action: Weightlift
% Source: Ensemble / self-improvement

action(weightliftsuccess, 'Weightlift', self_improvement, 1).
action_difficulty(weightliftsuccess, 0.5).
action_duration(weightliftsuccess, 1).
action_category(weightliftsuccess, self_improvement).
action_source(weightliftsuccess, ensemble).
action_verb(weightliftsuccess, past, 'weightliftsuccess').
action_verb(weightliftsuccess, present, 'weightliftsuccess').
action_target_type(weightliftsuccess, self).
action_effect(weightliftsuccess, (modify_attribute(Actor, strength, +, 5))).
action_effect(weightliftsuccess, (ensemble_effect(Actor, self-involved, true))).
can_perform(Actor, weightliftsuccess) :- true.

%% weightliftfail
% Action: Weight Lift <FAIL>
% Source: Ensemble / self-improvement

action(weightliftfail, 'Weight Lift <FAIL>', self_improvement, 1).
action_difficulty(weightliftfail, 0.5).
action_duration(weightliftfail, 1).
action_category(weightliftfail, self_improvement).
action_source(weightliftfail, ensemble).
action_verb(weightliftfail, past, 'weightliftfail').
action_verb(weightliftfail, present, 'weightliftfail').
action_target_type(weightliftfail, self).
action_effect(weightliftfail, (modify_attribute(Actor, strength, -, 10))).
action_effect(weightliftfail, (ensemble_effect(Actor, self-involved, true))).
can_perform(Actor, weightliftfail) :- true.

%% pushup1
% Action: Do Pushups
% Source: Ensemble / self-improvement

action(pushup1, 'Do Pushups', self_improvement, 1).
action_difficulty(pushup1, 0.5).
action_duration(pushup1, 1).
action_category(pushup1, self_improvement).
action_source(pushup1, ensemble).
action_parent(pushup1, do_pushups).
action_verb(pushup1, past, 'pushup1').
action_verb(pushup1, present, 'pushup1').
action_target_type(pushup1, self).
action_effect(pushup1, (modify_attribute(Actor, strength, +, 10))).
action_effect(pushup1, (ensemble_effect(Actor, self-involved, true))).
can_perform(Actor, pushup1) :- true.

%% ═══════════════════════════════════════════════════════════
%% Category: social-bonding
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: social-bonding
%% Source: data/ensemble/actions/social-bonding.json
%% Converted: 2026-04-01T20:15:17.351Z
%% Total actions: 7

%% befriend
% Action: BEFRIEND
% Source: Ensemble / social-bonding

action(befriend, 'BEFRIEND', social, 1).
action_difficulty(befriend, 0.5).
action_duration(befriend, 1).
action_category(befriend, social_bonding).
action_source(befriend, ensemble).
action_verb(befriend, past, 'befriend').
action_verb(befriend, present, 'befriend').
action_target_type(befriend, self).
action_leads_to(befriend, respond_positively_to_compliment).
action_leads_to(befriend, friendly_compliment).
action_leads_to(befriend, say_goodbye).
action_leads_to(befriend, goodbye_response).
can_perform(Actor, befriend) :- true.

%% bond
% Action: BOND
% Source: Ensemble / social-bonding

action(bond, 'BOND', social, 1).
action_difficulty(bond, 0.5).
action_duration(bond, 1).
action_category(bond, social_bonding).
action_source(bond, ensemble).
action_verb(bond, past, 'bond').
action_verb(bond, present, 'bond').
action_target_type(bond, self).
action_leads_to(bond, bondterminal).
can_perform(Actor, bond) :- true.

%% form_alliance
% Action: FORM ALLIANCE
% Source: Ensemble / social-bonding

action(form_alliance, 'FORM ALLIANCE', social, 1).
action_difficulty(form_alliance, 0.5).
action_duration(form_alliance, 1).
action_category(form_alliance, social_bonding).
action_source(form_alliance, ensemble).
action_verb(form_alliance, past, 'form alliance').
action_verb(form_alliance, present, 'form alliance').
action_target_type(form_alliance, self).
action_leads_to(form_alliance, intervene_between_a_and_b_in_favor_of_a).
action_leads_to(form_alliance, fight_to_help_an_unknown_man).
action_leads_to(form_alliance, help_withheld_because_person_unable_to_pay).
action_leads_to(form_alliance, formalliance_successfully).
action_leads_to(form_alliance, formalliance_unsuccessfully).
can_perform(Actor, form_alliance) :- true.

%% bondterminal
% Action: bondTerminal
% Source: Ensemble / social-bonding

action(bondterminal, 'bondTerminal', social, 1).
action_difficulty(bondterminal, 0.5).
action_duration(bondterminal, 1).
action_category(bondterminal, social_bonding).
action_source(bondterminal, ensemble).
action_parent(bondterminal, bond).
action_verb(bondterminal, past, 'bondterminal').
action_verb(bondterminal, present, 'bondterminal').
action_target_type(bondterminal, other).
action_requires_target(bondterminal).
action_range(bondterminal, 5).
action_is_accept(bondterminal).
action_effect(bondterminal, (assert(relationship(Actor, Target, friends)))).
can_perform(Actor, bondterminal, Target) :- true.

%% formalliance_successfully
% Action: formalliance successfully
% Source: Ensemble / social-bonding

action(formalliance_successfully, 'formalliance successfully', social, 1).
action_difficulty(formalliance_successfully, 0.5).
action_duration(formalliance_successfully, 1).
action_category(formalliance_successfully, social_bonding).
action_source(formalliance_successfully, ensemble).
action_parent(formalliance_successfully, form_alliance).
action_verb(formalliance_successfully, past, 'formalliance successfully').
action_verb(formalliance_successfully, present, 'formalliance successfully').
action_target_type(formalliance_successfully, other).
action_requires_target(formalliance_successfully).
action_range(formalliance_successfully, 5).
action_is_accept(formalliance_successfully).
action_effect(formalliance_successfully, (assert(relationship(Actor, Target, ally)))).
can_perform(Actor, formalliance_successfully, Target) :- true.

%% formalliance_unsuccessfully
% Action: formalliance unsuccessfully
% Source: Ensemble / social-bonding

action(formalliance_unsuccessfully, 'formalliance unsuccessfully', social, 1).
action_difficulty(formalliance_unsuccessfully, 0.5).
action_duration(formalliance_unsuccessfully, 1).
action_category(formalliance_unsuccessfully, social_bonding).
action_source(formalliance_unsuccessfully, ensemble).
action_parent(formalliance_unsuccessfully, form_alliance).
action_verb(formalliance_unsuccessfully, past, 'formalliance unsuccessfully').
action_verb(formalliance_unsuccessfully, present, 'formalliance unsuccessfully').
action_target_type(formalliance_unsuccessfully, self).
can_perform(Actor, formalliance_unsuccessfully) :- true.

%% respond_romantically
% Action: Respond Romantically
% Source: Ensemble / social-bonding

action(respond_romantically, 'Respond Romantically', social, 1).
action_difficulty(respond_romantically, 0.5).
action_duration(respond_romantically, 1).
action_category(respond_romantically, social_bonding).
action_source(respond_romantically, ensemble).
action_verb(respond_romantically, past, 'respond romantically').
action_verb(respond_romantically, present, 'respond romantically').
action_target_type(respond_romantically, self).
can_perform(Actor, respond_romantically) :- true.

%% ═══════════════════════════════════════════════════════════
%% Category: social-compliments
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: social-compliments
%% Source: data/ensemble/actions/social-compliments.json
%% Converted: 2026-04-01T20:15:17.351Z
%% Total actions: 16

%% compliment
% Action: COMPLIMENT
% Source: Ensemble / social-compliments

action(compliment, 'COMPLIMENT', social, 1).
action_difficulty(compliment, 0.5).
action_duration(compliment, 1).
action_category(compliment, social_compliments).
action_source(compliment, ensemble).
action_verb(compliment, past, 'compliment').
action_verb(compliment, present, 'compliment').
action_target_type(compliment, self).
action_leads_to(compliment, greet_in_subtle_modest_way).
action_leads_to(compliment, sensible_compliment).
action_leads_to(compliment, complimenting_a_young_provincial_on_good_manners).
action_leads_to(compliment, compliment_a_person_you_like).
action_leads_to(compliment, compliment_successfully_default).
action_leads_to(compliment, compliment_unsuccessfully_default).
can_perform(Actor, compliment) :- true.

%% compliment_successfully
% Action: Compliment
% Source: Ensemble / social-compliments

action(compliment_successfully, 'Compliment', social, 1).
action_difficulty(compliment_successfully, 0.5).
action_duration(compliment_successfully, 1).
action_category(compliment_successfully, social_compliments).
action_source(compliment_successfully, ensemble).
action_verb(compliment_successfully, past, 'compliment successfully').
action_verb(compliment_successfully, present, 'compliment successfully').
action_target_type(compliment_successfully, other).
action_requires_target(compliment_successfully).
action_range(compliment_successfully, 5).
action_is_accept(compliment_successfully).
action_effect(compliment_successfully, (modify_network(Actor, Target, respect, +, 10))).
can_perform(Actor, compliment_successfully, Target) :- true.

%% compliment_unsuccessfully
% Action: Compliment
% Source: Ensemble / social-compliments

action(compliment_unsuccessfully, 'Compliment', social, 1).
action_difficulty(compliment_unsuccessfully, 0.5).
action_duration(compliment_unsuccessfully, 1).
action_category(compliment_unsuccessfully, social_compliments).
action_source(compliment_unsuccessfully, ensemble).
action_verb(compliment_unsuccessfully, past, 'compliment unsuccessfully').
action_verb(compliment_unsuccessfully, present, 'compliment unsuccessfully').
action_target_type(compliment_unsuccessfully, other).
action_requires_target(compliment_unsuccessfully).
action_range(compliment_unsuccessfully, 5).
action_effect(compliment_unsuccessfully, (modify_network(Actor, Target, respect, +, 10))).
can_perform(Actor, compliment_unsuccessfully, Target) :- true.

%% sensible_compliment
% Action: sensible compliment
% Source: Ensemble / social-compliments

action(sensible_compliment, 'sensible compliment', social, 1).
action_difficulty(sensible_compliment, 0.5).
action_duration(sensible_compliment, 1).
action_category(sensible_compliment, social_compliments).
action_source(sensible_compliment, ensemble).
action_parent(sensible_compliment, compliment).
action_verb(sensible_compliment, past, 'sensible compliment').
action_verb(sensible_compliment, present, 'sensible compliment').
action_target_type(sensible_compliment, other).
action_requires_target(sensible_compliment).
action_range(sensible_compliment, 5).
action_is_accept(sensible_compliment).
action_prerequisite(sensible_compliment, (trait(Actor, male))).
action_prerequisite(sensible_compliment, (trait(Target, female))).
action_prerequisite(sensible_compliment, (attribute(Actor, charisma, V), V > 70)).
action_prerequisite(sensible_compliment, (attribute(Actor, sensitiveness, V), V > 50)).
action_prerequisite(sensible_compliment, (attribute(Target, sensitiveness, V), V > 50)).
action_prerequisite(sensible_compliment, (attribute(Actor, propriety, V), V > 65)).
action_effect(sensible_compliment, (modify_network(Target, Actor, affinity, +, 10))).
action_effect(sensible_compliment, (assert(status(Target, flattered)))).
% Can Actor perform this action?
can_perform(Actor, sensible_compliment, Target) :-
    trait(Actor, male),
    trait(Target, female),
    attribute(Actor, charisma, V), V > 70,
    attribute(Actor, sensitiveness, V), V > 50,
    attribute(Target, sensitiveness, V), V > 50,
    attribute(Actor, propriety, V), V > 65.

%% complimenting_a_young_provincial_on_good_manners
% Action: complimenting a young provincial on good manners
% Source: Ensemble / social-compliments

action(complimenting_a_young_provincial_on_good_manners, 'complimenting a young provincial on good manners', social, 1).
action_difficulty(complimenting_a_young_provincial_on_good_manners, 0.5).
action_duration(complimenting_a_young_provincial_on_good_manners, 1).
action_category(complimenting_a_young_provincial_on_good_manners, social_compliments).
action_source(complimenting_a_young_provincial_on_good_manners, ensemble).
action_parent(complimenting_a_young_provincial_on_good_manners, compliment).
action_verb(complimenting_a_young_provincial_on_good_manners, past, 'complimenting a young provincial on good manners').
action_verb(complimenting_a_young_provincial_on_good_manners, present, 'complimenting a young provincial on good manners').
action_target_type(complimenting_a_young_provincial_on_good_manners, other).
action_requires_target(complimenting_a_young_provincial_on_good_manners).
action_range(complimenting_a_young_provincial_on_good_manners, 5).
action_is_accept(complimenting_a_young_provincial_on_good_manners).
action_prerequisite(complimenting_a_young_provincial_on_good_manners, (\+ trait(Actor, provincial))).
action_prerequisite(complimenting_a_young_provincial_on_good_manners, (trait(Actor, old))).
action_prerequisite(complimenting_a_young_provincial_on_good_manners, (trait(Target, provincial))).
action_prerequisite(complimenting_a_young_provincial_on_good_manners, (trait(Target, young))).
action_effect(complimenting_a_young_provincial_on_good_manners, (modify_network(Target, Actor, affinity, +, 15))).
action_effect(complimenting_a_young_provincial_on_good_manners, (assert(status(Target, flattered)))).
action_effect(complimenting_a_young_provincial_on_good_manners, (assert(status(Target, happy)))).
% Can Actor perform this action?
can_perform(Actor, complimenting_a_young_provincial_on_good_manners, Target) :-
    \+ trait(Actor, provincial),
    trait(Actor, old),
    trait(Target, provincial),
    trait(Target, young).

%% compliment_successfully_default
% Action: compliment successfully-default
% Source: Ensemble / social-compliments

action(compliment_successfully_default, 'compliment successfully-default', social, 1).
action_difficulty(compliment_successfully_default, 0.5).
action_duration(compliment_successfully_default, 1).
action_category(compliment_successfully_default, social_compliments).
action_source(compliment_successfully_default, ensemble).
action_parent(compliment_successfully_default, compliment).
action_verb(compliment_successfully_default, past, 'compliment successfully-default').
action_verb(compliment_successfully_default, present, 'compliment successfully-default').
action_target_type(compliment_successfully_default, other).
action_requires_target(compliment_successfully_default).
action_range(compliment_successfully_default, 5).
action_is_accept(compliment_successfully_default).
action_effect(compliment_successfully_default, (modify_network(Target, Actor, affinity, +, 5))).
can_perform(Actor, compliment_successfully_default, Target) :- true.

%% compliment_unsuccessfully_default
% Action: compliment unsuccessfully-default
% Source: Ensemble / social-compliments

action(compliment_unsuccessfully_default, 'compliment unsuccessfully-default', social, 1).
action_difficulty(compliment_unsuccessfully_default, 0.5).
action_duration(compliment_unsuccessfully_default, 1).
action_category(compliment_unsuccessfully_default, social_compliments).
action_source(compliment_unsuccessfully_default, ensemble).
action_parent(compliment_unsuccessfully_default, compliment).
action_verb(compliment_unsuccessfully_default, past, 'compliment unsuccessfully-default').
action_verb(compliment_unsuccessfully_default, present, 'compliment unsuccessfully-default').
action_target_type(compliment_unsuccessfully_default, other).
action_requires_target(compliment_unsuccessfully_default).
action_range(compliment_unsuccessfully_default, 5).
action_effect(compliment_unsuccessfully_default, (modify_network(Target, Actor, affinity, -, 5))).
can_perform(Actor, compliment_unsuccessfully_default, Target) :- true.

%% flatter_with_kindness_and_attention
% Action: flatter with kindness and attention
% Source: Ensemble / social-compliments

action(flatter_with_kindness_and_attention, 'flatter with kindness and attention', social, 1).
action_difficulty(flatter_with_kindness_and_attention, 0.5).
action_duration(flatter_with_kindness_and_attention, 1).
action_category(flatter_with_kindness_and_attention, social_compliments).
action_source(flatter_with_kindness_and_attention, ensemble).
action_verb(flatter_with_kindness_and_attention, past, 'flatter with kindness and attention').
action_verb(flatter_with_kindness_and_attention, present, 'flatter with kindness and attention').
action_target_type(flatter_with_kindness_and_attention, other).
action_requires_target(flatter_with_kindness_and_attention).
action_range(flatter_with_kindness_and_attention, 5).
action_is_accept(flatter_with_kindness_and_attention).
action_prerequisite(flatter_with_kindness_and_attention, (attribute(Actor, charisma, V), V > 50)).
action_prerequisite(flatter_with_kindness_and_attention, (status(Target, feeling socially connected))).
action_prerequisite(flatter_with_kindness_and_attention, (trait(Actor, kind))).
action_prerequisite(flatter_with_kindness_and_attention, (network(Actor, Target, curiosity, V), V > 70)).
action_effect(flatter_with_kindness_and_attention, (modify_network(Target, Actor, affinity, +, 15))).
action_effect(flatter_with_kindness_and_attention, (modify_network(Target, 'other', curiosity, +, 10))).
action_effect(flatter_with_kindness_and_attention, (assert(status(Target, flattered)))).
% Can Actor perform this action?
can_perform(Actor, flatter_with_kindness_and_attention, Target) :-
    attribute(Actor, charisma, V), V > 50,
    status(Target, feeling socially connected),
    trait(Actor, kind),
    network(Actor, Target, curiosity, V), V > 70.

%% backhanded_compliment
% Action: Backhanded Compliment
% Source: Ensemble / social-compliments

action(backhanded_compliment, 'Backhanded Compliment', social, 1).
action_difficulty(backhanded_compliment, 0.5).
action_duration(backhanded_compliment, 1).
action_category(backhanded_compliment, social_compliments).
action_source(backhanded_compliment, ensemble).
action_verb(backhanded_compliment, past, 'backhanded compliment').
action_verb(backhanded_compliment, present, 'backhanded compliment').
action_target_type(backhanded_compliment, self).
can_perform(Actor, backhanded_compliment) :- true.

%% flatter
% Action: Flatter
% Source: Ensemble / social-compliments

action(flatter, 'Flatter', social, 1).
action_difficulty(flatter, 0.5).
action_duration(flatter, 1).
action_category(flatter, social_compliments).
action_source(flatter, ensemble).
action_verb(flatter, past, 'flatter').
action_verb(flatter, present, 'flatter').
action_target_type(flatter, self).
can_perform(Actor, flatter) :- true.

%% friendly_compliment
% Action: Friendly Compliment
% Source: Ensemble / social-compliments

action(friendly_compliment, 'Friendly Compliment', social, 1).
action_difficulty(friendly_compliment, 0.5).
action_duration(friendly_compliment, 1).
action_category(friendly_compliment, social_compliments).
action_source(friendly_compliment, ensemble).
action_verb(friendly_compliment, past, 'friendly compliment').
action_verb(friendly_compliment, present, 'friendly compliment').
action_target_type(friendly_compliment, self).
can_perform(Actor, friendly_compliment) :- true.

%% romantic_compliment
% Action: Romantic Compliment
% Source: Ensemble / social-compliments

action(romantic_compliment, 'Romantic Compliment', social, 1).
action_difficulty(romantic_compliment, 0.5).
action_duration(romantic_compliment, 1).
action_category(romantic_compliment, social_compliments).
action_source(romantic_compliment, ensemble).
action_verb(romantic_compliment, past, 'romantic compliment').
action_verb(romantic_compliment, present, 'romantic compliment').
action_target_type(romantic_compliment, self).
can_perform(Actor, romantic_compliment) :- true.

%% respond_positively_to_compliment
% Action: Respond Positively to Compliment
% Source: Ensemble / social-compliments

action(respond_positively_to_compliment, 'Respond Positively to Compliment', social, 1).
action_difficulty(respond_positively_to_compliment, 0.5).
action_duration(respond_positively_to_compliment, 1).
action_category(respond_positively_to_compliment, social_compliments).
action_source(respond_positively_to_compliment, ensemble).
action_verb(respond_positively_to_compliment, past, 'respond positively to compliment').
action_verb(respond_positively_to_compliment, present, 'respond positively to compliment').
action_target_type(respond_positively_to_compliment, self).
can_perform(Actor, respond_positively_to_compliment) :- true.

%% compliment
% Action: Compliment
% Source: Ensemble / social-compliments

action(compliment, 'Compliment', social, 1).
action_difficulty(compliment, 0.5).
action_duration(compliment, 1).
action_category(compliment, social_compliments).
action_source(compliment, ensemble).
action_verb(compliment, past, 'compliment').
action_verb(compliment, present, 'compliment').
action_target_type(compliment, other).
action_requires_target(compliment).
action_range(compliment, 5).
action_effect(compliment, (modify_network(Actor, Target, friendship, +, 1))).
can_perform(Actor, compliment, Target) :- true.

%% compliment_appearance
% Action: Compliment appearance
% Source: Ensemble / social-compliments

action(compliment_appearance, 'Compliment appearance', social, 1).
action_difficulty(compliment_appearance, 0.5).
action_duration(compliment_appearance, 1).
action_category(compliment_appearance, social_compliments).
action_source(compliment_appearance, ensemble).
action_verb(compliment_appearance, past, 'compliment appearance').
action_verb(compliment_appearance, present, 'compliment appearance').
action_target_type(compliment_appearance, other).
action_requires_target(compliment_appearance).
action_range(compliment_appearance, 5).
action_effect(compliment_appearance, (ensemble_effect(Target, flirted with, true))).
can_perform(Actor, compliment_appearance, Target) :- true.

%% compliment_a_person_you_like
% Action: compliment a person you like
% Source: Ensemble / social-compliments

action(compliment_a_person_you_like, 'compliment a person you like', social, 1).
action_difficulty(compliment_a_person_you_like, 0.5).
action_duration(compliment_a_person_you_like, 1).
action_category(compliment_a_person_you_like, social_compliments).
action_source(compliment_a_person_you_like, ensemble).
action_parent(compliment_a_person_you_like, compliment).
action_verb(compliment_a_person_you_like, past, 'compliment a person you like').
action_verb(compliment_a_person_you_like, present, 'compliment a person you like').
action_target_type(compliment_a_person_you_like, other).
action_requires_target(compliment_a_person_you_like).
action_range(compliment_a_person_you_like, 5).
action_is_accept(compliment_a_person_you_like).
action_prerequisite(compliment_a_person_you_like, (network(Actor, Target, affinity, V), V >= 50)).
action_effect(compliment_a_person_you_like, (modify_network(Target, Actor, affinity, +, 25))).
% Can Actor perform this action?
can_perform(Actor, compliment_a_person_you_like, Target) :-
    network(Actor, Target, affinity, V), V >= 50.

%% ═══════════════════════════════════════════════════════════
%% Category: social-gifts
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: social-gifts
%% Source: data/ensemble/actions/social-gifts.json
%% Converted: 2026-04-01T20:15:17.351Z
%% Total actions: 13

%% give_a_gift
% Action: GIVE A GIFT
% Source: Ensemble / social-gifts

action(give_a_gift, 'GIVE A GIFT', social, 1).
action_difficulty(give_a_gift, 0.5).
action_duration(give_a_gift, 1).
action_category(give_a_gift, social_gifts).
action_source(give_a_gift, ensemble).
action_verb(give_a_gift, past, 'give a gift').
action_verb(give_a_gift, present, 'give a gift').
action_target_type(give_a_gift, self).
action_leads_to(give_a_gift, encourages_friend_s_friend_with_a_pick_me_up_a).
action_leads_to(give_a_gift, giftgift_successfully_default).
action_leads_to(give_a_gift, givegift_unsuccessfully_default).
can_perform(Actor, give_a_gift) :- true.

%% forgive
% Action: FORGIVE
% Source: Ensemble / social-gifts

action(forgive, 'FORGIVE', social, 1).
action_difficulty(forgive, 0.5).
action_duration(forgive, 1).
action_category(forgive, social_gifts).
action_source(forgive, ensemble).
action_verb(forgive, past, 'forgive').
action_verb(forgive, present, 'forgive').
action_target_type(forgive, self).
action_leads_to(forgive, excuse_and_forgive_someone_for_perceived_wrong).
action_leads_to(forgive, forgive_successfully).
action_leads_to(forgive, forgive_unsuccessfully).
can_perform(Actor, forgive) :- true.

%% a_man_gives_a_hand_to_a_woman_a
% Action: a man gives a hand to a woman (a)
% Source: Ensemble / social-gifts

action(a_man_gives_a_hand_to_a_woman_a, 'a man gives a hand to a woman (a)', social, 1).
action_difficulty(a_man_gives_a_hand_to_a_woman_a, 0.5).
action_duration(a_man_gives_a_hand_to_a_woman_a, 1).
action_category(a_man_gives_a_hand_to_a_woman_a, social_gifts).
action_source(a_man_gives_a_hand_to_a_woman_a, ensemble).
action_verb(a_man_gives_a_hand_to_a_woman_a, past, 'a man gives a hand to a woman (a)').
action_verb(a_man_gives_a_hand_to_a_woman_a, present, 'a man gives a hand to a woman (a)').
action_target_type(a_man_gives_a_hand_to_a_woman_a, other).
action_requires_target(a_man_gives_a_hand_to_a_woman_a).
action_range(a_man_gives_a_hand_to_a_woman_a, 5).
action_is_accept(a_man_gives_a_hand_to_a_woman_a).
action_prerequisite(a_man_gives_a_hand_to_a_woman_a, (attribute(Actor, charisma, V), V > 60)).
action_prerequisite(a_man_gives_a_hand_to_a_woman_a, (trait(Actor, innocent looking))).
action_prerequisite(a_man_gives_a_hand_to_a_woman_a, (trait(Target, female))).
action_prerequisite(a_man_gives_a_hand_to_a_woman_a, (trait(Target, virtuous))).
action_prerequisite(a_man_gives_a_hand_to_a_woman_a, (trait(Actor, provincial))).
action_prerequisite(a_man_gives_a_hand_to_a_woman_a, (trait(Actor, male))).
action_prerequisite(a_man_gives_a_hand_to_a_woman_a, (status(Target, tired))).
action_effect(a_man_gives_a_hand_to_a_woman_a, (modify_network(Target, Actor, affinity, +, 10))).
action_effect(a_man_gives_a_hand_to_a_woman_a, (assert(relationship(Target, Actor, esteem)))).
action_effect(a_man_gives_a_hand_to_a_woman_a, (modify_network(Actor, Target, curiosity, +, 10))).
% Can Actor perform this action?
can_perform(Actor, a_man_gives_a_hand_to_a_woman_a, Target) :-
    attribute(Actor, charisma, V), V > 60,
    trait(Actor, innocent looking),
    trait(Target, female),
    trait(Target, virtuous),
    trait(Actor, provincial),
    trait(Actor, male),
    status(Target, tired).

%% giftgift_successfully_default
% Action: giftgift successfully-default
% Source: Ensemble / social-gifts

action(giftgift_successfully_default, 'giftgift successfully-default', social, 1).
action_difficulty(giftgift_successfully_default, 0.5).
action_duration(giftgift_successfully_default, 1).
action_category(giftgift_successfully_default, social_gifts).
action_source(giftgift_successfully_default, ensemble).
action_parent(giftgift_successfully_default, give_a_gift).
action_verb(giftgift_successfully_default, past, 'giftgift successfully-default').
action_verb(giftgift_successfully_default, present, 'giftgift successfully-default').
action_target_type(giftgift_successfully_default, other).
action_requires_target(giftgift_successfully_default).
action_range(giftgift_successfully_default, 5).
action_is_accept(giftgift_successfully_default).
action_effect(giftgift_successfully_default, (modify_network(Target, Actor, affinity, +, 5))).
can_perform(Actor, giftgift_successfully_default, Target) :- true.

%% givegift_unsuccessfully_default
% Action: givegift unsuccessfully-default
% Source: Ensemble / social-gifts

action(givegift_unsuccessfully_default, 'givegift unsuccessfully-default', social, 1).
action_difficulty(givegift_unsuccessfully_default, 0.5).
action_duration(givegift_unsuccessfully_default, 1).
action_category(givegift_unsuccessfully_default, social_gifts).
action_source(givegift_unsuccessfully_default, ensemble).
action_parent(givegift_unsuccessfully_default, give_a_gift).
action_verb(givegift_unsuccessfully_default, past, 'givegift unsuccessfully-default').
action_verb(givegift_unsuccessfully_default, present, 'givegift unsuccessfully-default').
action_target_type(givegift_unsuccessfully_default, other).
action_requires_target(givegift_unsuccessfully_default).
action_range(givegift_unsuccessfully_default, 5).
action_effect(givegift_unsuccessfully_default, (modify_network(Target, Actor, affinity, -, 5))).
can_perform(Actor, givegift_unsuccessfully_default, Target) :- true.

%% gift_given_meant_to_impress_but_does_not_impress_receiver
% Action: gift given meant to impress but does not impress receiver
% Source: Ensemble / social-gifts

action(gift_given_meant_to_impress_but_does_not_impress_receiver, 'gift given meant to impress but does not impress receiver', social, 1).
action_difficulty(gift_given_meant_to_impress_but_does_not_impress_receiver, 0.5).
action_duration(gift_given_meant_to_impress_but_does_not_impress_receiver, 1).
action_category(gift_given_meant_to_impress_but_does_not_impress_receiver, social_gifts).
action_source(gift_given_meant_to_impress_but_does_not_impress_receiver, ensemble).
action_verb(gift_given_meant_to_impress_but_does_not_impress_receiver, past, 'gift given meant to impress but does not impress receiver').
action_verb(gift_given_meant_to_impress_but_does_not_impress_receiver, present, 'gift given meant to impress but does not impress receiver').
action_target_type(gift_given_meant_to_impress_but_does_not_impress_receiver, other).
action_requires_target(gift_given_meant_to_impress_but_does_not_impress_receiver).
action_range(gift_given_meant_to_impress_but_does_not_impress_receiver, 5).
action_prerequisite(gift_given_meant_to_impress_but_does_not_impress_receiver, (network(Actor, Target, affinity, V), V > 50)).
action_prerequisite(gift_given_meant_to_impress_but_does_not_impress_receiver, (trait(Target, modest))).
action_prerequisite(gift_given_meant_to_impress_but_does_not_impress_receiver, (attribute(Actor, self-assuredness, V), V > 50)).
action_prerequisite(gift_given_meant_to_impress_but_does_not_impress_receiver, (trait(Actor, rich))).
action_prerequisite(gift_given_meant_to_impress_but_does_not_impress_receiver, (trait(Actor, vain))).
action_effect(gift_given_meant_to_impress_but_does_not_impress_receiver, (modify_network(Target, Actor, curiosity, +, 5))).
action_effect(gift_given_meant_to_impress_but_does_not_impress_receiver, (modify_network(Target, Actor, affinity, +, 10))).
action_effect(gift_given_meant_to_impress_but_does_not_impress_receiver, (retract(status(Actor, happy)))).
action_effect(gift_given_meant_to_impress_but_does_not_impress_receiver, (assert(status(Target, grateful)))).
% Can Actor perform this action?
can_perform(Actor, gift_given_meant_to_impress_but_does_not_impress_receiver, Target) :-
    network(Actor, Target, affinity, V), V > 50,
    trait(Target, modest),
    attribute(Actor, self-assuredness, V), V > 50,
    trait(Actor, rich),
    trait(Actor, vain).

%% draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift
% Action: draw attention away from self by using third person ally to give a gift
% Source: Ensemble / social-gifts

action(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, 'draw attention away from self by using third person ally to give a gift', social, 1).
action_difficulty(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, 0.5).
action_duration(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, 1).
action_category(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, social_gifts).
action_source(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, ensemble).
action_verb(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, past, 'draw attention away from self by using third person ally to give a gift').
action_verb(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, present, 'draw attention away from self by using third person ally to give a gift').
action_target_type(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, other).
action_requires_target(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift).
action_range(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, 5).
action_is_accept(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift).
action_prerequisite(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, (network(Actor, Target, affinity, V), V > 60)).
action_prerequisite(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, (attribute(Actor, propriety, V), V > 60)).
action_prerequisite(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, (trait(Actor, rich))).
action_prerequisite(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, (\+ trait(Target, rich))).
action_prerequisite(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, (relationship('third', Actor, ally))).
action_prerequisite(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, (\+ trait(Actor, indiscreet))).
action_prerequisite(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, (trait(Actor, generous))).
action_effect(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, (modify_network(Target, Actor, curiosity, -, 10))).
action_effect(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, (modify_network(Target, 'third', affinity, +, 10))).
action_effect(draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, (modify_network(Target, 'third', curiosity, +, 10))).
% Can Actor perform this action?
can_perform(Actor, draw_attention_away_from_self_by_using_third_person_ally_to_give_a_gift, Target) :-
    network(Actor, Target, affinity, V), V > 60,
    attribute(Actor, propriety, V), V > 60,
    trait(Actor, rich),
    \+ trait(Target, rich),
    relationship('third', Actor, ally),
    \+ trait(Actor, indiscreet),
    trait(Actor, generous).

%% excuse_and_forgive_someone_for_perceived_wrong
% Action: excuse and forgive someone for perceived wrong
% Source: Ensemble / social-gifts

action(excuse_and_forgive_someone_for_perceived_wrong, 'excuse and forgive someone for perceived wrong', social, 1).
action_difficulty(excuse_and_forgive_someone_for_perceived_wrong, 0.5).
action_duration(excuse_and_forgive_someone_for_perceived_wrong, 1).
action_category(excuse_and_forgive_someone_for_perceived_wrong, social_gifts).
action_source(excuse_and_forgive_someone_for_perceived_wrong, ensemble).
action_parent(excuse_and_forgive_someone_for_perceived_wrong, forgive).
action_verb(excuse_and_forgive_someone_for_perceived_wrong, past, 'excuse and forgive someone for perceived wrong').
action_verb(excuse_and_forgive_someone_for_perceived_wrong, present, 'excuse and forgive someone for perceived wrong').
action_target_type(excuse_and_forgive_someone_for_perceived_wrong, other).
action_requires_target(excuse_and_forgive_someone_for_perceived_wrong).
action_range(excuse_and_forgive_someone_for_perceived_wrong, 5).
action_is_accept(excuse_and_forgive_someone_for_perceived_wrong).
action_prerequisite(excuse_and_forgive_someone_for_perceived_wrong, (ensemble_condition(Actor, resentful of, true))).
action_prerequisite(excuse_and_forgive_someone_for_perceived_wrong, (trait(Target, virtuous))).
action_prerequisite(excuse_and_forgive_someone_for_perceived_wrong, (network(Actor, Target, affinity, V), V < 50)).
action_effect(excuse_and_forgive_someone_for_perceived_wrong, (modify_network(Actor, Target, affinity, +, 10))).
action_effect(excuse_and_forgive_someone_for_perceived_wrong, (ensemble_effect(Actor, resentful of, false))).
action_effect(excuse_and_forgive_someone_for_perceived_wrong, (assert(status(Actor, happy)))).
action_effect(excuse_and_forgive_someone_for_perceived_wrong, (assert(status(Target, grateful)))).
action_effect(excuse_and_forgive_someone_for_perceived_wrong, (retract(relationship(Actor, Target, rivals)))).
% Can Actor perform this action?
can_perform(Actor, excuse_and_forgive_someone_for_perceived_wrong, Target) :-
    ensemble_condition(Actor, resentful of, true),
    trait(Target, virtuous),
    network(Actor, Target, affinity, V), V < 50.

%% forgive_successfully
% Action: forgive successfully
% Source: Ensemble / social-gifts

action(forgive_successfully, 'forgive successfully', social, 1).
action_difficulty(forgive_successfully, 0.5).
action_duration(forgive_successfully, 1).
action_category(forgive_successfully, social_gifts).
action_source(forgive_successfully, ensemble).
action_parent(forgive_successfully, forgive).
action_verb(forgive_successfully, past, 'forgive successfully').
action_verb(forgive_successfully, present, 'forgive successfully').
action_target_type(forgive_successfully, other).
action_requires_target(forgive_successfully).
action_range(forgive_successfully, 5).
action_is_accept(forgive_successfully).
action_effect(forgive_successfully, (retract(relationship(Actor, Target, rivals)))).
can_perform(Actor, forgive_successfully, Target) :- true.

%% forgive_unsuccessfully
% Action: forgive unsuccessfully
% Source: Ensemble / social-gifts

action(forgive_unsuccessfully, 'forgive unsuccessfully', social, 1).
action_difficulty(forgive_unsuccessfully, 0.5).
action_duration(forgive_unsuccessfully, 1).
action_category(forgive_unsuccessfully, social_gifts).
action_source(forgive_unsuccessfully, ensemble).
action_parent(forgive_unsuccessfully, forgive).
action_verb(forgive_unsuccessfully, past, 'forgive unsuccessfully').
action_verb(forgive_unsuccessfully, present, 'forgive unsuccessfully').
action_target_type(forgive_unsuccessfully, other).
action_requires_target(forgive_unsuccessfully).
action_range(forgive_unsuccessfully, 5).
action_effect(forgive_unsuccessfully, (assert(relationship(Actor, Target, rivals)))).
can_perform(Actor, forgive_unsuccessfully, Target) :- true.

%% give_the_info
% Action: Give the info
% Source: Ensemble / social-gifts

action(give_the_info, 'Give the info', social, 1).
action_difficulty(give_the_info, 0.5).
action_duration(give_the_info, 1).
action_category(give_the_info, social_gifts).
action_source(give_the_info, ensemble).
action_verb(give_the_info, past, 'give the info').
action_verb(give_the_info, present, 'give the info').
action_target_type(give_the_info, other).
action_requires_target(give_the_info).
action_range(give_the_info, 5).
action_effect(give_the_info, (modify_network(Actor, Target, trust, +, 1))).
action_effect(give_the_info, (modify_network(Target, Actor, trust, +, 1))).
action_effect(give_the_info, (ensemble_effect(Actor, positive, true))).
can_perform(Actor, give_the_info, Target) :- true.

%% reluctantly_give_info
% Action: Reluctantly give info
% Source: Ensemble / social-gifts

action(reluctantly_give_info, 'Reluctantly give info', social, 1).
action_difficulty(reluctantly_give_info, 0.5).
action_duration(reluctantly_give_info, 1).
action_category(reluctantly_give_info, social_gifts).
action_source(reluctantly_give_info, ensemble).
action_verb(reluctantly_give_info, past, 'reluctantly give info').
action_verb(reluctantly_give_info, present, 'reluctantly give info').
action_target_type(reluctantly_give_info, self).
can_perform(Actor, reluctantly_give_info) :- true.

%% give_for_free
% Action: Give for free
% Source: Ensemble / social-gifts

action(give_for_free, 'Give for free', social, 1).
action_difficulty(give_for_free, 0.5).
action_duration(give_for_free, 1).
action_category(give_for_free, social_gifts).
action_source(give_for_free, ensemble).
action_verb(give_for_free, past, 'give for free').
action_verb(give_for_free, present, 'give for free').
action_target_type(give_for_free, self).
can_perform(Actor, give_for_free) :- true.

%% ═══════════════════════════════════════════════════════════
%% Category: social-helping
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: social-helping
%% Source: data/ensemble/actions/social-helping.json
%% Converted: 2026-04-01T20:15:17.351Z
%% Total actions: 17

%% help
% Action: HELP
% Source: Ensemble / social-helping

action(help, 'HELP', social, 1).
action_difficulty(help, 0.5).
action_duration(help, 1).
action_category(help, social_helping).
action_source(help, ensemble).
action_verb(help, past, 'help').
action_verb(help, present, 'help').
action_target_type(help, self).
action_leads_to(help, greet_correction).
action_leads_to(help, give_the_info).
can_perform(Actor, help) :- true.

%% favor
% Action: FAVOR
% Source: Ensemble / social-helping

action(favor, 'FAVOR', social, 1).
action_difficulty(favor, 0.5).
action_duration(favor, 1).
action_category(favor, social_helping).
action_source(favor, ensemble).
action_verb(favor, past, 'favor').
action_verb(favor, present, 'favor').
action_target_type(favor, self).
action_leads_to(favor, give_for_free).
can_perform(Actor, favor) :- true.

%% help
% Action: HELP
% Source: Ensemble / social-helping

action(help, 'HELP', social, 1).
action_difficulty(help, 0.5).
action_duration(help, 1).
action_category(help, social_helping).
action_source(help, ensemble).
action_verb(help, past, 'help').
action_verb(help, present, 'help').
action_target_type(help, self).
action_leads_to(help, steal_something_for_a_friend_a).
action_leads_to(help, steal_something_for_a_friend_r).
action_leads_to(help, pay_poor_person_s_expenses).
action_leads_to(help, man_helps_woman_out_of_biens_ance_a).
action_leads_to(help, keep_a_secret_for_someone).
action_leads_to(help, experienced_person_gives_good_advice).
action_leads_to(help, discreet_thanks_for_help_from_a_social_superior).
action_leads_to(help, a_man_gives_a_hand_to_a_woman_a).
action_leads_to(help, bonne_physionomie_man_grateful_to_benefactor).
action_leads_to(help, a_rich_person_helps_a_inebriated_man).
action_leads_to(help, helpsomeone_successfully_default).
action_leads_to(help, helpsomeone_unsuccessfully_default).
can_perform(Actor, help) :- true.

%% ask_for_a_favor
% Action: ASK FOR A FAVOR
% Source: Ensemble / social-helping

action(ask_for_a_favor, 'ASK FOR A FAVOR', social, 1).
action_difficulty(ask_for_a_favor, 0.5).
action_duration(ask_for_a_favor, 1).
action_category(ask_for_a_favor, social_helping).
action_source(ask_for_a_favor, ensemble).
action_verb(ask_for_a_favor, past, 'ask for a favor').
action_verb(ask_for_a_favor, present, 'ask for a favor').
action_target_type(ask_for_a_favor, self).
action_leads_to(ask_for_a_favor, devout_refuses_to_help_poor_desperate_virtuous).
action_leads_to(ask_for_a_favor, a_rich_person_ask_a_non_rich_person_to_introduce_him_to_a_higher_rich_person_a).
action_leads_to(ask_for_a_favor, askforfavor_successfully).
action_leads_to(ask_for_a_favor, askforfavor_unsuccessfully).
can_perform(Actor, ask_for_a_favor) :- true.

%% pay_poor_person_s_expenses
% Action: pay poor person’s expenses
% Source: Ensemble / social-helping

action(pay_poor_person_s_expenses, 'pay poor person''s expenses', social, 1).
action_difficulty(pay_poor_person_s_expenses, 0.5).
action_duration(pay_poor_person_s_expenses, 1).
action_category(pay_poor_person_s_expenses, social_helping).
action_source(pay_poor_person_s_expenses, ensemble).
action_parent(pay_poor_person_s_expenses, help).
action_verb(pay_poor_person_s_expenses, past, 'pay poor person''s expenses').
action_verb(pay_poor_person_s_expenses, present, 'pay poor person''s expenses').
action_target_type(pay_poor_person_s_expenses, other).
action_requires_target(pay_poor_person_s_expenses).
action_range(pay_poor_person_s_expenses, 5).
action_is_accept(pay_poor_person_s_expenses).
action_prerequisite(pay_poor_person_s_expenses, (trait(Actor, generous))).
action_prerequisite(pay_poor_person_s_expenses, (trait(Target, poor))).
action_effect(pay_poor_person_s_expenses, (modify_network(Target, Actor, affinity, +, 15))).
% Can Actor perform this action?
can_perform(Actor, pay_poor_person_s_expenses, Target) :-
    trait(Actor, generous),
    trait(Target, poor).

%% man_helps_woman_out_of_biens_ance_a
% Action: man helps woman out of “”bienséance“” (a)
% Source: Ensemble / social-helping

action(man_helps_woman_out_of_biens_ance_a, 'man helps woman out of "bienséance" (a)', social, 1).
action_difficulty(man_helps_woman_out_of_biens_ance_a, 0.5).
action_duration(man_helps_woman_out_of_biens_ance_a, 1).
action_category(man_helps_woman_out_of_biens_ance_a, social_helping).
action_source(man_helps_woman_out_of_biens_ance_a, ensemble).
action_parent(man_helps_woman_out_of_biens_ance_a, help).
action_verb(man_helps_woman_out_of_biens_ance_a, past, 'man helps woman out of "bienséance" (a)').
action_verb(man_helps_woman_out_of_biens_ance_a, present, 'man helps woman out of "bienséance" (a)').
action_target_type(man_helps_woman_out_of_biens_ance_a, other).
action_requires_target(man_helps_woman_out_of_biens_ance_a).
action_range(man_helps_woman_out_of_biens_ance_a, 5).
action_is_accept(man_helps_woman_out_of_biens_ance_a).
action_prerequisite(man_helps_woman_out_of_biens_ance_a, (attribute(Actor, propriety, V), V > 50)).
action_prerequisite(man_helps_woman_out_of_biens_ance_a, (trait(Actor, flirtatious))).
action_prerequisite(man_helps_woman_out_of_biens_ance_a, (trait(Target, beautiful))).
action_prerequisite(man_helps_woman_out_of_biens_ance_a, (trait(Target, female))).
action_prerequisite(man_helps_woman_out_of_biens_ance_a, (attribute(Target, charisma, V), V > 70)).
action_prerequisite(man_helps_woman_out_of_biens_ance_a, (trait(Actor, male))).
action_effect(man_helps_woman_out_of_biens_ance_a, (modify_network(Target, Actor, affinity, +, 10))).
action_effect(man_helps_woman_out_of_biens_ance_a, (modify_network(Actor, Target, affinity, +, 10))).
action_effect(man_helps_woman_out_of_biens_ance_a, (modify_network(Target, Actor, curiosity, +, 15))).
% Can Actor perform this action?
can_perform(Actor, man_helps_woman_out_of_biens_ance_a, Target) :-
    attribute(Actor, propriety, V), V > 50,
    trait(Actor, flirtatious),
    trait(Target, beautiful),
    trait(Target, female),
    attribute(Target, charisma, V), V > 70,
    trait(Actor, male).

%% experienced_person_gives_good_advice
% Action: experienced person gives good advice
% Source: Ensemble / social-helping

action(experienced_person_gives_good_advice, 'experienced person gives good advice', social, 1).
action_difficulty(experienced_person_gives_good_advice, 0.5).
action_duration(experienced_person_gives_good_advice, 1).
action_category(experienced_person_gives_good_advice, social_helping).
action_source(experienced_person_gives_good_advice, ensemble).
action_parent(experienced_person_gives_good_advice, help).
action_verb(experienced_person_gives_good_advice, past, 'experienced person gives good advice').
action_verb(experienced_person_gives_good_advice, present, 'experienced person gives good advice').
action_target_type(experienced_person_gives_good_advice, other).
action_requires_target(experienced_person_gives_good_advice).
action_range(experienced_person_gives_good_advice, 5).
action_is_accept(experienced_person_gives_good_advice).
action_prerequisite(experienced_person_gives_good_advice, (attribute(Actor, propriety, V), V > 80)).
action_prerequisite(experienced_person_gives_good_advice, (attribute(Target, propriety, V), V < 70)).
action_prerequisite(experienced_person_gives_good_advice, (relationship(Target, Actor, esteem))).
action_effect(experienced_person_gives_good_advice, (modify_network(Target, Actor, affinity, +, 15))).
action_effect(experienced_person_gives_good_advice, (modify_network(Target, Actor, affinity, +, 15))).
action_effect(experienced_person_gives_good_advice, (assert(status(Target, grateful)))).
% Can Actor perform this action?
can_perform(Actor, experienced_person_gives_good_advice, Target) :-
    attribute(Actor, propriety, V), V > 80,
    attribute(Target, propriety, V), V < 70,
    relationship(Target, Actor, esteem).

%% discreet_thanks_for_help_from_a_social_superior
% Action: discreet thanks for help from a social superior
% Source: Ensemble / social-helping

action(discreet_thanks_for_help_from_a_social_superior, 'discreet thanks for help from a social superior', social, 1).
action_difficulty(discreet_thanks_for_help_from_a_social_superior, 0.5).
action_duration(discreet_thanks_for_help_from_a_social_superior, 1).
action_category(discreet_thanks_for_help_from_a_social_superior, social_helping).
action_source(discreet_thanks_for_help_from_a_social_superior, ensemble).
action_parent(discreet_thanks_for_help_from_a_social_superior, help).
action_verb(discreet_thanks_for_help_from_a_social_superior, past, 'discreet thanks for help from a social superior').
action_verb(discreet_thanks_for_help_from_a_social_superior, present, 'discreet thanks for help from a social superior').
action_target_type(discreet_thanks_for_help_from_a_social_superior, other).
action_requires_target(discreet_thanks_for_help_from_a_social_superior).
action_range(discreet_thanks_for_help_from_a_social_superior, 5).
action_is_accept(discreet_thanks_for_help_from_a_social_superior).
action_prerequisite(discreet_thanks_for_help_from_a_social_superior, (trait(Actor, virtuous))).
action_prerequisite(discreet_thanks_for_help_from_a_social_superior, (\+ trait(Actor, rich))).
action_prerequisite(discreet_thanks_for_help_from_a_social_superior, (\+ relationship(Actor, Target, strangers))).
action_prerequisite(discreet_thanks_for_help_from_a_social_superior, (trait(Target, rich))).
action_effect(discreet_thanks_for_help_from_a_social_superior, (assert(status(Actor, grateful)))).
action_effect(discreet_thanks_for_help_from_a_social_superior, (modify_attribute(Actor, propriety, +, 5))).
action_effect(discreet_thanks_for_help_from_a_social_superior, (modify_network(Target, Actor, affinity, +, 5))).
action_effect(discreet_thanks_for_help_from_a_social_superior, (ensemble_effect(Actor, owes a favor to, true))).
action_effect(discreet_thanks_for_help_from_a_social_superior, (modify_attribute(Actor, sensitiveness, +, 5))).
% Can Actor perform this action?
can_perform(Actor, discreet_thanks_for_help_from_a_social_superior, Target) :-
    trait(Actor, virtuous),
    \+ trait(Actor, rich),
    \+ relationship(Actor, Target, strangers),
    trait(Target, rich).

%% a_rich_person_helps_a_inebriated_man
% Action: a rich person helps a inebriated man
% Source: Ensemble / social-helping

action(a_rich_person_helps_a_inebriated_man, 'a rich person helps a inebriated man', social, 1).
action_difficulty(a_rich_person_helps_a_inebriated_man, 0.5).
action_duration(a_rich_person_helps_a_inebriated_man, 1).
action_category(a_rich_person_helps_a_inebriated_man, social_helping).
action_source(a_rich_person_helps_a_inebriated_man, ensemble).
action_parent(a_rich_person_helps_a_inebriated_man, help).
action_verb(a_rich_person_helps_a_inebriated_man, past, 'a rich person helps a inebriated man').
action_verb(a_rich_person_helps_a_inebriated_man, present, 'a rich person helps a inebriated man').
action_target_type(a_rich_person_helps_a_inebriated_man, other).
action_requires_target(a_rich_person_helps_a_inebriated_man).
action_range(a_rich_person_helps_a_inebriated_man, 5).
action_is_accept(a_rich_person_helps_a_inebriated_man).
action_prerequisite(a_rich_person_helps_a_inebriated_man, (trait(Actor, rich))).
action_prerequisite(a_rich_person_helps_a_inebriated_man, (attribute(Actor, sensitiveness, V), V > 75)).
action_prerequisite(a_rich_person_helps_a_inebriated_man, (status(Target, inebriated))).
action_effect(a_rich_person_helps_a_inebriated_man, (modify_network(Target, Actor, affinity, +, 10))).
% Can Actor perform this action?
can_perform(Actor, a_rich_person_helps_a_inebriated_man, Target) :-
    trait(Actor, rich),
    attribute(Actor, sensitiveness, V), V > 75,
    status(Target, inebriated).

%% helpsomeone_successfully_default
% Action: helpsomeone successfully-default
% Source: Ensemble / social-helping

action(helpsomeone_successfully_default, 'helpsomeone successfully-default', social, 1).
action_difficulty(helpsomeone_successfully_default, 0.5).
action_duration(helpsomeone_successfully_default, 1).
action_category(helpsomeone_successfully_default, social_helping).
action_source(helpsomeone_successfully_default, ensemble).
action_parent(helpsomeone_successfully_default, help).
action_verb(helpsomeone_successfully_default, past, 'helpsomeone successfully-default').
action_verb(helpsomeone_successfully_default, present, 'helpsomeone successfully-default').
action_target_type(helpsomeone_successfully_default, other).
action_requires_target(helpsomeone_successfully_default).
action_range(helpsomeone_successfully_default, 5).
action_is_accept(helpsomeone_successfully_default).
action_effect(helpsomeone_successfully_default, (modify_network(Target, Actor, affinity, +, 5))).
can_perform(Actor, helpsomeone_successfully_default, Target) :- true.

%% helpsomeone_unsuccessfully_default
% Action: helpsomeone unsuccessfully-default
% Source: Ensemble / social-helping

action(helpsomeone_unsuccessfully_default, 'helpsomeone unsuccessfully-default', social, 1).
action_difficulty(helpsomeone_unsuccessfully_default, 0.5).
action_duration(helpsomeone_unsuccessfully_default, 1).
action_category(helpsomeone_unsuccessfully_default, social_helping).
action_source(helpsomeone_unsuccessfully_default, ensemble).
action_parent(helpsomeone_unsuccessfully_default, help).
action_verb(helpsomeone_unsuccessfully_default, past, 'helpsomeone unsuccessfully-default').
action_verb(helpsomeone_unsuccessfully_default, present, 'helpsomeone unsuccessfully-default').
action_target_type(helpsomeone_unsuccessfully_default, other).
action_requires_target(helpsomeone_unsuccessfully_default).
action_range(helpsomeone_unsuccessfully_default, 5).
action_effect(helpsomeone_unsuccessfully_default, (modify_network(Target, Actor, affinity, -, 5))).
can_perform(Actor, helpsomeone_unsuccessfully_default, Target) :- true.

%% devout_refuses_to_help_poor_desperate_virtuous
% Action: devout refuses to help poor desperate virtuous
% Source: Ensemble / social-helping

action(devout_refuses_to_help_poor_desperate_virtuous, 'devout refuses to help poor desperate virtuous', social, 1).
action_difficulty(devout_refuses_to_help_poor_desperate_virtuous, 0.5).
action_duration(devout_refuses_to_help_poor_desperate_virtuous, 1).
action_category(devout_refuses_to_help_poor_desperate_virtuous, social_helping).
action_source(devout_refuses_to_help_poor_desperate_virtuous, ensemble).
action_parent(devout_refuses_to_help_poor_desperate_virtuous, ask_for_a_favor).
action_verb(devout_refuses_to_help_poor_desperate_virtuous, past, 'devout refuses to help poor desperate virtuous').
action_verb(devout_refuses_to_help_poor_desperate_virtuous, present, 'devout refuses to help poor desperate virtuous').
action_target_type(devout_refuses_to_help_poor_desperate_virtuous, other).
action_requires_target(devout_refuses_to_help_poor_desperate_virtuous).
action_range(devout_refuses_to_help_poor_desperate_virtuous, 5).
action_prerequisite(devout_refuses_to_help_poor_desperate_virtuous, (trait(Actor, virtuous))).
action_prerequisite(devout_refuses_to_help_poor_desperate_virtuous, (trait(Target, devout))).
action_prerequisite(devout_refuses_to_help_poor_desperate_virtuous, (trait(Actor, poor))).
action_prerequisite(devout_refuses_to_help_poor_desperate_virtuous, (status(Actor, upset))).
action_effect(devout_refuses_to_help_poor_desperate_virtuous, (modify_network(Target, Actor, affinity, -, 10))).
action_effect(devout_refuses_to_help_poor_desperate_virtuous, (ensemble_effect(Actor, resentful of, true))).
action_effect(devout_refuses_to_help_poor_desperate_virtuous, (assert(status(Actor, embarrassed)))).
action_effect(devout_refuses_to_help_poor_desperate_virtuous, (modify_attribute(Actor, self-assuredness, -, 10))).
action_effect(devout_refuses_to_help_poor_desperate_virtuous, (ensemble_effect(Target, resentful of, true))).
% Can Actor perform this action?
can_perform(Actor, devout_refuses_to_help_poor_desperate_virtuous, Target) :-
    trait(Actor, virtuous),
    trait(Target, devout),
    trait(Actor, poor),
    status(Actor, upset).

%% askforfavor_successfully
% Action: askforfavor successfully
% Source: Ensemble / social-helping

action(askforfavor_successfully, 'askforfavor successfully', social, 1).
action_difficulty(askforfavor_successfully, 0.5).
action_duration(askforfavor_successfully, 1).
action_category(askforfavor_successfully, social_helping).
action_source(askforfavor_successfully, ensemble).
action_parent(askforfavor_successfully, ask_for_a_favor).
action_verb(askforfavor_successfully, past, 'askforfavor successfully').
action_verb(askforfavor_successfully, present, 'askforfavor successfully').
action_target_type(askforfavor_successfully, other).
action_requires_target(askforfavor_successfully).
action_range(askforfavor_successfully, 5).
action_is_accept(askforfavor_successfully).
action_effect(askforfavor_successfully, (assert(relationship(Actor, Target, ally)))).
can_perform(Actor, askforfavor_successfully, Target) :- true.

%% askforfavor_unsuccessfully
% Action: askforfavor unsuccessfully
% Source: Ensemble / social-helping

action(askforfavor_unsuccessfully, 'askforfavor unsuccessfully', social, 1).
action_difficulty(askforfavor_unsuccessfully, 0.5).
action_duration(askforfavor_unsuccessfully, 1).
action_category(askforfavor_unsuccessfully, social_helping).
action_source(askforfavor_unsuccessfully, ensemble).
action_parent(askforfavor_unsuccessfully, ask_for_a_favor).
action_verb(askforfavor_unsuccessfully, past, 'askforfavor unsuccessfully').
action_verb(askforfavor_unsuccessfully, present, 'askforfavor unsuccessfully').
action_target_type(askforfavor_unsuccessfully, other).
action_requires_target(askforfavor_unsuccessfully).
action_range(askforfavor_unsuccessfully, 5).
action_effect(askforfavor_unsuccessfully, (retract(relationship(Actor, Target, ally)))).
can_perform(Actor, askforfavor_unsuccessfully, Target) :- true.

%% intervene_between_a_and_b_in_favor_of_a
% Action: intervene between a and b in favor of a
% Source: Ensemble / social-helping

action(intervene_between_a_and_b_in_favor_of_a, 'intervene between a and b in favor of a', social, 1).
action_difficulty(intervene_between_a_and_b_in_favor_of_a, 0.5).
action_duration(intervene_between_a_and_b_in_favor_of_a, 1).
action_category(intervene_between_a_and_b_in_favor_of_a, social_helping).
action_source(intervene_between_a_and_b_in_favor_of_a, ensemble).
action_verb(intervene_between_a_and_b_in_favor_of_a, past, 'intervene between a and b in favor of a').
action_verb(intervene_between_a_and_b_in_favor_of_a, present, 'intervene between a and b in favor of a').
action_target_type(intervene_between_a_and_b_in_favor_of_a, other).
action_requires_target(intervene_between_a_and_b_in_favor_of_a).
action_range(intervene_between_a_and_b_in_favor_of_a, 5).
action_is_accept(intervene_between_a_and_b_in_favor_of_a).
action_prerequisite(intervene_between_a_and_b_in_favor_of_a, (relationship(Actor, Target, friends))).
action_prerequisite(intervene_between_a_and_b_in_favor_of_a, (ensemble_condition(Target, threatened by, true))).
action_effect(intervene_between_a_and_b_in_favor_of_a, (assert(relationship(Actor, Target, ally)))).
action_effect(intervene_between_a_and_b_in_favor_of_a, (modify_network('third', Actor, affinity, -, 5))).
action_effect(intervene_between_a_and_b_in_favor_of_a, (modify_network(Target, Actor, affinity, +, 5))).
% Can Actor perform this action?
can_perform(Actor, intervene_between_a_and_b_in_favor_of_a, Target) :-
    relationship(Actor, Target, friends),
    ensemble_condition(Target, threatened by, true).

%% help_withheld_because_person_unable_to_pay
% Action: help withheld because person unable to pay
% Source: Ensemble / social-helping

action(help_withheld_because_person_unable_to_pay, 'help withheld because person unable to pay', social, 1).
action_difficulty(help_withheld_because_person_unable_to_pay, 0.5).
action_duration(help_withheld_because_person_unable_to_pay, 1).
action_category(help_withheld_because_person_unable_to_pay, social_helping).
action_source(help_withheld_because_person_unable_to_pay, ensemble).
action_verb(help_withheld_because_person_unable_to_pay, past, 'help withheld because person unable to pay').
action_verb(help_withheld_because_person_unable_to_pay, present, 'help withheld because person unable to pay').
action_target_type(help_withheld_because_person_unable_to_pay, self).
can_perform(Actor, help_withheld_because_person_unable_to_pay) :- true.

%% follow_advice_and_break_up
% Action: follow advice and break up
% Source: Ensemble / social-helping

action(follow_advice_and_break_up, 'follow advice and break up', social, 1).
action_difficulty(follow_advice_and_break_up, 0.5).
action_duration(follow_advice_and_break_up, 1).
action_category(follow_advice_and_break_up, social_helping).
action_source(follow_advice_and_break_up, ensemble).
action_verb(follow_advice_and_break_up, past, 'follow advice and break up').
action_verb(follow_advice_and_break_up, present, 'follow advice and break up').
action_target_type(follow_advice_and_break_up, other).
action_requires_target(follow_advice_and_break_up).
action_range(follow_advice_and_break_up, 5).
action_is_accept(follow_advice_and_break_up).
action_prerequisite(follow_advice_and_break_up, (relationship(Actor, Target, lovers))).
action_prerequisite(follow_advice_and_break_up, (relationship(Actor, Someone, ally))).
action_prerequisite(follow_advice_and_break_up, (relationship(Actor, Someone, esteem))).
action_prerequisite(follow_advice_and_break_up, (network(Someone, Target, affinity, V), V < 30)).
action_effect(follow_advice_and_break_up, (retract(relationship(Actor, Target, lovers)))).
action_effect(follow_advice_and_break_up, (assert(status(Target, upset)))).
% Can Actor perform this action?
can_perform(Actor, follow_advice_and_break_up, Target) :-
    relationship(Actor, Target, lovers),
    relationship(Actor, Someone, ally),
    relationship(Actor, Someone, esteem),
    network(Someone, Target, affinity, V), V < 30.

%% ═══════════════════════════════════════════════════════════
%% Category: status-related
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: status-related
%% Source: data/ensemble/actions/status-related.json
%% Converted: 2026-04-01T20:15:17.351Z
%% Total actions: 3

%% dressing_up_compared_to_one_s_social_rank
% Action: dressing up compared to one’s social rank
% Source: Ensemble / status-related

action(dressing_up_compared_to_one_s_social_rank, 'dressing up compared to one''s social rank', social, 1).
action_difficulty(dressing_up_compared_to_one_s_social_rank, 0.5).
action_duration(dressing_up_compared_to_one_s_social_rank, 1).
action_category(dressing_up_compared_to_one_s_social_rank, status_related).
action_source(dressing_up_compared_to_one_s_social_rank, ensemble).
action_verb(dressing_up_compared_to_one_s_social_rank, past, 'dressing up compared to one''s social rank').
action_verb(dressing_up_compared_to_one_s_social_rank, present, 'dressing up compared to one''s social rank').
action_target_type(dressing_up_compared_to_one_s_social_rank, other).
action_requires_target(dressing_up_compared_to_one_s_social_rank).
action_range(dressing_up_compared_to_one_s_social_rank, 5).
action_is_accept(dressing_up_compared_to_one_s_social_rank).
action_prerequisite(dressing_up_compared_to_one_s_social_rank, (trait(Actor, provincial))).
action_prerequisite(dressing_up_compared_to_one_s_social_rank, (ensemble_condition(Actor, financially dependent on, true))).
action_prerequisite(dressing_up_compared_to_one_s_social_rank, (relationship(Actor, Target, married))).
action_prerequisite(dressing_up_compared_to_one_s_social_rank, (trait(Actor, elegantly dressed))).
action_prerequisite(dressing_up_compared_to_one_s_social_rank, (trait(Actor, wearing a first responder uniform))).
action_prerequisite(dressing_up_compared_to_one_s_social_rank, (trait(Target, attendee))).
action_prerequisite(dressing_up_compared_to_one_s_social_rank, (\+ trait(Target, poor))).
action_prerequisite(dressing_up_compared_to_one_s_social_rank, (\+ trait(Target, provincial))).
action_effect(dressing_up_compared_to_one_s_social_rank, (modify_network(Actor, 'other', credibility, +, 10))).
action_effect(dressing_up_compared_to_one_s_social_rank, (modify_attribute(Actor, self-assuredness, +, 10))).
action_effect(dressing_up_compared_to_one_s_social_rank, (modify_network(Target, Actor, affinity, +, 3))).
action_effect(dressing_up_compared_to_one_s_social_rank, (modify_attribute(Actor, social standing, +, 5))).
action_effect(dressing_up_compared_to_one_s_social_rank, (modify_attribute(Actor, charisma, +, 10))).
action_effect(dressing_up_compared_to_one_s_social_rank, (modify_network('other', Actor, affinity, +, 3))).
% Can Actor perform this action?
can_perform(Actor, dressing_up_compared_to_one_s_social_rank, Target) :-
    trait(Actor, provincial),
    ensemble_condition(Actor, financially dependent on, true),
    relationship(Actor, Target, married),
    trait(Actor, elegantly dressed),
    trait(Actor, wearing a first responder uniform),
    trait(Target, attendee),
    \+ trait(Target, poor),
    \+ trait(Target, provincial).

%% insist_on_low_status_to_drive_off_high_status_lover
% Action: insist on low status to drive off high status lover
% Source: Ensemble / status-related

action(insist_on_low_status_to_drive_off_high_status_lover, 'insist on low status to drive off high status lover', social, 1).
action_difficulty(insist_on_low_status_to_drive_off_high_status_lover, 0.5).
action_duration(insist_on_low_status_to_drive_off_high_status_lover, 1).
action_category(insist_on_low_status_to_drive_off_high_status_lover, status_related).
action_source(insist_on_low_status_to_drive_off_high_status_lover, ensemble).
action_verb(insist_on_low_status_to_drive_off_high_status_lover, past, 'insist on low status to drive off high status lover').
action_verb(insist_on_low_status_to_drive_off_high_status_lover, present, 'insist on low status to drive off high status lover').
action_target_type(insist_on_low_status_to_drive_off_high_status_lover, other).
action_requires_target(insist_on_low_status_to_drive_off_high_status_lover).
action_range(insist_on_low_status_to_drive_off_high_status_lover, 5).
action_prerequisite(insist_on_low_status_to_drive_off_high_status_lover, (\+ trait(Actor, rich))).
action_prerequisite(insist_on_low_status_to_drive_off_high_status_lover, (trait(Target, rich))).
action_prerequisite(insist_on_low_status_to_drive_off_high_status_lover, (trait(Actor, virtuous))).
action_prerequisite(insist_on_low_status_to_drive_off_high_status_lover, (attribute(Actor, sensitiveness, V), V > 50)).
action_effect(insist_on_low_status_to_drive_off_high_status_lover, (modify_network(Target, Actor, affinity, +, 10))).
action_effect(insist_on_low_status_to_drive_off_high_status_lover, (modify_network(Target, Actor, curiosity, +, 10))).
action_effect(insist_on_low_status_to_drive_off_high_status_lover, (modify_attribute(Actor, charisma, +, 5))).
action_effect(insist_on_low_status_to_drive_off_high_status_lover, (assert(status(Actor, flattered)))).
% Can Actor perform this action?
can_perform(Actor, insist_on_low_status_to_drive_off_high_status_lover, Target) :-
    \+ trait(Actor, rich),
    trait(Target, rich),
    trait(Actor, virtuous),
    attribute(Actor, sensitiveness, V), V > 50.

%% dress_up_as_stranger
% Action: dress up as stranger
% Source: Ensemble / status-related

action(dress_up_as_stranger, 'dress up as stranger', social, 1).
action_difficulty(dress_up_as_stranger, 0.5).
action_duration(dress_up_as_stranger, 1).
action_category(dress_up_as_stranger, status_related).
action_source(dress_up_as_stranger, ensemble).
action_verb(dress_up_as_stranger, past, 'dress up as stranger').
action_verb(dress_up_as_stranger, present, 'dress up as stranger').
action_target_type(dress_up_as_stranger, other).
action_requires_target(dress_up_as_stranger).
action_range(dress_up_as_stranger, 5).
action_prerequisite(dress_up_as_stranger, (trait(Actor, eccentric))).
action_prerequisite(dress_up_as_stranger, (trait(Actor, male))).
action_prerequisite(dress_up_as_stranger, (trait(Target, female))).
action_prerequisite(dress_up_as_stranger, (\+ trait(Target, eccentric))).
action_prerequisite(dress_up_as_stranger, (relationship(Target, Actor, strangers))).
action_effect(dress_up_as_stranger, (modify_network(Target, Actor, affinity, -, 5))).
action_effect(dress_up_as_stranger, (ensemble_effect(Actor, made a faux pas around, true))).
% Can Actor perform this action?
can_perform(Actor, dress_up_as_stranger, Target) :-
    trait(Actor, eccentric),
    trait(Actor, male),
    trait(Target, female),
    \+ trait(Target, eccentric),
    relationship(Target, Actor, strangers).

%% ═══════════════════════════════════════════════════════════
%% Category: theatrical-social
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: theatrical-social
%% Source: data/ensemble/actions/theatrical-social.json
%% Converted: 2026-04-01T20:15:17.351Z
%% Total actions: 6

%% yell_something_witty_at_actor_during_play
% Action: yell something witty at actor during play
% Source: Ensemble / theatrical-social

action(yell_something_witty_at_actor_during_play, 'yell something witty at actor during play', social, 1).
action_difficulty(yell_something_witty_at_actor_during_play, 0.5).
action_duration(yell_something_witty_at_actor_during_play, 1).
action_category(yell_something_witty_at_actor_during_play, theatrical_social).
action_source(yell_something_witty_at_actor_during_play, ensemble).
action_verb(yell_something_witty_at_actor_during_play, past, 'yell something witty at actor during play').
action_verb(yell_something_witty_at_actor_during_play, present, 'yell something witty at actor during play').
action_target_type(yell_something_witty_at_actor_during_play, other).
action_requires_target(yell_something_witty_at_actor_during_play).
action_range(yell_something_witty_at_actor_during_play, 5).
action_is_accept(yell_something_witty_at_actor_during_play).
action_prerequisite(yell_something_witty_at_actor_during_play, (attribute(Actor, cultural knowledge, V), V > 50)).
action_prerequisite(yell_something_witty_at_actor_during_play, (attribute(Actor, self-assuredness, V), V > 50)).
action_prerequisite(yell_something_witty_at_actor_during_play, (trait('other', security guard))).
action_effect(yell_something_witty_at_actor_during_play, (modify_network(Target, Actor, emulation, +, 10))).
action_effect(yell_something_witty_at_actor_during_play, (modify_network('other', Actor, affinity, -, 20))).
action_effect(yell_something_witty_at_actor_during_play, (ensemble_effect(Target, ridicules, true))).
% Can Actor perform this action?
can_perform(Actor, yell_something_witty_at_actor_during_play, Target) :-
    attribute(Actor, cultural knowledge, V), V > 50,
    attribute(Actor, self-assuredness, V), V > 50,
    trait('other', security guard).

%% refrain_from_yelling_something_witty_at_actor_during_play
% Action: refrain from yelling something witty at actor during play
% Source: Ensemble / theatrical-social

action(refrain_from_yelling_something_witty_at_actor_during_play, 'refrain from yelling something witty at actor during play', social, 1).
action_difficulty(refrain_from_yelling_something_witty_at_actor_during_play, 0.5).
action_duration(refrain_from_yelling_something_witty_at_actor_during_play, 1).
action_category(refrain_from_yelling_something_witty_at_actor_during_play, theatrical_social).
action_source(refrain_from_yelling_something_witty_at_actor_during_play, ensemble).
action_verb(refrain_from_yelling_something_witty_at_actor_during_play, past, 'refrain from yelling something witty at actor during play').
action_verb(refrain_from_yelling_something_witty_at_actor_during_play, present, 'refrain from yelling something witty at actor during play').
action_target_type(refrain_from_yelling_something_witty_at_actor_during_play, other).
action_requires_target(refrain_from_yelling_something_witty_at_actor_during_play).
action_range(refrain_from_yelling_something_witty_at_actor_during_play, 5).
action_prerequisite(refrain_from_yelling_something_witty_at_actor_during_play, (attribute(Actor, cultural knowledge, V), V > 50)).
action_prerequisite(refrain_from_yelling_something_witty_at_actor_during_play, (attribute(Actor, propriety, V), V > 50)).
action_prerequisite(refrain_from_yelling_something_witty_at_actor_during_play, (trait(Target, security guard))).
action_prerequisite(refrain_from_yelling_something_witty_at_actor_during_play, (trait(Target, awkward))).
action_prerequisite(refrain_from_yelling_something_witty_at_actor_during_play, (attribute('other', propriety, V), V > 50)).
action_effect(refrain_from_yelling_something_witty_at_actor_during_play, (modify_network(Target, Actor, affinity, +, 10))).
action_effect(refrain_from_yelling_something_witty_at_actor_during_play, (modify_network('other', Actor, emulation, +, 5))).
action_effect(refrain_from_yelling_something_witty_at_actor_during_play, (ensemble_effect(Actor, ridicules, true))).
action_effect(refrain_from_yelling_something_witty_at_actor_during_play, (ensemble_effect('other', ridicules, true))).
action_effect(refrain_from_yelling_something_witty_at_actor_during_play, (retract(status(Actor, amused)))).
% Can Actor perform this action?
can_perform(Actor, refrain_from_yelling_something_witty_at_actor_during_play, Target) :-
    attribute(Actor, cultural knowledge, V), V > 50,
    attribute(Actor, propriety, V), V > 50,
    trait(Target, security guard),
    trait(Target, awkward),
    attribute('other', propriety, V), V > 50.

%% pay_for_someone_applauding_during_the_play
% Action: pay for someone applauding during the play
% Source: Ensemble / theatrical-social

action(pay_for_someone_applauding_during_the_play, 'pay for someone applauding during the play', social, 1).
action_difficulty(pay_for_someone_applauding_during_the_play, 0.5).
action_duration(pay_for_someone_applauding_during_the_play, 1).
action_category(pay_for_someone_applauding_during_the_play, theatrical_social).
action_source(pay_for_someone_applauding_during_the_play, ensemble).
action_verb(pay_for_someone_applauding_during_the_play, past, 'pay for someone applauding during the play').
action_verb(pay_for_someone_applauding_during_the_play, present, 'pay for someone applauding during the play').
action_target_type(pay_for_someone_applauding_during_the_play, other).
action_requires_target(pay_for_someone_applauding_during_the_play).
action_range(pay_for_someone_applauding_during_the_play, 5).
action_is_accept(pay_for_someone_applauding_during_the_play).
action_prerequisite(pay_for_someone_applauding_during_the_play, (\+ trait(Actor, poor))).
action_prerequisite(pay_for_someone_applauding_during_the_play, (\+ trait(Target, virtuous))).
action_prerequisite(pay_for_someone_applauding_during_the_play, (network(Someone, Target, emulation, V), V > 50)).
action_effect(pay_for_someone_applauding_during_the_play, (assert(trait(Target, mocking)))).
action_effect(pay_for_someone_applauding_during_the_play, (modify_network(Someone, Target, emulation, +, 3))).
action_effect(pay_for_someone_applauding_during_the_play, (ensemble_effect(Target, financially dependent on, true))).
action_effect(pay_for_someone_applauding_during_the_play, (modify_network(Target, Actor, affinity, +, 3))).
% Can Actor perform this action?
can_perform(Actor, pay_for_someone_applauding_during_the_play, Target) :-
    \+ trait(Actor, poor),
    \+ trait(Target, virtuous),
    network(Someone, Target, emulation, V), V > 50.

%% servant_starts_whistling
% Action: servant starts whistling
% Source: Ensemble / theatrical-social

action(servant_starts_whistling, 'servant starts whistling', social, 1).
action_difficulty(servant_starts_whistling, 0.5).
action_duration(servant_starts_whistling, 1).
action_category(servant_starts_whistling, theatrical_social).
action_source(servant_starts_whistling, ensemble).
action_verb(servant_starts_whistling, past, 'servant starts whistling').
action_verb(servant_starts_whistling, present, 'servant starts whistling').
action_target_type(servant_starts_whistling, other).
action_requires_target(servant_starts_whistling).
action_range(servant_starts_whistling, 5).
action_is_accept(servant_starts_whistling).
action_prerequisite(servant_starts_whistling, (trait(Actor, stagehand))).
action_prerequisite(servant_starts_whistling, (trait(Target, stagehand))).
action_prerequisite(servant_starts_whistling, (network(Actor, Target, affinity, V), V > 50)).
action_effect(servant_starts_whistling, (modify_network(Target, Actor, emulation, +, 10))).
action_effect(servant_starts_whistling, (modify_network(Actor, Target, affinity, +, 50))).
action_effect(servant_starts_whistling, (assert(status(Actor, feeling socially connected)))).
action_effect(servant_starts_whistling, (assert(status(Target, feeling socially connected)))).
action_effect(servant_starts_whistling, (assert(status(Actor, happy)))).
% Can Actor perform this action?
can_perform(Actor, servant_starts_whistling, Target) :-
    trait(Actor, stagehand),
    trait(Target, stagehand),
    network(Actor, Target, affinity, V), V > 50.

%% behave_like_the_others_at_the_theater
% Action: behave like the others at the theater
% Source: Ensemble / theatrical-social

action(behave_like_the_others_at_the_theater, 'behave like the others at the theater', social, 1).
action_difficulty(behave_like_the_others_at_the_theater, 0.5).
action_duration(behave_like_the_others_at_the_theater, 1).
action_category(behave_like_the_others_at_the_theater, theatrical_social).
action_source(behave_like_the_others_at_the_theater, ensemble).
action_verb(behave_like_the_others_at_the_theater, past, 'behave like the others at the theater').
action_verb(behave_like_the_others_at_the_theater, present, 'behave like the others at the theater').
action_target_type(behave_like_the_others_at_the_theater, other).
action_requires_target(behave_like_the_others_at_the_theater).
action_range(behave_like_the_others_at_the_theater, 5).
action_is_accept(behave_like_the_others_at_the_theater).
action_prerequisite(behave_like_the_others_at_the_theater, (attribute(Actor, cultural knowledge, V), V > 70)).
action_prerequisite(behave_like_the_others_at_the_theater, (attribute(Target, cultural knowledge, V), V < 50)).
action_effect(behave_like_the_others_at_the_theater, (modify_network(Target, Actor, emulation, +, 15))).
% Can Actor perform this action?
can_perform(Actor, behave_like_the_others_at_the_theater, Target) :-
    attribute(Actor, cultural knowledge, V), V > 70,
    attribute(Target, cultural knowledge, V), V < 50.

%% shout_criticism_at_bad_actor
% Action: shout criticism at bad actor
% Source: Ensemble / theatrical-social

action(shout_criticism_at_bad_actor, 'shout criticism at bad actor', social, 1).
action_difficulty(shout_criticism_at_bad_actor, 0.5).
action_duration(shout_criticism_at_bad_actor, 1).
action_category(shout_criticism_at_bad_actor, theatrical_social).
action_source(shout_criticism_at_bad_actor, ensemble).
action_verb(shout_criticism_at_bad_actor, past, 'shout criticism at bad actor').
action_verb(shout_criticism_at_bad_actor, present, 'shout criticism at bad actor').
action_target_type(shout_criticism_at_bad_actor, other).
action_requires_target(shout_criticism_at_bad_actor).
action_range(shout_criticism_at_bad_actor, 5).
action_is_accept(shout_criticism_at_bad_actor).
action_prerequisite(shout_criticism_at_bad_actor, (attribute(Actor, cultural knowledge, V), V > 50)).
action_prerequisite(shout_criticism_at_bad_actor, (trait(Target, security guard))).
action_prerequisite(shout_criticism_at_bad_actor, (trait(Target, awkward))).
action_effect(shout_criticism_at_bad_actor, (modify_network(Target, Actor, affinity, -, 20))).
action_effect(shout_criticism_at_bad_actor, (retract(relationship(Target, Actor, esteem)))).
% Can Actor perform this action?
can_perform(Actor, shout_criticism_at_bad_actor, Target) :-
    attribute(Actor, cultural knowledge, V), V > 50,
    trait(Target, security guard),
    trait(Target, awkward).

%% ═══════════════════════════════════════════════════════════
%% Category: trust-building
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: trust-building
%% Source: data/ensemble/actions/trust-building.json
%% Converted: 2026-04-01T20:15:17.351Z
%% Total actions: 15

%% be_candid
% Action: BE CANDID
% Source: Ensemble / trust-building

action(be_candid, 'BE CANDID', social, 1).
action_difficulty(be_candid, 0.5).
action_duration(be_candid, 1).
action_category(be_candid, trust_building).
action_source(be_candid, ensemble).
action_verb(be_candid, past, 'be candid').
action_verb(be_candid, present, 'be candid').
action_target_type(be_candid, self).
action_leads_to(be_candid, show_off_knowledge_through_small_talk).
action_leads_to(be_candid, x_thinks_they_know_what_y_knows_and_more).
action_leads_to(be_candid, humorous_recitation).
action_leads_to(be_candid, perform_a_playful_recitation).
action_leads_to(be_candid, don_t_really_engage_with_joke_but_show_off).
action_leads_to(be_candid, be_self_congratulatory).
action_leads_to(be_candid, pretend_to_understand).
action_leads_to(be_candid, one_up_them).
action_leads_to(be_candid, brag_about_something_you_ve_done).
action_leads_to(be_candid, make_them_see_how_awesome_you_are).
action_leads_to(be_candid, leave_while_bragging_about_self).
can_perform(Actor, be_candid) :- true.

%% act_trustingly
% Action: ACT TRUSTINGLY
% Source: Ensemble / trust-building

action(act_trustingly, 'ACT TRUSTINGLY', social, 1).
action_difficulty(act_trustingly, 0.5).
action_duration(act_trustingly, 1).
action_category(act_trustingly, trust_building).
action_source(act_trustingly, ensemble).
action_verb(act_trustingly, past, 'act trustingly').
action_verb(act_trustingly, present, 'act trustingly').
action_target_type(act_trustingly, self).
action_leads_to(act_trustingly, backhanded_compliment).
action_leads_to(act_trustingly, has_thing).
action_leads_to(act_trustingly, begrudgingly_refuse_to_acquire_thing).
action_leads_to(act_trustingly, misunderstand_insult_trustingly_action).
can_perform(Actor, act_trustingly) :- true.

%% be_candid
% Action: BE CANDID
% Source: Ensemble / trust-building

action(be_candid, 'BE CANDID', social, 1).
action_difficulty(be_candid, 0.5).
action_duration(be_candid, 1).
action_category(be_candid, trust_building).
action_source(be_candid, ensemble).
action_verb(be_candid, past, 'be candid').
action_verb(be_candid, present, 'be candid').
action_target_type(be_candid, self).
action_leads_to(be_candid, politely_ask_for_something_in_exchange).
can_perform(Actor, be_candid) :- true.

%% act_trustworthy
% Action: ACT TRUSTWORTHY
% Source: Ensemble / trust-building

action(act_trustworthy, 'ACT TRUSTWORTHY', social, 1).
action_difficulty(act_trustworthy, 0.5).
action_duration(act_trustworthy, 1).
action_category(act_trustworthy, trust_building).
action_source(act_trustworthy, ensemble).
action_verb(act_trustworthy, past, 'act trustworthy').
action_verb(act_trustworthy, present, 'act trustworthy').
action_target_type(act_trustworthy, self).
action_leads_to(act_trustworthy, raise_trust_1).
action_leads_to(act_trustworthy, raise_trust_2).
action_leads_to(act_trustworthy, raise_trust_3).
action_leads_to(act_trustworthy, raise_trust_4).
can_perform(Actor, act_trustworthy) :- true.

%% swear_oath
% Action: SWEAR OATH
% Source: Ensemble / trust-building

action(swear_oath, 'SWEAR OATH', social, 1).
action_difficulty(swear_oath, 0.5).
action_duration(swear_oath, 1).
action_category(swear_oath, trust_building).
action_source(swear_oath, ensemble).
action_verb(swear_oath, past, 'swear oath').
action_verb(swear_oath, present, 'swear oath').
action_target_type(swear_oath, self).
action_leads_to(swear_oath, swearoathsuccess).
action_leads_to(swear_oath, swearoathfail).
can_perform(Actor, swear_oath) :- true.

%% tell_the_truth
% Action: TELL THE TRUTH
% Source: Ensemble / trust-building

action(tell_the_truth, 'TELL THE TRUTH', social, 1).
action_difficulty(tell_the_truth, 0.5).
action_duration(tell_the_truth, 1).
action_category(tell_the_truth, trust_building).
action_source(tell_the_truth, ensemble).
action_verb(tell_the_truth, past, 'tell the truth').
action_verb(tell_the_truth, present, 'tell the truth').
action_target_type(tell_the_truth, self).
action_leads_to(tell_the_truth, true_but_partial_explanation_turns_into_open_conflict).
action_leads_to(tell_the_truth, virtuous_tells_clergy_of_being_preyed_upon_is_disbelieved_by_devout).
action_leads_to(tell_the_truth, admit_that_you_are_of_low_status_despite_virtue_comportment).
action_leads_to(tell_the_truth, confess_true_virtuous_feelings).
action_leads_to(tell_the_truth, tell_truth_successfully).
action_leads_to(tell_the_truth, tell_truth_unsuccessfully).
can_perform(Actor, tell_the_truth) :- true.

%% raise_trust_4
% Action: raise trust 4
% Source: Ensemble / trust-building

action(raise_trust_4, 'raise trust 4', social, 1).
action_difficulty(raise_trust_4, 0.5).
action_duration(raise_trust_4, 1).
action_category(raise_trust_4, trust_building).
action_source(raise_trust_4, ensemble).
action_parent(raise_trust_4, act_trustworthy).
action_verb(raise_trust_4, past, 'raise trust 4').
action_verb(raise_trust_4, present, 'raise trust 4').
action_target_type(raise_trust_4, other).
action_requires_target(raise_trust_4).
action_range(raise_trust_4, 5).
action_is_accept(raise_trust_4).
action_effect(raise_trust_4, (modify_network(Target, Actor, trust, +, 10))).
can_perform(Actor, raise_trust_4, Target) :- true.

%% raise_trust_1
% Action: raise trust 1
% Source: Ensemble / trust-building

action(raise_trust_1, 'raise trust 1', social, 1).
action_difficulty(raise_trust_1, 0.5).
action_duration(raise_trust_1, 1).
action_category(raise_trust_1, trust_building).
action_source(raise_trust_1, ensemble).
action_parent(raise_trust_1, act_trustworthy).
action_verb(raise_trust_1, past, 'raise trust 1').
action_verb(raise_trust_1, present, 'raise trust 1').
action_target_type(raise_trust_1, other).
action_requires_target(raise_trust_1).
action_range(raise_trust_1, 5).
action_is_accept(raise_trust_1).
action_effect(raise_trust_1, (modify_network(Target, Actor, trust, +, 100))).
can_perform(Actor, raise_trust_1, Target) :- true.

%% raise_trust_2
% Action: raise trust 2
% Source: Ensemble / trust-building

action(raise_trust_2, 'raise trust 2', social, 1).
action_difficulty(raise_trust_2, 0.5).
action_duration(raise_trust_2, 1).
action_category(raise_trust_2, trust_building).
action_source(raise_trust_2, ensemble).
action_parent(raise_trust_2, act_trustworthy).
action_verb(raise_trust_2, past, 'raise trust 2').
action_verb(raise_trust_2, present, 'raise trust 2').
action_target_type(raise_trust_2, other).
action_requires_target(raise_trust_2).
action_range(raise_trust_2, 5).
action_is_accept(raise_trust_2).
action_effect(raise_trust_2, (modify_network(Target, Actor, trust, +, 100))).
action_influence(raise_trust_2, (influence(unknown, _, _, weight, +, 0))).
can_perform(Actor, raise_trust_2, Target) :- true.

%% raise_trust_3
% Action: raise trust 3
% Source: Ensemble / trust-building

action(raise_trust_3, 'raise trust 3', social, 1).
action_difficulty(raise_trust_3, 0.5).
action_duration(raise_trust_3, 1).
action_category(raise_trust_3, trust_building).
action_source(raise_trust_3, ensemble).
action_parent(raise_trust_3, act_trustworthy).
action_verb(raise_trust_3, past, 'raise trust 3').
action_verb(raise_trust_3, present, 'raise trust 3').
action_target_type(raise_trust_3, other).
action_requires_target(raise_trust_3).
action_range(raise_trust_3, 5).
action_is_accept(raise_trust_3).
action_effect(raise_trust_3, (modify_network(Target, Actor, trust, +, 100))).
action_influence(raise_trust_3, (influence(unknown, _, _, weight, +, 0))).
can_perform(Actor, raise_trust_3, Target) :- true.

%% swearoathsuccess
% Action: Swear Oath <SUCCESS>
% Source: Ensemble / trust-building

action(swearoathsuccess, 'Swear Oath <SUCCESS>', social, 1).
action_difficulty(swearoathsuccess, 0.5).
action_duration(swearoathsuccess, 1).
action_category(swearoathsuccess, trust_building).
action_source(swearoathsuccess, ensemble).
action_parent(swearoathsuccess, swear_oath).
action_verb(swearoathsuccess, past, 'swearoathsuccess').
action_verb(swearoathsuccess, present, 'swearoathsuccess').
action_target_type(swearoathsuccess, other).
action_requires_target(swearoathsuccess).
action_range(swearoathsuccess, 5).
action_effect(swearoathsuccess, (modify_bond(Actor, Target, kinship, +, 2))).
can_perform(Actor, swearoathsuccess, Target) :- true.

%% swearoathfail
% Action: Swear Oath <FAIL>
% Source: Ensemble / trust-building

action(swearoathfail, 'Swear Oath <FAIL>', social, 1).
action_difficulty(swearoathfail, 0.5).
action_duration(swearoathfail, 1).
action_category(swearoathfail, trust_building).
action_source(swearoathfail, ensemble).
action_parent(swearoathfail, swear_oath).
action_verb(swearoathfail, past, 'swearoathfail').
action_verb(swearoathfail, present, 'swearoathfail').
action_target_type(swearoathfail, other).
action_requires_target(swearoathfail).
action_range(swearoathfail, 5).
action_effect(swearoathfail, (modify_bond(Actor, Target, kinship, -, 1))).
can_perform(Actor, swearoathfail, Target) :- true.

%% tell_truth_successfully
% Action: tell truth successfully
% Source: Ensemble / trust-building

action(tell_truth_successfully, 'tell truth successfully', social, 1).
action_difficulty(tell_truth_successfully, 0.5).
action_duration(tell_truth_successfully, 1).
action_category(tell_truth_successfully, trust_building).
action_source(tell_truth_successfully, ensemble).
action_parent(tell_truth_successfully, tell_the_truth).
action_verb(tell_truth_successfully, past, 'tell truth successfully').
action_verb(tell_truth_successfully, present, 'tell truth successfully').
action_target_type(tell_truth_successfully, self).
action_is_accept(tell_truth_successfully).
can_perform(Actor, tell_truth_successfully) :- true.

%% tell_truth_unsuccessfully
% Action: tell truth unsuccessfully
% Source: Ensemble / trust-building

action(tell_truth_unsuccessfully, 'tell truth unsuccessfully', social, 1).
action_difficulty(tell_truth_unsuccessfully, 0.5).
action_duration(tell_truth_unsuccessfully, 1).
action_category(tell_truth_unsuccessfully, trust_building).
action_source(tell_truth_unsuccessfully, ensemble).
action_parent(tell_truth_unsuccessfully, tell_the_truth).
action_verb(tell_truth_unsuccessfully, past, 'tell truth unsuccessfully').
action_verb(tell_truth_unsuccessfully, present, 'tell truth unsuccessfully').
action_target_type(tell_truth_unsuccessfully, other).
action_requires_target(tell_truth_unsuccessfully).
action_range(tell_truth_unsuccessfully, 5).
action_effect(tell_truth_unsuccessfully, (modify_network(Target, Actor, credibility, -, 5))).
can_perform(Actor, tell_truth_unsuccessfully, Target) :- true.

%% move_listeners_to_tears_through_honesty_virtue
% Action: move listeners to tears through honesty, virtue
% Source: Ensemble / trust-building

action(move_listeners_to_tears_through_honesty_virtue, 'move listeners to tears through honesty, virtue', social, 1).
action_difficulty(move_listeners_to_tears_through_honesty_virtue, 0.5).
action_duration(move_listeners_to_tears_through_honesty_virtue, 1).
action_category(move_listeners_to_tears_through_honesty_virtue, trust_building).
action_source(move_listeners_to_tears_through_honesty_virtue, ensemble).
action_verb(move_listeners_to_tears_through_honesty_virtue, past, 'move listeners to tears through honesty, virtue').
action_verb(move_listeners_to_tears_through_honesty_virtue, present, 'move listeners to tears through honesty, virtue').
action_target_type(move_listeners_to_tears_through_honesty_virtue, other).
action_requires_target(move_listeners_to_tears_through_honesty_virtue).
action_range(move_listeners_to_tears_through_honesty_virtue, 5).
action_is_accept(move_listeners_to_tears_through_honesty_virtue).
action_prerequisite(move_listeners_to_tears_through_honesty_virtue, (trait(Actor, virtuous))).
action_prerequisite(move_listeners_to_tears_through_honesty_virtue, (network(Target, Actor, affinity, V), V > 50)).
action_prerequisite(move_listeners_to_tears_through_honesty_virtue, (trait(Target, virtuous))).
action_effect(move_listeners_to_tears_through_honesty_virtue, (modify_attribute(Target, sensitiveness, +, 10))).
action_effect(move_listeners_to_tears_through_honesty_virtue, (modify_network(Actor, Target, affinity, +, 10))).
action_effect(move_listeners_to_tears_through_honesty_virtue, (assert(relationship(Target, Actor, esteem)))).
action_effect(move_listeners_to_tears_through_honesty_virtue, (assert(status(Actor, feeling socially connected)))).
% Can Actor perform this action?
can_perform(Actor, move_listeners_to_tears_through_honesty_virtue, Target) :-
    trait(Actor, virtuous),
    network(Target, Actor, affinity, V), V > 50,
    trait(Target, virtuous).

%% ═══════════════════════════════════════════════════════════
%% Category: virtue-morality
%% ═══════════════════════════════════════════════════════════

%% Ensemble Actions: virtue-morality
%% Source: data/ensemble/actions/virtue-morality.json
%% Converted: 2026-04-01T20:15:17.351Z
%% Total actions: 7

%% apologize
% Action: APOLOGIZE
% Source: Ensemble / virtue-morality

action(apologize, 'APOLOGIZE', social, 1).
action_difficulty(apologize, 0.5).
action_duration(apologize, 1).
action_category(apologize, virtue_morality).
action_source(apologize, ensemble).
action_verb(apologize, past, 'apologize').
action_verb(apologize, present, 'apologize').
action_target_type(apologize, self).
action_leads_to(apologize, apologize_successfully).
action_leads_to(apologize, apologize_unsuccessfully).
can_perform(Actor, apologize) :- true.

%% admit_that_you_are_of_low_status_despite_virtue_comportment
% Action: admit that you are of low status despite virtue & comportment
% Source: Ensemble / virtue-morality

action(admit_that_you_are_of_low_status_despite_virtue_comportment, 'admit that you are of low status despite virtue & comportment', social, 1).
action_difficulty(admit_that_you_are_of_low_status_despite_virtue_comportment, 0.5).
action_duration(admit_that_you_are_of_low_status_despite_virtue_comportment, 1).
action_category(admit_that_you_are_of_low_status_despite_virtue_comportment, virtue_morality).
action_source(admit_that_you_are_of_low_status_despite_virtue_comportment, ensemble).
action_verb(admit_that_you_are_of_low_status_despite_virtue_comportment, past, 'admit that you are of low status despite virtue & comportment').
action_verb(admit_that_you_are_of_low_status_despite_virtue_comportment, present, 'admit that you are of low status despite virtue & comportment').
action_target_type(admit_that_you_are_of_low_status_despite_virtue_comportment, other).
action_requires_target(admit_that_you_are_of_low_status_despite_virtue_comportment).
action_range(admit_that_you_are_of_low_status_despite_virtue_comportment, 5).
action_is_accept(admit_that_you_are_of_low_status_despite_virtue_comportment).
action_prerequisite(admit_that_you_are_of_low_status_despite_virtue_comportment, (trait(Actor, virtuous))).
action_prerequisite(admit_that_you_are_of_low_status_despite_virtue_comportment, (\+ trait(Actor, rich))).
action_prerequisite(admit_that_you_are_of_low_status_despite_virtue_comportment, (trait(Target, rich))).
action_prerequisite(admit_that_you_are_of_low_status_despite_virtue_comportment, (trait(Target, virtuous))).
action_effect(admit_that_you_are_of_low_status_despite_virtue_comportment, (modify_network(Actor, Target, credibility, +, 10))).
action_effect(admit_that_you_are_of_low_status_despite_virtue_comportment, (modify_network(Target, Actor, affinity, +, 10))).
action_effect(admit_that_you_are_of_low_status_despite_virtue_comportment, (ensemble_effect(Target, cares for, true))).
action_effect(admit_that_you_are_of_low_status_despite_virtue_comportment, (modify_attribute(Actor, social standing, +, 5))).
% Can Actor perform this action?
can_perform(Actor, admit_that_you_are_of_low_status_despite_virtue_comportment, Target) :-
    trait(Actor, virtuous),
    \+ trait(Actor, rich),
    trait(Target, rich),
    trait(Target, virtuous).

%% apologize_successfully
% Action: apologize successfully
% Source: Ensemble / virtue-morality

action(apologize_successfully, 'apologize successfully', social, 1).
action_difficulty(apologize_successfully, 0.5).
action_duration(apologize_successfully, 1).
action_category(apologize_successfully, virtue_morality).
action_source(apologize_successfully, ensemble).
action_parent(apologize_successfully, apologize).
action_verb(apologize_successfully, past, 'apologize successfully').
action_verb(apologize_successfully, present, 'apologize successfully').
action_target_type(apologize_successfully, other).
action_requires_target(apologize_successfully).
action_range(apologize_successfully, 5).
action_is_accept(apologize_successfully).
action_effect(apologize_successfully, (retract(relationship(Actor, Target, rivals)))).
can_perform(Actor, apologize_successfully, Target) :- true.

%% apologize_unsuccessfully
% Action: apologize unsuccessfully
% Source: Ensemble / virtue-morality

action(apologize_unsuccessfully, 'apologize unsuccessfully', social, 1).
action_difficulty(apologize_unsuccessfully, 0.5).
action_duration(apologize_unsuccessfully, 1).
action_category(apologize_unsuccessfully, virtue_morality).
action_source(apologize_unsuccessfully, ensemble).
action_parent(apologize_unsuccessfully, apologize).
action_verb(apologize_unsuccessfully, past, 'apologize unsuccessfully').
action_verb(apologize_unsuccessfully, present, 'apologize unsuccessfully').
action_target_type(apologize_unsuccessfully, other).
action_requires_target(apologize_unsuccessfully).
action_range(apologize_unsuccessfully, 5).
action_effect(apologize_unsuccessfully, (assert(relationship(Actor, Target, rivals)))).
can_perform(Actor, apologize_unsuccessfully, Target) :- true.

%% honorable_villager_could_you_please_tell_me_where_the_water_is
% Action: Honorable villager, could you please tell me where the water is?
% Source: Ensemble / virtue-morality

action(honorable_villager_could_you_please_tell_me_where_the_water_is, 'Honorable villager, could you please tell me where the water is?', social, 1).
action_difficulty(honorable_villager_could_you_please_tell_me_where_the_water_is, 0.5).
action_duration(honorable_villager_could_you_please_tell_me_where_the_water_is, 1).
action_category(honorable_villager_could_you_please_tell_me_where_the_water_is, virtue_morality).
action_source(honorable_villager_could_you_please_tell_me_where_the_water_is, ensemble).
action_verb(honorable_villager_could_you_please_tell_me_where_the_water_is, past, 'honorable villager, could you please tell me where the water is?').
action_verb(honorable_villager_could_you_please_tell_me_where_the_water_is, present, 'honorable villager, could you please tell me where the water is?').
action_target_type(honorable_villager_could_you_please_tell_me_where_the_water_is, other).
action_requires_target(honorable_villager_could_you_please_tell_me_where_the_water_is).
action_range(honorable_villager_could_you_please_tell_me_where_the_water_is, 5).
action_effect(honorable_villager_could_you_please_tell_me_where_the_water_is, (ensemble_effect(Actor, respectful, true))).
can_perform(Actor, honorable_villager_could_you_please_tell_me_where_the_water_is, Target) :- true.

%% apologize
% Action: Apologize
% Source: Ensemble / virtue-morality

action(apologize, 'Apologize', social, 1).
action_difficulty(apologize, 0.5).
action_duration(apologize, 1).
action_category(apologize, virtue_morality).
action_source(apologize, ensemble).
action_verb(apologize, past, 'apologize').
action_verb(apologize, present, 'apologize').
action_target_type(apologize, self).
can_perform(Actor, apologize) :- true.

%% apologize_for_misunderstanding
% Action: Apologize for misunderstanding
% Source: Ensemble / virtue-morality

action(apologize_for_misunderstanding, 'Apologize for misunderstanding', social, 1).
action_difficulty(apologize_for_misunderstanding, 0.5).
action_duration(apologize_for_misunderstanding, 1).
action_category(apologize_for_misunderstanding, virtue_morality).
action_source(apologize_for_misunderstanding, ensemble).
action_verb(apologize_for_misunderstanding, past, 'apologize for misunderstanding').
action_verb(apologize_for_misunderstanding, present, 'apologize for misunderstanding').
action_target_type(apologize_for_misunderstanding, other).
action_requires_target(apologize_for_misunderstanding).
action_range(apologize_for_misunderstanding, 5).
action_effect(apologize_for_misunderstanding, (assert(relationship(Actor, Target, met)))).
action_effect(apologize_for_misunderstanding, (modify_network(Actor, Target, friendship, +, 1))).
can_perform(Actor, apologize_for_misunderstanding, Target) :- true.





