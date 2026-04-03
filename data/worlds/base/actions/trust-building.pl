%% Ensemble Actions: trust-building
%% Source: data/ensemble/actions/trust-building.json
%% Converted: 2026-04-01T20:15:17.348Z
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

