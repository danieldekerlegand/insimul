%% Ensemble Actions: social-compliments
%% Source: data/ensemble/actions/social-compliments.json
%% Converted: 2026-04-01T20:15:17.346Z
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

