%% Ensemble Volition Rules: ingratiation-impression
%% Source: data/ensemble/volitionRules/ingratiation-impression.json
%% Converted: 2026-04-02T20:09:49.727Z
%% Total rules: 37

rule_likelihood(poor_people_can_be_more_impressed_by_a_spectacle_of_faith_than_true_virtue, 1).
rule_type(poor_people_can_be_more_impressed_by_a_spectacle_of_faith_than_true_virtue, volition).
% Poor people can be more impressed by a spectacle of faith than true virtue
rule_active(poor_people_can_be_more_impressed_by_a_spectacle_of_faith_than_true_virtue).
rule_category(poor_people_can_be_more_impressed_by_a_spectacle_of_faith_than_true_virtue, ingratiation_impression).
rule_source(poor_people_can_be_more_impressed_by_a_spectacle_of_faith_than_true_virtue, ensemble).
rule_priority(poor_people_can_be_more_impressed_by_a_spectacle_of_faith_than_true_virtue, 3).
rule_applies(poor_people_can_be_more_impressed_by_a_spectacle_of_faith_than_true_virtue, X, Y) :-
    trait(X, clergy),
    trait(Y, poor),
    trait(X, hypocritical).
rule_effect(poor_people_can_be_more_impressed_by_a_spectacle_of_faith_than_true_virtue, modify_network(X, Y, emulation, '+', 3)).

rule_likelihood(children_may_be_positively_impressed_by_sensitive_caring_people, 1).
rule_type(children_may_be_positively_impressed_by_sensitive_caring_people, volition).
% Children may be positively impressed by sensitive, caring people
rule_active(children_may_be_positively_impressed_by_sensitive_caring_people).
rule_category(children_may_be_positively_impressed_by_sensitive_caring_people, ingratiation_impression).
rule_source(children_may_be_positively_impressed_by_sensitive_caring_people, ensemble).
rule_priority(children_may_be_positively_impressed_by_sensitive_caring_people, 3).
rule_applies(children_may_be_positively_impressed_by_sensitive_caring_people, X, Y) :-
    trait(X, child),
    \+ trait(Y, child),
    trait(Y, innocent_looking),
    attribute(Y, sensitiveness, Sensitiveness_val), Sensitiveness_val > 66,
    directed_status(Y, X, cares_for).
rule_effect(children_may_be_positively_impressed_by_sensitive_caring_people, set_relationship(X, Y, esteem, 3)).
rule_effect(children_may_be_positively_impressed_by_sensitive_caring_people, modify_network(Y, X, affinity, '+', 2)).
rule_effect(children_may_be_positively_impressed_by_sensitive_caring_people, modify_network(Y, X, emulation, '+', 3)).

rule_likelihood(charismatic_jokers_can_impress_groups_of_friends, 1).
rule_type(charismatic_jokers_can_impress_groups_of_friends, volition).
% Charismatic jokers can impress groups of friends
rule_active(charismatic_jokers_can_impress_groups_of_friends).
rule_category(charismatic_jokers_can_impress_groups_of_friends, ingratiation_impression).
rule_source(charismatic_jokers_can_impress_groups_of_friends, ensemble).
rule_priority(charismatic_jokers_can_impress_groups_of_friends, 5).
rule_applies(charismatic_jokers_can_impress_groups_of_friends, X, Y) :-
    trait(X, joker),
    attribute(X, charisma, Charisma_val), Charisma_val > 70,
    relationship(Y, 'z', friends).
rule_effect(charismatic_jokers_can_impress_groups_of_friends, modify_network(Y, X, affinity, '+', 5)).
rule_effect(charismatic_jokers_can_impress_groups_of_friends, modify_network('z', X, affinity, '+', 5)).

rule_likelihood(people_want_to_ingratiate_themselves_with_those_who_are_publicly_romantically_committed, 1).
rule_type(people_want_to_ingratiate_themselves_with_those_who_are_publicly_romantically_committed, volition).
% People want to ingratiate themselves with those who are publicly romantically committed
rule_active(people_want_to_ingratiate_themselves_with_those_who_are_publicly_romantically_committed).
rule_category(people_want_to_ingratiate_themselves_with_those_who_are_publicly_romantically_committed, ingratiation_impression).
rule_source(people_want_to_ingratiate_themselves_with_those_who_are_publicly_romantically_committed, ensemble).
rule_priority(people_want_to_ingratiate_themselves_with_those_who_are_publicly_romantically_committed, 1).
rule_applies(people_want_to_ingratiate_themselves_with_those_who_are_publicly_romantically_committed, X, Y) :-
    directed_status(X, Y, publicly_romantically_committed_to).
rule_effect(people_want_to_ingratiate_themselves_with_those_who_are_publicly_romantically_committed, set_intent(X, ingratiate, Y, 1)).

rule_likelihood(people_want_to_ingratiate_themselves_with_their_superiors, 1).
rule_type(people_want_to_ingratiate_themselves_with_their_superiors, volition).
% People want to ingratiate themselves with their superiors.
rule_active(people_want_to_ingratiate_themselves_with_their_superiors).
rule_category(people_want_to_ingratiate_themselves_with_their_superiors, ingratiation_impression).
rule_source(people_want_to_ingratiate_themselves_with_their_superiors, ensemble).
rule_priority(people_want_to_ingratiate_themselves_with_their_superiors, 1).
rule_applies(people_want_to_ingratiate_themselves_with_their_superiors, X, Y) :-
    directed_status(X, Y, is_boss_of).
rule_effect(people_want_to_ingratiate_themselves_with_their_superiors, set_intent(X, ingratiate, Y, 1)).

rule_likelihood(people_want_to_ingratiate_themselves_with_those_they_consider_rivals, 1).
rule_type(people_want_to_ingratiate_themselves_with_those_they_consider_rivals, volition).
% People want to ingratiate themselves with those they consider rivals.
rule_active(people_want_to_ingratiate_themselves_with_those_they_consider_rivals).
rule_category(people_want_to_ingratiate_themselves_with_those_they_consider_rivals, ingratiation_impression).
rule_source(people_want_to_ingratiate_themselves_with_those_they_consider_rivals, ensemble).
rule_priority(people_want_to_ingratiate_themselves_with_those_they_consider_rivals, 1).
rule_applies(people_want_to_ingratiate_themselves_with_those_they_consider_rivals, X, Y) :-
    directed_status(X, Y, rivals).
rule_effect(people_want_to_ingratiate_themselves_with_those_they_consider_rivals, set_intent(X, ingratiate, Y, -1)).

rule_likelihood(people_seek_to_ingratiate_themselves_with_those_they_respect_significantly, 1).
rule_type(people_seek_to_ingratiate_themselves_with_those_they_respect_significantly, volition).
% People seek to ingratiate themselves with those they respect significantly.
rule_active(people_seek_to_ingratiate_themselves_with_those_they_respect_significantly).
rule_category(people_seek_to_ingratiate_themselves_with_those_they_respect_significantly, ingratiation_impression).
rule_source(people_seek_to_ingratiate_themselves_with_those_they_respect_significantly, ensemble).
rule_priority(people_seek_to_ingratiate_themselves_with_those_they_respect_significantly, 1).
rule_applies(people_seek_to_ingratiate_themselves_with_those_they_respect_significantly, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val > 6.
rule_effect(people_seek_to_ingratiate_themselves_with_those_they_respect_significantly, set_intent(X, ingratiate, Y, 1)).

rule_likelihood(people_seek_to_ingratiate_themselves_with_those_they_respect_more_than_others, 1).
rule_type(people_seek_to_ingratiate_themselves_with_those_they_respect_more_than_others, volition).
% People seek to ingratiate themselves with those they respect more than others.
rule_active(people_seek_to_ingratiate_themselves_with_those_they_respect_more_than_others).
rule_category(people_seek_to_ingratiate_themselves_with_those_they_respect_more_than_others, ingratiation_impression).
rule_source(people_seek_to_ingratiate_themselves_with_those_they_respect_more_than_others, ensemble).
rule_priority(people_seek_to_ingratiate_themselves_with_those_they_respect_more_than_others, 1).
rule_applies(people_seek_to_ingratiate_themselves_with_those_they_respect_more_than_others, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val < 4.
rule_effect(people_seek_to_ingratiate_themselves_with_those_they_respect_more_than_others, set_intent(X, ingratiate, Y, -2)).

rule_likelihood(people_aim_to_ingratiate_themselves_with_individuals_of_strong_influence_when_they_feel_guilty, 1).
rule_type(people_aim_to_ingratiate_themselves_with_individuals_of_strong_influence_when_they_feel_guilty, volition).
% People aim to ingratiate themselves with individuals of strong influence when they feel guilty.
rule_active(people_aim_to_ingratiate_themselves_with_individuals_of_strong_influence_when_they_feel_guilty).
rule_category(people_aim_to_ingratiate_themselves_with_individuals_of_strong_influence_when_they_feel_guilty, ingratiation_impression).
rule_source(people_aim_to_ingratiate_themselves_with_individuals_of_strong_influence_when_they_feel_guilty, ensemble).
rule_priority(people_aim_to_ingratiate_themselves_with_individuals_of_strong_influence_when_they_feel_guilty, 1).
rule_applies(people_aim_to_ingratiate_themselves_with_individuals_of_strong_influence_when_they_feel_guilty, X, Y) :-
    status(X, guilty).
rule_effect(people_aim_to_ingratiate_themselves_with_individuals_of_strong_influence_when_they_feel_guilty, set_intent(X, ingratiate, Y, 2)).

rule_likelihood(people_with_a_fearful_status_seek_to_ingratiate_themselves_towards_others, 1).
rule_type(people_with_a_fearful_status_seek_to_ingratiate_themselves_towards_others, volition).
% People with a fearful status seek to ingratiate themselves towards others.
rule_active(people_with_a_fearful_status_seek_to_ingratiate_themselves_towards_others).
rule_category(people_with_a_fearful_status_seek_to_ingratiate_themselves_towards_others, ingratiation_impression).
rule_source(people_with_a_fearful_status_seek_to_ingratiate_themselves_towards_others, ensemble).
rule_priority(people_with_a_fearful_status_seek_to_ingratiate_themselves_towards_others, 1).
rule_applies(people_with_a_fearful_status_seek_to_ingratiate_themselves_towards_others, X, Y) :-
    status(X, fearful).
rule_effect(people_with_a_fearful_status_seek_to_ingratiate_themselves_towards_others, set_intent(X, ingratiate, Y, 2)).

rule_likelihood(people_who_are_afraid_of_someone_person_x_may_try_to_ingratiate_themselves_with, 1).
rule_type(people_who_are_afraid_of_someone_person_x_may_try_to_ingratiate_themselves_with, volition).
% People who are afraid of someone (Person x) may try to ingratiate themselves with
rule_active(people_who_are_afraid_of_someone_person_x_may_try_to_ingratiate_themselves_with).
rule_category(people_who_are_afraid_of_someone_person_x_may_try_to_ingratiate_themselves_with, ingratiation_impression).
rule_source(people_who_are_afraid_of_someone_person_x_may_try_to_ingratiate_themselves_with, ensemble).
rule_priority(people_who_are_afraid_of_someone_person_x_may_try_to_ingratiate_themselves_with, 1).
rule_applies(people_who_are_afraid_of_someone_person_x_may_try_to_ingratiate_themselves_with, X, Y) :-
    directed_status(X, Y, afraid_of).
rule_effect(people_who_are_afraid_of_someone_person_x_may_try_to_ingratiate_themselves_with, set_intent(X, ingratiate, Y, 2)).

rule_likelihood(people_seek_to_ingratiate_themselves_with_individuals_of_higher_honor_status, 1).
rule_type(people_seek_to_ingratiate_themselves_with_individuals_of_higher_honor_status, volition).
% People seek to ingratiate themselves with individuals of higher honor status.
rule_active(people_seek_to_ingratiate_themselves_with_individuals_of_higher_honor_status).
rule_category(people_seek_to_ingratiate_themselves_with_individuals_of_higher_honor_status, ingratiation_impression).
rule_source(people_seek_to_ingratiate_themselves_with_individuals_of_higher_honor_status, ensemble).
rule_priority(people_seek_to_ingratiate_themselves_with_individuals_of_higher_honor_status, 1).
rule_applies(people_seek_to_ingratiate_themselves_with_individuals_of_higher_honor_status, X, Y) :-
    attribute(X, honor, Honor_val), Honor_val < 7.
rule_effect(people_seek_to_ingratiate_themselves_with_individuals_of_higher_honor_status, set_intent(X, ingratiate, Y, 1)).

rule_likelihood(people_seek_to_ingratiate_themselves_with_individuals_of_high_charisma, 1).
rule_type(people_seek_to_ingratiate_themselves_with_individuals_of_high_charisma, volition).
% People seek to ingratiate themselves with individuals of high charisma.
rule_active(people_seek_to_ingratiate_themselves_with_individuals_of_high_charisma).
rule_category(people_seek_to_ingratiate_themselves_with_individuals_of_high_charisma, ingratiation_impression).
rule_source(people_seek_to_ingratiate_themselves_with_individuals_of_high_charisma, ensemble).
rule_priority(people_seek_to_ingratiate_themselves_with_individuals_of_high_charisma, 3).
rule_applies(people_seek_to_ingratiate_themselves_with_individuals_of_high_charisma, X, Y) :-
    attribute(X, charisma, Charisma_val), Charisma_val < 7.
rule_effect(people_seek_to_ingratiate_themselves_with_individuals_of_high_charisma, set_intent(X, ingratiate, Y, 3)).

rule_likelihood(people_s_positive_actions_towards_others_with_strong_characteristics_aim_to_ingratiate_themselves, 1).
rule_type(people_s_positive_actions_towards_others_with_strong_characteristics_aim_to_ingratiate_themselves, volition).
% People’s positive actions towards others with strong characteristics aim to ingratiate themselves.
rule_active(people_s_positive_actions_towards_others_with_strong_characteristics_aim_to_ingratiate_themselves).
rule_category(people_s_positive_actions_towards_others_with_strong_characteristics_aim_to_ingratiate_themselves, ingratiation_impression).
rule_source(people_s_positive_actions_towards_others_with_strong_characteristics_aim_to_ingratiate_themselves, ensemble).
rule_priority(people_s_positive_actions_towards_others_with_strong_characteristics_aim_to_ingratiate_themselves, 1).
rule_applies(people_s_positive_actions_towards_others_with_strong_characteristics_aim_to_ingratiate_themselves, X, Y) :-
    event(X, nice).
rule_effect(people_s_positive_actions_towards_others_with_strong_characteristics_aim_to_ingratiate_themselves, set_intent(X, ingratiate, Y, 1)).

rule_likelihood(people_seek_to_ingratiate_themselves_with_their_crush_by_becoming_public_friends_of_mutual, 1).
rule_type(people_seek_to_ingratiate_themselves_with_their_crush_by_becoming_public_friends_of_mutual, volition).
% People seek to ingratiate themselves with their crush by becoming public friends of mutual
rule_active(people_seek_to_ingratiate_themselves_with_their_crush_by_becoming_public_friends_of_mutual).
rule_category(people_seek_to_ingratiate_themselves_with_their_crush_by_becoming_public_friends_of_mutual, ingratiation_impression).
rule_source(people_seek_to_ingratiate_themselves_with_their_crush_by_becoming_public_friends_of_mutual, ensemble).
rule_priority(people_seek_to_ingratiate_themselves_with_their_crush_by_becoming_public_friends_of_mutual, 1).
rule_applies(people_seek_to_ingratiate_themselves_with_their_crush_by_becoming_public_friends_of_mutual, X, Y) :-
    directed_status(X, 'z', public_friends),
    directed_status(Y, 'z', public_friends).
rule_effect(people_seek_to_ingratiate_themselves_with_their_crush_by_becoming_public_friends_of_mutual, set_intent(X, ingratiate, Y, 2)).

rule_likelihood(people_seek_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_feelings_for, 1).
rule_type(people_seek_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_feelings_for, volition).
% People seek to ingratiate themselves with individuals they perceive as strong when their feelings for
rule_active(people_seek_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_feelings_for).
rule_category(people_seek_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_feelings_for, ingratiation_impression).
rule_source(people_seek_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_feelings_for, ensemble).
rule_priority(people_seek_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_feelings_for, 1).
rule_applies(people_seek_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_feelings_for, X, Y) :-
    network(X, 'z', antagonism, Antagonism_val), Antagonism_val > 6,
    event(Y, mean).
rule_effect(people_seek_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_feelings_for, set_intent(X, ingratiate, Y, 2)).

rule_likelihood(people_desire_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_social_network, 1).
rule_type(people_desire_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_social_network, volition).
% People desire to ingratiate themselves with individuals they perceive as strong when their social network
rule_active(people_desire_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_social_network).
rule_category(people_desire_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_social_network, ingratiation_impression).
rule_source(people_desire_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_social_network, ensemble).
rule_priority(people_desire_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_social_network, 1).
rule_applies(people_desire_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_social_network, X, Y) :-
    network(X, 'z', antagonism, Antagonism_val), Antagonism_val > 6,
    event(Y, mean).
rule_effect(people_desire_to_ingratiate_themselves_with_individuals_they_perceive_as_strong_when_their_social_network, set_intent(X, ingratiate, Y, 1)).

rule_likelihood(people_worry_less_about_impressing_their_family, 1).
rule_type(people_worry_less_about_impressing_their_family, volition).
% People worry less about impressing their family
rule_active(people_worry_less_about_impressing_their_family).
rule_category(people_worry_less_about_impressing_their_family, ingratiation_impression).
rule_source(people_worry_less_about_impressing_their_family, ensemble).
rule_priority(people_worry_less_about_impressing_their_family, 1).
rule_applies(people_worry_less_about_impressing_their_family, X, Y) :-
    relationship(X, Y, family).
rule_effect(people_worry_less_about_impressing_their_family, set_intent(X, impress, Y, -2)).

rule_likelihood(people_want_to_impress_their_coworkers_a_little, 1).
rule_type(people_want_to_impress_their_coworkers_a_little, volition).
% People want to impress their coworkers a little
rule_active(people_want_to_impress_their_coworkers_a_little).
rule_category(people_want_to_impress_their_coworkers_a_little, ingratiation_impression).
rule_source(people_want_to_impress_their_coworkers_a_little, ensemble).
rule_priority(people_want_to_impress_their_coworkers_a_little, 1).
rule_applies(people_want_to_impress_their_coworkers_a_little, X, Y) :-
    relationship(X, Y, coworker).
rule_effect(people_want_to_impress_their_coworkers_a_little, set_intent(X, impress, Y, 1)).

rule_likelihood(people_want_to_impress_people_they_are_dating, 1).
rule_type(people_want_to_impress_people_they_are_dating, volition).
% People want to impress people they are dating
rule_active(people_want_to_impress_people_they_are_dating).
rule_category(people_want_to_impress_people_they_are_dating, ingratiation_impression).
rule_source(people_want_to_impress_people_they_are_dating, ensemble).
rule_priority(people_want_to_impress_people_they_are_dating, 3).
rule_applies(people_want_to_impress_people_they_are_dating, X, Y) :-
    relationship(X, Y, dating).
rule_effect(people_want_to_impress_people_they_are_dating, set_intent(X, impress, Y, 3)).

rule_likelihood(people_don_t_want_to_impress_people_they_don_t_have_friendly_feeling_towards, 1).
rule_type(people_don_t_want_to_impress_people_they_don_t_have_friendly_feeling_towards, volition).
% People don’t want to impress people they don’t have friendly feeling towards
rule_active(people_don_t_want_to_impress_people_they_don_t_have_friendly_feeling_towards).
rule_category(people_don_t_want_to_impress_people_they_don_t_have_friendly_feeling_towards, ingratiation_impression).
rule_source(people_don_t_want_to_impress_people_they_don_t_have_friendly_feeling_towards, ensemble).
rule_priority(people_don_t_want_to_impress_people_they_don_t_have_friendly_feeling_towards, 1).
rule_applies(people_don_t_want_to_impress_people_they_don_t_have_friendly_feeling_towards, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val < 4.
rule_effect(people_don_t_want_to_impress_people_they_don_t_have_friendly_feeling_towards, set_intent(X, impress, Y, -2)).

rule_likelihood(people_want_to_impress_people_they_have_very_friendly_feeling_towards, 1).
rule_type(people_want_to_impress_people_they_have_very_friendly_feeling_towards, volition).
% People want to impress people they have very friendly feeling towards
rule_active(people_want_to_impress_people_they_have_very_friendly_feeling_towards).
rule_category(people_want_to_impress_people_they_have_very_friendly_feeling_towards, ingratiation_impression).
rule_source(people_want_to_impress_people_they_have_very_friendly_feeling_towards, ensemble).
rule_priority(people_want_to_impress_people_they_have_very_friendly_feeling_towards, 1).
rule_applies(people_want_to_impress_people_they_have_very_friendly_feeling_towards, X, Y) :-
    network(X, Y, friendship, Friendship_val), Friendship_val > 7.
rule_effect(people_want_to_impress_people_they_have_very_friendly_feeling_towards, set_intent(X, impress, Y, 1)).

rule_likelihood(people_very_much_want_to_impress_people_they_are_attracted_to, 1).
rule_type(people_very_much_want_to_impress_people_they_are_attracted_to, volition).
% People very much want to impress people they are attracted to
rule_active(people_very_much_want_to_impress_people_they_are_attracted_to).
rule_category(people_very_much_want_to_impress_people_they_are_attracted_to, ingratiation_impression).
rule_source(people_very_much_want_to_impress_people_they_are_attracted_to, ensemble).
rule_priority(people_very_much_want_to_impress_people_they_are_attracted_to, 5).
rule_applies(people_very_much_want_to_impress_people_they_are_attracted_to, X, Y) :-
    network(X, Y, attraction, Attraction_val), Attraction_val > 7.
rule_effect(people_very_much_want_to_impress_people_they_are_attracted_to, set_intent(X, impress, Y, 6)).

rule_likelihood(people_want_to_impress_people_they_are_a_little_attracted_to, 1).
rule_type(people_want_to_impress_people_they_are_a_little_attracted_to, volition).
% People want to impress people they are a little attracted to
rule_active(people_want_to_impress_people_they_are_a_little_attracted_to).
rule_category(people_want_to_impress_people_they_are_a_little_attracted_to, ingratiation_impression).
rule_source(people_want_to_impress_people_they_are_a_little_attracted_to, ensemble).
rule_priority(people_want_to_impress_people_they_are_a_little_attracted_to, 1).
rule_applies(people_want_to_impress_people_they_are_a_little_attracted_to, X, Y) :-
    network(X, Y, attraction, Attraction_val), Attraction_val > 3,
    network(X, Y, attraction, Attraction_val), Attraction_val < 8.
rule_effect(people_want_to_impress_people_they_are_a_little_attracted_to, set_intent(X, impress, Y, 2)).

rule_likelihood(people_very_much_want_to_impress_people_they_respect, 1).
rule_type(people_very_much_want_to_impress_people_they_respect, volition).
% People very much want to impress people they respect
rule_active(people_very_much_want_to_impress_people_they_respect).
rule_category(people_very_much_want_to_impress_people_they_respect, ingratiation_impression).
rule_source(people_very_much_want_to_impress_people_they_respect, ensemble).
rule_priority(people_very_much_want_to_impress_people_they_respect, 5).
rule_applies(people_very_much_want_to_impress_people_they_respect, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val > 7.
rule_effect(people_very_much_want_to_impress_people_they_respect, set_intent(X, impress, Y, 6)).

rule_likelihood(people_don_t_want_to_impress_people_they_don_t_respect, 1).
rule_type(people_don_t_want_to_impress_people_they_don_t_respect, volition).
% People don’t want to impress people they don’t respect
rule_active(people_don_t_want_to_impress_people_they_don_t_respect).
rule_category(people_don_t_want_to_impress_people_they_don_t_respect, ingratiation_impression).
rule_source(people_don_t_want_to_impress_people_they_don_t_respect, ensemble).
rule_priority(people_don_t_want_to_impress_people_they_don_t_respect, 3).
rule_applies(people_don_t_want_to_impress_people_they_don_t_respect, X, Y) :-
    network(X, Y, respect, Respect_val), Respect_val < 4.
rule_effect(people_don_t_want_to_impress_people_they_don_t_respect, set_intent(X, impress, Y, -4)).

rule_likelihood(shy_people_want_to_impress_people, 1).
rule_type(shy_people_want_to_impress_people, volition).
% Shy people want to impress people
rule_active(shy_people_want_to_impress_people).
rule_category(shy_people_want_to_impress_people, ingratiation_impression).
rule_source(shy_people_want_to_impress_people, ensemble).
rule_priority(shy_people_want_to_impress_people, 3).
rule_applies(shy_people_want_to_impress_people, X, Y) :-
    trait(X, shy).
rule_effect(shy_people_want_to_impress_people, set_intent(X, impress, Y, 3)).

rule_likelihood(a_loyal_employee_wants_to_impress_people, 1).
rule_type(a_loyal_employee_wants_to_impress_people, volition).
% A loyal employee wants to impress people
rule_active(a_loyal_employee_wants_to_impress_people).
rule_category(a_loyal_employee_wants_to_impress_people, ingratiation_impression).
rule_source(a_loyal_employee_wants_to_impress_people, ensemble).
rule_priority(a_loyal_employee_wants_to_impress_people, 3).
rule_applies(a_loyal_employee_wants_to_impress_people, X, Y) :-
    trait(X, employee),
    trait(X, loyal).
rule_effect(a_loyal_employee_wants_to_impress_people, set_intent(X, impress, Y, 4)).

rule_likelihood(employees_generally_don_t_care_about_impressing_people, 1).
rule_type(employees_generally_don_t_care_about_impressing_people, volition).
% Employees generally don’t care about impressing people
rule_active(employees_generally_don_t_care_about_impressing_people).
rule_category(employees_generally_don_t_care_about_impressing_people, ingratiation_impression).
rule_source(employees_generally_don_t_care_about_impressing_people, ensemble).
rule_priority(employees_generally_don_t_care_about_impressing_people, 1).
rule_applies(employees_generally_don_t_care_about_impressing_people, X, Y) :-
    trait(X, employee).
rule_effect(employees_generally_don_t_care_about_impressing_people, set_intent(X, impress, Y, -1)).

rule_likelihood(jerks_don_t_want_to_impress_people, 1).
rule_type(jerks_don_t_want_to_impress_people, volition).
% Jerks don’t want to impress people
rule_active(jerks_don_t_want_to_impress_people).
rule_category(jerks_don_t_want_to_impress_people, ingratiation_impression).
rule_source(jerks_don_t_want_to_impress_people, ensemble).
rule_priority(jerks_don_t_want_to_impress_people, 3).
rule_applies(jerks_don_t_want_to_impress_people, X, Y) :-
    trait(X, jerk).
rule_effect(jerks_don_t_want_to_impress_people, set_intent(X, impress, Y, -3)).

rule_likelihood(hangry_people_don_t_have_time_to_impress_people, 1).
rule_type(hangry_people_don_t_have_time_to_impress_people, volition).
% Hangry people don’t have time to impress people
rule_active(hangry_people_don_t_have_time_to_impress_people).
rule_category(hangry_people_don_t_have_time_to_impress_people, ingratiation_impression).
rule_source(hangry_people_don_t_have_time_to_impress_people, ensemble).
rule_priority(hangry_people_don_t_have_time_to_impress_people, 1).
rule_applies(hangry_people_don_t_have_time_to_impress_people, X, Y) :-
    status(X, hangry).
rule_effect(hangry_people_don_t_have_time_to_impress_people, set_intent(X, impress, Y, -2)).

rule_likelihood(employees_want_to_impress_their_boss, 1).
rule_type(employees_want_to_impress_their_boss, volition).
% Employees want to impress their boss
rule_active(employees_want_to_impress_their_boss).
rule_category(employees_want_to_impress_their_boss, ingratiation_impression).
rule_source(employees_want_to_impress_their_boss, ensemble).
rule_priority(employees_want_to_impress_their_boss, 5).
rule_applies(employees_want_to_impress_their_boss, X, Y) :-
    trait(X, employee),
    directed_status(Y, X, is_boss_of).
rule_effect(employees_want_to_impress_their_boss, set_intent(X, impress, Y, 6)).

rule_likelihood(bosses_care_a_lot_about_impressing_their_employees, 1).
rule_type(bosses_care_a_lot_about_impressing_their_employees, volition).
% Bosses care a lot about impressing their employees
rule_active(bosses_care_a_lot_about_impressing_their_employees).
rule_category(bosses_care_a_lot_about_impressing_their_employees, ingratiation_impression).
rule_source(bosses_care_a_lot_about_impressing_their_employees, ensemble).
rule_priority(bosses_care_a_lot_about_impressing_their_employees, 5).
rule_applies(bosses_care_a_lot_about_impressing_their_employees, X, Y) :-
    directed_status(X, Y, is_boss_of),
    trait(Y, employee).
rule_effect(bosses_care_a_lot_about_impressing_their_employees, set_intent(X, impress, Y, 7)).

rule_likelihood(people_don_t_want_to_impress_people_who_have_been_rude_to_them_recently, 1).
rule_type(people_don_t_want_to_impress_people_who_have_been_rude_to_them_recently, volition).
% People don’t want to impress people who have been rude to them recently
rule_active(people_don_t_want_to_impress_people_who_have_been_rude_to_them_recently).
rule_category(people_don_t_want_to_impress_people_who_have_been_rude_to_them_recently, ingratiation_impression).
rule_source(people_don_t_want_to_impress_people_who_have_been_rude_to_them_recently, ensemble).
rule_priority(people_don_t_want_to_impress_people_who_have_been_rude_to_them_recently, 1).
rule_applies(people_don_t_want_to_impress_people_who_have_been_rude_to_them_recently, X, Y) :-
    event(Y, rude).
rule_effect(people_don_t_want_to_impress_people_who_have_been_rude_to_them_recently, set_intent(X, impress, Y, -1)).

rule_likelihood(people_really_want_their_boss_to_be_impressed_with_them_if_they_respect_them, 1).
rule_type(people_really_want_their_boss_to_be_impressed_with_them_if_they_respect_them, volition).
% People really want their boss to be impressed with them if they respect them.
rule_active(people_really_want_their_boss_to_be_impressed_with_them_if_they_respect_them).
rule_category(people_really_want_their_boss_to_be_impressed_with_them_if_they_respect_them, ingratiation_impression).
rule_source(people_really_want_their_boss_to_be_impressed_with_them_if_they_respect_them, ensemble).
rule_priority(people_really_want_their_boss_to_be_impressed_with_them_if_they_respect_them, 3).
rule_applies(people_really_want_their_boss_to_be_impressed_with_them_if_they_respect_them, X, Y) :-
    directed_status(Y, X, is_boss_of),
    network(X, Y, respect, Respect_val), Respect_val > 3,
    network(X, Y, respect, Respect_val), Respect_val < 8.
rule_effect(people_really_want_their_boss_to_be_impressed_with_them_if_they_respect_them, set_intent(X, impress, Y, 4)).

rule_likelihood(people_want_to_impress_people_who_have_flirted_with_them_recently, 1).
rule_type(people_want_to_impress_people_who_have_flirted_with_them_recently, volition).
% People want to impress people who have flirted with them recently
rule_active(people_want_to_impress_people_who_have_flirted_with_them_recently).
rule_category(people_want_to_impress_people_who_have_flirted_with_them_recently, ingratiation_impression).
rule_source(people_want_to_impress_people_who_have_flirted_with_them_recently, ensemble).
rule_priority(people_want_to_impress_people_who_have_flirted_with_them_recently, 1).
rule_applies(people_want_to_impress_people_who_have_flirted_with_them_recently, X, Y) :-
    event(Y, flirted_with).
rule_effect(people_want_to_impress_people_who_have_flirted_with_them_recently, set_intent(X, impress, Y, 2)).

rule_likelihood(people_don_t_want_to_impress_people_who_have_embarrassed_themselves_recently, 1).
rule_type(people_don_t_want_to_impress_people_who_have_embarrassed_themselves_recently, volition).
% People don’t want to impress people who have embarrassed themselves recently
rule_active(people_don_t_want_to_impress_people_who_have_embarrassed_themselves_recently).
rule_category(people_don_t_want_to_impress_people_who_have_embarrassed_themselves_recently, ingratiation_impression).
rule_source(people_don_t_want_to_impress_people_who_have_embarrassed_themselves_recently, ensemble).
rule_priority(people_don_t_want_to_impress_people_who_have_embarrassed_themselves_recently, 3).
rule_applies(people_don_t_want_to_impress_people_who_have_embarrassed_themselves_recently, X, Y) :-
    event(Y, embarrassment),
    trait('z', anyone),
    trait(X, anyone).
rule_effect(people_don_t_want_to_impress_people_who_have_embarrassed_themselves_recently, set_intent(X, impress, Y, -3)).




