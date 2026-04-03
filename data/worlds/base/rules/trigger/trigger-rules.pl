%% Ensemble Trigger Rules
%% Source: data/ensemble/triggerRules/triggerRules.json
%% Converted: 2026-04-02T20:14:15.454Z
%% Total rules: 6

rule_likelihood(rival_is_always_confident, 1).
rule_type(rival_is_always_confident, trigger).
% Rival is always confident
rule_active(rival_is_always_confident).
rule_category(rival_is_always_confident, trigger).
rule_source(rival_is_always_confident, ensemble).
rule_priority(rival_is_always_confident, 5).
rule_applies(rival_is_always_confident, Someone, Y) :-
    trait(Someone, rival).
rule_effect(rival_is_always_confident, assert(mood(Someone, confident))).

rule_likelihood(love_is_repulsed_by_self_indulged_people, 1).
rule_type(love_is_repulsed_by_self_indulged_people, trigger).
% Love is repulsed by self indulged people
rule_active(love_is_repulsed_by_self_indulged_people).
rule_category(love_is_repulsed_by_self_indulged_people, trigger).
rule_source(love_is_repulsed_by_self_indulged_people, ensemble).
rule_priority(love_is_repulsed_by_self_indulged_people, 5).
rule_applies(love_is_repulsed_by_self_indulged_people, X, Y) :-
    event_undirected(X, self_involved),
    trait(Y, love),
    \+ event_undirected(Z, self_involved).
rule_effect(love_is_repulsed_by_self_indulged_people, modify_network(Y, Z, closeness, '+', 10)).

rule_likelihood(people_are_repulsed_when_they_are_the_recipients_of_romantic_failures, 1).
rule_type(people_are_repulsed_when_they_are_the_recipients_of_romantic_failures, trigger).
% People are repulsed when they are the recipients of romantic failures
rule_active(people_are_repulsed_when_they_are_the_recipients_of_romantic_failures).
rule_category(people_are_repulsed_when_they_are_the_recipients_of_romantic_failures, trigger).
rule_source(people_are_repulsed_when_they_are_the_recipients_of_romantic_failures, ensemble).
rule_priority(people_are_repulsed_when_they_are_the_recipients_of_romantic_failures, 5).
rule_applies(people_are_repulsed_when_they_are_the_recipients_of_romantic_failures, WouldBeLover, Victim) :-
    event(WouldBeLover, romantic_failure, Victim),
    \+ event(SomeoneElse, romantic_failure, Victim).
rule_effect(people_are_repulsed_when_they_are_the_recipients_of_romantic_failures, modify_network(Victim, SomeoneElse, closeness, '+', 10)).

rule_likelihood(a_rich_person_falls_in_love_with_beautiful_charming_charismatic_women, 1).
rule_type(a_rich_person_falls_in_love_with_beautiful_charming_charismatic_women, trigger).
% A rich person falls in love with beautiful, charming, charismatic women
rule_active(a_rich_person_falls_in_love_with_beautiful_charming_charismatic_women).
rule_category(a_rich_person_falls_in_love_with_beautiful_charming_charismatic_women, trigger).
rule_source(a_rich_person_falls_in_love_with_beautiful_charming_charismatic_women, ensemble).
rule_priority(a_rich_person_falls_in_love_with_beautiful_charming_charismatic_women, 5).
rule_applies(a_rich_person_falls_in_love_with_beautiful_charming_charismatic_women, Someone, Other) :-
    attribute(Someone, charisma, Charisma_val), Charisma_val > 75,
    trait(Someone, charming),
    trait(Someone, beautiful),
    trait(Other, male),
    trait(Someone, female),
    trait(Other, rich),
    attribute(Other, sensitiveness, Sensitiveness_val), Sensitiveness_val > 50.
rule_effect(a_rich_person_falls_in_love_with_beautiful_charming_charismatic_women, assert(status(Other, gobsmacked))).
rule_effect(a_rich_person_falls_in_love_with_beautiful_charming_charismatic_women, set_network(Other, Someone, affinity, 100)).

rule_likelihood(romantics_are_repulsed_by_self_indulgent_people, 1).
rule_type(romantics_are_repulsed_by_self_indulgent_people, trigger).
% Romantics are repulsed by self-indulgent people
rule_active(romantics_are_repulsed_by_self_indulgent_people).
rule_category(romantics_are_repulsed_by_self_indulgent_people, trigger).
rule_source(romantics_are_repulsed_by_self_indulgent_people, ensemble).
rule_priority(romantics_are_repulsed_by_self_indulgent_people, 5).
rule_applies(romantics_are_repulsed_by_self_indulgent_people, Someone, Other) :-
    trait(Someone, romantic),
    \+ status(Someone, self_involved),
    status(Other, self_involved).
rule_effect(romantics_are_repulsed_by_self_indulgent_people, modify_network(Someone, Other, affinity, '-', 10)).

rule_likelihood(people_are_repulsed_when_they_are_the_recipients_of_romantic_failures, 1).
rule_type(people_are_repulsed_when_they_are_the_recipients_of_romantic_failures, trigger).
% People are repulsed when they are the recipients of romantic failures
rule_active(people_are_repulsed_when_they_are_the_recipients_of_romantic_failures).
rule_category(people_are_repulsed_when_they_are_the_recipients_of_romantic_failures, trigger).
rule_source(people_are_repulsed_when_they_are_the_recipients_of_romantic_failures, ensemble).
rule_priority(people_are_repulsed_when_they_are_the_recipients_of_romantic_failures, 5).
rule_applies(people_are_repulsed_when_they_are_the_recipients_of_romantic_failures, Someone, Other) :-
    event(Someone, romantic_failure, Other).
rule_effect(people_are_repulsed_when_they_are_the_recipients_of_romantic_failures, modify_network(Other, Someone, affinity, '-', 10)).

