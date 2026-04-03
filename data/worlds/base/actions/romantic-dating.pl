%% Ensemble Actions: romantic-dating
%% Source: data/ensemble/actions/romantic-dating.json
%% Converted: 2026-04-01T20:15:17.345Z
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

