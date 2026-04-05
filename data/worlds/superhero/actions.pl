%% Insimul Actions: Superhero
%% Source: data/worlds/superhero/actions.pl
%% Created: 2026-04-03
%% Total: 12 actions
%%
%% Predicate schema (base_actions style):
%%   action/4 -- action(AtomId, Name, Category, EnergyCost)
%%   action_difficulty/2, action_duration/2, action_category/2
%%   action_verb/3, action_target_type/2
%%   action_prerequisite/2, action_effect/2, can_perform/3

%% patrol_district
action(patrol_district, 'patrol_district', combat, 3).
action_difficulty(patrol_district, 0.3).
action_duration(patrol_district, 2).
action_category(patrol_district, combat).
action_verb(patrol_district, past, 'patrolled').
action_verb(patrol_district, present, 'patrols').
action_target_type(patrol_district, location).
action_prerequisite(patrol_district, (trait(Actor, heroic))).
action_effect(patrol_district, (assert(patrolled(Actor, Target)))).
can_perform(Actor, patrol_district, Target) :-
    trait(Actor, heroic).

%% investigate_crime
action(investigate_crime, 'investigate_crime', investigation, 3).
action_difficulty(investigate_crime, 0.4).
action_duration(investigate_crime, 2).
action_category(investigate_crime, investigation).
action_verb(investigate_crime, past, 'investigated').
action_verb(investigate_crime, present, 'investigates').
action_target_type(investigate_crime, location).
action_prerequisite(investigate_crime, (has_item(Actor, evidence_bag))).
action_effect(investigate_crime, (assert(investigated(Actor, Target)))).
can_perform(Actor, investigate_crime, Target) :-
    has_item(Actor, evidence_bag).

%% apprehend_villain
action(apprehend_villain, 'apprehend_villain', combat, 6).
action_difficulty(apprehend_villain, 0.7).
action_duration(apprehend_villain, 3).
action_category(apprehend_villain, combat).
action_verb(apprehend_villain, past, 'apprehended').
action_verb(apprehend_villain, present, 'apprehends').
action_target_type(apprehend_villain, other).
action_prerequisite(apprehend_villain, (trait(Actor, heroic))).
action_effect(apprehend_villain, (assert(captured(Actor, Target)))).
can_perform(Actor, apprehend_villain, Target) :-
    trait(Actor, heroic).

%% hack_security
action(hack_security, 'hack_security', stealth, 4).
action_difficulty(hack_security, 0.6).
action_duration(hack_security, 2).
action_category(hack_security, stealth).
action_verb(hack_security, past, 'hacked').
action_verb(hack_security, present, 'hacks').
action_target_type(hack_security, location).
action_prerequisite(hack_security, (has_item(Actor, skeleton_key_card))).
action_effect(hack_security, (assert(bypassed_security(Actor, Target)))).
can_perform(Actor, hack_security, Target) :-
    has_item(Actor, skeleton_key_card).

%% use_grappling_hook
action(use_grappling_hook, 'use_grappling_hook', traversal, 2).
action_difficulty(use_grappling_hook, 0.3).
action_duration(use_grappling_hook, 1).
action_category(use_grappling_hook, traversal).
action_verb(use_grappling_hook, past, 'grappled to').
action_verb(use_grappling_hook, present, 'grapples to').
action_target_type(use_grappling_hook, location).
action_prerequisite(use_grappling_hook, (has_item(Actor, grappling_hook))).
action_effect(use_grappling_hook, (assert(reached(Actor, Target)))).
can_perform(Actor, use_grappling_hook, Target) :-
    has_item(Actor, grappling_hook).

%% deploy_smoke_bomb
action(deploy_smoke_bomb, 'deploy_smoke_bomb', stealth, 2).
action_difficulty(deploy_smoke_bomb, 0.2).
action_duration(deploy_smoke_bomb, 1).
action_category(deploy_smoke_bomb, stealth).
action_verb(deploy_smoke_bomb, past, 'deployed smoke near').
action_verb(deploy_smoke_bomb, present, 'deploys smoke near').
action_target_type(deploy_smoke_bomb, location).
action_prerequisite(deploy_smoke_bomb, (has_item(Actor, smoke_bomb))).
action_effect(deploy_smoke_bomb, (assert(obscured(Actor, Target)))).
can_perform(Actor, deploy_smoke_bomb, Target) :-
    has_item(Actor, smoke_bomb).

%% administer_first_aid
action(administer_first_aid, 'administer_first_aid', medical, 2).
action_difficulty(administer_first_aid, 0.3).
action_duration(administer_first_aid, 1).
action_category(administer_first_aid, medical).
action_verb(administer_first_aid, past, 'treated').
action_verb(administer_first_aid, present, 'treats').
action_target_type(administer_first_aid, other).
action_prerequisite(administer_first_aid, (has_item(Actor, first_aid_kit))).
action_effect(administer_first_aid, (assert(healed(Actor, Target)))).
can_perform(Actor, administer_first_aid, Target) :-
    has_item(Actor, first_aid_kit).

%% interrogate_suspect
action(interrogate_suspect, 'interrogate_suspect', investigation, 3).
action_difficulty(interrogate_suspect, 0.5).
action_duration(interrogate_suspect, 2).
action_category(interrogate_suspect, investigation).
action_verb(interrogate_suspect, past, 'interrogated').
action_verb(interrogate_suspect, present, 'interrogates').
action_target_type(interrogate_suspect, other).
action_prerequisite(interrogate_suspect, (attribute(Actor, cunningness, C), C > 50)).
action_effect(interrogate_suspect, (assert(interrogated(Actor, Target)))).
can_perform(Actor, interrogate_suspect, Target) :-
    attribute(Actor, cunningness, C), C > 50.

%% scan_police_frequencies
action(scan_police_frequencies, 'scan_police_frequencies', surveillance, 1).
action_difficulty(scan_police_frequencies, 0.1).
action_duration(scan_police_frequencies, 1).
action_category(scan_police_frequencies, surveillance).
action_verb(scan_police_frequencies, past, 'scanned frequencies near').
action_verb(scan_police_frequencies, present, 'scans frequencies near').
action_target_type(scan_police_frequencies, location).
action_prerequisite(scan_police_frequencies, (has_item(Actor, police_scanner))).
action_effect(scan_police_frequencies, (assert(monitored(Actor, Target)))).
can_perform(Actor, scan_police_frequencies, Target) :-
    has_item(Actor, police_scanner).

%% apply_power_dampener
action(apply_power_dampener, 'apply_power_dampener', combat, 4).
action_difficulty(apply_power_dampener, 0.6).
action_duration(apply_power_dampener, 1).
action_category(apply_power_dampener, combat).
action_verb(apply_power_dampener, past, 'dampened the powers of').
action_verb(apply_power_dampener, present, 'dampens the powers of').
action_target_type(apply_power_dampener, other).
action_prerequisite(apply_power_dampener, (has_item(Actor, power_dampener_cuffs))).
action_effect(apply_power_dampener, (assert(dampened(Actor, Target)))).
can_perform(Actor, apply_power_dampener, Target) :-
    has_item(Actor, power_dampener_cuffs).

%% contact_informant
action(contact_informant, 'contact_informant', social, 2).
action_difficulty(contact_informant, 0.3).
action_duration(contact_informant, 1).
action_category(contact_informant, social).
action_verb(contact_informant, past, 'contacted').
action_verb(contact_informant, present, 'contacts').
action_target_type(contact_informant, other).
action_prerequisite(contact_informant, (has_item(Actor, burner_phone))).
action_effect(contact_informant, (assert(informed_by(Actor, Target)))).
can_perform(Actor, contact_informant, Target) :-
    has_item(Actor, burner_phone).

%% rescue_civilian
action(rescue_civilian, 'rescue_civilian', combat, 4).
action_difficulty(rescue_civilian, 0.4).
action_duration(rescue_civilian, 2).
action_category(rescue_civilian, combat).
action_verb(rescue_civilian, past, 'rescued').
action_verb(rescue_civilian, present, 'rescues').
action_target_type(rescue_civilian, other).
action_prerequisite(rescue_civilian, (trait(Actor, heroic))).
action_effect(rescue_civilian, (assert(rescued(Actor, Target)))).
can_perform(Actor, rescue_civilian, Target) :-
    trait(Actor, heroic).
