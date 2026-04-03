%% Ensemble Actions: dominance-power
%% Source: data/ensemble/actions/dominance-power.json
%% Converted: 2026-04-01T20:15:17.340Z
%% Total actions: 3

%% be_humble
% Action: BE HUMBLE
% Source: Ensemble / dominance-power

action(be_humble, 'BE HUMBLE', hostile, 1).
action_difficulty(be_humble, 0.5).
action_duration(be_humble, 1).
action_category(be_humble, dominance_power).
action_source(be_humble, ensemble).
action_verb(be_humble, past, 'be humble').
action_verb(be_humble, present, 'be humble').
action_target_type(be_humble, self).
action_leads_to(be_humble, respond_humbly).
can_perform(Actor, be_humble) :- true.

%% respect
% Action: RESPECT
% Source: Ensemble / dominance-power

action(respect, 'RESPECT', hostile, 1).
action_difficulty(respect, 0.5).
action_duration(respect, 1).
action_category(respect, dominance_power).
action_source(respect, ensemble).
action_verb(respect, past, 'respect').
action_verb(respect, present, 'respect').
action_target_type(respect, self).
action_leads_to(respect, compliment_successfully).
action_leads_to(respect, compliment_unsuccessfully).
can_perform(Actor, respect) :- true.

%% police_officer_does_not_respect_broke_rich_person_s_status
% Action: police officer does not respect broke rich person’s status
% Source: Ensemble / dominance-power

action(police_officer_does_not_respect_broke_rich_person_s_status, 'police officer does not respect broke rich person''s status', hostile, 1).
action_difficulty(police_officer_does_not_respect_broke_rich_person_s_status, 0.5).
action_duration(police_officer_does_not_respect_broke_rich_person_s_status, 1).
action_category(police_officer_does_not_respect_broke_rich_person_s_status, dominance_power).
action_source(police_officer_does_not_respect_broke_rich_person_s_status, ensemble).
action_verb(police_officer_does_not_respect_broke_rich_person_s_status, past, 'police officer does not respect broke rich person''s status').
action_verb(police_officer_does_not_respect_broke_rich_person_s_status, present, 'police officer does not respect broke rich person''s status').
action_target_type(police_officer_does_not_respect_broke_rich_person_s_status, other).
action_requires_target(police_officer_does_not_respect_broke_rich_person_s_status).
action_range(police_officer_does_not_respect_broke_rich_person_s_status, 5).
action_is_accept(police_officer_does_not_respect_broke_rich_person_s_status).
action_prerequisite(police_officer_does_not_respect_broke_rich_person_s_status, (trait(Actor, government official))).
action_prerequisite(police_officer_does_not_respect_broke_rich_person_s_status, (trait(Target, rich))).
action_prerequisite(police_officer_does_not_respect_broke_rich_person_s_status, (\+ trait(Actor, kind))).
action_prerequisite(police_officer_does_not_respect_broke_rich_person_s_status, (\+ trait(Target, rich))).
action_prerequisite(police_officer_does_not_respect_broke_rich_person_s_status, (attribute(Actor, propriety, V), V < 50)).
action_effect(police_officer_does_not_respect_broke_rich_person_s_status, (ensemble_effect(Target, offended by, true))).
% Can Actor perform this action?
can_perform(Actor, police_officer_does_not_respect_broke_rich_person_s_status, Target) :-
    trait(Actor, government official),
    trait(Target, rich),
    \+ trait(Actor, kind),
    \+ trait(Target, rich),
    attribute(Actor, propriety, V), V < 50.




