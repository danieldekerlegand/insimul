%% Ensemble Actions: conversational-farewell
%% Source: data/ensemble/actions/conversational-farewell.json
%% Converted: 2026-04-01T20:15:17.333Z
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

