%% Ensemble Actions: social-bonding
%% Source: data/ensemble/actions/social-bonding.json
%% Converted: 2026-04-01T20:15:17.346Z
%% Total actions: 7

%% befriend
% Action: BEFRIEND
% Source: Ensemble / social-bonding

action(befriend, 'BEFRIEND', social, 1).
action_difficulty(befriend, 0.5).
action_duration(befriend, 1).
action_category(befriend, social_bonding).
action_source(befriend, ensemble).
action_verb(befriend, past, 'befriend').
action_verb(befriend, present, 'befriend').
action_target_type(befriend, self).
action_leads_to(befriend, respond_positively_to_compliment).
action_leads_to(befriend, friendly_compliment).
action_leads_to(befriend, say_goodbye).
action_leads_to(befriend, goodbye_response).
can_perform(Actor, befriend) :- true.

%% bond
% Action: BOND
% Source: Ensemble / social-bonding

action(bond, 'BOND', social, 1).
action_difficulty(bond, 0.5).
action_duration(bond, 1).
action_category(bond, social_bonding).
action_source(bond, ensemble).
action_verb(bond, past, 'bond').
action_verb(bond, present, 'bond').
action_target_type(bond, self).
action_leads_to(bond, bondterminal).
can_perform(Actor, bond) :- true.

%% form_alliance
% Action: FORM ALLIANCE
% Source: Ensemble / social-bonding

action(form_alliance, 'FORM ALLIANCE', social, 1).
action_difficulty(form_alliance, 0.5).
action_duration(form_alliance, 1).
action_category(form_alliance, social_bonding).
action_source(form_alliance, ensemble).
action_verb(form_alliance, past, 'form alliance').
action_verb(form_alliance, present, 'form alliance').
action_target_type(form_alliance, self).
action_leads_to(form_alliance, intervene_between_a_and_b_in_favor_of_a).
action_leads_to(form_alliance, fight_to_help_an_unknown_man).
action_leads_to(form_alliance, help_withheld_because_person_unable_to_pay).
action_leads_to(form_alliance, formalliance_successfully).
action_leads_to(form_alliance, formalliance_unsuccessfully).
can_perform(Actor, form_alliance) :- true.

%% bondterminal
% Action: bondTerminal
% Source: Ensemble / social-bonding

action(bondterminal, 'bondTerminal', social, 1).
action_difficulty(bondterminal, 0.5).
action_duration(bondterminal, 1).
action_category(bondterminal, social_bonding).
action_source(bondterminal, ensemble).
action_parent(bondterminal, bond).
action_verb(bondterminal, past, 'bondterminal').
action_verb(bondterminal, present, 'bondterminal').
action_target_type(bondterminal, other).
action_requires_target(bondterminal).
action_range(bondterminal, 5).
action_is_accept(bondterminal).
action_effect(bondterminal, (assert(relationship(Actor, Target, friends)))).
can_perform(Actor, bondterminal, Target) :- true.

%% formalliance_successfully
% Action: formalliance successfully
% Source: Ensemble / social-bonding

action(formalliance_successfully, 'formalliance successfully', social, 1).
action_difficulty(formalliance_successfully, 0.5).
action_duration(formalliance_successfully, 1).
action_category(formalliance_successfully, social_bonding).
action_source(formalliance_successfully, ensemble).
action_parent(formalliance_successfully, form_alliance).
action_verb(formalliance_successfully, past, 'formalliance successfully').
action_verb(formalliance_successfully, present, 'formalliance successfully').
action_target_type(formalliance_successfully, other).
action_requires_target(formalliance_successfully).
action_range(formalliance_successfully, 5).
action_is_accept(formalliance_successfully).
action_effect(formalliance_successfully, (assert(relationship(Actor, Target, ally)))).
can_perform(Actor, formalliance_successfully, Target) :- true.

%% formalliance_unsuccessfully
% Action: formalliance unsuccessfully
% Source: Ensemble / social-bonding

action(formalliance_unsuccessfully, 'formalliance unsuccessfully', social, 1).
action_difficulty(formalliance_unsuccessfully, 0.5).
action_duration(formalliance_unsuccessfully, 1).
action_category(formalliance_unsuccessfully, social_bonding).
action_source(formalliance_unsuccessfully, ensemble).
action_parent(formalliance_unsuccessfully, form_alliance).
action_verb(formalliance_unsuccessfully, past, 'formalliance unsuccessfully').
action_verb(formalliance_unsuccessfully, present, 'formalliance unsuccessfully').
action_target_type(formalliance_unsuccessfully, self).
can_perform(Actor, formalliance_unsuccessfully) :- true.

%% respond_romantically
% Action: Respond Romantically
% Source: Ensemble / social-bonding

action(respond_romantically, 'Respond Romantically', social, 1).
action_difficulty(respond_romantically, 0.5).
action_duration(respond_romantically, 1).
action_category(respond_romantically, social_bonding).
action_source(respond_romantically, ensemble).
action_verb(respond_romantically, past, 'respond romantically').
action_verb(respond_romantically, present, 'respond romantically').
action_target_type(respond_romantically, self).
can_perform(Actor, respond_romantically) :- true.

