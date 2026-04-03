%% Ensemble Actions: hostile-attacks
%% Source: data/ensemble/actions/hostile-attacks.json
%% Converted: 2026-04-01T20:15:17.342Z
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

