%% Ensemble Actions: virtue-morality
%% Source: data/ensemble/actions/virtue-morality.json
%% Converted: 2026-04-01T20:15:17.348Z
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

