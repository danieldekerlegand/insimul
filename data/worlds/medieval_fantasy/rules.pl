%% Ensemble Volition Rules: Medieval Fantasy
%% Source: data/worlds/medieval_fantasy/rules.pl
%% Created: 2026-04-03
%% Total rules: 12

%% Knights protect the weak
rule_likelihood(knights_protect_the_weak, 1).
rule_type(knights_protect_the_weak, volition).
rule_active(knights_protect_the_weak).
rule_category(knights_protect_the_weak, chivalry).
rule_source(knights_protect_the_weak, medieval_fantasy).
rule_priority(knights_protect_the_weak, 5).
rule_applies(knights_protect_the_weak, X, Y) :-
    trait(X, honorable),
    status(Y, threatened).
rule_effect(knights_protect_the_weak, set_intent(X, protect, Y, 5)).

%% Nobles seek to increase their power
rule_likelihood(nobles_seek_power, 1).
rule_type(nobles_seek_power, volition).
rule_active(nobles_seek_power).
rule_category(nobles_seek_power, politics).
rule_source(nobles_seek_power, medieval_fantasy).
rule_priority(nobles_seek_power, 3).
rule_applies(nobles_seek_power, X, Y) :-
    trait(X, noble),
    attribute(X, status_individual, S), S > 50,
    attribute(Y, status_individual, YS), YS > 50.
rule_effect(nobles_seek_power, set_intent(X, influence, Y, 3)).

%% Commoners distrust magic users
rule_likelihood(commoners_distrust_magic, 1).
rule_type(commoners_distrust_magic, volition).
rule_active(commoners_distrust_magic).
rule_category(commoners_distrust_magic, superstition).
rule_source(commoners_distrust_magic, medieval_fantasy).
rule_priority(commoners_distrust_magic, 3).
rule_applies(commoners_distrust_magic, X, Y) :-
    \+ trait(X, intellectual),
    trait(Y, secretive),
    attribute(Y, cultural_knowledge, CK), CK > 70.
rule_effect(commoners_distrust_magic, modify_network(X, Y, affinity, '-', 3)).

%% Devout characters seek to cleanse evil
rule_likelihood(devout_cleanse_evil, 1).
rule_type(devout_cleanse_evil, volition).
rule_active(devout_cleanse_evil).
rule_category(devout_cleanse_evil, faith).
rule_source(devout_cleanse_evil, medieval_fantasy).
rule_priority(devout_cleanse_evil, 4).
rule_applies(devout_cleanse_evil, X, Y) :-
    trait(X, devout),
    status(Y, cursed).
rule_effect(devout_cleanse_evil, set_intent(X, purify, Y, 4)).

%% Rogues exploit chaos for personal gain
rule_likelihood(rogues_exploit_chaos, 1).
rule_type(rogues_exploit_chaos, volition).
rule_active(rogues_exploit_chaos).
rule_category(rogues_exploit_chaos, opportunism).
rule_source(rogues_exploit_chaos, medieval_fantasy).
rule_priority(rogues_exploit_chaos, 3).
rule_applies(rogues_exploit_chaos, X, Y) :-
    trait(X, cunning),
    attribute(X, cunningness, C), C > 60,
    status(Y, distracted).
rule_effect(rogues_exploit_chaos, set_intent(X, steal_from, Y, 3)).

%% Master craftsmen earn respect from warriors
rule_likelihood(craftsmen_earn_warrior_respect, 1).
rule_type(craftsmen_earn_warrior_respect, volition).
rule_active(craftsmen_earn_warrior_respect).
rule_category(craftsmen_earn_warrior_respect, profession).
rule_source(craftsmen_earn_warrior_respect, medieval_fantasy).
rule_priority(craftsmen_earn_warrior_respect, 2).
rule_applies(craftsmen_earn_warrior_respect, X, Y) :-
    trait(X, honorable),
    trait(Y, master_craftsman).
rule_effect(craftsmen_earn_warrior_respect, modify_network(X, Y, affinity, '+', 2)).

%% Fey creatures are wary of iron wielders
rule_likelihood(fey_wary_of_iron, 1).
rule_type(fey_wary_of_iron, volition).
rule_active(fey_wary_of_iron).
rule_category(fey_wary_of_iron, supernatural).
rule_source(fey_wary_of_iron, medieval_fantasy).
rule_priority(fey_wary_of_iron, 4).
rule_applies(fey_wary_of_iron, X, Y) :-
    trait(X, ethereal),
    trait(Y, hardworking).
rule_effect(fey_wary_of_iron, modify_network(X, Y, affinity, '-', 5)).

%% Young heirs compete for favor
rule_likelihood(heirs_compete_for_favor, 1).
rule_type(heirs_compete_for_favor, volition).
rule_active(heirs_compete_for_favor).
rule_category(heirs_compete_for_favor, politics).
rule_source(heirs_compete_for_favor, medieval_fantasy).
rule_priority(heirs_compete_for_favor, 3).
rule_applies(heirs_compete_for_favor, X, Y) :-
    trait(X, young),
    trait(X, noble),
    trait(Y, young),
    trait(Y, noble),
    X \= Y.
rule_effect(heirs_compete_for_favor, set_intent(X, rival, Y, 3)).

%% Wise elders counsel the uncertain
rule_likelihood(elders_counsel_uncertain, 1).
rule_type(elders_counsel_uncertain, volition).
rule_active(elders_counsel_uncertain).
rule_category(elders_counsel_uncertain, mentorship).
rule_source(elders_counsel_uncertain, medieval_fantasy).
rule_priority(elders_counsel_uncertain, 2).
rule_applies(elders_counsel_uncertain, X, Y) :-
    trait(X, wise),
    trait(Y, young),
    attribute(Y, self_assuredness, SA), SA < 50.
rule_effect(elders_counsel_uncertain, set_intent(X, advise, Y, 2)).

%% Loyalty binds vassals to their lords
rule_likelihood(vassal_loyalty, 1).
rule_type(vassal_loyalty, volition).
rule_active(vassal_loyalty).
rule_category(vassal_loyalty, feudalism).
rule_source(vassal_loyalty, medieval_fantasy).
rule_priority(vassal_loyalty, 5).
rule_applies(vassal_loyalty, X, Y) :-
    trait(X, loyal),
    relationship(X, Y, vassal).
rule_effect(vassal_loyalty, modify_network(X, Y, affinity, '+', 5)).

%% Secretive characters hoard knowledge
rule_likelihood(secretive_hoard_knowledge, 1).
rule_type(secretive_hoard_knowledge, volition).
rule_active(secretive_hoard_knowledge).
rule_category(secretive_hoard_knowledge, personality).
rule_source(secretive_hoard_knowledge, medieval_fantasy).
rule_priority(secretive_hoard_knowledge, 2).
rule_applies(secretive_hoard_knowledge, X, Y) :-
    trait(X, secretive),
    attribute(X, cultural_knowledge, CK), CK > 80,
    trait(Y, curious).
rule_effect(secretive_hoard_knowledge, set_intent(X, withhold_from, Y, 2)).

%% Brave characters face dragons rather than flee
rule_likelihood(brave_face_dragons, 1).
rule_type(brave_face_dragons, volition).
rule_active(brave_face_dragons).
rule_category(brave_face_dragons, heroism).
rule_source(brave_face_dragons, medieval_fantasy).
rule_priority(brave_face_dragons, 5).
rule_applies(brave_face_dragons, X, _Y) :-
    trait(X, brave),
    attribute(X, self_assuredness, SA), SA > 60.
rule_effect(brave_face_dragons, set_intent(X, confront, dragon, 5)).
