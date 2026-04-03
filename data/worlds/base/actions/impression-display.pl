%% Ensemble Actions: impression-display
%% Source: data/ensemble/actions/impression-display.json
%% Converted: 2026-04-01T20:15:17.343Z
%% Total actions: 20

%% display_wit
% Action: DISPLAY WIT
% Source: Ensemble / impression-display

action(display_wit, 'DISPLAY WIT', social, 1).
action_difficulty(display_wit, 0.5).
action_duration(display_wit, 1).
action_category(display_wit, impression_display).
action_source(display_wit, ensemble).
action_verb(display_wit, past, 'display wit').
action_verb(display_wit, present, 'display wit').
action_target_type(display_wit, self).
action_leads_to(display_wit, yell_something_witty_at_actor_during_play).
action_leads_to(display_wit, refrain_from_yelling_something_witty_at_actor_during_play).
action_leads_to(display_wit, display_wit_successfully).
action_leads_to(display_wit, display_wit_unsuccessfully).
can_perform(Actor, display_wit) :- true.

%% display_initiative
% Action: DISPLAY INITIATIVE
% Source: Ensemble / impression-display

action(display_initiative, 'DISPLAY INITIATIVE', social, 1).
action_difficulty(display_initiative, 0.5).
action_duration(display_initiative, 1).
action_category(display_initiative, impression_display).
action_source(display_initiative, ensemble).
action_verb(display_initiative, past, 'display initiative').
action_verb(display_initiative, present, 'display initiative').
action_target_type(display_initiative, self).
action_leads_to(display_initiative, pay_for_someone_applauding_during_the_play).
action_leads_to(display_initiative, servant_starts_whistling).
action_leads_to(display_initiative, display_initiative_successfully).
action_leads_to(display_initiative, display_initiative_unsuccessfully).
can_perform(Actor, display_initiative) :- true.

%% display_worldliness
% Action: DISPLAY WORLDLINESS
% Source: Ensemble / impression-display

action(display_worldliness, 'DISPLAY WORLDLINESS', social, 1).
action_difficulty(display_worldliness, 0.5).
action_duration(display_worldliness, 1).
action_category(display_worldliness, impression_display).
action_source(display_worldliness, ensemble).
action_verb(display_worldliness, past, 'display worldliness').
action_verb(display_worldliness, present, 'display worldliness').
action_target_type(display_worldliness, self).
action_leads_to(display_worldliness, behave_like_the_others_at_the_theater).
action_leads_to(display_worldliness, talk_about_science_philosophy).
action_leads_to(display_worldliness, display_worldliness_successfully).
action_leads_to(display_worldliness, display_worldliness_unsuccessfully).
can_perform(Actor, display_worldliness) :- true.

%% display_eccentricity
% Action: DISPLAY ECCENTRICITY
% Source: Ensemble / impression-display

action(display_eccentricity, 'DISPLAY ECCENTRICITY', social, 1).
action_difficulty(display_eccentricity, 0.5).
action_duration(display_eccentricity, 1).
action_category(display_eccentricity, impression_display).
action_source(display_eccentricity, ensemble).
action_verb(display_eccentricity, past, 'display eccentricity').
action_verb(display_eccentricity, present, 'display eccentricity').
action_target_type(display_eccentricity, self).
action_leads_to(display_eccentricity, respond_in_patois_but_gain_everyone_s_admiration).
action_leads_to(display_eccentricity, display_eccentricity_successfully).
action_leads_to(display_eccentricity, display_eccentricity_unsuccessfully).
can_perform(Actor, display_eccentricity) :- true.

%% reveal_ignorance
% Action: REVEAL IGNORANCE
% Source: Ensemble / impression-display

action(reveal_ignorance, 'REVEAL IGNORANCE', social, 1).
action_difficulty(reveal_ignorance, 0.5).
action_duration(reveal_ignorance, 1).
action_category(reveal_ignorance, impression_display).
action_source(reveal_ignorance, ensemble).
action_verb(reveal_ignorance, past, 'reveal ignorance').
action_verb(reveal_ignorance, present, 'reveal ignorance').
action_target_type(reveal_ignorance, self).
action_leads_to(reveal_ignorance, reveal_ignorance_successfully).
action_leads_to(reveal_ignorance, reveal_ignorance_unsuccessfully).
can_perform(Actor, reveal_ignorance) :- true.

%% demonstrate_virtue
% Action: DEMONSTRATE VIRTUE
% Source: Ensemble / impression-display

action(demonstrate_virtue, 'DEMONSTRATE VIRTUE', social, 1).
action_difficulty(demonstrate_virtue, 0.5).
action_duration(demonstrate_virtue, 1).
action_category(demonstrate_virtue, impression_display).
action_source(demonstrate_virtue, ensemble).
action_verb(demonstrate_virtue, past, 'demonstrate virtue').
action_verb(demonstrate_virtue, present, 'demonstrate virtue').
action_target_type(demonstrate_virtue, self).
action_leads_to(demonstrate_virtue, lover_catches_virtuous_partner_disbelieves_display_of_virtue).
action_leads_to(demonstrate_virtue, virtuous_behavior_is_convincing_to_friend_results_in_esteem).
action_leads_to(demonstrate_virtue, reject_concurrent_lover).
action_leads_to(demonstrate_virtue, move_listeners_to_tears_through_honesty_virtue).
action_leads_to(demonstrate_virtue, express_gratitude_toward_benefactor).
action_leads_to(demonstrate_virtue, demonstratevirtue_successfully).
action_leads_to(demonstrate_virtue, demonstratevirtue_unsuccessfully).
can_perform(Actor, demonstrate_virtue) :- true.

%% display_wit_successfully
% Action: display wit successfully
% Source: Ensemble / impression-display

action(display_wit_successfully, 'display wit successfully', social, 1).
action_difficulty(display_wit_successfully, 0.5).
action_duration(display_wit_successfully, 1).
action_category(display_wit_successfully, impression_display).
action_source(display_wit_successfully, ensemble).
action_parent(display_wit_successfully, display_wit).
action_verb(display_wit_successfully, past, 'display wit successfully').
action_verb(display_wit_successfully, present, 'display wit successfully').
action_target_type(display_wit_successfully, other).
action_requires_target(display_wit_successfully).
action_range(display_wit_successfully, 5).
action_is_accept(display_wit_successfully).
action_effect(display_wit_successfully, (modify_network(Target, Actor, emulation, +, 5))).
can_perform(Actor, display_wit_successfully, Target) :- true.

%% display_wit_unsuccessfully
% Action: display wit unsuccessfully
% Source: Ensemble / impression-display

action(display_wit_unsuccessfully, 'display wit unsuccessfully', social, 1).
action_difficulty(display_wit_unsuccessfully, 0.5).
action_duration(display_wit_unsuccessfully, 1).
action_category(display_wit_unsuccessfully, impression_display).
action_source(display_wit_unsuccessfully, ensemble).
action_parent(display_wit_unsuccessfully, display_wit).
action_verb(display_wit_unsuccessfully, past, 'display wit unsuccessfully').
action_verb(display_wit_unsuccessfully, present, 'display wit unsuccessfully').
action_target_type(display_wit_unsuccessfully, other).
action_requires_target(display_wit_unsuccessfully).
action_range(display_wit_unsuccessfully, 5).
action_effect(display_wit_unsuccessfully, (modify_network(Target, Actor, emulation, -, 5))).
can_perform(Actor, display_wit_unsuccessfully, Target) :- true.

%% display_initiative_successfully
% Action: display initiative successfully
% Source: Ensemble / impression-display

action(display_initiative_successfully, 'display initiative successfully', social, 1).
action_difficulty(display_initiative_successfully, 0.5).
action_duration(display_initiative_successfully, 1).
action_category(display_initiative_successfully, impression_display).
action_source(display_initiative_successfully, ensemble).
action_parent(display_initiative_successfully, display_initiative).
action_verb(display_initiative_successfully, past, 'display initiative successfully').
action_verb(display_initiative_successfully, present, 'display initiative successfully').
action_target_type(display_initiative_successfully, self).
action_is_accept(display_initiative_successfully).
can_perform(Actor, display_initiative_successfully) :- true.

%% display_initiative_unsuccessfully
% Action: display initiative unsuccessfully
% Source: Ensemble / impression-display

action(display_initiative_unsuccessfully, 'display initiative unsuccessfully', social, 1).
action_difficulty(display_initiative_unsuccessfully, 0.5).
action_duration(display_initiative_unsuccessfully, 1).
action_category(display_initiative_unsuccessfully, impression_display).
action_source(display_initiative_unsuccessfully, ensemble).
action_parent(display_initiative_unsuccessfully, display_initiative).
action_verb(display_initiative_unsuccessfully, past, 'display initiative unsuccessfully').
action_verb(display_initiative_unsuccessfully, present, 'display initiative unsuccessfully').
action_target_type(display_initiative_unsuccessfully, self).
can_perform(Actor, display_initiative_unsuccessfully) :- true.

%% display_worldliness_successfully
% Action: display worldliness successfully
% Source: Ensemble / impression-display

action(display_worldliness_successfully, 'display worldliness successfully', social, 1).
action_difficulty(display_worldliness_successfully, 0.5).
action_duration(display_worldliness_successfully, 1).
action_category(display_worldliness_successfully, impression_display).
action_source(display_worldliness_successfully, ensemble).
action_parent(display_worldliness_successfully, display_worldliness).
action_verb(display_worldliness_successfully, past, 'display worldliness successfully').
action_verb(display_worldliness_successfully, present, 'display worldliness successfully').
action_target_type(display_worldliness_successfully, other).
action_requires_target(display_worldliness_successfully).
action_range(display_worldliness_successfully, 5).
action_is_accept(display_worldliness_successfully).
action_effect(display_worldliness_successfully, (modify_network(Target, Actor, emulation, +, 5))).
can_perform(Actor, display_worldliness_successfully, Target) :- true.

%% display_worldliness_unsuccessfully
% Action: display worldliness unsuccessfully
% Source: Ensemble / impression-display

action(display_worldliness_unsuccessfully, 'display worldliness unsuccessfully', social, 1).
action_difficulty(display_worldliness_unsuccessfully, 0.5).
action_duration(display_worldliness_unsuccessfully, 1).
action_category(display_worldliness_unsuccessfully, impression_display).
action_source(display_worldliness_unsuccessfully, ensemble).
action_parent(display_worldliness_unsuccessfully, display_worldliness).
action_verb(display_worldliness_unsuccessfully, past, 'display worldliness unsuccessfully').
action_verb(display_worldliness_unsuccessfully, present, 'display worldliness unsuccessfully').
action_target_type(display_worldliness_unsuccessfully, other).
action_requires_target(display_worldliness_unsuccessfully).
action_range(display_worldliness_unsuccessfully, 5).
action_effect(display_worldliness_unsuccessfully, (modify_network(Target, Actor, emulation, -, 5))).
can_perform(Actor, display_worldliness_unsuccessfully, Target) :- true.

%% display_eccentricity_successfully
% Action: display eccentricity successfully
% Source: Ensemble / impression-display

action(display_eccentricity_successfully, 'display eccentricity successfully', social, 1).
action_difficulty(display_eccentricity_successfully, 0.5).
action_duration(display_eccentricity_successfully, 1).
action_category(display_eccentricity_successfully, impression_display).
action_source(display_eccentricity_successfully, ensemble).
action_parent(display_eccentricity_successfully, display_eccentricity).
action_verb(display_eccentricity_successfully, past, 'display eccentricity successfully').
action_verb(display_eccentricity_successfully, present, 'display eccentricity successfully').
action_target_type(display_eccentricity_successfully, other).
action_requires_target(display_eccentricity_successfully).
action_range(display_eccentricity_successfully, 5).
action_is_accept(display_eccentricity_successfully).
action_effect(display_eccentricity_successfully, (modify_network(Target, Actor, emulation, -, 5))).
can_perform(Actor, display_eccentricity_successfully, Target) :- true.

%% display_eccentricity_unsuccessfully
% Action: display eccentricity unsuccessfully
% Source: Ensemble / impression-display

action(display_eccentricity_unsuccessfully, 'display eccentricity unsuccessfully', social, 1).
action_difficulty(display_eccentricity_unsuccessfully, 0.5).
action_duration(display_eccentricity_unsuccessfully, 1).
action_category(display_eccentricity_unsuccessfully, impression_display).
action_source(display_eccentricity_unsuccessfully, ensemble).
action_parent(display_eccentricity_unsuccessfully, display_eccentricity).
action_verb(display_eccentricity_unsuccessfully, past, 'display eccentricity unsuccessfully').
action_verb(display_eccentricity_unsuccessfully, present, 'display eccentricity unsuccessfully').
action_target_type(display_eccentricity_unsuccessfully, other).
action_requires_target(display_eccentricity_unsuccessfully).
action_range(display_eccentricity_unsuccessfully, 5).
action_effect(display_eccentricity_unsuccessfully, (modify_network(Target, Actor, emulation, +, 5))).
can_perform(Actor, display_eccentricity_unsuccessfully, Target) :- true.

%% reveal_ignorance_successfully
% Action: reveal ignorance successfully
% Source: Ensemble / impression-display

action(reveal_ignorance_successfully, 'reveal ignorance successfully', social, 1).
action_difficulty(reveal_ignorance_successfully, 0.5).
action_duration(reveal_ignorance_successfully, 1).
action_category(reveal_ignorance_successfully, impression_display).
action_source(reveal_ignorance_successfully, ensemble).
action_parent(reveal_ignorance_successfully, reveal_ignorance).
action_verb(reveal_ignorance_successfully, past, 'reveal ignorance successfully').
action_verb(reveal_ignorance_successfully, present, 'reveal ignorance successfully').
action_target_type(reveal_ignorance_successfully, self).
action_is_accept(reveal_ignorance_successfully).
can_perform(Actor, reveal_ignorance_successfully) :- true.

%% reveal_ignorance_unsuccessfully
% Action: reveal ignorance unsuccessfully
% Source: Ensemble / impression-display

action(reveal_ignorance_unsuccessfully, 'reveal ignorance unsuccessfully', social, 1).
action_difficulty(reveal_ignorance_unsuccessfully, 0.5).
action_duration(reveal_ignorance_unsuccessfully, 1).
action_category(reveal_ignorance_unsuccessfully, impression_display).
action_source(reveal_ignorance_unsuccessfully, ensemble).
action_parent(reveal_ignorance_unsuccessfully, reveal_ignorance).
action_verb(reveal_ignorance_unsuccessfully, past, 'reveal ignorance unsuccessfully').
action_verb(reveal_ignorance_unsuccessfully, present, 'reveal ignorance unsuccessfully').
action_target_type(reveal_ignorance_unsuccessfully, other).
action_requires_target(reveal_ignorance_unsuccessfully).
action_range(reveal_ignorance_unsuccessfully, 5).
action_effect(reveal_ignorance_unsuccessfully, (modify_network(Target, Actor, credibility, +, 5))).
can_perform(Actor, reveal_ignorance_unsuccessfully, Target) :- true.

%% reveal_a_dirty_secret
% Action: reveal a dirty secret
% Source: Ensemble / impression-display

action(reveal_a_dirty_secret, 'reveal a dirty secret', social, 1).
action_difficulty(reveal_a_dirty_secret, 0.5).
action_duration(reveal_a_dirty_secret, 1).
action_category(reveal_a_dirty_secret, impression_display).
action_source(reveal_a_dirty_secret, ensemble).
action_verb(reveal_a_dirty_secret, past, 'reveal a dirty secret').
action_verb(reveal_a_dirty_secret, present, 'reveal a dirty secret').
action_target_type(reveal_a_dirty_secret, other).
action_requires_target(reveal_a_dirty_secret).
action_range(reveal_a_dirty_secret, 5).
action_is_accept(reveal_a_dirty_secret).
action_prerequisite(reveal_a_dirty_secret, (ensemble_condition(Target, caught in a lie by, true))).
action_prerequisite(reveal_a_dirty_secret, (ensemble_condition(Target, made a faux pas around, true))).
action_prerequisite(reveal_a_dirty_secret, (attribute(Someone, propriety, V), V =:= 50)).
action_effect(reveal_a_dirty_secret, (assert(relationship(Actor, Target, rivals)))).
action_effect(reveal_a_dirty_secret, (modify_network(Target, Actor, affinity, -, 10))).
% Can Actor perform this action?
can_perform(Actor, reveal_a_dirty_secret, Target) :-
    ensemble_condition(Target, caught in a lie by, true),
    ensemble_condition(Target, made a faux pas around, true),
    attribute(Someone, propriety, V), V =:= 50.

%% demonstratevirtue_successfully
% Action: demonstratevirtue successfully
% Source: Ensemble / impression-display

action(demonstratevirtue_successfully, 'demonstratevirtue successfully', social, 1).
action_difficulty(demonstratevirtue_successfully, 0.5).
action_duration(demonstratevirtue_successfully, 1).
action_category(demonstratevirtue_successfully, impression_display).
action_source(demonstratevirtue_successfully, ensemble).
action_parent(demonstratevirtue_successfully, demonstrate_virtue).
action_verb(demonstratevirtue_successfully, past, 'demonstratevirtue successfully').
action_verb(demonstratevirtue_successfully, present, 'demonstratevirtue successfully').
action_target_type(demonstratevirtue_successfully, other).
action_requires_target(demonstratevirtue_successfully).
action_range(demonstratevirtue_successfully, 5).
action_is_accept(demonstratevirtue_successfully).
action_effect(demonstratevirtue_successfully, (assert(relationship(Actor, Target, esteem)))).
can_perform(Actor, demonstratevirtue_successfully, Target) :- true.

%% demonstratevirtue_unsuccessfully
% Action: demonstratevirtue unsuccessfully
% Source: Ensemble / impression-display

action(demonstratevirtue_unsuccessfully, 'demonstratevirtue unsuccessfully', social, 1).
action_difficulty(demonstratevirtue_unsuccessfully, 0.5).
action_duration(demonstratevirtue_unsuccessfully, 1).
action_category(demonstratevirtue_unsuccessfully, impression_display).
action_source(demonstratevirtue_unsuccessfully, ensemble).
action_parent(demonstratevirtue_unsuccessfully, demonstrate_virtue).
action_verb(demonstratevirtue_unsuccessfully, past, 'demonstratevirtue unsuccessfully').
action_verb(demonstratevirtue_unsuccessfully, present, 'demonstratevirtue unsuccessfully').
action_target_type(demonstratevirtue_unsuccessfully, other).
action_requires_target(demonstratevirtue_unsuccessfully).
action_range(demonstratevirtue_unsuccessfully, 5).
action_effect(demonstratevirtue_unsuccessfully, (retract(relationship(Actor, Target, esteem)))).
can_perform(Actor, demonstratevirtue_unsuccessfully, Target) :- true.

%% show_off_knowledge_through_small_talk
% Action: Show off knowledge through small talk
% Source: Ensemble / impression-display

action(show_off_knowledge_through_small_talk, 'Show off knowledge through small talk', social, 1).
action_difficulty(show_off_knowledge_through_small_talk, 0.5).
action_duration(show_off_knowledge_through_small_talk, 1).
action_category(show_off_knowledge_through_small_talk, impression_display).
action_source(show_off_knowledge_through_small_talk, ensemble).
action_verb(show_off_knowledge_through_small_talk, past, 'show off knowledge through small talk').
action_verb(show_off_knowledge_through_small_talk, present, 'show off knowledge through small talk').
action_target_type(show_off_knowledge_through_small_talk, self).
can_perform(Actor, show_off_knowledge_through_small_talk) :- true.

