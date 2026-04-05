%% Insimul Actions: Cyberpunk Megacity
%% Source: data/worlds/cyberpunk/actions.pl
%% Created: 2026-04-03
%% Total: 12 actions
%%
%% Predicate schema:
%%   action/4 -- action(AtomId, Name, Type, EnergyCost)
%%   action_difficulty/2, action_duration/2, action_category/2
%%   action_verb/3, action_target_type/2
%%   action_prerequisite/2, action_effect/2, can_perform/3

%% ═══════════════════════════════════════════════════════════
%% Netrunning / Hacking Actions
%% ═══════════════════════════════════════════════════════════

%% hack_terminal
%% Breach a local terminal to extract data or disable security
action(hack_terminal, 'hack_terminal', tech, 3).
action_difficulty(hack_terminal, 0.6).
action_duration(hack_terminal, 2).
action_category(hack_terminal, hacking).
action_verb(hack_terminal, past, 'hacked').
action_verb(hack_terminal, present, 'hacks').
action_target_type(hack_terminal, object).
action_prerequisite(hack_terminal, (trait(Actor, netrunner, true), near(Actor, Target, 3))).
action_effect(hack_terminal, (assert(breached(Target)), assert(alert_level_increase(Target, 1)))).
can_perform(Actor, hack_terminal, Target) :-
    trait(Actor, netrunner, true),
    near(Actor, Target, 3),
    \+ locked_out(Actor, Target).

%% jack_into_net
%% Connect neural interface directly to the Net for deep diving
action(jack_into_net, 'jack_into_net', tech, 5).
action_difficulty(jack_into_net, 0.8).
action_duration(jack_into_net, 4).
action_category(jack_into_net, hacking).
action_verb(jack_into_net, past, 'jacked into the net').
action_verb(jack_into_net, present, 'jacks into the net').
action_target_type(jack_into_net, self).
action_prerequisite(jack_into_net, (trait(Actor, neural_interface, true), at_location(Actor, net_access_point))).
action_effect(jack_into_net, (assert(in_cyberspace(Actor)), assert(vulnerable_body(Actor)))).
can_perform(Actor, jack_into_net, _Target) :-
    trait(Actor, neural_interface, true),
    \+ in_cyberspace(Actor).

%% deploy_ice_breaker
%% Run an ICE-breaking program to bypass corporate firewalls
action(deploy_ice_breaker, 'deploy_ice_breaker', tech, 4).
action_difficulty(deploy_ice_breaker, 0.7).
action_duration(deploy_ice_breaker, 3).
action_category(deploy_ice_breaker, hacking).
action_verb(deploy_ice_breaker, past, 'deployed an ICE breaker').
action_verb(deploy_ice_breaker, present, 'deploys an ICE breaker').
action_target_type(deploy_ice_breaker, object).
action_prerequisite(deploy_ice_breaker, (in_cyberspace(Actor), has_item(Actor, ice_breaker_program))).
action_effect(deploy_ice_breaker, (assert(firewall_down(Target)))).
can_perform(Actor, deploy_ice_breaker, Target) :-
    in_cyberspace(Actor),
    has_item(Actor, ice_breaker_program),
    firewall_active(Target).

%% ═══════════════════════════════════════════════════════════
%% Combat / Street Actions
%% ═══════════════════════════════════════════════════════════

%% activate_combat_augments
%% Power up cybernetic combat enhancements
action(activate_combat_augments, 'activate_combat_augments', combat, 4).
action_difficulty(activate_combat_augments, 0.3).
action_duration(activate_combat_augments, 1).
action_category(activate_combat_augments, augmentation).
action_verb(activate_combat_augments, past, 'activated combat augments').
action_verb(activate_combat_augments, present, 'activates combat augments').
action_target_type(activate_combat_augments, self).
action_prerequisite(activate_combat_augments, (trait(Actor, cyberware_combat, true))).
action_effect(activate_combat_augments, (assert(augments_active(Actor)), assert(humanity_decrease(Actor, 1)))).
can_perform(Actor, activate_combat_augments, _Target) :-
    trait(Actor, cyberware_combat, true),
    \+ augments_active(Actor).

%% street_brawl
%% Engage in close-quarters street combat
action(street_brawl, 'street_brawl', combat, 3).
action_difficulty(street_brawl, 0.5).
action_duration(street_brawl, 2).
action_category(street_brawl, combat).
action_verb(street_brawl, past, 'brawled with').
action_verb(street_brawl, present, 'brawls with').
action_target_type(street_brawl, other).
action_requires_target(street_brawl).
action_range(street_brawl, 2).
action_prerequisite(street_brawl, (near(Actor, Target, 2))).
action_effect(street_brawl, (assert(in_combat(Actor, Target)))).
can_perform(Actor, street_brawl, Target) :-
    near(Actor, Target, 2),
    \+ ally(Actor, Target).

%% ═══════════════════════════════════════════════════════════
%% Social / Fixer Actions
%% ═══════════════════════════════════════════════════════════

%% negotiate_contract
%% Broker a deal between parties for payment or favors
action(negotiate_contract, 'negotiate_contract', social, 2).
action_difficulty(negotiate_contract, 0.5).
action_duration(negotiate_contract, 3).
action_category(negotiate_contract, social).
action_verb(negotiate_contract, past, 'negotiated a contract with').
action_verb(negotiate_contract, present, 'negotiates a contract with').
action_target_type(negotiate_contract, other).
action_requires_target(negotiate_contract).
action_range(negotiate_contract, 5).
action_prerequisite(negotiate_contract, (near(Actor, Target, 5))).
action_effect(negotiate_contract, (assert(contract(Actor, Target)), assert(debt(Target, Actor, 1)))).
can_perform(Actor, negotiate_contract, Target) :-
    near(Actor, Target, 5),
    \+ hostile(Actor, Target).

%% call_in_favor
%% Cash in a debt owed by another character
action(call_in_favor, 'call_in_favor', social, 1).
action_difficulty(call_in_favor, 0.3).
action_duration(call_in_favor, 1).
action_category(call_in_favor, social).
action_verb(call_in_favor, past, 'called in a favor from').
action_verb(call_in_favor, present, 'calls in a favor from').
action_target_type(call_in_favor, other).
action_requires_target(call_in_favor).
action_prerequisite(call_in_favor, (network(Actor, Target, debt, Debt_val), Debt_val > 0)).
action_effect(call_in_favor, (assert(favor_owed(Target, Actor)), retract(debt(Target, Actor, _)))).
can_perform(Actor, call_in_favor, Target) :-
    network(Actor, Target, debt, Debt_val),
    Debt_val > 0.

%% spread_street_rumor
%% Plant information or disinformation through the street network
action(spread_street_rumor, 'spread_street_rumor', social, 2).
action_difficulty(spread_street_rumor, 0.4).
action_duration(spread_street_rumor, 2).
action_category(spread_street_rumor, social).
action_verb(spread_street_rumor, past, 'spread a rumor about').
action_verb(spread_street_rumor, present, 'spreads a rumor about').
action_target_type(spread_street_rumor, other).
action_requires_target(spread_street_rumor).
action_prerequisite(spread_street_rumor, (trait(Actor, street_cred, Cred_val), Cred_val > 3)).
action_effect(spread_street_rumor, (assert(rumor_active(Target)), assert(reputation_change(Target, -1)))).
can_perform(Actor, spread_street_rumor, Target) :-
    trait(Actor, street_cred, Cred_val),
    Cred_val > 3.

%% ═══════════════════════════════════════════════════════════
%% Augmentation / Medical Actions
%% ═══════════════════════════════════════════════════════════

%% install_cyberware
%% Have a ripperdoc install cybernetic augmentation
action(install_cyberware, 'install_cyberware', medical, 6).
action_difficulty(install_cyberware, 0.7).
action_duration(install_cyberware, 5).
action_category(install_cyberware, augmentation).
action_verb(install_cyberware, past, 'installed cyberware on').
action_verb(install_cyberware, present, 'installs cyberware on').
action_target_type(install_cyberware, other).
action_requires_target(install_cyberware).
action_range(install_cyberware, 2).
action_prerequisite(install_cyberware, (trait(Actor, ripperdoc, true), near(Actor, Target, 2))).
action_effect(install_cyberware, (assert(augmented(Target)), assert(humanity_decrease(Target, 2)))).
can_perform(Actor, install_cyberware, Target) :-
    trait(Actor, ripperdoc, true),
    near(Actor, Target, 2).

%% administer_stim
%% Inject a combat stimulant for temporary boost
action(administer_stim, 'administer_stim', medical, 1).
action_difficulty(administer_stim, 0.2).
action_duration(administer_stim, 1).
action_category(administer_stim, medical).
action_verb(administer_stim, past, 'administered a stim to').
action_verb(administer_stim, present, 'administers a stim to').
action_target_type(administer_stim, other).
action_requires_target(administer_stim).
action_range(administer_stim, 2).
action_prerequisite(administer_stim, (has_item(Actor, combat_stim), near(Actor, Target, 2))).
action_effect(administer_stim, (assert(stimmed(Target)), retract(has_item(Actor, combat_stim)))).
can_perform(Actor, administer_stim, Target) :-
    has_item(Actor, combat_stim),
    near(Actor, Target, 2).

%% ═══════════════════════════════════════════════════════════
%% Stealth / Infiltration Actions
%% ═══════════════════════════════════════════════════════════

%% cloak_with_optic_camo
%% Activate optical camouflage to become nearly invisible
action(cloak_with_optic_camo, 'cloak_with_optic_camo', stealth, 3).
action_difficulty(cloak_with_optic_camo, 0.5).
action_duration(cloak_with_optic_camo, 3).
action_category(cloak_with_optic_camo, stealth).
action_verb(cloak_with_optic_camo, past, 'activated optic camo').
action_verb(cloak_with_optic_camo, present, 'activates optic camo').
action_target_type(cloak_with_optic_camo, self).
action_prerequisite(cloak_with_optic_camo, (trait(Actor, optic_camo, true))).
action_effect(cloak_with_optic_camo, (assert(cloaked(Actor)))).
can_perform(Actor, cloak_with_optic_camo, _Target) :-
    trait(Actor, optic_camo, true),
    \+ cloaked(Actor).

%% scan_for_surveillance
%% Use cybernetic optics to detect cameras, drones, and tracking devices
action(scan_for_surveillance, 'scan_for_surveillance', tech, 2).
action_difficulty(scan_for_surveillance, 0.4).
action_duration(scan_for_surveillance, 2).
action_category(scan_for_surveillance, recon).
action_verb(scan_for_surveillance, past, 'scanned the area for surveillance').
action_verb(scan_for_surveillance, present, 'scans the area for surveillance').
action_target_type(scan_for_surveillance, area).
action_prerequisite(scan_for_surveillance, (trait(Actor, cyber_optics, true))).
action_effect(scan_for_surveillance, (assert(area_scanned(Actor, Location)))).
can_perform(Actor, scan_for_surveillance, _Target) :-
    trait(Actor, cyber_optics, true).
