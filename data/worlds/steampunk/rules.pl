%% Insimul Rules: Steampunk
%% Source: data/worlds/steampunk/rules.pl
%% Created: 2026-04-03
%% Total: 12 rules
%%
%% Predicate schema (ensemble volition style):
%%   rule_likelihood/2, rule_type/2, rule_active/1
%%   rule_category/2, rule_source/2, rule_priority/2
%%   rule_applies/3, rule_effect/2

%% Engineers befriend fellow inventors when they share a workspace
rule_likelihood(engineers_befriend_fellow_inventors, 3).
rule_type(engineers_befriend_fellow_inventors, volition).
rule_active(engineers_befriend_fellow_inventors).
rule_category(engineers_befriend_fellow_inventors, friendship_affinity).
rule_source(engineers_befriend_fellow_inventors, steampunk).
rule_priority(engineers_befriend_fellow_inventors, 5).
rule_applies(engineers_befriend_fellow_inventors, X, Y) :-
    trait(X, inventive), trait(Y, inventive),
    location(X, Loc), location(Y, Loc).
rule_effect(engineers_befriend_fellow_inventors, set_intent(X, befriend, Y, 5)).

%% Aristocrats antagonize those who challenge their authority
rule_likelihood(aristocrats_antagonize_challengers, 2).
rule_type(aristocrats_antagonize_challengers, volition).
rule_active(aristocrats_antagonize_challengers).
rule_category(aristocrats_antagonize_challengers, antagonism_hostility).
rule_source(aristocrats_antagonize_challengers, steampunk).
rule_priority(aristocrats_antagonize_challengers, 4).
rule_applies(aristocrats_antagonize_challengers, X, Y) :-
    trait(X, aristocratic), trait(Y, rebellious).
rule_effect(aristocrats_antagonize_challengers, set_intent(X, antagonize, Y, 4)).

%% Workers with shared hardship develop mutual trust
rule_likelihood(workers_shared_hardship_trust, 3).
rule_type(workers_shared_hardship_trust, volition).
rule_active(workers_shared_hardship_trust).
rule_category(workers_shared_hardship_trust, trust_building).
rule_source(workers_shared_hardship_trust, steampunk).
rule_priority(workers_shared_hardship_trust, 3).
rule_applies(workers_shared_hardship_trust, X, Y) :-
    trait(X, hardworking), trait(Y, hardworking),
    location(X, Loc), location(Y, Loc).
rule_effect(workers_shared_hardship_trust, set_intent(X, trust, Y, 3)).

%% Ambitious people seek mentors among the educated
rule_likelihood(ambitious_seek_mentors, 2).
rule_type(ambitious_seek_mentors, volition).
rule_active(ambitious_seek_mentors).
rule_category(ambitious_seek_mentors, mentorship).
rule_source(ambitious_seek_mentors, steampunk).
rule_priority(ambitious_seek_mentors, 4).
rule_applies(ambitious_seek_mentors, X, Y) :-
    trait(X, ambitious), trait(Y, intellectual),
    attribute(Y, cultural_knowledge, CK), CK > 70.
rule_effect(ambitious_seek_mentors, set_intent(X, befriend, Y, 4)).

%% Secretive individuals distrust those who are too social
rule_likelihood(secretive_distrust_social, 2).
rule_type(secretive_distrust_social, volition).
rule_active(secretive_distrust_social).
rule_category(secretive_distrust_social, distrust).
rule_source(secretive_distrust_social, steampunk).
rule_priority(secretive_distrust_social, 3).
rule_applies(secretive_distrust_social, X, Y) :-
    trait(X, secretive), trait(Y, charming),
    attribute(Y, charisma, Ch), Ch > 70.
rule_effect(secretive_distrust_social, set_intent(X, distrust, Y, 3)).

%% Eccentric geniuses attract curious young people
rule_likelihood(eccentric_attract_curious, 2).
rule_type(eccentric_attract_curious, volition).
rule_active(eccentric_attract_curious).
rule_category(eccentric_attract_curious, mentorship).
rule_source(eccentric_attract_curious, steampunk).
rule_priority(eccentric_attract_curious, 3).
rule_applies(eccentric_attract_curious, X, Y) :-
    trait(X, curious), trait(Y, eccentric),
    attribute(Y, cultural_knowledge, CK), CK > 60.
rule_effect(eccentric_attract_curious, set_intent(X, befriend, Y, 3)).

%% Calculating individuals exploit those with low cunning
rule_likelihood(calculating_exploit_naive, 1).
rule_type(calculating_exploit_naive, volition).
rule_active(calculating_exploit_naive).
rule_category(calculating_exploit_naive, exploitation).
rule_source(calculating_exploit_naive, steampunk).
rule_priority(calculating_exploit_naive, 5).
rule_applies(calculating_exploit_naive, X, Y) :-
    trait(X, calculating),
    attribute(X, cunningness, CX), CX > 70,
    attribute(Y, cunningness, CY), CY < 50.
rule_effect(calculating_exploit_naive, set_intent(X, manipulate, Y, 5)).

%% Driven people respect others who are equally determined
rule_likelihood(driven_respect_determined, 2).
rule_type(driven_respect_determined, volition).
rule_active(driven_respect_determined).
rule_category(driven_respect_determined, respect).
rule_source(driven_respect_determined, steampunk).
rule_priority(driven_respect_determined, 3).
rule_applies(driven_respect_determined, X, Y) :-
    trait(X, driven), trait(Y, ambitious).
rule_effect(driven_respect_determined, set_intent(X, respect, Y, 3)).

%% Rebellious youth antagonize authority figures
rule_likelihood(rebellious_antagonize_authority, 2).
rule_type(rebellious_antagonize_authority, volition).
rule_active(rebellious_antagonize_authority).
rule_category(rebellious_antagonize_authority, antagonism_hostility).
rule_source(rebellious_antagonize_authority, steampunk).
rule_priority(rebellious_antagonize_authority, 4).
rule_applies(rebellious_antagonize_authority, X, Y) :-
    trait(X, rebellious), trait(Y, middle_aged),
    attribute(Y, propriety, P), P > 75.
rule_effect(rebellious_antagonize_authority, set_intent(X, antagonize, Y, 4)).

%% Compassionate people befriend the isolated
rule_likelihood(compassionate_befriend_isolated, 3).
rule_type(compassionate_befriend_isolated, volition).
rule_active(compassionate_befriend_isolated).
rule_category(compassionate_befriend_isolated, friendship_affinity).
rule_source(compassionate_befriend_isolated, steampunk).
rule_priority(compassionate_befriend_isolated, 3).
rule_applies(compassionate_befriend_isolated, X, Y) :-
    trait(X, compassionate),
    attribute(Y, charisma, Ch), Ch < 50.
rule_effect(compassionate_befriend_isolated, set_intent(X, befriend, Y, 3)).

%% Guild loyalty creates distrust toward outsiders
rule_likelihood(guild_loyalty_distrust_outsiders, 1).
rule_type(guild_loyalty_distrust_outsiders, volition).
rule_active(guild_loyalty_distrust_outsiders).
rule_category(guild_loyalty_distrust_outsiders, distrust).
rule_source(guild_loyalty_distrust_outsiders, steampunk).
rule_priority(guild_loyalty_distrust_outsiders, 2).
rule_applies(guild_loyalty_distrust_outsiders, X, Y) :-
    location(X, Loc1), location(Y, Loc2), Loc1 \= Loc2,
    trait(X, stoic).
rule_effect(guild_loyalty_distrust_outsiders, set_intent(X, distrust, Y, 2)).

%% Poised socialites charm the powerful
rule_likelihood(socialites_charm_powerful, 2).
rule_type(socialites_charm_powerful, volition).
rule_active(socialites_charm_powerful).
rule_category(socialites_charm_powerful, social_climbing).
rule_source(socialites_charm_powerful, steampunk).
rule_priority(socialites_charm_powerful, 4).
rule_applies(socialites_charm_powerful, X, Y) :-
    trait(X, poised),
    attribute(X, charisma, CX), CX > 70,
    attribute(Y, cunningness, CY), CY > 60.
rule_effect(socialites_charm_powerful, set_intent(X, befriend, Y, 4)).
