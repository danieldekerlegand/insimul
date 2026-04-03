%% Ensemble Actions: emotional-expression
%% Source: data/ensemble/actions/emotional-expression.json
%% Converted: 2026-04-01T20:15:17.341Z
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

