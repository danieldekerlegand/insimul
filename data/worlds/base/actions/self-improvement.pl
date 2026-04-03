%% Ensemble Actions: self-improvement
%% Source: data/ensemble/actions/self-improvement.json
%% Converted: 2026-04-01T20:15:17.346Z
%% Total actions: 15

%% strength_up
% Action: strength-up
% Source: Ensemble / self-improvement

action(strength_up, 'strength-up', self_improvement, 1).
action_difficulty(strength_up, 0.5).
action_duration(strength_up, 1).
action_category(strength_up, self_improvement).
action_source(strength_up, ensemble).
action_verb(strength_up, past, 'strength-up').
action_verb(strength_up, present, 'strength-up').
action_target_type(strength_up, self).
action_leads_to(strength_up, lift_weights).
action_leads_to(strength_up, do_pushups).
can_perform(Actor, strength_up) :- true.

%% intelligence_up
% Action: intelligence-up
% Source: Ensemble / self-improvement

action(intelligence_up, 'intelligence-up', self_improvement, 1).
action_difficulty(intelligence_up, 0.5).
action_duration(intelligence_up, 1).
action_category(intelligence_up, self_improvement).
action_source(intelligence_up, ensemble).
action_verb(intelligence_up, past, 'intelligence-up').
action_verb(intelligence_up, present, 'intelligence-up').
action_target_type(intelligence_up, self).
action_leads_to(intelligence_up, study).
action_leads_to(intelligence_up, train).
action_leads_to(intelligence_up, read).
can_perform(Actor, intelligence_up) :- true.

%% kinship_up
% Action: kinship-up
% Source: Ensemble / self-improvement

action(kinship_up, 'kinship-up', self_improvement, 1).
action_difficulty(kinship_up, 0.5).
action_duration(kinship_up, 1).
action_category(kinship_up, self_improvement).
action_source(kinship_up, ensemble).
action_verb(kinship_up, past, 'kinship-up').
action_verb(kinship_up, present, 'kinship-up').
action_target_type(kinship_up, self).
action_leads_to(kinship_up, swear_oath).
action_leads_to(kinship_up, increase_physical_kinship).
can_perform(Actor, kinship_up) :- true.

%% increase_physical_kinship
% Action: INCREASE PHYSICAL KINSHIP
% Source: Ensemble / self-improvement

action(increase_physical_kinship, 'INCREASE PHYSICAL KINSHIP', self_improvement, 1).
action_difficulty(increase_physical_kinship, 0.5).
action_duration(increase_physical_kinship, 1).
action_category(increase_physical_kinship, self_improvement).
action_source(increase_physical_kinship, ensemble).
action_parent(increase_physical_kinship, kinship_up).
action_verb(increase_physical_kinship, past, 'increase physical kinship').
action_verb(increase_physical_kinship, present, 'increase physical kinship').
action_target_type(increase_physical_kinship, self).
action_leads_to(increase_physical_kinship, hug).
can_perform(Actor, increase_physical_kinship) :- true.

%% study
% Action: STUDY
% Source: Ensemble / self-improvement

action(study, 'STUDY', self_improvement, 1).
action_difficulty(study, 0.5).
action_duration(study, 1).
action_category(study, self_improvement).
action_source(study, ensemble).
action_parent(study, intelligence_up).
action_verb(study, past, 'study').
action_verb(study, present, 'study').
action_target_type(study, self).
action_leads_to(study, studymath).
action_leads_to(study, studyanatomy).
can_perform(Actor, study) :- true.

%% train
% Action: TRAIN
% Source: Ensemble / self-improvement

action(train, 'TRAIN', self_improvement, 1).
action_difficulty(train, 0.5).
action_duration(train, 1).
action_category(train, self_improvement).
action_source(train, ensemble).
action_parent(train, intelligence_up).
action_verb(train, past, 'train').
action_verb(train, present, 'train').
action_target_type(train, self).
action_leads_to(train, train_vocabulary).
can_perform(Actor, train) :- true.

%% read
% Action: READ
% Source: Ensemble / self-improvement

action(read, 'READ', self_improvement, 1).
action_difficulty(read, 0.5).
action_duration(read, 1).
action_category(read, self_improvement).
action_source(read, ensemble).
action_parent(read, intelligence_up).
action_verb(read, past, 'read').
action_verb(read, present, 'read').
action_target_type(read, self).
action_leads_to(read, read_a_book).
can_perform(Actor, read) :- true.

%% do_pushups
% Action: DO PUSHUPS
% Source: Ensemble / self-improvement

action(do_pushups, 'DO PUSHUPS', self_improvement, 1).
action_difficulty(do_pushups, 0.5).
action_duration(do_pushups, 1).
action_category(do_pushups, self_improvement).
action_source(do_pushups, ensemble).
action_parent(do_pushups, strength_up).
action_verb(do_pushups, past, 'do pushups').
action_verb(do_pushups, present, 'do pushups').
action_target_type(do_pushups, self).
action_leads_to(do_pushups, pushup1).
can_perform(Actor, do_pushups) :- true.

%% studymath
% Action: Study Math
% Source: Ensemble / self-improvement

action(studymath, 'Study Math', self_improvement, 1).
action_difficulty(studymath, 0.5).
action_duration(studymath, 1).
action_category(studymath, self_improvement).
action_source(studymath, ensemble).
action_parent(studymath, study).
action_verb(studymath, past, 'studymath').
action_verb(studymath, present, 'studymath').
action_target_type(studymath, self).
action_effect(studymath, (modify_attribute(Actor, intelligence, +, 10))).
action_effect(studymath, (ensemble_effect(Actor, self-involved, true))).
action_influence(studymath, (influence(unknown, _, _, weight, +, 0))).
can_perform(Actor, studymath) :- true.

%% studyanatomy
% Action: Study Anatomy
% Source: Ensemble / self-improvement

action(studyanatomy, 'Study Anatomy', self_improvement, 1).
action_difficulty(studyanatomy, 0.5).
action_duration(studyanatomy, 1).
action_category(studyanatomy, self_improvement).
action_source(studyanatomy, ensemble).
action_parent(studyanatomy, study).
action_verb(studyanatomy, past, 'studyanatomy').
action_verb(studyanatomy, present, 'studyanatomy').
action_target_type(studyanatomy, self).
action_effect(studyanatomy, (modify_attribute(Actor, strength, +, 10))).
action_effect(studyanatomy, (modify_attribute(Actor, intelligence, +, 10))).
action_effect(studyanatomy, (ensemble_effect(Actor, self-involved, true))).
action_influence(studyanatomy, (influence(unknown, _, _, weight, +, 0))).
can_perform(Actor, studyanatomy) :- true.

%% train_vocabulary
% Action: train vocabulary
% Source: Ensemble / self-improvement

action(train_vocabulary, 'train vocabulary', self_improvement, 1).
action_difficulty(train_vocabulary, 0.5).
action_duration(train_vocabulary, 1).
action_category(train_vocabulary, self_improvement).
action_source(train_vocabulary, ensemble).
action_parent(train_vocabulary, train).
action_verb(train_vocabulary, past, 'train vocabulary').
action_verb(train_vocabulary, present, 'train vocabulary').
action_target_type(train_vocabulary, self).
action_effect(train_vocabulary, (modify_attribute(Actor, intelligence, +, 10))).
can_perform(Actor, train_vocabulary) :- true.

%% read_a_book
% Action: read a book
% Source: Ensemble / self-improvement

action(read_a_book, 'read a book', self_improvement, 1).
action_difficulty(read_a_book, 0.5).
action_duration(read_a_book, 1).
action_category(read_a_book, self_improvement).
action_source(read_a_book, ensemble).
action_parent(read_a_book, read).
action_verb(read_a_book, past, 'read a book').
action_verb(read_a_book, present, 'read a book').
action_target_type(read_a_book, self).
action_effect(read_a_book, (modify_attribute(Actor, intelligence, +, 10))).
can_perform(Actor, read_a_book) :- true.

%% weightliftsuccess
% Action: Weightlift
% Source: Ensemble / self-improvement

action(weightliftsuccess, 'Weightlift', self_improvement, 1).
action_difficulty(weightliftsuccess, 0.5).
action_duration(weightliftsuccess, 1).
action_category(weightliftsuccess, self_improvement).
action_source(weightliftsuccess, ensemble).
action_verb(weightliftsuccess, past, 'weightliftsuccess').
action_verb(weightliftsuccess, present, 'weightliftsuccess').
action_target_type(weightliftsuccess, self).
action_effect(weightliftsuccess, (modify_attribute(Actor, strength, +, 5))).
action_effect(weightliftsuccess, (ensemble_effect(Actor, self-involved, true))).
can_perform(Actor, weightliftsuccess) :- true.

%% weightliftfail
% Action: Weight Lift <FAIL>
% Source: Ensemble / self-improvement

action(weightliftfail, 'Weight Lift <FAIL>', self_improvement, 1).
action_difficulty(weightliftfail, 0.5).
action_duration(weightliftfail, 1).
action_category(weightliftfail, self_improvement).
action_source(weightliftfail, ensemble).
action_verb(weightliftfail, past, 'weightliftfail').
action_verb(weightliftfail, present, 'weightliftfail').
action_target_type(weightliftfail, self).
action_effect(weightliftfail, (modify_attribute(Actor, strength, -, 10))).
action_effect(weightliftfail, (ensemble_effect(Actor, self-involved, true))).
can_perform(Actor, weightliftfail) :- true.

%% pushup1
% Action: Do Pushups
% Source: Ensemble / self-improvement

action(pushup1, 'Do Pushups', self_improvement, 1).
action_difficulty(pushup1, 0.5).
action_duration(pushup1, 1).
action_category(pushup1, self_improvement).
action_source(pushup1, ensemble).
action_parent(pushup1, do_pushups).
action_verb(pushup1, past, 'pushup1').
action_verb(pushup1, present, 'pushup1').
action_target_type(pushup1, self).
action_effect(pushup1, (modify_attribute(Actor, strength, +, 10))).
action_effect(pushup1, (ensemble_effect(Actor, self-involved, true))).
can_perform(Actor, pushup1) :- true.

