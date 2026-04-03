%% Ensemble Actions: romantic-flirting
%% Source: data/ensemble/actions/romantic-flirting.json
%% Converted: 2026-04-01T20:15:17.346Z
%% Total actions: 13

%% flirt
% Action: FLIRT
% Source: Ensemble / romantic-flirting

action(flirt, 'FLIRT', romantic, 1).
action_difficulty(flirt, 0.5).
action_duration(flirt, 1).
action_category(flirt, romantic_flirting).
action_source(flirt, ensemble).
action_verb(flirt, past, 'flirt').
action_verb(flirt, present, 'flirt').
action_target_type(flirt, self).
action_leads_to(flirt, looking_forward_to_getting_to_know_you_better).
action_leads_to(flirt, what_should_we_order_with_romance).
action_leads_to(flirt, flirty_response_about_pizza).
action_leads_to(flirt, flirty_chit_chat).
action_leads_to(flirt, flirty_chit_chat_right_back_at_y).
action_leads_to(flirt, make_innuendo).
action_leads_to(flirt, oooooh_la_la).
action_leads_to(flirt, don_t_understand_but_pretend_to_laugh_because_you_have_the_hots_for_them).
action_leads_to(flirt, compliment_appearance).
action_leads_to(flirt, make_suggestive_eyes_at).
action_leads_to(flirt, introduce_self_flirty).
action_leads_to(flirt, flirt_with_the_person_that_approached_you).
can_perform(Actor, flirt) :- true.

%% pickup_line
% Action: PICKUP LINE
% Source: Ensemble / romantic-flirting

action(pickup_line, 'PICKUP LINE', romantic, 1).
action_difficulty(pickup_line, 0.5).
action_duration(pickup_line, 1).
action_category(pickup_line, romantic_flirting).
action_source(pickup_line, ensemble).
action_verb(pickup_line, past, 'pickup line').
action_verb(pickup_line, present, 'pickup line').
action_target_type(pickup_line, self).
action_leads_to(pickup_line, pickuplineterminal).
action_influence(pickup_line, (influence(unknown, _, _, weight, +, 0))).
can_perform(Actor, pickup_line) :- true.

%% seduce
% Action: SEDUCE
% Source: Ensemble / romantic-flirting

action(seduce, 'SEDUCE', romantic, 1).
action_difficulty(seduce, 0.5).
action_duration(seduce, 1).
action_category(seduce, romantic_flirting).
action_source(seduce, ensemble).
action_verb(seduce, past, 'seduce').
action_verb(seduce, present, 'seduce').
action_target_type(seduce, self).
action_leads_to(seduce, homosexual_sexual_assault).
action_leads_to(seduce, man_professes_passion_for_virtuous_woman_get_rejected_and_loves_her_even_more).
action_leads_to(seduce, looking_at_someone_faire_les_yeux_doux).
action_leads_to(seduce, discovered_cheater_refused_a_kiss).
action_leads_to(seduce, virtuous_wife_rejects_man_s_attempt_to_seduce_her).
action_leads_to(seduce, get_drunk_together).
action_leads_to(seduce, talk_about_the_loved_one).
action_leads_to(seduce, seduce_flirt_successfully_default).
action_leads_to(seduce, seduce_flirt_unsuccessfully_default).
can_perform(Actor, seduce) :- true.

%% pickuplineterminal
% Action: pickupLineTerminal
% Source: Ensemble / romantic-flirting

action(pickuplineterminal, 'pickupLineTerminal', romantic, 1).
action_difficulty(pickuplineterminal, 0.5).
action_duration(pickuplineterminal, 1).
action_category(pickuplineterminal, romantic_flirting).
action_source(pickuplineterminal, ensemble).
action_parent(pickuplineterminal, pickup_line).
action_verb(pickuplineterminal, past, 'pickuplineterminal').
action_verb(pickuplineterminal, present, 'pickuplineterminal').
action_target_type(pickuplineterminal, other).
action_requires_target(pickuplineterminal).
action_range(pickuplineterminal, 5).
action_is_accept(pickuplineterminal).
action_effect(pickuplineterminal, (assert(relationship(Actor, Target, involved with)))).
can_perform(Actor, pickuplineterminal, Target) :- true.

%% looking_at_someone_faire_les_yeux_doux
% Action: looking at someone/ faire les yeux doux
% Source: Ensemble / romantic-flirting

action(looking_at_someone_faire_les_yeux_doux, 'looking at someone/ faire les yeux doux', romantic, 1).
action_difficulty(looking_at_someone_faire_les_yeux_doux, 0.5).
action_duration(looking_at_someone_faire_les_yeux_doux, 1).
action_category(looking_at_someone_faire_les_yeux_doux, romantic_flirting).
action_source(looking_at_someone_faire_les_yeux_doux, ensemble).
action_parent(looking_at_someone_faire_les_yeux_doux, seduce).
action_verb(looking_at_someone_faire_les_yeux_doux, past, 'looking at someone/ faire les yeux doux').
action_verb(looking_at_someone_faire_les_yeux_doux, present, 'looking at someone/ faire les yeux doux').
action_target_type(looking_at_someone_faire_les_yeux_doux, other).
action_requires_target(looking_at_someone_faire_les_yeux_doux).
action_range(looking_at_someone_faire_les_yeux_doux, 5).
action_is_accept(looking_at_someone_faire_les_yeux_doux).
action_prerequisite(looking_at_someone_faire_les_yeux_doux, (trait(Actor, male))).
action_prerequisite(looking_at_someone_faire_les_yeux_doux, (trait(Actor, innocent looking))).
action_prerequisite(looking_at_someone_faire_les_yeux_doux, (attribute(Actor, propriety, V), V > 50)).
action_effect(looking_at_someone_faire_les_yeux_doux, (modify_network(Target, Actor, affinity, +, 10))).
% Can Actor perform this action?
can_perform(Actor, looking_at_someone_faire_les_yeux_doux, Target) :-
    trait(Actor, male),
    trait(Actor, innocent looking),
    attribute(Actor, propriety, V), V > 50.

%% virtuous_wife_rejects_man_s_attempt_to_seduce_her
% Action: virtuous wife rejects man’s attempt to seduce her
% Source: Ensemble / romantic-flirting

action(virtuous_wife_rejects_man_s_attempt_to_seduce_her, 'virtuous wife rejects man''s attempt to seduce her', romantic, 1).
action_difficulty(virtuous_wife_rejects_man_s_attempt_to_seduce_her, 0.5).
action_duration(virtuous_wife_rejects_man_s_attempt_to_seduce_her, 1).
action_category(virtuous_wife_rejects_man_s_attempt_to_seduce_her, romantic_flirting).
action_source(virtuous_wife_rejects_man_s_attempt_to_seduce_her, ensemble).
action_parent(virtuous_wife_rejects_man_s_attempt_to_seduce_her, seduce).
action_verb(virtuous_wife_rejects_man_s_attempt_to_seduce_her, past, 'virtuous wife rejects man''s attempt to seduce her').
action_verb(virtuous_wife_rejects_man_s_attempt_to_seduce_her, present, 'virtuous wife rejects man''s attempt to seduce her').
action_target_type(virtuous_wife_rejects_man_s_attempt_to_seduce_her, other).
action_requires_target(virtuous_wife_rejects_man_s_attempt_to_seduce_her).
action_range(virtuous_wife_rejects_man_s_attempt_to_seduce_her, 5).
action_prerequisite(virtuous_wife_rejects_man_s_attempt_to_seduce_her, (trait(Actor, female))).
action_prerequisite(virtuous_wife_rejects_man_s_attempt_to_seduce_her, (trait(Actor, virtuous))).
action_prerequisite(virtuous_wife_rejects_man_s_attempt_to_seduce_her, (relationship(Actor, 'third', married))).
action_prerequisite(virtuous_wife_rejects_man_s_attempt_to_seduce_her, (network(Target, Actor, affinity, V), V > 60)).
action_prerequisite(virtuous_wife_rejects_man_s_attempt_to_seduce_her, (network(Actor, Target, affinity, V), V < 40)).
action_prerequisite(virtuous_wife_rejects_man_s_attempt_to_seduce_her, (trait(Target, flirtatious))).
action_prerequisite(virtuous_wife_rejects_man_s_attempt_to_seduce_her, (ensemble_condition('third', suspicious of, true))).
action_effect(virtuous_wife_rejects_man_s_attempt_to_seduce_her, (modify_network('third', Actor, affinity, +, 20))).
action_effect(virtuous_wife_rejects_man_s_attempt_to_seduce_her, (assert(status(Target, embarrassed)))).
action_effect(virtuous_wife_rejects_man_s_attempt_to_seduce_her, (modify_network(Target, Actor, affinity, -, 20))).
action_effect(virtuous_wife_rejects_man_s_attempt_to_seduce_her, (assert(relationship('third', Target, rivals)))).
% Can Actor perform this action?
can_perform(Actor, virtuous_wife_rejects_man_s_attempt_to_seduce_her, Target) :-
    trait(Actor, female),
    trait(Actor, virtuous),
    relationship(Actor, 'third', married),
    network(Target, Actor, affinity, V), V > 60,
    network(Actor, Target, affinity, V), V < 40,
    trait(Target, flirtatious),
    ensemble_condition('third', suspicious of, true).

%% seduce_flirt_successfully_default
% Action: seduce/flirt successfully-default
% Source: Ensemble / romantic-flirting

action(seduce_flirt_successfully_default, 'seduce/flirt successfully-default', romantic, 1).
action_difficulty(seduce_flirt_successfully_default, 0.5).
action_duration(seduce_flirt_successfully_default, 1).
action_category(seduce_flirt_successfully_default, romantic_flirting).
action_source(seduce_flirt_successfully_default, ensemble).
action_parent(seduce_flirt_successfully_default, seduce).
action_verb(seduce_flirt_successfully_default, past, 'seduce/flirt successfully-default').
action_verb(seduce_flirt_successfully_default, present, 'seduce/flirt successfully-default').
action_target_type(seduce_flirt_successfully_default, other).
action_requires_target(seduce_flirt_successfully_default).
action_range(seduce_flirt_successfully_default, 5).
action_is_accept(seduce_flirt_successfully_default).
action_effect(seduce_flirt_successfully_default, (modify_network(Target, Actor, affinity, +, 5))).
can_perform(Actor, seduce_flirt_successfully_default, Target) :- true.

%% seduce_flirt_unsuccessfully_default
% Action: seduce/flirt unsuccessfully-default
% Source: Ensemble / romantic-flirting

action(seduce_flirt_unsuccessfully_default, 'seduce/flirt unsuccessfully-default', romantic, 1).
action_difficulty(seduce_flirt_unsuccessfully_default, 0.5).
action_duration(seduce_flirt_unsuccessfully_default, 1).
action_category(seduce_flirt_unsuccessfully_default, romantic_flirting).
action_source(seduce_flirt_unsuccessfully_default, ensemble).
action_parent(seduce_flirt_unsuccessfully_default, seduce).
action_verb(seduce_flirt_unsuccessfully_default, past, 'seduce/flirt unsuccessfully-default').
action_verb(seduce_flirt_unsuccessfully_default, present, 'seduce/flirt unsuccessfully-default').
action_target_type(seduce_flirt_unsuccessfully_default, other).
action_requires_target(seduce_flirt_unsuccessfully_default).
action_range(seduce_flirt_unsuccessfully_default, 5).
action_effect(seduce_flirt_unsuccessfully_default, (modify_network(Target, Actor, affinity, -, 5))).
can_perform(Actor, seduce_flirt_unsuccessfully_default, Target) :- true.

%% flirty_response_about_pizza
% Action: Flirty response about pizza
% Source: Ensemble / romantic-flirting

action(flirty_response_about_pizza, 'Flirty response about pizza', romantic, 1).
action_difficulty(flirty_response_about_pizza, 0.5).
action_duration(flirty_response_about_pizza, 1).
action_category(flirty_response_about_pizza, romantic_flirting).
action_source(flirty_response_about_pizza, ensemble).
action_parent(flirty_response_about_pizza, flirt).
action_verb(flirty_response_about_pizza, past, 'flirty response about pizza').
action_verb(flirty_response_about_pizza, present, 'flirty response about pizza').
action_target_type(flirty_response_about_pizza, other).
action_requires_target(flirty_response_about_pizza).
action_range(flirty_response_about_pizza, 5).
action_effect(flirty_response_about_pizza, (modify_network(Actor, Target, attraction, +, 1))).
can_perform(Actor, flirty_response_about_pizza, Target) :- true.

%% flirty_chit_chat
% Action: Flirty chit chat
% Source: Ensemble / romantic-flirting

action(flirty_chit_chat, 'Flirty chit chat', romantic, 1).
action_difficulty(flirty_chit_chat, 0.5).
action_duration(flirty_chit_chat, 1).
action_category(flirty_chit_chat, romantic_flirting).
action_source(flirty_chit_chat, ensemble).
action_parent(flirty_chit_chat, flirt).
action_verb(flirty_chit_chat, past, 'flirty chit chat').
action_verb(flirty_chit_chat, present, 'flirty chit chat').
action_target_type(flirty_chit_chat, self).
can_perform(Actor, flirty_chit_chat) :- true.

%% flirty_chit_chat_right_back_at_y
% Action: Flirty chit chat right back at %y%!
% Source: Ensemble / romantic-flirting

action(flirty_chit_chat_right_back_at_y, 'Flirty chit chat right back at %y%!', romantic, 1).
action_difficulty(flirty_chit_chat_right_back_at_y, 0.5).
action_duration(flirty_chit_chat_right_back_at_y, 1).
action_category(flirty_chit_chat_right_back_at_y, romantic_flirting).
action_source(flirty_chit_chat_right_back_at_y, ensemble).
action_parent(flirty_chit_chat_right_back_at_y, flirt).
action_verb(flirty_chit_chat_right_back_at_y, past, 'flirty chit chat right back at %y%!').
action_verb(flirty_chit_chat_right_back_at_y, present, 'flirty chit chat right back at %y%!').
action_target_type(flirty_chit_chat_right_back_at_y, other).
action_requires_target(flirty_chit_chat_right_back_at_y).
action_range(flirty_chit_chat_right_back_at_y, 5).
action_effect(flirty_chit_chat_right_back_at_y, (modify_network(Actor, Target, attraction, +, 1))).
can_perform(Actor, flirty_chit_chat_right_back_at_y, Target) :- true.

%% make_innuendo
% Action: Make innuendo
% Source: Ensemble / romantic-flirting

action(make_innuendo, 'Make innuendo', romantic, 1).
action_difficulty(make_innuendo, 0.5).
action_duration(make_innuendo, 1).
action_category(make_innuendo, romantic_flirting).
action_source(make_innuendo, ensemble).
action_parent(make_innuendo, flirt).
action_verb(make_innuendo, past, 'make innuendo').
action_verb(make_innuendo, present, 'make innuendo').
action_target_type(make_innuendo, self).
can_perform(Actor, make_innuendo) :- true.

%% flirt_with_the_person_that_approached_you
% Action: Flirt with the person that approached you
% Source: Ensemble / romantic-flirting

action(flirt_with_the_person_that_approached_you, 'Flirt with the person that approached you', romantic, 1).
action_difficulty(flirt_with_the_person_that_approached_you, 0.5).
action_duration(flirt_with_the_person_that_approached_you, 1).
action_category(flirt_with_the_person_that_approached_you, romantic_flirting).
action_source(flirt_with_the_person_that_approached_you, ensemble).
action_parent(flirt_with_the_person_that_approached_you, flirt).
action_verb(flirt_with_the_person_that_approached_you, past, 'flirt with the person that approached you').
action_verb(flirt_with_the_person_that_approached_you, present, 'flirt with the person that approached you').
action_target_type(flirt_with_the_person_that_approached_you, self).
action_influence(flirt_with_the_person_that_approached_you, (influence(unknown, _, _, weight, +, 0))).
can_perform(Actor, flirt_with_the_person_that_approached_you) :- true.




