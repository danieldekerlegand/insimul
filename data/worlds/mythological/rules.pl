%% Ensemble Volition Rules: Greek Mythological World
%% Source: data/worlds/mythological/rules.pl
%% Created: 2026-04-03
%% Total rules: 12

%% Heroes seek glory through combat
rule_likelihood(heroes_seek_kleos, 1).
rule_type(heroes_seek_kleos, volition).
rule_active(heroes_seek_kleos).
rule_category(heroes_seek_kleos, heroism).
rule_source(heroes_seek_kleos, mythological).
rule_priority(heroes_seek_kleos, 5).
rule_applies(heroes_seek_kleos, X, Y) :-
    trait(X, brave),
    attribute(X, self_assuredness, SA), SA > 60,
    trait(Y, strong).
rule_effect(heroes_seek_kleos, set_intent(X, challenge, Y, 5)).

%% Demigods draw divine attention
rule_likelihood(demigods_draw_attention, 1).
rule_type(demigods_draw_attention, volition).
rule_active(demigods_draw_attention).
rule_category(demigods_draw_attention, divine).
rule_source(demigods_draw_attention, mythological).
rule_priority(demigods_draw_attention, 4).
rule_applies(demigods_draw_attention, X, _Y) :-
    character_role(X, demigod),
    attribute(X, charisma, C), C > 70.
rule_effect(demigods_draw_attention, assert(status(X, divinely_watched))).

%% Cursed characters seek atonement
rule_likelihood(cursed_seek_atonement, 1).
rule_type(cursed_seek_atonement, volition).
rule_active(cursed_seek_atonement).
rule_category(cursed_seek_atonement, faith).
rule_source(cursed_seek_atonement, mythological).
rule_priority(cursed_seek_atonement, 4).
rule_applies(cursed_seek_atonement, X, Y) :-
    status(X, cursed),
    character_role(Y, priest).
rule_effect(cursed_seek_atonement, set_intent(X, petition, Y, 4)).

%% Proud characters risk hubris
rule_likelihood(proud_risk_hubris, 1).
rule_type(proud_risk_hubris, volition).
rule_active(proud_risk_hubris).
rule_category(proud_risk_hubris, divine).
rule_source(proud_risk_hubris, mythological).
rule_priority(proud_risk_hubris, 3).
rule_applies(proud_risk_hubris, X, _Y) :-
    trait(X, proud),
    attribute(X, self_assuredness, SA), SA > 80.
rule_effect(proud_risk_hubris, assert(status(X, risk_of_hubris))).

%% Nymphs protect their sacred places
rule_likelihood(nymphs_protect_groves, 1).
rule_type(nymphs_protect_groves, volition).
rule_active(nymphs_protect_groves).
rule_category(nymphs_protect_groves, nature).
rule_source(nymphs_protect_groves, mythological).
rule_priority(nymphs_protect_groves, 5).
rule_applies(nymphs_protect_groves, X, Y) :-
    character_role(X, nymph),
    trait(X, protective),
    \+ trait(Y, nature_loving).
rule_effect(nymphs_protect_groves, set_intent(X, ward_off, Y, 5)).

%% Priests interpret divine will
rule_likelihood(priests_interpret_omens, 1).
rule_type(priests_interpret_omens, volition).
rule_active(priests_interpret_omens).
rule_category(priests_interpret_omens, faith).
rule_source(priests_interpret_omens, mythological).
rule_priority(priests_interpret_omens, 3).
rule_applies(priests_interpret_omens, X, Y) :-
    character_role(X, priest),
    attribute(X, cultural_knowledge, CK), CK > 80,
    status(Y, divinely_watched).
rule_effect(priests_interpret_omens, set_intent(X, advise, Y, 3)).

%% Reckless youth court disaster
rule_likelihood(reckless_court_disaster, 1).
rule_type(reckless_court_disaster, volition).
rule_active(reckless_court_disaster).
rule_category(reckless_court_disaster, personality).
rule_source(reckless_court_disaster, mythological).
rule_priority(reckless_court_disaster, 3).
rule_applies(reckless_court_disaster, X, Y) :-
    trait(X, reckless),
    trait(X, young),
    trait(Y, protective).
rule_effect(reckless_court_disaster, modify_network(Y, X, affinity, '+', 3)).

%% Maternal figures protect their children
rule_likelihood(maternal_protection, 1).
rule_type(maternal_protection, volition).
rule_active(maternal_protection).
rule_category(maternal_protection, family).
rule_source(maternal_protection, mythological).
rule_priority(maternal_protection, 5).
rule_applies(maternal_protection, X, Y) :-
    trait(X, maternal),
    child(X, Y),
    attribute(Y, self_assuredness, SA), SA > 70.
rule_effect(maternal_protection, set_intent(X, protect, Y, 5)).

%% The oracle inspires quests
rule_likelihood(oracle_inspires_quests, 1).
rule_type(oracle_inspires_quests, volition).
rule_active(oracle_inspires_quests).
rule_category(oracle_inspires_quests, prophecy).
rule_source(oracle_inspires_quests, mythological).
rule_priority(oracle_inspires_quests, 4).
rule_applies(oracle_inspires_quests, X, Y) :-
    character_role(X, oracle),
    trait(Y, ambitious).
rule_effect(oracle_inspires_quests, set_intent(X, prophesy_to, Y, 4)).

%% Competitive heroes rival each other
rule_likelihood(heroes_rival, 1).
rule_type(heroes_rival, volition).
rule_active(heroes_rival).
rule_category(heroes_rival, rivalry).
rule_source(heroes_rival, mythological).
rule_priority(heroes_rival, 3).
rule_applies(heroes_rival, X, Y) :-
    character_role(X, hero),
    character_role(Y, hero),
    X \= Y,
    attribute(X, self_assuredness, SX), SX > 60,
    attribute(Y, self_assuredness, SY), SY > 60.
rule_effect(heroes_rival, set_intent(X, rival, Y, 3)).

%% Craftsmen earn admiration from warriors
rule_likelihood(craftsmen_admired, 1).
rule_type(craftsmen_admired, volition).
rule_active(craftsmen_admired).
rule_category(craftsmen_admired, profession).
rule_source(craftsmen_admired, mythological).
rule_priority(craftsmen_admired, 2).
rule_applies(craftsmen_admired, X, Y) :-
    character_role(X, hero),
    character_role(Y, artisan),
    attribute(Y, cultural_knowledge, CK), CK > 80.
rule_effect(craftsmen_admired, modify_network(X, Y, affinity, '+', 3)).

%% Grief drives vengeance
rule_likelihood(grief_drives_vengeance, 1).
rule_type(grief_drives_vengeance, volition).
rule_active(grief_drives_vengeance).
rule_category(grief_drives_vengeance, emotional).
rule_source(grief_drives_vengeance, mythological).
rule_priority(grief_drives_vengeance, 4).
rule_applies(grief_drives_vengeance, X, Y) :-
    trait(X, grieving),
    attribute(X, sensitiveness, S), S > 70,
    \+ trait(Y, gentle).
rule_effect(grief_drives_vengeance, set_intent(X, blame, Y, 4)).
