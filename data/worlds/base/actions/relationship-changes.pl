%% Ensemble Actions: relationship-changes
%% Source: data/ensemble/actions/relationship-changes.json
%% Converted: 2026-04-01T20:15:17.345Z
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

