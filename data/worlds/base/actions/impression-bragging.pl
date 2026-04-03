%% Ensemble Actions: impression-bragging
%% Source: data/ensemble/actions/impression-bragging.json
%% Converted: 2026-04-01T20:15:17.343Z
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




